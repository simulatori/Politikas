/* One extension of the living-state registry. Buildings, stock, population and treasury remain canonical. */
function worldDB(st=state){return lifeDB(st)?.world;}
function migrateWorld(st){
 migrateSectorExpansion(st);
 if(!worldDB(st))lifeDB(st).world={version:1,startTurn:st.turnCount,lastTurn:st.turnCount,lastFiscalTurn:st.turnCount,counter:0,cases:[],events:[],upkeep:[]};
}
function worldRows(st,kind){return (worldDB(st)?.cases||[]).filter(r=>r.kind===kind);}
function worldLive(r){return ['OPEN','ACTIVE','REVIEW','STOPPED','COLLAPSED'].includes(r.status);}
function worldRecord(id,st=state){return [...(worldDB(st)?.cases||[]),...(worldDB(st)?.events||[])].find(r=>r.id===id);}
function worldId(){return 'world:'+(++worldDB().counter);}
function worldCity(st,id){return st.municipalities.find(m=>m.id===id);}
function worldAsset(st,id){return st.productionResources.assets.find(a=>a.id===id);}
function worldSourceCity(st,kind,source){
 if(['LIVESTOCK','LAND_POOL'].includes(kind))return source;
 if(kind==='ARCHAEOLOGY')return commissioningProjects(st).find(p=>p.key===source)?.p.from||null;
 const id=worldAsset(st,source)?.municipalityId;return worldCity(st,id)?id:null;
}
function worldPay(r,costB,title,capital=false){const id=lifePay(costB,'Ngjarjet: '+r.id+': '+title,capital);r.receipts.push({id,costB:fiscalRound(costB),turn:state.turnCount,title,capital});return id;}
function worldCanPay(costB,capital=false){return state.budgetTotalB>=costB&&fiscalSpendingCheck(costB,capital).allowed;}
function worldRevenue(r,amountB,title){if(amountB<=0)return;fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+amountB),'Ngjarjet: '+r.id+': '+title,'REVENUE');r.revenues.push({id:state.publicFinance.ledger.at(-1).id,turn:state.turnCount,amountB:fiscalRound(amountB),title});}
function worldLiability(r,amountB,title){if(worldCanPay(amountB))worldPay(r,amountB,title);else{state.publicFinance.arrearsB=fiscalRound(state.publicFinance.arrearsB+amountB);r.liabilities.push({turn:state.turnCount,amountB,title});}}
function worldDone(r,outcome){r.status='DONE';r.completedTurn=state.turnCount;r.outcome=outcome;lifeEvent(WORLD_CASE_DEFS[r.kind].name+': '+outcome,0,r.city||null,r.owner);}
function worldSources(kind,st=state){
 if(['LIVESTOCK','LAND_POOL'].includes(kind))return st.municipalities.map(m=>({id:m.id,label:m.name}));
 if(['FOOD','SUBSIDENCE'].includes(kind))return st.productionResources.assets.filter(a=>a.sector===(kind==='FOOD'?'agriculture':'mines')&&a.level>0).map(a=>({id:a.id,label:(a.spec?.name||PRODUCTION_SECTORS[a.sector].asset)+' · '+a.id}));
 if(kind==='SPECTRUM')return [{id:'B700',label:'Brezi 700 MHz · mbulim rural'},{id:'B3500',label:'Brezi 3.5 GHz · kapacitet urban'}];
 if(kind==='ARCHIVES')return (st.mediaDossiers?.actions||[]).filter(a=>a.riskDelta>0).map(a=>({id:a.id,label:'Veprim i dokumentuar · '+a.kind+' · java '+a.turn}));
 if(kind==='ARCHAEOLOGY')return commissioningProjects(st).filter(p=>p.kind==='ROUTE'&&!p.complete).map(p=>({id:p.key,label:p.p.title||'Itinerari '+p.p.id}));
 return [];
}
function worldCaseReason(kind,source,st=state){
 if(!WORLD_CASE_DEFS[kind])return 'Rast i panjohur.';
 if(!agendaExecutive(st))return 'Kërkon mandat ekzekutiv.';
 if(!worldSources(kind,st).some(s=>s.id===source))return 'Nuk ka burim real të kualifikuar.';
 const old=worldRows(st,kind).filter(r=>r.source===source).at(-1);
 if(old&&(worldLive(old)||['SPECTRUM','ARCHAEOLOGY','LAND_POOL','ARCHIVES'].includes(kind)||st.turnCount-old.openedTurn<48))return 'Ky burim ka rast ekzistues ose është në periudhë pritjeje.';
 return '';
}
function worldNewCase(kind,source,event=false){
 const r={id:worldId(),kind,source,owner:state.playerParty,city:worldSourceCity(state,kind,source),openedTurn:state.turnCount,responseTurn:state.turnCount+4,status:'OPEN',choice:null,startTurn:null,dueTurn:null,completedTurn:null,receipts:[],revenues:[],liabilities:[],roll:Math.random(),qualified:false,event,spreadCities:[],coverage:0};
 if(kind==='FOOD')r.affectedUnits=Math.min(120,Math.floor(state.productionResources.resourceGrid.stock.food));
 if(kind==='ARCHIVES'){const action=state.mediaDossiers.actions.find(a=>a.id===source);r.evidence={id:action.id,kind:action.kind,turn:action.turn,owner:action.owner,riskDelta:action.riskDelta};}
 if(kind==='ARCHAEOLOGY')r.projectCostB=commissioningProjects(state).find(p=>p.key===source).costB;
 worldDB().cases.push(r);
 if(event)addMediaNews('Shteti i Gjallë',WORLD_CASE_DEFS[kind].name+' · kërkohet vendim te Rreziqet dhe mundësitë','NEUTRAL');
 return r;
}
function openWorldCase(kind,source,event=false){return lifeCommit(()=>{
 const reason=worldCaseReason(kind,source);if(reason)throw Error(reason);
 lifeTime('world-open:'+kind+':'+source,1);worldNewCase(kind,source,event);
 });}
function worldChoices(r){
 const defs=WORLD_CASE_DEFS[r.kind].choices;
 if(r.kind==='ARCHAEOLOGY')return {...defs,REROUTE:{...defs.REROUTE,costB:fiscalRound(Math.max(.006,r.projectCostB*.06))}};
 return defs;
}
function chooseWorldCase(id,choice){return lifeCommit(()=>{
 const r=worldRecord(id),opt=r&&WORLD_CASE_DEFS[r.kind]&&worldChoices(r)[choice];
 if(!r||r.status!=='OPEN'||!opt)throw Error('Rasti nuk pret këtë vendim.');
 if(choice==='VACCINE'&&sectorManagementAverage(state,'sec_agri')<4)throw Error('Vaksinimi kërkon shërbim bujqësor ≥4.');
 if(r.kind==='SUBSIDENCE'&&choice==='RELOCATE'&&!resilienceCityHousing(state,r.city))throw Error('Zhvendosja kërkon banim social funksional.');
 lifeTime(r.id+':decision',1);
 if(['LAND_POOL','ARCHAEOLOGY','SUBSIDENCE'].includes(r.kind)&&opt.costB)governingCapital();
 if(opt.costB)worldPay(r,opt.costB,choice,['LAND_POOL','ARCHAEOLOGY','SUBSIDENCE'].includes(r.kind));
 Object.assign(r,{choice,startTurn:state.turnCount,dueTurn:state.turnCount+opt.weeks,status:'ACTIVE'});
 if(r.kind==='FOOD'&&choice!=='HIDE'){
  const n=Math.min(Math.floor(state.productionResources.resourceGrid.stock.food),choice==='RECALL'?r.affectedUnits:Math.ceil(r.affectedUnits*.4));
  state.productionResources.resourceGrid.stock.food-=n;r.discardedUnits=n;
 }
 if(['HIDE','SELECTIVE','RUSH','FORCE'].includes(choice))recordLeakRisk('FAVOUR',r.id,null,10);
 });}
function worldFinishCase(r){
 if(r.kind==='FOOD'){
  r.qualified=r.choice==='RECALL'||r.choice==='TARGET'&&sectorManagementAverage(state,'sec_agri')>=4&&r.roll>=.25;
  if(!r.qualified){r.exposed=true;r.untilTurn=state.turnCount+12;worldLiability(r,.006,'Pacientët dhe dëmshpërblimet ushqimore');crisisApproval(-4);const h=state.stateSectors.find(s=>s.id==='sec_health');h.score=clamp(h.score-3,0,100);}
  worldDone(r,r.qualified?'Loti u izolua dhe furnizimi u kontrollua':'Pacientë në spitale dhe kufizim eksporti për 12 javë');
 }else if(r.kind==='LIVESTOCK'){
  r.qualified=r.choice!=='VACCINE'||sectorManagementAverage(state,'sec_agri')>=4&&socialFunded(state);r.untilTurn=state.turnCount+(r.choice==='CULL'?12:r.qualified?0:8);
  worldDone(r,r.qualified?'Vatra u kontrollua':'Shërbimi veterinar dështoi; prodhimi rikuperohet ngadalë');
 }else if(r.kind==='SPECTRUM'){
  worldRevenue(r,r.choice==='HIGH'?.012:.006,'Licenca e frekuencave '+r.source);r.status='REVIEW';r.licenceTurn=state.turnCount;r.reviewTurn=state.turnCount+12;r.target=r.choice==='HIGH'?60:90;r.coverage=0;
 }else if(r.kind==='ARCHIVES'){
  r.qualified=r.choice!=='SELECTIVE';r.revealTurn=state.turnCount+4;
  state.governance.credibility=clamp(state.governance.credibility+(r.qualified?3:0),0,100);if(!r.qualified)crisisApproval(2);
  if(r.choice==='FULL'&&r.roll<.5){executiveRelation('EU',-2);crisisApproval(-1);r.witnessRisk=true;}
  worldDone(r,r.qualified?'Dosja burimore u publikua; procedurat e hetimit mbeten të pavarura':'Publikim selektiv; dosja e plotë mund të rrjedhë');
 }else if(r.kind==='ARCHAEOLOGY'){
  r.qualified=r.choice!=='RUSH';r.untilTurn=state.turnCount+48;if(!r.qualified)r.courtTurn=state.turnCount+4;
  worldDone(r,r.qualified?'Trashëgimia u ruajt dhe punimet rifilluan':'Punimet vazhduan; trashëgimia u dëmtua në mënyrë të pakthyeshme');
 }else if(r.kind==='LAND_POOL'){
  r.qualified=sectorManagementAverage(state,'sec_agri')>=4;
  if(r.choice==='FORCE'){r.courtTurn=state.turnCount+6;crisisApproval(-2);}
  worldDone(r,r.qualified?'Parcelat private të simuluara kanë mekanizim të përbashkët':'Mungoi këshillimi bujqësor; programi nuk dha produktivitet');
 }else if(r.kind==='SUBSIDENCE'){
  if(r.choice==='STOP'){r.status='STOPPED';r.outcome='Nxjerrja mbetet e ndalur; përforcimi kërkohet para rihapjes.';return;}
  r.qualified=sectorManagementAverage(state,'sec_roads')>=4&&(r.choice!=='RELOCATE'||resilienceCityHousing(state,r.city));
  if(!r.qualified){r.status='STOPPED';r.outcome='Kushtet e sigurisë mungojnë; nxjerrja u ndal.';return;}
  worldDone(r,r.choice==='RELOCATE'?'Banorët u zhvendosën brenda vendit me kompensim':'Galeritë u përforcuan dhe nxjerrja u rikthye');
 }
}
function worldEnforceSpectrum(id,choice){return lifeCommit(()=>{
 const r=worldRecord(id);if(r?.kind!=='SPECTRUM'||r.status!=='REVIEW'||!r.breached||r.enforcement)throw Error('Licenca nuk pret këtë kontroll.');
 if(!['FINE','EXTEND','REVOKE'].includes(choice))throw Error('Zgjedhje e pavlefshme.');lifeTime(r.id+':enforce',1);r.enforcement=choice;r.enforcementTurn=state.turnCount;
 if(choice==='FINE'){worldRevenue(r,.002,'Gjoba e operatorit');r.qualified=false;worldDone(r,'Operatori u gjobit; mbulimi mbeti nën detyrim');}
 if(choice==='EXTEND'){worldPay(r,.001,'Mbikëqyrja shtesë');r.reviewTurn=state.turnCount+6;r.breached=false;}
 if(choice==='REVOKE'){r.revokedTurn=state.turnCount;r.untilTurn=state.turnCount+6;r.qualified=false;worldDone(r,'Licenca u hoq; ndërprerje shërbimi për 6 javë');}
 });}
function worldRepairMine(id){return lifeCommit(()=>{const r=worldRecord(id);if(r?.kind!=='SUBSIDENCE'||!['STOPPED','COLLAPSED'].includes(r.status))throw Error('Miniera nuk pret rihapje.');if(sectorManagementAverage(state,'sec_roads')<4)throw Error('Kërkon infrastrukturë dhe inxhinieri ≥4.');governingCapital();lifeTime(r.id+':repair',1);worldPay(r,.012,'Rihapja e sigurt',true);r.choice='REINFORCE';r.startTurn=state.turnCount;r.dueTurn=state.turnCount+8;r.status='ACTIVE';});}

// Facilities extend the existing sector-building and commissioning pipeline.
let worldConstructionCity=null;
const worldSectorCommit=sectorManagementCommit;
sectorManagementCommit=function(change){return worldSectorCommit(()=>{change();for(const b of sectorManagementRow(state,'sec_local')?.buildings||[])if(b.categoryId.startsWith('world_')&&!b.worldCity)b.worldCity=worldConstructionCity||state.municipalities[0].id;});};
function buildWorldFacility(kind,city){if(!WORLD_FACILITIES[kind]||!worldCity(state,city)||!agendaExecutive(state))return false;if(municipalCapitalBlocked(state)||municipalAusterity(state)){showToast('Investimet kapitale janë të ngrira.');return false;}worldConstructionCity=city;try{return applySectorConstruction(sectorConstructionQuote(state,'sec_local','world_'+kind));}finally{worldConstructionCity=null;}}
function worldFacilities(st){return (sectorManagementRow(st,'sec_local')?.buildings||[]).filter(b=>b.categoryId.startsWith('world_'));}
function worldFacilityPaid(st,b){return !b.worldMothballed&&(worldDB(st)?.upkeep||[]).some(p=>p.buildingId===b.id&&p.turn===st.turnCount);}
function worldFacilityReady(st,b){const c=commissionRecord(st,'BUILD|'+b.id);return b.status==='COMPLETED'&&c?.status==='OPERATIONAL'&&commissionOpen(st,c.key)&&worldFacilityPaid(st,b);}
function mothballWorldFacility(id,on){if(typeof on!=='boolean')return false;return lifeCommit(()=>{const b=worldFacilities(state).find(b=>b.id===id);if(!b)throw Error('Objekti mungon.');lifeTime('world-facility:'+id,1);b.worldMothballed=on;});}
function worldPaidBuses(st){const h=st.transportFleets.history.findLast(h=>h.turn===st.turnCount);return (h?.rows||[]).reduce((n,r)=>{const p=st.transportFleets.purchases.find(p=>p.id===r.fleetId);return n+(p?.type==='bus'&&r.paidB>=r.requiredB&&r.utilization>0?p.count:0);},0);}
function worldHotelBeds(st){const staffing=Math.min(1,productionAllocation(st).factor),energy=resourceEnergy(st);return Math.floor(st.productionResources.assets.filter(a=>a.sector==='tourism'&&a.status==='ACTIVE'&&energy.supplied.has(a.id)).reduce((n,a)=>n+productionAssetCapacity(a),0)*20*staffing*(socialFunded(st)?1:0));}
function worldHostRequirements(st,eventId,city,model='STANDARD'){
 const d=WORLD_HOST_EVENTS[eventId];if(!d||!worldCity(st,city))return [];
 const rows=[],joint=model==='JOINT',temporary=model==='TEMPORARY';
 for(const [kind,n] of Object.entries(d.venues)){
  const anywhere=joint&&!['conference','media'].includes(kind),local=worldFacilities(st).filter(b=>b.categoryId==='world_'+kind&&(anywhere||b.worldCity===city)&&worldFacilityReady(st,b)).length;
  const canRent=temporary&&['media','conference'].includes(kind),have=local+(canRent?1:0);
  rows.push({key:kind,label:WORLD_FACILITIES[kind].name+(anywhere?' · partnerë brenda vendit':' · komuna pritëse')+(canRent?' · kapacitet i përkohshëm i kontraktuar':''),have,need:n,ok:have>=n});
 }
 const tests=[['beds','Shtretër · kapacitet i simuluar i turizmit kombëtar',worldHotelBeds(st),Math.ceil(d.beds*(joint?.8:1))],['buses','Autobusë në operim të paguar',worldPaidBuses(st),d.buses],['airport','Niveli i aeroportit',st.transportFleets.airport.level,d.airport],['security','Siguria / shërbimi policor',sectorManagementAverage(st,'sec_police'),d.security],['health','Shërbimi shëndetësor',sectorManagementAverage(st,'sec_health'),d.health],['roads','Infrastruktura rrugore',sectorManagementAverage(st,'sec_roads'),d.roads],['tech','Shërbimet digjitale',sectorManagementAverage(st,'sec_tech'),d.tech],['diplomacy','Marrëdhëniet minimale BE / SHBA',Math.min(st.diplomacy.EU.score,st.diplomacy.USA.score),d.diplomacy]];
 if(d.water)tests.push(['water','Cilësia e ujit',sectorManagementAverage(st,'sec_water'),d.water]);
 if(d.environment)tests.push(['environment','Shërbimi mjedisor',sectorManagementAverage(st,'sec_env'),d.environment]);
 for(const [key,label,have,need] of tests)rows.push({key,label,have,need,ok:have>=need});
 const power=resourceEnergy(st);rows.push({key:'energy',label:'Energji e mjaftueshme',have:power.capacity,need:power.demand,ok:power.capacity>=power.demand});
 rows.push({key:'funding',label:'Financimi i shërbimeve ≥90%',have:(st.unions?.operatingFunding?.turn===st.turnCount?st.unions.operatingFunding.ratio:0)*100,need:90,ok:socialFunded(st)});
 if(joint)rows.push({key:'partner',label:'Korridor partner aktiv për bashkëorganizim',have:resilienceOperating(st,'TRADE_ROUTE').length?1:0,need:1,ok:resilienceOperating(st,'TRADE_ROUTE').length>0});
 rows.push({key:'access',label:'Kalime dhe delegacione pa bllokadë',have:resilienceBlocked(st)?0:1,need:1,ok:!resilienceBlocked(st)});
 return rows;
}
function worldHostingLive(st){return (worldDB(st)?.events||[]).filter(r=>['BIDDING','PREPARING','RUNNING'].includes(r.status));}
function worldBidReason(st,eventId,city,model){
 if(!agendaExecutive(st))return 'Kërkon mandat ekzekutiv.';
 if(!WORLD_HOST_EVENTS[eventId]||!worldCity(st,city)||!['STANDARD','TEMPORARY','JOINT'].includes(model))return 'Zgjedh organizimin, komunën dhe mënyrën.';
 if(worldHostingLive(st).length)return 'Ka një organizim kombëtar në proces. Përfundoje ose tërhiqe para kandidaturës tjetër.';
 if((worldDB(st)?.events||[]).some(r=>r.eventId===eventId&&st.turnCount-r.openedTurn<48))return 'I njëjti organizim ka periudhë pritjeje 48-javore.';
 if(resilienceBlocked(st)||Math.min(st.diplomacy.EU.score,st.diplomacy.USA.score)<40)return 'Kandidatura kërkon kalime të hapura dhe marrëdhënie BE / SHBA ≥40.';
 return '';
}
function bidWorldEvent(eventId,city,model='STANDARD'){return lifeCommit(()=>{
 const reason=worldBidReason(state,eventId,city,model);if(reason)throw Error(reason);governingCapital();lifeTime('world-bid:'+eventId,2);
 const d=WORLD_HOST_EVENTS[eventId],r={id:worldId(),eventId,city,model,owner:state.playerParty,openedTurn:state.turnCount,status:'BIDDING',awardTurn:state.turnCount+2,dueTurn:state.turnCount+2+d.prep,endTurn:null,completedTurn:null,roll:Math.random(),receipts:[],revenues:[],liabilities:[],paidWeeks:[],checks:[],goodWeeks:0,elapsed:0,postponed:false};
 worldPay(r,d.bidB,'Kandidatura');worldDB().events.push(r);
 });}
function worldEventWeekly(r){const d=WORLD_HOST_EVENTS[r.eventId];return fiscalRound(d.weeklyB*(r.model==='TEMPORARY'?1.6:r.model==='JOINT'?1.2:1));}
function worldEventSetup(r){return fiscalRound(WORLD_HOST_EVENTS[r.eventId].setupB*(r.model==='TEMPORARY'?1.3:r.model==='JOINT'?.8:1));}
function postponeWorldEvent(id){return lifeCommit(()=>{const r=worldRecord(id);if(!r?.eventId||r.status!=='PREPARING'||r.postponed||state.turnCount>=r.dueTurn)throw Error('Organizimi nuk mund të shtyhet.');lifeTime(id+':postpone',1);worldPay(r,fiscalRound(worldEventSetup(r)*.25),'Shtyrja e organizimit');r.postponed=true;r.dueTurn+=4;});}
function withdrawWorldEvent(id){return lifeCommit(()=>{const r=worldRecord(id);if(!r?.eventId||!['BIDDING','PREPARING'].includes(r.status))throw Error('Organizimi nuk mund të tërhiqet.');lifeTime(id+':withdraw',1);if(r.status==='PREPARING')worldPay(r,fiscalRound(worldEventSetup(r)*.1),'Tërheqja nga kontrata');r.status='WITHDRAWN';r.completedTurn=state.turnCount;crisisApproval(-1);});}
function worldFinishEvent(r){
 const d=WORLD_HOST_EVENTS[r.eventId],ratio=r.goodWeeks/d.duration;r.status=ratio===1?'DONE':'FAILED';r.completedTurn=state.turnCount;r.success=ratio===1;
 r.actualVisitors=Math.floor(d.visitors*ratio);r.visitorSpendingB=fiscalRound(r.actualVisitors*d.spend/1e9);
 r.taxRate=Math.min(.2,Math.max(0,state.taxPolicy.vat)/100);
 worldRevenue(r,fiscalRound(r.visitorSpendingB*r.taxRate),'TVSH nga vizitorët e organizimit');
 crisisApproval(r.success?2:-3);executiveRelation('EU',r.success?1:-2);
 lifeEvent(d.name+(r.success?' u përfundua me sukses':' përfundoi me mangësi'),r.success?.5:-1,r.city,r.owner);
}
function worldProcessFiscal(turn){
 const db=worldDB();if(!db||turn!==state.turnCount||turn<=db.lastFiscalTurn)return;db.lastFiscalTurn=turn;
 for(const b of worldFacilities(state).filter(b=>b.status==='COMPLETED'&&!b.worldMothballed)){
  const cost=WORLD_FACILITIES[b.categoryId.slice(6)].weeklyB;if(!worldCanPay(cost))continue;
  const receiptId=lifePay(cost,'Mirëmbajtje organizimesh: '+b.id);db.upkeep.push({turn,buildingId:b.id,costB:cost,receiptId});
 }
 for(const r of worldHostingLive(state).filter(r=>['PREPARING','RUNNING'].includes(r.status)&&turn>r.awardTurn)){
  const cost=worldEventWeekly(r);if(worldCanPay(cost)){const receiptId=worldPay(r,cost,'Operimi javor');r.paidWeeks.push({turn,receiptId});}
 }
 for(const r of db.cases.filter(r=>r.kind==='ARCHAEOLOGY'&&worldLive(r)&&turn>r.openedTurn))worldLiability(r,.0001,'Pritja javore e kontraktorit');
}
function worldProcessWeek(turn){
 const db=worldDB();if(!db||turn!==state.turnCount||turn<=db.lastTurn)return;db.lastTurn=turn;
 for(const r of db.cases){
  if(r.status==='OPEN'&&turn>r.responseTurn){
   r.neglected=true;
   if(r.kind==='SUBSIDENCE'){r.status='COLLAPSED';worldLiability(r,.008,'Evakuimi urgjent');crisisApproval(-4);r.outcome='Shembje dhe ndalim i nxjerrjes deri në përforcim.';}
   else if(r.kind==='LIVESTOCK'){if(!r.spreadCities.length){r.spreadCities=state.municipalities.filter(m=>m.id!==r.city).slice(0,2).map(m=>m.id);crisisApproval(-2);}}
   else if(r.kind==='FOOD'){r.choice='HIDE';r.startTurn=turn;r.dueTurn=turn+2;r.status='ACTIVE';}
  }
  if(r.status==='ACTIVE'&&turn>=r.dueTurn)worldFinishCase(r);
  if(r.kind==='SPECTRUM'&&r.status==='REVIEW'&&!r.breached){
   if(turn>r.licenceTurn&&socialFunded(state)&&sectorManagementAverage(state,'sec_tech')>=3)r.coverage=Math.min(100,r.coverage+(r.choice==='COVERAGE'?8:r.enforcement==='EXTEND'?5:3));
   if(turn>=r.reviewTurn){if(r.coverage>=r.target){r.qualified=true;worldDone(r,'Detyrimi i mbulimit u përmbush');}else if(r.enforcement==='EXTEND'){r.revokedTurn=turn;r.untilTurn=turn+6;r.qualified=false;worldDone(r,'Afati shtesë dështoi; licenca u hoq');}else{r.breached=true;r.outcome='Operatori nuk arriti mbulimin; zgjedh gjobë, afat shtesë ose heqje licence.';}}
  }
  if(r.courtTurn&&turn>=r.courtTurn&&!r.courtProcessed){r.courtProcessed=turn;if(r.roll<.6){worldLiability(r,.006,'Dëmshpërblimi gjyqësor');crisisApproval(-2);}}
  if(r.kind==='ARCHIVES'&&r.choice==='SELECTIVE'&&turn>=r.revealTurn&&!r.leakProcessed){r.leakProcessed=turn;if(r.roll<.7){r.exposed=true;state.governance.credibility=clamp(state.governance.credibility-6,0,100);crisisApproval(-3);lifeEvent('Rrjedhja e dosjes së plotë zbuloi publikimin selektiv',-1);}}
 }
 for(const r of worldHostingLive(state)){
  const d=WORLD_HOST_EVENTS[r.eventId];
  if(r.status==='BIDDING'&&turn>=r.awardTurn){
   const relation=Math.min(state.diplomacy.EU.score,state.diplomacy.USA.score),eligible=!resilienceBlocked(state)&&relation>=40,won=eligible&&r.roll>=Math.max(.1,.5-relation/200);
   if(!won){r.status='REJECTED';r.completedTurn=turn;continue;}
   const setup=worldEventSetup(r);if(!worldCanPay(setup,true)||municipalCapitalBlocked(state)||municipalAusterity(state)){r.status='FAILED';r.completedTurn=turn;r.failureReason='Kandidatura fitoi, por buxheti nuk mbuloi kontratën e organizimit.';continue;}
   worldPay(r,setup,'Kontrata e organizimit',true);r.status='PREPARING';addMediaNews('Organizimet',d.name+' · kandidatura fitoi; kontrollo kushtet dhe afatin.','NEUTRAL');
  }
  if(r.status==='PREPARING'&&turn>=r.dueTurn){
   const tests=worldHostRequirements(state,r.eventId,r.city,r.model),paid=r.paidWeeks.some(p=>p.turn===turn);r.checks=tests.map(t=>({...t}));r.inspectedTurn=turn;
   if(!paid||tests.some(t=>!t.ok)){r.status='FAILED';r.completedTurn=turn;r.failureReason=(!paid?'Operimi i organizimit nuk u pagua. ':'')+tests.filter(t=>!t.ok).map(t=>t.label).join(' · ');worldLiability(r,fiscalRound(worldEventSetup(r)*.1),'Anulimi për mungesë kushtesh');crisisApproval(-3);continue;}
   r.status='RUNNING';r.startedTurn=turn;r.endTurn=turn+d.duration;
  }
  if(r.status==='RUNNING'&&turn>r.startedTurn){r.elapsed++;if(r.paidWeeks.some(p=>p.turn===turn)&&worldHostRequirements(state,r.eventId,r.city,r.model).every(t=>t.ok))r.goodWeeks++;if(turn>=r.endTurn)worldFinishEvent(r);}
 }
 // Incidents use only existing sources; the latest observation is processed once per game week.
 if(turn%8===0&&agendaExecutive(state)&&Math.random()<.1){const kinds=['FOOD','LIVESTOCK','ARCHAEOLOGY','SUBSIDENCE'],kind=kinds[Math.floor(Math.random()*kinds.length)],source=worldSources(kind).find(s=>!worldCaseReason(kind,s.id));if(source){
  // Background incidents do not consume the player's weekly action budget or perform a nested save.
  worldNewCase(kind,source.id,true);
 }}
}
function worldProductionFactor(st,id){
 let factor=1;
 for(const r of worldDB(st)?.cases||[]){
  if(id==='agriculture'&&r.kind==='LIVESTOCK'&&(worldLive(r)||r.untilTurn>st.turnCount))factor*=r.choice==='CULL'?.88:r.spreadCities.length?.8:.95;
  if(id==='agriculture'&&r.kind==='LAND_POOL'&&r.status==='DONE'&&r.qualified&&socialFunded(st)&&sectorManagementAverage(st,'sec_agri')>=4)factor*=1.02;
  if(id==='light'&&r.kind==='SPECTRUM'&&r.qualified&&socialFunded(st))factor*=1.015;
  if(id==='light'&&r.kind==='SPECTRUM'&&r.revokedTurn&&r.untilTurn>st.turnCount)factor*=.95;
  if(id==='tourism'&&r.kind==='ARCHAEOLOGY'&&r.qualified&&r.untilTurn>st.turnCount)factor*=1.03;
 }
 if(id==='mines'){
  const assets=st.productionResources.assets.filter(a=>a.sector==='mines'&&a.level>0),weight=assets.reduce((n,a)=>n+worldCapacityBase(a),0);
  let available=0;for(const a of assets)available+=worldCapacityBase(a)*worldMineFactor(st,a.id);if(weight)factor*=available/weight;
 }
 return clamp(factor,0,1.15);
}
function worldMineFactor(st,id){const row=worldRows(st,'SUBSIDENCE').findLast(r=>r.source===id&&worldLive(r));return !row?1:['STOPPED','COLLAPSED'].includes(row.status)||row.choice==='STOP'?0:row.choice==='REINFORCE'?.5:row.choice==='RELOCATE'?.75:1;}
const worldInitBase=initialiseProduction,worldPrepareBase=prepareLoadedState,worldValidateBase=validateLoadedState,worldWeekBase=processPoliticalLifeWeek,worldFiscalBase=processFiscalWeek,worldProductionBase=productionRawReport,worldPausedBase=lifeProjectPaused,worldForecastBase=forecastSupplementary,worldCalendarBase=stateCalendarEntries;
const worldCapacityBase=productionAssetCapacity;
// Capacity changes at the source so iron, oil and gold keep their own physical settlement and receipts.
productionAssetCapacity=function(a){return worldCapacityBase(a)*(a.sector==='mines'&&typeof state!=='undefined'&&state?.productionResources?.assets.includes(a)?worldMineFactor(state,a.id):1);};
initialiseProduction=function(st){worldInitBase(st);migrateWorld(st);};
prepareLoadedState=function(raw){
 // Older policies predate the seven facility categories. Add their neutral keys before inner validators run.
 const input=JSON.parse(JSON.stringify(raw));if(input.sectorManagement)migrateSectorExpansion(input);
 const st=worldPrepareBase(input);migrateWorld(st);return st;
};
processPoliticalLifeWeek=function(turn){const result=worldWeekBase(turn);worldProcessWeek(turn);return result;};
processFiscalWeek=function(turn){if(turn===state.turnCount&&state.publicFinance?.lastWeek<turn){fiscalYearTransition();worldProcessFiscal(turn);}return worldFiscalBase(turn);};
productionRawReport=function(st,id,...args){const r=worldProductionBase(st,id,...args),before=r.output,factor=worldProductionFactor(st,id),boosted=id==='mines'?before:before*factor,extra=Math.max(0,boosted-r.demand)-Math.max(0,before-r.demand);r.worldFactor=factor;r.output=+(boosted-(extra>0?extra*(1-(r.exportMarketFactor??1)):0)).toFixed(3);if(id==='agriculture'&&worldRows(st,'FOOD').some(c=>c.exposed&&c.untilTurn>st.turnCount))r.output=+Math.min(r.output,r.demand+Math.max(0,r.output-r.demand)*.7).toFixed(3);return productionFinishReport(id,r);};
lifeProjectPaused=function(st,key){return worldPausedBase(st,key)||worldRows(st,'ARCHAEOLOGY').some(r=>r.source===key&&worldLive(r));};
forecastSupplementary=function(st){const r=worldForecastBase(st);r.costsB+=worldFacilities(st).filter(b=>b.status==='COMPLETED'&&!b.worldMothballed).reduce((n,b)=>n+WORLD_FACILITIES[b.categoryId.slice(6)].weeklyB,0)+worldHostingLive(st).filter(r=>r.status!=='BIDDING').reduce((n,r)=>n+worldEventWeekly(r),0)+worldRows(st,'ARCHAEOLOGY').filter(worldLive).length*.0001;for(const event of worldHostingLive(st).filter(x=>x.status!=='BIDDING'))r.expiring.push({turn:(event.endTurn||event.dueTurn+WORLD_HOST_EVENTS[event.eventId].duration)+1,weeklyB:worldEventWeekly(event),title:'Përfundon operimi: '+WORLD_HOST_EVENTS[event.eventId].name});return r;};
stateCalendarEntries=function(st){st=st||state;const db=worldDB(st);return worldCalendarBase(st).concat([...(db?.cases||[]),...(db?.events||[])].map(r=>({id:r.id,source:'political-life',key:r.id,title:r.eventId?WORLD_HOST_EVENTS[r.eventId].name:WORLD_CASE_DEFS[r.kind].name,description:r.outcome||r.failureReason||'Kontrollo kushtet dhe afatin.',category:r.eventId?'DIPLOMACY':'TASKS',turn:r.endTurn||r.reviewTurn||r.dueTurn||r.responseTurn,status:calendarStatus(r.eventId?worldHostingLive(st).includes(r)?'PENDING':'COMPLETED':worldLive(r)?'PENDING':'COMPLETED',r.dueTurn||r.openedTurn,st.turnCount),target:r.eventId?'WORLD_EVENTS':'WORLD_CASES'})));};
validateLoadedState=function(st){worldValidateBase(st);validateWorld(st);return st;};
function validateWorld(st){
 const db=worldDB(st);if(!db)return;const bad=()=>{throw Error('Regjistri i organizimeve dhe mundësive është i pavlefshëm.');},turn=t=>Number.isInteger(t)&&t>=db.startTurn&&t<=st.turnCount;
 if(db.version!==1||!turn(db.startTurn)||!turn(db.lastTurn)||!turn(db.lastFiscalTurn)||!Number.isInteger(db.counter)||db.counter<0||!Array.isArray(db.cases)||!Array.isArray(db.events)||!Array.isArray(db.upkeep)||db.counter!==db.cases.length+db.events.length)bad();
 const ids=new Set(),receipts=new Set(),live=new Set();
 for(const r of [...db.cases,...db.events]){
  if(!/^world:[1-9][0-9]*$/.test(r.id)||Number(r.id.split(':')[1])>db.counter||ids.has(r.id)||!st.parties[r.owner]||(r.eventId||r.city!==null)&&!worldCity(st,r.city)||!turn(r.openedTurn)||!Number.isFinite(r.roll)||r.roll<0||r.roll>=1||!['receipts','revenues','liabilities'].every(k=>Array.isArray(r[k])))bad();ids.add(r.id);
  for(const p of r.receipts){const f=st.publicFinance.ledger.find(f=>f.id===p.id);if(receipts.has(p.id)||!f||!turn(p.turn)||f.turn!==p.turn||!Number.isFinite(p.costB)||p.costB<=0||Math.abs(f.amountB+p.costB)>1e-9||f.type!==(p.capital?'CAPITAL_PAYMENT':'EXPENSE')||f.source!=='Jeta politike: Ngjarjet: '+r.id+': '+p.title)bad();receipts.add(p.id);}
  for(const p of r.revenues){const f=st.publicFinance.ledger.find(f=>f.id===p.id);if(receipts.has(p.id)||!f||!turn(p.turn)||f.turn!==p.turn||!Number.isFinite(p.amountB)||p.amountB<=0||f.amountB!==p.amountB||f.type!=='REVENUE'||f.source!=='Ngjarjet: '+r.id+': '+p.title)bad();receipts.add(p.id);}
  for(const p of r.liabilities)if(!turn(p.turn)||!Number.isFinite(p.amountB)||p.amountB<=0||typeof p.title!=='string')bad();
  if(r.completedTurn!==null&&!turn(r.completedTurn))bad();
  if(r.eventId){
   const d=WORLD_HOST_EVENTS[r.eventId];if(!d||!['STANDARD','TEMPORARY','JOINT'].includes(r.model)||!['BIDDING','PREPARING','RUNNING','DONE','FAILED','WITHDRAWN','REJECTED'].includes(r.status)||r.awardTurn!==r.openedTurn+2||r.dueTurn!==r.awardTurn+d.prep+(r.postponed?4:0)||!Array.isArray(r.paidWeeks)||!Array.isArray(r.checks)||!Number.isInteger(r.goodWeeks)||r.goodWeeks<0||r.goodWeeks>d.duration||!Number.isInteger(r.elapsed)||r.elapsed<r.goodWeeks||r.elapsed>d.duration||!r.receipts.some(p=>p.title==='Kandidatura'&&p.costB===d.bidB&&p.turn===r.openedTurn))bad();
   if(['PREPARING','RUNNING','DONE'].includes(r.status)&&!r.receipts.some(p=>p.title==='Kontrata e organizimit'&&p.costB===worldEventSetup(r)&&p.capital))bad();
   const weeks=new Set();for(const p of r.paidWeeks){if(!turn(p.turn)||p.turn<=r.awardTurn||weeks.has(p.turn)||!r.receipts.some(q=>q.id===p.receiptId&&q.turn===p.turn&&q.costB===worldEventWeekly(r)&&q.title==='Operimi javor'))bad();weeks.add(p.turn);}
   if(r.postponed&&!r.receipts.some(p=>p.title==='Shtyrja e organizimit'&&p.costB===fiscalRound(worldEventSetup(r)*.25)))bad();
   if(r.inspectedTurn!==undefined){
    const expected=worldHostRequirements(st,r.eventId,r.city,r.model).map(t=>t.key),keys=r.checks.map(t=>t.key);
    if(!turn(r.inspectedTurn)||r.inspectedTurn!==r.dueTurn||keys.length!==expected.length||new Set(keys).size!==keys.length||expected.some(k=>!keys.includes(k))||r.checks.some(t=>!Number.isFinite(t.have)||!Number.isFinite(t.need)||t.have<0||t.need<0||typeof t.ok!=='boolean'||t.ok!==(t.have>=t.need)))bad();
    if(!r.receipts.some(p=>p.title==='Kontrata e organizimit'&&p.costB===worldEventSetup(r)&&p.capital))bad();
   }
   if(r.startedTurn!==undefined&&(!turn(r.startedTurn)||r.startedTurn!==r.dueTurn||r.endTurn!==r.startedTurn+d.duration||r.inspectedTurn!==r.startedTurn))bad();
   if(r.status==='RUNNING'&&r.startedTurn===undefined)bad();
   if(['DONE','REJECTED','FAILED','WITHDRAWN'].includes(r.status)&&!turn(r.completedTurn))bad();
   if(r.actualVisitors!==undefined){if(r.actualVisitors!==Math.floor(d.visitors*r.goodWeeks/d.duration)||r.visitorSpendingB!==fiscalRound(r.actualVisitors*d.spend/1e9)||!Number.isFinite(r.taxRate)||r.taxRate<0||r.taxRate>.2||r.revenues.reduce((n,p)=>n+p.amountB,0)!==fiscalRound(r.visitorSpendingB*r.taxRate)||r.completedTurn!==r.endTurn)bad();}
   if(r.status==='DONE'&&(r.goodWeeks!==d.duration||!r.success||r.actualVisitors!==d.visitors||r.completedTurn!==r.endTurn||!r.checks.length||r.checks.some(t=>!t.ok)))bad();
  }else{
   if(!WORLD_CASE_DEFS[r.kind]||!['OPEN','ACTIVE','REVIEW','STOPPED','COLLAPSED','DONE'].includes(r.status)||r.responseTurn!==r.openedTurn+4||typeof r.qualified!=='boolean'||!Array.isArray(r.spreadCities)||r.spreadCities.some(id=>!worldCity(st,id))||!Number.isFinite(r.coverage)||r.coverage<0||r.coverage>100)bad();
   const key=r.kind+':'+r.source;if(worldLive(r)&&live.has(key))bad();if(worldLive(r))live.add(key);
   if(['FOOD','SUBSIDENCE'].includes(r.kind)&&!worldAsset(st,r.source))bad();if(['LIVESTOCK','LAND_POOL'].includes(r.kind)&&!worldCity(st,r.source))bad();if(r.kind==='ARCHAEOLOGY'&&(!commissioningProjects(st).some(p=>p.key===r.source)||!Number.isFinite(r.projectCostB)))bad();if(r.kind==='SPECTRUM'&&!['B700','B3500'].includes(r.source))bad();
   if(r.kind==='ARCHIVES'){const a=st.mediaDossiers?.actions.find(a=>a.id===r.source);if(!a||!r.evidence||a.id!==r.evidence.id||a.owner!==r.evidence.owner||a.turn!==r.evidence.turn||a.riskDelta!==r.evidence.riskDelta)bad();}
   if(r.kind==='FOOD'&&(!Number.isInteger(r.affectedUnits)||r.affectedUnits<0||r.affectedUnits>120||r.discardedUnits!==undefined&&(!Number.isInteger(r.discardedUnits)||r.discardedUnits<0||r.discardedUnits>r.affectedUnits)))bad();
   if(r.choice!==null){const opt=worldChoices(r)[r.choice];if(!opt||!turn(r.startTurn)||r.dueTurn!==r.startTurn+opt.weeks)bad();if(opt.costB&&!r.receipts.some(p=>p.costB===opt.costB&&p.title===r.choice)&&!r.receipts.some(p=>p.title==='Rihapja e sigurt'&&p.costB===.012))bad();}
  }
 }
 if(worldHostingLive(st).length>1)bad();
 const paid=new Set();for(const p of db.upkeep){const b=worldFacilities(st).find(b=>b.id===p.buildingId),f=st.publicFinance.ledger.find(f=>f.id===p.receiptId),key=p.buildingId+':'+p.turn;if(!b||!turn(p.turn)||paid.has(key)||receipts.has(p.receiptId)||p.costB!==WORLD_FACILITIES[b.categoryId.slice(6)].weeklyB||!f||f.turn!==p.turn||f.type!=='EXPENSE'||Math.abs(f.amountB+p.costB)>1e-9||f.source!=='Jeta politike: Mirëmbajtje organizimesh: '+b.id)bad();paid.add(key);receipts.add(p.receiptId);}
 for(const b of worldFacilities(st))if(!WORLD_FACILITIES[b.categoryId.slice(6)]||!worldCity(st,b.worldCity)||b.worldMothballed!==undefined&&typeof b.worldMothballed!=='boolean')bad();
}
