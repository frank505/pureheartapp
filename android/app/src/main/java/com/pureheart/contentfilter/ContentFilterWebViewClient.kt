package com.pureheart.contentfilter

import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebResourceError
import android.util.Log
import java.io.ByteArrayInputStream
import java.io.InputStream

class ContentFilterWebViewClient(
    private val contentFilterManager: ContentFilterManager,
    private val originalClient: WebViewClient? = null
) : WebViewClient() {

    companion object {
        private const val TAG = "ContentFilterWebView"
        
        // JavaScript code to inject for content monitoring
        private val CONTENT_MONITORING_SCRIPT = """
            (function() {
                console.log('PureHeart Content Filter loaded');
                
                // Content monitoring configuration
                const INAPPROPRIATE_KEYWORDS = [
                    'porn', 'sex', 'nude', 'naked', 'xxx', 'adult content',
                    'erotic', 'fetish', 'cam girl', 'webcam', 'onlyfans',
                    'nsfw', 'mature content', '18+', 'xxx tube', 'redtube'
                ];
                
                const INAPPROPRIATE_DOMAINS = [
                    'pornhub', 'xvideos', 'xnxx', 'redtube', 'youporn',
                    'tube8', 'spankbang', 'chaturbate', 'cam4', 'livejasmin',
                    'stripchat', 'xhamster', 'beeg', 'onlyfans'
                ];
                
                // Check if current domain is blocked
                function isDomainBlocked() {
                    const hostname = window.location.hostname.toLowerCase();
                    return INAPPROPRIATE_DOMAINS.some(domain => hostname.includes(domain));
                }
                
                // Check for inappropriate content in text
                function containsInappropriateContent(text) {
                    const lowerText = text.toLowerCase();
                    return INAPPROPRIATE_KEYWORDS.some(keyword => lowerText.includes(keyword));
                }
                
                // Block the page with overlay
                function blockPage(reason) {
                    console.log('Blocking page:', reason);
                    
                    // Create blocking overlay
                    const overlay = document.createElement('div');
                    overlay.id = 'pureheart-content-block';
                    overlay.innerHTML = `
                        <div style="
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0, 0, 0, 0.95);
                            z-index: 999999;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            color: white;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            text-align: center;
                            padding: 20px;
                        ">
                            <div style="
                                background: #1a1a1a;
                                padding: 40px;
                                border-radius: 12px;
                                max-width: 400px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                            ">
                                <div style="font-size: 48px; margin-bottom: 20px;">🛡️</div>
                                <h2 style="margin: 0 0 16px 0; color: #ff6b6b;">Content Blocked</h2>
                                <p style="margin: 0 0 20px 0; opacity: 0.8; line-height: 1.5;">
                                    ' + reason + '
                                </p>
                                <p style="margin: 0 0 24px 0; font-size: 14px; opacity: 0.6;">
                                    This activity will be logged to your accountability partner.
                                </p>
                                <button onclick="window.history.back()" style="
                                    background: #007AFF;
                                    color: white;
                                    border: none;
                                    padding: 12px 24px;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    cursor: pointer;
                                    margin-right: 12px;
                                ">Go Back</button>
                                <button onclick="window.location.href='https://google.com'" style="
                                    background: #34C759;
                                    color: white;
                                    border: none;
                                    padding: 12px 24px;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    cursor: pointer;
                                ">Safe Search</button>
                            </div>
                        </div>
                    `;
                    
                    // Remove any existing overlay
                    const existing = document.getElementById('pureheart-content-block');
                    if (existing) existing.remove();
                    
                    // Add overlay to page
                    document.body.appendChild(overlay);
                    
                    // Notify native code
                    if (window.PureHeartContentFilter) {
                        window.PureHeartContentFilter.onContentBlocked(reason);
                    }
                }
                
                // Real-time content scanning
                function scanContent() {
                    // Check domain first
                    if (isDomainBlocked()) {
                        blockPage('This website is blocked by your content filter');
                        return;
                    }
                    
                    // Check page title
                    if (containsInappropriateContent(document.title)) {
                        blockPage('Inappropriate content detected in page title');
                        return;
                    }
                    
                    // Check visible text content
                    const bodyText = document.body.innerText || '';
                    if (containsInappropriateContent(bodyText)) {
                        blockPage('Inappropriate content detected on this page');
                        return;
                    }
                    
                    // Check meta description
                    const metaDescription = document.querySelector('meta[name="description"]');
                    if (metaDescription && containsInappropriateContent(metaDescription.content)) {
                        blockPage('Inappropriate content detected in page metadata');
                        return;
                    }
                    
                    // Check image alt texts
                    const images = document.querySelectorAll('img[alt]');
                    for (let img of images) {
                        if (containsInappropriateContent(img.alt)) {
                            blockPage('Inappropriate content detected in images');
                            return;
                        }
                    }
                }
                
                // Monitor for dynamic content changes
                function setupContentMonitoring() {
                    // Initial scan
                    scanContent();
                    
                    // Monitor DOM changes
                    const observer = new MutationObserver(function(mutations) {
                        let shouldScan = false;
                        
                        mutations.forEach(function(mutation) {
                            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                                shouldScan = true;
                            } else if (mutation.type === 'characterData') {
                                shouldScan = true;
                            }
                        });
                        
                        if (shouldScan) {
                            setTimeout(scanContent, 100); // Debounce scanning
                        }
                    });
                    
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });
                    
                    // Monitor navigation
                    let currentUrl = window.location.href;
                    setInterval(function() {
                        if (window.location.href !== currentUrl) {
                            currentUrl = window.location.href;
                            setTimeout(scanContent, 500); // Allow page to load
                        }
                    }, 1000);
                }
                
                // Initialize when DOM is ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', setupContentMonitoring);
                } else {
                    setupContentMonitoring();
                }
                
                // Block attempts to remove our monitoring
                const originalRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function(child) {
                    if (child && child.id === 'pureheart-content-block') {
                        console.log('Attempt to remove content block prevented');
                        return child;
                    }
                    return originalRemoveChild.call(this, child);
                };
                
            })();
        """
    }

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString() ?: ""
        
        // Check if URL should be blocked
        if (contentFilterManager.isDomainBlocked(url)) {
            Log.d(TAG, "Blocking URL: $url")
            contentFilterManager.showContentOverlay("This website is blocked by your content filter")
            return true // Block the navigation
        }
        
        // Let original client handle if present
        return originalClient?.shouldOverrideUrlLoading(view, request) ?: super.shouldOverrideUrlLoading(view, request)
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
        super.onPageStarted(view, url, favicon)
        originalClient?.onPageStarted(view, url, favicon)
        
        url?.let {
            Log.d(TAG, "Page started loading: $it")
            
            // Check if URL should be blocked
            if (contentFilterManager.isDomainBlocked(it)) {
                Log.d(TAG, "Stopping blocked page load: $it")
                view?.stopLoading()
                contentFilterManager.showContentOverlay("This website is blocked by your content filter")
                return
            }
        }
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        
        // Inject content monitoring script
        view?.let { webView ->
            try {
                // Add JavaScript interface
                webView.addJavascriptInterface(
                    ContentFilterJavaScriptInterface(contentFilterManager),
                    "PureHeartContentFilter"
                )
                
                // Inject monitoring script
                webView.evaluateJavascript(CONTENT_MONITORING_SCRIPT) { result ->
                    Log.d(TAG, "Content monitoring script injected, result: $result")
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Error injecting content monitoring script", e)
            }
        }
        
        originalClient?.onPageFinished(view, url)
    }

    override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
        val url = request?.url?.toString() ?: ""
        
        // Block requests to inappropriate domains
        if (contentFilterManager.isDomainBlocked(url)) {
            Log.d(TAG, "Intercepting blocked request: $url")
            
            // Return empty response to block the request
            return WebResourceResponse(
                "text/html",
                "UTF-8",
                ByteArrayInputStream("".toByteArray())
            )
        }
        
        return originalClient?.shouldInterceptRequest(view, request) ?: super.shouldInterceptRequest(view, request)
    }

    override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
        super.onReceivedError(view, request, error)
        originalClient?.onReceivedError(view, request, error)
        
        Log.d(TAG, "WebView error: ${error?.errorCode} - ${error?.description} for URL: ${request?.url}")
    }
}

class ContentFilterJavaScriptInterface(
    private val contentFilterManager: ContentFilterManager
) {
    
    @JavascriptInterface
    fun onContentBlocked(reason: String) {
        Log.d("ContentFilterJS", "Content blocked from JavaScript: $reason")
        contentFilterManager.showContentOverlay(reason)
        contentFilterManager.incrementFlaggedContent()
    }
    
    @JavascriptInterface
    fun logInappropriateContent(content: String) {
        Log.d("ContentFilterJS", "Inappropriate content detected: $content")
        contentFilterManager.incrementFlaggedContent()
    }
    
    @JavascriptInterface
    fun reportAttempt(url: String) {
        Log.d("ContentFilterJS", "Reporting attempt to access: $url")
        // This could be used to send reports to accountability partners
    }
}
