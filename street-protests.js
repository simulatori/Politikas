/* Direct civic reactions; existing calendar, fiscal transactions and project processors. */
const STREET_PROTEST_COSTS={POLICE:.002,NEGOTIATE:.005,IGNORE:0,COVERT:0,COURT:0};
function initializeStreetProtests(st){st.streetProtests={version:1,lastTurn:st.turnCount,counter:0,cooldownUntil:st.turnCount,seenLaws:st.laws.filter(function(l){return l.status==='PASSED';}).map(function(l){return l.id+':'+(l.version||1);}),events:[]};}
function enableStreetProtests(){if(state.streetProtests)return false;return fiscalCommit(function(){initializeStreetProtests(state);});}
function activeStreetProtest(st){return st.streetProtests?.events.find(function(p){return p.status==='ACTIVE';});}
function streetSectorBlocked(sector,turn,st){if(sectorExpansionOutage(st,sector,turn))return true;if(typeof veteransCrisisPending==='function'&&veteransCrisisPending(st))return true;if(typeof unionOnStrike==='function'&&unionOnStrike(st,sector))return true;return !!sector && !!st.streetProtests?.events.some(function(p){return p.status==='IGNORED' && p.sectorId===sector && p.blockUntil!==null && turn>=p.resolvedTurn && turn<=p.blockUntil;});}
function createStreetProtest(reason,sectorId,lawId){
    if(oppositionPressurePaused(state)&&/opozit|opposition/i.test(reason))return false;
    var db=state.streetProtests;if(!db || activeStreetProtest(state) || state.turnCount<db.cooldownUntil)return false;
    if(!state.stateSectors.some(function(s){return s.id===sectorId;}))sectorId='sec_econ';
    if(!state.stateSectors.some(function(s){return s.id===sectorId;}))return false;
    var p={id:'street:'+ (++db.counter),status:'ACTIVE',reason:reason,sectorId:sectorId,lawId:lawId||null,startTurn:state.turnCount,dueTurn:state.turnCount+2,revision:0,disruptionRoll:Math.random(),blockUntil:null,costB:0,ledgerId:null,resolvedTurn:null,action:null};
    db.events.push(p);db.cooldownUntil=state.turnCount+8;addMediaNews('Qyteti','Qytetarët dalin në protestë: '+state.stateSectors.find(function(s){return s.id===sectorId;}).name,'CRITICAL',reason+' Autoritetet kanë afat për të zgjedhur mes ndërhyrjes policore, negociatave dhe mosndërhyrjes.');return true;
}
function considerStreetLawProtest(law){
    var db=state.streetProtests;if(!db || law.status!=='PASSED')return false;var key=law.id+':'+(law.version||1);if(db.seenLaws.includes(key))return false;db.seenLaws.push(key);
    if(Number.isFinite(law.approvalEffect) && law.approvalEffect<=-2)return createStreetProtest('Miratimi i “'+law.title+'” ka nxitur kundërshtim ndaj pasojave të masës.',law.sector||'sec_econ',law.id);return false;
}
function applyStreetProtestResolution(p,action){
    p.action=action;p.status=action==='POLICE'?'DISPERSED':action==='NEGOTIATE'?'NEGOTIATED':action==='COVERT'?'COVERT':action==='COURT'?'COURT_RESOLVED':'IGNORED';p.resolvedTurn=state.turnCount;p.revision++;
    if(action==='POLICE'){recordLeakRisk('POLICE','street:'+p.id,'mpb');['EU','USA'].forEach(function(id){var partner=state.diplomacy[id];if(partner && Number.isFinite(partner.score))partner.score=Math.max(0,partner.score-(id==='EU'?3:2));});}
    if(action==='IGNORE' && p.disruptionRoll<.5)p.blockUntil=state.turnCount+3;
    addMediaNews('Qyteti',action==='POLICE'?'Policia shpërndan protestën':action==='NEGOTIATE'?'Marrëveshje për përfundimin e protestës':p.blockUntil?'Protesta bllokon punimet e sektorit':'Protesta përfundon pa bllokim të punimeve',action==='IGNORE'?'CRITICAL':'NEUTRAL',action==='POLICE'?'Ndërhyrja u financua nga arka publike. Marrëdhëniet me BE-në dhe SHBA-në u përkeqësuan.':action==='NEGOTIATE'?'U financua paketa e koncesioneve buxhetore. Pagesa nuk garanton punësim ose përmirësim automatik të sektorit.':p.blockUntil?'Punimet e projekteve dhe reformave në sektorin përkatës ndalen për tri javët pasuese. Pagat dhe detyrimet e tjera fiskale vazhdojnë.':'Mosndërhyrja nuk solli bllokim në këtë rast.');
}
function resolveStreetProtest(id,action,revision){
    var p=state.streetProtests?.events.find(function(p){return p.id===id;});if(!p || p.status!=='ACTIVE' || p.revision!==revision || !['POLICE','NEGOTIATE','IGNORE'].includes(action))return false;
    var cost=STREET_PROTEST_COSTS[action],authorization=fiscalSpendingCheck(cost,false);if(!authorization.allowed || state.budgetTotalB<cost){showToast(authorization.message||'Arka nuk e mbulon ndërhyrjen.');return false;}
    return fiscalCommit(function(){if(cost){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-cost),'Përgjigjja ndaj protestës: '+action,'EXPENSE');p.ledgerId=state.publicFinance.ledger.at(-1).id;p.costB=cost;}applyStreetProtestResolution(p,action);validateStreetProtests(state);});
}
function processStreetProtestsWeek(turn){
    var db=state.streetProtests;if(!db)return false;if(turn!==state.turnCount)throw Error('Ora e protestave nuk përputhet me kalendarin.');if(db.lastTurn>=turn)return false;if(db.lastTurn+1!==turn)throw Error('Protestat kërkojnë javë të njëpasnjëshme.');
    var p=activeStreetProtest(state);if(p && turn>p.dueTurn)applyStreetProtestResolution(p,'IGNORE');
    if(!activeStreetProtest(state) && turn>=db.cooldownUntil){var output=state.economicPilot?.output,basket=householdBasketMeasurement(state);if(Number.isFinite(output) && output<70 || state.gdpGrowth< -3 || basket.status==='ready' && basket.value>115)createStreetProtest('Presioni ekonomik është rritur: '+(Number.isFinite(output)?'indeksi i prodhimit '+output.toFixed(1)+'. ':'')+'Rritja ekonomike: '+state.gdpGrowth.toFixed(1)+'%.','sec_econ',null);}
    db.lastTurn=turn;validateStreetProtests(state);return true;
}
function validateStreetProtests(st){
    var db=st.streetProtests;if(db===undefined)return;
    if(!db || db.version!==1 || !Number.isInteger(db.lastTurn) || db.lastTurn<0 || db.lastTurn>st.turnCount || !Number.isInteger(db.counter) || !Number.isInteger(db.cooldownUntil) || !Array.isArray(db.seenLaws) || db.seenLaws.some(function(k){return typeof k!=='string';}) || new Set(db.seenLaws).size!==db.seenLaws.length || !Array.isArray(db.events) || db.counter!==db.events.length || db.events.filter(function(p){return p.status==='ACTIVE';}).length>1)throw Error('Gjendja e protestave është e pavlefshme.');
    var ids=new Set(),ledgerIds=new Set();db.events.forEach(function(p){
        if(!p || ids.has(p.id) || typeof p.id!=='string' || typeof p.reason!=='string' || !st.stateSectors.some(function(s){return s.id===p.sectorId;}) || !['ACTIVE','DISPERSED','NEGOTIATED','IGNORED','COVERT','COURT_RESOLVED'].includes(p.status) || !Number.isInteger(p.startTurn) || p.startTurn<0 || p.startTurn>st.turnCount || p.dueTurn!==p.startTurn+2 || !Number.isInteger(p.revision) || !Number.isFinite(p.disruptionRoll) || p.disruptionRoll<0 || p.disruptionRoll>=1 || !Number.isFinite(p.costB))throw Error('Protesta e ruajtur është e pavlefshme.');
        if(p.status==='ACTIVE'){if(p.action!==null || p.resolvedTurn!==null || p.blockUntil!==null || p.costB!==0 || p.ledgerId!==null || p.revision!==0)throw Error('Protesta aktive ka pasoja para vendimit.');}
        else{if(!Object.hasOwn(STREET_PROTEST_COSTS,p.action) || p.status!==({POLICE:'DISPERSED',NEGOTIATE:'NEGOTIATED',IGNORE:'IGNORED',COVERT:'COVERT',COURT:'COURT_RESOLVED'})[p.action] || p.costB!==STREET_PROTEST_COSTS[p.action] || !Number.isInteger(p.resolvedTurn) || p.resolvedTurn<p.startTurn || p.resolvedTurn>st.turnCount || p.revision!==1 || p.blockUntil!==(p.action==='IGNORE' && p.disruptionRoll<.5?p.resolvedTurn+3:null))throw Error('Pasoja e protestës nuk përputhet me vendimin.');
            if(p.costB){var row=st.publicFinance.ledger.find(function(r){return r.id===p.ledgerId;});if(!row || ledgerIds.has(p.ledgerId) || row.type!=='EXPENSE' || row.account!=='budgetTotalB' || Math.abs(row.amountB+p.costB)>1e-8)throw Error('Protesta nuk rakordohet me pagesën.');ledgerIds.add(p.ledgerId);}else if(p.ledgerId!==null)throw Error('Mosndërhyrja nuk mund të ketë pagesë.');}
        if(p.status==='COURT_RESOLVED'&&!st.associationUltimatum?.records.some(r=>r.id===p.associationUltimatumId&&r.protestId===p.id&&['REJECTED','WITHDRAWN'].includes(r.status)))throw Error('Mbyllja e protestes nuk ka vendim perkates.');
        if(p.status==='COVERT' && !st.securityOps?.operations.some(function(o){return o.kind==='PROTEST' && o.target===p.id && o.status==='RESOLVED' && o.success && o.resolvedTurn===p.resolvedTurn;}))throw Error('Mbyllja e fshehtë nuk ka operacion përkatës.');
        ids.add(p.id);
    });
}
function openStreetProtests(){switchMainTab('tab-dashboard');switchSubTab('dash','overview',document.querySelector('#tab-dashboard .sub-pill'));document.getElementById('streetProtestsPanel')?.scrollIntoView?.({block:'start',behavior:'smooth'});}
function renderStreetProtests(){
    var host=document.getElementById('streetProtestsPanel'),alert=document.getElementById('streetProtestAlert');if(!host || !state)return;var db=state.streetProtests,p=activeStreetProtest(state),e=catalogEscape;if(alert)alert.hidden=!p;
    var hasBlocks=db && db.events.some(function(event){return event.status==='IGNORED' && event.blockUntil!==null && state.turnCount<=event.blockUntil;});
    var destination=document.getElementById(p || hasBlocks?'dashboardCitizenAlerts':'dashboardCitizenSettings');
    if(destination && host.parentNode!==destination)destination.appendChild(host);
    if(alert && typeof IntersectionObserver==='function' && !host.streetAlertObserver){host.streetAlertObserver=new IntersectionObserver(entries=>{alert.hidden=!activeStreetProtest(state)||entries[0].isIntersecting;});host.streetAlertObserver.observe(host);}
    if(!db){host.innerHTML='<details class="card"><summary>Reagimi i qytetarëve</summary><p>Aktivizon protestat për përkeqësim ekonomik dhe ligje me ndikim të fortë negativ. Nuk krijon ngjarje historike gjatë ngarkimit.</p><button class="btn-top" onclick="enableStreetProtests()">Aktivizo protestat</button></details>';return;}
    var blocks=db.events.filter(function(p){return p.status==='IGNORED' && p.blockUntil!==null && state.turnCount<=p.blockUntil;});
    host.innerHTML=(p?'<section class="card street-protest-card"><h2>Protestë aktive</h2><p>'+e(p.reason)+'</p>'+uiDetailRows([['Sektori',state.stateSectors.find(function(s){return s.id===p.sectorId;}).name],['Afati për përgjigje',diplomaticDate(p.dueTurn),true]])+'<p>Mosdhënia e përgjigjes trajtohet si mosndërhyrje pas afatit.</p><div class="street-protest-options"><button class="action-btn" onclick="resolveStreetProtest(\''+p.id+'\',\'POLICE\','+p.revision+')">Përdor Policinë · €2M<br>BE −3 / SHBA −2 marrëdhënie</button><button class="action-btn" onclick="resolveStreetProtest(\''+p.id+'\',\'NEGOTIATE\','+p.revision+')">Negocio · €5M<br>Financo koncesionet buxhetore</button><button class="action-btn" onclick="resolveStreetProtest(\''+p.id+'\',\'IGNORE\','+p.revision+')">Injoro · €0<br>50% rrezik bllokimi të punimeve për 3 javë</button></div></section>':'')+blocks.map(function(b){return '<aside class="card street-protest-card"><strong>Punime të bllokuara: '+e(state.stateSectors.find(function(s){return s.id===b.sectorId;}).name)+'</strong><p>Deri më '+e(diplomaticDate(b.blockUntil))+', përfshirë atë javë. Fondet e paguara nuk kthehen dhe nuk ngarkohen sërish.</p></aside>';}).join('')+(db.events.length?'<details class="card"><summary>Historiku i protestave ('+db.events.length+')</summary>'+db.events.slice().reverse().map(function(p){return '<p>'+e(p.reason)+' · '+e(({ACTIVE:'Aktive',DISPERSED:'E shpërndarë',NEGOTIATED:'E përfunduar me marrëveshje',COVERT:'E mbyllur nga operacioni',IGNORED:'Pa ndërhyrje',COURT_RESOLVED:'Qetësuar pas vendimit gjyqësor'})[p.status])+'</p>';}).join('')+'</details>':'');
}
