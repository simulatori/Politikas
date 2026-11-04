/* Fictional outlets extend mediaWarfare; polls change, parliamentary seats do not. */
const MEDIA_OUTLETS=Object.freeze([{id:'tv_forum',name:'TV Forum',price:180000},{id:'tv_horizont',name:'TV Horizont',price:240000},{id:'portali_drita',name:'Portali Drita',price:90000},{id:'rrjeti_qytetar',name:'Rrjeti Qytetar',price:120000}]);
function initializeMediaMarket(st){const d=st.mediaWarfare;if(d.market===undefined)d.market={version:1,lastTurn:st.turnCount,cooldownUntil:st.turnCount+4,outlets:MEDIA_OUTLETS.map(o=>({id:o.id,owner:null,subsidies:[]})),transactions:[],scandals:[]};}
function mediaMarketCommit(change){
    if(!state.playerParty||state.pendingVote||weeklyProcessing||weeklyVisualBusy||hasOpenElectionProcess())return false;
    const before=JSON.stringify(state);try{migrateMediaWarfare(state);change();validateLoadedState(state);if(!saveGameAuto())throw Error('Ruajtja dështoi.');}
    catch(e){state=JSON.parse(before);showToast(e.message);return false;}refreshAllUI();return true;
}
function acquireMediaOutlet(id,kind){return mediaMarketCommit(()=>{
    const def=MEDIA_OUTLETS.find(o=>o.id===id),d=state.mediaWarfare.market,o=d.outlets.find(o=>o.id===id),party=state.parties[state.playerParty];
    if(!def||!['BUY','SUBSIDIZE'].includes(kind)||kind==='BUY'&&o.owner||d.transactions.some(t=>t.party===state.playerParty&&t.turn===state.turnCount))throw Error('Veprimi mediatik nuk është i disponueshëm këtë javë.');
    const cost=kind==='BUY'?def.price:30000;oppositionSpend(cost);
    if(kind==='BUY')o.owner=state.playerParty;else o.subsidies.push({party:state.playerParty,from:state.turnCount,until:state.turnCount+12});
    d.transactions.push({id,kind,party:state.playerParty,turn:state.turnCount,cost});
    state.historyLog.unshift(state.playerParty+': '+(kind==='BUY'?'bleu ':'subvencionoi ')+def.name+' nga buxheti i partisë.');
});}
function mediaElectionEnvironment(st){return Object.fromEntries(Object.keys(st.parties).map(id=>{
    const rows=st.mediaWarfare?.market?.outlets||[];
    return [id,Math.min(.06,rows.reduce((sum,o)=>sum+(o.owner===id?.02:0)+(o.subsidies.some(s=>s.party===id&&s.from<=st.turnCount&&s.until>st.turnCount)?.01:0),0))];
}));}
function redistributeScandalPolls(st,partyId,requested){
    const p=st.parties[partyId],rivals=Object.values(st.parties).filter(q=>q!==p&&q.poll>0),loss=Math.min(p.poll,requested);
    if(!rivals.length)return 0;const weight=rivals.reduce((n,q)=>n+q.poll*q.poll,0);p.poll-=loss;
    rivals.forEach(q=>q.poll+=loss*q.poll*q.poll/weight);return loss;
}
function publishGovernmentMediaScandal(loss,outlet){
    const d=state.mediaWarfare.market,owner=state.mandatar||state.playerParty;
    if(!state.governmentFormed||!state.parties[owner])return false;
    const actual=redistributeScandalPolls(state,owner,Math.min(loss*ownedMediaDefence(state,owner),state.parties[owner].poll*.35));
    d.scandals.push({turn:state.turnCount,party:owner,loss:actual,outlet});d.cooldownUntil=state.turnCount+6;
    if(agendaExecutive(state))crisisApproval(-actual);
    addMediaNews('Investigim',outlet+': skandal politik i qeverisë','CRITICAL',state.parties[owner].short+' humbi '+actual.toFixed(1)+' pikë në sondazh. Mandatet aktuale mbeten të njëjta.');return true;
}
function processMediaMarketWeek(turn){
    const d=state.mediaWarfare.market;if(turn<=d.lastTurn)return;d.lastTurn=turn;processManagedMediaWeek(turn);
    if(turn%4===0){const free=d.outlets.filter(o=>!o.owner),rivals=Object.keys(state.parties).filter(id=>id!==state.playerParty&&state.parties[id].partyFunds>=90000);
        if(free.length&&rivals.length&&Math.random()<.25){const id=rivals[Math.floor(Math.random()*rivals.length)],o=free[Math.floor(Math.random()*free.length)],def=MEDIA_OUTLETS.find(x=>x.id===o.id);if(state.parties[id].partyFunds>=def.price){state.parties[id].partyFunds-=def.price;o.owner=id;d.transactions.push({id:o.id,kind:'BUY',party:id,turn,cost:def.price});}}
    }
    if(turn>=d.cooldownUntil&&state.governmentFormed&&Math.random()<.05){const o=d.outlets.find(o=>o.owner!==state.mandatar)||d.outlets[0];publishGovernmentMediaScandal(4+Math.floor(Math.random()*5),MEDIA_OUTLETS.find(x=>x.id===o.id).name);}
}
function validateMediaMarket(st){
    const d=st.mediaWarfare?.market;if(d===undefined)return;const fail=()=>{throw Error('Regjistri i ndikimit mediatik është i pavlefshëm.');};
    if(d.version!==1||!Number.isInteger(d.lastTurn)||d.lastTurn>st.turnCount||d.lastTurn<0||!Number.isInteger(d.cooldownUntil)||d.cooldownUntil<0||!Array.isArray(d.outlets)||d.outlets.length!==MEDIA_OUTLETS.length||new Set(d.outlets.map(o=>o.id)).size!==MEDIA_OUTLETS.length||!Array.isArray(d.transactions)||!Array.isArray(d.scandals))fail();
    for(const o of d.outlets){if(!MEDIA_OUTLETS.some(x=>x.id===o.id)||o.owner!==null&&!st.parties[o.owner]||!Array.isArray(o.subsidies)||o.subsidies.some(s=>!st.parties[s.party]||!Number.isInteger(s.from)||s.from<0||s.from>st.turnCount||s.until!==s.from+12))fail();}
    for(const t of d.transactions){const def=MEDIA_OUTLETS.find(o=>o.id===t.id);if(!def||!st.parties[t.party]||!Number.isInteger(t.turn)||t.turn<0||t.turn>st.turnCount||!['BUY','SUBSIDIZE'].includes(t.kind)||t.cost!==(t.kind==='BUY'?def.price:30000))fail();}
    for(const e of d.scandals)if(!st.parties[e.party]||!Number.isInteger(e.turn)||e.turn<0||e.turn>st.turnCount||!Number.isFinite(e.loss)||e.loss<0||e.loss>8||typeof e.outlet!=='string')fail();
}
function mediaMarketMarkup(){
    migrateMediaWarfare(state);const d=state.mediaWarfare.market,p=state.parties[state.playerParty],boost=mediaElectionEnvironment(state)[state.playerParty];
    return '<h3>Televizionet dhe portalet</h3><p>Financim nga partia · ndikim relativ në fushatën e ardhshme: +'+Math.round(boost*100)+'%. Sondazhet dhe mandatet janë tregues të ndarë.</p><div class="pressure-grid">'+d.outlets.map(o=>{const def=MEDIA_OUTLETS.find(x=>x.id===o.id),busy=d.transactions.some(t=>t.party===state.playerParty&&t.turn===state.turnCount);return '<article class="card"><h4>'+def.name+'</h4><p>Pronari: '+catalogEscape(o.owner?state.parties[o.owner].short:'I pavarur')+'</p>'+(o.owner?'<button class="action-btn" onclick="openOwnedMedia(\''+o.id+'\')">'+(o.owner===state.playerParty?'Menaxho median':'Shih menaxhimin e partisë')+'</button>':'')+'<button class="action-btn" '+(o.owner||busy||p.partyFunds<def.price?'disabled':'')+' onclick="acquireMediaOutlet(\''+o.id+'\',\'BUY\')">Blej · €'+def.price.toLocaleString('sq-AL')+'</button><button class="action-btn" '+(busy||p.partyFunds<30000?'disabled':'')+' onclick="acquireMediaOutlet(\''+o.id+'\',\'SUBSIDIZE\')">Subvenciono · €30,000 / 12 javë</button></article>';}).join('')+'</div>'+d.scandals.slice(-4).reverse().map(e=>'<p>'+catalogEscape(e.outlet)+' · '+catalogEscape(e.party)+' · −'+e.loss.toFixed(1)+' pikë · Java '+e.turn+'</p>').join('');
}
