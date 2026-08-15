// ==UserScript==
// @name         Academica Welcome Cleanup v9.0-alpha
// @description  Oculta SOLO los items especificos del menu en la pagina de Welcome
// @version      9.0-alpha
// @match        https://academicanet.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Solo actuar en Welcome. En login no hay menú que limpiar.
    const isWelcome = () => /Welcome|Index/i.test(location.pathname) || /Welcome|Index/i.test(location.href);
    if (!isWelcome()) {
        console.log('[Academica Welcome Cleanup v9.0-alpha] No es Welcome, saliendo');
        return;
    }

    // Lista EXACTA de hrefs que vamos a ocultar.
    // Se matchea por inclusion, pero el href debe contener UNO de estos
    // y NO debe contener otros marcadores.
    const HIDDEN_HREFS = [
        'InformeDiario',
        'PlanEstudio',
        'Enlaces/Index'
    ];

    // Textos EXACTOS de los <a> que vamos a ocultar (trim, sin hijos).
    // Comparamos SOLO el texto del <a>, NO de su contenedor.
    const HIDDEN_LINK_TEXTS = [
        'Informe Diario',
        'Plan de Estudio',
        'Recursos Digitales'
    ];

    // Texto exacto que se compara con strict equality tras trim.
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

    function hideElement(el) {
        if (!el || el.dataset.academicaHidden === '1') return;
        el.dataset.academicaHidden = '1';
        // Usa visibility:hidden + height:0 para no romper el flex del UL padre.
        el.style.display = 'none';
    }

    function cleanupWelcome() {
        if (!isWelcome()) return;

        // 1) Por href: aplicamos SOLO a <a> cuyo href contenga uno de los HIDDEN_HREFS.
        document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (!HIDDEN_HREFS.some(u => href.includes(u))) return;

            // Sube al <li> contenedor (uno o dos niveles arriba) y ocultalo.
            let target = a;
            for (let i = 0; i < 4 && target && target !== document.body; i++) {
                if (target.tagName === 'LI') { hideElement(target); return; }
                target = target.parentElement;
            }
            hideElement(a);
        });

        // 2) Por texto EXACTO del <a>. NUNCA matching por contenedor, porque ahí
        //    textContent incluye TODOS los hijos y borra todo el menú.
        document.querySelectorAll('a').forEach(a => {
            // Ignorar si ya fue ocultado por href.
            if (a.closest('li')?.dataset.academicaHidden === '1') return;

            const text = norm(a.textContent);
            if (!text) return;
            if (!HIDDEN_LINK_TEXTS.includes(text)) return;

            // Sube al <li> contenedor.
            let target = a;
            for (let i = 0; i < 4 && target && target !== document.body; i++) {
                if (target.tagName === 'LI') { hideElement(target); return; }
                target = target.parentElement;
            }
            hideElement(a);
        });

        console.log('[Academica Welcome Cleanup v9.0-alpha] cleanup aplicado');
    }

    // Espera a que el menú esté en el DOM antes de actuar.
    function waitForMenuAndRun() {
        const menu = document.querySelector('.navigation, .main-menu, .sidebar, aside');
        if (menu) {
            cleanupWelcome();
            return;
        }
        // Si todavía no existe, reintenta con un observer.
        const mo = new MutationObserver(() => {
            if (document.querySelector('.navigation, .main-menu, .sidebar, aside')) {
                mo.disconnect();
                cleanupWelcome();
            }
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
        // Safety timeout: si en 5s no aparece menú, igual corre cleanup
        // (por si la página no tiene sidebar, ej. tras login).
        setTimeout(() => { mo.disconnect(); cleanupWelcome(); }, 5000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForMenuAndRun);
    } else {
        waitForMenuAndRun();
    }

    // Re-ejecutar en navegación SPA (cambios de URL).
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(waitForMenuAndRun, 500);
        }
    }).observe(document, { subtree: true, childList: true });

    console.log('[Academica Welcome Cleanup v9.0-alpha] Inyectado');
})();
