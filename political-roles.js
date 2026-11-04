/* Phase 9: derive roles from institutions, never from stored labels or party names. */
function politicalPlayerRole(st){
    st=st || state;if(!st)return {id:'NONE',label:'Pa rol aktiv',executive:false,parliamentary:false};
    var party=st.playerParty,seats=(st.mps||[]).filter(function(m){return m.party===party;}).length;
    var executive=agendaExecutive(st),formed=st.governmentFormed && st.governmentStatus==='IN_OFFICE';
    var coalition=(st.coalitionParties||[]).includes(party),id,label;
    if(executive){id='PRIME_MINISTER';label='Kryeministër';}
    else if(st.mandatar===party && (!formed || st.institutionalPhase!=='GOV_IN_OFFICE')){id='MANDATAR';label='Mandatar për formimin e Qeverisë';}
    else if(st.governmentStatus==='CARETAKER' && (st.previousGovernment?.coalitionParties || st.coalitionParties || []).includes(party)){id='CARETAKER';label='Qeverisje me kompetenca të kufizuara';}
    else if(formed && coalition){id='COALITION';label='Partner i koalicionit';}
    else if(seats){
        var rivals=Object.keys(st.parties).filter(function(k){return !(st.coalitionParties||[]).includes(k);});
        rivals.sort(function(a,b){return st.mps.filter(function(m){return m.party===b;}).length-st.mps.filter(function(m){return m.party===a;}).length || a.localeCompare(b);});
        id=rivals[0]===party?'OPPOSITION_LEADER':'OPPOSITION_MP';label=id==='OPPOSITION_LEADER'?'Lider i opozitës':'Grup parlamentar i opozitës';
    }else{id='PARTY_LEADER';label='Lider partie pa përfaqësim parlamentar';}
    return {id:id,label:label,executive:executive,parliamentary:seats>0,seats:seats,politicalAgenda:!executive && !['CARETAKER','MANDATAR'].includes(id)};
}
function assertPoliticalParliament(action){
    if(!politicalPlayerRole().parliamentary){showToast((action || 'Ky veprim')+' kërkon përfaqësim aktiv në Kuvend.');return false;}
    return true;
}
function assertBillInitiator(law){
    var government=law && (law.govRequired || (law.proposer || '').startsWith('Qeveria'));
    if(government)return assertGovernmentAuthority('Veprimi në emër të propozuesit qeveritar');
    if(law && (law.supportParties || []).includes(state.playerParty))return assertPoliticalParliament('Veprimi i propozuesit');
    showToast('Ky veprim i takon propozuesit të projektligjit.');return false;
}
function canActAsBillInitiator(law){
    if(!law)return false;
    return law.govRequired || (law.proposer || '').startsWith('Qeveria') ? agendaExecutive() : politicalPlayerRole().parliamentary && (law.supportParties || []).includes(state.playerParty);
}
function assertPoliticalMeeting(m){
    if(!m)return false;
    if(m.ownerParty && m.ownerParty!==state.playerParty){showToast('Takimi i përket një grupi tjetër politik.');return false;}
    var minister=state.ministries.some(function(x){return x.minister===m.targetName;});
    if((m.requiresExecutive || minister && !m.political9) && !agendaExecutive()){showToast('Ky takim kërkon kompetencat ekzekutive të Kryeministrit.');return false;}
    return true;
}
function politicalAgendaAuthorized(r){return !!r && (r.political9?politicalPlayerRole().politicalAgenda && r.ownerParty===state.playerParty:agendaExecutive());}
function createPoliticalAgendaTask(){
    if(!politicalPlayerRole().politicalAgenda)return null;
    var a=state.weeklyAgenda,key='political9:'+state.playerParty;
    if(a.recent[key]!==undefined && state.turnCount-a.recent[key]<3 || state.pmInboxRequests.some(function(r){return r.political9 && r.ownerParty===state.playerParty && agendaActive(r);}))return null;
    var title=politicalPlayerRole().parliamentary?'Përgatitja e qëndrimit të grupit parlamentar':'Përgatitja e qëndrimit të partisë';
    var r={id:key+':'+state.turnCount,political9:true,agenda6:true,ownerParty:state.playerParty,requiresExecutive:false,status:'PENDING',createdWeek:state.turnCount,dueTurn:state.turnCount+3,deadlineWeeks:3,workWeeks:1,title:title,senderName:state.parties[state.playerParty].leader,senderRole:'Grupi politik',desc:'Shqyrtoni projektligjet dhe vendimet publike. Përgatitja nuk miraton ligj ose vendim qeveritar.',options:[],outcomeMsg:''};
    state.pmInboxRequests.unshift(r);a.recent[key]=state.turnCount;return r;
}
function openPoliticalAgendaTask(id){
    var r=state.pmInboxRequests.find(function(r){return r.id===id;});if(!r || !r.political9)return false;
    if(!politicalAgendaAuthorized(r)){showToast('Kjo detyrë nuk i përket rolit tuaj aktual.');return false;}
    var e=catalogEscape,html='<h2>'+e(r.title)+'</h2><p>'+e(r.desc)+'</p><p>'+e(AGENDA_STATUS_LABELS[r.status])+' · Afati: '+e(diplomaticDate(r.dueTurn))+'</p>';
    if(r.status==='PENDING')html+='<button class="action-btn" onclick="startAgendaTask(\''+e(id)+'\');openPoliticalAgendaTask(\''+e(id)+'\')">Nis përgatitjen</button>';
    if(r.status==='IN_PROGRESS')html+='<p>Materialet përgatiten deri më '+e(diplomaticDate(r.readyTurn))+'.</p>';
    if(r.status==='WAIT_DECISION')html+='<button class="action-btn btn-gold" onclick="completePoliticalAgendaTask(\''+e(id)+'\')">Regjistro qëndrimin e grupit</button>';
    document.getElementById('interactiveActionModalContent').innerHTML=html+'<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button>';toggleModal('interactiveActionModal',true);return true;
}
function completePoliticalAgendaTask(id){
    var r=state.pmInboxRequests.find(function(r){return r.id===id;});if(!r?.political9 || !politicalAgendaAuthorized(r) || r.status!=='WAIT_DECISION' || state.turnCount>r.dueTurn){showToast('Detyra duhet të jetë gati dhe brenda afatit.');return false;}
    return agendaCommit(function(){r.status='COMPLETED';r.completedTurn=state.turnCount;r.outcomeMsg='Grupi regjistroi qëndrimin për punën parlamentare. Iniciativat dhe votimi ndiqen veçmas.';});
}
function renderPoliticalAgenda(host){
    var e=catalogEscape,rows=state.pmInboxRequests.filter(function(r){return r.political9 && r.ownerParty===state.playerParty;}).map(function(r){return '<article><h4>'+e(r.title)+'</h4><p>'+e(AGENDA_STATUS_LABELS[r.status])+' · '+e(diplomaticDate(r.dueTurn))+'</p><p>'+e(r.outcomeMsg || r.desc)+'</p>'+(agendaActive(r)?'<button class="action-btn" onclick="openPoliticalAgendaTask(\''+e(r.id)+'\')">Shqyrto detyrën</button>':'')+'</article>';});
    state.scheduledMeetings.forEach(function(m,i){if(m.requiresExecutive || m.ownerParty && m.ownerParty!==state.playerParty || !['SCHEDULED','COMPLETED','MISSED'].includes(m.status))return;rows.push('<article><h4>'+e(m.targetName)+'</h4><p>'+e(m.topic)+' · '+e(diplomaticDate(m.dueTurn))+' · '+e(AGENDA_STATUS_LABELS[m.status])+'</p><button class="action-btn" onclick="openScheduledVisualMeeting('+i+')">Shiko takimin</button></article>');});
    host.innerHTML='<p>Agjenda politike përdor të njëjtat afate javore. Detyrat ekzekutive mbeten në arkiv sipas mandatit.</p><div class="candidate-actions"><button class="action-btn" onclick="openScheduleMeetingModal(\'PARTY_LEADERS\')">Takim me liderët</button><button class="action-btn" onclick="openScheduleMeetingModal(\'INTL_DIPLOMATS\')">Kontakt politik ndërkombëtar</button></div><div class="agenda6-list">'+(rows.join('') || '<p>Detyra e ardhshme politike përgatitet gjatë javës pasuese.</p>')+'</div>';
}
const POLITICAL_EXECUTIVE_ACTIONS=['submitPressAnswer','startPressConference','publishPressRelease','resolveActiveEvent','openBorrowingModal','repayPublicDebt','openTaxPolicyModal','startInternationalNegotiation','performInternationalRound','openDialogueStep1_Context','openDialogueStep2_Consultations','openDialogueStep3_Proposal','openDialogueStep4_BrusselsRound','openMinisterOneOnOneModal','openMinisterChat','submitMinisterChat','resolveMinisterMeeting','openInternalGovMeetingModal','resolveInternalGroupMeeting','launchStateSectorProject','openCabinetDebateModal','resolveCabinetDecision','adjustMinistryBudget','reshuffleMinister','applyFiscalPolicy','openBudgetAllocationModal','confirmBudgetAllocation','issueGovernmentBond','payPublicDebt','applyTaxPolicyChange','transferToReserve','auditPublicSpending','openDevelopmentProjectModal','createDevelopmentProject','saveDevelopmentProjectAsDraft','catalogGovernmentDecision','approveCatalogProject','fulfillPromiseNow','openDialogueStepModal','openInvitationResponseModal','respondToInvitation','startConsultationSession','consultationStep2','consultationStep3','saveDialogueProposalAndAdvance','resolveBrusselsRound','resetDialogueForNextRound','advanceDialogueStep','consultAlliesOffTable','executeNorthSecurityOperation'];
function renderPoliticalRoleUI(options){
    if(!options?.light){
    if(typeof renderOppositionHQ==='function')renderOppositionHQ();
    if(typeof renderGovernmentCrisisUI==='function')renderGovernmentCrisisUI();
    if(typeof renderInterestGroups==='function')renderInterestGroups();
    if(typeof renderConstitutionalCourt==='function')renderConstitutionalCourt();
    if(typeof renderElectoralAccountability==='function')renderElectoralAccountability();
    if(typeof renderStateEnterprises==='function')renderStateEnterprises();
    if(typeof renderIntelligenceAgency==='function')renderIntelligenceAgency();
    if(typeof renderNationalEmergencies==='function')renderNationalEmergencies();
    if(typeof renderPopulation==='function')renderPopulation();renderLaborExodus();renderDinarCrisis();renderBureauBattle();renderPersonnelRegistry();renderHighwayProject();renderSovereignFund();renderTrepca();renderRTK();renderEnergyInquiry();renderSectorExpansion();
    if(typeof renderDiaspora==='function')renderDiaspora();
    if(typeof renderUnions==='function')renderUnions();
    if(typeof renderSurvivalCrises==='function')renderSurvivalCrises();renderVeteransBudget();renderCoalitionBlackmail();
    if(typeof renderBrusselsSpecial==='function')renderBrusselsSpecial();
    renderInstitutionalConflicts();renderNorthCrisis();renderInternalPressure();renderMediaDossiers();renderMediaBombStatus();renderCouncilEurope();renderWinterEnergy();renderGeneralStrike();renderMunicipalGrants();renderAssociationUltimatum();renderEnterpriseBoards();renderDiasporaMobilization();
    if(typeof renderLocalElections==='function')renderLocalElections();
    if(typeof renderLocalElectionNotice==='function')renderLocalElectionNotice();
    if(typeof renderIMFCrisis==='function')renderIMFCrisis();
    if(typeof renderMediaWarfare==='function')renderMediaWarfare();
    if(typeof renderSecurityCrises==='function')renderSecurityCrises();
    if(typeof renderJusticeReform==='function')renderJusticeReform();
    if(typeof renderLawImplementation==='function')renderLawImplementation();
    if(typeof renderInformalEconomy==='function')renderInformalEconomy();
    if(typeof renderLocalObstructions==='function')renderLocalObstructions();
    polishDevelopmentSurface(document.getElementById('tab-development'));
    }
    var role=politicalPlayerRole(),host=document.getElementById('politicalRolePanel'),e=catalogEscape;
    if(host)host.innerHTML='<div class="political-role-card"><div><span class="tag tag-gold">'+e(role.label)+'</span><p>'+role.seats+' deputetë aktivë · '+(state.assemblyConstituted && state.speakerElected?'Kuvendi i konstituuar':'Kuvendi në proces konstituimi')+'</p></div><div class="candidate-actions"><button class="action-btn" onclick="switchMainTab(\'tab-assembly\')">Puna parlamentare</button><button class="action-btn" onclick="openLawNegotiations()">Mbështetja e projektligjeve</button><button class="action-btn" onclick="openScheduleMeetingModal(\'PARTY_LEADERS\')">Kontaktet politike</button>'+(!role.executive?'<button class="action-btn" onclick="openPartyPressConference()">Konferencë e partisë</button>':'')+'</div></div>';
    applyPoliticalActionGuards(document);renderExecutiveAccess();
    if(document.querySelectorAll)document.querySelectorAll('.international-form').forEach(function(el){el.hidden=!role.executive;if(el.hidden)el.setAttribute('data-role-restricted','true');else el.removeAttribute('data-role-restricted');});
    var agendaLabel=document.getElementById('politicalAgendaLabel');if(agendaLabel)agendaLabel.textContent=role.executive?'Agjenda e Kryeministrit':'Agjenda politike';
    var meetingPanel=document.getElementById('gov-meeting');if(meetingPanel && !role.executive)meetingPanel.style.display='none';
}
POLITICAL_EXECUTIVE_ACTIONS.push('municipalProjectAction','resolveMunicipal14Request','createMunicipal14Request','internationalStartFromForm','internationalProposalFromForm','submitInternationalProposal','decideInternationalNegotiation','completeInternationalMilestone','repayInternationalLoan','checkInternationalAgreements','reviewAgreementDocument','signAgreementDocument','requestAgreementChanges','rejectAgreementDocument','restartRejectedAgreement','sendAgreementToInstitution','approveTechnicalAgreement','reportAgreementTask','financeAgreementTask','requestAgreementProcedure');
POLITICAL_EXECUTIVE_ACTIONS.push('fiscalAnnualBudgetForm','submitAnnualBudgetForm','prepareAnnualBudget','fiscalPreview','confirmFiscalDecision');
function openPartyPressConference(){return openStructuredPartyPress();}
