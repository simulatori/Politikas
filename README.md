# Republika — paketa për GitHub

Përditësuar më **9 nëntor 2026**, cache PWA **v87**. Përfshin zgjerimin e 15 sektorëve me 45 politika dhe 45 ndërtime, efektet fiskale dhe krizat përkatëse, Regjistrin e Kuadrove, Bombën Mediatike, Mega-Projektin e Autostradës, AKP/Fondin Sovran, Grevën e Trepçës, RTK-në, Komisionin Hetimor të Rrymës dhe të gjitha varësitë aktuale të lojës.

Ngarko **përmbajtjen e folderit publikim** në rrënjën e repository-t. index.html duhet të jetë direkt aty, bashkë me JavaScript, CSS, manifestin, service worker-in, ikonat dhe folderin data. Mbaje .nojekyll. Nuk kërkohet build ose instalim paketash. Për GitHub Pages, zgjidh branch-in dhe folderin ku i vendos këta skedarë.

Rrjedha paszgjedhore përfshin ftesën për negociata/mandatim, kalimin nga 120 mandatet te konstituimi dhe filtrimin e njoftimeve sipas rolit. Mungesa e të dhënave gjinore nuk ngrin lojën; votat dhe emrat mbeten të kontrolluar.

Ekrani hyrës përdor PNG-në zyrtare transparente `assets/logo.png` (1200×675, rreth 348 KB), preload me prioritet të lartë, skripte `defer` dhe sfond statik. Panelet e lojës renderohen kur lojtari hyn. Ikonat Apple, favicon dhe PWA janë krijuar nga e njëjta logo zyrtare. Përfshi edhe folderin `assets` gjatë ngarkimit në GitHub.

Mysafirët vazhdojnë me ruajtje lokale. Firebase ofron Google Auth dhe ruajtje manuale në Cloud; autosave nuk shkruan në Firestore. Nëse mungon, shto domain-in e faqes te Authorized domains në Firebase Auth. firestore.rules duhet publikuar edhe në Firebase; ngarkimi në GitHub nuk i aktivizon rregullat në Firebase.

PAKETA.json përmban madhësitë dhe SHA-256 të skedarëve të aplikacionit. Paketa nuk përmban ruajtje personale, teste, backups ose çelësa privatë. Konfigurimi publik i Firebase përfshihet për funksionimin e hyrjes.

Logoja zyrtare dhe ikonat përfshihen në paketë. Splash-i përdor sfond statik dhe nuk pret shkarkimin e fotografive të institucioneve.

Për sinkronizime të ardhshme ekzekuto nga projekti kryesor: node tools/build-publication.cjs. Skripti kopjon runtime-in dhe rifreskon manifestin e hash-eve. Versioni i ri offline aktivizohet kur mbyllen dritaret me cache-in e vjetër.

Versioni v41 përfshin mbështetjen e partisë të ndarë nga miratimi i Qeverisë, hapjen e menjëhershme të menysë, konstituimin pa vonesa artificiale, ftesat nga U.D., kundërofertat dhe votimin e kabinetit alternativ, kufizimin e veprimeve ekzekutive sipas rolit dhe navigimin me maus. Përfshi skedarët e rinj landing-shell.js dhe governance-flow.js.

Versioni v42 lidh Çkyçu me ekranin e hyrjes. Hyrja me Google pas çkyçjes vazhdon gjendjen lokale; Cloud ngarkohet vetëm me zgjedhje të lojtarit. Java tjetër të çon te Qendra e Situatës pasi kërkesa pranohet. Cloud autosave mbetet i çaktivizuar.

Versioni v43: Vazhdo si mysafir hap menjëherë menunë Vazhdo Lojën Lokale / Lojë e Re, pa Google ose Firebase. Sesioni guest regjistrohet lokalisht. Ruajtja e bllokuar ose autosave-i i palexueshëm nuk e bllokon hapjen e menusë; skedari i vjetër nuk fshihet automatikisht. Lojë e Re hap skenarët drejtpërdrejt gjatë sesionit guest.

Versioni v44: media të blershme/subvencionuara nga partitë, skandale që zhvendosin sondazhet, emërime kabineti pa Kryeministrin ose persona të dyfishtë, ministri të rezervuara për partnerët, ftesa pa vetë-ftim, sindikata me mesazhe të dukshme gabimi, vazhdimi i të gjitha pikave të seancës, përparësi për 10/30 kandidatët e parë, Regjistri i Kuadrove me një kalim në katalog dhe slote lokale të kompresuara pa humbje. Përfshi political-systems-update.js dhe media-market.js. Slotet e vjetra JSON mbeten të lexueshme; kopjet JSON shkarkohen/ngarkohen nga menuja e ruajtjeve.

Versioni v45: u zgjidh dështimi i raportuar i testit të Vettingut. Kriza e eksodit ndalte javën e 16-të, ndërsa testi e numëronte tentimin si javë të kaluar. Paneli tani shpjegon bllokimin dhe hap vendimin urgjent; pas zgjidhjes, Vettingu përfundon me 16 javë financimi. Progresi ruhet, pagesat nuk dyfishohen dhe fondi i BE-së arkëtohet vetëm një herë.

Versioni v46: Lojë e Re → Vazhdo si mysafir hap drejtpërdrejt zgjedhjen e skenarit, pa kërkuar klikim të dytë te Lojë e Re. Zgjedhja ruhet edhe kur skriptet ende ngarkohen; nuk kërkon Firebase ose token Google.

Versioni v47: tri nisma te Makroekonomia dhe Agjenda e Kuvendit — Obligacionet e Diasporës (€200–500M, 5% interes dhe 96 javë maturitet), zgjerimi i Byrosë ekzistuese (€150M pas Vettingut dhe zbatimit, një herë) dhe Zonat e Lira (licencë €25–150M, 0% tatim për partnerin për 240 javë). Përdoren borxhi, Gjykata, koalicioni, ledger-i dhe investitorët ekzistues; nuk ka arkëtim nga draftet ose pagesa të dyfishta. Përfshi strategic-economy.js.


Paketa v48: menaxhim i mediave, konferenca me dropdown, takime tematike dhe premtime me detyrime pas formimit të qeverisë. Përfshi skedarin e ri political-engagement.js dhe service-worker.js (cache v48).


v49: header mobile me grid 2x2, profil kompakt me ikona Cloud, hapesire per Javen Tjeter dhe etiketa te plota ne navigimin e poshtem.


v50: profil me menu, panel mobile kompakt dhe navigim 5x2 me te gjitha skedat, Mjetet dhe Urgjencat. Asnje buton urgjence mbi permbajtje ne mobile. Mbyll dritaret e vjetra te lojes per aktivizimin e cache v50.


v51: profil prane logos me menu qe mbyllet jashte/Escape, header me pak lartesi, navigim 100px dhe lajm qe zgjerohet me prekje. Verifikuar ne 332x645, 320px, 400px dhe 767px.


v52 (2026-11-05): Cloud me RKS-LZW1:U16, raporte sekrete me delegim klikimesh, efekt afatgjate i arsimit te financuar, autostrada mes komunave me tri tendera/riparime, takime politike me tri faza dhe efekte ne vota/buxhet/raporte. Perfshi executive-strategy.js dhe te gjitha integrimet e kesaj pakete. Rregullat Firestore mbeten te njejta.


v53: AAK me Ardian Gjinin; Ramush Haradinaj kandidat presidencial i vecante; emra pa shenime ne kllapa; demografi/familje me financim real; prodhim vendor dhe bilanc tregtar; Pasurite Kombetare me fabrike 20-javore dhe dilemen qymyr/gjelber. Perfshi modulin e ri living-state.js dhe te gjitha integrimet.


v54: Qeveria -> Fushat e Qeverisjes. Banesa sociale/urbanizim, arsim teknik dhe mjekesor, paga me slider, prioritete rrugore/hekurudhore, miks energjetik, krim/patrullime/dosje AKI dhe ndarje Komando/Pajisje e FSK-se. Perfshi governance-fields.js dhe te gjitha integrimet e kesaj pakete.

Prodhimi dhe Resurset (v55): pese sektore fizike me nivele 1-5, ndertime me afat, paga, greve, punesim, importe dhe eksporte javore. Yjet ekzistues te sherbimeve ruhen. Ruajtjet e vjetra kane aktivizim te shprehur ne panel.

V57: tete sektore fizike, centrale sipas teknologjise dhe miks KEK i lidhur me ndertimet e perfunduara; zinxhir Miniera-Industri, kosto jetese, subvencione, automatizim dhe bashkefinancim BE. Aktivizimi eshte automatik edhe per ruajtjet e vjetra.

V58: Prodhimi, Reformat dhe Transporti jane seksione kryesore; buton global Mbrapa; shqyrtim ligjesh 1-2 jave; aktivizim vjetor i buxhetit me bartje; flota autobusesh/taksish/trenash/avionesh me kushte reale te simulimit dhe flukse javore.

V60: transport i balancuar; 10 autobuse standarde kushtojne 2M EUR, 50k/jave operim dhe 70k/jave te hyra ne baze. Kontroll rezerve 10-javore per gjithe floten, fitim neto ne preview, histori e vjeter e ruajtur.

V61: Fondi Patriotik / Kuizi Historik. 20 pyetje me burime, 5 pyetje per vit, 500M EUR per pergjigje te sakte dhe 3B EUR gjithsej per 5/5. Progresi dhe pagesat ruhen; rifreskimi nuk perserit shperblimet.

V62: Prodhimi dhe Resurset me depo, miniera hekuri/ari/nafte, furnizim prioritar MW, ndalim te prodhimit pa energji, shtate hapa ditore brenda javes dhe filtra ne kartat ekzistuese. Pagesat mbeten ne regjistrin e vetem fiskal.

V63: Depoja Qendrore ne krye te Prodhimit, karta te dukshme Ushqim/Hekur/Naftë/Ari, lidhje direkte te ndertimet dhe liste e furnizimit energjetik per cdo ndertese.

V64: Sherbimet Shteterore dhe Dokumentet te Shteti, dizajni live i pasaportes, ligji unik i identitetit digjital, tenderi dhe tarifat javore me validim/ruajtje ne sistemin ekzistues.

V65: Pasaporte dhe leternjoftim te ndara me stemen zyrtare nga assets/stema-kosoves.png. Nje jave pas miratimit te ligjit, pastaj nje jave pergatitje pas tenderit. Preview nuk nenkupton dokument aktiv; nuk ka te hyra para operimit.

V66: Sherbimet Shteterore eshte seksion me vete poshte Qeverise. Gjendja Civile menaxhon leternjoftim, pasaporte dhe patente: taksa riperteritjeje, afate 5/10 vjet, radhe, humbje 20% dhe digjitalizim E-Kosova. Paketa tani ka TRE grupe; ngarkoji te gjitha sipas radhes.

V67: Harta skematike interaktive e 38 komunave, shtresa politike/ekonomike dhe kujtese e elektoratit per projekte, premtime dhe skandale. Efektet jane lokale ose nacionale, zbehen dhe ngrihen ne snapshot-et zgjedhore; nuk ndryshojne votat historike. Ngarko te TRE grupet.

V68: Partia > Rivalet & Strategjite. NPC-te paguajne veprimet nga fondet reale te partive, reagojne ndaj skandaleve, negociojne dhe financojne fushata lokale. Qeveria AI financon projekte permes procedurave dhe rezerves fiskale ekzistuese. Ngarko te TRE grupet.

V69: Rregullohet ngarkimi i ligjeve te pezulluara ne Kushtetuese. Miratimi parlamentar nuk i shenon me automatikisht si te zbatuara gjate migrimit. Kalojne kontrollet e ruajtjes, koalicionit, zbatimit standard, Vettingut dhe Mergates, perfshire dy testet mobile. Skenaret e vjeter te testeve u pershtaten me krizat dhe ekonomine aktuale; rregullat e lojes mbeten aktive. Ngarko te TRE grupet.

V70: Qeveria > Buxheti & Ekonomia: pasqyra javore e arkes me hyrje, dalje dhe arsyet. Raporti pajtohet me transaksionet reale, perfshire pagesat para/pas tick-ut; huamarrja dhe transferimet dallohen nga fitimet. Testohen reload, mosdyfishimi dhe pamja mobile. Ngarko te TRE grupet.

V71: Ari/nafta nuk llogariten si hekur ne parashikimin e industrise se rende. Depoja perdor prodhimin realisht te konfirmuar nga pagesat javore; subvencionet e papaguara nuk fryjne sasite. Ruajtjet e vjetra pranohen pa riprodhim ose para retroaktive. Kalojne testet e prodhimit dhe dy kontrollet browser. Ngarko te TRE grupet.

V72: Qendra e Situates tregon rastet qe e ndalin javen dhe butonat per vendimin perkates. Skandalet ministrore RNG kane tri jave orientimi dhe tri jave distance pas vendimit; pasojat direkte nuk hiqen. Ndalohen retry-t e kotta kur nuk ka skandal. Testet e reja dhe browser kalojne; dy teste te vjetra mbeten te dokumentuara te CRISIS-PACING-V72.md. Ngarko te TRE grupet.

V73: Rregullohet dividendi i koncesionit te Trepces me prodhimin fizik aktiv, pa rikthyer subvencionin e dyfishte dhe pa pagesa retroaktive. Standardizohen butonat e Samitit. Te dy testet e mbetura nga V72 tani kalojne; testi i vjeter i bordeve mbetet per auditim sipas TREPCA-URGENT-V73.md. Ngarko te TRE grupet.

V74: Ristrukturimi fizik perfundon ne afatin e vet. Bordet partiake ulin mirembajtjen e minierave/energjise 25%; ekspertet pas 8 javesh dhe ristrukturimi individual pas afatit e ulin 50%, pa grumbullim dhe pa dividend te dyfishte. Paneli tregon flukset aktuale. Testet e bordeve dhe browser tani kalojne. Ngarko te TRE grupet.

V75: Privatizimi i minierave/energjise ndal flukset e tyre operative publike dhe kreditimin e depos shteterore, duke ruajtur kapacitetet fizike ne ekonomi. Komandat e financimit publik bllokohen; privatizimi pret perfundimin e investimeve ne ndertim. Testohen shitja nje here, java pasuese, reload dhe pamja responsive. Ngarko te TRE grupet.

V76: Te Ruajtjet shfaqet statusi i perditesimit dhe shenja Version i ri. Kontroll manual dhe ruajtje lokale para mbylljes, pa reload ose aktivizim te detyruar. Testohen dy skeda, aktivizimi pas mbylljes, publikimi i paplote, ruajtjet e pandryshuara dhe hapja offline. Ngarko te TRE grupet.

V77: Qeveria > Buxheti & Ekonomia > Negocio projektbuxhetin. Kerkesat e 15 ministrive financohen, shtyhen ose refuzohen brenda paketes se kufizuar; perdoret i njejti ligj buxhetor. Premtimet ndiqen pas miratimit dhe financimit real, me transferime brenda totalit dhe pasoja te grupet/koalicioni. Paketa perfshin modulin e ri budget-battle.js. Ngarko te TRE grupet sipas radhes.

V78: Qeveria > Kabineti & Ministrat: raport performance cdo 8 jave aktive, mbi financimin/projektet/skandalet reale. Mbaje, kerko permiresim ose zevendeso nga kandidatet ekzistues. Aftesia/besnikeria ndikojne punimet sektoriale me prove financimi; eksperti i nenfinancuar mund te largohet. Ruajtje dhe teste responsive; paketa perfshin minister-performance.js. Ngarko te TRE grupet sipas radhes.

V79: Mjetet e Lira > Ku shkuan parate? Hap regjistrin javor te pagesave, historine dhe panelin perkates. Qendra e Situates tregon afatet ekzistuese dhe permbledhjen; krizat renditen sipas urgjences dhe hapen nje nga nje. Skandalet rastesore te te njejtit minister kane pushim 12-javor. Moduli i ri weekly-control.js perfshihet ne cache dhe publikim. Shih WEEKLY-CONTROL-V79.md per testet dhe dy kufizimet ekzistuese te testeve te vjetra. Ngarko te TRE grupet sipas radhes.

V80: Shteti > Si te gjykon elektorati: arsye konkrete per grupet, kujtese e vendimeve dhe besueshmeri e premtimeve. Ne opozite, Shtabi i Partise > Qeveria ne Hije (edhe butoni te Partia): kuadro ekzistuese, alternativa/raporte me afat, vetem fonde partie, prova publike dhe pervoje per kabinetin e ardhshem. Modulet e reja political-accountability.js dhe shadow-cabinet.js. Shih POLITICAL-ACCOUNTABILITY-V80.md per rregullat, testet dhe kufizimet ekzistuese. Ngarko te TRE grupet sipas radhes.

V81: Qeveria > Qeverisja Strategjike: rezerva/furnizim, besim dhe zotime koalicioni, funksionalizim pas ndertimit, parashikim 12-javor dhe rrjet ndikimi fiktiv me zbulim gradual. Perdoren depot, partite, projektet, faturat dhe votimet ekzistuese. Shih STRATEGIC-SIMULATION-V81.md. Perfshihen gjashte modulet e reja dhe kontrollet e pershtatura me hapjen reale te objekteve. Ngarko te TRE grupet sipas radhes.
