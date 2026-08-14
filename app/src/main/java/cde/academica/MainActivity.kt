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
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import cde.academica.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var scriptsInjected = false

    companion object {
        private const val LOGIN_URL = "academicanet.com/index"
        private val COLOR_LOGIN = Color.parseColor("#1a237e")
        private val COLOR_WELCOME = Color.parseColor("#FFFFFF")
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Nav bar transparente
        window.navigationBarColor = Color.TRANSPARENT
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // CookieManager: sesion persistente
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        binding.webView.apply {
            // Hardware acceleration GPU
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                // Cache primero, red como fallback
                cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
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
                // Performance
                loadsImagesAutomatically = true
                blockNetworkImage = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    offscreenPreRaster = true
                }
                // Media sin gesto de usuario (para autoplay si hace falta)
                mediaPlaybackRequiresUserGesture = true
            }

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    scriptsInjected = false
                    url?.let { updateStatusBarColor(it) }

                    // Anti-FOUC: ocultar TODO antes de que cargue nada
                    view?.evaluateJavascript(
                        """
                        (function(){
                            if (!document.getElementById('academica-anti-fouc')) {
                                var s = document.createElement('style');
                                s.id = 'academica-anti-fouc';
                                s.textContent = 'html { visibility: hidden !important; }';
                                document.documentElement.appendChild(s);
                            }
                        })();
                        """.trimIndent(), null
                    )
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    if (view != null && !scriptsInjected) {
                        injectAllScripts(view)
                        scriptsInjected = true

                        // Quitar anti-FOUC: revelar pagina suavemente
                        view.evaluateJavascript(
                            """
                            (function(){
                                var s = document.getElementById('academica-anti-fouc');
                                if (s) {
                                    s.textContent = 'html { visibility: visible !important; opacity: 1 !important; transition: opacity 0.15s ease; }';
                                    setTimeout(function(){ s.remove(); }, 200);
                                }
                            })();
                            """.trimIndent(), null
                        )
                    }
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    if (url.startsWith("blob:")) {
                        Toast.makeText(this@MainActivity, "Descargando archivo...", Toast.LENGTH_SHORT).show()
                        view?.evaluateJavascript(
                            """
                            (function(){
                                var link = document.createElement('a');
                                link.href = '$url';
                                link.target = '_blank';
                                link.click();
                            })();
                            """.trimIndent(), null
                        )
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
                        android.util.Log.d(
                            "AcademicaJS",
                            "${it.sourceId()}:${it.lineNumber()} - ${it.message()}"
                        )
                    }
                    return true
                }
            }

            // Descargas: selector nativo de Android
            setDownloadListener { url, userAgent, contentDisposition, mimeType, contentLength ->
                try {
                    val request = DownloadManager.Request(Uri.parse(url)).apply {
                        setMimeType(mimeType)
                        addRequestHeader("User-Agent", userAgent)
                        setDescription("Descargando archivo...")
                        setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType))
                        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                        setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, contentDisposition, mimeType))
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

        // Cargar Welcome (si no esta logueado, el servidor redirige a login)
        binding.webView.loadUrl("https://academicanet.com/Views/Student/Welcome")
    }

    private fun updateStatusBarColor(url: String) {
        val insetsController = WindowInsetsControllerCompat(window, window.decorView)
        when {
            url.contains(LOGIN_URL) || url == "https://academicanet.com/" || url == "https://academicanet.com" -> {
                window.statusBarColor = COLOR_LOGIN
                insetsController.isAppearanceLightStatusBars = false
            }
            else -> {
                window.statusBarColor = COLOR_WELCOME
                insetsController.isAppearanceLightStatusBars = true
            }
        }
    }

    private fun injectAllScripts(webView: WebView) {
        val scripts = listOf(
            "academica_optimizer_v9.0-alpha.js",
            "academica_content_general_v9.0-alpha.js",
            "academica_navsidebar_v9.0-alpha.js",
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

        if (currentUrl.contains("Welcome") || currentUrl.contains("/Views/")) {
            binding.webView.copyBackForwardList().let { list ->
                val prevIndex = list.currentIndex - 1
                if (prevIndex >= 0) {
                    val prevUrl = list.getItemAtIndex(prevIndex).url
                    if (prevUrl.contains(LOGIN_URL) || prevUrl == "https://academicanet.com/") {
                        super.onBackPressed()
                        return
                    }
                }
            }
        }

        if (currentUrl.contains(LOGIN_URL) || currentUrl == "https://academicanet.com/") {
            super.onBackPressed()
            return
        }

        binding.webView.goBack()
    }
}
