/* HTTP(S) only. File previews and browsers without service workers keep working. */
(function(){
    let registration=null,checking=false;
    function status(message){const el=document.getElementById('pwaUpdateStatus');if(el)el.textContent=message;}
    function waiting(){return !!registration?.waiting;}
    function render(){
        const badge=document.getElementById('pwaUpdateBadge');if(badge)badge.hidden=!waiting();
        status(waiting()?'Version i ri gati. Ruaj lojën, mbylli të gjitha skedat dhe dritaret e Republikës, pastaj rihape. Rifreskimi i vetëm i faqes nuk e aktivizon domosdoshmërisht përditësimin.':registration?.installing?'Duke përgatitur versionin offline. Versioni aktual vazhdon të punojë.':'Versioni aktual mbetet aktiv. Përditësimet nuk e ndërpresin lojën ose votimin.');
    }
    window.republikaPWA={
        check:async function(){
            if(!registration){status('Përditësimi kërkon HTTPS/localhost dhe mbështetje PWA në shfletues.');return false;}
            if(checking)return false;checking=true;
            try{status('Duke kontrolluar përditësimet…');await registration.update();render();return true;}
            catch(error){status('Kontrolli nuk u krye. Kontrollo lidhjen me internetin; versioni offline dhe ruajtjet lokale mbeten në pajisje.');return false;}
            finally{checking=false;}
        },
        save: function(){
            if(typeof state==='undefined'||!state||!document.getElementById('startScreen')?.classList.contains('hidden')){status('Hap lojën lokale përpara ruajtjes. Ruajtja ekzistuese nuk u ndryshua.');return false;}
            if(weeklyProcessing||weeklyVisualBusy||state.pendingVote||state.weekCalendar?.transition){status('Përfundo javën ose votimin përpara ruajtjes dhe mbylljes.');return false;}
            try{window.republikaCloudGame.exportJSON();if(!saveGameAuto())throw Error('Ruajtja lokale dështoi.');status('Loja u ruajt lokalisht. Mund të shkarkosh edhe kopjen JSON më sipër. '+(waiting()?'Mbylli të gjitha dritaret e Republikës dhe rihape për versionin e ri.':'Versioni aktual mbetet aktiv.'));return true;}
            catch(error){status('Ruajtja nuk u konfirmua. Mos e mbyll lojën; provo sërish ose shkarko një kopje JSON.');return false;}
        }
    };
    if(typeof navigator==='undefined'||!('serviceWorker' in navigator)||typeof location==='undefined'||!/^https?:$/.test(location.protocol))return;
    window.addEventListener('load',function(){
        navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).then(function(reg){
            registration=reg;render();
            function watch(worker){if(!worker)return;worker.addEventListener('statechange',function(){if(worker.state==='installed'||worker.state==='activated'||worker.state==='redundant')render();});}
            watch(reg.installing);reg.addEventListener('updatefound',function(){watch(reg.installing);});
        }).catch(function(error){status('PWA nuk u aktivizua. Loja mund të përdoret online; ruajtja lokale është e veçantë nga cache-i.');console.warn('PWA registration unavailable:',error.name);});
    });
    navigator.serviceWorker.addEventListener('controllerchange',render);
})();
