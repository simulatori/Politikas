/* Phase 6: lifecycle metadata on existing requests and meetings, one weekly receipt. */
const AGENDA_STATUS_LABELS={PENDING:'Në pritje',IN_PROGRESS:'Në proces',WAIT_DECISION:'Në pritje të vendimit',COMPLETED:'E përfunduar',EXPIRED:'E vonuar',CANCELLED:'E anuluar',INVITED:'Ftesë në pritje',SCHEDULED:'E planifikuar',MISSED:'Takim i humbur',DECLINED:'E refuzuar'};
function agendaExecutive(st){
    st=st || state;
    return !!st && st.governmentFormed && st.governmentStatus==='IN_OFFICE' && st.institutionalPhase==='GOV_IN_OFFICE' && st.mandatar===st.playerParty && (st.coalitionParties || []).includes(st.playerParty);
}
function agendaActive(r){return ['PENDING','IN_PROGRESS','WAIT_DECISION'].includes(r.status);}
function migrateWeeklyAgenda(st){
    if(!st.weeklyAgenda)st.weeklyAgenda={version:1,lastProcessedTurn:st.turnCount,recent:{},summary:null};
    (st.pmInboxRequests || []).forEach(function(r){
        if(r.agenda6)return;
        // Historical requests retain their deadlines and single-decision behavior.
        if(r.createdWeek===undefined)r.createdWeek=st.turnCount;
    });
}
function validateWeeklyAgenda(st){
    var a=st.weeklyAgenda;if(a===undefined)return;
    if(!a || a.version!==1 || !Number.isInteger(a.lastProcessedTurn) || a.lastProcessedTurn>st.turnCount || !a.recent || typeof a.recent!=='object' || Array.isArray(a.recent) || Object.values(a.recent).some(function(t){return !Number.isInteger(t) || t>st.turnCount;}))throw Error('Agjenda javore e ruajtur është e pavlefshme.');
    (st.pmInboxRequests || []).filter(function(r){return r.agenda6;}).forEach(function(r){
        if(r.political9 && (!st.parties[r.ownerParty] || r.requiresExecutive!==false || r.workWeeks!==1 || r.options.length))throw Error('Detyra politike e ruajtur është e pavlefshme.');
        if(!['PENDING','IN_PROGRESS','WAIT_DECISION','COMPLETED','EXPIRED','CANCELLED'].includes(r.status) || !Number.isInteger(r.dueTurn) || !Number.isInteger(r.workWeeks) || r.workWeeks<0 || r.workWeeks>2 || !Array.isArray(r.options) || r.status==='IN_PROGRESS' && !Number.isInteger(r.readyTurn))throw Error('Gjendja e detyrës javore është e pavlefshme.');
    });
    (st.scheduledMeetings || []).filter(function(m){return m.agenda6;}).forEach(function(m){if(!['INVITED','SCHEDULED','COMPLETED','DECLINED','MISSED','CANCELLED'].includes(m.status) || !Number.isInteger(m.dueTurn) || !m.targetName || !m.goal || m.status==='INVITED' && !Number.isInteger(m.responseDueTurn))throw Error('Ftesa ose takimi i ruajtur është i pavlefshëm.');});
}
function agendaCommit(change){
    if(state.pendingVote || weeklyProcessing)return false;
    var before=JSON.stringify(state);
    try{change();validateWeeklyAgenda(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}
    catch(error){state=JSON.parse(before);showToast(error.message);return false;}
    refreshAllUI();return true;
}
function agendaEligibleTemplates(){
    return WEEKLY_DOSSIER_TEMPLATES.filter(function(t){
        if(t.senderRole==='SPEAKER')return state.assemblyConstituted && state.speakerElected && constituentGovernmentGate(true);
        if(t.senderRole==='MINISTER')return state.ministries.some(function(m){return m.party!=='NONE';});
        return true;
    });
}
function createAgendaRequest(sourceMeeting){
    if(!agendaExecutive())return null;
    var a=state.weeklyAgenda,templates=agendaEligibleTemplates(),active=state.pmInboxRequests.filter(agendaActive);
    if(active.length>=7)return null;
    var chosen=null,key;
    for(var n=0;n<templates.length;n++){
        var t=templates[(state.turnCount+n)%templates.length];key=sourceMeeting?'meeting:'+sourceMeeting.id:t.id;
        if(!sourceMeeting && a.recent[key]!==undefined && state.turnCount-a.recent[key]<8)continue;
        if(sourceMeeting && a.recent[key]!==undefined)return null;
        chosen=t;break;
    }
    if(!chosen)return null;
    var r=buildDossierFromTemplate(chosen);if(!r)return null;
    if(chosen.senderRole==='MINISTER'){
        var minister=state.ministries.filter(function(m){return m.party!=='NONE';}).slice().sort(function(a,b){return b.risk-a.risk;})[0];
        r.senderName=minister.minister;r.senderRole=minister.name;
        r.title='Raport ministror: '+minister.currentIssue;r.desc='Shqyrtoni raportin e '+minister.name+' dhe caktoni përgjigjen ndaj problemit: '+minister.currentIssue+'.';
    }
    if(chosen.senderRole==='ADVISOR' && (state.inflation>4 || state.gdpGrowth<2.5)){
        r.title='Reagimi ndaj zhvillimeve ekonomike';r.desc='Inflacioni është '+state.inflation+'%, ndërsa rritja ekonomike është '+state.gdpGrowth+'%. Këshilltarët kërkojnë shqyrtim të përgjigjes së Qeverisë.';
    }
    r.id='agenda:'+state.turnCount+':'+key;r.agenda6=true;r.createdWeek=state.turnCount;
    r.workWeeks=sourceMeeting?1:state.turnCount%3;r.dueTurn=state.turnCount+r.workWeeks+3;
    r.deadlineWeeks=r.dueTurn-state.turnCount;r.sourceKey=key;
    r.requiresAssembly=chosen.senderRole==='SPEAKER';
    if(sourceMeeting){r.title='Shqyrtimi i propozimit: '+sourceMeeting.topic;r.desc=sourceMeeting.goal;r.senderName=sourceMeeting.targetName;r.sourceMeetingId=sourceMeeting.id;}
    r.consequenceText='Vonesa ul besimin publik një herë; vendimi nuk kryhet automatikisht.';
    state.pmInboxRequests.unshift(r);a.recent[key]=state.turnCount;return r;
}
function createAgendaInvitation(){
    if(!agendaExecutive())return null;
    if(state.scheduledMeetings.filter(function(m){return ['INVITED','SCHEDULED'].includes(m.status);}).length>=4)return null;
    var categories=['MINISTERS','MAYORS_38','PARTY_LEADERS','INTL_DIPLOMATS','CIVIL_ECON','INST_KOSOVO'];
    var category=categories[Math.floor(state.turnCount/2)%categories.length],leader=state.parties[state.playerParty].leader;
    var people=getInterlocutorsByCategory(category).filter(function(p){return p.name!==leader && !p.name.startsWith(leader+' (');});
    if(!people.length)return null;
    var person=people[state.turnCount%people.length],key='invite:'+person.name;
    if(state.weeklyAgenda.recent[key]!==undefined && state.turnCount-state.weeklyAgenda.recent[key]<8)return null;
    var minister=state.ministries.find(function(m){return m.minister===person.name;}),municipality=state.municipalities.find(function(m){return person.name.startsWith(m.mayorName);});
    var topic=minister?minister.currentIssue:municipality?municipality.issue:category==='INTL_DIPLOMATS'?'Koordinimi për çështjet e hapura diplomatike':category==='PARTY_LEADERS'?'Prioritetet politike dhe projektligjet në shqyrtim':'Raportimi mbi prioritetet institucionale';
    if(category==='INST_KOSOVO' && person.inst==='Kuvendi i Kosovës' && (!state.assemblyConstituted || !constituentGovernmentGate(true)))return null;
    var m={id:'invite:'+state.turnCount+':'+category,agenda6:true,requiresExecutive:true,origin:'INVITED',status:'INVITED',category:person.role+' ('+person.inst+')',targetName:person.name,topic:topic || 'Prioritetet javore',goal:'Shqyrtoni problemin dhe përcaktoni nëse nevojitet propozim, vendim ose negociatë.',importance:category==='INTL_DIPLOMATS'?'E lartë':'Mesatare',createdTurn:state.turnCount,dueTurn:state.turnCount+1,responseDueTurn:state.turnCount+1,hour:'10:00',rescheduled:false,outcome:null};
    state.scheduledMeetings.unshift(m);state.weeklyAgenda.recent[key]=state.turnCount;return m;
}
function agendaMeetingPenalty(m,missed){
    var amount=m.importance==='E lartë'?1:.4;
    if(missed)amount*=1.5;
    adjustPublicSupport(-(amount), {source:"agendaMeetingPenalty"}, state);
    var partner=internationalMeetingPartner(m);
    if(partner && state.internationalDiplomacy.institutions[partner]){
        internationalRelation(partner,-amount);
    }
    var party=Object.values(state.parties).find(function(p){return m.targetName===p.leader || m.targetName.startsWith(p.leader+' (');});
    if(party && Number.isFinite(state.parties[state.playerParty].relations[party.id]))state.parties[state.playerParty].relations[party.id]=clamp(state.parties[state.playerParty].relations[party.id]-amount,0,100);
    var muni=state.municipalities.find(function(c){return m.targetName.startsWith(c.mayorName);});
    if(muni)muni.relationWithGov=clamp((muni.relationWithGov || 60)-amount,0,100);
}
function respondAgendaInvitation(id,choice){
    if(!agendaExecutive()){showToast('Ftesat e Kryeministrit kërkojnë mandat të plotë.');return false;}
    var m=state.scheduledMeetings.find(function(m){return m.id===id;});
    if(!m || m.status!=='INVITED' || m.responseDueTurn<state.turnCount || !['ACCEPT','DECLINE','RESCHEDULE'].includes(choice) || choice==='RESCHEDULE' && m.rescheduled)return false;
    return agendaCommit(function(){
        if(choice==='DECLINE'){m.status='DECLINED';m.outcome='Ftesa u refuzua.';agendaMeetingPenalty(m,false);}
        else if(choice==='RESCHEDULE'){m.rescheduled=true;m.dueTurn=state.turnCount+2;m.responseDueTurn=state.turnCount+1;m.outcome='U propozua java pasardhëse; ftesa pret konfirmim.';}
        else{m.status='SCHEDULED';m.acceptedTurn=state.turnCount;m.outcome='Ftesa u pranua. Takimi zhvillohet në javën e planifikuar.';}
    });
}
function processWeeklyAgenda(){
    migrateWeeklyAgenda(state);var a=state.weeklyAgenda;if(a.lastProcessedTurn>=state.turnCount)return false;
    a.lastProcessedTurn=state.turnCount;var created=[],ready=0,overdue=0;
    state.pmInboxRequests.filter(function(r){return r.agenda6 && agendaActive(r);}).forEach(function(r){
        if(!politicalAgendaAuthorized(r) || r.requiresAssembly && (!state.assemblyConstituted || !constituentGovernmentGate(true))){r.status='CANCELLED';r.outcomeMsg='Ndryshoi mandati institucional; dosja ruhet në arkiv.';return;}
        r.deadlineWeeks=Math.max(0,r.dueTurn-state.turnCount);
        if(state.turnCount>r.dueTurn){r.status='EXPIRED';r.expiredTurn=state.turnCount;r.outcomeMsg='Afati kaloi pa vendim.';adjustPublicSupport(-(.8), {source:"processWeeklyAgenda"}, state);overdue++;}
        else if(r.status==='IN_PROGRESS' && state.turnCount>=r.readyTurn){r.status='WAIT_DECISION';ready++;}
    });
    state.scheduledMeetings.filter(function(m){return m.agenda6 && ['INVITED','SCHEDULED'].includes(m.status);}).forEach(function(m){
        if(!agendaExecutive()){m.status='CANCELLED';m.outcome='Mandati ekzekutiv ndryshoi.';return;}
        if(m.status==='INVITED' && state.turnCount>m.responseDueTurn || m.status==='SCHEDULED' && state.turnCount>m.dueTurn){m.status='MISSED';m.outcome='Afati kaloi pa pjesëmarrje ose përgjigje.';agendaMeetingPenalty(m,true);overdue++;}
    });
    if(agendaExecutive()){
        var task=createAgendaRequest();if(task)created.push(task.title);
        if(state.turnCount%2===1){var invitation=createAgendaInvitation();if(invitation)created.push('Ftesë: '+invitation.targetName);}
    }
    if(!agendaExecutive()){var politicalTask=createPoliticalAgendaTask();if(politicalTask)created.push(politicalTask.title);}
    a.summary={turn:state.turnCount,created:created,ready:ready,overdue:overdue};return true;
}
function startAgendaTask(id){
    var r=state.pmInboxRequests.find(function(r){return r.id===id;});
    if(!politicalAgendaAuthorized(r)){showToast('Detyra nuk është e disponueshme për rolin tuaj.');return false;}
    if(!r || !r.agenda6 || r.status!=='PENDING' || r.dueTurn<state.turnCount)return false;
    return agendaCommit(function(){r.startedTurn=state.turnCount;r.readyTurn=state.turnCount+r.workWeeks;r.status=r.workWeeks?'IN_PROGRESS':'WAIT_DECISION';});
}
function openAgendaTask(id){
    if(state.pmInboxRequests.some(function(r){return r.id===id && r.political9;}))return openPoliticalAgendaTask(id);
    if(!agendaExecutive())return false;
    var r=state.pmInboxRequests.find(function(r){return r.id===id;});if(!r || !r.agenda6)return false;
    var esc=electoralEscape,index=state.pmInboxRequests.indexOf(r),html='<h3>'+esc(r.title)+'</h3><p>'+esc(r.senderName)+' · '+esc(AGENDA_STATUS_LABELS[r.status])+'</p><p>'+esc(r.desc)+'</p><p>Afati: '+esc(diplomaticDate(r.dueTurn))+'</p>'+(typeof uxDecisionContext==='function'?uxDecisionContext(r):'');
    if(r.status==='PENDING')html+='<p>Përgatitja kërkon '+r.workWeeks+' javë. Vendimi merret veçmas.</p><button class="action-btn btn-gold" onclick="startAgendaTask(\''+esc(id)+'\');openAgendaTask(\''+esc(id)+'\')">Nis shqyrtimin</button>';
    if(r.status==='IN_PROGRESS')html+='<p>Materialet priten më '+esc(diplomaticDate(r.readyTurn))+'.</p>';
    if(r.status==='WAIT_DECISION' && !r.cabinetItemId){
        html+=r.options.map(function(o,i){return '<button class="choice-btn" onclick="resolvePMRequest('+index+','+i+')"><span class="choice-title">'+esc(o.label)+'</span><span class="choice-impact">Kosto e menjëhershme: €'+((o.costB || 0)*1000).toFixed(0)+'M · '+esc(publicSupportReaction(o.appDelta || 0))+'</span></button>';}).join('');
        if(['dos_ministry_report','dos_advisors'].includes(r.templateId))html+='<button class="action-btn" onclick="submitAgendaTaskToCabinet(\''+esc(id)+'\')">Paraqit propozimin e parë në mbledhjen e Qeverisë</button>';
    }
    if(r.cabinetItemId)html+='<p>Dosja pret mbledhjen e Qeverisë në javën pasuese; vendimi merret në panelin e mbledhjes.</p>';
    if(agendaActive(r))html+='<button class="action-btn" onclick="rejectPMRequest('+index+')">Refuzo kërkesën</button>';
    html+='<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button>';
    document.getElementById('interactiveActionModalContent').innerHTML=html;toggleModal('interactiveActionModal',true);return true;
}
function agendaMeetingFinished(m,scene){
    if(!m.agenda6 || !agendaExecutive() || !scene.decisions.some(function(d){return d.code==='PROPOSE';}))return;
    var task=createAgendaRequest(m);if(task){m.followUpRequestId=task.id;m.outcome+=' U hap dosja për shqyrtim në agjendë.';}
}
function submitAgendaTaskToCabinet(id){
    if(!agendaExecutive())return false;
    var r=state.pmInboxRequests.find(function(r){return r.id===id;});
    if(!r || r.status!=='WAIT_DECISION' || r.cabinetItemId || r.dueTurn<state.turnCount || !['dos_ministry_report','dos_advisors'].includes(r.templateId))return false;
    return agendaCommit(function(){
        r.cabinetItemId='cabinet:'+r.id;
        state.cabinetAgenda.push({id:r.cabinetItemId,agendaRequestId:r.id,availableTurn:state.turnCount+1,title:r.title,ministry:r.senderRole,ministerName:r.senderName,costB:r.options[0].costB || 0,approvalGain:r.options[0].appDelta || 0,done:false,note:'Dosje e agjendës javore; kërkon vendim në mbledhjen pasuese.',ministerArgument:r.desc,financeObjection:'Kontrolloni kufijtë buxhetorë para miratimit.'});
    });
}
function renderWeeklyAgenda(){
    var host=document.getElementById('weeklyAgendaPanel');if(!host)return;
    var toolbar=document.getElementById('weeklyAgendaActions');if(toolbar)toolbar.hidden=!agendaExecutive();
    if(!agendaExecutive()){renderPoliticalAgenda(host);return;}
    var esc=electoralEscape,filter=document.getElementById('weeklyAgendaFilter')?.value || 'ACTIVE',rows=[];
    function include(r){if(filter==='THIS_WEEK')return (agendaActive(r) || ['INVITED','SCHEDULED'].includes(r.status)) && (r.createdWeek===state.turnCount || r.createdTurn===state.turnCount || (r.dueTurn ?? state.turnCount+r.deadlineWeeks)<=state.turnCount);if(filter==='ALL')return true;if(filter==='OVERDUE')return ['EXPIRED','MISSED'].includes(r.status);if(filter==='INVITED')return r.status==='INVITED';if(filter==='SOON')return (agendaActive(r) || r.status==='SCHEDULED') && (r.dueTurn ?? state.turnCount+r.deadlineWeeks)-state.turnCount<=1;if(filter==='PROGRESS')return ['IN_PROGRESS','WAIT_DECISION'].includes(r.status);return agendaActive(r) || ['INVITED','SCHEDULED'].includes(r.status);}
    state.pmInboxRequests.forEach(function(r,i){if(!include(r))return;rows.push('<article><span class="tag">'+esc(AGENDA_STATUS_LABELS[r.status] || r.status)+'</span><h4>'+esc(r.title)+'</h4><p>'+esc(r.senderName)+' · Afati: '+esc(diplomaticDate(r.dueTurn ?? state.turnCount+r.deadlineWeeks))+'</p>'+(agendaActive(r)?'<button class="action-btn" onclick="openPMRequestModal('+i+')">Shqyrto kërkesën</button>':'<p>'+esc(r.outcomeMsg || '')+'</p>')+'</article>');});
    state.weeklyDossiers.forEach(function(r,i){if(!include(r))return;rows.push('<article><span class="tag">'+esc(AGENDA_STATUS_LABELS[r.status] || r.status)+'</span><h4>'+esc(r.title)+'</h4><p>'+esc(r.senderName)+' · Afati: '+r.deadlineWeeks+' javë</p>'+(agendaActive(r)?'<button class="action-btn" onclick="openWeeklyDossierModal('+i+')">Shqyrto dosjen ekzistuese</button>':'<p>'+esc(r.outcomeMsg || '')+'</p>')+'</article>');});
    state.scheduledMeetings.forEach(function(m,i){if(!include(m))return;var buttons='';
        if(m.status==='INVITED')buttons=[['ACCEPT','Prano'],['DECLINE','Refuzo'],['RESCHEDULE','Propozo javë tjetër']].filter(function(p){return p[0]!=='RESCHEDULE' || !m.rescheduled;}).map(function(p){return '<button class="action-btn" onclick="respondAgendaInvitation(\''+esc(m.id)+'\',\''+p[0]+'\')">'+p[1]+'</button>';}).join('');
        else if(m.status==='SCHEDULED')buttons='<button class="action-btn" onclick="conductScheduledMeeting('+i+')">'+(m.dueTurn<=state.turnCount?'Zhvillo takimin':'Shiko takimin e planifikuar')+'</button>';
        rows.push('<article><span class="tag">'+esc(AGENDA_STATUS_LABELS[m.status] || m.status)+' · '+esc(m.origin==='INVITED'?'Ftesë për Kryeministrin':'Takim i organizuar')+'</span><h4>'+esc(m.targetName)+'</h4><p>'+esc(m.topic)+' · '+esc(diplomaticDate(m.dueTurn))+'</p><p>'+esc(m.goal || '')+' · Rëndësia: '+esc(m.importance || 'Mesatare')+'</p><div class="candidate-actions">'+buttons+'</div></article>');
    });
    var summary=state.weeklyAgenda?.summary;
    host.innerHTML=(summary?'<p role="status">Java e re: '+summary.created.length+' zhvillime të reja · '+summary.ready+' dosje gati për vendim · '+summary.overdue+' afate të kaluara.</p>':'')+'<div class="agenda6-list">'+(rows.join('') || '<p>Nuk ka aktivitete për këtë filtër.</p>')+'</div><div class="candidate-actions"><button class="btn-top" onclick="switchMainTab(\'tab-government\');switchSubTab(\'gov\',\'meeting\',document.querySelectorAll(\'#tab-government .sub-pill\')[2])">Mbledhja e Qeverisë</button><button class="btn-top" onclick="openGovernmentCatalog()">Projektligjet dhe projektet</button><button class="btn-top" onclick="openLastWeekSummary()">Përmbledhja e javës</button></div>';
}
