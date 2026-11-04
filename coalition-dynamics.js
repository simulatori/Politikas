/* Coalition demands belong to one bill version. Payments commit with the vote. */
var coalitionDemandContext=null;
function coalitionMajorBill(l){return !!(l && (l.annualBudgetYear || l.fdiBidderId || l.fdiOfferId || l.constitutionChange || l.majorReform || (l.costB||0)>=.1));}
function coalitionDemandPartners(l){
    if(!coalitionMajorBill(l)||!agendaExecutive(state)||!(l.proposer||'').startsWith('Qeveria'))return [];
    return state.coalitionParties.filter(function(p){return p!==state.playerParty && state.mps.some(function(m){return m.party===p;});});
}
function coalitionDemandKey(l){return JSON.stringify([l.id,l.version||1,state.playerParty,coalitionDemandPartners(l).slice().sort()]);}
function coalitionDemandCost(p){return Math.min(10,Math.max(1,Math.ceil(state.mps.filter(function(m){return m.party===p;}).length/5)))/1000;}
function coalitionDemandDecision(l,p){return l.coalitionDemands?.key===coalitionDemandKey(l)?l.coalitionDemands.decisions.find(function(d){return d.party===p;}):null;}
function coalitionDemandGate(l,continuation){
    var p=coalitionDemandPartners(l).find(function(p){return !coalitionBlackmailProtected(l,p)&&!coalitionDemandDecision(l,p);});if(!p)return false;
    coalitionDemandContext={lawId:l.id,key:coalitionDemandKey(l),party:p,continuation:continuation||null};
    var e=catalogEscape,seats=state.mps.filter(function(m){return m.party===p;}).length,cost=coalitionDemandCost(p);
    document.getElementById('coalitionDemandContent').innerHTML='<h2 id="coalitionDemandTitle">Partneri i Koalicionit po kushtëzon votat!</h2><div class="political-outcome political-outcome--pending"><strong>'+e(state.parties[p].short)+' · '+seats+' deputetë</strong><p>'+e(l.title)+'</p></div><p>Kërkojmë €'+(cost*1000).toFixed(0)+'M nga arka për paketën e zbatimit të marrëveshjes politike.</p><p>Pagesë e vetme, e regjistruar kur finalizohet votimi. Nuk rrit automatikisht cilësinë e sektorëve.</p><div class="candidate-actions"><button class="action-btn btn-gold" onclick="resolveCoalitionDemand(true)">Prano · €'+(cost*1000).toFixed(0)+'M</button><button class="action-btn btn-danger" onclick="resolveCoalitionDemand(false)">Refuzo · Partneri abstenon</button><button class="action-btn" onclick="closeCoalitionDemand()">Kthehu pa vendim</button></div><p class="coalition-demand-note">Pranimi siguron votat e këtij grupi për këtë version. Pragu ligjor, kuorumi dhe votat e partive të tjera mbeten të vlefshme. Refuzimi dhe rrëzimi i ligjit sjellin humbje mbështetjeje; pa ligjin e lehtësirave, investimi rrezikon afatin.</p>';
    toggleModal('coalitionDemandModal',true);return true;
}
function closeCoalitionDemand(){coalitionDemandContext=null;toggleModal('coalitionDemandModal',false);}
function resolveCoalitionDemand(accept){
    var c=coalitionDemandContext,l=c && state.laws.find(function(l){return l.id===c.lawId;});
    if(!l || c.key!==coalitionDemandKey(l)||state.pendingVote||_voteInProgress||weeklyProcessing||!['DRAFT','SUBMITTED','UNDER_REVIEW','SCHEDULED'].includes(l.status)||coalitionDemandDecision(l,c.party)){closeCoalitionDemand();return false;}
    var before=JSON.stringify(state),cost=coalitionDemandCost(c.party),already=(l.coalitionDemands?.key===c.key?l.coalitionDemands.decisions:[]).filter(function(d){return d.accepted&&!d.paid;}).reduce(function(t,d){return t+d.costB;},0);
    if(accept && (state.budgetTotalB<cost+already+(l.annualBudgetYear?0:l.costB||0)||!fiscalSpendingCheck(cost+already,false).allowed)){showToast('Arka ose autorizimi buxhetor nuk mbulon kërkesën dhe ligjin.');return false;}
    if(!l.coalitionDemands || l.coalitionDemands.key!==c.key)l.coalitionDemands={key:c.key,decisions:[]};
    l.coalitionDemands.decisions.push({party:c.party,accepted:!!accept,costB:cost,paid:false});
    if(accept&&c.party==='SL')recordLeakRisk('FAVOUR','coalition:'+l.id+':'+(l.version||1)+':'+c.party,null);
    if(!saveGameAuto()){state=JSON.parse(before);showToast('Vendimi nuk u ruajt. Provoni përsëri.');return false;}
    closeCoalitionDemand();beginLawVote(l,c.continuation);return true;
}
function coalitionDemandBallot(l,mp,ballot){
    if(agendaExecutive(state)&&(l.proposer||'').startsWith('Qeveria')&&mp.party===state.playerParty)return 'pro';
    if(!coalitionMajorBill(l)){
        if(agendaExecutive(state)&&(l.proposer||'').startsWith('Qeveria')&&state.coalitionParties.includes(mp.party)&&!lawNegotiationRecord(l,mp.party))return 'pro';
        return ballot;
    }
    if(!coalitionDemandPartners(l).includes(mp.party))return ballot;
    if(coalitionBlackmailProtected(l,mp.party))return 'pro';
    var d=coalitionDemandDecision(l,mp.party);return d&&d.accepted?'pro':'abstenim';
}
function coalitionDemandFinalize(l,result){
    var partners=coalitionDemandPartners(l),refused=false;
    partners.forEach(function(p){if(coalitionBlackmailProtected(l,p))return;var d=coalitionDemandDecision(l,p);if(!d)throw Error('Mungon vendimi i partnerit.');if(d.accepted&&!d.paid){var check=fiscalSpendingCheck(d.costB,false);if(!check.allowed||state.budgetTotalB<d.costB+(l.annualBudgetYear?0:l.costB||0))throw Error('Nuk ka fonde për marrëveshjen.');fiscalSetBalance(state,'budgetTotalB',+(state.budgetTotalB-d.costB).toFixed(9),'Marrëveshja e koalicionit: '+p+' · '+l.id,'EXPENSE');d.paid=true;}if(!d.accepted)refused=true;});
    if(refused&&!result.passed){
        adjustPublicSupport(-3,{source:'coalitionDemandFailure'},state);
        // Investment withdrawal is processed on the next economic week so its
        // clock, failure receipt and sunk cofinancing remain consistent.
    }
}
function coalitionBlockedInvestment(l){return !!(l && l.status==='FAILED' && l.coalitionDemands?.decisions.some(function(d){return !d.accepted;}));}
function validateCoalitionDemands(st){
    st.laws.forEach(function(l){var c=l.coalitionDemands;if(c===undefined)return;if(!c||typeof c.key!=='string'||c.key.length>2000||!Array.isArray(c.decisions)||c.decisions.length>Object.keys(st.parties).length)throw Error('Marrëveshje koalicioni e pavlefshme.');var seen=new Set();c.decisions.forEach(function(d){if(!d||!st.parties[d.party]||seen.has(d.party)||typeof d.accepted!=='boolean'||typeof d.paid!=='boolean'||!Number.isFinite(d.costB)||d.costB<.001||d.costB>.01||d.paid&&!d.accepted)throw Error('Kërkesë koalicioni e pavlefshme.');seen.add(d.party);});});
}
