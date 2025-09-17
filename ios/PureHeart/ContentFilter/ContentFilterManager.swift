import Foundation
import SafariServices
import React
import FamilyControls
import ManagedSettings
import DeviceActivity

@objc(ContentFilterManager)
class ContentFilterManager: NSObject {
  
  private let userDefaults = UserDefaults(suiteName: "group.com.100klabs.pureheart.contentfilter")
  private let blockedDomainsKey = "blockedDomains"
  private let managedSettingsStore = ManagedSettingsStore()
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  func isFilterEnabled(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      // Check if we have Screen Time authorization
      let authorizationStatus = AuthorizationCenter.shared.authorizationStatus
      let isAuthorized = authorizationStatus == .approved
      
      // Also check our UserDefaults
      guard let userDefaults = self.userDefaults else {
        reject("error", "Cannot access shared UserDefaults", nil)
        return
      }
      
      let isEnabledInSettings = userDefaults.bool(forKey: "contentFilterEnabled")
      
      // Return true only if both authorized and enabled in settings
      resolve(isAuthorized && isEnabledInSettings)
    } else {
      // Fallback for older iOS versions - just check UserDefaults
      guard let userDefaults = self.userDefaults else {
        reject("error", "Cannot access shared UserDefaults", nil)
        return
      }
      
      let isEnabled = userDefaults.bool(forKey: "contentFilterEnabled")
      resolve(isEnabled)
    }
  }
  
  @objc
  func enableFilter(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      // Request Screen Time authorization first
      Task {
        do {
          try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
          
          // Authorization granted, now enable content filtering
          DispatchQueue.main.async {
            // Set up managed settings to block inappropriate websites
            self.setupManagedSettings()
            
            // Mark as enabled in our UserDefaults
            if let userDefaults = self.userDefaults {
              userDefaults.set(true, forKey: "contentFilterEnabled")
            }
            
            let alert = UIAlertController(
              title: "Content Filter Enabled",
              message: "Content filtering has been enabled successfully. Inappropriate websites will now be blocked across all apps and Safari.",
              preferredStyle: .alert
            )
            
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
              resolve(true)
            })
            
            if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
              rootViewController.present(alert, animated: true)
            } else {
              resolve(true)
            }
          }
        } catch {
          DispatchQueue.main.async {
            let alert = UIAlertController(
              title: "Permission Required",
              message: "Screen Time permission is required to block inappropriate content. Please grant permission when prompted.",
              preferredStyle: .alert
            )
            
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
              resolve(false)
            })
            
            if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
              rootViewController.present(alert, animated: true)
            } else {
              resolve(false)
            }
          }
        }
      }
    } else {
      // Fallback for older iOS versions
      let alert = UIAlertController(
        title: "Enable Content Filter",
        message: "This will enable content filtering in the app. For system-wide protection, please set up Screen Time restrictions in Settings.",
        preferredStyle: .alert
      )
      
      alert.addAction(UIAlertAction(title: "Enable", style: .default) { _ in
        if let userDefaults = self.userDefaults {
          userDefaults.set(true, forKey: "contentFilterEnabled")
        }
        resolve(true)
      })
      
      alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
        resolve(false)
      })
      
      DispatchQueue.main.async {
        if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
          rootViewController.present(alert, animated: true)
        } else {
          reject("error", "Cannot present alert", nil)
        }
      }
    }
  }
  
  @objc
  func disableFilter(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      // Clear managed settings
      managedSettingsStore.clearAllSettings()
      
      // Mark as disabled in UserDefaults
      if let userDefaults = self.userDefaults {
        userDefaults.set(false, forKey: "contentFilterEnabled")
      }
      
      let alert = UIAlertController(
        title: "Content Filter Disabled",
        message: "Content filtering has been disabled. Websites will no longer be blocked.",
        preferredStyle: .alert
      )
      
      alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
        resolve(true)
      })
      
      DispatchQueue.main.async {
        if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
          rootViewController.present(alert, animated: true)
        } else {
          resolve(true)
        }
      }
    } else {
      // Fallback for older iOS versions
      if let userDefaults = self.userDefaults {
        userDefaults.set(false, forKey: "contentFilterEnabled")
      }
      resolve(true)
    }
  }
  
  @objc
  func reloadContentBlocker(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // TODO: Uncomment below when Safari Content Blocker extension is properly added to Xcode project
    /*
    SFContentBlockerManager.reloadContentBlocker(withIdentifier: "com.100klabs.pureheart.SafariContentBlocker") { error in
      if let error = error {
        reject("error", "Failed to reload content blocker: \(error.localizedDescription)", error)
        return
      }
      
      resolve(true)
    }
    */
    
    // For now, return true to test the bridge
    resolve(true)
  }
  
  @objc
  func addBlockedDomain(_ domain: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = self.userDefaults else {
      reject("error", "Cannot access shared UserDefaults", nil)
      return
    }
    
    var blockedDomains = userDefaults.stringArray(forKey: blockedDomainsKey) ?? []
    
    // Don't add if already exists
    if !blockedDomains.contains(domain) {
      blockedDomains.append(domain)
      userDefaults.set(blockedDomains, forKey: blockedDomainsKey)
    }
    
    self.reloadContentBlocker(resolve, rejecter: reject)
  }
  
  @objc
  func removeBlockedDomain(_ domain: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = self.userDefaults else {
      reject("error", "Cannot access shared UserDefaults", nil)
      return
    }
    
    var blockedDomains = userDefaults.stringArray(forKey: blockedDomainsKey) ?? []
    
    blockedDomains.removeAll { $0 == domain }
    userDefaults.set(blockedDomains, forKey: blockedDomainsKey)
    
    self.reloadContentBlocker(resolve, rejecter: reject)
  }
  
  @objc
  func getBlockedDomains(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = self.userDefaults else {
      reject("error", "Cannot access shared UserDefaults", nil)
      return
    }
    
    let customBlockedDomains = userDefaults.stringArray(forKey: blockedDomainsKey) ?? []
    
    // Predefined list of commonly blocked inappropriate websites
    let predefinedBlockedDomains = [
      "pornhub.com",
      "xvideos.com", 
      "xnxx.com",
      "redtube.com",
      "youporn.com",
      "tube8.com",
      "spankbang.com",
      "chaturbate.com",
      "cam4.com",
      "livejasmin.com",
      "stripchat.com",
      "xhamster.com",
      "beeg.com",
      "sex.com",
      "xxx.com",
      "porn.com",
      "adult.com",
      "playboy.com",
      "penthouse.com"
    ]
    
    // Combine predefined and custom domains
    let allBlockedDomains = predefinedBlockedDomains + customBlockedDomains
    resolve(Array(Set(allBlockedDomains))) // Remove duplicates
  }
  
  @objc
  func getDefaultBlockedDomains(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Return just the predefined list
    let predefinedBlockedDomains = [
      "pornhub.com",
      "xvideos.com", 
      "xnxx.com",
      "redtube.com",
      "youporn.com",
      "tube8.com",
      "spankbang.com",
      "chaturbate.com",
      "cam4.com",
      "livejasmin.com",
      "stripchat.com",
      "xhamster.com",
      "beeg.com",
      "sex.com",
      "xxx.com",
      "porn.com",
      "adult.com",
      "playboy.com",
      "penthouse.com"
    ]
    
    resolve(predefinedBlockedDomains)
  }
  
  @objc
  func isDomainBlocked(_ url: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let userDefaults = self.userDefaults else {
      reject("error", "Cannot access shared UserDefaults", nil)
      return
    }
    
    // Check if filter is enabled
    let isEnabled = userDefaults.bool(forKey: "contentFilterEnabled")
    if !isEnabled {
      resolve(false)
      return
    }
    
    // Get all blocked domains
    let customBlockedDomains = userDefaults.stringArray(forKey: blockedDomainsKey) ?? []
    let predefinedBlockedDomains = [
      "pornhub.com", "xvideos.com", "xnxx.com", "redtube.com", "youporn.com",
      "tube8.com", "spankbang.com", "chaturbate.com", "cam4.com", "livejasmin.com",
      "stripchat.com", "xhamster.com", "beeg.com", "sex.com", "xxx.com",
      "porn.com", "adult.com", "playboy.com", "penthouse.com"
    ]
    
    let allBlockedDomains = predefinedBlockedDomains + customBlockedDomains
    let urlLowercase = url.lowercased()
    
    // Check if any blocked domain is contained in the URL
    let isBlocked = allBlockedDomains.contains { domain in
      urlLowercase.contains(domain.lowercased())
    }
    
    resolve(isBlocked)
  }
  
  @objc
  func openContentBlockerSettings(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let alert = UIAlertController(
      title: "Content Filter Settings",
      message: "To manage your content filter:\n\n• Open Settings app\n• Go to Screen Time\n• Tap 'Content & Privacy Restrictions'\n• Configure website restrictions\n\nTo disable private browsing:\n• Open Safari Settings\n• Turn off 'Private Browsing'",
      preferredStyle: .alert
    )
    
    alert.addAction(UIAlertAction(title: "Open Settings", style: .default) { _ in
      if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
        UIApplication.shared.open(settingsUrl, options: [:]) { success in
          resolve(success)
        }
      } else {
        resolve(false)
      }
    })
    
    alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
      resolve(true)
    })
    
    DispatchQueue.main.async {
      if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
        rootViewController.present(alert, animated: true)
      } else {
        reject("error", "Cannot present alert", nil)
      }
    }
  }
  
  // MARK: - Private Helper Methods
  
  @available(iOS 16.0, *)
  private func setupManagedSettings() {
    // Block inappropriate websites using Screen Time API
    let blockedDomains = [
      "pornhub.com",
      "xvideos.com", 
      "xnxx.com",
      "redtube.com",
      "youporn.com",
      "tube8.com",
      "spankbang.com",
      "chaturbate.com",
      "cam4.com",
      "livejasmin.com",
      "stripchat.com",
      "xhamster.com",
      "beeg.com",
      "sex.com",
      "xxx.com",
      "porn.com",
      "adult.com",
      "playboy.com",
      "penthouse.com"
    ]
    
    // Create WebDomain objects for blocking
    var blockedWebDomains = Set<WebDomain>()
    for domain in blockedDomains {
      blockedWebDomains.insert(WebDomain(domain: domain))
    }
    
    // Apply the settings
    managedSettingsStore.webContent.blockedByFilter = WebContentSettings.FilterPolicy.specific(blockedWebDomains)
  }
}
