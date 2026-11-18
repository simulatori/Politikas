/* Adapters over existing transactions and queues; old answered text remains frozen. */
const ctxConferenceSources=conferenceSources,ctxConferenceRecord=conferenceSourceRecord,
 ctxConferenceBuild=conferenceBuildQuestion,ctxConferenceObserve=conferenceObserve,
 ctxConferenceTone=deepConferenceTone,ctxConferenceReaction=conferenceReaction,
 ctxConferenceAnswer=answerDynamicConference,ctxConferenceMetric=conferenceMetric,
 ctxSpeechSources=liveSpeechSources,ctxSpeechInvite=liveSpeechInvite,
 ctxSpeechOptions=liveSpeechOptions,ctxSpeechObserve=liveSpeechObserve,
 ctxSpeechChoose=chooseLiveSpeech,ctxSpeechFinish=finishLiveSpeech,ctxOpenSpeech=openLiveSpeech,
 ctxCreateDebate=createCareerDebate,ctxOpenDebate=openCareerDebate,ctxCareerStep=careerDebateStep,
 ctxAnswerDebate=answerCareerDebate,ctxPrepareEvents=prepareLoadedState,ctxValidateEvents=validateLoadedState;
function contextPlanKey(plan){const e=plan?.event;return e?e.kind+':'+e.ref+':'+(e.action_key||e.phase||e.turn):null;}
function contextConferenceSource(plan){
 const e=plan.event,s=conferenceSource('CONTEXT',e.ref,e.action_key||e.phase||String(e.turn),plan.category==='CRISIS'?plan.snapshotTurn:e.turn,({EDUCATION:'PROTEST',COMMUNITY:'PROJECT',JUSTICE:'LAW'})[plan.topic]||'ECONOMY',e.title,e.facts,plan.sector,plan.category==='CRISIS',plan.priority,'context:'+e.kind+':'+e.ref);
 s.contextEvent=JSON.parse(JSON.stringify(plan));return s;
}
conferenceSourceRecord=function(st,s){return s.kind==='CONTEXT'?contextRecord(s.contextEvent?.event||{},st):ctxConferenceRecord(st,s);};
conferenceSources=function(st){
 const original=ctxConferenceSources(st),eligible=contextEventManager.eligible(st),critical=eligible.find(x=>x.event.active);
 // A current severe crisis takes precedence; unrelated generic topics wait.
 if(critical){const plan=contextEventManager.build(critical.event,st);return [contextConferenceSource(plan)];}
 const additions=eligible.filter(x=>x.event.player_owned).map(x=>contextConferenceSource(contextEventManager.build(x.event,st)));
 return additions.concat(original.filter(s=>!additions.some(a=>a.ref===s.ref&&['LAW','CASE','PAYMENT'].includes(s.kind))));
};
conferenceBuildQuestion=function(source,index,id,st=state){
 const q=ctxConferenceBuild(source,index,id,st),plan=source.contextEvent;if(!plan)return q;
 q.contextEvent=JSON.parse(JSON.stringify(plan));q.promisable=false;q.text=plan.question;
 q.deepContext={version:1,turn:plan.snapshotTurn,title:plan.event.title,topic:plan.topic,measure:'shqyrtim të dokumentuar të vendimit',risk:plan.risk,proof:plan.proof,facts:plan.bindings.facts,lawId:plan.event.kind==='LAW'?plan.event.ref:null,adverse:plan.category==='CRISIS',sensitive:plan.category==='CRISIS'};
 q.options=plan.options.map(o=>({tone:o.tone,text:o.text,stat_changes:{...o.stat_changes}}));return q;
};
conferenceObserve=function(st=state){
 const d=conferenceDB(st),plan=contextEventManager.select(st);
 if(d){
  const source=plan&&contextConferenceSource(plan);if(plan?.category==='CRISIS')d.pending=d.pending.filter(s=>s.key===source.key);
  for(const r of d.sessions.filter(r=>['INVITED','ACTIVE'].includes(r.status)&&conferenceAdmissible(r,st)&&(st.turnCount<=r.expiresTurn||r.questions.some(q=>q.source.kind==='LEGACY'||q.contextEvent?.category==='CRISIS'&&contextPlanIsCurrent(q.contextEvent,st))))){
   const index=r.answers.length;if(index>=3)continue;
   const old=r.questions[index]?.contextEvent,stale=old&&!contextPlanIsCurrent(old,st);
   if(stale&&!plan){r.status='CANCELLED';r.closedTurn=st.turnCount;conferenceSeal(r);continue;}
   if(source&&(plan.category==='CRISIS'||stale)&&contextPlanKey(old)!==contextPlanKey(plan)){
    if(!d.seen.includes(source.key))d.seen.push(source.key);
    const displaced=r.questions.slice(index).map(q=>q.source.key);r.questions=r.questions.slice(0,index).concat(conferenceBuildQuestion(source,index,r.id,st));
    d.seen=d.seen.filter(key=>!displaced.includes(key)||d.sessions.some(s=>s.questions.some(q=>q.source.key===key)));conferenceSeal(r);
   }
  }
 }
 return ctxConferenceObserve(st);
};
deepConferenceTone=function(q,tone){const o=q.contextEvent&&q.options.find(o=>o.tone===tone);return o?.stat_changes?contextNativeDeltas(o.stat_changes):ctxConferenceTone(q,tone);};
conferenceReaction=function(q,tone,mode){if(!q.contextEvent)return ctxConferenceReaction(q,tone,mode);return (tone==='AGGRESSIVE'?'Gazetari e rikthen debatin te faktet. ':tone==='DIPLOMATIC'?'Gazetari kërkon përgjegjës dhe afat pas konsultimit. ':'Gazetari kërkon prova për qëndrimin. ')+'Duhet të verifikohen '+q.contextEvent.proof+'. Deklarata nuk e ndryshoi vetë vendimin ose gjendjen e shërbimit.';};
conferenceMetric=function(st,s){if(s.kind!=='CONTEXT')return ctxConferenceMetric(st,s);const e=s.contextEvent.event,r=contextRecord(e,st);if(e.kind==='STRIKE'||e.kind==='STRIKE_DECISION')return r?.status==='SETTLED'?100:0;if(e.kind==='COMMUNITY')return r?.status==='COMPLETED'?100:0;if(e.kind==='LAW')return r?.applied?100:r?.status==='PASSED'?60:0;if(e.kind==='EMERGENCY')return r?.status==='FUNDED'?100:0;return 0;};
answerDynamicConference=function(id,index,tone){
 const r=conferenceSession(id),current=contextEventManager.select(state);
 if(!r||!['INVITED','ACTIVE'].includes(r.status)||r.feedbackIndex!==null||index!==r.answers.length)return ctxConferenceAnswer(id,index,tone);
 if(r&&(r.questions[index]?.contextEvent&&!contextPlanIsCurrent(r.questions[index].contextEvent,state)||current?.category==='CRISIS'&&contextPlanKey(r.questions[index]?.contextEvent)!==contextPlanKey(current))){
  const ok=lifeCommit(()=>conferenceObserve(state),false);if(ok){renderDynamicConference(id);showToast('Aktualiteti ndryshoi. Lexoje pyetjen e përditësuar para përgjigjes.');}return false;
 }
 return ctxConferenceAnswer(id,index,tone);
};
function contextSpeechScript(plan,source,legacyChoices=[]){
 const venue=source.kind==='BRUSSELS'?'Para partnerëve evropianë, ':source.kind==='HOST'?'Në këtë forum, ':source.kind==='REPORT'?'Para Kuvendit, ':'Para qytetarëve, ';
 const approach={
  FACTS:{opening:'Do të ndaj çfarë është vendosur nga çfarë ende duhet provuar.',context:'Këto të dhëna janë baza e vlerësimit, jo dëshmi automatike e suksesit.',check:'Kërkoj raport të verifikueshëm për ',risk:'Do ta rishikojmë qëndrimin nëse kjo provë nuk e mbështet.',close:'Angazhimi im është të raportoj çfarë u realizua dhe çfarë mbeti pa zbatim për '},
  ASSERT:{opening:'Kërkoj që kjo çështje të marrë përparësi politike dhe vëmendje publike.',context:'Për këto të dhëna do të kërkoj përgjegjësi publike; qytetarët nuk duhet të pranojnë shtyrje pa shpjegim.',check:'Do të ushtroj presion publik që të jepet llogari për ',risk:'Presioni nuk e zëvendëson provën ose autorizimin, por nuk do të hesht për vonesat.',close:'Kërkoj mobilizim publik që institucionet të japin llogari për '},
  BRIDGE:{opening:'Ftoj palët e prekura ta trajtojmë këtë çështje bashkë, edhe kur qëndrimet tona ndryshojnë.',context:'Këto janë të dhënat që u kërkoj palëve t’i shqyrtojmë në të njëjtën tryezë.',check:'Do të kërkoj vlerësim të përbashkët dhe vërejtje të argumentuara mbi ',risk:'Nëse nuk pajtohemi, do t’i bëjmë publike dallimet në vend që të shpallim një marrëveshje të paqenë.',close:'Do të kërkoj përgjegjësi të qarta mes palëve dhe raportim të përbashkët mbi '}
 };
 const steps=[{}, {}, {}, {}, {}];for(const o of plan.options.filter(o=>o.speech)){
  const t=approach[o.speech];
  steps[0][o.speech]=venue+interpolateContext('fokusi i këtij adresimi është {current_main_issue}. ',plan.bindings)+(plan.category==='CRISIS'?'Situata mbetet aktive. ':'Duhet të shpjegojmë vendimin e regjistruar. ')+t.opening;
  steps[1][o.speech]=plan.bindings.facts+' '+t.context+' '+plan.bindings.authority;
  steps[2][o.speech]=o.text;
  steps[3][o.speech]=t.check+plan.proof+'. Rreziku është që '+plan.risk+'. '+t.risk;
  steps[4][o.speech]=t.close+plan.proof+'. Për '+plan.event.title+' nuk do të premtoj masa jashtë kompetencës ose financimit të autorizuar.';
 }
 return {version:3,title:plan.event.title,context:plan.bindings.facts,steps,legacyChoices:JSON.parse(JSON.stringify(legacyChoices))};
}
function attachContextSpeech(r,plan){if(!plan)return;for(const c of r.choices)if(!c.stat_changes){const t=contextSpeechDeltas(r.source,c.code);c.stat_changes={popularity:t.approval,budget:0,international_relations:t.international,opposition_anger:t.opposition,government_stability:0,credibility:0,media_trust:0};}r.source.contextEvent=JSON.parse(JSON.stringify(plan));r.source.speechScript=contextSpeechScript(plan,r.source,r.choices);r.source.facts=plan.bindings.facts;r.source.adverse=plan.category==='CRISIS';liveSpeechSeal(r);}
function contextPlanForSpeech(source,st=state){const main=contextEventManager.select(st);if(main?.category==='CRISIS'||source.kind==='GOVERNMENT')return main;if(source.kind==='MEDIA'){const old=source.contextEvent||source.origin?.contextEvent;return old&&contextPlanIsCurrent(old,st)?contextEventManager.build(old.event,st):main;}return null;}
function restoreContextSpeech(r,st=state){const source=ctxSpeechSources(st).find(s=>s.key===r.source.key);if(!source)return false;delete r.source.contextEvent;r.source.speechScript=buildEditorialSpeech(source,st);r.source.speechScript.legacyChoices=JSON.parse(JSON.stringify(r.choices));r.source.facts=r.source.speechScript.context;r.source.adverse=source.adverse;if(r.source.deepSpeech){r.source.deepSpeech=depthContext(source,st);r.source.deepSpeech.legacyChoices=JSON.parse(JSON.stringify(r.choices));}liveSpeechSeal(r);return true;}
liveSpeechSources=function(st){
 const rows=ctxSpeechSources(st),plan=agendaExecutive(st)&&contextEventManager.select(st);
 if(plan){const source=contextConferenceSource(plan),key='MEDIA:'+source.cluster+':'+source.phase;const existing=rows.find(s=>s.key===key);if(existing)existing.contextEvent=plan;else rows.push({key,kind:'MEDIA',ref:source.key,title:plan.event.title,facts:plan.bindings.facts,turn:plan.event.turn,adverse:plan.category==='CRISIS',origin:source,contextEvent:plan});}
 return rows;
};
liveSpeechInvite=function(source,st=state){const r=ctxSpeechInvite(source,st);if(r)attachContextSpeech(r,source.contextEvent||contextPlanForSpeech(source,st));return r;};
liveSpeechOptions=function(source,step,choices=[]){
 const plan=source.contextEvent;if(!plan)return ctxSpeechOptions(source,step,choices);
 return plan.options.filter(o=>o.speech).map(o=>({code:o.speech,label:o.label,hint:o.id==='PRAGMATIC'?'Faktet dhe përgjegjësia':o.id==='POPULIST'?'Presion publik dhe rrezik tensioni':'Koordinim me palët',text:source.speechScript.legacyChoices.find(c=>c.step===step&&c.code===o.speech)?.text||source.speechScript.steps[step][o.speech],stat_changes:{...o.stat_changes,government_stability:0,credibility:0,media_trust:0}}));
};
function contextSpeechDeltas(source,code,choice){if(choice?.stat_changes)return contextNativeDeltas(choice.stat_changes);const o=source.contextEvent?.options.find(o=>o.speech===code);return o?contextNativeDeltas(o.stat_changes):LIVE_SPEECH_APPROACHES[code];}
liveSpeechObserve=function(st=state){
 const result=ctxSpeechObserve(st),plan=agendaExecutive(st)&&contextEventManager.select(st);if(!plan)return result;
 const d=liveSpeechDB(st);if(!d)return result;
 for(const r of d.records.filter(r=>r.owner===st.playerParty&&['INVITED','DRAFT'].includes(r.status)&&liveSpeechValidSource(r.source,st))){
  const current=contextPlanForSpeech(r.source,st);if(!r.choices.length&&current&&contextPlanKey(r.source.contextEvent)!==contextPlanKey(current))attachContextSpeech(r,current);
 }
 if(d.records.filter(r=>['INVITED','DRAFT'].includes(r.status)).length<4&&!d.records.some(r=>['INVITED','DRAFT','FINISHED'].includes(r.status)&&contextPlanKey(r.source.contextEvent)===contextPlanKey(plan))){const source=liveSpeechSources(st).find(s=>s.contextEvent&&contextPlanKey(s.contextEvent)===contextPlanKey(plan));if(source&&!d.seen.includes(source.key))liveSpeechInvite(source,st);}
 return result;
};
function refreshChangedSpeech(id){const r=liveSpeechRecord(id);if(!r||!['INVITED','DRAFT'].includes(r.status))return false;const plan=contextPlanForSpeech(r.source,state);if(contextPlanKey(r.source.contextEvent)===contextPlanKey(plan))return false;
 const ok=lifeCommit(()=>{const current=liveSpeechRecord(id);if(current.choices.length===5){current.source.contextDraftArchive=(current.source.contextDraftArchive||[]).concat({turn:state.turnCount,choices:JSON.parse(JSON.stringify(current.choices))}).slice(-3);current.choices=[];current.status='INVITED';}if(plan)attachContextSpeech(current,plan);else if(!restoreContextSpeech(current)){current.status='CANCELLED';liveSpeechSeal(current);}});if(ok){if(liveSpeechRecord(id).status==='CANCELLED')toggleModal('liveSpeechModal',false);else renderLiveSpeech(id);showToast('Rrethanat ndryshuan. Drafti i mëparshëm ruhet; lexo aktualitetin para publikimit.');}return true;}
chooseLiveSpeech=function(id,step,code){const r=liveSpeechRecord(id);if(!r||r.choices.length!==step||!['INVITED','DRAFT'].includes(r.status))return ctxSpeechChoose(id,step,code);if(refreshChangedSpeech(id))return false;return ctxSpeechChoose(id,step,code);};
openLiveSpeech=function(id){refreshChangedSpeech(id);return ctxOpenSpeech(id);};
finishLiveSpeech=function(id){const r=liveSpeechRecord(id);if(r?.choices.length===5&&['INVITED','DRAFT'].includes(r.status)&&refreshChangedSpeech(id))return false;return ctxSpeechFinish(id);};
function contextDebateScript(r,st=state){
 const plans=Array.from({length:5},(_,step)=>GenerateDebateQuestion(st,{step,actionIndex:step===3?1:step===4?2:0}));if(!plans[0])return null;
 const old=r.script||[],frames=plans.map((p,step)=>step<r.answers.length?r.contextFrames?.[step]||null:p);
 const script=plans.map((plan,step)=>{if(step<r.answers.length)return old[step];const codes=new Set(step?['PRAGMATIC','POPULIST','DIPLOMATIC']:['DEFAULT']);if(step===r.answers.length&&step)codes.add(r.answers.at(-1).code);
  return Object.fromEntries([...codes].map(previous=>{const q=GenerateDebateQuestion(st,{step,actionIndex:step===3?1:step===4?2:0,previousAnswer:previous});return [previous,{question:q.question,contextFrame:step}];}));});
 return {script,frames};
}
function attachContextDebate(r,st=state){const plan=GenerateDebateQuestion(st);if(!plan)return false;const built=contextDebateScript(r,st);r.contextEvent=plan;r.script=built.script;r.contextFrames=built.frames;r.scriptVersion=2;r.snapshot.quality=crisisSectorMetric(st,plan.sector);r.snapshot.contextSnapshotTurn=st.turnCount;r.snapshot.inflation=st.inflation;r.snapshot.unemployment=st.unemployment;if(CAREER_DEBATE_TOPICS[plan.topic])r.topic=plan.topic;return true;}
careerDebateStep=function(r){const q=ctxCareerStep(r);if(!Number.isInteger(q?.contextFrame))return q;const plan=r.contextFrames?.[q.contextFrame];if(!plan)throw Error('Mungon konteksti i hapit të debatit.');return {question:q.question,contextEvent:plan,options:plan.options.map(o=>({code:o.id,label:o.label,text:o.text,gain:o.stat_changes.popularity,stat_changes:{...o.stat_changes}}))};};
createCareerDebate=function(){const plan=GenerateDebateQuestion(state);if(!plan)return null;const key=contextPlanKey(plan)+'|'+(plan.actionRef?.action_key||'');if(careerDB()?.debates.some(r=>r.contextEvent&&r.status!=='CANCELLED'&&contextPlanKey(r.contextEvent)+'|'+(r.contextEvent.actionRef?.action_key||'')===key))return null;const r=ctxCreateDebate();if(r)attachContextDebate(r,state);return r;};
openCareerDebate=function(id){const r=careerDebate(id);if(r&&['INVITED','ACTIVE'].includes(r.status)&&(!r.contextEvent||!r.answers.length)){const plan=GenerateDebateQuestion(state);if(plan&&(contextPlanKey(plan)!==contextPlanKey(r.contextEvent)||!contextPlanIsCurrent(r.contextEvent,state))){if(!careerCommit(()=>attachContextDebate(careerDebate(id))))return false;}else if(!plan&&r.contextEvent){careerCommit(()=>{careerDebate(id).status='CANCELLED';});showToast('Nuk ka më një shkak aktual për këtë debat.');return false;}}return ctxOpenDebate(id);};
answerCareerDebate=function(id,step,code){const r=careerDebate(id);if(!r||r.status!=='ACTIVE'||r.answers.length!==step)return ctxAnswerDebate(id,step,code);const plan=GenerateDebateQuestion(state),asked=r&&['INVITED','ACTIVE'].includes(r.status)?careerDebateStep(r)?.contextEvent:null;if(r&&(plan&&!r.contextEvent||asked&&!contextPlanIsCurrent(asked,state)||plan?.category==='CRISIS'&&contextPlanKey(r.contextEvent)!==contextPlanKey(plan))){
 const ok=careerCommit(()=>{if(plan)attachContextDebate(careerDebate(id));else careerDebate(id).status='CANCELLED';});if(ok){renderCareerDebate(id);showToast('Aktualiteti ndryshoi: pyetja u përditësua. Lexoje para se të përgjigjesh.');}return false;
 }return ctxAnswerDebate(id,step,code);};
function applyContextDebateStats(changes){
 // Called only inside the native career transaction, which owns rollback/replay guards.
 if(changes.budget!==0)throw Error('Dialogu nuk autorizon pagesa. Përdor procedurën fiskale.');
 careerPollGain(changes.popularity);const owner=state.playerParty;
 state.parties[owner].internalCohesion=clamp((state.parties[owner].internalCohesion??50)+changes.government_stability,0,100);
 for(const id of conferenceOpponents(state)){state.parties[id].relations=state.parties[id].relations||{};state.parties[owner].relations=state.parties[owner].relations||{};state.parties[id].relations[owner]=clamp((state.parties[id].relations[owner]??50)-changes.opposition_anger,0,100);state.parties[owner].relations[id]=clamp((state.parties[owner].relations[id]??50)-changes.opposition_anger,0,100);}
 state.governance.credibility=clamp(state.governance.credibility+changes.credibility,0,100);state.governance.mediaTrust=clamp(state.governance.mediaTrust+changes.media_trust,0,100);
}
function validateContextPlan(p,st){
 const def=CONTEXT_EVENT_DEFINITIONS.find(d=>d.id===p?.definitionId),bad=()=>{throw Error('Konteksti i eventit është i pavlefshëm.');};
 if(!def||p.version!==1||!Number.isInteger(p.snapshotTurn)||p.snapshotTurn<0||p.snapshotTurn>st.turnCount||!contextRecord(p.event,st)||!st.parties[p.owner]||typeof p.government!=='boolean'||typeof p.question!=='string'||!Array.isArray(p.options)||p.options.length<3||!contextCondition(def.trigger_condition,{event:p.event,economy:{inflation:Number(p.bindings?.inflation)}}))bad();
 const ids=new Set();for(const o of p.options){const known=CONTEXT_DIALOGUE_OPTIONS.find(x=>x.id===o.id);if(!known||ids.has(o.id)||typeof o.text!=='string'||!o.stat_changes||Object.entries({...known.stat_changes,...(!p.government?{international_relations:0}:{})}).some(([k,v])=>o.stat_changes[k]!==v))bad();ids.add(o.id);}
}
function validateContextEventState(st){
 if(st.governance.contextActionSequence!==undefined&&(!Number.isSafeInteger(st.governance.contextActionSequence)||st.governance.contextActionSequence<0))throw Error('Rendi i veprimeve është i pavlefshëm.');
 for(const r of conferenceDB(st)?.sessions||[])for(const q of r.questions)if(q.contextEvent){validateContextPlan(q.contextEvent,st);if(q.text!==q.contextEvent.question||q.options.some(o=>{const known=q.contextEvent.options.find(k=>k.tone===o.tone);return !known||known.text!==o.text||JSON.stringify(known.stat_changes)!==JSON.stringify(o.stat_changes);}))throw Error('Përgjigjja nuk përputhet me ngjarjen e konferencës.');}
 for(const r of liveSpeechDB(st)?.records||[]){if(r.source.contextEvent)validateContextPlan(r.source.contextEvent,st);for(const c of r.choices){if(c.stat_changes){const palettes=CONTEXT_DIALOGUE_OPTIONS.map(o=>({...o.stat_changes,government_stability:0,credibility:0,media_trust:0})).concat(Object.values(LIVE_SPEECH_APPROACHES).map(o=>({popularity:o.approval,budget:0,international_relations:o.international,opposition_anger:o.opposition,government_stability:0,credibility:0,media_trust:0})));if(!palettes.some(p=>Object.keys(p).length===Object.keys(c.stat_changes).length&&Object.entries(p).every(([k,v])=>c.stat_changes[k]===v)))throw Error('Efektet e fjalimit nuk përputhen me qasjen e zgjedhur.');}}}
 for(const r of careerDB(st)?.debates||[]){if(r.contextEvent)validateContextPlan(r.contextEvent,st);if(r.contextFrames){if(!Array.isArray(r.contextFrames)||r.contextFrames.length!==5)throw Error('Hapat e kontekstit janë të pavlefshëm.');for(const p of r.contextFrames)if(p)validateContextPlan(p,st);}for(const [step,path] of (r.script||[]).entries())for(const q of Object.values(path)){if(q.contextFrame!==undefined&&(q.contextFrame!==step||!r.contextFrames?.[step]||typeof q.question!=='string'))throw Error('Lidhja e pyetjes me kontekstin është e pavlefshme.');if(q.contextEvent){validateContextPlan(q.contextEvent,st);if(q.options.some(o=>{const known=q.contextEvent.options.find(k=>k.id===o.code),expected=known&&{...known.stat_changes,...(!q.contextEvent.government?{international_relations:0}:{})};return !known||known.text!==o.text||JSON.stringify(expected)!==JSON.stringify(o.stat_changes)||o.gain!==expected.popularity;}))throw Error('Përgjigjja e debatit nuk përputhet me kontekstin.');}}}
 return st;
}
validateLoadedState=function(st){ctxValidateEvents(st);return validateContextEventState(st);};
prepareLoadedState=function(raw){const st=ctxPrepareEvents(raw);
 // Upgrade only material that has not received an answer. Historical text stays exact.
 for(const r of careerDB(st)?.debates||[])if(['INVITED','ACTIVE'].includes(r.status)&&!r.contextEvent&&!attachContextDebate(r,st)){r.status='CANCELLED';r.cancelledTurn=st.turnCount;}
 for(const r of liveSpeechDB(st)?.records||[])if(r.status==='INVITED'&&!r.choices.length){const p=contextPlanForSpeech(r.source,st);if(p)attachContextSpeech(r,p);}
 const current=contextEventManager.select(st);if(current?.category==='CRISIS'){
  const c=conferenceDB(st),source=contextConferenceSource(current);if(c&&!c.sessions.some(r=>r.questions.some(q=>q.source.key===source.key))&&!c.pending.some(s=>s.key===source.key))c.seen=c.seen.filter(key=>key!==source.key);
  conferenceObserve(st);
  if(agendaExecutive(st)){const d=liveSpeechDB(st),s=liveSpeechSources(st).find(s=>s.contextEvent&&contextPlanKey(s.contextEvent)===contextPlanKey(current));if(d&&s&&!d.records.some(r=>r.source.key===s.key||contextPlanKey(r.source.contextEvent)===contextPlanKey(current)))d.seen=d.seen.filter(key=>key!==s.key);liveSpeechObserve(st);}
 }
 validateDynamicConferences(st);validateLiveSpeeches(st);for(const r of careerDB(st)?.debates||[])validateCareerDebate(r,st);validateContextEventState(st);
 return st;
};
