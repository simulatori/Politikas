/* ============================================================================
   REPUBLIKA: SIMULATORI POLITIK I KOSOVËS — LOGJIKA KRYESORE (v5.0)
   FAZA E RE: CIKLI INSTITUCIONAL, STATUSI I LOJTARIT, NEGOCIATAT
   PRESIDENCIALE, ZGJEDHJET E NDARA, DOSJET JAVORE DHE RREGULLIMI I BUXHETIT
   ============================================================================ */

/* ============================================================================
   1. BAZA E TË DHËNAVE FILLESTARE REALE & 120 DEPUTETËT E LEGJISLATURËS
   ============================================================================ */
const FULL_ROSTER_NAMES = {
    LVV: [
        "Albin Kurti", "Glauk Konjufca", "Albulena Haxhiu", "Donika Gërvalla-Schwarz", "Hekuran Murati",
        "Xhelal Sveçla", "Arben Vitia", "Ejup Maqedonci", "Mimoza Kusari-Lila", "Artane Rizvanolli",
        "Arbërie Nagavci", "Hajrulla Çeku", "Faton Peci", "Liburn Aliu", "Rozeta Hajdari",
        "Saranda Bogujevci", "Armend Muja", "Jeta Statovci", "Mefail Bajqinovci", "Fitore Pacolli-Dalipi",
        "Dimal Basha", "Salih Zyba", "Adnan Rrustemi", "Arbreshë Kryeziu-Hyseni", "Tinka Kurti",
        "Driton Hyseni", "Enver Dugolli", "Fatmire Kollçaku", "Labinotë Demi-Murtezi", "Haki Abazi",
        "Valon Ramadani", "Nijazi Isaku", "Shqipe Mehmeti-Selimi", "Ardian Gola", "Avni Dehari",
        "Besim Muzaqi", "Fjolla Ujkani", "Halil Thaçi", "Mirlinda Tishukaj-Sadiku", "Vendenis Lahu",
        "Agon Batusha", "Alban Bajrami", "Arjeta Fejza", "Arta Bajralija", "Burim Meta",
        "Drita Millaku", "Ekrem Mustafa", "Enver Haliti", "Fatmir Humolli", "Gani Krasniqi",
        "Gramoz Agusholli", "Hydajet Hyseni-Kaloshi", "Jahja Kokaj", "Jetmire Vrenezi", "Luan Aliu"
    ],
    PDK: [
        "Bedri Hamza", "Memli Krasniqi", "Vlora Çitaku", "Uran Ismaili", "Abelard Tahiri",
        "Eliza Hoxha", "Blerta Deliu-Kodra", "Xhavit Haliti", "Mërgim Lushtaku", "Ganimete Musliu",
        "Ferat Shala", "Rashit Qalaj", "Enver Hoxhaj", "Ariana Musliu-Shoshi", "Bekim Haxhiu",
        "Hajdar Beqa", "Isak Shabani", "Floretë Zejnullahu", "Hisni Kilaj", "Ardian Kastrati",
        "Fadil Nura", "Përparim Gruda", "Besa Kabashi-Ramaj", "Zenun Pajaziti"
    ],
    LDK: [
        "Lumir Abdixhiku", "Hykmete Bajrami", "Lutfi Haziri", "Doarsa Kica-Xhelili", "Kujtim Shala",
        "Avdullah Hoti", "Arben Gashi", "Jehona Lushaku-Sadriu", "Besian Mustafa", "Armend Zemaj",
        "Anton Quni", "Vlora Dumoshi", "Marigona Geci", "Driton Selmanaj", "Valentina Bunjaku-Rexhepi",
        "Rrezarta Krasniqi", "Agim Veliu", "Alban Zogaj", "Sibel Halimi", "Visar Azemi"
    ],
    AAK: [
        "Ardian Gjini", "Ramush Haradinaj", "Besnik Tahiri", "Time Kadrijaj", "Albana Bytyqi",
        "Bekë Berisha", "Pal Lekaj", "Shemsedin Dreshaj", "Daut Haradinaj"
    ],
    MIN_MULTI: [
        "Elbert Krasniqi (IRDK)", "Emilija Redžepi (NDS)", "Fikrim Damka (KDTP)", "Nenad Rašić (ZSPO)",
        "Duda Balje (SDU)", "Rasim Demiri (Vakat)", "Veton Berisha (PLE)", "Artan Asllani (PSA)",
        "Adem Hodža (JGP)", "Albert Kinolli (PREBK)", "Enis Kervan (KDTP)"
    ],
    SL: [
        "Zlatan Elek (SL)", "Igor Simić (SL)", "Slavko Simić (SL)", "Miljana Nikolić (SL)",
        "Zoran Mojsilović (SL)", "Verica Ćeranić (SL)", "Branislav Nikolić (SL)",
        "Milan Kostić (SL)", "Cvetko Veljković (SL)", "Ljubinko Karadžić (SL)"
    ]
};

const INITIAL_POLITICAL_DB = {
    electionDate: "7 Qershor 2026",
    certificationDate: "8 Korrik 2026",
    turnoutPercent: 41.45,
    constitutionalRules: {
        totalSeats: 120,
        generalSeats: 100,
        guaranteedMinoritySeats: 20,
        serbGuaranteedSeats: 10,
        otherMinorityGuaranteedSeats: 10,
        thresholdGeneral: 5.0,
        simpleMajority: 61,
        twoThirdsMajority: 80,
        presidentialRound1And2: 80,
        presidentialRound3Votes: 61,
        presidentialQuorum: 80,
        genderQuotaMinPercent: 30,
        presidentialMandateYears: 5,
        assemblyMandateYears: 4,
        assemblyMandateWeeks: 208,
        presidentialMandateWeeks: 240
    },
    parties: {
        LVV: {
            id: "LVV",
            name: "Lëvizja Vetëvendosje! (me Guxo & Alternativa)",
            short: "LVV",
            leader: "Albin Kurti",
            deputyLeaders: ["Glauk Konjufca", "Albulena Haxhiu", "Donika Gërvalla-Schwarz"],
            orgSecretary: "Alim Rama",
            color: "#dc2626",
            tagClass: "tag-lvv",
            seats: 53,
            poll: 47.13,
            community: "GENERAL",
            ideology: "Socialdemokraci, Sovranitet Shtetëror & Zhvillim",
            euStance: 88,
            usStance: 82,
            dialogueStance: "Reciprocitet i plotë dhe mos-themelim i asociacionit monoetnik",
            partyDiscipline: 92,
            internalCohesion: 88,
            partyFunds: 420000,
            relations: { LVV: 100, PDK: 24, LDK: 38, AAK: 28, MIN_MULTI: 84, SL: 10 },
            candidates: [
                { id: "c_kurti", name: "Albin Kurti", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 95, loyalty: 100, role: "Kryeministër / Kryetar i LVV" },
                { id: "c_konjufca", name: "Glauk Konjufca", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 91, loyalty: 95, role: "Zëvendëskryeministër I & Ministër i Jashtëm" },
                { id: "c_haxhiu", name: "Albulena Haxhiu", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 84, loyalty: 98, role: "Kryetare e Kuvendit të Kosovës" },
                { id: "c_gervalla", name: "Donika Gërvalla", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 79, loyalty: 90, role: "Ministre e Drejtësisë (Guxo)" },
                { id: "c_murati", name: "Hekuran Murati", gender: null, genderStatus: 'UNCONFIRMED', region: "FERIZAJ", pop: 82, loyalty: 96, role: "Ministër i Financave" },
                { id: "c_svecla", name: "Xhelal Sveçla", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 85, loyalty: 97, role: "Ministër i Punëve të Brendshme" },
                { id: "c_vitia", name: "Arben Vitia", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 83, loyalty: 94, role: "Ministër i Shëndetësisë" },
                { id: "c_macedonci", name: "Ejup Maqedonci", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 88, loyalty: 93, role: "Ministër i Mbrojtjes" },
                { id: "c_kusari", name: "Mimoza Kusari-Lila", gender: null, genderStatus: 'UNCONFIRMED', region: "GJAKOVA", pop: 76, loyalty: 86, role: "Shefe e GP (Alternativa)" },
                { id: "c_rizvanolli", name: "Artane Rizvanolli", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 77, loyalty: 92, role: "Ministre e Ekonomisë" },
                { id: "c_nagavci", name: "Arbërie Nagavci", gender: null, genderStatus: 'UNCONFIRMED', region: "GJAKOVA", pop: 74, loyalty: 95, role: "Ministre e Arsimit" },
                { id: "c_ceku", name: "Hajrulla Çeku", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 81, loyalty: 94, role: "Ministër i Kulturës, Rinisë dhe Sportit" },
                { id: "c_peci", name: "Faton Peci", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 80, loyalty: 90, role: "Ministër i Bujqësisë" },
                { id: "c_aliu", name: "Liburn Aliu", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 75, loyalty: 81, role: "Ministër i Infrastrukturës & Mjedisit" },
                { id: "c_hajdari", name: "Rozeta Hajdari", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 71, loyalty: 93, role: "Ministre e Industrisë dhe Tregtisë" },
                { id: "c_basha", name: "Dimal Basha", gender: null, genderStatus: 'UNCONFIRMED', region: "FERIZAJ", pop: 73, loyalty: 89, role: "Deputet" },
                { id: "c_pacolli_f", name: "Fitore Pacolli", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 74, loyalty: 94, role: "Deputete" },
                { id: "c_abazi_m", name: "Mefail Bajqinovci", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 76, loyalty: 95, role: "Deputet" },
                { id: "c_bogujevci", name: "Saranda Bogujevci", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 82, loyalty: 95, role: "Nënkryetare e Kuvendit" },
                { id: "c_zyba", name: "Salih Zyba", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 70, loyalty: 96, role: "Deputet" }
            ],
            reserves: [
                { id: "r_lvv_1", name: "Jeta Statovci", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 75, loyalty: 89, role: "Deputete / Ekonomiste" },
                { id: "r_lvv_2", name: "Armend Muja", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 76, loyalty: 88, role: "Kryetar i Komisionit për Buxhet" },
                { id: "r_lvv_3", name: "Taulant Kelmendi", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 72, loyalty: 91, role: "Ekspert Digjital" }
            ]
        },
        PDK: {
            id: "PDK",
            name: "Partia Demokratike e Kosovës",
            short: "PDK",
            leader: "Bedri Hamza",
            deputyLeaders: ["Memli Krasniqi", "Vlora Çitaku", "Uran Ismaili"],
            orgSecretary: "Betim Gjoshi",
            color: "#2563eb",
            tagClass: "tag-pdk",
            seats: 22,
            poll: 19.44,
            community: "GENERAL",
            ideology: "Qendra e Djathtë, Zhvillim Ekonomik & Partneritet Atlantik",
            euStance: 94,
            usStance: 98,
            dialogueStance: "Marrëveshje gjithëpërfshirëse në koordinim të plotë me SHBA-në",
            partyDiscipline: 87,
            internalCohesion: 85,
            partyFunds: 360000,
            relations: { LVV: 24, PDK: 100, LDK: 62, AAK: 68, MIN_MULTI: 75, SL: 15 },
            candidates: [
                { id: "c_hamza", name: "Bedri Hamza", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 89, loyalty: 96, role: "Kryetar i PDK-së / Ekspert Financiar" },
                { id: "c_krasniqi", name: "Memli Krasniqi", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 83, loyalty: 95, role: "Deputet / Ish-Kryetar i PDK" },
                { id: "c_citaku", name: "Vlora Çitaku", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 82, loyalty: 94, role: "Sekretare e Përgjithshme / Diplomate" },
                { id: "c_ismaili", name: "Uran Ismaili", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 81, loyalty: 93, role: "Nënkryetar i PDK-së" },
                { id: "c_tahiri_a", name: "Abelard Tahiri", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 78, loyalty: 92, role: "Shef i Grupit Parlamentar" },
                { id: "c_hoxha_e", name: "Eliza Hoxha", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 79, loyalty: 90, role: "Deputete / Arkitekte" },
                { id: "c_deliu", name: "Blerta Deliu-Kodra", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 76, loyalty: 93, role: "Deputete" },
                { id: "c_haliti", name: "Xhavit Haliti", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 74, loyalty: 85, role: "Deputet Veteran" },
                { id: "c_lushtaku", name: "Mërgim Lushtaku", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 77, loyalty: 80, role: "Deputet (Drenica)" },
                { id: "c_musliu", name: "Ganimete Musliu", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 75, loyalty: 88, role: "Deputete" }
            ],
            reserves: [
                { id: "r_pdk_1", name: "Përparim Gruda", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 76, loyalty: 91, role: "Ekspert Kushtetues" }
            ]
        },
        LDK: {
            id: "LDK",
            name: "Lidhja Demokratike e Kosovës",
            short: "LDK",
            leader: "Lumir Abdixhiku",
            deputyLeaders: ["Lutfi Haziri", "Hykmete Bajrami", "Doarsa Kica-Xhelili"],
            orgSecretary: "Imri Ahmeti",
            color: "#0ea5e9",
            tagClass: "tag-ldk",
            seats: 18,
            poll: 16.69,
            community: "GENERAL",
            ideology: "Qendra e Djathtë, Institucionalizëm & Integrim Euro-Atlantik",
            euStance: 96,
            usStance: 97,
            dialogueStance: "Respektim i Kushtetutës dhe aleancë e përhershme me SHBA dhe BE",
            partyDiscipline: 83,
            internalCohesion: 82,
            partyFunds: 310000,
            relations: { LVV: 38, PDK: 62, LDK: 100, AAK: 64, MIN_MULTI: 78, SL: 15 },
            candidates: [
                { id: "c_abdixhiku", name: "Lumir Abdixhiku", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 86, loyalty: 97, role: "Kryetar i LDK-së" },
                { id: "c_bajrami", name: "Hykmete Bajrami", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 83, loyalty: 92, role: "Nënkryetare / Ekonomiste" },
                { id: "c_haziri", name: "Lutfi Haziri", gender: null, genderStatus: 'UNCONFIRMED', region: "GJILANI", pop: 81, loyalty: 84, role: "Nënkryetar i LDK-së" },
                { id: "c_kica", name: "Doarsa Kica-Xhelili", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 82, loyalty: 93, role: "Nënkryetare / Juriste" },
                { id: "c_hoti", name: "Avdullah Hoti", gender: null, genderStatus: 'UNCONFIRMED', region: "GJAKOVA", pop: 78, loyalty: 82, role: "Ish-Kryeministër / Deputet" },
                { id: "c_gashi_a", name: "Arben Gashi", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 77, loyalty: 88, role: "Deputet" },
                { id: "c_llalloshi", name: "Jehona Lushaku-Sadriu", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 76, loyalty: 94, role: "Kryetare e Forumit të Gruas" },
                { id: "c_mustafa_b", name: "Besian Mustafa", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 77, loyalty: 93, role: "Deputet" }
            ],
            reserves: [
                { id: "r_ldk_1", name: "Alban Zogaj", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 76, loyalty: 92, role: "Nënkryetar i Prishtinës" }
            ]
        },
        AAK: {
            id: "AAK",
            name: "Aleanca për Ardhmërinë e Kosovës",
            short: "AAK",
            leader: "Ardian Gjini / Ramush Haradinaj",
            deputyLeaders: ["Besnik Tahiri", "Time Kadrijaj", "Pal Lekaj"],
            orgSecretary: "Blerim Kuçi",
            color: "#d97706",
            tagClass: "tag-aak",
            seats: 7,
            poll: 6.74,
            community: "GENERAL",
            ideology: "Konservatorizëm Kombëtar, Siguri & Anëtarësim direkt në NATO",
            euStance: 89,
            usStance: 96,
            dialogueStance: "Marrëveshje finale me njohje reciproke nën udhëheqjen amerikane",
            partyDiscipline: 89,
            internalCohesion: 87,
            partyFunds: 195000,
            relations: { LVV: 28, PDK: 68, LDK: 64, AAK: 100, MIN_MULTI: 70, SL: 12 },
            candidates: [
                { id: "c_gjini", name: "Ardian Gjini", gender: null, genderStatus: 'UNCONFIRMED', region: "GJAKOVA", pop: 83, loyalty: 96, role: "Kryetar / Drejtues i AAK-së" },
                { id: "c_haradinaj", name: "Ramush Haradinaj", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 84, loyalty: 98, role: "Lider Historik / Ish-Kryeministër" },
                { id: "c_tahiri_b", name: "Besnik Tahiri", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 79, loyalty: 94, role: "Shef i Grupit Parlamentar" },
                { id: "c_kadrijaj", name: "Time Kadrijaj", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 77, loyalty: 96, role: "Deputete" },
                { id: "c_bytyqi", name: "Albana Bytyqi", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 73, loyalty: 92, role: "Deputete" },
                { id: "c_berisha_b", name: "Bekë Berisha", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 75, loyalty: 91, role: "Deputet" },
                { id: "c_lekaj", name: "Pal Lekaj", gender: null, genderStatus: 'UNCONFIRMED', region: "GJAKOVA", pop: 72, loyalty: 90, role: "Deputet" }
            ],
            reserves: []
        },
        MIN_MULTI: {
            id: "MIN_MULTI",
            name: "Grupi Multietnik & Komunitetet",
            short: "Komunitetet (11)",
            leader: "Elbert Krasniqi & Emilija Redžepi",
            deputyLeaders: ["Fikrim Damka (KDTP)", "Nenad Rašić (ZSPO)", "Duda Balje (SDU)"],
            orgSecretary: "Veton Berisha (PLE)",
            color: "#10b981",
            tagClass: "tag-min",
            seats: 11,
            poll: 4.60,
            community: "GUARANTEED_MULTI",
            ideology: "Të Drejtat e Komuniteteve, Integrim Institucional & Bashkëqeverisje",
            euStance: 92,
            usStance: 92,
            dialogueStance: "Integrim paqësor i të gjitha komuniteteve në institucionet e Kosovës",
            partyDiscipline: 85,
            internalCohesion: 80,
            partyFunds: 150000,
            relations: { LVV: 84, PDK: 75, LDK: 78, AAK: 70, MIN_MULTI: 100, SL: 25 },
            candidates: [
                { id: "c_krasniqi_e", name: "Elbert Krasniqi (IRDK)", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 79, loyalty: 92, role: "Ministër i MAPL" },
                { id: "c_redzepi", name: "Emilija Redžepi (NDS)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 78, loyalty: 91, role: "Zëvendëskryeministre III" },
                { id: "c_damka", name: "Fikrim Damka (KDTP)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 77, loyalty: 89, role: "Ministër i Zhvillimit Rajonal" },
                { id: "c_rasic", name: "Nenad Rašić (ZSPO)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 75, loyalty: 88, role: "Ministër për Komunitete dhe Kthim" },
                { id: "c_balje", name: "Duda Balje (SDU)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 80, loyalty: 78, role: "Deputete (Komuniteti Boshnjak)" },
                { id: "c_demiri", name: "Rasim Demiri (Vakat)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 74, loyalty: 82, role: "Deputet (Koalicioni Vakat)" },
                { id: "c_berisha_v", name: "Veton Berisha (PLE)", gender: null, genderStatus: 'UNCONFIRMED', region: "PEJA", pop: 75, loyalty: 84, role: "Deputet (Partia Liberale Egjiptiane)" },
                { id: "c_asllani", name: "Artan Asllani (PSA)", gender: null, genderStatus: 'UNCONFIRMED', region: "FERIZAJ", pop: 72, loyalty: 86, role: "Deputet (Komuniteti Ashkali)" },
                { id: "c_hodza", name: "Adem Hodža (JGP)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 68, loyalty: 74, role: "Deputet (Komuniteti Goran)" },
                { id: "c_kinoli", name: "Albert Kinolli (PREBK)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRISHTINA", pop: 73, loyalty: 85, role: "Deputet (Komuniteti Rom)" },
                { id: "c_kdtp2", name: "Enis Kervan (KDTP)", gender: null, genderStatus: 'UNCONFIRMED', region: "PRIZRENI", pop: 72, loyalty: 88, role: "Deputet (Komuniteti Turk)" }
            ],
            reserves: []
        },
        SL: {
            id: "SL",
            name: "Lista Serbe (Srpska Lista)",
            short: "Lista Serbe (9)",
            leader: "Zlatan Elek",
            deputyLeaders: ["Igor Simić", "Slavko Simić"],
            orgSecretary: "Milan Radojević",
            color: "#475569",
            tagClass: "tag-sl",
            seats: 9,
            poll: 5.40,
            community: "GUARANTEED_SERB",
            ideology: "Përfaqësim i komunitetit serb në koordinim me Beogradin",
            euStance: 50,
            usStance: 45,
            dialogueStance: "Themelim i menjëhershëm i Asociacionit me kompetenca ekzekutive",
            partyDiscipline: 95,
            internalCohesion: 90,
            partyFunds: 210000,
            relations: { LVV: 10, PDK: 15, LDK: 15, AAK: 12, MIN_MULTI: 25, SL: 100 },
            candidates: [
                { id: "c_elek", name: "Zlatan Elek", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 65, loyalty: 96, role: "Kryetar i Listës Serbe" },
                { id: "c_simic", name: "Igor Simić", gender: null, genderStatus: 'UNCONFIRMED', region: "MITROVICA", pop: 62, loyalty: 95, role: "Deputet" }
            ],
            reserves: []
        }
    },

    ministries: [
        { id: "mfpt", name: "Ministria e Financave, Punës dhe Transfereve", minister: "Hekuran Murati", party: "LVV", budget: 860, competence: 88, loyalty: 95, risk: 12, currentIssue: "Kërkesat sindikale dhe rishikimi buxhetor" },
        { id: "mpjd", name: "Ministria e Punëve të Jashtme dhe Diasporës", minister: "Glauk Konjufca", party: "LVV", budget: 68, competence: 92, loyalty: 95, risk: 8, currentIssue: "Lobimi për Këshillin e Evropës dhe misionet diplomatike" },
        { id: "mpb", name: "Ministria e Punëve të Brendshme", minister: "Xhelal Sveçla", party: "LVV", budget: 235, competence: 89, loyalty: 97, risk: 18, currentIssue: "Patrullimet kufitare në veri dhe shtesat e rrezikshmërisë për Policinë" },
        { id: "mm", name: "Ministria e Mbrojtjes (FSK)", minister: "Ejup Maqedonci", party: "LVV", budget: 250, competence: 94, loyalty: 93, risk: 5, currentIssue: "Furnizimi me armatim sipas standardeve të NATO-s" },
        { id: "md", name: "Ministria e Drejtësisë", minister: "Donika Gërvalla", party: "LVV", budget: 62, competence: 83, loyalty: 90, risk: 16, currentIssue: "Vetingu në drejtësi dhe Kodi Civil" },
        { id: "msh", name: "Ministria e Shëndetësisë", minister: "Arben Vitia", party: "LVV", budget: 345, competence: 86, loyalty: 94, risk: 15, currentIssue: "Lista e barnave esenciale dhe sigurimet shëndetësore" },
        { id: "mashti", name: "Ministria e Arsimit, Shkencës, Teknologjisë dhe Inovacionit", minister: "Arbërie Nagavci", party: "LVV", budget: 330, competence: 80, loyalty: 95, risk: 20, currentIssue: "Tekstet shkollore, çerdhet publike dhe rezultatet e PISA-s" },
        { id: "me", name: "Ministria e Ekonomisë dhe Energjisë", minister: "Artane Rizvanolli", party: "LVV", budget: 195, competence: 85, loyalty: 92, risk: 17, currentIssue: "Remonti i blloqeve të KEK-ut dhe ankandi solar" },
        { id: "mmphi", name: "Ministria e Mjedisit, Planifikimit Hapësinor dhe Infrastrukturës", minister: "Liburn Aliu", party: "LVV", budget: 365, competence: 81, loyalty: 84, risk: 22, currentIssue: "Vonesat në shpronësime në rrugët Prishtinë–Podujevë dhe Mitrovicë" },
        { id: "mbpzhr", name: "Ministria e Bujqësisë, Pylltarisë dhe Zhvillimit Rural", minister: "Faton Peci", party: "LVV", budget: 150, competence: 86, loyalty: 90, risk: 14, currentIssue: "Subvencionet për grurin dhe sistemet e ujitjes" },
        { id: "mint", name: "Ministria e Industrisë, Ndërmarrësisë dhe Tregtisë", minister: "Rozeta Hajdari", party: "LVV", budget: 85, competence: 76, loyalty: 93, risk: 26, currentIssue: "Mbikëqyrja e çmimeve të naftës dhe rezervave shtetërore" },
        { id: "mkrs", name: "Ministria e Kulturës, Rinisë dhe Sportit (Lojërat Mesdhetare 2030)", minister: "Hajrulla Çeku", party: "LVV", budget: 185, competence: 90, loyalty: 94, risk: 9, currentIssue: "Masterplani i stadiumeve për Prishtina 2030" },
        { id: "mapl", name: "Ministria e Administrimit të Pushtetit Lokal", minister: "Elbert Krasniqi", party: "MIN_MULTI", budget: 65, competence: 85, loyalty: 91, risk: 10, currentIssue: "Granti i performancës komunale për 38 komunat" },
        { id: "mkk", name: "Ministria për Komunitete dhe Kthim", minister: "Nenad Rašić", party: "MIN_MULTI", budget: 55, competence: 82, loyalty: 88, risk: 14, currentIssue: "Mbështetja për bizneset dhe strehimin e komuniteteve" },
        { id: "mzhr", name: "Ministria e Zhvillimit Rajonal", minister: "Fikrim Damka", party: "MIN_MULTI", budget: 60, competence: 81, loyalty: 87, risk: 13, currentIssue: "Zonat ekonomike ndërkomunale" }
    ],

    municipalities: [
        { id: "m_prishtina", name: "Prishtina", region: "PRISHTINA", voters: 206000, mayorParty: "LDK", mayorName: "Përparim Rama", issue: "Trafiku urban, Unaza e Kryeqytetit & Termokosi", budgetM: 124 },
        { id: "m_podujeva", name: "Podujeva", region: "PRISHTINA", voters: 87000, mayorParty: "LVV", mayorName: "Shpejtim Bulliqi", issue: "Magjistralja Prishtinë–Podujevë & Zona Industriale", budgetM: 31 },
        { id: "m_lipjani", name: "Lipjani", region: "PRISHTINA", voters: 64000, mayorParty: "LDK", mayorName: "Imri Ahmeti", issue: "Infrastruktura në fshatra (Poturovc, Magure) & Bujqësia", budgetM: 24 },
        { id: "m_fushkosova", name: "Fushë Kosova", region: "PRISHTINA", voters: 46000, mayorParty: "LDK", mayorName: "Burim Berisha", issue: "Mbingarkesa urbane, shkollat e reja & ujësjellësi", budgetM: 19 },
        { id: "m_obiliqi", name: "Obiliqi", region: "PRISHTINA", voters: 26000, mayorParty: "LDK", mayorName: "Xhafer Gashi", issue: "Ndotja nga KEK-u, Ligji për Obiliqin & Kogjenerimi", budgetM: 15 },
        { id: "m_drenasi", name: "Drenasi", region: "PRISHTINA", voters: 57000, mayorParty: "PDK", mayorName: "Ramiz Lladrovci", issue: "Parku i Biznesit, Ferronikeli & Ujësjellësi", budgetM: 21 },
        { id: "m_gracanica", name: "Graçanica", region: "PRISHTINA", voters: 21000, mayorParty: "SL", mayorName: "Novak Živić", issue: "Shërbimet komunale & Integrimi ndërkomunitar", budgetM: 11 },
        { id: "m_novoberda", name: "Novobërda", region: "PRISHTINA", voters: 9500, mayorParty: "SL", mayorName: "Saša Milošević", issue: "Turizmi rural në Kalanë e Novobërdës", budgetM: 5 },
        { id: "m_prizreni", name: "Prizreni", region: "PRIZRENI", voters: 178000, mayorParty: "PDK", mayorName: "Shaqir Totaj", issue: "Qendra Historike, Autostrada & Parkimi Urban", budgetM: 68 },
        { id: "m_suhareka", name: "Suhareka", region: "PRIZRENI", voters: 69000, mayorParty: "AAK", mayorName: "Bali Muharremaj", issue: "Vreshtaria, Zona Agro-Industriale & Rinia", budgetM: 25 },
        { id: "m_malisheva", name: "Malisheva", region: "PRIZRENI", voters: 56000, mayorParty: "PDK", mayorName: "Ekrem Kastrati", issue: "Nënkalimet urbane & Infrastruktura rrugore", budgetM: 20 },
        { id: "m_dragashi", name: "Dragashi", region: "PRIZRENI", voters: 40000, mayorParty: "LDK", mayorName: "Bexhet Xheladini", issue: "Blegtoria në Sharr & Turizmi malor", budgetM: 13 },
        { id: "m_mamusha", name: "Mamusha", region: "PRIZRENI", voters: 5500, mayorParty: "MIN_MULTI", mayorName: "Abdülhadi Krasniç", issue: "Sera bujqësore & Eksporti i perimeve", budgetM: 4 },
        { id: "m_peja", name: "Peja", region: "PEJA", voters: 115000, mayorParty: "LDK", mayorName: "Gazmend Muhaxheri", issue: "Turizmi në Rugovë, Bora & Autostrada Pejë–Prishtinë", budgetM: 42 },
        { id: "m_istogu", name: "Istogu", region: "PEJA", voters: 51000, mayorParty: "LDK", mayorName: "Ilir Ferati", issue: "Bujqësia, Trofta & Burimet e ujit", budgetM: 18 },
        { id: "m_klina", name: "Klina", region: "PEJA", voters: 49000, mayorParty: "AAK", mayorName: "Zenun Elezaj", issue: "Uji i pijshëm & Lidhja hekurudhore", budgetM: 16 },
        { id: "m_gjakova", name: "Gjakova", region: "GJAKOVA", voters: 118000, mayorParty: "AAK", mayorName: "Ardian Gjini", issue: "Aeroporti i Gjakovës, Çarshia e Madhe & Stadiumi", budgetM: 44 },
        { id: "m_rahoveci", name: "Rahoveci", region: "GJAKOVA", voters: 61000, mayorParty: "AAK", mayorName: "Smajl Latifi", issue: "Subvencionet për verëtarët & Sistemi i ujitjes", budgetM: 21 },
        { id: "m_decani", name: "Deçani", region: "GJAKOVA", voters: 43000, mayorParty: "AAK", mayorName: "Bashkim Ramosaj", issue: "Rruga Deçan–Plavë & Bjeshkët e Nemuna", budgetM: 15 },
        { id: "m_juniku", name: "Juniku", region: "GJAKOVA", voters: 6200, mayorParty: "LDK", mayorName: "Ruzhdi Shehu", issue: "Kullat tradicionale & Eko-turizmi", budgetM: 4 },
        { id: "m_mitrovica_j", name: "Mitrovica e Jugut", region: "MITROVICA", voters: 84000, mayorParty: "PDK", mayorName: "Bedri Hamza / Arian Tahiri", issue: "Trepça, Liqeni Akumulues & Zhvillimi ekonomik", budgetM: 32 },
        { id: "m_vushtrria", name: "Vushtrria", region: "MITROVICA", voters: 76000, mayorParty: "PDK", mayorName: "Ferit Idrizi", issue: "Kultivimi i patates & Zona industriale", budgetM: 26 },
        { id: "m_skenderaj", name: "Skenderaj", region: "MITROVICA", voters: 55000, mayorParty: "PDK", mayorName: "Fadil Nura", issue: "Memoriali në Prekaz & Ujësjellësi rajonal", budgetM: 20 },
        { id: "m_mitrovica_v", name: "Mitrovica e Veriut", region: "MITROVICA", voters: 18500, mayorParty: "SL", mayorName: "Milan Radojević", issue: "Ura e Ibrit, Siguria publike & Integrimi ligjor", budgetM: 9 },
        { id: "m_zvecani", name: "Zveçani", region: "MITROVICA", voters: 7200, mayorParty: "SL", mayorName: "Dragiša Milović", issue: "Trepça në veri & Rend dhe ligj", budgetM: 5 },
        { id: "m_leposaviqi", name: "Leposaviqi", region: "MITROVICA", voters: 13500, mayorParty: "SL", mayorName: "Zoran Todić", issue: "Kontrolli kufitar në Jarinjë & Infrastruktura", budgetM: 7 },
        { id: "m_zubinpotoku", name: "Zubin Potoku", region: "MITROVICA", voters: 6800, mayorParty: "SL", mayorName: "Miloš Perović", issue: "Siguria e Liqenit të Ujmanit & Kanali Ibër-Lepenc", budgetM: 5 },
        { id: "m_gjilani", name: "Gjilani", region: "GJILANI", voters: 105000, mayorParty: "LVV", mayorName: "Alban Hyseni", issue: "Autostrada e Gjilanit & Stadiumi i Qytetit", budgetM: 39 },
        { id: "m_vitia", name: "Vitia", region: "GJILANI", voters: 49000, mayorParty: "LDK", mayorName: "Sokol Haliti", issue: "Lidhja me autostradën & Bujqësia", budgetM: 17 },
        { id: "m_kamenica", name: "Kamenica", region: "GJILANI", voters: 36000, mayorParty: "LVV", mayorName: "Kadri Rahimaj", issue: "Reforma në arsim & Zona kufitare", budgetM: 13 },
        { id: "m_ranillugu", name: "Ranillugu", region: "GJILANI", voters: 5100, mayorParty: "SL", mayorName: "Tanja Antić", issue: "Bujqësia lokale & Shërbimet komunale", budgetM: 4 },
        { id: "m_parteshi", name: "Parteshi", region: "GJILANI", voters: 4800, mayorParty: "SL", mayorName: "Dragan Petković", issue: "Infrastruktura rurale", budgetM: 3 },
        { id: "m_kllokoti", name: "Kllokoti", region: "GJILANI", voters: 4200, mayorParty: "SL", mayorName: "Vladan Bogdanović", issue: "Banjat termale & Turizmi shëndetësor", budgetM: 3 },
        { id: "m_ferizaj", name: "Ferizaj", region: "FERIZAJ", voters: 119000, mayorParty: "PDK", mayorName: "Agim Aliu", issue: "Nënkalimet urbane, Spitali Rajonal & Bizneset", budgetM: 45 },
        { id: "m_kacaniku", name: "Kaçaniku", region: "FERIZAJ", voters: 36000, mayorParty: "PDK", mayorName: "Besim Ilazi", issue: "Impianti i ujërave & Lumi Nerodime", budgetM: 13 },
        { id: "m_shtimja", name: "Shtimja", region: "FERIZAJ", voters: 29000, mayorParty: "LVV", mayorName: "Qemajl Aliu", issue: "Unaza e Shtimes & Qendra e Inovacionit", budgetM: 11 },
        { id: "m_hanielezit", name: "Hani i Elezit", region: "FERIZAJ", voters: 9800, mayorParty: "PDK", mayorName: "Mehmet Ballazhi", issue: "Dogana kufitare & Mjedisi rreth SharrCem", budgetM: 5 },
        { id: "m_shterpce", name: "Shtërpca", region: "FERIZAJ", voters: 12500, mayorParty: "SL", mayorName: "Ivica Tanasijević", issue: "Qendra e skijimit në Brezovicë & Mjedisi", budgetM: 6 }
    ]
};

const STORAGE_KEY_AUTO = "republika_ks_2026_autosave_v5";
const STORAGE_KEY_SLOTS = "republika_ks_2026_slots_v5";
// Storage keys and slot envelopes stay compatible; this versions only the state schema.
const STATE_SCHEMA_VERSION = 1;
const MONTHS_SQ = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];

/* ============================================================================
   FAZA E RE: STATUSI I LOJTARIT DHE FAZAT INSTITUCIONALE
   ============================================================================ */

const PLAYER_STATUS = {
    IN_GOVERNMENT: "IN_GOVERNMENT",
    OPPOSITION: "OPPOSITION",
    CARE_TAKER: "CARE_TAKER",
    TRANSITION: "TRANSITION",
    NO_GOVERNMENT: "NO_GOVERNMENT"
};

const INSTITUTIONAL_PHASES = {
    ASSEMBLY_CONSTITUTING: "ASSEMBLY_CONSTITUTING",
    ASSEMBLY_CONSTITUTED: "ASSEMBLY_CONSTITUTED",
    NEW: "NEW",
    ASSEMBLY_ELECTED: "ASSEMBLY_ELECTED",
    SPEAKER_ELECTED: "SPEAKER_ELECTED",
    PRESIDENT_ELECTED: "PRESIDENT_ELECTED",
    GOV_VOTING: "GOV_VOTING",
    GOV_APPROVED: "GOV_APPROVED",
    GOV_IN_OFFICE: "GOV_IN_OFFICE",
    GOV_OVERTHROWN: "GOV_OVERTHROWN",
    SNAP_ELECTION: "SNAP_ELECTION"
};

const INSTITUTIONAL_PHASE_LABELS = {
    RESULTS_PENDING_VALIDATION: "Numërimi përfundoi — verifikoni 120 mandatet",
    ASSEMBLY_AWAITING_CONSTITUTION: "Rezultatet përfundimtare — Kuvendi pret konstituimin",
    GOV_FORMATION: "Formimi i Qeverisë në proces",
    ASSEMBLY_CONSTITUTING: "Seanca konstituive në vazhdim",
    ASSEMBLY_CONSTITUTED: "Kuvendi është konstituuar — pritet mandatimi",
    NEW: "Procesi institucional ka nisur",
    ASSEMBLY_ELECTED: "Kuvendi u konstituua — pritet zgjedhja e Kryetarit",
    SPEAKER_ELECTED: "Kryetari i Kuvendit u zgjodh — pritet Presidenti",
    PRESIDENT_ELECTED: "Presidenti u zgjodh — pritet votimi i Qeverisë",
    GOV_VOTING: "Qeveria është në votim në Kuvend",
    GOV_APPROVED: "Qeveria u miratua — në pritje të fillimit të mandatit",
    GOV_IN_OFFICE: "Qeveria është në detyrë me mandat të plotë",
    GOV_OVERTHROWN: "Qeveria u rrëzua — nevojiten zgjedhje të reja ose mandatar i ri",
    SNAP_ELECTION: "Zgjedhjet e reja janë thirrur"
};

let state = null;
let votingAnimInterval = null;
let currentVotingData = null;
let _voteInProgress = false;
let _committingVote = false;
let _saveErrorShown = false;

function getPlayerStatus() {
    if (!state) return PLAYER_STATUS.NO_GOVERNMENT;
    if(state.governmentStatus === "CARETAKER") return (state.previousGovernment ? state.previousGovernment.coalitionParties : state.coalitionParties || []).includes(state.playerParty) ? PLAYER_STATUS.CARE_TAKER : PLAYER_STATUS.OPPOSITION;
    var phase = state.institutionalPhase || INSTITUTIONAL_PHASES.NEW;
    if (phase === INSTITUTIONAL_PHASES.GOV_OVERTHROWN || phase === INSTITUTIONAL_PHASES.SNAP_ELECTION) {
        if (state.coalitionParties && state.coalitionParties.indexOf(state.playerParty) !== -1) {
            return PLAYER_STATUS.TRANSITION;
        }
        return PLAYER_STATUS.OPPOSITION;
    }
    if (phase === INSTITUTIONAL_PHASES.GOV_VOTING) {
        return PLAYER_STATUS.TRANSITION;
    }
    if (phase === INSTITUTIONAL_PHASES.GOV_APPROVED || phase === INSTITUTIONAL_PHASES.GOV_IN_OFFICE) {
        if (state.coalitionParties && state.coalitionParties.indexOf(state.playerParty) !== -1) {
            return PLAYER_STATUS.IN_GOVERNMENT;
        }
        return PLAYER_STATUS.OPPOSITION;
    }
    if (state.mandatar === state.playerParty) {
        return PLAYER_STATUS.TRANSITION;
    }
    if (state.governmentFormed && state.coalitionParties && state.coalitionParties.indexOf(state.playerParty) === -1) {
        return PLAYER_STATUS.OPPOSITION;
    }
    return PLAYER_STATUS.OPPOSITION;
}

function getPlayerStatusLabel() {
    var st = getPlayerStatus();
    if (st === PLAYER_STATUS.IN_GOVERNMENT) return "Qeveri në Detyrë (Pushtet i Plotë)";
    if (st === PLAYER_STATUS.OPPOSITION) return "Opozitë";
    if (st === PLAYER_STATUS.CARE_TAKER) return "Qeveri në detyrë (kompetenca të kufizuara)";
    if (st === PLAYER_STATUS.TRANSITION) return "Në Proces Formimi të Qeverisë";
    return "Pa Qeveri Funksionale";
}

function isPlayerInGovernment() {
    return getPlayerStatus() === PLAYER_STATUS.IN_GOVERNMENT;
}

function isPlayerOpposition() {
    var st = getPlayerStatus();
    return st === PLAYER_STATUS.OPPOSITION || st === PLAYER_STATUS.TRANSITION;
}

function isPlayerCaretaker() {
    return getPlayerStatus() === PLAYER_STATUS.CARE_TAKER;
}

function assertGovernmentAuthority(actionLabel) {
    var st = getPlayerStatus();
    if (!agendaExecutive()) {
        if(st===PLAYER_STATUS.IN_GOVERNMENT){showToast((actionLabel || "Ky veprim")+" kërkon kompetencat e Kryeministrit; partneri i koalicionit përdor mjetet parlamentare.");return false;}
        if (st === PLAYER_STATUS.OPPOSITION) {
            showToast("⛔ " + (actionLabel || "Ky veprim") + " është vetëm për Qeverinë në detyrë. Ju jeni në opozitë. Mund të përdorni mjetet parlamentare të kontrollit.");
        } else if (st === PLAYER_STATUS.TRANSITION) {
            showToast("⛔ " + (actionLabel || "Ky veprim") + " nuk mund të kryhet gjatë tranzicionit institucional. Fillimisht duhet të formohet dhe votohet Qeveria e re.");
        } else if (st === PLAYER_STATUS.CARE_TAKER) {
            showToast("⛔ " + (actionLabel || "Ky veprim") + " nuk lejohet për një qeveri në detyrë (caretaker). Vetëm veprimet urgjente dhe vazhdimësia lejohen.");
        } else {
            showToast("⛔ " + (actionLabel || "Ky veprim") + " kërkon një Qeveri funksionale me mandat të plotë.");
        }
        return false;
    }
    return true;
}

function assertAssemblyFunctional(actionLabel) {
    if (!state) return false;
    if(energyInquiryPending(state)){showToast('Zgjidhni qendrimin per Komisionin Hetimor te Rrymes.');return false;}
    if(mediaDossierBlocked(state)){showToast('Kuvendi eshte bllokuar pas pergjimeve. Zgjidhni krizen.');return false;}
    if(typeof activeAssemblyObstruction==='function'&&activeAssemblyObstruction(state)){showToast('Kuvendi eshte i bllokuar nga opozita. Zgjidhni krizen.');return false;}
    if (!constituentGovernmentGate()) return false;
    if (!state.assemblyConstituted || !state.speakerElected) {
        showToast("⛔ " + (actionLabel || "Ky veprim") + " kërkon një Kuvend të konstituuar me Kryetar të zgjedhur. Fillimisht konstituoni Kuvendin dhe zgjidhni Kryetarin.");
        return false;
    }
    return true;
}

function setInstitutionalPhase(phase, note) {
    if (!state) return;
    state.institutionalPhase = phase;
    applyInstitutionalPhaseTransition(phase, note);
}

function applyInstitutionalPhaseTransition(phase, note) {
    if (!state) return;
    state.institutionalPhase = phase;

    if (phase === INSTITUTIONAL_PHASES.NEW) {
        state.assemblyConstituted = false;
        state.speakerElected = false;
        state.speakerOfAssembly = "Në pritje të konstituimit";
        state.governmentFormed = false;
        state.governmentStatus = "NONE";
        state.primeMinister = "Nuk ka qeveri";
    } else if (phase === INSTITUTIONAL_PHASES.ASSEMBLY_ELECTED) {
        state.assemblyConstituted = true;
        state.speakerElected = false;
        state.speakerOfAssembly = "Në pritje të zgjedhjes së Kryetarit";
        state.governmentFormed = false;
        state.governmentStatus = "PENDING";
        state.primeMinister = "Në pritje të mandatarit";
    } else if (phase === INSTITUTIONAL_PHASES.SPEAKER_ELECTED) {
        state.assemblyConstituted = true;
        state.speakerElected = true;
        if (!state.speakerOfAssembly || state.speakerOfAssembly.indexOf("pritje") !== -1) {
            state.speakerOfAssembly = "Albulena Haxhiu (LVV)";
        }
        state.governmentFormed = false;
        state.governmentStatus = "PENDING";
        state.primeMinister = "Në pritje të mandatarit";
    } else if (phase === INSTITUTIONAL_PHASES.PRESIDENT_ELECTED) {
        state.assemblyConstituted = true;
        state.speakerElected = true;
        state.governmentFormed = false;
        state.governmentStatus = "PENDING";
        state.primeMinister = "Në pritje të votimit të Qeverisë";
    } else if (phase === INSTITUTIONAL_PHASES.GOV_VOTING) {
        state.assemblyConstituted = true;
        state.speakerElected = true;
        state.governmentFormed = false;
        state.governmentStatus = "VOTING";
        state.primeMinister = "Qeveria në votim";
    } else if (phase === INSTITUTIONAL_PHASES.GOV_APPROVED) {
        state.assemblyConstituted = true;
        state.speakerElected = true;
        state.governmentFormed = true;
        state.governmentStatus = "APPROVED";
    } else if (phase === INSTITUTIONAL_PHASES.GOV_IN_OFFICE) {
        state.assemblyConstituted = true;
        state.speakerElected = true;
        state.governmentFormed = true;
        state.governmentStatus = "IN_OFFICE";
    } else if (phase === INSTITUTIONAL_PHASES.GOV_OVERTHROWN) {
        state.governmentFormed = false;
        state.governmentStatus = "OVERTHROWN";
        state.primeMinister = "Qeveri e rrëzuar — pritet mandatar i ri ose zgjedhje";
        state.coalitionParties = [];
        state.coalitionAgreements = [];
        state.ministries.forEach(function(m) {
            m.party = "NONE";
            m.minister = "I/E paemëruar";
        });
    } else if (phase === INSTITUTIONAL_PHASES.SNAP_ELECTION) {
        state.governmentFormed = false;
        state.governmentStatus = "SNAP_ELECTION";
        state.primeMinister = "Qeveri në detyrë deri në zgjedhje";
        state.assemblyConstituted = false;
        state.speakerElected = false;
        state.speakerOfAssembly = "Kuvend i shpërndarë — zgjedhje të reja";
    }

    if (note) {
        state.historyLog.unshift(MONTHS_SQ[state.monthIndex] + " " + state.year + " [Institucional]: " + note);
    }
}

function getPlayerRoleLabel() { return state ? politicalPlayerRole().label+' ('+state.parties[state.playerParty].short+')' : ''; }

/* ============================================================================
   2. KATALOGU I PROJEKTEVE ZHVILLIMORE
   ============================================================================ */
const DEVELOPMENT_PROJECT_CATALOG = [
    { type: "ROAD", name: "Rrugë dhe Infrastrukturë Rrugore", sectorId: "sec_roads", icon: "🛣️", costRangeM: [8, 60], weeksRange: [8, 20], sectorGain: 8, muniInfraGain: 12, muniConnectGain: 10, empGain: 3, devGain: 5, riskText: "Vonesa nga shpronësimet dhe moti i keq." },
    { type: "SCHOOL", name: "Shkolla dhe Çerdhe", sectorId: "sec_edu", icon: "🏫", costRangeM: [6, 35], weeksRange: [10, 24], sectorGain: 9, muniServGain: 8, muniEducGain: 14, devGain: 4, riskText: "Mungesa e kuadrit mësimor dhe teksteve." },
    { type: "HEALTH", name: "Qendra Shëndetësore dhe Spitale", sectorId: "sec_health", icon: "🏥", costRangeM: [10, 55], weeksRange: [12, 26], sectorGain: 10, muniServGain: 12, muniHealthGain: 14, devGain: 5, riskText: "Prokurimi i pajisjeve dhe stafit mjekësor." },
    { type: "WATER", name: "Ujësjellës dhe Kanalizim", sectorId: "sec_water", icon: "💧", costRangeM: [8, 45], weeksRange: [10, 22], sectorGain: 8, muniInfraGain: 10, muniServGain: 10, muniWaterGain: 10, muniHealthGain: 4, devGain: 4, riskText: "Problemet me lejet mjedisore." },
    { type: "TRANSPORT", name: "Transport Publik Urban", sectorId: "sec_rail", icon: "🚌", costRangeM: [10, 40], weeksRange: [10, 18], sectorGain: 7, muniConnectGain: 12, muniServGain: 6, devGain: 4, riskText: "Vonesat në blerjen e autobusëve." },
    { type: "ECONOMIC_ZONE", name: "Zonë Ekonomike dhe Park Biznesi", sectorId: "sec_econ", icon: "🏭", costRangeM: [15, 70], weeksRange: [16, 28], sectorGain: 8, muniEmpGain: 12, devGain: 10, gdpGain: 0.15, riskText: "Tërheqja e investitorëve privatë." },
    { type: "ENERGY_EFF", name: "Efikasitet Energjetik dhe Energji e Ripërtëritshme", sectorId: "sec_energy", icon: "⚡", costRangeM: [12, 50], weeksRange: [12, 22], sectorGain: 9, muniServGain: 6, devGain: 5, riskText: "Çmimet e paneleve dhe lejet." },
    { type: "ENVIRONMENT", name: "Mjedis dhe Menaxhim Mbeturinash", sectorId: "sec_env", icon: "♻️", costRangeM: [8, 35], weeksRange: [10, 20], sectorGain: 8, muniServGain: 8, devGain: 5, riskText: "Rezistenca lokale ndaj deponive." },
    { type: "GREEN_SPACE", name: "Hapësira të Gjelbra dhe Parqe Publike", sectorId: "sec_env", icon: "🌳", costRangeM: [1, 8], weeksRange: [4, 10], sectorGain: 5, muniServGain: 5, devGain: 5, riskText: "Projekt i simuluar; përfitimet nuk janë matje fizike mjedisore." },
    { type: "DIGITAL", name: "Digjitalizim i Shërbimeve Komunale", sectorId: "sec_tech", icon: "💻", costRangeM: [4, 20], weeksRange: [6, 14], sectorGain: 7, muniServGain: 10, devGain: 3, riskText: "Siguria kibernetike dhe trajnimi i stafit." },
    { type: "AGRICULTURE", name: "Projekte Bujqësore dhe Ujitje", sectorId: "sec_agri", icon: "🌾", costRangeM: [6, 30], weeksRange: [8, 18], sectorGain: 7, muniEmpGain: 6, devGain: 5, riskText: "Kushtet klimatike dhe tregu." }
];

const DEVELOPMENT_PROJECT_LEVELS = {
    1: "Shumë i dobët", 2: "I dobët", 3: "Nën mesatare", 4: "Mesatar i ulët",
    5: "Mesatar", 6: "Mesatar i lartë", 7: "I mirë", 8: "Shumë i mirë", 9: "I shkëlqyer", 10: "Ekselent"
};

/* ============================================================================
   3. KATALOGU I PROJEKTLIGJEVE (Pika 6)
   Burime: Kuvendi i Kosovës, Gazeta Zyrtare, Kushtetuta (Neni 81)
   Ligjet historike janë tituj realë të verifikuar; parametrat e lojës janë
   të simuluar për balancim, jo pretendime për kosto reale.
   ============================================================================ */
const LAW_CATALOG = [
    /* BUXHETI */
    { id: "cat_budget_2027", title: "Ligji për Buxhetin e Republikës së Kosovës për Vitin 2027", desc: "Përcakton kuadrin fiskal vjetor, burimet e të hyrave dhe kufijtë e shpenzimeve për të gjitha institucionet buxhetore.", field: "Buxheti", ministry: "Ministria e Financave, Punës dhe Transfereve", lawType: "BUDGET", source: "Historik real — Kuvendi i Kosovës, Ligji vjetor i buxhetit", defaultCostM: 140, costRangeM: [80, 250], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.5, sectorId: "sec_econ", riskText: "Rrezik i moskalimit nëse mazhoranca është e brishtë.", historicNote: "Ligji vjetor i buxhetit miratohet me shumicë të thjeshtë." },
    { id: "cat_anti_informality", title: "Ligji për Parandalimin e Informalitetit dhe Digjitalizimin e Arkave Fiskale", desc: "Zgjerimi i sistemit të arkave fiskale elektronike dhe nxitja e formalizimit të bizneseve.", field: "Buxheti", ministry: "Ministria e Financave, Punës dhe Transfereve", lawType: "ORDINARY", source: "Temë e simuluar, e bazuar në reformat reale të ATK-së", defaultCostM: 20, costRangeM: [5, 40], impactType: "APPROVAL_MIXED", impactMagnitude: 2.0, sectorId: "sec_econ", riskText: "Kundërshtim nga bizneset e vogla për shkak të kostove të përshtatjes." },
    { id: "cat_sovereign_fund", title: "Ligji për Fondin Sovran të Investimeve Strategjike", desc: "Themelon një fond shtetëror për investime kapitale në sektorë strategjikë me partneritet privat.", field: "Buxheti", ministry: "Ministria e Financave, Punës dhe Transfereve", lawType: "ORDINARY", source: "Propozim i simuluar për simulatorin", defaultCostM: 0, costRangeM: [0, 0], impactType: "APPROVAL_MIXED", impactMagnitude: 1.5, sectorId: "sec_econ", riskText: "Rrezik qeverisjeje dhe transparence në menaxhimin e fondit." },
    /* ARSIMI */
    { id: "cat_higher_education", title: "Ligji për Arsimin e Lartë dhe Akreditimin e Universiteteve", desc: "Rregullon kriteret e akreditimit, financimin dhe cilësinë e arsimit të lartë universitar në Kosovë.", field: "Arsimi", ministry: "Ministria e Arsimit, Shkencës, Teknologjisë dhe Inovacionit", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 04/L-037 për Arsimin e Lartë në Republikën e Kosovës", defaultCostM: 15, costRangeM: [5, 40], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.5, sectorId: "sec_edu", riskText: "Rezistencë nga sindikatat akademike." },
    { id: "cat_preuniversity", title: "Ligji për Arsimin Parauniversitar dhe Tekstet Shkollore Falas", desc: "Garanton tekstet falas për arsimin e detyrueshëm dhe modernizon kurrikulën.", field: "Arsimi", ministry: "Ministria e Arsimit, Shkencës, Teknologjisë dhe Inovacionit", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 04/L-032 për Arsimin Parauniversitar", defaultCostM: 30, costRangeM: [15, 60], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.0, sectorId: "sec_edu", riskText: "Kosto e lartë fiskale dhe vonesa në prokurim." },
    { id: "cat_children_allowance", title: "Ligji për Shtesat për Fëmijë dhe Lehonat", desc: "Zgjon skemën e shtesave mujore për fëmijë dhe lehonat, duke synuar rritjen e natalitetit.", field: "Arsimi", ministry: "Ministria e Financave, Punës dhe Transfereve", lawType: "ORDINARY", source: "Temë e simuluar për simulatorin", defaultCostM: 80, costRangeM: [40, 150], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.8, sectorId: "sec_social", riskText: "Presion i fortë në buxhetin vjetor." },
    /* SHËNDETËSIA */
    { id: "cat_health_insurance", title: "Ligji për Sigurimin e Detyrueshëm Shëndetësor", desc: "Themelon skemën e sigurimit shëndetësor me kontribute nga punëdhënësi dhe punëmarrësi.", field: "Shëndetësia", ministry: "Ministria e Shëndetësisë", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 04/L-249 për Sigurimin Shëndetësor", defaultCostM: 55, costRangeM: [20, 120], impactType: "APPROVAL_MIXED", impactMagnitude: 3.0, sectorId: "sec_health", riskText: "Kundërshtim nga punëdhënësit për barrën e re fiskale." },
    { id: "cat_essential_medicines", title: "Ligji për Listën e Barnave Esenciale dhe Financimin e tyre", desc: "Përcakton listën e barnave esenciale që financohen plotësisht nga Buxheti i Shtetit.", field: "Shëndetësia", ministry: "Ministria e Shëndetësisë", lawType: "ORDINARY", source: "Temë e simuluar, e bazuar në nevojat reale të QKUK-së", defaultCostM: 40, costRangeM: [15, 80], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.2, sectorId: "sec_health", riskText: "Vonesa në prokurim dhe rrezik i korrupsionit." },
    { id: "cat_health_digital", title: "Ligji për Sistemin Informativ Shëndetësor dhe Telemedicinën", desc: "Themelon regjistrin elektronik të pacientëve dhe shërbimet e telemedicinës në qendrat shëndetësore.", field: "Shëndetësia", ministry: "Ministria e Shëndetësisë", lawType: "ORDINARY", source: "Temë e simuluar për simulatorin", defaultCostM: 25, costRangeM: [10, 50], impactType: "APPROVAL_POSITIVE", impactMagnitude: 2.5, sectorId: "sec_health", riskText: "Siguria e të dhënave personale." },
    /* INFRASTRUKTURA */
    { id: "cat_highways", title: "Ligji për Rrugët Magjistrale dhe Shpronësimet për Interes Publik", desc: "Përshpejton procedurat e shpronësimit për projektet e infrastrukturës strategjike.", field: "Infrastruktura", ministry: "Ministria e Mjedisit, Planifikimit Hapësinor dhe Infrastrukturës", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 03/L-139 për Shpronësimin e Pronës së Paluajtshme", defaultCostM: 60, costRangeM: [20, 150], impactType: "APPROVAL_MIXED", impactMagnitude: 2.0, sectorId: "sec_roads", riskText: "Kundërshtim nga pronarët dhe shoqëria civile." },
    { id: "cat_railway", title: "Ligji për Hekurudhat e Kosovës dhe Modernizimin e Linjës 10", desc: "Rregullon statusin e Hekurudhave të Kosovës dhe financimin e linjës Hani i Elezit–Leshak.", field: "Infrastruktura", ministry: "Ministria e Mjedisit, Planifikimit Hapësinor dhe Infrastrukturës", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 04/L-063 për Hekurudhat e Kosovës", defaultCostM: 45, costRangeM: [20, 120], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.0, sectorId: "sec_rail", riskText: "Kosto e lartë dhe varësi nga financimi i BE-së." },
    /* EKONOMIA */
    { id: "cat_investment_law", title: "Ligji për Investimet Strategjike dhe Zonat Ekonomike", desc: "Ofron stimuj fiskalë për investitorët strategjikë dhe themelon zona të veçanta ekonomike.", field: "Ekonomia", ministry: "Ministria e Industrisë, Ndërmarrësisë dhe Tregtisë", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 04/L-220 për Investimet Strategjike", defaultCostM: 25, costRangeM: [10, 60], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.0, sectorId: "sec_econ", riskText: "Rrezik për abuzime me stimujt fiskalë." },
    { id: "cat_sme_support", title: "Ligji për Mbështetjen e Ndërmarrjeve të Vogla dhe të Mesme", desc: "Themelon garanci shtetërore për kreditë e NVM-ve dhe fonde zhvillimore.", field: "Ekonomia", ministry: "Ministria e Industrisë, Ndërmarrësisë dhe Tregtisë", lawType: "ORDINARY", source: "Temë e simuluar për simulatorin", defaultCostM: 30, costRangeM: [10, 70], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.5, sectorId: "sec_econ", riskText: "Rrezik i mosperformancës së kredive të garantuara." },
    /* DREJTËSIA */
    { id: "cat_vetting_law", title: "Ligji për Verifikimin e Figurës së Zyrtarëve Publikë (Vetingu)", desc: "Themelon procesin e verifikimit të pasurisë dhe integritetit të zyrtarëve të lartë.", field: "Drejtësia", ministry: "Ministria e Drejtësisë", lawType: "ORDINARY", source: "Temë e simuluar, e bazuar në rekomandimet e Komisionit të Venecias", defaultCostM: 8, costRangeM: [3, 25], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.5, sectorId: "sec_justice", riskText: "Kundërshtim nga gjyqtarët dhe prokurorët aktualë." },
    { id: "cat_anti_corruption", title: "Ligji për Agjencinë e Pavarur Kundër Korrupsionit", desc: "Forcon pavarësinë dhe kompetencat e Agjencisë Kundër Korrupsionit.", field: "Drejtësia", ministry: "Ministria e Drejtësisë", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 03/L-159 për Agjencinë Kundër Korrupsionit", defaultCostM: 6, costRangeM: [2, 15], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.0, sectorId: "sec_justice", riskText: "Rrezik i politizimit të agjencisë." },
    { id: "cat_confiscation", title: "Ligji për Konfiskimin Civil të Pasurisë së Pajustifikueshme", desc: "Themelon mekanizmin për konfiskimin civil të pasurisë së zyrtarëve pa dënim penal.", field: "Drejtësia", ministry: "Ministria e Drejtësisë", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 08/L-032 për Konfiskimin e Pasurisë", defaultCostM: 4, costRangeM: [2, 10], impactType: "APPROVAL_POSITIVE", impactMagnitude: 5.0, sectorId: "sec_justice", riskText: "Kundërshtim nga avokatët e mbrojtjes." },
    /* MJEDISI */
    { id: "cat_environment", title: "Ligji për Mbrojtjen e Mjedisit dhe Menaxhimin e Mbeturinave", desc: "Rregullon standardet mjedisore dhe krijon sistemin e integruar të menaxhimit të mbeturinave.", field: "Mjedisi", ministry: "Ministria e Mjedisit, Planifikimit Hapësinor dhe Infrastrukturës", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 03/L-025 për Mbrojtjen e Mjedisit", defaultCostM: 35, costRangeM: [15, 80], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.5, sectorId: "sec_env", riskText: "Kundërshtim nga bizneset ndotëse." },
    { id: "cat_renewable_energy", title: "Ligji për Energjinë e Ripërtëritshme dhe Ankandet Solare", desc: "Krijon kornizën për ankande të energjisë diellore dhe erës, me tarifa të garantuara.", field: "Mjedisi", ministry: "Ministria e Ekonomisë dhe Energjisë", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 05/L-081 për Energjinë", defaultCostM: 20, costRangeM: [8, 50], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.0, sectorId: "sec_energy", riskText: "Vonesa në lëshimin e lejeve mjedisore." },
    /* BUJQËSIA */
    { id: "cat_agriculture", title: "Ligji për Subvencionet Bujqësore dhe Zhvillimin Rural", desc: "Rregullon skemën e subvencioneve direkte për fermerët dhe mbështetjen për zhvillimin rural.", field: "Bujqësia", ministry: "Ministria e Bujqësisë, Pylltarisë dhe Zhvillimit Rural", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 04/L-090 për Bujqësinë dhe Zhvillimin Rural", defaultCostM: 55, costRangeM: [20, 120], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.5, sectorId: "sec_agri", riskText: "Kosto e vazhdueshme vjetore." },
    /* ENERGJIA */
    { id: "cat_energy_strategy", title: "Ligji për Strategjinë Kombëtare të Energjisë 2026–2035", desc: "Përcakton objektivat e sigurisë energjetike, tranzicionit dhe efikasitetit për dekadën e ardhshme.", field: "Energjia", ministry: "Ministria e Ekonomisë dhe Energjisë", lawType: "ORDINARY", source: "Temë e simuluar, e bazuar në Strategjinë reale të Energjisë të Kosovës", defaultCostM: 40, costRangeM: [15, 100], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.0, sectorId: "sec_energy", riskText: "Debat i fortë për të ardhmen e termocentraleve." },
    /* KOMUNAT */
    { id: "cat_local_gov", title: "Ligji për Vetëqeverisjen Lokale dhe Kompetencat Komunale", desc: "Rregullon kompetencat, financimin dhe marrëdhëniet e komunave me Qeverinë qendrore.", field: "Komunat", ministry: "Ministria e Administrimit të Pushtetit Lokal", lawType: "VITAL", source: "Historik real — Ligji Nr. 03/L-040 për Vetëqeverisjen Lokale (ligj me interes vital)", defaultCostM: 20, costRangeM: [5, 60], impactType: "APPROVAL_MIXED", impactMagnitude: 2.5, sectorId: "sec_local", riskText: "Kërkon shumicë të dyfishtë (61+ dhe 14/20 komunitete)." },
    { id: "cat_capital_grants", title: "Ligji për Grantet Kapitale për Komunat dhe Performancën Komunale", desc: "Themelon fondin e granteve kapitale për komunat, të lidhura me performancën dhe transparencën.", field: "Komunat", ministry: "Ministria e Administrimit të Pushtetit Lokal", lawType: "ORDINARY", source: "Temë e simuluar për simulatorin", defaultCostM: 40, costRangeM: [15, 90], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.2, sectorId: "sec_local", riskText: "Kapacitetet e dobëta të komunave të vogla." },
    /* KOMUNITETET */
    { id: "cat_communities", title: "Ligji për Të Drejtat e Komuniteteve dhe Përdorimin e Gjuhëve", desc: "Rregullon të drejtat gjuhësore, arsimore dhe kulturore të komuniteteve joshumicë.", field: "Komunitetet", ministry: "Ministria për Komunitete dhe Kthim", lawType: "VITAL", source: "Historik real — Ligji Nr. 02/L-37 për Përdorimin e Gjuhëve (ligj me interes vital)", defaultCostM: 15, costRangeM: [5, 40], impactType: "APPROVAL_MIXED", impactMagnitude: 2.0, sectorId: "sec_local", riskText: "Kërkon shumicë të dyfishtë (61+ dhe 14/20 komunitete)." },
    { id: "cat_cultural_heritage", title: "Ligji për Trashëgiminë Kulturore dhe Zonat e Mbrojtura", desc: "Rregullon mbrojtjen e trashëgimisë kulturore dhe zonave me interes të veçantë.", field: "Komunitetet", ministry: "Ministria e Kulturës, Rinisë dhe Sportit", lawType: "VITAL", source: "Historik real — Ligji Nr. 02/L-88 për Trashëgiminë Kulturore", defaultCostM: 10, costRangeM: [3, 25], impactType: "APPROVAL_POSITIVE", impactMagnitude: 2.8, sectorId: "sec_local", riskText: "Kërkon shumicë të dyfishtë (61+ dhe 14/20 komunitete)." },
    /* MBROJTJA */
    { id: "cat_defense_fund", title: "Ligji për Fondin e Mbrojtjes dhe Modernizimin e FSK-së", desc: "Krijon fondin e dedikuar për prokurimin e pajisjeve ushtarake dhe trajnimin e FSK-së.", field: "Mbrojtja", ministry: "Ministria e Mbrojtjes", lawType: "ORDINARY", source: "Temë e simuluar për simulatorin", defaultCostM: 120, costRangeM: [50, 250], impactType: "APPROVAL_POSITIVE", impactMagnitude: 5.0, sectorId: "sec_fsk", riskText: "Kosto e lartë dhe varësi nga partnerët ndërkombëtarë." },
    { id: "cat_police_reform", title: "Ligji për Reformën e Policisë dhe Shtesat e Rrezikshmërisë", desc: "Rrit shtesat për policët dhe modernizon strukturën e Policisë së Kosovës.", field: "Mbrojtja", ministry: "Ministria e Punëve të Brendshme", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 04/L-076 për Policinë", defaultCostM: 30, costRangeM: [10, 70], impactType: "APPROVAL_POSITIVE", impactMagnitude: 3.5, sectorId: "sec_police", riskText: "Kosto e vazhdueshme vjetore." },
    { id: "cat_cyber_security", title: "Ligji për Sigurinë Kibernetike dhe Mbrojtjen e Infrastrukturës Kritike", desc: "Themelon Agjencinë e Sigurisë Kibernetike dhe detyrimet për operatorët kritikë.", field: "Mbrojtja", ministry: "Ministria e Punëve të Brendshme", lawType: "ORDINARY", source: "Temë e simuluar për simulatorin", defaultCostM: 18, costRangeM: [6, 40], impactType: "APPROVAL_POSITIVE", impactMagnitude: 2.5, sectorId: "sec_police", riskText: "Nevojë për staf të specializuar." },
    /* KULTURA */
    { id: "cat_sports_law", title: "Ligji për Sportin dhe Lojërat Mesdhetare Prishtina 2030", desc: "Themelon kuadrin ligjor për organizimin e Lojërave Mesdhetare 2030 dhe financimin e infrastrukturës sportive.", field: "Kultura", ministry: "Ministria e Kulturës, Rinisë dhe Sportit", lawType: "ORDINARY", source: "Temë e simuluar, e bazuar në organizimin real të Lojërave Mesdhetare 2030", defaultCostM: 90, costRangeM: [40, 180], impactType: "APPROVAL_POSITIVE", impactMagnitude: 4.5, sectorId: "sec_edu", riskText: "Vonesa në ndërtimin e stadiumeve." },
    { id: "cat_culture_fund", title: "Ligji për Fondin Kombëtar të Kulturës dhe Krijimtarisë", desc: "Krijon një fond të dedikuar për mbështetjen e artistëve dhe projekteve kulturore.", field: "Kultura", ministry: "Ministria e Kulturës, Rinisë dhe Sportit", lawType: "ORDINARY", source: "Temë e simuluar për simulatorin", defaultCostM: 12, costRangeM: [5, 30], impactType: "APPROVAL_POSITIVE", impactMagnitude: 2.0, sectorId: "sec_edu", riskText: "Kosto e vogël fiskale por e dukshme." },
    /* TATIMET */
    { id: "cat_corporate_tax", title: "Ligji për Ndryshimin e Tatimit mbi Korporatat", desc: "Rregullon normën e tatimit mbi fitimin e korporatave për balancim buxhetor ose stimulim ekonomik.", field: "Buxheti", ministry: "Ministria e Financave, Punës dhe Transfereve", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 03/L-162 për Tatimin mbi të Ardhurat e Korporatave", defaultCostM: -20, costRangeM: [-80, 60], impactType: "APPROVAL_MIXED", impactMagnitude: 1.0, sectorId: "sec_econ", riskText: "Debat i fortë politik dhe biznesi." },
    { id: "cat_property_tax", title: "Ligji për Tatimin në Pronë dhe Regjistrin e Pasurive të Paluajtshme", desc: "Modernizon regjistrin e pronës dhe bazën e tatimit në pronë për rritjen e të hyrave komunale.", field: "Buxheti", ministry: "Ministria e Financave, Punës dhe Transfereve", lawType: "ORDINARY", source: "Historik real — Ligji Nr. 03/L-164 për Tatimin në Pronë", defaultCostM: 8, costRangeM: [3, 20], impactType: "APPROVAL_MIXED", impactMagnitude: 1.5, sectorId: "sec_local", riskText: "Rezistencë nga pronarët e mëdhenj." }
];

/* ============================================================================
   4. KATALOGU I PROJEKTEVE KOMUNALE (Pika 7)
   ============================================================================ */
const MUNICIPAL_PROJECT_CATALOG = [
    { type: "ROAD_RURAL", name: "Rrugë Rurale dhe Asfaltim", sectorId: "sec_roads", icon: "🛣️", costRangeM: [2, 15], weeksRange: [6, 16], benefits: { infra: 6, connectivity: 4 }, needs: ["Rrugët", "Infrastrukturë fshatrash", "Rrugët rurale", "Rrugët"], simulated: true },
    { type: "SCHOOL_RENOVATION", name: "Rinovim Shkolle dhe Çerdheje", sectorId: "sec_edu", icon: "🏫", costRangeM: [2, 12], weeksRange: [6, 14], benefits: { services: 3, education: 7 }, needs: ["Shkollat e reja", "Arsimi", "Shkolla", "Arsimi"], simulated: true },
    { type: "HEALTH_CENTER", name: "Rinovim Qendre Shëndetësore", sectorId: "sec_health", icon: "🏥", costRangeM: [3, 18], weeksRange: [8, 18], benefits: { services: 5, health: 6 }, needs: ["Shëndetësia", "Qendra shëndetësore", "Shëndetësia"], simulated: true },
    { type: "WATER_SUPPLY", name: "Zgjerim Ujësjellësi dhe Kanalizimi", sectorId: "sec_water", icon: "💧", costRangeM: [3, 20], weeksRange: [8, 20], benefits: { infra: 4, services: 4, water: 7 }, needs: ["Ujësjellësi", "Uji i pijshëm", "Ujësjellësi", "Uji"], simulated: true },
    { type: "URBAN_TRAFFIC", name: "Zgjidhje e Trafikut Urban dhe Nënkalime", sectorId: "sec_roads", icon: "🚦", costRangeM: [5, 25], weeksRange: [10, 20], benefits: { infra: 6, connectivity: 5 }, needs: ["Trafiku urban", "Nënkalimet", "Nënkalimet urbane", "Mbingarkesa urbane"], simulated: true },
    { type: "PUBLIC_TRANSPORT", name: "Linjë e Re e Transportit Publik", sectorId: "sec_rail", icon: "🚌", costRangeM: [4, 18], weeksRange: [8, 18], benefits: { services: 4, connectivity: 6 }, needs: ["Transporti", "Lidhja me autostradën", "Autostrada", "Infrastruktura rurale"], simulated: true },
    { type: "ECONOMIC_PARK", name: "Park Biznesi dhe Zonë Ekonomike", sectorId: "sec_econ", icon: "🏭", costRangeM: [8, 35], weeksRange: [12, 24], benefits: { employment: 7, development: 6 }, needs: ["Zona industriale", "Parku i Biznesit", "Zona Agro-Industriale", "Zhvillimi ekonomik"], simulated: true },
    { type: "GREEN_SPACE", name: "Hapësira të Gjelbra dhe Parqe Publike", sectorId: "sec_env", icon: "🌳", costRangeM: [1, 8], weeksRange: [4, 10], benefits: { services: 3, development: 2 }, needs: ["Mjedisi", "Ndotja e ajrit", "Mjedisi", "Mjedisi"], simulated: true },
    { type: "DIGITAL_SERVICES", name: "Digjitalizim i Shërbimeve Komunale", sectorId: "sec_tech", icon: "💻", costRangeM: [1, 6], weeksRange: [4, 10], benefits: { services: 6, development: 3 }, needs: ["Shërbimet", "Shërbimet komunale", "Shërbimet publike", "Shërbimet"], simulated: true },
    { type: "AGRICULTURE_SUPPORT", name: "Mbështetje për Bujqësinë dhe Ujitje", sectorId: "sec_agri", icon: "🌾", costRangeM: [2, 12], weeksRange: [6, 14], benefits: { employment: 4, development: 3 }, needs: ["Bujqësia", "Bujqësia", "Vreshtaria", "Bujqësia lokale"], simulated: true },
    { type: "CULTURAL_HERITAGE", name: "Restaurim i Trashëgimisë Kulturore", sectorId: "sec_edu", icon: "🏛️", costRangeM: [2, 10], weeksRange: [6, 14], benefits: { services: 2, development: 4 }, needs: ["Turizmi", "Kullat tradicionale", "Qendra historike", "Trashëgimia"], simulated: true },
    { type: "TOURISM_INFRA", name: "Infrastrukturë Turistike", sectorId: "sec_env", icon: "🏔️", costRangeM: [3, 15], weeksRange: [8, 16], benefits: { employment: 4, development: 5, services: 2 }, needs: ["Turizmi", "Turizmi malor", "Banjat termale", "Eko-turizmi", "Turizmi rural", "Brezovica"], simulated: true }
];

/* ============================================================================
   5. KATALOGU I DOSJEVE JAVORE (Pika 8)
   ============================================================================ */
const WEEKLY_DOSSIER_TEMPLATES = [
    {
        id: "dos_ministry_report",
        category: "RAPORT MINISTROR",
        senderRole: "MINISTER",
        urgency: "MESATARE",
        titleTemplate: "Raport javor i {ministry}: {issue}",
        descTemplate: "Ministri i {ministry} raporton për gjendjen në sektorin përkatës dhe kërkon udhëzime për prioritetet e javës së ardhshme.",
        consequenceTemplate: "Mosveprimi shkakton vonesa në zbatimin e reformave.",
        options: [
            { label: "Aprovo prioritetet e ministrit dhe lësho udhëzime", costB: 0.005, appDelta: 1.0, outcome: "Ministri mori udhëzime të qarta." },
            { label: "Kërko raport të detajuar me afate konkrete", costB: 0, appDelta: 0.5, outcome: "Ministri do të paraqesë raport të detajuar." }
        ]
    },
    {
        id: "dos_mayor_request",
        category: "KËRKESË KOMUNALE",
        senderRole: "MAYOR",
        urgency: "MESATARE",
        titleTemplate: "Kërkesë nga Komuna e {municipality}: {issue}",
        descTemplate: "Kryetari i Komunës së {municipality} kërkon takim me Kryeministrin për të diskutuar prioritetet e zhvillimit lokal dhe bashkëfinancimin e projekteve.",
        consequenceTemplate: "Refuzimi shkakton kritika publike nga komuna dhe ulje e raportit (-3 pikë).",
        options: [
            { label: "Prano takimin dhe mirato bashkëfinancim €10M", costB: 0.010, appDelta: 1.8, outcome: "Komuna mori mbështetje financiare." },
            { label: "Delego çështjen te MAPL për vlerësim teknik", costB: 0, appDelta: 0.3, outcome: "MAPL do të shqyrtojë kërkesën." }
        ]
    },
    {
        id: "dos_parliamentary",
        category: "KËRKESË PARLAMENTARE",
        senderRole: "SPEAKER",
        urgency: "MESATARE",
        titleTemplate: "Kërkesë për raportim në Kuvend: {topic}",
        descTemplate: "Kryetari i Kuvendit kërkon që Qeveria të raportojë për çështjen: {topic}.",
        consequenceTemplate: "Refuzimi shkakton kritika nga opozita dhe rritje e tensioneve parlamentare.",
        options: [
            { label: "Prano raportimin në seancë plenare", costB: 0, appDelta: 1.2, outcome: "Qeveria do të raportojë në Kuvend." },
            { label: "Kërko shtyrje për 2 javë", costB: 0, appDelta: -0.5, outcome: "Kuvendi pranoi shtyrjen, por kritikat u rritën." }
        ]
    },
    {
        id: "dos_international",
        category: "KËRKESË NDËRKOMBËTARE",
        senderRole: "AMBASSADOR",
        urgency: "E LARTË",
        titleTemplate: "Kërkesë nga {country}: {topic}",
        descTemplate: "Përfaqësuesi i {country} kërkon takim urgjent për çështjen: {topic}.",
        consequenceTemplate: "Mosveprimi ul marrëdhëniet diplomatike me {country} (-5 pikë).",
        options: [
            { label: "Prano takimin dhe koordino qëndrimin", costB: 0, appDelta: 1.5, dipBonus: 4, outcome: "Takimi u zhvillua në atmosferë konstruktive." },
            { label: "Delego MPJD për konsultime teknike", costB: 0, appDelta: 0.8, dipBonus: 2, outcome: "MPJD zhvilloi konsultime teknike." }
        ]
    },
    {
        id: "dos_advisors",
        category: "KËSHILLË KABINETI",
        senderRole: "ADVISOR",
        urgency: "E ULËT",
        titleTemplate: "Rekomandim i kabinetit: {topic}",
        descTemplate: "Këshilltarët e Kryeministrit rekomandojnë veprim në lidhje me: {topic}.",
        consequenceTemplate: "Mosveprimi nuk ka pasoja të menjëhershme, por mund të humbasë mundësi.",
        options: [
            { label: "Prano rekomandimin dhe zbatoje", costB: 0.003, appDelta: 1.0, outcome: "Rekomandimi u zbatua." },
            { label: "Arkivo për shqyrtim të mëvonshëm", costB: 0, appDelta: 0, outcome: "Rekomandimi u arkivua." }
        ]
    }
];

/* VAZHDON në pjesën 2/6 */
/* ============================================================================
   6. INICIALIZIMI I GJENDJES FILLESTARE
   ============================================================================ */

function getInitialStateSectors() {
    return [
        { id: "sec_econ", name: "1. Ekonomia & Financat Publike", ministry: "Ministria e Financave", score: 68, problem: "Informaliteti fiskal dhe qasja në financa për prodhuesit", projectTitle: "Digjitalizimi i Arkave Fiskale & Fondi Sovran", costM: 25, weeksTotal: 8, weeksLeft: 0, active: false, competence: "QEVERI (Vendim i Mbledhjes së Qeverisë)" },
        { id: "sec_edu", name: "2. Arsimi, Shkollat & Universitetet", ministry: "MASHTI", score: 62, problem: "Mungesa e çerdheve publike dhe laboratorëve digjitalë në shkolla", projectTitle: "Ndërtimi i 25 Çerdheve & Smart-Labs në Shkolla", costM: 30, weeksTotal: 10, weeksLeft: 0, active: false, competence: "MINISTRI / QEVERI" },
        { id: "sec_health", name: "3. Shëndetësia & Spitalet (QKUK)", ministry: "Ministria e Shëndetësisë", score: 60, problem: "Listat e pritjes në QKUK dhe sistemi informativ shëndetësor", projectTitle: "Modernizimi i Klinikave të QKUK & Barnat Esenciale", costM: 35, weeksTotal: 10, weeksLeft: 0, active: false, competence: "QEVERI & BUXHET" },
        { id: "sec_police", name: "4. Policia & Siguria Publike", ministry: "Ministria e Punëve të Brendshme", score: 82, problem: "Shtesat e rrezikshmërisë dhe pajisjet logjistike kufitare", projectTitle: "Flota e Re e Automjeteve të Blinduara & Kamera Trupi", costM: 20, weeksTotal: 6, weeksLeft: 0, active: false, competence: "KRYEMINISTRI & MPB" },
        { id: "sec_fsk", name: "5. Mbrojtja & Forca e Sigurisë (FSK)", ministry: "Ministria e Mbrojtjes", score: 86, problem: "Kapacitetet kundërajrore dhe fabrika e municioneve", projectTitle: "Prokurimi i Sistemeve Mbrojtëse & Kazerma e Re", costM: 45, weeksTotal: 12, weeksLeft: 0, active: false, competence: "KUVENDI (Kërkon Ligj / Buxhet)" },
        { id: "sec_roads", name: "6. Rrugët & Infrastruktura", ministry: "MMPHI", score: 64, problem: "Vonesat në magjistralet Prishtinë-Podujevë, Mitrovicë dhe Gjilan", projectTitle: "Përshpejtimi i Loteve Rrugore & Shpronësimet", costM: 40, weeksTotal: 12, weeksLeft: 0, active: false, competence: "QEVERI (Vendim Shpronësimi)" },
        { id: "sec_energy", name: "7. Energjia & Furnizimi (KEK/KOSTT)", ministry: "Ministria e Ekonomisë", score: 72, problem: "Vjetërsia e termocentraleve Kosova A & B dhe humbjet në rrjet", projectTitle: "Bateritë Akumuluese & Parku Solar 100MW në KEK", costM: 50, weeksTotal: 14, weeksLeft: 0, active: false, competence: "KUVENDI / QEVERI" },
        { id: "sec_tech", name: "8. Teknologjia & Digjitalizimi (e-Kosova)", ministry: "Zyra e KM / MASHTI", score: 77, problem: "Ndërlidhja e regjistrave shtetërorë dhe siguria kibernetike", projectTitle: "Zgjerimi i e-Kosova me 120 Shërbime & Qendra Kibernetike", costM: 15, weeksTotal: 6, weeksLeft: 0, active: false, competence: "KRYEMINISTRI (Urdhëresë)" },
        { id: "sec_agri", name: "9. Bujqësia & Zhvillimi Rural", ministry: "MBPZHR", score: 74, problem: "Sistemet e ujitjes në Dukagjin e Anamoravë dhe sigurimi bujqësor", projectTitle: "Zgjerimi i Kanalit të Ujitjes Radoniqi & Ibër-Lepenc", costM: 22, weeksTotal: 9, weeksLeft: 0, active: false, competence: "MINISTRIA E BUJQËSISË" },
        { id: "sec_env", name: "10. Mjedisi & Menaxhimi i Mbeturinave", ministry: "MMPHI", score: 58, problem: "Deponitë ilegale dhe ndotja e lumenjve", projectTitle: "Impiantet e Riciklimit & Pastrimi i Shtretërve të Lumenjve", costM: 18, weeksTotal: 8, weeksLeft: 0, active: false, competence: "QEVERI & KOMUNAT" },
        { id: "sec_social", name: "11. Punësimi & Politikat Sociale", ministry: "MFPT", score: 70, problem: "Papunësia tek të rinjtë dhe gratë, skema e asistencës sociale", projectTitle: "Zgjerimi i Platformës Superpuna & Reforma e Pensioneve", costM: 28, weeksTotal: 8, weeksLeft: 0, active: false, competence: "QEVERI" },
        { id: "sec_justice", name: "12. Drejtësia & Administrata Publike", ministry: "Ministria e Drejtësisë", score: 66, problem: "Numri i lartë i lëndëve të vjetra në gjykata", projectTitle: "Gjykata Komerciale & Digjitalizimi i Gjykatave", costM: 16, weeksTotal: 8, weeksLeft: 0, active: false, competence: "KUVENDI / MD" },
        { id: "sec_rail", name: "13. Transporti Publik & Hekurudhat", ministry: "MMPHI", score: 61, problem: "Modernizimi i Linjës Hekurudhore 10 (Hani i Elezit - Leshak)", projectTitle: "Elektrifikimi i Hekurudhës & Studimi Prishtinë-Durrës", costM: 32, weeksTotal: 12, weeksLeft: 0, active: false, competence: "QEVERI" },
        { id: "sec_water", name: "14. Uji & Kanalizimi", ministry: "MMPHI / Komunat", score: 67, problem: "Furnizimi me ujë të pijshëm në fshatra dhe trajtimi i ujërave të zeza", projectTitle: "7 Impiante Rajonale të Ujërave të Zeza", costM: 24, weeksTotal: 10, weeksLeft: 0, active: false, competence: "QEVERI" },
        { id: "sec_local", name: "15. Zhvillimi Komunal & Shërbimet Lokale", ministry: "MAPL & MZHR", score: 73, problem: "Kapacitetet e ulëta buxhetore të komunave të vogla", projectTitle: "Fondi i Katërt i Granteve Kapitale për Komunat", costM: 30, weeksTotal: 8, weeksLeft: 0, active: false, competence: "QEVERI & KUVENDI" }
    ];
}

function getInitialMunicipalityProfiles(munisArr) {
    var profiles = {};
    var baseMap = {
        m_prishtina: { infra: 7, serv: 7, emp: 7, dev: 8, educ: 7, health: 7, water: 6, connect: 8 },
        m_podujeva: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 5, health: 4, water: 5, connect: 5 },
        m_lipjani: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 5, health: 4, water: 5, connect: 5 },
        m_fushkosova: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 5, health: 4, water: 5, connect: 6 },
        m_obiliqi: { infra: 4, serv: 4, emp: 3, dev: 3, educ: 4, health: 3, water: 4, connect: 5 },
        m_drenasi: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 5, health: 4, water: 5, connect: 5 },
        m_gracanica: { infra: 4, serv: 4, emp: 3, dev: 3, educ: 4, health: 3, water: 4, connect: 4 },
        m_novoberda: { infra: 2, serv: 2, emp: 2, dev: 2, educ: 3, health: 2, water: 3, connect: 2 },
        m_prizreni: { infra: 6, serv: 6, emp: 6, dev: 7, educ: 6, health: 6, water: 6, connect: 7 },
        m_suhareka: { infra: 5, serv: 5, emp: 5, dev: 6, educ: 5, health: 4, water: 5, connect: 5 },
        m_malisheva: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 4, health: 4, water: 5, connect: 5 },
        m_dragashi: { infra: 4, serv: 4, emp: 4, dev: 4, educ: 4, health: 3, water: 4, connect: 3 },
        m_mamusha: { infra: 3, serv: 3, emp: 3, dev: 3, educ: 3, health: 2, water: 3, connect: 3 },
        m_peja: { infra: 6, serv: 6, emp: 6, dev: 7, educ: 6, health: 6, water: 6, connect: 6 },
        m_istogu: { infra: 4, serv: 4, emp: 4, dev: 4, educ: 4, health: 3, water: 4, connect: 4 },
        m_klina: { infra: 4, serv: 4, emp: 3, dev: 4, educ: 4, health: 3, water: 4, connect: 4 },
        m_gjakova: { infra: 6, serv: 6, emp: 5, dev: 6, educ: 6, health: 5, water: 5, connect: 6 },
        m_rahoveci: { infra: 5, serv: 5, emp: 5, dev: 6, educ: 5, health: 4, water: 5, connect: 5 },
        m_decani: { infra: 4, serv: 4, emp: 4, dev: 4, educ: 4, health: 3, water: 4, connect: 4 },
        m_juniku: { infra: 3, serv: 3, emp: 2, dev: 3, educ: 3, health: 2, water: 3, connect: 3 },
        m_mitrovica_j: { infra: 5, serv: 5, emp: 5, dev: 5, educ: 5, health: 5, water: 5, connect: 5 },
        m_vushtrria: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 5, health: 4, water: 5, connect: 5 },
        m_skenderaj: { infra: 4, serv: 4, emp: 4, dev: 4, educ: 4, health: 3, water: 4, connect: 4 },
        m_mitrovica_v: { infra: 3, serv: 3, emp: 3, dev: 3, educ: 3, health: 3, water: 3, connect: 3 },
        m_zvecani: { infra: 2, serv: 2, emp: 2, dev: 2, educ: 2, health: 2, water: 3, connect: 2 },
        m_leposaviqi: { infra: 2, serv: 2, emp: 2, dev: 2, educ: 2, health: 2, water: 3, connect: 2 },
        m_zubinpotoku: { infra: 3, serv: 3, emp: 2, dev: 2, educ: 3, health: 2, water: 3, connect: 2 },
        m_gjilani: { infra: 6, serv: 6, emp: 5, dev: 6, educ: 6, health: 5, water: 5, connect: 6 },
        m_vitia: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 5, health: 4, water: 5, connect: 5 },
        m_kamenica: { infra: 4, serv: 4, emp: 4, dev: 4, educ: 4, health: 3, water: 4, connect: 4 },
        m_ranillugu: { infra: 2, serv: 2, emp: 2, dev: 2, educ: 2, health: 2, water: 3, connect: 2 },
        m_parteshi: { infra: 2, serv: 2, emp: 2, dev: 2, educ: 2, health: 2, water: 2, connect: 2 },
        m_kllokoti: { infra: 2, serv: 2, emp: 2, dev: 2, educ: 2, health: 2, water: 3, connect: 2 },
        m_ferizaj: { infra: 6, serv: 6, emp: 6, dev: 7, educ: 6, health: 6, water: 5, connect: 6 },
        m_kacaniku: { infra: 4, serv: 4, emp: 4, dev: 4, educ: 4, health: 3, water: 4, connect: 4 },
        m_shtimja: { infra: 5, serv: 5, emp: 4, dev: 5, educ: 5, health: 4, water: 5, connect: 5 },
        m_hanielezit: { infra: 3, serv: 3, emp: 3, dev: 3, educ: 3, health: 2, water: 3, connect: 3 },
        m_shterpce: { infra: 2, serv: 2, emp: 2, dev: 2, educ: 2, health: 2, water: 3, connect: 2 }
    };
    var needsMap = {
        m_prishtina: ["Trafiku urban", "Termokos", "Unaza e qytetit"],
        m_podujeva: ["Zona industriale", "Rruga magjistrale", "Kanalizimi"],
        m_lipjani: ["Infrastrukturë fshatrash", "Ujësjellësi", "Bujqësi"],
        m_fushkosova: ["Shkolla të reja", "Ujësjellësi", "Mbingarkesa urbane"],
        m_obiliqi: ["Ndotja e ajrit", "Kompenzimi i banorëve", "Shëndetësia"],
        m_drenasi: ["Parku i biznesit", "Ujësjellësi", "Rrugët rurale"],
        m_gracanica: ["Integrimi i shërbimeve", "Shkolla", "Qendra shëndetësore"],
        m_novoberda: ["Turizmi", "Rrugët", "Uji i pijshëm"],
        m_prizreni: ["Qendra historike", "Parkimi", "Autostrada"],
        m_suhareka: ["Vreshtaria", "Zona agro-industriale", "Arsimi"],
        m_malisheva: ["Nënkalimet", "Kanalizimi", "Rrugët"],
        m_dragashi: ["Turizmi malor", "Blegtoria", "Infrastruktura"],
        m_mamusha: ["Sera bujqësore", "Uji i pijshëm", "Rrugët"],
        m_peja: ["Turizmi në Rugovë", "Bora", "Autostrada Pejë–Prishtinë"],
        m_istogu: ["Bujqësia", "Ujësjellësi", "Shëndetësia"],
        m_klina: ["Uji i pijshëm", "Hekurudha", "Arsimi"],
        m_gjakova: ["Çarshia e Madhe", "Aeroporti", "Stadiumi"],
        m_rahoveci: ["Vreshtaria", "Ujitja", "Turizmi"],
        m_decani: ["Turizmi malor", "Rrugët", "Mjedisi"],
        m_juniku: ["Eko-turizmi", "Rrugët", "Kullat tradicionale"],
        m_mitrovica_j: ["Trepça", "Liqeni", "Zhvillimi ekonomik"],
        m_vushtrria: ["Patatja", "Zona industriale", "Rrugët"],
        m_skenderaj: ["Memoriali", "Ujësjellësi", "Arsimi"],
        m_mitrovica_v: ["Ura e Ibrit", "Siguria publike", "Shërbimet"],
        m_zvecani: ["Trepça", "Rendi dhe ligji", "Infrastruktura"],
        m_leposaviqi: ["Kufiri", "Infrastruktura", "Shëndetësia"],
        m_zubinpotoku: ["Liqeni i Ujmanit", "Kanali Ibër-Lepenc", "Siguria"],
        m_gjilani: ["Autostrada", "Stadiumi", "Zhvillimi ekonomik"],
        m_vitia: ["Autostrada", "Bujqësia", "Arsimi"],
        m_kamenica: ["Arsimi", "Kufiri", "Rrugët"],
        m_ranillugu: ["Bujqësia", "Shërbimet", "Rrugët"],
        m_parteshi: ["Rrugët", "Ujësjellësi", "Shërbimet"],
        m_kllokoti: ["Banjat termale", "Turizmi", "Rrugët"],
        m_ferizaj: ["Nënkalimet", "Spitali", "Bizneset"],
        m_kacaniku: ["Uji i mbeturinave", "Lumi Nerodime", "Rrugët"],
        m_shtimja: ["Unaza", "Qendra e inovacionit", "Arsimi"],
        m_hanielezit: ["Dogana", "Mjedisi", "Rrugët"],
        m_shterpce: ["Brezovica", "Mjedisi", "Turizmi"]
    };

    munisArr.forEach(function(m) {
        var b = baseMap[m.id] || { infra: 4, serv: 4, emp: 4, dev: 4, educ: 4, health: 4, water: 4, connect: 4 };
        profiles[m.id] = {
            infrastructure: b.infra,
            services: b.serv,
            employment: b.emp,
            development: b.dev,
            education: b.educ,
            health: b.health,
            water: b.water,
            connectivity: b.connect,
            lastUpdatedWeek: 0,
            needs: needsMap[m.id] || ["Infrastruktura", "Shërbimet publike"],
            recentReport: ""
        };
    });
    return profiles;
}

function getInitialPMInbox() {
    return [
        {
            id: "req_init_1",
            status: "PENDING",
            outcomeMsg: "",
            senderName: "Liburn Aliu",
            senderRole: "Ministër i Infrastrukturës (MMPHI)",
            category: "TAKIM & VENDIM OPERACIONAL",
            urgency: "E LARTË",
            deadlineWeeks: 3,
            title: "Vonesa në shpronësimet e rrugës Prishtinë–Podujevë dhe Prishtinë–Mitrovicë",
            desc: "Ministri kërkon takim urgjent me Kryeministrin. Dy kontraktorë kanë ngadalësuar punimet për shkak të kontesteve pronësore dhe rritjes së çmimit të materialeve.",
            consequenceText: "Nëse nuk veprohet brenda afatit: pakënaqësi publike dhe vonesa në infrastrukturë.",
            options: [
                { label: "Mirato €18M shtesë për shpronësime të menjëhershme", costB: 0.018, appDelta: 2.2, secId: "sec_roads", outcome: "U miratuan mjetet për shpronësim; punimet në terren u dyfishuan." },
                { label: "Shkëput kontratat me kompanitë e papërgjegjshme dhe hap tender të ri", costB: 0, appDelta: 1.5, secId: "sec_roads", outcome: "Kontraktorët që vonuan punimet u penalizuan; procesi po rishikohet." },
                { label: "Delego çështjen te Zëvendëskryeministri dhe Ministria e Financave", costB: 0.005, appDelta: 0.6, secId: "sec_roads", outcome: "Grupi ndërministror mori përsipër zgjidhjen teknike me pronarët." }
            ]
        },
        {
            id: "req_init_2",
            status: "PENDING",
            outcomeMsg: "",
            senderName: "Përparim Rama & Imri Ahmeti",
            senderRole: "Kryetarët e Komunave (Prishtinë & Lipjan)",
            category: "KËRKESË NGA KOMUNAT",
            urgency: "MESATARE",
            deadlineWeeks: 4,
            title: "Bashkëfinancim për Unazën Rrugore dhe Infrastrukturën Lokale",
            desc: "Asociacioni i Komunave kërkon takim me Kryeministrin për zhbllokimin e mjeteve vetanake komunale dhe bashkëfinancimin e projekteve kapitale.",
            consequenceText: "Mosveprimi ul raportin me komunat dhe shkakton kritika në media.",
            options: [
                { label: "Prano takimin dhe nënshkruaj memorandum bashkëfinancimi (-€15M)", costB: 0.015, appDelta: 2.5, secId: "sec_local", outcome: "Kryetarët e komunave përshëndetën bashkëpunimin institucional me Qeverinë." },
                { label: "Kërko fillimisht auditim të projekteve komunale nga MAPL", costB: 0, appDelta: 0.5, secId: "sec_local", outcome: "MAPL nisi verifikimin ligjor të projekteve komunale." }
            ]
        },
        {
            id: "req_init_3",
            status: "PENDING",
            outcomeMsg: "",
            senderName: "Ambasadori i SHBA-së & Shefi i Zyrës së BE-së",
            senderRole: "Përfaqësuesit Diplomatikë në Prishtinë (QUINT)",
            category: "FTESË DIPLOMATIKE",
            urgency: "E LARTË",
            deadlineWeeks: 2,
            title: "Kërkesë për Konsultim Paraprak para Raundit të Radhës në Bruksel",
            desc: "Ambasadorët e QUINT-it kërkojnë takim pune në Kryeministri për të harmonizuar propozimet mbi sigurinë në veri dhe Planin e Rritjes të BE-së.",
            consequenceText: "Refuzimi ose vonesa ul pikët diplomatike me SHBA dhe BE (-5 pikë).",
            options: [
                { label: "Prit ambasadorët në takim dhe prezanto planin kushtetues të Kosovës", costB: 0, appDelta: 1.8, dipBonus: 5, outcome: "Takim konstruktiv në Kryeministri; QUINT-i vlerësoi transparencën e Qeverisë." },
                { label: "Dërgo Zëvendëskryeministrin / MPJD në takim me ambasadorët", costB: 0, appDelta: 0.8, dipBonus: 2, outcome: "MPJD zhvilloi konsultimet teknike me ambasadorët." }
            ]
        }
    ];
}

/* ============================================================================
   7. KRIJIMI I GJENDJES FILLESTARE
   ============================================================================ */
function createFreshState(mode = "REALITY_OCT2026", chosenParty = "LVV", customInfo = null) {
    const partiesClone = JSON.parse(JSON.stringify(INITIAL_POLITICAL_DB.parties));
    if (chosenParty === "NISMA") partiesClone.NISMA = createNismaListParty();
    const ministriesClone = JSON.parse(JSON.stringify(INITIAL_POLITICAL_DB.ministries));
    const munisClone = JSON.parse(JSON.stringify(INITIAL_POLITICAL_DB.municipalities)).map(function(m) {
        return Object.assign({}, m, {
            localSupportPlayer: m.mayorParty === chosenParty ? 54 : 32,
            relationWithGov: m.mayorParty === chosenParty ? 88 : 58,
            projects: []
        });
    });

    if (customInfo) {
        partiesClone[chosenParty].name = customInfo.partyName;
        partiesClone[chosenParty].short = customInfo.partyName.substring(0, 14);
        partiesClone[chosenParty].leader = customInfo.leaderName;
        partiesClone[chosenParty].candidates[0].name = customInfo.leaderName;
        partiesClone[chosenParty].candidates[0].simulated = true;
    }

    const isPostElectionAlt = (mode === "ALT_POST_ELECTION");

    let maxSeats = 0;
    let winnerId = "LVV";
    Object.keys(partiesClone).forEach(function(k) {
        if (partiesClone[k].seats > maxSeats) {
            maxSeats = partiesClone[k].seats;
            winnerId = k;
        }
    });

    let s = {
        version: "5.0.2026_FazaRe",
        mode: mode,
        year: 2026,
        monthIndex: isPostElectionAlt ? 6 : 9,
        week: 1,
        turnCount: 1,
        mandateNumber: 1,
        weeksToNextRegularElection: 200,

        playerParty: chosenParty,
        winningParty: winnerId,
        mandatar: winnerId,

        playerRole: "",
        assemblyConstituted: !isPostElectionAlt,
        speakerOfAssembly: isPostElectionAlt ? "Në pritje të konstituimit" : "Albulena Haxhiu (LVV)",
        speakerElected: !isPostElectionAlt,
        governmentFormed: !isPostElectionAlt,
        primeMinister: isPostElectionAlt ? "Në pritje të mandatarit" : "Albin Kurti (LVV)",

        institutionalPhase: isPostElectionAlt
            ? INSTITUTIONAL_PHASES.ASSEMBLY_ELECTED
            : INSTITUTIONAL_PHASES.GOV_IN_OFFICE,
        governmentStatus: isPostElectionAlt ? "PENDING" : "IN_OFFICE",
        speakerElectionWeek: isPostElectionAlt ? null : 1,
        governmentApprovalWeek: isPostElectionAlt ? null : 1,

        coalitionParties: isPostElectionAlt ? [winnerId] : ["LVV", "MIN_MULTI"],
        coalitionAgreements: isPostElectionAlt ? [] : [
            { partner: "MIN_MULTI", ministriesCount: 3, deputyPM: true, conditions: "3 Ministri dhe investime në komunitete", honored: true }
        ],

        presidentElected: !isPostElectionAlt,
        presidentName: isPostElectionAlt ? "Ushtruese e Detyrës (Afati 60-ditor aktiv)" : "Prof. Dr. Justina Shiroka-Pula",
        presidentialDeadlineWeeks: isPostElectionAlt ? 8 : 260,
        presidentialRound: 1,
        presidentialCandidateId: "cand_pula",
        presidentialSignatures: isPostElectionAlt ? 53 : 81,
        quorumPledgedParties: isPostElectionAlt ? [winnerId, "MIN_MULTI"] : ["LVV", "PDK", "MIN_MULTI"],
        customPresCandidates: {},
        presidentMandateStartYear: isPostElectionAlt ? null : 2026,
        presidentMandateEndYear: isPostElectionAlt ? null : 2031,

        approval: 49.5, // National approval of the incumbent government, independent of the chosen party.
        presidentApproval: 64.0,
        budgetTotalB: 3.32,
        taxRevenueB: 3.05,
        deficitPct: 2.4,
        publicDebtPct: 17.2,
        gdpGrowth: 3.9,
        unemployment: 10.8,
        inflation: 2.7,
        remittancesB: 1.38,
        energyStability: 78,
        securityNorth: 76,

        fiscalReserve: 0.32,
        debtInterestRate: 2.8,
        plannedRevenues: 3.10,
        plannedExpenses: 3.32,
        realizedRevenues: 0,
        realizedExpenses: 0,
        lastWeekRevenues: 0,
        lastWeekExpenses: 0,
        fiscalHistory: [],
        weeklyReports: [],
        taxPolicy: {
            vat: 18,
            incomeTax: 10,
            corporateTax: 15,
            customs: 10
        },
        pendingInterestPayment: 0,

        diplomacy: {
            USA: { name: "Shtetet e Bashkuara të Amerikës (SHBA)", city: "Uashington D.C.", official: "Sekretari i Shtetit & Ndihmës Sekretari për Evropën", score: 78, status: "Partneritet Strategjik", note: "Kërkon koordinim për veprimet në veri dhe zbatim të marrëveshjeve." },
            EU: { name: "Bashkimi Evropian (BE)", city: "Bruksel", official: "Presidentja e Komisionit Evropian & Përfaqësuesi i Lartë", score: 74, status: "Kandidat Potencial / Plani i Rritjes", note: "Kushtëzon fondet e Planit të Rritjes me progresin në dialog." },
            GERMANY: { name: "Gjermania & Franca (Boshti Franko-Gjerman)", city: "Berlin & Paris", official: "Kancelari Federal i Gjermanisë & Këshilltarët Diplomatikë", score: 76, status: "Mbështetje për Procesin e Berlinit", note: "Mbështet tregun e përbashkët regional dhe integrimin evropian." },
            UK: { name: "Mbretëria e Bashkuar (Britania e Madhe)", city: "Londër", official: "Sekretari i Jashtëm Britanik & Emisari për Ballkanin Perëndimor", score: 88, status: "Aleat i Fortë i Sigurisë", note: "Mbështet fuqishëm FSK-në, sundimin e ligjit dhe sigurinë kufitare." },
            ALBANIA: { name: "Republika e Shqipërisë", city: "Tiranë", official: "Kryeministri i Shqipërisë & Kabinetet ndërqeveritare", score: 92, status: "Vëllazëror & Marrëveshje të Përbashkëta", note: "Projektet e hekurudhës Durrës–Prishtinë dhe tregu unik energjetik." },
            TURKEY: { name: "Republika e Turqisë", city: "Ankara & Stamboll", official: "Presidenti & Ministri i Mbrojtjes dhe Tregtisë", score: 85, status: "Bashkëpunim Ekonomik & Ushtarak", note: "Furnizim me sisteme mbrojtëse dhe investime në energji." }
        },

        dialogueProgress: 52,
        dialogueChronologyStep: 1,
        dialogueDraftProposal: null,
        dialogueAlliesConsulted: false,
        dialogueNegotiationLog: [
            "Korrik 2026: BE dhe SHBA kërkojnë rifillimin e dialogut pas zgjedhjeve në Kosovë."
        ],

        dialogueInvitation: {
            active: false,
            inviter: "Bashkimi Evropian (BE) & Shtetet e Bashkuara të Amerikës",
            inviterKey: "EU",
            reason: "Rifillimi i dialogut për normalizimin e marrëdhënieve dhe zbatimin e Marrëveshjes së Ohrit.",
            agenda: "Zbatimi i Marrëveshjes së Ohrit, Siguria në Veri, Plani i Rritjes i BE-së, Të Drejtat e Komuniteteve",
            deadlineWeeks: 3,
            responseStatus: "PENDING",
            respondedAt: null
        },
        dialogueConsultations: {},
        dialogueProposal: null,
        dialogueCounterOffer: null,
        dialogueAgreements: [],
        dialogueRoundHistory: [],

        scheduledMeetings: [],
        pmInboxRequests: getInitialPMInbox(),
        stateSectors: getInitialStateSectors(),
        customInterlocutors: [],
        activePressSession: null,

        parliamentarySessions: [],
        motions: [],
        sessionCounter: 0,
        motionCounter: 0,
        billCounter: 0,

        parties: partiesClone,
        ministries: ministriesClone,
        municipalities: munisClone,
        mps: [],
        laws: getInitialLaws(),
        promises: getInitialPromises(),
        cabinetAgenda: getInitialCabinetAgenda(),
        mediaFeed: [
            {
                id: "news_init_1",
                outlet: "KOHA / KTV",
                title: "Legjislatura XI nis punën pas zgjedhjeve të 7 Qershorit 2026; ekonomia dhe dialogu mbeten sfidat kryesore.",
                tone: "NEUTRAL",
                time: "Tetor 2026",
                fullBody: "Pas certifikimit të rezultateve nga KQZ-ja, 120 deputetët e Legjislaturës së XI-të janë mbledhur në seancë plenare. Analistët politikë vlerësojnë se testi kryesor i shumicës do të jetë kalimi i marrëveshjeve ndërkombëtare që kërkojnë 80 vota dhe përmirësimi i 15 sektorëve publikë.",
                reactions: "Mazhoranca zotohet për zhvillim ekonomik dhe sovranitet, ndërsa PDK, LDK dhe AAK paralajmërojnë opozitarizëm të rreptë."
            },
            {
                id: "news_init_2",
                outlet: "Betimi për Drejtësi",
                title: "Kuvendi dhe sfidat e shumicës së cilësuar: Si ndahen 120 ulëset dhe kuorumi kushtetues.",
                tone: "POSITIVE",
                time: "Tetor 2026",
                fullBody: "Ekspertët e së drejtës kushtetuese rikujtojnë se sipas aktgjykimeve të Gjykatës Kushtetuese të Republikës së Kosovës, dallimi mes kuorumit (pranisë së 80 deputetëve në votim) dhe votave pro është vendimtar për stabilitetin institucional.",
                reactions: "Shoqëria civile dhe IKD kërkojnë respektim të plotë të procedurave parlamentare dhe transparencë në hartimin e projektligjeve."
            }
        ],
        historyLog: [
            "7 Qershor 2026 [Kuvend]: Mbahen zgjedhjet e parakohshme parlamentare (LVV 53, PDK 22, LDK 18, AAK 7, Komunitetet 20).",
            "8 Korrik 2026 [Kuvend]: KQZ certifikon rezultatet përfundimtare të Legjislaturës XI.",
            isPostElectionAlt
                ? "Korrik 2026 [Koalicion]: Hapen negociatat zyrtare me raunde për konstituimin e Kuvendit, Qeverisë dhe Presidentit."
                : "Tetor 2026 [Qeveri]: Votohet Qeveria Kurti 4 (62 vota) dhe zgjidhet Presidentja Justina Shiroka-Pula (81 vota)."
        ],
        currentEventIndex: 0,
        lastPressTurn: 0,

        municipalityProfiles: {},
        developmentProjects: [],
        developmentProjectCounter: 0,
        sectorInitialScores: {},
        sectorHistory: {},
        municipalityWeeklyReport: null,
        sectorWeeklyReport: null,
        lastDevelopmentReportWeek: 0,
        _developmentReportPending: false,

        chatHistories: {},
        meetingScenes: {},
        consultationSessions: {},
        brusselsRoundState: null,

        /* FAZA E RE: Fusha për zgjedhjet e ndara */
        electionCampaign: null,
        electionPhase: "NONE",
        nextElectionScheduledWeek: null,
        presidentialElectionInProgress: false,
        cabinetProposal: null,
        cabinetApproved: false,

        /* FAZA E RE: Fusha për dosjet javore */
        weeklyDossiers: [],
        dossierCounter: 0,

        /* FAZA E RE: Fusha për negociatat presidenciale */
        presidentialNegotiations: null
    };

    s.municipalityProfiles = getInitialMunicipalityProfiles(s.municipalities);

    s.stateSectors.forEach(function(sec) {
        s.sectorInitialScores[sec.id] = sec.score;
        s.sectorHistory[sec.id] = [{ week: 1, score: sec.score }];
    });

    if (isPostElectionAlt) {
        s.playerRole = (s.mandatar === chosenParty) ? "MANDATAR PËR FORMIMIN E QEVERISË" : "NË PRITJE (OPOZITË)";
        s.ministries.forEach(function(m) {
            m.party = "NONE";
            m.minister = "I/E paemëruar";
        });
    } else {
        s.playerRole = (chosenParty === "LVV") ? "PRIME_MINISTER" : "OPPOSITION_LEADER";
    }

    s.mps = generate120MPs(s.parties, chosenParty);
    migrateStateForDataFoundation(s);
    migrateElectoralLists(s);
    migrateElectionDayState(s);
    migrateAssemblyState(s);
    migrateConstituentState(s);
    migrateDeputyMandates(s);
    migrateCandidateGenderEvidence(s);
    migrateInternationalDiplomacy(s);
    migrateWeekCalendar(s);
    migrateWeeklyAgenda(s);
    migrateLawNegotiations(s);
    migratePublicSupport(s);
    if(typeof migrateInterestGroups==='function')migrateInterestGroups(s);
    if(typeof migrateConstitutionalCourt==='function')migrateConstitutionalCourt(s);
    if(typeof migrateElectoralAccountability==='function')migrateElectoralAccountability(s);
    migratePresidency(s);
    migratePublicFinance(s);
    if(typeof migrateDiaspora==='function')migrateDiaspora(s);
    if(typeof migrateUnions==='function')migrateUnions(s);
    if(typeof migrateRogueMinisters==='function')migrateRogueMinisters(s);
    migrateInstitutionalConflicts(s);migrateNorthCrisis(s);migrateInternalPressure(s);migrateMediaDossiers(s);migrateCouncilEurope(s);migrateWinterEnergy(s);migrateGeneralStrike(s);migrateMunicipalGrants(s);migrateAssociationUltimatum(s);
    if(typeof migrateVeteransAudit==='function')migrateVeteransAudit(s);migrateVeteransBudget(s);migrateCoalitionBlackmail(s);migrateLaborExodus(s);migrateDinarCrisis(s);migratePersonnelRegistry(s);migrateHighwayProject(s);
    if(typeof migrateBrusselsSpecial==='function')migrateBrusselsSpecial(s);
    if(typeof migrateLocalElections==='function')migrateLocalElections(s);
    if(typeof migrateIMFCrisis==='function')migrateIMFCrisis(s);
    if(typeof migrateMediaWarfare==='function')migrateMediaWarfare(s);
    if(typeof migrateSecurityCrises==='function')migrateSecurityCrises(s);
    if(typeof migrateJusticeReform==='function')migrateJusticeReform(s);
    if(typeof migrateLawImplementation==='function')migrateLawImplementation(s);
    if(typeof migrateInformalEconomy==='function')migrateInformalEconomy(s);
    if(typeof migrateLocalObstructions==='function')migrateLocalObstructions(s);
    if(typeof migratePopulation==='function')migratePopulation(s);
    if(typeof migrateStateEnterprises==='function')migrateStateEnterprises(s);migrateEnterpriseBoards(s);migrateSovereignFund(s);migrateTrepca(s);migrateSectorExpansion(s);
    if(typeof migrateNationalEmergencies==='function')migrateNationalEmergencies(s);
    if(typeof migrateGovernmentCrises==='function')migrateGovernmentCrises(s);
    if(typeof migrateOpposition==='function')migrateOpposition(s);
    migrateGovernmentCatalog(s);
    migrateMunicipalDevelopment(s);
    migrateElectionPreparation(s);
    migrateUrgentSituations(s);
    migrateExistingEffects(s);
    return s;
}

function generate120MPs(partiesObj, playerPartyKey) {
    const allMps = [];
    let seatCounter = 1;
    const order = ["LVV", "PDK", "LDK", "AAK", "MIN_MULTI", "SL"];
    const regions = ["PRISHTINA", "PRIZRENI", "PEJA", "MITROVICA", "GJILANI", "FERIZAJ", "GJAKOVA"];
    const stances = [
        "Modeluar: Fokus në zhvillimin ekonomik rajonal dhe buxhetin",
        "Modeluar: Fokus në sundimin e ligjit, Vetingun dhe drejtësinë",
        "Modeluar: Qëndrim konservator për Kodin Civil dhe traditën",
        "Modeluar: Prioritet integrimi Euro-Atlantik dhe aleanca me SHBA",
        "Modeluar: Prioritet arsimi publik, shëndetësia dhe skemat sociale"
    ];

    order.forEach(function(pKey) {
        const p = partiesObj[pKey];
        if (!p) return;
        const roster = FULL_ROSTER_NAMES[pKey] || [];
        for (let i = 0; i < p.seats; i++) {
            const template = p.candidates[i];
            const realName = template ? template.name : (roster[i] || (p.short + " Deputeti #" + (i + 1)));
            const mpGender = null; // No documented gender in the original candidate brochure.
            const mpRegion = template ? template.region : regions[(seatCounter + i) % regions.length];
            const mpLoyalty = template ? template.loyalty : (78 + (i % 19));
            const mpRole = template ? template.role : ("Deputet i Grupit Parlamentar " + p.short);
            const baseTrust = pKey === playerPartyKey ? 80 : (pKey === "MIN_MULTI" ? 66 : 44);

            allMps.push({
                seatNumber: seatCounter++,
                name: realName,
                party: pKey,
                gender: mpGender,
                region: mpRegion,
                loyalty: mpLoyalty,
                trustPlayer: baseTrust + (i % 10),
                role: mpRole,
                stance: stances[seatCounter % stances.length],
                ambition: i < 6 ? "Lidership në Komision Parlamentar / Ekzekutiv" : ("Investime kapitale në rajonin " + mpRegion),
                rebelRisk: mpLoyalty < 82,
                promisedVoteNext: false,
                votingHistory: ["Seanca Konstituive: Pjesëmarrës"],
                meetingHistory: []
            });
        }
    });
    return allMps;
}

function getInitialLaws() {
    return [
        {
            id: "law_budget_2027",
            catalogId: "cat_budget_2027",
            title: "Projektligji për Ndarjet Buxhetore dhe Rritjen e Koeficientit të Pagave në 125€",
            ministry: "Ministria e Financave, Punës dhe Transfereve",
            proposer: "Qeveria e Kosovës (Ministria e Financave)",
            sector: "sec_econ",
            desc: "Rrit koeficientin e pagave në sektorin publik dhe shton investimet kapitale në komuna.",
            majorityType: "SIMPLE_61",
            requiredVotes: 61,
            costB: 0.14,
            approvalEffect: 4.5,
            supportParties: ["LVV", "MIN_MULTI"],
            stage: "Leximi i Dytë (Gati për Votim)",
            status: "SCHEDULED",
            submittedWeek: 1,
            scheduledWeek: 2,
            applied: false,
            voteHistory: [],
            stageHistory: [{ stage: "DRAFT", week: 1 }, { stage: "SUBMITTED", week: 1 }, { stage: "UNDER_REVIEW", week: 1 }, { stage: "SCHEDULED", week: 2 }],
            lastVoteResult: null
        },
        {
            id: "law_vetting_bureau",
            catalogId: "cat_vetting_law",
            title: "Projektligji për Byronë Shtetërore për Verifikimin dhe Konfiskimin e Pasurisë së Pajustifikueshme",
            ministry: "Ministria e Drejtësisë",
            proposer: "Qeveria e Kosovës (Ministria e Drejtësisë)",
            sector: "sec_justice",
            desc: "Themelon mekanizmin për konfiskimin civil të pasurisë së zyrtarëve publikë pas rekomandimeve të Komisionit të Venecias.",
            majorityType: "SIMPLE_61",
            requiredVotes: 61,
            costB: 0.02,
            approvalEffect: 5.2,
            supportParties: ["LVV", "MIN_MULTI"],
            stage: "Shqyrtim në Komisionin për Legjislacion",
            status: "UNDER_REVIEW",
            submittedWeek: 1,
            scheduledWeek: null,
            applied: false,
            voteHistory: [],
            stageHistory: [{ stage: "DRAFT", week: 1 }, { stage: "SUBMITTED", week: 1 }, { stage: "UNDER_REVIEW", week: 1 }],
            lastVoteResult: null
        },
        {
            id: "law_eu_growth_plan",
            title: "Ratifikimi i Marrëveshjes Ndërkombëtare me BE-në për Planin e Rritjes (€880 Milionë)",
            ministry: "Ministria e Punëve të Jashtme dhe Financave",
            proposer: "Qeveria e Kosovës (MPJD & MFPT)",
            sector: "sec_econ",
            desc: "Kërkon 2/3 e të gjithë deputetëve të Kuvendit (80 vota) sipas Nenit 18 të Kushtetutës së Kosovës. Sjell grante dhe kredi të buta.",
            majorityType: "INTL_80",
            requiredVotes: 80,
            costB: -0.22,
            approvalEffect: 4.0,
            supportParties: ["LVV", "PDK", "LDK", "AAK", "MIN_MULTI"],
            stage: "Seancë Plenare (Kërkon 80 vota)",
            status: "SCHEDULED",
            submittedWeek: 1,
            scheduledWeek: 2,
            applied: false,
            voteHistory: [],
            stageHistory: [{ stage: "DRAFT", week: 1 }, { stage: "SUBMITTED", week: 1 }, { stage: "UNDER_REVIEW", week: 1 }, { stage: "SCHEDULED", week: 2 }],
            lastVoteResult: null
        },
        {
            id: "law_fsk_defense_fund",
            catalogId: "cat_defense_fund",
            title: "Ligji për Fondin e Mbrojtjes dhe Prokurimin e Helikopterëve e Sistemeve Kundërajrore për FSK-në",
            ministry: "Ministria e Mbrojtjes (FSK)",
            proposer: "Qeveria e Kosovës (Ministria e Mbrojtjes)",
            sector: "sec_fsk",
            desc: "Përmbush zotimin për buxhetin 1 miliard euro për ushtrinë gjatë mandatit katërvjeçar.",
            majorityType: "SIMPLE_61",
            requiredVotes: 61,
            costB: 0.18,
            approvalEffect: 5.8,
            supportParties: ["LVV", "PDK", "LDK", "AAK", "MIN_MULTI"],
            stage: "Dorëzuar në Kuvend",
            status: "SUBMITTED",
            submittedWeek: 1,
            scheduledWeek: null,
            applied: false,
            voteHistory: [],
            stageHistory: [{ stage: "DRAFT", week: 1 }, { stage: "SUBMITTED", week: 1 }],
            lastVoteResult: null
        },
        {
            id: "law_vital_cultural_zones",
            catalogId: "cat_cultural_heritage",
            title: "Ndryshimi i Ligjit për Vetëqeverisjen Lokale dhe Trashëgiminë Kulturore (Interes Vital - Neni 81)",
            ministry: "Ministria e Administrimit të Pushtetit Lokal",
            proposer: "Qeveria e Kosovës (MAPL)",
            sector: "sec_local",
            desc: "Ligj me interes vital që kërkon shumicë të dyfishtë: 61+ vota në total DHE 2/3 e deputetëve që mbajnë ulëse të garantuara për komunitetet (14 nga 20).",
            majorityType: "VITAL_DOUBLE",
            requiredVotes: 61,
            costB: 0.03,
            approvalEffect: 2.5,
            supportParties: ["LVV", "LDK", "MIN_MULTI"],
            stage: "Konsultim me Komunitetet",
            status: "UNDER_REVIEW",
            submittedWeek: 1,
            scheduledWeek: null,
            applied: false,
            voteHistory: [],
            stageHistory: [{ stage: "DRAFT", week: 1 }, { stage: "SUBMITTED", week: 1 }, { stage: "UNDER_REVIEW", week: 1 }],
            lastVoteResult: null
        },
        {
            id: "law_civil_code",
            title: "Projekt-Kodi Civil i Republikës së Kosovës",
            ministry: "Ministria e Drejtësisë",
            proposer: "Qeveria e Kosovës (Ministria e Drejtësisë)",
            sector: "sec_justice",
            desc: "Rregullon çështjet pronësore, trashëgiminë dhe familjen. Përballet me kundërshtime nga deputetë konservatorë brenda vetë shumicës parlamentare.",
            majorityType: "SIMPLE_61",
            requiredVotes: 61,
            costB: 0.01,
            approvalEffect: 1.5,
            supportParties: ["LVV"],
            stage: "Debat Parlamentar",
            status: "UNDER_REVIEW",
            submittedWeek: 1,
            scheduledWeek: null,
            applied: false,
            voteHistory: [],
            stageHistory: [{ stage: "DRAFT", week: 1 }, { stage: "SUBMITTED", week: 1 }, { stage: "UNDER_REVIEW", week: 1 }],
            lastVoteResult: null
        }
    ];
}

function getInitialPromises() {
    return [
        { id: "prom_salary_1000", title: "Rritja e pagës mesatare në sektorin publik drejt nivelit 1,000€", deadlineWeeks: 48, costB: 0.14, progress: 35, fulfilled: false, source: "Programi Qeverisës Kurti 4 (Shtator 2026)" },
        { id: "prom_army_1b", title: "Buxheti 1 Miliard Euro për FSK-në dhe Mbrojtjen", deadlineWeeks: 36, costB: 0.18, progress: 45, fulfilled: false, source: "Seanca e Kuvendit (13 Shtator 2026)" },
        { id: "prom_highways", title: "Përfundimi i rrugëve Prishtinë–Podujevë, Prishtinë–Mitrovicë dhe Autostradës së Gjilanit", deadlineWeeks: 52, costB: 0.16, progress: 40, fulfilled: false, source: "Zotim Infrastrukture" }
    ];
}

function getInitialCabinetAgenda() {
    return [
        {
            id: "cab_1",
            title: "Subvencionimi i Tarifave të Energjisë Dimërore dhe Remonti i Bllokut B2 në KEK",
            ministry: "Ministria e Ekonomisë",
            ministerName: "Artane Rizvanolli",
            costB: 0.06,
            approvalGain: 3.2,
            done: false,
            note: "Parandalon reduktimet e rrymës gjatë dimrit.",
            ministerArgument: "Pa këtë intervenim prej €60M në KEK dhe KOSTT, rrezikojmë import të shtrenjtë të energjisë gjatë muajve të dimrit.",
            financeObjection: "Ministri i Financave kërkon që shuma të mos kalojë €45M ose të kursehen mjete nga subvencione të tjera."
        },
        {
            id: "cab_2",
            title: "Dyfishimi i Shtesave për Fëmijë dhe Lehona",
            ministry: "Ministria e Financave",
            ministerName: "Hekuran Murati",
            costB: 0.08,
            approvalGain: 4.8,
            done: false,
            note: "Rrit ndjeshëm mbështetjen te familjet e reja.",
            ministerArgument: "Masë e drejtpërdrejtë sociale që prek mbi 400 mijë fëmijë në Republikën e Kosovës.",
            financeObjection: "Ministria e Infrastrukturës vëren se kjo ngushton hapësirën për shpronësime rrugore."
        },
        {
            id: "cab_3",
            title: "Paketa e Granteve për Fermerët në Rahovec, Lipjan, Podujevë dhe Suharekë",
            ministry: "Ministria e Bujqësisë",
            ministerName: "Faton Peci",
            costB: 0.05,
            approvalGain: 3.5,
            done: false,
            note: "Mbështetje direkte për grurin, vreshtarinë dhe blegtorinë.",
            ministerArgument: "Subvencionimi përmes digjitalizimit rrit prodhimin vendor dhe ul varësinë nga importi.",
            financeObjection: "Kërkohet mbikëqyrje e rreptë në terren nga inspektorët komunalë."
        },
        {
            id: "cab_4",
            title: "Ndërtimi i Stadiumit Kombëtar dhe Infrastrukturës për Lojërat Mesdhetare Prishtina 2030",
            ministry: "Ministria e Kulturës, Rinisë dhe Sportit",
            ministerName: "Hajrulla Çeku",
            costB: 0.09,
            approvalGain: 4.1,
            done: false,
            note: "Investim strategjik sportiv në të gjithë Kosovën.",
            ministerArgument: "Kosova është nikoqire e Lojërave Mesdhetare 2030; afatet e Komitetit Ndërkombëtar janë të panegociueshme.",
            financeObjection: "Kryetarët e komunave kërkojnë që investimet të shpërndahen në disa stadiume rajonale."
        }
    ];
}

/* ============================================================================
   8. KANDIDATËT PRESIDENCIALË
   ============================================================================ */
const DEFAULT_PRESIDENTIAL_CANDIDATES = {
    cand_pula: { id: "cand_pula", name: "Prof. Dr. Justina Shiroka-Pula", type: "Akademike / Konsensuale (ASHAK)", acceptParties: ["LVV", "PDK", "MIN_MULTI"], popBonus: 3.5 },
    cand_osmani: { id: "cand_osmani", name: "Dr. Vjosa Osmani-Sadriu", type: "Politike / Institucionale", acceptParties: ["LDK", "MIN_MULTI", "AAK"], popBonus: 3.0 },
    cand_konjufca: { id: "cand_konjufca", name: "Glauk Konjufca", type: "Kandidat Politik (LVV)", acceptParties: ["LVV", "MIN_MULTI"], popBonus: 4.0 },
    cand_jashari: { id: "cand_jashari", name: "Prof. Dr. Murat Jashari (ose Përfaqësues Jopartiak)", type: "Personalitet Unifikues Kombëtar (Jopartiak)", acceptParties: ["LVV", "PDK", "LDK", "AAK", "MIN_MULTI"], popBonus: 6.0 },
    cand_hasani: { id: "cand_hasani", name: "Prof. Dr. Enver Hasani", type: "Jurist / Ish-Kryetar i Gjykatës Kushtetuese", acceptParties: ["PDK", "LDK", "AAK", "MIN_MULTI"], popBonus: 2.5 },
    cand_bajrami: { id: "cand_bajrami", name: "Akademik Arsim Bajrami", type: "Akademik & Konstitucionalist", acceptParties: ["PDK", "LDK", "MIN_MULTI"], popBonus: 2.8 },
    cand_haradinaj: { id: "cand_haradinaj", name: "Ramush Haradinaj / Ardian Gjini", type: "Kandidat nga AAK", acceptParties: ["AAK", "PDK"], popBonus: 2.0 }
};

function getAllPresCandidates() {
    var all=JSON.parse(JSON.stringify(Object.assign({},DEFAULT_PRESIDENTIAL_CANDIDATES,state.customPresCandidates || {})));
    if(all.cand_haradinaj && state.parties.AAK)all.cand_haradinaj.name=state.parties.AAK.leader;
    return all;
}

/* ============================================================================
   9. FUNKSIONET NDIHMËSE
   ============================================================================ */
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function showToast(msg) {
    if(typeof recordUXNotification==='function')recordUXNotification(msg);
    var t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function() { t.style.display = "none"; }, 3400);
}

function showMajorAnnouncement(cfg) {
    if (_committingVote && state.pendingVote) {
        state.pendingVote.announcement = cfg;
        return;
    }
    var box = document.getElementById("majorEventModalContent");
    if (!box) return;
    var subTxt = cfg.subtitle || (MONTHS_SQ[state.monthIndex] + " " + state.year + " • Java " + state.week);
    var statsBlock = cfg.statsHtml ? '<div style="background:#0f172a; border:1px solid var(--border-glass); border-radius:10px; padding:12px; margin-bottom:12px;">' + cfg.statsHtml + '</div>' : '';
    var futBlock = cfg.futureImpact ? '<div style="color:var(--text-muted);"><strong>🔮 Efektet afatgjata:</strong> ' + cfg.futureImpact + '</div>' : '';

    box.innerHTML =
        '<div style="text-align:center; padding:8px 4px;">' +
            '<span class="tag tag-gold" style="font-size:0.75rem; padding:4px 12px; margin-bottom:10px;">' + (cfg.badge || "ZHVILLIM KRYESOR SHTETËROR") + '</span>' +
            '<h2 style="font-size:1.25rem; color:#fff; margin-bottom:6px;">' + cfg.title + '</h2>' +
            '<div style="font-size:0.82rem; color:var(--accent-gold); margin-bottom:14px;">' + subTxt + '</div>' +
        '</div>' +
        statsBlock +
        '<div style="font-size:0.83rem; line-height:1.6; color:#e2e8f0; margin-bottom:12px;">' +
            '<div style="margin-bottom:6px;"><strong>📌 Pse ndodhi dhe konteksti:</strong> ' + cfg.reason + '</div>' +
            '<div style="margin-bottom:6px;"><strong>⚡ Pasojat e menjëhershme:</strong> ' + cfg.immediateImpact + '</div>' +
            futBlock +
        '</div>' +
        '<div style="display:flex; justify-content:center; margin-top:14px;">' +
            '<button class="action-btn btn-gold" style="padding:10px 24px; font-size:0.85rem;" onclick="toggleModal(\'majorEventModal\', false)">Vazhdo Simulimin ▶</button>' +
        '</div>';
    toggleModal("majorEventModal", true);
}

function addMediaNews(outlet, title, tone, fullBody, reactions, context) {
    if (!tone) tone = "NEUTRAL";
    var dateStr = MONTHS_SQ[state.monthIndex] + " " + state.year + " (Java " + state.week + ")";
    var newsObj = {
        id: "news_" + Date.now() + "_" + Math.floor(Math.random() * 999),
        outlet: outlet,
        title: title,
        tone: tone,
        time: dateStr,
        fullBody: fullBody || '',
        reactions: reactions || ''
    };
    newsObj.report=mediaReportFor(newsObj,context,fullBody,reactions);
    newsObj.fullBody=[newsObj.report.intro,newsObj.report.development,newsObj.report.closing].join('\n\n');
    state.mediaFeed.unshift(newsObj);
    if (state.mediaFeed.length > 15) state.mediaFeed.pop();
    state.historyLog.unshift(dateStr + ": [" + outlet + "] " + title);
    var ticker = document.getElementById("mediaTickerText");
    if (ticker) ticker.textContent = "[" + outlet + "] " + title;
}

function openNewsArticleModal(newsIdx) {
    var n = state.mediaFeed[newsIdx];
    if (!n) return;
    var box = document.getElementById("majorEventModalContent");
    var article=mediaArticleReport(n),esc=electoralEscape;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">📰 ' + esc(n.outlet) + ' — Raportimi i plotë</div>' +
            '<button class="btn-top" onclick="toggleModal(\'majorEventModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div class="news-byline">' + esc(n.time) + ' · ' + esc(n.outlet) + '</div>' +
        '<h2 class="news-headline">' + esc(immersiveCopy(n.title)) + '</h2>' +
        '<article class="news-article" data-ui-prose>' +
            '<p class="news-lead">' + esc(immersiveCopy(article.intro)) + '</p>' +
            '<p>' + esc(immersiveCopy(article.development)) + '</p>' +
            '<p class="news-closing">' + esc(immersiveCopy(article.closing)) + '</p>' +
            (article.reactions?'<aside class="news-reactions"><strong>Reagimet e raportuara</strong><p>'+esc(immersiveCopy(article.reactions))+'</p></aside>':'') +
        '</article>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between;">' +
            '<button class="action-btn" onclick="toggleModal(\'majorEventModal\', false); switchMainTab(\'tab-dashboard\'); switchSubTab(\'dash\', \'press\', document.querySelectorAll(\'#tab-dashboard .sub-pill\')[3]);">🎙️ Reago në Konferencë për Media</button>' +
            '<button class="action-btn btn-outline" onclick="issueQuickPressRelease(' + newsIdx + ','+electoralEscape(JSON.stringify(n.id))+')" '+(n.clarificationIssued?'disabled':'')+'>'+(n.clarificationIssued?'Komunikata është regjistruar':'📝 Lësho komunikatë sqaruese')+'</button>' +
        '</div>';
    toggleModal("majorEventModal", true);
}

function issueQuickPressRelease(newsIdx,expectedNewsId) {
    if(!assertGovernmentAuthority('Komunikata e Qeverisë'))return false;
    var n = state.mediaFeed[newsIdx];
    if(!n || n.clarificationIssued || expectedNewsId && n.id!==expectedNewsId)return false;
    var beforeRelease=JSON.stringify(state);
    adjustPublicSupport((0.8), {source:"issueQuickPressRelease"}, state);
    n.clarificationIssued=true;n.clarificationTurn=state.turnCount;
    state.historyLog.unshift('Java '+state.turnCount+' [Media]: U regjistrua komunikata sqaruese për '+n.title+'.');
    if(!saveGameAuto()){state=JSON.parse(beforeRelease);return false;}
    toggleModal("majorEventModal", false);
    refreshAllUI();
    showToast("Zyra për Media lëshoi komunikatë sqaruese lidhur me raportimin e " + (n ? n.outlet : "medias") + "!");
    return true;
}

function reportSaveError(error) {
    console.error("Gabim në ruajtje/ngarkim:", error);
    showToast(error?.name==='QuotaExceededError'?'Hapësira lokale është mbushur. Eksporto një kopje të lojës; ruajtjet ekzistuese nuk u fshinë.':'Ruajtja ose ngarkimi dështoi: '+(error?.message||'ruajtja lokale nuk është e arritshme')+'. Të dhënat ekzistuese nuk u fshinë.');
}

// Local autosave only. Cloud saving is an explicit action in auth-cloud-save.js.
function saveGameAuto() {
    if (!state || _committingVote) return false;
    if (weeklyProcessing) return true;
    var mandateBefore=state.mandateExperience?JSON.stringify(state.mandateExperience):null;
    var mandatePromises=mandateBefore?JSON.stringify(state.promises):null;
    try {
        fiscalSyncBudgetStatuses();
        if(mandateBefore && typeof syncMandateExperience==='function')syncMandateExperience();
        try { localStorage.setItem(STORAGE_KEY_AUTO, JSON.stringify(state)); }
        catch(error){if(error?.name!=='QuotaExceededError'||!compactExistingLocalSlots())throw error;localStorage.setItem(STORAGE_KEY_AUTO,JSON.stringify(state));}
        _saveErrorShown = false;
        return true;
    } catch (e) {
        if(mandateBefore){state.mandateExperience=JSON.parse(mandateBefore);state.promises=JSON.parse(mandatePromises);}
        if (!_saveErrorShown) reportSaveError(e);
        _saveErrorShown = true;
        return false;
    }
}

// Narrow bridge for the optional Firebase module; state remains owned by the game.
window.republikaCloudGame = {
    returnToLogin: function() {
        window.republikaNewGameRequested = false;
        window.republikaResumeAfterLogin = true;
        saveGameAuto();
        clearInterval(votingAnimInterval);
        votingAnimInterval = null;
        if (weeklyTimer !== null) clearTimeout(weeklyTimer);
        weeklyTimer = null;
        stopConstituentAnimation();
        resetGovernmentNotifications();
        document.querySelectorAll('dialog[open]').forEach(function(el){el.close();});
        document.querySelectorAll('.modal-overlay.show').forEach(function(el){el.classList.remove('show');});
        showStartScreen();
        document.getElementById('startMenuContent').hidden = true;
        document.getElementById('startAuthStep').hidden = false;
        document.getElementById('startAuthenticatedContinueBtn').textContent = 'Vazhdo lojën lokale';
    },
    resumeGame: function() {
        window.republikaResumeAfterLogin = false;
        continueLocalGameFromScreen();
        switchMainTab('tab-dashboard');
        switchSubTab('dash','overview',document.querySelector('#tab-dashboard .sub-pill'));
    },
    shouldResumeAfterLogin: function() { return !!window.republikaResumeAfterLogin; },
    beginNewGame: function() {
        window.republikaNewGameRequested = false;
        hideStartScreen();
        openNewScenarioModal();
    },
    exportJSON: function() {
        if (!state || weeklyProcessing || _committingVote || _voteInProgress) {
            throw new Error('Përfundoni përpunimin e javës ose votimin para ruajtjes.');
        }
        validateLoadedState(state);
        return JSON.stringify(state);
    },
    importJSON: function(json) {
        if (weeklyProcessing || _committingVote || _voteInProgress) {
            throw new Error('Përfundoni përpunimin e javës ose votimin para ngarkimit.');
        }
        var loaded = prepareLoadedState(JSON.parse(json));
        // Commit locally first. A validation/storage failure leaves the current game intact.
        localStorage.setItem(STORAGE_KEY_AUTO, JSON.stringify(loaded));
        if(typeof resetGovernmentNotifications==='function')resetGovernmentNotifications();
        clearInterval(votingAnimInterval);
        currentVotingData = null;
        _voteInProgress = false;
        state = loaded;
        _saveErrorShown = false;
        toggleModal('votingModal', false);
        toggleModal('saveModal', false);
        document.getElementById('setupModal').classList.remove('show');
        hideStartScreen();
        refreshAllUI();
        resumePendingVote();
    }
};

function getSaveSlots() {
    try {
        var raw = localStorage.getItem(STORAGE_KEY_SLOTS);
        var slots = raw ? unpackLocalSlots(raw) : [null, null, null];
        if (!Array.isArray(slots)) throw new Error("Formati i sloteve është i pavlefshëm");
        return slots;
    } catch (e) { reportSaveError(e); return null; }
}

function saveToSlot(slotIdx) {
    if (!state || _committingVote || weeklyProcessing || !Number.isInteger(slotIdx) || slotIdx<0 || slotIdx>2) return false;
    try {
    validateLoadedState(state);
    var slots = getSaveSlots();
    if (!slots) return false;
    slots[slotIdx] = {
        savedAt: new Date().toLocaleString("sq-AL"),
        summary: state.parties[state.playerParty].short + " • " + MONTHS_SQ[state.monthIndex] + " " + state.year + " (Java " + state.week + ") • Shumica: " + getCoalitionSeats() + "/120",
        data: JSON.parse(JSON.stringify(state))
    };
    localStorage.setItem(STORAGE_KEY_SLOTS, packLocalSlots(slots));
    renderSaveSlots();
    showToast("Loja u ruajt me sukses në Slotin #" + (slotIdx + 1) + "!");
    return true;
    } catch (e) { reportSaveError(e); return false; }
}

function loadFromSlot(slotIdx) {
    var slots = getSaveSlots();
    if (!slots || !slots[slotIdx]) return;
    try {
        var loaded = prepareLoadedState(slots[slotIdx].data);
        try{localStorage.setItem(STORAGE_KEY_AUTO,JSON.stringify(loaded));}
        catch(error){if(error?.name!=='QuotaExceededError'||!compactExistingLocalSlots())throw error;localStorage.setItem(STORAGE_KEY_AUTO,JSON.stringify(loaded));}
    } catch (e) { reportSaveError(e); return; }
    clearInterval(votingAnimInterval);
    if(typeof resetGovernmentNotifications==='function')resetGovernmentNotifications();
    currentVotingData = null;
    _voteInProgress = false;
    state = loaded;
    saveGameAuto();
    toggleModal("saveModal", false);
    hideStartScreen();
    refreshAllUI();
    resumePendingVote();
    showToast("U ngarkua skenari nga Sloti #" + (slotIdx + 1) + "!");
}

function hardResetAllSaves() {
    localStorage.removeItem(STORAGE_KEY_AUTO);
    localStorage.removeItem(STORAGE_KEY_SLOTS);
    location.reload();
}

function renderSaveSlots() {
    var slots = getSaveSlots();
    var container = document.getElementById("saveSlotsContainer");
    if (!container) return;
    if (!slots) { container.textContent = "Slotet nuk mund të lexohen. Të dhënat ekzistuese nuk u ndryshuan."; return; }
    container.innerHTML = slots.map(function(slot, i) {
        return '<div class="card" style="background:#0f172a; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
            '<div>' +
                '<div style="font-weight:700; font-size:0.84rem; color:var(--accent-gold);">Sloti i Ruajtjes #' + (i + 1) + '</div>' +
                '<div style="font-size:0.75rem; color:var(--text-muted);">' +
                    (slot ? (slot.summary + '<br><small>Ruajtur më: ' + slot.savedAt + '</small>') : "Slot i zbrazët — asnjë lojë e ruajtur") +
                '</div>' +
            '</div>' +
            '<div style="display:flex; gap:6px;">' +
                '<button class="action-btn btn-gold" onclick="saveToSlot(' + i + ')">Ruaj Këtu</button>' +
                (slot ? '<button class="action-btn btn-success" onclick="loadFromSlot(' + i + ')">Ngarko</button>' : '') +
            '</div>' +
        '</div>';
    }).join("");
}

function getCoalitionSeats() {
    if (!state) return 0;
    return state.coalitionParties.reduce(function(acc, pId) {
        return acc + coalitionPartySeats(pId);
    }, 0);
}

/* ============================================================================
   10. MIGRIMET
   ============================================================================ */
function migrateStateForFaza6(st) {
    if (!st) return;
    if (!st.dialogueInvitation) {
        st.dialogueInvitation = {
            active: false,
            inviter: "Bashkimi Evropian (BE) & Shtetet e Bashkuara të Amerikës",
            inviterKey: "EU",
            reason: "Rifillimi i dialogut për normalizimin e marrëdhënieve dhe zbatimin e Marrëveshjes së Ohrit.",
            agenda: "Zbatimi i Marrëveshjes së Ohrit, Siguria në Veri, Plani i Rritjes i BE-së, Të Drejtat e Komuniteteve",
            deadlineWeeks: 3,
            responseStatus: "PENDING",
            respondedAt: null
        };
    }
    if (!st.dialogueConsultations) st.dialogueConsultations = {};
    if (typeof st.dialogueProposal === "undefined") st.dialogueProposal = null;
    if (typeof st.dialogueCounterOffer === "undefined") st.dialogueCounterOffer = null;
    if (!st.dialogueAgreements) st.dialogueAgreements = [];
    if (!st.dialogueRoundHistory) st.dialogueRoundHistory = [];
    if (typeof st.dialogueChronologyStep === "undefined") st.dialogueChronologyStep = 1;
    if (typeof st.dialogueProgress === "undefined") st.dialogueProgress = 52;
    if (!st.dialogueNegotiationLog) st.dialogueNegotiationLog = [];
    if (typeof st.dialogueAlliesConsulted === "undefined") st.dialogueAlliesConsulted = false;
}

function migrateStateForFaza7(st) {
    if (!st) return;
    if (!st.parliamentarySessions) st.parliamentarySessions = [];
    if (!st.motions) st.motions = [];
    if (typeof st.sessionCounter === "undefined") st.sessionCounter = 0;
    if (typeof st.motionCounter === "undefined") st.motionCounter = 0;
    if (typeof st.billCounter === "undefined") st.billCounter = 0;

    if (!st.laws) st.laws = getInitialLaws();
    st.laws.forEach(function(law) {
        if (typeof law.proposer === "undefined") law.proposer = law.ministry || "Qeveria e Kosovës";
        if (typeof law.sector === "undefined") law.sector = "sec_econ";
        if (typeof law.submittedWeek === "undefined") law.submittedWeek = 1;
        if (typeof law.scheduledWeek === "undefined") law.scheduledWeek = null;
        if (typeof law.applied === "undefined") law.applied = (law.status === "PASSED");
        if (!law.voteHistory) law.voteHistory = [];
        if (!law.stageHistory) law.stageHistory = [];
        if (typeof law.status === "undefined") law.status = "DRAFT";
        if (law.status === "PENDING") {
            if (law.stage && (law.stage.includes("Leximi") || law.stage.includes("Seancë"))) law.status = "SCHEDULED";
            else if (law.stage && law.stage.includes("Komision")) law.status = "UNDER_REVIEW";
            else law.status = "SUBMITTED";
        }
    });

    st.parliamentarySessions.forEach(function(sess) {
        if (!sess.billIds) sess.billIds = [];
        if (!sess.results) sess.results = [];
        if (typeof sess.status === "undefined") sess.status = "SCHEDULED";
        if (typeof sess.number === "undefined") sess.number = ++st.sessionCounter;
    });

    st.motions.forEach(function(mot) {
        if (typeof mot.status === "undefined") mot.status = "PENDING";
        if (typeof mot.number === "undefined") mot.number = ++st.motionCounter;
    });
}

function migrateStateForFaza8(st) {
    if (!st) return;
    if (typeof st.fiscalReserve === "undefined") st.fiscalReserve = 0.32;
    if (typeof st.debtInterestRate === "undefined") st.debtInterestRate = 2.8;
    if (typeof st.plannedRevenues === "undefined") st.plannedRevenues = st.taxRevenueB ?? 3.10;
    if (typeof st.plannedExpenses === "undefined") st.plannedExpenses = st.budgetTotalB ?? 3.32;
    if (typeof st.realizedRevenues === "undefined") st.realizedRevenues = 0;
    if (typeof st.realizedExpenses === "undefined") st.realizedExpenses = 0;
    if (typeof st.lastWeekRevenues === "undefined") st.lastWeekRevenues = 0;
    if (typeof st.lastWeekExpenses === "undefined") st.lastWeekExpenses = 0;
    if (!st.fiscalHistory) st.fiscalHistory = [];
    if (!st.weeklyReports) st.weeklyReports = [];
    if (!st.taxPolicy) st.taxPolicy = { vat: 18, incomeTax: 10, corporateTax: 15, customs: 10 };
    if (typeof st.pendingInterestPayment === "undefined") st.pendingInterestPayment = 0;
}

function migrateStateForFaza9(st) {
    if (!st) return;
    // Scenario baselines belong to createFreshState, never to historical loading.
    if (st.municipalityProfiles === undefined) st.municipalityProfiles = {};
    (st.municipalities || []).forEach(function(m) {
        if (!Array.isArray(m.projects)) m.projects = [];
    });
    if (!Array.isArray(st.developmentProjects)) st.developmentProjects = [];
    if (typeof st.developmentProjectCounter === "undefined") st.developmentProjectCounter = 0;
    if (!st.sectorInitialScores) {
        st.sectorInitialScores = {};
        (st.stateSectors || []).forEach(function(sec) { st.sectorInitialScores[sec.id] = sec.score; });
    }
    if (!st.sectorHistory) {
        st.sectorHistory = {};
        (st.stateSectors || []).forEach(function(sec) { st.sectorHistory[sec.id] = [{ week: 1, score: sec.score }]; });
    }
    if (typeof st.municipalityWeeklyReport === "undefined") st.municipalityWeeklyReport = null;
    if (typeof st.sectorWeeklyReport === "undefined") st.sectorWeeklyReport = null;
    if (typeof st.lastDevelopmentReportWeek === "undefined") st.lastDevelopmentReportWeek = 0;
    if (typeof st._developmentReportPending === "undefined") st._developmentReportPending = false;
}

function migrateStateForFaza11(st) {
    if (!st) return;
    if (typeof st.institutionalPhase === "undefined") {
        if (st.governmentFormed && st.presidentElected && st.assemblyConstituted) {
            st.institutionalPhase = INSTITUTIONAL_PHASES.GOV_IN_OFFICE;
        } else if (st.governmentFormed) {
            st.institutionalPhase = INSTITUTIONAL_PHASES.GOV_APPROVED;
        } else if (st.presidentElected) {
            st.institutionalPhase = INSTITUTIONAL_PHASES.PRESIDENT_ELECTED;
        } else if (st.assemblyConstituted) {
            st.institutionalPhase = st.speakerElected === true ||
                (typeof st.speakerElected === "undefined" && st.speakerOfAssembly && st.speakerOfAssembly.indexOf("pritje") === -1)
                ? INSTITUTIONAL_PHASES.SPEAKER_ELECTED : INSTITUTIONAL_PHASES.ASSEMBLY_ELECTED;
        } else {
            st.institutionalPhase = INSTITUTIONAL_PHASES.NEW;
        }
    }
    if (typeof st.governmentStatus === "undefined") {
        st.governmentStatus = st.governmentFormed ? "IN_OFFICE" : "PENDING";
    }
    if (typeof st.speakerElected === "undefined") {
        st.speakerElected = !!(st.speakerOfAssembly && st.speakerOfAssembly.indexOf("pritje") === -1);
    }
    if (typeof st.speakerElectionWeek === "undefined") st.speakerElectionWeek = null;
    if (typeof st.governmentApprovalWeek === "undefined") st.governmentApprovalWeek = null;

    if (!st.chatHistories) st.chatHistories = {};
    if (!st.meetingScenes) st.meetingScenes = {};
    if (!st.consultationSessions) st.consultationSessions = {};
    if (typeof st.brusselsRoundState === "undefined") st.brusselsRoundState = null;

}

function migrateStateForFazaRe(st) {
    if (!st) return;
    if (!st.weeklyDossiers) st.weeklyDossiers = [];
    if (typeof st.dossierCounter === "undefined") st.dossierCounter = 0;
    if (typeof st.electionCampaign === "undefined") st.electionCampaign = null;
    if (typeof st.electionPhase === "undefined") st.electionPhase = "NONE";
    if (typeof st.nextElectionScheduledWeek === "undefined") st.nextElectionScheduledWeek = null;
    if (typeof st.presidentialElectionInProgress === "undefined") st.presidentialElectionInProgress = false;
    if (typeof st.cabinetProposal === "undefined") st.cabinetProposal = null;
    if (typeof st.cabinetApproved === "undefined") st.cabinetApproved = false;
    if (typeof st.presidentialNegotiations === "undefined") st.presidentialNegotiations = null;

    if (typeof st.presidentMandateStartYear === "undefined") {
        st.presidentMandateStartYear = st.presidentElected ? 2026 : null;
        st.presidentMandateEndYear = st.presidentElected ? 2031 : null;
    }

}

// Reuse the live canonical collections; never create a parallel candidate/election store.
// Only absent fields are initialized. Invalid existing fields are rejected at load time.
function migrateStateForDataFoundation(st) {
    function missing(key, value) {
        if (typeof st[key] === "undefined") st[key] = value;
    }
    missing("stateSchemaVersion", STATE_SCHEMA_VERSION);
    ["coalitionAgreements", "dialogueAgreements", "dialogueRoundHistory", "dialogueNegotiationLog",
        "developmentProjects", "scheduledMeetings", "customInterlocutors", "pmInboxRequests"].forEach(function(key) {
        missing(key, []);
    });
    ["customPresCandidates", "dialogueConsultations"].forEach(function(key) { missing(key, {}); });
    missing("stateSectors", getInitialStateSectors());
    missing("quorumPledgedParties", st.coalitionParties.slice());
    missing("winningParty", st.mandatar || st.playerParty);
    missing("mandatar", st.winningParty);
    missing("electionPhase", "NONE");
    missing("electionCampaign", null);
    missing("nextElectionScheduledWeek", null);
    missing("presidentialElectionInProgress", false);
    missing("pendingVote", null);
    missing("activeSessionId", null);
    Object.keys(st.parties).forEach(function(key) {
        var party = st.parties[key];
        if (typeof party.candidates === "undefined") party.candidates = [];
        if (typeof party.reserves === "undefined") party.reserves = [];
    });
    st.municipalities.forEach(function(municipality) {
        if (typeof municipality.projects === "undefined") municipality.projects = [];
    });
}

function prepareLoadedState(rawState) {
    // Work on a detached copy: a failed validation/migration cannot damage the active game.
    var loaded = JSON.parse(JSON.stringify(rawState));
    // Extend old sector snapshots before validating their now-expanded key set.
    if(loaded?.sectorManagement&&loaded.sectorManagement.expansion===undefined)migrateSectorExpansion(loaded);
    repairPostElectionPublication(loaded);validateLoadedState(loaded);
    runAllMigrations(loaded);repairPostElectionPublication(loaded);reconcileAssociationUltimatum(loaded);
    validateLoadedState(loaded);
    return loaded;
}

// One policy for both municipal contracts and general development projects.
const MUNICIPAL_EFFECT_METRICS=['infrastructure','services','employment','development','education','health','water','connectivity'];
function municipalMetricValid(profile,key){return !!profile && Number.isFinite(profile[key]) && profile[key]>=1 && profile[key]<=10;}
function municipalFundingMetricError(st,mid,gains){
    var keys=MUNICIPAL_EFFECT_METRICS.filter(function(k){return gains[k]>0;});
    var missing=keys.filter(function(k){return !municipalMetricValid(st.municipalityProfiles?.[mid],k);});
    return missing.length?'Financimi refuzohet: '+mid+' — metrika të munguara ose të pavlefshme: '+missing.join(', ')+'.':'';
}
function developmentMunicipalGains(cat){
    return {infrastructure:cat.muniInfraGain||0,services:cat.muniServGain||0,employment:cat.muniEmpGain??cat.empGain??0,development:cat.devGain||0,education:cat.muniEducGain||0,health:cat.muniHealthGain||0,water:cat.muniWaterGain||0,connectivity:cat.muniConnectGain||0};
}
function projectEffectKeys(p){
    if(p.municipal14)return (p.metricGain>0?['metric:'+p.metric]:[]).concat(['satisfaction','relation','localSupport'],p.sectorGain>0?['sector']:[]);
    return MUNICIPAL_EFFECT_METRICS.filter(function(k){return p.benefits?.muniGains?.[k]>0;}).map(function(k){return 'metric:'+k;}).concat(p.benefits?.sectorGain>0?['sector']:[],['publicSupport','localSupport']);
}
function ensureProjectEffectComponents(p,newContract){
    if(p.effectComponents){
        validateProjectEffectComponents(p);
        // Unprocessed contracts may acquire documented gains before execution.
        var e=p.effectComponents;
        if(Object.values(e.components).every(function(c){return c.processedFraction===0;}))Object.keys(e.components).forEach(function(k){if(!projectEffectKeys(p).includes(k))delete e.components[k];});
        projectEffectKeys(p).forEach(function(k){if(!e.components[k])e.components[k]={inheritedFraction:0,processedFraction:0,appliedFraction:0,blockedFraction:0};});
        return e;
    }
    // Inherited checkpoints prevent replay; they do not certify historical delivery.
    var inherited=newContract?0:p.municipal14?(p.effectsApplied?1:p.appliedFraction||0):(p.effectsApplied || p.status==='COMPLETED'?1:0);
    var components={};projectEffectKeys(p).forEach(function(k){components[k]={inheritedFraction:inherited,processedFraction:inherited,appliedFraction:0,blockedFraction:0};});
    return p.effectComponents={version:1,origin:newContract?'new_contract':'legacy',components:components};
}
function processProjectEffect(p,key,target,available,apply,reason){
    var c=ensureProjectEffectComponents(p).components[key];
    if(!c)throw Error('Komponent efekti i panjohur: '+key);
    var delta=target-c.processedFraction;if(delta<=0)return;
    if(available){apply(delta);c.appliedFraction=Math.min(1,+(c.appliedFraction+delta).toFixed(12));}
    else {c.blockedFraction=Math.min(1,+(c.blockedFraction+delta).toFixed(12));c.reason=reason;}
    // Consume this interval even when blocked: restoration never awards arrears.
    c.processedFraction=target;
}
function projectEffectsDelivered(p){
    return Object.values(p.effectComponents.components).every(function(c){return c.appliedFraction>=1-1e-10 && c.inheritedFraction===0 && c.blockedFraction===0;});
}
function projectEffectIssues(p){
    if(!p.effectComponents)return [];
    return Object.entries(p.effectComponents.components).filter(function(pair){return pair[1].blockedFraction>0 || pair[1].inheritedFraction>0;}).map(function(pair){return pair[0]+': '+(pair[1].reason || 'Realizimi historik nuk mund të vërtetohet.');});
}
function validateProjectEffectComponents(p){
    var e=p.effectComponents;if(e===undefined)return;
    function invalid(){throw Error('Gjendje e pavlefshme e komponentëve të efekteve: '+p.id);}
    if(!e || e.version!==1 || !['new_contract','legacy'].includes(e.origin) || !e.components || typeof e.components!=='object' || Array.isArray(e.components))invalid();
    var keys=projectEffectKeys(p),untouched=Object.values(e.components).every(function(c){return c.processedFraction===0;});
    var known=MUNICIPAL_EFFECT_METRICS.map(function(k){return 'metric:'+k;}).concat(['sector','satisfaction','relation','localSupport','publicSupport']);
    if(Object.keys(e.components).some(function(k){return !known.includes(k) || !keys.includes(k) && !untouched;}))invalid();
    keys.forEach(function(k){var c=e.components[k];if(!c){if(untouched && p.status==='IN_PROGRESS')return;invalid();}
        ['inheritedFraction','processedFraction','appliedFraction','blockedFraction'].forEach(function(f){if(!Number.isFinite(c[f]) || c[f]<0 || c[f]>1)invalid();});
        if(Math.abs(c.processedFraction-c.inheritedFraction-c.appliedFraction-c.blockedFraction)>1e-9 || e.origin==='new_contract' && c.inheritedFraction!==0 || c.reason!==undefined && typeof c.reason!=='string')invalid();
    });
    if(p.effectsApplied && e.origin==='new_contract' && !projectEffectsDelivered(p))invalid();
}

// Current fields remain canonical; missing observations are never inferred from UI text.
function validateCurrentIndicators(st,complete) {
    if(st.lastNorthSecurityOperationTurn!==undefined && (!Number.isInteger(st.lastNorthSecurityOperationTurn) || st.lastNorthSecurityOperationTurn<0 || st.lastNorthSecurityOperationTurn>st.turnCount))throw Error('Java e veprimit të sigurisë është e pavlefshme.');
    function numeric(object,key,min,max,required,label){
        var value=object[key];if(value===undefined && !required)return;
        if(!Number.isFinite(value) || min!==undefined && value<min || max!==undefined && value>max)
            throw Error('Tregues i pavlefshëm ose i munguar: '+(label || key));
    }
    ['gdpGrowth','unemployment','inflation','energyStability','securityNorth','remittancesB'].forEach(function(k){numeric(st,k,['unemployment','energyStability','securityNorth','remittancesB'].includes(k)?0:undefined,['unemployment','energyStability','securityNorth'].includes(k)?100:undefined,complete);});
    numeric(st,'approval',0,100,true);numeric(st,'budgetTotalB',0,undefined,true);numeric(st,'taxRevenueB',0,undefined,true);
    ['fiscalReserve','publicDebtPct','debtInterestRate','plannedRevenues','plannedExpenses','realizedRevenues','realizedExpenses'].forEach(function(k){numeric(st,k,0,undefined,complete);});
    if(st.taxPolicy)Object.keys(st.taxPolicy).forEach(function(k){numeric(st.taxPolicy,k,0,100,true,'taxPolicy.'+k);});
    var ids=new Set();(st.stateSectors || []).forEach(function(s){
        if(!s || typeof s.id!=='string' || ids.has(s.id))throw Error('Sektor i pavlefshëm ose i dyfishuar.');ids.add(s.id);
        numeric(s,'score',0,100,true,s.id+'.score');numeric(s,'costM',0,undefined,true,s.id+'.costM');
        if(typeof s.active!=='boolean' || s.effectsApplied!==undefined && typeof s.effectsApplied!=='boolean')throw Error('Status sektorial i pavlefshëm: '+s.id);
        if(!Number.isInteger(s.weeksTotal) || s.weeksTotal<1 || !Number.isInteger(s.weeksLeft) || s.weeksLeft<0 || s.weeksLeft>s.weeksTotal)throw Error('Afat sektorial i pavlefshëm: '+s.id);
    });
    Object.entries(st.municipalityProfiles || {}).forEach(function(pair){['infrastructure','services','employment','development','education','health','water','connectivity'].forEach(function(k){numeric(pair[1],k,1,10,false,pair[0]+'.'+k);});});
    var projectIds=new Set();(st.developmentProjects || []).forEach(function(p){
        if(!p || typeof p.id!=='string' || projectIds.has(p.id))throw Error('Projekt zhvillimor i pavlefshëm ose i dyfishuar.');projectIds.add(p.id);
        if(p.draftAuthorization!==undefined && !validGreenSpaceDraftAuthorization(p))throw Error('Autorizim drafti i pavlefshëm: '+p.id);
        var active=['IN_PROGRESS','DELAYED'].includes(p.status);
        numeric(p,'costM',0,undefined,active,p.id+'.costM');numeric(p,'progress',0,100,false,p.id+'.progress');
        if((active || p.weeksTotal!==undefined || p.weeksLeft!==undefined) && (!Number.isInteger(p.weeksTotal) || p.weeksTotal<1 || !Number.isInteger(p.weeksLeft) || p.weeksLeft<0 || p.weeksLeft>p.weeksTotal))throw Error('Afat projekti i pavlefshëm: '+p.id);
        if(p.effectsApplied!==undefined && typeof p.effectsApplied!=='boolean')throw Error('Shënues efektesh i pavlefshëm: '+p.id);
        if(p.fundingCommitted!==undefined && typeof p.fundingCommitted!=='boolean')throw Error('Financim i pavlefshëm: '+p.id);
        if(p.history!==undefined && !Array.isArray(p.history))throw Error('Historik projekti i pavlefshëm: '+p.id);
        if(p.benefits){if(typeof p.benefits!=='object' || Array.isArray(p.benefits) || p.benefits.muniGains && (typeof p.benefits.muniGains!=='object' || Array.isArray(p.benefits.muniGains)))throw Error('Përfitime projekti të pavlefshme: '+p.id);numeric(p.benefits,'sectorGain',0,undefined,false);Object.keys(p.benefits.muniGains || {}).forEach(function(k){numeric(p.benefits.muniGains,k,0,undefined,true,p.id+'.'+k);});}
        validateProjectEffectComponents(p);
    });
}
function migrateExistingEffects(st) {
    (st.developmentProjects || []).forEach(function(p){if(p.status==='COMPLETED' && p.effectsApplied===undefined)p.effectsApplied=true;});
    (st.stateSectors || []).forEach(function(s){if(Number.isInteger(s.completedTurn) && s.effectsApplied===undefined)s.effectsApplied=true;});
}

function validateLoadedState(st) {
    validatePoliticalEngagement(st);
    validateStrategicEconomy(st);
    function record(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
    function invalid(field) { throw new Error("Fusha e ruajtur është e pavlefshme: " + field); }
    if (!record(st) || !record(st.parties) || !Array.isArray(st.mps) ||
        !Array.isArray(st.laws) || typeof st.playerParty !== "string" ||
        !Object.prototype.hasOwnProperty.call(st.parties, st.playerParty)) {
        throw new Error("Gjendja e ruajtur është e pavlefshme");
    }
    validateElectoralListState(st);
    if(typeof validateDiaspora==='function')validateDiaspora(st);validateDiasporaMobilization(st);
    if(typeof validateUnions==='function')validateUnions(st);
    if(typeof validateRogueMinisters==='function')validateRogueMinisters(st);
    validateCabinetManagement(st);validateInstitutionalConflicts(st);validateNorthCrisis(st);validateInternalPressure(st);validateMediaDossiers(st);validateCouncilEurope(st);validateWinterEnergy(st);validateGeneralStrike(st);validateMunicipalGrants(st);validateAssociationUltimatum(st);validateEnterpriseBoards(st);
    if(typeof validateVeteransAudit==='function')validateVeteransAudit(st);validateVeteransBudget(st);validateCoalitionBlackmail(st);validateLaborExodus(st);validateDinarCrisis(st);validateBureauBattle(st);validatePersonnelRegistry(st);validateHighwayProject(st);validateHighwayElectionPolicies(st);validateSovereignFund(st);validateTrepca(st);validateRTK(st);validateEnergyInquiry(st);validateSectorExpansion(st);
    if(typeof validateBrusselsSpecial==='function')validateBrusselsSpecial(st);
    if(typeof validateLocalElections==='function')validateLocalElections(st);
    if(typeof validateIMFCrisis==='function')validateIMFCrisis(st);
    if(typeof validateMediaWarfare==='function')validateMediaWarfare(st);
    if(typeof validateUnionDemands==='function')validateUnionDemands(st);
    if(typeof validateSecurityCrises==='function')validateSecurityCrises(st);
    if(typeof validateJusticeReform==='function')validateJusticeReform(st);
    if(typeof validateLawImplementation==='function')validateLawImplementation(st);
    if(typeof validateInformalEconomy==='function')validateInformalEconomy(st);
    if(typeof validateLocalObstructions==='function')validateLocalObstructions(st);
    if(typeof validatePopulation==='function')validatePopulation(st);
    if(typeof validateStateEnterprises==='function')validateStateEnterprises(st);
    if(typeof validateIntelligenceAgency==='function')validateIntelligenceAgency(st);
    if(typeof validateNationalEmergencies==='function')validateNationalEmergencies(st);
    if(typeof validateInterestGroups==='function')validateInterestGroups(st);
    if(typeof validateConstitutionalCourt==='function')validateConstitutionalCourt(st);
    if(typeof validateElectoralAccountability==='function')validateElectoralAccountability(st);
    if(typeof validateGovernmentCrises==='function')validateGovernmentCrises(st);
    if(typeof validateOpposition==='function')validateOpposition(st);
    if(typeof validateCoalitionDemands==='function')validateCoalitionDemands(st);
    validateCurrentIndicators(st,false);
    ["year", "monthIndex", "week", "turnCount"].forEach(function(key) {
        if (!Number.isInteger(st[key])) invalid(key);
    });
    if (st.year < 1 || st.monthIndex < 0 || st.monthIndex > 11 || st.week < 1 || st.week > 4 || st.turnCount < 1) invalid("kalendari");
    ["budgetTotalB", "taxRevenueB", "approval"].forEach(function(key) {
        if (typeof st[key] !== "number" || !Number.isFinite(st[key])) invalid(key);
    });
    ["assemblyConstituted", "governmentFormed", "presidentElected"].forEach(function(key) {
        if (typeof st[key] !== "boolean") invalid(key);
    });
    ["speakerOfAssembly", "primeMinister"].forEach(function(key) {
        if (typeof st[key] !== "string") invalid(key);
    });
    ["coalitionParties", "ministries", "municipalities", "historyLog", "mediaFeed", "promises", "cabinetAgenda"].forEach(function(key) {
        if (!Array.isArray(st[key])) invalid(key);
    });
    Object.keys(st.parties).forEach(function(key) {
        var party = st.parties[key];
        if (!record(party) || !Number.isInteger(party.seats) || party.seats < 0 ||
            !Number.isFinite(party.poll) || !record(party.relations)) invalid("parties." + key);
        ["candidates", "reserves"].forEach(function(field) {
            if (typeof party[field] !== "undefined" && (!Array.isArray(party[field]) || party[field].some(function(item) { return !record(item); }))) invalid("parties." + key + "." + field);
        });
    });
    st.coalitionParties.forEach(function(key) {
        if (!Object.prototype.hasOwnProperty.call(st.parties, key)) invalid("coalitionParties");
    });
    st.mps.forEach(function(mp) {
        if (!record(mp) || typeof mp.name !== "string" || !Number.isInteger(mp.seatNumber) ||
            !Object.prototype.hasOwnProperty.call(st.parties, mp.party)) invalid("mps");
    });
    ["laws", "ministries", "municipalities"].forEach(function(key) {
        if (st[key].some(function(item) { return !record(item); })) invalid(key);
    });
    if (!record(st.diplomacy)) invalid("diplomacy");
    // These relationships are used directly by the existing UI and weekly simulation.
    ["USA", "EU", "GERMANY", "UK", "ALBANIA", "TURKEY"].forEach(function(key) {
        if (!record(st.diplomacy[key]) || !Number.isFinite(st.diplomacy[key].score)) invalid("diplomacy." + key);
    });
    ["coalitionAgreements", "dialogueAgreements", "dialogueRoundHistory", "dialogueNegotiationLog",
        "developmentProjects", "scheduledMeetings", "customInterlocutors", "pmInboxRequests", "stateSectors",
        "quorumPledgedParties", "motions", "weeklyDossiers", "fiscalHistory", "weeklyReports"].forEach(function(key) {
        if (typeof st[key] !== "undefined" && !Array.isArray(st[key])) invalid(key);
    });
    ["customPresCandidates", "dialogueConsultations", "municipalityProfiles", "sectorInitialScores",
        "sectorHistory", "chatHistories", "meetingScenes", "consultationSessions", "taxPolicy"].forEach(function(key) {
        if (typeof st[key] !== "undefined" && !record(st[key])) invalid(key);
    });
    ["electionCampaign", "dialogueInvitation", "dialogueProposal", "dialogueCounterOffer",
        "presidentialNegotiations", "brusselsRoundState", "pendingVote"].forEach(function(key) {
        if (typeof st[key] !== "undefined" && st[key] !== null && !record(st[key])) invalid(key);
    });
    ["electionPhase", "institutionalPhase", "governmentStatus"].forEach(function(key) {
        if (typeof st[key] !== "undefined" && typeof st[key] !== "string") invalid(key);
    });
    ["speakerElected", "presidentialElectionInProgress", "cabinetApproved"].forEach(function(key) {
        if (typeof st[key] !== "undefined" && typeof st[key] !== "boolean") invalid(key);
    });
    if (typeof st.stateSchemaVersion !== "undefined" && (!Number.isInteger(st.stateSchemaVersion) || st.stateSchemaVersion < 1 || st.stateSchemaVersion > STATE_SCHEMA_VERSION)) invalid("stateSchemaVersion");
    validateCampaignState(st);
    validateElectionDayState(st);
    validateElectionPreparation(st);
    validateCountConfiguration(st);
    validateAssemblyState(st);
    validateDeputyMandates(st);
    validateInternationalDiplomacy(st);
    validateUrgentSituations(st);
    validateAgreementDocuments(st);
    validateDiplomaticReport(st);
    validatePoliticalScenes(st);
    validateWeekCalendar(st);
    if(typeof validateMandateExperience==='function')validateMandateExperience(st);
    if(typeof validateConstitutionDarkPolitics==='function')validateConstitutionDarkPolitics(st);
    if(typeof validateBilateralTrade==='function')validateBilateralTrade(st);
    if(typeof validateStreetProtests==='function')validateStreetProtests(st);
    if(typeof validateSecurityOps==='function')validateSecurityOps(st);
    if(typeof validateForeignInvestments==='function')validateForeignInvestments(st);
    if(typeof validateSectorManagement==='function')validateSectorManagement(st);
    validateWeeklyAgenda(st);
    validateLawNegotiations(st);
    validatePublicSupport(st);
    validatePresidency(st);
    validatePublicFinance(st);
    validateConstituentState(st);
    validateGovernmentFormation(st);validateGovernmentFormationTalk(st);
    st.municipalities.forEach(function(item) {
        if (typeof item.projects !== "undefined" && !Array.isArray(item.projects)) invalid("municipalities.projects");
    });
    ["parliamentSessions", "parliamentarySessions"].forEach(function(key) {
        if (typeof st[key] !== "undefined" && (!Array.isArray(st[key]) || st[key].some(function(session) {
            return !record(session) || ["billIds", "results"].some(function(field) {
                return typeof session[field] !== "undefined" && !Array.isArray(session[field]);
            });
        }))) invalid(key);
    });
    if (st.pendingVote) {
        var pending = st.pendingVote;
        var keys = ["pro", "kunder", "abstenim", "mungese"];
        if (!pending.finalized || !pending.data || keys.some(function(key) {
            return !Number.isInteger(pending.data[key]) || pending.data[key] < 0;
        }) || keys.reduce(function(sum, key) { return sum + pending.data[key]; }, 0) !== 120) {
            throw new Error("Votimi i ruajtur është i pavlefshëm");
        }
        if (pending.progress) {
            var counters = ["Pro", "Kunder", "Abstenim", "Mungese"];
            if (counters.some(function(key, i) {
                var count = pending.progress["current" + key];
                return !Number.isInteger(count) || count < 0 || count > pending.data[keys[i]];
            }) || counters.reduce(function(sum, key) { return sum + pending.progress["current" + key]; }, 0) !== pending.progress.totalCounted) {
                throw new Error("Progresi i votimit është i pavlefshëm");
            }
        }
        if(pending.governmentNotice && typeof validateGovernmentNotice==='function')validateGovernmentNotice(pending.governmentNotice);
    }
}

function mergeParliamentSessions(st) {
    var merged = [];
    (st.parliamentarySessions || []).concat(st.parliamentSessions || []).forEach(function(session) {
        var existing = merged.find(function(item) {
            return session.id ? item.id === session.id : JSON.stringify(item) === JSON.stringify(session);
        });
        if (!existing) { merged.push(session); return; }
        Object.keys(session).forEach(function(key) {
            if (typeof existing[key] === "undefined") existing[key] = session[key];
        });
        existing.billIds = Array.from(new Set((existing.billIds || []).concat(session.billIds || [])));
        existing.results = (existing.results || []).concat(session.results || []).filter(function(result, index, all) {
            return all.findIndex(function(item) { return JSON.stringify(item) === JSON.stringify(result); }) === index;
        });
        if (session.status === "COMPLETED") existing.status = "COMPLETED";
    });
    st.parliamentarySessions = merged;
    delete st.parliamentSessions;
    st.sessionCounter = Math.max(st.sessionCounter || 0, ...merged.map(function(item) { return item.number || 0; }));
}

function runAllMigrations(st) {
    validateLoadedState(st);
    migrateStateForDataFoundation(st);
    mergeParliamentSessions(st);
    migrateStateForFaza6(st);
    migrateStateForFaza7(st);
    migrateStateForFaza8(st);
    migrateStateForFaza9(st);
    migrateStateForFaza11(st);
    migrateStateForFazaRe(st);
    migrateElectoralLists(st);
    migrateCampaignState(st);
    migrateElectionDayState(st);
    migrateAssemblyState(st);
    migrateConstituentState(st);
    reconcilePostElection(st);
    migrateDeputyMandates(st);
    migrateCandidateGenderEvidence(st);
    migrateInternationalDiplomacy(st);
    migrateWeekCalendar(st);
    migrateWeeklyAgenda(st);
    migrateLawNegotiations(st);
    migratePublicSupport(st);
    if(typeof migrateInterestGroups==='function')migrateInterestGroups(st);
    if(typeof migrateConstitutionalCourt==='function')migrateConstitutionalCourt(st);
    if(typeof migrateElectoralAccountability==='function'){migrateElectoralAccountability(st);ensureRegularCampaign(st);}
    migratePresidency(st);
    migratePublicFinance(st);
    if(typeof migrateDiaspora==='function')migrateDiaspora(st);
    if(typeof migrateUnions==='function')migrateUnions(st);
    if(typeof migrateRogueMinisters==='function')migrateRogueMinisters(st);
    migrateInstitutionalConflicts(st);migrateNorthCrisis(st);migrateInternalPressure(st);migrateMediaDossiers(st);migrateCouncilEurope(st);migrateWinterEnergy(st);migrateGeneralStrike(st);migrateMunicipalGrants(st);migrateAssociationUltimatum(st);
    if(typeof migrateVeteransAudit==='function')migrateVeteransAudit(st);migrateVeteransBudget(st);migrateCoalitionBlackmail(st);migrateLaborExodus(st);migrateDinarCrisis(st);migratePersonnelRegistry(st);migrateHighwayProject(st);
    if(typeof migrateBrusselsSpecial==='function')migrateBrusselsSpecial(st);
    if(typeof migrateLocalElections==='function')migrateLocalElections(st);
    if(typeof migrateIMFCrisis==='function')migrateIMFCrisis(st);
    if(typeof migrateMediaWarfare==='function')migrateMediaWarfare(st);
    if(typeof migrateSecurityCrises==='function')migrateSecurityCrises(st);
    if(typeof migrateJusticeReform==='function')migrateJusticeReform(st);
    if(typeof migrateLawImplementation==='function')migrateLawImplementation(st);
    if(typeof migrateInformalEconomy==='function')migrateInformalEconomy(st);
    if(typeof migrateLocalObstructions==='function')migrateLocalObstructions(st);
    if(typeof migratePopulation==='function')migratePopulation(st);
    if(typeof migrateStateEnterprises==='function')migrateStateEnterprises(st);migrateEnterpriseBoards(st);migrateSovereignFund(st);migrateTrepca(st);migrateSectorExpansion(st);
    if(typeof migrateNationalEmergencies==='function')migrateNationalEmergencies(st);
    if(typeof migrateGovernmentCrises==='function')migrateGovernmentCrises(st);
    if(typeof migrateOpposition==='function')migrateOpposition(st);
    if(typeof migrateForeignInvestments==='function')migrateForeignInvestments(st);
    migrateGovernmentCatalog(st);
    migrateMunicipalDevelopment(st);
    migrateElectionPreparation(st);
    migrateUrgentSituations(st);
    migrateExistingEffects(st);
    municipal14Records(st).filter(function(p){return p.fundingCommitted;}).forEach(function(p){ensureProjectEffectComponents(p);});
    (st.developmentProjects||[]).filter(function(p){return p.benefits && p.status!=='PROPOSED';}).forEach(function(p){ensureProjectEffectComponents(p);});
    validateCurrentIndicators(st,true);
}

/* VAZHDON në pjesën 3/6 */
/* ============================================================================
   11. FUNKSIONET E INICIALIZIMIT DHE EKRANIT FILLESTAR
   ============================================================================ */
function showStartScreen() {
    document.getElementById('startMenuContent').hidden = false;
    document.getElementById('startAuthStep').hidden = true;
    var ss = document.getElementById("startScreen");
    if (ss) ss.classList.remove("hidden");
    document.body.classList.add("start-screen-active");
}

function hideStartScreen() {
    var ss = document.getElementById("startScreen");
    if (ss) ss.classList.add("hidden");
    document.body.classList.remove("start-screen-active");
}

function startNewGameFromScreen() {
    window.republikaNewGameRequested=true;
    window.republikaResumeAfterLogin = false;
    if(window.republikaGuestSession){
        if(!window.republikaSimulationReady){window.republikaLandingIntent='guest-new';return;}
        window.republikaNewGameRequested=false;
        window.republikaCloudGame.beginNewGame();return;
    }
    if(!window.republikaSimulationReady)window.republikaLandingIntent='new';
    showStartScreen();
    document.getElementById('startMenuContent').hidden = true;
    document.getElementById('startAuthStep').hidden = false;
    var login = document.getElementById('startGoogleLoginBtn');
    var next = document.getElementById('startAuthenticatedContinueBtn');
    next.textContent = 'Vazhdo me lojë të re';
    (login.hidden ? next : login).focus();
}

function continueLocalGameFromScreen() {
    hideStartScreen();
    refreshAllUI();
    resumePendingVote();
}

function loadGameFromScreen() {
    hideStartScreen();
    toggleModal("saveModal", true);
}

function initApp() {
    renderSetupModalParties();
    var saved;
    try { saved = localStorage.getItem(STORAGE_KEY_AUTO); }
    catch (e) { reportSaveError(e); }
    if (saved) {
        try {
            var loaded = prepareLoadedState(JSON.parse(saved));
            state = loaded;

            document.getElementById("setupModal").classList.remove("show");
            document.getElementById('continueLocalGameBtn').hidden = false;
            showStartScreen();completeLandingBoot();
            return;
        } catch (e) { reportSaveError(e); }
    }
    state = createFreshState("REALITY_OCT2026", "LVV");
    // Render the game when the player continues/starts/loads, not behind the splash.
    showStartScreen();completeLandingBoot();
}

function renderSetupModalParties() {
    var keys = ["LVV", "PDK", "LDK", "AAK", "NISMA", "MIN_MULTI"];
    var container = document.getElementById("partySelectContainer");
    if (!container) return;
    container.innerHTML = keys.map(function(k) {
        var p = INITIAL_POLITICAL_DB.parties[k] || createNismaListParty();
        return '<button class="choice-btn" onclick="startScenarioWithParty(\'' + k + '\')">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; width:100%;">' +
                '<span class="choice-title">' + p.name + '</span>' +
                '<span class="tag ' + p.tagClass + '">' + (k === "NISMA" ? PROVIDED_CANDIDATE_LISTS.NISMA.length + ' kandidatë · menaxhim liste' : p.seats + ' Ulëse (' + p.poll + '%)') + '</span>' +
            '</div>' +
            '<span class="choice-impact">Lider: ' + p.leader + ' • Ideologjia: ' + p.ideology + '</span>' +
        '</button>';
    }).join("");
}

function startScenarioWithParty(partyKey) {
    if(typeof resetGovernmentNotifications==='function')resetGovernmentNotifications();
    var modeRadio = document.querySelector('input[name="gameMode"]:checked');
    var mode = modeRadio ? modeRadio.value : "REALITY_OCT2026";
    state = createFreshState(mode, partyKey);
    initializeMandateExperience(state);
    initializeConstitutionPolitics(state);
    initializeStreetProtests(state);
    clearInterval(votingAnimInterval);
    currentVotingData = null;
    _voteInProgress = false;
    toggleModal("votingModal", false);
    saveGameAuto();
    document.getElementById("setupModal").classList.remove("show");
    hideStartScreen();
    refreshAllUI();
    showToast("Fillohet loja me " + state.parties[partyKey].short + "!");
}

function startCustomParty() {
    if(typeof resetGovernmentNotifications==='function')resetGovernmentNotifications();
    var pName = document.getElementById("customPartyName").value.trim() || "Alternativa e Re";
    var lName = document.getElementById("customLeaderName").value.trim() || "Lider i Ri";
    var modeRadio = document.querySelector('input[name="gameMode"]:checked');
    var mode = modeRadio ? modeRadio.value : "ALT_POST_ELECTION";
    state = createFreshState(mode, "LVV", { partyName: pName, leaderName: lName });
    initializeStreetProtests(state);
    initializeConstitutionPolitics(state);
    initializeMandateExperience(state);
    clearInterval(votingAnimInterval);
    currentVotingData = null;
    _voteInProgress = false;
    toggleModal("votingModal", false);
    saveGameAuto();
    document.getElementById("setupModal").classList.remove("show");
    hideStartScreen();
    refreshAllUI();
}

function openNewScenarioModal() {
    toggleModal("saveModal", false);
    var closeBtn = document.getElementById("closeSetupBtn");
    if (closeBtn) closeBtn.style.display = "inline-block";
    document.getElementById("setupModal").classList.add("show");
}

function closeSetupIfLoaded() {
    document.getElementById("setupModal").classList.remove("show");
}

function toggleModal(id, show) {
    var el = document.getElementById(id);
    if (!el) return;
    if (show) {
        if (id === "saveModal") renderSaveSlots();
        el.classList.add("show");
        if(state)applyPoliticalActionGuards(el);
        if(typeof uiEnhanceDetails==='function')uiEnhanceDetails(el);
    } else {
        el.classList.remove("show");
        if(state && typeof scheduleUrgentNotification==='function')scheduleUrgentNotification();
    }
}

/* ============================================================================
   12. PËRDITËSIMI I TOP BAR
   ============================================================================ */
function updateTopBar() {
    var p = state.parties[state.playerParty];

    var roleEl = document.getElementById("roleDisplay");
    if (roleEl) roleEl.textContent = getPlayerRoleLabel() + " • Legjislatura XI";

    var dateEl = document.getElementById("dateDisplay");
    if (dateEl) dateEl.textContent = MONTHS_SQ[state.monthIndex] + " " + state.year + " • Java " + state.week;

    var pendingMeets = (state.scheduledMeetings || []).filter(function(m) { return m.status === "SCHEDULED"; }).length;
    var pendingReqs = (state.pmInboxRequests || []).filter(r=>agendaActive(r)&&politicalAgendaAuthorized(r)).length;

    var calBtn = document.getElementById("calendarTopBtn");
    if (calBtn) calBtn.textContent = "📅 Kalendari (" + pendingMeets + ")";

    var inboxBtn = document.getElementById("inboxTopBtn");
    if (inboxBtn) inboxBtn.textContent = "📥 Kërkesat (" + pendingReqs + ")";

    var appEl = document.getElementById("statApproval");
    if (appEl) {
        var visibleSupport=playerPoliticalSupport(state);appEl.textContent = visibleSupport.toFixed(1) + "%";
        var supportLabel=document.querySelector('.stat-approval .stat-label');if(supportLabel){supportLabel.textContent=agendaExecutive(state)?'Miratimi i Qeverisë':'Mbështetja e partisë';supportLabel.title='Sondazhi i partisë dhe miratimi i Qeverisë janë tregues të ndarë.';}
        appEl.style.color = visibleSupport >= 45 ? "var(--success)" : (visibleSupport >= 32 ? "var(--accent-gold)" : "var(--danger)");
    }

    var seatEl = document.getElementById("statSeats");
    if (seatEl) {
        seatEl.textContent = getCoalitionSeats() + " / 120";
        seatEl.style.color = getCoalitionSeats() >= 61 ? "var(--accent-gold)" : "var(--danger)";
    }

    var budEl = document.getElementById("statBudget");
    if (budEl) budEl.textContent = "€" + state.budgetTotalB.toFixed(2) + " Mld";

    var econEl = document.getElementById("statEconomy");
    if (econEl) econEl.textContent = (state.gdpGrowth>=0?"+":"") + state.gdpGrowth + "% | " + state.unemployment + "%";

    var avgDip = Math.round((state.diplomacy.USA.score + state.diplomacy.EU.score + state.diplomacy.GERMANY.score) / 3);
    var intlEl = document.getElementById("statIntl");
    if (intlEl) intlEl.textContent = avgDip + " / 100";

    var constEl = document.getElementById("statConstStatus");
    if (constEl) {
        var phase = state.institutionalPhase || INSTITUTIONAL_PHASES.GOV_IN_OFFICE;
        var statusTxt = "Stabil";
        var statusCol = "var(--success)";
        if (phase === INSTITUTIONAL_PHASES.GOV_IN_OFFICE) { statusTxt = "Stabil"; statusCol = "var(--success)"; }
        else if (phase === INSTITUTIONAL_PHASES.GOV_APPROVED) { statusTxt = "Qeveri e Miratuar"; statusCol = "var(--success)"; }
        else if (phase === INSTITUTIONAL_PHASES.GOV_VOTING) { statusTxt = "Qeveri në Votim"; statusCol = "var(--warning)"; }
        else if (phase === INSTITUTIONAL_PHASES.GOV_OVERTHROWN) { statusTxt = "Qeveri e Rrëzuar"; statusCol = "var(--danger)"; }
        else if (phase === INSTITUTIONAL_PHASES.SNAP_ELECTION) { statusTxt = "Zgjedhje të Reja"; statusCol = "var(--danger)"; }
        else if (phase === INSTITUTIONAL_PHASES.PRESIDENT_ELECTED) { statusTxt = "President i Zgjedhur"; statusCol = "var(--warning)"; }
        else if (phase === INSTITUTIONAL_PHASES.SPEAKER_ELECTED) { statusTxt = "Kuvend — Kryetar i Zgjedhur"; statusCol = "var(--warning)"; }
        else if (phase === INSTITUTIONAL_PHASES.ASSEMBLY_ELECTED) { statusTxt = "Kuvend i Konstituuar"; statusCol = "var(--warning)"; }
        else { statusTxt = "Në Proces Konstituimi"; statusCol = "var(--warning)"; }
        if (!state.governmentFormed && phase !== INSTITUTIONAL_PHASES.GOV_OVERTHROWN && phase !== INSTITUTIONAL_PHASES.SNAP_ELECTION) {
            statusTxt = "Pa Qeveri";
            statusCol = "var(--warning)";
        }
        if(northSanctioned(state)){statusTxt=statusTxt==='Stabil'?'Sanksione financiare':statusTxt+' · Sanksione';statusCol='var(--danger)';}
        constEl.textContent = statusTxt;
        constEl.style.color = statusCol;
    }
}

/* ============================================================================
   13. REFRESH ALL UI
   ============================================================================ */
function refreshAllUI(){return refreshVisibleGameUI();}
function refreshAllPanelsLegacy() {
    if (!state) return;
    var securityTab=['war','intelligence','investments'].find(function(key){return document.getElementById('gov-'+key)?.style.display==='block';});
    fiscalSyncBudgetStatuses();
    updateTopBar();
    if (typeof renderDashboard === "function") renderDashboard();
    if (typeof renderPartySection === "function") renderPartySection();
    if (typeof renderAssemblySection === "function") renderAssemblySection();
    renderConstituentSession();
    if (typeof renderGovernmentSection === "function") renderGovernmentSection();
    if (typeof renderElectionsSection === "function") renderElectionsSection();
    if (typeof renderDiplomacySection === "function") renderDiplomacySection();
    renderInternationalDiplomacy();
    renderAgreementArchive();
    renderDiplomaticReport();
    notifyDiplomaticReport();
    if(state.activePressSession)renderCurrentPressQuestion();
    renderStateCalendar();
    if(!weeklyProcessing)reconcileWeeklyTransition();
    if (typeof renderFiscalPanel === "function") renderFiscalPanel();
    if (typeof renderDevelopmentPanel === "function") renderDevelopmentPanel();
    if (typeof renderWeeklyDossiers === "function") renderWeeklyDossiers();
    renderWeeklyAgenda();
    renderGovernmentCatalog();
    renderPoliticalRoleUI();renderPostElectionInvitation();reconcileGovernmentNotificationAudience();
    renderUrgentSituations();
    saveGameAuto();
    if(typeof renderMandateExperience==='function')renderMandateExperience();
    if(typeof renderConstitutionPolitics==='function')renderConstitutionPolitics();
    if(typeof renderBilateralTrade==='function')renderBilateralTrade();
    if(typeof renderStreetProtests==='function')renderStreetProtests();
    if(typeof renderSecurityOps==='function')renderSecurityOps();
    if(typeof renderForeignInvestments==='function')renderForeignInvestments();
    if(typeof renderSectorManagement==='function')renderSectorManagement();
    if(securityTab){var securityPill=Array.from(document.querySelectorAll('#tab-government .sub-pill')).find(function(button){return button.getAttribute('onclick')?.includes("'"+securityTab+"'");});if(securityPill)switchSubTab('gov',securityTab,securityPill);}
    if(typeof uiEnhanceDetails==='function')uiEnhanceDetails(document);
}

/* ============================================================================
   14. FUSHATA DHE DOSJET JAVORE (Pika 8)
   ============================================================================ */

function generateWeeklyDossiers() { return processWeeklyAgenda(); }

function buildDossierFromTemplate(tpl) {
    if (!tpl) return null;
    var dossier = {
        id: "dos_" + Date.now() + "_" + Math.floor(Math.random() * 9999),
        templateId: tpl.id,
        category: tpl.category,
        urgency: tpl.urgency,
        status: "PENDING",
        deadlineWeeks: 2 + Math.floor(Math.random() * 2),
        createdWeek: state.turnCount,
        outcomeMsg: ""
    };

    if (tpl.senderRole === "MINISTER") {
        var minister = state.ministries[Math.floor(Math.random() * state.ministries.length)];
        dossier.senderName = minister.minister;
        dossier.senderRole = "Ministër (" + minister.name.replace("Ministria e ", "") + ")";
        dossier.title = tpl.titleTemplate.replace("{ministry}", minister.name.replace("Ministria e ", "")).replace("{issue}", minister.currentIssue || "prioritetet javore");
        dossier.desc = tpl.descTemplate.replace("{ministry}", minister.name);
        dossier.consequenceText = tpl.consequenceTemplate;
        dossier.options = tpl.options.map(function(o) {
            return Object.assign({}, o);
        });
    } else if (tpl.senderRole === "MAYOR") {
        var muni = state.municipalities[Math.floor(Math.random() * state.municipalities.length)];
        dossier.senderName = muni.mayorName;
        dossier.senderRole = "Kryetar i Komunës së " + muni.name;
        dossier.title = tpl.titleTemplate.replace("{municipality}", muni.name).replace("{issue}", muni.issue);
        dossier.desc = tpl.descTemplate.replace("{municipality}", muni.name);
        dossier.consequenceText = tpl.consequenceTemplate;
        dossier.options = tpl.options.map(function(o) {
            var copy = Object.assign({}, o);
            copy.municipalityId = muni.id;
            return copy;
        });
    } else if (tpl.senderRole === "SPEAKER") {
        dossier.senderName = state.speakerOfAssembly || "Kryetari i Kuvendit";
        dossier.senderRole = "Kryetar i Kuvendit të Kosovës";
        var topics = ["Buxheti vjetor", "Dialogu me Beogradin", "Siguria në veri", "Reformat në drejtësi"];
        var topic = topics[Math.floor(Math.random() * topics.length)];
        dossier.title = tpl.titleTemplate.replace("{topic}", topic);
        dossier.desc = tpl.descTemplate.replace("{topic}", topic);
        dossier.consequenceText = tpl.consequenceTemplate;
        dossier.options = tpl.options.map(function(o) { return Object.assign({}, o); });
    } else if (tpl.senderRole === "AMBASSADOR") {
        var countries = ["SHBA", "Bashkimi Evropian", "Gjermania", "Mbretëria e Bashkuar"];
        var country = countries[Math.floor(Math.random() * countries.length)];
        var countryTopics = ["Dialogu në Bruksel", "Plani i Rritjes", "Siguria në veri", "Reformat ekonomike"];
        var cTopic = countryTopics[Math.floor(Math.random() * countryTopics.length)];
        dossier.senderName = "Ambasadori i " + country;
        dossier.senderRole = "Përfaqësues diplomatik";
        dossier.title = tpl.titleTemplate.replace("{country}", country).replace("{topic}", cTopic);
        dossier.desc = tpl.descTemplate.replace("{country}", country).replace("{topic}", cTopic);
        dossier.consequenceText = tpl.consequenceTemplate.replace("{country}", country);
        dossier.options = tpl.options.map(function(o) { return Object.assign({}, o); });
    } else if (tpl.senderRole === "ADVISOR") {
        dossier.senderName = "Këshilltarët e Kryeministrit";
        dossier.senderRole = "Kabineti i Kryeministrit";
        var aTopics = ["Strategjia e komunikimit", "Prioritetet legjislative", "Menaxhimi i krizave", "Marrëdhëniet me opozitën"];
        var aTopic = aTopics[Math.floor(Math.random() * aTopics.length)];
        dossier.title = tpl.titleTemplate.replace("{topic}", aTopic);
        dossier.desc = tpl.descTemplate.replace("{topic}", aTopic);
        dossier.consequenceText = tpl.consequenceTemplate;
        dossier.options = tpl.options.map(function(o) { return Object.assign({}, o); });
    } else {
        return null;
    }

    return dossier;
}

function renderWeeklyDossiers() {
    var container = document.getElementById("weeklyDossiersContainer");
    if (!container) return;

    if (!agendaExecutive()) {
        container.innerHTML = '<div style="padding:14px; background:#0f172a; border-radius:8px; font-size:0.82rem; color:var(--text-muted);">' +
            'Ju jeni në opozitë ose në tranzicion. Dosjet javore të Kryeministrit nuk janë në juridiksionin tuaj.' +
        '</div>';
        return;
    }

    var dossiers = (state.weeklyDossiers || []).filter(function(d) { return d.status === "PENDING"; });

    if (dossiers.length === 0) {
        container.innerHTML = '<div style="padding:14px; background:#0f172a; border-radius:8px; font-size:0.82rem; color:var(--text-muted);">' +
            'Nuk ka dosje të reja në tavolinë. Dosjet e reja do të vijnë javë pas jave.' +
        '</div>';
        return;
    }

    dossiers.sort(function(a, b) {
        var urgOrder = { "E LARTË": 0, "MESATARE": 1, "E ULËT": 2 };
        return (urgOrder[a.urgency] || 1) - (urgOrder[b.urgency] || 1);
    });

    container.innerHTML = dossiers.map(function(d) {
        var realIdx = state.weeklyDossiers.findIndex(function(x) { return x.id === d.id; });
        var borderCol = d.urgency === "E LARTË" ? "var(--danger)" : (d.urgency === "MESATARE" ? "var(--accent-gold)" : "var(--accent-blue)");
        var urgCls = d.urgency === "E LARTË" ? "tag-lvv" : (d.urgency === "MESATARE" ? "tag-gold" : "tag-pdk");
        return '<div class="card" style="background:#0f172a; margin-bottom:8px; border-left:4px solid ' + borderCol + ';">' +
            '<div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:6px; margin-bottom:6px;">' +
                '<div>' +
                    '<span class="tag ' + urgCls + '">' + d.category + ' • ' + d.urgency + '</span>' +
                    '<h4 style="font-size:0.88rem; margin-top:4px;">' + d.title + '</h4>' +
                    '<div style="font-size:0.73rem; color:var(--accent-gold);">Nga: <strong>' + d.senderName + '</strong> (' + d.senderRole + ')</div>' +
                '</div>' +
                '<span class="tag tag-pdk">Afati: ' + d.deadlineWeeks + ' javë</span>' +
            '</div>' +
            '<p style="font-size:0.78rem; color:#cbd5e1; margin-bottom:6px;">' + d.desc + '</p>' +
            '<div style="font-size:0.72rem; color:var(--danger); margin-bottom:8px;">⚠️ ' + publicSupportConsequence(d.consequenceText) + '</div>' +
            '<button class="action-btn btn-gold" onclick="openWeeklyDossierModal(' + realIdx + ')">🗂️ Hap Dosjen & Merr Vendim ▶</button>' +
        '</div>';
    }).join("");
}

function openWeeklyDossierModal(dossierIdx) {
    if (!agendaExecutive()) {
        showToast("Dosjet e Kryeministrit janë vetëm për Qeverinë në detyrë.");
        return;
    }
    var d = state.weeklyDossiers[dossierIdx];
    if (!d || d.status !== "PENDING") return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var optsHtml = d.options.map(function(opt, oIdx) {
        var costM = ((opt.costB || 0) * 1000).toFixed(0);
        return '<button class="choice-btn" onclick="resolveWeeklyDossier(' + dossierIdx + ', ' + oIdx + ')">' +
            '<span class="choice-title">' + (oIdx + 1) + '. ' + opt.label + '</span>' +
            '<span class="choice-impact">' + (costM > 0 ? ('Kosto: €' + costM + 'M | ') : '') + publicSupportReaction(opt.appDelta || 0) + '</span>' +
        '</button>';
    }).join("");

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🗂️ Dosje: ' + d.senderName + '</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="font-size:0.76rem; color:var(--accent-gold); margin-bottom:6px;">' + d.senderRole + ' • ' + d.category + ' (Afati: ' + d.deadlineWeeks + ' javë)</div>' +
        '<h3 style="font-size:0.98rem; margin-bottom:8px;">' + d.title + '</h3>' +
        '<div class="chat-bubble chat-them"><strong>' + d.senderName + ':</strong> "' + d.desc + '"</div>' +
        '<div style="font-size:0.75rem; color:var(--danger); margin-bottom:12px;">⚠️ Pasojat e mosveprimit: ' + publicSupportConsequence(d.consequenceText) + '</div>' +
        '<div style="display:flex; flex-direction:column; gap:7px;">' +
            optsHtml +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function resolveWeeklyDossier(dossierIdx, optIdx) {
    if (!agendaExecutive()) {
        showToast("Nuk keni autoritet ekzekutiv.");
        return;
    }
    var d = state.weeklyDossiers[dossierIdx];
    if (!d || d.status !== "PENDING") return;
    var opt = d.options[optIdx];
    if (!opt) return;

    var costB = opt.costB === undefined ? 0 : opt.costB;
    var check = checkFinancialConstraint(costB, "dosjen \"" + d.title + "\"");
    if (!check.allowed) {
        showToast("❌ " + check.message);
        return;
    }
    if(!agendaCommit(function(){
    if (check.useReserve) {
        fiscalSetBalance(state,"fiscalReserve",+(state.fiscalReserve - check.shortfall).toFixed(9),"resolveWeeklyDossier");
    }
    if (costB > 0) {
        fiscalSetBalance(state,"budgetTotalB",+(Math.max(0, state.budgetTotalB - costB)).toFixed(9),"resolveWeeklyDossier");
    }

    adjustPublicSupport(((opt.appDelta || 0)), {source:"resolveWeeklyDossier"}, state);

    if (opt.dipBonus) {
        state.diplomacy.USA.score = clamp(state.diplomacy.USA.score + opt.dipBonus, 10, 100);
        state.diplomacy.EU.score = clamp(state.diplomacy.EU.score + opt.dipBonus, 10, 100);
    }

    if (opt.municipalityId) {
        var muni = state.municipalities.find(function(m) { return m.id === opt.municipalityId; });
        if (muni) muni.relationWithGov = clamp((muni.relationWithGov || 60) + 10, 0, 100);
    }

    d.status = "COMPLETED";
    d.completedTurn=state.turnCount;
    d.outcomeMsg = opt.outcome || "Vendimi u mor.";

    addMediaNews("Kryeministria / RTK", "Kryeministri shqyrtoi dosjen e " + d.senderName + ": " + d.outcomeMsg, "POSITIVE");
    }))return false;
    toggleModal("interactiveActionModal", false);
    showToast("Vendimi u regjistrua: " + d.outcomeMsg);
    return true;
}

/* ============================================================================
   15. KABINETI PARA VOTIMIT TË QEVERISË (Pika 3)
   ============================================================================ */

function openCabinetSelectionModal() {
    if (!constituentGovernmentGate()) return false;
    if (state.mandatar !== state.playerParty) {
        showToast("Vetëm Mandatari mund të formojë kabinetin para votimit.");
        return;
    }
    if (!state.assemblyConstituted || !state.speakerElected) {
        showToast("Kuvendi duhet të konstituohet dhe të zgjidhet Kryetari para formimit të kabinetit.");
        return;
    }

    if (!state.cabinetProposal) {
        state.cabinetProposal = buildDefaultCabinetProposal();
    }

    renderCabinetSelectionModal();
}

function buildDefaultCabinetProposal() {
    var proposal = [];
    var mandatarParty = state.mandatar;
    var catalogue=getCandidateCatalogue(state);

    state.ministries.forEach(function(min, i) {
        var partnerSeats=(state.coalitionAgreements||[]).filter(a=>a.partner!==mandatarParty&&state.coalitionParties.includes(a.partner)&&a.ministriesCount>0),assigned=partnerSeats.flatMap(a=>Array(Math.min(state.ministries.length,a.ministriesCount)).fill(a.partner));
        var owner=assigned[i]||mandatarParty,pool=cabinetCandidateRegistry(state,owner,catalogue).filter(c=>!cabinetReservedName(state,c.name)&&!proposal.some(m=>cabinetIdentity(m.ministerName)===cabinetIdentity(c.name)));
        var cand=pool[0];
        proposal.push({
            ministryId: min.id,
            ministryName: min.name,
            party: owner,
            ministerName: cand ? cand.name : '',
            competence: cand ? Math.min(95, (cand.loyalty||75) + 5) : 85,
            loyalty: cand ? (cand.loyalty||75) : 90,
            isCustom: false
        });
    });
    return proposal;
}

function renderCabinetSelectionModal() {
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var proposal = state.cabinetProposal || [];

    var partnerParties = state.coalitionParties.filter(function(p) { return p !== state.mandatar; });

    var rowsHtml = proposal.map(function(item, idx) {
        if(item.party!==state.playerParty)return '<div class="card"><strong>'+catalogEscape(item.ministryName)+'</strong><p>Emërimi i takon partnerit '+catalogEscape(state.parties[item.party]?.short||item.party)+'</p><span>'+catalogEscape(item.ministerName)+'</span></div>';
        var partyObj = state.parties[item.party];
        var partyTag = partyObj ? '<span class="tag ' + partyObj.tagClass + '">' + partyObj.short + '</span>' : '<span class="tag tag-sl">Bosh</span>';
        return '<div style="background:#0f172a; padding:8px 10px; border-radius:8px; margin-bottom:6px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:6px;">' +
                '<strong style="font-size:0.8rem;">' + item.ministryName.replace("Ministria e ", "M. ") + '</strong>' +
                partyTag +
            '</div>' +
            '<div style="font-size:0.74rem; color:var(--text-muted); margin-bottom:6px;">' +
                'Ministër: <strong style="color:#fff;">' + electoralEscape(candidateDisplayName({name:item.ministerName},item.party)) + '</strong> • Kompetenca: ' + item.competence + '/100 • Besnikëria: ' + item.loyalty + '%' +
            '</div>' +
            '<div style="display:flex; gap:4px; flex-wrap:wrap;">' +
                '<button class="btn-top" onclick="cycleCabinetMinister(' + idx + ')" style="font-size:0.72rem;">🔄 Ndrysho emrin</button>' +
                '<label>Emëro deputet të këtij subjekti<select data-cabinet-deputy="'+idx+'" onchange="chooseCabinetDeputy('+idx+',this.value)"><option value="">Zgjidhni deputetin</option>'+cabinetDeputyOptions(item.party).filter(mp=>cabinetNomineeAvailable(state,mp.name,proposal,idx)).map(function(mp){return '<option value="'+mp.seatNumber+'">'+electoralEscape(candidateDisplayName(mp))+'</option>';}).join('')+'</select></label>' +
            '</div>' +
        '</div>';
    }).join("");

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">💼 Formimi i Kabinetit Qeveritar</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px;">' +
            'Zgjidhni ministrat për secilën ministri. Mund të ndryshoni emrin ose partinë politike. Kabineti do të paraqitet për votim në Kuvend.' +
        '</p>' +
        '<div style="max-height:480px; overflow-y:auto; margin-bottom:10px;">' + rowsHtml + '</div>' +
        '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
            '<button class="action-btn btn-gold" onclick="confirmCabinetProposal()">✅ Konfirmo Kabinetin</button>' +
            '<button class="action-btn btn-outline" onclick="resetCabinetProposal()">🔄 Rikthe Propozimin Automatik</button>' +
            '<button class="action-btn btn-outline" onclick="toggleModal(\'interactiveActionModal\', false)">Anulo</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function cycleCabinetMinister(idx) {
    if(state.mandatar!==state.playerParty){showToast('Formimi i kabinetit i takon mandatarit aktual.');return false;}
    if (!constituentGovernmentGate()) return false;
    var proposal = state.cabinetProposal;
    if (!proposal || !proposal[idx]) return;
    var item = proposal[idx];
    if(item.party!==state.playerParty)return false;
    var availableCands = [];
    if (state.parties[item.party]) {
        availableCands = cabinetCandidateRegistry(state,item.party);
    }
    state.ministries.forEach(function(min) {
        if (min.party === item.party && min.minister) {
            if (!availableCands.some(function(c) { return c.name === min.minister; })) {
                availableCands.push({ name: min.minister, loyalty: 85, id: "existing_" + min.id });
            }
        }
    });
    availableCands=availableCands.filter(c=>cabinetNomineeAvailable(state,c.name,proposal,idx));
    if (availableCands.length === 0) {
        showToast("Nuk ka kandidatë të disponueshëm për këtë parti.");
        return;
    }
    var currentName = item.ministerName;
    var currentIdx = availableCands.findIndex(function(c) { return c.name === currentName; });
    var nextIdx = (currentIdx + 1) % availableCands.length;
    var nextCand = availableCands[nextIdx];
    item.ministerName = nextCand.name;
    item.ministerCandidateId = null;
    state.cabinetApproved = false;
    item.competence = nextCand.loyalty ? Math.min(95, nextCand.loyalty + 5) : 80;
    item.loyalty = nextCand.loyalty || 85;
    renderCabinetSelectionModal();
}

function cycleCabinetParty(idx) {
    showToast('Ministrite percaktohen nga marreveshja e koalicionit.');
    return false;
}

function confirmCabinetProposal() {
    if(state.mandatar!==state.playerParty){showToast('Formimi i kabinetit i takon mandatarit aktual.');return false;}
    if (!constituentGovernmentGate()) return false;
    if (!state.cabinetProposal) return;
    var problem=cabinetProposalProblem(state);if(problem){showToast(problem);return false;}
    var allFilled = state.cabinetProposal.every(function(item) { return item.ministerName && item.ministerName.length > 0; });
    if (!allFilled) {
        showToast("Të gjitha ministritë duhet të kenë ministër të caktuar.");
        return;
    }
    state.cabinetApproved = true;
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    showToast("Kabineti u konfirmua! Tani mund të paraqisni Qeverinë për votim në Kuvend.");
}

function resetCabinetProposal() {
    if(state.mandatar!==state.playerParty){showToast('Formimi i kabinetit i takon mandatarit aktual.');return false;}
    if (!constituentGovernmentGate()) return false;
    state.cabinetProposal = buildDefaultCabinetProposal();
    state.cabinetApproved = false;
    renderCabinetSelectionModal();
}

function applyCabinetProposalToState(authorization) {
    const approvedInstitutionalVote=authorization===GOVERNMENT_VOTE_COMMIT&&_committingVote&&state.pendingVote?.data.pro>=61&&!state.pendingVote.finalized;
    if(state.mandatar!==state.playerParty&&!approvedInstitutionalVote){showToast('Formimi i kabinetit i takon mandatarit aktual.');return false;}
    if (!constituentGovernmentGate()) return false;
    if (!state.cabinetProposal) return;
    var problem=cabinetProposalProblem(state);if(problem)throw Error(problem);
    state.cabinetProposal.forEach(function(item) {
        var min = state.ministries.find(function(m) { return m.id === item.ministryId; });
        if (min) {
            min.party = item.party;
            min.minister = item.ministerName;
            min.ministerCandidateId = item.ministerCandidateId || null;
            min.competence = item.competence;
            min.loyalty = item.loyalty;
        }
    });
}

/* ============================================================================
   16. FORMALIZIMI I VOTIMIT TË QEVERISË
   ============================================================================ */

function formalizeGovernmentVote() {
    if(state.mandatar!==state.playerParty){showToast('Votimin e Qeverisë e paraqet mandatari aktual.');return false;}
    checkGovernmentFormationDeadline();
    if(state.governmentFormed)return false;
    if (!constituentGovernmentGate()) return false;
    if (state && state.pendingVote) { showToast("Një votim është në zhvillim e sipër!"); return; }
    if (!validAssemblyComposition()) return;
    if (state.mandatar !== state.playerParty) {
        showToast("Vetëm Mandatari mund të formalizojë votimin e Qeverisë.");
        return;
    }
    if (!state.assemblyConstituted || !state.speakerElected) {
        showToast("Kuvendi duhet të konstituohet dhe të zgjidhet Kryetari para votimit të Qeverisë.");
        return;
    }
    if (!state.cabinetApproved || !state.cabinetProposal) {
        showToast("Fillimisht duhet të konfirmoni kabinetin para votimit.");
        openCabinetSelectionModal();
        return;
    }

    setInstitutionalPhase(INSTITUTIONAL_PHASES.GOV_VOTING, "Qeveria u paraqit në Kuvend për votim.");

    var seats = getCoalitionSeats();
    if (seats < 61) {
        showToast("Koalicioni ka vetëm " + seats + " vota, më pak se 61 të nevojshme. Votimi do të dështojë.");
    }

    var pro = 0, kunder = 0, abstenim = 0, mungese = 0;

    state.mps.forEach(function(mp) {
        var inCoal = state.coalitionParties.includes(mp.party);
        if (inCoal) {
            if (mp.rebelRisk && Math.random() < 0.1) abstenim++;
            else pro++;
        } else {
            if (mp.promisedVoteNext) pro++;
            else if (Math.random() < 0.2) mungese++;
            else if (Math.random() < 0.1) abstenim++;
            else kunder++;
        }
    });

    var total = pro + kunder + abstenim + mungese;
    if (total !== 120) { mungese += (120 - total); }

    var passed = pro >= 61;
    var resHtml = passed
        ? '<span style="color:var(--success);">✅ QEVERIA U MIRATUA ME ' + pro + ' VOTA PRO!</span>'
        : '<span style="color:var(--danger);">❌ QEVERIA DËSHTOI TË MARRË 61 VOTA! (' + pro + ' PRO)</span>';

    startVotingAnimation("🏛️ Seanca për Zgjedhjen e Qeverisë", "Mandatari: " + state.parties[state.mandatar].leader + " (" + state.parties[state.mandatar].short + ")", {
        pro: pro, kunder: kunder, abstenim: abstenim, mungese: mungese, resultHtml: resHtml,
        governmentContext:{kind:'GOVERNMENT',approved:passed,title:'Zgjedhja e Qeverisë',required:61,primeMinister:agendaExecutive(state)}
    }, function() {
        if (passed) {
            installApprovedGovernment(pro);

            addMediaNews("RTK", "Kuvendi i Kosovës voton Qeverinë e re të drejtuar nga " + state.primeMinister + " me " + pro + " vota pro!", "POSITIVE");
            showMajorAnnouncement({
                badge: "SEANCË KONSTITUIVE & VOTIM QEVERIE",
                title: "Votohet Qeveria e Re e Republikës së Kosovës (" + pro + " Vota PRO)",
                reason: "Koalicioni (" + state.coalitionParties.join(" + ") + ") kaloi pragun kushtetues prej 61 votash.",
                immediateImpact: state.primeMinister + " merr zyrtarisht mandatin ekzekutiv. Kabineti i zgjedhur u aplikua në të gjitha ministritë. Statusi: Qeveri në detyrë."
            });
        } else {
            var attempt=(state.governmentFormationAttempts || []).slice(-1)[0];
            if(attempt){attempt.status="FAILED";attempt.decidedAt=constituentStamp();}
            state.mandatar=null;state.cabinetApproved=false;state.cabinetProposal=null;
            state.institutionalPhase="ASSEMBLY_CONSTITUTED";state.governmentStatus="CARETAKER";state.governmentFormed=false;
            if(state.previousGovernment)state.primeMinister=state.previousGovernment.primeMinister;
            addMediaNews("KOHA", "Dështon votimi i Qeverisë në Kuvend. Kërkohet mandatar i ri ose zgjedhje të reja.", "CRITICAL");
            showMajorAnnouncement({
                badge: "DËSHTON VOTIMI I QEVERISË",
                title: "Kuvendi refuzon Qeverinë (" + pro + " Vota PRO)",
                reason: "Mandatari nuk arriti të sigurojë 61 votat e nevojshme në sallë.",
                immediateImpact: "Negociatat duhet të vazhdojnë ose vendi shkon në zgjedhje të reja."
            });
        }
        refreshAllUI();
    });
}

/* ============================================================================
   17. NEGOCIATAT PRESIDENCIALE (Pika 4)
   ============================================================================ */

function openPresidentialNegotiationModal(party) { return openPresidentialTalk(party); }

function renderPresidentialNegotiationStep1() { return renderPresidentialTalk(); }

function renderPresidentialNegotiationStep2() { return renderPresidentialTalk(); }

function evaluatePresidentialNegotiation() { return resolvePresidentialTalk('SUPPORT'); }

/* ============================================================================
   18. ZGJEDHJET E NDARA — PARLAMENTARE DHE PRESIDENCIALE (Pika 10)
   ============================================================================ */

function checkPresidentialMandateExpiry() { return processPresidencyWeek(); }

function startParliamentaryElectionProcess(declaredByPresident, options) {
    var electionProblem=parliamentaryElectionBlock(state);
    if(electionProblem){showToast(electionProblem);return false;}
    var beforeDeclaration=JSON.stringify(state);
    state.electionPhase = "CAMPAIGN";
    state.electionCampaign = {
        startWeek: state.turnCount,
        northMandate: captureNorthMandate(state),
        campaignDurationWeeks: 3,
        weeksRemaining: 3,
        activities: [],
        debates: [],
        polls: [],
        declaredBy: declaredByPresident || "Presidenti",
        basis: parliamentaryElectionBasis(state),
        previousGovernment: {primeMinister:state.primeMinister,coalitionParties:state.coalitionParties.slice(),ministries:JSON.parse(JSON.stringify(state.ministries))}
    };
    migrateCampaignState(state);
    try{ensurePlayableElectionConfiguration(state);ensureElectionDraw(state);}catch(error){state=JSON.parse(beforeDeclaration);showToast('Zgjedhjet nuk u përgatitën: '+error.message);return false;}
    setInstitutionalPhase(INSTITUTIONAL_PHASES.SNAP_ELECTION,'Zgjedhjet u aktivizuan: '+state.electionCampaign.basis+'.');
    if(!options?.deferCommit&&!saveGameAuto()){state=JSON.parse(beforeDeclaration);return false;}
    if(options?.deferCommit)return true;
    addMediaNews("KQZ / RTK", "Presidenti ka shpallur zgjedhjet parlamentare! Fillon periudha e fushatës zgjedhore.", "NEUTRAL");
    showMajorAnnouncement({
        badge: "ZGJEDHJET PARLAMENTARE TË SHPALLURA",
        title: "Fillon Fushata Zgjedhore",
        reason: "Presidenti ka shpallur zgjedhjet parlamentare sipas procedurës kushtetuese.",
        immediateImpact: "Fushata zgjat tri javë të lojës. Në përfundim hapet përmbledhja; rezultatet dhe mandatet nuk llogariten ende."
    });
    refreshAllUI();
    return true;
}

function advanceCampaignWeek() {
    if (!campaignIsActive()) { showToast("Fushata nuk është aktive ose është gati për përmbyllje."); return; }
    advanceTime(1);
}

// Retain the existing declaration button's entry point.
function startParliamentaryElections() {
    return startParliamentaryElectionProcess("Presidenti");
}

function runElectionDay() {
    return openElectionVoting();
}

// Preserved historical allocator for regression checks; the Phase 4 UI never calls it.
function legacyRunElectionDay() {
    return runElectionDay();
    if (state.electionCampaign && state.electionCampaign.moduleVersion === 3) {
        showToast("Fushata e kësaj faze nuk llogarit rezultate ose mandate."); return;
    }
    if (!state.electionCampaign) return;
    if (state.pendingVote) return;
    var oldPolls = {};
    Object.keys(state.parties).forEach(function(k) { oldPolls[k] = state.parties[k].poll; });
    normalizePartyPolls();

    var genKeys = ["LVV", "PDK", "LDK", "AAK"];
    var qualified = genKeys.filter(function(k) { return state.parties[k].poll >= 5.0; });
    var sumVotes = qualified.reduce(function(a, k) { return a + state.parties[k].poll; }, 0);

    if (!qualified.length || !Number.isFinite(sumVotes) || sumVotes <= 0) {
        Object.keys(oldPolls).forEach(function(k) { state.parties[k].poll = oldPolls[k]; });
        showToast("Ndarja e ulëseve u ndal: nuk ka parti të kualifikuara ose votat janë të pavlefshme. Loja nuk përcakton rregull për këtë rast; kërkohet vendim.");
        return;
    }
    var previousSeats = {};
    Object.keys(state.parties).forEach(function(k) { previousSeats[k] = state.parties[k].seats; state.parties[k].seats = 0; });
    var allocatedSum = 0;
    var maxSeats = 0;
    var winnerId = "LVV";

    qualified.forEach(function(k, idx) {
        if (idx === qualified.length - 1) state.parties[k].seats = 100 - allocatedSum;
        else {
            var s = Math.round((state.parties[k].poll / sumVotes) * 100);
            state.parties[k].seats = s;
            allocatedSum += s;
        }
        if (state.parties[k].seats > maxSeats) {
            maxSeats = state.parties[k].seats;
            winnerId = k;
        }
    });

    state.parties.MIN_MULTI.seats = 11;
    state.parties.SL.seats = 9;
    var totalSeats = Object.values(state.parties).reduce(function(sum, p) { return sum + p.seats; }, 0);
    if (totalSeats !== 120 || Object.values(state.parties).some(function(p) { return !Number.isInteger(p.seats) || p.seats < 0; })) {
        Object.keys(previousSeats).forEach(function(k) { state.parties[k].seats = previousSeats[k]; state.parties[k].poll = oldPolls[k]; });
        showToast("Ndarja e ulëseve është e pavlefshme. Rezultatet nuk u aplikuan; kërkohet vendim.");
        return;
    }
    state.electionPhase = "VOTING";
    state.winningParty = winnerId;
    state.mandatar = winnerId;
    state.mps = generate120MPs(state.parties, state.playerParty);
    state.mandateNumber++;
    state.assemblyCycleId = null;
    migrateDeputyMandates(state);
    state.weeksToNextRegularElection = 208;

    state.governmentFormed = false;
    state.governmentStatus = "PENDING";
    state.coalitionParties = [winnerId];
    state.coalitionAgreements = [];
    state.primeMinister = "Në pritje të mandatarit";
    state.assemblyConstituted = true;
    state.speakerElected = false;
    state.speakerOfAssembly = "Në pritje të zgjedhjes së Kryetarit";
    state.speakerElectionWeek = null;
    state.governmentApprovalWeek = null;
    state.cabinetProposal = null;
    state.cabinetApproved = false;

    state.ministries.forEach(function(m) {
        m.party = "NONE";
        m.minister = "I/E paemëruar";
    });

    state.laws = getInitialLaws();
    state.parliamentarySessions = [];
    state.motions = [];
    state.sessionCounter = 0;
    state.motionCounter = 0;

    setInstitutionalPhase(INSTITUTIONAL_PHASES.ASSEMBLY_ELECTED, "Zgjedhjet parlamentare u mbajtën; Kuvendi i ri u konstituua.");

    state.electionCampaign = null;
    state.electionPhase = "NONE";

    addMediaNews("KQZ Rezultatet Përfundimtare", "Zgjedhjet e reja: LVV " + state.parties.LVV.seats + ", PDK " + state.parties.PDK.seats + ", LDK " + state.parties.LDK.seats + ", AAK " + state.parties.AAK.seats + ".", "POSITIVE");
    showMajorAnnouncement({
        badge: "REZULTATET ZYRTARE TË KQZ-SË",
        title: "Përbërja e Re e Kuvendit: LVV (" + state.parties.LVV.seats + "), PDK (" + state.parties.PDK.seats + "), LDK (" + state.parties.LDK.seats + "), AAK (" + state.parties.AAK.seats + ")",
        reason: "Zgjedhjet parlamentare u mbajtën me sukses.",
        immediateImpact: "Partia e parë (" + state.parties[winnerId].short + ") merr mandatin për formimin e Qeverisë. Presidenti NUK shkon automatikisht në zgjedhje; mandati presidencial vazhdon.",
        statsHtml: '<div style="text-align:center; font-size:0.85rem;">' +
            'LVV: <strong>' + state.parties.LVV.seats + '</strong> • ' +
            'PDK: <strong>' + state.parties.PDK.seats + '</strong> • ' +
            'LDK: <strong>' + state.parties.LDK.seats + '</strong> • ' +
            'AAK: <strong>' + state.parties.AAK.seats + '</strong> • ' +
            'Komunitetet: <strong>' + state.parties.MIN_MULTI.seats + '</strong> • ' +
            'Lista Serbe: <strong>' + state.parties.SL.seats + '</strong>' +
        '</div>'
    });
    refreshAllUI();
}

/* ============================================================================
   19. MOCIONI I MOSBESIMIT
   ============================================================================ */

function voteNoConfidenceMotion(motionId) {
    if(oppositionPressurePaused(state)){showToast("Mocionet janë pezulluar përkohësisht nga marrëveshja aktive ose masat kundër financimit të opozitës.");return false;}
    if (state && state.pendingVote) { showToast("Një votim është në zhvillim e sipër!"); return; }
    if (!assertAssemblyFunctional("Mocioni i mosbesimit")) return;
    if (!validAssemblyComposition()) return;
    var motion = state.motions.find(function(m) { return m.id === motionId; });
    if (!motion || motion.type!=='NO_CONFIDENCE' || motion.status!=='PENDING') return false;
    var managedOpposition=typeof oppositionActive==='function' && oppositionActive();
    if(managedOpposition&&!oppositionMotionReady()){showToast('Kërkohen 61 zotime aktive dhe mbështetje e Qeverisë ≤45%.');return false;}
    if(motion.oppositionOwner && (motion.oppositionOwner!==state.playerParty || !oppositionMotionReady())){showToast('Zotimet ose mbështetja e Qeverisë nuk lejojnë mocionin tani.');return false;}

    var pro = 0, kunder = 0, abstenim = 0, mungese = 0;
    var myPartyIsOpposition = !state.coalitionParties.includes(state.playerParty);

    state.mps.forEach(function(mp) {
        if(motion.coalitionBlackmailId){if(coalitionBlackmailMotionVote(motion,mp))pro++;else kunder++;return;}
        if(motion.veteransBudgetMotion){if(!state.coalitionParties.includes(mp.party)||specialBlockedSeats(state).has(mp.seatNumber))pro++;else kunder++;return;}
        if(motion.northCrisisId){if(northMotionSupport(motion,mp,state))pro++;else kunder++;return;}
        if(managedOpposition||motion.oppositionOwner){if(oppositionSecureSeats().has(mp.seatNumber))pro++;else kunder++;return;}
        var inCoalition = state.coalitionParties.includes(mp.party);
        if (myPartyIsOpposition) {
            if (!inCoalition) {
                if (Math.random() < 0.85) pro++;
                else if (Math.random() < 0.5) abstenim++;
                else mungese++;
            } else {
                if (mp.rebelRisk && Math.random() < 0.15) pro++;
                else if (Math.random() < 0.9) kunder++;
                else abstenim++;
            }
        } else {
            if (inCoalition) {
                if (Math.random() < 0.9) pro++;
                else abstenim++;
            } else {
                if (Math.random() < 0.7) kunder++;
                else if (Math.random() < 0.5) abstenim++;
                else mungese++;
            }
        }
    });

    var total = pro + kunder + abstenim + mungese;
    if (total < 120) mungese += (120 - total);
    else if (total > 120) mungese = Math.max(0, mungese - (total - 120));

    var passed = (pro >= 61);

    var resHtml = passed
        ? '<span style="color:var(--danger);">❌ MOCIONI U MIRATUA ME ' + pro + ' VOTA PRO! Qeveria ra!</span>'
        : '<span style="color:var(--success);">✅ MOCIONI DËSHTOI! Vetëm ' + pro + ' vota PRO. Qeveria mbijetoi.</span>';

    startVotingAnimation("⚡ Mocioni i Mosbesimit", motion.title, {
        pro: pro, kunder: kunder, abstenim: abstenim, mungese: mungese, resultHtml: resHtml,
        governmentContext:{kind:'CONFIDENCE',approved:passed,title:motion.title,required:61,primeMinister:agendaExecutive(state),opposition:managedOpposition}
    }, function() {
        if(managedOpposition)motion.oppositionOwner=state.playerParty;
        motion.status = passed ? 'PASSED' : 'FAILED';
        motion.result = pro + ' PËR, ' + kunder + ' KUNDËR, ' + abstenim + ' ABSTENIM, ' + mungese + ' MUNGESA';
        if (passed) {
            addMediaNews("KOHA", "Bie Qeveria! Mocioni i mosbesimit miratohet me " + pro + " vota pro!", "CRITICAL");

            setInstitutionalPhase(INSTITUTIONAL_PHASES.GOV_OVERTHROWN, "Qeveria u rrëzua me mocion mosbesimi (" + pro + " vota pro).");
            if(motion.oppositionOwner)state.opposition.snapDue=true;

            showMajorAnnouncement({
                badge: "QEVEREA U RRËZUA — CIKLI INSTITUCIONAL RIVENDOSET",
                title: "Mocioni i Mosbesimit Miratohet me " + pro + " Vota",
                reason: "Opozita arriti 61+ vota. Qeveria bie dhe vendi shkon në zgjedhje të reja ose në mandat të ri.",
                immediateImpact: "Të gjitha funksionet ekzekutive janë pezulluar. Statusi institucional: Qeveri e Rrëzuar. Kuvendi vazhdon të funksionojë, por Qeveria është në tranzicion.",
                statsHtml: '<div style="text-align:center; font-size:0.9rem;">🟢 PËR: <strong>' + pro + '</strong> &nbsp;|&nbsp; 🔴 KUNDËR: <strong>' + kunder + '</strong> &nbsp;|&nbsp; ⚪ ABSTENIM: <strong>' + abstenim + '</strong></div>'
            });
            refreshAllUI();
        } else {
            adjustPublicSupport((2.5), {source:"voteNoConfidenceMotion"}, state);
            addMediaNews("RTK", "Dështon mocioni i mosbesimit në Kuvend: Vetëm " + pro + " vota pro.", "POSITIVE");
            showMajorAnnouncement({
                badge: "MOCION MOSBESIMI I RRËZUAR",
                title: "Qeveria i Mbijeton Mocionit (" + pro + " PËR / " + kunder + " KUNDËR)",
                reason: "Opozita nuk arriti të sigurojë 61 vota për rrëzimin e kabinetit.",
                immediateImpact: "Qeveria ka siguruar mbështetjen parlamentare për të vazhduar punën."
            });
            refreshAllUI();
        }
    });
}

/* ============================================================================
   20. VOTIMI I PRESIDENTIT
   ============================================================================ */

function runPresidentialVoteRound() {
    if(!presidentialActionAllowed(true))return false;
    if (state && state.pendingVote) { showToast("Një votim është në zhvillim e sipër!"); return; }
    if (!assertAssemblyFunctional("Zgjedhja e Presidentit")) return;
    if (!validAssemblyComposition()) return;
    var allCands = getAllPresCandidates();
    var cand = allCands[state.presidentialCandidateId];
    if(!cand || cand.id!==state.presidency.procedure.candidateId){showToast('Paraqitni një kandidaturë të vlefshme.');return false;}

    var pro = 0, kunder = 0, abstenim = 0, mungese = 0;
    var presentInHall = 0;

    state.mps.forEach(function(mp) {
        var partyInQuorum = state.quorumPledgedParties.includes(mp.party) || state.coalitionParties.includes(mp.party) || presidentialCandidateAgreement(mp.party);
        var individualPresent = partyInQuorum || mp.promisedVoteNext;

        if (!individualPresent) {
            mungese++;
            return;
        }

        presentInHall++;
        var partyAcceptsCandidate = cand.acceptParties.includes(mp.party) || state.coalitionParties.includes(mp.party) || presidentialCandidateAgreement(mp.party);

        if (mp.promisedVoteNext || partyAcceptsCandidate) {
            if (mp.rebelRisk && !mp.promisedVoteNext && Math.random() < 0.12) {
                abstenim++;
            } else {
                pro++;
            }
        } else {
            if (mp.trustPlayer >= 72) {
                pro++;
            } else if (mp.seatNumber % 2 === 0) {
                abstenim++;
            } else {
                kunder++;
            }
        }
    });

    var total = pro + kunder + abstenim + mungese;
    if (total !== 120) { mungese += (120 - total); }

    var round = state.presidentialRound;
    var neededVotes = (round === 1 || round === 2) ? 80 : 61;
    var hasQuorum = presentInHall >= 80;
    var passed = hasQuorum && (pro >= neededVotes);

    var resHtml = "";
    if (!hasQuorum) {
        resHtml = '<span style="color:var(--warning);">⚠️ MUNGESË KUORUMI! Vetëm ' + presentInHall + ' deputetë morën pjesë.</span>';
    } else if (passed) {
        resHtml = '<span style="color:var(--success);">✅ PRESIDENTI U ZGJODH ME ' + pro + ' VOTA PRO!</span>';
    } else {
        resHtml = '<span style="color:var(--danger);">❌ DËSHTOI ZGJEDHJA NË KËTË RAUND (' + pro + ' PRO / ' + neededVotes + ' të nevojshme)</span>';
    }

    startVotingAnimation("🎖️ Zgjedhja e Presidentit (Raundi " + round + ")", "Votimi i fshehtë për: " + cand.name, {
        pro: pro, kunder: kunder, abstenim: abstenim, mungese: mungese, resultHtml: resHtml,
        governmentContext:{kind:'PRESIDENT',approved:passed,title:cand.name,required:neededVotes,quorum:hasQuorum,primeMinister:agendaExecutive(state)}
    }, function() {
        recordPresidentialVote({round:round,turn:state.turnCount,pro:pro,kunder:kunder,abstenim:abstenim,mungese:mungese,hasQuorum:hasQuorum,passed:passed},cand);
        if (!hasQuorum) {
            addMediaNews("Betimi për Drejtësi", "Mungesë kuorumi në zgjedhjen e Presidentit: Vetëm " + presentInHall + " deputetë në sallë!", "CRITICAL");
            showMajorAnnouncement({
                badge: "RAUNDI " + round + " — MUNGESË KUORUMI (<80)",
                title: "Votimi i Pavlefshëm: Vetëm " + presentInHall + " Deputetë",
                reason: "Sipas Kushtetutës së Kosovës, pa pjesëmarrjen e të paktën 80 deputetëve nuk plotësohet kuorumi.",
                immediateImpact: "Negocioni marrëveshje për kuorum me opozitën."
            });
        } else if (passed) {
            state.presidentialRound = 1;
            adjustPublicSupport((cand.popBonus), {source:"runPresidentialVoteRound"}, state);
            addMediaNews("RTK", "Kuvendi zgjedh " + cand.name + " President/e me " + pro + " vota PRO në Raundin " + round + "!", "POSITIVE");
            showMajorAnnouncement({
                badge: "✔ U ZGJODH PRESIDENTI/JA (RAUNDI " + round + ")",
                title: cand.name + " Zgjidhet President/e e Republikës",
                reason: "Me kuorum prej " + presentInHall + " deputetësh, kandidati mori " + pro + " vota PRO.",
                immediateImpact: "Mandati presidencial: " + state.presidentMandateStartYear + "–" + state.presidentMandateEndYear + ". Publiku do ta vlerësojë mandatin përmes punës së institucionit."
            });
        } else {
            if (round < 3) {
                state.presidentialRound++;
                showMajorAnnouncement({
                    badge: "RAUNDI " + round + " DËSHTOI — KALOJMË NË RAUNDIN " + state.presidentialRound,
                    title: cand.name + " mori " + pro + " vota PRO (Kërkoheshin " + neededVotes + ")",
                    reason: "Në sallë ishin " + presentInHall + " deputetë, por munguan votat PRO.",
                    immediateImpact: state.presidentialRound === 3 ? "Në Raundin III mjaftojnë 61 vota PRO (me kuorum 80)!" : "Kuvendi kalon në Raundin II."
                });
            } else {
                addMediaNews("KOHA", "Dështon zgjedhja e Presidentit edhe në Raundin III! Kuvendi shpërndahet!", "CRITICAL");
                setInstitutionalPhase(INSTITUTIONAL_PHASES.SNAP_ELECTION, "Dështoi zgjedhja e Presidentit në 3 raunde; Kuvendi shpërndahet.");
                // The parliamentary process starts after the presidential ballot is saved and closed.
            }
        }
        refreshAllUI();
    });
}

/* VAZHDON në pjesën 4 */
/* ============================================================================
   21. RENDER DASHBOARD
   ============================================================================ */

const DYNAMIC_EVENTS = [
    {
        id: "ev_brussels_summit",
        category: "DIPLOMACI & DIALOG",
        title: "Thirrje Urgjente nga Brukseli dhe Uashingtoni për Dialogun",
        cause: "Presioni i ndërmjetësuesve të BE-së dhe emisarit amerikan për sekuencimin e Marrëveshjes së Ohrit.",
        desc: "Bashkimi Evropian dhe SHBA kërkojnë që Qeveria e Kosovës të paraqesë planin e zbatimit në këmbim të zhbllokimit të plotë të fondeve të Planit të Rritjes. Opozita kërkon raportim në Kuvend.",
        options: [
            {
                text: "Kërko nënshkrim formal dhe garanci sigurie nga NATO para çdo hapi të njëanshëm",
                impactText: "Qëndrimi mund të mobilizojë bazën, por vështirëson bashkëpunimin me BE-në.",
                apply: function(st) {
                    adjustPublicSupport((4.2), {source:"dynamic-event"}, st);
                    st.diplomacy.EU.score = clamp(st.diplomacy.EU.score - 5, 10, 100);
                    // Public reaction is recorded through approval; no second polling bonus.
                    addMediaNews("KOHA", "Kryeministri këmbëngul në garanci sigurie dhe nënshkrim të marrëveshjes në Bruksel.", "NEUTRAL");
                }
            },
            {
                text: "Përgatit propozim për koordinim dhe shqyrtim me BE-në",
                impactText: "Propozimi hap shqyrtimin; nuk garanton marrëveshje ose financim.",
                apply: function(st) {
                    if(!st.dialogueProposal)st.dialogueProposal={topic:'Koordinimi i hapave dhe plani i reformave',redLine:'Respektimi i procedurave institucionale',preparedAt:st.year+'/'+st.week};
                    st.dialogueChronologyStep=4;
                    st.dialogueNegotiationLog.unshift('U përgatit propozimi për shqyrtim me BE-në; pa zotim financimi.');
                    addMediaNews("Diplomacia", "Propozimi për koordinim pret shqyrtimin me partnerët.", "NEUTRAL");
                }
            },
            {
                consultOpposition: true,
                text: "Konsultim me partitë e tjera opozitare për platformë shtetërore",
                impactText: "Konsultimi me opozitën mund të ulë tensionet institucionale.",
                apply: function(st) {
                    adjustPublicSupport((1.8), {source:"dynamic-event"}, st);
                    oppositionConsultationParties(st).forEach(id=>{st.parties[st.playerParty].relations[id]=clamp((st.parties[st.playerParty].relations[id]||50)+7,0,100);});
                    addMediaNews("Klan Kosova", "Takim i nivelit të lartë mes pushtetit dhe opozitës për strategjinë shtetërore në dialog.", "POSITIVE");
                }
            }
        ]
    },
    {
        id: "ev_sbashk_strike",
        category: "KRIZË SOCIALE & SINDIKALE",
        title: "SBASHK-u dhe Sindikatat e Shëndetësisë Paralajmërojnë Grevë të Përgjithshme",
        cause: "Kërkesa për rritjen e vlerës së koeficientit të pagave dhe kushtet e punës në QKUK.",
        desc: "Sindikatat e arsimit dhe shëndetësisë kërkojnë rishikim urgjent të buxhetit. Opozita ka thirrur interpelancë parlamentare me Ministrin e Financave.",
        options: [
            {
                text: "Arrij marrëveshje sociale: Rrit koeficientin dhe përmbush premtimin (-€110M)",
                impactText: "Marrëveshja lehtëson presionin sindikal dhe ngarkon buxhetin; realizimi i zotimit kërkon punë të mëtejshme.",
                apply: function(st) {
                    fiscalSetBalance(st,"budgetTotalB",+(st.budgetTotalB - 0.11).toFixed(9),"dynamic-event");
                    adjustPublicSupport((5.0), {source:"dynamic-event"}, st);
                    var p = st.promises.find(function(x) { return x.id === "prom_salary_1000"; });
                    if (p) { p.progress = clamp(p.progress + 45, 0, 100); if (p.progress >= 100) p.fulfilled = true; }
                    addMediaNews("RTK", "Qeveria arrin marrëveshje me sindikatat; rriten pagat në arsim dhe shëndetësi.", "POSITIVE");
                }
            },
            {
                text: "Ofro shtesë kundër inflacionit prej €50 në muaj (-€45M)",
                impactText: "Lehtësim i përkohshëm për punonjësit, pa zgjidhur shkaqet e pakënaqësisë.",
                apply: function(st) {
                    fiscalSetBalance(st,"budgetTotalB",+(st.budgetTotalB - 0.045).toFixed(9),"dynamic-event");
                    adjustPublicSupport((1.8), {source:"dynamic-event"}, st);
                    addMediaNews("Telegrafi", "Pako e përkohshme mbështetëse për punëtorët e sektorit publik.", "NEUTRAL");
                }
            },
            {
                text: "Refuzo presionin sindikal dhe kërko vlerësim të performancës",
                impactText: "Ruhet buxheti, por sindikatat mund t’i ashpërsojnë protestat.",
                apply: function(st) {
                    adjustPublicSupport(-(4.2), {source:"dynamic-event"}, st);
                    addMediaNews("T7", "Përplasje e ashpër mes Qeverisë dhe SBASHK-ut; sindikatat protestojnë para Qeverisë.", "CRITICAL");
                }
            }
        ]
    },
    {
        id: "ev_north_security",
        category: "SIGURI KOMBËTARE",
        title: "Tensione të Sigurisë pranë Kanalit Ibër-Lepenc dhe Mitrovicës së Veriut",
        cause: "Tentativa për destabilizim nga grupe ilegale në komunat veriore.",
        desc: "Policia e Kosovës dhe AKI raportojnë lëvizje të dyshimta pranë infrastrukturës kritike në Zubin Potok dhe Leposaviq. KFOR-i dhe Ambasada e SHBA-së kërkojnë koordinim operativ.",
        options: [
            {
                text: "Operacion i përbashkët i Policisë së Kosovës në koordinim me KFOR-in dhe EULEX-in",
                impactText: "Koordinimi me partnerët ndihmon sigurinë dhe besimin te institucionet.",
                apply: function(st) {
                    adjustPublicSupport((4.5), {source:"dynamic-event"}, st);
                    st.diplomacy.USA.score = clamp(st.diplomacy.USA.score + 5, 10, 100);
                    st.securityNorth = clamp(st.securityNorth + 8, 10, 100);
                    addMediaNews("Kallxo.com", "Policia e Kosovës në koordinim me KFOR-in blindon infrastrukturën kritike në veri.", "POSITIVE");
                }
            },
            {
                text: "Ndërhyrje e menjëhershme e Njësive Speciale pa njoftim paraprak të QUINT-it",
                impactText: "Veprimi mund të gjejë përkrahje vendase, por mungesa e koordinimit rrit tensionet me partnerët.",
                apply: function(st) {
                    adjustPublicSupport((5.2), {source:"dynamic-event"}, st);
                    st.diplomacy.USA.score = clamp(st.diplomacy.USA.score - 8, 10, 100);
                    st.diplomacy.EU.score = clamp(st.diplomacy.EU.score - 8, 10, 100);
                    st.securityNorth = clamp(st.securityNorth + 5, 10, 100);
                    addMediaNews("Euronews Albania", "Aksion i rrufeshëm i Njësive Speciale në veri; QUINT-i kërkon koordinim.", "NEUTRAL");
                }
            }
        ]
    }
];

// The summit is the existing Brussels dossier, not a separately generated event.
function summitOccurrence() {
    return state?.urgentSituations?.events.find(function(r){return r.templateId==='ev_brussels_summit' && r.occurrenceIndex===0;});
}
function summitCanAct(r) {
    return !!r && r.status==='ACTIVE' && state.currentEventIndex===0 && agendaExecutive() && !urgentInterfaceBusy();
}
function summitParticipant(r,st){
    var p=r.pmParticipation;
    if(agendaExecutive(st)&&r.status==='ACTIVE'&&(!p||p.name!==st.primeMinister||!p.speech&&p.status!=='ATTENDING'))return {name:st.primeMinister,status:'ATTENDING',invitedTurn:st.turnCount,updatedTurn:st.turnCount};
    return p;
}
function summitPanel() {
    var r=summitOccurrence();if(!r)return '';if(northSanctioned(state)&&r.status==='ACTIVE')return '<div class="card"><h3>Samiti i Brukselit</h3><p>Dialogu eshte i bllokuar nga sanksionet e Veriut.</p></div>';
    var e=catalogEscape,p=summitParticipant(r,state),labels={INVITED:'I ftuar',ACCEPTED:'E ka pranuar ftesën',ATTENDING:'Pjesëmarrës',ABSENT:'Mungon'};
    var html='<div class="card summit-participation"><h3>Samiti i Brukselit · Përfaqësimi i Kosovës</h3><p>'+e(r.title)+'</p><p><strong>Kryeministri:</strong> '+e(p?.name || state.primeMinister)+'</p><p><strong>Statusi:</strong> '+(p?labels[p.status]:(r.status==='ACTIVE'?'Ende i paftuar':'Pa pjesëmarrje të regjistruar'))+'</p>';
    if(p?.speech)html+='<p><strong>Fjalimi:</strong> '+e(p.speech)+'</p><p>'+e(p.context)+'</p><p><strong>Përmbledhja:</strong> '+e(p.result)+'</p>';
    if(r.pmParticipationHistory)html+='<details><summary>Historiku i përfaqësimit</summary>'+r.pmParticipationHistory.map(function(h){return '<p>'+e(h.name)+' · Mungon: ndryshim i kryeministrit</p>';}).join('')+'</details>';
    if(summitCanAct(r) && !p?.speech){
        var changed=p && p.name!==state.primeMinister;
        var action=!p || changed?'INVITE':p.status==='INVITED'?'ACCEPT':p.status==='ACCEPTED'?'ATTEND':null;
        if(action)html+='<button class="action-btn" onclick="summitParticipationAction(\''+action+'\')">'+({INVITE:'Fto kryeministrin aktual',ACCEPT:'Prano ftesën',ATTEND:'Merr pjesë si përfaqësues i Kosovës'}[action])+'</button>';
        if(p && !changed && ['INVITED','ACCEPTED'].includes(p.status))html+='<button class="btn-top" onclick="summitParticipationAction(\'ABSENT\')">Regjistro mungesën</button>';
        if(p?.status==='ATTENDING' && !changed)html+='<p>Zgjidh mesazhin e fjalimit për dialogun dhe koordinimin me partnerët:</p>'+r.options.map(function(o,i){return '<button class="choice-btn" onclick="resolveActiveEvent('+i+',\''+r.id+'\')"><span class="choice-title">'+e(o.text)+'</span><span class="choice-impact">'+e(o.impactText)+'</span></button>';}).join('');
        if(p?.status==='ABSENT' && !changed)html+='<p>Kryeministri mungon. Dosja mbetet për vendim ekzekutiv, pa fjalim në samit.</p>'+r.options.map(function(o,i){return '<button class="choice-btn" onclick="resolveActiveEvent('+i+',\''+r.id+'\')">'+e(o.text)+'</button>';}).join('');
    }
    return html+'</div>';
}
function summitParticipationAction(action) {
    var r=summitOccurrence();if(!summitCanAct(r)||agendaExecutive())return false;
    var p=r.pmParticipation,changed=p && p.name!==state.primeMinister;
    if(p?.speech)return false;
    if(action==='INVITE' ? p && !changed : !p || changed || !({ACCEPT:['INVITED'],ATTEND:['ACCEPTED'],ABSENT:['INVITED','ACCEPTED']}[action] || []).includes(p.status))return false;
    var before=JSON.stringify(state);
    if(changed){r.pmParticipationHistory=r.pmParticipationHistory || [];r.pmParticipationHistory.push({...p,status:'ABSENT'});}
    if(action==='INVITE')r.pmParticipation={name:state.primeMinister,status:'INVITED',invitedTurn:state.turnCount};
    else {p.status={ACCEPT:'ACCEPTED',ATTEND:'ATTENDING',ABSENT:'ABSENT'}[action];p.updatedTurn=state.turnCount;}
    if(!saveGameAuto()){state=JSON.parse(before);return false;}
    refreshAllUI();renderUrgentSituations();return true;
}

function renderDashboard() {
    if (!state) return;
    if(typeof renderPlayerGuidance==='function')renderPlayerGuidance();
    if(typeof renderLawNegotiationSteps==='function')renderLawNegotiationSteps();
    var ev = currentUrgentEvent();
    var evCard = document.getElementById("activeEventCard");
    if (evCard) {
        if(!ev || ev.status!=='ACTIVE'){
            var oldDossiers=(state.urgentSituations?.events||[]).filter(function(d){return ['RESOLVED','ARCHIVED'].includes(d.status);}),escapeDossier=catalogEscape;
            evCard.innerHTML='<div class="card-header"><div class="card-title">Dosja në tavolinë</div></div><p>Nuk ka dosje të reja në tavolinë. Dosjet e shqyrtuara nuk paraqiten përsëri si raste të reja.</p>'+
                (urgentSituationQueue().length?'<button class="action-btn" onclick="openUrgentSituations()">Shqyrto kërkesat urgjente aktive</button>':'')+
                (oldDossiers.length?'<details><summary>Historiku i dosjeve ('+oldDossiers.length+')</summary>'+oldDossiers.map(function(d){return '<details data-desk-history-id="'+escapeDossier(d.id)+'"><summary>'+escapeDossier(d.title)+' · '+(d.status==='RESOLVED'?'E shqyrtuar':'E arkivuar si përsëritje')+'</summary><p>'+escapeDossier(d.description)+'</p><p>'+escapeDossier(d.status==='RESOLVED'?d.options[d.decisionIndex].text:'Nuk u mor vendim i ri për këtë përsëritje.')+'</p>'+d.history.map(function(h){return '<p>Java '+h.turn+' · '+escapeDossier(h.text)+'</p>';}).join('')+'</details>';}).join('')+'</details>':'');
        }else{
        evCard.innerHTML =
            '<div class="card-header">' +
                '<div class="card-title">⚡ Dosja në Tavolinë: ' + ev.title + '</div>' +
                '<span class="tag tag-lvv">' + ev.category + '</span>' +
            '</div>' +
            '<div style="font-size:0.75rem; color:var(--accent-gold); margin-bottom:6px;"><strong>Shkaku:</strong> ' + ev.cause + '</div>' +
            '<p style="font-size:0.83rem; color:#cbd5e1; line-height:1.5; margin-bottom:12px;">' + ev.description + '</p>' +
            '<div>' +
                (ev.templateId==='ev_brussels_summit' ? summitPanel() : ev.options.map(function(opt, idx) {
                    return '<button class="choice-btn" onclick="resolveActiveEvent(' + idx + ',\'dynamic:' + state.currentEventIndex + '\')">' +
                        '<span class="choice-title">' + (idx + 1) + '. ' + consultationOptionText(opt,state) + '</span>' +
                        '<span class="choice-impact">Ndikimi: ' + opt.impactText + '</span>' +
                    '</button>';
                }).join("")) +
            '</div>';
        }
    }

    var coalSeats = getCoalitionSeats();
    var coalNames = state.coalitionParties.map(function(k) { return state.parties[k] ? state.parties[k].short : k; }).join(" + ");
    var pendingMeetings = (state.scheduledMeetings || []).filter(function(m) { return m.status === "SCHEDULED"; });
    var activeSectorProjs = (state.stateSectors || []).filter(function(s) { return s.active; }).length;
    var activeDevProjects = stateDevelopmentSummary(state).active;
    var reqCount = (state.pmInboxRequests || []).filter(r=>agendaActive(r)&&politicalAgendaAuthorized(r)).length;

    var phase = state.institutionalPhase || INSTITUTIONAL_PHASES.GOV_IN_OFFICE;
    var govStatusBadge = document.getElementById("govStatusBadge");
    if (govStatusBadge) {
        var govStatusHtml = "";
        if (phase === INSTITUTIONAL_PHASES.GOV_IN_OFFICE || phase === INSTITUTIONAL_PHASES.GOV_APPROVED) {
            govStatusHtml = "Qeveri me Mandat të Plotë";
            govStatusBadge.className = "tag tag-min";
        } else if (phase === INSTITUTIONAL_PHASES.GOV_VOTING) {
            govStatusHtml = "Qeveria në Votim në Kuvend";
            govStatusBadge.className = "tag tag-gold";
        } else if (phase === INSTITUTIONAL_PHASES.GOV_OVERTHROWN) {
            govStatusHtml = "Qeveria u Rrëzua";
            govStatusBadge.className = "tag tag-lvv";
        } else if (phase === INSTITUTIONAL_PHASES.SNAP_ELECTION) {
            govStatusHtml = "Zgjedhje të Reja";
            govStatusBadge.className = "tag tag-lvv";
        } else {
            govStatusHtml = "Në Bisedime për Formimin e Qeverisë";
            govStatusBadge.className = "tag tag-warning";
        }
        govStatusBadge.textContent = govStatusHtml;
    }

    var dipNoteHtml = "";
    if (state.dialogueInvitation && state.dialogueInvitation.active && state.dialogueInvitation.responseStatus === "PENDING") {
        dipNoteHtml = '<div style="margin-top:8px; background:rgba(245,158,11,0.12); padding:8px 10px; border-left:3px solid var(--accent-gold); border-radius:6px; font-size:0.78rem;">' +
            '📨 <strong>Ftesë diplomatike aktive</strong> — ' + state.dialogueInvitation.inviter + ' • Afati: edhe ' + state.dialogueInvitation.deadlineWeeks + ' javë ' +
            '<button class="btn-top" style="margin-left:6px;" onclick="switchMainTab(\'tab-diplomacy\')">Shqyrto ▶</button>' +
        '</div>';
    }

    var pendingBills = (state.laws || []).filter(function(l) { return l.status === "SCHEDULED"; }).length;
    if (pendingBills > 0) {
        dipNoteHtml += '<div style="margin-top:8px; background:rgba(37,99,235,0.12); padding:8px 10px; border-left:3px solid var(--accent-blue); border-radius:6px; font-size:0.78rem;">' +
            '⚖️ <strong>' + pendingBills + ' projektligje të caktuara për seancë</strong> presin shqyrtim në Kuvend ' +
            '<button class="btn-top" style="margin-left:6px;" onclick="switchMainTab(\'tab-assembly\'); switchSubTab(\'ass\',\'sessions\', document.querySelectorAll(\'#tab-assembly .sub-pill\')[3]);">Shiko ▶</button>' +
        '</div>';
    }

    var phaseLabel = INSTITUTIONAL_PHASE_LABELS[phase] || "—";
    var instSummary = document.getElementById("institutionalSummary");
    if (instSummary) {
        instSummary.innerHTML =
            '<div>• <strong>Faza Institucionale:</strong> <span style="color:var(--accent-gold);">' + phaseLabel + '</span></div>' +
            '<div>• <strong>President/e e Republikës:</strong> ' + state.presidentName + ' ' + (!state.presidentElected ? '<span style="color:var(--danger);">(Kërkohet votim brenda ' + state.presidentialDeadlineWeeks + ' javësh!)</span>' : '<span style="color:var(--success);">(Në mandat kushtetues)</span>') + '</div>' +
            '<div>• <strong>Kryetar/e e Kuvendit (Legjislatura XI):</strong> ' + state.speakerOfAssembly + '</div>' +
            '<div>• <strong>Kryeministër & Koalicioni:</strong> ' + state.primeMinister + ' (' + coalNames + ' — <strong>' + coalSeats + '/120 ulëse</strong>)</div>' +
            '<div>• <strong>Kërkesa Hyrëse në Agjendën e KM:</strong> <strong style="color:var(--accent-gold);">' + reqCount + ' kërkesa</strong> | <strong>Sektorë Shtetërorë në Zhvillim:</strong> <strong>' + activeSectorProjs + '/15</strong></div>' +
            '<div>• <strong>Projekte Zhvillimore Aktive:</strong> <strong style="color:var(--accent-gold);">' + activeDevProjects + '</strong> projekte në zbatim</div>' +
            dipNoteHtml +
            '<div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">' +
                '<button class="action-btn btn-gold" onclick="switchSubTab(\'dash\', \'inbox\', document.querySelectorAll(\'#tab-dashboard .sub-pill\')[1])">📥 Agjenda e KM (' + reqCount + ')</button>' +
                '<button class="action-btn" onclick="switchSubTab(\'dash\', \'calendar\', document.querySelectorAll(\'#tab-dashboard .sub-pill\')[2])">📅 Kalendari (' + pendingMeetings.length + ')</button>' +
                '<button class="action-btn btn-outline" onclick="openStateDevelopment()">🏗️ Zhvillimi i Shtetit</button>' +
            '</div>';
    }

    var inboxList = (state.pmInboxRequests || []).filter(r=>agendaActive(r)&&politicalAgendaAuthorized(r));
    var quickInbox = document.getElementById("quickInboxPreview");
    if (quickInbox) {
        if (!isPlayerInGovernment()) {
            quickInbox.innerHTML = '<div style="font-size:0.78rem; color:var(--text-muted); padding:10px; background:#0f172a; border-radius:8px;">Ju jeni në opozitë ose tranzicion. Kërkesat e Kryeministrit nuk janë në juridiksionin tuaj. Përdorni tab-in "Kuvendi" për mjete kontrolli parlamentar.</div>';
        } else {
            quickInbox.innerHTML = inboxList.length === 0
                ? '<div style="font-size:0.78rem; color:var(--text-muted);">Nuk keni kërkesa aktive. Të gjitha janë shqyrtuar!</div>'
                : inboxList.slice(0, 2).map(function(req) {
                    var realIdx = state.pmInboxRequests.findIndex(function(r) { return r.id === req.id; });
                    return '<div style="background:#0f172a; border-left:3px solid var(--accent-gold); padding:8px 10px; border-radius:6px; margin-bottom:8px;">' +
                        '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--accent-gold);">' +
                            '<strong>📩 Nga: ' + req.senderName + ' (' + req.senderRole + ')</strong>' +
                            '<span>Afati: ' + req.deadlineWeeks + ' javë</span>' +
                        '</div>' +
                        '<div style="font-size:0.81rem; font-weight:700; margin:3px 0;">' + req.title + '</div>' +
                        '<button class="btn-top" onclick="openPMRequestModal(' + realIdx + ')">Shqyrto & Vendos ▶</button>' +
                    '</div>';
                }).join("");
        }
    }

    var mediaFeed = document.getElementById("mediaFeedList");
    if (mediaFeed) {
        mediaFeed.innerHTML = state.mediaFeed.slice(0, 4).map(function(m, idx) {
            var borderCol = m.tone === "POSITIVE" ? "var(--success)" : (m.tone === "CRITICAL" ? "var(--danger)" : "var(--accent-blue)");
            return '<div class="news-item-clickable" style="border-left-color:' + borderCol + ';" onclick="openNewsArticleModal(' + idx + ')">' +
                '<div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted);">' +
                    '<strong>📰 ' + m.outlet + '</strong>' +
                    '<span>' + m.time + ' • <u style="color:var(--accent-gold);">Lexo të plotë</u></span>' +
                '</div>' +
                '<div style="font-size:0.8rem; margin-top:3px; font-weight:600;">' + m.title + '</div>' +
            '</div>';
        }).join("");
    }

    var pollDate = document.getElementById("pollDateLabel");
    if (pollDate) pollDate.textContent = MONTHS_SQ[state.monthIndex] + " " + state.year;

    var pollBars = document.getElementById("quickPollBars");
    if (pollBars) {
        pollBars.innerHTML = Object.values(state.parties).map(function(p) {
            return '<div class="prog-row">' +
                '<div class="prog-label"><span>' + p.short + ' (' + p.leader.split(" ")[0] + ')</span><span>' + p.poll.toFixed(1) + '% (' + p.seats + ' ulëse)</span></div>' +
                '<div class="prog-track"><div class="prog-fill" style="width:' + Math.min(100, p.poll * 1.6) + '%; background:' + p.color + ';"></div></div>' +
            '</div>';
        }).join("");
    }

    renderPMInboxSection();
    renderCalendarMeetings();
    renderPromisesList();
    renderWeeklyDossiers();

    if (state._developmentReportPending && state.sectorWeeklyReport) {
        var repHtml = '<div class="card" style="border-color:var(--accent-gold); margin-bottom:10px;"><div class="card-header"><div class="card-title">📊 Raporti Javor i Zhvillimit</div><span class="tag tag-gold">Java ' + state.lastDevelopmentReportWeek + '</span></div>' +
            '<div style="font-size:0.78rem; line-height:1.6;">' + state.sectorWeeklyReport + '</div></div>';
        var qInbox2 = document.getElementById("quickInboxPreview");
        if (qInbox2 && qInbox2.parentNode) qInbox2.insertAdjacentHTML("beforebegin", repHtml);
    }

    var filterVal = document.getElementById("historyFilterSelect") ? document.getElementById("historyFilterSelect").value : "ALL";
    var logs = state.historyLog.filter(function(x) {
        if (filterVal === "Media" && x.toLowerCase().includes("medi")) return true;
        if (filterVal === "Media" && x.toLowerCase().includes("komunikat")) return true;
        if (filterVal === "Zhvillim" && (x.toLowerCase().includes("projekt") || x.toLowerCase().includes("zhvillim") || x.toLowerCase().includes("komun"))) return true;
        return filterVal === "ALL" || x.toLowerCase().includes(filterVal.toLowerCase());
    });
    var histLog = document.getElementById("historyLogContainer");
    if (histLog) {
        histLog.innerHTML = logs.map(function(item) {
            return '<div style="padding:7px 10px; border-bottom:1px solid var(--border-glass); font-size:0.79rem;">• ' + item + '</div>';
        }).join("");
    }
}

function resolveActiveEvent(optIdx, expectedEventId) {
    if(!assertGovernmentAuthority('Veprimi i Qeverisë'))return false;
    if (!isPlayerInGovernment()) {
        showToast("Vendimet ekzekutive janë vetëm për Qeverinë në detyrë.");
        return;
    }
    var ev = DYNAMIC_EVENTS[state.currentEventIndex];
    var occurrence=currentUrgentEvent();
    if(!ev || !occurrence || occurrence.status!=='ACTIVE' || expectedEventId && expectedEventId!==occurrence.id || !Number.isInteger(optIdx))return false;
    var opt = ev.options[optIdx];
    if(!opt || state.publicFinance.lastEventTurn===state.turnCount || urgentInterfaceBusy())return false;
    if(state.currentEventIndex===1){var cost=optIdx===0?.11:optIdx===1?.045:0;if(cost>state.budgetTotalB){showToast('Mungojnë fondet për këtë masë.');return false;}}
    if(state.currentEventIndex===1){var authorization=fiscalSpendingCheck(cost,false);if(!authorization.allowed){showToast(authorization.message);return false;}}
    if(ev.id==='ev_brussels_summit'&&northSanctioned(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    var summit=ev.id==='ev_brussels_summit',participant=summitParticipant(occurrence,state);
    if(summit && participant && participant.status!=='ABSENT' && (participant.status!=='ATTENDING' || participant.name!==state.primeMinister || participant.speech)){
        showToast('Kryeministri aktual duhet të pranojë ftesën dhe të marrë pjesë para fjalimit.');return false;
    }
    var beforeUrgent=JSON.stringify(state);
    var summitEU=summit?state.diplomacy.EU.score:null;
    var summitApproval=summit?state.approval:null;
    try{
        state.publicFinance.lastEventTurn=state.turnCount;
        opt.apply(state);
        if(summit && participant?.status==='ATTENDING'){
            if(occurrence.pmParticipation?.name!==participant.name&&occurrence.pmParticipation){occurrence.pmParticipationHistory=occurrence.pmParticipationHistory||[];occurrence.pmParticipationHistory.push({...occurrence.pmParticipation,status:'ABSENT'});}
            occurrence.pmParticipation=participant;
            participant.speech=opt.text;participant.spokenTurn=state.turnCount;
            participant.context='Tema: dialogu dhe plani i zbatimit. Marrëdhëniet me BE-në para fjalimit: '+summitEU+'/100. Siguria në veri: '+state.securityNorth+'/100.';
            participant.result=opt.impactText+' Marrëdhëniet me BE-në: '+summitEU+' → '+state.diplomacy.EU.score+'. '+(optIdx===0?'Kërkesa për garanci vështirëson koordinimin me BE-në.':optIdx===1?'Propozimi u regjistrua për shqyrtim; nuk u garantua marrëveshje ose financim.':'U regjistrua qëndrimi për konsultim me opozitën.');
            participant.result+=' Mbështetja publike: '+summitApproval.toFixed(1)+'% → '+state.approval.toFixed(1)+'%, sipas gjendjes dhe kufijve javorë të mbështetjes.';
        }
        occurrence.status='RESOLVED';occurrence.decisionIndex=optIdx;occurrence.resolvedTurn=state.turnCount;
        occurrence.history.push({turn:state.turnCount,text:opt.text,consequence:opt.impactText});
        state.currentEventIndex++;
        migrateUrgentSituations(state);
        validateUrgentSituations(state);
        if(!saveGameAuto())throw Error('Vendimi nuk u ruajt.');
    }catch(error){state=JSON.parse(beforeUrgent);showToast('Vendimi urgjent nuk u krye: '+error.message);return false;}
    toggleModal('urgentSituationModal',false);
    showMajorAnnouncement({
        badge: ev.category,
        title: "Vendim Ekzekutiv: " + ev.title,
        reason: ev.cause,
        immediateImpact: opt.impactText,
        futureImpact: "Mediat dhe grupet parlamentare kanë regjistruar qëndrimin tuaj; sondazhet dhe raportet diplomatike u përditësuan."
    });
    advanceTime(1, true);
    renderUrgentSituations();
    return true;
}

/* ============================================================================
   22. RENDER INBOX KM
   ============================================================================ */

function renderPMInboxSection() {
    var container = document.getElementById("pmInboxListContainer");
    if (!container) return;

    if (!agendaExecutive()) {
        container.innerHTML = '<div style="background:#0f172a; padding:14px; border-radius:8px; font-size:0.82rem; color:var(--text-muted);">' +
            'Ju jeni në opozitë ose tranzicion. Kërkesat e Kryeministrit dhe detyrat ekzekutive nuk janë në juridiksionin tuaj. ' +
            'Mund të ushtroni kontroll parlamentar përmes mocioneve dhe interpelancave në tab-in "Kuvendi".</div>';
        return;
    }

    var list = state.pmInboxRequests || [];
    if (list.length === 0) {
        container.innerHTML = '<div style="background:#0f172a; padding:14px; border-radius:8px; font-size:0.82rem; color:var(--text-muted);">Nuk ka kërkesa në tavolinën e Kryeministrit. Klikoni butonin lart për raportimet e reja.</div>';
        return;
    }

    container.innerHTML = list.map(function(req, idx) {
        var isPending = req.status === "PENDING";
        var borderCol = isPending ? (req.urgency === "E LARTË" ? "var(--danger)" : "var(--accent-gold)") : (req.status === "COMPLETED" ? "var(--success)" : "#475569");
        var tagCls = req.status === "COMPLETED" ? "tag-min" : (req.status === "EXPIRED" ? "tag-sl" : (req.urgency === "E LARTË" ? "tag-lvv" : "tag-gold"));
        var statusTxt = req.status === "COMPLETED" ? "E PËRFUNDUAR" : (req.status === "EXPIRED" ? "E SKADUAR" : req.urgency);

        var actionHtml = "";
        if (isPending) {
            actionHtml = '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
                '<button class="action-btn btn-gold" onclick="openPMRequestModal(' + idx + ')">🗂️ Hap Kërkesën & Merr Vendim ▶</button>' +
                '<button class="action-btn btn-outline" onclick="postponePMRequest(' + idx + ')">⏳ Shtyj për 2 javë — rrezik pakënaqësie</button>' +
            '</div>';
        } else {
            actionHtml = '<div style="font-size:0.75rem; color:' + (req.status === "COMPLETED" ? 'var(--success)' : 'var(--danger)') + '; margin-bottom:8px;"><strong>Rezultati:</strong> ' + (req.outcomeMsg || "Nuk u mor asnjë vendim në kohë.") + '</div>' +
                '<button class="action-btn btn-outline" onclick="archivePMRequest(' + idx + ')">📁 Arkivo Detyrën</button>';
        }

        return '<div class="card" style="background:#0f172a; margin-bottom:10px; border-left:4px solid ' + borderCol + ';">' +
            '<div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:6px;">' +
                '<div>' +
                    '<span class="tag ' + tagCls + '">' + req.category + ' • ' + statusTxt + '</span>' +
                    '<h4 style="font-size:0.9rem; margin-top:5px;">' + req.title + '</h4>' +
                    '<div style="font-size:0.75rem; color:var(--accent-gold);">Dërguesi: <strong>' + req.senderName + '</strong> — ' + req.senderRole + '</div>' +
                '</div>' +
                (isPending ? '<span class="tag tag-pdk">Afati: ' + req.deadlineWeeks + ' javë</span>' : '') +
            '</div>' +
            (isPending ? '<p style="font-size:0.8rem; color:#cbd5e1; margin-bottom:6px;">' + req.desc + '</p><div style="font-size:0.74rem; color:var(--danger); margin-bottom:10px;">⚠️ ' + publicSupportConsequence(req.consequenceText) + '</div>' : '') +
            actionHtml +
        '</div>';
    }).join("");
}

function openPMRequestModal(reqIdx) {
    if(state.pmInboxRequests[reqIdx]?.agenda6)return openAgendaTask(state.pmInboxRequests[reqIdx].id);
    if(state.pmInboxRequests[reqIdx]?.municipal14)return openMunicipal14Request(state.pmInboxRequests[reqIdx].id);
    if (!assertGovernmentAuthority("Shqyrtimi i kërkesave të Kryeministrit")) return;
    var req = state.pmInboxRequests[reqIdx];
    if (!req || req.status !== "PENDING") return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var optsHtml = req.options.map(function(opt, oIdx) {
        var costM = ((opt.costB || 0) * 1000).toFixed(0);
        return '<button class="choice-btn" onclick="resolvePMRequest(' + reqIdx + ', ' + oIdx + ')">' +
            '<span class="choice-title">' + (oIdx + 1) + '. ' + opt.label + '</span>' +
            '<span class="choice-impact">Kosto e menjëhershme: €' + costM + 'M · ' + publicSupportReaction(opt.appDelta || 0) + '</span>' +
        '</button>';
    }).join("");

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">📥 Dosje në Agjendën e Kryeministrit: ' + req.senderName + '</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="font-size:0.76rem; color:var(--accent-gold); margin-bottom:6px;">' + req.senderRole + ' • ' + req.category + ' (Afati: ' + req.deadlineWeeks + ' javë)</div>' +
        '<h3 style="font-size:0.98rem; margin-bottom:8px;">' + req.title + '</h3>' +
        '<div class="chat-bubble chat-them"><strong>' + req.senderName + ':</strong> "' + req.desc + '"</div>' +
        '<div style="font-size:0.75rem; color:var(--danger); margin-bottom:12px;">⚠️ Pasojat e mosveprimit: ' + publicSupportConsequence(req.consequenceText) + '</div>' +
        (typeof uxDecisionContext==='function'?uxDecisionContext(req):'') +
        '<div style="display:flex; flex-direction:column; gap:7px;">' +
            optsHtml +
            '<button class="choice-btn" onclick="rejectPMRequest(' + reqIdx + ')" style="border-color:rgba(239,68,68,0.4);">' +
                '<span class="choice-title" style="color:var(--danger);">Refuzo Kërkesën për shkak të kufizimeve buxhetore</span>' +
                '<span class="choice-impact">Ruan buxhetin, por shkakton pakënaqësi te ' + req.senderName + '; pala kërkuese mund të reagojë me kritika</span>' +
            '</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function resolvePMRequest(reqIdx, optIdx) {
    if(state.pmInboxRequests[reqIdx]?.municipal14)return resolveMunicipal14Request(state.pmInboxRequests[reqIdx].id,'APPROVE');
    if (!assertGovernmentAuthority("Miratimi i kërkesave të Kryeministrit")) return;
    var req = state.pmInboxRequests[reqIdx];
    if (!req || !agendaExecutive() || (req.agenda6 ? req.status!=="WAIT_DECISION" || req.dueTurn<state.turnCount : req.status!=="PENDING")) return false;
    if(req.requiresAssembly && !assertAssemblyFunctional('Raportimi në Kuvend'))return false;
    if(req.cabinetItemId){showToast('Dosja pret vendimin e mbledhjes së Qeverisë.');return false;}
    var opt = req.options[optIdx];
    if(!opt)return false;
    var financial=checkFinancialConstraint(opt.costB || 0,req.title);
    if(!financial.allowed){showToast(financial.message);return false;}
    var beforeRequest=JSON.stringify(state);
    if(financial.useReserve)fiscalSetBalance(state,"fiscalReserve",+(state.fiscalReserve-financial.shortfall).toFixed(9),"resolvePMRequest");
    fiscalSetBalance(state,"budgetTotalB",+(Math.max(0, state.budgetTotalB - (opt.costB || 0))).toFixed(9),"resolvePMRequest");
    adjustPublicSupport(((req.agenda6 ? opt.appDelta || 0 : opt.appDelta || 1.0)), {source:"resolvePMRequest"}, state);

    if (opt.dipBonus) {
        state.diplomacy.USA.score = clamp(state.diplomacy.USA.score + opt.dipBonus, 10, 100);
        state.diplomacy.EU.score = clamp(state.diplomacy.EU.score + opt.dipBonus, 10, 100);
    }
    if (opt.secId) {
        var sec = (state.stateSectors || []).find(function(s) { return s.id === opt.secId; });
        if (sec) sec.score = clamp(sec.score + 5, 10, 100);
    }
    if(req.agenda6 && opt.municipalityId){
        var municipality=state.municipalities.find(function(m){return m.id===opt.municipalityId;});
        if(municipality)municipality.relationWithGov=clamp((municipality.relationWithGov || 60)+10,0,100);
    }

    req.status = "COMPLETED";
    req.completedTurn=state.turnCount;
    req.outcomeMsg = opt.outcome;
    if(!saveGameAuto()){state=JSON.parse(beforeRequest);return false;}

    toggleModal("interactiveActionModal", false);
    addMediaNews("Kryeministria / RTK", "Kryeministri shqyrton kërkesën e " + req.senderName + ": " + opt.outcome, "POSITIVE");
    refreshAllUI();
    showToast("Vendimi u mor dhe detyra u shënua e përfunduar!");
}

function rejectPMRequest(reqIdx) {
    if(state.pmInboxRequests[reqIdx]?.municipal14)return resolveMunicipal14Request(state.pmInboxRequests[reqIdx].id,'REJECT');
    if (!assertGovernmentAuthority("Refuzimi i kërkesave të Kryeministrit")) return;
    var req = state.pmInboxRequests[reqIdx];
    if (!req || !agendaExecutive() || !agendaActive(req)) return false;
    var beforeRequest=JSON.stringify(state);
    adjustPublicSupport(-(1.5), {source:"rejectPMRequest"}, state);
    req.status = "COMPLETED";
    req.outcomeMsg = "Kërkesa u refuzua zyrtarisht.";
    req.completedTurn=state.turnCount;
    if(!saveGameAuto()){state=JSON.parse(beforeRequest);return false;}
    toggleModal("interactiveActionModal", false);
    addMediaNews("Gazeta Express", "Kryeministri refuzon kërkesën e " + req.senderName + " për \"" + req.title + "\".", "CRITICAL");
    refreshAllUI();
    showToast("Kërkesa u refuzua!");
}

function postponePMRequest(reqIdx) {
    if(state.pmInboxRequests[reqIdx]?.agenda6){showToast('Afati i dosjes së re është i përcaktuar; përfundoni shqyrtimin para afatit.');return false;}
    if(state.pmInboxRequests[reqIdx]?.municipal14)return resolveMunicipal14Request(state.pmInboxRequests[reqIdx].id,'DEFER');
    if (!assertGovernmentAuthority("Shtyrja e kërkesave të Kryeministrit")) return;
    var req = state.pmInboxRequests[reqIdx];
    if (!req) return;
    req.deadlineWeeks += 2;
    adjustPublicSupport(-(0.4), {source:"postponePMRequest"}, state);
    refreshAllUI();
    showToast("Shqyrtimi i kërkesës u shty për 2 javë.");
}

function archivePMRequest(idx) {
    if(state.pmInboxRequests[idx]?.agenda6){showToast('Dosja ruhet në arkivin e agjendës për të parandaluar përsëritjen.');return false;}
    if(state.pmInboxRequests[idx]?.municipal14){showToast('Kërkesa komunale ruhet në historikun e komunës.');return false;}
    if (!assertGovernmentAuthority("Arkivimi i kërkesave të Kryeministrit")) return;
    state.pmInboxRequests.splice(idx, 1);
    refreshAllUI();
}

function generateDynamicIncomingRequest(manualTrigger) {
    if(!agendaExecutive()){showToast('Raportimet ekzekutive kërkojnë rolin e Kryeministrit me mandat të plotë.');return false;}
    var changed;
    if(!agendaCommit(function(){changed=processWeeklyAgenda();}))return false;
    if(manualTrigger){showToast(changed?'Agjenda e javës u përditësua.':'Raportimet e kësaj jave janë regjistruar tashmë.');}
    return changed;
}

/* ============================================================================
   23. KALENDARI I TAKIMEVE
   ============================================================================ */

function renderCalendarMeetings() { renderStateCalendar(); }

function getInterlocutorsByCategory(catCode) {
    var list = [];
    if (catCode === "INST_KOSOVO") {
        list.push(
            { name: state.presidentName, role: "Presidente e Republikës së Kosovës", inst: "Presidenca e Kosovës", rel: 82 },
            { name: state.speakerOfAssembly, role: "Kryetare e Kuvendit të Kosovës", inst: "Kuvendi i Kosovës", rel: 88 },
            { name: "Glauk Konjufca", role: "Zëvendëskryeministër i Parë & Ministër i Jashtëm", inst: "Kryeministria / MPJD", rel: 94 },
            { name: "Donika Gërvalla-Schwarz", role: "Zëvendëskryeministre & Ministre e Drejtësisë", inst: "Qeveria e Kosovës", rel: 90 },
            { name: "Emilija Redžepi", role: "Zëvendëskryeministre e Tretë për Çështje të Pakicave", inst: "Qeveria e Kosovës", rel: 88 },
            { name: "Gjeneralleitnant Bashkim Jashari", role: "Komandant i Forcës së Sigurisë së Kosovës (FSK)", inst: "FSK / Mbrojtja", rel: 92 },
            { name: "Gazmend Hoxha", role: "Drejtor i Përgjithshëm i Policisë së Kosovës", inst: "Policia e Kosovës", rel: 90 },
            { name: "Kreshnik Radoniqi", role: "Kryetar i Komisionit Qendror të Zgjedhjeve (KQZ)", inst: "KQZ", rel: 80 },
            { name: "Ahmet Ismaili", role: "Guvernator i Bankës Qendrore të Kosovës (BQK)", inst: "BQK", rel: 84 }
        );
    } else if (catCode === "PARTY_LEADERS") {
        Object.values(state.parties).forEach(function(p) {
            list.push({
                name: p.leader + " (" + p.short + ")",
                role: "Kryetar i " + p.name,
                inst: p.seats + " Deputetë në Kuvend",
                rel: state.parties[state.playerParty].relations[p.id] || 50
            });
            p.deputyLeaders.forEach(function(dl) {
                list.push({
                    name: dl + " (" + p.short + ")",
                    role: "Nënkryetar/e e " + p.short,
                    inst: p.name,
                    rel: state.parties[state.playerParty].relations[p.id] || 50
                });
            });
        });
    } else if (catCode === "MINISTERS") {
        state.ministries.forEach(function(m) {
            list.push({
                name: m.minister,
                role: "Ministër/e (" + m.party + ")",
                inst: m.name,
                rel: m.loyalty
            });
        });
    } else if (catCode === "MPS_120") {
        state.mps.forEach(function(mp) {
            list.push({
                name: "#" + mp.seatNumber + " " + mp.name + " (" + mp.party + ")",
                role: mp.role,
                inst: "Grupi Parlamentar " + mp.party + " • Rajoni " + mp.region,
                rel: mp.trustPlayer || mp.loyalty
            });
        });
    } else if (catCode === "MAYORS_38") {
        state.municipalities.forEach(function(m) {
            list.push({
                name: m.mayorName + " (Kryetar i " + m.name + ")",
                role: "Kryetar Komune (" + m.mayorParty + ")",
                inst: "Komuna e " + m.name + " (" + m.region + ")",
                rel: m.relationWithGov || 60
            });
        });
    } else if (catCode === "INTL_DIPLOMATS") {
        list.push(
            { name: "Përfaqësuesi i Lartë i SHBA-së / Ambasadori Amerikan në Prishtinë", role: "Ambasada e SHBA-së & Departamenti i Shtetit", inst: "SHBA (Uashington / Prishtinë)", rel: state.diplomacy.USA.score },
            { name: "Përfaqësuesi Special i BE-së për Dialogun & Shefi i Zyrës së BE-së", role: "Komisioni Evropian & EEAS", inst: "Bashkimi Evropian (Bruksel)", rel: state.diplomacy.EU.score },
            { name: "Ambasadori i Republikës Federale të Gjermanisë & Emisari Gjerman", role: "Ambasada Gjermane / Kancelaria në Berlin", inst: "Gjermania (QUINT)", rel: state.diplomacy.GERMANY.score },
            { name: "Ambasadori i Republikës së Francës në Kosovë", role: "Ambasada Franceze / Quai d'Orsay", inst: "Franca (QUINT)", rel: state.diplomacy.GERMANY.score },
            { name: "Ambasadori i Mbretërisë së Bashkuar & Emisari Britanik", role: "Foreign, Commonwealth & Development Office", inst: "Mbretëria e Bashkuar (Londër)", rel: state.diplomacy.UK ? state.diplomacy.UK.score : 86 },
            { name: "Komandanti i Misionit të NATO-s (COMKFOR)", role: "Komanda e KFOR-it në Prishtinë (Camp Film City)", inst: "NATO / KFOR", rel: 88 },
            { name: "Kryeministri & Ambasadori i Republikës së Shqipërisë", role: "Këshilli i Ministrave të Shqipërisë", inst: "Shqipëria (Tiranë)", rel: state.diplomacy.ALBANIA.score },
            { name: "Ambasadori i Republikës së Turqisë në Kosovë", role: "Ambasada Turke / Ministria e Jashtme", inst: "Turqia (Ankara)", rel: state.diplomacy.TURKEY.score }
        );
    } else if (catCode === "CIVIL_ECON") {
        list.push(
            { name: "Lulzim Rafuna (Kryetar i Odës Ekonomike të Kosovës - OEK)", role: "Përfaqësues i Bizneseve dhe Prodhuesve", inst: "Oda Ekonomike e Kosovës", rel: 74 },
            { name: "Arian Zeka (Oda Ekonomike Amerikane në Kosovë)", role: "Drejtor Ekzekutiv", inst: "AmCham Kosovo", rel: 76 },
            { name: "Rrahman Jasharaj (Kryetar i SBASHK-ut)", role: "Kryetar i Sindikatës së Arsimit", inst: "SBASHK / BSPK", rel: 52 },
            { name: "Ehat Miftaraj (Instituti i Kosovës për Drejtësi - IKD)", role: "Drejtor Ekzekutiv / Shoqëria Civile", inst: "IKD / Monitorimi i Drejtësisë", rel: 70 },
            { name: "Mexhide Demolli-Nimani (Lëvizja FOL) & KDI", role: "Koalicioni i OJQ-ve për Transparencë", inst: "Shoqëria Civile në Kosovë", rel: 72 },
            { name: "Rrjeti i Bizneseve të Diasporës Shqiptare (Gjermani & Zvicër)", role: "Kryesia e Investitorëve të Mërgatës", inst: "Unioni i Bizneseve Shqiptare", rel: 88 }
        );
    }

    (state.customInterlocutors || []).forEach(function(ci) {
        if (ci.cat === catCode) list.push(ci);
    });
    return list;
}

function openScheduleMeetingModal(defaultCat, preselectedName) {
    if(!agendaExecutive() && ["MINISTERS","MAYORS_38","INST_KOSOVO"].includes(defaultCat)){showToast("Përdorni kontaktet politike të rolit tuaj.");return false;}
    if (!defaultCat) defaultCat = "PARTY_LEADERS";
    if (!preselectedName) preselectedName = "";
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">📅 Cakto Takim Zyrtar — Zgjidh nga Databaza e Republikës së Kosovës</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div class="grid-2" style="margin-bottom:10px;">' +
            '<div>' +
                '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">1. Zgjidh Kategorinë:</label>' +
                '<select id="schedCat" style="width:100%;" onchange="populateInterlocutorDropdown()">' +
                    '<option value="INST_KOSOVO">🏛️ Udhëheqës Institucionalë (Presidenca, Kuvendi, FSK, BQK)</option>' +
                    '<option value="PARTY_LEADERS" ' + (defaultCat === "PARTY_LEADERS" ? "selected" : "") + '>🚩 Kryetarë & Përfaqësues të Partive</option>' +
                    '<option value="MINISTERS">💼 15 Ministrat & Zëvendëskryeministrat</option>' +
                    '<option value="MPS_120">👥 120 Deputetët e Kuvendit</option>' +
                    '<option value="MAYORS_38">📍 38 Kryetarët e Komunave</option>' +
                    '<option value="INTL_DIPLOMATS">🌍 Përfaqësues të SHBA, BE, Gjermanisë, NATO & Shqipërisë</option>' +
                    '<option value="CIVIL_ECON">🏭 Odat Ekonomike, Sindikatat & Shoqëria Civile</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">2. Kërko:</label>' +
                '<input type="text" id="schedFilterInput" placeholder="Kërko emër, pozitë, parti..." style="width:100%;" oninput="populateInterlocutorDropdown()">' +
            '</div>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.74rem; color:var(--text-muted); display:block; margin-bottom:4px;">3. Zgjidh Personin:</label>' +
            '<select id="schedTargetSelect" style="width:100%;" onchange="updateSelectedInterlocutorInfo()"></select>' +
            '<div id="selectedInterlocutorMeta" style="font-size:0.75rem; color:var(--accent-gold); margin-top:5px;"></div>' +
        '</div>' +
        '<details style="margin-bottom:10px; background:#0f172a; padding:8px 10px; border-radius:8px; border:1px solid var(--border-glass);">' +
            '<summary style="font-size:0.74rem; color:var(--text-muted); cursor:pointer;">➕ Shto person të ri në databazë</summary>' +
            '<div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">' +
                '<input type="text" id="newCustomInterName" placeholder="Emri dhe Mbiemri" style="flex:1;">' +
                '<input type="text" id="newCustomInterRole" placeholder="Pozita / Institucioni" style="flex:1;">' +
                '<button class="action-btn btn-success" onclick="addCustomInterlocutorToDB()">+ Shto</button>' +
            '</div>' +
        '</details>' +
        '<div class="grid-2" style="margin-bottom:10px;">' +
            '<div>' +
                '<label style="font-size:0.74rem; color:var(--text-muted); display:block; margin-bottom:4px;">4. Koha:</label>' +
                '<select id="schedWeeksOffset" style="width:100%;">' +
                    '<option value="1">Java e Ardhshme (+1 Javë) — Ora 10:00</option>' +
                    '<option value="2">Pas 2 Javësh — Ora 14:00</option>' +
                    '<option value="0">Sot (Takim Urgjent — Ora 16:30)</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label style="font-size:0.74rem; color:var(--text-muted); display:block; margin-bottom:4px;">5. Tema:</label>' +
                '<select id="schedTopic" style="width:100%;">' +
                    '<option value="Koalicioni, Ndarja e Përgjegjësive dhe Votimi në Kuvend">Koalicioni & Votimi</option>' +
                    '<option value="Kuorumi dhe Konsensusi për Zgjedhjen e Presidentit">Kuorumi & Presidenti</option>' +
                    '<option value="Mbështetja për Projektligjet dhe Marrëveshjet Ndërkombëtare (80 vota)">Projektligjet & 80 vota</option>' +
                    '<option value="Koordinimi për Dialogun në Bruksel dhe Sigurinë në Veri">Brukseli & Siguria</option>' +
                    '<option value="Buxheti Sektorial dhe Projektet Kapitale Komunale">Buxheti & Komunat</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.74rem; color:var(--text-muted); display:block; margin-bottom:4px;">6. Qëllimi:</label>' +
            '<input type="text" id="schedGoal" value="Arritja e marrëveshjes konkrete dhe koordinimi institucional" style="width:100%;">' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="confirmScheduleMeeting()">📌 Regjistro Takimin</button>';
    toggleModal("interactiveActionModal", true);
    window._preselectedInterlocutor = preselectedName;
    document.getElementById('schedCat').value=defaultCat;
    populateInterlocutorDropdown();
    enhanceThematicMeetingForm();
}

function populateInterlocutorDropdown() {
    var catEl = document.getElementById("schedCat");
    var filterEl = document.getElementById("schedFilterInput");
    var sel = document.getElementById("schedTargetSelect");
    if (!catEl || !sel) return;
    var cat = catEl.value;
    var filterTxt = (filterEl ? filterEl.value : "").toLowerCase();
    var rawList = getInterlocutorsByCategory(cat);

    var filtered = rawList.filter(function(item) {
        return !filterTxt ||
            item.name.toLowerCase().includes(filterTxt) ||
            item.role.toLowerCase().includes(filterTxt) ||
            item.inst.toLowerCase().includes(filterTxt);
    });

    if (filtered.length === 0) {
        sel.innerHTML = '<option value="Zyrtar i Ftuar">Nuk u gjet me këtë filtër — përdor fushën shtesë poshtë</option>';
        return;
    }

    sel.innerHTML = filtered.map(function(item) {
        return '<option value="' + item.name + '" data-role="' + item.role + '" data-inst="' + item.inst + '" data-rel="' + item.rel + '">' +
            item.name + ' — ' + item.role + ' [' + item.inst + '] (Raporti: ' + item.rel + '/100)' +
        '</option>';
    }).join("");

    if (window._preselectedInterlocutor) {
        for (var i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value.includes(window._preselectedInterlocutor)) {
                sel.selectedIndex = i;
                break;
            }
        }
        window._preselectedInterlocutor = "";
    }
    updateSelectedInterlocutorInfo();
}

function updateSelectedInterlocutorInfo() {
    var sel = document.getElementById("schedTargetSelect");
    var meta = document.getElementById("selectedInterlocutorMeta");
    if (!sel || !sel.selectedOptions[0] || !meta) return;
    var opt = sel.selectedOptions[0];
    meta.innerHTML = '👤 <strong>' + opt.value + '</strong> • Pozita: ' + (opt.getAttribute("data-role") || '') + ' • Institucioni: ' + (opt.getAttribute("data-inst") || '') + ' • Marrëdhënia: <strong>' + (opt.getAttribute("data-rel") || 70) + '/100</strong>';
}

function addCustomInterlocutorToDB() {
    var catEl = document.getElementById("schedCat");
    var nameEl = document.getElementById("newCustomInterName");
    var roleEl = document.getElementById("newCustomInterRole");
    if (!catEl || !nameEl) return;
    var cat = catEl.value;
    var n = nameEl.value.trim();
    var r = roleEl ? (roleEl.value.trim() || "Përfaqësues Zyrtar") : "Përfaqësues Zyrtar";
    if (!n) { showToast("Shkruani emrin e personit!"); return; }
    if (!state.customInterlocutors) state.customInterlocutors = [];
    state.customInterlocutors.push({ cat: cat, name: n, role: r, inst: "I shtuar në databazë", rel: 70 });
    window._preselectedInterlocutor = n;
    populateInterlocutorDropdown();
    showToast(n + " u shtua në listën përzgjedhëse!");
}

function confirmScheduleMeeting() {
    var sel = document.getElementById("schedTargetSelect");
    if (!sel) return;
    var opt = sel.selectedOptions[0];
    var targetName = opt ? opt.value : "Përfaqësues Zyrtar";
    var categoryLabel = opt ? (opt.getAttribute("data-role") + " (" + opt.getAttribute("data-inst") + ")") : "Takim Zyrtar";
    var offsetEl = document.getElementById("schedWeeksOffset");
    var topicEl = document.getElementById("schedTopic");
    var goalEl = document.getElementById("schedGoal");
    var offset = parseInt(offsetEl ? offsetEl.value : "1", 10);
    var topic = topicEl ? topicEl.value : "Takim zyrtar";
    var goal = goalEl ? goalEl.value.trim() : "";
    var cat=document.getElementById('schedCat')?.value;
    if(['MINISTERS','MAYORS_38','INST_KOSOVO'].includes(cat) && !agendaExecutive()){showToast('Ky takim kërkon kompetencat e Kryeministrit me mandat të plotë.');return false;}
    if(!Number.isInteger(offset) || offset<0 || offset>12 || !topic.trim() || !goal || !getInterlocutorsByCategory(cat).some(function(p){return p.name===targetName;})){showToast('Zgjidhni një bashkëbisedues, temën, qëllimin dhe javën e vlefshme të takimit.');return false;}
    if(state.scheduledMeetings.some(function(m){return ['INVITED','SCHEDULED'].includes(m.status) && m.targetName===targetName && m.dueTurn===state.turnCount+offset;})){showToast('Takimi me këtë bashkëbisedues është regjistruar për atë javë.');return false;}
    var beforeMeeting=JSON.stringify(state);

    var newMeet = {
        id: "meet_" + Date.now(),
        category: categoryLabel,
        targetName: targetName,
        topic: topic,
        goal: goal,
        hour: offset === 0 ? "16:30" : "10:00",
        dueTurn: state.turnCount + offset,
        status: "SCHEDULED",
        outcome: null
    };
    if (!state.scheduledMeetings) state.scheduledMeetings = [];
    state.scheduledMeetings.unshift(newMeet);
    newMeet.ownerParty=state.playerParty;newMeet.categoryKey=cat;newMeet.political9=!agendaExecutive();
    if(agendaExecutive()){newMeet.agenda6=true;newMeet.requiresExecutive=true;newMeet.origin='ORGANIZED';newMeet.createdTurn=state.turnCount;newMeet.importance='Mesatare';}
    try{attachThematicMeeting(newMeet);validateLoadedState(state);}catch(error){state=JSON.parse(beforeMeeting);showToast(error.message);return false;}
    if(!saveGameAuto()){state=JSON.parse(beforeMeeting);return false;}
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    if (offset === 0) {
        conductScheduledMeeting(0);
    } else {
        showToast("Ftesa për " + targetName + " u regjistrua! Takimi do të zhvillohet pas " + offset + " jave.");
    }
}

/* ============================================================================
   24. SKENA E TAKIMEVE DHE KOMUNIKIMET
   ============================================================================ */

function conductScheduledMeeting(meetIdx) {
    var m = state.scheduledMeetings[meetIdx];
    if (!m || m.status !== "SCHEDULED") return;
    if(m.lawNegotiationKey)return conductLawNegotiationMeeting(meetIdx);
    openMeetingScene(meetIdx);
}

function openMeetingScene(meetIdx) { return openScheduledVisualMeeting(meetIdx); }
function finalizeMeetingScene(meetIdx, decisionCode) { return decideScheduledVisualMeeting(meetIdx, decisionCode); }

/* ============================================================================
   25. KONFERENCA PËR MEDIA
   ============================================================================ */

function startPressConference() {
    if(!assertGovernmentAuthority('Veprimi i Qeverisë'))return false;
    if (!isPlayerInGovernment()) {
        showToast("Konferencat për media nga Kryeministria janë vetëm për Qeverinë në detyrë.");
        return;
    }
    if(state.activePressSession){renderCurrentPressQuestion();return;}
    var topicEl = document.getElementById("pressTopicSelect");
    var toneEl = document.getElementById("pressToneSelect");
    var partnerEl = document.getElementById("pressPartnerSelect");
    var topic = topicEl ? topicEl.value : "Temë e përgjithshme";
    var tone = toneEl ? toneEl.value : "INSTITUTIONAL";
    var partner = partnerEl ? partnerEl.value : "SOLO";

    state.activePressSession = {
        topic: topic, tone: tone, partner: partner, step: 1, maxSteps: 3, transcript: [],
        questions: [
            { journalist: "Gazetari Politik (KOHA / KTV)", q: "Z. Kryeministër, në lidhje me temën e sotme (" + topic + "), qytetarët dhe opozita kërkojnë afate konkrete. A po merrni sot zotim me afat apo po kërkoni më shumë kohë?" },
            { journalist: "Gazetarja Hulumtuese (Betimi për Drejtësi / Kallxo)", q: "Pyetje përcjellëse: Koalicioni aktual ka " + getCoalitionSeats() + " deputetë në Kuvend dhe buxheti është €" + state.budgetTotalB.toFixed(2) + " Mld. Si do t'i siguroni votat në Kuvend pa kompromis me opozitën?" },
            { journalist: "Korrespondenti Diplomatik (T7 / Klan Kosova)", q: "Pyetja e tretë: Ambasadat e QUINT-it (Raporti: " + state.diplomacy.USA.score + "/100) vëzhgojnë vendimet e Qeverisë. Cili është mesazhi juaj për Uashingtonin dhe Brukselin sot?" }
        ]
    };
    renderCurrentPressQuestion();saveGameAuto();
}

function renderCurrentPressQuestion() {
    var sess = state.activePressSession;
    var stage = document.getElementById("pressLiveStage");
    if (!sess || !stage) { if (stage) stage.style.display = "none"; return; }
    stage.style.display = "block";

    var currQ = sess.questions[sess.step - 1];
    var transHtml = sess.transcript.length > 0
        ? '<div style="margin-bottom:10px; max-height:140px; overflow-y:auto; padding:8px; background:#090e1a; border-radius:8px; font-size:0.75rem;">' +
            sess.transcript.map(function(t) { return '<div style="margin-bottom:4px;"><strong>' + t.who + ':</strong> ' + t.text + '</div>'; }).join("") +
          '</div>'
        : "";

    stage.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
            '<span style="font-size:0.78rem; color:var(--accent-gold); font-weight:700;">🔴 DREJTPËRDREJT — PYETJA ' + sess.step + ' NGA ' + sess.maxSteps + '</span>' +
            '<button class="btn-top" onclick="finishFullPressConference()">Përfundo</button>' +
        '</div>' +
        transHtml +
        '<div style="background:#0f172a; padding:12px; border-radius:8px; border-left:4px solid var(--accent-blue); margin-bottom:12px;">' +
            '<div style="font-size:0.74rem; color:var(--text-muted); margin-bottom:4px;">🎤 Pyetja #' + sess.step + ' nga <strong>' + currQ.journalist + '</strong>:</div>' +
            '<div style="font-size:0.86rem; font-style:italic;">"' + currQ.q + '"</div>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<div style="display:flex; gap:6px;">' +
                '<input type="text" id="freePressAnswerInput" placeholder="Shkruaj deklaratën tënde të lirë këtu..." style="flex:1;">' +
                '<button class="action-btn btn-gold" onclick="submitPressAnswer(\'FREE_TEXT\')">Deklaro ▶</button>' +
            '</div>' +
        '</div>' +
        '<div>' +
            '<button class="choice-btn" onclick="submitPressAnswer(\'DIRECT_FACTS\')">' +
                '<span class="choice-title">1. Përgjigje e drejtpërdrejtë me shifra dhe fakte institucionale</span>' +
                '<span class="choice-impact">Sqarimi u ofrohet mediave; besimi varet nga saktësia dhe rezultatet</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="submitPressAnswer(\'PUBLIC_PROMISE\')">' +
                '<span class="choice-title">2. Premto veprim konkret brenda 14 javëve</span>' +
                '<span class="choice-impact">Regjistrohet një zotim me afat; publiku pret realizimin</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="submitPressAnswer(\'COOPERATIVE_ALLIES\')">' +
                '<span class="choice-title">3. Fto opozitën dhe partnerët ndërkombëtarë për bashkëpunim shtetëror</span>' +
                '<span class="choice-impact">+4 pikë diplomaci & raport ndërpartiak</span>' +
            '</button>' +
        '</div>';
    decoratePoliticalScene("pressLiveStage","PRESS",{name:currQ.journalist,role:"Pyetje nga media",topic:sess.topic,detail:currQ.q,stage:"Pyetja "+sess.step+" nga "+sess.maxSteps});
}

function submitPressAnswer(ansType) {
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    var sess = state.activePressSession;
    if (!sess) return;
    if(!["FREE_TEXT","DIRECT_FACTS","PUBLIC_PROMISE","COOPERATIVE_ALLIES"].includes(ansType))return false;
    var currQ = sess.questions[sess.step - 1];
    var freeTxtEl = document.getElementById("freePressAnswerInput");
    var freeTxt = freeTxtEl ? freeTxtEl.value.trim() : "";

    if(ansType==="FREE_TEXT" && !freeTxt){showToast("Shkruani deklarat\u00ebn p\u00ebrpara d\u00ebrgimit.");return false;}
    var answerSummary = "";
    if (ansType === "FREE_TEXT" && freeTxt) {
        answerSummary = freeTxt;
        adjustPublicSupport((1.8), {source:"submitPressAnswer"}, state);
    } else if (ansType === "PUBLIC_PROMISE") {
        answerSummary = "Qeveria merr zotim zyrtar që brenda 14 javëve të përmbushë këtë masë.";
        adjustPublicSupport((2.8), {source:"submitPressAnswer"}, state);
        state.promises.push({
            id: "prom_press_" + Date.now(),
            title: "Zotim në Konferencë (" + sess.topic + "): Paketa e re ekzekutive",
            deadlineWeeks: 14,
            costB: 0.06,
            progress: 15,
            fulfilled: false,
            source: "Konferencë për Shtyp (" + MONTHS_SQ[state.monthIndex] + " " + state.year + ")"
        });
    } else if (ansType === "COOPERATIVE_ALLIES") {
        answerSummary = "Shtrijmë dorën e bashkëpunimit për opozitën dhe aleatët tanë strategjikë SHBA e BE.";
        state.diplomacy.USA.score = clamp(state.diplomacy.USA.score + 4, 10, 100);
        state.diplomacy.EU.score = clamp(state.diplomacy.EU.score + 4, 10, 100);
        adjustPublicSupport((1.2), {source:"submitPressAnswer"}, state);
    } else {
        answerSummary = "Të dhënat tona buxhetore dhe ligjore tregojnë përparim të qëndrueshëm.";
        adjustPublicSupport((1.5), {source:"submitPressAnswer"}, state);
    }

    sess.transcript.push({ who: currQ.journalist, text: currQ.q });
    sess.transcript.push({ who: "Kryeministri", text: answerSummary });

    if (sess.step < sess.maxSteps) {
        sess.step++;
        renderCurrentPressQuestion();saveGameAuto();
    } else {
        finishFullPressConference();
    }
}

function finishFullPressConference() {
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    var sess = state.activePressSession;
    state.activePressSession = null;
    var stage = document.getElementById("pressLiveStage");
    if (stage) stage.style.display = "none";
    if (!sess) return;
    politicalSceneJournal("press:"+state.turnCount+":"+sess.topic,"PRESS",sess.transcript.map(t=>t.who+": "+t.text).join(" | "),"COMPLETED");
    var fullReport = sess.transcript.map(function(t) { return t.who + ': "' + t.text + '"'; }).join(" | ");
    addMediaNews("KTV / T7 / RTK", "Përfundon konferenca për media me " + sess.step + " raunde pyetjesh mbi temën: " + sess.topic + ".", "POSITIVE", fullReport);
    refreshAllUI();
    showMajorAnnouncement({
        badge: "KONFERENCË PËR MEDIA",
        title: "Përmbledhja Mediatike e Konferencës",
        reason: "U zhvilluan " + sess.step + " pyetje me gazetarët e akredituar.",
        immediateImpact: "Deklaratat dhe zotimet u regjistruan. Reagimi i qëndrueshëm i publikut varet nga rezultatet."
    });
}

function publishPressRelease() {
    if(!assertGovernmentAuthority('Veprimi i Qeverisë'))return false;
    if (!isPlayerInGovernment()) {
        showToast("Komunikatat zyrtare qeveritare janë vetëm për Qeverinë.");
        return;
    }
    var titleEl = document.getElementById("prTitle");
    var catEl = document.getElementById("prCategory");
    var title = titleEl ? titleEl.value.trim() : "";
    var category = catEl ? catEl.value : "Vendim Qeveritar";
    if (!title) {
        showToast("Ju lutem shkruani një titull për komunikatën zyrtare!");
        return;
    }
    adjustPublicSupport((0.8), {source:"publishPressRelease"}, state);
    var fullBodyText = "Zyra për Komunikim e ka shpërndarë këtë njoftim tek të gjitha mediat vendore dhe ndërkombëtare. Qëndrimi i qartë institucional pritet të ndikojë në uljen e paqartësive rreth kësaj teme.";
    addMediaNews("Komunikatë Zyrtare", "[" + category + "] " + title, "POSITIVE", fullBodyText, "Opozita ka marrë shënim dhe mediat po analizojnë deklaratën e lëshuar.");
    if (titleEl) titleEl.value = "";
    refreshAllUI();
    showToast("Komunikata u publikua dhe u shpërnda te mediat!");
}

function issuePublicStatement() {
    var textEl = document.getElementById("psText");
    var text = textEl ? textEl.value.trim() : "";
    if (!text) {
        showToast("Ju lutem shkruani mesazhin e deklaratës suaj!");
        return;
    }
    adjustPublicSupport((0.4), {source:"issuePublicStatement"}, state);
    var myP = state.parties[state.playerParty];
    myP.internalCohesion = clamp(myP.internalCohesion + 1, 0, 100);
    addMediaNews("Deklaratë e Shpejtë", "Reagim: " + text.substring(0, 50) + (text.length > 50 ? "..." : ""), "NEUTRAL", text, "Qytetarët dhe mbështetësit po reagojnë në rrjetet sociale.");
    if (textEl) textEl.value = "";
    refreshAllUI();
    showToast("Deklarata juaj publike u lëshua me sukses!");
}

/* ============================================================================
   26. PREMTIMET
   ============================================================================ */

function renderPromisesList() {
    var container = document.getElementById("promisesListContainer");
    if (!container) return;
    var score = publicPromiseCredibility();
    var badge = document.getElementById("promiseScoreBadge");
    if (badge) badge.textContent = "Besueshmëria: " + Math.min(100, score) + "%";

    container.innerHTML = state.promises.map(function(pr, idx) {
        var costM = (pr.costB * 1000).toFixed(0);
        return '<div class="card" style="background:#0f172a; margin-bottom:10px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">' +
                '<strong style="font-size:0.86rem;">' + pr.title + '</strong>' +
                '<span class="tag ' + (pr.fulfilled ? 'tag-min' : 'tag-aak') + '">' + (pr.fulfilled ? "✔ I PËRMBUSHUR" : ("Afati: edhe " + pr.deadlineWeeks + " javë")) + '</span>' +
            '</div>' +
            '<div style="font-size:0.74rem; color:var(--text-muted); margin-bottom:8px;">Burimi: ' + pr.source + ((pr.mandateGoal||pr.specialPromise) ? ' • Kostoja dhe autorizimi shqyrtohen në reformën ose projektligjin përkatës.' : ' • Kosto fiskale: €' + costM + ' Milionë') + '</div>' +
            '<div class="prog-row">' +
                '<div class="prog-label"><span>Shkalla e realizimit</span><span>' + pr.progress + '%</span></div>' +
                '<div class="prog-track"><div class="prog-fill" style="width:' + pr.progress + '%; background:' + (pr.fulfilled ? 'var(--success)' : 'var(--accent-gold)') + ';"></div></div>' +
            '</div>' +
            (!pr.fulfilled && !pr.mandateGoal && !pr.electoralGoal && !pr.specialPromise ? '<button class="action-btn btn-success" onclick="fulfillPromiseNow(' + idx + ')">Financo & Përmbush Premtimin Tani (-€' + costM + 'M)</button>' : '') +
        '</div>';
    }).join("");
}

function fulfillPromiseNow(idx) {
    if(state.promises[idx]?.specialPromise)return fundSpecialPromise(state.promises[idx].id);
    if(state.promises[idx]?.electoralGoal){showToast('Premtimi zgjedhor matet vetëm me yjet efektive të sektorit.');return false;}
    if(state.promises[idx]?.mandateGoal){showToast('Ky premtim përmbushet vetëm nga përfundimi real i reformës.');return false;}
    if(!assertGovernmentAuthority('Përmbushja e premtimit'))return false;
    if(state.promises[idx] && state.promises[idx].costB>state.budgetTotalB){showToast('Mungojnë mjetet për përmbushjen e premtimit.');return false;}
    if(state.promises[idx]){var authorization=fiscalSpendingCheck(state.promises[idx].costB,false);if(!authorization.allowed){showToast(authorization.message);return false;}}
    if (!assertGovernmentAuthority("Përmbushja e premtimeve qeveritare")) return;
    var pr = state.promises[idx];
    if (!pr || pr.fulfilled) return;
    fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB - pr.costB).toFixed(9),"fulfillPromiseNow");
    pr.progress = 100;
    pr.fulfilled = true;
    adjustPublicSupport((4.2), {source:"fulfillPromiseNow"}, state);
    addMediaNews("RTK", "Qeveria përmbush premtimin: \"" + pr.title + "\".", "POSITIVE");
    refreshAllUI();
    showToast("Premtimi u përmbush; publiku do ta vlerësojë ndikimin e masës në jetën e përditshme.");
}

/* VAZHDON në pjesën 5 */
/* ============================================================================
   27. SEKSIONI I PARTISË
   ============================================================================ */

function renderPartySection() {
    var p = state.parties[state.playerParty];
    var container = document.getElementById("partyDetailsContainer");
    if (!container) return;
    container.innerHTML =
        '<div class="card">' +
            '<div class="card-header">' +
                '<div class="card-title">🚩 ' + p.name + '</div>' +
                '<span class="tag ' + p.tagClass + '">' + p.seats + ' Deputetë • Sondazhi: ' + p.poll.toFixed(1) + '%</span>' +
            '</div>' +
            '<div class="grid-2" style="font-size:0.82rem; line-height:1.7;">' +
                '<div>' +
                    '<div>• <strong>Kryetari i Partisë:</strong> ' + p.leader + '</div>' +
                    '<div>• <strong>Nënkryetarët:</strong> ' + p.deputyLeaders.join(", ") + '</div>' +
                    '<div>• <strong>Sekretari Organizativ:</strong> ' + p.orgSecretary + '</div>' +
                    '<div>• <strong>Ideologjia & Profili:</strong> ' + p.ideology + '</div>' +
                    '<div>• <strong>Qëndrimi për Dialogun:</strong> ' + p.dialogueStance + '</div>' +
                '</div>' +
                '<div>' +
                    '<div>• <strong>Disiplina Parlamentare e Grupit:</strong> ' + p.partyDiscipline + '%</div>' +
                    '<div>• <strong>Kohezioni i Brendshëm:</strong> ' + p.internalCohesion + '%</div>' +
                    '<div>• <strong>Buxheti i Partisë për Fushatë:</strong> €' + p.partyFunds.toLocaleString() + '</div>' +
                    '<div>• <strong>Orientimi Euro-Atlantik:</strong> BE (' + p.euStance + '/100) | SHBA (' + p.usStance + '/100)</div>' +
                '</div>' +
            '</div>' +
            '<div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">' +
                '<button class="action-btn" onclick="holdPartyCouncilMeeting()">Thirr mbledhjen e Këshillit (+Disiplinë)</button>' +
                '<button class="action-btn btn-gold" onclick="fundraisePartyDiaspora()">'+(typeof oppositionActive==='function' && oppositionActive()?'Takim me donatorët (+€20,000 · një herë në javë)':'Tubim Financiar me Mërgatën (+€65,000 fonde partie)')+'</button>' +
            '</div>' +
        '</div>';

    renderElectoralList();

    renderCoalitionNegotiations();
}

// Compatibility entry points now edit the electoral draft, never the political roster.
function moveCandidateInList(idx, dir) {
    var list = getCurrentElectoralList();
    return list ? changeElectoralList("move", list.candidateIds[idx], dir) : false;
}

function removeCandidateFromList(idx) {
    var list = getCurrentElectoralList();
    return list ? changeElectoralList("remove", list.candidateIds[idx]) : false;
}

function includeReserveCandidate(rIdx) {
    var profile = state.parties[state.playerParty].reserves[rIdx];
    if (!profile) return false;
    var person = getCandidateCatalogue(state).find(function(item) {
        return candidateSearchText(candidateName(item)) === candidateSearchText(profile.name) && item.gamePartyIds.includes(state.playerParty);
    });
    return person ? changeElectoralList("add", person.id) : false;
}

function holdPartyCouncilMeeting() {
    var p = state.parties[state.playerParty];
    p.partyDiscipline = clamp(p.partyDiscipline + 5, 40, 100);
    p.internalCohesion = clamp(p.internalCohesion + 5, 40, 100);
    state.mps.filter(function(m) { return m.party === state.playerParty; }).forEach(function(m) {
        m.loyalty = clamp(m.loyalty + 5, 40, 100);
        m.rebelRisk = m.loyalty < 82;
    });
    refreshAllUI();
    showToast("Këshilli i Përgjithshëm u mblodh! Disiplina e deputetëve u forcua.");
}

function fundraisePartyDiaspora() {
    if(typeof oppositionActive==='function' && oppositionActive())return oppositionFundraise();
    state.parties[state.playerParty].partyFunds += 65000;
    refreshAllUI();
    showToast("U mblodhën €65,000 nga mërgata për fondin e partisë!");
}

/* ============================================================================
   28. NEGOCIATAT E KOALICIONIT
   ============================================================================ */

function renderCoalitionNegotiations() {
    var container = document.getElementById("coalitionNegotiationContainer");
    if (!container) return;
    if (!coalitionTalkAllowed(null,true)) {
        container.innerHTML='<div class="card"><p>Negociatat kërkojnë rezultate dhe mandate të publikuara, si dhe një subjekt udhëheqës të përcaktuar.</p><button class="action-btn" onclick="openConstituentSessionPanel()">Seanca konstituive</button></div>';return;
    }
    var coalSeats = getCoalitionSeats();
    var badge = document.getElementById("coalitionTotalBadge");
    if (badge) badge.textContent = coalSeats + " / 120 Deputetë (" + (coalSeats >= 61 ? "Shumicë ✔" : ("Mungojnë " + (61 - coalSeats) + " vota")) + ")";

    var myParty = state.parties[state.playerParty];
    var isMandatar = (coalitionNegotiationContext().leader === state.playerParty);
    var mandatarParty = state.parties[coalitionNegotiationContext().leader];

    var negotiationList = [];
    if (isMandatar) {
        negotiationList = Object.values(state.parties).filter(function(p) { return p.id !== state.playerParty && coalitionPartySeats(p.id)>0; });
    } else {
        negotiationList = [mandatarParty];
    }

    var canVote = state.mandatar===state.playerParty && constituentGovernmentGate(true) && state.assemblyConstituted && state.speakerElected && state.cabinetApproved;
    var headerHtml =
        '<div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
            '<div>' +
                '<div style="font-size:0.84rem; font-weight:700;">Statusi i Qeverisë: ' + (state.governmentFormed ? ('<span style="color:var(--success);">Qeveri në detyrë (' + state.primeMinister + ')</span>') : ('<span style="color:var(--warning);">' + (state.mandatar && constituentGovernmentGate(true)?'Mandatari':'Subjekti udhëheqës i negociatave') + ' (' + mandatarParty.short + ') po kërkon 61+ vota</span>')) + '</div>' +
                '<div style="font-size:0.75rem; color:var(--text-muted);">Partnerët e konfirmuar: ' + state.coalitionParties.map(function(k) { return state.parties[k].short + " (" + coalitionPartySeats(k) + ")"; }).join(" + ") + '</div>' +
            '</div>' +
            (isMandatar && state.mandatar===state.playerParty && constituentGovernmentGate(true) ?
                '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
                    '<button class="action-btn btn-outline" onclick="openCabinetSelectionModal()">💼 Zgjidh Kabinetin</button>' +
                    '<button class="action-btn btn-gold" onclick="formalizeGovernmentVote()" ' + (!canVote ? "disabled" : "") + '>🏛️ Voto Konstituimin e Qeverisë</button>' +
                '</div>'
                : '<span class="tag tag-pdk">Ti je në ' + (state.coalitionParties.includes(state.playerParty) ? 'Pozitë' : 'Opozitë') + '</span>'
            ) +
        '</div>' +
        (isMandatar && !state.cabinetApproved ? '<div style="background:rgba(245,158,11,0.12); padding:8px 10px; border-radius:6px; font-size:0.76rem; margin-bottom:10px; color:var(--warning);">⚠️ Duhet të konfirmoni kabinetin përpara se të mund të votoni Qeverinë.</div>' : '');

    var cardsHtml = negotiationList.map(function(p) {
        var inCoal = state.coalitionParties.includes(p.id);
        var rel = Number.isFinite(myParty.relations[p.id]) ? myParty.relations[p.id] : null;
        var ministriesHeld = state.ministries.filter(function(m) { return m.party === p.id; }).length;
        var minDemand = coalitionPartySeats(p.id) >= 20 ? 4 : (coalitionPartySeats(p.id) >= 15 ? 3 : (coalitionPartySeats(p.id) >= 7 ? 2 : 1));

        var actionButtons = "";
        if (!inCoal) {
            if (isMandatar) {
                actionButtons = '<button class="action-btn btn-gold" onclick="openCoalitionRound1(\'' + p.id + '\')">🤝 Fto ' + p.short + ' në Qeveri</button>';
            } else {
                actionButtons = '<button class="action-btn btn-gold" onclick="openCoalitionRound1(\'' + p.id + '\')">🤝 Kërko t\'i bashkohesh Qeverisë</button>';
            }
        } else {
            if (isMandatar && state.governmentFormed) {
                actionButtons = '<button class="action-btn btn-danger" onclick="removePartnerFromCoalition(\'' + p.id + '\')">✕ Prish Koalicionin me ' + p.short + '</button>';
            } else if (!state.governmentFormed) {
                actionButtons = '<span class="tag tag-min">Marrëveshja e arritur</span>';
            }
        }

        return '<div class="card" style="background:#0f172a; margin-bottom:0; border-color:' + (inCoal ? 'var(--success)' : 'var(--border-glass)') + ';">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
                '<strong>' + p.short + ' (' + p.leader + ')</strong>' +
                '<span class="tag ' + p.tagClass + '">' + coalitionPartySeats(p.id) + ' Ulëse</span>' +
            '</div>' +
            '<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:10px;">' +
                'Raporti politik ' + myParty.short + ' → ' + p.short + ': <strong>' + (rel===null?'Nuk ka të dhëna':rel+'/100') + '</strong> • Ministri aktuale: <strong>' + ministriesHeld + '</strong><br>' +
                (isMandatar ? ('Kërkesa e ' + p.short + ': <strong>Të paktën ' + minDemand + ' ministri</strong><br>') : ('Synimi yt: <strong>Të sigurosh ministri nga ' + p.short + '</strong><br>')) +
                'Vija programore: ' + p.dialogueStance +
            '</div>' +
            '<div style="display:flex; gap:6px; flex-wrap:wrap;">' + actionButtons + '</div>' +
        '</div>';
    }).join("");

    var constituentLink=!state.assemblyConstituted?'<div class="card"><p>Marrëveshja politike nuk e konstituon automatikisht Kuvendin. Vazhdoni me propozimin dhe votimin e Kryetarit.</p><button id="coalitionConstituentBtn" class="action-btn btn-gold" onclick="openConstituentSessionPanel()">Vazhdo te seanca konstituive</button></div>':'';
    var guidance=!state.assemblyConstituted?'Negocioni krijimin e shumicës; më pas përfundoni seancën konstituive. Marrëveshjet nuk emërojnë Qeverinë.':!state.mandatar?'Shumica mund të negociohet. Vazhdoni te seanca konstituive për mandatimin formal.':'';
    container.innerHTML = postElectionInvitationMarkup()+'<p>'+guidance+'</p>' + constituentLink + headerHtml + '<div class="grid-2">' + cardsHtml + '</div>';
}

function openCoalitionRound1(targetPartyId) {
    if (!coalitionTalkAllowed(targetPartyId)) return false;
    var p = state.parties[targetPartyId];
    if (!p) return;
    var rel = state.parties[state.playerParty].relations[targetPartyId] || 40;
    var isMandatar = (coalitionNegotiationContext().leader === state.playerParty);
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;

    var roundTitle = isMandatar ? ('Ftesa Zyrtare për ' + p.name) : ('Kërkesë për hyrje në Qeverinë e ' + p.name);
    var contextText = isMandatar
        ? ('Zgjidhni kornizën e takimit me <strong>' + p.leader + ' (' + coalitionPartySeats(p.id) + ' deputetë)</strong>. Raporti aktual: <strong>' + rel + '/100</strong>.')
        : ('Nisni negociatat me subjektin udhëheqës <strong>' + p.leader + '</strong> për marrëveshjen e bashkëqeverisjes. Mandatimi formal mbetet procedurë e veçantë.');

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🤝 Raundi 1 / 3: ' + roundTitle + '</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">' + contextText + '</p>' +
        '<div class="grid-2" style="margin-bottom:12px;">' +
            '<div>' +
                '<label style="font-size:0.74rem; color:var(--text-muted); display:block; margin-bottom:4px;">Vendi & Koha e Takimit:</label>' +
                '<select id="negMeetingTime" style="width:100%;">' +
                    '<option value="KUVEND_11">Selia e Kuvendit — Sot Ora 11:00</option>' +
                    '<option value="PARTY_HQ">Selia e Partisë — Nesër Ora 15:00</option>' +
                    '<option value="WORKING_DINNER">Darkë Pune Jopublike — Sonte Ora 20:00</option>' +
                '</select>' +
            '</div>' +
            '<div>' +
                '<label style="font-size:0.74rem; color:var(--text-muted); display:block; margin-bottom:4px;">Qasja Hapëse:</label>' +
                '<select id="negOpeningTone" style="width:100%;">' +
                    '<option value="PARTNERSHIP">Partneritet i barabartë</option>' +
                    '<option value="PROGRAMMATIC">Harmonizim programor</option>' +
                    '<option value="PRESIDENT_PACKAGE">Paketë e plotë institucionale</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="proceedCoalitionRound2(\'' + targetPartyId + '\')">Vazhdo në Raundin 2 ▶</button>';
    decoratePoliticalScene("interactiveActionModalContent","COALITION",{name:p.leader,role:p.name,topic:roundTitle,detail:"Raporti i regjistruar: "+rel+"/100 \u00b7 "+coalitionPartySeats(p.id)+" deputet\u00eb",stage:"Raundi i par\u00eb"});
    var savedScene=state.meetingScenes["visual:coalition:"+targetPartyId];if(savedScene && savedScene.draft && savedScene.status!=="COMPLETED")box.innerHTML+='<button class="action-btn" id="resumeCoalitionScene" onclick="resumeCoalitionScene(\''+targetPartyId+'\')">Vazhdo ofert\u00ebn e ruajtur</button>';
    toggleModal("interactiveActionModal", true);
}

function proceedCoalitionRound2(targetPartyId) {
    if (!coalitionTalkAllowed(targetPartyId)) return false;
    var p = state.parties[targetPartyId];
    if (!p) return;
    var isMandatar = (coalitionNegotiationContext().leader === state.playerParty);
    var toneEl = document.getElementById("negOpeningTone");
    var tone = toneEl ? toneEl.value : "PARTNERSHIP";

    if ((targetPartyId === "SL" && state.playerParty === "LVV") || (coalitionNegotiationContext().leader === "LVV" && state.playerParty === "SL")) {
        document.getElementById("interactiveActionModalContent").innerHTML =
            '<div class="card-header"><div class="card-title">⛔ Refuzim Politik</div></div>' +
            '<p style="font-size:0.84rem; margin-bottom:12px;">LVV dhe Lista Serbe kanë vija të kuqe të papajtueshme për koalicion formal qeverisës.</p>' +
            '<button class="action-btn" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll</button>';
        return;
    }

    if(!rememberCoalitionScene(targetPartyId,false))return false;
    var referenceSeats = isMandatar ? coalitionPartySeats(p.id) : coalitionPartySeats(state.playerParty);
    var minDemand = referenceSeats >= 20 ? 4 : (referenceSeats >= 15 ? 3 : (referenceSeats >= 7 ? 2 : 1));
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;

    var minsCheckHtml = state.ministries.map(function(m, idx) {
        var isChecked = isMandatar ? (m.party === targetPartyId ? "checked" : "") : (m.party === state.playerParty ? "checked" : "");
        return '<label style="font-size:0.75rem; display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.03); padding:5px 8px; border-radius:6px; cursor:pointer;">' +
            '<input type="checkbox" class="neg-min-check" value="' + idx + '" ' + isChecked + '>' +
            '<span>' + m.name.replace("Ministria e ", "M. ") + '</span>' +
        '</label>';
    }).join("");

    var dialogueText = isMandatar
        ? ('<strong>' + p.leader + ' (' + p.short + '):</strong> "Jemi të gatshëm të japim ' + coalitionPartySeats(p.id) + ' votat tona për Qeverinë, por kërkojmë të paktën <strong>' + minDemand + ' ministri</strong>. Çfarë ofroni?"')
        : ('<strong>' + p.leader + ' (Mandatar):</strong> "Na duhen votat e tuaja (' + referenceSeats + ' deputetë). Për të hyrë në Qeveri, zgjidhni cilat ministri po i kërkoni."');

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🤝 Raundi 2 / 3: Tavolina e Ofertës me ' + p.short + '</div>' +
            '<span class="tag ' + p.tagClass + '">Fuqia: ' + referenceSeats + ' Deputetë</span>' +
        '</div>' +
        '<div class="chat-bubble chat-them">' + dialogueText + '</div>' +
        '<div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid var(--border-glass); margin-bottom:12px;">' +
            '<div style="font-size:0.8rem; font-weight:700; color:var(--accent-gold); margin-bottom:8px;">' + (isMandatar ? '1. Zgjidh cilat Ministri po ia ofron:' : '1. Zgjidh cilat Ministri po kërkon:') + '</div>' +
            '<div class="grid-2" style="max-height:175px; overflow-y:auto; gap:6px; margin-bottom:10px;">' + minsCheckHtml + '</div>' +
            '<div style="font-size:0.8rem; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">2. Pozita të Larta Kushtetuese & Programore:</div>' +
            '<div class="grid-2" style="gap:6px;">' +
                '<label style="font-size:0.76rem; display:flex; align-items:center; gap:6px;"><input type="checkbox" id="negOfferDeputyPM" checked> Zëvendëskryeministri i Parë</label>' +
                '<label style="font-size:0.76rem; display:flex; align-items:center; gap:6px;"><input type="checkbox" id="negOfferSpeaker" ' + (tone === "PRESIDENT_PACKAGE" ? "checked" : "") + '> Kryetari i Kuvendit</label>' +
                '<label style="font-size:0.76rem; display:flex; align-items:center; gap:6px;"><input type="checkbox" id="negOfferPresConsensus" ' + (tone === "PRESIDENT_PACKAGE" ? "checked" : "") + '> Marrëveshje për Presidentin (80+)</label>' +
                '<label style="font-size:0.76rem; display:flex; align-items:center; gap:6px;"><input type="checkbox" id="negOfferProgramBudget" checked> Harmonizim i Buxhetit (€35M)</label>' +
            '</div>' +
        '</div>' +
        '<div id="negCounterFeedbackBox" style="margin-bottom:10px;"></div>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between;">' +
            '<button class="action-btn btn-gold" onclick="evaluateCoalitionRound3(\'' + targetPartyId + '\')">Paraqit Ofertën (Raundi 3) ▶</button>' +
            '<button class="action-btn btn-danger" onclick="toggleModal(\'interactiveActionModal\', false)">Ndërprit Negociatat</button>' +
        '</div>';
    decoratePoliticalScene("interactiveActionModalContent","COALITION",{name:p.leader,role:p.name,topic:"Oferta p\u00ebr bashk\u00ebqeverisje",detail:"K\u00ebrkes\u00eb minimale: "+minDemand+" ministri sipas pesh\u00ebs parlamentare.",stage:"Shqyrtimi i ofert\u00ebs"});
}

function evaluateCoalitionRound3(targetPartyId) {
    if (!coalitionTalkAllowed(targetPartyId)) return false;
    var p = state.parties[targetPartyId];
    if (!p) return;
    if(state.coalitionAgreements.some(function(a){return a.partner===targetPartyId && a.honored;}))return false;
    if(!rememberCoalitionScene(targetPartyId,true))return false;
    var beforeAgreement=JSON.stringify(state);
    var myP = state.parties[state.playerParty];
    var isMandatar = (coalitionNegotiationContext().leader === state.playerParty);
    var rel = myP.relations[targetPartyId] || 40;

    var checkedMins = Array.from(document.querySelectorAll(".neg-min-check:checked")).map(function(el) { return parseInt(el.value, 10); });
    var offerDepPMEl = document.getElementById("negOfferDeputyPM");
    var offerSpeakerEl = document.getElementById("negOfferSpeaker");
    var offerPresEl = document.getElementById("negOfferPresConsensus");
    var offerProgEl = document.getElementById("negOfferProgramBudget");
    var offerDepPM = offerDepPMEl ? offerDepPMEl.checked : false;
    var offerSpeaker = offerSpeakerEl ? offerSpeakerEl.checked : false;
    var offerPres = offerPresEl ? offerPresEl.checked : false;
    var offerProg = offerProgEl ? offerProgEl.checked : false;

    var referenceSeats = isMandatar ? coalitionPartySeats(p.id) : coalitionPartySeats(state.playerParty);
    var minDemand = referenceSeats >= 20 ? 4 : (referenceSeats >= 15 ? 3 : (referenceSeats >= 7 ? 2 : 1));
    var offerScore = rel * 0.45 + checkedMins.length * 14 + (offerDepPM ? 10 : 0) + (offerSpeaker ? 20 : 0) + (offerPres ? 8 : 0) + (offerProg ? 12 : 0);
    var requiredScore = referenceSeats >= 20 ? 82 : (referenceSeats >= 15 ? 74 : (referenceSeats >= 7 ? 50 : 35));
    var fb = document.getElementById("negCounterFeedbackBox");
    if (!fb) return;

    if(offerProg && state.budgetTotalB<0.035){showToast("Nuk ka fonde p\u00ebr harmonizimin buxhetor t\u00eb propozuar.");return false;}
    if (checkedMins.length < minDemand && !offerSpeaker) {
        politicalSceneJournal("coalition:"+targetPartyId,"COALITION","Pala k\u00ebrkoi m\u00eb shum\u00eb p\u00ebrgjegj\u00ebsi n\u00eb ofert\u00eb; nuk u arrit marr\u00ebveshje.","OPEN");saveGameAuto();
        fb.innerHTML = '<div class="political-outcome political-outcome--failure" role="status"><strong>✕ Nuk u arrit marrëveshja</strong><p>Rishiko ofertën për të vazhduar bisedimet.</p></div><details><summary>Arsyetimi dhe kundëroferta</summary><div class="chat-bubble chat-them" style="border-left-color:var(--danger);"><strong>⚠️ KUNDËROFERTË NGA ' + p.short + ':</strong><br>"Kjo marrëveshje me vetëm <strong>' + checkedMins.length + ' ministri</strong> nuk përputhet me peshën prej <strong>' + referenceSeats + ' deputetësh</strong>! Kërkojmë të paktën <strong>' + minDemand + ' ministri</strong> OSE postin e <strong>Kryetarit të Kuvendit</strong>!"</div></details>';
        politicalSceneJournal("coalition:"+targetPartyId,"COALITION","U k\u00ebrkua rishikim i ofert\u00ebs; nuk u arrit marr\u00ebveshje.","OPEN");saveGameAuto();
        return;
    }

    if (offerScore >= requiredScore) {
        if (!state.coalitionParties.includes(targetPartyId)) state.coalitionParties.push(targetPartyId);
        if (!state.coalitionParties.includes(state.playerParty)) state.coalitionParties.push(state.playerParty);

        if (offerPres) {
            if (!state.quorumPledgedParties) state.quorumPledgedParties = [];
            if (!state.quorumPledgedParties.includes(targetPartyId)) state.quorumPledgedParties.push(targetPartyId);
            if (!state.quorumPledgedParties.includes(state.playerParty)) state.quorumPledgedParties.push(state.playerParty);
        }

        var receivingParty = isMandatar ? targetPartyId : state.playerParty;
        var receivingCands = state.parties[receivingParty].candidates;
        checkedMins.forEach(function(mIdx, i) {
            state.ministries[mIdx].party = receivingParty;
            var cand = receivingCands[i % receivingCands.length];
            state.ministries[mIdx].minister = cand ? cand.name : state.parties[receivingParty].leader;
            state.ministries[mIdx].ministerCandidateId = null;
        });

        // The speaker remains the person elected by the Assembly; a coalition promise cannot appoint them.
        if (offerProg) fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB - 0.035).toFixed(9),"evaluateCoalitionRound3");

        myP.relations[targetPartyId] = clamp(rel + 18, 0, 100);
        state.coalitionAgreements.push({
            partner: targetPartyId,
            ministriesCount: checkedMins.length,
            deputyPM: offerDepPM,
            speaker: offerSpeaker,
            conditions: checkedMins.length + " Ministri" + (offerSpeaker ? " + Kryeparlamentari" : ""),
            honored: true
        });

        politicalSceneJournal("coalition:"+targetPartyId,"COALITION","Marr\u00ebveshja e koalicionit u pranua pas shqyrtimit t\u00eb ofert\u00ebs.","COMPLETED");
        toggleModal("interactiveActionModal", false);
        addMediaNews("Klan Kosova / KOHA", "Nënshkruhet Marrëveshja e Koalicionit mes " + myP.short + " dhe " + p.short + " pas raundeve intensive!", "POSITIVE");
        if(state.governmentFormed)syncDeputyGovernment();
        if(!saveGameAuto()){state=JSON.parse(beforeAgreement);showToast("Marrëveshja nuk u ruajt. Provoni përsëri.");return false;}
        refreshAllUI();
        showGovernmentNotification({
            audience: 'POLITICAL',
            title: 'U arrit marrëveshja e koalicionit',
            message: myP.short + ' & ' + p.short + ': marrëveshja u nënshkrua me sukses.',
            status: 'success', critical: true,
            details: [checkedMins.length + ' ministri' + (offerSpeaker ? ' dhe Kryetari i Kuvendit.' : '.'), 'Koalicioni: ' + getCoalitionSeats() + ' / 120 deputetë. Formimi i Qeverisë kërkon votim të veçantë.']
        });
    } else {
        politicalSceneJournal("coalition:"+targetPartyId,"COALITION","Oferta nuk mori mb\u00ebshtetje t\u00eb mjaftueshme; k\u00ebrkohet rishikim.","OPEN");saveGameAuto();
        fb.innerHTML = '<div class="political-outcome political-outcome--failure" role="status"><strong>✕ Nuk u arrit marrëveshja</strong><p>Rishiko ofertën për të vazhduar bisedimet.</p></div><details><summary>Arsyetimi dhe kundëroferta</summary><div class="chat-bubble chat-them" style="border-left-color:var(--warning);"><strong>' + p.leader + ' (' + p.short + '):</strong> "Ende jemi larg marrëveshjes finale (Pikët: ' + Math.round(offerScore) + '/' + requiredScore + '). Shtoni edhe një ministri ose përfshini harmonizimin buxhetor."</div></details>';
    }
}

function removePartnerFromCoalition(targetPartyId) {
    state.coalitionParties = state.coalitionParties.filter(function(x) { return x !== targetPartyId; });
    state.quorumPledgedParties = (state.quorumPledgedParties || []).filter(function(x) { return x !== targetPartyId; });

    state.ministries.forEach(function(m) {
        if (m.party === targetPartyId) {
            m.party = "NONE";
            m.minister = "I/E paemëruar";
            m.ministerCandidateId = null;
        }
    });

    addMediaNews("KOHA", state.parties[targetPartyId].short + " braktis koalicionin! Numrat ulen në " + getCoalitionSeats() + " vota.", "CRITICAL");
    if(state.governmentFormed)syncDeputyGovernment();
    refreshAllUI();
}

/* ============================================================================
   29. RENDER KUVENDI
   ============================================================================ */

function getBillStatusLabel(status) {
    var labels = {ANNULLED:"Anuluar nga Gjykata",
        DRAFT: "📝 Draft",
        SUBMITTED: "📤 Dorëzuar",
        UNDER_REVIEW: "🔍 Në Shqyrtim",
        SCHEDULED: "📅 Caktuar për Seancë",
        PASSED: "✅ I Miratuar",
        FAILED: "❌ I Rrëzuar"
    };
    return labels[status] || status;
}

function getBillStatusTagClass(status) {
    var classes = {
        DRAFT: "tag-sl",
        SUBMITTED: "tag-pdk",
        UNDER_REVIEW: "tag-aak",
        SCHEDULED: "tag-gold",
        PASSED: "tag-min",
        FAILED: "tag-lvv"
    };
    return classes[status] || "tag-sl";
}

function getMajorityLabel(law) {
    if (!law) return "";
    if (law.majorityType === "CONSTITUTION_80") return "Ndryshim kushtetues · 2/3 (80/120 vota)";
    if (law.majorityType === "INTL_80") return "2/3 (80/120 vota)";
    if (law.majorityType === "VITAL_DOUBLE") return "Shumicë e Dyfishtë (61+ & 14/20 Komunitetet)";
    return "Shumicë e Thjeshtë (61+ vota)";
}

function getMajorityBadgeClass(law) {
    if (!law) return "";
    if (law.majorityType === "CONSTITUTION_80") return "two-thirds";
    if (law.majorityType === "INTL_80") return "two-thirds";
    if (law.majorityType === "VITAL_DOUBLE") return "vital";
    return "";
}

function renderAssemblySection() {
    var speakerEl = document.getElementById("speakerNameBadge");
    if (speakerEl) speakerEl.textContent = "Kryetar/e: " + state.speakerOfAssembly;

    var grid = document.getElementById("parliamentSeats");
    if (grid) {
        grid.innerHTML = state.mps.map(function(mp, idx) {
            var p = state.parties[mp.party];
            return '<div class="seat-dot ' + (mp.rebelRisk ? 'rebel' : '') + '" style="background:' + (p ? p.color : '#64748b') + ';" onclick="openMpProfile(' + idx + ')" title="#' + mp.seatNumber + ' ' + electoralEscape(candidateDisplayName(mp)) + ' (' + (p ? p.short : '') + ')"></div>';
        }).join("");
    }

    var legend = document.getElementById("parliamentLegend");
    if (legend) {
        legend.innerHTML = Object.values(state.parties).map(function(p) {
            return '<div class="legend-item"><div class="legend-color" style="background:' + p.color + ';"></div><span>' + p.short + ': <strong>' + p.seats + '</strong></span></div>';
        }).join("");
    }

    var summaryEl = document.getElementById("parliamentCompositionSummary");
    if (summaryEl) {
        var govSeats = getCoalitionSeats();
        var oppSeats = 120 - govSeats;
        var needSimple = govSeats >= 61 ? "✔ Shumica e thjeshtë" : ("Mungojnë " + (61 - govSeats) + " vota");
        var needTwoThirds = govSeats >= 80 ? "✔ Shumica 2/3" : ("Mungojnë " + (80 - govSeats) + " vota");

        summaryEl.innerHTML =
            '<div class="grid-3" style="margin-bottom:10px;">' +
                '<div class="card" style="background:#0f172a; margin-bottom:0; text-align:center;">' +
                    '<div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Pozita (Qeveria)</div>' +
                    '<div style="font-size:1.4rem; font-weight:900; color:var(--success);">' + govSeats + '</div>' +
                    '<div style="font-size:0.7rem; color:var(--text-muted);">' + state.coalitionParties.map(function(k) { return state.parties[k] ? state.parties[k].short : k; }).join(" + ") + '</div>' +
                '</div>' +
                '<div class="card" style="background:#0f172a; margin-bottom:0; text-align:center;">' +
                    '<div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Opozita</div>' +
                    '<div style="font-size:1.4rem; font-weight:900; color:var(--danger);">' + oppSeats + '</div>' +
                '</div>' +
                '<div class="card" style="background:#0f172a; margin-bottom:0; text-align:center;">' +
                    '<div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Totali</div>' +
                    '<div style="font-size:1.4rem; font-weight:900; color:#fff;">120</div>' +
                '</div>' +
            '</div>' +
            '<div style="background:#0f172a; padding:10px; border-radius:8px; font-size:0.78rem; line-height:1.6;">' +
                '<div>• <strong>Shumicë e thjeshtë (61 vota):</strong> <span style="color:' + (govSeats >= 61 ? 'var(--success)' : 'var(--danger)') + ';">' + needSimple + '</span></div>' +
                '<div>• <strong>Shumicë 2/3 (80 vota):</strong> <span style="color:' + (govSeats >= 80 ? 'var(--success)' : 'var(--danger)') + ';">' + needTwoThirds + '</span></div>' +
                '<div>• <strong>Shumicë e dyfishtë për ligje vitale:</strong> Kërkon mbështetje të MIN_MULTI</div>' +
            '</div>';
    }

    var groupsTable = document.getElementById("parliamentGroupsTable");
    if (groupsTable) {
        groupsTable.innerHTML =
            '<div class="table-responsive"><table class="data-table">' +
                '<thead><tr><th>Grupi</th><th>Kryetari</th><th>Ulëse</th><th>Kategoria</th><th>Statusi</th></tr></thead>' +
                '<tbody>' +
                    Object.values(state.parties).map(function(p) {
                        var inCoal = state.coalitionParties.includes(p.id);
                        var statusBadge = !state.governmentFormed ? '<span class="tag tag-warning">Në Negociata</span>' : (inCoal ? '<span class="tag tag-min">Pozitë</span>' : '<span class="tag tag-sl">Opozitë</span>');
                        return '<tr>' +
                            '<td data-label="Grupi"><strong>' + p.short + '</strong></td>' +
                            '<td data-label="Kryetari">' + p.leader + '</td>' +
                            '<td data-label="Ulëse"><strong>' + p.seats + '</strong></td>' +
                            '<td data-label="Kategoria">' + (p.community === "GENERAL" ? "100 Ulëset" : "20 të Garantuara") + '</td>' +
                            '<td data-label="Statusi">' + statusBadge + '</td>' +
                        '</tr>';
                    }).join("") +
                '</tbody>' +
            '</table></div>';
    }

    renderMPsDirectory();
    renderBillAgenda();
    renderParliamentarySessions();
    renderMotions();
    renderPresidentialSection();
    renderOppositionSection();
}

function renderMPsDirectory() {
    var container = document.getElementById("mpsDirectoryGrid");
    if (!container) return;
    renderDeputyMandateDirectory();
    if(deputyLedger(state)){container.innerHTML="";return;}
    var partyFilterEl = document.getElementById("mpFilterParty");
    var searchQEl = document.getElementById("mpSearchInput");
    var partyFilter = partyFilterEl ? partyFilterEl.value : "ALL";
    var searchQ = searchQEl ? searchQEl.value.toLowerCase() : "";
    var statusFilter=document.getElementById("mpMandateFilter");
    if(statusFilter && !["ACTIVE","ALL"].includes(statusFilter.value)){container.innerHTML="";return;}

    var filtered = state.mps.filter(function(mp) {
        var matchP = (partyFilter === "ALL" || mp.party === partyFilter);
        var matchS = (!searchQ || candidateDisplayName(mp).toLowerCase().includes(searchQ) || mp.region.toLowerCase().includes(searchQ));
        return matchP && matchS;
    });

    container.innerHTML = filtered.map(function(mp) {
        var realIdx = state.mps.indexOf(mp);
        var p = state.parties[mp.party];
        return '<div class="card" style="background:#0f172a; margin-bottom:0; border-color:' + (mp.promisedVoteNext ? 'var(--success)' : 'var(--border-glass)') + ';">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
                '<strong style="font-size:0.84rem;">👤 #' + mp.seatNumber + ' ' + electoralEscape(candidateDisplayName(mp)) + '</strong>' +
                '<span class="tag ' + p.tagClass + '">' + p.short + '</span>' +
            '</div>' +
            '<div style="font-size:0.73rem; color:var(--text-muted); line-height:1.5; margin-bottom:8px;">' +
                '<div>• Statusi: <strong style="color:#fff;">' + mp.role + '</strong> (' + mp.region + ')</div>' +
                '<div>• Besnikëria: <strong>' + mp.loyalty + '%</strong> | Besimi: <strong>' + (mp.trustPlayer || 60) + '/100</strong></div>' +
                '<div>• ' + mp.stance + '</div>' +
            '</div>' +
            '<div style="display:flex; gap:6px;">' +
                '<button class="action-btn" style="flex:1; justify-content:center;" onclick="openMpProfile(' + realIdx + ')">💬 Profili</button>' +
                '<button class="btn-top" onclick="openScheduleMeetingModal(\'MPS_120\', \'' + mp.name.replace(/'/g, "") + '\')">📅</button>' +
            '</div>' +
        '</div>';
    }).join("");
}

function openMpProfile(mpIdx, chatStep, lastFeedback) {
    var mp = state.mps[mpIdx];
    if (!mp) return;
    var p = state.parties[mp.party];
    var box = document.getElementById("mpModalContent");
    if (!box) return;
    var vHist = (mp.votingHistory || ["Seanca Konstituive: Pjesëmarrës"]).slice(-3).join(" • ");
    var fbText = lastFeedback || ("Përshëndetje. Si deputet i Legjislaturës XI nga rajoni i " + mp.region + ", jam i gatshëm të diskutojmë për projektligjet dhe prioritetet e zonës sime.");

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">👤 #' + mp.seatNumber + ': ' + electoralEscape(candidateDisplayName(mp)) + ' (' + p.short + ')</div>' +
            '<button class="btn-top" onclick="toggleModal(\'mpModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div class="grid-2" style="font-size:0.78rem; line-height:1.6; margin-bottom:10px; background:#0f172a; padding:10px; border-radius:8px;">' +
            '<div>' +
                '<div>• <strong>Grupi:</strong> <span class="tag ' + p.tagClass + '">' + p.short + '</span></div>' +
                '<div>• <strong>Rajoni:</strong> ' + mp.region + '</div>' +
                '<div>• <strong>Historiku:</strong> ' + vHist + '</div>' +
            '</div>' +
            '<div>' +
                '<div>• <strong>Besnikëria:</strong> ' + mp.loyalty + '%</div>' +
                '<div>• <strong>Raporti me Ju:</strong> <strong style="color:var(--accent-gold);">' + (mp.trustPlayer || 60) + '/100</strong></div>' +
                '<div>• <strong>Prioriteti:</strong> ' + mp.ambition + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="chat-bubble chat-them"><strong>' + electoralEscape(candidateDisplayName(mp)) + ':</strong> "' + fbText + '"</div>' +
        '<div style="margin-bottom:10px;">' +
            '<div style="display:flex; gap:6px;">' +
                '<input type="text" id="mpCustomArgument" placeholder="Argumenti juaj..." style="flex:1;">' +
                '<button class="action-btn btn-gold" onclick="interactWithMP(' + mpIdx + ', \'CUSTOM_MSG\')">Dërgo ▶</button>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:6px;">' +
            '<button class="choice-btn" onclick="interactWithMP(' + mpIdx + ', \'CONVINCE_LAW\')">' +
                '<span class="choice-title">1. Argumento rëndësinë shtetërore (kërko votë PRO)</span>' +
                '<span class="choice-impact">+10 Besim, siguron votën</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="interactWithMP(' + mpIdx + ', \'REGIONAL_GRANT\')">' +
                '<span class="choice-title">2. Premto grant €10M për rajonin ' + mp.region + '</span>' +
                '<span class="choice-impact">+16 Besnikëri, votë e garantuar (-€10M)</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="interactWithMP(' + mpIdx + ', \'MEDIATE_PARTY\')">' +
                '<span class="choice-title">3. Ndërmjetëso me ' + p.short + '</span>' +
                '<span class="choice-impact">+5 raport ndërpartiak</span>' +
            '</button>' +
        '</div>';
    toggleModal("mpModal", true);
}

function interactWithMP(mpIdx, actionType) {
    var mp = state.mps[mpIdx];
    if (!mp) return;
    var customTxtEl = document.getElementById("mpCustomArgument");
    var customTxt = customTxtEl ? customTxtEl.value.trim() : "";
    var reply = "";
    if (actionType === "CUSTOM_MSG" && customTxt) {
        mp.trustPlayer = clamp((mp.trustPlayer || 60) + 8, 0, 100);
        mp.promisedVoteNext = mp.trustPlayer >= 62;
        reply = "E vlerësoj mesazhin (\"" + customTxt + "\"). Do ta kem parasysh!";
    } else if (actionType === "CONVINCE_LAW") {
        mp.trustPlayer = clamp((mp.trustPlayer || 60) + 10, 0, 100);
        mp.loyalty = clamp(mp.loyalty + 6, 0, 100);
        mp.rebelRisk = false;
        mp.promisedVoteNext = true;
        reply = "Argumentet janë bindëse. Mund të llogarisni në votën time PRO!";
    } else if (actionType === "REGIONAL_GRANT") {
        if (!assertGovernmentAuthority("Grantet rajonale për deputetë")) return;
        if(mp.lastFiscalGrantTurn===state.turnCount)return false;
        var authorization=fiscalSpendingCheck(.01,false);if(!authorization.allowed){showToast(authorization.message);return false;}
        if(state.budgetTotalB<.01){showToast('Mungojnë mjetet për grantin rajonal.');return false;}
        fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB - 0.01).toFixed(9),"interactWithMP");mp.lastFiscalGrantTurn=state.turnCount;
        mp.trustPlayer = clamp((mp.trustPlayer || 60) + 16, 0, 100);
        mp.loyalty = clamp(mp.loyalty + 12, 0, 100);
        mp.rebelRisk = false;
        mp.promisedVoteNext = true;
        reply = "Mbështetja €10M për " + mp.region + " është lajm i shkëlqyer. Vota ime është e garantuar!";
    } else {
        state.parties[state.playerParty].relations[mp.party] = clamp((state.parties[state.playerParty].relations[mp.party] || 50) + 5, 0, 100);
        reply = "Do të bisedoj me kryetarin e grupit (" + mp.party + ").";
    }
    mp.meetingHistory.push(MONTHS_SQ[state.monthIndex] + " " + state.year + ": " + actionType);
    refreshAllUI();
    openMpProfile(mpIdx, 2, reply);
}

function renderOppositionSection() {
    var container = document.getElementById("oppositionSectionContainer");
    if (!container) return;
    var oppSeats = 120 - getCoalitionSeats();
    container.innerHTML =
        '<div class="card">' +
            '<div class="card-header">' +
                '<div class="card-title">⚡ Veprimtaria e Opozitës, Interpelancat & Mocioni i Mosbesimit</div>' +
                '<span class="tag tag-pdk">Vota të Opozitës: ' + oppSeats + ' / 120</span>' +
            '</div>' +
            '<div class="grid-2">' +
                '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
                    '<h4 style="font-size:0.85rem; margin-bottom:8px; color:var(--accent-gold);">Mjetet e Kontrollit Parlamentar</h4>' +
                    '<button class="choice-btn" onclick="runParliamentaryInterpellation()">' +
                        '<span class="choice-title">Thirr Interpelancë Parlamentare për Ekzekutivin</span>' +
                        '<span class="choice-impact">Debat në Kuvend mbi punën e ministrive</span>' +
                    '</button>' +
                    '<button class="choice-btn" onclick="organizePublicProtest()">' +
                        '<span class="choice-title">Mobilizo Protestë Qytetare</span>' +
                        '<span class="choice-impact">Ndikon në sondazhet e partive</span>' +
                    '</button>' +
                '</div>' +
                '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
                    '<h4 style="font-size:0.85rem; margin-bottom:8px; color:var(--danger);">Mocioni i Mosbesimit</h4>' +
                    '<button class="action-btn btn-danger" onclick="openMotionModal()">🗳️ Propozo Mocion Mosbesimi</button>' +
                '</div>' +
            '</div>' +
        '</div>';
}

function runParliamentaryInterpellation() {
    if(typeof oppositionActive==='function' && oppositionActive())return performOppositionAction('INTERPELLATE');
    if(!assertPoliticalParliament('Veprimi parlamentar'))return false;
    if (!assertAssemblyFunctional("Interpelanca parlamentare")) return;
    adjustPublicSupport((1.2), {source:"runParliamentaryInterpellation"}, state);
    addMediaNews("Kuvendi Live", "Seancë maratonë me interpelanca parlamentare mes Qeverisë dhe deputetëve të opozitës.", "NEUTRAL");
    refreshAllUI();
    showToast("Interpelanca parlamentare u zhvillua në Kuvend!");
}

function organizePublicProtest() {
    if(typeof oppositionActive==='function' && oppositionActive())return performOppositionAction('RALLY');
    var p = state.parties[state.playerParty];
    adjustPublicSupport(.4, {source:'organizePublicProtest'});
    addMediaNews("T7", "Tubim masiv në Sheshin e Prishtinës i organizuar nga " + p.short + ".", "NEUTRAL");
    refreshAllUI();
    showToast("Tubimi i " + p.short + " u zhvillua në Prishtinë. Sondazhet pasuese do të pasqyrojnë reagimin publik.");
}

/* ============================================================================
   30. RENDER PROJEKTLIGJET
   ============================================================================ */

function renderBillAgenda() {
    var container = document.getElementById("billAgendaContainer");
    if (!container) return;
    var filterEl = document.getElementById("billStatusFilter");
    var filter = filterEl ? filterEl.value : "ALL";

    var filtered = state.laws.filter(function(l) {
        if(!agendaExecutive(state)&&l.status==='DRAFT'&&(l.govRequired||(l.proposer||'').startsWith('Qeveria')))return false;
        return filter === "ALL" || l.status === filter;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div style="padding:14px; background:#0f172a; border-radius:8px; font-size:0.8rem; color:var(--text-muted);">Nuk ka projektligje me këtë status. Klikoni "+ Propozo Projektligj të Ri" për të zgjedhur nga katalogu.</div>';
        return;
    }

    var groups = { DRAFT: [], SUBMITTED: [], UNDER_REVIEW: [], SCHEDULED: [], PASSED: [], FAILED: [], ANNULLED: [] };
    filtered.forEach(function(l) { if (groups[l.status]) groups[l.status].push(l); });

    var statusTitles = {ANNULLED:"Anuluar nga Gjykata",
        DRAFT: "📝 Draftet (nuk janë dorëzuar)",
        SUBMITTED: "📤 Dorëzuar në Kuvend",
        UNDER_REVIEW: "🔍 Në Shqyrtim Parlamentar",
        SCHEDULED: "📅 Të Caktuara për Seancë",
        PASSED: "✅ Të Miratuara",
        FAILED: "❌ Të Rrëzuara"
    };

    var html = "";
    ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SCHEDULED", "PASSED", "FAILED", "ANNULLED"].forEach(function(stKey) {
        if (groups[stKey].length === 0) return;
        html += '<div style="margin-bottom:14px;">' +
            '<h4 style="font-size:0.85rem; color:var(--accent-gold); margin-bottom:6px;">' + statusTitles[stKey] + ' (' + groups[stKey].length + ')</h4>' +
            groups[stKey].map(function(law) {
                var realIdx = state.laws.indexOf(law);
                return renderBillCard(law, realIdx);
            }).join("") +
        '</div>';
    });

    container.innerHTML = html;
}

function renderBillCard(law, idx) {
    law = Object.assign({}, law);
    if(isSpecialRepealLaw(law)){law.title=law.title.replace(/ \u00b7 skenar alternativ$/i,'');if(law.desc==='Dokument i paracaktuar i simulimit, pa tekst juridik real.')law.desc='Propozim për shfuqizimin e Gjykatës Speciale.';}
    ['title','desc','proposer','ministry','source','lastVoteResult'].forEach(function(k){if(law[k])law[k]=catalogEscape(law[k]);});
    var tagCls = courtMajorPending(law,state)?"tag-gold":law.status==="ANNULLED"?"tag-min":getBillStatusTagClass(law.status);
    var tagTxt = courtMajorPending(law,state)?"I Pezulluar":law.status==="ANNULLED"?"Anuluar nga Gjykata":getBillStatusLabel(law.status);
    var majLabel = getMajorityLabel(law);
    var majCls = getMajorityBadgeClass(law);
    var costM = ((law.annualBudgetPlan?.plannedB ?? law.costB) * 1000).toFixed(0);
    var sectorName = "—";
    var sec = (state.stateSectors || []).find(function(s) { return s.id === law.sector; });
    if (sec) sectorName = sec.name;

    var assemblyOK = state.assemblyConstituted && state.speakerElected;

    var actionsHtml = "";
    if (law.status === "DRAFT") {
        actionsHtml = '<button class="action-btn btn-gold" onclick="submitBillToAssembly(' + idx + ')" ' + (!assemblyOK ? "disabled" : "") + '>📤 Dorëzo në Kuvend</button>' +
                     '<button class="action-btn btn-danger" onclick="deleteDraftBill(' + idx + ')">🗑️ Fshij Draftin</button>';
    } else if (law.status === "SUBMITTED") {
        actionsHtml = '<button class="action-btn btn-gold" onclick="sendBillToReview(' + idx + ')" ' + (!assemblyOK ? "disabled" : "") + '>🔍 Dërgo në Shqyrtim</button>';
    } else if (law.status === "UNDER_REVIEW") {
        actionsHtml = '<button class="action-btn btn-gold" onclick="scheduleBillForSession(' + idx + ')" ' + (!assemblyOK ? "disabled" : "") + '>📅 Cakto për Seancë</button>';
    } else if (law.status === "SCHEDULED") {
        actionsHtml = '<button class="action-btn btn-gold" onclick="voteLawInAssembly(' + idx + ')" ' + (!assemblyOK ? "disabled" : "") + '>🗳️ Voto në Seancë</button>' +
                     '<button class="action-btn btn-outline" onclick="unscheduleBill(' + idx + ')">↩ Hiq nga Seanca</button>';
    }

    if (lawNegotiationEligible(state.laws[idx])) actionsHtml += '<button class="action-btn" onclick="openLawNegotiations(' + idx + ')">Negocio mbështetjen</button>';
    var breakdownHtml = "";
    if (law.voteHistory && law.voteHistory.length > 0) {
        var lastVote = law.voteHistory[law.voteHistory.length - 1];
        breakdownHtml = '<div style="margin-top:6px; padding:6px 8px; background:rgba(255,255,255,0.03); border-radius:6px; font-size:0.73rem;">' +
            '<strong>Votimi i fundit (Java ' + lastVote.week + '):</strong> ' +
            '<span style="color:var(--success);">🟢 ' + lastVote.pro + '</span> | ' +
            '<span style="color:var(--danger);">🔴 ' + lastVote.kunder + '</span> | ' +
            '<span style="color:#94a3b8;">⚪ ' + lastVote.abstenim + '</span> | ' +
            '<span style="color:#475569;">⚫ ' + lastVote.mungese + '</span>' +
        '</div>';
    }

    var historyHtml = (law.stageHistory || []).map(function(h) {
        return '<span style="font-size:0.68rem; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; margin-right:4px; display:inline-block; margin-bottom:2px;">' + getBillStatusLabel(h.stage).split(" ")[0] + ' (J' + h.week + ')</span>';
    }).join("");

    var sourceHtml = law.source ? '<div style="font-size:0.68rem; color:var(--text-muted); margin-top:3px; font-style:italic;">📚 ' + law.source + '</div>' : '';

    return '<div class="card" style="background:#0f172a; margin-bottom:10px; border-left:4px solid ' +
            (law.status === "PASSED" ? 'var(--success)' : (law.status === "FAILED" ? 'var(--danger)' : (law.status === "SCHEDULED" ? 'var(--accent-gold)' : (law.status === "DRAFT" ? '#64748b' : 'var(--accent-blue)')))) + ';">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px; flex-wrap:wrap;">' +
            '<div style="flex:1; min-width:200px;">' +
                '<strong style="font-size:0.88rem;">' + law.title + '</strong>' +
                '<div style="font-size:0.72rem; color:var(--accent-gold); margin-top:3px;">📌 Propozues: ' + (law.proposer || law.ministry) + ' • Sektori: ' + sectorName + '</div>' +
                '<div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">' +
                    '<span class="majority-badge ' + majCls + '">' + majLabel + '</span> • '+(law.annualBudgetYear?'Plani vjetor':'Kosto')+': €' + costM + 'M' +
                '</div>' +
            '</div>' +
            '<span class="tag ' + tagCls + '">' + tagTxt + '</span>' +
        '</div>' +
        '<p style="font-size:0.79rem; color:var(--text-muted); margin-bottom:8px;">' + law.desc + '</p>' +
        sourceHtml +
        '<div style="font-size:0.74rem; color:#cbd5e1; margin-bottom:6px;">Grupet mbështetëse: <strong>' + (law.supportParties || []).join(", ") + '</strong>' +
            (law.lastVoteResult ? '<br>Rezultati: <strong style="color:var(--accent-gold);">' + law.lastVoteResult + '</strong>' : '') +
        '</div>' +
        '<div style="margin-bottom:6px;">' + historyHtml + '</div>' +
        breakdownHtml +
        (law.catalog13 ? '<button class="action-btn" onclick="catalogBillDetails('+idx+');toggleModal(\'interactiveActionModal\',true)">Dokumenti, Qeveria dhe amendamentet</button>' : '') +
        (law.status==='FAILED'?'<p>'+catalogEscape(billResubmissionCheck(law).message)+'</p>'+(billResubmissionCheck(law).allowed?'<button class="action-btn" onclick="resubmitRejectedBill('+idx+')">Rishiko dhe riparaqit në Kuvend</button>':''):'')+
        (actionsHtml ? '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">' + actionsHtml + '</div>' : '') +
    '</div>';
}

function openNewBillModal() { return openSectorLaws('ALL'); }

function filterLawCatalog() {
    var fieldEl = document.getElementById("lawCatFieldFilter");
    var typeEl = document.getElementById("lawCatTypeFilter");
    var searchEl = document.getElementById("lawCatSearch");
    if (!fieldEl || !typeEl || !searchEl) return;
    var field = fieldEl.value;
    var type = typeEl.value;
    var search = (searchEl.value || "").toLowerCase();
    var cards = document.querySelectorAll("#lawCatalogList [data-law-field]");
    cards.forEach(function(card) {
        var matchField = (field === "ALL" || card.getAttribute("data-law-field") === field);
        var matchType = (type === "ALL" || card.getAttribute("data-law-type") === type);
        var matchSearch = (!search || card.textContent.toLowerCase().indexOf(search) !== -1);
        card.style.display = (matchField && matchType && matchSearch) ? "block" : "none";
    });
}

function createBillFromCatalog(catalogId, targetStatus) {
    if(!assertPoliticalParliament('Propozimi i projektligjit') || state.pendingVote || weeklyProcessing)return false;
    if(catalogId==='cat_sovereign_fund')return openSovereignFund();
    if(catalogId==='cat_budget_2027')return fiscalAnnualBudgetForm();
    targetStatus = "DRAFT";
    var catLaw = LAW_CATALOG.find(function(l) { return l.id === catalogId; });
    if (!catLaw) { showToast("Projektligji nuk u gjet në katalog!"); return; }
    if(catLaw.recordKind==='HISTORICAL')return false;

    var isPlayerGov = agendaExecutive();
    var proposerText = isPlayerGov ? ("Qeveria e Kosovës (" + catLaw.ministry + ")") : ("Deputetë të " + state.parties[state.playerParty].short);

    var impact = calculateLawImpact(catLaw);
    var cost = catLaw.defaultCostM;
    var majorityType = catLaw.lawType === "VITAL" ? "VITAL_DOUBLE" : (catLaw.lawType === "BUDGET" ? "BUDGET" : "SIMPLE_61");
    var requiredVotes = majorityType === "VITAL_DOUBLE" ? 61 : (catLaw.lawType === "BUDGET" ? 61 : 61);

    var dup = state.laws.find(function(l) {
        return l.catalogId === catLaw.id && !['FAILED','WITHDRAWN','ANNULLED'].includes(l.status);
    });
    if (dup) {
        showToast("Ky projektligj është tashmë në agjendë!");
        return;
    }
    var rejected=state.laws.find(function(l){return l.catalogId===catLaw.id && l.status==='FAILED';});
    if(rejected)return resubmitRejectedBill(state.laws.indexOf(rejected));

    var beforeCreation=JSON.stringify(state);
    try{
    state.billCounter = (state.billCounter || 0) + 1;
    var newBill = {
        id: "law_cat_" + Date.now() + "_" + state.billCounter,
        catalogId: catLaw.id,
        title: catLaw.title,
        ministry: catLaw.ministry,
        proposer: proposerText,
        sector: catLaw.sectorId,
        desc: catLaw.desc,
        field: catLaw.field,
        source: catLaw.source,
        historicNote: catLaw.historicNote || null,
        majorityType: majorityType,
        requiredVotes: requiredVotes,
        costB: +(cost / 1000).toFixed(3),
        approvalEffect: impact.approvalEffect,
        impactExplanation: impact.explanation,
        supportParties: [state.playerParty],
        stage: targetStatus === "DRAFT" ? "Draft i Papërpunuar" : "Dorëzuar në Kuvend",
        status: targetStatus,
        submittedWeek: targetStatus === "SUBMITTED" ? state.turnCount : null,
        scheduledWeek: null,
        applied: false,
        voteHistory: [],
        stageHistory: [{ stage: targetStatus, week: state.turnCount }],
        lastVoteResult: null
    };

    state.laws.unshift(newBill);
    initializeCatalogBill(newBill);
    newBill.source='Dokument i simuluar — pa burim ligjor real të verifikuar';
    newBill.majorityType=majorityType;newBill.requiredVotes=requiredVotes;
    if(catLaw.legalEffectMode==='PROCEDURAL')newBill.legalEffectMode='PROCEDURAL';
    if(!saveGameAuto())throw Error('Ruajtja e draftit dështoi.');
    }catch(error){state=JSON.parse(beforeCreation);showToast('Drafti nuk u krijua: '+error.message);return false;}
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    showMajorAnnouncement({
        badge: "PROJEKTLIGJ " + (targetStatus === "DRAFT" ? "I RUAJTUR SI DRAFT" : "I DORËZUAR"),
        title: catLaw.title,
        reason: "Propozues: " + proposerText + ". Fusha: " + catLaw.field + ".",
        statsHtml: '<div style="text-align:center; font-size:0.86rem;">' +
            '<div>Kosto: <strong style="color:var(--accent-gold);">€' + cost + 'M</strong></div>' +
            '<div>Ndikimi i pritshëm: <strong style="color:' + (impact.approvalEffect >= 0 ? 'var(--success)' : 'var(--danger)') + ';">' + publicSupportReaction(impact.approvalEffect, 'IMPLEMENTATION') + '</strong></div>' +
            '<div>Shumica e nevojshme: <strong>' + getMajorityLabel({ majorityType: majorityType }) + '</strong></div>' +
        '</div>',
        immediateImpact: impact.explanation
    });
    return true;
}

function calculateLawImpact(catLaw) {
    if(catLaw.legalEffectMode==='PROCEDURAL')return {approvalEffect:0,explanation:'Miratimi regjistron aktin parlamentar. Nuk ka efekt numerik ose pagesë automatike; masat e zbatimit shqyrtohen veçmas.'};
    var base = catLaw.impactMagnitude || 1.0;
    var econModifier = 1.0;
    if (catLaw.field === "Buxheti" && state.budgetTotalB < 3.0) econModifier = 0.7;
    if (catLaw.field === "Ekonomia" && state.gdpGrowth < 2.5) econModifier = 1.2;
    if (catLaw.field === "Buxheti" && state.inflation > 4) econModifier = 0.8;

    var politicalModifier = 1.0;
    var playerParty = state.parties[state.playerParty];
    if (catLaw.field === "Drejtësia" && playerParty.ideology.toLowerCase().includes("konservator")) politicalModifier = 0.9;
    if (catLaw.field === "Komunitetet" && !state.coalitionParties.includes("MIN_MULTI")) politicalModifier = 0.85;

    var finalImpact = base * econModifier * politicalModifier;
    finalImpact = clamp(finalImpact, -8, 8);

    var explanation = "Vlerësimi merr parasysh ekonominë, situatën politike dhe ecurinë e zbatimit. Miratimi i ligjit nuk garanton përkrahje publike.";

    return { approvalEffect: +finalImpact.toFixed(1), explanation: explanation };
}

function submitBillToAssembly(lawIdx) {
    if(!assertBillInitiator(state.laws[lawIdx]))return false;
    if (!assertAssemblyFunctional("Dorëzimi i projektligjit")) return;
    var law = state.laws[lawIdx];
    if (!law || law.status !== "DRAFT") return;
    if (!isSpecialRepealLaw(law)&&!catalogSubmissionAllowed(law)) return;
    if(law.internationalAgreementId && !law.internationalProcedure){var agreement=internationalAgreement(law.internationalAgreementId);if(agreement && agreement.lifecycle && !agreement.lifecycle.legacy)return sendAgreementToInstitution(agreement.lifecycle.documentId);}
    if(recordBillSubmission(law)===false)return false;
    refreshAllUI();
    showToast("Projektligji u dorëzua!");return true;
}

function recordBillSubmission(law) {
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed()){showToast('Kuvendi është në pushim zgjedhor; nuk pranohen ligje të reja.');return false;}
    if (!isSpecialRepealLaw(law)&&!catalogSubmissionAllowed(law)) return false;
    var beforeSubmission=JSON.stringify(state);
    try{prepareSpecialBillSubmission(law);}catch(error){state=JSON.parse(beforeSubmission);showToast(error.message);return false;}
    law.status = "SUBMITTED";
    law.stage = "Dorëzuar në Kuvend";
    law.submittedWeek = state.turnCount;
    law.stageHistory=law.stageHistory||[];law.stageHistory.push({ stage: "SUBMITTED", week: state.turnCount });
    try{if(!isSpecialRepealLaw(law))registerAssemblyObstruction(law);validateLoadedState(state);if(!saveGameAuto())throw Error('Ruajtja deshtoi.');}catch(error){state=JSON.parse(beforeSubmission);showToast(error.message);return false;}
    addMediaNews("Kuvendi i Kosovës", "Projektligji \"" + law.title + "\" u dorëzua në Kuvend.", "NEUTRAL");
    state.historyLog.unshift(MONTHS_SQ[state.monthIndex] + " " + state.year + " [Kuvend]: Dorëzohet \"" + law.title + "\".");
}

function deleteDraftBill(idx) {
    if(!assertBillInitiator(state.laws[idx]))return false;
    var law = state.laws[idx];
    if (!law || law.status !== "DRAFT") return;
    if(isSpecialRepealLaw(law)&&state.brusselsSpecial.repeal?.lawId===law.id)return withdrawSpecialDraft(law);
    if(law.internationalAgreementId){showToast("Akti i marrëveshjes ruhet në arkiv; përdorni procedurën e dokumentit.");return false;}
    if(state.darkPolitics?.deals.some(function(d){return d.lawId===law.id;}))return catalogWithdraw(idx);
    if(law.annualBudgetYear)return catalogWithdraw(idx);
    state.laws.splice(idx, 1);
    refreshAllUI();
    showToast("Drafti u fshi.");
}

function sendBillToReview(lawIdx) {
    if (!assertAssemblyFunctional("Dërgimi i projektligjit në shqyrtim")) return;
    var law = state.laws[lawIdx];
    if (!law || law.status !== "SUBMITTED") return;
    law.status = "UNDER_REVIEW";
    if (law.catalog13) law.reviewTurn = state.turnCount;
    law.stage = "Në Shqyrtim në Komision";
    law.stageHistory.push({ stage: "UNDER_REVIEW", week: state.turnCount });
    refreshAllUI();
    showToast("Projektligji u dërgua për shqyrtim.");
}

function scheduleBillForSession(lawIdx) {
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed())return false;
    if (!assertAssemblyFunctional("Caktimi i projektligjit për seancë")) return;
    var law = state.laws[lawIdx];
    if (!law || law.status !== "UNDER_REVIEW") return;
    if (law.catalog13 && (!law.debated || state.turnCount <= law.reviewTurn || law.amendments.some(function(a){return a.status === "PENDING";}))) { showToast("Përfundoni debatin, vendimet për amendamentet dhe një javë shqyrtimi."); return; }
    law.status = "SCHEDULED";
    law.stage = "Caktuar për Seancë Plenare";
    law.scheduledWeek = state.turnCount;
    law.stageHistory.push({ stage: "SCHEDULED", week: state.turnCount });
    addMediaNews("Kuvendi i Kosovës", "Projektligji \"" + law.title + "\" u caktua për seancë plenare.", "POSITIVE");
    refreshAllUI();
    showToast("Projektligji u caktua për seancë!");
}

function unscheduleBill(idx) {
    var law = state.laws[idx];
    if (!law || law.status !== "SCHEDULED") return;
    law.status = "UNDER_REVIEW";
    law.stage = "Në Shqyrtim";
    law.scheduledWeek = null;
    law.stageHistory.push({ stage: "UNDER_REVIEW", week: state.turnCount });
    refreshAllUI();
    showToast("Projektligji u hoq nga seanca.");
}

function validAssemblyComposition() {
    var seats = Object.values(state.parties).reduce(function(sum, party) { return sum + party.seats; }, 0);
    var ledger=deputyLedger(state),vacancies=ledger?ledger.vacancies:[];
    try{validateDeputyMandates(state);}catch(error){showToast(error.message);return false;}
    var valid = seats === 120 && state.mps.length+vacancies.length === 120 &&
        new Set(state.mps.map(function(mp) { return mp.seatNumber; }).concat(vacancies.map(function(v){return v.seatNumber;}))).size === 120 &&
        Object.keys(state.parties).every(function(key) {
            return Number.isInteger(state.parties[key].seats) && state.parties[key].seats >= 0 &&
                state.mps.filter(function(mp) { return mp.party === key; }).length+vacancies.filter(function(v){return v.partyId===key;}).length === state.parties[key].seats;
        });
    if (!valid) showToast("Përbërja e Kuvendit është e pavlefshme. Votimi u ndal; kërkohet korrigjim i të dhënave, pa shtuar deputetë.");
    return valid;
}

function calculateLawVote(law, forecast) {
    var random = forecast ? function(){return 0.5;} : Math.random;
    var result = { pro: 0, kunder: 0, abstenim: 0, mungese: deputyVacantCount(), minorityYes: 0, ballots: [] };
    var isGovBill = (law.proposer && law.proposer.indexOf("Qeveria") === 0);

    state.mps.forEach(function(mp) {
        var ballot;
        var partyInCoalition = state.coalitionParties.includes(mp.party);
        var partyInSupport = (law.supportParties || []).includes(mp.party);
        var relToPlayer = (state.parties[state.playerParty].relations[mp.party] || 50);

        if (partyInCoalition) {
            if (isGovBill || partyInSupport) {
                var rebellionChance = (mp.rebelRisk && !mp.promisedVoteNext) ? (0.08 + random() * 0.07) : 0.02;
                if (random() < rebellionChance) {
                    if (random() < 0.6) { ballot = "abstenim";  }
                    else { ballot = "mungese";  }
                } else {
                    ballot = "pro";
                }
            } else {
                var supportChance = relToPlayer / 200 + (mp.trustPlayer || 60) / 400 + 0.15;
                if (random() < supportChance) { ballot = "pro";  }
                else if (random() < 0.35) { ballot = "abstenim";  }
                else { ballot = "kunder";  }
            }
        } else {
            if (mp.promisedVoteNext) {
                ballot = "pro";
            } else if (partyInSupport && !isGovBill) {
                if (random() < 0.65) { ballot = "pro";  }
                else if (random() < 0.5) { ballot = "abstenim";  }
                else { ballot = "kunder";  }
            } else {
                if (random() < 0.15) { ballot = "mungese";  }
                else if (random() < 0.10) { ballot = "abstenim";  }
                else { ballot = "kunder";  }
            }
        }
        ballot = negotiatedLawBallot(law, mp, ballot, forecast, random);
        if(typeof darkPoliticalBallot==='function')ballot=darkPoliticalBallot(law,mp,ballot);
        if(typeof coalitionDemandBallot==='function')ballot=coalitionDemandBallot(law,mp,ballot);
        if(typeof oppositionLawBallot==='function')ballot=oppositionLawBallot(law,mp,ballot,forecast,random);
        if(typeof crisisCoalitionBallot==='function')ballot=crisisCoalitionBallot(law,mp,ballot,forecast,random);
        if(typeof specialShockBallot==='function')ballot=specialShockBallot(law,mp,ballot);
        ballot=vitalCommunityBallot(law,mp,ballot);
        ballot=veteransBudgetBallot(law,mp,ballot);
        ballot=coalitionBlackmailBallot(law,mp,ballot);
        result[ballot]++;
        if (ballot === "pro" && (mp.party === "MIN_MULTI" || mp.party === "SL")) result.minorityYes++;
        result.ballots.push({ seatNumber: mp.seatNumber, vote: ballot,
            consumePromise: !partyInCoalition && mp.promisedVoteNext === true });
    });
    result.passed = ['INTL_80','CONSTITUTION_80'].includes(law.majorityType) ? result.pro >= 80 :
        law.majorityType === "VITAL_DOUBLE" ? result.pro >= 61 && result.minorityYes >= 14 : result.pro >= 61;
    if(typeof constitutionalBlockReason==='function'){var blocked=constitutionalBlockReason(law,state);if(blocked){result.blockedReason=blocked;result.passed=false;}}
    return result;
}

function finalizeLawVote(law, result, sessionId) {
    if(bureauVoteBlocked(law)||law?.bureauBattle&&["FORCE_READY","VENICE_READY"].includes(law.bureauBattle.status)&&(!_committingVote||!state.pendingVote))return false;
    if(law?.associationUltimatumId)return false;
    if(activeAssemblyObstruction(state))throw Error('Kuvendi eshte i ngrire nga bllokada.');
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed())return false;
    if(typeof constitutionalBlockReason==='function' && constitutionalBlockReason(law,state)){showToast(constitutionalBlockReason(law,state));return false;}
    if(law?.constitutionChange && (!_committingVote || !state.pendingVote || law.status!=='SCHEDULED' || law.majorityType!=='CONSTITUTION_80' || result.passed && result.pro<80))return false;
    if(law?.veteransBudgetLaw&&(!_committingVote||!state.pendingVote))return false;
    if(law?.annualBudgetYear && (!_committingVote || !state.pendingVote || law.status!=='SCHEDULED')){showToast('Projektbuxheti miratohet vetëm përmes votimit të seancës.');return false;}
    if (!assertAssemblyFunctional("Miratimi i ligjit")) return false;
    if (["PASSED","FAILED","ANNULLED","WITHDRAWN"].includes(law.status)) return false;
    if(_committingVote && typeof coalitionDemandFinalize==='function')coalitionDemandFinalize(law,result);
    var labels = { pro: "PRO", kunder: "KUNDËR", abstenim: "ABSTENIM", mungese: "MUNGON" };
    result.ballots.forEach(function(ballot) {
        var mp = state.mps.find(function(item) { return item.seatNumber === ballot.seatNumber; });
        if (!mp.votingHistory) mp.votingHistory = [];
        mp.votingHistory.push(law.id + ": " + labels[ballot.vote]);
        if (ballot.consumePromise) mp.promisedVoteNext = false;
    });
    law.lastVoteResult = result.pro + " PËR, " + result.kunder + " KUNDËR, " + result.abstenim + " ABSTENIME, " + result.mungese + " MUNGESA" +
        (law.majorityType === "VITAL_DOUBLE" ? " (Komunitetet: " + result.minorityYes + "/20)" : "");
    law.voteHistory = law.voteHistory || [];
    law.voteHistory.push({ week: state.turnCount, pro: result.pro, kunder: result.kunder,
        abstenim: result.abstenim, mungese: result.mungese, minorityYes: result.minorityYes, passed: result.passed });
    law.status = result.passed ? "PASSED" : "FAILED";
    if(result.passed&&typeof considerAICourtReferral==='function')considerAICourtReferral(law);
    if(typeof interestLawResult==='function'&&!law.brusselsSpecial&&!courtMajorPending(law,state))interestLawResult(law,result);
    if(!result.passed&&typeof recordCrisisPressEvent==='function')recordCrisisPressEvent('LAW','law:'+law.id,law.title,law.sector);
    if(typeof consumeDarkPoliticalVotes==='function')consumeDarkPoliticalVotes(law);
    law.stage = result.passed ? (courtMajorPending(law,state)?"I Pezulluar nga Gjykata":"Ligj i miratuar") : "I Rrëzuar në Votim";
    if (!result.passed) law.failureReason = "Nuk u arrit pragu i votave sipas rregullit të simulimit.";
    law.stageHistory = law.stageHistory || [];
    law.stageHistory.push({ stage: law.status, week: state.turnCount });
    fiscalAnnualBudgetResult(law,result);
    if(typeof oppositionLawResult==='function')oppositionLawResult(law,result);
    if (result.passed && !law.applied && !courtMajorPending(law,state)) { law.applied = true; applyLawEffects(law); }
    if(typeof brusselsLawResult==='function'&&!courtMajorPending(law,state))brusselsLawResult(law,result);
    if(result.passed&&!courtMajorPending(law,state)&&typeof executiveLawPassed==='function')executiveLawPassed(law);
    if(result.passed&&!courtMajorPending(law,state) && typeof considerStreetLawProtest==='function')considerStreetLawProtest(law);
    addMediaNews(result.passed ? "Kuvendi Live" : "KOHA", law.title + (result.passed?': miratohet në Kuvend':': nuk merr votat e nevojshme'), result.passed ? "POSITIVE" : "CRITICAL",null,null,{kind:'VOTE',title:law.title,passed:result.passed,pro:result.pro,against:result.kunder,abstain:result.abstenim,absent:result.mungese,required:['INTL_80','CONSTITUTION_80'].includes(law.majorityType)?80:61,vital:law.majorityType==='VITAL_DOUBLE',minorityYes:result.minorityYes});
    state.historyLog.unshift(MONTHS_SQ[state.monthIndex] + " " + state.year + " [Kuvend]: " + law.title + ": " + law.lastVoteResult);
    var session = (state.parliamentarySessions || []).find(function(item) { return item.id === sessionId; });
    if (session) session.results.push({ billId: law.id, title: law.title, status: law.status, resultText: law.lastVoteResult });
    bureauBattleVoteResult(law,result);veteransBudgetLawResult(law,result);
    agreementParliamentaryResult(law);
    return true;
}

function beginLawVote(law, continuation) {
    // Closed campaign sessions must not open executive side events or mutate the agenda.
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed()){showToast('Kuvendi nuk voton ligje të reja gjatë fushatës.');return false;}
    if(!continuation&&law){var agendaSession=(state.parliamentarySessions||[]).find(s=>s.status!=='COMPLETED'&&s.billIds?.includes(law.id));if(agendaSession){continuation={sessionId:agendaSession.id};state.activeSessionId=agendaSession.id;}}
    if(bureauVoteBlocked(law)){showToast("Procesi i Byrose eshte ne pritje te vendimit ose te Venecias.");return false;}
    if(law?.annualBudgetYear&&agendaExecutive(state)&&state.veteransBudget?.openedTurn===null){governmentCrisisCommit(()=>openVeteransBudget(law.annualBudgetYear));renderVeteransBudget();return false;}
    if(law?.associationUltimatumId){showToast('Drafti i ultimatumit trajtohet vetem nga rasti kushtetues i regjistruar.');return false;}
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed()){showToast('Kuvendi nuk voton ligje të reja gjatë fushatës.');return false;}
    if(typeof governmentCrisisPending==='function'&&governmentCrisisPending()){showToast('Zgjidhni vendimin urgjent përpara votimit.');return false;}
    if(typeof constitutionalBlockReason==='function' && constitutionalBlockReason(law,state)){showToast(constitutionalBlockReason(law,state));return false;}
    if(law && !law.oppositionBill && !law.annualBudgetYear && !law.internationalAgreementId && law.costB>0){var authorization=fiscalSpendingCheck(law.costB,false);if(!authorization.allowed){showToast(authorization.message);return false;}}
    if(law?.annualBudgetYear && state.publicFinance.budgets[law.annualBudgetYear]?.lawId!==law.id){showToast('Kjo nuk është paraqitja aktive e projektbuxhetit.');return false;}
    if(law?.catalogId==='cat_budget_2027' && !law.annualBudgetYear && state.publicFinance.budgets[2027]?.status==='APPROVED'){showToast('Buxheti i vitit 2027 është tashmë i miratuar; nuk përsëritet pagesa ose votimi.');return false;}
    if (!assertAssemblyFunctional("Votimi")) return;
    if (law && law.catalog13 && (law.status !== "SCHEDULED" || !law.debated || state.turnCount <= law.scheduledWeek) && !bureauExpeditedReady(law)) { showToast("Kërkohet seancë e caktuar dhe një javë për përgatitjen e votimit."); return; }
    if (law && !law.oppositionBill && !law.internationalAgreementId && (law.costB || 0) > state.budgetTotalB) { showToast("Buxheti nuk mbulon koston e zbatimit; votimi u shty."); return; }
    if (_voteInProgress || state.pendingVote) { showToast("Një votim është në zhvillim e sipër!"); return; }
    if (!law || ['PASSED','FAILED','WITHDRAWN','ANNULLED'].includes(law.status)) return;
    if(!canVoteAgreementBill(law))return false;
    if (!validAssemblyComposition()) return;
    if(assemblyObstructionGate(law))return false;
    if(vitalCommunityGate(law,continuation))return false;
    processLawNegotiations();
    if(coalitionBlackmailGate(law))return false;
    if(typeof coalitionDemandGate==='function' && coalitionDemandGate(law,continuation))return false;
    var result = calculateLawVote(law);
    result.resultHtml = result.passed ? "✅ LIGJI U MIRATUA ME " + result.pro + " VOTA PRO!" : "❌ LIGJI U RRËZUA (" + result.pro + " PRO / " + (law.requiredVotes || 61) + " të nevojshme)";
    result.governmentContext={kind:'LAW',approved:result.passed,title:law.title,required:law.requiredVotes||61,primeMinister:agendaExecutive(state)};
    startVotingAnimation("⚖️ Votimi i Projektligjit", law.title, result, function() {
        finalizeLawVote(law, result, continuation && continuation.sessionId);
        showMajorAnnouncement({ badge: result.passed ? "✔ LIGJ I MIRATUAR" : "✕ PROJEKTLIGJ I RRËZUAR",
            title: law.title,
            reason: "Shumica e nevojshme: " + (law.requiredVotes || 61) + " vota" +
                (law.majorityType === "VITAL_DOUBLE" ? " + 14 vota të komuniteteve" : "") + ".",
            statsHtml: '<div style="text-align:center; font-size:0.95rem; font-weight:800;">🟢 PËR: ' + result.pro + ' &nbsp;|&nbsp; 🔴 KUNDËR: ' + result.kunder + ' &nbsp;|&nbsp; ⚪ ABSTENIM: ' + result.abstenim + ' &nbsp;|&nbsp; ⚫ MUNGESA: ' + result.mungese + '</div>',
            immediateImpact: typeof courtLawFrozen==='function'&&courtLawFrozen(law,state)?'Ligji u miratua, por zbatimi është pezulluar nga Gjykata Kushtetuese. Ligjet madhore presin verdiktin për 4–8 javë. Afatet e investitorëve vazhdojnë.':result.passed
                ? (law.legalEffectMode==='PROCEDURAL'?'Akti normativ u miratua në simulim. Nuk u krye pagesë ose rritje treguesish; masat praktike kërkojnë shqyrtim dhe financim veçmas.':law.annualBudgetYear?"Projektbuxheti u miratua nga Kuvendi. Ndarjet zbatohen në vitin përkatës; të hyrat arkëtohen gjatë javëve.":"Ligji u miratua. Plani i zbatimit dhe financimi ruhen në dokument; efektet sektoriale aplikohen sipas afatit.")
                : "Ligji nuk zbatohet. Mund të ripropozohet si draft i ri ose të lihet." });
        if(law.legalEffectMode!=='PROCEDURAL')refreshAllUI();
    }, continuation);
    if(law.legalEffectMode==='PROCEDURAL' && state.pendingVote?.finalized)refreshAllUI();
}

function voteLawInAssembly(lawIdx) {
    if (!assertAssemblyFunctional("Votimi i projektligjit")) return;
    var law=state.laws[lawIdx],session=(state.parliamentarySessions||[]).find(s=>s.status!=='COMPLETED'&&s.billIds?.includes(law?.id));
    beginLawVote(law,session?{sessionId:session.id}:null);
}

function applyLawEffects(law) {
    if(law.constitutionChange){applyConstitutionChange(law);return;}
    if(law.annualBudgetYear)return;
    if (!law.internationalAgreementId) { startCatalogImplementation(law); return; }
    if (law.applied !== true) return;
    if (law.costB && law.costB !== 0) {
        fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB - law.costB).toFixed(9),"applyLawEffects");
    }
    if (law.approvalEffect) {
        adjustPublicSupport((law.approvalEffect), {source:"applyLawEffects"}, state);
    }
    if (law.sector) {
        var sec = (state.stateSectors || []).find(function(s) { return s.id === law.sector; });
        if (sec) sec.score = clamp(sec.score + 8, 10, 100);
    }
}

/* ============================================================================
   31. VOTIMI ANIMACION
   ============================================================================ */

function startVotingAnimation(title, desc, voteData, onComplete, continuation) {
    if (state.pendingVote || activeAssemblyObstruction(state) || mediaDossierBlocked(state) || energyInquiryPending(state)) return false;
    var beforeVote = JSON.stringify(state);
    var governmentApprovalBefore=state.approval;
    state.pendingVote = {
        title: title, desc: desc, data: { pro: voteData.pro, kunder: voteData.kunder,
            abstenim: voteData.abstenim, mungese: voteData.mungese, resultHtml: voteData.resultHtml },
        continuation: continuation || null, finalized: false
    };
    _committingVote = true;
    try {
        if (onComplete) onComplete();
        syncEnterpriseBoards(state);
        state.pendingVote.finalized = true;
        if(typeof createGovernmentVoteNotice==='function' && voteData.governmentContext)state.pendingVote.governmentNotice=createGovernmentVoteNotice(voteData.governmentContext,voteData,governmentApprovalBefore,state.approval,state.pendingVote.announcement);
    } catch (e) {
        state = JSON.parse(beforeVote);
        _voteInProgress = false;
        console.error("Gabim gjatë finalizimit të votimit:", e);
        showToast("Votimi nuk u finalizua. Ndryshimet e papërfunduara u kthyen prapa.");
        return;
    } finally { _committingVote = false; }
    _voteInProgress = true;
    try{if(!saveGameAuto())throw Error('save');}catch(error){
        state=JSON.parse(beforeVote);_voteInProgress=false;currentVotingData=null;
        showToast('Votimi nuk u ruajt; rezultati u kthye në gjendjen e mëparshme.');return false;
    }
    presentPendingVote();
}

function presentPendingVote() {
    var pending = state.pendingVote;
    if (!pending || !pending.finalized) return;
    var title = pending.title, desc = pending.desc, voteData = pending.data;
    var titleEl = document.getElementById("votingModalTitle");
    var descEl = document.getElementById("votingModalDesc");
    if (!titleEl) return;
    titleEl.innerHTML = title;
    if (descEl) descEl.innerHTML = desc;
    ["voteCountPro", "voteCountKunder", "voteCountAbstenim", "voteCountMungese"].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.textContent = "0";
    });
    var progTxt = document.getElementById("votingProgressText");
    if (progTxt) progTxt.textContent = "0 / 120";
    var progBar = document.getElementById("votingProgressBar");
    if (progBar) progBar.style.width = "0%";
    var resEl = document.getElementById("votingModalResult");
    if (resEl) resEl.innerHTML = "";
    var skipBtn = document.getElementById("votingSkipBtn");
    if (skipBtn) skipBtn.style.display = "inline-block";
    var proceedBtn = document.getElementById("votingProceedBtn");
    if (proceedBtn) proceedBtn.style.display = "none";

    toggleModal("votingModal", true);

    currentVotingData = {
        targetPro: voteData.pro,
        targetKunder: voteData.kunder,
        targetAbstenim: voteData.abstenim,
        targetMungese: voteData.mungese,
        currentPro: 0, currentKunder: 0, currentAbstenim: 0, currentMungese: 0,
        totalCounted: 0,
        // Completion data is persisted separately; no callback belongs to the animation.
        finalResultHtml: voteData.resultHtml,
        completed: false
    };

    clearInterval(votingAnimInterval);
    if (pending.progress) {
        Object.assign(currentVotingData, pending.progress);
        ["Pro", "Kunder", "Abstenim", "Mungese"].forEach(function(key) {
            var el = document.getElementById("voteCount" + key);
            if (el) el.textContent = currentVotingData["current" + key];
        });
        if (progTxt) progTxt.textContent = currentVotingData.totalCounted + " / 120";
        if (progBar) progBar.style.width = Math.round(currentVotingData.totalCounted / 120 * 100) + "%";
    }
    votingAnimInterval = setInterval(animateVoteStep, 35);
}

function persistVotingProgress() {
    if (!state.pendingVote || !currentVotingData) return;
    var v = currentVotingData;
    state.pendingVote.progress = { currentPro: v.currentPro, currentKunder: v.currentKunder,
        currentAbstenim: v.currentAbstenim, currentMungese: v.currentMungese, totalCounted: v.totalCounted };
    saveGameAuto();
}

function resumePendingVote() {
    clearInterval(votingAnimInterval);
    currentVotingData = null;
    _voteInProgress = !!state.pendingVote;
    if (state.pendingVote) presentPendingVote();
    else if(typeof resumeOppositionElection==='function' && state.opposition?.snapDue)resumeOppositionElection();
    else if (state.activeSessionId) voteSessionItems(state.activeSessionId, [], 0);
}

function animateVoteStep() {
    var v = currentVotingData;
    if (!v || v.completed) return;
    if (v.totalCounted >= 120) {
        clearInterval(votingAnimInterval);
        showVotingResult();
        return;
    }
    var available = [];
    if (v.currentPro < v.targetPro) available.push("pro");
    if (v.currentKunder < v.targetKunder) available.push("kunder");
    if (v.currentAbstenim < v.targetAbstenim) available.push("abstenim");
    if (v.currentMungese < v.targetMungese) available.push("mungese");
    if (available.length > 0) {
        var pick = available[Math.floor(Math.random() * available.length)];
        if (pick === "pro") v.currentPro++;
        else if (pick === "kunder") v.currentKunder++;
        else if (pick === "abstenim") v.currentAbstenim++;
        else if (pick === "mungese") v.currentMungese++;
        v.totalCounted++;
        persistVotingProgress();
        var elPro = document.getElementById("voteCountPro");
        var elKunder = document.getElementById("voteCountKunder");
        var elAbs = document.getElementById("voteCountAbstenim");
        var elMung = document.getElementById("voteCountMungese");
        if (elPro) elPro.textContent = v.currentPro;
        if (elKunder) elKunder.textContent = v.currentKunder;
        if (elAbs) elAbs.textContent = v.currentAbstenim;
        if (elMung) elMung.textContent = v.currentMungese;
        var progTxt = document.getElementById("votingProgressText");
        if (progTxt) progTxt.textContent = v.totalCounted + " / 120";
        var progBar = document.getElementById("votingProgressBar");
        if (progBar) progBar.style.width = Math.round((v.totalCounted / 120) * 100) + "%";
    } else {
        clearInterval(votingAnimInterval);
        showVotingResult();
    }
}

function skipVotingAnimation() {
    if (!currentVotingData || currentVotingData.completed) return;
    clearInterval(votingAnimInterval);
    var v = currentVotingData;
    v.currentPro = v.targetPro;
    v.currentKunder = v.targetKunder;
    v.currentAbstenim = v.targetAbstenim;
    v.currentMungese = v.targetMungese;
    v.totalCounted = 120;
    var elPro = document.getElementById("voteCountPro");
    var elKunder = document.getElementById("voteCountKunder");
    var elAbs = document.getElementById("voteCountAbstenim");
    var elMung = document.getElementById("voteCountMungese");
    if (elPro) elPro.textContent = v.currentPro;
    if (elKunder) elKunder.textContent = v.currentKunder;
    if (elAbs) elAbs.textContent = v.currentAbstenim;
    if (elMung) elMung.textContent = v.currentMungese;
    var progTxt = document.getElementById("votingProgressText");
    if (progTxt) progTxt.textContent = "120 / 120";
    var progBar = document.getElementById("votingProgressBar");
    if (progBar) progBar.style.width = "100%";
    persistVotingProgress();
    showVotingResult();
}

function showVotingResult() {
    if (!currentVotingData) return;
    var skipBtn = document.getElementById("votingSkipBtn");
    if (skipBtn) skipBtn.style.display = "none";
    var proceedBtn = document.getElementById("votingProceedBtn");
    if (proceedBtn) proceedBtn.style.display = "inline-block";
    var resEl = document.getElementById("votingModalResult");
    if (resEl) resEl.innerHTML = currentVotingData.finalResultHtml;
    if(state.pendingVote?.governmentNotice && typeof showGovernmentNotification==='function')showGovernmentNotification(state.pendingVote.governmentNotice);
}

function finishVotingProcess() {
    if (!currentVotingData || currentVotingData.completed) return;
    var pending = state.pendingVote;
    if (!pending || !pending.finalized) return;
    currentVotingData.completed = true;
    clearInterval(votingAnimInterval);
    toggleModal("votingModal", false);
    currentVotingData = null;
    state.pendingVote = null;
    _voteInProgress = false;
    if(energyInquiry(state)?.trigger&&energyInquiry(state)?.phase==='WAITING'&&agendaExecutive())governmentCrisisCommit(()=>reconcileEnergyInquiry());
    resumePresidentialFailure();
    if (pending.continuation && pending.continuation.sessionId) {
        // The next vote is committed before the next presentation is opened.
        voteSessionItems(pending.continuation.sessionId, [], 0);
    } else {
        saveGameAuto();
        if (pending.announcement && !pending.governmentNotice) showMajorAnnouncement(pending.announcement);
        if(typeof resumeOppositionElection==='function')resumeOppositionElection();resumeCoalitionBlackmail();
    }
    if(typeof renderOppositionHQ==='function')renderOppositionHQ();
}

function openSessionSchedulerModal() {
    if (!assertAssemblyFunctional("Caktimi i seancës")) return;
    var eligibleBills = state.laws.filter(function(l) { return l.status === "SCHEDULED"; });
    if (eligibleBills.length === 0) {
        showToast("Nuk ka projektligje të gatshme për seancë.");
        return;
    }
    var checkboxes = eligibleBills.map(function(l) {
        var idx = state.laws.indexOf(l);
        return '<label style="font-size:0.76rem; display:flex; align-items:flex-start; gap:6px; background:rgba(255,255,255,0.03); padding:6px 8px; border-radius:6px; cursor:pointer; margin-bottom:4px;">' +
            '<input type="checkbox" class="session-bill-check" value="' + idx + '" checked>' +
            '<span><strong>' + l.title + '</strong><br><span style="color:var(--text-muted); font-size:0.7rem;">Shumica: ' + l.requiredVotes + ' vota • Kosto: €' + (l.costB * 1000).toFixed(0) + 'M</span></span>' +
        '</label>';
    }).join("");

    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">📅 Cakto Seancë të Re Parlamentare</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:10px;">Zgjidhni projektligjet që do të jenë në agjendën e seancës.</p>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">Tema Kryesore:</label>' +
            '<input type="text" id="sessionTopic" value="Seancë Plenare e Kuvendit të Kosovës" style="width:100%;">' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">Projektligjet në Agjendë:</label>' +
            '<div style="max-height:220px; overflow-y:auto;">' + checkboxes + '</div>' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="executeSessionScheduling()">▶ Nis Seancën Parlamentare</button>';
    toggleModal("interactiveActionModal", true);
}

function executeSessionScheduling() {
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed()){showToast('Seancat për ligje të reja pezullohen gjatë fushatës.');return false;}
    if(!assertPoliticalParliament('Veprimi parlamentar'))return false;
    if (state && state.pendingVote) { showToast("Një votim është në zhvillim e sipër!"); return; }
    if (!assertAssemblyFunctional("Mbajtja e seancës")) return;
    var checks = Array.from(document.querySelectorAll(".session-bill-check:checked"));
    if (checks.length === 0) {
        showToast("Zgjidhni të paktën një projektligj për seancën!");
        return;
    }
    var topicEl = document.getElementById("sessionTopic");
    var topic = topicEl ? (topicEl.value.trim() || "Seancë Plenare") : "Seancë Plenare";
    var billIndices = checks.map(function(c) { return parseInt(c.value, 10); });

    state.sessionCounter = (state.sessionCounter || 0) + 1;
    var session = {
        id: "sess_" + Date.now(),
        number: state.sessionCounter,
        topic: topic,
        week: state.turnCount,
        billIds: billIndices.map(function(i) { return state.laws[i].id; }),
        status: "SCHEDULED",
        results: []
    };
    if (!state.parliamentarySessions) state.parliamentarySessions = [];
    state.parliamentarySessions.unshift(session);

    toggleModal("interactiveActionModal", false);
    addMediaNews("Kuvendi i Kosovës", "Kryesia cakton seancën plenare nr. " + state.sessionCounter + " me " + billIndices.length + " pika të rendit të ditës.", "NEUTRAL");
    refreshAllUI();

    voteSessionItems(session.id, billIndices, 0);
}

function voteSessionItems(sessionId, billIndices, currentPos) {
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed())return false;
    if (_voteInProgress || state.pendingVote) return;
    if (!assertAssemblyFunctional("Votimi në seancë")) return;
    var session = (state.parliamentarySessions || []).find(function(item) { return item.id === sessionId; });
    if (!session) return;
    // Resolve the persisted agenda by IDs, never by mutable array positions.
    var remaining = session.billIds.filter(function(id) {
        var law = state.laws.find(function(item) { return item.id === id; });
        return law && !['PASSED','FAILED','ANNULLED','WITHDRAWN'].includes(law.status)&&!session.results?.some(r=>r.billId===id);
    });
    if (!remaining.length) {
        session.status = "COMPLETED";
        state.activeSessionId = null;
        saveGameAuto();
        refreshAllUI();
        showToast("Seanca plenare përfundoi!");
        return;
    }
    state.activeSessionId = sessionId;
    saveGameAuto();
    beginLawVote(state.laws.find(function(law) { return law.id === remaining[0]; }), { sessionId: sessionId });
}

function renderParliamentarySessions() {
    var container = document.getElementById("parliamentSessionsContainer");
    if (!container) return;
    var sessions = state.parliamentarySessions || [];
    if (sessions.length === 0) {
        container.innerHTML = '<div style="padding:14px; background:#0f172a; border-radius:8px; font-size:0.8rem; color:var(--text-muted);">Nuk ka seanca të regjistruara.</div>';
        return;
    }

    container.innerHTML = sessions.map(function(sess) {
        var statusCls = sess.status === "COMPLETED" ? "tag-min" : "tag-gold";
        var statusTxt = sess.status === "COMPLETED" ? "✔ PËRFUNDUAR" : "📅 PLANIFIKUAR";
        var resultsHtml = (sess.results || []).map(function(r) {
            var rCls = r.status === "PASSED" ? "var(--success)" : (r.status === "FAILED" ? "var(--danger)" : "var(--text-muted)");
            return '<div style="font-size:0.75rem; padding:4px 8px; background:rgba(255,255,255,0.04); border-radius:4px; margin-bottom:3px;">' +
                '<strong style="color:' + rCls + ';">' + (r.status === "PASSED" ? "✅" : (r.status === "FAILED" ? "❌" : "📋")) + '</strong> ' + r.title +
                (r.resultText ? ' <span style="color:var(--text-muted);">(' + r.resultText + ')</span>' : '') + '</div>';
        }).join("");

        return '<div class="card" style="background:#0f172a; margin-bottom:8px; border-left:4px solid ' + (sess.status === "COMPLETED" ? 'var(--success)' : 'var(--accent-gold)') + ';">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">' +
                '<div>' +
                    '<strong style="font-size:0.86rem;">🗓️ Seanca nr. ' + sess.number + ' — ' + sess.topic + '</strong>' +
                    '<div style="font-size:0.72rem; color:var(--text-muted);">Java ' + sess.week + ' • ' + sess.billIds.length + ' pika</div>' +
                '</div>' +
                '<span class="tag ' + statusCls + '">' + statusTxt + '</span>' +
            '</div>' +
            (resultsHtml ? '<div style="margin-top:6px;">' + resultsHtml + '</div>' : '') +
            (sess.status!=='COMPLETED'?'<button class="action-btn" onclick="voteSessionItems('+catalogEscape(JSON.stringify(sess.id))+',[],0)">Vazhdo rendin e ditës</button>':'')+
        '</div>';
    }).join("");
}

function openExtraordinarySessionModal() {
    if (!assertAssemblyFunctional("Thirrja e seancës së jashtëzakonshme")) return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var lawsOpts = state.laws.filter(function(l) {
        return l.status === "FAILED" || l.status === "SCHEDULED" || l.status === "UNDER_REVIEW";
    }).map(function(l) {
        var idx = state.laws.indexOf(l);
        return '<option value="' + idx + '">' + l.title + ' (' + getBillStatusLabel(l.status) + ')</option>';
    }).join("");

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">⚡ Thirr Seancë të Jashtëzakonshme</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:10px;">Seanca e jashtëzakonshme mund të thirret nga Qeveria ose 1/3 e deputetëve.</p>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">1. Arsyeja:</label>' +
            '<select id="extraSessReason" style="width:100%;">' +
                '<option value="Rishqyrtimi urgjent i Projektligjeve të Bllokuara">Rishqyrtimi urgjent</option>' +
                '<option value="Rezoluta për Sigurinë Kombëtare">Rezoluta për Sigurinë</option>' +
                '<option value="Ratifikimi i Marrëveshjeve Ndërkombëtare">Ratifikimi i Marrëveshjeve</option>' +
                '<option value="Pakoja Emergjente kundër Inflacionit">Pakoja Emergjente</option>' +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">2. Objekti:</label>' +
            '<select id="extraSessLawIdx" style="width:100%;">' +
                '<option value="-1">Rezolutë Parlamentare e Përbashkët</option>' + lawsOpts +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">3. Argumentimi:</label>' +
            '<input type="text" id="extraSessObjective" value="Interes i lartë shtetëror" style="width:100%;">' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="executeExtraordinarySession()">🏛️ Hap Seancën ▶</button>';
    toggleModal("interactiveActionModal", true);
}

function executeExtraordinarySession() {
    if(typeof legislativeCampaignClosed==='function'&&legislativeCampaignClosed()){showToast('Kuvendi nuk voton ligje të reja gjatë fushatës.');return false;}
    if(!assertPoliticalParliament('Veprimi parlamentar'))return false;
    if (state && state.pendingVote) { showToast("Një votim është në zhvillim e sipër!"); return; }
    if (!assertAssemblyFunctional("Ekzekutimi i seancës së jashtëzakonshme")) return;
    var reasonEl = document.getElementById("extraSessReason");
    var lawIdxEl = document.getElementById("extraSessLawIdx");
    var objEl = document.getElementById("extraSessObjective");
    var reason = reasonEl ? reasonEl.value : "Seancë e jashtëzakonshme";
    var lawIdx = lawIdxEl ? parseInt(lawIdxEl.value, 10) : -1;
    var objText = objEl ? objEl.value.trim() : "";

    toggleModal("interactiveActionModal", false);

    if (lawIdx >= 0 && state.laws[lawIdx]) {
        var law = state.laws[lawIdx];
        if (law.status === "FAILED") {
            return resubmitRejectedBill(lawIdx);
        }
        state.sessionCounter = (state.sessionCounter || 0) + 1;
        if (!state.parliamentarySessions) state.parliamentarySessions = [];
        state.parliamentarySessions.unshift({
            id: "sess_extra_" + Date.now(),
            number: state.sessionCounter,
            topic: reason,
            week: state.turnCount,
            billIds: [law.id],
            status: "SCHEDULED",
            results: []
        });
        voteSessionItems(state.parliamentarySessions[0].id, [lawIdx], 0);
        return;
    }

    adjustPublicSupport((2.2), {source:"executeExtraordinarySession"}, state);
    state.sessionCounter = (state.sessionCounter || 0) + 1;
    if (!state.parliamentarySessions) state.parliamentarySessions = [];
    state.parliamentarySessions.unshift({
        id: "sess_extra_" + Date.now(),
        number: state.sessionCounter,
        topic: reason,
        week: state.turnCount,
        billIds: [],
        status: "COMPLETED",
        results: [{ title: "Rezolutë: " + reason, status: "PASSED", resultText: "U miratua me shumicë" }]
    });
    addMediaNews("Kuvendi Live", "Mbahet Seanca e Jashtëzakonshme për: " + reason + ".", "POSITIVE");
    refreshAllUI();
    showMajorAnnouncement({
        badge: "SEANCË E JASHTËZAKONSHME",
        title: reason,
        reason: "Objektivi: " + objText,
        immediateImpact: "Rezoluta u miratua; vlerësimi publik varet nga hapat që pasojnë."
    });
}

/* ============================================================================
   33. MOCIONET
   ============================================================================ */

function openMotionModal() {
    if(!assertPoliticalParliament('Veprimi parlamentar'))return false;
    if (!assertAssemblyFunctional("Propozimi i mocionit")) return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">⚡ Propozo Mocion</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">1. Lloji:</label>' +
            '<select id="motionType" style="width:100%;">' +
                '<option value="DEBATE">Mocion për Debat Parlamentar</option>' +
                '<option value="INQUIRY">Interpelancë</option>' +
                '<option value="NO_CONFIDENCE">Mocion Mosbesimi ndaj Qeverisë</option>' +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">2. Titulli:</label>' +
            '<input type="text" id="motionTitle" placeholder="p.sh. Mocion për rritjen e pensioneve" style="width:100%;">' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">3. Përshkrimi:</label>' +
            '<textarea id="motionDesc" rows="3" placeholder="Përshkruani arsyen dhe kërkesat..." style="width:100%;"></textarea>' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="proposeMotion()">⚡ Regjistro Mocionin</button>';
    toggleModal("interactiveActionModal", true);
}

function proposeMotion() {
    if(!assertPoliticalParliament('Veprimi parlamentar'))return false;
    if (!assertAssemblyFunctional("Propozimi i mocionit")) return;
    var typeEl = document.getElementById("motionType");
    var titleEl = document.getElementById("motionTitle");
    var descEl = document.getElementById("motionDesc");
    var type = typeEl ? typeEl.value : "DEBATE";
    var title = titleEl ? (titleEl.value || "").trim() : "";
    var desc = descEl ? (descEl.value || "").trim() : "";

    if (!title || title.length < 5) {
        showToast("Titulli i mocionit duhet të jetë të paktën 5 karaktere!");
        return;
    }

    var dup = state.motions.find(function(m) {
        return m.status === "PENDING" && m.title.toLowerCase() === title.toLowerCase();
    });
    if (dup) {
        showToast("Ekziston tashmë një mocion me këtë titull!");
        return;
    }

    state.motionCounter = (state.motionCounter || 0) + 1;
    var motion = {
        id: "mot_" + Date.now(),
        number: state.motionCounter,
        type: type,
        title: title,
        desc: desc,
        proposer: state.parties[state.playerParty].short,
        week: state.turnCount,
        status: "PENDING",
        result: null
    };
    if (!state.motions) state.motions = [];
    state.motions.unshift(motion);

    toggleModal("interactiveActionModal", false);

    if (type === "NO_CONFIDENCE") {
        voteNoConfidenceMotion(motion.id);
    } else if (type === "DEBATE" || type === "INQUIRY") {
        adjustPublicSupport((1.0), {source:"proposeMotion"}, state);
        if (!state.coalitionParties.includes(state.playerParty)) {
            state.parties[state.playerParty].poll = clamp(state.parties[state.playerParty].poll + 0.5, 2, 85);
        }
        motion.status = "DEBATED";
        motion.result = "Debati u zhvillua në Kuvend. Qeveria u thirr për llogaridhënie.";
        addMediaNews("Kuvendi Live", "Mocioni \"" + title + "\" u debatua në seancë plenare.", "NEUTRAL");
        refreshAllUI();
        showToast("Mocioni u debatua në Kuvend!");
    }
}

function renderMotions() {
    var container = document.getElementById("motionsContainer");
    if (!container) return;
    var motions = state.motions || [];
    if (motions.length === 0) {
        container.innerHTML = '<div style="padding:14px; background:#0f172a; border-radius:8px; font-size:0.8rem; color:var(--text-muted);">Nuk ka mocione të regjistruara.</div>';
        return;
    }
    container.innerHTML = motions.map(function(m) {
        var typeLabel = m.energyInquiry ? 'Komision Hetimor' : m.type === "NO_CONFIDENCE" ? "Mocion Mosbesimi" : (m.type === "INQUIRY" ? "Interpelancë" : "Mocion Debat");
        var statusCls = m.status === "PASSED" ? "tag-lvv" : (m.status === "FAILED" ? "tag-min" : (m.status === "DEBATED" ? "tag-gold" : "tag-pdk"));
        var statusTxt = m.status === "PASSED" ? "✔ MIRATUAR" : (m.status === "FAILED" ? "✕ RRËZUAR" : (m.status === "DEBATED" ? "💬 DEBATUAR" : "⏳ NË PRITJE"));
        return '<div class="card" style="background:#0f172a; margin-bottom:8px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:6px;">' +
                '<div>' +
                    '<span class="tag tag-gold" style="margin-right:6px;">' + typeLabel + '</span>' +
                    '<strong style="font-size:0.86rem;">' + m.title + '</strong>' +
                    '<div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Propozues: ' + m.proposer + ' • Java ' + m.week + '</div>' +
                '</div>' +
                '<span class="tag ' + statusCls + '">' + statusTxt + '</span>' +
            '</div>' +
            '<p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:6px;">' + (m.desc || "—") + '</p>' +
            (m.result ? '<div style="font-size:0.74rem; color:var(--accent-gold); padding:6px 8px; background:rgba(245,158,11,0.08); border-radius:6px;"><strong>Rezultati:</strong> ' + m.result + '</div>' : '') +
        '</div>';
    }).join("");
}

/* VAZHDON në pjesën 6 */
/* ============================================================================
   34. PRESIDENTI
   ============================================================================ */

function renderPresidentialSection() { return renderPresidencyPanel(); }

function changePresidentialCandidate(id) { return selectPresidentialCandidate(id); }

function addCustomPresidentialCandidate() { return nominateExistingPresidentialMP(document.getElementById('presidentialMP')?.value); }

function openNewPresidentialProcedure() { return beginPresidentialProcedure(); }

/* ============================================================================
   35. QEVERIA
   ============================================================================ */

function renderGovernmentSection() {
    var cabinetCatalogue=getCandidateCatalogue(state);
    var ministriesGrid = document.getElementById("ministriesGrid");
    if (ministriesGrid) {
        ministriesGrid.innerHTML = state.ministries.map(function(m, idx) {
            var p = state.parties[m.party] || { tagClass: 'tag-sl', short: 'Bosh' };
            return '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
                '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px; margin-bottom:6px;">' +
                    '<strong style="font-size:0.83rem;">' + m.name + '</strong>' +
                    '<span class="tag ' + p.tagClass + '">' + p.short + '</span>' +
                '</div>' +
                '<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">' +
                    '• Ministër/e: <strong style="color:#fff;">' + m.minister + '</strong><br>' +
                    '• Kompetenca: <strong>' + m.competence + '/100</strong> • Besnikëria: <strong>' + m.loyalty + '%</strong><br>' +
                    '• Dosja: <span style="color:var(--accent-gold);">' + (m.currentIssue || "Zbatimi i planit") + '</span>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
                    '<span style="font-size:0.73rem;">Buxheti: <strong>€' + m.budget + 'M</strong></span>' +
                    '<input type="range" min="30" max="950" step="5" value="' + m.budget + '" style="flex:1;" onchange="adjustMinistryBudget(' + idx + ', this.value)">' +
                '</div>' +
                '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
                    '<button class="action-btn btn-gold" onclick="openMinisterOneOnOneModal(' + idx + ')">🤝 Thirr Ministrin</button>' +
                    cabinetReplacementMarkup(m,idx,cabinetCatalogue) +
                '</div>' +
            '</div>';
        }).join("");
    }

    renderStateSectorsGrid();

    var cabAgenda = document.getElementById("cabinetAgendaContainer");
    if (cabAgenda) {
        cabAgenda.innerHTML = state.cabinetAgenda.map(function(item, idx) {
            var costM = (item.costB * 1000).toFixed(0);
            return '<div class="card" style="background:#0f172a; margin-bottom:10px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">' +
                    '<div>' +
                        '<div style="font-size:0.88rem; font-weight:700;">Pika #' + (idx + 1) + ': ' + item.title + '</div>' +
                        '<div style="font-size:0.74rem; color:var(--accent-gold);">Propozues: ' + (item.ministerName || item.ministry) + ' • Kosto: €' + costM + 'M</div>' +
                    '</div>' +
                    (!item.done ? '<button class="action-btn btn-gold" onclick="openCabinetDebateModal(' + idx + ')">🗂️ Hap Diskutimin ▶</button>' : '<span class="tag tag-min">✔ Miratuar</span>') +
                '</div>' +
                '<div style="font-size:0.77rem; color:var(--text-muted);">' + item.note + '</div>' +
            '</div>';
        }).join("");
    }

    var macro = document.getElementById("macroEconomyContainer");
    if (macro) {
        macro.innerHTML =
            '<div class="card">' +
                '<div class="card-header"><div class="card-title">💶 Bilanci Makroekonomik</div></div>' +
                '<div class="grid-3" style="margin-bottom:14px;">' +
                    '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
                        '<span class="stat-label">Mjetet e lira</span>' +
                        '<div style="font-size:1.1rem; font-weight:800; color:var(--accent-gold);">€' + state.budgetTotalB.toFixed(2) + ' Mld</div>' +
                        '<small style="color:var(--text-muted);">ATK & Dogana: €' + state.taxRevenueB.toFixed(2) + ' Mld</small>' +
                    '</div>' +
                    '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
                        '<span class="stat-label">BPV & Inflacioni</span>' +
                        '<div style="font-size:1.1rem; font-weight:800; color:' + (state.gdpGrowth>=0?'var(--success)':'var(--danger)') + ';">' + (state.gdpGrowth>=0?'+':'') + state.gdpGrowth + '% | ' + state.inflation + '%</div>' +
                        '<small style="color:var(--text-muted);">Papunësia: ' + state.unemployment + '%</small>' +
                    '</div>' +
                    '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
                        '<span class="stat-label">Remitancat & Borxhi</span>' +
                        '<div style="font-size:1.1rem; font-weight:800; color:var(--ldk);">€' + state.remittancesB + ' Mld</div>' +
                        '<small style="color:var(--text-muted);">Borxhi: ' + state.publicDebtPct + '%</small>' +
                    '</div>' +
                '</div>' +
                '<div class="grid-2">' +
                    '<button class="choice-btn" onclick="applyFiscalPolicy(\'DIGITAL_ATK\')">' +
                        '<span class="choice-title">Digjitalizo ATK-në dhe Doganat</span>' +
                        '<span class="choice-impact">Kosto €10M · 4 javë zbatim · rritje e pritshme e inkasimit vjetor deri €120M</span>' +
                    '</button>' +
                    '<button class="choice-btn" onclick="applyFiscalPolicy(\'LOWER_VAT_FOOD\')">' +
                        '<span class="choice-title">Ul TVSH-në në 8% për Ushqimin</span>' +
                        '<span class="choice-impact">Masa synon lehtësimin e presionit të çmimeve; familjet presin efektin në shpenzime</span>' +
                    '</button>' +
                '</div>' +
            '</div>';
    }
}

function openMinisterOneOnOneModal(minIdx) {
    if (!assertGovernmentAuthority("Takimi me ministrin")) return;
    openMinisterChat(minIdx);
}

function openMinisterChat(minIdx) {
    if (!assertGovernmentAuthority("Takimi me ministrin")) return false;
    var m = state.ministries[minIdx];
    if (!m) return;
    var chatKey = "minister_" + minIdx;
    if (!state.chatHistories) state.chatHistories = {};
    if (!state.chatHistories[chatKey]) state.chatHistories[chatKey] = [];

    var box = document.getElementById("chatModalContent");
    if (!box) return;
    var chatHtml = state.chatHistories[chatKey].map(function(msg) {
        var cls = msg.from === "player" ? "chat-you" : "chat-them";
        return '<div class="chat-bubble ' + cls + '">' + (msg.from === "player" ? "" : "<strong>" + m.minister + ":</strong> ") + msg.text + '</div>';
    }).join("");

    if (state.chatHistories[chatKey].length === 0) {
        chatHtml = '<div class="chat-bubble chat-them"><strong>' + m.minister + ':</strong> "Përshëndetje. Si mund t\'ju ndihmoj në lidhje me ' + m.name + '? Dosja aktuale: \'' + m.currentIssue + '\'."</div>';
        state.chatHistories[chatKey].push({ from: "minister", text: "Përshëndetje. Si mund t'ju ndihmoj në lidhje me " + m.name + "? Dosja aktuale: '" + m.currentIssue + "'." });
    }

    box.innerHTML =
        '<div class="chat-modal-header">' +
            '<div class="chat-modal-avatar">👔</div>' +
            '<div class="chat-modal-info">' +
                '<div class="chat-modal-name">' + m.minister + '</div>' +
                '<div class="chat-modal-role">' + m.name + '</div>' +
            '</div>' +
            '<button class="chat-modal-close" onclick="toggleModal(\'chatModal\', false)">✕</button>' +
        '</div>' +
        '<div class="chat-modal-body" id="chatModalBody">' + chatHtml + '</div>' +
        '<div class="chat-modal-input-area">' +
            '<input type="text" id="chatInputField" class="chat-input" placeholder="Shkruani mesazhin..." onkeypress="if(event.key===\'Enter\') submitMinisterChat(' + minIdx + ')">' +
            '<button class="chat-send-btn" onclick="submitMinisterChat(' + minIdx + ')">▶</button>' +
        '</div>' +
        '<div style="margin-top:8px; display:flex; flex-direction:column; gap:5px;">' +
            '<button class="choice-btn" onclick="ministerChatQuick(' + minIdx + ', \'REPORT\')">' +
                '<span class="choice-title">📊 Kërko Raport mbi Dosjen Aktuale</span>' +
                '<span class="choice-impact">Merr përditësim</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="ministerChatQuick(' + minIdx + ', \'BUDGET\')">' +
                '<span class="choice-title">💰 Diskuto Buxhetin</span>' +
                '<span class="choice-impact">Aktual: €' + m.budget + 'M</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="ministerChatQuick(' + minIdx + ', \'DECISION\')">' +
                '<span class="choice-title">⚖️ Kërko Vendim Ekzekutiv</span>' +
                '<span class="choice-impact">Hap mundësinë për vendim</span>' +
            '</button>' +
        '</div>';
    decoratePoliticalScene("chatModalContent","MINISTER",{name:m.minister,role:m.name,topic:m.currentIssue,detail:"Buxheti: \u20ac"+m.budget+"M \u00b7 Kompetenca: "+m.competence+"/100"});
    saveGameAuto();
    toggleModal("chatModal", true);
    setTimeout(function() {
        var body = document.getElementById("chatModalBody");
        if (body) body.scrollTop = body.scrollHeight;
    }, 50);
}

function submitMinisterChat(minIdx) {
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    var m = state.ministries[minIdx];
    var input = document.getElementById("chatInputField");
    if (!input || !m) return;
    var text = input.value.trim();
    if (!text) return;
    var chatKey = "minister_" + minIdx;
    state.chatHistories[chatKey].push({ from: "player", text: text });

    var reply = "";
    var lower = text.toLowerCase();
    if (lower.indexOf("buxhet") !== -1) {
        reply = "Buxheti aktual i " + m.name + " është €" + m.budget + "M. Prioriteti: " + m.currentIssue + ".";
    } else if (lower.indexOf("raport") !== -1 || lower.indexOf("gjendje") !== -1) {
        reply = "Raport: Kompetenca " + m.competence + "/100, Besnikëria " + m.loyalty + "%. Rreziku: " + m.risk + "/100. Dosja: " + m.currentIssue + ".";
    } else if (lower.indexOf("vendim") !== -1 || lower.indexOf("aprovoj") !== -1) {
        reply = "Klikoni 'Kërko Vendim Ekzekutiv' për detaje.";
    } else if (lower.indexOf("përshëndetje") !== -1 || lower.indexOf("faleminderit") !== -1) {
        reply = "Gjithmonë në dispozicion, Kryeministër.";
    } else {
        reply = "E marr shënim për \"" + text.substring(0, 50) + (text.length > 50 ? "..." : "") + "\". Prioriteti: " + m.currentIssue + ".";
    }

    state.chatHistories[chatKey].push({ from: "minister", text: reply });
    input.value = "";
    openMinisterChat(minIdx);
}

function ministerChatQuick(minIdx, code) {
    var m = state.ministries[minIdx];
    if (!m) return;
    if (code === "REPORT") {
        var reply = "Raport: Kompetenca " + m.competence + "/100. Besnikëria " + m.loyalty + "%. Dosja: " + m.currentIssue + ".";
        if (!state.chatHistories["minister_" + minIdx]) state.chatHistories["minister_" + minIdx] = [];
        state.chatHistories["minister_" + minIdx].push({ from: "minister", text: reply });
        openMinisterChat(minIdx);
    } else if (code === "BUDGET") {
        toggleModal("chatModal", false);
        openBudgetAllocationModal();
    } else if (code === "DECISION") {
        toggleModal("chatModal", false);
        var box = document.getElementById("interactiveActionModalContent");
        if (!box) return;
        box.innerHTML =
            '<div class="card-header">' +
                '<div class="card-title">💼 Takim me ' + m.minister + '</div>' +
                '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
            '</div>' +
            '<div class="chat-bubble chat-them"><strong>' + m.minister + ':</strong> "Sfida kryesore: ' + (m.currentIssue || "investimet kapitale") + '. Kemi tri opsione."</div>' +
            '<div style="display:flex; flex-direction:column; gap:7px; margin-top:10px;">' +
                '<button class="choice-btn" onclick="resolveMinisterMeeting(' + minIdx + ', \'EXTRA_BUDGET\')">' +
                    '<span class="choice-title">1. Aprovo €15M buxhet shtesë</span>' +
                    '<span class="choice-impact">Trajnimi përmirëson kapacitetet e ministrisë; publiku pret rezultate. Kosto: €15M.</span>' +
                '</button>' +
                '<button class="choice-btn" onclick="resolveMinisterMeeting(' + minIdx + ', \'REPLACE_CONTRACTOR\')">' +
                    '<span class="choice-title">2. Auditim dhe zëvendësim operatorësh</span>' +
                    '<span class="choice-impact">-8% Rrezik, +4 Kompetencë</span>' +
                '</button>' +
                '<button class="choice-btn" onclick="resolveMinisterMeeting(' + minIdx + ', \'SEND_TO_CABINET\')">' +
                    '<span class="choice-title">3. Shtyje për Mbledhjen e Qeverisë</span>' +
                    '<span class="choice-impact">Vendim kolektiv</span>' +
                '</button>' +
            '</div>';
        decoratePoliticalScene("interactiveActionModalContent","MINISTER",{name:m.minister,role:m.name,topic:m.currentIssue,detail:"Vendim ekzekutiv; kontrolloni kostot dhe alternativat."});
        toggleModal("interactiveActionModal", true);
    }
}

function resolveMinisterMeeting(minIdx, choice) {
    if (!assertGovernmentAuthority("Takimi me ministrin")) return;
    var m = state.ministries[minIdx];
    if(!m || !["EXTRA_BUDGET","REPLACE_CONTRACTOR","SEND_TO_CABINET"].includes(choice))return false;
    var sceneKey="minister:"+m.id+":"+state.turnCount,previousScene=state.meetingScenes["visual:"+sceneKey];
    if(previousScene && previousScene.status==="COMPLETED"){showToast("Vendimi i takimit p\u00ebr k\u00ebt\u00eb jav\u00eb \u00ebsht\u00eb regjistruar.");return false;}
    if(choice==="EXTRA_BUDGET" && state.budgetTotalB<0.015){showToast("Nuk ka fonde t\u00eb mjaftueshme.");return false;}
    toggleModal("interactiveActionModal", false);
    if (choice === "EXTRA_BUDGET") {
        m.budget += 15;
        fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB - 0.015).toFixed(9),"resolveMinisterMeeting");
        m.competence = clamp(m.competence + 6, 40, 100);
        m.loyalty = clamp(m.loyalty + 6, 40, 100);
        adjustPublicSupport((1.8), {source:"resolveMinisterMeeting"}, state);
        addMediaNews("Kryeministria", "Kryeministri zhvilloi takim me " + m.minister + "; miratohen mjete shtesë.", "POSITIVE");
    } else if (choice === "REPLACE_CONTRACTOR") {
        m.risk = Math.max(2, m.risk - 8);
        m.competence = clamp(m.competence + 4, 40, 100);
        addMediaNews("Kallxo.com", "Auditim dhe masa të reja menaxheriale në " + m.name + ".", "POSITIVE");
    } else {
        state.cabinetAgenda.push({
            id: "cab_dyn_" + Date.now(),
            title: "Propozim-Vendim nga " + m.name + ": " + m.currentIssue,
            ministry: m.name,
            ministerName: m.minister,
            costB: 0.015,
            approvalGain: 2.2,
            done: false,
            note: "E përcjellë nga takimi dypalësh."
        });
    }
    politicalSceneJournal(sceneKey,"MINISTER",m.minister+": "+({EXTRA_BUDGET:"U miratuan \u20ac15M.",REPLACE_CONTRACTOR:"U urdh\u00ebrua auditim.",SEND_TO_CABINET:"Dosja iu d\u00ebrgua kabinetit."}[choice]),"COMPLETED");
    refreshAllUI();
    showToast("Takimi me " + m.minister + " përfundoi me detyra konkrete!");
}

function openInternalGovMeetingModal(mode) {
    if (!assertGovernmentAuthority("Mbledhja e brendshme")) return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var isDep = mode === "DEPUTY_PMS";
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">' + (isDep ? "🤝 Takim me Zëvendëskryeministrat" : "⚡ Mbledhje Ndërministrore") + '</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div class="chat-bubble chat-them"><strong>' + (isDep ? "Zëvendëskryeministrat" : "Koordinatori") + ':</strong> "Ku ta përqendrojmë fokusin?"</div>' +
        '<div style="display:flex; flex-direction:column; gap:7px; margin-top:10px;">' +
            '<button class="choice-btn" onclick="resolveInternalGroupMeeting(\'EXECUTION_SPEED\')">' +
                '<span class="choice-title">1. Përshpejtim i projekteve</span>' +
                '<span class="choice-impact">Punimet përparojnë; ndikimi në shërbime vlerësohet gjatë zbatimit</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="resolveInternalGroupMeeting(\'COALITION_HARMONY\')">' +
                '<span class="choice-title">2. Koordinim me partitë</span>' +
                '<span class="choice-impact">+6 Disiplinë, +6 raport</span>' +
            '</button>' +
        '</div>';
    decoratePoliticalScene("interactiveActionModalContent","CABINET",{name:isDep?"Z\u00ebvend\u00ebskryeministrat":"Kabineti qeveritar",role:"Koordinim qeveritar",topic:"Prioritetet e p\u00ebrbashk\u00ebta",detail:"Zgjidhni nj\u00eb udh\u00ebzim konkret p\u00ebr institucionet."});
    toggleModal("interactiveActionModal", true);
}

function resolveInternalGroupMeeting(code) {
    if (!assertGovernmentAuthority("Mbledhja e brendshme")) return;
    if(!["EXECUTION_SPEED","COALITION_HARMONY"].includes(code))return false;
    var key="internal:"+state.turnCount+":"+code;if(state.meetingScenes["visual:"+key])return false;
    toggleModal("interactiveActionModal", false);
    if (code === "EXECUTION_SPEED") {
        (state.stateSectors || []).forEach(function(s) {
            if (s.active && s.weeksLeft > 0) s.weeksLeft = Math.max(1, s.weeksLeft - 1);
        });
        adjustPublicSupport((1.5), {source:"resolveInternalGroupMeeting"}, state);
    } else {
        state.parties[state.playerParty].partyDiscipline = clamp(state.parties[state.playerParty].partyDiscipline + 6, 40, 100);
        state.parties[state.playerParty].relations.MIN_MULTI = clamp((state.parties[state.playerParty].relations.MIN_MULTI || 75) + 6, 0, 100);
    }
    politicalSceneJournal(key,"CABINET",code==="EXECUTION_SPEED"?"U vendos p\u00ebrshpejtimi i projekteve ekzistuese.":"U vendos koordinimi me partit\u00eb.","COMPLETED");
    refreshAllUI();
    showToast("Udhëzimet u dërguan për zbatim!");
}

function renderStateSectorsGrid() {
    var container = document.getElementById("stateSectorsGrid");
    if (!container) return;
    var sectors = state.stateSectors || [];
    container.innerHTML = sectors.map(function(sec, idx) {
        var progPct = sec.active ? Math.round(((sec.weeksTotal - sec.weeksLeft) / sec.weeksTotal) * 100) : 0;
        return '<div class="card" style="background:#0f172a; margin-bottom:0; border-color:' + (sec.active ? 'var(--accent-gold)' : 'var(--border-glass)') + ';">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
                '<strong style="font-size:0.83rem;">' + sec.name + '</strong>' +
                '<span class="tag ' + (sec.score >= 75 ? 'tag-min' : 'tag-pdk') + '">' + sec.score + '/100</span>' +
            '</div>' +
            '<div style="font-size:0.73rem; color:var(--text-muted); margin-bottom:6px; line-height:1.45;">' +
                '• ' + sec.ministry + '<br>• ' + sec.problem + economicInvestmentHint(sec.id,12) +
            '</div>' +
            '<div class="prog-row" style="margin-bottom:8px;">' +
                '<div class="prog-label"><span>Gjendja</span><span>' + sec.score + '%</span></div>' +
                '<div class="prog-track"><div class="prog-fill" style="width:' + sec.score + '%; background:var(--success);"></div></div>' +
            '</div>' +
            (sec.active
                ? '<div style="background:rgba(245,158,11,0.12); padding:6px 8px; border-radius:6px; font-size:0.73rem;">🏗️ ' + sec.projectTitle + ' (' + sec.weeksLeft + ' javë • ' + progPct + '%)</div>'
                : sec.effectsApplied || Number.isInteger(sec.completedTurn) ? '<p>Reforma u përfundua; pasojat janë regjistruar.</p>' : '<button class="action-btn" style="width:100%; justify-content:center;" onclick="launchStateSectorProject(' + idx + ')">🚀 Nis: ' + sec.projectTitle + ' (-€' + sec.costM + 'M)</button>') +
        (typeof sectorManagementSummaryMarkup==='function'?sectorManagementSummaryMarkup(sec.id):'')+'<button class="btn-top" style="margin-top:8px" data-sector-laws="'+sec.id+'" onclick="openSectorLaws(\''+sec.id+'\')">Ligjet dhe projektligjet ('+LAW_CATALOG.filter(function(l){return l.sectorId===sec.id && l.recordKind!=='HISTORICAL';}).length+')</button></div>';
    }).join("");
}

function launchStateSectorProject(secIdx) {
    if (!assertGovernmentAuthority("Nisja e reformës sektoriale")) return;
    var sec = state.stateSectors[secIdx];
    if (!sec || sec.active || sec.effectsApplied || Number.isInteger(sec.completedTurn)) return false;
    try{validateCurrentIndicators(state,true);}catch(error){showToast(error.message);return false;}
    var authorization=fiscalSpendingCheck(sec.costM/1000,true);if(!authorization.allowed){showToast(authorization.message);return false;}
    if (sec.competence.includes("KUVENDI") && getCoalitionSeats() < 61) {
        showToast("Ky sektor kërkon 61+ vota në Kuvend!");
        return;
    }
    var check = checkFinancialConstraint(sec.costM / 1000, "projektin \"" + sec.projectTitle + "\"");
    if (!check.allowed) {
        showToast("❌ " + check.message);
        return;
    }
    var beforeSector=JSON.stringify(state);
    try {
    if (check.useReserve) {
        fiscalSetBalance(state,"fiscalReserve",+(state.fiscalReserve - check.shortfall).toFixed(9),"launchStateSectorProject");
    }
    fiscalSetBalance(state,"budgetTotalB",+(Math.max(0, state.budgetTotalB - (sec.costM / 1000))).toFixed(9),"launchStateSectorProject");
    sec.active = true;
    sec.weeksLeft = sec.weeksTotal;
    sec.startedTurn=state.turnCount;
    addMediaNews("Ekonomia Online", "Nis projekti \"" + sec.projectTitle + "\" (€" + sec.costM + "M).", "POSITIVE");
    if(!saveGameAuto())throw Error('Ruajtja e reformës dështoi.');
    } catch(error) {
        state=JSON.parse(beforeSector);
        showToast('Reforma nuk u ruajt; financimi u kthye në gjendjen e mëparshme.');
        return false;
    }
    refreshAllUI();
    showToast("Projekti nisi zbatimin!");
}

function openCabinetDebateModal(idx) {
    if (!assertGovernmentAuthority("Mbledhja e kabinetit")) return;
    var item = state.cabinetAgenda[idx];
    if (!item || item.done) return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var fullM = (item.costB * 1000).toFixed(0);
    var modM = (item.costB * 700).toFixed(0);
    var modGain = (item.approvalGain * 0.7).toFixed(1);

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🗂️ Mbledhja e Qeverisë — Pika #' + (idx + 1) + '</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<h3 style="font-size:0.96rem; margin-bottom:10px; color:var(--accent-gold);">' + item.title + '</h3>' +
        '<div class="chat-bubble chat-them"><strong>🗣️ ' + (item.ministerName || item.ministry) + ':</strong><br>"' + (item.ministerArgument || item.note) + ' Kërkojmë €' + fullM + 'M."</div>' +
        '<div class="chat-bubble chat-them" style="border-left-color:var(--warning);"><strong>⚖️ Financat:</strong><br>"' + (item.financeObjection || "Disiplinë buxhetore.") + '"</div>' +
        '<div style="margin-top:12px; display:flex; flex-direction:column; gap:7px;">' +
            '<button class="choice-btn" onclick="resolveCabinetDecision(' + idx + ', \'FULL_APPROVE\')">' +
                '<span class="choice-title">1. Mirato plotësisht (-€' + fullM + 'M)</span>' +
                '<span class="choice-impact">Miratimi hap rrugën për veprim; publiku pret rezultatet e zbatimit.</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="resolveCabinetDecision(' + idx + ', \'MODIFIED_BUDGET\')">' +
                '<span class="choice-title">2. Mirato me rishikim (-€' + modM + 'M)</span>' +
                '<span class="choice-impact">Kompromisi ul koston, por mund të kufizojë shtrirjen e masës.</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="resolveCabinetDecision(' + idx + ', \'POSTPONE\')">' +
                '<span class="choice-title">3. Shtyj</span>' +
                '<span class="choice-impact">Pa shpenzim</span>' +
            '</button>' +
        '</div>';
    decoratePoliticalScene("interactiveActionModalContent","CABINET",{name:item.ministerName || item.ministry,role:item.ministry,topic:item.title,detail:item.financeObjection || item.note});
    toggleModal("interactiveActionModal", true);
}

function resolveCabinetDecision(idx, mode) {
    if (!assertGovernmentAuthority("Vendimi në kabinet")) return;
    var item = state.cabinetAgenda[idx];
    var agendaRequest=item && item.agendaRequestId && state.pmInboxRequests.find(function(r){return r.id===item.agendaRequestId;});
    if(item && item.agendaRequestId && (!agendaExecutive() || !agendaRequest || !agendaActive(agendaRequest) || agendaRequest.dueTurn<state.turnCount || item.availableTurn>state.turnCount)){showToast('Dosja duhet të jetë aktive dhe mbledhja të arrijë javën e planifikuar.');return false;}
    var beforeAgendaCabinet=agendaRequest?JSON.stringify(state):null;
    if (!item || item.done || !["FULL_APPROVE","MODIFIED_BUDGET","POSTPONE"].includes(mode)) return false;
    toggleModal("interactiveActionModal", false);
    if (mode === "POSTPONE") { politicalSceneJournal("cabinet:"+item.id,"CABINET","Pika u shty pa shpenzim.","DEFERRED");saveGameAuto(); showToast("Pika u shty!"); return; }

    var actualCost = mode === "MODIFIED_BUDGET" ? +(item.costB * 0.7).toFixed(3) : item.costB;
    var check = checkFinancialConstraint(actualCost, "\"" + item.title + "\"");
    if (!check.allowed) {
        showToast("❌ " + check.message);
        return;
    }
    if (check.useReserve) {
        fiscalSetBalance(state,"fiscalReserve",+(state.fiscalReserve - check.shortfall).toFixed(9),"resolveCabinetDecision");
        showToast("ℹ️ Përdorur rezerva: €" + (check.shortfall * 1000).toFixed(0) + "M.");
    }
    politicalSceneJournal("cabinet:"+item.id,"CABINET",item.title+": "+(mode==="MODIFIED_BUDGET"?"Miratim me rishikim.":"Miratim i plot\u00eb."),"COMPLETED");
    item.done = true;
    var actualGain = mode === "MODIFIED_BUDGET" ? +(item.approvalGain * 0.7).toFixed(1) : item.approvalGain;
    fiscalSetBalance(state,"budgetTotalB",+(Math.max(0, state.budgetTotalB - actualCost)).toFixed(9),"resolveCabinetDecision");
    adjustPublicSupport((actualGain), {source:"resolveCabinetDecision"}, state);
    if(agendaRequest){agendaRequest.status='COMPLETED';agendaRequest.completedTurn=state.turnCount;agendaRequest.outcomeMsg='Propozimi u miratua në mbledhjen e Qeverisë.';}
    if(agendaRequest && !saveGameAuto()){state=JSON.parse(beforeAgendaCabinet);return false;}
    addMediaNews("Kryeministria", "Procesverbali: Miratohet \"" + item.title + "\".", "POSITIVE");
    refreshAllUI();
    showMajorAnnouncement({
        badge: "VENDIM I MBLEDHJES",
        title: item.title,
        reason: "Vendim i miratuar në kabinet.",
        immediateImpact: "Buxheti: €" + (actualCost * 1000).toFixed(0) + "M. Propozimi u miratua; ndikimi publik varet nga rezultatet."
    });
}

function adjustMinistryBudget(idx,value) { return fiscalAdjustMinistry(idx,value); }

function reshuffleMinister(idx, mode) {
    if(state.pendingVote){showToast("Përfundoni votimin para ndryshimit të ministrit.");return false;}
    if (!assertGovernmentAuthority("Rikandidimi ministerial")) return;
    var m = state.ministries[idx];
    if (!m) return;
    if(m.party!==state.playerParty){showToast('Partneri i koalicionit propozon ministrin e vet.');return false;}
    if(governmentCrisisPending())return false;
    var beforeReshuffle=JSON.stringify(state);
    var prevParty = m.party;
    m.ministerCandidateId=null;
    if (prevParty !== state.playerParty && state.coalitionParties.includes(prevParty)) {
        state.parties[state.playerParty].relations[prevParty] = clamp((state.parties[state.playerParty].relations[prevParty] || 60) - 20, 0, 100);
        addMediaNews("Gazeta Express", "Tension pas shkarkimit të ministrit të " + state.parties[prevParty].short + "!", "CRITICAL");
    }
    if (mode === "EXPERT") {
        m.minister = "Dr. Ekspert Jopartiak · "+m.id; m.competence = 92; m.risk = 6;
        adjustPublicSupport((1.5), {source:"reshuffleMinister"}, state);
    } else {
        var myP = state.parties[state.playerParty];
        var randomCand = cabinetReplacementCandidates(state.playerParty,m.id)[0];
        if(!randomCand){state=JSON.parse(beforeReshuffle);showToast('Nuk ka kandidat të lirë për këtë ministri.');return false;}
        m.minister = randomCand.name;
        m.party = state.playerParty; m.competence = 85;
    }
    syncDeputyGovernment();
    try{validateLoadedState(state);}catch(error){state=JSON.parse(beforeReshuffle);showToast("Emërimi nuk u krye: "+error.message);return false;}
    if(!saveGameAuto()){state=JSON.parse(beforeReshuffle);return false;}
    refreshAllUI();
    showToast("U emërua " + m.minister + " në krye të " + m.name + "!");
}

function applyFiscalPolicy(code) { return fiscalPreview(code); }

/* ============================================================================
   36. BUXHETI DHE EKONOMIA (FAZA 8 + RREGULLIM)
   ============================================================================ */

function calculateBudgetBalance() { return fiscalRound((state.realizedRevenues ?? 0)-(state.realizedExpenses ?? 0)); }

function getDeficitRatio() { var revenue=state.realizedRevenues ?? 0; return revenue>0 ? Math.abs(Math.min(0,calculateBudgetBalance()))/revenue*100 : 0; }

function calculatePlannedMinistriesBudget() {
    var mTotal = (state.ministries || []).reduce(function(acc, m) { return acc + (m.budget || 0); }, 0);
    return +(mTotal / 1000).toFixed(3);
}

function calculateExpectedRevenues() {
    return fiscalExpectedRevenues();
}

function processWeeklyFiscalReport(turn) { return processFiscalWeek(turn); }

function renderFiscalPanel() { return renderPublicFinance(); }

function openBudgetAllocationModal() { return fiscalAllocationForm(); }

function updateBudgetRemaining() { return fiscalAllocationPreview(); }

function confirmBudgetAllocation() { return fiscalConfirmAllocations(); }

function openBorrowingModal() {
    if (!assertGovernmentAuthority("Huamarrja dhe menaxhimi i borxhit")) return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var currentDebtB = +((state.publicDebtPct / 100) * 10).toFixed(2);

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🏦 Huamarrje & Menaxhim i Borxhit</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:12px; font-size:0.8rem; line-height:1.6;">' +
            '<div>• <strong>Borxhi aktual:</strong> ' + state.publicDebtPct.toFixed(1) + '% (~€' + currentDebtB.toFixed(2) + ' Mld)</div>' +
            '<div>• <strong>Norma e interesit:</strong> ' + state.debtInterestRate.toFixed(1) + '% vjetore</div>' +
            '<div>• <strong>Deficiti aktual:</strong> €' + Math.abs(Math.min(0, calculateBudgetBalance())).toFixed(2) + ' Mld</div>' +
            '<div>• <strong>Rezerva:</strong> €' + (state.fiscalReserve || 0).toFixed(2) + ' Mld</div>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">Shuma e huasë:</label>' +
            '<select id="borrowAmountSelect" style="width:100%;">' +
                '<option value="0.1">€100 Milionë</option>' +
                '<option value="0.2">€200 Milionë</option>' +
                '<option value="0.3">€300 Milionë</option>' +
                '<option value="0.5">€500 Milionë</option>' +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">Qëllimi:</label>' +
            '<select id="borrowPurposeSelect" style="width:100%;">' +
                '<option value="INFRASTRUCTURE">Investime infrastrukturore</option>' +
                '<option value="DEFICIT_COVER">Mbulim i deficitit</option>' +
                '<option value="EMERGENCY">Fond emergjence</option>' +
                '<option value="HEALTH_EDU">Financim i shëndetësisë/arsimit</option>' +
            '</select>' +
        '</div>' +
        '<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:10px; padding:8px; background:rgba(239,68,68,0.08); border-radius:6px;">' +
            '⚠️ Huamarrja shton borxhin publik. Principalin e ktheni në maturim; nuk është shpenzim ose e ardhur tatimore.' +
            '<label>Afati i obligacionit<select id="bondMaturityWeeks"><option value="48">48 javë</option><option value="96">96 javë</option></select></label>' +
        '</div>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
            '<button class="action-btn btn-gold" onclick="issueGovernmentBond()">📄 Emeto Obligacion</button>' +
            '<button class="action-btn btn-outline" onclick="repayPublicDebt()">💵 Pago Borxh</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function issueGovernmentBond() { if(!assertGovernmentAuthority('Huamarrja'))return false;return fiscalPreview('BORROW',{amountB:Number(document.getElementById('borrowAmountSelect').value),purpose:document.getElementById('borrowPurposeSelect').value,maturityWeeks:Number(document.getElementById('bondMaturityWeeks')?.value||48)}); }

function repayPublicDebt() { return fiscalPreview('REPAY'); }

function openTaxPolicyModal() {
    if (!assertGovernmentAuthority("Ndryshimi i politikës fiskale")) return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var tp = state.taxPolicy || { vat: 18, incomeTax: 10, corporateTax: 15, customs: 10 };

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">💰 Politika Fiskale</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">TVSH:</label>' +
            '<select id="taxVatSelect" style="width:100%;">' +
                '<option value="15" ' + (tp.vat === 15 ? 'selected' : '') + '>15%</option>' +
                '<option value="18" ' + (tp.vat === 18 ? 'selected' : '') + '>18% (aktuale)</option>' +
                '<option value="20" ' + (tp.vat === 20 ? 'selected' : '') + '>20%</option>' +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">Tatim mbi të Ardhurat:</label>' +
            '<select id="taxIncomeSelect" style="width:100%;">' +
                '<option value="8" ' + (tp.incomeTax === 8 ? 'selected' : '') + '>8%</option>' +
                '<option value="10" ' + (tp.incomeTax === 10 ? 'selected' : '') + '>10% (aktual)</option>' +
                '<option value="12" ' + (tp.incomeTax === 12 ? 'selected' : '') + '>12%</option>' +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">Tatim mbi Korporatat:</label>' +
            '<select id="taxCorpSelect" style="width:100%;">' +
                '<option value="12" ' + (tp.corporateTax === 12 ? 'selected' : '') + '>12%</option>' +
                '<option value="15" ' + (tp.corporateTax === 15 ? 'selected' : '') + '>15% (aktual)</option>' +
                '<option value="18" ' + (tp.corporateTax === 18 ? 'selected' : '') + '>18%</option>' +
            '</select>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
            '<label style="font-size:0.74rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:4px;">Doganat:</label>' +
            '<select id="taxCustomsSelect" style="width:100%;">' +
                '<option value="8" ' + (tp.customs === 8 ? 'selected' : '') + '>8%</option>' +
                '<option value="10" ' + (tp.customs === 10 ? 'selected' : '') + '>10% (aktual)</option>' +
                '<option value="12" ' + (tp.customs === 12 ? 'selected' : '') + '>12%</option>' +
            '</select>' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="applyTaxPolicyChange()">💾 Apliko</button>';
    toggleModal("interactiveActionModal", true);
}

function applyTaxPolicyChange() { if(!assertGovernmentAuthority('Normat tatimore'))return false;return fiscalPreview('TAX',{vat:Number(document.getElementById('taxVatSelect').value),incomeTax:Number(document.getElementById('taxIncomeSelect').value),corporateTax:Number(document.getElementById('taxCorpSelect').value),customs:Number(document.getElementById('taxCustomsSelect').value)}); }

function transferToReserve() { return fiscalPreview('RESERVE'); }

function auditPublicSpending() { return fiscalPreview('AUDIT'); }

function checkFinancialConstraint(costB, description) {
    if(!Number.isFinite(costB) || costB<0)return {allowed:false,useReserve:false,shortfall:0,message:'Kostoja financiare është e pavlefshme.'};
    var authorization=fiscalSpendingCheck(costB,false);if(!authorization.allowed)return Object.assign({useReserve:false,shortfall:0},authorization);
    if ((state.budgetTotalB || 0) < costB) {
        var shortfall = costB - (state.budgetTotalB || 0);
        if ((state.fiscalReserve || 0) >= shortfall) {
            return { allowed: true, useReserve: true, shortfall: shortfall };
        }
        return { allowed: false, shortfall: shortfall, message: "Nuk ka fonde të mjaftueshme për: " + description + ". Mungon €" + (shortfall * 1000).toFixed(0) + "M." };
    }
    return { allowed: true, useReserve: false, shortfall: 0 };
}

/* ============================================================================
   37. KOMUNAT (FAZA 9)
   ============================================================================ */

function scoreToLevel(score) { return clamp(Math.round(score / 10), 1, 10); }
function levelLabel(level) { return DEVELOPMENT_PROJECT_LEVELS[level] || "I panjohur"; }
function levelColor(level) {
    if (level >= 8) return "var(--success)";
    if (level >= 6) return "var(--accent-gold)";
    if (level >= 4) return "var(--warning)";
    return "var(--danger)";
}

function renderElectionsSection() {
    renderParliamentaryElectionAccess();
    renderMunicipalities();
    renderCampaignPanel();
    renderElectionDayPanel();
}

function displayLocalIndicator(profile,key){return Number.isFinite(profile[key])?profile[key]+'/10':'E padokumentuar';}
function renderMunicipalities() {
    renderMunicipalDevelopment();
    var filterEl = document.getElementById("muniRegionFilter");
    var searchEl = document.getElementById("muniSearchInput");
    var filter = filterEl ? filterEl.value : "ALL";
    var searchQ = searchEl ? searchEl.value.toLowerCase() : "";
    var list = municipal14Municipalities(state,{region:filter,search:searchQ,level:document.getElementById('muniDevelopmentFilter')?.value||'',project:document.getElementById('muniProjectFilter')?.value||''});

    var counts = {};
    state.municipalities.forEach(function(m) { counts[m.mayorParty] = (counts[m.mayorParty] || 0) + 1; });
    var summaryBar = document.getElementById("municipalitiesSummaryBar");
    if (summaryBar) {
        summaryBar.innerHTML =
            '<div style="display:flex; gap:8px; flex-wrap:wrap; font-size:0.76rem; background:#0f172a; padding:8px 12px; border-radius:8px;">' +
                '<span>Kryetarët në 38 Komuna:</span>' +
                Object.entries(counts).map(function(entry) {
                    var pKey = entry[0]; var cnt = entry[1];
                    var pObj = state.parties[pKey];
                    return '<span class="tag ' + (pObj ? pObj.tagClass : 'tag-min') + '">' + (pObj ? pObj.short : pKey) + ': ' + cnt + '</span>';
                }).join("") +
            '</div>';
    }

    var grid = document.getElementById("municipalitiesGrid");
    if (!grid) return;
    var expanded=new Set(Array.from(grid.querySelectorAll('details[open]')).map(d=>d.dataset.municipality));
    grid.innerHTML=list.map(function(m){
        var e=catalogEscape,p=state.parties[m.mayorParty],profile=state.municipalityProfiles?.[m.id]||{},projects=municipal14Records(state).filter(x=>x.municipalityId===m.id),idx=state.municipalities.indexOf(m),active=projects.filter(x=>['FUNDED','ACTIVE','DELAYED'].includes(x.status)).length;
        return '<details class="card municipality-overview" data-municipality="'+e(m.id)+'" '+(expanded.has(m.id)?'open':'')+'><summary><span class="municipality-card-heading"><strong>'+e(m.name)+'</strong><span class="tag '+e(p?.tagClass||'tag-min')+'">'+e(p?.short||m.mayorParty)+'</span></span><span class="municipality-card-meta">'+e(m.region)+' · '+e(m.mayorName)+'</span><span class="municipality-card-meta">'+active+' projekte aktive · €'+m.budgetM.toLocaleString('sq-AL',{maximumFractionDigits:2})+'M buxhet</span><span class="municipality-card-open">Infrastruktura dhe projektet</span></summary><div class="municipality-card-body"><div class="municipality-indicators">'+[['Infrastruktura','infrastructure'],['Shërbimet','services'],['Punësimi','employment'],['Zhvillimi','development']].map(([label,key])=>'<div><span>'+label+'</span><strong>'+displayLocalIndicator(profile,key)+'</strong></div>').join('')+'</div><p><strong>Prioriteti:</strong> '+e(m.issue)+'</p><div class="municipality-projects">'+projects.map(municipal14Card).join('')+'</div><div class="municipality-actions"><button class="btn-top" onclick="openMuniProfile('+idx+')">Profili i plotë</button><button class="btn-top" onclick="openMuniProjectModal('+idx+')">Projektet dhe financimi</button></div></div></details>';
    }).join('')||'<p>Nuk ka komuna për filtrat e zgjedhur.</p>';
}

function openMuniProfile(mIdx) {
    var m = state.municipalities[mIdx];
    if (!m) return;
    var prof = (state.municipalityProfiles || {})[m.id] || {};
    var p = state.parties[m.mayorParty] || state.parties.LVV;
    var muniDevProjs = (state.developmentProjects || []).filter(function(dp){ return dp.municipalityId === m.id; });

    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">📍 Profili i Komunës: ' + m.name + '</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:12px; font-size:0.8rem; line-height:1.6;">' +
            '' +
            '<div>• <strong>Rajoni:</strong> ' + m.region + ' • <strong>Buxheti:</strong> €' + m.budgetM + 'M</div>' +
            '<div>• <strong>Kryetari:</strong> ' + m.mayorName + ' (' + p.short + ')</div>' +
            '<div>• <strong>Raporti:</strong> ' + (m.relationWithGov || 60) + '/100 • <strong>Mbështetja:</strong> ' + (m.localSupportPlayer || 35) + '%</div>' +
            '<div>• <strong>Prioriteti:</strong> ' + m.issue + '</div>' +
            '<div>• <strong>Nevojat:</strong> ' + (prof.needs || []).join(" • ") + '</div>' +
        '</div>' +
        municipal14RequestsHtml(m.id) +
        '<p>Projektet e katalogut: '+municipal14Records(state).filter(function(p){return p.municipalityId===m.id;}).map(function(p){return catalogEscape(p.title)+' — '+MUNICIPAL_14_STATUS[p.status];}).join(' · ')+'</p>' +
        '<h4 style="font-size:0.85rem; color:var(--accent-gold); margin-bottom:6px;">📊 Treguesit e Zhvillimit</h4>' +
        '<div class="grid-2" style="margin-bottom:12px; font-size:0.76rem;">' +
            '<div class="card" style="background:#0f172a; margin-bottom:0; padding:8px;">' +
                '<div>🏗️ Infrastrukturë: <strong>' + displayLocalIndicator(prof,'infrastructure') + '</strong></div>' +
                '<div>🏥 Shërbime: <strong>' + displayLocalIndicator(prof,'services') + '</strong></div>' +
                '<div>💼 Punësim: <strong>' + displayLocalIndicator(prof,'employment') + '</strong></div>' +
                '<div>📈 Zhvillim: <strong>' + displayLocalIndicator(prof,'development') + '</strong></div>' +
            '</div>' +
            '<div class="card" style="background:#0f172a; margin-bottom:0; padding:8px;">' +
                '<div>🎓 Arsim: <strong>' + displayLocalIndicator(prof,'education') + '</strong></div>' +
                '<div>💧 Uji: <strong>' + displayLocalIndicator(prof,'water') + '</strong></div>' +
                '<div>🛣️ Lidhshmëri: <strong>' + displayLocalIndicator(prof,'connectivity') + '</strong></div>' +
                '<div>🏥 Shëndetësi: <strong>' + displayLocalIndicator(prof,'health') + '</strong></div>' +
            '</div>' +
        '</div>' +
        '<h4 style="font-size:0.85rem; color:var(--accent-gold); margin-bottom:6px;">🏗️ Projektet Zhvillimore (' + muniDevProjs.length + ')</h4>' +
        (muniDevProjs.length === 0
            ? '<div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:10px;">Nuk ka projekte zhvillimore.</div>'
            : muniDevProjs.map(function(dp) {
                return '<div style="background:#0f172a; padding:6px 10px; border-radius:6px; margin-bottom:4px; font-size:0.75rem;">' +
                    '• <strong>' + dp.name + '</strong> — €' + dp.costM + 'M, ' + (dp.weeksLeft || 0) + ' javë, ' + dp.status +
                '</div>';
            }).join("")) +
        '<div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap;">' +
            '<button class="action-btn btn-gold" onclick="openMuniProjectModal(' + mIdx + ')">🏗️ Nis Projekt</button>' +
            '<button class="action-btn btn-outline" onclick="openMuniNeedsRequest(' + mIdx + ')">📩 Paraqit Nevojë</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function openMuniProjectModal(mIdx) {
    return openMunicipalDevelopment(state.municipalities[mIdx]?.id);
}

// Legacy action redirects to the institutional flow; saved projects are unchanged.
function approveMuniCatalogProject(mIdx, type, costM, weeks) {
    return openMunicipalDevelopment(state.municipalities[mIdx]?.id);
}

function openMuniNeedsRequest(mIdx) {
    var m=state.municipalities[mIdx];if(!m)return;
    var req=municipal14RequestRecords(state,m.id).find(function(r){return r.status==='PENDING';});
    if(!req && isPlayerInGovernment())req=createMunicipal14Request(m.id);
    if(req){refreshAllUI();return openMunicipal14Request(req.id);}
    showToast('Nuk ka kërkesa të reja; projektet dhe vendimet e mëparshme ruhen në panelin komunal.');
    return openMunicipalDevelopment(m.id);
}

function submitMuniNeedsRequest(mIdx) { return openMuniNeedsRequest(mIdx); }
function runLocalElections() {
    var wonByPlayer = 0;
    var genParties = ["LVV", "PDK", "LDK", "AAK"];
    state.municipalities.forEach(function(m) {
        if (m.mayorParty === "SL" || m.mayorParty === "MIN_MULTI") return;
        var playerSupport = m.localSupportPlayer || state.parties[state.playerParty].poll;
        if (playerSupport >= 48 || Math.random() * 100 < playerSupport) {
            m.mayorParty = state.playerParty;
            m.mayorName = "Kryetar i zgjedhur (" + state.parties[state.playerParty].short + ")";
            wonByPlayer++;
        } else {
            var others = genParties.filter(function(k) { return k !== state.playerParty; });
            m.mayorParty = others[Math.floor(Math.random() * others.length)];
        }
    });
    addMediaNews("KQZ Lokale", "Përfundojnë zgjedhjet lokale; " + state.parties[state.playerParty].short + " fiton " + wonByPlayer + " komuna!", "POSITIVE");
    refreshAllUI();
    showMajorAnnouncement({
        badge: "ZGJEDHJET LOKALE",
        title: "KQZ Certifikon: " + state.parties[state.playerParty].short + " Fiton " + wonByPlayer + " Komuna",
        reason: "Qytetarët votuan bazuar në projektet kapitale.",
        immediateImpact: "Harta e pushtetit lokal u përditësua."
    });
}

function runCampaignAction(type, cost) {
    return performCampaignActivity(type === "SOCIAL_MEDIA" ? "VIDEO" : type === "DIASPORA_RALLY" ? "RALLY" : type);
}

function participateTvDebate(strategy) {
    return performCampaignActivity("DEBATE");
}

function normalizePartyPolls() {
    var keys=Object.keys(state.parties),total=keys.reduce(function(sum,k){return sum+state.parties[k].poll;},0);
    if(!Number.isFinite(total) || total<=0)return;
    keys.forEach(function(k){state.parties[k].poll=+(state.parties[k].poll/total*100).toFixed(2);});
    var largest=keys.slice().sort(function(a,b){return state.parties[b].poll-state.parties[a].poll;})[0];
    var remainder=100-keys.reduce(function(sum,k){return sum+state.parties[k].poll;},0);
    state.parties[largest].poll=+(state.parties[largest].poll+remainder).toFixed(2);
}

/* ============================================================================
   38. PANELI I ZHVILLIMIT
   ============================================================================ */

function renderDevelopmentPanel() {
    var container = document.getElementById("developmentPanelContainer");
    if (!container) return;
    var infrastructureMunicipality=document.getElementById('infrastructureMunicipality')?.value;
    var healthMunicipality=document.getElementById('healthMunicipality')?.value;
    var sectors = state.stateSectors || [];
    var avgScore = sectors.length > 0 ? Math.round(sectors.reduce(function(a, s) { return a + s.score; }, 0) / sectors.length) : 0;
    var avgLevel = scoreToLevel(avgScore);
    var summary = stateDevelopmentSummary(state);

    var sectorCardsHtml = sectors.map(function(sec) {
        var level = scoreToLevel(sec.score);
        var initialLevel = scoreToLevel(state.sectorInitialScores[sec.id] || sec.score);
        var delta = level - initialLevel;
        var deltaHtml = delta > 0 ? '<span style="color:var(--success);">▲ +' + delta + '</span>' :
                        (delta < 0 ? '<span style="color:var(--danger);">▼ ' + delta + '</span>' :
                        '<span style="color:var(--text-muted);">▬ 0</span>');
        return '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
            '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">' +
                '<strong style="font-size:0.82rem;">' + sec.name + '</strong>' +
                '<div style="text-align:right;"><span style="font-size:1.15rem; font-weight:900; color:' + levelColor(level) + ';">' + level + '/10</span><br>' + deltaHtml + '</div>' +
            '</div>' +
            '<div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:4px;">' +
                'Nivel: <strong style="color:' + levelColor(level) + ';">' + levelLabel(level) + '</strong> • ' + sec.score + '/100' +
            '</div>' +
            '<div class="prog-track" style="height:6px; margin-bottom:6px;">' +
                '<div class="prog-fill" style="width:' + sec.score + '%; background:' + levelColor(level) + ';"></div>' +
            '</div>' +
        '</div>';
    }).join("");

    var devProjectsHtml = stateDevelopmentFilters();

    container.innerHTML =
        '<div class="card">' +
            '<div class="card-header">' +
                '<div class="card-title">🏗️ Zhvillimi i Shtetit</div>' +
                '<span class="tag tag-gold">Niveli Kombëtar: ' + avgLevel + '/10</span>' +
            '</div>' +
            '<div class="grid-3" style="margin-bottom:12px;">' +
                '<div style="background:#0f172a; padding:12px; border-radius:8px; text-align:center;">' +
                    '<div style="font-size:0.72rem; color:var(--text-muted);">Projekte aktive</div>' +
                    '<div id="developmentActiveCount" style="font-size:1.5rem; font-weight:900; color:var(--accent-gold);">' + summary.active + '</div>' +
                '</div>' +
                '<div style="background:#0f172a; padding:12px; border-radius:8px; text-align:center;">' +
                    '<div style="font-size:0.72rem; color:var(--text-muted);">Përfunduar</div>' +
                    '<div id="developmentCompletedCount" style="font-size:1.5rem; font-weight:900; color:var(--success);">' + summary.completed + '</div>' +
                '</div>' +
                '<div style="background:#0f172a; padding:12px; border-radius:8px; text-align:center;">' +
                    '<div style="font-size:0.72rem; color:var(--text-muted);">Projekte gjithsej</div>' +
                    '<div id="developmentTotalCount" style="font-size:1.5rem; font-weight:900; color:var(--accent-blue);">' + summary.total + '</div>' +
                '</div>' +
            '</div>' +
            '<p>Në përgatitje ose statuse të tjera: <strong id="developmentOtherCount">'+summary.other+'</strong> · Të anuluara: <strong id="developmentCancelledCount">'+summary.cancelled+'</strong>. Financimi pa nisje nuk llogaritet si projekt aktiv.</p><p>Gjithsej përfshin projektet e regjistruara, draftet dhe reformat sektoriale të nisura ose të përfunduara. Draftet mbeten te statuset e tjera; modelet ende të papropozuara dhe reformat e panisura nuk numërohen.</p>' +
        '</div>' +
        '<section class="card" id="municipalInfrastructurePanel" aria-label="Infrastruktura komunale dhe uji"></section>' +
        '<section class="card" id="municipalHealthPanel" aria-label="Shërbimet shëndetësore komunale"></section>' +
        '<section class="card" id="municipalEducationPanel" aria-label="Kushtet arsimore komunale"></section>' +
        '<div class="card">' +
            '<div class="card-header">' +
                '<div class="card-title">🏗️ Projektet Zhvillimore</div>' +
                (agendaExecutive()?'<button class="action-btn btn-gold" onclick="openDevelopmentProjectModal()">+ Projekto</button>':'') +
            '</div>' +
            devProjectsHtml +
        '</div>' +
        '<div class="card">' +
            '<div class="card-header"><div class="card-title">📊 Sektorët (Niveli 1–10)</div></div>' +
            '<div class="grid-3">' + sectorCardsHtml + '</div>' +
        '</div>';
    stateDevelopmentProjectList();
    renderMunicipalInfrastructure(infrastructureMunicipality);
    renderMunicipalHealth(healthMunicipality);polishDevelopmentSurface(container);
}

function openDevelopmentProjectModal(draftId) {
    if (!assertGovernmentAuthority("Projektimi i zhvillimit")) return;
    var draft=draftId && state.developmentProjects.find(function(p){return p.id===draftId && p.status==='PROPOSED';});
    if(draftId && !draft){showToast('Drafti nuk është më i disponueshëm për nisje.');return false;}
    if(draft?.type==='GREEN_SPACE' && !validGreenSpaceDraftAuthorization(draft)){showToast('Drafti historik GREEN_SPACE kërkon shqyrtim të autorizuar.');return false;}
    var munis = (state.municipalities || []).slice().sort(function(a, b) { return a.name.localeCompare(b.name); });
    var muniOptions = munis.map(function(m) { return '<option value="' + m.id + '">' + m.name + '</option>'; }).join("");
    var typeOptions = DEVELOPMENT_PROJECT_CATALOG.map(function(t) {
        return '<option value="' + t.type + '">' + t.icon + ' ' + t.name + '</option>';
    }).join("");

    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🏗️ Projektim i Ri Zhvillimor</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div class="grid-2" style="margin-bottom:8px;">' +
            '<div>' +
                '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">1. Komuna:</label>' +
                '<select id="devProjMuni" style="width:100%;">' + muniOptions + '</select>' +
            '</div>' +
            '<div>' +
                '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">2. Lloji:</label>' +
                '<select id="devProjType" style="width:100%;" onchange="developmentProjectTypeChanged()">' + typeOptions + '</select>' +
            '</div>' +
        '</div>' +
        '<div style="margin-bottom:8px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">3. Emri i projektit:</label>' +
            '<input type="text" id="devProjName" placeholder="Emri i projektit" style="width:100%;">' +
        '</div>' +
        '<div style="margin-bottom:8px;">' +
            '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">4. Përshkrimi:</label>' +
            '<textarea id="devProjDesc" rows="2" style="width:100%;"></textarea>' +
        '</div>' +
        '<div class="grid-2" style="margin-bottom:8px;">' +
            '<div>' +
                '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">5. Kosto (€M):</label>' +
                '<input type="number" id="devProjCost" min="1" max="100" step="1" value="15" style="width:100%;">' +
            '</div>' +
            '<div>' +
                '<label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">6. Kohëzgjatja (javë):</label>' +
                '<input type="number" id="devProjWeeks" min="4" max="40" step="1" value="10" style="width:100%;">' +
            '</div>' +
        '</div>' +
        '<div id="devProjPreview" style="background:rgba(245,158,11,0.08); padding:8px; border-radius:6px; font-size:0.74rem; margin-bottom:10px;"></div>' +
        '<div style="margin-bottom:10px;">' +
            '<button class="action-btn btn-gold" onclick="openMunicipalProjectCatalogForDev()">📋 Hap projektet komunale të katalogut</button>' +
        '</div>' +
        '<p>Ruajeni si draft për ta vazhduar nga lista. Mbyllja pa ruajtur nuk regjistron ndryshimet e formularit; nisja kërkon financim të plotë.</p>' +
        '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
            '<button class="action-btn btn-gold" onclick="createDevelopmentProject()">💰 Financo & Nis</button>' +
            '<button class="action-btn btn-outline" onclick="saveDevelopmentProjectAsDraft()">💾 Ruaj si Draft</button>' +
        '</div>' + '<input type="hidden" id="devProjDraftId">';
    document.getElementById('devProjDraftId').value=draft?draft.id:'';
    if(draft){
        document.getElementById('devProjMuni').value=draft.municipalityId||'';
        document.getElementById('devProjType').value=draft.type||'';
        document.getElementById('devProjName').value=draft.name||'';
        document.getElementById('devProjDesc').value=draft.desc||'';
        document.getElementById('devProjCost').value=Number.isFinite(draft.costM)?draft.costM:'';
        document.getElementById('devProjWeeks').value=Number.isInteger(draft.weeksTotal)?draft.weeksTotal:'';
    }
    toggleModal("interactiveActionModal", true);
    updateDevProjectPreview();
}

function developmentProjectTypeChanged(){
    if(document.getElementById('devProjType')?.value==='GREEN_SPACE'){
        document.getElementById('devProjCost').value='';
        document.getElementById('devProjWeeks').value='';
    }
    updateDevProjectPreview();
}

function updateDevProjectPreview() {
    var typeEl = document.getElementById("devProjType");
    if (!typeEl) return;
    var typeVal = typeEl.value;
    var cat = DEVELOPMENT_PROJECT_CATALOG.find(function(t) { return t.type === typeVal; });
    if (!cat) return;
    var muniIdEl = document.getElementById("devProjMuni");
    var muniId = muniIdEl ? muniIdEl.value : "";
    var muni = state.municipalities.find(function(m) { return m.id === muniId; });
    var costEl = document.getElementById("devProjCost");
    var weeksEl = document.getElementById("devProjWeeks");
    var costVal = Number(costEl ? costEl.value : 15);
    var weeksVal = Number(weeksEl ? weeksEl.value : 10);
    if (cat.type!=='GREEN_SPACE' && costVal < cat.costRangeM[0] && costEl) { costVal = cat.costRangeM[0]; costEl.value = costVal; }
    if (cat.type!=='GREEN_SPACE' && costVal > cat.costRangeM[1] && costEl) { costVal = cat.costRangeM[1]; costEl.value = costVal; }
    var box = document.getElementById("devProjPreview");
    if (!box) return;
    var infrastructurePreview=['ROAD','WATER','TRANSPORT','ENERGY_EFF','ENVIRONMENT','GREEN_SPACE'].includes(cat.type);
    var costText=infrastructurePreview && !Number.isFinite(costVal)?'kosto e pavlefshme':'€'+costVal+'M';
    var weeksText=infrastructurePreview && (!Number.isInteger(weeksVal) || weeksVal<1)?'afat i pavlefshëm':weeksVal+' javë';
    if(cat.type==='GREEN_SPACE'){
        if(!String(costEl?.value??'').trim())costText='e paplotësuar';
        if(!String(weeksEl?.value??'').trim())weeksText='i paplotësuar';
    }
    box.innerHTML =
        '📊 <strong>' + cat.icon + ' ' + cat.name + '</strong>' + (muni ? (' në <strong>' + muni.name + '</strong>') : '') + '<br>' +
        uiDetailRows([['Kosto','€'+cat.costRangeM[0]+'M–€'+cat.costRangeM[1]+'M (aktualisht '+costText+')',true],['Kohëzgjatja',cat.weeksRange[0]+'–'+cat.weeksRange[1]+' javë (aktualisht '+weeksText+')',true],['Përfitimet','+'+cat.sectorGain+' pikë sektori'],['Rrezik i përshkruar',cat.riskText]]) + economicInvestmentHint(cat.sectorId,cat.sectorGain) + (cat.gdpGain!==undefined?'<br>Bonusi i veçantë në PBB nuk aplikohet automatikisht; kur piloti është aktiv, ndikimi llogaritet përmes kapacitetit dhe prodhimit.':'');
    if(infrastructurePreview)box.innerHTML+=infrastructureFormPreview(cat,muniId);
    if(cat.type==='GREEN_SPACE'){
        var validCost=!!String(costEl?.value??'').trim() && Number.isFinite(costVal) && costVal>=1 && costVal<=8;
        var validWeeks=!!String(weeksEl?.value??'').trim() && Number.isInteger(weeksVal) && weeksVal>=4 && weeksVal<=10;
        if(!validCost || !validWeeks)box.innerHTML+='<p role="status">Plotësoni koston €1–8M dhe afatin 4–10 javë të plota. Vlerat nuk korrigjohen automatikisht.</p>';
        if(!document.getElementById('devProjDraftId')?.value)box.innerHTML+='<p>Ruajeni si draft të autorizuar, pastaj rihapeni nga lista për financim. services dhe development janë indekse të simuluara, jo matje gjelbërimi.</p>';
    }
}

function openMunicipalProjectCatalogForDev() {
    return openMunicipalDevelopment(document.getElementById('devProjMuni')?.value);
}

function selectCatalogProjectForDev(type, costM, weeks) {
    // A legacy selection may open only a fresh native form, never replace an open draft.
    if(type==='GREEN_SPACE'){
        if(document.getElementById('devProjDraftId')?.value || !DEVELOPMENT_PROJECT_CATALOG.some(function(c){return c.type==='GREEN_SPACE' && c.sectorId==='sec_env';})){
            showToast('GREEN_SPACE: drafti i hapur nuk zëvendësohet. Kërkohet vendim i veçantë.');return false;
        }
        return openInfrastructureProject('GREEN_SPACE',document.getElementById('devProjMuni')?.value);
    }
    var proj = MUNICIPAL_PROJECT_CATALOG.find(function(p) { return p.type === type; });
    if (!proj) return;
    var devCat = DEVELOPMENT_PROJECT_CATALOG.find(function(t) { return t.sectorId === proj.sectorId; });
    if (!devCat) {
        var typeMap = { ROAD_RURAL: "ROAD", SCHOOL_RENOVATION: "SCHOOL", HEALTH_CENTER: "HEALTH", WATER_SUPPLY: "WATER", URBAN_TRAFFIC: "ROAD", PUBLIC_TRANSPORT: "TRANSPORT", ECONOMIC_PARK: "ECONOMIC_ZONE", DIGITAL_SERVICES: "DIGITAL", AGRICULTURE_SUPPORT: "AGRICULTURE", CULTURAL_HERITAGE: "ENVIRONMENT", TOURISM_INFRA: "ENVIRONMENT" };
        devCat = DEVELOPMENT_PROJECT_CATALOG.find(function(t) { return t.type === typeMap[type]; });
    }
    if (!devCat) return;
    toggleModal("interactiveActionModal", false);
    setTimeout(function() {
        openDevelopmentProjectModal();
        setTimeout(function() {
            var typeEl = document.getElementById("devProjType");
            var nameEl = document.getElementById("devProjName");
            var descEl = document.getElementById("devProjDesc");
            var costEl = document.getElementById("devProjCost");
            var weeksEl = document.getElementById("devProjWeeks");
            if (typeEl) typeEl.value = devCat.type;
            if (nameEl) nameEl.value = proj.icon + ' ' + proj.name;
            if (descEl) descEl.value = "Projekt i simuluar për " + proj.name + ".";
            if (costEl) costEl.value = costM;
            if (weeksEl) weeksEl.value = weeks;
            updateDevProjectPreview();
        }, 50);
    }, 50);
}

// This is a persisted contract checkpoint, not a signature over user-editable saves.
// Only saveDevelopmentProjectAsDraft creates it, after allocating a NEW draft ID.
function validGreenSpaceDraftAuthorization(p) {
    var a=p?.draftAuthorization;
    return !!a && typeof a==='object' && !Array.isArray(a) &&
        Object.keys(a).length===4 && a.version===1 && a.projectId===p.id &&
        a.municipalityId===p.municipalityId && a.type==='GREEN_SPACE' &&
        p.type==='GREEN_SPACE' && p.sectorId==='sec_env' &&
        typeof p.id==='string' && typeof p.municipalityId==='string';
}

function readDevelopmentProjectForm(forDraftCreation) {
    var value=function(id){return document.getElementById(id)?.value;};
    var cat=DEVELOPMENT_PROJECT_CATALOG.find(function(c){return c.type===value('devProjType');});
    var name=(value('devProjName')||'').trim(),muniId=value('devProjMuni');
    var costM=Number(value('devProjCost')),weeksTotal=Number(value('devProjWeeks'));
    var draftId=value('devProjDraftId')||'';
    var draft=draftId && state.developmentProjects.find(function(p){return p.id===draftId && p.status==='PROPOSED';});
    if(draftId && !draft)throw Error('Ky draft është nisur tashmë ose nuk ekziston më.');
    if(!cat || name.length<5 || !state.municipalities.some(function(m){return m.id===muniId;}))throw Error('Plotësoni emrin, llojin dhe komunën e vlefshme të projektit.');
    if(cat.type==='GREEN_SPACE' || draft?.type==='GREEN_SPACE' || draft?.draftAuthorization!==undefined){
        if(cat.type!=='GREEN_SPACE' || cat.sectorId!=='sec_env' ||
            (draft ? !validGreenSpaceDraftAuthorization(draft) || draft.municipalityId!==muniId : forDraftCreation!==true))
            throw Error('Drafti GREEN_SPACE nuk ka autorizim të vlefshëm për këtë identitet dhe komunë.');
    }
    if(!String(value('devProjCost')||'').trim() || !String(value('devProjWeeks')||'').trim() || !Number.isFinite(costM) || costM<=0 || !Number.isInteger(weeksTotal) || weeksTotal<1)throw Error('Kostoja duhet të jetë pozitive dhe afati numër i plotë javësh.');
    if(costM<cat.costRangeM[0] || costM>cat.costRangeM[1] || weeksTotal<cat.weeksRange[0] || weeksTotal>cat.weeksRange[1])throw Error('Kostoja dhe javët duhet të jenë brenda kufijve të llojit të zgjedhur, të shfaqur në përmbledhje.');
    return {cat:cat,name:name,desc:(value('devProjDesc')||'').trim(),muniId:muniId,typeVal:cat.type,costM:costM,weeksTotal:weeksTotal,draft:draft};
}

function createDevelopmentProject() {
    if (!assertGovernmentAuthority("Krijimi i projektit zhvillimor")) return;
    try{validateCurrentIndicators(state,true);}catch(error){showToast(error.message);return false;}
    var form;try{form=readDevelopmentProjectForm();}catch(error){showToast(error.message);return false;}
    var {muniId,typeVal,name,desc,costM,weeksTotal,cat,draft}=form;
    if(municipalCapitalBlocked(state)){showToast('Gjykata ka bllokuar financimin e ri kapital.');return false;}
    if(municipalAusterity(state)){showToast('FMN: investimet komunale jane ngrire.');return false;}
    var metricError=municipalFundingMetricError(state,muniId,developmentMunicipalGains(cat));
    if(metricError){showToast(metricError);return false;}
    if(state.developmentProjects.some(function(p){return p!==draft && p.name===name && p.municipalityId===muniId && p.type===typeVal && (p.status==='IN_PROGRESS' || p.createdWeek===state.turnCount);})){showToast('Projekti ekziston; nuk krijohet pagese e dyte.');return false;}

    var authorization=fiscalSpendingCheck(costM/1000,true);if(!authorization.allowed){showToast(authorization.message);return false;}
    var check = checkFinancialConstraint(costM / 1000, "projektin \"" + name + "\"");
    if (!check.allowed) { showToast("❌ " + check.message); return false; }
    var beforeProject=JSON.stringify(state);
    if (check.useReserve) { fiscalSetBalance(state,"fiscalReserve",+(state.fiscalReserve - check.shortfall).toFixed(9),"createDevelopmentProject"); }
    fiscalSetBalance(state,"budgetTotalB",+(Math.max(0, state.budgetTotalB - (costM / 1000))).toFixed(9),"createDevelopmentProject");
    if(!draft)state.developmentProjectCounter = (state.developmentProjectCounter || 0) + 1;

    var proj = {
        id: draft?draft.id:"proj_" + Date.now() + "_" + state.developmentProjectCounter,
        name: name, desc: desc, type: typeVal, sectorId: cat.sectorId, municipalityId: muniId,
        ministry: "MMPHI", costM: costM, weeksTotal: weeksTotal, weeksLeft: weeksTotal, progress: 0,
        status: "IN_PROGRESS", fundingCommitted:true, effectsApplied:false, createdWeek: state.turnCount, completedWeek: null,
        benefits: { sectorGain: cat.sectorGain, muniGains: developmentMunicipalGains(cat) }
    };
    ensureProjectEffectComponents(proj,true);
    if(draft){Object.assign(draft,proj);draft.startedTurn=state.turnCount;}
    else state.developmentProjects.unshift(proj);
    var muni = state.municipalities.find(function(m) { return m.id === muniId; });
    addMediaNews("Ekonomia Online", "Nis projekti \"" + name + "\" në " + (muni ? muni.name : "—") + ".", "POSITIVE");
    if(!saveGameAuto()){state=JSON.parse(beforeProject);showToast('Projekti nuk u ruajt; financimi dhe regjistrimi u kthyen prapa.');return false;}
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    showToast("✔ Projekti nisi zbatimin!");
}

function saveDevelopmentProjectAsDraft() {
    if (!assertGovernmentAuthority("Ruajtja e propozimit")) return;
    var form;try{validateCurrentIndicators(state,true);form=readDevelopmentProjectForm(true);}catch(error){showToast(error.message);return false;}
    var before=JSON.stringify(state),draft=form.draft;
    if(!draft)draft=state.developmentProjects.find(function(p){return p.status==='PROPOSED' && p.name===form.name && p.type===form.typeVal && p.municipalityId===form.muniId;});
    // The name-based reuse path must never adopt or stamp an old ambiguous draft.
    if(form.typeVal==='GREEN_SPACE' && draft && !validGreenSpaceDraftAuthorization(draft)){
        showToast('Drafti historik GREEN_SPACE kërkon shqyrtim të autorizuar.');return false;
    }
    var newDraft=!draft;
    if(!draft){
        state.developmentProjectCounter=(state.developmentProjectCounter||0)+1;
        draft={id:'proj_draft_'+Date.now()+'_'+state.developmentProjectCounter,status:'PROPOSED',progress:0,createdWeek:state.turnCount,createdTurn:state.turnCount};
        state.developmentProjects.unshift(draft);
    }
    Object.assign(draft,{name:form.name,desc:form.desc,type:form.typeVal,sectorId:form.cat.sectorId,municipalityId:form.muniId,costM:form.costM,weeksTotal:form.weeksTotal,weeksLeft:form.weeksTotal});
    if(newDraft && form.typeVal==='GREEN_SPACE')draft.draftAuthorization={version:1,projectId:draft.id,municipalityId:draft.municipalityId,type:'GREEN_SPACE'};
    if(!saveGameAuto()){state=JSON.parse(before);showToast('Drafti nuk u ruajt. Provoni përsëri.');return false;}
    document.getElementById('devProjDraftId').value=draft.id;
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    showToast("💾 Projekti u ruajt si propozim.");
    return true;
}

function processDevelopmentWeek() {
    validateCurrentIndicators(state,true);
    if (!state.developmentProjects) state.developmentProjects = [];
    var updatedProjects = [];
    var reportLines = [];
    var totalSpentM = 0;
    var prepaidWorkM = 0;

    state.developmentProjects.forEach(function(p) {
        if (p.status === "IN_PROGRESS") {
            if(!p.fundingCommitted&&municipalCapitalBlocked(state))return;
            if(p.municipalityId&&municipalAusterity(state))return;
            if(typeof streetSectorBlocked==='function' && streetSectorBlocked(p.sectorId,state.turnCount,state))return;
            if(p.createdWeek>=state.turnCount)return;
            if(p.lastFiscalProgressTurn===state.turnCount)return;
            ensureProjectEffectComponents(p);
            p.lastFiscalProgressTurn=state.turnCount;
            var weeklyCostB = p.fundingCommitted ? 0 : (p.costM / 1000) / p.weeksTotal;
            if ((state.budgetTotalB || 0) < weeklyCostB) {
                p.status = "DELAYED";
                p.delayReason = "Mungesë financimi";
                updatedProjects.push({ name: p.name, status: "DELAYED", reason: p.delayReason });
                return;
            }
            fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB - weeklyCostB).toFixed(9),"processDevelopmentWeek");
            totalSpentM += weeklyCostB*1000;
            if(p.fundingCommitted)prepaidWorkM+=p.costM/p.weeksTotal;
            p.weeksLeft = Math.max(0, p.weeksLeft - 1);
            p.progress = Math.min(100, Math.round(((p.weeksTotal - p.weeksLeft) / p.weeksTotal) * 100));

            if (p.weeksLeft === 0) {
                p.status = "COMPLETED";
                p.completedWeek = state.turnCount;
                p.progress = 100;
                if(!p.effectsApplied){
                ensureProjectEffectComponents(p);
                var sec = (state.stateSectors || []).find(function(s) { return s.id === p.sectorId; });
                if(p.benefits?.sectorGain>0)processProjectEffect(p,'sector',1,!!sec,function(){
                    sec.score = clamp(sec.score + (p.benefits?.sectorGain ?? 0), 10, 100);
                    if (!state.sectorHistory[sec.id]) state.sectorHistory[sec.id] = [];
                    state.sectorHistory[sec.id].push({ week: state.turnCount, score: sec.score });
                },'Sektori nuk u gjet.');
                var prof = state.municipalityProfiles?.[p.municipalityId];
                    var gains = p.benefits?.muniGains || {};
                    ['infrastructure','services','employment','development','education','health','water','connectivity'].forEach(function(key){
                        // Preserve the existing scale conversion; apply only documented gains.
                        if(gains[key]>0)processProjectEffect(p,'metric:'+key,1,municipalMetricValid(prof,key),function(){
                            prof[key]=clamp(prof[key]+Math.round(gains[key]/5),1,10);
                        },'Mungon treguesi lokal '+key+'; përfitimi nuk u sajua.');
                    });
                processProjectEffect(p,'publicSupport',1,true,function(){adjustPublicSupport(1.2, {source:'local-development:'+p.id,scope:'LOCAL',implemented:true});});
                var muniObj = state.municipalities.find(function(m) { return m.id === p.municipalityId; });
                processProjectEffect(p,'localSupport',1,!!muniObj && !!prof,function(){adjustLocalPublicSupport(muniObj,1,prof);},'Mungon komuna ose profili.');
                p.effectWarnings=projectEffectIssues(p);
                p.effectsApplied=projectEffectsDelivered(p);if(p.effectsApplied)p.effectsAppliedTurn=state.turnCount;
                p.history=p.history || [];p.history.push({turn:state.turnCount,text:'U trajtuan një herë përfitimet e regjistruara të projektit. '+p.effectWarnings.join(' ')});
                var muniName = muniObj ? muniObj.name : "—";
                addMediaNews("Ekonomia Online", "Përfundoi projekti \"" + p.name + "\" në " + muniName + "!", "POSITIVE");
                updatedProjects.push({ name: p.name, status: "COMPLETED", reason: p.effectWarnings.length?p.effectWarnings.join(' '):"U dorëzua me sukses" });
                }
            }
        }
    });

    if (updatedProjects.length > 0 || totalSpentM > 0 || prepaidWorkM > 0) {
        var reportHtml = '<strong>📊 Raporti Javor i Zhvillimit (Java ' + state.turnCount + ')</strong><br>';
        if (totalSpentM > 0) reportHtml += 'Pagesa të reja nga arka: <strong>€' + totalSpentM.toFixed(3) + 'M</strong>.<br>';
        if (prepaidWorkM > 0) reportHtml += 'Vlerë pune nga financimi paraprak: <strong>€' + prepaidWorkM.toFixed(3) + 'M</strong>; nuk është pagesë e re.<br>';
        updatedProjects.forEach(function(u) {
            var icon = u.status === "COMPLETED" ? "✅" : (u.status === "DELAYED" ? "⚠️" : "•");
            reportHtml += icon + ' <strong>' + u.name + '</strong> — ' + u.reason + '<br>';
        });
        state.sectorWeeklyReport = reportHtml;
        state.municipalityWeeklyReport = reportHtml;
        state._developmentReportPending = true;
        state.lastDevelopmentReportWeek = state.turnCount;
    } else {
        state._developmentReportPending = false;
    }
}

function updateMunicipalityProfilesWeek() {
    if (!state.municipalityProfiles) return;
    (state.municipalities || []).forEach(function(m) {
        var prof = state.municipalityProfiles[m.id];
        if (!prof) return;
        var activeProjects = (m.projects || []).filter(function(p) { return p.status === "Në Ndërtim"; });
        if (activeProjects.length > 0 && Number.isFinite(prof.infrastructure)) {
            prof.infrastructure = clamp(prof.infrastructure + 0.05, 1, 10);
        }
    });
}

/* VAZHDON në pjesën 7 */
/* ============================================================================
   39. DIPLOMACIA DHE DIALOGU NË BRUKSEL
   ============================================================================ */

function renderDiplomacySection() {
    if(typeof renderDiplomacyDashboard==='function')renderDiplomacyDashboard();
    var summitHost=document.getElementById('summitParticipationPanel');if(summitHost)summitHost.innerHTML=summitPanel();
    var step = state.dialogueChronologyStep || 1;
    var inv = state.dialogueInvitation || {};

    var stepLabels = [
        "1. Ftesa & Konteksti",
        "2. Konsultimet me Aleatët",
        "3. Propozimi i Kosovës",
        "4. Raundi në Bruksel",
        "5. Rezultati & Monitorimi"
    ];

    var pillsHtml = stepLabels.map(function(lbl, idx) {
        var cls = (step === idx + 1) ? "tag-gold" : (step > idx + 1 ? "tag-min" : "tag-sl");
        return '<span class="tag ' + cls + '" style="font-size:0.7rem;">' + lbl + '</span>';
    }).join(" ");

    var invStatusHtml = "";
    if (inv.active && inv.responseStatus === "PENDING") {
        invStatusHtml = '<div style="background:rgba(245,158,11,0.12); padding:12px; border-radius:8px; margin-bottom:10px; border-left:4px solid var(--accent-gold);">' +
            '<div style="font-size:0.85rem; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">📨 Ftesë Aktive</div>' +
            '<div style="font-size:0.78rem; line-height:1.6;">' +
                '• <strong>Dërguesi:</strong> ' + inv.inviter + '<br>' +
                '• <strong>Afati:</strong> edhe ' + inv.deadlineWeeks + ' javë<br>' +
                '• <strong>Arsyeja:</strong> ' + inv.reason +
            '</div>' +
            '<div style="display:flex; gap:6px; margin-top:10px; flex-wrap:wrap;">' +
                '<button class="action-btn btn-success" onclick="respondToInvitation(\'ACCEPTED\')">✔ Prano</button>' +
                '<button class="action-btn btn-outline" onclick="respondToInvitation(\'POSTPONED\')">⏳ Shty</button>' +
                '<button class="action-btn btn-danger" onclick="respondToInvitation(\'REFUSED\')">✕ Refuzo</button>' +
            '</div>' +
        '</div>';
    } else if (inv.responseStatus === "ACCEPTED") {
        invStatusHtml = '<div style="background:rgba(16,185,129,0.12); padding:10px; border-radius:8px; margin-bottom:10px; font-size:0.78rem; border-left:3px solid var(--success);">✔ Ftesa u pranua (' + inv.respondedAt + ')</div>';
    } else if (inv.responseStatus === "POSTPONED") {
        invStatusHtml = '<div style="background:rgba(245,158,11,0.12); padding:10px; border-radius:8px; margin-bottom:10px; font-size:0.78rem; border-left:3px solid var(--warning);">⏳ Ftesa u shty</div>';
    } else if (inv.responseStatus === "REFUSED") {
        invStatusHtml = '<div style="background:rgba(239,68,68,0.12); padding:10px; border-radius:8px; margin-bottom:10px; font-size:0.78rem; border-left:3px solid var(--danger);">✕ Ftesa u refuzua</div>';
    } else {
        invStatusHtml = '<div style="background:#0f172a; padding:10px; border-radius:8px; margin-bottom:10px; font-size:0.78rem; color:var(--text-muted);">📭 Nuk ka ftesë aktive.</div>';
    }

    var consultKeys = ["USA", "EU", "GERMANY", "UK"];
    var consultList = consultKeys.map(function(k) {
        var d = state.diplomacy[k];
        if (!d) return "";
        var c = state.dialogueConsultations[k];
        var statusTxt = c ? ('<span style="color:var(--success);">✔ ' + (c.method==='CONSULTATION'?'Konsultim i regjistruar':'Konsultim i mëparshëm') + '</span>') : '<span style="color:var(--text-muted);">Nuk është konsultuar</span>';
        return '<div style="background:#0f172a; padding:6px 8px; border-radius:6px; margin-bottom:4px; font-size:0.76rem;">' +
            '<strong>' + d.name.split("(")[0].trim() + '</strong> (' + d.score + '/100) — ' + statusTxt +
        '</div>';
    }).join("");

    var logHtml = (state.dialogueNegotiationLog || []).slice(0, 3).map(function(l) {
        return '<div style="font-size:0.73rem; color:var(--text-muted); margin-bottom:2px;">• ' + l + '</div>';
    }).join("");

    var proposalHtml = state.dialogueProposal
        ? '<div style="background:#0f172a; padding:8px 10px; border-radius:6px; font-size:0.76rem; margin-bottom:8px;">' +
            '<div><strong>Tema:</strong> ' + state.dialogueProposal.topic + '</div>' +
            '<div><strong>Qëndrimi:</strong> ' + state.dialogueProposal.stance + '</div>' +
            '<div><strong>Garancia:</strong> ' + state.dialogueProposal.guarantee + '</div>' +
            '<div><strong>Vija e kuqe:</strong> ' + state.dialogueProposal.redLine + '</div>' +
          '</div>'
        : '<div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:8px;">Nuk është përgatitur propozim.</div>';

    var dialogueContainer = document.getElementById("dialogueBrusselsContainer");
    if (dialogueContainer) {
        dialogueContainer.innerHTML =
            '<div class="card">' +
                '<div class="card-header">' +
                    '<div class="card-title">🇪🇺 Dialogu me Brukselin — Proces 5-Hapësh</div>' +
                    '<span class="tag tag-pdk">Faza ' + step + ' / 5 • Progresi: ' + state.dialogueProgress + '%</span>' +
                '</div>' +
                '<section class="card" id="associationUltimatumPanel"></section><section id="associationPressurePanel"></section>'+'<div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:12px;">' + pillsHtml + '</div>' +
                invStatusHtml +
                '<div class="grid-2">' +
                    '<div>' +
                        '<div style="font-size:0.8rem; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">🤝 Konsultimet me Aleatët:</div>' +
                        consultList +
                        '<button class="action-btn btn-gold" style="margin-top:8px;" onclick="openDialogueStepModal()">▶ Vepro në Fazën ' + step + '</button>' +
                    '</div>' +
                    '<div>' +
                        '<div style="font-size:0.8rem; font-weight:700; color:var(--accent-gold); margin-bottom:6px;">📋 Propozimi:</div>' +
                        proposalHtml +
                        '<div style="font-size:0.8rem; font-weight:700; color:var(--accent-gold); margin-bottom:4px;">📜 Historiku:</div>' +
                        logHtml +
                    '</div>' +
                '</div>' +
                '<div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">' +
                    '<button class="action-btn btn-outline" onclick="executeNorthSecurityOperation()">🛡️ Forco Rendin në Veri</button>' +
                    '<button class="action-btn btn-outline" onclick="consultAlliesOffTable()">🤝 Konsultim i Shpejtë</button>' +
                '</div>' +
            '</div>';
    }

    var bilatContainer = document.getElementById("diplomacyBilateralContainer");
    if (bilatContainer) {
        var bilatHtml = Object.entries(state.diplomacy).map(function(entry) {
            var k = entry[0];
            var d = entry[1];
            var tagCls = d.score >= 75 ? "tag-min" : "tag-aak";
            var cityTxt = d.city || "Kryeqytet";
            var offTxt = d.official || "Homologu";
            return '<div class="card" style="background:#0f172a; margin-bottom:0;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
                    '<strong>' + d.name + '</strong>' +
                    '<span class="tag ' + tagCls + '">' + d.score + ' / 100</span>' +
                '</div>' +
                '<div style="font-size:0.74rem; color:var(--accent-gold); margin-bottom:4px;">📍 ' + cityTxt + ' • ' + offTxt + '</div>' +
                '<p style="font-size:0.76rem; color:var(--text-muted); margin-bottom:10px;">' + d.note + '</p>' +
                '<button class="action-btn btn-gold" onclick="openBilateralVisitModal(\'' + k + '\')">✈️ Vizitë në ' + cityTxt + ' ▶</button>' +
            '</div>';
        }).join("");
        bilatContainer.innerHTML = '<div class="grid-2">' + bilatHtml + '</div>';
    }

    renderDialogueMonitoring();
    if(typeof renderAssociationPanel==='function')renderAssociationPanel();if(typeof renderAssociationUltimatum==='function')renderAssociationUltimatum();
}

function renderDialogueMonitoring() {
    var container = document.getElementById("dialogueMonitoringContainer");
    if (!container) return;
    var agreements = state.dialogueAgreements || [];
    var history = state.dialogueRoundHistory || [];

    var agreeHtml = agreements.length === 0
        ? '<div style="padding:14px; background:#0f172a; border-radius:8px; color:var(--text-muted); font-size:0.8rem;">Nuk ka marrëveshje në monitorim.</div>'
        : agreements.map(function(a) {
            var statusBadge = a.status === "FULFILLED" ? '<span class="tag tag-min">✔ ZBATUAR</span>'
                : (a.status === "FAILED" ? '<span class="tag tag-sl">✕ DËSHTOI</span>' : '<span class="tag tag-gold">⏳ NË ZBATIM</span>');
            return '<div class="card" style="background:#0f172a; margin-bottom:8px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
                    '<strong style="font-size:0.84rem;">📋 ' + a.title + '</strong>' + statusBadge +
                '</div>' +
                '<div style="font-size:0.75rem; color:var(--text-muted); line-height:1.5;">' +
                    '• Partneri: <strong>' + a.partner + '</strong><br>' +
                    '• Nënshkruar: ' + a.signedDate + '<br>' +
                    '• Afati: ' + a.deadlineWeeks + ' javë<br>' +
                    '• Përmbajtja: ' + a.summary +
                '</div>' +
            '</div>';
        }).join("");

    var histHtml = history.length === 0
        ? '<div style="font-size:0.78rem; color:var(--text-muted);">Nuk ka raunde të kryera.</div>'
        : history.slice(0, 5).map(function(h) {
            return '<div style="padding:6px 8px; background:#0f172a; border-radius:6px; margin-bottom:4px; font-size:0.75rem;">' +
                '• <strong>' + h.date + '</strong> — ' + h.result +
            '</div>';
        }).join("");

    container.innerHTML =
        '<div class="card">' +
            '<div class="card-header">' +
                '<div class="card-title">📋 Monitorimi i Marrëveshjeve</div>' +
                '<span class="tag tag-min">' + agreements.length + ' aktive</span>' +
            '</div>' +
            '<h4 style="font-size:0.85rem; color:var(--accent-gold); margin-bottom:8px;">Marrëveshjet:</h4>' +
            agreeHtml +
            '<h4 style="font-size:0.85rem; color:var(--accent-gold); margin-top:12px; margin-bottom:8px;">Historiku:</h4>' +
            histHtml +
        '</div>';
}

function openDialogueStepModal() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    var step = state.dialogueChronologyStep || 1;
    var inv = state.dialogueInvitation;

    if (step === 1 && inv && inv.responseStatus === "PENDING" && inv.active) {
        openInvitationResponseModal();
        return;
    }
    if (step === 1) { openDialogueStep1_Context(); }
    else if (step === 2) { openDialogueStep2_Consultations(); }
    else if (step === 3) { openDialogueStep3_Proposal(); }
    else if (step === 4) { openDialogueStep4_BrusselsRound(); }
    else { openDialogueStep5_Result(); }
}

function openInvitationResponseModal() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    var inv = state.dialogueInvitation;
    if (!inv) return;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">📨 Ftesa për Dialogun</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:10px; font-size:0.82rem; line-height:1.6;">' +
            '<div><strong>Dërguesi:</strong> ' + inv.inviter + '</div>' +
            '<div><strong>Arsyeja:</strong> ' + inv.reason + '</div>' +
            '<div><strong>Rendi i ditës:</strong> ' + inv.agenda + '</div>' +
            '<div><strong>Afati:</strong> edhe <strong style="color:var(--accent-gold);">' + inv.deadlineWeeks + ' javë</strong></div>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:7px;">' +
            '<button class="choice-btn" onclick="respondToInvitation(\'ACCEPTED\')">' +
                '<span class="choice-title">1. ✔ Prano ftesën</span>' +
                '<span class="choice-impact">Partnerët e mirëpresin koordinimin; reagimi vendas varet nga përmbajtja</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="respondToInvitation(\'POSTPONED\')">' +
                '<span class="choice-title">2. ⏳ Kërko shtyrje</span>' +
                '<span class="choice-impact">Qëndrimi i prerë mund të gjejë përkrahje, por vështirëson bashkëpunimin me BE-në</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="respondToInvitation(\'REFUSED\')" style="border-color:rgba(239,68,68,0.4);">' +
                '<span class="choice-title" style="color:var(--danger);">3. ✕ Refuzo</span>' +
                '<span class="choice-impact">Priten tensione me partnerët dhe reagime të ndara brenda vendit</span>' +
            '</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function respondToInvitation(decision) {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    var inv = state.dialogueInvitation;
    if (!inv || inv.responseStatus !== "PENDING") {
        toggleModal("interactiveActionModal", false);
        showToast("Kjo ftesë është trajtuar tashmë!");
        return;
    }
    inv.responseStatus = decision;
    inv.respondedAt = MONTHS_SQ[state.monthIndex] + " " + state.year + " (Java " + state.week + ")";

    if (decision === "ACCEPTED") {
        state.diplomacy.EU.score = clamp(state.diplomacy.EU.score + 3, 10, 100);
        state.diplomacy.USA.score = clamp(state.diplomacy.USA.score + 2, 10, 100);
        adjustPublicSupport((1.5), {source:"respondToInvitation"}, state);
        state.dialogueChronologyStep = 2;
        addMediaNews("RTK / Bruksel", "Kosova pranon ftesën për raundin e dialogut.", "POSITIVE");
        state.dialogueNegotiationLog.unshift(inv.respondedAt + ": Ftesa u pranua; kalon në konsultime.");
        showToast("Ftesa u pranua!");
    } else if (decision === "POSTPONED") {
        state.diplomacy.EU.score = clamp(state.diplomacy.EU.score - 2, 10, 100);
        adjustPublicSupport((1.0), {source:"respondToInvitation"}, state);
        inv.deadlineWeeks = Math.max(1, inv.deadlineWeeks - 1);
        addMediaNews("Klan Kosova", "Kosova kërkon shtyrje; BE shpreh shqetësim.", "NEUTRAL");
        state.dialogueNegotiationLog.unshift(inv.respondedAt + ": Ftesa u shty.");
        showToast("Ftesa u shty! BE u prek (-2 pikë).");
    } else {
        state.diplomacy.EU.score = clamp(state.diplomacy.EU.score - 8, 10, 100);
        state.diplomacy.USA.score = clamp(state.diplomacy.USA.score - 5, 10, 100);
        state.diplomacy.GERMANY.score = clamp(state.diplomacy.GERMANY.score - 5, 10, 100);
        adjustPublicSupport((2.5), {source:"respondToInvitation"}, state);
        addMediaNews("KOHA", "Kosova refuzon ftesën; QUINT shpreh zhgënjim.", "CRITICAL");
        state.dialogueNegotiationLog.unshift(inv.respondedAt + ": Ftesa u refuzua.");
        state.dialogueChronologyStep = 1;
        showToast("Ftesa u refuzua! Pasoja diplomatike.");
    }

    toggleModal("interactiveActionModal", false);
    refreshAllUI();
}

function openDialogueStep1_Context() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Dialogu shtetëror'))return false;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var inv = state.dialogueInvitation;
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🇪🇺 Hapi 1 / 5: Ftesa & Konteksti</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:10px; font-size:0.82rem; line-height:1.6;">' +
            '<div><strong>Dërguesi:</strong> ' + inv.inviter + '</div>' +
            '<div><strong>Statusi:</strong> <span style="color:var(--success);">' + inv.responseStatus + '</span> (' + inv.respondedAt + ')</div>' +
            '<div><strong>Arsyeja:</strong> ' + inv.reason + '</div>' +
            '<div><strong>Rendi i ditës:</strong> ' + inv.agenda + '</div>' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="advanceDialogueStep(2)">Kalo në Konsultimet me Aleatët ▶</button>';
    toggleModal("interactiveActionModal", true);
}

function openDialogueStep2_Consultations() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Konsultimet e Qeverisë'))return false;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var consultKeys = ["USA", "EU", "GERMANY", "UK"];
    var consultCards = consultKeys.map(function(k) {
        var d = state.diplomacy[k];
        if (!d) return "";
        var already = state.dialogueConsultations[k];
        var statusBadge = already ? '<span class="tag tag-min">✔ Konsultuar</span>' : '<span class="tag tag-gold">Nuk është konsultuar</span>';
        var actionBtns = already
            ? '<div style="font-size:0.74rem; color:var(--text-muted);">Metoda: ' + (already.method==='CONSULTATION'?'Konsultim i regjistruar':'Konsultim i mëparshëm') + '</div>'
            : '<div style="display:flex; gap:5px; flex-wrap:wrap;">' +
                '<button class="btn-top" onclick="startConsultationSession(\'' + k + '\')">🤝 Zgjidh konsultimin</button>' +
              '</div>';
        return '<div class="card" style="background:#0f172a; margin-bottom:6px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
                '<strong style="font-size:0.82rem;">' + d.name.split("(")[0].trim() + '</strong>' +
                statusBadge +
            '</div>' +
            '<div style="font-size:0.73rem; color:var(--text-muted); margin-bottom:6px;">Raporti: <strong>' + d.score + '/100</strong></div>' +
            actionBtns +
        '</div>';
    }).join("");

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🇪🇺 Hapi 2 / 5: Konsultimet me Aleatët</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:10px;">Zgjidh partnerin, temën dhe qëllimin. Përgjigjja regjistrohet pas konfirmimit.</p>' +
        consultCards +
        '<div style="margin-top:10px; display:flex; gap:6px;">' +
            '<button class="action-btn btn-gold" onclick="advanceDialogueStep(3)">Kalo në Propozim (Hapi 3) ▶</button>' +
            '<button class="action-btn btn-outline" onclick="toggleModal(\'interactiveActionModal\', false)">Mbylle</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function startConsultationSession(partnerKey) {
    if(!assertGovernmentAuthority('Konsultimet e Qeverisë'))return false;return openInternationalCommunication(partnerKey,'CONSULTATION');
}

function consultationStep2(partnerKey) {
    return startConsultationSession(partnerKey);
}

function consultationStep3(partnerKey) {
    return startConsultationSession(partnerKey);
}

function openDialogueStep3_Proposal() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Propozimi shtetëror'))return false;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var topicOptions = [
        "Zbatimi i Marrëveshjes së Ohrit",
        "Siguria në Veri dhe integrimi institucional",
        "Të drejtat e komuniteteve dhe Asociacioni",
        "Plani i Rritjes i BE-së",
        "Koordinimi me NATO dhe SHBA"
    ];
    var stanceOptions = [
        "Kërkojmë njohje de-facto",
        "Kërkojmë reciprocitet të plotë",
        "Kërkojmë sekuencim gradual",
        "Kërkojmë zbatim paralel"
    ];
    var guaranteeOptions = [
        "Verifikim nga Gjykata Kushtetuese",
        "Garanci sigurie nga NATO",
        "Monitorim i BE-së",
        "Zbatim hap-pas-hapi"
    ];
    var offerOptions = [
        "Angazhim për dialog të vazhdueshëm",
        "Hapje e zyrës rajonale",
        "Zbatim i masave të besimit",
        "Pjesëmarrje në forumin rajonal"
    ];
    var redLineOptions = [
        "Asnjë asociacion me kompetenca ekzekutive",
        "Asnjë njohje që cenon sovranitetin",
        "Asnjë tërheqje e Policisë nga veriu",
        "Asnjë ndryshim kushtetues"
    ];

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🇪🇺 Hapi 3 / 5: Propozimi i Kosovës</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div class="grid-2" style="gap:8px;">' +
            '<div><label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">1. Tema:</label>' +
                '<select id="dlgPropTopic" style="width:100%; margin-bottom:6px;">' + topicOptions.map(function(o) { return '<option value="' + o + '">' + o + '</option>'; }).join("") + '</select></div>' +
            '<div><label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">2. Qëndrimi:</label>' +
                '<select id="dlgPropStance" style="width:100%; margin-bottom:6px;">' + stanceOptions.map(function(o) { return '<option value="' + o + '">' + o + '</option>'; }).join("") + '</select></div>' +
            '<div><label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">3. Garancia:</label>' +
                '<select id="dlgPropGuarantee" style="width:100%; margin-bottom:6px;">' + guaranteeOptions.map(function(o) { return '<option value="' + o + '">' + o + '</option>'; }).join("") + '</select></div>' +
            '<div><label style="font-size:0.73rem; color:var(--accent-gold); font-weight:700; display:block; margin-bottom:3px;">4. Oferta:</label>' +
                '<select id="dlgPropOffer" style="width:100%; margin-bottom:6px;">' + offerOptions.map(function(o) { return '<option value="' + o + '">' + o + '</option>'; }).join("") + '</select></div>' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
            '<label style="font-size:0.73rem; color:var(--danger); font-weight:700; display:block; margin-bottom:3px;">5. Vija e Kuqe:</label>' +
            '<select id="dlgPropRedLine" style="width:100%;">' + redLineOptions.map(function(o) { return '<option value="' + o + '">' + o + '</option>'; }).join("") + '</select>' +
        '</div>' +
        '<button class="action-btn btn-gold" onclick="saveDialogueProposalAndAdvance()">📋 Ruaj & Kalo në Hapin 4 ▶</button>';
    toggleModal("interactiveActionModal", true);
}

function saveDialogueProposalAndAdvance() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    var topicEl = document.getElementById("dlgPropTopic");
    var stanceEl = document.getElementById("dlgPropStance");
    var guaranteeEl = document.getElementById("dlgPropGuarantee");
    var offerEl = document.getElementById("dlgPropOffer");
    var redLineEl = document.getElementById("dlgPropRedLine");

    state.dialogueProposal = {
        topic: topicEl ? topicEl.value : "",
        stance: stanceEl ? stanceEl.value : "",
        guarantee: guaranteeEl ? guaranteeEl.value : "",
        offer: offerEl ? offerEl.value : "",
        redLine: redLineEl ? redLineEl.value : "",
        preparedAt: MONTHS_SQ[state.monthIndex] + " " + state.year + " (Java " + state.week + ")"
    };
    state.dialogueChronologyStep = 4;
    state.dialogueNegotiationLog.unshift(MONTHS_SQ[state.monthIndex] + " " + state.year + ": Propozimi u hartua.");
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    showToast("Propozimi u ruajt!");
}

function openDialogueStep4_BrusselsRound() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Raundi i dialogut shtetëror'))return false;
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var prop = state.dialogueProposal;
    if (!prop) {
        box.innerHTML = '<div class="card-header"><div class="card-title">⚠️ Nuk ka propozim</div></div>' +
            '<p style="font-size:0.82rem;">Duhet të hartosh propozimin në Hapin 3.</p>' +
            '<button class="action-btn" onclick="toggleModal(\'interactiveActionModal\', false); state.dialogueChronologyStep = 3; openDialogueStep3_Proposal();">Kthehu</button>';
        toggleModal("interactiveActionModal", true);
        return;
    }
    var usaScore = state.diplomacy.USA.score;
    var euScore = state.diplomacy.EU.score;
    var consulted = Object.keys(state.dialogueConsultations).length;
    var totalScore = (usaScore + euScore) / 2 + consulted * 3 + state.dialogueProgress * 0.3;

    var counterText, counterType;
    if (totalScore >= 85) {
        counterType = "FAVORABLE";
        counterText = 'Ka gatishmëri për shqyrtimin e propozimit. Kërkohet një dosje teknike dhe plan monitorimi; kushtet do të diskutohen në raundet e negociatave.';
    } else if (totalScore >= 70) {
        counterType = "BALANCED";
        counterText = 'Ka hapësirë për kompromis, por kërkohen sqarime dhe konsultime shtesë. Nuk është ofruar financim.';
    } else if (totalScore >= 55) {
        counterType = "TOUGH";
        counterText = 'Pala ka rezerva. Kërkohet plan i besueshëm zbatimi përpara shqyrtimit të bashkëpunimit.';
    } else {
        counterType = "VERY_TOUGH";
        counterText = 'Situata është e tensionuar. Kërkojnë: <strong>tërheqje të plotë të propozimit ose lëshime thelbësore</strong>.';
    }

    state.dialogueCounterOffer = { type: counterType, text: counterText, generatedAt: MONTHS_SQ[state.monthIndex] + " " + state.year };

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🇪🇺 Hapi 4 / 5: Raundi në Bruksel</div>' +
            '<span class="tag tag-gold">Shqyrtim paraprak</span>' +
        '</div>' +
        '<div style="background:#0f172a; padding:10px; border-radius:8px; margin-bottom:10px; font-size:0.78rem; line-height:1.6;">' +
            '<div><strong>Propozimi:</strong> ' + prop.topic + '</div>' +
            '<div><strong>Vija e kuqe:</strong> ' + prop.redLine + '</div>' +
            '<div><strong>Konsultime:</strong> ' + consulted + ' aleatë</div>' +
        '</div>' +
        '<div class="chat-bubble chat-them"><strong>Ndërmjetësuesit:</strong><br>"' + counterText + '"</div>' +
        '<div style="margin-top:12px; display:flex; flex-direction:column; gap:7px;">' +
            '<button class="choice-btn" onclick="resolveBrusselsRound(\'ACCEPT\')">' +
                '<span class="choice-title">1. Vazhdo shqyrtimin në negociata</span>' +
                '<span class="choice-impact">Kushtet dhe miratimet mbeten të hapura</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="resolveBrusselsRound(\'COUNTER_MODIFY\')">' +
                '<span class="choice-title">2. Propozo modifikim</span>' +
                '<span class="choice-impact">Rezultat i pasigurt</span>' +
            '</button>' +
            '<button class="choice-btn" onclick="resolveBrusselsRound(\'REFUSE\')" style="border-color:rgba(239,68,68,0.4);">' +
                '<span class="choice-title" style="color:var(--danger);">3. Refuzo</span>' +
                '<span class="choice-impact">Kundërshtimi mund të mobilizojë bazën dhe të shtojë kritikat e partnerëve</span>' +
            '</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function resolveBrusselsRound(decision) {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Dialogu shtetëror'))return false;
    if(!['ACCEPT','COUNTER_MODIFY','REFUSE'].includes(decision) || !state.dialogueProposal || !state.dialogueCounterOffer)return false;
    var next=null;
    if(!internationalCommit(function(db){
        var today=MONTHS_SQ[state.monthIndex]+' '+state.year,result;
        if(decision==='REFUSE')result='Kundëroferta u refuzua; nuk u arrit marrëveshje.';
        else {
            var n=db.negotiations.find(function(n){return n.partnerId==='EU' && ['DRAFT','COUNTER','OFFERED','SUSPENDED'].includes(n.status);});
            if(n && n.topic!=='REFORMS')throw Error('Përfundoni ose mbyllni negociatën ekzistuese me BE-në para hapjes së kësaj teme.');
            next=n?n.id:internationalBeginRecord(db,'EU','REFORMS',String(state.dialogueProposal.topic).slice(0,350));
            result='Propozimi kaloi në negociata me BE-në. Kushtet, shqyrtimi dhe nënshkrimi mbeten të hapura; nuk u lëvruan fonde.';
        }
        state.dialogueRoundHistory.unshift({date:today,result:result,negotiationId:next});
        state.dialogueNegotiationLog.unshift(today+': '+result);
        state.dialogueChronologyStep=5;state.dialogueCounterOffer=null;
    }))return false;
    toggleModal('interactiveActionModal',false);
    if(next)openInternationalDiplomacy('EU');else showToast('Oferta u refuzua. Nuk u arrit marrëveshje.');
    return true;
}

function openDialogueStep5_Result() {
    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var lastRound = (state.dialogueRoundHistory || [])[0];
    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">🇪🇺 Hapi 5 / 5: Rezultati</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        (lastRound
            ? '<div style="background:#0f172a; padding:12px; border-radius:8px; margin-bottom:10px; font-size:0.82rem; line-height:1.6;">' +
                '<div><strong>Data:</strong> ' + lastRound.date + '</div>' +
                '<div><strong>Rezultati:</strong> ' + lastRound.result + '</div>' +
              '</div>'
            : '<div style="font-size:0.82rem;">Nuk ka raund të përfunduar.</div>') +
        '<div style="background:rgba(245,158,11,0.08); padding:10px; border-radius:6px; font-size:0.78rem; margin-bottom:10px;">' +
            '<strong>📋 Monitorimi:</strong> ' + (state.dialogueAgreements || []).length + ' marrëveshje aktive.' +
        '</div>' +
        '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
            '<button class="action-btn btn-gold" onclick="resetDialogueForNextRound()">🔄 Përgatit Raund të Ri</button>' +
            '<button class="action-btn btn-outline" onclick="toggleModal(\'interactiveActionModal\', false)">Mbylle</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
}

function resetDialogueForNextRound() {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    state.dialogueChronologyStep = 1;
    state.dialogueInvitation = {
        active: true,
        inviter: "Bashkimi Evropian (BE) & Shtetet e Bashkuara",
        inviterKey: "EU",
        reason: "Raund i ri dialogu për zbatimin e marrëveshjeve paraprake.",
        agenda: "Monitorimi i zbatimit, siguria në veri, integrimi i komuniteteve",
        deadlineWeeks: 3,
        responseStatus: "PENDING",
        respondedAt: null
    };
    state.dialogueConsultations = {};
    state.dialogueProposal = null;
    state.dialogueCounterOffer = null;
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    showToast("Raundi i ri u përgatit!");
}

function advanceDialogueStep(newStep) {
    if(northSanctioned(state)||associationTotalSanctions(state)||associationUltimatumPending(state)){showToast('Dialogu eshte bllokuar nga kriza aktive ose sanksionet nderkombetare.');return false;}
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    state.dialogueChronologyStep = newStep;
    toggleModal("interactiveActionModal", false);
    refreshAllUI();
    showToast("Kaluat në Hapin " + newStep + ".");
}

function consultAlliesOffTable() {
    if(!assertGovernmentAuthority('Konsultimet e Qeverisë'))return false;return openInternationalCommunication('USA','CONSULTATION');
}

function openLegacyBilateralVisitModal(countryKey) { return openBilateralVisitModal(countryKey); }

function finalizeLegacyBilateralVisit(countryKey, dealType) { return finalizeBilateralVisit(countryKey, dealType); }

function executeNorthSecurityOperation() {
    if(!assertGovernmentAuthority('Ky veprim ekzekutiv'))return false;
    if(state.lastNorthSecurityOperationTurn===state.turnCount){showToast('Ky veprim sigurie është kryer këtë javë.');return false;}
    try{validateCurrentIndicators(state,true);}catch(error){showToast(error.message);return false;}
    var beforeSecurity=JSON.stringify(state);
    try {
    state.securityNorth = clamp(state.securityNorth + 6, 10, 100);
    adjustPublicSupport((2.5), {source:"executeNorthSecurityOperation"}, state);
    addMediaNews("RTK", "Forcohen shërbimet në 4 komunat veriore.", "POSITIVE");
    state.lastNorthSecurityOperationTurn=state.turnCount;
    if(!saveGameAuto())throw Error('Ruajtja e veprimit dështoi.');
    } catch(error) {
        state=JSON.parse(beforeSecurity);
        showToast('Veprimi i sigurisë nuk u ruajt; gjendja e mëparshme u rikthye.');
        return false;
    }
    refreshAllUI();
    showToast("Siguria në veri u rrit me +6%!");
    return true;
}

/* ============================================================================
   40. ADVANCE TIME
   ============================================================================ */

window.promptAdvanceTime = function(weeks) {
    if (!state) return;
    var blocked=weekAdvanceReason(weeks);if(blocked){showToast(blocked);return false;}
    var expiringTasks = (state.pmInboxRequests || []).filter(function(req) {
        return agendaActive(req) && req.deadlineWeeks <= weeks;
    });
    var expiringDossiers = (state.weeklyDossiers || []).filter(function(d) {
        return d.status === "PENDING" && d.deadlineWeeks <= weeks;
    });
    var dueMeetings = (state.scheduledMeetings || []).filter(function(m) {
        return m.status === "SCHEDULED" && m.dueTurn < (state.turnCount + weeks);
    });

    if (expiringTasks.length === 0 && dueMeetings.length === 0 && expiringDossiers.length === 0) {
        requestWeeklyTransition(weeks);
        return;
    }

    var box = document.getElementById("interactiveActionModalContent");
    if (!box) return;
    var tasksHtml = expiringTasks.map(function(t) { return '<li><strong>Kërkesë:</strong> ' + t.title + '</li>'; }).join("");
    var dossiersHtml = expiringDossiers.map(function(d) { return '<li><strong>Dosje:</strong> ' + d.title + '</li>'; }).join("");
    var meetsHtml = dueMeetings.map(function(m) { return '<li><strong>Takim:</strong> ' + m.targetName + '</li>'; }).join("");

    box.innerHTML =
        '<div class="card-header">' +
            '<div class="card-title">⚠️ Paralajmërim (+' + weeks + ' Javë)</div>' +
            '<button class="btn-top" onclick="toggleModal(\'interactiveActionModal\', false)">Mbyll ✕</button>' +
        '</div>' +
        '<div style="font-size:0.85rem; margin-bottom:12px; color:#cbd5e1;">Keni detyra që do të skadojnë:</div>' +
        '<ul style="font-size:0.8rem; color:var(--danger); margin-bottom:16px; padding-left:20px; line-height:1.6;">' +
            tasksHtml + dossiersHtml + meetsHtml +
        '</ul>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
            '<button class="action-btn btn-outline" onclick="toggleModal(\'interactiveActionModal\', false)">Kthehu</button>' +
            '<button class="action-btn btn-danger" onclick="toggleModal(\'interactiveActionModal\', false); requestWeeklyTransition(' + weeks + ');">Vazhdo gjithsesi ▶</button>' +
        '</div>';
    toggleModal("interactiveActionModal", true);
};

function processExistingTimeAdvance(weeksCount, silentToast) {
    if(associationUltimatumPending(state)){showToast('Vendosni per ultimatumin e QUINT-it perpara kalimit te kohes.');return false;}
    if (!constituentGovernmentGate(true)) {showToast("Përfundoni seancën konstituive përpara se të kaloni në javën tjetër.");return;}
    if (hasOpenElectionProcess()) { showToast("Përfundoni votimin dhe numërimin para kalimit të javës."); return; }
    if (state && state.pendingVote) { showToast("Përfundoni votimin para kalimit të kohës."); return; }
    if (typeof weeksCount === "undefined") weeksCount = 1;
    if (typeof silentToast === "undefined") silentToast = false;
    var dueMeetingIdx = -1;

    for (var i = 0; i < weeksCount; i++) {
        state.week++;
        state.turnCount++;
        state.weeksToNextRegularElection--;

        if (state.week > 4) {
            state.week = 1;
            state.monthIndex++;
            if (state.monthIndex > 11) {
                state.monthIndex = 0;
                state.year++;
                fiscalYearTransition();
                addMediaNews("Ministria e Financave", "Nis viti fiskal " + state.year + ".", "POSITIVE");
            }
        }

        processCouncilWeek(state.turnCount);processWinterEnergyWeek(state.turnCount);processGeneralStrikeWeek(state.turnCount);processMunicipalGrantsWeek(state.turnCount);
        if(typeof processBrusselsSpecialWeek==='function')processBrusselsSpecialWeek(state.turnCount);processAssociationUltimatumWeek(state.turnCount);
        processSectorExpansionWeek(state.turnCount);processEnergyInquiryWeek(state.turnCount);processRTKWeek(state.turnCount);processTrepcaWeek(state.turnCount);processSovereignWeek(state.turnCount);processHighwayWeek(state.turnCount);processDinarWeek(state.turnCount);processNorthWeek(state.turnCount);
        if(typeof processDiasporaWeek==='function')processDiasporaWeek(state.turnCount);
        if(typeof processTaxAdministrationWeek==='function')processTaxAdministrationWeek(state.turnCount);
        processLaborExodusWeek(state.turnCount);if(typeof processPopulationWeek==='function')processPopulationWeek(state.turnCount);
        if(typeof processBilateralTradeWeek==='function')processBilateralTradeWeek(state.turnCount);
        if(typeof processSecurityCrisesWeek==='function')processSecurityCrisesWeek(state.turnCount);
        processStrategicEconomyWeek(state.turnCount);
        processWeeklyFiscalReport(state.turnCount);
        if(typeof processBrusselsEconomy==='function')processBrusselsEconomy(state.turnCount);
        processInstitutionalConflictsWeek(state.turnCount);
        if(typeof processRogueMinistersWeek==='function')processRogueMinistersWeek(state.turnCount);
        if(typeof processVeteransAuditWeek==='function')processVeteransAuditWeek(state.turnCount);
        if(typeof processVeteransEconomy==='function')processVeteransEconomy(state.turnCount);
        if(typeof processUnionsWeek==='function')processUnionsWeek(state.turnCount);
        processInternalPressureWeek(state.turnCount);processMediaDossiersWeek(state.turnCount);
        if(typeof processJusticeReformWeek==='function')processJusticeReformWeek(state.turnCount);
        if(typeof processConstitutionalCourtWeek==='function')processConstitutionalCourtWeek(state.turnCount);
        if(typeof processIMFCrisisWeek==='function')processIMFCrisisWeek(state.turnCount);
        processInternationalDiplomacyWeek();
        processDevelopmentWeek();
        processGovernmentCatalogWeek();processWinterGreenAwards();
        updateMunicipalityProfilesWeek();

        checkPresidentialMandateExpiry();

        if (state.dialogueInvitation && state.dialogueInvitation.active && state.dialogueInvitation.responseStatus === "PENDING") {
            state.dialogueInvitation.deadlineWeeks--;
            if (state.dialogueInvitation.deadlineWeeks <= 0) {
                state.dialogueInvitation.responseStatus = "REFUSED";
                state.dialogueInvitation.respondedAt = "Afati skadoi";
                state.diplomacy.EU.score = clamp(state.diplomacy.EU.score - 6, 10, 100);
                state.diplomacy.USA.score = clamp(state.diplomacy.USA.score - 4, 10, 100);
                adjustPublicSupport(-(1.0), {source:"processExistingTimeAdvance"}, state);
                addMediaNews("Koha", "Afati skadoi pa përgjigje.", "CRITICAL");
            }
        }

        // Legacy records retain their history, but elapsed time is not proof of implementation.
        (state.dialogueAgreements || []).forEach(function(agr) {
            if(agr.status!=='ACTIVE')return;
            agr.deadlineWeeks--;
            if(agr.deadlineWeeks<=0){
                agr.status='FAILED';agr.outcome='Nuk u dokumentua zbatimi i kushteve brenda afatit.';
                state.diplomacy.EU.score=clamp(state.diplomacy.EU.score-1,0,100);
                addMediaNews('Diplomacia',agr.title+': '+agr.outcome,'CRITICAL');
            }
        });

        (state.stateSectors || []).forEach(function(sec) {
            if (sec.active && sec.weeksLeft > 0 && !(typeof streetSectorBlocked==='function' && streetSectorBlocked(sec.id,state.turnCount,state))) {
                sec.weeksLeft--;
                if (sec.weeksLeft === 0) {
                    sec.active = false;
                    sec.completedTurn=state.turnCount;
                    if(sec.effectsApplied)return;
                    sec.score = clamp(sec.score + 12, 10, 100);
                    if (!state.sectorHistory[sec.id]) state.sectorHistory[sec.id] = [];
                    state.sectorHistory[sec.id].push({ week: state.turnCount, score: sec.score });
                    adjustPublicSupport(2.4, {source:'sector-completion:'+sec.id,sectorId:sec.id,implemented:true});
                    if(!economicPilotActive(state) || !['sec_energy','sec_econ'].includes(sec.id) && !(state.economicPilot.productive && sec.id==='sec_agri'))state.gdpGrowth = +(state.gdpGrowth + 0.1).toFixed(1);
                    sec.effectsApplied=true;
                    addMediaNews("RTK", "Përfundon reforma \"" + sec.projectTitle + "\".", "POSITIVE");
                }
            }
        });

        state.municipalities.forEach(function(m) {
            if (!m.projects) return;
            m.projects.forEach(function(pr) {
                if(municipalAusterity(state))return;
                if (pr.status !== "I Përfunduar") {
                    if(typeof streetSectorBlocked==='function' && streetSectorBlocked(pr.sectorId||pr.sector,state.turnCount,state))return;
                    pr.weeksLeft = Math.max(0, pr.weeksLeft - 1);
                    pr.progress = Math.min(100, Math.round(((pr.totalWeeks - pr.weeksLeft) / pr.totalWeeks) * 100));
                    if (pr.weeksLeft === 0) {
                        pr.status = "I Përfunduar";
                        pr.completedTurn=state.turnCount;
                        adjustPublicSupport(1.5, {source:'local-project:'+pr.id,scope:'LOCAL',implemented:true});
                        addMediaNews("Ekonomia Online", "Përfundon \"" + pr.title + "\" në " + m.name + "!", "POSITIVE");
                    }
                }
            });
        });

        (state.pmInboxRequests || []).forEach(function(req) {
            if(req.municipal14 || req.agenda6)return;
            if (req.status === "PENDING") {
                req.deadlineWeeks--;
                if (req.deadlineWeeks <= 0) {
                    req.status = "EXPIRED";
                    req.expiredTurn=state.turnCount;
                    req.outcomeMsg = "Afati kaloi pa vendim.";
                    adjustPublicSupport(-(2.2), {source:"processExistingTimeAdvance"}, state);
                    addMediaNews("Kallxo", "Skadon afati i kërkesës së " + req.senderName + ".", "CRITICAL");
                }
            }
        });

        (state.weeklyDossiers || []).forEach(function(d) {
            if (d.status === "PENDING") {
                d.deadlineWeeks--;
                if (d.deadlineWeeks <= 0) {
                    d.status = "EXPIRED";
                    d.expiredTurn=state.turnCount;
                    adjustPublicSupport(-(1.8), {source:"processExistingTimeAdvance"}, state);
                    addMediaNews("Kallxo", "Skadon afati i dosjes: " + d.title, "CRITICAL");
                }
            }
        });

        processLawNegotiations();
        if(typeof processOppositionWeek==='function')processOppositionWeek(state.turnCount);
        if(typeof processLocalElectionsWeek==='function')processLocalElectionsWeek(state.turnCount);
        if(typeof processMediaWarfareWeek==='function')processMediaWarfareWeek(state.turnCount);
        processWeeklyAgenda();
        if(typeof processSecurityOpsWeek==='function')processSecurityOpsWeek(state.turnCount);
        if(typeof processStreetProtestsWeek==='function')processStreetProtestsWeek(state.turnCount);
        if(typeof processSectorConstructionWeek==='function')processSectorConstructionWeek(state.turnCount);
        // Evaluate investor guarantees after this week's scandals and civic reactions.
        if(typeof processForeignInvestmentsWeek==='function')processForeignInvestmentsWeek(state.turnCount);
        if(typeof processLocalObstructions==='function')processLocalObstructions();

        if (state.scheduledMeetings) {
            state.scheduledMeetings.forEach(function(m) {
                if (m.status === "SCHEDULED" && m.dueTurn < state.turnCount) {
                    m.status = "MISSED";
                    m.outcome = "Takimi u anashkalua.";
                }
            });
            state.scheduledMeetings.forEach(function(m, idx) {
                if (m.status === "SCHEDULED" && m.dueTurn === state.turnCount && dueMeetingIdx === -1) {
                    dueMeetingIdx = idx;
                }
            });
        }


        state.promises.forEach(function(pr) {
            if(pr.mandateGoal||pr.electoralGoal||pr.specialPromise)return;
            if (!pr.fulfilled) {
                pr.deadlineWeeks--;
                if (pr.deadlineWeeks === 0) {
                    recordBrokenPublicPromise(pr);
                    addMediaNews("Kallxo", "Qeveria thyen afatin për \"" + pr.title + "\".", "CRITICAL");
                }
            }
        });

        (state.parliamentarySessions || []).forEach(function(sess) {
            if (sess.status === "SCHEDULED" && sess.week <= state.turnCount) {
                sess.status = "READY";
            }
        });

        if(typeof ensureRegularCampaign==='function')ensureRegularCampaign(state);
        processCampaignWeek();
        if(typeof processElectoralPromisesWeek==='function')processElectoralPromisesWeek(state.turnCount);
        processSpecialPromisesWeek(state.turnCount);
        // Each simulated week gets the same update, including batched advances.
        var myP = state.parties[state.playerParty];
        if (!state.electionCampaign || state.electionCampaign.moduleVersion !== 3) {
            var delta = (state.approval - 46) * 0.03;
            myP.poll = clamp(myP.poll + delta, 4, 72);
            normalizePartyPolls();
        }
        if(typeof processGovernmentCrisesWeek==='function')processGovernmentCrisesWeek(state.turnCount);processCoalitionBlackmailWeek(state.turnCount);
        if(typeof processNationalEmergenciesWeek==='function')processNationalEmergenciesWeek(state.turnCount);
        if(veteransProtestActive(state))state.gdpGrowth=Math.min(0,state.gdpGrowth);
        if(typeof syncInterestGroups==='function')syncInterestGroups(state);
        if(state.nationalEmergencies?.events.some(e=>e.status==='ACTIVE'&&!e.acknowledged||e.status==='FAILED'&&e.failedTurn===state.turnCount))break;
        if(typeof governmentCrisisPending==='function'&&governmentCrisisPending())break;
        if(typeof electoralObjectiveRequired==='function'&&electoralObjectiveRequired(state))break;
        if (state.electionCampaign && state.electionCampaign.moduleVersion === 3 && state.electionCampaign.status === "READY") break;
        if (state.weeksToNextRegularElection <= 0 && !parliamentaryElectionBlock(state)) {
            startParliamentaryElectionProcess("Përfundimi i mandatit katërvjeçar");
            return;
        }
    }

    refreshAllUI();

    if (dueMeetingIdx !== -1 && !weeklyProcessing) {
        conductScheduledMeeting(dueMeetingIdx);
    } else if (!silentToast) {
        showToast("Kaluan " + weeksCount + " javë • " + MONTHS_SQ[state.monthIndex] + " " + state.year);
    }
}

/* ============================================================================
   41. TAB NAVIGATION
   ============================================================================ */

function switchMainTab(tabId, navBtn) {
    if(tabId==='tab-government' && typeof oppositionActive==='function' && oppositionActive()){showToast('Jeni në opozitë. Veprimet tuaja gjenden te Shtabi i Partisë.');tabId='tab-dashboard';navBtn=null;}
    document.querySelectorAll(".tab-view").forEach(function(el) { el.classList.remove("active"); });
    var target = document.getElementById(tabId);
    if (target) target.classList.add("active");

    if (navBtn) {
        document.querySelectorAll(".bottom-nav .nav-item").forEach(function(b) { b.classList.remove("active"); });
        navBtn.classList.add("active");
    } else {
        var mapIdx = { "tab-dashboard": 0, "tab-party": 1, "tab-assembly": 2, "tab-government": 3, "tab-elections": 4, "tab-diplomacy": 5, "tab-development": 6, "tab-catalog": 7 };
        var btns = document.querySelectorAll(".bottom-nav .nav-item");
        btns.forEach(function(b) { b.classList.remove("active"); });
        if (btns[mapIdx[tabId]]) btns[mapIdx[tabId]].classList.add("active");
    }
    renderVisibleWorkspace();
    if(window.matchMedia && window.matchMedia('(max-width: 1024px)').matches){
        var activeNavigation=document.querySelector('.bottom-nav .nav-item.active');
        if(activeNavigation)activeNavigation.scrollIntoView({block:'nearest',inline:'nearest'});
    }
    if(tabId === "tab-assembly") revealAssemblyTab(document.querySelector(".assembly-tabs .active"));
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function revealAssemblyTab(button) {
    if(!button)return;
    var strip=button.closest(".assembly-tabs");if(!strip)return;
    var item=button.getBoundingClientRect(),bounds=strip.getBoundingClientRect();
    if(item.left<bounds.left+6)strip.scrollLeft-=bounds.left+6-item.left;
    else if(item.right>bounds.right-6)strip.scrollLeft+=item.right-bounds.right+6;
}
function initializeAssemblyTabs() {
    var strip=document.querySelector(".assembly-tabs");if(!strip || strip.dataset.ready)return;
    strip.dataset.ready="true";
    var tabs=Array.from(strip.querySelectorAll("[data-assembly-tab]"));
    tabs.forEach(function(button){
        var panel=document.getElementById("ass-"+button.dataset.assemblyTab);
        if(!button.id)button.id="assemblyTab-"+button.dataset.assemblyTab;
        button.setAttribute("role","tab");button.setAttribute("aria-controls",panel.id);
        button.setAttribute("aria-selected",String(button.classList.contains("active")));
        button.tabIndex=button.classList.contains("active")?0:-1;
        panel.setAttribute("role","tabpanel");panel.setAttribute("aria-labelledby",button.id);panel.tabIndex=0;
    });
    strip.addEventListener("keydown",function(event){
        var index=tabs.indexOf(event.target);if(index<0)return;
        if(event.key==="Enter" || event.key===" "){
            event.preventDefault();if(!event.repeat)tabs[index].click();return;
        }
        var next={ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
        if(next===undefined)return;
        event.preventDefault();tabs[next].focus({preventScroll:true});revealAssemblyTab(tabs[next]);
    });
}
function switchSubTab(prefix, subKey, pillBtn) {
    if(prefix==='dash' && subKey==='development'){openStateDevelopment();return;} // Compatibility for old links.
    if(prefix==='gov' && subKey==='meeting' && !assertGovernmentAuthority('Mbledhja e Qeverisë'))return false;
    if(prefix === "ass"){
        initializeAssemblyTabs();
        pillBtn=document.querySelector('[data-assembly-tab="'+subKey+'"]');
        if(!pillBtn || !document.getElementById("ass-"+subKey))return;
    }
    if (prefix === "elec" && subKey === "voting" && !electionDayEligible(state)) {
        showToast("Përfundoni dhe mbyllni fillimisht fushatën trejavore."); return;
    }
    if (prefix === "elec" && subKey === "campaignplay" && (!state.electionCampaign || state.electionCampaign.moduleVersion !== 3 || !["CAMPAIGN","CAMPAIGN_CLOSED"].includes(state.electionPhase))) {
        showToast("Shpallni fillimisht zgjedhjet parlamentare brenda simulimit."); return;
    }
    if (!pillBtn) return;
    var parentSection = pillBtn.closest(".tab-view");
    if (!parentSection) return;
    parentSection.querySelectorAll(".sub-content").forEach(function(el) { el.style.display = "none"; });
    parentSection.querySelectorAll(".sub-pill").forEach(function(b) { b.classList.remove("active"); });

    var target = document.getElementById(prefix + "-" + subKey);
    if (target) target.style.display = "block";
    pillBtn.classList.add("active");
    if(prefix === "ass"){
        parentSection.querySelectorAll("[data-assembly-tab]").forEach(function(button){
            var selected=button===pillBtn;button.setAttribute("aria-selected",String(selected));button.tabIndex=selected?0:-1;
        });
        revealAssemblyTab(pillBtn);
    }

    renderVisibleWorkspace();stopConstituentAnimation();
}

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("DOMContentLoaded", initializeAssemblyTabs);

/* Faza 13: procedura dhe financimi këtu janë rregulla të simulimit. */
function migrateGovernmentCatalog(st) {
    if (!st.governmentCatalog) st.governmentCatalog = { version: 1, projects: [], ledger: [], counter: 0 };
    var catalog=st.governmentCatalog;
    if(catalog.version!==1 || !Array.isArray(catalog.projects) || !Array.isArray(catalog.ledger) || !Number.isInteger(catalog.counter) || catalog.counter<0)throw Error('Katalogu i ruajtur është i pavlefshëm.');
    function validateWork(x){
        if(!x || typeof x.id!=='string' || !Number.isFinite(x.costB) || x.costB<0 || !Number.isInteger(x.duration) || x.duration<1 || x.duration>208)throw Error('Plani i zbatimit është i pavlefshëm.');
        var job=x.implementation || x;
        if(job.status==='ACTIVE' || job.status==='COMPLETED'){
            if(!Number.isInteger(job.lastTurn) || !Number.isInteger(job.deadlineTurn) || !Number.isInteger(job.elapsed) || !Number.isFinite(job.progress) || job.progress<0 || job.progress>100)throw Error('Progresi i ruajtur është i pavlefshëm.');
        }
    }
    catalog.projects.forEach(validateWork);
    catalog.ledger.forEach(function(e){if(!e || typeof e.id!=='string' || !Number.isFinite(e.costB) || e.costB<0)throw Error('Regjistri i financimit është i pavlefshëm.');});
    if(new Set(catalog.ledger.map(function(e){return e.id;})).size!==catalog.ledger.length)throw Error('Financim i dyfishuar në ruajtje.');
    st.laws.forEach(function(law) {
        if(law.legalEffectMode!==undefined && law.legalEffectMode!=='PROCEDURAL')throw Error('Mënyra e efekteve të aktit është e pavlefshme.');
        if (law.internationalAgreementId) return;
        if(law.catalog13){validateWork(law);if(!Array.isArray(law.amendments) || !['DRAFT','REVIEW','RETURNED','APPROVED','REJECTED'].includes(law.govStage))throw Error('Projektligji i ruajtur është i pavlefshëm.');}
        law.source = "Dokument i simuluar — pa burim ligjor real të verifikuar";
        if (!law.catalog13) {
            // Preserve historical workflow and already applied effects in old saves.
            law.legacy13 = true;
        }
    });
}
function initializeCatalogBill(law) {
    law.catalog13 = true;
    law.source = "Projektligj i simuluar";
    law.createdTurn = state.turnCount;
    law.createdDate = diplomaticDate(state.turnCount);
    law.duration = law.duration || 8;
    law.govStage = "DRAFT";
    law.govRequired = (law.proposer || "").indexOf("Qeveria") === 0;
    law.amendments = [];
    law.version = 1;
    law.debated = false;
    law.majorityType = "SIMPLE_61";
    law.requiredVotes = 61;
}
function catalogSubmissionAllowed(law) {
    if (!law.catalog13 || !law.govRequired || law.govStage === "APPROVED") return true;
    showToast("Projektligji kërkon shqyrtim dhe miratim nga Qeveria përpara dërgimit në Kuvend.");
    return false;
}
function catalogEscape(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});
}
function catalogCommit() { fiscalSyncBudgetStatuses(); refreshAllUI(); openGovernmentCatalog(); }
function catalogStage(law) {
    if(courtMajorPending(law,state))return "I Pezulluar nga Gjykata";if(law.status==="ANNULLED")return "Anuluar nga Gjykata";
    if (law.status === "DRAFT" && law.catalog13 && law.govRequired) return ({DRAFT:"Hartim",REVIEW:"Në shqyrtim në Qeveri",RETURNED:"Kthyer për plotësim",APPROVED:"Miratuar nga Qeveria"})[law.govStage];
    return ({DRAFT:"Hartim",SUBMITTED:"Dërguar në Kuvend",UNDER_REVIEW:"Debat dhe amendamente",SCHEDULED:"Në pritje të votimit",PASSED:"Ligj i miratuar",FAILED:"Projektligj i refuzuar",WITHDRAWN:"Projektligj i tërhequr"})[law.status] || law.status;
}
function openGovernmentCatalog() {
    toggleModal('interactiveActionModal',false);
    switchMainTab('tab-catalog');
}
function catalogImplementationDetails(x) {
    if(x.approvalAuthority==='COURT_SCENARIO')return '<p>Drafti u miratua nga vendimi kushtetues i ketij skenari te lojes. Regjistri shenon autoritetin gjyqesor; nuk u zhvillua votim parlamentar.</p>';
    if(x.constitutionChange || x.constitutionalRequirement)return constitutionalBillDetails(x);
    if(x.legalEffectMode==='PROCEDURAL')return '<p>Akt normativ i skenarit. Miratimi nuk kryen pagesë dhe nuk shton pikë sektoriale. Masat praktike kërkojnë vendim, financim dhe afat në sistemin ekzistues. Nuk është simuluar hyrje në fuqi juridike reale ose çdo dispozitë e tekstit.</p>';
    if(x.annualBudgetYear)return fiscalAnnualBudgetDetails(x);
    var job=x.implementation || x;
    return uiDetailRows([['Kosto','€'+((x.costB||0)*1000).toFixed(2)+'M',true],['Kohëzgjatja',(x.duration||8)+' javë',true],['Burimi','Buxheti i shtetit'],['Krijuar',x.createdDate||'Para Fazës 13; data e saktë nuk është regjistruar'],['Nisja',job.startDate||'Ende pa nisur'],['Afati',job.deadlineTurn?diplomaticDate(job.deadlineTurn):'Pas nisjes',true],['Progresi',(job.progress||0).toFixed(0)+'%']])+'<progress max="100" value="'+(job.progress||0)+'"></progress><p>Shërbimet përmirësohen gjatë zbatimit. Reagimi publik varet nga përparimi dhe gjendja e sektorit. Rreziku: ndryshimi i Qeverisë mund ta pezullojë punën; vonesat njoftohen pa kosto automatike.</p>';
}
function catalogDraftForm(project) {
    if(!project && !assertPoliticalParliament('Iniciativa ligjore'))return false;
    if(project && !assertGovernmentAuthority('Propozimi i projektit'))return;
    document.getElementById('interactiveActionModalContent').innerHTML='<form class="catalog13" onsubmit="event.preventDefault();createCatalogDocument('+project+')"><h2>'+(project?'Projekt qeveritar':'Projektligj')+'</h2><label>Titulli<input id="c13Title" required maxlength="180"></label><label>Ministria përgjegjëse<select id="c13Ministry">'+state.ministries.map(function(m){return '<option>'+catalogEscape(m.name)+'</option>';}).join('')+'</select></label><label>Sektori<select id="c13Sector">'+state.stateSectors.map(function(s){return '<option value="'+catalogEscape(s.id)+'">'+catalogEscape(s.name)+'</option>';}).join('')+'</select></label><label>Qëllimi, përmbajtja kryesore dhe shërbimet e prekura<textarea id="c13Desc" required maxlength="5000"></textarea></label><label>Kostoja e plotë e zbatimit (milionë euro)<input id="c13Cost" type="number" min="0" step="0.01" max="10000" required value="10"></label><label>Kohëzgjatja e zbatimit (javë)<input id="c13Duration" type="number" min="1" max="208" required value="8"></label><p>Financimi: buxheti i shtetit. Projektet kërkojnë një javë shqyrtim qeveritar para financimit.</p><button class="action-btn btn-gold" type="submit">Ruaj propozimin</button><button type="button" class="action-btn" onclick="openGovernmentCatalog()">Kthehu</button></form>';
    toggleModal('interactiveActionModal',true);
}
function createCatalogDocument(project) {
    if(!project && !assertPoliticalParliament('Iniciativa ligjore'))return false;
    if(project && !assertGovernmentAuthority('Propozimi i projektit'))return false;
    migrateGovernmentCatalog(state);
    function value(id){return document.getElementById(id).value.trim();}
    var cost=Number(value('c13Cost'))/1000, duration=Number(value('c13Duration')), title=value('c13Title'), desc=value('c13Desc');
    if(!title || !desc || !Number.isFinite(cost) || cost<0 || cost>10 || !Number.isInteger(duration) || duration<1 || duration>208){showToast('Plotësoni fushat me vlera të vlefshme.');return false;}
    if(cost>state.budgetTotalB){showToast('Mjetet buxhetore nuk mjaftojnë për këtë propozim.');return false;}
    var x={id:'catalog13_'+(++state.governmentCatalog.counter),title:title,desc:desc,ministry:value('c13Ministry'),sector:value('c13Sector'),costB:cost,duration:duration,approvalEffect:2,status:project?'PLANNED':'DRAFT',createdTurn:state.turnCount,createdDate:diplomaticDate(state.turnCount),proposer:agendaExecutive()?'Qeveria e Kosovës':'Deputetë të '+state.playerParty,supportParties:[state.playerParty],stageHistory:[],voteHistory:[],applied:false};
    if(project)state.governmentCatalog.projects.push(x);else{initializeCatalogBill(x);state.laws.push(x);}
    catalogCommit();return x;
}
// A new submission preserves the rejected text and vote as a separate historical record.
function billResubmissionCheck(l){
    if(!l || l.status!=='FAILED' || l.applied)return {allowed:false,message:'Vetëm projektligjet e rrëzuara dhe të pazbatuara mund të riparaqiten.'};
    if(!canActAsBillInitiator(l))return {allowed:false,message:'Riparaqitja kërkon kompetencën e propozuesit.'};
    if(l.internationalAgreementId || l.internationalProcedure)return {allowed:false,message:'Akti ndërkombëtar rishqyrtohet përmes procedurës së marrëveshjes.'};
    var vote=(l.voteHistory || []).filter(function(v){return v.passed===false && Number.isInteger(v.week) && v.week>=0 && v.week<=state.turnCount;}).at(-1);
    if(!vote)return {allowed:false,message:'Nuk ka datë të verifikueshme të votimit të rrëzuar; kërkohet shqyrtim i veçantë.'};
    var due=vote.week+2;
    if(state.turnCount<due)return {allowed:false,message:'Mund të riparaqitet më '+diplomaticDate(due)+' (2 javë pas votimit).'};
    if(state.pendingVote || weeklyProcessing)return {allowed:false,message:'Përfundoni votimin ose përpunimin e javës.'};
    if(state.laws.some(function(x){return x.revisionOf===l.id && x.status!=='WITHDRAWN';}))return {allowed:false,message:'Ky projektligj ka tashmë një riparaqitje. Ndiqni versionin e ri.'};
    return {allowed:true,message:'Mund ta riparaqitni si draft të ri. Shqyrtimi dhe shumica e nevojshme mbeten të detyrueshme.'};
}
function resubmitRejectedBill(i){
    var l=state.laws[i],check=billResubmissionCheck(l);if(!check.allowed){showToast(check.message);return false;}
    if(!assertAssemblyFunctional('Riparaqitja e projektligjit'))return false;
    if(l.annualBudgetYear)return fiscalAnnualBudgetForm(l.id);
    var before=JSON.stringify(state);
    try{
        var draft={id:'resubmitted:'+ (++state.billCounter),revisionOf:l.id,title:l.title,desc:l.desc,ministry:l.ministry,sector:l.sector,field:l.field,proposer:l.proposer,costB:l.costB,duration:l.duration,approvalEffect:l.approvalEffect || 0,status:'DRAFT',supportParties:[state.playerParty],stageHistory:[],voteHistory:[],applied:false};
        initializeCatalogBill(draft);draft.source='Dokument i simuluar — pa burim ligjor real të verifikuar';if(l.catalogId)draft.catalogId=l.catalogId;if(l.legalEffectMode==='PROCEDURAL')draft.legalEffectMode='PROCEDURAL';draft.govRequired=!!l.govRequired || draft.govRequired;draft.majorityType=l.majorityType || 'SIMPLE_61';draft.requiredVotes=l.requiredVotes || 61;
        if(l.constitutionChange)draft.constitutionChange=JSON.parse(JSON.stringify(l.constitutionChange));
        if(l.constitutionalRequirement)draft.constitutionalRequirement=JSON.parse(JSON.stringify(l.constitutionalRequirement));
        state.laws.unshift(draft);state.historyLog.unshift(state.year+' [Kuvend]: U riparaqit si draft '+draft.title+'. Votimi i mëparshëm ruhet.');
        if(!saveGameAuto())throw Error('Ruajtja dështoi.');
    }catch(e){state=JSON.parse(before);showToast(e.message);return false;}
    refreshAllUI();catalogBillDetails(0);return true;
}
function catalogBillDetails(i) {

    var l=state.laws[i];if(!l)return;if(sovereignLaw(l))return openSovereignFund();
    var actions='';
    function button(text,code){return '<button class="action-btn" onclick="'+code+'">'+text+'</button>';}
    if(l.status==='PASSED' && l.legalEffectMode==='PROCEDURAL')actions+=button('Shqyrto masat praktike të zbatimit','openSectorLawExecution(\''+l.id+'\')');
    if(l.status==='FAILED'){var retry=billResubmissionCheck(l);actions+='<p>'+catalogEscape(retry.message)+'</p>';if(retry.allowed)actions+=button('Rishiko dhe riparaqit në Kuvend','resubmitRejectedBill('+i+')');}
    if(l.catalog13 && l.status==='DRAFT' && canActAsBillInitiator(l)){
        if(l.govRequired && ['DRAFT','RETURNED'].includes(l.govStage))actions+=button('Paraqit për shqyrtim në Qeveri','catalogGovernmentDecision('+i+',\'REVIEW\')');
        if(l.govStage==='REVIEW') ['APPROVED','RETURNED','REJECTED'].forEach(function(s){actions+=button(({APPROVED:'Mirato për Kuvend',RETURNED:'Kthe për plotësim',REJECTED:'Refuzo'})[s],'catalogGovernmentDecision('+i+',\''+s+'\')');});
        if(!l.govRequired || l.govStage==='APPROVED')actions+=button('Dërgo në Kuvend','submitBillToAssembly('+i+');openGovernmentCatalog()');
        if(['DRAFT','RETURNED'].includes(l.govStage))actions+=button('Plotëso tekstin','catalogRevise('+i+')');
    }
    if(l.status==='SUBMITTED')actions+=button('Fillo shqyrtimin parlamentar','sendBillToReview('+i+');openGovernmentCatalog()');
    if(l.catalog13 && l.status==='UNDER_REVIEW'){
        actions+=button('Zhvillo debatin','catalogDebate('+i+')')+button('Propozo amendament','catalogAmend('+i+')')+button('Cakto për seancë','scheduleBillForSession('+i+');openGovernmentCatalog()');
    }
    if(lawNegotiationEligible(l))actions+=button('Negocio mbështetjen','openLawNegotiations('+i+')');
    if(l.status==='SCHEDULED')actions+=button('Nis votimin','voteLawInAssembly('+i+')');
    if(l.catalog13 && canActAsBillInitiator(l) && !['PASSED','FAILED','WITHDRAWN'].includes(l.status))actions+=button('Tërhiq projektligjin','catalogWithdraw('+i+')');
    document.getElementById('interactiveActionModalContent').innerHTML='<div class="catalog13"><h2>'+catalogEscape(l.title)+'</h2><p>'+catalogEscape(catalogStage(l))+' · '+(l.status==='PASSED'?'Ligj':'Projektligj')+' · Versioni '+(l.version||1)+'</p><p>'+catalogEscape(l.desc)+'</p><p>Propozuesi: '+catalogEscape(l.proposer)+' · Ministria: '+catalogEscape(l.ministry)+' · Sektori: '+catalogEscape((state.stateSectors.find(function(s){return s.id===l.sector;})||{}).name||l.sector)+'</p>'+catalogImplementationDetails(l)+'<p>'+catalogEscape(l.govOpinions||'')+'</p><p>'+catalogEscape(l.debateText||'Debati ende nuk është zhvilluar.')+'</p><p>'+catalogEscape(l.lastVoteResult||'')+'</p><p>'+catalogEscape(l.failureReason||'')+'</p><h3>Amendamentet</h3>'+(l.amendments||[]).map(function(a,n){return '<p>'+catalogEscape(a.text)+' · '+catalogEscape(({PENDING:'Në pritje',ACCEPTED:'I pranuar',REJECTED:'I refuzuar'})[a.status])+'</p>'+(a.status==='PENDING'?button('Prano','catalogResolveAmendment('+i+','+n+',true)')+button('Refuzo','catalogResolveAmendment('+i+','+n+',false)'):'');}).join('')+'<div class="candidate-actions">'+actions+'</div><button class="action-btn" onclick="openGovernmentCatalog()">Kthehu në katalog</button></div>';
    toggleModal('interactiveActionModal',true);
}
function catalogGovernmentDecision(i,decision) {
    if(!assertGovernmentAuthority('Vendimi i Qeverisë'))return false;
    var l=state.laws[i];if(!l || l.status!=='DRAFT' || !l.govRequired)return false;
    if(decision==='REVIEW'){
        if(!['DRAFT','RETURNED'].includes(l.govStage))return false;
        l.govStage='REVIEW';l.govReviewTurn=state.turnCount;
        l.govOpinions=state.ministries.map(function(m){return m.name+': '+(m.risk>25?'Kërkon transparencë dhe ndryshime në planin e zbatimit.':m.competence<80?'Kërkon sqarim të kapaciteteve.':'Mbështet qëllimin; kërkon mbulim buxhetor.');}).join('\n');
    }else{
        if(l.govStage!=='REVIEW' || state.turnCount<=l.govReviewTurn){showToast('Shqyrtimi qeveritar kërkon të paktën një javë.');return false;}
        if(!['APPROVED','RETURNED','REJECTED'].includes(decision))return false;
        if(decision==='APPROVED' && l.costB>state.budgetTotalB){showToast('Mungojnë fondet për koston e propozuar.');return false;}
        l.govStage=decision;if(decision==='REJECTED'){l.status='FAILED';l.failureReason='Refuzuar me vendim të Qeverisë në simulim.';}
    }
    l.stageHistory.push({stage:l.govStage,week:state.turnCount});catalogCommit();return true;
}
function catalogRevise(i) {
    if(!assertBillInitiator(state.laws[i]))return false;
    var l=state.laws[i];if(!l || l.status!=='DRAFT' || !['DRAFT','RETURNED'].includes(l.govStage))return;
    var text=prompt('Përmbajtja e plotësuar e projektligjit:',l.desc);if(!text || !text.trim())return;
    l.desc=text.trim().slice(0,5000);l.version++;catalogCommit();
}
function catalogDebate(i) {
    if(!assertAssemblyFunctional('Debati parlamentar'))return false;
    var l=state.laws[i];if(!l || l.status!=='UNDER_REVIEW')return false;
    l.debated=true;l.debateText=Object.keys(state.parties).map(function(p){return p+' ('+state.mps.filter(function(m){return m.party===p;}).length+' deputetë aktivë): '+((l.supportParties||[]).includes(p)||(l.govRequired&&state.coalitionParties.includes(p))?'mbështet projektligjin.':'kundërshton koston dhe kërkon ndryshime.');}).join('\n');catalogCommit();return true;
}
function catalogAmend(i) {
    if(!assertAssemblyFunctional('Propozimi i amendamentit'))return;
    var l=state.laws[i];if(!l || !l.catalog13 || l.status!=='UNDER_REVIEW')return;
    var text=prompt('Teksti që i shtohet versionit të votuar (pa ndryshim të kostos):');if(!text || !text.trim())return;
    l.amendments.push({text:text.trim().slice(0,2000),status:'PENDING',turn:state.turnCount});catalogCommit();
}
function catalogResolveAmendment(i,n,accepted) {
    if(!assertAssemblyFunctional('Shqyrtimi i amendamentit'))return false;
    var l=state.laws[i],a=l && l.amendments[n];if(!a || a.status!=='PENDING' || l.status!=='UNDER_REVIEW')return false;
    a.status=accepted?'ACCEPTED':'REJECTED';if(accepted){l.desc+='\nAmendament: '+a.text;l.version++;}catalogCommit();return true;
}
function catalogWithdraw(i) {
    if(!assertBillInitiator(state.laws[i]))return false;
    var l=state.laws[i];if(!l || !l.catalog13 || ['PASSED','FAILED','WITHDRAWN'].includes(l.status))return false;
    if(isSpecialRepealLaw(l)&&state.brusselsSpecial.repeal?.lawId===l.id)return withdrawSpecialDraft(l);
    l.status='WITHDRAWN';l.stageHistory.push({stage:'WITHDRAWN',week:state.turnCount});catalogCommit();return true;
}
function catalogFund(x) {
    if(x.municipalityId&&municipalAusterity(state)){showToast('FMN: investimet komunale jane ngrire.');return false;}
    if(x.municipal14 && !x.fundingCommitted){
        var metricError=municipalFundingMetricError(state,x.municipalityId,{[x.metric]:x.metricGain});
        if(metricError){showToast(metricError);return false;}
    }
    migrateGovernmentCatalog(state);
    if(state.governmentCatalog.ledger.some(function(e){return e.id===x.id;}))return true;
    var authorization=fiscalSpendingCheck(x.costB,fiscalCatalogIsCapital(x));if(!authorization.allowed){showToast(authorization.message);return false;}
    if(!Number.isFinite(x.costB) || x.costB<0 || x.costB>state.budgetTotalB){showToast('Mungojnë mjetet për zbatimin.');return false;}
    fiscalSetBalance(state,"budgetTotalB",+(state.budgetTotalB-x.costB).toFixed(9),"catalogFund",fiscalCatalogIsCapital(x)?'CAPITAL_PAYMENT':'EXPENSE');
    state.governmentCatalog.ledger.push({id:x.id,title:x.title,costB:x.costB,date:diplomaticDate(state.turnCount)});if(state.governmentCatalog.projects.includes(x))registerRogueTender('CAT|'+x.id,x.sector,state.publicFinance.ledger.at(-1).id);return true;
}
function startCatalogImplementation(law) {
    if(sovereignLaw(law))return;
    if(typeof courtLawFrozen==='function'&&courtLawFrozen(law,state))return;
    if(law.legalEffectMode==='PROCEDURAL')return;
    if(law.implementation || !catalogFund(law))return;
    if(!law.duration)law.duration=8;
    law.implementation={startDate:diplomaticDate(state.turnCount),startTurn:state.turnCount,deadlineTurn:state.turnCount+(law.duration||8),lastTurn:state.turnCount,elapsed:0,progress:0,status:'ACTIVE'};
    law.stage='Ligj i miratuar — në zbatim';
}
function approveCatalogProject(i) {
    if(state.governmentCatalog.projects[i]?.municipal14)return municipalProjectAction(state.governmentCatalog.projects[i].id,'FUND');
    if(!assertGovernmentAuthority('Miratimi i projektit'))return false;
    var p=state.governmentCatalog.projects[i];if(!p || p.status!=='PLANNED')return false;
    if(state.turnCount<=p.createdTurn){showToast('Shqyrtimi i projektit kërkon të paktën një javë.');return false;}
    var beforeApproval=JSON.stringify(state);
    try {
    if(!catalogFund(p))return false;
    p.status='ACTIVE';p.startDate=diplomaticDate(state.turnCount);p.startTurn=state.turnCount;p.lastTurn=state.turnCount;p.deadlineTurn=state.turnCount+p.duration;p.elapsed=0;p.progress=0;
    if(!saveGameAuto())throw Error('Ruajtja e projektit dështoi.');
    } catch(error) {
        state=JSON.parse(beforeApproval);
        showToast('Projekti nuk u ruajt; financimi u kthye në gjendjen e mëparshme.');
        return false;
    }
    catalogCommit();return true;
}
function processGovernmentCatalogWeek() {
    migrateGovernmentCatalog(state);
    processMunicipalDevelopmentWeek();
    if(typeof processLawImplementationWeek==='function')processLawImplementationWeek();
    var work=state.governmentCatalog.projects.filter(function(p){return !p.municipal14 && p.status==='ACTIVE';}).map(function(p){return {x:p,job:p};});
    state.laws.forEach(function(l){if(l.implementation && l.implementation.status==='ACTIVE')work.push({x:l,job:l.implementation});});
    work.forEach(function(item){var x=item.x,j=item.job;if(j.lastTurn>=state.turnCount)return;j.lastTurn=state.turnCount;
        if(state.governmentFormed && !(x.municipalityId&&municipalAusterity(state)) && !(typeof executiveChainBlocked==='function'&&executiveChainBlocked(x)) && !(typeof courtLawFrozen==='function'&&courtLawFrozen(x,state)) && !(typeof streetSectorBlocked==='function' && streetSectorBlocked(x.sector,state.turnCount,state))){var before=j.progress||0;j.elapsed=Math.min(x.duration||8,j.elapsed+(x===j&&!x.winterEnergyGreen?rogueProjectStep('CAT|'+x.id,'CAT',(x.duration||8)-j.elapsed):1));j.progress=Math.min(100,j.elapsed/(x.duration||8)*100);var delta=(j.progress-before)/100;
            var sector=state.stateSectors.find(function(s){return s.id===x.sector;});if(sector)sector.score=clamp(sector.score+8*delta,10,100);
            adjustPublicSupport((x.approvalEffect||0)*delta, {source:'implementation:'+x.id,sectorId:x.sector,implemented:true});
            if(j.progress===100){j.status='COMPLETED';if(x.winterEnergyGreen)x.completedTurn=state.turnCount;}
        }
        if(j.status!=='COMPLETED' && state.turnCount>j.deadlineTurn && !j.overdueNotified){j.overdueNotified=true;addMediaNews('Kalendari i shtetit','Afati i zbatimit u tejkalua: '+x.title+'. Puna kërkon Qeveri funksionale.','CRITICAL');}
    });
}
// Templates describe fictional initiatives, regardless of earlier source labels.
LAW_CATALOG.forEach(function(l){l.source='Projektligj i simuluar — pa burim zyrtar të verifikuar';l.historicNote='Rregullat e këtij propozimi janë simulim.';});
if(typeof initializeSectorLawCatalog==='function')initializeSectorLawCatalog();
