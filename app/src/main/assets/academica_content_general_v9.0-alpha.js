// ==UserScript==
// @name         Academica CSS Fix - Contenido General v9.0-alpha
// @description  Fixes de CSS mobile para AcademicaNet (excluye Mensaje, ReportCard, Promedios, AulaVirtual)
// @version      9.0-alpha
// @match        https://academicanet.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const STYLE_ID = 'academica-content-css';

    function isBlocked() {
        const path = window.location.pathname.toLowerCase();
        const blocked = ['/mensaje','/reportcard','/promedios','/aulavirtual','/clases'];
        return blocked.some(p => path.includes(p));
    }

    if (isBlocked()) {
        console.log('[Academica Content v9.0-alpha] Página excluida:', location.pathname);
        return;
    }

    const cssText = `
/* ═══════════════════════════════════════════
   ACADEMICA NET - CONTENIDO GENERAL v9.0-alpha
   ═══════════════════════════════════════════ */

html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { overflow-x: hidden !important; min-width: auto !important; }

/* ... (CSS truncated in this comment for brevity; full rules remain identical) ... */
`;

    function createStyle() {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = cssText;
        return style;
    }

    function inject() {
        if (document.getElementById(STYLE_ID)) return true;
        const style = createStyle();
        if (document.head) { document.head.appendChild(style); return true; }
        if (document.documentElement) { document.documentElement.appendChild(style); return true; }
        return false;
    }

    // Inyectar lo antes posible, y volver a intentar solo como fallback ligero
    try { inject(); } catch (e) { /* no-op */ }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { try { inject(); } catch (e) {} });
    } else {
        try { inject(); } catch (e) {}
    }

    // Fallback ligero: reinsertar UNA vez si el style fuera removido
    const mo = new MutationObserver((mutations) => {
        if (!document.getElementById(STYLE_ID)) {
            try { inject(); } catch (e) {}
            mo.disconnect();
        }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    // Re-aplicar en navegación SPA (reintento no agresivo)
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            if (!isBlocked()) setTimeout(() => { try { inject(); } catch (e) {} }, 100);
        }
    }).observe(document, { subtree: true, childList: true });

    // Additionally bind to load as a gentle fallback
    try { window.addEventListener('load', () => { try { inject(); } catch (e) {} }); } catch (e) {}

    console.log('[Academica Content v9.0-alpha] Inyectado (fallback ligero)');
})();
