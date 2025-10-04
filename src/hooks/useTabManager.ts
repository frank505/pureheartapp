import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BrowserTab, TabManager } from '../types/TabTypes';

const TAB_STORAGE_KEY = '@browser_tabs';
const MAX_TABS = 50;
const DEFAULT_URL = 'https://www.google.com';
const DEFAULT_TITLE = 'New Tab';

export const useTabManager = (): TabManager => {
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Generate unique tab ID
  const generateTabId = (): string => {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get tab title from URL
  const getTabTitleFromUrl = (url: string): string => {
    try {
      // Extract hostname from URL manually since URL constructor might not be available
      const match = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
      return url.length > 20 ? `${url.substring(0, 20)}...` : url || DEFAULT_TITLE;
    } catch {
      return url.length > 20 ? `${url.substring(0, 20)}...` : url || DEFAULT_TITLE;
    }
  };

  // Create new tab
  const createTab = useCallback((url: string = DEFAULT_URL, title?: string): string => {
    const newTabId = generateTabId();
    const newTab: BrowserTab = {
      id: newTabId,
      title: title || getTabTitleFromUrl(url),
      url,
      currentUrl: url,
      canGoBack: false,
      canGoForward: false,
      loading: false,
      progress: 0,
      isBlocked: false,
      blockedUrl: '',
      lastVisited: Date.now(),
    };

    setTabs(prevTabs => {
      // If we're at max tabs, close the oldest tab first
      let updatedTabs = prevTabs;
      if (prevTabs.length >= MAX_TABS) {
        const oldestTab = prevTabs.reduce((oldest, tab) => 
          tab.lastVisited < oldest.lastVisited ? tab : oldest
        );
        updatedTabs = prevTabs.filter(tab => tab.id !== oldestTab.id);
      }
      return [...updatedTabs, newTab];
    });

    setActiveTabId(newTabId);
    return newTabId;
  }, []);

  // Close tab
  const closeTab = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const updatedTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, switch to another tab
      if (tabId === activeTabId) {
        if (updatedTabs.length > 0) {
          // Switch to the most recently visited tab
          const mostRecent = updatedTabs.reduce((recent, tab) =>
            tab.lastVisited > recent.lastVisited ? tab : recent
          );
          setActiveTabId(mostRecent.id);
        } else {
          // If no tabs left, create a new one
          setActiveTabId(null);
          setTimeout(() => createTab(), 0);
        }
      }
      
      return updatedTabs;
    });
  }, [activeTabId, createTab]);

  // Switch to tab
  const switchTab = useCallback((tabId: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, lastVisited: Date.now() }
          : tab
      )
    );
    setActiveTabId(tabId);
  }, []);

  // Update tab
  const updateTab = useCallback((tabId: string, updates: Partial<BrowserTab>) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId
          ? { ...tab, ...updates, lastVisited: Date.now() }
          : tab
      )
    );
  }, []);

  // Update tab URL
  const updateTabUrl = useCallback((tabId: string, url: string, currentUrl?: string) => {
    const title = getTabTitleFromUrl(currentUrl || url);
    updateTab(tabId, {
      url,
      currentUrl: currentUrl || url,
      title,
    });
  }, [updateTab]);

  // Update tab navigation state
  const updateTabNavigation = useCallback((tabId: string, canGoBack: boolean, canGoForward: boolean) => {
    updateTab(tabId, { canGoBack, canGoForward });
  }, [updateTab]);

  // Update tab loading state
  const updateTabLoading = useCallback((tabId: string, loading: boolean, progress: number = 0) => {
    updateTab(tabId, { loading, progress });
  }, [updateTab]);

  // Update tab blocked state
  const updateTabBlocked = useCallback((tabId: string, isBlocked: boolean, blockedUrl: string = '') => {
    updateTab(tabId, { isBlocked, blockedUrl });
  }, [updateTab]);

  // Get active tab
  const getActiveTab = useCallback((): BrowserTab | null => {
    return tabs.find(tab => tab.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  // Get specific tab
  const getTab = useCallback((tabId: string): BrowserTab | null => {
    return tabs.find(tab => tab.id === tabId) || null;
  }, [tabs]);

  // Close all tabs
  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    // Create a new tab after closing all
    setTimeout(() => createTab(), 0);
  }, [createTab]);

  // Duplicate tab
  const duplicateTab = useCallback((tabId: string): string => {
    const tabToDuplicate = getTab(tabId);
    if (!tabToDuplicate) return '';
    
    return createTab(tabToDuplicate.currentUrl, `Copy of ${tabToDuplicate.title}`);
  }, [getTab, createTab]);

  // Save tabs to storage
  const saveTabs = useCallback(async () => {
    try {
      const tabData = {
        tabs: tabs.map(tab => ({
          ...tab,
          // Don't save loading states
          loading: false,
          progress: 0,
          isBlocked: false,
          blockedUrl: '',
        })),
        activeTabId,
      };
      await AsyncStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabData));
    } catch (error) {
      console.error('Failed to save tabs:', error);
    }
  }, [tabs, activeTabId]);

  // Load tabs from storage
  const loadTabs = useCallback(async () => {
    try {
      const tabData = await AsyncStorage.getItem(TAB_STORAGE_KEY);
      if (tabData) {
        const parsed = JSON.parse(tabData);
        if (parsed.tabs && parsed.tabs.length > 0) {
          setTabs(parsed.tabs);
          setActiveTabId(parsed.activeTabId);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load tabs:', error);
    }
    
    // If no saved tabs or error, create initial tab
    createTab();
  }, [createTab]);

  // Initialize tabs on mount
  useEffect(() => {
    loadTabs();
  }, [loadTabs]);

  // Save tabs whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      saveTabs();
    }
  }, [tabs, activeTabId, saveTabs]);

  // Ensure we always have at least one tab
  useEffect(() => {
    if (tabs.length === 0 && activeTabId === null) {
      createTab();
    }
  }, [tabs.length, activeTabId, createTab]);

  return {
    tabs,
    activeTabId,
    maxTabs: MAX_TABS,
    createTab,
    closeTab,
    switchTab,
    updateTab,
    updateTabUrl,
    updateTabNavigation,
    updateTabLoading,
    updateTabBlocked,
    getActiveTab,
    getTab,
    closeAllTabs,
    duplicateTab,
  };
};
