/* Optional prospective contracts. Monetary units are billions of simulated euros.
   No historical balances, maturities or private transactions are reconstructed. */
function fiscalDebtContracts(st){return (st.publicFinance?.decisions||[]).filter(function(d){return d.instrument;});}
function fiscalTrackedPrincipal(st){return fiscalDebtContracts(st).reduce(function(s,d){return s+d.instrument.remainingB;},0);}
function fiscalTrackedAnnualInterest(st){return fiscalDebtContracts(st).reduce(function(s,d){return s+d.instrument.remainingB*d.instrument.annualRate/100;},0);}
function fiscalBorrowTermsValid(data){
    if(!data)return false;
    if(data.temporary!==undefined && typeof data.temporary!=='boolean')return false;
    if(data.temporary && data.purpose!=='DEFICIT_COVER')return false;
    return data.maturityWeeks===undefined?!data.temporary:(data.temporary?[4,12]:[48,96]).includes(data.maturityWeeks);
}
function fiscalTemporaryAllowed(st,data){
    if(!data.temporary)return true;
    var planned=+((st.ministries||[]).reduce(function(sum,m){return sum+(m.budget||0);},0)/1000).toFixed(3);
    var need=Math.max(0,(planned+fiscalAnnualInterestB(st))/48*data.maturityWeeks-st.budgetTotalB);
    return data.amountB<=need+1e-9;
}
function fiscalAttachInstrument(d,st){
    // Legacy callers/contracts without an explicit tenor retain their old terms.
    if(d.data.maturityWeeks===undefined)return;
    d.instrument={version:1,issuedTurn:st.turnCount,dueTurn:st.turnCount+d.data.maturityWeeks,annualRate:st.debtInterestRate,
        principalB:d.data.amountB,remainingB:d.data.amountB,interestPaidB:0,interestUnpaidB:0,status:'ACTIVE',lastTurn:st.turnCount};
}
function fiscalAllocateInterestArrears(st,amount){
    var left=amount;fiscalDebtContracts(st).forEach(function(d){var paid=Math.min(left,d.instrument.interestUnpaidB);d.instrument.interestUnpaidB=fiscalRound(d.instrument.interestUnpaidB-paid);left=fiscalRound(left-paid);});return fiscalRound(amount-left);
}
function fiscalAllocatePrincipal(st,amount){
    // Legacy unallocated domestic stock is repaid first; never invent its maturity.
    var legacy=Math.max(0,st.publicDebtPct/100*FISCAL_GDP_B-fiscalOutstandingForeign(st).reduce(function(s,a){return s+a.financing.principalB;},0)-fiscalTrackedPrincipal(st));
    var left=Math.max(0,amount-legacy);
    fiscalDebtContracts(st).slice().sort(function(a,b){return a.instrument.dueTurn-b.instrument.dueTurn;}).forEach(function(d){var c=d.instrument,pay=Math.min(left,c.remainingB);c.remainingB=fiscalRound(c.remainingB-pay);left=fiscalRound(left-pay);if(!c.remainingB)c.status='REPAID';});
}
function processFiscalDebtContracts(st,interest,paidInterest){
    fiscalDebtContracts(st).forEach(function(d){
        var c=d.instrument;if(c.lastTurn>=st.turnCount || c.status==='REPAID')return;c.lastTurn=st.turnCount;
        var due=fiscalRound(c.remainingB*c.annualRate/100/48),paid=interest>0?fiscalRound(due*Math.min(1,paidInterest/interest)):0;
        c.interestPaidB=fiscalRound(c.interestPaidB+paid);c.interestUnpaidB=fiscalRound(c.interestUnpaidB+due-paid);
        // Unpaid interest is already in publicFinance.arrearsB; do not charge it twice.
        if(st.turnCount>=c.dueTurn){
            var principal=fiscalRound(Math.min(c.remainingB,Math.max(0,st.budgetTotalB)));
            if(principal){fiscalSetBalance(st,'budgetTotalB',fiscalRound(st.budgetTotalB-principal),'Maturiteti '+d.id,'DEBT_REPAYMENT');st.publicDebtPct=fiscalRound(Math.max(0,st.publicDebtPct-principal/FISCAL_GDP_B*100));c.remainingB=fiscalRound(c.remainingB-principal);}
            c.status=c.remainingB?'OVERDUE':'REPAID';
        }
    });
}
function validateFinanceExtension(st){
    var numeric=function(v){return Number.isFinite(v)&&v>=0;};
    fiscalDebtContracts(st).forEach(function(d){var c=d.instrument;if(d.kind!=='BORROW'||c.version!==1||!Number.isInteger(c.issuedTurn)||c.issuedTurn<0||c.issuedTurn!==d.startTurn||c.issuedTurn>st.turnCount||!Number.isInteger(c.dueTurn)||c.dueTurn!==c.issuedTurn+d.data.maturityWeeks||!Number.isInteger(c.lastTurn)||c.lastTurn<c.issuedTurn||c.lastTurn>st.turnCount||![c.principalB,c.remainingB,c.annualRate,c.interestPaidB,c.interestUnpaidB].every(numeric)||c.principalB<=0||c.annualRate>100||c.remainingB>c.principalB||c.principalB!==d.data.amountB||!['ACTIVE','OVERDUE','REPAID'].includes(c.status)||(c.status==='REPAID')!==(c.remainingB===0))throw Error('Kontratë borxhi e pavlefshme.');});
    if(fiscalTrackedPrincipal(st)>Math.max(0,st.publicDebtPct/100*FISCAL_GDP_B-fiscalOutstandingForeign(st).reduce(function(sum,a){return sum+a.financing.principalB;},0))+1e-8)throw Error('Kontratat tejkalojnë stokun e borxhit.');
    var rows=st.publicFinance?.priceObservations;if(rows!==undefined){if(!Array.isArray(rows)||rows.length>145)throw Error('Historik çmimesh i pavlefshëm.');var last=-1;rows.forEach(function(r){if(!Number.isInteger(r.turn)||r.turn<=last||r.turn>st.turnCount||!Number.isFinite(r.index)||r.index<=0||!Number.isInteger(r.baseTurn)||r.baseTurn<0||r.baseTurn>=r.turn)throw Error('Vrojtim çmimesh i pavlefshëm.');last=r.turn;});}
    validatePrivateFinance(st);
}
function captureFinancePrices(st){
    var m=householdBasketMeasurement(st);if(m.status!=='ready'||m.turn!==st.turnCount)return;
    var f=st.publicFinance,rows=f.priceObservations;if(!rows)rows=f.priceObservations=[];
    if(rows.some(function(r){return r.turn===m.turn;}))return;
    rows.push({turn:m.turn,baseTurn:m.startTurn,index:m.value});if(rows.length>145)rows.shift();
}
function financePriceChanges(st){
    var rows=st.publicFinance?.priceObservations||[],r=rows.at(-1);if(!r || r.turn!==st.turnCount)return null;
    var result={turn:r.turn,index:r.index};[1,4,48].forEach(function(lag){var b=rows.find(function(x){return x.turn===r.turn-lag&&x.baseTurn===r.baseTurn;});result[lag]=b?(r.index/b.index-1)*100:null;});return result;
}
function validatePrivateFinance(st){
    var p=st.privateFinance;if(p===undefined)return;
    var num=function(v){return Number.isFinite(v)&&v>=0;};
    if(!p||p.version!==1||!Number.isInteger(p.revision)||p.revision<0||!Number.isInteger(p.counter)||p.counter<0||!Number.isInteger(p.lastTurn)||p.lastTurn<0||p.lastTurn>st.turnCount||!p.bank||!p.borrower||![p.bank.capitalB,p.bank.cashB,p.bank.interestIncomeB,p.borrower.equityB,p.borrower.cashB,p.borrower.receiptsB,p.borrower.expensesB].every(num)||!Array.isArray(p.loans)||!Array.isArray(p.ledger))throw Error('Bilanc privat i pavlefshëm.');
    var ids=new Set();p.loans.forEach(function(l){if(!l||typeof l.id!=='string'||!/^private:\d+$/.test(l.id)||ids.has(l.id)||![l.principalB,l.remainingB,l.rate,l.interestDueB,l.principalDueB].every(num)||l.rate>100||l.remainingB>l.principalB||l.principalDueB>l.remainingB+1e-9||!Number.isInteger(l.weeks)||l.weeks<1||l.weeks>96||!Number.isInteger(l.issuedTurn)||l.issuedTurn<0||l.issuedTurn>st.turnCount||!Number.isInteger(l.lastTurn)||l.lastTurn<l.issuedTurn||l.lastTurn>st.turnCount||!['ACTIVE','OVERDUE','REPAID'].includes(l.status)||(l.status==='REPAID')!==(l.remainingB===0&&l.interestDueB===0))throw Error('Kredi private e pavlefshme.');ids.add(l.id);});
    var remaining=p.loans.reduce(function(s,l){return s+l.remainingB;},0);
    if(Math.abs(p.bank.cashB+remaining-p.bank.capitalB-p.bank.interestIncomeB)>1e-7||Math.abs(p.borrower.cashB-remaining-p.borrower.equityB-p.borrower.receiptsB+p.borrower.expensesB+p.bank.interestIncomeB)>1e-7)throw Error('Bilancet private nuk rakordohen.');
    var seq=0;p.ledger.forEach(function(r){if(r.id!==++seq||!Number.isInteger(r.turn)||r.turn<0||r.turn>st.turnCount||!num(r.amountB)||!['DISBURSEMENT','PRINCIPAL','INTEREST','RECEIPT','OPERATING_COST'].includes(r.type))throw Error('Regjistër privat i pavlefshëm.');});if(seq!==p.counter)throw Error('Numërues privat i pavlefshëm.');
    var total=function(type,id){return p.ledger.filter(function(r){return r.type===type&&(id===undefined||r.loanId===id);}).reduce(function(s,r){return s+r.amountB;},0);};
    p.loans.forEach(function(l){if(Math.abs(total('DISBURSEMENT',l.id)-l.principalB)>1e-8||Math.abs(total('PRINCIPAL',l.id)-(l.principalB-l.remainingB))>1e-8)throw Error('Regjistri i principalit privat nuk rakordohet.');});
    if(p.ledger.some(function(r){return ['DISBURSEMENT','PRINCIPAL','INTEREST'].includes(r.type)&&!ids.has(r.loanId);})||Math.abs(total('INTEREST')-p.bank.interestIncomeB)>1e-8||Math.abs(total('RECEIPT')-p.borrower.receiptsB)>1e-8||Math.abs(total('OPERATING_COST')-p.borrower.expensesB)>1e-8)throw Error('Regjistri i flukseve private nuk rakordohet.');
}
function privateEntry(p,type,amount,loanId,turn){if(amount)p.ledger.push({id:++p.counter,turn:turn===undefined?state.turnCount:turn,type:type,amountB:fiscalRound(amount),loanId:loanId||null});}
function initializePrivateFinance(capitalM,equityM){
    if(state.privateFinance || !Number.isFinite(capitalM)||capitalM<=0||fiscalRound(capitalM/1000)<=0||!Number.isFinite(equityM)||equityM<0)return false;
    return fiscalCommit(function(){state.privateFinance={version:1,revision:0,counter:0,lastTurn:state.turnCount,bank:{capitalB:fiscalRound(capitalM/1000),cashB:fiscalRound(capitalM/1000),interestIncomeB:0},borrower:{equityB:fiscalRound(equityM/1000),cashB:fiscalRound(equityM/1000),receiptsB:0,expensesB:0},loans:[],ledger:[]};});
}
function privateCommit(revision,change){
    if(!state.privateFinance || revision!==state.privateFinance.revision)return false;
    return fiscalCommit(function(){change(state.privateFinance);state.privateFinance.revision++;validatePrivateFinance(state);});
}
function issuePrivateLoan(amountM,rate,weeks,revision){
    return privateCommit(revision,function(p){var amount=fiscalRound(amountM/1000);if(!Number.isFinite(amount)||amount<=0||amount>p.bank.cashB||!Number.isFinite(rate)||rate<0||rate>100||!Number.isInteger(weeks)||weeks<1||weeks>96||p.loans.some(function(l){return l.status!=='REPAID';}))throw Error('Kushtet, likuiditeti bankar ose kredia ekzistuese nuk lejojnë lëvrimin.');
        var l={id:'private:'+p.revision,issuedTurn:state.turnCount,lastTurn:state.turnCount,principalB:amount,remainingB:amount,rate:rate,weeks:weeks,interestDueB:0,principalDueB:0,status:'ACTIVE'};
        p.bank.cashB=fiscalRound(p.bank.cashB-amount);p.borrower.cashB=fiscalRound(p.borrower.cashB+amount);p.loans.push(l);privateEntry(p,'DISBURSEMENT',amount,l.id);
    });
}
function payPrivateLoan(p,l,limit,turn){
    var interest=fiscalRound(Math.min(limit,p.borrower.cashB,l.interestDueB));
    p.borrower.cashB=fiscalRound(p.borrower.cashB-interest);p.bank.cashB=fiscalRound(p.bank.cashB+interest);p.bank.interestIncomeB=fiscalRound(p.bank.interestIncomeB+interest);l.interestDueB=fiscalRound(l.interestDueB-interest);privateEntry(p,'INTEREST',interest,l.id,turn);
    var principal=fiscalRound(Math.min(Math.max(0,limit-interest),p.borrower.cashB,l.remainingB));
    p.borrower.cashB=fiscalRound(p.borrower.cashB-principal);p.bank.cashB=fiscalRound(p.bank.cashB+principal);l.remainingB=fiscalRound(l.remainingB-principal);l.principalDueB=fiscalRound(Math.max(0,l.principalDueB-principal));privateEntry(p,'PRINCIPAL',principal,l.id,turn);
    l.status=!l.remainingB&&!l.interestDueB?'REPAID':l.interestDueB>0||l.principalDueB>0?'OVERDUE':'ACTIVE';
}
function repayPrivateLoan(id,amountM,revision){return privateCommit(revision,function(p){var l=p.loans.find(function(x){return x.id===id;}),amount=fiscalRound(amountM/1000);if(!l||l.status==='REPAID'||!Number.isFinite(amount)||amount<=0||amount>p.borrower.cashB||amount>l.remainingB+l.interestDueB+1e-9)throw Error('Shlyerja private nuk mbulohet nga llogaria ose detyrimi.');payPrivateLoan(p,l,amount);});}
function privateOperatingFlow(amountM,receipt,revision){return privateCommit(revision,function(p){var amount=fiscalRound(amountM/1000);if(!Number.isFinite(amount)||amount<=0||typeof receipt!=='boolean'||!receipt&&amount>p.borrower.cashB)throw Error('Fluks privat i pavlefshëm.');p.borrower.cashB=fiscalRound(p.borrower.cashB+(receipt?amount:-amount));var field=receipt?'receiptsB':'expensesB';p.borrower[field]=fiscalRound(p.borrower[field]+amount);privateEntry(p,receipt?'RECEIPT':'OPERATING_COST',amount);});}
function processPrivateFinanceWeek(st){
    var p=st.privateFinance;if(!p||p.lastTurn>=st.turnCount)return;p.lastTurn=st.turnCount;p.revision++;
    p.loans.forEach(function(l){if(l.status==='REPAID'||l.lastTurn>=st.turnCount)return;l.lastTurn=st.turnCount;l.interestDueB=fiscalRound(l.interestDueB+l.remainingB*l.rate/100/48);l.principalDueB=fiscalRound(Math.min(l.remainingB,l.principalDueB+l.principalB/l.weeks));if(st.turnCount-l.issuedTurn>=l.weeks)l.principalDueB=l.remainingB;payPrivateLoan(p,l,Math.min(p.borrower.cashB,l.interestDueB+l.principalDueB),st.turnCount);});validatePrivateFinance(st);
}
function financeReadNumber(id){var raw=document.getElementById(id)?.value;return raw===undefined||raw===null||String(raw).trim()===''?NaN:Number(raw);}
function financePrivateAction(kind,revision,id){
    if(!['INIT','LOAN','REPAY','RECEIPT','COST'].includes(kind))return false;
    var ok=kind==='INIT'?initializePrivateFinance(financeReadNumber('privateCapital'),financeReadNumber('privateEquity')):kind==='LOAN'?issuePrivateLoan(financeReadNumber('privateAmount'),financeReadNumber('privateRate'),financeReadNumber('privateWeeks'),revision):kind==='REPAY'?repayPrivateLoan(id,financeReadNumber('privateRepay'),revision):privateOperatingFlow(financeReadNumber('privateFlow'),kind==='RECEIPT',revision);
    showToast(ok?'Veprimi privat u ruajt.':'Veprimi nuk u krye. Kontrolloni vlerat, gjendjen dhe afatin; rifreskoni panelin për një urdhër të ri.');return ok;
}
function financeExtensionPanel(){
    var e=catalogEscape,m=function(n){return '€'+(n*1000).toFixed(3)+'M';},p=state.privateFinance,executive=agendaExecutive();
    var html='<section id="financeExtension" class="fiscal11"><h3>Kontratat e reja të borxhit</h3><p>Maturitetet vlejnë vetëm për emetimet e reja. Borxhi historik nuk merr afat të sajuar. Principalet nuk janë shpenzim buxhetor; huaja e likuiditetit nuk miraton shpenzime pa buxhet.</p>';
    if(executive)html+='<label>Likuiditet i përkohshëm<select id="liquidityAmount"><option value="10">€10M</option><option value="20">€20M</option><option value="50">€50M</option></select></label><label>Afati<select id="liquidityWeeks"><option value="4">4 javë</option><option value="12">12 javë</option></select></label><button class="action-btn" onclick="fiscalPreview(\'BORROW\',{amountB:financeReadNumber(\'liquidityAmount\')/1000,maturityWeeks:financeReadNumber(\'liquidityWeeks\'),temporary:true,purpose:\'DEFICIT_COVER\'})">Shqyrto financimin e likuiditetit</button><p>Shumat dhe afatet janë kufij skenari simulimi, jo rregulla ligjore. Kufiri i borxhit dhe nevoja monetare rikontrollohen në konfirmim.</p>';
    html+=fiscalDebtContracts(state).map(function(d){var c=d.instrument;return '<article><strong>'+e(d.data.temporary?'Likuiditet i përkohshëm':'Obligacion')+'</strong><p>'+e(d.id)+' · '+e(c.status)+' · emetimi '+c.issuedTurn+' / maturimi '+c.dueTurn+' (hapa javorë) · norma '+c.annualRate+'%</p><p>Principal '+m(c.principalB)+'; mbetur '+m(c.remainingB)+'; interes paguar '+m(c.interestPaidB)+'; interes i papaguar '+m(c.interestUnpaidB)+' (i përfshirë në detyrimet publike).</p></article>';}).join('')||'<p>Nuk ka kontrata të reja me maturitet të regjistruar.</p>';
    var prices=financePriceChanges(state),n=function(v){return v===null?'Të dhëna të pamjaftueshme':v.toFixed(3)+'%';};
    html+='<h3 id="financePricesTitle">Ndryshimi i çmimeve të shportës së modelit</h3><p>Matje e dy agregateve ekzistuese; jo HICP, inflacion zyrtar ose model monetar. Treguesi i vjetër i inflacionit mbetet tregues i politikave të modelit.</p>'+(prices?'<p>Niveli '+prices.index.toFixed(3)+' (referenca 100); hapi '+prices.turn+'. Ndryshim: 1 javë '+n(prices[1])+', 4 javë '+n(prices[4])+', 48 javë '+n(prices[48])+'. Periudhat janë të kalendarit të lojës.</p>':'<p>Aktivizoni pilotin, prodhimin dhe konsumin për raporte të vlefshme çmimesh; pa të dhëna nuk shfaqet zero.</p>');
    html+='<h3 id="privateFinanceTitle">Bankë dhe ndërmarrje private — model i kufizuar</h3><p>Një bankë dhe një huamarrës agregat të simuluar, jo të dhëna bankare reale. Pa depozita, krijim kreditor parash ose lidhje automatike kredi → PBB. Arka shtetërore nuk merr as principalin as interesin privat.</p>';
    if(!p){html+='<p>Modeli privat nuk është aktiv; save-et historike nuk marrin bilance të sajuara. Aktivizimi deklaron kapital privat fillestar simulimi, pa transfertë shtetërore.</p>';if(executive)html+='<label>Kapital bankar fillestar (€M)<input id="privateCapital" type="number" min="0" step="any"></label><label>Kapital i ndërmarrjes (€M)<input id="privateEquity" type="number" min="0" step="any"></label><button class="action-btn" onclick="financePrivateAction(\'INIT\')">Inicializo skenarin privat</button>';}
    else {html+='<p>Banka: mjete '+m(p.bank.cashB)+', kredi aktive '+m(p.loans.reduce(function(s,l){return s+l.remainingB;},0))+', interes i arkëtuar '+m(p.bank.interestIncomeB)+'. Ndërmarrja: mjete '+m(p.borrower.cashB)+'.</p>';
        p.loans.forEach(function(l){html+='<article><strong>'+e(l.id)+' · '+e(l.status)+'</strong><p>Principal mbetur '+m(l.remainingB)+'; principal i maturuar '+m(l.principalDueB)+'; interes i maturuar '+m(l.interestDueB)+'; norma '+l.rate+'%; '+l.weeks+' javë.</p>'+(executive&&l.status!=='REPAID'?'<label>Pagesë (€M)<input id="privateRepay" type="number" min="0" step="any"></label><button class="action-btn" onclick="financePrivateAction(\'REPAY\','+p.revision+',\''+e(l.id)+'\')">Paguaj nga llogaria private</button>':'')+'</article>';});
        if(executive)html+='<label>Principal (€M)<input id="privateAmount" type="number" min="0" step="any"></label><label>Norma vjetore (%)<input id="privateRate" type="number" min="0" max="100" step="any"></label><label>Afati (1–96 javë)<input id="privateWeeks" type="number" min="1" max="96"></label><button class="action-btn" onclick="financePrivateAction(\'LOAN\','+p.revision+')">Shqyrto dhe lëvro kredi private</button><p>Vetëm një kredi e hapur. Principal i barabartë javor; interesi mbi principalin e mbetur, 48 javë/vit. Mungesa e mjeteve krijon vonesë, jo para shtesë.</p><label>Fluks operacional i deklaruar (€M)<input id="privateFlow" type="number" min="0" step="any"></label><button class="action-btn" onclick="financePrivateAction(\'RECEIPT\','+p.revision+')">Regjistro arkëtim privat</button><button class="action-btn" onclick="financePrivateAction(\'COST\','+p.revision+')">Regjistro pagesë operative private</button><p>Flukset janë hyrje skenari të deklaruara nga lojtari, jo të nxjerra nga indekset relative ose arkëtime publike.</p>';
        html+='<details><summary>Regjistri privat</summary>'+p.ledger.slice(-40).reverse().map(function(r){return '<p>'+r.turn+' · '+e(r.type)+' · '+m(r.amountB)+'</p>';}).join('')+'</details>';
    }
    return html+'</section>';
}
