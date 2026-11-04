/* Phase 11. All amounts are billions of simulated euros. The existing debt
   conversion uses a fixed simulated GDP of 10B; no claim about real Kosovo data. */
const FISCAL_GDP_B=10,FISCAL_WEEKS=48;
// Scenario safeguards, not legal thresholds or calibrated Kosovo statistics.
const FISCAL_BORROWING_RULES={annualRevenueShare:.25,debtRevenueMultiple:2,interestRevenueShare:.2};
function fiscalOutstandingForeign(st){return (st.internationalDiplomacy?.agreements||[]).filter(function(a){return ['DISBURSED','OVERDUE'].includes(a.financing?.status);});}
function fiscalAnnualInterestB(st){
    var loans=fiscalOutstandingForeign(st),foreign=loans.reduce(function(s,a){return s+a.financing.principalB;},0);
    var domestic=Math.max(0,st.publicDebtPct/100*FISCAL_GDP_B-foreign-fiscalTrackedPrincipal(st));
    return fiscalRound(domestic*st.debtInterestRate/100+fiscalTrackedAnnualInterest(st)+loans.reduce(function(s,a){var f=a.financing;return s+f.principalB*(f.annualRate===undefined?st.debtInterestRate:f.annualRate)/100;},0));
}
function fiscalBorrowingCapacity(st){
    var r=FISCAL_BORROWING_RULES,revenue=Math.max(0,st.taxRevenueB),debt=st.publicDebtPct/100*FISCAL_GDP_B;
    var issued=(st.publicFinance?.ledger||[]).filter(function(x){return x.year===st.year&&x.type==='BORROWING';}).reduce(function(s,x){return s+Math.max(0,x.amountB);},0);
    var annual=Math.max(0,revenue*r.annualRevenueShare-issued),stock=Math.max(0,revenue*r.debtRevenueMultiple-debt);
    var service=st.debtInterestRate>0?Math.max(0,(revenue*r.interestRevenueShare-fiscalAnnualInterestB(st))/(st.debtInterestRate/100)):Infinity;
    return {availableB:fiscalRound(Math.min(annual,stock,service)),issuedB:fiscalRound(issued),annualLimitB:fiscalRound(revenue*r.annualRevenueShare)};
}
function fiscalBorrowingAllowed(st,amount){return Number.isFinite(amount)&&amount>0&&amount<=fiscalBorrowingCapacity(st).availableB+1e-9;}
function fiscalReconciliation(st){
    var f=st.publicFinance,rows=f.ledger.filter(function(r){return r.year===st.year;}),baseline=f.openingYear===st.year?f.legacyBaseline:{revenues:0,expenses:0};
    var revenue=rows.filter(function(r){return r.type==='REVENUE';}).reduce(function(s,r){return s+r.amountB;},baseline.revenues);
    var expenses=rows.filter(function(r){return ['EXPENSE','CAPITAL_PAYMENT','RESERVE_EXPENSE','INTEREST'].includes(r.type);}).reduce(function(s,r){return s+Math.abs(r.amountB);},baseline.expenses),issues=[];
    if(Math.abs(revenue-st.realizedRevenues)>1e-8)issues.push('Të hyrat e realizuara nuk përputhen me regjistrin.');
    if(Math.abs(expenses-st.realizedExpenses)>1e-8)issues.push('Pagesat e realizuara nuk përputhen me regjistrin.');
    ['budgetTotalB','fiscalReserve'].forEach(function(account){var last;f.ledger.filter(function(r){return r.account===account;}).forEach(function(r){if(last&&Math.abs(last.balanceAfterB+r.amountB-r.balanceAfterB)>1e-8)issues.push('Mospërputhje në rrjedhën e llogarisë '+account+'.');last=r;});if(last&&Math.abs(last.balanceAfterB-st[account])>1e-8)issues.push('Gjendja e llogarisë '+account+' nuk përputhet me regjistrin.');});
    if(fiscalOutstandingForeign(st).reduce(function(s,a){return s+a.financing.principalB;},0)>st.publicDebtPct/100*FISCAL_GDP_B+1e-8)issues.push('Kreditë e jashtme tejkalojnë borxhin e përgjithshëm të regjistruar.');
    return {issues:Array.from(new Set(issues)),revenueB:fiscalRound(revenue),expensesB:fiscalRound(expenses),historicalBaseline:!!(baseline.revenues||baseline.expenses)};
}
function migratePublicFinance(st){
    if(st.publicFinance)return;
    st.publicFinance={version:1,year:st.year,openingYear:st.year,lastEconomicIndex:fiscalEconomicIndex(st),lastWeek:st.turnCount,counter:0,ledger:[],decisions:[],budgets:{},closedYears:[],pending:null,arrearsB:0,auditSavings:{},legacyBaseline:{revenues:st.realizedRevenues||0,expenses:st.realizedExpenses||0}};
    st.publicFinance.budgets[st.year]={year:st.year,status:'LEGACY',plannedB:st.plannedExpenses,allocations:st.ministries.map(function(m){return {id:m.id,budgetM:m.budget};}),capitalB:0,lawId:null};
    (st.developmentProjects || []).forEach(function(p){if(p.status==='IN_PROGRESS' && p.fundingCommitted===undefined){p.fundingCommitted=true;p.financingNote='Financimi fillestar i trashëguar; nuk zbritet sërish çdo javë.';}});
    // Reuse the pending annual-budget catalogue entry. Past ordinary-law payments
    // are historical records and are never refunded or relabelled as a new approval.
    (st.laws || []).filter(function(l){return l.catalogId==='cat_budget_2027' && ['DRAFT','SUBMITTED','UNDER_REVIEW','SCHEDULED'].includes(l.status) && !l.applied;}).forEach(function(l){
        if(st.publicFinance.budgets[2027]?.lawId)return;
        var allocations=st.ministries.map(function(m){return {id:m.id,budgetM:m.budget};}),capitalB=l.costB||0,interestB=fiscalAnnualInterestB(st),veteransB=veteransAnnualCost(st),northB=northAnnualCost(st),generalStrikeB=generalStrikeAnnualCost(st),plannedB=fiscalRound(allocations.reduce(function(sum,a){return sum+a.budgetM/1000;},0)+capitalB+interestB+veteransB+northB+generalStrikeB);
        l.annualBudgetYear=2027;l.annualBudgetPlan={allocations:allocations,capitalB:capitalB,interestB:interestB,veteransB:veteransB,northB:northB,generalStrikeB:generalStrikeB,plannedB:plannedB,expectedRevenueB:st.taxRevenueB};l.costB=0;l.approvalEffect=0;l.duration=1;
        l.catalog13=true;l.govRequired=true;l.govStage=l.status==='DRAFT'?'DRAFT':'APPROVED';l.amendments=l.amendments||[];l.version=l.version||1;l.debated=l.status==='SCHEDULED';
        if(l.status==='UNDER_REVIEW' && !Number.isInteger(l.reviewTurn))l.reviewTurn=st.turnCount;
        st.publicFinance.budgets[2027]={year:2027,status:l.status,allocations:allocations,capitalB:capitalB,interestB:interestB,veteransB:veteransB,northB:northB,generalStrikeB:generalStrikeB,plannedB:plannedB,lawId:l.id};
    });
}
function validatePublicFinance(st){
    validateEconomicPilot(st);
    if(typeof validateCurrentIndicators==='function')validateCurrentIndicators(st,false);
    var f=st.publicFinance;if(f===undefined)return;
    validateFinanceExtension(st);
    if(!f || f.version!==1 || !Number.isInteger(f.year) || !Number.isInteger(f.lastWeek) || f.lastWeek<0 || f.lastWeek>st.turnCount || !Number.isInteger(f.counter) || !Array.isArray(f.ledger) || !Array.isArray(f.decisions) || !Array.isArray(f.closedYears) || !f.budgets || typeof f.budgets!=='object' || !Number.isFinite(f.arrearsB) || f.arrearsB<0)throw Error('Regjistri financiar është i pavlefshëm.');
    if(!Number.isFinite(st.budgetTotalB) || !Number.isFinite(st.fiscalReserve) || !Number.isFinite(st.publicDebtPct) || st.fiscalReserve<0 || st.publicDebtPct<0)throw Error('Gjendja financiare është e pavlefshme.');
    if(!Number.isFinite(f.lastEconomicIndex) || f.year!==st.year || !f.auditSavings || !f.legacyBaseline || f.pending && !fiscalOrderValid(f.pending))throw Error('Parametrat fiskalë të ruajtur janë të pavlefshëm.');
    var transactionIds=new Set();
    f.ledger.forEach(function(r){
        if(!r || !Number.isInteger(r.turn) || !Number.isFinite(r.amountB) || typeof r.type!=='string' || typeof r.source!=='string')throw Error('Transaksioni financiar është i pavlefshëm.');
        if(r.id!==undefined){if(typeof r.id!=='string'||transactionIds.has(r.id))throw Error('Identifikues financiar i përsëritur ose i pavlefshëm.');transactionIds.add(r.id);var seq=/^fiscal:(\d+)$/.exec(r.id);if(seq&&Number(seq[1])>f.counter)throw Error('Numëruesi financiar është prapa regjistrit.');}
        if(r.account!==undefined&&(!['budgetTotalB','fiscalReserve'].includes(r.account)||!Number.isFinite(r.balanceAfterB)||r.balanceAfterB<0))throw Error('Llogaria e transaksionit financiar është e pavlefshme.');
    });
    if(f.counter<0 || !Number.isFinite(st.debtInterestRate)||st.debtInterestRate<0||st.debtInterestRate>100)throw Error('Norma ose numëruesi financiar është i pavlefshëm.');
    fiscalOutstandingForeign(st).forEach(function(a){if(!Number.isFinite(a.financing.principalB)||a.financing.principalB<0||a.financing.annualRate!==undefined&&(!Number.isFinite(a.financing.annualRate)||a.financing.annualRate<0||a.financing.annualRate>100))throw Error('Kushtet financiare të kredisë janë të pavlefshme.');});
    var ids=new Set();f.decisions.forEach(function(d){if(!fiscalOrderValid(d) || ids.has(d.id) || !['ACTIVE','COMPLETED','SUSPENDED'].includes(d.status) || !Number.isInteger(d.startTurn) || !Number.isInteger(d.elapsed) || d.elapsed<0 || d.elapsed>d.weeks)throw Error('Vendimi fiskal është i pavlefshëm.');ids.add(d.id);});
    Object.values(f.budgets).forEach(function(b){if(!b || !Number.isInteger(b.year) || !['LEGACY','MISSING','DRAFT','SUBMITTED','UNDER_REVIEW','SCHEDULED','APPROVED','REJECTED','WITHDRAWN'].includes(b.status) || !Number.isFinite(b.plannedB) || b.plannedB<0 || !Number.isFinite(b.capitalB) || b.capitalB<0 || !Array.isArray(b.allocations) || b.allocations.some(function(a){return !a || typeof a.id!=='string' || !Number.isFinite(a.budgetM) || a.budgetM<0;}))throw Error('Projektbuxheti i ruajtur është i pavlefshëm.');});
    Object.values(f.budgets).forEach(function(b){const plan=st.laws.find(function(l){return l.id===b.lawId;})?.annualBudgetPlan;[b,plan].filter(Boolean).forEach(function(p){if(['expansionB','expansionSavingsB'].some(k=>p[k]!==undefined&&(!Number.isFinite(p[k])||p[k]<0)))throw Error('Invalid sector allocation');if(p.rtkSavingsB!==undefined&&(!Number.isFinite(p.rtkSavingsB)||p.rtkSavingsB<0||p.rtkSavingsB>.144))throw Error('Kursimi RTK eshte i pavlefshem.');if(p.akpB!==undefined&&(!Number.isFinite(p.akpB)||p.akpB<0))throw Error('Plani AKP eshte i pavlefshem.');if(p.highwayB!==undefined&&(!Number.isFinite(p.highwayB)||p.highwayB<0))throw Error('Autostrada: plani i pavlefshem.');if(p.laborB!==undefined&&(!Number.isFinite(p.laborB)||p.laborB<0))throw Error('Ndarja e subvencioneve te rinise eshte e pavlefshme.');if(p.generalStrikeB!==undefined&&(!Number.isFinite(p.generalStrikeB)||p.generalStrikeB<0))throw Error('Ndarja e pagave sindikale eshte e pavlefshme.');if(p.northB!==undefined&&(!Number.isFinite(p.northB)||p.northB<0))throw Error('Ndarja e Veriut eshte e pavlefshme.');if(p.veteransB!==undefined&&(!Number.isFinite(p.veteransB)||p.veteransB<0))throw Error('Ndarja e veteraneve eshte e pavlefshme.');if(p.sectorQualityB!==undefined&&(!Number.isFinite(p.sectorQualityB)||p.sectorQualityB<0))throw Error('Ndarja për cilësinë sektoriale është e pavlefshme.');});});
}
function fiscalOrderValid(p){
    if(!p || typeof p.id!=='string' || !p.data || !Number.isFinite(p.costB) || p.costB<0 || !Number.isInteger(p.turn) || !Number.isInteger(p.year))return false;
    var terms={DIGITAL_ATK:[.01,4],LOWER_VAT_FOOD:[.002,8],AUDIT:[.002,4],TAX:[0,4],BORROW:[0,0],REPAY:[0,0],RESERVE:[.05,0],ARREARS:[p.costB,0]},term=terms[p.kind];
    if(!term || p.costB!==term[0] || p.weeks!==term[1] || !Number.isFinite(p.annualRevenueDelta) || !Number.isFinite(p.inflationDelta) || !Number.isFinite(p.savingB))return false;
    if(p.kind==='BORROW' && (!(p.data.temporary?[.01,.02,.05]:[.1,.2,.3,.5]).includes(p.data.amountB) || !['INFRASTRUCTURE','DEFICIT_COVER','EMERGENCY','HEALTH_EDU'].includes(p.data.purpose) || !fiscalBorrowTermsValid(p.data)))return false;
    if(p.kind==='REPAY' && (!Number.isFinite(p.data.amountB) || p.data.amountB<=0 || p.data.amountB>.150000001))return false;
    if(p.kind==='TAX' && (![15,18,20].includes(p.data.vat) || ![8,10,12].includes(p.data.incomeTax) || ![12,15,18].includes(p.data.corporateTax) || ![8,10,12].includes(p.data.customs)))return false;
    return true;
}
function fiscalRound(n){return +n.toFixed(9);}
function fiscalEconomicIndex(st){return (st.gdpGrowth-3.9)*.035+(10.8-st.unemployment)*.015;}
function fiscalExpectedRevenues(){
    var extraFDI=typeof foreignInvestmentAnnualTax==='function'?foreignInvestmentAnnualTax(state):0;
    if(typeof regionalCustomsAnnual==='function')extraFDI+=regionalCustomsAnnual(state,state.turnCount+1);
    var councilAnnual=councilMember(state)&&!sectorExpansionCoal(state)&&!internationalIsolation(state)&&!associationTotalSanctions(state)?.003*FISCAL_WEEKS:0;
    var dividends=(typeof stateEnterpriseAnnualDividends==='function'?stateEnterpriseAnnualDividends(state):0)+sectorExpansionWeeklyRevenue(state)*FISCAL_WEEKS,taxFactor=typeof fiscalCollectionFactor==='function'?fiscalCollectionFactor(state):populationFactor(state);
    if(economicPilotActive(state)){var p=state.economicPilot;var forecastBase=Math.max(0,economicTaxCalculation(state,state.taxPolicy,economicActivity(p),p.wageIndex,100-state.unemployment).total+state.publicFinance.decisions.filter(function(d){return d.status==='ACTIVE' && (d.kind!=='TAX' || !d.pilotStartRates);}).reduce(function(s,d){return s+d.annualRevenueDelta*(1-d.elapsed/d.weeks);},0));return fiscalRound(laborTaxAnnual((Math.max(0,forecastBase-(typeof securityCustomsLoss==='function'?securityCustomsLoss(state,forecastBase,state.taxPolicy):0))+extraFDI+diasporaVATBonus(state))*taxFactor,state)+dividends+councilAnnual);}
    var f=state.publicFinance,pending=f.decisions.filter(function(d){return d.status==='ACTIVE';}).reduce(function(sum,d){return sum+(d.annualRevenueDelta||0)*(1-d.elapsed/d.weeks);},0);
    var forecastBase=clamp(state.taxRevenueB+fiscalEconomicIndex(state)-f.lastEconomicIndex+pending,0,10);return fiscalRound(taxCollectableAnnual(forecastBase,state)+(extraFDI*taxFactor)+dividends+councilAnnual);
}
function fiscalSourceLabel(source){
    var labels={catalogFund:'Financim paraprak i projektit ose ligjit',municipalProjectAction:'Financim i projektit komunal',createDevelopmentProject:'Financim i projektit zhvillimor',processDevelopmentWeek:'Pagesa e projektit zhvillimor',launchStateSectorProject:'Financim i reformës sektoriale',resolveWeeklyDossier:'Vendim për dosjen javore',resolvePMRequest:'Vendim për kërkesën institucionale',resolveCabinetDecision:'Vendim i kabinetit',resolveMinisterMeeting:'Financim i kërkesës ministrore',fulfillPromiseNow:'Pagesa për zotimin qeveritar',evaluateCoalitionRound3:'Harmonizim i programit qeveritar',interactWithMP:'Grant rajonal',applyLawEffects:'Pagesë për zbatimin e ligjit',resolveBrusselsRound:'Të hyra nga bashkëpunimi ndërkombëtar',submitInternationalProposal:'Kosto e raundit ndërkombëtar',completeLegacyInternationalMilestone:'Pagesë për detyrimin ndërkombëtar',advanceAgreementTask:'Pagesë për detyrën e marrëveshjes',requestAgreementCorrectivePlan:'Kosto e planit korrigjues',settleInternationalLoan:'Shlyerje e kredisë ndërkombëtare',updateInternationalAgreements:'Lëvrim i kredisë ndërkombëtare','dynamic-event':'Vendim për zhvillimin politik'};
    return labels[source] || (/^[a-zA-Z_]+$/.test(source)?'Veprim financiar i regjistruar':source);
}
function fiscalEntry(st,type,amount,source){
    if(!amount)return;migratePublicFinance(st);
    var entry={id:'fiscal:'+(++st.publicFinance.counter),year:st.year,turn:st.turnCount,type:type,amountB:fiscalRound(amount),source:source};st.publicFinance.ledger.push(entry);
    if(type==='REVENUE')st.realizedRevenues=fiscalRound((st.realizedRevenues||0)+amount);
    if(['EXPENSE','CAPITAL_PAYMENT','RESERVE_EXPENSE','INTEREST'].includes(type))st.realizedExpenses=fiscalRound((st.realizedExpenses||0)+Math.abs(amount));
    var row=(st.fiscalHistory||[]).find(function(r){return r.week===st.turnCount && r.year===st.year;});
    if(row){
        if(type==='REVENUE')row.revenues=fiscalRound(row.revenues+amount);
        if(['EXPENSE','CAPITAL_PAYMENT','RESERVE_EXPENSE','INTEREST'].includes(type))row.expenses=fiscalRound(row.expenses+Math.abs(amount));
        row.balance=fiscalRound(row.revenues-row.expenses);st.lastWeekRevenues=row.revenues;st.lastWeekExpenses=row.expenses;
        var report=(st.weeklyReports||[]).find(function(r){return r.week===st.turnCount && r.year===st.year;});if(report)Object.assign(report,{revenues:row.revenues,expenses:row.expenses,balance:row.balance});
    }
    return entry;
}
function fiscalSetBalance(st,field,value,source,type){
    if(!['budgetTotalB','fiscalReserve'].includes(field) || !Number.isFinite(value) || value<0 || !Number.isFinite(st[field]))throw Error('Llogaria ose shuma financiare nuk është e vlefshme.');
    if(type==='CAPITAL_PAYMENT'&&value<st[field]&&municipalCapitalBlocked(st))throw Error('Gjykata ka bllokuar buxhetin kapital.');
    var before=st[field];st[field]=value;
    if(!Number.isFinite(before) || before===value)return;
    var delta=value-before;
    if(!type){
        if(/settleInternationalLoan/.test(source))type='DEBT_REPAYMENT';
        else if(/updateInternationalAgreements/.test(source)&&delta>0)type='BORROWING';
        else if(/catalogFund|municipalProjectAction|createDevelopmentProject|launchStateSectorProject/.test(source))type='CAPITAL_PAYMENT';
        else if(field==='fiscalReserve')type=delta<0?'RESERVE_EXPENSE':'TRANSFER';
        else type=delta<0?'EXPENSE':'REVENUE';
    }
    if(type==='CAPITAL_PAYMENT'&&delta<0&&municipalCapitalBlocked(st)){st[field]=before;throw Error('Gjykata ka bllokuar buxhetin kapital.');}
    var entry=fiscalEntry(st,type,delta,source);if(entry){entry.account=field;entry.balanceAfterB=value;}
}
function fiscalCommit(change){
    if(!assertGovernmentAuthority('Vendimi financiar') || state.pendingVote || weeklyProcessing)return false;
    var before=JSON.stringify(state);try{change();reconcileAssociationUltimatum(state);if(typeof validateIMFCrisis==='function')validateIMFCrisis(state);validatePublicFinance(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}catch(e){state=JSON.parse(before);showToast(e.message);return false;}
    refreshAllUI();return true;
}
function fiscalBudgetForYear(year){return state.publicFinance.budgets[year] || null;}
function fiscalCatalogIsCapital(x){return !!x.municipal14 || (state.governmentCatalog?.projects || []).some(function(p){return p===x;});}
function fiscalSpendingCheck(costB,capital){
    if(capital&&municipalCapitalBlocked(state))return {allowed:false,message:'Gjykata: financimi kapital i shtetit eshte bllokuar per 4 jave.'};
    if(!Number.isFinite(costB) || costB<0)return {allowed:false,message:'Kostoja financiare është e pavlefshme.'};
    var f=state.publicFinance,b=fiscalBudgetForYear(state.year);if(!costB)return {allowed:true};
    if(f.openingYear!==state.year && b?.status!=='APPROVED')return {allowed:false,message:'Nuk ka buxhet të miratuar për financim të ri këtë vit. Përfundoni procedurën në Kuvend.'};
    if(b?.status==='APPROVED' && costB>b.plannedB-state.realizedExpenses+1e-9)return {allowed:false,message:'Pagesa kalon fondet e mbetura të planit vjetor të votuar.'};
    if(capital && b?.status==='APPROVED'){
        var paid=f.ledger.filter(function(r){return r.year===state.year&&r.type==='CAPITAL_PAYMENT';}).reduce(function(s,r){return s+Math.abs(r.amountB);},0);
        if(costB>b.capitalB-paid+1e-9)return {allowed:false,message:'Ndarja për investime kapitale e buxhetit të votuar nuk e mbulon këtë projekt.'};
    }
    return {allowed:true};
}
function fiscalOperatingPlan(){
    var b=fiscalBudgetForYear(state.year);if(state.publicFinance.openingYear!==state.year && (!b || b.status!=='APPROVED'))return 0;
    return Math.max(0,calculatePlannedMinistriesBudget()-(state.publicFinance.auditSavings[state.year]||0));
}
function fiscalSyncBudgetStatuses(){
    if(!state?.publicFinance)return;
    Object.values(state.publicFinance.budgets).forEach(function(b){var l=state.laws.find(function(l){return l.id===b.lawId;});if(l && !['APPROVED','REJECTED'].includes(b.status) && l.status!=='PASSED'){b.status=l.status==='FAILED'?'REJECTED':l.status;if(l.govStage==='REJECTED')b.refusalStage='GOVERNMENT';}});
}
function fiscalAnnualBudgetDetails(law){
    var p=law.annualBudgetPlan,e=catalogEscape,money=function(n){return '€'+(n*1000).toFixed(2)+'M';};
    var qualityNote=p.sectorQualityB?'<p>Cilësia sektoriale: '+money(p.sectorQualityB)+' në vit, shtesë ndaj planeve të ministrive. Granti i partnerit paguhet drejtpërdrejt për shërbimin.</p>':'';
    qualityNote+='<p>Humbjet nga kontrabanda ne Veri: '+money(p.northB||0)+' / vit (simulim).</p>';
    qualityNote+='<p>Angazhimi sindikal dhe Ligji i Pagave: '+money(p.generalStrikeB||0)+' / vit.</p>';
    qualityNote+='<p>Administrimi i AKP: '+money(p.akpB||0)+' / vit.</p>';
    qualityNote+='<p>Kontrata e Autostrades: '+money(p.highwayB||0)+' / vit.</p>';
    qualityNote+='<p>Listat e Veteranëve: '+money(p.veteransB||0)+' / vit (shpenzim i simuluar).</p>';
    return '<p>Viti financiar: '+law.annualBudgetYear+' · Plani vjetor: '+money(p.plannedB)+' · Të hyra të parashikuara: '+money(p.expectedRevenueB)+'</p><p>Investime kapitale: '+money(p.capitalB)+' · Interes i parashikuar: '+money(p.interestB||0)+'. Miratimi nuk krijon arkëtim të menjëhershëm.</p>'+qualityNote+'<details><summary>Ndarjet e projektbuxhetit</summary>'+p.allocations.map(function(a){var m=state.ministries.find(function(m){return m.id===a.id;});return '<p>'+e(m?.name || a.id)+' · '+money(a.budgetM/1000)+'</p>';}).join('')+'</details>';
}
function fiscalDomesticDebt(){
    var foreign=(state.internationalDiplomacy?.agreements || []).filter(function(a){return ['DISBURSED','OVERDUE'].includes(a.financing.status);}).reduce(function(sum,a){return sum+a.financing.principalB;},0);
    return Math.max(0,state.publicDebtPct/100*FISCAL_GDP_B-foreign-(typeof imfOutstanding==='function'?imfOutstanding(state):0));
}
function fiscalYearTransition(){
    var f=state.publicFinance;if(f.year===state.year)return;
    f.closedYears.push({year:f.year,revenues:state.realizedRevenues,expenses:state.realizedExpenses,cashB:state.budgetTotalB,reserveB:state.fiscalReserve,debtPct:state.publicDebtPct});
    f.year=state.year;state.realizedRevenues=0;state.realizedExpenses=0;
    var b=f.budgets[state.year];
    if(!b)f.budgets[state.year]={year:state.year,status:'MISSING',plannedB:0,capitalB:0,allocations:[],lawId:null};
    if(b?.status==='APPROVED')b.allocations.forEach(function(a){var m=state.ministries.find(function(m){return m.id===a.id;});if(m)m.budget=typeof imfEffectiveMinistryBudget==='function'?imfEffectiveMinistryBudget(state,m.id,a.budgetM):a.budgetM;});
    state.plannedExpenses=b?.status==='APPROVED'?b.plannedB:0;
    state.plannedRevenues=taxCollectableAnnual(state.taxRevenueB+(typeof foreignInvestmentAnnualTax==='function'?foreignInvestmentAnnualTax(state):0)+(typeof regionalCustomsAnnual==='function'?regionalCustomsAnnual(state,state.turnCount+1):0),state)+(typeof stateEnterpriseAnnualDividends==='function'?stateEnterpriseAnnualDividends(state):0);
    state.historyLog.unshift(state.year+' [Financat]: '+(b?.status==='APPROVED'?'Buxheti i votuar hyn në zbatim.':'Nuk ka buxhet vjetor të miratuar. Mjetet dhe detyrimet ruhen; financimi i përkohshëm nuk është modeluar.'));
}
function processFiscalWeek(turn){
    if(!Number.isInteger(turn) || turn!==state.turnCount)throw Error('Java fiskale nuk përputhet me kalendarin e lojës.');
    if(state.publicFinance && (!Number.isInteger(state.publicFinance.lastWeek) || state.publicFinance.lastWeek<0 || state.publicFinance.lastWeek>state.turnCount))throw Error('Ora fiskale e ruajtur është e pavlefshme.');
    validateCurrentIndicators(state,true);
    validateEconomicPilot(state);
    migratePublicFinance(state);validateFinanceExtension(state);var f=state.publicFinance;if(f.lastWeek>=turn)return false;
    fiscalYearTransition();f.lastWeek=turn;
    var economicIndex=fiscalEconomicIndex(state);if(!economicPilotActive(state))state.taxRevenueB=fiscalRound(clamp(state.taxRevenueB+economicIndex-f.lastEconomicIndex,0,10));f.lastEconomicIndex=economicIndex;
    f.decisions.filter(function(d){return d.status==='ACTIVE';}).forEach(function(d){
        if(!state.governmentFormed || state.governmentStatus!=='IN_OFFICE'){d.delay='Zbatimi pret Qeveri me mandat të plotë.';return;}
        if(turn<=d.startTurn || d.lastTurn===turn)return;d.lastTurn=turn;d.elapsed++;d.delay='';
        if(d.annualRevenueDelta){
            if(economicPilotActive(state)){if(d.kind!=='TAX' || !d.pilotStartRates)state.economicPilot.revenueAdjustmentB=fiscalRound(state.economicPilot.revenueAdjustmentB+d.annualRevenueDelta/d.weeks);}
            else state.taxRevenueB=fiscalRound(clamp(state.taxRevenueB+d.annualRevenueDelta/d.weeks,0,10));
        }
        if(d.inflationDelta)state.inflation=fiscalRound(clamp(state.inflation+d.inflationDelta/d.weeks,0,20));
        if(d.elapsed===d.weeks){d.status='COMPLETED';d.completedTurn=turn;if(d.savingB)f.auditSavings[state.year]=(f.auditSavings[state.year]||0)+d.savingB;state.historyLog.unshift(state.year+' [Financat]: Përfundoi '+d.title+'.');}
    });
    processEconomicPilotWeek(turn);
    captureFinancePrices(state);
    var taxFactor=typeof fiscalCollectionFactor==='function'?fiscalCollectionFactor(state):populationFactor(state);
    var revenue=fiscalRound(taxCollectableAnnual(state.taxRevenueB,state)/FISCAL_WEEKS),withheld=fiscalRound(Math.min(fiscalOperatingPlan()/FISCAL_WEEKS,generalStrikeWithheldWeekly(state))),operating=fiscalRound(fiscalOperatingPlan()/FISCAL_WEEKS-withheld),interest=fiscalRound(fiscalAnnualInterestB(state)/FISCAL_WEEKS);
    var fdiTax=typeof foreignInvestmentAnnualTax==='function'?fiscalRound(foreignInvestmentAnnualTax(state)*taxFactor/FISCAL_WEEKS):0;
    var regionalTax=typeof regionalCustomsAnnual==='function'?fiscalRound(regionalCustomsAnnual(state,turn)*taxFactor/FISCAL_WEEKS):0;
    if(regionalTax)fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+regionalTax),'Dogana: marrëveshjet rajonale','REVENUE');
    if(fdiTax)fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+fdiTax),'IHD: tatimet javore','REVENUE');
    revenue=fiscalRound(revenue+fdiTax+regionalTax);
    fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+revenue-fdiTax-regionalTax),'Inkasimi javor i ATK-së dhe Doganës','REVENUE');
    revenue=fiscalRound(revenue+processCouncilFiscal(turn));
    var approved=fiscalBudgetForYear(state.year),room=approved?.status==='APPROVED'?Math.max(0,approved.plannedB-state.realizedExpenses):Infinity;
    operating=fiscalRound(Math.max(0,operating-rtkOperatingSavings(turn,operating)-sectorExpansionSavings(state,Math.max(0,operating-rtkAnnualSavings(state)/FISCAL_WEEKS))));
    var available=Math.min(Math.max(0,state.budgetTotalB),room),paidInterest=Math.min(available,interest);available-=paidInterest;
    if(paidInterest)fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-paidInterest),'Interesi i borxhit publik','INTEREST');
    var paidOperating=Math.min(available,operating);if(paidOperating)fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-paidOperating),'Shpenzimet operative të ministrive','EXPENSE');
    if(typeof recordUnionOperatingFunding==='function')recordUnionOperatingFunding(turn,operating,paidOperating);
    var sectorQuality=typeof processSectorQualityFunding==='function'?processSectorQualityFunding(turn):{paidB:0,unpaidB:0};
    var enterprises=typeof processStateEnterprisesFiscal==='function'?processStateEnterprisesFiscal(turn):{paidB:0,revenueB:0};
    revenue=fiscalRound(revenue+enterprises.revenueB);
    var veterans=typeof processVeteransFiscal==='function'?processVeteransFiscal(turn):{paidB:0,unpaidB:0};
    var north=processNorthFiscal(turn);
    var generalPay=processGeneralStrikeFiscal(turn,withheld);
    var expansionPay=sectorExpansionFiscal(turn);revenue=fiscalRound(revenue+expansionPay.revenueB);
    var laborPay=processLaborSubsidyFiscal(turn),highwayPay=processHighwayFiscal(turn),sovereignPay=processSovereignFiscal(turn);revenue=fiscalRound(revenue+sovereignPay.revenueB);
    var unpaid=fiscalRound(expansionPay.unpaidB+sovereignPay.unpaidB+highwayPay.unpaidB+laborPay.unpaidB+interest-paidInterest+operating-paidOperating+sectorQuality.unpaidB+veterans.unpaidB+north.unpaidB+generalPay.unpaidB);f.arrearsB=fiscalRound(f.arrearsB+unpaid);
    processFiscalDebtContracts(state,interest,paidInterest);
    processPrivateFinanceWeek(state);
    state.lastWeekRevenues=revenue;state.lastWeekExpenses=fiscalRound(expansionPay.paidB+paidInterest+paidOperating+sectorQuality.paidB+enterprises.paidB+veterans.paidB+north.paidB+generalPay.paidB+laborPay.paidB+highwayPay.paidB+sovereignPay.paidB);state.plannedRevenues=fiscalRound(sectorExpansionWeeklyRevenue(state)*FISCAL_WEEKS+taxCollectableAnnual(state.taxRevenueB+(typeof foreignInvestmentAnnualTax==='function'?foreignInvestmentAnnualTax(state):0)+(typeof regionalCustomsAnnual==='function'?regionalCustomsAnnual(state,state.turnCount+1):0),state)+(typeof stateEnterpriseAnnualDividends==='function'?stateEnterpriseAnnualDividends(state):0)+(councilMember(state)&&!sectorExpansionCoal(state)&&!internationalIsolation(state)&&!associationTotalSanctions(state)?.003*FISCAL_WEEKS:0));
    var entry={week:turn,year:state.year,month:MONTHS_SQ[state.monthIndex],revenues:revenue,expenses:state.lastWeekExpenses,balance:fiscalRound(revenue-state.lastWeekExpenses),interest:paidInterest,debtPct:state.publicDebtPct,reserve:state.fiscalReserve,gdpGrowth:state.gdpGrowth,inflation:state.inflation,events:unpaid>0?['Pagesa të papërmbushura për mungesë mjetesh.']:[]};
    state.fiscalHistory.unshift(entry);state.weeklyReports.unshift(Object.assign({},entry));return true;
}
function fiscalPreview(kind,data){
    if(!assertGovernmentAuthority('Vendimi financiar') || state.pendingVote || weeklyProcessing)return false;migratePublicFinance(state);
    var f=state.publicFinance,title,cost=0,weeks=0,annualRevenueDelta=0,inflationDelta=0,saving=0;
    data=data || {};
    if(kind==='DIGITAL_ATK'){title='Digjitalizimi i ATK-së dhe Doganës';cost=.01;weeks=4;annualRevenueDelta=.12;}
    else if(kind==='LOWER_VAT_FOOD'){title='Ulja e TVSH-së së shportës bazë në 8%';cost=.002;weeks=8;annualRevenueDelta=-.07;inflationDelta=-.6;}
    else if(kind==='AUDIT'){title='Auditimi i shpenzimeve';cost=.002;weeks=4;saving=Math.min(.03,Math.max(0,calculatePlannedMinistriesBudget()*.01*state.ministries.reduce(function(s,m){return s+(m.risk||0);},0)/Math.max(1,state.ministries.length)/100));}
    else if(kind==='TAX'){
        if(![15,18,20].includes(data.vat)||![8,10,12].includes(data.incomeTax)||![12,15,18].includes(data.corporateTax)||![8,10,12].includes(data.customs)){showToast('Zgjidhni norma tatimore të vlefshme.');return false;}
        annualRevenueDelta=(data.vat-state.taxPolicy.vat)*.012+(data.incomeTax-state.taxPolicy.incomeTax)*.008+(data.corporateTax-state.taxPolicy.corporateTax)*.010+(data.customs-state.taxPolicy.customs)*.006;
        if(!annualRevenueDelta && ['vat','incomeTax','corporateTax','customs'].every(function(k){return data[k]===state.taxPolicy[k];})){showToast('Nuk ka ndryshim të normave.');return false;}
        title='Rishikimi i normave tatimore';weeks=4;inflationDelta=(data.vat-state.taxPolicy.vat)*.04;
        if(economicPilotActive(state))annualRevenueDelta=economicTaxPreview(data);
    }else if(kind==='BORROW'){
        if(!fiscalBorrowTermsValid(data) || !fiscalTemporaryAllowed(state,data)){showToast('Afati ose nevoja e likuiditetit nuk mbështet këtë hua.');return false;}
        if(!fiscalBorrowingAllowed(state,data.amountB)){showToast('Huamarrja kalon kapacitetin e modelit: të hyrat, borxhi ose shërbimi i interesit nuk e mbështesin këtë shumë.');return false;}
        if(!(data.temporary?[.01,.02,.05]:[.1,.2,.3,.5]).includes(data.amountB) || !['INFRASTRUCTURE','DEFICIT_COVER','EMERGENCY','HEALTH_EDU'].includes(data.purpose)){showToast('Shuma ose qëllimi i huamarrjes nuk është i vlefshëm.');return false;}title=data.temporary?'Financim i përkohshëm i likuiditetit':'Emetimi i obligacionit';
    }else if(kind==='REPAY'){title='Shlyerja e borxhit';data.amountB=Math.min(.15,state.fiscalReserve,fiscalDomesticDebt());if(data.amountB<=0){showToast('Nuk ka rezervë ose borxh të brendshëm për shlyerje. Kreditë ndërkombëtare shlyhen te marrëveshjet përkatëse.');return false;}}
    else if(kind==='RESERVE'){title='Transferimi në rezervë';cost=.05;}
    else if(kind==='ARREARS'){title='Pagesa e detyrimeve të prapambetura';cost=Math.min(Math.max(0,state.budgetTotalB),f.arrearsB);if(cost<=0){showToast('Nuk ka detyrime të papaguara ose mjete të lira.');return false;}}
    else {showToast('Veprimi fiskal nuk njihet.');return false;}
    if(f.decisions.some(function(d){return d.kind===kind && (d.status==='ACTIVE' || d.startTurn===state.turnCount || ['DIGITAL_ATK','LOWER_VAT_FOOD'].includes(kind) || kind==='AUDIT' && d.year===state.year);})){showToast('Ky vendim është regjistruar tashmë. Nuk krijohet një urdhër i dytë.');return false;}
    if(state.budgetTotalB<cost){showToast('Mjetet e lira nuk mbulojnë koston.');return false;}
    if(!['RESERVE','REPAY','BORROW'].includes(kind)){var authorization=fiscalSpendingCheck(cost,false);if(!authorization.allowed){showToast(authorization.message);return false;}}
    var pending={id:'fiscal-order:'+state.turnCount+':'+kind,kind:kind,data:data,title:title,costB:cost,weeks:weeks,annualRevenueDelta:annualRevenueDelta,inflationDelta:inflationDelta,savingB:saving,turn:state.turnCount,year:state.year,oldVat:state.taxPolicy.vat};
    var previousPending=f.pending;f.pending=pending;var e=catalogEscape,money=function(n){return '€'+(n*1000).toFixed(2)+'M';};
    var rates=kind==='TAX'?'<p>Normat e propozuara: TVSH '+data.vat+'%, të ardhurat '+data.incomeTax+'%, korporatat '+data.corporateTax+'%, doganat '+data.customs+'%.</p>'+(economicPilotActive(state)?'<p>Piloti: parashikimi mban prodhimin dhe punësimin aktual të pandryshuar. Bazat reagojnë ndaj normave; të hyrat reale mund të ndryshojnë me energjinë, prodhimin dhe pagat. Efekti në arkë vjen vetëm nga arkëtimet javore.</p>':''):'';
    if(kind==='BORROW')rates+='<p>'+(data.maturityWeeks===undefined?'Kontratë e ndërfaqes së vjetër pa maturitet të deklaruar.':'Maturiteti: '+data.maturityWeeks+' javë; norma kontraktuale në konfirmim: '+state.debtInterestRate+'%.')+' Nevoja e likuiditetit nuk zëvendëson miratimin e buxhetit.</p>';
    document.getElementById('interactiveActionModalContent').innerHTML='<div class="fiscal11"><h2>'+e(title)+'</h2><p>Kosto / transferim nga arka: '+money(cost)+'. Afati: '+(weeks?weeks+' javë':'Në konfirmim')+'.</p>'+rates+(annualRevenueDelta?'<p>Ndryshimi i pritshëm i të hyrave vjetore pas zbatimit: '+money(annualRevenueDelta)+'. Nuk është arkëtim i menjëhershëm.</p>':'')+(saving?'<p>Kursimi ul planin operativ vjetor pas auditimit, deri '+money(saving)+'. Nuk krijon para nga asgjëja.</p>':'')+(kind==='BORROW'?'<p>Huamarrje: '+money(data.amountB)+'; interesi vjetor i tanishëm '+state.debtInterestRate+'%. Kryegjëja mbetet detyrim. Marrja e huasë nuk është investim i përfunduar.</p>':'')+(kind==='REPAY'?'<p>Shlyerje nga rezerva: '+money(data.amountB)+'. Kryegjëja dhe rezerva ulen me të njëjtën shumë.</p>':'')+'<button class="action-btn btn-gold" onclick="confirmFiscalDecision(\''+pending.id+'\')">Konfirmo vendimin</button><button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Kthehu</button></div>';toggleModal('interactiveActionModal',true);
    if(!saveGameAuto()){f.pending=previousPending;toggleModal('interactiveActionModal',false);return false;}return true;
}
function confirmFiscalDecision(id){
    if(!assertGovernmentAuthority('Konfirmimi financiar') || state.pendingVote || weeklyProcessing)return false;
    var f=state.publicFinance,p=f.pending;
    if(!fiscalOrderValid(p) || p.id!==id || p.turn!==state.turnCount || p.year!==state.year || f.decisions.some(function(d){return d.id===id;})){showToast('Urdhri është kryer, ka vlera të pavlefshme ose ka ndryshuar java. Shqyrtojeni sërish.');return false;}
    if(p.kind==='BORROW'&&!fiscalBorrowingAllowed(state,p.data.amountB)){showToast('Kapaciteti i huamarrjes ndryshoi. Shqyrtojeni përsëri shumën.');return false;}
    if(p.kind==='BORROW'&&!fiscalTemporaryAllowed(state,p.data)){showToast('Nevoja e likuiditetit ndryshoi; shqyrtojeni sërish.');return false;}
    if(state.budgetTotalB<p.costB || p.kind==='REPAY' && (state.fiscalReserve<p.data.amountB || fiscalDomesticDebt()+1e-9<p.data.amountB)){showToast('Gjendja financiare ndryshoi; mungojnë mjetet për urdhrin.');return false;}
    if(!['RESERVE','REPAY','BORROW'].includes(p.kind)){var authorization=fiscalSpendingCheck(p.costB,false);if(!authorization.allowed){showToast(authorization.message);return false;}}
    var ok=fiscalCommit(function(){
        var d=Object.assign({},p,{status:p.weeks?'ACTIVE':'COMPLETED',startTurn:state.turnCount,elapsed:0,lastTurn:state.turnCount});
        if(p.kind==='BORROW'){
            fiscalAttachInstrument(d,state);
            var reserve=p.data.purpose==='EMERGENCY'?p.data.amountB*.5:0;
            state.publicDebtPct=fiscalRound(state.publicDebtPct+p.data.amountB/FISCAL_GDP_B*100);
            fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+p.data.amountB),'Obligacioni qeveritar','BORROWING');
            if(reserve){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-reserve),'Ndarja e huasë në rezervë','TRANSFER');fiscalSetBalance(state,'fiscalReserve',fiscalRound(state.fiscalReserve+reserve),'Ndarja e huasë në rezervë','TRANSFER');}
        }else if(p.kind==='REPAY'){fiscalAllocatePrincipal(state,p.data.amountB);state.publicDebtPct=fiscalRound(Math.max(0,state.publicDebtPct-p.data.amountB/FISCAL_GDP_B*100));fiscalSetBalance(state,'fiscalReserve',fiscalRound(state.fiscalReserve-p.data.amountB),'Shlyerja e kryegjësë','DEBT_REPAYMENT');}
        else if(p.kind==='RESERVE'){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-p.costB),'Transferimi në rezervë','TRANSFER');fiscalSetBalance(state,'fiscalReserve',fiscalRound(state.fiscalReserve+p.costB),'Transferimi në rezervë','TRANSFER');}
        else if(p.costB){var interestPart=p.kind==='ARREARS'?fiscalAllocateInterestArrears(state,p.costB):0;if(interestPart)fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-interestPart),p.title,'INTEREST');if(p.costB>interestPart)fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-(p.costB-interestPart)),p.title,'EXPENSE');if(p.kind==='ARREARS')f.arrearsB=fiscalRound(Math.max(0,f.arrearsB-p.costB));}
        if(p.kind==='TAX'){if(typeof interestTaxDecision==='function')interestTaxDecision(d,{...state.taxPolicy});if(economicPilotActive(state))d.pilotStartRates=Object.assign({},state.economicPilot.effectiveRates);Object.assign(state.taxPolicy,p.data);var shift=p.data.vat-(p.oldVat??18);if(shift>0)adjustPublicSupport(-shift*.2,{source:'applyTaxPolicyChange'});}
        if(p.kind==='LOWER_VAT_FOOD')state.taxPolicy.foodVat=8;
        f.decisions.push(d);f.pending=null;state.historyLog.unshift(state.year+' [Financat]: '+p.title+' — '+(p.weeks?'zbatim në '+p.weeks+' javë.':'urdhri u krye.'));
    });if(ok){toggleModal('interactiveActionModal',false);showToast('Vendimi u regjistrua. Ecuria dhe pagesat shfaqen në panelin financiar.');}return ok;
}
function fiscalAdjustMinistry(idx,value){
    if(!assertGovernmentAuthority('Planifikimi i ministrisë'))return false;var m=state.ministries[idx],n=Number(value);
    if(!m || !Number.isFinite(n) || n<0 || n>1200 || n===m.budget)return false;
    var imf=typeof activeIMFPackage==='function'?activeIMFPackage(state):null;if(imf&&imf.ceilings[m.id]!==undefined&&n>m.budget){showToast('FMN ndalon rritjen e kesaj ndarjeje gjate austeritetit.');return false;}
    var b=fiscalBudgetForYear(state.year),total=calculatePlannedMinistriesBudget()+(n-m.budget)/1000+(typeof sectorManagementAnnualPublicCost==='function'?sectorManagementAnnualPublicCost(state):0);
    if(b?.status==='APPROVED' && total>b.plannedB-b.capitalB-(b.interestB||0)-(b.veteransB||0)-(b.northB||0)-(b.generalStrikeB||0)-(b.laborB||0)-(b.highwayB||0)-(b.akpB||0)-(b.expansionB||0)+(b.expansionSavingsB||0)+(b.rtkSavingsB||0)+.000001){showToast('Ndarja kalon planin e votuar. Përgatitni rishikim buxhetor për Kuvendin.');return false;}
    return fiscalCommit(function(){m.budget=n;state.plannedExpenses=fiscalRound(total+(b?.capitalB||0)+(b?.interestB||0)+veteransAnnualCost(state)+northAnnualCost(state)+generalStrikeAnnualCost(state)+laborSubsidyWeekly(state)*FISCAL_WEEKS+highwayWeeklyCost(state)*FISCAL_WEEKS+sovereignWeeklyCost(state)*FISCAL_WEEKS-rtkAnnualSavings(state)+sectorExpansionAnnualNet(state));state.historyLog.unshift(state.year+' [Financat]: Plani i '+m.name+' u ndryshua në €'+n+'M. Pagesat kryhen gjatë javëve; ndryshimi i planit nuk krijon para.');});
}
function fiscalAllocationForm(){
    if(!assertGovernmentAuthority('Plani i ministrive'))return false;var e=catalogEscape;
    document.getElementById('interactiveActionModalContent').innerHTML='<form class="fiscal11" onsubmit="event.preventDefault();confirmBudgetAllocation()"><h2>Rishiko ndarjet e ministrive</h2><p>Kjo ndryshon planifikimin brenda kufijve të buxhetit. Nuk është miratim i buxhetit vjetor dhe nuk transferon para në arkë ose rezervë.</p>'+state.ministries.map(function(m,i){return '<label>'+e(m.name)+'<input class="min-budget-slider" data-idx="'+i+'" type="number" min="0" max="1200" value="'+m.budget+'" oninput="updateBudgetRemaining()"></label>';}).join('')+'<p id="budgetRemainingDisplay"></p><button class="action-btn btn-gold" type="submit">Konfirmo planin e ndarjeve</button></form>';toggleModal('interactiveActionModal',true);fiscalAllocationPreview();return true;
}
function fiscalAllocationPreview(){
    var total=Array.from(document.querySelectorAll('.min-budget-slider')).reduce(function(s,el){return s+Number(el.value)/1000;},0),b=fiscalBudgetForYear(state.year),host=document.getElementById('budgetRemainingDisplay');
    var quality=typeof sectorManagementAnnualPublicCost==='function'?sectorManagementAnnualPublicCost(state):0;
    if(host)host.textContent='Ministritë: €'+(total*1000).toFixed(2)+'M · Cilësia sektoriale: €'+(quality*1000).toFixed(2)+'M · Gjithsej operativ: €'+((total+quality)*1000).toFixed(2)+'M'+(b?.status==='APPROVED'?' · Kufiri operativ i votuar: €'+((b.plannedB-b.capitalB-(b.interestB||0)-(b.veteransB||0)-(b.northB||0)-(b.generalStrikeB||0)-(b.laborB||0)-(b.highwayB||0)-(b.akpB||0))*1000).toFixed(2)+'M.':'. Miratimi vjetor parlamentar shfaqet veçmas.');return total;
}
function fiscalConfirmAllocations(){
    if(!assertGovernmentAuthority('Konfirmimi i planit të ministrive'))return false;
    var rows=Array.from(document.querySelectorAll('.min-budget-slider')).map(function(el){return {index:Number(el.getAttribute('data-idx')),amount:Number(el.value)};});
    if(rows.length!==state.ministries.length || new Set(rows.map(function(r){return r.index;})).size!==rows.length || rows.some(function(r){return !Number.isInteger(r.index) || !state.ministries[r.index] || !Number.isFinite(r.amount) || r.amount<0 || r.amount>1200;})){showToast('Plotësoni ndarjet e vlefshme për të gjitha ministritë.');return false;}
    if(typeof activeIMFPackage==='function'&&activeIMFPackage(state)&&rows.some(r=>activeIMFPackage(state).ceilings[state.ministries[r.index].id]!==undefined&&r.amount>state.ministries[r.index].budget)){showToast('FMN ndalon rritjet e ndarjeve gjate austeritetit.');return false;}
    var total=rows.reduce(function(s,r){return s+r.amount/1000;},0),b=fiscalBudgetForYear(state.year);
    var sectorQualityB=typeof sectorManagementAnnualPublicCost==='function'?sectorManagementAnnualPublicCost(state):0;
    if(b?.status==='APPROVED' && total+sectorQualityB>b.plannedB-b.capitalB-(b.interestB||0)-(b.veteransB||0)-(b.northB||0)-(b.generalStrikeB||0)-(b.laborB||0)-(b.highwayB||0)-(b.akpB||0)-(b.expansionB||0)+(b.expansionSavingsB||0)+1e-9){showToast('Ndarjet dhe cilësia sektoriale kalojnë kufirin operativ të votuar.');return false;}
    if(rows.every(function(r){return state.ministries[r.index].budget===r.amount;})){showToast('Nuk ka ndryshim të planit.');return false;}
    return fiscalCommit(function(){rows.forEach(function(r){state.ministries[r.index].budget=r.amount;});state.plannedExpenses=fiscalRound(total+sectorQualityB+(b?.capitalB||0)+(b?.interestB||0)+veteransAnnualCost(state)+northAnnualCost(state)+generalStrikeAnnualCost(state)+laborSubsidyWeekly(state)*FISCAL_WEEKS+highwayWeeklyCost(state)*FISCAL_WEEKS+sovereignWeeklyCost(state)*FISCAL_WEEKS-rtkAnnualSavings(state)+sectorExpansionAnnualNet(state));state.historyLog.unshift(state.year+' [Financat]: Ndarjet e ministrive u riplanifikuan; nuk u krye pagesë ose rimbursim.');});
}
function fiscalAnnualBudgetForm(revisionId){
    if(!assertGovernmentAuthority('Përgatitja e projektbuxhetit'))return false;
    var old=revisionId&&state.laws.find(function(l){return l.id===revisionId;}),e=catalogEscape;
    if(old && (!old.annualBudgetYear || old.status!=='FAILED'))return false;
    if(old){
        var latest=old,visited=new Set([old.id]),next;
        while((next=state.laws.find(function(l){return l.revisionOf===latest.id && l.annualBudgetYear===old.annualBudgetYear && l.status!=='WITHDRAWN' && !visited.has(l.id);}))){latest=next;visited.add(latest.id);}
        if(latest!==old){catalogBillDetails(state.laws.indexOf(latest));showToast('Ky projektbuxhet ka një version më të ri. U hap dokumenti aktual.');return true;}
    }
    if(revisionId){var retry=billResubmissionCheck(old);if(!retry.allowed){showToast(retry.message);return false;}}
    var allocations=old?.annualBudgetPlan.allocations || state.ministries.map(function(m){return {id:m.id,budgetM:m.budget};});
    document.getElementById('interactiveActionModalContent').innerHTML=(typeof sectorManagementFinanceMarkup==='function'?sectorManagementFinanceMarkup():'')+'<form class="fiscal11" onsubmit="event.preventDefault();submitAnnualBudgetForm(\''+e(revisionId||'')+'\')"><h2>'+ (old?'Rishiko projektbuxhetin e refuzuar':'Përgatit projektbuxhetin')+'</h2><label>Viti financiar<select id="annualBudgetYear">'+[state.year,state.year+1].map(function(y){return '<option '+(old?.annualBudgetYear===y?'selected':'')+'>'+y+'</option>';}).join('')+'</select></label><p>Ndarjet vjetore për ministritë (milionë euro). Ato nuk janë pagesa të menjëhershme.</p>'+allocations.map(function(a){var m=state.ministries.find(function(m){return m.id===a.id;});return '<label>'+e(m?.name || a.id)+'<input class="annual-allocation" data-ministry="'+e(a.id)+'" type="number" min="0" max="10000" step="1" value="'+a.budgetM+'" required></label>';}).join('')+'<label>Tavani i investimeve kapitale shtesë (milionë euro)<input id="annualCapitalM" type="number" min="0" max="10000" step="1" value="'+((old?.annualBudgetPlan.capitalB||0)*1000)+'"></label><p>Projektbuxheti kalon shqyrtimin qeveritar dhe procesin ekzistues në Kuvend. Miratimi autorizon planin; nuk shton të ardhurat vjetore si para të gatshme.</p><button type="submit" class="action-btn btn-gold">Ruaj projektbuxhetin</button></form>';toggleModal('interactiveActionModal',true);return true;
}
function submitAnnualBudgetForm(revisionId){return prepareAnnualBudget(Number(document.getElementById('annualBudgetYear').value),Array.from(document.querySelectorAll('.annual-allocation')).map(function(el){return {id:el.getAttribute('data-ministry'),budgetM:Number(el.value)};}),Number(document.getElementById('annualCapitalM').value)/1000,revisionId);}
function prepareAnnualBudget(year,allocations,capitalB,revisionId){
    if(!assertGovernmentAuthority('Projektbuxheti vjetor') || state.pendingVote)return false;
    if(fiscalBudgetForYear(year)?.status==='APPROVED'){showToast('Ky vit ka buxhet të miratuar. Ndarjet mund të menaxhohen brenda planit të votuar; nuk hapet miratim i dytë.');return false;}
    if(![state.year,state.year+1].includes(year) || !Array.isArray(allocations) || allocations.length!==state.ministries.length || new Set(allocations.map(function(a){return a.id;})).size!==allocations.length || allocations.some(function(a){return !state.ministries.some(function(m){return m.id===a.id;}) || !Number.isFinite(a.budgetM) || a.budgetM<0 || a.budgetM>10000;}) || !Number.isFinite(capitalB) || capitalB<0 || capitalB>10){showToast('Plani financiar ka vlera të pavlefshme.');return false;}
    var previous=revisionId&&state.laws.find(function(l){return l.id===revisionId;});
    if(revisionId && (!previous || previous.status!=='FAILED' || previous.annualBudgetYear!==year))return false;
    if(revisionId){var retry=billResubmissionCheck(previous);if(!retry.allowed){showToast(retry.message);return false;}}
    if(state.laws.some(function(l){return l.annualBudgetYear===year && !['FAILED','WITHDRAWN'].includes(l.status);})){showToast('Ky vit ka tashmë një projektbuxhet aktiv ose të miratuar.');return false;}
    var savedId=null;
    var saved=fiscalCommit(function(){
        openVeteransBudget(year);
        var sectorQualityB=typeof sectorManagementAnnualPublicCost==='function'?sectorManagementAnnualPublicCost(state):0;
        var expansionB=sectorExpansionWeeklyCost(state)*FISCAL_WEEKS,expansionSavingsB=sectorExpansionSavings(state,Math.max(0,allocations.reduce((sum,a)=>sum+a.budgetM/1000,0)/FISCAL_WEEKS-rtkAnnualSavings(state)/FISCAL_WEEKS))*FISCAL_WEEKS;
        var rtkSavingsB=rtkAnnualSavings(state),akpB=sovereignWeeklyCost(state)*FISCAL_WEEKS,highwayB=highwayWeeklyCost(state)*FISCAL_WEEKS,laborB=laborSubsidyWeekly(state)*FISCAL_WEEKS,generalStrikeB=generalStrikeAnnualCost(state),northB=northAnnualCost(state),veteransB=veteransAnnualCost(state),interestB=fiscalAnnualInterestB(state),total=fiscalRound(allocations.reduce(function(sum,a){return sum+a.budgetM/1000;},0)+capitalB+interestB+sectorQualityB+veteransB+northB+generalStrikeB+laborB+highwayB+akpB-rtkSavingsB+expansionB-expansionSavingsB),id='annual-budget:'+year+':'+(++state.billCounter);
        savedId=id;
        var l={id:id,title:'Projektbuxheti i vitit '+year,desc:'Të hyra vjetore të parashikuara €'+state.taxRevenueB.toFixed(3)+' Mld; shpenzime të planifikuara €'+total.toFixed(3)+' Mld. Investime kapitale brenda planit: €'+capitalB.toFixed(3)+' Mld.',ministry:'Ministria e Financave',proposer:'Qeveria e Kosovës',costB:0,duration:1,status:'DRAFT',supportParties:[state.playerParty],approvalEffect:0,stageHistory:[],voteHistory:[],applied:false,annualBudgetYear:year,annualBudgetPlan:{allocations:allocations,capitalB:capitalB,plannedB:total,expectedRevenueB:state.taxRevenueB},revisionOf:revisionId||null};
        l.annualBudgetPlan.rtkSavingsB=rtkSavingsB;l.annualBudgetPlan.akpB=akpB;l.annualBudgetPlan.highwayB=highwayB;l.annualBudgetPlan.laborB=laborB;l.annualBudgetPlan.interestB=interestB;
        l.annualBudgetPlan.expansionB=expansionB;l.annualBudgetPlan.expansionSavingsB=expansionSavingsB;l.annualBudgetPlan.sectorQualityB=sectorQualityB;l.annualBudgetPlan.veteransB=veteransB;l.annualBudgetPlan.northB=northB;l.annualBudgetPlan.generalStrikeB=generalStrikeB;
        initializeCatalogBill(l);state.laws.unshift(l);var votes=state.publicFinance.budgets[year]?.votes || [];state.publicFinance.budgets[year]={year:year,status:'DRAFT',plannedB:total,capitalB:capitalB,interestB:interestB,allocations:allocations,lawId:id,votes:votes};
        state.publicFinance.budgets[year].expansionB=expansionB;state.publicFinance.budgets[year].expansionSavingsB=expansionSavingsB;state.publicFinance.budgets[year].rtkSavingsB=rtkSavingsB;state.publicFinance.budgets[year].akpB=akpB;state.publicFinance.budgets[year].highwayB=highwayB;state.publicFinance.budgets[year].laborB=laborB;state.publicFinance.budgets[year].sectorQualityB=sectorQualityB;state.publicFinance.budgets[year].veteransB=veteransB;state.publicFinance.budgets[year].northB=northB;state.publicFinance.budgets[year].generalStrikeB=generalStrikeB;
        state.historyLog.unshift(state.year+' [Financat]: U përgatit '+l.title+'. Miratimi pret Kuvendin.');
    });
    if(saved){catalogBillDetails(state.laws.findIndex(function(l){return l.id===savedId;}));showToast('Projektbuxheti u ruajt. Vazhdoni shqyrtimin dhe procedurën në Kuvend nga dokumenti i hapur.');}
    return saved;
}
function fiscalAnnualBudgetResult(law,result){
    if(!law.annualBudgetYear || !_committingVote || !state.pendingVote)return;
    var b=state.publicFinance.budgets[law.annualBudgetYear];if(!b || b.lawId!==law.id)return;
    Object.assign(b,law.annualBudgetPlan);b.status=result.passed?'APPROVED':'REJECTED';b.voteTurn=state.turnCount;
    b.votes=b.votes || [];b.votes.push({lawId:law.id,turn:state.turnCount,pro:result.pro,kunder:result.kunder,abstenim:result.abstenim,mungese:result.mungese,passed:result.passed});
    if(result.passed && b.year===state.year){b.allocations.forEach(function(a){var m=state.ministries.find(function(m){return m.id===a.id;});if(m)m.budget=typeof imfEffectiveMinistryBudget==='function'?imfEffectiveMinistryBudget(state,m.id,a.budgetM):a.budgetM;});state.plannedExpenses=b.plannedB;}
}
function renderPublicFinance(){
    var economicOpen=document.getElementById('uxEconomicModel')?.open;
    var householdDetails=document.getElementById('householdEconomyDetails'),householdOpen=householdDetails?.open;
    var householdFocused=householdDetails?.querySelector?.('summary')===document.activeElement && !!document.activeElement;
    var host=document.getElementById('fiscalPanelContainer');if(!host)return;var f=state.publicFinance,e=catalogEscape,b=fiscalBudgetForYear(state.year),money=function(n){return '€'+(n*1000).toFixed(2)+'M';},balance=calculateBudgetBalance();
    function k(label,value,sub){return '<div class="fiscal-kpi"><div class="fiscal-kpi-label">'+label+'</div><div class="fiscal-kpi-value">'+value+'</div><div class="fiscal-kpi-sub">'+sub+'</div></div>';}
    var budgetLabels={LEGACY:'Financim i trashëguar; pa votim të regjistruar',MISSING:'Pa buxhet të miratuar',DRAFT:'Në përgatitje',SUBMITTED:'Dërguar në Kuvend',UNDER_REVIEW:'Në shqyrtim',SCHEDULED:'Në pritje të votimit',APPROVED:'I miratuar',REJECTED:'I refuzuar',WITHDRAWN:'I tërhequr'};
    var html='<div class="fiscal11"><h2>Financat publike · '+state.year+'</h2><p>'+e(budgetLabels[b?.status || 'MISSING'])+'. '+(b?.status==='MISSING'?'Huaja e likuiditetit mund të shqyrtohet më poshtë, por nuk zëvendëson miratimin e buxhetit. Arka, kontratat dhe detyrimet ruhen.':'')+'</p><div class="fiscal-kpi-grid">'+k('Mjetet e lira',money(state.budgetTotalB),'Arka ekzistuese; nuk është tavani vjetor')+k('Plani vjetor',money(b?.plannedB||0),b?.status==='APPROVED'?'I votuar nga Kuvendi':'Pa miratim parlamentar të regjistruar')+k('Të hyra të realizuara',money(state.realizedRevenues),'Arkëtimet e vitit; huamarrja përjashtohet')+k('Pagesa të realizuara',money(state.realizedExpenses),'Përfshin financimin e zotuar paraprakisht')+k(balance>=0?'Suficit':'Deficit',money(balance),'Të hyrat minus pagesat')+k('Borxhi publik',money(state.publicDebtPct/100*FISCAL_GDP_B),state.publicDebtPct.toFixed(2)+'% e bazës ekonomike të modelit')+k('Rezerva',money(state.fiscalReserve),'Mjetet janë të ndara nga arka')+k('Detyrime të papaguara',money(f.arrearsB),'Pagesat javore që nuk u mbuluan')+'</div><p>Të hyrat vjetore të pritshme nga ATK dhe Dogana: '+money(state.taxRevenueB)+'. Rritja ekonomike '+state.gdpGrowth.toFixed(1)+'% · Inflacioni '+state.inflation.toFixed(1)+'% · Papunësia '+state.unemployment.toFixed(1)+'% · Interesi '+state.debtInterestRate.toFixed(1)+'%. Remitancat nuk trajtohen si të hyra publike.</p>';
    var capacity=fiscalBorrowingCapacity(state),audit=fiscalReconciliation(state);
    html+='<details><summary>Borxhi, interesi dhe kontrolli financiar</summary><p>Interesi vjetor i llogaritur mbi stokun aktual: '+money(fiscalAnnualInterestB(state))+'. Borxhi i brendshëm përdor normën e përgjithshme; kreditë e lëvruara përdorin normën e kontratës. Kryegjëja e huasë dhe shlyerja e saj janë financim, jo të hyra ose shpenzime.</p><p>Huamarrje e regjistruar këtë vit: '+money(capacity.issuedB)+'. Hapësirë për obligacione të reja: '+money(capacity.availableB)+'. Kufijtë janë supozime simulimi: huamarrje vjetore deri 25% e të hyrave, stok deri dyfishin e tyre dhe interes deri 20% të tyre. Nuk janë pragje ligjore të Kosovës dhe nuk autorizojnë shpenzime jashtë buxhetit.</p><p>Deficiti më sipër mat arkëtimet minus pagesat e realizuara; detyrimet e papaguara paraqiten veçmas. Financimi nuk kryhet automatikisht. Kreditimi privat paraqitet veçmas më poshtë; matja e çmimeve mbetet e kufizuar te shporta ekzistuese.</p>'+ (audit.issues.length?audit.issues.map(function(s){return '<p>'+e(s)+'</p>';}).join(''):'<p>Arkëtimet dhe pagesat e regjistruara përputhen me realizimin aktual.</p>')+'</details>';
    if(f.legacyBaseline.revenues || f.legacyBaseline.expenses)html+='<p>Realizimi përfshin vlerat e trashëguara nga ruajtja e vjetër, pa regjistër të hollësishëm të transaksioneve të kaluara.</p>';
    if(agendaExecutive())html+='<div class="candidate-actions"><button class="action-btn btn-gold" onclick="fiscalAnnualBudgetForm()">Përgatit projektbuxhetin</button><button class="action-btn" onclick="openTaxPolicyModal()">Normat tatimore</button><button class="action-btn" onclick="openBorrowingModal()">Huamarrja dhe shlyerja</button><button class="action-btn" onclick="applyFiscalPolicy(\'DIGITAL_ATK\')">Digjitalizimi i ATK-së dhe Doganës</button><button class="action-btn" onclick="applyFiscalPolicy(\'LOWER_VAT_FOOD\')">TVSH e shportës bazë</button><button class="action-btn" onclick="auditPublicSpending()">Auditimi</button><button class="action-btn" onclick="transferToReserve()">Transferimi në rezervë</button></div>';
    html+='<h3>Projektbuxhetet dhe votimet</h3>'+Object.values(f.budgets).map(function(x){var idx=state.laws.findIndex(function(l){return l.id===x.lawId;});return '<article><strong>'+x.year+' · '+e(budgetLabels[x.status])+'</strong><p>'+money(x.plannedB)+' · Kapitale: '+money(x.capitalB||0)+'</p>'+(idx>=0?'<button class="btn-top" onclick="catalogBillDetails('+idx+')">Shqyrtimi dhe procedura në Kuvend</button>':'')+(x.status==='REJECTED'&&agendaExecutive()?'<button class="action-btn" onclick="fiscalAnnualBudgetForm(\''+e(x.lawId)+'\')">Rishiko dhe riparaqit</button>':'')+'</article>';}).join('');
    html+='<h3>Planet e ministrive</h3><p>Totali operativ: '+money(calculatePlannedMinistriesBudget())+'. Ndryshimi i planit nuk është pagesë.</p>'+state.ministries.map(function(m,i){return '<div class="budget-row"><span>'+e(m.name)+'</span><strong>'+money(m.budget/1000)+'</strong>'+(agendaExecutive()?'<input aria-label="Plani i '+e(m.name)+' në milionë euro" type="number" min="0" max="1200" value="'+m.budget+'" onchange="adjustMinistryBudget('+i+',this.value)">':'')+'</div>';}).join('');
    var capitalPaid=f.ledger.filter(function(r){return r.year===state.year && r.type==='CAPITAL_PAYMENT';}).reduce(function(sum,r){return sum+Math.abs(r.amountB);},0);
    html+='<p>Financim kapital i paguar këtë vit: '+money(capitalPaid)+'. Punimet përparojnë sipas afateve te projektet; fondet e zotuara nuk zbriten përsëri çdo javë.</p>';
    if(f.arrearsB>0 && agendaExecutive())html+='<button class="action-btn" onclick="fiscalPreview(\'ARREARS\')">Shqyrto pagesën e detyrimeve të prapambetura</button>';
    html+='<h3>Vendimet dhe afatet</h3>'+f.decisions.map(function(d){return '<article><strong>'+e(d.title)+'</strong><p>'+({ACTIVE:'Në zbatim',COMPLETED:'I përfunduar',SUSPENDED:'I pezulluar'})[d.status]+' · '+(d.weeks?d.elapsed+'/'+d.weeks+' javë':'Urdhër financiar në konfirmim')+' · Kosto / transferim: '+money(d.costB)+'</p><p>'+e(d.delay||'')+'</p></article>';}).join('');
    html+='<details><summary>Regjistri financiar</summary>'+f.ledger.slice(-80).reverse().map(function(r){return '<p>'+r.year+' · Java '+r.turn+' · '+e(fiscalSourceLabel(r.source))+' · '+money(r.amountB)+'</p>';}).join('')+'</details><details><summary>Votimet buxhetore</summary>'+Object.values(f.budgets).flatMap(function(b){return (b.votes||[]).map(function(v){return '<p>'+b.year+' · '+(v.passed?'I miratuar':'I refuzuar')+' · '+v.pro+' për, '+v.kunder+' kundër, '+v.abstenim+' abstenime, '+v.mungese+' mungesa.</p>';});}).join('')+'</details><details><summary>Vitet e mbyllura</summary>'+f.closedYears.map(function(y){return '<p>'+y.year+' · Të hyra '+money(y.revenues)+' · Pagesa '+money(y.expenses)+' · Arka '+money(y.cashB)+'</p>';}).join('')+'</details></div>';
    host.innerHTML=html+(typeof sectorManagementFinanceMarkup==='function'?sectorManagementFinanceMarkup():'')+financeExtensionPanel()+'<details class="card" id="uxEconomicModel"><summary>Modeli ekonomik dhe lidhjet me energjinë, punësimin e tatimet</summary>'+economicPilotPanel()+'</details>';
    if(economicOpen || householdOpen)document.getElementById('uxEconomicModel').open=true;
    var householdNext=document.getElementById('householdEconomyDetails');
    if(householdNext && householdOpen)householdNext.open=true;
    if(householdNext && householdFocused)householdNext.querySelector('summary').focus();
}
