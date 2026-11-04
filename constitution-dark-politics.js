/* Phase one: optional rules of the game, not a transcription of constitutional law.
   Existing bill, ballot, fiscal ledger and institutional processors remain authoritative. */
const CONSTITUTION_ARTICLES={
    justice:{title:'Administrimi i drejtësisë',initial:'CENTRAL',options:{CENTRAL:'Administrim qendror',DECENTRALIZED:'Delegim i administrimit rajonal'}},
    tax_base:{title:'Kompetenca për tatimet bazë',initial:'FIXED',options:{FIXED:'Kuadër bazë i pandryshueshëm me ligj të zakonshëm',FLEXIBLE:'Rishikim i kuadrit me ligj të zakonshëm'}}
};
const DARK_VOTE_COST_B=.0001,DARK_DIVERSION_RISK=20,DARK_VOTE_RISK=10;
function initializeConstitutionPolitics(st){st.constitutionPolitics={version:1,articles:{justice:'CENTRAL',tax_base:'FIXED'},history:[]};}
function cdpCommit(change){return fiscalCommit(function(){change();validateConstitutionDarkPolitics(state);});}
function constitutionCommit(change){if(!assertPoliticalParliament('Propozimi kushtetues'))return false;return lawNegotiationCommit(function(){change();validateConstitutionDarkPolitics(state);});}
function enableConstitutionPolitics(){if(state.constitutionPolitics)return false;return constitutionCommit(function(){initializeConstitutionPolitics(state);});}
function enableDarkPolitics(){
    if(state.darkPolitics)return false;
    return cdpCommit(function(){state.darkPolitics={version:1,enabled:true,blackFundB:0,scandalRisk:0,revision:0,diversions:[],deals:[],exposedTurn:null};});
}
function constitutionProposalValid(change){return !!change && !!CONSTITUTION_ARTICLES[change.article] && Object.hasOwn(CONSTITUTION_ARTICLES[change.article].options,change.value);}
function constitutionalBlockReason(law,st){
    if(!law)return '';
    if(law.majorityType==='CONSTITUTION_80' && !law.constitutionChange)return 'Propozimi kushtetues duhet të identifikojë nenin që ndryshon.';
    if(law.constitutionChange && (!st.constitutionPolitics || !constitutionProposalValid(law.constitutionChange) || law.majorityType!=='CONSTITUTION_80' || law.requiredVotes!==80))return 'Ndryshimi kushtetues nuk ka konfigurim të vlefshëm ose kërkesën prej 80 votash.';
    var req=law.constitutionalRequirement;
    if(req && (!constitutionProposalValid(req) || !st.constitutionPolitics || st.constitutionPolitics.articles[req.article]!==req.value))return 'Projektligji bllokohet nga neni për '+(CONSTITUTION_ARTICLES[req.article]?.title||'kompetencën përkatëse')+'. Miratoni më parë ndryshimin kushtetues përkatës me 80 vota.';
    return '';
}
function createConstitutionProposal(article,value,ordinary){
    if(!state.constitutionPolitics || !constitutionProposalValid({article:article,value:value}) || !assertPoliticalParliament('Propozimi kushtetues') || state.pendingVote || weeklyProcessing)return false;
    if(!ordinary && state.constitutionPolitics.articles[article]===value){showToast('Ky rregull është tashmë në fuqi.');return false;}
    if(state.laws.some(function(l){var ref=ordinary?l.constitutionalRequirement:l.constitutionChange;return ref?.article===article && ref.value===value && !(ordinary?['FAILED','WITHDRAWN']:['FAILED','WITHDRAWN','PASSED']).includes(l.status);})){showToast('Ky propozim është tashmë në procedurë ose i miratuar.');return false;}
    var id;
    var ok=constitutionCommit(function(){
        id='constitution:'+ (++state.billCounter);
        var title=(ordinary?'Projektligj për kompetencën: ':'Ndryshim kushtetues: ')+CONSTITUTION_ARTICLES[article].title+' — '+CONSTITUTION_ARTICLES[article].options[value];
        var law={id:id,title:title,desc:ordinary?'Përcakton procedurën e ushtrimit të kompetencës së re. Nuk ndryshon automatikisht normat tatimore, buxhetet ose vendimet gjyqësore.':'Ndryshon kompetencën e nenit '+CONSTITUTION_ARTICLES[article].title+' në: '+CONSTITUTION_ARTICLES[article].options[value]+'. Nuk kryen pagesa ose ndryshim automatik të tatimeve.',ministry:article==='justice'?'Ministria e Drejtësisë':'Ministria e Financave',sector:article==='justice'?'sec_justice':'sec_econ',proposer:agendaExecutive()?'Qeveria e Kosovës':'Deputetë të '+state.playerParty,costB:0,duration:1,approvalEffect:0,status:'DRAFT',supportParties:[state.playerParty],voteHistory:[],stageHistory:[],applied:false,legalEffectMode:'PROCEDURAL'};
        initializeCatalogBill(law);law.majorityType=ordinary?'SIMPLE_61':'CONSTITUTION_80';law.requiredVotes=ordinary?61:80;
        if(ordinary)law.constitutionalRequirement={article:article,value:value};else law.constitutionChange={article:article,value:value};
        state.laws.unshift(law);state.historyLog.unshift('Java '+state.turnCount+': U përgatit '+title+'.');
    });
    if(ok)catalogBillDetails(state.laws.findIndex(function(l){return l.id===id;}));return ok;
}
function applyConstitutionChange(law){
    if(!_committingVote || !state.pendingVote || !law.voteHistory?.some(function(v){return v.passed && v.pro>=80;}) || !law.constitutionChange || law.status!=='PASSED' || !law.applied || !state.constitutionPolitics || !constitutionProposalValid(law.constitutionChange))throw Error('Ndryshimi kushtetues nuk është miratuar.');
    if(state.constitutionPolitics.history.some(function(h){return h.lawId===law.id;}))return;
    state.constitutionPolitics.articles[law.constitutionChange.article]=law.constitutionChange.value;
    state.constitutionPolitics.history.push({lawId:law.id,article:law.constitutionChange.article,value:law.constitutionChange.value,turn:state.turnCount});
}
function darkDealMatches(deal,law,mp,st){return deal.status==='PROMISED' && deal.lawId===law.id && deal.lawVersion===(law.version||1) && deal.cycle===deputyCycleId(st) && deal.seatNumber===mp.seatNumber && deal.partyId===mp.party;}
function darkPoliticalBallot(law,mp,baseline){return lawNegotiationEligible(law) && state.darkPolitics?.enabled && state.darkPolitics.deals.some(function(d){return darkDealMatches(d,law,mp,state);})?'pro':baseline;}
function constitutionalBillDetails(law){var change=law.constitutionChange||law.constitutionalRequirement,a=CONSTITUTION_ARTICLES[change.article],reason=constitutionalBlockReason(law,state);return uiDetailRows([['Lloji',law.constitutionChange?'Ndryshim kushtetues':'Ligj i zakonshëm me kusht kushtetues'],['Neni',a.title],['Rregulli i kërkuar',a.options[change.value]],['Shumica',law.constitutionChange?'80/120':'61/120',true]])+(reason?'<p role="status">'+catalogEscape(reason)+'</p>':'<p>Kushti kushtetues plotësohet. Shqyrtimi dhe votimi parlamentar mbeten të detyrueshëm.</p>')+'<p>Ky akt rregullon kompetencën. Nuk kryen pagesa, ndryshim automatik normash tatimore ose ndërhyrje në vendime gjyqësore.</p>';}
function consumeDarkPoliticalVotes(law){
    state.darkPolitics?.deals.filter(function(d){return d.lawId===law.id && d.status==='PROMISED';}).forEach(function(d){var mp=state.mps.find(function(m){return m.seatNumber===d.seatNumber;});d.status=mp && darkDealMatches(d,law,mp,state)?'USED':'VOID';});
}
function darkScandal(){
    var d=state.darkPolitics;if(d.scandalRisk<100 || d.exposedTurn!==null)return;
    d.exposedTurn=state.turnCount;
    d.deals.forEach(function(r){if(r.status==='PROMISED')r.status='VOID';});
    addMediaNews('Hetimi publik','Publikohen provat për tenderët fiktivë dhe financimin e paligjshëm','CRITICAL','Gjurmët e pagesave dhe marrëveshjeve janë bërë publike. Kryeministri ka njoftuar dorëheqjen; kompetencat ekzekutive pushojnë sipas rrjedhës institucionale.');
    setInstitutionalPhase(INSTITUTIONAL_PHASES.GOV_OVERTHROWN,'Dorëheqje e qeverisë pas zbulimit të financimit të paligjshëm.');
}
function divertDarkFunds(amountM,expectedRevision){
    var d=state.darkPolitics;if(!d?.enabled || d.revision!==expectedRevision || !Number.isFinite(amountM) || amountM<.1 || amountM>10 || d.exposedTurn!==null || d.diversions.some(function(r){return r.turn===state.turnCount;}))return false;
    var amount=fiscalRound(amountM/1000),authorization=fiscalSpendingCheck(amount,false);
    if(!authorization.allowed || state.budgetTotalB<amount){showToast(authorization.message||'Arka nuk e mbulon shumën.');return false;}
    return cdpCommit(function(){
        fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-amount),'Tender i kontestuar','EXPENSE');
        d.blackFundB=fiscalRound(d.blackFundB+amount);d.scandalRisk=Math.min(100,d.scandalRisk+DARK_DIVERSION_RISK);d.revision++;
        d.diversions.push({id:'dark-diversion:'+d.revision,amountB:amount,turn:state.turnCount,ledgerId:state.publicFinance.ledger.at(-1).id});
        recordLeakRisk('TENDER',d.diversions.at(-1).id,null);state.historyLog.unshift('Java '+state.turnCount+': U regjistrua një kontratë prokurimi.');darkScandal();
    });
}
function buyDarkVote(lawId,seatNumber,expectedRevision){
    var d=state.darkPolitics,l=state.laws.find(function(l){return l.id===lawId;}),mp=state.mps.find(function(m){return m.seatNumber===seatNumber;});
    if(!d?.enabled || d.revision!==expectedRevision || d.exposedTurn!==null || !l || !mp || !lawNegotiationEligible(l) || constitutionalBlockReason(l,state) || d.blackFundB<DARK_VOTE_COST_B || d.deals.some(function(r){return r.lawId===lawId && r.seatNumber===seatNumber;}))return false;
    return cdpCommit(function(){d.blackFundB=fiscalRound(d.blackFundB-DARK_VOTE_COST_B);d.scandalRisk=Math.min(100,d.scandalRisk+DARK_VOTE_RISK);d.revision++;
        d.deals.push({id:'dark-deal:'+d.revision,lawId:lawId,lawVersion:l.version||1,seatNumber:seatNumber,partyId:mp.party,cycle:deputyCycleId(state),costB:DARK_VOTE_COST_B,status:'PROMISED'});recordLeakRisk('BRIBE',d.deals.at(-1).id,null);darkScandal();});
}
function validateConstitutionDarkPolitics(st){
    var c=st.constitutionPolitics,d=st.darkPolitics;
    if(c!==undefined && (!c || c.version!==1 || !c.articles || Object.keys(CONSTITUTION_ARTICLES).some(function(k){return !Object.hasOwn(CONSTITUTION_ARTICLES[k].options,c.articles[k]);}) || !Array.isArray(c.history) || c.history.some(function(h){return !h || !constitutionProposalValid(h) || typeof h.lawId!=='string' || !Number.isInteger(h.turn) || h.turn<0 || h.turn>st.turnCount;})))throw Error('Kuadri kushtetues është i pavlefshëm.');
    if(c){var historyIds=new Set();c.history.forEach(function(h){var l=st.laws.find(function(l){return l.id===h.lawId;});if(historyIds.has(h.lawId) || !l || l.status!=='PASSED' || !l.applied || !l.voteHistory?.some(function(v){return v.passed && v.pro>=80;}) || l.constitutionChange?.article!==h.article || l.constitutionChange.value!==h.value)throw Error('Ndryshimi i nenit nuk ka miratim të regjistruar.');historyIds.add(h.lawId);});Object.keys(CONSTITUTION_ARTICLES).forEach(function(k){var last=c.history.filter(function(h){return h.article===k;}).at(-1);if(c.articles[k] !== (last?last.value:CONSTITUTION_ARTICLES[k].initial))throw Error('Neni nuk përputhet me historikun e miratimit.');});}
    st.laws.forEach(function(l){if(l.constitutionChange && (!c || !constitutionProposalValid(l.constitutionChange) || l.majorityType!=='CONSTITUTION_80' || l.requiredVotes!==80) || l.constitutionalRequirement && (!c || !constitutionProposalValid(l.constitutionalRequirement)))throw Error('Referenca kushtetuese e projektligjit është e pavlefshme.');});
    if(d===undefined)return;
    if(!d || d.version!==1 || d.enabled!==true || !Number.isFinite(d.blackFundB) || d.blackFundB<0 || !Number.isFinite(d.scandalRisk) || d.scandalRisk<0 || d.scandalRisk>100 || !Number.isInteger(d.revision) || d.revision<0 || !Array.isArray(d.diversions) || !Array.isArray(d.deals) || !(d.exposedTurn===null || Number.isInteger(d.exposedTurn) && d.exposedTurn>=0 && d.exposedTurn<=st.turnCount))throw Error('Fondi i Zi është i pavlefshëm.');
    if((d.scandalRisk===100)!==(d.exposedTurn!==null) || new Set(d.diversions.map(function(r){return r.ledgerId;})).size!==d.diversions.length || new Set(d.diversions.map(function(r){return r.turn;})).size!==d.diversions.length)throw Error('Gjurmët e skandalit ose tërheqjes janë të pavlefshme.');
    var keys=new Set(),ids=new Set();d.diversions.forEach(function(r){var entry=st.publicFinance.ledger.find(function(e){return e.id===r.ledgerId;});if(!r || typeof r.id!=='string' || ids.has(r.id) || !Number.isFinite(r.amountB) || r.amountB<=0 || !Number.isInteger(r.turn) || r.turn<0 || r.turn>st.turnCount || !entry || entry.type!=='EXPENSE' || entry.account!=='budgetTotalB' || Math.abs(entry.amountB+r.amountB)>1e-8)throw Error('Tërheqja nuk përputhet me regjistrin fiskal.');ids.add(r.id);});
    d.deals.forEach(function(r){var key=r.lawId+':'+r.seatNumber;if(!r || typeof r.id!=='string' || ids.has(r.id) || keys.has(key) || !st.laws.some(function(l){return l.id===r.lawId;}) || !Number.isInteger(r.seatNumber) || r.seatNumber<1 || r.seatNumber>120 || !st.parties[r.partyId] || typeof r.cycle!=='string' || !Number.isInteger(r.lawVersion) || r.lawVersion<1 || r.costB!==DARK_VOTE_COST_B || !['PROMISED','USED','VOID'].includes(r.status))throw Error('Marrëveshja e votës është e pavlefshme.');ids.add(r.id);keys.add(key);});
    var net=fiscalRound(d.diversions.reduce(function(s,r){return s+r.amountB;},0)-d.deals.reduce(function(s,r){return s+r.costB;},0)-(st.securityOps?.operations||[]).reduce(function(s,r){return s+r.costB;},0));
    if(Math.abs(net-d.blackFundB)>1e-8 || d.revision!==d.diversions.length+d.deals.length+(st.securityOps?.operations.length||0) || d.scandalRisk!==Math.min(100,d.diversions.length*DARK_DIVERSION_RISK+d.deals.length*DARK_VOTE_RISK+(st.securityOps?.operations.length||0)*10))throw Error('Bilanci ose rreziku i Fondit të Zi nuk rakordohet.');
}
function renderConstitutionPolitics(){
    var host=document.getElementById('constitutionPoliticsPanel');if(!host || !state)return;var e=catalogEscape,c=state.constitutionPolitics,d=state.darkPolitics;
    var selectedLaw=document.getElementById('darkLaw')?.value,selectedSeat=document.getElementById('darkSeat')?.value;
    var constitutionOpen=document.getElementById('dashboardConstitution')?.open;
    var darkOpen=document.getElementById('dashboardDarkPolitics')?.open;
    var html='<details class="card" id="dashboardConstitution" '+(constitutionOpen?'open':'')+'><summary>Kushtetuta dhe kompetencat ligjore</summary><p>Ligj i zakonshëm: 61/120. Ndryshim kushtetues: 80/120. Shumicat e posaçme të akteve ekzistuese mbeten të detyrueshme.</p>';
    if(!c)html+='<button class="action-btn" onclick="enableConstitutionPolitics()">Aktivizo nenet për propozimet e reja</button>';
    else Object.keys(CONSTITUTION_ARTICLES).forEach(function(k){var a=CONSTITUTION_ARTICLES[k];html+='<article><h3>'+e(a.title)+'</h3><p>'+e(a.options[c.articles[k]])+'</p><label>Rregulli i propozuar<select id="constitutionValue_'+k+'">'+Object.keys(a.options).map(function(v){return '<option value="'+v+'" '+(v!==c.articles[k]?'selected':'')+'>'+e(a.options[v])+'</option>';}).join('')+'</select></label><button class="btn-top" onclick="createConstitutionProposal(\''+k+'\',document.getElementById(\'constitutionValue_'+k+'\').value,false)">Propozo ndryshimin · 80 vota</button> <button class="btn-top" onclick="createConstitutionProposal(\''+k+'\',document.getElementById(\'constitutionValue_'+k+'\').value,true)">Propozo ligjin zbatues · 61 vota</button></article>';});
    html+='</details>';
    if(!d)html+='<details class="card" id="dashboardDarkPolitics" '+(darkOpen?'open':'')+'><summary>Opsion loje: Politika e Pisët</summary><p>Aktivizon tenderë fiktivë dhe marrëveshje të paligjshme për vota. Paratë dalin realisht nga arka; ekspozimi i plotë sjell publikimin e provave dhe dorëheqjen e qeverisë. Aktivizimi nuk jep para.</p><button class="action-btn" onclick="enableDarkPolitics()">Aktivizo Politikën e Pisët</button></details>';
    else{
        var eligible=state.laws.filter(function(l){return lawNegotiationEligible(l) && !constitutionalBlockReason(l,state);});
        html+='<details class="card dark-politics" id="dashboardDarkPolitics" '+(darkOpen?'open':'')+'><summary>Politika e Pisët · Fondi i Zi</summary>'+uiDetailRows([['Gjendja','€'+(d.blackFundB*1000).toFixed(2)+'M',true],['Rreziku i skandalit',d.scandalRisk+'/100',true]])+'<progress max="100" value="'+d.scandalRisk+'" aria-label="Rreziku i skandalit"></progress><p>Çdo tërheqje: +20 rrezik. Çdo votë: +10. Në 100 publikohen provat dhe qeveria jep dorëheqje. Vota vlen vetëm për dokumentin, versionin dhe mandatin e zgjedhur; nuk anashkalon Kushtetutën.</p>';
        if(agendaExecutive() && d.exposedTurn===null){html+='<label>Shuma e tenderit fiktiv (milionë euro, 0.1–10)<input id="darkDiversionM" type="number" min="0.1" max="10" step="0.1" value="1"></label><button class="action-btn" onclick="divertDarkFunds(Number(document.getElementById(\'darkDiversionM\').value),'+d.revision+')">Tërhiq nga arka · +20 rrezik</button><p>Lejohet një tërheqje për javë. Kontrollet e fondeve dhe autorizimit fiskal mbeten aktive.</p><label>Projektligji<select id="darkLaw">'+eligible.map(function(l){return '<option value="'+e(l.id)+'">'+e(l.title)+'</option>';}).join('')+'</select></label><label>Deputeti<select id="darkSeat">'+state.mps.map(function(m){return '<option value="'+m.seatNumber+'">'+e(m.name)+' · '+e(m.party)+' · ulësja '+m.seatNumber+'</option>';}).join('')+'</select></label><button class="action-btn" onclick="buyDarkVote(document.getElementById(\'darkLaw\').value,Number(document.getElementById(\'darkSeat\').value),'+d.revision+')">Bli votën · €100,000 · +10 rrezik</button>';}
        html+='<details><summary>Marrëveshjet e votave ('+d.deals.length+')</summary>'+d.deals.map(function(r){var law=state.laws.find(function(l){return l.id===r.lawId;}),mp=state.mps.find(function(m){return m.seatNumber===r.seatNumber;});var active=law && mp && lawNegotiationEligible(law) && darkDealMatches(r,law,mp,state);return '<p><strong>'+e(mp?.name||'Ulësja '+r.seatNumber)+' · '+e(r.partyId)+'</strong><br>'+e(law?.title||r.lawId)+' · Versioni '+r.lawVersion+'<br>'+e(r.status==='USED'?'E përdorur në votim':active?'Në pritje për këtë version':'Pa efekt për versionin/mandatin aktual')+'</p>';}).join('')+'</details><p>Pagesat nuk kthehen kur dokumenti ndryshon ose dështon.</p>'+(d.exposedTurn!==null?'<p role="status">Provat janë publikuar. Qeveria ka dhënë dorëheqje; ndiq rrjedhën institucionale.</p>':'')+'</details>';
    }
    host.innerHTML=html;
    ['darkLaw','darkSeat'].forEach(function(id){var node=document.getElementById(id),value=id==='darkLaw'?selectedLaw:selectedSeat;if(value && node?.options && Array.from(node.options).some(function(o){return o.value===value;}))node.value=value;});
}
