/* Educational game reward. Financial amounts are EUR billions. */
const HISTORY_QUIZ_SOURCES={
    independence:{title:'Zyra e Historianit · SHBA',url:'https://history.state.gov/countries/kosovo'},
    rugova:{title:'Presidenca · Ibrahim Rugova',url:'https://president-ksgov.net/ish-presidentet-e-kosoves/dr-ibrahim-rugova/'},
    league:{title:'Komuna e Prizrenit · Historiku',url:'https://prizren.rks-gov.net/historiku/'},
    jashari:{title:'Presidenca · Epopeja e UÇK-së',url:'https://president-ksgov.net/fjalimi-i-sotem-ne-seancen-solemne-ne-nder-te-epopese-se-uck-se/'},
    nato:{title:'NATO · Fushata ajrore 1999',url:'https://nato.int/en/what-we-do/operations-and-missions/kosovo-air-campaign-march-june-1999'},
    kfor:{title:'NATO · Misioni në Kosovë',url:'https://www.nato.int/en/what-we-do/operations-and-missions/natos-role-in-kosovo'},
    un:{title:'OKB · Rezoluta 1244',url:'https://unmik.unmissions.org/en/united-nations-resolution-1244'},
    university:{title:'Universiteti i Prishtinës · Historiku',url:'https://uni-pr.edu/en/page/the-university-of-prishtina'},
    jahjaga:{title:'Presidenca · Atifete Jahjaga',url:'https://president-ksgov.net/en/former-presidents-of-kosovo/atifete-jahjaga/'},
    icj:{title:'GJND · Opinioni këshillimor 2010',url:'https://api.icj-cij.org/sites/default/files/case-related/141/141-20100722-ADV-01-00-EN.pdf'}
};
const HISTORY_QUESTIONS=[
    {id:'independence-year',text:'Në cilin vit u shpall Pavarësia e Kosovës?',options:['1999','2004','2008','2010'],correct:2,source:'independence',explanation:'Pavarësia u shpall më 17 shkurt 2008.'},
    {id:'independence-day',text:'Në cilën datë u shpall Pavarësia e Kosovës?',options:['17 shkurt 2008','12 qershor 1999','28 nëntor 1912','10 qershor 1878'],correct:0,source:'independence',explanation:'Data e shpalljes është 17 shkurti 2008.'},
    {id:'rugova',text:'Kush njihet si Presidenti historik i Kosovës?',options:['Bajram Rexhepi','Adem Demaçi','Fehmi Agani','Ibrahim Rugova'],correct:3,source:'rugova',explanation:'Ibrahim Rugova njihet si Presidenti historik i Republikës së Kosovës.'},
    {id:'league-year',text:'Në cilin vit u themelua Lidhja Shqiptare e Prizrenit?',options:['1912','1878','1908','1881'],correct:1,source:'league',explanation:'Lidhja u themelua në Prizren më 10 qershor 1878.'},
    {id:'league-city',text:'Në cilin qytet u themelua Lidhja Shqiptare më 10 qershor 1878?',options:['Pejë','Shkodër','Prizren','Prishtinë'],correct:2,source:'league',explanation:'Prizreni ishte qendra e themelimit të Lidhjes.'},
    {id:'league-day',text:'Cila datë shënon themelimin e Lidhjes së Prizrenit?',options:['28 nëntor','10 qershor','17 shkurt','7 mars'],correct:1,source:'league',explanation:'Themelimi përkujtohet më 10 qershor.'},
    {id:'jashari',text:'Kush njihet si Komandanti Legjendar i UÇK-së?',options:['Adem Jashari','Isa Boletini','Hasan Prishtina','Azem Bejta'],correct:0,source:'jashari',explanation:'Adem Jashari nderohet me këtë emërtim në historinë e UÇK-së.'},
    {id:'prekaz',text:'Me cilin vend lidhet qëndresa e familjes Jashari në mars 1998?',options:['Junik','Kaçanik','Gllogjan','Prekaz'],correct:3,source:'jashari',explanation:'Qëndresa e familjes Jashari u zhvillua në Prekaz.'},
    {id:'epopeja',text:'Cilat data të marsit 1998 përkujtohen si Epopeja e UÇK-së?',options:['1–3 mars','5–7 mars','10–12 mars','20–22 mars'],correct:1,source:'jashari',explanation:'Epopeja lidhet me ngjarjet e 5, 6 dhe 7 marsit 1998.'},
    {id:'nato-year',text:'Në cilin vit nisi fushata ajrore e NATO-s lidhur me Kosovën?',options:['1995','1998','1999','2001'],correct:2,source:'nato',explanation:'Fushata ajrore nisi në vitin 1999.'},
    {id:'nato-date',text:'Kur nisi operacioni Allied Force i NATO-s?',options:['24 mars 1999','10 qershor 1999','12 qershor 1999','17 shkurt 2008'],correct:0,source:'nato',explanation:'Operacioni nisi më 24 mars 1999.'},
    {id:'nato-duration',text:'Sa ditë zgjati fushata ajrore e NATO-s në vitin 1999?',options:['30 ditë','60 ditë','100 ditë','78 ditë'],correct:3,source:'nato',explanation:'NATO e përshkruan fushatën si një operacion 78-ditor.'},
    {id:'kfor-entry',text:'Kur hynë në Kosovë njësitë e para të KFOR-it?',options:['24 mars 1999','12 qershor 1999','17 shkurt 2008','22 korrik 2010'],correct:1,source:'kfor',explanation:'Njësitë e para të KFOR-it hynë më 12 qershor 1999.'},
    {id:'resolution-date',text:'Kur u miratua Rezoluta 1244 e Këshillit të Sigurimit të OKB-së?',options:['10 qershor 1999','12 qershor 1999','24 mars 1999','17 shkurt 2008'],correct:0,source:'un',explanation:'Rezoluta 1244 u miratua më 10 qershor 1999.'},
    {id:'unmik',text:'Cila organizatë themeloi misionin UNMIK në Kosovë?',options:['Bashkimi Evropian','OSBE-ja','Kombet e Bashkuara','Këshilli i Evropës'],correct:2,source:'un',explanation:'UNMIK është mision i Kombeve të Bashkuara, i krijuar në kuadër të Rezolutës 1244.'},
    {id:'university-year',text:'Në cilin vit u themelua Universiteti i Prishtinës?',options:['1945','1960','1981','1970'],correct:3,source:'university',explanation:'Universiteti i Prishtinës u themelua në vitin 1970.'},
    {id:'jahjaga',text:'Kush ishte gruaja e parë Presidente e Republikës së Kosovës?',options:['Edita Tahiri','Atifete Jahjaga','Flora Brovina','Kaqusha Jashari'],correct:1,source:'jahjaga',explanation:'Atifete Jahjaga ishte gruaja e parë në këtë detyrë.'},
    {id:'jahjaga-year',text:'Në cilin vit nisi mandati presidencial i Atifete Jahjagës?',options:['2008','2016','2011','2021'],correct:2,source:'jahjaga',explanation:'Mandati i saj presidencial zgjati nga 2011 deri në 2016.'},
    {id:'icj-year',text:'Në cilin vit GJND-ja dha opinionin këshillimor për deklaratën e pavarësisë së Kosovës?',options:['2010','2008','1999','2013'],correct:0,source:'icj',explanation:'Opinioni këshillimor u dha më 22 korrik 2010.'},
    {id:'icj-court',text:'Cila gjykatë dha opinionin këshillimor të 22 korrikut 2010 për deklaratën e pavarësisë?',options:['Gjykata Penale Ndërkombëtare','Gjykata e Strasburgut','Gjykata e Drejtësisë e BE-së','Gjykata Ndërkombëtare e Drejtësisë'],correct:3,source:'icj',explanation:'Opinioni u dha nga Gjykata Ndërkombëtare e Drejtësisë, organi gjyqësor i OKB-së.'}
];
const historyQuizFreshBase=initialiseProduction,historyQuizLoadBase=prepareLoadedState,historyQuizValidateBase=validateLoadedState;
const historyDashboardBase=renderDashboard,historyFiscalBase=renderPublicFinance;
function migrateHistoryQuiz(st){if(st.historyQuiz===undefined)st.historyQuiz={version:1,attempts:[]};}
initialiseProduction=function(st){historyQuizFreshBase(st);migrateHistoryQuiz(st);};
prepareLoadedState=function(raw){const loaded=historyQuizLoadBase(raw);migrateHistoryQuiz(loaded);validateLoadedState(loaded);return loaded;};
function historyShuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function drawHistoryQuestions(st){const ids=historyShuffle(HISTORY_QUESTIONS.map(q=>q.id)).slice(0,5),previous=st.historyQuiz.attempts.at(-1)?.questionIds;if(previous&&ids.every(id=>previous.includes(id)))ids[4]=HISTORY_QUESTIONS.find(q=>!ids.includes(q.id)).id;return ids;}
function historyQuestion(id){return HISTORY_QUESTIONS.find(q=>q.id===id);}
function historyQuizScore(r){return r.answers.filter(a=>a.correct).length;}
function historyQuizReward(r){return r.kind==='EMERGENCY'?r.perCorrectB:(r.rewardB??.5);}
function historyQuizBonus(r){return r.kind==='EMERGENCY'?0:(r.rewardB===undefined?.5:.005);}
function historyQuizRef(r){return r.kind==='EMERGENCY'?r.id:r.year;}
function historyQuizRefArg(r){return r.kind==='EMERGENCY'?"'"+r.id+"'":String(r.year);}
function historyQuizAttempt(ref){return state.historyQuiz?.attempts.find(r=>typeof ref==='string'?r.id===ref:r.year===ref&&r.kind!=='EMERGENCY');}
function historyQuizPrefix(r){return r.kind==='EMERGENCY'?'Fondi Historik Emergjent: '+r.id:(r.rewardB===undefined?'Fondi Patriotik: ':'Fondi i Historisë: ')+r.year;}
function historyQuizEarned(r){return fiscalRound(historyQuizScore(r)*historyQuizReward(r)+(r.bonusId?historyQuizBonus(r):0));}
function historyQuizPending(st){return st.historyQuiz?.attempts.find(r=>r.answers.length<5||r.feedbackIndex!==null);}
function historyQuizMoney(b){return b>=1?'€'+b.toLocaleString('sq-AL')+' Miliardë':'€'+(b*1000)+' Milion';}
function historyQuizCommit(change){return governmentCrisisCommit(()=>{migrateHistoryQuiz(state);change();});}
function openHistoryQuiz(){
    if(!agendaExecutive()){showToast('Fondi shtetëror menaxhohet nga Kryeministri.');return false;}
    let r=historyQuizPending(state)||state.historyQuiz?.attempts.find(r=>r.year===state.year&&r.kind!=='EMERGENCY');
    if(!r){const ok=historyQuizCommit(()=>{
        if(historyQuizPending(state)||state.historyQuiz.attempts.some(r=>r.year===state.year&&r.kind!=='EMERGENCY'))throw Error('Kuizi i këtij viti është nisur tashmë.');
        state.historyQuiz.attempts.push({year:state.year,rewardB:.005,startTurn:state.turnCount,questionIds:drawHistoryQuestions(state),orders:Array.from({length:5},()=>historyShuffle([0,1,2,3])),answers:[],feedbackIndex:null,bonusId:null});
    });if(!ok)return false;r=state.historyQuiz.attempts.at(-1);}
    renderHistoryQuiz(historyQuizRef(r));toggleModal('interactiveActionModal',true);return true;
}
function answerHistoryQuiz(year,questionId,option){
    const ok=historyQuizCommit(()=>{
        const r=historyQuizAttempt(year),q=historyQuestion(questionId);
        if(!r||!q||r.answers.length>=5||r.feedbackIndex!==null||r.questionIds[r.answers.length]!==questionId||!Number.isInteger(option)||option<0||option>3)throw Error('Kjo pyetje është përgjigjur ose zgjedhja nuk është e vlefshme.');
        const correct=option===q.correct;let receiptId=null;
        if(correct){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+historyQuizReward(r)),historyQuizPrefix(r)+':'+questionId,'REVENUE');receiptId=state.publicFinance.ledger.at(-1).id;}
        r.answers.push({questionId,option,correct,turn:state.turnCount,receiptId});r.feedbackIndex=r.answers.length-1;
        if(r.kind!=='EMERGENCY'&&r.answers.length===5&&historyQuizScore(r)===5){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+historyQuizBonus(r)),historyQuizPrefix(r)+':BONUS','REVENUE');r.bonusId=state.publicFinance.ledger.at(-1).id;}
    });if(ok)renderHistoryQuiz(year);return ok;
}
function continueHistoryQuiz(year,index){const ok=historyQuizCommit(()=>{const r=historyQuizAttempt(year);if(!r||r.feedbackIndex!==index||index!==r.answers.length-1)throw Error('Ky hap është përfunduar.');r.feedbackIndex=null;});if(ok)renderHistoryQuiz(year);return ok;}
function historyQuizPanelMarkup(){
    const pending=historyQuizPending(state),used=state.historyQuiz?.attempts.find(r=>r.year===state.year&&r.kind!=='EMERGENCY'),r=pending||used;
    return '<h3>🏛️ Fondi Patriotik · Kuizi Historik</h3><p>5 pyetje · €5 Milion për përgjigje të saktë · €30 Milion gjithsej me 5/5. Një mundësi për çdo vit të lojës.</p>'+(used&&used.answers.length===5?'<p>Fondi '+used.year+': '+historyQuizScore(used)+'/5 · '+historyQuizMoney(historyQuizEarned(used))+' të arkëtuara. Mundësia e re hapet në '+(state.year+1)+'.</p>':'')+'<button class="action-btn btn-gold" data-history-quiz-open '+(!agendaExecutive()?'disabled':'')+' onclick="openHistoryQuiz()">'+(r&&r.answers.length<5?'Vazhdo Kuizin Historik':used?'Shiko rezultatin':'Kuizi Historik Vjetor')+'</button>'+(!agendaExecutive()?'<p>Kërkon mandatin e Kryeministrit.</p>':'');
}
function renderHistoryQuizPanel(){const host=document.getElementById('historyQuizPanel');if(host)host.innerHTML=historyQuizPanelMarkup();}
renderDashboard=function(){historyDashboardBase();renderHistoryQuizPanel();};
renderPublicFinance=function(){historyFiscalBase();const host=document.getElementById('fiscalPanelContainer');if(host&&typeof host.insertAdjacentHTML==='function')host.insertAdjacentHTML('beforeend','<section class="card">'+historyQuizPanelMarkup()+'</section>');};
function renderHistoryQuiz(year){
    const r=historyQuizAttempt(year),host=document.getElementById('interactiveActionModalContent');if(!r||!host)return;
    let html='<section class="history-quiz"><p class="history-quiz-kicker">Fondi Patriotik · '+r.year+'</p><h2>Kuizi i Historisë Kombëtare</h2><p>'+r.answers.length+'/5 përgjigje · '+historyQuizScore(r)+' të sakta · <strong>'+historyQuizMoney(historyQuizEarned(r))+' të arkëtuara</strong></p><progress max="5" value="'+r.answers.length+'" aria-label="Progresi i kuizit"></progress>';
    if(r.feedbackIndex!==null){
        const a=r.answers[r.feedbackIndex],q=historyQuestion(a.questionId),source=HISTORY_QUIZ_SOURCES[q.source];
        html+='<div class="history-quiz-feedback '+(a.correct?'is-correct':'is-wrong')+'" role="status"><h3>'+(a.correct?'✓ Saktë! +'+historyQuizMoney(historyQuizReward(r)):'Përgjigjja nuk ishte e saktë')+'</h3><p><strong>'+catalogEscape(q.options[q.correct])+'</strong></p><p>'+catalogEscape(q.explanation)+'</p><a href="'+catalogEscape(source.url)+'" target="_blank" rel="noopener noreferrer">Burimi: '+catalogEscape(source.title)+'</a></div>'+(r.bonusId?'<p class="history-quiz-grand">🏆 5/5! Bonusi është regjistruar.</p>':'')+'<button class="action-btn btn-gold" onclick="continueHistoryQuiz('+historyQuizRefArg(r)+','+r.feedbackIndex+')">'+(r.answers.length===5?'Shiko përmbledhjen':'Pyetja tjetër')+'</button>';
    }else if(r.answers.length===5){html+='<h3>'+(r.bonusId?'🏆 Njohuri të shkëlqyera!':'Kuizi përfundoi')+'</h3><p>Rezultati '+historyQuizScore(r)+'/5 · Fondi i arkëtuar: <strong>'+historyQuizMoney(historyQuizEarned(r))+'</strong>.</p><p>Mundësia është përfunduar. Pagesat e regjistruara nuk përsëriten.</p>';}
    else {const i=r.answers.length,q=historyQuestion(r.questionIds[i]);html+='<h3>Pyetja '+(i+1)+' nga 5</h3><p class="history-quiz-question">'+catalogEscape(q.text)+'</p><div class="history-quiz-options">'+r.orders[i].map(option=>'<button class="action-btn" data-history-option="'+option+'" onclick="answerHistoryQuiz('+historyQuizRefArg(r)+',\''+q.id+'\','+option+')">'+catalogEscape(q.options[option])+'</button>').join('')+'</div>';}
    host.innerHTML=html+'<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbrapa · ruaj e vazhdo më vonë</button></section>';
}
function validateHistoryQuiz(st){
    const db=st.historyQuiz,entries=st.publicFinance?.ledger||[],bad=()=>{throw Error('Regjistri i Kuizit Historik është i pavlefshëm.');};
    if(db===undefined){if(entries.some(l=>l.source.startsWith('Fondi Patriotik: ')))bad();return;}
    if(!db||db.version!==1||!Array.isArray(db.attempts))bad();const years=new Set(),claimed=new Set();let active=0;
    function receipt(id,turn,source){const l=entries.find(l=>l.id===id);if(claimed.has(id)||!l||l.type!=='REVENUE'||l.account!=='budgetTotalB'||l.amountB!==.5||l.turn!==turn||l.source!==source)bad();claimed.add(id);}
    for(const r of db.attempts){
        if(!Number.isInteger(r.year)||r.year<1||r.year>st.year||years.has(r.year)||!Number.isInteger(r.startTurn)||r.startTurn<0||r.startTurn>st.turnCount||!Array.isArray(r.questionIds)||r.questionIds.length!==5||new Set(r.questionIds).size!==5||r.questionIds.some(id=>!historyQuestion(id))||!Array.isArray(r.orders)||r.orders.length!==5||r.orders.some(o=>!Array.isArray(o)||o.length!==4||new Set(o).size!==4||o.some(n=>!Number.isInteger(n)||n<0||n>3))||!Array.isArray(r.answers)||r.answers.length>5)bad();years.add(r.year);
        if(r.feedbackIndex!==null&&r.feedbackIndex!==r.answers.length-1||r.feedbackIndex===-1)bad();if(r.answers.length<5||r.feedbackIndex!==null)active++;
        r.answers.forEach((a,i)=>{const q=historyQuestion(r.questionIds[i]);if(a.questionId!==q.id||!Number.isInteger(a.option)||a.option<0||a.option>3||a.correct!==(a.option===q.correct)||!Number.isInteger(a.turn)||a.turn<r.startTurn||a.turn>st.turnCount||i&&a.turn<r.answers[i-1].turn)bad();if(a.correct)receipt(a.receiptId,a.turn,'Fondi Patriotik: '+r.year+':'+q.id);else if(a.receiptId!==null)bad();});
        if(r.answers.length===5&&historyQuizScore(r)===5)receipt(r.bonusId,r.answers[4].turn,'Fondi Patriotik: '+r.year+':BONUS');else if(r.bonusId!==null)bad();
    }
    if(active>1||entries.some(l=>l.source.startsWith('Fondi Patriotik: ')&&!claimed.has(l.id)))bad();
}
validateLoadedState=function(st){historyQuizValidateBase(st);validateHistoryQuiz(st);};
