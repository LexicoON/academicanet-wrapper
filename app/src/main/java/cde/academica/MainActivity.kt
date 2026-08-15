package cde.academica

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.core.view.updatePadding
import cde.academica.databinding.ActivityMainBinding

/**
 * MainActivity - Wrapper nativo de AcademicaNet v1.9.0-alpha-5
 *
 * Estrategia de inyeccion de CSS:
 *  - CSS viene en archivos .js con run-at: document-start (anti-FOUC real)
 *  - JavaScriptInterface expone APIs nativas (AcademicaNative) a la web
 *  - onPageFinished inyecta scripts de lógica
 *  - CookieManager de Android maneja sesión persistente
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var scriptsInjected = false
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    companion object {
        private const val LOGIN_URL_FRAGMENT = "/index"
        private val COLOR_LOGIN = Color.parseColor("#1a237e")
        private val COLOR_WELCOME = Color.parseColor("#FFFFFF")
    }

    /**
     * JavaScriptInterface - expone APIs nativas a JavaScript de la web.
     * Esto permite integración real: la web puede llamar a Android para
     * hacer cosas que un WebView puro no puede (downloads, file picker, etc.)
     */
    inner class AcademicaNative {
        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun getAppVersion(): String {
            return try {
                packageManager.getPackageInfo(packageName, 0).versionName ?: "unknown"
            } catch (e: Exception) { "unknown" }
        }

        @JavascriptInterface
        fun isNative(): Boolean = true
    }

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetMultipleContents()
    ) { uris: List<Uri> ->
        filePathCallback?.onReceiveValue(uris.toTypedArray())
        filePathCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Nav bar transparente
        window.navigationBarColor = Color.TRANSPARENT
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Empuja WebView por debajo de status bar y por encima de nav bar
        ViewCompat.setOnApplyWindowInsetsListener(binding.webView) { v, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            )
            v.updatePadding(top = bars.top, bottom = bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        // CookieManager Android
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        binding.webView.apply {
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                allowFileAccess = true
                allowContentAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                setEnableSmoothTransition(true)
                setSupportZoom(false)
                builtInZoomControls = false
                displayZoomControls = false
                useWideViewPort = true
                loadWithOverviewMode = true
                setSupportMultipleWindows(false)
                loadsImagesAutomatically = true
                blockNetworkImage = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    offscreenPreRaster = true
                }
                mediaPlaybackRequiresUserGesture = true
            }

            // JavaScriptInterface - integración nativa con la web
            addJavascriptInterface(AcademicaNative(), "AcademicaNative")

            webViewClient = object : WebViewClient() {

                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    url?.let { updateStatusBarColor(it) }
                    scriptsInjected = false
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    if (view != null && !scriptsInjected) {
                        // El CSS ya está inyectado desde document-start.
                        // Acá solo inyectamos lógica adicional (optimizer, cleanup).
                        injectLogicScripts(view)
                        scriptsInjected = true
                    }
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    if (url.startsWith("blob:")) {
                        Toast.makeText(this@MainActivity, "Descargando archivo...", Toast.LENGTH_SHORT).show()
                        return true
                    }
                    return false
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    super.onReceivedError(view, request, error)
                    if (request?.isForMainFrame == true) {
                        Toast.makeText(
                            this@MainActivity,
                            "Error de conexion. Verifica tu internet.",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    consoleMessage?.let {
                        android.util.Log.d("AcademicaJS", "${it.sourceId()}:${it.lineNumber()} - ${it.message()}")
                    }
                    return true
                }

                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = filePathCallback
                    filePickerLauncher.launch("*/*")
                    return true
                }
            }

            setDownloadListener { url, userAgent, contentDisposition, mimeType, contentLength ->
                try {
                    val request = DownloadManager.Request(Uri.parse(url)).apply {
                        setMimeType(mimeType)
                        addRequestHeader("User-Agent", userAgent)
                        setDescription("Descargando archivo...")
                        setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType))
                        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                        setDestinationInExternalPublicDir(
                            Environment.DIRECTORY_DOWNLOADS,
                            URLUtil.guessFileName(url, contentDisposition, mimeType)
                        )
                        allowScanningByMediaScanner()
                    }
                    val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                    dm.enqueue(request)
                    Toast.makeText(this@MainActivity, "Descarga iniciada", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    val intent = android.content.Intent(android.content.Intent.ACTION_VIEW).apply {
                        data = Uri.parse(url)
                    }
                    startActivity(intent)
                }
            }
        }

        // Cargar la raíz - el server redirige a login si no estás autenticado
        binding.webView.loadUrl("https://academicanet.com")
    }

    private fun updateStatusBarColor(url: String) {
        val insetsController = WindowInsetsControllerCompat(window, window.decorView)
        when {
            url.contains(LOGIN_URL_FRAGMENT) || url == "https://academicanet.com/" || url == "https://academicanet.com" -> {
                window.statusBarColor = COLOR_LOGIN
                insetsController.isAppearanceLightStatusBars = false
            }
            else -> {
                window.statusBarColor = COLOR_WELCOME
                insetsController.isAppearanceLightStatusBars = true
            }
        }
    }

    /**
     * Inyecta solo JS de lógica adicional (no CSS - ya viene en los .js con document-start).
     */
    private fun injectLogicScripts(webView: WebView) {
        val scripts = listOf(
            "academica_optimizer_v9.0-alpha.js",
            "academica_login_cleanup_v9.0-alpha.js",
            "academica_welcome_cleanup_v9.0-alpha.js"
        )

        scripts.forEach { filename ->
            try {
                val script = assets.open(filename).bufferedReader().use { it.readText() }
                val wrapped = "(function(){\n$script\n})();"
                webView.evaluateJavascript(wrapped, null)
            } catch (e: Exception) {
                android.util.Log.e("Academica", "Error inyectando $filename: ${e.message}")
            }
        }
    }

    override fun onBackPressed() {
        val currentUrl = binding.webView.url ?: ""
        val canGoBack = binding.webView.canGoBack()

        if (!canGoBack) {
            super.onBackPressed()
            return
        }

        if (currentUrl.contains(LOGIN_URL_FRAGMENT) || currentUrl == "https://academicanet.com/") {
            super.onBackPressed()
            return
        }

        binding.webView.goBack()
    }
}
