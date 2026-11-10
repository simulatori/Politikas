/* Reuse the existing urgent inbox/modal; presentation is a projection of the same cases and hosting records. */
function worldAttentionDB(st=state){return worldDB(st)?.attention;}
const attentionMigrateBase=migrateWorld,attentionValidateBase=validateLoadedState,attentionWeekBase=worldProcessWeek,attentionUrgentBase=urgentSituationQueue,attentionModalBase=toggleModal;
migrateWorld=function(st){attentionMigrateBase(st);if(!worldAttentionDB(st))worldDB(st).attention={version:1,startTurn:st.turnCount,lastTurn:st.turnCount,lastAutoTurn:st.turnCount,lastOfferTurn:st.turnCount,counter:0,offers:[]};};
function worldAttentionNeedsDecision(r,turn=state.turnCount){
 if(r.eventId)return ['BIDDING','PREPARING','RUNNING'].includes(r.status);
 return r.status==='OPEN'||r.status==='REVIEW'&&(r.kind!=='SPECTRUM'||r.breached)||['STOPPED','COLLAPSED'].includes(r.status)||r.kind==='LANDFILL'&&r.economy?.blocked||r.status==='DONE'&&r.qualified&&['DATACENTER','LANDFILL','SEASONAL'].includes(r.kind)&&r.untilTurn<=turn+4;
}
function worldAttentionRows(st=state){
 const a=worldAttentionDB(st);if(!a||!agendaExecutive(st))return [];
 const rows=[];for(const r of worldDB(st).cases){
  const needs=worldAttentionNeedsDecision(r,st.turnCount),deadline=r.status==='OPEN'?r.responseTurn:r.status==='ACTIVE'?r.dueTurn:r.untilTurn||r.reviewTurn||null;
  const nearing=r.status==='ACTIVE'&&r.dueTurn>=st.turnCount&&r.dueTurn-st.turnCount<=2;
  const result=!needs&&r.status==='DONE'&&r.completedTurn>a.startTurn&&st.turnCount-r.completedTurn<=1;
  if(!needs&&!nearing&&!result)continue;
  const phase=nearing?'DEADLINE':result?'RESULT':r.economy?.blocked?'BLOCKED':r.status==='DONE'?'RENEW:'+r.untilTurn:r.status+(r.status==='REVIEW'?':'+(r.economy?.remaining??r.dueTurn??r.openedTurn):'');
  rows.push({key:'world-attention:'+r.id+':'+phase,type:'WORLD',worldType:'CASE',record:r,title:WORLD_CASE_DEFS[r.kind].name,description:result?r.outcome||'Dosja përfundoi.':r.outcome||WORLD_CASE_DEFS[r.kind].text,importance:needs?'E LARTË':'MESATARE',status:result?'RESULT':nearing?'IN_REVIEW':'ACTIVE',dueTurn:deadline,priority:needs?0:result?3:2});
 }
 for(const r of worldDB(st).events){
  const result=['DONE','FAILED','REJECTED','WITHDRAWN'].includes(r.status)&&r.completedTurn>a.startTurn&&st.turnCount-r.completedTurn<=1;
  const opening=r.status==='PREPARING'&&r.dueTurn-st.turnCount<=4;
  const awarded=r.status==='PREPARING'&&st.turnCount-r.awardTurn<=1&&r.awardTurn>a.startTurn;
  if(!result&&!opening&&!awarded)continue;
  const phase=result?r.status:opening?'DEADLINE:'+r.dueTurn:'AWARDED';
  rows.push({key:'world-attention:'+r.id+':'+phase,type:'WORLD',worldType:'HOST',record:r,title:WORLD_HOST_EVENTS[r.eventId].name,description:r.failureReason||(result?'Rezultati i organizimit është regjistruar.':opening?'Po afron hapja. Kontrollo kushtet dhe financimin; mund ta shtysh vetëm para afatit.':'Kandidatura fitoi. Kontrata dhe afati i përgatitjes janë regjistruar.'),importance:opening||r.status==='FAILED'?'E LARTË':'MESATARE',status:result?'RESULT':'ACTIVE',dueTurn:opening?r.dueTurn:null,priority:opening||r.status==='FAILED'?0:3});
 }
 for(const o of a.offers){
  if(o.status!=='PENDING'||o.expiresTurn<st.turnCount)continue;
  if(o.kind==='HOST'){
   if(worldHostingLive(st).length)continue;
   rows.push({key:'world-attention:'+o.id,type:'WORLD',worldType:'OFFER',record:o,title:'Mundësi organizimi ndërkombëtar',description:WORLD_HOST_EVENTS[o.source].name+' · Shih kërkesat, kostot dhe afatet para se të kandidosh.',importance:'MESATARE',status:'ACTIVE',dueTurn:null,priority:4});
  }else if(!worldCaseReason(o.kind,o.source,st))rows.push({key:'world-attention:'+o.id,type:'WORLD',worldType:'OFFER',record:o,title:WORLD_CASE_DEFS[o.kind].name,description:'U hap mundësia për shqyrtim: '+WORLD_CASE_DEFS[o.kind].text,importance:'MESATARE',status:'ACTIVE',dueTurn:null,priority:4});
 }
 return rows.sort((x,y)=>x.priority-y.priority||(x.dueTurn??Infinity)-(y.dueTurn??Infinity)||x.key.localeCompare(y.key));
}
function worldAttentionInterrupt(st=state){return worldAttentionRows(st).some(r=>r.priority===0&&!(st.urgentSituations?.presented||[]).includes(r.key));}
function worldAttentionProcess(turn){
 const a=worldAttentionDB();if(!a||turn!==state.turnCount||turn<=a.lastTurn)return;a.lastTurn=turn;if(!agendaExecutive(state))return;
 for(const o of a.offers)if(o.status==='PENDING'&&o.expiresTurn<turn)o.status='EXPIRED';
 // At most one new incident per week across both world processors; never manufacture a second source/case.
 const waiting=worldDB().cases.filter(r=>['OPEN','REVIEW','STOPPED','COLLAPSED'].includes(r.status));
 if(turn%8===0&&(a.lastAutoTurn===a.startTurn||turn-a.lastAutoTurn>=8)){
  a.lastAutoTurn=turn;
  if(!waiting.length&&!worldDB().cases.some(r=>r.openedTurn===turn&&r.event)&&Math.random()<.2){
   const kinds=['UNIVERSITY','WASTE_IMPORT','DEEPFAKE','SUBSIDY_FRAUD','SUCCESSION','RETAIL_PAY'],eligible=kinds.map(kind=>({kind,source:worldSources(kind).find(s=>!worldCaseReason(kind,s.id))})).filter(x=>x.source);
   if(eligible.length){const pick=eligible[Math.floor(Math.random()*eligible.length)];worldNewCase(pick.kind,pick.source.id,true);}
  }
 }
 if(turn-a.lastOfferTurn<4||a.offers.some(o=>o.status==='PENDING')||worldAttentionRows(state).some(r=>r.priority===0))return;
 const recent=kind=>a.offers.some(o=>o.kind===kind&&turn-o.openedTurn<48);
 let candidate=null;
 if(!recent('HOST')&&!worldHostingLive(state).length&&turn-a.startTurn>=8&&Math.min(state.diplomacy.EU.score,state.diplomacy.USA.score)>=40&&!resilienceBlocked(state))candidate={kind:'HOST',source:'VOLLEYBALL'};
 if(!candidate){const kinds=['SEASONAL','DATACENTER','LANDFILL','SPECTRUM','LAND_POOL','UNIVERSITY','WASTE_IMPORT','DEEPFAKE','SUBSIDY_FRAUD','SUCCESSION','RETAIL_PAY','ARCHIVES','FOOD','LIVESTOCK','ARCHAEOLOGY','SUBSIDENCE'];for(const kind of kinds){if(recent(kind))continue;const source=worldSources(kind).find(s=>!worldCaseReason(kind,s.id));if(source){candidate={kind,source:source.id};break;}}}
 if(candidate){a.lastOfferTurn=turn;a.offers.push({...candidate,id:'world-offer:'+(++a.counter),openedTurn:turn,expiresTurn:turn+8,status:'PENDING'});}
}
worldProcessWeek=function(turn){const result=attentionWeekBase(turn);worldAttentionProcess(turn);return result;};
urgentSituationQueue=function(){const original=attentionUrgentBase();if(!state)return original;return original.concat(worldAttentionRows(state)).sort((a,b)=>(a.priority??0)-(b.priority??0)||(a.dueTurn??Infinity)-(b.dueTurn??Infinity)||a.key.localeCompare(b.key));};
function worldAttentionUrgentMarkup(row){
 if(row.worldType==='CASE')return '<div class="urgent-world-detail">'+worldCaseMarkup(state,row.record).replace(/<h3>[\s\S]*?<\/h3>/,'').replace('<p>'+lifeUIEscape(WORLD_CASE_DEFS[row.record.kind].text)+'</p>','')+lifeUIButton(lifeUIEscape('openWorldAttention('+JSON.stringify(row.key)+')'),'Hap dosjen e plotë')+'</div>';
 if(row.worldType==='HOST')return worldEventHistoryMarkup(state,row.record.id)+lifeUIButton(lifeUIEscape('openWorldAttention('+JSON.stringify(row.key)+')'),'Hap organizimin dhe infrastrukturën');
 const o=row.record;
 return (o.kind==='HOST'?'<p>Kandidatura nuk paraqitet automatikisht dhe nuk zbriten para nga ky njoftim.</p>':worldSources(o.kind,state).filter(s=>s.id===o.source).map(s=>'<p><strong>Burimi:</strong> '+lifeUIEscape(s.label)+'</p>').join('')+'<p>Hapja e shqyrtimit përdor një bllok kohe. Pagesa për ndërhyrjen kryhet vetëm pasi zgjedh opsionin.</p>')+
  lifeUIButton(lifeUIEscape('openWorldAttention('+JSON.stringify(row.key)+')'),o.kind==='HOST'?'Shih organizimin dhe kërkesat':'Shqyrto këtë rast · 1 kohë',!agendaExecutive(state));
}
function openWorldAttention(key){
 const row=worldAttentionRows(state).find(r=>r.key===key);if(!row||urgentInterfaceBusy())return false;
 if(row.worldType==='OFFER'&&row.record.kind!=='HOST'){
  const o=row.record;if(!openWorldCase(o.kind,o.source))return false;
  const r=worldDB().cases.findLast(r=>r.kind===o.kind&&r.source===o.source);if(!r)return false;
  return openUrgentSituations('world-attention:'+r.id+':OPEN');
 }
 closeUrgentSituations();
 if(row.worldType==='CASE')openWorldCases();else openWorldEvents();
 const selector=row.worldType==='CASE'?'[data-world-case="'+row.record.id+'"]':row.worldType==='HOST'?'[data-world-hosting="'+row.record.id+'"]':'[data-world-event="'+row.record.source+'"]';
 const card=document.querySelector('#politicalLifePanel '+selector);if(card){card.closest('details')?.setAttribute('open','');card.querySelectorAll('details').forEach(d=>d.open=true);card.scrollIntoView?.({block:'start',behavior:'smooth'});card.querySelector('button')?.focus?.({preventScroll:true});}return true;
}
toggleModal=function(id,open,...args){const result=attentionModalBase(id,open,...args);if(!open&&typeof scheduleUrgentNotification==='function')scheduleUrgentNotification();return result;};
if(typeof document.addEventListener==='function')document.addEventListener('close',()=>scheduleUrgentNotification(),true);
validateLoadedState=function(st){attentionValidateBase(st);const a=worldAttentionDB(st);if(!a)return st;const bad=()=>{throw Error('Njoftimet e dosjeve janë të pavlefshme.');},turn=t=>Number.isInteger(t)&&t>=a.startTurn&&t<=st.turnCount;if(a.version!==1||!turn(a.startTurn)||!turn(a.lastTurn)||!turn(a.lastAutoTurn)||!turn(a.lastOfferTurn)||!Number.isInteger(a.counter)||a.counter<0||!Array.isArray(a.offers)||a.offers.length!==a.counter)bad();const ids=new Set();for(const o of a.offers){if(ids.has(o.id)||!/^world-offer:[1-9][0-9]*$/.test(o.id)||Number(o.id.split(':')[1])>a.counter||!turn(o.openedTurn)||o.expiresTurn!==o.openedTurn+8||!['PENDING','EXPIRED'].includes(o.status)||typeof o.source!=='string'||(o.kind==='HOST'?!WORLD_HOST_EVENTS[o.source]:!WORLD_CASE_DEFS[o.kind]))bad();ids.add(o.id);}return st;};
