const DIASPORA_LAWS={BORDER:{title:'Mbulimi i Policisë Kufitare për Mërgatën',costB:.012,sector:'sec_police'},EMBASSIES:{title:'Votimi në Ambasada për Diasporën',costB:.008,sector:'sec_justice'}};
function migrateDiaspora(st){if(st.diaspora===undefined)st.diaspora={version:1,lastTurn:st.turnCount,baseRemittancesB:st.remittancesB,shockFactor:1,shockUntil:0,shockCooldownUntil:0,shocks:[],overloads:[]};migrateDiasporaMobilization(st);}
function diasporaSummer(st){var week=st.monthIndex*4+st.week;return week>=20&&week<=28;}
function diasporaResilience(st){var d=st.diaspora;return !d?1:st.turnCount<=d.shockUntil?d.shockFactor:1;}
function diasporaLossMultiplier(st){return 1-.45*diasporaResilience(st)*clamp((st.unemployment-15)/15,0,1);}
function applyGlobalDiasporaShock(severity,weeks){
    if(!Number.isFinite(severity)||severity<=0||severity>1||!Number.isInteger(weeks)||weeks<1||weeks>48)return false;migrateDiaspora(state);var d=state.diaspora;
    d.shockFactor=1-severity;d.shockUntil=state.turnCount+weeks;d.shockCooldownUntil=d.shockUntil+12;state.remittancesB=fiscalRound(d.baseRemittancesB*d.shockFactor);d.shocks.push({turn:state.turnCount,until:d.shockUntil,factor:d.shockFactor});return true;
}
function diasporaVATBonus(st){
    if(!diasporaSummer(st))return 0;var vat=Math.max(0,st.taxRevenueB)*.45;
    if(economicPilotActive(st)){var p=st.economicPilot;vat=economicTaxCalculation(st,p.effectiveRates,economicActivity(p),p.wageIndex,100-st.unemployment).components.vat;}
    return Math.max(0,vat)*.2;
}
function processDiasporaWeek(turn){
    migrateDiaspora(state);var d=state.diaspora;if(turn<=d.lastTurn)return;d.lastTurn=turn;processDiasporaMobilizationWeek();
    if(turn>d.shockUntil)state.remittancesB=d.baseRemittancesB;
    if(turn>d.shockCooldownUntil&&Math.random()<.01){applyGlobalDiasporaShock(.5,8);state.historyLog.unshift('Kriza globale uli remitancat e familjeve për 8 javë.');}
    if(diasporaSummer(state)&&(sectorManagementAverage(state,'sec_roads')<6||sectorManagementAverage(state,'sec_health')<6)){
        crisisApproval(-3);d.overloads.push(turn);state.historyLog.unshift('Kolaps nga Mbingarkesa: Infrastruktura ose Shëndetësia ka më pak se 6 yje. Mbështetja ra me deri 3 pikë.');
    }
}
function proposeDiasporaLaw(kind){
    var spec=DIASPORA_LAWS[kind];if(!spec||!agendaExecutive()||legislativeCampaignClosed())return false;
    return governmentCrisisCommit(function(){if(state.laws.some(l=>l.diasporaLaw?.kind===kind&&!['FAILED','WITHDRAWN'].includes(l.status)))throw Error('Kjo pako është miratuar ose është në procedurë.');
        var l={id:'diaspora-law:'+(++state.billCounter),title:spec.title,desc:'Pako e simuluar për diasporën; financimi i zbatimit kërkon '+enterpriseMoney(spec.costB)+'.',proposer:'Qeveria e Kosovës',ministry:'Ministria e Punëve të Brendshme',sector:spec.sector,costB:spec.costB,duration:4,approvalEffect:0,status:'DRAFT',supportParties:[state.playerParty],voteHistory:[],stageHistory:[],applied:false,diasporaLaw:{kind,owner:state.playerParty}};
        initializeCatalogBill(l);state.laws.push(l);
    });
}
function freezeDiasporaPolicy(st,manifest){
    var partyId=manifest.parties.some(p=>p.partyId===st.playerParty)?st.playerParty:manifest.parties[0].partyId;var ids=st.laws.filter(l=>l.status==='PASSED'&&partyId===st.playerParty&&l.diasporaLaw?.owner===st.playerParty&&l.applied&&l.implementation&& !courtLawFrozen(l,st)).map(l=>l.id).sort();
    return {partyId:partyId,lawIds:ids,bonus:manifest.embassyMobilization?0:ids.length?3+electionSeed(manifest.cycleId+':diaspora:'+ids.join(','))%3:0};
}
function advanceDiasporaCount(cycle,domesticAlreadyComplete){
    if(!cycle.manifest.diasporaPolicy)return true;
    if(!cycle.diasporaCount)cycle.diasporaCount={progress:0,counted:false};var d=cycle.diasporaCount;
    if(domesticAlreadyComplete)d.progress=Math.min(100,d.progress+25);d.counted=d.progress===100;return d.counted;
}
function applyDiasporaSeatBonus(seats,reserved,cycle,parties,eligible){
    var policy=cycle.manifest?.diasporaPolicy;if(!policy||!cycle.diasporaCount?.counted||!policy.bonus)return {awarded:0,partyId:policy?.partyId||null};
    var own=parties.find(p=>p.partyId===policy.partyId);if(!own||!eligible.some(p=>p.partyId===own.partyId))return {awarded:0,partyId:policy.partyId};
    var awarded=0;for(var i=0;i<policy.bonus&&seats[own.partyId]<own.candidates.length;i++){
        var donors=eligible.filter(p=>p.partyId!==own.partyId&&seats[p.partyId]>(reserved[p.partyId]||0)).sort((a,b)=>(seats[b.partyId]-(reserved[b.partyId]||0))-(seats[a.partyId]-(reserved[a.partyId]||0))||a.partyId.localeCompare(b.partyId));if(!donors.length)break;seats[donors[0].partyId]--;seats[own.partyId]++;awarded++;
    }return {awarded,partyId:own.partyId};
}
function validateDiaspora(st){
    var d=st.diaspora;if(d===undefined)return;var bad=()=>{throw Error('Të dhënat e diasporës janë të pavlefshme.');};
    if(!d||d.version!==1||!Number.isInteger(d.lastTurn)||d.lastTurn>st.turnCount||d.lastTurn<0||!Number.isFinite(d.baseRemittancesB)||d.baseRemittancesB<0||!Number.isFinite(d.shockFactor)||d.shockFactor<0||d.shockFactor>1||!Number.isInteger(d.shockUntil)||!Number.isInteger(d.shockCooldownUntil)||!Array.isArray(d.shocks)||!Array.isArray(d.overloads)||new Set(d.overloads).size!==d.overloads.length||d.overloads.some(t=>!Number.isInteger(t)||t<0||t>st.turnCount))bad();
    d.shocks.forEach(s=>{if(!Number.isInteger(s.turn)||s.turn>st.turnCount||!Number.isInteger(s.until)||s.until<=s.turn||s.until>s.turn+48||!Number.isFinite(s.factor)||s.factor<0||s.factor>=1)bad();});
    st.laws.forEach(l=>{if(l.diasporaLaw&&(!DIASPORA_LAWS[l.diasporaLaw.kind]||!st.parties[l.diasporaLaw.owner]||l.costB!==DIASPORA_LAWS[l.diasporaLaw.kind].costB))bad();});
    (st.parliamentaryElections||[]).forEach(c=>{var p=c.manifest?.diasporaPolicy;if(!p)return;if(!c.manifest.parties.some(x=>x.partyId===p.partyId)||!Array.isArray(p.lawIds)||new Set(p.lawIds).size!==p.lawIds.length||p.lawIds.some(id=>!st.laws.some(l=>l.id===id&&l.diasporaLaw?.owner===p.partyId&&l.status==='PASSED'))||p.bonus!==(c.manifest.embassyMobilization?0:p.lawIds.length?3+electionSeed(c.manifest.cycleId+':diaspora:'+p.lawIds.join(','))%3:0))bad();var count=c.diasporaCount;if(count&&(![0,25,50,75,100].includes(count.progress)||count.counted!==(count.progress===100)||count.progress>0&&c.countingProgress!==100)||c.status==='RESULTS'&&!count?.counted)bad();});
}
function renderDiaspora(){var host=document.getElementById('diasporaPanel');if(!host)return;var e=catalogEscape,summer=diasporaSummer(state);host.innerHTML=diasporaMandateSummary(state)+'<h3>🌍 Mërgata</h3><p>'+ (summer?'Fluksi i Verës: +20% arkëtime nga pjesa e TVSH-së/konsumit.':'Remitancat mbështesin familjet; nuk derdhen drejtpërdrejt në arkën e shtetit.')+'</p>'+(summer&&(sectorManagementAverage(state,'sec_roads')<6||sectorManagementAverage(state,'sec_health')<6)?'<p class="crisis-warning">Kolaps nga Mbingarkesa: duhen ≥6 yje në Infrastrukturë dhe Shëndetësi për ta ndalur humbjen javore të mbështetjes.</p>':'')+Object.entries(DIASPORA_LAWS).map(([k,s])=>{var l=state.laws.find(l=>l.diasporaLaw?.kind===k&&!['FAILED','WITHDRAWN'].includes(l.status));return '<article><strong>'+e(s.title)+'</strong><p>'+enterpriseMoney(s.costB)+' · '+(l?e(getBillStatusLabel(l.status)):'Pa propozim')+'</p>'+(l?'<button class="action-btn" onclick="catalogBillDetails('+state.laws.indexOf(l)+')">Hap në Kuvend</button>':agendaExecutive()?'<button class="action-btn" onclick="proposeDiasporaLaw(\''+k+'\')">Përgatit ligjin</button>':'')+'</article>';}).join('');}
