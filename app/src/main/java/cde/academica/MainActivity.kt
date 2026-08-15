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
import java.io.ByteArrayInputStream
import java.nio.charset.Charset
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit
import java.util.Locale
import android.webkit.CookieManager as AndroidCookieManager

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var scriptsInjected = false
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    // Reusable OkHttp client for interceptor (uses CookieJar that bridges to Android CookieManager)
    private val httpClient: OkHttpClient by lazy {
        val cookieJar = object : CookieJar {
            override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                try {
                    val cm = AndroidCookieManager.getInstance()
                    for (c in cookies) {
                        // Build a minimal cookie string that Android's CookieManager understands
                        val cookieStr = StringBuilder().apply {
                            append(c.name).append("=").append(c.value)
                            if (c.path != null && c.path.isNotEmpty()) append("; Path=").append(c.path)
                            if (c.domain != null && c.domain.isNotEmpty()) append("; Domain=").append(c.domain)
                            if (c.secure) append("; Secure")
                            if (c.httpOnly) append("; HttpOnly")
                        }.toString()
                        cm.setCookie(url.toString(), cookieStr)
                    }
                    // Flush changes to persistent storage
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) cm.flush() else android.webkit.CookieSyncManager.getInstance().sync()
                } catch (e: Exception) {
                    android.util.Log.w("AcademicaNet", "CookieJar.saveFromResponse error: ${e.message}")
                }
            }

            override fun loadForRequest(url: HttpUrl): List<Cookie> {
                try {
                    val cm = AndroidCookieManager.getInstance()
                    val cookieHeader = cm.getCookie(url.toString()) ?: return emptyList()
                    val host = url.host
                    val list = mutableListOf<Cookie>()
                    cookieHeader.split(";").forEach { pair ->
                        val parts = pair.split("=", limit = 2)
                        if (parts.size == 2) {
                            val name = parts[0].trim()
                            val value = parts[1].trim()
                            try {
                                val cookie = Cookie.Builder()
                                    .name(name)
                                    .value(value)
                                    .domain(host)
                                    .path("/")
                                    .build()
                                list.add(cookie)
                            } catch (_: Exception) {}
                        }
                    }
                    return list
                } catch (e: Exception) {
                    android.util.Log.w("AcademicaNet", "CookieJar.loadForRequest error: ${e.message}")
                    return emptyList()
                }
            }
        }

        OkHttpClient.Builder()
            .followRedirects(true)
            .followSslRedirects(true)
            .cookieJar(cookieJar)
            .callTimeout(20, TimeUnit.SECONDS)
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .build()
    }

    companion object {
        private const val LOGIN_URL = "academicanet.com/index"
        private val COLOR_LOGIN = Color.parseColor("#1a237e")
        private val COLOR_WELCOME = Color.parseColor("#FFFFFF")
    }

    // Selector de archivos nativo de Android
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

        // Empuja el contenido del WebView por debajo de la status bar y por encima
        // de la nav bar, para que la web no quede tapada por los system bars.
        ViewCompat.setOnApplyWindowInsetsListener(binding.webView) { v, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            )
            v.updatePadding(top = bars.top, bottom = bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        // CookieManager: sesion persistente (Android)
        val cookieManager = AndroidCookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        binding.webView.apply {
            // Hardware acceleration GPU
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
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
                loadsImagesAutomatically = true
                blockNetworkImage = false
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    offscreenPreRaster = true
                }
                mediaPlaybackRequiresUserGesture = true
            }

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    scriptsInjected = false
                    url?.let { updateStatusBarColor(it) }

                    // Anti-FOUC: gentle safety-net (fade-in body) while interceptor injects CSS
                    view?.evaluateJavascript(
                        """
                        (function(){
                            if (!document.getElementById('academica-anti-fouc')) {
                                var s = document.createElement('style');
                                s.id = 'academica-anti-fouc';
                                s.textContent = 'body { opacity: 0 !important; transition: opacity 0.12s ease !important; }';
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

                        // Remove anti-FOUC: reveal page smoothly
                        view.evaluateJavascript(
                            """
                            (function(){
                                var s = document.getElementById('academica-anti-fouc');
                                if (s) {
                                    s.textContent = 'body { opacity: 1 !important; transition: opacity 0.15s ease !important; }';
                                    setTimeout(function(){ s.remove(); }, 300);
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

                override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                    val url = request?.url?.toString() ?: return null
                    val host = request?.url?.host ?: return null
                    // Solo interceptar main-frame GET para academicanet.com
                    if (!request.isForMainFrame || request.method != "GET" || !host.contains("academicanet.com")) return null

                    try {
                        // Build OkHttp request
                        val rb = Request.Builder().url(url)

                        // Propagar cookies (OkHttp CookieJar will also include cookies set from previous responses)
                        // Propagar UA/Accept/Accept-Language/Referer for fidelity
                        try { rb.header("User-Agent", binding.webView.settings.userAgentString) } catch (_: Exception) {}
                        rb.header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                        rb.header("Accept-Language", Locale.getDefault().toLanguageTag())
                        // Use current webview URL as Referer when available
                        binding.webView.url?.let { rb.header("Referer", it) }

                        val resp = httpClient.newCall(rb.build()).execute()
                        val contentType = resp.header("Content-Type") ?: "text/html; charset=utf-8"

                        // If not HTML, stream it directly
                        if (!contentType.contains("text/html", ignoreCase = true)) {
                            val mime = contentType.split(";")[0].ifEmpty { "application/octet-stream" }
                            val bodyStream = resp.body?.byteStream()
                            if (bodyStream != null) return WebResourceResponse(mime, "UTF-8", bodyStream)
                            return null
                        }

                        val bodyStr = resp.body?.string() ?: ""

                        val globalCss = assets.open("academica_content_general.css").bufferedReader().use { it.readText() }
                        val navCss = assets.open("academica_navsidebar.css").bufferedReader().use { it.readText() }
                        val loginCss = assets.open("academica_login.css").bufferedReader().use { it.readText() }

                        val sb = StringBuilder()
                        sb.append("<style id=\"academica-inject-global\">").append(globalCss).append("</style>")
                        sb.append("<style id=\"academica-inject-nav\">").append(navCss).append("</style>")
                        val lowUrl = url.lowercase()
                        if (lowUrl.endsWith("/") || lowUrl.contains("/index") || lowUrl.contains("/views/account/login")) {
                            sb.append("<style id=\"academica-inject-login\">").append(loginCss).append("</style>")
                        }

                        val modifiedHtml = injectIntoHead(bodyStr, sb.toString())
                        val data = modifiedHtml.toByteArray(Charset.forName("UTF-8"))
                        return WebResourceResponse("text/html", "UTF-8", ByteArrayInputStream(data))
                    } catch (e: Exception) {
                        android.util.Log.w("AcademicaNet", "Intercept fallback: ${e.message}")
                        return null
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

                // File picker: cuando la web pide subir un archivo
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
            "academica_login_cleanup_v9.0-alpha.js"
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

    private fun injectIntoHead(html: String, insert: String): String {
        val idx = html.indexOf("<head", ignoreCase = true)
        if (idx >= 0) {
            val headStart = html.indexOf('>', idx)
            if (headStart >= 0) {
                val before = html.substring(0, headStart + 1)
                val after = html.substring(headStart + 1)
                return before + insert + after
            }
        }
        return "<head>$insert</head>$html"
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
