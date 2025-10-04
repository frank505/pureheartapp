import React, { useMemo, useState, useEffect } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';

// Import our screen components
import LibraryStack from './LibraryStack';
import AccountabilityNavigator from './AccountabilityNavigator';
import FastingNavigator from './FastingNavigator';
import HubScreen from '../screens/HubScreen';
import SettingsTabScreen from '../screens/SettingsTabScreen';
import TabbedWebViewBrowserScreen from '../screens/TabbedWebViewBrowserScreen';

// Redux imports
import { useAppSelector } from '../store/hooks';

// Import user type utilities
import { getUserType } from '../utils/userTypeUtils';

// These imports will be removed as they'll be moved to root navigator
// import InvitePartnerScreen from '../screens/InvitePartnerScreen';
// import PartnersListScreen from '../screens/PartnersListScreen';
// import PrayerRequestsScreen from '../screens/PrayerRequestsScreen';
// import CreatePrayerRequestScreen from '../screens/CreatePrayerRequestScreen';
// import CreateVictoryScreen from '../screens/CreateVictoryScreen';
// import MyVictoriesScreen from '../screens/MyVictoriesScreen';
// import AllGroupsScreen from '../screens/AllGroupsScreen';
// import VictoryStoriesScreen from '../screens/VictoryStoriesScreen';

// Import centralized colors and icons
import { ComponentColors, Icons, Colors } from '../constants';
import { TabIcon } from '../components/Icon';
import OldHomeScreen from '../screens/OldHomeScreen';

/**
 * TabNavigator Component
 * 
 * This component sets up the bottom tab navigation for the app.
 * It includes four main tabs: Home, Explore, Profile, and Settings.
 * 
 * Features:
 * - Custom tab icons using emojis (can be replaced with actual icon components)
 * - Consistent styling across all tabs
 * - Proper screen options configuration
 * - Active/inactive state handling for better UX
 * 
 * Tab Structure:
 * - Home: Main dashboard and quick actions
 * - Library: Library resources and help options
 * - Accountability: Partner connections and spiritual accountability
 * - Truth: Scripture and spiritual guidance
 * - Progress: Tracking spiritual growth and milestones
 */

// Create the bottom tab navigator instance
const Tab = createBottomTabNavigator();

/**
 * Custom Tab Icon Component
 * 
 * @param iconName - The icon name from Ionicons
 * @param focused - Whether the tab is currently active
 * @param color - The icon color (active/inactive)
 * @returns JSX element for the tab icon
 */
const CustomTabIcon: React.FC<{ iconName: string; focused: boolean; color: string }> = ({ 
  iconName, 
  focused, 
  color 
}) => (
  <TabIcon
    name={iconName}
    focused={focused}
    color={color}
  />
);

const TabNavigator: React.FC = () => {
  // Get current user and onboarding data from Redux
  const currentUser = useAppSelector(state => state.user.currentUser);
  const onboardingUserType = useAppSelector(state => state.onboarding.userType);
  
  // Local state for user type from AsyncStorage (fallback)
  const [asyncStorageUserType, setAsyncStorageUserType] = useState<'partner' | 'user' | null>(null);
  
  // Load user type from AsyncStorage on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadUserType = async () => {
        const userType = await getUserType();
        console.log('[TabNavigator] Loaded user type from AsyncStorage:', userType);
        setAsyncStorageUserType(userType);
      };
      loadUserType();
    }, [])
  );
  
  // Also reload when Redux state changes (from toggle)
  useEffect(() => {
    const loadUserType = async () => {
      const userType = await getUserType();
      console.log('[TabNavigator] Redux changed, reloading from AsyncStorage:', userType);
      setAsyncStorageUserType(userType);
    };
    loadUserType();
  }, [currentUser?.userType, onboardingUserType]);
  
  // Determine if user is a partner/accountability buddy
  // Priority: 1) AsyncStorage (most reliable), 2) currentUser.userType, 3) onboarding store
  const isPartner = asyncStorageUserType === 'partner' || 
                    (!asyncStorageUserType && currentUser?.userType === 'partner') ||
                    (!asyncStorageUserType && !currentUser?.userType && onboardingUserType === 'partner');
  
  // Debug log to track isPartner changes
  useEffect(() => {
    console.log('[TabNavigator] isPartner changed to:', isPartner, '{ asyncStorage:', asyncStorageUserType, 'redux:', currentUser?.userType, 'onboarding:', onboardingUserType, '}');
  }, [isPartner, asyncStorageUserType, currentUser?.userType, onboardingUserType]);

  return (
    <Tab.Navigator
      screenOptions={{
        // Header styling
        headerStyle: {
          backgroundColor: ComponentColors.header.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: ComponentColors.header.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: ComponentColors.header.text,
        },
        
        // Tab bar styling
        tabBarStyle: {
          backgroundColor: ComponentColors.tabBar.background,
          borderTopWidth: 1,
          borderTopColor: ComponentColors.tabBar.border,
          paddingVertical: 8,
          height: 76,
          elevation: 8,
        },
        tabBarActiveTintColor: Colors.secondary.main,
        tabBarInactiveTintColor: ComponentColors.tabBar.inactiveTint,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      {/* Quitter Tab (new, shown first) */}
      {/* <Tab.Screen
        name="Old Home"
        component={OldHomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={'leaf-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Quitter',
        }}
      /> */}

      {/* Home Tab - Hidden for partners */}
      {!isPartner && (
        <Tab.Screen
          name="Home"
          component={AccountabilityNavigator}
          options={{
            headerShown: false, // Custom header in AccountabilityScreen
            tabBarIcon: ({ focused, color }) => (
              <CustomTabIcon 
                iconName={Icons.tabs.home.name} 
                focused={focused} 
                color={color} 
              />
            ),
            tabBarLabel: 'Home',
          }}
        />
      )}

       {/* Fasting Tab - Hidden for partners */}
      {!isPartner && (
        <Tab.Screen
          name="Fasting"
          component={FastingNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <CustomTabIcon 
                iconName="hourglass-outline"
                focused={focused} 
                color={color} 
              />
            ),
            tabBarLabel: 'Fasting',
          }}
        />
      )}

      {/* Browse Safely Tab - Hidden for partners */}
      {!isPartner && (
        <Tab.Screen
          name="BrowseSafely"
          component={TabbedWebViewBrowserScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <CustomTabIcon 
                iconName="shield-checkmark-outline"
                focused={focused} 
                color={color} 
              />
            ),
            tabBarLabel: 'Browse Safely',
          }}
        />
      )}

      {/* Library Tab - Hidden for partners */}
      {!isPartner && (
        <Tab.Screen
          name="Library"
          component={LibraryStack}
          options={{ 
            headerShown: false, // Custom header in LibraryScreen
            tabBarIcon: ({ focused, color }) => (
              <CustomTabIcon 
                iconName={'library-outline'} 
                focused={focused} 
                color={color} 
              />
            ),
            tabBarLabel: 'Library',
          }}
        />
      )}

      

     

      {/* Hub Tab (renamed from Menu) */}
      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={'menu-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Hub',
        }}
      />

      {/* Settings Tab */}
      <Tab.Screen
        name="Settings"
        component={SettingsTabScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
        iconName={'person-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
      tabBarLabel: 'Account',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;