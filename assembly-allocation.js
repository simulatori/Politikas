/* Phase 5. Pure allocation functions; votes and active institutions are never changed. */
const ASSEMBLY_RULES = Object.freeze({
    version: 1, total: 120, general: 100, guaranteed: 20, thresholdPercent: 5,
    guarantees: Object.freeze({SERB:10, BOSNIAK:3, TURK:2, GORAN:1, ROM:1, ASHKALI:1, EGYPTIAN:1}),
    formula: "DHONDT_ROUNDED", guaranteePolicy: "MINIMUM_FIRST_NEXT_DIVISOR",
    tiePolicy: "SEEDED_SIMULATION_DRAW", genderPercent: 30, legalConfirmed: false
});

function migrateAssemblyState(gameState) {
    if (typeof gameState.assemblyCompositions === "undefined") gameState.assemblyCompositions = [];
}

function assemblyDraw(seed, key) { return electionSeed(String(seed) + ":assembly:" + key); }

// Each next quotient uses ALL seats already awarded, including guarantees.
function allocateAssemblyPool(parties, count, initial, seed, pool, preferVotes) {
    var seats = Object.assign({}, initial), awards = [], ties = [];
    parties.forEach(function(p) { if (!Object.hasOwn(seats, p.partyId)) seats[p.partyId] = 0; });
    for (var n = 0; n < count; n++) {
        var eligible = parties.filter(function(p) { return p.votes > 0 && seats[p.partyId] < p.candidates.length; });
        if (!eligible.length) throw Error("Nuk ka kandidatë me vota për t’i plotësuar ulëset e grupit " + pool + ".");
        var scores = eligible.map(function(p) {
            // Exact integer rounding of votes/divisor, avoiding floating point quotient ties.
            var divisor = BigInt(seats[p.partyId] + 1), votes = BigInt(p.votes);
            return {p:p, score:(2n * votes + divisor) / (2n * divisor)};
        });
        scores.sort(function(a,b) {
            if (a.score !== b.score) return a.score > b.score ? -1 : 1;
            if(preferVotes && a.p.votes!==b.p.votes)return b.p.votes-a.p.votes;
            var ha = assemblyDraw(seed,pool+":"+n+":"+a.p.partyId), hb = assemblyDraw(seed,pool+":"+n+":"+b.p.partyId);
            return ha - hb || (a.p.partyId < b.p.partyId ? -1 : 1);
        });
        var tied = scores.filter(function(item) { return item.score === scores[0].score && (!preferVotes || item.p.votes===scores[0].p.votes); });
        if (tied.length > 1) ties.push({pool:pool, position:n+1, parties:tied.map(function(item){return item.p.partyId;}), winner:scores[0].p.partyId});
        var winner = scores[0].p.partyId;
        seats[winner]++; awards.push(winner);
    }
    return {seats:seats, awards:awards, ties:ties};
}

function selectAssemblyCandidates(party, count, metadata, seed) {
    if (!count) return [];
    if (party.candidates.length < count) throw Error(party.partyId + ": mungojnë kandidatë për " + count + " mandate.");
    var ranked = party.candidates.slice().sort(function(a,b) {
        return b.personalVotes-a.personalVotes || assemblyDraw(seed,a.id)-assemblyDraw(seed,b.id) || (a.id < b.id ? -1 : 1);
    });
    var unknown = ranked.filter(function(c) { return !metadata.genders[c.id] || !["M","F"].includes(metadata.genders[c.id].value) || !metadata.genders[c.id].source; });
    if (unknown.length) throw Error(party.partyId + ": mungon gjinia e dokumentuar për " + unknown.length + " kandidatë; kuota nuk mund të kontrollohet.");
    var elected = ranked.slice(0,count);
    // Article 111(6) excludes lists consisting of one or two candidates.
    if (ranked.length > 2) {
        var minimum = Math.ceil(count * ASSEMBLY_RULES.genderPercent / 100);
        if (minimum * 2 > count) throw Error(party.partyId + ": rrumbullakimi i kuotës për këtë numër mandatesh kërkon sqarim ligjor.");
        for (var gender of ["M","F"]) {
            while (elected.filter(function(c){return metadata.genders[c.id].value===gender;}).length < minimum) {
                var replacement = ranked.find(function(c){return metadata.genders[c.id].value===gender && !elected.includes(c);});
                var remove = elected.slice().reverse().find(function(c){return metadata.genders[c.id].value!==gender;});
                if (!replacement || !remove) throw Error(party.partyId + ": lista nuk mund ta plotësojë kuotën gjinore për mandatet e fituara.");
                elected.splice(elected.indexOf(remove),1); elected.push(replacement);
            }
        }
    }
    return elected.map(function(c){return {candidateId:c.id,name:c.name,partyId:party.partyId,listNumber:c.listNumber,personalVotes:c.personalVotes,gender:metadata.genders[c.id].value};});
}

function assemblyMetadata(gameState, cycle) {
    // Metadata is a sidecar: old frozen manifests and their vote snapshots stay intact.
    var supplied = cycle.assemblyMetadata || cycle.manifest?.countMetadata || {}, metadata = {subjects:{},genders:{}};
    cycle.results.parties.forEach(function(p) {
        var category = ELECTION_SIMULATION_COMMUNITIES[p.partyId] || null;
        metadata.subjects[p.partyId] = category ? {community:category,source:"Identiteti i subjektit në lojë"} : null;
    });
    Object.assign(metadata.subjects,supplied.subjects || {});
    Object.assign(metadata.genders,supplied.genders || {});
    if(supplied.genderPolicy)metadata.genderPolicy=supplied.genderPolicy;
    if(supplied.listPriorityPolicy)metadata.listPriorityPolicy=supplied.listPriorityPolicy;
    return metadata;
}

function calculateLegacyAssemblyComposition(cycle, metadata) {
    var report = {version:1,cycleId:cycle && cycle.id,status:"BLOCKED",legalConfirmed:false,
        rules:JSON.parse(JSON.stringify(ASSEMBLY_RULES)),errors:[],warnings:["Ndarje e simulimit. Politika e garancive dhe shorti i qëndrueshëm nuk janë certifikuar si procedurë ligjore; preferencat e Fazës 4 janë të simuluara."],
        mandates:[],deputies:[],ties:[],generalSeats:0,guaranteedSeats:0,totalSeats:0};
    if (!cycle || cycle.status !== "RESULTS" || !cycle.results) { report.errors.push("Përfundoni numërimin e votave para ndarjes së mandateve."); return report; }
    if (!metadata || !metadata.subjects || !metadata.genders || !Array.isArray(cycle.results.parties)) {report.errors.push("Mungojnë të dhënat e subjekteve dhe kandidatëve për ndarjen.");return report;}
    report.resultsSnapshot = JSON.stringify(cycle.results);
    report.metadata = JSON.parse(JSON.stringify(metadata));
    var parties = cycle.results.parties, ids = new Set(), candidateIds = new Set(), total = 0;
    parties.forEach(function(p) {
        if (!p || typeof p.partyId !== "string" || ids.has(p.partyId) || !Number.isSafeInteger(p.votes) || p.votes < 0 || !Array.isArray(p.candidates)) { report.errors.push("Rezultati i subjektit është i dëmtuar."); return; }
        ids.add(p.partyId); total += p.votes;
        var subject = metadata.subjects[p.partyId];
        if (!subject || !subject.source || !["GENERAL"].concat(Object.keys(ASSEMBLY_RULES.guarantees)).includes(subject.community)) report.errors.push(p.partyId + ": mungon kategoria e veçantë e komunitetit dhe burimi; votat e një grupi të bashkuar nuk mund të ndahen me hamendje.");
        p.candidates.forEach(function(c){
            if (!c || typeof c.id !== "string" || candidateIds.has(c.id) || c.partyId !== p.partyId || typeof c.name !== "string" || !Number.isSafeInteger(c.personalVotes) || c.personalVotes < 0 || c.personalVotes > p.votes || !Number.isInteger(c.listNumber) || c.listNumber < 1) report.errors.push(p.partyId + ": kandidat i dyfishtë, i paidentifikueshëm ose pa vota personale të vlefshme.");
            candidateIds.add(c && c.id);
        });
        if (!Number.isSafeInteger(p.unassignedPreferenceVotes) || p.unassignedPreferenceVotes<0 || p.candidates.reduce(function(sum,c){return sum+c.personalVotes;},0)+p.unassignedPreferenceVotes!==p.votes) report.errors.push(p.partyId + ": preferencat personale nuk përputhen me votat e regjistruara.");
        if (p.votes > 0 && subject && (subject.community !== "GENERAL" || p.votes >= cycle.results.validVotes * 0.05)) {
            var missing = p.candidates.filter(function(c){var g=metadata.genders[c.id];return !g || !["M","F"].includes(g.value) || !g.source;}).length;
            if (missing) report.errors.push(p.partyId + ": mungon gjinia e dokumentuar për " + missing + " kandidatë.");
        }
    });
    Object.keys(ASSEMBLY_RULES.guarantees).forEach(function(category){
        var members = parties.filter(function(p){return metadata.subjects[p.partyId] && metadata.subjects[p.partyId].community===category;});
        if (members.reduce(function(sum,p){return sum+p.candidates.length;},0) < ASSEMBLY_RULES.guarantees[category]) report.errors.push(category + ": mungojnë subjekte ose kandidatë me vota personale të regjistruara për garancinë minimale.");
    });
    if (!Number.isSafeInteger(total) || total <= 0 || total !== cycle.results.validVotes) report.errors.push("Shuma e votave të vlefshme nuk përputhet.");
    if (report.errors.length) return report;
    var eligible = parties.filter(function(p){return metadata.subjects[p.partyId].community !== "GENERAL" || BigInt(p.votes)*100n >= BigInt(total)*5n;});
    var guarantees = Object.assign({},ASSEMBLY_RULES.guarantees), rae = ["ROM","ASHKALI","EGYPTIAN"].map(function(category){
        return {category:category,votes:parties.filter(function(p){return metadata.subjects[p.partyId].community===category;}).reduce(function(sum,p){return sum+p.votes;},0)};
    }).sort(function(a,b){return b.votes-a.votes || assemblyDraw(cycle.seed,a.category)-assemblyDraw(cycle.seed,b.category) || a.category.localeCompare(b.category);});
    if (rae[0].votes === rae[1].votes) report.warnings.push("Barazimi për ulësen shtesë rom/ashkali/egjiptian zgjidhet me shortin e qëndrueshëm të simulimit.");
    guarantees[rae[0].category]++;
    report.communityGuarantees = guarantees;
    var seats = {}, guaranteed = {};
    parties.forEach(function(p){seats[p.partyId]=0;guaranteed[p.partyId]=0;});
    Object.keys(guarantees).forEach(function(category) {
        try {
            var members = eligible.filter(function(p){return metadata.subjects[p.partyId].community===category;});
            var pool = allocateAssemblyPool(members,guarantees[category],seats,cycle.seed,category);
            seats = pool.seats; report.ties = report.ties.concat(pool.ties);
            pool.awards.forEach(function(id){guaranteed[id]++;});
        } catch (error) { report.errors.push(category + ": " + error.message); }
    });
    if (report.errors.length) return report;
    try {
        var general = allocateAssemblyPool(eligible,ASSEMBLY_RULES.general,seats,cycle.seed,"GENERAL");
        seats = general.seats; report.ties = report.ties.concat(general.ties);
    } catch (error) { report.errors.push(error.message); return report; }
    if(typeof applyDiasporaSeatBonus==='function')report.diasporaSwing=applyDiasporaSeatBonus(seats,guaranteed,cycle,parties,eligible);
    parties.forEach(function(p) {
        var subject = metadata.subjects[p.partyId], count = seats[p.partyId];
        report.mandates.push({partyId:p.partyId,name:p.name,community:subject.community,votes:p.votes,eligible:eligible.includes(p),general:count-guaranteed[p.partyId],guaranteed:guaranteed[p.partyId],total:count});
        try {
            selectAssemblyCandidates(p,count,metadata,cycle.seed).forEach(function(mp,index) {
                mp.community = subject.community; mp.seatType = index < guaranteed[p.partyId] ? "GUARANTEED" : "GENERAL";
                mp.seatNumber = report.deputies.length+1; report.deputies.push(mp);
            });
        } catch (error) { report.errors.push(error.message); }
    });
    report.generalSeats = report.mandates.reduce(function(s,p){return s+p.general;},0);
    report.guaranteedSeats = report.mandates.reduce(function(s,p){return s+p.guaranteed;},0);
    report.totalSeats = report.generalSeats + report.guaranteedSeats;
    if (report.totalSeats !== 120 || report.generalSeats !== 100 || report.guaranteedSeats !== 20 || report.deputies.length !== 120 || new Set(report.deputies.map(function(mp){return mp.candidateId;})).size !== 120) report.errors.push("Përbërja nuk i plotëson 120 ulëset me 120 kandidatë unikë (100 të përgjithshme dhe 20 të garantuara).");
    if (report.resultsSnapshot !== JSON.stringify(cycle.results)) report.errors.push("Të dhënat e votimit ndryshuan gjatë llogaritjes.");
    if (!report.errors.length) report.status = "PUBLISHED";
    else report.deputies = []; // No incomplete elected roster is published.
    return report;
}

function getAssemblyComposition() {
    var cycle = getElectionDayCycle(state);
    return cycle && (state.assemblyCompositions || []).find(function(record){return record.cycleId===cycle.id;});
}

function publishLegacyAssemblyComposition() {
    var cycle = getElectionDayCycle(state);
    if (!cycle || cycle.status !== "RESULTS") {showToast("Përfundoni fillimisht numërimin e zgjedhjeve.");return false;}
    try {validateElectionDayState(state);} catch (error) {showToast("Mandatet nuk u llogaritën: " + error.message);return false;}
    migrateAssemblyState(state);
    var previous = getAssemblyComposition();
    if (previous && previous.status === "PUBLISHED") {showToast("Mandatet e këtij cikli janë ruajtur tashmë.");return false;}
    var report = calculateAssemblyComposition(cycle,assemblyMetadata(state,cycle)), old = state.assemblyCompositions.slice();
    report.integrity = electionSeed(JSON.stringify(report));
    state.assemblyCompositions = old.filter(function(r){return r.cycleId!==cycle.id;}).concat([report]);
    if (!saveGameAuto()) {state.assemblyCompositions=old;return false;}
    renderAssemblyComposition();
    showToast(report.status === "PUBLISHED" ? "U ruajt përbërja e re e simulimit me 120 deputetë." : "Publikimi u ndal. Kontrolloni të dhënat që mungojnë në panel.");
    return report.status === "PUBLISHED";
}

function openAssemblyComposition() {
    var cycle=getElectionDayCycle(state),record=getAssemblyComposition();
    if(cycle && cycle.status==="RESULTS" && (!record || record.status==="BLOCKED" || record.status==='PARTIAL' && cycle.manifest.modelVersion===2))publishAssemblyComposition();
    switchMainTab("tab-assembly");
    switchSubTab("ass","composition",document.getElementById("assemblyCompositionTabBtn"));
}

function renderLegacyAssemblyComposition() {
    var host = document.getElementById("assemblyCompositionPanel"); if (!host) return;
    var cycle = getElectionDayCycle(state), record = getAssemblyComposition(), esc = electoralEscape;
    var html = '<div class="card"><h3>Përbërja e Kuvendit</h3><p>120 ulëse: 100 të përgjithshme dhe 20 të garantuara. Shumica parlamentare: 61 deputetë.</p><p>Ndarje e simulimit — pa certifikim ligjor. Përbërja ruhet për ciklin zgjedhor; konstituimi trajtohet në fazën pasuese.</p>';
    if (!cycle || cycle.status !== "RESULTS") html += '<p>Përfundoni numërimin e votave për ta llogaritur përbërjen e re.</p>';
    else html += '<p>Cikli: '+esc(cycle.id)+' · '+esc(campaignCalendarLabel(cycle.manifest.date))+'</p><button id="allocateAssemblyBtn" class="action-btn btn-gold" onclick="publishAssemblyComposition()" '+(record && record.status === "PUBLISHED" ? 'disabled' : '')+'>'+(record && record.status === "PUBLISHED" ? 'Mandatet janë ruajtur' : 'Llogarit dhe kontrollo mandatet')+'</button>';
    html += '</div>';
    if (record) {
        html += '<div class="card"><h3>'+(record.status === "PUBLISHED" ? 'Përbërja e ruajtur — 120 deputetë' : 'Publikimi është ndalur')+'</h3>';
        if (record.errors.length) html += '<ul role="alert">'+record.errors.map(function(e){return '<li>'+esc(e)+'</li>';}).join('')+'</ul>';
        html += record.warnings.map(function(w){return '<p>'+esc(w)+'</p>';}).join('');
        if (record.mandates.length) {
            html += '<p>'+record.generalSeats+' të përgjithshme · '+record.guaranteedSeats+' të garantuara'+(record.status === "BLOCKED" ? ' — vetëm parashikim, jo deputetë të publikuar' : '')+'</p>';
            html += '<div class="assembly-allocation-chart" aria-label="Ndarja e ulëseve">'+record.mandates.filter(function(p){return p.total;}).map(function(p){return '<div><strong>'+esc(p.name)+' — '+p.total+'</strong><meter min="0" max="120" value="'+p.total+'">'+p.total+'</meter><small>'+p.general+' të përgjithshme · '+p.guaranteed+' të garantuara'+(p.total>=61?' · Shumicë parlamentare':'')+'</small></div>';}).join('')+'</div>';
        }
        if (record.status === "PUBLISHED") html += record.mandates.filter(function(p){return p.total;}).map(function(p){return '<details><summary>'+esc(p.name)+' — '+p.total+' deputetë</summary><ol>'+record.deputies.filter(function(mp){return mp.partyId===p.partyId;}).map(function(mp){return '<li>'+esc(mp.name)+' · #'+mp.listNumber+' · '+mp.personalVotes+' vota · '+esc(p.partyId)+'</li>';}).join('')+'</ol></details>';}).join('');
        html += '</div>';
    }
    if(record && record.status==="PUBLISHED")html+='<button id="openConstituentBtn" class="action-btn btn-gold" onclick="openConstituentSessionPanel()">Hap seancën konstituive të Kuvendit</button>';
    host.innerHTML = html;
}

function validateLegacyAssemblyState(gameState) {
    if (typeof gameState.assemblyCompositions === "undefined") return;
    if (!Array.isArray(gameState.assemblyCompositions)) throw Error("Regjistri i përbërjes së Kuvendit është i dëmtuar.");
    var seen = new Set();
    gameState.assemblyCompositions.forEach(function(record) {
        var cycle = (gameState.parliamentaryElections || []).find(function(c){return c.id===record.cycleId;});
        if (!cycle || seen.has(record.cycleId) || record.version!==1 || !["BLOCKED","PUBLISHED"].includes(record.status) || !record.metadata || record.resultsSnapshot!==JSON.stringify(cycle.results)) throw Error("Përbërja e Kuvendit nuk përputhet me ciklin zgjedhor.");
        seen.add(record.cycleId);
        var copy = JSON.parse(JSON.stringify(record)); delete copy.integrity;
        if (record.integrity!==electionSeed(JSON.stringify(copy)) || !Array.isArray(record.mandates) || !Array.isArray(record.deputies) || !Array.isArray(record.errors) || !Array.isArray(record.warnings) || JSON.stringify(record.rules)!==JSON.stringify(ASSEMBLY_RULES) || record.legalConfirmed!==false) throw Error("Mandatet ose deputetët e ruajtur janë të dëmtuar.");
        if (record.status === "BLOCKED") {if (!record.errors.length || record.deputies.length) throw Error("Publikim i paplotë i Kuvendit.");return;}
        if (record.errors.length || record.totalSeats!==120 || record.generalSeats!==100 || record.guaranteedSeats!==20 || record.deputies.length!==120) throw Error("Përbërja e ruajtur nuk ka 120 deputetë.");
        var candidates = new Set(), seatNumbers = new Set(), subjects = new Set(), general = 0, guaranteed = 0;
        record.mandates.forEach(function(p){
            if (subjects.has(p.partyId) || !Number.isInteger(p.general) || p.general<0 || !Number.isInteger(p.guaranteed) || p.guaranteed<0 || p.total!==p.general+p.guaranteed) throw Error("Mandate të dyfishuara ose të pavlefshme.");
            subjects.add(p.partyId);general+=p.general;guaranteed+=p.guaranteed;
            var original=cycle.results.parties.find(function(item){return item.partyId===p.partyId;});
            var deputies=record.deputies.filter(function(mp){return mp.partyId===p.partyId;});
            if (!original || original.votes!==p.votes || deputies.length!==p.total || deputies.filter(function(mp){return mp.seatType==="GUARANTEED";}).length!==p.guaranteed) throw Error("Deputetët nuk përputhen me subjektin dhe mandatet.");
            deputies.forEach(function(mp){
                var candidate=original.candidates.find(function(c){return c.id===mp.candidateId;});
                if (!candidate || candidate.name!==mp.name || candidate.personalVotes!==mp.personalVotes || candidate.listNumber!==mp.listNumber || candidates.has(mp.candidateId) || seatNumbers.has(mp.seatNumber) || !Number.isInteger(mp.seatNumber) || mp.seatNumber<1 || mp.seatNumber>120 || !["GENERAL","GUARANTEED"].includes(mp.seatType)) throw Error("Kandidat ose ulëse e dyfishuar në përbërje.");
                candidates.add(mp.candidateId);seatNumbers.add(mp.seatNumber);
            });
        });
        if (general!==100 || guaranteed!==20 || candidates.size!==120) throw Error("Ndarja e ulëseve nuk përputhet.");
    });
}
