/* Metadata for existing electoral cycles; no counting, turnout or seat allocation. */
const ELECTORAL_PREPARATION_RULES=Object.freeze({version:1,minNumber:101,maxNumber:199,maxPreferences:10,source:'https://kqz-ks.org/wp-content/uploads/2025/04/Plani-i-IP-se-per-Zgjedhjet-per-Kuvendin-e-Kosoves-2025-final.pdf'});
let preferencePreparationParty=null;
function migrateElectionPreparation(st){if(st.electoralDraws===undefined)st.electoralDraws=[];validateElectionPreparation(st);}
function electoralListEditable(st,list){
    if(!list || list.status!=='DRAFT')return false;
    if(list.cycleKey.startsWith('preparation:'))return st.electionPhase==='NONE';
    var c=st.electionCampaign;
    return list.cycleKey===electoralListCycleKey(st) && st.electionPhase==='CAMPAIGN' && c && (c.status===undefined || c.status==='ACTIVE') && st.turnCount<(c.electionTurn??c.startWeek+3);
}
function electoralParticipantIds(st){if(st.electionCountConfiguration?.participants)return st.electionCountConfiguration.participants.slice();return Array.from(new Set(Object.keys(st.parties).concat(Object.keys(st.candidateRegistry||{}).filter(function(id){return Object.hasOwn(PROVIDED_CANDIDATE_LISTS,id);})))) ;}
function currentElectionDraw(st){st=st||state;var id=electionDayCycleId(st);return (st.electoralDraws||[]).find(function(d){return d.cycleId===id;})||null;}
function electoralDrawHash(d){return electionSeed(JSON.stringify({cycleId:d.cycleId,participants:d.participants,partyNumbers:d.partyNumbers,createdAt:d.createdAt,range:d.range}));}
function ensureElectionDraw(st){
    migrateElectionPreparation(st);if(!st.electionCampaign)return null;
    var existing=currentElectionDraw(st);if(existing)return existing;
    var cycle=getElectionDayCycle(st);if(cycle && cycle.status!=='READY')return null;
    var ids=electoralParticipantIds(st),r=ELECTORAL_PREPARATION_RULES,numbers=[];
    for(var number=r.minNumber;number<=r.maxNumber;number++)numbers.push(number);
    if(ids.length>numbers.length)throw Error('Intervali i shortit nuk mjafton për subjektet pjesëmarrëse.');
    for(var i=numbers.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),swap=numbers[i];numbers[i]=numbers[j];numbers[j]=swap;}
    var d={version:1,cycleId:electionDayCycleId(st),status:'CONFIRMED',participants:ids,partyNumbers:{},range:[r.minNumber,r.maxNumber],createdAt:{year:st.year,monthIndex:st.monthIndex,week:st.week,turnCount:st.turnCount},sampleBallots:[]};
    ids.forEach(function(id,index){d.partyNumbers[id]=numbers[index];});d.integrity=electoralDrawHash(d);st.electoralDraws.push(d);return d;
}
function validateElectionPreparation(st){
    if(st.electoralDraws===undefined)return;
    if(!Array.isArray(st.electoralDraws))throw Error('Historiku i shortit është i pavlefshëm.');
    var cycles=new Set();st.electoralDraws.forEach(function(d){
        if(!d || d.version!==1 || typeof d.cycleId!=='string' || !/^parliament:\d+:\d+$/.test(d.cycleId) || cycles.has(d.cycleId) || d.status!=='CONFIRMED' || !Array.isArray(d.participants) || !d.participants.length || new Set(d.participants).size!==d.participants.length || !d.partyNumbers || !Array.isArray(d.sampleBallots) || !Array.isArray(d.range) || d.range[0]!==101 || d.range[1]!==199 || !d.createdAt || !Number.isInteger(d.createdAt.turnCount) || d.integrity!==electoralDrawHash(d))throw Error('Shorti i ruajtur është i dëmtuar ose i përsëritur.');
        cycles.add(d.cycleId);var seen=new Set();d.participants.forEach(function(id){var number=d.partyNumbers[id];if(typeof id!=='string' || !Number.isInteger(number) || number<101 || number>199 || seen.has(number))throw Error('Numra të dyfishtë ose të pavlefshëm të subjekteve.');seen.add(number);});
        if(Object.keys(d.partyNumbers).length!==d.participants.length)throw Error('Subjekte të papritura në short.');
        var ballotIds=new Set();d.sampleBallots.forEach(function(b){
            if(!b || ballotIds.has(b.id) || b.cycleId!==d.cycleId || !d.participants.includes(b.partyId) || b.partyNumber!==d.partyNumbers[b.partyId] || !Array.isArray(b.candidatePool) || b.candidatePool.some(function(c,i){return !c || c.partyId!==b.partyId || typeof c.id!=='string' || c.number!==i+1;}) || new Set(b.candidatePool.map(function(c){return c.id;})).size!==b.candidatePool.length || !validPreparedPreferences(b.candidatePool,b.candidateIds) || b.noCandidatePreference!==(b.candidateIds.length===0) || b.integrity!==preparedBallotHash(b))throw Error('Preferencat e ruajtura nuk përputhen me subjektin ose listën.');ballotIds.add(b.id);
        });
    });
}
function validPreparedPreferences(pool,ids){return Array.isArray(ids) && ids.length<=10 && new Set(ids).size===ids.length && ids.every(function(id){return pool.some(function(c){return c.id===id;});});}
function preparedBallotHash(b){return electionSeed(JSON.stringify({cycleId:b.cycleId,partyId:b.partyId,partyNumber:b.partyNumber,candidateIds:b.candidateIds,candidatePool:b.candidatePool,noCandidatePreference:b.noCandidatePreference}));}
function preparationCandidatePool(st,partyId){
    var key=electionDayCycleId(st),list=(st.electoralLists||[]).find(function(l){return l.cycleKey===key && l.partyId===partyId;}),catalogue=getCandidateCatalogue(st);
    var ids=list?list.candidateIds:catalogue.filter(function(c){return candidateBelongsToParty(c,partyId);}).map(function(c){return c.id;});
    return ids.map(function(id,index){var c=catalogue.find(function(c){return c.id===id;});if(!candidateBelongsToParty(c,partyId))throw Error('Lista përmban kandidat të huaj ose të panjohur.');return {id:id,name:candidateName(c),partyId:partyId,number:index+1};});
}
function savePreparedPreferenceBallot(partyId,ids){
    var d=currentElectionDraw(state);if(!d){showToast('Kryeni shortin për ciklin aktiv.');return false;}
    if(state.electionPhase!=='CAMPAIGN' || state.electionCampaign?.status!=='ACTIVE' || state.turnCount>=state.electionCampaign.electionTurn){showToast('Përgatitja e fletëvotimit është mbyllur për këtë cikël.');return false;}
    try{
        if(!d.participants.includes(partyId))throw Error('Zgjidhni një subjekt pjesëmarrës.');
        var list=(state.electoralLists||[]).find(function(l){return l.cycleKey===d.cycleId && l.partyId===partyId;});
        if(partyId===state.playerParty && (!list || list.status!=='SUBMITTED'))throw Error('Konfirmoni dorëzimin e listës suaj para ruajtjes së preferencave.');
        var pool=preparationCandidatePool(state,partyId);if(!validPreparedPreferences(pool,ids))throw Error('Lejohen deri në dhjetë kandidatë unikë të të njëjtit subjekt.');
        var b={id:d.cycleId+':sample:'+(d.sampleBallots.length+1),cycleId:d.cycleId,partyId:partyId,partyNumber:d.partyNumbers[partyId],candidateIds:ids.slice(),candidatePool:pool,noCandidatePreference:ids.length===0,preparedAt:{turnCount:state.turnCount,year:state.year,monthIndex:state.monthIndex,week:state.week},status:'PREPARED'};
        b.candidateIds=pool.filter(function(c){return ids.includes(c.id);}).map(function(c){return c.id;});
        b.integrity=preparedBallotHash(b);if(d.sampleBallots.some(function(old){return old.integrity===b.integrity;})){showToast('Ky shembull është ruajtur tashmë.');return false;}
        d.sampleBallots.push(b);if(!saveGameAuto()){d.sampleBallots.pop();return false;}
        renderElectionPreparation();showToast('Preferencat u ruajtën si fletëvotim përgatitor; nuk janë numëruar.');return b.id;
    }catch(error){showToast(error.message);return false;}
}
function performCurrentElectionDraw(){
    if(!state.electionCampaign || !['CAMPAIGN','CAMPAIGN_CLOSED'].includes(state.electionPhase))return false;
    var before=JSON.stringify(state);try{var d=ensureElectionDraw(state);if(!d){showToast('Cikli ka votim ose rezultate historike; numrat nuk caktohen prapa.');return false;}if(!saveGameAuto()){state=JSON.parse(before);return false;}renderElectionPreparation();return d.cycleId;}catch(error){state=JSON.parse(before);showToast(error.message);return false;}
}
function openElectionPreparation(){switchMainTab('tab-party');switchSubTab('party','list',document.querySelectorAll('#tab-party .sub-pill')[1]);renderElectoralList();}
function renderElectionPreparation(){
    var host=document.getElementById('electoralPreparationPanel');if(!host || !state)return;
    var d=currentElectionDraw(state),e=electoralEscape;
    var html='<div class="election-preparation"><details open><summary>Shorti i KQZ-së për numrat zgjedhorë</summary><p>Short i simuluar nga intervali 101–199. Numri i subjektit ndryshon nga numri i kandidatit në listë.</p>';
    if(!d)html+='<p>'+(state.electionCampaign?'Ky cikël i trashëguar nuk ka short të regjistruar. Nuk caktohen numra prapa për votime ose rezultate ekzistuese.':'Shorti kryhet kur shpallen zgjedhjet e reja parlamentare.')+'</p>'+(state.electionCampaign?'<button class="action-btn" onclick="performCurrentElectionDraw()">Kryej shortin për ciklin aktiv</button>':'');
    else html+='<p>Numrat janë konfirmuar dhe ruhen për ciklin '+e(campaignCalendarLabel(d.createdAt))+'.</p><div class="draw-numbers">'+d.participants.map(function(id){return '<span><strong>'+d.partyNumbers[id]+'</strong> · '+e(state.parties[id]?.name||id)+'</span>';}).join('')+'</div><h4>Fletëvotim përgatitor preferencial</h4><p>Zgjidhni një subjekt dhe 0–10 kandidatë të tij. Këto të dhëna ruhen për përgatitje; nuk hyjnë në rezultatet ose mandatet ekzistuese.</p><label>Subjekti<select id="preferenceSubject" onchange="preferencePreparationParty=this.value;renderPreferenceCandidates()">'+d.participants.map(function(id){return '<option value="'+e(id)+'" '+(id===(preferencePreparationParty||state.playerParty)?'selected':'')+'>'+d.partyNumbers[id]+' · '+e(id)+'</option>';}).join('')+'</select></label><label>Kërko në listën e këtij subjekti<input id="preferenceSearch" type="search" oninput="filterPreferenceCandidates()"></label><p id="preferenceCount" role="status">0 / 10 kandidatë të përzgjedhur</p><div id="preferenceCandidates"></div><button class="action-btn" onclick="savePreferenceFromForm()">Ruaj fletëvotimin përgatitor</button><p>Shembuj të ruajtur për këtë cikël: '+d.sampleBallots.length+'</p>';
    html+='</details><details><summary>Historiku i shortit</summary>'+(state.electoralDraws||[]).map(function(old){return '<p>'+e(campaignCalendarLabel(old.createdAt))+' · '+old.participants.map(function(id){return e(id)+': '+old.partyNumbers[id];}).join(' · ')+' · '+old.sampleBallots.length+' fletëvotime përgatitore</p>';}).join('')+'</details>'+countConfigurationHtml()+'</div>';host.innerHTML=html;if(d)renderPreferenceCandidates();
}
function renderPreferenceCandidates(){
    var host=document.getElementById('preferenceCandidates'),select=document.getElementById('preferenceSubject');if(!host || !select)return;
    try{host.innerHTML=preparationCandidatePool(state,select.value).map(function(c){return '<label data-preference-name="'+electoralEscape(candidateSearchText(c.name))+'"><input type="checkbox" value="'+electoralEscape(c.id)+'" onchange="updatePreferenceCount(this)"> '+c.number+'. '+electoralEscape(c.name)+' · '+electoralEscape(c.partyId)+'</label>';}).join('')||'<p>Nuk ka kandidatë të regjistruar.</p>';var search=document.getElementById('preferenceSearch');if(search)search.value='';updatePreferenceCount();}catch(error){host.textContent=error.message;}
}
function filterPreferenceCandidates(){var q=candidateSearchText(document.getElementById('preferenceSearch').value);document.querySelectorAll('#preferenceCandidates label').forEach(function(label){label.hidden=!label.dataset.preferenceName.includes(q);});}
function updatePreferenceCount(changed){var checked=document.querySelectorAll('#preferenceCandidates input:checked');if(checked.length>10 && changed){changed.checked=false;showToast('Mund të zgjidhni deri në dhjetë kandidatë.');}var count=document.getElementById('preferenceCount');if(count)count.textContent=document.querySelectorAll('#preferenceCandidates input:checked').length+' / 10 kandidatë të përzgjedhur';}
function savePreferenceFromForm(){return savePreparedPreferenceBallot(document.getElementById('preferenceSubject').value,Array.from(document.querySelectorAll('#preferenceCandidates input:checked')).map(function(input){return input.value;}));}
