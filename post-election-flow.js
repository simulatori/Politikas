/* One projection of the existing election, assembly and government records. */
const ELECTION_SIMULATION_COMMUNITIES=Object.freeze({LVV:'GENERAL',PDK:'GENERAL',LDK:'GENERAL',AAK:'GENERAL',NISMA:'GENERAL',SL:'SERB',NDS:'BOSNIAK',KDTP:'TURK',JGP:'GORAN',PREBK:'ROM',PAI_PDAK_LPB:'ASHKALI',IRDK:'EGYPTIAN'});
function ensurePlayableElectionConfiguration(st){
    if(st.electionCountConfiguration)return;
    const participants=Object.keys(ELECTION_SIMULATION_COMMUNITIES).filter(id=>st.candidateRegistry[id]?.length),subjects={};
    participants.forEach(id=>{const community=ELECTION_SIMULATION_COMMUNITIES[id];subjects[id]={community,support:Math.max(community==='GENERAL'?0:1,st.parties[id]?.poll||0),source:'Konfigurim i lojës për subjektet individuale; mbështetja është simulim.'};});
    st.electionCountConfiguration={participants,subjects,genders:{},generatedDefaults:true};
}
function postElectionInvitation(st){
    const cycle=constituentCycle(st),c=constituentComposition(st),initial=c?.source==='INITIAL_SCENARIO';if(!cycle||!initial&&cycle.status!=='RESULTS'||!['PUBLISHED','SCENARIO'].includes(c?.status)||st.governmentFormed)return null;
    const own=c.mandates.find(p=>p.partyId===st.playerParty),groups=constituentGroups(c);if(!own?.total||!groups.length)return null;
    const attempts=st.governmentFormationAttempts||[],last=attempts.at(-1),majority=c.mandates.filter(p=>(st.coalitionParties||[]).includes(p.partyId)).reduce((n,p)=>n+p.total,0);
    const second=attempts.length===1&&['FAILED','EXPIRED'].includes(last.status)&&majority>=61&&(st.coalitionParties||[]).includes(st.playerParty);
    const leader=st.mandatar||(second?st.playerParty:groups[0].partyId);
    return {cycleId:cycle.id,leader,seats:own.total,majority,second,winner:leader===st.playerParty,constituted:st.assemblyConstituted,mandated:st.mandatar===st.playerParty};
}
function openPostElectionTalks(){
    const invitation=postElectionInvitation(state);if(!invitation)return false;
    toggleModal('majorEventModal',false);toggleModal('interactiveActionModal',false);
    switchMainTab('tab-party');const button=Array.from(document.querySelectorAll('#tab-party .sub-pill')).find(b=>(b.getAttribute('onclick')||'').includes("'coalition'"));
    switchSubTab('party','coalition',button);renderCoalitionNegotiations();
    if(!invitation.winner)return invitation.constituted?openMandatarOffer():openCoalitionRound1(invitation.leader);
    renderCoalitionNegotiations();return true;
}
function acceptPostElectionMandate(){
    const i=postElectionInvitation(state);if(!i?.winner||!i.constituted)return false;
    if(!state.mandatar&&!appointGovernmentMandatar(i.second?state.playerParty:undefined))return false;return openPostElectionTalks();
}
function postElectionInvitationMarkup(){
    const i=postElectionInvitation(state);if(!i)return '';
    const e=electoralEscape,leader=state.parties[i.leader],title=i.winner?'Ftesë për formimin e Qeverisë':'Ftesë për konsultime paszgjedhore';
    const authority=e(presidentialMandatingAuthority(state));
    const message=i.second?'Marrëveshja juaj siguron '+i.majority+' mandate. Pas dështimit të tentativës së parë, mund të pranoni mandatin e dytë.':i.winner?'Partia juaj udhëheq rezultatin me '+i.seats+' mandate. '+authority+' ju fton të përgatitni shumicën dhe ofertën e qeverisjes.':e(leader?.leader||i.leader)+' ju fton në konsultime për shumicën e re. Partia juaj ka '+i.seats+' mandate; paraqitni ofertën tuaj.';
    return '<article class="card post-election-invitation" role="status"><h3>'+title+'</h3><p>'+message+'</p><p>Autoriteti i mandatimit: '+authority+'</p><div class="candidate-actions"><button type="button" class="action-btn btn-gold" onclick="openPostElectionTalks()">'+(i.winner?'Hap negociatat e qeverisjes':'Prano ftesën për takim')+'</button>'+(!i.constituted?'<button type="button" class="action-btn" onclick="openConstituentSessionPanel()">Vazhdo te konstituimi dhe betimi</button>':i.winner&&!state.mandatar?'<button type="button" class="action-btn" onclick="acceptPostElectionMandate()">Prano mandatin për formimin e Qeverisë</button>':i.mandated?'<button type="button" class="action-btn" onclick="openCabinetSelectionModal()">Përgatit kabinetin</button>':'')+'</div></article>';
}
function renderPostElectionInvitation(){const host=document.getElementById('postElectionInvitation');if(host){host.innerHTML=postElectionInvitationMarkup();host.hidden=!host.innerHTML;}}
function repairPostElectionPublication(st){
    const cycle=getElectionDayCycle(st);if(cycle?.status!=='RESULTS')return;
    const old=(st.assemblyCompositions||[]).find(c=>c.cycleId===cycle.id);
    // Repair only partial reports, never re-count votes or rewrite a completed assembly.
    if(!old||old.status!=='PARTIAL'||(st.constituentSessions||[]).some(s=>s.cycleId===cycle.id))return;
    const proof=JSON.parse(JSON.stringify(old));delete proof.integrity;
    if(old.integrity!==electionSeed(JSON.stringify(proof))||old.resultsSnapshot!==JSON.stringify(cycle.results))throw Error('Përbërja e mëparshme nuk përputhet me votat e ruajtura.');
    const fresh=calculateAssemblyComposition(cycle,old.metadata);if(fresh.status!=='PUBLISHED')return;
    fresh.integrity=electionSeed(JSON.stringify(fresh));st.assemblyCompositions=st.assemblyCompositions.map(c=>c.cycleId===cycle.id?fresh:c);reconcilePostElection(st);
}
