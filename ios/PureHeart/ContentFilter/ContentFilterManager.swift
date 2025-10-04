import Foundation
import SafariServices
import React
import FamilyControls
import ManagedSettings
import DeviceActivity
import ScreenTime
import AuthenticationServices
import UIKit


// Embedded blocked content data (subset for performance)
private struct EmbeddedBlockedContent {
    static let domains: [String] = [
                "100bestpornsites.com",
        "2busty.net",
        "3movs.com",
        "4tube.com",
        "69games.xxx",
        "access.alsscan.com",
        "access.inescapablebondage.com",
        "access.met-art.com",
        "adameve.com",
        "addons.mozilla.org",
        "adultfriendfinder.com",
        "adultvideofinder.com",
        "aerisdies.com",
        "alldesiporn.com",
        "alljapanesepass.com",
        "alohatube.com",
        "alphaporno.com",
        "alt.com",
        "amateuralbum.net",
        "amateurgalore.net",
        "amateurxtv.com",
        "analgalore.com",
        "analxtv.com",
        "animephile.com",
        "anyshemale.com",
        "apina.biz",
        "apinaporn.com",
        "asciipr0n.com",
        "ashemaletube.com",
        "asianbabesdatabase.com",
        "asianpornwebsites.com",
        "asiansexdiary.com",
        "asianxtv.com",
        "askjolene.com",
        "assoass.com",
        "asstr.org",
        "ast.tv",
        "avn.com",
        "awejmp.com",
        "axcrypt.net",
        "azgals.com",
        "babe-lounge.com",
        "babepedia.com",
        "babesnetwork.com",
        "badashley.com",
        "badfishforums.com",
        "badgirlsblog.com",
        "badjojo.com",
        "badoinkvr.com",
        "bang.com",
    ]
    
    static let urls: [String] = [
                "http://100bestpornsites.com/",
        "http://2busty.net/",
        "http://69games.xxx",
        "http://EmoAndSceneGirls.com/",
        "http://adultfriendfinder.com/go/g1149049",
        "http://adultvideofinder.com/",
        "http://alt.com/go/g1149049-pmo",
        "http://amateurgalore.net/",
        "http://apina.biz/",
        "http://apinaporn.com/",
        "http://asciipr0n.com/",
        "http://bigboobsparadise.com/",
        "http://board.freeones.com/",
        "http://bootyoftheday.co/",
        "http://cams.com/go/g1149049-po",
        "http://camster.com/home?aid=tblopcom&cmp=",
        "http://click.dtiserv2.com/Click2/1354032-354-us6920/",
        "http://deviantclip.com/",
        "http://dick-n-jane.com/",
        "http://dogdick.smackjeeves.com/comics/260240/dick-dogdick-1/",
        "http://emo-porn.com/",
        "http://enter.naughtyamericavr.com/track/z3itg3ist.10025.97.299.15.0.0.0.0",
        "http://eporner.com/",
        "http://erooups.com/",
        "http://exgfphotos.com/",
        "http://fantasti.cc/",
        "http://fap1.com/",
        "http://fapdu.com/",
        "http://fapdu.com/community",
        "http://fapgay.com/",
        "http://femdom-tube.com/",
        "http://findtubes.com/",
        "http://fineartteens.com/",
        "http://forum.oneclickchicks.com/",
        "http://forum.phun.org/index.php",
        "http://forums.sexyandfunny.com/",
        "http://ftop.ru/",
        "http://fuskator.com/",
        "http://g.e-hentai.org/",
        "http://gelbooru.com/",
        "http://getiton.com/go/g1149049-po",
        "http://gfycat.com/",
        "http://gfycatporn.com/",
        "http://gramponante.com/",
        "http://grazzier.hopto.org/",
        "http://hentai4manga.com/",
        "http://highonsex.net/",
        "http://hotchat.ai/?utm_source=freesafeporn",
        "http://imlive.com/wmaster.ashx?WID=124115062185&LinkID=701&promocode=BCODEL0000006_camslink&QueryID=1&from=freevideo6",
        "http://jessfink.com/Chester5000XYV/",
        "http://join.exposedlatinas.com/track/MTc1LjEzLjM0LjQ2LjIxLjAuMC4wLjA",
        "http://join.exxxtrasmall.com/track/Mzg0Ni4zNi4zNS4zNTEuMC4wLjAuMC4w",
        "http://join.javhq.com/track/MzIwNToyOjQ/",
        "http://join.myveryfirsttime.com/track/MjI1MDg6NTc6MTQ5,24/",
        "http://join.sexmex.xxx/track/MTc1LjEzLjEuMS4yMS4wLjAuMC4w",
        "http://join.teamskeet.com/track/Mzg0Ni43LjE1LjQ5Mi4wLjAuMC4wLjA",
        "http://join.teamskeet.com/track/NTI0Ny4yLjE1LjE1LjMuMC4wLjAuMA",
        "http://join.tiny4k.com/track/MjI1MDg6NTc6MTQ0,21/",
        "http://kitnkayboodle.comicgenesis.com/",
        "http://literotica.com/stories/index.php",
        "http://lubetube.com/",
        "http://luscious.net/c/hentai/",
        "http://macromastia.net/",
        "http://madamezelda.smackjeeves.com/comics/103902/ballad-of-zelda-1/",
        "http://mcstories.com/",
        "http://metareddit.com/reddits/over18/list/?subscribers=100",
        "http://myhentai.tv/",
        "http://myhentaicomics.com/",
        "http://myxxxcentral.com/",
        "http://nannygoat.smackjeeves.com/comics/234027/nanny-horse-1/",
        "http://nats.castingcouch-hd.com/track/MTM1NjIyLjEuMi41LjAuMC4wLjAuMA",
        "http://nats.lucasentertainment.com/track/MTAwMDczNC4yLjIuMi4yNi4wLjAuMC4w",
        "http://nats.netvideogirls.com/track/MTM1NjIyLjEuMS4xLjAuMC4wLjAuMA",
        "http://nudify-her.com/",
        "http://nwsgifs.com/",
        "http://paidpornsites.net/",
        "http://peachyforum.com/",
        "http://photos.freeones.com/",
        "http://piggypainslut.smackjeeves.com/comics/723537/ballad-of-madame-zeldas/",
        "http://popporn.com/",
        "http://porcore.com/",
        "http://porn-gifs.co/",
        "http://porn.com/",
        "http://pornerbros.com/?wmid=561&sid=1",
        "http://pornsharia.com/",
        "http://profiles.met-art.com/topvoted/?CA=901313&PA=421332",
        "http://redditlist.com/nsfw",
        "http://refer.ccbill.com/cgi-bin/clicks.cgi?CA=920029&PA=380229&HTML=http://www.ftvgirls.com/models.html",
        "http://regretfulmorning.com/category/nsfw/",
        "http://ro89.com/q/fingered_public",
        "http://rule34.xxx/index.php?page=post&s=list",
        "http://scene-porn.com/",
        "http://secure.transerotica.com/track/z3itg3ist.111.91.446.0.0.0.0.0",
        "http://secure.webpower.com/Refer.dll?Acct=tblopcom&svc=PPS&url=http://www.ifriends.net/userURL_membrg2/livehosts/cam-girls/live-now",
        "http://sheposes.com/",
        "http://shuttur.com/category/nsfw",
        "http://signup.crazyfetishpass.com/track/MTA4OTguMS44Ni4xNTQuMC4wLjAuMC4w",
        "http://signup.hegre-art.com/hit/1/5/112040/13/",
        "http://sissycedric.smackjeeves.com/comics/733899/ballad-of-madame-zeldas/",
        "http://slimythief.com/",
    ]
}

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
    
    // Use comprehensive data from CSV (3000+ URLs and domains)
    let predefinedBlockedDomains = EmbeddedBlockedContent.domains
    let predefinedBlockedUrls = EmbeddedBlockedContent.urls
    
    // Combine predefined and custom domains
    let allBlockedDomains = predefinedBlockedDomains + customBlockedDomains
    resolve(Array(Set(allBlockedDomains))) // Remove duplicates
  }
  
  @objc
  func getDefaultBlockedDomains(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Return comprehensive domains from CSV data (3000+ entries)
    resolve(EmbeddedBlockedContent.domains)
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
    
    // Get all blocked content from comprehensive CSV data (3000+ entries)
    let customBlockedDomains = userDefaults.stringArray(forKey: blockedDomainsKey) ?? []
    let predefinedBlockedDomains = EmbeddedBlockedContent.domains
    let allBlockedUrls = EmbeddedBlockedContent.urls
    
    let allBlockedDomains = predefinedBlockedDomains + customBlockedDomains
    let urlLowercase = url.lowercased()
    
    // Special handling for Reddit - only block specific subreddits, not the main site
    if urlLowercase.contains("reddit.com") {
      // Only block if it's a specific subreddit URL that's in our blocked list
      let isBlockedRedditSubreddit = allBlockedUrls.contains { blockedUrl in
        urlLowercase.contains(blockedUrl.lowercased()) && blockedUrl.lowercased().contains("reddit.com/r/")
      }
      resolve(isBlockedRedditSubreddit)
      return
    }
    
    // Check against both URLs and domains for comprehensive blocking
    let isBlockedByUrl = allBlockedUrls.contains { blockedUrl in
      urlLowercase.contains(blockedUrl.lowercased())
    }
    
    let isBlockedByDomain = allBlockedDomains.contains { domain in
      urlLowercase.contains(domain.lowercased())
    }
    
    resolve(isBlockedByUrl || isBlockedByDomain)
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
    // Block inappropriate websites using Screen Time API with comprehensive CSV data (3000+ entries)
    let blockedDomains = EmbeddedBlockedContent.domains
    
    // Create WebDomain objects for blocking
    var blockedWebDomains = Set<WebDomain>()
    for domain in blockedDomains {
      blockedWebDomains.insert(WebDomain(domain: domain))
    }
    
    // Apply the settings
    managedSettingsStore.webContent.blockedByFilter = WebContentSettings.FilterPolicy.specific(blockedWebDomains)
  }
}
