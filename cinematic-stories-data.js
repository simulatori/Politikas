/* Fictional multi-stage developments; choices never create a second treasury or election result. */
const CINEMATIC_STORIES={
 BLACKOUT:{title:'02:17 · Nata kur shteti ndalet',intro:'Një defekt zinxhir në rrjet ndërpret furnizimin. Spitalet, ujësjellësi dhe industria kërkojnë përparësi. Koha brenda skenës është e ngjeshur në javët e simulimit.',sector:'sec_energy',stages:[
 ['Dhoma e krizës','Gjeneratorët kanë autonomi të kufizuar. Kujt ia jep përparësinë?',[["HEALTH","Spitalet dhe ujësjellësi",.004,2],["INDUSTRY","Industria dhe furnizimi tregtar",.003,0],["DEFER","Prit raportin pa ndërhyrje",0,-2]]],
 ['Burimi rezervë','Raporti i operatorit verifikon kapacitetin. Bateria dhe gatishmëria e financuar e ulin dëmin.',[["REPAIR","Riparim dhe koordinim teknik",.008,2],["IMPORT","Furnizim i përkohshëm i kontraktuar",.012,1],["DEFER","Prit rikthimin e rrjetit",0,-2]]],
 ['Dalja para qytetarëve','Furnizimi po rikthehet. Publikimi i humbjeve mund ta ulë mbështetjen sot, por shmang fshehjen e përgjegjësisë.',[["REPORT","Publiko raportin dhe planin korrigjues",.001,2],["SPIN","Shpalle krizën të përfunduar pa audit",0,-1],["DEFER","Mos jep raport publik",0,-2]]]
 ]},
 SUMMIT_TABLE:{title:'Tri delegacione, një tavolinë',intro:'Gjatë organizimit tënd, delegacionet lidhin ofertat me kushte të ndryshme. Bisedimet përdorin partnerët dhe marrëveshjet ekzistuese.',sector:'sec_roads',stages:[
 ['Dyert mbyllen','Një delegacion kërkon tregti, një tjetër energji dhe i treti transparencë. Si e hap tryezën?',[["JOINT","Agjendë e përbashkët me procesverbal",.0005,2],["PRIVATE","Takime të veçanta konfidenciale",.0003,1],["DEFER","Lëri delegacionet pa koordinim",0,-2]]],
 ['Paketa në negociatë','Hap komunikimet reale të samitit për ta negociuar dokumentin. Ky vendim nuk e nënshkruan marrëveshjen automatikisht.',[["VERIFY","Sekretariat për verifikimin e kushteve",.001,2],["PROMISE","Premto financim para miratimit",0,-2],["DEFER","Tërhiq paketën e përbashkët",0,-1]]],
 ['Deklarata përfundimtare','Publiku kërkon rezultat. Vetëm marrëveshjet e zbatuara në sistem numërohen si investime ose grante.',[["REPORT","Publiko çka është nënshkruar realisht",.0002,2],["SPIN","Shpall fitore para nënshkrimeve",0,-2],["DEFER","Mbylle samitin pa deklaratë",0,-1]]]
 ]},
 CABINET_FILE:{title:'Dosja e mbyllur e kabinetit',intro:'Një sinjalizues i simuluar sjell dokumente për ndërhyrje në kontratën ekzistuese. Pretendimi nuk është fakt i provuar.',sector:'sec_justice',stages:[
 ['Sinjalizuesi','Kërkon ruajtjen e identitetit dhe kontroll të dokumenteve para publikimit.',[["PROTECT","Mbroje dhe verifiko dokumentet",.001,2],["LEAK","Publiko pretendimin menjëherë",0,-1],["DEFER","Mbylle dosjen",0,-2]]],
 ['Gjurmët e kontratës','Auditimi lidh pagesat me të njëjtën kontratë. Burimi mund të ketë lënë jashtë dokumente vendimtare.',[["AUDIT","Audit i pavarur me të drejtë përgjigjeje",.002,2],["POLITICAL","Shqyrtim vetëm brenda kabinetit",.0003,-1],["DEFER","Shtyje hetimin",0,-2]]],
 ['Përgjegjësia','Rezultati i verifikimit është gati. Nuk shpallet fajtor askush pa procedurë.',[["REPORT","Publiko gjetjet dhe refero përgjegjësinë",.0005,2],["HIDE","Mbaje rezultatin brenda kabinetit",0,-2],["DEFER","Lëre pa përgjigje",0,-2]]]
 ]},
 CITY_SPOTLIGHT:{title:'Qyteti që hyn në lajmet botërore',intro:'Një projekt ekzistues i komunës tërheq vëmendjen ndërkombëtare. Mundësia kërkon shërbime, banim dhe rezultate reale.',sector:'sec_local',stages:[
 ['Interesi i papritur','Delegacione biznesi kërkojnë vizitë dhe të dhëna të verifikuara për kapacitetet.',[["OPEN","Qendër koordinimi dhe të dhëna publike",.002,2],["SHOW","Fushatë imazhi pa kushte të reja",.001,0],["DEFER","Mos e ndiq interesin",0,-1]]],
 ['Qyteti nën presion','Qiratë dhe ngarkesa e transportit rriten. Banorët kërkojnë pjesëmarrje në vendim.',[["HOUSING","Mbështetje e kufizuar për banorët dhe transportin",.006,2],["BUSINESS","Përqendro shërbimin te delegacionet",.002,0],["DEFER","Lëre presionin pa përgjigje",0,-2]]],
 ['Premtimi matet','Vizitorët po largohen. Programi mund të vazhdojë vetëm mbi projektin dhe shërbimet ekzistuese.',[["VERIFY","Plan me tregues dhe mirëmbajtje",.003,2],["SPIN","Shpalle qendër botërore pa kontroll",0,-2],["DEFER","Mbylle fushatën",0,-1]]]
 ]},
 LEGACY_RETURN:{title:'Qeveria tjetër, trashëgimia jote',intro:'Tash je në opozitë. Qeveria e re po shqyrton një projekt të paguar gjatë qeverisjes sate. Rezultati i zgjedhjeve mbetet ai i motorit ekzistues.',sector:'sec_local',opposition:true,stages:[
 ['Njoftimi i rishikimit','Pasardhësi po shqyrton kostot e funksionalizimit të projektit. Si reagon?',[["DOCUMENT","Publiko faturat dhe progresin ekzistues",0,2],["ATTACK","Akuzo pa dorëzuar dokumentet",0,-1],["DEFER","Mos ndërhy",0,-1]]],
 ['Mbrojtja e projektit','Qytetarët kërkojnë shërbim. Mund ta mbrosh projektin duke pranuar edhe dobësitë e tij.',[["CORRECT","Propozo korrigjime dhe mbikëqyrje",0,2],["OWN","Kërko vetëm meritat politike",0,-1],["DEFER","Tërhiqu nga diskutimi",0,-1]]],
 ['Pas disa javëve','Projekti ka vazhduar në motorin origjinal. Nuk rikthehesh në pushtet me një buton.',[["REPORT","Dokumento gjendjen dhe platformën e rikthimit",0,2],["BLOCK","Kërko bllokim politik pa alternativë",0,-2],["DEFER","Mbylle këtë kapitull",0,0]]]
 ]},
 ASYLUM_FLIGHT:{title:'Aeroplani që kërkon leje për ulje',intro:'Një aeroplan me një figurë opozitare të një shteti imagjinar kërkon ulje emergjente. Kërkesat diplomatike kundërshtojnë njëra-tjetrën.',sector:'sec_justice',stages:[
 ['Kërkesa nga kulla','Autoriteti i aeroportit kërkon vendimin për uljen dhe sigurinë e udhëtarëve.',[["LAND","Lejo uljen me siguri dhe ndihmë mjekësore",.001,2],["DIVERT","Koordino devijimin e sigurt",.0005,0],["DEFER","Vono përgjigjen",0,-2]]],
 ['Telefonatat kundërshtuese','Një partner kërkon mbrojtje; shteti i origjinës kërkon dorëzim. Fillimisht duhet shqyrtuar rreziku individual.',[["REVIEW","Shqyrtim i pavarur me përfaqësim ligjor",.001,2],["PROMISE","Premto dorëzimin para shqyrtimit",0,-2],["DEFER","Mbaje çështjen pa procedurë",0,-2]]],
 ['Dalja diplomatike','Raporti i skenarit tregon rrezikun e kthimit. Vendimi ka pasoja për besimin dhe marrëdhëniet.',[["PROTECT","Respekto vlerësimin dhe koordino mbrojtjen",.002,2],["HANDOVER","Dorëzoje për ta mbyllur presionin",0,-3],["DEFER","Lëre përgjegjësinë pezull",0,-2]]]
 ]},
 RELOCATION_RACE:{title:'Oferta që skadon para agimit',intro:'Një profil investitori tashmë në sistem po shqyrton zhvendosjen pas një katastrofe të simuluar jashtë vendit. Dy shtete të tjera garojnë me ofertën tuaj.',sector:'sec_econ',stages:[
 ['Gara hapet','Profili i lidhur ka afatin dhe kushtet origjinale. Fillo negociatën ekzistuese; kjo dosje nuk krijon kompani të dytë.',[["VERIFY","Verifiko energjinë, tokën dhe punëtorët",.001,2],["PROMISE","Premto kapacitet pa verifikim",0,-2],["DEFER","Mos e ndiq ofertën",0,-1]]],
 ['Kontrolli i investitorit','Kompania kontrollon progresin në kontratën origjinale. Pagesa e infrastrukturës bëhet vetëm atje.',[["HONEST","Jep progresin real dhe kushtet",.0005,2],["INFLATE","Raporto kapacitet më të madh",0,-2],["DEFER","Mos jep përgjigje",0,-2]]],
 ['Vendimi i zhvendosjes','Vetëm firma dhe realizimi origjinal japin investimin, punësimin dhe tatimet.',[["REPORT","Prano rezultatin e kontratës ekzistuese",0,2],["BAILOUT","Premto kompensim publik për vonesat",.005,0],["DEFER","Tërhiqu nga mbështetja politike",0,-1]]]
 ]},
 SPEECH_RECORDING:{title:'Regjistrimi që ndërpret fjalimin',intro:'Në mes të një prezantimi publikohet një audio e dyshimtë. Mund të jetë autentike, e prerë nga konteksti ose sintetike.',sector:'sec_tech',stages:[
 ['Mikrofonat janë hapur','Gazetarët kërkojnë përgjigje para se ekspertët ta kenë kontrolluar materialin.',[["CAUTION","Ruaj materialin dhe kërko verifikim",.0003,2],["DENY","Shpalle falsifikim pa ekspertizë",0,-1],["DEFER","Largohu pa përgjigje",0,-2]]],
 ['Ekspertiza','Gjurmët teknike dhe dokumentet e aktivitetit tënd mund ta sqarojnë kontekstin.',[["AUDIT","Ekspertizë e pavarur dhe dokumente të plota",.001,2],["PARTIAL","Publiko vetëm pjesën që të leverdis",0,-2],["DEFER","Mos bashkëpuno me verifikimin",0,-2]]],
 ['E vërteta del','Ekspertiza ka rezultat. Reagimi i parë vazhdon të ketë rëndësi edhe nëse audioja është e rreme.',[["REPORT","Publiko gjetjen dhe korrigjo deklaratat tua",.0002,2],["ATTACK","Sulmo publikuesin pa trajtuar gjetjen",0,-2],["DEFER","Lëre historinë pa përgjigje",0,-1]]]
 ]},
 SCIENTIST_48H:{title:'Shkencëtari kërkon 48 orë mbrojtje',intro:'Një ekip i simuluar në institucionin arsimor ekzistues pretendon zbulim të madh. Një kompani ofron blerjen para verifikimit.',sector:'sec_edu',stages:[
 ['Pretendimi','Rezultati ende nuk është përsëritur nga një laborator tjetër.',[["VERIFY","Financo përsëritjen e pavarur",.003,2],["ANNOUNCE","Shpalle menjëherë zbulim historik",0,-2],["DEFER","Mos e mbështet testimin",0,-1]]],
 ['Oferta për ekipin','Studiuesit kërkojnë kushte pune, ndërsa blerësi kërkon të drejtat ekskluzive.',[["RETAIN","Kushte pune dhe licencim i kufizuar",.004,2],["SELL","Lejo kalimin e plotë të të drejtave",0,-1],["DEFER","Lëri pa marrëveshje",0,-2]]],
 ['Rezultati i laboratorit','Vetëm një rezultat i riprodhueshëm mund të licencohet. Studimi i paguar mund të dështojë.',[["LICENSE","Publiko testet dhe licenco vetëm nëse vlejnë",.001,2],["SPIN","Mbaje pretendimin edhe pa prova",0,-2],["DEFER","Mbylle projektin kërkimor",0,-1]]]
 ]},
 MUNICIPAL_REFUSAL:{title:'Komuna që refuzon urdhrin',intro:'Zbatimi i një politike ekzistuese has kundërshtim komunal. Refuzimi përhapet dhe shërbimet e projektit të lidhur rrezikojnë vonesa.',sector:'sec_local',stages:[
 ['Refuzimi publik','Kryetari kërkon ndryshim të afatit dhe dëgjim të banorëve.',[["TALK","Tryezë me komunën dhe publikim arsyesh",.0005,2],["THREAT","Kërcëno me masa para shqyrtimit",0,-2],["DEFER","Mos iu përgjigj",0,-2]]],
 ['Komunat tjera reagojnë','Qëndrimet e kabinetit ndahen. Një kompromis duhet ta ruajë funksionimin e shërbimit.',[["ADAPT","Afat korrigjimi dhe mbështetje teknike",.003,2],["FORCE","Përshpejto zbatimin pa konsultim",.001,-1],["DEFER","Lëre bllokadën të vazhdojë",0,-2]]],
 ['Dalja nga përplasja','Vendimi duhet të ketë rrugë ankese dhe përgjegjësi të qarta.',[["REVIEW","Marrëveshje publike dhe shqyrtim i pavarur",.001,2],["POLITICAL","Mbylle me marrëveshje të fshehtë",0,-2],["DEFER","Mbaje konfliktin të hapur",0,-2]]]
 ]}
};
