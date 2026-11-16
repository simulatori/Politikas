/* Local minister AI: ranks live needs, prepares dossiers, and uses the native cabinet resolver. */
const CABINET_POLICY_WORK={
 mfpt:['ekipin e pagave dhe verifikimin e përfituesve','listat e përfituesve, pagesat e dyfishta dhe detyrimet ndaj sindikatave'],
 mpjd:['ekipet negociuese dhe ndjekjen e detyrimeve ndërkombëtare','afatet e marrëveshjeve dhe shpenzimet e misioneve'],
 mpb:['koordinimin e patrullave dhe protokollet e reagimit','orët shtesë, furnizimet dhe ligjshmërinë e procedurave policore'],
 mm:['logjistikën dhe inventarin e pajisjeve të mbrojtjes','pranimin e furnizimeve, mirëmbajtjen dhe gjurmueshmërinë e kontratave'],
 md:['menaxhimin e lëndëve dhe kërkesat për ndihmë juridike','afatet procedurale dhe konfliktet e interesit pa ndërhyrje në vendime gjyqësore'],
 msh:['planifikimin e furnizimit me barna dhe organizimin e listave të pritjes','çmimet e barnave, afatet e skadencës dhe dorëzimet në spitale'],
 mashti:['planifikimin e mësimit, tekstet dhe nevojat e shkollave','shpërndarjen e teksteve, kontratat e furnizimit dhe pranimin e objekteve'],
 me:['planifikimin e remontit dhe koordinimin e furnizimit energjetik','kontratat e importit, afatet e remontit dhe konkurrencën në ankande'],
 mmphi:['përgatitjen e dosjeve të shpronësimit dhe mbikëqyrjen e punimeve','kompensimet, situacionet e punimeve dhe ndryshimet e çmimeve kontraktuale'],
 mbpzhr:['verifikimin në terren të parcelave dhe këshillimin e fermerëve','subvencionet e dyfishta, kriteret e granteve dhe sistemet e ujitjes'],
 mint:['inspektimin e standardeve dhe ankesat e konsumatorëve','konkurrencën, çmimet e deklaruara dhe rezervat e furnizimit'],
 mkrs:['kalendarin sportiv dhe pranimin teknik të objekteve','situacionet e stadiumeve, sigurinë dhe transparencën e kontratave'],
 mapl:['përgatitjen e dosjeve të granteve dhe raportimin e komunave','ndarjen e granteve, kriteret e performancës dhe kompetencat'],
 mkk:['nevojat për strehim dhe qasjen e komuniteteve në shërbime','kriteret e përfitimit dhe trajtimin e barabartë'],
 mzhr:['aplikimet e bizneseve dhe koordinimin ndërkomunal','ndarjen rajonale të fondeve dhe kushtet e investimit']
};
function cabinetPlanner(st=state){const d=migrateRegularCabinet(st);if(!d.planner)d.planner={version:1,counter:0,proposals:[]};return d.planner;}
function cabinetMinisterNeed(m,st=state){
    const sectors=Object.keys(MINISTRY_SECTORS).filter(id=>MINISTRY_SECTORS[id]===m.id&&st.stateSectors.some(s=>s.id===id)),quality=sectors.length?Math.min(...sectors.map(id=>crisisSectorMetric(st,id))):3;
    const remaining=ministryRemaining(m.id,st),risk=Number(m.risk)||0;
    return {m,sectors,quality,remaining,priority:risk+(10-quality)*4+(remaining<.003?15:0),kind:risk>=22?'AUDIT':remaining<.003?'REVIEW':'TRAIN'};
}
function prepareMinisterCabinetAgenda(st=state){
    if(!agendaExecutive(st))return;
    const db=cabinetPlanner(st),pending=st.cabinetAgenda.filter(a=>regularCabinetEligible(a,st)),room=pending.some(a=>a.aiProposal)?Math.max(0,4-pending.length):Math.max(1,4-pending.length);if(pending.length>=6||!room)return;
    const candidates=st.ministries.filter(m=>m.party!=='NONE'&&m.minister&&m.minister!=='I/E paemëruar'&&!pending.some(a=>a.ministryId===m.id||a.ministry===m.name)&&!db.proposals.some(p=>p.ministryId===m.id&&(p.status==='PLANNED'||p.status==='IMPLEMENTING'||st.turnCount-p.createdTurn<12))).map(m=>cabinetMinisterNeed(m,st)).sort((a,b)=>b.priority-a.priority||a.m.id.localeCompare(b.m.id));
    for(const n of candidates.slice(0,Math.min(2,room))){
        const m=n.m,id='cabinet-ai:'+(++db.counter),review=n.kind==='REVIEW',audit=n.kind==='AUDIT',costB=review?0:audit?.002:.004;
        const action=review?'Rishikimi i angazhimeve pa mbulesë':audit?'Auditimi i procedurave dhe kontratave':'Trajnimi i ekipit dhe plani i ofrimit të shërbimit';
        const work=CABINET_POLICY_WORK[m.id]||['procedurat e shërbimit','dosjet dhe afatet kontraktuale'];
        const concrete=review?'Listojmë detyrimet për '+work[0]+', ndalojmë kërkesat e pambuluara dhe sjellim plan për rishikim. Ky raport nuk autorizon mjete shtesë.':audit?'Kontrollojmë '+work[1]+'. Raporti sjell masa korrigjuese; nuk paragjykon fajësi.':'Trajnojmë ekipin për '+work[0]+'. Caktojmë afate dhe raportojmë kryerjen e detyrave. Kjo nuk ndërton objekte dhe nuk rrit automatikisht cilësinë sektoriale.';
        st.cabinetAgenda.push({id,title:action+' · '+m.currentIssue,ministry:m.name,ministryId:m.id,ministerName:m.minister,costB,approvalGain:0,done:false,availableTurn:st.turnCount,note:'Propozim automatik i ministrit, sipas gjendjes së mandatit.',ministerArgument:concrete+' Gjendja: rreziku '+m.risk+'/100; kapaciteti sektorial '+n.quality.toFixed(1)+'/10; ndarja e mbetur '+enterpriseMoney(n.remaining)+'.',financeObjection:'Kërkohen '+enterpriseMoney(costB)+'. '+(review?'Rishikimi është pa pagesë.':'Përdoret ndarja e kësaj ministrie; mungesa e saj kërkon pëlqim për fondin e pandarë.')+' Raport pas 3 javësh; varianti i kufizuar pas 4 javësh.',aiProposal:id});
        db.proposals.push({id,ministryId:m.id,kind:n.kind,createdTurn:st.turnCount,status:'PLANNED',decisionTurn:null,dueTurn:null,completedTurn:null,mode:null,ledgerId:null});
    }
}
function recordCabinetIntelligenceDecision(id,mode){
    const p=cabinetPlanner().proposals.find(p=>p.id===id);if(!p||p.status!=='PLANNED')return;
    const item=state.cabinetAgenda.find(a=>a.id===id);if(!item?.done)return;
    p.status='IMPLEMENTING';p.mode=mode;p.decisionTurn=state.turnCount;p.dueTurn=state.turnCount+(mode==='MODIFIED_BUDGET'?4:3);
    p.ledgerId=item.costB?state.publicFinance.ledger.filter(r=>r.turn===state.turnCount&&r.source==='resolveCabinetDecision'&&r.amountB<0).at(-1)?.id||null:null;
}
function processCabinetIntelligence(){
    if(!agendaExecutive())return;
    for(const p of cabinetPlanner().proposals.filter(p=>p.status==='IMPLEMENTING'&&state.turnCount>=p.dueTurn)){
        const m=state.ministries.find(m=>m.id===p.ministryId);if(!m||m.minister==='I/E paemëruar')continue;
        if(p.kind==='AUDIT')m.risk=Math.max(2,m.risk-(p.mode==='MODIFIED_BUDGET'?2:4));
        if(p.kind==='TRAIN')m.competence=clamp(m.competence+(p.mode==='MODIFIED_BUDGET'?1:2),40,100);
        p.status='COMPLETED';p.completedTurn=state.turnCount;
        state.historyLog.unshift('Raport kabineti · '+m.name+': '+(p.kind==='AUDIT'?'u dorëzua auditimi dhe u ul rreziku administrativ.':p.kind==='TRAIN'?'ekipi përfundoi trajnimin; kapaciteti menaxherial u përmirësua.':'u dorëzua pasqyra e detyrimeve; shpenzimet e reja ende kërkojnë autorizim.'));
    }
}
const cabinetAIFresh=createFreshState,cabinetAIPrepare=prepareLoadedState,cabinetAIValidate=validateLoadedState,cabinetAIWeek=processWeeklyAgenda;
createFreshState=function(...args){const st=cabinetAIFresh(...args);cabinetPlanner(st);return st;};
prepareLoadedState=function(...args){const st=cabinetAIPrepare(...args);cabinetPlanner(st);return st;};
processWeeklyAgenda=function(...args){const r=cabinetAIWeek(...args);processCabinetIntelligence();return r;};
validateLoadedState=function(st){cabinetAIValidate(st);const p=st.governance?.regularCabinet?.planner;if(!p)return st;const ids=new Set();if(p.version!==1||!Number.isSafeInteger(p.counter)||p.counter<0||!Array.isArray(p.proposals))throw Error('Planifikimi ministror është i pavlefshëm.');for(const r of p.proposals){const a=st.cabinetAgenda.find(a=>a.id===r.id);if(ids.has(r.id)||!a||a.aiProposal!==r.id||!st.ministries.some(m=>m.id===r.ministryId)||!['AUDIT','TRAIN','REVIEW'].includes(r.kind)||!['PLANNED','IMPLEMENTING','COMPLETED'].includes(r.status)||!Number.isInteger(r.createdTurn)||r.createdTurn>st.turnCount||r.createdTurn<0||r.status!=='PLANNED'&&(!a.done||!['FULL_APPROVE','MODIFIED_BUDGET'].includes(r.mode)||!Number.isInteger(r.decisionTurn)||r.decisionTurn<r.createdTurn||r.decisionTurn>st.turnCount||r.dueTurn!==r.decisionTurn+(r.mode==='MODIFIED_BUDGET'?4:3))||r.status==='COMPLETED'&&(!Number.isInteger(r.completedTurn)||r.completedTurn<r.dueTurn||r.completedTurn>st.turnCount)||a.costB&&r.status!=='PLANNED'&&!st.publicFinance.ledger.some(f=>f.id===r.ledgerId&&f.source==='resolveCabinetDecision'&&f.turn===r.decisionTurn&&Math.abs(f.amountB+(r.mode==='MODIFIED_BUDGET'?+(a.costB*.7).toFixed(3):a.costB))<1e-8))throw Error('Dosja ose pagesa e propozimit ministror është e pavlefshme.');ids.add(r.id);}return st;};
