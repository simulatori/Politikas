/* Active MPs stay in state.mps; this ledger preserves seats and former holders. */
const DEPUTY_RULES=Object.freeze({version:1,governmentIncompatible:true,genderPercent:30,
    replacementMode:"PREFERENCES_WITH_QUOTA",replacementLegallyCertified:false});
const DEPUTY_STATUS={ACTIVE:"Deputet aktiv",PENDING:"Në pritje të zëvendësimit",ENDED:"Mandat i përfunduar",REPLACED:"Zëvendësuar"};
const DEPUTY_REASONS={GOVERNMENT:"Emërim në Qeveri",RESIGNATION:"Dorëheqje",DEATH:"Vdekje",FINAL_JUDGMENT:"Vendim gjyqësor i formës së prerë"};
function deputyCycleId(st){return st.assemblyCycleId || "legacy:"+st.mandateNumber;}
function deputyLedger(st){st=st || state;return st.deputyMandates && st.deputyMandates.legislatures.find(function(l){return l.id===deputyCycleId(st);});}
function deputyStamp(st){return {week:st.turnCount,year:st.year,monthIndex:st.monthIndex,calendarWeek:st.week};}
function sealDeputyLedger(l){delete l.integrity;l.integrity=electionSeed(JSON.stringify(l));}
function deputyRecord(mp,id,st){return {id:id,candidateId:mp.candidateId || null,name:mp.name,partyId:mp.party,
    seatNumber:mp.seatNumber,region:mp.region || null,personalVotes:Number.isSafeInteger(mp.personalVotes)?mp.personalVotes:null,
    gender:["M","F"].includes(mp.gender)?mp.gender:null,seatType:mp.seatType || null,community:mp.community || null,
    simulated:!!mp.simulationDefaults || !mp.candidateId,status:"ACTIVE",inGovernment:false,governmentPosts:[],
    history:[{status:"ACTIVE",reason:"Regjistrim i përbërjes ekzistuese",at:deputyStamp(st)}]};}
function migrateDeputyMandates(st){
    if(typeof st.deputyMandates==="undefined")st.deputyMandates={version:1,legislatures:[]};
    if(deputyLedger(st))return;
    var id=deputyCycleId(st),l={id:id,rules:JSON.parse(JSON.stringify(DEPUTY_RULES)),
        baseline:st.mps.map(function(mp){return {id:id+":seat:"+mp.seatNumber,seatNumber:mp.seatNumber,partyId:mp.party,candidateId:mp.candidateId || null,name:mp.name};}),
        members:st.mps.map(function(mp){return deputyRecord(mp,id+":seat:"+mp.seatNumber,st);}),vacancies:[]};
    var government=deputyGovernmentIdentities(st);
    l.members.forEach(function(m){m.governmentPosts=government.filter(function(g){return g.candidateId?g.candidateId===m.candidateId:g.partyId===m.partyId && g.name===m.name && l.members.filter(function(n){return n.name===m.name && n.partyId===m.partyId;}).length===1;}).map(function(g){return g.post;});m.inGovernment=m.governmentPosts.length>0;});
    sealDeputyLedger(l);st.deputyMandates.legislatures.push(l);
}
function validateDeputyMandates(st){
    if(typeof st.deputyMandates==="undefined")return;
    var db=st.deputyMandates,ids=new Set();
    if(!db || db.version!==1 || !Array.isArray(db.legislatures))throw Error("Regjistri i mandateve është i pavlefshëm.");
    db.legislatures.forEach(function(l){
        var copy=JSON.parse(JSON.stringify(l));delete copy.integrity;
        if(ids.has(l.id) || l.integrity!==electionSeed(JSON.stringify(copy)) || JSON.stringify(l.rules)!==JSON.stringify(DEPUTY_RULES) || !Array.isArray(l.baseline) || !Array.isArray(l.members) || !Array.isArray(l.vacancies))throw Error("Historiku i mandateve është i dëmtuar.");ids.add(l.id);
        var people=new Set(),candidates=new Set(),seats=new Set();
        l.baseline.forEach(function(b){if(seats.has(b.seatNumber) || !Number.isInteger(b.seatNumber) || b.seatNumber<1 || b.seatNumber>120)throw Error("Ulëse e dyfishuar në regjistër.");seats.add(b.seatNumber);});
        l.members.forEach(function(m){
            if(people.has(m.id) || m.candidateId && candidates.has(m.candidateId) || !Object.hasOwn(DEPUTY_STATUS,m.status) || !Array.isArray(m.history) || !m.history.length || m.history.at(-1).status!==m.status || typeof m.inGovernment!=="boolean" || !Array.isArray(m.governmentPosts) || typeof m.name!=="string" || !l.baseline.some(function(b){return b.seatNumber===m.seatNumber && b.partyId===m.partyId;}))throw Error("Deputet ose status mandati i pavlefshëm.");
            people.add(m.id);if(m.candidateId)candidates.add(m.candidateId);
            if(m.parliamentaryHistory && (!Array.isArray(m.parliamentaryHistory.votingHistory) || !Array.isArray(m.parliamentaryHistory.meetingHistory)))throw Error("Historiku parlamentar është i pavlefshëm.");
            if(m.replaces){var previous=l.members.find(function(p){return p.id===m.replaces;});if(!previous || previous.replacedBy!==m.id || previous.status!=="REPLACED" || previous.partyId!==m.partyId || previous.seatNumber!==m.seatNumber)throw Error("Zëvendësim jashtë subjektit ose historikut.");}
            else if(!l.baseline.some(function(b){return b.id===m.id && b.name===m.name && b.candidateId===m.candidateId;}))throw Error("Mandat pa prejardhje zgjedhore.");
        });
        l.baseline.forEach(function(b){
            var live=l.members.filter(function(m){return m.seatNumber===b.seatNumber && ["ACTIVE","PENDING"].includes(m.status);});
            if(live.length!==1)throw Error("Ulësja nuk ka mbajtës ose pritje unike.");
            var pending=l.vacancies.filter(function(v){return v.memberId===live[0].id;});
            if((live[0].status==="PENDING")!==(pending.length===1) || pending.some(function(v){return v.seatNumber!==b.seatNumber || v.partyId!==b.partyId || typeof v.message!=="string";}))throw Error("Vendi në pritje nuk përputhet me mandatin.");
        });
        if(l.vacancies.length!==l.members.filter(function(m){return m.status==="PENDING";}).length)throw Error("Vende të lira të dyfishuara.");
    });
    var current=deputyLedger(st);if(!current)return;
    var active=current.members.filter(function(m){return m.status==="ACTIVE";});
    if(active.length!==st.mps.length || st.mps.some(function(mp){return !active.some(function(m){return m.seatNumber===mp.seatNumber && m.partyId===mp.party && m.name===mp.name && m.candidateId===(mp.candidateId || null) && m.personalVotes===(Number.isSafeInteger(mp.personalVotes)?mp.personalVotes:null);});}))throw Error("Përbërja aktive nuk përputhet me regjistrin e mandateve.");
    var cycle=(st.parliamentaryElections || []).find(function(c){return c.id===current.id;});
    current.members.filter(function(m){return m.replaces;}).forEach(function(m){var p=cycle && cycle.results.parties.find(function(p){return p.partyId===m.partyId;}),c=p && p.candidates.find(function(c){return c.id===m.candidateId;});if(!c || c.name!==m.name || c.personalVotes!==m.personalVotes)throw Error("Pasuesi nuk i përket rezultatit zgjedhor të subjektit.");});
}
function deputyCompositionMatches(st,composition){
    var l=deputyLedger(st);if(!l)return false;
    validateDeputyMandates(st);
    return l.baseline.length===120 && l.baseline.every(function(b){return composition.deputies.some(function(d){return d.seatNumber===b.seatNumber && d.partyId===b.partyId && d.candidateId===b.candidateId && d.name===b.name;});});
}
function deputyVacantCount(){var l=deputyLedger(state);return l?l.vacancies.length:0;}
function deputyGovernmentRule(post){return DEPUTY_RULES.governmentIncompatible && ["MINISTER","PRIME_MINISTER","DEPUTY_PRIME_MINISTER"].includes(post);}
function deputyCandidates(l,partyId){
    var cycle=(state.parliamentaryElections || []).find(function(c){return c.id===l.id;}),party=cycle && cycle.results && cycle.results.parties.find(function(p){return p.partyId===partyId;});
    if(!party)return {error:"Mungon lista me vota personale e këtij mandati; katalogu historik nuk e zëvendëson rezultatin zgjedhor."};
    if(party.candidates.some(function(c){return !Number.isSafeInteger(c.personalVotes);}))return {error:"Mungojnë votat personale për renditjen e pasuesve."};
    var metadata=assemblyMetadata(state,cycle);
    return {cycle:cycle,metadata:metadata,all:party.candidates,ranked:party.candidates.slice().sort(function(a,b){return priorityCandidateOrder(a,b,metadata,cycle.seed);})};
}
function findDeputySuccessor(l,outgoing){
    var data=deputyCandidates(l,outgoing.partyId);if(data.error)return data;
    var available=data.ranked.filter(function(c){return !l.members.some(function(m){return m.candidateId===c.id;}) && !deputyGovernmentIdentities().some(function(g){return g.candidateId===c.id || !g.candidateId && g.partyId===c.partyId && g.name===c.name;});});
    if(!available.length)return {error:"Nuk ka kandidat pasues të vlefshëm nga lista e këtij subjekti."};
    var others=l.members.filter(function(m){return m.id!==outgoing.id && m.partyId===outgoing.partyId && ["ACTIVE","PENDING"].includes(m.status);}),entitlement=l.baseline.filter(function(b){return b.partyId===outgoing.partyId;}).length;
    var gender=function(c){var g=data.metadata.genders[c.candidateId || c.id];return g && !g.simulated && ["M","F"].includes(g.value) && g.source?g.value:null;};
    if(data.all.length<=2)return {candidate:available[0],data:data};
    if(others.some(function(m){return !gender(m);}))return {error:"Mungon gjinia me burim për kontrollin e kuotës gjatë zëvendësimit. Plotësoni të dhënat në përbërjen e Kuvendit."};
    var needed=simulationGenderMinimum(entitlement,data.metadata),counts={M:0,F:0};others.forEach(function(m){counts[gender(m)]++;});
    for(var c of available){
        var g=gender(c);if(!g)return {error:"Gjinia me burim e kandidatit pasues mungon; renditja dhe kuota nuk mund të verifikohen."};
        if(counts.M+(g==="M"?1:0)>=needed && counts.F+(g==="F"?1:0)>=needed)return {candidate:c,data:data};
    }
    return {error:"Asnjë pasues i disponueshëm nuk e plotëson kuotën e konfiguruar. Kërkohet shqyrtim; vendi mbetet në pritje."};
}
function resolveDeputyVacancy(l,outgoing){
    var vacancy=l.vacancies.find(function(v){return v.memberId===outgoing.id;}),next=findDeputySuccessor(l,outgoing);
    if(next.error){vacancy.message=next.error;return false;}
    var c=next.candidate,mp={candidateId:c.id,name:c.name,party:outgoing.partyId,partyId:outgoing.partyId,seatNumber:outgoing.seatNumber,
        personalVotes:c.personalVotes,listNumber:c.listNumber,gender:assemblyGender(next.data.metadata,c.id),community:outgoing.community,seatType:outgoing.seatType,
        region:c.region || "Pa të dhëna",loyalty:50,trustPlayer:50,role:"Deputet zëvendësues",stance:"Profil i simulimit",ambition:"E papërcaktuar",rebelRisk:false,promisedVoteNext:false,simulationDefaults:true,votingHistory:[],meetingHistory:[]};
    var record=deputyRecord(mp,l.id+":candidate:"+c.id,state);record.replaces=outgoing.id;record.history[0].reason="Zëvendësim i "+outgoing.name;
    outgoing.status="REPLACED";outgoing.replacedBy=record.id;outgoing.history.push({status:"REPLACED",reason:"U zëvendësua nga "+c.name,at:deputyStamp(state)});
    l.members.push(record);l.vacancies=l.vacancies.filter(function(v){return v!==vacancy;});state.mps.push(mp);state.mps.sort(function(a,b){return a.seatNumber-b.seatNumber;});
    migrateCandidateGenderEvidence(state);
    return record;
}
function releaseDeputyMandate(l,record,reason,evidence){
    if(record.status!=="ACTIVE")return false;
    var departing=state.mps.find(function(mp){return mp.seatNumber===record.seatNumber;});
    record.parliamentaryHistory=JSON.parse(JSON.stringify({votingHistory:departing.votingHistory || [],meetingHistory:departing.meetingHistory || []}));
    record.status="PENDING";record.history.push({status:"PENDING",reason:DEPUTY_REASONS[reason],evidence:evidence,at:deputyStamp(state)});
    state.mps=state.mps.filter(function(mp){return mp.seatNumber!==record.seatNumber;});
    l.vacancies.push({memberId:record.id,seatNumber:record.seatNumber,partyId:record.partyId,reason:reason,message:"Në shqyrtim"});
    return resolveDeputyVacancy(l,record);
}
function deputyCommit(change){
    if(state.pendingVote || state.constituentSessions && state.constituentSessions.some(function(s){return s.status==="IN_PROGRESS";})){showToast("Përfundoni votimin ose seancën në zhvillim para ndryshimit të mandateve.");return false;}
    var before=JSON.stringify(state);
    try{migrateDeputyMandates(state);change(deputyLedger(state));sealDeputyLedger(deputyLedger(state));validateLoadedState(state);if(!saveGameAuto()){state=JSON.parse(before);return false;}}
    catch(error){state=JSON.parse(before);showToast("Mandati nuk u ndryshua: "+error.message);return false;}
    refreshAllUI();return true;
}
function endDeputyMandate(id,reason,evidence){
    var l=deputyLedger(state),m=l && l.members.find(function(m){return m.id===id;});
    if(reason==="FINAL_JUDGMENT"){
        if(!evidence || evidence.final!==true || !Number.isFinite(evidence.prisonYears) || evidence.prisonYears<1 || typeof evidence.text!=="string" || !evidence.text.trim()){showToast("Kërkohet vendim i formës së prerë me të paktën një vit burgim dhe shënimi i aktit.");return false;}
        evidence=evidence.text+" · Burgim: "+evidence.prisonYears+" vjet, vendim i formës së prerë";
    }
    if(!state.assemblyConstituted || !m || m.status!=="ACTIVE" || !["RESIGNATION","DEATH","FINAL_JUDGMENT"].includes(reason) || typeof evidence!=="string" || !evidence.trim()){showToast("Kërkohet deputet aktiv, arsye e vlefshme dhe shënim i aktit për përfundimin e mandatit.");return false;}
    if(!deputyCommit(function(l){releaseDeputyMandate(l,m,reason,evidence.trim());}))return false;
    showToast(m.status==="REPLACED"?"Mandati u përfundua dhe pasuesi u regjistrua.":"Mandati përfundoi. Vendi mbetet në pritje: "+deputyLedger(state).vacancies.find(function(v){return v.memberId===id;}).message);return true;
}
function retryDeputyReplacement(id){
    var l=deputyLedger(state),m=l && l.members.find(function(m){return m.id===id;});if(!m || m.status!=="PENDING")return false;
    if(!deputyCommit(function(l){resolveDeputyVacancy(l,m);}))return false;
    showToast(m.status==="REPLACED"?"U regjistrua deputeti pasues.":deputyLedger(state).vacancies.find(function(v){return v.memberId===id;}).message);return m.status==="REPLACED";
}
function deputyGovernmentIdentities(st){
    st=st || state;if(!st.governmentFormed)return [];
    var result=st.ministries.filter(function(m){return m.party && m.party!=="NONE" && m.minister;}).map(function(m){return {candidateId:m.ministerCandidateId || null,name:m.minister,partyId:m.party,post:m.name};});
    if(st.mandatar && st.parties[st.mandatar])result.push({candidateId:st.primeMinisterCandidateId || null,name:st.parties[st.mandatar].leader,partyId:st.mandatar,post:"Kryeministër"});return result;
}
function reconcileDeputyGovernment(){
    if(!state.assemblyConstituted || !state.governmentFormed){showToast("Kontrolli kërkon Kuvend të konstituuar dhe Qeveri të miratuar.");return false;}
    if(!deputyCommit(function(){syncDeputyGovernment();}))return false;showToast("U kontrolluan papajtueshmëritë. Vendet pa pasues mbeten në pritje.");return true;
}
function syncDeputyGovernment(){
    state.ministries.forEach(m=>{if(m.coalitionNominee&&(m.minister!=='I/E paemëruar'||m.party!==m.coalitionNominee.partyId))delete m.coalitionNominee;});
    migrateDeputyMandates(state);var l=deputyLedger(state),identities=state.governmentFormed?deputyGovernmentIdentities():[];
    l.members.forEach(function(m){
        var posts=identities.filter(function(g){return g.candidateId?m.candidateId===g.candidateId:g.partyId===m.partyId && g.name===m.name && l.members.filter(function(n){return n.partyId===g.partyId && n.name===g.name;}).length===1;}).map(function(g){return g.post;});
        if(JSON.stringify(posts)!==JSON.stringify(m.governmentPosts)){m.inGovernment=posts.length>0;m.governmentPosts=posts;m.history.push({status:m.status,reason:posts.length?"Post qeveritar: "+posts.join(", "):"Përfundoi posti qeveritar; mandati parlamentar nuk rikthehet automatikisht",at:deputyStamp(state)});}
    });
    if(deputyGovernmentRule("MINISTER"))l.members.slice().filter(function(m){return m.status==="ACTIVE" && m.inGovernment;}).forEach(function(m){releaseDeputyMandate(l,m,"GOVERNMENT","Emërimi pas miratimit të Qeverisë");});
    sealDeputyLedger(l);
}
function cabinetDeputyOptions(partyId){return state.mps.filter(function(mp){return mp.party===partyId;});}
function chooseCabinetDeputy(index,value){
    if(!constituentGovernmentGate() || !state.cabinetProposal || !state.cabinetProposal[index])return false;
    var item=state.cabinetProposal[index],mp=state.mps.find(function(mp){return String(mp.seatNumber)===value && mp.party===item.party;});if(!mp)return false;
    if(state.mandatar!==state.playerParty||item.party!==state.playerParty||!cabinetNomineeAvailable(state,mp.name,state.cabinetProposal,index)){showToast('Kandidati është i rezervuar ose mban një ministri tjetër.');return false;}
    item.ministerName=mp.name;item.ministerCandidateId=mp.candidateId || null;item.competence=mp.loyalty || 50;item.loyalty=mp.loyalty || 50;state.cabinetApproved=false;renderCabinetSelectionModal();return true;
}
function renderDeputyMandateDirectory(){
    var host=document.getElementById("deputyMandatesPanel"),l=deputyLedger(state);if(!host || !l)return;
    var esc=electoralEscape,party=document.getElementById("mpFilterParty"),status=document.getElementById("mpMandateFilter"),query=document.getElementById("mpSearchInput"),term=candidateSearchText(query && query.value || "");
    if(party){var selected=party.value || "ALL";party.innerHTML='<option value="ALL">Të gjitha subjektet</option>'+Object.keys(state.parties).map(function(id){return '<option value="'+esc(id)+'">'+esc(state.parties[id].short || id)+' ('+state.parties[id].seats+' mandate)</option>';}).join('');party.value=selected;}
    var rows=l.members.filter(function(m){return (!party || party.value==="ALL" || party.value===m.partyId) && (!status || status.value==="ALL" || m.status===status.value) && (!term || candidateSearchText(m.name+" "+(m.region || "")).includes(term));});
    rows=uxPageRows('deputies',rows,JSON.stringify([party?.value,status?.value,term]));
    host.innerHTML='<p>'+state.mps.length+' deputetë aktivë · '+l.vacancies.length+' vende në pritje. Mandatet e partive nuk ndryshojnë nga zëvendësimi.</p><p>Zëvendësimet janë proces i simulimit; nuk përfaqësojnë vendime të KQZ-së ose certifikim ligjor.</p>'+rows.map(function(m){var v=l.vacancies.find(function(v){return v.memberId===m.id;});return '<article class="card"><strong>'+esc(candidateDisplayName(m))+' · '+esc(m.partyId)+'</strong><p>'+DEPUTY_STATUS[m.status]+' · Ulësja '+m.seatNumber+' · '+(m.personalVotes===null?'Vota personale të padisponueshme':m.personalVotes+' vota personale')+'</p><p>'+(m.simulated?'Profil i simulimit · ':'')+esc(m.region || 'Komuna e padokumentuar')+'</p><p>'+esc(m.governmentPosts.join(', ') || 'Pa post qeveritar të regjistruar')+'</p>'+(v?'<p>'+esc(v.message)+'</p><button class="action-btn" data-retry-mandate="'+esc(m.id)+'">Kontrollo pasuesin</button>':'')+'<details><summary>Historiku i mandatit</summary><ol>'+m.history.map(function(h){return '<li>Java '+h.at.week+': '+DEPUTY_STATUS[h.status]+' — '+esc(h.reason)+(h.evidence?' · '+esc(h.evidence):'')+'</li>';}).join('')+'</ol></details></article>';}).join('');
    host.innerHTML+=deputyMetadataForm(l);
    host.innerHTML=uxPageControls('deputies')+host.innerHTML+uxPageControls('deputies');
    rows.forEach(function(m,i){if(m.parliamentaryHistory){var details=document.createElement('details');details.innerHTML='<summary>Historiku parlamentar i ruajtur</summary><ul>'+m.parliamentaryHistory.votingHistory.map(function(v){return '<li>'+esc(v)+'</li>';}).join('')+'</ul><p>'+m.parliamentaryHistory.meetingHistory.length+' takime të regjistruara</p>';host.querySelectorAll('article')[i].appendChild(details);}});
    if(state.governmentFormed && l.members.some(function(m){return m.status==="ACTIVE" && m.inGovernment;}))host.innerHTML+='<p>Ka poste qeveritare të trashëguara që kërkojnë kontroll të mandatit. Ngarkimi nuk e ndryshon vetvetiu përbërjen.</p><button class="action-btn" onclick="reconcileDeputyGovernment()">Kontrollo papajtueshmëritë</button>';
    host.querySelectorAll('[data-retry-mandate]').forEach(function(button){button.onclick=function(){retryDeputyReplacement(button.dataset.retryMandate);};});
    rows.filter(function(m){return m.status==="ACTIVE";}).forEach(function(m){
        var index=l.members.indexOf(m),card=host.querySelectorAll('article')[rows.indexOf(m)],button=document.createElement('button');button.className='btn-top';button.textContent='Hap profilin';button.onclick=function(){openMpProfile(state.mps.findIndex(function(mp){return mp.seatNumber===m.seatNumber;}));};card.appendChild(button);
        if(m.partyId===state.playerParty){var resign=document.createElement('button');resign.className='btn-top';resign.textContent='Regjistro dorëheqjen';resign.onclick=function(){openDeputyResignation(index);};card.appendChild(resign);}
    });
}
function openDeputyResignation(index){
    var m=deputyLedger(state).members[index];if(!m || m.status!=="ACTIVE" || m.partyId!==state.playerParty)return false;
    var box=document.getElementById('interactiveActionModalContent');box.innerHTML='<h3>Dorëheqja e '+electoralEscape(candidateDisplayName(m))+'</h3><p>Regjistroni vetëm dorëheqjen e konfirmuar brenda simulimit. Ky veprim e përfundon mandatin dhe kontrollon pasuesin nga e njëjta parti.</p><label>Shënimi i dorëheqjes<input id="deputyResignationNote"></label><button class="action-btn" id="confirmDeputyResignation">Konfirmo dorëheqjen</button><button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Anulo</button>';
    document.getElementById('confirmDeputyResignation').onclick=function(){if(endDeputyMandate(m.id,'RESIGNATION',document.getElementById('deputyResignationNote').value))toggleModal('interactiveActionModal',false);};toggleModal('interactiveActionModal',true);return true;
}
function deputyMetadataForm(l){
    var cycle=(state.parliamentaryElections || []).find(function(c){return c.id===l.id;});if(!cycle)return '<p>Ky skenar nuk ka listë rezervë me vota personale të regjistruara. Zëvendësimi pret të dhëna zgjedhore; katalogu historik nuk përdoret si rezultat zgjedhor.</p>';
    var esc=electoralEscape;
    return '<details class="deputy-metadata"><summary>Plotëso të dhënat për kontrollin e kuotës</summary><p>Shënoni vetëm gjininë e njohur dhe burimin. Kjo nuk ndryshon votat ose përbërjen fillestare zgjedhore. Pas ruajtjes përdorni “Kontrollo pasuesin” për vendin në pritje.</p><label>Kandidati<select id="deputyGenderCandidate">'+cycle.results.parties.map(function(p){return '<optgroup label="'+esc(p.name)+'">'+p.candidates.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(candidateDisplayName(c,p.partyId))+'</option>';}).join('')+'</optgroup>';}).join('')+'</select></label><label>Gjinia<select id="deputyGenderValue"><option value="">Zgjidhni</option><option value="M">Mashkull</option><option value="F">Femër</option></select></label><label>Burimi<input id="deputyGenderSource"></label><button class="action-btn" onclick="saveDeputyGenderMetadata()">Ruaj të dhënën</button></details>';
}
function saveDeputyGenderMetadata(){
    var l=deputyLedger(state),cycle=(state.parliamentaryElections || []).find(function(c){return c.id===l.id;}),id=document.getElementById('deputyGenderCandidate').value,value=document.getElementById('deputyGenderValue').value,source=document.getElementById('deputyGenderSource').value.trim();
    if(!cycle || !source || !['M','F'].includes(value) || !cycle.results.parties.some(function(p){return p.candidates.some(function(c){return c.id===id;});})){showToast('Kërkohet kandidat i regjistruar, gjini dhe burim.');return false;}
    if(!deputyCommit(function(){var metadata=assemblyMetadata(state,cycle);metadata.genders[id]={value:value,source:source};cycle.assemblyMetadata=metadata;}))return false;showToast('U ruajt e dhëna për kontrollin e kuotës.');return true;
}
