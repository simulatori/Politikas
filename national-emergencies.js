const NATIONAL_EMERGENCIES={ENERGY:{title:'Kriza Energjetike Kombëtare',icon:'⚡',fundB:.05,sector:'sec_energy'},FLOOD:{title:'Përmbytje të rënda',icon:'🌊',fundB:.035,sector:'sec_roads'},EARTHQUAKE:{title:'Tërmet dhe dëme infrastrukturore',icon:'🏚️',fundB:.08,sector:'sec_health'}};
var nationalEmergencyRetry=null;
function migrateNationalEmergencies(st){if(st.nationalEmergencies===undefined)st.nationalEmergencies={version:1,lastTurn:st.turnCount,counter:0,cooldownUntil:0,events:[]};}
function activeNationalEmergency(st){st=st||state;return st?.nationalEmergencies?.events.find(x=>x.status==='ACTIVE')||null;}
function startNationalEmergency(kind){
    if(!NATIONAL_EMERGENCIES[kind]||!agendaExecutive())return false;migrateNationalEmergencies(state);var db=state.nationalEmergencies;if(activeNationalEmergency()||state.turnCount<db.cooldownUntil)return false;
    db.events.push({id:'national-emergency:'+(++db.counter),kind,createdTurn:state.turnCount,dueTurn:state.turnCount+3,governmentKey:crisisGovernmentKey(state),status:'ACTIVE',acknowledged:false,fundedTurn:null,failedTurn:null,paymentId:null,account:null});db.cooldownUntil=state.turnCount+12;
    state.historyLog.unshift('GJENDJE EMERGJENTE: '+NATIONAL_EMERGENCIES[kind].title+'. Fondi kërkohet brenda 3 javëve.');return true;
}
function acknowledgeNationalEmergency(){
    var e=activeNationalEmergency();if(!e)return false;var ok=governmentCrisisCommit(function(){e.acknowledged=true;});if(ok)closeNationalEmergencyDialog();return ok;
}
function allocateEmergencyFund(account){
    if(!['budgetTotalB','fiscalReserve'].includes(account))return false;var e=activeNationalEmergency();if(!e)return false;
    var ok=governmentCrisisCommit(function(){var spec=NATIONAL_EMERGENCIES[e.kind];if(e.governmentKey!==crisisGovernmentKey(state)||state.turnCount>=e.dueTurn)throw Error('Afati ose mandati i emergjencës ka përfunduar.');
        if(state[account]<spec.fundB)throw Error('Llogaria e zgjedhur nuk e mbulon fondin emergjent.');
        if(account==='budgetTotalB'){var check=fiscalSpendingCheck(spec.fundB,false);if(!check.allowed)throw Error(check.message);}
        fiscalSetBalance(state,account,fiscalRound(state[account]-spec.fundB),'Fond Emergjent: '+e.id,account==='fiscalReserve'?'RESERVE_EXPENSE':'EXPENSE');e.paymentId=state.publicFinance.ledger.at(-1).id;e.account=account;e.status='FUNDED';e.fundedTurn=state.turnCount;e.acknowledged=true;
        state.historyLog.unshift('U financua fondi emergjent: '+spec.title+'.');
    });if(ok){closeNationalEmergencyDialog();showGovernmentNotification({title:'Fondi Emergjent u alokua',message:NATIONAL_EMERGENCIES[e.kind].title+': '+enterpriseMoney(NATIONAL_EMERGENCIES[e.kind].fundB)+' u paguan nga '+(account==='fiscalReserve'?'rezerva.':'arka.'),status:'success'});}return ok;
}
function processNationalEmergenciesWeek(turn){
    migrateNationalEmergencies(state);var db=state.nationalEmergencies;if(turn<=db.lastTurn)return;db.lastTurn=turn;var e=activeNationalEmergency();
    if(e){
        if(!agendaExecutive()||e.governmentKey!==crisisGovernmentKey(state)){e.status='CANCELLED';e.acknowledged=true;return;}
        if(turn>=e.dueTurn){e.status='FAILED';e.failedTurn=turn;e.acknowledged=true;crisisApproval(-25);setInstitutionalPhase(INSTITUTIONAL_PHASES.GOV_OVERTHROWN,'Qeveria ra pasi nuk financoi emergjencën kombëtare brenda 3 javëve.');state.historyLog.unshift('Dështim fatal i menaxhimit: '+NATIONAL_EMERGENCIES[e.kind].title+'.');}
        return;
    }
    if(!agendaExecutive()||governmentCrisisPending()||turn<db.cooldownUntil)return;
    if(Math.random()<.02){var kinds=Object.keys(NATIONAL_EMERGENCIES).filter(k=>k!=='ENERGY'||!winterEnergyOwnsSeason(state));startNationalEmergency(kinds[Math.min(kinds.length-1,Math.floor(Math.random()*kinds.length))]);}
}
function closeNationalEmergencyDialog(){var d=document.getElementById('nationalEmergencyDialog');if(d?.open)d.close();}
function renderNationalEmergencies(){
    var host=document.getElementById('nationalEmergencyPanel'),dialog=document.getElementById('nationalEmergencyDialog');if(!host)return;var e=activeNationalEmergency(),failed=state.nationalEmergencies?.events.filter(x=>x.status==='FAILED'&&x.failedTurn>=(state.governmentApprovalWeek||0)).at(-1);
    host.hidden=!e&&!(failed&&state.institutionalPhase==='GOV_OVERTHROWN');
    if(!e){closeNationalEmergencyDialog();if(!host.hidden)host.innerHTML='<h2>Qeveria ka rënë</h2><p>Fondi emergjent nuk u alokua brenda afatit. Funksionet ekzekutive janë pezulluar.</p><button class="action-btn" onclick="startParliamentaryElections()">Nis procedurën e zgjedhjeve të parakohshme</button>';return;}
    var spec=NATIONAL_EMERGENCIES[e.kind],allowed=agendaExecutive(),buttons='<button class="action-btn btn-gold" '+(!allowed||state.budgetTotalB<spec.fundB||!fiscalSpendingCheck(spec.fundB,false).allowed?'disabled':'')+' onclick="allocateEmergencyFund(\'budgetTotalB\')">Aloko nga Arka · '+enterpriseMoney(spec.fundB)+'</button><button class="action-btn" '+(!allowed||state.fiscalReserve<spec.fundB?'disabled':'')+' onclick="allocateEmergencyFund(\'fiscalReserve\')">Përdor Rezervën · '+enterpriseMoney(spec.fundB)+'</button>';
    host.innerHTML='<h2>'+spec.icon+' GJENDJE EMERGJENTE</h2><strong>'+spec.title+'</strong><p>Afati: '+Math.max(0,e.dueTurn-state.turnCount)+' javë. Mosfinancimi rrëzon Qeverinë.</p>'+buttons;
    if(!dialog||typeof dialog.showModal!=='function'||e.acknowledged||!allowed){if(e.acknowledged)closeNationalEmergencyDialog();return;}
    var start=document.getElementById('startScreen');if(start&&!start.classList.contains('hidden')||weeklyProcessing||weeklyVisualBusy||state.pendingVote||document.querySelector('dialog[open]:not(#nationalEmergencyDialog)')){if(nationalEmergencyRetry===null)nationalEmergencyRetry=setTimeout(function(){nationalEmergencyRetry=null;renderNationalEmergencies();},250);return;}
    if(!dialog.open){document.getElementById('nationalEmergencyContent').innerHTML='<span class="tag tag-pdk">URGJENCË KOMBËTARE</span><h2 id="nationalEmergencyTitle">'+spec.icon+' '+spec.title+'</h2><p>Alokoni '+enterpriseMoney(spec.fundB)+' brenda '+Math.max(0,e.dueTurn-state.turnCount)+' javëve për të shmangur rënien e Qeverisë.</p>'+buttons+'<button class="btn-top" onclick="acknowledgeNationalEmergency()">Shqyrto më vonë · Afati vazhdon</button>';dialog.showModal();dialog.querySelector('button')?.focus();}
}
function validateNationalEmergencies(st){
    var d=st.nationalEmergencies;if(d===undefined)return;var fail=()=>{throw Error('Emergjencat kombëtare janë të pavlefshme.');};if(!d||d.version!==1||!Number.isInteger(d.lastTurn)||d.lastTurn<0||d.lastTurn>st.turnCount||!Number.isInteger(d.counter)||d.counter<0||!Number.isInteger(d.cooldownUntil)||!Array.isArray(d.events)||d.counter!==d.events.length||d.events.filter(e=>e.status==='ACTIVE').length>1)fail();
    var ids=new Set();d.events.forEach((e,i)=>{if(!NATIONAL_EMERGENCIES[e.kind]||e.id!=='national-emergency:'+(i+1)||ids.has(e.id)||!Number.isInteger(e.createdTurn)||e.createdTurn<0||e.createdTurn>st.turnCount||e.dueTurn!==e.createdTurn+3||typeof e.governmentKey!=='string'||typeof e.acknowledged!=='boolean'||!['ACTIVE','FUNDED','FAILED','CANCELLED'].includes(e.status))fail();ids.add(e.id);
        if(e.status==='FUNDED'){var l=st.publicFinance.ledger.find(l=>l.id===e.paymentId);if(!Number.isInteger(e.fundedTurn)||e.fundedTurn<e.createdTurn||e.fundedTurn>=e.dueTurn||e.fundedTurn>st.turnCount||!l||l.turn!==e.fundedTurn||l.account!==e.account||l.source!=='Fond Emergjent: '+e.id||l.type!==(e.account==='fiscalReserve'?'RESERVE_EXPENSE':'EXPENSE')||!['fiscalReserve','budgetTotalB'].includes(e.account)||Math.abs(l.amountB+NATIONAL_EMERGENCIES[e.kind].fundB)>1e-8||e.failedTurn!==null)fail();}
        else if(e.paymentId!==null||e.account!==null||e.fundedTurn!==null)fail();
        if(e.status==='FAILED'){if(!Number.isInteger(e.failedTurn)||e.failedTurn<e.dueTurn||e.failedTurn>st.turnCount)fail();}else if(e.failedTurn!==null)fail();
    });
}
if(typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',function(){document.getElementById('nationalEmergencyDialog')?.addEventListener('cancel',function(e){if(activeNationalEmergency())e.preventDefault();});});
