/* Read-only projections of the existing fiscal ledger, crisis records and calendar. */
function cashReportWeeks(st){
 const keys=new Map();(st.publicFinance?.ledger||[]).filter(r=>r.account==='budgetTotalB').forEach(r=>keys.set(r.year+':'+r.turn,{year:r.year,turn:r.turn}));
 return Array.from(keys.values()).sort((a,b)=>b.turn-a.turn||b.year-a.year);
}
function cashReportGroup(r){
 const s=r.source.toLowerCase();
 if(['BORROWING','DEBT_REPAYMENT','TRANSFER'].includes(r.type))return 'Financimi dhe transferimet';
 if(/prodh|production|eksport|import|resurs/.test(s))return 'Prodhimi dhe resurset';
 if(/flot|transport|aviacion/.test(s))return 'Transporti';
 if(/pasaport|dokument|gjendj|registry/.test(s))return 'Dokumentet dhe shërbimet';
 if(/tatim|tax|dogan|konsum/.test(s))return 'Tatimet dhe doganat';
 if(/grant|ipa|fondet|ndërkomb|ihd:/.test(s))return 'Grantet dhe bashkëpunimi';
 if(/pagat|operativ|mirëmbajt/.test(s))return 'Pagat dhe mirëmbajtja';
 if(r.type==='CAPITAL_PAYMENT')return 'Investimet kapitale';
 if(r.type==='INTEREST')return 'Interesi i borxhit';
 return 'Vendimet dhe lëvizjet e tjera';
}
function cashReportData(st,turn,year){
 const summary=fiscalWeekSummary(st,turn,year),groups=new Map();
 summary.rows.forEach(r=>{const key=cashReportGroup(r),g=groups.get(key)||{title:key,income:0,expense:0,rows:[]};g.rows.push(r);if(r.amountB>=0)g.income=fiscalRound(g.income+r.amountB);else g.expense=fiscalRound(g.expense-r.amountB);groups.set(key,g);});
 return {...summary,groups:Array.from(groups.values()).sort((a,b)=>b.expense-a.expense||b.income-a.income)};
}
function cashReportDestination(title){return ({'Prodhimi dhe resurset':'tab-production','Transporti':'tab-transport','Dokumentet dhe shërbimet':'tab-services','Investimet kapitale':'tab-development','Grantet dhe bashkëpunimi':'tab-diplomacy'})[title]||'tab-government';}
function openCashDestination(tab){
 if(!['tab-production','tab-transport','tab-services','tab-development','tab-diplomacy','tab-government'].includes(tab))return false;
 toggleModal('interactiveActionModal',false);switchMainTab(tab);if(tab==='tab-government')switchSubTab('gov','fiscal',document.getElementById('governmentFiscalTab'));return true;
}
function openCashReport(turn,year){
 if(weeklyProcessing||weeklyVisualBusy||state.pendingVote||document.querySelector('dialog[open],.modal-overlay.show')){showToast('Përfundoni dritaren aktuale para raportit.');return false;}
 const weeks=cashReportWeeks(state),selected=weeks.find(w=>w.turn===Number(turn)&&w.year===Number(year))||weeks[0],e=catalogEscape,m=n=>'€'+(n*1e9).toLocaleString('sq-AL',{maximumFractionDigits:0});
 let html='<div class="cash-report"><button class="action-btn" onclick="toggleModal(\'interactiveActionModal\',false)">← Mbrapa</button><h2>Ku shkuan paratë?</h2>';
 if(!selected)html+='<p>Ende nuk ka lëvizje të regjistruara në arkë. Raporti plotësohet pas vendimit financiar ose javës së parë.</p>';
 else{
 const s=cashReportData(state,selected.turn,selected.year);
 html+='<label>Java e raportit<select id="cashReportWeek" onchange="changeCashReportWeek(this.value)">'+weeks.map(w=>'<option value="'+w.year+':'+w.turn+'" '+(w===selected?'selected':'')+'>Java '+w.turn+' / '+w.year+'</option>').join('')+'</select></label><div class="cash-report-kpis">'+[['Në fillim',s.openingCash],['Hynë në arkë',s.inflow],['Dolën nga arka',s.outflow],['Bilanci javor',s.cashChange],['Në fund',s.closingCash]].map(([label,value])=>'<div><span>'+label+'</span><strong>'+m(value)+'</strong></div>').join('')+'</div><p>Vetëm lëvizjet reale të Mjeteve të Lira. Huamarrja dhe transferimet janë financim; rezerva është llogari më vete. Vendimet brenda javës përfshihen në raport.</p>';
 if(s.cashChange<0&&s.groups[0]?.expense)html+='<p class="crisis-warning"><strong>Dalja më e madhe:</strong> '+e(s.groups[0].title)+' · '+m(s.groups[0].expense)+'. Hap kategorinë për pagesat konkrete.</p>';
 html+=s.groups.map(g=>'<details class="cash-report-group"><summary><strong>'+e(g.title)+'</strong><span>+'+m(g.income)+' / −'+m(g.expense)+'</span></summary>'+g.rows.map(r=>'<p><strong>'+e(fiscalSourceLabel(r.source))+'</strong><span class="'+(r.amountB<0?'cash-negative':'cash-positive')+'">'+(r.amountB>0?'+':'')+m(r.amountB)+'</span><small>'+e(r.type)+' · '+e(r.id||'')+'</small></p>').join('')+'<button class="action-btn" onclick="openCashDestination(\''+cashReportDestination(g.title)+'\')">Hap panelin përkatës</button></details>').join('');
 }
 html+='<button class="action-btn" onclick="toggleModal(\'interactiveActionModal\',false);switchMainTab(\'tab-government\');switchSubTab(\'gov\',\'fiscal\',document.getElementById(\'governmentFiscalTab\'))">Hap Ekonominë dhe Financat</button></div>';
 document.getElementById('interactiveActionModalContent').innerHTML=html;toggleModal('interactiveActionModal',true);return true;
}
function changeCashReportWeek(value){const [year,turn]=String(value).split(':').map(Number);toggleModal('interactiveActionModal',false);return openCashReport(turn,year);}

const CRISIS_PRIORITY={associationUltimatumPending:0,imfPending:0,northPending:0,institutionalConflictPending:0,pendingCoalitionBlackmail:0,roguePendingReport:1,veteransCrisisPending:1,generalStrikePending:1,pendingWinterEnergy:1,mediaDossierBlocked:1,SCANDAL:1};
function crisisPriority(key){return CRISIS_PRIORITY[key]??2;}
// Pending predicates remain authoritative; presentation never resolves or recreates a case.
var crisisPresentationTimer=null;
function scheduleCrisisPresentation(){
 if(crisisPresentationTimer!==null||typeof document.createElement!=='function')return;
 crisisPresentationTimer=setTimeout(function(){crisisPresentationTimer=null;const rows=pendingGovernmentDecisions(state);if(!rows.length)return;
 if(weeklyProcessing||weeklyVisualBusy||state.pendingVote||document.querySelector('dialog[open],.modal-overlay.show')||!document.getElementById('startScreen')?.classList.contains('hidden')){scheduleCrisisPresentation();return;}
 callGameRenderer(rows[0].renderer);
 },250);
}
function governmentCrisisPresentationBlocked(renderer){
 const first=pendingGovernmentDecisions(state)[0];
 const blocked=!!first&&first.renderer!==renderer||!!document.querySelector('dialog[open],.modal-overlay.show');
 if(blocked)scheduleCrisisPresentation();return blocked;
}
function weekControlDeadlines(st){
 if(!agendaExecutive(st))return [];
 const rows=[];
 function add(key,title,due,consequence){if(Number.isInteger(due))rows.push({key,title,due,consequence});}
 const emergency=activeNationalEmergency(st);if(emergency)add('emergency',NATIONAL_EMERGENCIES[emergency.kind].title,emergency.dueTurn,'Pa fondin emergjent brenda afatit, qeveria rrëzohet.');
 const strike=currentGeneralStrike(st);if(strike?.status==='ULTIMATUM')add('generalStrike', 'SBASHK / FSSHK',strike.dueTurn,'Greva mbyll shkollat dhe spitalet dhe ul mbështetjen çdo javë.');
 Object.entries(st.unions?.sectors||{}).forEach(([id,r])=>{if(r.status==='ULTIMATUM')add(id,UNION_SECTORS[id]?.name||id,r.dueTurn,'Nëse kërkesa mbetet e paplotësuar, nis greva e sektorit.');});
 (st.governance?.promises||[]).filter(p=>p.status==='OPEN').forEach(p=>add('press:'+p.eventId,'Premtimi i konferencës',p.dueTurn,'Mospërmirësimi i sektorit ul mbështetjen dhe kredibilitetin.'));
 (st.pmInboxRequests||[]).filter(r=>r.agenda6&&agendaActive(r)&&politicalAgendaAuthorized(r)).forEach(r=>add('request:'+r.id,r.title,r.dueTurn,r.consequenceText||'Vonesa regjistrohet në agjendë.'));
 return rows.sort((a,b)=>a.due-b.due||a.key.localeCompare(b.key));
}
function renderWeekControl(){
 const host=document.getElementById('weeklyCommandSummary');if(!host)return;
 const summary=state.weekCalendar?.lastSummary,rows=pendingGovernmentDecisions(state),deadlines=weekControlDeadlines(state),e=catalogEscape;
 host.innerHTML='<h3>Java në një vështrim</h3><div class="candidate-actions"><button class="action-btn" onclick="openCashReport()">Ku shkuan paratë?</button><button class="action-btn" '+(!summary?'disabled':'')+' onclick="openLastWeekSummary()">Përmbledhja e fundit</button></div><p>'+rows.length+' vendime që presin · '+deadlines.length+' afate aktive. Raportet e zakonshme mbeten te Njoftimet.</p>'+deadlines.slice(0,5).map(r=>'<details><summary><strong>'+e(r.title)+'</strong> · '+(r.due<state.turnCount?'Afati ka kaluar':r.due===state.turnCount?'Afati këtë javë':'Edhe '+(r.due-state.turnCount)+' javë')+'</summary><p>'+e(r.consequence)+'</p></details>').join('')+(deadlines.length>5?'<button class="action-btn" onclick="switchMainTab(\'tab-dashboard\');switchSubTab(\'dash\',\'inbox\',null)">Shiko detyrat e tjera</button>':'');
}
const weekControlDecisionRender=renderGovernmentDecisionStatus;
renderGovernmentDecisionStatus=function(){weekControlDecisionRender();renderWeekControl();};
