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
// Project existing cases into one list; never create duplicate crisis records.
const GOVERNMENT_CRISIS_ROUTES=[
 ['associationUltimatumPending','Ultimatumi i QUINT-it','renderAssociationUltimatum'],
 ['sectorExpansionPending','Vendimi sektorial','renderSectorExpansion'],['energyInquiryPending','Komisioni i rrymës','renderEnergyInquiry'],
 ['rtkPending','Bordi i RTK-së','renderRTK'],['pendingTrepca','Greva në Trepçë','renderTrepca'],['sovereignPending','Fondi Sovran','renderSovereignFund'],
 ['pendingHighwayProject','Tenderi i autostradës','renderHighwayProject'],['bureauBattlePending','Byroja e Konfiskimit','renderBureauBattle'],
 ['pendingDinarCrisis','Ndalimi i dinarit','renderDinarCrisis'],['laborExodusPending','Eksodi i fuqisë punëtore','renderLaborExodus'],
 ['pendingCoalitionBlackmail','Shantazhi i koalicionit','renderCoalitionBlackmail'],['veteransBudgetPending','Listat e veteranëve','renderVeteransBudget'],
 ['enterpriseBoardsPending','Bordet e ndërmarrjeve','renderEnterpriseBoards'],['municipalGrantPending','Grantet komunale','renderMunicipalGrants'],
 ['generalStrikePending','Greva e përgjithshme','renderGeneralStrike'],['pendingWinterEnergy','Kriza energjetike','renderWinterEnergy'],
 ['councilPending','Këshilli i Evropës','renderCouncilEurope'],['mediaDossierBlocked','Dosja mediatike','renderMediaDossiers'],
 ['internalPressurePending','Ultimatumi i brendshëm','renderInternalPressure'],['northPending','Kriza e Veriut','renderNorthCrisis'],
 ['diasporaPendingSeason','Organizimi i votimit të Mërgatës','renderDiasporaMobilization'],['institutionalConflictPending','Konflikti institucional','renderInstitutionalConflicts'],
 ['imfPending','Pakoja e FMN-së','renderIMFCrisis'],['brusselsDecisionPending','Vendimi i dialogut','renderBrusselsSpecial'],
 ['roguePendingReport','Raporti sekret i tenderit','renderSurvivalCrises'],['veteransCrisisPending','Auditimi i veteranëve','renderSurvivalCrises']
];
function pendingGovernmentDecisions(st){
 st=st||state;if(!agendaExecutive(st))return [];
 const rows=GOVERNMENT_CRISIS_ROUTES.filter(r=>typeof globalThis[r[0]]==='function'&&globalThis[r[0]](st)).map(r=>({key:r[0],title:r[1],renderer:r[2]}));
 if(st.governance?.pendingScandal)rows.push({key:'SCANDAL',title:'Skandali i ministrit',renderer:'renderGovernmentCrisisUI'});
 return rows.sort((a,b)=>crisisPriority(a.key)-crisisPriority(b.key));
}
function governmentWeekBlockReason(st){const rows=pendingGovernmentDecisions(st);return rows.length?'Java pret vendim: '+rows.map(r=>r.title).join(' · ')+'. Hapni vendimin urgjent te Qendra e Situatës.':'';}
function openGovernmentDecision(key){
 const row=pendingGovernmentDecisions(state).find(r=>r.key===key);if(!row)return false;
 if(weeklyProcessing||weeklyVisualBusy||state.pendingVote){showToast('Përfundoni votimin ose përmbledhjen e javës.');return false;}
 if(document.querySelector('dialog[open],.modal-overlay.show')){showToast('Përfundoni ose mbyllni dritaren e hapur përpara vendimit tjetër.');return false;}
 callGameRenderer(row.renderer);return true;
}
function renderGovernmentDecisionStatus(){
 const host=document.getElementById('governmentDecisionStatus');if(!host)return;const rows=pendingGovernmentDecisions(state);host.hidden=!rows.length;
 host.innerHTML=rows.length?'<h3>Java pret vendim · '+rows.length+'</h3><p>Rastet shfaqen sipas urgjencës, një dritare në herë. Mbyllja e dritares nuk e zgjidh rastin dhe nuk rivendos afatin.</p>'+rows.map(r=>'<div class="crisis-decision-row"><strong>'+catalogEscape(r.title)+' <small>· '+(['Kritike','Urgjente','Vendim në pritje'][crisisPriority(r.key)])+'</small></strong><button class="action-btn" onclick="openGovernmentDecision(\''+r.key+'\')">Hap vendimin</button></div>').join(''):'';
}
function randomMinisterScandalAllowed(st){
 const start=st.productionResources?.startTurn??1,latest=(st.governance?.scandals||[]).filter(s=>Number.isInteger(s.decisionTurn)).reduce((n,s)=>Math.max(n,s.decisionTurn),-Infinity);
 return agendaExecutive(st)&&st.turnCount>start+3&&st.turnCount>latest+3&&!governmentCrisisPending(st);
}
function migrateGovernmentCrises(st){if(st.governance===undefined)st.governance={version:1,lastTurn:st.turnCount,counter:0,pendingScandal:null,scandals:[],grantsBlockedUntil:0,resentment:{},mediaTrust:70,credibility:50,spinUses:0,pressEvents:[],promises:[],ipaClaims:[],regionalDeals:[]};}
function governmentCrisisPending(st){return pendingGovernmentDecisions(st).length>0;}
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
    if(!randomMinisterScandalAllowed(state))return;
    var eligible=state.ministries.map((m,i)=>({m,i})).filter(x=>state.coalitionParties.includes(x.m.party)&&x.m.minister!=='I/E paemëruar'&&!d.scandals.some(s=>s.minister===x.m.minister&&Number.isInteger(s.decisionTurn)&&turn<s.decisionTurn+12));
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
    if(!state.governance?.pendingScandal||!agendaExecutive()){if(governmentCrisisRetry!==null){clearTimeout(governmentCrisisRetry);governmentCrisisRetry=null;}closeCrisisScandalDialog();return;}
    var dialog=document.getElementById('governmentScandalDialog');if(!dialog||typeof dialog.showModal!=='function')return;
    var start=document.getElementById('startScreen');
    if(start&&!start.classList.contains('hidden')||weeklyProcessing||weeklyVisualBusy||state.pendingVote||document.querySelector('dialog[open]:not(#governmentScandalDialog)')){
        if(governmentCrisisRetry===null)governmentCrisisRetry=setTimeout(function(){governmentCrisisRetry=null;renderGovernmentCrisisUI();},250);return;
    }
    var s=state.governance.scandals.find(s=>s.id===state.governance.pendingScandal);if(!s)return;
    if(dialog.open&&dialog.dataset.scandal===s.id)return;dialog.dataset.scandal=s.id;
    var e=catalogEscape;document.getElementById('governmentScandalContent').innerHTML='<span class="tag tag-pdk">URGJENTE · SKANDAL QEVERITAR</span><h2 id="governmentScandalTitle">Dyshime për korrupsion</h2><p>'+e(s.minister)+' · '+e(state.parties[s.party].short)+'</p><p>Raportimi kërkon përgjigjen tuaj. Koha mbetet e ndalur deri në vendim.</p><button class="choice-btn" onclick="resolveGovernmentScandal(\'DISMISS\')"><strong>Shkarko Ministrin</strong><span>+5 pikë mbështetje · Rrezik abstenimi nga grupi i tij për 6 javë</span></button><button class="choice-btn" onclick="resolveGovernmentScandal(\'DEFEND\')"><strong>Mbro Ministrin</strong><span>−8 pikë mbështetje · Pezullim i granteve për 4 javë</span></button>';
    if(!dialog.open){if(!governmentCrisisPresentationBlocked('renderGovernmentCrisisUI'))dialog.showModal();dialog.querySelector('button')?.focus();}
}
if(typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',function(){document.getElementById('governmentScandalDialog')?.addEventListener('cancel',function(e){if(governmentCrisisPending())e.preventDefault();});});
