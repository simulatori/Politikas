/* Access to the existing electoral flow; no new vote thresholds or deadlines. */
function parliamentaryElectionBasis(st){
    if(!st)return null;
    if(st.institutionalPhase==='GOV_OVERTHROWN'&&!st.governmentFormed&&st.associationUltimatum?.financialFailures.some(t=>t>=(st.governmentApprovalWeek||0)))return 'Paaftesia paguese nen sanksionet totale te Asociacionit';
    if(mediaDossierElectionBasis(st))return "Kriza e pergjimeve dhe dosjeve te mediave";
    if(st.institutionalPhase==='GOV_OVERTHROWN'&&!st.governmentFormed&&st.brusselsSpecial?.shocks.some(s=>s.status==='ELECTION'&&s.cycle===deputyCycleId(st)))return 'Kriza e shumices pas goditjes politike te skenarit alternativ';
    if(st.institutionalPhase==='GOV_OVERTHROWN'&&!st.governmentFormed&&st.brusselsSpecial?.isolationDefaults?.some(t=>t>=(st.governmentApprovalWeek||0)))return 'Paaftesia paguese gjate izolimit nderkombetar';
    if(st.institutionalPhase==='GOV_OVERTHROWN'&&!st.governmentFormed&&(st.rogueMinisters?.majorityCrises.some(r=>r.status==='FALLEN'&&r.cycle===deputyCycleId(st))||st.veteransAudit?.financialFailures.some(t=>t>=(st.governmentApprovalWeek||0))))return 'Kriza e tenderit ose paaftesia paguese pas auditimit';
    if(st.institutionalPhase==='GOV_OVERTHROWN'&&!st.governmentFormed&&st.northCrisis?.financialFailures?.some(t=>t>=(st.governmentApprovalWeek||0)))return 'Paaftesi paguese nen sanksionet e Veriut';
    if(northSnapAvailable(st))return 'Zgjedhje te parakohshme ne dritaren heroike te Veriut';
    if(st.weeksToNextRegularElection<=0)return 'Përfundimi i mandatit parlamentar';
    if(st.institutionalPhase==='GOV_OVERTHROWN'&&!st.governmentFormed&&st.nationalEmergencies?.events.some(e=>e.status==='FAILED'&&e.failedTurn>=(st.governmentApprovalWeek||0)))return 'Qeveria ra nga mosfinancimi i emergjencës kombëtare';
    if(st.institutionalPhase==='GOV_OVERTHROWN' && !st.governmentFormed && (st.motions||[]).some(function(m){return m.type==='NO_CONFIDENCE' && m.status==='PASSED';}))return 'Mocioni i mosbesimit është miratuar';
    var attempts=st.governmentFormationAttempts||[];
    if(!st.governmentFormed && attempts.length===2 && attempts.every(function(a){return ['FAILED','EXPIRED'].includes(a.status);}))return 'Dy tentativat e formimit të Qeverisë kanë dështuar';
    var p=st.presidency?.procedure;
    if(p?.status==='FAILED' && (p.needsParliamentaryElection || st.institutionalPhase==='SNAP_ELECTION'))return 'Procedura presidenciale ka dështuar sipas rregullave të lojës';
    return null;
}
function parliamentaryElectionBlock(st){
    if(!st)return 'Nuk ka lojë aktive.';
    if(associationUltimatumPending(st))return 'Vendosni per ultimatumin e QUINT-it perpara zgjedhjeve.';
    if(st.pendingVote || !weeklyProcessing && (weeklyVisualBusy || st.weekCalendar?.transition))return 'Përfundoni votimin ose kalimin e javës përpara shpalljes.';
    var cycle=getElectionDayCycle(st),session=currentConstituentSession(st);
    if(st.electionPhase!=='NONE' && !(cycle?.status==='RESULTS' && session?.status==='COMPLETED'))return 'Procesi zgjedhor ose konstituimi është tashmë në vazhdim.';
    return parliamentaryElectionBasis(st)?null:'Nuk ka bazë për zgjedhje të reja. Përfundoni procedurën përkatëse në Kuvend ose prisni përfundimin e mandatit.';
}
function renderParliamentaryElectionAccess(){
    var button=document.getElementById('declareParliamentaryElectionBtn'),reason=document.getElementById('parliamentaryElectionReason');if(!button || !reason || !state)return;
    var problem=parliamentaryElectionBlock(state);button.disabled=!!problem;reason.textContent=problem||parliamentaryElectionBasis(state);
}
function openElectionAssemblyResults(){
    toggleModal('majorEventModal',false);
    switchMainTab('tab-assembly');switchSubTab('ass','composition',document.getElementById('assemblyCompositionTabBtn')||document.querySelector('[data-assembly-tab="composition"]'));
}
