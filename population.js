/* Scenario parameters, not demographic statistics. Annual tax bases stay unscaled. */
const POPULATION_BASE_CITIZENS=1700000,POPULATION_BASE_WORKFORCE=500000,POPULATION_HIGH_UNEMPLOYMENT=15;
function migratePopulation(st){if(st.population===undefined)st.population={version:1,baseCitizens:POPULATION_BASE_CITIZENS,baseWorkforce:POPULATION_BASE_WORKFORCE,citizens:POPULATION_BASE_CITIZENS,emigrated:0,lastTurn:st.turnCount,lastEmigrants:0,history:[]};}
function populationFactor(st){st=st||state;return st?.population?st.population.citizens/st.population.baseCitizens:1;}
function populationWorkforce(st){st=st||state;return Math.floor((st?.population?.baseWorkforce||POPULATION_BASE_WORKFORCE)*populationFactor(st));}
function populationTaxAnnual(base,st){return Math.max(0,base)*populationFactor(st||state);}
function populationUnemployed(st){st=st||state;return Math.floor(populationWorkforce(st)*clamp(st.unemployment,0,100)/100);}
function populationReservedJobs(st){
    st=st||state;var db=st.foreignInvestments;if(!db)return 0;
    var jobs=(db.bidders||[]).filter(b=>b.status==='SIGNED').reduce((sum,b)=>sum+(fdiInvestor(b.investorId)?.jobs||0),0);
    return jobs+(db.offers||[]).filter(o=>o.status==='ACTIVE'&&FDI_TYPES[o.type]?.mega).reduce((sum,o)=>sum+(FDI_TYPES[o.type].jobs||0),0);
}
function populationAvailableWorkers(st){st=st||state;return Math.max(0,populationUnemployed(st)-populationReservedJobs(st));}
function populationWorkerReason(jobs,st){st=st||state;var available=populationAvailableWorkers(st);return jobs>available?'Mungon fuqia punëtore: '+available.toLocaleString('sq-AL')+' të papunë të disponueshëm; projekti kërkon '+jobs.toLocaleString('sq-AL')+' vende pune.':'';}
function processPopulationWeek(turn){
    migratePopulation(state);var p=state.population;if(turn<=p.lastTurn)return 0;
    if(turn!==p.lastTurn+1)throw Error('Popullsia kërkon javë të njëpasnjëshme.');
    var stress=Math.max(0,40-state.approval)*.00004+Math.max(0,state.unemployment-POPULATION_HIGH_UNEMPLOYMENT)*.00005,rate=laborExodusStopped(state)?0:Math.min(.0025,stress)*sectorExpansionMigrationFactor(state),before=p.citizens;
    var loss=rate>0?Math.min(before-1,Math.max(1,Math.floor(before*rate))):0;
    p.citizens-=loss;p.emigrated+=loss;p.lastEmigrants=loss;p.lastTurn=turn;p.history.push({turn,before,after:p.citizens,lost:loss});p.history=p.history.slice(-48);return loss;
}
function validatePopulation(st){
    var p=st.population;if(p===undefined)return;var fail=()=>{throw Error('Popullsia e ruajtur është e pavlefshme.');};
    if(!p||p.version!==1||p.baseCitizens!==POPULATION_BASE_CITIZENS||p.baseWorkforce!==POPULATION_BASE_WORKFORCE||!Number.isSafeInteger(p.citizens)||p.citizens<1||p.citizens>p.baseCitizens||!Number.isSafeInteger(p.emigrated)||p.emigrated<0||p.citizens+p.emigrated!==p.baseCitizens||!Number.isSafeInteger(p.lastEmigrants)||p.lastEmigrants<0||!Number.isInteger(p.lastTurn)||p.lastTurn<0||p.lastTurn>st.turnCount||!Array.isArray(p.history)||p.history.length>48)fail();
    p.history.forEach((h,i)=>{var old=p.history[i-1];if(!Number.isInteger(h.turn)||h.turn<1||h.turn>p.lastTurn||old&&h.turn!==old.turn+1||![h.before,h.after,h.lost].every(Number.isSafeInteger)||h.before<1||h.before>p.baseCitizens||h.after<1||h.lost<0||h.before-h.lost!==h.after||old&&h.before!==old.after)fail();});
    var last=p.history.at(-1);if(last?(last.after!==p.citizens||last.lost!==p.lastEmigrants||last.turn!==p.lastTurn):p.emigrated!==0||p.lastEmigrants!==0)fail();
}
function renderPopulation(){
    var host=document.getElementById('populationPanel');if(!host)return;var p=state.population;if(!p)return;
    host.innerHTML='<h3>Popullsia dhe fuqia punëtore</h3><div class="population-grid"><div><small>Qytetarë</small><strong>'+p.citizens.toLocaleString('sq-AL')+'</strong></div><div><small>Emigruar këtë javë</small><strong>'+p.lastEmigrants.toLocaleString('sq-AL')+'</strong></div><div><small>Të papunë të disponueshëm</small><strong>'+populationAvailableWorkers(state).toLocaleString('sq-AL')+'</strong></div><div><small>Ndikimi në tatime</small><strong>−'+((1-populationFactor(state))*100).toFixed(2)+'%</strong></div></div><details><summary>Emigrimi dhe tregu i punës</summary><p>Mbështetja nën 40% ose papunësia mbi 15% nxisin emigrimin javor. Tatimet zvogëlohen proporcionalisht; grantet, shitjet e aseteve dhe dividendët mbeten veçmas.</p><p>Fuqi punëtore: '+populationWorkforce(state).toLocaleString('sq-AL')+' · Të papunë gjithsej: '+populationUnemployed(state).toLocaleString('sq-AL')+' · Vende të rezervuara nga kontratat: '+populationReservedJobs(state).toLocaleString('sq-AL')+'.</p></details>';
}
