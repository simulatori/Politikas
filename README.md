# Republika — paketa për GitHub

Përditësuar më **5 nëntor 2026**, cache PWA **v57**. Përfshin zgjerimin e 15 sektorëve me 45 politika dhe 45 ndërtime, efektet fiskale dhe krizat përkatëse, Regjistrin e Kuadrove, Bombën Mediatike, Mega-Projektin e Autostradës, AKP/Fondin Sovran, Grevën e Trepçës, RTK-në, Komisionin Hetimor të Rrymës dhe të gjitha varësitë aktuale të lojës.

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
