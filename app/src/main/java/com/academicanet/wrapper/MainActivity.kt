package com.academicanet.wrapper

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.academicanet.wrapper.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var scriptsInjected = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // CookieManager: sesión persistente
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        binding.webView.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                cacheMode = WebSettings.LOAD_DEFAULT
                allowFileAccess = true
                allowContentAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                
                // Optimizaciones para gama media (A25 5G)
                setEnableSmoothTransition(true)
                
                // Zoom deshabilitado para feel de app nativa
                setSupportZoom(false)
                builtInZoomControls = false
                displayZoomControls = false
                
                // Viewport
                useWideViewPort = true
                loadWithOverviewMode = true
            }

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    super.onPageStarted(view, url, favicon)
                    scriptsInjected = false
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    if (view != null && !scriptsInjected) {
                        injectAllScripts(view)
                        scriptsInjected = true
                    }
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
                            "Error de conexión. Verificá tu internet.",
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
        }

        // Cargar AcademicaNet
        binding.webView.loadUrl("https://academicanet.com")
    }

    private fun injectAllScripts(webView: WebView) {
        val scripts = listOf(
            "academica_optimizer_v9.0-alpha.js",
            "academica_content_general_v9.0-alpha.js",
            "academica_navsidebar_v9.0-alpha.js"
        )

        scripts.forEach { filename ->
            try {
                val script = assets.open(filename).bufferedReader().use { it.readText() }
                // Envolver en IIFE para aislamiento
                val wrapped = "(function(){\n$script\n})();"
                webView.evaluateJavascript(wrapped, null)
            } catch (e: Exception) {
                android.util.Log.e("Academica", "Error inyectando $filename: ${e.message}")
            }
        }
    }

    override fun onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
