/* Limited, opt-in simulation. Indices and coefficients are scenario assumptions,
   not measured Kosovo statistics. Cash is owned exclusively by public-finance.js. */
const ECONOMIC_PILOT_DEFAULTS=Object.freeze({energyPrice:100,energyCapacityPerPoint:.01,industrialCapacityPerPoint:.005,costSensitivity:.25,shortagePremium:.5,outputStep:2,employmentElasticity:.35,employmentStep:.15,wageElasticity:.1,wageStep:.25,growthPerOutputPoint:.04,taxElasticity:.4});
const ECONOMIC_TAX_KEYS=['vat','incomeTax','corporateTax','customs'];
const ECONOMIC_MARKET_DEFAULTS=Object.freeze({version:1,importLimit:0,exportLimit:0,importPrice:125});
const PRODUCTIVE_DEFAULTS=Object.freeze({agricultureWeight:.25,energyIndustryWeight:.8,agricultureCapacityPerPoint:.008,agricultureCostSensitivity:.12,agricultureStep:1,productionCostShare:.6});
const HOUSEHOLD_DEFAULTS=Object.freeze({incomeElasticity:.6,priceElasticity:.4,costPassThrough:.25});
// Public strategic reserves use explicit units; never reinterpret private model units as tonnes.
const BILATERAL_PRODUCTS={wheat:{name:'Grurë',unit:'ton',price:250,weeklyUse:10000},energy:{name:'Energji',unit:'MWh',price:100,weeklyUse:5000},steel:{name:'Çelik',unit:'ton',price:600,weeklyUse:1000},technology:{name:'Teknologji',unit:'njësi',price:1000,weeklyUse:500}};
function householdEarnedIncome(employment,wage){return employment/100*wage/100;}
function householdProductionCost(p,key,energyCost){var sensitivity=key==='industry'?p.config.costSensitivity:p.productive.config.agricultureCostSensitivity;return 100*Math.max(.25,1+sensitivity*(energyCost/100-1));}
function enableHouseholdEconomy(){
    var p=state.economicPilot,x=p?.productive;if(!x || x.households)return false;
    if(['industry','agriculture'].some(function(k){return x.trade[k].unitValueB<1e-9;}) || !['industry','agriculture'].some(function(k){return x.trade[k].demand>0;})){showToast('Shporta kërkon vlera pozitive për njësi dhe kërkesë bazë. Plotësoni parametrat e tregtisë.');return false;}
    return fiscalCommit(function(){
        var employment=100-state.unemployment,gross=householdEarnedIncome(employment,p.wageIndex),net=gross*(1-p.effectiveRates.incomeTax/100),old=productiveTrade(state,p.effectiveRates,employment,p.wageIndex),payroll=economicPayroll(state,employment,p.wageIndex),cost=p.history[0]?.energyCost??p.config.energyPrice;
        var h={version:1,startTurn:state.turnCount,config:Object.assign({},HOUSEHOLD_DEFAULTS),referenceGross:gross>1e-12?gross:1,referenceNet:net>1e-12?net:1,referenceVat:p.effectiveRates.vat,demandMultiplier:.8+.2*(x.referencePayroll>0?payroll/x.referencePayroll:1),referenceValues:{},referenceCosts:{},referenceDemands:{},basketValue:0,consumptionValue:0,vatFactor:.7*payroll+.3*economicActivity(p)/100};
        ['industry','agriculture'].forEach(function(k){h.referenceValues[k]=x.trade[k].unitValueB;h.referenceCosts[k]=householdProductionCost(p,k,cost);h.referenceDemands[k]=old[k].demand;h.basketValue+=old[k].demand*x.trade[k].unitValueB;h.consumptionValue+=(old[k].local+old[k].imports)*x.trade[k].unitValueB;});
        if(h.consumptionValue<=0)h.consumptionValue=h.basketValue;
        x.households=h;state.historyLog.unshift(state.year+' [Konsumi]: U aktivizua kërkesa e financueshme dhe shporta relative e dy sektorëve; pa pagesë ose ndryshim historiku.');
    });
}
function householdDemand(st,rates,employment,wage,energyCost){
    var p=st.economicPilot,x=p.productive,h=x.households;if(!h)return null;
    var gross=householdEarnedIncome(employment,wage),net=gross*(1-rates.incomeTax/100),income=net/h.referenceNet,prices={},desired={},demand={},desiredValue=0,basketCost=0;
    if(energyCost===undefined)energyCost=p.history[0]?.energyCost??p.config.energyPrice;
    ['industry','agriculture'].forEach(function(k){
        var cost=householdProductionCost(p,k,energyCost)/h.referenceCosts[k];
        prices[k]=x.trade[k].unitValueB/h.referenceValues[k]*(1+h.config.costPassThrough*(cost-1))*(1+rates.vat/100)/(1+h.referenceVat/100);
        prices[k]*=bilateralHouseholdPriceFactor(st,k);
        desired[k]=income>0?x.trade[k].demand*h.demandMultiplier*Math.pow(income,h.config.incomeElasticity)/Math.pow(prices[k],h.config.priceElasticity):0;
        desiredValue+=desired[k]*h.referenceValues[k]*prices[k];basketCost+=h.referenceDemands[k]*h.referenceValues[k]*prices[k];
    });
    var budget=h.basketValue*income,affordability=desiredValue>0?Math.min(1,budget/desiredValue):1;
    ['industry','agriculture'].forEach(function(k){demand[k]=desired[k]*affordability;});
    var costIndex=basketCost/h.basketValue;
    var result={grossIncomeIndex:gross/h.referenceGross*100,disposableIncomeIndex:income*100,costOfLivingIndex:costIndex*100,purchasingPowerIndex:income/costIndex*100,prices:prices,desired:desired,demand:demand,affordability:affordability};
    if(![result.grossIncomeIndex,result.disposableIncomeIndex,result.costOfLivingIndex,result.purchasingPowerIndex,affordability,...Object.values(prices),...Object.values(desired),...Object.values(demand)].every(function(v){return Number.isFinite(v)&&v>=0;}) || Object.values(prices).some(function(v){return v<=0;}))throw Error('Kërkesa familjare tejkalon kufijtë numerikë.');
    return result;
}
function householdConsumptionValue(h,goods){return ['industry','agriculture'].reduce(function(s,k){return s+(goods[k].local+goods[k].imports)*h.referenceValues[k];},0);}
function householdReport(st,input,goods){
    var h=st.economicPilot.productive.households,consumed={},supply={},spending=0,requested=0;
    ['industry','agriculture'].forEach(function(k){var t=goods[k];consumed[k]=t.local+t.imports;supply[k]=t.output+t.imports-t.exports;spending+=consumed[k]*h.referenceValues[k]*input.prices[k];requested+=t.demand*h.referenceValues[k]*input.prices[k];});
    return Object.assign({},input,{consumed:consumed,supply:supply,consumptionIndex:householdConsumptionValue(h,goods)/h.basketValue*100,expenditureIndex:spending/h.basketValue*100,unspentIndex:Math.max(0,input.disposableIncomeIndex-spending/h.basketValue*100),fulfillment:requested>0?Math.min(1,spending/requested):null});
}
// Read completed reports only; rendering never advances or recalibrates the model.
function householdBasketMeasurement(st){
    var p=st?.economicPilot,h=p?.productive?.households;
    if(h===undefined)return {status:'inactive'};
    try{
        var probe=Object.assign({},st,{economicPilot:Object.assign({},p,{history:[]})});
        validateHouseholdEconomy(probe);
        if(!Array.isArray(p.history))throw Error('Historiku i shportës mungon.');
        var r=p.history[0];
        if(p.lastTurn<=h.startTurn && (!r || r.turn<=h.startTurn && r.productive?.households===undefined))return {status:'waiting',startTurn:h.startTurn};
        function validateReport(row){
            if(!row || !Number.isInteger(row.turn) || row.turn<=h.startTurn || row.turn>p.lastTurn || row.turn>st.turnCount || !row.productive?.households)throw Error('Hapi ose raporti i shportës është i pavlefshëm.');
            validateHouseholdEconomy(Object.assign({},probe,{economicPilot:Object.assign({},p,{history:[row]})}));
        }
        validateReport(r);
        if(r.turn!==p.lastTurn)throw Error('Raporti i fundit nuk përputhet me hapin e përpunuar.');
        var value=r.productive.households.costOfLivingIndex;
        var result={status:'ready',startTurn:h.startTurn,turn:r.turn,value:value,comparison:null};
        try{
            var previous=p.history[1];validateReport(previous);
            if(previous.turn!==r.turn-1)throw Error('Hapat nuk janë të njëpasnjëshëm.');
            var base=previous.productive.households.costOfLivingIndex,points=value-base,percent=(value/base-1)*100;
            if(!Number.isFinite(points) || !Number.isFinite(percent))throw Error('Ndryshimi tejkalon kufijtë numerikë.');
            result.comparison={turn:previous.turn,value:base,points:points,percent:percent};
        }catch(error){result.comparisonReason='Krahasimi me hapin e kaluar nuk është i disponueshëm: mungon një raport i vlefshëm dhe i njëpasnjëshëm.';}
        return result;
    }catch(error){return {status:'unavailable',reason:error.message};}
}
function householdBasketPanel(measurement){
    var m=measurement,n=function(v){return (Math.abs(v)<.005?0:v).toFixed(2);},signed=function(v){return (v>=0?'+':'')+n(v);};
    var html='<section id="householdBasketMeasurement" aria-labelledby="householdBasketTitle" data-status="'+m.status+'"><h4 id="householdBasketTitle">Indeksi i kostos relative të shportës</h4>';
    if(m.status==='inactive')return html+'<p>Treguesi nuk është i disponueshëm pa aktivizimin e kërkesës dhe konsumit.</p></section>';
    if(m.status==='unavailable')return html+'<p role="status">Të dhënat e shportës nuk mund të paraqiten: '+catalogEscape(m.reason)+'</p></section>';
    html+='<p>Referenca në aktivizim: <strong>100</strong> · hapi '+m.startTurn+'. Kjo është baza e modelit, jo një observim historik ose shumë në euro.</p>';
    if(m.status==='waiting')return html+'<p>Modeli i kërkesës është aktiv. Raporti i parë shfaqet pas kalimit të javës.</p></section>';
    html+='<p>Raporti i fundit i përfunduar · hapi <strong id="basketReportTurn">'+m.turn+'</strong>: <strong id="basketCostValue">'+n(m.value)+'</strong> pikë indeksi.</p>';
    if(m.comparison){var c=m.comparison;html+='<p>Kundrejt hapit '+c.turn+' (indeksi '+n(c.value)+'): <strong id="basketPointChange">'+signed(c.points)+'</strong> pikë indeksi; ndryshimi relativ <strong id="basketPercentChange">'+signed(c.percent)+'%</strong> kundrejt të njëjtit hap.</p>';}
    else html+='<p>'+m.comparisonReason+'</p>';
    return html+'<p>Shportë fikse e dy agregateve të simulimit; nuk është HICP ose inflacion zyrtar. Burimi: raporti ekonomik i lojës. Parametrat e ndryshuar pas raportit pasqyrohen në përpunimin javor, jo nga hapja e panelit.</p></section>';
}
function householdEconomyPanel(){
    var p=state.economicPilot,x=p?.productive;if(!x)return '';
    var h=x.households,measurement=householdBasketMeasurement(state),html='<details id="householdEconomyDetails"><summary>Kërkesa, konsumi dhe fuqia blerëse</summary>'+householdBasketPanel(measurement);
    if(!h)return html+'<p>Kërkesa aktuale ndjek të ardhurat si proksi. Zgjerimi i zgjedhshëm e kufizon me buxhetin blerës dhe lidh TVSH-në me konsumin e furnizuar. Përdor një shportë relative të dy sektorëve; nuk është kosto reale jetese ose statistikë historike. Aktivizimi nuk kryen pagesë dhe nuk ndryshon javët e kaluara.</p>'+(agendaExecutive()?'<button class="action-btn" onclick="enableHouseholdEconomy()">Aktivizo kërkesën dhe konsumin</button>':'')+'</details>';
    if(measurement.status!=='ready')return html+'</details>';
    var r=p.history[0],v=r.productive.households,n=function(value){return value.toFixed(2);};
    var previous=p.history[1]?.productive?.households;
    html+='<p>Hapi '+r.turn+' · Indekse relative: të ardhura neto '+n(v.disposableIncomeIndex)+'; fuqi blerëse '+n(v.purchasingPowerIndex)+'; konsum i furnizuar '+n(v.consumptionIndex)+'. Indekse të modelit, jo euro.</p>';
    if(measurement.comparison)html+='<p>Nga hapi i kaluar: të ardhurat neto '+n(v.disposableIncomeIndex-previous.disposableIncomeIndex)+' pikë; konsumi '+n(v.consumptionIndex-previous.consumptionIndex)+' pikë.</p>';
    html+='<p>'+(v.fulfillment===null?'Nuk ka kërkesë të financueshme; kjo nuk nënkupton mirëqenie ose plotësim 100%.':'Plotësim i kërkesës së financueshme: '+n(v.fulfillment*100)+'%.')+' Shpenzim relativ '+n(v.expenditureIndex)+' kundrejt buxhetit relativ '+n(v.disposableIncomeIndex)+'. Pjesa e papërdorur '+n(v.unspentIndex)+' nuk grumbullohet si depozitë bankare.</p>';
    ['industry','agriculture'].forEach(function(k){var t=r.productive.trade[k];html+='<p>'+(k==='industry'?'Mallra industriale':'Mallra bujqësore')+': kërkesë e financueshme '+n(t.demand)+'; furnizim vendas pas eksporteve plus importe '+n(v.supply[k])+'; konsum '+n(v.consumed[k])+'; mungesë '+n(t.unmet)+'; tepricë e pashitur '+n(t.unsold)+'. Njësi modeli. Indeksi relativ i çmimit '+n(v.prices[k]*100)+'.</p>';});
    html+='<p>Shkaku: '+(v.disposableIncomeIndex===0?'Pa të ardhura neto, modeli nuk krijon konsum familjar.':v.fulfillment!==null&&v.fulfillment<.999?'Furnizimi dhe importet e lejuara nuk mbulojnë të gjithë kërkesën.':v.costOfLivingIndex>100?'Kostoja relative e shportës ul sasinë që mund të blihet me të ardhurat aktuale.':'Të ardhurat neto dhe çmimet relative përcaktojnë kërkesën; prodhimi ruan kufijtë e kapacitetit dhe energjisë.')+'</p>';
    html+='<p>Pesha e shportës në aktivizim: industri '+n(h.referenceDemands.industry*h.referenceValues.industry/h.basketValue*100)+'%, bujqësi '+n(h.referenceDemands.agriculture*h.referenceValues.agriculture/h.basketValue*100)+'%. Pesha del nga kërkesa dhe vlerat e skenarit; nuk është shportë statistikore e Kosovës. Elasticiteti i të ardhurave '+h.config.incomeElasticity+', i çmimeve '+h.config.priceElasticity+'; kalim i kostove në çmim '+n(h.config.costPassThrough*100)+'%.</p><p>Kërkesa përdor punësimin dhe pagën para llogaritjes javore, me normat tatimore efektive të javës. Punësimi i ri ndikon javën pasuese. Çmimet janë proksi nga vlerat e skenarit, kostot prodhuese dhe TVSH-ja; nuk zëvendësojnë inflacionin. Konsumi është vetëm nga mallrat e furnizuara. Nuk shtohen para në arkë nga shpenzimi familjar: TVSH-ja dhe dogana hyjnë vetëm përmes llogaritjes fiskale ekzistuese. Nuk ka bilance familjare, stok shumjavësh ose shportë të kalibruar historikisht.</p></details>';
    return html;
}
function validateHouseholdEconomy(st){
    var p=st.economicPilot,x=p?.productive,h=x?.households;if(h===undefined)return;
    if(!h||h.version!==1||!Number.isInteger(h.startTurn)||h.startTurn<0||h.startTurn>st.turnCount||!h.config||!h.referenceValues||!h.referenceCosts||!h.referenceDemands||!['referenceGross','referenceNet','basketValue','consumptionValue'].every(function(k){return Number.isFinite(h[k])&&h[k]>0;})||!Number.isFinite(h.referenceVat)||h.referenceVat<0||h.referenceVat>100||!Number.isFinite(h.demandMultiplier)||h.demandMultiplier<0||!Number.isFinite(h.vatFactor)||h.vatFactor<0)throw Error('Referencat e konsumit janë të pavlefshme.');
    ['incomeElasticity','priceElasticity','costPassThrough'].forEach(function(k){if(!Number.isFinite(h.config[k])||h.config[k]<0||h.config[k]>(k==='priceElasticity'?2:1))throw Error('Koeficient konsumi i pavlefshëm.');});
    ['industry','agriculture'].forEach(function(k){if(!Number.isFinite(h.referenceValues[k])||h.referenceValues[k]<1e-9||h.referenceValues[k]>10||x.trade[k].unitValueB<1e-9||!Number.isFinite(h.referenceCosts[k])||h.referenceCosts[k]<=0||!Number.isFinite(h.referenceDemands[k])||h.referenceDemands[k]<0)throw Error('Shporta kërkon vlera dhe kosto pozitive.');});
    if(Math.abs(['industry','agriculture'].reduce(function(s,k){return s+h.referenceDemands[k]*h.referenceValues[k];},0)-h.basketValue)>1e-6)throw Error('Referenca e shportës nuk përputhet me përbërjen.');
    (p.history||[]).forEach(function(r){var q=r.productive,v=q?.households;if(v===undefined)return;
        if(!v||!q.trade||!['grossIncomeIndex','disposableIncomeIndex','costOfLivingIndex','purchasingPowerIndex','affordability','consumptionIndex','expenditureIndex','unspentIndex'].every(function(k){return Number.isFinite(v[k])&&v[k]>=0;})||v.costOfLivingIndex<=0||v.affordability>1||v.expenditureIndex>v.disposableIncomeIndex+1e-6||v.fulfillment!==null&&(!Number.isFinite(v.fulfillment)||v.fulfillment<0||v.fulfillment>1))throw Error('Raporti i konsumit është i pavlefshëm.');
        ['industry','agriculture'].forEach(function(k){var t=q.trade[k];if(!['prices','desired','demand','consumed','supply'].every(function(field){return v[field]&&Number.isFinite(v[field][k])&&v[field][k]>=0;})||v.prices[k]<=0||Math.abs(v.demand[k]-t.demand)>1e-6||Math.abs(v.consumed[k]-t.local-t.imports)>1e-6||Math.abs(v.supply[k]-t.output-t.imports+t.exports)>1e-6||v.consumed[k]>v.supply[k]+1e-6)throw Error('Konsumi dhe furnizimi nuk përputhen.');});
        var spending=0,requested=0,consumption=0,cost=0;['industry','agriculture'].forEach(function(k){spending+=v.consumed[k]*h.referenceValues[k]*v.prices[k];requested+=v.demand[k]*h.referenceValues[k]*v.prices[k];consumption+=v.consumed[k]*h.referenceValues[k];cost+=h.referenceDemands[k]*h.referenceValues[k]*v.prices[k];if(Math.abs(v.demand[k]-v.desired[k]*v.affordability)>1e-6)throw Error('Kërkesa nuk përputhet me buxhetin.');});
        if(Math.abs(v.expenditureIndex-spending/h.basketValue*100)>1e-6||Math.abs(v.consumptionIndex-consumption/h.basketValue*100)>1e-6||Math.abs(v.costOfLivingIndex-cost/h.basketValue*100)>1e-6||Math.abs(v.unspentIndex-Math.max(0,v.disposableIncomeIndex-v.expenditureIndex))>1e-6||Math.abs(v.purchasingPowerIndex-v.disposableIncomeIndex/v.costOfLivingIndex*100)>1e-6||requested===0&&v.fulfillment!==null||requested>0&&(v.fulfillment===null||Math.abs(v.fulfillment-Math.min(1,spending/requested))>1e-6))throw Error('Përmbledhja e konsumit nuk përputhet me shportën.');
    });
}
function economicActivity(p){return p.productive?(1-p.productive.config.agricultureWeight)*p.output+p.productive.config.agricultureWeight*p.productive.agricultureOutput:p.output;}
function economicPayroll(st,employment,wage){var e0=st.economicPilot.baseline.employment;return (e0>0?employment/e0:1)*wage/100;}
function productiveGoodsBalance(output,demand,config,customs){
    var local=Math.min(output,demand),imports=Math.min(Math.max(0,demand-local),config.importLimit/(1+config.shippingPct/100+customs/100));
    var exports=Math.min(Math.max(0,output-local),config.exportLimit/(1+config.shippingPct/100));
    var importValueB=imports*config.unitValueB,exportValueB=exports*config.unitValueB;
    return {output:output,demand:demand,local:local,imports:imports,exports:exports,unmet:Math.max(0,demand-local-imports),unsold:Math.max(0,output-local-exports),importValueB:importValueB,exportValueB:exportValueB,domesticSalesB:local*config.unitValueB,transportB:(importValueB+exportValueB)*config.shippingPct/100,nominalTariffB:importValueB*customs/100,netPrivateOutflowB:importValueB-exportValueB+(importValueB+exportValueB)*config.shippingPct/100,unitValueB:config.unitValueB,shippingPct:config.shippingPct,customsRate:customs};
}
function productiveTrade(st,rates,employment,wage,householdInput){
    var p=st.economicPilot,x=p.productive,result={},payroll=economicPayroll(st,employment,wage),relative=x.referencePayroll>0?payroll/x.referencePayroll:1;
    var household=householdInput || (x.households?householdDemand(st,rates,employment,wage):null);
    ['industry','agriculture'].forEach(function(key){var c=x.trade[key],output=key==='industry'?p.output:x.agricultureOutput;result[key]=productiveGoodsBalance(output,household?household.demand[key]:c.demand*(.8+.2*relative),c,rates.customs);});return result;
}
function productiveSalesCapacity(st,key,householdInput){
    var p=st.economicPilot,x=p.productive,c=x.trade[key],payroll=economicPayroll(st,100-st.unemployment,p.wageIndex),relative=x.referencePayroll>0?payroll/x.referencePayroll:1;
    return (householdInput?householdInput.demand[key]:c.demand*(.8+.2*relative))+c.exportLimit/(1+c.shippingPct/100);
}
function enableProductiveEconomy(){
    var p=state.economicPilot;if(!p || p.productive)return false;
    return fiscalCommit(function(){
        var payroll=economicPayroll(state,100-state.unemployment,p.wageIndex),rawCustoms=p.baseline.bases.customs*(.5*payroll+.5*p.output/100);
        var x={version:1,startTurn:state.turnCount,agricultureOutput:p.output,agricultureCapacity0:Math.max(100,p.output),agricultureScore:economicSector(state,'sec_agri'),referencePayroll:payroll,externalCustomsShare:1,config:Object.assign({},PRODUCTIVE_DEFAULTS),trade:{}};
        ['industry','agriculture'].forEach(function(key){
            var c={demand:110,importLimit:11.5,exportLimit:20,shippingPct:5,unitValueB:0},initial=productiveGoodsBalance(p.output,c.demand,c,p.effectiveRates.customs);
            c.unitValueB=initial.imports>0?rawCustoms*.15/initial.imports:p.baseline.bases.customs*.15/10;
            if(initial.imports>0)x.externalCustomsShare-=.15;
            x.trade[key]=c;
        });
        p.productive=x;state.historyLog.unshift(state.year+' [Prodhimi]: U aktivizua ndarja industri–bujqësi dhe tregtia e mallrave; pa pagesë ose bonus retroaktiv.');
    });
}
function validateProductiveEconomy(st){
    var p=st.economicPilot,x=p?.productive;if(x===undefined)return;
    if(!x || x.version!==1 || !Number.isInteger(x.startTurn) || x.startTurn<0 || x.startTurn>st.turnCount || !Number.isFinite(x.agricultureOutput) || x.agricultureOutput<0 || x.agricultureOutput>150 || !Number.isFinite(x.agricultureCapacity0) || x.agricultureCapacity0<100 || x.agricultureCapacity0>150 || !Number.isFinite(x.agricultureScore) || x.agricultureScore<0 || x.agricultureScore>100 || !Number.isFinite(x.referencePayroll) || x.referencePayroll<0 || !Number.isFinite(x.externalCustomsShare) || x.externalCustomsShare<0 || x.externalCustomsShare>1 || !x.config || !x.trade)throw Error('Modeli prodhues është i pavlefshëm.');
    Object.keys(PRODUCTIVE_DEFAULTS).forEach(function(k){if(!Number.isFinite(x.config[k]) || x.config[k]<0 || x.config[k]>1)throw Error('Koeficient prodhues i pavlefshëm: '+k);});
    if(x.config.agricultureWeight<=0 || x.config.agricultureWeight>=1)throw Error('Peshat e sektorëve duhet të kenë shumë 1 dhe të jenë pozitive.');
    ['industry','agriculture'].forEach(function(key){var c=x.trade[key];if(!c || !['demand','importLimit','exportLimit','shippingPct','unitValueB'].every(function(k){return Number.isFinite(c[k]) && c[k]>=0;}) || c.demand>200 || c.importLimit>200 || c.exportLimit>200 || c.shippingPct>100 || c.unitValueB>10)throw Error('Parametrat e mallrave janë të pavlefshëm.');});
    validateHouseholdEconomy(st);
    (p.history||[]).forEach(function(r){var q=r.productive;if(q===undefined)return;
        if(!q || !['activity','agricultureOutput','agricultureCapacity','agriculturePotential','industrialPotential','industryUtilization','agricultureUtilization','industryLaborDemand','agricultureLaborDemand','industrialCost','agricultureCost'].every(function(k){return Number.isFinite(q[k]) && q[k]>=0;}) || !Number.isFinite(q.agricultureChange) || !q.trade)throw Error('Raporti prodhues është i pavlefshëm.');
        ['industry','agriculture'].forEach(function(key){var b=q.trade[key];if(!b || !['output','demand','local','imports','exports','unmet','unsold','importValueB','exportValueB','domesticSalesB','transportB','nominalTariffB','productionCostB','unitValueB','modeledCustomsB','shippingPct','customsRate'].every(function(k){return Number.isFinite(b[k]) && b[k]>=0;}) || !Number.isFinite(b.netPrivateOutflowB) || b.imports>0 && b.exports>0 || b.customsRate>100 || b.shippingPct>100 || Math.abs(b.output-b.local-b.exports-b.unsold)>1e-6 || Math.abs(b.demand-b.local-b.imports-b.unmet)>1e-6 || Math.abs(b.importValueB-b.imports*b.unitValueB)>1e-6 || Math.abs(b.exportValueB-b.exports*b.unitValueB)>1e-6 || Math.abs(b.domesticSalesB-b.local*b.unitValueB)>1e-6 || Math.abs(b.transportB-(b.importValueB+b.exportValueB)*b.shippingPct/100)>1e-6 || Math.abs(b.nominalTariffB-b.importValueB*b.customsRate/100)>1e-6 || Math.abs(b.netPrivateOutflowB-b.importValueB+b.exportValueB-b.transportB)>1e-6)throw Error('Bilanci i mallrave është i pavlefshëm.');});
    });
}
function economicMarketConfig(p){return p.energyMarket || ECONOMIC_MARKET_DEFAULTS;}
function validateEconomicMarket(m){
    if(!m || m.version!==1 || !['importLimit','exportLimit','importPrice'].every(function(k){return Number.isFinite(m[k]);}) || m.importLimit<0 || m.importLimit>100 || m.exportLimit<0 || m.exportLimit>100 || m.importPrice<1 || m.importPrice>1000)throw Error('Parametrat e tregut energjetik janë të pavlefshëm.');
}
function economicEnergyBalance(production,demand,capacity,c,m){
    var imports=Math.min(m.importLimit,Math.max(0,demand-production));
    var exports=Math.min(m.exportLimit,Math.max(0,production-demand));
    var available=production+imports-exports,consumed=Math.min(demand,available);
    var curtailment=Math.max(0,available-consumed),shortageUnits=Math.max(0,demand-consumed);
    var shortage=shortageUnits/Math.max(1,demand),domesticConsumed=consumed-imports;
    // Only energy delivered to domestic businesses enters their cost index.
    var mixedCost=consumed>0?(domesticConsumed*c.energyPrice+imports*m.importPrice)/consumed:c.energyPrice;
    return {capacity:capacity,production:production,demand:demand,imports:imports,exports:exports,available:available,consumed:consumed,curtailment:curtailment,shortageUnits:shortageUnits,shortage:shortage,cost:mixedCost*(1+c.shortagePremium*shortage)};
}
function economicPilotActive(st){return !!st.economicPilot;}
function economicSector(st,id){if(typeof unionOnStrike==='function'&&unionOnStrike(st,id))return 0;if(id==='sec_justice'&&typeof justiceReformCompleted==='function'&&justiceReformCompleted(st))return 100;return (st.stateSectors||[]).find(function(s){return s.id===id;})?.score||0;}
function economicApproach(value,target,step){return fiscalRound(value+clamp(target-value,-step,step));}
function validateEconomicPilot(st){
    var p=st.economicPilot;if(p===undefined)return;
    validateProductiveEconomy(st);
    if(!p || p.version!==1 || !Number.isInteger(p.lastTurn) || p.lastTurn<0 || p.lastTurn>st.turnCount || !p.config || !p.baseline || !p.effectiveRates || !Array.isArray(p.history) || p.history.length>24)throw Error('Piloti ekonomik ka të dhëna të pavlefshme.');
    Object.keys(ECONOMIC_PILOT_DEFAULTS).forEach(function(k){if(!Number.isFinite(p.config[k]) || p.config[k]<0 || p.config[k]>1000)throw Error('Supozimi ekonomik është i pavlefshëm: '+k);});
    if(p.config.energyPrice<1 || p.config.taxElasticity>5 || p.config.outputStep>2 || p.config.employmentStep>.15 || p.config.wageStep>.25)throw Error('Ritmi ose çmimi i pilotit është jashtë kufijve.');
    ['output','wageIndex','revenueAdjustmentB'].forEach(function(k){if(!Number.isFinite(p[k]) || k!=='revenueAdjustmentB' && p[k]<0)throw Error('Treguesi i pilotit është i pavlefshëm: '+k);});
    ['revenueB','energyScore','industryScore','stability','employment'].forEach(function(k){if(!Number.isFinite(p.baseline[k]) || p.baseline[k]<0)throw Error('Baza ekonomike është e pavlefshme.');});
    if(p.output>150 || p.wageIndex>200 || p.baseline.energyScore>100 || p.baseline.industryScore>100 || p.baseline.employment>100 || p.baseline.stability>100)throw Error('Baza e punësimit ose energjisë është e pavlefshme.');
    ['fdiEmploymentAtBaseline','fdiCapacityAtBaseline'].forEach(function(key){if(p[key]!==undefined && (!Number.isFinite(p[key]) || p[key]<0 || p[key]>100))throw Error('Baza e Mega-Projekteve është e pavlefshme.');});
    if(p.energyMarket!==undefined)validateEconomicMarket(p.energyMarket);
    if(p.growthWindow!==undefined && (!p.growthWindow || !Array.isArray(p.growthWindow.values) || p.growthWindow.values.length!==FISCAL_WEEKS || p.growthWindow.values.some(function(v){return !Number.isFinite(v) || v<0 || v>150;}) || !Number.isFinite(p.growthWindow.contribution) || Math.abs(p.growthWindow.contribution)>150))throw Error('Dritarja vjetore e aktivitetit është e pavlefshme.');
    ECONOMIC_TAX_KEYS.forEach(function(k){if(!Number.isFinite(p.effectiveRates[k]) || p.effectiveRates[k]<0 || p.effectiveRates[k]>100 || !Number.isFinite(p.baseline.rates?.[k]) || p.baseline.rates[k]<0 || p.baseline.rates[k]>100 || !Number.isFinite(p.baseline.bases?.[k]) || p.baseline.bases[k]<0)throw Error('Baza ose norma tatimore e pilotit është e pavlefshme.');});
    p.history.forEach(function(r,i){if(!r || !Number.isInteger(r.turn) || r.turn>p.lastTurn || i>0 && r.turn>=p.history[i-1].turn || !['output','employment','wageIndex','revenueB','energyCost','shortage','energyProduction','energyDemand','industrialCapacity'].every(function(k){return Number.isFinite(r[k]) && r[k]>=0;}) || !ECONOMIC_TAX_KEYS.every(function(k){return Number.isFinite(r.bases?.[k]) && r.bases[k]>=0 && Number.isFinite(r.taxes?.[k]) && r.taxes[k]>=0;}))throw Error('Historiku ekonomik është i pavlefshëm.');});
    p.history.forEach(function(r){var e=r.energyBalance;if(e!==undefined && (!e || !['capacity','production','demand','imports','exports','available','consumed','curtailment','shortageUnits','shortage','cost'].every(function(k){return Number.isFinite(e[k]) && e[k]>=0;}) || e.imports>0 && e.exports>0 || Math.abs(e.production+e.imports-e.consumed-e.exports-e.curtailment)>1e-6 || Math.abs(e.demand-e.consumed-e.shortageUnits)>1e-6))throw Error('Bilanci energjetik i ruajtur është i pavlefshëm.');});
    p.history.forEach(function(r){var e=r.energyBalance;if(e && (e.production>e.capacity+1e-6 || e.consumed>e.available+1e-6 || Math.abs(e.available-e.production-e.imports+e.exports)>1e-6 || Math.abs(e.curtailment-e.available+e.consumed)>1e-6 || Math.abs(e.shortage-e.shortageUnits/Math.max(1,e.demand))>1e-6 || Math.abs(e.cost-r.energyCost)>1e-6 || Math.abs(e.production-r.energyProduction)>1e-6 || Math.abs(e.demand-r.energyDemand)>1e-6 || Math.abs(e.shortage-r.shortage)>1e-6))throw Error('Përmbledhja dhe bilanci energjetik nuk përputhen.');});
    p.history.forEach(function(r){if(r.changes!==undefined && (!r.changes || !['output','employment','wageIndex','revenueB'].every(function(k){return Number.isFinite(r.changes[k]);}) || !Number.isFinite(r.payrollIndex) || r.payrollIndex<0) || r.growthContribution!==undefined && (!Number.isFinite(r.growthContribution) || Math.abs(r.growthContribution)>150))throw Error('Ndryshimet javore të ekonomisë janë të pavlefshme.');});
    (st.publicFinance?.decisions||[]).forEach(function(d){if(d.pilotStartRates && (d.kind!=='TAX' || !ECONOMIC_TAX_KEYS.every(function(k){return Number.isFinite(d.pilotStartRates[k]) && d.pilotStartRates[k]>=0 && d.pilotStartRates[k]<=100;})))throw Error('Normat fillestare të vendimit janë të pavlefshme.');});
}
function enableEconomicPilot(){
    if(economicPilotActive(state))return false;
    return fiscalCommit(function(){
        var rates={},bases={},weights={vat:.45,incomeTax:.2,corporateTax:.2,customs:.15},fallback={vat:18,incomeTax:10,corporateTax:15,customs:10};
        ECONOMIC_TAX_KEYS.forEach(function(k){rates[k]=state.taxPolicy[k];bases[k]=state.taxRevenueB*weights[k]/((rates[k]||fallback[k])/100);});
        // Zero rates cannot explain a positive calibrated receipt: keep that part
        // as an explicit legacy residual rather than divide by zero or invent tax.
        var represented=ECONOMIC_TAX_KEYS.reduce(function(s,k){return s+bases[k]*rates[k]/100;},0);
        state.economicPilot={version:1,lastTurn:state.turnCount,config:Object.assign({},ECONOMIC_PILOT_DEFAULTS),baseline:{revenueB:state.taxRevenueB,energyScore:economicSector(state,'sec_energy'),industryScore:economicSector(state,'sec_econ'),stability:state.energyStability,employment:100-state.unemployment,rates:rates,bases:bases},effectiveRates:Object.assign({},rates),output:100,wageIndex:100,revenueAdjustmentB:state.taxRevenueB-represented,history:[],sectorEmploymentAtBaseline:sectorExpansionJobs(state),sectorGrowthAtBaseline:sectorExpansionGrowth(state),fdiEmploymentAtBaseline:typeof foreignInvestmentEmploymentBoost==='function'?foreignInvestmentEmploymentBoost(state):0,fdiCapacityAtBaseline:typeof foreignInvestmentCapacityBoost==='function'?foreignInvestmentCapacityBoost(state):0};
        state.historyLog.unshift(state.year+' [Ekonomia]: U aktivizua piloti me indekse të kalibruara; nuk u ndryshua arka ose historiku fiskal.');
    });
}
function economicTaxCalculation(st,rates,output,wageIndex,employment,goodsSnapshot){
    var p=st.economicPilot,b=p.baseline,c=p.config;
    var payroll=(b.employment>0?employment/b.employment:1)*wageIndex/100;
    var factors={vat:.7*payroll+.3*output/100,incomeTax:payroll,corporateTax:output/100,customs:.5*payroll+.5*output/100},components={},bases={};
    var goods=goodsSnapshot || (p.productive?productiveTrade(st,rates,employment,wageIndex):null);
    if(p.productive?.households)factors.vat=p.productive.households.vatFactor*householdConsumptionValue(p.productive.households,goods)/p.productive.households.consumptionValue;
    ECONOMIC_TAX_KEYS.forEach(function(k){
        var raw=b.bases[k]*factors[k];
        if(k==='customs' && goods)raw=raw*p.productive.externalCustomsShare+goods.industry.importValueB+goods.agriculture.importValueB;
        bases[k]=raw*Math.exp(-c.taxElasticity*(rates[k]-b.rates[k])/100);
        components[k]=bases[k]*rates[k]/100;
    });
    var total=Object.values(components).reduce(function(a,b){return a+b;},0)+p.revenueAdjustmentB;
    if(!Number.isFinite(total) || !ECONOMIC_TAX_KEYS.every(function(k){return Number.isFinite(bases[k]) && Number.isFinite(components[k]);}))throw Error('Llogaritja e bazave tatimore tejkalon kufijtë numerikë.');
    return {bases:bases,components:components,total:fiscalRound(Math.max(0,total))};
}
function economicTaxPreview(data){
    var p=state.economicPilot;return economicTaxCalculation(state,data,economicActivity(p),p.wageIndex,100-state.unemployment).total-state.taxRevenueB;
}
function processEconomicPilotWeek(turn){
    if(!economicPilotActive(state))return false;
    validateEconomicPilot(state);var p=state.economicPilot;if(p.lastTurn>=turn)return false;
    if(turn!==state.turnCount || turn!==p.lastTurn+1)throw Error('Piloti ekonomik kërkon përpunim javor të renditur.');
    // Fiscal decisions have already advanced. Freeze this week's purchasing
    // demand before updating jobs/wages; new labor income feeds the next week.
    var tax=state.publicFinance.decisions.filter(function(d){return d.kind==='TAX' && d.pilotStartRates;}).slice(-1)[0];
    if(tax)ECONOMIC_TAX_KEYS.forEach(function(k){p.effectiveRates[k]=tax.pilotStartRates[k]+(tax.data[k]-tax.pilotStartRates[k])*tax.elapsed/tax.weeks;});
    var c=p.config,b=p.baseline,previous=p.output,previousActivity=economicActivity(p),x=p.productive,previousAgriculture=x?.agricultureOutput;
    var capacity=100*clamp(1+(economicSector(state,'sec_energy')-b.energyScore)*c.energyCapacityPerPoint,.5,1.5);
    var production=capacity*clamp(b.stability>0?state.energyStability/b.stability:state.energyStability/100,0,1);
    var energyActivity=x?x.config.energyIndustryWeight*previous+(1-x.config.energyIndustryWeight)*previousAgriculture:previous;
    var demand=100*(.6+.4*energyActivity/100),energy=economicEnergyBalance(production,demand,capacity,c,economicMarketConfig(p)),shortage=energy.shortage,energyCost=energy.cost;
    var households=x?.households?householdDemand(state,p.effectiveRates,100-state.unemployment,p.wageIndex,energyCost):null;
    var industrialCapacity=100*clamp(1+(economicSector(state,'sec_econ')-b.industryScore)*c.industrialCapacityPerPoint,.5,1.5);
    if(typeof foreignInvestmentCapacityBoost==='function')industrialCapacity=clamp(industrialCapacity+foreignInvestmentCapacityBoost(state)-(p.fdiCapacityAtBaseline||0),0,150);
    industrialCapacity=clamp(industrialCapacity+sectorExpansionGrowth(state)-(p.sectorGrowthAtBaseline||0),0,180);
    var target=industrialCapacity*(1-shortage)/Math.max(.25,1+c.costSensitivity*(energyCost/100-1));
    if(x)target=Math.min(target,productiveSalesCapacity(state,'industry',households));
    // Adjustment is gradual while installed capacity permits it. A loss of
    // capacity is a hard production constraint, including on existing output.
    p.output=Math.min(industrialCapacity,economicApproach(previous,clamp(target,0,industrialCapacity),c.outputStep));
    var productive=null;
    if(x){
        var ac=Math.min(150,x.agricultureCapacity0*clamp(1+(economicSector(state,'sec_agri')-x.agricultureScore)*x.config.agricultureCapacityPerPoint,.5,1.5));
        var ap=clamp(ac*(1-shortage)/Math.max(.25,1+x.config.agricultureCostSensitivity*(energyCost/100-1)),0,ac);
        ap=Math.min(ap,productiveSalesCapacity(state,'agriculture',households));
        x.agricultureOutput=Math.min(ac,economicApproach(previousAgriculture,ap,x.config.agricultureStep));
        productive={activity:economicActivity(p),agricultureOutput:x.agricultureOutput,agricultureCapacity:ac,agriculturePotential:ap,industrialPotential:clamp(target,0,industrialCapacity),industryUtilization:industrialCapacity>0?p.output/industrialCapacity*100:0,agricultureUtilization:ac>0?x.agricultureOutput/ac*100:0,industryLaborDemand:100*Math.pow(p.output/100,c.employmentElasticity),agricultureLaborDemand:100*Math.pow(x.agricultureOutput/100,c.employmentElasticity),industrialCost:100*Math.max(.25,1+c.costSensitivity*(energyCost/100-1)),agricultureCost:100*Math.max(.25,1+x.config.agricultureCostSensitivity*(energyCost/100-1)),agricultureChange:x.agricultureOutput-previousAgriculture};
    }
    var activity=economicActivity(p),employment=100-state.unemployment,targetEmployment=clamp(b.employment*Math.pow(activity/100,c.employmentElasticity),0,100);
    targetEmployment=clamp(targetEmployment+sectorExpansionJobs(state)-(p.sectorEmploymentAtBaseline||0),0,100);
    if(typeof foreignInvestmentEmploymentBoost==='function')targetEmployment=clamp(targetEmployment+foreignInvestmentEmploymentBoost(state)-(p.fdiEmploymentAtBaseline||0),0,100);
    employment=economicApproach(employment,targetEmployment,c.employmentStep);state.unemployment=fiscalRound(100-employment);
    p.wageIndex=economicApproach(p.wageIndex,100*Math.pow(activity/100,c.wageElasticity),c.wageStep);
    // Rolling annual activity contribution; keep independent macro effects.
    // Old saves start this window prospectively, without replaying past growth.
    if(!p.growthWindow)p.growthWindow={values:Array(FISCAL_WEEKS).fill(previousActivity),contribution:0};
    var lag=p.growthWindow.values.shift(),contribution=activity-lag;
    state.gdpGrowth=fiscalRound(state.gdpGrowth-p.growthWindow.contribution+contribution);
    p.growthWindow.values.push(activity);p.growthWindow.contribution=contribution;
    if(productive){productive.trade=productiveTrade(state,p.effectiveRates,employment,p.wageIndex,households);['industry','agriculture'].forEach(function(key){var t=productive.trade[key],cost=key==='industry'?productive.industrialCost:productive.agricultureCost;t.productionCostB=t.output*x.trade[key].unitValueB*x.config.productionCostShare*cost/100;t.modeledCustomsB=t.nominalTariffB*Math.exp(-c.taxElasticity*(p.effectiveRates.customs-b.rates.customs)/100);});if(households)productive.households=householdReport(state,households,productive.trade);}
    var result=economicTaxCalculation(state,p.effectiveRates,activity,p.wageIndex,employment,productive?.trade);state.taxRevenueB=result.total;
    p.lastTurn=turn;
    p.history.unshift({turn:turn,output:p.output,employment:employment,wageIndex:p.wageIndex,revenueB:result.total,energyCost:energyCost,shortage:shortage,energyProduction:production,energyDemand:demand,industrialCapacity:industrialCapacity,bases:result.bases,taxes:result.components,energyBalance:energy,growthContribution:contribution,payrollIndex:(b.employment>0?employment/b.employment:1)*p.wageIndex,changes:{output:p.output-previous,employment:employment-(p.history[0]?.employment??b.employment),wageIndex:p.wageIndex-(p.history[0]?.wageIndex??100),revenueB:result.total-(p.history[0]?.revenueB??b.revenueB)}});p.history=p.history.slice(0,24);
    if(productive)p.history[0].productive=productive;
    if(productive)validateProductiveEconomy(state);
    return true;
}
function economicPilotPanel(){
    var p=state.economicPilot;
    if(!p)return '<article class="card"><h3>Piloti ekonomi–energji–punësim–tatime</h3><p>Model i kufizuar me indekse simulimi, jo statistika historike. Aktivizimi kalibron bazat me të hyrat aktuale; nuk ndryshon arkën. Përpunimi bëhet çdo javë.</p>'+(agendaExecutive()?'<button class="action-btn" onclick="enableEconomicPilot()">Aktivizo pilotin ekonomik</button>':'<p>Aktivizimi kërkon autoritet qeveritar.</p>')+'</article>';
    var r=p.history[0],money=function(n){return '€'+(n*1000).toFixed(2)+'M';},signed=function(n){return (n>=0?'+':'')+n.toFixed(2);};
    var html='<article class="card"><h3>Piloti ekonomik · aktiv</h3><p>Prodhimi: '+p.output.toFixed(2)+' / 100 fillestar · Punësimi: '+(100-state.unemployment).toFixed(2)+'% · Indeksi i pagës: '+p.wageIndex.toFixed(2)+'.</p>';
    if(state.publicFinance.openingYear!==state.year && fiscalBudgetForYear(state.year)?.status!=='APPROVED')html+='<p>Pa buxhet vjetor të miratuar, shpenzimet operative të modelit janë zero. Financimi i përkohshëm nuk është implementuar; rritja e arkës nga arkëtimet nuk dëshmon përmirësim ekonomik. Miratimi ndiqet te procedura ekzistuese e buxhetit.</p>';
    if(r){
        html+='<p>Java '+r.turn+': kosto energjie '+r.energyCost.toFixed(2)+' / 100 fillestar; mungesë '+(r.shortage*100).toFixed(2)+'%. Të hyra vjetore '+money(r.revenueB)+'; arkëtim javor '+money(r.revenueB/FISCAL_WEEKS)+'.</p>';
        if(r.changes)html+='<p>Nga java e kaluar: prodhimi '+signed(r.changes.output)+' pikë indeksi; punësimi '+signed(r.changes.employment)+' pikë përqindjeje; paga '+signed(r.changes.wageIndex)+' pikë indeksi; të hyrat vjetore '+money(r.changes.revenueB)+'. Indeksi i të ardhurave familjare: '+r.payrollIndex.toFixed(2)+' / 100 fillestar.</p>';
        var cause=r.shortage>0?'Mungesa e furnizimit kufizon prodhimin.':r.energyCost>100?'Kostoja energjetike mbi bazën fillestare kufizon prodhimin.':r.industrialCapacity>100?'Kapaciteti industrial është rritur nga indeksi ekonomik.':'Objektivi i prodhimit kufizohet nga kapaciteti i instaluar; energjia e lirë nuk krijon kapacitet shtesë.';
        html+='<p>Shkaku i aktivitetit: '+cause+' Punësimi dhe paga afrohen gradualisht te aktiviteti; bazat tatimore varen nga ato dhe normat efektive.</p>';
        var e=r.energyBalance;
        if(e)html+='<details open><summary>Bilanci javor i energjisë · njësi modeli, jo MWh</summary><p>Kapacitet vendas '+e.capacity.toFixed(2)+' · Prodhim vendas '+e.production.toFixed(2)+' · Kërkesë '+e.demand.toFixed(2)+'.</p><p>Importe '+e.imports.toFixed(2)+' · Eksporte '+e.exports.toFixed(2)+' · E disponueshme pas eksporteve '+e.available.toFixed(2)+' · Konsum i furnizuar '+e.consumed.toFixed(2)+'.</p><p>Mungesë e pambuluar '+e.shortageUnits.toFixed(2)+' · Tepricë e papërdorur '+e.curtailment.toFixed(2)+'. Prodhimi + importet = konsumi + eksportet + teprica e papërdorur.</p></details>';
        else html+='<p>Raporti historik: prodhim energjie '+r.energyProduction.toFixed(2)+' / kërkesë '+r.energyDemand.toFixed(2)+'. Shkëmbimet nuk ishin të modeluara në këtë javë.</p>';
        html+='<details><summary>Bazat dhe të hyrat sipas tatimit</summary>'+ECONOMIC_TAX_KEYS.map(function(k){return '<p>'+({vat:'TVSH',incomeTax:'Të ardhurat',corporateTax:'Korporatat',customs:'Dogana'})[k]+': bazë e modelit '+money(r.bases[k])+', normë efektive '+p.effectiveRates[k].toFixed(2)+'%, të hyra '+money(r.taxes[k])+'.</p>';}).join('')+'<p>Rregullim vjetor nga politikat e trashëguara: '+money(p.revenueAdjustmentB)+'.</p></details>';
    }else html+='<p>Rezultati i parë shfaqet pas kalimit të javës.</p>';
    html+='<p>Normat tatimore zbatohen gradualisht në 4 javë. Investimet e financuara ndikojnë përmes indeksit sektorial nga java pas zbatimit.</p><details><summary>Supozimet dhe kufijtë</summary><p>Energjia dhe kapacitetet janë njësi modeli; çmimet, pagat dhe të ardhurat familjare janë indekse simulimi. Nuk janë MWh, €/MWh ose paga reale. Importet mbulojnë vetëm mungesën, eksportet vetëm tepricën dhe kufijtë e tyre fillojnë në zero. Kostoja energjetike e bizneseve nuk paguhet edhe nga arka. Shkëmbimet nuk krijojnë automatikisht të hyra publike. Rritja ekonomike përfshin proksin e ndryshimit të aktivitetit gjatë 48 javëve të fundit, krahas efekteve të tjera të lojës. Nuk është PBB e kalibruar historikisht.</p><p>Prodhimi industrial përshtatet normalisht deri 2 pikë, punësimi deri 0.15 pikë përqindjeje dhe paga deri 0.25 pikë në javë. Nëse kapaciteti i instaluar bie nën prodhimin e kaluar, prodhimi ulet menjëherë brenda kapacitetit të ri. Furnizimi zero mund ta ulë prodhimin gradualisht në zero; rikuperimi mbetet gradual.</p></details>';
    if(agendaExecutive())html+='<button class="action-btn" onclick="openEconomicMarketModal()">Parametrat e shkëmbimit energjetik</button>';
    return html+productiveEconomyPanel()+'</article>';
}
function openEconomicMarketModal(){
    if(!economicPilotActive(state) || !assertGovernmentAuthority('Parametrat e tregut energjetik'))return false;
    var m=economicMarketConfig(state.economicPilot);
    document.getElementById('interactiveActionModalContent').innerHTML='<form class="fiscal11" onsubmit="event.preventDefault();submitEconomicMarket()"><h2>Shkëmbimi energjetik · skenar simulimi</h2><p>Kufij në njësi modeli për javë, jo kapacitete reale të interkoneksionit. Importi mbulon vetëm mungesën; eksporti përdor vetëm tepricën. Kostoja e importit është indeks për bizneset; ky konfigurim nuk kryen pagesë nga arka, nuk lidh marrëveshje dhe nuk premton të ardhura nga eksporti.</p><label>Kufi importi (0–100 njësi modeli)<input id="energyImportLimit" type="number" min="0" max="100" step="0.1" required value="'+m.importLimit+'"></label><label>Kufi eksporti (0–100 njësi modeli)<input id="energyExportLimit" type="number" min="0" max="100" step="0.1" required value="'+m.exportLimit+'"></label><label>Kosto importi (indeks 1–1000; bazë 100)<input id="energyImportPrice" type="number" min="1" max="1000" step="0.1" required value="'+m.importPrice+'"></label><p>Efekti fillon javën pasuese: furnizimi dhe kostoja mund të ndryshojnë, pastaj prodhimi, punësimi dhe tatimet. Rezultati varet nga kërkesa dhe kapaciteti vendas.</p><button class="action-btn btn-gold" type="submit">Ruaj parametrat e skenarit</button></form>';toggleModal('interactiveActionModal',true);return true;
}
function submitEconomicMarket(){
    var fields=['energyImportLimit','energyExportLimit','energyImportPrice'];
    if(fields.some(function(id){return !document.getElementById(id)?.value.trim();})){showToast('Plotësoni të gjithë parametrat.');return false;}
    var ok=setEconomicMarket({version:1,importLimit:Number(document.getElementById(fields[0]).value),exportLimit:Number(document.getElementById(fields[1]).value),importPrice:Number(document.getElementById(fields[2]).value)});
    if(ok)toggleModal('interactiveActionModal',false);return ok;
}
function setEconomicMarket(config){
    if(!economicPilotActive(state))return false;
    try{validateEconomicMarket(config);}catch(error){showToast(error.message);return false;}
    var old=economicMarketConfig(state.economicPilot);if(['importLimit','exportLimit','importPrice'].every(function(k){return old[k]===config[k];}))return false;
    return fiscalCommit(function(){state.economicPilot.energyMarket={version:1,importLimit:config.importLimit,exportLimit:config.exportLimit,importPrice:config.importPrice};state.historyLog.unshift(state.year+' [Energjia]: U ndryshuan parametrat e shkëmbimit të skenarit; pa pagesë nga arka.');});
}
function economicInvestmentHint(sectorId,gain){
    if(!economicPilotActive(state))return '';
    var p=state.economicPilot;
    if(sectorId==='sec_agri' && p.productive)return '<p>Modeli bujqësor: çdo pikë neto sektoriale rrit potencialin fillestar me '+(p.productive.config.agricultureCapacityPerPoint*100).toFixed(2)+'%. Rritje e deklaruar deri '+gain+' pikë sektori. Efekti nis javën pas zbatimit të përfitimit; nuk jep bonus të veçantë në PBB. Projektet përfitojnë pas përfundimit, përveç atyre me zbatim gradual të deklaruar.</p>';
    if(!['sec_energy','sec_econ'].includes(sectorId))return '';
    var coefficient=sectorId==='sec_energy'?p.config.energyCapacityPerPoint:p.config.industrialCapacityPerPoint;
    return '<p>Piloti: çdo pikë neto e indeksit '+(sectorId==='sec_energy'?'energjetik':'ekonomik')+' ndryshon kapacitetin e modelit me '+(coefficient*100).toFixed(2)+' pikë (kufi 50–150). Rritja e deklaruar e indeksit: deri '+gain+' pikë, brenda kufirit 100. Efekti fillon javën pas zbatimit; prodhimi dhe tatimet varen edhe nga energjia, kostot dhe punësimi. Nuk garantohet rritje e PBB-së.</p>';
}
function productiveEconomyPanel(){
    var p=state.economicPilot,x=p.productive;
    if(!x)return '<details><summary>Industria, bujqësia dhe tregtia e mallrave</summary><p>Zgjerim i zgjedhshëm me dy sektorë dhe bilance mallrash. Aktivizimi ruan arkën, tatimet dhe historikun. Kapacitetet bujqësore dhe vlerësimet e mallrave janë supozime simulimi.</p>'+(agendaExecutive()?'<button class="action-btn" onclick="enableProductiveEconomy()">Aktivizo industrinë, bujqësinë dhe tregtinë</button>':'<p>Aktivizimi kërkon autoritet qeveritar.</p>')+'</details>';
    var r=p.history[0],q=r?.productive,n=function(v){return v.toFixed(2);},money=function(v){return '€'+(v*1000).toFixed(2)+'M';},html='<section><h3>Industria, bujqësia dhe tregtia · aktiv</h3><p>Aktiviteti i përbashkët: '+n(economicActivity(p))+' / 100. Pesha industriale '+n((1-x.config.agricultureWeight)*100)+'%, bujqësore '+n(x.config.agricultureWeight*100)+'%. Nuk mblidhen dy herë prodhimi, shitjet dhe eksportet në PBB.</p>';
    if(!q)html+='<p>Raporti i parë sektorial shfaqet pas kalimit të javës.</p>';
    else{
        html+='<p>Industria — kapacitet maksimal '+n(r.industrialCapacity)+', prodhim i mundshëm nga energjia, kostoja dhe tregu '+n(q.industrialPotential)+', prodhim i realizuar '+n(r.output)+', shfrytëzim '+n(q.industryUtilization)+'%. Ndryshimi javor '+n(r.changes.output)+' pikë.</p><p>Bujqësia — kapacitet maksimal '+n(q.agricultureCapacity)+', prodhim i mundshëm '+n(q.agriculturePotential)+', prodhim i realizuar '+n(q.agricultureOutput)+', shfrytëzim '+n(q.agricultureUtilization)+'%. Ndryshimi javor '+n(q.agricultureChange)+' pikë.</p><p>Këto janë indekse/njësi modeli, jo tonë ose hektarë. Prodhimi përshtatet gradualisht ndaj objektivit të energjisë dhe kërkesës vendase plus kufirit të eksportit. Kosto industriale '+n(q.industrialCost)+' / 100; kosto bujqësore '+n(q.agricultureCost)+' / 100. Kërkesa për punëtorë: industri '+n(q.industryLaborDemand)+', bujqësi '+n(q.agricultureLaborDemand)+' / 100 fillestar; nuk janë numra punëtorësh.</p>';
        ['industry','agriculture'].forEach(function(key){var t=q.trade[key];html+='<details><summary>'+(key==='industry'?'Mallra industriale':'Mallra bujqësore')+' · java '+r.turn+'</summary><p>Prodhim '+n(t.output)+' · kërkesë vendase '+n(t.demand)+' · furnizim nga prodhuesit vendas '+n(t.local)+' · importe '+n(t.imports)+' · eksporte '+n(t.exports)+' · mungesë '+n(t.unmet)+' · prodhim i pashitur '+n(t.unsold)+'. Njësi modeli.</p><p>Vlerësime vjetore të skenarit: vlerë importi '+money(t.importValueB)+'; shitje të prodhuesve brenda vendit '+money(t.domesticSalesB)+'; shitje eksporti '+money(t.exportValueB)+'; kosto prodhimi '+money(t.productionCostB)+'; transport '+money(t.transportB)+'.</p><p>Tarifë nominale importi '+money(t.nominalTariffB)+'; kontribut doganor i modeluar pas reagimit të bazës '+money(t.modeledCustomsB)+'. Pagesë neto private ndërkufitare e vlerësuar '+money(t.netPrivateOutflowB)+' në vit, ose '+money(t.netPrivateOutflowB/FISCAL_WEEKS)+' në javë; shenja negative tregon hyrje neto private.</p><p>Shitjet dhe pagesat private nuk regjistrohen si arkëtime ose shpenzime shtetërore. '+(x.households?'Dogana dhe konsumi ushqejnë bazat përkatëse vetëm një herë.':"Vetëm kontributi doganor hyn një herë në bazën fiskale ekzistuese.")+' '+(x.households?'TVSH llogaritet nga konsumi i furnizuar; tatimi i korporatave ruan proksin e prodhimit.':"TVSH dhe tatimi i korporatave vazhdojnë proksitë e tyre; nuk tatohen sërish shitjet e shfaqura këtu.")+'</p></details>';});
    }
    html+='<p>Investimet: përdorni zonat ekonomike, projektet bujqësore/ujitjen dhe reformat sektoriale ekzistuese. Kostoja, financimi, afati dhe progresi mbeten te projektet. Kapaciteti reagon javën pas zbatimit; historiku i vjetër nuk merr përfitim retroaktiv.</p><details><summary>Kufijtë e modelit prodhues</summary><p>Nuk modelohen toka, rendimenti, stinët, profesionet ose çmimet reale. Vlera për njësi kalibrohet nga baza doganore e ruajtur dhe është parametër skenari, jo çmim tregu i verifikuar. Nuk ka stok shumjavësh, bilance bankare private ose këmbim valutor. Kostot dhe flukset private janë vlerësime, jo transaksione bankare të kryera. Indeksi i përbashkët ushqen punësimin, pagën, bazat tatimore dhe të njëjtën dritare 48-javore.</p></details>';
    html+=householdEconomyPanel();
    if(agendaExecutive())html+='<button class="action-btn" onclick="openGoodsTradeModal()">Parametrat e tregtisë së mallrave</button>';
    return html+'</section>';
}
function openGoodsTradeModal(){
    var x=state.economicPilot?.productive;if(!x || !assertGovernmentAuthority('Parametrat e tregtisë së mallrave'))return false;
    var fields={demand:['Kërkesë vendase bazë (njësi modeli)',200],importLimit:['Kufi furnizimi importi para kostove (njësi modeli)',200],exportLimit:['Kufi eksporti para kostove (njësi modeli)',200],shippingPct:['Transport (% e vlerës së mallrave)',100],unitValueB:['Vlerë vjetore për njësi (miliardë euro modeli)',10]};
    document.getElementById('interactiveActionModalContent').innerHTML='<form class="fiscal11" onsubmit="event.preventDefault();submitGoodsTrade()"><h2>Tregtia e mallrave · parametra skenari</h2><p>Këto janë supozime simulimi, jo marrëveshje ose çmime historike. Ndryshimi nuk paguan nga arka. Efekti shfaqet javën pasuese në mallra dhe dogana; norma doganore ndryshohet vetëm te formulari ekzistues i tatimeve.</p>'+['industry','agriculture'].map(function(key){return '<h3>'+(key==='industry'?'Industria':'Bujqësia')+'</h3>'+Object.keys(fields).map(function(f){return '<label>'+fields[f][0]+'<input id="goods_'+key+'_'+f+'" type="number" min="0" max="'+fields[f][1]+'" step="any" required value="'+x.trade[key][f]+'"></label>';}).join('');}).join('')+'<button class="action-btn btn-gold" type="submit">Ruaj parametrat e tregtisë</button></form>';toggleModal('interactiveActionModal',true);return true;
}
function submitGoodsTrade(){
    var config={};for(var key of ['industry','agriculture']){config[key]={};for(var f of ['demand','importLimit','exportLimit','shippingPct','unitValueB']){var el=document.getElementById('goods_'+key+'_'+f);if(!el || !el.value.trim()){showToast('Plotësoni të gjithë parametrat e mallrave.');return false;}config[key][f]=Number(el.value);}}
    var ok=setGoodsTrade(config);if(ok)toggleModal('interactiveActionModal',false);return ok;
}
function setGoodsTrade(config){
    var p=state.economicPilot;if(!p?.productive)return false;
    var probe={economicPilot:Object.assign({},p,{productive:Object.assign({},p.productive,{trade:config})}),turnCount:state.turnCount};
    try{validateProductiveEconomy(probe);}catch(error){showToast(error.message);return false;}
    if(JSON.stringify(p.productive.trade)===JSON.stringify(config))return false;
    return fiscalCommit(function(){p.productive.trade=JSON.parse(JSON.stringify(config));state.historyLog.unshift(state.year+' [Tregtia]: U ndryshuan parametrat e mallrave; pa pagesë nga arka.');});
}

function bilateralPartners(st){return ['USA','UK','ALBANIA','TURKEY'].filter(function(id){return !!st.diplomacy[id];});}
function enableBilateralTrade(){if(state.bilateralTrade)return false;return fiscalCommit(function(){state.bilateralTrade={version:1,startTurn:state.turnCount,lastTurn:state.turnCount,revision:0,counter:0,stocks:{wheat:0,energy:0,steel:0,technology:0},released:{wheat:0,energy:0,steel:0,technology:0},factors:{wheat:1,energy:1,steel:1,technology:1},contracts:[]};});}
function bilateralQuote(product,side,st){var p=BILATERAL_PRODUCTS[product];return p?p.price*(st.bilateralTrade?.factors[product]||1)*(side==='SELL'?.95:1):NaN;}
function bilateralHouseholdPriceFactor(st,key){var f=st.bilateralTrade?.factors;if(!f)return 1;return key==='agriculture'?.8*f.wheat+.2*f.energy:.5*f.energy+.3*f.steel+.2*f.technology;}
function bilateralCommit(change){return fiscalCommit(function(){change();validateBilateralTrade(state);});}
function signBilateralContract(partner,product,side,quantity,expectedRevision){
    var t=state.bilateralTrade,p=BILATERAL_PRODUCTS[product];
    if(!t || t.revision!==expectedRevision || !p || !bilateralPartners(state).includes(partner) || !['BUY','SELL'].includes(side) || !Number.isInteger(quantity) || quantity<1 || quantity>1000000 || t.contracts.filter(function(c){return c.status==='PENDING';}).length>=10)return false;
    if(state.diplomacy[partner].score<20){showToast('Marrëdhëniet aktuale nuk lejojnë këtë kontratë.');return false;}
    var unitPrice=bilateralQuote(product,side,state),costB=fiscalRound(quantity*unitPrice/1e9);
    if(side==='BUY'){var authorization=fiscalSpendingCheck(costB,false);if(!authorization.allowed || state.budgetTotalB<costB){showToast(authorization.message||'Mungojnë fondet për kontratën.');return false;}}
    else if(t.stocks[product]<quantity){showToast('Stoku i lirë nuk e mbulon shitjen.');return false;}
    return bilateralCommit(function(){
        var c={id:'trade:'+ (++t.counter),partnerId:partner,product:product,side:side,quantity:quantity,unitPrice:unitPrice,costB:costB,signedTurn:state.turnCount,dueTurn:state.turnCount+2,status:'PENDING',ledgerId:null};
        if(side==='BUY'){fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB-costB),'Blerje rezervash publike: '+p.name,'EXPENSE');c.ledgerId=state.publicFinance.ledger.at(-1).id;}else t.stocks[product]-=quantity;
        t.contracts.push(c);t.revision++;state.historyLog.unshift('Java '+state.turnCount+': Kontratë '+(side==='BUY'?'blerjeje':'shitjeje')+' me '+state.diplomacy[partner].name+' për '+quantity+' '+p.unit+' '+p.name+'.');
    });
}
function processBilateralTradeWeek(turn){
    var t=state.bilateralTrade;if(!t)return false;if(turn!==state.turnCount)throw Error('Ora e tregtisë nuk përputhet me javën.');if(t.lastTurn>=turn)return false;if(t.lastTurn+1!==turn)throw Error('Tregtia kërkon javë të njëpasnjëshme.');
    t.contracts.filter(function(c){return c.status==='PENDING' && c.dueTurn<=turn;}).forEach(function(c){
        if(c.side==='BUY')t.stocks[c.product]+=c.quantity;
        else{fiscalSetBalance(state,'budgetTotalB',fiscalRound(state.budgetTotalB+c.costB),'Shitje rezervash publike: '+BILATERAL_PRODUCTS[c.product].name,'REVENUE');c.ledgerId=state.publicFinance.ledger.at(-1).id;}
        c.status='DELIVERED';c.deliveredTurn=turn;addMediaNews('Tregtia','Përfundon kontrata për '+c.quantity+' '+BILATERAL_PRODUCTS[c.product].unit+' '+BILATERAL_PRODUCTS[c.product].name+' me '+state.diplomacy[c.partnerId].name+'.','NEUTRAL');
    });
    Object.keys(BILATERAL_PRODUCTS).forEach(function(k){var p=BILATERAL_PRODUCTS[k],available=t.stocks[k],used=Math.min(available,p.weeklyUse),coverage=Math.min(4,available/p.weeklyUse);t.factors[k]=fiscalRound(1+(1-used/p.weeklyUse)*.05-coverage*.025);t.stocks[k]-=used;t.released[k]+=used;});
    t.lastTurn=turn;t.revision++;validateBilateralTrade(state);return true;
}
function validateBilateralTrade(st){
    var t=st.bilateralTrade;if(t===undefined)return;
    if(!t || t.version!==1 || !Number.isInteger(t.startTurn) || t.startTurn<0 || !Number.isInteger(t.lastTurn) || t.lastTurn<t.startTurn || t.lastTurn>st.turnCount || !Number.isInteger(t.revision) || t.revision<0 || !Number.isInteger(t.counter) || !Array.isArray(t.contracts) || t.counter!==t.contracts.length || !t.stocks || !t.released || !t.factors)throw Error('Gjendja e tregtisë është e pavlefshme.');
    if(t.revision!==t.contracts.length+t.lastTurn-t.startTurn)throw Error('Checkpoint-i i tregtisë nuk përputhet me kontratat dhe javët.');
    var ids=new Set(),ledgerIds=new Set();t.contracts.forEach(function(c){
        if(!c || ids.has(c.id) || typeof c.id!=='string' || !bilateralPartners(st).includes(c.partnerId) || !BILATERAL_PRODUCTS[c.product] || !['BUY','SELL'].includes(c.side) || !Number.isInteger(c.quantity) || c.quantity<1 || c.quantity>1000000 || !Number.isFinite(c.unitPrice) || c.unitPrice<=0 || !Number.isFinite(c.costB) || c.costB<=0 || Math.abs(c.costB-fiscalRound(c.quantity*c.unitPrice/1e9))>1e-9 || !Number.isInteger(c.signedTurn) || c.signedTurn<t.startTurn || c.signedTurn>st.turnCount || c.dueTurn!==c.signedTurn+2 || !['PENDING','DELIVERED'].includes(c.status) || c.status==='DELIVERED' && (!Number.isInteger(c.deliveredTurn) || c.deliveredTurn<c.dueTurn || c.deliveredTurn>t.lastTurn))throw Error('Kontrata tregtare është e pavlefshme.');
        if(c.side==='BUY' || c.status==='DELIVERED'){var row=st.publicFinance.ledger.find(function(r){return r.id===c.ledgerId;});if(!row || ledgerIds.has(c.ledgerId) || row.account!=='budgetTotalB' || row.type!==(c.side==='BUY'?'EXPENSE':'REVENUE') || Math.abs(row.amountB-(c.side==='BUY'?-c.costB:c.costB))>1e-8)throw Error('Kontrata nuk rakordohet me pagesën publike.');ledgerIds.add(c.ledgerId);}else if(c.ledgerId!==null)throw Error('Eksporti në pritje nuk mund të ketë arkëtim.');ids.add(c.id);
    });
    Object.keys(BILATERAL_PRODUCTS).forEach(function(k){var incoming=t.contracts.filter(function(c){return c.product===k && c.side==='BUY' && c.status==='DELIVERED';}).reduce(function(s,c){return s+c.quantity;},0),outgoing=t.contracts.filter(function(c){return c.product===k && c.side==='SELL';}).reduce(function(s,c){return s+c.quantity;},0);if(!Number.isInteger(t.stocks[k]) || t.stocks[k]<0 || !Number.isInteger(t.released[k]) || t.released[k]<0 || t.stocks[k]!==incoming-outgoing-t.released[k] || !Number.isFinite(t.factors[k]) || t.factors[k]<.9-1e-8 || t.factors[k]>1.05+1e-8)throw Error('Stoqet ose çmimet nuk rakordohen.');});
}
function bilateralFormQuote(){var t=state.bilateralTrade;if(!t)return;var k=document.getElementById('bilateralProduct')?.value,side=document.getElementById('bilateralSide')?.value,raw=document.getElementById('bilateralQuantity')?.value,quantity=Number(raw),price=bilateralQuote(k,side,state),host=document.getElementById('bilateralQuote');if(!host)return;host.textContent=String(raw||'').trim() && Number.isInteger(quantity) && quantity>0 && quantity<=1000000?'Çmimi: €'+price.toFixed(2)+'/'+BILATERAL_PRODUCTS[k].unit+' · Shuma: €'+(fiscalRound(quantity*price/1e9)*1000).toFixed(3)+'M · Dorëzim pas 2 javësh. '+(side==='BUY'?'Pagesa kryhet në nënshkrim.':'Stoku rezervohet tani; arkëtimi në dorëzim.'):'Shkruani sasi të plotë nga 1 deri në 1,000,000.';}
function submitBilateralContract(revision){var raw=document.getElementById('bilateralQuantity').value;if(!raw.trim())return false;return signBilateralContract(document.getElementById('bilateralPartner').value,document.getElementById('bilateralProduct').value,document.getElementById('bilateralSide').value,Number(raw),revision);}
function renderBilateralTrade(){
    var host=document.getElementById('bilateralTradePanel');if(!host || !state)return;var t=state.bilateralTrade,e=catalogEscape;
    if(!t){host.innerHTML='<section class="card"><h2>Tregtia bilaterale dhe rezervat</h2><p>Katër produkte me sasi të matshme dhe kontrata shtetërore. Aktivizimi nis me stok zero, pa histori të sajuar ose pagesë. Ofertat dhe përdorimi javor janë parametra të skenarit, jo çmime statistikore.</p><button class="action-btn" onclick="enableBilateralTrade()">Hap tregun e rezervave publike</button></section>';return;}
    host.innerHTML='<section class="card"><h2>Tregtia</h2><p>Rezerva publike, të ndara nga importet private. Blerja përdor arkën; shitja arkëtohet vetëm pas dorëzimit.</p><div class="commodity-grid">'+Object.keys(BILATERAL_PRODUCTS).map(function(k){var p=BILATERAL_PRODUCTS[k];return '<article><h3>'+p.name+'</h3>'+uiDetailRows([['Stoku',t.stocks[k]+' '+p.unit],['Përdorimi javor',p.weeklyUse+' '+p.unit],['Çmimi i blerjes','€'+bilateralQuote(k,'BUY',state).toFixed(2)+'/'+p.unit,true]])+'</article>';}).join('')+'</div><form class="bilateral-form" onsubmit="event.preventDefault();submitBilateralContract('+t.revision+')"><label>Partneri<select id="bilateralPartner">'+bilateralPartners(state).map(function(id){return '<option value="'+id+'">'+e(state.diplomacy[id].name)+'</option>';}).join('')+'</select></label><label>Produkti<select id="bilateralProduct" onchange="bilateralFormQuote()">'+Object.keys(BILATERAL_PRODUCTS).map(function(k){return '<option value="'+k+'">'+BILATERAL_PRODUCTS[k].name+'</option>';}).join('')+'</select></label><label>Veprimi<select id="bilateralSide" onchange="bilateralFormQuote()"><option value="BUY">Bli</option><option value="SELL">Shit stok publik</option></select></label><label>Sasia<input id="bilateralQuantity" type="number" min="1" max="1000000" step="1" required placeholder="p.sh. 100000" oninput="bilateralFormQuote()"></label><p id="bilateralQuote" role="status">Shqyrtoni shumën para nënshkrimit.</p><button class="action-btn" type="submit">Nënshkruaj kontratën</button></form><p>Furnizimi lirohet çdo javë nga rezervat. Ndikon në çmimet e mallrave dhe në shportën e familjeve kur moduli i konsumit është aktiv; nuk krijon tatime ose prodhim privat automatik.</p><details><summary>Kontratat dhe dorëzimet ('+t.contracts.length+')</summary>'+t.contracts.slice().reverse().map(function(c){return '<article><strong>'+BILATERAL_PRODUCTS[c.product].name+' · '+(c.side==='BUY'?'Blerje':'Shitje')+'</strong><p>'+e(state.diplomacy[c.partnerId].name)+' · '+c.quantity+' '+BILATERAL_PRODUCTS[c.product].unit+' · €'+(c.costB*1000).toFixed(3)+'M</p><p>'+(c.status==='DELIVERED'?'E dorëzuar':'Në pritje')+' · Afati: '+e(diplomaticDate(c.dueTurn))+'</p></article>';}).join('')+'</details></section>';
}
