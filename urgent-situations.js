/* Existing dynamic events gain occurrence/history metadata. Requests remain in
   their original inbox; this module projects them, rather than duplicating them. */
var urgentNotificationTimer=null,urgentSelectedKey=null,urgentReturnFocus=null,urgentDismissedTurn=null,urgentDismissedState=null;
function migrateUrgentSituations(st){
    if(!st.urgentSituations)st.urgentSituations={version:1,events:[],presented:[]};
    var index=st.currentEventIndex||0,id='dynamic:'+index,db=st.urgentSituations;
    // These are three authored desk dossiers, not recurring weekly events.
    // Preserve older repeated occurrences, but do not present them as new work.
    db.events.forEach(function(e){
        if(e.status==='ACTIVE' && e.occurrenceIndex>=DYNAMIC_EVENTS.length){
            e.status='ARCHIVED';e.archivedTurn=st.turnCount;e.archiveReason='REPEATED_TEMPLATE';
            e.history.push({turn:st.turnCount,text:'Arkivuar si përsëritje e ciklit të vjetër; nuk u mor vendim i ri.'});
        }
    });
    if(index>=DYNAMIC_EVENTS.length)return;
    if(!db.events.some(function(e){return e.id===id;})){
        var template=DYNAMIC_EVENTS[index];
        db.events.push({id:id,occurrenceIndex:index,templateId:template.id,title:template.title,description:template.desc,cause:template.cause,category:template.category,importance:'E lartë',status:'ACTIVE',createdTurn:st.turnCount,options:template.options.map(function(o){return {text:consultationOptionText(o,st),impactText:o.impactText};}),history:[]});
    }
}
function validateUrgentSituations(st){
    var db=st.urgentSituations;if(db===undefined)return; // Old saves migrate after validation.
    if(!db || db.version!==1 || !Array.isArray(db.events) || !Array.isArray(db.presented) || new Set(db.presented).size!==db.presented.length || db.presented.some(function(id){return typeof id!=='string';}))throw Error('Regjistri i situatave urgjente është i pavlefshëm.');
    if(db.dismissedTurn!==undefined && (!Number.isInteger(db.dismissedTurn) || db.dismissedTurn>st.turnCount))throw Error('Koha e njoftimit urgjent është e pavlefshme.');
    var ids=new Set();db.events.forEach(function(e){
        if(!e || typeof e!=='object')throw Error('Situatë urgjente e pavlefshme.');
        var t=Number.isInteger(e.occurrenceIndex) && DYNAMIC_EVENTS[e.occurrenceIndex%DYNAMIC_EVENTS.length];
        if(!t || e.id!=='dynamic:'+e.occurrenceIndex || ids.has(e.id) || e.templateId!==t.id || !['ACTIVE','RESOLVED','ARCHIVED'].includes(e.status) || typeof e.title!=='string' || typeof e.description!=='string' || !Array.isArray(e.options) || e.options.length!==t.options.length || !Array.isArray(e.history) || !Number.isInteger(e.createdTurn) || e.createdTurn>st.turnCount)throw Error('Situatë urgjente e dyfishuar ose e pavlefshme.');
        if(e.status==='ARCHIVED' && (e.archiveReason!=='REPEATED_TEMPLATE' || !Number.isInteger(e.archivedTurn) || e.archivedTurn<e.createdTurn || e.archivedTurn>st.turnCount))throw Error('Dosje e arkivuar pa arsye ose kohë të vlefshme.');
        if(e.status==='RESOLVED' && (!Number.isInteger(e.decisionIndex) || !t.options[e.decisionIndex] || !Number.isInteger(e.resolvedTurn) || e.resolvedTurn<e.createdTurn || e.resolvedTurn>st.turnCount))throw Error('Vendim urgjent pa histori të vlefshme.');ids.add(e.id);
    });
}
function currentUrgentEvent(){return state.urgentSituations?.events.find(function(e){return e.id==='dynamic:'+state.currentEventIndex;});}
function urgentSituationQueue(){
    if(!state)return [];var rows=[],event=currentUrgentEvent();
    if(agendaExecutive() && event?.status==='ACTIVE')rows.push({key:event.id,type:'EVENT',record:event,title:event.title,description:event.description,importance:event.importance,status:'ACTIVE',dueTurn:null});
    (state.pmInboxRequests||[]).forEach(function(r){
        var important=String(r.urgency||r.importance||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()==='E LARTE';
        if(!important || !['PENDING','IN_PROGRESS','WAIT_DECISION'].includes(r.status) || !(r.agenda6?politicalAgendaAuthorized(r):agendaExecutive()))return;
        rows.push({key:'request:'+r.id,type:'REQUEST',record:r,title:r.title,description:r.desc,importance:r.urgency||r.importance,status:r.status==='IN_PROGRESS'?'IN_REVIEW':'ACTIVE',dueTurn:Number.isInteger(r.dueTurn)?r.dueTurn:Number.isFinite(r.deadlineWeeks)?state.turnCount+r.deadlineWeeks:null});
    });
    return rows.sort(function(a,b){return (a.dueTurn??Infinity)-(b.dueTurn??Infinity) || a.key.localeCompare(b.key);});
}
function urgentInterfaceBusy(){return !state || weeklyProcessing || weeklyVisualBusy || state.weekCalendar?.transition || state.pendingVote;}
function renderUrgentSituations(){
    var launcher=document.getElementById('urgentSituationLauncher');if(!launcher)return;
    var rows=urgentSituationQueue();launcher.hidden=!rows.length;
    launcher.setAttribute('aria-label','Situata urgjente ('+rows.length+')');
    launcher.innerHTML='<span class="urgent-dock-icon" aria-hidden="true">⚠</span><span class="urgent-wide-label">Situata urgjente ('+rows.length+')</span><span class="urgent-dock-label">Urgjente ('+rows.length+')</span>';
    var modal=document.getElementById('urgentSituationModal');if(modal?.classList.contains('show')){
        if(!rows.length)closeUrgentSituations();else renderUrgentSituationPanel();
    }
    scheduleUrgentNotification();
}
function scheduleUrgentNotification(){
    if(urgentNotificationTimer!==null)return;
    urgentNotificationTimer=setTimeout(function(){urgentNotificationTimer=null;presentNextUrgentSituation();},0);
}
function presentNextUrgentSituation(){
    var start=document.getElementById('startScreen');
    if(urgentInterfaceBusy() || urgentDismissedState===state && urgentDismissedTurn===state.turnCount || state.urgentSituations.dismissedTurn===state.turnCount || document.querySelector('.modal-overlay.show') || start && !start.classList.contains('hidden'))return false;
    var next=urgentSituationQueue().find(function(r){return !state.urgentSituations.presented.includes(r.key);});if(!next)return false;
    return openUrgentSituations(next.key);
}
function openUrgentSituations(key){
    if(urgentInterfaceBusy()){showToast('Përfundoni votimin ose kalimin e javës para shqyrtimit urgjent.');return false;}
    var rows=urgentSituationQueue(),row=rows.find(function(r){return r.key===(key||urgentSelectedKey);})||rows[0];if(!row)return false;
    if(!state.urgentSituations.presented.includes(row.key)){
        state.urgentSituations.presented.push(row.key);
        if(!saveGameAuto()){state.urgentSituations.presented.pop();return false;}
    }
    urgentSelectedKey=row.key;if(typeof acknowledgeUXUrgent==='function')acknowledgeUXUrgent(row.key);if(!document.getElementById('urgentSituationModal')?.classList.contains('show'))urgentReturnFocus=document.activeElement;
    renderUrgentSituationPanel();toggleModal('urgentSituationModal',true);
    document.getElementById('urgentSituationClose')?.focus();return true;
}
function closeUrgentSituations(){
    urgentDismissedTurn=state.turnCount;
    urgentDismissedState=state;
    var previous=state.urgentSituations.dismissedTurn;state.urgentSituations.dismissedTurn=state.turnCount;
    if(!saveGameAuto()){if(previous===undefined)delete state.urgentSituations.dismissedTurn;else state.urgentSituations.dismissedTurn=previous;}
    toggleModal('urgentSituationModal',false);
    if(urgentReturnFocus?.isConnected)urgentReturnFocus.focus({preventScroll:true});
    // Closing only acknowledges the presentation. The underlying case stays active.
}
function renderUrgentSituationPanel(){
    var rows=urgentSituationQueue(),row=rows.find(function(r){return r.key===urgentSelectedKey;})||rows[0],host=document.getElementById('urgentSituationContent');if(!host || !row)return;
    urgentSelectedKey=row.key;var e=catalogEscape,record=row.record;
    host.innerHTML='<div class="card-header"><div class="card-title">⚠ Situatë urgjente</div><button class="btn-top" id="urgentSituationClose" onclick="closeUrgentSituations()">Mbyll</button></div><p class="urgent-context">Zhvillim i lojës · Rëndësia: '+e(row.importance)+' · '+(row.status==='IN_REVIEW'?'Në shqyrtim':'Kërkon reagim')+'</p><h2>'+e(row.title)+'</h2><p>'+e(row.description)+'</p>'+(record.cause?'<p><strong>Shkaku:</strong> '+e(record.cause)+'</p>':'')+'<p><strong>Afati:</strong> '+(row.dueTurn===null?'Nuk është caktuar afat për këtë rast':e(diplomaticDate(row.dueTurn))+' · '+Math.max(0,row.dueTurn-state.turnCount)+' javë të mbetura')+'</p>'+(row.type==='EVENT'?(record.templateId==='ev_brussels_summit'?summitPanel():record.options.map(function(o,i){return '<button class="choice-btn" data-urgent-choice="'+i+'" onclick="resolveActiveEvent('+i+','+e(JSON.stringify(record.id))+')"><span class="choice-title">'+e(consultationOptionText(DYNAMIC_EVENTS[record.occurrenceIndex]?.options[i]||o,state))+'</span><span class="choice-impact">'+e(o.impactText)+'</span></button>';}).join('')):'<button class="action-btn btn-gold" onclick="openUrgentRequest('+e(JSON.stringify(row.key))+')">'+(row.status==='IN_REVIEW'?'Shih ecurinë e shqyrtimit':'Shqyrto opsionet e kërkesës')+'</button>')+'<details class="urgent-queue"><summary>Situata aktive ('+rows.length+')</summary>'+rows.map(function(r){return '<button class="btn-top" onclick="openUrgentSituations('+e(JSON.stringify(r.key))+')">'+e(r.title)+(r.status==='IN_REVIEW'?' · Në shqyrtim':'')+'</button>';}).join('')+'</details><p class="urgent-context">Mbyllja e dritares nuk e zgjidh situatën. Ajo mbetet te butoni i situatave urgjente.</p>';
    var resolved=state.urgentSituations.events.filter(function(r){return r.status==='RESOLVED';});
    if(resolved.length)host.innerHTML+='<details><summary>Vendimet e mëparshme ('+resolved.length+')</summary>'+resolved.slice().reverse().map(function(r){return '<p><strong>'+e(r.title)+'</strong><br>Java '+r.resolvedTurn+' · '+e(r.options[r.decisionIndex].text)+'<br>'+e(r.options[r.decisionIndex].impactText)+'</p>';}).join('')+'</details>';
}
function openUrgentRequest(key){
    var row=urgentSituationQueue().find(function(r){return r.key===key && r.type==='REQUEST';});if(!row || urgentInterfaceBusy())return false;
    closeUrgentSituations();openPMRequestModal(state.pmInboxRequests.indexOf(row.record));return true;
}
window.addEventListener('keydown',function(event){
    var modal=document.getElementById('urgentSituationModal');if(!modal?.classList.contains('show'))return;
    if(event.key==='Escape'){event.preventDefault();closeUrgentSituations();}
    if(event.key==='Tab'){var controls=Array.from(modal.querySelectorAll('button,summary')).filter(function(n){return n.getClientRects().length;}),first=controls[0],last=controls.at(-1);if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}}
});
