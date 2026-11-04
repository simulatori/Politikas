/* Emrat: MAPL, https://mapl.rks-gov.net/portali-i-komunave/, kontrolluar 21.10.2026.
   Çdo propozim, nevojë, kosto dhe përfitim më poshtë është simulim. */
const MUNICIPAL_14_ROWS = [
['prishtina','Prishtinë','Korsi autobusësh me përparësi~transport~Semaforë të koordinuar dhe ndalesa të qasshme për udhëtime urbane~8~16','Çerdhe me oborr të gjelbër~education~Përshtatje e një objekti për kujdes parashkollor dhe lojë në natyrë~3~12','Regjistër elektronik i lejeve~digital~Gjurmim i kërkesave ndërtimore dhe publikim i afateve të përgjigjes~1~8'],
['podujeva','Podujevë','Pika grumbullimi të qumështit~economy~Ftohje dhe kontroll cilësie për prodhuesit e vegjël të qumështit~2~10','Drenazh pranë shkollave periferike~water~Kanale atmosferike për qasje të sigurt në oborret shkollore~3~14','Kabinete mësimore për bujqësi~education~Pajisje praktike për mësim të prodhimit bimor në shkollën profesionale~1.2~8'],
['lipjani','Lipjan','Lidhje biçikletash me stacionin~transport~Shtigje dhe parkim i mbuluar për lidhjen e lagjeve me hekurudhën~2.5~12','Sistem ujitjeje me matës~water~Rrjet demonstrues me matje konsumi për parcela të vogla~3~16','Qendër për paketim ushqimor~economy~Laborator higjiene dhe paketimi për ndërmarrje familjare~2~10'],
['fushkosova','Fushë Kosovë','Nënkalim këmbësorësh i qasshëm~transport~Rampa dhe ndriçim për kalim të sigurt pranë korridorit hekurudhor~4~18','Turn shtesë në mjekësinë familjare~health~Pajisje diagnostike dhe hapësira për vizita pas orarit~1.5~10','Klasa modulare për filloristë~education~Hapësira të përkohshme mësimore me ventilim dhe siguri nga zjarri~2~8'],
['obiliqi','Obiliq','Rrjet sensorësh të ajrit~environment~Matje lokale dhe panel publik për ekspozimin e lagjeve ndaj ndotjes~1~8','Izolim termik i banesave sociale~energy~Fasada dhe dritare për uljen e kërkesës për ngrohje~4~16','Ambulancë për kontroll respirator~health~Spirometri dhe konsultime për probleme të frymëmarrjes~1.3~10'],
['drenasi','Gllogoc','Ripërdorim i ujit industrial~water~Impiant demonstrues për trajtim dhe përdorim teknik të ujit~5~20','Punëtori për mirëmbajtje makinerish~economy~Trajnim praktik për riparim pajisjesh në ndërmarrjet prodhuese~2~12','Sallë sportive e hapur pas mësimit~sport~Përshtatje e sallës shkollore për përdorim komunitar me orare~1.8~12'],
['gracanica','Graçanicë','Shërbime komunale shumëgjuhëshe~digital~Formularë dhe sportel elektronik me ndihmë për përdoruesit~0.8~8','Treg i zejtarëve lokalë~culture~Stenda pune dhe ekspozimi për artizanë të komuniteteve~1.2~10','Rrugë të sigurta për këmbësorë~transport~Trotuare dhe kalime të ndriçuara drejt qendrës së shërbimeve~2~12'],
['novoberda','Novobërdë','Shteg interpretimi i trashëgimisë~culture~Sinjalistikë dhe guida audio për peizazhin historik pa ndërhyrje në monumente~1~10','Rezervuar për vendbanime kodrinore~water~Depozitim dhe kontroll presioni për furnizim në lartësi~3~16','Mjekësi lëvizëse për fshatrat~health~Automjet i pajisur për kontrolle periodike në vendbanime të shpërndara~0.9~8'],
['prizreni','Prizren','Punëtori restaurimi artizanal~culture~Trajnim për riparimin e elementeve tradicionale prej druri~1.5~12','Kapje e mbeturinave në përrenj~environment~Barriera grumbulluese dhe pika ndarjeje para daljeve në lumë~2~12','Orientim këmbësorësh në qendrën historike~transport~Tabela të qasshme dhe itinerare për të shmangur përplasjen me automjetet~1~8'],
['suhareka','Suharekë','Laborator për vreshtarët~economy~Analiza të tokës dhe të rrushit për kooperativa të vogla~1.6~10','Rikuperim i ujit për sera~water~Mbledhje reshjesh dhe filtrim për përdorim jo të pijshëm~2~12','Qendër rehabilitimi sportiv~sport~Pajisje fizioterapie për sportistët e klubeve lokale~1.3~10'],
['malisheva','Malishevë','Pikë ditore për kujdes të të moshuarve~health~Hapësira për rehabilitim të lehtë dhe orientim shëndetësor~1.2~10','Lidhje të sigurta të fshatrave me tregun~transport~Bankina dhe vendndalime për automjetet bujqësore~3~16','Program kompostimi familjar~environment~Pajisje dhe pika për përpunimin lokal të mbetjeve organike~0.7~8'],
['dragashi','Dragash','Strehimore orientuese malore~culture~Pika informimi për ecje të përgjegjshme dhe siguri në terren~1~12','Përpunim i përbashkët i leshit~economy~Larje dhe përpunim për prodhuesit e produkteve artizanale~1.4~12','Klasa digjitale në terren malor~education~Pajisje jashtë linje dhe lidhje mësimore për shkolla të largëta~1.1~10'],
['mamusha','Mamushë','Kontroll biologjik në sera~environment~Fidanë demonstrues dhe pajisje për uljen e përdorimit të pesticideve~0.8~8','Dhomë frigoriferike për perime~economy~Ruajtje e përbashkët për të zgjatur kohën e tregtimit~1.5~12','Rrjet pikues për kopshte shkollore~education~Kopsht mësimor për kursimin e ujit dhe kultivimin praktik~0.5~8'],
['peja','Pejë','Menaxhim i vizitorëve në shtigje~culture~Numërim vizitorësh dhe sinjalizim i kapacitetit për itinerare natyrore~1.2~10','Stacion selektimi i mbetjeve të gjelbra~environment~Përpunim degësh dhe mbetjesh nga parqet në material mulçues~2~12','Qendër e aftësive për mikpritje~education~Kuzhinë mësimore dhe trajnim i shërbimit për bujtina~1.8~12'],
['istogu','Istog','Higjiena e kanaleve të peshkultivimit~water~Filtrim demonstrues dhe monitorim i ujit dalës~2~14','Pikë grumbullimi e frutave~economy~Peshim dhe klasifikim për prodhuesit sezonalë~1.3~10','Transport i rezervueshëm shëndetësor~health~Shërbim orientimi dhe automjet për pacientë me lëvizshmëri të kufizuar~0.9~8'],
['klina','Klinë','Mbrojtje e puseve lokale~water~Zona mbrojtëse dhe testim i ujit në pikat e furnizimit~2~12','Qasje në stacionet hekurudhore~transport~Rampa dhe informacion për këmbësorët pranë peroneve~1.5~10','Bibliotekë me laborator leximi~education~Pajisje për lexim të asistuar dhe aktivitete për fëmijë~0.8~8'],
['gjakova','Gjakovë','Arkiv digjital i zejeve~culture~Dokumentim i proceseve artizanale dhe katalog për vizitorët~0.9~10','Inkubator për riparim elektronik~economy~Tryeza pune dhe pajisje testimi për biznese të reja~1.7~12','Rikthim i hijes në sheshe~environment~Pemë dhe sipërfaqe përthithëse për uljen e nxehtësisë urbane~1.4~12'],
['rahoveci','Rahovec','Përpunim i mbetjeve të rrushit~environment~Kompostim dhe prova për përdorimin e nënprodukteve të vreshtarisë~1.5~12','Rrugica logjistike për vjelje~transport~Vendkalime dhe pika shkarkimi për transportin sezonal~2.2~14','Qendër këshillimi për eksport~economy~Gjurmim produkti dhe mbështetje për dokumentacion tregtar~0.8~8'],
['decani','Deçan','Rrjet orientimi për bujtina~culture~Rezervim dhe informacion për itinerare me kapacitet të kufizuar~0.8~8','Mbrojtje nga erozioni i shpateve~environment~Mbjellje stabilizuese dhe drenazh në segmente demonstrimi~3~18','Ngrohje efikase e shkollës profesionale~energy~Kontroll temperaturash dhe izolim i një objekti mësimor~1.6~12'],
['juniku','Junik','Punëtori dokumentimi të kullave~culture~Modelim dhe trajnim konservimi pa pretendim për restaurim të miratuar~0.7~10','Pikë furnizimi për ecësit~water~Çezmë e kontrolluar dhe sistem i vogël trajtimi~0.6~8','Qendër për produkte pyjore~economy~Tharje dhe paketim i bimëve të kultivuara në mënyrë të qëndrueshme~0.9~10'],
['mitrovica_j','Mitrovicë e Jugut','Laborator për aftësi metalpunuese~education~Simulues dhe pajisje sigurie për praktikë profesionale~2~12','Rigjallërim i hapësirës breglumore~environment~Pastrimi dhe sipërfaqe përshkuese për përdorim publik~2.5~16','Qendër shërbimi për ndërmarrje teknike~economy~Këshillim dhe prototipim për punishte vendore~1.4~10'],
['vushtrria','Vushtrri','Magazinim i ajrosur i patates~economy~Kontroll lagështie për ruajtjen sezonale të prodhimit~1.8~12','Matje e humbjeve në ujësjellës~water~Matës zonalë dhe kërkim rrjedhjesh për riparime të synuara~2.2~14','Hapësirë për mësim të historisë lokale~culture~Ekspozim edukativ dhe materiale për vizita shkollore~0.7~8'],
['skenderaj','Skënderaj','Rezervë uji për shkollat rurale~water~Depozita higjienike dhe kontrolle të furnizimit shkollor~1.8~12','Transport për aftësim profesional~transport~Minibus i qasshëm dhe pika pritjeje për nxënës~1~10','Studio komunitare e kujtesës gojore~culture~Regjistrim dëshmish me pëlqim dhe ekspozim mësimor~0.6~8'],
['mitrovica_v','Mitrovicë e Veriut','Sportel shëndetësor ndërkomunitar~health~Orientim shumëgjuhësh dhe termine të koordinuara~0.8~8','Ndriçim i rrugëve drejt kampusit~transport~Ndriçim efikas dhe kalime për studentë e këmbësorë~1.3~10','Punëtori rinore e robotikës~education~Pajisje elektronike dhe sesione mësimi të hapura~0.7~8'],
['zvecani','Zveçan','Monitorim i tokës në hapësira publike~environment~Marrje mostrash dhe sinjalizim për përdorim të sigurt~0.9~10','Qendër e vogël fizioterapie~health~Pajisje rehabilitimi dhe qasje për persona me aftësi të kufizuara~1.1~10','Digjitalizim i arkivit të adresave~digital~Kontroll i adresave dhe kërkim elektronik i dokumenteve~0.5~8'],
['leposaviqi','Leposaviq','Lidhje të ambulancave periferike~health~Telekonsulta dhe pajisje për vizita të shpërndara~1.4~12','Urëza për rrugë bujqësore~transport~Kalime të vogla të standardizuara mbi kanale kulluese~2~14','Tharje e përbashkët e frutave pyjore~economy~Përpunim higjienik për prodhues të vegjël sezonalë~1~10'],
['zubinpotoku','Zubin Potok','Pika për cilësinë e ujit liqenor~water~Monitorim dhe njoftim publik për përdorimin rekreativ të ujit~1~10','Shteg me mbledhje të mbeturinave~environment~Stacione kthimi dhe mirëmbajtje për itinerare pranë ujit~0.8~10','Pajisje shpëtimi për aktivitete ujore~sport~Trajnim dhe mjete sigurie për klube rekreative~0.6~8'],
['gjilani','Gjilan','Koordinim digjital i trafikut~digital~Numërim fluksi dhe menaxhim i kryqëzimeve me të dhëna~1.5~12','Qendër për përpunim tekstili~economy~Makineri prerjeje dhe trajnim për ndërmarrje të vogla~2~12','Kabinet shëndetësor për fëmijë~health~Pajisje për kontrolle parandaluese dhe këshillim familjar~1.1~10'],
['vitia','Viti','Kanale kulluese të parcelave~water~Pastrimi dhe rikonstruktimi i segmenteve për kullim bujqësor~2~14','Klasa praktike për teknologji ushqimore~education~Pajisje për testim dhe konservim të produkteve ushqimore~1~10','Shtigje sportive për familje~sport~Qark ecjeje me pajisje të qasshme dhe zona pushimi~0.9~10'],
['kamenica','Kamenicë','Mësim i përbashkët në distancë~education~Lidhje mes klasave të vogla dhe materiale shumëgjuhëshe~1~10','Mobilitet për fshatra të shpërndara~transport~Linje provuese sipas kërkesës me pika të përcaktuara~1.5~12','Punëtori për përpunim druri~economy~Pajisje me mbrojtje pluhuri dhe trajnim për prodhim mobiliesh~1.3~12'],
['ranillugu','Ranillug','Sportel lëvizës i dokumenteve~digital~Pajisje portative dhe orare shërbimi në vendbanime~0.4~8','Kontroll i ujit në puse familjare~water~Komplete testimi dhe trajtim demonstrues i furnizimit~0.8~10','Fushë shumëfunksionale komunitare~sport~Sipërfaqe e sigurt me orare për shkollën dhe banorët~0.7~10'],
['parteshi','Partesh','Qendër për ruajtjen e farërave~economy~Depozitim dhe ndërrim i farërave për prodhues të vegjël~0.6~8','Korridor i sigurt shtëpi-shkollë~transport~Ngadalësues shpejtësie dhe trotuare në qasje shkollore~0.8~10','Kabinet infermieror komunitar~health~Pajisje për matje rutinore dhe kujdes në shtëpi~0.5~8'],
['kllokoti','Kllokot','Qasje e sigurt në hapësira termale~health~Rampa dhe higjienë në hapësira demonstrimi rehabilitues~1~10','Matje e konsumit të ujit termal~water~Monitorim demonstrues për përdorim të qëndrueshëm të burimeve~0.8~10','Trajnim për mikpritje të qasshme~education~Pajisje dhe mësim praktik për shërbime turistike gjithëpërfshirëse~0.5~8'],
['ferizaj','Ferizaj','Informacion udhëtimi në nyjën hekurudhore~transport~Tabela për ndërlidhje autobus-tren dhe orientim të qasshëm~1.2~10','Laborator për dizajn mobiliesh~economy~Prototipim digjital dhe testim për punishte prodhuese~2~12','Sistem riciklimi në tregje~environment~Ndarje kartoni dhe mbetjesh organike pranë pikave tregtare~1.1~10'],
['kacaniku','Kaçanik','Mbrojtje e rrugëve nga rrëshqitjet~transport~Drenazh dhe rrjeta në segmente të vogla të rrezikuara në simulim~3~16','Trajtim demonstrues i shkarkimeve~water~Impiant modular për ujëra të ndotura të një lagjeje~2.5~16','Atelie për zeje guri~culture~Pajisje sigurie dhe hapësira për mësim të teknikave artizanale~0.8~10'],
['hanielezit','Hani i Elezit','Filtra pluhuri në objekte publike~health~Ventilim dhe monitorim i brendshëm për hapësira komunitare~1.2~12','Logjistikë për sipërmarrje të vogla~economy~Platformë bashkëndarjeje transporti dhe magazinimi~1~10','Gjelbërim mbrojtës përgjatë korridoreve~environment~Breza bimorë demonstrues dhe mirëmbajtje e sipërfaqeve publike~1.4~12'],
['shtimja','Shtime','Laborator inovacioni për nxënës~education~Pajisje për prototipim të thjeshtë dhe eksperimente shkencore~0.9~10','Qendër ditore e aftësimit për punë~economy~Punëtori të përshtatura për persona me nevoja mbështetëse~1.3~12','Rrjet i pikave për ujë të pijshëm~water~Çezma publike me kontroll higjienik dhe matje konsumi~0.7~10'],
['shterpce','Shtërpcë','Sistem paralajmërimi për shtigje dimërore~sport~Informacion mbi kushtet e simuluara dhe pajisje sinjalizimi~0.8~10','Eficiencë energjetike në bujtina provuese~energy~Matje dhe demonstrim i izolimit termik për mikpritjen malore~1.5~12','Grumbullim i ndarë në vendbanime malore~environment~Pika të mbuluara dhe orare grumbullimi sezonal~1.1~12']
];
const MUNICIPAL_14_SECTORS={
 education:{name:'Arsimi',sector:'sec_edu',ministry:'mashti',metric:'education',service:'Kushtet e mësimit'},
 health:{name:'Shëndetësia',sector:'sec_health',ministry:'msh',metric:'health',service:'Qasja në kujdes'},
 transport:{name:'Transporti',sector:'sec_roads',ministry:'mmphi',metric:'connectivity',service:'Lidhshmëria'},
 water:{name:'Uji dhe kanalizimi',sector:'sec_water',ministry:'mmphi',metric:'water',service:'Shërbimi i ujit'},
 economy:{name:'Ekonomia',sector:'sec_econ',ministry:'mint',metric:'employment',service:'Kapaciteti i punësimit'},
 environment:{name:'Mjedisi',sector:'sec_env',ministry:'mmphi',metric:'services',service:'Shërbimet mjedisore'},
 culture:{name:'Kultura dhe turizmi',sector:'sec_local',ministry:'mkrs',metric:'development',service:'Qasja kulturore'},
 sport:{name:'Sporti',sector:'sec_local',ministry:'mkrs',metric:'services',service:'Qasja sportive'},
 digital:{name:'Administrata digjitale',sector:'sec_tech',ministry:'mapl',metric:'services',service:'Shërbimet administrative'},
 energy:{name:'Energjia',sector:'sec_energy',ministry:'me',metric:'infrastructure',service:'Eficienca e objekteve'}
};

const MUNICIPAL_14_STATUS={AVAILABLE:'Në katalog',PROPOSED:'I propozuar',REVIEW:'Në shqyrtim',DEFERRED:'I shtyrë',REJECTED:'I refuzuar',APPROVED:'I miratuar',FUNDED:'I financuar',ACTIVE:'Në zbatim',DELAYED:'I vonuar',COMPLETED:'I përfunduar',CANCELLED:'I anuluar'};
const MUNICIPAL_14_METRICS={education:'Arsimi',health:'Shëndetësia',water:'Uji',connectivity:'Lidhshmëria',services:'Shërbimet',employment:'Punësimi',development:'Zhvillimi',infrastructure:'Infrastruktura'};
function municipal14Records(st){return (st.governmentCatalog?.projects||[]).filter(function(p){return p.municipal14;});}
function migrateMunicipalDevelopment(st){
    if(!st.governmentCatalog)throw Error('Kërkohet migrimi i Fazës 13 para katalogut komunal.');
    if(!Array.isArray(st.municipalities) || new Set(st.municipalities.map(function(m){return m.id;})).size!==38 || st.municipalities.length!==38)throw Error('Lista e komunave duhet të ketë saktësisht 38 identifikues unikë.');
    MUNICIPAL_14_ROWS.forEach(function(row){
        var mid='m_'+row[0],m=st.municipalities.find(function(x){return x.id===mid;});
        if(!m)throw Error('Mungon komuna në ruajtje: '+row[1]);
        m.name=({drenasi:'Drenas',skenderaj:'Skenderaj',novoberda:'Novo Bërdë'})[row[0]]||row[1];m.simulatedIndicators=true;m.nameSource='https://mapl.rks-gov.net/portali-i-komunave/';
        var profile=st.municipalityProfiles[m.id];if(profile && profile.citizenSatisfaction===undefined)profile.citizenSatisfaction=50;
        row.slice(2).forEach(function(spec,index){
            var id='mun14_'+row[0]+'_'+(index+1);
            if(st.governmentCatalog.projects.some(function(p){return p.id===id;}))return;
            var parts=spec.split('~'),kind=MUNICIPAL_14_SECTORS[parts[1]],ministry=st.ministries.find(function(x){return x.id===kind.ministry;});
            if(!ministry || !st.stateSectors.some(function(s){return s.id===kind.sector;}))throw Error('Sektori ose ministria mungon: '+parts[1]);
            var costM=Number(parts[3]),duration=Number(parts[4]);
            st.governmentCatalog.projects.push({
                id:id,municipal14:true,municipalityId:mid,title:parts[0],desc:parts[2],problem:'Nevojë për '+kind.service.toLocaleLowerCase('sq')+': '+parts[2]+'.',
                field:parts[1],sector:kind.sector,ministry:ministry.name,institution:'Zbatues: Komuna '+m.name+'; financues dhe mbikëqyrës: '+ministry.name,
                costB:costM/1000,duration:duration,fundingSource:'Buxheti qeveritar — ndarje e vetme në financim',
                serviceImpact:kind.service,metric:kind.metric,metricGain:+Math.min(1.8,0.4+Math.sqrt(costM)*0.35).toFixed(2),
                sectorGain:+Math.min(1.2,costM*0.12).toFixed(2),publicImpact:'Përmirëson vetëm shërbimin e përcaktuar. Rezultati ekonomik nuk garantohet; nuk jep rritje automatike politike.',
                status:'AVAILABLE',createdTurn:st.turnCount,createdDate:'Ende pa propozim',progress:0,elapsed:0,spentB:0,remainingB:0,
                fundingCommitted:false,effectsApplied:false,appliedFraction:0,effectMode:'GRADUAL',tasks:[],history:[],label:'Projekt i simuluar',approvalEffect:0
            });
        });
    });
    municipal14Records(st).forEach(function(p){
        if(p.effectMode===undefined){p.effectMode='COMPLETION';p.appliedFraction=p.effectsApplied?1:0;}
        if(p.approvedFundingB===undefined)p.approvedFundingB=p.fundingCommitted?p.costB:0;
    });
    validateMunicipalDevelopment(st);
}
function validateMunicipalDevelopment(st){
    var records=municipal14Records(st),ids=new Set();
    records.forEach(function(p){
        function invalid(){throw Error('Projekti komunal i ruajtur është i pavlefshëm: '+p.id);}
        if(ids.has(p.id) || !st.municipalities.some(function(m){return m.id===p.municipalityId;}) || !MUNICIPAL_14_STATUS[p.status])invalid();ids.add(p.id);
        if(!MUNICIPAL_14_SECTORS[p.field] || !MUNICIPAL_14_METRICS[p.metric] || !Number.isFinite(p.metricGain) || p.metricGain<0 || p.metricGain>2 || !Number.isFinite(p.sectorGain) || p.sectorGain<0 || p.sectorGain>1.2)invalid();
        if(!Number.isFinite(p.costB) || p.costB<=0 || !Number.isInteger(p.duration) || p.duration<1 || !Number.isFinite(p.progress) || p.progress<0 || p.progress>100 || !Number.isInteger(p.elapsed) || p.elapsed<0 || p.elapsed>p.duration || !Array.isArray(p.history) || !Array.isArray(p.tasks))invalid();
        if(!Number.isFinite(p.spentB) || !Number.isFinite(p.remainingB) || p.spentB<0 || p.remainingB<0 || p.spentB>p.costB+1e-8 || p.spentB+p.remainingB>p.costB+1e-8)invalid();
        var entry=st.governmentCatalog.ledger.find(function(e){return e.id===p.id;});
        if(p.fundingCommitted && (!entry || Math.abs(entry.costB-p.costB)>1e-8 || Math.abs(p.costB-p.spentB-p.remainingB)>1e-8))invalid();
        if(!p.fundingCommitted && (entry || p.spentB!==0 || p.remainingB!==0 || p.progress!==0))invalid();
        if(['FUNDED','ACTIVE','DELAYED','COMPLETED'].includes(p.status) && (!p.fundingCommitted || !Number.isInteger(p.lastTurn) || !Number.isInteger(p.deadlineTurn)))invalid();
        validateProjectEffectComponents(p);
        if(p.effectsApplied && p.status!=='COMPLETED' || p.status==='COMPLETED' && (p.progress!==100 || !p.effectsApplied && (!p.effectComponents || !Object.values(p.effectComponents.components).every(function(c){return c.processedFraction===1;}))))invalid();
        if(!['GRADUAL','COMPLETION'].includes(p.effectMode) || !Number.isFinite(p.appliedFraction) || p.appliedFraction<0 || p.appliedFraction>1 || !Number.isFinite(p.approvedFundingB) || p.approvedFundingB<0 || p.approvedFundingB>p.costB)invalid();
    });
    if(records.length!==114)throw Error('Katalogu komunal duhet të ketë 114 projekte.');
    (st.pmInboxRequests||[]).filter(function(r){return r.municipal14;}).forEach(function(r){if(!records.some(function(p){return p.id===r.projectId && p.municipalityId===r.municipalityId;}) || !Number.isInteger(r.dueTurn) || !Number.isInteger(r.postponements) || !Array.isArray(r.decisions))throw Error('Kërkesa komunale e ruajtur është e pavlefshme.');});
}
function municipal14Find(id){return municipal14Records(state).find(function(p){return p.id===id;});}
function municipal14Set(p,status,note){p.status=status;p.history.push({status:status,turn:state.turnCount,date:diplomaticDate(state.turnCount),note:note||''});}
function municipalProjectAction(id,action){
    if(!assertGovernmentAuthority('Vendimi për projektin komunal'))return false;
    if(state.pendingVote || weeklyProcessing || (state.weekCalendar?.transition && !weeklyVisualCommit)){showToast('Përfundoni votimin ose kalimin e javës para vendimit.');return false;}
    var p=municipal14Find(id);if(!p)return false;
    if(['APPROVE','FUND','RESUME'].includes(action)&&municipalAusterity(state)){showToast('FMN: investimet kapitale ne 38 komunat jane ngrire.');return false;}
    var before=JSON.stringify(state);
    if(action==='PROPOSE' && p.status==='AVAILABLE'){
        p.createdTurn=state.turnCount;p.createdDate=diplomaticDate(state.turnCount);municipal14Set(p,'PROPOSED','Propozuar për financim qeveritar.');
    }else if(action==='REVIEW' && p.status==='PROPOSED'){
        p.reviewTurn=state.turnCount;municipal14Set(p,'REVIEW','Shqyrtim i kostos dhe kapaciteteve nga ministria përgjegjëse.');
    }else if(action==='APPROVE' && p.status==='REVIEW'){
        if(state.turnCount<=p.reviewTurn){showToast('Shqyrtimi kërkon të paktën një javë.');return false;}
        if(p.costB>state.budgetTotalB){p.blockReason='Mungojnë fondet për miratim; kërkohet shtyrje ose refuzim.';refreshAllUI();showToast(p.blockReason);return false;}
        p.blockReason='';
        municipal14Set(p,'APPROVED','Miratim në simulim; ende pa ndarje fondesh.');
    }else if(action==='FUND' && p.status==='APPROVED'){
        var metricError=municipalFundingMetricError(state,p.municipalityId,{[p.metric]:p.metricGain});
        if(metricError){showToast(metricError);return false;}
        if(!catalogFund(p)){p.blockReason='Financimi i miratuar nuk mbulohet nga buxheti aktual; kërkohet vendim.';refreshAllUI();return false;}
        ensureProjectEffectComponents(p,true);
        p.blockReason='';p.approvedFundingB=p.costB;p.fundingCommitted=true;p.spentB=0;p.remainingB=p.costB;p.lastTurn=state.turnCount;p.deadlineTurn=state.turnCount+p.duration;
        p.tasks=[{title:'Përgatitja dhe koordinimi',done:false},{title:'Zbatimi teknik',done:false},{title:'Kontrolli dhe dorëzimi',done:false}];
        municipal14Set(p,'FUNDED','Financimi i plotë u zbrit një herë nga buxheti ekzistues.');
    }else if(action==='REJECT' && ['PROPOSED','REVIEW','APPROVED','DEFERRED'].includes(p.status)){
        p.blockReason='';municipal14Set(p,'REJECTED','Propozimi u refuzua pa ndarje fondesh.');
    }else if(action==='DEFER' && ['PROPOSED','REVIEW','APPROVED'].includes(p.status)){
        p.resumeTurn=state.turnCount+2;municipal14Set(p,'DEFERRED','Shqyrtimi u shty për dy javë; nuk janë ndarë fonde.');
    }else if(action==='REOPEN' && p.status==='DEFERRED'){
        if(state.turnCount<p.resumeTurn){showToast('Shqyrtimi rifillon më '+diplomaticDate(p.resumeTurn)+'.');return false;}
        p.reviewTurn=state.turnCount;p.blockReason='';municipal14Set(p,'REVIEW','Rihapet vlerësimi pas shtyrjes.');
    }else if(action==='CANCEL' && ['PROPOSED','REVIEW','DEFERRED','APPROVED','FUNDED','ACTIVE','DELAYED'].includes(p.status)){
        // Committed funding stays an obligation; there is no modeled refund procedure.
        p.delayReason='Anuluar me vendim; financimi i pashpenzuar mbetet i zotuar, pa rimbursim automatik.';
        municipal14Set(p,'CANCELLED',p.delayReason);
    }else if(action==='RESUME' && p.status==='DELAYED'){
        p.delayReason='';municipal14Set(p,'ACTIVE','Rifilluar pas rikthimit të Qeverisë funksionale.');
    }else return false;
    if(!municipal14Persist(before))return false;
    refreshAllUI();openMunicipalProject14(id);return true;
}
function processMunicipalDevelopmentWeek(){
    processMunicipalRequestsWeek();
    municipal14Records(state).forEach(function(p){
        if(!['FUNDED','ACTIVE','DELAYED'].includes(p.status) || p.lastTurn>=state.turnCount)return;
        p.lastTurn=state.turnCount;
        if(municipalAusterity(state)){p.delayReason='FMN: ngrirje kapitale komunale';return;}if(p.delayReason==='FMN: ngrirje kapitale komunale')p.delayReason='';
        if(typeof streetSectorBlocked==='function' && streetSectorBlocked(p.sector,state.turnCount,state))return;
        if(!state.governmentFormed || state.governmentStatus!=='IN_OFFICE'){
            if(p.status!=='DELAYED'){p.delayReason='Qeveria nuk është në detyrë; koordinimi institucional është pezulluar.';municipal14Set(p,'DELAYED',p.delayReason);}
        }else if(p.status!=='DELAYED'){
            if(!p.startTurn){p.startTurn=state.turnCount;p.startDate=diplomaticDate(state.turnCount);}
            if(p.status==='FUNDED')municipal14Set(p,'ACTIVE','Nis zbatimi.');
            p.elapsed=Math.min(p.duration,p.elapsed+rogueProjectStep('CAT|'+p.id,'CAT',p.duration-p.elapsed));p.progress=Math.min(100,p.elapsed/p.duration*100);
            p.spentB=+(p.costB*p.elapsed/p.duration).toFixed(9);p.remainingB=+(p.costB-p.spentB).toFixed(9);
            p.tasks.forEach(function(t,index){t.done=p.progress>=[20,80,100][index];});
            applyMunicipal14Progress(p,p.effectMode==='GRADUAL'?p.progress/100:p.progress===100?1:0);
            if(p.elapsed===p.duration){
                p.spentB=p.costB;p.remainingB=0;p.completedTurn=state.turnCount;
                p.effectsApplied=projectEffectsDelivered(p);
                municipal14Set(p,'COMPLETED','U krye dorëzimi fizik. '+(p.effectsApplied?'Efektet u realizuan një herë.':projectEffectIssues(p).join(' ')));
                addMediaNews('Zhvillimi komunal','Përfundoi projekti: '+p.title+'.','POSITIVE');
            }
        }
        if(p.status!=='COMPLETED' && state.turnCount>p.deadlineTurn && !p.overdueNotified){p.overdueNotified=true;addMediaNews('Kalendari i shtetit','Afati i projektit u tejkalua: '+p.title+'. '+(p.delayReason||'Kërkohet rifillimi i punës.'),'CRITICAL');}
    });
}
function municipal14Filter(st,filters){
    return municipal14Records(st).filter(function(p){return (!filters.municipality || p.municipalityId===filters.municipality) && (!filters.sector || p.field===filters.sector) && (!filters.status || (filters.status==='BLOCKED'?p.status==='DELAYED'||p.status==='DEFERRED'||!!p.blockReason:p.status===filters.status));});
}
function municipal14Report(st){
    var projects=municipal14Records(st),counts={};Object.keys(MUNICIPAL_14_STATUS).forEach(function(k){counts[k]=projects.filter(function(p){return p.status===k;}).length;});
    var active=projects.filter(function(p){return ['FUNDED','ACTIVE','DELAYED'].includes(p.status);});
    return {counts:counts,total:projects.length,committedB:projects.filter(function(p){return p.fundingCommitted;}).reduce(function(s,p){return s+p.costB;},0),spentB:projects.reduce(function(s,p){return s+p.spentB;},0),remainingB:projects.reduce(function(s,p){return s+p.remainingB;},0),budgetB:st.budgetTotalB,activeMunicipalities:[...new Set(active.map(function(p){return p.municipalityId;}))],deadlines:active.filter(function(p){return p.deadlineTurn<=st.turnCount+2;}).sort(function(a,b){return a.deadlineTurn-b.deadlineTurn;})};
}
function municipal14Money(b){return '€'+(b*1000).toFixed(2)+'M';}
function municipal14ReportHtml(){
    var r=municipal14Report(state),e=catalogEscape;
    var legacy=state.municipalities.flatMap(function(m){return m.projects||[];}).concat(state.developmentProjects||[]);
    var oldCompleted=legacy.filter(function(p){return ['I Përfunduar','COMPLETED'].includes(p.status);}).length;
    return '<details class="candidate-card"><summary>Raporti i projekteve komunale</summary><p>'+Object.keys(r.counts).map(function(k){return MUNICIPAL_14_STATUS[k]+': <strong>'+r.counts[k]+'</strong>';}).join(' · ')+'</p><p>Financim i zotuar: '+municipal14Money(r.committedB)+' · Shpenzime të realizuara brenda financimit: '+municipal14Money(r.spentB)+' · Mbetur për zbatim: '+municipal14Money(r.remainingB)+' · Buxheti i shtetit i mbetur: '+municipal14Money(r.budgetB)+'</p><p>Komuna me projekte aktive ('+r.activeMunicipalities.length+'): '+(r.activeMunicipalities.map(function(id){return e(state.municipalities.find(function(m){return m.id===id;}).name);}).join(', ')||'Asnjë')+'</p><p>Afate brenda dy javëve ose të tejkaluara: '+(r.deadlines.map(function(p){return e(p.title)+' — '+e(diplomaticDate(p.deadlineTurn));}).join('; ')||'Asnjë')+'</p><p>Projekte të trashëguara në regjistrat ekzistues: '+legacy.length+'; të përfunduara: '+oldCompleted+'. Mbeten në profilet dhe raportet ekzistuese dhe nuk rifinancohen. Shpenzimet historike nuk përzihen me totalet e katalogut, sepse regjistrat e vjetër nuk kanë të dhëna të plota të realizimit.</p></details>';
}
function renderMunicipalDevelopment(){
    var host=document.getElementById('municipalDevelopment14');if(!host)return;
    var previous={municipality:document.getElementById('mun14Municipality')?.value||'',sector:document.getElementById('mun14Sector')?.value||'',status:document.getElementById('mun14Status')?.value||''},e=catalogEscape,wasOpen=document.getElementById('municipalProjectTools')?.open;
    host.innerHTML='<div class="municipal14 municipal-browser-heading"><h3>Zhvillimi i 38 Komunave</h3><p>Zgjidhni një kartë për infrastrukturën, projektet dhe financimin e komunës.</p><details id="municipalProjectTools" '+(wasOpen?'open':'')+'><summary>Kërko në katalogun e projekteve</summary>'+municipal14ReportHtml()+'<div class="candidate-filters"><label>Komuna<select id="mun14Municipality" onchange="filterMunicipalDevelopment()"><option value="">Të gjitha komunat</option>'+state.municipalities.map(m=>'<option value="'+e(m.id)+'">'+e(m.name)+'</option>').join('')+'</select></label><label>Sektori<select id="mun14Sector" onchange="filterMunicipalDevelopment()"><option value="">Të gjithë sektorët</option>'+Object.keys(MUNICIPAL_14_SECTORS).map(k=>'<option value="'+k+'">'+MUNICIPAL_14_SECTORS[k].name+'</option>').join('')+'</select></label><label>Statusi<select id="mun14Status" onchange="filterMunicipalDevelopment()"><option value="">Të gjitha statuset</option><option value="BLOCKED">Të bllokuara / shtyra</option>'+Object.keys(MUNICIPAL_14_STATUS).map(k=>'<option value="'+k+'">'+MUNICIPAL_14_STATUS[k]+'</option>').join('')+'</select></label></div><div id="mun14Needs"></div><div id="mun14Requests"></div><div class="grid-3" id="mun14List"></div></details></div>';
    Object.keys(previous).forEach(k=>document.getElementById(({municipality:'mun14Municipality',sector:'mun14Sector',status:'mun14Status'})[k]).value=previous[k]);filterMunicipalDevelopment();
}
function filterMunicipalDevelopment(){
    var municipality=document.getElementById('mun14Municipality').value,sector=document.getElementById('mun14Sector').value,status=document.getElementById('mun14Status').value;
    var projects=municipal14Filter(state,{municipality:municipality,sector:sector,status:status}),e=catalogEscape;
    document.getElementById('mun14Needs').innerHTML=municipality?'<p>Nevojat e simuluara: '+municipal14Records(state).filter(function(p){return p.municipalityId===municipality;}).map(function(p){return e(p.serviceImpact);}).join(' · ')+'</p>':'';
    document.getElementById('mun14List').innerHTML=projects.map(function(p){return municipal14Card(p);}).join('')||'<p>Nuk ka projekte për filtrat e zgjedhur.</p>';
    var requests=document.getElementById('mun14Requests');if(requests)requests.innerHTML=municipal14RequestsHtml(municipality);
}
function municipal14Card(p){
    var m=state.municipalities.find(function(m){return m.id===p.municipalityId;}),e=catalogEscape;
    return '<article class="candidate-card municipal14-card"><strong>'+e(p.title)+'</strong><p>Projekt · '+e(m.name)+' · '+MUNICIPAL_14_SECTORS[p.field].name+' · '+MUNICIPAL_14_STATUS[p.status]+'</p><p>'+municipal14Money(p.costB)+' · '+p.duration+' javë · '+e(p.serviceImpact)+' +'+p.metricGain+'/10</p><progress max="100" value="'+p.progress+'"></progress><p>'+p.progress.toFixed(0)+'% · '+e(p.desc)+'</p><button class="action-btn" onclick="openMunicipalProject14(\''+p.id+'\')">Detajet dhe financimi</button></article>';
}
function openMunicipalDevelopment(mid){
    switchMainTab('tab-elections');switchSubTab('elec','municipalities',document.querySelector('#tab-elections .sub-pill'));renderMunicipalities();
    document.getElementById('mun14Municipality').value=mid||'';document.getElementById('mun14Sector').value='';document.getElementById('mun14Status').value='';filterMunicipalDevelopment();document.getElementById('municipalProjectTools').open=true;
    toggleModal('interactiveActionModal',false);document.getElementById('municipalDevelopment14').scrollIntoView({block:'start'});
}
function openMunicipalProject14(id){
    var p=municipal14Find(id);if(!p)return;var m=state.municipalities.find(function(m){return m.id===p.municipalityId;}),e=catalogEscape;
    var buttons=[];
    function action(label,code){buttons.push('<button class="action-btn btn-gold" '+(['APPROVE','FUND','RESUME'].includes(code)&&municipalAusterity(state)?'disabled':'')+' onclick="municipalProjectAction(\''+p.id+'\',\''+code+'\')">'+label+'</button>');}
    if(p.status==='AVAILABLE')action('Propozo për financim','PROPOSE');
    if(p.status==='PROPOSED')action('Paraqit për shqyrtim qeveritar','REVIEW');
    if(p.status==='REVIEW')action('Mirato pas shqyrtimit','APPROVE');
    if(p.status==='APPROVED')action('Ndaj '+municipal14Money(p.costB)+' nga buxheti','FUND');
    if(['PROPOSED','REVIEW','APPROVED'].includes(p.status)){action('Shty vlerësimin për dy javë','DEFER');action('Refuzo propozimin','REJECT');}
    if(p.status==='DEFERRED')action('Rihap vlerësimin pas afatit','REOPEN');
    if(p.status==='DELAYED')action('Rifillo punën','RESUME');
    if(!['AVAILABLE','REJECTED','CANCELLED','COMPLETED'].includes(p.status))action('Anulo projektin','CANCEL');
    var facts=uiDetailRows([
        ['Problemi',p.problem],['Institucioni',p.institution],['Sektori',MUNICIPAL_14_SECTORS[p.field].name],['Financimi',p.fundingSource],
        ['Kostoja dhe shuma për ndarje',municipal14Money(p.costB),true],['Buxheti aktual',municipal14Money(state.budgetTotalB),true],
        ['Buxheti pas ndarjes së parë',municipal14Money(state.budgetTotalB-(p.fundingCommitted?0:p.costB)),true],['Kohëzgjatja',p.duration+' javë',true],
        ['Data e propozimit',p.createdDate],['Nisja',p.startDate||'Ende pa nisur'],['Afati',p.deadlineTurn?diplomaticDate(p.deadlineTurn):'Përcaktohet në financim',true]
    ]);
    var resultFacts=uiDetailRows([['Progresi',p.progress.toFixed(0)+'%'],['Shpenzime të realizuara',municipal14Money(p.spentB),true],['Financim i mbetur për zbatim',municipal14Money(p.remainingB),true]]);
    document.getElementById('interactiveActionModalContent').innerHTML='<div class="municipal14 catalog13"><h2>'+e(p.title)+'</h2><p>Projekt · '+e(m.name)+' · '+MUNICIPAL_14_STATUS[p.status]+'</p><p>'+e(p.desc)+'</p>'+facts+'<p>Ndikimi i plotë i planifikuar: '+e(p.serviceImpact)+' +'+p.metricGain+'/10; sektori shtetëror +'+p.sectorGain+'/100. '+e(p.publicImpact)+'</p><progress max="100" value="'+p.progress+'"></progress>'+resultFacts+'<p>'+e(p.blockReason||p.delayReason||'Pa bllokim ose vonesë të regjistruar.')+'</p><p>Anulimi ruan fondet e mbetura si detyrim të zotuar; nuk krijon rimbursim automatik. Vonesat institucionale nuk shtojnë kosto ose penalitete automatike.</p><h3>Detyrat</h3>'+(p.tasks.length?p.tasks.map(function(t){return '<p>'+e(t.title)+' — '+(t.done?'E përfunduar':'E hapur')+'</p>';}).join(''):'<p>Krijohen pas financimit.</p>')+'<details><summary>Historiku i projektit</summary>'+p.history.map(function(h){return '<p>'+e(h.date)+' · '+MUNICIPAL_14_STATUS[h.status]+' · '+e(h.note)+'</p>';}).join('')+'</details><div class="candidate-actions">'+buttons.join('')+'</div><button class="action-btn" onclick="openMunicipalDevelopment(\''+m.id+'\')">Kthehu te komuna</button></div>';
    toggleModal('interactiveActionModal',true);
    var panel=document.querySelector('#interactiveActionModalContent .municipal14');
    if(panel && document.getElementById('tab-development')?.classList.contains('active'))panel.insertAdjacentHTML('afterbegin','<button class="btn-top" id="closeInfrastructureProject" onclick="toggleModal(\'interactiveActionModal\',false);renderMunicipalInfrastructure()">Kthehu te Zhvillimi</button>');
    if(panel)panel.insertAdjacentHTML('afterbegin','<p class="candidate-note">Komuna zbaton projektin; Qeveria vendos për grantin dhe mbikëqyr financimin në simulim. Financimi i miratuar dhe ndarë: '+municipal14Money(p.approvedFundingB||0)+'.'+(p.completedTurn?' Përfunduar: '+catalogEscape(diplomaticDate(p.completedTurn))+'.':'')+'</p>'+(p.blockReason?'<p role="status">Bllokim: '+catalogEscape(p.blockReason)+'</p>':''));
    if(panel && p.effectMode==='GRADUAL')panel.insertAdjacentHTML('beforeend','<p>Efekti sektorial zbatohet gradualisht me progresin. Kënaqësia vendore rritet deri në 1 pikë dhe marrëdhënia me komunën deri në 0.5 pikë për gjithë projektin; nuk shtohet popullaritet kombëtar automatik.</p>');
    if(panel && p.field==='environment'){
        panel.insertAdjacentHTML('afterbegin','<p>services është indeksi i përgjithshëm i shërbimeve, jo matje e ndotjes ose riciklimit. Bllokimi i komponentëve paraqitet veçmas nga vonesat e projektit.</p>');
        panel.insertAdjacentHTML('beforeend',municipalEffectPresentation(p));
    }
}

function applyMunicipal14Progress(p,target){
    var delta=target-p.appliedFraction;if(delta<=0)return;
    var prof=state.municipalityProfiles?.[p.municipalityId],m=state.municipalities.find(function(m){return m.id===p.municipalityId;});
    ensureProjectEffectComponents(p);
    if(p.metricGain>0)processProjectEffect(p,'metric:'+p.metric,target,municipalMetricValid(prof,p.metric),function(d){prof[p.metric]=+clamp(prof[p.metric]+p.metricGain*d,1,10).toFixed(6);},'Mungon ose është e pavlefshme metrika '+p.metric+' në '+p.municipalityId+'.');
    processProjectEffect(p,'satisfaction',target,!!prof,function(d){prof.citizenSatisfaction=+clamp((prof.citizenSatisfaction??50)+d,0,100).toFixed(6);},'Mungon profili komunal.');
    processProjectEffect(p,'relation',target,!!m,function(d){m.relationWithGov=+clamp((m.relationWithGov??60)+0.5*d,0,100).toFixed(6);},'Mungon komuna.');
    processProjectEffect(p,'localSupport',target,!!m && !!prof,function(d){adjustLocalPublicSupport(m,d,prof);},'Mungon komuna ose profili.');
    var sector=state.stateSectors.find(function(s){return s.id===p.sector;});
    if(p.sectorGain>0)processProjectEffect(p,'sector',target,!!sector,function(d){sector.score=+clamp(sector.score+p.sectorGain*d,10,100).toFixed(6);},'Mungon sektori.');
    p.appliedFraction=target;
    p.effectWarnings=projectEffectIssues(p);
}
function municipal14Text(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function municipal14Municipalities(st,filters){
    return st.municipalities.filter(function(m){
        var prof=st.municipalityProfiles?.[m.id]||{},level=municipalMetricValid(prof,'development')?prof.development:null,projects=municipal14Records(st).filter(function(p){return p.municipalityId===m.id;});
        var legacy=(m.projects||[]).concat((st.developmentProjects||[]).filter(function(p){return p.municipalityId===m.id;}));
        var legacyMatch=legacy.some(function(p){return filters.project==='ACTIVE'?['Në Ndërtim','IN_PROGRESS'].includes(p.status):filters.project==='COMPLETED'?['I Përfunduar','COMPLETED'].includes(p.status):filters.project==='PROPOSED'?p.status==='PROPOSED':filters.project==='BLOCKED'?p.status==='DELAYED':false;});
        var aliases=({m_drenasi:'Gllogoc Drenas',m_novoberda:'Novobërdë Novo Bërdë',m_skenderaj:'Skënderaj Skenderaj'})[m.id]||'';
        return (!filters.region || filters.region==='ALL' || m.region===filters.region) && (!filters.search || municipal14Text(m.name+' '+aliases+' '+m.issue).includes(municipal14Text(filters.search))) &&
            (!filters.level || level!==null && (filters.level==='LOW'?level<4:filters.level==='MEDIUM'?level>=4&&level<7:level>=7)) &&
            (!filters.project || legacyMatch || projects.some(function(p){return filters.project==='BLOCKED'?p.status==='DELAYED'||p.status==='DEFERRED'||!!p.blockReason:p.status===filters.project;}));
    });
}
function municipal14RequestRecords(st,mid){return (st.pmInboxRequests||[]).filter(function(r){return r.municipal14 && (!mid || r.municipalityId===mid);});}
function createMunicipal14Request(mid){
    var candidates=municipal14Records(state).filter(function(p){return (!mid||p.municipalityId===mid) && p.status==='AVAILABLE' && !p.requestIssued;});
    if(!candidates.length)return null;
    var p=candidates[(state.turnCount*7)%candidates.length],m=state.municipalities.find(function(m){return m.id===p.municipalityId;});
    var req={id:'request:'+p.id,municipal14:true,projectId:p.id,municipalityId:m.id,senderName:m.mayorName,senderRole:'Kryetari i komunës '+m.name,category:'Zhvillim',title:'Kërkesë: '+p.title,desc:p.problem,
        proposedCostB:p.costB,importance:p.costB>=.003?'E lartë':'Mesatare',status:'PENDING',createdTurn:state.turnCount,dueTurn:state.turnCount+3,deadlineWeeks:3,postponements:0,decisions:[],
        consequenceText:'Mosveprimi ul marrëdhënien me komunën me 1 pikë dhe kënaqësinë vendore me 0.5 pikë; nuk shpenzon fonde.',options:[]};
    p.requestIssued=true;state.pmInboxRequests.unshift(req);addMediaNews('Komunat','Kërkesë e re nga '+m.name+': '+p.title+'. Afati: '+diplomaticDate(req.dueTurn)+'.','NEUTRAL');return req;
}
function processMunicipalRequestsWeek(){
    municipal14RequestRecords(state).forEach(function(r){
        if(r.status!=='PENDING')return;r.deadlineWeeks=Math.max(0,r.dueTurn-state.turnCount);
        if(state.turnCount>=r.dueTurn){r.status='EXPIRED';r.expiredTurn=state.turnCount;r.outcomeMsg='Afati i kërkesës komunale skadoi pa përgjigje.';r.decisions.push({turn:state.turnCount,action:'EXPIRED'});municipal14RequestConsequence(r,-1,-.5);addMediaNews('Komunat',r.outcomeMsg+' '+r.title,'CRITICAL');}
    });
    // One request per four game weeks, at most two open. Stable project flags prevent repeats after archiving/reloading.
    if(state.turnCount%4===0 && state.governmentFormed && !municipal14RequestRecords(state).some(function(r){return r.createdTurn===state.turnCount;}) && municipal14RequestRecords(state).filter(function(r){return r.status==='PENDING';}).length<2)createMunicipal14Request();
}
function municipal14RequestConsequence(r,relation,satisfaction){
    var m=state.municipalities.find(function(m){return m.id===r.municipalityId;}),prof=state.municipalityProfiles[r.municipalityId];
    if(m)m.relationWithGov=clamp((m.relationWithGov??60)+relation,0,100);
    if(prof)prof.citizenSatisfaction=clamp((prof.citizenSatisfaction??50)+satisfaction,0,100);
}
function resolveMunicipal14Request(id,action){
    if(!assertGovernmentAuthority('Vendimi për kërkesën komunale'))return false;
    if(state.pendingVote || weeklyProcessing || (state.weekCalendar?.transition && !weeklyVisualCommit)){showToast('Përfundoni procesin institucional aktual para vendimit.');return false;}
    var r=municipal14RequestRecords(state).find(function(r){return r.id===id;}),p=r&&municipal14Find(r.projectId);
    if(!r || r.status!=='PENDING' || !p)return false;
    var before=JSON.stringify(state);
    if(state.turnCount>=r.dueTurn){showToast('Afati i përgjigjes ka skaduar.');return false;}
    if(action==='DEFER'){
        if(r.postponements>=1){showToast('Kërkesa mund të shtyhet vetëm një herë.');return false;}
        r.postponements++;r.dueTurn+=3;r.deadlineWeeks=r.dueTurn-state.turnCount;r.outcomeMsg='Përgjigjja u shty për tri javë.';municipal14RequestConsequence(r,-.5,0);
    }else if(action==='APPROVE'){
        if(!['AVAILABLE','PROPOSED','REVIEW','APPROVED','FUNDED','ACTIVE','DELAYED','COMPLETED'].includes(p.status)){showToast('Propozimi nuk është më i hapur; refuzoni ose shtyni kërkesën.');return false;}
        if(p.costB>state.budgetTotalB && !p.fundingCommitted){p.blockReason='Kërkesa nuk mbulohet nga buxheti aktual.';refreshAllUI();showToast(p.blockReason);return false;}
        if(['AVAILABLE','PROPOSED'].includes(p.status)){p.createdDate=diplomaticDate(state.turnCount);p.createdTurn=state.turnCount;p.reviewTurn=state.turnCount;municipal14Set(p,'REVIEW','Kërkesa e komunës u pranua për vlerësim të grantit; ende pa financim.');}
        r.status='COMPLETED';r.completedTurn=state.turnCount;r.outcomeMsg='Kërkesa u pranua për procedurën e grantit. Miratimi dhe financimi kryhen te projekti, pa pagesë të dyfishtë.';
    }else if(action==='REJECT'){
        r.status='COMPLETED';r.completedTurn=state.turnCount;r.outcomeMsg='Kërkesa komunale u refuzua; fondet ruhen.';municipal14RequestConsequence(r,-1,-.5);
        if(['AVAILABLE','PROPOSED','REVIEW','DEFERRED','APPROVED'].includes(p.status))municipal14Set(p,'REJECTED','Refuzuar në përgjigjen ndaj komunës.');
    }else return false;
    r.decisions.push({action:action,turn:state.turnCount,note:r.outcomeMsg});if(!municipal14Persist(before))return false;refreshAllUI();openMunicipal14Request(id);return true;
}
function municipal14Persist(before){
    if(saveGameAuto())return true;
    state=JSON.parse(before);showToast('Vendimi nuk u ruajt; gjendja dhe financimi u rikthyen.');return false;
}
function municipal14RequestsHtml(mid){
    var list=municipal14RequestRecords(state,mid),e=catalogEscape;
    return '<details class="candidate-card"><summary>Kërkesat nga kryetarët ('+list.filter(function(r){return r.status==='PENDING';}).length+' të hapura)</summary>'+(list.length?list.map(function(r){return '<p>'+e(r.title)+' — '+e(({PENDING:'Në pritje',COMPLETED:'E shqyrtuar',EXPIRED:'Me afat të skaduar'})[r.status]||r.status)+' · '+municipal14Money(r.proposedCostB)+' · Afati: '+e(diplomaticDate(r.dueTurn))+'</p><button class="action-btn" onclick="openMunicipal14Request(\''+r.id+'\')">Hap kërkesën</button>';}).join(''):'<p>Nuk ka kërkesa komunale të regjistruara.</p>')+'</details>';
}
function openMunicipal14Request(id){
    var r=municipal14RequestRecords(state).find(function(r){return r.id===id;});if(!r)return;
    var p=municipal14Find(r.projectId),m=state.municipalities.find(function(m){return m.id===r.municipalityId;}),e=catalogEscape;
    document.getElementById('interactiveActionModalContent').innerHTML='<div class="municipal14 catalog13"><h2>'+e(r.title)+'</h2><p>'+e(r.senderName)+' · '+e(m.name)+' · Kërkesë komunale</p><p>'+e(r.desc)+'</p><p>Kosto e propozuar: '+municipal14Money(r.proposedCostB)+' · Rëndësia: '+e(r.importance)+' · Afati: '+e(diplomaticDate(r.dueTurn))+'</p><p>Pranimi hap vlerësimin e grantit. Fondet ndahen te projekti pas miratimit; komuna zbaton punën. Refuzimi ose skadimi shkakton pakënaqësi në komunë. Shtyrja lejohet një herë dhe mund të dëmtojë bashkëpunimin.</p><p>'+e(r.outcomeMsg||'Në pritje të vendimit.')+'</p>'+(r.status==='PENDING'?'<div class="candidate-actions">'+[['APPROVE','Prano për vlerësim'],['REJECT','Refuzo'],['DEFER','Shty përgjigjen për tri javë']].map(function(a){return '<button class="action-btn" onclick="resolveMunicipal14Request(\''+id+'\',\''+a[0]+'\')">'+a[1]+'</button>';}).join('')+'</div>':'')+'<details><summary>Vendimet e ruajtura</summary>'+r.decisions.map(function(d){return '<p>'+e(diplomaticDate(d.turn))+' · '+e(({APPROVE:'Pranuar',REJECT:'Refuzuar',DEFER:'Shtyrë',EXPIRED:'Skaduar'})[d.action])+'</p>';}).join('')+'</details><button class="action-btn" onclick="openMunicipalProject14(\''+p.id+'\')">Hap projektin</button><button class="action-btn" onclick="openMunicipalDevelopment(\''+m.id+'\')">Kthehu te komuna</button></div>';
    toggleModal('interactiveActionModal',true);
}
