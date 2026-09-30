import UIKit
import Firebase
import FirebaseMessaging
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications

@main
class AppDelegate: UIResponder,
UIApplicationDelegate,
UNUserNotificationCenterDelegate,
MessagingDelegate {

  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  // ✅ FOREGROUND NOTIFICATION
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .sound, .badge])
  }

  // ✅ APP START
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    // ✅ FIREBASE INIT
    FirebaseApp.configure()

    // ✅ NOTIFICATION DELEGATE
    UNUserNotificationCenter.current().delegate = self

    // ✅ FCM DELEGATE
    Messaging.messaging().delegate = self

    // ✅ REGISTER REMOTE NOTIFICATIONS
    application.registerForRemoteNotifications()

    let delegate = ReactNativeDelegate()

    let factory = RCTReactNativeFactory(delegate: delegate)

    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "TheScriptCraft",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // ✅ APNS TOKEN SUCCESS
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {

    Messaging.messaging().apnsToken = deviceToken

    print("✅ APNS TOKEN:", deviceToken)
  }

  // ✅ APNS TOKEN FAILED
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {

    print("❌ APNS REGISTER ERROR:", error)
  }

  // ✅ FCM TOKEN
  func messaging(
    _ messaging: Messaging,
    didReceiveRegistrationToken fcmToken: String?
  ) {

    print("🔥 FCM TOKEN:", fcmToken ?? "")
  }

  // ✅ CUSTOM URL SCHEME
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {

    return RCTLinkingManager.application(
      app,
      open: url,
      options: options
    )
  }

  // ✅ UNIVERSAL LINKS
  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {

    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
}

// ✅ REACT NATIVE DELEGATE
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