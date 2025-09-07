import { NativeModules, Platform, Alert } from 'react-native';

interface AppBlockingData {
  applicationCount: number;
  categoryCount: number;
  totalCount: number;
  hasSelection: boolean;
}

interface AppBlockingManager {
  showFamilyActivityPicker(): Promise<AppBlockingData | null>;
  getBlockedApps(): Promise<AppBlockingData>;
  clearAllBlockedApps(): Promise<boolean>;
}

const { AppBlockingManagerBridge } = NativeModules;

class AppBlockingService {
  private isSupported(): boolean {
    return Platform.OS === 'ios' && AppBlockingManagerBridge && Platform.Version >= '16.0';
  }

  async showFamilyActivityPicker(): Promise<AppBlockingData | null> {
    if (!this.isSupported()) {
      Alert.alert(
        'Not Supported',
        'App blocking requires iOS 16.0 or later with Family Controls enabled.'
      );
      throw new Error('App blocking is only supported on iOS 16.0+ with Family Controls');
    }

    try {
      console.log('AppBlocking: Calling showFamilyActivityPicker');
      const result = await AppBlockingManagerBridge.showFamilyActivityPicker();
      console.log('AppBlocking: Result received:', result);
      return result;
    } catch (error: any) {
      console.error('AppBlocking: Failed to show Family Activity Picker:', error);
      
      if (error.code === 'authorization_error') {
        Alert.alert(
          'Permission Required',
          'Screen Time permission is required to manage app restrictions. Please grant permission when prompted.'
        );
      } else if (error.code === 'version_error') {
        Alert.alert(
          'iOS Version',
          'App blocking requires iOS 16.0 or later.'
        );
      } else if (error.code === 'presentation_error') {
        Alert.alert(
          'Display Error',
          'Unable to display the app picker. Please try again.'
        );
      } else if (error.message?.includes('Connection to plugin interrupted') || 
                 error.message?.includes('Connection to plugin invalidated')) {
        // Handle FamilyActivityPicker connection issues
        Alert.alert(
          'Connection Issue',
          'There was a temporary issue connecting to the app picker. This is normal and your selections are preserved. Please try again.',
          [
            { text: 'Try Again', onPress: () => this.showFamilyActivityPicker() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          'An unexpected error occurred while opening the app picker. Please try again.'
        );
      }
      
      throw error;
    }
  }

  async getBlockedApps(): Promise<AppBlockingData> {
    if (!this.isSupported()) {
      return {
        applicationCount: 0,
        categoryCount: 0,
        totalCount: 0,
        hasSelection: false,
      };
    }

    try {
      const result = await AppBlockingManagerBridge.getBlockedApps();
      return result;
    } catch (error) {
      console.error('Failed to get blocked apps:', error);
      throw error;
    }
  }

  async clearAllBlockedApps(): Promise<boolean> {
    if (!this.isSupported()) {
      return true;
    }

    try {
      const result = await AppBlockingManagerBridge.clearAllBlockedApps();
      return result;
    } catch (error) {
      console.error('Failed to clear blocked apps:', error);
      throw error;
    }
  }

  isAppBlockingSupported(): boolean {
    return this.isSupported();
  }
}

export const AppBlocking = new AppBlockingService();
export type { AppBlockingData };
