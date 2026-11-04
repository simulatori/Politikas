/* Weekly crises and contextual press. All effects commit with existing saves. */
const CRISIS_QUESTIONS={
    TENDER:{question:'Si do të përgjigjeni për tenderin e dyshimtë?',sector:'sec_justice'},
    VETERANS:{question:'Pse u përdor dhunë gjatë auditimit?',sector:'sec_police'},
    FINANCIAL:{question:'Si do ta mbroni popullin gjate austeritetit?',sector:'sec_econ'},
    MEDIA:{question:'Pse partia financoi fshehurazi portalet?',sector:'sec_justice'},
    SECURITY:{question:'Si do të rivendosni sigurinë dhe besimin e investitorëve?',sector:'sec_police'},
    STRIKE:{question:'Pse përdorët forcë ndaj grevistëve dhe si do ta zgjidhni mungesën e financimit?',sector:'sec_econ'},
    IMPLEMENTATION:{question:'Pse u përdor procedura e përshpejtuar dhe si e justifikoni koston shtesë?',sector:'sec_econ'},
    CIVIL:{question:'Si do ta menaxhoni kundershtimin shoqeror ndaj Kodit Civil?',sector:'sec_justice'},
    SCANDAL:{question:'A do të mbani përgjegjësi për dyshimet ndaj ministrit?',sector:'sec_justice'},
    LAW:{question:'Pse nuk arritët të siguroni votat për këtë ligj?',sector:'sec_econ'},
    INVESTMENT:{question:'Kush mban përgjegjësi për tërheqjen e investitorit?',sector:'sec_econ'}
};
const CRISIS_ANSWERS=[{id:'SPIN',label:'Fajëso opozitën dhe kundërshto akuzat'},{id:'RESPONSIBILITY',label:'Merr përgjegjësi dhe prano mangësitë'},{id:'PROMISE',label:'Premto përmirësim konkret brenda 3 javëve'}];
var governmentCrisisRetry=null;
function migrateGovernmentCrises(st){if(st.governance===undefined)st.governance={version:1,lastTurn:st.turnCount,counter:0,pendingScandal:null,scandals:[],grantsBlockedUntil:0,resentment:{},mediaTrust:70,credibility:50,spinUses:0,pressEvents:[],promises:[],ipaClaims:[],regionalDeals:[]};}
function governmentCrisisPending(st){st=st||state;return (sectorExpansionPending(st)||energyInquiryPending(st)||rtkPending(st)||!!pendingTrepca(st)||sovereignPending(st)||!!pendingHighwayProject(st)||bureauBattlePending(st)||!!pendingDinarCrisis(st)||laborExodusPending(st)||!!pendingCoalitionBlackmail(st)||veteransBudgetPending(st)||enterpriseBoardsPending(st)||associationUltimatumPending(st)||municipalGrantPending(st)||generalStrikePending(st)||!!pendingWinterEnergy(st)||councilPending(st)||mediaDossierBlocked(st)||internalPressurePending(st)||(typeof northPending==='function'&&northPending(st))||(typeof diasporaPendingSeason==='function'&&!!diasporaPendingSeason(st))||(typeof institutionalConflictPending==='function'&&institutionalConflictPending(st))||!!st?.governance?.pendingScandal||(typeof imfPending==='function'&&imfPending(st))||(typeof brusselsDecisionPending==='function'&&brusselsDecisionPending(st))||(typeof roguePendingReport==='function'&&!!roguePendingReport(st))||(typeof veteransCrisisPending==='function'&&veteransCrisisPending(st)))&&agendaExecutive(st);}
function foreignGrantsBlocked(st,turn){st=st||state;return mediaDossierFundsBlocked(st,turn)||(typeof foreignFundingBlocked==='function'&&foreignFundingBlocked(st))||!!st.governance&&st.governance.grantsBlockedUntil>0&&(turn??st.turnCount)<=st.governance.grantsBlockedUntil;}
function foreignGrantBlockReason(st){st=st||state;if(associationTotalSanctions(st))return 'Sanksionet totale te Asociacionit kane bllokuar financimin e jashtem.';if(mediaDossierFundsBlocked(st))return 'Penalltia e Lirise se Medias: fondet jane ngrire per 12 jave pas sulmit ndaj mediave.';if(northSanctioned(st))return 'Sanksionet e Veriut kanë bllokuar fondet ndërkombëtare; zgjedhjet dhe ndryshimi i kabinetit nuk i heqin.';if(typeof internationalIsolation==='function'&&internationalIsolation(st))return 'Izolimi nderkombetar ka pezulluar fondet e huaja pergjithmone.';return typeof foreignFundingBlocked==='function'&&foreignFundingBlocked(st)?'Fondet pezullohen derisa autoritarizmi të zbresë nën 60/100.':'Grantet pezullohen edhe '+Math.max(0,(st.governance?.grantsBlockedUntil||0)-st.turnCount)+' javë.';}
function crisisSectorMetric(st,id){return typeof sectorManagementAverage==='function'?sectorManagementAverage(st,id):((st.stateSectors||[]).find(s=>s.id===id)?.score||30)/10;}
function crisisGovernmentKey(st){return JSON.stringify([st.playerParty,st.primeMinister,deputyCycleId(st)]);}
function crisisApproval(delta){var before=state.approval;rtkApplyApproval(state,delta);if(typeof syncInterestGroups==='function')syncInterestGroups(state);return state.approval-before;}
var governmentActionError='';
function governmentCrisisCommit(change){
    governmentActionError='';
    if(!agendaExecutive()||state.pendingVote||weeklyProcessing||weeklyVisualBusy){governmentActionError=!agendaExecutive()?'Veprimi kërkon rolin e Kryeministrit.':'Përfundoni votimin ose përmbledhjen e javës.';showToast(governmentActionError);return false;}var before=JSON.stringify(state);
    try{migrateGovernmentCrises(state);change();syncEnterpriseBoards(state);reconcileAssociationUltimatum(state);reconcileEnergyInquiry();validateLoadedState(state);if(!saveGameAuto())throw Error('Ruajtja dështoi. Kontrolloni hapësirën lokale.');}catch(e){state=JSON.parse(before);governmentActionError=e.message;showToast(e.message);return false;}
    refreshAllUI();return true;
}
function recordCrisisPressEvent(kind,key,title,sector){
    if(!agendaExecutive(state)||!CRISIS_QUESTIONS[kind])return;migrateGovernmentCrises(state);var d=state.governance;
    if(d.pressEvents.some(e=>e.key===key))return;
    d.pressEvents.push({id:'crisis-press:'+(++d.counter),kind,key,title:String(title).slice(0,500),sector:state.stateSectors.some(s=>s.id===sector)?sector:CRISIS_QUESTIONS[kind].sector,turn:state.turnCount,answered:false,answer:null});
    // Retain unanswered events and a bounded answered archive.
    var protectedKeys=new Set(state.laws.map(l=>l.executiveChain?.pressKey).filter(Boolean));var answered=d.pressEvents.filter(e=>e.answered&&!protectedKeys.has(e.key)).slice(-30);d.pressEvents=d.pressEvents.filter(e=>!e.answered||protectedKeys.has(e.key)).concat(answered);
}
function createGovernmentScandal(index){
    if(typeof justiceReformCompleted==='function'&&justiceReformCompleted(state))return false;
    migrateGovernmentCrises(state);var d=state.governance,m=state.ministries[index];if(!agendaExecutive()||d.pendingScandal||!m||!state.coalitionParties.includes(m.party)||m.minister==='I/E paemëruar')return false;
    if(typeof intelligenceBlocksScandal==='function'&&intelligenceBlocksScandal())return false;
    var s={id:'minister-scandal:'+(++d.counter),turn:state.turnCount,ministryId:m.id,minister:m.minister,party:m.party,status:'PENDING',decisionTurn:null};d.scandals.push(s);d.pendingScandal=s.id;
    recordCrisisPressEvent('SCANDAL',s.id,'Dyshime korrupsioni: '+s.minister,'sec_justice');state.historyLog.unshift('Java '+state.turnCount+': U hap skandali i ministrit '+s.minister+'.');return true;
}
function resolveGovernmentScandal(choice){
    if(!['DISMISS','DEFEND'].includes(choice))return false;var delta=0;
    var ok=governmentCrisisCommit(function(){var d=state.governance,s=d.scandals.find(s=>s.id===d.pendingScandal);if(!s||s.status!=='PENDING')throw Error('Skandali nuk është aktiv.');
        if(choice==='DISMISS'){
            var m=state.ministries.find(m=>m.id===s.ministryId);if(!m||m.minister!==s.minister)throw Error('Ministri i kësaj çështjeje nuk është më në detyrë.');
            m.minister='I/E paemëruar';m.ministerCandidateId=null;delta=crisisApproval(5);
            if(typeof syncDeputyGovernment==='function')syncDeputyGovernment();
            d.resentment[s.party]={untilTurn:state.turnCount+6,chance:.35};
        }else{delta=crisisApproval(-8);d.grantsBlockedUntil=Math.max(d.grantsBlockedUntil,state.turnCount+4);delete d.resentment[s.party];}
        s.status=choice;s.decisionTurn=state.turnCount;d.pendingScandal=null;
    });
    if(ok){closeCrisisScandalDialog();showGovernmentNotification({title:choice==='DISMISS'?'Ministri u shkarkua':'Ministri u mbrojt',message:choice==='DISMISS'?'Shkarkimi rriti mbështetjen publike. Grupi i ministrit mund të abstenojë për 6 javë.':'Koalicioni ruajti marrëdhëniet. Grantet e huaja pezullohen për 4 javët pasuese.',status:choice==='DISMISS'?'success':'failure',supportDelta:delta,critical:true});}return ok;
}
function crisisCoalitionBallot(l,mp,ballot,forecast,random){
    var r=state.governance?.resentment[mp.party],chance=Math.max(r&&r.untilTurn>=state.turnCount?r.chance:0,energyInquiryRetaliation(state,mp.party)?.35:0);if(!chance||!state.coalitionParties.includes(mp.party)||!(l.proposer||'').startsWith('Qeveria')||ballot!=='pro')return ballot;
    return (forecast ? .5 : random())<chance?'abstenim':ballot;
}
function processGovernmentCrisesWeek(turn){
    migrateGovernmentCrises(state);var d=state.governance;if(turn<=d.lastTurn)return;d.lastTurn=turn;
    if(d.pendingScandal&&!agendaExecutive()){
        var stale=d.scandals.find(s=>s.id===d.pendingScandal);if(stale){stale.status='CANCELLED';stale.decisionTurn=turn;}d.pendingScandal=null;
    }
    d.promises.filter(p=>p.status==='OPEN').forEach(function(p){
        if(p.governmentKey && p.governmentKey!==crisisGovernmentKey(state)){p.status='CANCELLED';return;}
        if(crisisSectorMetric(state,p.sector)>p.baseline+.01){p.status='FULFILLED';d.credibility=clamp(d.credibility+5,0,100);}
        else if(turn>=p.dueTurn){p.status='FAILED';crisisApproval(-4);d.credibility=clamp(d.credibility-8,0,100);state.historyLog.unshift('Premtimi 3-javor dështoi: ndëshkim i dyfishtë në mbështetje (-4 pikë).');}
    });
    if(!agendaExecutive()||d.pendingScandal)return;
    var eligible=state.ministries.map((m,i)=>({m,i})).filter(x=>state.coalitionParties.includes(x.m.party)&&x.m.minister!=='I/E paemëruar');
    if(eligible.length&&Math.random()<.04)createGovernmentScandal(eligible[Math.min(eligible.length-1,Math.floor(Math.random()*eligible.length))].i);
}
function answerCrisisPress(id,answer){
    if(!CRISIS_ANSWERS.some(a=>a.id===answer)||governmentCrisisPending())return false;var delta=0,message='';
    var ok=governmentCrisisCommit(function(){var d=state.governance,e=d.pressEvents.find(e=>e.id===id);if(!e||e.answered)throw Error('Konferenca është përfunduar.');
        if(answer==='SPIN'){d.spinUses++;d.mediaTrust=clamp(d.mediaTrust-12,0,100);delta=crisisApproval(d.spinUses>=(d.credibility>=70?4:3)||d.mediaTrust<40?-3:1);message=delta<0?'Gazetarët kundërshtuan justifikimin; strategjia u kthye në bumerang.':'Mesazhi mbrojti përkohësisht Qeverinë, por uli besimin te media.';}
        if(answer==='RESPONSIBILITY'){delta=crisisApproval(-1);d.credibility=clamp(d.credibility+8,0,100);d.mediaTrust=clamp(d.mediaTrust+5,0,100);message='Pranimi i përgjegjësisë rriti kredibilitetin institucional.';}
        if(answer==='PROMISE'){
            if(d.promises.some(p=>p.sector===e.sector&&p.status==='OPEN'))throw Error('Keni një premtim aktiv për këtë sektor.');
            d.promises.push({eventId:id,sector:e.sector,governmentKey:crisisGovernmentKey(state),baseline:crisisSectorMetric(state,e.sector),createdTurn:state.turnCount,dueTurn:state.turnCount+3,status:'OPEN'});message='U regjistrua afati prej 3 javësh për përmirësim real të cilësisë sektoriale.';
        }
        e.answered=true;e.answer=answer;
        if(typeof completeExecutivePress==='function')state.laws.forEach(completeExecutivePress);
    });
    if(ok){toggleModal('crisisPressModal',false);showGovernmentNotification({title:'Konferenca përfundoi',message,status:delta<0?'failure':'success',supportDelta:delta||null});}return ok;
}
function openCrisisPress(id){
    if(!agendaExecutive()||governmentCrisisPending()||state.pendingVote||weeklyProcessing||weeklyVisualBusy)return false;
    var e=state.governance?.pressEvents.find(e=>e.id===id&&!e.answered);if(!e)return false;var esc=catalogEscape;
    document.getElementById('crisisPressContent').innerHTML='<h2>Konferencë për shtyp</h2><p>'+esc(e.title)+'</p><blockquote>'+esc(CRISIS_QUESTIONS[e.kind].question)+'</blockquote>'+CRISIS_ANSWERS.map(a=>'<button class="choice-btn" onclick="answerCrisisPress(\''+esc(e.id)+'\',\''+a.id+'\')">'+esc(a.label)+'</button>').join('')+'<button class="btn-top" onclick="toggleModal(\'crisisPressModal\',false)">Kthehu</button>';toggleModal('crisisPressModal',true);return true;
}
function closeCrisisScandalDialog(){var d=document.getElementById('governmentScandalDialog');if(d?.open)d.close();}
function renderGovernmentCrisisUI(){
    var host=document.getElementById('contextualPressPanel');if(host){host.hidden=!agendaExecutive();if(!host.hidden){var d=state.governance,e=catalogEscape;host.innerHTML='<h3>Komunikimi në krizë</h3><p>Besimi te media: '+(d?.mediaTrust??70)+'/100 · Kredibiliteti: '+(d?.credibility??50)+'/100</p>'+(d?.pressEvents||[]).filter(x=>!x.answered).map(x=>'<article><strong>'+e(x.title)+'</strong><button class="action-btn" onclick="openCrisisPress(\''+x.id+'\')">Thirr Konferencë</button></article>').join('')+(d?.promises||[]).slice(-5).map(p=>'<p>Premtimi: '+e(state.stateSectors.find(s=>s.id===p.sector)?.name||p.sector)+' · '+(p.status==='OPEN'?Math.max(0,p.dueTurn-state.turnCount)+' javë':p.status==='FULFILLED'?'U përmbush':p.status==='CANCELLED'?'Mandati ndryshoi':'Dështoi')+'</p>').join('');}}
    var dialog=document.getElementById('governmentScandalDialog');if(!dialog||typeof dialog.showModal!=='function')return;
    if(!governmentCrisisPending()||!agendaExecutive()){closeCrisisScandalDialog();return;}
    var start=document.getElementById('startScreen');
    if(start&&!start.classList.contains('hidden')||weeklyProcessing||weeklyVisualBusy||state.pendingVote||document.querySelector('dialog[open]:not(#governmentScandalDialog)')){
        if(governmentCrisisRetry===null)governmentCrisisRetry=setTimeout(function(){governmentCrisisRetry=null;renderGovernmentCrisisUI();},250);return;
    }
    var s=state.governance.scandals.find(s=>s.id===state.governance.pendingScandal);if(!s)return;
    if(dialog.open&&dialog.dataset.scandal===s.id)return;dialog.dataset.scandal=s.id;
    var e=catalogEscape;document.getElementById('governmentScandalContent').innerHTML='<span class="tag tag-pdk">URGJENTE · SKANDAL QEVERITAR</span><h2 id="governmentScandalTitle">Dyshime për korrupsion</h2><p>'+e(s.minister)+' · '+e(state.parties[s.party].short)+'</p><p>Raportimi kërkon përgjigjen tuaj. Koha mbetet e ndalur deri në vendim.</p><button class="choice-btn" onclick="resolveGovernmentScandal(\'DISMISS\')"><strong>Shkarko Ministrin</strong><span>+5 pikë mbështetje · Rrezik abstenimi nga grupi i tij për 6 javë</span></button><button class="choice-btn" onclick="resolveGovernmentScandal(\'DEFEND\')"><strong>Mbro Ministrin</strong><span>−8 pikë mbështetje · Pezullim i granteve për 4 javë</span></button>';
    if(!dialog.open){dialog.showModal();dialog.querySelector('button')?.focus();}
}
if(typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',function(){document.getElementById('governmentScandalDialog')?.addEventListener('cancel',function(e){if(governmentCrisisPending())e.preventDefault();});});
