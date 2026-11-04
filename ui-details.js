/* Presentation only. Values are text, never trusted HTML or simulation commands. */
function uiDetailEscape(value){return String(value??'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uiDetailRows(rows){
    return '<dl class="ui-details">'+rows.map(function(r){return '<div class="ui-detail-row"><dt><span class="ui-label">'+uiDetailEscape(r[0])+':</span></dt><dd><span class="'+(r[2]?'ui-value-highlight':'ui-value')+'">'+uiDetailEscape(r[1])+'</span></dd></div>';}).join('')+'</dl>';
}
var UI_DETAIL_LABELS=['Problemi','Institucioni','Sektori','Financimi','Kostoja dhe shuma për ndarje','Kostoja','Kosto','Kosto e konfigurimit','Buxheti aktual','Buxheti pas ndarjes së parë','Kohëzgjatja','Data e propozimit','Nisja','Afati','Afati i planifikuar','Progresi','Shpenzime të realizuara','Financim i mbetur për zbatim','Propozuesi','Ministria','Burimi','Krijuar','Publikimi','Numri','Statusi','Kompetenca','Përfitimet','Rreziku','Ndikimi i plotë i planifikuar','Rruga'];
function uiDetailHighlight(label){return /kosto|buxheti|kohëzgjatja|afati|shpenzime|financim i mbetur/i.test(label);}
// Conservative compatibility pass for older renderers: only explicit label-led
// paragraphs, never forms, links, buttons, dialogue/history or arbitrary colons.
function uiEnhanceDetails(root){
    if(!root?.querySelectorAll || typeof document.createElement!=='function')return;
    var labels=UI_DETAIL_LABELS.slice().sort(function(a,b){return b.length-a.length;}).map(function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|');
    var start=new RegExp('^\\s*(?:[•]\\s*)?('+labels+'):\\s*'),separator=new RegExp('\\s+[·•]\\s+(?=(?:'+labels+'):)','g');
    root.querySelectorAll('.card p, .modal-content p, [id$="ModalContent"] p, .candidate-card p, .catalog13 p, .municipal14 p').forEach(function(p){
        if(p.id || p.hasAttribute('onclick') || p.hasAttribute('role') || p.closest('.ui-details,form,[data-ui-prose],.meeting-transcript') || p.querySelector('a,button,input,select,textarea,progress,img,svg,code') || p.querySelector('[class^="ui-value"],.ui-label'))return;
        var parts=p.innerHTML.split(/<br\s*\/?\s*>/i),rows=[],notes=[];
        parts.forEach(function(part){var box=document.createElement('div');box.innerHTML=part;box.textContent.split(separator).forEach(function(text){var match=text.match(start);if(match)rows.push([match[1],text.slice(match[0].length),uiDetailHighlight(match[1])]);else if(text.trim())notes.push(text);});});
        if(!rows.length || notes.length || !start.test(p.textContent))return;
        var replacement=document.createElement('div');replacement.className='ui-detail-group';replacement.innerHTML=uiDetailRows(rows);notes.forEach(function(note){var n=document.createElement('p');n.className='ui-detail-note';n.textContent=note;replacement.appendChild(n);});p.replaceWith(replacement);
    });
}
if(typeof document!=='undefined' && typeof document.addEventListener==='function')document.addEventListener('toggle',function(event){if(event.target?.tagName==='DETAILS' && event.target.open)uiEnhanceDetails(event.target);},true);
