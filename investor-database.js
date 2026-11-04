/* Fictional firms and simulated global-company projects. Amounts are scenario parameters. */
function makeFDIInvestor(id,company,family,tier,country,project,capitalM,cofinanceM,jobs,weeklyTaxM){
    const rules={1:{security:3,education:3,primary:3,publicWeeks:2,stableWeeks:2,deadline:12,executionWeeks:4,relief:0,approval:1.5,penalty:2},2:{security:5,education:4,primary:5,publicWeeks:4,stableWeeks:4,deadline:18,executionWeeks:7,relief:.35,approval:3,penalty:4},3:{security:7,education:7,primary:7,publicWeeks:7,stableWeeks:6,deadline:24,executionWeeks:11,relief:.5,approval:5,penalty:6},4:{security:8.01,education:8.01,primary:8,publicWeeks:10,stableWeeks:10,deadline:30,executionWeeks:16,relief:.5,approval:8,penalty:8}}[tier];
    return {id,company,family,tier,country,project,capitalB:capitalM/1000,cofinanceB:cofinanceM/1000,jobs,weeklyTaxB:weeklyTaxM/1000,lawRequired:tier>1,...rules};
}
const FDI_INVESTORS=[
    makeFDIInvestor('agrobalkan','AgroBalkan Invest','AGRIFOOD',1,'Rajoni','Qendër grumbullimi dhe përpunimi të frutave',25,2,600,.025),
    makeFDIInvestor('kosovatex','KosovaTex','MANUFACTURING',1,'Rajoni','Punëtori industriale për veshje dhe tekstile',35,3,950,.035),
    makeFDIInvestor('balkan-logistics','Balkan Logistics','LOGISTICS',1,'Rajoni','Depo shpërndarjeje dhe transport rajonal',30,2.5,700,.03),
    makeFDIInvestor('drini-components','Drini Components','MANUFACTURING',1,'Rajoni','Linjë prodhimi për pjesë metalike',45,4,850,.045),
    makeFDIInvestor('adria-soft','AdriaSoft Studio','TECH',1,'Rajoni','Qendër zhvillimi të programeve kompjuterike',22,2,500,.04),
    makeFDIInvestor('vardar-solar','Vardar Solar','ENERGY',1,'Rajoni','Park solar dhe shërbime të mirëmbajtjes',55,5,550,.055),
    makeFDIInvestor('prizren-foodworks','Prizren FoodWorks','AGRIFOOD',1,'Rajoni','Fabrikë paketimi dhe konservimi ushqimor',40,3,800,.04),
    makeFDIInvestor('europarts','EuroParts Dynamics','MANUFACTURING',2,'Evropë','Fabrikë për montimin e pjesëve të veturave',180,15,4500,.28),
    makeFDIInvestor('greenwatt','GreenWatt Energy','ENERGY',2,'Evropë','Park energjetik me bateri akumuluese',220,20,1800,.3),
    makeFDIInvestor('buildcore','BuildCore Europe','MANUFACTURING',2,'Evropë','Fabrikë panelesh dhe materialesh ndërtimore',150,12,2500,.18),
    makeFDIInvestor('autokassel','AutoKassel GmbH','MANUFACTURING',2,'Evropë','Linjë montimi për sisteme elektronike të veturave',200,15,4200,.3),
    makeFDIInvestor('danube-coldchain','Danube ColdChain','LOGISTICS',2,'Evropë','Terminal frigoriferik dhe qendër eksporti',120,10,2200,.15),
    makeFDIInvestor('alpine-cloudworks','Alpine CloudWorks','TECH',2,'Evropë','Qendër shërbimesh cloud dhe mbështetjeje teknike',160,12,3000,.25),
    makeFDIInvestor('adriatic-agrotech','Adriatic AgroTech','AGRIFOOD',2,'Evropë','Kompleks përpunimi dhe teknologjie bujqësore',130,10,2800,.17),
    makeFDIInvestor('techhub','TechHub Solutions','TECH',3,'Evropë','Kampus inxhinierik dhe qendër kërkimi softuerik',380,35,6500,.65),
    makeFDIInvestor('illyria-motors','Illyria Motors','MANUFACTURING',3,'Evropë','Kompleks montimi për automjete elektrike rajonale',550,50,8000,.85),
    makeFDIInvestor('globalpharma','GlobalPharma','SERVICES',3,'Evropë','Fabrikë farmaceutike dhe laborator i kontrollit',450,40,5000,.7),
    makeFDIInvestor('balkan-energy','Balkan Energy Group','ENERGY',3,'Evropë','Kompleks energjie të ripërtëritshme dhe ruajtjeje',600,55,4500,.9),
    makeFDIInvestor('northbridge-data','NorthBridge Data','TECH',3,'Evropë','Qendër rajonale të dhënash dhe analizash',420,40,5500,.7),
    makeFDIInvestor('europa-precision','Europa Precision','MANUFACTURING',3,'Evropë','Fabrikë pajisjesh precize për eksport',350,30,6000,.55),
    makeFDIInvestor('continental-freight','Continental Freight','LOGISTICS',3,'Evropë','Terminal ndërkombëtar dhe qendër multimodale',320,30,5000,.5),
    makeFDIInvestor('legend-microsoft','Microsoft','TECH',4,'Global','Qendër rajonale të dhënash dhe kampus inxhinierik',1100,90,10000,1.5),
    makeFDIInvestor('legend-volkswagen','Volkswagen','MANUFACTURING',4,'Global','Fabrikë montimi të automjeteve dhe komponentëve',1500,100,15000,2),
    makeFDIInvestor('legend-amazon','Amazon','LOGISTICS',4,'Global','Qendër logjistike dhe teknologjike për Ballkanin',900,75,12000,1.4)
];
const FDI_FAMILIES={
    MANUFACTURING:{label:'Prodhimi',sector:'sec_econ',primary:'sec_roads',icon:'🏭',anonymous:'Një korporatë ndërkombëtare e prodhimit kërkon të hapë një fabrikë.'},
    TECH:{label:'Teknologjia',sector:'sec_tech',primary:'sec_tech',icon:'💻',anonymous:'Një kompani teknologjike kërkon një vend për shërbime digjitale dhe kërkim.'},
    ENERGY:{label:'Energjia',sector:'sec_energy',primary:'sec_energy',icon:'⚡',anonymous:'Një investitor energjetik kërkon të zhvillojë kapacitete të reja të furnizimit.'},
    LOGISTICS:{label:'Logjistika',sector:'sec_roads',primary:'sec_roads',icon:'📦',anonymous:'Një operator ndërkombëtar kërkon një qendër për shpërndarje dhe transport.'},
    AGRIFOOD:{label:'Bujqësia dhe ushqimi',sector:'sec_agri',primary:'sec_agri',icon:'🌾',anonymous:'Një grup rajonal kërkon të investojë në përpunim dhe eksporte ushqimore.'},
    SERVICES:{label:'Shëndetësia dhe industria e specializuar',sector:'sec_health',primary:'sec_health',icon:'🧪',anonymous:'Një kompani e specializuar kërkon kapacitete për prodhim dhe laboratorë.'}
};
