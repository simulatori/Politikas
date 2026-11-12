/* Explicit, saved updates. Incomplete installations keep the previous offline release. */
(function(){
    const PAGE_VERSION='v105';
    let registration=null,checking=false,applying=false,reloadForUpdate=false;
    function status(message){for(const id of ['pwaUpdateStatus','pwaUpdateNoticeText']){const el=document.getElementById(id);if(el)el.textContent=message;}}
    function waiting(){return !!registration?.waiting;}
    function busy(){return (typeof weeklyProcessing!=='undefined'&&weeklyProcessing)||(typeof weeklyVisualBusy!=='undefined'&&weeklyVisualBusy)||(typeof state!=='undefined'&&(state?.pendingVote||state?.weekCalendar?.transition));}
    function playing(){return typeof state!=='undefined'&&state&&document.getElementById('startScreen')?.classList.contains('hidden');}
    function send(worker,type){return new Promise((resolve,reject)=>{const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();reject(Error('TIMEOUT'));},5000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();resolve(e.data);};worker.postMessage({type},[channel.port2]);});}
    function render(){
        const ready=waiting();
        const badge=document.getElementById('pwaUpdateBadge');if(badge)badge.hidden=!ready;
        const notice=document.getElementById('pwaUpdateNotice');if(notice)notice.hidden=!ready;
        for(const el of document.querySelectorAll('[data-pwa-apply]'))el.hidden=!ready;
        status(ready?'Version i ri gati. Ruaje dhe aktivizoje me butonin më poshtë. Nëse ke dritare të tjera të lojës, ruaji dhe mbylli paraprakisht.':registration?.installing?'Duke shkarkuar versionin e plotë të lojës…':'Versioni i hapur: '+PAGE_VERSION+'. Përditësimet nuk e ndërpresin lojën.');
    }
    async function version(){
        try{const result=await send(navigator.serviceWorker.controller,'GET_VERSION');const el=document.getElementById('pwaVersion');if(el)el.textContent='Loja '+PAGE_VERSION+' · offline '+result.version;}catch{}
    }
    window.republikaPWA={
        check:async function(){
            if(!registration){status('Përditësimi kërkon HTTPS/localhost dhe mbështetje PWA në shfletues.');return false;}
            if(checking)return false;checking=true;
            try{status('Duke kontrolluar përditësimet…');await registration.update();render();return true;}
            catch{status('Kontrolli nuk u krye. Kontrollo internetin. Versioni offline dhe ruajtjet lokale mbeten në pajisje.');return false;}
            finally{checking=false;}
        },
        save:function(){
            if(!playing()){status('Hap lojën lokale përpara ruajtjes. Ruajtja ekzistuese nuk u ndryshua.');return false;}
            if(busy()){status('Përfundo javën ose votimin përpara ruajtjes.');return false;}
            try{window.republikaCloudGame.exportJSON();if(!saveGameAuto())throw Error('SAVE');status('Loja u ruajt lokalisht. Mund të shkarkosh edhe kopjen JSON.');return true;}
            catch{status('Ruajtja nuk u konfirmua. Mos e mbyll lojën; provo sërish ose shkarko kopjen JSON.');return false;}
        },
        apply:async function(){
            if(!waiting()||applying)return false;
            if(busy()){status('Përfundo javën ose votimin para aktivizimit.');return false;}
            applying=true;
            try{
                if(playing()&&!saveGameAuto())throw Error('SAVE');
                reloadForUpdate=true;
                const result=await send(registration.waiting,'ACTIVATE_UPDATE');
                if(!result.ok){reloadForUpdate=false;status('Ruaji dhe mbylli dritaret e tjera të Republikës, pastaj provo aktivizimin përsëri.');return false;}
                status('Loja u ruajt. Duke aktivizuar versionin e ri…');return true;
            }catch{reloadForUpdate=false;status('Aktivizimi nuk u konfirmua. Ruajtjet mbeten në pajisje. Nëse përdor version të vjetër, ruaji dhe mbylli të gjitha dritaret e lojës, pastaj rihape.');return false;}
            finally{applying=false;}
        }
    };
    if(typeof navigator==='undefined'||!('serviceWorker' in navigator)||typeof location==='undefined'||!/^https?:$/.test(location.protocol))return;
    window.addEventListener('load',function(){
        navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).then(function(reg){
            registration=reg;render();version();
            function watch(worker){if(!worker)return;worker.addEventListener('statechange',function(){if(['installed','activated','redundant'].includes(worker.state))render();});}
            watch(reg.installing);reg.addEventListener('updatefound',function(){watch(reg.installing);});
            reg.update().catch(()=>{});
        }).catch(function(error){status('PWA nuk u aktivizua. Loja mund të përdoret online; ruajtja lokale është e veçantë nga cache-i.');console.warn('PWA registration unavailable:',error.name);});
    });
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&registration)window.republikaPWA.check();});
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadForUpdate){reloadForUpdate=false;location.reload();return;}render();version();});
})();
