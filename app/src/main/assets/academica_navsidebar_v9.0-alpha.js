// ==UserScript==
// @name         Academica CSS Fix - Navbar & Sidebar v9.0-alpha
// @description  Navbar glassmorphism, sidebar styling, fondo hexagonal global y fixes de layout para AcademicaNet
// @version      9.0-alpha
// @match        https://academicanet.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const STYLE_ID = 'academica-navsidebar-css';

    const cssText = `
/* ═══════════════════════════════════════════
   ACADEMICA NET - NAVBAR & SIDEBAR v9.0-alpha
   ═══════════════════════════════════════════ */

html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { overflow-x: hidden !important; min-width: auto !important; }

/* ... full CSS preserved in the separate asset; this JS acts as a lightweight fallback only ... */
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

    // Try to inject as early as possible; act only as fallback if interceptor didn't add CSS
    try { inject(); } catch (e) { /* no-op */ }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { try { inject(); } catch (e) {} });
    } else {
        try { inject(); } catch (e) {}
    }

    // Lightweight fallback: if style is removed, re-insert once
    const mo = new MutationObserver((mutations) => {
        if (!document.getElementById(STYLE_ID)) {
            try { inject(); } catch (e) {}
            mo.disconnect();
        }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    // React to SPA navigation: attempt a single re-injection after URL change
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(() => { try { inject(); } catch (e) {} }, 100);
        }
    }).observe(document, { subtree: true, childList: true });

    // Gentle load fallback
    try { window.addEventListener('load', () => { try { inject(); } catch (e) {} }); } catch (e) {}

    console.log('[Academica NavSidebar v9.0-alpha] Inyectado (fallback ligero)');
})();
