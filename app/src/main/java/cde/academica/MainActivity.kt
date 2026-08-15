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
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.ByteArrayInputStream
import java.nio.charset.Charset
import java.util.Locale
import java.util.concurrent.TimeUnit
import android.webkit.CookieManager as AndroidCookieManager

/**
 * MainActivity - Wrapper nativo de AcademicaNet v1.9.0-alpha-4
 *
 * Arquitectura:
 *  1. shouldInterceptRequest (OkHttp) intercepta el main-frame GET e inyecta
 *     los 3 CSS (global, navbar, login) en el <head> del HTML antes del render.
 *     Esto hace el anti-FOUC natural (el CSS ya está cuando el browser parsea).
 *
 *  2. onPageFinished inyecta los JS de lógica (optimizer, login cleanup,
 *     welcome cleanup) via evaluateJavascript.
 *
 *  3. POST requests (login) NO se interceptan - pasan tal cual al servidor.
 *
 *  4. CookieManager de Android sincroniza con el CookieJar de OkHttp para
 *     mantener la sesión persistente.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    // OkHttp client con CookieJar que bridge con AndroidCookieManager
    private val httpClient: OkHttpClient by lazy {
        val cookieJar = object : CookieJar {
            override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                try {
                    val cm = AndroidCookieManager.getInstance()
                    for (c in cookies) {
                        val cookieStr = StringBuilder().apply {
                            append(c.name).append("=").append(c.value)
                            if (!c.path.isNullOrEmpty()) append("; Path=").append(c.path)
                            if (!c.domain.isNullOrEmpty()) append("; Domain=").append(c.domain)
                            if (c.secure) append("; Secure")
                            if (c.httpOnly) append("; HttpOnly")
                        }.toString()
                        cm.setCookie(url.toString(), cookieStr)
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) cm.flush()
                } catch (e: Exception) {
                    android.util.Log.w("AcademicaNet", "CookieJar.save error: ${e.message}")
                }
            }

            override fun loadForRequest(url: HttpUrl): List<Cookie> {
                return try {
                    val cm = AndroidCookieManager.getInstance()
                    val cookieHeader = cm.getCookie(url.toString()) ?: return emptyList()
                    val host = url.host
                    val list = mutableListOf<Cookie>()
                    cookieHeader.split(";").forEach { pair ->
                        val parts = pair.split("=", limit = 2)
                        if (parts.size == 2) {
                            try {
                                list.add(
                                    Cookie.Builder()
                                        .name(parts[0].trim())
                                        .value(parts[1].trim())
                                        .domain(host)
                                        .path("/")
                                        .build()
                                )
                            } catch (_: Exception) {}
                        }
                    }
                    list
                } catch (e: Exception) {
                    emptyList()
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
        private const val LOGIN_URL_FRAGMENT = "/index"
        private val COLOR_LOGIN = Color.parseColor("#1a237e")
        private val COLOR_WELCOME = Color.parseColor("#FFFFFF")
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

        // Empuja el WebView por debajo de status bar y por encima de nav bar
        ViewCompat.setOnApplyWindowInsetsListener(binding.webView) { v, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            )
            v.updatePadding(top = bars.top, bottom = bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        // CookieManager Android
        val cookieManager = AndroidCookieManager.getInstance()
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

            webViewClient = object : WebViewClient() {

                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    url?.let { updateStatusBarColor(it) }
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    if (view != null) {
                        // Inyecta solo los JS de lógica (NO CSS - eso ya lo hizo el interceptor)
                        injectLogicScripts(view)
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

                /**
                 * Interceptor HTTP nativo: inyecta los 3 CSS en el <head>
                 * ANTES de que el browser renderice. Esto elimina el FOUC
                 * de forma natural (no necesita fade-in porque el CSS ya está).
                 *
                 * Solo intercepta:
                 *  - main frame (no imágenes, no scripts, no iframes)
                 *  - GET (no POST, así el login pasa tal cual)
                 *  - host academicanet.com
                 */
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    val url = request?.url?.toString() ?: return null
                    val host = request.url.host ?: return null
                    if (!request.isForMainFrame || request.method != "GET" || !host.contains("academicanet.com")) {
                        return null
                    }

                    return try {
                        val rb = Request.Builder().url(url)
                        try { rb.header("User-Agent", binding.webView.settings.userAgentString) } catch (_: Exception) {}
                        rb.header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                        rb.header("Accept-Language", Locale.getDefault().toLanguageTag())
                        binding.webView.url?.let { rb.header("Referer", it) }

                        val resp = httpClient.newCall(rb.build()).execute()
                        val contentType = resp.header("Content-Type") ?: "text/html; charset=utf-8"

                        // No HTML: stream directo sin modificar
                        if (!contentType.contains("text/html", ignoreCase = true)) {
                            val mime = contentType.split(";")[0].ifEmpty { "application/octet-stream" }
                            val bodyStream = resp.body?.byteStream()
                            return if (bodyStream != null) WebResourceResponse(mime, "UTF-8", bodyStream) else null
                        }

                        val bodyStr = resp.body?.string() ?: ""

                        // Cargar los 3 CSS desde assets
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
                        WebResourceResponse("text/html", "UTF-8", ByteArrayInputStream(data))
                    } catch (e: Exception) {
                        android.util.Log.w("AcademicaNet", "Intercept fallback: ${e.message}")
                        null  // fallback: el WebView pide el recurso normalmente
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
     * Inyecta solo los JS de lógica (NO CSS).
     * El CSS ya fue inyectado por el interceptor HTTP en el <head>.
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

        if (currentUrl.contains(LOGIN_URL_FRAGMENT) || currentUrl == "https://academicanet.com/") {
            super.onBackPressed()
            return
        }

        binding.webView.goBack()
    }
}
