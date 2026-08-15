// ==UserScript==
// @name         Academica Login Cleanup v9.0-alpha
// @description  Limpia SOLO la pagina de login (academicanet.com/ o /index) y deja la caja del usuario centrada
// @version      9.0-alpha
// @match        https://academicanet.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const STYLE_ID = 'academica-login-css';

    function isLogin() {
        const path = (location.pathname || '/').toLowerCase();
        const href = (location.href || '').toLowerCase();
        return (
            path === '/' ||
            path === '/index' ||
            path.endsWith('/index') ||
            /\/views\/account\/login/i.test(path) ||
            (/academicanet\.com\/?(\?|#|$)/.test(href) && !/welcome/i.test(href))
        );
    }

    if (!isLogin()) {
        console.log('[Academica Login v9.0-alpha] No es login, saliendo');
        return;
    }

    // NOTE: main CSS is injected via interceptor as academica_login.css
    // This script keeps DOM cleanup and input fixes as a lightweight fallback.

    function fixLoginIcons() {
        const forms = document.querySelectorAll('.contact__form, form.login-form, body > form');
        forms.forEach(form => {
            const passwordWrappers = form.querySelectorAll('.position-relative, .has-icon-left');
            passwordWrappers.forEach(wrap => {
                const hasPassword = wrap.querySelector('input[type="password"]');
                if (hasPassword) {
                    const icon = wrap.querySelector('.form-control-position, i, .icon, .feather, span.icon');
                    if (icon) {
                        icon.setAttribute('data-side', 'right');
                        if (['A','SPAN','I'].includes(icon.tagName)) {
                            icon.style.pointerEvents = 'auto';
                        }
                    }
                }
            });
        });
    }

    function hideEverythingExceptForm() {
        // Ocultar hijos directos de body que no contengan el formulario
        Array.from(document.body.children).forEach(child => {
            if (child === document.documentElement) return;
            if (child.querySelector && child.querySelector('.contact__form, form.login-form, body > form, .login-wrapper')) return;
            // Si contiene algo que puede ser el form, conservar
            if (child.matches && (child.matches('.contact__form') || child.matches('form.login-form') || child.matches('.login-wrapper'))) return;
            child.style.display = 'none';
        });
    }

    function runCleanupOnce() {
        try { hideEverythingExceptForm(); } catch (e) {}
        try { fixLoginIcons(); } catch (e) {}
    }

    // Run early and once; re-run later as gentle fallback
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCleanupOnce);
    } else {
        setTimeout(runCleanupOnce, 0);
    }

    // Lightweight observer: reapply once on SPA navigation or when new direct children appear
    let lastUrl = location.href;
    const spaObserver = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(runCleanupOnce, 300);
        }
    });
    spaObserver.observe(document, { subtree: true, childList: true });

    const bodyObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.querySelector && node.querySelector('.contact__form, form.login-form, .login-wrapper')) continue;
                node.style.display = 'none';
            }
        }
    });
    // Observe for a short period (5s) to catch late banners, then disconnect
    bodyObserver.observe(document.body, { childList: true });
    setTimeout(() => { try { bodyObserver.disconnect(); } catch (e) {} }, 5000);

    // Also bind a gentle load fallback
    try { window.addEventListener('load', () => setTimeout(runCleanupOnce, 100)); } catch (e) {}

    console.log('[Academica Login v9.0-alpha] Inyectado (fallback ligero)');
})();
