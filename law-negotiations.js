/* Phase 7: bill-specific agreements; mandates and the voting procedure stay in the assembly engine. */
const LAW_NEG_STATUS={OPEN:'Në bisedime',CONSULTING:'Në konsultim',CONDITIONAL:'Mbështetje me kushte',AGREED:'Marrëveshje aktive',FAILED:'Pa marrëveshje',ENDED:'Bisedime të ndërprera',WITHDRAWN:'Mbështetja u tërhoq',EXPIRED:'Afati kaloi'};
const LAW_NEG_TOPICS=['Ekonomia dhe financat','Arsimi','Shëndetësia','Drejtësia','Siguria','Politika e jashtme','Mjedisi dhe infrastruktura','Administrata publike'];
const LAW_NEG_PRIORITIES={LVV:[1,3,7],PDK:[0,6],LDK:[0,1,2],AAK:[4,6],SL:[7],MIN_MULTI:[1,7]};
const LAW_NEG_THRESHOLD=65,LAW_NEG_PRIORITY_POINTS=17,LAW_NEG_OTHER_TOPIC_POINTS=-8;
const LAW_NEG_INTERESTS={LVV:'Shërbimet publike, drejtësia dhe përgjegjësia institucionale',PDK:'Financimi i zhvillimit ekonomik dhe infrastruktura',LDK:'Qëndrueshmëria financiare, arsimi dhe shëndetësia',AAK:'Siguria dhe projektet infrastrukturore',SL:'Kompetencat lokale dhe garancitë për komunitetin serb',MIN_MULTI:'Përfshirja e komuniteteve dhe qasja në arsim e shërbime'};
function lawNegotiationVoice(p){return ({LVV:'Kërkojmë përgjegjësi publike. ',PDK:'Duhet të shohim shifra dhe financim të zbatueshëm. ',LDK:'Vendimi kërkon plan të qartë dhe kujdes financiar. ',AAK:'Duam hapa konkretë dhe afate të qarta. ',SL:'Garancitë për komunitetin tonë janë thelbësore. ',MIN_MULTI:'Komunitetet duhet të dëgjohen në këtë proces. '})[p] || '';}
function migrateLawNegotiations(st){
    var cycle=deputyCycleId(st);
    if(!st.lawNegotiations)st.lawNegotiations={version:1,cycleId:cycle,records:[],deadlines:{},archives:[]};
    var data=st.lawNegotiations;
    if(data.cycleId===undefined)data.cycleId=cycle;
    if(!data.archives)data.archives=[];
    if(data.cycleId!==cycle){
        data.archives.push({cycleId:data.cycleId,records:data.records,deadlines:data.deadlines});
        data.cycleId=cycle;data.records=[];data.deadlines={};
    }
}
function validateLawNegotiations(st){
    if(!st.lawNegotiations)return;
    var data=st.lawNegotiations,keys=new Set();
    if(data.version!==1 || !Array.isArray(data.records) || !data.deadlines || typeof data.deadlines!=='object')throw Error('Negociatat e ruajtura janë të pavlefshme.');
    Object.values(data.deadlines).forEach(function(d){if(!Number.isInteger(d))throw Error('Afati i ruajtur është i pavlefshëm.');});
    data.records.forEach(function(n){
        if(!n || typeof n!=='object')throw Error('Marrëveshja e ruajtur është e pavlefshme.');
        var key=n.lawId+':'+n.partyId;
        if(keys.has(key) || !st.parties[n.partyId] || !st.parties[n.initiator] || !LAW_NEG_STATUS[n.status] || !Array.isArray(n.conditions) || !Array.isArray(n.history) || !Array.isArray(n.used) || !Number.isInteger(n.dueTurn) || !Number.isFinite(n.score) || !Number.isFinite(n.initialScore) || n.status==='CONSULTING' && !Number.isInteger(n.readyTurn))throw Error('Marrëveshja e ruajtur është e pavlefshme.');
        n.conditions.forEach(function(c){if(!c || !['REPORT','AMENDMENT','FUNDING'].includes(c.kind) || typeof c.text!=='string' || typeof c.accepted!=='boolean' || typeof c.fulfilled!=='boolean' || !Number.isFinite(c.costB) || c.costB<0 || c.kind==='FUNDING' && c.accepted && !Number.isFinite(c.minimumCostB))throw Error('Kushti i ruajtur është i pavlefshëm.');});
        n.conditions.forEach(function(c){if(c.budgetMinistryId!==undefined && (c.kind!=='FUNDING' || !st.ministries.some(function(m){return m.id===c.budgetMinistryId;}) || !Number.isFinite(c.minimumAllocationM) || c.minimumAllocationM<0 || c.minimumAllocationM>10000))throw Error('Ndarja e negociuar e projektbuxhetit është e pavlefshme.');});
        n.history.forEach(function(h){if(!h || !Number.isInteger(h.turn) || typeof h.text!=='string')throw Error('Historiku i negociatave është i pavlefshëm.');});keys.add(key);
    });
}
function lawNegotiationEligible(l){return !!l && !l.internationalAgreementId && ['DRAFT','SUBMITTED','UNDER_REVIEW','SCHEDULED'].includes(l.status);}
function lawNegotiationAuthority(l){return lawNegotiationEligible(l) && (l.proposer || '').startsWith('Qeveria') ? agendaExecutive() : lawNegotiationEligible(l) && (l.supportParties || []).includes(state.playerParty) && state.mps.some(function(m){return m.party===state.playerParty;});}
function lawNegotiationTopic(l){
    var t=((l.title||'')+' '+(l.field||'')+' '+(l.sector||'')+' '+(l.ministry||'')).toLowerCase();
    if(/arsim|edu|shkoll/.test(t))return 1;if(/shënd|health|spital/.test(t))return 2;if(/drejt|justice|veting|pasuris/.test(t))return 3;if(/siguri|mbrojt|defen|polici/.test(t))return 4;if(/jasht|ndërkomb|diplom/.test(t))return 5;if(/mjedis|infrastr|energ|transport|ndërt/.test(t))return 6;if(/admin|komun|lokal|komunit|gjuh/.test(t))return 7;return 0;
}
function lawNegotiationScoreParts(l,p){
    var topic=lawNegotiationTopic(l),recorded=state.parties[state.playerParty].relations[p.id],rel=recorded ?? 50;
    var broken=(state.lawNegotiations?.records || []).filter(function(n){return n.partyId===p.id && n.status==='WITHDRAWN';}).length;
    var priority=(LAW_NEG_PRIORITIES[p.id]||[7]).includes(topic),coalition=state.coalitionParties.includes(p.id)?18:0,opinion=(state.approval-50)*.15,unfunded=(l.costB||0)>state.budgetTotalB?20:0;
    return {relation:Number.isFinite(recorded)?recorded:null,priority:priority,topic:topic,coalition:coalition,opinion:opinion,broken:broken,unfunded:unfunded,score:Math.round(28+rel*.3+coalition+(priority?LAW_NEG_PRIORITY_POINTS:LAW_NEG_OTHER_TOPIC_POINTS)+opinion-broken*10-unfunded)};
}
function lawNegotiationScore(l,p){return lawNegotiationScoreParts(l,p).score;}
function lawNegotiationRelationshipLabel(p){
    var player=state.parties[state.playerParty],r=player.relations[p.id];
    if(!Number.isFinite(r))return 'Marrëdhënia '+(player.short||player.id)+' → '+(p.short||p.id)+': nuk është regjistruar';
    return 'Marrëdhënia '+(player.short||player.id)+' → '+(p.short||p.id)+': '+r+'/100 · '+(r<20?'Shumë e dobët':r<40?'E dobët':r<60?'Mesatare':r<80?'E mirë':'E lartë');
}
function lawNegotiationRecord(l,p){if(state.lawNegotiations.cycleId!==deputyCycleId(state))return undefined;return state.lawNegotiations.records.find(function(n){return n.lawId===l.id && n.partyId===p;});}
function lawNegotiationLog(n,text){n.history.push({turn:state.turnCount,text:text});}
function lawPoliticalOutcomeMarkup(l,n){
    var active=n && n.status==='AGREED' && state.turnCount<=n.dueTurn && lawAgreementReady(l,n);
    var pending=n && ['OPEN','CONSULTING','CONDITIONAL'].includes(n.status) && state.turnCount<=n.dueTurn;
    var tone=active?'success':pending?'pending':n?'failure':'neutral';
    var title=active?'✓ Mbështetja u konfirmua':pending?'◷ Ende pa marrëveshje':n?'✕ Nuk ka mbështetje aktive':'— Pa marrëveshje';
    var text=active?'Marrëveshje aktive për këtë projektligj. Votimi mbetet i veçantë.':pending?n.status==='CONDITIONAL'?'Mbështetja është me kushte; plotëso zotimet.':n.status==='CONSULTING'?'Grupi është në konsultim.':'Bisedimet vazhdojnë; mbështetja nuk është konfirmuar.':n?LAW_NEG_STATUS[n.status]+'.':'Bisedimet nuk kanë filluar.';
    return '<div class="political-outcome political-outcome--'+tone+'" role="status"><strong>'+catalogEscape(title)+'</strong><p>'+catalogEscape(text)+'</p></div>';
}
function lawNegotiationCommit(change){
    if(state.pendingVote || weeklyProcessing)return false;
    var before=JSON.stringify(state);
    try{change();validateLawNegotiations(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}catch(e){state=JSON.parse(before);showToast(e.message);return false;}
    refreshAllUI();
    if(typeof showGovernmentNotification==='function'){
        var previous=JSON.parse(before).lawNegotiations.records;
        state.lawNegotiations.records.forEach(function(n){
            var old=previous.find(function(x){return x.lawId===n.lawId && x.partyId===n.partyId;});
            if(!old || old.status===n.status || !['AGREED','FAILED','ENDED','WITHDRAWN','EXPIRED'].includes(n.status))return;
            var l=state.laws.find(function(x){return x.id===n.lawId;}),ok=n.status==='AGREED';
            showGovernmentNotification({audience:"POLITICAL",title:ok?'Mbështetja u konfirmua':'Nuk u arrit marrëveshja',message:state.parties[n.partyId].short+': '+LAW_NEG_STATUS[n.status]+'.',status:ok?'success':'failure',details:[l.title]});
        });
    }
    return true;
}
function startLawNegotiation(i,partyId){
    var l=state.laws[i],p=state.parties[partyId];if(!lawNegotiationAuthority(l) || !p || p.id===state.playerParty)return false;
    migrateLawNegotiations(state);if(lawNegotiationRecord(l,partyId))return false;
    return lawNegotiationCommit(function(){
        var d=state.lawNegotiations.deadlines;if(d[l.id]===undefined)d[l.id]=state.turnCount+4;
        l.negotiationDeadlineTurn=d[l.id];
        if(state.turnCount>d[l.id])throw Error('Afati i negociatave ka kaluar; projektligji mund të vazhdojë në procedurën parlamentare.');
        var topic=lawNegotiationTopic(l),score=lawNegotiationScore(l,p),kind=(partyId==='PDK'||topic===0||topic===6)?'FUNDING':(partyId==='SL'||partyId==='MIN_MULTI')?'AMENDMENT':'REPORT';
        var text=kind==='FUNDING'?'Shtesë financimi për '+LAW_NEG_TOPICS[topic]+', me raportim publik të shpenzimeve.':kind==='AMENDMENT'?'Konsultim i detyrueshëm me komunitetet e prekura para zbatimit të masave për '+LAW_NEG_TOPICS[topic]+'.':'Publikimi i planit të zbatimit për '+LAW_NEG_TOPICS[topic]+', me përgjegjësi ministrore dhe afate javore.';
        state.lawNegotiations.records.push({lawId:l.id,partyId:p.id,leader:p.leader,initiator:state.playerParty,status:'OPEN',initialScore:score,score:score,dueTurn:d[l.id],used:[],conditions:[{kind:kind,text:text,costB:kind==='FUNDING'?Math.max(.001,Math.round((l.costB||.01)*100)/1000):0,accepted:false,fulfilled:false}],history:[{turn:state.turnCount,text:p.leader+': '+(score>=60?'Qëllimi na afron. Duhet të sqarojmë zbatimin.':score>=40?'Do ta shqyrtojmë, por kërkojmë garanci konkrete.':'Kemi kundërshtime thelbësore. Një takim nuk mjafton për ta ndryshuar qëndrimin.')} ]});
    });
}
function lawConditionMet(l,c){
    if(!c.accepted)return false;
    if(c.kind==='REPORT')return !!c.plan && !!(l.negotiationPlans||[]).find(function(p){return p.id===c.plan && p.text===c.text;});
    if(l.annualBudgetYear && c.kind==='FUNDING'){
        var row=l.annualBudgetPlan?.allocations.find(function(a){return a.id===c.budgetMinistryId;});
        return (l.desc||'').includes(c.text) && !!row && Number.isFinite(c.minimumAllocationM) && row.budgetM+1e-8>=c.minimumAllocationM && l.annualBudgetPlan.plannedB+1e-8>=c.minimumCostB;
    }
    return (l.desc||'').includes(c.text) && (c.kind!=='FUNDING' || (l.costB||0)>=c.minimumCostB && (['PASSED','FAILED'].includes(l.status) || state.budgetTotalB>=l.costB));
}
function lawAgreementReady(l,n){return n.conditions.every(function(c){return lawConditionMet(l,c);});}
function applyNegotiatedBudgetFunding(l,c){
    var b=state.publicFinance.budgets[l.annualBudgetYear],plan=l.annualBudgetPlan;
    if(!agendaExecutive() || !plan || !b || b.lawId!==l.id || b.status==='APPROVED' || l.applied || !Number.isFinite(c.costB) || c.costB<=0)throw Error('Ndryshimi kërkon projektbuxhetin aktiv, ende të pamiratuar, dhe kompetencë qeveritare.');
    // Resolve the existing negotiation topic to its responsible ministry; never a party-specific exception.
    var ministry=['mfpt','mashti','msh','md','mpb','mpjd','mmphi','mapl'][lawNegotiationTopic(l)];
    var allocations=plan.allocations.map(function(a){return {id:a.id,budgetM:a.budgetM};});
    var row=allocations.find(function(a){return a.id===ministry;});
    if(!row || !state.ministries.some(function(m){return m.id===ministry;}) || !Number.isFinite(row.budgetM))throw Error('Ndarja e ministrisë për kushtin nuk është e identifikueshme.');
    row.budgetM=fiscalRound(row.budgetM+c.costB*1000);
    if(row.budgetM>10000)throw Error('Shtesa e negociuar kalon kufirin e ndarjes së ministrisë.');
    var interest=plan.interestB||0,total=fiscalRound(allocations.reduce(function(sum,a){return sum+a.budgetM/1000;},0)+plan.capitalB+interest+(plan.sectorQualityB||0));
    if(!Number.isFinite(total) || !Number.isFinite(interest) || !Number.isFinite(plan.capitalB))throw Error('Plani financiar është i pavlefshëm.');
    l.annualBudgetPlan=Object.assign({},plan,{allocations:allocations,plannedB:total});
    Object.assign(b,{allocations:allocations.map(function(a){return Object.assign({},a);}),plannedB:total,capitalB:plan.capitalB,interestB:interest,status:'DRAFT'});
    c.budgetMinistryId=ministry;c.minimumAllocationM=row.budgetM;c.minimumCostB=total;
    l.desc=(l.desc||'')+'\nPlani financiar pas kushtit të negociuar: €'+(total*1000).toFixed(2)+'M në vit; '+state.ministries.find(function(m){return m.id===ministry;}).name+': €'+row.budgetM.toFixed(2)+'M. Shtesa nuk është pagesë.';
    l.status='DRAFT';l.govRequired=true;l.govStage='RETURNED';l.debated=false;l.govOpinions='Ndarjet e negociuara kërkojnë rishqyrtim dhe miratim qeveritar para rikthimit në Kuvend.';
    validatePublicFinance(state);
}
function lawNegotiationSupportScore(l,n){return n.score+lawNegotiationScore(l,state.parties[n.partyId])-n.initialScore-(n.dueTurn-state.turnCount<=1?4:0);}
function lawNegotiationAssessment(l,n){
    var parts=lawNegotiationScoreParts(l,state.parties[n.partyId]),hasConditions=n.conditions.length>0,met=hasConditions && lawAgreementReady(l,n);
    // A documented content compromise replaces the off-topic assessment for this
    // bill only. Reuse the existing topic weights; party relationships stay intact.
    var accommodated=!parts.priority && met && n.used.includes('AMEND') && n.used.includes('COMPROMISE');
    var contentPoints=accommodated?LAW_NEG_PRIORITY_POINTS-LAW_NEG_OTHER_TOPIC_POINTS:0;
    var score=lawNegotiationSupportScore(l,n)+contentPoints,reasons=[];
    var terminal=['FAILED','ENDED','WITHDRAWN','EXPIRED'].includes(n.status),authorized=lawNegotiationAuthority(l) && n.initiator===state.playerParty && lawNegotiationRecord(l,n.partyId)===n;
    if(!authorized)reasons.push('Nuk keni autorizim për këto bisedime.');
    if(!hasConditions)reasons.push('Nuk ka kushte të regjistruara për këtë bisedim.');
    if(state.turnCount>n.dueTurn)reasons.push('Afati i bisedimeve ka kaluar.');
    if(terminal)reasons.push('Bisedimi është mbyllur: '+LAW_NEG_STATUS[n.status]+'. Vlerësimi aktual nuk e ndryshon vendimin historik.');
    if(n.status==='CONSULTING')reasons.push('Konsultimet presin javën '+n.readyTurn+'.');
    if(state.pendingVote || weeklyProcessing)reasons.push('Përfundoni votimin ose kalimin e javës.');
    if(!met)reasons.push('Kushti i projektligjit ende nuk është përmbushur.');
    if(score<LAW_NEG_THRESHOLD)reasons.push('Vlerësimi i projektligjit është '+score+'; kërkohen '+LAW_NEG_THRESHOLD+' pikë.');
    var outcome=score<LAW_NEG_THRESHOLD?'FAILED':n.conditions[0]?.accepted?(met?'AGREED':'CONDITIONAL'):'OPEN';
    return {parts:parts,conditionsMet:met,contentPoints:contentPoints,score:score,threshold:LAW_NEG_THRESHOLD,outcome:outcome,reasons:reasons,
        canReconsider:authorized && hasConditions && met && n.status==='FAILED' && score>=LAW_NEG_THRESHOLD && state.turnCount<=n.dueTurn && !state.pendingVote && !weeklyProcessing && !n.used.includes('RECONSIDER'),
        canAsk:authorized && hasConditions && !terminal && n.status!=='CONSULTING' && n.status!=='AGREED' && state.turnCount<=n.dueTurn && !state.pendingVote && !weeklyProcessing && !n.used.includes('ASK')};
}
function lawNegotiationAssessmentMarkup(l,n){
    var a=lawNegotiationAssessment(l,n),esc=catalogEscape,other=state.parties[n.partyId];
    return '<div class="neg-votes" data-law-assessment="'+esc(l.id+':'+n.partyId)+'"><p><strong>'+esc(lawNegotiationRelationshipLabel(other))+'</strong>. Drejtimi i kundërt mund të ndryshojë.</p><p><strong>Mbështetja për këtë projektligj: '+a.score+' pikë · Pragu '+a.threshold+'</strong></p><p>Kushti i projektligjit: '+(a.conditionsMet?'i përmbushur':'ende i papërmbushur')+'. Kjo nuk është afërsia mes partive dhe nuk krijon koalicion.</p><p>'+esc(a.reasons.length?a.reasons.join(' '):n.status==='AGREED'?'Marrëveshja ekziston; vlerësimi aktual nuk e rishkruan historikun.':'Sipas gjendjes aktuale mund të kërkoni mbështetjen për këtë version.')+'</p><details><summary>Si llogaritet ky vlerësim?</summary><p>Vlerësimi bazë: '+a.parts.score+'. Hapat e bisedimit: '+(n.score-n.initialScore)+'. Kompromisi i përmbajtjes: +'+a.contentPoints+'. Presioni i afatit: '+(n.dueTurn-state.turnCount<=1?'-4':'0')+'.</p><p>'+esc(a.parts.priority?'Tema përputhet me prioritetet ekzistuese të partisë.':a.contentPoints?'Kushti është përmbushur dhe janë ofruar ndryshime e kompromis. Për këtë projektligj është kapërcyer pengesa e temës jo prioritare.':'Tema nuk është prioritet i partisë. Përmbush kushtin, ofro ndryshime dhe kërko kompromis për të hapur bashkëpunimin për këtë çështje.')+'</p><p>Baza përfshin marrëdhënien e drejtuar, temën, koalicionin, opinionin, financimin dhe kushtet e marrëveshjeve të tërhequra. Nuk maten përfitime publike që loja nuk i ka modeluar.</p></details></div>';
}
function processLawNegotiations(){
    migrateLawNegotiations(state);
    state.lawNegotiations.records.forEach(function(n){
        var l=state.laws.find(function(l){return l.id===n.lawId;});if(!l){n.status='ENDED';return;}if(['PASSED','FAILED'].includes(l.status))return;
        if(['AGREED','CONDITIONAL'].includes(n.status)){
            n.conditions.forEach(function(c){c.fulfilled=lawConditionMet(l,c);});
            if(n.status==='AGREED' && !lawAgreementReady(l,n)){n.status='WITHDRAWN';lawNegotiationLog(n,'Mbështetja u tërhoq: kushti i marrëveshjes nuk plotësohet më.');}
            else if(n.status==='CONDITIONAL' && lawAgreementReady(l,n)){n.status='AGREED';lawNegotiationLog(n,'Kushtet u verifikuan; grupi parlamentar e mbështet këtë version.');}
        }
        if(n.status==='CONSULTING' && state.turnCount>=n.readyTurn){n.status='OPEN';n.score+=5;lawNegotiationLog(n,'Konsultimet përfunduan. Grupi kërkon vendim për kushtin e propozuar.');}
        if(state.turnCount>n.dueTurn && !['EXPIRED','ENDED','FAILED','WITHDRAWN'].includes(n.status) && l.status!=='WITHDRAWN'){
            n.status='EXPIRED';l.negotiationDelayedTurn=l.negotiationDelayedTurn ?? state.turnCount;adjustPublicSupport(-(.3), {source:"processLawNegotiations"}, state);lawNegotiationLog(n,'Afati kaloi; mbështetja duhet rivlerësuar. Procedura parlamentare mund të vazhdojë.');
        }
        if(l.status==='WITHDRAWN')n.status='ENDED';
    });
}
function lawNegotiationAction(i,p,action){
    var l=state.laws[i],n=l && lawNegotiationRecord(l,p);if(!n || !lawNegotiationAuthority(l) || n.initiator!==state.playerParty || state.turnCount>n.dueTurn || ['FAILED','ENDED','WITHDRAWN','EXPIRED'].includes(n.status) && !(action==='RECONSIDER' && lawNegotiationAssessment(l,n).canReconsider))return false;
    if(n.status==='CONSULTING')return false;
    if(n.used.includes(action))return false;
    if(!['EXPLAIN','AMEND','ASK','DISCUSS','COMPROMISE','REFUSE','END','ACCEPT','PLAN','MEET','RECONSIDER'].includes(action))return false;
    return lawNegotiationCommit(function(){
        var c=n.conditions[0],leader=state.parties[p].leader,text='';
        if(action==='RECONSIDER'){
            if(!lawNegotiationAssessment(l,n).canReconsider)throw Error('Rishqyrtimi kërkon kushte të përmbushura, vlerësim të mjaftueshëm dhe afat të vlefshëm.');
            n.status='OPEN';n.used=n.used.filter(function(a){return a!=='ASK';});
            text='U rihap bisedimi për rishqyrtim me kërkesë të lojtarit. Refuzimi i mëparshëm ruhet në histori; kushtet nuk u aplikuan përsëri. Vendimi i grupit duhet kërkuar veçmas.';
        }else if(action==='MEET'){
            var key=l.id+':'+p;
            state.scheduledMeetings.push({id:'law-meeting:'+key,lawNegotiationKey:key,status:'SCHEDULED',targetName:leader,category:'Lider partie',topic:l.title,goal:'Negocimi i mbështetjes parlamentare',dueTurn:state.turnCount+1,hour:'11:00',importance:'Mesatare'});text='Takimi u planifikua në agjendë për javën pasuese.';
        }else if(action==='EXPLAIN'){n.score+=4;text='Përfitimet u sqaruan. Grupi ruan rezervat për zbatimin.';}
        else if(action==='AMEND'){n.score+=3;text='Propozimi për ndryshim u mirëprit; pranimi i kushtit kërkon veprim veçmas.';}
        else if(action==='DISCUSS'){n.status='CONSULTING';n.readyTurn=state.turnCount+1;text='Kërkoj një javë për konsultime me grupin parlamentar.';}
        else if(action==='COMPROMISE'){n.score+=4;text='Ka hapësirë për kompromis, nëse kushti ynë përfshihet realisht.';}
        else if(action==='REFUSE'){n.score-=8;n.status='FAILED';text='Pa këtë garanci nuk kemi marrëveshje. Procedura mund të vazhdojë pa votat tona.';}
        else if(action==='END'){n.status='ENDED';text='Bisedimet u ndërprenë pa marrëveshje.';}
        else if(action==='ACCEPT'){
            if(l.annualBudgetYear && c.kind==='FUNDING')applyNegotiatedBudgetFunding(l,c);
            if(!l.annualBudgetYear && c.kind==='FUNDING' && (!agendaExecutive() || state.budgetTotalB<(l.costB||0)+c.costB))throw Error('Kushti kërkon kompetencë ekzekutive dhe buxhet për të gjithë projektligjin.');
            c.accepted=true;
            if(c.kind!=='REPORT'){
                l.desc=(l.desc||'')+'\nAmendament i negociuar: '+c.text;l.version=(l.version||1)+1;
                l.amendments=l.amendments||[];l.amendments.push({text:c.text,status:'ACCEPTED',turn:state.turnCount,negotiatedWith:p});
                if(c.kind==='FUNDING' && !l.annualBudgetYear){l.costB=(l.costB||0)+c.costB;c.minimumCostB=l.costB;}
                if(l.catalog13 && l.govRequired){l.govStage='RETURNED';l.status='DRAFT';l.govOpinions='Ndryshimi i negociuar kërkon rishqyrtim dhe miratim qeveritar.';}
                if(l.status==='SCHEDULED'){l.status='UNDER_REVIEW';l.debated=false;}
            }
            n.score+=8;text=l.annualBudgetYear && c.kind==='FUNDING'?'Kushti u përfshi automatikisht në ndarjen e ministrisë dhe në totalin vjetor. Nuk u krye pagesë; projektbuxheti kthehet për rishqyrtim qeveritar. Tani mund të kërkoni vendimin e grupit për mbështetje.':'Kushti u pranua. Teksti dhe kostoja u përditësuan kur kërkohej; premtimi për plan mbetet i papërmbushur.';
        }else if(action==='PLAN'){
            if(!c.accepted || c.kind!=='REPORT')throw Error('Pranoni fillimisht zotimin për planin.');
            c.plan='plan:'+l.id+':'+p;l.negotiationPlans=l.negotiationPlans||[];l.negotiationPlans.push({id:c.plan,text:c.text,responsible:l.ministry||l.proposer,publishedTurn:state.turnCount,milestones:[{turn:state.turnCount+1,task:'Konsultimi i zbatuesve'},{turn:state.turnCount+2,task:'Raporti i gatishmërisë'}]});text='Plani me përgjegjës dhe afate u hartua dhe u publikua; zbatimi i politikës ende kërkon miratim dhe financim.';
        }else if(action==='ASK'){
            var assessment=lawNegotiationAssessment(l,n),currentScore=assessment.score;
            if(!assessment.canAsk)throw Error('Vendimi i grupit nuk mund të kërkohet në këtë gjendje.');
            n.status=assessment.outcome;
            if(currentScore>=assessment.threshold){text=n.status==='OPEN'?'Përmbajtja është afër qëndrimit tonë, por kushti mbetet i hapur.':'E pranojmë mbështetjen vetëm për këtë projektligj, sipas kushteve të regjistruara. Kjo nuk krijon koalicion.';}
            else {text='Vlerësimi i këtij projektligji është '+currentScore+' nga '+assessment.threshold+' pikë të nevojshme. '+(!assessment.conditionsMet?'Kushti mbetet i papërmbushur. ':'')+'Marrëdhënia mes partive është vetëm një faktor; marrëveshja nuk u arrit.';}
        }
        n.conditions.forEach(function(c){c.fulfilled=lawConditionMet(l,c);});
        if(n.status==='CONDITIONAL' && lawAgreementReady(l,n))n.status='AGREED';
        if(action==='ACCEPT' && n.status==='OPEN')n.used=n.used.filter(function(a){return a!=='ASK';});
        n.used.push(action);lawNegotiationLog(n,leader+': '+lawNegotiationVoice(p)+text);
    });
}
function conductLawNegotiationMeeting(i){
    var m=state.scheduledMeetings[i],n=m && state.lawNegotiations.records.find(function(n){return n.lawId+':'+n.partyId===m.lawNegotiationKey;}),l=n && state.laws.find(function(l){return l.id===n.lawId;});
    if(!m || m.status!=='SCHEDULED' || m.dueTurn!==state.turnCount || !n || !lawNegotiationAuthority(l))return false;
    var ok=lawNegotiationCommit(function(){m.status='COMPLETED';m.outcome='U shqyrtuan kushtet e projektligjit.';if(n.status==='OPEN')n.score+=3;lawNegotiationLog(n,'Takimi me '+state.parties[n.partyId].leader+' u zhvillua. Kushtet mbeten për vendim.');});
    if(ok)openLawNegotiations(state.laws.indexOf(l));return ok;
}
function negotiatedLawBallot(l,mp,baseline,forecast,random){
    var n=state.lawNegotiations && lawNegotiationRecord(l,mp.party);if(!n)return baseline;
    var active=n.status==='AGREED' && state.turnCount<=n.dueTurn && lawAgreementReady(l,n);
    if(active){if(mp.promisedVoteNext)return 'pro';if(mp.rebelRisk)return forecast?'abstenim':(random()<.65?'pro':'abstenim');return forecast?'pro':(random()<.97?'pro':'abstenim');}
    if(['WITHDRAWN','EXPIRED'].includes(n.status) || n.status==='AGREED' && !active || n.status==='CONDITIONAL')return mp.promisedVoteNext?'pro':'kunder';
    return baseline;
}
function lawSupportEstimate(l){var r=calculateLawVote(l,true);r.required=['INTL_80','CONSTITUTION_80'].includes(l.majorityType)?80:61;r.status=!r.passed?'Mbështetje e pamjaftueshme':'Mbështetje e pasigurt';var secure=state.mps.filter(function(m){var n=lawNegotiationRecord(l,m.party);return n && n.status==='AGREED' && state.turnCount<=n.dueTurn && lawAgreementReady(l,n) && !m.rebelRisk;});if(!r.blockedReason && secure.length>=r.required+3 && (l.majorityType!=='VITAL_DOUBLE' || secure.filter(function(m){return ['SL','MIN_MULTI'].includes(m.party);}).length>=16))r.status='Mbështetje e sigurt';return r;}
function openLawNegotiations(index){
    migrateLawNegotiations(state);var esc=catalogEscape,l=state.laws[index],available=state.laws.filter(lawNegotiationEligible);if(!l)l=available[0];
    var html='<div class="law-negotiations"><h2>Mbështetja politike e projektligjeve</h2><label>Projektligji<select onchange="openLawNegotiations(Number(this.value))">'+available.map(function(x){var i=state.laws.indexOf(x);return '<option value="'+i+'" '+(x===l?'selected':'')+'>'+esc(x.title)+'</option>';}).join('')+'</select></label>';
    if(!l){html+='<p>Nuk ka projektligje aktive për negociata.</p>';}
    else{
        index=state.laws.indexOf(l);var e=lawSupportEstimate(l),deadline=state.lawNegotiations.deadlines[l.id];
        html+='<p>'+esc(LAW_NEG_TOPICS[lawNegotiationTopic(l)])+' · Afati: '+(deadline===undefined?'4 javë nga hapja e bisedimeve':esc(diplomaticDate(deadline)))+'</p><div class="neg-votes" role="status"><strong>'+e.status+'</strong><p>'+e.pro+' për · '+e.kunder+' kundër · '+e.abstenim+' abstenime · '+e.mungese+' mungesa / vende të lira. Kërkohen '+e.required+' vota'+(l.majorityType==='VITAL_DOUBLE'?' dhe 14 nga komunitetet':'')+'.</p><p>Vlerësim orientues; rebelimet dhe pjesëmarrja mund ta ndryshojnë votimin real.</p></div>';
        html+='<details><summary>Prirja e deputetëve</summary>'+e.ballots.map(function(b){var m=state.mps.find(function(m){return m.seatNumber===b.seatNumber;});return '<p>'+esc(m.name || ('Deputeti '+m.seatNumber))+' · '+esc(m.party)+' · '+({pro:'Për',kunder:'Kundër',abstenim:'Abstenim',mungese:'Mungesë'})[b.vote]+'</p>';}).join('')+'</details>';
        if(!lawNegotiationAuthority(l))html+='<p>Nuk keni kompetencë për të negociuar në emër të propozuesit të këtij projektligji.</p>';
        html+='<div class="neg-parties">'+Object.values(state.parties).filter(function(p){return p.id!==state.playerParty;}).map(function(p){
            var n=lawNegotiationRecord(l,p.id),score=n?n.initialScore:lawNegotiationScore(l,p),role=p.id===state.mandatar?'Në pushtet':state.coalitionParties.includes(p.id)?'Në koalicion':'Në opozitë',out='<article><h3>'+esc(p.name || p.short)+'</h3><p>'+esc(p.leader)+' · '+state.mps.filter(function(m){return m.party===p.id;}).length+' deputetë · '+role+'</p><p>Qëndrimi fillestar: '+(score>=60?'I hapur ndaj mbështetjes':score>=40?'Me rezerva':'Kundërshtues')+'</p>';
            out+='<p>Interesat: '+esc(LAW_NEG_INTERESTS[p.id] || 'Përfaqësimi parlamentar dhe zbatimi i përgjegjshëm')+'</p>';
            function btn(code,label){return '<button class="action-btn" onclick="'+(code==='ACCEPT'?'acceptLawConditionAndShowSteps('+index+',\''+esc(p.id)+'\')':'lawNegotiationAction('+index+',\''+esc(p.id)+'\',\''+code+'\');openLawNegotiations('+index+')')+'">'+label+'</button>';}
            if(!n){out+=lawPoliticalOutcomeMarkup(l,n);out+='<p>'+esc(lawNegotiationRelationshipLabel(p))+'</p>';out+='<p>Interesat dhe kushtet saktësohen në hapjen e bisedimeve sipas temës dhe marrëdhënieve politike.</p>';if(lawNegotiationAuthority(l))out+='<button class="action-btn" onclick="startLawNegotiation('+index+',\''+esc(p.id)+'\');openLawNegotiations('+index+')">Hap negociatat</button>';}
            else{
                out+=lawPoliticalOutcomeMarkup(l,n);out+=n.conditions.map(function(c){return '<p>'+esc(c.text)+(c.costB?' Shtesa: €'+(c.costB*1000).toFixed(1)+'M.':'')+' · '+(c.accepted?(lawConditionMet(l,c)?'I përmbushur':'Zotim i papërmbushur'):'Kusht i propozuar')+'</p>';}).join('');
                out+='<details class="political-detail"><summary>Vlerësimi dhe arsyetimi</summary>'+lawNegotiationAssessmentMarkup(l,n)+'</details>';
                (l.negotiationPlans||[]).filter(function(plan){return n.conditions.some(function(c){return c.plan===plan.id;});}).forEach(function(plan){out+='<details><summary>Plani i publikuar</summary><p>Përgjegjës: '+esc(plan.responsible)+'</p>'+plan.milestones.map(function(m){return '<p>Java '+m.turn+': '+esc(m.task)+' — hap i planifikuar, jo politikë e realizuar.</p>';}).join('')+'</details>';});
                if(lawNegotiationAssessment(l,n).canReconsider)out+=btn('RECONSIDER','Kërko rishqyrtim (pa marrëveshje automatike)');
                if(n.status==='OPEN')out+='<p>Hapi i ardhshëm: shqyrtoni kushtin dhe kërkoni vendimin e grupit; takimi dhe konsultimet janë opsionale.</p>';
                if(n.status==='CONDITIONAL')out+='<p>Hapi i ardhshëm: përmbushni zotimin e hapur përpara votimit.</p>';
                if(n.status==='CONSULTING')out+='<p>Hapi i ardhshëm: prisni konsultimet deri më '+esc(diplomaticDate(n.readyTurn))+'.</p>';
                if(lawNegotiationAuthority(l) && n.initiator===state.playerParty && ['OPEN','CONDITIONAL','AGREED'].includes(n.status) && state.turnCount<=n.dueTurn){out+='<div class="candidate-actions">'+[['MEET','Planifiko takim'],['EXPLAIN','Shpjego përfitimet'],['AMEND','Ofro ndryshime'],['ASK','Kërko mbështetjen'],['DISCUSS','Diskuto kërkesat'],['COMPROMISE','Kërko kompromis'],['ACCEPT','Prano kushtin'],['PLAN','Harto dhe publiko planin'],['REFUSE','Refuzo kushtin'],['END','Ndërprit bisedimet']].filter(function(a){return !n.used.includes(a[0]) && (a[0]!=='PLAN' || n.conditions[0].kind==='REPORT' && n.conditions[0].accepted);}).map(function(a){return btn(a[0],a[1]);}).join('')+'</div>';}
                out+='<details><summary>Historiku dhe zotimet</summary>'+n.history.map(function(h){return '<p>Java '+h.turn+': '+esc(h.text)+'</p>';}).join('')+'</details>';
            }return out+'</article>';
        }).join('')+'</div>';
    }
    document.getElementById('interactiveActionModalContent').innerHTML=html+'<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button></div>';toggleModal('interactiveActionModal',true);
}

// Read-only guidance: conditions, actions and agreement status remain canonical.
function lawNegotiationNextSteps(l,n){
    var rows=n.conditions.map(function(c){
        var met=lawConditionMet(l,c);
        return {done:met,label:c.kind==='REPORT'?'Harto dhe publiko planin e zbatimit':c.kind==='FUNDING'?'Përfshi financimin dhe kushtin në projektligj':'Përfshi kushtin në tekstin e projektligjit',
            detail:met?(c.kind==='FUNDING'?(l.annualBudgetYear?'Shtesa u përfshi në ndarjen e ministrisë dhe në totalin e projektbuxhetit. Nuk është pagesë. Plani kërkon rishqyrtim dhe votim.':'Kushti është në tekst dhe kostoja mbulohet nga fondet aktuale. Pranimi nuk është pagesë.'):'Kushti është regjistruar sipas kërkesës së grupit.'):c.kind==='REPORT'?'Pranimi i zotimit nuk e publikon planin. Përdor butonin më poshtë.':'Kontrollo tekstin dhe fondet aktuale te negociatat; kushti ende nuk plotësohet.',
            action:!met && c.accepted && c.kind==='REPORT' && !n.used.includes('PLAN')?'PLAN':null};
    });
    if(n.status==='AGREED'){rows.push({done:true,label:'Mbështetja e grupit është konfirmuar',detail:'Vlen për këtë version dhe kushtet e regjistruara, deri në afatin e marrëveshjes. Votimi real mund të ndryshojë nga pjesëmarrja dhe rebelimet.'});return rows;}
    var assessment=lawNegotiationAssessment(l,n),politicalScore=assessment.score;
    if(['FAILED','ENDED','WITHDRAWN','EXPIRED'].includes(n.status) || state.turnCount>n.dueTurn){rows.push({done:false,label:'Këto bisedime nuk japin mbështetje aktive',detail:state.turnCount>n.dueTurn?'Afati i bisedimeve ka kaluar.':assessment.canReconsider?'Vlerësimi aktual dhe kushtet e lejojnë rishqyrtimin brenda afatit. Rihap bisedimin dhe pastaj kërko vendimin; refuzimi i mëparshëm nuk fshihet.':LAW_NEG_STATUS[n.status]+'. Nuk ka rishqyrtim të disponueshëm me këtë gjendje; shqyrto mbështetjen e grupeve të tjera.',action:assessment.canReconsider?'RECONSIDER':null});return rows;}
    if(n.status==='CONSULTING'){rows.push({done:false,label:'Prit vendimin e konsultimeve',detail:'Konsultimet përfundojnë më '+diplomaticDate(n.readyTurn)+'.'});return rows;}
    [['EXPLAIN','Shpjego përfitimet'],['AMEND','Ofro ndryshime'],['COMPROMISE','Kërko kompromis']].forEach(function(pair){rows.push({done:n.used.includes(pair[0]),label:pair[1],detail:pair[0]!=='EXPLAIN' && !assessment.parts.priority?'Pa pagesë të menjëhershme. Së bashku me kushtin e përmbushur, ndryshimet dhe kompromisi hapin bashkëpunimin për këtë projektligj; marrëdhënia mes partive mbetet e njëjtë.':'Pa pagesë të menjëhershme. Ndihmon vlerësimin e projektligjit; nuk garanton votat individuale.',action:n.used.includes(pair[0])?null:pair[0]});});
    if(!n.used.includes('DISCUSS') && state.turnCount<n.dueTurn)rows.push({done:false,label:'Konsultohu me grupin parlamentar',detail:'Kërkon një javë dhe ndihmon afrimin e qëndrimeve; afati nuk zgjatet. Nuk garanton arritjen e pragut.',action:'DISCUSS'});
    var remaining=rows.some(function(r){return !!r.action;});
    rows.push({done:false,label:'Kërko vendimin e grupit për mbështetje',detail:!assessment.conditionsMet?'Përmbush fillimisht kushtin e hapur.':politicalScore<assessment.threshold?'Me vlerësimin aktual grupi do të refuzojë. '+(remaining?'Përdor hapat e disponueshëm më sipër dhe kontrollo përsëri pikët.':'Nuk kanë mbetur hapa të menjëhershëm në këtë kartë; kërko mbështetjen e grupeve të tjera ose ndrysho rrethanat përmes procedurave ekzistuese.')+' Kërkimi i vendimit në këtë gjendje e mbyll bisedimin në refuzim.':'Kushti dhe pragu i vlerësimit aktual plotësohen. Mund të kërkosh vendimin e grupit.',action:assessment.conditionsMet && assessment.canAsk?'ASK':null});
    return rows;
}
function renderLawNegotiationSteps(){
    var host=document.getElementById('lawNegotiationStepsPanel');if(!host || !state)return;
    var esc=catalogEscape,records=(state.lawNegotiations?.records||[]).filter(function(n){var l=state.laws.find(function(l){return l.id===n.lawId;});return l && lawNegotiationEligible(l) && ['OPEN','CONSULTING','CONDITIONAL'].includes(n.status) && state.turnCount<=n.dueTurn && lawNegotiationRecord(l,n.partyId)===n && n.initiator===state.playerParty && n.conditions.some(function(c){return c.accepted;});});
    host.innerHTML=records.map(function(n){var l=state.laws.find(function(l){return l.id===n.lawId;}),i=state.laws.indexOf(l),live=lawNegotiationAuthority(l) && state.turnCount<=n.dueTurn && (['OPEN','CONDITIONAL','AGREED'].includes(n.status) || lawNegotiationAssessment(l,n).canReconsider);
        return '<article class="card" data-law-next-steps="'+esc(l.id+':'+n.partyId)+'"><h3>Hapat për marrëveshje me '+esc(state.parties[n.partyId].name||n.partyId)+'</h3><p>'+esc(l.title)+' · Afati: '+esc(diplomaticDate(n.dueTurn))+'</p>'+lawNegotiationAssessmentMarkup(l,n)+'<ol>'+lawNegotiationNextSteps(l,n).map(function(row){var handler='lawNegotiationStepAction('+i+','+JSON.stringify(n.partyId)+','+JSON.stringify(row.action)+')';return '<li style="margin-bottom:12px"><strong>'+(row.done?'✓ ':'')+esc(row.label)+'</strong><p>'+esc(row.detail)+'</p>'+(live && row.action?'<button class="action-btn" onclick="'+esc(handler)+'">'+esc(row.action==='RECONSIDER'?'K\u00ebrko rishqyrtim':row.action==='PLAN'?'Harto dhe publiko planin':row.action==='ASK'?'Kërko mbështetjen':row.label.replace(' (opsionale)',''))+'</button>':'')+'</li>';}).join('')+'</ol><button class="btn-top" onclick="openLawNegotiations('+i+')">Hap negociatat dhe historikun</button></article>';
    }).join('');
}
function lawNegotiationStepAction(i,p,action){
    var l=state.laws[i],n=l && lawNegotiationRecord(l,p);
    if(!n || !lawNegotiationNextSteps(l,n).some(function(row){return row.action===action;}))return false;
    var result=lawNegotiationAction(i,p,action);renderLawNegotiationSteps();return result;
}
function acceptLawConditionAndShowSteps(i,p){
    if(!lawNegotiationAction(i,p,'ACCEPT'))return false;
    toggleModal('interactiveActionModal',false);
    switchMainTab('tab-dashboard');switchSubTab('dash','overview',document.querySelector('#tab-dashboard .sub-pill'));
    renderLawNegotiationSteps();document.getElementById('lawNegotiationStepsPanel')?.scrollIntoView?.({block:'start',behavior:'smooth'});
    if(state.laws[i]?.annualBudgetYear)showToast('Kushti u përfshi në projektbuxhet. Kërko mbështetjen e grupit; rishqyrtimi dhe votimi mbeten të nevojshëm.');
    return true;
}
