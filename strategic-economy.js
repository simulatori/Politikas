/* Legislative financing uses existing loans, Bureau receipts and signed FDI. All money is € billions. */
const STRATEGIC_LAWS={BOND:'Ligji për Obligacionet e Diasporës për Zhvillim',CONFISCATION:'Ligji për Vettingun e Thellë dhe Byronë e Konfiskimit',ZONE:'Ligji për Zona të Lira Ekonomike Digjitale dhe Industriale'};
function strategicLaws(st){return st.laws.filter(l=>l.strategicFinance);}
function strategicLaw(st,kind){return strategicLaws(st).find(l=>l.strategicFinance.kind===kind);}
function strategicFinanceRecord(kind,amountB){return {version:1,kind,amountB,status:'LEGISLATION',issuer:state.playerParty,activatedTurn:null,lastTurn:state.turnCount,receiptId:null,contractId:null,bidderId:null,taxHolidayUntil:null,reviews:[],recoveryTurn:null,sabotage:null,refundB:0};}
function proposeStrategicLaw(kind,amountB=.3){
    if(!Object.hasOwn(STRATEGIC_LAWS,kind)||kind==='BOND'&&![.2,.3,.5].includes(amountB))return false;
    return governmentCrisisCommit(()=>{
        if(legislativeCampaignClosed()||governmentCrisisPending()||strategicLaw(state,kind))throw Error('Kjo nismë ekziston ose Kuvendi nuk pranon ligje tani.');
        let l;
        if(kind==='CONFISCATION'){
            l=bureauLaw(state);if(!l||l.status==='PASSED'||l.applied||l.bureauBattle||l.executiveChain)throw Error('Byroja ekzistuese ka hyrë në zbatim. Nuk mund të krijohet një konfiskim i dytë.');
            l.title=STRATEGIC_LAWS[kind];l.majorReform=true;
        }else{
            l={id:'strategic:'+kind.toLowerCase()+':'+(++state.billCounter),title:STRATEGIC_LAWS[kind],desc:kind==='BOND'?'Huamarrje nga diaspora, interes fiks 5% në vit dhe maturitet 96 javë. Nuk është grant.':'Licencë strategjike kundrejt 0% tatim për investitorin e zgjedhur për 5 vjet.',proposer:'Qeveria e Kosovës',ministry:'Ministria e Financave',sector:'sec_econ',costB:0,duration:8,approvalEffect:0,status:'DRAFT',majorityType:'SIMPLE_61',requiredVotes:61,supportParties:state.coalitionParties.slice(),voteHistory:[],stageHistory:[{stage:'DRAFT',week:state.turnCount}],applied:false,majorReform:true,legalEffectMode:'PROCEDURAL'};
            initializeCatalogBill(l);state.laws.push(l);
        }
        l.strategicFinance=strategicFinanceRecord(kind,kind==='BOND'?amountB:0);
        state.historyLog.unshift('Nismë strategjike: '+l.title+'. Miratimi dhe kontrolli kushtetues përdorin procedurën ekzistuese.');
    });
}
function strategicBondAllowed(st,amount){return fiscalBorrowingAllowed(st,amount)&&fiscalAnnualInterestB(st)+amount*.05<=st.taxRevenueB*FISCAL_BORROWING_RULES.interestRevenueShare+1e-9;}
function strategicZoneCandidates(st){return (st.foreignInvestments?.bidders||[]).filter(b=>b.revealed&&['SIGNED','COMPLETED'].includes(b.status)&&fdiInvestor(b.investorId)?.capitalB>=.1);}
function strategicLicencePrice(b){return fiscalRound(Math.min(.15,Math.max(.025,fdiInvestor(b.investorId).capitalB*.2)));}
function activateStrategicLaw(l){
    const r=l?.strategicFinance;if(!r||r.receiptId||l.status!=='PASSED'||!l.applied||courtLawFrozen(l,state))return false;
    if(r.kind==='CONFISCATION'){r.status='RECOVERY_PENDING';return false;}
    if(r.kind==='BOND'){
        if(!strategicBondAllowed(state,r.amountB)){r.status='WAITING_CAPACITY';return false;}
        const d={id:'diaspora-bond:'+l.id,title:l.title,kind:'BORROW',data:{amountB:r.amountB,purpose:'INFRASTRUCTURE',maturityWeeks:96,temporary:false},costB:0,weeks:0,annualRevenueDelta:0,inflationDelta:0,savingB:0,turn:state.turnCount,year:state.year,status:'COMPLETED',startTurn:state.turnCount,lastTurn:state.turnCount,elapsed:0};
        fiscalAttachInstrument(d,state);d.instrument.annualRate=5;state.publicFinance.decisions.push(d);
        state.publicDebtPct=fiscalRound(state.publicDebtPct+r.amountB/FISCAL_GDP_B*100);
        fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+r.amountB),'Obligacionet e Diasporës: '+l.id,'BORROWING');r.contractId=d.id;crisisApproval(5);
    }else{
        const b=strategicZoneCandidates(state).find(b=>b.id===r.bidderId);
        if(!b||internationalIsolation(state)||foreignFundingBlocked(state)||securityFDIBlocked(state)){r.status='WAITING_INVESTOR';return false;}
        r.amountB=strategicLicencePrice(b);r.taxHolidayUntil=state.turnCount+5*FISCAL_WEEKS;
        fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+r.amountB),'Licenca e Zonës së Lirë: '+l.id,'REVENUE');
        applyInterestDecision('zone:'+l.id,{business:-10,public:-4,youth:3});
        createStreetProtest('Bizneset vendase dhe sindikatat kundërshtojnë privilegjet tatimore të zonës së lirë.','sec_econ',l.id);
    }
    r.receiptId=state.publicFinance.ledger.at(-1).id;r.activatedTurn=r.lastTurn=state.turnCount;r.status='ACTIVE';return true;
}
function realizeStrategicLaw(id,bidderId){return governmentCrisisCommit(()=>{
    const l=state.laws.find(l=>l.id===id),r=l?.strategicFinance;
    if(!r||r.receiptId||l.status!=='PASSED'||courtLawFrozen(l,state)||governmentCrisisPending())throw Error('Ligji nuk është në fuqi ose financimi është kryer.');
    if(r.kind==='ZONE'){if(!strategicZoneCandidates(state).some(b=>b.id===bidderId))throw Error('Zgjidhni një investitor të zbuluar me kontratë të nënshkruar.');r.bidderId=bidderId;}
    if(!activateStrategicLaw(l))throw Error(r.kind==='BOND'?'Kapaciteti i borxhit ose shërbimit të interesit nuk mjafton.':'Investitori ose financimi i jashtëm është i bllokuar.');
});}
function strategicBureauRecovery(l,base){return l.strategicFinance?.kind==='CONFISCATION'?.15:base;}
function syncStrategicBureauReceipt(l){
    const r=l.strategicFinance,receipt=l.bureauBattle?.confiscationReceipt||l.executiveChain?.ledgerId;
    if(r?.kind!=='CONFISCATION'||!receipt||r.receiptId)return;
    r.receiptId=receipt;r.activatedTurn=r.recoveryTurn=state.publicFinance.ledger.find(p=>p.id===receipt).turn;r.status='ACTIVE';r.amountB=state.publicFinance.ledger.find(p=>p.id===receipt).amountB;
    crisisApproval(8);applyInterestDecision('confiscation:'+l.id,{business:-12,public:8,youth:5});
}
function processStrategicEconomyWeek(turn){
    for(const l of strategicLaws(state)){
        syncStrategicBureauReceipt(l);
        const r=l.strategicFinance;if(turn<=r.lastTurn)continue;r.lastTurn=turn;
        if(r.kind==='CONFISCATION'){
            if(r.recoveryTurn!==null&&!r.sabotage&&turn>=r.recoveryTurn+12){const roll=Math.random();r.sabotage={turn,roll,triggered:roll<.35};if(roll<.35&&agendaExecutive())createStreetProtest('Grupet e prekura nga konfiskimet financojnë presion politik kundër reformës.','sec_justice',l.id);}
            continue;
        }
        if(!r.receiptId)continue;
        if(r.kind==='ZONE'){
            if(['ANNULLED','WITHDRAWN'].includes(l.status)&&r.status!=='REVOKED'){r.status='REVOKED';r.refundB=r.amountB;state.publicFinance.arrearsB=fiscalRound(state.publicFinance.arrearsB+r.refundB);}
            else if(r.status==='ACTIVE'&&turn>=r.taxHolidayUntil)r.status='TAXABLE';
        }else if(turn-r.activatedTurn>=12*(r.reviews.length+1)&&r.reviews.length<4){
            const invested=state.publicFinance.ledger.filter(p=>p.turn>=r.activatedTurn&&p.turn<=turn&&p.type==='CAPITAL_PAYMENT').reduce((n,p)=>n+Math.abs(p.amountB),0),required=r.amountB*Math.min(1,(r.reviews.length+1)*.25),poor=invested+1e-9<required;
            r.reviews.push({turn,investedB:fiscalRound(invested),requiredB:fiscalRound(required),poor});
            if(poor&&agendaExecutive()&&state.playerParty===r.issuer){state.governance.credibility=clamp(state.governance.credibility-8,0,100);crisisApproval(-4);state.historyLog.unshift('Diaspora: auditimi zbuloi mungesë investimesh nga huaja kombëtare. Borxhi dhe interesi mbeten detyrim.');}
        }
    }
}
function strategicZoneAnnualAdjustment(st){
    return strategicLaws(st).filter(l=>l.strategicFinance.kind==='ZONE'&&l.status==='PASSED'&&!courtLawFrozen(l,st)).reduce((sum,l)=>{
        const r=l.strategicFinance,b=(st.foreignInvestments?.bidders||[]).find(b=>b.id===r.bidderId);if(!r.receiptId||!b||b.status!=='COMPLETED'||r.status==='REVOKED')return sum;
        const exemption=st.turnCount<r.taxHolidayUntil?fdiInvestor(b.investorId).weeklyTaxB*FISCAL_WEEKS:0,spillover=st.turnCount-r.activatedTurn>=12?.001*FISCAL_WEEKS:0;
        return sum-exemption+spillover;
    },0);
}
function validateStrategicEconomy(st){
    const seen=new Set(),fail=()=>{throw Error('Paketa strategjike nuk rakordon me ligjin dhe financat.');};
    for(const l of strategicLaws(st)){
        const r=l.strategicFinance;if(r.version!==1||!Object.hasOwn(STRATEGIC_LAWS,r.kind)||seen.has(r.kind)||!st.parties[r.issuer]||!Number.isInteger(r.lastTurn)||r.lastTurn<0||r.lastTurn>st.turnCount||!Number.isFinite(r.amountB)||r.amountB<0||!['LEGISLATION','WAITING_CAPACITY','WAITING_INVESTOR','RECOVERY_PENDING','ACTIVE','TAXABLE','REVOKED'].includes(r.status)||!Array.isArray(r.reviews)||r.reviews.length>4||![0,r.amountB].includes(r.refundB))fail();seen.add(r.kind);
        if(r.receiptId){const p=st.publicFinance.ledger.find(p=>p.id===r.receiptId);if(!p||Math.abs(p.amountB-r.amountB)>1e-8||r.activatedTurn===null||p.turn!==r.activatedTurn||r.activatedTurn>st.turnCount)fail();
            if(r.kind==='BOND'){const d=st.publicFinance.decisions.find(d=>d.id===r.contractId);if(p.type!=='BORROWING'||p.source!=='Obligacionet e Diasporës: '+l.id||![.2,.3,.5].includes(r.amountB)||!d||d.data.amountB!==r.amountB||d.instrument.annualRate!==5||d.instrument.dueTurn!==r.activatedTurn+96)fail();}
            else if(r.kind==='ZONE'){const b=(st.foreignInvestments?.bidders||[]).find(b=>b.id===r.bidderId);if(p.type!=='REVENUE'||p.source!=='Licenca e Zonës së Lirë: '+l.id||!b||r.taxHolidayUntil!==r.activatedTurn+240||r.amountB!==strategicLicencePrice(b))fail();}
            else if(p.type!=='REVENUE'||p.source!=='Konfiskime të simuluara: '+l.id||![l.executiveChain?.ledgerId,l.bureauBattle?.confiscationReceipt].includes(r.receiptId))fail();
        }else if(r.activatedTurn!==null||r.contractId!==null||r.taxHolidayUntil!==null||r.refundB!==0||['ACTIVE','TAXABLE','REVOKED'].includes(r.status))fail();
        r.reviews.forEach((v,i)=>{const invested=st.publicFinance.ledger.filter(p=>p.turn>=r.activatedTurn&&p.turn<=v.turn&&p.type==='CAPITAL_PAYMENT').reduce((n,p)=>n+Math.abs(p.amountB),0);if(r.kind!=='BOND'||!Number.isInteger(v.turn)||v.turn<r.activatedTurn+12*(i+1)||v.turn>st.turnCount||!Number.isFinite(v.investedB)||v.investedB<0||Math.abs(v.investedB-invested)>1e-8||Math.abs(v.requiredB-r.amountB*(i+1)*.25)>1e-8||v.poor!==(v.investedB+1e-9<v.requiredB))fail();});
        if(r.sabotage&&(r.kind!=='CONFISCATION'||r.recoveryTurn===null||!Number.isInteger(r.sabotage.turn)||r.sabotage.turn<r.recoveryTurn+12||r.sabotage.turn>st.turnCount||!Number.isFinite(r.sabotage.roll)||r.sabotage.roll<0||r.sabotage.roll>=1||r.sabotage.triggered!==(r.sabotage.roll<.35)))fail();
    }
}
function openStrategicLegislation(){switchMainTab('tab-assembly');switchSubTab('ass','laws',document.querySelector('[data-assembly-tab="laws"]'));}
function renderStrategicEconomy(){
    const allowed=agendaExecutive()&&!governmentCrisisPending()&&!legislativeCampaignClosed(),e=catalogEscape;
    for(const hostId of ['strategicAssemblyPanel','strategicEconomyPanel']){
        const h=document.getElementById(hostId);if(!h)continue;
        h.innerHTML='<h3>Financimi strategjik i zhvillimit</h3><div class="pressure-grid">'+Object.entries(STRATEGIC_LAWS).map(([kind,title])=>{
            const l=strategicLaw(state,kind),r=l?.strategicFinance,id=hostId+'-'+kind;
            let html='<article class="card"><h4>'+e(title)+'</h4><p>'+({BOND:'€200–500M hua · interes 5%/vit · maturitet 96 javë · auditim çdo 12 javë.',CONFISCATION:'Zgjeron Byronë ekzistuese. Deri €150M rikuperim pas Vettingut, kontrollit gjyqësor dhe emërimit të drejtorit. Rrezik sabotimi.',ZONE:'Licencë €25–150M · taksa 0% për investitorin për 240 javë. Tatimet e tij pezullohen; konsumi dhe zinxhiri furnizues sjellin deri €1M/javë pas 12 javësh.'})[kind]+'</p>';
            if(!l)return html+(kind==='BOND'?'<select id="'+id+'"><option value="0.2">€200M</option><option value="0.3" selected>€300M</option><option value="0.5">€500M</option></select>':'')+'<button class="action-btn" '+(!allowed?'disabled':'')+' onclick="proposeStrategicLaw(\''+kind+'\','+(kind==='BOND'?'Number(document.getElementById(\''+id+'\').value)':0)+')">Propozo nismën</button></article>';
            html+='<p><strong>'+e(l.status)+' · '+e(r.status)+'</strong></p>'+(courtLawFrozen(l,state)?'<p class="crisis-warning">I pezulluar nga Gjykata. Arkëtimi pret vendimin dhe hyrjen në fuqi.</p>':'')+'<button class="action-btn" onclick="openStrategicLegislation()">Hap procedurën në Kuvend</button>';
            if(l.status==='PASSED'&&!r.receiptId&&!courtLawFrozen(l,state)){
                if(kind==='BOND')html+='<button class="action-btn" '+(!allowed?'disabled':'')+' onclick="realizeStrategicLaw(\''+e(l.id)+'\')">Emeto huanë · kontrollo kapacitetin</button>';
                if(kind==='ZONE'){const rows=strategicZoneCandidates(state);html+='<select id="'+id+'"><option value="">Zgjidh investitorin e zbuluar</option>'+rows.map(b=>'<option value="'+e(b.id)+'">'+e(fdiInvestor(b.investorId).company)+' · '+enterpriseMoney(strategicLicencePrice(b))+'</option>').join('')+'</select><button class="action-btn" '+(!allowed||!rows.length?'disabled':'')+' onclick="realizeStrategicLaw(\''+e(l.id)+'\',document.getElementById(\''+id+'\').value)">Nënshkruaj licencën</button><p>Kërkohet IHD e nënshkruar ose e realizuar. Gjigantët ruajnë kushtet dhe rrallësinë e sistemit ekzistues.</p>';}
                if(kind==='CONFISCATION')html+='<p>Vettingu: '+e(state.justiceReform.status)+' · drejtori dhe zbatimi ndiqen te Zbatimi i Ligjeve.</p>';
            }
            if(r.receiptId)html+='<p>Arkëtuar: '+enterpriseMoney(r.amountB)+(r.kind==='BOND'?' · borxh i regjistruar, jo grant':'')+'</p>';
            if(r.contractId){const c=state.publicFinance.decisions.find(d=>d.id===r.contractId)?.instrument;if(c)html+='<p>Kontrata: '+e(c.status)+' · principal i mbetur '+enterpriseMoney(c.remainingB)+' · interes '+c.annualRate+'% · edhe '+Math.max(0,c.dueTurn-state.turnCount)+' javë deri në maturim.</p>';}
            if(r.taxHolidayUntil!==null)html+='<p>Edhe '+Math.max(0,r.taxHolidayUntil-state.turnCount)+' javë lehtësi tatimore.</p>';
            if(r.reviews.length)html+='<p>Auditime: '+r.reviews.length+' · problematike: '+r.reviews.filter(v=>v.poor).length+'</p>';
            return html+'</article>';
        }).join('')+'</div>';
    }
}
POLITICAL_EXECUTIVE_ACTIONS.push('proposeStrategicLaw','realizeStrategicLaw');
