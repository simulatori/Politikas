/* Identity is immutable; effects describe a fictional appointment contract. */
function personnelIdentity(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function personnelProfile(id){return PERSONNEL_PROFILES.find(p=>p.id===id)||null;}
function personnelBoardBudget(st,r){var a=st.personnelRegistry?.appointments.find(a=>a.id===r.personnelAppointmentId);return personnelProfile(a?.profileId)?.stat_buxheti??2000000;}
function migratePersonnelRegistry(st){if(st.personnelRegistry===undefined)st.personnelRegistry={version:1,appointments:[],selection:null};var c=st.personnelRegistry.selection;if(c&&!personnelContextValid(st,c))st.personnelRegistry.selection=null;}
function personnelContextValid(st,c){return agendaExecutive(st)&&(c.kind==='BOARD'?currentEnterpriseBoards(st)?.id===c.sourceId&&enterpriseBoardsPending(st):c.kind==='COALITION'&&pendingCoalitionBlackmail(st)?.id===c.sourceId);}
function personnelSelectionActive(st,kind,id){var c=st.personnelRegistry?.selection;return !!c&&c.kind===kind&&c.sourceId===id&&personnelContextValid(st,c);}
function personnelAppointmentActive(st,a){return a.kind==='BOARD'?st.stateEnterprises&&st.enterpriseBoards.mandates.some(r=>r.id===a.sourceId&&r.ids.some(id=>st.stateEnterprises.companies[id].mode==='SUBSIDIZE'&&!trepcaManaged(st,id))):a.governmentKey===crisisGovernmentKey(st)&&agendaExecutive(st)&&st.turnCount<a.until;}
function personnelAvailable(st,p){if(!p)return false;var key=personnelIdentity(p.emri);return !(st.personnelRegistry?.appointments||[]).some(a=>a.profileId===p.id&&personnelAppointmentActive(st,a))&&!(st.ministries||[]).some(m=>personnelIdentity(m.minister)===key)&&!getCandidateCatalogue(st).some(c=>personnelIdentity(candidateName(c))===key);}
function personnelOppositionQuiet(st){return (st.personnelRegistry?.appointments||[]).some(a=>a.kind==='COALITION'&&personnelAppointmentActive(st,a));}
function oppositionPressurePaused(st){return bureauOppositionQuiet(st)||personnelOppositionQuiet(st)||energyInquiryQuiet(st);}
function openPersonnelRegistry(kind){
 if(kind){var ok=governmentCrisisCommit(()=>{migratePersonnelRegistry(state);var r=kind==='BOARD'?currentEnterpriseBoards(state):pendingCoalitionBlackmail(state),c={kind,sourceId:r?.id};if(!personnelContextValid(state,c))throw Error('Nuk ka post të lirë për këtë emërim.');state.personnelRegistry.selection=c;});if(!ok)return false;}
 ['enterpriseBoardsDialog','coalitionBlackmailDialog'].forEach(id=>{var d=document.getElementById(id);if(d?.open)d.close();});
 switchMainTab('tab-government');var b=document.getElementById('personnelTab');switchSubTab('gov','personnel',b);renderPersonnelRegistry();return true;
}
function cancelPersonnelSelection(){return governmentCrisisCommit(()=>{state.personnelRegistry.selection=null;});}
function createPersonnelAppointment(profileId,kind,sourceId){
 var p=personnelProfile(profileId);migratePersonnelRegistry(state);if(!personnelAvailable(state,p))throw Error('Personi është i emëruar ose figuron në një rol tjetër.');
 var d=state.personnelRegistry,a={id:'appointment:'+d.appointments.length,profileId,kind,sourceId,turn:state.turnCount,owner:state.playerParty,governmentKey:crisisGovernmentKey(state),until:kind==='COALITION'?state.turnCount+12:null};d.appointments.push(a);d.selection=null;
 if(kind==='BOARD'){mediaPollDelta(-10);recordLeakRisk('APPOINTMENT',a.id,null,p.stat_skandali);}else{crisisApproval(-15);mediaPollDelta(-15);}
 state.historyLog.unshift('Emërim në simulim: '+p.emri+' · '+(kind==='BOARD'?'Bord profesional; rekrutim 8 javë, baza e partisë −10 pikë.':'Marrëveshje me opozitën për 12 javë; −15 popullaritet.'));return a;
}
function appointPersonnel(profileId){
 var c=state.personnelRegistry?.selection;if(!c||!personnelContextValid(state,c))return false;
 if(c.kind==='COALITION')return resolveCoalitionBlackmail('PERSONNEL',profileId);
 return governmentCrisisCommit(()=>{var r=currentEnterpriseBoards(state);if(!personnelContextValid(state,c)||r.id!==c.sourceId)throw Error('Procesi i bordeve ka ndryshuar.');var a=createPersonnelAppointment(profileId,'BOARD',r.id);r.personnelAppointmentId=a.id;r.appointment='EXPERT';r.appointmentTurn=state.turnCount;r.phase='RECRUITING';r.readyTurn=state.turnCount+8;});
}
function validatePersonnelRegistry(st){
 var d=st.personnelRegistry;if(d===undefined)return;function bad(){throw Error('Regjistri i kuadrove është i pavlefshëm.');}
 if(d.version!==1||!Array.isArray(d.appointments)||d.selection!==null&&!personnelContextValid(st,d.selection))bad();var active=new Set(),posts=new Set();
 d.appointments.forEach((a,i)=>{var p=personnelProfile(a.profileId);if(a.id!=='appointment:'+i||!p||!['BOARD','COALITION'].includes(a.kind)||!st.parties[a.owner]||typeof a.governmentKey!=='string'||!Number.isInteger(a.turn)||a.turn<0||a.turn>st.turnCount)bad();var post=a.kind+':'+a.sourceId;if(posts.has(post))bad();posts.add(post);
 if(a.kind==='BOARD'){var r=st.enterpriseBoards?.mandates.find(r=>r.id===a.sourceId);if(!r||r.personnelAppointmentId!==a.id||r.appointment!=='EXPERT'||r.appointmentTurn!==a.turn||a.until!==null||!st.mediaDossiers.actions.some(x=>x.id==='APPOINTMENT:'+a.id))bad();}
 else{var e=st.coalitionBlackmail?.events.find(e=>e.id===a.sourceId);if(!e||e.choice!=='PERSONNEL'||e.personnelAppointmentId!==a.id||a.until!==a.turn+12||e.decisionTurn!==a.turn)bad();}
 if(personnelAppointmentActive(st,a)){if(active.has(p.id))bad();active.add(p.id);}
 });
 (st.enterpriseBoards?.mandates||[]).forEach(r=>{if(r.personnelAppointmentId&&!d.appointments.some(a=>a.id===r.personnelAppointmentId&&a.sourceId===r.id&&a.kind==='BOARD'))bad();});
}
function validatePersonnelLeakAction(st,a,index){var r=st.personnelRegistry?.appointments.find(r=>a.id==='APPOINTMENT:'+r.id),p=personnelProfile(r?.profileId);if(!r||r.kind!=='BOARD'||r.turn!==a.turn||r.owner!==a.owner||!p||a.riskDelta!==p.stat_skandali)throw Error('Rregullimi i rrezikut nuk ka emërim të vlefshëm.');}
var personnelFilter='ALL';
function filterPersonnel(key){if(!['ALL','ECONOMY','LAW','INTERNATIONAL','MEDIA','CIVIC'].includes(key))return;personnelFilter=key;renderPersonnelRegistry();}
function renderPersonnelRegistry(){
 var host=document.getElementById('personnelRegistryPanel');if(!host)return;var e=catalogEscape,c=state.personnelRegistry?.selection,select=c&&personnelContextValid(state,c),filters={ALL:'Të gjithë',ECONOMY:'Ekonomi / Financa',LAW:'Juristë',INTERNATIONAL:'Ndërkombëtarë',MEDIA:'Media',CIVIC:'Shoqëri Civile'};
 var unavailable=new Set(getCandidateCatalogue(state).map(c=>personnelIdentity(candidateName(c))));
 state.ministries.forEach(m=>unavailable.add(personnelIdentity(m.minister)));
 (state.personnelRegistry?.appointments||[]).filter(a=>personnelAppointmentActive(state,a)).forEach(a=>unavailable.add(personnelIdentity(personnelProfile(a.profileId)?.emri)));
 host.innerHTML='<h2>Regjistri i Kuadrove</h2><p class="personnel-note">Emra dhe profesione nga burime publike. Rolet politike, emërimet dhe statistikat janë skenarë të lojës; nuk përshkruajnë sjelljen apo bindjet reale të këtyre personave.</p>'+(select?'<div class="personnel-context" role="status"><strong>'+e(c.kind==='BOARD'?'Zgjidh drejtuesin e bordit profesional':'Zgjidh ndërmjetësin e marrëveshjes me opozitën')+'</strong><p>'+e(c.kind==='BOARD'?'8 javë rekrutim; pastaj deri +€2M/javë në paketën e ndërmarrjeve. Rreziku ulet 15 pikë; baza e partisë −10.':'Rol fiktiv negociatori: ruan partnerin aktual dhe ul presionin e opozitës për 12 javë. −15 popullaritet, pa kosto javore. Nuk shton deputetë të rinj.')+'</p><button class="action-btn" onclick="cancelPersonnelSelection()">Kthehu te vendimi</button></div>':'<p>Emërimi hapet nga menaxhimi i bordeve ose negociatat e koalicionit.</p>')+'<div class="personnel-filters" role="group" aria-label="Filtro profesionet">'+Object.entries(filters).map(([k,label])=>'<button class="action-btn" aria-pressed="'+(personnelFilter===k)+'" onclick="filterPersonnel(\''+k+'\')">'+e(label)+'</button>').join('')+'</div><div class="personnel-grid">'+PERSONNEL_PROFILES.filter(p=>personnelFilter==='ALL'||p.filter===personnelFilter).map(p=>{var free=!unavailable.has(personnelIdentity(p.emri)),a=state.personnelRegistry?.appointments.find(a=>a.profileId===p.id&&personnelAppointmentActive(state,a));return '<article class="personnel-card"><div class="personnel-card-heading"><span class="personnel-avatar" aria-hidden="true">'+e(p.emri.split(/[ -]/).map(w=>w[0]).slice(0,2).join(''))+'</span><span class="personnel-badge '+(free?'available':'appointed')+'">'+(free?'I lirë':a?'I emëruar':'Rol tjetër')+'</span></div><h3>'+e(p.emri)+'</h3><p>'+e(p.profesioni)+'</p><p>Kategori në simulim: <strong>'+e(p.kategoria_politike)+'</strong></p><dl><dt>Kontratë bordi në lojë</dt><dd>+€'+(p.stat_buxheti/1e6)+'M/javë pas rekrutimit</dd><dt>Ndryshim i rrezikut në simulim</dt><dd>−15 pikë në emërim</dd></dl><a href="'+e(p.source)+'" target="_blank" rel="noopener noreferrer">Burimi i profilit</a>'+(select?'<button class="action-btn" '+(!free?'disabled':'')+' onclick="appointPersonnel(\''+p.id+'\')">'+(free?'Emëro':'I padisponueshëm')+'</button>':'')+'</article>';}).join('')+'</div>';
}
