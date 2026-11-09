/* v58: shared navigation, annual treasury activation, short legislative workflow and fleets. */
const FLEET_TYPES={
    bus:{name:'Autobusë',icon:'🚌',variants:[{name:'Autobus urban standard',costB:.00018,revenueB:.000009,operatingB:.000004},{name:'Autobus modern',costB:.0003,revenueB:.000014,operatingB:.000005},{name:'Autobus elektrik',costB:.0005,revenueB:.00002,operatingB:.000004}]},
    taxi:{name:'Taksi publike',icon:'🚕',variants:[{name:'Taksi standard',costB:.000025,revenueB:.000002,operatingB:.000001},{name:'Taksi hibride',costB:.00004,revenueB:.000003,operatingB:.000001},{name:'Taksi elektrike',costB:.000055,revenueB:.000004,operatingB:.0000008}]},
    passenger:{name:'Trena udhëtarësh',icon:'🚆',variants:[{name:'Tren rajonal',costB:.008,revenueB:.00035,operatingB:.00012},{name:'Tren modern udhëtarësh',costB:.015,revenueB:.00065,operatingB:.00018}]},
    freight:{name:'Trena mallrash',icon:'🚂',variants:[{name:'Tren mallrash',costB:.01,revenueB:.0005,operatingB:.00015},{name:'Tren i rëndë modern',costB:.018,revenueB:.001,operatingB:.00022}]},
    plane:{name:'Kosova Airlines',icon:'✈️',variants:[{name:'Avion rajonal',costB:.035,revenueB:.0015,operatingB:.0006},{name:'Avion linjash ndërkombëtare',costB:.075,revenueB:.0035,operatingB:.0012}]}
};
// Preserve old invoices and weekly reports when balancing future purchases/operation.
const FLEET_LEGACY_RATES=JSON.parse(JSON.stringify(FLEET_TYPES));
const FLEET_BALANCED_RATES={bus:[[.0002,.000007,.000005],[.0003,.0000095,.000004],[.0005,.000011,.0000035]],taxi:[[.000025,.0000005,.00000035],[.00004,.0000007,.0000003],[.000055,.0000009,.00000025]],passenger:[[.003,.00004,.000025],[.006,.000065,.00004]],freight:[[.004,.00005,.00003],[.008,.000085,.00005]]};
for(const [id,rates] of Object.entries(FLEET_BALANCED_RATES))rates.forEach(([costB,revenueB,operatingB],i)=>Object.assign(FLEET_TYPES[id].variants[i],{costB,revenueB,operatingB}));
const fleetFreshBase=initialiseProduction, fleetPrepareBase=prepareLoadedState, fleetValidateBase=validateLoadedState;
const workspaceMainBase=switchMainTab,workspaceSubBase=switchSubTab,workspaceRenderBase=renderVisibleWorkspace;
const shortSubmissionBase=recordBillSubmission,shortCatalogWeekBase=processGovernmentCatalogWeek;
const annualTransitionBase=fiscalYearTransition,annualResultBase=fiscalAnnualBudgetResult;
const budgetRenderBase=renderPublicFinance,productionRenderBase58=renderProductionResources;
const genericTemplateBase58=genericLawTemplate;
// Older voted budgets created a GENERAL chain before migration assigned sec_econ.
genericLawTemplate=function(l){return l.annualBudgetYear&&l.executiveChain?.kind==='GENERIC'&&l.executiveChain.template==='GENERAL'?'GENERAL':genericTemplateBase58(l);};
let workspaceHistory=[],workspaceReplaying=false;

function migrateTransportWorkspace(st){
    if(!st.transportFleets)st.transportFleets={version:1,lastTurn:st.turnCount,counter:0,purchases:[],upgrades:[],history:[],airport:{level:1,project:null}};
    if(st.publicFinance&&!st.publicFinance.annualFunding)st.publicFinance.annualFunding={version:1,records:[]};
    for(const b of Object.values(st.publicFinance?.budgets||{})){const l=(st.laws||[]).find(l=>l.id===b.lawId&&l.annualBudgetYear===b.year);if(l?.status==='PASSED'&&l.voteHistory?.some(v=>v.passed)&&b.status!=='APPROVED'){Object.assign(b,l.annualBudgetPlan||{});b.status='APPROVED';}}
    for(const l of st.laws||[])if(['SUBMITTED','UNDER_REVIEW'].includes(l.status)&&!l.shortReview){l.shortReview={startTurn:l.reviewTurn??l.submittedWeek??st.turnCount,weeks:2};}
    for(const l of st.laws||[])if(l.status==='SCHEDULED'&&!l.shortReview)l.shortReview={startTurn:Math.max(0,st.turnCount-1),weeks:1};
}
initialiseProduction=function(st){fleetFreshBase(st);migrateTransportWorkspace(st);};
prepareLoadedState=function(raw){const loaded=fleetPrepareBase(raw);migrateTransportWorkspace(loaded);annualTreasuryActivation(loaded);validateLoadedState(loaded);return loaded;};
function annualTreasuryActivation(st=state){
    const f=st.publicFinance,b=f?.budgets[st.year];if(!f||!b||b.status!=='APPROVED'||st.year===f.openingYear)return false;
    if(!f.annualFunding)f.annualFunding={version:1,records:[]};if(f.annualFunding.records.some(r=>r.year===st.year))return false;
    const carryB=st.budgetTotalB,creditB=b.plannedB;
    fiscalSetBalance(st,'budgetTotalB',fiscalRound(carryB+creditB),'Hapja e buxhetit vjetor: '+st.year,'TRANSFER');
    const paymentId=creditB?f.ledger.at(-1).id:null;
    f.annualFunding.records.push({year:st.year,turn:st.turnCount,lawId:b.lawId,carryB,creditB,paymentId});b.rolloverB=carryB;
    st.plannedExpenses=fiscalRound(b.plannedB+carryB);
    st.historyLog.unshift('Buxheti '+st.year+': '+enterpriseMoney(creditB)+' fond vjetor + '+enterpriseMoney(carryB)+' mjete të bartura.');return true;
}
fiscalYearTransition=function(){annualTransitionBase();annualTreasuryActivation();};
fiscalAnnualBudgetResult=function(law,result){annualResultBase(law,result);if(result.passed&&law.annualBudgetYear===state.year)annualTreasuryActivation();};

function shortReviewBegin(l){
    l.status='UNDER_REVIEW';l.govStage='APPROVED';l.reviewTurn=state.turnCount;l.shortReview={startTurn:state.turnCount,weeks:l.annualBudgetYear?2:1};l.stage='Në shqyrtim';
    l.stageHistory=l.stageHistory||[];l.stageHistory.push({stage:'UNDER_REVIEW',week:state.turnCount});
}
catalogSubmissionAllowed=function(law){return !!law;};
recordBillSubmission=function(law){
    if(!law||law.status!=='DRAFT'||legislativeCampaignClosed())return false;
    const before=JSON.stringify(state);
    try{prepareSpecialBillSubmission(law);law.submittedWeek=state.turnCount;law.stageHistory=law.stageHistory||[];law.stageHistory.push({stage:'SUBMITTED',week:state.turnCount});shortReviewBegin(law);if(!isSpecialRepealLaw(law))registerAssemblyObstruction(law);fiscalSyncBudgetStatuses();validateLoadedState(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');addMediaNews('Kuvendi',law.title+' hyri në shqyrtim.','NEUTRAL');return true;}
    catch(e){state=JSON.parse(before);showToast(e.message);return false;}
};
function processShortLawReview(){
    if(legislativeCampaignClosed())return;
    for(const l of state.laws){
        if(!['SUBMITTED','UNDER_REVIEW'].includes(l.status))continue;
        if(!l.shortReview){l.shortReview={startTurn:l.reviewTurn??l.submittedWeek??state.turnCount,weeks:2};}
        if(l.status==='SUBMITTED'){l.status='UNDER_REVIEW';l.govStage='APPROVED';l.reviewTurn=l.shortReview.startTurn;}
        if(state.turnCount<l.shortReview.startTurn+l.shortReview.weeks)continue;
        l.debated=true;l.debateText='Shqyrtimi automatik përfundoi.';
        for(const a of l.amendments||[])if(a.status==='PENDING')a.status='REJECTED';
        l.status='SCHEDULED';l.scheduledWeek=state.turnCount;l.stage='Gati për votim';l.govStage='APPROVED';l.stageHistory=l.stageHistory||[];l.stageHistory.push({stage:'SCHEDULED',week:state.turnCount});
    }fiscalSyncBudgetStatuses();
}
processGovernmentCatalogWeek=function(){shortCatalogWeekBase();processShortLawReview();};
function shortLawStatus(l){return ({DRAFT:'1 · Propozo Ligjin',SUBMITTED:'2 · Në Shqyrtim',UNDER_REVIEW:'2 · Në Shqyrtim',SCHEDULED:'3 · Voto në Seancë',PASSED:'I miratuar',FAILED:'I refuzuar',ANNULLED:'I anuluar',WITHDRAWN:'I tërhequr'})[l.status]||l.status;}
function shortLawActions(l,i){
    if(l.status==='DRAFT')return '<button class="action-btn" '+(!canActAsBillInitiator(l)?'disabled':'')+' onclick="submitBillToAssembly('+i+')">Propozo Ligjin</button>';
    if(['SUBMITTED','UNDER_REVIEW'].includes(l.status))return '<p role="status">Shqyrtim automatik: '+Math.max(0,(l.shortReview?.startTurn??l.reviewTurn??state.turnCount)+(l.shortReview?.weeks||2)-state.turnCount)+' javë të mbetura.</p>';
    if(l.status==='SCHEDULED')return '<button class="action-btn" onclick="voteLawInAssembly('+i+')">Voto në Seancë</button>';
    return '';
}
const detailedBillBase58=catalogBillDetails,billCardBase58=renderBillCard;
const catalogStageBase58=catalogStage;
catalogStage=function(l){return ['DRAFT','SUBMITTED','UNDER_REVIEW','SCHEDULED'].includes(l.status)?shortLawStatus(l):catalogStageBase58(l);};
renderBillCard=function(l,i){if(!['DRAFT','SUBMITTED','UNDER_REVIEW','SCHEDULED'].includes(l.status))return billCardBase58(l,i);return '<article class="bill-card card"><h3>'+catalogEscape(l.title)+'</h3><p><strong>'+shortLawStatus(l)+'</strong> · '+getMajorityLabel(l)+'</p><p>'+catalogEscape(l.desc||'')+'</p><div class="candidate-actions">'+shortLawActions(l,i)+'<button class="btn-top" onclick="catalogBillDetails('+i+')">Detajet</button></div></article>';};
catalogBillDetails=function(i){const l=state.laws[i];if(!l)return;document.getElementById('interactiveActionModalContent').innerHTML='<h2>'+catalogEscape(l.title)+'</h2><p><strong>'+shortLawStatus(l)+'</strong></p><p>'+catalogEscape(l.desc||'')+'</p><p>'+getMajorityLabel(l)+' · '+enterpriseMoney(l.annualBudgetPlan?.plannedB??l.costB??0)+'</p>'+shortLawActions(l,i)+(l.status==='PASSED'?catalogImplementationDetails(l):'');toggleModal('interactiveActionModal',true);};

function transportLicence(st){return st.laws.find(l=>l.transportLicence&&l.status==='PASSED'&&!courtLawFrozen(l,st)&&!courtMajorPending(l,st));}
function transportFlightReady(st){return st.transportFleets?.airport.level>=2&&!!transportLicence(st)&&st.diplomacy.EU.score>60&&st.diplomacy.USA.score>60&&!foreignFundingBlocked(st)&&!securityIPABlocked(st);}
function fleetUtilization(st,type){
    if(type==='plane')return transportFlightReady(st)?1:0;
    if(['passenger','freight'].includes(type))return fieldStrength(st,'sec_rail','rail')>0?Math.min(1.8,.6+fieldStrength(st,'sec_rail','rail')*.15):0;
    const roads=fieldStrength(st,'sec_roads','maintenance'),urban=fieldStrength(st,'sec_env','urbanisation'),routes=routeRows(st).filter(r=>r.status==='COMPLETED'&&(typeof commissionOpen!=='function'||commissionOpen(st,'ROUTE|'+r.id))).length;
    return Math.min(2,1+roads*.08+urban*.08+routes*.05);
}
function fleetVariant(st,p){return FLEET_TYPES[p.type].variants[p.level];}
function transportQuote(type,level,count){const def=FLEET_TYPES[type];if(!def||!Number.isInteger(level)||!def.variants[level]||![1,5,10,20].includes(count))throw Error('Zgjidh llojin, modelin dhe sasinë.');return {type,level,count,purchaseUnitB:def.variants[level].costB,costB:fiscalRound(def.variants[level].costB*count)};}
function fleetReserveQuote(costB,weeklyB){const reserveB=fiscalRound(weeklyB*10),requiredB=fiscalRound(costB+reserveB);return {reserveB,requiredB,allowed:state.budgetTotalB+1e-9>=requiredB};}
function assertFleetReserve(costB,weeklyB){const q=fleetReserveQuote(costB,weeklyB);if(!q.allowed)throw Error('Blerja kërkon '+fleetMoney(costB)+' dhe '+fleetMoney(q.reserveB)+' rezervë për 10 javë operimi të të gjithë flotës.');}
function fleetMoney(b){return new Intl.NumberFormat('sq-AL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(b*1e9);}
function transportAnnualOperating(st){return fiscalRound((st.transportFleets?.purchases||[]).reduce((sum,p)=>sum+fleetVariant(st,p).operatingB*p.count*FISCAL_WEEKS,0));}
function transportCommit(change){return governmentCrisisCommit(()=>{if(governmentCrisisPending())throw Error('Përfundoni vendimin urgjent.');migrateTransportWorkspace(state);change(state.transportFleets);});}
function buyFleet(type,level,count){return transportCommit(db=>{if(municipalCapitalBlocked(state)||municipalAusterity(state))throw Error('Investimet kapitale janë ngrirë.');const q=transportQuote(type,Number(level),Number(count));assertFleetReserve(q.costB,transportAnnualOperating(state)/FISCAL_WEEKS+FLEET_TYPES[type].variants[q.level].operatingB*q.count);const paymentId=enterprisePay(q.costB,'Blerje flote: '+type,'CAPITAL_PAYMENT');db.purchases.push({...q,id:'fleet:'+db.counter++,originalLevel:q.level,turn:state.turnCount,paymentId});});}
function upgradeFleet(id){return transportCommit(db=>{if(municipalCapitalBlocked(state)||municipalAusterity(state))throw Error('Investimet kapitale janë ngrirë.');const p=db.purchases.find(p=>p.id===id),def=FLEET_TYPES[p?.type];if(!p||!def.variants[p.level+1])throw Error('Flota është në modelin maksimal.');const from=p.level,to=from+1,costB=fiscalRound((def.variants[to].costB-def.variants[from].costB)*p.count);assertFleetReserve(costB,transportAnnualOperating(state)/FISCAL_WEEKS+(def.variants[to].operatingB-def.variants[from].operatingB)*p.count);const paymentId=enterprisePay(costB,'Modernizim flote: '+id,'CAPITAL_PAYMENT');db.upgrades.push({unitDeltaB:def.variants[to].costB-def.variants[from].costB,fleetId:id,from,to,turn:state.turnCount,costB,paymentId});p.level=to;});}
function upgradeAirport(){return transportCommit(db=>{if(municipalCapitalBlocked(state)||municipalAusterity(state))throw Error('Investimet kapitale janë ngrirë.');if(db.airport.project||db.airport.level>=3)throw Error('Aeroporti është në nivel maksimal ose po ndërtohet.');const target=db.airport.level+1,costB=fiscalRound(.08*target),paymentId=enterprisePay(costB,'Zgjerimi i aeroportit','CAPITAL_PAYMENT');db.airport.project={target,costB,paymentId,startTurn:state.turnCount,elapsed:0,weeks:8};});}
function proposeAviationLicence(){return transportCommit(()=>{
    if(state.laws.some(l=>l.transportLicence&&!['FAILED','WITHDRAWN','ANNULLED'].includes(l.status)))throw Error('Nisma e aviacionit ekziston.');
    const l={id:'aviation-licence:'+(++state.billCounter),title:'Leja Ndërkombëtare e Aviacionit',desc:'Licencimi i flotës nacionale Kosova Airlines dhe bashkëpunimi ndërkombëtar në aviacionin civil.',sector:'sec_roads',ministry:'Ministria e Infrastrukturës',proposer:state.parties[state.playerParty].leader,costB:0,duration:1,approvalEffect:2,status:'DRAFT',majorityType:'SIMPLE_61',requiredVotes:61,supportParties:state.coalitionParties.slice(),voteHistory:[],stageHistory:[{stage:'DRAFT',week:state.turnCount}],applied:false,legalEffectMode:'PROCEDURAL',transportLicence:true};initializeCatalogBill(l);state.laws.push(l);
});}
function processTransportFiscal(turn){
    const db=state.transportFleets,result={paidB:0,unpaidB:0,revenueB:0};if(!Number.isInteger(turn)||turn!==state.turnCount)throw Error('Operimi i flotës lejohet vetëm për javën aktuale.');if(!db||turn<=db.lastTurn||db.history.some(h=>h.turn===turn))return result;db.lastTurn=turn;
    const ap=db.airport.project;if(ap&&turn>ap.startTurn&&!municipalCapitalBlocked(state)&&!municipalAusterity(state)&&++ap.elapsed>=ap.weeks){db.airport.level=ap.target;db.airport.completed=db.airport.completed||[];db.airport.completed.push({...ap,completedTurn:turn});db.airport.project=null;}
    const rows=[];
    for(const p of db.purchases){if(turn<=p.turn)continue;const v=fleetVariant(state,p),utilization=fleetUtilization(state,p.type),requiredB=fiscalRound(v.operatingB*p.count),payment=productionPay(requiredB,'Operimi i flotës: '+p.id),ratio=requiredB?payment.paidB/requiredB:1,revenueB=fiscalRound(v.revenueB*p.count*utilization*ratio);
        let revenueId=null;if(revenueB){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+revenueB),'Transporti: '+p.id,'REVENUE');revenueId=state.publicFinance.ledger.at(-1).id;}
        rows.push({rateVersion:2,fleetId:p.id,level:p.level,count:p.count,utilization,requiredB,paidB:payment.paidB,paymentId:payment.receiptId,revenueB,revenueId});result.paidB+=payment.paidB;result.unpaidB+=requiredB-payment.paidB;result.revenueB+=revenueB;
    }
    for(const k of Object.keys(result))result[k]=fiscalRound(result[k]);db.history.push({turn,...result,rows});db.history=db.history.slice(-48);return result;
}
function fleetPreview(type){const level=Number(document.getElementById('fleet-model-'+type).value),count=Number(document.getElementById('fleet-count-'+type).value),q=transportQuote(type,level,count),v=FLEET_TYPES[type].variants[level],maintenanceB=fiscalRound(v.operatingB*count),revenueB=fiscalRound(v.revenueB*count*fleetUtilization(state,type)),netB=fiscalRound(revenueB-maintenanceB),reserve=fleetReserveQuote(q.costB,transportAnnualOperating(state)/FISCAL_WEEKS+maintenanceB),host=document.getElementById('fleet-quote-'+type);host.innerHTML='<strong>Kostoja e Blerjes:</strong> '+fleetMoney(q.costB)+'<br><strong>Mirëmbajtja Javore:</strong> '+fleetMoney(maintenanceB)+'<br><strong>Të Hyrat Javore:</strong> '+fleetMoney(revenueB)+'<br><strong>Fitimi i Pritshëm Javor (neto):</strong> '+fleetMoney(netB)+'<br><strong>Rezerva operative · 10 javë, e gjithë flota:</strong> '+fleetMoney(reserve.reserveB)+(netB<0?'<br><span class="crisis-warning">Kjo zgjedhje aktualisht sjell humbje.</span>':'')+(!reserve.allowed?'<br><span class="crisis-warning">Buxheti nuk mbulon blerjen dhe rezervën operative.</span>':'');const button=host.parentElement?.querySelector('[data-fleet-buy]');if(button)button.disabled=!agendaExecutive()||!reserve.allowed;}
function renderTransportFleets(){
    const el=document.getElementById('transportFleetsPanel');if(!el||!state.transportFleets)return;const db=state.transportFleets,allowed=agendaExecutive(),last=db.history.at(-1);
    el.innerHTML='<h2>Transporti dhe Flotat</h2><div class="population-grid"><div>Të hyra · java e fundit<strong>'+enterpriseMoney(last?.revenueB||0)+'</strong></div><div>Operimi · java e fundit<strong>'+enterpriseMoney(last?.paidB||0)+'</strong></div><div>Bilanci neto<strong>'+enterpriseMoney((last?.revenueB||0)-(last?.paidB||0))+'</strong></div></div><div class="fleet-grid">'+Object.entries(FLEET_TYPES).map(([id,d])=>'<article class="card fleet-card"><div class="fleet-illustration" aria-hidden="true">'+d.icon+'</div><h3>'+d.name+'</h3><p>'+(id==='plane'?(transportFlightReady(state)?'Fluturimet janë aktive.':'Kërkon aeroport ≥2, ligjin e aviacionit, BE/SHBA >60 dhe mungesë sanksionesh.'):['passenger','freight'].includes(id)?(fleetUtilization(state,id)>0?'Shinat e financuara janë funksionale.':'Pa reforma hekurudhore të financuara, trenat qëndrojnë pa të hyra.'):'Të hyrat varen nga rrugët, autostradat dhe urbanizimi.')+'</p><label>Modeli<select id="fleet-model-'+id+'" onchange="fleetPreview(\''+id+'\')">'+d.variants.map((v,i)=>'<option value="'+i+'">'+v.name+'</option>').join('')+'</select></label><label>Sasia (numri i mjeteve)<select id="fleet-count-'+id+'" onchange="fleetPreview(\''+id+'\')">'+[1,5,10,20].map(n=>'<option>'+n+'</option>').join('')+'</select></label><p id="fleet-quote-'+id+'"></p><button class="action-btn" '+(!allowed?'disabled':'')+' data-fleet-buy onclick="buyFleet(\''+id+'\',document.getElementById(\'fleet-model-'+id+'\').value,document.getElementById(\'fleet-count-'+id+'\').value)">Bli flotën</button>'+db.purchases.filter(p=>p.type===id).map(p=>'<div class="production-asset"><strong>'+p.count+' × '+d.variants[p.level].name+'</strong>'+(d.variants[p.level+1]?'<button class="btn-top" '+(!allowed?'disabled':'')+' onclick="upgradeFleet(\''+p.id+'\')">Modernizo · '+enterpriseMoney((d.variants[p.level+1].costB-d.variants[p.level].costB)*p.count)+'</button>':'<p>Modeli maksimal</p>')+'</div>').join('')+'</article>').join('')+'</div><article class="card"><h3>🛫 Aeroporti · Niveli '+db.airport.level+'/3</h3>'+(db.airport.project?'<progress max="8" value="'+db.airport.project.elapsed+'"></progress><p>'+db.airport.project.elapsed+'/8 javë</p>':db.airport.level<3?'<button class="action-btn" '+(!allowed?'disabled':'')+' onclick="upgradeAirport()">Zgjero aeroportin · '+enterpriseMoney(.08*(db.airport.level+1))+' · 8 javë</button>':'')+'<button class="action-btn" '+(!allowed?'disabled':'')+' onclick="proposeAviationLicence()">Propozo Ligjin e Aviacionit</button><button class="btn-top" onclick="switchMainTab(\'tab-sectors\');openSectorManagement(\'sec_rail\')">Investo në Rrjetin Hekurudhor</button></article>';
    Object.keys(FLEET_TYPES).forEach(fleetPreview);
    const fiscal=(state.fiscalHistory||[]).find(h=>h.week===last?.turn&&h.year===state.year);if(fiscal&&typeof el.insertAdjacentHTML==='function')el.insertAdjacentHTML('afterbegin','<p class="card">Bilanci i Transportit paraqitet veçmas nga buxheti i gjithë shtetit. Java '+last.turn+': shteti '+fleetMoney(fiscal.revenues-fiscal.expenses)+' neto; Transporti '+fleetMoney(last.revenueB-last.paidB)+' neto. Shpenzimet e ministrive dhe sektorëve të tjerë vazhdojnë veçmas.</p>');
}

function workspaceSnapshot(){const tab=document.querySelector('.tab-view.active');if(!tab)return null;const sub=Array.from(tab.querySelectorAll('.sub-content')).find(el=>el.style.display!=='none');return {tab:tab.id,sub:sub?.id||null};}
function workspaceRemember(){if(workspaceReplaying)return;const next=workspaceSnapshot();if(next&&JSON.stringify(next)!==JSON.stringify(workspaceHistory.at(-1))){workspaceHistory.push(next);if(workspaceHistory.length>40)workspaceHistory.shift();}}
function workspaceSyncNav(tab){document.querySelectorAll('.bottom-nav .nav-item').forEach(b=>b.classList.toggle('active',b.getAttribute('onclick')?.includes("'"+tab+"'")));}
switchMainTab=function(tab,button){
    const aliases={'tab-production':'renderProductionResources','tab-sectors':'renderStateSectorsGrid','tab-transport':'renderTransportFleets'};
    if(aliases[tab]&&!agendaExecutive()){showToast('Këto asete menaxhohen nga qeveria në detyrë.');return false;}
    workspaceRemember();const result=workspaceMainBase(tab,button);const active=document.querySelector('.tab-view.active');if(active)workspaceSyncNav(active.id);workspaceEnhanceBack();return result;
};
switchSubTab=function(prefix,key,button){const moved={production:'tab-production',sectors:'tab-sectors',highway:'tab-transport'};if(prefix==='gov'&&moved[key])return switchMainTab(moved[key]);workspaceRemember();const result=workspaceSubBase(prefix,key,button);workspaceEnhanceBack();return result;};
renderVisibleWorkspace=function(){const tab=document.querySelector('.tab-view.active')?.id,fn={'tab-production':renderProductionResources,'tab-sectors':renderStateSectorsGrid,'tab-transport':renderTransportFleets}[tab];if(fn){fn();if(tab==='tab-transport'){renderHighwayRoutes();renderHighwayProject();}return;}workspaceRenderBase();};
openProductionResources=function(sector,source){switchMainTab('tab-production');if(source&&sector==='energy'){const el=document.getElementById('productionEnergySource');if(el)el.value=source;renderProductionPlantPreview();}document.getElementById(sector?'production-sector-'+sector:'productionResourcesPanel')?.scrollIntoView({block:'start'});};
function workspaceBack(button){
    const modal=button?.closest('dialog,.modal-overlay,[role="dialog"]');
    if(modal){if(modal.id==='sectorManagementModal'){closeSectorManagement();return;}if(state.pendingVote&&modal.id==='votingModal'){skipVotingAnimation();finishVotingProcess();return;}if(modal.open&&typeof modal.close==='function')modal.close();else modal.classList.remove('show');return;}
    const current=workspaceSnapshot();let previous;while(workspaceHistory.length){previous=workspaceHistory.pop();if(JSON.stringify(previous)!==JSON.stringify(current))break;previous=null;}
    workspaceReplaying=true;try{switchMainTab(previous?.tab||'tab-dashboard');if(previous?.sub){const parts=previous.sub.split('-'),pill=document.querySelector('#'+previous.tab+' [onclick*="\''+parts.slice(1).join('-')+'\'"]');if(pill)switchSubTab(parts[0],parts.slice(1).join('-'),pill);}}finally{workspaceReplaying=false;}
}
function workspaceEnhanceBack(){
    if(typeof document.createElement!=='function')return;
    document.querySelectorAll('.tab-view,.sub-content,.modal-overlay.show,dialog[open],[role="dialog"].show').forEach(root=>{
        if(root.classList.contains('sub-content')&&root.closest('.tab-view'))return;
        const host=root.matches('.modal-overlay')?(root.querySelector('.modal-box,.modal-content')||root):root;
        if(Array.from(host.children).some(el=>el.classList.contains('workspace-back')))return;
        const b=document.createElement('button');b.type='button';b.className='btn-top workspace-back';b.textContent='← Mbrapa';b.setAttribute('onclick','workspaceBack(this)');host.prepend(b);
    });
}
function installWorkspaceNavigation(){
    const nav=document.querySelector('.bottom-nav'),gov=document.getElementById('tab-government');if(!nav||!gov||document.getElementById('tab-production'))return;
    const before=Array.from(nav.querySelectorAll('.nav-item')).find(b=>b.getAttribute('onclick')?.includes('tab-elections'));
    for(const [key,label,icon,panel] of [['production','Prodhimi','🏭','gov-production'],['sectors','Reformat','⭐','gov-sectors'],['transport','Transporti','🚌',null]]){
        const full={production:'Prodhimi dhe Resurset',sectors:'Reformat Sektoriale',transport:'Transporti dhe Flotat'}[key];
        const button=document.createElement('button');button.className='nav-item';button.id=key==='production'?'productionTab':'workspaceNav-'+key;button.title=full;button.setAttribute('onclick',"switchMainTab('tab-"+key+"',this)");button.innerHTML='<span class="nav-icon">'+icon+'</span><span class="nav-label-wide">'+full+'</span><span class="nav-label-compact">'+label+'</span>';nav.insertBefore(button,before);
        const view=document.createElement('section');view.className='tab-view';view.id='tab-'+key;gov.after(view);
        if(panel){const source=document.getElementById(panel);if(source){source.style.display='';source.classList.remove('sub-content');view.appendChild(source);}}
        if(key==='transport'){
            view.innerHTML='<section id="transportFleetsPanel" class="card"></section>';
            const routes=document.getElementById('highwayRoutesPanel');if(routes)view.appendChild(routes);
            const political=document.getElementById('gov-highway');if(political){political.style.display='';political.classList.remove('sub-content');view.appendChild(political);}
        }
    }
    gov.querySelector('#productionQuickAccess')?.parentElement.remove();
    gov.querySelectorAll('.sub-pill').forEach(b=>{if(/gov['"]\s*,\s*['"](?:production|sectors|highway)['"]/.test(b.getAttribute('onclick')||''))b.remove();});
    workspaceEnhanceBack();
    if(typeof MutationObserver==='function'){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;workspaceEnhanceBack();});}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','open']});}
}
window.addEventListener('DOMContentLoaded',installWorkspaceNavigation);

renderPublicFinance=function(){budgetRenderBase();const host=document.getElementById('fiscalPanelContainer'),b=state.publicFinance?.budgets[state.year];if(host&&b?.status==='APPROVED'){const r=state.publicFinance.annualFunding?.records.find(r=>r.year===state.year);if(r)host.insertAdjacentHTML('afterbegin','<p class="card">Buxheti aktiv: '+enterpriseMoney(r.creditB)+' + '+enterpriseMoney(r.carryB)+' të bartura. Fondi vjetor u aktivizua vetëm një herë; arkëtimet javore regjistrohen veçmas.</p>');}};
renderProductionResources=function(){productionRenderBase58();const row=state.productionResources?.history.at(-1),host=document.getElementById('productionResourcesPanel');if(host&&row&&typeof host.insertAdjacentHTML==='function')host.insertAdjacentHTML('afterbegin','<p class="card">Java e fundit: eksporte '+enterpriseMoney(row.revenueB)+' − pagesa '+enterpriseMoney(row.paidB)+' = <strong>'+enterpriseMoney(row.revenueB-row.paidB)+' neto në arkë</strong>.</p>');};

function validateTransportWorkspace(st){
    const db=st.transportFleets;if(!db)return;const bad=()=>{throw Error('Regjistri i flotave ose i buxhetit vjetor është i pavlefshëm.');},int=(n,min=0,max=st.turnCount)=>Number.isInteger(n)&&n>=min&&n<=max,near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
    function receipt(id,turn,cost,source,type='CAPITAL_PAYMENT'){if(!cost){if(id!==null)bad();return;}const r=st.publicFinance.ledger.find(r=>r.id===id);if(!r||r.turn!==turn||r.type!==type||r.source!==source||!near(r.amountB,type==='REVENUE'||type==='TRANSFER'?cost:-cost))bad();}
    if(db.version!==1||!int(db.lastTurn)||!Array.isArray(db.purchases)||db.counter!==db.purchases.length||!Array.isArray(db.upgrades)||!Array.isArray(db.history)||db.history.length>48||!db.airport||!int(db.airport.level,1,3))bad();
    const levels={};db.purchases.forEach((p,i)=>{if(p.purchaseUnitB!==undefined&&p.purchaseUnitB!==FLEET_TYPES[p.type]?.variants[p.originalLevel]?.costB)bad();if(p.id!=='fleet:'+i||!FLEET_TYPES[p.type]||!int(p.originalLevel,0,FLEET_TYPES[p.type].variants.length-1)||![1,5,10,20].includes(p.count)||!int(p.turn)||!near(p.costB,(p.purchaseUnitB??FLEET_LEGACY_RATES[p.type].variants[p.originalLevel].costB)*p.count))bad();receipt(p.paymentId,p.turn,p.costB,'Blerje flote: '+p.type);levels[p.id]=p.originalLevel;});
    db.upgrades.forEach(u=>{const p=db.purchases.find(p=>p.id===u.fleetId),d=FLEET_TYPES[p?.type];if(u.unitDeltaB!==undefined&&(!d?.variants[u.to]||!d?.variants[u.from]||!near(u.unitDeltaB,d.variants[u.to].costB-d.variants[u.from].costB)))bad();if(!p||u.from!==levels[p.id]||u.to!==u.from+1||!d.variants[u.to]||!int(u.turn,p.turn)||!near(u.costB,(u.unitDeltaB??(FLEET_LEGACY_RATES[p.type].variants[u.to].costB-FLEET_LEGACY_RATES[p.type].variants[u.from].costB))*p.count))bad();receipt(u.paymentId,u.turn,u.costB,'Modernizim flote: '+p.id);levels[p.id]=u.to;});for(const p of db.purchases)if(p.level!==levels[p.id])bad();
    const projects=[...(db.airport.completed||[]),...(db.airport.project?[db.airport.project]:[])];let airport=1;for(const a of projects){if(a.target!==airport+1||a.weeks!==8||!int(a.startTurn)||!int(a.elapsed,0,8)||a.elapsed>st.turnCount-a.startTurn||!near(a.costB,.08*a.target))bad();receipt(a.paymentId,a.startTurn,a.costB,'Zgjerimi i aeroportit');if(a.completedTurn!==undefined){if(a.elapsed!==8||!int(a.completedTurn,a.startTurn+8))bad();airport=a.target;}else if(a.elapsed>=8)bad();}if(db.airport.level!==airport)bad();
    const turns=new Set();for(const h of db.history){if(!int(h.turn)||turns.has(h.turn)||!Array.isArray(h.rows))bad();turns.add(h.turn);let paid=0,unpaid=0,revenue=0;const seen=new Set();for(const row of h.rows){const p=db.purchases.find(p=>p.id===row.fleetId),v=(row.rateVersion===2?FLEET_TYPES:FLEET_LEGACY_RATES)[p?.type]?.variants[row.level];if(!p||!v||seen.has(p.id)||h.turn<=p.turn||row.count!==p.count||!Number.isFinite(row.utilization)||row.utilization<0||row.utilization>2||row.rateVersion!==undefined&&row.rateVersion!==2||!near(row.requiredB,v.operatingB*p.count)||!Number.isFinite(row.paidB)||row.paidB<0||row.paidB>row.requiredB+1e-8||!near(row.revenueB,fiscalRound(v.revenueB*p.count*row.utilization*(row.requiredB?row.paidB/row.requiredB:1))))bad();seen.add(p.id);receipt(row.paymentId,h.turn,row.paidB,'Operimi i flotës: '+p.id,'EXPENSE');receipt(row.revenueId,h.turn,row.revenueB,'Transporti: '+p.id,'REVENUE');paid+=row.paidB;unpaid+=row.requiredB-row.paidB;revenue+=row.revenueB;}if(!near(h.paidB,fiscalRound(paid))||!near(h.unpaidB,fiscalRound(unpaid))||!near(h.revenueB,fiscalRound(revenue)))bad();}
    const funding=st.publicFinance.annualFunding;if(funding){if(funding.version!==1||!Array.isArray(funding.records))bad();const years=new Set();for(const r of funding.records){const b=st.publicFinance.budgets[r.year];if(!int(r.turn)||!int(r.year,2000,st.year)||years.has(r.year)||!b||b.status!=='APPROVED'||b.lawId!==r.lawId||!near(r.creditB,b.plannedB)||!Number.isFinite(r.carryB)||r.carryB<0||b.rolloverB!==r.carryB)bad();years.add(r.year);const entry=st.publicFinance.ledger.find(l=>l.id===r.paymentId);if(r.creditB&&(!entry||entry.year!==r.year||!near(entry.balanceAfterB,r.carryB+r.creditB)))bad();receipt(r.paymentId,r.turn,r.creditB,'Hapja e buxhetit vjetor: '+r.year,'TRANSFER');}}
    for(const l of st.laws)if(l.shortReview&&(!int(l.shortReview.startTurn)||![1,2].includes(l.shortReview.weeks)))bad();
}
validateLoadedState=function(st){fleetValidateBase(st);validateTransportWorkspace(st);};
