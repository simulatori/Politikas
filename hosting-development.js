/* Contracted, fictional host grants. Money uses the existing public ledger; no second treasury. */
const HOST_GRANTS_M={FOOTBALL:180,BASKETBALL:70,SWIMMING:65,ATHLETICS:110,VOLLEYBALL:40,INVESTMENT:35,DIGITAL:65,CLIMATE:90,LEADERS:110,WORLD_CITIES:75};
const HOST_TASKS={
 DIRECTOR:{name:'Komisioni organizativ dhe drejtori',weeks:2,choices:{PRO:{name:'Drejtim profesional',costB:.0012},PARTY:{name:'Emërim politik · rrezik vonese',costB:.0004}}},
 OVERSIGHT:{name:'Komisioni mbikëqyrës',weeks:2,choices:{INDEPENDENT:{name:'Mbikëqyrje e pavarur',costB:.0008},INTERNAL:{name:'Kontroll i brendshëm · rrezik auditimi',costB:.0002}}},
 LOGISTICS:{name:'Transporti, vullnetarët dhe akreditimi',weeks:3,choices:{FULL:{name:'Trajnim i plotë dhe plan transporti',costB:.0015},BASIC:{name:'Plan bazë · kërkon shërbime ≥5',costB:.0007}}},
 TEAM:{name:'Ekipi sportiv / protokolli i delegacioneve',weeks:4,choices:{FULL:{name:'Përgatitje e plotë e ekipit',costB:.003},BASIC:{name:'Përgatitje bazë',costB:.001}}},
 DRILL:{name:'Prova e sigurisë dhe transmetimit',weeks:1,choices:{TEST:{name:'Zhvillo provën para hapjes',costB:.0006}}}
};
function worldHostingPlan(eventId){return {version:1,grantB:HOST_GRANTS_M[eventId]/1000,instalments:[],tasks:[],projects:[],actions:[],stage:'BID',inspectedTurn:null,auditDueTurn:null,settledTurn:null,returnedB:0,commercial:null};}
function hostTaskReady(r,key){return !!r.hosting?.tasks.find(t=>t.key===key&&t.completedTurn!==null);}
function hostGrant(r,key,share){const h=r.hosting;if(h.instalments.some(p=>p.key===key))return;const amountB=fiscalRound(h.grantB*share);worldRevenue(r,amountB,'Granti i organizatorit: '+key);h.instalments.push({key,amountB,turn:state.turnCount,receiptId:r.revenues.at(-1).id});}
function worldHostingAward(r){hostGrant(r,'ADVANCE',.5);r.hosting.stage='PREPARATION';}
function hostPhysicalRequirements(st,r){return hostRequirementsBase(st,r.eventId,r.city,r.model);}
function hostInspectionReady(st,r){return Object.keys(HOST_TASKS).every(k=>hostTaskReady(r,k))&&worldHostRequirements(st,r.eventId,r.city,r.model,r).filter(t=>t.key!=='host_inspection').every(t=>t.ok);}
function hostEligibleCost(st,r){const h=r.hosting;return fiscalRound(r.receipts.filter(p=>!['Kandidatura','Kthimi i grantit'].includes(p.title)).reduce((n,p)=>n+p.costB,0)+h.projects.reduce((n,p)=>n+Math.abs(st.publicFinance.ledger.find(f=>f.id===p.receiptId)?.amountB||0),0));}
function hostGrantCost(st,r){return fiscalRound(Math.max(0,hostEligibleCost(st,r)-r.revenues.filter(p=>p.title.startsWith('Sponsorë dhe transmetim:')).reduce((n,p)=>n+p.amountB,0)));}
function hostGrantTotal(r){return fiscalRound(r.hosting.instalments.reduce((n,p)=>n+p.amountB,0));}
function hostTaskReason(st,r,key){
 if(!r?.hosting||r.status!=='PREPARING')return 'Organizimi nuk është në përgatitje.';
 if(!HOST_TASKS[key]||r.hosting.tasks.some(t=>t.key===key))return 'Kjo detyrë është regjistruar.';
 if(key!=='DIRECTOR'&&!hostTaskReady(r,'DIRECTOR'))return 'Së pari përfundo komisionin organizativ.';
 if(key==='DRILL'&&(!['OVERSIGHT','LOGISTICS','TEAM'].every(k=>hostTaskReady(r,k))||hostPhysicalRequirements(st,r).some(t=>!t.ok)))return 'Përfundo ekipet dhe plotëso kushtet fizike para provës.';
 return '';
}
function hostEventAction(id,key,choice){return lifeCommit(()=>{
 const r=worldRecord(id),h=r?.hosting;if(!h)throw Error('Mungon kontrata e zgjeruar.');
 if(key==='COMMERCIAL'){
  if(r.status!=='PREPARING'||h.commercial||!hostTaskReady(r,'DIRECTOR'))throw Error('Kontrata tregtare kërkon drejtim të përfunduar dhe lidhet vetëm një herë.');
  lifeTime(id+':commercial',1);worldPay(r,.0003,'Kontraktimi i sponsorëve');
  h.commercial={contractB:fiscalRound(h.grantB*.04),ticketPrice:WORLD_HOST_EVENTS[r.eventId].group==='Sport'?35:100,closed:false,ticketGrossB:0};worldRevenue(r,fiscalRound(h.commercial.contractB*.5),'Sponsorë dhe transmetim: paradhënie');return;
 }
 if(key==='INSPECT'){
  if(r.status!=='PREPARING'||h.inspectedTurn!==null||!hostInspectionReady(state,r))throw Error('Inspektimi kërkon detyrat dhe infrastrukturën e gatshme.');
  lifeTime(id+':inspection',1);worldPay(r,.0004,'Inspektimi teknik');h.inspectedTurn=state.turnCount;hostGrant(r,'READINESS',.3);h.actions.push({key,turn:state.turnCount});return;
 }
 if(key==='AUDIT'){
  if(h.stage!=='AUDIT'||h.settledTurn!==null)throw Error('Raporti përfundimtar nuk pret auditim.');
  lifeTime(id+':audit',1);worldPay(r,.0004,'Auditimi përfundimtar');
  const internal=h.tasks.some(t=>t.key==='OVERSIGHT'&&t.choice==='INTERNAL');h.auditPassed=r.status==='DONE'&&(!internal||r.roll>=.5);
  if(h.auditPassed)hostGrant(r,'FINAL',.2);else if(internal)crisisApproval(-2);
  hostSettle(r);h.actions.push({key,turn:state.turnCount});return;
 }
 const reason=hostTaskReason(state,r,key);if(reason)throw Error(reason);const opt=HOST_TASKS[key].choices[choice];if(!opt)throw Error('Zgjedhje e panjohur.');
 lifeTime(id+':task:'+key,1);worldPay(r,opt.costB,'Ekipi: '+key+': '+choice);
 h.tasks.push({key,choice,startTurn:state.turnCount,weeks:HOST_TASKS[key].weeks+(choice==='PARTY'?2:0),fundedWeeks:0,completedTurn:null});
 if(choice==='PARTY')recordLeakRisk('FAVOUR',id,null,10);
 });}
function hostSettle(r){const h=r.hosting;if(h.settledTurn!==null)return;const unused=fiscalRound(Math.max(0,hostGrantTotal(r)-hostGrantCost(state,r)));if(unused)worldLiability(r,unused,'Kthimi i grantit');h.returnedB=unused;h.settledTurn=state.turnCount;h.stage='CLOSED';h.retainedB=fiscalRound(hostGrantTotal(r)-unused);}
const hostRequirementsBase=worldHostRequirements,hostWeekBase=worldProcessWeek,hostValidateBase=validateLoadedState,hostSectorCommitBase=sectorManagementCommit,hostRowsBase=worldAttentionRows,hostHistoryBase=worldEventHistoryMarkup,hostCatalogueBase=worldEventsMarkup;
worldHostRequirements=function(st,eventId,city,model='STANDARD',record=null){
 const rows=hostRequirementsBase(st,eventId,city,model),r=record||worldHostingLive(st).find(r=>r.eventId===eventId&&r.city===city&&r.model===model&&r.hosting&&r.status!=='BIDDING');if(!r?.hosting)return rows;
 for(const [key,d] of Object.entries(HOST_TASKS)){const t=r.hosting.tasks.find(t=>t.key===key);let ok=hostTaskReady(r,key);if(key==='LOGISTICS'&&t?.choice==='BASIC')ok=ok&&sectorManagementAverage(st,'sec_roads')>=5&&sectorManagementAverage(st,'sec_tech')>=5;rows.push({key:'team_'+key,label:d.name,have:ok?1:0,need:1,ok});}
 rows.push({key:'host_inspection',label:'Inspektimi dhe miratimi para hapjes',have:r.hosting.inspectedTurn!==null?1:0,need:1,ok:r.hosting.inspectedTurn!==null});return rows;
};
sectorManagementCommit=function(change){return hostSectorCommitBase(()=>{const before=new Set(worldFacilities(state).map(b=>b.id));change();for(const b of worldFacilities(state).filter(b=>!before.has(b.id))){b.worldCity=b.worldCity||worldConstructionCity||state.municipalities[0].id;const r=worldHostingLive(state).find(r=>r.status==='PREPARING'&&r.hosting&&(r.model==='JOINT'||r.city===b.worldCity)&&WORLD_HOST_EVENTS[r.eventId].venues[b.categoryId.slice(6)]);if(r){const max=WORLD_HOST_EVENTS[r.eventId].venues[b.categoryId.slice(6)],assigned=r.hosting.projects.filter(p=>p.kind===b.categoryId).length;if(assigned<max)r.hosting.projects.push({buildingId:b.id,kind:b.categoryId,receiptId:b.paymentId,turn:state.turnCount});}}});};
worldProcessWeek=function(turn){
 const before=worldDB()?.lastTurn;const result=hostWeekBase(turn);if(!worldDB()||before>=turn||turn!==state.turnCount)return result;
 for(const r of worldDB().events.filter(r=>r.hosting)){
  const h=r.hosting;
  if(h.commercial&&!h.commercial.closed&&['DONE','FAILED','WITHDRAWN'].includes(r.status)){
   const c=h.commercial,ratio=r.actualVisitors===undefined?0:r.goodWeeks/WORLD_HOST_EVENTS[r.eventId].duration;c.closed=true;
   worldRevenue(r,fiscalRound(c.contractB*.5*ratio),'Sponsorë dhe transmetim: përfundimi');
   c.ticketGrossB=fiscalRound((r.actualVisitors||0)*.7*c.ticketPrice/1e9);
   worldRevenue(r,fiscalRound(c.ticketGrossB/(1+(r.taxRate||0))),'Biletat e organizatorit pa TVSH');
  }
  if(r.status==='PREPARING')for(const t of h.tasks.filter(t=>t.completedTurn===null&&turn>t.startTurn))if(r.paidWeeks.some(p=>p.turn===turn)){t.fundedWeeks=Math.min(t.weeks,t.fundedWeeks+1);if(t.fundedWeeks===t.weeks)t.completedTurn=turn;}
  if(['DONE','FAILED','WITHDRAWN'].includes(r.status)&&h.instalments.length&&h.stage!=='AUDIT'&&h.stage!=='CLOSED'){h.stage='AUDIT';h.auditDueTurn=turn+6;if(r.actualVisitors!==undefined){const privateSpending=fiscalRound(r.visitorSpendingB-(h.commercial?.ticketGrossB||0));h.business={hotelsB:fiscalRound(privateSpending*.4),restaurantsB:fiscalRound(privateSpending*.3),transportB:fiscalRound(privateSpending*.15)};h.business.otherB=fiscalRound(privateSpending-h.business.hotelsB-h.business.restaurantsB-h.business.transportB);if(WORLD_HOST_EVENTS[r.eventId].group==='Sport'){const full=h.tasks.some(t=>t.key==='TEAM'&&t.choice==='FULL'&&t.completedTurn!==null);h.teamPlacing=Math.max(1,Math.min(8,Math.ceil((1-r.roll)*8)+(full?0:2)));}h.teamPerformance=WORLD_HOST_EVENTS[r.eventId].group==='Sport'?(h.tasks.some(t=>t.key==='TEAM'&&t.choice==='FULL'&&t.completedTurn!==null)?'Ekipi arriti objektivin përgatitor; renditja sportive nuk garantohet.':'Përgatitje e kufizuar; rezultati sportiv është i ndarë nga organizimi.'):'Protokolli dhe takimet u vlerësuan veçmas nga infrastruktura.';}}
  if(h.stage==='AUDIT'&&turn>h.auditDueTurn){h.auditPassed=false;hostSettle(r);crisisApproval(-1);}
 }
 return result;
};
worldAttentionRows=function(st=state){const rows=hostRowsBase(st);for(const r of worldDB(st)?.events||[]){const h=r.hosting;if(!h||!agendaExecutive(st))continue;let phase=null,description='';if(h.stage==='AUDIT'){phase='AUDIT';description='Paraqit raportin përfundimtar. Auditimi liron këstin e fundit; fondet e papërdorura kthehen.';}else if(r.status==='PREPARING'){const ready=h.tasks.filter(t=>t.completedTurn!==null).map(t=>t.key).join(',');phase='TEAM:'+h.tasks.length+':'+ready+':'+h.inspectedTurn;description='Formo komisionet, përgatit ekipin dhe kryej provën. Detyrat ecin vetëm gjatë javëve të paguara.';}if(!phase)continue;rows.push({key:'world-host-plan:'+r.id+':'+phase,type:'WORLD',worldType:'HOST',record:r,title:WORLD_HOST_EVENTS[r.eventId].name,description,importance:'E LARTË',status:'ACTIVE',dueTurn:h.stage==='AUDIT'?h.auditDueTurn:r.dueTurn,priority:0});}return rows;};
function hostPlanMarkup(st,r){const h=r.hosting;if(!h)return '';const btn=(key,choice,label,disabled=false)=>lifeUIButton("hostEventAction('"+r.id+"','"+key+"','"+(choice||'')+"')",label,!agendaExecutive(st)||disabled);let html='<section class="host-plan"><h4>Komisionet, përgatitja dhe financimi</h4><p>Grant i kontraktuar: <strong>'+enterpriseMoney(h.grantB)+'</strong> · 50% pas fitores / 30% pas inspektimit / 20% pas auditimit.</p><p>Grant i arkëtuar: '+enterpriseMoney(hostGrantTotal(r))+' · Shpenzime të pranueshme deri tani: '+enterpriseMoney(hostEligibleCost(st,r))+'. Fondet e papërdorura kthehen; nuk janë fitim i lirë.</p><p>'+h.projects.length+' ndërtime të reja të lidhura me organizimin. Ndërtimet e kërkuara në komunën pritëse lidhen automatikisht pas fitores; nuk paguhen dy herë.</p>';
 if(r.status==='PREPARING'){for(const [key,d] of Object.entries(HOST_TASKS)){const t=h.tasks.find(t=>t.key===key);html+='<div class="world-task"><strong>'+lifeUIEscape(d.name)+'</strong>';if(t)html+='<p>'+lifeUIEscape(d.choices[t.choice].name)+' · '+t.fundedWeeks+' / '+t.weeks+' javë të financuara'+(t.completedTurn!==null?' · Përfunduar':'')+'</p>';else{const reason=hostTaskReason(st,r,key);for(const [choice,o] of Object.entries(d.choices))html+=btn(key,choice,o.name+' · '+enterpriseMoney(o.costB),!!reason);if(reason)html+='<p>'+lifeUIEscape(reason)+'</p>';}html+='</div>';}html+=btn('COMMERCIAL',null,'Kontrakto sponsorë, transmetim dhe bileta · €300,000',!!h.commercial||!hostTaskReady(r,'DIRECTOR'));html+=btn('INSPECT',null,'Inspektimi teknik · €400,000',h.inspectedTurn!==null||!hostInspectionReady(st,r));}
 if(h.stage==='AUDIT')html+='<p>Afati i auditimit: '+diplomaticDate(h.auditDueTurn)+'</p>'+btn('AUDIT',null,'Dorëzo auditimin · €400,000');
 if(h.settledTurn!==null)html+='<p>Grant i kthyer / detyrim kthimi: '+enterpriseMoney(h.returnedB)+' · Financim i mbajtur për shpenzime reale: '+enterpriseMoney(h.retainedB)+'.</p>';
 if(h.commercial)html+='<p>Sponsorizim dhe transmetim i kontraktuar: '+enterpriseMoney(h.commercial.contractB)+' · 50% paradhënie, pjesa tjetër sipas zhvillimit real. Biletat arkëtohen vetëm për vizitorët e regjistruar.</p>';
 if(h.business)html+='<p>Të hyra bruto të bizneseve nga vizitorët (përfshijnë TVSH-në, nuk janë fitim neto): hotele '+enterpriseMoney(h.business.hotelsB)+', gastronomi '+enterpriseMoney(h.business.restaurantsB)+', transport '+enterpriseMoney(h.business.transportB)+', tregti '+enterpriseMoney(h.business.otherB)+'. Ndarje e së njëjtës shumë, pa arkëtim publik të dytë.</p><p>'+lifeUIEscape(h.teamPerformance)+(h.teamPlacing?' Renditja e simuluar e ekipit: '+h.teamPlacing+' / 8.':'')+'</p>';
 return html+'</section>';}
worldEventHistoryMarkup=function(st,onlyId=null){let html=hostHistoryBase(st,onlyId);for(const r of worldDB(st).events.filter(r=>r.hosting&&(!onlyId||r.id===onlyId))){const marker='data-world-hosting="'+r.id+'"',start=html.indexOf(marker),end=html.indexOf('</article>',start);if(start>=0&&end>=0)html=html.slice(0,end)+hostPlanMarkup(st,r)+html.slice(end);}return html;};
worldEventsMarkup=function(st){let html=hostCatalogueBase(st);for(const [id,m] of Object.entries(HOST_GRANTS_M)){const start=html.indexOf('data-world-event="'+id+'"'),end=html.indexOf('</h3>',start);if(start>=0&&end>=0)html=html.slice(0,end+5)+'<p><strong>Grant i simuluar: €'+m+'M</strong> · Paradhënie €'+(m/2)+'M pas fitores. Këstet e tjera varen nga inspektimi dhe auditimi; fondet e papërdorura kthehen.</p>'+html.slice(end+5);}return html;};
validateLoadedState=function(st){hostValidateBase(st);const fail=()=>{throw Error('Kontrata e organizimit ndërkombëtar është e pavlefshme.');};const assigned=new Set();for(const r of worldDB(st)?.events||[]){const h=r.hosting;if(h===undefined)continue;if(!h||h.version!==1||h.grantB!==HOST_GRANTS_M[r.eventId]/1000||!['BID','PREPARATION','AUDIT','CLOSED'].includes(h.stage)||!['tasks','projects','instalments','actions'].every(k=>Array.isArray(h[k])))fail();const keys=new Set();for(const p of h.instalments){const share={ADVANCE:.5,READINESS:.3,FINAL:.2}[p.key],receipt=r.revenues.find(q=>q.id===p.receiptId);if(!share||keys.has(p.key)||p.amountB!==fiscalRound(h.grantB*share)||!receipt||receipt.amountB!==p.amountB||receipt.turn!==p.turn||receipt.title!=='Granti i organizatorit: '+p.key||p.turn<r.awardTurn)fail();keys.add(p.key);}if(r.revenues.filter(q=>q.title.startsWith('Granti i organizatorit:')).length!==h.instalments.length)fail();if(keys.has('READINESS')&&h.inspectedTurn===null||keys.has('FINAL')&&(!h.auditPassed||r.status!=='DONE'))fail();const tasks=new Set();for(const t of h.tasks){const d=HOST_TASKS[t.key],opt=d?.choices[t.choice];if(!opt||tasks.has(t.key)||!Number.isInteger(t.startTurn)||t.startTurn<r.awardTurn||t.startTurn>st.turnCount||t.weeks!==d.weeks+(t.choice==='PARTY'?2:0)||!Number.isInteger(t.fundedWeeks)||t.fundedWeeks<0||t.fundedWeeks>t.weeks||t.completedTurn!==null&&(!Number.isInteger(t.completedTurn)||t.completedTurn>st.turnCount||t.completedTurn<t.startTurn+t.weeks||t.fundedWeeks!==t.weeks)||!r.receipts.some(p=>p.turn===t.startTurn&&p.costB===opt.costB&&p.title==='Ekipi: '+t.key+': '+t.choice))fail();tasks.add(t.key);}for(const p of h.projects){const b=worldFacilities(st).find(b=>b.id===p.buildingId);if(!b||assigned.has(p.receiptId)||b.paymentId!==p.receiptId||b.categoryId!==p.kind||b.startTurn!==p.turn||p.turn<r.awardTurn||!WORLD_HOST_EVENTS[r.eventId].venues[p.kind.slice(6)]||(r.model!=='JOINT'&&b.worldCity!==r.city))fail();assigned.add(p.receiptId);}if(h.settledTurn!==null&&(!Number.isInteger(h.settledTurn)||h.settledTurn>st.turnCount||h.stage!=='CLOSED'||h.returnedB!==fiscalRound(Math.max(0,hostGrantTotal(r)-hostGrantCost(st,r)))||h.retainedB!==fiscalRound(hostGrantTotal(r)-h.returnedB)))fail();}return st;};
