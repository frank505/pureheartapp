import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import screenshotService from '../services/ScreenshotService';
import contentFilterService from '../services/ContentFilterService';
import { useTabManager } from '../hooks/useTabManager';
import TabBar from '../components/TabBarEnhanced';
import { BrowserTab } from '../types/TabTypes';

interface WebViewBrowserScreenProps {
  navigation: any;
}

const TabbedWebViewBrowserScreen: React.FC<WebViewBrowserScreenProps> = ({ navigation }) => {
  // Tab management
  const tabManager = useTabManager();
  const activeTab = tabManager.getActiveTab();
  
  // URL input state (separate from active tab URL for input handling)
  const [urlInput, setUrlInput] = useState(activeTab?.url || 'https://www.google.com');
  
  // WebView reference for the currently active tab
  const webViewRef = useRef<WebView>(null);
  const screenshotIntervalRef = useRef<number | null>(null);
  
  // Store WebView states to preserve scroll position and form data
  const webViewStates = useRef<{ [key: string]: any }>({});

  // Update URL input when active tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.id, activeTab?.url]);

  useEffect(() => {
    // Initialize screenshot service
    screenshotService.initialize("https://api.thepurityapp.com/api/screenshots/scrutinized");
    
    // Start screenshot capture every 30 seconds with delay
    setTimeout(() => {
      startScreenshotCapture();
    }, 2000);
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      screenshotService.handleAppStateChange(nextAppState);
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Cleanup screenshot interval
      if (screenshotIntervalRef.current) {
        clearInterval(screenshotIntervalRef.current);
      }
      
      // Cleanup service
      screenshotService.cleanup();
      subscription?.remove();
    };
  }, []);

  // Effect to set WebView reference when it becomes available or active tab changes
  useEffect(() => {
    const setWebViewReference = async () => {
      if (webViewRef.current && activeTab) {
        try {
          await screenshotService.setWebViewFromRef(webViewRef);
          console.log('WebView reference set for tab:', activeTab.id);
          
          // Test screenshot capture to ensure it's working
          try {
            await screenshotService.captureScreenshot();
            console.log('Test screenshot captured successfully');
          } catch (testError) {
            console.warn('Test screenshot failed, will retry later:', testError);
          }
        } catch (error) {
          console.error('Failed to set WebView reference:', error);
        }
      }
    };

    // Use multiple timeouts to try setting the WebView reference
    const timers = [
      setTimeout(setWebViewReference, 500),
      setTimeout(setWebViewReference, 1000),
      setTimeout(setWebViewReference, 2000),
    ];
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [activeTab?.id, activeTab?.currentUrl]);

  const checkUrlBlocking = async (url: string): Promise<boolean> => {
    if (!activeTab) return false;
    
    try {
      const shouldBlock = await contentFilterService.shouldBlockUrl(url);
      if (shouldBlock) {
        tabManager.updateTabBlocked(activeTab.id, true, url);
        Alert.alert(
          'Content Blocked',
          `This website is blocked by your content filter.\n\nDomain: ${contentFilterService.extractDomain(url)}`,
          [
            {
              text: 'Go Back',
              onPress: () => {
                if (webViewRef.current && activeTab.canGoBack) {
                  webViewRef.current.goBack();
                } else {
                  handleHome();
                }
                tabManager.updateTabBlocked(activeTab.id, false);
              }
            }
          ]
        );
      } else {
        tabManager.updateTabBlocked(activeTab.id, false);
      }
      return shouldBlock;
    } catch (error) {
      console.error('Error checking URL blocking:', error);
      return false;
    }
  };

  const startScreenshotCapture = async () => {
    if (screenshotIntervalRef.current) {
      clearInterval(screenshotIntervalRef.current);
    }

    const isConnectionWorking = await screenshotService.testWebViewConnection();
    if (!isConnectionWorking) {
      console.log('WebView connection test failed, trying auto-detection...');
      try {
        await screenshotService.forceWebViewAutoDetection();
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        
        const retryConnection = await screenshotService.testWebViewConnection();
        if (retryConnection) {
          console.log('WebView connection restored after auto-detection');
        } else {
          console.warn('WebView connection still failing after auto-detection');
          return;
        }
      } catch (error) {
        console.error('Auto-detection failed:', error);
        return;
      }
    }

    // Start regular screenshot capture
    screenshotIntervalRef.current = screenshotService.startAutomaticCapture(30000);
    console.log('Started automatic screenshot capture every 30 seconds');
  };

  const handleGoToUrl = useCallback(async () => {
    if (!activeTab || !urlInput.trim()) return;
    
    let targetUrl = urlInput.trim();
    
    // Add protocol if missing
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      // Check if it looks like a domain
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        // Treat as search query
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }
    
    // Check if URL should be blocked
    const shouldBlock = await checkUrlBlocking(targetUrl);
    if (shouldBlock) return;
    
    // Update tab with new URL
    tabManager.updateTabUrl(activeTab.id, targetUrl);
    
    // Navigate WebView
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = "${targetUrl}"`);
    }
  }, [activeTab, urlInput, tabManager]);

  const handleNavigationStateChange = useCallback(async (navState: WebViewNavigation) => {
    if (!activeTab) return;
    
    const { url: newUrl, canGoBack, canGoForward, loading, title } = navState;
    
    // Check if URL should be blocked (async check)
    if (!loading) { // Only check when navigation is complete
      await checkUrlBlocking(newUrl);
    }
    
    // Update tab state with more information
    tabManager.updateTab(activeTab.id, {
      url: urlInput,
      currentUrl: newUrl,
      title: title || tabManager.getTab(activeTab.id)?.title || 'Loading...',
      canGoBack,
      canGoForward,
      loading,
    });
    
    // Update URL input to match current URL
    setUrlInput(newUrl);
    
    // Store additional state information for this tab
    webViewStates.current[activeTab.id] = {
      url: newUrl,
      canGoBack,
      canGoForward,
      title: title || 'Loading...',
      timestamp: Date.now(),
    };
  }, [activeTab, urlInput, tabManager]);

  const handleShouldStartLoadWithRequest = useCallback((request: any): boolean => {
    if (!activeTab) return false;
    
    // For now, allow the request and check blocking in navigation state change
    // This is because onShouldStartLoadWithRequest must be synchronous
    return true;
  }, [activeTab]);

  const handleLoadProgress = useCallback((event: any) => {
    if (!activeTab) return;
    
    const progress = event.nativeEvent.progress;
    tabManager.updateTabLoading(activeTab.id, true, progress);
  }, [activeTab, tabManager]);

  const handleWebViewLoadEnd = useCallback(() => {
    if (!activeTab) return;
    
    tabManager.updateTabLoading(activeTab.id, false, 1);
    
    // Re-establish screenshot service connection after navigation
    setTimeout(async () => {
      if (webViewRef.current) {
        try {
          await screenshotService.setWebViewFromRef(webViewRef);
        } catch (error) {
          console.warn('Failed to re-establish WebView connection after load:', error);
        }
      }
    }, 1000);
  }, [activeTab, tabManager]);

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    if (webViewRef.current && activeTab?.canGoBack) {
      webViewRef.current.goBack();
    }
  }, [activeTab]);

  const handleGoForward = useCallback(() => {
    if (webViewRef.current && activeTab?.canGoForward) {
      webViewRef.current.goForward();
    }
  }, [activeTab]);

  const handleRefresh = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  const handleHome = useCallback(() => {
    if (activeTab) {
      const homeUrl = 'https://www.google.com';
      tabManager.updateTabUrl(activeTab.id, homeUrl);
      setUrlInput(homeUrl);
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`window.location.href = "${homeUrl}"`);
      }
    }
  }, [activeTab, tabManager]);

  // Tab handlers
  const handleTabPress = useCallback((tabId: string) => {
    // Add a small delay to prevent rapid tab switching issues
    setTimeout(() => {
      tabManager.switchTab(tabId);
    }, 50);
  }, [tabManager]);

  const handleTabClose = useCallback((tabId: string) => {
    tabManager.closeTab(tabId);
  }, [tabManager]);

  const handleNewTab = useCallback(() => {
    tabManager.createTab();
  }, [tabManager]);

  const handleDuplicateTab = useCallback((tabId: string) => {
    tabManager.duplicateTab(tabId);
  }, [tabManager]);

  const handleCloseOtherTabs = useCallback((exceptId: string) => {
    const tabsToClose = tabManager.tabs.filter(tab => tab.id !== exceptId);
    tabsToClose.forEach(tab => tabManager.closeTab(tab.id));
  }, [tabManager]);

  const handleRefreshTab = useCallback((tabId: string) => {
    if (tabId === activeTab?.id && webViewRef.current) {
      webViewRef.current.reload();
    } else {
      // For inactive tabs, we can mark them for refresh when switched to
      const tab = tabManager.getTab(tabId);
      if (tab) {
        tabManager.updateTabLoading(tabId, true);
      }
    }
  }, [activeTab, tabManager]);

  if (!activeTab) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing browser...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safe Browser</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleHome}
        >
          <Icon name="home" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <TabBar
        tabs={tabManager.tabs}
        activeTabId={tabManager.activeTabId}
        onTabPress={handleTabPress}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
        onDuplicateTab={handleDuplicateTab}
        onCloseOtherTabs={handleCloseOtherTabs}
        onRefreshTab={handleRefreshTab}
        maxTabs={tabManager.maxTabs}
      />

      {/* URL Bar */}
      <View style={styles.urlBar}>
        <TextInput
          style={styles.urlInput}
          value={urlInput}
          onChangeText={setUrlInput}
          onSubmitEditing={handleGoToUrl}
          placeholder="Enter URL or search..."
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
        />
        <TouchableOpacity style={styles.goButton} onPress={handleGoToUrl}>
          <Icon name="search" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {activeTab.loading && activeTab.progress < 1 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${activeTab.progress * 100}%` }]} />
        </View>
      )}

      {/* Navigation Controls */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, !activeTab.canGoBack && styles.disabledButton]}
          onPress={handleGoBack}
          disabled={!activeTab.canGoBack}
        >
          <Icon name="arrow-back" size={24} color={activeTab.canGoBack ? "#007AFF" : "#ccc"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, !activeTab.canGoForward && styles.disabledButton]}
          onPress={handleGoForward}
          disabled={!activeTab.canGoForward}
        >
          <Icon name="arrow-forward" size={24} color={activeTab.canGoForward ? "#007AFF" : "#ccc"} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleRefresh}>
          <Icon name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.urlDisplay}>
          <Icon name="lock" size={16} color="#4CAF50" />
          <Text style={styles.urlText} numberOfLines={1}>
            {activeTab.currentUrl}
          </Text>
        </View>
      </View>

      {/* WebView - Single WebView that loads content for active tab */}
      {activeTab?.isBlocked ? (
        // Blocked content overlay
        <View style={styles.blockedOverlay}>
          <View style={styles.blockedContent}>
            <Icon name="block" size={48} color="#FF6B6B" />
            <Text style={styles.blockedTitle}>Content Blocked</Text>
            <Text style={styles.blockedMessage}>
              This website is blocked by your content filter.
            </Text>
            <Text style={styles.blockedUrl}>{activeTab.blockedUrl}</Text>
            <TouchableOpacity
              style={styles.blockedButton}
              onPress={() => {
                tabManager.updateTabBlocked(activeTab.id, false);
                handleHome();
              }}
            >
              <Text style={styles.blockedButtonText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : activeTab ? (
        <WebView
          key={`webview-${activeTab.id}-${activeTab.currentUrl}`} // Force remount when tab changes
          ref={webViewRef}
          source={{ uri: activeTab.currentUrl }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onLoadProgress={handleLoadProgress}
          onLoadStart={() => tabManager.updateTabLoading(activeTab.id, true)}
          onLoadEnd={handleWebViewLoadEnd}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                {activeTab.loading ? 'Loading page...' : 'Restoring tab...'}
              </Text>
            </View>
          )}
          userAgent={Platform.select({
            ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            android: 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          })}
          // Disable caching to allow fresh loads when switching tabs
          cacheEnabled={false}
          incognito={false}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  urlInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f1f3f4',
    fontSize: 16,
    color: '#333',
  },
  goButton: {
    marginLeft: 8,
    padding: 8,
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#e0e0e0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
    marginRight: 16,
  },
  disabledButton: {
    opacity: 0.3,
  },
  urlDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  urlText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  blockedOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blockedContent: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 24,
    maxWidth: 300,
  },
  blockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 12,
  },
  blockedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  blockedUrl: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  blockedButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  blockedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TabbedWebViewBrowserScreen;
