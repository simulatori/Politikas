/* Historical archive. Unknown votes/mandates remain null; party means party at that election. */
const CANDIDATE_SOURCES = Object.freeze({
    [CANDIDATE_BROCHURE_SOURCE.id]: {title:CANDIDATE_BROCHURE_SOURCE.title,url:CANDIDATE_BROCHURE_SOURCE.file,access:"Dokumenti PDF i dhënë nga përdoruesi u lexua lokalisht; nuk përmban vota personale, mandate ose gjini."},
    results2025: { title: "KQZ — Rezultatet e kandidatëve, Kuvendi 2025", url: "https://kqz-ks.org/wp-content/uploads/2025/03/3.Rezultatet-e-te-gjithe-kandidateve-renditja-si-ne-fletevotim.pdf", access: "Të dhëna të lexuara nga indeksi i dokumentit zyrtar; shkarkimi i plotë nuk u realizua." },
    results2014: { title: "KQZ — Rezultatet e kandidatëve, Kuvendi 2014", url: "https://kqz-ks.org/wp-content/uploads/2018/04/3.-Rezultatet-e-t%C3%AB-gjith%C3%AB-kandidat%C3%ABve-2014.pdf", access: "Të dhëna të lexuara nga indeksi i dokumentit zyrtar." },
    brochure2025: { title: "KQZ — Broshura e kandidatëve, shkurt 2025", url: "https://kqz-ks.org/wp-content/uploads/2025/01/143_Broshura_permbajtja_finale-1.pdf", access: "Emrat dhe lista historike nga indeksi zyrtar; votat dhe gjinia nuk u importuan." }
});

const ELECTORAL_LIST_RULES = Object.freeze({
    id: "preparation-v1", technicalMinimum: 1,
    requiredCount: null, maximumCount: null, genderQuota: null, genderOrder: null,
    legalConfirmed: false,
    allowedProfiles: "PLAYER_PARTY_ROSTER",
    explanation: "Kontroll teknik i simulimit. Numri ligjor i kandidatëve, kuota gjinore, renditja sipas gjinisë dhe kushtet individuale për ciklin aktual nuk janë konfirmuar. Kjo nuk është certifikim nga KQZ-ja."
});

function historicalEntry(year, party, source, gender, personalVotes) {
    return { electionId: year === 2025 ? "assembly-2025-02-09" : "assembly-2014", year: year,
        electionType: "Kuvend", historicalParty: party, candidacyStatus: "Kandidaturë historike e dokumentuar",
        gender: null, genderStatus:'UNCONFIRMED', personalVotes: personalVotes, mandateStatus: null, sourceId: source };
}

const CANDIDATE_ARCHIVE = [
    { id: "person-albin-kurti", firstName: "Albin", lastName: "Kurti", history: [historicalEntry(2025,"LVV","results2025","M",337791), historicalEntry(2014,"LVV","results2014","M",63602)] },
    { id: "person-glauk-konjufca", firstName: "Glauk", lastName: "Konjufca", history: [historicalEntry(2025,"LVV","results2025","M",264407), historicalEntry(2014,"LVV","results2014","M",16464)] },
    { id: "person-albulena-haxhiu", firstName: "Albulena", lastName: "Haxhiu", history: [historicalEntry(2025,"LVV","results2025","F",125722), historicalEntry(2014,"LVV","results2014","F",7975)] },
    { id: "person-bedri-hamza", firstName: "Bedri", lastName: "Hamza", history: [historicalEntry(2025,"PDK","results2025","M",173526)] },
    { id: "person-memli-krasniqi", firstName: "Memli", lastName: "Krasniqi", history: [historicalEntry(2025,"PDK","results2025","M",98415)] },
    { id: "person-vlora-citaku", firstName: "Vlora", lastName: "Çitaku", history: [historicalEntry(2025,"PDK","results2025","F",41929)] },
    { id: "person-lumir-abdixhiku", firstName: "Lumir", lastName: "Abdixhiku", history: [historicalEntry(2025,"LDK","brochure2025",null,null)] },
    { id: "person-kujtim-shala", firstName: "Kujtim", lastName: "Shala", history: [historicalEntry(2025,"LDK","brochure2025",null,null)] },
    { id: "person-hykmete-bajrami", firstName: "Hykmete", lastName: "Bajrami", history: [historicalEntry(2025,"LDK","brochure2025",null,null)] }
];
let electoralPanelPartyId = null;
var candidateListPages={key:'',selected:0,available:0};
function setCandidateListPage(kind,page){
    if(!['selected','available'].includes(kind) || !Number.isInteger(Number(page)))return;
    candidateListPages[kind]=Math.max(0,Number(page));renderElectoralList();
}
function candidatePageRows(rows,kind,hostId){
    var size=20,total=Math.max(1,Math.ceil(rows.length/size));
    candidateListPages[kind]=Math.min(candidateListPages[kind],total-1);
    var page=candidateListPages[kind],host=document.getElementById(hostId);
    if(host)host.innerHTML='<span>'+rows.length+' kandidatë · '+(rows.length?'Shfaqen '+(page*size+1)+'–'+Math.min(rows.length,(page+1)*size):'Asnjë hyrje')+'</span>'+(total>1?'<button class="btn-top" onclick="setCandidateListPage(\''+kind+'\','+(page-1)+')" '+(!page?'disabled':'')+'>Para</button><label>Faqja<select aria-label="Faqja e '+(kind==='selected'?'listës së përzgjedhur':'kandidatëve të disponueshëm')+'" onchange="setCandidateListPage(\''+kind+'\',Number(this.value))">'+Array.from({length:total},function(_,i){return '<option value="'+i+'" '+(i===page?'selected':'')+'>'+(i+1)+' / '+total+'</option>';}).join('')+'</select></label><button class="btn-top" onclick="setCandidateListPage(\''+kind+'\','+(page+1)+')" '+(page===total-1?'disabled':'')+'>Tjetër</button>':'');
    return rows.slice(page*size,(page+1)*size);
}

function candidateSearchText(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sq-AL").trim();
}

function candidateName(candidate) { return candidate.name || candidate.firstName + " " + candidate.lastName; }

// Identity matching retains accents and punctuation; it never guesses similar people.
function candidateIdentityKey(name) {return String(name || '').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleUpperCase('sq-AL');}
function candidateOriginalRow(record,partyId) {
    if(!record || record.source==='MANUAL_SIMULATED')return null;
    var subject=BROCHURE_SUBJECTS[partyId];if(!subject)return null;
    if(record.brochureId)return subject.candidates.find(function(c){return c.id===record.brochureId;}) || null;
    var provided=PROVIDED_CANDIDATE_LISTS[partyId]?.find(function(c){return c.id===record.providedId;});
    return provided?subject.candidates.find(function(c){return c.listNumber===provided.listNumber;}):null;
}
function canonicalCandidateRecord(st,record,partyId) {
    partyId=partyId || record.partyId || record.party;
    if(partyId==='MIN_MULTI'){
        var tag=String(record.name || '').match(/\(([^()]+)\)$/)?.[1]?.toUpperCase();
        if(BROCHURE_SUBJECTS[tag])partyId=tag;
    }
    var rows=st?.candidateRegistry?.[partyId] || [],id=record.candidateId || record.id;
    var found=rows.find(function(c){return c.id===id;});if(found)return found;
    // Legacy party labels in parentheses are metadata, not part of the person's name.
    var key=candidateIdentityKey(String(record.name || '').replace(/\s+\([^()]+\)$/,''));
    var matches=rows.filter(function(c){return c.source!=='MANUAL_SIMULATED' && candidateIdentityKey(c.name)===key;});
    return matches.length===1?matches[0]:null;
}
function candidateDisplayName(record,partyId,st) {
    st=st || state;var canonical=canonicalCandidateRecord(st,record,partyId);
    return String(canonical?.name || record.name || 'Emër i pakonfirmuar').replace(/\s*\(i\s+pa\s*konfirmuar në broshurë\)/gi,'').trim();
}
function candidateGenderLabel(metadata,id,value) {
    var g=metadata?.genders?.[id];
    return g && !g.simulated && g.source?.trim() && ['M','F'].includes(value) ? (value==='F'?'Femër (burim i deklaruar)':'Mashkull (burim i deklaruar)') : 'Gjini e pakonfirmuar';
}
function migrateCandidateOriginals(st) {
    Object.entries(st.candidateRegistry || {}).forEach(function(pair){pair[1].forEach(function(r){
        var original=candidateOriginalRow(r,pair[0]);
        if(original){
            if(r.name!==original.name && !Object.hasOwn(r,'nameBeforeOriginalRestore'))r.nameBeforeOriginalRestore=r.name;
            r.name=original.name;r.brochureId=original.id;r.sourceId=CANDIDATE_BROCHURE_SOURCE.id;r.sourcePage=original.page;
            r.originalListNumber=original.listNumber;
        }
        if(r.gender && !Object.hasOwn(r,'unconfirmedPreviousGender'))r.unconfirmedPreviousGender=r.gender;
        // The brochure provides no gender evidence. A separate sourced declaration stays separate.
        r.gender=null;r.genderStatus='UNCONFIRMED';
    });});
}
function migrateCandidateGenderEvidence(st) {
    function unconfirm(record){
        if(record.gender && !Object.hasOwn(record,'unconfirmedPreviousGender'))record.unconfirmedPreviousGender=record.gender;
        record.gender=null;record.genderStatus='UNCONFIRMED';
    }
    Object.values(st.parties || {}).forEach(function(p){(p.candidates || []).concat(p.reserves || []).forEach(unconfirm);});
    (st.mps || []).forEach(function(mp){
        var cycle=(st.parliamentaryElections || []).find(function(c){return c.id===st.assemblyCycleId;});
        var g=cycle?.assemblyMetadata?.genders?.[mp.candidateId];
        if(!g || g.simulated || !g.source?.trim()){
            // Old scenario rosters are sealed together with their original gender fields.
            // Preserve that historical payload; the evidence status remains unconfirmed.
            if(st.initialConstituentContext){mp.genderStatus='UNCONFIRMED';}
            else unconfirm(mp);
        }
        else {mp.gender=g.value;mp.genderStatus='SOURCE_DECLARED';}
    });
    (st.deputyMandates?.legislatures || []).filter(function(l){return l.id===deputyCycleId(st);}).forEach(function(l){
        l.members.forEach(function(m){var mp=(st.mps || []).find(function(p){return p.seatNumber===m.seatNumber && p.name===m.name;});if(mp && m.status==='ACTIVE'){m.gender=mp.gender;m.genderStatus=mp.genderStatus;}});
        sealDeputyLedger(l);
    });
}
function candidateIntegrityReport(st) {
    var report={checked:0,restored:0,unknownGender:0,issues:[]},ids=new Set(),names=new Map();
    Object.entries(st.candidateRegistry || {}).forEach(function(pair){pair[1].forEach(function(r){
        report.checked++;if(r.nameBeforeOriginalRestore)report.restored++;
        if(!r.name?.trim())report.issues.push('Kandidat pa emër: '+r.id);
        if(!r.id || ids.has(r.id))report.issues.push('Identifikues i munguar ose i përsëritur: '+r.id);ids.add(r.id);
        if(!r.partyId || r.partyId!==pair[0])report.issues.push('Subjekt i pasaktë: '+r.id);
        var key=candidateIdentityKey(r.name),previous=names.get(key);
        if(previous)report.issues.push('Emër i përsëritur; kërkon kontroll identiteti: '+r.name+' ('+previous+', '+r.id+')');else names.set(key,r.id);
        if(r.genderStatus!=='VERIFIED' || !r.genderSource)report.unknownGender++;
        if(r.source==='MANUAL_SIMULATED')report.issues.push('Kandidat manual i simuluar, jashtë broshurës: '+r.name);
        else if(!candidateOriginalRow(r,pair[0]))report.issues.push('Pa lidhje të konfirmuar me broshurën: '+r.id);
    });});
    var mpNames=new Set();
    (st.mps || []).forEach(function(mp){var c=canonicalCandidateRecord(st,mp),key=mp.party+':'+candidateIdentityKey(mp.name);
        if(mpNames.has(key))report.issues.push('Deputet i përsëritur në përbërjen ekzistuese: '+mp.name+' · '+mp.party);mpNames.add(key);
        if(!c)report.issues.push('Deputet pa përputhje të sigurt me listën burimore: '+mp.name+' · '+mp.party);
        else if(candidateIdentityKey(mp.name)!==candidateIdentityKey(c.name))report.issues.push('Emër historik i ndryshëm në Kuvend: '+mp.name+' → '+c.name);
    });
    (st.parliamentaryElections || []).forEach(function(cycle){(cycle.results?.parties || []).forEach(function(p){p.candidates.forEach(function(c){
        var row=canonicalCandidateRecord(st,c,p.partyId);
        if(!row)report.issues.push('Rezultat pa kandidat në regjistrin aktual: '+c.id);
        else if(c.name!==row.name)report.issues.push('Emër i vjetër në rezultatin e ngrirë: '+c.name+' → '+row.name+' · '+cycle.id);
    });});});
    return report;
}
function renderCandidateIntegrity() {
    var host=document.getElementById('candidateIntegrityReport');if(!host)return;
    var r=candidateIntegrityReport(state),e=electoralEscape;
    host.innerHTML='<details><summary>Integriteti i kandidatëve · '+r.checked+' kandidatura të kontrolluara</summary><p>Burimi: broshura origjinale e KQZ-së, 2025. Gjini të pakonfirmuara: '+r.unknownGender+'. Broshura nuk përmban gjini; ato nuk nxirren nga emri. Emrat në pamjet aktuale lexohen nga regjistri; votat dhe dokumentet e ngrira historike ruhen.</p><p>'+r.issues.length+' çështje për kontroll.</p><ul>'+r.issues.map(function(s){return '<li>'+e(s)+'</li>';}).join('')+'</ul></details>';
}

function candidateBelongsToParty(candidate, partyId) {
    return !!candidate && !candidate.archived && !candidate.dataIncomplete && (candidate.partyId ? candidate.partyId === partyId : Array.isArray(candidate.gamePartyIds) && candidate.gamePartyIds.includes(partyId));
}

function correctElectoralListParty() {
    var list = getCurrentElectoralList(), catalogue = getCandidateCatalogue(state);
    if (!list || list.status !== "SUBMITTED" || !list.candidateIds.some(function(id) {
        return !candidateBelongsToParty(catalogue.find(function(person) { return person.id === id; }), list.partyId);
    })) return false;
    var before = JSON.parse(JSON.stringify(list));
    if (!list.partyCorrectionHistory) list.partyCorrectionHistory = [];
    list.partyCorrectionHistory.push({ candidateIds: list.candidateIds.slice(), submittedAt: list.submittedAt });
    list.status = "DRAFT"; list.submittedAt = null; list.savedAt = null;
    if (!saveGameAuto()) { Object.keys(list).forEach(function(key) { delete list[key]; }); Object.assign(list,before); return false; }
    renderElectoralList(); showToast("Lista u hap për korrigjim. Hiqni kandidatët që nuk i përkasin partisë suaj dhe dorëzojeni sërish.");
    return true;
}

function getLegacyCandidateCatalogue(gameState) {
    var catalogue = CANDIDATE_ARCHIVE.map(function(person) {
        return { id: person.id, firstName: person.firstName, lastName: person.lastName,
            history: person.history, kind: "HISTORICAL", gamePartyIds: [] };
    });
    Object.keys(gameState.parties).forEach(function(partyId) {
        var party = gameState.parties[partyId];
        (party.candidates || []).concat(party.reserves || []).forEach(function(profile, index) {
            if (!profile || typeof profile.name !== "string") return;
            var known = catalogue.find(function(person) {
                return profile.simulated !== true && person.kind === "HISTORICAL" && candidateSearchText(candidateName(person)) === candidateSearchText(profile.name);
            });
            if (known) {
                if (!known.gamePartyIds.includes(partyId)) known.gamePartyIds.push(partyId);
                return;
            }
            var id = "legacy:" + partyId + ":" + (profile.id || index);
            if (catalogue.some(function(person) { return person.id === id; })) return;
            var words = profile.name.trim().split(/\s+/);
            catalogue.push({ id: id, firstName: words.shift() || "", lastName: words.join(" "), history: [],
                kind: profile.simulated === true ? "SIMULATED" : "LEGACY", gamePartyIds: [partyId] });
        });
    });
    return catalogue;
}

function createNismaListParty() {
    // A zero-seat technical adapter, not an imported election result or a political forecast.
    return { id:"NISMA",name:"NISMA Socialdemokrate",short:"NISMA",leader:"I papërcaktuar në këtë fazë",listManagementBaseline:true,
        deputyLeaders:[],orgSecretary:"E papërcaktuar",color:"#c2410c",tagClass:"tag-aak",seats:0,poll:0,
        community:"GENERAL",ideology:"E papërcaktuar në këtë fazë",euStance:0,usStance:0,
        dialogueStance:"E papërcaktuar në këtë fazë",partyDiscipline:0,internalCohesion:0,partyFunds:0,
        relations:{},candidates:[{id:"nisma-list-leader",name:PROVIDED_CANDIDATE_LISTS.NISMA[0].name,
            gender:null,region:"E papërcaktuar",pop:0,loyalty:0,role:"Profil teknik i listës"}],reserves:[] };
}

function migrateCandidateRegistry(gameState) {
    if (typeof gameState.candidateRegistry !== "undefined") {migrateBrochureRegistry(gameState);migrateCandidateOriginals(gameState);return;}
    var legacy = getLegacyCandidateCatalogue(gameState), used = new Set(), registry = {};
    Object.keys(PROVIDED_CANDIDATE_LISTS).forEach(function(partyId) {
        registry[partyId] = PROVIDED_CANDIDATE_LISTS[partyId].map(function(source) {
            var previous = legacy.find(function(person) {
                return person.kind !== "SIMULATED" && person.gamePartyIds.includes(partyId) &&
                    candidateSearchText(candidateName(person)) === candidateSearchText(source.name) && !used.has(person.id);
            });
            var record = {id:previous ? previous.id : source.id,name:source.name,partyId:partyId,
                listNumber:source.listNumber,source:"USER_PROVIDED",providedId:source.id};
            used.add(record.id); return record;
        });
    });
    gameState.candidateRegistry = registry;
    gameState.candidateRegistryVersion = 1;
    if (typeof gameState.manualCandidateCounter === "undefined") gameState.manualCandidateCounter = 0;
    migrateBrochureRegistry(gameState);
    migrateCandidateOriginals(gameState);
}

function validateCandidateRegistry(gameState) {
    validateBrochureImports(gameState);
    if (typeof gameState.candidateRegistry === "undefined") return;
    var registry=gameState.candidateRegistry,ids=new Set();
    if (!registry || typeof registry!=="object" || Array.isArray(registry) || gameState.candidateRegistryVersion!==1 ||
        !Number.isInteger(gameState.manualCandidateCounter) || gameState.manualCandidateCounter<0) throw Error("Regjistri i kandidatëve është i pavlefshëm");
    if(Object.keys(registry).some(function(partyId){return !Object.hasOwn(PROVIDED_CANDIDATE_LISTS,partyId) && !Object.hasOwn(BROCHURE_SUBJECTS,partyId);})){throw Error("Parti e panjohur në regjistrin e kandidatëve");}
    Object.keys(PROVIDED_CANDIDATE_LISTS).forEach(function(partyId){if (!Array.isArray(registry[partyId])) throw Error("Mungon lista e kandidatëve për "+partyId);});
    Object.keys(registry).forEach(function(partyId) {
        if (!Array.isArray(registry[partyId])) throw Error("Mungon lista e kandidatëve për "+partyId);
        var numbers=new Set();
        registry[partyId].forEach(function(candidate) {
            if (!candidate || (candidate.id && (typeof candidate.id!=="string" || ids.has(candidate.id))) ||
                (candidate.name!=null && typeof candidate.name!=="string") || (candidate.partyId && candidate.partyId!==partyId) ||
                (!(Number.isInteger(candidate.listNumber) && candidate.listNumber>=1) && !(BROCHURE_SUBJECTS[partyId] && BROCHURE_SUBJECTS[partyId].independent && candidate.source==="KQZ_BROCHURE" && candidate.listNumber===null)) || numbers.has(candidate.listNumber)) throw Error("Kandidat i pavlefshëm ose i dyfishuar në "+partyId);
            ids.add(candidate.id);numbers.add(candidate.listNumber);
        });
    });
}

function getCandidateCatalogue(gameState) {
    if (!gameState.candidateRegistry) return getLegacyCandidateCatalogue(gameState);
    var catalogue=[];
    Object.keys(gameState.candidateRegistry).forEach(function(partyId) {
        gameState.candidateRegistry[partyId].forEach(function(record) {
            var words=String(record.name || '').split(/\s+/), historical=CANDIDATE_ARCHIVE.find(function(person) {
                return record.source!=="MANUAL_SIMULATED" && candidateSearchText(candidateName(person))===candidateSearchText(record.name);
            });
            catalogue.push(Object.assign({},record,{firstName:words.shift(),lastName:words.join(" "),
                history:record.source==="KQZ_BROCHURE"?brochureCandidateHistory(record):historical?historical.history:[],gamePartyIds:[partyId],
                dataIncomplete:!record.id || !record.name?.trim() || !record.partyId,
                kind:record.source==="MANUAL_SIMULATED"?"SIMULATED":historical?"HISTORICAL":"PROVIDED"}));
        });
    });
    // Retain references from earlier saves, but never offer obsolete profiles as imported candidates.
    getLegacyCandidateCatalogue(gameState).forEach(function(person) {
        if (!catalogue.some(function(candidate){return candidate.id===person.id;})) {
            catalogue.push(Object.assign({},person,{archived:gameState.candidateRegistry[person.gamePartyIds[0]]?true:false}));
        }
    });
    return catalogue;
}

function addManualElectoralCandidate(name) {
    var list=getCurrentElectoralList(), partyId=state.playerParty;
    if (!list || list.status!=="DRAFT" || !state.candidateRegistry[partyId]) {showToast("Shtimi manual lejohet vetëm në draftin e partisë suaj.");return false;}
    if(!electoralListEditable(state,list))return false;
    name=String(name||"").trim();
    if(name.length>160 || name.split(/\s+/).length<2){showToast("Shkruani emrin dhe mbiemrin e plotë, deri në 160 shkronja.");return false;}
    var records=state.candidateRegistry[partyId];
    if(records.some(function(record){return candidateSearchText(record.name)===candidateSearchText(name);})){showToast("Ky emër është regjistruar tashmë në partinë tuaj.");return false;}
    var previousCounter=state.manualCandidateCounter;
    var previousSavedAt=list.savedAt;list.savedAt=null;
    var record={id:"manual:"+partyId+":"+(++state.manualCandidateCounter),name:name,partyId:partyId,
        listNumber:records.reduce(function(max,item){return Math.max(max,item.listNumber);},0)+1,source:"MANUAL_SIMULATED",gender:null,genderStatus:'UNCONFIRMED'};
    records.push(record);list.candidateIds.push(record.id);
    if(!saveGameAuto()){records.pop();list.candidateIds.pop();state.manualCandidateCounter=previousCounter;list.savedAt=previousSavedAt;return false;}
    renderElectoralList();showToast("Kandidati i simuluar u shtua dhe u ruajt vetëm te "+partyId+".");return true;
}

function addManualElectoralCandidateFromForm() {
    var input=document.getElementById("manualCandidateName");
    if(addManualElectoralCandidate(input.value))input.value="";
}

function deleteManualElectoralCandidate(id) {
    var list=getCurrentElectoralList(),records=state.candidateRegistry[state.playerParty];
    var index=records?records.findIndex(function(record){return record.id===id && record.source==="MANUAL_SIMULATED";}):-1;
    if(!list||list.status!=="DRAFT"||index<0)return false;
    if(!electoralListEditable(state,list))return false;
    if(state.electoralLists.some(function(other){return other!==list&&other.candidateIds.includes(id);})){showToast("Kandidati përdoret në një listë tjetër të ruajtur; mund ta hiqni vetëm nga drafti aktual.");return false;}
    var previousIds=list.candidateIds.slice(),record=records.splice(index,1)[0];
    var previousSavedAt=list.savedAt;list.savedAt=null;
    list.candidateIds=list.candidateIds.filter(function(candidateId){return candidateId!==id;});
    if(!saveGameAuto()){records.splice(index,0,record);list.candidateIds=previousIds;list.savedAt=previousSavedAt;return false;}
    renderElectoralList();showToast("Kandidati manual u fshi vetëm nga partia juaj.");return true;
}

function filterCandidateCatalogue(catalogue, filters) {
    var query = candidateSearchText(filters.query);
    return catalogue.filter(function(person) {
        if (query && !candidateSearchText(candidateName(person)).includes(query)) return false;
        if (filters.status === "legacy") return person.kind === "LEGACY" && !filters.party && !filters.year;
        if (filters.status === "simulated") return person.kind === "SIMULATED" && !filters.party && !filters.year;
        if (filters.status === "mandate") return person.history.some(function(entry) {
            return entry.mandateStatus && (!filters.party || entry.historicalParty === filters.party) && (!filters.year || String(entry.year) === filters.year);
        });
        if (!filters.party && !filters.year && !filters.status) return true;
        // All historical filters must match the same election record.
        return person.history.some(function(entry) {
            return (!filters.party || entry.historicalParty === filters.party) &&
                (!filters.year || String(entry.year) === String(filters.year)) &&
                (!filters.status || filters.status === "historical");
        });
    });
}

function electoralListCycleKey(gameState) {
    return ["CAMPAIGN","CAMPAIGN_CLOSED"].includes(gameState.electionPhase) && gameState.electionCampaign && Number.isInteger(gameState.electionCampaign.startWeek)
        ? "parliament:" + gameState.mandateNumber + ":" + gameState.electionCampaign.startWeek
        : "preparation:" + gameState.mandateNumber;
}

function migrateElectoralLists(gameState) {
    migrateCandidateRegistry(gameState);
    if (typeof gameState.electoralLists !== "undefined") return;
    var catalogue = getCandidateCatalogue(gameState);
    var ownNames = (gameState.parties[gameState.playerParty].candidates || []).map(function(profile) { return candidateSearchText(profile.name); });
    var ids = [];
    if (gameState.candidateRegistry[gameState.playerParty]) ids=gameState.candidateRegistry[gameState.playerParty].map(function(record){return record.id;});
    else
    ownNames.forEach(function(name) {
        var person = catalogue.find(function(item) { return candidateSearchText(candidateName(item)) === name && item.gamePartyIds.includes(gameState.playerParty); });
        if (person && !ids.includes(person.id)) ids.push(person.id);
    });
    gameState.electoralLists = [{ partyId: gameState.playerParty, cycleKey: electoralListCycleKey(gameState),
        candidateIds: ids, status: "DRAFT", submittedAt: null, savedAt: null, rulesId: ELECTORAL_LIST_RULES.id }];
}

function validateElectoralListState(gameState) {
    validateCandidateRegistry(gameState);
    if (typeof gameState.electoralLists === "undefined") return;
    if (!Array.isArray(gameState.electoralLists)) throw new Error("Listat zgjedhore kanë format të pavlefshëm");
    var keys = new Set();
    gameState.electoralLists.forEach(function(list) {
        if (!list || typeof list !== "object" || !gameState.parties[list.partyId] || typeof list.cycleKey !== "string" ||
            !Array.isArray(list.candidateIds) || list.candidateIds.some(function(id) { return typeof id !== "string"; }) ||
            !["DRAFT","SUBMITTED"].includes(list.status)) throw new Error("Lista zgjedhore është e dëmtuar");
        ["savedAt","submittedAt"].forEach(function(field) {
            var stamp = list[field];
            if (stamp !== null && (typeof stamp !== "object" || !Number.isInteger(stamp.year) ||
                !Number.isInteger(stamp.monthIndex) || stamp.monthIndex < 0 || stamp.monthIndex > 11 ||
                !Number.isInteger(stamp.week) || stamp.week < 1 || stamp.week > 4 ||
                !Number.isInteger(stamp.turnCount))) throw new Error("Data e listës zgjedhore është e pavlefshme");
        });
        if (list.status === "SUBMITTED" && (!list.submittedAt || new Set(list.candidateIds).size !== list.candidateIds.length)) throw new Error("Lista e dorëzuar është e dëmtuar");
        var key = list.partyId + ":" + list.cycleKey;
        if (keys.has(key)) throw new Error("Lista zgjedhore është e dyfishuar për të njëjtin cikël");
        keys.add(key);
    });
}

function getCurrentElectoralList() {
    var cycleKey = electoralListCycleKey(state);
    return state.electoralLists.find(function(list) { return list.partyId === state.playerParty && list.cycleKey === cycleKey; }) || null;
}

function createCurrentElectoralList() {
    if (getCurrentElectoralList()) return false;
    var previous = state.electoralLists.filter(function(list) { return list.partyId === state.playerParty; }).slice(-1)[0];
    state.electoralLists.push({ partyId: state.playerParty, cycleKey: electoralListCycleKey(state),
        candidateIds: previous ? previous.candidateIds.slice() : [], status: "DRAFT", submittedAt: null,
        savedAt: null, rulesId: ELECTORAL_LIST_RULES.id });
    if(!saveGameAuto()){state.electoralLists.pop();return false;} renderElectoralList();
    return true;
}

function changeElectoralList(action, id, direction) {
    var list = getCurrentElectoralList();
    if (!list || list.status !== "DRAFT") { showToast("Lista e dorëzuar nuk mund të ndryshohet. Për ciklin e ri përdorni listën përkatëse."); return false; }
    var index = list.candidateIds.indexOf(id);
    var previous=JSON.parse(JSON.stringify(list));
    if(!electoralListEditable(state,list)){showToast('Afati i ndryshimit të listës ka përfunduar.');return false;}
    if (action === "add") {
        if (index !== -1) { showToast("Ky kandidat është tashmë në listë."); return false; }
        var candidate = getCandidateCatalogue(state).find(function(person) { return person.id === id; });
        if (!candidateBelongsToParty(candidate, list.partyId)) { showToast("Ky kandidat nuk i përket partisë suaj në lojë."); return false; }
        list.candidateIds.push(id);
    } else if (action === "remove") {
        if (index < 0) return false;
        list.candidateIds.splice(index,1);
    } else if (action === "move") {
        if (index < 0 || ![-1,1].includes(direction)) return false;
        var target = index + direction;
        if (target < 0 || target >= list.candidateIds.length) return false;
        var other = list.candidateIds[target]; list.candidateIds[target] = id; list.candidateIds[index] = other;
    } else if(action === 'number') {
        if(index<0 || !Number.isInteger(direction) || direction<1 || direction>list.candidateIds.length){showToast('Numri duhet të jetë brenda listës.');renderElectoralList();return false;}
        list.candidateIds.splice(index,1);list.candidateIds.splice(direction-1,0,id);
    } else return false;
    list.savedAt = null;
    if(!saveGameAuto()){Object.assign(list,previous);renderElectoralList();return false;} renderElectoralList();
    return true;
}

function validateElectoralList(list, catalogue, rules) {
    rules = rules || ELECTORAL_LIST_RULES;
    var errors = [];
    if (!list || !Array.isArray(list.candidateIds)) return { valid: false, legalConfirmed: false, errors: ["Nuk ka listë për ciklin aktual."] };
    if (list.candidateIds.length < rules.technicalMinimum) errors.push("Shtoni të paktën një kandidat në listë.");
    if (new Set(list.candidateIds).size !== list.candidateIds.length) errors.push("Hiqni kandidatët e dyfishuar.");
    list.candidateIds.forEach(function(id) {
        var candidate = catalogue.find(function(person) { return person.id === id; });
        if (!candidate) errors.push("Kandidati me ID " + id + " nuk gjendet në katalogun e lejuar.");
        else {
            if (!candidate.firstName || !candidate.lastName) errors.push("Kandidatit " + id + " i mungon emri ose mbiemri.");
            if (!candidateBelongsToParty(candidate, list.partyId)) errors.push(candidateName(candidate) + " nuk i përket partisë së kësaj liste në lojë; hiqeni nga lista.");
        }
    });
    if (rules.requiredCount !== null && list.candidateIds.length !== rules.requiredCount) errors.push("Lista kërkon " + rules.requiredCount + " kandidatë sipas konfigurimit.");
    if (rules.maximumCount !== null && list.candidateIds.length > rules.maximumCount) errors.push("Lista tejkalon kufirin prej " + rules.maximumCount + " kandidatëve.");
    if (rules.genderQuota !== null || rules.genderOrder !== null) errors.push("Kontrollet ligjore të gjinisë nuk janë konfirmuar dhe nuk mund të aktivizohen me këtë konfigurim.");
    return { valid: errors.length === 0, legalConfirmed: rules.legalConfirmed, errors: errors,
        warning: rules.explanation, count: list.candidateIds.length };
}

function showElectoralListValidation() {
    var result = validateElectoralList(getCurrentElectoralList(), getCandidateCatalogue(state));
    var box = document.getElementById("electoralListValidation");
    if (box) box.textContent = result.valid ? "Kontrolli teknik kaloi: " + result.count + " kandidatë. " + result.warning : result.errors.join(" ");
    return result;
}

function saveElectoralList() {
    var list = getCurrentElectoralList(), result = showElectoralListValidation();
    if (!list || list.status !== "DRAFT" || !result.valid) return false;
    if(!electoralListEditable(state,list))return false;
    var previous = list.savedAt;
    list.savedAt = { year: state.year, monthIndex: state.monthIndex, week: state.week, turnCount: state.turnCount };
    if (!saveGameAuto()) { list.savedAt = previous; return false; }
    renderElectoralList(); showToast("Lista u ruajt si draft. Validimi ligjor mbetet i pakonfirmuar.");
    return true;
}

function requestElectoralListSubmission() {
    var list = getCurrentElectoralList(), result = showElectoralListValidation();
    if (!list || list.status !== "DRAFT" || !result.valid) return false;
    if(!electoralListEditable(state,list)){showToast('Afati i dorëzimit të listës ka përfunduar.');return false;}
    if (state.electionPhase !== "CAMPAIGN" || !state.electionCampaign) { showToast("Nuk ka cikël aktiv për dorëzim. Mund ta ruani listën si draft."); return false; }
    var catalogue = getCandidateCatalogue(state);
    var box = document.getElementById("interactiveActionModalContent");
    box.innerHTML = '<div class="card-title">Konfirmo dorëzimin në simulim</div><p>' + electoralEscape(state.parties[state.playerParty].name) + ' — ' + list.candidateIds.length + ' kandidatë</p><ol>' +
        list.candidateIds.map(function(id) { return '<li>' + electoralEscape(candidateName(catalogue.find(function(person) { return person.id === id; }))) + '</li>'; }).join("") +
        '</ol><p>' + electoralEscape(ELECTORAL_LIST_RULES.explanation) + '</p><p>Pas dorëzimit lista kyçet për këtë cikël.</p><button class="action-btn btn-gold" onclick="submitElectoralList()">Konfirmo dorëzimin në simulim</button> <button class="action-btn" onclick="toggleModal(\'interactiveActionModal\', false)">Anulo</button>';
    toggleModal("interactiveActionModal", true);
    return true;
}

function submitElectoralList() {
    var list = getCurrentElectoralList();
    if (!list || list.status !== "DRAFT" || state.electionPhase !== "CAMPAIGN" || !state.electionCampaign ||
        !validateElectoralList(list, getCandidateCatalogue(state)).valid) return false;
    if(!electoralListEditable(state,list))return false;
    list.status = "SUBMITTED";
    list.submittedAt = { year: state.year, monthIndex: state.monthIndex, week: state.week, turnCount: state.turnCount };
    if (!saveGameAuto()) { list.status = "DRAFT"; list.submittedAt = null; return false; }
    toggleModal("interactiveActionModal", false); renderElectoralList();
    showToast("Lista u dorëzua në simulim dhe u kyç. Nuk është certifikim nga KQZ-ja.");
    return true;
}

function electoralEscape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(character) {
        return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[character];
    });
}

function candidateDetailHtml(person) {
    if (person.kind === "SIMULATED") return '<p>Kandidat i simuluar</p>';
    if (person.kind === "LEGACY") return '<p>Profil ekzistues i lojës. Identiteti dhe historiku nuk janë verifikuar; nuk pretendohet kandidaturë reale.</p>';
    var sourceNote=person.brochureId?'<p>Emri nga broshura origjinale e KQZ-së · Numri origjinal: '+electoralEscape(person.originalListNumber ?? 'Pa numër')+' · <a target="_blank" rel="noopener" href="data/143_Broshura_alsr.pdf#page='+person.sourcePage+'">Faqja '+person.sourcePage+'</a>. Gjinia është e pakonfirmuar.</p>':'';
    return sourceNote+person.history.map(function(entry) {
        var source = CANDIDATE_SOURCES[entry.sourceId];
        return '<p>' + entry.year + ' · ' + electoralEscape(entry.electionType) + ' · Partia historike: ' + electoralEscape(entry.historicalParty) +
            '<br>' + electoralEscape(entry.candidacyStatus) + ' · Mandati: ' + electoralEscape(entry.mandateStatus || "I pakonfirmuar") +
            '<br>Vota personale historike: ' + (entry.personalVotes === null ? "Të pakonfirmuara" : entry.personalVotes.toLocaleString("sq-AL")) +
            ' · Gjinia: E pakonfirmuar nga dokumenti origjinal' +
            '<br><a target="_blank" rel="noopener noreferrer" href="' + electoralEscape(source.url) + '">' + electoralEscape(source.title) + '</a><br><small>' + electoralEscape(source.access) + '</small></p>';
    }).join("");
}

function renderElectoralList() {
    renderCandidateIntegrity();
    renderElectionPreparation();
    var host = document.getElementById("electoralListSummary");
    if (!host || !state) return;
    if (electoralPanelPartyId !== state.playerParty) {
        ["candidateSearch","candidatePartyFilter","candidateYearFilter","candidateStatusFilter"].forEach(function(id) {
            var input=document.getElementById(id);if(input)input.value="";
        });
        electoralPanelPartyId=state.playerParty;
    }
    var list = getCurrentElectoralList(), catalogue = getCandidateCatalogue(state);
    var party = state.parties[state.playerParty];
    var records=state.candidateRegistry&&state.candidateRegistry[state.playerParty];
    var counts=document.getElementById("candidateRegistryCounts");
    if(counts&&state.candidateRegistry)counts.textContent=Object.keys(PROVIDED_CANDIDATE_LISTS).map(function(partyId){return partyId+": "+state.candidateRegistry[partyId].length;}).join(" · ");
    host.textContent = party.name + " · " + (records?records.length:getCandidateCatalogue(state).filter(function(person){return candidateBelongsToParty(person,state.playerParty);}).length) + " kandidatë të regjistruar · " + (list ? list.candidateIds.length : 0) + " të përzgjedhur · " +
        (list && list.status === "SUBMITTED" ? "E dorëzuar në simulim — e kyçur" : "Draft për përgatitje");
    if(list && list.status==='DRAFT')host.textContent+=list.savedAt?' · Drafti është ruajtur':' · Ndryshime të pakonfirmuara: shtypni Ruaj draftin. Autorruajtja mbetet aktive.';
    if(state.electionCampaign?.electionCalendar && list?.cycleKey===electionDayCycleId(state))host.textContent+=' · Afati i simuluar i dorëzimit: '+campaignCalendarLabel(state.electionCampaign.electionCalendar)+'.';
    var badge = document.getElementById("listLegalBadge");
    if (badge) { badge.textContent = "Validimi ligjor i pakonfirmuar"; badge.className = "tag tag-aak"; }
    var getValue = function(id) { var element = document.getElementById(id); return element ? element.value : ""; };
    var filters = { query: getValue("candidateSearch"), party: getValue("candidatePartyFilter"), year: getValue("candidateYearFilter"), status: getValue("candidateStatusFilter") };
    var populate = function(id, values, label) {
        var element = document.getElementById(id); if (!element) return;
        var selected = element.value;
        element.innerHTML = '<option value="">' + label + '</option>' + values.map(function(value) { return '<option value="' + electoralEscape(value) + '">' + electoralEscape(value) + '</option>'; }).join("");
        element.value = values.includes(selected) ? selected : "";
    };
    var ownCatalogue=catalogue.filter(function(person){return candidateBelongsToParty(person,state.playerParty);});
    var histories = ownCatalogue.reduce(function(all, person) { return all.concat(person.history); }, []);
    populate("candidatePartyFilter", Array.from(new Set(histories.map(function(entry) { return entry.historicalParty; }))).sort(), "Të gjitha partitë historike");
    populate("candidateYearFilter", Array.from(new Set(histories.map(function(entry) { return String(entry.year); }))).sort().reverse(), "Të gjitha vitet");
    filters.party=getValue("candidatePartyFilter");filters.year=getValue("candidateYearFilter");
    var pageKey=JSON.stringify([state.playerParty,list?.id,list?.cycleKey,filters]);
    if(candidateListPages.key!==pageKey)candidateListPages={key:pageKey,selected:0,available:0};
    var locked = !list || !electoralListEditable(state,list);
    var card = function(person, selectedIndex) {
        var selected = selectedIndex !== null;
        var id = electoralEscape(person.id);
        return '<article class="candidate-card ux-candidate"><strong>' + (selected ? (selectedIndex+1) + '. ' : '') + electoralEscape(candidateName(person)) + '</strong><details><summary>Të dhënat dhe burimet</summary><small>' +
            (person.kind === "SIMULATED" ? "Kandidat i simuluar" : person.source === "USER_PROVIDED" ? "Nga lista e dhënë nga përdoruesi" : person.kind === "LEGACY" ? "Profil ekzistues i paverifikuar" : "Person me kandidaturë historike të dokumentuar") + '</small><small>' + (person.listNumber?'Numri origjinal: '+person.listNumber+' · Partia: '+electoralEscape(person.partyId)+' · ':'') + 'ID: ' + id + '</small>' +
            candidateDetailHtml(person) + '<p>Përkatësia aktuale nuk nxirret nga historia. Përzgjedhja këtu është vetëm për simulimin.</p></details><div class="candidate-actions">' +
            (selected?'<label>Numri i kandidatit në listën e '+electoralEscape(list.partyId)+'<input class="candidate-list-number" type="number" min="1" max="'+list.candidateIds.length+'" value="'+(selectedIndex+1)+'" data-candidate-id="'+id+'" onchange="changeElectoralList(\'number\',this.dataset.candidateId,Number(this.value))" '+(locked?'disabled':'')+'></label>':'')+
            (selected ? '<button class="btn-top" data-candidate-id="' + id + '" onclick="changeElectoralList(\'move\',this.dataset.candidateId,-1)" ' + (locked || selectedIndex===0 ? 'disabled' : '') + '>Lart</button> <button class="btn-top" data-candidate-id="' + id + '" onclick="changeElectoralList(\'move\',this.dataset.candidateId,1)" ' + (locked || selectedIndex===list.candidateIds.length-1 ? 'disabled' : '') + '>Poshtë</button> <button class="btn-top" data-candidate-id="' + id + '" onclick="changeElectoralList(\'remove\',this.dataset.candidateId)" ' + (locked ? 'disabled' : '') + '>Hiq</button>' :
                '<button class="action-btn" data-candidate-id="' + id + '" onclick="changeElectoralList(\'add\',this.dataset.candidateId)" ' + (locked || list.candidateIds.includes(person.id) ? 'disabled' : '') + '>Shto në listë</button>') +
            (person.source==='MANUAL_SIMULATED'?'<button class="btn-top" data-candidate-id="'+id+'" onclick="deleteManualElectoralCandidate(this.dataset.candidateId)" '+(locked?'disabled':'')+'>Fshi kandidatin manual</button>':'')+'</div></article>';
    };
    var available = document.getElementById("reserveCandidatesList");
    var availableRows=filterCandidateCatalogue(ownCatalogue,filters).filter(function(p){return !list || !list.candidateIds.includes(p.id);});
    if (available) available.innerHTML = candidatePageRows(availableRows,'available','reserveCandidatesPagination').map(function(person) { return card(person,null); }).join("") || '<p>Nuk ka kandidatë jashtë draftit me këta filtra. Kandidatët tashmë në listë shfaqen te të përzgjedhurit.</p>';
    var selected = document.getElementById("activeCandidatesList");
    var selectedRows=list?list.candidateIds.map(function(id,index){return {id:id,index:index,person:catalogue.find(function(item){return item.id===id;})};}).filter(function(row){return !row.person || filterCandidateCatalogue([row.person],filters).length;}):[];
    if (selected) selected.innerHTML = list ? candidatePageRows(selectedRows,'selected','activeCandidatesPagination').map(function(row) {
        var person=row.person,id=row.id,index=row.index;
        return candidateBelongsToParty(person,state.playerParty) ? card(person,index) : '<article class="candidate-card">Hyrje e vjetër jashtë listës së lejuar. ID: ' + electoralEscape(id) + ' <button class="btn-top" data-candidate-id="' + electoralEscape(id) + '" onclick="changeElectoralList(\'remove\',this.dataset.candidateId)" ' + (locked ? 'disabled' : '') + '>Hiq</button></article>';
    }).join("") || '<p>Lista është bosh.</p>' : '<p>Për këtë cikël ende nuk ka draft.</p>';
    var create = document.getElementById("createElectoralListBtn"); if (create) create.hidden = !!list;
    var correction = document.getElementById("correctElectoralListPartyBtn");
    if (correction) correction.hidden = !list || list.status !== "SUBMITTED" || !list.candidateIds.some(function(id) {
        return !candidateBelongsToParty(catalogue.find(function(person) { return person.id === id; }), list.partyId);
    });
    var save = document.getElementById("saveElectoralListBtn"); if (save) save.disabled = locked;
    var manual=document.getElementById("manualCandidateForm");if(manual)manual.hidden=locked||!records;
    var submit = document.getElementById("submitElectoralListBtn");
    if (submit) { submit.hidden = state.electionPhase !== "CAMPAIGN"; submit.disabled = locked; }
    var feedback = document.getElementById("electoralListValidation"); if (feedback) feedback.textContent = ELECTORAL_LIST_RULES.explanation;
}
