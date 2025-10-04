import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { WebViewScreenshotManager } = NativeModules;

interface ScreenshotAnalysisResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: {
    id: number | null;
    status: 'clean' | 'suspicious' | 'explicit';
    findings: Array<{
      label: string;
      category?: string;
      score?: number;
      raw?: any;
    }>;
  };
}

class ScreenshotService {
  private eventEmitter: NativeEventEmitter | null = null;
  private listeners: { [key: string]: any } = {};
  private isInitialized = false;
  private apiBaseUrl = '';

  constructor() {
    if (WebViewScreenshotManager) {
      this.eventEmitter = new NativeEventEmitter(WebViewScreenshotManager);
      this.setupEventListeners();
    }
  }

  public async initialize(apiBaseUrl: string): Promise<void> {
    this.apiBaseUrl = apiBaseUrl;
    this.isInitialized = true;
    console.log('ScreenshotService initialized with API base URL:', apiBaseUrl);
  }

  private setupEventListeners(): void {
    if (!this.eventEmitter) return;

    this.listeners.captureListener = this.eventEmitter.addListener(
      'screenshot_captured',
      (message: string) => {
        console.log('Screenshot captured:', message);
      }
    );

    this.listeners.sentListener = this.eventEmitter.addListener(
      'screenshots_sent',
      (message: string) => {
        console.log('Screenshots sent:', message);
      }
    );

    this.listeners.errorListener = this.eventEmitter.addListener(
      'screenshot_error',
      (error: string) => {
        console.error('Screenshot error:', error);
        // If the error is "WebView not found", we should inform the user or retry
        if (error.includes('WebView not found')) {
          console.warn('WebView not found for screenshot capture. Please ensure the WebView is loaded and set.');
        }
      }
    );

    this.listeners.flushedListener = this.eventEmitter.addListener(
      'screenshots_flushed',
      (message: string) => {
        console.log('Screenshots flushed:', message);
      }
    );
  }

  public async captureScreenshot(): Promise<string> {
    if (!WebViewScreenshotManager) {
      throw new Error('WebViewScreenshotManager not available on this platform');
    }

    try {
      const result = await WebViewScreenshotManager.captureWebViewScreenshot();
      return result;
    } catch (error: any) {
      console.error('Failed to capture screenshot:', error);
      
      // If it's a "WebView not found" error, provide a more helpful message and retry
      if (error?.code === 'NO_WEBVIEW' || error?.message?.includes('WebView not found')) {
        console.warn('WebView not found, attempting automatic detection...');
        
        // Try to set WebView automatically by calling setWebView with no parameters
        // This will trigger the native module to search for WebView in the current activity
        try {
          await WebViewScreenshotManager.setWebView(-1); // Use -1 as a signal to auto-detect
          // Retry screenshot capture
          const retryResult = await WebViewScreenshotManager.captureWebViewScreenshot();
          console.log('Screenshot captured successfully after auto-detection');
          return retryResult;
        } catch (retryError) {
          throw new Error('WebView not found. Please ensure the WebView is loaded and visible on screen. Make sure you are on the browser screen.');
        }
      }
      
      throw error;
    }
  }

  public async sendScreenshotBatch(): Promise<string> {
    if (!WebViewScreenshotManager) {
      throw new Error('WebViewScreenshotManager not available on this platform');
    }

    try {
      const result = await WebViewScreenshotManager.sendScreenshotBatch();
      return result;
    } catch (error) {
      console.error('Failed to send screenshot batch:', error);
      throw error;
    }
  }

  public async flushAllScreenshots(): Promise<string> {
    if (!WebViewScreenshotManager) {
      throw new Error('WebViewScreenshotManager not available on this platform');
    }

    try {
      const result = await WebViewScreenshotManager.flushScreenshotQueue();
      return result;
    } catch (error) {
      console.error('Failed to flush screenshots:', error);
      throw error;
    }
  }

  public async getQueueSize(): Promise<number> {
    if (!WebViewScreenshotManager) {
      return 0;
    }

    try {
      const size = await WebViewScreenshotManager.getQueueSize();
      return size;
    } catch (error) {
      console.error('Failed to get queue size:', error);
      return 0;
    }
  }

  public async setWebView(webViewTag: number): Promise<void> {
    if (!WebViewScreenshotManager) {
      console.warn('WebViewScreenshotManager not available on this platform');
      return;
    }

    try {
      await WebViewScreenshotManager.setWebView(webViewTag);
      console.log('WebView reference set successfully with tag:', webViewTag);
    } catch (error) {
      console.error('Failed to set WebView:', error);
      throw error;
    }
  }

  // Method to set WebView using React ref (for React Native WebView)
  public async setWebViewFromRef(webViewRef: any): Promise<void> {
    if (!webViewRef?.current) {
      console.warn('WebView ref is null or undefined');
      return;
    }

    if (!WebViewScreenshotManager) {
      console.warn('WebViewScreenshotManager not available on this platform');
      return;
    }

    try {
      // Get the native tag from the WebView ref
      let tag = webViewRef.current._nativeTag || webViewRef.current.getTag?.();
      
      // Alternative methods to get the tag
      if (!tag) {
        tag = webViewRef.current.nativeTag || webViewRef.current._reactInternalInstance?.stateNode?.nativeTag;
      }
      
      // Try to find tag from WebView's internal properties
      if (!tag && webViewRef.current.props) {
        tag = webViewRef.current.props.nativeID;
      }
      
      if (tag) {
        await this.setWebView(tag);
        console.log('WebView reference set successfully with tag:', tag);
      } else {
        console.warn('Could not get native tag from WebView ref. Available properties:', Object.keys(webViewRef.current));
        // Fallback: set a flag that WebView exists but couldn't get tag
        this.webViewRefExists = true;
      }
    } catch (error) {
      console.error('Failed to set WebView from ref:', error);
      // Set fallback flag
      this.webViewRefExists = true;
    }
  }

  private webViewRefExists = false;

  // Alternative method for direct API communication (fallback)
  public async sendScreenshotsToAPI(screenshots: string[]): Promise<ScreenshotAnalysisResponse> {
    if (!this.isInitialized) {
      throw new Error('ScreenshotService not initialized. Call initialize() first.');
    }

    if (!screenshots.length) {
      throw new Error('No screenshots provided');
    }

    try {
      const authToken = await this.getAuthToken();
      
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          images: screenshots,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ScreenshotAnalysisResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to send screenshots to API:', error);
      throw error;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  public cleanup(): void {
    Object.values(this.listeners).forEach(listener => {
      if (listener && listener.remove) {
        listener.remove();
      }
    });
    this.listeners = {};
  }

  // Utility method to start automatic screenshot capture
  public startAutomaticCapture(intervalMs: number = 30000): number {
    const interval = setInterval(async () => {
      try {
        await this.captureScreenshot();
      } catch (error) {
        // Only log WebView errors as warnings to reduce console noise
        if (error instanceof Error && error.message.includes('WebView not found')) {
          console.warn('WebView not available for screenshot capture');
          try {
            await this.forceWebViewAutoDetection();
            
            // Wait a bit and try again
            setTimeout(async () => {
              try {
                await this.captureScreenshot();
                console.log('Screenshot capture recovered');
              } catch (retryError) {
                console.warn('Screenshot capture still unavailable:', (retryError as any)?.message || retryError);
              }
            }, 1000);
          } catch (autoDetectError) {
            console.warn('WebView auto-detection unavailable:', (autoDetectError as any)?.message || autoDetectError);
          }
        } else {
          console.error('Screenshot capture failed:', error);
        }
      }
    }, intervalMs);

    return interval;
  }

  // Utility method to stop automatic screenshot capture
  public stopAutomaticCapture(interval: number): void {
    clearInterval(interval);
  }

  // Method to handle app state changes (pause/resume)
  public async handleAppStateChange(appState: string): Promise<void> {
    if (appState === 'background' || appState === 'inactive') {
      // Flush any remaining screenshots when app goes to background
      try {
        await this.flushAllScreenshots();
      } catch (error) {
        console.error('Failed to flush screenshots on app state change:', error);
      }
    }
  }

  // Method to test WebView connection
  public async testWebViewConnection(): Promise<boolean> {
    try {
      await this.captureScreenshot();
      console.log('WebView connection test successful');
      return true;
    } catch (error) {
      console.error('WebView connection test failed:', error);
      return false;
    }
  }

  // Method to force WebView auto-detection
  public async forceWebViewAutoDetection(): Promise<void> {
    if (!WebViewScreenshotManager) {
      console.warn('WebViewScreenshotManager not available on this platform');
      return;
    }

    try {
      await WebViewScreenshotManager.setWebView(-1); // Trigger auto-detection
      console.log('WebView auto-detection triggered');
    } catch (error) {
      console.error('Failed to trigger WebView auto-detection:', error);
    }
  }
}

// Export singleton instance
export const screenshotService = new ScreenshotService();
export default screenshotService;
