import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import ContentFilterService from '../services/contentFilter/ContentFilter';

interface FilteredWebViewProps {
  source: { uri: string } | { html: string };
  style?: any;
  onNavigationStateChange?: (navState: any) => void;
  onMessage?: (event: any) => void;
  [key: string]: any;
}

const FilteredWebView: React.FC<FilteredWebViewProps> = ({ 
  source, 
  style, 
  onNavigationStateChange,
  onMessage,
  ...props 
}) => {
  const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
  const [isFilterEnabled, setIsFilterEnabled] = useState(false);
  const webViewRef = useRef<WebView>(null);

  React.useEffect(() => {
    loadFilterSettings();
  }, []);

  const loadFilterSettings = async () => {
    try {
      const filterEnabled = await ContentFilterService.isFilterEnabled();
      const domains = await ContentFilterService.getDefaultBlockedDomains();
      setIsFilterEnabled(filterEnabled);
      setBlockedDomains(domains);
    } catch (error) {
      console.warn('Failed to load filter settings:', error);
    }
  };

  const isBlockedDomain = (url: string): boolean => {
    if (!isFilterEnabled) return false;
    
    try {
      // Extract domain from URL using regex since URL API might not work in React Native
      const domainMatch = url.match(/^https?:\/\/([^\/]+)/);
      if (!domainMatch) return false;
      
      const domain = domainMatch[1].toLowerCase();
      return blockedDomains.some(blockedDomain => 
        domain.includes(blockedDomain.toLowerCase()) || 
        blockedDomain.toLowerCase().includes(domain)
      );
    } catch (error) {
      console.warn('Error parsing URL:', error);
      return false;
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    if (isBlockedDomain(navState.url)) {
      // Block the navigation
      Alert.alert(
        'Content Blocked',
        'This website has been blocked by your content filter.',
        [{ text: 'OK' }]
      );
      
      // Stop loading and go back or to a safe page
      if (webViewRef.current) {
        webViewRef.current.stopLoading();
        webViewRef.current.goBack();
      }
      return;
    }

    if (onNavigationStateChange) {
      onNavigationStateChange(navState);
    }
  };

  const handleShouldStartLoadWithRequest = (request: any): boolean => {
    if (isBlockedDomain(request.url)) {
      Alert.alert(
        'Content Blocked',
        'This website has been blocked by your content filter.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  if (!isFilterEnabled) {
    // If filter is disabled, use regular WebView
    return (
      <WebView
        ref={webViewRef}
        source={source}
        style={style}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={onMessage}
        {...props}
      />
    );
  }

  return (
    <WebView
      ref={webViewRef}
      source={source}
      style={style}
      onNavigationStateChange={handleNavigationStateChange}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      onMessage={onMessage}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  blockedText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  blockedSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});

export default FilteredWebView;
