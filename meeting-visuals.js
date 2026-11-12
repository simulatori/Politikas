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
    var m=state.scheduledMeetings[index];if(!m)return;var c=scheduledVisualContext(m),scene=state.meetingScenes['visual:scheduled:'+m.id],esc=electoralEscape,box=document.getElementById('meetingSceneModalContent');if(!box||!scene)return;
    var html='<div class="scene-toolbar"><strong>Dosja e takimit</strong><button class="btn-top" id="sceneClose" onclick="closePoliticalMeeting()" aria-label="Mbyll dosjen">Mbyll ×</button></div><h2>'+esc(m.topic)+'</h2><p><strong>Pjesëmarrësi:</strong> '+esc(m.targetName)+'</p><p>'+esc(m.category||'Takim institucional')+' · '+esc(diplomaticDate(m.dueTurn))+' · '+esc(m.hour||'Ora nuk është caktuar')+'</p><p>'+esc(m.goal||c.detail)+'</p>';
    if(m.status==='COMPLETED')html+='<section class="scene-result"><h3>Takimi përfundoi</h3><p>'+esc(m.outcome||'Takimi është regjistruar.')+'</p></section>';
    else{
        html+='<p>Veprimet për këtë dosje kryhen në institucionin përkatës.</p><div class="scene-choices">';
        if(c.partner&&agendaExecutive())html+='<button class="action-btn" data-scene-action="NEGOTIATE" onclick="finalizeMeetingScene('+index+',\'NEGOTIATE\')">Hap negociatat dhe propozimin zyrtar</button>';
        if(c.minister&&agendaExecutive())html+='<button class="action-btn" data-scene-action="MINISTER" onclick="finalizeMeetingScene('+index+',\'MINISTER\')">Hap dosjen e ministrit</button>';
        (state.laws||[]).filter(l=>lawNegotiationEligible(l)&&(l.id===m.lawId||l.title===m.topic)).forEach(l=>{const li=state.laws.indexOf(l);html+='<button class="action-btn" onclick="closePoliticalMeeting();openLawNegotiations('+li+')">Negociatat për '+esc(l.title)+'</button>';});
        html+='<button class="action-btn" data-scene-action="DEFER" onclick="finalizeMeetingScene('+index+',\'DEFER\')">Shtyje për javën e ardhshme</button><button class="action-btn btn-gold" data-scene-action="FINISH" onclick="finalizeMeetingScene('+index+',\'FINISH\')">Përfundo takimin</button></div>';
    }
    if(scene.lines.length>1)html+='<details><summary>Procesverbali i ruajtur</summary>'+scene.lines.map(l=>'<p><strong>'+esc(l.who)+':</strong> '+esc(l.text)+'</p>').join('')+'</details>';
    box.innerHTML=html;document.getElementById('sceneClose')?.focus?.({preventScroll:true});
}
function closePoliticalMeeting(){toggleModal('meetingSceneModal',false);if(politicalSceneReturnFocus && politicalSceneReturnFocus.isConnected && politicalSceneReturnFocus.focus)politicalSceneReturnFocus.focus();politicalSceneReturnFocus=null;}
function decideScheduledVisualMeeting(index,code){
    if(strategyMeetingSupported(state.scheduledMeetings[index]))return false;
    if(!assertPoliticalMeeting(state.scheduledMeetings[index]))return false;
    var m=state.scheduledMeetings[index],scene=m&&state.meetingScenes['visual:scheduled:'+m.id];
    if(!m||!scene||m.status!=='SCHEDULED'||m.dueTurn>state.turnCount||state.pendingVote||m.requiresExecutive&&!agendaExecutive())return false;
    var c=scheduledVisualContext(m),allowed=['DEFER','FINISH'];if(c.partner&&agendaExecutive())allowed.push('NEGOTIATE');if(c.minister&&agendaExecutive())allowed.push('MINISTER');if(!allowed.includes(code))return false;
    if(['NEGOTIATE','MINISTER'].includes(code)&&!assertGovernmentAuthority('Veprimi institucional'))return false;
    if(['NEGOTIATE','MINISTER'].includes(code)&&scene.decisions.some(d=>d.code===code)){closePoliticalMeeting();if(code==='NEGOTIATE')openInternationalDiplomacy(c.partner);else openMinisterOneOnOneModal(state.ministries.indexOf(c.minister));return true;}
    var before=JSON.stringify(state),reply='';scene.decisions.push({code,text:'',turn:state.turnCount});
    if(code==='NEGOTIATE')reply='Dosja vazhdon në negociatat me '+state.internationalDiplomacy.institutions[c.partner].facts.name+'.';
    if(code==='MINISTER')reply='Dosja iu përcoll ministrit për shqyrtim dhe vendim.';
    if(code==='DEFER'){m.dueTurn=state.turnCount+1;if(m.communicationId){var communication=state.internationalDiplomacy.communications.find(v=>v.id===m.communicationId);if(communication)communication.dueTurn=m.dueTurn;sealInternationalState(state.internationalDiplomacy);}scene.status='DEFERRED';reply='Takimi u shty për '+diplomaticDate(m.dueTurn)+'.';}
    if(code==='FINISH'){m.status='COMPLETED';scene.status='COMPLETED';m.outcome='Takimi për '+m.topic+' përfundoi. Nuk u nënshkrua marrëveshje në këtë takim.';finishInternationalCommunicationMeeting(m);agendaMeetingFinished(m,scene);applyThematicMeetingOutcome(m,scene);reply=m.outcome;}
    scene.lines.push({who:'Procesverbali',text:reply,turn:state.turnCount});scene.updatedTurn=state.turnCount;
    if(!saveGameAuto()){state=JSON.parse(before);return false;}
    if(m.status==='COMPLETED'){closePoliticalMeeting();refreshAllUI();showToast(m.outcome);if(m.thematic)openThematicOutcome(m);}else if(code==='NEGOTIATE'){closePoliticalMeeting();openInternationalDiplomacy(c.partner);}else if(code==='MINISTER'){closePoliticalMeeting();openMinisterOneOnOneModal(state.ministries.indexOf(c.minister));}else{closePoliticalMeeting();refreshAllUI();}return true;
}
window.addEventListener('keydown',function(event){var modal=document.getElementById('meetingSceneModal');if(!modal || !modal.classList.contains('show'))return;if(event.key==='Escape'){event.preventDefault();closePoliticalMeeting();}if(event.key==='Tab' && modal.querySelectorAll){var controls=Array.from(modal.querySelectorAll('button,textarea,input,select,a[href]')).filter(function(el){return !el.disabled && el.getClientRects().length;}),first=controls[0],last=controls.at(-1);if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}}});
