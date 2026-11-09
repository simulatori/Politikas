/* Extends electoralMemory: one history, the existing four groups, no second vote bonus. */
const civicSourcesBase=electoralMemorySources,civicInit=initialiseProduction,civicPrepare=prepareLoadedState,civicValidate=validateLoadedState,civicTax=interestTaxDecision,civicGroupsRender=renderInterestGroups;
function civicMemorySources(st){
 const rows=[],gov=electoralGovernor(st);
 for(const d of st.publicFinance?.decisions||[])if(d.kind==='TAX'&&d.oldVat!==d.data.vat)rows.push({key:'civic:tax:'+d.id,status:'RECORDED',party:d.civicOwner||gov,city:null,title:(d.data.vat>d.oldVat?'Rritja':'Ulja')+' e TVSH-së: '+d.oldVat+'% → '+d.data.vat+'%',kind:'POLICY',score:d.data.vat>d.oldVat?-.5:.5,sector:'sec_econ',context:'TAX'});
 for(const d of st.publicFinance?.decisions||[])if(d.kind==='TAX'&&(st.publicFinance.decisions||[]).some(previous=>previous.kind==='TAX'&&previous.id!==d.id&&previous.startTurn<d.startTurn&&d.startTurn-previous.startTurn<=12&&(previous.civicOwner||gov)===(d.civicOwner||gov)))rows.push({key:'civic:tax-volatility:'+d.id,status:'RECORDED',party:d.civicOwner||gov,city:null,title:'Ndryshime të shpeshta tatimore brenda 12 javëve',kind:'POLICY',score:-.5,sector:'sec_econ',context:'TAX_VOLATILITY'});
 for(const r of st.ministerPerformance?.reviews||[]){const t=st.ministerPerformance.terms.find(t=>t.id===r.termId),sector=({mashti:'sec_edu',msh:'sec_health',mfpt:'sec_econ',mpb:'sec_police',mmphi:'sec_roads',mbpzhr:'sec_agri'})[t?.ministryId];if(!t||!sector||r.score>40&&r.score<80)continue;rows.push({key:'civic:review:'+r.id,status:'REVIEWED',party:t.party,city:null,title:(r.score>=80?'Shërbime të financuara dhe të administruara mirë':'Dështim në financim ose administrim')+' · '+(st.ministries.find(m=>m.id===t.ministryId)?.name||t.ministryId),kind:'SERVICE',score:r.score>=80?.5:-.5,sector,context:'SERVICES'});}
 for(const [sector,r] of Object.entries(st.unions?.sectors||{}))for(const a of r.forceActions||[])rows.push({key:'civic:union:'+sector+':'+a.turn,status:'RECORDED',party:gov,city:null,title:'Ndërhyrje me forcë ndaj '+(UNION_SECTORS[sector]?.name||sector),kind:'POLICY',score:-1,sector,context:'LABOR'});
 for(const b of st.foreignInvestments?.bidders||[]){const investor=fdiInvestor(b.investorId);for(const [phase,done,score] of [['completed',Number.isInteger(b.completedTurn),.5],['failed',Number.isInteger(b.failedTurn),-.5]])rows.push({key:'civic:investment:'+b.id+':'+phase,status:done?'RECORDED':'WAITING',party:gov,city:null,title:phase==='completed'?'Investim i realizuar · '+(investor?.jobs||0)+' vende pune të raportuara':'Projekt IHD i dështuar',kind:'SERVICE',score:done?score:0,sector:'sec_econ',context:'EMPLOYMENT'});}
 for(const j of st.opposition?.shadow?.jobs||[])if(j.status==='COMPLETED'&&j.result)rows.push({key:'shadow:'+j.id,status:j.result,party:j.owner,city:null,title:j.result==='PLAN'?'Alternativë e përgatitur: '+SHADOW_PORTFOLIOS[j.portfolio].title:j.result==='VERIFIED'?'Raport me prova publike: '+SHADOW_PORTFOLIOS[j.portfolio].title:'Akuzë pa prova: '+SHADOW_PORTFOLIOS[j.portfolio].title,kind:'SHADOW',score:j.result==='UNSUPPORTED'?-1:.5,sector:SHADOW_PORTFOLIOS[j.portfolio].sector,context:j.result});
 return rows;
}
electoralMemorySources=function(st){return civicSourcesBase(st).concat(civicMemorySources(st));};
function migrateCivicMemory(st){
 migrateElectoralMemory(st);if(st.electoralMemory.civic!==undefined)return;
 st.electoralMemory.civic={version:1,startTurn:st.turnCount};
 // Existing saves start observation here; never award retrospective policy bonuses.
 for(const s of civicMemorySources(st))if(!st.electoralMemory.observed[s.key])st.electoralMemory.observed[s.key]={status:s.status,party:s.party};
}
initialiseProduction=function(st){civicInit(st);migrateCivicMemory(st);};
prepareLoadedState=function(raw){const st=civicPrepare(raw);migrateCivicMemory(st);return st;};
interestTaxDecision=function(d,rates){d.civicOwner=electoralGovernor(state);return civicTax(d,rates);};
function civicEventSector(st,event){
 if(event.sector)return event.sector;
 const s=event.source;if(s.startsWith('promise:')){const p=st.promises.find(p=>'promise:'+p.id===s);return p?.electoralGoal?.sector||SPECIAL_PLEDGES[p?.specialPromise?.code]?.sector;}
 if(s.startsWith('project:'))return municipal14Records(st).find(p=>'project:'+p.id===s)?.sector;
 if(s.startsWith('development:'))return st.developmentProjects.find(p=>'development:'+p.id===s)?.sector;
 if(s.startsWith('route:'))return 'sec_roads';
 return null;
}
function civicGroupWeights(st,event){
 if(event.context==='TAX')return {youth:.5,pensioners:.5,business:2,public:-1};
 if(event.context==='TAX_VOLATILITY')return {youth:.5,pensioners:.5,business:2,public:.5};
 if(event.context==='LABOR')return {youth:.5,pensioners:.8,business:.3,public:2};
 if(event.context==='EMPLOYMENT')return {youth:2,pensioners:.3,business:1.5,public:.3};
 const sector=civicEventSector(st,event);
 return ({sec_edu:{youth:2,pensioners:.3,business:.6,public:1.2},sec_health:{youth:.7,pensioners:1.8,business:.4,public:1.5},sec_econ:{youth:1.1,pensioners:.3,business:2,public:.5},sec_agri:{youth:.7,pensioners:.5,business:1.8,public:.4},sec_social:{youth:.6,pensioners:2,business:.2,public:1},sec_roads:{youth:1,pensioners:.5,business:1.5,public:.6},sec_police:{youth:.8,pensioners:1,business:1,public:1.4}})[sector]||{youth:1,pensioners:1,business:1,public:1};
}
function civicEventValue(event,turn){return event.score*Math.max(0,1-(turn-event.turn)/(event.score<0?144:96));}
function civicGroupScore(st,party,group,turn=st.turnCount){return +clamp((st.electoralMemory?.events||[]).filter(e=>e.party===party&&e.turn<=turn).reduce((sum,e)=>sum+civicEventValue(e,turn)*civicGroupWeights(st,e)[group],0),-8,8).toFixed(4);}
function electoralPromiseCredibility(st,party){
 const events=(st.electoralMemory?.events||[]).filter(e=>e.party===party&&e.turn<=st.turnCount),promises=events.filter(e=>e.kind==='PROMISE').reduce((n,e)=>n+civicEventValue(e,st.turnCount),0),alternatives=events.filter(e=>e.kind==='SHADOW').reduce((n,e)=>n+civicEventValue(e,st.turnCount),0);
 return +clamp(1+promises*.06+alternatives*.025,.5,1.15).toFixed(4);
}
var civicMemoryParty=null;
function setCivicMemoryParty(party){if(!state.parties[party])return false;civicMemoryParty=party;renderInterestGroups();return true;}
function civicMemoryMarkup(st){
 const party=st.parties[civicMemoryParty]?civicMemoryParty:st.playerParty,e=catalogEscape,events=(st.electoralMemory?.events||[]).filter(x=>x.party===party).slice().reverse(),cred=electoralPromiseCredibility(st,party);
 const evidence=(rows,group)=>rows.length?'<ul>'+rows.slice(0,4).map(x=>{const value=group?civicEventValue(x,st.turnCount)*civicGroupWeights(st,x)[group]:x.score;return '<li><strong>'+e(x.title)+'</strong><small>Java '+x.turn+' · '+(value>0?'+':'')+value.toFixed(2)+(group?' pikë aktuale te ky grup':' pikë fillestare')+'</small></li>';}).join('')+'</ul>':'<p class="muted">Ende pa vendime të reja të regjistruara për këtë grup.</p>';
 return '<section id="civicMemoryPanel"><h3>Si të gjykon elektorati</h3><label>Partia<select id="civicMemoryParty" onchange="setCivicMemoryParty(this.value)">'+Object.entries(st.parties).map(([id,p])=>'<option value="'+e(id)+'" '+(id===party?'selected':'')+'>'+e(p.short)+'</option>').join('')+'</select></label><p>Besueshmëria e premtimeve të reja: <strong>'+Math.round(cred*100)+'%</strong> e efektit bazë të fushatës. Premtimet e pambajtura dhe akuzat pa prova e ulin; rezultatet e mbajtura e rrisin.</p><div class="civic-memory-grid">'+Object.entries(INTEREST_GROUPS).map(([group,def])=>{const score=civicGroupScore(st,party,group),rows=events.filter(x=>Math.abs(civicGroupWeights(st,x)[group])>0);return '<article class="civic-memory-card"><h4>'+e(def.label)+'</h4><strong class="'+(score<0?'cash-negative':'cash-positive')+'">'+(score>0?'+':'')+score.toFixed(1)+' / 8 · kujtesë</strong><p>'+e(score>=2?'Rezultatet kanë krijuar besim.':score<=-2?'Ka zhgënjim nga historia e vendimeve.':'Elektorati pret rezultate bindëse.')+'</p><details><summary>Arsyet konkrete</summary>'+evidence(rows,group)+'</details></article>';}).join('')+'<article class="civic-memory-card"><h4>Komunat</h4><p>Projektet lokale mbeten të lidhura me komunën ku u realizuan.</p>'+evidence(events.filter(x=>x.city))+'<button class="action-btn" onclick="switchMainTab(\'tab-elections\');switchSubTab(\'elec\',\'municipalities\',document.querySelector(\'[onclick*=municipalities]\'))">Harta dhe komunat</button></article></div><p class="muted">Kujtesa është histori e partisë, jo përqindje sondazhi. Përdoret i njëjti ndikim i kufizuar zgjedhor që ekziston në lojë; nuk shtohet një bonus i dytë. Sukseset zbehen për 96 javë, dështimet për 144.</p></section>';
}
renderInterestGroups=function(){civicGroupsRender();const host=document.getElementById('interestGroupsPanel');if(host)host.innerHTML+=civicMemoryMarkup(state);};
function validateCivicMemory(st){
 const d=st.electoralMemory?.civic;if(d!==undefined&&(!d||d.version!==1||!Number.isInteger(d.startTurn)||d.startTurn<0||d.startTurn>st.turnCount))throw Error('Kujtesa politike e grupeve është e pavlefshme.');
 const sources=new Map(civicMemorySources(st).map(s=>[s.key,s]));
 for(const x of st.electoralMemory?.events||[])if(['POLICY','SERVICE','SHADOW'].includes(x.kind)){const s=sources.get(x.source);if(!s||s.kind!==x.kind||s.score!==x.score||s.title!==x.title||s.sector!==x.sector||s.context!==x.context||x.city!==s.city||!d||x.turn<d.startTurn||x.party!==st.electoralMemory.observed[x.source].party)throw Error('Kujtesë politike pa vendim ose rezultat burimor.');}
 for(const decision of st.publicFinance?.decisions||[])if(decision.civicOwner!==undefined&&!st.parties[decision.civicOwner])throw Error('Pronari politik i vendimit fiskal është i pavlefshëm.');
}
validateLoadedState=function(st){civicValidate(st);validateCivicMemory(st);return st;};
