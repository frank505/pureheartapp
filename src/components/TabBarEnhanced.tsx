import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TabBarProps, TabItemProps } from '../types/TabTypes';
import TabContextMenu from './TabContextMenu';

interface TabItemPropsExtended extends TabItemProps {
  onLongPress: () => void;
}

const TabItem: React.FC<TabItemPropsExtended> = ({ 
  tab, 
  isActive, 
  onPress, 
  onClose, 
  onLongPress,
  canClose 
}) => {
  const animatedScale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = (e: any) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Animated.View 
      style={[
        styles.tabContainer,
        { transform: [{ scale: animatedScale }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          isActive && styles.activeTab,
          tab.loading && styles.loadingTab,
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        {/* Loading indicator */}
        {tab.loading && (
          <View style={styles.loadingIndicator}>
            <Animated.View 
              style={[
                styles.loadingBar,
                { width: `${tab.progress * 100}%` }
              ]} 
            />
          </View>
        )}

        {/* Tab content */}
        <View style={styles.tabContent}>
          {/* Favicon placeholder */}
          <View style={styles.faviconContainer}>
            {tab.isBlocked ? (
              <Icon name="block" size={16} color="#FF6B6B" />
            ) : tab.loading ? (
              <Icon name="refresh" size={16} color="#666" />
            ) : (
              <Icon name="public" size={16} color="#666" />
            )}
          </View>

          {/* Title */}
          <Text 
            style={[
              styles.tabTitle,
              isActive && styles.activeTabTitle,
              tab.isBlocked && styles.blockedTabTitle,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {tab.title}
          </Text>

          {/* Close button */}
          {canClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="close" size={16} color={isActive ? "#007AFF" : "#999"} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface TabBarPropsExtended extends TabBarProps {
  onDuplicateTab?: (tabId: string) => void;
  onCloseOtherTabs?: (exceptId: string) => void;
  onRefreshTab?: (tabId: string) => void;
}

const TabBar: React.FC<TabBarPropsExtended> = ({
  tabs,
  activeTabId,
  onTabPress,
  onTabClose,
  onNewTab,
  onDuplicateTab,
  onCloseOtherTabs,
  onRefreshTab,
  maxTabs = 50,
}) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuTab, setContextMenuTab] = useState<any>(null);

  const canAddTab = tabs.length < maxTabs;

  const handleTabLongPress = (tab: any) => {
    setContextMenuTab(tab);
    setContextMenuVisible(true);
  };

  const handleCloseContextMenu = () => {
    setContextMenuVisible(false);
    setContextMenuTab(null);
  };

  const handleDuplicate = (tabId: string) => {
    onDuplicateTab?.(tabId);
  };

  const handleCloseOthers = (tabId: string) => {
    onCloseOtherTabs?.(tabId);
  };

  const handleRefresh = (tabId: string) => {
    onRefreshTab?.(tabId);
  };

  return (
    <>
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onPress={() => onTabPress(tab.id)}
              onLongPress={() => handleTabLongPress(tab)}
              onClose={() => onTabClose(tab.id)}
              canClose={tabs.length > 1}
            />
          ))}

          {/* New tab button */}
          {canAddTab && (
            <TouchableOpacity
              style={styles.newTabButton}
              onPress={onNewTab}
              activeOpacity={0.7}
            >
              <Icon name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Tab count indicator */}
        {tabs.length > 1 && (
          <View style={styles.tabCountContainer}>
            <Text style={styles.tabCount}>
              {tabs.length}/{maxTabs}
            </Text>
          </View>
        )}
      </View>

      {/* Context Menu */}
      <TabContextMenu
        visible={contextMenuVisible}
        tab={contextMenuTab}
        onClose={handleCloseContextMenu}
        onDuplicate={handleDuplicate}
        onCloseTab={onTabClose}
        onCloseOtherTabs={handleCloseOthers}
        onRefresh={handleRefresh}
        canClose={tabs.length > 1}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  tabScrollView: {
    flex: 1,
  },
  tabScrollContent: {
    paddingRight: 8,
    alignItems: 'center',
  },
  tabContainer: {
    marginRight: 8,
  },
  tab: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 120,
    maxWidth: 180,
    height: 36,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeTab: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  loadingTab: {
    borderColor: '#007AFF',
  },
  loadingIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  faviconContainer: {
    width: 16,
    height: 16,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '400',
  },
  activeTabTitle: {
    color: '#007AFF',
    fontWeight: '500',
  },
  blockedTabTitle: {
    color: '#FF6B6B',
  },
  closeButton: {
    marginLeft: 4,
    padding: 2,
  },
  newTabButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  tabCountContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  tabCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default TabBar;
