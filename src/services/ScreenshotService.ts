import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { WebViewScreenshotManager } = NativeModules;

interface ScreenshotAnalysisResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data?: {
    id: number;
    status: 'safe' | 'explicit';
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
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
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
      return;
    }

    try {
      await WebViewScreenshotManager.setWebView(webViewTag);
    } catch (error) {
      console.error('Failed to set WebView:', error);
    }
  }

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
      
      const response = await fetch(`${this.apiBaseUrl}/api/screenshots/scrutinized`, {
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
        console.error('Automatic screenshot capture failed:', error);
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
}

// Export singleton instance
export const screenshotService = new ScreenshotService();
export default screenshotService;
