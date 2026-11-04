/* Extensions of the canonical sector model. Money is in B euros; jobs are people. */
Object.entries(SECTOR_EXPANSION_ROWS).forEach(([id,rows])=>rows.forEach(r=>{
    if(SECTOR_MANAGEMENT_DEFS[id].some(c=>c.id===r[0]))throw Error('Duplicate sector category: '+r[0]);
    const c=sectorCategory(...r.slice(0,6));Object.assign(c,{expanded:true,capacityBoost:5,maxBuild:1,effects:r[6],buildingEffects:r[7],description:r[8]});SECTOR_MANAGEMENT_DEFS[id].push(c);
}));
function migrateSectorExpansion(st){
    const db=st.sectorManagement;if(!db)return;
    if(db.expansion===undefined&&Object.entries(db.sectors).some(([id,row])=>(SECTOR_MANAGEMENT_DEFS[id]||[]).some(c=>c.expanded&&row.levels[c.id]!==undefined&&row.levels[c.id]!==3)))throw Error('Mungon historiku i politikave të reja sektoriale.');
    Object.entries(db.sectors).forEach(([id,row])=>(SECTOR_MANAGEMENT_DEFS[id]||[]).filter(c=>c.expanded).forEach(c=>{
        for(const k of ['levels','effectiveLevels'])if(row[k][c.id]===undefined)row[k][c.id]=3;
        if(row.grantRates[c.id]===undefined)row.grantRates[c.id]=0;
        row.policies.forEach(p=>{if(p.levels[c.id]===undefined)p.levels[c.id]=3;if(p.grantRates[c.id]===undefined)p.grantRates[c.id]=0;});
    }));
    if(db.expansion===undefined)db.expansion={version:1,lastTurn:st.turnCount,lastFiscalTurn:st.turnCount,effects:[],highWater:{},fiscal:[],events:[],draws:[],arbitrations:[]};
    if(db.expansion.macro===undefined)db.expansion.macro={employment:0,growth:0};
}
function sectorExpansionCompleted(st,id,key){return !!sectorManagementRow(st,id)?.buildings.some(p=>p.categoryId===key&&p.status==='COMPLETED');}
function sectorExpansionLevel(st,id,key){
    const row=sectorManagementRow(st,id);if(!row||row.status!=='FUNDED'||sectorExpansionOutage(st,id,st.turnCount)||typeof unionOnStrike==='function'&&unionOnStrike(st,id))return 3;
    const c=SECTOR_MANAGEMENT_DEFS[id]?.find(c=>c.id===key);if(c&&sectorExpansionGate(st,id,c,sectorManagementLevel(row,key,true),false))return 3;
    return Math.min(sectorManagementLevel(row,key,true),typeof imfSectorCap==='function'?imfSectorCap(st,id):10);
}
function sectorExpansionStrength(st,id,key){return Math.max(0,sectorExpansionLevel(st,id,key)-3);}
function sectorExpansionEntries(st){return Object.entries(st.sectorManagement?.sectors||{}).flatMap(([id,row])=>SECTOR_MANAGEMENT_DEFS[id].filter(c=>c.expanded).map(c=>({id,row,c,n:sectorExpansionStrength(st,id,c.id),built:row.buildings.find(p=>p.categoryId===c.id&&p.status==='COMPLETED')})));}
function sectorExpansionEngaged(st){return sectorExpansionEntries(st).some(x=>x.row.levels[x.c.id]!==3||x.row.buildings.some(p=>p.categoryId===x.c.id));}
function sectorExpansionSum(st,key){return sectorExpansionEntries(st).reduce((sum,x)=>sum+(x.c.effects[key]||0)*x.n+(x.built?(x.c.buildingEffects[key]||0):0),0);}
function sectorExpansionCoal(st){return sectorExpansionCompleted(st,'sec_energy','winter_bills');}
function sectorExpansionTaxFactor(st){return (1-Math.max(0,(st.informalEconomy??30)-sectorExpansionSum(st,'informal'))/100)*(1+sectorExpansionSum(st,'collection'));}
function sectorExpansionJobs(st){return sectorExpansionSum(st,'jobs')/Math.max(1,populationWorkforce(st))*100;}
function sectorExpansionGrowth(st){return sectorExpansionSum(st,'growth');}
function sectorExpansionSecurityShield(st){return sectorExpansionStrength(st,'sec_fsk','nato')*.015+sectorExpansionStrength(st,'sec_fsk','heavy_arms')*.01+sectorExpansionStrength(st,'sec_police','hazard')*.01+(sectorExpansionCompleted(st,'sec_fsk','conscription')?.1:0);}
function sectorExpansionMigrationFactor(st){return sectorExpansionLevel(st,'sec_tech','ict_grants')>=6?0:Math.max(.3,1-sectorExpansionStrength(st,'sec_tech','ict_grants')*.08);}
function sectorExpansionWinterChance(st){return clamp(.6-(sectorExpansionCompleted(st,'sec_energy','north_bills')?.3:0)-sectorExpansionStrength(st,'sec_energy','plant_maintenance')*.03,.05,.6);}
function sectorExpansionWinterImport(st){return sectorExpansionCompleted(st,'sec_energy','plant_maintenance')?.014:.02;}
function sectorExpansionGate(st,id,c,next,building){
    const gate=building?c.buildingEffects?.gate:c.effects?.gate;
    if(!building&&next<=3)return '';
    if(gate==='VETTING'&&!['ACTIVE','COMPLETED'].includes(st.justiceReform?.status))return 'Nisni fillimisht Vetingun te Reforma në Drejtësi.';
    if(gate==='BUREAU'){const l=bureauLaw(st);if(!l||l.status!=='PASSED'||!sectorExpansionLawClear(st,l))return 'Byroja kërkon ligjin e miratuar dhe vendimin e Kushtetueses.';}
    if(gate==='SALARY'&&!st.laws.some(l=>l.generalStrikeId&&l.status==='PASSED'&&sectorExpansionLawClear(st,l)))return 'Miratoni Ligjin e Pagave dhe përfundoni shqyrtimin kushtetues.';
    if(gate==='HIGHWAY'&&!['LOCAL','CLEAN'].includes(highwayContract(st)?.choice))return 'Zgjidhni fillimisht kontratën te Mega-Projekti i Autostradës.';
    if(!building&&id==='sec_health'&&c.id==='insurance'&&next>5&&!sectorExpansionCompleted(st,id,c.id))return 'Mbi 5 yje sigurimi kërkon SISH të përfunduar.';
    return '';
}
function sectorExpansionLawClear(st,l){return !(st.constitutionalCourt?.cases||[]).some(c=>c.lawId===l.id&&['PENDING','SUSPENDED'].includes(c.status))&&l.status==='PASSED';}
function sectorExpansionEffect(key,id,category,kind,fx,multiplier){
    const d=state.sectorManagement.expansion;if(d.effects.some(e=>e.key===key))return;
    const e={key,sector:id,category,kind,turn:state.turnCount,multiplier,riskDelta:fiscalRound((fx.risk||0)*multiplier)};d.effects.push(e);
    if(fx.approval)crisisApproval(fx.approval*multiplier);
    if(fx.party)mediaPollDelta(fx.party*multiplier);
    if(fx.pressure){const pressure=fx.pressure*multiplier;state.internationalPressure=clamp(state.internationalPressure+(pressure>0?councilPressureIncrease(state,pressure):pressure),0,100);}
    const groups={};for(const k of ['youth','pensioners','business','public'])if(fx[k])groups[k]=fx[k]*multiplier;
    if(Object.keys(groups).length)applyInterestDecision('sector:'+key,groups,state);
    if(fx.partyFunds)state.parties[state.playerParty].partyFunds=Math.max(0,state.parties[state.playerParty].partyFunds+Math.round(fx.partyFunds*multiplier));
    if(fx.tension){migrateWinterEnergy(state);state.winterEnergy.tension=clamp(state.winterEnergy.tension+fx.tension*multiplier,0,100);if(!state.streetProtests)initializeStreetProtests(state);if(fx.tension*multiplier>=7)createStreetProtest('Reagim ndaj reformës: '+SECTOR_MANAGEMENT_DEFS[id].find(c=>c.id===category).label,id,null);}
    if(fx.quality){const s=state.stateSectors.find(s=>s.id===id);s.score=clamp(s.score+fx.quality*multiplier,0,100);}
    if(kind==='POLICY'&&category==='minimum_wage')state.unemployment=clamp(state.unemployment+.12*multiplier,0,100);
    if(fx.coal)state.internationalPressure=100;
    if(fx.achievement)e.achievement=fx.achievement;
    if(fx.oligarchs){initializeStreetProtests(state);createStreetProtest('Terminali shtetëror i heq monopolet private doganore.',id,null);}
    if(e.riskDelta)recordLeakRisk('SECTOR',key,null,e.riskDelta);
    if(fx.jobs&&kind==='BUILDING')state.unemployment=clamp(state.unemployment-fx.jobs*multiplier/populationWorkforce(state)*100,0,100);
    state.historyLog.unshift('Java '+state.turnCount+' · '+SECTOR_MANAGEMENT_DEFS[id].find(c=>c.id===category).label+' · '+kind+' · efekt i realizuar.');
}
function processSectorExpansionEffects(){
    if(!state.sectorManagement)return;migrateSectorExpansion(state);const d=state.sectorManagement.expansion;
    if(!agendaExecutive())return;
    sectorExpansionEntries(state).forEach(x=>{
        const key=x.id+':'+x.c.id,high=d.highWater[key]||3,level=3+x.n;
        if(level>high){d.highWater[key]=level;sectorExpansionEffect('policy:'+key+':'+level,x.id,x.c.id,'POLICY',x.c.effects,level-high);
            if(x.c.effects.arbitration&&!d.arbitrations.some(a=>a.key===key)){const roll=Math.random();d.arbitrations.push({key,turn:state.turnCount,roll,due:state.turnCount+8,costB:roll<.35?.03:0,assessed:false});}}
        const active=x.row.buildings.find(p=>p.categoryId===x.c.id);
        if(active&&x.c.buildingEffects.startRisk)sectorExpansionEffect('start:'+active.id,x.id,x.c.id,'START',{risk:x.c.buildingEffects.startRisk},1);
        if(x.built){
            sectorExpansionEffect('building:'+x.built.id,x.id,x.c.id,'BUILDING',x.c.buildingEffects,1);
            const fx=x.c.buildingEffects,grantKey='grant:'+x.built.id;
            if(fx.grant&&!foreignGrantsBlocked(state)&&!securityIPABlocked(state)&&!d.effects.some(e=>e.key===grantKey)){
                sectorExpansionEffect(grantKey,x.id,x.c.id,'GRANT',{},1);
                fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+fx.grant),'Fondi BE sektorial: '+x.built.id,'REVENUE');
                const g=d.effects.find(e=>e.key===grantKey);g.ledgerId=state.publicFinance.ledger.at(-1).id;g.amountB=fx.grant;
            }
            const cleanKey='clean:'+x.built.id;
            if(fx.startRisk&&!d.effects.some(e=>e.key===cleanKey)){
                const index=state.mediaDossiers?.actions.findIndex(a=>a.id==='SECTOR:start:'+x.built.id)??-1;
                const closed=Math.max(0,...(state.mediaDossiers?.cases||[]).filter(c=>c.closedActions!==null&&!(c.bomb&&c.choice==='ATTACK')).map(c=>c.closedActions));
                sectorExpansionEffect(cleanKey,x.id,x.c.id,'CLEAN',{risk:index>=closed?-fx.startRisk:0},1);
            }
        }
    });
    d.effects.filter(e=>e.kind==='POLICY'&&!e.grantReceipt).forEach(e=>{const c=SECTOR_MANAGEMENT_DEFS[e.sector].find(c=>c.id===e.category);if(c.effects.grant&&!foreignGrantsBlocked(state)&&!securityIPABlocked(state)){const amount=fiscalRound(c.effects.grant*e.multiplier);fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+amount),'Grant i politikës sektoriale: '+e.key,'REVENUE');e.grantReceipt=state.publicFinance.ledger.at(-1).id;e.grantTurn=state.turnCount;}});
    const employment=sectorExpansionEntries(state).reduce((n,x)=>n+(x.c.effects.jobs||0)*x.n,0)/populationWorkforce(state)*100,growth=sectorExpansionGrowth(state);
    if(!economicPilotActive(state)){state.unemployment=clamp(state.unemployment-(employment-d.macro.employment),0,100);state.gdpGrowth=fiscalRound(clamp(state.gdpGrowth+growth-d.macro.growth,-100,100));}
    d.macro={employment,growth};
}
function sectorExpansionWeeklyCost(st){let cost=sectorExpansionSum(st,'maintenance');if(winterSeason(st))cost+=sectorExpansionStrength(st,'sec_energy','winter_bills')*.0005;return fiscalRound(cost);}
function sectorExpansionWeeklyRevenue(st){return fiscalRound(sectorExpansionSum(st,'revenue'));}
function sectorExpansionSavings(st,base){return fiscalRound(Math.min(Math.max(0,base),sectorExpansionSum(st,'savings')));}
function sectorExpansionAnnualNet(st){return fiscalRound((sectorExpansionWeeklyCost(st)-sectorExpansionSavings(st,Math.max(0,calculatePlannedMinistriesBudget()/FISCAL_WEEKS-rtkAnnualSavings(st)/FISCAL_WEEKS)))*FISCAL_WEEKS);}
function openSectorExpansionPrerequisite(gate){closeSectorManagement();switchMainTab('tab-government');const target={HIGHWAY:'highway',VETTING:'justice',BUREAU:'implementation',SALARY:'unions'}[gate];const buttons=Array.from(document.querySelectorAll('#tab-government .sub-pill'));const button=buttons.find(b=>(b.getAttribute('onclick')||'').includes("'"+target+"'"));if(button)button.click();}
function sectorExpansionFiscal(turn,operatingBase){
    const result={paidB:0,unpaidB:0,revenueB:0};if(!state.sectorManagement)return result;
    migrateSectorExpansion(state);const d=state.sectorManagement.expansion;if(turn<=d.lastFiscalTurn)return result;d.lastFiscalTurn=turn;
    let revenueId=null;const income=sectorExpansionWeeklyRevenue(state);if(income){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+income),'Sektorët: të hyra nga shërbimet dhe asetet','REVENUE');result.revenueB=income;revenueId=state.publicFinance.ledger.at(-1).id;}
    let cost=sectorExpansionWeeklyCost(state);d.arbitrations.filter(a=>!a.assessed&&turn>=a.due).forEach(a=>{cost+=a.costB;a.assessed=true;});
    const b=state.publicFinance.budgets[state.year],room=b?.status==='APPROVED'?Math.max(0,b.plannedB-state.realizedExpenses):Infinity;
    const authorized=state.publicFinance.openingYear===state.year||b?.status==='APPROVED';
    result.paidB=authorized?fiscalRound(Math.min(cost,Math.max(0,state.budgetTotalB),room)):0;result.unpaidB=fiscalRound(cost-result.paidB);
    let ledgerId=null;if(result.paidB){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-result.paidB),'Sektorët: mirëmbajtja dhe detyrimet','EXPENSE');ledgerId=state.publicFinance.ledger.at(-1).id;}
    d.fiscal.push({turn,costB:fiscalRound(cost),paidB:result.paidB,unpaidB:result.unpaidB,revenueB:income,revenueId,ledgerId});
    return result;
}
function sectorExpansionRiskAction(st,a){const e=st.sectorManagement?.expansion?.effects.find(e=>'SECTOR:'+e.key===a.id);if(!e||e.turn!==a.turn||e.riskDelta!==a.riskDelta)throw Error('Efekti sektorial i rrezikut është i pavlefshëm.');}
const SECTOR_EXPANSION_EVENTS={
 CYBER:{sector:'sec_tech',title:'Sulm kibernetik mbi shërbimet shtetërore',cost:.005,loss:8},
 FARM:{sector:'sec_agri',title:'Breshër dhe përmbytje: fermerët bllokojnë rrugët me traktorë',cost:.01,loss:15},
 SMOG:{sector:'sec_env',title:'Smogu i dimrit: ajri shkakton krizë shëndetësore',cost:.004,loss:10},
 DROUGHT:{sector:'sec_water',title:'Thatësirë: ndërprerje të furnizimit me ujë',cost:.006,loss:12},
 FOOD:{sector:'sec_agri',title:'Kriza globale e çmimit të grurit',cost:.008,loss:10},
 FILES:{sector:'sec_justice',title:'Dosjet gjyqësore janë zhdukur nga arkivi',cost:.003,loss:8},
 BUSES:{sector:'sec_rail',title:'Transportuesit privatë shpallin grevë',cost:.004,loss:8}
};
function sectorExpansionPending(st){return agendaExecutive(st)?st.sectorManagement?.expansion?.events.find(e=>e.choice===null)||null:null;}
function sectorExpansionOutage(st,id,turn){return !!st.sectorManagement?.expansion?.events.some(e=>SECTOR_EXPANSION_EVENTS[e.kind].sector===id&&e.choice==='ACCEPT'&&turn>=e.resolvedTurn&&turn<e.resolvedTurn+2);}
function processSectorExpansionWeek(turn){
    if(!state.sectorManagement)return;migrateSectorExpansion(state);const d=state.sectorManagement.expansion;if(turn<=d.lastTurn)return;d.lastTurn=turn;
    if(!agendaExecutive()||!sectorExpansionEngaged(state))return;
    const risk=sectorExpansionSum(state,'weeklyRisk');if(risk){const key='weekly:'+turn;d.effects.push({key,sector:null,category:null,kind:'WEEKLY',turn,multiplier:1,riskDelta:fiscalRound(risk)});recordLeakRisk('SECTOR',key,null,fiscalRound(risk));}
    if(governmentCrisisPending()||d.events.some(e=>turn-e.turn<8))return;
    const roll=Math.random();let kind=null;const summer=state.monthIndex>=5&&state.monthIndex<=7;
    if(roll<.02&&sectorExpansionLevel(state,'sec_tech','incident_team')<6)kind='CYBER';
    else if(roll>=.02&&roll<.04&&summer&&sectorExpansionLevel(state,'sec_agri','damage_fund')<6)kind='FARM';
    else if(roll>=.04&&roll<.06&&winterSeason(state)&&!sectorExpansionCompleted(state,'sec_env','coal_heating'))kind='SMOG';
    else if(roll>=.06&&roll<.08&&summer&&!sectorExpansionCompleted(state,'sec_water','water_losses'))kind='DROUGHT';
    else if(roll>=.08&&roll<.095&&!sectorExpansionCompleted(state,'sec_agri','farm_grants'))kind='FOOD';
    else if(roll>=.095&&roll<.11&&!sectorExpansionCompleted(state,'sec_justice','confiscation_support'))kind='FILES';
    else if(roll>=.11&&roll<.13&&sectorExpansionLevel(state,'sec_rail','intercity')>=4)kind='BUSES';
    d.draws.push({turn,roll,kind});if(kind)d.events.push({id:'sector-event:'+d.events.length,turn,kind,choice:null,resolvedTurn:null,ledgerId:null});
}
function resolveSectorExpansionEvent(choice){if(!['PAY','ACCEPT'].includes(choice))return false;return governmentCrisisCommit(()=>{const e=sectorExpansionPending(state);if(!e)throw Error('Nuk ka ngjarje sektoriale aktive.');const def=SECTOR_EXPANSION_EVENTS[e.kind];if(choice==='PAY')e.ledgerId=enterprisePay(def.cost,'Ngjarje sektoriale: '+e.id);else {crisisApproval(-def.loss);if(e.kind==='FILES'){const key='files:'+e.id;state.sectorManagement.expansion.effects.push({key,sector:null,category:null,kind:'WEEKLY',turn:state.turnCount,multiplier:1,riskDelta:15});recordLeakRisk('SECTOR',key,null,15);}}e.choice=choice;e.resolvedTurn=state.turnCount;});}
function renderSectorExpansion(){
    let dialog=document.getElementById('sectorExpansionDialog');const e=sectorExpansionPending(state);
    if(!dialog){if(!e||!document.createElement)return;dialog=document.createElement('dialog');dialog.id='sectorExpansionDialog';dialog.className='government-crisis-dialog';dialog.addEventListener('cancel',ev=>{if(sectorExpansionPending(state))ev.preventDefault();});document.body.appendChild(dialog);}
    if(!e){if(dialog.open)dialog.close();return;}
    if(weeklyProcessing||weeklyVisualBusy||state.pendingVote||!document.getElementById('startScreen')?.classList.contains('hidden')||document.querySelector('dialog[open]:not(#sectorExpansionDialog)'))return;
    const def=SECTOR_EXPANSION_EVENTS[e.kind];dialog.innerHTML='<h2>'+catalogEscape(def.title)+'</h2><p>Financoni reagimin urgjent ose pranoni humbjen e mbështetjes dhe ndërprerjen sektoriale për 2 javë.</p><button class="action-btn" onclick="resolveSectorExpansionEvent(\'PAY\')">Financo reagimin · '+sectorManagementMoney(def.cost)+'</button><button class="action-btn" onclick="resolveSectorExpansionEvent(\'ACCEPT\')">Prano pasojat · −'+def.loss+' mbështetje</button>';if(!dialog.open)dialog.showModal();
}
function sectorExpansionDescription(c,building){
    if(!c.expanded)return '';const f=building?c.buildingEffects:c.effects,parts=[];
    if(building)parts.push('Kapaciteti: deri në 10 yje; cilësia financohet veçmas.');
    if(f.jobs)parts.push('Punësim: '+f.jobs.toLocaleString('sq-AL')+(building?' vende':' vende për yll të financuar mbi 3'));
    if(f.revenue)parts.push('Të hyra: +'+sectorManagementMoney(f.revenue)+'/javë'+(building?'':' për yll mbi 3'));
    if(f.savings)parts.push('Kursim operativ deri '+sectorManagementMoney(f.savings)+'/javë'+(building?'':' për yll mbi 3'));
    if(f.maintenance)parts.push('Mirëmbajtje: '+sectorManagementMoney(f.maintenance)+'/javë');
    if(f.grant)parts.push('Fond BE: '+sectorManagementMoney(f.grant)+' pas përfundimit, sipas disponueshmërisë');
    if(f.achievement)parts.push('Arritja: '+f.achievement);
    if(f.coal)parts.push('Bllokon fondet e BE/FMN; presioni arrin 100%.');
    if(f.gate)parts.push('Kërkon procedurën ekzistuese: '+f.gate);
    return '<p class="sector-expansion-description">'+catalogEscape(c.description)+'</p>'+(parts.length?'<ul class="sector-expansion-effects">'+parts.map(p=>'<li>'+catalogEscape(p)+'</li>').join('')+'</ul>':'')+(f.gate?'<button type="button" class="btn-top" onclick="openSectorExpansionPrerequisite(\''+f.gate+'\')">Hap procedurën përkatëse</button>':'');
}
function sectorExpansionSummary(id){
    const entries=sectorExpansionEntries(state).filter(x=>x.id===id),sum=k=>entries.reduce((n,x)=>n+(x.c.effects[k]||0)*x.n+(x.built?(x.c.buildingEffects[k]||0):0),0);
    if(!sectorManagementRow(state,id))return '';
    const badges=entries.filter(x=>x.built?.status==='COMPLETED'&&x.c.buildingEffects.achievement).map(x=>'<strong>'+catalogEscape(x.c.buildingEffects.achievement)+'</strong>');
    return '<div class="sector-expansion-summary" role="status"><span>Të hyra: <strong>'+sectorManagementMoney(sum('revenue'))+'/javë</strong></span><span>Kursim operativ maksimal: <strong>'+sectorManagementMoney(sum('savings'))+'/javë</strong></span><span>Vende pune të mbështetura: <strong>'+Math.round(sum('jobs')).toLocaleString('sq-AL')+'</strong></span>'+(id==='sec_econ'?'<span>Ekonomia joformale efektive: <strong>'+Math.max(0,(state.informalEconomy??30)-sum('informal')).toFixed(1)+'%</strong></span>':'')+badges.join('')+'</div>';
}
function validateSectorExpansion(st){
    const d=st.sectorManagement?.expansion;if(!d)return;const bad=()=>{throw Error('Zgjerimi sektorial është i pavlefshëm.');},turn=t=>Number.isInteger(t)&&t>=0&&t<=st.turnCount;
    if(d.version!==1||!turn(d.lastTurn)||!turn(d.lastFiscalTurn)||!d.highWater||!d.macro||![d.macro.employment,d.macro.growth].every(n=>Number.isFinite(n)&&n>=0)||!['effects','fiscal','events','draws','arbitrations'].every(k=>Array.isArray(d[k])))bad();
    const keys=new Set();d.effects.forEach(e=>{if(keys.has(e.key)||typeof e.key!=='string'||!turn(e.turn)||!Number.isFinite(e.multiplier)||e.multiplier<=0||!Number.isFinite(e.riskDelta)||Math.abs(e.riskDelta)>100||!['START','POLICY','BUILDING','WEEKLY','GRANT','CLEAN'].includes(e.kind))bad();keys.add(e.key);if(e.kind!=='WEEKLY'){const c=SECTOR_MANAGEMENT_DEFS[e.sector]?.find(c=>c.id===e.category&&c.expanded);if(!c)bad();if(['BUILDING','GRANT','CLEAN'].includes(e.kind)&&!sectorExpansionCompleted(st,e.sector,e.category))bad();if(e.kind==='GRANT'){const p=st.publicFinance.ledger.find(p=>p.id===e.ledgerId);if(!p||p.type!=='REVENUE'||p.turn!==e.turn||Math.abs(p.amountB-c.buildingEffects.grant)>1e-8||e.amountB!==c.buildingEffects.grant)bad();}if(e.kind==='POLICY'&&!(st.sectorManagement.sectors[e.sector].policies.some(p=>p.turn<e.turn&&p.levels[e.category]>3)))bad();}});
    d.effects.forEach(e=>{
        if(e.kind==='WEEKLY')return;const c=SECTOR_MANAGEMENT_DEFS[e.sector].find(c=>c.id===e.category),row=sectorManagementRow(st,e.sector);
        if(e.kind==='POLICY'&&e.riskDelta!==fiscalRound((c.effects.risk||0)*e.multiplier))bad();
        if(e.kind==='BUILDING'&&(e.riskDelta!==fiscalRound(c.buildingEffects.risk||0)||!row.buildings.some(p=>e.key==='building:'+p.id&&p.categoryId===c.id&&p.status==='COMPLETED'&&p.completedTurn<=e.turn)))bad();
        if(e.kind==='START'&&(e.riskDelta!==c.buildingEffects.startRisk||!row.buildings.some(p=>e.key==='start:'+p.id&&p.categoryId===c.id&&p.startTurn===e.turn)))bad();
        if(e.kind==='CLEAN'&&![0,-c.buildingEffects.startRisk].includes(e.riskDelta))bad();
        if(e.grantReceipt){const p=st.publicFinance.ledger.find(p=>p.id===e.grantReceipt);if(!c.effects.grant||!p||p.type!=='REVENUE'||p.turn!==e.grantTurn||e.grantTurn<e.turn||p.source!=='Grant i politikës sektoriale: '+e.key||Math.abs(p.amountB-c.effects.grant*e.multiplier)>1e-8)bad();}
        if(e.achievement!==undefined&&e.achievement!==c.buildingEffects.achievement)bad();
    });
    Object.entries(d.highWater).forEach(([key,n])=>{const [id,cat]=key.split(':');if(!SECTOR_MANAGEMENT_DEFS[id]?.some(c=>c.id===cat&&c.expanded)||!Number.isInteger(n)||n<4||n>10)bad();});
    const fiscalTurns=new Set();d.fiscal.forEach(r=>{if(!turn(r.turn)||r.turn>d.lastFiscalTurn||fiscalTurns.has(r.turn)||![r.costB,r.paidB,r.unpaidB,r.revenueB].every(n=>Number.isFinite(n)&&n>=0)||Math.abs(r.costB-r.paidB-r.unpaidB)>1e-8)bad();fiscalTurns.add(r.turn);if(r.paidB){const p=st.publicFinance.ledger.find(p=>p.id===r.ledgerId);if(!p||p.turn!==r.turn||p.source!=='Sektorët: mirëmbajtja dhe detyrimet'||Math.abs(p.amountB+r.paidB)>1e-8)bad();}else if(r.ledgerId!==null)bad();});
    d.fiscal.filter(r=>r.revenueB).forEach(r=>{const p=st.publicFinance.ledger.find(p=>p.id===r.revenueId);if(!p||p.type!=='REVENUE'||p.turn!==r.turn||p.source!=='Sektorët: të hyra nga shërbimet dhe asetet'||Math.abs(p.amountB-r.revenueB)>1e-8)bad();});
    d.events.forEach((e,i)=>{if(e.id!=='sector-event:'+i||!turn(e.turn)||!SECTOR_EXPANSION_EVENTS[e.kind]||![null,'PAY','ACCEPT'].includes(e.choice)||e.choice===null&&(e.resolvedTurn!==null||e.ledgerId!==null)||e.choice!==null&&(!turn(e.resolvedTurn)||e.resolvedTurn<e.turn))bad();if(e.choice==='PAY'){const p=st.publicFinance.ledger.find(p=>p.id===e.ledgerId);if(!p||p.turn!==e.resolvedTurn||p.source!=='Ngjarje sektoriale: '+e.id||Math.abs(p.amountB+SECTOR_EXPANSION_EVENTS[e.kind].cost)>1e-8)bad();}});
    if(d.events.filter(e=>e.choice===null).length>1)bad();d.draws.forEach(r=>{if(!turn(r.turn)||!Number.isFinite(r.roll)||r.roll<0||r.roll>=1||r.kind!==null&&!SECTOR_EXPANSION_EVENTS[r.kind])bad();});
    d.arbitrations.forEach(a=>{if(!turn(a.turn)||a.due!==a.turn+8||!Number.isFinite(a.roll)||a.roll<0||a.roll>=1||a.costB!==(a.roll<.35?.03:0)||typeof a.assessed!=='boolean'||a.assessed&&st.turnCount<a.due)bad();});
}
