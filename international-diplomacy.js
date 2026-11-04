/* Verified relationship snapshots are separate from simulated talks, terms and outcomes. */
const INTERNATIONAL_PARTNERS={
 EU:{name:"Bashkimi Evropian (BE)",status:"Kandidate potenciale; aplikim për anëtarësim në dhjetor 2022; Marrëveshje Stabilizim-Asociimi",interests:"Sundimi i ligjit, administrata publike, reformat dhe normalizimi i marrëdhënieve",limits:"Vendimet e institucioneve dhe shteteve anëtare nuk varen vetëm nga Kosova. Negociata këtu nuk jep status kandidati ose anëtarësim.",topics:["REFORMS","FINANCE","TRADE"],sources:["https://enlargement.ec.europa.eu/document/download/127563ea-4c03-44a4-b56c-2d569afd86a5_en?filename=kosovo-report-2025.pdf","https://www.consilium.europa.eu/en/policies/eu-western-balkans-relations/"]},
 IMF:{name:"Fondi Monetar Ndërkombëtar (FMN)",status:"Anëtare nga 29 qershor 2009; konsultime ekonomike dhe bashkëpunim financiar",interests:"Qëndrueshmëria fiskale, transparenca dhe kapaciteti i zbatimit",limits:"Programet dhe financimi kërkojnë vlerësim e vendime të FMN-së; anëtarësimi nuk garanton kredi.",topics:["REFORMS","FINANCE"],sources:["https://www.imf.org/en/countries/kos"]},
 COE:{name:"Këshilli i Evropës",status:"Aplikim për anëtarësim në maj 2022; Kosova nuk figuron në listën aktuale të shteteve anëtare",interests:"Të drejtat e njeriut, demokracia dhe mbrojtja e komuniteteve",limits:"Vendimi për pranimin i takon Komitetit të Ministrave. Plani i reformave në lojë nuk e zëvendëson atë vendim.",topics:["REFORMS"],sources:["https://pace.coe.int/en/files/33437/html","https://www.coe.int/en/web/portal/members-states"]},
 WB:{name:"Banka Botërore",status:"Anëtare nga qershori 2009; Korniza e Partneritetit për periudhën 2023–2027",interests:"Zhvillimi, vende pune, projektet e zbatueshme dhe mbrojtja mjedisore e sociale",limits:"Çdo projekt dhe instrument ka vlerësim e miratim të veçantë. Nuk ofrohet financim i garantuar.",topics:["FINANCE","REFORMS"],sources:["https://www.worldbank.org/ext/en/country/kosovo"]},
 EBRD:{name:"Banka Evropiane për Rindërtim dhe Zhvillim (BERZH)",status:"Anëtare nga 17 dhjetor 2012; vend ku BERZH investon",interests:"Sektori privat, energjia e gjelbër dhe infrastruktura e qëndrueshme",limits:"Financimi varet nga vlerësimi i projektit, rrezikut dhe organeve të bankës; shumat këtu janë të simuluara.",topics:["FINANCE","TRADE"],sources:["https://www.ebrd.com/home/what-we-do/where-we-invest/kosovo.html"]},
 NATO:{name:"NATO / KFOR",status:"Bashkëpunim në kontekstin e misionit KFOR; nuk paraqitet anëtarësim ose status PfP i konfirmuar",interests:"Mjedisi i sigurt, liria e lëvizjes, koordinimi dhe ulja e tensioneve",limits:"KFOR ka mandat të vetin. Nuk negociohen në këtë ekran anëtarësimi, aleanca ushtarake ose hyrja në Partneritetin për Paqe.",topics:["SECURITY"],sources:["https://www.nato.int/en/what-we-do/operations-and-missions/natos-role-in-kosovo","https://www.nato.int/en/what-we-do/partnerships-and-cooperation/partnership-for-peace-programme"]},
 CEFTA:{name:"CEFTA",status:"Pjesëmarrje në kuadrin tregtar rajonal; dokumenti themelues përdor emërtimin UNMIK/Kosovo",interests:"Lehtësimi i tregtisë, transparenca dhe heqja e pengesave praktike",limits:"Masat dhe zgjidhja e çështjeve kërkojnë bashkëpunim të palëve; takimi nuk garanton qasje të re në treg.",topics:["TRADE"],sources:["https://cefta.int/about/general-info/","https://transparency.cefta.int/TradePortal?articleId=21&id=6&lang=en&lid=1&pid=3"]}
};
const INTERNATIONAL_TOPICS={REFORMS:{name:"Plan bashkëpunimi teknik për reforma",ministry:"md",sector:"sec_justice"},FINANCE:{name:"Vlerësim i një kredie dhe projekti të simuluar",ministry:"mfpt",sector:"sec_econ"},SECURITY:{name:"Plan teknik për koordinim dhe ulje tensionesh",ministry:"mpb",sector:"sec_police"},TRADE:{name:"Plan teknik për lehtësim tregtar",ministry:"mint",sector:"sec_econ"}};
const INTERNATIONAL_RULES=Object.freeze({version:1,maxRounds:4,roundCostB:0.00005,negotiationWeeks:16,reviewWeeks:2,loanWeeks:12,checkedAt:"2026-10-21"});
const INTERNATIONAL_STATUS={DRAFT:"Në përgatitje",COUNTER:"Kundërpropozim i palës",OFFERED:"Ofertë e kushtëzuar",SUSPENDED:"E pezulluar",ACCEPTED:"E përfunduar me dakordim të kushtëzuar",REJECTED:"E refuzuar",EXPIRED:"Afati përfundoi",CONDITIONAL:"Në pritje të kushteve",FULFILLED:"E zbatuar",FAILED:"E dështuar",PENDING:"Në pritje",APPROVED:"E miratuar në simulim",DISBURSED:"Kredi e lëvruar",REPAID:"Kredi e shlyer",OVERDUE:"Kredi e vonuar"};
let internationalSelectedPartner="EU";
function internationalCatalog(st){
    var result=JSON.parse(JSON.stringify(INTERNATIONAL_PARTNERS));
    Object.keys(st.diplomacy).forEach(function(id){if(!result[id])result[id]={name:st.diplomacy[id].name,status:"Marrëdhënie dypalëshe të skenarit; kushtet specifike nuk janë verifikuar",interests:"Bashkëpunim teknik, transparencë dhe interesa të ndërsjella",limits:"Nuk pretendohet marrëveshje reale, njohje e re ose financim i konfirmuar.",topics:["REFORMS","TRADE"],sources:[],uncertain:true};});return result;
}
function sealInternationalState(db){delete db.integrity;db.integrity=electionSeed(JSON.stringify(db));}
function migrateInternationalDiplomacy(st){
    var changed=false;
    if(typeof st.internationalDiplomacy==="undefined"){st.internationalDiplomacy={version:1,institutions:{},negotiations:[],agreements:[],meetings:[],counter:0,lastProcessedTurn:st.turnCount};changed=true;}
    var db=st.internationalDiplomacy,catalog=internationalCatalog(st);
    if(typeof db.communications==='undefined'){db.communications=[];changed=true;}
    Object.keys(catalog).forEach(function(id){if(!Object.hasOwn(db.institutions,id)){db.institutions[id]={id:id,facts:catalog[id],checkedAt:INTERNATIONAL_RULES.checkedAt,relationship:50};changed=true;}});
    if(changed)sealInternationalState(db);
    if(typeof migrateAgreementDocuments==='function')migrateAgreementDocuments(st);
    if(typeof migrateDiplomaticReport==='function')migrateDiplomaticReport(st);
}
function internationalRelation(id,delta){
    var target=state.diplomacy[id] || state.internationalDiplomacy.institutions[id],field=state.diplomacy[id]?"score":"relationship";
    if(typeof delta==="number")target[field]=clamp(target[field]+delta,0,100);return target[field];
}
function internationalStamp(){return {turn:state.turnCount,year:state.year,monthIndex:state.monthIndex,week:state.week};}
function internationalGovernmentKey(){return (state.assemblyCycleId || "legacy:"+state.mandateNumber)+":"+(state.governmentApprovalWeek || 0);}
function internationalNegotiation(id){return state.internationalDiplomacy.negotiations.find(function(n){return n.id===id;});}
function internationalCommit(change){
    if(!assertGovernmentAuthority("Negociatat ndërkombëtare") || !constituentGovernmentGate())return false;
    if(state.pendingVote){showToast("Përfundoni votimin para veprimit diplomatik.");return false;}
    var before=JSON.stringify(state);
    try{migrateInternationalDiplomacy(state);change(state.internationalDiplomacy);migrateAgreementDocuments(state);state.internationalDiplomacy.agreements.forEach(updateAgreementDocumentLifecycle);sealInternationalState(state.internationalDiplomacy);validateLoadedState(state);if(!saveGameAuto()){state=JSON.parse(before);return false;}}
    catch(error){state=JSON.parse(before);showToast("Veprimi diplomatik nuk u krye: "+error.message);return false;}
    refreshAllUI();return true;
}
function internationalTermsValid(t,topic){return t && Number.isInteger(t.commitment) && t.commitment>=1 && t.commitment<=3 && typeof t.oversight==="boolean" && Number.isInteger(t.weeks) && t.weeks>=6 && t.weeks<=12 && Number.isInteger(t.requestedM) && t.requestedM>=0 && t.requestedM<=20 && (topic==="FINANCE" || t.requestedM===0);}
function validateInternationalDiplomacy(st){
    if(typeof st.internationalDiplomacy==="undefined")return;
    var db=st.internationalDiplomacy,copy=JSON.parse(JSON.stringify(db));delete copy.integrity;
    if(!db || db.version!==1 || !db.institutions || !Array.isArray(db.negotiations) || !Array.isArray(db.agreements) || !Array.isArray(db.meetings) || !Number.isInteger(db.counter) || db.counter<0 || !Number.isInteger(db.lastProcessedTurn) || db.lastProcessedTurn<0 || db.lastProcessedTurn>st.turnCount || db.integrity!==electionSeed(JSON.stringify(copy)))throw Error("Regjistri diplomatik është i dëmtuar.");
    Object.keys(db.institutions).forEach(function(id){var i=db.institutions[id];if(!i || i.id!==id || !i.facts || typeof i.facts.name!=="string" || typeof i.facts.status!=="string" || !Array.isArray(i.facts.sources) || !Array.isArray(i.facts.topics) || !Number.isFinite(i.relationship) || i.relationship<0 || i.relationship>100)throw Error("Institucion diplomatik i pavlefshëm.");});
    validateInternationalCommunications(st);
    var ids=new Set(),active=new Set(),agreementIds=new Set();
    db.negotiations.forEach(function(n){
        var institution=db.institutions[n.partnerId];
        if(!/^intl:\d+$/.test(n.id) || ids.has(n.id) || !institution || !institution.facts.topics.includes(n.topic) || !["DRAFT","COUNTER","OFFERED","SUSPENDED","ACCEPTED","REJECTED","EXPIRED"].includes(n.status) || !Array.isArray(n.rounds) || n.rounds.length>4 || !Array.isArray(n.decisions) || !Number.isInteger(n.startedTurn) || n.startedTurn<0 || n.expiresTurn!==n.startedTurn+16 || n.startedTurn>st.turnCount || typeof n.goal!=="string")throw Error("Negociatë e pavlefshme ose e dyfishuar.");ids.add(n.id);
        if(["DRAFT","COUNTER","OFFERED","SUSPENDED"].includes(n.status)){if(active.has(n.partnerId))throw Error("Dy negociata aktive me të njëjtën palë.");active.add(n.partnerId);}
        n.rounds.forEach(function(r,index){if(r.number!==index+1 || !internationalTermsValid(r.proposal,n.topic) || !internationalTermsValid(r.counter,n.topic) || !Number.isInteger(r.turn) || r.turn<n.startedTurn || r.turn>st.turnCount || index && r.turn<=n.rounds[index-1].turn || !["COUNTER","OFFERED","REJECTED"].includes(r.response) || typeof r.text!=="string")throw Error("Raund diplomatik i dëmtuar.");});
        if(n.decisions.some(function(d){return !d || !['ACCEPT','REJECT','SUSPEND','RESUME','EXPIRED'].includes(d.decision) || !d.at || !Number.isInteger(d.at.turn) || d.at.turn<n.startedTurn || d.at.turn>st.turnCount;}) || n.status==='SUSPENDED' && !['DRAFT','COUNTER','OFFERED'].includes(n.suspendedStatus) || n.status==='ACCEPTED' && (n.rounds.length<2 || n.rounds.at(-1).response!=='OFFERED'))throw Error('Historik vendimesh diplomatik i pavlefshëm.');
        if(n.status==="OFFERED" && (n.rounds.length<2 || n.rounds.at(-1).response!=="OFFERED"))throw Error("Ofertë pa raundet e nevojshme.");
    });
    db.agreements.forEach(function(a){
        var n=db.negotiations.find(function(n){return n.id===a.negotiationId;});
        if(agreementIds.has(a.id) || !n || n.status!=="ACCEPTED" || n.agreementId!==a.id || a.partnerId!==n.partnerId || a.topic!==n.topic || !["CONDITIONAL","FULFILLED","FAILED"].includes(a.status) || !internationalTermsValid(a.terms,a.topic) || !Array.isArray(a.milestones) || a.milestones.length!==2 || a.milestones.some(function(m){return !["PLANNED","DONE"].includes(m.status) || !Number.isFinite(m.costB) || m.costB<0;}) || typeof a.effectsApplied!=="boolean" || a.effectsApplied!==(a.status==="FULFILLED") || !["PENDING","APPROVED","REJECTED"].includes(a.externalReview.status) || !Array.isArray(a.history))throw Error("Marrëveshje diplomatike e pavlefshme.");agreementIds.add(a.id);
        if(a.lawId && !st.laws.some(function(l){return l.id===a.lawId && l.internationalAgreementId===a.id && l.majorityType==="INTL_80" && l.costB===0;}))throw Error("Mungon akti parlamentar i marrëveshjes.");
        if(a.id!==n.id+":agreement" || !Number.isInteger(a.acceptedTurn) || a.acceptedTurn>st.turnCount || a.deadlineTurn!==a.acceptedTurn+a.terms.weeks || a.externalReview.dueTurn!==a.acceptedTurn+2 || (a.terms.requestedM>0)!==!!a.lawId || a.financing.principalB!==a.terms.requestedM/1000 || !["PENDING","DISBURSED","REPAID","OVERDUE"].includes(a.financing.status) || a.financing.status!=="PENDING" && !a.effectsApplied || a.effectsApplied && a.externalReview.status!=="APPROVED" || a.status==="FULFILLED" && a.milestones.some(function(m){return m.status!=="DONE";}))throw Error("Financim pa kushte ose i dyfishuar.");
        if(a.effectsApplied && a.lawId && st.laws.find(function(l){return l.id===a.lawId;}).status!=='PASSED' || a.effectsApplied && a.financing.principalB>0 && (a.financing.status==='PENDING' || !Number.isInteger(a.financing.disbursedTurn) || a.financing.disbursedTurn<a.acceptedTurn || a.financing.disbursedTurn>st.turnCount || a.financing.repaymentDue!==a.financing.disbursedTurn+12))throw Error('Financimi nuk përputhet me ratifikimin ose afatin e shlyerjes.');
    });
    if(db.negotiations.some(function(n){return n.status==="ACCEPTED" && !db.agreements.some(function(a){return a.id===n.agreementId;});}))throw Error("Dakordim pa marrëveshje të regjistruar.");
    var meetings=new Set();db.meetings.forEach(function(m){var n=db.negotiations.find(function(n){return n.id===m.negotiationId;});if(meetings.has(m.id) || !n || !n.rounds.some(function(r){return r.number===m.round && r.turn===m.turn;}))throw Error("Takim diplomatik i dyfishuar ose pa raund.");meetings.add(m.id);});
    if(db.meetings.length!==db.negotiations.reduce(function(total,n){return total+n.rounds.length;},0))throw Error('Historiku i takimeve nuk përputhet me raundet.');
}
function internationalBeginRecord(db,partnerId,topic,goal){
        var p=db.institutions[partnerId];if(!p || !p.facts.topics.includes(topic) || typeof goal!=="string" || !goal.trim() || goal.length>400)throw Error("Zgjidhni palën, temën dhe një qëllim deri në 400 shkronja.");
        if(db.negotiations.some(function(n){return n.partnerId===partnerId && ["DRAFT","COUNTER","OFFERED","SUSPENDED"].includes(n.status);}))throw Error("Ka tashmë një negociatë të hapur me këtë palë.");
        if(db.negotiations.some(function(n){return n.partnerId===partnerId && n.topic===topic && (n.governmentKey===internationalGovernmentKey() && n.status==="ACCEPTED" || state.turnCount-n.startedTurn<8);}))throw Error("Kjo temë ka proces të regjistruar për këtë Qeveri ose kërkon tetë javë para rihapjes.");
        var result="intl:"+(++db.counter);db.negotiations.push({id:result,partnerId:partnerId,topic:topic,goal:goal.trim(),governmentKey:internationalGovernmentKey(),status:"DRAFT",startedTurn:state.turnCount,expiresTurn:state.turnCount+16,rounds:[],decisions:[],createdAt:internationalStamp()});
    return result;
}
function startInternationalNegotiation(partnerId,topic,goal){
    var result=null;
    if(!internationalCommit(function(db){result=internationalBeginRecord(db,partnerId,topic,goal);}))return false;
    internationalSelectedPartner=partnerId;renderInternationalDiplomacy();return result;
}
function internationalReadiness(n){
    var topic=INTERNATIONAL_TOPICS[n.topic],sector=state.stateSectors.find(function(s){return s.id===topic.sector;}),previous=state.internationalDiplomacy.agreements.filter(function(a){return a.partnerId===n.partnerId;});
    return {relation:internationalRelation(n.partnerId),approval:state.approval,debt:Number.isFinite(state.publicDebtPct)?state.publicDebtPct:100,reform:sector?sector.score:50,failures:previous.filter(function(a){return a.status==="FAILED";}).length,successes:previous.filter(function(a){return a.status==="FULFILLED";}).length};
}
function submitInternationalProposal(id,terms,text){
    return internationalCommit(function(db){
        var n=internationalNegotiation(id);if(!n || !["DRAFT","COUNTER","OFFERED"].includes(n.status) || state.turnCount>=n.expiresTurn)throw Error("Negociata nuk pranon propozim në këtë gjendje.");
        if(!internationalTermsValid(terms,n.topic) || typeof text!=="string" || !text.trim() || text.length>800)throw Error("Plotësoni propozimin, angazhimin, mbikëqyrjen, afatin 6–12 javë dhe shumën 0–20 milionë vetëm për financim.");
        if(n.rounds.length && n.rounds.at(-1).turn===state.turnCount)throw Error("Një raund për negociatë në javë. Vazhdoni javën tjetër.");
        if(n.rounds.length>=4 || state.budgetTotalB<INTERNATIONAL_RULES.roundCostB)throw Error("Nuk ka raunde ose buxhet të mjaftueshëm.");
        var m=internationalReadiness(n),capacity=clamp(Math.floor((m.relation+m.reform-m.debt)/12),0,10),counter={commitment:m.failures>m.successes?3:2,oversight:true,weeks:m.debt>60?10:8,requestedM:n.topic==="FINANCE"?Math.min(terms.requestedM,capacity):0};
        var acceptable=n.rounds.length>=1 && terms.commitment>=counter.commitment && terms.oversight && terms.weeks>=counter.weeks && terms.requestedM<=capacity && m.relation>=30;
        var response=acceptable?"OFFERED":n.rounds.length===3?"REJECTED":"COUNTER";
        var reason=response==="OFFERED"?"Paketa mund të kalojë në shqyrtim të kushtëzuar; nuk është miratim përfundimtar.":m.relation<30?"Besimi është i ulët; kërkohet përmirësim i marrëdhënies dhe zbatim i angazhimeve të mëparshme.":m.failures>m.successes?"Angazhimet e mëparshme të pambajtura kërkojnë mbikëqyrje dhe angazhim më të lartë.":m.debt>60?"Rreziku fiskal kërkon afat më të gjatë dhe kërkesë financiare më të kufizuar.":"Pala kërkon angazhim të matshëm, mbikëqyrje dhe kohë për vlerësim.";
        fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB-INTERNATIONAL_RULES.roundCostB).toFixed(6),"submitInternationalProposal");
        var round={number:n.rounds.length+1,turn:state.turnCount,proposal:JSON.parse(JSON.stringify(terms)),proposalText:text.trim(),counter:counter,response:response,metrics:m,text:reason+" Interesi kryesor: "+db.institutions[n.partnerId].facts.interests};
        n.rounds.push(round);n.status=response;db.meetings.push({id:n.id+":round:"+round.number,negotiationId:n.id,round:round.number,turn:state.turnCount});
        state.scheduledMeetings.filter(function(m){return m.status==="SCHEDULED" && m.dueTurn<=state.turnCount && internationalMeetingPartner(m)===n.partnerId;}).forEach(function(m){m.status="COMPLETED";m.internationalNegotiationId=n.id;finishInternationalCommunicationMeeting(m);m.outcome="U zhvillua raundi "+round.number+" i negociatës; nuk u garantua marrëveshje ose financim.";});
        if(response==="REJECTED"){internationalRelation(n.partnerId,-1);n.closedAt=internationalStamp();addMediaNews("Diplomacia — simulim","Negociatat me "+db.institutions[n.partnerId].facts.name+" përfunduan pa dakordim.","CRITICAL");}
    });
}
function decideLegacyInternationalNegotiation(id,decision,documentId){
    return internationalCommit(function(db){
        var n=internationalNegotiation(id);if(!n)throw Error("Negociata nuk u gjet.");
    if(decision==="RESUME"){
            if(n.status!=="SUSPENDED" || state.turnCount>=n.expiresTurn)throw Error("Negociata nuk mund të vazhdojë.");n.status=n.suspendedStatus;
        } else {
            if(!["DRAFT","COUNTER","OFFERED"].includes(n.status) || state.turnCount>=n.expiresTurn)throw Error("Vendimi nuk lejohet në këtë gjendje.");
            if(decision==="SUSPEND"){n.suspendedStatus=n.status;n.status="SUSPENDED";}
            else if(decision==="REJECT"){n.status="REJECTED";n.closedAt=internationalStamp();internationalRelation(n.partnerId,-1);addMediaNews("Diplomacia — simulim","Qeveria refuzoi paketën me "+db.institutions[n.partnerId].facts.name+".","CRITICAL");}
            else if(decision==="ACCEPT"){
                if(n.status!=="OFFERED" || n.rounds.length<2 || state.turnCount-n.rounds.at(-1).turn>4)throw Error("Pranimi kërkon ofertë të kushtëzuar pas së paku dy raundeve, jo më të vjetër se katër javë.");
                var terms=JSON.parse(JSON.stringify(n.rounds.at(-1).proposal)),agreement={id:n.id+":agreement",negotiationId:n.id,partnerId:n.partnerId,topic:n.topic,terms:terms,status:"CONDITIONAL",acceptedTurn:state.turnCount,deadlineTurn:state.turnCount+terms.weeks,effectsApplied:false,
                    externalReview:{status:"PENDING",dueTurn:state.turnCount+2},lawId:null,
                    milestones:[{title:"Dosja teknike, reformat dhe plani i zbatimit",dueTurn:state.turnCount+1,costB:terms.commitment*0.0005,status:"PLANNED"},{title:"Zbatimi pilot dhe raporti i monitorimit",dueTurn:state.turnCount+3,costB:terms.commitment*0.0005,status:"PLANNED"}],
                    financing:{status:"PENDING",principalB:terms.requestedM/1000,annualRate:state.debtInterestRate,repaymentDue:null},history:[{turn:state.turnCount,text:"Dakordim i kushtëzuar i simulimit; pa para ose përfitime të menjëhershme."}]};
                if(terms.requestedM>0){agreement.lawId=agreement.id+":ratification";state.laws.unshift(internationalRatificationBill(agreement));}
                db.agreements.push(agreement);n.agreementId=agreement.id;n.status="ACCEPTED";n.closedAt=internationalStamp();
                if(documentId)attachSignedAgreementDocument(agreement,documentId,n);
                addMediaNews("Diplomacia — simulim","U regjistrua një dakordim i kushtëzuar me "+db.institutions[n.partnerId].facts.name+"; zbatimi dhe miratimet mbeten për t'u përfunduar.","NEUTRAL");
            } else throw Error("Vendim i panjohur.");
        }
        n.decisions.push({decision:decision,at:internationalStamp()});
    });
}
function internationalRatificationBill(a){return {id:a.lawId,internationalAgreementId:a.id,title:"Ratifikimi i financimit të simuluar me "+state.internationalDiplomacy.institutions[a.partnerId].facts.name,ministry:"Ministria e Financave",proposer:"Qeveria e Kosovës",sector:null,field:"Marrëveshje ndërkombëtare",desc:"Detyrim financiar i simulimit prej €"+a.terms.requestedM+"M. Miratimi parlamentar nuk garanton lëvrim; kërkohen vlerësimi i palës dhe zbatimi i kushteve.",source:"Kushtetuta, neni 18(1)(4); kushte dhe shuma të simuluara",majorityType:"INTL_80",requiredVotes:80,costB:0,approvalEffect:0,supportParties:[state.playerParty],stage:"Draft i Papërpunuar",status:"DRAFT",submittedWeek:null,scheduledWeek:null,applied:false,voteHistory:[],stageHistory:[{stage:"DRAFT",week:state.turnCount}],lastVoteResult:null};}
function internationalAgreement(id){return state.internationalDiplomacy.agreements.find(function(a){return a.id===id;});}
function completeLegacyInternationalMilestone(id,index){
    return internationalCommit(function(){var a=internationalAgreement(id),m=a && a.milestones[index];if(!a || a.status!=="CONDITIONAL" || !m || m.status!=="PLANNED" || state.turnCount<m.dueTurn || state.turnCount>a.deadlineTurn || index===1 && a.milestones[0].status!=="DONE")throw Error("Ky hap nuk është ende i disponueshëm ose është kryer.");if(state.budgetTotalB<m.costB)throw Error("Buxheti nuk mjafton për këtë hap.");fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB-m.costB).toFixed(6),"completeLegacyInternationalMilestone");m.status="DONE";m.completedTurn=state.turnCount;a.history.push({turn:state.turnCount,text:m.title+" — u pagua kostoja dhe u regjistrua zbatimi i simuluar."});updateInternationalAgreements();});
}
function internationalAgreementImpact(a,success){
    internationalRelation(a.partnerId,success?2:-2);adjustPublicSupport(((success?0.5:-0.5)), {source:"internationalAgreementImpact"}, state);
    var sector=state.stateSectors.find(function(s){return s.id===INTERNATIONAL_TOPICS[a.topic].sector;}),ministry=state.ministries.find(function(m){return m.id===INTERNATIONAL_TOPICS[a.topic].ministry;});
    if(success && sector)sector.score=clamp(sector.score+2,0,100);if(success && ministry)ministry.competence=clamp(ministry.competence+1,0,100);
    if(success && ["FINANCE","TRADE"].includes(a.topic))state.gdpGrowth=+(state.gdpGrowth+0.05).toFixed(2);
    state.coalitionParties.filter(function(id){return id!==state.playerParty;}).forEach(function(id){var p=state.parties[state.playerParty];p.relations[id]=clamp((p.relations[id] || 50)+(success?1:-1),0,100);});
    addMediaNews("Diplomacia — simulim",(success?"U zbatua":"Dështoi")+" plani me "+state.internationalDiplomacy.institutions[a.partnerId].facts.name+".",success?"POSITIVE":"CRITICAL");
}
function repayInternationalLoan(id){return internationalCommit(function(){var a=internationalAgreement(id);if(!a || !["DISBURSED","OVERDUE"].includes(a.financing.status) || state.budgetTotalB<a.financing.principalB)throw Error("Kredia nuk mund të shlyhet në këtë gjendje ose buxheti nuk mjafton.");settleInternationalLoan(a);});}
function settleInternationalLoan(a){
    var f=a?.financing;
    if(!f||!['DISBURSED','OVERDUE'].includes(f.status))return false;
    if(!Number.isFinite(f.principalB)||f.principalB<=0||state.budgetTotalB<f.principalB||state.publicDebtPct/100*FISCAL_GDP_B+1e-9<f.principalB)throw Error('Mjetet ose borxhi nuk mbulojnë shlyerjen e kredisë.');
    fiscalSetBalance(state,"budgetTotalB",fiscalRound(state.budgetTotalB-f.principalB),"settleInternationalLoan");state.publicDebtPct=fiscalRound(Math.max(0,state.publicDebtPct-f.principalB/FISCAL_GDP_B*100));f.status="REPAID";f.repaidTurn=state.turnCount;a.history.push({turn:state.turnCount,text:"U shlye kryegjëja e kredisë së simuluar. Interesi trajtohet nga modeli fiskal ekzistues."});recordAgreementFinance(a,'REPAYMENT',-f.principalB);return true;
}
function updateInternationalAgreements(){
    var db=state.internationalDiplomacy;
    db.agreements.forEach(function(a){
        updateAgreementDocumentLifecycle(a);
        if(a.status==="CONDITIONAL" && agreementProcessingAllowed(a)){
            var n=internationalNegotiation(a.negotiationId),law=a.lawId && state.laws.find(function(l){return l.id===a.lawId;});
            if(a.externalReview.status==="PENDING" && state.turnCount>=a.externalReview.dueTurn){
                var r=internationalReadiness(n),draw=electionSeed(a.id+":"+n.startedTurn+":"+a.partnerId+":"+a.topic)%100;
                a.externalReview.status=r.relation>=40 && r.debt<80 && draw<clamp(50+Math.floor(r.reform/4)-r.failures*10,15,85)?"APPROVED":"REJECTED";
                a.history.push({turn:state.turnCount,text:"Shqyrtimi i jashtëm i simulimit: "+INTERNATIONAL_STATUS[a.externalReview.status]+". Ky nuk është vendim real i institucionit."});
            }
            if(a.externalReview.status==="REJECTED" || law && law.status==="FAILED" || (!a.lifecycle || a.lifecycle.legacy) && state.turnCount>a.deadlineTurn){a.status="FAILED";a.history.push({turn:state.turnCount,text:"Marrëveshja dështoi: refuzim i jashtëm/parlamentar ose kushte të papërfunduara brenda afatit."});internationalAgreementImpact(a,false);}
            else if(a.externalReview.status==="APPROVED" && (!law || law.status==="PASSED") && agreementExecutionAllowed(a) && a.milestones.every(function(m){return m.status==="DONE";}) && !a.effectsApplied){
                if(a.financing.principalB>0&&typeof foreignFundingBlocked==='function'&&foreignFundingBlocked(state))return;
                a.status="FULFILLED";a.effectsApplied=true;a.completedTurn=state.turnCount;
                if(a.financing.principalB>0){fiscalSetBalance(state,"budgetTotalB",fiscalRound(state.budgetTotalB+a.financing.principalB),"updateInternationalAgreements");state.publicDebtPct=fiscalRound(state.publicDebtPct+a.financing.principalB/FISCAL_GDP_B*100);a.financing.status="DISBURSED";a.financing.disbursedTurn=state.turnCount;a.financing.repaymentDue=state.turnCount+12;recordAgreementFinance(a,'DISBURSEMENT',a.financing.principalB);}
                a.history.push({turn:state.turnCount,text:"Kushtet u përmbushën; efektet u regjistruan një herë."});internationalAgreementImpact(a,true);
            }
        }
        if(a.financing.status==="DISBURSED" && state.turnCount>=a.financing.repaymentDue){
            if(state.budgetTotalB>=a.financing.principalB)settleInternationalLoan(a);
            else {a.financing.status="OVERDUE";internationalRelation(a.partnerId,-3);a.history.push({turn:state.turnCount,text:"Buxheti nuk mjafton për shlyerje; kredia kaloi në vonesë. Nuk u krijuan para shtesë."});}
        }
        updateAgreementDocumentLifecycle(a);
    });
}
function processInternationalDiplomacyWeek(){
    var db=state.internationalDiplomacy;if(!db || db.lastProcessedTurn>=state.turnCount)return;
    db.lastProcessedTurn=state.turnCount;
    db.negotiations.forEach(function(n){if(["DRAFT","COUNTER","OFFERED","SUSPENDED"].includes(n.status) && state.turnCount>=n.expiresTurn){n.status="EXPIRED";n.closedAt=internationalStamp();n.decisions.push({decision:"EXPIRED",at:internationalStamp()});}});
    processInternationalCommunications();updateInternationalAgreements();sealInternationalState(db);
}
function checkInternationalAgreements(){return internationalCommit(function(){updateInternationalAgreements();});}
function openInternationalDiplomacy(partnerId){if(partnerId && !state.internationalDiplomacy.institutions[partnerId]){showToast('Ky kontakt nuk është në regjistrin diplomatik.');return false;}if(partnerId)internationalSelectedPartner=partnerId;switchMainTab("tab-diplomacy");switchSubTab("dip","institutions",document.getElementById("internationalDiplomacyTab"));renderInternationalDiplomacy();return true;}
function openBilateralVisitModal(countryKey){return openInternationalCommunication(countryKey,'VISIT');}
function finalizeBilateralVisit(countryKey,dealType){return openInternationalCommunication(countryKey,'VISIT');}
function internationalStartFromForm(){return startInternationalNegotiation(internationalSelectedPartner,document.getElementById('internationalTopic').value,document.getElementById('internationalGoal').value);}
function internationalProposalFromForm(id){return submitInternationalProposal(id,{commitment:Number(document.getElementById('internationalCommitment').value),oversight:document.getElementById('internationalOversight').checked,weeks:Number(document.getElementById('internationalWeeks').value),requestedM:Number(document.getElementById('internationalAmount').value)},document.getElementById('internationalProposalText').value);}
function renderInternationalDiplomacy(){
    var host=document.getElementById('internationalDiplomacyPanel'),db=state && state.internationalDiplomacy;if(!host || !db)return;
    if(!db.institutions[internationalSelectedPartner])internationalSelectedPartner='EU';
    var esc=electoralEscape,p=db.institutions[internationalSelectedPartner],id=p.id,n=db.negotiations.filter(function(n){return n.partnerId===id;}).at(-1),agreements=db.agreements.filter(function(a){return a.partnerId===id && (!a.lifecycle || a.lifecycle.legacy);}),facts=p.facts;
    var html='<div class="card diplomacy-partner-overview"><h3>Institucionet dhe negociatat</h3><p>Statuset janë fotografi nga burimet zyrtare më '+esc(p.checkedAt)+'. Propozimet, reagimet, shumat dhe efektet e lojës janë simulim. Nuk garantohet anëtarësim, miratim ose financim.</p><label>Institucioni ose pala<select id="internationalPartner" onchange="internationalSelectedPartner=this.value;renderInternationalDiplomacy()">'+Object.keys(db.institutions).map(function(key){return '<option value="'+esc(key)+'" '+(key===id?'selected':'')+'>'+esc(db.institutions[key].facts.name)+'</option>';}).join('')+'</select></label><div class="diplomacy-fact-block"><h3>'+esc(facts.name)+'</h3><p>'+esc(facts.status)+'</p><p><strong>Marrëdhënia:</strong> '+internationalRelation(id)+'/100</p></div><div class="diplomacy-fact-block"><p><strong>Interesat:</strong> '+esc(facts.interests)+'</p><p><strong>Kufizimet dhe çështjet e hapura:</strong> '+esc(facts.limits)+'</p></div><div class="diplomacy-source-links">'+facts.sources.map(function(url){return '<a href="'+esc(url)+'" target="_blank" rel="noopener">Burimi zyrtar</a> ';}).join('')+'</div></div>';
    if(!n || ['ACCEPTED','REJECTED','EXPIRED'].includes(n.status))html+='<div class="card"><h3>Nis proces diplomatik</h3><label>Tema<select id="internationalTopic">'+facts.topics.map(function(t){return '<option value="'+t+'">'+INTERNATIONAL_TOPICS[t].name+'</option>';}).join('')+'</select></label><label>Qëllimi<textarea id="internationalGoal" maxlength="400"></textarea></label><button class="action-btn" id="internationalStart" onclick="internationalStartFromForm()">Nis negociatën</button></div>';
    if(n){
        if(n.amendmentRequest)html+='<div class="card"><h4>Ndryshimet e kërkuara</h4><p>Nenet '+n.amendmentRequest.articles.join(', ')+': '+esc(n.amendmentRequest.text)+'</p><p>Paraqitni propozimin e rishikuar; dokumenti paraprak mbetet në arkiv.</p></div>';
        var editable=['DRAFT','COUNTER','OFFERED'].includes(n.status),latest=n.rounds.at(-1),defaults=latest?latest.counter:{commitment:2,weeks:8,requestedM:0};
        html+='<div class="card"><h3>'+esc(INTERNATIONAL_TOPICS[n.topic].name)+'</h3><p>'+esc(n.goal)+' · '+INTERNATIONAL_STATUS[n.status]+' · Afati: java '+n.expiresTurn+'</p><p>Çdo raund kushton €50 000. Lejohet një raund për këtë negociatë në javë, deri në katër raunde.</p>'+n.rounds.map(function(r){return '<article class="international-round"><h4>Raundi '+r.number+' · Java '+r.turn+'</h4><p><strong>Propozimi juaj:</strong> '+esc(r.proposalText)+'</p><p>'+esc(r.text)+'</p><p>Kundërpropozimi: angazhim '+r.counter.commitment+'/3, mbikëqyrje, '+r.counter.weeks+' javë; financim i kushtëzuar deri €'+r.counter.requestedM+'M.</p></article>';}).join('');
        if(editable)html+='<div class="international-form"><label>Propozimi ose kundërpropozimi<textarea id="internationalProposalText" maxlength="800"></textarea></label><label>Angazhimi<select id="internationalCommitment">'+[1,2,3].map(function(v){return '<option value="'+v+'" '+(v===defaults.commitment?'selected':'')+'>'+['I kufizuar','I matshëm','I zgjeruar'][v-1]+'</option>';}).join('')+'</select></label><label><input type="checkbox" id="internationalOversight" checked> Pranoj mbikëqyrjen dhe raportimin</label><label>Afati i zbatimit (6–12 javë)<input type="number" id="internationalWeeks" min="6" max="12" value="'+defaults.weeks+'"></label><label>Kredi e kërkuar e simuluar, në milionë euro<input type="number" id="internationalAmount" min="0" max="'+(n.topic==='FINANCE'?20:0)+'" value="'+defaults.requestedM+'" '+(n.topic==='FINANCE'?'':'readonly')+'></label><button class="action-btn" id="internationalSubmit" onclick="internationalProposalFromForm(\''+n.id+'\')">Dërgo propozimin</button></div>';
        if(n.status==='OFFERED')html+='<button class="action-btn" id="internationalAccept" onclick="decideInternationalNegotiation(\''+n.id+'\',\'ACCEPT\')">Prano paketën e kushtëzuar</button>';
        if(editable)html+='<button class="btn-top" id="internationalSuspend" onclick="decideInternationalNegotiation(\''+n.id+'\',\'SUSPEND\')">Pezullo</button><button class="btn-top" id="internationalReject" onclick="decideInternationalNegotiation(\''+n.id+'\',\'REJECT\')">Refuzo</button>';
        if(n.status==='SUSPENDED')html+='<button class="action-btn" id="internationalResume" onclick="decideInternationalNegotiation(\''+n.id+'\',\'RESUME\')">Vazhdo negociatën</button>';
        html+='<details><summary>Vendimet dhe takimet</summary>'+n.decisions.map(function(d){return '<p>Java '+d.at.turn+': '+({ACCEPT:'Pranim i kushtëzuar',REJECT:'Refuzim',SUSPEND:'Pezullim',RESUME:'Vazhdim',EXPIRED:'Skadim'}[d.decision] || 'Vendim')+'</p>';}).join('')+'<p>'+db.meetings.filter(function(m){return m.negotiationId===n.id;}).length+' takime të regjistruara</p></details></div>';
    }
    html+='<div class="card"><h3>Marrëveshjet dhe detyrimet</h3>'+(agreements.length?'':'<p>Nuk ka marrëveshje të reja të regjistruara me këtë palë.</p>')+agreements.map(function(a){var law=a.lawId && state.laws.find(function(l){return l.id===a.lawId;});return '<article class="international-agreement"><h4>'+esc(INTERNATIONAL_TOPICS[a.topic].name)+' — '+INTERNATIONAL_STATUS[a.status]+'</h4><p>Ministria përgjegjëse: '+esc((state.ministries.find(function(m){return m.id===INTERNATIONAL_TOPICS[a.topic].ministry;}) || {name:'Për koordinim ndërministror'}).name)+' · Afati: java '+a.deadlineTurn+'</p><p>Shqyrtimi i jashtëm: '+INTERNATIONAL_STATUS[a.externalReview.status]+' (nga java '+a.externalReview.dueTurn+')</p>'+(law?'<p>Ratifikimi kërkon 80 vota pro në Kuvend. Gjendja: '+esc(getBillStatusLabel(law.status))+'</p><button class="btn-top" onclick="openInternationalRatification(\''+a.id+'\')">Hap aktin në Kuvend</button>':'<p>Plan teknik i simulimit, jo traktat i ri ose ndryshim statusi ndërkombëtar.</p>')+'<p>Kostoja vendore totale: €'+(a.terms.commitment)+'M · Kredi: €'+a.terms.requestedM+'M · '+INTERNATIONAL_STATUS[a.financing.status]+'</p>'+(a.terms.requestedM?'<p>Kredia nuk është grant. Kryegjëja shlyhet 12 javë pas lëvrimit; interesi trajtohet nga modeli fiskal ekzistues, jo si kushte reale të institucionit.</p>':'')+a.milestones.map(function(m,i){return '<p>'+esc(m.title)+' — '+(m.status==='DONE'?'E kryer':'Në pritje')+' · Nga java '+m.dueTurn+' · €'+(m.costB*1000).toFixed(1)+'M</p>'+(a.status==='CONDITIONAL' && m.status==='PLANNED'?'<button class="action-btn" onclick="completeInternationalMilestone(\''+a.id+'\','+i+')">Zbato hapin '+(i+1)+'</button>':'');}).join('')+(['DISBURSED','OVERDUE'].includes(a.financing.status)?'<p>Shlyerja: java '+a.financing.repaymentDue+'</p><button class="action-btn" onclick="repayInternationalLoan(\''+a.id+'\')">Shlyej kryegjënë e kredisë</button>':'')+'<details><summary>Historiku i marrëveshjes</summary>'+a.history.map(function(h){return '<p>Java '+h.turn+': '+esc(h.text)+'</p>';}).join('')+'</details></article>';}).join('')+'<button class="btn-top" onclick="checkInternationalAgreements()">Kontrollo kushtet dhe miratimet</button></div>';
    var earlier=db.negotiations.filter(function(old){return old.partnerId===id && (!n || old.id!==n.id);});
    if(earlier.length)html+='<div class="card"><details><summary>Negociatat e mëparshme me këtë palë ('+earlier.length+')</summary>'+earlier.map(function(old){return '<article class="international-round"><h4>'+esc(old.goal)+' — '+INTERNATIONAL_STATUS[old.status]+'</h4>'+old.rounds.map(function(r){return '<p>Java '+r.turn+', raundi '+r.number+': '+esc(r.proposalText)+'</p><p>'+esc(r.text)+'</p>';}).join('')+'</article>';}).join('')+'</details></div>';
    host.innerHTML='<div class="diplomacy-workspace">'+html+renderInternationalCommunications(id)+renderAgreementDocumentLinks(id)+'</div>';
    decoratePoliticalScene("internationalDiplomacyPanel",politicalSceneKind(id,n && ["DRAFT","COUNTER","OFFERED","SUSPENDED"].includes(n.status)?n:null),{name:facts.name,role:"Delegacion i simuluar",topic:n?n.goal:facts.interests,detail:n && n.rounds.length?n.rounds.at(-1).text:facts.limits,stage:n?INTERNATIONAL_STATUS[n.status]:"Konsultim paraprak"});
}
function openInternationalRatification(id){var a=internationalAgreement(id);if(!a || !a.lawId)return false;switchMainTab('tab-assembly');switchSubTab('ass','laws',document.querySelectorAll('#tab-assembly .sub-pill')[2]);renderAssemblySection();return true;}
function internationalMeetingPartner(m){
    if(m.internationalPartnerId && state.internationalDiplomacy.institutions[m.internationalPartnerId])return m.internationalPartnerId;
    var text=m.targetName || '';
    return /SHBA|Ambasadori Amerikan/.test(text)?'USA':/BE-së/.test(text)?'EU':/Gjerman|Francës/.test(text)?'GERMANY':/Mbretërisë së Bashkuar/.test(text)?'UK':/NATO|COMKFOR/.test(text)?'NATO':/Republikës së Shqipërisë/.test(text)?'ALBANIA':/Republikës së Turqisë/.test(text)?'TURKEY':null;
}

// Phase 12: communications share the existing diplomatic registry, relations and clock.
// Calls exchange information, not money or guaranteed political support. Only an
// actual later negotiation round can discharge a promised technical follow-up.
const INTERNATIONAL_COMMUNICATION_GOALS={INFO:'Shqyrtimi i qëndrimeve',COORDINATE:'Konsultim për hapat e ardhshëm',FOLLOWUP:'Paraqitje e dosjes në raundin e ardhshëm'};
const INTERNATIONAL_COMMUNICATION_STATUS={COMPLETED:'Komunikim i kryer',SCHEDULED:'Takim në pritje',CANCELLED:'I anuluar',MISSED:'Takimi nuk u zhvillua'};
const INTERNATIONAL_COMMUNICATION_KINDS={CALL:'Telefonatë',CONSULTATION:'Konsultim',VISIT:'Vizitë'};
function validateInternationalCommunications(st){
    var db=st.internationalDiplomacy,ids=new Set();
    if(typeof db.communications==='undefined')return; // Old saves are validated before migration.
    if(!Array.isArray(db.communications))throw Error('Historiku i komunikimeve mungon.');
    db.communications.forEach(function(c){
        if(!c || typeof c!=='object')throw Error('Komunikim diplomatik i pavlefshëm.');
        var p=db.institutions[c.partnerId],m=(st.scheduledMeetings||[]).find(function(m){return m.id===c.meetingId;});
        if(!c || !/^communication:\d+$/.test(c.id) || ids.has(c.id) || !p || !p.facts.topics.includes(c.topic) || !['CALL','CONSULTATION','VISIT'].includes(c.kind) || !Object.hasOwn(INTERNATIONAL_COMMUNICATION_GOALS,c.goal) || !Object.hasOwn(INTERNATIONAL_COMMUNICATION_STATUS,c.status) || !Number.isInteger(c.createdTurn) || c.createdTurn>st.turnCount || !Number.isInteger(c.dueTurn) || c.dueTurn<c.createdTurn || !st.parties[c.ownerParty] || typeof c.executive!=='boolean' || typeof c.response!=='string' || !Array.isArray(c.history) || c.kind==='VISIT' && (!m || m.communicationId!==c.id) || c.status==='COMPLETED' && (!Number.isInteger(c.completedTurn) || c.completedTurn<c.dueTurn || c.completedTurn>st.turnCount))throw Error('Komunikim diplomatik i pavlefshëm ose i dyfishuar.');
        ids.add(c.id);
        if(c.promise && (!c.executive || c.goal!=='FOLLOWUP' || !['OPEN','FULFILLED','BROKEN'].includes(c.promise.status) || c.promise.dueTurn!==c.completedTurn+3 || c.promise.status==='FULFILLED' && !db.negotiations.some(function(n){return n.id===c.promise.negotiationId && n.partnerId===c.partnerId && n.topic===c.topic && n.rounds.some(function(r){return r.turn>c.completedTurn && r.turn<=c.promise.dueTurn;});})))throw Error('Zotim diplomatik pa veprim mbështetës.');
    });
}
function communicationCommit(change){
    if(!state || state.weeklyProcessing || state.pendingVote){showToast('Përfundoni procesin aktual para komunikimit.');return false;}
    var before=JSON.stringify(state);
    try{change(state.internationalDiplomacy);sealInternationalState(state.internationalDiplomacy);validateLoadedState(state);if(!saveGameAuto()){state=JSON.parse(before);return false;}}
    catch(error){state=JSON.parse(before);showToast('Komunikimi nuk u regjistrua: '+error.message);return false;}
    refreshAllUI();return true;
}
function completeInternationalCommunication(c){
    if(c.status!=='SCHEDULED' || state.turnCount<c.dueTurn)return false;
    if(c.ownerParty!==state.playerParty || c.executive && !agendaExecutive()){c.status='CANCELLED';c.response='Takimi u anulua pas ndryshimit të kompetencave.';return false;}
    var db=state.internationalDiplomacy,relation=internationalRelation(c.partnerId),failed=db.agreements.filter(function(a){return a.partnerId===c.partnerId && a.status==='FAILED';}).length+db.communications.filter(function(old){return old.partnerId===c.partnerId && old.promise && old.promise.status==='BROKEN';}).length;
    var sector=state.stateSectors.find(function(s){return s.id===INTERNATIONAL_TOPICS[c.topic].sector;});
    c.status='COMPLETED';c.completedTurn=state.turnCount;
    c.response=relation<40 || failed>1 || sector && sector.score<35?'Pala shprehu rezerva për besimin dhe zbatimin e angazhimeve. Nuk dha mbështetje për një marrëveshje.':relation>=65?'Pala pranoi të shqyrtojë hapa konkretë. Mbështetja dhe çdo ofertë mbeten për negociim.':'U shkëmbyen qëndrimet. Pala kërkon një dosje konkrete para se të japë përgjigje për bashkëpunim.';
    if(!c.executive)c.response='U zhvillua kontakt politik partiak. '+c.response+' Nuk u morën detyrime në emër të Qeverisë.';
    if(c.goal==='FOLLOWUP' && c.executive){c.promise={status:'OPEN',dueTurn:state.turnCount+3};c.response+=' U zotuat të paraqisni dosjen në një raund negociatash brenda tri javësh.';}
    c.history.push({turn:state.turnCount,text:c.response});
    if(c.kind==='CONSULTATION' && c.executive){state.dialogueConsultations[c.partnerId]={method:'CONSULTATION',topic:c.topic,communicationId:c.id,date:state.year+'/'+state.week};state.dialogueAlliesConsulted=true;}
    return true;
}
function requestInternationalCommunication(partnerId,topic,kind,goal){
    return communicationCommit(function(db){
        var p=db.institutions[partnerId],executive=agendaExecutive();
        if(!p || !p.facts.topics.includes(topic) || !['CALL','CONSULTATION','VISIT'].includes(kind) || !Object.hasOwn(INTERNATIONAL_COMMUNICATION_GOALS,goal))throw Error('Zgjidhni kontaktin, temën dhe qëllimin nga lista.');
        if(goal==='FOLLOWUP' && !executive)throw Error('Vetëm Qeveria mund të premtojë një dosje shtetërore.');
        if(db.communications.some(function(c){return c.ownerParty===state.playerParty && c.partnerId===partnerId && c.topic===topic && (c.status==='SCHEDULED' || c.createdTurn===state.turnCount);}))throw Error('Ky komunikim është regjistruar tashmë; vazhdoni procesin ekzistues.');
        var c={id:'communication:'+(++db.counter),ownerParty:state.playerParty,executive:executive,partnerId:partnerId,topic:topic,kind:kind,goal:goal,createdTurn:state.turnCount,dueTurn:state.turnCount+(kind==='VISIT'?1:0),status:'SCHEDULED',response:'Takimi pret zhvillimin në agjendë.',history:[]};
        db.communications.push(c);
        if(kind==='VISIT'){
            c.meetingId=c.id+':meeting';state.scheduledMeetings.unshift({id:c.meetingId,communicationId:c.id,internationalPartnerId:partnerId,ownerParty:state.playerParty,categoryKey:'INTL_DIPLOMATS',category:'Kontakt ndërkombëtar',targetName:p.facts.name,topic:INTERNATIONAL_TOPICS[topic].name,goal:INTERNATIONAL_COMMUNICATION_GOALS[goal],hour:'10:00',createdTurn:state.turnCount,dueTurn:c.dueTurn,status:'SCHEDULED',outcome:null,agenda6:executive,requiresExecutive:executive,political9:!executive,origin:'ORGANIZED',importance:'Mesatare'});
        }else completeInternationalCommunication(c);
    });
}
function finishInternationalCommunicationMeeting(m){
    if(!m.communicationId)return;
    var c=state.internationalDiplomacy.communications.find(function(c){return c.id===m.communicationId;});
    if(c && completeInternationalCommunication(c))m.outcome=c.response;
    sealInternationalState(state.internationalDiplomacy);
}
function processInternationalCommunications(){
    var db=state.internationalDiplomacy;
    db.communications.forEach(function(c){
        if(c.status==='SCHEDULED'){
            var m=state.scheduledMeetings.find(function(m){return m.id===c.meetingId;});
            if(c.ownerParty!==state.playerParty || c.executive && !agendaExecutive()){c.status='CANCELLED';if(m && m.status==='SCHEDULED')m.status='CANCELLED';c.response='Takimi u anulua pas ndryshimit të rolit politik.';c.history.push({turn:state.turnCount,text:c.response});}
            else if(m && ['MISSED','CANCELLED','DECLINED'].includes(m.status) || state.turnCount>c.dueTurn){c.status='MISSED';if(m && m.status==='SCHEDULED')m.status='MISSED';c.response='Takimi nuk u zhvillua brenda afatit.';c.history.push({turn:state.turnCount,text:c.response});}
        }
        if(!c.promise || c.promise.status!=='OPEN')return;
        var n=db.negotiations.find(function(n){return n.partnerId===c.partnerId && n.topic===c.topic && n.rounds.some(function(r){return r.turn>c.completedTurn && r.turn<=c.promise.dueTurn;});});
        if(n){c.promise.status='FULFILLED';c.promise.negotiationId=n.id;c.history.push({turn:state.turnCount,text:'Dosja u paraqit në raundin e regjistruar. Marrëveshja ende varet nga kushtet e saj.'});}
        else if(state.turnCount>c.promise.dueTurn){c.promise.status='BROKEN';internationalRelation(c.partnerId,-1);c.history.push({turn:state.turnCount,text:'Dosja e premtuar nuk u paraqit në afat; besimi i partnerit u dëmtua.'});}
    });
}
function openInternationalCommunication(partnerId,kind){
    var p=state.internationalDiplomacy.institutions[partnerId];if(!p){showToast('Ky kontakt nuk është i disponueshëm.');return false;}
    var esc=electoralEscape,box=document.getElementById('interactiveActionModalContent');if(!box)return false;
    box.innerHTML='<div class="card communication12"><h3>'+esc(p.facts.name)+'</h3><p>'+(agendaExecutive()?'Komunikim i Qeverisë':'Kontakt politik partiak')+'. Telefonatat dhe konsultimet shkëmbejnë qëndrime; vizita zhvillohet nga java e ardhshme në agjendë. Nuk ka kosto të re për këto kontakte në modelin ekzistues.</p><label>Forma<select id="communicationKind">'+[['CALL','Telefonatë'],['CONSULTATION','Konsultim'],['VISIT','Vizitë në agjendë']].map(function(v){return '<option value="'+v[0]+'" '+(v[0]===kind?'selected':'')+'>'+v[1]+'</option>';}).join('')+'</select></label><label>Tema<select id="communicationTopic">'+p.facts.topics.map(function(t){return '<option value="'+t+'">'+esc(INTERNATIONAL_TOPICS[t].name)+'</option>';}).join('')+'</select></label><label>Qëllimi<select id="communicationGoal">'+Object.keys(INTERNATIONAL_COMMUNICATION_GOALS).filter(function(g){return g!=='FOLLOWUP' || agendaExecutive();}).map(function(g){return '<option value="'+g+'">'+INTERNATIONAL_COMMUNICATION_GOALS[g]+'</option>';}).join('')+'</select></label><button class="action-btn" onclick="confirmInternationalCommunication(\''+esc(partnerId)+'\')">Konfirmo komunikimin</button><button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button></div>';
    toggleModal('interactiveActionModal',true);return true;
}
function confirmInternationalCommunication(partnerId){
    var topic=document.getElementById('communicationTopic'),kind=document.getElementById('communicationKind'),goal=document.getElementById('communicationGoal');
    if(!topic || !kind || !goal){showToast('Rihapni panelin për një komunikim të ri.');return false;}
    if(!requestInternationalCommunication(partnerId,topic.value,kind.value,goal.value))return false;
    var c=state.internationalDiplomacy.communications.at(-1);
    document.getElementById('interactiveActionModalContent').innerHTML='<div class="card"><h3>'+INTERNATIONAL_COMMUNICATION_STATUS[c.status]+'</h3><p>'+electoralEscape(c.response)+'</p><button class="btn-top" onclick="toggleModal(\'interactiveActionModal\',false)">Mbyll</button></div>';return true;
}
function renderInternationalCommunications(id){
    var esc=electoralEscape,records=state.internationalDiplomacy.communications.filter(function(c){return c.partnerId===id;});
    return '<div class="card communication12"><h3>Telefonatat, konsultimet dhe vizitat</h3><button class="action-btn" onclick="openInternationalCommunication(\''+esc(id)+'\',\'CALL\')">Zgjidh komunikimin</button>'+records.slice().reverse().map(function(c){var m=c.meetingId && state.scheduledMeetings.findIndex(function(m){return m.id===c.meetingId;});return '<article><strong>'+INTERNATIONAL_COMMUNICATION_KINDS[c.kind]+' · '+INTERNATIONAL_COMMUNICATION_STATUS[c.status]+'</strong><p>Java '+c.createdTurn+' · '+esc(INTERNATIONAL_TOPICS[c.topic].name)+' · '+INTERNATIONAL_COMMUNICATION_GOALS[c.goal]+'</p><p>'+esc(c.response)+'</p>'+(c.status==='SCHEDULED'?'<p>Takimi: java '+c.dueTurn+'</p>'+(state.turnCount>=c.dueTurn && c.ownerParty===state.playerParty && (!c.executive || agendaExecutive())?'<button class="btn-top" onclick="openScheduledVisualMeeting('+m+')">Zhvillo takimin</button>':''):'')+(c.promise?'<p>Dosja: '+({OPEN:'Në pritje',FULFILLED:'E paraqitur',BROKEN:'Afat i humbur'}[c.promise.status])+' · Afati: java '+c.promise.dueTurn+'</p>':'')+'<details><summary>Historiku</summary>'+c.history.map(function(h){return '<p>Java '+h.turn+': '+esc(h.text)+'</p>';}).join('')+'</details></article>';}).join('')+'</div>';
}
