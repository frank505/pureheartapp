import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  
  // Store the initial URL for React Native to process later
  static var initialURL: URL?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    if FirebaseApp.app() == nil {
      FirebaseApp.configure()
    }

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "PureHeart",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // // Handle Universal Links
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    // Handle Universal Links by checking the user activity type
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
       let url = userActivity.webpageURL {
      print("Universal Link received: \(url)")
      
      // Store the URL if the app is just launching
      if AppDelegate.initialURL == nil {
        AppDelegate.initialURL = url
      }
      
      // Post a notification that React Native's Linking module will receive
      NotificationCenter.default.post(
        name: Notification.Name("RCTOpenURLNotification"),
        object: nil,
        userInfo: ["url": url.absoluteString]
      )
      
      return true
    }
    return false
  }
  
  // Handle URL schemes (deep links)
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    print("URL scheme received: \(url)")
    
    // Store the URL if the app is just launching
    if AppDelegate.initialURL == nil {
      AppDelegate.initialURL = url
    }
    
    // Post a notification that React Native's Linking module will receive
    NotificationCenter.default.post(
      name: Notification.Name("RCTOpenURLNotification"),
      object: nil,
      userInfo: ["url": url.absoluteString]
    )
    
    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

// Extension to provide initial URL to React Native
@objc extension AppDelegate {
  func getInitialURL() -> URL? {
    return AppDelegate.initialURL
  }
}
