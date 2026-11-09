/* Campaign timing, activities and programme; post-election goals live in electoral-promises.js. */
function campaignDuration(c){return c?.regular===true?4:3;}
const CAMPAIGN_SECTORS = ["Ekonomi dhe punësim", "Arsim", "Shëndetësi", "Infrastrukturë", "Bujqësi", "Drejtësi", "Siguri", "Diplomaci dhe integrime evropiane", "Energji dhe mjedis", "Mirëqenie sociale", "Digjitalizim dhe administratë publike", "Zhvillim të komunave"];
const CAMPAIGN_ACTIVITIES = {
    RALLY: { title:"Tubim publik", cost:12000, support:0.18, visibility:2, credibility:0 },
    CITIZENS: { title:"Takim me qytetarë", cost:2000, support:0.08, visibility:1, credibility:1 },
    MUNICIPALITY: { title:"Vizitë në komunë", cost:5000, support:0.12, visibility:1, credibility:1 },
    INTERVIEW: { title:"Intervistë televizive", cost:6000, support:0.14, visibility:2, credibility:1 },
    DEBATE: { title:"Debat me partitë rivale", cost:8000, support:0.20, visibility:2, credibility:2 },
    PROGRAMME: { title:"Prezantim i programit zgjedhor", cost:4000, support:0.10, visibility:1, credibility:2 },
    BUSINESS: { title:"Takim me biznese", cost:3000, support:0.09, visibility:1, credibility:1 },
    YOUTH: { title:"Takim me të rinj", cost:2500, support:0.09, visibility:1, credibility:1 },
    FARMERS: { title:"Takim me fermerë", cost:3000, support:0.09, visibility:1, credibility:1 },
    VIDEO: { title:"Publikim i një videoje ose mesazhi zgjedhor", cost:1800, support:0.08, visibility:2, credibility:0 }
};
const CAMPAIGN_EVENTS = [
    { title:"Një parti rivale publikon një premtim të madh", rival:true, shift:0.10 },
    { title:"Një deklaratë e kandidatit shkakton debat publik", rival:false, shift:-0.10 },
    { title:"Debati televiziv sjell vëmendje pozitive për partinë rivale", rival:true, shift:0.12 },
    { title:"Vizita në komunë merr vëmendje pozitive", rival:false, shift:0.10 },
    { title:"Një premtim kritikohet për mungesë financimi", rival:false, shift:-0.12 },
    { title:"Partia rivale përballet me pyetje për realizueshmërinë e programit", rival:true, shift:-0.10 }
];

function campaignCalendarOffset(calendar, weeks) {
    var total = calendar.year * 48 + calendar.monthIndex * 4 + calendar.week - 1 + weeks;
    return { year:Math.floor(total/48), monthIndex:Math.floor((total%48)/4), week:(total%4)+1 };
}
function campaignCalendarLabel(calendar) {
    return (1+(calendar.week-1)*7) + " " + MONTHS_SQ[calendar.monthIndex] + " " + calendar.year + " (java " + calendar.week + ")";
}
function normalizedCampaignPolls(values) {
    var keys=Object.keys(values), total=keys.reduce(function(sum,key){return sum+Math.max(0,values[key]);},0);
    var rows=keys.map(function(key,index){var exact=total>0?Math.max(0,values[key])/total*10000:10000/keys.length;return {key:key,index:index,units:Math.floor(exact),rest:exact-Math.floor(exact)};});
    var missing=10000-rows.reduce(function(sum,row){return sum+row.units;},0);
    rows.slice().sort(function(a,b){return b.rest-a.rest || a.index-b.index;}).slice(0,missing).forEach(function(row){row.units++;});
    var result={}; rows.forEach(function(row){result[row.key]=row.units/100;}); return result;
}
function latestCampaignPoll(campaign) {
    return campaign.polls.filter(function(poll){return poll && poll.values;}).slice(-1)[0];
}
function migrateCampaignState(gameState) {
    var campaign=gameState.electionCampaign;
    if (!campaign || gameState.electionPhase === "NONE") return;
    if (typeof campaign.moduleVersion !== "undefined") return;
    var duration=campaignDuration(campaign),elapsed=Number.isInteger(campaign.startWeek)?Math.max(0,Math.min(duration,gameState.turnCount-campaign.startWeek)):0;
    campaign.legacyTiming={duration:campaign.campaignDurationWeeks == null ? null:campaign.campaignDurationWeeks,remaining:campaign.weeksRemaining == null?null:campaign.weeksRemaining};
    if(typeof campaign.startWeek === "undefined") campaign.startWeek=gameState.turnCount;
    campaign.moduleVersion=3;
    campaign.campaignDurationWeeks=duration; campaign.weeksRemaining=Math.max(0,duration-elapsed);
    campaign.status=elapsed>=duration?"READY":"ACTIVE";
    campaign.elapsedWeeks=elapsed; campaign.lastProcessedTurn=gameState.turnCount;
    campaign.startCalendar=campaignCalendarOffset(gameState,-elapsed);
    campaign.electionCalendar=campaignCalendarOffset(campaign.startCalendar,duration);
    campaign.electionTurn=campaign.startWeek+duration;
    if(typeof campaign.activities === "undefined") campaign.activities=[];
    if(typeof campaign.debates === "undefined") campaign.debates=[];
    if(typeof campaign.polls === "undefined") campaign.polls=[];
    if(typeof campaign.programme === "undefined")campaign.programme=[];
    if(typeof campaign.events === "undefined")campaign.events=[];
    if(typeof campaign.visibility === "undefined")campaign.visibility=0;
    if(typeof campaign.credibility === "undefined")campaign.credibility=50;
    if(typeof campaign.promiseCounter === "undefined")campaign.promiseCounter=campaign.programme.length;
    if(typeof campaign.closedAt === "undefined")campaign.closedAt=null;
    if(!latestCampaignPoll(campaign)) {
        var values={}; Object.keys(gameState.parties).forEach(function(key){values[key]=gameState.parties[key].poll;});
        campaign.polls.push({turn:gameState.turnCount,reason:"Sondazhi fillestar i simulimit",values:normalizedCampaignPolls(values),deltas:{}});
    }
}
function validateCampaignState(gameState) {
    var campaign=gameState.electionCampaign;
    if(!campaign) return;
    ["activities","debates","polls","programme","events"].forEach(function(key){if(typeof campaign[key]!=="undefined"&&!Array.isArray(campaign[key]))throw Error("Të dhënat e fushatës janë të dëmtuara: "+key);});
    if(typeof campaign.moduleVersion==="undefined") return;
    var duration=campaignDuration(campaign);if(campaign.regular!==undefined&&typeof campaign.regular!=='boolean')throw Error('Lloji i fushatës është i pavlefshëm.');
    if(campaign.moduleVersion!==3 || !["ACTIVE","READY","CLOSED"].includes(campaign.status) || campaign.campaignDurationWeeks!==duration ||
        !Number.isInteger(campaign.elapsedWeeks) || campaign.elapsedWeeks<0 || campaign.elapsedWeeks>duration ||
        !Number.isInteger(campaign.lastProcessedTurn) || !Number.isInteger(campaign.startWeek)) throw Error("Gjendja e fushatës është e pavlefshme");
    ["startCalendar","electionCalendar"].forEach(function(key){var calendar=campaign[key];if(!calendar||!Number.isInteger(calendar.year)||calendar.year<1||!Number.isInteger(calendar.monthIndex)||calendar.monthIndex<0||calendar.monthIndex>11||!Number.isInteger(calendar.week)||calendar.week<1||calendar.week>4)throw Error("Kalendari i fushatës është i pavlefshëm");});
    if(campaign.startWeek<1 || campaign.weeksRemaining!==duration-campaign.elapsedWeeks || campaign.electionTurn!==campaign.startWeek+duration ||
        !Number.isFinite(campaign.visibility)||campaign.visibility<0||campaign.visibility>100||
        !Number.isFinite(campaign.credibility)||campaign.credibility<0||campaign.credibility>100||
        !Number.isInteger(campaign.promiseCounter)||campaign.promiseCounter<0||
        (campaign.status==="ACTIVE"&&campaign.elapsedWeeks===duration)||
        (campaign.status!=="ACTIVE"&&campaign.elapsedWeeks!==campaignDuration(campaign)))throw Error("Progresi i fushatës është i pavlefshëm");
    if(!Array.isArray(campaign.programme)||!Array.isArray(campaign.events)||!Array.isArray(campaign.activities)||!Array.isArray(campaign.polls)||!latestCampaignPoll(campaign))throw Error("Mungojnë të dhënat e fushatës");
    campaign.programme.forEach(function(promise){if(!promise || typeof promise.title!=="string" || typeof promise.description!=="string" || !CAMPAIGN_SECTORS.includes(promise.sector) || !["ACTIVE","FULFILLED","UNFULFILLED"].includes(promise.status) || (promise.estimatedCost!==null && (!Number.isFinite(promise.estimatedCost)||promise.estimatedCost<0)))throw Error("Premtimi zgjedhor është i dëmtuar");});
    // Historical polls retain the participant set from before the new legislature was activated.
    var constituted=(gameState.constituentSessions || []).find(function(s){return s.cycleId===electionDayCycleId(gameState) && s.status==="COMPLETED";});
    var pollPartyIds=constituted?Object.keys(constituted.previousLegislature.partySeats):Object.keys(gameState.parties);
    campaign.polls.forEach(function(poll){if(!poll || !poll.values)return;var keys=pollPartyIds;if(keys.some(function(key){return !Number.isFinite(poll.values[key])||poll.values[key]<0||poll.values[key]>100;}) || Math.abs(keys.reduce(function(sum,key){return sum+poll.values[key];},0)-100)>0.001)throw Error("Sondazhi i ruajtur është i pavlefshëm");});
}
function campaignIsActive() {
    var campaign=state.electionCampaign;
    return state.electionPhase==="CAMPAIGN" && campaign && campaign.moduleVersion===3 && campaign.status==="ACTIVE" && campaign.elapsedWeeks<campaignDuration(campaign);
}
function recordCampaignShift(partyId,amount,reason) {
    var campaign=state.electionCampaign, previous=latestCampaignPoll(campaign), values=Object.assign({},previous.values);
    // A single campaign influence is limited to 0.25 percentage points, including rivals.
    var actual=Math.max(-0.25,Math.min(0.25,amount));
    actual=Math.max(-values[partyId],Math.min(actual,Math.max(0,75-values[partyId])));
    var others=Object.keys(values).filter(function(key){return key!==partyId;}), donorTotal=others.reduce(function(sum,key){return sum+values[key];},0);
    if(donorTotal<=0)return;
    values[partyId]+=actual;
    others.forEach(function(key){values[key]-=actual*values[key]/donorTotal;});
    values=normalizedCampaignPolls(values);
    var deltas={};Object.keys(values).forEach(function(key){deltas[key]=+(values[key]-previous.values[key]).toFixed(2);state.parties[key].poll=values[key];});
    campaign.polls.push({turn:state.turnCount,reason:reason,values:values,deltas:deltas});
}
function addCampaignPromise(data) {
    if(!campaignIsActive()){showToast("Premtimet shtohen vetëm gjatë fushatës aktive.");return false;}
    var title=String(data.title||"").trim(),description=String(data.description||"").trim();
    var cost=data.estimatedCost===""||data.estimatedCost==null?null:Number(data.estimatedCost);
    if(!title||!description||title.length>160||description.length>2000||!CAMPAIGN_SECTORS.includes(data.sector)||(cost!==null&&(!Number.isFinite(cost)||cost<0))){showToast("Plotësoni titullin, përshkrimin dhe sektorin; kostoja duhet të jetë numër jo negativ ose bosh.");return false;}
    var campaign=state.electionCampaign;
    if(campaign.programme.some(function(promise){return candidateSearchText(promise.title)===candidateSearchText(title);})){showToast("Ky premtim është regjistruar tashmë.");return false;}
    campaign.programme.push({id:"promise:"+campaign.startWeek+":"+(++campaign.promiseCounter),partyId:state.playerParty,title:title,description:description,sector:data.sector,estimatedCost:cost,status:"ACTIVE",createdTurn:state.turnCount});
    refreshAllUI();if(!_saveErrorShown)showToast("Premtimi u shtua në programin zgjedhor. Nuk u financua ose realizua.");return true;
}
function addCampaignPromiseFromForm() {
    var value=function(id){return document.getElementById(id).value;};
    if(addCampaignPromise({title:value("campaignPromiseTitle"),description:value("campaignPromiseDescription"),sector:value("campaignPromiseSector"),estimatedCost:value("campaignPromiseCost")})) {
        ["campaignPromiseTitle","campaignPromiseDescription","campaignPromiseCost"].forEach(function(id){document.getElementById(id).value="";});
    }
}
function performCampaignActivity(type) {
    if(!campaignIsActive()||state.pendingVote){showToast("Aktiviteti kërkon fushatë aktive dhe pa votim në vazhdim.");return false;}
    var campaign=state.electionCampaign,activity=CAMPAIGN_ACTIVITIES[type],party=state.parties[state.playerParty];
    if(!activity)return false;
    if(campaign.activities.some(function(item){return item.type===type&&item.turn===state.turnCount;})){showToast("Ky aktivitet është zhvilluar këtë javë. Provoni javën tjetër.");return false;}
    if(!Number.isFinite(party.partyFunds)||party.partyFunds<activity.cost){showToast("Fondi i partisë nuk mjafton për këtë aktivitet.");return false;}
    party.partyFunds-=activity.cost;
    campaign.activities.push({type:type,title:activity.title,cost:activity.cost,turn:state.turnCount,campaignWeek:campaign.elapsedWeeks+1});
    campaign.visibility=Math.min(100,campaign.visibility+activity.visibility);
    campaign.credibility=Math.min(100,campaign.credibility+activity.credibility);
    if(type==="DEBATE")campaign.debates.push({turn:state.turnCount,title:activity.title});
    recordCampaignShift(state.playerParty,activity.support,activity.title);
    refreshAllUI();if(!_saveErrorShown)showToast("Aktiviteti u regjistrua; kostoja u pagua nga fondi i partisë.");return true;
}
function processCampaignWeek() {
    var campaign=state.electionCampaign;
    if(!campaignIsActive()||campaign.lastProcessedTurn>=state.turnCount)return;
    var duration=campaignDuration(campaign),elapsed=Math.min(duration,Math.max(0,state.turnCount-campaign.startWeek));
    if(elapsed<=campaign.elapsedWeeks)return;
    campaign.lastProcessedTurn=state.turnCount;
    // Programme impact is applied once per elapsed week, capped irrespective of promise count.
    var sectors=new Set(campaign.programme.map(function(promise){return promise.sector;})).size;
    var programmeEffect=Math.min(0.12,sectors*0.02)*(typeof electoralPromiseCredibility==='function'?electoralPromiseCredibility(state,state.playerParty):1);
    if(programmeEffect)recordCampaignShift(state.playerParty,programmeEffect,"Programi zgjedhor — vlerësimi javor");
    var mood=Math.max(-0.08,Math.min(0.08,(state.approval-50)*0.003));
    if(mood)recordCampaignShift(state.playerParty,mood,"Perceptimi publik — vlerësimi javor");
    var choices=CAMPAIGN_EVENTS.map(function(event,index){return index;}).filter(function(index){return !campaign.events.some(function(event){return event.template===index;});});
    var template=choices[Math.floor(Math.random()*choices.length)],event=CAMPAIGN_EVENTS[template];
    var rivals=Object.keys(state.parties).filter(function(key){return key!==state.playerParty;});
    var target=event.rival?rivals[(elapsed-1)%rivals.length]:state.playerParty;
    var title="Zhvillim në fushatë: "+event.title+" ("+state.parties[target].short+")";
    campaign.events.push({template:template,turn:state.turnCount,title:title,partyId:target,shift:event.shift});
    recordCampaignShift(target,event.shift,title);
    campaign.elapsedWeeks=elapsed;campaign.weeksRemaining=duration-elapsed;
    if(elapsed>=duration){campaign.status="READY";showToast(duration+" javët përfunduan. Kontrolloni përmbledhjen dhe përfundoni fushatën.");}
}
function finishCampaign() {
    var campaign=state.electionCampaign;
    if(state.electionPhase!=="CAMPAIGN"||!campaign||campaign.status!=="READY"||campaign.elapsedWeeks!==campaignDuration(campaign))return false;
    campaign.status="CLOSED";campaign.closedAt={year:state.year,monthIndex:state.monthIndex,week:state.week,turnCount:state.turnCount};
    state.electionPhase="CAMPAIGN_CLOSED";
    var previousCycles=(state.parliamentaryElections || []).slice();
    try{prepareElectionDayCycle(state);delete state.electionDayPreparationError;}catch(error){state.electionDayPreparationError=error.message;}
    if(!saveGameAuto()){campaign.status="READY";campaign.closedAt=null;state.electionPhase="CAMPAIGN";state.parliamentaryElections=previousCycles;return false;}
    refreshAllUI();if(!_saveErrorShown){showToast("Fushata u mbyll. Dita e zgjedhjeve është gati; mandatet nuk janë llogaritur.");announceElectionDay();}return true;
}
function campaignPromiseHtml(campaign) {
    var labels={ACTIVE:"Aktiv",FULFILLED:"I realizuar",UNFULFILLED:"I parealizuar"};
    return campaign.programme.map(function(promise){return '<article class="candidate-card"><strong>'+electoralEscape(promise.title)+'</strong><p>'+electoralEscape(promise.description)+'</p><small>'+electoralEscape(promise.sector)+' · '+labels[promise.status]+' · Kosto e përafërt: '+(promise.estimatedCost===null?'E papërcaktuar':'€'+promise.estimatedCost.toLocaleString('sq-AL'))+'</small></article>';}).join("")||'<p>Nuk ka premtime të regjistruara.</p>';
}
function renderCampaignPanel() {
    var host=document.getElementById("campaignPanel"),campaign=state.electionCampaign;
    if(!host)return;
    var enabled=campaign&&campaign.moduleVersion===3&&["CAMPAIGN","CAMPAIGN_CLOSED"].includes(state.electionPhase);
    var pill=document.getElementById("campaignTabBtn");if(pill)pill.disabled=!enabled;
    if(!enabled){host.innerHTML='<p>Fushata zgjedhore aktivizohet vetëm pas shpalljes së zgjedhjeve parlamentare.</p>';var inactiveForm=document.getElementById("campaignPromiseForm");if(inactiveForm)inactiveForm.hidden=true;return;}
    var duration=campaignDuration(campaign),active=campaignIsActive(),week=Math.min(duration,campaign.elapsedWeeks+1),names=["Nisja e fushatës","Intensifikimi i fushatës","Përmbyllja e fushatës"];
    if(duration===4)names.splice(2,0,"Debatet zgjedhore");
    var party=state.parties[state.playerParty];
    var latest=latestCampaignPoll(campaign),previous=campaign.polls.filter(function(poll){return poll&&poll.values;}).slice(-2)[0];
    host.innerHTML='<div class="card"><div class="card-header"><div class="card-title">Fushata zgjedhore</div><span class="tag tag-gold">'+(campaign.status==="CLOSED"?'E mbyllur':campaign.status==="READY"?'Gati për përmbyllje':'Java '+week+' — '+names[week-1])+'</span></div><p>'+electoralEscape(party.name)+' · '+Math.max(0,campaign.weeksRemaining*7)+' ditë të mbetura</p><p>Zgjedhjet: '+campaignCalendarLabel(campaign.electionCalendar)+' · kalendari ekzistues me 4 javë në muaj.</p><progress max="'+duration+'" value="'+campaign.elapsedWeeks+'" aria-label="Progresi i fushatës"></progress><p>Fondi i partisë: €'+party.partyFunds.toLocaleString('sq-AL')+' · Dukshmëria: '+campaign.visibility+'/100 · Besueshmëria: '+campaign.credibility+'/100</p>'+
        (active?'<button class="action-btn btn-gold" onclick="advanceCampaignWeek()">Vazhdo një javë</button>':'')+
        (campaign.status==="READY"?'<button id="finishCampaignBtn" class="action-btn btn-success" onclick="finishCampaign()">Përfundo fushatën</button>':'')+'</div>'+
        '<div class="card"><h3>Programi zgjedhor</h3>'+campaignPromiseHtml(campaign)+'</div>'+
        '<div class="card"><h3>Aktivitetet e fushatës</h3><p>Çdo lloj aktiviteti lejohet një herë për javë. Efekti varet edhe nga zhvillimet dhe perceptimi publik.</p><div class="grid-2">'+Object.keys(CAMPAIGN_ACTIVITIES).map(function(type){var item=CAMPAIGN_ACTIVITIES[type],used=campaign.activities.some(function(entry){return entry.type===type&&entry.turn===state.turnCount;});return '<button class="choice-btn" data-campaign-activity="'+type+'" onclick="performCampaignActivity(this.dataset.campaignActivity)" '+(!active||used?'disabled':'')+'><span class="choice-title">'+item.title+' — €'+item.cost.toLocaleString('sq-AL')+'</span><span class="choice-impact">Kontakti me publikun mund të ndihmojë përkrahjen; '+(used?'i zhvilluar këtë javë':'dukshmëri dhe besueshmëri')+'</span></button>';}).join('')+'</div></div>'+
        '<div class="card"><h3>Sondazhet</h3><p>Sondazhe të simulimit — jo sondazhe reale. Gjithsej 100% për të gjitha partitë.</p>'+Object.keys(latest.values).map(function(key){var value=latest.values[key],delta=previous?+(value-previous.values[key]).toFixed(2):0;return '<p>'+electoralEscape(state.parties[key].short)+': <strong>'+value.toFixed(2)+'%</strong> · '+(delta>0?'+':'')+delta.toFixed(2)+' pikë · '+(delta>0?'Rritje':delta<0?'Rënie':'Stabilitet')+'</p>';}).join('')+'<details><summary>Historiku i sondazheve</summary>'+campaign.polls.filter(function(poll){return poll&&poll.values;}).map(function(poll){return '<p>Java e lojës '+poll.turn+' — '+electoralEscape(poll.reason)+'<br>'+Object.keys(poll.values).map(function(key){return electoralEscape(state.parties[key].short)+': '+poll.values[key].toFixed(2)+'%';}).join(' · ')+'</p>';}).join('')+'</details></div>'+
        '<div class="card"><h3>'+(active?'Historiku i fushatës':'Përmbledhja përfundimtare')+'</h3><p>'+campaign.programme.length+' premtime · '+campaign.activities.length+' aktivitete · '+campaign.events.length+' ngjarje</p>'+campaign.activities.map(function(item){return '<p>Java '+(item.campaignWeek||'e mëparshme')+': '+electoralEscape(item.title||item.type||'Aktivitet i ruajtur')+' · €'+(item.cost||0).toLocaleString('sq-AL')+'</p>';}).join('')+campaign.events.map(function(event){return '<p>'+electoralEscape(event.title)+'</p>';}).join('')+'<p>Nuk janë llogaritur fituesi, rezultatet ose mandatet.</p></div>';
    host.innerHTML='<button class="action-btn" onclick="openElectionPreparation()">Listat dhe shorti i KQZ-së</button>'+host.innerHTML;
    var form=document.getElementById("campaignPromiseForm");if(form)form.hidden=true;
    var sector=document.getElementById("campaignPromiseSector");if(sector&&(!sector.options||!sector.options.length))sector.innerHTML=CAMPAIGN_SECTORS.map(function(value){return '<option>'+electoralEscape(value)+'</option>';}).join('');
}
