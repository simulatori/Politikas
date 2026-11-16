/* A required appointment around the existing cabinet agenda, not a second decision engine. */
const REGULAR_CABINET_INTERVAL=2;
function regularCabinetScope(st=state){return st.playerParty+':'+deputyCycleId(st);}
function migrateRegularCabinet(st){
    if(!st.governance.regularCabinet)st.governance.regularCabinet={version:1,scope:regularCabinetScope(st),nextTurn:st.turnCount+1,counter:0,session:null,minutes:[]};
    return st.governance.regularCabinet;
}
function regularCabinetDB(st=state){return st.governance.regularCabinet;}
function regularCabinetDue(st=state){const d=regularCabinetDB(st);return !!d&&agendaExecutive(st)&&(d.scope!==regularCabinetScope(st)||st.turnCount>=d.nextTurn||d.session?.status==='ACTIVE');}
function regularCabinetEligible(item,st=state){const r=item.agendaRequestId&&st.pmInboxRequests.find(r=>r.id===item.agendaRequestId);return !item.done&&(!item.availableTurn||item.availableTurn<=st.turnCount)&&(!item.agendaRequestId||r&&agendaActive(r)&&r.dueTurn>=st.turnCount);}
function regularCabinetSync(st=state){const d=migrateRegularCabinet(st);if(!agendaExecutive(st)||d.scope!==regularCabinetScope(st)){d.scope=regularCabinetScope(st);d.session=null;d.nextTurn=st.turnCount+1;}return d;}
function regularCabinetOutstanding(st=state){const s=regularCabinetDB(st)?.session;return (s?.items||[]).filter(id=>!s.decisions.some(r=>r.itemId===id)&&st.cabinetAgenda.some(a=>a.id===id&&regularCabinetEligible(a,st)));}
function openRegularCabinet(){
    if(!regularCabinetDue()||urgentInterfaceBusy())return false;
    let s=regularCabinetDB().session;
    if(!s||s.status!=='ACTIVE'){
        if(!lifeCommit(()=>{if(typeof prepareMinisterCabinetAgenda==='function')prepareMinisterCabinetAgenda();const d=regularCabinetSync(),previous=d.session,number=previous?.number||++d.counter;d.session={id:'cabinet-session:'+number,number,status:'ACTIVE',startedTurn:previous?.startedTurn??state.turnCount,postponed:!!previous?.postponed,items:state.cabinetAgenda.filter(a=>regularCabinetEligible(a)).map(a=>a.id),decisions:[]};}))return false;
    }
    renderRegularCabinet();toggleModal('regularCabinetModal',true);document.querySelector('#regularCabinetBody button')?.focus?.({preventScroll:true});return true;
}
function renderRegularCabinet(){
    const d=regularCabinetDB(),s=d?.session,host=document.getElementById('regularCabinetBody');if(!host||s?.status!=='ACTIVE')return;
    const e=catalogEscape,remaining=regularCabinetOutstanding(),item=state.cabinetAgenda.find(a=>a.id===remaining[0]);
    let html='<header class="scene-toolbar"><div><small>REPUBLIKA E KOSOVËS · KABINETI</small><h2 id="regularCabinetTitle">Mbledhja e Qeverisë nr. '+s.number+'</h2></div><button class="btn-top" onclick="toggleModal(\'regularCabinetModal\',false)">Ruaj dhe dil</button></header><p class="cabinet-session-status">'+(s.items.length?s.decisions.length+' pika të shqyrtuara · '+remaining.length+' në pritje':'Raportim i rregullt i kabinetit')+'</p>';
    if(item){
        const id=e(JSON.stringify(item.id)),full=enterpriseMoney(item.costB),revised=enterpriseMoney(+(item.costB*.7).toFixed(3));
        html+='<section class="cabinet-session-discussion"><h3>'+e(item.title)+'</h3><article><strong>'+e(item.ministerName||item.ministry)+'</strong><p>'+e(item.ministerArgument||item.note||'Propozimi kërkon vendim të kabinetit.')+'</p><p>Kërkesa për financim: '+full+'.</p></article><article class="cabinet-finance-objection"><strong>Ministria e Financave</strong><p>'+e(item.financeObjection||'Miratimi kërkon mbulesë financiare dhe respektim të ndarjeve vjetore. Mund ta rishikojmë kërkesën ose ta shtyjmë.')+'</p></article></section><div class="cabinet-session-options"><button class="conference-option" onclick="regularCabinetDecision('+id+',\'FULL_APPROVE\')"><strong>Mirato propozimin · '+full+'</strong><span>Vazhdo me kontrollin e fondeve dhe procedurën ekzistuese të zbatimit.</span></button><button class="conference-option" onclick="regularCabinetDecision('+id+',\'MODIFIED_BUDGET\')"><strong>Kërko kompromis buxhetor · '+revised+'</strong><span>Mirato variantin e rishikuar, me shtrirje më të kufizuar.</span></button><button class="conference-option" onclick="regularCabinetDecision('+id+',\'POSTPONE\')"><strong>Ktheje për shqyrtim në mbledhjen pasuese</strong><span>Sot nuk autorizohet shpenzim. Dosja mbetet e hapur.</span></button></div>';
    }else{
        html+='<section class="cabinet-session-discussion"><h3>'+(s.items.length?'Rendi i ditës u shqyrtua':'Raportim mbi gjendjen e qeverisjes')+'</h3><p>Mjete në arkën shtetërore: '+enterpriseMoney(state.budgetTotalB)+'. Mbështetja qytetare: '+Number(state.approval).toFixed(1)+'%.</p><p>'+(s.items.length?'Vendimet e financimit ndiqen sipas procedurave ekzistuese. Pikat e shtyra mbeten për mbledhjet pasuese.':'Nuk ka propozime të gatshme për vendim. Raportimi nuk autorizon pagesa dhe nuk sjell shpërblim politik automatik.')+'</p></section><button class="action-btn btn-gold" onclick="finishRegularCabinet()">'+(s.items.length?'Mirato procesverbalin dhe përfundo mbledhjen':'Marr dijeni dhe përfundo mbledhjen')+'</button>';
    }
    if(!s.postponed&&!s.decisions.length)html+='<button class="btn-top" onclick="postponeRegularCabinet()">Shtyje mbledhjen një javë · vetëm një herë</button>';
    html+='<p class="cabinet-session-note">Mund të dalësh për të kontrolluar dosjet. Java tjetër kërkon përfundimin e mbledhjes ose përdorimin e shtyrjes së vetme.</p>';host.innerHTML=html;
}
function regularCabinetDecision(id,mode){
    const s=regularCabinetDB()?.session;if(!agendaExecutive()||s?.status!=='ACTIVE'||regularCabinetOutstanding()[0]!==id||!['FULL_APPROVE','MODIFIED_BUDGET','POSTPONE'].includes(mode)||urgentInterfaceBusy())return false;
    const idx=state.cabinetAgenda.findIndex(a=>a.id===id);
    if(mode==='POSTPONE'){
        const ok=lifeCommit(()=>{regularCabinetDB().session.decisions.push({itemId:id,mode,turn:state.turnCount});politicalSceneJournal('cabinet:'+id,'CABINET','Pika u kthye për shqyrtim në mbledhjen pasuese, pa shpenzim.','DEFERRED');});
        if(ok)renderRegularCabinet();return ok;
    }
    // The existing resolver owns every fiscal check, confirmation and side effect.
    const result=resolveCabinetDecision(idx,mode);
    if(state.cabinetAgenda.find(a=>a.id===id)?.done){toggleModal('regularCabinetModal',false);scheduleRegularCabinet();return true;}
    return result===true;
}
function recordRegularCabinetDecision(id,mode){const s=regularCabinetDB()?.session;if(s?.status==='ACTIVE'&&s.items.includes(id)&&!s.decisions.some(r=>r.itemId===id))s.decisions.push({itemId:id,mode,turn:state.turnCount});}
const regularCabinetResolveBase=resolveCabinetDecision;
resolveCabinetDecision=function(index,mode){
    const before=JSON.stringify(state),id=state.cabinetAgenda[index]?.id,result=regularCabinetResolveBase(index,mode);
    if(id&&state.cabinetAgenda.find(a=>a.id===id)?.done&&['FULL_APPROVE','MODIFIED_BUDGET'].includes(mode)){
        const s=regularCabinetDB()?.session;
        if(s?.status==='ACTIVE'&&s.items.includes(id)&&!s.decisions.some(r=>r.itemId===id)||state.cabinetAgenda.find(a=>a.id===id)?.aiProposal)try{recordRegularCabinetDecision(id,mode);if(typeof recordCabinetIntelligenceDecision==='function')recordCabinetIntelligenceDecision(id,mode);validateLoadedState(state);if(!saveGameAuto())throw Error('Procesverbali nuk u ruajt; vendimi u anulua.');}catch(error){state=JSON.parse(before);showToast(error.message);refreshAllUI();return false;}
    }
    return result;
};
function finishRegularCabinet(){
    const s=regularCabinetDB()?.session;if(s?.status!=='ACTIVE'||regularCabinetOutstanding().length)return false;
    const ok=lifeCommit(()=>{const d=regularCabinetDB(),r=d.session;d.minutes.push({...JSON.parse(JSON.stringify(r)),status:'COMPLETED',completedTurn:state.turnCount});d.session=null;d.nextTurn=state.turnCount+REGULAR_CABINET_INTERVAL;state.historyLog.unshift('Qeveria: përfundoi mbledhja nr. '+r.number+'. '+r.decisions.length+' pika të shqyrtuara.');});
    if(ok)toggleModal('regularCabinetModal',false);return ok;
}
function postponeRegularCabinet(){
    const d=regularCabinetDB(),s=d?.session;if(!regularCabinetDue()||s?.status!=='ACTIVE'||s.postponed||s.decisions.length)return false;
    const ok=lifeCommit(()=>{const db=regularCabinetDB();db.session={...(db.session||{}),status:'DEFERRED',postponed:true};db.nextTurn=state.turnCount+1;});if(ok)toggleModal('regularCabinetModal',false);return ok;
}
function presentRegularCabinet(){
    if(!regularCabinetDue()||urgentInterfaceBusy()||document.querySelector('.modal-overlay.show,dialog[open]')||!document.getElementById('startScreen')?.classList.contains('hidden'))return false;
    // Constitutional crises and the annual deadline keep their existing priority.
    if(governmentCrisisPending()||annualBudgetPendingYear()&&!state.publicFinance.annualNotices?.some(r=>r.year===annualBudgetPendingYear()&&r.lastPresentedTurn===state.turnCount))return false;
    return openRegularCabinet();
}
let regularCabinetTimer=null;
function scheduleRegularCabinet(){if(regularCabinetTimer!==null)return;regularCabinetTimer=setTimeout(()=>{regularCabinetTimer=null;presentRegularCabinet();},0);}
function renderRegularCabinetLauncher(){const el=document.getElementById('regularCabinetLauncher');if(!el||!state)return;el.hidden=!regularCabinetDue();el.textContent='Mbledhja e Qeverisë · kërkon përfundim';}
const regularCabinetFreshBase=createFreshState,regularCabinetPrepareBase=prepareLoadedState,regularCabinetValidateBase=validateLoadedState,regularCabinetRefreshBase=refreshAllUI,regularCabinetWeekReasonBase=weekAdvanceReason,regularCabinetInterruptBase=worldAttentionInterrupt,regularCabinetToggleBase=toggleModal;
createFreshState=function(...args){const st=regularCabinetFreshBase(...args);migrateRegularCabinet(st);return st;};
prepareLoadedState=function(...args){const st=regularCabinetPrepareBase(...args);migrateRegularCabinet(st);validateLoadedState(st);return st;};
weekAdvanceReason=function(weeks){const reason=regularCabinetWeekReasonBase(weeks);if(reason)return reason;if(regularCabinetDue()){scheduleRegularCabinet();return 'Përfundo mbledhjen e Qeverisë ose shtyje një javë, nëse shtyrja është ende e disponueshme.';}return '';};
worldAttentionInterrupt=function(st=state){regularCabinetSync(st);return regularCabinetInterruptBase(st)||regularCabinetDue(st);};
refreshAllUI=function(...args){const result=regularCabinetRefreshBase(...args);renderRegularCabinetLauncher();scheduleRegularCabinet();return result;};
toggleModal=function(id,show){const result=regularCabinetToggleBase(id,show);if(!show&&id!=='regularCabinetModal')scheduleRegularCabinet();return result;};
document.addEventListener('close',scheduleRegularCabinet,true);
const regularCabinetDismissWeekBase=dismissWeeklyTransition;
dismissWeeklyTransition=function(...args){const result=regularCabinetDismissWeekBase(...args);scheduleRegularCabinet();return result;};
validateLoadedState=function(st){
    regularCabinetValidateBase(st);const d=regularCabinetDB(st);if(!d)return st;
    const validSession=(s,complete)=>s&&Number.isInteger(s.number)&&s.number>0&&Number.isInteger(s.startedTurn)&&s.startedTurn<=st.turnCount&&Array.isArray(s.items)&&new Set(s.items).size===s.items.length&&s.items.every(id=>typeof id==='string')&&Array.isArray(s.decisions)&&new Set(s.decisions.map(r=>r.itemId)).size===s.decisions.length&&s.decisions.every(r=>s.items.includes(r.itemId)&&['FULL_APPROVE','MODIFIED_BUDGET','POSTPONE'].includes(r.mode)&&Number.isInteger(r.turn)&&r.turn>=s.startedTurn&&r.turn<=st.turnCount)&&(!complete||Number.isInteger(s.completedTurn)&&s.completedTurn>=s.startedTurn&&s.completedTurn<=st.turnCount);
    if(d.version!==1||typeof d.scope!=='string'||!Number.isInteger(d.nextTurn)||d.nextTurn<0||!Number.isInteger(d.counter)||d.counter<0||!Array.isArray(d.minutes)||d.minutes.some(s=>s.status!=='COMPLETED'||!validSession(s,true))||new Set(d.minutes.map(s=>s.id)).size!==d.minutes.length||d.session&&(!validSession(d.session,false)||!['ACTIVE','DEFERRED'].includes(d.session.status)||d.session.status==='DEFERRED'&&d.session.postponed!==true))throw Error('Orari ose procesverbali i mbledhjes së Qeverisë është i pavlefshëm.');return st;
};
window.addEventListener('keydown',event=>{
    const modal=document.getElementById('regularCabinetModal');if(!modal?.classList.contains('show')||document.querySelector('#ministryBudgetConfirmModal.show'))return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();toggleModal('regularCabinetModal',false);}
    if(event.key==='Tab'){const buttons=Array.from(modal.querySelectorAll('button')).filter(b=>!b.disabled&&b.getClientRects().length),first=buttons[0],last=buttons.at(-1);if(!first)return;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
},true);
