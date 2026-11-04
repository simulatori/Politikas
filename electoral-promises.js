/* Reuses campaign.programme, state.promises, funded stars and street protests. */
function migrateElectoralAccountability(st){if(st.electoralAccountability===undefined)st.electoralAccountability={version:1,lastTurn:st.turnCount};}
function regularCampaignDue(st){
    var c=st.electionCampaign,finished=!c||c.status==='CLOSED'&&(st.constituentSessions||[]).some(s=>s.cycleId===electionDayCycleId(st)&&s.status==='COMPLETED');
    return st.weeksToNextRegularElection>0&&st.weeksToNextRegularElection<=4&&st.assemblyConstituted&&finished&&!['VOTING','COUNTING'].includes(getElectionDayCycle(st)?.status);
}
function ensureRegularCampaign(st){
    if(!regularCampaignDue(st))return false;
    st.electionCampaign={regular:true,startWeek:Math.max(1,st.turnCount-(4-st.weeksToNextRegularElection)),campaignDurationWeeks:4,weeksRemaining:4,activities:[],debates:[],polls:[],declaredBy:'Kalendari i mandatit',basis:'Katër javët e fundit të mandatit',previousGovernment:{primeMinister:st.primeMinister,coalitionParties:st.coalitionParties.slice(),ministries:JSON.parse(JSON.stringify(st.ministries))}};st.electionPhase='CAMPAIGN';migrateCampaignState(st);if(typeof ensureElectionDraw==='function')ensureElectionDraw(st);return true;
}
function legislativeCampaignClosed(st){st=st||state;var c=st.electionCampaign;return !!c&&c.regular===true&&st.weeksToNextRegularElection<=4;}
function electoralObjectiveRequired(st){var c=st?.electionCampaign;return !!c&&c.regular&&c.status==='ACTIVE'&&!c.programme.some(p=>p.partyId===st.playerParty&&(p.objective||p.specialPledge));}
function electoralProgrammeSector(id){return ({sec_edu:'Arsim',sec_health:'Shëndetësi',sec_roads:'Infrastrukturë',sec_agri:'Bujqësi',sec_justice:'Drejtësi',sec_police:'Siguri',sec_fsk:'Siguri',sec_energy:'Energji dhe mjedis',sec_env:'Energji dhe mjedis',sec_social:'Mirëqenie sociale',sec_tech:'Digjitalizim dhe administratë publike',sec_local:'Zhvillim të komunave'})[id]||'Ekonomi dhe punësim';}
function selectElectoralObjective(sector){
    var c=state.electionCampaign;if(!campaignIsActive()||state.pendingVote||weeklyProcessing||weeklyVisualBusy||!state.stateSectors.some(s=>s.id===sector)||!SECTOR_MANAGEMENT_DEFS[sector])return false;
    if(c.programme.filter(p=>p.partyId===state.playerParty&&p.objective).length>=3||c.programme.some(p=>p.objective?.sectorId===sector)||sectorManagementAverage(state,sector)>=8){showToast('Zgjidhni deri në tri objektiva të papërmbushura dhe të ndryshme.');return false;}
    var before=JSON.stringify(state);try{
        var id='electoral:'+c.startWeek+':'+state.playerParty+':'+sector,s=state.stateSectors.find(s=>s.id===sector),title=s.name.replace(/^\d+\.\s*/,'')+': 8 yje brenda vitit të parë';
        c.programme.push({id,partyId:state.playerParty,title,description:'Premtim i matshëm: cilësi efektive 8/10 brenda 48 javëve nga marrja e detyrës.',sector:electoralProgrammeSector(sector),estimatedCost:null,status:'ACTIVE',createdTurn:state.turnCount,objective:{sectorId:sector,targetStars:8}});c.promiseCounter++;
        state.promises.push({id,title,costB:0,deadlineWeeks:48,progress:0,fulfilled:false,source:'Programi zgjedhor',electoralGoal:{owner:state.playerParty,campaignStart:c.startWeek,sector,targetStars:8,status:'CAMPAIGN',startedTurn:null,dueTurn:null,governmentCycle:null,protestTriggered:false}});
        validateLoadedState(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');
    }catch(e){state=JSON.parse(before);showToast(e.message);return false;}refreshAllUI();return true;
}
function activateElectoralPromises(st){
    activateSpecialPromises(st);
    var c=st.electionCampaign;if(!c||c.status!=='CLOSED'||!Number.isInteger(st.governmentApprovalWeek)||st.governmentApprovalWeek<c.electionTurn||st.weeksToNextRegularElection<=4)return;
    st.promises.filter(p=>p.electoralGoal?.status==='CAMPAIGN').forEach(p=>{var g=p.electoralGoal;
        if(g.campaignStart!==c.startWeek){g.status='LOST';return;}
        if(st.mandatar===g.owner&&st.playerParty===g.owner&&agendaExecutive(st)){g.status='ACTIVE';g.startedTurn=st.turnCount;g.dueTurn=st.turnCount+48;g.governmentCycle=deputyCycleId(st);}else g.status='LOST';
    });
}
function processElectoralPromisesWeek(turn){
    migrateElectoralAccountability(state);var db=state.electoralAccountability;if(turn<=db.lastTurn)return;db.lastTurn=turn;
    state.promises.filter(p=>p.electoralGoal).forEach(p=>{var g=p.electoralGoal;
        if(g.status==='ACTIVE'){
            if(!agendaExecutive()||g.owner!==state.playerParty||g.governmentCycle!==deputyCycleId(state)){g.status='CANCELLED';return;}
            var stars=sectorManagementAverage(state,g.sector);p.progress=Math.min(100,stars/g.targetStars*100);p.deadlineWeeks=Math.max(0,g.dueTurn-turn);
            if(stars>=g.targetStars){g.status='FULFILLED';p.fulfilled=true;}
            else if(turn>=g.dueTurn){g.status='FAILED';if(typeof applyInterestDecision==='function')applyInterestDecision('broken-election-promise:'+p.id,{youth:-6,pensioners:-6,business:-6,public:-6});else rtkApplyApproval(state,-6);state.historyLog.unshift('Premtimi zgjedhor dështoi: '+p.title+'. Fillon mobilizimi qytetar.');}
        }
        if(g.status==='FAILED'&&!g.protestTriggered){
            if(!state.streetProtests)initializeStreetProtests(state);
            if(createStreetProtest('Premtim zgjedhor i pambajtur: '+p.title,g.sector,null)){g.protestTriggered=true;state.streetProtests.events.at(-1).electoralPromiseId=p.id;}
        }
        var programme=state.electionCampaign?.programme.find(x=>x.id===p.id);if(programme&&['FULFILLED','FAILED'].includes(g.status))programme.status=g.status==='FULFILLED'?'FULFILLED':'UNFULFILLED';
    });
}
function validateElectoralAccountability(st){
    var d=st.electoralAccountability;if(d!==undefined&&(!d||d.version!==1||!Number.isInteger(d.lastTurn)||d.lastTurn<0||d.lastTurn>st.turnCount))throw Error('Kalendari i premtimeve është i pavlefshëm.');
    var ids=new Set();st.promises.filter(p=>p.electoralGoal).forEach(p=>{var g=p.electoralGoal,active=['ACTIVE','FULFILLED','FAILED','CANCELLED'].includes(g.status);if(ids.has(p.id)||!st.parties[g.owner]||!Number.isInteger(g.campaignStart)||g.campaignStart<1||g.campaignStart>st.turnCount||!SECTOR_MANAGEMENT_DEFS[g.sector]||g.targetStars!==8||!['CAMPAIGN','ACTIVE','FULFILLED','FAILED','LOST','CANCELLED'].includes(g.status)||typeof g.protestTriggered!=='boolean'||!Number.isFinite(p.progress)||p.progress<0||p.progress>100||p.costB!==0||typeof p.fulfilled!=='boolean'||(active?(!Number.isInteger(g.startedTurn)||g.startedTurn>st.turnCount||g.startedTurn<g.campaignStart||g.dueTurn!==g.startedTurn+48||typeof g.governmentCycle!=='string'):(g.startedTurn!==null||g.dueTurn!==null||g.governmentCycle!==null))||g.status==='FAILED'&&st.turnCount<g.dueTurn||g.status==='FULFILLED'&&!p.fulfilled)throw Error('Premtim zgjedhor i pavlefshëm.');ids.add(p.id);});
    var c=st.electionCampaign;if(c?.programme)c.programme.forEach(p=>{if(p.objective&&(!SECTOR_MANAGEMENT_DEFS[p.objective.sectorId]||p.objective.targetStars!==8||!st.promises.some(x=>x.id===p.id&&x.electoralGoal?.sector===p.objective.sectorId&&x.electoralGoal.owner===p.partyId&&x.electoralGoal.campaignStart===c.startWeek)))throw Error('Objektivi i programit nuk përputhet me premtimin.');});
    st.promises.filter(p=>p.electoralGoal).forEach(p=>{var g=p.electoralGoal,protest=!!st.streetProtests?.events.some(e=>e.electoralPromiseId===p.id);if(p.fulfilled!==(g.status==='FULFILLED')||g.protestTriggered!==protest)throw Error('Rezultati i premtimit nuk përputhet me historikun.');});
}
function renderElectoralAccountability(){
    var banner=document.getElementById('assemblyCampaignBanner');if(banner){banner.hidden=!legislativeCampaignClosed();banner.textContent='Modalitet Fushate: dorëzimi dhe votimi i ligjeve të reja janë pezulluar.';}
    var host=document.getElementById('electoralAccountabilityPanel');if(!host)return;var e=catalogEscape,c=state.electionCampaign,active=campaignIsActive(),rows=state.promises.filter(p=>p.electoralGoal);
    var disclosure=document.getElementById('electoralAccountabilityDisclosure');if(disclosure&&(active||rows.some(p=>p.electoralGoal.status==='ACTIVE'||p.electoralGoal.status==='FAILED')))disclosure.open=true;
    host.innerHTML='<h3>🗳️ Fushata dhe premtimet zgjedhore</h3>'+(c?.regular&&['ACTIVE','READY'].includes(c.status)?'<div class="political-outcome political-outcome--pending"><strong>Modalitet Fushate · '+c.weeksRemaining+' javë të mbetura</strong><p>Kuvendi nuk pranon ose voton ligje të reja. Zbatimi i punëve ekzistuese vazhdon.</p></div>':'')+(active?'<p>Zgjidhni 1–3 objektiva konkrete për vitin e parë të qeverisjes së re.</p><details class="electoral-objective-picker" '+(electoralObjectiveRequired(state)?'open':'')+'><summary>Zgjidh objektivat (deri në 3)</summary><div class="electoral-objectives">'+state.stateSectors.filter(s=>SECTOR_MANAGEMENT_DEFS[s.id]).map(s=>'<button class="action-btn" '+(c.programme.some(p=>p.objective?.sectorId===s.id)||sectorManagementAverage(state,s.id)>=8||c.programme.filter(p=>p.objective).length>=3?'disabled':'')+' onclick="selectElectoralObjective(\''+e(s.id)+'\')">'+e(s.name.replace(/^\d+\.\s*/,''))+' → 8 ⭐</button>').join('')+'</div></details><button class="btn-top" onclick="switchMainTab(\'tab-elections\');switchSubTab(\'elec\',\'campaignplay\',document.getElementById(\'campaignTabBtn\'))">Hap fushatën</button>':'')+rows.slice(-6).map(p=>{var g=p.electoralGoal,labels={CAMPAIGN:'Premtim në fushatë',ACTIVE:'Në zbatim',FULFILLED:'I përmbushur',FAILED:'I pambajtur',LOST:'Pa mandat qeverisës',CANCELLED:'Qeverisja përfundoi'};return '<article class="electoral-pledge"><strong>'+e(p.title)+'</strong><p>'+labels[g.status]+(g.status==='ACTIVE'?' · '+Math.max(0,g.dueTurn-state.turnCount)+' javë':'')+'</p><progress max="100" value="'+p.progress+'" aria-label="'+e(p.title)+'"></progress></article>';}).join('')+(!active&&!rows.length?'<p>Modaliteti automatik hapet katër javë para fundit të mandatit. Premtimet maten me yjet efektive të sektorëve.</p>':'');
}
