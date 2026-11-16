/* A single entrance to the existing electoral engines; ballots and clocks stay native. */
function openElectionsHub(button){switchMainTab('tab-elections',button);const pill=Array.from(document.querySelectorAll('#tab-elections .sub-pill')).find(b=>(b.getAttribute('onclick')||'').includes("'overview'"));if(pill)switchSubTab('elec','overview',pill);renderElectionsHub();}
function openElectionWorkspace(key){
    switchMainTab('tab-elections');
    const button=Array.from(document.querySelectorAll('#tab-elections .sub-pill')).find(b=>(b.getAttribute('onclick')||'').includes("'"+key+"'"));
    if(button&&!button.disabled)switchSubTab('elec',key,button);
}
function electionHubStatus(st=state){
    const c=getElectionDayCycle(st),campaign=st.electionCampaign,session=currentConstituentSession(st);
    if(c?.status==='RESULTS')return {label:'Rezultatet parlamentare janë publikuar',key:'voting',detail:session?.status==='COMPLETED'?'Institucionet janë konstituuar.':'Vazhdo me raportin zgjedhor dhe konstituimin e institucioneve.'};
    if(c)return {label:c.status==='COUNTING'?'Numërimi i votave':'Dita e zgjedhjeve',key:'voting',detail:'Hap votimin, numërimin dhe vendimet e natës zgjedhore.'};
    if(electionDayEligible(st))return {label:'Sot është dita e zgjedhjeve',key:'voting',detail:'Fushata është mbyllur. Fillo procesin e votimit.'};
    if(['CAMPAIGN','CAMPAIGN_CLOSED'].includes(st.electionPhase))return {label:st.electionPhase==='CAMPAIGN'?'Fushata parlamentare është aktive':'Fushata është mbyllur',key:'campaignplay',detail:'Dita e votimit: java '+(campaign?.electionTurn??'—')+' e lojës. Mbeten '+Math.max(0,(campaign?.electionTurn||st.turnCount)-st.turnCount)+' javë.'};
    return {label:'Kalendari parlamentar',key:'campaign',detail:parliamentaryElectionBasis(st)||'Zgjedhjet e rregullta pas '+Math.max(0,st.weeksToNextRegularElection)+' javësh. Zgjedhjet e parakohshme kërkojnë bazën institucionale.'};
}
function renderElectionsHub(){
    const host=document.getElementById('electionsHubPanel');if(!host||!state)return;
    const e=catalogEscape,s=electionHubStatus(),local=activeLocalElection(state),schedule=local?.schedule||localElectionSchedule(state.localElections?.nextYear||2029);
    host.innerHTML='<article class="card"><h2>🗳️ Zgjedhjet</h2><h3>'+e(s.label)+'</h3><p>'+e(s.detail)+'</p><button class="action-btn btn-gold" onclick="openElectionWorkspace(\''+s.key+'\')">'+(s.key==='voting'?'Hap ditën e zgjedhjeve / rezultatet':s.key==='campaignplay'?'Hap fushatën parlamentare':'Procedura e shpalljes')+'</button>'+(getElectionDayCycle(state)?'<button class="action-btn" onclick="openElectionNight()">Nata zgjedhore dhe raporti</button>':'')+'<button class="action-btn" onclick="openElectionPreparation()">Lista e kandidatëve</button><button class="action-btn" onclick="openElectionAssemblyResults()">Mandatet dhe Kuvendi</button></article><article class="card"><h3>Zgjedhjet komunale</h3><p>Raundi i parë: '+e(schedule.date)+' · Balotazhi: '+e(schedule.runoffDate)+'. '+(local?'Statusi: '+e(({ANNOUNCED:'Të shpallura',CAMPAIGN:'Fushata',RUNOFF:'Balotazhi',COMPLETED:'Të përfunduara'})[local.status]):'Cikli i radhës sipas kalendarit të lojës.')+'</p><button class="action-btn" onclick="openLocalElections()">Kandidatët, fushata dhe rezultatet komunale</button></article><article class="card"><h3>Presidenti dhe institucionet</h3><p>Zgjedhja e Presidentit bëhet në Kuvend, sipas procedurës ekzistuese.</p><button class="action-btn" onclick="openElectionPresidency()">Procedura presidenciale</button><button class="btn-top" onclick="switchMainTab(\'tab-municipalities\')">Menaxhimi i komunave</button></article>';
    const nav=document.getElementById('electionsNav');if(nav){nav.title=s.label;nav.setAttribute('aria-label','Zgjedhjet · '+s.label);}
}
function openElectionPresidency(){switchMainTab('tab-assembly');const b=document.querySelector('[data-assembly-tab="president"]');if(b)switchSubTab('ass','president',b);}
const electionsHubRefreshBase=refreshAllUI,electionsHubVisibleBase=renderVisibleWorkspace;
refreshAllUI=function(...args){const r=electionsHubRefreshBase(...args);renderElectionsHub();return r;};
renderVisibleWorkspace=function(...args){const r=electionsHubVisibleBase(...args);if(document.querySelector('#tab-elections.active'))renderElectionsHub();return r;};
