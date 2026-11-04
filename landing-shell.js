/* Landing interactions do not wait for the simulation modules to download. No timer. */
function startNewGameFromScreen(){
    window.republikaNewGameRequested=true;
    if(window.republikaGuestSession){window.republikaLandingIntent='guest-new';return;}
    window.republikaLandingIntent='new';
    document.getElementById('startMenuContent').hidden=true;
    document.getElementById('startAuthStep').hidden=false;
}
function continueNewGameAsGuest(){
    // Guest access does not depend on Firebase or the simulation finishing loading.
    window.republikaGuestSession=true;
    window.republikaResumeAfterLogin=false;
    window.republikaLandingIntent=window.republikaNewGameRequested?'guest-new':'guest';
    try{localStorage.setItem('republika_local_session',JSON.stringify({mode:'guest',version:1}));}
    catch(error){/* Restricted storage must not block access to the menu. */}
    if(window.republikaNewGameRequested){
        if(window.republikaSimulationReady){
            window.republikaNewGameRequested=false;
            window.republikaLandingIntent=null;
            window.republikaCloudGame.beginNewGame();
        }else document.getElementById('startAuthStatus').textContent='Duke hapur zgjedhjen e skenarit…';
        return;
    }
    document.getElementById('startMenuContent').hidden=false;
    document.getElementById('startAuthStep').hidden=true;
    document.getElementById('startScreen').classList.remove('hidden');
    document.body.classList.add('start-screen-active');
}
function completeLandingBoot(){
    window.republikaSimulationReady=true;
    if(window.republikaLandingIntent==='guest')continueNewGameAsGuest();
    else if(window.republikaLandingIntent==='guest-new'){window.republikaNewGameRequested=false;window.republikaCloudGame.beginNewGame();}
    else if(window.republikaLandingIntent==='new')startNewGameFromScreen();
    window.republikaLandingIntent=null;
}
