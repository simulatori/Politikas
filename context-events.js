/* Pure selection, interpolation and native-record adapters. No parallel economy or UI queue. */
function stampContextAction(record,kind,st=state){
 const sequence=(st.governance.contextActionSequence||0)+1;st.governance.contextActionSequence=sequence;
 record.contextAction={kind,owner:st.playerParty,turn:st.turnCount,sequence};return record.contextAction;
}
function contextPath(object,path){
 if(typeof path!=='string'||path.split('.').some(k=>['__proto__','prototype','constructor'].includes(k)))throw Error('Shteg i palejuar në kushtin e eventit.');
 return path.split('.').reduce((value,key)=>value!=null&&Object.hasOwn(value,key)?value[key]:undefined,object);
}
function contextCondition(condition,context){
 if(!condition||typeof condition!=='object')return false;
 if(condition.all)return Array.isArray(condition.all)&&condition.all.length>0&&condition.all.every(c=>contextCondition(c,context));
 if(condition.any)return Array.isArray(condition.any)&&condition.any.length>0&&condition.any.some(c=>contextCondition(c,context));
 if(!['path','op','value'].every(k=>Object.hasOwn(condition,k)))throw Error('Kushti i eventit është i paplotë.');
 const actual=contextPath(context,condition.path);
 switch(condition.op){case 'eq':return actual===condition.value;case 'gte':return Number.isFinite(actual)&&actual>=condition.value;case 'lte':return Number.isFinite(actual)&&actual<=condition.value;case 'in':return Array.isArray(condition.value)&&condition.value.includes(actual);default:throw Error('Operator i panjohur i trigger-it.');}
}
function interpolateContext(template,bindings){
 return String(template).replace(/\{([a-zA-Z_][\w.]*)\}/g,(_,path)=>{const value=contextPath(bindings,path);if(!['string','number','boolean'].includes(typeof value)||typeof value==='number'&&!Number.isFinite(value))throw Error('Mungon e dhëna për {'+path+'}.');return String(value);});
}
function contextPlain(value){return String(value??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,1200);}
function contextEvent(kind,ref,title,facts,turn,extra={}){return {kind,ref:String(ref),title:contextPlain(title),facts:contextPlain(facts),turn,active:false,player_owned:false,...extra};}
function contextRecord(event,st=state){
 switch(event.kind){
  case 'STRIKE':case 'STRIKE_DECISION':return st.generalStrike?.seasons.find(r=>r.id===event.ref);
  case 'EMERGENCY':return st.nationalEmergencies?.events.find(r=>r.id===event.ref);
  case 'SCANDAL':return st.governance.scandals.find(r=>r.id===event.ref);
  case 'PROTEST':return st.streetProtests?.events.find(r=>r.id===event.ref);
  case 'TAX':case 'FISCAL':return st.publicFinance?.decisions.find(r=>r.id===event.ref);
  case 'LAW':return st.laws.find(r=>r.id===event.ref);
  case 'COMMUNITY':return event.ref.startsWith('pledge:')?partyGroundDB(st)?.promises.find(r=>r.id===event.ref.slice(7)):partyCommunityDB(st)?.projects.find(r=>r.id===event.ref);
  case 'COALITION':return st.coalitionAgreements?.find(r=>String(r.contextAction?.sequence)===event.ref);
  case 'PARTY':return careerDB(st)?.actions.find(r=>r.kind+':'+r.turn===event.ref);
  case 'INFLATION':return st;
  default:return null;
 }
}
function contextTaxFacts(r){
 const labels={vat:'TVSH',incomeTax:'tatimi në të ardhura',corporateTax:'tatimi në fitim',customs:'dogana'},before=r.previousRates||{};
 return Object.entries(labels).filter(([k])=>Number.isFinite(r.data?.[k])&&Number.isFinite(before[k])&&r.data[k]!==before[k]).map(([k,label])=>label+' '+before[k]+'% → '+r.data[k]+'%').join('; ')+'.';
}
function contextFiscalFacts(r){const amount=enterpriseMoney(r.data?.amountB??r.costB??0);if(r.kind==='BORROW')return 'U autorizua huamarrje '+amount+'. Kjo krijon detyrim shlyerjeje, jo të hyrë të përhershme.';if(r.kind==='REPAY')return 'U autorizua shlyerje e kryegjësë '+amount+'. Pagesa dhe borxhi mbeten në regjistrin financiar.';if(r.kind==='ARREARS')return 'U autorizua shlyerje detyrimesh '+amount+'. Duhet verifikuar pagesa te përfituesit.';return 'Urdhri financiar ka kosto të regjistruar '+enterpriseMoney(r.costB||0)+'.';}
function recentPlayerActions(st=state){
 const rows=[],owner=st.playerParty,add=(record,event,fallbackOwner=null)=>{const a=record.contextAction;if(a&&a.owner===owner||!a&&fallbackOwner===owner){event.player_owned=true;event.owner=owner;event.sequence=a?.sequence||0;event.turn=a?.turn??event.turn;event.action_key=event.kind+':'+event.ref+':'+(a?.sequence??event.turn);if(Number.isInteger(event.turn)&&event.turn<=st.turnCount)rows.push(event);}};
 for(const r of st.publicFinance?.decisions||[]){if(!r.contextAction)continue;const tax=r.kind==='TAX';add(r,contextEvent(tax?'TAX':'FISCAL',r.id,r.title||'Vendimi financiar',tax?contextTaxFacts(r):contextFiscalFacts(r),r.startTurn??r.turn));}
 for(const l of st.laws||[])if(l.contextAction)add(l,contextEvent('LAW',l.id,l.title,'Etapa '+({SUBMITTED:'dorëzuar në Kuvend',APPROVED:'miratuar nga Qeveria',RETURNED:'kthyer për plotësim',REJECTED:'refuzuar nga Qeveria'}[l.contextAction.stage]||l.contextAction.stage||l.status)+'. Kosto e planifikuar '+enterpriseMoney(l.costB||0)+'; zbatimi '+(l.applied?'është regjistruar':'ende nuk është regjistruar')+'.',l.contextAction.turn));
 for(const p of partyCommunityDB(st)?.projects||[]){const def=PARTY_COMMUNITY_PROJECTS[p.kind];if(!def)continue;const city=st.municipalities.find(m=>m.id===p.city)?.name||p.city;add(p,contextEvent('COMMUNITY',p.id,def.name+' në '+city,'Gjendja '+({COMPLETED:'e dorëzuar',ACTIVE:'në punim',REVIEW:'në shqyrtim',READY:'në pritje të pranimit',CANCELLED:'e anuluar'}[p.status]||p.status)+'; partia ka angazhuar €'+(p.partyPaid-p.refund+p.qualityPayment).toLocaleString('sq-AL')+'; bizneset kanë paguar €'+p.businessPaid.toLocaleString('sq-AL')+'.',p.completedTurn??p.startTurn),p.owner);}
 for(const p of partyGroundDB(st)?.promises||[]){const def=PARTY_COMMUNITY_PROJECTS[p.kind];if(!def)continue;const city=st.municipalities.find(m=>m.id===p.city)?.name||p.city;add(p,contextEvent('COMMUNITY','pledge:'+p.id,def.name+' në '+city,({FAILED:'Afati kaloi pa u dorëzuar nisma.',OPEN:'Afati i premtimit ende nuk ka përfunduar.',FULFILLED:p.late?'Nisma u dorëzua pas afatit.':'Nisma u dorëzua sipas regjistrit.'})[p.status]+' Premtimi nuk autorizon pagesë dhe nuk e zëvendëson provën e financimit ose të dorëzimit.',p.turn),p.owner);}
 for(const a of st.coalitionAgreements||[])if(a.contextAction)add(a,contextEvent('COALITION',a.contextAction.sequence,st.parties[a.partner]?.name||a.partner,a.ministriesCount+' ministri'+(a.ministryIds?.length?': '+a.ministryIds.map(id=>st.ministries.find(m=>m.id===id)?.name||id).join('; '):' sipas marrëveshjes')+'.',a.contextAction.turn));
 for(const r of st.generalStrike?.seasons||[])for(const a of r.decisions||[])if(a.contextAction)add(a,contextEvent('STRIKE_DECISION',r.id,'Përgjigjja ndaj kërkesës së sindikatave',({ACCEPT:'U pranua paketa e pagave përmes procedurës financiare.',PUNISH:'U vendos bllokimi i pagave; kjo nuk e zgjidh vetë grevën.',PROMISE:'U premtua procedura për Ligjin e Pagave; zotimi nuk është pagesë.'})[a.choice]+' Gjendja: '+({SETTLED:'marrëveshja është mbyllur',STRIKE:'greva vazhdon',RADICAL:'greva është radikalizuar',PAUSED:'greva është pezulluar përkohësisht',ULTIMATUM:'afati i ultimatumit është aktiv',CANCELLED:'procedura është anuluar'}[r.status]||'në shqyrtim')+'.',a.turn));
 for(const a of careerDB(st)?.actions||[]){const programme={EDUCATION:'Arsimi dhe studentët',HEALTH:'Shëndetësia',ECONOMY:'Ekonomia dhe çmimet',JUSTICE:'Drejtësia dhe llogaridhënia'},def=CAREER_ACTIONS[a.kind]||(a.kind==='PROGRAMME'&&programme[a.programme]?{name:'Programi: '+programme[a.programme]}:null);if(def)add(a,contextEvent('PARTY',a.kind+':'+a.turn,def.name,(a.kind==='PROGRAMME'?'U shpall ky prioritet në program; deklarimi nuk është zbatim. ':'')+'Kosto nga partia: €'+a.cost.toLocaleString('sq-AL')+'. Aktiviteti nuk është pagesë nga thesari.',a.turn),careerDB(st).owner);}
 return rows.sort((a,b)=>b.turn-a.turn||b.sequence-a.sequence||a.action_key.localeCompare(b.action_key)).filter((e,i,all)=>all.findIndex(x=>x.action_key===e.action_key)===i).slice(0,3);
}
function deriveEventContext(st=state){
 const crises=[],strike=currentGeneralStrike(st),emergency=activeNationalEmergency(st);
 if(generalStrikeActive(st))crises.push(contextEvent('STRIKE',strike.id,'greva e sektorit publik','Sindikatat kërkojnë +30% paga; statusi '+(strike.status==='RADICAL'?'grevë e radikalizuar':'grevë aktive')+'. '+(strike.payWithheld?'Pagat janë bllokuar.':'Nuk është regjistruar bllokim i pagave.'),strike.openedTurn,{active:true,phase:strike.status+':'+strike.decisions.length+':'+strike.payWithheld+':'+Math.floor((st.turnCount-strike.openedTurn)/4)}));
 if(emergency)crises.push(contextEvent('EMERGENCY',emergency.id,NATIONAL_EMERGENCIES[emergency.kind].title,'Afati i reagimit është '+Math.max(0,emergency.dueTurn-st.turnCount)+' javë; financimi i emergjencës '+(emergency.fundedTurn===null?'nuk është konfirmuar':'është regjistruar')+'.',emergency.createdTurn,{active:true,phase:emergency.status+':'+st.turnCount}));
 const scandal=st.governance?.scandals.find(r=>r.status==='PENDING');if(scandal)crises.push(contextEvent('SCANDAL',scandal.id,'dyshimet për kabinetin',scandal.minister+'; '+(st.ministries.find(m=>m.id===scandal.ministryId)?.name||'ministria përkatëse')+'. Vendimi politik ende nuk është regjistruar; fajësia nuk është provuar nga kjo ngjarje.',scandal.turn,{active:true,phase:scandal.status}));
 const protest=activeStreetProtest(st);if(protest)crises.push(contextEvent('PROTEST',protest.id,'protesta e qytetarëve',protest.reason,protest.startTurn,{active:true,phase:protest.status+':'+protest.revision}));
 if(st.inflation>=4)crises.push(contextEvent('INFLATION','economy','presioni i çmimeve','Papunësia është '+st.unemployment.toFixed(1)+'%; detyrimet e papaguara '+enterpriseMoney(st.publicFinance?.arrearsB||0)+'.',st.turnCount,{active:true}));
 return {turn:st.turnCount,owner:st.playerParty,government:agendaExecutive(st),economy:{inflation:st.inflation,budgetB:st.budgetTotalB},crises,Recent_Player_Actions:recentPlayerActions(st)};
}
class ContextEventManager{
 constructor(definitions=CONTEXT_EVENT_DEFINITIONS,options=CONTEXT_DIALOGUE_OPTIONS){if(!Array.isArray(definitions)||new Set(definitions.map(d=>d.id)).size!==definitions.length||!Array.isArray(options)||options.length<3||options.length>4||new Set(options.map(o=>o.id)).size!==options.length||options.some(o=>o.stat_changes?.budget!==0||Object.values(o.stat_changes).some(n=>!Number.isFinite(n))))throw Error('Konfigurimi i eventeve ose efekteve nuk është i vlefshëm. Dialogu nuk autorizon pagesa.');this.definitions=definitions;this.options=options;}
 get Recent_Player_Actions(){return recentPlayerActions(state);}
 match(event,context){return this.definitions.filter(d=>contextCondition(d.trigger_condition,{...context,event})).sort((a,b)=>a.priority-b.priority||a.id.localeCompare(b.id))[0]||null;}
 eligible(st=state){const context=deriveEventContext(st);return context.crises.concat(context.Recent_Player_Actions).map(event=>({event,definition:this.match(event,context)})).filter(x=>x.definition).sort((a,b)=>a.definition.priority-b.definition.priority||b.event.turn-a.event.turn||b.event.sequence-a.event.sequence||a.event.ref.localeCompare(b.event.ref));}
 select(st=state){const selected=this.eligible(st)[0];return selected?this.build(selected.event,st):null;}
 build(event,st=state){
  const context=deriveEventContext(st),definition=this.match(event,context);if(!definition)return null;
  const bindings={title:event.title,facts:event.facts,inflation:st.inflation.toFixed(1),current_main_issue:event.title,last_stat_changed:CONTEXT_STAT_LABELS[event.kind]||'vendimin e regjistruar',authority:context.government?'Qeveria duhet të ndjekë procedurën për vendim dhe financim.':'Si parti mund të kërkojmë shqyrtim dhe të propozojmë masa; nuk mund të autorizojmë pagesë nga shteti.'};
  return {version:1,definitionId:definition.id,event:JSON.parse(JSON.stringify(event)),snapshotTurn:st.turnCount,owner:st.playerParty,government:context.government,category:context.crises.some(c=>c.kind===event.kind&&c.ref===event.ref)?'CRISIS':'ACTION',priority:definition.priority,topic:definition.topic,sector:definition.sector,bindings,question:interpolateContext(definition.question,bindings),proof:definition.proof,risk:definition.risk,options:this.options.map(o=>({...o,stat_changes:{...o.stat_changes,...(!context.government?{international_relations:0}:{})},text:interpolateContext(definition[o.field],bindings)+(context.government?'':' '+bindings.authority)}))};
 }
}
const contextEventManager=new ContextEventManager();
function contextPlanIsCurrent(plan,st=state){if(!plan||plan.owner!==st.playerParty)return false;const context=deriveEventContext(st),e=plan.event;if(plan.actionRef&&!context.Recent_Player_Actions.some(r=>r.action_key===plan.actionRef.action_key))return false;return plan.category==='CRISIS'?context.crises.some(r=>r.kind===e.kind&&r.ref===e.ref&&(r.phase||r.turn)===(e.phase||e.turn)):context.Recent_Player_Actions.some(r=>r.action_key===e.action_key);}
function GenerateDebateQuestion(global_state=state,{actionIndex=0,step=0,previousAnswer=null}={}){
 const context=deriveEventContext(global_state),Recent_Player_Actions=context.Recent_Player_Actions,action=Recent_Player_Actions[actionIndex]||Recent_Player_Actions[0],main=contextEventManager.select(global_state),chosen=main?.category==='CRISIS'?main:action?contextEventManager.build(action,global_state):null;
 if(!chosen)return null;let question=chosen.question;
 let reaction=null;if(main?.category==='CRISIS'&&action){reaction=contextEventManager.build(action,global_state);if(reaction)question+=' Ndërkohë, '+reaction.question;}
 const definition=CONTEXT_EVENT_DEFINITIONS.find(d=>d.id===chosen.definitionId),issue=chosen.event.title;
 if(step===1)question='Për çështjen në fokus: '+issue+'. '+chosen.bindings.facts+' '+(definition.followups?.[previousAnswer]||definition.followups?.PRAGMATIC||chosen.question)+(reaction?' Si përputhet ky qëndrim me vendimin tjetër: '+reaction.event.title+'?':'');
 if(step===2)question='Kostoja dhe kompetenca për këtë çështje: '+issue+'. '+chosen.bindings.facts+' '+(chosen.government?'Arka e shtetit ka '+enterpriseMoney(global_state.budgetTotalB)+' në momentin e përgatitjes.':'Partia ka €'+global_state.parties[global_state.playerParty].partyFunds.toLocaleString('sq-AL')+' dhe nuk kontrollon arkën e shtetit.')+' Kush e autorizon masën dhe cilin kufi financiar do ta pranoni publikisht?';
 if(step===3)question='Tani te prova konkrete: '+issue+'. '+chosen.bindings.facts+' Si do t’i verifikojmë '+chosen.proof+' dhe si do ta trajtoni rrezikun që '+chosen.risk+'?';
 if(step===4)question='Në mbyllje për këtë çështje: '+issue+'. Cilin angazhim mund ta kontrollojë qytetari përmes '+chosen.proof+', dhe çfarë nuk do të premtoni pa autorizim?';
 return {...chosen,question,actionRef:action?{kind:action.kind,ref:action.ref,action_key:action.action_key}:null,Recent_Player_Actions:Recent_Player_Actions.map(a=>({kind:a.kind,ref:a.ref,action_key:a.action_key,turn:a.turn})),options:chosen.options.filter(o=>o.id!=='AGGRESSIVE').map(o=>({...o,text:o.text+(reaction?' Për vendimin që përmendët, '+reaction.options.find(a=>a.id===o.id).text:'')}))};
}
function buildContextWeeklyAddress(st=state){const selected=contextEventManager.select(st);if(!selected)return null;return {event:selected,text:interpolateContext('Fokusi i këtij adresimi: {current_main_issue}. Të dhënat e fundit për {last_stat_changed}: {facts} Nuk do ta quajmë problemin të zgjidhur pa prova.',selected.bindings)};}
function contextNativeDeltas(changes){return {approval:changes.popularity,international:changes.international_relations,opposition:changes.opposition_anger,stability:changes.government_stability,credibility:changes.credibility,media:changes.media_trust};}
