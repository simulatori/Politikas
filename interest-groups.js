const INTEREST_GROUPS={youth:{label:'Rinia',weight:.3},pensioners:{label:'Pensionistët',weight:.25},business:{label:'Bizneset',weight:.25},public:{label:'Sektori Publik',weight:.2}};
function migrateInterestGroups(st){if(st.interestGroups===undefined)st.interestGroups={version:1,groups:Object.fromEntries(Object.keys(INTEREST_GROUPS).map(k=>[k,st.approval])),anchor:st.approval,seen:[]};}
function factionMean(groups){return Object.keys(INTEREST_GROUPS).reduce((sum,k)=>sum+groups[k]*INTEREST_GROUPS[k].weight,0);}
function factionProjection(groups,target){
    var result={...groups};for(var i=0;i<12;i++){var gap=target-factionMean(result);if(Math.abs(gap)<1e-9)break;var keys=Object.keys(INTEREST_GROUPS).filter(k=>gap>0?result[k]<95:result[k]>5),weight=keys.reduce((s,k)=>s+INTEREST_GROUPS[k].weight,0);if(!weight)break;keys.forEach(k=>result[k]=clamp(result[k]+gap/weight,5,95));}return result;
}
function syncInterestGroups(st){st=st||state;migrateInterestGroups(st);st.interestGroups.groups=factionProjection(st.interestGroups.groups,st.approval);st.interestGroups.anchor=factionMean(st.interestGroups.groups);}
function applyInterestDecision(key,deltas,st){
    st=st||state;migrateInterestGroups(st);var d=st.interestGroups;if(d.seen.includes(key))return false;syncInterestGroups(st);Object.keys(INTEREST_GROUPS).forEach(k=>d.groups[k]=clamp(d.groups[k]+(deltas[k]||0),5,95));rtkApplyApproval(st,factionMean(d.groups)-st.approval);d.groups=factionProjection(d.groups,st.approval);d.anchor=st.approval;d.seen.push(key);return true;
}
function interestTaxDecision(decision,oldRates){
    var data=decision.data,change=((data.vat-oldRates.vat)+(data.incomeTax-oldRates.incomeTax)+(data.corporateTax-oldRates.corporateTax)+(data.customs-oldRates.customs))/4;
    applyInterestDecision('tax:'+decision.id,{youth:-.6*change,pensioners:-.3*change,business:-1.8*change,public:1.2*change});
}
function interestLawResult(law,result){
    if(!result.passed)return;var sector=law.sector,deltas={youth:.2,pensioners:.2,business:.2,public:.2};
    if(sector==='sec_edu')deltas={youth:1.8,pensioners:0,business:.4,public:1};
    if(sector==='sec_social')deltas={youth:.3,pensioners:2,business:-.2,public:.5};
    if(sector==='sec_econ'||law.fdiBidderId||law.fdiOfferId)deltas={youth:1,pensioners:0,business:1.8,public:-.3};
    applyInterestDecision('law:'+law.id,deltas);
}
function interestPublicReaction(st,delta,context){
    migrateInterestGroups(st);var d=st.interestGroups;
    // Recover the pre-reaction national value, then retain different sector reactions.
    d.groups=factionProjection(d.groups,clamp(st.approval-delta,5,95));
    var profiles={sec_edu:{youth:1.8,public:1.3,pensioners:.2,business:.7},sec_social:{youth:.5,public:1,pensioners:2,business:.5},sec_econ:{youth:1.3,public:.5,pensioners:.3,business:1.6},sec_health:{youth:.7,public:1.4,pensioners:1.5,business:.4}},weights=profiles[context.sectorId];
    Object.keys(INTEREST_GROUPS).forEach(k=>d.groups[k]=clamp(d.groups[k]+delta*(weights?.[k]??1),5,95));d.groups=factionProjection(d.groups,st.approval);d.anchor=factionMean(d.groups);
}
function validateInterestGroups(st){var d=st.interestGroups;if(d===undefined)return;if(!d||d.version!==1||!d.groups||Object.keys(d.groups).length!==4||Object.keys(INTEREST_GROUPS).some(k=>!Number.isFinite(d.groups[k])||d.groups[k]<5||d.groups[k]>95)||!Number.isFinite(d.anchor)||Math.abs(d.anchor-factionMean(d.groups))>1e-7||!Array.isArray(d.seen)||d.seen.some(k=>typeof k!=='string')||new Set(d.seen).size!==d.seen.length)throw Error('Grupet e interesit janë të pavlefshme.');}
function renderInterestGroups(){var host=document.getElementById('interestGroupsPanel');if(!host)return;var groups=factionProjection(state.interestGroups?.groups||Object.fromEntries(Object.keys(INTEREST_GROUPS).map(k=>[k,state.approval])),state.approval);host.innerHTML='<h3>Grupet e interesit</h3><p>Mbështetja kombëtare është mesatarja e peshuar e katër grupeve.</p><div class="interest-group-grid">'+Object.entries(INTEREST_GROUPS).map(([k,g])=>'<article><strong>'+g.label+'</strong><span>'+groups[k].toFixed(1)+'%</span><progress max="100" value="'+groups[k]+'" aria-label="'+g.label+'"></progress><small>Pesha '+g.weight*100+'%</small></article>').join('')+'</div>';}
