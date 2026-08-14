# AcademicaNet Android Wrapper v9.0-alpha

Wrapper nativo Kotlin para [academicanet.com](https://academicanet.com) con inyección de scripts CSS/JS embebidos.

## Estructura del proyecto

```
academicanet-wrapper/
├── app/src/main/
│   ├── java/com/academicanet/wrapper/MainActivity.kt
│   ├── res/                          # Layouts, valores, drawables
│   └── assets/
│       ├── academica_content_general_v9.0-alpha.js
│       ├── academica_navsidebar_v9.0-alpha.js
│       └── academica_optimizer_v9.0-alpha.js
├── .github/workflows/build.yml       # GitHub Actions
├── build.gradle.kts
└── settings.gradle.kts
```

## Cómo descargar el APK

1. Andá a la pestaña **Actions** de este repo en GitHub.
2. Click en el workflow más reciente (o en **Run workflow** para forzar uno nuevo).
3. En la sección **Artifacts**, descargá `academicanet-debug` o `academicanet-release`.
4. Pasá el `.apk` al celular e instalalo (activá "Orígenes desconocidos" si te lo pide).

## Cómo actualizar los scripts

1. Editá el archivo `.js` correspondiente en `app/src/main/assets/`.
2. Hacé commit y push a `main`.
3. GitHub Actions compila automáticamente el nuevo APK.
4. Descargá el artifact actualizado.

## Build local (opcional)

Si tenés Android Studio y querés compilar en tu PC:

**Paso 0 — Generar el Gradle Wrapper** (solo la primera vez, el repo no incluye los binarios):
```bash
git clone <url-del-repo>
cd academicanet-wrapper
gradle wrapper        # o: gradlew wrapper
```

Esto crea `gradlew`, `gradlew.bat` y `gradle/wrapper/gradle-wrapper.jar`.

**Paso 1 — Compilar:**
```bash
./gradlew assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/app-debug.apk`.

> **Nota:** El workflow de GitHub Actions usa Gradle directamente (`gradle assembleDebug`) sin necesidad del wrapper, así que el build en la nube funciona sin este paso.

## Target

- **Dispositivo:** Samsung Galaxy A25 5G
- **SO:** Android 16 / One UI 8.0
- **minSdk:** 24 (Android 7.0)
- **compileSdk:** 34

## Changelog v9.0-alpha

- Wrapper nativo Kotlin (antes WebToApp + Tampermonkey).
- Scripts embebidos en `assets/`, inyectados vía `evaluateJavascript()`.
- Fondo hexagonal global en todas las páginas.
- Fix de avatares placeholder (img llena el círculo).
- Limpieza de `isBlocked()` redundante.
- Eliminado `drag-target` (40px) del sidebar.
