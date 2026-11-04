/* Optional mandate layer: existing promises, reforms, laws and autosave remain authoritative. */
function mandateCycle(st){return String(st.mandateNumber)+':'+String(st.assemblyCycleId||'scenario')+':'+String(st.primeMinister);}
function mandateMilestones(st){
    var rows=st.laws.filter(l=>l.status==='PASSED').map(l=>({id:'law:'+l.id,title:'Kuvendi miraton: '+l.title,detail:'Miratimi nuk provon zbatimin. Financimi dhe procedurat përkatëse mbeten të nevojshme.'}));
    stateDevelopmentRecords(st).filter(r=>stateDevelopmentGroup(r.project)==='COMPLETED').forEach(r=>rows.push({id:'project:'+r.key,title:'Përfundon: '+(r.project.title||r.project.name),detail:'Projekti u përfundua sipas motorit ekzistues. Efektet respektojnë kufijtë e metrikave.'}));return rows;
}
function initializeMandateExperience(st){st.mandateExperience={version:1,cycle:null,selected:[],seen:mandateMilestones(st).map(r=>r.id),news:[],tutorial:true};}
function mandateSelectionRequired(st){return !!st?.mandateExperience && agendaExecutive(st) && (st.mandateExperience.cycle!==mandateCycle(st) || st.mandateExperience.selected.length!==3);}
function mandateChoices(st){return st.stateSectors.filter(s=>!s.effectsApplied && !s.active).map(s=>({id:'sector:'+s.id,title:s.projectTitle,detail:'€'+s.costM+'M · '+s.weeksTotal+' javë'})).concat(LAW_CATALOG.filter(l=>l.recordKind!=='HISTORICAL' && !st.laws.some(b=>b.catalogId===l.id && b.status==='PASSED')).map(l=>({id:'law:'+l.id,title:'Miratimi: '+l.title,detail:'Procedurë parlamentare; miratimi nuk garanton zbatimin.'})));}
function mandateCommit(change){var before=JSON.stringify(state);try{change();if(!saveGameAuto())throw Error('Ruajtja dështoi');}catch(e){state=JSON.parse(before);showToast('Veprimi nuk u ruajt. Provoni përsëri.');renderMandateExperience();return false;}refreshAllUI();return true;}
function enableMandateExperience(){if(state.mandateExperience)return false;return mandateCommit(()=>initializeMandateExperience(state));}
function chooseMandatePromises(ids){
    if(!mandateSelectionRequired(state) || !Array.isArray(ids) || ids.length!==3 || new Set(ids).size!==3 || ids.some(id=>!mandateChoices(state).some(s=>s.id===id))){showToast('Zgjidhni saktësisht tri premtime të ndryshme, ende të papërmbushura.');return false;}
    return mandateCommit(()=>{var x=state.mandateExperience,choices=mandateChoices(state);x.cycle=mandateCycle(state);x.selected=ids.slice();ids.forEach(id=>state.promises.push({id:'mandate:'+x.cycle+':'+id,title:choices.find(s=>s.id===id).title,mandateGoal:{cycle:x.cycle,target:id},deadlineWeeks:state.weeksToNextRegularElection,costB:0,progress:0,fulfilled:false,source:'Premtim i mandatit; financimi dhe zbatimi bëhen veçmas.'}));});
}
function chooseMandatePromisesFromForm(){return chooseMandatePromises(Array.from(document.querySelectorAll('#mandateChoices input:checked')).map(n=>n.value));}
function syncMandateExperience(){
    var x=state.mandateExperience;if(!x)return;
    state.promises.filter(p=>p.mandateGoal?.cycle===x.cycle).forEach(p=>{var target=p.mandateGoal.target;
        if(target.startsWith('sector:')){var s=state.stateSectors.find(s=>s.id===target.slice(7));p.progress=s.effectsApplied?100:s.active?Math.max(0,Math.min(99,Math.round((s.weeksTotal-s.weeksLeft)/s.weeksTotal*100))):0;p.fulfilled=!!s.effectsApplied;}
        else{var laws=state.laws.filter(l=>l.catalogId===target.slice(4));p.fulfilled=laws.some(l=>l.status==='PASSED');p.progress=p.fulfilled?100:laws.some(l=>['SUBMITTED','UNDER_REVIEW','SCHEDULED'].includes(l.status))?50:laws.some(l=>l.status==='DRAFT')?10:0;}
        p.deadlineWeeks=Math.max(0,state.weeksToNextRegularElection);
    });
    if(agendaExecutive(state)&&x.cycle===mandateCycle(state))mandateMilestones(state).forEach(r=>{if(x.seen.includes(r.id))return;x.seen.push(r.id);x.news.push(r);});
}
function dismissMandateNews(){if(!state.mandateExperience?.news.length)return false;return mandateCommit(()=>state.mandateExperience.news.shift());}
function launchWasteTutorial(){if(!state.mandateExperience?.tutorial || !agendaExecutive(state))return false;return launchStateSectorProject(state.stateSectors.findIndex(s=>s.id==='sec_env'));}
function validateMandateExperience(st){
    var x=st.mandateExperience;if(x===undefined)return;
    var valid=id=>typeof id==='string' && (id.startsWith('sector:')?st.stateSectors.some(s=>s.id===id.slice(7)):id.startsWith('law:') && LAW_CATALOG.some(l=>l.id===id.slice(4)));
    if(!x || x.version!==1 || !(x.cycle===null || typeof x.cycle==='string') || !Array.isArray(x.selected) || ![0,3].includes(x.selected.length) || new Set(x.selected).size!==x.selected.length || x.selected.some(id=>!valid(id)) || typeof x.tutorial!=='boolean' || !Array.isArray(x.seen) || x.seen.some(id=>typeof id!=='string') || new Set(x.seen).size!==x.seen.length || !Array.isArray(x.news) || x.news.some(r=>!r || typeof r.id!=='string' || typeof r.title!=='string' || typeof r.detail!=='string' || !x.seen.includes(r.id)))throw Error('Të dhënat e mandatit janë të pavlefshme.');
    if(x.cycle!==null && x.selected.some(id=>st.promises.filter(p=>p.mandateGoal?.cycle===x.cycle && p.mandateGoal.target===id).length!==1))throw Error('Premtimet nuk përputhen me mandatin.');
    if(st.promises.some(p=>p.mandateGoal && (typeof p.mandateGoal.cycle!=='string' || !valid(p.mandateGoal.target) || !Number.isFinite(p.progress) || p.progress<0 || p.progress>100 || typeof p.fulfilled!=='boolean' || p.costB!==0)))throw Error('Referenca e premtimit është e pavlefshme.');
}
function renderMandateExperience(){
    var host=document.getElementById('mandateExperiencePanel'),news=document.getElementById('mandateBreakingNews');if(!host || !news || !state)return;var e=electoralEscape,x=state.mandateExperience;
    if(!x){host.innerHTML='<details class="card"><summary>Premtimet e mandatit dhe udhëzimi praktik</summary><p>Save-i ekzistues nuk ndryshohet automatikisht. Mund ta aktivizoni përvojën e re; më pas qeveria zgjedh tri premtime.</p><button class="action-btn" onclick="enableMandateExperience()">Aktivizo për këtë lojë</button></details>';news.hidden=true;return;}
    var html='<section class="card"><h2>Tri premtimet e mandatit</h2>';
    if(mandateSelectionRequired(state))html+='<p>Zgjidhni saktësisht 3 përpara javës tjetër. Zgjedhja nuk paguan asgjë dhe nuk garanton vota. Progresi i ligjeve tregon fazën procedurale, jo probabilitetin e miratimit.</p><div id="mandateChoices">'+mandateChoices(state).map(s=>'<label class="mandate-choice"><input type="checkbox" value="'+e(s.id)+'"> <span>'+e(s.title)+'<small>'+e(s.detail)+'</small></span></label>').join('')+'</div><button class="action-btn" onclick="chooseMandatePromisesFromForm()">Konfirmo tri premtimet</button>';
    else html+=state.promises.filter(p=>p.mandateGoal?.cycle===x.cycle).map(p=>'<article><strong>'+e(p.title)+'</strong><p>'+(p.fulfilled?'E përmbushur':'Progres: '+p.progress+'%')+'</p><progress max="100" value="'+p.progress+'" aria-label="'+e(p.title)+'"></progress><button class="btn-top" onclick="openUXWorkspace(\''+(p.mandateGoal.target.startsWith('law:')?'laws':'projects')+'\')">Hap procedurën përkatëse</button></article>').join('')+(!agendaExecutive(state)?'<p>Zgjedhja hapet kur keni kompetencë ekzekutive.</p>':'');
    var s=state.stateSectors.find(s=>s.id==='sec_env');if(x.tutorial && s)html+='<aside class="mandate-tutorial"><h3>Dosje mësimore: ndërhyrja për mbeturinat</h3><p>Urgjencë e simuluar udhëzuese, pa penalitet të fshehtë. Përdor reformën ekzistuese: '+e(s.projectTitle)+'.</p><ol><li>Kontrollo arkën dhe autorizimin buxhetor.</li><li>Shqyrto financimin: €'+s.costM+'M, '+s.weeksTotal+' javë.</li><li>Kalo javët dhe ndiq rezultatin në sektor e raport.</li></ol><p>'+(s.effectsApplied?'Tutoriali përfundoi me reformën reale.':s.active?'E financuar: ndiqe në raportin javor.':'Kërkohet shqyrtim dhe financim; nëse refuzohet, ndiq arsyen e kontrollit fiskal.')+'</p><button class="btn-top" onclick="openUXWorkspace(\'finance\')">Kontrollo financat</button> '+(!s.active && !s.effectsApplied && agendaExecutive(state)?'<button class="action-btn" onclick="launchWasteTutorial()">Financo reformën ekzistuese · €'+s.costM+'M</button>':'')+'</aside>';
    host.innerHTML=html+'</section>';var r=agendaExecutive(state)&&x.cycle===mandateCycle(state)?x.news[0]:null;news.hidden=!r;news.innerHTML=r?'<strong>LAJMI I FUNDIT · Republika</strong><h3>'+e(r.title)+'</h3><p>'+e(r.detail)+'</p><p>'+x.news.length+' zhvillime për t’u lexuar</p><button class="btn-top" onclick="dismissMandateNews()">E lexova · Vazhdo</button>':'';
}
