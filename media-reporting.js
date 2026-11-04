/* Event-time reporting. No invented quotes, party reactions or retrospective state lookup. */
function immersiveCopy(value){
    return String(value??'').replace(/\s*\(simulim mediatik\)/gi,'').replace(/\bbrenda simulimit\b/gi,'').replace(/\bnë simulim\b/gi,'').replace(/\be simulimit\b/gi,'e procedurës').replace(/\bi simulimit\b/gi,'i procesit').replace(/\btë simulimit\b/gi,'të procesit').replace(/\b(?:i|e|të) simuluar(?:a)?\b/gi,'').replace(/\bsimuluar(?:a)?\b/gi,'').replace(/\bsimulimit\b/gi,'procesit').replace(/\bsimulim(?:i|et|eve)?\b/gi,'').replace(/\bsimulator(?:in|it)?\b/gi,'Republika').replace(/ {2,}/g,' ').replace(/ +([.,;:])/g,'$1').trim();
}
function mediaReportFor(n,context,body,reactions){
    var title=immersiveCopy(n.title),text=body || '',report={intro:title,development:'Ngjarja është regjistruar në '+(n.time||'kronologjinë e zhvillimeve')+'.',closing:'Ecuria e mëtejshme do të varet nga vendimet dhe veprimet e institucioneve përgjegjëse.',reactions:reactions||''};
    if(context?.kind==='VOTE'){
        report.intro='Kuvendi përfundoi votimin për “'+context.title+'”. '+(context.passed?'Dokumenti mori miratimin e deputetëve.':'Propozimi nuk arriti miratimin.');
        report.development='Në votim u regjistruan '+context.pro+' vota për, '+context.against+' kundër, '+context.abstain+' abstenime dhe '+context.absent+' mungesa. Pragu i votave për ishte '+context.required+'.'+(context.vital?' Kërkohej edhe shumica përkatëse e komuniteteve; u regjistruan '+context.minorityYes+' vota për nga deputetët e komuniteteve.':'');
        report.closing=context.passed?'Miratimi mbyll votimin; financimi dhe zbatimi vijojnë sipas procedurave të dokumentit.':'Dokumenti nuk është miratuar. Një përpjekje e re kërkon procedurën e rishqyrtimit dhe sigurimin e shumicës së nevojshme.';
    }else if(/(?:PËR|PRO),\s*\d+\s*KUNDËR/i.test(title)){
        report.intro='Kuvendi publikoi rezultatin e votimit.';report.development=title;report.closing='Përfundimi i votimit dhe vendimi për dokumentin ruhen në historikun parlamentar. Numri i votave lexohet sipas shumicës që kërkon dokumenti.';
    }else if(/cakton seancën|caktua për seancë/i.test(title)){
        report.intro=/Kryesia/i.test(title)?'Kryesia e Kuvendit ka përcaktuar mbledhjen e radhës plenare.':'Një projektligj është përfshirë në punimet e seancës plenare.';
        var session=title.match(/nr\.\s*(\d+)\s+me\s+(\d+)\s+pik/i);
        report.development=session?'Seanca nr. '+session[1]+' do të trajtojë '+session[2]+(Number(session[2])===1?' pikë të rendit të ditës.':' pika të rendit të ditës.')+' Dokumentet janë caktuar për shqyrtim në Kuvend.':title;
        report.closing='Caktimi në rendin e ditës nuk përbën miratim. Deputetët do të shprehen në votim sipas procedurës dhe shumicës së kërkuar.';
    }else if(/shkarkim|shkarko|larg.*ministr/i.test(title)){
        report.intro='Ndryshimet në kabinet kanë hapur një zhvillim të ri politik.';report.development=title+' Ndryshimi prek përbërjen e ekzekutivit dhe përfaqësimin e subjektit përkatës në kabinet.';report.closing='Vëmendja tani është te vazhdimësia e punës së ministrisë dhe hapat për plotësimin e përgjegjësive të saj.';
    }else if(/përfundon|përfundoi|përfunduar/i.test(title)){
        report.intro='Një proces i ndjekur nga institucionet ka mbërritur në përfundim.';report.development=title;report.closing='Rezultati dhe ecuria e regjistruar mund të ndiqen në dosjen përkatëse. Ndikimi vlerësohet nga ajo që është zbatuar, jo vetëm nga njoftimi.';
    }else if(/nis projekti|nis zbatimi|financ|investim/i.test(title)){
        report.intro='Institucionet kanë njoftuar një hap të ri në financimin ose zbatimin e angazhimeve publike.';report.development=title;report.closing='Nisja e procedurës nuk është përfundim i punës. Afati, pagesat dhe progresi ndiqen në dosjen përkatëse.';
    }else if(/marrëvesh|negoci|ratifik|diploma/i.test(title)){
        report.intro='Kontaktet ndërinstitucionale kanë sjellë një zhvillim të ri në procesin e bashkëpunimit.';report.development=title;report.closing='Hapat e ardhshëm varen nga statusi i marrëveshjes dhe përmbushja e kushteve të regjistruara; propozimi nuk barazohet me marrëveshje të zbatuar.';
    }else if(/skadon|afati|vonuar|dësht/i.test(title)){
        report.intro='Një çështje në pritje të institucioneve ka hyrë në një fazë vendimtare.';report.development=title;report.closing='Institucioni përgjegjës duhet të shqyrtojë gjendjen dhe veprimet ende të lejueshme. Afati i kaluar mbetet pjesë e historikut.';
    }
    if(text && !/Ky zhvillim vjen në një moment kyç/.test(text))report.development=immersiveCopy(text);
    report.reactions=/Përfaqësuesit e mazhorancës.*hap i domosdoshëm/.test(report.reactions)?'':immersiveCopy(report.reactions);
    return report;
}
function mediaArticleReport(n){
    // Older generic articles get a read-only presentation; saved history stays intact.
    return n.report || mediaReportFor(n,null,n.fullBody,n.reactions);
}
function immersiveNodeCopy(node){
    var before=node.nodeValue;
    if(node.parentElement?.tagName==='OPTION' && !node.parentElement.hasAttribute('value'))node.parentElement.setAttribute('value',node.parentElement.textContent);
    var after=(/^\s/.test(before)?' ':'')+immersiveCopy(before).replace(/\bsimul(?:im|uar|ator)[a-zëç]*/gi,'')+(/\s$/.test(before)?' ':'');
    if(after!==before)node.nodeValue=after;
}
function renderImmersiveCopy(root){
    if(!root || typeof document.createTreeWalker!=='function')return;
    var walker=document.createTreeWalker(root,4),node;
    while((node=walker.nextNode())){
        if(node.parentElement?.closest('script,style,textarea,input,[contenteditable="true"],code,pre'))continue;
        if(/simul(?:im|uar|ator)/i.test(node.nodeValue))immersiveNodeCopy(node);
    }
    root.querySelectorAll?.('[title],[aria-label],[placeholder]').forEach(function(el){['title','aria-label','placeholder'].forEach(function(key){var value=el.getAttribute(key);if(value && /simul(?:im|uar|ator)/i.test(value))el.setAttribute(key,immersiveCopy(value));});});
}
if(typeof document!=='undefined' && typeof document.addEventListener==='function')document.addEventListener('DOMContentLoaded',function(){
    renderImmersiveCopy(document.body);
    if(typeof MutationObserver!=='function')return;
    var observer=new MutationObserver(function(records){records.forEach(function(r){if(r.type==='characterData'){if(/simul(?:im|uar|ator)/i.test(r.target.nodeValue) && !r.target.parentElement?.closest('script,style,textarea,[contenteditable="true"],code,pre'))immersiveNodeCopy(r.target);}else if(r.type==='childList')r.addedNodes.forEach(function(n){if(n.nodeType===1)renderImmersiveCopy(n);else if(n.nodeType===3 && /simul(?:im|uar|ator)/i.test(n.nodeValue) && !n.parentElement?.closest('script,style,textarea,[contenteditable="true"],code,pre'))immersiveNodeCopy(n);});});});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
});
