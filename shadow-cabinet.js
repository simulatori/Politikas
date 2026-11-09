/* The party headquarters gains a shadow team; identities come from the existing candidate registry. */
const SHADOW_PORTFOLIOS={ECONOMY:{title:'Ekonomia dhe Punësimi',sector:'sec_econ',plan:'Pako për punësim dhe stabilitet tatimor'},EDUCATION:{title:'Arsimi dhe Rinia',sector:'sec_edu',plan:'Program për aftësim profesional'},HEALTH:{title:'Shëndetësia',sector:'sec_health',plan:'Plan për personelin dhe shërbimet shëndetësore'},SECURITY:{title:'Siguria dhe Drejtësia',sector:'sec_police',plan:'Plan për siguri dhe llogaridhënie'}};
const SHADOW_JOBS={PLAN:{cost:15000,weeks:3},INVESTIGATE:{cost:10000,weeks:2}};
const shadowInit=initialiseProduction,shadowPrepare=prepareLoadedState,shadowValidate=validateLoadedState,shadowWeek=processOppositionWeek,shadowRender=renderOppositionHQ,shadowSave=saveGameAuto;
function migrateShadowCabinet(st){migrateOpposition(st);if(st.opposition.shadow===undefined)st.opposition.shadow={version:1,startTurn:st.turnCount,lastTurn:st.turnCount,appointments:[],jobs:[]};}
initialiseProduction=function(st){shadowInit(st);migrateShadowCabinet(st);};
prepareLoadedState=function(raw){const st=shadowPrepare(raw);migrateShadowCabinet(st);return st;};
function shadowCandidate(st,id){return getCandidateCatalogue(st).find(c=>c.id===id)||null;}
function shadowCandidates(st,portfolio){
 const occupied=new Set((st.opposition?.shadow?.appointments||[]).filter(a=>a.endedTurn===null&&a.portfolio!==portfolio).map(a=>cabinetIdentity(a.name)));
 const ministers=new Set(st.ministries.filter(m=>m.minister!=='I/E paemëruar').map(m=>cabinetIdentity(m.minister)));
 return cabinetCandidateRegistry(st,st.playerParty).filter(c=>!cabinetReservedName(st,c.name)&&cabinetIdentity(c.name)!==cabinetIdentity(st.parties[st.playerParty].leader)&&!occupied.has(cabinetIdentity(c.name))&&!ministers.has(cabinetIdentity(c.name)));
}
function shadowCurrent(st,portfolio){return st.opposition?.shadow?.appointments.findLast(a=>a.owner===st.playerParty&&a.portfolio===portfolio&&a.endedTurn===null)||null;}
function shadowCandidateBonus(st,id,name,party){
 const turns=new Set();for(const a of st.opposition?.shadow?.appointments||[])if(a.owner===party&&(id?a.candidateId===id:cabinetIdentity(a.name)===cabinetIdentity(name)))for(const t of a.weeks)turns.add(t);
 return Math.min(6,Math.floor(turns.size/4));
}
function cancelShadowAppointment(st,a){
 a.endedTurn=st.turnCount;for(const j of st.opposition.shadow.jobs.filter(j=>j.appointmentId===a.id&&['ACTIVE','READY'].includes(j.status))){j.status='CANCELLED';j.closedTurn=st.turnCount;}
}
function syncShadowCabinet(st){
 migrateShadowCabinet(st);for(const a of st.opposition.shadow.appointments.filter(a=>a.endedTurn===null))if(!oppositionActive(st)||a.owner!==st.playerParty||st.ministries.some(m=>m.minister!=='I/E paemëruar'&&cabinetIdentity(m.minister)===cabinetIdentity(a.name)))cancelShadowAppointment(st,a);
}
function shadowCommit(change){return oppositionCommit(()=>{syncShadowCabinet(state);change();syncElectoralMemory(state);});}
function appointShadowMinister(portfolio,candidateId){
 if(!SHADOW_PORTFOLIOS[portfolio])return false;
 return shadowCommit(()=>{const c=shadowCandidates(state,portfolio).find(c=>c.id===candidateId),old=shadowCurrent(state,portfolio);if(!c||old?.candidateId===candidateId)throw Error('Zgjidhni një kuadër tjetër të lirë të partisë suaj.');
 if(old)cancelShadowAppointment(state,old);const db=state.opposition.shadow;db.appointments.push({id:'shadow-appointment:'+db.appointments.length,owner:state.playerParty,portfolio,candidateId:c.id,name:c.name,appointedTurn:state.turnCount,endedTurn:null,weeks:[]});oppositionLog('Qeveria në Hije: '+c.name+' mori përgjegjësinë për '+SHADOW_PORTFOLIOS[portfolio].title+'.');});
}
function shadowEvidence(st,portfolio,party=electoralGovernor(st)){
 const sector=SHADOW_PORTFOLIOS[portfolio]?.sector;if(!sector)return [];
 return (st.electoralMemory?.events||[]).filter(e=>e.party===party&&e.party!==st.playerParty&&e.turn<=st.turnCount&&e.score<0&&(e.kind==='SCANDAL'||e.kind==='PROJECT'&&(civicEventSector(st,e)===sector||portfolio==='ECONOMY')));
}
function startShadowJob(portfolio,kind,evidenceId){
 if(!SHADOW_PORTFOLIOS[portfolio]||!SHADOW_JOBS[kind])return false;
 return shadowCommit(()=>{const db=state.opposition.shadow,a=shadowCurrent(state,portfolio),def=SHADOW_JOBS[kind],cycle=deputyCycleId(state);if(!a)throw Error('Emëroni fillimisht përgjegjësin e kësaj fushe.');
 if(db.jobs.some(j=>j.owner===state.playerParty&&j.portfolio===portfolio&&['ACTIVE','READY'].includes(j.status)))throw Error('Përfundoni dosjen aktive të kësaj fushe.');
 if(kind==='PLAN'&&db.jobs.some(j=>j.owner===state.playerParty&&j.portfolio===portfolio&&j.cycle===cycle&&j.kind==='PLAN'&&j.status==='COMPLETED'))throw Error('Kjo alternativë është përgatitur për këtë cikël zgjedhor.');
 if(db.jobs.some(j=>j.owner===state.playerParty&&j.portfolio===portfolio&&j.startedTurn+8>state.turnCount))throw Error('Kjo fushë mund të nisë një dosje të re çdo 8 javë.');
 const proof=kind==='INVESTIGATE'&&evidenceId?shadowEvidence(state,portfolio).find(e=>e.id===evidenceId):null;
 if(kind==='INVESTIGATE'&&evidenceId&&!proof)throw Error('Dëshmia nuk është një rast publik i vlefshëm i qeverisë aktuale.');
 if(proof&&db.jobs.some(j=>j.owner===state.playerParty&&j.evidenceId===proof.id&&j.result==='VERIFIED'))throw Error('Partia e ka publikuar tashmë raportin për këtë provë.');
 oppositionSpend(def.cost);const j={id:'shadow-job:'+db.jobs.length,owner:state.playerParty,portfolio,appointmentId:a.id,kind,cycle,governmentParty:electoralGovernor(state),startedTurn:state.turnCount,dueTurn:state.turnCount+def.weeks,cost:def.cost,status:'ACTIVE',result:null,evidenceId:proof?.id||null,completedTurn:null,closedTurn:null};db.jobs.push(j);oppositionLog((kind==='PLAN'?'Përgatitje alternative':'Hetim dokumentesh publike')+': '+SHADOW_PORTFOLIOS[portfolio].title+' · €'+def.cost+' nga partia.');});
}
function publishShadowReport(id,choice){
 if(!['VERIFIED','UNSUPPORTED','ARCHIVE'].includes(choice))return false;
 return shadowCommit(()=>{const db=state.opposition.shadow,j=db.jobs.find(j=>j.id===id),a=j&&db.appointments.find(a=>a.id===j.appointmentId);
 if(!j||j.owner!==state.playerParty||j.kind!=='INVESTIGATE'||j.status!=='READY'||!a||a.endedTurn!==null||state.turnCount<j.dueTurn)throw Error('Raporti nuk është gati ose ekipi ka ndryshuar.');
 if(choice!=='ARCHIVE'&&j.governmentParty!==electoralGovernor(state))throw Error('Qeveria e hetuar ka ndryshuar; arkivoni dosjen.');
 const proof=j.evidenceId&&shadowEvidence(state,j.portfolio,j.governmentParty).find(e=>e.id===j.evidenceId);
 if(choice==='VERIFIED'&&(!proof||proof.turn>j.startedTurn||db.jobs.some(other=>other.id!==j.id&&other.owner===j.owner&&other.evidenceId===proof.id&&other.result==='VERIFIED')))throw Error('Raporti kërkon një provë publike të papërdorur.');
 if(choice==='UNSUPPORTED'&&proof)throw Error('Përdorni provën e verifikuar ose arkivoni raportin.');
 j.closedTurn=state.turnCount;if(choice==='ARCHIVE'){j.status='CANCELLED';oppositionLog('U arkivua hetimi pa publikim akuzash.');return;}
 j.status='COMPLETED';j.result=choice;j.completedTurn=state.turnCount;oppositionLog(choice==='VERIFIED'?'U publikua raport me dëshmi të regjistruar; nuk përsëritet penaliteti i skandalit ndaj qeverisë.':'U publikua akuzë pa prova: u dëmtua besueshmëria e partisë.');});
}
function processShadowCabinetWeek(turn){
 if(!Number.isInteger(turn)||turn!==state.turnCount)return false;syncShadowCabinet(state);const db=state.opposition.shadow;if(turn<=db.lastTurn)return false;db.lastTurn=turn;if(!oppositionActive(state))return false;
 for(const a of db.appointments.filter(a=>a.endedTurn===null&&a.owner===state.playerParty))if(turn>a.appointedTurn&&!a.weeks.includes(turn))a.weeks.push(turn);
 for(const j of db.jobs.filter(j=>j.status==='ACTIVE'&&turn>=j.dueTurn)){
 const a=db.appointments.find(a=>a.id===j.appointmentId);if(!a||a.endedTurn!==null||j.owner!==state.playerParty||j.governmentParty!==electoralGovernor(state)){j.status='CANCELLED';j.closedTurn=turn;continue;}
 if(j.kind==='PLAN'){j.status='COMPLETED';j.result='PLAN';j.completedTurn=j.closedTurn=turn;oppositionLog('U përfundua alternativa: '+SHADOW_PORTFOLIOS[j.portfolio].plan+'.');}else j.status='READY';
 }
 syncElectoralMemory(state);return true;
}
processOppositionWeek=function(turn){const result=shadowWeek(turn);processShadowCabinetWeek(turn);return result;};
saveGameAuto=function(...args){if(!state?.opposition)return shadowSave(...args);const before=JSON.stringify({shadow:state.opposition.shadow,memory:state.electoralMemory});try{syncShadowCabinet(state);const ok=shadowSave(...args);if(ok)return ok;}catch(error){}const old=JSON.parse(before);state.opposition.shadow=old.shadow;state.electoralMemory=old.memory;return false;};
function shadowCabinetMarkup(st){
 const e=catalogEscape,db=st.opposition.shadow,busy=!!st.pendingVote||weeklyProcessing||weeklyVisualBusy||hasOpenElectionProcess();
 return '<section id="shadowCabinetPanel"><h3>Qeveria në Hije</h3><p>Ekipi përgatit alternativa dhe kontrollon provat publike. Pagesat dalin vetëm nga Buxheti i Partisë. Çdo 4 javë pune japin +1 aftësi për një emërim të ardhshëm, deri në +6.</p><div class="shadow-cabinet-grid">'+Object.entries(SHADOW_PORTFOLIOS).map(([id,def])=>{const a=shadowCurrent(st,id),pool=shadowCandidates(st,id),job=db.jobs.findLast(j=>j.owner===st.playerParty&&j.portfolio===id),active=job&&['ACTIVE','READY'].includes(job.status),proofs=shadowEvidence(st,id).filter(p=>!db.jobs.some(j=>j.owner===st.playerParty&&j.evidenceId===p.id&&j.result==='VERIFIED')),off=busy||!a||!!active;
 let html='<article class="shadow-cabinet-card"><h4>'+e(def.title)+'</h4><p><strong>'+e(a?.name||'Pa përgjegjës')+'</strong>'+(a?'<br>'+a.weeks.length+' javë përvojë · +'+shadowCandidateBonus(st,a.candidateId,a.name,a.owner)+' aftësi në kabinet':'')+'</p><label>Kuadri i partisë<select id="shadow-candidate-'+id+'" '+(busy?'disabled':'')+'><option value="">Zgjidh kuadrin</option>'+pool.map(c=>'<option value="'+e(c.id)+'" '+(c.id===a?.candidateId?'selected':'')+'>'+e(c.name)+'</option>').join('')+'</select></label><button class="action-btn" '+(busy?'disabled':'')+' onclick="appointShadowMinister(\''+id+'\',document.getElementById(\'shadow-candidate-'+id+'\').value)">Emëro / Zëvendëso</button><p>'+e(def.plan)+' · €15,000 · 3 javë.</p><button class="action-btn" '+(off?'disabled':'')+' onclick="startShadowJob(\''+id+'\',\'PLAN\')">Përgatit alternativën</button><label>Dosja publike<select id="shadow-evidence-'+id+'" '+(off?'disabled':'')+'><option value="">Pa dëshmi publike të disponueshme</option>'+proofs.map(p=>'<option value="'+e(p.id)+'">'+e(p.title)+' · Java '+p.turn+'</option>').join('')+'</select></label><button class="action-btn" '+(off?'disabled':'')+' onclick="startShadowJob(\''+id+'\',\'INVESTIGATE\',document.getElementById(\'shadow-evidence-'+id+'\').value)">Heto dosjen · €10,000 · 2 javë</button>';
 if(job){html+='<div class="shadow-job-status"><strong>'+e(job.kind==='PLAN'?def.plan:'Shqyrtim i provave publike')+'</strong><p>'+e(({ACTIVE:'Në punë · edhe '+Math.max(0,job.dueTurn-st.turnCount)+' javë',READY:'Gati për vendim',COMPLETED:job.result==='PLAN'?'Alternativa u përgatit':job.result==='VERIFIED'?'Raport me prova i publikuar':'Akuzë pa prova e publikuar',CANCELLED:'Dosje e arkivuar'})[job.status])+'</p>';
 if(job.status==='ACTIVE')html+='<progress max="'+SHADOW_JOBS[job.kind].weeks+'" value="'+Math.min(SHADOW_JOBS[job.kind].weeks,Math.max(0,st.turnCount-job.startedTurn))+'" aria-label="Progresi i dosjes"></progress>';
 if(job.status==='READY')html+='<button class="action-btn" '+(busy||!job.evidenceId?'disabled':'')+' onclick="publishShadowReport(\''+job.id+'\',\'VERIFIED\')">Publiko raportin me prova</button><button class="action-btn" '+(busy||job.evidenceId?'disabled':'')+' onclick="publishShadowReport(\''+job.id+'\',\'UNSUPPORTED\')">Publiko akuzë pa prova · −1 kujtesë</button><button class="action-btn" '+(busy?'disabled':'')+' onclick="publishShadowReport(\''+job.id+'\',\'ARCHIVE\')">Arkivo pa akuza</button>';
 html+='</div>';}
 return html+'</article>';}).join('')+'</div><p class="muted">Një dosje për fushë çdo 8 javë; një alternativë për fushë dhe cikël. Raporti me prova sjell +0.5 kujtesë, akuza pa prova −1. Skandali burimor nuk penalizon qeverinë dy herë. Ndryshimi i përgjegjësit arkivon punën e papërfunduar pa rimbursim.</p></section>';
}
function openShadowHeadquarters(){if(!oppositionActive(state))return false;switchMainTab('tab-dashboard');renderOppositionHQ();document.getElementById('shadowCabinetPanel')?.scrollIntoView({block:'start'});return true;}
renderOppositionHQ=function(){shadowRender();const host=document.getElementById('oppositionHQ'),shortcut=document.getElementById('shadowHQShortcut');if(shortcut)shortcut.hidden=!oppositionActive(state);if(host&&oppositionActive(state))host.innerHTML+=shadowCabinetMarkup(state);};
function validateShadowCabinet(st){
 const db=st.opposition?.shadow;if(db===undefined)return;const bad=()=>{throw Error('Qeveria në Hije e ruajtur është e pavlefshme.');},turn=n=>Number.isInteger(n)&&n>=0&&n<=st.turnCount;
 if(!db||db.version!==1||!turn(db.startTurn)||!turn(db.lastTurn)||db.lastTurn<db.startTurn||!Array.isArray(db.appointments)||!Array.isArray(db.jobs))bad();const people=new Set(),posts=new Set();
 db.appointments.forEach((a,i)=>{const c=shadowCandidate(st,a.candidateId);if(a.id!=='shadow-appointment:'+i||!st.parties[a.owner]||!SHADOW_PORTFOLIOS[a.portfolio]||!c||cabinetIdentity(candidateName(c))!==cabinetIdentity(a.name)||!(c.partyId===a.owner||c.gamePartyIds?.includes(a.owner))||!turn(a.appointedTurn)||a.appointedTurn<db.startTurn||a.endedTurn!==null&&(!turn(a.endedTurn)||a.endedTurn<a.appointedTurn)||!Array.isArray(a.weeks)||a.weeks.some((t,j)=>!turn(t)||t<=a.appointedTurn||j&&t<=a.weeks[j-1]||a.endedTurn!==null&&t>a.endedTurn))bad();
 if(a.endedTurn===null){const person=a.owner+':'+cabinetIdentity(a.name),post=a.owner+':'+a.portfolio;if(people.has(person)||posts.has(post))bad();people.add(person);posts.add(post);}
 });
 const proofKeys=new Set(),plans=new Set(),lastJobs=new Map(),activePosts=new Set();db.jobs.forEach((j,i)=>{const def=SHADOW_JOBS[j.kind],a=db.appointments.find(a=>a.id===j.appointmentId);if(j.id!=='shadow-job:'+i||!def||!a||j.owner!==a.owner||j.portfolio!==a.portfolio||!st.parties[j.governmentParty]||typeof j.cycle!=='string'||!turn(j.startedTurn)||j.startedTurn<a.appointedTurn||a.endedTurn!==null&&j.startedTurn>a.endedTurn||j.dueTurn!==j.startedTurn+def.weeks||j.cost!==def.cost||!['ACTIVE','READY','COMPLETED','CANCELLED'].includes(j.status))bad();
 const post=j.owner+':'+j.portfolio,last=lastJobs.get(post);if(last!==undefined&&j.startedTurn<last+8)bad();lastJobs.set(post,j.startedTurn);if(['ACTIVE','READY'].includes(j.status)){if(activePosts.has(post))bad();activePosts.add(post);}
 if(j.evidenceId!==null){const proof=st.electoralMemory?.events.find(e=>e.id===j.evidenceId);if(j.kind!=='INVESTIGATE'||!proof||proof.party!==j.governmentParty||proof.party===j.owner||proof.score>=0||proof.turn>j.startedTurn||!['SCANDAL','PROJECT'].includes(proof.kind)||proof.kind==='PROJECT'&&j.portfolio!=='ECONOMY'&&civicEventSector(st,proof)!==SHADOW_PORTFOLIOS[j.portfolio].sector)bad();}
 if(j.status==='ACTIVE'||j.status==='READY'){if(j.result!==null||j.completedTurn!==null||j.closedTurn!==null||a.endedTurn!==null||j.status==='READY'&&(j.kind!=='INVESTIGATE'||st.turnCount<j.dueTurn))bad();}
 else if(j.status==='CANCELLED'){if(j.result!==null||j.completedTurn!==null||!turn(j.closedTurn)||j.closedTurn<j.startedTurn)bad();}
 else{if(!['PLAN','VERIFIED','UNSUPPORTED'].includes(j.result)||!turn(j.completedTurn)||j.completedTurn<j.dueTurn||j.closedTurn!==j.completedTurn||j.kind==='PLAN'&&j.result!=='PLAN'||j.kind==='INVESTIGATE'&&j.result==='PLAN'||j.result==='VERIFIED'&&!j.evidenceId||j.result==='UNSUPPORTED'&&j.evidenceId)bad();
 const key=j.owner+':'+j.evidenceId,plan=j.owner+':'+j.cycle+':'+j.portfolio;if(j.result==='VERIFIED'){if(proofKeys.has(key))bad();proofKeys.add(key);}if(j.result==='PLAN'){if(plans.has(plan))bad();plans.add(plan);}}
 });
}
validateLoadedState=function(st){shadowValidate(st);validateShadowCabinet(st);return st;};
