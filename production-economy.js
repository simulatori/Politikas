/* v57: physical supply chains. Units are simulation output, money is EUR billions. */
const ENERGY_PLANTS={
    FOSSIL:{name:'Termocentral me linjit',capacity:360,workers:1000,costB:.2,weeks:32},
    SOLAR:{name:'Park fotovoltaik solar',capacity:90,workers:150,costB:.045,weeks:14},
    WIND:{name:'Park me turbina të erës',capacity:150,workers:250,costB:.075,weeks:20}
};
Object.assign(PRODUCTION_SECTORS,{
    construction:{name:'Ndërtimtaria',asset:'Kompleks ndërtimor',capacity:100,demand:140,workers:1500,costB:.06,weeks:12,priceB:.00006,maintenanceB:.0003},
    tourism:{name:'Turizmi dhe Shërbimet',asset:'Kompleks turistik / shërbimesh',capacity:120,demand:130,workers:2500,costB:.035,weeks:10,priceB:.00008,maintenanceB:.0002},
    defense:{name:'Industria e Mbrojtjes',asset:'Fabrikë pajisjesh dhe armatimi',capacity:60,demand:0,workers:1800,costB:.3,weeks:32,priceB:0,maintenanceB:.0008}
});
const productionInitV55=initialiseProduction;
const productionFiscalV55=processProductionFiscal;
const fskReadinessV55=fieldFSKReadiness;
const fskBudgetV55=fieldFSKBudgetMarkup;
const securityChanceV55=securityIncidentChance;
const qualityGrantV55=sectorManagementEligibleGrant;
const qualityDescriptionV55=sectorExpansionDescription;
const routeQuoteV55=routeQuote;
const resourceCoalSanctionV55=resourceCoalSanction;

function migrateProductionEconomy(st){
    if(!st.productionResources)productionInitV55(st);
    const p=st.productionResources;
    if(p.version===2)return;
    if(p.version!==1)throw Error('Version i panjohur i prodhimit.');
    p.active=true;p.version=2;p.baseInflation=st.inflation||0;p.livingBase=700;p.lastCostTurn=st.turnCount;p.automations=[];p.automationCounter=0;
    st.costOfLiving=700;
    for(const [id,def] of Object.entries(PRODUCTION_SECTORS)){
        if(!p.sectors[id])p.sectors[id]={wage:1000,lowWeeks:0,status:'NORMAL',satisfaction:70};
        Object.assign(p.sectors[id],{subsidized:false,automation:false});
        // The defense industry starts locked at level zero, including fresh games.
        if(id==='defense'){
            const a=p.assets.find(a=>a.sector===id&&a.baselineLevel===1&&!a.investments.length);
            if(a){p.baselineWorkers-=def.workers;p.assets.splice(p.assets.indexOf(a),1);}
        }else if(!p.assets.some(a=>a.sector===id)&&['construction','tourism'].includes(id)){
            p.assets.push({id:'',sector:id,source:'FOSSIL',level:1,baselineLevel:1,status:'ACTIVE',targetLevel:null,elapsed:0,weeks:0,startedTurn:st.turnCount,completedTurn:st.turnCount,paymentId:null,costB:0,investments:[],legacyResourceId:null});p.baselineWorkers+=def.workers;
        }
    }
    p.assets.forEach((a,i)=>{
        // Existing asset IDs and contracts remain stable; new sectors append only.
        if(!a.id)a.id='asset:'+i;
        if(a.sector==='energy'&&!a.spec){a.legacyPlant=true;a.spec={name:ENERGY_PLANTS[a.source].name+' · aset i trashëguar',capacity:120,workers:600,costB:.06*(a.source==='FOSSIL'?1:1.4),weeks:a.source==='FOSSIL'?10:16};}
    });p.counter=p.assets.length;
}
initialiseProduction=function(st){migrateProductionEconomy(st);};
function productionWorkersPerLevel(st,sector,a){return Math.round((a?.spec?.workers||PRODUCTION_SECTORS[sector].workers)*(st.productionResources?.sectors[sector]?.automation?.7:1));}
function productionAssetCapacity(a){return a.level*(a.spec?.capacity||PRODUCTION_SECTORS[a.sector].capacity);}
function productionBlackout(st){const s=st.winterEnergy?.seasons.at(-1);return !!s&&((s.status==='PENDING')||(s.choice==='BLACKOUT'&&st.turnCount<(s.resolvedTurn||s.turn)+12));}
function productionLivingCost(st){const p=st.productionResources,base=p?.livingBase||700,weeks=Math.max(0,st.turnCount-(p?.lastCostTurn??st.turnCount));return Math.round(base*Math.pow(1+Math.max(-50,st.inflation||0)/100,weeks/FISCAL_WEEKS)*(productionBlackout(st)?1.25:1));}
function productionWorkerMood(st,id,paid=true){const r=st.productionResources.sectors[id],cost=productionLivingCost(st),effectiveWage=paid?r.wage*(r.subsidized?1.2:1):0;return {effectiveWage,cost,satisfaction:Math.round(clamp(effectiveWage/cost*70,0,100)),factor:effectiveWage<cost? .4:1};}
function productionEUAvailable(st){return st.diplomacy.EU.score>60&&!foreignGrantsBlocked(st)&&!securityIPABlocked(st);}
function productionEUSuspended(st){return st.diplomacy.EU.score<40||foreignGrantsBlocked(st)||securityIPABlocked(st);}
function productionGrantRate(st,sector,source){if(!productionEUAvailable(st)||!(sector==='agriculture'||sector==='energy'&&source!=='FOSSIL'))return 0;return Math.min(.8,.5+Math.floor((st.diplomacy.EU.score-60)/10)*.1);}
function productionEUBadge(st,eligible=true){if(!eligible)return '';const on=productionEUAvailable(st);return '<span class="production-eu '+(on?'':'is-frozen')+'" title="'+(on?'Bashkëfinancim BE aktiv':'Kërkon marrëdhënie BE mbi 60 dhe fonde pa sanksione')+'">🇪🇺 '+(on?'BE bashkëfinancon':'BE · pa financim')+'</span>';}
productionQuote=function(st,sector,assetId,source='FOSSIL'){
    const def=PRODUCTION_SECTORS[sector];if(!def)throw Error('Sektori nuk ekziston.');
    const old=assetId?st.productionResources?.assets.find(a=>a.id===assetId&&a.sector===sector):null;
    if(assetId&&!old||old&&(old.status==='BUILDING'||old.level>=5))throw Error('Aseti është në ndërtim ose në nivelin maksimal.');
    if(old)source=old.source;if(!ENERGY_PLANTS[source])throw Error('Lloj centrali i panjohur.');if(sector!=='energy')source='FOSSIL';
    const spec=sector==='energy'?(old?.spec||ENERGY_PLANTS[source]):def,targetLevel=(old?.level||0)+1;
    const grossB=fiscalRound(spec.costB*targetLevel),grantRate=productionGrantRate(st,sector,source),grantB=fiscalRound(grossB*grantRate),costB=fiscalRound(grossB-grantB);
    return {sector,assetId:assetId||null,source,spec:sector==='energy'?{...spec}:null,targetLevel,workers:productionWorkersPerLevel(st,sector,{spec}),capacity:spec.capacity,grossB,grantRate,grantB,costB,weeks:spec.weeks+targetLevel*2};
};
buildProductionAsset=function(sector,assetId=null,source='FOSSIL'){return productionCommit(p=>{
    if(municipalCapitalBlocked(state)||municipalAusterity(state))throw Error('Ndërtimet kapitale janë ngrirë.');
    const q=productionQuote(state,sector,assetId,source);if(q.workers>populationAvailableWorkers(state))throw Error('Nuk ka fuqi punëtore të lirë.');
    const paymentId=enterprisePay(q.costB,'Aset prodhues: '+sector+':'+(assetId||p.counter),'CAPITAL_PAYMENT');
    let a=assetId?p.assets.find(a=>a.id===assetId):null;
    if(!a){a={id:'asset:'+p.counter++,sector,source:q.source,spec:q.spec,level:0,baselineLevel:0,investments:[],legacyResourceId:null};p.assets.push(a);}
    Object.assign(a,{status:'BUILDING',targetLevel:q.targetLevel,elapsed:0,weeks:q.weeks,startedTurn:state.turnCount,completedTurn:null,paymentId,costB:q.costB});
    a.investments.push({turn:state.turnCount,targetLevel:q.targetLevel,weeks:q.weeks,costB:q.costB,grossB:q.grossB,grantB:q.grantB,grantRate:q.grantRate,paymentId});
    if(sector==='energy'&&q.source==='FOSSIL')executiveRelation('EU',-Math.min(25,Math.round(q.capacity/12)));
});};
productionReservedWorkers=function(st){return productionEngineActive(st)?st.productionResources.assets.filter(a=>a.status==='BUILDING').reduce((n,a)=>n+(a.targetLevel-a.level)*productionWorkersPerLevel(st,a.sector,a),0):0;};
productionAllocation=function(st){
    const p=st.productionResources,requested=Object.fromEntries(Object.keys(PRODUCTION_SECTORS).map(id=>[id,p.assets.filter(a=>a.sector===id).reduce((n,a)=>n+a.level*productionWorkersPerLevel(st,id,a),0)])),original={...requested},urban=fieldStrength(st,'sec_env','urbanisation'),transfer=requested.light?Math.floor(requested.agriculture*Math.min(.25,urban*.04)):0;
    requested.agriculture-=transfer;requested.light+=transfer;
    const total=Object.values(requested).reduce((a,b)=>a+b,0),baseRate=clamp(st.unemployment+p.lastEmploymentPct,0,100),pool=Math.max(0,populationWorkforce(st)*baseRate/100-(populationReservedJobs(st)-productionReservedWorkers(st)))+p.baselineWorkers,factor=total?Math.min(1,pool/total):1;
    return {workers:Object.fromEntries(Object.entries(requested).map(([id,n])=>[id,Math.floor(n*factor)])),original,transfer,factor};
};
function productionRawReport(st,id,allocation,paid=true){
    const p=st.productionResources,def=PRODUCTION_SECTORS[id],r=p.sectors[id],base=p.assets.filter(a=>a.sector===id).reduce((n,a)=>n+productionAssetCapacity(a),0),workers=allocation.workers[id],staff=allocation.original[id]?workers/allocation.original[id]:0;
    const mood=productionWorkerMood(st,id,paid),technical=id==='light'?1+fieldStrength(st,'sec_edu','dual')*.05:1,land=id==='agriculture'?Math.max(.6,1-(fieldState(st)?.farmlandLoss||0)/100):1;
    const legacyKey=id==='agriculture'?'agriculture':id==='light'?'services':id==='heavy'?'industry':null,legacy=legacyKey?1+(st.livingState?.sectors[legacyKey]?.improvement||0)/200:1;
    const seasonal=id==='tourism'?(productionBlackout(st)?.3:[5,6,7].includes(st.monthIndex)?1.5:1):1;
    const output=+(base*staff*technical*land*legacy*mood.factor*seasonal).toFixed(3),demand=+(def.demand*populationFactor(st)).toFixed(3);
    return {baseCapacity:base,workers,output,demand,wageFactor:mood.factor,technicalFactor:technical,seasonalFactor:seasonal,satisfaction:mood.satisfaction,costOfLiving:mood.cost,effectiveWage:mood.effectiveWage};
}
function productionFinishReport(id,r){const def=PRODUCTION_SECTORS[id];r.imports=+Math.max(0,r.demand-r.output).toFixed(3);r.exports=+Math.max(0,r.output-r.demand).toFixed(3);r.importB=fiscalRound(r.imports*def.priceB);r.exportB=fiscalRound(r.exports*def.priceB);return r;}
productionSectorReport=function(st,id,allocation,paid=true,miningOutput){
    const r=productionRawReport(st,id,allocation,paid);
    if(id==='heavy'){
        const inputNeed=+(r.output*.6).toFixed(3),mine=miningOutput??productionRawReport(st,'mines',allocation).output,shortfall=+Math.max(0,inputNeed-mine).toFixed(3);
        r.inputNeed=inputNeed;r.inputShortfall=shortfall;r.inputEfficiency=inputNeed?1-.25*shortfall/inputNeed:1;r.output=+(r.output*r.inputEfficiency).toFixed(3);
        // Normal ore is in the mining demand; only the foreign supply premium is additional.
        r.rawMaterialB=fiscalRound(shortfall*.0001);
    }
    return productionFinishReport(id,r);
};
productionPreview=function(st){if(!productionEngineActive(st))return null;const allocation=productionAllocation(st),sectors=Object.fromEntries(Object.keys(PRODUCTION_SECTORS).map(id=>[id,productionSectorReport(st,id,allocation)]));return {allocation,sectors,importsB:fiscalRound(Object.values(sectors).reduce((n,r)=>n+r.importB+(r.rawMaterialB||0),0)),exportsB:fiscalRound(Object.values(sectors).reduce((n,r)=>n+r.exportB,0))};};
function setProductionSubsidy(id,value){if(!PRODUCTION_SECTORS[id]||typeof value!=='boolean')return false;return productionCommit(p=>{p.sectors[id].subsidized=value;});}
function productionAutomationQuote(st,id){if(!['heavy','light'].includes(id))throw Error('Automatizimi lejohet vetëm në industri.');const r=st.productionResources.sectors[id];if(r.automation||st.productionResources.automations.some(a=>a.sector===id&&a.status==='BUILDING'))throw Error('Automatizimi ekziston ose është në proces.');return {sector:id,costB:id==='heavy'?.12:.08,weeks:8};}
function researchProductionAutomation(id){return productionCommit(p=>{
    if(municipalCapitalBlocked(state)||municipalAusterity(state))throw Error('Investimet kapitale janë ngrirë.');
    const q=productionAutomationQuote(state,id),paymentId=enterprisePay(q.costB,'Automatizimi: '+id,'CAPITAL_PAYMENT');p.automations.push({...q,id:'automation:'+p.automationCounter++,status:'BUILDING',startTurn:state.turnCount,lastTurn:state.turnCount,elapsed:0,completedTurn:null,paymentId});
});}
function processProductionAutomation(turn){for(const a of state.productionResources.automations){if(a.status!=='BUILDING'||turn<=a.lastTurn)continue;a.lastTurn=turn;if(municipalCapitalBlocked(state)||municipalAusterity(state))continue;if(++a.elapsed>=a.weeks){a.status='COMPLETED';a.completedTurn=turn;state.productionResources.sectors[a.sector].automation=true;}}}
function productionDefenseLevel(st){if(!productionEngineActive(st))return 0;const p=productionPreview(st).sectors.defense;return Math.min(5,p.output/PRODUCTION_SECTORS.defense.capacity);}
function productionBorderTension(st){return Math.round(productionDefenseLevel(st)*10);}
fieldFSKReadiness=function(st){const r=fskReadinessV55(st);r.equipment=Math.min(100,Math.round(r.equipment*(1+productionDefenseLevel(st)*.15)));return r;};
fieldFSKBudgetMarkup=function(st){return fskBudgetV55(st)+(productionDefenseLevel(st)>0?'<p>Industria vendore furnizon pajisje: eficienca e blerjes +'+Math.round(productionDefenseLevel(st)*15)+'%. Tensioni kufitar rritet.</p>':'');};
securityIncidentChance=function(st){return clamp(securityChanceV55(st)+productionDefenseLevel(st)*.03,.1,.85);};
resourceCoalSanction=function(st){if(!productionEngineActive(st))return resourceCoalSanctionV55(st);const pending=st.productionResources.assets.some(a=>a.sector==='energy'&&a.source==='FOSSIL'&&a.status==='BUILDING'&&(a.targetLevel-a.level)*(a.spec?.capacity||120)>=120);return (pending||productionFossilExpanded(st))&&st.diplomacy.EU.score<=60;};
processProductionFiscal=function(turn){
    if(!productionEngineActive(state))return {paidB:0,unpaidB:0,revenueB:0};const p=state.productionResources;if(turn<=p.lastFiscalTurn)return {paidB:0,unpaidB:0,revenueB:0};
    p.lastFiscalTurn=turn;processProductionConstruction(turn);processProductionAutomation(turn);
    p.livingBase*=Math.pow(1+Math.max(-50,state.inflation||0)/100,Math.max(0,turn-p.lastCostTurn)/FISCAL_WEEKS);p.lastCostTurn=turn;state.costOfLiving=productionLivingCost(state);
    const allocation=productionAllocation(state),row={formatVersion:2,turn,sectors:{},importsB:0,exportsB:0,paidB:0,unpaidB:0,revenueB:0,transfer:allocation.transfer,costOfLiving:state.costOfLiving};
    const employmentPct=(Object.values(allocation.workers).reduce((a,b)=>a+b,0)-p.baselineWorkers)/Math.max(1,populationWorkforce(state))*100;
    state.unemployment=clamp(state.unemployment+p.lastEmploymentPct-employmentPct,0,100);p.lastEmploymentPct=employmentPct;
    for(const [id,def] of Object.entries(PRODUCTION_SECTORS)){
        const r=p.sectors[id],wageB=fiscalRound(allocation.workers[id]*r.wage/4/1e9),wages=productionPay(wageB,'Pagat e prodhimit: '+id),subsidyB=r.subsidized?fiscalRound(wageB*.2):0,subsidy=productionPay(subsidyB,'Subvencioni i prodhimit: '+id),maintenanceB=fiscalRound(p.assets.filter(a=>a.sector===id).reduce((n,a)=>n+a.level*def.maintenanceB,0)),maintenance=productionPay(maintenanceB,'Mirëmbajtja e prodhimit: '+id);
        // A promised but unpaid wage top-up cannot raise satisfaction or productivity.
        const paid=wages.paidB+1e-9>=wageB,subsidyPaid=subsidy.paidB+1e-9>=subsidyB;
        let s;if(r.subsidized&&!subsidyPaid){r.subsidized=false;s=productionSectorReport(state,id,allocation,paid,row.sectors.mines?.output);r.subsidized=true;}else s=productionSectorReport(state,id,allocation,paid,row.sectors.mines?.output);
        Object.assign(s,{wage:r.wage,wageB,wagePaidB:wages.paidB,wageReceipt:wages.receiptId,subsidyB,subsidyPaidB:subsidy.paidB,subsidyReceipt:subsidy.receiptId,maintenanceB,maintenancePaidB:maintenance.paidB,maintenanceReceipt:maintenance.receiptId,transportB:id==='mines'?fiscalRound(s.output*.000002/fieldRailFactor(state)):0});
        r.satisfaction=s.satisfaction;
        if(s.wageFactor===.4){r.lowWeeks++;r.status=r.lowWeeks>=3?'STRIKE':'DISCONTENT';if(agendaExecutive())crisisApproval(-.5);if(r.lowWeeks===3)addMediaNews('Prodhimi','Grevë në '+def.name+': paga nuk mbulon jetesën','CRITICAL');}else{r.lowWeeks=0;r.status='NORMAL';}
        if(s.exportB){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+s.exportB),'Eksport prodhimi: '+id,'REVENUE');s.exportReceipt=state.publicFinance.ledger.at(-1).id;}else s.exportReceipt=null;
        const imports=productionPay(s.importB,'Import automatik: '+id),transport=productionPay(s.transportB,'Transport prodhimi: '+id),raw=productionPay(s.rawMaterialB||0,'Lënda e parë e importuar: '+id);
        Object.assign(s,{importPaidB:imports.paidB,importReceipt:imports.receiptId,transportPaidB:transport.paidB,transportReceipt:transport.receiptId,rawMaterialPaidB:raw.paidB,rawMaterialReceipt:raw.receiptId});row.sectors[id]=s;
        row.importsB+=s.importB+(s.rawMaterialB||0);row.exportsB+=s.exportB;row.revenueB+=s.exportB;
        row.paidB+=wages.paidB+subsidy.paidB+maintenance.paidB+imports.paidB+transport.paidB+raw.paidB;
        row.unpaidB+=wageB-wages.paidB+subsidyB-subsidy.paidB+maintenanceB-maintenance.paidB+s.importB-imports.paidB+s.transportB-transport.paidB+(s.rawMaterialB||0)-raw.paidB;
    }
    for(const k of ['importsB','exportsB','revenueB','paidB','unpaidB'])row[k]=fiscalRound(row[k]);p.history.push(row);p.history=p.history.slice(-48);return row;
};
productionMix=function(st){
    const p=st.productionResources,report=productionPreview(st),conversion=Math.min(.8,(fieldState(st)?.renewableDevelopment||0)/100+(sectorManagementRow(st,'sec_energy')?.buildings||[]).filter(b=>b.categoryId==='green'&&b.status==='COMPLETED').length*.05);
    let fossil=0,solar=0,wind=0;
    for(const a of p.assets.filter(a=>a.sector==='energy')){const amount=productionAssetCapacity(a);if(a.source==='FOSSIL'){fossil+=amount*(1-conversion);solar+=amount*conversion;}else if(a.source==='WIND')wind+=amount;else solar+=amount;}
    const fossilCapacity=fossil,actual=p.history.at(-1)?.turn===st.turnCount?p.history.at(-1).sectors.energy:report.sectors.energy,scale=actual.baseCapacity?actual.output/actual.baseCapacity:0;
    fossil*=scale;solar*=scale;wind*=scale;const imports=actual.imports,total=fossil+solar+wind+imports||1,coal=Math.round(fossil/total*100),renewable=Math.min(100-coal,Math.round((solar+wind)/total*100));
    const solarShare=Math.min(renewable,Math.round(solar/total*100));return {coal,renewable,imports:100-coal-renewable,billIndex:Math.round(85+actual.imports/Math.max(1,actual.demand)*35+renewable*.35+(productionBlackout(st)?25:0)),fossilCapacity,solar:solarShare,wind:renewable-solarShare};
};
function productionConstructionFactor(st){if(!productionEngineActive(st))return 1;const s=productionPreview(st).sectors.construction;return s.demand?1+Math.max(0,1-Math.min(1,s.output/s.demand)):1;}
routeQuote=function(st,from,to,bid='STANDARD'){const q=routeQuoteV55(st,from,to,bid),factor=productionConstructionFactor(st);return {...q,constructionFactor:factor,costB:fiscalRound(q.costB*factor),weeks:Math.ceil(q.weeks*factor)};};
openProductionResources=function(sector,source){switchMainTab('tab-government');switchSubTab('gov','production',document.getElementById('productionTab'));renderProductionResources();if(sector==='energy'&&source){const el=document.getElementById('productionEnergySource');if(el)el.value=source;renderProductionPlantPreview();}document.getElementById(sector?'production-sector-'+sector:'productionResourcesPanel')?.scrollIntoView({block:'start'});};

// Existing stars, caps, delay and purchase workflow remain intact. Only funding eligibility extends.
for(const [id,keys] of Object.entries({sec_justice:['judges','courts','aid'],sec_env:['recycling','monitoring','nature'],sec_edu:['dual']})){
    for(const c of SECTOR_MANAGEMENT_DEFS[id]||[])if(keys.includes(c.id)&&!c.sponsor){c.sponsor='EU';c.share=.5;}
}
sectorManagementEligibleGrant=function(st,c){return c.sponsor==='EU'?(productionEUAvailable(st)?c.share:0):qualityGrantV55(st,c);};
sectorEffectiveGrants=function(st,grants){return productionEUSuspended(st)?Object.fromEntries(Object.keys(grants).map(k=>[k,0])):grants;};
sectorExpansionDescription=function(c,building){return qualityDescriptionV55(c,building)+(c.sponsor==='EU'?productionEUBadge(state):'');};

renderProductionResources=function(){
    const host=document.getElementById('productionResourcesPanel');if(!host)return;const e=catalogEscape,p=state.productionResources,allowed=agendaExecutive();if(!p||p.version!==2){host.innerHTML='<p>Rihap ruajtjen që të përditësohen asetet.</p>';return;}
    const preview=productionPreview(state),last=p.history.at(-1),cost=productionLivingCost(state);
    host.innerHTML='<h2>Prodhimi dhe Resurset</h2><div class="population-grid"><div>Kostoja e jetesës<strong>€'+cost+'/muaj</strong></div><div>Importe/javë<strong>'+enterpriseMoney(last?.importsB??preview.importsB)+'</strong></div><div>Eksporte/javë<strong>'+enterpriseMoney(last?.exportsB??preview.exportsB)+'</strong></div><div>Punëtorë të lirë<strong>'+populationAvailableWorkers(state).toLocaleString('sq-AL')+'</strong></div></div><p>Kapacitetet janë njësi të modelit/javë. Lloji i centralit dhe përfundimi i ndërtimit përcaktojnë miksin e KEK-ut.</p><div class="strategy-project-grid">'+Object.entries(PRODUCTION_SECTORS).map(([id,def])=>{
        const r=p.sectors[id],s=preview.sectors[id],assets=p.assets.filter(a=>a.sector===id),auto=p.automations.find(a=>a.sector===id),mood=productionWorkerMood(state,id);
        let extra=id==='heavy'?'<p class="production-chain">Lëndë e parë: '+s.inputNeed+' · Mungesë '+s.inputShortfall+' · Import shtesë '+enterpriseMoney(s.rawMaterialB)+'/javë · Eficiencë '+Math.round(s.inputEfficiency*100)+'%</p>':id==='construction'?'<p>Kosto/afat autostrade: ×'+productionConstructionFactor(state).toFixed(2)+' sipas mbulimit vendor.</p>':id==='tourism'?'<p>Sezoni: ×'+s.seasonalFactor+' · Verë +50%; reduktimet e ulin aktivitetin në 30%.</p>':id==='defense'?'<p>Fillon në nivelin 0. Pajisje FSK +15% eficiencë/nivel; rreziku i incidentit kufitar +3 pikë/nivel.</p><p>Tension shtesë kufitar: '+productionBorderTension(state)+'/100</p>':'';
        if(['heavy','light'].includes(id))extra+=auto?'<p>Automatizimi: '+(auto.status==='COMPLETED'?'aktiv · −30% punëtorë':auto.elapsed+'/'+auto.weeks+' javë')+'</p>':'<button class="btn-top" '+(!allowed?'disabled':'')+' onclick="researchProductionAutomation(\''+id+'\')">Hulumto Automatizimin · '+enterpriseMoney(id==='heavy'?.12:.08)+' · 8 javë</button>';
        return '<article class="card" id="production-sector-'+id+'"><h3>'+def.name+'</h3>'+productionEUBadge(state,id==='agriculture'||id==='energy')+'<p>Prodhim '+s.output.toFixed(1)+' / Kërkesë '+s.demand.toFixed(1)+' · Punëtorë '+s.workers+'</p><p>Import '+s.imports.toFixed(1)+' / Eksport '+s.exports.toFixed(1)+' · '+({NORMAL:'Punë normale',DISCONTENT:'Pakënaqësi',STRIKE:'Grevë · 40% kapacitet'})[r.status]+'</p><p>Kënaqësi: '+mood.satisfaction+'/100 · Paga efektive €'+Math.round(mood.effectiveWage)+' / jetesa €'+cost+'</p><label for="productionWage-'+id+'">Paga mujore · <output id="productionWageValue-'+id+'">€'+r.wage+'</output><input id="productionWage-'+id+'" type="range" min="300" max="2000" step="50" value="'+r.wage+'" '+(!allowed?'disabled':'')+' oninput="document.getElementById(\'productionWageValue-'+id+'\').textContent=\'€\'+this.value"></label><button class="btn-top" '+(!allowed?'disabled':'')+' onclick="setProductionWage(\''+id+'\',document.getElementById(\'productionWage-'+id+'\').value)">Zbato pagën e prodhimit</button><label class="production-subsidy"><input type="checkbox" '+(r.subsidized?'checked ':'')+(!allowed?'disabled ':'')+' onchange="setProductionSubsidy(\''+id+'\',this.checked)"> Subvenciono sektorin · shtesë 20% e pagave</label>'+extra+assets.map(a=>'<div class="production-asset"><strong>'+e(a.spec?.name||def.asset)+' · Niveli '+a.level+'/5</strong><p>Kapacitet '+productionAssetCapacity(a)+' · Punëtorë '+a.level*productionWorkersPerLevel(state,id,a)+'</p>'+(a.status==='BUILDING'?'<progress max="'+a.weeks+'" value="'+a.elapsed+'"></progress><p>Niveli '+a.targetLevel+' · '+a.elapsed+'/'+a.weeks+' javë</p>':a.level<5?'<button class="btn-top" '+(!allowed?'disabled':'')+' onclick="reviewProductionBuild(\''+id+'\',\''+a.id+'\')">Përmirëso në nivelin '+(a.level+1)+'</button>':'<span class="tag">Niveli maksimal</span>')+'</div>').join('')+(id==='energy'?'<label>Lloji i centralit<select id="productionEnergySource" onchange="renderProductionPlantPreview()">'+Object.entries(ENERGY_PLANTS).map(([key,v])=>'<option value="'+key+'">'+v.name+'</option>').join('')+'</select></label><div id="productionPlantPreview"></div>':'')+'<button class="action-btn" '+(!allowed?'disabled':'')+' onclick="reviewProductionBuild(\''+id+'\',null)">'+(id==='energy'?'Hap ofertën për centralin':'Ndërto '+e(def.asset))+'</button></article>';
    }).join('')+'</div>';renderProductionPlantPreview();
};
function renderProductionPlantPreview(){const select=document.getElementById('productionEnergySource'),el=document.getElementById('productionPlantPreview');if(!el||!select)return;const q=productionQuote(state,'energy',null,select.value);el.innerHTML='<p><strong>'+catalogEscape(q.spec.name)+'</strong><br>Kapacitet +'+q.capacity+' · '+q.workers+' punëtorë<br>Gjithsej '+enterpriseMoney(q.grossB)+' · BE '+Math.round(q.grantRate*100)+'%<br><strong>Kostoja juaj '+enterpriseMoney(q.costB)+' · '+q.weeks+' javë</strong></p>'+(q.source==='FOSSIL'?'<p>Raporti me BE: −'+Math.min(25,Math.round(q.capacity/12))+' pikë. Zgjerimi fosil mund të ngrijë grantet deri në përmirësimin e raporteve.</p>':'');}
reviewProductionBuild=function(sector,id){try{
    const source=sector==='energy'?(document.getElementById('productionEnergySource')?.value||'FOSSIL'):'FOSSIL',q=productionQuote(state,sector,id,source);
    document.getElementById('interactiveActionModalContent').innerHTML='<h2>'+catalogEscape(q.spec?.name||PRODUCTION_SECTORS[sector].asset)+' · Niveli '+q.targetLevel+'</h2><p>Kapacitet shtesë '+q.capacity+' njësi/javë · '+q.workers+' punëtorë · '+q.weeks+' javë</p><p>Gjithsej '+enterpriseMoney(q.grossB)+' | BE '+Math.round(q.grantRate*100)+'% ('+enterpriseMoney(q.grantB)+') | <strong>Kostoja juaj '+enterpriseMoney(q.costB)+'</strong></p><p>Oferta rillogaritet në konfirmim nëse marrëdhëniet ose sanksionet kanë ndryshuar.</p><button class="action-btn" onclick="confirmProductionBuild(\''+sector+'\','+(id?'\''+id+'\'':'null')+',\''+q.source+'\')">Konfirmo investimin</button><button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Kthehu</button><p id="productionBuildError" role="alert"></p>';toggleModal('interactiveActionModal',true);
}catch(error){showToast(error.message);}};

validateProductionResources=function(st){
    const p=st.productionResources;if(p===undefined)return;
    const bad=()=>{throw Error('Regjistri i prodhimit dhe financimit është i pavlefshëm.');},integer=(n,min=0,max=st.turnCount)=>Number.isInteger(n)&&n>=min&&n<=max,near=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-7;
    const receipt=(id,turn,amount,source,type='EXPENSE')=>{if(!amount){if(id!==null)bad();return;}const r=st.publicFinance.ledger.find(r=>r.id===id);if(!r||r.turn!==turn||r.source!==source||r.type!==type||!near(r.amountB,type==='REVENUE'?amount:-amount))bad();};
    if(p.version!==2||p.active!==true||!integer(p.startTurn)||!integer(p.lastBuildTurn)||!integer(p.lastFiscalTurn)||!integer(p.lastCostTurn)||!Number.isFinite(p.livingBase)||p.livingBase<=0||!Number.isFinite(p.lastEmploymentPct)||Math.abs(p.lastEmploymentPct)>100||!integer(p.baselineWorkers,0,1e8)||!Array.isArray(p.assets)||p.counter!==p.assets.length||!Array.isArray(p.history)||p.history.length>48||Object.keys(p.sectors||{}).length!==8||!Array.isArray(p.automations)||p.automationCounter!==p.automations.length||!Number.isFinite(p.baseInflation)||!Number.isFinite(st.costOfLiving)||st.costOfLiving<1)bad();
    for(const [id,r] of Object.entries(p.sectors))if(!PRODUCTION_SECTORS[id]||!integer(r.wage,300,2000)||r.wage%50||!['NORMAL','DISCONTENT','STRIKE'].includes(r.status)||!integer(r.lowWeeks,0,1e8)||!integer(r.satisfaction,0,100)||typeof r.subsidized!=='boolean'||typeof r.automation!=='boolean')bad();
    const usedReceipts=new Set();
    p.assets.forEach((a,i)=>{
        if(a.id!=='asset:'+i||!PRODUCTION_SECTORS[a.sector]||!ENERGY_PLANTS[a.source]||!integer(a.level,0,5)||!integer(a.baselineLevel,0,a.level)||!['ACTIVE','BUILDING'].includes(a.status)||!integer(a.startedTurn)||!integer(a.elapsed,0,a.weeks)||!Array.isArray(a.investments))bad();
        if(a.sector==='energy'){
            if(!a.spec||typeof a.spec.name!=='string'||!['capacity','workers','costB','weeks'].every(k=>Number.isFinite(a.spec[k])&&a.spec[k]>0))bad();
            const current=ENERGY_PLANTS[a.source],legacy={capacity:120,workers:600,costB:.06*(a.source==='FOSSIL'?1:1.4),weeks:a.source==='FOSSIL'?10:16};
            if(![current,...(a.legacyPlant?[legacy]:[])].some(s=>['capacity','workers','costB','weeks'].every(k=>near(a.spec[k],s[k]))))bad();
        }
        if(a.status==='BUILDING'){if(!integer(a.targetLevel,1,5)||(!a.legacyResourceId&&a.targetLevel!==a.level+1)||a.completedTurn!==null||a.elapsed>=a.weeks)bad();}else if(a.level<1||a.targetLevel!==null||!integer(a.completedTurn))bad();
        if(a.legacyResourceId&&!st.livingState?.resources.some(r=>r.id===a.legacyResourceId&&r.choice==='PROCESS'))bad();
        for(const inv of a.investments){
            if(!integer(inv.turn)||!integer(inv.targetLevel,1,5)||!Number.isFinite(inv.costB)||inv.costB<=0||usedReceipts.has(inv.paymentId))bad();usedReceipts.add(inv.paymentId);
            const l=st.publicFinance.ledger.find(l=>l.id===inv.paymentId);if(!l||l.type!=='CAPITAL_PAYMENT'||l.turn!==inv.turn||!near(l.amountB,-inv.costB)||!l.source.startsWith('Aset prodhues: '+a.sector+':'))bad();
            if(inv.grantRate!==undefined&&(![0,.5,.6,.7,.8].some(n=>near(n,inv.grantRate))||!near(inv.grossB,inv.costB+inv.grantB)||!near(inv.grantB,fiscalRound(inv.grossB*inv.grantRate))||!near(inv.grossB,fiscalRound((a.spec||PRODUCTION_SECTORS[a.sector]).costB*inv.targetLevel))||inv.weeks!==(a.spec||PRODUCTION_SECTORS[a.sector]).weeks+inv.targetLevel*2))bad();
        }
    });
    // Baseline jobs stay historical; automation can subsequently release these workers.
    if(p.baselineWorkers!==p.assets.reduce((n,a)=>n+a.baselineLevel*(a.spec?.workers||PRODUCTION_SECTORS[a.sector].workers),0))bad();
    const autoSectors=new Set();p.automations.forEach((a,i)=>{
        if(a.id!=='automation:'+i||!['heavy','light'].includes(a.sector)||autoSectors.has(a.sector)||a.costB!==(a.sector==='heavy'?.12:.08)||a.weeks!==8||!integer(a.startTurn)||!integer(a.lastTurn,a.startTurn)||!integer(a.elapsed,0,8)||!['BUILDING','COMPLETED'].includes(a.status))bad();autoSectors.add(a.sector);
        if(a.status==='COMPLETED'?(a.elapsed!==8||!integer(a.completedTurn,a.startTurn+8)||!p.sectors[a.sector].automation):(a.elapsed>=8||a.completedTurn!==null||p.sectors[a.sector].automation))bad();
        receipt(a.paymentId,a.startTurn,a.costB,'Automatizimi: '+a.sector,'CAPITAL_PAYMENT');
    });for(const [id,r] of Object.entries(p.sectors))if(r.automation&&!p.automations.some(a=>a.sector===id&&a.status==='COMPLETED'))bad();
    const turns=new Set();for(const row of p.history){
        if(!integer(row.turn)||turns.has(row.turn)||!row.sectors||Object.keys(row.sectors).length!==(row.formatVersion===2?8:5))bad();turns.add(row.turn);
        let imports=0,exports=0,paid=0,unpaid=0;
        for(const [id,s] of Object.entries(row.sectors)){
            if(!PRODUCTION_SECTORS[id]||![s.output,s.demand,s.imports,s.exports,s.wageB,s.wagePaidB,s.maintenanceB,s.maintenancePaidB,s.importB,s.importPaidB,s.exportB,s.transportB,s.transportPaidB].every(n=>Number.isFinite(n)&&n>=0)||![.4,1].includes(s.wageFactor)||!near(s.imports,Math.max(0,s.demand-s.output))||!near(s.exports,Math.max(0,s.output-s.demand)))bad();
            const pairs=[['wageB','wagePaidB','wageReceipt','Pagat e prodhimit: '],['maintenanceB','maintenancePaidB','maintenanceReceipt','Mirëmbajtja e prodhimit: '],['importB','importPaidB','importReceipt','Import automatik: '],['transportB','transportPaidB','transportReceipt','Transport prodhimi: ']];
            if(row.formatVersion===2){pairs.push(['subsidyB','subsidyPaidB','subsidyReceipt','Subvencioni i prodhimit: '],['rawMaterialB','rawMaterialPaidB','rawMaterialReceipt','Lënda e parë e importuar: ']);if(!integer(s.satisfaction,0,100)||!Number.isFinite(s.costOfLiving)||s.costOfLiving<=0)bad();}
            for(const [required,payment,ref,source] of pairs){const want=s[required]||0,amount=s[payment]||0;if(!Number.isFinite(want)||want<0||!Number.isFinite(amount)||amount<0||amount>want+1e-8)bad();receipt(s[ref],row.turn,amount,source+id);paid+=amount;unpaid+=want-amount;}
            receipt(s.exportReceipt,row.turn,s.exportB,'Eksport prodhimi: '+id,'REVENUE');imports+=s.importB+(s.rawMaterialB||0);exports+=s.exportB;
        }
        if(!near(row.importsB,fiscalRound(imports))||!near(row.exportsB,fiscalRound(exports))||!near(row.paidB,fiscalRound(paid))||!near(row.unpaidB,fiscalRound(unpaid))||row.revenueB!==row.exportsB)bad();
    }
};
