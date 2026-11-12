// Firebase is injected by index.html. No timers, realtime listeners or generic autosave hooks.
export function initAuthCloudSave(sdk, game, root = document) {
    const firebaseConfig = {
        apiKey: "AIzaSyCyWd3ANLIKxBRFkm_8WTNpBa4fruXEmwo",
        authDomain: "republika-5a30b.firebaseapp.com",
        projectId: "republika-5a30b",
        storageBucket: "republika-5a30b.firebasestorage.app",
        messagingSenderId: "297242074406",
        appId: "1:297242074406:web:22c9514ee2ac082d8835e7"
    };
    const app = sdk.initializeApp(firebaseConfig);
    const auth = sdk.getAuth(app);
    const db = sdk.getFirestore(app);
    const provider = new sdk.GoogleAuthProvider();
    const el = id => root.getElementById(id);
    const login = el('googleLoginBtn'), logout = el('googleLogoutBtn');
    const save = el('cloudSaveBtn'), load = el('cloudLoadBtn');
    const status = el('cloudSaveStatus'), account = el('cloudAccountName');
    const startLogin = el('startGoogleLoginBtn'), startContinue = el('startAuthenticatedContinueBtn');
    const startLoad = el('startCloudLoadBtn'), startAccount = el('startAuthAccount');
    let continueAfterLogin = false, resumeAfterLogout = false;
    const MAX_BYTES = 900000; // Leave room below Firestore's 1 MiB document limit.
    const COOLDOWN_MS = 60000;
    let user = null, observedUid, generation = 0, busy = false, signingIn = false;
    let checking = false, checked = false, cloudJSON = null, lastJSON = null, lastWrite = 0;
    const message = text => {
        status.textContent = text;
        if (el('startAuthStatus')) el('startAuthStatus').textContent = text;
    };
    const ref = uid => sdk.doc(db, 'users', uid, 'saves', 'current');
    const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;
    function render() {
        login.hidden = !!user;
        login.disabled = signingIn || busy;
        logout.hidden = !user;
        logout.disabled = busy;
        save.hidden = !user;
        save.disabled = busy || checking || !checked;
        load.hidden = !user || !cloudJSON;
        load.disabled = busy || checking;
        account.textContent = user ? (user.displayName || user.email || 'Llogari Google') : 'Mysafir';
        if (startLogin) {
            startLogin.hidden = !!user;
            startLogin.disabled = signingIn || busy;
            startContinue.hidden = !user;
            startContinue.disabled = busy || checking;
            startLoad.hidden = !user || !cloudJSON;
            startLoad.disabled = busy || checking;
            startAccount.textContent = user ? 'I identifikuar: ' + account.textContent : '';
            el('startGuestBtn').hidden = false;
            el('startGuestBtn').disabled = false;
        }
    }
    function errorMessage(error) {
        const code = error?.code;
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Hyrja u anulua. Loja lokale vazhdon.';
        if (code === 'auth/popup-blocked') return 'Lejoni dritaren e hyrjes me Google dhe provoni përsëri.';
        if (code === 'auth/unauthorized-domain') return 'Ky domain duhet autorizuar te Firebase Authentication.';
        if (code === 'permission-denied') return 'Qasja në Cloud u refuzua. Kontrolloni rregullat e Firestore ose prisni 60 sekonda pas ruajtjes së fundit.';
        if (code === 'resource-exhausted') return 'Kuota e Cloud është shteruar. Vazhdoni me ruajtjet lokale.';
        if (code === 'unavailable' || code === 'auth/network-request-failed') return 'Cloud nuk është i arritshëm. Loja lokale vazhdon.';
        return 'Veprimi në Cloud dështoi. Ruajtjet lokale mbeten të disponueshme.';
    }
    async function signIn(fromStart = false) {
        if (signingIn || busy) return;
        continueAfterLogin = fromStart;
        signingIn = true;
        render();
        try { await sdk.signInWithPopup(auth, provider); window.republikaGuestSession = false; }
        catch (error) { continueAfterLogin = false; message(errorMessage(error)); }
        finally { signingIn = false; render(); }
    }
    login.addEventListener('click', () => signIn(false));
    if (startLogin) {
        startLogin.addEventListener('click', () => signIn(true));
        startContinue.addEventListener('click', () => {
            if (!user || busy || checking) return;
            continueAfterLogin = false;
            if (resumeAfterLogout && game.shouldResumeAfterLogin?.() !== false) { resumeAfterLogout = false; game.resumeGame(); }
            else game.beginNewGame();
        });
    }
    logout.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        render();
        try {
            await sdk.signOut(auth);
            continueAfterLogin = false;
            resumeAfterLogout = true;
            game.returnToLogin?.();
        }
        catch (error) { message(errorMessage(error)); }
        finally { busy = false; render(); }
    });
    async function saveCloud(speechId = null) {
        if (!user || busy || checking || !checked) {
            if (speechId) message('Cloud kërkon llogari aktive, kontroll të përfunduar dhe asnjë ruajtje tjetër në proces.');
            return false;
        }
        if (!online()) { message('Nuk ka internet. Përdorni ruajtjen lokale.'); return; }
        const uid = user.uid, version = generation;
        busy = true;
        render();
        try {
            let json;
            try { json = game.exportJSON(); }
            catch (error) { message(error.message); return; }
            const payload = game.encodeJSON ? game.encodeJSON(json) : json;
            if (new TextEncoder().encode(payload).byteLength > MAX_BYTES) {
                message('Loja tejkalon madhësinë e lejuar për Cloud. Përdorni ruajtjet lokale.');
                return;
            }
            if (json === lastJSON) { message('Kjo gjendje është ruajtur tashmë në Cloud.'); return; }
            if (Date.now() - lastWrite < COOLDOWN_MS) {
                message('Prisni 60 sekonda mes ruajtjeve në Cloud.');
                return;
            }
            if (!speechId && cloudJSON && !window.confirm('Ruajtja ekzistuese në Cloud do të zëvendësohet. Vazhdo?')) return;
            message('Duke ruajtur në Cloud…');
            // Exactly one fixed-document write. Never call from saveGameAuto().
            await sdk.setDoc(ref(uid), { schemaVersion: 1, gameJSON: payload, updatedAt: sdk.serverTimestamp() });
            if (version !== generation) return;
            lastJSON = cloudJSON = json;
            lastWrite = Date.now();
            message('U ruajt me sukses në Cloud.');
            if (speechId) game.notify?.('Fjalimi dhe gjendja e lojës u ruajtën në Cloud.');
            return true;
        } catch (error) {
            if (version === generation) message(errorMessage(error));
        } finally { busy = false; render(); }
    }
    save.addEventListener('click', () => saveCloud());
    // Explicit final-speech action only. Uses the same account, codec and cooldown.
    window.republikaSaveSpeechCloud = async speechId => {
        const saved = await saveCloud(speechId);
        if (!saved) game.notify?.('Fjalimi u ruajt lokalisht. ' + status.textContent);
        return !!saved;
    };
    function loadCloudGame() {
        if (!user || !cloudJSON || busy || checking) return;
        if (!window.confirm('Ngarko lojën nga Cloud? Gjendja aktuale dhe autosave-i lokal do të zëvendësohen. Slotet lokale ruhen.')) return;
        try {
            game.importJSON(cloudJSON);
            continueAfterLogin = false;
            message('Loja u ngarkua nga Cloud dhe u ruajt lokalisht.');
        } catch (error) {
            message('Loja nga Cloud nuk u ngarkua: ' + error.message);
        }
    }
    load.addEventListener('click', loadCloudGame);
    if (startLoad) startLoad.addEventListener('click', loadCloudGame);
    render();
    sdk.onAuthStateChanged(auth, async nextUser => {
        const uid = nextUser?.uid || null;
        if (uid === observedUid) return; // Ignore token refreshes for the same account.
        observedUid = uid;
        const version = ++generation;
        user = nextUser;
        cloudJSON = lastJSON = null;
        lastWrite = 0;
        checking = !!user;
        checked = false;
        render();
        if (!user) { message('Ruajtja automatike është vetëm lokale.'); return; }
        message('Duke kontrolluar ruajtjen në Cloud…');
        try {
            // One direct server read per account sign-in; no collection query/listener.
            const snapshot = await sdk.getDocFromServer(ref(uid));
            if (version !== generation) return;
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.schemaVersion !== 1 || typeof data.gameJSON !== 'string' || new TextEncoder().encode(data.gameJSON).byteLength > MAX_BYTES) {
                    throw new Error('Invalid cloud save');
                }
                cloudJSON = lastJSON = game.decodeJSON ? game.decodeJSON(data.gameJSON) : data.gameJSON;
                JSON.parse(cloudJSON); // Reject corrupt payloads before offering Load.
                lastWrite = data.updatedAt?.toMillis?.() || 0;
                message('U gjet një lojë në Cloud. Zgjidhni “Ngarko nga Cloud” ose vazhdoni lokalisht.');
            } else message('Nuk ka ruajtje në Cloud. Loja vazhdon lokalisht.');
            checked = true;
        } catch (error) {
            if (version === generation) message(errorMessage(error) + ' Për ta kontrolluar sërish, dilni dhe hyni.');
        } finally {
            if (version === generation) {
                checking = false;
                render();
                if (continueAfterLogin) {
                    continueAfterLogin = false;
                    // Existing Cloud saves need an explicit choice before starting anew.
                    if (!el('startAuthStep')?.hidden) {
                        if (resumeAfterLogout && game.shouldResumeAfterLogin?.() !== false) { resumeAfterLogout = false; game.resumeGame(); }
                        else if (checked && !cloudJSON) game.beginNewGame();
                    }
                }
            }
        }
    }, error => { message(errorMessage(error)); });
}
