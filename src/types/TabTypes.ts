export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  currentUrl: string;
  canGoBack: boolean;
  canGoForward: boolean;
  loading: boolean;
  progress: number;
  isBlocked: boolean;
  blockedUrl: string;
  favicon?: string;
  lastVisited: number;
  needsReload?: boolean; // Indicates if tab content needs to be reloaded
}

export interface TabState {
  tabs: BrowserTab[];
  activeTabId: string | null;
  maxTabs: number;
}

export interface TabActions {
  createTab: (url?: string, title?: string) => string;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<BrowserTab>) => void;
  updateTabUrl: (tabId: string, url: string, currentUrl?: string) => void;
  updateTabNavigation: (tabId: string, canGoBack: boolean, canGoForward: boolean) => void;
  updateTabLoading: (tabId: string, loading: boolean, progress?: number) => void;
  updateTabBlocked: (tabId: string, isBlocked: boolean, blockedUrl?: string) => void;
  getActiveTab: () => BrowserTab | null;
  getTab: (tabId: string) => BrowserTab | null;
  closeAllTabs: () => void;
  duplicateTab: (tabId: string) => string;
}

export interface TabManager extends TabState, TabActions {}

export interface TabBarProps {
  tabs: BrowserTab[];
  activeTabId: string | null;
  onTabPress: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  maxTabs?: number;
}

export interface TabItemProps {
  tab: BrowserTab;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
  canClose: boolean;
}
