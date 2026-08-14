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

/* ═══════════════════════════════════════════
   BOTONES DE ACCESO RÁPIDO - ALINEACIÓN
   ═══════════════════════════════════════════ */
#contenedor_especialidad_std,
#contenedor_especialidad_std > .d-flex,
#contenedor_especialidad_std > .row,
.card-primary .card-body > .d-flex.flex-wrap,
.card-primary .card-body > .row {
    align-items: stretch !important;
}
#contenedor_especialidad_std .col-6,
#contenedor_especialidad_std .col-md-4,
.card-primary .card-body .col-6,
.card-primary .card-body .col-md-4 {
    display: flex !important;
    padding: 6px !important;
}
#contenedor_especialidad_std .col-6 > a,
#contenedor_especialidad_std .col-md-4 > a,
.card-primary .card-body .col-6 > a,
.card-primary .card-body .col-md-4 > a {
    display: flex !important;
    width: 100% !important;
    text-decoration: none !important;
}
#contenedor_especialidad_std .col-6 > a > div,
#contenedor_especialidad_std .col-md-4 > a > div,
.card-primary .card-body .col-6 > a > div,
.card-primary .card-body .col-md-4 > a > div {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    border-radius: 14px !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04) !important;
    border: 1px solid rgba(0,0,0,0.03) !important;
    padding: 12px 8px !important;
    background: #fff !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
}
#contenedor_especialidad_std .col-6 > a > div:active,
.card-primary .card-body .col-6 > a > div:active {
    transform: scale(0.97) !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
}
#contenedor_especialidad_std .text-center,
.card-primary .card-body .text-center {
    flex: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    padding: 0 !important;
}
#contenedor_especialidad_std img,
.card-primary .card-body .col-6 img,
.card-primary .card-body .col-md-4 img {
    width: 64px !important;
    height: 64px !important;
    object-fit: contain !important;
    margin-bottom: 10px !important;
    display: block !important;
}
#contenedor_especialidad_std span,
.card-primary .card-body .col-6 span,
.card-primary .card-body .col-md-4 span {
    font-size: 14px !important;
    line-height: 1.3 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    width: 100% !important;
    color: #2C2C2C !important;
    font-weight: 500 !important;
    display: block !important;
}

/* ═══════════════════════════════════════════
   HORARIO - SCROLL HORIZONTAL
   ═══════════════════════════════════════════ */
.table-responsive {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    display: block !important;
    width: 100% !important;
}
#table_CrearhorarioView, table[id*="horario"], table[class*="horario"] {
    min-width: 700px !important;
    width: auto !important;
    white-space: nowrap !important;
}
#table_CrearhorarioView td, #table_CrearhorarioView th,
table[id*="horario"] td, table[id*="horario"] th {
    white-space: nowrap !important;
    word-break: keep-all !important;
}

/* ═══════════════════════════════════════════
   AGENDA - DÍAS REDONDOS
   ═══════════════════════════════════════════ */
.fc-day-header, .fc-day-top, .fc-day-number, .fc-day-grid-event,
.fc-event, .fc-time-grid-event, .fc-list-item, .fc-list-heading,
.fc-widget-header, .fc-head-container, .fc-body, .fc-row,
.fc-content-skeleton, .fc-bg, .fc-bgevent-skeleton,
.fc-highlight-skeleton, .fc-mirror-skeleton,
.fc-cell-content, .fc-cell-text, th.fc-day-header, td.fc-day-top {
    border-radius: 10px !important;
}
.fc-today, .fc-day.fc-today, td.fc-today, .fc-day-top.fc-today,
.fc-day-number.fc-today, .fc-today .fc-day-number,
.fc-state-highlight, .fc-unthemed .fc-today,
.fc-unthemed td.fc-today {
    background-color: #ffb22b !important;
    border-radius: 10px !important;
}
.fc-button, .fc-button-group .fc-button, .fc-prev-button,
.fc-next-button, .fc-today-button, .fc-month-button,
.fc-agendaWeek-button, .fc-agendaDay-button, .fc-listWeek-button {
    border-radius: 10px !important;
    margin: 0 2px !important;
}
.fc-toolbar { border-radius: 12px !important; padding: 8px !important; }
.fc-list-table td, .fc-list-heading td, .fc-list-item td { border-radius: 8px !important; }
.fc-event { border-radius: 8px !important; padding: 2px 6px !important; }

/* ═══════════════════════════════════════════
   REDONDEAR BORDES GLOBAL
   ═══════════════════════════════════════════ */
.form-control, select.form-control, textarea.form-control,
input.form-control, .input-group-text, .custom-select,
.btn, .btn-primary, .btn-secondary, .btn-success, .btn-info,
.btn-warning, .btn-danger, .btn-outline-primary, .btn-outline-secondary,
.btn-sm, .btn-lg, .btn-block, .btn-default, .btn-outline,
.btn-card-tool, .dropdown-toggle, .fc-button,
.badge, .badge-pill, .badge-warning, .badge-success, .badge-danger,
.badge-info, .badge-primary, .badge-secondary,
.pagination, .pagination .page-item, .pagination .page-link,
.form-group, .input-group, .input-group-prepend, .input-group-append,
.tooltip-inner, .popover, .popover-header, .popover-body,
.progress, .progress-bar,
.list-group, .list-group-item, .list-group-item-action {
    border-radius: 10px !important;
}
.card, .card-header, .card-body, .card-footer, .card-title, .card-text {
    border-radius: 14px !important;
}
.card-header { border-radius: 14px 14px 0 0 !important; }
.card-footer { border-radius: 0 0 14px 14px !important; }
.table, .table-bordered, .table-striped, .table-hover,
.well, .jumbotron {
    border-radius: 12px !important;
}
.modal-content, .modal-header, .modal-body, .modal-footer, .modal-dialog {
    border-radius: 16px !important;
}
.modal-header { border-radius: 16px 16px 0 0 !important; }
.modal-footer { border-radius: 0 0 16px 16px !important; }
.dropdown-menu, .dropdown-item, .dropdown-header { border-radius: 12px !important; }
.dropdown-menu { overflow: hidden !important; }
.alert, .alert-info, .alert-success, .alert-warning, .alert-danger, .alert-dismissable {
    border-radius: 12px !important;
}
.panel, .panel-heading, .panel-body, .panel-footer {
    border-radius: 12px !important;
}
.img-rounded, .round, .rounded, .img-fluid, .img-responsive, .img-thumbnail {
    border-radius: 12px !important;
}
.avatar, .avatar img, .rounded-circle, .imgMyPhoto2, .profile-img {
    border-radius: 50% !important;
}

/* ═══════════════════════════════════════════
   FOTOS DE PERFIL
   ═══════════════════════════════════════════ */
.navbar .imgMyPhoto2, .dropdown-menu .imgMyPhoto2, .nav-item .imgMyPhoto2,
.header-navbar .imgMyPhoto2 {
    width: 40px !important; height: 40px !important;
    max-width: 40px !important; max-height: 40px !important;
    border-radius: 50% !important; object-fit: cover !important;
}
.card-body .imgMyPhoto2, .col-lg-3 .imgMyPhoto2 {
    max-width: 120px !important; max-height: 120px !important;
    width: auto !important; height: auto !important;
    border-radius: 50% !important; object-fit: cover !important;
    display: block !important; margin: 0 auto !important;
}
.profile-img, .user-profile-img, .profile-user-img,
.rounded-circle[src*="/User/"], .rounded-circle[src*="avatar"] {
    max-width: 140px !important; max-height: 140px !important;
    width: auto !important; height: auto !important;
    object-fit: cover !important; border-radius: 50% !important;
    display: block !important; margin: 0 auto 0.8rem auto !important;
}

/* ═══════════════════════════════════════════
   AVATARES — FIX v9.0: img llena el círculo
   ═══════════════════════════════════════════ */
.avatar img, .avatar .round, .avatar img[width="40"][height="40"] {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 50% !important;
}

.navbar .avatar, .header-navbar .avatar {
    width: auto !important; height: auto !important;
    max-width: 45px !important; max-height: 45px !important;
}
.navbar .avatar img, .header-navbar .avatar img {
    width: 45px !important; height: 45px !important;
    max-width: 45px !important; max-height: 45px !important;
    border-radius: 8px !important; object-fit: contain !important;
}
.email-application .avatar {
    width: 40px !important; height: 40px !important;
    max-width: 40px !important; max-height: 40px !important;
    flex-shrink: 0 !important;
}
.content-body .avatar:not(.navbar .avatar):not(.header-navbar .avatar),
.card-body .avatar:not(.navbar .avatar):not(.header-navbar .avatar) {
    width: 80px !important; height: 80px !important;
    max-width: 80px !important; max-height: 80px !important;
    display: flex !important; align-items: center !important;
    justify-content: center !important; border-radius: 50% !important;
    overflow: hidden !important; margin: 0 auto 0.5rem auto !important;
    background-color: #2c6dbd !important; color: #fff !important;
    font-size: 2rem !important; font-weight: 600 !important;
}

/* ═══════════════════════════════════════════
   IMÁGENES
   ═══════════════════════════════════════════ */
img[width][height] { max-width: none !important; max-height: none !important; }
.content-body img:not([width]):not([height]),
.card-body img:not([width]):not([height]) {
    max-width: 100% !important; height: auto !important;
}
#img_logo_colegio {
    width: 45px !important; height: 45px !important;
    border-radius: 8px !important; object-fit: contain !important;
}

/* ═══════════════════════════════════════════
   HEADERS
   ═══════════════════════════════════════════ */
.content-header {
    padding: 0.4rem 0.5rem !important;
    margin-bottom: 0.2rem !important;
}
.content-header-title {
    font-size: 1.1rem !important; margin-bottom: 0 !important;
    line-height: 1.3 !important; display: flex !important;
    align-items: center !important; gap: 8px !important;
}
.content-header-title img {
    width: 28px !important; height: 28px !important;
    border-radius: 6px !important;
}
.content-body { padding: 0.3rem 0.4rem !important; }
.breadcrumb-wrapper { display: none !important; }

/* ═══════════════════════════════════════════
   CARDS
   ═══════════════════════════════════════════ */
.card {
    margin-bottom: 0.7rem !important;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;
    border: 1px solid rgba(0,0,0,0.04) !important;
}
.card-body { padding: 0.9rem !important; }
.card-header { padding: 0.8rem 0.9rem !important; font-size: 1rem !important; }
.card-title { font-size: 1.05rem !important; margin-bottom: 0.4rem !important; }

/* ═══════════════════════════════════════════
   FORMS
   ═══════════════════════════════════════════ */
.form-group { margin-bottom: 0.9rem !important; }
.form-group.row { display: flex !important; flex-wrap: wrap !important; margin-bottom: 0.9rem !important; }
.form-control {
    font-size: 16px !important; padding: 0.55rem 0.7rem !important;
    height: auto !important; min-height: 40px !important;
}
.input-group { flex-wrap: wrap !important; }
.input-group > .form-control { width: 100% !important; }

.has-icon-left, .position-relative { position: relative !important; }
.has-icon-left .form-control-position,
.position-relative .form-control-position {
    position: absolute !important; top: 50% !important;
    left: 10px !important; transform: translateY(-50%) !important;
    width: 18px !important; height: 18px !important;
    line-height: 18px !important; text-align: center !important;
    z-index: 5 !important; font-size: 14px !important;
}
.has-icon-left .form-control { padding-left: 36px !important; }

.input-group .input-group-text {
    position: absolute !important; left: 0; top: 0; bottom: 0;
    z-index: 5 !important; background: transparent !important;
    border: none !important; display: flex !important;
    align-items: center !important; justify-content: center !important;
    padding: 0 10px !important; width: 36px !important;
}
.input-group .input-group-text + .form-control,
.input-group .form-control { padding-left: 36px !important; }

.form-group .vs-checkbox-con, .form-group .vs-radio-con {
    display: inline-flex !important; margin-right: 1rem !important;
    align-items: center !important;
}
.form-group .vs-checkbox, .form-group .vs-radio { margin-right: 6px !important; }

/* ═══════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════ */
.modal-dialog {
    margin: 0.8rem !important;
    max-width: calc(100vw - 1.6rem) !important;
}
.modal-content { box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important; }
.modal-body { padding: 1rem !important; max-height: 65vh !important; overflow-y: auto !important; }
.modal-header { padding: 0.8rem 1rem !important; border-bottom: 1px solid #eee !important; }
.modal-footer {
    padding: 0.7rem 1rem !important; flex-wrap: wrap !important;
    gap: 8px !important; border-top: 1px solid #eee !important;
}
.modal-footer .btn { flex: 1 !important; min-width: 100px !important; padding: 0.55rem !important; }
.modal { z-index: 1050 !important; }
.modal-backdrop { z-index: 1040 !important; }

/* ═══════════════════════════════════════════
   BUTTONS & DROPDOWNS
   ═══════════════════════════════════════════ */
.btn-group { flex-wrap: wrap !important; gap: 6px !important; }
.btn-group .btn { flex: 1 !important; min-width: 80px !important; }
.dropdown-menu {
    max-width: 90vw !important; font-size: 0.9rem !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
}
select.form-control { font-size: 16px !important; }

/* ═══════════════════════════════════════════
   PAGINATION & ALERTS
   ═══════════════════════════════════════════ */
.pagination { flex-wrap: wrap !important; gap: 6px !important; padding: 0.4rem !important; }
.pagination .page-link { padding: 0.35rem 0.55rem !important; font-size: 13px !important; }
.alert { padding: 0.7rem 0.9rem !important; font-size: 14px !important; margin-bottom: 0.7rem !important; }

/* ═══════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════ */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #aaa; }

/* ═══════════════════════════════════════════
   SOLO MOBILE — reglas que rompen desktop
   ═══════════════════════════════════════════ */
@media (max-width: 768px) {
    .app-content { padding: 0 !important; margin: 0 !important; }
    .content-wrapper { margin-left: 0 !important; padding: 0.6rem !important; min-height: auto !important; }

    .navbar .search-input,
    .navbar .nav-item.d-none.d-lg-block { display: none !important; }

    .form-group.row > label[class*="col-"] {
        flex: 0 0 100% !important; max-width: 100% !important;
        padding: 0 0 0.25rem 0 !important; font-size: 0.88rem !important;
        font-weight: 600 !important; margin-bottom: 0 !important;
    }
    .form-group.row > div[class*="col-"] {
        flex: 0 0 100% !important; max-width: 100% !important;
        padding: 0 !important;
    }

    .footer { padding: 0.7rem !important; font-size: 12px !important; text-align: center !important; margin-top: 0.8rem !important; }
    .footer .row { display: block !important; }
    .footer [class*="col-"] { text-align: center !important; margin-bottom: 0.3rem !important; }
}

/* ═══════════════════════════════════════════
   LOGIN LIMPIO — Solo en pagina de inicio
   Oculta marketing, deja solo el formulario
   ═══════════════════════════════════════════ */
body:has(.contact__form) {
    background: #1a237e !important;
    background-image: none !important;
}
body:has(.contact__form) .header,
body:has(.contact__form) .navbar,
body:has(.contact__form) .footer,
body:has(.contact__form) .curve-container,
body:has(.contact__form) section:not(:has(.contact__form)),
body:has(.contact__form) .whatsapp-float,
body:has(.contact__form) [class*="owl-carousel"],
body:has(.contact__form) [class*="banner"],
body:has(.contact__form) img[src*="playA"],
body:has(.contact__form) img[src*="storeA"] {
    display: none !important;
}
body:has(.contact__form) .container,
body:has(.contact__form) .row,
body:has(.contact__form) .col-lg-5,
body:has(.contact__form) .col-md-12 {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    min-height: 100vh !important;
}
body:has(.contact__form) .contact__form {
    background: rgba(255,255,255,0.08) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    border-radius: 20px !important;
    padding: 2rem 1.5rem !important;
    width: 90% !important;
    max-width: 360px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2) !important;
}
body:has(.contact__form) .contact__form h2 {
    color: #fff !important;
    text-align: center !important;
    font-size: 1.4rem !important;
    margin-bottom: 1.5rem !important;
    font-weight: 600 !important;
}
body:has(.contact__form) .contact__form .form-group {
    margin-bottom: 1rem !important;
}
body:has(.contact__form) .contact__form input[type="text"],
body:has(.contact__form) .contact__form input[type="password"] {
    background: rgba(255,255,255,0.12) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    color: #fff !important;
    border-radius: 12px !important;
    padding: 0.9rem 1rem !important;
    font-size: 16px !important;
    width: 100% !important;
    height: auto !important;
}
body:has(.contact__form) .contact__form input::placeholder {
    color: rgba(255,255,255,0.5) !important;
}
body:has(.contact__form) .contact__form .btn-primary {
    background: #A5B4FC !important;
    border: none !important;
    color: #1a237e !important;
    border-radius: 12px !important;
    padding: 0.9rem !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    width: 100% !important;
    margin-top: 0.5rem !important;
    box-shadow: 0 4px 16px rgba(165,180,252,0.3) !important;
}
body:has(.contact__form) .contact__form .btn-primary:active {
    transform: scale(0.97) !important;
}
body:has(.contact__form) .contact__form a[href*="Recovery"] {
    color: rgba(255,255,255,0.7) !important;
    text-align: center !important;
    display: block !important;
    margin-top: 1rem !important;
    font-size: 0.85rem !important;
    text-decoration: none !important;
}
body:has(.contact__form) .contact__form hr,
body:has(.contact__form) .contact__form a[href*="play.google"],
body:has(.contact__form) .contact__form a[href*="apps.apple"] {
    display: none !important;
}

/* TABLET — SIN margin-left: 0 en content-wrapper */
@media (min-width: 769px) and (max-width: 1024px) {
    .main-menu { width: 280px !important; }
    .content-wrapper { padding: 0.8rem !important; }
    .form-group.row > [class*="col-md-3"] { flex: 0 0 30% !important; max-width: 30% !important; }
    .form-group.row > [class*="col-md-9"] { flex: 0 0 70% !important; max-width: 70% !important; }
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
            if (!isBlocked()) setTimeout(inject, 0);
        }
    }).observe(document, { subtree: true, childList: true });

    document.addEventListener('DOMContentLoaded', inject);
    window.addEventListener('load', inject);
    console.log('[Academica Content v9.0-alpha] Inyectado');
})();
