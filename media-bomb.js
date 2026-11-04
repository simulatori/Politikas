/* Escalation of mediaDossiers, using the same risk ledger, cabinet and fiscal accounts. */
function mediaBombBoughtSilence(st){return st.mediaDossiers?.cases.some(c=>c.bomb&&c.owner===st.playerParty&&c.choice==='BUY')||false;}
function mediaBombThreat(st){return st.mediaDossiers?.cases.find(c=>c.bomb&&c.choice==='ATTACK'&&c.owner===st.playerParty&&c.cycle===deputyCycleId(st)&&c.governmentKey===crisisGovernmentKey(st)&&agendaExecutive(st))||null;}
function triggerMediaBomb(){
 if(!agendaExecutive(state)||state.leakRisk<80)return;var d=state.mediaDossiers,c=pendingMediaDossier(state);
 if(c?.bomb)return;
 if(!mediaBombBoughtSilence(state)&&mediaBombThreat(state))return;
 if(!c){c={id:'dossier:'+d.cases.length,turn:state.turnCount,owner:state.playerParty,cycle:deputyCycleId(state),triggerActions:d.actions.length,risk:state.leakRisk,choice:null,resolvedTurn:null,closedActions:null,fundsUntil:null,minister:null,coalitionRoll:null,partnerWithdrawn:false,majority:null,majorityTurn:null};d.cases.push(c);}
 else{c.triggerActions=d.actions.length;c.risk=state.leakRisk;}
 Object.assign(c,{bomb:true,governmentKey:crisisGovernmentKey(state),pressureBefore:null,pressureAfter:null,pollBefore:null,pollAfter:null,approvalBefore:null,approvalAfter:null,dismissed:[],buyReceipt:null,motionId:null});
 if(mediaBombBoughtSilence(state)){
  c.choice='FALLEN';c.resolvedTurn=state.turnCount;c.closedActions=d.actions.length;
  state.leakRisk=0;
  setInstitutionalPhase(INSTITUTIONAL_PHASES.GOV_OVERTHROWN,'Bomba e dytë mediatike pas blerjes së heshtjes rrëzoi qeverinë.');
  state.historyLog.unshift('QEVERIA RA: rreziku arriti sërish 80% pas blerjes së heshtjes. Nuk ka negociatë të dytë.');
 }else{
  state.historyLog.unshift('BOMBA MEDIATIKE · skenar i lojës: publikohen audio-incizimet; Kuvendi dhe java presin vendimin e Kryeministrit.');
  recordCrisisPressEvent('MEDIA',c.id,'Bomba Mediatike · audio-incizime të zyrtarëve','sec_justice');
 }
 setTimeout(()=>{renderMediaDossiers();renderMediaBombStatus();},0);
}
function resolveMediaBomb(choice){
 if(!['SCAPEGOAT','ATTACK','BUY'].includes(choice))return false;
 return governmentCrisisCommit(()=>{
  var c=pendingMediaDossier(state);if(!c?.bomb||c.owner!==state.playerParty||c.cycle!==deputyCycleId(state)||c.governmentKey!==crisisGovernmentKey(state))throw Error('Nuk ka Bombë Mediatike aktive.');
  c.pressureBefore=state.internationalPressure;c.pollBefore=state.parties[state.playerParty].poll;c.approvalBefore=state.approval;
  if(choice==='SCAPEGOAT'){
   var ministers=state.ministries.filter(m=>m.party===state.playerParty&&m.minister!=='I/E paemëruar');if(!ministers.length)throw Error('Nuk ka ministra të partisë tuaj në detyrë.');
   ministers.forEach(m=>{c.dismissed.push({id:m.id,name:m.minister,party:m.party});m.minister='I/E paemëruar';m.ministerCandidateId=null;delete m.coalitionNominee;});
   syncDeputyGovernment();state.internationalPressure=Math.max(0,state.internationalPressure-10);mediaPollDelta(-25);
  }
  if(choice==='ATTACK'){
   mediaPopularity(15);state.internationalPressure=Math.min(100,state.internationalPressure+30);
   state.motionCounter++;c.motionId='media-bomb-motion:'+c.id;
   state.motions.push({id:c.motionId,number:state.motionCounter,type:'NO_CONFIDENCE',title:'Mocioni pas Bombës Mediatike',desc:'Opozita kërkon llogaridhënie pas audio-incizimeve · skenar i lojës.',proposer:'Opozita',status:'PENDING',week:state.turnCount,result:null,mediaBombId:c.id});
  }
  if(choice==='BUY')c.buyReceipt=enterprisePay(.015,'Blerja e heshtjes: '+c.id);
  c.pressureAfter=state.internationalPressure;c.pollAfter=state.parties[state.playerParty].poll;c.approvalAfter=state.approval;
  c.choice=choice;c.resolvedTurn=state.turnCount;c.closedActions=state.mediaDossiers.actions.length;
  if(choice!=='ATTACK')state.leakRisk=0;
  state.historyLog.unshift('Bomba Mediatike: '+({SCAPEGOAT:'zyrtarët e partisë u shkarkuan; baza −25, presioni −10, rreziku zero.',ATTACK:'sulm ndaj mediave; +15 popullaritet, +30 presion, rreziku dhe mocioni mbeten aktivë.',BUY:'€15M u paguan për heshtje; rreziku zero. Arritja e ardhshme e 80% rrëzon qeverinë automatikisht.'})[choice]);
 });
}
function validateMediaBombCase(st,c,i,closed){
 function bad(){throw Error('Bomba Mediatike nuk rakordohet me vendimet dhe regjistrat.');}
 var turn=n=>Number.isInteger(n)&&n>=0&&n<=st.turnCount,empty=()=>c.pressureBefore===null&&c.pressureAfter===null&&c.pollBefore===null&&c.pollAfter===null&&c.approvalBefore===null&&c.approvalAfter===null;
 if(c.bomb!==true||c.id!=='dossier:'+i||!turn(c.turn)||!st.parties[c.owner]||typeof c.cycle!=='string'||typeof c.governmentKey!=='string'||!Number.isInteger(c.triggerActions)||c.triggerActions<=closed||c.triggerActions>st.mediaDossiers.actions.length||c.risk!==mediaRiskTotal(st.mediaDossiers.actions.slice(closed,c.triggerActions))||c.risk<80||![null,'SCAPEGOAT','ATTACK','BUY','FALLEN','ARCHIVED'].includes(c.choice)||!Array.isArray(c.dismissed)||c.fundsUntil!==null||c.minister!==null||c.coalitionRoll!==null||c.partnerWithdrawn!==false||c.majority!==null||c.majorityTurn!==null)bad();
 if(c.choice===null){if(c.resolvedTurn!==null||c.closedActions!==null||!empty()||c.dismissed.length||c.buyReceipt!==null||c.motionId!==null)bad();return closed;}
 if(!turn(c.resolvedTurn)||c.resolvedTurn<c.turn||!Number.isInteger(c.closedActions)||c.closedActions<c.triggerActions||c.closedActions>st.mediaDossiers.actions.length)bad();
 if(['ARCHIVED','FALLEN'].includes(c.choice)){if(!empty()||c.dismissed.length||c.buyReceipt!==null||c.motionId!==null)bad();if(c.choice==='FALLEN'&&!st.mediaDossiers.cases.slice(0,i).some(p=>p.bomb&&p.choice==='BUY'&&p.owner===c.owner))bad();return c.closedActions;}
 if(![c.pressureBefore,c.pressureAfter].every(n=>Number.isFinite(n)&&n>=0&&n<=100)||![c.pollBefore,c.pollAfter].every(n=>Number.isFinite(n)&&n>=0&&n<=95)||![c.approvalBefore,c.approvalAfter].every(n=>Number.isFinite(n)&&n>=5&&n<=95))bad();
 if(c.choice==='SCAPEGOAT'){
  if(!c.dismissed.length||new Set(c.dismissed.map(m=>m.id)).size!==c.dismissed.length||c.dismissed.some(m=>!st.ministries.some(n=>n.id===m.id)||typeof m.name!=='string'||m.party!==c.owner)||c.pressureAfter!==Math.max(0,c.pressureBefore-10)||c.pollAfter!==Math.max(0,c.pollBefore-25)||c.approvalAfter!==c.approvalBefore)bad();
 }else if(c.dismissed.length)bad();
 if(c.choice==='BUY'){var r=st.publicFinance.ledger.find(r=>r.id===c.buyReceipt);if(!r||r.turn!==c.resolvedTurn||r.type!=='EXPENSE'||Math.abs(r.amountB+.015)>1e-9||r.source!=='Blerja e heshtjes: '+c.id||c.pressureBefore!==c.pressureAfter||c.pollBefore!==c.pollAfter||c.approvalBefore!==c.approvalAfter)bad();}else if(c.buyReceipt!==null)bad();
 if(c.choice==='ATTACK'){var m=st.motions.find(m=>m.id===c.motionId);if(c.pressureAfter!==Math.min(100,c.pressureBefore+30)||c.pollAfter!==Math.min(95,c.pollBefore+15)||c.approvalAfter!==Math.min(95,c.approvalBefore+15)||c.cycle===deputyCycleId(st)&&(!m||m.mediaBombId!==c.id||m.type!=='NO_CONFIDENCE'))bad();return closed;}
 if(c.motionId!==null)bad();return c.closedActions;
}
function renderMediaBomb(c,dialog){
 dialog.classList.add('media-bomb-dialog');var own=state.ministries.some(m=>m.party===state.playerParty&&m.minister!=='I/E paemëruar');
 document.getElementById('mediaDossierContent').innerHTML='<div class="media-bomb-alert" aria-hidden="true">⚠</div><h2 id="mediaDossierTitle">Bomba Mediatike!</h2><p>Portalet kanë publikuar një audio-incizim të zyrtarëve të tu të lartë duke bërë pazare të fshehta për tenderë dhe ligje. Opozita ka bllokuar Kuvendin!</p><p class="media-bomb-risk">Rreziku: '+state.leakRisk+'% · Loja është në pritje</p><p class="media-bomb-fiction">Skenar i lojës; nuk është pretendim për persona realë.</p><div class="media-bomb-choices"><button class="action-btn" '+(!own?'disabled':'')+' onclick="resolveMediaBomb(\'SCAPEGOAT\')">Bëje Kurban · Shkarko Zyrtarët</button><p>Shkarkohen ministrat e partisë sate. Rreziku 0%; presioni −10; baza e partisë −25.</p><button class="action-btn" onclick="resolveMediaBomb(\'ATTACK\')">Sulmo Mediat · Fake News</button><p>Popullariteti +15; presioni +30. Rreziku nuk zerohet dhe opozita paraqet mocion mosbesimi.</p><button class="action-btn" '+(state.budgetTotalB<.015?'disabled':'')+' onclick="resolveMediaBomb(\'BUY\')">Bli Heshtjen · €15M</button><p>Popullariteti ruhet; rreziku zerohet. Nëse arrin sërish 80%, qeveria bie automatikisht.</p></div>';
 if(!dialog.open)dialog.showModal();
}
function renderMediaBombStatus(){
 var host=document.getElementById('mediaBombStatus');if(!host)return;var threat=mediaBombThreat(state),bought=mediaBombBoughtSilence(state),fallen=state.mediaDossiers?.cases.some(c=>c.choice==='FALLEN'&&c.bomb&&c.cycle===deputyCycleId(state)&&c.owner===state.playerParty);
 host.hidden=!threat&&!bought&&!fallen;host.innerHTML='<h3>Dosjet e Mediave</h3><p>Rreziku aktual: <strong>'+state.leakRisk+'%</strong></p>'+(threat?'<p>Skandali mbetet i hapur pas sulmit ndaj mediave.</p><button class="action-btn" onclick="voteNoConfidenceMotion(\''+threat.motionId+'\')">Shqyrto mocionin e mosbesimit</button>':'')+(bought?'<p class="media-bomb-warning">Heshtja është blerë. Arritja tjetër e 80% rrëzon qeverinë pa negociata.</p>':'')+(fallen?'<p>Qeveria ra pas përsëritjes së skandalit. Procedura zgjedhore është e disponueshme në Kuvend.</p>':'');
}
