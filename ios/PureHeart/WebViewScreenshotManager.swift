import Foundation
import UIKit
import WebKit
import React

@objc(WebViewScreenshotManager)
class WebViewScreenshotManager: RCTEventEmitter {
    
    private var screenshotQueue: [String] = []
    private let batchSize = 5
    private let apiEndpoint = "https://api.thepurityapp.com/api/screenshots/scrutinized"
    private weak var currentWebView: WKWebView?
    private let queueSerialQueue = DispatchQueue(label: "screenshot.queue", qos: .utility)
    
    override init() {
        super.init()
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func supportedEvents() -> [String]! {
        return ["screenshot_captured", "screenshots_sent", "screenshot_error", "screenshots_flushed"]
    }
    
    @objc(setWebView:)
    func setWebView(_ webViewTag: NSNumber) {
        DispatchQueue.main.async {
            if webViewTag.intValue == -1 {
                // Auto-detect WebView in current view hierarchy
                if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
                    self.currentWebView = self.findWebViewInViewController(rootViewController)
                    if self.currentWebView != nil {
                        self.sendEvent(withName: "screenshot_captured", body: "WebView auto-detected successfully")
                    } else {
                        self.sendEvent(withName: "screenshot_error", body: "Failed to auto-detect WebView")
                    }
                }
            } else {
                if let bridge = self.bridge,
                   let uiManager = bridge.module(for: RCTUIManager.self) as? RCTUIManager {
                    uiManager.addUIBlock { (uiManager, viewRegistry) in
                        if let webView = viewRegistry?[webViewTag] as? WKWebView {
                            self.currentWebView = webView
                            self.sendEvent(withName: "screenshot_captured", body: "WebView reference set successfully")
                        }
                    }
                }
            }
        }
    }
    
    private func findWebViewInViewController(_ viewController: UIViewController) -> WKWebView? {
        if let webView = findWebViewInView(view: viewController.view) {
            return webView
        }
        
        // Check child view controllers
        for child in viewController.children {
            if let webView = findWebViewInViewController(child) {
                return webView
            }
        }
        
        return nil
    }
    
    @objc(captureWebViewScreenshot:withRejecter:)
    func captureWebViewScreenshot(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            guard let webView = self.currentWebView ?? self.findWebViewInWindow() else {
                reject("NO_WEBVIEW", "WebView not found", nil)
                self.sendEvent(withName: "screenshot_error", body: "WebView not found")
                return
            }
            
            self.captureScreenshotFromWebView(webView: webView, resolve: resolve, reject: reject)
        }
    }
    
    private func findWebViewInWindow() -> WKWebView? {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first else { return nil }
        return findWebViewInView(view: window)
    }
    
    private func findWebViewInView(view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView {
            return webView
        }
        
        for subview in view.subviews {
            if let webView = findWebViewInView(view: subview) {
                return webView
            }
        }
        
        return nil
    }
    
    private func captureScreenshotFromWebView(webView: WKWebView, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Take screenshot configuration
        let config = WKSnapshotConfiguration()
        config.rect = CGRect(origin: .zero, size: webView.scrollView.contentSize)
        
        webView.takeSnapshot(with: config) { [weak self] image, error in
            guard let self = self else { return }
            
            if let error = error {
                reject("SNAPSHOT_ERROR", "Failed to take snapshot: \(error.localizedDescription)", error)
                self.sendEvent(withName: "screenshot_error", body: "Failed to take snapshot: \(error.localizedDescription)")
                return
            }
            
            guard let image = image else {
                reject("NO_IMAGE", "No image captured", nil)
                self.sendEvent(withName: "screenshot_error", body: "No image captured")
                return
            }
            
            // Convert to base64
            guard let imageData = image.jpegData(compressionQuality: 0.8) else {
                reject("COMPRESSION_ERROR", "Failed to compress image", nil)
                self.sendEvent(withName: "screenshot_error", body: "Failed to compress image")
                return
            }
            
            let base64String = "data:image/jpeg;base64," + imageData.base64EncodedString()
            
            // Add to queue
            self.queueSerialQueue.async {
                self.screenshotQueue.append(base64String)
                
                // Check if we should send batch
                if self.screenshotQueue.count >= self.batchSize {
                    self.sendScreenshotBatch(resolve: { _ in }, reject: { _, _, _ in })
                }
            }
            
            resolve("Screenshot captured successfully")
            self.sendEvent(withName: "screenshot_captured", body: "Screenshot captured and queued")
        }
    }
    
    @objc(sendScreenshotBatch:withRejecter:)
    func sendScreenshotBatch(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        queueSerialQueue.async {
            let screenshots = Array(self.screenshotQueue.prefix(self.batchSize))
            
            if screenshots.isEmpty {
                DispatchQueue.main.async {
                    resolve("No screenshots to send")
                }
                return
            }
            
            // Remove screenshots from queue
            self.screenshotQueue.removeFirst(min(self.batchSize, self.screenshotQueue.count))
            
            // Create request payload
            let payload: [String: Any] = ["images": screenshots]
            
            guard let jsonData = try? JSONSerialization.data(withJSONObject: payload, options: []) else {
                DispatchQueue.main.async {
                    reject("JSON_ERROR", "Failed to serialize JSON", nil)
                    self.sendEvent(withName: "screenshot_error", body: "Failed to serialize JSON")
                }
                return
            }
            
            // Create request
            guard let url = URL(string: self.apiEndpoint) else {
                DispatchQueue.main.async {
                    reject("URL_ERROR", "Invalid API endpoint URL", nil)
                    self.sendEvent(withName: "screenshot_error", body: "Invalid API endpoint URL")
                }
                return
            }
            
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            // Add auth token if available
            if let authToken = self.getAuthToken(), !authToken.isEmpty {
                request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
            }
            
            request.httpBody = jsonData
            
            // Execute request
            URLSession.shared.dataTask(with: request) { data, response, error in
                DispatchQueue.main.async {
                    if let error = error {
                        reject("NETWORK_ERROR", "Network error: \(error.localizedDescription)", error)
                        self.sendEvent(withName: "screenshot_error", body: "Network error: \(error.localizedDescription)")
                        return
                    }
                    
                    guard let httpResponse = response as? HTTPURLResponse else {
                        reject("RESPONSE_ERROR", "Invalid response", nil)
                        self.sendEvent(withName: "screenshot_error", body: "Invalid response")
                        return
                    }
                    
                    if 200...299 ~= httpResponse.statusCode {
                        let responseString = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
                        resolve("Screenshots sent successfully: \(responseString)")
                        self.sendEvent(withName: "screenshots_sent", body: "Batch of \(screenshots.count) screenshots sent successfully")
                    } else {
                        let errorString = data.flatMap { String(data: $0, encoding: .utf8) } ?? "Unknown error"
                        reject("HTTP_ERROR", "HTTP \(httpResponse.statusCode): \(errorString)", nil)
                        self.sendEvent(withName: "screenshot_error", body: "Failed to send screenshots: HTTP \(httpResponse.statusCode)")
                    }
                }
            }.resume()
        }
    }
    
    @objc(flushScreenshotQueue:withRejecter:)
    func flushScreenshotQueue(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        queueSerialQueue.async {
            let allScreenshots = self.screenshotQueue
            self.screenshotQueue.removeAll()
            
            if allScreenshots.isEmpty {
                DispatchQueue.main.async {
                    resolve("No screenshots to flush")
                }
                return
            }
            
            // Send in batches
            let batches = allScreenshots.chunked(into: self.batchSize)
            var successCount = 0
            let group = DispatchGroup()
            
            for batch in batches {
                group.enter()
                
                let payload: [String: Any] = ["images": batch]
                
                guard let jsonData = try? JSONSerialization.data(withJSONObject: payload, options: []),
                      let url = URL(string: self.apiEndpoint) else {
                    group.leave()
                    continue
                }
                
                var request = URLRequest(url: url)
                request.httpMethod = "POST"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                
                if let authToken = self.getAuthToken(), !authToken.isEmpty {
                    request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
                }
                
                request.httpBody = jsonData
                
                URLSession.shared.dataTask(with: request) { data, response, error in
                    defer { group.leave() }
                    
                    if let httpResponse = response as? HTTPURLResponse, 200...299 ~= httpResponse.statusCode {
                        successCount += batch.count
                    } else {
                        DispatchQueue.main.async {
                            self.sendEvent(withName: "screenshot_error", body: "Failed to send batch")
                        }
                    }
                }.resume()
            }
            
            group.notify(queue: .main) {
                resolve("Flushed \(successCount) screenshots successfully")
                self.sendEvent(withName: "screenshots_flushed", body: "Flushed \(successCount) screenshots")
            }
        }
    }
    
    @objc(getQueueSize:withRejecter:)
    func getQueueSize(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        queueSerialQueue.async {
            DispatchQueue.main.async {
                resolve(self.screenshotQueue.count)
            }
        }
    }
    
    private func getAuthToken() -> String? {
        // This should be implemented to get auth token from your app's storage
        // You can use UserDefaults or Keychain
        return UserDefaults.standard.string(forKey: "authToken")
    }
}

// Extension to chunk arrays
extension Array {
    func chunked(into size: Int) -> [[Element]] {
        return stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}
