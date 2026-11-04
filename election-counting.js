/* Extends the existing election-day ledger. Law 08/L-228, arts. 110–111;
   official copy: data/ligji-08-L-228.pdf (Gazeta Zyrtare, ActID=77074).
   Votes, cohorts, popularity and tie draws are simulations, not real election data. */
const COUNTING_RULES=Object.freeze({version:2,maxPreferences:10,cohortsPerParty:256,source:'https://gzk.rks-gov.net/ActDetail.aspx?ActID=77074'});
const SIMULATED_GENDER_POLICY='BALANCED_SIMULATION_V1';
function completeSimulationGenders(parties,input){
    var metadata=JSON.parse(JSON.stringify(input||{subjects:{},genders:{}}));
    metadata.subjects=metadata.subjects||{};metadata.genders=metadata.genders||{};
    // Keep the metadata contract, but never manufacture biographical gender.
    parties.forEach(function(p){
        p.candidates.forEach(function(c){
            var g=metadata.genders[c.id];
            if(!g || g.simulated || !['M','F'].includes(g.value) || !g.source?.trim())
                metadata.genders[c.id]={value:null,source:null,status:'UNCONFIRMED'};
        });
    });
    return metadata;
}
function simulationGenderMinimum(count,metadata){
    return metadata?.genderPolicy===SIMULATED_GENDER_POLICY && count===1?0:Math.ceil(count*ASSEMBLY_RULES.genderPercent/100);
}
function validateCountConfiguration(st){
    var c=st.electionCountConfiguration;if(c===undefined)return;
    if(!c || !Array.isArray(c.participants) || !c.participants.length || new Set(c.participants).size!==c.participants.length || !c.subjects || !c.genders)throw Error('Konfigurimi zgjedhor është i pavlefshëm.');
    c.participants.forEach(function(id){var s=c.subjects[id];if(typeof id!=='string' || !st.candidateRegistry?.[id] || !s || !['GENERAL',...Object.keys(ASSEMBLY_RULES.guarantees)].includes(s.community) || typeof s.source!=='string' || !s.source.trim() || !Number.isFinite(s.support) || s.support<0 || s.support>100)throw Error('Subjekti, komuniteti ose mbështetja e simuluar është e pavlefshme.');});
    if(!c.participants.some(function(id){return c.subjects[id].support>0;}))throw Error('Të paktën një subjekt duhet të ketë mbështetje të simuluar pozitive.');
    var candidateIds=new Set(Object.values(st.candidateRegistry).flat().map(function(c){return c.id;}));if(Object.keys(c.genders).some(function(id){return !candidateIds.has(id);}))throw Error('Të dhëna gjinore për kandidat të panjohur.');
    Object.values(c.genders).forEach(function(g){if(!g || !['M','F'].includes(g.value) || typeof g.source!=='string' || !g.source.trim())throw Error('Gjinia duhet të shoqërohet me burim; nuk nxirret nga emri.');});
}
function freezeCountPreparation(st,manifest){
    var draw=currentElectionDraw(st);if(!draw)throw Error('Regjistroni shortin e KQZ-së për këtë cikël para hapjes së votimit.');
    var config=st.electionCountConfiguration;validateCountConfiguration(st);
    manifest.countMetadata=JSON.parse(JSON.stringify(config?{subjects:config.subjects,genders:config.genders}:{subjects:{},genders:{}}));
    manifest.countMetadata=completeSimulationGenders(manifest.parties,manifest.countMetadata);
    // A single seat cannot represent both genders; use the existing explicit
    // simulation rounding rule while retaining every unknown gender as unknown.
    manifest.countMetadata.genderPolicy=SIMULATED_GENDER_POLICY;
    if(manifest.listPriorityPolicy)manifest.countMetadata.listPriorityPolicy=manifest.listPriorityPolicy;
    manifest.preparedBallots=JSON.parse(JSON.stringify(draw.sampleBallots));
    manifest.parties.forEach(function(p){
        if(!draw.participants.includes(p.partyId))throw Error('Pjesëmarrësit nuk përputhen me shortin e ruajtur.');p.partyNumber=draw.partyNumbers[p.partyId];
        if(config){var s=config.subjects[p.partyId];if(!config.generatedDefaults||!(p.lastPoll>0||p.meanPoll>0)){p.lastPoll=s.support;p.meanPoll=s.support;}}
    });
    if(config && config.participants.some(function(id){return !manifest.parties.some(function(p){return p.partyId===id;});}))throw Error('Mungon subjekt pjesëmarrës në listën e ngrirë.');
    if(!manifest.parties.some(function(p){return p.lastPoll>0 || p.meanPoll>0;}))throw Error('Mungojnë të dhënat e mbështetjes për shpërndarjen e votave.');
}
function countBallotGroups(manifest,groups){
    if(!Array.isArray(groups))throw Error('Mungon regjistri i fletëvotimeve.');
    var parties=new Map(manifest.parties.map(function(p){return [p.partyId,{original:p,votes:0,noPreference:0,overLimit:0,preferences:0,candidates:new Map(p.candidates.map(function(c){return [c.id,0];}))}];})),valid=0,invalid=0,cast=0;
    groups.forEach(function(g){
        if(!g || !Number.isSafeInteger(g.count) || g.count<=0 || !Array.isArray(g.candidateIds))throw Error('Grup fletëvotimesh i pavlefshëm.');cast+=g.count;
        if(g.status==='INVALID'){if(g.partyId!==null || g.candidateIds.length)throw Error('Fletëvotimi i pavlefshëm nuk i jep votë subjektit ose kandidatit.');invalid+=g.count;return;}
        var p=parties.get(g.partyId);if(!p || g.partyNumber!==p.original.partyNumber)throw Error('Numri i subjektit nuk përputhet me fletëvotimin.');
        if(!['VALID','VALID_NO_PREFERENCE','PARTY_ONLY_OVER_LIMIT'].includes(g.status) || new Set(g.candidateIds).size!==g.candidateIds.length || g.candidateIds.some(function(id){return !p.candidates.has(id);}))throw Error('Preferenca të dyfishta ose jashtë subjektit.');
        if((g.status==='VALID' && (g.candidateIds.length<1 || g.candidateIds.length>10)) || (g.status==='VALID_NO_PREFERENCE' && g.candidateIds.length) || (g.status==='PARTY_ONLY_OVER_LIMIT' && g.candidateIds.length<=10))throw Error('Statusi i fletëvotimit nuk përputhet me preferencat.');
        valid+=g.count;p.votes+=g.count;
        if(g.status==='PARTY_ONLY_OVER_LIMIT'){p.overLimit+=g.count;return;}
        if(!g.candidateIds.length)p.noPreference+=g.count;
        g.candidateIds.forEach(function(id){p.candidates.set(id,p.candidates.get(id)+g.count);p.preferences+=g.count;});
    });
    if(!Number.isSafeInteger(cast) || cast>manifest.electorate)throw Error('Totali i fletëvotimeve tejkalon elektoratin e modelit.');
    return {parties:parties,valid:valid,invalid:invalid,cast:cast};
}
function generateMultiPreferenceResults(cycle){
    // Reuse the existing support/turnout model; replace only its one-preference approximation.
    var manifest=cycle.manifest,base=generateElectionDayResults(Object.assign({},cycle,{manifest:Object.assign({},manifest,{modelVersion:1,preferenceModel:ELECTION_DAY_MODEL.preferenceModel})}));
    var random=electionRandom(electionSeed(cycle.seed+':preferences-v2')),groups=[];
    manifest.parties.forEach(function(p){
        var total=base.parties.find(function(r){return r.partyId===p.partyId;}).votes,samples=(manifest.preparedBallots||[]).filter(function(b){return b.partyId===p.partyId;});
        if(samples.length>total)throw Error('Shembujt e përgatitur tejkalojnë votat e simuluara të subjektit '+p.partyId+'.');
        samples.forEach(function(b){if(!validPreparedPreferences(p.candidates,b.candidateIds) || b.partyNumber!==p.partyNumber)throw Error('Lista e dorëzuar nuk përputhet me preferencat e përgatitura.');groups.push({partyId:p.partyId,partyNumber:p.partyNumber,candidateIds:b.candidateIds.slice(),status:b.candidateIds.length?'VALID':'VALID_NO_PREFERENCE',count:1,origin:'PREPARED'});});
        var remaining=total-samples.length;
        if(manifest.listPriorityPolicy==='TOP10_POOL30_V1'&&p.candidates.length&&remaining){var protectedIds=p.candidates.slice().sort((a,b)=>a.ballotPosition-b.ballotPosition).slice(0,10).map(c=>c.id),core=Math.ceil(remaining*.7);groups.push({partyId:p.partyId,partyNumber:p.partyNumber,candidateIds:protectedIds,status:'VALID',count:core,origin:'SIMULATED'});remaining-=core;}
        var cohorts=Math.min(COUNTING_RULES.cohortsPerParty,remaining);
        var weighted=(manifest.listPriorityPolicy==='TOP10_POOL30_V1'?p.candidates.slice().sort((a,b)=>a.ballotPosition-b.ballotPosition).slice(0,30):p.candidates).map(function(c){return {candidate:c,weight:(.35+(electionSeed(c.id+':appeal')%1600)/1000)*(1+.18/(1+(c.ballotPosition||c.listNumber)/15))};});
        for(var i=0;i<cohorts;i++){
            var count=Math.floor(remaining/(cohorts-i));remaining-=count;
            var ids=[],size=random()<.12?0:1+Math.floor(random()*Math.min(10,p.candidates.length)),available=weighted.slice();
            if(!available.length)size=0;
            for(var k=0;k<size;k++){
                var weights=available.map(function(row){return row.weight;}),sum=weights.reduce(function(a,b){return a+b;},0),pick=random()*sum,chosen=weights.length-1;
                for(var n=0;n<weights.length;n++){pick-=weights[n];if(pick<=0){chosen=n;break;}}
                ids.push(available.splice(chosen,1)[0].candidate.id);
            }
            groups.push({partyId:p.partyId,partyNumber:p.partyNumber,candidateIds:ids,status:ids.length?'VALID':'VALID_NO_PREFERENCE',count:count,origin:'SIMULATED'});
        }
    });
    if(base.invalidVotes)groups.push({partyId:null,partyNumber:null,candidateIds:[],status:'INVALID',count:base.invalidVotes,origin:'SIMULATED'});
    var counted=countBallotGroups(manifest,groups);
    base.parties.forEach(function(p){var totals=counted.parties.get(p.partyId);p.partyNumber=totals.original.partyNumber;p.votes=totals.votes;p.unassignedPreferenceVotes=totals.noPreference;p.overLimitPreferenceBallots=totals.overLimit;p.preferenceTotal=totals.preferences;p.candidates.forEach(function(c){c.personalVotes=totals.candidates.get(c.id);});p.candidates.sort(function(a,b){return b.personalVotes-a.personalVotes || (manifest.listPriorityPolicy==='TOP10_POOL30_V1'?a.ballotPosition-b.ballotPosition:assemblyDraw(cycle.seed,a.id)-assemblyDraw(cycle.seed,b.id)) || a.id.localeCompare(b.id);});p.candidates.forEach(function(c,i){c.rank=i+1;});});
    base.modelVersion=2;base.preferenceModel=manifest.preferenceModel;base.preferencesPerBallot=10;base.ballotGroups=groups;base.ballotDigest=electionSeed(JSON.stringify(groups));
    validateMultiPreferenceResults({manifest:manifest,results:base});return base;
}
function validateMultiPreferenceResults(cycle){
    var r=cycle.results,m=cycle.manifest;if(!r || r.modelVersion!==2 || r.preferenceModel!=='SIMULATED_UP_TO_TEN' || r.preferencesPerBallot!==10 || r.ballotDigest!==electionSeed(JSON.stringify(r.ballotGroups)))throw Error('Regjistri preferencial i ruajtur është ndryshuar.');
    var totals=countBallotGroups(m,r.ballotGroups);if(totals.cast!==r.ballotsCast || totals.valid!==r.validVotes || totals.invalid!==r.invalidVotes)throw Error('Votat nuk përputhen me fletëvotimet e ruajtura.');
    r.parties.forEach(function(p){var t=totals.parties.get(p.partyId);if(!t || p.votes!==t.votes || p.partyNumber!==t.original.partyNumber || p.unassignedPreferenceVotes!==t.noPreference || p.overLimitPreferenceBallots!==t.overLimit || p.preferenceTotal!==t.preferences || p.preferenceTotal>10*p.votes || p.candidates.some(function(c){return c.personalVotes!==t.candidates.get(c.id) || c.personalVotes>p.votes;}))throw Error('Preferencat e kandidatëve nuk përputhen me regjistrin e subjektit.');});
    return totals;
}
function strictAssemblyIssues(report,cycle){
    var issues=[];
    if(report.totalSeats!==120 || report.deputies.length!==120 || report.generalSeats!==100 || report.guaranteedSeats!==20 || new Set(report.deputies.map(function(mp){return mp.candidateId;})).size!==120)issues.push('Publikimi kërkon saktësisht 120 mandate dhe 120 deputetë unikë.');
    if(report.unresolvedSeats || report.unresolvedCandidates || report.unresolvedCommunities.length || report.legalChecks.communities!=='CONFIGURED')issues.push('Mungojnë rezultate ose kategori të veçanta për komunitetet; grupi MIN_MULTI nuk ndahet me hamendje.');
    if(cycle.results.parties.some(function(p){var s=report.metadata.subjects[p.partyId];return !s || !s.source?.trim();}))issues.push('Çdo subjekt kërkon burim ose deklarim të qartë të kategorisë së simuluar.');
    if(report.deputies.some(mp=>mp.gender!==assemblyGender(report.metadata,mp.candidateId)))issues.push('Të dhënat e deputetit nuk përputhen me metadata-n e regjistruar.');
    if(Object.values(report.legalChecks.gender).some(status=>!['CHECKED','EXEMPT','SIMULATED_SINGLE_SEAT','MISSING_GENDER'].includes(status)))issues.push('Përzgjedhja nuk plotëson kontrollin e të dhënave të disponueshme.');
    if(report.totalSeats===120 && report.legalChecks.communities==='CONFIGURED'){
        try{
            var parties=cycle.results.parties,metadata=report.metadata,eligible=parties.filter(function(p){var s=metadata.subjects[p.partyId];return s && (s.community!=='GENERAL' || BigInt(p.votes)*100n>=BigInt(cycle.results.validVotes)*5n);}),seats={},reserved={};
            parties.forEach(function(p){seats[p.partyId]=0;reserved[p.partyId]=0;});
            Object.entries(report.communityGuarantees).forEach(function(entry){var pool=allocateAssemblyPool(eligible.filter(function(p){return metadata.subjects[p.partyId].community===entry[0];}),entry[1],seats,cycle.seed,entry[0],true);seats=pool.seats;pool.awards.forEach(function(id){reserved[id]++;});});
            seats=allocateAssemblyPool(eligible,100,seats,cycle.seed,'GENERAL',true).seats;
            if(typeof applyDiasporaSeatBonus==='function')applyDiasporaSeatBonus(seats,reserved,cycle,parties,eligible);
            if(report.mandates.some(function(p){return p.total!==seats[p.partyId] || p.guaranteed!==reserved[p.partyId];}))issues.push('Mandatet nuk përputhen me formulën e kontrolluar.');
            report.mandates.filter(function(p){return p.total;}).forEach(function(p){var result=parties.find(function(row){return row.partyId===p.partyId;}),check={warnings:[],legalChecks:{gender:{}}},expected=selectSimulatedAssemblyDeputies(result,p.total,metadata,cycle.seed,check).map(function(c){return c.candidateId;}).sort(),actual=report.deputies.filter(function(mp){return mp.partyId===p.partyId;}).map(function(mp){return mp.candidateId;}).sort();if(JSON.stringify(expected)!==JSON.stringify(actual))issues.push(p.partyId+': emrat ose kuota nuk përputhen me përzgjedhjen e kontrolluar.');});
        }catch(error){issues.push(error.message);}
    }
    try{validateMultiPreferenceResults(cycle);}catch(error){issues.push(error.message);}
    return issues;
}
function countConfigurationHtml(){
    if(!state)return '';var config=state.electionCountConfiguration||{participants:electoralParticipantIds(state),subjects:{},genders:{}},draw=currentElectionDraw(state),e=electoralEscape;
    return '<details id="countConfiguration"><summary>Pjesëmarrësit dhe të dhënat për mandatet</summary><p>Për zgjedhjet e reja zgjidhni subjektet veçmas dhe deklaroni kategoritë e simulimit. Mos ndani votat e grupit MIN_MULTI në mënyrë arbitrare. Pjesëmarrësit kyçen pas shortit. Gjinia nuk nxirret nga emri. Vlerat që mungojnë mbeten të pakonfirmuara; kuota nuk paraqitet si e verifikuar pa të dhëna me burim.</p>'+Object.keys(state.candidateRegistry).filter(function(id){return id!=='MIN_MULTI';}).map(function(id,i){var s=config.subjects[id]||{},selected=config.participants.includes(id);return '<div class="count-config-row"><label><input type="checkbox" data-count-subject="'+e(id)+'" '+(selected?'checked':'')+' '+(draw?'disabled':'')+'> '+e(state.parties[id]?.name||BROCHURE_SUBJECTS[id]?.name||id)+'</label><label>Kategoria<select data-count-category="'+e(id)+'"><option value="">Zgjidhni</option>'+Object.keys(ASSEMBLY_CATEGORY_LABELS).map(function(c){return '<option value="'+c+'" '+((s.community||(['LVV','LDK','PDK','AAK','NISMA'].includes(id)?'GENERAL':id==='SL'?'SERB':''))===c?'selected':'')+'>'+ASSEMBLY_CATEGORY_LABELS[c]+'</option>';}).join('')+'</select></label><label>Burimi ose deklarimi i simuluar<input data-count-source="'+e(id)+'" value="'+e(s.source||'')+'"></label><label>Mbështetja e simuluar (peshë 0–100)<input data-count-support="'+e(id)+'" type="number" min="0" max="100" step="0.01" value="'+(s.support??state.parties[id]?.poll??0)+'"></label></div>';}).join('')+'<label>Të dhënat gjinore: një kandidat për rresht, ID; M ose F; burimi<textarea id="countGenderData" placeholder="ID e kandidatit; F; burimi ose deklarim i simuluar">'+e(Object.entries(config.genders).map(function(pair){return pair[0]+'; '+pair[1].value+'; '+pair[1].source;}).join('\n'))+'</textarea></label><button class="action-btn" onclick="saveCountConfiguration()">Ruaj pjesëmarrësit dhe të dhënat</button></details>';
}
function countingReportHtml(cycle){
    var e=electoralEscape,r=cycle.results,composition=(state.assemblyCompositions||[]).find(function(c){return c.cycleId===cycle.id;}),audit;
    try{audit=validateMultiPreferenceResults(cycle);}catch(error){return '<div class="card" role="alert">Raporti është i pavlefshëm: '+e(error.message)+'</div>';}
    return '<div class="card"><h3>Raporti i numërimit</h3><p>Fletëvotime: '+r.ballotsCast+' · Vota të vlefshme për subjektet: '+r.validVotes+' · Fletëvotime të pavlefshme: '+r.invalidVotes+'</p><p>Regjistri ruan '+r.ballotGroups.length+' grupe me shumësi: secila fletëvotim në një grup ka të njëjtin subjekt, status dhe preferenca. Shumësitë përmbledhin të gjitha '+audit.cast+' fletëvotimet e simuluara.</p>'+r.parties.map(function(p){var mandate=composition?.mandates.find(function(m){return m.partyId===p.partyId;});return '<p><strong>Subjekti '+p.partyNumber+' · '+e(p.name)+'</strong>: '+p.votes+' vota ('+p.percentage.toFixed(2)+'%) · '+p.preferenceTotal+' preferenca · '+p.unassignedPreferenceVotes+' vota pa kandidatë · '+p.overLimitPreferenceBallots+' vetëm për subjektin pas tejkalimit të dhjetë preferencave · Mandate: '+(mandate?mandate.total+' ('+mandate.guaranteed+' nga garancitë)':'ende pa llogaritur')+'</p>';}).join('')+'<p>Deputetë përfundimtarë: '+(composition?.status==='PUBLISHED'?composition.deputies.length:'Publikimi ende nuk ka kaluar të gjitha kontrollet.')+'</p></div>';
}
function saveCountConfiguration(){
    if(getElectionDayCycle(state)){showToast('Të dhënat hyrëse të këtij votimi janë ngrirë; përbërja mund të plotësohet në panelin e Kuvendit.');return false;}
    var before=JSON.stringify(state),participants=Array.from(document.querySelectorAll('[data-count-subject]:checked')).map(function(el){return el.dataset.countSubject;}),subjects={},genders={};
    try{
        var draw=currentElectionDraw(state);if(draw && JSON.stringify(participants.slice().sort())!==JSON.stringify(draw.participants.slice().sort()))throw Error('Pjesëmarrësit nuk ndryshohen pas shortit; konfiguroni ciklin e ardhshëm.');
        participants.forEach(function(id){function field(type){return Array.from(document.querySelectorAll('[data-count-'+type+']')).find(function(el){return el.getAttribute('data-count-'+type)===id;});}subjects[id]={community:field('category').value,source:field('source').value.trim(),support:Number(field('support').value)};});
        document.getElementById('countGenderData').value.split(/\r?\n/).filter(function(line){return line.trim();}).forEach(function(line){var parts=line.split(';').map(function(t){return t.trim();});if(parts.length<3 || genders[parts[0]])throw Error('Çdo rresht gjinor kërkon ID unike, M/F dhe burim.');genders[parts[0]]={value:parts[1],source:parts.slice(2).join(';')};});
        state.electionCountConfiguration={participants:participants,subjects:subjects,genders:genders};validateCountConfiguration(state);if(!saveGameAuto()){state=JSON.parse(before);return false;}renderElectoralList();showToast('Të dhënat zgjedhore u ruajtën.');return true;
    }catch(error){state=JSON.parse(before);showToast(error.message);return false;}
}
