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
        // /index, /, /Views/Account/Login o similar
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

    const cssText = `
/* ═══════════════════════════════════════════
   ACADEMICA NET - LOGIN CLEANUP v9.0-alpha
   Solo activo en la pagina de login.
   ═══════════════════════════════════════════ */

html, body {
    background: #1a237e !important;
    background-image: none !important;
    min-height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
}
body {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-direction: column !important;
    padding: 1.5rem 1rem !important;
    box-sizing: border-box !important;
}
body * { box-sizing: border-box !important; }

/* Ocultar por clase/tag — la limpieza REAL de "todo lo que no sea el form"
   la hace hideEverythingExceptForm() en JS, porque depende del árbol DOM.
   Aqui solo ocultamos por selectores conocidos y siempre seguros. */
.header,
.navbar,
.footer,
.curve-container,
.whatsapp-float,
[class*="owl-carousel"],
img[src*="playA"],
img[src*="storeA"],
.btn-white,
a[href*="mailto"],
.app-content,
.app-content-overlay,
.background-image,
.bg-image,
.bg-banner,
.scroll-down,
.scroll-indicator {
    display: none !important;
}

/* Forzar layout vertical centrado sobre cualquier contenedor padre */
body .container,
body .container-fluid,
body .row,
body [class*="col-"],
body .col-lg-5,
body .col-md-12,
body .col-sm-12,
body .col-xs-12,
body .contact__form,
body form,
body .login-wrapper {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    padding: 0 !important;
    min-height: auto !important;
    background: transparent !important;
    float: none !important;
    position: static !important;
    transform: none !important;
}

/* Logo Academica arriba del card (inyectado por JS) */
body .academica-login-logo {
    width: 80px !important;
    height: 80px !important;
    margin-bottom: 1.25rem !important;
    display: block !important;
    filter: brightness(0) invert(1) !important;
}

/* Caja blanca — ancho consistente en cualquier viewport */
body .contact__form,
body form.login-form,
body .login-wrapper > form,
body > form {
    background: #ffffff !important;
    border-radius: 20px !important;
    padding: 2rem 1.5rem !important;
    width: 100% !important;
    max-width: 380px !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
}

/* Titulo */
body .contact__form h2,
body form h2,
body .login-wrapper h2 {
    color: #1a237e !important;
    text-align: center !important;
    font-size: 1.3rem !important;
    margin: 0 0 1.5rem 0 !important;
    font-weight: 700 !important;
    width: 100% !important;
}

/* Grupos de campos */
body .contact__form .form-group,
body form .form-group,
body .login-wrapper .form-group {
    margin-bottom: 0.9rem !important;
    width: 100% !important;
}

/* Inputs — DEFAULTS primero, luego overrides para evitar superposicion de iconos */
body .contact__form input[type="text"],
body .contact__form input[type="password"],
body .contact__form input[type="email"],
body form input[type="text"],
body form input[type="password"],
body form input[type="email"],
body .login-wrapper input[type="text"],
body .login-wrapper input[type="password"],
body .login-wrapper input[type="email"] {
    background: #f5f6fa !important;
    border: 2px solid #e8e9ef !important;
    color: #1a237e !important;
    border-radius: 14px !important;
    padding: 1rem 1.1rem !important;
    font-size: 16px !important;
    width: 100% !important;
    height: auto !important;
    min-height: 48px !important;
    line-height: 1.4 !important;
    outline: none !important;
    transition: border-color 0.2s ease !important;
    -webkit-appearance: none !important;
    appearance: none !important;
}
body .contact__form input[type="text"]:focus,
body .contact__form input[type="password"]:focus,
body .contact__form input[type="email"]:focus,
body form input:focus,
body .login-wrapper input:focus {
    border-color: #A5B4FC !important;
    background: #ffffff !important;
}
body .contact__form input::placeholder,
body form input::placeholder,
body .login-wrapper input::placeholder {
    color: #9ca3af !important;
    opacity: 1 !important;
}

/* Iconos dentro de inputs.
   El template original usa .form-control-position (icono izquierdo) y
   .input-group-text (prepended icon group). El ojo de "mostrar password"
   es un .form-control-position pero viene con right: en el HTML original.
   Aqui respetamos el offset que ya tiene el elemento (data-side="right")
   o, en su defecto, lo mandamos a la derecha. */
body .form-control-position,
body .position-relative > i,
body .position-relative > span.icon,
body .position-relative > .feather,
body .position-relative > .icon {
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 20px !important;
    height: 20px !important;
    line-height: 20px !important;
    text-align: center !important;
    z-index: 4 !important;
    font-size: 16px !important;
    color: #6b7280 !important;
    pointer-events: none !important;
}
/* Si el icono es de la derecha, lo manda a la derecha */
body .form-control-position[data-side="right"],
body .position-relative > i[data-side="right"],
body .position-relative > span.icon[data-side="right"] {
    left: auto !important;
    right: 14px !important;
}
/* Si no tiene marca, lo mandamos a la derecha POR DEFECTO
   (asumimos que el unico icono de cada form es el del password) */
body .form-control-position:not([data-side]),
body .position-relative > i:not([data-side]):not([class*="left"]),
body .position-relative > span.icon:not([data-side]) {
    left: auto !important;
    right: 14px !important;
}
/* Si tiene clase con "left" o data-side="left", va a la izquierda */
body .form-control-position[class*="left"],
body .form-control-position[data-side="left"],
body .position-relative > i[class*="left"],
body .position-relative > i[data-side="left"] {
    left: 14px !important;
    right: auto !important;
}
/* Padding para no superponer texto con icono */
body .has-icon-left .form-control,
body .position-relative .form-control,
body form .position-relative input {
    padding-left: 14px !important;
    padding-right: 50px !important;
}
body .position-relative:not(.has-icon-left) input,
body form .position-relative:not(.has-icon-left) input {
    padding-left: 14px !important;
    padding-right: 50px !important;
}

/* Input group: NO superponer icono con texto. Mantener icono a la izquierda
   pero con padding suficiente en el input. */
body .input-group {
    position: relative !important;
    width: 100% !important;
    display: block !important;
}
body .input-group .input-group-text {
    position: absolute !important;
    left: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    width: 20px !important;
    height: 20px !important;
    line-height: 20px !important;
    text-align: center !important;
    z-index: 4 !important;
    color: #6b7280 !important;
    pointer-events: none !important;
}
body .input-group .form-control {
    padding-left: 42px !important;
    padding-right: 14px !important;
}

/* Boton principal */
body .contact__form .btn-primary,
body form button[type="submit"],
body form .btn-primary,
body .login-wrapper button[type="submit"],
body .login-wrapper .btn-primary {
    background: #1a237e !important;
    border: none !important;
    color: #ffffff !important;
    border-radius: 14px !important;
    padding: 1rem !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    width: 100% !important;
    margin-top: 0.5rem !important;
    cursor: pointer !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
    -webkit-appearance: none !important;
    appearance: none !important;
}
body .contact__form .btn-primary:active,
body form button[type="submit"]:active,
body form .btn-primary:active,
body .login-wrapper button[type="submit"]:active {
    transform: scale(0.97) !important;
    box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3) !important;
}

/* Link "Recuperar clave" */
body .contact__form a[href*="Recovery"],
body form a[href*="Recovery"],
body form a[href*="recovery"],
body .login-wrapper a[href*="Recovery"],
body .login-wrapper a[href*="recovery"] {
    color: #6b7280 !important;
    text-align: center !important;
    display: block !important;
    margin-top: 1.2rem !important;
    font-size: 0.85rem !important;
    text-decoration: none !important;
    width: 100% !important;
}

/* Basura dentro del form -> fuera */
body .contact__form hr,
body .contact__form a[href*="play.google"],
body .contact__form a[href*="apps.apple"],
body form hr,
body form a[href*="play.google"],
body form a[href*="apps.apple"] {
    display: none !important;
}

/* Enlace "X" cerrar modal/header que aparece arriba en login */
body .modal-header .close,
body .modal-header button.close,
body button[class*="close"] {
    color: #1a237e !important;
    opacity: 0.6 !important;
}

/* Forzar el contenedor mas externo (los <section> wrappers de AcademicaNet) */
body > section,
body > div > section,
body > .container > section {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
    display: contents !important;
}

/* Quitar cualquier absolute/fixed que rompa el centrado.
   OJO: NO tocar position de los wrappers de input (.position-relative,
   .has-icon-left, .input-group) ni de los iconos. */
body .contact__form .form-group,
body form .form-group,
body .position-relative,
body .has-icon-left,
body .input-group {
    position: relative !important;
}
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
        if (document.documentElement) { document.documentElement.appendChild(style); }
        return false;
    }

    inject();

    // Reinsertar si algo lo borra
    const guardian = new MutationObserver(() => {
        if (!document.getElementById(STYLE_ID)) inject();
    });
    guardian.observe(document.documentElement, { childList: true, subtree: true });

    // Re-chequear en navegacion SPA
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(inject, 0);
        }
    }).observe(document, { subtree: true, childList: true });

    // Cuando el form este en el DOM, normalizamos los iconos para que
    // el del password vaya a la derecha y los demas respeten su clase.
    function fixLoginIcons() {
        const forms = document.querySelectorAll('.contact__form, form.login-form, body > form');
        forms.forEach(form => {
            // Marca explicita: el icono del password debe ir a la derecha.
            // Lo detectamos por estar en un .position-relative que contiene
            // un input[type=password].
            const passwordWrappers = form.querySelectorAll('.position-relative, .has-icon-left');
            passwordWrappers.forEach(wrap => {
                const hasPassword = wrap.querySelector('input[type="password"]');
                if (hasPassword) {
                    const icon = wrap.querySelector('.form-control-position, i, .icon, .feather, span.icon');
                    if (icon) {
                        icon.setAttribute('data-side', 'right');
                        // Algunos templates usan un <a>/<span> clickable, asegurar pointer-events
                        if (icon.tagName === 'A' || icon.tagName === 'SPAN' || icon.tagName === 'I') {
                            icon.style.pointerEvents = 'auto';
                        }
                    }
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixLoginIcons);
    } else {
        setTimeout(fixLoginIcons, 0);
    }
    setTimeout(fixLoginIcons, 300);
    setTimeout(fixLoginIcons, 1000);

    let lastUrl2 = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl2) {
            lastUrl2 = location.href;
            setTimeout(fixLoginIcons, 500);
        }
    }).observe(document, { subtree: true, childList: true });

    document.addEventListener('DOMContentLoaded', inject);
    window.addEventListener('load', inject);

    // ──────────────────────────────────────────────────────────
    // Cleanup por DOM: ocultar todo lo que NO sea el formulario.
    // CSS solo no es suficiente porque AcademicaNet usa muchos
    // wrappers arbitrarios (secciones, divs, owl-carousel, etc.).
    // ──────────────────────────────────────────────────────────
    const KEEP_SELECTORS = [
        '.contact__form',
        'form.login-form',
        'body > form',
        '.login-wrapper',
        '.academica-login-logo',
        // y todos sus ancestros (hasta body)
    ];

    function isInsideForm(el) {
        let cur = el;
        while (cur && cur !== document.body) {
            if (cur.matches && cur.matches(KEEP_SELECTORS.join(','))) return true;
            cur = cur.parentElement;
        }
        return false;
    }

    function hideEverythingExceptForm() {
        // Para cada hijo directo de body, decidir si ocultar.
        // Si el hijo contiene el form, conservar; si no, ocultar.
        Array.from(document.body.children).forEach(child => {
            if (child === document.documentElement) return;
            if (isInsideForm(child)) return;
            // Dejar pasar SOLO lo que pueda ser el wrapper del form.
            // Si no contiene ningun KEEP, se oculta.
            if (!child.querySelector(KEEP_SELECTORS.join(','))) {
                child.style.display = 'none';
            }
        });
    }

    function runCleanupWhenReady() {
        hideEverythingExceptForm();
        // Reintentar tras delays porque AcademicaNet pinta contenido por AJAX
        setTimeout(hideEverythingExceptForm, 100);
        setTimeout(hideEverythingExceptForm, 500);
        setTimeout(hideEverythingExceptForm, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCleanupWhenReady);
    } else {
        runCleanupWhenReady();
    }

    // Re-aplicar en cambios SPA
    let lastUrl3 = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl3) {
            lastUrl3 = location.href;
            setTimeout(hideEverythingExceptForm, 800);
        }
    }).observe(document, { subtree: true, childList: true });

    // Observer: si aparecen nuevos hijos directos del body, ocultarlos
    // si no contienen el form. Esto cubre banners que se cargan tarde.
    const bodyObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node === document.documentElement) continue;
                if (isInsideForm(node)) continue;
                if (node.querySelector && node.querySelector(KEEP_SELECTORS.join(','))) continue;
                // Es un nodo "basura" recien llegado (banner, modal header, etc.)
                node.style.display = 'none';
            }
        }
    });
    bodyObserver.observe(document.body, { childList: true });

    console.log('[Academica Login v9.0-alpha] Inyectado');
})();
