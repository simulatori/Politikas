/* Party and municipal stories reuse native nominations, ballots, people and money. */
const episodeFresh=createFreshState,episodePrepare=prepareLoadedState,episodeValidate=validateLoadedState,
 episodeWeek=processPoliticalLifeWeek,episodeLocalWeek=processLocalElectionsWeek,
 episodeWeights=localWeights,episodeCount=countLocalRound,episodeRender=renderLocalElections,
 episodeRefresh=refreshAllUI,episodeToggle=toggleModal,episodeInterrupt=worldAttentionInterrupt,episodeMayor=applyLocalMayor;
function episodeDB(st=state){return st.governance?.partyGround?.politics;}
function migratePartyEpisodes(st){const d=partyGroundDB(st);if(d&&!d.politics)d.politics={version:1,lastTurn:st.turnCount,lastPresentedTurn:null,records:[],councils:[]};}
createFreshState=function(...a){const st=episodeFresh(...a);migratePartyEpisodes(st);return st;};
prepareLoadedState=function(...a){const st=episodePrepare(...a);migratePartyEpisodes(st);return st;};
function episodeFind(id,st=state){return episodeDB(st)?.records.find(e=>e.id===id);}
function episodeAdd(kind,key,data={}){const d=episodeDB();if(d.records.some(e=>e.key===key||e.kind===kind&&['OPEN','WORKING'].includes(e.status)))return null;const e={id:'party-episode:'+(d.records.length+1),key,kind,owner:state.playerParty,turn:state.turnCount,dueTurn:state.turnCount+5,status:'OPEN',presentedTurn:null,choices:[],cost:0,result:null,...data};d.records.push(e);return e;}
function episodeLocal(e,st=state){const c=st.localElections?.cycles.find(c=>c.id===e.cycleId);return {c,m:c?.municipalities.find(m=>m.id===e.city)};}
function episodeCandidate(c,m){return m.pools[c.owner]?.find(p=>p.id===c.nominations[m.id]);}
function episodeCity(id,st=state){return st.municipalities.find(m=>m.id===id);}
function episodeCurrentMayor(e,st=state){const {c,m}=episodeLocal(e,st),city=episodeCity(e.city,st);return !!c&&!!m?.winner&&m.winner.party===e.owner&&city?.mayorParty===e.owner&&!city.mayorIndependent&&city.mayorName===m.winner.name;}
function episodeNominationOpen(c,m){return c&&['ANNOUNCED','CAMPAIGN'].includes(c.status)&&localCalendarOrdinal(state)<c.schedule.voteOrdinal&&!c.spending.some(s=>s.cityId===m.id);}
function episodeMetric(e,n){const city=episodeCity(e.city);if(city)city.localSupportPlayer=clamp((city.localSupportPlayer??35)+n,0,95);}
function episodeCohesion(n){const p=state.parties[state.playerParty];p.internalCohesion=clamp((p.internalCohesion??70)+n,0,100);}
function episodeCouncilSeats(m){
 // A transparent scenario proxy, not a second invented register of council ballots.
 const total=m.voters<10000?15:m.voters<30000?21:m.voters<70000?31:41;
 return {total,rows:localAllocateVotes(m.first.rows.map(r=>({party:r.party,weight:r.votes})),total,'council:'+m.id).map(r=>({party:r.party,seats:r.votes})),basis:'MAYORAL_FIRST_ROUND_PROXY'};
}
function episodeEnsureCouncils(c){const d=episodeDB();if(!d||!c.municipalities.some(m=>m.first))return;for(const m of c.municipalities){if(!m.first||d.councils.some(x=>x.cycleId===c.id&&x.city===m.id))continue;const seats=episodeCouncilSeats(m);d.councils.push({id:c.id+':council:'+m.id,cycleId:c.id,city:m.id,...seats,agreement:null});}}
countLocalRound=function(c,round){const result=episodeCount(c,round);episodeEnsureCouncils(c);return result;};
applyLocalMayor=function(c,m,result){const newWinner=!m.applied&&!!result.winner,r=episodeMayor(c,m,result);if(newWinner)episodeCity(m.id).mayorIndependent=false;return r;};
function processPartyEpisodes(turn){
 migratePartyEpisodes(state);const d=episodeDB();if(!d||turn!==state.turnCount||turn<=d.lastTurn)return;d.lastTurn=turn;
 for(const e of d.records.filter(e=>e.status==='WORKING'&&turn>=e.readyTurn)){
  const {c,m}=episodeLocal(e);
  if(e.kind==='SPLIT'){e.status='OPEN';e.presentedTurn=null;e.dueTurn=turn+2;e.result='Konsultimet përfunduan. Ekipi kërkon vendimin e kryesisë; asnjë koalicion nuk u lidh automatikisht.';}
  else if(e.kind==='PRIMARY'){
   if(!episodeNominationOpen(c,m)){e.status='CANCELLED';e.result='Afati i nominimit u mbyll; nuk ndryshohet lista e financuar.';continue;}
   const pool=m.pools[c.owner],rank=pool.filter(p=>e.candidates.includes(p.id)&&!c.municipalities.some(x=>x.id!==m.id&&c.nominations[x.id]===p.id)).map(p=>({id:p.id,score:p.popularity+(electionSeed(e.key+':primary:'+p.id)%2001)/100})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
   if(rank.length!==2){e.status='CANCELLED';e.result='Një kandidat mori një kandidaturë tjetër; votimi u anulua pa ndryshuar listën.';continue;}
   e.primaryResult=rank;e.winner=rank[0].id;c.nominations[e.city]=e.winner;e.status='RESOLVED';e.result=pool.find(p=>p.id===e.winner).name+' fitoi votimin e brendshëm. Rezultati nuk ndryshon me ringarkim.';episodeCohesion(2);
  }else if(e.kind==='MAYOR'){
   e.status='RESOLVED';if(!episodeCurrentMayor(e)){e.result='Mandati lokal ndryshoi; ndërhyrja e partisë u mbyll.';continue;}
   const p=state.municipalityProfiles[e.city],fields=e.fields||[];
   if(e.choices.at(-1)==='TEAM'){for(const field of fields)p[field]=clamp((p[field]||0)+.3,0,10);episodeMetric(e,2);e.result='Ekipi dorëzoi planin dhe asistencën teknike. Shërbimet përmirësohen gradualisht; nuk u financua një projekt publik nga thesari.';}
   else{episodeMetric(e,1);e.result='Raporti publik evidentoi gjendjen e shërbimeve dhe përgjegjësitë e komunës. Nuk pretendohet korrupsion pa prova.';}
  }if(e.status==='RESOLVED')e.presentedTurn=null;
 }
 for(const e of d.records.filter(e=>e.status==='OPEN')){const {c,m}=episodeLocal(e);if(['SPLIT','PRIMARY','DEBATE'].includes(e.kind)&&!['ANNOUNCED','CAMPAIGN'].includes(c?.status)||e.kind==='ENDORSE'&&m?.winner||['COUNCIL','MAYOR','SUCCESS','FLOOD'].includes(e.kind)&&!episodeCurrentMayor(e)){e.status='CANCELLED';e.result='Faza ose mandati ndryshoi; nuk kërkohet më ky vendim.';}else if(e.presentedTurn!==null&&turn>e.dueTurn){e.status='EXPIRED';e.result='Afati kaloi pa vendim.';if(['SPLIT','MAYOR'].includes(e.kind))episodeCohesion(-2);}}
 for(const prior of d.records.filter(e=>['ENDORSE','COUNCIL'].includes(e.kind)&&e.status==='RESOLVED'&&turn>=e.decisionTurn+4)){
  const {m}=episodeLocal(prior);if(!m?.winner)continue;
  if(prior.kind==='ENDORSE'&&prior.target&&m.winner.party===prior.target||prior.kind==='COUNCIL')episodeAdd('ACCOUNTABILITY',prior.key+':followup',{cycleId:prior.cycleId,city:prior.city,sourceId:prior.id,baseline:prior.baseline||{water:0,services:0}});
 }
 const c=activeLocalElection(state);
 if(c?.owner===state.playerParty){
  if(['ANNOUNCED','CAMPAIGN'].includes(c.status)){
   const available=c.municipalities.filter(m=>episodeCandidate(c,m));
   if(available.length&&groundLocalRegistry().length>=3)episodeAdd('SPLIT',c.id+':split',{cycleId:c.id,city:available[0].id,figure:episodeCandidate(c,available[0]).name,partner:Object.keys(state.parties).filter(p=>p!==c.owner).sort((a,b)=>(state.parties[b].poll||0)-(state.parties[a].poll||0))[0]});
   const city=available.find(m=>episodeNominationOpen(c,m)&&m.pools[c.owner].length>=2&&localCalendarOrdinal(state)+2<c.schedule.voteOrdinal);
   if(city)episodeAdd('PRIMARY',c.id+':primary:'+city.id,{cycleId:c.id,city:city.id,candidates:city.pools[c.owner].slice(0,2).map(p=>p.id)});
   if(c.status==='CAMPAIGN'){const m=available.find(m=>!d.records.some(e=>e.key===c.id+':debate:'+m.id));if(m)episodeAdd('DEBATE',c.id+':debate:'+m.id,{cycleId:c.id,city:m.id,candidateId:c.nominations[m.id],figure:episodeCandidate(c,m).name,proof:(partyGroundDB().promises.filter(p=>p.city===m.id).at(-1)?.status||'NO_PLEDGE')});}
  }
  if(c.status==='RUNOFF')for(const m of c.municipalities.filter(m=>!m.winner&&m.first.rows[2]?.party===c.owner))episodeAdd('ENDORSE',c.id+':endorse:'+m.id,{cycleId:c.id,city:m.id,finalists:[...m.first.finalists]});
 }
 for(const cycle of state.localElections?.cycles||[]){episodeEnsureCouncils(cycle);for(const m of cycle.municipalities){
  if(!m.winner)continue;
  const final=m.runoff||m.first,margin=final.rows[0].votes-(final.rows[1]?.votes||0);
  if(m.winner.party===cycle.owner&&cycle.owner===state.playerParty&&final.rows[1]&&margin<=Math.max(1,Math.ceil(final.validVotes*.01)))episodeAdd('RECOUNT',cycle.id+':recount:'+m.id,{cycleId:cycle.id,city:m.id,margin,digest:electionSeed(JSON.stringify(final))});
  if(m.winner.party!==state.playerParty||cycle.owner!==state.playerParty)continue;
  const council=d.councils.find(x=>x.cycleId===cycle.id&&x.city===m.id),own=council.rows.find(r=>r.party===state.playerParty)?.seats||0;
  if(own<=council.total/2)episodeAdd('COUNCIL',cycle.id+':council:'+m.id,{cycleId:cycle.id,city:m.id,councilId:council.id});
  const p=state.municipalityProfiles[m.id],fields=['water','education','health','services'].filter(k=>Number.isFinite(p?.[k])&&p[k]<5),now=episodeCity(m.id);
  if(!now.mayorIndependent&&now.mayorParty===state.playerParty&&now.mayorName===m.winner.name&&turn>=final.inputs.turn+6){
   if(fields.length)episodeAdd('MAYOR',cycle.id+':mayor:'+m.id,{cycleId:cycle.id,city:m.id,figure:m.winner.name,fields,baseline:Object.fromEntries(fields.map(k=>[k,p[k]]))});
   else episodeAdd('SUCCESS',cycle.id+':success:'+m.id,{cycleId:cycle.id,city:m.id,figure:m.winner.name});
  }
  const flood=state.nationalEmergencies?.events?.find(x=>x.kind==='FLOOD'&&x.status==='ACTIVE');
  if(!now.mayorIndependent&&now.mayorParty===state.playerParty&&now.mayorName===m.winner.name&&!agendaExecutive(state)){
   if(flood)episodeAdd('FLOOD',flood.id+':'+m.id,{cycleId:cycle.id,city:m.id,emergencyId:flood.id});
   else if(p?.water<4&&turn>=final.inputs.turn+12)episodeAdd('FLOOD',cycle.id+':flood-risk:'+m.id,{cycleId:cycle.id,city:m.id,emergencyId:null,riskWater:p.water});
  }
 }}
}
processPoliticalLifeWeek=function(turn){const r=episodeWeek(turn);processPartyEpisodes(turn);return r;};
processLocalElectionsWeek=function(turn){const r=episodeLocalWeek(turn);processPartyEpisodes(turn);return r;};
function episodeOptions(e){const {c,m}=episodeLocal(e);switch(e.kind){
 case 'SPLIT':return [e.stage===1?['COMPROMISE','Prano platformën e përbashkët të ekipit','Ruaj kandidatët dhe kërko bisedime vetëm për pika programore; nuk premtohen poste.']:['TALK','Dëgjo ekipin veçmas','Dy javë konsultime me degën; nuk nënshkruhet koalicion pa marrëveshjen ekzistuese.'],['VOTE','Vendos me votë në kryesi','Kryesia krahason garën më vete me bisedimet programore. Rezultati ruhet.'],['IMPOSE','Impono garën më vete','Mbyll diskutimin shpejt; dobëson kohezionin.']];
 case 'PRIMARY':return e.candidates.map((id,i)=>['PICK'+i,'Nomino '+(m?.pools[c.owner].find(p=>p.id===id)?.name||id),i?'Përkrahe alternativën e kërkuar nga dega.':'Ruaj propozimin fillestar të ekipit.']).concat([['PRIMARY','Votim i brendshëm · €25,000 · 2 javë','Anëtarët zgjedhin mes dy emrave. Nuk mund ta kontrollosh rezultatin ose të financosh kandidaturën gjatë votimit.']]);
 case 'DEBATE':return [['FACTS','Përgatit dosjen me ekspertë · €30,000','Krahaso shërbimet reale, premtimet e regjistruara dhe kompetencat e kryetarit.'],['LISTEN','Dëgjo banorët dhe prano kufijtë','Mos shpall të realizuar një zotim që ende pret dorëzim.'],['PROMISE','Premto gjithçka menjëherë','Rrezikon besueshmërinë nëse ke afate të shkelura.']];
 case 'RECOUNT':return [['VERIFY','Kërko verifikim të regjistrit · €10,000','Ekipi kontrollon shumën dhe integritetin e votave të ngrira. Nuk gjenerohen vota të reja.'],['ACCEPT','Prano rezultatin','Diferenca e ngushtë vetë nuk provon parregullsi.'],['ACCUSE','Akuzo manipulim pa prova','Rrezikon besueshmërinë; rezultati nuk ndryshon nga deklarata.']];
 case 'ENDORSE':return (e.finalists||[]).flatMap((p,i)=>[['PROGRAM'+i,'Mbështet '+state.parties[p].short+' me kushte programore','Kërko raport publik për transportin dhe shërbimet. Vetëm një pjesë e elektoratit afrohet; votuesit vendosin vetë.']]).concat([['FREE','Lëri votuesit të lirë','Mos transfero mbështetje dhe mos premto poste.']]);
 case 'COUNCIL':return [['COALITION','Koalicion komunal me program të publikuar','Ndaj përgjegjësitë dhe meritat me partnerë deri në shumicë. Nuk emërohen persona automatikisht.'],['PROJECT','Marrëveshje vetëm për programin e shërbimeve','Siguro mbështetje për një pikë; vendimet e tjera kërkojnë negociata të reja.'],['MINORITY','Qeveris me votim pikë për pikë','Asnjë shumicë e garantuar. Rrezikon shtyrje të programit vendor.']];
 case 'MAYOR':return [['TEAM','Dërgo ekip profesional · €60,000 · 2 javë','Partia financon asistencë teknike për shërbimet e dobëta, pa prekur arkën e shtetit.'],['AUDIT','Publiko vlerësim të pavarur · €20,000 · 2 javë','Raporto matjet dhe përgjegjësitë. Gjendja e dobët nuk është provë automatike korrupsioni.'],['DEFEND','Mbroje pa plan korrigjimi','Kryetari ruan përkrahjen partiake; banorët mbeten pa përgjigje konkrete.'],['WITHDRAW','Tërhiq mbështetjen e partisë','Kryetari mban mandatin si i pavarur. Nuk shkarkohet nga komuna me një vendim partie.']];
 case 'SUCCESS':return [['SHARE','Ndaj meritat me ekipin lokal','Forco anëtarësinë dhe përfshije kryetarin në diskutimin për drejtimin e partisë.'],['CENTRAL','Merri meritat vetëm për kryesinë','Krijo pakënaqësi te dega që ka drejtuar komunën.']];
 case 'FLOOD':return [['COOPERATE','Kërko koordinim publik me qeverinë','Prano merita të përbashkëta dhe përdor procedurën ekzistuese të emergjencës; nuk krijohen para shtesë.'],['AID','Financo ndihmë partiake · €200,000','Pajisje parandaluese dhe logjistikë në komunë. Kjo nuk zëvendëson fondin kombëtar të emergjencës.'],['DELAY','Kushtëzo bashkëpunimin me merita politike','Vonesa dëmton besimin lokal; emergjenca vazhdon sipas mekanikës ekzistuese.']];
 case 'ACCOUNTABILITY':return [['REPORT','Kërko raport publik për shërbimet','Krahaso matjet e ujit dhe shërbimeve. Nëse nuk ka përmirësim, kërko afat korrigjimi.'],['WITHDRAW','Tërhiq mbështetjen programore','Mbyll marrëveshjen e partisë; kryetari ruan mandatin, shumica duhet të negociohet sërish.'],['IGNORE','Mos kërko llogari','Shmang përplasjen sot, por dobëson besimin lokal te zotimi i partisë.']];
 default:return [];}}
function choosePartyEpisode(id,code){const ok=paidPartyCommit(()=>{
 const e=episodeFind(id);if(!e||e.owner!==state.playerParty||e.status!=='OPEN'||e.presentedTurn!==null&&state.turnCount>e.dueTurn||!episodeOptions(e).some(x=>x[0]===code))throw Error('Kjo zgjedhje nuk është aktive.');const {c,m}=episodeLocal(e);
 const spend=n=>{oppositionSpend(n);e.cost+=n;};e.choices.push(code);e.decisionTurn=state.turnCount;e.status='RESOLVED';if(['COUNCIL','ENDORSE'].includes(e.kind)){const p=state.municipalityProfiles[e.city];e.baseline={water:p?.water||0,services:p?.services||0};}
 if(e.kind==='SPLIT'){
  if(code==='TALK'&&e.stage!==1){e.stage=1;e.status='WORKING';e.readyTurn=state.turnCount+2;e.result='Konsultimet po vazhdojnë.';}
  else if(code==='VOTE'){e.executiveVote=electionSeed(e.key+':executive')%100;e.result=e.executiveVote<(state.parties[e.owner].internalCohesion??70)?'Kryesia zgjedh garën më vete; kanalet programore mbeten të hapura.':'Kryesia kërkon bisedime programore. Koalicioni nuk krijohet pa negociata.';episodeCohesion(2);}
  else if(code==='COMPROMISE'){episodeCohesion(4);e.result='Ekipi pranoi platformën programore. Kandidatët mbeten në listën ekzistuese; nuk u krijua koalicion automatik.';}
  else{episodeCohesion(-5);e.result='Gara më vete u imponua. Dega kërkon më shumë pjesëmarrje në vendime.';}
 }
 if(e.kind==='PRIMARY'){
  if(!episodeNominationOpen(c,m))throw Error('Nominimet janë mbyllur ose kandidatura është financuar.');
  if(code==='PRIMARY'){if(localCalendarOrdinal(state)+2>=c.schedule.voteOrdinal)throw Error('Nuk mbeten dy javë për votim të brendshëm.');spend(25000);e.status='WORKING';e.readyTurn=state.turnCount+2;}
  else{const id=e.candidates[Number(code.slice(-1))];if(c.municipalities.some(x=>x.id!==m.id&&c.nominations[x.id]===id))throw Error('Ky person kandidon në një komunë tjetër.');c.nominations[m.id]=id;episodeCohesion(code==='PICK0'?1:-1);e.result='Nominimi u regjistrua në listën ekzistuese.';}
 }
 if(e.kind==='DEBATE'){if(c.status!=='CAMPAIGN'||c.nominations[e.city]!==e.candidateId)throw Error('Kandidatura ose fushata ka ndryshuar.');if(code==='FACTS')spend(30000);e.bonus=code==='FACTS'?3:code==='LISTEN'?1:e.proof==='FAILED'?-4:-1;e.result='Moderatorja kërkoi prova për shërbimet në '+m.name+'. '+(e.proof==='FAILED'?'Afati i shkelur i nismës u diskutua hapur.':e.proof==='NO_PLEDGE'?'Nuk u pretendua një projekt i kryer pa dokumente.':'U diskutua gjendja reale e zotimit të regjistruar.');episodeMetric(e,e.bonus);}
 if(e.kind==='RECOUNT'){const r=m.runoff||m.first;if(e.digest!==electionSeed(JSON.stringify(r)))throw Error('Regjistri nuk përputhet me raportin e ngrirë.');if(code==='VERIFY'){spend(10000);if(r.rows.reduce((n,x)=>n+x.votes,0)!==r.validVotes)throw Error('Mospërputhje në shumën e votave.');e.verifiedVotes=r.validVotes;e.result='Verifikimi konfirmoi '+r.validVotes+' vota të vlefshme. Diferenca mbetet '+e.margin+'; nuk u gjet mospërputhje.';}else{e.result=code==='ACCEPT'?'Rezultati u pranua.':'Akuzë pa provë në regjistër.';if(code==='ACCUSE')state.governance.credibility=clamp(state.governance.credibility-2,0,100);}}
 if(e.kind==='ENDORSE'){if(c.status!=='RUNOFF'||m.winner)throw Error('Balotazhi ka përfunduar.');e.target=code==='FREE'?null:e.finalists[Number(code.slice(-1))];e.relation=e.target?(state.parties[e.owner]?.relations?.[e.target]??50):null;const share=(m.first.rows.find(r=>r.party===e.owner)?.votes||0)/m.first.validVotes;e.factor=e.target?+(share*clamp(e.relation/100,.1,.75)*.4).toFixed(6):0;e.result=e.target?'Mbështetje programore për '+state.parties[e.target].short+'. Pas rezultatit kërkohet llogaridhënie për shërbimet.':'Votuesit u lanë të lirë.';}
 if(e.kind==='COUNCIL'){
  if(!episodeCurrentMayor(e))throw Error('Nuk drejton më këtë komunë.');const council=episodeDB().councils.find(x=>x.id===e.councilId),rows=council.rows.filter(x=>x.party!==e.owner).sort((a,b)=>b.seats-a.seats||a.party.localeCompare(b.party));let seats=council.rows.find(x=>x.party===e.owner)?.seats||0,partners=[];
  if(code!=='MINORITY')for(const r of rows){if(seats>council.total/2)break;seats+=r.seats;partners.push(r.party);}
  council.agreement={kind:code,partners,seats,turn:state.turnCount,scope:code==='PROJECT'?'SERVICE_PROGRAMME':code==='COALITION'?'LOCAL_MANDATE':'CASE_BY_CASE'};e.result=code==='MINORITY'?'Programi komunal nuk ka shumicë të garantuar.':seats>council.total/2?'U arrit mbështetje e modeluar prej '+seats+'/'+council.total+' për '+(code==='PROJECT'?'programin e shërbimeve.':'koalicionin komunal.'): 'Bisedimet nuk siguruan shumicën.';
 }
 if(e.kind==='MAYOR'){if(!episodeCurrentMayor(e))throw Error('Mandati lokal ka ndryshuar.');if(['TEAM','AUDIT'].includes(code)){spend(code==='TEAM'?60000:20000);e.status='WORKING';e.readyTurn=state.turnCount+2;}else if(code==='WITHDRAW'){episodeCity(e.city).mayorIndependent=true;episodeMetric(e,-2);e.result=e.figure+' vazhdon mandatin si i pavarur; rezultati historik mbetet i pandryshuar.';}else{episodeMetric(e,-3);e.result='Mbrojtja pa plan e dobësoi besimin lokal.';}}
 if(e.kind==='SUCCESS'){if(!episodeCurrentMayor(e))throw Error('Mandati lokal ka ndryshuar.');if(code==='SHARE'){careerDB().members+=150;episodeCohesion(3);e.result='Ekipi lokal solli 150 anëtarë dhe më shumë peshë në diskutimet e partisë.';}else{episodeCohesion(-3);e.result='Dega kundërshtoi përvetësimin e meritave.';}}
 if(e.kind==='FLOOD'){if(!episodeCurrentMayor(e)||e.emergencyId&&!state.nationalEmergencies?.events.some(x=>x.id===e.emergencyId&&x.status==='ACTIVE'))throw Error('Kjo emergjencë ose mandat nuk është më aktiv.');if(code==='AID'){spend(200000);const p=state.municipalityProfiles[e.city];p.water=clamp((p.water||0)+.2,0,10);episodeMetric(e,2);}else episodeMetric(e,code==='COOPERATE'?1:-3);e.result=code==='DELAY'?'Kushtëzimi politik dëmtoi besimin; nuk ndryshoi fondin kombëtar.':'Koordinimi dhe kontributi u regjistruan. '+(e.emergencyId?'Procedura kombëtare e emergjencës mbetet aktive.':'Ndërhyrja është parandaluese; nuk u shpall katastrofë dhe nuk u krijua fond shtetëror.');}
 if(e.kind==='ACCOUNTABILITY'){const prior=episodeFind(e.sourceId),p=state.municipalityProfiles[e.city],improved=p.water>e.baseline.water||p.services>e.baseline.services;if(code==='REPORT'){episodeMetric(e,improved?1:.3);e.result=improved?'Matjet tregojnë përmirësim; raporti ndan meritat me partnerët.':'Raporti nuk tregon përmirësim. Partia kërkoi afat korrigjimi; nuk pretendoi rezultat të pakryer.';}else if(code==='WITHDRAW'){prior.supportWithdrawnTurn=state.turnCount;const council=episodeDB().councils.find(x=>x.city===e.city&&x.cycleId===e.cycleId);if(council)council.agreement=null;e.result='Mbështetja programore u tërhoq; nuk u ndryshua mandati ose rezultati zgjedhor.';}else{episodeMetric(e,-2);e.result='Mungesa e raportimit dëmtoi besimin lokal.';}}
 careerLog(e.result||'Vendimi u regjistrua; puna vazhdon.');
 });if(ok)openPartyEpisode(id);return ok;}
// Freeze the partial endorsement in native runoff inputs, so validation and reload agree.
localWeights=function(c,m,parties,inputs){const rows=episodeWeights(c,m,parties,inputs),a=inputs.partyEndorsement;if(!a||inputs.round!==2)return rows;return rows.map(r=>({...r,weight:r.weight*(r.party===a.target?1+a.factor:1)}));};
const episodeCalculate=calculateLocalRound;
calculateLocalRound=function(c,m,round,inputs){
 if(round===2&&!m.runoff&&c.status==='RUNOFF'&&inputs.turn===state.turnCount&&!Object.prototype.hasOwnProperty.call(inputs,'partyEndorsement')&&state?.localElections?.cycles.includes(c)){
  const e=episodeDB()?.records.find(e=>e.kind==='ENDORSE'&&e.status==='RESOLVED'&&e.cycleId===c.id&&e.city===m.id&&e.target);
  if(e)inputs.partyEndorsement={episodeId:e.id,target:e.target,factor:e.factor};
 }return episodeCalculate(c,m,round,inputs);
};
function episodeHeading(e){return ({SPLIT:'Ekipi ndahet për strategjinë',PRIMARY:'Dega kërkon zgjedhje mes dy kandidatëve',DEBATE:'Debati i kandidatit komunal',RECOUNT:'Diferencë e ngushtë: verifikimi i votave',ENDORSE:'Vendi i tretë vendos qëndrimin për balotazh',COUNCIL:'Kryetari fitoi; shumica komunale mungon',MAYOR:'Kryetari yt duhet të përgjigjet për shërbimet',SUCCESS:'Kryetari dhe ekipi lokal kërkojnë njohje',FLOOD:'Përmbytjet kërkojnë bashkëpunim përtej partive',ACCOUNTABILITY:'Partneri duhet të japë llogari për marrëveshjen'})[e.kind];}
function openPartyEpisode(id){const e=episodeFind(id);if(!e)return false;if(e.presentedTurn===null&&!paidPartyCommit(()=>{const current=episodeFind(id);current.presentedTurn=state.turnCount;if(current.status==='OPEN')current.dueTurn=state.turnCount+5;episodeDB().lastPresentedTurn=state.turnCount;}))return false;const esc=catalogEscape,{c,m}=episodeLocal(e),city=m?.name||episodeCity(e.city)?.name||'',council=e.councilId&&episodeDB().councils.find(x=>x.id===e.councilId),p=state.municipalityProfiles[e.city];let detail=e.figure?e.figure+' · '+city:city;
 if(e.kind==='DEBATE')detail+=' — Si do ta përmirësoni shërbimin pa premtuar kompetenca që komuna nuk i ka? Ujë: '+Number(p?.water||0).toFixed(1)+'/10; arsim: '+Number(p?.education||0).toFixed(1)+'/10. '+(e.proof==='FAILED'?'Një premtim i partisë e ka kaluar afatin.':'Diskutimi përdor zotimet dhe gjendjen e komunës.');
 if(e.kind==='MAYOR')detail+=' — Vlerësimi i regjistruar: '+Object.entries(e.baseline).map(([k,v])=>({water:'ujë',education:'arsim',health:'shëndetësi',services:'shërbime'})[k]+': '+v.toFixed(1)+'/10').join('; ')+'.';
 if(e.kind==='FLOOD'&&!e.emergencyId)detail+=' — Rrjeti i ujit vlerësohet '+e.riskWater.toFixed(1)+'/10. Ky është skenar parandalues për rrezikun nga reshjet, jo raport për dëme të ndodhura.';
 if(council)detail+=' — '+council.rows.map(r=>state.parties[r.party].short+': '+r.seats).join(', ')+'. Shpërndarje e simuluar proporcionale nga vota e raundit të parë për kryetar; nuk është votim i veçantë për këshilltarë.';
 const text='<h2>'+esc(episodeHeading(e))+'</h2><p>'+esc(detail)+'</p>'+(e.result?'<p role="status">'+esc(e.result)+'</p>':'')+(e.status==='OPEN'?'<div class="community-grid">'+episodeOptions(e).map(([code,title,body])=>'<button class="conference-option" data-episode-choice="'+code+'" onclick="choosePartyEpisode(\''+id+'\',\''+code+'\')"><strong>'+esc(title)+'</strong><span>'+esc(body)+'</span></button>').join('')+'</div>':e.status==='WORKING'?'<p>Puna përfundon pas '+Math.max(0,e.readyTurn-state.turnCount)+' javësh. Nuk paguhet përsëri.</p>':'<p>Ky vendim është mbyllur.</p>');return communityOpen(text,'PARTIA · KOMUNAT DHE EKIPI');}
let episodePopupTimer=null;
function schedulePartyEpisodes(){if(episodePopupTimer!==null)return;episodePopupTimer=setTimeout(()=>{episodePopupTimer=null;const d=episodeDB();if(!d||d.lastPresentedTurn===state.turnCount||weeklyProcessing||weeklyVisualBusy||state.pendingVote||hasOpenElectionProcess()||urgentInterfaceBusy()||document.querySelector('.modal-overlay.show,dialog[open]')||!document.getElementById('startScreen')?.classList.contains('hidden'))return;const e=d.records.find(e=>e.owner===state.playerParty&&['OPEN','RESOLVED'].includes(e.status)&&e.presentedTurn===null);if(e)openPartyEpisode(e.id);},0);}
refreshAllUI=function(...a){const r=episodeRefresh(...a);schedulePartyEpisodes();return r;};
toggleModal=function(id,show){const r=episodeToggle(id,show);if(!show)schedulePartyEpisodes();return r;};
document.addEventListener('close',schedulePartyEpisodes,true);
worldAttentionInterrupt=function(st=state){return episodeInterrupt(st)||!!episodeDB(st)?.records.some(e=>e.status==='OPEN'&&e.presentedTurn===null&&e.turn===st.turnCount);};
renderLocalElections=function(...a){const r=episodeRender(...a),h=document.getElementById('localElectionsPanel');if(h&&episodeDB())h.innerHTML+='<details><summary>Vendimet e ekipit dhe të komunave</summary>'+episodeDB().records.map(e=>'<p>'+catalogEscape(episodeHeading(e))+' · '+catalogEscape(episodeCity(e.city)?.name||'')+' <button class="btn-top" onclick="openPartyEpisode(\''+e.id+'\')">'+(e.status==='OPEN'?'Shqyrto':'Raporti')+'</button></p>').join('')+'</details>';return r;};
const episodeChooseNomination=chooseLocalCandidate,episodeFund= fundLocalCandidate;
function episodePrimaryBusy(city){return episodeDB()?.records.some(e=>e.kind==='PRIMARY'&&e.city===city&&e.status==='WORKING');}
chooseLocalCandidate=function(city,id){if(episodePrimaryBusy(city)){showToast('Prit përfundimin e votimit të brendshëm.');return false;}return episodeChooseNomination(city,id);};
fundLocalCandidate=function(city,n){if(episodePrimaryBusy(city)){showToast('Prit përfundimin e votimit të brendshëm para financimit.');return false;}return episodeFund(city,n);};
validateLoadedState=function(st){episodeValidate(st);const d=episodeDB(st);if(!d)return;const bad=()=>{throw Error('Vendimet partiake ose komunale nuk përputhen me regjistrin.');};
 if(d.version!==1||!Number.isInteger(d.lastTurn)||d.lastTurn>st.turnCount||!Array.isArray(d.records)||!Array.isArray(d.councils))bad();const keys=new Set();
 for(const [i,e] of d.records.entries()){const {c,m}=episodeLocal(e,st);if(e.id!=='party-episode:'+(i+1)||keys.has(e.key)||!c||!m||!st.parties[e.owner]||!episodeHeading(e)||!['OPEN','WORKING','RESOLVED','EXPIRED','CANCELLED'].includes(e.status)||!Number.isSafeInteger(e.cost)||e.cost<0||!Number.isInteger(e.turn)||e.turn>st.turnCount||!Array.isArray(e.choices)||e.status==='WORKING'&&(!Number.isInteger(e.readyTurn)||e.readyTurn<e.turn))bad();keys.add(e.key);
  if(e.kind==='PRIMARY'&&(!Array.isArray(e.candidates)||e.candidates.length!==2||e.candidates.some(id=>!m.pools[c.owner].some(p=>p.id===id))))bad();
  if(e.kind==='ENDORSE'&&e.target){const share=(m.first.rows.find(r=>r.party===e.owner)?.votes||0)/m.first.validVotes;if(!m.first.finalists.includes(e.target)||!Number.isFinite(e.relation)||e.relation<0||e.relation>100||e.factor!==+(share*clamp(e.relation/100,.1,.75)*.4).toFixed(6))bad();}
  if(e.kind==='RECOUNT'&&e.digest!==electionSeed(JSON.stringify(m.runoff||m.first)))bad();
 }
 const councils=new Set();for(const x of d.councils){const {c,m}=episodeLocal(x,st),expected=m?.first&&episodeCouncilSeats(m);if(councils.has(x.id)||x.id!==x.cycleId+':council:'+x.city||!expected||x.total!==expected.total||JSON.stringify(x.rows)!==JSON.stringify(expected.rows)||x.basis!==expected.basis)bad();councils.add(x.id);if(x.agreement&&(!['COALITION','PROJECT','MINORITY'].includes(x.agreement.kind)||new Set(x.agreement.partners).size!==x.agreement.partners.length||x.agreement.partners.some(p=>p===c.owner||!x.rows.some(r=>r.party===p))||x.agreement.seats!==x.rows.filter(r=>r.party===c.owner||x.agreement.partners.includes(r.party)).reduce((s,r)=>s+r.seats,0)))bad();}
 for(const c of st.localElections?.cycles||[])for(const m of c.municipalities){const a=m.runoff?.inputs.partyEndorsement;if(a){const e=episodeFind(a.episodeId,st);if(!e||e.kind!=='ENDORSE'||e.status!=='RESOLVED'||e.cycleId!==c.id||e.city!==m.id||e.target!==a.target||e.factor!==a.factor)bad();}}
};
