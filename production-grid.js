/* Resource dependencies extend the existing physical assets; money remains EUR billions. */
const RESOURCE_TYPES={
 iron:{name:'Minierë hekuri',icon:'⛏️',capacity:80,workers:1200,costB:.04,weeks:8,mw:35},
 gold:{name:'Minierë ari',icon:'🟡',capacity:8,workers:1200,costB:.15,weeks:18,mw:25},
 oil:{name:'Pus nafte',icon:'🛢️',capacity:60,workers:800,costB:.1,weeks:14,mw:20}
};
const gridInit=initialiseProduction,gridPrepare=prepareLoadedState,gridValidate=validateLoadedState;
const gridRaw=productionRawReport,gridQuote=productionQuote,gridFiscal=processProductionFiscal,gridRender=renderProductionResources;
const gridSectorReport=productionSectorReport;
const gridBuild=buildProductionAsset,gridCommit=productionCommit;
const gridReviewBuild=reviewProductionBuild;
let resourceBuildIron=null;
let productionResourceFilter='ALL';
function initialiseResourceGrid(st){
 if(!st.productionResources)return;
 if(!st.productionResources.resourceGrid)st.productionResources.resourceGrid={version:1,lastDay:st.turnCount*7,stock:{food:1000,iron:1000,oil:1000},days:[]};
}
initialiseProduction=function(st){gridInit(st);initialiseResourceGrid(st);};
prepareLoadedState=function(raw){const st=gridPrepare(raw);initialiseResourceGrid(st);return st;};
function assetResource(a){return a.sector==='energy'?'energy':a.sector==='agriculture'?'food':a.sector==='mines'?(a.spec?.resourceType||'iron'):null;}
function assetMW(a){return a.level*(a.sector==='energy'?0:a.sector==='agriculture'?4:a.sector==='mines'?(RESOURCE_TYPES[assetResource(a)]?.mw||35):a.sector==='heavy'?30:10);}
function productionActiveMaintenance(st,id){if(!productionSectorPublic(st,id))return 0;const grid=resourceEnergy(st);return st.productionResources.assets.filter(a=>a.sector===id&&(id==='energy'||grid.supplied.has(a.id))).reduce((n,a)=>n+a.level*PRODUCTION_SECTORS[id].maintenanceB,0)*enterprisePhysicalMaintenanceFactor(st,id,st.turnCount);}
productionCommit=function(change){return gridCommit(p=>{if(resourceBuildIron!==null){initialiseResourceGrid(state);if(p.resourceGrid.stock.iron<resourceBuildIron)throw Error('Hekur i pamjaftueshëm në depo.');p.resourceGrid.stock.iron-=resourceBuildIron;}change(p);});};
buildProductionAsset=function(sector,id=null,source='FOSSIL'){resourceBuildIron=sector==='agriculture'?10:sector==='defense'?100:50;try{return gridBuild(sector,id,source);}finally{resourceBuildIron=null;}};
reviewProductionBuild=function(sector,id){gridReviewBuild(sector,id);const content=document.getElementById('interactiveActionModalContent'),iron=sector==='agriculture'?10:sector==='defense'?100:50;if(content?.insertAdjacentHTML)content.insertAdjacentHTML('afterbegin','<p class="resource-consumption">Hekur i kërkuar: '+iron+' · Në depo: '+Math.floor(state.productionResources.resourceGrid.stock.iron)+'</p>');};
function productionBuildingModel(st,a){const kind=assetResource(a),production=productionAssetCapacity(a)/7;return {id:a.id,name:a.spec?.name||PRODUCTION_SECTORS[a.sector].asset,type:kind||a.sector,level:a.level,status:resourceAssetState(st,a),stats:{productionPerDay:resourceAssetState(st,a)==='no_energy'?0:production,energyConsumption:assetMW(a),maintenanceCost:(productionSectorPublic(st,a.sector)?1:0)*a.level*PRODUCTION_SECTORS[a.sector].maintenanceB*enterprisePhysicalMaintenanceFactor(st,a.sector,st.turnCount)*1e9/7},upgrade:{timeInDays:Math.max(0,a.weeks-a.elapsed)*7,nextLevelProduction:(a.level+1)*(a.spec?.capacity||PRODUCTION_SECTORS[a.sector].capacity)/7}};}
function resourceEnergy(st){
 const assets=st.productionResources.assets,capacity=assets.filter(a=>a.sector==='energy').reduce((n,a)=>n+productionAssetCapacity(a),0);
 // Food has first priority. Stable ID order sheds the most recently built consumers first.
 const consumers=assets.filter(a=>a.sector!=='energy'&&a.level>0).sort((a,b)=>(a.sector==='agriculture'?0:1)-(b.sector==='agriculture'?0:1)||Number(a.id.split(':')[1])-Number(b.id.split(':')[1]));
 let used=0;const supplied=new Set();for(const a of consumers){const mw=assetMW(a);if(used+mw<=capacity){used+=mw;supplied.add(a.id);}}
 const demand=consumers.reduce((n,a)=>n+assetMW(a),0);return {capacity,used,demand,supplied};
}
function resourceAssetState(st,a){return a.status==='BUILDING'?'upgrading':a.sector!=='energy'&&!resourceEnergy(st).supplied.has(a.id)?'no_energy':'active';}
productionRawReport=function(st,id,allocation,paid=true){
 const r=gridRaw(st,id,allocation,paid);if(id==='energy')return r;
 const grid=resourceEnergy(st),assets=st.productionResources.assets.filter(a=>a.sector===id),total=assets.reduce((n,a)=>n+productionAssetCapacity(a),0),active=assets.filter(a=>grid.supplied.has(a.id)).reduce((n,a)=>n+productionAssetCapacity(a),0);
 r.output=+(r.output*(total?active/total:0)).toFixed(3);r.energyFactor=total?active/total:0;
 if(id==='defense'&&st.productionResources.resourceGrid){const fuel=st.productionResources.resourceGrid.stock.oil;r.output=+(r.output*Math.min(1,fuel/Math.max(1,r.output*.1))).toFixed(3);}
 return r;
};
productionSectorReport=function(st,id,allocation,paid=true,miningOutput){
 const r=gridSectorReport(st,id,allocation,paid,miningOutput);if(id!=='mines')return r;
 const energy=resourceEnergy(st),assets=st.productionResources.assets.filter(a=>a.sector==='mines'&&energy.supplied.has(a.id)),total=assets.reduce((n,a)=>n+productionAssetCapacity(a),0),share=kind=>total?assets.filter(a=>assetResource(a)===kind).reduce((n,a)=>n+productionAssetCapacity(a),0)/total:0;
 // Freeze the paid weekly output by resource; gold and oil cannot feed steel mills.
 r.resourceOutputs=Object.fromEntries(['iron','gold','oil'].map(kind=>[kind,+(r.output*share(kind)).toFixed(6)]));
 const goldB=fiscalRound(r.resourceOutputs.gold*.00006);r.output=+r.resourceOutputs.iron.toFixed(3);productionFinishReport(id,r);r.exportB=fiscalRound(r.exportB+goldB);r.goldB=goldB;return r;
};
productionQuote=function(st,sector,id,source){
 const a=id?st.productionResources.assets.find(a=>a.id===id):null;
 if(a&&resourceAssetState(st,a)==='no_energy')throw Error('Siguro energji para përmirësimit.');
 const q=gridQuote(st,sector,id,source);
 if(sector==='mines'){
  const kind=a?assetResource(a):(document.getElementById('productionMineType')?.value||'iron'),spec=RESOURCE_TYPES[kind];
  if(!spec)throw Error('Resurs i panjohur.');
  Object.assign(q,{spec:{...spec,resourceType:kind},capacity:spec.capacity,workers:Math.round(spec.workers*(st.productionResources.sectors.mines.automation?.7:1)),grossB:fiscalRound(spec.costB*q.targetLevel),grantRate:0,grantB:0,costB:fiscalRound(spec.costB*q.targetLevel),weeks:spec.weeks+q.targetLevel*2});
 }
 return q;
};
// No second maintenance or tax stream: existing fiscal settlement owns all cash receipts.
// Seven chronological resource steps are executed only after that week's settlement.
function calculateDailyTick(day,weeklyReport){
 const g=state.productionResources.resourceGrid;
 if(!Number.isInteger(day)||day!==g.lastDay+1||day>state.turnCount*7||!weeklyReport||weeklyReport!==state.productionResources.history.at(-1)||weeklyReport.turn!==state.turnCount||Math.floor((day-1)/7)!==state.turnCount-1)return false;
 const energy=resourceEnergy(state),p=state.productionResources,produced={food:0,iron:0,oil:0};let goldB=0;
 for(const a of p.assets){const kind=assetResource(a);if(!kind||kind==='energy'||a.sector==='mines'||!energy.supplied.has(a.id))continue;
  const s=weeklyReport.sectors[a.sector],sectorCapacity=p.assets.filter(b=>b.sector===a.sector&&energy.supplied.has(b.id)).reduce((n,b)=>n+productionAssetCapacity(b),0),amount=sectorCapacity?s.output*productionAssetCapacity(a)/sectorCapacity/7:0;
  if(kind==='gold')goldB+=amount*.00006;else produced[kind]+=amount;
 }
 const mining=weeklyReport.sectors.mines.privateOperation?null:weeklyReport.sectors.mines.resourceOutputs;
 if(mining){produced.iron+=mining.iron/7;produced.oil+=mining.oil/7;goldB=mining.gold*.00006/7;}
 const consumed={food:Math.min(g.stock.food+produced.food,PRODUCTION_SECTORS.agriculture.demand*populationFactor(state)/7),iron:Math.min(g.stock.iron+produced.iron,weeklyReport.sectors.heavy.output*.6/7),oil:Math.min(g.stock.oil+produced.oil,weeklyReport.sectors.defense.output*.1/7)};
 for(const key of Object.keys(produced))g.stock[key]=Math.max(0,+(g.stock[key]+produced[key]-consumed[key]).toFixed(6));
 g.lastDay=day;g.days.push({day,produced,consumed,goldB,energy:{capacity:energy.capacity,used:energy.used,demand:energy.demand}});g.days=g.days.slice(-7);return true;
}
processProductionFiscal=function(turn){
 if(!productionEngineActive(state))return gridFiscal(turn);
 initialiseResourceGrid(state);if(!Number.isInteger(turn)||turn!==state.turnCount||turn<=state.productionResources.lastFiscalTurn)return {paidB:0,unpaidB:0,revenueB:0};
 const row=gridFiscal(turn),g=state.productionResources.resourceGrid;
 // Calendar migrations never replay old fiscal weeks.
 if(g.lastDay<(turn-1)*7)g.lastDay=(turn-1)*7;
 for(let day=(turn-1)*7+1;day<=turn*7;day++)calculateDailyTick(day,row);
 return row;
};
function resourceDashboard(){const g=state.productionResources.resourceGrid,e=resourceEnergy(state);return '<div class="resource-dashboard" aria-live="polite"><div>Buxheti<strong>'+enterpriseMoney(state.budgetTotalB)+'</strong></div><div class="'+(e.demand>e.capacity?'resource-overload':'')+'">⚡ Energji<strong>'+e.used+' / '+e.capacity+' MW</strong><small>Kërkesa: '+e.demand+' MW</small></div><div>Popullsia<strong>'+Math.round(state.population?.citizens||1700000).toLocaleString('sq-AL')+'</strong></div><div>Data<strong>'+state.year+' · Java '+(state.week||1)+'</strong></div><div>Depoja<strong>🌾 '+Math.round(g.stock.food)+' · ⛏️ '+Math.round(g.stock.iron)+' · 🛢️ '+Math.round(g.stock.oil)+'</strong></div></div>';}
function filterResourceCards(value){if(!['ALL','ENERGY','MINES','FOOD'].includes(value))return;productionResourceFilter=value;renderProductionResources();}
function focusProductionResource(kind){
 productionResourceFilter=kind==='food'?'FOOD':kind==='energy'?'ENERGY':'MINES';renderProductionResources();
 const select=document.getElementById('productionMineType');if(select&&RESOURCE_TYPES[kind]){select.value=kind;updateResourceBuildLabel();}
 document.getElementById(kind==='food'?'production-sector-agriculture':kind==='energy'?'production-sector-energy':'production-sector-mines')?.scrollIntoView({block:'start',behavior:'instant'});
}
function updateResourceBuildLabel(){const section=document.getElementById('production-sector-mines'),select=document.getElementById('productionMineType');if(!section||!select)return;const button=section.querySelector('.action-btn');if(button)button.textContent='Ndërto '+RESOURCE_TYPES[select.value].name;}
function resourceOverview(){
 const p=state.productionResources,g=p.resourceGrid,energy=resourceEnergy(state),last=p.history.at(-1),gold=last?.sectors.mines.goldB||0;
 return '<section class="resource-overview" aria-label="Depot dhe furnizimi"><h2>Depoja Qendrore e Shtetit</h2><div class="resource-stock-grid">'+[['food','🌾','Ushqimi',Math.round(g.stock.food)+' njësi','Ndërto fermë'],['iron','⛏️','Hekuri',Math.round(g.stock.iron)+' njësi','Ndërto minierë hekuri'],['oil','🛢️','Nafta',Math.round(g.stock.oil)+' njësi','Ndërto pus nafte'],['gold','🟡','Ari',enterpriseMoney(gold)+'/javë','Ndërto minierë ari']].map(([key,icon,title,value,action])=>'<article class="resource-stock-card"><h3>'+icon+' '+title+'</h3><strong>'+value+'</strong><p>'+(key==='gold'?'Shitet automatikisht dhe shtohet në buxhet.':key==='food'?'Rezervë për konsumin e qytetarëve.':key==='iron'?'Përdoret nga industria dhe ndërtimet.':'Karburant për industrinë e mbrojtjes.')+'</p><button class="btn-top" onclick="focusProductionResource(\''+key+'\')">'+action+'</button></article>').join('')+'</div><div class="resource-power-summary"><h3>⚡ Furnizimi i ndërtesave me energji</h3><p><strong>'+energy.used+' / '+energy.capacity+' MW në përdorim</strong> · Kërkesa totale '+energy.demand+' MW</p><button class="btn-top" onclick="focusProductionResource(\'energy\')">Ndërto central / park energjetik</button><ul>'+p.assets.map(a=>{const status=resourceAssetState(state,a);return '<li><span>'+catalogEscape(a.spec?.name||PRODUCTION_SECTORS[a.sector].asset)+' · Niveli '+a.level+'</span><strong class="'+(status==='no_energy'?'resource-warning':'resource-output')+'">'+(a.sector==='energy'?'⚡ Prodhon '+productionAssetCapacity(a)+' MW':status==='no_energy'?'🔴 Pa energji · prodhimi 0':'🟢 Me energji · '+assetMW(a)+' MW')+(status==='upgrading'?' · Në ndërtim':'')+'</strong></li>';}).join('')+'</ul></div></section>';
}
renderProductionResources=function(){
 gridRender();const host=document.getElementById('productionResourcesPanel');if(!host?.querySelectorAll||!document.createElement)return;
 initialiseResourceGrid(state);const top=document.createElement('div');top.innerHTML=resourceDashboard()+'<nav class="resource-filters" aria-label="Filtrat e prodhimit">'+[['ALL','Të gjitha'],['ENERGY','Energjia'],['MINES','Minierat'],['FOOD','Ushqimi']].map(([v,label])=>'<button class="btn-top" aria-pressed="'+(productionResourceFilter===v)+'" onclick="filterResourceCards(\''+v+'\')">'+label+'</button>').join('')+'</nav>';host.prepend(top);
 const overview=document.createElement('div');overview.innerHTML=resourceOverview();top.after(overview);
 const energy=resourceEnergy(state);
 for(const [id] of Object.entries(PRODUCTION_SECTORS)){
  const section=document.getElementById('production-sector-'+id);if(!section)continue;
  section.hidden=productionResourceFilter!=='ALL'&&id!==({ENERGY:'energy',MINES:'mines',FOOD:'agriculture'})[productionResourceFilter];
  const assets=state.productionResources.assets.filter(a=>a.sector===id);
  section.querySelectorAll('.production-asset').forEach((el,i)=>{const a=assets[i];if(!a)return;const status=resourceAssetState(state,a),kind=assetResource(a),icon=RESOURCE_TYPES[kind]?.icon||(kind==='food'?'🌾':kind==='energy'?'⚡':'🏭');el.classList.add('resource-glass');el.classList.toggle('resource-no-energy',status==='no_energy');
   const info=document.createElement('div');info.innerHTML='<span class="resource-level">'+icon+'</span><p class="resource-output">'+(kind==='energy'?'Kapacitet: '+productionAssetCapacity(a)+' MW':'Kapacitet: '+(productionAssetCapacity(a)/7).toFixed(1)+' njësi/ditë')+'</p><p class="resource-maintenance">Mirëmbajtja: '+new Intl.NumberFormat('sq-AL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(a.level*PRODUCTION_SECTORS[id].maintenanceB*enterprisePhysicalMaintenanceFactor(state,id,state.turnCount)*1e9/7)+'/ditë</p><p class="resource-consumption">Konsum: '+assetMW(a)+' MW</p>'+(status==='upgrading'?'<p>'+((a.weeks-a.elapsed)*7)+' ditë të mbetura</p>':'')+(status==='no_energy'?'<div class="resource-warning">⚠️ Pa Energji · Prodhimi 0</div>':'');el.prepend(info);if(status==='no_energy')el.querySelectorAll('button').forEach(b=>b.disabled=true);
   else if(status==='active'&&a.level<5&&productionSectorPublic(state,id)){const q=productionQuote(state,id,a.id),button=el.querySelector('button');if(button)button.textContent='Përmirëso · '+enterpriseMoney(q.costB);}
  });
  if(id==='mines'){const label=document.createElement('label');label.innerHTML='Çfarë dëshiron të ndërtosh?<select id="productionMineType" onchange="updateResourceBuildLabel()">'+Object.entries(RESOURCE_TYPES).map(([key,s])=>'<option value="'+key+'">'+s.icon+' '+s.name+'</option>').join('')+'</select>';const button=section.querySelector('.action-btn');if(button)section.insertBefore(label,button);else section.append(label);updateResourceBuildLabel();}
  if(!productionSectorPublic(state,id)){section.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);const notice=document.createElement('p');notice.className='crisis-warning';notice.textContent='Privatizuar · kapacitet privat në ekonomi. Pagat, mirëmbajtja, importet dhe shitjet e sektorit nuk kalojnë në arkën publike. Nuk shtohet mall privat në depon e shtetit.';section.prepend(notice);section.querySelectorAll('.resource-maintenance').forEach(el=>el.textContent='Mirëmbajtja: mbulohet nga pronari privat');}
 }
};
validateLoadedState=function(st){gridValidate(st);const p=st.productionResources,g=p?.resourceGrid;if(g===undefined)return;const bad=()=>{throw Error('Depoja e resurseve është e pavlefshme.');};if(g.version!==1||!Number.isInteger(g.lastDay)||g.lastDay<0||g.lastDay>st.turnCount*7||!g.stock||Object.keys(g.stock).length!==3||!['food','iron','oil'].every(k=>Number.isFinite(g.stock[k])&&g.stock[k]>=0)||!Array.isArray(g.days)||g.days.length>7)bad();
 for(const a of p.assets)if(a.spec?.resourceType){const def=RESOURCE_TYPES[a.spec.resourceType];if(a.sector!=='mines'||!def||!['capacity','workers','costB','weeks'].every(k=>a.spec[k]===def[k]))bad();}
 for(const row of p.history){const mine=row.sectors.mines,outputs=mine.resourceOutputs;if(outputs===undefined)continue;
  if(!outputs||Object.keys(outputs).length!==3||!['iron','gold','oil'].every(k=>Number.isFinite(outputs[k])&&outputs[k]>=0)||Math.abs(mine.output-+outputs.iron.toFixed(3))>1e-8||Math.abs(mine.goldB-(mine.privateOperation?0:fiscalRound(outputs.gold*.00006)))>1e-8)bad();
 }
 let previous=g.lastDay-g.days.length;for(const d of g.days){if(d.day!==++previous||!['capacity','used','demand'].every(k=>Number.isFinite(d.energy?.[k])&&d.energy[k]>=0)||d.energy.used>d.energy.capacity||!Number.isFinite(d.goldB)||d.goldB<0||!['food','iron','oil'].every(k=>Number.isFinite(d.produced?.[k])&&d.produced[k]>=0&&Number.isFinite(d.consumed?.[k])&&d.consumed[k]>=0))bad();}return st;};
