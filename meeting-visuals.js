/* Shared presentation. Political effects remain in the existing decision handlers. */
const POLITICAL_SCENES={MINISTER:{title:'Takim me ministrin',place:'Zyra e Kryeministrit',symbol:'▣'},LEADERS:{title:'Takim mes liderëve',place:'Salla e konsultimeve',symbol:'◈'},COALITION:{title:'Negociatat e koalicionit',place:'Tavolina e negociatave',symbol:'◇'},EU:{title:'Takim me Bashkimin Evropian',place:'Salla e delegacioneve',symbol:'🇪🇺'},USA:{title:'Takim me përfaqësues të SHBA-së',place:'Salla e partneritetit',symbol:'🇺🇸'},FINANCE:{title:'Takim me institucion financiar',place:'Salla e bashkëpunimit ekonomik',symbol:'▥'},REGIONAL:{title:'Takim me përfaqësues të rajonit',place:'Salla e bashkëpunimit rajonal',symbol:'◎'},PRESS:{title:'Konferencë për media',place:'Qendra e mediave',symbol:'◉'},CABINET:{title:'Mbledhja e kabinetit',place:'Salla e Qeverisë',symbol:'▤'},AGREEMENT:{title:'Negociimi i marrëveshjes',place:'Salla e negociatave ndërkombëtare',symbol:'✧'}};
let politicalSceneReturnFocus=null;
function politicalSceneKind(partner,negotiation){if(negotiation && negotiation.topic==='FINANCE' || ['IMF','WB','EBRD'].includes(partner))return 'FINANCE';if(negotiation)return 'AGREEMENT';return partner==='EU'?'EU':partner==='USA'?'USA':['ALBANIA','TURKEY'].includes(partner)?'REGIONAL':'AGREEMENT';}
function politicalSceneMarkup(kind,context){
    var config=POLITICAL_SCENES[kind] || POLITICAL_SCENES.LEADERS,esc=electoralEscape,p=state.parties[state.playerParty],people=context.people || [{name:p.leader,role:getPlayerRoleLabel()},{name:context.name || 'Përfaqësuesi i palës',role:context.role || config.title}];
    return '<section class="political-scene scene-'+kind.toLowerCase()+'" data-political-scene="'+kind+'" aria-label="'+esc(config.title)+'"><div class="scene-light"></div><div class="scene-heading"><span>'+esc(config.place)+'</span><strong>'+esc(config.symbol)+' '+esc(config.title)+'</strong><small>'+esc(diplomaticDate(state.turnCount))+'</small></div><div class="scene-cast">'+people.map(function(person){var initials=person.name.split(/\s+/).filter(Boolean).slice(0,2).map(function(w){return w[0];}).join('');return '<div class="scene-person"><div class="scene-portrait" aria-hidden="true">'+esc(initials)+'</div><strong>'+esc(person.name)+'</strong><small>'+esc(person.role)+'</small></div>';}).join('')+'</div><div class="scene-desk" aria-hidden="true"><i></i><i></i><i></i></div><div class="scene-topic"><span>'+esc(context.stage || 'Shqyrtim dhe vendimmarrje')+'</span><h3>'+esc(context.topic || config.title)+'</h3><p>'+esc(context.detail || 'Shqyrtoni gjendjen aktuale dhe zgjidhni veprimin përkatës.')+'</p></div></section>';
}
function decoratePoliticalScene(hostId,kind,context){var host=document.getElementById(hostId);if(!host || host.innerHTML.includes('data-political-scene='))return;host.innerHTML=politicalSceneMarkup(kind,context)+host.innerHTML;}
function politicalSceneJournal(key,kind,text,status){
    key='visual:'+key;var scene=state.meetingScenes[key];if(!scene)scene=state.meetingScenes[key]={version:1,kind:kind,status:'OPEN',turn:state.turnCount,updatedTurn:state.turnCount,lines:[],decisions:[]};
    scene.updatedTurn=state.turnCount;scene.status=status || 'OPEN';scene.lines.push({who:'Procesverbali',text:text,turn:state.turnCount});return scene;
}
function rememberCoalitionScene(id,offer){
    var before=JSON.stringify(state),previous=state.meetingScenes['visual:coalition:'+id],scene=previous || politicalSceneJournal('coalition:'+id,'COALITION','Negociata mbetet e hapur; nuk është arritur marrëveshje.','OPEN'),draft=scene.draft || {};
    function value(key,fallback){var el=document.getElementById(key);return el?el.value:fallback;}
    draft.stage=2;draft.tone=value('negOpeningTone',draft.tone || 'PARTNERSHIP');draft.time=value('negMeetingTime',draft.time || 'KUVEND_11');
    if(offer){draft.ministries=Array.from(document.querySelectorAll('.neg-min-check:checked')).map(function(el){return Number(el.value);});draft.options={};['negOfferDeputyPM','negOfferSpeaker','negOfferPresConsensus','negOfferProgramBudget'].forEach(function(key){var el=document.getElementById(key);draft.options[key]=!!(el && el.checked);});}
    scene.draft=draft;scene.updatedTurn=state.turnCount;if(!saveGameAuto()){state=JSON.parse(before);return false;}return true;
}
function resumeCoalitionScene(id){
    var scene=state.meetingScenes['visual:coalition:'+id];if(!scene || !scene.draft || scene.status==='COMPLETED')return false;var draft=JSON.parse(JSON.stringify(scene.draft));
    if(openCoalitionRound1(id)===false)return false;
    document.getElementById('negOpeningTone').value=draft.tone;document.getElementById('negMeetingTime').value=draft.time;
    if(proceedCoalitionRound2(id)===false)return false;
    document.querySelectorAll('.neg-min-check').forEach(function(el){el.checked=(draft.ministries || []).includes(Number(el.value));});Object.keys(draft.options || {}).forEach(function(key){var el=document.getElementById(key);if(el)el.checked=draft.options[key];});return true;
}
function validatePoliticalScenes(st){Object.keys(st.meetingScenes).filter(function(k){return k.startsWith('visual:');}).forEach(function(k){var s=st.meetingScenes[k];if(!s || s.version!==1 || !POLITICAL_SCENES[s.kind] || !['OPEN','DEFERRED','COMPLETED'].includes(s.status) || !Number.isInteger(s.turn) || s.turn>st.turnCount || !Number.isInteger(s.updatedTurn) || s.updatedTurn>st.turnCount || !Array.isArray(s.lines) || !Array.isArray(s.decisions) || s.lines.some(function(l){return !l || typeof l.who!=='string' || typeof l.text!=='string' || !Number.isInteger(l.turn) || l.turn>st.turnCount;}) || s.decisions.some(function(d){return !d || typeof d.code!=='string' || !Number.isInteger(d.turn) || d.turn>st.turnCount;}))throw Error('Procesverbali i takimit është i pavlefshëm.');});}
function scheduledVisualContext(m){
    var name=m.targetName.replace(/\s*\([^)]*\)\s*$/,''),partner=internationalMeetingPartner(m),minister=state.ministries.find(function(x){return x.minister===name;}),party=Object.keys(state.parties).find(function(id){var p=state.parties[id];return p.leader===name || (p.deputyLeaders||[]).includes(name);}),institution=partner && state.internationalDiplomacy.institutions[partner];
    return {partner:partner,minister:minister,party:party,kind:partner?politicalSceneKind(partner):minister?'MINISTER':'LEADERS',name:m.targetName,role:m.category,topic:m.topic,detail:institution?institution.facts.interests:minister?minister.currentIssue:m.goal || 'Shqyrtim i çështjeve të përbashkëta.'};
}
function scheduledMeetingTopics(m){
    var c=scheduledVisualContext(m),topics=[];
    function add(id,label,statements,lawId){topics.push({id:id,label:label,statements:statements.map(function(text,i){return {id:String(i),text:text};}),lawId:lawId});}
    add('agenda',m.topic,['Kërkoj sqarime për çështjen: '+m.topic+'.','Propozoj të shqyrtojmë hapat dhe përgjegjësitë për '+m.topic+'.','Kërkoj të bashkërendojmë qëndrimet për '+m.topic+'.']);
    if(c.minister)add('minister',c.minister.currentIssue,['Kërkoj raport mbi '+c.minister.currentIssue+'.','Propozoj shqyrtimin e planit dhe buxhetit të ministrisë për këtë çështje.']);
    if(c.partner)state.internationalDiplomacy.institutions[c.partner].facts.topics.forEach(function(t){var label=INTERNATIONAL_TOPICS[t].name;add('international:'+t,label,['Kërkoj sqarimin e kushteve për '+label+'.','Propozoj hapjen e negociatave për '+label+'.']);});
    if(c.party)(state.laws||[]).filter(lawNegotiationEligible).slice(0,6).forEach(function(l){add('law:'+l.id,l.title,['Kërkoj mbështetjen e grupit për '+l.title+'.','Propozoj shqyrtimin e ndryshimeve dhe kushteve për '+l.title+'.','Kërkoj sqarimin e rezervave të grupit për '+l.title+'.'],l.id);});
    if(agendaExecutive())urgentSituationQueue().slice(0,2).forEach(function(r){add('issue:'+r.key,r.title,['Kërkoj vlerësimin tuaj për '+r.title+'.','Propozoj bashkërendimin e përgjigjes ndaj çështjes: '+r.title+'.']);});
    var scene=state.meetingScenes['visual:scheduled:'+m.id];
    topics.forEach(function(t){
        var spoken=(scene?.decisions || []).filter(function(d){return d.code==='PROPOSE' && d.topicId===t.id;});
        if(spoken.length){t.statements=spoken.some(function(d){return d.statementId==='conclude';})?[]:[{id:'conclude',text:'Përmbledh qëndrimet dhe përfundo takimin.'}];if(spoken.length===1 && spoken[0].statementId==='0')t.statements.unshift({id:'next',text:'Cili është hapi konkret pas këtij sqarimi?'});}
    });
    return topics;
}
function scheduledMeetingSelection(m){
    var topicId=document.getElementById('meetingSceneTopic')?.value,statementId=document.getElementById('meetingSceneStatement')?.value;
    var topic=scheduledMeetingTopics(m).find(function(t){return t.id===topicId;});
    return {topic:topic,statement:topic?.statements.find(function(s){return s.id===statementId;}),topicId:topicId};
}
function renderScheduledMeetingStatements(index){
    var m=state.scheduledMeetings[index],host=document.getElementById('meetingSceneStatement');if(!m || !host)return;
    var selected=scheduledMeetingSelection(m),esc=electoralEscape;
    host.innerHTML='<option value="">Zgjidh çfarë dëshiron të thuash</option>'+(selected.topic?selected.topic.statements.map(function(s){return '<option value="'+s.id+'">'+esc(s.text)+'</option>';}).join(''):'');
    var link=document.getElementById('meetingSceneTopicLink');if(link){link.hidden=!selected.topic?.lawId;link.style.display=selected.topic?.lawId?'inline-flex':'none';}
}
function openScheduledMeetingLaw(index){
    var m=state.scheduledMeetings[index];if(!m || !assertPoliticalMeeting(m) || m.status!=='SCHEDULED' || m.dueTurn>state.turnCount)return false;
    var topic=scheduledMeetingSelection(m).topic,i=topic?.lawId?state.laws.findIndex(function(l){return l.id===topic.lawId;}):-1;
    if(i<0)return false;closePoliticalMeeting();openLawNegotiations(i);return true;
}
function openScheduledVisualMeeting(index){
    if(!assertPoliticalMeeting(state.scheduledMeetings[index]))return false;
    var guarded=state.scheduledMeetings[index];if(guarded && guarded.requiresExecutive && !agendaExecutive()){showToast('Takimi kërkon mandat ekzekutiv të plotë.');return false;}
    if(guarded && !['SCHEDULED','COMPLETED'].includes(guarded.status)){showToast('Pranoni ftesën para hapjes së takimit.');return false;}
    var m=state.scheduledMeetings[index];if(!m)return false;if(state.pendingVote){showToast('Përfundoni votimin përpara takimit.');return false;}if(m.status==='SCHEDULED' && m.dueTurn>state.turnCount){showToast('Takimi është planifikuar për '+diplomaticDate(m.dueTurn)+'.');return false;}
    var before=JSON.stringify(state),c=scheduledVisualContext(m),key='visual:scheduled:'+m.id;
    if(!state.meetingScenes[key])politicalSceneJournal('scheduled:'+m.id,c.kind,'U hap takimi për '+m.topic+'. Nuk është arritur marrëveshje.','OPEN');
    if(strategyMeetingSupported(m))strategyFlow(m);
    if(!saveGameAuto()){state=JSON.parse(before);return false;}
    politicalSceneReturnFocus=document.activeElement;renderScheduledVisualMeeting(index);toggleModal('interactiveActionModal',false);toggleModal('meetingSceneModal',true);return true;
}
function renderScheduledVisualMeeting(index){
    if(strategyMeetingSupported(state.scheduledMeetings[index]))return renderStrategyMeeting(index);
    var m=state.scheduledMeetings[index];if(!m)return;var c=scheduledVisualContext(m),scene=state.meetingScenes['visual:scheduled:'+m.id],esc=electoralEscape,box=document.getElementById('meetingSceneModalContent');
    var html='<div class="scene-toolbar"><strong>Takim '+(m.political9?'politik i partisë':'institucional')+' · Ora '+esc(m.hour || 'Nuk ka të dhëna')+'</strong><button class="btn-top" id="sceneClose" onclick="closePoliticalMeeting()" aria-label="Mbyll takimin">Mbyll ×</button></div>'+politicalSceneMarkup(c.kind,c)+'<div class="scene-dialogue" aria-live="polite">'+scene.lines.map(function(l){return '<p><strong>'+esc(l.who)+':</strong> '+esc(l.text)+'</p>';}).join('')+'</div>';
    if(m.status==='COMPLETED')html+='<div class="scene-result"><h3>Takimi përfundoi</h3><p>'+esc(m.outcome || 'Shih procesverbalin e regjistruar.')+'</p></div>';
    else {
        html+='<label>Tema që dëshiron të diskutosh<select id="meetingSceneTopic" onchange="renderScheduledMeetingStatements('+index+')"><option value="">Zgjidh temën</option>'+scheduledMeetingTopics(m).map(function(t){return '<option value="'+esc(t.id)+'">'+esc(t.label)+'</option>';}).join('')+'</select></label><label>Çfarë dëshiron të thuash<select id="meetingSceneStatement"><option value="">Zgjidh fillimisht temën</option></select></label><input type="hidden" id="meetingSceneCustomMsg" value=""><p>Zgjedhja regjistrohet në procesverbal. Marrëveshjet dhe financimi kërkojnë procedurat përkatëse.</p><button class="btn-top" id="meetingSceneTopicLink" hidden style="display:none" onclick="openScheduledMeetingLaw('+index+')">Hap negociatat e këtij projektligji</button><div class="scene-choices">';
        var choices=c.partner && agendaExecutive()?[['CLARIFY','Kërko sqarime mbi kushtet'],['NEGOTIATE','Vazhdo te propozimi dhe negociatat']]:[['CLARIFY','Kërko sqarime mbi çështjen'],['PROPOSE','Paraqit propozimin për shqyrtim']];
        if(c.party)choices.push(['COMPROMISE','Kërko kompromis për agjendën e takimit']);
        if(c.minister && agendaExecutive())choices.push(['MINISTER','Hap dosjen dhe vendimet e ministrit']);
        choices.forEach(function(pair){if(['PROPOSE','NEGOTIATE','MINISTER'].includes(pair[0]) || !scene.decisions.some(function(d){return d.code===pair[0];}))html+='<button class="choice-btn" data-scene-action="'+pair[0]+'" onclick="finalizeMeetingScene('+index+',\''+pair[0]+'\')">'+(pair[0]==='PROPOSE'?'Thuaje zgjedhjen dhe vazhdo bisedën':pair[1])+'</button>';});
        html+='<button class="action-btn" data-scene-action="DEFER" onclick="finalizeMeetingScene('+index+',\'DEFER\')">Shtyje për javën e ardhshme</button><button class="action-btn btn-gold" data-scene-action="FINISH" onclick="finalizeMeetingScene('+index+',\'FINISH\')">Përfundo takimin</button></div>';
    }
    box.innerHTML=html;
    if(m.status!=='COMPLETED'){var topics=scheduledMeetingTopics(m),last=scene.decisions.filter(function(d){return d.topicId;}).at(-1),chosen=topics.find(function(t){return t.id===last?.topicId && t.statements.length;}) || topics.find(function(t){return t.statements.length;});if(chosen){document.getElementById('meetingSceneTopic').value=chosen.id;renderScheduledMeetingStatements(index);}}
    var close=document.getElementById('sceneClose');if(close && close.focus)close.focus();
}
function closePoliticalMeeting(){toggleModal('meetingSceneModal',false);if(politicalSceneReturnFocus && politicalSceneReturnFocus.isConnected && politicalSceneReturnFocus.focus)politicalSceneReturnFocus.focus();politicalSceneReturnFocus=null;}
function decideScheduledVisualMeeting(index,code){
    if(strategyMeetingSupported(state.scheduledMeetings[index]))return false;
    if(!assertPoliticalMeeting(state.scheduledMeetings[index]))return false;
    if(code==='NEGOTIATE' && !assertGovernmentAuthority('Marrëveshjet shtetërore'))return false;
    if(state.scheduledMeetings[index]?.requiresExecutive && !agendaExecutive())return false;
    var m=state.scheduledMeetings[index],scene=m && state.meetingScenes['visual:scheduled:'+m.id];if(!m || !scene || m.status!=='SCHEDULED' || m.dueTurn>state.turnCount || state.pendingVote)return false;
    var c=scheduledVisualContext(m),allowed=c.partner && agendaExecutive()?['CLARIFY','NEGOTIATE','DEFER','FINISH']:['CLARIFY','PROPOSE','DEFER','FINISH'];if(c.party)allowed.push('COMPROMISE');if(c.minister)allowed.push('MINISTER');if(!allowed.includes(code) || scene.decisions.some(function(d){return d.code===code && !['PROPOSE','DEFER','MINISTER','NEGOTIATE'].includes(code);}))return false;
    var selected=scheduledMeetingSelection(m),input=document.getElementById('meetingSceneCustomMsg'),legacyInput=!selected.topicId || (selected.topic && !document.getElementById('meetingSceneStatement')?.value),text=selected.statement?selected.statement.text:(legacyInput && input?input.value.trim():'');
    if(code==='PROPOSE' && (text.length<10 || text.length>600)){showToast('Zgjidh temën dhe çfarë dëshiron të thuash.');return false;}
    if(code==='PROPOSE' && !selected.statement && scene.decisions.some(function(d){return d.code==='PROPOSE';}))return false;
    var concluding=code==='PROPOSE' && selected.statement?.id==='conclude';
    if(code==='MINISTER' && !assertGovernmentAuthority('Takimi me ministrin'))return false;
    if(['NEGOTIATE','MINISTER'].includes(code) && scene.decisions.some(function(d){return d.code===code;})){closePoliticalMeeting();if(code==='NEGOTIATE')openInternationalDiplomacy(c.partner);else openMinisterOneOnOneModal(state.ministries.indexOf(c.minister));return true;}
    var before=JSON.stringify(state),reply='',decision={code:code,text:text.slice(0,600),turn:state.turnCount};if(selected.topic && selected.statement){decision.topicId=selected.topic.id;decision.statementId=selected.statement.id;}scene.decisions.push(decision);
    if(code==='CLARIFY')reply=c.partner?state.internationalDiplomacy.institutions[c.partner].facts.limits:c.minister?'Dosja: '+c.minister.currentIssue+'. Buxheti i ministrisë: €'+c.minister.budget+'M. Vendimet kërkojnë shqyrtim të veçantë.':c.party?'Partia përfaqëson '+state.parties[c.party].seats+' deputetë. Çdo dakordim për koalicion kërkon negociatat përkatëse.':m.goal || 'Nevojitet propozim konkret; ky takim nuk garanton dakordim.';
    if(code==='PROPOSE'){
        scene.lines.push({who:'Ju',text:text,turn:state.turnCount});
        if(selected.topic?.lawId){var discussed=state.laws.find(function(l){return l.id===selected.topic.lawId;});reply='Për '+discussed.title+', qëndrimi dhe kushtet e grupit duhet të shqyrtohen në negociatat e projektligjit. Hapni butonin e negociatave më poshtë; kjo bisedë nuk jep vota ose mbështetje automatikisht.';}
        else if(c.minister)reply='Çështja në dosje është: '+c.minister.currentIssue+'. Buxheti i regjistruar është €'+c.minister.budget+'M. Për vendim ose ndryshim fondesh, hapni dosjen e ministrit. Këtu mund ta përmbyllim konsultimin.';
        else if(selected.statement?.id==='next')reply='Për këtë bashkëbisedues nuk ka procedurë vendimmarrëse të lidhur me temën në këtë takim. Qëndrimi juaj mbetet në procesverbal; nuk është krijuar detyrim ose raport i ardhshëm. Mund të përfundoni konsultimin ose të zgjidhni një temë tjetër të disponueshme.';
        else if(selected.statement?.id==='0')reply='Për këtë temë nuk ka raport të ri të regjistruar në këtë takim. Nuk mund të konfirmoj rezultate pa të dhëna. Mund të kërkoni hapin konkret vijues ose ta përmbyllni konsultimin.';
        else reply='E regjistrova qëndrimin tuaj për '+(selected.topic?.label || m.topic)+'. Ky konsultim nuk cakton vetë përgjegjësi, fonde apo marrëveshje. Hapi vijues është shqyrtimi në dosjen ose negociatat përkatëse; tani mund ta përmbyllim takimin.';
    }
    if(code==='CLARIFY' && selected.topic?.lawId){var law=state.laws.find(function(l){return l.id===selected.topic.lawId;});reply='Projektligji: '+law.title+'. Gjendja: '+getBillStatusLabel(law.status)+'. Kostoja e deklaruar: €'+((law.costB||0)*1000).toFixed(2)+'M. Mbështetja dhe kushtet e grupit shqyrtohen te negociatat e këtij projektligji.';}
    if(code==='COMPROMISE'){var relation=state.parties[state.playerParty].relations[c.party];reply=Number.isFinite(relation) && relation>=60?'Ka gatishmëri për të bashkërenduar agjendën. Kushtet politike mbeten për negociata; nuk është arritur marrëveshje koalicioni.':'Pala kërkon sqarimin e kushteve përpara kompromisit. Nuk është arritur dakordim.';}
    if(code==='NEGOTIATE')reply='Takimi vazhdon në negociatat me '+state.internationalDiplomacy.institutions[c.partner].facts.name+'. Propozimet dhe efektet regjistrohen atje.';
    if(code==='MINISTER')reply='Dosja iu përcoll ministrit për shqyrtim dhe vendim. Nuk u miratuan fonde nga ky veprim.';
    if(code==='DEFER'){m.dueTurn=state.turnCount+1;if(m.communicationId){var communication=state.internationalDiplomacy.communications.find(function(v){return v.id===m.communicationId;});if(communication)communication.dueTurn=m.dueTurn;sealInternationalState(state.internationalDiplomacy);}scene.status='DEFERRED';reply='Takimi u shty për '+diplomaticDate(m.dueTurn)+'. Çështja mbetet e hapur.';}
    if(code==='FINISH' || concluding){m.status='COMPLETED';scene.status='COMPLETED';m.outcome='Takimi për '+m.topic+' përfundoi. '+(scene.decisions.some(function(d){return d.code==='PROPOSE';})?'Qëndrimet u regjistruan në procesverbal. ':'')+'Nuk u nënshkrua marrëveshje në këtë takim.';finishInternationalCommunicationMeeting(m);agendaMeetingFinished(m,scene);applyThematicMeetingOutcome(m,scene);reply=m.outcome;}
    scene.lines.push({who:m.targetName,text:reply,turn:state.turnCount});scene.updatedTurn=state.turnCount;
    if(!saveGameAuto()){state=JSON.parse(before);return false;}
    if(m.status==='COMPLETED'){closePoliticalMeeting();refreshAllUI();showToast(m.outcome);if(m.thematic)openThematicOutcome(m);}else if(code==='NEGOTIATE'){closePoliticalMeeting();openInternationalDiplomacy(c.partner);var topicField=document.getElementById('internationalTopic');if(topicField && selected.topic?.id.startsWith('international:'))topicField.value=selected.topic.id.slice(14);}else if(code==='MINISTER'){closePoliticalMeeting();openMinisterOneOnOneModal(state.ministries.indexOf(c.minister));}else if(code==='DEFER'){closePoliticalMeeting();refreshAllUI();}else renderScheduledVisualMeeting(index);return true;
}
window.addEventListener('keydown',function(event){var modal=document.getElementById('meetingSceneModal');if(!modal || !modal.classList.contains('show'))return;if(event.key==='Escape'){event.preventDefault();closePoliticalMeeting();}if(event.key==='Tab' && modal.querySelectorAll){var controls=Array.from(modal.querySelectorAll('button,textarea,input,select,a[href]')).filter(function(el){return !el.disabled && el.getClientRects().length;}),first=controls[0],last=controls.at(-1);if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}}});
