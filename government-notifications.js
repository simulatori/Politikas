/* Presentation only. Notifications never alter votes, money, approval or Cloud saves. */
var governmentNotificationQueue=[],governmentNotificationSeen=new Set(),governmentNotificationCurrent=null;
var governmentNotificationTimer=null,governmentNotificationRetry=null,governmentNotificationSerial=0;
var governmentNotificationRemaining=4800,governmentNotificationStarted=0,governmentNotificationReturnFocus=null;
function governmentNoticeAudience(n){return n.audience||(n.kind==='VOTE'?'PUBLIC':'EXECUTIVE');}
function governmentNoticeAuthorized(n){
    if(!state)return false;
    if(n.ownerParty&&n.ownerParty!==state.playerParty||n.cycleId&&n.cycleId!==deputyCycleId(state))return false;
    const audience=governmentNoticeAudience(n);
    return audience==='PUBLIC'||audience==='POLITICAL'||audience==='OPPOSITION'&&['OPPOSITION_LEADER','OPPOSITION_MP','PARTY_LEADER'].includes(politicalPlayerRole(state).id)||audience==='EXECUTIVE'&&agendaExecutive(state);
}
function governmentNoticeMessage(n){return agendaExecutive(state)?n.message:n.message.replace(/^Urime Kryeministër, ju sapo miratuat ligjin për /,'Kuvendi miratoi ligjin për ').replace(/^Urime Kryeministër, /,'').replace(/^Kryeministër, /,'');}
function reconcileGovernmentNotificationAudience(){
    governmentNotificationQueue=governmentNotificationQueue.filter(governmentNoticeAuthorized);
    if(governmentNotificationCurrent&&!governmentNoticeAuthorized(governmentNotificationCurrent))dismissGovernmentNotification();
}
function governmentPlainText(value){return String(value??'').replace(/<[^>]*>/g,'').slice(0,4000);}
function governmentSupportText(value){return (value>0?'+':'')+value.toLocaleString('sq-AL',{minimumFractionDigits:2,maximumFractionDigits:6})+' pikë';}
function validateGovernmentNotice(n){
    if(n?.audience!==undefined&&!['PUBLIC','EXECUTIVE','OPPOSITION','POLITICAL'].includes(n.audience))throw Error('Audiencë e pavlefshme e njoftimit.');
    if(!n||typeof n.id!=='string'||n.id.length>300||typeof n.title!=='string'||n.title.length>500||typeof n.message!=='string'||n.message.length>4000||!['success','failure'].includes(n.status)||typeof n.stamp!=='string'||n.stamp.length>40||typeof n.critical!=='boolean'||!Array.isArray(n.details)||n.details.length>8||n.details.some(x=>typeof x!=='string'||x.length>1200)||n.supportDelta!==null&&(!Number.isFinite(n.supportDelta)||Math.abs(n.supportDelta)>100))throw Error('Njoftimi qeveritar është i pavlefshëm.');
    return true;
}
function createGovernmentVoteNotice(meta,votes,beforeApproval,afterApproval,announcement){
    if(!meta||typeof meta.approved!=='boolean')return null;
    const kind=meta.kind||'LAW',approved=meta.approved,success=kind==='CONFIDENCE'?(meta.opposition?approved:!approved):approved;
    const pm=(!!meta.primeMinister||kind==='GOVERNMENT'&&approved)&&agendaExecutive(state),address=pm?'Kryeministër, ':'',title=governmentPlainText(meta.title||'Vendimi i Kuvendit').slice(0,500);
    let message;
    if(kind==='LAW')message=approved?(pm?'Urime Kryeministër, ju sapo miratuat ligjin për “':'Kuvendi miratoi ligjin për “')+title+'”.':address+'Parlamenti refuzoi propozimin “'+title+'”.';
    else if(kind==='GOVERNMENT')message=approved?(pm?'Urime Kryeministër, Qeveria juaj mori besimin e Kuvendit.':'Qeveria mori besimin e Kuvendit.'):'Qeveria nuk mori votat e nevojshme për miratim.';
    else if(kind==='CONFIDENCE')message=approved?address+'Parlamenti miratoi mocionin e mosbesimit. Qeveria humbi besimin.':'Mocioni i mosbesimit u refuzua. Qeveria ruajti besimin e Kuvendit.';
    else message=approved?'Kuvendi zgjodhi Presidentin: '+title+'.':meta.quorum===false?'Votimi për Presidentin nuk pati kuorum të vlefshëm.':'Kandidatura për President nuk mori votat e nevojshme: '+title+'.';
    const delta=Number.isFinite(beforeApproval)&&Number.isFinite(afterApproval)?+(afterApproval-beforeApproval).toFixed(6):null;
    const details=['Për: '+votes.pro+' · Kundër: '+votes.kunder+' · Abstenim: '+votes.abstenim+' · Mungesa: '+votes.mungese];
    if(meta.required)details.push('Pragu i miratimit: '+meta.required+' vota.');
    if(announcement?.immediateImpact)details.push(governmentPlainText(announcement.immediateImpact).slice(0,1200));
    return {audience:'PUBLIC',ownerParty:state.playerParty,cycleId:deputyCycleId(state),id:'gov-vote:'+Date.now()+':'+(++governmentNotificationSerial),kind:'VOTE',title,message,status:success?'success':'failure',stamp:meta.quorum===false?'PA KUORUM':approved?'MIRATUAR':'REFUZUAR',supportDelta:delta,critical:Math.abs(delta||0)>1e-6||kind==='CONFIDENCE'&&approved,details};
}
function showGovernmentNotification(options){
    const n={audience:options.audience||(options.kind==='VOTE'?'PUBLIC':'EXECUTIVE'),ownerParty:options.ownerParty||state.playerParty,cycleId:options.cycleId||deputyCycleId(state),id:options.id||'gov-decision:'+Date.now()+':'+(++governmentNotificationSerial),kind:options.kind||'DECISION',title:governmentPlainText(options.title||'Vendim qeveritar').slice(0,500),message:governmentPlainText(options.message),status:options.status==='failure'?'failure':'success',stamp:governmentPlainText(options.stamp||(options.status==='failure'?'REFUZUAR':'MIRATUAR')).slice(0,40),supportDelta:Number.isFinite(options.supportDelta)?options.supportDelta:null,critical:!!options.critical||Math.abs(options.supportDelta||0)>1e-6,details:(options.details||[]).slice(0,8).map(x=>governmentPlainText(x).slice(0,1200))};
    validateGovernmentNotice(n);if(!governmentNoticeAuthorized(n)||governmentNotificationSeen.has(n.id))return false;n.message=governmentNoticeMessage(n);
    governmentNotificationSeen.add(n.id);governmentNotificationQueue.push(n);
    if(typeof recordUXNotification==='function')recordUXNotification(n.title+' · '+n.message+(n.supportDelta?' · Mbështetja '+governmentSupportText(n.supportDelta)+'.':''));
    pumpGovernmentNotifications();return true;
}
function governmentNoticeCanPresent(n){
    if(!n.critical&&typeof governmentCrisisPending==='function'&&governmentCrisisPending(state))return false;
    if(typeof document.createElement!=='function')return false;
    if(typeof weeklyProcessing!=='undefined'&&weeklyProcessing||typeof weeklyVisualBusy!=='undefined'&&weeklyVisualBusy)return false;
    const start=document.getElementById('startScreen');if(start&&!start.classList.contains('hidden'))return false;
    const weekly=document.getElementById('weekTransitionOverlay');if(weekly&&weekly.style.display&&weekly.style.display!=='none')return false;
    if(document.querySelector('dialog[open]:not(#governmentNotificationDialog)'))return false;
    if(document.querySelector('.modal-overlay.show:not(#votingModal)'))return false;
    if(document.getElementById('votingModal')?.classList.contains('show')){
        if(n.kind!=='VOTE'||state.pendingVote?.governmentNotice?.id!==n.id||!currentVotingData||currentVotingData.totalCounted<120)return false;
    }
    return true;
}
function governmentNoticeElement(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function pumpGovernmentNotifications(){
    governmentNotificationQueue=governmentNotificationQueue.filter(governmentNoticeAuthorized);
    if(governmentNotificationCurrent||!governmentNotificationQueue.length)return;
    const n=governmentNotificationQueue[0];if(!governmentNoticeCanPresent(n)){
        if(typeof document.createElement==='function'&&governmentNotificationRetry===null)governmentNotificationRetry=setTimeout(function(){governmentNotificationRetry=null;pumpGovernmentNotifications();},250);return;
    }
    const toast=document.getElementById('governmentNotificationToast'),dialog=document.getElementById('governmentNotificationDialog');if(!toast||!dialog)return;
    governmentNotificationQueue.shift();n.message=governmentNoticeMessage(n);governmentNotificationCurrent=n;governmentNotificationRemaining=4800;
    const card=governmentNoticeElement('section','gov-notice-card gov-notice--'+n.status),header=governmentNoticeElement('div','gov-notice-header'),identity=governmentNoticeElement('div','gov-notice-identity');
    identity.append(governmentNoticeElement('span','gov-notice-crest','🏛️'),governmentNoticeElement('span','gov-notice-eyebrow','REPUBLIKA · '+({EXECUTIVE:'NJOFTIM QEVERITAR',OPPOSITION:'NJOFTIM OPOZITAR',POLITICAL:'NJOFTIM POLITIK',PUBLIC:'NJOFTIM PARLAMENTAR'})[governmentNoticeAudience(n)]));
    const stamp=governmentNoticeElement('div','gov-notice-stamp',n.stamp);stamp.setAttribute('aria-hidden','true');header.append(identity,stamp);card.append(header);
    const title=governmentNoticeElement('h2','gov-notice-title',n.title);title.id='governmentNotificationTitle';const message=governmentNoticeElement('p','gov-notice-message',n.message);message.id='governmentNotificationMessage';card.append(title,message);
    if(n.details.length){const list=governmentNoticeElement('ul','gov-notice-details');n.details.forEach(text=>list.append(governmentNoticeElement('li','',text)));card.append(list);}
    if(n.supportDelta!==null&&Math.abs(n.supportDelta)>1e-6){const impact=governmentNoticeElement('div','gov-notice-impact '+(n.supportDelta>0?'is-positive':'is-negative'));impact.append(governmentNoticeElement('span','','Mbështetja qytetare'),governmentNoticeElement('strong','',governmentSupportText(n.supportDelta)));card.append(impact);}
    const button=governmentNoticeElement('button','action-btn gov-notice-continue',n.critical?'Vazhdo':'Mbyll');button.type='button';button.addEventListener('click',dismissGovernmentNotification);card.append(button);
    if(n.critical){
        governmentNotificationReturnFocus=document.activeElement;dialog.replaceChildren(card);dialog.showModal();button.focus({preventScroll:true});
    }else{
        card.append(governmentNoticeElement('div','gov-notice-timer'));toast.replaceChildren(card);toast.hidden=false;
        toast.onpointerenter=e=>{if(e.pointerType==='mouse')pauseGovernmentNotification();};toast.onpointerleave=()=>{if(!toast.contains(document.activeElement))resumeGovernmentNotification();};toast.onfocusin=pauseGovernmentNotification;toast.onfocusout=()=>setTimeout(()=>{if(!toast.contains(document.activeElement))resumeGovernmentNotification();},0);
        resumeGovernmentNotification();
    }
}
function pauseGovernmentNotification(){
    if(!governmentNotificationCurrent||governmentNotificationCurrent.critical||governmentNotificationTimer===null)return;
    governmentNotificationRemaining=Math.max(0,governmentNotificationRemaining-(Date.now()-governmentNotificationStarted));clearTimeout(governmentNotificationTimer);governmentNotificationTimer=null;document.getElementById('governmentNotificationToast')?.classList.add('gov-notice-paused');
}
function resumeGovernmentNotification(){
    if(!governmentNotificationCurrent||governmentNotificationCurrent.critical||governmentNotificationTimer!==null)return;
    document.getElementById('governmentNotificationToast')?.classList.remove('gov-notice-paused');governmentNotificationStarted=Date.now();governmentNotificationTimer=setTimeout(dismissGovernmentNotification,governmentNotificationRemaining);
}
function dismissGovernmentNotification(){
    const n=governmentNotificationCurrent;if(!n)return false;clearTimeout(governmentNotificationTimer);governmentNotificationTimer=null;governmentNotificationCurrent=null;
    const toast=document.getElementById('governmentNotificationToast'),dialog=document.getElementById('governmentNotificationDialog');if(toast){toast.hidden=true;toast.replaceChildren();toast.classList.remove('gov-notice-paused');}if(dialog){if(dialog.open)dialog.close();dialog.replaceChildren();}
    if(n.critical){const previous=governmentNotificationReturnFocus,proceed=document.getElementById('votingProceedBtn');if(previous?.isConnected&&previous.getClientRects().length)previous.focus({preventScroll:true});else if(proceed?.getClientRects().length)proceed.focus({preventScroll:true});governmentNotificationReturnFocus=null;}
    pumpGovernmentNotifications();return true;
}
function resetGovernmentNotifications(){
    governmentNotificationQueue=[];governmentNotificationSeen.clear();clearTimeout(governmentNotificationRetry);governmentNotificationRetry=null;
    if(governmentNotificationCurrent)dismissGovernmentNotification();
}
function governmentInvestmentSnapshot(st){
    const result={},db=st?.foreignInvestments;if(!db)return result;
    (db.bidders||[]).forEach(b=>{
        const i=fdiInvestor(b.investorId),revealed=b.revealed;
        result['bidder:'+b.id]={status:b.status,title:fdiBidderTitle(b),delta:Number.isFinite(b.approvalAfter)&&Number.isFinite(b.approvalBefore)?b.approvalAfter-b.approvalBefore:null,turn:b.completedTurn??b.failedTurn??b.signedTurn??b.startTurn,cost:i.cofinanceB,reason:b.failureReason||'',revealed,jobs:revealed?i.jobs:null,tax:revealed?i.weeklyTaxB:null};
    });
    (db.offers||[]).forEach(o=>{const t=FDI_TYPES[o.type];result['legacy:'+o.id]={status:o.status,title:t.title,delta:Number.isFinite(o.approvalAfter)&&Number.isFinite(o.approvalBefore)?o.approvalAfter-o.approvalBefore:null,turn:o.completedTurn??o.failedTurn??o.startTurn,cost:t.costB,reason:o.failureReason||'',revealed:true,jobs:t.jobs||null,tax:t.taxB*(t.mega?1-t.relief:1)/FISCAL_WEEKS};});return result;
}
function notifyGovernmentInvestmentChanges(before,st){
    if(!agendaExecutive(st))return;
    const after=governmentInvestmentSnapshot(st);
    Object.entries(after).forEach(([key,n])=>{
        const old=before[key];if(old?.status===n.status)return;
        const signed=n.status==='SIGNED'||key.startsWith('legacy:')&&n.status==='ACTIVE',done=n.status==='COMPLETED',failed=n.status==='FAILED';if(!signed&&!done&&!failed)return;
        const details=[];if(signed)details.push('Punësimi dhe tatimet fillojnë pas realizimit të projektit.');
        if(done&&n.jobs)details.push(n.jobs.toLocaleString('sq-AL')+' vende pune të regjistruara.');if(done&&n.tax)details.push('Tatime neto: '+fdiExactMoney(n.tax)+'/javë nga java pasuese.');
        if(failed){details.push(n.reason);details.push('Bashkëfinancimi i humbur: '+fdiMoney(n.cost)+'. Fondet nuk zbriten për herë të dytë.');}
        showGovernmentNotification({id:'gov-investment:'+key+':'+n.status+':'+n.turn,kind:'INVESTMENT',title:failed?'Negociatat dështuan':signed?'Marrëveshja u nënshkrua me sukses':'Investimi u realizua',message:failed?n.title+' · Investitori u tërhoq nga marrëveshja.':signed?n.title+' · Marrëveshja është regjistruar.':n.title+' · Projekti përfundoi dhe efektet ekonomike janë regjistruar.',status:failed?'failure':'success',stamp:failed?'REFUZUAR':'MIRATUAR',critical:failed,supportDelta:done||failed?n.delta:null,details});
    });
}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',function(){
    const dialog=document.getElementById('governmentNotificationDialog');if(!dialog)return;dialog.addEventListener('cancel',function(e){if(governmentNotificationCurrent?.critical)e.preventDefault();});
});
