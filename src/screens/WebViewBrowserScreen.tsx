import React, { useState, useRef, useEffect } from 'react';
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

interface WebViewBrowserScreenProps {
  navigation: any;
}

const WebViewBrowserScreen: React.FC<WebViewBrowserScreenProps> = ({ navigation }) => {
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUrl, setBlockedUrl] = useState('');
  const webViewRef = useRef<WebView>(null);
  const screenshotIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize screenshot service
    screenshotService.initialize('https://api.thepurityapp.com/api/screenshots/scrutinized');
    
    // Start screenshot capture every 30 seconds with delay
    setTimeout(() => {
      startScreenshotCapture();
    }, 2000); // Wait 2 seconds before starting automatic capture
    
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

  // Effect to set WebView reference when it becomes available
  useEffect(() => {
    const setWebViewReference = async () => {
      if (webViewRef.current) {
        try {
          await screenshotService.setWebViewFromRef(webViewRef);
          console.log('WebView reference set on component mount');
          
          // Test screenshot capture to ensure it's working
          try {
            await screenshotService.captureScreenshot();
            console.log('Test screenshot captured successfully');
          } catch (testError) {
            console.warn('Test screenshot failed, will retry later:', testError);
          }
        } catch (error) {
          console.error('Failed to set WebView reference on mount:', error);
        }
      }
    };

    // Use multiple timeouts to try setting the WebView reference
    const timers = [
      setTimeout(setWebViewReference, 500),   // First attempt after 500ms
      setTimeout(setWebViewReference, 1000),  // Second attempt after 1s
      setTimeout(setWebViewReference, 2000),  // Third attempt after 2s
    ];
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [currentUrl]); // Re-run when URL changes

  const checkUrlBlocking = async (url: string): Promise<boolean> => {
    try {
      const shouldBlock = await contentFilterService.shouldBlockUrl(url);
      if (shouldBlock) {
        setIsBlocked(true);
        setBlockedUrl(url);
        Alert.alert(
          'Content Blocked',
          `This website is blocked by your content filter.\n\nDomain: ${contentFilterService.extractDomain(url)}`,
          [
            {
              text: 'Go Back',
              onPress: () => {
                if (webViewRef.current && canGoBack) {
                  webViewRef.current.goBack();
                } else {
                  setCurrentUrl('https://www.google.com');
                  setUrl('https://www.google.com');
                }
                setIsBlocked(false);
                setBlockedUrl('');
              }
            }
          ]
        );
      } else {
        setIsBlocked(false);
        setBlockedUrl('');
      }
      return shouldBlock;
    } catch (error) {
      console.error('Error checking URL blocking:', error);
      return false;
    }
  };

  const startScreenshotCapture = async () => {
    // Clear any existing interval
    if (screenshotIntervalRef.current) {
      clearInterval(screenshotIntervalRef.current);
    }

    // Test WebView connection first
    const isConnectionWorking = await screenshotService.testWebViewConnection();
    if (!isConnectionWorking) {
      console.log('WebView connection test failed, trying auto-detection...');
      try {
        await screenshotService.forceWebViewAutoDetection();
        // Wait a bit for auto-detection to complete
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        
        // Test again
        const retryConnection = await screenshotService.testWebViewConnection();
        if (retryConnection) {
          console.log('WebView connection restored after auto-detection');
        } else {
          console.warn('WebView connection still not working after auto-detection');
        }
      } catch (error) {
        console.error('Failed to auto-detect WebView:', error);
      }
    }

    // Start new interval for screenshot capture every 30 seconds
    screenshotIntervalRef.current = screenshotService.startAutomaticCapture(30000);
  };

  const captureScreenshot = async () => {
    try {
      await screenshotService.captureScreenshot();
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      
      // If WebView not found, try to set it again with multiple retry attempts
      if (error instanceof Error && error.message.includes('WebView not found')) {
        console.log('Attempting to re-establish WebView reference...');
        try {
          // First, try to set the reference again
          await screenshotService.setWebViewFromRef(webViewRef);
          
          // Wait a bit for the reference to be set
          await new Promise<void>(resolve => setTimeout(resolve, 200));
          
          // Retry screenshot
          await screenshotService.captureScreenshot();
          console.log('Screenshot captured successfully after re-establishing WebView reference');
        } catch (retryError) {
          console.error('Failed to capture screenshot after setting WebView reference:', retryError);
          
          // Last resort: try without setting reference (let native module auto-detect)
          try {
            console.log('Attempting final fallback screenshot...');
            await screenshotService.captureScreenshot();
            console.log('Fallback screenshot captured successfully');
          } catch (finalError) {
            console.error('All screenshot attempts failed:', finalError);
          }
        }
      }
    }
  };

  const handleWebViewLoadEnd = async () => {
    setLoading(false);
    
    // Set the WebView reference for screenshot capture with retry logic
    try {
      await screenshotService.setWebViewFromRef(webViewRef);
      console.log('WebView reference set for screenshot capture on load end');
      
      // Ensure the reference is working by testing a screenshot
      setTimeout(async () => {
        try {
          await screenshotService.captureScreenshot();
          console.log('Screenshot test successful after WebView load');
        } catch (testError) {
          console.warn('Screenshot test failed after WebView load:', testError);
        }
      }, 500);
    } catch (error) {
      console.error('Failed to set WebView reference on load end:', error);
    }
  };

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    // Check if the URL should be blocked before allowing navigation
    const shouldBlock = await checkUrlBlocking(navState.url);
    
    if (!shouldBlock) {
      setCurrentUrl(navState.url);
      setCanGoBack(navState.canGoBack);
      setCanGoForward(navState.canGoForward);
      setLoading(navState.loading);
    }
  };

  const handleShouldStartLoadWithRequest = (request: any): boolean => {
    // For synchronous handling, we'll check against a cached list of blocked domains
    // and use checkUrlBlocking for more comprehensive async checking in navigation state change
    try {
      const url = request.url || '';
      
      // Quick synchronous check for obviously blocked domains
      const commonBlockedDomains = [
        'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com',
        'youporn.com', 'tube8.com', 'spankbang.com', 'xhamster.com'
      ];
      
      const hostname = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/)?.[1] || '';
      const isBlocked = commonBlockedDomains.some(domain => 
        hostname.includes(domain) || hostname.endsWith(domain)
      );
      
      if (isBlocked) {
        setTimeout(() => {
          setIsBlocked(true);
          setBlockedUrl(url);
        }, 0);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in shouldStartLoadWithRequest:', error);
      return true; // Allow navigation on error
    }
  };

  const handleLoadProgress = ({ nativeEvent }: any) => {
    setProgress(nativeEvent.progress);
  };

  const handleGoToUrl = () => {
    if (url && webViewRef.current) {
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = `https://${url}`;
      }
      setCurrentUrl(formattedUrl);
      webViewRef.current.injectJavaScript(`window.location.href = "${formattedUrl}"`);
    }
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleHome = () => {
    setUrl('https://www.google.com');
    setCurrentUrl('https://www.google.com');
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = "https://www.google.com"`);
    }
  };

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

      {/* URL Bar */}
      <View style={styles.urlBar}>
        <TextInput
          style={styles.urlInput}
          value={url}
          onChangeText={setUrl}
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
      {loading && progress < 1 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      {/* Navigation Controls */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
          onPress={handleGoBack}
          disabled={!canGoBack}
        >
          <Icon name="arrow-back" size={20} color={canGoBack ? "#007AFF" : "#ccc"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          onPress={handleGoForward}
          disabled={!canGoForward}
        >
          <Icon name="arrow-forward" size={20} color={canGoForward ? "#007AFF" : "#ccc"} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={handleRefresh}>
          <Icon name="refresh" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.urlDisplay}>
          <Icon name="lock" size={16} color="#4CAF50" />
          <Text style={styles.currentUrlText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webView}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onLoadProgress={handleLoadProgress}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={handleWebViewLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        userAgent={Platform.select({
          ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
          android: 'Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        })}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />
      
      {/* Blocked Content Overlay */}
      {isBlocked && (
        <View style={styles.blockedOverlay}>
          <View style={styles.blockedContent}>
            <Icon name="warning" size={48} color="#FF6B6B" />
            <Text style={styles.blockedTitle}>Content Blocked</Text>
            <Text style={styles.blockedMessage}>
              This website has been blocked for your safety and accountability.
            </Text>
            <Text style={styles.blockedUrl} numberOfLines={2}>
              {blockedUrl}
            </Text>
            <TouchableOpacity
              style={styles.blockedButton}
              onPress={() => {
                setIsBlocked(false);
                setBlockedUrl('');
                handleHome();
              }}
            >
              <Text style={styles.blockedButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  urlInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f7',
    borderRadius: 18,
    fontSize: 14,
    color: '#1d1d1f',
  },
  goButton: {
    marginLeft: 8,
    padding: 8,
  },
  progressContainer: {
    height: 2,
    backgroundColor: '#e1e5e9',
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
    borderBottomColor: '#e1e5e9',
  },
  navButton: {
    padding: 8,
    marginRight: 16,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  urlDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  currentUrlText: {
    marginLeft: 4,
    fontSize: 12,
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
    backgroundColor: '#fff',
  },
  blockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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

export default WebViewBrowserScreen;
