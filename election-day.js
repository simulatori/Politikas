/* Phase 4: a persisted simulation of votes, never a parliamentary seat allocator. */
const ELECTION_DAY_MODEL = Object.freeze({
    version:1, electorate:1000000, baseTurnout:0.45,
    preferenceModel:"SIMULATED_SINGLE_PREFERENCE", preferencesPerBallot:1,
    preferenceParticipation:0.90, legalConfirmed:false
});
let electionDayTimer = null;

function electionDayCycleId(gameState) {
    var campaign=gameState.electionCampaign;
    return campaign ? "parliament:"+gameState.mandateNumber+":"+campaign.startWeek : null;
}

function electionDayEligible(gameState) {
    var campaign=gameState.electionCampaign;
    return !!campaign && campaign.moduleVersion===3 && campaign.status==="CLOSED" &&
        campaign.elapsedWeeks===campaignDuration(campaign) && campaign.weeksRemaining===0 &&
        Number.isInteger(campaign.electionTurn) && gameState.turnCount>=campaign.electionTurn &&
        gameState.electionPhase==="CAMPAIGN_CLOSED";
}

function getElectionDayCycle(gameState) {
    var id=electionDayCycleId(gameState);
    return (gameState.parliamentaryElections || []).find(function(cycle){return cycle.id===id;}) || null;
}

function electionSeed(text) {
    var value=2166136261;
    for(var i=0;i<text.length;i++)value=Math.imul(value^text.charCodeAt(i),16777619);
    return value>>>0;
}

function electionRandom(seed) {
    return function(){seed=(seed+0x6D2B79F5)|0;var value=Math.imul(seed^(seed>>>15),1|seed);value^=value+Math.imul(value^(value>>>7),61|value);return ((value^(value>>>14))>>>0)/4294967296;};
}

// Largest remainders here distribute integer VOTES, not seats or mandates.
function distributeElectionVotes(total, weights) {
    var sum=weights.reduce(function(value,weight){return value+Math.max(0,weight);},0);
    if(!weights.length)return [];
    if(sum<=0)weights=weights.map(function(){return 1;});
    sum=weights.reduce(function(value,weight){return value+Math.max(0,weight);},0);
    var rows=weights.map(function(weight,index){var exact=total*Math.max(0,weight)/sum;return {index:index,votes:Math.floor(exact),remainder:exact-Math.floor(exact)};});
    var missing=total-rows.reduce(function(value,row){return value+row.votes;},0);
    rows.slice().sort(function(a,b){return b.remainder-a.remainder || a.index-b.index;}).slice(0,missing).forEach(function(row){row.votes++;});
    return rows.map(function(row){return row.votes;});
}

function electionNominees(gameState, partyId, catalogue) {
    var key=electionDayCycleId(gameState), lists=(gameState.electoralLists || []).filter(function(list){return list.partyId===partyId;});
    var list=lists.find(function(item){return item.cycleKey===key;});
    if(!list && partyId===gameState.playerParty)list=lists.find(function(item){return item.cycleKey==="preparation:"+gameState.mandateNumber;});
    var ids=list ? list.candidateIds.slice() : catalogue.filter(function(person){return candidateBelongsToParty(person,partyId);}).map(function(person){return person.id;});
    if(new Set(ids).size!==ids.length)throw Error("Lista e "+partyId+" përmban kandidatë të dyfishuar.");
    var nominees=ids.map(function(id,index){
        var person=catalogue.find(function(item){return item.id===id;});
        if(!candidateBelongsToParty(person,partyId))throw Error("Lista e "+partyId+" ka hyrje jashtë partisë. Korrigjojeni para hapjes së votimit.");
        return {id:person.id,name:candidateName(person),partyId:partyId,
            listNumber:list && currentElectionDraw(gameState)?index+1:Number.isInteger(person.listNumber)?person.listNumber:index+1,ballotPosition:index+1};
    });
    return {status:list?list.status:"REGISTRY_SIMULATION",candidates:nominees};
}

function buildElectionDayManifest(gameState) {
    var campaign=gameState.electionCampaign,catalogue=getCandidateCatalogue(gameState),latest=latestCampaignPoll(campaign);
    if(!latest)throw Error("Mungon sondazhi i regjistruar për këtë cikël.");
    var lastPerTurn={};
    campaign.polls.forEach(function(poll){if(poll&&poll.values)lastPerTurn[poll.turn]=poll;});
    var observations=Object.values(lastPerTurn);
    // A historical brochure entry does not automatically become an active election participant.
    var partyIds=electoralParticipantIds(gameState);
    var parties=partyIds.map(function(partyId){
        var party=gameState.parties[partyId],nominees=electionNominees(gameState,partyId,catalogue);
        var finalSupport=latest.values[partyId] || 0;
        var mean=observations.reduce(function(sum,poll){return sum+(poll.values[partyId] || 0);},0)/Math.max(1,observations.length);
        var performance=party&&!party.listManagementBaseline&&Number.isFinite(party.internalCohesion)?party.internalCohesion:50;
        return {partyId:partyId,name:party?party.name:partyId==="NISMA"?"NISMA Socialdemokrate":partyId,
            color:party?party.color:"#c2410c",lastPoll:finalSupport,meanPoll:mean,
            performance:performance,credibility:partyId===gameState.playerParty?campaign.credibility:50,
            listStatus:nominees.status,candidates:nominees.candidates};
    });
    var manifest={modelVersion:2,cycleId:electionDayCycleId(gameState),
        date:Object.assign({},campaign.electionCalendar),electionTurn:campaign.electionTurn,
        electorate:ELECTION_DAY_MODEL.electorate,parties:parties,
        campaign:{activities:campaign.activities.length,promises:campaign.programme.length,
            events:campaign.events.length,visibility:campaign.visibility,credibility:campaign.credibility,
            pollObservations:observations.length},preferenceModel:'SIMULATED_UP_TO_TEN',
        legalConfirmed:false};
    manifest.mediaEnvironment=mediaElectionEnvironment(gameState);manifest.listPriorityPolicy="TOP10_POOL30_V1";
    freezeCountPreparation(gameState,manifest);if(campaign.northMandate)manifest.northMandate=JSON.parse(JSON.stringify(campaign.northMandate));var sovereignPolicy=claimSovereignElection(gameState,manifest);if(sovereignPolicy)manifest.sovereignSupport=sovereignPolicy;var highwayPolicy=claimHighwayElection(gameState,manifest);if(highwayPolicy)manifest.highwaySupport=highwayPolicy;var boardPolicy=claimEnterpriseBoardElection(gameState,manifest);if(boardPolicy)manifest.enterpriseBoardBase=boardPolicy;var associationPolicy=claimAssociationElectionPolicy(gameState,manifest);if(associationPolicy)manifest.associationVerdict=associationPolicy;return manifest;
}

function prepareElectionDayCycle(gameState) {
    if(!Array.isArray(gameState.parliamentaryElections))gameState.parliamentaryElections=[];
    var existing=getElectionDayCycle(gameState);
    if(existing)return existing;
    if(!electionDayEligible(gameState))return null;
    // Freeze inputs once, including names and nominations; later roster edits cannot change votes.
    var manifest=buildElectionDayManifest(gameState);
    var embassy=claimDiasporaElectionBonus(gameState,'NATIONAL',manifest.cycleId,manifest.parties.map(p=>p.partyId));if(embassy)manifest.embassyMobilization=embassy;
    if(typeof freezeDiasporaPolicy==='function')manifest.diasporaPolicy=freezeDiasporaPolicy(gameState,manifest);
    var cycle={id:manifest.cycleId,manifest:manifest,seed:electionSeed(JSON.stringify(manifest)),
        status:"READY",votingProgress:0,countingProgress:0,results:null,
        openedAt:null,closedAt:null,completedAt:null};
    gameState.parliamentaryElections.push(cycle);
    return cycle;
}

function migrateElectionDayState(gameState) {
    if(typeof gameState.parliamentaryElections==="undefined")gameState.parliamentaryElections=[];
    // Old campaigns can contain obsolete list IDs. Keep the save loadable for correction.
    if(electionDayEligible(gameState)&&!getElectionDayCycle(gameState)){
        try{prepareElectionDayCycle(gameState);}catch(error){gameState.electionDayPreparationError=error.message;}
    }
}

function generateElectionDayResults(cycle) {
    if(cycle.manifest.modelVersion===2)return generateMultiPreferenceResults(cycle);
    var manifest=cycle.manifest,random=electionRandom(cycle.seed),info=manifest.campaign;
    var turnoutRate=Math.max(0.30,Math.min(0.70,ELECTION_DAY_MODEL.baseTurnout+
        Math.min(0.015,info.activities*0.0004)+Math.min(0.015,info.visibility*0.0003)+(random()-0.5)*0.04));
    var cast=Math.round(manifest.electorate*turnoutRate),invalid=Math.round(cast*(0.01+random()*0.02)),valid=cast-invalid;
    var weights=manifest.parties.map(function(party){
        var support=0.80*party.lastPoll+0.20*party.meanPoll;
        var performance=1+Math.max(-0.025,Math.min(0.025,(party.performance-50)*0.0005));
        var credibility=1+Math.max(-0.015,Math.min(0.015,(party.credibility-50)*0.0005));
        return Math.max(0,support*performance*credibility*(1+(manifest.mediaEnvironment?.[party.partyId]||0))*(1+(random()-0.5)*0.016));
    });
    var votes=distributeElectionVotes(valid,weights);votes=embassyAdjustedVotes(manifest.parties.map(p=>p.partyId),votes,valid,manifest.embassyMobilization,manifest.parties.map(p=>(manifest.preparedBallots||[]).filter(b=>b.partyId===p.partyId).length));
    votes=northGuaranteedVotes(manifest.parties.map(p=>p.partyId),votes,valid,manifest.northMandate,manifest.parties.map(p=>(manifest.preparedBallots||[]).filter(b=>b.partyId===p.partyId).length));
    votes=enterpriseBoardElectionVotes(manifest.parties.map(p=>p.partyId),votes,valid,manifest.enterpriseBoardBase,manifest.parties.map(p=>(manifest.preparedBallots||[]).filter(b=>b.partyId===p.partyId).length));
    votes=enterpriseBoardElectionVotes(manifest.parties.map(p=>p.partyId),votes,valid,manifest.highwaySupport,manifest.parties.map(p=>(manifest.preparedBallots||[]).filter(b=>b.partyId===p.partyId).length));
    votes=enterpriseBoardElectionVotes(manifest.parties.map(p=>p.partyId),votes,valid,manifest.sovereignSupport,manifest.parties.map(p=>(manifest.preparedBallots||[]).filter(b=>b.partyId===p.partyId).length));
    votes=associationElectionVotes(manifest.parties.map(p=>p.partyId),votes,valid,manifest.associationVerdict,manifest.parties.map(p=>(manifest.preparedBallots||[]).filter(b=>b.partyId===p.partyId).length));
    var parties=manifest.parties.map(function(party,index){
        var partyVotes=votes[index],assigned=party.candidates.length?Math.floor(partyVotes*ELECTION_DAY_MODEL.preferenceParticipation):0;
        var candidateWeights=party.candidates.map(function(candidate){return (1/(1+0.04*(candidate.ballotPosition-1)))*(0.9+random()*0.2);});
        var personal=distributeElectionVotes(assigned,candidateWeights);
        var candidates=party.candidates.map(function(candidate,i){return Object.assign({},candidate,{personalVotes:personal[i]});});
        candidates.sort(function(a,b){return b.personalVotes-a.personalVotes || a.ballotPosition-b.ballotPosition;});
        candidates.forEach(function(candidate,i){candidate.rank=i+1;});
        return {partyId:party.partyId,name:party.name,color:party.color,votes:partyVotes,
            percentage:valid?partyVotes/valid*100:0,candidates:candidates,
            unassignedPreferenceVotes:partyVotes-assigned,listStatus:party.listStatus};
    });
    parties.sort(function(a,b){return b.votes-a.votes || a.partyId.localeCompare(b.partyId);});
    parties.forEach(function(party,index){party.rank=index+1;party.gapVotes=index?parties[index-1].votes-party.votes:0;party.gapPercentage=index?parties[index-1].percentage-party.percentage:0;});
    return {cycleId:cycle.id,simulation:true,modelVersion:manifest.modelVersion,date:manifest.date,
        electorate:manifest.electorate,ballotsCast:cast,validVotes:valid,invalidVotes:invalid,
        nonParticipants:manifest.electorate-cast,turnoutPercent:cast/manifest.electorate*100,
        preferenceModel:manifest.preferenceModel,preferencesPerBallot:1,legalConfirmed:false,
        parties:parties,partyRanking:parties.map(function(party){return party.partyId;})};
}

function electionDayStamp() {return {year:state.year,monthIndex:state.monthIndex,week:state.week,turnCount:state.turnCount};}

function stopElectionDayAnimation() {if(electionDayTimer!==null)clearInterval(electionDayTimer);electionDayTimer=null;}

function hasOpenElectionProcess() {
    var cycle=state&&getElectionDayCycle(state);
    return !!cycle&&["VOTING","COUNTING"].includes(cycle.status);
}

function syncElectionDayAnimation() {
    var cycle=getElectionDayCycle(state);
    var running=cycle&&(cycle.status==="COUNTING" || cycle.status==="VOTING"&&cycle.votingProgress<100);
    if(!running){stopElectionDayAnimation();return;}
    if(electionDayTimer===null)electionDayTimer=setInterval(function(){advanceElectionDayProcess();},500);
}

function openElectionDayPanel() {
    if(!electionDayEligible(state)){showToast('Dita e zgjedhjeve kërkon fushatë të mbyllur dhe '+campaignDuration(state.electionCampaign)+' javë të përfunduara.');return false;}
    switchMainTab("tab-elections");
    switchSubTab("elec","voting",document.getElementById("electionDayTabBtn"));
    return true;
}

function openElectionVoting() {
    if(!electionDayEligible(state)||state.pendingVote){showToast("Votimi nuk mund të hapet para përfundimit të fushatës ose gjatë një votimi tjetër.");return false;}
    var cycle;
    try{cycle=prepareElectionDayCycle(state);}catch(error){showToast(error.message);return false;}
    if(cycle.status!=="READY"){openElectionDayPanel();showToast("Ky cikël zgjedhor është hapur tashmë. Rezultatet nuk gjenerohen sërish.");return false;}
    var previous=JSON.parse(JSON.stringify(cycle));
    try{cycle.results=generateElectionDayResults(cycle);}catch(error){showToast('Votimi nuk u hap: '+error.message);return false;}
    cycle.status="VOTING";cycle.openedAt=electionDayStamp();
    if(!saveGameAuto()){Object.assign(cycle,previous);return false;}
    toggleModal("majorEventModal",false);openElectionDayPanel();renderElectionDayPanel();
    showToast("Vendvotimet u hapën në simulim. Votat janë regjistruar vetëm një herë për këtë cikël.");return true;
}

function advanceElectionDayProcess() {
    var cycle=getElectionDayCycle(state);
    if(!cycle||!hasOpenElectionProcess())return false;
    var beforeState=JSON.stringify(state);
    var previous={status:cycle.status,votingProgress:cycle.votingProgress,countingProgress:cycle.countingProgress,completedAt:cycle.completedAt};
    if(cycle.status==="VOTING")cycle.votingProgress=Math.min(100,cycle.votingProgress+10);
    else {var domesticAlreadyComplete=cycle.countingProgress===100;cycle.countingProgress=Math.min(100,cycle.countingProgress+10);if(cycle.countingProgress===100 && (typeof advanceDiasporaCount!=='function'||advanceDiasporaCount(cycle,domesticAlreadyComplete))){cycle.status="RESULTS";cycle.completedAt=electionDayStamp();}}
    if(cycle.status==="RESULTS"){
        try{reconcilePostElection(state);migrateAssemblyState(state);if(!storeAssemblyReport(cycle,assemblyMetadata(state,cycle),{deferCommit:true}))throw Error("Mandatet nuk u regjistruan.");}
        catch(error){state=JSON.parse(beforeState);stopElectionDayAnimation();showToast(error.message);return false;}
    }
    if(!saveGameAuto()){state=JSON.parse(beforeState);stopElectionDayAnimation();return false;}
    if(cycle.status==="RESULTS"){
        var composition=getAssemblyComposition(),ready=composition?.status==='PUBLISHED';renderAssemblyComposition();renderPostElectionInvitation();if(ready)openConstituentSessionPanel();
        showMajorAnnouncement({badge:'ZGJEDHJET PËRFUNDUAN',title:ready?'Fillon konstituimi i Kuvendit':'Përbërja e Kuvendit kërkon plotësim',reason:ready?'U publikuan 120 mandate. Çdo grup parlamentar, përfshirë opozitën, mund të marrë pjesë në konstituim.':'Numërimi përfundoi, por ende nuk janë përcaktuar 120 mandate të vlefshme. Hapni përbërjen për të parë të dhënat që mungojnë.',immediateImpact:'Qeveria e mëparshme mbetet në detyrë me kompetenca të kufizuara. Kuvendi i ri nuk konstituohet automatikisht.',statsHtml:ready?'<button class="action-btn" onclick="openPostElectionTalks()">Hap ftesën për qeverisje</button><button class="action-btn" onclick="openConstituentSessionPanel()">Konstituimi i Kuvendit</button>':'<button class="action-btn" onclick="openElectionAssemblyResults()">Shqyrto përbërjen dhe të dhënat që mungojnë</button>'});
    }
    renderElectionDayPanel();return true;
}

function closeElectionVoting() {
    var cycle=getElectionDayCycle(state);
    if(!cycle||cycle.status!=="VOTING"||cycle.votingProgress!==100){showToast("Prisni përfundimin e procesit të votimit.");return false;}
    cycle.status="COUNTING";cycle.closedAt=electionDayStamp();
    if(!saveGameAuto()){cycle.status="VOTING";cycle.closedAt=null;return false;}
    renderElectionDayPanel();showToast("Vendvotimet u mbyllën. Filloi numërimi i votave të regjistruara.");return true;
}

function announceElectionDay() {
    var cycle=getElectionDayCycle(state);if(!cycle)return;
    showMajorAnnouncement({badge:"DITA E ZGJEDHJEVE — SIMULIM",title:"Hapet procesi i zgjedhjeve parlamentare",
        reason:"Data e simuluar: "+campaignCalendarLabel(cycle.manifest.date),
        statsHtml:'<button id="electionDayAnnouncementBtn" class="action-btn btn-gold" onclick="openElectionVoting()">Hape procesin e votimit</button>',
        immediateImpact:"Rezultatet janë të simulimit, jo të KQZ-së. Kjo fazë nuk ndan ulëse ose mandate."});
}

function renderElectionDayPanel() {
    var host=document.getElementById("electionDayPanel"),cycle=getElectionDayCycle(state),eligible=electionDayEligible(state);
    var pill=document.getElementById("electionDayTabBtn");if(pill)pill.disabled=!eligible;
    if(!host)return;
    if(!eligible){host.innerHTML='<p>Dita e zgjedhjeve aktivizohet pas përfundimit dhe mbylljes së fushatës trejavore.</p>';stopElectionDayAnimation();return;}
    if(!cycle){host.innerHTML='<div class="card"><h3>Kontrolloni listat zgjedhore</h3><p>'+electoralEscape(state.electionDayPreparationError||"Korrigjoni listën dhe provoni sërish.")+'</p><button class="action-btn" onclick="openElectionVoting()">Hape procesin e votimit</button></div>';return;}
    var opened=host.querySelectorAll?Array.from(host.querySelectorAll("details[open]")).map(function(detail){return detail.getAttribute("data-election-details");}):[];
    var labels={READY:"Gati për hapje",VOTING:"Vendvotimet janë të hapura",COUNTING:"Vendvotimet u mbyllën — numërimi në vazhdim",RESULTS:"Numërimi përfundoi"};
    var progress=cycle.status==="READY"?0:cycle.status==="VOTING"?cycle.votingProgress:cycle.countingProgress;
    var html='<div class="card election-day-header"><div class="card-header"><div class="card-title">Dita e zgjedhjeve</div><span class="tag tag-gold">'+labels[cycle.status]+'</span></div><p>'+campaignCalendarLabel(cycle.manifest.date)+'</p><p>Rezultate të simulimit — jo rezultate reale të KQZ-së.</p><small>Cikli: '+electoralEscape(cycle.id)+'</small><progress max="100" value="'+progress+'" aria-label="Përparimi i procesit zgjedhor"></progress>'+
        (cycle.status==="READY"?'<button id="openElectionVotingBtn" class="action-btn btn-gold" onclick="openElectionVoting()">Hape procesin e votimit</button>':'')+
        (cycle.status==="VOTING"?'<p>Votimi: '+cycle.votingProgress+'%</p><button class="action-btn" onclick="advanceElectionDayProcess()" '+(cycle.votingProgress===100?'disabled':'')+'>Avanco paraqitjen e votimit</button> <button id="closeElectionVotingBtn" class="action-btn btn-gold" onclick="closeElectionVoting()" '+(cycle.votingProgress<100?'disabled':'')+'>Mbyll vendvotimet dhe nis numërimin</button>':'')+
        (cycle.status==="COUNTING"?'<p class="election-counting" role="status">Numërimi: '+cycle.countingProgress+'%</p><button class="action-btn" onclick="advanceElectionDayProcess()">Avanco numërimin</button>':'')+'</div>';
    if(cycle.status==="READY"||cycle.status==="VOTING") {
        html+='<div class="card"><h3>Partitë dhe listat pjesëmarrëse</h3>'+cycle.manifest.parties.map(function(party){return '<details data-election-details="ballot:'+electoralEscape(party.partyId)+'"><summary>'+electoralEscape(party.name)+' — '+party.candidates.length+' kandidatë</summary><ol>'+party.candidates.map(function(candidate){return '<li value="'+candidate.listNumber+'">'+electoralEscape(candidateDisplayName(candidate,party.partyId))+'</li>';}).join('')+'</ol></details>';}).join('')+'</div>';
    } else {
        var results=cycle.results,fraction=cycle.countingProgress/100;
        html+='<div class="card"><h3>Rezultatet për partitë</h3><p>Elektorati i modelit: '+results.electorate.toLocaleString('sq-AL')+' (supozim simulimi, jo regjistër real). Pjesëmarrja: '+results.turnoutPercent.toFixed(2)+'% — '+results.ballotsCast.toLocaleString('sq-AL')+' votues.</p><p>Vota të vlefshme: '+results.validVotes.toLocaleString('sq-AL')+' · Të pavlefshme: '+results.invalidVotes.toLocaleString('sq-AL')+' · Mospjesëmarrje: '+results.nonParticipants.toLocaleString('sq-AL')+'</p>'+
            results.parties.map(function(party){return '<article class="candidate-card election-party-result" data-result-party="'+electoralEscape(party.partyId)+'"><strong>'+party.rank+'. '+electoralEscape(party.name)+'</strong><p>'+Math.floor(party.votes*fraction).toLocaleString('sq-AL')+' vota · '+(party.percentage*fraction).toFixed(2)+'%</p><div class="prog-track"><div class="prog-fill election-result-bar" style="width:'+(party.percentage*fraction)+'%"></div></div>'+
                (cycle.status==="RESULTS"?'<small>Diferenca nga partia paraprake: '+party.gapVotes.toLocaleString('sq-AL')+' vota · '+party.gapPercentage.toFixed(2)+' pikë përqindjeje</small><details class="election-candidate-results"><summary>Rezultatet e kandidatëve — '+electoralEscape(party.partyId)+' ('+party.candidates.length+')</summary><p>Model i simuluar. Preferencat sipas versionit të ruajtur të këtij cikli. Vota pa preferencë të caktuar: '+party.unassignedPreferenceVotes.toLocaleString('sq-AL')+'</p>'+party.candidates.map(function(candidate){return '<p data-candidate-party="'+electoralEscape(candidate.partyId)+'">'+candidate.rank+'. #'+candidate.listNumber+' '+electoralEscape(candidateDisplayName(candidate,party.partyId))+' — '+candidate.personalVotes.toLocaleString('sq-AL')+' vota personale të simuluara</p>';}).join('')+'</details>':'')+'</article>';}).join('')+'<p>Mandatet dhe deputetët paraqiten në panelin «Përbërja e Kuvendit».</p></div>';
    }
    if(cycle.manifest.diasporaPolicy && cycle.countingProgress===100)html+='<div class="card" id="diasporaCountStage"><h3>Numërimi i votave nga jashtë</h3><progress max="100" value="'+(cycle.diasporaCount?.progress||0)+'"></progress><p>'+(cycle.diasporaCount?.counted?'Numërimi përfundoi. Bonusi i simuluar i mandateve: '+cycle.manifest.diasporaPolicy.bonus:'Numërimi vazhdon…')+'</p></div>';
    if(cycle.status==='RESULTS' && cycle.manifest.modelVersion===2)html+=countingReportHtml(cycle);
    if(cycle.status==="RESULTS") html+='<button id="viewAssemblyCompositionBtn" class="action-btn btn-gold" onclick="openAssemblyComposition()">Përbërja e Kuvendit — kontrollo mandatet</button>';
    host.innerHTML=html;
    if(host.querySelectorAll)host.querySelectorAll("details[data-election-details]").forEach(function(detail){if(opened.includes(detail.getAttribute("data-election-details")))detail.open=true;});
    syncElectionDayAnimation();
}

function validateElectionDayState(gameState) {
    if(typeof gameState.parliamentaryElections==="undefined")return;
    if(!Array.isArray(gameState.parliamentaryElections))throw Error("Regjistri i zgjedhjeve është i pavlefshëm");
    var ids=new Set();
    gameState.parliamentaryElections.forEach(function(cycle){
        if(!cycle||typeof cycle.id!=="string"||ids.has(cycle.id)||!["READY","VOTING","COUNTING","RESULTS"].includes(cycle.status)||!Number.isInteger(cycle.seed)||!cycle.manifest||cycle.manifest.cycleId!==cycle.id||!Array.isArray(cycle.manifest.parties)||!cycle.manifest.parties.length)throw Error("Cikli zgjedhor është i dëmtuar");
        ids.add(cycle.id);
        if(cycle.seed<0||cycle.seed>4294967295||cycle.seed!==electionSeed(JSON.stringify(cycle.manifest))||![1,2].includes(cycle.manifest.modelVersion)||cycle.manifest.legalConfirmed!==false||cycle.manifest.preferenceModel!==(cycle.manifest.modelVersion===2?'SIMULATED_UP_TO_TEN':ELECTION_DAY_MODEL.preferenceModel))throw Error("Pamja e ngrirë e zgjedhjeve është ndryshuar ose është e pavlefshme");
        ["votingProgress","countingProgress"].forEach(function(key){if(!Number.isInteger(cycle[key])||cycle[key]<0||cycle[key]>100)throw Error("Progresi zgjedhor është i pavlefshëm");});
        if(cycle.status==="READY"&&(cycle.votingProgress!==0||cycle.countingProgress!==0)||cycle.status==="VOTING"&&cycle.countingProgress!==0||cycle.status==="COUNTING"&&cycle.votingProgress!==100)throw Error("Faza dhe progresi zgjedhor nuk përputhen");
        var parties=new Set(),candidates=new Set(),date=cycle.manifest.date;
        if(!date||!Number.isInteger(date.year)||!Number.isInteger(date.monthIndex)||date.monthIndex<0||date.monthIndex>11||!Number.isInteger(date.week)||date.week<1||date.week>4||!Number.isSafeInteger(cycle.manifest.electorate)||cycle.manifest.electorate<1)throw Error("Kalendari ose elektorati zgjedhor është i pavlefshëm");
        cycle.manifest.parties.forEach(function(party){
            if(typeof party.partyId!=="string"||parties.has(party.partyId)||typeof party.name!=="string"||!Array.isArray(party.candidates))throw Error("Partia zgjedhore është e pavlefshme");parties.add(party.partyId);
            ["lastPoll","meanPoll","performance","credibility"].forEach(function(key){if(!Number.isFinite(party[key])||party[key]<0||party[key]>100)throw Error("Faktorët e simulimit janë të pavlefshëm");});
            party.candidates.forEach(function(candidate){if(typeof candidate.id!=="string"||candidates.has(candidate.id)||candidate.partyId!==party.partyId||typeof candidate.name!=="string"||!Number.isInteger(candidate.listNumber)||candidate.listNumber<1)throw Error("Lista zgjedhore e ngrirë është e pavlefshme");candidates.add(candidate.id);});
        });
        if(cycle.status==="READY"){if(cycle.results!==null)throw Error("Cikli i pahapur përmban rezultate të papritura");return;}
        var results=cycle.results;
        if(!results||results.cycleId!==cycle.id||results.simulation!==true||results.legalConfirmed!==false||results.preferenceModel!==cycle.manifest.preferenceModel||results.preferencesPerBallot!==(cycle.manifest.modelVersion===2?10:1)||!Array.isArray(results.parties)||results.parties.length!==parties.size||!Array.isArray(results.partyRanking)||results.partyRanking.length!==parties.size)throw Error("Mungojnë rezultatet e ruajtura");
        ["electorate","ballotsCast","validVotes","invalidVotes","nonParticipants"].forEach(function(key){if(!Number.isSafeInteger(results[key])||results[key]<0)throw Error("Numri i votave është i pavlefshëm");});
        if(results.electorate!==cycle.manifest.electorate||results.ballotsCast!==results.validVotes+results.invalidVotes||results.electorate!==results.ballotsCast+results.nonParticipants||Math.abs(results.turnoutPercent-results.ballotsCast/results.electorate*100)>0.000001)throw Error("Pjesëmarrja dhe votat nuk përputhen");
        var total=0,seenParties=new Set();
        results.parties.forEach(function(party,index){
            var original=cycle.manifest.parties.find(function(item){return item.partyId===party.partyId;});
            if(!original||party.name!==original.name||seenParties.has(party.partyId)||!Number.isSafeInteger(party.votes)||party.votes<0||party.rank!==index+1||results.partyRanking[index]!==party.partyId||!Array.isArray(party.candidates)||party.candidates.length!==original.candidates.length||!Number.isFinite(party.percentage)||Math.abs(party.percentage-(results.validVotes?party.votes/results.validVotes*100:0))>0.000001)throw Error("Rezultati i partisë është i pavlefshëm");
            if(!Number.isFinite(party.gapVotes)||!Number.isFinite(party.gapPercentage)||party.gapVotes!==(index?results.parties[index-1].votes-party.votes:0)||Math.abs(party.gapPercentage-(index?results.parties[index-1].percentage-party.percentage:0))>0.000001)throw Error("Diferencat mes partive nuk përputhen");
            seenParties.add(party.partyId);total+=party.votes;var personal=0,seenCandidates=new Set(),missingPersonal=false;
            party.candidates.forEach(function(candidate,i){
                var nominee=original.candidates.find(function(item){return item.id===candidate.id;});
                var missing=candidate.personalVotes===null || typeof candidate.personalVotes==="undefined";
                if(!nominee||seenCandidates.has(candidate.id)||candidate.partyId!==party.partyId||candidate.name!==nominee.name||candidate.listNumber!==nominee.listNumber||!missing && (!Number.isSafeInteger(candidate.personalVotes)||candidate.personalVotes<0)||candidate.rank!==i+1||(!missing && i>0 && Number.isSafeInteger(party.candidates[i-1].personalVotes) && candidate.personalVotes>party.candidates[i-1].personalVotes))throw Error("Votat personale janë të pavlefshme");
                seenCandidates.add(candidate.id);if(missing)missingPersonal=true;else personal+=candidate.personalVotes;
            });
            if(!Number.isSafeInteger(party.unassignedPreferenceVotes)||party.unassignedPreferenceVotes<0||party.unassignedPreferenceVotes>party.votes || cycle.manifest.modelVersion===1 && (personal+party.unassignedPreferenceVotes>party.votes||!missingPersonal && personal+party.unassignedPreferenceVotes!==party.votes))throw Error("Preferencat tejkalojnë votat e subjektit");
            if(index>0&&party.votes>results.parties[index-1].votes)throw Error("Renditja e partive është e pavlefshme");
        });
        if(total!==results.validVotes)throw Error("Shuma e votave të partive nuk përputhet");
        if(cycle.manifest.modelVersion===2)validateMultiPreferenceResults(cycle);
        if(cycle.status==="RESULTS"&&(cycle.countingProgress!==100||cycle.votingProgress!==100))throw Error("Rezultatet nuk kanë progres të plotë");
    });
}
