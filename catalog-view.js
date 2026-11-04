/* Presentation only. The catalogue reads the existing laws and project objects. */
var catalogVisibleSection='laws';
function catalogProjectRecords(st){
    var rows=stateDevelopmentRecords(st),seen=new Set(rows.map(function(r){return r.key;}));
    // Preserve the existing catalogue's available municipal proposals as well.
    (st.governmentCatalog?.projects||[]).forEach(function(p){if(p.status==='AVAILABLE' && !seen.has(p.id)){seen.add(p.id);rows.push({key:p.id,project:p,source:'catalog',municipalityId:p.municipalityId||''});}});
    return rows;
}
function catalogStatusLabel(status){
    return ({DRAFT:'Hartim / Qeveri',SUBMITTED:'Dërguar në Kuvend',UNDER_REVIEW:'Në shqyrtim parlamentar',SCHEDULED:'Në pritje të votimit',PASSED:'Ligj i miratuar',FAILED:'Projektligj i refuzuar',WITHDRAWN:'Projektligj i tërhequr',AVAILABLE:'Në katalog, ende pa propozim'})[status] || stateDevelopmentStatus({status:status});
}
function selectCatalogSection(section){
    if(!['laws','projects'].includes(section))return false;catalogVisibleSection=section;
    ['laws','projects'].forEach(function(key){var panel=document.getElementById(key==='laws'?'catalogLawsPanel':'catalogProjectsPanel'),button=document.getElementById('catalogSection-'+key);if(panel)panel.hidden=key!==section;if(button){button.classList[key===section?'add':'remove']('active');button.setAttribute('aria-pressed',String(key===section));}});return true;
}
function renderGovernmentCatalog(){
    var box=document.getElementById('governmentCatalogContainer');if(!box || !state)return;
    var e=catalogEscape,previous={};['Status','Sector','Ministry'].forEach(function(k){previous[k]=document.getElementById('catalog13'+k)?.value||'';});
    var statuses=[...new Set(state.laws.map(function(l){return l.status;}).concat(catalogProjectRecords(state).map(function(r){return r.project.status;})))];
    box.innerHTML='<div class="catalog13"><div class="card"><h2>Katalogu i ligjeve dhe projekteve</h2><p>Shqyrtoni ligjet, iniciativat dhe ecurinë e projekteve. Zgjidhni përmbajtjen dhe përdorni filtrat për të gjetur dokumentin ose projektin.</p><div class="candidate-actions"><button class="action-btn btn-gold" onclick="catalogDraftForm(false)">Harto projektligj</button>'+(agendaExecutive()?'<button class="action-btn" onclick="catalogDraftForm(true)">Propozo projekt qeveritar</button>':'')+'</div><div class="sub-nav" aria-label="Përmbajtja e katalogut"><button class="sub-pill" id="catalogSection-laws" aria-controls="catalogLawsPanel" onclick="selectCatalogSection(\'laws\')">Ligjet</button><button class="sub-pill" id="catalogSection-projects" aria-controls="catalogProjectsPanel" onclick="selectCatalogSection(\'projects\')">Projektet</button></div><div class="candidate-filters"><label>Statusi<select id="catalog13Status" onchange="filterGovernmentCatalog()"><option value="">Të gjitha statuset</option>'+statuses.filter(Boolean).map(function(s){return '<option value="'+e(s)+'">'+e(catalogStatusLabel(s))+'</option>';}).join('')+'</select></label><label>Sektori<select id="catalog13Sector" onchange="filterGovernmentCatalog()"><option value="">Të gjithë sektorët</option>'+state.stateSectors.map(function(s){return '<option value="'+e(s.id)+'">'+e(s.name)+'</option>';}).join('')+'</select></label><label>Ministria<select id="catalog13Ministry" onchange="filterGovernmentCatalog()"><option value="">Të gjitha ministritë</option>'+state.ministries.map(function(m){return '<option>'+e(m.name)+'</option>';}).join('')+'</select></label></div></div><div id="catalogLawsPanel"><h3>Ligjet dhe iniciativat</h3><div id="catalog13Laws"></div></div><div id="catalogProjectsPanel"><h3>Projektet</h3><p>Projektet në zbatim, të përfunduara dhe propozimet për financim. Propozimet ende të paparaqitura shënohen «Në katalog».</p><div id="catalog13Projects"></div><details class="card"><summary>Regjistri i shpenzimeve dhe detyrimeve</summary>'+state.governmentCatalog.ledger.map(function(x){return '<p>'+e(x.date)+' · '+e(x.title)+' · €'+(x.costB*1000).toFixed(2)+'M · Financim i zotuar nga buxheti</p>';}).join('')+'</details></div></div>';
    Object.keys(previous).forEach(function(k){var el=document.getElementById('catalog13'+k);if(el)el.value=previous[k];});
    filterGovernmentCatalog();selectCatalogSection(catalogVisibleSection);
}
function filterGovernmentCatalog(){
    var laws=document.getElementById('catalog13Laws'),projects=document.getElementById('catalog13Projects');if(!laws || !projects)return;
    var status=document.getElementById('catalog13Status')?.value||'',sector=document.getElementById('catalog13Sector')?.value||'',ministry=document.getElementById('catalog13Ministry')?.value||'',e=catalogEscape;
    function matches(x){var owner=state.ministries.find(function(m){return m.id.toLowerCase()===String(x.ministry||'').toLowerCase();});return (!status || x.status===status) && (!sector || (x.sector||x.sectorId)===sector) && (!ministry || (owner?owner.name:x.ministry)===ministry);}
    laws.innerHTML=state.laws.filter(matches).map(function(l){var i=state.laws.indexOf(l);return '<article class="candidate-card" data-catalog-law-id="'+e(l.id)+'"><strong>'+e(l.title)+'</strong><p>'+(l.status==='PASSED'?'Ligj':'Projektligj')+' · '+e(catalogStage(l))+'</p><button class="action-btn" onclick="catalogBillDetails('+i+')">Hap dokumentin</button></article>';}).join('') || '<p>Nuk ka dokumente me këta filtra.</p>';
    var visibleProjects=uxPageRows('projects',catalogProjectRecords(state).filter(function(r){return matches(r.project);}),JSON.stringify([status,sector,ministry]));
    projects.innerHTML=uxPageControls('projects')+visibleProjects.map(function(r){
        var p=r.project,m=state.municipalities.find(function(m){return m.id===r.municipalityId;}),i=state.governmentCatalog.projects.indexOf(p),body;
        if(p.municipal14)body=municipal14Card(p);
        else {var cost=Number.isFinite(p.costB)?p.costB*1000:p.costM;body='<article class="candidate-card"><strong>'+e(p.title||p.name)+'</strong><p>Projekt · '+e(stateDevelopmentStatus(p))+(m?' · '+e(m.name):'')+'</p>'+(r.source==='catalog'?catalogImplementationDetails(p):'<p>Kostoja: '+(Number.isFinite(cost)?'€'+cost.toFixed(2)+'M':'Nuk është regjistruar')+' · Progresi: '+(Number.isFinite(p.progress)?p.progress.toFixed(0)+'%':'Nuk është regjistruar')+'</p>')+'<p>'+e(p.desc||'')+' · '+e(p.ministry||'')+'</p>'+(i>=0 && p.status==='PLANNED' && agendaExecutive()?'<button class="action-btn btn-gold" onclick="approveCatalogProject('+i+')">Mirato dhe financo · €'+(p.costB*1000).toFixed(2)+'M</button>':'')+'</article>';}
        return '<div data-catalog-project-id="'+e(r.key)+'">'+body+'</div>';
    }).join('')+uxPageControls('projects');
}
