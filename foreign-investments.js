/* Attract & Reveal. Identities are sealed in the local save; never render them before signing. */
const FDI_LEGEND_CHANCE=.05,FDI_STABLE_WEEKS=4;
function fdiExactMoney(n){return new Intl.NumberFormat('sq-AL',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(n*1e9);}
function fdiInvestor(id){return FDI_INVESTORS.find(i=>i.id===id);}
function fdiLegacyRevision(db){return db.campaigns.length+db.offers.filter(o=>o.status!=='OFFERED').length+db.offers.filter(o=>FDI_TYPES[o.type]?.mega).reduce((n,o)=>n+(o.infrastructureStartedTurn!==null?1:0)+(o.taxLawId!==null?1:0),0);}
function migrateForeignInvestments(st){
    const db=st.foreignInvestments;if(!db||db.version===3)return;
    if(![1,2].includes(db.version))throw Error('Version i panjohur i investimeve.');
    db.version=3;db.attractionCampaigns=[];db.bidders=[];db.stability={weeks:0,key:fdiGovernmentKey(st),riskSignature:fdiRiskSignature(st)};
}
function enableForeignInvestments(){if(state.foreignInvestments)return false;return fiscalCommit(function(){state.foreignInvestments={version:3,lastTurn:state.turnCount,revision:0,campaigns:[],offers:[],attractionCampaigns:[],bidders:[],stability:{weeks:0,key:fdiGovernmentKey(state),riskSignature:fdiRiskSignature(state)}};});}
function fdiCommit(change){if(typeof securityFDIBlocked==='function'&&securityFDIBlocked(state)){showToast('IHD-te jane bllokuar nga kriza nderkombetare.');return false;}const ticker=document.getElementById('mediaTickerText'),before=ticker?.textContent,notices=typeof governmentInvestmentSnapshot==='function'?governmentInvestmentSnapshot(state):null;const saved=fiscalCommit(function(){migrateForeignInvestments(state);change();validateForeignInvestments(state);});if(!saved&&ticker)ticker.textContent=before;if(saved&&notices&&typeof notifyGovernmentInvestmentChanges==='function')notifyGovernmentInvestmentChanges(notices,state);return saved;}
function fdiDevelopment(st){const result={};['sec_edu','sec_police','sec_tech','sec_roads','sec_energy','sec_agri','sec_health'].forEach(id=>result[id]=typeof sectorManagementAverage==='function'?sectorManagementAverage(st,id):3);return result;}
function fdiPoliticallyStable(st){return !!st.governmentFormed&&st.governmentStatus==='IN_OFFICE'&&!fdiInitialConditions(st)&&st.publicFinance.arrearsB<=1e-8&&!(st.darkPolitics?.exposedTurn===st.turnCount)&&(st.securityOps?.operations||[]).every(o=>!o.exposed||o.resolvedTurn!==st.turnCount);}
function fdiRiskSignature(st){return JSON.stringify([fdiGovernmentKey(st),st.streetProtests?.counter||0,st.darkPolitics?.exposedTurn??null,(st.securityOps?.operations||[]).filter(o=>o.exposed).map(o=>o.id).sort(),st.publicFinance.arrearsB]);}
function fdiStableWeeks(st){return fdiPoliticallyStable(st)&&st.foreignInvestments?.stability?.riskSignature===fdiRiskSignature(st)?st.foreignInvestments.stability.weeks:0;}
function fdiLegendEligible(metrics,weeks,i){return metrics.sec_edu>8&&metrics.sec_police>8&&metrics[FDI_FAMILIES[i.family].primary]>=8&&weeks>=FDI_STABLE_WEEKS;}
function fdiAttractionEligible(i,metrics,weeks){
    if(i.tier===4)return fdiLegendEligible(metrics,weeks,i);
    const minimum=i.tier===1?2:i.tier===2?4:6;
    return metrics.sec_police>=minimum&&metrics[FDI_FAMILIES[i.family].primary]>=minimum&&(!['TECH','SERVICES'].includes(i.family)&&i.tier<3||metrics.sec_edu>=minimum);
}
function fdiExcluded(st){
    const ids=(st.foreignInvestments?.bidders||[]).filter(b=>!['FAILED','REJECTED','EXPIRED'].includes(b.status)).map(b=>b.investorId);
    const mapping={MICROSOFT:'legend-microsoft',VOLKSWAGEN:'legend-volkswagen',AMAZON:'legend-amazon'};
    (st.foreignInvestments?.offers||[]).filter(o=>['OFFERED','ACTIVE','COMPLETED'].includes(o.status)).forEach(o=>{if(mapping[o.type])ids.push(mapping[o.type]);});return [...new Set(ids)];
}
function fdiPools(focus,metrics,weeks,excluded){
    const available=FDI_INVESTORS.filter(i=>(focus==='AUTO'||i.family===focus)&&!excluded.includes(i.id)&&fdiAttractionEligible(i,metrics,weeks));
    return {normal:available.filter(i=>i.tier<4),legendary:available.filter(i=>i.tier===4)};
}
function fdiDrawInvestor(draw){
    const pools=fdiPools(draw.focus,draw.metrics,draw.stableWeeks,draw.excluded),pool=draw.legendRoll<FDI_LEGEND_CHANCE&&pools.legendary.length?pools.legendary:pools.normal;
    if(!pool.length)return null;
    const weights=pool.map(i=>(1+(draw.metrics[FDI_FAMILIES[i.family].primary]-2)*.5+(i.family==='TECH'?(draw.metrics.sec_edu-2)*.3:0))*(i.tier===2?1.5:i.tier===3?1.25:1)*(typeof socioInvestorWeight==='function'?socioInvestorWeight(i,draw):1));
    let position=draw.sampleRoll*weights.reduce((a,b)=>a+b,0);for(let n=0;n<pool.length;n++){position-=weights[n];if(position<0)return pool[n];}return pool.at(-1);
}
function startForeignInvestmentCampaign(revision,focus){
    const db=state.foreignInvestments;if(!db||db.revision!==revision||!(focus==='AUTO'||Object.hasOwn(FDI_FAMILIES,focus)))return false;
    if((db.attractionCampaigns||[]).some(c=>c.status==='ACTIVE')||(db.bidders||[]).filter(b=>['HIDDEN','NEGOTIATING','SIGNED'].includes(b.status)).length>=4)return false;
    const metrics=fdiDevelopment(state),weeks=fdiStableWeeks(state),excluded=fdiExcluded(state),pools=fdiPools(focus,metrics,weeks,excluded),check=fiscalSpendingCheck(.0005,false);
    if(!pools.normal.length){showToast('Nuk ka profile të reja të kualifikuara. Zhvilloni sektorët ose provoni një drejtim tjetër.');return false;}
    if(!check.allowed||state.budgetTotalB<.0005){showToast(check.message||'Arka nuk e mbulon fushatën.');return false;}
    return fdiCommit(function(){
        const draw={focus,metrics,stableWeeks:weeks,excluded,legendRoll:Math.random(),sampleRoll:Math.random(),societalReputation:typeof socioReputationSnapshot==='function'?socioReputationSnapshot(state):undefined},investor=fdiDrawInvestor(draw);if(!investor)throw Error('Nuk u gjet profil i vlefshëm.');
        fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-.0005),'IHD: fushatë tërheqjeje · '+(FDI_FAMILIES[focus]?.label||'të gjithë sektorët'),'EXPENSE');
        db.attractionCampaigns.push({id:'attract-campaign:'+db.attractionCampaigns.length,startTurn:state.turnCount,dueTurn:state.turnCount+3,status:'ACTIVE',paymentId:state.publicFinance.ledger.at(-1).id,investorId:investor.id,draw});db.revision++;
    });
}
function fdiBidder(id,revision,statuses){const db=state.foreignInvestments,b=db?.bidders?.find(b=>b.id===id);return b&&db.revision===revision&&statuses.includes(b.status)?b:null;}
function fdiAnonymousTitle(b){return 'Profili anonim #'+(Number(b.id.split(':')[1])+1)+' · '+FDI_FAMILIES[fdiInvestor(b.investorId).family].label;}
function fdiBidderTitle(b){const i=fdiInvestor(b.investorId);return b.revealed?i.company+' · '+i.project:fdiAnonymousTitle(b);}
function startBidderNegotiation(id,revision){
    const b=fdiBidder(id,revision,['HIDDEN']);if(!b||state.turnCount>b.expiresTurn)return false;const i=fdiInvestor(b.investorId),check=fiscalSpendingCheck(i.cofinanceB,true),risk=fdiInitialConditions(state);
    if(!check.allowed||state.budgetTotalB<i.cofinanceB||risk){showToast(risk||check.message||'Arka nuk e mbulon bashkëfinancimin.');return false;}
    return fdiCommit(function(){
        if(!state.streetProtests)initializeStreetProtests(state);
        fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-i.cofinanceB),'IHD: infrastrukturë për '+fdiAnonymousTitle(b),'CAPITAL_PAYMENT');
        Object.assign(b,{status:'NEGOTIATING',startTurn:state.turnCount,lastTurn:state.turnCount,deadlineTurn:state.turnCount+i.deadline,paymentId:state.publicFinance.ledger.at(-1).id,governmentKey:fdiGovernmentKey(state),protestBaseline:state.streetProtests.counter,scandalBaseline:(state.securityOps?.operations||[]).filter(o=>o.exposed).map(o=>o.id),darkExposedAtStart:state.darkPolitics?.exposedTurn??null,arrearsAtStartB:state.publicFinance.arrearsB});registerRogueTender('BIDDER|'+b.id,FDI_FAMILIES[i.family].sector,b.paymentId);state.foreignInvestments.revision++;
    });
}
function rejectMysteryBidder(id,revision){const b=fdiBidder(id,revision,['HIDDEN']);if(!b)return false;return fdiCommit(function(){b.status='REJECTED';b.rejectedTurn=state.turnCount;state.foreignInvestments.revision++;});}
function startBidderInfrastructure(id,revision){if(municipalCapitalBlocked(state))return false;const b=fdiBidder(id,revision,['NEGOTIATING']);if(!b||b.infrastructureStartedTurn!==null||state.turnCount>b.deadlineTurn)return false;return fdiCommit(function(){b.infrastructureStartedTurn=state.turnCount;state.foreignInvestments.revision++;});}
function proposeBidderTaxLaw(id,revision){
    const b=fdiBidder(id,revision,['NEGOTIATING']);if(!b||state.turnCount>b.deadlineTurn)return false;const i=fdiInvestor(b.investorId),old=state.laws.find(l=>l.id===b.taxLawId);if(!i.lawRequired||old&&!['FAILED','WITHDRAWN','ANNULLED'].includes(old.status)||!assertPoliticalParliament('Ligji i lehtësirave të investimit'))return false;
    const saved=fdiCommit(function(){
        const law={id:'bidder-tax:'+(++state.billCounter),title:'Ligji i lehtësirave · '+fdiAnonymousTitle(b),desc:'Lehtësim '+Math.round(i.relief*100)+'% vetëm për kontratën e këtij profili anonim. Nuk ndryshon normat e bizneseve të tjera. Kompania dhe ndikimi i saktë zbulohen në nënshkrim; arkëtimet nisin pas realizimit.',ministry:'Ministria e Financave',sector:FDI_FAMILIES[i.family].sector,proposer:'Qeveria e Kosovës',costB:0,duration:1,approvalEffect:0,status:'DRAFT',supportParties:[state.playerParty],stageHistory:[],voteHistory:[],applied:false,legalEffectMode:'PROCEDURAL',fdiBidderId:b.id,fdiTaxRelief:i.relief};
        initializeCatalogBill(law);state.laws.unshift(law);b.taxLawIds.push(law.id);b.taxLawId=law.id;state.foreignInvestments.revision++;
    });if(saved)openBidderTaxLaw(id);return saved;
}
function openBidderTaxLaw(id){const b=state.foreignInvestments?.bidders?.find(b=>b.id===id),n=state.laws.findIndex(l=>l.id===b?.taxLawId);if(n>=0)catalogBillDetails(n);}
function bidderTaxLawPassed(b,st){const i=fdiInvestor(b.investorId);return !i.lawRequired||st.laws.some(l=>l.id===b.taxLawId&&l.fdiBidderId===b.id&&l.fdiTaxRelief===i.relief&&l.status==='PASSED'&&(l.voteHistory||[]).some(v=>v.passed&&v.pro>=61));}
function fdiBidderSectorReady(i,m){return (i.tier===4?m.sec_police>8&&m.sec_edu>8:m.sec_police>=i.security&&m.sec_edu>=i.education)&&m[FDI_FAMILIES[i.family].primary]>=i.primary;}
function bidderSigningReason(b,st){
    if(typeof securityFDIBlocked==='function'&&securityFDIBlocked(st))return 'IHD-te jane bllokuar nga kriza nderkombetare.';
    if(typeof courtInvestmentFrozen==='function'&&courtInvestmentFrozen(b.taxLawId,st))return 'Ligji i lehtësirave është pezulluar nga Gjykata Kushtetuese.';
    if(b.status!=='NEGOTIATING')return 'Profili nuk është në negociatë.';const i=fdiInvestor(b.investorId),metrics=fdiDevelopment(st);
    if(typeof populationWorkerReason==='function'){const reason=populationWorkerReason(i.jobs,st);if(reason)return reason;}
    if(st.turnCount>b.deadlineTurn)return 'Afati i negocimit ka skaduar.';
    const breach=fdiBreachReason(b,st);if(breach)return breach;
    if(!fdiBidderSectorReady(i,metrics))return 'Cilësia e zbatuar e sektorëve nuk i plotëson ende kriteret.';
    if(i.tier===4&&!fdiLegendEligible(metrics,fdiStableWeeks(st),i))return 'Nuk plotësohen kriteret e zhvillimit dhe stabilitetit për këtë profil.';
    if(b.infrastructureElapsed<i.publicWeeks)return 'Përfundoni infrastrukturën publike.';
    if(!bidderTaxLawPassed(b,st))return 'Kërkohet ligj i miratuar me së paku 61 vota.';
    if(b.stableWeeks<i.stableWeeks)return 'Periudha e garancisë së stabilitetit ende nuk ka përfunduar.';return '';
}
function signMysteryBidder(id,revision){
    if(municipalCapitalBlocked(state)){showToast('Gjykata: Mega-Projektet e reja jane te bllokuara.');return false;}
    const b=fdiBidder(id,revision,['NEGOTIATING']);if(!b)return false;const reason=bidderSigningReason(b,state);if(reason){showToast(reason);return false;}
    return fdiCommit(function(){const i=fdiInvestor(b.investorId);Object.assign(b,{status:'SIGNED',revealed:true,signedTurn:state.turnCount,signedMetrics:fdiDevelopment(state),signedStableWeeks:state.foreignInvestments.stability.weeks,executionDeadlineTurn:state.turnCount+i.executionWeeks+4});state.foreignInvestments.revision++;addMediaNews('Investimet','Zbulohet investitori: '+i.company,'POSITIVE',i.project+'. Kapital privat '+fdiMoney(i.capitalB)+'; '+i.jobs+' vende pune dhe '+fdiExactMoney(i.weeklyTaxB)+'/javë tatime neto pas realizimit.');});
}
function fdiApplyBidderOutcome(b,success,reason){
    if(b.outcomeApplied||!['NEGOTIATING','SIGNED'].includes(b.status))return;const i=fdiInvestor(b.investorId);if(success&&b.status!=='SIGNED')throw Error('Investimi nuk është nënshkruar.');
    b.outcomeApplied=true;b.status=success?'COMPLETED':'FAILED';b.approvalBefore=state.approval;rtkApplyApprovalTarget(state,fdiApprovalTarget(state.approval,success,i));b.approvalAfter=state.approval;if(typeof interestPublicReaction==='function')interestPublicReaction(state,b.approvalAfter-b.approvalBefore,{sectorId:'sec_econ'});
    if(success){b.completedTurn=state.turnCount;state.unemployment=fiscalRound(Math.max(0,state.unemployment-i.jobs/Math.max(1,typeof populationWorkforce==='function'?populationWorkforce(state):FDI_LABOUR_FORCE)*100));if(!economicPilotActive(state))state.gdpGrowth=fiscalRound(state.gdpGrowth+i.capitalB/FISCAL_GDP_B*20);}
    else{b.failedTurn=state.turnCount;b.failureReason=reason;if(typeof recordCrisisPressEvent==='function')recordCrisisPressEvent('INVESTMENT','bidder:'+b.id,fdiBidderTitle(b),FDI_FAMILIES[i.family].primary);}
    addMediaNews('Investimet',(success?'Realizohet: ':'Tërhiqet: ')+fdiBidderTitle(b),success?'POSITIVE':'CRITICAL',success?i.jobs+' vende pune. Tatimi neto '+fdiExactMoney(i.weeklyTaxB)+'/javë nis javën pasuese.':reason+' Bashkëfinancimi '+fdiMoney(i.cofinanceB)+' nuk kthehet.');
}
function processForeignInvestmentsWeek(turn){
    const db=state.foreignInvestments;if(!db)return false;if(turn===db.lastTurn)return false;if(turn!==state.turnCount||turn!==db.lastTurn+1)throw Error('Ora e investimeve nuk përputhet.');migrateForeignInvestments(state);
    // Run unchanged old contracts against their original registry schema, sharing their records.
    const legacy={version:2,lastTurn:db.lastTurn,revision:fdiLegacyRevision(db),campaigns:db.campaigns,offers:db.offers};state.foreignInvestments=legacy;
    try{legacyProcessForeignInvestmentsWeek(turn);}finally{state.foreignInvestments=db;}
    const clean=fdiPoliticallyStable(state),key=fdiGovernmentKey(state),signature=fdiRiskSignature(state);db.stability.weeks=clean&&db.stability.riskSignature===signature?db.stability.weeks+1:0;db.stability.key=key;db.stability.riskSignature=signature;
    db.attractionCampaigns.filter(c=>c.status==='ACTIVE'&&turn>=c.dueTurn&&!(typeof securityFDIBlocked==='function'&&securityFDIBlocked(state))).forEach(c=>{
        const i=fdiInvestor(c.investorId);if(i.tier===4&&(!fdiPoliticallyStable(state)||!fdiLegendEligible(fdiDevelopment(state),db.stability.weeks,i))){c.status='CANCELLED';addMediaNews('Investimet','Nuk u kualifikua profili anonim','NEUTRAL','Nivelet e sektorëve ose stabiliteti ranë gjatë fushatës. Fushata nuk kthehet në para.');return;}
        c.status='COMPLETED';c.revealedTurn=turn;db.bidders.push({id:'mystery:'+Number(c.id.split(':')[1]),campaignId:c.id,investorId:i.id,status:'HIDDEN',revealed:false,createdTurn:turn,expiresTurn:turn+6,startTurn:null,lastTurn:turn,deadlineTurn:null,paymentId:null,infrastructureStartedTurn:null,infrastructureElapsed:0,taxLawId:null,taxLawIds:[],stableWeeks:0,signedTurn:null,signedMetrics:null,signedStableWeeks:null,executionDeadlineTurn:null,executionElapsed:0,rejectedTurn:null,completedTurn:null,failedTurn:null,failureReason:null,outcomeApplied:false,approvalBefore:null,approvalAfter:null,governmentKey:null,protestBaseline:null,scandalBaseline:[],darkExposedAtStart:null,arrearsAtStartB:null});
        addMediaNews('Investimet','Mbërrin një profil anonim','NEUTRAL',FDI_FAMILIES[i.family].anonymous+' Shqyrtoni kushtet përpara angazhimit të fondeve.');
    });
    db.bidders.forEach(b=>{
        if(b.status==='HIDDEN'){if(turn>b.expiresTurn)b.status='EXPIRED';return;}
        if(!['NEGOTIATING','SIGNED'].includes(b.status)||b.lastTurn>=turn)return;b.lastTurn=turn;const i=fdiInvestor(b.investorId),breach=fdiBreachReason(b,state);if(breach){fdiApplyBidderOutcome(b,false,breach);return;}
        if(typeof securityFDIBlocked==='function'&&securityFDIBlocked(state)){if(b.status==='NEGOTIATING'&&turn>b.deadlineTurn||b.status==='SIGNED'&&turn>=b.executionDeadlineTurn)fdiApplyBidderOutcome(b,false,'Kriza nderkombetare tejkaloi afatin kontraktual.');return;}
        if((b.infrastructureStartedTurn!==null||b.status==='SIGNED')&&typeof localProjectBlocked==='function'&&localProjectBlocked('BIDDER|'+b.id,fdiBidderTitle(b),b.municipalityId)){if(b.status==='NEGOTIATING'&&turn>b.deadlineTurn||b.status==='SIGNED'&&turn>=b.executionDeadlineTurn)fdiApplyBidderOutcome(b,false,'Bllokada lokale tejkaloi afatin kontraktual.');return;}
        if(typeof courtInvestmentFrozen==='function'&&courtInvestmentFrozen(b.taxLawId,state)){
            if(b.status==='NEGOTIATING'&&turn>b.deadlineTurn||b.status==='SIGNED'&&turn>=b.executionDeadlineTurn)fdiApplyBidderOutcome(b,false,'Pezullimi gjyqësor vonoi projektin përtej afatit kontraktual.');return;
        }
        if(b.status==='NEGOTIATING'){
            if(typeof coalitionBlockedInvestment==='function' && coalitionBlockedInvestment(state.laws.find(l=>l.id===b.taxLawId))){fdiApplyBidderOutcome(b,false,'Partneri abstenoi dhe ligji i lehtësirave u rrëzua.');return;}
            b.stableWeeks=Math.min(i.stableWeeks,b.stableWeeks+1);if(b.infrastructureStartedTurn!==null&&turn>b.infrastructureStartedTurn&&!streetSectorBlocked(FDI_FAMILIES[i.family].sector,turn,state))b.infrastructureElapsed=Math.min(i.publicWeeks,b.infrastructureElapsed+rogueProjectStep('BIDDER|'+b.id,'INFRA',i.publicWeeks-b.infrastructureElapsed));
            // The player has the entire deadline week to explicitly sign; never auto-reveal.
            if(turn>b.deadlineTurn)fdiApplyBidderOutcome(b,false,'Skadoi afati pa marrëveshje të nënshkruar.');
        }else{
            if(fdiBidderSectorReady(i,fdiDevelopment(state)))b.executionElapsed=Math.min(i.executionWeeks,b.executionElapsed+rogueProjectStep('BIDDER|'+b.id,'EXECUTION',i.executionWeeks-b.executionElapsed));
            if(b.executionElapsed===i.executionWeeks)fdiApplyBidderOutcome(b,true,'');else if(turn>=b.executionDeadlineTurn)fdiApplyBidderOutcome(b,false,'Ranë kushtet sektoriale dhe skadoi afati i realizimit.');
        }
    });db.lastTurn=turn;validateForeignInvestments(state);return true;
}
function fdiMegaTotals(st){if(typeof internationalIsolation==='function'&&internationalIsolation(st))return {capitalB:0,jobs:0};const totals=legacyFdiMegaTotals(st);(st.foreignInvestments?.bidders||[]).filter(b=>b.status==='COMPLETED').forEach(b=>{const i=fdiInvestor(b.investorId);totals.capitalB+=i.capitalB;totals.jobs+=i.jobs;});return totals;}
function foreignInvestmentEmploymentBoost(st){return Math.min(100,fdiMegaTotals(st).jobs/Math.max(1,typeof populationWorkforce==='function'?populationWorkforce(st):FDI_LABOUR_FORCE)*100);}
function foreignInvestmentCapacityBoost(st){return fdiMegaTotals(st).capitalB/FISCAL_GDP_B*100;}
function foreignInvestmentAnnualTax(st){if(typeof internationalIsolation==='function'&&internationalIsolation(st))return 0;return Math.max(0,strategicZoneAnnualAdjustment(st)+legacyForeignInvestmentAnnualTax(st)+(st.foreignInvestments?.bidders||[]).filter(b=>b.status==='COMPLETED').reduce((sum,b)=>sum+fdiInvestor(b.investorId).weeklyTaxB*FISCAL_WEEKS,0));}
// Entry points retained for old saved contracts and their existing controls.
function decideForeignInvestment(...args){return legacyDecideForeignInvestment(...args);}
function startForeignInvestmentInfrastructure(...args){return legacyStartForeignInvestmentInfrastructure(...args);}
function proposeForeignInvestmentTaxLaw(...args){return legacyProposeForeignInvestmentTaxLaw(...args);}
function openForeignInvestmentTaxLaw(...args){return legacyOpenForeignInvestmentTaxLaw(...args);}

function validateForeignInvestments(st){
    const db=st.foreignInvestments;if(!db)return legacyValidateForeignInvestments(st);
    if(db.version!==3)return legacyValidateForeignInvestments(st);
    if(!Array.isArray(db.campaigns)||!Array.isArray(db.offers))throw Error('Regjistri i kontratave të mëparshme është i pavlefshëm.');
    legacyValidateForeignInvestments({...st,foreignInvestments:{version:2,lastTurn:db.lastTurn,revision:fdiLegacyRevision(db),campaigns:db.campaigns,offers:db.offers}});
    const fail=()=>{throw Error('Regjistri Attract & Reveal është i pavlefshëm.');},integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max,ids=new Set(),paid=new Set(),lawIds=new Set(),reserved=new Set();let actions=fdiLegacyRevision(db);
    if(!Array.isArray(db.attractionCampaigns)||!Array.isArray(db.bidders)||!db.stability||!integer(db.stability.weeks,0,st.turnCount)||typeof db.stability.key!=='string'||typeof db.stability.riskSignature!=='string')fail();
    function payment(id,cost,turn,kind){const r=st.publicFinance.ledger.find(r=>r.id===id);if(!r||paid.has(id)||r.turn!==turn||r.type!==kind||r.account!=='budgetTotalB'||!r.source.startsWith(kind==='EXPENSE'?'IHD: fushatë tërheqjeje':'IHD: infrastrukturë për')||Math.abs(r.amountB+cost)>1e-8)fail();paid.add(id);}
    function metrics(m){if(!m||Object.keys(m).length!==7||['sec_edu','sec_police','sec_tech','sec_roads','sec_energy','sec_agri','sec_health'].some(k=>!Number.isFinite(m[k])||m[k]<1||m[k]>10))fail();}
    db.attractionCampaigns.forEach((c,n)=>{
        const d=c.draw;if(c.id!=='attract-campaign:'+n||!integer(c.startTurn,0,st.turnCount)||c.dueTurn!==c.startTurn+3||!['ACTIVE','COMPLETED','CANCELLED'].includes(c.status)||!d||!(d.focus==='AUTO'||Object.hasOwn(FDI_FAMILIES,d.focus))||!integer(d.stableWeeks,0,c.startTurn)||!Array.isArray(d.excluded)||new Set(d.excluded).size!==d.excluded.length||d.excluded.some(id=>!fdiInvestor(id))||![d.legendRoll,d.sampleRoll].every(v=>Number.isFinite(v)&&v>=0&&v<1))fail();metrics(d.metrics);
        if(!fdiPools(d.focus,d.metrics,d.stableWeeks,d.excluded).normal.length||fdiDrawInvestor(d)?.id!==c.investorId)fail();payment(c.paymentId,.0005,c.startTurn,'EXPENSE');actions++;
        if(c.revealedTurn!==undefined&&(c.status!=='COMPLETED'||!integer(c.revealedTurn,c.dueTurn,st.turnCount)||c.revealedTurn>c.dueTurn&&!(typeof securityFDIDelayCovered==='function'&&securityFDIDelayCovered(st,c.dueTurn,c.revealedTurn))))fail();const count=db.bidders.filter(b=>b.campaignId===c.id).length;if(c.status==='COMPLETED'?count!==1||st.turnCount<c.dueTurn:count!==0)fail();if(c.status==='CANCELLED'&&!(typeof validIsolationCancellation==='function'&&validIsolationCancellation(st,c))&&(fdiInvestor(c.investorId).tier!==4||st.turnCount<c.dueTurn))fail();
    });
    db.bidders.forEach(b=>{
        const c=db.attractionCampaigns.find(c=>c.id===b.campaignId),i=fdiInvestor(b.investorId),started=b.startTurn!==null,signed=b.signedTurn!==null;
        if(!c||c.status!=='COMPLETED'||b.id!=='mystery:'+Number(c.id.split(':')[1])||ids.has(b.id)||!i||i.id!==c.investorId||b.createdTurn!==(c.revealedTurn??c.dueTurn)||b.expiresTurn!==b.createdTurn+6||!['HIDDEN','NEGOTIATING','SIGNED','COMPLETED','FAILED','REJECTED','EXPIRED'].includes(b.status)||b.revealed!==signed||!integer(b.lastTurn,b.createdTurn,st.turnCount)||!integer(b.infrastructureElapsed,0,i.publicWeeks)||!integer(b.stableWeeks,0,i.stableWeeks)||!integer(b.executionElapsed,0,i.executionWeeks)||!Array.isArray(b.taxLawIds)||new Set(b.taxLawIds).size!==b.taxLawIds.length)fail();ids.add(b.id);
        if(!['FAILED','REJECTED','EXPIRED'].includes(b.status)){if(reserved.has(i.id))fail();reserved.add(i.id);}
        if(started){if(!['NEGOTIATING','SIGNED','COMPLETED','FAILED'].includes(b.status)||!integer(b.startTurn,b.createdTurn,b.expiresTurn)||b.startTurn>st.turnCount||b.deadlineTurn!==b.startTurn+i.deadline||!integer(b.protestBaseline,0,st.streetProtests?.counter??-1)||typeof b.governmentKey!=='string'||!Array.isArray(b.scandalBaseline)||b.scandalBaseline.some(id=>typeof id!=='string')||!Number.isFinite(b.arrearsAtStartB)||b.arrearsAtStartB<0)fail();payment(b.paymentId,i.cofinanceB,b.startTurn,'CAPITAL_PAYMENT');actions++;}
        else if(b.paymentId!==null||b.deadlineTurn!==null||b.infrastructureStartedTurn!==null||b.infrastructureElapsed||b.stableWeeks||b.taxLawIds.length||signed||b.executionElapsed||!['HIDDEN','REJECTED','EXPIRED'].includes(b.status))fail();
        if(b.infrastructureStartedTurn!==null){if(!started||!integer(b.infrastructureStartedTurn,b.startTurn,Math.min(st.turnCount,b.deadlineTurn))||b.infrastructureElapsed>b.lastTurn-b.infrastructureStartedTurn+rogueExtraWork(st,'BIDDER|'+b.id,'INFRA'))fail();actions++;}else if(b.infrastructureElapsed)fail();
        b.taxLawIds.forEach(id=>{const l=st.laws.find(l=>l.id===id);if(!started||!i.lawRequired||!l||lawIds.has(id)||l.fdiBidderId!==b.id||l.fdiTaxRelief!==i.relief||l.majorityType!=='SIMPLE_61'||l.requiredVotes!==61)fail();lawIds.add(id);actions++;});if(b.taxLawId!==(b.taxLawIds.at(-1)||null))fail();
        if(signed){metrics(b.signedMetrics);if(!['SIGNED','COMPLETED','FAILED'].includes(b.status)||!started||!integer(b.signedStableWeeks,0,b.signedTurn)||!integer(b.signedTurn,b.startTurn+i.stableWeeks,Math.min(st.turnCount,b.deadlineTurn))||b.infrastructureElapsed!==i.publicWeeks||!bidderTaxLawPassed(b,st)||b.stableWeeks!==i.stableWeeks||!fdiBidderSectorReady(i,b.signedMetrics)||i.tier===4&&!fdiLegendEligible(b.signedMetrics,b.signedStableWeeks,i)||b.executionDeadlineTurn!==b.signedTurn+i.executionWeeks+4||b.executionElapsed>b.lastTurn-b.signedTurn+rogueExtraWork(st,'BIDDER|'+b.id,'EXECUTION'))fail();actions++;}
        else if(b.signedMetrics!==null||b.signedStableWeeks!==null||b.executionDeadlineTurn!==null||b.executionElapsed||b.status==='SIGNED'||b.status==='COMPLETED')fail();
        if(b.rejectedTurn!==null){if(b.status!=='REJECTED'||started||!integer(b.rejectedTurn,b.createdTurn,st.turnCount))fail();actions++;}else if(b.status==='REJECTED')fail();
        if(b.status==='EXPIRED'&&st.turnCount<=b.expiresTurn)fail();
        if(b.status==='COMPLETED'){if(!b.outcomeApplied||!signed||b.executionElapsed!==i.executionWeeks||!integer(b.completedTurn,b.signedTurn+i.executionWeeks-rogueExtraWork(st,'BIDDER|'+b.id,'EXECUTION'),Math.min(st.turnCount,b.executionDeadlineTurn))||b.lastTurn!==b.completedTurn||b.failedTurn!==null||b.failureReason!==null)fail();}
        else if(b.status==='FAILED'){if(!b.outcomeApplied||!started||!integer(b.failedTurn,b.startTurn+1,st.turnCount)||b.lastTurn!==b.failedTurn||typeof b.failureReason!=='string'||!b.failureReason||b.completedTurn!==null)fail();}
        else if(b.outcomeApplied||b.completedTurn!==null||b.failedTurn!==null||b.failureReason!==null||b.approvalBefore!==null||b.approvalAfter!==null)fail();
        if(b.outcomeApplied&&(!Number.isFinite(b.approvalBefore)||b.approvalBefore<0||b.approvalBefore>100||b.approvalAfter!==fdiApprovalTarget(b.approvalBefore,b.status==='COMPLETED',i)&&!rtkApprovalMatches(st,b.approvalBefore,b.approvalAfter,fdiApprovalTarget(b.approvalBefore,b.status==='COMPLETED',i)-b.approvalBefore,b.status==='COMPLETED'?b.completedTurn:b.failedTurn)))fail();
    });if(db.revision!==actions||db.attractionCampaigns.filter(c=>c.status==='ACTIVE').length>1)fail();
}

function fdiBidderCard(b,db){
    const i=fdiInvestor(b.investorId),f=FDI_FAMILIES[i.family],e=catalogEscape,metrics=fdiDevelopment(state),negotiating=b.status==='NEGOTIATING',hidden=b.status==='HIDDEN',law=state.laws.find(l=>l.id===b.taxLawId),reason=negotiating?bidderSigningReason(b,state):'';
    const minimum=n=>n>8&&n<8.1?'mbi 8':n;
    let html='<article class="card fdi-mega-card fdi-status-'+b.status.toLowerCase()+'" data-bidder="'+b.id+'"><div class="fdi-company-heading"><span class="fdi-company-icon" aria-hidden="true">'+(b.revealed?f.icon:'❓')+'</span><div><span class="fdi-eyebrow">'+(b.revealed?'Tier '+i.tier+' · '+e(i.country):'Identitet i pazbuluar')+'</span><h3>'+e(fdiBidderTitle(b))+'</h3></div><span class="tag">'+({HIDDEN:'Profil anonim',NEGOTIATING:'Negociatë',SIGNED:'Nënshkruar',COMPLETED:'Realizuar',FAILED:'Dështuar',REJECTED:'Refuzuar',EXPIRED:'Skaduar'})[b.status]+'</span></div>';
    if(!b.revealed)html+='<p>'+e(f.anonymous)+'</p><p>Emri, projekti i saktë dhe përfitimet zbulohen vetëm pasi të plotësoni kushtet dhe të nënshkruani marrëveshjen.</p>';
    else html+='<div class="fdi-project-metrics"><div><span>Kapital privat</span><strong>'+fdiMoney(i.capitalB)+'</strong></div><div><span>Punë pas realizimit</span><strong>+'+i.jobs.toLocaleString('sq-AL')+'</strong></div><div><span>Tatim neto / javë</span><strong>+'+fdiExactMoney(i.weeklyTaxB)+'</strong></div></div><p>'+e(i.project)+'. Lehtësimi '+Math.round(i.relief*100)+'% është përfshirë në tatimin neto. Përfitimet fillojnë pas '+i.executionWeeks+' javëve të realizimit privat.</p>';
    html+='<div class="fdi-requirements"><p><strong>Kushtet e profilit</strong><br>Bashkëfinancim '+fdiMoney(i.cofinanceB)+' · Punime publike '+i.publicWeeks+' javë · Garanci stabiliteti '+i.stableWeeks+' javë.<br>Arsim: '+minimum(i.education)+' yje · Siguri: '+minimum(i.security)+' yje · '+e(state.stateSectors.find(s=>s.id===f.primary)?.name.replace(/^\d+\.\s*/,''))+' ≥'+i.primary+' yje.<br>'+(i.lawRequired?'Ligj i lehtësirave '+Math.round(i.relief*100)+'%, i miratuar me 61 vota.':'Nuk kërkohet ligj i posaçëm lehtësirash.')+'</p></div>';
    if(hidden)html+='<p>Profili pret vendim edhe '+Math.max(0,b.expiresTurn-state.turnCount)+' javë. Bashkëfinancimi i paguar nuk kthehet në rast dështimi.</p><div class="candidate-actions"><button class="action-btn btn-gold" onclick="startBidderNegotiation(\''+b.id+'\','+db.revision+')">Hap negociatën · '+fdiMoney(i.cofinanceB)+'</button><button class="btn-top" onclick="rejectMysteryBidder(\''+b.id+'\','+db.revision+')">Refuzo profilin</button></div>';
    if(negotiating){
        html+='<div class="fdi-conditions">'+fdiCondition('Infrastruktura publike',b.infrastructureElapsed,i.publicWeeks,b.infrastructureStartedTurn===null?'Duhet nisur nga lojtari.':'Bashkëfinancimi është paguar.')+fdiCondition('Stabiliteti',b.stableWeeks,i.stableWeeks,'Protesta, skandali ose detyrimet e reja e prishin garancinë.')+fdiCondition('Ligji i lehtësirave',bidderTaxLawPassed(b,state)?1:0,1,i.lawRequired?(law?.status||'Duhet përgatitur.'):'Pa kusht ligjor të posaçëm.')+'</div><p class="fdi-sector-check">Cilësia e zbatuar tani: Arsim '+metrics.sec_edu.toFixed(1)+' · Siguri '+metrics.sec_police.toFixed(1)+' · Sektori përkatës '+metrics[f.primary].toFixed(1)+' yje.</p><p class="fdi-deadline">'+Math.max(0,b.deadlineTurn-state.turnCount)+' javë të mbetura · '+e(diplomaticDate(b.deadlineTurn))+'</p><div class="candidate-actions">'+(b.infrastructureStartedTurn===null?'<button class="btn-top" onclick="startBidderInfrastructure(\''+b.id+'\','+db.revision+')">Nis punimet publike</button>':'')+(i.lawRequired&&!bidderTaxLawPassed(b,state)&&(!law||['FAILED','WITHDRAWN','ANNULLED'].includes(law.status))?'<button class="btn-top" onclick="proposeBidderTaxLaw(\''+b.id+'\','+db.revision+')">Përgatit ligjin e lehtësirave</button>':'')+(law?'<button class="btn-top" onclick="openBidderTaxLaw(\''+b.id+'\')">Hap ligjin</button>':'')+'<button class="action-btn btn-gold" data-sign-bidder="'+b.id+'" '+(reason?'disabled':'')+' onclick="signMysteryBidder(\''+b.id+'\','+db.revision+')">Nënshkruaj Marrëveshjen</button></div>'+(reason?'<p class="fdi-warning">'+e(reason)+'</p>':'<p class="fdi-success">Kushtet janë plotësuar. Nënshkrimi zbulon kompaninë.</p>');
    }
    if(b.status==='SIGNED')html+='<progress max="'+i.executionWeeks+'" value="'+b.executionElapsed+'" aria-label="Ndërtimi i investimit privat"></progress><p>Realizimi privat: '+b.executionElapsed+' / '+i.executionWeeks+' javë. Tatimet dhe punësimi nuk janë aktivizuar ende.</p>';
    if(b.status==='COMPLETED')html+='<p class="fdi-success">Investimi është realizuar. Kapitali dhe punësimi janë regjistruar një herë; tatimet neto arkëtohen çdo javë.</p>';
    if(b.status==='FAILED')html+='<p class="fdi-warning">'+e(b.failureReason)+' Bashkëfinancimi nuk kthehet. Mbështetja: '+(b.approvalAfter-b.approvalBefore).toFixed(1)+' pikë.</p>';
    return html+'</article>';
}
function renderForeignInvestments(){
    const host=document.getElementById('foreignInvestmentsPanel');if(!host||!state)return;const db=state.foreignInvestments,e=catalogEscape;
    if(!db){host.innerHTML='<h2>IHD · Tërheqje dhe Zbulim</h2><p>Tërhiqni profile anonime sipas zhvillimit të shtetit. Plotësoni kushtet dhe zbuloni investitorin në nënshkrim.</p><button class="action-btn" onclick="enableForeignInvestments()">Aktivizo agjencinë</button>';return;}
    const bidders=db.bidders||[],metrics=fdiDevelopment(state),totals=fdiMegaTotals(state),weeks=db.stability?.weeks||0,excluded=fdiExcluded(state);
    host.innerHTML='<h2>IHD · Tërheqje dhe Zbulim</h2><p>Kompanitë rajonale dhe evropiane përbëjnë grupin normal të investitorëve. Mundësia Legendary është 5% vetëm kur plotësohen kriteret për atë profil. Yjet maten nga cilësia e zbatuar, jo nga planet e pafinancuara.</p><div class="fdi-project-metrics"><div><span>Kapital i realizuar</span><strong>'+fdiMoney(totals.capitalB)+'</strong></div><div><span>Punë të krijuara</span><strong>'+totals.jobs.toLocaleString('sq-AL')+'</strong></div><div><span>Tatime IHD / javë</span><strong>'+fdiExactMoney(foreignInvestmentAnnualTax(state)/FISCAL_WEEKS)+'</strong></div></div><p>Arsim '+metrics.sec_edu.toFixed(1)+' ⭐ · Siguri '+metrics.sec_police.toFixed(1)+' ⭐ · IT '+metrics.sec_tech.toFixed(1)+' ⭐ · Infrastrukturë '+metrics.sec_roads.toFixed(1)+' ⭐ · Stabilitet '+weeks+' javë.</p><p class="fdi-legend-gate">Për profil global: Arsim dhe Siguri mbi 8 yje, sektori përkatës ≥8 dhe së paku 4 javë stabilitet politik. Plotësimi hap vetëm mundësinë e shortit 5%.</p>';
    host.innerHTML+='<section class="card fdi-campaign"><h3>Fushatë tërheqjeje</h3><label>Drejtimi<select id="fdiCampaignType"><option value="AUTO">Të gjithë sektorët e kualifikuar</option>'+Object.entries(FDI_FAMILIES).map(([key,f])=>'<option value="'+key+'" '+(!fdiPools(key,metrics,weeks,excluded).normal.length?'disabled':'')+'>'+e(f.label)+'</option>').join('')+'</select></label><button class="action-btn" '+((db.attractionCampaigns||[]).some(c=>c.status==='ACTIVE')||bidders.filter(b=>['HIDDEN','NEGOTIATING','SIGNED'].includes(b.status)).length>=4?'disabled':'')+' onclick="startForeignInvestmentCampaign('+db.revision+',document.getElementById(\'fdiCampaignType\').value)">Tërhiq profile · €0.50M · 3 javë</button><p>Identiteti ruhet në nisje dhe nuk ndryshon me ngarkimin e lojës. Deri në 4 profile/kontrata njëkohësisht.</p>'+((db.attractionCampaigns||[]).filter(c=>c.status==='ACTIVE').map(c=>'<p>Fushata në zhvillim · '+Math.max(0,c.dueTurn-state.turnCount)+' javë të mbetura.</p>').join(''))+'</section>';
    const live=bidders.filter(b=>['HIDDEN','NEGOTIATING','SIGNED'].includes(b.status)),history=bidders.filter(b=>!['HIDDEN','NEGOTIATING','SIGNED'].includes(b.status));
    host.innerHTML+='<section id="fdiActiveMegaProjects"><h3>Profilet dhe marrëveshjet aktive ('+live.length+')</h3>'+(live.length?live.map(b=>fdiBidderCard(b,db)).join(''):'<p>Nisni një fushatë për të tërhequr profile anonime.</p>')+'</section>';
    if(history.length)host.innerHTML+='<details class="card"><summary>Historia e profileve ('+history.length+')</summary>'+history.slice().reverse().map(b=>fdiBidderCard(b,db)).join('')+'</details>';
    if(db.offers.length||db.campaigns.length)host.innerHTML+='<details class="card fdi-legacy-contracts"><summary>Kontratat e mëparshme · kushte të ruajtura</summary>'+db.campaigns.filter(c=>c.status==='ACTIVE').map(c=>'<p>Fushatë e mëparshme · '+Math.max(0,c.dueTurn-state.turnCount)+' javë deri te oferta.</p>').join('')+db.offers.map(o=>FDI_TYPES[o.type].mega?fdiMegaCard(o,db):'<article class="card"><h3>'+e(FDI_TYPES[o.type].title)+'</h3><p>'+e(o.status)+' · '+o.elapsed+'/'+FDI_TYPES[o.type].weeks+' javë</p>'+(o.status==='OFFERED'?'<button class="action-btn" onclick="decideForeignInvestment(\''+o.id+'\',true,'+db.revision+')">Prano kontratën e mëparshme</button><button class="btn-top" onclick="decideForeignInvestment(\''+o.id+'\',false,'+db.revision+')">Refuzo</button>':'')+'</article>').join('')+'</details>';
}
