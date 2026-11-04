/* HTTP(S) only. File previews and browsers without service workers keep working. */
(function(){
    if(typeof navigator==='undefined'||!('serviceWorker' in navigator)||typeof location==='undefined'||!/^https?:$/.test(location.protocol))return;
    window.addEventListener('load',function(){
        navigator.serviceWorker.register('./service-worker.js',{scope:'./',updateViaCache:'none'}).catch(function(error){console.warn('PWA registration unavailable:',error.name);});
    });
})();
