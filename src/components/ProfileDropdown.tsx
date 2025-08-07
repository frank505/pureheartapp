/**
 * ProfileDropdown Component
 * 
 * A dropdown menu component for profile-related actions.
 * Shows options for Profile & Settings and Subscription.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
} from 'react-native-paper';
import Icon from './Icon';
import { Colors } from '../constants';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/userSlice';

interface ProfileDropdownProps {
  navigation?: any;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useAppDispatch();

  const showDropdown = () => {
    setIsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideDropdown = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const handleProfileSettings = () => {
    hideDropdown();
    navigation?.navigate('ProfileSettings');
  };

  const handleSubscription = () => {
    hideDropdown();
    navigation?.navigate('Subscription');
  };

  const handleLogout = () => {
    hideDropdown();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Dispatch logout action to Redux
            // This will clear the authentication state and cause the app to re-render
            // showing the Auth screen since isAuthenticated will become false
            dispatch(logout());
            
            // Clear any stored tokens from AsyncStorage
            // AsyncStorage.removeItem('userToken');
            // AsyncStorage.removeItem('refreshToken');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={showDropdown}
      >
        <Icon 
          name="person-outline" 
          color={Colors.text.primary} 
          size="md" 
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideDropdown}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideDropdown}
        >
          <Animated.View 
            style={[
              styles.dropdownContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Surface style={styles.dropdown} elevation={8}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={handleProfileSettings}
              >
                <Icon 
                  name="settings-outline" 
                  color={Colors.text.primary} 
                  size="sm" 
                />
                <Text style={styles.dropdownText}>Profile & Settings</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={handleSubscription}
              >
                <Icon 
                  name="diamond-outline" 
                  color={Colors.primary.main} 
                  size="sm" 
                />
                <Text style={styles.subscriptionText}>Subscription</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={handleLogout}
              >
                <Icon 
                  name="log-out-outline" 
                  color={Colors.error.main} 
                  size="sm" 
                />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </Surface>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.background.secondary}80`, // Semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100, // Adjust based on header height
    paddingRight: 16,
  },
  dropdownContainer: {
    minWidth: 200,
  },
  dropdown: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  subscriptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary.main,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error.main,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.primary,
    marginHorizontal: 8,
  },
});

export default ProfileDropdown;