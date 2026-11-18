/* Individual cabinet changes use the existing candidate and coalition registries. */
function coalitionCabinetAllocation(st){
 const leader=st.mandatar||st.coalitionParties[0]||st.playerParty,owners=new Map(),allocations=[];
 const reserve=(row,ids)=>{for(const id of ids){if(!st.ministries.some(m=>m.id===id)||owners.has(id))throw Error('Dy marrëveshje kërkojnë të njëjtën ministri ose një ministri mungon.');owners.set(id,row.owner);}row.ids=ids.slice();};
 for(const a of st.coalitionAgreements||[]){
  if(a.honored===false||!st.coalitionParties.includes(a.partner))continue;
  const owner=a.recipientParty||(a.partner===leader&&st.playerParty!==leader?st.playerParty:a.partner);
  if(owner===leader)continue;
  if(!st.coalitionParties.includes(owner)||!Number.isInteger(a.ministriesCount)||a.ministriesCount<0||a.ministriesCount>st.ministries.length)throw Error('Ndarja e ministrive nuk përputhet me koalicionin.');
  allocations.push({agreement:a,owner,count:a.ministriesCount,ids:[],source:Array.isArray(a.ministryIds)?'SIGNED':'COUNT_ONLY'});
 }
 for(const row of allocations.filter(r=>r.source==='SIGNED')){const ids=row.agreement.ministryIds;if(ids.length!==row.count||new Set(ids).size!==ids.length)throw Error('Numri i ministrive nuk përputhet me marrëveshjen.');reserve(row,ids);}
 // Old saves still contain the ministries assigned when the agreement was signed.
 for(const row of allocations.filter(r=>r.source!=='SIGNED')){const ids=st.ministries.filter(m=>m.party===row.owner&&!owners.has(m.id)).map(m=>m.id);if(ids.length===row.count){reserve(row,ids);row.source='LEGACY_OWNERSHIP';}}
 for(const row of allocations.filter(r=>r.source==='COUNT_ONLY')){const ids=st.ministries.filter(m=>!owners.has(m.id)).sort((a,b)=>Number(b.party===row.owner)-Number(a.party===row.owner)).slice(0,row.count).map(m=>m.id);if(ids.length!==row.count)throw Error('Marrëveshjet kërkojnë më shumë ministri sesa ka kabineti.');reserve(row,ids);}
 for(const m of st.ministries)if(!owners.has(m.id))owners.set(m.id,leader);
 return {owners,allocations};
}
function recoverCoalitionPortfolios(st){
 if(!st.mandatar||st.governmentFormed||st.pendingVote||!st.coalitionAgreements?.length)return;
 const allocation=coalitionCabinetAllocation(st);
 for(const row of allocation.allocations)if(row.source==='LEGACY_OWNERSHIP'){row.agreement.ministryIds=row.ids.slice();row.agreement.recipientParty=row.owner;row.agreement.allocationSource='LEGACY_MINISTRY_OWNERSHIP';}
 if(!st.cabinetProposal)return;
 const wrong=st.cabinetProposal.some(r=>allocation.owners.get(r.ministryId)!==r.party);
 if(!wrong)return;
 const previous=st.cabinetProposal;st.cabinetProposal=buildDefaultCabinetProposal(st,previous);
 st.cabinetApproved=false;
}
const cabinetPortfolioPrepare=prepareLoadedState;
prepareLoadedState=function(raw){const st=cabinetPortfolioPrepare(raw);recoverCoalitionPortfolios(st);return st;};
function cabinetPortfolioSummary(st=state){
 const e=catalogEscape,allocation=coalitionCabinetAllocation(st);
 return '<details class="cabinet-portfolio-agreements"><summary>Ministritë sipas marrëveshjes</summary>'+allocation.allocations.map(row=>'<p><strong>'+e(st.parties[row.owner].name)+'</strong>: '+row.ids.map(id=>e(st.ministries.find(m=>m.id===id).name)).join('; ')+(row.source==='COUNT_ONLY'?' <em>Marrëveshja e vjetër ka ruajtur vetëm numrin. Verifiko ndarjen para votimit.</em>':'')+'</p>').join('')+(allocation.allocations.some(r=>r.source==='COUNT_ONLY')&&st.mandatar===st.playerParty&&!st.governmentFormed?'<button class="action-btn" onclick="openLegacyCabinetAllocation()">Rikonfirmo ministritë e marrëveshjes së vjetër</button>':'')+'</details>';
}
function openLegacyCabinetAllocation(){
 if(state.governmentFormed||state.pendingVote||state.mandatar!==state.playerParty)return false;
 const allocation=coalitionCabinetAllocation(state),e=catalogEscape,rows=allocation.allocations.filter(r=>r.source==='COUNT_ONLY'),h=document.getElementById('interactiveActionModalContent');if(!h||!rows.length)return false;
 h.innerHTML='<h2>Rikonfirmo ndarjen e vjetër</h2><p>Kjo ruajtje nuk përmban emrat e ministrive të negociuara. Zgjidh ndarjen para votimit; numri i ministrive të secilit partner mbetet sipas marrëveshjes.</p>'+rows.map(r=>'<fieldset><legend>'+e(state.parties[r.owner].name)+' · '+r.count+' ministri</legend>'+state.ministries.map(m=>'<label><input type="checkbox" data-legacy-portfolio="'+e(r.owner)+'" value="'+e(m.id)+'" '+(r.ids.includes(m.id)?'checked':'')+'> '+e(m.name)+'</label>').join('')+'</fieldset>').join('')+'<button class="action-btn" onclick="confirmLegacyCabinetAllocation()">Ruaj ndarjen dhe kthehu te kabineti</button><button class="btn-top" onclick="renderCabinetSelectionModal()">Anulo</button>';
 toggleModal('interactiveActionModal',true);return true;
}
function confirmLegacyCabinetAllocation(){
 if(state.governmentFormed||state.pendingVote||weeklyProcessing||weeklyVisualBusy||state.mandatar!==state.playerParty)return false;
 const before=JSON.stringify(state);try{
  const rows=coalitionCabinetAllocation(state).allocations.filter(r=>r.source==='COUNT_ONLY');if(!rows.length)throw Error('Ndarja është konfirmuar tashmë.');
  const checked=Array.from(document.querySelectorAll('[data-legacy-portfolio]:checked'));
  for(const r of rows){const ids=checked.filter(el=>el.getAttribute('data-legacy-portfolio')===r.owner).map(el=>el.value);if(ids.length!==r.count||new Set(ids).size!==ids.length)throw Error('Zgjidh saktësisht '+r.count+' ministri për '+state.parties[r.owner].name+'.');r.agreement.ministryIds=ids;r.agreement.recipientParty=r.owner;r.agreement.allocationSource='PLAYER_RECONFIRMED';}
  coalitionCabinetAllocation(state);state.cabinetProposal=buildDefaultCabinetProposal(state,state.cabinetProposal||[]);state.cabinetApproved=false;validateLoadedState(state);if(!saveGameAuto())throw lastGameSaveError||Error('Ndarja nuk u ruajt.');
 }catch(error){state=JSON.parse(before);showToast(error.message);return false;}
 refreshAllUI();renderCabinetSelectionModal();showToast('Ministritë u rikonfirmuan dhe kabineti u përditësua.');return true;
}
function cabinetCandidateRegistry(st,party,catalogue){return (catalogue||getCandidateCatalogue(st)).filter(c=>!c.archived&&(c.partyId===party||c.gamePartyIds?.includes(party))).map(c=>({...c,name:c.name||candidateName(c),partyId:party}));}
function cabinetIdentity(name){return candidateIdentityKey(String(name).replace(/\s*\([^)]*\)/g,''));}
function cabinetReplacementCandidates(party, ministryId,catalogue){
    var occupied=new Set(state.ministries.filter(m=>m.id!==ministryId&&m.minister!=='I/E paemëruar').map(m=>cabinetIdentity(m.minister)));
    return cabinetCandidateRegistry(state,party,catalogue).filter(c=>c.name&&!cabinetReservedName(state,c.name)&&!occupied.has(cabinetIdentity(c.name)));
}
function cabinetReplacementMarkup(m,idx,catalogue){
    var e=catalogEscape,own=m.party===state.playerParty,allowed=agendaExecutive()&&!state.pendingVote&&!governmentCrisisPending(),nominee=m.coalitionNominee;
    var options=own?cabinetReplacementCandidates(m.party,m.id,catalogue):[];
    return '<div class="cabinet-replacement"><label for="cabinetReplacement-'+idx+'">'+(own?'Zëvendësuesi i ministrit':'Emërimin e propozon partneri')+'</label><select id="cabinetReplacement-'+idx+'" '+(!own||!allowed?'disabled':'')+'><option value="">'+e(m.minister)+'</option>'+options.filter(c=>cabinetIdentity(c.name)!==cabinetIdentity(m.minister)).map(c=>'<option value="'+e(c.id)+'">'+e(c.name)+'</option>').join('')+'</select>'+(own?'<button class="btn-top" '+(!allowed?'disabled':'')+' onclick="replaceCabinetMinister('+idx+',document.getElementById(\'cabinetReplacement-'+idx+'\').value)">Emëro zëvendësuesin</button>':nominee?'<p><strong>Propozimi i partnerit:</strong> '+e(nominee.name)+'</p><button class="btn-top" '+(!allowed?'disabled':'')+' onclick="acceptCoalitionMinister('+idx+')">Prano kandidatin e partnerit</button>':'<button class="btn-top" '+(!allowed||m.minister==='I/E paemëruar'?'disabled':'')+' onclick="dismissCoalitionMinister('+idx+')">Shkarko · rrit tensionin e koalicionit</button>')+'</div>';
}
function cabinetAppointmentCompetence(st,c,party){return clamp((c.competence||c.loyalty||75)+(typeof shadowCandidateBonus==='function'?shadowCandidateBonus(st,c.id,c.name,party):0),0,100);}
function replaceCabinetMinister(idx,id,reviewId){
    return governmentCrisisCommit(function(){var m=state.ministries[idx],c=m&&cabinetReplacementCandidates(state.playerParty,m.id).find(c=>c.id===id);if(!m||m.party!==state.playerParty||!c||cabinetIdentity(c.name)===cabinetIdentity(m.minister)||governmentCrisisPending())throw Error('Zgjidhni një kandidat të vlefshëm të partisë suaj.');if(typeof completeMinisterReviewReplacement==='function'&&m.party===state.playerParty)completeMinisterReviewReplacement(reviewId,m);m.minister=c.name;m.ministerCandidateId=c.id;m.competence=cabinetAppointmentCompetence(state,c,m.party);m.loyalty=clamp(c.loyalty||75,0,100);m.appointmentType='PARTY';m.independent=false;delete m.coalitionNominee;syncDeputyGovernment();state.historyLog.unshift('Kabineti: '+c.name+' u emërua në '+m.name+'.');});
}
function dismissCoalitionMinister(idx,reviewId){
    return governmentCrisisCommit(function(){var m=state.ministries[idx];if(!m||m.party===state.playerParty||!state.coalitionParties.includes(m.party)||m.minister==='I/E paemëruar'||governmentCrisisPending())throw Error('Ky ministër nuk mund të shkarkohet nga ky veprim.');var candidates=cabinetReplacementCandidates(m.party,m.id).filter(c=>cabinetIdentity(c.name)!==cabinetIdentity(m.minister)),c=candidates[0];if(!c)throw Error('Partneri nuk ka kandidat tjetër të disponueshëm.');if(typeof completeMinisterReviewReplacement==='function')completeMinisterReviewReplacement(reviewId,m);var old=m.minister;m.minister='I/E paemëruar';m.ministerCandidateId=null;m.coalitionNominee={candidateId:c.id,name:c.name,partyId:m.party};var previous=state.governance.resentment[m.party];state.governance.resentment[m.party]={untilTurn:Math.max(previous?.untilTurn||0,state.turnCount+6),chance:Math.max(previous?.chance||0,.35)};state.parties[state.playerParty].relations[m.party]=clamp((state.parties[state.playerParty].relations[m.party]??60)-15,0,100);syncDeputyGovernment();state.historyLog.unshift('Kabineti: u shkarkua '+old+'. '+state.parties[m.party].short+' propozoi '+c.name+'; tension parlamentar për 6 javë.');});
}
function acceptCoalitionMinister(idx){
    return governmentCrisisCommit(function(){var m=state.ministries[idx],n=m?.coalitionNominee,c=n&&cabinetReplacementCandidates(m.party,m.id).find(c=>c.id===n.candidateId);if(!m||m.party===state.playerParty||!state.coalitionParties.includes(m.party)||!c||n.partyId!==m.party||governmentCrisisPending())throw Error('Propozimi i partnerit nuk është më i vlefshëm.');m.minister=c.name;m.ministerCandidateId=c.id;m.competence=cabinetAppointmentCompetence(state,c,m.party);m.loyalty=clamp(c.loyalty||75,0,100);m.appointmentType='PARTY';m.independent=false;delete m.coalitionNominee;syncDeputyGovernment();state.historyLog.unshift('Partneri emëroi '+c.name+' në '+m.name+'.');});
}
function validateCabinetManagement(st){for(const a of st.coalitionAgreements||[])if(a.ministryIds!==undefined&&(!Array.isArray(a.ministryIds)||a.ministryIds.length!==a.ministriesCount||new Set(a.ministryIds).size!==a.ministryIds.length||a.ministryIds.some(id=>!st.ministries.some(m=>m.id===id))||!st.parties[a.recipientParty]))throw Error('Ministritë e ruajtura të marrëveshjes janë të pavlefshme.');st.ministries.forEach(m=>{var n=m.coalitionNominee;if(n&&(!st.parties[n.partyId]||n.partyId!==m.party||m.minister!=='I/E paemëruar'||!cabinetCandidateRegistry(st,n.partyId).some(c=>c.id===n.candidateId&&c.name===n.name)))throw Error('Propozimi i ministrit të koalicionit është i pavlefshëm.');});}
