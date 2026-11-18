/* A party without elected MPs observes institutions; it does not operate them. */
const autonomousVoteToken=Object.freeze({});
let autonomousInstalling=false,allowCampaignWithoutList=false;
function outsideAssemblyTransition(st=state){
 const c=constituentComposition(st),cycle=constituentCycle(st);
 return !!c&&['PUBLISHED','SCENARIO'].includes(c.status)&&(cycle?.status==='RESULTS'||cycle?.source==='INITIAL_SCENARIO')&&!c.mandates.some(p=>p.partyId===st.playerParty&&p.total>0);
}
function autonomousCoalition(st=state){
 const groups=constituentGroups(constituentComposition(st)).filter(p=>p.total>0&&p.partyId!==st.playerParty),lead=groups[0]?.partyId;
 if(!lead)return null;const coalition=[lead];let seats=groups[0].total;
 const others=groups.slice(1).filter(p=>!(['LVV','SL'].includes(lead)&&['LVV','SL'].includes(p.partyId))).sort((a,b)=>(st.parties[b.partyId]?.relations?.[lead]??50)-(st.parties[a.partyId]?.relations?.[lead]??50)||b.total-a.total||a.partyId.localeCompare(b.partyId));
 for(const p of others){if(seats>=61)break;coalition.push(p.partyId);seats+=p.total;}
 return seats>=61?{lead,coalition,seats}:null;
}
function autonomousGovernmentVoteAuthorized(token){
 const s=currentConstituentSession(),r=s?.autonomousFormation;
 return token===autonomousVoteToken&&autonomousInstalling&&outsideAssemblyTransition()&&s.status==='COMPLETED'&&r?.status==='VOTED'&&r.leader===state.mandatar&&r.votes?.pro>=61&&r.votes.pro+r.votes.kunder===120&&r.coalition.join('|')===state.coalitionParties.join('|');
}
function processAutonomousInstitutions(turn=state.turnCount){
 if(!outsideAssemblyTransition()||state.governmentFormed||state.pendingVote||typeof electionNightDefersPublication==='function'&&electionNightDefersPublication(getElectionDayCycle(state)))return false;
 const plan=autonomousCoalition();if(!plan)return false;
 let s=currentConstituentSession();
 if(!s){openConstituentRecord();s=currentConstituentSession();}
 if(!s.autonomousFormation){
  const existing=state.coalitionAgreements||[];
  state.coalitionParties=plan.coalition.slice();
  state.coalitionAgreements=plan.coalition.slice(1).map(id=>existing.find(a=>a.partner===id&&a.honored!==false)||({partner:id,recipientParty:id,ministriesCount:1,deputyPM:false,honored:true,conditions:'Marrëveshje e simuluar mes partive parlamentare',formationCycle:s.cycleId}));
  s.autonomousFormation={version:1,leader:plan.lead,coalition:plan.coalition.slice(),openedTurn:turn,lastTurn:turn,status:'NEGOTIATING',votes:null};
 }
 const r=s.autonomousFormation;
 if(s.status!=='COMPLETED'){
  if(s.stage==='VERIFY'){s.verification={candidateIds:constituentComposition(state).deputies.map(mp=>mp.candidateId),at:constituentStamp(),simulatedPresence:120};s.stage='OATH';}
  if(s.stage==='OATH'){s.oath={candidateIds:s.verification.candidateIds.slice(),at:constituentStamp(),simulation:true};s.stage='ELECTIONS';}
  for(let i=0;i<24&&s.status!=='COMPLETED';i++){
   if(s.rounds.some(x=>x.revealed<120))throw Error('Numërimi i seancës duhet përfunduar para vazhdimit automatik.');
   syncAutomaticConstituentProposal(state,s,constituentComposition(state));if(!s.proposal)throw Error('Nuk u gjet propozimi institucional.');
   applyConstituentProposal(s,'abstenim');
  }
  if(s.status!=='COMPLETED')throw Error('Seanca nuk arriti shumicën; votat nuk u ndryshuan.');
  r.status='NEGOTIATING';r.lastTurn=turn;sealConstituentSession(s);
  state.historyLog.unshift('Kuvendi u konstituua nga partitë e zgjedhura. Partia juaj nuk ka deputetë dhe vazhdon veprimtarinë jashtë Kuvendit.');return true;
 }
 if(turn<=r.lastTurn)return false;
 state.mandatar=r.leader;state.institutionalPhase='GOV_FORMATION';state.governmentStatus='CARETAKER';
 const attempts=state.governmentFormationAttempts||=[];let attempt=attempts.at(-1);
 if(!attempt||attempt.status!=='PENDING'){if(attempts.length>=2)return false;attempt={partyId:r.leader,appointedAt:constituentStamp(),status:'PENDING',deadlineDays:15};attempts.push(attempt);}
 if(attempt.partyId!==r.leader)throw Error('Mandatari nuk përputhet me negociatat.');
 state.coalitionParties=r.coalition.slice();state.cabinetProposal=buildDefaultCabinetProposal();state.cabinetApproved=true;
 const problem=cabinetProposalProblem(state);if(problem)throw Error(problem);
 const pro=state.mps.filter(m=>r.coalition.includes(m.party)).length;if(pro<61)throw Error('Koalicioni nuk ka 61 deputetë.');
 r.votes={pro,kunder:120-pro};r.status='VOTED';r.lastTurn=turn;sealConstituentSession(s);
 autonomousInstalling=true;try{installApprovedGovernment(pro,autonomousVoteToken);}finally{autonomousInstalling=false;}
 r.status='APPROVED';sealConstituentSession(s);state.historyLog.unshift('Partitë parlamentare formuan Qeverinë: '+r.coalition.map(id=>state.parties[id].name).join(' + ')+'. '+pro+' vota pro. Partia juaj mbetet jashtë Kuvendit.');return true;
}
const autonomousWeek=processPoliticalLifeWeek,autonomousValidate=validateLoadedState;
processPoliticalLifeWeek=function(turn){processAutonomousInstitutions(turn);return autonomousWeek(turn);};
validateLoadedState=function(st){autonomousValidate(st);for(const s of st.constituentSessions||[]){const r=s.autonomousFormation;if(!r)continue;const c=constituentCompositionById(st,s.cycleId);if(r.version!==1||!['NEGOTIATING','VOTED','APPROVED'].includes(r.status)||!Number.isInteger(r.openedTurn)||r.openedTurn<0||r.openedTurn>r.lastTurn||r.lastTurn>st.turnCount||!Array.isArray(r.coalition)||new Set(r.coalition).size!==r.coalition.length||r.coalition[0]!==r.leader||r.coalition.some(id=>!c.mandates.some(p=>p.partyId===id&&p.total>0))||c.mandates.some(p=>p.partyId===st.playerParty&&p.total>0)||r.coalition.reduce((n,id)=>n+c.mandates.find(p=>p.partyId===id).total,0)<61)throw Error('Procesi automatik i institucioneve është i pavlefshëm.');if(r.votes&&(r.votes.pro!==c.deputies.filter(m=>r.coalition.includes(m.partyId)).length||r.votes.pro<61||r.votes.kunder!==120-r.votes.pro)||r.status==='APPROVED'&&!r.votes)throw Error('Votimi automatik nuk përputhet me mandatet.');}return st;};
const autonomousConstituentRender=renderConstituentSession,autonomousCoalitionRender=renderCoalitionNegotiations;
function outsideAssemblyMarkup(){return '<div class="card"><h3>Partia juaj është jashtë Kuvendit</h3><p>Konstituimin, negociatat dhe votimin e Qeverisë i kryejnë partitë e zgjedhura. Procesi vazhdon me kalimin e javëve. Ju vazhdoni organizimin e partisë dhe aktivitetet publike.</p><button class="action-btn" onclick="switchMainTab(&quot;tab-party&quot;)">Vazhdo te partia</button></div>';}
renderConstituentSession=function(){if(!outsideAssemblyTransition())return autonomousConstituentRender();const host=document.getElementById('constituentPanel');if(host)host.innerHTML=outsideAssemblyMarkup();};
renderCoalitionNegotiations=function(){if(!outsideAssemblyTransition())return autonomousCoalitionRender();const host=document.getElementById('coalitionNegotiationContainer');if(host)host.innerHTML=outsideAssemblyMarkup();};
const listFinishCampaign=finishCampaign,listRenderElectoral=renderElectoralList;
function campaignListReady(){const list=getCurrentElectoralList();return list?.status==='SUBMITTED'&&(!state.parties[state.playerParty].customFounded||careerDB()?.registered);}
finishCampaign=function(){if(state.electionPhase==='CAMPAIGN'&&state.electionCampaign?.status==='READY'&&!campaignListReady()&&!allowCampaignWithoutList){const result=validateElectoralList(getCurrentElectoralList(),getCandidateCatalogue(state)),box=document.getElementById('interactiveActionModalContent');box.innerHTML='<h2>Lista juaj ende nuk është dorëzuar</h2>'+(!careerDB()?.registered&&state.parties[state.playerParty].customFounded?'<p>Subjekti ende nuk është përgatitur për garim. Plotëso kushtet te Partia ose te përgatitja e listës.</p>':'')+'<p>Ruajtja e draftit ose kontrolli i listës nuk e dorëzon atë. Para mbylljes së fushatës mund ta përfundoni dorëzimin.</p>'+(!result.valid?'<p>'+electoralEscape(result.errors.join(' '))+'</p>':'<button class="action-btn btn-gold" onclick="submitListAndFinishCampaign()">Dorëzo listën dhe përfundo fushatën</button>')+'<button class="action-btn" onclick="toggleModal(&quot;interactiveActionModal&quot;,false);openElectionPreparation()">Përgatit listën</button><button class="action-btn" onclick="finishCampaignWithoutList()">Vazhdo pa listë të dorëzuar</button>';toggleModal('interactiveActionModal',true);return false;}return listFinishCampaign();};
function submitListAndFinishCampaign(){if(!submitElectoralList())return false;return finishCampaign();}
function finishCampaignWithoutList(){allowCampaignWithoutList=true;try{return finishCampaign();}finally{allowCampaignWithoutList=false;toggleModal('interactiveActionModal',false);}}
renderElectoralList=function(){listRenderElectoral();const list=getCurrentElectoralList(),result=validateElectoralList(list,getCandidateCatalogue(state)),badge=document.getElementById('listLegalBadge');if(badge)badge.textContent=list?.status==='SUBMITTED'?'Lista është dorëzuar për këtë cikël':result.valid?'Lista kalon kontrollin · ende e padorëzuar':'Lista kërkon plotësim';};

const outsideEntryRequired=constituentEntryRequired;
constituentEntryRequired=function(st){return !outsideAssemblyTransition(st)&&outsideEntryRequired(st);};

const registeredSubmitList=submitElectoralList;
submitElectoralList=function(){if(state.parties[state.playerParty].customFounded&&!careerDB()?.registered){showToast('Përgatit subjektin për garim: programi, 40 anëtarë, një degë, dy bashkëpunëtorë të pranuar dhe €1,000. Te Partia gjendet përgatitja e subjektit.');return false;}return registeredSubmitList();};
function registerPartyForCurrentElection(){if(!careerRegister())return false;renderElectoralList();showToast('Subjekti u përgatit. Tani dorëzo listën e kandidatëve.');return true;}
const registrationListRender=renderElectoralList;
renderElectoralList=function(){registrationListRender();if(!state.parties[state.playerParty].customFounded||careerDB()?.registered)return;const d=careerDB(),box=document.getElementById('electoralListValidation');if(box)box.innerHTML='<p>Para dorëzimit përgatit subjektin: program '+(d.programme?'✓':'mungon')+' · anëtarë '+d.members+'/40 · degë '+d.branches+'/1 · bashkëpunëtorë '+d.recruits.filter(r=>r.status==='ACCEPTED').length+'/2. Kosto: €1,000 nga partia.</p><button class="action-btn" onclick="registerPartyForCurrentElection()">Përgatit subjektin për garim · €1,000</button>';};

const outsiderStartConstituent=startConstituentSession;
startConstituentSession=function(){if(outsideAssemblyTransition()){showToast('Partitë e zgjedhura e zhvillojnë vetë seancën. Mund ta vazhdosh javën dhe aktivitetin e partisë.');return false;}return outsiderStartConstituent();};
