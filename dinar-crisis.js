/* Fictional financial-sovereignty scenario, using existing KiE and North crises. */
function migrateDinarCrisis(st){if(st.dinarCrisis===undefined)st.dinarCrisis={version:1,lastTurn:st.turnCount,terms:[],events:[]};}
function pendingDinarCrisis(st){return agendaExecutive(st)&&st.dinarCrisis?.events.find(e=>e.choice===null&&e.governmentKey===crisisGovernmentKey(st))||null;}
function dinarIPABlocked(st){return !!st.dinarCrisis?.events.some(e=>e.choice==='POLICE'&&st.turnCount>=e.decisionTurn&&st.turnCount<e.ipaUntil);}
function openDinarCrisis(){
    var d=state.dinarCrisis,key=crisisGovernmentKey(state);if(!agendaExecutive(state)||d.events.some(e=>e.governmentKey===key))return false;
    d.events.push({id:'dinar:'+d.events.length,governmentKey:key,cycle:deputyCycleId(state),owner:state.playerParty,openedTurn:state.turnCount,choice:null,decisionTurn:null,pressureBefore:null,pressureAfter:null,paidB:0,arrearsB:0,receipt:null,ipaUntil:null,transitionUntil:null,chainDue:null,chainRoll:null,chainStatus:null,northId:null});
    state.historyLog.unshift('Sovraniteti Financiar · skenar i simuluar: Banka Qendrore ndalon dinarin; KFOR-i dhe QUINT-i kërkojnë tërheqje urgjente.');return true;
}
function processDinarWeek(turn){
    migrateDinarCrisis(state);var d=state.dinarCrisis;if(turn<=d.lastTurn)return;d.lastTurn=turn;
    d.events.filter(e=>e.choice===null&&e.governmentKey!==crisisGovernmentKey(state)).forEach(e=>{e.choice='EXPIRED';e.decisionTurn=turn;});
    d.events.filter(e=>e.choice==='POLICE'&&['WAITING','QUEUED'].includes(e.chainStatus)&&turn>=e.chainDue).forEach(e=>{
        if(e.governmentKey!==crisisGovernmentKey(state)||!agendaExecutive(state)){e.chainStatus='EXPIRED';return;}
        if(e.chainRoll===null){e.chainRoll=Math.random();e.chainStatus=e.chainRoll<.5?'QUEUED':'AVOIDED';}
        if(e.chainStatus!=='QUEUED')return;
        var old=northLastOperation(state);
        if(old&&['PENDING','HOLD'].includes(old.status)){e.northId=old.id;e.chainStatus='LINKED';return;}
        if(governmentCrisisPending(state)||activeSecurityCrisis(state)||old&&turn<old.decisionTurn+12)return;
        e.northId=beginNorthBarricades('DINAR:'+e.id);e.chainStatus='TRIGGERED';
    });
    if(!agendaExecutive(state))return;
    var key=crisisGovernmentKey(state),term=d.terms.find(t=>t.governmentKey===key);
    if(!term){term={governmentKey:key,createdTurn:turn,dueTurn:Math.max(turn+1,(Number.isInteger(state.governmentApprovalWeek)?state.governmentApprovalWeek:turn)+84+electionSeed('dinar:'+key)%25)};d.terms.push(term);}
    if(turn>=term.dueTurn&&!governmentCrisisPending(state))openDinarCrisis();
}
function resolveDinarCrisis(choice){if(!['POLICE','TRANSITION','COUNCIL'].includes(choice))return false;return governmentCrisisCommit(function(){
    var e=pendingDinarCrisis(state);if(!e||choice==='COUNCIL'&&!councilMember(state))throw Error('Vendimi kërkon krizë aktive dhe, për mburojën, anëtarësim aktiv në KiE.');
    e.choice=choice;e.decisionTurn=state.turnCount;e.pressureBefore=state.internationalPressure;
    if(choice==='POLICE'){
        crisisApproval(25);state.internationalPressure=Math.min(100,state.internationalPressure+40);
        e.paidB=fiscalRound(Math.min(.015,Math.max(0,state.budgetTotalB)));e.arrearsB=fiscalRound(.015-e.paidB);
        if(e.paidB){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-e.paidB),'Sanksioni IPA për dinarin: '+e.id,'EXPENSE');e.receipt=state.publicFinance.ledger.at(-1).id;}
        state.publicFinance.arrearsB=fiscalRound(state.publicFinance.arrearsB+e.arrearsB);e.ipaUntil=state.turnCount+12;e.chainDue=state.turnCount+1;e.chainStatus='WAITING';
        recordLeakRisk('POLICE','dinar:'+e.id,'mpb');
    }
    if(choice==='TRANSITION'){crisisApproval(-20);state.internationalPressure=Math.max(0,state.internationalPressure-20);e.transitionUntil=state.turnCount+24;recordCrisisPressEvent('LAW',e.id,'Opozita akuzon qeverinë për tërheqjen nga ndalimi i dinarit','sec_econ');}
    if(choice==='COUNCIL')crisisApproval(15);
    e.pressureAfter=state.internationalPressure;state.historyLog.unshift('Ndalimi i dinarit: '+({POLICE:'policia konfiskon furgonat; +25 mbështetje, +40 presion, €15M sanksion dhe ngrirje IPA 12 javë',TRANSITION:'tranzicion gjashtëmujor; −20 mbështetje, −20 presion',COUNCIL:'mburoja e KiE; +15 mbështetje pa penallti të reja'})[choice]);
});}
function validateDinarCrisis(st){
    var d=st.dinarCrisis;if(d===undefined)return;function bad(){throw Error('Kriza e dinarit është e pavlefshme.');}var turn=n=>Number.isInteger(n)&&n>=0&&n<=st.turnCount;
    if(d.version!==1||!turn(d.lastTurn)||!Array.isArray(d.terms)||!Array.isArray(d.events)||d.events.filter(e=>e.choice===null).length>1)bad();
    var keys=new Set();d.terms.forEach(t=>{if(typeof t.governmentKey!=='string'||keys.has(t.governmentKey)||!turn(t.createdTurn)||!Number.isInteger(t.dueTurn)||t.dueTurn<=t.createdTurn)bad();keys.add(t.governmentKey);});keys=new Set();
    d.events.forEach((e,i)=>{
        if(e.id!=='dinar:'+i||typeof e.governmentKey!=='string'||keys.has(e.governmentKey)||typeof e.cycle!=='string'||!st.parties[e.owner]||!turn(e.openedTurn)||![null,'POLICE','TRANSITION','COUNCIL','EXPIRED'].includes(e.choice)||!Number.isFinite(e.paidB)||e.paidB<0||!Number.isFinite(e.arrearsB)||e.arrearsB<0)bad();keys.add(e.governmentKey);
        if(e.choice===null?e.decisionTurn!==null:!turn(e.decisionTurn)||e.decisionTurn<e.openedTurn)bad();
        if(['POLICE','TRANSITION','COUNCIL'].includes(e.choice)){var expected=e.choice==='POLICE'?Math.min(100,e.pressureBefore+40):e.choice==='TRANSITION'?Math.max(0,e.pressureBefore-20):e.pressureBefore;if(!Number.isFinite(e.pressureBefore)||e.pressureBefore<0||e.pressureBefore>100||e.pressureAfter!==expected)bad();}else if(e.pressureBefore!==null||e.pressureAfter!==null)bad();
        if(e.choice==='POLICE'){
            if(Math.abs(e.paidB+e.arrearsB-.015)>1e-9||e.ipaUntil!==e.decisionTurn+12||e.chainDue!==e.decisionTurn+1||!['WAITING','QUEUED','AVOIDED','LINKED','TRIGGERED','EXPIRED'].includes(e.chainStatus))bad();
            if(e.paidB){var r=st.publicFinance.ledger.find(r=>r.id===e.receipt);if(!r||r.type!=='EXPENSE'||r.turn!==e.decisionTurn||r.source!=='Sanksioni IPA për dinarin: '+e.id||Math.abs(r.amountB+e.paidB)>1e-9)bad();}else if(e.receipt!==null)bad();
            if(e.chainRoll!==null&&(!Number.isFinite(e.chainRoll)||e.chainRoll<0||e.chainRoll>=1)||e.chainStatus==='WAITING'&&e.chainRoll!==null||e.chainStatus==='AVOIDED'&&!(e.chainRoll>=.5)||['QUEUED','TRIGGERED','LINKED'].includes(e.chainStatus)&&!(e.chainRoll!==null&&e.chainRoll<.5))bad();
            if(['TRIGGERED','LINKED'].includes(e.chainStatus)){var o=st.northCrisis.operations.find(o=>o.id===e.northId);if(!o||e.chainStatus==='TRIGGERED'&&(o.dinarSource!=='DINAR:'+e.id||o.startedTurn<e.chainDue))bad();}else if(e.northId!==null)bad();
        }else if(e.paidB||e.arrearsB||e.receipt!==null||e.ipaUntil!==null||e.chainDue!==null||e.chainRoll!==null||e.chainStatus!==null||e.northId!==null)bad();
        if(e.choice==='TRANSITION'?e.transitionUntil!==e.decisionTurn+24:e.transitionUntil!==null)bad();
        if(e.choice==='COUNCIL'&&!councilHistoricallyEligible(st,e.decisionTurn))bad();
    });
}
var dinarRetry=null;
function renderDinarCrisis(){
    var e=pendingDinarCrisis(state),last=state.dinarCrisis?.events.at(-1),host=document.getElementById('dinarCrisisPanel'),dialog=document.getElementById('dinarCrisisDialog');
    if(host)host.innerHTML='<h3>Sovraniteti Financiar · Dinari</h3>'+(last?'<p>'+catalogEscape(({POLICE:'Zbatim policor; tension i lartë dhe ngrirje e IPA-s.',TRANSITION:'Tranzicion gjashtëmujor në fuqi.',COUNCIL:'Vendimi mbrohet përmes KiE.',EXPIRED:'Dosja u arkivua pas ndryshimit të qeverisë.'})[last.choice]||'Kërkohet vendim urgjent.')+'</p>'+(dinarIPABlocked(state)?'<p>IPA e ngrirë edhe '+(Math.max(...state.dinarCrisis.events.map(e=>e.ipaUntil||0))-state.turnCount)+' javë.</p>':''):'<p>Banka Qendrore mund të njoftojë vendimin në mes të mandatit.</p>');
    if(!dialog||typeof dialog.showModal!=='function')return;if(!e){if(dialog.open)dialog.close();return;}
    if(state.pendingVote||weeklyProcessing||weeklyVisualBusy||!document.getElementById('startScreen')?.classList.contains('hidden')||document.querySelector('dialog[open]:not(#dinarCrisisDialog)')){if(dinarRetry===null)dinarRetry=setTimeout(()=>{dinarRetry=null;renderDinarCrisis();},250);return;}
    document.getElementById('dinarCrisisContent').innerHTML='<h2 id="dinarCrisisTitle">Ndalimi i Dinarit · Sovraniteti Financiar</h2><p>Skenar i simuluar: Banka Qendrore ka ndaluar valutat e huaja (Dinarin). KFOR-i dhe QUINT-i kërkojnë tërheqje urgjente, duke paralajmëruar tensione etnike.</p><button class="action-btn" onclick="resolveDinarCrisis(\'POLICE\')">Dërgo Policinë për ta zbatuar · Tension i Lartë</button><p>+25 mbështetje; +40 presion; €15M sanksion dhe IPA e ngrirë 12 javë. Javën tjetër: 50% shans barrikadash. Pasojat ekzistuese të ndërhyrjeve policore mbeten.</p><button class="action-btn" onclick="resolveDinarCrisis(\'TRANSITION\')">Tërhiqu · Krijo Tranzicion 6-Mujor</button><p>−20 presion dhe −20 mbështetje; pa humbje buxhetore.</p><button class="action-btn" '+(!councilMember(state)?'disabled':'')+' onclick="resolveDinarCrisis(\'COUNCIL\')">Përdor Mburojën e KiE · Kërkon Statusin Anëtar</button><p>+15 mbështetje; zero penallti të reja në buxhet ose presion. Sanksionet nga kriza të tjera mbeten.</p>';if(!dialog.open)dialog.showModal();
}
document.addEventListener('DOMContentLoaded',()=>document.getElementById('dinarCrisisDialog')?.addEventListener('cancel',e=>{if(pendingDinarCrisis(state))e.preventDefault();}));
