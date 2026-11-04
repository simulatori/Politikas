/* Increment CACHE_VERSION when shipping changed JS/CSS/HTML or replacement icons.
   Keep CORE_ASSETS aligned with local script dependencies in index.html.
   Cache only this game's static shell. Never cache Auth, Firestore or user saves.
   The next version activates after all windows using the previous version close. */
const CACHE_VERSION='v48';
const CACHE_PREFIX='republika-shell:'+self.registration.scope+':';
const CACHE_NAME=CACHE_PREFIX+CACHE_VERSION;
const CORE_ASSETS=[
    "./index.html",
    "./landing-shell.js",
    "./style.css",
    "./manifest.json",
    "./logo.png",
    "./icon-192.png",
    "./icon-512.png",
    "./pwa-icon.svg",
    "./auth-cloud-save.js",
    "./candidate-lists.js",
    "./ui-details.js",
    "./media-reporting.js",
    "./brochure-data.js",
    "./brochure.js",
    "./candidates.js",
    "./campaign.js",
    "./election-day.js",
    "./assembly-allocation.js",
    "./assembly-publication.js",
    "./constituent-session.js",
    "./election-access.js",
    "./post-election-flow.js",
    "./governance-flow.js",
    "./political-systems-update.js",
    "./media-market.js",
    "./strategic-economy.js",
    "./political-engagement.js",
    "./deputy-mandates.js",
    "./international-diplomacy.js",
    "./agreement-documents.js",
    "./diplomatic-report.js",
    "./meeting-visuals.js",
    "./state-calendar.js",
    "./municipal-development.js",
    "./state-development.js",
    "./catalog-view.js",
    "./urgent-situations.js",
    "./election-preparation.js",
    "./election-counting.js",
    "./public-support.js",
    "./political-roles.js",
    "./presidency.js",
    "./economic-pilot.js",
    "./public-finance.js",
    "./finance-extension.js",
    "./weekly-agenda.js",
    "./law-negotiations.js",
    "./script.js",
    "./sector-laws.js",
    "./ux-guidance.js",
    "./mandate-experience.js",
    "./constitution-dark-politics.js",
    "./street-protests.js",
    "./security-ops.js",
    "./foreign-investments-legacy.js",
    "./investor-database.js",
    "./foreign-investments.js",
    "./sector-management.js",
    "./sector-expansion-data.js",
    "./sector-expansion.js",
    "./responsive-ui.js",
    "./coalition-dynamics.js",
    "./coalition-blackmail.js",
    "./opposition-logic.js",
    "./government-crises.js",
    "./diplomacy-dashboard.js",
    "./constitutional-court.js",
    "./interest-groups.js",
    "./electoral-promises.js",
    "./state-enterprises.js",
    "./intelligence-agency.js",
    "./national-emergencies.js",
    "./population.js",
    "./labor-exodus.js",
    "./diaspora.js",
    "./diaspora-mobilization.js",
    "./north-crisis.js",
    "./dinar-crisis.js",
    "./internal-pressure.js",
    "./media-dossiers.js",
    "./media-bomb.js",
    "./highway-project.js",
    "./sovereign-fund.js",
    "./trepca-strike.js",
    "./rtk-battle.js",
    "./energy-inquiry.js",
    "./council-europe.js",
    "./winter-energy.js",
    "./general-strike.js",
    "./municipal-grants.js",
    "./association-ultimatum.js",
    "./enterprise-boards.js",
    "./personnel-data.js",
    "./personnel-registry.js",
    "./law-implementation.js",
    "./unions.js",
    "./security-crises.js",
    "./imf-crisis.js",
    "./media-warfare.js",
    "./local-candidates-data.js",
    "./local-candidates.json",
    "./local-elections.js",
    "./brussels-special.js",
    "./rogue-ministers.js",
    "./veterans-audit.js",
    "./veterans-budget.js",
    "./survival-crises-ui.js",
    "./cabinet-management.js",
    "./institutional-conflicts.js",
    "./justice-reform.js",
    "./informal-economy.js",
    "./local-obstructions.js",
    "./pwa-registration.js",
    "./government-notifications.js"
];
const CORE_URLS=CORE_ASSETS.map(path=>new URL(path,self.registration.scope).href);
const ALLOWED_PATHS=new Set(CORE_URLS.map(url=>new URL(url).pathname));
// Cache the landing logo when available; a missing optional image must not block installation.
const LANDING_LOGO_PATH=new URL('./assets/logo.png',self.registration.scope).pathname;
ALLOWED_PATHS.add(LANDING_LOGO_PATH);
const SCOPE_PATH=new URL(self.registration.scope).pathname;
self.addEventListener('install',event=>{
    event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.all([
        cache.addAll(CORE_URLS.map(url=>new Request(url,{cache:'reload'}))),
        // Prewarm the logo too; missing artwork must not prevent installation.
        cache.add(new Request(new URL('./assets/logo.png',self.registration.scope).href,{cache:'reload'})).catch(()=>{})
    ])));
});
self.addEventListener('activate',event=>{
    event.waitUntil((async()=>{
        const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)));
        await self.clients.claim();
    })());
});
self.addEventListener('fetch',event=>{
    const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
    const shellNavigation=req.mode==='navigate'&&(url.pathname===SCOPE_PATH||url.pathname===SCOPE_PATH+'index.html');
    if(!shellNavigation&&!ALLOWED_PATHS.has(url.pathname))return;
    event.respondWith((async()=>{
        const cache=await caches.open(CACHE_NAME),key=shellNavigation?new URL('./index.html',self.registration.scope).href:url.origin+url.pathname;
        const cached=await cache.match(key);if(cached)return cached;
        const response=await fetch(req);
        if(url.pathname===LANDING_LOGO_PATH&&response.ok)await cache.put(key,response.clone());
        return response;
    })());
});
