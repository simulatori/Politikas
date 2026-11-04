/* Fictional gameplay bargains; actual parliamentary thresholds remain enforced. */
function migrateInternalPressure(st){if(st.internalPressure===undefined)st.internalPressure={version:1,lastTurn:st.turnCount,sectors:{sec_edu:{lowWeeks:0,episodes:[]},sec_health:{lowWeeks:0,episodes:[]}}};}
function vitalBargain(l){return l?.communityBargain?.version===(l.version||1)?l.communityBargain:null;}
function internalPressurePending(st){return !!st?.laws?.some(l=>vitalBargain(l)?.choice==='PENDING')||Object.values(st?.internalPressure?.sectors||{}).some(r=>r.episodes.some(e=>e.choice==='PENDING'));}
function vitalCommunityGate(l,continuation){
    if(!agendaExecutive()||l.majorityType!=='VITAL_DOUBLE'||vitalBargain(l))return false;
    var before=JSON.stringify(state);l.communityBargain={version:l.version||1,turn:state.turnCount,choice:'PENDING',resolvedTurn:null,ledgerId:null,continuation:continuation||null};
    if(!saveGameAuto()){state=JSON.parse(before);return true;}renderInternalPressure();return true;
}
function resolveVitalCommunity(choice){
    if(!['TENDER','EMBASSIES','WITHDRAW'].includes(choice))return false;
    var lawId=null,continuation=null;
    var ok=governmentCrisisCommit(function(){var l=state.laws.find(l=>vitalBargain(l)?.choice==='PENDING'),b=l&&vitalBargain(l);if(!b||['PASSED','FAILED','WITHDRAWN','ANNULLED'].includes(l.status))throw Error('Nuk ka ligj vital në pritje.');
        if(choice==='TENDER'){if(state.budgetTotalB<.005+(l.costB||0))throw Error('Arka nuk mbulon marrëveshjen dhe ligjin.');b.ledgerId=enterprisePay(.005,'Marrëveshje komunitetesh: '+l.id);state.justiceReform.corruptionIndex=Math.min(100,state.justiceReform.corruptionIndex+5);recordLeakRisk('FAVOUR',l.id+':'+(l.version||1),null);}
        if(choice==='EMBASSIES')state.internationalPressure=Math.min(100,state.internationalPressure+councilPressureIncrease(state,20));
        b.choice=choice;b.resolvedTurn=state.turnCount;
        if(choice==='WITHDRAW'){l.status='WITHDRAWN';l.stage='I tërhequr pas vetos së komuniteteve';l.stageHistory=l.stageHistory||[];l.stageHistory.push({stage:'WITHDRAWN',week:state.turnCount});mediaPollDelta(10);}else{lawId=l.id;continuation=b.continuation;}
        state.historyLog.unshift(l.title+': '+({TENDER:'marrëveshje €5M; +5 korrupsion',EMBASSIES:'ndërhyrje ambasadash; +20 presion',WITHDRAW:'tërheqje; +10 mbështetje e partisë'})[choice]);
    });
    if(ok){closeInternalPressure();if(lawId)beginLawVote(state.laws.find(l=>l.id===lawId),continuation);}return ok;
}
function vitalCommunityBallot(l,mp,ballot){if(l.majorityType!=='VITAL_DOUBLE')return ballot;var b=vitalBargain(l);if(!b||!['TENDER','EMBASSIES'].includes(b.choice))return ['MIN_MULTI','SL'].includes(mp.party)?'abstenim':ballot;return ['MIN_MULTI','SL'].includes(mp.party)||state.coalitionParties.includes(mp.party)?'pro':ballot;}
function brainDrainCollapsed(st,id){return st.internalPressure?.sectors[id]?.episodes.at(-1)?.choice==='PENDING';}
function processInternalPressureWeek(turn){
    migrateInternalPressure(state);var db=state.internalPressure;if(turn<=db.lastTurn)return;db.lastTurn=turn;
    Object.values(db.sectors).forEach(r=>r.episodes.filter(e=>e.choice==='PRIVATE'&&e.contractDebt>0).forEach(e=>{var paid=Math.min(state.parties[e.owner].partyFunds,e.contractDebt);state.parties[e.owner].partyFunds-=paid;e.contractDebt-=paid;}));
    Object.entries(db.sectors).forEach(([id,r])=>{if(brainDrainCollapsed(state,id)||!agendaExecutive())return;if(unionFundedStars(state,id)>=4||id==='sec_health'&&sectorExpansionLevel(state,id,'residents')>=6){r.lowWeeks=0;return;}r.lowWeeks++;if(r.lowWeeks<10)return;
        r.episodes.push({turn,choice:'PENDING',resolvedTurn:null,ledgerId:null,partyCost:0,contractDebt:0,owner:state.playerParty,imfId:null});crisisApproval(-15);state.historyLog.unshift('Eksod masiv i stafit: '+UNION_SECTORS[id].name+'. Ambasada e huaj lëshon viza pune; sektori bie në 1 yll.');recordCrisisPressEvent('STRIKE','brain-drain:'+id+':'+turn,'Eksod masiv i stafit',id);
    });
}
function brainDrainRestoreQuality(id){var row=sectorManagementEnsure(state,id),db=state.sectorManagement;SECTOR_MANAGEMENT_DEFS[id].forEach(c=>{row.levels[c.id]=Math.max(4,row.levels[c.id]);});row.policies.push({id:'sector-policy:'+(++db.counter),turn:state.turnCount,levels:{...row.levels},grantRates:{...row.grantRates}});db.revision++;row.status='PENDING';sectorManagementApplyQuality(state,id,row,row.levels);}
function resolveBrainDrain(id,choice){if(!['SALARIES','PRIVATE'].includes(choice))return false;return governmentCrisisCommit(function(){var r=state.internalPressure?.sectors[id],e=r?.episodes.at(-1);if(!e||e.choice!=='PENDING')throw Error('Sektori nuk ka eksod aktiv.');
    if(choice==='SALARIES'){
        if(imfPending(state))throw Error('Pranoni fillimisht pakon e FMN-se ne pritje.');
        if(activeIMFPackage(state))throw Error('FMN ndalon rritjet. Përdorni kontraktimin privat.');
        var weak=state.budgetTotalB-state.publicFinance.arrearsB<.05;
        if(weak&&(foreignFundingBlocked(state)||veteransIMFBlocked(state)))throw Error('Financimi ndërkombëtar është bllokuar; përdorni kontraktimin privat.');
        if(weak){var p={id:'imf:'+state.imfCrisis.packages.length,status:'PENDING',createdTurn:state.turnCount,acceptedTurn:null,untilTurn:null,principalB:0,arrearsPaidB:0,ceilings:null,loanReceipt:null,settlements:[],repaidTurn:null,repaymentReceipt:null,staffingExemption:id};state.imfCrisis.packages.push(p);applyIMFPackage(p);e.imfId=p.id;}
        e.ledgerId=enterprisePay(.02,'Paga emergjente: '+id+':'+e.turn);
    }else{e.partyCost=state.parties[state.playerParty].partyFunds;oppositionSpend(e.partyCost);e.contractDebt=Math.max(0,100000-e.partyCost);}
    e.choice=choice;e.resolvedTurn=state.turnCount;e.owner=state.playerParty;r.lowWeeks=0;brainDrainRestoreQuality(id);state.historyLog.unshift('Rikthimi i stafit: '+id+' · '+choice+(e.imfId?' · austeritet FMN 20 javë':''));
});}
function validateInternalPressure(st){var d=st.internalPressure;if(d===undefined)return;function bad(){throw Error('Regjistri i vetos ose eksodit është i pavlefshëm.');}var integer=n=>Number.isInteger(n)&&n>=0&&n<=st.turnCount;
    if(d.version!==1||!integer(d.lastTurn)||!d.sectors||Object.keys(d.sectors).length!==2)bad();
    Object.entries(d.sectors).forEach(([id,r])=>{if(!['sec_edu','sec_health'].includes(id)||!Number.isInteger(r.lowWeeks)||r.lowWeeks<0||!Array.isArray(r.episodes))bad();var last=-1;r.episodes.forEach((e,i)=>{if(!integer(e.turn)||e.turn<=last||!['PENDING','SALARIES','PRIVATE'].includes(e.choice)||!st.parties[e.owner]||e.choice==='PENDING'&&(e.resolvedTurn!==null||i!==r.episodes.length-1)||e.choice!=='PENDING'&&(!integer(e.resolvedTurn)||e.resolvedTurn<e.turn))bad();last=e.turn;if(!Number.isSafeInteger(e.contractDebt)||e.contractDebt<0||e.contractDebt>Math.max(0,100000-e.partyCost)||e.choice!=='PRIVATE'&&e.contractDebt!==0)bad();if(e.choice==='SALARIES'){var receipt=st.publicFinance.ledger.find(p=>p.id===e.ledgerId);if(!receipt||receipt.type!=='EXPENSE'||receipt.source!=='Paga emergjente: '+id+':'+e.turn||Math.abs(receipt.amountB+.02)>1e-8||receipt.turn!==e.resolvedTurn||e.partyCost!==0||e.imfId&&!st.imfCrisis.packages.some(p=>p.id===e.imfId&&p.acceptedTurn===e.resolvedTurn))bad();}else if(e.ledgerId!==null||e.imfId!==null||!Number.isFinite(e.partyCost)||e.partyCost<0||e.choice==='PENDING'&&e.partyCost!==0)bad();});});
    st.laws.forEach(l=>{var b=l.communityBargain;if(!b)return;if(l.majorityType!=='VITAL_DOUBLE'||!Number.isInteger(b.version)||b.version<1||!integer(b.turn)||!['PENDING','TENDER','EMBASSIES','WITHDRAW'].includes(b.choice)||b.choice==='PENDING'&&b.resolvedTurn!==null||b.choice!=='PENDING'&&(!integer(b.resolvedTurn)||b.resolvedTurn<b.turn))bad();if(b.choice==='TENDER'){var p=st.publicFinance.ledger.find(p=>p.id===b.ledgerId);if(!p||p.type!=='EXPENSE'||p.source!=='Marrëveshje komunitetesh: '+l.id||p.turn!==b.resolvedTurn||Math.abs(p.amountB+.005)>1e-8)bad();}else if(b.ledgerId!==null)bad();});
}
var internalPressureRetry=null;
function closeInternalPressure(){var d=document.getElementById('internalPressureDialog');if(d?.open)d.close();}
function renderInternalPressure(){
    var status=document.getElementById('internalPressureStatus');
    if(status)status.innerHTML='<h3>Stafi publik · Rreziku i eksodit</h3>'+Object.entries(state.internalPressure?.sectors||{}).map(([id,r])=>'<p><strong>'+catalogEscape(UNION_SECTORS[id].name)+'</strong> · '+r.lowWeeks+'/10 javë nën 4 yje · '+(brainDrainCollapsed(state,id)?'Kolaps: 1 yll':'Pa kolaps aktiv')+'</p>').join('')+'<p>Detyrime të kontratave të partisë: €'+Object.values(state.internalPressure?.sectors||{}).reduce((sum,r)=>sum+r.episodes.filter(e=>e.owner===state.playerParty).reduce((n,e)=>n+e.contractDebt,0),0).toLocaleString('sq-AL')+'. Shlyhen nga fondet e ardhshme të partisë.</p>';
    var dialog=document.getElementById('internalPressureDialog');if(!dialog||typeof dialog.showModal!=='function')return;
    if(!agendaExecutive()||!internalPressurePending(state)){closeInternalPressure();return;}
    if(weeklyProcessing||weeklyVisualBusy||state.pendingVote||!document.getElementById('startScreen')?.classList.contains('hidden')||document.querySelector('dialog[open]:not(#internalPressureDialog)')){if(internalPressureRetry===null)internalPressureRetry=setTimeout(()=>{internalPressureRetry=null;renderInternalPressure();},250);return;}
    var l=state.laws.find(l=>vitalBargain(l)?.choice==='PENDING'),html;
    if(l)html='<h2>Vetoja e Komuniteteve</h2><p><strong>'+catalogEscape(l.title)+'</strong></p><p>Nevojiten 61 vota dhe 14 nga 20 votat e komuniteteve. Partitë e komuniteteve kushtëzojnë mbështetjen.</p><button class="action-btn" onclick="resolveVitalCommunity(\'TENDER\')">Ofro buxhet shtesë · €5M · +5 korrupsion</button><button class="action-btn" onclick="resolveVitalCommunity(\'EMBASSIES\')">Kërko Ndërhyrjen e Ambasadave · +20 presion</button><button class="action-btn" onclick="resolveVitalCommunity(\'WITHDRAW\')">Tërhiqu · +10 mbështetje e partisë</button><p>Marrëveshja siguron mbështetjen në votim; kontrolli kushtetues dhe zbatimi mbeten në fuqi.</p>';
    else{var id=Object.keys(state.internalPressure.sectors).find(id=>brainDrainCollapsed(state,id));html='<h2>Eksod masiv i stafit!</h2><p>'+catalogEscape(UNION_SECTORS[id].name)+' · 10 javë nën 4 yje financimi. Vizat e punës shkaktojnë kolaps: 1 yll dhe −15 mbështetje.</p><button class="action-btn" onclick="resolveBrainDrain(\''+id+'\',\'SALARIES\')">Rritje Emergjente e Pagave · €20M</button><button class="action-btn" onclick="resolveBrainDrain(\''+id+'\',\'PRIVATE\')">Sill Staf Privat/Jashtë · gjithë Buxheti i Partisë</button><p>Nën €50M likuiditet neto: pagat aktivizojnë menjëherë pakon e FMN-së me 20 javë austeritet për sektorin tjetër. Kontratat kanë minimum €100,000; mungesa shlyhet nga të hyrat e ardhshme të partisë. Cilësia rikthehet në 4 yje; financimi javor dhe grevat vazhdojnë sipas rregullave ekzistuese.</p>';}
    document.getElementById('internalPressureContent').innerHTML=html;if(!dialog.open)dialog.showModal();
}
document.addEventListener('DOMContentLoaded',()=>document.getElementById('internalPressureDialog')?.addEventListener('cancel',e=>{if(internalPressurePending(state)&&agendaExecutive())e.preventDefault();}));
