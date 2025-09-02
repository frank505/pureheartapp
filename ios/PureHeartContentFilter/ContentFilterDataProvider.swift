import NetworkExtension
import os.log

class ContentFilterDataProvider: NEFilterDataProvider {
    
    private let logger = OSLog(subsystem: "com.pureheart.contentfilter", category: "ContentFilter")
    
    override init() {
        super.init()
        os_log("ContentFilterDataProvider initialized", log: logger, type: .info)
    }
    
    override func startFilter(completionHandler: @escaping (Error?) -> Void) {
        os_log("Starting content filter", log: logger, type: .info)
        
        // Initialize filter rules
        ContentBlockingManager.shared.startContentBlocking { success, error in
            if success {
                completionHandler(nil)
            } else {
                completionHandler(error)
            }
        }
    }
    
    override func stopFilter(with reason: NEProviderStopReason, completionHandler: @escaping () -> Void) {
        os_log("Stopping content filter with reason: %{public}@", log: logger, type: .info, String(describing: reason))
        
        ContentBlockingManager.shared.stopContentBlocking { _, _ in
            completionHandler()
        }
    }
    
    override func handleNewFlow(_ flow: NEFilterFlow) -> NEFilterNewFlowVerdict {
        guard let url = flow.url else {
            return .allow()
        }
        
        os_log("Analyzing flow for URL: %{public}@", log: logger, type: .debug, url.absoluteString)
        
        // Check if URL should be blocked
        if shouldBlockURL(url) {
            os_log("Blocking URL: %{public}@", log: logger, type: .info, url.absoluteString)
            ContentBlockingManager.shared.recordBlockedRequest(category: "network")
            return .drop()
        }
        
        // For image requests, allow but monitor
        if isImageRequest(url) {
            return .filterDataVerdict(
                withFilterInbound: true,
                peekInboundBytes: 1024 * 1024, // 1MB peek
                filterOutbound: false,
                peekOutboundBytes: 0
            )
        }
        
        return .allow()
    }
    
    override func handleInboundData(from flow: NEFilterFlow, readBytesStartOffset offset: Int, readBytes: Data) -> NEFilterDataVerdict {
        guard let url = flow.url, isImageRequest(url) else {
            return .allow()
        }
        
        // Analyze image data
        analyzeImageData(readBytes) { shouldBlock in
            if shouldBlock {
                os_log("Blocking image from URL: %{public}@", log: logger, type: .info, url.absoluteString)
                ContentBlockingManager.shared.recordBlockedRequest(category: "image")
                return .drop()
            } else {
                return .allow()
            }
        }
        
        // Allow data to pass while analysis is in progress
        return .allow()
    }
    
    private func shouldBlockURL(_ url: URL) -> Bool {
        let urlString = url.absoluteString.lowercased()
        
        // Check against blocked domains
        let blockedDomains = [
            "porn.com",
            "adult.com",
            "xxx.com",
            "sex.com",
            // Add more domains as needed
        ]
        
        for domain in blockedDomains {
            if urlString.contains(domain) {
                return true
            }
        }
        
        // Check for suspicious patterns
        let suspiciousPatterns = [
            "/adult/",
            "/porn/",
            "/xxx/",
            "/sex/",
            "?adult=",
            "&porn="
        ]
        
        for pattern in suspiciousPatterns {
            if urlString.contains(pattern) {
                return true
            }
        }
        
        return false
    }
    
    private func isImageRequest(_ url: URL) -> Bool {
        let imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"]
        let pathExtension = url.pathExtension.lowercased()
        return imageExtensions.contains(pathExtension)
    }
    
    private func analyzeImageData(_ data: Data, completion: @escaping (Bool) -> Void) {
        // Convert data to image
        guard let image = UIImage(data: data) else {
            completion(false)
            return
        }
        
        // Analyze image content
        ContentAnalysisService.shared.analyzeImage(from: "data:image/jpeg;base64,\(data.base64EncodedString())") { result in
            switch result {
            case .success(let analysisResult):
                completion(analysisResult.isBlocked)
            case .failure:
                // On analysis failure, allow the content
                completion(false)
            }
        }
    }
}
