/* Nine extensions of world.cases; existing assets, companies, receipts and seasonality stay authoritative. */
function economyRows(st,kind){return worldRows(st,kind);}
function economyMeta(st=state){return worldDB(st)?.economy;}
function economyBidder(st,id){return st.foreignInvestments?.bidders.find(b=>b.id===id);}
function economyCompanies(st,families){return (st.foreignInvestments?.bidders||[]).filter(b=>b.status==='COMPLETED'&&!socioAnchorClosed(st,b.id)&&(!families||families.includes(fdiInvestor(b.investorId)?.family)));}
function economyFacility(st,source){const key=source.split('|HOST|')[0];return commissioningProjects(st).find(p=>p.key===key&&p.kind==='BUILD');}
function economyEnvironmentalSites(st,landfill=false){return commissioningProjects(st).filter(p=>p.kind==='BUILD'&&p.sector==='sec_env'&&(landfill?p.p.categoryId==='hydro_permits':['recycling','illegal_dumps','hydro_permits'].includes(p.p.categoryId))&&commissionRecord(st,p.key)?.status==='OPERATIONAL'&&commissionOpen(st,p.key));}
function economyPaidSubsidies(st){return (st.productionResources?.history||[]).flatMap(h=>Object.entries(h.sectors).filter(([,s])=>s.subsidyPaidB>0&&s.subsidyReceipt).map(([sector,s])=>({id:s.subsidyReceipt,sector,turn:h.turn,amountB:s.subsidyPaidB,workers:s.workers||0})));}
const economyMigrateBase=migrateWorld;
migrateWorld=function(st){economyMigrateBase(st);if(!economyMeta(st)){if(worldDB(st).cases.some(r=>ECONOMY_CASE_DEFS[r.kind]))throw Error('Mungon historiku i dosjeve ekonomike.');worldDB(st).economy={version:1,startTurn:st.turnCount,lastTurn:st.turnCount,lastFiscalTurn:st.turnCount};}};
const economySourcesBase=worldSources,economyReasonBase=worldCaseReason,economyNewBase=worldNewCase,economyChoicesBase=worldChoices,economyChooseBase=chooseWorldCase,economyFinishBase=worldFinishCase,economyWeekBase=worldProcessWeek,economyFiscalBase=worldProcessFiscal,economyValidateBase=validateLoadedState,economyFactorBase=worldProductionFactor,economyEnergyBase=resourceEnergy,economyQualityBase=sectorManagementAverage,economyClosedBase=socioAnchorClosed,economyEligibilityBase=socioEligibility,economyHouseholdsBase=lifeHouseholds,economyForecastBase=forecastSupplementary;
worldSources=function(kind,st=state){
 if(kind==='DATACENTER')return economyCompanies(st,['TECH']).map(b=>({id:b.id,label:fdiBidderTitle(b)}));
 if(kind==='WASTE_IMPORT')return economyEnvironmentalSites(st).map(p=>({id:p.key,label:p.p.title}));
 if(kind==='UNIVERSITY')return [{id:'sec_edu',label:'Arsimi i lartë · dosje e operatorit privat të simuluar'}];
 if(kind==='DEEPFAKE')return st.laws.filter(l=>['DRAFT','SCHEDULED','DEBATE','REVIEW'].includes(l.status)).map(l=>({id:l.id,label:l.title}));
 if(kind==='SUBSIDY_FRAUD')return economyPaidSubsidies(st).map(p=>({id:p.id,label:PRODUCTION_SECTORS[p.sector].name+' · '+enterpriseMoney(p.amountB)+' · java '+p.turn}));
 if(kind==='SUCCESSION')return economyCompanies(st).filter(b=>fdiInvestor(b.investorId).tier<=2).map(b=>({id:b.id,label:fdiBidderTitle(b)}));
 if(kind==='LANDFILL')return economyEnvironmentalSites(st,true).flatMap(p=>st.municipalities.map(m=>({id:p.key+'|HOST|'+m.id,label:p.p.title+' · pritëse '+m.name})));
 if(kind==='RETAIL_PAY')return economyCompanies(st,['AGRIFOOD']).map(b=>({id:b.id,label:fdiBidderTitle(b)+' · faturat e rrjetit blerës'}));
 if(kind==='SEASONAL')return st.productionResources.assets.some(a=>a.sector==='tourism'&&a.level>0)?st.municipalities.map(m=>({id:m.id,label:m.name})):[];
 return economySourcesBase(kind,st);
};
worldCaseReason=function(kind,source,st=state){
 const base=economyReasonBase(kind,source,st);if(base)return base;if(!ECONOMY_CASE_DEFS[kind])return '';
 const rows=economyRows(st,kind),old=rows.findLast(r=>r.source===source);
 if(old&&['DATACENTER','UNIVERSITY','SUCCESSION','SUBSIDY_FRAUD'].includes(kind))return 'Kjo dosje ekziston; përdor veprimet e saj dhe burimin e njëjtë.';
 if(kind==='LANDFILL'&&rows.some(r=>r.source.split('|HOST|')[0]===source.split('|HOST|')[0]))return 'Kjo deponi ka marrëveshje ekzistuese; nuk hapet kontratë tjetër për të njëjtin objekt.';
 if(kind==='SUBSIDY_FRAUD'){const p=economyPaidSubsidies(st).find(p=>p.id===source);if(rows.some(r=>r.economy.grantSector===p?.sector&&(worldLive(r)||st.turnCount-r.openedTurn<24)))return 'Programi i këtij sektori ka auditim aktiv ose periudhë pritjeje.';}
 if(kind==='SUCCESSION'&&socioDB(st).cases.some(r=>r.kind==='ANCHOR'&&r.source===source&&socioActive(r)))return 'Biznesi ka rast aktiv te Punëdhënësi dominues; përfundo atë dosje.';
 if(kind==='DEEPFAKE'&&(pendingMediaDossier(st)||rows.some(worldLive)))return 'Përfundo së pari dosjen mediatike ose verifikimin aktiv.';
 if(kind==='SEASONAL'&&rows.some(r=>r.source===source&&r.qualified&&r.untilTurn>=st.turnCount))return 'Komuna ka program aktiv jashtë sezonit.';
 return '';
};
worldNewCase=function(kind,source,event=false){
 const r=economyNewBase(kind,source,event);if(!ECONOMY_CASE_DEFS[kind])return r;
 r.economy={version:1,fundedWeeks:0,followups:[],operatingPayments:[],recoveredB:0};const e=r.economy;
 if(kind==='UNIVERSITY'){e.students=600;e.transferred=0;e.remaining=600;}
 if(kind==='DEEPFAKE'){
  const l=state.laws.find(l=>l.id===source);e.evidence={id:l.id,title:l.title,openedStatus:l.status,turn:state.turnCount};e.initialBelief=60;e.residualBelief=60;
  crisisApproval(-2);for(const p of state.governance.coalitionTrust.records.filter(p=>p.status==='ACTIVE'))changeCoalitionTrust(p,-4,'Pasiguri nga videoja e falsifikuar: '+r.id,state.turnCount);
 }
 if(kind==='SUBSIDY_FRAUD'){
  const p=economyPaidSubsidies(state).find(p=>p.id===source);e.grantSector=p.sector;e.grantTurn=p.turn;e.grantB=p.amountB;e.suspectedB=fiscalRound(p.amountB*.25);e.actualJobs=p.workers;e.declaredJobs=p.workers+Math.ceil(p.workers*.2);e.verifiedJobs=null;
  e.auditFees={FREEZE:Math.max(.000001,fiscalRound(Math.min(.001,p.amountB*.1))),TARGET:Math.max(.000001,fiscalRound(Math.min(.002,p.amountB*.15))),CORRECT:Math.max(.000001,fiscalRound(Math.min(.002,p.amountB*.1)))};
 }
 if(['DATACENTER','SUCCESSION','RETAIL_PAY'].includes(kind)){const b=economyBidder(state,source),i=fdiInvestor(b.investorId);e.investorId=i.id;e.companyJobs=i.jobs;e.companyCapitalB=i.capitalB;}
 if(kind==='DATACENTER')e.loadMW=0;
 if(kind==='LANDFILL'){r.city=source.split('|HOST|')[1];e.partnerCities=state.municipalities.filter(m=>m.id!==r.city).slice(0,2).map(m=>m.id);e.blocked=false;}
 if(kind==='RETAIL_PAY'){e.privateInvoiceB=fiscalRound(Math.min(.005,e.companyCapitalB*.02));e.privateSettledB=0;}
 if(kind==='SEASONAL')r.city=source;
 return r;
};
worldChoices=function(r){const base=economyChoicesBase(r);if(r.kind!=='SUBSIDY_FRAUD'||!r.economy?.auditFees)return base;return {...base,FREEZE:{...base.FREEZE,costB:r.economy.auditFees.FREEZE},TARGET:{...base.TARGET,costB:r.economy.auditFees.TARGET}};};
chooseWorldCase=function(id,choice){
 const r=worldRecord(id);if(!r||!ECONOMY_CASE_DEFS[r.kind])return economyChooseBase(id,choice);
 return lifeCommit(()=>{
  const r=worldRecord(id),opt=worldChoices(r)[choice],e=r.economy;if(r.status!=='OPEN'||!opt)throw Error('Dosja nuk pret këtë vendim.');
  if(r.kind==='SUCCESSION'&&choice==='MERGE'){
   const original=economyBidder(state,r.source),partner=economyCompanies(state,[fdiInvestor(original.investorId).family]).find(b=>b.id!==r.source);
   if(!partner)throw Error('Kërkohet një kompani tjetër reale, aktive, nga e njëjta fushë.');e.partnerId=partner.id;
  }
  if(r.kind==='SEASONAL'&&choice==='COMMUTE'&&worldPaidBuses(state)<5)throw Error('Kërkohen të paktën pesë autobusë me operim të paguar këtë javë.');
  if(['SEASONAL','LANDFILL'].includes(r.kind))governingCapital();
  lifeTime(r.id+':decision',1);if(opt.costB)worldPay(r,opt.costB,choice,['SEASONAL','LANDFILL'].includes(r.kind));
  Object.assign(r,{choice,startTurn:state.turnCount,dueTurn:state.turnCount+opt.weeks,status:'ACTIVE'});
  if(r.kind==='SUBSIDY_FRAUD'&&choice==='FREEZE')crisisApproval(-1);
  if(['PROTECT','PRESSURE','IMPOSE','DEAL'].includes(choice))recordLeakRisk('FAVOUR',r.id,null,20);
 });
};
function economyProgramActive(st,r){return r.status==='DONE'&&r.qualified&&r.untilTurn>=st.turnCount&&!r.economy.suspended;}
function economyPowerSupply(st){const paid=lifeDB(st).contracts.filter(c=>c.kind==='ENERGY'&&c.status==='ACTIVE').flatMap(c=>c.payments.filter(p=>p.turn===st.turnCount).map(p=>({...p,mw:LIFE_CONTRACTS.ENERGY.mw})));return {mw:paid.reduce((n,p)=>n+p.mw,0),costB:paid.reduce((n,p)=>n+p.costB,0),receipts:paid.map(p=>p.receiptId)};}
function economyContractPower(st,id){const supply=economyPowerSupply(st),used=economyRows(st,'DATACENTER').filter(r=>r.id!==id&&r.choice==='POWER'&&economyProgramActive(st,r)&&!socioAnchorClosed(st,r.source)).reduce((n,r)=>n+r.economy.loadMW,0);return supply.mw>=used+60;}
function economyDataLicensed(st,r){return economyProgramActive(st,r)&&!!economyBidder(st,r.source)&&!socioAnchorClosed(st,r.source)&&(r.choice!=='POWER'||economyContractPower(st,r.id));}
function economyDataReady(st,r){const water=socioWaterCase(st);return economyDataLicensed(st,r)&&socialFunded(st)&&sectorManagementAverage(st,'sec_tech')>=4&&sectorManagementAverage(st,'sec_water')>=4&&(!water||water.choice==='INDUSTRY'||water.choice==='SAVE');}
function economyUniversityCapacity(st,exclude){
 if(!socialFunded(st)||sectorManagementAverage(st,'sec_edu')<3)return 0;
 const baseline=sectorManagementLevel(sectorManagementRow(st,'sec_edu'),'universities',true)*100;
 const built=commissioningProjects(st).filter(p=>p.kind==='BUILD'&&p.sector==='sec_edu'&&p.p.categoryId==='universities'&&commissionRecord(st,p.key)?.status==='OPERATIONAL'&&commissionOpen(st,p.key)).length*400;
 const used=economyRows(st,'UNIVERSITY').filter(r=>r.id!==exclude&&r.untilTurn>=st.turnCount).reduce((n,r)=>n+r.economy.transferred,0);
 return Math.max(0,baseline+built-used);
}
function economyRecoverGrant(r,fraction){const e=r.economy,remaining=fiscalRound(e.suspectedB-e.recoveredB),amount=fiscalRound(Math.min(remaining,e.suspectedB*fraction));if(amount>0){worldRevenue(r,amount,'Kthimi i subvencionit burimor');e.recoveredB=fiscalRound(e.recoveredB+amount);}}
function economyCloseBusiness(r){
 if(r.closedTurn)return;const already=socioAnchorClosed(state,r.source);r.closedTurn=state.turnCount;
 if(!already){const jobs=fdiInvestor(economyBidder(state,r.source).investorId).jobs;state.unemployment=clamp(state.unemployment+jobs/Math.max(1,populationWorkforce(state))*100,0,100);r.economy.closedJobsApplied=jobs;}
}
worldFinishCase=function(r){
 if(!ECONOMY_CASE_DEFS[r.kind])return economyFinishBase(r);const e=r.economy;
 if(r.kind==='DATACENTER'){
  if(r.choice==='DECLINE'){r.qualified=false;worldDone(r,'Zgjerimi u refuzua; nuk u krijua kompani ose ngarkesë e re.');return;}
  if(sectorManagementAverage(state,'sec_tech')<4||sectorManagementAverage(state,'sec_water')<4||r.choice==='POWER'&&!economyContractPower(state,r.id)){
   r.status='REVIEW';r.outcome='Leja pret ujë, shërbime digjitale dhe kapacitetin energjetik të kërkuar.';return;
  }
  r.qualified=true;r.untilTurn=state.turnCount+48;e.loadMW=r.choice==='LIMIT'?25:60;
  worldDone(r,'Leja 48-javore u dha mbi operatorin ekzistues; energjia e rezervuar kufizon furnizimin e përdoruesve të tjerë.');
 }else if(r.kind==='WASTE_IMPORT'){
  const treatmentSite=economyEnvironmentalSites(state).find(p=>['recycling','illegal_dumps'].includes(p.p.categoryId)),treatment=!!treatmentSite;
  if(treatmentSite)e.treatmentSiteKey=treatmentSite.key;
  r.qualified=r.choice==='RETURN'?state.diplomacy.EU.score>=50&&!resilienceBlocked(state):r.choice==='TREAT'?treatment&&sectorManagementAverage(state,'sec_env')>=4&&socialFunded(state):r.roll>=.6;
  if(r.choice==='DEAL'&&!e.revealTurn)e.revealTurn=state.turnCount+4;
  if(!r.qualified){r.status='REVIEW';r.outcome='Ngarkesa mbeti e bllokuar; zgjidh trajtim ose rishqyrto kthimin.';return;}
  worldDone(r,r.choice==='RETURN'?'Origjina pranoi kthimin e ngarkesës':'Ngarkesa u trajtua ose u mor nën përgjegjësi të dokumentuar');
 }else if(r.kind==='UNIVERSITY'){
  if(r.choice==='TRANSFER'){
   const available=Math.max(0,economyUniversityCapacity(state,r.id)-e.transferred),moved=Math.min(e.remaining,available);e.transferred+=moved;e.remaining-=moved;r.untilTurn=state.turnCount+48;
   if(e.remaining){r.status='REVIEW';r.outcome=e.transferred+' studentë u transferuan; '+e.remaining+' presin vende të tjera funksionale.';return;}
   r.qualified=true;worldDone(r,'Studentët u transferuan pa tejkaluar kapacitetin e sistemit pritës');
  }else{
   r.qualified=sectorManagementAverage(state,'sec_edu')>=(r.choice==='ADMIN'?5:4)&&socialFunded(state)&&(r.choice!=='ADMIN'||e.fundedWeeks>=6);
   if(!r.qualified){r.status='REVIEW';r.outcome='Operatori nuk i plotësoi standardet. Studentët kërkojnë transferim ose një kontroll tjetër.';return;}
   e.remaining=0;r.untilTurn=state.turnCount+24;worldDone(r,'Standardet u rikthyen nën mbikëqyrje; akreditimi nuk u fal politikisht');
  }
 }else if(r.kind==='DEEPFAKE'){
  r.qualified=r.choice!=='PRESSURE'&&(r.choice!=='FORENSIC'||sectorManagementAverage(state,'sec_tech')>=4);
  e.residualBelief=r.qualified?(r.choice==='FORENSIC'?20:35):55;
  if(r.qualified){crisisApproval(1);for(const p of state.governance.coalitionTrust.records.filter(p=>p.status==='ACTIVE'))changeCoalitionTrust(p,2,'Verifikimi i pavarur i videos: '+r.id,state.turnCount);}
  if(r.choice==='PRESSURE'){e.revealTurn=state.turnCount+4;crisisApproval(.5);}
  worldDone(r,r.qualified?'Materiali u kundërshtua me prova, por një pjesë e publikut vazhdon ta besojë':'Verifikimi nuk e riktheu besimin; presioni ndaj mediave mbetet rrezik');
 }else if(r.kind==='SUBSIDY_FRAUD'){
  e.verifiedJobs=e.actualJobs;r.qualified=r.choice!=='PROTECT';
  if(r.choice==='VOLUNTARY')economyRecoverGrant(r,.6);
  if(r.choice==='FREEZE'||r.choice==='TARGET'){
   const staffed=sectorManagementAverage(state,'sec_justice')>=4&&sectorManagementAverage(state,'sec_econ')>=4;
   if(staffed)economyRecoverGrant(r,1);else r.qualified=false;
  }
  if(r.choice==='PROTECT')e.revealTurn=state.turnCount+4;
  worldDone(r,r.qualified?'U verifikuan vendet e punës dhe u rikuperua vetëm pjesa e dokumentuar':'Rikuperimi mungoi; dosja dhe pagesa burimore mbeten për kontroll');
 }else if(r.kind==='SUCCESSION'){
  const operating=!socioAnchorClosed(state,r.source),capable=r.choice==='WORKERS'?sectorManagementAverage(state,'sec_econ')>=4&&socialFunded(state):r.choice==='SALE'?!resilienceBlocked(state)&&r.roll>=.25:!!economyBidder(state,e.partnerId)&&!socioAnchorClosed(state,e.partnerId);
  r.qualified=operating&&capable;
  if(!r.qualified)economyCloseBusiness(r);else e.successor=r.choice;
  worldDone(r,r.qualified?'Kompania vazhdoi me të njëjtat punë dhe të njëjtin regjistër tatimor':'Biznesi u mbyll; punët dhe tatimet hiqen vetëm një herë');
 }else if(r.kind==='LANDFILL'){
  r.qualified=true;r.untilTurn=state.turnCount+24;e.weeklyB=r.choice==='COMPENSATE'?.0003:.0002;e.hostShare=r.choice==='COMPENSATE'?.5:.4;
  if(r.choice==='COMPENSATE'||r.choice==='SHARE'){const city=worldCity(state,r.city);city.localSupportPlayer=clamp(city.localSupportPlayer+(r.choice==='COMPENSATE'?3:1),0,100);if(r.choice==='SHARE')for(const id of e.partnerCities){const partner=worldCity(state,id);partner.localSupportPlayer=clamp(partner.localSupportPlayer+1,0,100);}}
  if(r.choice==='IMPOSE'){e.blockTurn=state.turnCount+4;const city=worldCity(state,r.city);city.localSupportPlayer=clamp(city.localSupportPlayer-4,0,100);}
  worldDone(r,'Marrëveshja rajonale u lidh mbi deponinë ekzistuese; kontrollo financimin dhe komunën pritëse');
 }else if(r.kind==='RETAIL_PAY'){
  const active=!socioAnchorClosed(state,r.source);r.qualified=active&&(r.choice!=='MARKETS'||sectorManagementAverage(state,'sec_agri')>=4);
  e.privateSettledB=r.qualified?fiscalRound(e.privateInvoiceB*(r.choice==='MEDIATE'?.8:1)):0;
  if(r.qualified&&r.choice==='MEDIATE')e.settlementDueTurn=state.turnCount+4;
  r.untilTurn=state.turnCount+24;if(r.choice==='DEADLINE'&&r.roll<.4)e.importsUntil=state.turnCount+12;
  worldDone(r,r.qualified?'Furnizuesit privatë morën pagesë ose qasje në tregje; shuma nuk hyri në thesar':'Marrëveshja nuk zgjidhi faturat private');
 }else if(r.kind==='SEASONAL'){
  r.qualified=sectorManagementAverage(state,'sec_local')>=4&&socialFunded(state)&&(r.choice!=='COMMUTE'||worldPaidBuses(state)>=5);
  r.untilTurn=state.turnCount+48;e.weeklyB=r.choice==='OFFSEASON'?.0001:0;
  worldDone(r,r.qualified?'Programi ul varësinë jashtë sezonit; kapacitetet ekzistuese nuk u dyfishuan':'Kapaciteti ose transporti i paguar mungoi; programi nuk dha efekt');
 }
};
function economyCaseAction(id,action){return lifeCommit(()=>{
 const r=worldRecord(id),e=r?.economy;if(!r||!ECONOMY_CASE_DEFS[r.kind]||!e)throw Error('Dosja mungon.');
 if(action==='SUSPEND'){
  if(!['DATACENTER','LANDFILL','SEASONAL'].includes(r.kind)||r.status!=='DONE'||!r.qualified||r.untilTurn<state.turnCount)throw Error('Programi nuk është aktiv.');
  lifeTime(id+':suspend',1);e.suspended=!e.suspended;e.followups.push({action,turn:state.turnCount,suspended:e.suspended});return;
 }
 if(action==='RENEW'){
  if(!['DATACENTER','LANDFILL','SEASONAL'].includes(r.kind)||r.status!=='DONE'||!r.qualified||state.turnCount<r.untilTurn-4)throw Error('Rinovimi hapet gjatë katër javëve të fundit ose pas skadimit.');
  lifeTime(id+':renew',1);const cost=r.kind==='DATACENTER'?.0005:.001,receiptId=worldPay(r,cost,'Rinovimi i programit');
  e.followups.push({action,turn:state.turnCount,receiptId,previousUntil:r.untilTurn});r.untilTurn=Math.max(state.turnCount,r.untilTurn)+(r.kind==='LANDFILL'?24:48);return;
 }
 if(action==='RECHECK'){
  if(r.status!=='REVIEW'||!['DATACENTER','WASTE_IMPORT','UNIVERSITY'].includes(r.kind))throw Error('Nuk pritet rishqyrtim.');
  lifeTime(id+':recheck',1);const receiptId=worldPay(r,.0002,'Rishqyrtimi i kushteve');e.followups.push({action,turn:state.turnCount,receiptId});worldFinishCase(r);return;
 }
 if(action==='TREAT_WASTE'){
  if(r.kind!=='WASTE_IMPORT'||r.status!=='REVIEW'||e.followups.some(a=>a.action===action))throw Error('Trajtimi nuk pret këtë vendim.');
  const site=economyEnvironmentalSites(state).find(p=>['recycling','illegal_dumps'].includes(p.p.categoryId));if(!site||sectorManagementAverage(state,'sec_env')<4)throw Error('Kërkohet objekt riciklimi funksional dhe mjedis ≥4.');e.treatmentSiteKey=site.key;
  lifeTime(id+':treatment',1);const receiptId=worldPay(r,.008,'Trajtimi pas bllokadës');e.followups.push({action,turn:state.turnCount,receiptId});e.resolvedWaste=true;r.qualified=true;worldDone(r,'Ngarkesa u trajtua pas bllokadës');return;
 }
 if(action==='TRANSFER_STUDENTS'){
  if(r.kind!=='UNIVERSITY'||r.status!=='REVIEW')throw Error('Studentët nuk presin transferim.');
  const available=Math.max(0,economyUniversityCapacity(state,r.id)-e.transferred);if(!available)throw Error('Nuk ka vende të reja funksionale për transferim.');lifeTime(id+':student-transfer',1);
  const receiptId=worldPay(r,.001,'Transferimi shtesë i studentëve');e.followups.push({action,turn:state.turnCount,receiptId});
  const moved=Math.min(e.remaining,available);e.transferred+=moved;e.remaining-=moved;r.untilTurn=state.turnCount+48;
  if(!e.remaining){r.qualified=true;worldDone(r,'Të gjithë studentët u transferuan brenda kapacitetit ekzistues');}else r.outcome=e.remaining+' studentë ende presin vende.';return;
 }
 if(action==='RENEGOTIATE'){
  if(r.kind!=='LANDFILL'||!e.blocked||e.followups.some(a=>a.action===action))throw Error('Marrëveshja nuk pret rinegocim.');lifeTime(id+':renegotiate',1);
  const receiptId=worldPay(r,.003,'Rinegocimi me komunën pritëse');e.followups.push({action,turn:state.turnCount,receiptId});e.blocked=false;e.blockResolvedTurn=state.turnCount;e.hostShare=.5;r.untilTurn=state.turnCount+24;return;
 }
 if(action==='AUDIT_GRANT'){
  if(r.kind!=='SUBSIDY_FRAUD'||r.status!=='DONE'||e.recoveredB>=e.suspectedB)throw Error('Nuk ka pjesë burimore për rikuperim shtesë.');
  if(sectorManagementAverage(state,'sec_justice')<4||sectorManagementAverage(state,'sec_econ')<4||!socialFunded(state))throw Error('Kërkohen drejtësi, ekonomi ≥4 dhe financim operativ.');
  lifeTime(id+':grant-review',1);const receiptId=worldPay(r,e.auditFees?.CORRECT??.002,'Auditimi korrigjues i subvencionit');e.followups.push({action,turn:state.turnCount,receiptId});e.verifiedJobs=e.actualJobs;economyRecoverGrant(r,1);r.qualified=true;r.outcome='Auditi korrigjues rikuperoi vetëm pjesën e mbetur të pagesës burimore.';return;
 }
 throw Error('Veprim i panjohur.');
});}
function economySubsidyFrozen(st,id){return economyRows(st,'SUBSIDY_FRAUD').some(r=>r.choice==='FREEZE'&&r.status==='ACTIVE'&&r.dueTurn>=st.turnCount);}
function economyWasteBlocked(st){return economyRows(st,'LANDFILL').some(r=>r.status==='DONE'&&r.qualified&&(r.untilTurn<st.turnCount||r.economy.suspended||r.economy.blocked||st.turnCount>r.completedTurn&&!r.economy.operatingPayments.some(p=>p.turn===st.turnCount)))||economyRows(st,'WASTE_IMPORT').some(r=>worldLive(r)&&st.turnCount>r.responseTurn);}
worldProcessFiscal=function(turn){
 const result=economyFiscalBase(turn),d=economyMeta();if(!d||turn!==state.turnCount||turn<=d.lastFiscalTurn)return result;d.lastFiscalTurn=turn;
 for(const r of worldDB().cases.filter(r=>ECONOMY_CASE_DEFS[r.kind])){
  const e=r.economy;
  if(['LANDFILL','SEASONAL'].includes(r.kind)&&economyProgramActive(state,r)&&e.weeklyB&&worldCanPay(e.weeklyB))e.operatingPayments.push({turn,receiptId:worldPay(r,e.weeklyB,'Operimi i programit')});
  if(r.kind==='WASTE_IMPORT'&&worldLive(r)&&turn>r.openedTurn)worldLiability(r,.0002,'Ruajtja e ngarkesës së bllokuar');
 }
 return result;
};
worldProcessWeek=function(turn){
 const result=economyWeekBase(turn),d=economyMeta();if(!d||turn!==state.turnCount||turn<=d.lastTurn)return result;d.lastTurn=turn;
 for(const r of worldDB().cases.filter(r=>ECONOMY_CASE_DEFS[r.kind])){
  const e=r.economy;
  if(r.kind==='DATACENTER'&&turn>r.completedTurn&&economyDataReady(state,r)&&economyEnergyBase(state).capacity>=resourceEnergy(state).demand){
   worldRevenue(r,r.choice==='LIMIT'?.00002:.00005,'Tarifa e licencës digjitale');
   if(r.choice==='POWER'){
    const supply=economyPowerSupply(state),amountB=fiscalRound(supply.costB*e.loadMW/supply.mw);
    worldRevenue(r,amountB,'Rimbursimi i kapacitetit energjetik');e.powerReimbursements=e.powerReimbursements||[];e.powerReimbursements.push({turn,amountB,contractReceipts:supply.receipts,receiptId:r.revenues.at(-1).id});
   }
  }
  if(r.status==='ACTIVE'&&turn>r.startTurn&&socialFunded(state))e.fundedWeeks++;
  if(r.status==='OPEN'&&turn>r.responseTurn&&!e.neglectApplied){
   e.neglectApplied=turn;
   if(r.kind==='SUCCESSION'){economyCloseBusiness(r);r.qualified=false;worldDone(r,'Mungesa e zgjidhjes e mbylli biznesin');}
   if(r.kind==='UNIVERSITY'){r.status='REVIEW';r.outcome='Afati kaloi pa mbrojtur studentët; kërkohet transferim.';crisisApproval(-2);}
  }
  if(r.kind==='LANDFILL'&&e.blockTurn&&turn>=e.blockTurn&&!e.blockResolvedTurn)e.blocked=true;
  if(r.kind==='RETAIL_PAY'&&e.settlementDueTurn&&turn>=e.settlementDueTurn&&!e.settlementCheckedTurn){e.settlementCheckedTurn=turn;if(!socioAnchorClosed(state,r.source))e.privateSettledB=e.privateInvoiceB;}
  if(e.revealTurn&&turn>=e.revealTurn&&!e.revealProcessed){e.revealProcessed=turn;
   if(r.kind==='DEEPFAKE'){state.governance.mediaTrust=clamp(state.governance.mediaTrust-5,0,100);executiveRelation('EU',-2);crisisApproval(-2);e.exposed=true;}
   else if(r.kind==='SUBSIDY_FRAUD'&&r.roll<.7){e.exposed=true;state.governance.credibility=clamp(state.governance.credibility-5,0,100);crisisApproval(-3);}
   else if(r.kind==='WASTE_IMPORT'&&r.roll<.8){e.exposed=true;crisisApproval(-3);worldLiability(r,e.resolvedWaste?.002:.004,'Hetimi i marrëveshjes së mbeturinave');if(!e.resolvedWaste){r.qualified=false;r.status='REVIEW';r.completedTurn=null;r.outcome='Dokumentet zbuluan fshehjen; ngarkesa kërkon trajtim real.';}}
  }
 }
 return result;
};
resourceEnergy=function(st){
 const base=economyEnergyBase(st),reserved=economyRows(st,'DATACENTER').filter(r=>economyDataLicensed(st,r)).reduce((n,r)=>n+r.economy.loadMW,0);if(!reserved)return base;
 let used=Math.min(base.capacity,reserved);const supplied=new Set(),consumers=st.productionResources.assets.filter(a=>a.sector!=='energy'&&a.level>0).sort((a,b)=>(a.sector==='agriculture'?0:1)-(b.sector==='agriculture'?0:1)||Number(a.id.split(':')[1])-Number(b.id.split(':')[1]));
 for(const a of consumers){const mw=assetMW(a);if(used+mw<=base.capacity){used+=mw;supplied.add(a.id);}}
 return {...base,used,supplied,demand:base.demand+reserved,dataCenterMW:reserved};
};
sectorManagementAverage=function(st,id){const value=economyQualityBase(st,id);return economyWasteBlocked(st)&&['sec_env','sec_health'].includes(id)?value*(id==='sec_env'?.8:.95):value;};
socioAnchorClosed=function(st,id){return economyClosedBase(st,id)||economyRows(st,'SUCCESSION').some(r=>r.source===id&&r.closedTurn);};
socioEligibility=function(kind,source,st=state){const base=economyEligibilityBase(kind,source,st);if(base)return base;return kind==='ANCHOR'&&economyRows(st,'SUCCESSION').some(r=>r.source===source&&worldLive(r))?'Biznesi ka dosje ekzistuese të vazhdimësisë.':'';};
worldProductionFactor=function(st,id){
 let factor=economyFactorBase(st,id);
 for(const r of worldDB(st)?.cases||[]){if(!ECONOMY_CASE_DEFS[r.kind])continue;const e=r.economy;
  if(id==='tourism'&&r.kind==='SEASONAL'&&economyProgramActive(st,r)&&![5,6,7].includes(st.monthIndex)&&socialFunded(st)&&(r.choice!=='OFFSEASON'||e.operatingPayments.some(p=>p.turn===st.turnCount))&&(r.choice!=='COMMUTE'||worldPaidBuses(st)>=5))factor*=r.choice==='OFFSEASON'?1.06:1.02;
  if(id==='light'&&r.kind==='SEASONAL'&&r.choice==='DIVERSIFY'&&economyProgramActive(st,r)&&socialFunded(st))factor*=1.02;
  if(id==='agriculture'&&r.kind==='RETAIL_PAY'&&(worldLive(r)||r.untilTurn>=st.turnCount&&e.privateSettledB<e.privateInvoiceB))factor*=1-.03*(1-e.privateSettledB/e.privateInvoiceB);
  if(id==='agriculture'&&r.kind==='RETAIL_PAY'&&e.importsUntil>st.turnCount)factor*=.97;
 }
 return clamp(factor,0,1.15);
};
lifeHouseholds=function(st){const rows=economyHouseholdsBase(st);for(const row of rows){if(row.id==='farm'){const risk=Math.max(0,...economyRows(st,'RETAIL_PAY').filter(r=>worldLive(r)||r.untilTurn>=st.turnCount).map(r=>1-r.economy.privateSettledB/r.economy.privateInvoiceB));row.income=+(row.income*(1-risk*.1)).toFixed(2);row.balance=+(row.income-row.spending).toFixed(2);}if(row.id==='young'&&economyRows(st,'UNIVERSITY').some(r=>r.economy.remaining>0&&r.status==='REVIEW'))row.satisfaction=Math.max(0,row.satisfaction-2);}return rows;};
forecastSupplementary=function(st){const r=economyForecastBase(st);for(const c of worldDB(st)?.cases||[]){if(!ECONOMY_CASE_DEFS[c.kind])continue;if(['LANDFILL','SEASONAL'].includes(c.kind)&&economyProgramActive(st,c)&&c.economy.weeklyB){r.costsB+=c.economy.weeklyB;r.expiring.push({turn:c.untilTurn+1,weeklyB:c.economy.weeklyB,title:'Skadon programi: '+WORLD_CASE_DEFS[c.kind].name});}if(c.kind==='WASTE_IMPORT'&&worldLive(c))r.costsB+=.0002;}return r;};
validateLoadedState=function(st){economyValidateBase(st);validateEconomyCases(st);return st;};
function validateEconomyCases(st){
 const d=economyMeta(st);if(!d)return;const bad=()=>{throw Error('Dosjet e reja ekonomike janë të pavlefshme.');},turn=t=>Number.isInteger(t)&&t>=d.startTurn&&t<=st.turnCount;
 if(d.version!==1||!turn(d.startTurn)||!turn(d.lastTurn)||!turn(d.lastFiscalTurn))bad();
 const subjects=new Set(),grants=new Set(),activeGrantPrograms=new Set();for(const r of worldDB(st).cases.filter(r=>ECONOMY_CASE_DEFS[r.kind])){
  const e=r.economy;if(!e||e.version!==1||!Number.isInteger(e.fundedWeeks)||e.fundedWeeks<0||!Array.isArray(e.followups)||!Array.isArray(e.operatingPayments)||!Number.isFinite(e.recoveredB)||e.recoveredB<0)bad();
  const subject=r.kind+':'+(r.kind==='LANDFILL'?r.source.split('|HOST|')[0]:r.source);if(['DATACENTER','UNIVERSITY','SUCCESSION','SUBSIDY_FRAUD','LANDFILL'].includes(r.kind)){if(subjects.has(subject))bad();subjects.add(subject);}
  if(['DATACENTER','SUCCESSION','RETAIL_PAY'].includes(r.kind)){const b=economyBidder(st,r.source),i=b&&fdiInvestor(b.investorId);if(!b||!i||b.status!=='COMPLETED'||e.investorId!==i.id||e.companyJobs!==i.jobs||e.companyCapitalB!==i.capitalB)bad();}
  if(r.kind==='DATACENTER'&&(!['TECH'].includes(fdiInvestor(e.investorId).family)||![0,25,60].includes(e.loadMW)||r.qualified&&e.loadMW!==(r.choice==='LIMIT'?25:60)))bad();
  if(['WASTE_IMPORT','LANDFILL'].includes(r.kind)){const site=economyFacility(st,r.source);if(!site||site.sector!=='sec_env'||r.kind==='WASTE_IMPORT'&&r.source!==site.key||r.kind==='LANDFILL'&&(site.p.categoryId!=='hydro_permits'||r.source!==site.key+'|HOST|'+r.city))bad();}
  if(r.kind==='LANDFILL'&&(!worldCity(st,r.city)||!Array.isArray(e.partnerCities)||e.partnerCities.length!==2||new Set(e.partnerCities).size!==2||e.partnerCities.some(id=>id===r.city||!worldCity(st,id))||typeof e.blocked!=='boolean'))bad();
  if(r.kind==='UNIVERSITY'&&(r.source!=='sec_edu'||e.students!==600||!Number.isInteger(e.transferred)||e.transferred<0||e.transferred>600||!Number.isInteger(e.remaining)||e.remaining<0||e.remaining>600||r.choice==='TRANSFER'&&e.transferred+e.remaining!==600||r.choice==='TRANSFER'&&r.qualified&&e.remaining!==0))bad();
  if(r.kind==='DEEPFAKE'&&(!st.laws.some(l=>l.id===r.source)||e.evidence?.id!==r.source||!turn(e.evidence.turn)||typeof e.evidence.title!=='string'||e.initialBelief!==60||!Number.isFinite(e.residualBelief)||e.residualBelief<0||e.residualBelief>100))bad();
  if(r.kind==='SUBSIDY_FRAUD'){
   const f=st.publicFinance.ledger.find(f=>f.id===r.source);if(grants.has(r.source)||!f||f.source!=='Subvencioni i prodhimit: '+e.grantSector||f.type!=='EXPENSE'||f.turn!==e.grantTurn||Math.abs(f.amountB+e.grantB)>1e-9||e.suspectedB!==fiscalRound(e.grantB*.25)||e.recoveredB>e.suspectedB||!Number.isInteger(e.actualJobs)||e.actualJobs<0||e.declaredJobs!==e.actualJobs+Math.ceil(e.actualJobs*.2)||e.verifiedJobs!==null&&e.verifiedJobs!==e.actualJobs)bad();grants.add(r.source);
   const recovered=r.revenues.filter(p=>p.title==='Kthimi i subvencionit burimor').reduce((n,p)=>n+p.amountB,0);if(Math.abs(recovered-e.recoveredB)>1e-9)bad();
   if(e.auditFees&&(e.auditFees.FREEZE!==Math.max(.000001,fiscalRound(Math.min(.001,e.grantB*.1)))||e.auditFees.TARGET!==Math.max(.000001,fiscalRound(Math.min(.002,e.grantB*.15)))||e.auditFees.CORRECT!==Math.max(.000001,fiscalRound(Math.min(.002,e.grantB*.1)))))bad();
   if(worldLive(r)){if(activeGrantPrograms.has(e.grantSector))bad();activeGrantPrograms.add(e.grantSector);}
  }
  if(r.kind==='SUCCESSION'&&r.closedTurn&&(!turn(r.closedTurn)||e.closedJobsApplied!==e.companyJobs))bad();
  if(r.kind==='SUCCESSION'&&r.choice==='MERGE'){const partner=economyBidder(st,e.partnerId);if(!partner||partner.id===r.source||partner.status!=='COMPLETED'||fdiInvestor(partner.investorId).family!==fdiInvestor(e.investorId).family)bad();}
  if(r.kind==='RETAIL_PAY'&&(!Number.isFinite(e.privateInvoiceB)||e.privateInvoiceB!==fiscalRound(Math.min(.005,e.companyCapitalB*.02))||!Number.isFinite(e.privateSettledB)||e.privateSettledB<0||e.privateSettledB>e.privateInvoiceB||r.revenues.length))bad();
  if(r.kind==='SEASONAL'&&!worldCity(st,r.source))bad();
  if(r.kind!=='SUBSIDY_FRAUD'&&e.recoveredB!==0)bad();
  if(r.kind==='DATACENTER'){
   const turns=new Set();for(const p of r.revenues){const key=p.title+':'+p.turn;if(!['Tarifa e licencës digjitale','Rimbursimi i kapacitetit energjetik'].includes(p.title)||p.title==='Tarifa e licencës digjitale'&&p.amountB!==(r.choice==='LIMIT'?.00002:.00005)||turns.has(key)||p.turn<=r.completedTurn)bad();turns.add(key);}
   const reimbursements=new Set();for(const p of e.powerReimbursements||[]){const receipts=(p.contractReceipts||[]).map(id=>st.publicFinance.ledger.find(f=>f.id===id)),paid=lifeDB(st).contracts.filter(c=>c.kind==='ENERGY').flatMap(c=>c.payments.filter(q=>p.contractReceipts.includes(q.receiptId)));const mw=paid.length*LIFE_CONTRACTS.ENERGY.mw,amount=fiscalRound(paid.reduce((n,q)=>n+q.costB,0)*60/Math.max(1,mw));if(r.choice!=='POWER'||!turn(p.turn)||reimbursements.has(p.turn)||!receipts.length||receipts.some(f=>!f||f.turn!==p.turn)||paid.length!==receipts.length||mw<60||p.amountB!==amount||!r.revenues.some(q=>q.id===p.receiptId&&q.turn===p.turn&&q.title==='Rimbursimi i kapacitetit energjetik'&&q.amountB===p.amountB))bad();reimbursements.add(p.turn);}
   if(r.revenues.filter(p=>p.title==='Rimbursimi i kapacitetit energjetik').length!==(e.powerReimbursements||[]).length)bad();
  }else if(r.kind!=='SUBSIDY_FRAUD'&&r.revenues.length)bad();
  const actions=new Set();for(const a of e.followups){const key=a.action+':'+a.turn;if(!turn(a.turn)||actions.has(key)||!['SUSPEND','RENEW','RECHECK','TREAT_WASTE','TRANSFER_STUDENTS','RENEGOTIATE','AUDIT_GRANT'].includes(a.action))bad();actions.add(key);if(a.action!=='SUSPEND'&&!r.receipts.some(p=>p.id===a.receiptId&&p.turn===a.turn))bad();if(a.action==='RENEW'&&(!Number.isInteger(a.previousUntil)||a.turn<a.previousUntil-4))bad();}
  const paid=new Set();for(const p of e.operatingPayments){if(!turn(p.turn)||paid.has(p.turn)||!r.receipts.some(q=>q.id===p.receiptId&&q.turn===p.turn&&q.costB===e.weeklyB&&q.title==='Operimi i programit'))bad();paid.add(p.turn);}
 }
}
