/* Acknowledgement belongs to the browser, not a campaign/save or cache version. */
(function(){
 'use strict';
 const release='2026-11-18-features',key='republika:release-notes:'+release;
 const groups=[
  {title:'Zgjedhjet dhe ekipi lokal',intro:'Ruajtje më e qëndrueshme në telefon dhe vendime që vazhdojnë pas fushatës.',items:[
   ['Hapja e votimit','Kompresim pa humbje kur hapësira lokale është e kufizuar dhe shpjegim i dukshëm nëse ruajtja nuk pranohet.'],
   ['Konsultimet dhe votimi i brendshëm','Zgjidh strategjinë me ekipin dhe mbaj votim dyjavor mes kandidatëve realë të listës.'],
   ['Debati dhe balotazhi','Përgatit kandidatin për shërbimet e komunës dhe vendos për mbështetje programore kur del i treti.'],
   ['Pas fitores komunale','Negocio mbështetjen komunale, kontrollo shërbimet e kryetarit dhe kërko raport për marrëveshjet.'],
   ['Verifikimi i rezultatit','Diferenca e ngushtë kontrollohet mbi votat e ruajtura, pa rigjeneruar rezultatin.']
  ]},
  {title:'Një natë zgjedhore me më shumë tension',intro:'Exit poll, partnerë, bastione dhe vendime deri te rezultati përfundimtar.',items:[
   ['Exit poll dhe reagimi yt','Prit rezultatin, fol me kujdes ose merr rrezikun e shpalljes së hershme të fitores.'],
   ['Oferta gjatë numërimit','Partnerët mund të kërkojnë zotime politike, që më pas lidhen me negociatat reale të koalicionit.'],
   ['Mesazhi nga bastioni','Komunat të përballin me projektet, premtimet dhe rezultatet e mandatit.'],
   ['Sfida brenda partisë','Votat personale mund të sjellin sfidues për drejtimin e partisë.'],
   ['Rezultati dhe verifikimi','Raporte territoriale, diaspora dhe mundësi verifikimi kur rezultati është i ngushtë.'],
   ['Bilanci pas zgjedhjeve','Shih mandatet, dallimin nga exit poll-i dhe kujtesën e mandatit, para formimit të institucioneve.']
  ]},
  {title:'Suksesi sjell përgjegjësi të reja',intro:'Investimet, shkollat, këshilltarët dhe reagimi në emergjencë kanë vazhdim.',items:[
   ['Qyteti nën presion','Investimet e përfunduara mund të shtojnë kërkesën për banim, shërbime dhe transport.'],
   ['Pyetja e nxënësit','Një shkollë e hapur para se të jetë funksionale mund të të vërë përballë pyetjeve para kamerave.'],
   ['Këshilltarët përballë rezultatit','Krahaso këshillat e ekipit me provën reale të pilotit; përshtate ose shtrije reformën sipas rezultatit.'],
   ['Gara rajonale për investitorin','Oferta alternative dhe afatet të detyrojnë të vlerësosh koston dhe kapacitetet reale.'],
   ['Opozita në emergjencë','Mund të shqyrtosh propozimin e kundërshtarit dhe të vendosësh si ndahet merita politike.']
  ]},
  {title:'Gjashtë dilema nga vendimet e tua',intro:'Diplomacia, shëndetësia, gjykatat dhe ekipi reagojnë ndaj historisë sate.',items:[
   ['Aleati i ftohur','Një marrëveshje e shkelur mund të mbyllë përkohësisht dyert për oferta dhe vizita të reja.'],
   ['Projekti shëndetësor dhe qasja','Krahaso vendndodhjen, alternativën dhe lidhjen e transportit para financimit.'],
   ['Raporti që mungonte','Përballu me shifrat negative që mungojnë në dosjen para një delegacioni.'],
   ['Fitove procedurën, por jo besimin','Pas shpronësimit, vendos për kompensimin plotësues, konsultimin ose zbatimin e vendimit.'],
   ['Figura që mëson nga ti','Një koleg mund të përdorë mesazhet e tua publike dhe të bëhet bashkëpunëtor ose rival.'],
   ['Qeveria kur je jashtë vendit','Zgjidh nëse nisesh në vizitë, kë autorizon gjatë emergjencës dhe si e mbështet ekipin kur kthehesh.']
  ]},
  {title:'Pasojat politike të mandatit',intro:'Prova para votës, kontrata që shtrenjtohen dhe kontrolli pas krizës.',items:[
   ['Nuk votojmë pa e parë rezultatin','Deputetë të grupit tënd mund të kërkojnë pilot të suksesshëm për një reformë konkrete.'],
   ['Fatura që ia ke lënë vetes','Kontrata që pranove hyn në fazën e shtrenjtë: vlerëso mirëmbajtjen dhe daljen nga ekskluziviteti.'],
   ['Ligji kaloi falë opozitës','Ligji mbetet i miratuar, por kundërshtimi brenda partisë të hap një betejë politike.'],
   ['Suksesi ka më shumë se një autor','Përfundo një projekt të trashëguar dhe vendos si e njeh kontributin e qeverisë së mëparshme.'],
   ['Kriza përfundoi, masat mbetën','Kthe kompetencat e përkohshme ose përballu me pasojat e mbajtjes së tyre.']
  ]},
  {title:'Histori politike që vijnë gjatë lojës',intro:'Dosje, intervista, marrëveshje parlamentare dhe presion brenda shumicës.',items:[
   ['Dosja e paraardhësit','Verifiko detyrimet reale dhe vendos çfarë publikon.'],
   ['Përballë qytetarit në televizion','Përgjigjet dhe premtimet e tua mund të rikthehen në transmetim drejtpërdrejt.'],
   ['Oferta e rivalit','Negocio për një ligj të caktuar brenda të njëjtit pop-up.'],
   ['Ora e humbur','Raporte kundërshtuese dhe minuta vendimtare gjatë një emergjence reale.'],
   ['Shumica që nuk bindet me urdhër','Deputetët me mandat personal kërkojnë kushte dhe llogaridhënie për reformën.']
  ]},
  {title:'Përballje të reja pas veprimeve të tua',intro:'Fjala private, inspektimet dhe presioni politik mund të rikthehen.',items:[
   ['Mikrofoni që mbeti hapur','Një përgjigje e regjistruar mund të të përballë me qëndrimin publik.'],
   ['Vizita pa paralajmërim','Inspekto objektet dhe verifiko nëse shërbimi funksionon realisht.'],
   ['Investitori dhe ministri','Përballo kërkesën për ndryshim në kabinet pa anashkaluar procedurat e koalicionit.'],
   ['Njeriu yt kërkon përjashtim','Zgjidh mes favorizimit politik, meritës dhe refuzimit.'],
   ['Komuna e fitoi çështjen','Trajto pengesën pronësore dhe vendimin ligjor pa humbur historinë e projektit.']
  ]}
 ];
 let acknowledged=false,previousFocus=null,dialog=null;
 function seen(){if(acknowledged)return true;for(const name of ['localStorage','sessionStorage'])try{if(window[name].getItem(key)==='seen')return true;}catch{}return false;}
 function remember(){acknowledged=true;for(const name of ['localStorage','sessionStorage'])try{window[name].setItem(key,'seen');}catch{}}
 function closed(){remember();document.body.classList.remove('release-notes-open');const target=previousFocus?.isConnected&&previousFocus!==document.body?previousFocus:document.querySelector('#startScreen .start-btn:not([hidden])');target?.focus({preventScroll:true});}
 function dismiss(){remember();if(dialog?.open)dialog.close();}
 function node(tag,text,className){const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;}
 function open(){
  if(seen())return false;
  dialog=document.getElementById('releaseNotesDialog');if(!dialog||typeof dialog.showModal!=='function'||dialog.open)return false;
  const host=document.getElementById('releaseNotesGroups');
  for(const group of groups){const details=node('details',null,'release-notes-group'),summary=node('summary');summary.append(node('span',group.title,'release-notes-group-title'),node('span',group.intro,'release-notes-group-intro'));const list=node('ul');for(const [title,description] of group.items){const item=node('li');item.append(node('strong',title),node('p',description));list.append(item);}details.append(summary,list);host.append(details);}
  previousFocus=document.activeElement;
  dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  dialog.addEventListener('close',closed,{once:true});
  for(const button of dialog.querySelectorAll('[data-release-notes-dismiss]'))button.addEventListener('click',dismiss);
  document.body.classList.add('release-notes-open');
  dialog.showModal();document.getElementById('releaseNotesContinue').focus({preventScroll:true});
  return true;
 }
 window.addEventListener('storage',event=>{if(event.key===key&&event.newValue==='seen'&&dialog?.open)dialog.close();});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',open,{once:true});else open();
})();
