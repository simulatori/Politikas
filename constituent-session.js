/* Phase 6: persistent procedural state; no government appointment or negotiations. */
const CONSTITUENT_RULES = Object.freeze({version:1,total:120,requiredVotes:61,speakerCandidateLimit:3,
    votingMode:"OPEN",completion:"SPEAKER_AND_FIVE_DEPUTIES",legalConfirmed:false,
    explanation:"Rregullat bazë kushtetuese janë verifikuar. Zbatimi i precedentit të vitit 2025, votimet e ndara të nënkryetarëve dhe thjeshtimet procedurale janë konfigurim simulimi; nuk janë certifikim ligjor."});
let constituentTimer = null;

function migrateConstituentState(st) {
    if (typeof st.constituentSessions==="undefined") st.constituentSessions=[];
    var active=currentConstituentSession(st);
    if(active && syncAutomaticConstituentProposal(st,active,constituentComposition(st)))sealConstituentSession(active);
    if(st.mode!=="ALT_POST_ELECTION" || st.initialConstituentContext || st.assemblyConstituted || st.electionCampaign || getElectionDayCycle(st))return;
    if(!Array.isArray(st.mps) || st.mps.length!==120 || new Set(st.mps.map(function(mp){return mp.seatNumber;})).size!==120)return;
    var mandates=Object.keys(st.parties).map(function(id){var p=st.parties[id];return {partyId:id,name:p.name,total:p.seats,votes:null,community:p.community};});
    if(mandates.reduce(function(n,p){return n+p.total;},0)!==120 || mandates.some(function(p){return st.mps.filter(function(mp){return mp.party===p.partyId;}).length!==p.total;}))return;
    var id="scenario:ALT_POST_ELECTION:"+st.mandateNumber;
    var composition={version:1,cycleId:id,status:"SCENARIO",source:"INITIAL_SCENARIO",legalConfirmed:false,mandates:mandates,
        deputies:st.mps.map(function(mp){return {candidateId:"scenario:"+st.mandateNumber+":"+mp.seatNumber,name:mp.name,partyId:mp.party,seatNumber:mp.seatNumber,
            gender:mp.gender,listNumber:null,personalVotes:null,community:mp.party==="SL"?"SERB":mp.party==="MIN_MULTI"?"LEGACY_MULTI":"GENERAL",seatType:["SL","MIN_MULTI"].includes(mp.party)?"GUARANTEED":"GENERAL"};})};
    composition.integrity=electionSeed(JSON.stringify(composition));
    st.initialConstituentContext={cycle:{id:id,seed:composition.integrity,source:"INITIAL_SCENARIO"},composition:composition};
}
function constituentCycle(st) {return getElectionDayCycle(st) || (!st.electionCampaign && st.initialConstituentContext ? st.initialConstituentContext.cycle : null);}
function constituentCompositionById(st,id) {return (st.assemblyCompositions || []).find(function(c){return c.cycleId===id;}) || (st.initialConstituentContext && st.initialConstituentContext.cycle.id===id ? st.initialConstituentContext.composition : null);}
function currentConstituentSession(st) {
    st=st || state;var cycle=constituentCycle(st);
    return cycle && (st.constituentSessions || []).find(function(s){return s.cycleId===cycle.id;}) || null;
}
function constituentComposition(st) {
    var cycle=constituentCycle(st);
    return cycle && constituentCompositionById(st,cycle.id) || null;
}
function constituentPrerequisite(st) {
    var cycle=constituentCycle(st),composition=constituentComposition(st);
    if(cycle && cycle.source==="INITIAL_SCENARIO") {
        try {validateInitialConstituentContext(st);}catch(error){return error.message;}
        return null;
    }
    if (!cycle || cycle.status!=="RESULTS" || !cycle.results) return "Seanca mund të hapet pas përfundimit të zgjedhjeve dhe numërimit të votave.";
    if (!composition || composition.status!=="PUBLISHED") return "Para hapjes së seancës duhet të përfundojë ndarja e mandateve për të 120 deputetët.";
    try {validateElectionDayState(st);validateAssemblyState(st);} catch(error){return "Të dhënat zgjedhore nuk janë të vlefshme: "+error.message;}
    if (composition.deputies.length!==120) return "Kërkohen saktësisht 120 deputetë unikë me mandate të publikuara.";
    return null;
}
function constituentGovernmentGate(silent) {
    var cycle=constituentCycle(state);
    if (!cycle) return true;
    var session=currentConstituentSession();
    if (session && session.status==="COMPLETED") return true;
    if (!silent) showToast("Formimi i Qeverisë është i bllokuar deri në përfundimin e seancës konstituive dhe zgjedhjen e Kryesisë së plotë.");
    return false;
}
// Political talks use the published election, independently of formal appointment.
function coalitionNegotiationContext() {
    var cycle=constituentCycle(state),composition=constituentComposition(state);
    if(cycle && constituentPrerequisite(state))return null;
    var groups=composition && constituentGroups(composition);
    if(groups && groups[1] && groups[0].total===groups[1].total && groups[0].votes===groups[1].votes && !state.mandatar)return null;
    var leader=state.mandatar || (groups && groups[0] && groups[0].partyId);
    return leader && state.parties[leader]?{leader:leader,composition:composition}:null;
}
function coalitionPartySeats(id) {
    var c=constituentComposition(state),p=c && c.mandates.find(function(p){return p.partyId===id;});
    return c?(p?p.total:0):(state.parties[id]?state.parties[id].seats:0);
}
function coalitionTalkAllowed(id,silent) {
    var context=coalitionNegotiationContext();
    var ok=!!(context && coalitionPartySeats(state.playerParty)>0 && (!id || id!==state.playerParty && state.parties[id] && coalitionPartySeats(id)>0 && (context.leader===state.playerParty || context.leader===id)));
    if(!ok && !silent)showToast("Negociatat kërkojnë rezultate dhe mandate të vlefshme. Negocioni me subjektin që udhëheq krijimin e shumicës.");
    return ok;
}
function constituentGroups(composition) {
    return composition.mandates.filter(function(p){return p.total>0;}).slice().sort(function(a,b){return b.total-a.total || b.votes-a.votes || a.partyId.localeCompare(b.partyId);});
}
function constituentOffice(session) {
    return ["SPEAKER","VICE_1","VICE_2","VICE_3","VICE_SERB","VICE_OTHER"].find(function(key){return !session.elected[key];}) || null;
}
function constituentOfficeLabel(office) {
    return {SPEAKER:"Kryetari i Kuvendit",VICE_1:"Nënkryetari i subjektit të parë",VICE_2:"Nënkryetari i subjektit të dytë",VICE_3:"Nënkryetari i subjektit të tretë",VICE_SERB:"Nënkryetari nga komuniteti serb",VICE_OTHER:"Nënkryetari nga komunitetet e tjera"}[office] || "Kryesia e Kuvendit";
}
function constituentNominees(session,composition,office) {
    var used=Object.values(session.elected).map(function(e){return e.candidateId;}),groups=constituentGroups(composition);
    if (office==="SPEAKER" && groups[1] && groups[0].total===groups[1].total && groups[0].votes===groups[1].votes) return []; // No invented speaker tie procedure.
    if (office.startsWith("VICE_") && ["VICE_1","VICE_2","VICE_3"].includes(office)) {
        var index=Number(office.slice(-1))-1;
        if (!groups[index] || groups[index+1] && groups[index].total===groups[index+1].total && groups[index].votes===groups[index+1].votes) return [];
    }
    return composition.deputies.filter(function(mp){
        if (used.includes(mp.candidateId)) return false;
        if(office==='SPEAKER' && reservedPrimeMinisterCandidate(mp,composition))return false;
        if (office==="SPEAKER") return mp.partyId===groups[0].partyId;
        if (["VICE_1","VICE_2","VICE_3"].includes(office)) {
            var index=Number(office.slice(-1))-1;
            return mp.partyId===groups[index].partyId && (office!=="VICE_1" || (!["M","F"].includes(mp.gender) || !["M","F"].includes(session.elected.SPEAKER?.gender) || mp.gender!==session.elected.SPEAKER.gender));
        }
        return mp.seatType==="GUARANTEED" && (office==="VICE_SERB" ? mp.community==="SERB" : !["GENERAL","SERB"].includes(mp.community));
    });
}
function constituentSigners(composition,office) {
    return composition.deputies.filter(function(mp){return mp.seatType==="GUARANTEED" && (office==="VICE_SERB"?mp.community==="SERB":!["GENERAL","SERB"].includes(mp.community));});
}
function constituentStamp() {return {year:state.year,monthIndex:state.monthIndex,week:state.week,turnCount:state.turnCount};}
// Reconcile existing records without inferring authority from the visible screen.
function reconcilePostElection(st) {
    var cycle=getElectionDayCycle(st);if(!cycle || cycle.status!=="RESULTS")return;
    var session=currentConstituentSession(st),c=constituentComposition(st);
    if(!cycle.institutionalTransitionAt){
        cycle.institutionalTransitionAt=JSON.parse(JSON.stringify(cycle.completedAt || cycle.manifest.date));
        var previous=st.electionCampaign?.previousGovernment;
        st.previousGovernment={primeMinister:previous?previous.primeMinister:st.primeMinister,coalitionParties:(previous?previous.coalitionParties:st.coalitionParties||[]).slice(),ministries:JSON.parse(JSON.stringify(previous?previous.ministries:st.ministries)),status:"CARETAKER",since:cycle.institutionalTransitionAt,cycleId:cycle.id};
        st.governmentFormationAttempts=[];
        st.coalitionParties=[];st.coalitionAgreements=[];
    }
    if(c?.status==="PUBLISHED"){st.winningParty=constituentGroups(c)[0].partyId;if(!st.coalitionParties.length)st.coalitionParties=[st.winningParty];}
    if(session && session.status==="COMPLETED")return;
    st.governmentFormed=false;st.governmentStatus="CARETAKER";
    st.assemblyConstituted=false;st.speakerElected=!!(session && session.elected.SPEAKER);
    st.mandatar=null;st.cabinetApproved=false;st.cabinetProposal=null;
    st.institutionalPhase=session?"ASSEMBLY_CONSTITUTING":c && c.status==="PUBLISHED"?"ASSEMBLY_AWAITING_CONSTITUTION":"RESULTS_PENDING_VALIDATION";
    if(c && c.status==="PUBLISHED" && !cycle.validatedAt)cycle.validatedAt={year:st.year,monthIndex:st.monthIndex,week:st.week,turnCount:st.turnCount};
}
function appointGovernmentMandatar(partyId){
    if(!assertAssemblyFunctional("Mandatimi") || state.governmentFormed || state.mandatar || state.pendingVote)return false;
    var groups=constituentGroups(constituentComposition(state)),attempts=state.governmentFormationAttempts || [];
    if(attempts.length>=2){showToast("Dy tentativa dështuan. Presidenti duhet të shpallë zgjedhje të reja, që mbahen brenda 40 ditësh.");return false;}
    var id=attempts.length?partyId || (getCoalitionSeats()>=61?state.coalitionParties[0]:null):groups[0].partyId;
    if(!id || !state.parties[id] || !state.parties[id].seats || attempts.length && (!state.coalitionParties.includes(id) || getCoalitionSeats()<61)){
        showToast("Për kandidatin e dytë kërkohet marrëveshje me të paktën 61 mandate. Vazhdoni negociatat.");return false;
    }
    var before=JSON.stringify(state);
    state.mandatar=id;state.institutionalPhase="GOV_FORMATION";state.governmentStatus="CARETAKER";
    if(!attempts.length && !state.coalitionParties.includes(id)){state.coalitionParties=[id];state.coalitionAgreements=[];}
    state.governmentFormationAttempts=attempts;attempts.push({partyId:id,appointedAt:constituentStamp(),status:"PENDING",deadlineDays:15});
    if(!saveGameAuto()){state=JSON.parse(before);return false;}refreshAllUI();return true;
}
function checkGovernmentFormationDeadline(){
    var attempt=(state.governmentFormationAttempts || []).slice(-1)[0];
    if(attempt && attempt.status==="PENDING" && !state.governmentFormed && (state.turnCount-attempt.appointedAt.turnCount)*7>15){
        attempt.status="EXPIRED";attempt.decidedAt=constituentStamp();
        state.mandatar=null;state.cabinetApproved=false;state.cabinetProposal=null;
        state.institutionalPhase="ASSEMBLY_CONSTITUTED";state.governmentStatus="CARETAKER";
        if(state.previousGovernment)state.primeMinister=state.previousGovernment.primeMinister;
        showToast("Skadoi afati 15-ditor për kabinetin. Vazhdoni te mandatimi i dytë ose shpallja e zgjedhjeve.");
    }
}
function validateGovernmentFormation(st){
    if(st.governmentFormationAttempts===undefined)return;
    var attempts=st.governmentFormationAttempts;
    if(!Array.isArray(attempts) || attempts.length>2 || attempts.some(function(a,i){return !a || typeof a.partyId!=="string" || !a.appointedAt || !Number.isInteger(a.appointedAt.turnCount) || !["PENDING","APPROVED","FAILED","EXPIRED"].includes(a.status) || i<attempts.length-1 && a.status==="PENDING";}))throw Error("Regjistri i mandatimit është i pavlefshëm.");
    var last=attempts[attempts.length-1];
    if(last && last.status==="PENDING" && (st.mandatar!==last.partyId || st.governmentFormed))throw Error("Mandatari nuk përputhet me emërimin ose Qeveria u aktivizua para votimit.");
}
function sealConstituentSession(s) {delete s.integrity;s.integrity=electionSeed(JSON.stringify(s));}
function playerNominatesConstituent(st,s,c,office) {
    if(["VICE_SERB","VICE_OTHER"].includes(office))return false;
    var nominees=constituentNominees(s,c,office);
    return nominees.length>0 && nominees[0].partyId===st.playerParty;
}
function syncAutomaticConstituentProposal(st,s,c) {
    if(!s || !c || s.status!=="IN_PROGRESS" || s.stage!=="ELECTIONS" || s.rounds.some(function(r){return r.revealed<120;}))return false;
    var office=constituentOffice(s);if(!office || playerNominatesConstituent(st,s,c,office))return false;
    if(s.proposal?.automatic&&s.proposal.office==='SPEAKER'&&reservedPrimeMinisterCandidate(s.proposal.candidate,c))s.proposal=null;
    if(s.proposal && s.proposal.automatic===true)return false;
    var nominees=constituentNominees(s,c,office).filter(function(mp){return office!=="SPEAKER" || s.rounds.filter(function(r){return r.office===office && r.candidate.candidateId===mp.candidateId;}).length<CONSTITUENT_RULES.speakerCandidateLimit;});
    if(!nominees.length)return false;
    var previousRounds=s.rounds.filter(function(r){return r.office===office;}).length;
    var candidate=nominees[office==="SPEAKER"?0:previousRounds%nominees.length],signers=[];
    if(["VICE_SERB","VICE_OTHER"].includes(office)) {
        var pool=constituentSigners(c,office).slice().sort(function(a,b){return Number(b.partyId===candidate.partyId)-Number(a.partyId===candidate.partyId) || a.seatNumber-b.seatNumber;});
        signers=pool.slice(0,Math.floor(pool.length/2)+1).map(function(mp){return mp.candidateId;});
    }
    s.proposal={id:s.cycleId+":nomination:"+(s.nominations.length+1),office:office,candidate:JSON.parse(JSON.stringify(candidate)),signerIds:signers,playerStance:"abstenim",automatic:true,
        at:{year:st.year,monthIndex:st.monthIndex,week:st.week,turnCount:st.turnCount}};
    s.nominations.push(JSON.parse(JSON.stringify(s.proposal)));return true;
}
function constituentCommit(change) {
    var before=JSON.stringify(state);
    try {
        change();var s=currentConstituentSession();if(s){syncAutomaticConstituentProposal(state,s,constituentComposition(state));sealConstituentSession(s);}
        validateConstituentState(state);
        if (!saveGameAuto()) {state=JSON.parse(before);return false;}
    } catch(error) {state=JSON.parse(before);showToast("Veprimi nuk u regjistrua: "+error.message);return false;}
    if(currentConstituentSession()?.status==='COMPLETED')refreshAllUI();
    else {renderConstituentSession();updateTopBar();renderPostElectionInvitation();}
    return true;
}
function startConstituentSession() {
    var problem=constituentPrerequisite(state);
    if(problem){showToast(problem);return false;}
    if(currentConstituentSession() || state.pendingVote){showToast("Seanca është hapur tashmë ose një votim tjetër është në zhvillim.");return false;}
    return constituentCommit(function(){
        migrateConstituentState(state);
        var c=constituentComposition(state);
        state.constituentSessions.push({version:1,cycleId:c.cycleId,assemblyIntegrity:c.integrity,rules:JSON.parse(JSON.stringify(CONSTITUENT_RULES)),
            status:"IN_PROGRESS",stage:"VERIFY",openedAt:constituentStamp(),completedAt:null,
            verification:null,oath:null,proposal:null,nominations:[],rounds:[],elected:{},
            previousLegislature:{mps:state.mps,partySeats:Object.fromEntries(Object.entries(state.parties).map(function(entry){return [entry[0],entry[1].seats];})),
                speaker:state.speakerOfAssembly,mandatar:state.mandatar,winningParty:state.winningParty,coalitionParties:state.coalitionParties,coalitionAgreements:state.coalitionAgreements,cabinetProposal:state.cabinetProposal}});
        var opened=currentConstituentSession();opened.previousLegislature=JSON.parse(JSON.stringify(opened.previousLegislature));
        state.assemblyConstituted=false;state.speakerElected=false;state.speakerOfAssembly="Në pritje të zgjedhjes së Kryetarit";
        state.institutionalPhase="ASSEMBLY_CONSTITUTING";state.governmentFormed=false;state.governmentStatus="CARETAKER";
        if(c.source!=="INITIAL_SCENARIO")state.mandatar=null;
        state.cabinetApproved=false;state.cabinetProposal=null;
    });
}
function verifyConstituentMandates() {
    var s=currentConstituentSession();if(!s || s.stage!=="VERIFY")return false;
    return constituentCommit(function(){s.verification={candidateIds:constituentComposition(state).deputies.map(function(mp){return mp.candidateId;}),at:constituentStamp(),simulatedPresence:120};s.stage="OATH";});
}
function recordConstituentOath() {
    var s=currentConstituentSession();if(!s || s.stage!=="OATH")return false;
    return constituentCommit(function(){s.oath={candidateIds:s.verification.candidateIds.slice(),at:constituentStamp(),simulation:true};s.stage="ELECTIONS";});
}
function proposeConstituentCandidate(candidateId,signerIds,stance) {
    var s=currentConstituentSession(),c=constituentComposition(state);
    if(!s || s.stage!=="ELECTIONS" || s.status!=="IN_PROGRESS" || s.rounds.some(function(r){return r.revealed<120;})){showToast("Përfundoni hapat proceduralë dhe numërimin aktual.");return false;}
    var office=constituentOffice(s),mp=constituentNominees(s,c,office).find(function(mp){return mp.candidateId===candidateId;});
    if(!playerNominatesConstituent(state,s,c,office)){showToast("Kandidatin për këtë post e propozon subjekti përkatës. Ju zgjidhni votën tuaj.");return false;}
    if(!mp){showToast("Kandidati duhet të jetë deputet i zgjedhur nga subjekti ose kategoria me të drejtë propozimi për këtë post.");return false;}
    if(office==="SPEAKER" && s.rounds.filter(function(r){return r.office===office && r.candidate.candidateId===candidateId;}).length>=CONSTITUENT_RULES.speakerCandidateLimit){showToast("Ky kandidat është votuar tri herë. Propozoni një kandidat tjetër të subjektit përkatës.");return false;}
    signerIds=signerIds || [];
    if(["VICE_SERB","VICE_OTHER"].includes(office)) {
        var pool=constituentSigners(c,office);
        if(new Set(signerIds).size!==signerIds.length || signerIds.some(function(id){return !pool.some(function(mp){return mp.candidateId===id;});}) || signerIds.length<=pool.length/2){showToast("Kërkohet propozimi i nënshkruar nga shumica e deputetëve përkatës të komuniteteve. Shorti nuk zbatohet automatikisht.");return false;}
    } else if(signerIds.length){showToast("Nënshkrimet e komuniteteve përdoren vetëm për postet përkatëse.");return false;}
    if(!["pro","kunder","abstenim"].includes(stance)){showToast("Zgjidhni qëndrimin e partisë suaj për këtë votim.");return false;}
    return constituentCommit(function(){s.proposal={id:s.cycleId+":nomination:"+(s.nominations.length+1),office:office,candidate:JSON.parse(JSON.stringify(mp)),signerIds:signerIds.slice(),playerStance:stance,at:constituentStamp()};s.nominations.push(JSON.parse(JSON.stringify(s.proposal)));});
}
function proposeConstituentFromPanel() {
    var candidate=document.getElementById("constituentCandidate");
    return candidate?proposeConstituentCandidate(candidate.value,[],"abstenim"):false;
}
function generateConstituentBallots(st,session,composition,proposal) {
    var cycle=constituentCycle(st),candidate=proposal.candidate;
    var scenarioCoalition= (st.coalitionParties || []).includes(candidate.partyId) &&
        (st.coalitionAgreements || []).some(function(a){return a.honored===true && (st.coalitionParties || []).includes(a.partner);});
    var ballots=composition.deputies.map(function(mp){
        var roll=assemblyDraw(cycle.seed,proposal.id+":"+mp.candidateId)%1000/1000,choice;
        var party=st.parties[mp.partyId],relation=party && party.relations && party.relations[candidate.partyId];
        relation=Number.isFinite(relation)?Math.max(0,Math.min(100,relation)):50;
        if(mp.partyId===st.playerParty) choice=proposal.playerStance;
        else if(mp.partyId===candidate.partyId) choice="pro";
        else if(scenarioCoalition && st.coalitionParties.includes(mp.partyId))choice="pro";
        else if(roll<0.01)choice="mungese";
        else if(proposal.office!=="SPEAKER")choice=roll<0.82?"pro":roll<0.92?"abstenim":"kunder";
        else choice=roll<Math.max(0.02,(relation-45)/70)?"pro":roll<0.40?"abstenim":"kunder";
        return {candidateId:mp.candidateId,partyId:mp.partyId,choice:choice};
    });
    var counts={pro:0,kunder:0,abstenim:0,mungese:0};ballots.forEach(function(b){counts[b.choice]++;});
    return {ballots:ballots,counts:counts,passed:counts.pro>=CONSTITUENT_RULES.requiredVotes};
}
function voteConstituentProposal(stance) {
    var s=currentConstituentSession();
    if(!s || !s.proposal || s.status!=="IN_PROGRESS" || s.stage!=="ELECTIONS" || state.pendingVote || s.rounds.some(function(r){return r.revealed<120;})){showToast("Regjistroni fillimisht një propozim të vlefshëm dhe përfundoni votimin në vazhdim.");return false;}
    return constituentCommit(function(){
        var proposal=s.proposal;
        if(typeof stance!=="undefined") {
            if(!["pro","kunder","abstenim"].includes(stance))throw Error("Zgjidhni pro, kundër ose abstenim.");
            proposal.playerStance=stance;
            s.nominations.find(function(p){return p.id===proposal.id;}).playerStance=stance;
        }
        var result=generateConstituentBallots(state,s,constituentComposition(state),proposal);
        s.rounds.push({id:s.cycleId+":round:"+(s.rounds.length+1),office:proposal.office,candidate:proposal.candidate,proposalId:proposal.id,
            result:result,revealed:120,finalized:true,at:constituentStamp()});s.proposal=null;
        if(result.passed){s.elected[proposal.office]=JSON.parse(JSON.stringify(proposal.candidate));if(proposal.office==='SPEAKER'){state.speakerElected=true;state.speakerOfAssembly=proposal.candidate.name+' ('+proposal.candidate.partyId+')';state.speakerElectionWeek=state.turnCount;}}
        if(!constituentOffice(s))activateConstitutedAssembly(s);
    });
}
function activateConstitutedAssembly(session) {
    var composition=constituentComposition(state),cycle=constituentCycle(state);
    var initialScenario=composition.source==="INITIAL_SCENARIO";
    if(!initialScenario){
    Object.values(state.parties).forEach(function(p){p.seats=0;});
    composition.mandates.forEach(function(p){
        if(!state.parties[p.partyId] && p.total){
            var source=cycle.results.parties.find(function(r){return r.partyId===p.partyId;});
            // Technical adapter for an elected subject absent from the previous legislature.
            state.parties[p.partyId]={id:p.partyId,name:p.name,short:p.partyId,color:source.color || "#64748b",tagClass:"tag-sl",seats:0,poll:source.percentage,
                leader:"I papërcaktuar",deputyLeaders:[],orgSecretary:"I papërcaktuar",community:p.community,ideology:"E papërcaktuar",euStance:0,usStance:0,dialogueStance:"E papërcaktuar",
                partyDiscipline:50,internalCohesion:50,partyFunds:0,relations:{},candidates:[],reserves:[],simulationDefaults:true};
        }
        if(state.parties[p.partyId])state.parties[p.partyId].seats=p.total;
    });
    state.mps=composition.deputies.map(function(mp){return Object.assign({},mp,{party:mp.partyId,region:"Pa të dhëna",loyalty:50,trustPlayer:50,
        role:"Deputet i zgjedhur — "+mp.partyId,stance:"Profil i simulimit; qëndrimi i papërcaktuar",ambition:"E papërcaktuar",rebelRisk:false,promisedVoteNext:false,simulationDefaults:true,
        votingHistory:session.rounds.map(function(r){var b=r.result.ballots.find(function(b){return b.candidateId===mp.candidateId;});return constituentOfficeLabel(r.office)+": "+{pro:"pro",kunder:"kundër",abstenim:"abstenim",mungese:"mungesë"}[b.choice];}),meetingHistory:[]});});
    }
    else state.mps.forEach(function(mp){var elected=composition.deputies.find(function(d){return d.seatNumber===mp.seatNumber;});mp.candidateId=elected.candidateId;});
    state.assemblyConstituted=true;state.speakerElected=true;state.speakerOfAssembly=session.elected.SPEAKER.name+" ("+session.elected.SPEAKER.partyId+")";
    state.speakerElectionWeek=state.turnCount;state.assemblyCycleId=session.cycleId;state.institutionalPhase="ASSEMBLY_CONSTITUTED";
    state.winningParty=constituentGroups(composition)[0].partyId;
    if(!initialScenario){state.mandatar=null;}
    state.governmentFormed=false;state.governmentStatus="CARETAKER";
    session.status="COMPLETED";session.completedAt=constituentStamp();
    if(!initialScenario)state.electionPhase="NONE";
    state.assemblyMandateStartedAt=session.openedAt;state.weeksToNextRegularElection=208;
    migrateDeputyMandates(state);
    // Store the same sourced evidence status that load migration would assign.
    migrateCandidateGenderEvidence(state);
}
function advanceConstituentCount() {
    var s=currentConstituentSession(),r=s && s.rounds.find(function(r){return r.revealed<120;});if(!r)return false;
    return constituentCommit(function(){
        r.revealed=120;
        if(r.revealed===120 && !r.finalized){
            r.finalized=true;
            if(r.result.passed){s.elected[r.office]=JSON.parse(JSON.stringify(r.candidate));if(r.office==="SPEAKER"){state.speakerElected=true;state.speakerOfAssembly=r.candidate.name+" ("+r.candidate.partyId+")";state.speakerElectionWeek=state.turnCount;}}
            if(!constituentOffice(s))activateConstitutedAssembly(s);
        }
    });
}
function openConstituentSessionPanel() {
    if(state.pendingVote){showToast('Përfundoni votimin aktual para hapjes së seancës konstituive.');return false;}
    toggleModal('majorEventModal',false);toggleModal('interactiveActionModal',false);
    switchMainTab("tab-assembly");switchSubTab("ass","constituent",document.getElementById("constituentTabBtn"));return true;
}
function stopConstituentAnimation() {if(constituentTimer!==null)clearInterval(constituentTimer);constituentTimer=null;}
function renderConstituentSession() {
    var host=document.getElementById("constituentPanel");if(!host)return;
    var s=currentConstituentSession(),c=constituentComposition(state),problem=constituentPrerequisite(state),esc=electoralEscape;
    var entry=document.getElementById("constituentEntryCard");if(entry)entry.style.display=(c && (!s || s.status!=="COMPLETED") || !state.assemblyConstituted)?"block":"none";
    var html='<div class="card"><h3>Seanca konstituive e Kuvendit</h3><p>Kuvendi ka 120 deputetë. Kryetari dhe secili nënkryetar zgjidhen me të paktën 61 vota pro. Votat kundër, abstenimet dhe mungesat nuk llogariten si mbështetje.</p><p>Çdo subjekt paraqet kandidatin për postin që i takon. Ju propozoni kandidatët e partisë suaj dhe zgjidhni nëse do t’i mbështesni kandidatët e të tjerëve. Pas zgjedhjes së Kryetarit dhe pesë nënkryetarëve, seanca përfundon.</p>';
    if(problem)html+='<p role="alert">'+esc(problem)+'</p>';
    else {
        var own=c.mandates.find(function(p){return p.partyId===state.playerParty;});
        html+='<p>Partia juaj: '+esc(state.parties[state.playerParty].name)+' · '+(own?own.total:0)+' deputetë.</p><details><summary>Përbërja sipas subjekteve</summary>'+constituentGroups(c).map(function(p){return '<p>'+esc(p.name)+' — '+p.total+' deputetë</p>';}).join('')+'</details>';
        html+='<p>Gjendja: '+(s && s.status==="COMPLETED"?'E përfunduar':'E papërfunduar')+'</p>';
        if(!s)html+='<button id="startConstituentBtn" class="action-btn btn-gold" onclick="startConstituentSession()">Hap seancën konstituive</button>';
    }
    html+='</div>';
    if(s && !problem){
        html+='<div class="card"><h3>Rendi procedural</h3><ol><li>Verifikimi i mandateve dhe kuorumit</li><li>Betimi i deputetëve</li><li>Propozimi dhe zgjedhja e Kryetarit</li><li>Zgjedhja e pesë nënkryetarëve</li></ol>';
        if(s.stage==="VERIFY")html+='<button id="verifyConstituentBtn" class="action-btn" onclick="verifyConstituentMandates()">Verifiko mandatet dhe kuorumin</button>';
        if(s.stage==="OATH")html+='<p>Pas verifikimit të mandateve, deputetët japin betimin përpara se të fillojë zgjedhja e Kryesisë.</p><button id="oathConstituentBtn" class="action-btn" onclick="recordConstituentOath()">Vazhdo me betimin e deputetëve</button>';
        var office=constituentOffice(s),pending=s.rounds.some(function(r){return r.revealed<120;});
        if(s.stage==="ELECTIONS" && office && !pending){
            var nominees=constituentNominees(s,c,office),groups=constituentGroups(c);
            var ownNomination=playerNominatesConstituent(state,s,c,office);
            html+='<h4>'+esc(constituentOfficeLabel(office))+'</h4>';
            if(office==='VICE_1'&&(!['M','F'].includes(s.elected.SPEAKER?.gender)||nominees.some(d=>!['M','F'].includes(d.gender))))html+='<p>Të dhënat gjinore janë të paplota. Kandidimi vazhdon pa hamendësuar gjininë.</p>';
            if(!nominees.length)html+='<p role="alert">Ende nuk është paraqitur kandidat i vlefshëm për këtë post.</p>';
            else if(ownNomination) {
                html+='<p>Propozimi për këtë post i takon partisë suaj. Zgjidhni një nga deputetët tuaj.</p>';
                html+='<label>Kandidati<select id="constituentCandidate">'+nominees.map(function(mp){var party=c.mandates.find(function(p){return p.partyId===mp.partyId;});return '<option value="'+esc(mp.candidateId)+'">'+esc(candidateDisplayName(mp))+' · '+esc(mp.partyId)+' · '+party.total+' mandate</option>';}).join('')+'</select></label>';
                html+='<button id="proposeConstituentBtn" class="action-btn" onclick="proposeConstituentFromPanel()">Propozo kandidatin</button>';
            }
            if(s.proposal){var nominatingParty=c.mandates.find(function(p){return p.partyId===s.proposal.candidate.partyId;});
                html+='<div class="candidate-card" id="constituentProposalCard"><p>'+(s.proposal.automatic?(["VICE_SERB","VICE_OTHER"].includes(office)?'Deputetët e komunitetit përkatës propozojnë:':esc(nominatingParty.name)+' propozon:'):'Kandidati i propozuar nga partia juaj:')+'</p><strong>'+esc(candidateDisplayName(s.proposal.candidate))+' · '+esc(s.proposal.candidate.partyId)+'</strong><p>'+nominatingParty.total+' mandate · '+esc(constituentOfficeLabel(s.proposal.office))+'</p><p>Zgjidhni votën e partisë suaj:</p><div class="candidate-actions"><button id="voteConstituentBtn" class="action-btn btn-gold" onclick="voteConstituentProposal(\'pro\')">Voto pro</button><button id="voteConstituentAgainstBtn" class="action-btn" onclick="voteConstituentProposal(\'kunder\')">Voto kundër</button><button id="voteConstituentAbstainBtn" class="action-btn" onclick="voteConstituentProposal(\'abstenim\')">Absteno</button></div></div>';
            }
        }
        html+='</div>';
        if(s.rounds.length)html+='<div class="card"><h3>Historiku i votimeve</h3>'+s.rounds.map(function(r,i){var counts={pro:0,kunder:0,abstenim:0,mungese:0};r.result.ballots.slice(0,r.revealed).forEach(function(b){counts[b.choice]++;});return '<article class="candidate-card"><strong>Raundi '+(i+1)+' · '+esc(constituentOfficeLabel(r.office))+' · '+esc(r.candidate.name)+'</strong><p>Pro: '+counts.pro+' · Kundër: '+counts.kunder+' · Abstenime: '+counts.abstenim+' · Mungesa: '+counts.mungese+'</p><progress max="120" value="'+r.revealed+'" aria-label="Numërimi i votave"></progress><p>'+r.revealed+' / 120 · '+(r.finalized?(r.result.passed?'Kandidati u zgjodh':'Kandidati nuk u zgjodh — kërkohen 61 vota pro'):'Numërimi në vazhdim')+'</p>'+(r.revealed<120?'<button id="advanceConstituentBtn" class="action-btn" onclick="advanceConstituentCount()">Avanco numërimin</button>':'')+'</article>';}).join('')+'</div>';
        if(s.elected.SPEAKER)html+='<div class="card"><h3>Kryetari i zgjedhur: '+esc(s.elected.SPEAKER.name)+' · '+esc(s.elected.SPEAKER.partyId)+'</h3><p>'+(s.status==="COMPLETED"?'Kuvendi është konstituuar. Hapi i ardhshëm është mandatimi për formimin e Qeverisë.':'Për përfundimin e seancës duhet të zgjidhen edhe të gjithë nënkryetarët.')+'</p>'+Object.keys(s.elected).filter(function(k){return k!=="SPEAKER";}).map(function(k){return '<p>'+esc(constituentOfficeLabel(k))+': '+esc(candidateDisplayName(s.elected[k]))+'</p>';}).join('')+'</div>';
    }
    if(s && s.status==="COMPLETED" && !state.mandatar && !state.governmentFormed && !(state.governmentFormationAttempts || []).length)html+='<div class="card"><p>Mandatimi nga Presidenti. Kabineti paraqitet brenda 15 ditësh nga emërimi.</p><button class="action-btn" onclick="appointGovernmentMandatar()">Vazhdo me mandatimin</button></div>';
    if(s && s.status==="COMPLETED" && !state.mandatar && (state.governmentFormationAttempts || []).length===1){
        html+='<div class="card"><p>Kandidati i dytë caktohet brenda 10 ditësh nga dështimi. Zgjidhni një subjekt të marrëveshjes ekzistuese me 61+ mandate.</p><select id="secondMandatarParty">'+(state.coalitionParties || []).filter(function(id){return state.parties[id] && state.parties[id].seats>0;}).map(function(id){return '<option value="'+electoralEscape(id)+'">'+electoralEscape(state.parties[id].name)+'</option>';}).join('')+'</select><button class="action-btn" onclick="appointGovernmentMandatar(document.getElementById(&quot;secondMandatarParty&quot;).value)">Cakto kandidatin e dytë</button></div>';
    }
    if(s && s.status==="COMPLETED" && !state.mandatar && (state.governmentFormationAttempts || []).length>=2)html+='<div class="card"><p>Dy tentativa dështuan. Zgjedhjet duhet të mbahen brenda 40 ditësh nga shpallja.</p><button class="action-btn" onclick="startParliamentaryElections()">Shpall zgjedhjet parlamentare</button></div>';
    host.innerHTML=html;
    var panel=document.getElementById("ass-constituent");
    stopConstituentAnimation();
}

function validateInitialConstituentContext(st) {
    if(typeof st.initialConstituentContext==="undefined")return;
    var context=st.initialConstituentContext,c=context && context.composition;
    if(st.mode!=="ALT_POST_ELECTION" || !c || !context.cycle || c.source!=="INITIAL_SCENARIO" || c.status!=="SCENARIO" || c.cycleId!==context.cycle.id || !Array.isArray(c.deputies) || c.deputies.length!==120 || new Set(c.deputies.map(function(mp){return mp.candidateId;})).size!==120 || new Set(c.deputies.map(function(mp){return mp.seatNumber;})).size!==120 || !Array.isArray(c.mandates) || c.mandates.reduce(function(n,p){return n+p.total;},0)!==120)throw Error("Përbërja e skenarit fillestar nuk ka 120 mandate të vlefshme.");
    var copy=JSON.parse(JSON.stringify(c));delete copy.integrity;
    if(c.integrity!==electionSeed(JSON.stringify(copy)) || context.cycle.seed!==c.integrity)throw Error("Përbërja fillestare e ruajtur është ndryshuar.");
}
function validateConstituentState(st) {
    validateInitialConstituentContext(st);
    if(typeof st.constituentSessions==="undefined")return;
    if(!Array.isArray(st.constituentSessions))throw Error("Regjistri i seancave konstituive është i pavlefshëm.");
    var seen=new Set();
    st.constituentSessions.forEach(function(s){
        var c=constituentCompositionById(st,s.cycleId),copy=JSON.parse(JSON.stringify(s));delete copy.integrity;
        if(!c || !["PUBLISHED","SCENARIO"].includes(c.status) || s.assemblyIntegrity!==c.integrity || seen.has(s.cycleId) || s.version!==1 || s.integrity!==electionSeed(JSON.stringify(copy)) || JSON.stringify(s.rules)!==JSON.stringify(CONSTITUENT_RULES) || !["IN_PROGRESS","COMPLETED"].includes(s.status) || !["VERIFY","OATH","ELECTIONS"].includes(s.stage) || !Array.isArray(s.rounds) || !Array.isArray(s.nominations))throw Error("Seanca konstituive është e dëmtuar ose e dyfishuar.");
        seen.add(s.cycleId);
        var ids=c.deputies.map(function(mp){return mp.candidateId;}),elected={},roundIds=new Set(),proposalIds=new Set(),pending=0;
        if(s.stage!=="VERIFY" && (!s.verification || JSON.stringify(s.verification.candidateIds)!==JSON.stringify(ids)))throw Error("Mungon verifikimi i mandateve.");
        if(s.stage==="ELECTIONS" && (!s.oath || JSON.stringify(s.oath.candidateIds)!==JSON.stringify(ids)))throw Error("Mungon betimi i deputetëve.");
        s.nominations.forEach(function(p){if(proposalIds.has(p.id) || !c.deputies.some(function(mp){return JSON.stringify(mp)===JSON.stringify(p.candidate);}) || !["pro","kunder","abstenim"].includes(p.playerStance) || !Array.isArray(p.signerIds))throw Error("Propozim i pavlefshëm në seancën konstituive.");proposalIds.add(p.id);});
        s.rounds.forEach(function(r,index){
            var proposal=s.nominations.find(function(p){return p.id===r.proposalId;}),ballots=r.result && r.result.ballots,counts={pro:0,kunder:0,abstenim:0,mungese:0},voters=new Set();
            if(!proposal || JSON.stringify(proposal.candidate)!==JSON.stringify(r.candidate) || proposal.office!==r.office || roundIds.has(r.id) || !Number.isInteger(r.revealed) || r.revealed<0 || r.revealed>120 || r.revealed%12 || r.finalized!==(r.revealed===120) || !Array.isArray(ballots) || ballots.length!==120)throw Error("Raundi konstituiv është i dëmtuar.");
            roundIds.add(r.id);
            if(r.office!==constituentOffice({elected:elected}))throw Error("Rendi procedural i votimeve nuk është i vlefshëm.");
            if(!constituentNominees({elected:elected},c,r.office).some(function(mp){return mp.candidateId===r.candidate.candidateId;}))throw Error("Kandidati nuk ka të drejtë të propozohet për këtë post.");
            if(r.office==="SPEAKER" && s.rounds.slice(0,index+1).filter(function(item){return item.office==="SPEAKER" && item.candidate.candidateId===r.candidate.candidateId;}).length>3)throw Error("Kandidati e tejkalon kufirin e raundeve.");
            if(["VICE_SERB","VICE_OTHER"].includes(r.office)){var pool=constituentSigners(c,r.office);if(new Set(proposal.signerIds).size!==proposal.signerIds.length || proposal.signerIds.length<=pool.length/2 || proposal.signerIds.some(function(id){return !pool.some(function(mp){return mp.candidateId===id;});}))throw Error("Mungon propozimi i shumicës së komunitetit.");}
            ballots.forEach(function(b){var mp=c.deputies.find(function(mp){return mp.candidateId===b.candidateId;});if(!mp || mp.partyId!==b.partyId || voters.has(b.candidateId) || !Object.hasOwn(counts,b.choice))throw Error("Votë e pavlefshme ose e dyfishuar.");voters.add(b.candidateId);counts[b.choice]++;});
            if(JSON.stringify(counts)!==JSON.stringify(r.result.counts) || r.result.passed!==(counts.pro>=61))throw Error("Shuma ose rezultati i votimit nuk përputhet.");
            if(r.revealed<120){pending++;if(index!==s.rounds.length-1)throw Error("Numërim i papërfunduar para raundit tjetër.");}
            if(r.finalized && r.result.passed)elected[r.office]=r.candidate;
        });
        if(pending>1 || JSON.stringify(elected)!==JSON.stringify(s.elected) || (s.status==="COMPLETED")!==(Object.keys(elected).length===6) || s.status==="COMPLETED" && !s.completedAt || s.proposal && !s.nominations.some(function(p){return JSON.stringify(p)===JSON.stringify(s.proposal);}))throw Error("Statusi i konstituimit nuk përputhet me historikun.");
        if(constituentCycle(st) && s.cycleId===constituentCycle(st).id && s.status==="COMPLETED"){
            var originalRoster=st.mps.length===120 && new Set(st.mps.map(function(mp){return mp.candidateId;})).size===120 && st.mps.every(function(mp){return c.deputies.some(function(d){return d.candidateId===mp.candidateId && d.partyId===mp.party && d.seatNumber===mp.seatNumber && d.name===mp.name && d.gender===mp.gender;});});
            if(!st.assemblyConstituted || !st.speakerElected || st.assemblyCycleId!==s.cycleId || st.speakerOfAssembly!==s.elected.SPEAKER.name+" ("+s.elected.SPEAKER.partyId+")" || !originalRoster && !deputyCompositionMatches(st,c) || Object.values(st.parties).reduce(function(n,p){return n+p.seats;},0)!==120 || c.mandates.some(function(p){return p.total && (!st.parties[p.partyId] || st.parties[p.partyId].seats!==p.total);}))throw Error("Kuvendi aktiv nuk përputhet me seancën e përfunduar.");
        }
        if(constituentCycle(st) && s.cycleId===constituentCycle(st).id && s.status!=="COMPLETED" && st.assemblyConstituted)throw Error("Kuvendi u shënua si i konstituuar para përfundimit.");
    });
}
