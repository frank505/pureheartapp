import Foundation
import React
import FamilyControls
import ManagedSettings
import SwiftUI

@objc(AppBlockingManager)
class AppBlockingManager: NSObject {
  
  private let userDefaults = UserDefaults(suiteName: "group.com.100klabs.pureheart.contentfilter")
  private let blockedAppsKey = "blockedApps"
  private let managedSettingsStore = ManagedSettingsStore()
  
  // Store the current selection globally
  @available(iOS 16.0, *)
  private static var currentSelection = FamilyActivitySelection()
  
  // Connection monitoring
  private var connectionMonitor: Timer?
  
  override init() {
    super.init()
    setupConnectionMonitoring()
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  // MARK: - Connection Monitoring
  
  private func setupConnectionMonitoring() {
    // Monitor for FamilyControls plugin connection issues
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleConnectionIssue),
      name: Notification.Name("FamilyControlsConnectionInterrupted"),
      object: nil
    )
    
    // Listen for system memory warnings that can affect the picker
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleMemoryWarning),
      name: UIApplication.didReceiveMemoryWarningNotification,
      object: nil
    )
  }
  
  @objc private func handleConnectionIssue() {
    print("AppBlockingManager: FamilyControls connection issue detected")
    // The UI will handle this gracefully through our wrapper
  }
  
  @objc private func handleMemoryWarning() {
    print("AppBlockingManager: Memory warning received - may affect picker stability")
  }
  
  deinit {
    NotificationCenter.default.removeObserver(self)
    connectionMonitor?.invalidate()
  }
  
  @objc
  func showFamilyActivityPicker(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    print("AppBlockingManager: showFamilyActivityPicker called")
    
    if #available(iOS 16.0, *) {
      // Check if we have Screen Time authorization
      let authorizationStatus = AuthorizationCenter.shared.authorizationStatus
      print("AppBlockingManager: Authorization status: \(authorizationStatus.rawValue)")
      
      if authorizationStatus != .approved {
        // Request authorization first
        Task {
          do {
            print("AppBlockingManager: Requesting authorization...")
            try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            print("AppBlockingManager: Authorization granted, presenting picker")
            DispatchQueue.main.async { [weak self] in
              self?.presentFamilyActivityPicker(resolve: resolve, reject: reject)
            }
          } catch {
            print("AppBlockingManager: Authorization failed: \(error)")
            DispatchQueue.main.async {
              reject("authorization_error", "Failed to get Screen Time authorization: \(error.localizedDescription)", error)
            }
          }
        }
      } else {
        // Already authorized, show picker
        print("AppBlockingManager: Already authorized, presenting picker")
        DispatchQueue.main.async { [weak self] in
          self?.presentFamilyActivityPicker(resolve: resolve, reject: reject)
        }
      }
    } else {
      print("AppBlockingManager: iOS version not supported")
      reject("version_error", "FamilyActivityPicker requires iOS 16.0 or later", nil)
    }
  }
  
  @available(iOS 16.0, *)
  private func presentFamilyActivityPicker(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    print("AppBlockingManager: presentFamilyActivityPicker called")
    
    // Get currently blocked apps to pre-select them
    let currentlyBlockedApps = getBlockedAppTokens()
    print("AppBlockingManager: Current blocked apps count: \(currentlyBlockedApps.applicationTokens.count)")
    
    // Store references for dismissal
    var hostingController: UIHostingController<FamilyActivityPickerView>!
    
    // Create the FamilyActivityPicker view with enhanced error handling
    let pickerView = FamilyActivityPickerView(
      initialSelection: currentlyBlockedApps,
      onSave: { selection in
        print("AppBlockingManager: Save button pressed, selected apps: \(selection.applicationTokens.count)")
        
        // Save the selection and apply blocking
        self.saveBlockedApps(selection)
        self.applyAppBlocking()
        
        // Convert selection to a serializable format
        let appData = self.convertSelectionToAppData(selection)
        print("AppBlockingManager: App data to return: \(appData)")
        
        // Dismiss the modal first, then resolve
        DispatchQueue.main.async {
          print("AppBlockingManager: Dismissing modal...")
          hostingController.dismiss(animated: true) {
            print("AppBlockingManager: Modal dismissed, resolving with data")
            resolve(appData)
          }
        }
      },
      onCancel: {
        print("AppBlockingManager: Cancel button pressed")
        
        // Dismiss the modal first, then resolve with nil
        DispatchQueue.main.async {
          print("AppBlockingManager: Dismissing modal (cancel)...")
          hostingController.dismiss(animated: true) {
            print("AppBlockingManager: Modal dismissed (cancel), resolving with nil")
            resolve(nil)
          }
        }
      }
    )
    
    // Present the picker in a UIHostingController with enhanced configuration
    hostingController = UIHostingController(rootView: pickerView)
    hostingController.modalPresentationStyle = .pageSheet
    
    // Configure the presentation controller for better stability
    if let presentationController = hostingController.presentationController as? UISheetPresentationController {
      presentationController.detents = [.large()]
      presentationController.prefersGrabberVisible = true
      presentationController.preferredCornerRadius = 16
    }
    
    // Find the root view controller with better error handling
    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let window = windowScene.windows.first,
          let rootViewController = window.rootViewController else {
      print("AppBlockingManager: Error - Cannot find root view controller")
      reject("presentation_error", "Cannot present picker", nil)
      return
    }
    
    print("AppBlockingManager: Presenting modal...")
    rootViewController.present(hostingController, animated: true) {
      print("AppBlockingManager: Modal presented successfully")
    }
  }
  
  @objc
  func getBlockedApps(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      let appData = getStoredAppData()
      resolve(appData)
    } else {
      reject("version_error", "App blocking requires iOS 16.0 or later", nil)
    }
  }
  
  @objc
  func clearAllBlockedApps(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      // Clear the global selection
      AppBlockingManager.currentSelection = FamilyActivitySelection()
      
      // Clear from UserDefaults
      userDefaults?.removeObject(forKey: "hasBlockedApps")
      userDefaults?.removeObject(forKey: "hasBlockedCategories")
      userDefaults?.removeObject(forKey: "blockedAppsCount")
      userDefaults?.removeObject(forKey: "blockedCategoriesCount")
      
      // Clear all managed settings (this will clear all restrictions)
      managedSettingsStore.clearAllSettings()
      
      resolve(true)
    } else {
      reject("version_error", "App blocking requires iOS 16.0 or later", nil)
    }
  }
  
  // MARK: - Private Helper Methods
  
  @available(iOS 16.0, *)
  private func getBlockedAppTokens() -> FamilyActivitySelection {
    return AppBlockingManager.currentSelection
  }
  
  @available(iOS 16.0, *)
  private func saveBlockedApps(_ selection: FamilyActivitySelection) {
    guard let userDefaults = self.userDefaults else { return }
    
    // Store the selection globally
    AppBlockingManager.currentSelection = selection
    
    // Store counts in UserDefaults
    let hasApps = !selection.applicationTokens.isEmpty
    let hasCategories = !selection.categoryTokens.isEmpty
    
    userDefaults.set(hasApps, forKey: "hasBlockedApps")
    userDefaults.set(hasCategories, forKey: "hasBlockedCategories")
    userDefaults.set(selection.applicationTokens.count, forKey: "blockedAppsCount")
    userDefaults.set(selection.categoryTokens.count, forKey: "blockedCategoriesCount")
  }
  
  @available(iOS 16.0, *)
  private func applyAppBlocking() {
    let selection = getBlockedAppTokens()
    
    // Convert ApplicationTokens to Applications for the ManagedSettings API
    let blockedApps = Set(selection.applicationTokens.compactMap { token in
      Application(token: token)
    })
    
    // Apply application restrictions
    managedSettingsStore.application.blockedApplications = blockedApps
    
    // For categories, we'll use a simpler approach by just storing the selection
    // The actual category blocking will be handled by the system when apps are selected
    // Note: Category blocking API varies between iOS versions - focusing on app blocking for now
    if !selection.categoryTokens.isEmpty {
      print("Category tokens selected: \(selection.categoryTokens.count)")
    }
  }
  
  @available(iOS 16.0, *)
  private func convertSelectionToAppData(_ selection: FamilyActivitySelection) -> [String: Any] {
    let appCount = selection.applicationTokens.count
    let categoryCount = selection.categoryTokens.count
    
    return [
      "applicationCount": appCount,
      "categoryCount": categoryCount,
      "totalCount": appCount + categoryCount,
      "hasSelection": appCount > 0 || categoryCount > 0
    ]
  }
  
  @available(iOS 16.0, *)
  private func getStoredAppData() -> [String: Any] {
    guard let userDefaults = self.userDefaults else {
      return [
        "applicationCount": 0,
        "categoryCount": 0,
        "totalCount": 0,
        "hasSelection": false
      ]
    }
    
    let appCount = userDefaults.integer(forKey: "blockedAppsCount")
    let categoryCount = userDefaults.integer(forKey: "blockedCategoriesCount")
    
    return [
      "applicationCount": appCount,
      "categoryCount": categoryCount,
      "totalCount": appCount + categoryCount,
      "hasSelection": appCount > 0 || categoryCount > 0
    ]
  }
}

// MARK: - SwiftUI Views

@available(iOS 16.0, *)
struct FamilyActivityPickerView: View {
  @State private var selection = FamilyActivitySelection()
  @State private var isProcessing = false
  @State private var showingConnectionError = false
  @State private var connectionErrorCount = 0
  @State private var isPickerReady = false
  
  let initialSelection: FamilyActivitySelection
  let onSave: (FamilyActivitySelection) -> Void
  let onCancel: () -> Void
  
  init(initialSelection: FamilyActivitySelection, onSave: @escaping (FamilyActivitySelection) -> Void, onCancel: @escaping () -> Void) {
    self.initialSelection = initialSelection
    self.onSave = onSave
    self.onCancel = onCancel
    self._selection = State(initialValue: initialSelection)
  }
  
  private func handleCancel() {
    print("FamilyActivityPickerView: Cancel button tapped")
    guard !isProcessing else { 
      print("FamilyActivityPickerView: Already processing, ignoring cancel")
      return 
    }
    isProcessing = true
    
    // Add haptic feedback
    let impactFeedback = UIImpactFeedbackGenerator(style: .light)
    impactFeedback.impactOccurred()
    
    print("FamilyActivityPickerView: Calling onCancel")
    onCancel()
  }
  
  private func handleSave() {
    print("FamilyActivityPickerView: Save button tapped")
    guard !isProcessing else { 
      print("FamilyActivityPickerView: Already processing, ignoring save")
      return 
    }
    isProcessing = true
    
    // Add haptic feedback
    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
    impactFeedback.impactOccurred()
    
    print("FamilyActivityPickerView: Calling onSave with \(selection.applicationTokens.count) apps")
    onSave(selection)
  }
  
  var body: some View {
    NavigationView {
      VStack {
        Text("Select Apps to Block")
          .font(.title2)
          .fontWeight(.semibold)
          .padding(.top, 20)
        
        Text("Choose apps and categories that you want to block. Selected items will be restricted during your accountability sessions.")
          .font(.subheadline)
          .foregroundColor(.secondary)
          .multilineTextAlignment(.center)
          .padding(.horizontal, 20)
          .padding(.bottom, 20)
        
        // Main picker content with error handling
        ZStack {
          if isPickerReady {
            // Wrapped FamilyActivityPicker with connection monitoring
            FamilyActivityPickerWrapper(
              selection: $selection,
              onConnectionError: {
                print("FamilyActivityPickerView: Connection error detected")
                handleConnectionError()
              }
            )
            .padding(.horizontal, 20)
          } else {
            // Loading state
            VStack(spacing: 16) {
              ProgressView()
                .scaleEffect(1.2)
              Text("Loading apps...")
                .font(.subheadline)
                .foregroundColor(.secondary)
            }
            .frame(maxHeight: .infinity)
          }
        }
        
        if showingConnectionError {
          VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
              .foregroundColor(.orange)
              .font(.title2)
            
            Text("Connection Issue")
              .font(.headline)
              .fontWeight(.semibold)
            
            Text("There was a temporary connection issue. Your selections have been preserved.")
              .font(.subheadline)
              .foregroundColor(.secondary)
              .multilineTextAlignment(.center)
            
            Button("Retry") {
              retryConnection()
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 8)
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(8)
          }
          .padding()
          .background(Color(.systemGray6))
          .cornerRadius(12)
          .padding(.horizontal, 20)
        }
        
        Spacer()
      }
      .onAppear {
        // Delay picker initialization to allow proper setup
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
          withAnimation(.easeInOut(duration: 0.3)) {
            isPickerReady = true
          }
        }
      }
      .navigationBarTitleDisplayMode(.inline)
      .navigationBarBackButtonHidden(true)
      .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
          Button("Cancel") {
            handleCancel()
          }
          .disabled(isProcessing)
        }
        
        ToolbarItem(placement: .navigationBarTrailing) {
          Button("Save") {
            handleSave()
          }
          .fontWeight(.semibold)
          .disabled(isProcessing)
        }
      }
    }
  }
  
  private func handleConnectionError() {
    connectionErrorCount += 1
    print("FamilyActivityPickerView: Connection error #\(connectionErrorCount)")
    
    // Show error state temporarily
    withAnimation(.easeInOut(duration: 0.3)) {
      showingConnectionError = true
    }
    
    // Auto-retry after a short delay
    DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
      if showingConnectionError {
        retryConnection()
      }
    }
  }
  
  private func retryConnection() {
    print("FamilyActivityPickerView: Retrying connection")
    
    withAnimation(.easeInOut(duration: 0.3)) {
      showingConnectionError = false
      isPickerReady = false
    }
    
    // Re-initialize the picker after a brief delay
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
      withAnimation(.easeInOut(duration: 0.3)) {
        isPickerReady = true
      }
    }
  }
}

// Wrapper for FamilyActivityPicker with connection monitoring
@available(iOS 16.0, *)
struct FamilyActivityPickerWrapper: UIViewControllerRepresentable {
  @Binding var selection: FamilyActivitySelection
  let onConnectionError: () -> Void
  
  func makeUIViewController(context: Context) -> UIHostingController<AnyView> {
    let picker = FamilyActivityPicker(selection: $selection)
    let hostingController = UIHostingController(rootView: AnyView(picker))
    
    // Monitor for connection issues
    context.coordinator.setupConnectionMonitoring(hostingController: hostingController)
    
    return hostingController
  }
  
  func updateUIViewController(_ uiViewController: UIHostingController<AnyView>, context: Context) {
    // Update if needed
  }
  
  func makeCoordinator() -> Coordinator {
    Coordinator(self)
  }
  
  class Coordinator: NSObject {
    let parent: FamilyActivityPickerWrapper
    private var connectionMonitorTimer: Timer?
    
    init(_ parent: FamilyActivityPickerWrapper) {
      self.parent = parent
    }
    
    func setupConnectionMonitoring(hostingController: UIHostingController<AnyView>) {
      // Monitor for connection interruptions
      connectionMonitorTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
        // Check if the picker is still responsive
        DispatchQueue.main.async {
          if hostingController.view.subviews.isEmpty {
            print("FamilyActivityPickerWrapper: Detected connection issue")
            self?.parent.onConnectionError()
          }
        }
      }
    }
    
    deinit {
      connectionMonitorTimer?.invalidate()
    }
  }
}
