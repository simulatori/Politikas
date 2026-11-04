/* Fictional survival crisis; every parliamentary seat belongs to the current legislature. */
function migrateCoalitionBlackmail(st){
    if(st.coalitionBlackmail===undefined)st.coalitionBlackmail={version:1,lastTurn:st.turnCount,cooldownUntil:st.turnCount+4,attempts:[],events:[]};
    st.coalitionBlackmail.events.filter(e=>e.choice===null&&(e.governmentKey!==crisisGovernmentKey(st)||!agendaExecutive(st))).forEach(e=>{e.choice='EXPIRED';e.decisionTurn=st.turnCount;});
}
function pendingCoalitionBlackmail(st){return st.coalitionBlackmail?.events.find(e=>e.choice===null&&e.governmentKey===crisisGovernmentKey(st)&&agendaExecutive(st))||null;}
function coalitionBlackmailPartner(st){
    var blocked=specialBlockedSeats(st),available=st.mps.filter(m=>!blocked.has(m.seatNumber)),total=available.filter(m=>st.coalitionParties.includes(m.party)).length;
    if(total<61)return null;
    return st.coalitionParties.filter(p=>p!==st.playerParty).map(p=>({party:p,seats:available.filter(m=>m.party===p).length})).filter(p=>p.seats>0&&total-p.seats<61&&available.filter(m=>!st.coalitionParties.includes(m.party)||m.party===p.party).length>=61).sort((a,b)=>a.seats-b.seats||a.party.localeCompare(b.party))[0]||null;
}
function coalitionBlackmailTry(law){
    migrateCoalitionBlackmail(state);var d=state.coalitionBlackmail,partner=coalitionBlackmailPartner(state);
    if(!agendaExecutive(state)||governmentCrisisPending(state)||state.pendingVote||state.turnCount<d.cooldownUntil||!partner)return false;
    var key=law?JSON.stringify([crisisGovernmentKey(state),law.id,law.version||1]):'week:'+state.turnCount;
    if(d.attempts.some(a=>a.key===key))return false;
    var chance=law?.3:state.budgetTotalB>=.3?.16:.07,roll=Math.random();
    d.attempts.push({key,turn:state.turnCount,chance,roll});
    if(roll>=chance)return false;
    d.events.push({id:'blackmail:'+d.events.length,governmentKey:crisisGovernmentKey(state),owner:state.playerParty,cycle:deputyCycleId(state),partner:partner.party,seats:partner.seats,turn:state.turnCount,lawId:law?.id||null,attemptKey:key,choice:null,decisionTurn:null,receipt:null,pressureBefore:null,pressureAfter:null,dismissed:[],motionId:null});
    state.historyLog.unshift('Kërcënimi i mesnatës · '+state.parties[partner.party].short+' kërkon kontrollin e një mega-tenderi ose Ministrinë e Brendshme. Skenar fiktiv.');
    return true;
}
function coalitionBlackmailGate(law){
    if(!coalitionMajorBill(law)||!coalitionBlackmailPartner(state)||state.turnCount<(state.coalitionBlackmail?.cooldownUntil||0))return false;
    var key=JSON.stringify([crisisGovernmentKey(state),law.id,law.version||1]);if(state.coalitionBlackmail?.attempts.some(a=>a.key===key))return false;
    var opened=false,ok=governmentCrisisCommit(()=>{opened=coalitionBlackmailTry(law);});return !ok||opened;
}
function processCoalitionBlackmailWeek(turn){
    migrateCoalitionBlackmail(state);var d=state.coalitionBlackmail;if(turn<=d.lastTurn)return;d.lastTurn=turn;coalitionBlackmailTry(null);
}
function coalitionBlackmailProtected(law,party){
    if(!agendaExecutive(state)||!(law.proposer||'').startsWith('Qeveria'))return false;
    return !!state.coalitionBlackmail?.events.some(e=>['TENDER','EMBASSIES','PERSONNEL'].includes(e.choice)&&e.partner===party&&(e.lawId===law.id||e.lawId===null&&state.turnCount<e.decisionTurn+12)&&e.governmentKey===crisisGovernmentKey(state));
}
function coalitionBlackmailBallot(law,mp,ballot){return coalitionBlackmailProtected(law,mp.party)&&!specialBlockedSeats(state).has(mp.seatNumber)?'pro':ballot;}
function resolveCoalitionBlackmail(choice,profileId){
    if(!['TENDER','FORCE','EMBASSIES','PERSONNEL'].includes(choice))return false;
    var ok=governmentCrisisCommit(function(){
        var e=pendingCoalitionBlackmail(state),p=coalitionBlackmailPartner(state);
        if(!e||e.governmentKey!==crisisGovernmentKey(state)||!p||!state.coalitionParties.includes(e.partner))throw Error('Shumica ose partneri kanë ndryshuar.');
        e.choice=choice;e.decisionTurn=state.turnCount;state.coalitionBlackmail.cooldownUntil=state.turnCount+12;
        if(choice==='TENDER'){e.receipt=enterprisePay(.012,'Tenderi i shantazhit: '+e.id);recordLeakRisk('TENDER',e.id,null,35);state.historyLog.unshift('Kontrolli i mega-tenderit iu dorëzua '+state.parties[e.partner].short+' · €12M nga arka · rreziku i përgjimeve +35 pikë.');}
        if(choice==='EMBASSIES'){
            e.appointments=[{name:'Arben Luma',post:'Misioni diplomatik në Berlin',party:e.partner},{name:'Liridona Gashi',post:'Misioni diplomatik në Vjenë',party:e.partner}];
            e.pressureBefore=state.internationalPressure;e.pressureAfter=Math.min(100,e.pressureBefore+15);state.internationalPressure=e.pressureAfter;
            state.historyLog.unshift('Emërime diplomatike partiake për '+state.parties[e.partner].short+' · presioni ndërkombëtar +15 pikë.');
        }
        if(choice==='PERSONNEL'){var appointment=createPersonnelAppointment(profileId,'COALITION',e.id);e.personnelAppointmentId=appointment.id;}
        if(choice==='FORCE'){
            crisisApproval(20);state.coalitionParties=state.coalitionParties.filter(p=>p!==e.partner);
            state.ministries.filter(m=>m.party===e.partner).forEach(m=>{e.dismissed.push({id:m.id,name:m.minister});m.minister='I/E paemëruar';m.ministerCandidateId=null;delete m.coalitionNominee;});
            syncDeputyGovernment();e.motionId='blackmail-motion:'+e.id;
            state.motionCounter++;state.motions.push({id:e.motionId,number:state.motionCounter,type:'NO_CONFIDENCE',title:'Mocioni pas largimit të partnerit të koalicionit',desc:'Partneri i larguar bashkohet me opozitën · skenar fiktiv.',proposer:state.parties[e.partner].short,status:'PENDING',week:state.turnCount,result:null,coalitionBlackmailId:e.id});
        }
    });
    if(ok)resumeCoalitionBlackmail();return ok;
}
function coalitionBlackmailMotionVote(motion,mp){
    var e=state.coalitionBlackmail?.events.find(e=>e.id===motion.coalitionBlackmailId);
    return !!e&&e.choice==='FORCE'&&e.cycle===deputyCycleId(state)&&!specialBlockedSeats(state).has(mp.seatNumber)&&!state.coalitionParties.includes(mp.party);
}
function resumeCoalitionBlackmail(){
    if(state.pendingVote||weeklyProcessing||weeklyVisualBusy)return;
    var e=state.coalitionBlackmail?.events.find(e=>e.choice==='FORCE'&&e.cycle===deputyCycleId(state)),m=state.motions.find(m=>m.id===e?.motionId);
    if(m?.status==='PENDING'&&agendaExecutive(state))voteNoConfidenceMotion(m.id);
    else if(m?.status==='PASSED'&&state.institutionalPhase==='GOV_OVERTHROWN'&&state.electionPhase==='NONE')startParliamentaryElectionProcess('Rënia e koalicionit pas shantazhit · zgjedhje të parakohshme');
}
function validateCoalitionBlackmail(st){
    var d=st.coalitionBlackmail;if(d===undefined)return;function bad(){throw Error('Regjistri i shantazhit të koalicionit është i pavlefshëm.');}var turn=n=>Number.isInteger(n)&&n>=0&&n<=st.turnCount;
    if(d.version!==1||!turn(d.lastTurn)||!Number.isInteger(d.cooldownUntil)||d.cooldownUntil<0||!Array.isArray(d.events)||!Array.isArray(d.attempts)||d.events.filter(e=>e.choice===null).length>1)bad();
    var keys=new Set();d.attempts.forEach(a=>{if(typeof a.key!=='string'||keys.has(a.key)||!turn(a.turn)||![.07,.16,.3].includes(a.chance)||!Number.isFinite(a.roll)||a.roll<0||a.roll>=1)bad();keys.add(a.key);});
    d.events.forEach((e,i)=>{
        var a=d.attempts.find(a=>a.key===e.attemptKey);
        if(e.id!=='blackmail:'+i||!st.parties[e.owner]||!st.parties[e.partner]||e.partner===e.owner||typeof e.governmentKey!=='string'||typeof e.cycle!=='string'||!turn(e.turn)||!Number.isInteger(e.seats)||e.seats<1||!a||a.turn!==e.turn||a.roll>=a.chance||![null,'TENDER','FORCE','EMBASSIES','PERSONNEL','EXPIRED'].includes(e.choice)||!Array.isArray(e.dismissed))bad();
        if(e.choice==='PERSONNEL'&&!st.personnelRegistry?.appointments.some(a=>a.id===e.personnelAppointmentId&&a.sourceId===e.id&&a.kind==='COALITION'))bad();
        if(e.choice===null?e.decisionTurn!==null:!turn(e.decisionTurn)||e.decisionTurn<e.turn)bad();
        if(e.choice==='TENDER'){var r=st.publicFinance.ledger.find(r=>r.id===e.receipt),risk=st.mediaDossiers.actions.find(a=>a.id==='TENDER:'+e.id);if(!r||r.type!=='EXPENSE'||r.turn!==e.decisionTurn||Math.abs(r.amountB+.012)>1e-9||r.source!=='Tenderi i shantazhit: '+e.id||!risk||risk.riskDelta!==35)bad();}else if(e.receipt!==null)bad();
        if(e.choice==='EMBASSIES'){if(!Number.isFinite(e.pressureBefore)||e.pressureBefore<0||e.pressureBefore>100||e.pressureAfter!==Math.min(100,e.pressureBefore+15)||!Array.isArray(e.appointments)||e.appointments.length!==2||e.appointments.some(a=>typeof a.name!=='string'||typeof a.post!=='string'||a.party!==e.partner))bad();}else if(e.pressureBefore!==null||e.pressureAfter!==null||e.appointments!==undefined)bad();
        if(e.choice==='FORCE'){var m=st.motions.find(m=>m.id===e.motionId);if(e.cycle===deputyCycleId(st)&&(!m||m.coalitionBlackmailId!==e.id||m.type!=='NO_CONFIDENCE'))bad();if(e.dismissed.some(m=>!st.ministries.some(n=>n.id===m.id)||typeof m.name!=='string'))bad();}else if(e.motionId!==null||e.dismissed.length)bad();
    });
}
var coalitionBlackmailRetry=null;
function renderCoalitionBlackmail(){
    var e=pendingCoalitionBlackmail(state),dialog=document.getElementById('coalitionBlackmailDialog'),host=document.getElementById('coalitionBlackmailPanel');
    if(host){var last=state.coalitionBlackmail?.events.at(-1);host.innerHTML='<h3>Beteja për numrin 61</h3><p>Shantazhi aktivizohet vetëm kur largimi i partnerit e humb shumicën reale.</p>'+(last?'<p><strong>'+catalogEscape(state.parties[last.partner].short)+'</strong> · '+catalogEscape(({TENDER:'Tenderi u dorëzua · €12M dhe +35 rrezik përgjimi',PERSONNEL:'Marrëveshje nga Regjistri · opozita qetësohet 12 javë',EMBASSIES:'Pazar diplomatik · +15 presion ndërkombëtar',FORCE:'Partneri u largua · mocion dhe zgjedhje',EXPIRED:'Kërcënimi u arkivua'})[last.choice]||'Kërcënim aktiv')+'</p>':'');}
    if(host){var last=state.coalitionBlackmail?.events.at(-1);if(last?.appointments)host.innerHTML+='<ul>'+last.appointments.map(a=>'<li>'+catalogEscape(a.name)+' · '+catalogEscape(a.post)+'</li>').join('')+'</ul>';}
    if(!dialog||typeof dialog.showModal!=='function')return;
    if(personnelSelectionActive(state,'COALITION',e?.id)){if(dialog.open)dialog.close();return;}
    if(!e){if(dialog.open)dialog.close();var waiting=state.coalitionBlackmail?.events.find(e=>e.choice==='FORCE'&&e.cycle===deputyCycleId(state)),motion=state.motions.find(m=>m.id===waiting?.motionId);if(motion&&(motion.status==='PENDING'&&agendaExecutive(state)||motion.status==='PASSED'&&state.institutionalPhase==='GOV_OVERTHROWN')&&!state.pendingVote&&!weeklyProcessing&&!weeklyVisualBusy&&document.getElementById('startScreen')?.classList.contains('hidden')&&coalitionBlackmailRetry===null)coalitionBlackmailRetry=setTimeout(()=>{coalitionBlackmailRetry=null;resumeCoalitionBlackmail();},250);return;}
    if(state.pendingVote||weeklyProcessing||weeklyVisualBusy||!document.getElementById('startScreen')?.classList.contains('hidden')||document.querySelector('dialog[open]:not(#coalitionBlackmailDialog)')){if(coalitionBlackmailRetry===null)coalitionBlackmailRetry=setTimeout(()=>{coalitionBlackmailRetry=null;renderCoalitionBlackmail();},250);return;}
    document.getElementById('coalitionBlackmailContent').innerHTML='<button class="action-btn" onclick="openPersonnelRegistry(\'COALITION\')">Zgjidh negociator nga Regjistri i Kuadrove</button><h2 id="coalitionBlackmailTitle">Kërcënimi i Mesnatës</h2><p>Partneri '+catalogEscape(state.parties[e.partner].short)+' ('+e.seats+' deputetë) kërcënon me tërheqje. Kërkon kontrollin e një Mega-Tenderi ose Ministrinë e Brendshme.</p><p>Skenar fiktiv · shumica aktuale: <strong>'+specialEffectiveMajority(state)+' / 61</strong>.</p><button class="action-btn" '+(state.budgetTotalB<.012?'disabled':'')+' onclick="resolveCoalitionBlackmail(\'TENDER\')">Gëlltit Krenarinë · Jepu Tenderin · €12M</button><p>Koalicioni mbetet; rreziku i përgjimeve rritet 35 pikë.</p><button class="action-btn" onclick="resolveCoalitionBlackmail(\'FORCE\')">Trego Forcën · Shkarko Ministrin e tyre</button><p>+20 popullaritet; partneri largohet dhe opozita nis mocionin e mosbesimit.</p><button class="action-btn" onclick="resolveCoalitionBlackmail(\'EMBASSIES\')">Rehatoji në Ambasada · Pazar Diplomatik</button><p>Pa kosto dhe pa rrezik të ri përgjimi; presioni ndërkombëtar +15 pikë.</p>';
    if(!dialog.open)dialog.showModal();
}
document.addEventListener('DOMContentLoaded',()=>document.getElementById('coalitionBlackmailDialog')?.addEventListener('cancel',e=>{if(pendingCoalitionBlackmail(state))e.preventDefault();}));
