/* Phase 8: approval remains the sole national approval value. This ledger only
   limits changes within the existing weekly clock; it is not another popularity score. */
function migratePublicSupport(st){
    if(st.publicSupport===undefined)st.publicSupport={version:1,turn:st.turnCount,gained:0,lost:0,sources:{}};
}
function validatePublicSupport(st){
    if(st.publicSupport===undefined)return;
    var p=st.publicSupport;
    if(!p || p.version!==1 || !Number.isInteger(p.turn) || p.turn<0 || p.turn>st.turnCount || !Number.isFinite(p.gained) || p.gained<0 || p.gained>1.500001 || !Number.isFinite(p.lost) || p.lost<0 || p.lost>3.000001 || !p.sources || typeof p.sources!=='object' || Array.isArray(p.sources))throw Error('Regjistri i reagimit publik është i pavlefshëm.');
    Object.values(p.sources).forEach(function(v){if(!Number.isFinite(v) || v<0)throw Error('Ndikimi publik i ruajtur është i pavlefshëm.');});
    if(p.rtkRawLost!==undefined&&(!Number.isFinite(p.rtkRawLost)||p.rtkRawLost< p.lost-1e-8||p.rtkRawLost>3.000001))throw Error('Kufiri i humbjeve publike të RTK-së është i pavlefshëm.');
}
function adjustPublicSupport(delta,context,st){
    st=st || state;context=context || {};if(!Number.isFinite(delta) || !delta)return 0;
    migratePublicSupport(st);
    var p=st.publicSupport;
    if(p.turn!==st.turnCount){p.turn=st.turnCount;p.gained=0;p.lost=0;p.sources={};delete p.rtkRawLost;}
    var source=context.source || 'decision',positive=delta>0;
    // Communication and a new promise alone are not evidence of better services.
    if(positive && /issueQuickPressRelease|publishPressRelease|issuePublicStatement|submitPressAnswer|finishFullPressConference|runParliamentaryInterpellation/.test(source))return 0;
    var magnitude=Math.abs(delta)*(context.implemented ? 1 : (positive ? .2 : .4));
    if(!positive&&typeof diasporaLossMultiplier==='function')magnitude*=diasporaLossMultiplier(st);
    if(context.scope==='LOCAL')magnitude*=.08;
    if(context.sectorId){
        var sector=(st.stateSectors||[]).find(function(s){return s.id===context.sectorId;});
        // A sectoral result reaches a limited audience. Weak services first need
        // to improve before a positive national reaction becomes plausible.
        if(positive)magnitude*=.45*(sector?Math.max(0,Math.min(1,(sector.score-35)/40)):.5);
    }
    if(positive){
        if(context.implemented && (!st.governmentFormed || st.governmentStatus!=='IN_OFFICE'))return 0;
        magnitude*=Math.min(1,Math.max(0,(95-st.approval)/45));
        var key='gain:'+source,used=p.sources[key] || 0;
        magnitude=Math.min(magnitude,.45,Math.max(0,.45-used),Math.max(0,1.5-p.gained));
        var next=Math.max(st.approval,Math.min(95,st.approval+magnitude)),actual=next-st.approval;
        st.approval=next;p.gained+=actual;p.sources[key]=used+actual;if(typeof interestPublicReaction==='function')interestPublicReaction(st,actual,context);return actual;
    }
    magnitude=Math.min(magnitude,.9,Math.max(0,3-(p.rtkRawLost??p.lost)));
    var next=Math.min(st.approval,Math.max(5,st.approval-magnitude)),actual=st.approval-next;
    var rawLoss=actual;if(rtkProtected(st)||p.rtkRawLost!==undefined)p.rtkRawLost=(p.rtkRawLost??p.lost)+rawLoss;actual=-rtkApplyApproval(st,-rawLoss);p.lost+=actual;if(typeof interestPublicReaction==='function')interestPublicReaction(st,-actual,context);return -actual;
}
function publicSupportReaction(delta,stage){
    if(stage==='PROMISE')return 'Zotimi është regjistruar; publiku pret realizimin e tij.';
    if(delta<0)return 'Vendimi mund të nxisë pakënaqësi te grupet e prekura.';
    if(stage==='IMPLEMENTATION')return 'Reagimi publik varet nga ecuria e zbatimit dhe shërbimet që përmirësohen.';
    if(delta>0)return 'Pala e interesuar e mirëpret hapin; vlerësimi i publikut kërkon rezultate.';
    return 'Nuk pritet ndryshim i menjëhershëm në qëndrimin e publikut.';
}
function publicSupportConsequence(text){
    // Older saves may retain the previous numeric wording in pending dossiers.
    return String(text || '').replace(/\s*\([+-]?\d+(?:\.\d+)?%\s*(?:mbështetje|popullaritet)[^)]*\)/gi,'')
        .replace(/[+-]\d+(?:\.\d+)?%\s*(?:mbështetje(?: publike)?|popullaritet(?: vendor)?)/gi,'pakënaqësi publike');
}
function weeklyPublicSupportReaction(delta){
    return delta>.05?'Qëndrimi publik po përmirësohet gradualisht.':delta<-.05?'Pakënaqësia publike është shtuar këtë javë.':'Qëndrimi publik mbetet kryesisht i qëndrueshëm.';
}
function adjustLocalPublicSupport(m,progress,profile){
    if(!m || !profile || !Number.isFinite(progress) || progress<=0)return;
    // Reuse the existing local approval and satisfaction. Projects in struggling
    // municipalities must first deliver a visible service improvement.
    var reception=Math.max(0,Math.min(1,((profile.citizenSatisfaction ?? 50)-50)/40));
    if(!reception)return;
    m.localSupportPlayer=Math.max(5,Math.min(95,(m.localSupportPlayer ?? 35)+Math.min(1,progress)*reception*.8));
}
function recordBrokenPublicPromise(pr){
    if(pr.publicTrustPenaltyApplied)return;
    pr.publicTrustPenaltyApplied=true;
    adjustPublicSupport(-4,{source:'broken-promise:'+pr.id});
    var campaign=state.electionCampaign;
    if(campaign && campaign.moduleVersion===3 && campaign.status==='ACTIVE')campaign.credibility=Math.max(0,campaign.credibility-2);
}
function publicPromiseCredibility(st){
    st=st || state;
    var promises=st.promises || [],fulfilled=promises.filter(function(p){return p.fulfilled;}).length;
    var missed=promises.filter(function(p){return p.publicTrustPenaltyApplied || !p.fulfilled && p.deadlineWeeks<=0;}).length;
    return Math.max(0,Math.min(100,Math.round(65+fulfilled*10-missed*8)));
}
