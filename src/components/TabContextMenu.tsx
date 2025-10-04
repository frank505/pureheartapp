import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BrowserTab } from '../types/TabTypes';

interface TabContextMenuProps {
  visible: boolean;
  tab: BrowserTab | null;
  onClose: () => void;
  onDuplicate: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseOtherTabs: (tabId: string) => void;
  onRefresh: (tabId: string) => void;
  canClose: boolean;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
  visible,
  tab,
  onClose,
  onDuplicate,
  onCloseTab,
  onCloseOtherTabs,
  onRefresh,
  canClose,
}) => {
  if (!tab) return null;

  const handleDuplicate = () => {
    onDuplicate(tab.id);
    onClose();
  };

  const handleCloseTab = () => {
    if (canClose) {
      onCloseTab(tab.id);
      onClose();
    } else {
      Alert.alert('Cannot Close', 'You must have at least one tab open.');
    }
  };

  const handleCloseOtherTabs = () => {
    Alert.alert(
      'Close Other Tabs',
      'Are you sure you want to close all other tabs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Others',
          style: 'destructive',
          onPress: () => {
            onCloseOtherTabs(tab.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    onRefresh(tab.id);
    onClose();
  };

  const menuItems = [
    {
      icon: 'refresh',
      title: 'Refresh',
      onPress: handleRefresh,
    },
    {
      icon: 'content-copy',
      title: 'Duplicate Tab',
      onPress: handleDuplicate,
    },
    {
      icon: 'close',
      title: 'Close Tab',
      onPress: handleCloseTab,
      disabled: !canClose,
      destructive: true,
    },
    {
      icon: 'clear-all',
      title: 'Close Other Tabs',
      onPress: handleCloseOtherTabs,
      destructive: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu}>
          <View style={styles.menuHeader}>
            <Icon name="tab" size={20} color="#666" />
            <Text style={styles.menuTitle} numberOfLines={1}>
              {tab.title}
            </Text>
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.disabled && styles.disabledMenuItem,
              ]}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <Icon
                name={item.icon}
                size={20}
                color={
                  item.disabled
                    ? '#ccc'
                    : item.destructive
                    ? '#FF6B6B'
                    : '#333'
                }
              />
              <Text
                style={[
                  styles.menuItemText,
                  item.disabled && styles.disabledMenuItemText,
                  item.destructive && styles.destructiveMenuItemText,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 200,
    maxWidth: 250,
    margin: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledMenuItemText: {
    color: '#ccc',
  },
  destructiveMenuItemText: {
    color: '#FF6B6B',
  },
});

export default TabContextMenu;
