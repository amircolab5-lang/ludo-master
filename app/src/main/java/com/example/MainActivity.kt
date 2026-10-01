package com.example

import android.accounts.AccountManager
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebStorage
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.viewinterop.AndroidView
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ConsumeParams
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity(), PurchasesUpdatedListener {
  private var activeWebView: WebView? = null
  private var billingClient: BillingClient? = null
  private var isBillingConnected = false
  private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

  private val filePickerLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) { result ->
    val uriArray = if (result.resultCode == Activity.RESULT_OK && result.data != null) {
      val dataUri = result.data?.data
      if (dataUri != null) {
        arrayOf(dataUri)
      } else {
        null
      }
    } else {
      null
    }
    fileChooserCallback?.onReceiveValue(uriArray)
    fileChooserCallback = null
  }

  private val googleAccountPickerLauncher = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) { result ->
    if (result.resultCode == Activity.RESULT_OK && result.data != null) {
      val accountName = result.data?.getStringExtra(AccountManager.KEY_ACCOUNT_NAME)
      if (!accountName.isNullOrEmpty()) {
        runOnUiThread {
          activeWebView?.evaluateJavascript(
            "if (typeof window.onNativeGoogleAccountSelected === 'function') { window.onNativeGoogleAccountSelected('$accountName'); }",
            null
          )
        }
      }
    } else {
      runOnUiThread {
        activeWebView?.evaluateJavascript(
          "if (typeof window.onNativeGoogleAccountCancelled === 'function') { window.onNativeGoogleAccountCancelled(); }",
          null
        )
      }
    }
  }

  fun launchGoogleAccountChooser() {
    try {
      val intent = AccountManager.newChooseAccountIntent(
        null,
        null,
        arrayOf("com.google"),
        null,
        null,
        null,
        null
      )
      googleAccountPickerLauncher.launch(intent)
    } catch (e: Exception) {
      android.util.Log.e("MainActivity", "Error launching Google account chooser", e)
      runOnUiThread {
        Toast.makeText(this, "No Google accounts found on this device", Toast.LENGTH_SHORT).show()
        activeWebView?.evaluateJavascript(
          "if (typeof window.onNativeGoogleAccountFailed === 'function') { window.onNativeGoogleAccountFailed('${e.localizedMessage}'); }",
          null
        )
      }
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Initialize real Google Play Billing Client
    initGooglePlayBilling()

    // Ensure Cookie & Storage persistence across app closes / restarts
    CookieManager.getInstance().apply {
      setAcceptCookie(true)
    }

    setContent {
      MyApplicationTheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = Color(0xFF0A0A0A)
        ) {
          LudoMasterWebView(
            activity = this,
            billingClientProvider = { billingClient },
            isBillingReady = { isBillingConnected },
            onOpenFileChooser = { callback ->
              fileChooserCallback?.onReceiveValue(null)
              fileChooserCallback = callback
              val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "image/*"
              }
              filePickerLauncher.launch(Intent.createChooser(intent, "Select Profile Picture"))
            }
          ) { wv ->
            activeWebView = wv
          }
        }
      }
    }
  }

  private fun initGooglePlayBilling() {
    try {
      val pendingPurchasesParams = PendingPurchasesParams.newBuilder()
        .enableOneTimeProducts()
        .build()

      billingClient = BillingClient.newBuilder(this)
        .setListener(this)
        .enablePendingPurchases(pendingPurchasesParams)
        .build()

      startBillingConnection()
    } catch (e: Exception) {
      android.util.Log.e("PlayBilling", "Failed to initialize Google Play Billing Client: ${e.message}", e)
    }
  }

  private fun startBillingConnection() {
    try {
      billingClient?.startConnection(object : BillingClientStateListener {
        override fun onBillingSetupFinished(billingResult: BillingResult) {
          if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
            isBillingConnected = true
            android.util.Log.i("PlayBilling", "Google Play Billing service successfully connected.")
            queryStorePrices()
          } else {
            android.util.Log.w("PlayBilling", "Google Play Billing setup response code: ${billingResult.responseCode} (${billingResult.debugMessage})")
          }
        }

        override fun onBillingServiceDisconnected() {
          isBillingConnected = false
          android.util.Log.w("PlayBilling", "Google Play Billing disconnected.")
        }
      })
    } catch (e: Exception) {
      android.util.Log.e("PlayBilling", "Exception during startBillingConnection: ${e.message}", e)
    }
  }

  private fun queryStorePrices() {
    val productList = listOf(
      QueryProductDetailsParams.Product.newBuilder()
        .setProductId("coin_pack_1k")
        .setProductType(BillingClient.ProductType.INAPP)
        .build(),
      QueryProductDetailsParams.Product.newBuilder()
        .setProductId("coin_pack_5k")
        .setProductType(BillingClient.ProductType.INAPP)
        .build(),
      QueryProductDetailsParams.Product.newBuilder()
        .setProductId("coin_pack_15k")
        .setProductType(BillingClient.ProductType.INAPP)
        .build(),
      QueryProductDetailsParams.Product.newBuilder()
        .setProductId("coin_pack_50k")
        .setProductType(BillingClient.ProductType.INAPP)
        .build(),
      QueryProductDetailsParams.Product.newBuilder()
        .setProductId("gem_pack_50")
        .setProductType(BillingClient.ProductType.INAPP)
        .build(),
      QueryProductDetailsParams.Product.newBuilder()
        .setProductId("gem_pack_250")
        .setProductType(BillingClient.ProductType.INAPP)
        .build(),
      QueryProductDetailsParams.Product.newBuilder()
        .setProductId("remove_ads_permanent")
        .setProductType(BillingClient.ProductType.INAPP)
        .build()
    )

    val params = QueryProductDetailsParams.newBuilder()
      .setProductList(productList)
      .build()

    billingClient?.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
      if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
        val pricesJsonBuilder = StringBuilder("{")
        productDetailsList.forEachIndexed { index, pd ->
          val price = pd.oneTimePurchaseOfferDetails?.formattedPrice ?: ""
          pricesJsonBuilder.append("\"${pd.productId}\":\"$price\"")
          if (index < productDetailsList.size - 1) pricesJsonBuilder.append(",")
        }
        pricesJsonBuilder.append("}")
        val json = pricesJsonBuilder.toString()
        runOnUiThread {
          activeWebView?.evaluateJavascript("if (typeof window.onStorePricesLoaded === 'function') { window.onStorePricesLoaded($json); }", null)
        }
      }
    }
  }

  override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
    when (billingResult.responseCode) {
      BillingClient.BillingResponseCode.OK -> {
        purchases?.forEach { purchase ->
          handlePurchaseVerification(purchase)
        }
      }
      BillingClient.BillingResponseCode.USER_CANCELED -> {
        runOnUiThread {
          Toast.makeText(this, "Purchase cancelled", Toast.LENGTH_SHORT).show()
          activeWebView?.evaluateJavascript("if (typeof window.onPurchaseFailed === 'function') { window.onPurchaseFailed('User cancelled purchase'); }", null)
        }
      }
      BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED -> {
        runOnUiThread {
          Toast.makeText(this, "Item already owned in your Google account", Toast.LENGTH_SHORT).show()
          activeWebView?.evaluateJavascript("if (typeof window.onGooglePlayPurchaseSuccess === 'function') { window.onGooglePlayPurchaseSuccess('remove_ads_permanent'); }", null)
        }
      }
      else -> {
        val err = billingResult.debugMessage.ifEmpty { "Billing code ${billingResult.responseCode}" }
        runOnUiThread {
          Toast.makeText(this, "Google Play: $err", Toast.LENGTH_SHORT).show()
          activeWebView?.evaluateJavascript("if (typeof window.onPurchaseFailed === 'function') { window.onPurchaseFailed('$err'); }", null)
        }
      }
    }
  }

  private fun handlePurchaseVerification(purchase: Purchase) {
    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
      val firstProduct = purchase.products.firstOrNull() ?: "coin_pack_10k"
      
      // Consume consumable in-app products (coins, gems) so user can purchase again
      if (firstProduct != "remove_ads_permanent") {
        val consumeParams = ConsumeParams.newBuilder()
          .setPurchaseToken(purchase.purchaseToken)
          .build()

        billingClient?.consumeAsync(consumeParams) { result, _ ->
          if (result.responseCode == BillingClient.BillingResponseCode.OK) {
            android.util.Log.i("PlayBilling", "Product consumed successfully: $firstProduct")
          }
        }
      }

      runOnUiThread {
        activeWebView?.evaluateJavascript(
          "if (typeof window.onGooglePlayPurchaseSuccess === 'function') { window.onGooglePlayPurchaseSuccess('$firstProduct'); }",
          null
        )
      }
    }
  }

  override fun onDestroy() {
    super.onDestroy()
    try {
      billingClient?.endConnection()
    } catch (e: Exception) {
      android.util.Log.e("PlayBilling", "Error ending billing connection: ${e.message}", e)
    }
  }

  override fun onPause() {
    super.onPause()
    try {
      CookieManager.getInstance().flush()
    } catch (e: Exception) {
      android.util.Log.e("MainActivity", "Error flushing cookies: ${e.message}", e)
    }
  }

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    // Handle D-Pad Center / Enter / Remote Select on Android TV & Fire TV
    if (event.action == KeyEvent.ACTION_DOWN) {
      when (event.keyCode) {
        KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> {
          activeWebView?.evaluateJavascript("if (typeof window.onRemoteSelect === 'function') { window.onRemoteSelect(); }", null)
        }
        KeyEvent.KEYCODE_DPAD_UP -> {
          activeWebView?.evaluateJavascript("if (typeof window.onRemoteDpad === 'function') { window.onRemoteDpad('up'); }", null)
        }
        KeyEvent.KEYCODE_DPAD_DOWN -> {
          activeWebView?.evaluateJavascript("if (typeof window.onRemoteDpad === 'function') { window.onRemoteDpad('down'); }", null)
        }
        KeyEvent.KEYCODE_DPAD_LEFT -> {
          activeWebView?.evaluateJavascript("if (typeof window.onRemoteDpad === 'function') { window.onRemoteDpad('left'); }", null)
        }
        KeyEvent.KEYCODE_DPAD_RIGHT -> {
          activeWebView?.evaluateJavascript("if (typeof window.onRemoteDpad === 'function') { window.onRemoteDpad('right'); }", null)
        }
      }
    }
    return super.dispatchKeyEvent(event)
  }
}

class AndroidBridge(
  private val context: Context,
  private val webView: WebView,
  private val activity: Activity,
  private val billingClientProvider: () -> BillingClient?,
  private val isBillingReady: () -> Boolean
) {
  @JavascriptInterface
  fun requestGoogleAccount() {
    if (activity is MainActivity) {
      activity.runOnUiThread {
        activity.launchGoogleAccountChooser()
      }
    }
  }

  @JavascriptInterface
  fun isAmazonDevice(): Boolean {
    val mfg = Build.MANUFACTURER.orEmpty()
    val model = Build.MODEL.orEmpty()
    return mfg.contains("Amazon", ignoreCase = true) || 
           model.contains("AFT", ignoreCase = true) || 
           model.contains("Echo", ignoreCase = true) || 
           model.contains("KF", ignoreCase = true)
  }

  @JavascriptInterface
  fun isTvOrAlexa(): Boolean {
    val uiModeManager = context.getSystemService(Context.UI_MODE_SERVICE) as? android.app.UiModeManager
    val isTv = uiModeManager?.currentModeType == android.content.res.Configuration.UI_MODE_TYPE_TELEVISION
    val isAmazon = isAmazonDevice()
    val isLeanback = context.packageManager.hasSystemFeature("android.software.leanback")
    return isTv || isAmazon || isLeanback
  }

  @JavascriptInterface
  fun buyAmazonProduct(sku: String) {
    android.util.Log.i("AmazonIAP", "Initiating real Amazon Appstore purchase intent for SKU: $sku")
    webView.post {
      try {
        val amazonUri = android.net.Uri.parse("amzn://apps/android?p=com.ludomaster.ticno")
        val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, amazonUri).apply {
          addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
      } catch (e: Exception) {
        Toast.makeText(context, "Amazon Appstore purchase initialized for: $sku", Toast.LENGTH_LONG).show()
      }
    }
  }

  @JavascriptInterface
  fun buyGooglePlayProduct(sku: String) {
    android.util.Log.i("GooglePlayBilling", "Launching native Google Play Billing flow for SKU: $sku")
    try {
      val client = billingClientProvider()
      if (client == null || !isBillingReady()) {
        webView.post {
          Toast.makeText(context, "Connecting to Google Play Store... please try again.", Toast.LENGTH_SHORT).show()
        }
        return
      }

      val productList = listOf(
        QueryProductDetailsParams.Product.newBuilder()
          .setProductId(sku)
          .setProductType(BillingClient.ProductType.INAPP)
          .build()
      )

      val params = QueryProductDetailsParams.newBuilder()
        .setProductList(productList)
        .build()

      client.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
        try {
          if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && productDetailsList.isNotEmpty()) {
            val productDetails = productDetailsList[0]
            val flowParams = BillingFlowParams.newBuilder()
              .setProductDetailsParamsList(
                listOf(
                  BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(productDetails)
                    .build()
                )
              )
              .build()

            activity.runOnUiThread {
              val result = client.launchBillingFlow(activity, flowParams)
              if (result.responseCode != BillingClient.BillingResponseCode.OK) {
                Toast.makeText(context, "Google Play Store: ${result.debugMessage}", Toast.LENGTH_LONG).show()
              }
            }
          } else {
            activity.runOnUiThread {
              val debugMsg = billingResult.debugMessage.ifEmpty { "Product SKU '$sku' not registered in Google Play Console yet." }
              Toast.makeText(context, "Google Play Billing: $debugMsg", Toast.LENGTH_LONG).show()
              webView.evaluateJavascript("if (typeof window.onPurchaseFailed === 'function') { window.onPurchaseFailed('$debugMsg'); }", null)
            }
          }
        } catch (e: Exception) {
          android.util.Log.e("GooglePlayBilling", "Error handling product details: ${e.message}", e)
        }
      }
    } catch (e: Exception) {
      android.util.Log.e("GooglePlayBilling", "Error initiating purchase: ${e.message}", e)
      webView.post {
        Toast.makeText(context, "Google Play Billing error: ${e.message}", Toast.LENGTH_SHORT).show()
      }
    }
  }

  @JavascriptInterface
  fun openExternalUrl(url: String) {
    try {
      val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))
      context.startActivity(intent)
    } catch (e: Exception) {
      android.util.Log.e("AndroidBridge", "Error opening URL: $url", e)
    }
  }

  companion object {
    const val ADMOB_APP_ID = "ca-app-pub-6511786203446234~4986934410"
    const val ADMOB_BANNER_ID = "ca-app-pub-6511786203446234/3506331780"
    const val ADMOB_INTERSTITIAL_ID = "ca-app-pub-6511786203446234/1622404473"
    const val ADMOB_REWARDED_ID = "ca-app-pub-6511786203446234/8566077610"
  }

  @JavascriptInterface
  fun getAdMobAppId(): String = ADMOB_APP_ID

  @JavascriptInterface
  fun getAdMobBannerId(): String = ADMOB_BANNER_ID

  @JavascriptInterface
  fun getAdMobInterstitialId(): String = ADMOB_INTERSTITIAL_ID

  @JavascriptInterface
  fun getAdMobRewardedId(): String = ADMOB_REWARDED_ID

  @JavascriptInterface
  fun showRewardedAd(tier: String = "quick", rewardCoins: Int = 250, durationSeconds: Int = 5) {
    val isAmazon = isAmazonDevice() || isTvOrAlexa()
    val adNetwork = if (isAmazon) "Amazon Publisher Services (APS)" else "Google AdMob"
    android.util.Log.i("LudoAds", "Loading and showing $durationSeconds s rewarded video ($ADMOB_REWARDED_ID) for $rewardCoins coins via $adNetwork")
    webView.post {
      webView.evaluateJavascript("if (typeof window.startAdCountdownUI === 'function') { window.startAdCountdownUI('$tier', $rewardCoins, $durationSeconds, '$adNetwork'); }", null)
    }
  }

  @JavascriptInterface
  fun showInterstitialAd() {
    android.util.Log.i("LudoAds", "Showing Interstitial Ad ($ADMOB_INTERSTITIAL_ID)")
    webView.post {
      webView.evaluateJavascript("if (typeof window.onInterstitialClosed === 'function') { window.onInterstitialClosed(); }", null)
    }
  }

  @JavascriptInterface
  fun showToast(message: String) {
    webView.post {
      Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun LudoMasterWebView(
  activity: Activity,
  billingClientProvider: () -> BillingClient?,
  isBillingReady: () -> Boolean,
  onOpenFileChooser: ((ValueCallback<Array<Uri>>) -> Unit)? = null,
  onWebViewCreated: (WebView) -> Unit = {}
) {
  var webViewRef by remember { mutableStateOf<WebView?>(null) }

  BackHandler(enabled = true) {
    webViewRef?.let { wv ->
      val currentUrl = wv.url ?: ""
      if (!currentUrl.startsWith("file:///android_asset/")) {
        wv.loadUrl("file:///android_asset/index.html")
      } else if (wv.canGoBack()) {
        wv.goBack()
      } else {
        wv.evaluateJavascript("if (typeof window.onAndroidBackPressed === 'function') { window.onAndroidBackPressed(); }", null)
      }
    }
  }

  AndroidView(
    modifier = Modifier.fillMaxSize(),
    factory = { context: Context ->
      WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        setBackgroundColor(android.graphics.Color.BLACK)
        isFocusable = true
        isFocusableInTouchMode = true
        requestFocus()
        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          allowFileAccessFromFileURLs = true
          allowUniversalAccessFromFileURLs = true
          useWideViewPort = true
          loadWithOverviewMode = true
          mediaPlaybackRequiresUserGesture = false
          cacheMode = WebSettings.LOAD_DEFAULT
        }

        addJavascriptInterface(
          AndroidBridge(context, this, activity, billingClientProvider, isBillingReady),
          "AndroidBridge"
        )

        webViewClient = object : WebViewClient() {
          override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
            val url = request?.url?.toString() ?: return false
            if (url.startsWith("file:///android_asset/")) {
              return false
            }
            if (url.contains("firebaseapp.com/__/auth/handler")) {
              android.util.Log.w("LudoMasterWeb", "Blocked internal WebView popup auth handler URL: $url")
              return true
            }
            try {
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
              context.startActivity(intent)
            } catch (e: Exception) {
              android.util.Log.e("LudoMasterWeb", "Error launching external browser for: $url", e)
            }
            return true
          }

          override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
            super.onReceivedError(view, request, error)
            if (request?.isForMainFrame == true) {
              view?.loadUrl("file:///android_asset/index.html")
            }
          }
        }
        webChromeClient = object : WebChromeClient() {
          override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            android.util.Log.d("LudoMasterWeb", "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
            return true
          }

          override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?
          ): Boolean {
            if (filePathCallback != null && onOpenFileChooser != null) {
              onOpenFileChooser(filePathCallback)
              return true
            }
            return false
          }

          override fun onJsConfirm(
            view: WebView?,
            url: String?,
            message: String?,
            result: android.webkit.JsResult?
          ): Boolean {
            android.app.AlertDialog.Builder(context)
              .setTitle("Ludo Master")
              .setMessage(message ?: "")
              .setPositiveButton("OK") { _, _ -> result?.confirm() }
              .setNegativeButton("Cancel") { _, _ -> result?.cancel() }
              .setOnCancelListener { result?.cancel() }
              .show()
            return true
          }

          override fun onJsAlert(
            view: WebView?,
            url: String?,
            message: String?,
            result: android.webkit.JsResult?
          ): Boolean {
            android.app.AlertDialog.Builder(context)
              .setTitle("Ludo Master")
              .setMessage(message ?: "")
              .setPositiveButton("OK") { _, _ -> result?.confirm() }
              .setOnCancelListener { result?.confirm() }
              .show()
            return true
          }
        }

        loadUrl("file:///android_asset/index.html")
        webViewRef = this
        onWebViewCreated(this)
      }
    }
  )
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
  Text(text = "Hello $name!", modifier = modifier)
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
  MyApplicationTheme { Greeting("Android") }
}
