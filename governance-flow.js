/* Political support, constitutional authority and government formation share the existing state. */
const GOVERNMENT_VOTE_COMMIT=Object.freeze({});
function callGameRenderer(name){const fn=globalThis[name];if(typeof fn==='function')fn();}
function renderVisibleWorkspace(){
    const view=document.querySelector('.tab-view.active');if(!view)return;
    const panel=Array.from(view.querySelectorAll('.sub-content')).find(el=>el.style.display!=='none'),key=panel?.id||'';
    const renderer={
        'tab-dashboard':{base:'renderDashboard','dash-calendar':'renderStateCalendar','dash-inbox':'renderWeeklyAgenda','dash-promises':'renderMandateExperience'},
        'tab-party':{base:'renderPartySection','party-list':'renderElectoralList','party-coalition':'renderCoalitionNegotiations','party-structure':'renderMediaWarfare'},
        'tab-assembly':{base:'renderAssemblySection','ass-constituent':'renderConstituentSession','ass-composition':'renderAssemblyComposition','ass-laws':'renderAssemblySection'},
        'tab-government':{base:'renderGovernmentSection','gov-sectors':'renderStateSectorsGrid','gov-macro':'renderGovernmentSection','gov-fiscal':'renderFiscalPanel','gov-trade':'renderBilateralTrade','gov-war':'renderSecurityOps','gov-intelligence':'renderIntelligenceAgency','gov-investments':'renderForeignInvestments','gov-enterprises':'renderStateEnterprises','gov-implementation':'renderLawImplementation','gov-unions':'renderUnions','gov-justice':'renderJusticeReform','gov-survival':'renderSurvivalCrises','gov-highway':'renderHighwayProject','gov-rtk':'renderRTK','gov-energyinquiry':'renderEnergyInquiry','gov-sovereign':'renderSovereignFund','gov-personnel':'renderPersonnelRegistry','gov-securitycrises':'renderSecurityCrises'},
        'tab-elections':{base:'renderElectionsSection','elec-locals':'renderLocalElections','elec-brochure':'renderBrochurePanel','elec-campaignplay':'renderCampaignPanel','elec-voting':'renderElectionDayPanel'},
        'tab-diplomacy':{base:'renderDiplomacySection','dip-institutions':'renderInternationalDiplomacy','dip-documents':'renderAgreementArchive','dip-report':'renderDiplomaticReport'},
        'tab-development':{base:'renderDevelopmentPanel'},'tab-catalog':{base:'renderGovernmentCatalog'}
    }[view.id];
    if(view.id==='tab-government'&&!agendaExecutive(state)){renderExecutiveAccess();return;}
    if(renderer)callGameRenderer(renderer[key]||renderer.base);
    if(view.id==='tab-dashboard'){callGameRenderer('renderPlayerGuidance');callGameRenderer('renderMandateExperience');callGameRenderer('renderOppositionHQ');}
    if(view.id==='tab-party'){callGameRenderer('renderOppositionHQ');if(key==='party-structure')callGameRenderer('renderMediaWarfare');}
    if(key==='gov-unions'){callGameRenderer('renderGeneralStrike');callGameRenderer('renderInternalPressure');}
    if(key==='gov-justice')callGameRenderer('renderInstitutionalConflicts');
    if(key==='gov-securitycrises')callGameRenderer('renderNorthCrisis');
    if(key==='gov-implementation')callGameRenderer('renderBureauBattle');
    const supplements={
        'dash-overview':['renderWeeklyDossiers','renderWeeklyAgenda','renderInterestGroups','renderPopulation','renderLaborExodus','renderDiaspora','renderDiasporaMobilization','renderMediaBombStatus','renderNationalEmergencies'],
        'dash-inbox':['renderWeeklyDossiers'],'dash-press':['renderCurrentPressQuestion'],
        'party-structure':['renderInterestGroups','renderMediaWarfare'],
        'ass-laws':['renderConstitutionalCourt','renderConstitutionPolitics','renderBrusselsSpecial','renderBureauBattle'],'ass-motions':['renderStreetProtests'],
        'gov-sectors':['renderSectorManagement','renderSectorExpansion'],'gov-macro':['renderPopulation','renderDiaspora','renderInformalEconomy','renderIMFCrisis','renderLaborExodus'],
        'gov-trade':['renderStreetProtests'],'gov-survival':['renderVeteransBudget','renderCoalitionBlackmail'],
        'gov-enterprises':['renderEnterpriseBoards','renderTrepca'],'gov-unions':['renderGeneralStrike'],
        'gov-securitycrises':['renderDinarCrisis'],'gov-justice':['renderConstitutionalCourt'],
        'elec-locals':['renderLocalElectionNotice'],'elec-municipalities':['renderLocalElections'],
        'tab-development':['renderWinterEnergy','renderMunicipalGrants','renderLocalObstructions']
    };
    for(const name of supplements[key||view.id]||[])callGameRenderer(name);
    if(key==='ass-laws'||key==='gov-macro')renderStrategicEconomy();
    if(key==='elec-campaignplay'||key==='dash-promises')renderSpecialPledges();
    applyPoliticalActionGuards(view);renderExecutiveAccess();
}
function renderPendingGovernmentDialogs(){
    const open=!!document.querySelector('dialog[open]');
    const checks={energyInquiryPending:'renderEnergyInquiry',rtkPending:'renderRTK',pendingTrepca:'renderTrepca',sovereignPending:'renderSovereignFund',pendingHighwayProject:'renderHighwayProject',bureauBattlePending:'renderBureauBattle',pendingDinarCrisis:'renderDinarCrisis',laborExodusPending:'renderLaborExodus',pendingCoalitionBlackmail:'renderCoalitionBlackmail',veteransBudgetPending:'renderVeteransBudget',enterpriseBoardsPending:'renderEnterpriseBoards',associationUltimatumPending:'renderAssociationUltimatum',municipalGrantPending:'renderMunicipalGrants',generalStrikePending:'renderGeneralStrike',pendingWinterEnergy:'renderWinterEnergy',councilPending:'renderCouncilEurope',mediaDossierBlocked:'renderMediaDossiers',internalPressurePending:'renderInternalPressure',northPending:'renderNorthCrisis',diasporaPendingSeason:'renderDiasporaMobilization',institutionalConflictPending:'renderInstitutionalConflicts',imfPending:'renderIMFCrisis',brusselsDecisionPending:'renderBrusselsSpecial',roguePendingReport:'renderSurvivalCrises',veteransCrisisPending:'renderSurvivalCrises',sectorExpansionPending:'renderSectorExpansion',activeNationalEmergency:'renderNationalEmergencies'};
    for(const [condition,render] of Object.entries(checks))if(open||typeof globalThis[condition]==='function'&&globalThis[condition](state))callGameRenderer(render);
    if(state.governance?.pendingScandal||document.getElementById('governmentScandalDialog')?.open)callGameRenderer('renderGovernmentCrisisUI');
}
function refreshVisibleGameUI(){
    if(!state)return;fiscalSyncBudgetStatuses();updateTopBar();renderVisibleWorkspace();
    renderPoliticalRoleUI({light:true});renderPostElectionInvitation();reconcileGovernmentNotificationAudience();renderUrgentSituations();
    if(!weeklyProcessing)reconcileWeeklyTransition();renderPendingGovernmentDialogs();
    const view=document.querySelector('.tab-view.active');if(view)uiEnhanceDetails(view);
    saveGameAuto();
}
function playerPoliticalSupport(st){return agendaExecutive(st)?st.approval:(st.parties[st.playerParty]?.poll||0);}
function reservedPrimeMinisterCandidate(mp,composition){
    const party=state.parties[mp.partyId],key=candidateIdentityKey(mp.name);
    return !!party&&key===candidateIdentityKey(party.leader);
}
function presidentialMandatingAuthority(st){
    const active=st.presidentElected&&(st.presidency?.endTurn==null||st.turnCount<st.presidency.endTurn);
    return active?'Presidenti '+st.presidentName:'U.D. i Presidentit'+(st.speakerElected?' — '+st.speakerOfAssembly:'');
}
var politicalGuardPattern=null,politicalGuardCount=0;
function applyPoliticalActionGuards(root){
    if(!root?.querySelectorAll)return;
    if(politicalGuardCount!==POLITICAL_EXECUTIVE_ACTIONS.length){politicalGuardCount=POLITICAL_EXECUTIVE_ACTIONS.length;politicalGuardPattern=new RegExp('\\b(?:'+POLITICAL_EXECUTIVE_ACTIONS.join('|')+')\\s*\\(');}
    const executive=agendaExecutive(state);
    root.querySelectorAll('[onclick],[onchange],[oninput],[onsubmit]').forEach(el=>{
        const code=['onclick','onchange','oninput','onsubmit'].map(k=>el.getAttribute(k)||'').join(' ');
        if(politicalGuardPattern.test(code)||/catalogDraftForm\(true\)|createCatalogDocument\(true\)/.test(code)){
            if(!executive){el.hidden=true;el.setAttribute('data-role-restricted','true');}
            else if(el.getAttribute('data-role-restricted')==='true'){el.hidden=false;el.removeAttribute('data-role-restricted');}
        }
    });
}
function renderExecutiveAccess(){
    const executive=agendaExecutive(state),gov=document.getElementById('tab-government');
    document.body?.classList.toggle?.('is-non-executive',!executive);
    ['activeEventCard','weeklyAgendaActions'].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=!executive;});
    const quick=document.getElementById('quickInboxPreview')?.closest?.('.card');if(quick)quick.hidden=!executive;
    if(gov){let gate=document.getElementById('governmentRoleGate');if(!gate&&document.createElement){gate=document.createElement('section');gate.id='governmentRoleGate';gate.className='card';gov.prepend(gate);}if(gate){gate.hidden=executive;gate.innerHTML='<h2>'+(state.governmentFormed?'Qeveria aktuale':'Në pritje të Qeverisë')+'</h2><p>'+electoralEscape(state.primeMinister)+' · '+getCoalitionSeats()+' / 120 mandate.</p><p>Menaxhimi ekzekutiv hapet vetëm pas miratimit të Qeverisë suaj në Kuvend. Ju veproni përmes partisë dhe grupit parlamentar.</p><button class="action-btn" onclick="openPostElectionTalks()">Negociatat e qeverisjes</button><button class="action-btn" onclick="switchMainTab(\'tab-party\')">Shtabi i Partisë</button>';}}
}
function initializeGovernmentNavigation(){
    const strip=document.querySelector('#tab-government > .sub-nav');if(!strip||strip.dataset.horizontalReady)return;strip.dataset.horizontalReady='true';
    const controls=document.createElement('div');controls.className='government-nav-controls';controls.innerHTML='<button type="button" aria-label="Seksionet majtas">←</button><button type="button" aria-label="Seksionet djathtas">→</button>';strip.before(controls);
    controls.children[0].onclick=()=>strip.scrollBy({left:-Math.max(240,strip.clientWidth*.7),behavior:'auto'});controls.children[1].onclick=()=>strip.scrollBy({left:Math.max(240,strip.clientWidth*.7),behavior:'auto'});
    strip.addEventListener('wheel',e=>{if(strip.scrollWidth<=strip.clientWidth)return;const amount=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;const before=strip.scrollLeft;strip.scrollLeft+=amount;if(before!==strip.scrollLeft)e.preventDefault();},{passive:false});
    let drag=null,moved=false;
    strip.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,left:strip.scrollLeft};moved=false;});
    strip.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>5){moved=true;strip.setPointerCapture(e.pointerId);strip.classList.add('is-dragging');strip.scrollLeft=drag.left-dx;e.preventDefault();}});
    function end(){drag=null;strip.classList.remove('is-dragging');}strip.addEventListener('pointerup',end);strip.addEventListener('pointercancel',end);
    strip.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false;}},true);
}
function currentFormationTalk(st){const t=st.governmentFormationTalk;return t&&t.cycleId===constituentCycle(st)?.id&&t.player===st.playerParty&&(!st.mandatar||t.leader===st.mandatar)?t:null;}
function formationPoliticalCommit(change){
    if(state.pendingVote||weeklyProcessing||!state.assemblyConstituted)return false;const before=JSON.stringify(state);
    try{change();validateGovernmentFormationTalk(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}catch(e){state=JSON.parse(before);showToast(e.message);return false;}return true;
}
function openMandatarOffer(){
    if(!state.assemblyConstituted||state.governmentFormed)return false;
    let leader=state.mandatar||constituentGroups(constituentComposition(state))[0]?.partyId;if(!leader||leader===state.playerParty)return false;
    if(!(state.governmentFormationAttempts||[]).length){state.mandatar=null;if(!appointGovernmentMandatar())return false;leader=state.mandatar;}
    if(!state.mandatar)return false;
    if(!currentFormationTalk(state)&&!formationPoliticalCommit(()=>{
        const own=coalitionPartySeats(state.playerParty),seats=coalitionPartySeats(leader),fair=Math.max(1,Math.min(Math.floor(state.ministries.length/2),Math.round(own/(own+seats)*state.ministries.length)));
        state.governmentFormationTalk={version:1,cycleId:constituentCycle(state).id,leader,player:state.playerParty,status:'OFFERED',round:1,offerMinistries:fair,fairMinistries:fair,counter:null,reply:'Oferta bazohet në mandatet dhe peshën zgjedhore të dy partive.',coalition:[],votes:null};
    }))return false;
    renderMandatarOffer();return true;
}
function renderMandatarOffer(){
    const t=currentFormationTalk(state);if(!t)return;const box=document.getElementById('interactiveActionModalContent'),own=coalitionPartySeats(t.player),lead=coalitionPartySeats(t.leader),e=electoralEscape;
    box.innerHTML='<h2>Oferta e mandatarit · '+e(state.parties[t.leader].leader)+'</h2><p>'+e(presidentialMandatingAuthority(state))+' ka caktuar mandatarin.</p><p>Partia juaj: '+own+' mandate · sondazhi '+state.parties[t.player].poll.toFixed(1)+'%. Mandatari: '+lead+' mandate.</p><p>'+e(t.reply)+'</p><strong>Oferta: '+t.offerMinistries+' ministri dhe marrëveshje programore</strong><div class="candidate-actions">'+(['OFFERED','COUNTERED'].includes(t.status)?'<button class="action-btn" onclick="resolveMandatarOffer(\'ACCEPT\')">Prano ofertën</button><button class="action-btn" onclick="resolveMandatarOffer(\'REFUSE\')">Refuzo përfundimisht · qëndro në opozitë</button>':'')+'</div>'+(t.round===1&&t.status==='OFFERED'?'<h3>Kundëroferta juaj</h3><select id="formationCounter"><option value="MINISTRIES">Kërko dy ministri shtesë</option><option value="PROGRAMME">Kërko marrëveshje programore</option><option value="PM">Kërko postin e Kryeministrit</option></select><button class="action-btn" onclick="counterMandatarOffer(document.getElementById(\'formationCounter\').value)">Dërgo kundërofertën</button>':'')+'<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button>';
    if(t.status==='READY_VOTE')box.innerHTML+='<button class="action-btn" onclick="toggleModal(\'interactiveActionModal\',false);voteMandatarGovernment()">Vazhdo me seancën e Qeverisë</button>';
    toggleModal('interactiveActionModal',true);
}
function counterMandatarOffer(choice){
    if(!['MINISTRIES','PROGRAMME','PM'].includes(choice))return false;
    const ok=formationPoliticalCommit(()=>{const t=currentFormationTalk(state);if(!t||t.status!=='OFFERED'||t.round!==1)throw Error('Oferta nuk është më aktive.');t.counter=choice;t.round=2;t.status='COUNTERED';
        if(choice==='PM')t.reply='Mandatari refuzon kalimin e postit të Kryeministrit. Me '+coalitionPartySeats(t.player)+' mandate kundrejt '+coalitionPartySeats(t.leader)+', oferta mbetet pjesëmarrja proporcionale në kabinet.';
        if(choice==='MINISTRIES'){t.offerMinistries=Math.min(Math.floor(state.ministries.length/2),t.fairMinistries+1);t.reply='Kundëroferta u shqyrtua. Mandatari ofron një ministri shtesë, sipas peshës suaj parlamentare.';}
        if(choice==='PROGRAMME')t.reply='Mandatari pranon përfshirjen e prioriteteve tuaja në marrëveshjen programore. Zbatimi monitorohet gjatë mandatit.';
    });if(ok)renderMandatarOffer();return ok;
}
function resolveMandatarOffer(choice){
    if(!['ACCEPT','REFUSE'].includes(choice))return false;
    const ok=formationPoliticalCommit(()=>{const t=currentFormationTalk(state);if(!t||!['OFFERED','COUNTERED'].includes(t.status))throw Error('Nuk ka ofertë për vendim.');t.status=choice==='ACCEPT'?'ACCEPTED':'REFUSED';
        const eligible=Object.keys(state.parties).filter(id=>id!==t.leader&&id!==t.player&&coalitionPartySeats(id)>0&&!(t.leader==='LVV'&&id==='SL'||t.leader==='SL'&&id==='LVV')).sort((a,b)=>coalitionPartySeats(b)-coalitionPartySeats(a)||(state.parties[b].relations?.[t.leader]||0)-(state.parties[a].relations?.[t.leader]||0));
        const coalition=[t.leader];if(choice==='ACCEPT')coalition.push(t.player);
        let seats=coalition.reduce((n,id)=>n+coalitionPartySeats(id),0);for(const id of eligible){if(seats>=61)break;coalition.push(id);seats+=coalitionPartySeats(id);}
        t.coalition=coalition;state.coalitionParties=coalition.slice();state.coalitionAgreements=coalition.slice(1).map(id=>({partner:id,ministriesCount:id===t.player?t.offerMinistries:1,deputyPM:false,honored:true,conditions:id===t.player?'Marrëveshje programore pas negociatave':'Marrëveshje e shumicës alternative',formationCycle:t.cycleId}));
        t.status='READY_VOTE';t.reply=choice==='REFUSE'?'Oferta u refuzua. Mandatari siguroi partnerë të tjerë dhe thërret votimin e Qeverisë.':'Oferta u pranua. Koalicioni e paraqet kabinetin në Kuvend.';
    });if(!ok)return false;toggleModal('interactiveActionModal',false);return voteMandatarGovernment();
}
function installApprovedGovernment(pro){
    if(applyCabinetProposalToState(GOVERNMENT_VOTE_COMMIT)===false)throw Error('Kabineti i votuar nuk u instalua.');state.governmentFormed=true;state.primeMinister=state.parties[state.mandatar].leader+' ('+state.parties[state.mandatar].short+')';state.governmentApprovalWeek=state.turnCount;state.governmentStartedAt=constituentStamp();
    const attempt=state.governmentFormationAttempts?.at(-1);if(attempt){attempt.status='APPROVED';attempt.decidedAt=constituentStamp();}if(state.previousGovernment)state.previousGovernment.status='REPLACED';
    setInstitutionalPhase(INSTITUTIONAL_PHASES.GOV_IN_OFFICE,'Qeveria u miratua me '+pro+' vota.');syncDeputyGovernment();if(agendaExecutive(state))activateElectoralPromises(state);
}
function voteMandatarGovernment(){
    const t=currentFormationTalk(state);if(!t||t.status!=='READY_VOTE'||!constituentGovernmentGate(true)||state.mandatar!==t.leader||state.pendingVote)return false;
    const proposal=buildDefaultCabinetProposal();
    const pro=state.mps.filter(m=>t.coalition.includes(m.party)).length,against=120-pro;
    startVotingAnimation('Seanca për zgjedhjen e Qeverisë','Mandatari: '+state.parties[t.leader].leader,{pro,kunder:against,abstenim:0,mungese:0,resultHtml:pro>=61?'QEVERIA U MIRATUA':'QEVERIA NUK MORI 61 VOTA',governmentContext:{kind:'GOVERNMENT',approved:pro>=61,title:'Qeveria e mandatarit',required:61,primeMinister:false}},()=>{
        state.cabinetProposal=proposal;state.cabinetApproved=true;t.votes={pro,kunder:against};
        if(pro>=61){t.status='APPROVED';installApprovedGovernment(pro);}else{t.status='FAILED';const attempt=state.governmentFormationAttempts.at(-1);attempt.status='FAILED';attempt.decidedAt=constituentStamp();state.mandatar=null;state.cabinetApproved=false;state.cabinetProposal=null;state.governmentFormed=false;state.governmentStatus='CARETAKER';state.institutionalPhase='ASSEMBLY_CONSTITUTED';}
        state.historyLog.unshift('Formimi i Qeverisë: '+pro+' pro · '+against+' kundër · '+t.coalition.join(' + '));
    });return !!state.pendingVote;
}
function validateGovernmentFormationTalk(st){
    const t=st.governmentFormationTalk;if(t===undefined)return;
    if(!t||t.version!==1||typeof t.cycleId!=='string'||!st.parties[t.leader]||!st.parties[t.player]||!['OFFERED','COUNTERED','ACCEPTED','REFUSED','READY_VOTE','APPROVED','FAILED'].includes(t.status)||![1,2].includes(t.round)||!Number.isInteger(t.offerMinistries)||t.offerMinistries<1||t.offerMinistries>st.ministries.length||!Array.isArray(t.coalition)||new Set(t.coalition).size!==t.coalition.length||t.coalition.some(id=>!st.parties[id]))throw Error('Negociata e formimit të Qeverisë është e pavlefshme.');
    if(!Number.isInteger(t.fairMinistries)||t.fairMinistries<1||t.fairMinistries>st.ministries.length||![null,'MINISTRIES','PROGRAMME','PM'].includes(t.counter)||typeof t.reply!=='string'||t.reply.length>2000||t.votes!==null&&(!Number.isInteger(t.votes.pro)||!Number.isInteger(t.votes.kunder)||t.votes.pro<0||t.votes.kunder<0||t.votes.pro+t.votes.kunder!==120)||['APPROVED','FAILED'].includes(t.status)&&(!t.votes||(t.status==='APPROVED')!==(t.votes.pro>=61)))throw Error('Oferta ose votat e kabinetit janë të pavlefshme.');
}
document.addEventListener('DOMContentLoaded',initializeGovernmentNavigation);
