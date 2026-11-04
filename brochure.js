/* Historical list import only. This module never assigns polls, votes, gender or seats. */
function brochureSubjectIds() {return Object.keys(BROCHURE_SUBJECTS);}

function migrateBrochureRegistry(gameState) {
    if (!gameState.candidateRegistry) return;
    if (typeof gameState.candidateBrochureImports === "undefined") gameState.candidateBrochureImports = {};
    var key = CANDIDATE_BROCHURE_SOURCE.id;
    if (gameState.candidateBrochureImports[key]) return;
    var registry=gameState.candidateRegistry,legacy=getLegacyCandidateCatalogue(gameState);
    var used=new Set(Object.values(registry).flat().map(function(c){return c.id;}));
    brochureSubjectIds().forEach(function(partyId){
        // The five user-provided lists are preserved verbatim, including edits and removals.
        if (Object.hasOwn(PROVIDED_CANDIDATE_LISTS,partyId)) return;
        if (!registry[partyId]) registry[partyId]=[];
        BROCHURE_SUBJECTS[partyId].candidates.forEach(function(source){
            var previous=registry[partyId].find(function(c){return c.source!=="MANUAL_SIMULATED" && (c.brochureId===source.id || candidateSearchText(c.name)===candidateSearchText(source.name));});
            if (previous) return;
            var compatible=legacy.find(function(c){return c.kind!=="SIMULATED" && c.gamePartyIds.includes(partyId) && !used.has(c.id) && candidateSearchText(candidateName(c))===candidateSearchText(source.name);});
            var number=source.listNumber;
            if (number!==null && registry[partyId].some(function(c){return c.listNumber===number;})) number=Math.max(0,...registry[partyId].map(function(c){return c.listNumber || 0;}))+1;
            var row={id:compatible?compatible.id:source.id,name:source.name,partyId:partyId,listNumber:number,
                originalListNumber:source.listNumber,source:"KQZ_BROCHURE",brochureId:source.id,
                sourceId:key,sourcePage:source.page,electionYear:2025,electionType:"Kuvend"};
            registry[partyId].push(row);used.add(row.id);
        });
    });
    gameState.candidateBrochureImports[key]={sha256:CANDIDATE_BROCHURE_SOURCE.sha256};
}

function validateBrochureImports(gameState) {
    var imports=gameState.candidateBrochureImports;
    if (typeof imports==="undefined") return;
    if (!imports || typeof imports!=="object" || Array.isArray(imports) || Object.keys(imports).some(function(key){return key!==CANDIDATE_BROCHURE_SOURCE.id || !imports[key] || imports[key].sha256!==CANDIDATE_BROCHURE_SOURCE.sha256;})) throw Error("Regjistri i importimit të broshurës është i dëmtuar.");
}

function brochureCandidateHistory(record) {
    if (record.source!=="KQZ_BROCHURE") return [];
    return [{year:2025,electionType:"Kuvend",historicalParty:BROCHURE_SUBJECTS[record.partyId].name,
        candidacyStatus:"Kandidaturë në broshurën e zgjedhjeve të parakohshme 2025",gender:null,
        personalVotes:null,mandateStatus:null,sourceId:CANDIDATE_BROCHURE_SOURCE.id}];
}

function renderBrochurePanel() {
    var select=document.getElementById("brochurePartyFilter"),host=document.getElementById("brochureCandidates");
    if (!select || !host) return;
    var selected=select.value;
    select.innerHTML=brochureSubjectIds().map(function(id){var s=BROCHURE_SUBJECTS[id];return '<option value="'+electoralEscape(id)+'">'+s.ballotNumber+' · '+electoralEscape(s.name)+'</option>';}).join('');
    select.value=BROCHURE_SUBJECTS[selected]?selected:"NDS";
    var subject=BROCHURE_SUBJECTS[select.value],query=candidateSearchText(document.getElementById("brochureSearch").value);
    var rows=subject.candidates.filter(function(c){return candidateSearchText(c.name).includes(query);});
    document.getElementById("brochureCounts").textContent=subject.name+' · '+subject.candidates.length+' kandidatë në broshurë · '+rows.length+' të gjetur. Gjithsej: 24 subjekte, 1 180 kandidatura.';
    host.innerHTML=rows.map(function(c){return '<article class="candidate-card" data-brochure-party="'+electoralEscape(subject.partyId)+'"><strong>'+(c.listNumber===null?'':c.listNumber+'. ')+electoralEscape(c.name)+'</strong><small>Partia/subjekti historik: '+electoralEscape(subject.name)+' · 2025</small><small>'+(c.listNumber===null?'Kandidat i pavarur — broshura nuk shtyp numër liste.':'Numri origjinal: '+c.listNumber)+'</small><a target="_blank" rel="noopener" href="data/143_Broshura_alsr.pdf#page='+c.page+'">Burimi: KQZ, faqja '+c.page+' e dokumentit</a></article>';}).join('') || '<p>Nuk u gjet asnjë kandidat me këtë kërkim.</p>';
}
