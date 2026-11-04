/* Read-only projections of existing game records. UI preferences never enter game saves. */
var uxNotificationState=null,uxMessages=[],uxReadUrgent=new Set();
// Presentation preferences only: filtering and paging never enter the saved game.
var uxListPages={};
function uxPageRows(key,rows,signature){
    var view=uxListPages[key];
    if(!view || view.owner!==state || view.signature!==signature)view=uxListPages[key]={owner:state,signature:signature,page:0};
    view.pages=Math.max(1,Math.ceil(rows.length/12));view.page=Math.max(0,Math.min(view.page,view.pages-1));view.total=rows.length;
    return rows.slice(view.page*12,view.page*12+12);
}
function uxListPage(key,page){
    var render={deputies:renderDeputyMandateDirectory,projects:filterGovernmentCatalog,sectorLaws:renderSectorLawList}[key],view=uxListPages[key];
    if(!render || !view || view.owner!==state || !Number.isInteger(page) || page<0 || page>=view.pages)return false;
    view.page=page;render();document.getElementById(key==='deputies'?'deputyMandatesPanel':key==='sectorLaws'?'sectorLawList':'catalog13Projects')?.scrollIntoView?.({block:'start',behavior:'smooth'});return true;
}
function uxPageControls(key){
    var v=uxListPages[key];if(!v || !v.total)return '<p role="status">Nuk ka rezultate me këta filtra.</p>';
    return '<nav class="candidate-actions ux-pagination" aria-label="Faqet e listës"><span role="status">'+(v.page*12+1)+'–'+Math.min(v.total,v.page*12+12)+' nga '+v.total+' · Faqja '+(v.page+1)+'/'+v.pages+'</span>'+(v.pages>1?'<button class="btn-top" '+(v.page===0?'disabled':'')+' onclick="uxListPage(\''+key+'\','+(v.page-1)+')">← Mbrapa</button><button class="btn-top" '+(v.page+1===v.pages?'disabled':'')+' onclick="uxListPage(\''+key+'\','+(v.page+1)+')">Tjetër →</button>':'')+'</nav>';
}
function openUXWorkspace(key){
    var routes={finance:['tab-government','gov','fiscal'],projects:['tab-development'],laws:['tab-assembly','ass','laws'],diplomacy:['tab-diplomacy','dip','institutions']},r=routes[key];if(!r)return false;
    switchMainTab(r[0]);if(r[1]){var button=Array.from(document.querySelectorAll('#'+r[0]+' .sub-pill')).find(function(b){return (b.getAttribute('onclick') || '').includes("'"+r[2]+"'");});switchSubTab(r[1],r[2],button);}
    if(key==='diplomacy')renderInternationalDiplomacy();return true;
}
function uxSession(){if(uxNotificationState!==state){uxNotificationState=state;uxMessages=[];uxReadUrgent=new Set();}}
function uxGuideKey(){return 'republika:ux:guide:'+state.mode+':'+state.playerParty+':'+politicalPlayerRole().id;}
function uxGuideSeen(){try{return localStorage.getItem(uxGuideKey())==='seen';}catch(_){return false;}}
function acknowledgeUXGuide(){var guide=document.querySelector('#dashboardRoleGuidePanel details');if(guide)guide.open=false;try{localStorage.setItem(uxGuideKey(),'seen');}catch(_){}renderPlayerGuidance();}
function uxRoleExplanation(role){
    if(role.executive)return 'Ju drejtoni Qeverinë. Shqyrtoni dosjet, takimet dhe afatet para kalimit të javës. Vendimet mbeten në dorën tuaj.';
    if(role.id==='MANDATAR')return 'Detyra juaj është formimi i Qeverisë sipas fazës institucionale. Hapat dhe kushtet gjenden te Kuvendi dhe përgatitja e kabinetit.';
    if(role.id==='CARETAKER')return 'Qeveria ka kompetenca të kufizuara. Kontrolloni fazën institucionale; veprimet ekzekutive mbeten të kufizuara sipas rregullave ekzistuese.';
    if(role.parliamentary)return 'Veproni përmes grupit parlamentar, projektligjeve dhe kontakteve politike. Kërkesat e Kryeministrit nuk janë vendime të partisë suaj.';
    return 'Përfaqësoni partinë jashtë Kuvendit. Përgatitni listën zgjedhore dhe përdorni agjendën politike; nuk keni kompetenca qeveritare.';
}
function uxWeeklyPriorities(){
    if(!state)return [];var role=politicalPlayerRole(),rows=[],seen=new Set();
    function add(row){if(!seen.has(row.id)){rows.push(row);seen.add(row.id);}}
    urgentSituationQueue().forEach(function(r){add({id:r.key,title:r.title,turn:r.dueTurn,urgent:true,kind:'urgent',reason:r.dueTurn===null?'Situatë aktive; nuk është caktuar afat.':'Situatë urgjente me afat të regjistruar.'});});
    stateCalendarEntries().map(function(r){
        // The response deadline of an invitation can precede the meeting itself.
        var m=r.source==='meeting' && state.scheduledMeetings.find(function(m){return String(m.id)===r.key;});
        return m && m.status==='INVITED' && Number.isInteger(m.responseDueTurn)?Object.assign({},r,{turn:m.responseDueTurn,title:'Përgjigjja për ftesën: '+m.targetName}):r;
    }).filter(function(r){
        if(!['WAITING','PLANNED','OVERDUE'].includes(r.status) || r.turn!==null && r.turn>state.turnCount+1)return false;
        if(r.source==='request'){var q=state.pmInboxRequests.find(function(q){return String(q.id)===r.key;});return q && agendaActive(q) && politicalAgendaAuthorized(q) && q.status!=='IN_PROGRESS';}
        if(r.source==='meeting'){var m=state.scheduledMeetings.find(function(m){return String(m.id)===r.key;});return m && ['INVITED','SCHEDULED'].includes(m.status) && (!m.ownerParty || m.ownerParty===state.playerParty) && (!m.requiresExecutive || role.executive);}
        if(['law','session','president'].includes(r.source))return role.parliamentary;
        return role.executive && ['dossier','cabinet','dialogue','agreementTask','loan','fiscal','negotiation'].includes(r.source);
    }).forEach(function(r){add({id:r.id,title:r.title,turn:r.turn,kind:'calendar',reason:r.turn===null?'Në pritje; kontrolloni kushtet në dosje.':r.turn<state.turnCount?'Afati i regjistruar ka kaluar.':r.turn===state.turnCount?'Afati është këtë javë.':'Afati është javën e ardhshme.'});});
    return rows.sort(function(a,b){return (a.turn??Infinity)-(b.turn??Infinity) || Number(b.urgent || false)-Number(a.urgent || false) || a.id.localeCompare(b.id);});
}
function openUXPriority(id){
    var item=uxWeeklyPriorities().find(function(r){return r.id===id;});if(!item){showToast('Gjendja ka ndryshuar. Kontrolloni agjendën aktuale.');return false;}
    if(item.kind==='urgent')return openUrgentSituations(id);
    return openStateCalendarItem(id);
}
function openUXAgenda(){switchMainTab('tab-dashboard');switchSubTab('dash','inbox',document.querySelectorAll('#tab-dashboard .sub-pill')[1]);}
function openUXRoleWorkspace(){
    var role=politicalPlayerRole();
    if(role.parliamentary || ['MANDATAR','CARETAKER'].includes(role.id)){
        switchMainTab('tab-assembly');
        var key=!state.assemblyConstituted?'constituent':'laws';switchSubTab('ass',key,document.querySelector('[data-assembly-tab="'+key+'"]'));
    }else{switchMainTab('tab-party');switchSubTab('party','list',document.querySelectorAll('#tab-party .sub-pill')[1]);}
}
function uxStateProgress(st){
    var summary=stateDevelopmentSummary(st);
    return {active:summary.active,completed:summary.completed,normative:(st.laws||[]).filter(function(l){return l.status==='PASSED' && l.legalEffectMode==='PROCEDURAL';}).length,arrears:Number.isFinite(st.publicFinance?.arrearsB)?st.publicFinance.arrearsB:null,
        sectors:(st.stateSectors||[]).filter(function(s){return Number.isFinite(s.score);}).slice().sort(function(a,b){return a.score-b.score || a.id.localeCompare(b.id);}).slice(0,3).map(function(s){var initial=st.sectorInitialScores?.[s.id];return {id:s.id,name:s.name,score:s.score,delta:Number.isFinite(initial)?s.score-initial:null};})};
}
function uxStateProgressMarkup(open){
    var p=uxStateProgress(state),e=electoralEscape;
    return '<details class="card" id="uxStateProgress" '+(open?'open':'')+'><summary>Ecuria e shtetit · Projekte dhe drejtime pune</summary><p>'+p.active+' projekte/reforma aktive · '+p.completed+' të përfunduara. Përmbledhje e projekteve qeveritare, komunale dhe reformave.</p><p>'+(p.arrears===null?'Detyrimet e papaguara nuk janë regjistruar.':'Detyrime publike të papaguara: €'+(p.arrears*1000).toFixed(2)+'M. Shlyerja shqyrtohet te buxheti, jo nga kjo përmbledhje.')+'</p><h3>Sektorët me indekset më të ulëta</h3><p>Krahasim me fillimin e skenarit. Hapni detajet për të shqyrtuar masat dhe kushtet e disponueshme.</p><ul>'+p.sectors.map(function(s){return '<li><strong>'+e(s.name)+'</strong>: '+s.score.toFixed(1)+'/100 · '+(s.delta===null?'Baza fillestare nuk është regjistruar':(s.delta>=0?'+':'')+s.delta.toFixed(1)+' pikë nga fillimi')+' <button class="btn-top" onclick="openSectorLaws(\''+e(s.id)+'\')">Shqyrto ligjet dhe masat</button></li>';}).join('')+'</ul>'+(p.normative?'<p>'+p.normative+' akte normative të miratuara. Kjo nuk provon zbatimin praktik; hapni dokumentin për masat dhe kushtet.</p>':'')+'<div class="candidate-actions"><button class="btn-top" onclick="openUXWorkspace(\'projects\')">Projektet dhe progresi</button><button class="btn-top" onclick="openUXWorkspace(\'finance\')">Arka dhe detyrimet</button></div></details>';
}
function renderPlayerGuidance(){
    var host=document.getElementById('playerGuidancePanel');if(!host || !state)return;
    var progressOpen=document.getElementById('uxStateProgress')?.open;
    var roleOpen=document.querySelector('#dashboardRoleGuidePanel details')?.open;
    var shortcutsOpen=document.querySelector('#dashboardShortcutsPanel details')?.open;
    var e=electoralEscape,role=politicalPlayerRole(),rows=uxWeeklyPriorities(),seen=uxGuideSeen();
    host.innerHTML='<section class="card ux-week"><div class="card-header"><h2>Kjo javë · Nga t’ia filloj?</h2><span class="tag tag-gold">'+e(role.label)+'</span></div><p>Java '+state.week+' · '+e(diplomaticDate(state.turnCount))+'</p><details '+((roleOpen ?? !seen)?'open':'')+'><summary>Roli yt dhe hapat e parë</summary><p>'+e(uxRoleExplanation(role))+'</p><ol><li>Lexoni çështjet me afat më poshtë dhe hapni dosjen përkatëse.</li><li>Kontrolloni koston, kohën dhe kushtet para se të vendosni.</li><li>Kur të jeni gati, kaloni javën. Përmbledhja tregon ndryshimet dhe afatet e reja.</li></ol><p>Renditja ndjek afatet; nuk zgjedh qëndrimin tuaj politik.</p>'+(!seen?'<button class="btn-top" onclick="acknowledgeUXGuide()">E kuptova · Mbyll udhëzimin</button>':'')+'</details><h3>Çështje për vëmendje</h3>'+(rows.length?'<ol class="ux-priorities">'+rows.slice(0,3).map(function(r){return '<li><strong>'+e(r.title)+'</strong><p>'+e(r.reason)+(r.turn!==null?' · '+e(diplomaticDate(r.turn)):'')+'</p><button class="action-btn" onclick="openUXPriority('+e(JSON.stringify(r.id))+')">Hap dosjen</button></li>';}).join('')+'</ol><p>Shfaqen '+Math.min(3,rows.length)+' nga '+rows.length+' çështje me afat të afërt ose në pritje.</p>':'<p>Nuk ka çështje me afat të afërt për rolin tuaj në këtë përmbledhje. Mund të shqyrtoni agjendën ose të planifikoni veprimet e ardhshme.</p>')+'<div class="candidate-actions"><button class="action-btn" onclick="openUXAgenda()">'+(role.executive?'Agjenda e Kryeministrit':'Agjenda politike')+'</button><button class="btn-top" onclick="openStateCalendar()">Të gjitha afatet</button><button class="btn-top" onclick="openUXRoleWorkspace()">'+(role.parliamentary || ['MANDATAR','CARETAKER'].includes(role.id)?'Hapat në Kuvend':'Lista e partisë')+'</button></div></section>';
    renderUXNotifications();
    var progressHost=document.getElementById('dashboardProgressPanel');
    var progress=uxStateProgress(state);
    if(progressHost)progressHost.innerHTML='<section class="dashboard-vitals" aria-label="Ecuria e shtetit"><div><span>Projekte aktive</span><strong>'+progress.active+'</strong></div><div><span>Të përfunduara</span><strong>'+progress.completed+'</strong></div><div><span>Detyrime të papaguara</span><strong>'+(progress.arrears===null?'Pa të dhëna':'€'+(progress.arrears*1000).toFixed(2)+'M')+'</strong></div></section>'+uxStateProgressMarkup(progressOpen);
    document.getElementById('dashboardShortcutsPanel').innerHTML='<details class="card ux-shortcuts" '+(shortcutsOpen?'open':'')+'><summary>Ku ta kryej veprimin?</summary><p>Hapni drejtpërdrejt ekranin përkatës. Këto lidhje nuk marrin vendim dhe nuk paguajnë fonde.</p><div class="candidate-actions"><button class="btn-top" onclick="openUXWorkspace(\'finance\')">Arka dhe buxheti</button><button class="btn-top" onclick="openUXWorkspace(\'projects\')">Projektet dhe financimi</button><button class="btn-top" onclick="openUXWorkspace(\'laws\')">Ligjet dhe mbështetja</button><button class="btn-top" onclick="openUXWorkspace(\'diplomacy\')">Negociatat ndërkombëtare</button></div></details>';
    var guide=host.querySelector('.ux-week > details');
    if(guide){guide.classList.add('card');document.getElementById('dashboardRoleGuidePanel').replaceChildren(guide);}
}
function uxDecisionContext(record){
    var e=electoralEscape,preparing=record.status==='PENDING' && record.agenda6;
    return '<aside class="ux-decision-context"><strong>Para se të vendosni</strong><dl><dt>Veprimi tani</dt><dd>'+e(preparing?'Nisni përgatitjen; vendimi përfundimtar merret veçmas.':record.cabinetItemId?'Dosja pret vendimin e mbledhjes së Qeverisë.':'Zgjidhni një alternativë; kostoja e saj kontrollohet para ekzekutimit.')+'</dd>'+(Number.isFinite(record.workWeeks)?'<dt>Koha e përgatitjes</dt><dd>'+record.workWeeks+' javë; nuk është premtim për përfundimin e zbatimit.</dd>':'')+'<dt>Kushtet</dt><dd>'+e(record.requiresAssembly?'Kërkohet Kuvend funksional dhe kompetenca përkatëse.':'Veprimi varet nga roli juaj, statusi i dosjes dhe afati i regjistruar.')+'</dd><dt>Pasojat</dt><dd>Kostoja e shënuar i përket alternativës. Reagimet politike varen nga gjendja e lojës; propozimi nuk garanton marrëveshje ose përfundim projekti.</dd></dl></aside>';
}
function recordUXNotification(message){
    if(!state || !message)return;uxSession();var text=String(message),previous=uxMessages.find(function(m){return m.turn===state.turnCount && m.text===text;});
    if(previous){previous.read=false;previous.count++;}else uxMessages.unshift({turn:state.turnCount,text:text,count:1,read:false});
    uxMessages=uxMessages.slice(0,30);renderUXNotifications();
}
function acknowledgeUXUrgent(key){if(!state)return;uxSession();uxReadUrgent.add(state.turnCount+':'+key);renderUXNotifications();}
function markUXMessagesRead(){uxSession();uxMessages.forEach(function(m){m.read=true;});urgentSituationQueue().forEach(function(r){uxReadUrgent.add(state.turnCount+':'+r.key);});renderUXNotifications();}
function renderUXNotifications(){
    var host=document.getElementById('uxNotificationsContent');if(!host || !state)return;uxSession();var e=electoralEscape,urgent=urgentSituationQueue(),unread=uxMessages.filter(function(m){return !m.read;}).length+urgent.filter(function(r){return !uxReadUrgent.has(state.turnCount+':'+r.key);}).length;
    var button=document.getElementById('uxNotificationsButton');if(button)button.textContent='Njoftimet'+(unread?' ('+unread+' të reja)':'');
    host.innerHTML='<p>Situatat aktive kërkojnë shqyrtim në dosjen e tyre. Shënimi si i lexuar nuk pranon ftesë, nuk merr vendim dhe nuk ndryshon afatet.</p><h3>Kërkojnë vëmendje ('+urgent.length+')</h3>'+(urgent.length?urgent.map(function(r){return '<article><strong>'+e(r.title)+'</strong><p>'+e(r.importance || 'Situatë aktive')+'</p><button class="btn-top" onclick="openUrgentSituations('+e(JSON.stringify(r.key))+')">Shqyrto situatën</button></article>';}).join(''):'<p>Nuk ka situata urgjente aktive për rolin tuaj.</p>')+'<details><summary>Mesazhet e fundit të këtij sesioni ('+uxMessages.length+')</summary>'+uxMessages.map(function(m){return '<p><strong>Java '+m.turn+'</strong> · '+e(m.text)+(m.count>1?' · Shfaqur '+m.count+' herë':'')+'</p>';}).join('')+'</details><button class="btn-top" onclick="markUXMessagesRead()">Shëno njoftimet si të lexuara</button>';
}
function openUXNotifications(){
    switchMainTab('tab-dashboard');switchSubTab('dash','overview',document.querySelectorAll('#tab-dashboard .sub-pill')[0]);renderUXNotifications();
    var panel=document.getElementById('uxNotificationsPanel');panel.open=true;panel.tabIndex=-1;panel.focus({preventScroll:true});panel.scrollIntoView({block:'start',behavior:'smooth'});
}
