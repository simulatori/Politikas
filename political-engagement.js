/* Extends existing media, meeting, campaign and promise records; no second game clock. */
const PARTY_TOPICS={ECONOMY:'Ekonomia dhe punësimi',CORRUPTION:'Korrupsioni dhe drejtësia',DIALOGUE:'Dialogu dhe diplomacia',UNIONS:'Sindikatat dhe pagat',LOCAL:'Strukturat dhe zhvillimi lokal'};
const PARTY_STANCES={AGGRESSIVE:'Agresiv',PEACEFUL:'Paqësor',DIPLOMATIC:'Diplomatik',POPULIST:'Populist'};
const MEDIA_LINES={BALANCED:'Raportim i balancuar',ATTACK:'Kritikë ndaj kundërshtarit',DEFEND:'Mbrojtje e qeverisë'};
const ENGAGEMENT_STATUS={ACTIVE:'Në proces',COMPLETED:'Përfunduar',CANCELLED:'Anuluar',EXPOSED:'U zbulua',CAMPAIGN:'Premtim në fushatë',FULFILLED:'I realizuar',FAILED:'I pambajtur',LOST:'Pa mandat qeverisës'};
const THEMATIC_GOALS={BRIEF:'Raport dhe transparencë',NEGOTIATE:'Negociim i hapave konkretë',COORDINATE:'Koordinim dhe përgjegjësi'};
const SPECIAL_PLEDGES={WAGES:{title:'Rritje e financimit të pagave në Arsim',sector:'sec_edu',ministry:'mashti',annualM:96,groups:{public:2,youth:1}},FARMERS:{title:'Subvencione vjetore për fermerët',sector:'sec_agri',ministry:'mbpzhr',annualM:20,groups:{business:1.5,public:.5}},CAPITAL:{title:'Projekte kapitale në komunë',sector:'sec_local',ministry:null,annualM:0,groups:{youth:1,business:1}}};
function engagementData(st){migrateMediaWarfare(st);const market=st.mediaWarfare.market;if(!market.engagement)market.engagement={version:1,lastMediaTurn:st.turnCount,actions:[],conferences:[],meetingEffects:[]};return market.engagement;}
function engagementCommit(change){
    if(!state.playerParty||state.pendingVote||_voteInProgress||weeklyProcessing||weeklyVisualBusy||['VOTING','COUNTING','CAMPAIGN_CLOSED'].includes(state.electionPhase))return false;
    const before=JSON.stringify(state);try{engagementData(state);change();validateLoadedState(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}catch(e){state=JSON.parse(before);showToast(e.message);return false;}refreshAllUI();return true;
}
function politicalPollEffect(owner,delta,reason){
    if(campaignIsActive()){recordCampaignShift(owner,delta,reason);return;}
    if(delta<0){redistributeScandalPolls(state,owner,-delta);return;}
    const p=state.parties[owner],others=Object.values(state.parties).filter(q=>q!==p),sum=others.reduce((n,q)=>n+q.poll,0),gain=Math.min(delta,Math.max(0,95-p.poll),sum);if(!sum)return;p.poll+=gain;others.forEach(q=>q.poll-=gain*q.poll/sum);
}
function politicalGroupEffect(owner,key,deltas){const direction=owner===state.mandatar&&state.governmentFormed?1:-1;applyInterestDecision(key,Object.fromEntries(Object.entries(deltas).map(([k,v])=>[k,v*direction])));}
function currentPoliticalThemes(st){
    const themes=['ECONOMY','DIALOGUE','LOCAL'];
    if(currentGeneralStrike(st)||Object.values(st.unions?.sectors||{}).some(r=>r.status!=='NORMAL'))themes.unshift('UNIONS');
    if(st.leakRisk>=30||st.governance?.pendingScandal||st.justiceReform?.status==='ACTIVE')themes.unshift('CORRUPTION');
    if(st.foreignInvestments)themes.push('INVESTORS');return themes;
}
function politicalThemeLabel(key){return key==='INVESTORS'?'Investitorët e huaj dhe zbatimi':PARTY_TOPICS[key];}
function politicalThemeContext(st,key){return ({ECONOMY:'Buxheti '+enterpriseMoney(st.budgetTotalB)+' · papunësia '+st.unemployment+'%',CORRUPTION:'Rreziku i dosjeve '+st.leakRisk+'% · Vettingu '+st.justiceReform.status,DIALOGUE:'Presioni ndërkombëtar '+st.internationalPressure+'%',UNIONS:'Arsim/Shëndetësi · '+(currentGeneralStrike(st)?.status||'Kërkesa sektoriale aktive'),LOCAL:'Strukturat dhe projektet komunale · java '+st.turnCount,INVESTORS:'Profile në proces: '+(st.foreignInvestments?.bidders||[]).filter(b=>['NEGOTIATING','SIGNED'].includes(b.status)).length})[key]||'';}
function partyPressPreview(){const topic=document.getElementById('partyPressTopic')?.value,stance=document.getElementById('partyPressStance')?.value,h=document.getElementById('partyPressPreview');if(h)h.textContent=(politicalThemeLabel(topic)||'')+': '+({AGGRESSIVE:'Kërkojmë llogaridhënie dhe kundërshtojmë dështimet.',PEACEFUL:'Ftojmë palët në dialog dhe zgjidhje të përbashkëta.',DIPLOMATIC:'Kërkojmë koordinim institucional dhe hapa të matshëm.',POPULIST:'Prioritet i menjëhershëm për qytetarët dhe lehtësim të barrës.'})[stance]+' '+politicalThemeContext(state,topic);}
function openStructuredPartyPress(){
    const e=catalogEscape;document.getElementById('interactiveActionModalContent').innerHTML='<h2>Konferenca e '+e(state.parties[state.playerParty].short)+'</h2><p>Komunikim partiak · €2,000 · një konferencë në javë.</p><label>Tema<select id="partyPressTopic" onchange="partyPressPreview()">'+Object.entries(PARTY_TOPICS).map(([k,v])=>'<option value="'+k+'">'+e(v)+(currentPoliticalThemes(state).includes(k)?' · aktuale':'')+'</option>').join('')+'</select></label><label>Qëndrimi<select id="partyPressStance" onchange="partyPressPreview()">'+Object.entries(PARTY_STANCES).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</select></label><p id="partyPressPreview"></p><button class="action-btn" onclick="holdStructuredPartyPress(document.getElementById(\'partyPressTopic\').value,document.getElementById(\'partyPressStance\').value)">Mbaj konferencën</button><button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button>';toggleModal('interactiveActionModal',true);partyPressPreview();
}
function holdStructuredPartyPress(topic,stance){
    const ok=engagementCommit(()=>{const d=engagementData(state),owner=state.playerParty;if(!PARTY_TOPICS[topic]||!PARTY_STANCES[stance]||d.conferences.some(r=>r.owner===owner&&r.turn===state.turnCount))throw Error('Zgjidhni temën/qëndrimin; lejohet një konferencë në javë.');oppositionSpend(2000);
        const repeat=stance==='POPULIST'&&d.conferences.filter(r=>r.owner===owner).slice(-2).some(r=>r.stance==='POPULIST'),delta=repeat?-.2:currentPoliticalThemes(state).includes(topic)?.16:.08;
        const groups=topic==='ECONOMY'?{business:.5,youth:.3}:topic==='CORRUPTION'?{youth:.5,public:.2}:topic==='UNIONS'?{public:.6}:topic==='LOCAL'?{youth:.3,pensioners:.3}:{business:.3,public:.2};
        if(stance==='AGGRESSIVE'){groups.youth=(groups.youth||0)+.2;groups.business=(groups.business||0)-.4;state.governance.mediaTrust=clamp(state.governance.mediaTrust-1,0,100);}if(stance==='POPULIST')groups.business=(groups.business||0)-.5;
        if(stance==='PEACEFUL'){groups.public=(groups.public||0)+.2;groups.pensioners=(groups.pensioners||0)+.3;}
        if(stance==='DIPLOMATIC'){groups.business=(groups.business||0)+.3;groups.youth=(groups.youth||0)-.1;}
        if(stance==='DIPLOMATIC'&&topic==='DIALOGUE'&&agendaExecutive())state.internationalPressure=Math.max(0,state.internationalPressure-1);
        d.conferences.push({owner,topic,stance,turn:state.turnCount,cost:2000,delta,repeat});politicalPollEffect(owner,delta,'Konferencë: '+politicalThemeLabel(topic));politicalGroupEffect(owner,'party-press:'+owner+':'+state.turnCount,groups);
        addMediaNews('Konferencë e partisë',state.parties[owner].short+' · '+politicalThemeLabel(topic),'NEUTRAL',PARTY_STANCES[stance]+' · '+politicalThemeContext(state,topic));
    });if(ok)toggleModal('interactiveActionModal',false);return ok;
}
function managedMediaLine(st,outletId){const owner=st.mediaWarfare?.market.outlets.find(o=>o.id===outletId)?.owner;return (st.mediaWarfare?.market.engagement?.actions||[]).filter(a=>a.outletId===outletId&&a.owner===owner&&a.kind==='EDITORIAL').at(-1)?.line||'BALANCED';}
function ownedMediaDefence(st,party){return Math.max(.55,1-(st.mediaWarfare?.market.outlets||[]).filter(o=>o.owner===party&&managedMediaLine(st,o.id)==='DEFEND').length*.15);}
function createOwnedMediaAction(owner,outletId,kind,params={}){
    const d=engagementData(state),o=state.mediaWarfare.market.outlets.find(o=>o.id===outletId);if(!o||o.owner!==owner||!['EDITORIAL','SPONSOR','DIRTY'].includes(kind))throw Error('Menaxhimi i takon pronarit të medias.');
    if(d.actions.some(a=>a.owner===owner&&a.outletId===outletId&&a.kind===kind&&a.turn===state.turnCount)||kind==='SPONSOR'&&d.actions.some(a=>a.outletId===outletId&&a.kind===kind&&a.status==='ACTIVE')||kind==='DIRTY'&&d.actions.some(a=>a.owner===owner&&a.kind===kind&&state.turnCount-a.turn<4))throw Error('Ky veprim është në proces ose në periudhë pushimi.');
    let minister=null;if(kind==='EDITORIAL'&&!MEDIA_LINES[params.line])throw Error('Linjë editoriale e pavlefshme.');if(kind==='DIRTY'){minister=state.ministries.find(m=>m.id===params.ministryId&&m.party!==owner&&m.minister!=='I/E paemëruar');if(!minister)throw Error('Zgjidhni një ministër rival aktual.');}
    const cost=kind==='SPONSOR'?20000:kind==='DIRTY'?25000:0,p=state.parties[owner];if(p.partyFunds<cost)throw Error('Buxheti i partisë nuk mjafton.');p.partyFunds-=cost;
    const a={id:'media-managed:'+d.actions.length,owner,outletId,kind,turn:state.turnCount,cost,line:kind==='EDITORIAL'?params.line:null,targetMinistry:minister?.id||null,targetName:minister?.minister||null,targetParty:minister?.party||null,roll:kind==='DIRTY'?Math.random():null,status:kind==='EDITORIAL'?'COMPLETED':'ACTIVE',executedTurns:[]};d.actions.push(a);
    if(kind==='DIRTY'&&owner===state.playerParty&&agendaExecutive())recordLeakRisk('FAVOUR',a.id,null,15);return a;
}
function manageOwnedMedia(outletId,kind,params){const ok=engagementCommit(()=>createOwnedMediaAction(state.playerParty,outletId,kind,params));if(ok)openOwnedMedia(outletId);return ok;}
function openOwnedMedia(id){
    const o=state.mediaWarfare?.market.outlets.find(o=>o.id===id);if(!o?.owner)return false;const def=MEDIA_OUTLETS.find(x=>x.id===id),e=catalogEscape,own=o.owner===state.playerParty;
    const actions=state.mediaWarfare.market.engagement?.actions||[];
    let html='<h2>'+e(def.name)+'</h2><p>Pronari: '+e(state.parties[o.owner].short)+' · Linja: '+MEDIA_LINES[managedMediaLine(state,id)]+'</p>';
    if(own)html+='<label>Linja editoriale<select id="ownedMediaLine">'+Object.entries(MEDIA_LINES).map(([k,v])=>'<option value="'+k+'" '+(managedMediaLine(state,id)===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label><button class="action-btn" onclick="manageOwnedMedia(\''+id+'\',\'EDITORIAL\',{line:document.getElementById(\'ownedMediaLine\').value})">Zbato linjën</button><p>Mbrojtja e qeverisë zbut skandalet e saj; raportimi i balancuar ruan besimin.</p><button class="action-btn" onclick="manageOwnedMedia(\''+id+'\',\'SPONSOR\',{})">Planifiko 4 emisione javore · €20,000</button><label>Ministri rival<select id="ownedMediaMinister"><option value="">Zgjidh ministrin</option>'+state.ministries.filter(m=>m.party!==o.owner&&m.minister!=='I/E paemëruar').map(m=>'<option value="'+e(m.id)+'">'+e(m.minister)+' · '+e(m.name)+'</option>').join('')+'</select></label><button class="action-btn" onclick="manageOwnedMedia(\''+id+'\',\'DIRTY\',{ministryId:document.getElementById(\'ownedMediaMinister\').value})">Fushatë e pistë · €25,000 · rrezik zbulimi 20%</button>';
    html+='<h3>Orari dhe veprimet</h3>'+actions.filter(a=>a.outletId===id).slice(-8).reverse().map(a=>'<p>'+({EDITORIAL:'Linja editoriale',SPONSOR:'Emisione të sponsorizuara',DIRTY:'Fushatë e pistë'})[a.kind]+' · '+e(ENGAGEMENT_STATUS[a.status])+' · Java '+a.turn+(a.kind==='SPONSOR'?' · Javët '+(a.turn+1)+'–'+(a.turn+4):'')+' · transmetime '+a.executedTurns.length+'</p>').join('')+'<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button>';
    document.getElementById('interactiveActionModalContent').innerHTML=html;toggleModal('interactiveActionModal',true);return true;
}
function processManagedMediaWeek(turn){
    const d=engagementData(state);
    if(turn<=d.lastMediaTurn)return;d.lastMediaTurn=turn;
    for(const o of state.mediaWarfare.market.outlets.filter(o=>o.owner&&o.owner!==state.playerParty)){
        const preferred=o.owner===state.mandatar&&state.governmentFormed?'DEFEND':'ATTACK';
        if(managedMediaLine(state,o.id)!==preferred&&!d.actions.some(a=>a.owner===o.owner&&a.outletId===o.id&&a.kind==='EDITORIAL'&&a.turn===turn))createOwnedMediaAction(o.owner,o.id,'EDITORIAL',{line:preferred});
        if(turn%8===0&&state.parties[o.owner].partyFunds>=20000&&!d.actions.some(a=>a.outletId===o.id&&a.kind==='SPONSOR'&&a.status==='ACTIVE'))createOwnedMediaAction(o.owner,o.id,'SPONSOR');
    }
    for(const a of d.actions.filter(a=>a.status==='ACTIVE'&&turn>a.turn&&!a.executedTurns.includes(turn))){
        if(a.kind==='SPONSOR'){if(turn>a.turn+4){a.status='COMPLETED';continue;}politicalPollEffect(a.owner,.08,'Emision i sponsorizuar');a.executedTurns.push(turn);if(turn===a.turn+4)a.status='COMPLETED';}
        if(a.kind==='DIRTY'){const m=state.ministries.find(m=>m.id===a.targetMinistry);if(!m||m.minister!==a.targetName||m.party!==a.targetParty){a.status='CANCELLED';continue;}const exposed=a.roll<.2;politicalPollEffect(exposed?a.owner:a.targetParty,exposed?-.8:-1.2,'Fushatë mediatike e simulimit');a.executedTurns.push(turn);a.status=exposed?'EXPOSED':'COMPLETED';addMediaNews('Media · simulim',exposed?'Zbulohet fushata e fabrikuar':'Akuzë e pakonfirmuar ndaj ministrit rival','CRITICAL','Ngjarje fiktive e lojës; '+MEDIA_OUTLETS.find(o=>o.id===a.outletId).name);}
    }
    for(const o of state.mediaWarfare.market.outlets.filter(o=>o.owner)){
        const line=managedMediaLine(state,o.id);
        if(line==='ATTACK'){const target=o.owner!==state.mandatar?state.mandatar:Object.keys(state.parties).filter(id=>id!==o.owner).sort((a,b)=>state.parties[b].poll-state.parties[a].poll)[0];if(target&&target!==o.owner)politicalPollEffect(target,-.05,'Linjë editoriale kritike');}
        if(o.owner===state.playerParty)state.governance.mediaTrust=clamp(state.governance.mediaTrust+(line==='BALANCED'?.1:line==='ATTACK'?-.1:0),0,100);
    }
}
function thematicMeetingKeys(cat){return currentPoliticalThemes(state).filter(k=>k!=='UNIONS'||['MINISTERS','CIVIL_ECON','PARTY_LEADERS'].includes(cat)).filter(k=>k!=='INVESTORS'||['MINISTERS','CIVIL_ECON','INTL_DIPLOMATS'].includes(cat));}
function refreshThematicMeetingOptions(){const topic=document.getElementById('schedTopic'),cat=document.getElementById('schedCat')?.value;if(!topic)return;const selected=topic.value;topic.innerHTML=thematicMeetingKeys(cat).map(k=>'<option value="THEME:'+k+'">'+catalogEscape(politicalThemeLabel(k))+' · '+catalogEscape(politicalThemeContext(state,k))+'</option>').join('');if(Array.from(topic.options).some(o=>o.value===selected))topic.value=selected;}
function enhanceThematicMeetingForm(){
    const goal=document.getElementById('schedGoal');if(!goal)return;const sel=document.createElement('select');sel.id='schedGoal';sel.innerHTML=Object.entries(THEMATIC_GOALS).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('');goal.replaceWith(sel);
    document.getElementById('newCustomInterName')?.closest('details')?.remove();const filter=document.getElementById('schedFilterInput');if(filter){filter.type='hidden';filter.parentElement.hidden=true;}
    const cat=document.getElementById('schedCat');if(cat)cat.setAttribute('onchange','populateInterlocutorDropdown();refreshThematicMeetingOptions()');refreshThematicMeetingOptions();
}
function attachThematicMeeting(m){
    const key=m.topic.replace('THEME:','');if(!thematicMeetingKeys(m.categoryKey).includes(key)||!THEMATIC_GOALS[m.goal])throw Error('Zgjidhni një temë aktuale dhe qëllim të paracaktuar.');
    m.thematic={key,goal:m.goal,applied:false,context:politicalThemeContext(state,key)};m.topic=politicalThemeLabel(key);m.goal=THEMATIC_GOALS[m.thematic.goal]+' · '+m.thematic.context;
}
function applyThematicMeetingOutcome(m,scene){
    const t=m.thematic;if(!t||t.applied)return;const d=engagementData(state),discussed=scene.decisions.some(a=>['PROPOSE','CLARIFY'].includes(a.code)),duplicate=d.meetingEffects.some(a=>a.owner===state.playerParty&&a.key===t.key&&a.turn===state.turnCount);
    t.applied=true;d.meetingEffects.push({meetingId:m.id,owner:state.playerParty,key:t.key,turn:state.turnCount,effective:discussed&&!duplicate});if(!discussed||duplicate)return;
    politicalPollEffect(state.playerParty,.08,'Takim: '+m.topic);politicalGroupEffect(state.playerParty,'thematic:'+m.id,t.key==='UNIONS'?{public:.5}:t.key==='LOCAL'?{youth:.3,pensioners:.2}:{business:.4});
    if(agendaExecutive()&&t.key==='DIALOGUE'&&t.goal==='COORDINATE')state.internationalPressure=Math.max(0,state.internationalPressure-1);
    if(t.key==='LOCAL'){const city=state.municipalities.find(c=>m.targetName.startsWith(c.mayorName));if(city&&agendaExecutive())city.relationWithGov=clamp((city.relationWithGov||60)+3,0,100);}
    m.outcome+=' Tema u trajtua: '+m.topic+'. '+(t.key==='UNIONS'?'Kërkesat financiare mbeten në negociatat e sindikatave.':t.key==='INVESTORS'?'Hapat financiarë vijojnë në panelin IHD.':'Koordinimi u regjistrua.');
}
function openThematicWorkspace(key){toggleModal('interactiveActionModal',false);if(key==='LOCAL'){openStateDevelopment();return;}if(key==='DIALOGUE'){switchMainTab('tab-diplomacy');return;}if(!agendaExecutive()){switchMainTab('tab-party');return;}switchMainTab('tab-government');const sub=({UNIONS:'unions',INVESTORS:'investments',CORRUPTION:'justice',ECONOMY:'macro'})[key];if(sub){const pill=Array.from(document.querySelectorAll('#tab-government .sub-pill')).find(b=>(b.getAttribute('onclick')||'').includes("'"+sub+"'"));switchSubTab('gov',sub,pill);}}
function openThematicOutcome(m){const e=catalogEscape;document.getElementById('interactiveActionModalContent').innerHTML='<h2>'+e(m.topic)+'</h2><p>'+e(m.outcome)+'</p><p>Agjenda: '+e(m.goal)+'</p><button class="action-btn" onclick="openThematicWorkspace(\''+m.thematic.key+'\')">Vazhdo te hapat e kësaj teme</button><button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button>';toggleModal('interactiveActionModal',true);}
function chooseSpecialCampaignPledge(code,municipalityId){return engagementCommit(()=>{
    const c=state.electionCampaign,def=SPECIAL_PLEDGES[code];if(!campaignIsActive()||!def||c.programme.filter(p=>p.specialPledge&&p.partyId===state.playerParty).length>=3||c.programme.some(p=>p.specialPledge?.code===code&&p.partyId===state.playerParty))throw Error('Zgjidhni deri tri premtime të ndryshme gjatë fushatës.');
    const city=code==='CAPITAL'?state.municipalities.find(m=>m.id===municipalityId):null;if(code==='CAPITAL'&&!city)throw Error('Zgjidhni komunën.');
    const id='special-pledge:'+c.startWeek+':'+state.playerParty+':'+code,title=def.title+(city?' · '+city.name:''),r={code,owner:state.playerParty,campaignStart:c.startWeek,municipalityId:city?.id||null,status:'CAMPAIGN',startedTurn:null,dueTurn:null,governmentCycle:null,lastTurn:state.turnCount,targetBudgetM:null,baselineProjects:[],fundedWeeks:[],unpaidWeeks:0,brokenFundingTurn:null,protestTriggered:false};
    c.programme.push({id,partyId:state.playerParty,title,description:code==='CAPITAL'?'Përfundim projektesh të reja prej €30M brenda vitit të parë.':'+€'+def.annualM+'M/vit financim, të paktën katër javë pagesa reale brenda vitit të parë.',sector:electoralProgrammeSector(def.sector),estimatedCost:code==='CAPITAL'?30000000:def.annualM*1000000,status:'ACTIVE',createdTurn:state.turnCount,specialPledge:{code,municipalityId:r.municipalityId}});c.promiseCounter++;
    const trust=typeof electoralPromiseCredibility==='function'?electoralPromiseCredibility(state,state.playerParty):1;
    state.promises.push({id,title,costB:0,deadlineWeeks:48,progress:0,fulfilled:false,source:'Premtim i veçantë zgjedhor',specialPromise:r});recordCampaignShift(state.playerParty,.2*trust,'Premtim: '+title);politicalGroupEffect(state.playerParty,'campaign-special:'+id,Object.fromEntries(Object.entries(def.groups).map(([key,value])=>[key,value*trust])));
});}
function specialMunicipalProjects(st){return [...new Map([...(st.governmentCatalog?.projects||[]),...(st.developmentProjects||[])].filter(p=>p.municipalityId).map(p=>[p.id,p])).values()];}
function specialCapitalDelivered(st,r){return specialMunicipalProjects(st).filter(x=>x.municipalityId===r.municipalityId&&x.status==='COMPLETED'&&!r.baselineProjects.includes(x.id)).reduce((n,x)=>n+(x.costB??x.costM/1000),0);}
function activateSpecialPromises(st){
    const c=st.electionCampaign;if(!c||c.status!=='CLOSED'||!st.governmentFormed||st.governmentApprovalWeek<c.electionTurn)return;
    for(const p of st.promises.filter(p=>p.specialPromise?.status==='CAMPAIGN')){const r=p.specialPromise,def=SPECIAL_PLEDGES[r.code];if(c.startWeek!==r.campaignStart||!agendaExecutive(st)||st.playerParty!==r.owner){r.status='LOST';continue;}
        r.status='ACTIVE';r.startedTurn=r.lastTurn=st.turnCount;r.dueTurn=st.turnCount+48;r.governmentCycle=deputyCycleId(st);r.targetBudgetM=def.ministry?(st.ministries.find(m=>m.id===def.ministry)?.budget||0)+def.annualM:null;r.baselineProjects=specialMunicipalProjects(st).filter(x=>x.fundingCommitted||st.governmentCatalog.ledger.some(p=>p.id===x.id)).map(x=>x.id);
    }
}
function processSpecialPromisesWeek(turn){
    activateSpecialPromises(state);
    for(const p of state.promises.filter(p=>p.specialPromise)){const r=p.specialPromise,def=SPECIAL_PLEDGES[r.code];
        if(r.status==='FULFILLED'&&def.ministry&&turn>r.lastTurn&&turn<=r.dueTurn&&agendaExecutive()&&r.governmentCycle===deputyCycleId(state)){
            r.lastTurn=turn;const m=state.ministries.find(m=>m.id===def.ministry),funding=state.unions?.operatingFunding;r.unpaidWeeks=funding?.turn===turn&&funding.ratio>=.95?0:r.unpaidWeeks+1;
            if(m.budget<r.targetBudgetM||r.unpaidWeeks>=2){r.status='FAILED';r.brokenFundingTurn=turn;p.fulfilled=false;p.progress=99;politicalGroupEffect(r.owner,'special-failed:'+p.id,Object.fromEntries(Object.keys(def.groups).map(k=>[k,-6])));const programme=state.electionCampaign?.programme.find(q=>q.id===p.id);if(programme)programme.status='UNFULFILLED';}
        }
        if(r.status!=='ACTIVE'||turn<=r.lastTurn)continue;r.lastTurn=turn;
        if(!agendaExecutive()||state.playerParty!==r.owner||r.governmentCycle!==deputyCycleId(state)){r.status='CANCELLED';continue;}p.deadlineWeeks=Math.max(0,r.dueTurn-turn);
        if(def.ministry){const m=state.ministries.find(m=>m.id===def.ministry),funding=state.unions?.operatingFunding;if(m?.budget>=r.targetBudgetM&&funding?.turn===turn&&funding.ratio>=.95)r.fundedWeeks.push(turn);p.progress=Math.min(100,r.fundedWeeks.length/4*100);}
        else {p.progress=Math.min(100,specialCapitalDelivered(state,r)/.03*100);}
        if(p.progress>=100){r.status='FULFILLED';p.fulfilled=true;politicalGroupEffect(r.owner,'special-fulfilled:'+p.id,def.groups);}
        else if(turn>=r.dueTurn){r.status='FAILED';politicalGroupEffect(r.owner,'special-failed:'+p.id,Object.fromEntries(Object.keys(def.groups).map(k=>[k,-6])));}
        const programme=state.electionCampaign?.programme.find(q=>q.id===p.id);if(programme&&['FULFILLED','FAILED'].includes(r.status))programme.status=p.fulfilled?'FULFILLED':'UNFULFILLED';
    }
    for(const p of state.promises.filter(p=>p.specialPromise?.status==='FAILED'&&!p.specialPromise.protestTriggered&&agendaExecutive()&&p.specialPromise.governmentCycle===deputyCycleId(state))){if(createStreetProtest('Premtim i veçantë i pambajtur: '+p.title,SPECIAL_PLEDGES[p.specialPromise.code].sector,null)){p.specialPromise.protestTriggered=true;state.streetProtests.events.at(-1).specialPromiseId=p.id;}}
}
function fundSpecialPromise(id){
    const p=state.promises.find(p=>p.id===id),r=p?.specialPromise,def=SPECIAL_PLEDGES[r?.code];if(!agendaExecutive()||r?.status!=='ACTIVE'||r.owner!==state.playerParty)return false;
    if(!def.ministry){openStateDevelopment();return true;}const index=state.ministries.findIndex(m=>m.id===def.ministry);return fiscalAdjustMinistry(index,r.targetBudgetM);
}
function specialPledgeMarkup(){const c=state.electionCampaign,e=catalogEscape;let html='<h3>Premtimet e veçanta zgjedhore</h3>';
    if(campaignIsActive())html+='<div class="pressure-grid">'+Object.entries(SPECIAL_PLEDGES).map(([k,d])=>'<article class="card"><h4>'+e(d.title)+'</h4><p>'+(d.ministry?'€'+d.annualM+'M/vit dhe 4 javë financim real':'€30M projekte të përfunduara në komunë')+' · afati 48 javë pas ardhjes në pushtet.</p>'+(k==='CAPITAL'?'<select id="specialPledgeMunicipality">'+state.municipalities.map(m=>'<option value="'+e(m.id)+'">'+e(m.name)+'</option>').join('')+'</select>':'')+'<button class="action-btn" onclick="chooseSpecialCampaignPledge(\''+k+'\','+(k==='CAPITAL'?'document.getElementById(\'specialPledgeMunicipality\').value':'null')+')">Zgjidh premtimin</button></article>').join('')+'</div>';
    html+=state.promises.filter(p=>p.specialPromise).slice(-9).map(p=>'<article class="card"><strong>'+e(p.title)+'</strong><p>'+e(ENGAGEMENT_STATUS[p.specialPromise.status])+' · '+Math.round(p.progress)+'% · afati '+p.deadlineWeeks+' javë</p>'+(SPECIAL_PLEDGES[p.specialPromise.code].ministry?'<p>Financimi duhet ruajtur gjatë vitit të parë. Shkurtimi ose mospagesat e përsëritura e kthejnë premtimin në dështim.</p>':'')+(p.specialPromise.status==='ACTIVE'&&agendaExecutive()?'<button class="action-btn" onclick="fundSpecialPromise(\''+e(p.id)+'\')">'+(SPECIAL_PLEDGES[p.specialPromise.code].ministry?'Planifiko financimin real':'Hap projektet e komunës')+'</button>':'')+'</article>').join('');return html;
}
function renderSpecialPledges(){for(const id of ['specialCampaignPledgePanel','specialMandatePledgePanel']){const h=document.getElementById(id);if(h)h.innerHTML=specialPledgeMarkup();}}
function validatePoliticalEngagement(st){
    const d=st.mediaWarfare?.market?.engagement,bad=()=>{throw Error('Komunikimi politik ose premtimi nuk është i vlefshëm.');},turn=n=>Number.isInteger(n)&&n>=0&&n<=st.turnCount;
    if(d){if(d.version!==1||!turn(d.lastMediaTurn)||!Array.isArray(d.actions)||!Array.isArray(d.conferences)||!Array.isArray(d.meetingEffects))bad();
        d.actions.forEach((a,i)=>{if(a.id!=='media-managed:'+i||!st.parties[a.owner]||!MEDIA_OUTLETS.some(o=>o.id===a.outletId)||!turn(a.turn)||!['EDITORIAL','SPONSOR','DIRTY'].includes(a.kind)||a.cost!==(a.kind==='SPONSOR'?20000:a.kind==='DIRTY'?25000:0)||!['ACTIVE','COMPLETED','CANCELLED','EXPOSED'].includes(a.status)||!Array.isArray(a.executedTurns)||new Set(a.executedTurns).size!==a.executedTurns.length||a.executedTurns.some(t=>!turn(t)||t<=a.turn)||a.kind==='EDITORIAL'&&!MEDIA_LINES[a.line]||a.kind==='DIRTY'&&(!Number.isFinite(a.roll)||a.roll<0||a.roll>=1||!st.parties[a.targetParty]||typeof a.targetName!=='string'||!st.ministries.some(m=>m.id===a.targetMinistry)))bad();});
        const used=new Set();d.conferences.forEach(r=>{const key=r.owner+':'+r.turn;if(!st.parties[r.owner]||!turn(r.turn)||used.has(key)||!PARTY_TOPICS[r.topic]||!PARTY_STANCES[r.stance]||r.cost!==2000||![-.2,.08,.16].includes(r.delta)||typeof r.repeat!=='boolean')bad();used.add(key);});
        d.meetingEffects.forEach(r=>{if(!turn(r.turn)||!st.parties[r.owner]||!st.scheduledMeetings.some(m=>m.id===r.meetingId&&m.thematic?.key===r.key)||typeof r.effective!=='boolean')bad();});
    }
    st.scheduledMeetings.filter(m=>m.thematic).forEach(m=>{const t=m.thematic;if(![...Object.keys(PARTY_TOPICS),'INVESTORS'].includes(t.key)||!THEMATIC_GOALS[t.goal]||typeof t.applied!=='boolean'||typeof t.context!=='string'||t.applied&&!d?.meetingEffects.some(r=>r.meetingId===m.id))bad();});
    const pledgeIds=new Set();
    st.promises.filter(p=>p.specialPromise).forEach(p=>{
        const r=p.specialPromise,def=SPECIAL_PLEDGES[r.code],active=['ACTIVE','FULFILLED','FAILED','CANCELLED'].includes(r.status);
        if(pledgeIds.has(p.id)||!def||!st.parties[r.owner]||!turn(r.campaignStart)||!turn(r.lastTurn)||!['CAMPAIGN','ACTIVE','FULFILLED','FAILED','LOST','CANCELLED'].includes(r.status)||!Array.isArray(r.baselineProjects)||!Array.isArray(r.fundedWeeks)||r.fundedWeeks.length>4||new Set(r.fundedWeeks).size!==r.fundedWeeks.length||r.fundedWeeks.some(t=>!turn(t)||t<=r.startedTurn||t>r.dueTurn)||typeof r.protestTriggered!=='boolean'||p.costB!==0||!Number.isFinite(p.progress)||p.progress<0||p.progress>100||p.fulfilled!==(r.status==='FULFILLED')||!Number.isInteger(r.unpaidWeeks)||r.unpaidWeeks<0||r.unpaidWeeks>2||r.code==='CAPITAL'&&!st.municipalities.some(m=>m.id===r.municipalityId))bad();pledgeIds.add(p.id);
        if(active?(!turn(r.startedTurn)||r.dueTurn!==r.startedTurn+48||typeof r.governmentCycle!=='string'||def.ministry&&(!Number.isFinite(r.targetBudgetM)||r.targetBudgetM<def.annualM)):(r.startedTurn!==null||r.dueTurn!==null||r.governmentCycle!==null))bad();
        if(r.brokenFundingTurn!==null&&(!def.ministry||r.status!=='FAILED'||!turn(r.brokenFundingTurn)||r.brokenFundingTurn<=r.startedTurn||r.brokenFundingTurn>r.dueTurn))bad();
        if(r.status==='FAILED'&&r.brokenFundingTurn===null&&st.turnCount<r.dueTurn||r.status==='FULFILLED'&&(p.progress!==100||def.ministry&&r.fundedWeeks.length!==4))bad();
        if(st.electionCampaign?.startWeek===r.campaignStart&&!st.electionCampaign.programme.some(q=>q.id===p.id&&q.partyId===r.owner&&q.specialPledge?.code===r.code))bad();
    });
}
POLITICAL_EXECUTIVE_ACTIONS.push('fundSpecialPromise');
