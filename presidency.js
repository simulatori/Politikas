/* Presidential lifecycle uses the existing 12 x 4 week calendar and assembly voting engine. */
function presidentialCalendarTurn(st){return st.year*48+st.monthIndex*4+st.week-1;}
function migratePresidency(st){
    if(st.presidency)return;
    var now=presidentialCalendarTurn(st),start=st.presidentMandateStartYear || st.year;
    st.presidency={version:1,startTurn:st.presidentElected?st.turnCount-(now-start*48):null,endTurn:st.presidentElected?st.turnCount+((start+5)*48-now):null,procedure:null,history:[],successor:null,review:null,counter:0};
    if(!st.presidentElected){
        st.presidency.procedure={id:'presidential:legacy',status:'OPEN',reason:'VACANT',openedTurn:st.turnCount,deadlineTurn:st.turnCount+Math.max(1,Math.min(8,st.presidentialDeadlineWeeks||8)),candidateId:st.presidentialCandidateId,negotiations:[],results:[],sessionId:null};
        st.presidentialElectionInProgress=true;
    }else{st.presidentialElectionInProgress=false;st.presidentialNegotiations=null;}
}
function validatePresidency(st){
    if(st.presidency===undefined)return;
    var db=st.presidency;
    if(!db || db.version!==1 || !Array.isArray(db.history) || !Number.isInteger(db.counter) || [db.startTurn,db.endTurn].some(function(t){return t!==null&&!Number.isInteger(t);}) || db.endTurn!==null && db.endTurn-db.startTurn!==240)throw Error('Mandati presidencial i ruajtur është i pavlefshëm.');
    [db.procedure].concat(db.history).filter(Boolean).forEach(function(p){if(!p.id || !['OPEN','ELECTED','FAILED'].includes(p.status) || !Number.isInteger(p.deadlineTurn) || !Array.isArray(p.results) || !Array.isArray(p.negotiations) || p.results.some(function(r){return !Number.isInteger(r.round) || r.round<1 || r.round>3 || [r.pro,r.kunder,r.abstenim,r.mungese].some(function(n){return !Number.isInteger(n)||n<0;}) || r.pro+r.kunder+r.abstenim+r.mungese!==120;}))throw Error('Procedura presidenciale e ruajtur është e pavlefshme.');});
    if(db.successor && (!db.successor.name || !Number.isInteger(db.successor.startTurn)))throw Error('Pasuesi presidencial i ruajtur është i pavlefshëm.');
}
function presidentialOpeningReason(st){
    st=st || state;var d=st.presidency;if(!d)return null;
    if(d.successor)return null;
    if(!st.presidentElected || d.endTurn!==null && st.turnCount>=d.endTurn)return 'VACANT';
    if(d.endTurn-st.turnCount<=4)return 'SUCCESSION';
    return null;
}
function presidentialActionAllowed(requireSession){
    if(state.pendingVote){showToast('Përfundoni votimin në zhvillim.');return false;}
    if(!assertPoliticalParliament('Procedura presidenciale') || !assertAssemblyFunctional('Procedura presidenciale'))return false;
    var p=state.presidency?.procedure;
    if(!p || p.status!=='OPEN' || state.turnCount>p.deadlineTurn || state.presidentElected && state.presidency.endTurn-state.turnCount>4){showToast('Nuk ka procedurë të vlefshme presidenciale. Mandati aktiv nuk mund të ndërpritet nga një kërkesë politike.');return false;}
    if(requireSession){var s=state.parliamentarySessions.find(function(s){return s.id===p.sessionId;});if(!s || s.week>state.turnCount || !['SCHEDULED','READY'].includes(s.status)){showToast('Caktoni seancën presidenciale dhe prisni javën e saj.');return false;}}
    return true;
}
function presidentialCommit(change){
    if(state.pendingVote || weeklyProcessing)return false;
    var before=JSON.stringify(state);try{change();validatePresidency(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}catch(e){state=JSON.parse(before);showToast(e.message);return false;}refreshAllUI();return true;
}
function beginPresidentialProcedure(){
    if(state.pendingVote || !assertPoliticalParliament('Hapja e procedurës') || !assertAssemblyFunctional('Hapja e procedurës'))return false;
    var db=state.presidency,reason=presidentialOpeningReason();
    if(db.procedure?.status==='OPEN'){showToast('Procedura është tashmë aktive. Vazhdoni kandidaturën, negociatat ose seancën.');return false;}
    if(!reason){showToast('Presidenti ka mandat aktiv. Procedura për pasuesin hapet në katër javët e fundit ose kur posti mbetet vakant.');return false;}
    if(db.procedure?.status==='FAILED' && db.procedure.assemblyCycle===deputyCycleId(state)){showToast('Procedura dështoi. Pritet përfundimi i procesit parlamentar të nisur.');return false;}
    return presidentialCommit(function(){
        if(db.procedure)db.history.push(db.procedure);
        db.procedure={id:'presidential:'+(++db.counter)+':'+state.turnCount,status:'OPEN',reason:reason,assemblyCycle:deputyCycleId(state),openedTurn:state.turnCount,deadlineTurn:state.turnCount+8,candidateId:null,negotiations:[],results:[],sessionId:null};
        state.presidentialCandidateId=null;state.presidentialRound=1;state.presidentialElectionInProgress=true;state.presidentialDeadlineWeeks=8;state.presidentialNegotiations=null;state.quorumPledgedParties=state.coalitionParties.slice();
    });
}
function selectPresidentialCandidate(id){
    if(!presidentialActionAllowed(false))return false;var c=getAllPresCandidates()[id],p=state.presidency.procedure;
    if(!c){showToast('Zgjidhni një kandidat nga lista ekzistuese.');return false;}
    if(p.results.some(function(r){return r.hasQuorum;})){showToast('Kandidatura nuk ndryshohet pas nisjes së raundeve të vlefshme.');return false;}
    return presidentialCommit(function(){p.candidateId=id;p.proposer=state.playerParty;state.presidentialCandidateId=id;state.presidentialNegotiations=null;});
}
function withdrawPresidentialCandidate(){
    if(!presidentialActionAllowed(false))return false;var p=state.presidency.procedure;
    if(p.results.some(function(r){return r.hasQuorum;})){showToast('Raundet e vlefshme kanë nisur; kandidatura nuk mund të tërhiqet nga ky panel.');return false;}
    return presidentialCommit(function(){p.candidateId=null;state.presidentialCandidateId=null;state.presidentialNegotiations=null;});
}
function nominateExistingPresidentialMP(seat){
    if(!presidentialActionAllowed(false))return false;
    if(state.presidency.procedure.results.some(function(r){return r.hasQuorum;})){showToast('Kandidaturat nuk ndryshohen gjatë raundeve të vlefshme.');return false;}
    var mp=state.mps.find(function(m){return m.seatNumber===Number(seat);});if(!mp)return false;
    var all=getAllPresCandidates(),found=Object.values(all).find(function(c){return presidentialIdentity(c.name)===presidentialIdentity(mp.name);});
    if(found)return selectPresidentialCandidate(found.id);
    var id='pres-mp:'+ (mp.candidateId || presidentialIdentity(mp.name));
    return presidentialCommit(function(){state.customPresCandidates[id]={id:id,name:mp.name,type:'Deputet i '+mp.party,partyId:mp.party,proposer:state.playerParty,acceptParties:[mp.party],popBonus:2};state.presidency.procedure.candidateId=id;state.presidentialCandidateId=id;});
}
function presidentialIdentity(name){return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(prof|dr|akademik)\b/g,'').replace(/[^a-z]/g,'');}
function presidentialCandidates(){
    var seen=new Set();return Object.values(getAllPresCandidates()).filter(function(c){var key=presidentialIdentity(c.name);if(seen.has(key))return false;seen.add(key);return true;});
}
function presidentialProfileParty(c){
    if(c.partyId)return c.partyId;
    var mp=state.mps.find(function(m){return presidentialIdentity(m.name)===presidentialIdentity(c.name);});
    if(mp)return mp.party;
    var leader=Object.values(state.parties).find(function(p){return presidentialIdentity(p.leader)===presidentialIdentity(c.name);});
    return leader?leader.id:'Pa përkatësi të regjistruar';
}
function schedulePresidentialSession(){
    if(!presidentialActionAllowed(false))return false;var p=state.presidency.procedure;
    if(!p.candidateId || !getAllPresCandidates()[p.candidateId]){showToast('Paraqitni kandidaturën përpara seancës.');return false;}
    if(p.sessionId)return false;
    return presidentialCommit(function(){p.sessionId='session:'+p.id;state.parliamentarySessions.push({id:p.sessionId,number:++state.sessionCounter,type:'PRESIDENTIAL',topic:'Zgjedhja e Presidentit',week:state.turnCount+1,status:'SCHEDULED',billIds:[],results:[]});});
}
function openPresidentialTalk(partyId){
    if(!presidentialActionAllowed(false))return false;var p=state.presidency.procedure,party=state.parties[partyId];
    if(!party || partyId===state.playerParty || !p.candidateId)return false;
    var n=p.negotiations.find(function(n){return n.partyId===partyId && n.candidateId===p.candidateId;});
    var ok=presidentialCommit(function(){
        if(!n){n={partyId:partyId,candidateId:p.candidateId,discussed:false,compromise:false,status:'OPEN',lastTurn:null,history:[]};p.negotiations.push(n);}
        state.presidentialNegotiations={partnerParty:partyId,candName:getAllPresCandidates()[p.candidateId].name,step:1,offers:{}};
    });if(!ok)return false;
    return renderPresidentialTalk();
}
function renderPresidentialTalk(){
    var n=state.presidentialNegotiations,p=state.presidency.procedure;if(!n || !p)return false;var party=state.parties[n.partnerParty],r=p.negotiations.find(function(r){return r.partyId===n.partnerParty&&r.candidateId===p.candidateId;}),e=catalogEscape;
    document.getElementById('interactiveActionModalContent').innerHTML='<h2>Bisedime me '+e(party.leader)+'</h2><p>Kandidati: '+e(n.candName)+' · '+state.mps.filter(function(m){return m.party===party.id;}).length+' deputetë aktivë</p><p>Mbështetja varet nga afërsia me kandidatin, marrëdhëniet dhe besueshmëria. Nuk premtohen poste ose fonde nga ky takim.</p>'+[['DISCUSS','Diskuto kandidaturën'],['COMPROMISE','Kërko kompromis për kandidatin'],['SUPPORT','Kërko vendimin e grupit']].map(function(a){return '<button class="action-btn" onclick="resolvePresidentialTalk(\''+a[0]+'\')">'+a[1]+'</button>';}).join('')+r.history.map(function(h){return '<p>Java '+h.turn+': '+e(h.text)+'</p>';}).join('')+'<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button>';toggleModal('interactiveActionModal',true);return true;
}
function resolvePresidentialTalk(action){
    if(!presidentialActionAllowed(false))return false;var p=state.presidency.procedure,n=state.presidentialNegotiations,r=n&&p.negotiations.find(function(r){return r.partyId===n.partnerParty&&r.candidateId===p.candidateId;});
    if(!r || r.status!=='OPEN' || !['DISCUSS','COMPROMISE','SUPPORT'].includes(action))return false;
    if(r.lastTurn===state.turnCount || action==='DISCUSS'&&r.discussed || action==='COMPROMISE'&&r.compromise){showToast('Prisni javën pasuese ose zgjidhni një hap tjetër të bisedimeve.');return false;}
    var ok=presidentialCommit(function(){var text;
        if(action==='DISCUSS'){r.discussed=true;text='Grupi shqyrtoi profilin dhe kundërshtimet ndaj kandidatit.';}
        if(action==='COMPROMISE'){r.compromise=true;text='U diskutua një qëndrim i përbashkët; nuk ka ende marrëveshje.';}
        if(action==='SUPPORT'){var c=getAllPresCandidates()[p.candidateId],rel=state.parties[state.playerParty].relations[r.partyId]??50,score=rel*.5+(c.acceptParties.includes(r.partyId)?25:0)+(r.discussed?8:0)+(r.compromise?7:0)+(state.approval-50)*.15;r.status=score>=65?'AGREED':'REFUSED';text=r.status==='AGREED'?'Lideri pranoi pjesëmarrjen dhe mbështetjen vetëm për këtë kandidat.':'Grupi nuk e mbështet këtë kandidaturë; mund të shqyrtoni një kandidat tjetër.';}
        r.lastTurn=state.turnCount;r.history.push({turn:state.turnCount,text:text});
    });if(ok)renderPresidentialTalk();return ok;
}
function presidentialCandidateAgreement(party){var p=state.presidency?.procedure;return !!p && p.negotiations.some(function(n){return n.candidateId===p.candidateId&&n.partyId===party&&n.status==='AGREED';});}
function recordPresidentialVote(result,candidate){
    var p=state.presidency.procedure;p.results.push(result);
    var session=state.parliamentarySessions.find(function(s){return s.id===p.sessionId;});if(session)session.results.push(Object.assign({candidateId:candidate.id,title:candidate.name+' — Raundi '+result.round,status:result.passed?'PASSED':'FAILED',resultText:result.pro+' për, '+result.kunder+' kundër, '+result.abstenim+' abstenime, '+result.mungese+' mungesa'},result));
    if(result.passed){
        p.status='ELECTED';p.electedCandidateId=candidate.id;state.presidentialElectionInProgress=false;state.presidentialNegotiations=null;if(session)session.status='COMPLETED';
        if(state.presidentElected && state.presidency.endTurn>state.turnCount)state.presidency.successor={name:candidate.name,candidateId:candidate.id,startTurn:state.presidency.endTurn};
        else installPresidentialMandate(candidate.name,state.turnCount);
    }else if(result.hasQuorum&&result.round===3){p.status='FAILED';p.needsParliamentaryElection=true;p.assemblyCycle=deputyCycleId(state);state.presidentialElectionInProgress=false;if(session)session.status='COMPLETED';}
}
function resumePresidentialFailure(){
    var p=state.presidency?.procedure;if(!p?.needsParliamentaryElection || state.pendingVote)return false;
    if(startParliamentaryElectionProcess('Dështimi i zgjedhjes së Presidentit në tri raunde')){p.needsParliamentaryElection=false;saveGameAuto();return true;}return false;
}
function installPresidentialMandate(name,start){
    state.presidentName=name;state.presidentElected=true;state.presidency.startTurn=start;state.presidency.endTurn=start+240;state.presidency.successor=null;
    state.presidentMandateStartYear=state.year;state.presidentMandateEndYear=state.year+5;
}
function processPresidencyWeek(){
    migratePresidency(state);var db=state.presidency,p=db.procedure;
    if(db.successor && state.turnCount>=db.successor.startTurn){installPresidentialMandate(db.successor.name,db.successor.startTurn);return true;}
    if(state.presidentElected && db.endTurn!==null && state.turnCount>=db.endTurn){
        state.presidentElected=false;state.presidentName='Ushtrues/e detyre — Kryetari i Kuvendit';
        if(!p || p.status==='ELECTED'){
            if(p)db.history.push(p);
            p={id:'presidential:'+(++db.counter)+':'+state.turnCount,status:'OPEN',reason:'VACANT',assemblyCycle:deputyCycleId(state),openedTurn:state.turnCount,deadlineTurn:state.turnCount+8,candidateId:null,negotiations:[],results:[],sessionId:null};
            db.procedure=p;state.presidentialElectionInProgress=true;state.presidentialCandidateId=null;state.presidentialRound=1;state.presidentialNegotiations=null;state.quorumPledgedParties=state.coalitionParties.slice();
        }
        addMediaNews('Presidenca','Mandati presidencial përfundoi. Posti pret zgjedhjen e pasuesit.','NEUTRAL');
    }
    if(p?.status==='OPEN'){
        state.presidentialDeadlineWeeks=Math.max(0,p.deadlineTurn-state.turnCount);
        if(state.turnCount>p.deadlineTurn){p.status='FAILED';p.assemblyCycle=deputyCycleId(state);state.presidentialElectionInProgress=false;state.presidentialNegotiations=null;var s=state.parliamentarySessions.find(function(s){return s.id===p.sessionId;});if(s)s.status='COMPLETED';setInstitutionalPhase(INSTITUTIONAL_PHASES.SNAP_ELECTION,'Skadoi afati i procedurës presidenciale.');startParliamentaryElectionProcess('Skadimi i afatit për zgjedhjen e Presidentit');}
    }
    return false;
}
function requestPresidentialReview(reason,note){
    if(state.pendingVote || !assertPoliticalParliament('Kërkesa për shqyrtim') || !assertAssemblyFunctional('Kërkesa për shqyrtim'))return false;
    if(!state.presidentElected || state.presidency.review || !['CONSTITUTIONAL','CRIMINAL','INCAPACITY'].includes(reason) || typeof note!=='string' || note.trim().length<30){showToast('Zgjidhni bazën dhe përshkruani pretendimin. Duhet një mandat aktiv dhe nuk mund të dyfishohet dosja.');return false;}
    return presidentialCommit(function(){state.presidency.review={status:'PENDING_VERIFICATION',reason:reason,note:note.trim().slice(0,1200),requestedBy:state.playerParty,turn:state.turnCount};});
}
function renderPresidencyPanel(){
    var host=document.getElementById('presidentialSectionContainer');if(!host)return;var d=state.presidency,p=d.procedure,e=catalogEscape,candidates=presidentialCandidates();
    var html='<div class="card presidency-panel"><h2>Presidenti i Republikës</h2><h3>'+e(state.presidentName)+'</h3><p>'+(state.presidentElected?'Mandat aktiv · Përfundimi: '+e(diplomaticDate(d.endTurn)):'Posti vakant; detyrat përkohësisht ushtrohen nga Kryetari i Kuvendit')+'</p>'+(d.successor?'<p>Pasuesi i zgjedhur: '+e(d.successor.name)+' · Mandati fillon më '+e(diplomaticDate(d.successor.startTurn))+'.</p>':'');
    if(!p || p.status!=='OPEN')html+=presidentialOpeningReason()?'<button class="action-btn btn-gold" onclick="openNewPresidentialProcedure()">Nis procedurën për pasuesin</button>':'<p>Mandati është aktiv. Procedura për pasuesin hapet në katër javët e fundit ose kur posti mbetet vakant.</p>';
    else{
        html+='<p>Procedurë aktive · Raundi '+state.presidentialRound+' · Afati: '+e(diplomaticDate(p.deadlineTurn))+'</p><label>Kandidatura<select onchange="changePresidentialCandidate(this.value)"><option value="">Zgjidhni kandidatin</option>'+candidates.map(function(c){return '<option value="'+e(c.id)+'" '+(p.candidateId===c.id?'selected':'')+'>'+e(candidateDisplayName(c,presidentialProfileParty(c)))+'</option>';}).join('')+'</select></label><button class="btn-top" onclick="withdrawPresidentialCandidate()">Tërhiq kandidaturën</button><label>Propozo deputet ekzistues<select id="presidentialMP">'+state.mps.map(function(m){return '<option value="'+m.seatNumber+'">'+e(candidateDisplayName(m))+' · '+e(m.party)+'</option>';}).join('')+'</select></label><button class="action-btn" onclick="nominateExistingPresidentialMP(document.getElementById(\'presidentialMP\').value)">Paraqit kandidaturën</button>';
        if(p.candidateId)html+='<div class="candidate-actions">'+Object.values(state.parties).filter(function(t){return t.id!==state.playerParty;}).map(function(t){return '<button class="btn-top" onclick="openPresidentialNegotiationModal(\''+e(t.id)+'\')">'+e(t.leader)+' · '+e(t.short)+'</button>';}).join('')+'<button class="action-btn" onclick="schedulePresidentialSession()">Cakto seancën</button><button class="action-btn btn-gold" onclick="runPresidentialVoteRound()">Zhvillo raundin e votimit</button></div>';
    }
    html+='<details><summary>Kandidatët dhe mbështetja e njohur</summary>'+candidates.map(function(c){var support=Array.from(new Set(c.acceptParties.concat((p?.negotiations || []).filter(function(n){return n.candidateId===c.id && n.status==='AGREED';}).map(function(n){return n.partyId;}))));return '<article><strong>'+e(candidateDisplayName(c,presidentialProfileParty(c)))+'</strong><p>'+e(c.type)+' · '+e(presidentialProfileParty(c))+' · '+(p?.candidateId===c.id?'Kandidaturë e paraqitur nga '+e(p.proposer || 'procedura e ruajtur'):'Në listën e kandidatëve')+'</p><p>Mbështetja e njohur: '+e(support.join(', '))+'. Kjo nuk është rezultat votimi.</p></article>';}).join('')+'</details>';
    html+='<details><summary>Historiku i procedurave dhe votimeve</summary>'+d.history.concat(p?[p]:[]).map(function(x){return '<p>'+e(x.id)+' · '+({OPEN:'Në proces',ELECTED:'Zgjedhje e përfunduar',FAILED:'Procedurë e dështuar'})[x.status]+'</p>'+x.results.map(function(r){return '<p>Raundi '+r.round+': '+r.pro+' për, '+r.kunder+' kundër, '+r.abstenim+' abstenime, '+r.mungese+' mungesa.</p>';}).join('');}).join('')+'</details>';
    html+='<details><summary>Shqyrtimi i një baze për shkarkim</summary><p>Pretendimi nuk është konstatim institucional dhe nuk e ndërpret mandatin. Loja nuk ka ende mekanizëm verifikimi gjyqësor ose mjekësor.</p>'+(d.review?'<p>Dosja pret verifikim institucional: '+e(d.review.note)+'</p>':'<select id="presReviewReason"><option value="CONSTITUTIONAL">Pretendim për shkelje të rëndë kushtetuese</option><option value="CRIMINAL">Pretendim për dënim për krim të rëndë</option><option value="INCAPACITY">Pretendim për paaftësi për shkak të sëmundjes së rëndë</option></select><textarea id="presReviewNote" maxlength="1200" placeholder="Përshkruani bazën dhe faktet e pretenduara"></textarea><button class="action-btn" onclick="requestPresidentialReview(document.getElementById(\'presReviewReason\').value,document.getElementById(\'presReviewNote\').value)">Regjistro kërkesën për shqyrtim</button>')+'</details></div>';
    host.innerHTML=html;
}
