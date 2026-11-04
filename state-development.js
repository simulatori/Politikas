/* Read-only projection of existing project records. No parallel project storage,
   funding, migration or lifecycle: all actions remain in their owning modules. */
function stateDevelopmentRecords(st){
    var seen=new Set(),records=[];
    function include(p,source,municipalityId,index){
        if(!p || typeof p!=='object' || p.status==='AVAILABLE')return;
        var reference=source==='municipal' && (p.catalogProjectId||p.developmentProjectId||p.projectId);
        var key=String(reference || p.id || p.projectId || source+':'+(municipalityId||'national')+':'+index);
        if(seen.has(key))return;seen.add(key);
        records.push({key:key,project:p,source:source,municipalityId:p.municipalityId||municipalityId||''});
    }
    // Canonical records take precedence over references in older municipal lists.
    (st.governmentCatalog?.projects||[]).forEach(function(p,i){include(p,'catalog','',i);});
    (st.developmentProjects||[]).forEach(function(p,i){include(p,'development','',i);});
    Object.values(st.sectorManagement?.sectors||{}).forEach(function(row){row.buildings.forEach(function(p,i){include(p,'sector-management','',i);});});
    // Sector reforms remain owned by stateSectors; this is a read-only view.
    // Sharing a sector is not proof that two independent projects are duplicates.
    (st.stateSectors||[]).forEach(function(s,i){
        if(!s.active && !Number.isInteger(s.startedTurn) && !Number.isInteger(s.completedTurn) && !s.effectsApplied)return;
        var completed=Number.isInteger(s.completedTurn)||s.effectsApplied===true;
        include({id:'sector-reform:'+s.id,title:s.projectTitle,desc:s.problem,sectorId:s.id,type:'Reformë sektoriale',costM:s.costM,
            status:completed?'COMPLETED':s.active?'ACTIVE':'PLANNED',progress:completed?100:s.active?Math.min(100,Math.max(0,(s.weeksTotal-s.weeksLeft)/s.weeksTotal*100)):0,
            startTurn:s.startedTurn,completedTurn:s.completedTurn,fundingSource:'Financimi i reformës ekzistuese; nuk kryhet pagesë nga kjo listë.'},'sector-reform','',i);
    });
    (st.municipalities||[]).forEach(function(m){(m.projects||[]).forEach(function(p,i){include(p,'municipal',m.id,i);});});
    return records;
}
function stateDevelopmentGroup(p){
    if(['COMPLETED','I Përfunduar'].includes(p.status))return 'COMPLETED';
    if(['CANCELLED','Anuluar','I Anuluar'].includes(p.status))return 'CANCELLED';
    if(['ACTIVE','IN_PROGRESS','Në Ndërtim'].includes(p.status))return 'ACTIVE';
    if(p.status==='DELAYED' && (Number.isInteger(p.startTurn) || Number.isInteger(p.startWeek) || p.elapsed>0 || p.progress>0))return 'ACTIVE';
    return 'OTHER';
}
function stateDevelopmentSummary(st){
    var rows=stateDevelopmentRecords(st),counts={ACTIVE:0,COMPLETED:0,CANCELLED:0,OTHER:0};
    rows.forEach(function(r){counts[stateDevelopmentGroup(r.project)]++;});
    return {records:rows,total:rows.length,active:counts.ACTIVE,completed:counts.COMPLETED,cancelled:counts.CANCELLED,other:counts.OTHER};
}
function stateDevelopmentStatus(p){
    return ({IN_PROGRESS:'Në zbatim',PLANNED:'I planifikuar',PROPOSED:'I propozuar',REVIEW:'Në shqyrtim',DEFERRED:'I shtyrë',REJECTED:'I refuzuar',APPROVED:'I miratuar',FUNDED:'I financuar, ende pa nisur',ACTIVE:'Në zbatim',DELAYED:'I vonuar',COMPLETED:'I përfunduar',CANCELLED:'I anuluar'})[p.status] || p.status || 'Status i paregjistruar';
}
function stateDevelopmentDate(turn,fallback){return Number.isInteger(turn)?diplomaticDate(turn):fallback||'Nuk është regjistruar';}
function stateDevelopmentProjectList(){
    renderMunicipalEducation();
    var e=catalogEscape,rows=stateDevelopmentRecords(state),city=document.getElementById('developmentCityFilter')?.value||'',status=document.getElementById('developmentStatusFilter')?.value||'';
    var host=document.getElementById('developmentProjectList');if(!host)return;
    var visible=rows.filter(function(r){return (!city || (city==='NATIONAL'?!r.municipalityId:r.municipalityId===city)) && (!status || r.project.status===status);});
    host.innerHTML=visible.map(function(r){
        var p=r.project,m=state.municipalities.find(function(m){return m.id===r.municipalityId;}),progress=Number.isFinite(p.progress)?clamp(p.progress,0,100):null,cost=Number.isFinite(p.costB)?p.costB*1000:p.costM;
        var start=p.startTurn??p.startWeek??(p.status==='IN_PROGRESS'?p.createdWeek:undefined),completed=p.completedTurn??p.completedWeek;
        var category=(typeof MUNICIPAL_14_SECTORS!=='undefined' && MUNICIPAL_14_SECTORS[p.field]?.name) || state.stateSectors.find(function(s){return s.id===(p.sector||p.sectorId);})?.name || p.type || p.field;
        var action=r.source==='development' && p.status==='PROPOSED'?'<button class="action-btn btn-gold" onclick="openDevelopmentProjectModal('+e(JSON.stringify(p.id))+')">Plotëso dhe nis draftin</button>':'';
        return '<article class="candidate-card" data-development-id="'+e(r.key)+'"><h4>'+e(p.title||p.name||'Projekt pa titull')+'</h4><p>'+e(m?m.name:r.municipalityId||'Projekt shtetëror pa komunë të përcaktuar')+' · <strong>'+e(r.source==='development' && p.status==='PROPOSED'?'Draft — ende pa financim':stateDevelopmentStatus(p))+'</strong></p>'+action+(progress!==null?'<progress max="100" value="'+progress+'"></progress><p>Progresi: '+progress.toFixed(0)+'%</p>':'')+'<p>Kostoja: '+(Number.isFinite(cost)?'€'+cost.toFixed(2)+'M':'Nuk është regjistruar')+'<br>Nisja: '+e(stateDevelopmentDate(start,p.startDate))+(stateDevelopmentGroup(p)==='COMPLETED'?'<br>Përfundimi: '+e(stateDevelopmentDate(completed,p.completedDate)):'')+'</p><details><summary>Detajet e projektit</summary><p>'+e(p.desc||p.description||'Nuk ka përshkrim shtesë të regjistruar.')+'</p><p>Identifikuesi: '+e(p.id||p.projectId||'Pa identifikues në ruajtjen e vjetër')+(category?'<br>Kategoria: '+e(category):'')+'<br>Regjistrimi: '+e(stateDevelopmentDate(p.createdTurn??p.createdWeek,p.createdDate))+(p.fundingSource?'<br>Financimi: '+e(p.fundingSource):'')+'</p>'+(p.history||[]).map(function(h){return '<p>'+e(h.date||stateDevelopmentDate(h.turn))+' · '+e(h.note||h.text||stateDevelopmentStatus(h))+'</p>';}).join('')+(p.municipal14?'<button class="btn-top" onclick="openMunicipalProject14('+e(JSON.stringify(p.id))+')">Hap projektin komunal</button>':'')+'</details></article>';
    }).join('') || '<p>'+(rows.length?'Nuk ka projekte me këta filtra.':'Nuk ka projekte të regjistruara. Projektet ende të papropozuara në katalog nuk përfshihen në statistika.')+'</p>';
    polishDevelopmentSurface(host);
}
function stateDevelopmentFilters(){
    var rows=stateDevelopmentRecords(state),e=catalogEscape,city=document.getElementById('developmentCityFilter')?.value||'',status=document.getElementById('developmentStatusFilter')?.value||'';
    return '<div class="candidate-filters"><label>Qyteti ose komuna<select id="developmentCityFilter" onchange="stateDevelopmentProjectList()"><option value="">Të gjitha komunat</option><option value="NATIONAL" '+(city==='NATIONAL'?'selected':'')+'>Pa komunë të përcaktuar</option>'+state.municipalities.map(function(m){return '<option value="'+e(m.id)+'" '+(city===m.id?'selected':'')+'>'+e(m.name)+'</option>';}).join('')+'</select></label><label>Statusi<select id="developmentStatusFilter" onchange="stateDevelopmentProjectList()"><option value="">Të gjitha statuset</option>'+[...new Set(rows.map(function(r){return r.project.status;}).filter(Boolean))].map(function(s){return '<option value="'+e(s)+'" '+(s===status?'selected':'')+'>'+e(stateDevelopmentStatus({status:s}))+'</option>';}).join('')+'</select></label></div><div id="developmentProjectList" class="grid-2"></div>';
}
function openStateDevelopment(){switchMainTab('tab-development');}

// A municipal lens on authoritative profiles/projects, not another simulation.
function municipalInfrastructureData(st,mid){
    var municipality=st.municipalities.find(function(m){return m.id===mid;});if(!municipality)return null;
    var profile=st.municipalityProfiles?.[mid]||{};
    var metric=function(key){return Number.isFinite(profile[key]) && profile[key]>=1 && profile[key]<=10?profile[key]:null;};
    var projects=municipal14Records(st).filter(function(p){return p.municipalityId===mid && ['water','transport'].includes(p.field);});
    var registered=stateDevelopmentRecords(st).filter(function(r){return r.municipalityId===mid && (['water','transport'].includes(r.project.field)||['ROAD','WATER','TRANSPORT'].includes(r.project.type));});
    var energyProjects=municipal14Records(st).filter(function(p){return p.municipalityId===mid && p.field==='energy';});
    var energyRegistered=stateDevelopmentRecords(st).filter(function(r){return r.municipalityId===mid && (r.project.field==='energy'||r.project.type==='ENERGY_EFF');});
    return {municipality:municipality,water:metric('water'),infrastructure:metric('infrastructure'),connectivity:metric('connectivity'),projects:projects,registered:registered,energyProjects:energyProjects,energyRegistered:energyRegistered};
}
function renderMunicipalInfrastructure(mid){
    var host=document.getElementById('municipalInfrastructurePanel');if(!host)return;
    mid=mid||document.getElementById('infrastructureMunicipality')?.value||state.municipalities[0]?.id;
    var data=municipalInfrastructureData(state,mid),e=catalogEscape;
    if(!data){host.innerHTML='<p role="status">Komuna nuk është e disponueshme.</p>';return;}
    var metrics=[['water','Shërbimi i ujit'],['infrastructure','Gjendja e infrastrukturës publike'],['connectivity','Lidhshmëria lokale']];
    var known=metrics.filter(function(m){return data[m[0]]!==null;}).sort(function(a,b){return data[a[0]]-data[b[0]];});
    host.innerHTML='<h3>Infrastruktura komunale dhe uji</h3><p>Tregues aktualë të simulimit (baza fillestare është e simuluar), në shkallën 1–10; më lart do të thotë gjendje më e mirë. Nuk janë matje reale, përqindje mbulimi, kilometra ose m³ ujë.</p><label>Komuna<select id="infrastructureMunicipality" onchange="renderMunicipalInfrastructure(this.value)">'+state.municipalities.map(function(m){return '<option value="'+e(m.id)+'" '+(m.id===mid?'selected':'')+'>'+e(m.name)+'</option>';}).join('')+'</select></label><div class="grid-3">'+metrics.map(function(m){return '<article class="candidate-card"><strong>'+m[1]+'</strong><p data-infrastructure-metric="'+m[0]+'">'+(data[m[0]]===null?'Nuk është regjistruar':data[m[0]].toFixed(2)+' / 10')+'</p></article>';}).join('')+'</div><p>'+(known.length?'Nevojë relative sipas indekseve të modelit: '+known.filter(function(m){return data[m[0]]===data[known[0][0]];}).map(function(m){return m[1];}).join(', ')+'. Ky është krahasim i treguesve të komunës, jo diagnozë teknike e rrjetit.':'Nuk ka tregues të vlefshëm për të renditur nevojat.')+'</p><p>Shërbimi i ujit është agregat: modeli nuk dallon përqindjen e furnizimit me ujësjellës, kanalizimin dhe kapacitetin e trajtimit. Projektet e lidhjeve lokale përmirësojnë metrikën e përcaktuar në projekt; nuk krijojnë automatikisht rrjet rrugor.</p><h4>Modelet ekzistuese për këtë komunë</h4><div class="grid-2">'+(data.projects.map(municipal14Card).join('')||'<p>Nuk ka model uji/transporti në katalog për këtë komunë. Mund të propozoni projekt me formularin ekzistues më poshtë.</p>')+'</div><p>Modelet komunale me efekt gradual e japin përfitimin sipas progresit, jo të plotë në fillim. Hapni detajet për shumën, afatin dhe shërbimin e synuar.</p><div class="candidate-actions">'+(agendaExecutive()?'<button class="action-btn" onclick="openInfrastructureProject(\'ROAD\')">Projekto rrugë lokale</button><button class="action-btn" id="newMunicipalTransportProject" onclick="openInfrastructureProject(\'TRANSPORT\')">Projekto transport publik</button><button class="action-btn" onclick="openInfrastructureProject(\'WATER\')">Projekto ujësjellës dhe kanalizim</button>':'<p>Financimi dhe nisja kërkojnë autoritet qeveritar sipas rregullave ekzistuese.</p>')+'</div><h4>Projektet e regjistruara të infrastrukturës dhe ujit</h4>'+data.registered.map(municipalInfrastructureRecord).join('')+(data.registered.length?'':'<p>Ende pa projekte të regjistruara në këto kategori.</p>');
    host.innerHTML+=municipalEnergyProjectsHtml(data);
    host.innerHTML+=municipalEnvironmentProjectsHtml(mid);polishDevelopmentSurface(host);
}
function municipalEnvironmentProjectsHtml(mid){
    var data=municipalServiceData(state,mid,'environment','ENVIRONMENT','services'),e=catalogEscape;
    if(!data)return '<p>Komuna nuk është e disponueshme.</p>';
    var sector=state.stateSectors.find(function(s){return s.id==='sec_env';});
    var score=Number.isFinite(sector?.score) && sector.score>=10 && sector.score<=100?sector.score.toFixed(2)+' / 100':'Nuk është regjistruar';
    var models=data.projects.map(function(p){
        var error=municipalFundingMetricError(state,p.municipalityId,{[p.metric]:p.metricGain});
        return '<div data-environment-project="'+e(p.id)+'">'+municipalInfrastructureRecord({key:p.id,project:p,source:'catalog'})+(!p.fundingCommitted && error?'<p role="status">'+e(error)+' Propozimi ruhet; financimi nuk ka vazhduar.</p>':'')+'</div>';
    }).join('');
    // Municipal models already appear above; a second card is not another record.
    var registered=data.registered.filter(function(r){return !r.project.municipal14;}).concat(stateDevelopmentRecords(state).filter(function(r){return r.municipalityId===mid && r.project.type==='GREEN_SPACE';}));
    var greenAction=agendaExecutive()?'<div class="candidate-actions"><button class="action-btn" id="newMunicipalGreenSpaceProject" onclick="openInfrastructureProject(\'GREEN_SPACE\')">🌳 Hapësira të Gjelbra dhe Parqe Publike</button></div>':'';
    return '<div id="municipalEnvironmentProjects">'+greenAction+'<h4>Projektet komunale të mjedisit · '+e(data.municipality.name)+'</h4><p>Indeksi i përgjithshëm i shërbimeve (services): <strong data-environment-services>'+(data.services===null?'Nuk është regjistruar':data.services.toFixed(2)+' / 10')+'</strong>. Ky agregat përdoret edhe nga sektorë të tjerë; nuk është matje mjedisore.</p><p>Indeksi kombëtar i sektorit të mjedisit (sec_env): <strong data-environment-sector>'+score+'</strong>. Nuk është tregues vetëm i kësaj komune.</p><p>Projektet dhe përfitimet janë të simuluara. Nuk maten ndotja e ajrit, cilësia e ujit, tonët e ricikluar, sipërfaqet e gjelbra ose kursimet e burimeve. Rritja e services nuk provon ulje të ndotjes.</p><h5>Modelet ekzistuese të komunës</h5><div class="grid-2">'+(models||'<p>Nuk ka model mjedisor në katalog për këtë komunë; kjo nuk provon mungesë nevojash.</p>')+'</div>'+(agendaExecutive()?'<div class="candidate-actions"><button class="action-btn" id="newMunicipalEnvironmentProject" onclick="openInfrastructureProject(\'ENVIRONMENT\')">Projekto mjedis dhe menaxhim mbeturinash</button></div>':'<p>Nisja dhe financimi kërkojnë autoritetin qeveritar ekzistues.</p>')+'<p>Formulari ENVIRONMENT përdor kontratën e vet dhe efekte vetëm në përfundim. Modelet komunale ruajnë mënyrën e zbatimit të kontratës së tyre.</p><h5>Draftet dhe projektet ENVIRONMENT / GREEN_SPACE</h5><div class="grid-2">'+(registered.map(municipalInfrastructureRecord).join('')||'<p>Ende pa drafte ose projekte ENVIRONMENT të regjistruara për këtë komunë.</p>')+'</div></div>';
}
function municipalEnergyProjectsHtml(data){
    var e=catalogEscape;
    var models=data.energyProjects.map(function(p){
        var error=municipalFundingMetricError(state,p.municipalityId,{[p.metric]:p.metricGain});
        return '<div data-energy-project="'+e(p.id)+'">'+municipal14Card(p)+'<p>'+e(municipalContractEffectText(p))+'</p>'+(!p.fundingCommitted && error?'<p role="status">'+e(error)+' Propozimi ruhet; financimi kërkon metrikën e vlefshme.</p>':'')+'</div>';
    }).join('');
    return '<div id="municipalEnergyProjects"><h4>Projektet komunale të energjisë · '+e(data.municipality.name)+'</h4><p>Modelet komunale ndryshojnë infrastrukturën e përgjithshme dhe indeksin kombëtar energjetik. Formulari ENERGY_EFF ka përfitime të tjera të deklaruara: shërbimet dhe zhvillimi. Këto nuk janë matje kursimi në kWh/MWh. Ndikimi në kapacitet llogaritet nga piloti ekzistues, kur është aktiv, nga java pas zbatimit; ulja e kostove ose mungesave nuk garantohet.</p><h5>Modelet ekzistuese të energjisë</h5><div class="grid-2">'+(models||'<p>Nuk ka model komunal energjie në katalog për këtë komunë; kjo nuk provon mungesë nevojash.</p>')+'</div>'+(agendaExecutive()?'<div class="candidate-actions"><button class="action-btn" id="newMunicipalEnergyProject" onclick="openInfrastructureProject(\'ENERGY_EFF\')">Projekto investim energjetik</button></div>':'<p>Nisja dhe financimi kërkojnë autoritetin qeveritar ekzistues.</p>')+'<h5>Projektet energjetike të regjistruara</h5><div class="grid-2">'+(data.energyRegistered.map(municipalInfrastructureRecord).join('')||'<p>Ende pa projekte energjetike të regjistruara për këtë komunë.</p>')+'</div></div>';
}
function openInfrastructureProject(type,municipalityId){
    var mid=municipalityId || document.getElementById('infrastructureMunicipality')?.value;
    if(!['ROAD','WATER','TRANSPORT','ENERGY_EFF','ENVIRONMENT','GREEN_SPACE'].includes(type)||!municipalInfrastructureData(state,mid))return false;
    if(openDevelopmentProjectModal()===false)return false;
    // Opening a form is not financing; the existing submit validates authority.
    if(!agendaExecutive())return false;
    var cat=DEVELOPMENT_PROJECT_CATALOG.find(function(c){return c.type===type;});
    document.getElementById('devProjMuni').value=mid;document.getElementById('devProjType').value=type;
    document.getElementById('devProjName').value=cat.name;document.getElementById('devProjDesc').value='Projekt i simuluar: '+cat.name+'.';
    document.getElementById('devProjCost').value=type==='GREEN_SPACE'?'':cat.costRangeM[0];document.getElementById('devProjWeeks').value=type==='GREEN_SPACE'?'':cat.weeksRange[0];
    updateDevProjectPreview();
    return true;
}

function infrastructureFormPreview(cat,mid){
    var gains=developmentMunicipalGains(cat),sector=state.stateSectors.find(function(s){return s.id===cat.sectorId;}),error=municipalFundingMetricError(state,mid,gains);
    return '<p>Përfitimet e këtij formulari zbatohen vetëm pas përfundimit: '+catalogEscape(infrastructureBenefitText(gains))+'; kufiri 10 mund ta zvogëlojë rritjen e realizuar. Sektori: '+catalogEscape(sector?.name||'Nuk është regjistruar')+'. Kostoja paguhet një herë në nisje nga buxheti qeveritar; drafti nuk paguan.</p>'+(cat.type==='ENERGY_EFF'?'<p>Ky projekt nuk mat kursime energjie në kWh/MWh dhe nuk garanton ulje kostosh ose mungesash. Ndikimi i sec_energy mbetet ai i modelit ekzistues.</p>':'')+(cat.type==='ENVIRONMENT'?'<p>services është indeksi i përgjithshëm i shërbimeve, jo matje mjedisore. Kjo kontratë nuk mat ndotjen, riciklimin ose kursimet e burimeve.</p>':'')+(error?'<p role="status">'+catalogEscape(error)+'</p>':'');
}
function infrastructureBenefitText(gains){
    return Object.keys(MUNICIPAL_14_METRICS).filter(function(k){return Number.isFinite(gains?.[k]) && gains[k]>0;}).map(function(k){return MUNICIPAL_14_METRICS[k]+' +'+Math.round(gains[k]/5)+' / 10';}).join(', ')||'Përfitimet lokale nuk janë regjistruar';
}
// Presentation only: never initialise metadata or infer delivery from progress.
function municipalEffectPresentation(p){
    var e=catalogEscape;
    var physical=p.status==='COMPLETED'?'<p>Përfundimi fizik: i përfunduar. Ky status nuk vërteton zbatimin e të gjitha efekteve.</p>':'<p>Progresi i projektit paraqitet veçmas nga zbatimi i efekteve.</p>';
    if(!p.effectComponents)return physical+'<p>Gjendja e komponentëve nuk është regjistruar. Shënuesit historikë nuk vërtetojnë realizimin e çdo efekti.</p>';
    try{validateProjectEffectComponents(p);}catch(error){return physical+'<p>Gjendja e komponentëve është e pavlefshme; realizimi nuk mund të konfirmohet.</p>';}
    var components=p.effectComponents.components,keys=Object.keys(components);
    if(!keys.length || projectEffectKeys(p).some(function(key){return !components[key];}))return physical+'<p>Gjendja e komponentëve nuk është regjistruar plotësisht; realizimi nuk mund të konfirmohet.</p>';
    function fraction(value){return value>0 && value<0.0001?'<0.01%':(value*100).toFixed(2).replace(/\.?0+$/,'')+'%';}
    var rows=keys.map(function(key){
        var c=components[key],label=key.startsWith('metric:')?MUNICIPAL_14_METRICS[key.slice(7)]:({sector:'Sektori',satisfaction:'Kënaqësia vendore',relation:'Marrëdhënia me komunën',localSupport:'Mbështetja vendore',publicSupport:'Mbështetja publike'})[key];
        // Remaining contract interval, not a forecast of future delivery.
        var pending=1-c.processedFraction;if(pending<=1e-10)pending=0;
        var text=(label||key)+': '+fraction(c.appliedFraction)+' të zbatuara; '+fraction(c.blockedFraction)+' të bllokuara; '+fraction(c.inheritedFraction)+' historikisht të paverifikueshme; '+fraction(pending)+' ende të papërpunuara.';
        if(c.blockedFraction>0)text+=' '+(c.reason||'Arsyeja e bllokimit nuk është regjistruar.');
        return '<li data-effect-component="'+e(key)+'">'+e(text)+'</li>';
    }).join('');
    return physical+'<p>Gjendja e efekteve të kontraktuara (pjesë të secilit komponent):</p><ul>'+rows+'</ul><p>Pjesët e zbatuara nuk janë rritje neto e matur e indeksit; kufijtë dhe rrumbullakimi mund ta kufizojnë ndryshimin. Pjesa e bllokuar nuk kompensohet automatikisht; pjesa historikisht e paverifikueshme nuk është provë realizimi.</p>';
}
function municipalInfrastructureRecord(r){
    var p=r.project,e=catalogEscape,componentDetails=['transport','energy'].includes(p.field)||['TRANSPORT','ENERGY_EFF'].includes(p.type),draft=r.source==='development' && p.status==='PROPOSED';
    var sector=state.stateSectors.find(function(s){return s.id===(p.sector||p.sectorId);});
    var text=p.municipal14?municipalContractEffectText(p):p.benefits?.muniGains?'Përfitimet e kontraktuara vetëm në përfundim: '+infrastructureBenefitText(p.benefits.muniGains)+'.':'Kontrata e efekteve nuk është regjistruar; përcaktohet në nisje.';
    if(componentDetails){
        var components=p.effectComponents?.components;
        if(components)Object.keys(components).forEach(function(key){var c=components[key],label=key.startsWith('metric:')?MUNICIPAL_14_METRICS[key.slice(7)]:({sector:'Sektori',satisfaction:'Kënaqësia vendore',relation:'Marrëdhënia me komunën',localSupport:'Mbështetja vendore',publicSupport:'Mbështetja publike'})[key];text+=' '+(label||key)+': '+(c.appliedFraction*100).toFixed(0)+'% i aplikuar, '+(c.blockedFraction*100).toFixed(0)+'% i bllokuar, '+(c.inheritedFraction*100).toFixed(0)+'% historik i paverifikueshëm.';});
        else if(p.effectsApplied || p.appliedFraction>0)text+=' Shënuesit historikë nuk vërtetojnë realizimin e çdo komponenti.';
        if(p.status==='COMPLETED' && !p.effectsApplied)text+=' Përfundimi fizik nuk konfirmon realizimin e të gjitha efekteve.';
        text+=' '+projectEffectIssues(p).join(' ');
    }
    if(p.field==='environment' || ['ENVIRONMENT','GREEN_SPACE'].includes(p.type)){
        var sectorGain=p.municipal14?p.sectorGain:p.benefits?.sectorGain;
        if(Number.isFinite(sectorGain))text+=' Përfitimi sektorial i kontraktuar: +'+sectorGain+' / 100, brenda kufirit ekzistues.';
    }
    var effectDetails=['ROAD','WATER','ENVIRONMENT','GREEN_SPACE'].includes(p.type)||['water','environment'].includes(p.field)?municipalEffectPresentation(p):'';
    var action=p.municipal14?'<button class="action-btn" onclick="openMunicipalProject14('+e(JSON.stringify(p.id))+')">Ecuria dhe financimi</button>':draft?'<button class="action-btn" onclick="openDevelopmentProjectModal('+e(JSON.stringify(p.id))+')">Plotëso dhe nis draftin</button>':'';
    return '<article class="candidate-card" data-infrastructure-record="'+e(r.key)+'"><strong>'+e(p.title||p.name)+'</strong><p>'+e(draft?'Draft — ende pa financim':(effectDetails?'Statusi fizik: ':'')+(p.field==='environment'?(MUNICIPAL_14_STATUS[p.status]||stateDevelopmentStatus(p)):stateDevelopmentStatus(p)))+' · Progresi: '+(Number.isFinite(p.progress)?p.progress.toFixed(0)+'%':'I paregjistruar')+'</p><p>Kosto: '+(Number.isFinite(p.costB)?municipal14Money(p.costB):Number.isFinite(p.costM)?'€'+p.costM.toFixed(2)+'M':'E paregjistruar')+' · Afati: '+(Number.isInteger(p.duration||p.weeksTotal)?(p.duration||p.weeksTotal)+' javë':'I paregjistruar')+'</p><details><summary>Detajet dhe efektet</summary><p>'+e(p.desc||p.description||'Pa përshkrim të regjistruar')+'</p><p>Sektori: '+e(sector?.name||'Nuk është regjistruar')+'</p><p>'+e(text)+'</p>'+effectDetails+'<p>Pjesët e komponentëve nuk janë rritje neto e indeksit. Tavani dhe rrumbullakimi mund të kufizojnë ndryshimin.</p></details>'+action+'</article>';
}

// Shared read-only sector projection; no separate catalogue or project lifecycle.
function municipalServiceData(st,mid,field,type,metric){
    var municipality=st.municipalities.find(function(m){return m.id===mid;});if(!municipality)return null;
    var value=st.municipalityProfiles?.[mid]?.[metric];
    var result={municipality:municipality,
        projects:municipal14Records(st).filter(function(p){return p.municipalityId===mid && p.field===field;}),
        registered:stateDevelopmentRecords(st).filter(function(r){return r.municipalityId===mid && (r.project.field===field||r.project.type===type);})};
    result[metric]=municipalMetricValid(st.municipalityProfiles?.[mid],metric)?value:null;
    return result;
}
function municipalHealthData(st,mid){return municipalServiceData(st,mid,'health','HEALTH','health');}
function municipalContractEffectText(p){
    if(!Number.isFinite(p.metricGain)||p.metricGain<0)return 'Efekti i planifikuar nuk është regjistruar.';
    var text='Përfitimi i plotë i planifikuar: +'+p.metricGain.toFixed(2)+' pikë të indeksit /10. ';
    text+=p.effectMode==='GRADUAL'?'Efekt gradual sipas progresit. ':p.effectMode==='COMPLETION'?'Efekt vetëm në përfundim sipas kontratës. ':'Koha e zbatimit të efektit nuk është regjistruar. ';
    if(Number.isFinite(p.appliedFraction)&&p.appliedFraction>=0&&p.appliedFraction<=1)text+='Pjesa e kontratës e përpunuar: '+(p.appliedFraction*100).toFixed(0)+'%. ';
    else text+='Pjesa e efektit të përpunuar nuk është regjistruar. ';
    return text+'Kjo nuk është rritje neto e matur: kufiri 10, rrumbullakimi dhe ndërhyrjet e tjera mund të ndikojnë te vlera aktuale.';
}
function municipalHealthEffectText(p){return municipalContractEffectText(p);}
function renderMunicipalHealth(mid){
    var host=document.getElementById('municipalHealthPanel');if(!host)return;
    mid=mid||document.getElementById('healthMunicipality')?.value||state.municipalities[0]?.id;
    var data=municipalHealthData(state,mid),e=catalogEscape;
    if(!data){host.innerHTML='<p role="status">Komuna nuk është e disponueshme.</p>';return;}
    var options=state.municipalities.map(function(m){return '<option value="'+e(m.id)+'" '+(m.id===mid?'selected':'')+'>'+e(m.name)+'</option>';}).join('');
    var templates=data.projects.map(function(p){return '<div data-health-project="'+e(p.id)+'">'+municipal14Card(p)+'<p>'+e(municipalHealthEffectText(p))+'</p>'+municipalEffectPresentation(p)+'</div>';}).join('');
    var registered=data.registered.map(function(r){
        var p=r.project,draft=r.source==='development'&&p.status==='PROPOSED';
        var action=p.municipal14?'<button class="action-btn" onclick="openMunicipalProject14('+e(JSON.stringify(p.id))+')">Shqyrtimi dhe financimi</button>':draft?'<button class="action-btn" onclick="openDevelopmentProjectModal('+e(JSON.stringify(p.id))+')">Plotëso dhe nis draftin</button>':'';
        var gain=p.benefits?.muniGains?.health;
        var effect=p.municipal14?municipalHealthEffectText(p):Number.isFinite(gain)?'Përfitimi i planifikuar në përfundim: +'+Math.round(gain/5)+' pikë /10, me kufi 10. ':'Përfitimi caktohet nga lloji ekzistues i projektit kur niset; ende pa kontratë efektesh.';
        return '<article class="candidate-card" data-health-record="'+e(r.key)+'"><h4>'+e(p.title||p.name)+'</h4><p>'+e(data.municipality.name)+' · '+e(draft?'Draft — ende pa financim':'Statusi fizik: '+stateDevelopmentStatus(p))+'</p><p>Kosto: '+(Number.isFinite(p.costB)?municipal14Money(p.costB):Number.isFinite(p.costM)?'€'+p.costM.toFixed(2)+'M':'Nuk është regjistruar')+' · Afati i planifikuar: '+(Number.isInteger(p.duration||p.weeksTotal)?(p.duration||p.weeksTotal)+' javë':'Nuk është regjistruar')+'</p><p>'+e(p.desc||p.description||'Pa përshkrim shtesë të regjistruar.')+'</p>'+(Number.isFinite(p.progress)?'<progress max="100" value="'+p.progress+'" aria-label="Progresi i projektit shëndetësor"></progress><p>Progresi: '+p.progress.toFixed(0)+'%</p>':'<p>Progresi nuk është regjistruar.</p>')+'<p>'+e(effect)+'</p>'+municipalEffectPresentation(p)+action+'</article>';
    }).join('');
    host.innerHTML='<h3>Shërbimet shëndetësore komunale</h3><label>Komuna e shërbimeve shëndetësore<select id="healthMunicipality" onchange="renderMunicipalHealth(this.value)">'+options+'</select></label><article class="candidate-card"><strong>Indeksi i simuluar i shëndetësisë</strong><p id="municipalHealthValue" role="status">'+(data.health===null?'Nuk është regjistruar':data.health.toFixed(2)+' / 10')+'</p><p>Shkalla 1–10; më lart do të thotë gjendje më e mirë në model. Nivelet fillestare janë të simuluara. Nuk mat përqindje mbulimi, pacientë, mjekë, shtretër ose rezultate klinike. Kënaqësia vendore është tregues tjetër.</p></article><h4>Modelet shëndetësore ekzistuese të komunës</h4><div class="grid-2">'+(templates||'<p>Nuk ka model shëndetësor në katalog për këtë komunë. Kjo nuk do të thotë se nuk ka nevoja shëndetësore.</p>')+'</div><div class="candidate-actions">'+(agendaExecutive()?'<button class="action-btn" id="newMunicipalHealthProject" onclick="openMunicipalHealthProject()">Projekto shërbim shëndetësor</button>':'<p>Miratimi dhe financimi kërkojnë autoritetin qeveritar ekzistues.</p>')+'</div><p>Formulari i përgjithshëm përdor llojin HEALTH dhe përfitime në përfundim. Projektet e katalogut ruajnë efektet graduale ose përfundimtare të kontratës së tyre.</p><h4>Projektet shëndetësore të regjistruara</h4><div class="grid-2">'+(registered||'<p>Ende pa projekte shëndetësore të regjistruara për këtë komunë.</p>')+'</div>';
    polishDevelopmentSurface(host);
}
function openMunicipalHealthProject(){
    var mid=document.getElementById('healthMunicipality')?.value;
    if(!municipalHealthData(state,mid))return false;
    if(!assertGovernmentAuthority('Projektimi shëndetësor komunal'))return false;
    if(openDevelopmentProjectModal()===false)return false;
    var cat=DEVELOPMENT_PROJECT_CATALOG.find(function(c){return c.type==='HEALTH';});
    document.getElementById('devProjMuni').value=mid;document.getElementById('devProjType').value=cat.type;
    document.getElementById('devProjName').value=cat.name;document.getElementById('devProjDesc').value='Projekt i simuluar i shërbimit shëndetësor komunal.';
    document.getElementById('devProjCost').value=cat.costRangeM[0];document.getElementById('devProjWeeks').value=cat.weeksRange[0];
    updateDevProjectPreview();
    document.getElementById('devProjPreview').innerHTML+='<p>Indeksi shëndetësor: deri +'+Math.round(cat.muniHealthGain/5)+' pikë /10 vetëm pas përfundimit, me kufi 10. Financimi paguhet një herë në nisje; drafti nuk paguan.</p>';
    return true;
}

function municipalEducationData(st,mid){return municipalServiceData(st,mid,'education','SCHOOL','education');}
function municipalEducationEffectText(p){
    var gain=p.benefits?.muniGains?.education;
    var text=p.municipal14?municipalContractEffectText(p):Number.isFinite(gain)?'Përfitimi i kontraktuar arsimor: +'+Math.round(gain/5)+' pikë /10 vetëm në përfundim, me kufi 10.':'Kontrata e efekteve arsimore nuk është regjistruar; formulari SCHOOL e cakton në nisje.';
    var component=p.effectComponents?.components?.['metric:education'];
    if(component){
        text+=' Komponenti arsimor: '+(component.appliedFraction*100).toFixed(0)+'% i aplikuar, '+(component.blockedFraction*100).toFixed(0)+'% i bllokuar, '+(component.inheritedFraction*100).toFixed(0)+'% historik i paverifikueshëm. Këto janë pjesë të efektit të kontraktuar, jo rritje e indeksit.';
    }else if(p.effectsApplied || p.appliedFraction>0)text+=' Shënuesi historik i përbashkët nuk provon realizimin e çdo komponenti.';
    if(p.status==='COMPLETED' && !p.effectsApplied)text+=' Dorëzimi fizik është përfunduar; realizimi i të gjitha efekteve nuk është konfirmuar.';
    var issues=projectEffectIssues(p);if(issues.length)text+=' '+issues.join(' ');
    return text;
}
function renderMunicipalEducation(){
    var host=document.getElementById('municipalEducationPanel');if(!host)return;
    var mid=document.getElementById('developmentCityFilter')?.value||'',data=municipalEducationData(state,mid),e=catalogEscape;
    var projects=data?data.projects:municipal14Records(state).filter(function(p){return p.field==='education';});
    var metric=data?(data.education===null?'Nuk është regjistruar':data.education.toFixed(2)+' / 10'):'Zgjidhni një komunë';
    function card(p){
        var error=municipalFundingMetricError(state,p.municipalityId,{[p.metric]:p.metricGain});
        return '<div data-education-project="'+e(p.id)+'">'+municipal14Card(p)+'<p>'+e(municipalEducationEffectText(p))+'</p>'+(!p.fundingCommitted && error?'<p role="status">'+e(error)+' Propozimi mund të shqyrtohet, por financimi kërkon të dhëna të vlefshme.</p>':'')+'</div>';
    }
    var records=data?data.registered.map(function(r){
        var p=r.project,draft=r.source==='development' && p.status==='PROPOSED';
        var action=p.municipal14?'<button class="action-btn" onclick="openMunicipalProject14('+e(JSON.stringify(p.id))+')">Shqyrtimi dhe financimi</button>':draft?'<button class="action-btn" onclick="openDevelopmentProjectModal('+e(JSON.stringify(p.id))+')">Plotëso dhe nis draftin</button>':'';
        return '<article class="candidate-card" data-education-record="'+e(r.key)+'"><h4>'+e(p.title||p.name)+'</h4><p>'+e(data.municipality.name)+' · '+e(draft?'Draft — ende pa financim':stateDevelopmentStatus(p))+'</p><p>Kosto: '+(Number.isFinite(p.costB)?municipal14Money(p.costB):Number.isFinite(p.costM)?'€'+p.costM.toFixed(2)+'M':'Nuk është regjistruar')+' · Afati: '+(Number.isInteger(p.duration||p.weeksTotal)?(p.duration||p.weeksTotal)+' javë':'Nuk është regjistruar')+'</p><p>'+e(p.desc||p.description||'Pa përshkrim të regjistruar.')+'</p>'+(Number.isFinite(p.progress)?'<progress max="100" value="'+p.progress+'" aria-label="Progresi i projektit arsimor"></progress><p>Progresi: '+p.progress.toFixed(0)+'%</p>':'<p>Progresi nuk është regjistruar.</p>')+'<p>'+e(municipalEducationEffectText(p))+'</p>'+action+'</article>';
    }).join(''):'';
    host.innerHTML='<h3>Kushtet arsimore komunale</h3><p>Komuna: <strong>'+e(data?data.municipality.name:'E papërzgjedhur')+'</strong>. Përdorni filtrin “Qyteti ose komuna” te lista “Projektet Zhvillimore”.</p><article class="candidate-card"><strong>Indeksi i simuluar i kushteve arsimore</strong><p id="municipalEducationValue" role="status">'+metric+'</p><p>Shkalla 1–10; më lart tregon kushte më të mira sipas modelit. Nivelet fillestare janë të simuluara. Nuk mat rezultate akademike, numër nxënësish, staf ose kapacitet shkollor.</p></article>'+(!data?'<p role="status">Zgjidhni një komunë për indeksin, formularin SCHOOL dhe projektet e regjistruara. Më poshtë janë të 13 modelet arsimore ekzistuese.</p>':'')+'<h4>Modelet arsimore ekzistuese'+(data?' të komunës':' — të gjitha komunat')+'</h4><div class="grid-2">'+(projects.map(card).join('')||'<p>Nuk ka model arsimor në katalog për këtë komunë. Kjo nuk provon mungesë nevojash arsimore.</p>')+'</div>'+(data && agendaExecutive()?'<div class="candidate-actions"><button class="action-btn" id="newMunicipalEducationProject" onclick="openMunicipalEducationProject()">Projekto kushte arsimore</button></div><p>Formulari SCHOOL përdor financimin ekzistues dhe efektet vetëm në përfundim. Drafti nuk kryen pagesë; nisja kërkon të gjitha metrikat e kontraktuara.</p>':'')+'<h4>Projektet arsimore të regjistruara</h4><div class="grid-2">'+(records||'<p>'+(data?'Ende pa projekte arsimore të regjistruara për këtë komunë.':'Përzgjidhni një komunë për të parë regjistrin e saj.')+'</p>')+'</div>';
    polishDevelopmentSurface(host);
}
function openMunicipalEducationProject(){
    var mid=document.getElementById('developmentCityFilter')?.value;
    if(!municipalEducationData(state,mid))return false;
    if(!assertGovernmentAuthority('Projektimi arsimor komunal'))return false;
    if(openDevelopmentProjectModal()===false)return false;
    var cat=DEVELOPMENT_PROJECT_CATALOG.find(function(c){return c.type==='SCHOOL';});
    document.getElementById('devProjMuni').value=mid;document.getElementById('devProjType').value=cat.type;
    document.getElementById('devProjName').value=cat.name;document.getElementById('devProjDesc').value='Projekt i simuluar i kushteve arsimore komunale.';
    document.getElementById('devProjCost').value=cat.costRangeM[0];document.getElementById('devProjWeeks').value=cat.weeksRange[0];
    updateDevProjectPreview();
    var error=municipalFundingMetricError(state,mid,developmentMunicipalGains(cat));
    document.getElementById('devProjPreview').innerHTML+='<p>Indeksi arsimor: deri +'+Math.round(cat.muniEducGain/5)+' pikë /10 vetëm në përfundim, me kufi 10. Drafti mund të ruhet pa pagesë.</p>'+(error?'<p role="status">'+catalogEscape(error)+'</p>':'');
    return true;
}
/* Presentation only: keep the existing project records and action handlers. */
function developmentInfoHeading(node,host){
    for(var current=node;current&&current!==host.parentElement;current=current.parentElement){
        for(var previous=current.previousElementSibling;previous;previous=previous.previousElementSibling){
            if(previous.matches('h2,h3,h4,h5,.card-title,strong'))return previous;
            var heading=previous.querySelector('.development-heading > :first-child,.card-title');if(heading)return heading;
        }
        if(current===host)break;
    }
    return host.querySelector('h2,h3,h4,h5,.card-title');
}
function developmentInfo(heading,paragraph){
    if(!heading)return;var row=heading.closest('.development-heading');
    if(!row){row=document.createElement('div');row.className='development-heading';heading.before(row);row.append(heading);}
    var info=row.querySelector(':scope > .development-info');
    if(!info){info=document.createElement('details');info.className='development-info';var summary=document.createElement('summary');summary.textContent='ℹ️';summary.setAttribute('aria-label','Informacion për '+heading.textContent.trim());var copy=document.createElement('div');copy.className='development-info-copy';info.append(summary,copy);row.append(info);info.addEventListener('toggle',function(){if(info.open)document.querySelectorAll('.development-info[open]').forEach(other=>{if(other!==info)other.open=false;});});}
    info.querySelector('.development-info-copy').append(paragraph);
}
function polishDevelopmentSurface(host){
    if(!host?.querySelectorAll)return;host.classList.add('development-surface');
    host.querySelectorAll('p').forEach(function(p){
        if(p.closest('details,.development-empty')||p.getAttribute('role')==='status')return;
        var text=p.textContent.trim();
        if(/^(Ende pa|Nuk ka (?:projekte|model)|Përzgjidhni një komunë për të parë)/i.test(text)){
            var box=document.createElement('div');box.className='development-empty';box.setAttribute('role','status');
            var icon=document.createElement('span');icon.className='development-empty-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3z"/></svg>';
            var title=document.createElement('strong');title.textContent=/model/i.test(text)?'Nuk ka modele për këtë komunë':/Përzgjidhni/i.test(text)?'Zgjidhni një komunë':'Ende pa projekte të regjistruara';var note=document.createElement('p');note.textContent=/filtra/i.test(text)?'Ndryshoni filtrat për të parë projektet.':'Projektet e reja do të shfaqen këtu.';box.append(icon,title,note);p.replaceWith(box);return;
        }
        if(p.querySelector('strong')){
            Array.from(p.childNodes).forEach(function(n){if(n.nodeType===3&&/^\.\s/.test(n.textContent)&&n.textContent.trim().length>45){var note=document.createElement('p');note.textContent=n.textContent.replace(/^\.\s*/, '');n.remove();developmentInfo(developmentInfoHeading(p,host),note);}});return;
        }
        if(text.length>120&&!/^(Kosto|Nisja|Progresi|Statusi|Afati)/i.test(text)&&!p.id)developmentInfo(developmentInfoHeading(p,host),p);
    });
    host.querySelectorAll('.grid-2,.grid-3,#developmentProjectList').forEach(grid=>grid.classList.add('development-project-grid'));
    host.querySelectorAll('.candidate-card').forEach(function(card){
        card.classList.add('development-project-card');var parent=card.parentElement;
        if(parent.classList.contains('development-project-grid')||!parent.matches('.card,[id$="Projects"]'))return;
        var grid=document.createElement('div');grid.className='development-project-grid';card.before(grid);
        for(var current=card;current&&current.matches('.candidate-card');){var next=current.nextElementSibling;grid.append(current);current=next;}
    });
}
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.development-info[open]').forEach(info=>{info.open=false;info.querySelector('summary').focus();});});
