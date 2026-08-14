// ==UserScript==
// @name         Academica Welcome Cleanup v9.0-alpha
// @description  Oculta botones no usados en la pagina de Welcome
// @version      9.0-alpha
// @match        https://academicanet.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const HIDDEN_URLS = ['InformeDiario', 'PlanEstudio', 'Enlaces'];
    const HIDDEN_TEXTS = ['Informe Diario', 'Plan de Estudio', 'Recursos Digitales'];

    function cleanupWelcome() {
        // Ocultar por href
        document.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (HIDDEN_URLS.some(u => href.includes(u))) {
                // Ocultar el link y su contenedor padre (li, div, etc)
                let el = a;
                while (el && el.tagName !== 'BODY' && !el.classList.contains('navigation') && !el.classList.contains('main-menu')) {
                    if (el.tagName === 'LI' || el.classList.contains('nav-item') || el.classList.contains('menu-item')) {
                        el.style.display = 'none';
                        return;
                    }
                    el = el.parentElement;
                }
                a.style.display = 'none';
            }
        });

        // Ocultar por texto (fallback)
        document.querySelectorAll('a, span, div').forEach(el => {
            const text = el.textContent.trim();
            if (HIDDEN_TEXTS.some(t => text === t || text.includes(t))) {
                let parent = el;
                while (parent && parent.tagName !== 'BODY' && !parent.classList.contains('navigation') && !parent.classList.contains('main-menu')) {
                    if (parent.tagName === 'LI' || parent.classList.contains('nav-item') || parent.classList.contains('menu-item')) {
                        parent.style.display = 'none';
                        return;
                    }
                    parent = parent.parentElement;
                }
                el.style.display = 'none';
            }
        });
    }

    // Ejecutar al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanupWelcome);
    } else {
        cleanupWelcome();
    }

    // Re-ejecutar en cambios SPA
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(cleanupWelcome, 500);
        }
    }).observe(document, { subtree: true, childList: true });

    console.log('[Academica Welcome Cleanup v9.0-alpha] Inyectado');
})();
