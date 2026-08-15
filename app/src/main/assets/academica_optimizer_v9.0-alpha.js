// ==UserScript==
// @name         Academica Optimizer v9.0-alpha
// @description  Optimizaciones de performance pasivas para AcademicaNet. NO intercepta scroll, AJAX, ni event listeners.
// @version      9.0-alpha
// @match        https://academicanet.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Academica Optimizer v9.0-alpha] Iniciando optimizaciones pasivas...');

    /* ═══════════════════════════════════════════
       1. PRECONNECT A RECURSOS CRÍTICOS
       ═══════════════════════════════════════════ */
    const preconnect = (href) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        if (document.head) document.head.appendChild(link);
    };

    preconnect('https://fonts.googleapis.com');
    preconnect('https://fonts.gstatic.com');
    preconnect('https://connect.facebook.net');

    /* ═══════════════════════════════════════════
       2. LAZY LOADING NATIVO PARA IMÁGENES
       Solo aplica a imágenes fuera del viewport inicial
       ═══════════════════════════════════════════ */
    const applyLazyLoading = () => {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach((img, index) => {
            // Solo las primeras 6 imágenes del viewport inicial no llevan lazy
            // El resto sí
            if (index > 5 || img.getBoundingClientRect().top > window.innerHeight) {
                img.loading = 'lazy';
            }
        });
    };

    applyLazyLoading();

    /* ═══════════════════════════════════════════
       3. REDUCIR REPAINTS EN SCROLL
       will-change en elementos fijos (solo los que controlamos)
       ═══════════════════════════════════════════ */
    const optimizeFixedElements = () => {
        const fixed = document.querySelectorAll('.navbar, .header-navbar, .main-menu, .kt-sticky-toolbar');
        fixed.forEach(el => {
            el.style.willChange = 'transform';
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', optimizeFixedElements);
    } else {
        optimizeFixedElements();
    }

    /* ═══════════════════════════════════════════
       4. PRECARGAR CONTENIDO CERCANO (progresivo)
       IntersectionObserver bien calibrado:
       - rootMargin: 200% del viewport (2 pantallas adelante)
       - threshold: 0 (cualquier píxel visible dispara)
       - NO bloquea contenido, solo precarga recursos
       ═══════════════════════════════════════════ */
    const setupProgressivePreload = () => {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    // Precargar imágenes dentro de este contenedor
                    const imgs = el.querySelectorAll('img[data-src]');
                    imgs.forEach(img => {
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                    });
                    // Dejar de observar este elemento
                    observer.unobserve(el);
                }
            });
        }, {
            rootMargin: '200% 0px', // 2 pantallas adelante
            threshold: 0
        });

        // Observar cards y secciones que puedan tener contenido lazy
        document.querySelectorAll('.card, .content-body, .row').forEach(el => {
            observer.observe(el);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupProgressivePreload);
    } else {
        setupProgressivePreload();
    }

    /* ═══════════════════════════════════════════
       5. DETECTOR DE NAVEGACIÓN SPA
       Re-aplicar lazy loading en cambios de URL
       ═══════════════════════════════════════════ */
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(() => {
                applyLazyLoading();
                setupProgressivePreload();
                optimizeFixedElements();
            }, 500);
        }
    }).observe(document, { subtree: true, childList: true });

    /* ═══════════════════════════════════════════
       6. REDUCIR MOTION SI EL USUARIO LO PREFIERE
       ═══════════════════════════════════════════ */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        if (document.head) document.head.appendChild(style);
    }

    console.log('[Academica Optimizer v9.0-alpha] Optimizaciones aplicadas');
})();
