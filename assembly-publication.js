/* Publication separates calculable simulated seats from unresolved seats and legal review. */
function assemblyGender(metadata,id) {
    var entry=metadata.genders[id];return entry && ["M","F"].includes(entry.value)?entry.value:null;
}
function selectSimulatedAssemblyDeputies(party,count,metadata,seed,report) {
    if(!count)return [];
    var missingVotes=party.candidates.filter(function(c){return c.personalVotes===null || typeof c.personalVotes==="undefined";});
    if(missingVotes.length){report.warnings.push(party.partyId+": "+count+" mandate u llogaritën nga votat e subjektit, por renditja e deputetëve mbetet e pazgjidhur; "+missingVotes.length+" kandidatë nuk kanë vota personale të regjistruara.");report.legalChecks.gender[party.partyId]="UNRESOLVED_CANDIDATES";return [];}
    var ranked=party.candidates.slice().sort(function(a,b){return priorityCandidateOrder(a,b,metadata,seed);});
    var elected=ranked.slice(0,count),working=elected.slice(),status="CHECKED";
    if(ranked.length<=2)status="EXEMPT";
    else if(elected.some(function(c){return !assemblyGender(metadata,c.id);}))status="MISSING_GENDER";
    else {
        var minimum=simulationGenderMinimum(count,metadata);
        if(minimum*2>count)status="ROUNDING_UNCONFIRMED";
        else for(var gender of ["M","F"]){
            while(working.filter(function(c){return assemblyGender(metadata,c.id)===gender;}).length<minimum){
                var replacement=null;
                for(var c of ranked){
                    if(working.includes(c))continue;
                    if(!assemblyGender(metadata,c.id)){status="MISSING_GENDER";break;}
                    if(assemblyGender(metadata,c.id)===gender){replacement=c;break;}
                }
                if(status!=="CHECKED")break;
                if(!replacement){status="QUOTA_NOT_MET";break;}
                var remove=working.slice().reverse().find(function(c){return assemblyGender(metadata,c.id)!==gender&&(metadata.listPriorityPolicy!=='TOP10_POOL30_V1'||(c.ballotPosition||c.listNumber)>10);});
                if(!remove){status='QUOTA_NOT_MET';break;}
                working.splice(working.indexOf(remove),1);working.push(replacement);
            }
            if(status!=="CHECKED")break;
        }
    }
    if(status==='CHECKED' && count===1 && metadata.genderPolicy===SIMULATED_GENDER_POLICY)status='SIMULATED_SINGLE_SEAT';
    if(status==="CHECKED")elected=working;
    report.legalChecks.gender[party.partyId]=status;
    if(status==='SIMULATED_SINGLE_SEAT')report.warnings.push(party.partyId+': rregull i simulimit për një mandat — vendi i mbetet kandidatit më të votuar; kuota për dy gjini nuk zbatohet mbi një vend të vetëm.');
    if(!["CHECKED","EXEMPT","SIMULATED_SINGLE_SEAT"].includes(status))report.warnings.push(party.partyId+": deputetët paraqiten sipas votave personale; kuota gjinore "+(status==="QUOTA_NOT_MET"?"nuk plotësohet nga të dhënat e disponueshme.":status==="ROUNDING_UNCONFIRMED"?"kërkon sqarim për këtë numër mandatesh.":"nuk mund të verifikohet pa gjininë e kandidatëve që ndikojnë në përzgjedhje."));
    if(elected.some(function(c){var g=metadata.genders[c.id];return g && g.value && !g.source;}))report.warnings.push(party.partyId+": për disa të dhëna gjinore nuk është shënuar burimi; nuk pretendohet verifikim dokumentar.");
    return elected.map(function(c){return {candidateId:c.id,name:c.name,partyId:party.partyId,listNumber:c.listNumber,personalVotes:c.personalVotes,gender:assemblyGender(metadata,c.id)};});
}

function calculateAssemblyComposition(cycle,metadata) {
    var strict=cycle?.manifest?.modelVersion===2;
    metadata=metadata || {};metadata=Object.assign({},metadata,{subjects:metadata.subjects || {},genders:metadata.genders || {}});
    var report={version:2,cycleId:cycle && cycle.id,status:"BLOCKED",legalConfirmed:false,rules:JSON.parse(JSON.stringify(ASSEMBLY_RULES)),
        errors:[],warnings:["Përbërje e simulimit, jo rezultat i certifikuar. Metoda e ndarjes dhe rregullat e paplota nuk përbëjnë verifikim ligjor përfundimtar."],
        mandates:[],deputies:[],ties:[],generalSeats:0,guaranteedSeats:0,totalSeats:0,unresolvedSeats:120,unresolvedCandidates:0,
        legalChecks:{gender:{},communities:"INCOMPLETE"},communityGuarantees:Object.assign({},ASSEMBLY_RULES.guarantees),unresolvedCommunities:[]};
    if(!cycle || cycle.status!=="RESULTS" || !cycle.results || !Array.isArray(cycle.results.parties)){report.errors.push("Përfundoni numërimin e votave para ndarjes së mandateve.");return report;}
    report.resultsSnapshot=JSON.stringify(cycle.results);report.metadata=JSON.parse(JSON.stringify(metadata));
    if(Object.values(metadata.genders).some(function(g){return g?.simulated;}))report.warnings.push('Gjinitë e shënuara si të simuluara shërbejnë vetëm për lojën dhe nuk janë të dhëna biografike të verifikuara.');
    if(strict){report.strictCounting=true;try{validateMultiPreferenceResults(cycle);}catch(error){report.errors.push(error.message);return report;}}
    var parties=cycle.results.parties,total=0,ids=new Set(),candidates=new Set(),categories={};
    parties.forEach(function(p){
        if(!p || typeof p.partyId!=="string" || ids.has(p.partyId) || !Number.isSafeInteger(p.votes) || p.votes<0 || !Array.isArray(p.candidates)){report.errors.push("Rezultati i subjektit është i dëmtuar.");return;}
        ids.add(p.partyId);total+=p.votes;
        var subject=metadata.subjects[p.partyId],category=subject && subject.community;
        // The old combined group cannot be re-labelled as one ethnic community.
        categories[p.partyId]=p.partyId!=="MIN_MULTI" && ["GENERAL"].concat(Object.keys(ASSEMBLY_RULES.guarantees)).includes(category)?category:null;
        if(!categories[p.partyId])report.warnings.push(p.partyId+": votat mbeten të regjistruara, por nuk shpërndahen në kategori komunitetesh pa rezultate të ndara dhe kategori të qartë.");
        else if(!subject.source)report.warnings.push(p.partyId+": kategoria e dhënë përdoret vetëm për simulim; burimi dokumentar nuk është shënuar.");
        var known=0,missing=false;
        p.candidates.forEach(function(c){
            if(!c || typeof c.id!=="string" || !c.id || candidates.has(c.id) || c.partyId!==p.partyId || typeof c.name!=="string" || !c.name.trim() || !Number.isInteger(c.listNumber) || c.listNumber<1){report.errors.push(p.partyId+": identitet kandidati i pavlefshëm, i dyfishuar ose jashtë subjektit.");return;}
            candidates.add(c.id);
            if(c.personalVotes===null || typeof c.personalVotes==="undefined")missing=true;
            else if(!Number.isSafeInteger(c.personalVotes) || c.personalVotes<0 || c.personalVotes>p.votes)report.errors.push(p.partyId+": vota personale të pavlefshme.");
            else known+=c.personalVotes;
        });
        if(!Number.isSafeInteger(p.unassignedPreferenceVotes) || p.unassignedPreferenceVotes<0 || p.unassignedPreferenceVotes>p.votes || !strict && (known+p.unassignedPreferenceVotes>p.votes || !missing && known+p.unassignedPreferenceVotes!==p.votes))report.errors.push(p.partyId+": preferencat personale nuk përputhen me votat e subjektit.");
    });
    if(!Number.isSafeInteger(total) || total<=0 || total!==cycle.results.validVotes)report.errors.push("Shuma e votave të vlefshme nuk përputhet.");
    if(report.errors.length)return report;
    var seats={},guaranteed={};parties.forEach(function(p){seats[p.partyId]=0;guaranteed[p.partyId]=0;});
    var eligible=parties.filter(function(p){return categories[p.partyId] && (categories[p.partyId]!=="GENERAL" || BigInt(p.votes)*100n>=BigInt(total)*5n);});
    var unknown=parties.some(function(p){return p.votes>0 && !categories[p.partyId];});
    if(unknown)report.warnings.push("Ndarja e paraqitur përdor vetëm kategoritë e njohura. Plotësimi i kategorive dhe rezultateve të ndara të komuniteteve mund ta ndryshojë ndarjen përfundimtare.");
    var rae=["ROM","ASHKALI","EGYPTIAN"].map(function(category){var members=parties.filter(function(p){return categories[p.partyId]===category;});return {category:category,present:members.length>0,votes:members.reduce(function(n,p){return n+p.votes;},0)};});
    var extraKnown=!unknown && rae.every(function(c){return c.present;});
    if(extraKnown){
        rae.sort(function(a,b){return b.votes-a.votes || assemblyDraw(cycle.seed,a.category)-assemblyDraw(cycle.seed,b.category) || a.category.localeCompare(b.category);});
        report.communityGuarantees[rae[0].category]++;
        if(rae[0].votes===rae[1].votes)report.warnings.push("Barazimi për ulësen shtesë të komuniteteve zgjidhet me shortin e qëndrueshëm të simulimit.");
    } else {report.unresolvedCommunities.push({category:"RAE_EXTRA",seats:1});report.warnings.push("1 mandat shtesë rom/ashkali/egjiptian mbetet i pazgjidhur: mungojnë rezultatet e ndara për krahasimin e komuniteteve.");}
    Object.keys(report.communityGuarantees).forEach(function(category){
        var members=eligible.filter(function(p){return categories[p.partyId]===category && p.votes>0;});
        var available=members.reduce(function(n,p){return n+p.candidates.length;},0),required=report.communityGuarantees[category],count=Math.min(required,available);
        if(count){var pool=allocateAssemblyPool(members,count,seats,cycle.seed,category,strict);seats=pool.seats;report.ties.push(...pool.ties);pool.awards.forEach(function(id){guaranteed[id]++;});}
        if(count<required){report.unresolvedCommunities.push({category:category,seats:required-count});report.warnings.push(category+": "+(required-count)+" mandate të garantuara mbeten të pazgjidhura; mungojnë rezultate të ndara ose kandidatë të regjistruar.");}
    });
    // Preserve the existing next-divisor policy; unresolved guarantees never become general seats.
    var capacity=eligible.filter(function(p){return p.votes>0;}).reduce(function(n,p){return n+Math.max(0,p.candidates.length-seats[p.partyId]);},0),generalCount=Math.min(100,capacity);
    if(generalCount){var pool=allocateAssemblyPool(eligible,generalCount,seats,cycle.seed,"GENERAL",strict);seats=pool.seats;report.ties.push(...pool.ties);}
    if(generalCount<100)report.warnings.push((100-generalCount)+" mandate të përgjithshme mbeten të pazgjidhura sepse listat e lejuara nuk kanë kandidatë të mjaftueshëm.");
    if(typeof applyDiasporaSeatBonus==='function')report.diasporaSwing=applyDiasporaSeatBonus(seats,guaranteed,cycle,parties,eligible);
    parties.forEach(function(p){
        var count=seats[p.partyId],category=categories[p.partyId];
        report.mandates.push({partyId:p.partyId,name:p.name,community:category,votes:p.votes,eligible:eligible.includes(p),general:count-guaranteed[p.partyId],guaranteed:guaranteed[p.partyId],total:count});
        var selected=selectSimulatedAssemblyDeputies(p,count,metadata,cycle.seed,report);
        selected.forEach(function(mp,i){mp.community=category;mp.seatType=i<guaranteed[p.partyId]?"GUARANTEED":"GENERAL";mp.seatNumber=report.deputies.length+1;report.deputies.push(mp);});
        report.unresolvedCandidates+=count-selected.length;
    });
    report.generalSeats=generalCount;report.guaranteedSeats=Object.values(guaranteed).reduce(function(n,v){return n+v;},0);report.totalSeats=report.generalSeats+report.guaranteedSeats;
    report.unresolvedSeats=120-report.totalSeats;
    report.legalChecks.communities=report.unresolvedCommunities.length || unknown?"INCOMPLETE":"CONFIGURED";
    report.status=report.totalSeats===120 && report.deputies.length===120?"PUBLISHED":"PARTIAL";
    if(strict){report.publicationIssues=strictAssemblyIssues(report,cycle);if(report.publicationIssues.length){report.status='PARTIAL';report.warnings.push(...report.publicationIssues);}}
    return report;
}

function validateAssemblyState(st) {
    if(typeof st.assemblyCompositions==="undefined")return;
    if(!Array.isArray(st.assemblyCompositions))throw Error("Regjistri i përbërjes së Kuvendit është i dëmtuar.");
    validateLegacyAssemblyState(Object.assign({},st,{assemblyCompositions:st.assemblyCompositions.filter(function(r){return r && r.version===1;})}));
    var ids=new Set();st.assemblyCompositions.forEach(function(r){
        if(!r || ids.has(r.cycleId))throw Error("Përbërje e dyfishuar.");ids.add(r.cycleId);if(r.version===1)return;
        var cycle=(st.parliamentaryElections || []).find(function(c){return c.id===r.cycleId;}),copy=JSON.parse(JSON.stringify(r));delete copy.integrity;
        if(cycle?.manifest.modelVersion===2 && r.strictCounting!==true)throw Error('Cikli i ri kërkon kontrollin e plotë para publikimit.');
        if(r.version!==2 || !cycle || r.resultsSnapshot!==JSON.stringify(cycle.results) || r.integrity!==electionSeed(JSON.stringify(copy)) || !["BLOCKED","PARTIAL","PUBLISHED"].includes(r.status) || r.legalConfirmed!==false || JSON.stringify(r.rules)!==JSON.stringify(ASSEMBLY_RULES) || !r.metadata || !r.legalChecks || !Array.isArray(r.errors) || !Array.isArray(r.warnings) || !Array.isArray(r.mandates) || !Array.isArray(r.deputies))throw Error("Përbërja e ruajtur është e dëmtuar ose nuk përputhet me votat.");
        if(r.status==="BLOCKED"){if(!r.errors.length || r.mandates.length || r.deputies.length)throw Error("Gjendje e pavlefshme e llogaritjes.");return;}
        if(r.errors.length || r.mandates.length!==cycle.results.parties.length)throw Error("Mandate të paplota ose të pavlefshme.");
        var subjects=new Set(),people=new Set(),seatNumbers=new Set(),general=0,guaranteed=0,unresolved=0;
        r.mandates.forEach(function(p){
            var original=cycle.results.parties.find(function(o){return o.partyId===p.partyId;}),deputies=r.deputies.filter(function(mp){return mp.partyId===p.partyId;});
            if(!original || subjects.has(p.partyId) || p.votes!==original.votes || !Number.isInteger(p.general) || p.general<0 || !Number.isInteger(p.guaranteed) || p.guaranteed<0 || p.total!==p.general+p.guaranteed || p.total>original.candidates.length || deputies.length>p.total || deputies.length!==0 && deputies.length!==p.total)throw Error("Ndarja e mandateve të subjektit është e pavlefshme.");
            if(p.community==="GENERAL" && (p.guaranteed || p.total && BigInt(p.votes)*100n<BigInt(cycle.results.validVotes)*5n) || !p.community && p.total)throw Error("Mandate jashtë pragut ose kategorisë së lejuar.");
            subjects.add(p.partyId);general+=p.general;guaranteed+=p.guaranteed;unresolved+=p.total-deputies.length;
            if(deputies.length && deputies.filter(function(mp){return mp.seatType==="GUARANTEED";}).length!==p.guaranteed)throw Error("Ulëset e garantuara nuk përputhen.");
            deputies.forEach(function(mp){
                var c=original.candidates.find(function(c){return c.id===mp.candidateId;});
                if(!c || c.name!==mp.name || c.personalVotes!==mp.personalVotes || !Number.isSafeInteger(mp.personalVotes) || c.listNumber!==mp.listNumber || people.has(mp.candidateId) || seatNumbers.has(mp.seatNumber) || !Number.isInteger(mp.seatNumber) || mp.seatNumber<1 || mp.seatNumber>120 || mp.community!==p.community || !["GENERAL","GUARANTEED"].includes(mp.seatType) || ![null,"M","F"].includes(mp.gender))throw Error("Deputet ose ulëse e pavlefshme apo e dyfishuar.");
                people.add(mp.candidateId);seatNumbers.add(mp.seatNumber);
            });
        });
        if(!r.communityGuarantees || !Array.isArray(r.unresolvedCommunities) || r.unresolvedCommunities.some(function(item){return !Number.isInteger(item.seats) || item.seats<0;}) || r.unresolvedCommunities.reduce(function(n,item){return n+item.seats;},0)!==20-guaranteed)throw Error("Garancitë e pazgjidhura nuk përputhen me ulëset e komuniteteve.");
        Object.keys(ASSEMBLY_RULES.guarantees).forEach(function(category){
            var maximum=r.communityGuarantees[category],minimum=ASSEMBLY_RULES.guarantees[category],extra=["ROM","ASHKALI","EGYPTIAN"].includes(category)?1:0;
            if(!Number.isInteger(maximum) || maximum<minimum || maximum>minimum+extra || r.mandates.filter(function(p){return p.community===category;}).reduce(function(n,p){return n+p.guaranteed;},0)>maximum)throw Error("Ulëse të garantuara mbi kufirin e kategorisë.");
        });
        var complete=r.totalSeats===120 && r.deputies.length===120;
        if(r.strictCounting){var issues=strictAssemblyIssues(r,cycle);complete=complete && !issues.length;if(r.status==='PUBLISHED' && issues.length)throw Error('Rezultati përfundimtar nuk kalon auditimin zgjedhor.');}
        if(general>100 || guaranteed>20 || general!==r.generalSeats || guaranteed!==r.guaranteedSeats || r.totalSeats!==general+guaranteed || r.unresolvedSeats!==120-r.totalSeats || r.unresolvedCandidates!==unresolved || r.deputies.length+unresolved!==r.totalSeats || (r.status==="PUBLISHED")!==complete)throw Error("Shuma e mandateve të llogaritura dhe të pazgjidhura nuk përputhet.");
    });
}

const ASSEMBLY_CATEGORY_LABELS=Object.freeze({GENERAL:"Ulëset e përgjithshme",SERB:"Komuniteti serb",BOSNIAK:"Komuniteti boshnjak",TURK:"Komuniteti turk",GORAN:"Komuniteti goran",ROM:"Komuniteti rom",ASHKALI:"Komuniteti ashkali",EGYPTIAN:"Komuniteti egjiptian"});
function storeAssemblyReport(cycle,metadata,options) {
    try{validateElectionDayState(state);}catch(error){showToast("Përbërja nuk u ruajt: "+error.message);return false;}
    var beforeState=JSON.stringify(state);
    var previousMetadata=cycle.assemblyMetadata,hadMetadata=Object.hasOwn(cycle,'assemblyMetadata');
    if(cycle.manifest.modelVersion===2){metadata=completeSimulationGenders(cycle.results.parties,metadata);cycle.assemblyMetadata=metadata;}
    function restoreMetadata(){if(hadMetadata)cycle.assemblyMetadata=previousMetadata;else delete cycle.assemblyMetadata;}
    var report=calculateAssemblyComposition(cycle,metadata),old=state.assemblyCompositions.slice();
    report.integrity=electionSeed(JSON.stringify(report));
    state.assemblyCompositions=old.filter(function(r){return r.cycleId!==cycle.id;}).concat([report]);
    try{validateAssemblyState(state);}catch(error){state.assemblyCompositions=old;restoreMetadata();showToast("Përbërja nuk u ruajt: "+error.message);return false;}
    reconcilePostElection(state);
    if(!options?.deferCommit&&!saveGameAuto()){state=JSON.parse(beforeState);return false;}
    return report;
}
function publishAssemblyComposition() {
    var cycle=getElectionDayCycle(state);
    if(!cycle || cycle.status!=="RESULTS"){showToast("Përfundoni fillimisht numërimin e zgjedhjeve.");return false;}
    try{validateElectionDayState(state);}catch(error){showToast("Mandatet nuk u llogaritën: "+error.message);return false;}
    migrateAssemblyState(state);var previous=getAssemblyComposition(),metadata=assemblyMetadata(state,cycle);
    if(cycle.manifest.modelVersion===2)metadata=completeSimulationGenders(cycle.results.parties,metadata);
    if(previous && previous.status==="PUBLISHED" || previous && previous.version===2 && previous.status==="PARTIAL" && JSON.stringify(previous.metadata)===JSON.stringify(metadata)){showToast("Mandatet e llogaritshme të këtij cikli janë ruajtur tashmë.");return false;}
    if((state.constituentSessions || []).some(function(s){return s.cycleId===cycle.id;})){showToast("Përbërja nuk ndryshohet pasi ka filluar seanca konstituive.");return false;}
    var report=storeAssemblyReport(cycle,metadata);if(!report)return false;
    renderAssemblyComposition();showToast(report.status==="BLOCKED"?"Llogaritja u ndal për shkak të të dhënave të pavlefshme të votimit.":"U ruajtën "+report.totalSeats+" mandate të llogaritura; "+report.unresolvedSeats+" ulëse mbeten të pazgjidhura.");
    return report.strictCounting?report.status==='PUBLISHED':report.status!=="BLOCKED";
}
function saveAssemblyConfiguration() {
    var cycle=getElectionDayCycle(state);if(!cycle || cycle.status!=="RESULTS")return false;
    var published=getAssemblyComposition();if(published?.strictCounting && published.status==='PUBLISHED'){showToast('Përbërja përfundimtare e këtij cikli është mbyllur dhe nuk ndryshohet.');return false;}
    if((state.constituentSessions || []).some(function(s){return s.cycleId===cycle.id;})){showToast("Përbërja nuk ndryshohet pasi ka filluar seanca konstituive.");return false;}
    var previous=JSON.stringify(state),metadata=assemblyMetadata(state,cycle);
    cycle.results.parties.forEach(function(p,i){
        if(p.partyId==="MIN_MULTI")return;
        var category=document.getElementById("assemblyCategory"+i),source=document.getElementById("assemblyCategorySource"+i);
        if(category)metadata.subjects[p.partyId]=category.value?{community:category.value,source:source.value.trim()}:null;
    });
    var select=document.getElementById("assemblyGenderCandidate"),gender=document.getElementById("assemblyGenderValue"),source=document.getElementById("assemblyGenderSource");
    if(select && select.value && gender && gender.value){
        if(!cycle.results.parties.some(function(p){return p.candidates.some(function(c){return c.id===select.value;});}) || !["M","F"].includes(gender.value)){showToast("Zgjidhni një kandidat dhe një vlerë të vlefshme për gjininë.");return false;}
        metadata.genders[select.value]={value:gender.value,source:source.value.trim()};
    }
    cycle.assemblyMetadata=metadata;
    var report=storeAssemblyReport(cycle,metadata);
    if(!report){state=JSON.parse(previous);return false;}
    renderAssemblyComposition();showToast("U ruajtën të dhënat plotësuese dhe u përditësua llogaritja pa ndryshuar votat.");return true;
}
function renderAssemblyConfiguration(cycle,record) {
    var esc=electoralEscape,metadata=assemblyMetadata(state,cycle),locked=(state.constituentSessions || []).some(function(s){return s.cycleId===cycle.id;});
    if(locked)return '<p>Të dhënat e kësaj përbërjeje janë të mbyllura pasi ka filluar seanca konstituive.</p>';
    return '<details id="assemblyConfiguration"><summary>Plotëso të dhënat për verifikim</summary><p>Plotësoni vetëm të dhëna që i njihni dhe shënoni burimin. Këtu nuk ndryshohen votat dhe nuk krijohen kandidatë.</p>'+cycle.results.parties.map(function(p,i){
        if(p.partyId==="MIN_MULTI")return '<p>Grupi multietnik ka vota të bashkuara. Për ndarjen e garancive kërkohen rezultate të veçanta për subjektet dhe komunitetet; ky grup nuk mund të riemërtohet si një komunitet i vetëm.</p>';
        var entry=metadata.subjects[p.partyId] || {};
        return '<div class="assembly-config-row"><label>'+esc(p.name)+'<select id="assemblyCategory'+i+'"><option value="">Kategori e papërcaktuar</option>'+Object.keys(ASSEMBLY_CATEGORY_LABELS).map(function(key){return '<option value="'+key+'" '+(entry.community===key?'selected':'')+'>'+ASSEMBLY_CATEGORY_LABELS[key]+'</option>';}).join('')+'</select></label><label>Burimi i kategorisë<input id="assemblyCategorySource'+i+'" value="'+esc(entry.source || '')+'"></label></div>';
    }).join('')+'<label>Kandidati për të cilin po plotësoni gjininë<select id="assemblyGenderCandidate"><option value="">Zgjidhni kandidatin</option>'+cycle.results.parties.map(function(p){return '<optgroup label="'+esc(p.name)+'">'+p.candidates.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(candidateDisplayName(c,p.partyId))+'</option>';}).join('')+'</optgroup>';}).join('')+'</select></label><label>Gjinia e dhënë<select id="assemblyGenderValue"><option value="">Pa plotësim</option><option value="M">Mashkull</option><option value="F">Femër</option></select></label><label>Burimi i të dhënës gjinore<input id="assemblyGenderSource" placeholder="Dokumenti ose burimi që e mbështet këtë të dhënë"></label><button id="saveAssemblyConfigurationBtn" class="action-btn" onclick="saveAssemblyConfiguration()">Ruaj të dhënat dhe përditëso mandatet</button></details>';
}
function renderAssemblyComposition() {
    var host=document.getElementById("assemblyCompositionPanel");if(!host)return;
    var cycle=getElectionDayCycle(state),r=getAssemblyComposition(),esc=electoralEscape,ready=cycle && cycle.status==="RESULTS";
    var html='<div class="card"><h3>Përbërja e Kuvendit</h3><p>Kuvendi ka 120 ulëse: 100 të përgjithshme dhe 20 të garantuara për komunitetet. Shumica parlamentare kërkon 61 deputetë.</p><p>Rezultat i simulimit — nuk është i certifikuar ose plotësisht i verifikuar ligjërisht.</p>';
    if(!ready)html+='<p>Përfundoni numërimin e votave për të hapur përbërjen e re.</p>';
    else html+='<p>'+esc(campaignCalendarLabel(cycle.manifest.date))+'</p><button id="allocateAssemblyBtn" class="action-btn btn-gold" onclick="publishAssemblyComposition()" '+(r && r.status!=="BLOCKED"?'disabled':'')+'>'+(r && r.status!=="BLOCKED"?'Mandatet e llogaritshme janë ruajtur':'Shfaq mandatet e llogaritshme')+'</button>';
    html+='</div>';
    if(r){
        if(r.strictCounting && r.status!=='PUBLISHED')html+='<p role="alert">Rezultati nuk është përfundimtar: publikimi dhe konstituimi janë bllokuar derisa të plotësohen të gjitha kontrollet.</p>';
        var unresolved=typeof r.unresolvedSeats==="number"?r.unresolvedSeats:120-r.totalSeats;
        html+='<div class="card"><h3>'+(r.status==="BLOCKED"?'Llogaritja kërkon korrigjim të votimit':'Mandatet e llogaritura: '+r.totalSeats+' / 120')+'</h3><p>'+r.generalSeats+' të përgjithshme · '+r.guaranteedSeats+' të garantuara · <strong>'+unresolved+' ulëse të pazgjidhura</strong></p>';
        if(r.unresolvedCandidates)html+='<p>'+r.unresolvedCandidates+' nga mandatet e llogaritura ende nuk kanë deputet të përcaktuar për shkak të votave personale të paplota.</p>';
        html+='<div class="assembly-allocation-chart" aria-label="Ndarja e ulëseve">'+r.mandates.map(function(p){return '<div data-allocation-party="'+esc(p.partyId)+'"><strong>'+esc(p.name)+' — '+p.total+' mandate</strong><meter min="0" max="120" value="'+p.total+'">'+p.total+'</meter><small>'+p.general+' të përgjithshme · '+p.guaranteed+' të garantuara'+(!p.community?' · Kategoria ende e papërcaktuar':'')+'</small></div>';}).join('')+'</div>';
        html+=r.mandates.filter(function(p){return p.total;}).map(function(p){var deputies=r.deputies.filter(function(mp){return mp.partyId===p.partyId;});return '<details class="assembly-deputies"><summary>'+esc(p.name)+' — '+p.total+' mandate, '+deputies.length+' deputetë të përcaktuar</summary><ol>'+deputies.map(function(mp){return '<li data-elected-party="'+esc(mp.partyId)+'">'+esc(candidateDisplayName(mp,p.partyId))+' · #'+mp.listNumber+' · '+mp.personalVotes+' vota personale · '+esc(p.partyId)+' · '+candidateGenderLabel(r.metadata,mp.candidateId,mp.gender)+'</li>';}).join('')+'</ol>'+(deputies.length<p.total?'<p>Emrat për mandatet e mbetura kërkojnë plotësimin e votave personale. Lista ekzistuese nuk është ndryshuar.</p>':'')+'</details>';}).join('');
        html+='</div>';
        if(r.errors.length || r.warnings.length)html+='<div class="card"><h3>Të dhënat që kërkojnë plotësim</h3><ul>'+r.errors.concat(r.warnings).map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul></div>';
        if(ready)html+='<div class="card">'+renderAssemblyConfiguration(cycle,r)+'</div>';
        if(r.status==="PUBLISHED")html+='<button id="openConstituentBtn" class="action-btn btn-gold" onclick="openConstituentSessionPanel()">Hap seancën konstituive të Kuvendit</button>';
        else html+='<p>Seanca konstituive kërkon përfundimin e të 120 mandateve dhe përcaktimin e deputetëve përkatës.</p>';
    }
    host.innerHTML=html;
}
