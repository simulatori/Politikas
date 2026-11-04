/* Simulation parameters. Capital costs/durations follow the requested sector package. */
const SECTOR_EXPANSION_ROWS={
 sec_econ:[
 ['customs','Doganat dhe Menaxhimi Kufitar',.65,'Terminal Shtetëror Doganor',15,12,{collection:.012,approval:.5},{oligarchs:true},'Efikasitet kundër kontrabandës dhe arkëtim më i lartë; mirëmbajtje javore e shtrenjtë.'],
 ['informality','Lufta ndaj Ekonomisë Joformale',.35,'Park Industrial / Zonë e Lirë Ekonomike',25,24,{informal:1,business:-.8},{jobs:5000,growth:2},'Inspektorë në terren, arkëtim tatimor dhe pakënaqësi te bizneset.'],
 ['grants','Menaxhimi i Granteve dhe Subvencioneve',.45,'Inkubator Shtetëror për Start-up',5,8,{growth:.4,approval:1},{jobs:500,youth:4,growth:1},'Shpërndarje efikase e fondeve dhe rritje e kapaciteteve prodhuese.']],
 sec_edu:[
 ['textbooks','Subvencionimi i Teksteve Shkollore',.7,'Çerdhe dhe Kopshte Publike',3,6,{approval:1.5,youth:.8},{jobs:1200,approval:5,youth:3},'Librat financohen çdo javë; mbështetje për familjet dhe më pak ankesa në shtator.'],
 ['dual','Arsimi Profesional (Sistemi Dual)',.35,'Konvikte dhe Mensa Studentore',12,16,{jobs:180,business:.5,youth:.8},{youth:6,approval:2},'Aftësi praktike për të rinjtë dhe vende pune në bashkëpunim me bizneset.'],
 ['digital_schools','Digjitalizimi i Shkollave',.6,'Laboratorë të Shkencës dhe TIK',8,10,{growth:.15,approval:.7},{quality:3},'Pajisje dhe softuerë në klasa; shpenzime të vazhdueshme mirëmbajtjeje.']],
 sec_health:[
 ['medicines','Furnizimi me Barna Esenciale',.75,'Klinika e Re e Onkologjisë',18,16,{approval:1.7,risk:1,weeklyRisk:.08},{savings:.003,approval:5},'Barna dhe materiale të garantuara; kosto javore dhe rrezik tenderësh.'],
 ['insurance','Zbatimi i Sigurimeve Shëndetësore',1.1,'Sistemi Informativ Shëndetësor (SISH)',10,12,{approval:2,public:.6},{quality:2},'Mbulim i shërbimeve me kosto shumë të lartë. Mbi 5 yje kërkohet SISH i përfunduar.'],
 ['residents','Pakoja për Specializantët (Ndalja e Brain Drain)',.6,'Flota Kombëtare e Emergjencës',8,8,{approval:.8,public:.5},{approval:4,quality:2},'Pagesë e mjekëve të rinj; nga 6 yje mbron sektorin nga eksodi i stafit.']],
 sec_police:[
 ['hazard','Shtesat e Rrezikshmërisë për Njësinë Speciale',.7,'Baza e Re e Njësisë Speciale (Rajoni i Veriut)',15,12,{approval:1,public:.7},{approval:7,pressure:15},'Moral dhe reagim më i mirë policor; pagesa javore e rrezikshmërisë.'],
 ['organized_crime','Task-Forca Anti-Drogë & Krim i Organizuar',.45,'Burg i Sigurisë së Lartë (Standarde të BE-së)',10,16,{pressure:-1.5,risk:1,weeklyRisk:.08},{pressure:-6,grant:.01},'Operacione kundër krimit, përmirësim diplomatik dhe rrezik hakmarrjeje kriminale.'],
 ['institutional_cyber','Mbrojtja Kibernetike e Institucioneve',.65,'Sistemi i Kamerave Inteligjente në Qytete',12,10,{weeklyRisk:-.15},{approval:3,quality:3,maintenance:.0002},'Kontroll i rrjedhjeve të informatave; sistemet e kamerave kanë mirëmbajtje fikse.']],
 sec_fsk:[
 ['heavy_arms','Blerja e Armatimit të Rëndë (Dronë & Anti-Tank)',1,'Baza e Re Ushtarake (Pozicion Strategjik / Veri)',25,16,{approval:1.8},{approval:10,pressure:20},'Gatishmëri mbrojtëse dhe krenari kombëtare me mirëmbajtje shumë të lartë.'],
 ['conscription','Shërbimi Ushtarak i Detyrueshëm',1.2,'Sistemi i Radarit dhe Mbrojtjes Ajrore',35,20,{approval:1,public:.5},{quality:5,approval:3},'Rekrutim, ushqim dhe akomodim javor për të rinjtë.'],
 ['nato','Standardizimi për NATO (Partneriteti për Paqe)',.6,'Fabrika e Municionit Shtetëror',15,14,{pressure:-2,quality:.5},{savings:.001,jobs:1500},'Standarde teknike dhe trajnime rigoroze për bashkëpunim me aleatët.']],
 sec_roads:[
 ['expropriation','Menaxhimi i Shpronësimeve',.4,'Mega-Projekti i Autostradës së Re',40,24,{risk:3,weeklyRisk:.15},{approval:12,risk:15,quality:4,gate:'HIGHWAY'},'Përshpejton përgatitjen e rrugëve, por rrit rrezikun e pazareve me tokat.'],
 ['electoral_asphalt','Asfaltimi Elektoral (Rrugët Lokale)',.8,'Tuneli Ndërkufitar (Lidhja Strategjike)',25,20,{approval:1.5,party:1,weeklyRisk:.1},{revenue:.0008,approval:3},'Tenderë lokalë dhe mbështetje partie; standardet e dobëta kushtojnë në mirëmbajtje.'],
 ['green_transport','Transporti Publik dhe Hekurudhat (Agjenda e Gjelbër)',.55,'Rehabilitimi i Hekurudhave (Fondi i BE-së)',15,16,{pressure:-1,approval:.8},{jobs:1800,grant:.015,pressure:-5},'Subvencione të rregullta për transport dhe koordinim me fondet evropiane.']],
 sec_energy:[
 ['winter_bills','Subvencionimi i Faturave të Dimrit',1,'Termocentrali i Ri (Baza me Qymyr)',50,24,{approval:1.5},{approval:12,coal:true},'Mbulon faturat e familjeve; pjesa shtesë e pagesës kryhet gjatë dimrit.'],
 ['north_bills','Pagesa e Rrymës në Veri (Blerja e Paqes)',.8,'Park i Madh i Erës (Wind Farm)',20,16,{party:-1,tension:2},{pressure:-10,quality:4,wind:true},'Pagesa të shtrenjta për stabilitet; krijojnë pakënaqësi të bazës dhe tension opozitar.'],
 ['plant_maintenance','Mirëmbajtja e Termocentraleve (Tenderët e KEK-ut)',.9,'Linja e Interkoneksionit dhe Bursa (Shqipëri-Kosovë)',15,12,{weeklyRisk:.25,risk:1},{approval:3,interconnection:true},'Financim i vazhdueshëm për blloqet; ul rrezikun sezonal, por shton ekspozimin e tenderëve.']],
 sec_tech:[
 ['ekosova','Zgjerimi i e-Kosova (Lufta ndaj Burokracisë)',.4,'Parku i Inovacionit dhe Teknologjisë (Tech Park)',20,16,{approval:1,party:-.8,weeklyRisk:-.1},{youth:6,jobs:2500,growth:2},'Më pak sportele dhe korrupsion i vogël; administrata partiake humb ndikim.'],
 ['incident_team','Skuadra e Reagimit Kibernetik (Mbrojtja nga Hakerët)',.8,'Qendra Shtetërore e të Dhënave (Data Center)',15,12,{quality:.5},{savings:.002,quality:3},'Nga 6 yje bllokon ngjarjen Sulm Kibernetik; kërkon financim të qëndrueshëm.'],
 ['ict_grants','Subvencionimi i Sektorit TIK dhe Start-up-eve',.5,'Digjitalizimi i Drejtësisë (Sistemi SMIL i avancuar)',12,14,{revenue:.00008,jobs:120,growth:.15},{pressure:-6,startRisk:10},'Nxit eksportet e shërbimeve dhe mbajtjen e profesionistëve në vend.']],
 sec_agri:[
 ['farm_grants','Subvencionet dhe Grantet Bujqësore',.75,'Siloset e Rezervave Shtetërore të Grurit',15,12,{approval:1.5,party:.7,risk:2,weeklyRisk:.2},{approval:4,grain:true},'Mbështetje rurale me shpenzim javor dhe ekspozim ndaj abuzimit me grantet.'],
 ['damage_fund','Kompensimi i Dëmeve (Breshëri/Përmbytjet)',.5,'Qendra Rajonale e Grumbullimit (Thyerja e Monopoleve)',10,10,{approval:.6},{party:4,jobs:1000},'Nga 6 yje mbulimi parandalon protestat me traktorë pas motit të keq.'],
 ['local_produce','Mbrojtja e Prodhimit Vendor (Taksa doganore)',.3,'Fabrikë Shtetërore për Përpunim (Rikthimi i Agro-Komplekseve)',18,16,{approval:1,pressure:20/7},{revenue:.002,jobs:2200},'Mbron prodhuesit vendas; në 10 yje presioni diplomatik i akumuluar arrin +20.']],
 sec_env:[
 ['coal_heating','Ndalimi i Thëngjillit për Ngrohje (Filtri i Dimrit)',.3,'Filtra Elektrostatikë për KEK-un',30,20,{pressure:-1.5,approval:-1.5},{approval:7,smog:true},'Ajër më i pastër dhe vlerësim nga BE; familjet e varfra përballen me ngrohje më të shtrenjtë.'],
 ['hydro_permits','Revokimi i Lejeve për Hidrocentrale (Mbrojtja e Lumenjve)',.25,'Deponi Rajonale me Standarde të BE-së',15,14,{approval:1.2,arbitration:true},{pressure:-5,grant:.01},'Mbron lumenjtë dhe komunitetet; kontraktorët mund të fitojnë arbitrazh të kushtueshëm.'],
 ['illegal_dumps','Aksioni kundër Deponive Ilegale',.4,'Ndërmarrja Shtetërore e Riciklimit',10,12,{approval:.8,grant:.001},{revenue:.001,jobs:800,grant:.003},'Inspektorë dhe pastrim i vazhdueshëm; grant i vogël ekologjik pas investimit.']],
 sec_social:[
 ['minimum_wage','Rritja e Pagës Minimale',.5,'Kompleks me Banesa Sociale',25,20,{approval:1.3,business:-.8,tension:1},{approval:5,party:5},'Përmirëson të ardhurat e punëtorëve; bizneset dhe grupet pensionale ushtrojnë presion.'],
 ['family_allowance','Shtesat për Fëmijë dhe Lehonat',1,'Shtëpi Rajonale për të Moshuarit',12,14,{approval:2,party:.5},{approval:3,pensioners:6},'Mbështetje e qëndrueshme për familjet me kosto të lartë javore.'],
 ['social_audit','Pastrimi i Skemave Sociale (Reforma)',.25,'Qendra Rajonale të Strehimit (Mbrojtja e Viktimave)',6,8,{savings:.0005,party:-.5,approval:-.5},{pressure:-6,approval:2},'Verifikon përfituesit dhe kursen shpenzime, por sjell kundërshtime politike.']],
 sec_justice:[
 ['vetting_support','Vetingu në Drejtësi',.5,'Gjykata Komerciale',10,12,{approval:1,pressure:25/7,weeklyRisk:-.15,gate:'VETTING'},{growth:1,revenue:.0003},'Mbështetje operative për mega-reformën ekzistuese; yjet nuk zëvendësojnë procesin e Vetingut.'],
 ['salary_system','Ligji i Pagave (Sistematizimi)',7/49,'Instituti i Krimeve të Luftës',5,8,{party:1,gate:'SALARY'},{approval:5},'Plotëson ligjin ekzistues: në 10 yje €7M shtesë mbi paketën €8M, gjithsej €15M/javë.'],
 ['confiscation_support','Byroja për Konfiskimin e Pasurisë',.45,'Arkivi Qendror Digjital i Gjykatave',8,10,{approval:1.5,tension:2,gate:'BUREAU'},{archive:true,quality:3},'Forcon zbatimin e Byrosë ekzistuese pas miratimit dhe kontrollit kushtetues.']],
 sec_rail:[
 ['ticket_subsidy','Subvencionimi i Biletave (Studentët & Pensionistët)',.7,'Hekurudha Prishtinë - Durrës (Mega-Projekti Patriotik)',50,30,{youth:1,pensioners:1,approval:1},{approval:10,growth:3,achievement:'Bashkimi Ekonomik'},'Mbështetje për studentët dhe pensionistët; kosto e përhershme financimi.'],
 ['intercity','Rregullimi i Transportit Ndërqytetas (Lufta me Privatët)',.35,'Flota e Autobusëve Elektrikë (Agjenda e Gjelbër)',18,12,{revenue:.00008,tension:1},{approval:4,pressure:-8,grant:.01},'Licencim dhe të hyra publike; operatorët privatë mund të bllokojnë qytetet.'],
 ['fare_integration','Integrimi Tarifor (Një Biletë për të Gjitha)',.5,'Rehabilitimi i Linjës 10 (Fondi i Jashtëm)',20,20,{pressure:-1,approval:.7},{revenue:.002,jobs:1500,growth:1},'Një sistem tarifor për rrjetin; mirëmbajtje softuerike dhe integrim rajonal.']],
 sec_water:[
 ['water_losses','Reduktimi i Humbjeve dhe Lidhjeve Ilegale',.35,'Liqeni i Ri Akumulues (Sigurimi i Furnizimit)',35,22,{revenue:.00006},{approval:6,drought:true},'Inspektime dhe ulje e humbjeve fizike në rrjet.'],
 ['rural_water','Subvencionimi i Tarifave për Zonat Rurale',.55,'Fabrika e Trajtimit të Ujërave të Zeza (Standardi i BE-së)',20,16,{approval:1.2},{pressure:-6,quality:3},'Qasje më e lirë për fshatrat me pagesa të vazhdueshme nga buxheti.'],
 ['water_quality','Standardizimi i Cilësisë dhe Analizave të Ujit',.3,'Rrjeti i Ri i Ujësjellësit për Zonat e Izoluara',12,12,{pressure:-.8,approval:.5},{approval:5,quality:3},'Analiza të ujit dhe mbrojtje nga rreziqet shëndetësore.']],
 sec_local:[
 ['performance_grants','Grantet e Performancës për Komunat',.6,'Sheshi i Ri Urban dhe Zona Këmbësore',8,8,{approval:1,party:.4},{approval:4},'Fonde qendrore kundrejt performancës dhe shërbimeve komunale.'],
 ['urban_permits','Rregullimi i Lejeve Ndërtimore dhe Urbanistikës',.3,'Qendra e Integruar e Shërbimeve (One-Stop-Shop)',6,6,{approval:.7,partyFunds:-15000},{approval:3,quality:2},'Rregull urban dhe kontroll i lejeve; humbje donacionesh nga interesat e ndërtimit.'],
 ['e_municipality','Digjitalizimi i Shërbimeve të Gjendjes Civile (e-Komuna)',.4,'Parku i Madh Publik dhe Hapësirat Eko-Rekreative',10,10,{approval:1},{approval:4,pressure:-3},'Shërbime lokale më të shpejta, me mirëmbajtje operative të përhershme.']]
};
