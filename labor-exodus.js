/* Extends the existing population model; money is expressed in billions. */
function migrateLaborExodus(st){if(st.laborExodus===undefined)st.laborExodus={version:1,lastTurn:st.turnCount,lastFiscalTurn:st.turnCount,lowWeeks:0,observations:[],crisis:null,payments:[]};}
function laborExodusPending(st){return agendaExecutive(st)&&!!st.laborExodus?.crisis&&st.laborExodus.crisis.choice===null;}
function laborExodusStopped(st){return ['FOREIGN','SUBSIDY'].includes(st.laborExodus?.crisis?.choice);}
function laborExodusLoss(st){var c=st.laborExodus?.crisis;return c&&(c.choice===null||c.choice==='PATRIOTIC')?.006:0;}
function laborTaxAnnual(base,st){return Math.max(0,base-laborExodusLoss(st)*FISCAL_WEEKS);}
function laborSubsidyWeekly(st){return st.laborExodus?.crisis?.choice==='SUBSIDY'?.01:0;}
function processLaborExodusWeek(turn){
    migrateLaborExodus(state);var d=state.laborExodus;if(turn<=d.lastTurn)return;d.lastTurn=turn;
    var c=d.crisis;
    if(c){if(c.choice==='PATRIOTIC'&&c.boostExpiredTurn===null&&turn>=c.boostUntil){crisisApproval(-c.boostDelta);c.boostExpiredTurn=turn;}return;}
    if(!agendaExecutive(state)){d.lowWeeks=0;return;}
    d.observations.push({turn,approval:state.approval});d.lowWeeks=state.approval<40?d.lowWeeks+1:0;
    if(d.lowWeeks<=4)return;
    d.crisis={openedTurn:turn,choice:null,decisionTurn:null,boostDelta:0,boostUntil:null,boostExpiredTurn:null,imfId:null,imfBlocked:false};
    state.historyLog.unshift('EKSODI I FUQISË PUNËTORE: Mijëra të rinj po lëshojnë vendin! Bizneset po mbyllen. Të hyrat tatimore humbin €6M/javë.');
    addMediaNews('Ekonomia','Mijëra të rinj po lëshojnë vendin! Bizneset po mbyllen.','CRITICAL','Pesë javë me kënaqësi nën 40%. Kërkohet vendim qeveritar.');
}
function laborExodusIMF(c){
    migrateIMFCrisis(state);var p=activeIMFPackage(state)||state.imfCrisis.packages.find(p=>p.status==='PENDING');
    if(associationTotalSanctions(state)||northSanctioned(state)||internationalIsolation(state)||veteransIMFBlocked(state)){c.imfBlocked=true;state.historyLog.unshift('FMN kundërshton subvencionet e rinisë; mbështetja financiare mbetet e bllokuar nga sanksionet/kushtet ekzistuese.');return;}
    if(!p){p={id:'imf:'+state.imfCrisis.packages.length,status:'PENDING',createdTurn:state.turnCount,acceptedTurn:null,untilTurn:null,principalB:0,arrearsPaidB:0,ceilings:null,loanReceipt:null,settlements:[],repaidTurn:null,repaymentReceipt:null};state.imfCrisis.packages.push(p);}
    c.imfId=p.id;p.laborExodusTurn=state.turnCount;state.historyLog.unshift('FMN kërkon disiplinë fiskale pas subvencioneve €10M/javë: pakoja ekzistuese sjell hua dhe austeritet 20-javor.');
}
function resolveLaborExodus(choice){if(!['FOREIGN','SUBSIDY','PATRIOTIC'].includes(choice))return false;return governmentCrisisCommit(function(){
    var c=state.laborExodus?.crisis;if(!laborExodusPending(state))throw Error('Nuk ka krizë eksodi në pritje.');c.choice=choice;c.decisionTurn=state.turnCount;
    if(choice==='FOREIGN'){crisisApproval(-15);recordCrisisPressEvent('FINANCIAL','labor-exodus','Opozita akuzon qeverinë për ndryshim demografik pas hapjes së tregut të punës','sec_econ');state.historyLog.unshift('Tregu hapet për punëtorët e huaj: ndalet eksodi dhe hiqet humbja €6M/javë; mbështetja −15.');}
    if(choice==='SUBSIDY'){crisisApproval(20);laborExodusIMF(c);}
    if(choice==='PATRIOTIC'){c.boostDelta=crisisApproval(5);c.boostUntil=state.turnCount+4;state.historyLog.unshift('Fushata patriotike: bonus mbështetjeje për 4 javë, pa shpenzim. Humbja €6M/javë mbetet e përhershme.');}
});}
function processLaborSubsidyFiscal(turn){
    migrateLaborExodus(state);var d=state.laborExodus;if(turn<=d.lastFiscalTurn)return {paidB:0,unpaidB:0};d.lastFiscalTurn=turn;
    var c=d.crisis;if(c?.choice!=='SUBSIDY'||turn<=c.decisionTurn)return {paidB:0,unpaidB:0};
    var b=state.publicFinance.budgets[state.year],authorized=state.publicFinance.openingYear===state.year||b?.status==='APPROVED',room=b?.status==='APPROVED'?Math.max(0,b.plannedB-state.realizedExpenses):Infinity,paidB=authorized?fiscalRound(Math.min(.01,Math.max(0,state.budgetTotalB),room)):0,receipt=null;
    if(paidB){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-paidB),'Subvencionet e pagave të rinisë · eksodi','EXPENSE');receipt=state.publicFinance.ledger.at(-1).id;}
    d.payments.push({turn,requiredB:.01,paidB,receipt});return {paidB,unpaidB:fiscalRound(.01-paidB)};
}
function validateLaborExodus(st){
    var d=st.laborExodus;if(d===undefined)return;function bad(){throw Error('Eksodi ose pagesat e rinisë janë të pavlefshme.');}var turn=n=>Number.isInteger(n)&&n>=0&&n<=st.turnCount;
    if(d.version!==1||!turn(d.lastTurn)||!turn(d.lastFiscalTurn)||!Number.isInteger(d.lowWeeks)||d.lowWeeks<0||!Array.isArray(d.observations)||!Array.isArray(d.payments))bad();
    var last=-1,streak=0;d.observations.forEach(o=>{if(!turn(o.turn)||o.turn<=last||o.turn>d.lastTurn||!Number.isFinite(o.approval)||o.approval<0||o.approval>100)bad();streak=o.approval<40?streak+1:0;last=o.turn;});
    var c=d.crisis;if(c){if(!turn(c.openedTurn)||c.openedTurn!==last||streak<5||![null,'FOREIGN','SUBSIDY','PATRIOTIC'].includes(c.choice)||(c.choice===null?c.decisionTurn!==null:!turn(c.decisionTurn)||c.decisionTurn<c.openedTurn))bad();
        if(c.choice==='PATRIOTIC'){if(!Number.isFinite(c.boostDelta)||c.boostDelta<0||c.boostDelta>5||c.boostUntil!==c.decisionTurn+4||c.boostExpiredTurn!==null&&(!turn(c.boostExpiredTurn)||c.boostExpiredTurn<c.boostUntil))bad();}else if(c.boostDelta!==0||c.boostUntil!==null||c.boostExpiredTurn!==null)bad();
        if(typeof c.imfBlocked!=='boolean'||c.choice!=='SUBSIDY'&&(c.imfId!==null||c.imfBlocked)||c.imfId!==null&&!st.imfCrisis.packages.some(p=>p.id===c.imfId))bad();
    }else if(d.payments.length)bad();
    var seen=new Set();d.payments.forEach(p=>{var r=st.publicFinance.ledger.find(r=>r.id===p.receipt);if(!c||c.choice!=='SUBSIDY'||!turn(p.turn)||p.turn<=c.decisionTurn||p.turn>d.lastFiscalTurn||seen.has(p.turn)||p.requiredB!==.01||!Number.isFinite(p.paidB)||p.paidB<0||p.paidB>.01)bad();seen.add(p.turn);if(p.paidB? !r||r.type!=='EXPENSE'||r.turn!==p.turn||r.source!=='Subvencionet e pagave të rinisë · eksodi'||Math.abs(r.amountB+p.paidB)>1e-9:p.receipt!==null)bad();});
}
var laborExodusRetry=null;
function renderLaborExodus(){
    var c=state.laborExodus?.crisis,host=document.getElementById('laborExodusPanel'),dialog=document.getElementById('laborExodusDialog');
    if(host)host.innerHTML='<h3>Eksodi i Fuqisë Punëtore</h3><p>Javë radhazi me kënaqësi nën 40%: <strong>'+(state.laborExodus?.lowWeeks||0)+' / 5</strong>.</p>'+(c?'<p>'+catalogEscape(({FOREIGN:'Tregu u hap për punëtorët e huaj; humbja €6M/javë u hoq.',SUBSIDY:'Subvencione aktive €10M/javë; eksodi u ndal.',PATRIOTIC:'Fushatë patriotike; humbja €6M/javë mbetet.'})[c.choice]||'Bizneset po mbyllen: humbje €6M/javë.')+'</p>':'');
    if(!dialog||typeof dialog.showModal!=='function')return;if(!laborExodusPending(state)){if(dialog.open)dialog.close();return;}
    if(state.pendingVote||weeklyProcessing||weeklyVisualBusy||!document.getElementById('startScreen')?.classList.contains('hidden')||document.querySelector('dialog[open]:not(#laborExodusDialog)')){if(laborExodusRetry===null)laborExodusRetry=setTimeout(()=>{laborExodusRetry=null;renderLaborExodus();},250);return;}
    document.getElementById('laborExodusContent').innerHTML='<h2 id="laborExodusTitle">Mijëra të rinj po lëshojnë vendin!</h2><p>Bizneset po mbyllen. Pas pesë javëve nën 40% kënaqësi, të hyrat humbin €6M çdo javë.</p><button class="action-btn" onclick="resolveLaborExodus(\'FOREIGN\')">Hap Tregun për Punëtorë të Huaj</button><p>Hiqet humbja €6M/javë; mbështetja −15 dhe akuza nga opozita.</p><button class="action-btn" onclick="resolveLaborExodus(\'SUBSIDY\')">Subvenciono Pagat e Rinisë</button><p>Eksodi ndalet, +20 popullaritet. Kosto e re €10M/javë; FMN kërkon austeritet.</p><button class="action-btn" onclick="resolveLaborExodus(\'PATRIOTIC\')">Fushata Patriotike · Mos e lësho vendin</button><p>Pa shpenzime; +5 mbështetje për 4 javë. Humbja €6M/javë mbetet përgjithmonë.</p>';if(!dialog.open)dialog.showModal();
}
document.addEventListener('DOMContentLoaded',()=>document.getElementById('laborExodusDialog')?.addEventListener('cancel',e=>{if(laborExodusPending(state))e.preventDefault();}));
