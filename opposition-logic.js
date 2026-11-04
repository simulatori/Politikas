/* Extends institutional roles. Party cash uses euros; public cash uses billions. */
const OPPOSITION_ACTIONS={RALLY:{title:'Tubim qytetar',cost:25000,gain:1.2,pressure:1.5},CAMPAIGN:{title:'Fushatë vetëdijesimi',cost:15000,gain:.7,pressure:.8},INTERPELLATE:{title:'Interpelancë parlamentare',cost:10000,gain:.3,pressure:.5}};
const OPPOSITION_BILLS={PENSIONS:{title:'Rritje e pensioneve',costB:.04,sector:'sec_social'},YOUTH:{title:'Program mbështetjeje për të rinjtë',costB:.008,sector:'sec_edu'}};
function oppositionActive(st){st=st||state;return ['OPPOSITION_LEADER','OPPOSITION_MP'].includes(politicalPlayerRole(st).id)&&st.governmentFormed&&st.governmentStatus==='IN_OFFICE';}
function migrateOpposition(st){
    if(!st.opposition)st.opposition={version:1,lastTurn:st.turnCount,cycle:deputyCycleId(st),actions:{},pledges:[],income:[],journal:[],counter:0,snapDue:false};
    Object.values(st.parties).forEach(function(p){if(p.partyFunds===undefined)p.partyFunds=0;});
}
function oppositionLog(text){state.opposition.journal.unshift({turn:state.turnCount,text:text});state.opposition.journal=state.opposition.journal.slice(0,60);}
function oppositionCommit(change){
    if(!oppositionActive()||state.pendingVote||_voteInProgress||weeklyProcessing||weeklyVisualBusy||hasOpenElectionProcess())return false;
    var before=JSON.stringify(state);
    try{migrateOpposition(state);change();validateLoadedState(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}
    catch(e){state=JSON.parse(before);showToast(e.message);return false;}
    refreshAllUI();return true;
}
function oppositionPollGain(gain){
    var p=state.parties[state.playerParty],others=Object.values(state.parties).filter(function(x){return x!==p;}),sum=others.reduce(function(s,x){return s+x.poll;},0),actual=Math.min(gain,sum,95-p.poll);
    if(actual<=0)return;others.forEach(function(x){x.poll-=actual*x.poll/sum;});p.poll+=actual;
}
function oppositionSpend(cost){var p=state.parties[state.playerParty];if(p.partyFunds<cost)throw Error('Buxheti i Partisë nuk e mbulon veprimin.');p.partyFunds-=cost;}
function oppositionOnce(key){key=state.playerParty+':'+key;if(state.opposition.actions[key]===state.turnCount)throw Error('Ky veprim është kryer këtë javë.');state.opposition.actions[key]=state.turnCount;}
function performOppositionAction(kind){
    if(kind==='RALLY'&&oppositionPressurePaused(state)){showToast("Tubimet politike janë pezulluar përkohësisht nga marrëveshja aktive ose kufizimi i financimit.");return false;}
    var a=OPPOSITION_ACTIONS[kind];if(!a)return false;
    var ok=oppositionCommit(function(){oppositionOnce(kind);oppositionSpend(a.cost);oppositionPollGain(a.gain);adjustPublicSupport(-a.pressure,{source:'opposition:'+kind},state);oppositionLog(a.title+': €'+a.cost+' nga fondet e partisë.');});
    if(ok)showGovernmentNotification({audience:"OPPOSITION",title:a.title+' u zhvillua',message:'Partia rriti praninë publike. Fondet u morën vetëm nga Buxheti i Partisë.',details:['Sondazhet dhe mbështetja e Qeverisë janë përditësuar.']});return ok;
}
function oppositionFundraise(){return oppositionCommit(function(){oppositionOnce('FUNDRAISE');state.parties[state.playerParty].partyFunds+=20000;oppositionLog('Takimi me donatorët solli €20,000.');});}
function oppositionPledges(){
    var db=state.opposition;if(!db||db.cycle!==deputyCycleId(state))return [];
    return db.pledges.filter(function(p){return p.owner===state.playerParty&&p.expiresTurn>=state.turnCount&&state.mps.some(function(m){return m.seatNumber===p.seat&&m.party===p.party&&m.party!==p.owner;});});
}
function oppositionSecureSeats(){var seats=state.mps.filter(function(m){return m.party===state.playerParty;}).map(function(m){return m.seatNumber;});return new Set(seats.concat(oppositionPledges().map(function(p){return p.seat;})));}
function oppositionLobby(){
    return oppositionCommit(function(){
        oppositionOnce('LOBBY');var active=oppositionSecureSeats(),targets=state.mps.filter(function(m){return m.party!==state.playerParty&&!active.has(m.seatNumber);}).sort(function(a,b){return Number(state.coalitionParties.includes(b.party))-Number(state.coalitionParties.includes(a.party))||(a.loyalty||50)-(b.loyalty||50)||a.seatNumber-b.seatNumber;}).slice(0,4);
        if(!targets.length)throw Error('Nuk ka deputetë të rinj për lobim.');oppositionSpend(targets.length*12000);
        targets.forEach(function(m){state.opposition.pledges.push({owner:state.playerParty,seat:m.seatNumber,party:m.party,expiresTurn:state.turnCount+12});});
        oppositionLog('Lobim: '+targets.length+' zotime për mosbesim, të vlefshme 12 javë. Abstenimi në reformat qeveritare ka 75% gjasë për secilin.');
    });
}
function oppositionAIAccepts(l){return state.budgetTotalB>=l.costB+.05 && l.costB<=.015 && fiscalSpendingCheck(l.costB,false).allowed;}
function oppositionLawBallot(l,mp,ballot,forecast,random){
    if(!oppositionActive())return ballot;
    if(l.oppositionBill && l.oppositionBill.owner===state.playerParty){
        if(state.coalitionParties.includes(mp.party))return oppositionAIAccepts(l)?'pro':'kunder';
        return 'pro';
    }
    if((l.proposer||'').startsWith('Qeveria')&&coalitionMajorBill(l)){
        if(oppositionPledges().some(function(p){return p.seat===mp.seatNumber;}))return (forecast ? .5 : random())<.75?'abstenim':ballot;
    }
    return ballot;
}
function proposeOppositionBill(kind){
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed())return false;
    var spec=OPPOSITION_BILLS[kind];if(!spec)return false;
    return oppositionCommit(function(){
        oppositionOnce('BILL');if(!assertAssemblyFunctional('Iniciativa opozitare'))throw Error('Kuvendi nuk është funksional.');
        if(state.laws.some(function(l){return l.oppositionBill?.owner===state.playerParty&&!['PASSED','FAILED','WITHDRAWN'].includes(l.status);}))throw Error('Përfundoni iniciativën aktive përpara propozimit tjetër.');
        oppositionSpend(10000);var l={id:'opposition:'+(++state.billCounter),title:spec.title,desc:'Iniciativë e opozitës. Kosto publike e zbatimit: €'+(spec.costB*1000)+'M. Hartimi kushton €10,000 nga partia.',proposer:'Deputetë të '+state.playerParty,ministry:'Ministria e Financave',sector:spec.sector,costB:spec.costB,duration:6,approvalEffect:0,status:'SCHEDULED',supportParties:[state.playerParty],voteHistory:[],stageHistory:[],applied:false,oppositionBill:{owner:state.playerParty,kind:kind,settled:false}};
        initializeCatalogBill(l);l.debated=true;l.scheduledWeek=state.turnCount;l.stageHistory.push({stage:'SCHEDULED',week:state.turnCount});state.laws.unshift(l);oppositionLog('U dorëzua: '+l.title+'. Votimi hapet javën pasuese.');
    });
}
function oppositionLawResult(l,r){
    if(!oppositionActive()||!state.opposition)return;
    if(l.oppositionBill?.owner===state.playerParty&&!l.oppositionBill.settled){
        l.oppositionBill.settled=true;
        if(r.passed){oppositionPollGain(2);oppositionLog('U miratua '+l.title+': partia mori kreditet politike.');}
        else if(!oppositionAIAccepts(l)){oppositionPollGain(1);rtkApplyApproval(state,-4);if(typeof syncInterestGroups==='function')syncInterestGroups(state);oppositionLog('Qeveria kundërshtoi '+l.title+' për koston; humbi deri 4 pikë mbështetje publike.');}
    }else if(!r.passed&&(l.proposer||'').startsWith('Qeveria')&&coalitionMajorBill(l)){
        rtkApplyApproval(state,-2);if(typeof syncInterestGroups==='function')syncInterestGroups(state);oppositionPollGain(.5);oppositionLog('Qeverisë iu rrëzua një reformë e madhe në Kuvend; humbi deri 2 pikë autoritet publik.');
    }
}
function oppositionMotionReady(){return !oppositionPressurePaused(state)&&oppositionActive()&&oppositionSecureSeats().size>=61&&state.approval<=45&&state.assemblyConstituted&&state.speakerElected;}
function callOppositionMotion(){
    if(!oppositionMotionReady()){showToast('Kërkohen 61 zotime aktive dhe mbështetje e Qeverisë jo më shumë se 45%.');return false;}
    var id;var ok=oppositionCommit(function(){oppositionOnce('MOTION');var pending=state.motions.find(function(m){return m.oppositionOwner===state.playerParty&&m.status==='PENDING';});if(pending){id=pending.id;return;}id='opposition-motion:'+(++state.opposition.counter);state.motions.push({id:id,type:'NO_CONFIDENCE',title:'Mocion mosbesimi nga '+state.parties[state.playerParty].short,desc:'Zotime të regjistruara të deputetëve.',status:'PENDING',oppositionOwner:state.playerParty});});
    if(ok)voteNoConfidenceMotion(id);return ok;
}
function resumeOppositionElection(){
    if(!state.opposition?.snapDue||state.pendingVote)return false;
    if(state.electionPhase!=='NONE'&&hasOpenElectionProcess()){state.opposition.snapDue=false;return false;}
    var ok=startParliamentaryElectionProcess('Presidenti · pas mocionit të opozitës');if(ok){state.opposition.snapDue=false;saveGameAuto();}return ok;
}
function oppositionVoteBill(id){if(!oppositionActive()||weeklyProcessing||weeklyVisualBusy)return false;var l=state.laws.find(function(l){return l.id===id;});if(!l||!l.oppositionBill&&!l.oppositionAI)return false;return beginLawVote(l,null);}
function processOppositionWeek(turn){
    migrateOpposition(state);var db=state.opposition;if(turn<=db.lastTurn)return;
    db.lastTurn=turn;if(db.cycle!==deputyCycleId(state)){db.cycle=deputyCycleId(state);db.pledges=[];}
    db.pledges=db.pledges.filter(function(p){return p.expiresTurn>=turn;});
    var p=state.parties[state.playerParty];if(!p)return;var dues=5000+Math.floor(p.poll*120),donations=3000+Math.floor(p.poll*80);p.partyFunds+=dues+donations;db.income.unshift({turn:turn,owner:state.playerParty,dues:dues,donations:donations});db.income=db.income.slice(0,30);
    if(!oppositionActive())return;
    if(!(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed())&&turn%4===0&&!state.laws.some(function(l){return l.oppositionAI&& !['PASSED','FAILED','WITHDRAWN'].includes(l.status);})){
        var l={id:'ai-reform:'+(++state.billCounter),title:'Reforma qeveritare për administratën publike',desc:'Reformë e madhe e Qeverisë AI; deputetët e lobuar mund të abstenojnë.',proposer:'Qeveria e Kosovës',ministry:'Ministria e Financave',sector:'sec_econ',costB:.02,duration:6,approvalEffect:0,status:'SCHEDULED',supportParties:state.coalitionParties.slice(),voteHistory:[],stageHistory:[],applied:false,majorReform:true,oppositionAI:true};initializeCatalogBill(l);l.govStage='APPROVED';l.debated=true;l.scheduledWeek=turn;state.laws.unshift(l);
    }
}
function validateOpposition(st){
    Object.values(st.parties).forEach(function(p){if(p.partyFunds!==undefined&&(!Number.isSafeInteger(p.partyFunds)||p.partyFunds<0))throw Error('Buxheti i Partisë është i pavlefshëm.');});
    var d=st.opposition;if(!d)return;
    if(d.version!==1||!Number.isInteger(d.lastTurn)||d.lastTurn>st.turnCount||!Number.isInteger(d.counter)||d.counter<0||typeof d.cycle!=='string'||!d.actions||typeof d.actions!=='object'||Array.isArray(d.actions)||Object.values(d.actions).some(function(t){return !Number.isInteger(t)||t>st.turnCount;})||typeof d.snapDue!=='boolean'||!Array.isArray(d.pledges)||!Array.isArray(d.income)||!Array.isArray(d.journal)||d.journal.length>60||d.income.length>30)throw Error('Shtabi i Partisë është i pavlefshëm.');
    var seen=new Set();d.pledges.forEach(function(p){var key=p.owner+':'+p.seat;if(!st.parties[p.owner]||!st.parties[p.party]||!Number.isInteger(p.seat)||p.seat<1||p.seat>120||!Number.isInteger(p.expiresTurn)||p.expiresTurn>st.turnCount+12||seen.has(key))throw Error('Zotim opozitar i pavlefshëm.');seen.add(key);});
    if(d.pledges.length>120*Object.keys(st.parties).length||d.lastTurn<1)throw Error('Regjistri opozitar është i pavlefshëm.');
    d.journal.forEach(function(j){if(!j||!Number.isInteger(j.turn)||j.turn>st.turnCount||typeof j.text!=='string'||j.text.length>3000)throw Error('Historiku opozitar është i pavlefshëm.');});
    d.income.forEach(function(i){if(!st.parties[i.owner]||!Number.isInteger(i.turn)||i.turn>st.turnCount||!Number.isFinite(i.dues)||i.dues<0||!Number.isFinite(i.donations)||i.donations<0)throw Error('Të hyra partie të pavlefshme.');});
    st.laws.forEach(function(l){if(l.oppositionBill&&(!st.parties[l.oppositionBill.owner]||!OPPOSITION_BILLS[l.oppositionBill.kind]||typeof l.oppositionBill.settled!=='boolean'))throw Error('Iniciativë opozitare e pavlefshme.');});
}
function renderOppositionHQ(){
    var host=document.getElementById('oppositionHQ');if(!host)return;var active=oppositionActive();host.hidden=!active;
    if(document.querySelectorAll)document.querySelectorAll('.nav-item').forEach(function(b){if((b.getAttribute('onclick')||'').includes("'tab-government'")){if(active){b.disabled=true;b.setAttribute('data-opposition-disabled','true');b.title='Kompetencat ekzekutive nuk i përkasin opozitës.';}else if(b.getAttribute('data-opposition-disabled')==='true'){b.disabled=false;b.removeAttribute('data-opposition-disabled');b.removeAttribute('title');}}});
    if(!active)return;
    if(document.getElementById('tab-government')?.classList.contains('active'))switchMainTab('tab-dashboard');
    var e=catalogEscape,p=state.parties[state.playerParty],db=state.opposition,pledges=oppositionPledges(),secure=oppositionSecureSeats().size,income=db?.income.find(function(i){return i.owner===state.playerParty;}),disabled=state.pendingVote||weeklyProcessing;
    function btn(code,label,off){return '<button class="action-btn" '+(disabled||off?'disabled':'')+' onclick="'+code+'">'+label+'</button>';}
    host.innerHTML='<div class="card-header"><h2>Shtabi i Partisë</h2><span class="tag tag-gold">'+e(politicalPlayerRole().label)+'</span></div><div class="opposition-stats"><div><small>Buxheti i Partisë</small><strong>€'+p.partyFunds.toLocaleString('sq-AL')+'</strong></div><div><small>Sondazhi i partisë</small><strong>'+p.poll.toFixed(1)+'%</strong></div><div><small>Mbështetja e Qeverisë</small><strong>'+state.approval.toFixed(1)+'%</strong></div><div><small>Zotime për mosbesim</small><strong>'+secure+' / 61</strong></div></div><p>'+ (income?'Java e fundit: kuota €'+income.dues+' + donacione €'+income.donations+'.':'Kuotat dhe donacionet arkëtohen javën pasuese.')+' Fondet e partisë janë të ndara nga arka e shtetit.</p><div class="opposition-grid"><section><h3>Mobilizimi qytetar</h3><button class="action-btn" onclick="openPartyMediaHQ()">Lufta Mediatike / Portale</button>'+Object.keys(OPPOSITION_ACTIONS).map(function(k){var a=OPPOSITION_ACTIONS[k];return btn("performOppositionAction('"+k+"')",e(a.title)+' · €'+a.cost,db?.actions[state.playerParty+':'+k]===state.turnCount);}).join('')+btn('oppositionFundraise()','Takim me donatorët · +€20,000',db?.actions[state.playerParty+':FUNDRAISE']===state.turnCount)+'<h3>Iniciativat parlamentare</h3>'+Object.keys(OPPOSITION_BILLS).map(function(k){var b=OPPOSITION_BILLS[k];return btn("proposeOppositionBill('"+k+"')",e(b.title)+' · hartimi €10,000 · shteti €'+(b.costB*1000)+'M',db?.actions[state.playerParty+':BILL']===state.turnCount);}).join('')+'</section><section><h3>Lobimi parlamentar</h3><p>€12,000 për deputet, deri në 4 deputetë në javë. Zotimet zgjasin 12 javë; 75% gjasë abstenimi në reformat qeveritare.</p>'+btn('oppositionLobby()','Lobo deputetë · deri €48,000',db?.actions[state.playerParty+':LOBBY']===state.turnCount)+'<p>'+state.mps.filter(function(m){return m.party===state.playerParty;}).length+' deputetët tuaj + '+pledges.length+' zotime aktive.</p><progress max="61" value="'+Math.min(61,secure)+'" aria-label="Votat për mosbesim"></progress>'+btn('callOppositionMotion()','Thirr Mocion Mosbesimi',!oppositionMotionReady())+'<p>Kërkohen ≥61 zotime dhe mbështetje e Qeverisë ≤45%.</p><details><summary>Deputetët e bindur dhe afatet</summary>'+pledges.map(function(x){var m=state.mps.find(function(m){return m.seatNumber===x.seat;});return '<p>'+e(m.name||'Deputeti '+x.seat)+' · '+e(x.party)+' · '+(x.expiresTurn-state.turnCount)+' javë</p>';}).join('')+'</details></section></div><h3>Dosjet në Kuvend</h3>'+state.laws.filter(function(l){return l.oppositionAI||l.oppositionBill?.owner===state.playerParty;}).slice(0,8).map(function(l){return '<article class="opposition-file"><strong>'+e(l.title)+'</strong><p>'+e(l.status)+(l.oppositionBill?' · Qëndrimi i Qeverisë: '+(oppositionAIAccepts(l)?'mbështet financimin':'kundërshton koston'):'')+'</p>'+(l.status==='SCHEDULED'?btn("oppositionVoteBill('"+e(l.id)+"')",'Nis votimin',state.turnCount<=l.scheduledWeek):'')+'</article>';}).join('')+'<details><summary>Historiku i Shtabit</summary>'+ (db?.journal||[]).map(function(j){return '<p>Java '+j.turn+': '+e(j.text)+'</p>';}).join('')+'</details>';
}
