# AcademicaNet Android Wrapper v1.9.0-alpha 🎓📱

> Tu plataforma escolar, ahora como app nativa. Rápida, limpia y sin distracciones.

---

## ✨ Qué es esto

Esta app convierte [academicanet.com](https://academicanet.com) en una experiencia móvil nativa. No es un navegador con una página web — es una app que carga la plataforma directamente, con mejoras de diseño, rendimiento y usabilidad pensadas para estudiantes.

**Hecha por y para estudiantes.** Distribuida directamente entre amigos, sin Play Store.

---

## 🚀 Cómo instalar

### 1. Descargar la APK

1. Andá a la pestaña **Actions** de este repositorio en GitHub.
2. Click en el workflow más reciente (o en **Run workflow** para forzar uno nuevo).
3. En la sección **Artifacts**, descargá `academicanet-release-signed`.
4. Pasá el `.apk` a tu celular e instalalo.

> ⚠️ **Primera vez:** activá "Orígenes desconocidos" en Ajustes > Seguridad si te lo pide.

### 2. Actualizar

Cuando haya una nueva versión, simplemente descargá la APK nueva e instalala encima. **No hace falta desinstalar** (la firma es la misma).

---

## 🛠️ Cómo funciona

| Feature | Descripción |
|---------|-------------|
| **Login limpio** | Pantalla de inicio de sesión minimalista, sin anuncios ni distracciones |
| **Diseño nativo** | Navbar glassmorphism, sidebar con blur, fondo hexagonal coherente |
| **Sesión persistente** | No tenés que iniciar sesión cada vez que abrís la app |
| **Descargas** | Archivos se descargan con el gestor nativo de Android |
| **Subir archivos** | Selector de archivos nativo cuando la web lo pide |
| **Navegación segura** | El botón "atrás" nunca te saca de la sesión por accidente |
| **Status bar dinámica** | Se adapta al color de cada pantalla (azul en login, blanca en el resto) |

---

## 🧪 Para desarrolladores

### Estructura del proyecto

```
academicanet-wrapper/
├── app/src/main/
│   ├── java/cde/academica/MainActivity.kt    # Wrapper nativo Kotlin
│   ├── assets/                                 # Scripts JS inyectados
│   │   ├── academica_optimizer_v9.0-alpha.js
│   │   ├── academica_content_general_v9.0-alpha.js
│   │   ├── academica_navsidebar_v9.0-alpha.js
│   │   └── academica_welcome_cleanup_v9.0-alpha.js
│   └── res/                                    # Layouts, iconos, valores
├── .github/workflows/build.yml                 # GitHub Actions
└── build.gradle.kts
```

### Build local (Android Studio)

```bash
git clone <url-del-repo>
cd academicanet-wrapper
./gradlew assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.

### Actualizar los scripts

1. Editá el `.js` correspondiente en `app/src/main/assets/`.
2. Commiteá y pusheá a `main`.
3. GitHub Actions compila automáticamente el nuevo APK.

---

## 📱 Especificaciones

| | |
|---|---|
| **Package** | `cde.academica` |
| **minSdk** | 30 (Android 11) |
| **targetSdk** | 34 (Android 14) |
| **Dispositivo de prueba** | Samsung Galaxy A25 5G |
| **SO** | Android 16 / One UI 8.0 |

---

## 📝 Changelog

### v1.9.0-alpha
- Wrapper nativo Kotlin (antes WebToApp + Tampermonkey)
- Scripts embebidos en `assets/`, inyectados vía `evaluateJavascript()`
- Login limpio con diseño minimalista
- Fondo hexagonal global en todas las páginas
- Fix de avatares placeholder
- Navbar y sidebar con glassmorphism
- Eliminados botones no usados (Informe Diario, Plan de Estudio, Recursos Digitales)
- Descargas con selector nativo de Android
- Subida de archivos con file picker nativo
- Status bar dinámica y nav bar transparente
- Anti-FOUC: la página nunca se ve sin estilos

---

## 🤝 Créditos

- **Alexis** — Creativo principal, tester, dueño del proyecto
- **Kimi** — Programación y arquitectura
- **Mavis** — Auditoría de código y planificación

---

> *Hecho con 💙 para simplificar la vida escolar.*
