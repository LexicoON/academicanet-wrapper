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

/* ═══════════════════════════════════════════
   FONDO HEXAGONAL GLOBAL (todas las páginas)
   ═══════════════════════════════════════════ */
body {
    background-color: #f8f9fa !important;
    background-image:
        radial-gradient(circle, rgba(160, 170, 185, 0.35) 2px, transparent 2.5px),
        radial-gradient(circle, rgba(160, 170, 185, 0.35) 2px, transparent 2.5px) !important;
    background-size: 32px 32px !important;
    background-position: 0 0, 16px 16px !important;
    background-attachment: fixed !important;
}

/* ═══════════════════════════════════════════
   NAVBAR - FROSTED GLASS (menos vívido)
   Tinte azulado sutil, saturate bajo, opaco
   ═══════════════════════════════════════════ */
.navbar.header-navbar {
    min-height: 56px !important;
    padding: 0 0.75rem !important;
    background: rgba(245, 248, 252, 0.60) !important;
    backdrop-filter: blur(16px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.50) !important;
    box-shadow: 0 4px 20px rgba(44, 109, 189, 0.08) !important;
    transform: translateZ(0) !important;
    will-change: backdrop-filter !important;
    z-index: 1030 !important;
}

/* Reflejo de luz superior */
.navbar.header-navbar::before {
    content: "" !important;
    position: absolute !important;
    top: 0 !important; left: 0 !important; right: 0 !important;
    height: 1px !important;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent) !important;
    pointer-events: none !important;
}

/* NAVBAR REDONDEADO ABAJO - todos los tamaños */
.navbar, .header-navbar, .navbar-container, .navbar-collapse {
    border-radius: 0 0 14px 14px !important;
}

/* HEADER SHADOW - sutil */
.header-navbar-shadow {
    height: 2px !important;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04) !important;
    background: transparent !important;
    position: absolute !important;
    bottom: -2px !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 1029 !important;
    pointer-events: none !important;
}

.navbar-container { padding: 0 !important; }
.navbar-brand { font-size: 0.95rem !important; }

/* ═══════════════════════════════════════════
   LOGO COLEGIO - REDONDO Y CENTRADO
   ═══════════════════════════════════════════ */
#img_logo_colegio {
    width: 40px !important;
    height: 40px !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    display: block !important;
}

.navbar .avatar.mr-1,
.header-navbar .avatar.mr-1 {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
    padding: 0 !important;
}

.navbar .avatar.mr-1 a.MenuRestricionLink,
.header-navbar .avatar.mr-1 a.MenuRestricionLink {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 40px !important;
    height: 40px !important;
    border-radius: 50% !important;
    overflow: hidden !important;
    text-decoration: none !important;
}

/* ═══════════════════════════════════════════
   NOTIFICACIONES - CENTRADAS + BADGES PEQUEÑOS
   ═══════════════════════════════════════════ */
.nav.navbar-nav.float-right {
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
}

.nav.navbar-nav.float-right .dropdown.dropdown-notification.nav-item,
.nav.navbar-nav.float-right .dropdown.dropdown-user.nav-item {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
}

.nav.navbar-nav.float-right .nav-link,
.nav.navbar-nav.float-right .nav-link-label,
.nav.navbar-nav.float-right .dropdown-toggle {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100% !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

.dropdown-notification .badge,
.dropdown-notification .badge-pill {
    position: absolute !important;
    top: 10px !important;
    right: 2px !important;
    min-width: 16px !important;
    height: 16px !important;
    padding: 0 4px !important;
    font-size: 0.65rem !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
}

/* Ocultar ícono de Notificaciones (campana) */
#LINotif { display: none !important; }

/* ═══════════════════════════════════════════
   SIDEBAR - SOLO MOBILE (blur azul)
   Desktop: completamente original, sin tocar
   ═══════════════════════════════════════════ */
@media (max-width: 768px) {
    .navbar .search-input,
    .navbar .nav-item.d-none.d-lg-block { display: none !important; }

    .main-menu {
        width: 280px !important;
        background: rgba(44, 109, 189, 0.55) !important;
        backdrop-filter: blur(20px) saturate(200%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(200%) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: 4px 0 30px rgba(0, 0, 0, 0.15) !important;
    }
    .main-menu-content {
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
        background: transparent !important;
    }
    .navigation {
        padding-left: 0 !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
    }

    .navigation li a {
        padding: 10px 16px !important;
        font-size: 0.92rem !important;
        background: transparent !important;
        border-radius: 10px !important;
        margin-right: 8px !important;
        margin-left: 8px !important;
        margin-bottom: 4px !important;
        margin-top: 0 !important;
        border: none !important;
        color: #fff !important;
    }
    .navigation li a:hover,
    .navigation li a:active {
        background: rgba(255, 255, 255, 0.12) !important;
    }
    .navigation li a i {
        margin-right: 10px !important;
        font-size: 1.05rem !important;
    }
    .navigation li.active a {
        background: rgba(255, 255, 255, 0.18) !important;
    }
    .navigation li:first-child a { margin-top: 0 !important; }
    .navigation li:last-child a { margin-bottom: 0 !important; }

    .navigation li a .badge,
    .navigation li a .badge-pill,
    .main-menu .badge,
    .main-menu .badge-warning,
    .main-menu .badge-success,
    .main-menu .badge-danger,
    .main-menu .badge-info,
    .main-menu .badge-primary,
    .main-menu .badge-secondary,
    .navigation .badge {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 22px !important;
        height: 22px !important;
        padding: 0 6px !important;
        border-radius: 50% !important;
        font-size: 0.75rem !important;
        font-weight: 600 !important;
        line-height: 1 !important;
        margin-left: auto !important;
        margin-right: 0 !important;
    }

    .main-menu .navbar-header {
        background: transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        padding: 0.75rem 1rem !important;
    }
    .main-menu .navbar-header .nav-toggler,
    .main-menu .navbar-header .modern-nav-toggle,
    .main-menu .navbar-header .icon-x,
    .main-menu .navbar-header [class*="toggle"] { display: none !important; }

    .main-menu, .navigation li a, .navigation {
        border-radius: 0 14px 14px 0 !important;
    }
    .navigation li a { border-radius: 10px !important; }

    .app-content { padding: 0 !important; margin: 0 !important; }
    .content-wrapper { margin-left: 0 !important; padding: 0.6rem !important; min-height: auto !important; }

    .main-menu ::-webkit-scrollbar { width: 4px; }
    .main-menu ::-webkit-scrollbar-track { background: transparent; }
    .main-menu ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 2px; }
}

/* ═══════════════════════════════════════════
   CALENDARIO STICKY TOOLBAR - BLUR
   ═══════════════════════════════════════════ */
.kt-sticky-toolbar {
    background: rgba(245, 248, 252, 0.55) !important;
    backdrop-filter: blur(16px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
    border: 1px solid rgba(255, 255, 255, 0.50) !important;
    box-shadow: 0 4px 20px rgba(44, 109, 189, 0.08) !important;
    border-radius: 12px 0 0 12px !important;
    overflow: hidden !important;
}

.kt-sticky-toolbar__item,
.kt-sticky-toolbar__item--demo-toggle {
    background: transparent !important;
    border: none !important;
}

.kt-sticky-toolbar__item a,
.kt-sticky-toolbar__item--demo-toggle a {
    color: #2c6dbd !important;
    font-weight: 600 !important;
    text-decoration: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 10px 6px !important;
    writing-mode: vertical-rl !important;
    text-orientation: mixed !important;
    letter-spacing: 1px !important;
    background: rgba(255, 255, 255, 0.30) !important;
    border-radius: 8px !important;
    margin: 4px !important;
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

    const guardianObserver = new MutationObserver(() => {
        if (!document.getElementById(STYLE_ID)) inject();
        const existing = document.getElementById(STYLE_ID);
        if (existing && document.head && existing.parentNode !== document.head) {
            document.head.appendChild(existing);
        }
    });
    guardianObserver.observe(document.documentElement, { childList: true, subtree: true });

    const pollInterval = setInterval(() => {
        if (document.getElementById(STYLE_ID)) {
            const existing = document.getElementById(STYLE_ID);
            if (document.head && existing.parentNode !== document.head) {
                document.head.appendChild(existing);
            }
        } else { inject(); }
    }, 50);
    setTimeout(() => clearInterval(pollInterval), 5000);

    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(inject, 0);
        }
    }).observe(document, { subtree: true, childList: true });

    document.addEventListener('DOMContentLoaded', inject);
    window.addEventListener('load', inject);
    console.log('[Academica NavSidebar v9.0-alpha] Inyectado');
})();