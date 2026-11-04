/* Presentation only: move the same live tools panel, preserving IDs and game state. */
(function () {
    'use strict';
    const panel = document.getElementById('dashboardToolsPanel');
    const sheet = document.getElementById('dashboardToolsSheet');
    const launcher = document.getElementById('dashboardToolsButton');
    const close = document.getElementById('dashboardToolsClose');
    const content = document.getElementById('dashboardToolsSheetContent');
    if (typeof window.matchMedia !== 'function' || !panel || !sheet || !launcher || !close || !content) return;
    const mobile = window.matchMedia('(max-width: 767px)');
    const home = document.createComment('Dashboard tools return here on tablet/desktop');
    panel.before(home);
    let scrollY = 0;
    let toastHome = null;

    function closeSheet() {
        if (sheet.open) sheet.close();
    }
    function syncLayout() {
        if (mobile.matches) {
            if (panel.parentNode !== content) content.appendChild(panel);
        } else {
            closeSheet();
            home.after(panel);
        }
    }
    launcher.addEventListener('click', function () {
        if (!mobile.matches || sheet.open) return;
        scrollY = window.scrollY;
        const toast = document.getElementById('toast');
        if (toast) {
            toastHome = document.createComment('Toast returns here after tools close');
            toast.before(toastHome);
            sheet.appendChild(toast);
        }
        sheet.showModal();
        launcher.setAttribute('aria-expanded', 'true');
        // Fixed-body lock avoids background scrolling on iOS; restore exact position on close.
        document.body.style.setProperty('--sheet-scroll-y', '-' + scrollY + 'px');
        document.body.classList.add('dashboard-sheet-open');
        close.focus({ preventScroll: true });
    });
    close.addEventListener('click', closeSheet);
    sheet.addEventListener('close', function () {
        const toast = sheet.querySelector('#toast');
        if (toast && toastHome) toastHome.replaceWith(toast);
        toastHome = null;
        launcher.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('dashboard-sheet-open');
        document.body.style.removeProperty('--sheet-scroll-y');
        window.scrollTo({ top: scrollY, behavior: 'instant' });
        if (mobile.matches) launcher.focus({ preventScroll: true });
    });
    sheet.addEventListener('click', function (event) {
        if (event.target === sheet) {
            const bounds = sheet.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeSheet();
        }
        const action = event.target.closest('button[onclick]');
        if (action && /\b(openUXWorkspace|openUXRoleWorkspace|openUXAgenda|openSectorLaws|createConstitutionProposal)\s*\(/.test(action.getAttribute('onclick'))) {
            scrollY = 0;
            closeSheet();
        }
    });
    mobile.addEventListener('change', syncLayout);
    syncLayout();

    document.querySelectorAll('.stats-grid .stat-box[onclick]').forEach(function (stat) {
        stat.setAttribute('role', 'button');
        stat.tabIndex = 0;
        stat.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                stat.click();
            }
        });
    });
})();
