import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import our screen components
import LibraryStack from './LibraryStack';
import AccountabilityNavigator from './AccountabilityNavigator';
import FastingNavigator from './FastingNavigator';
import MenuScreen from '../screens/MenuScreen';
import SettingsTabScreen from '../screens/SettingsTabScreen';

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

      {/* Home Tab */}
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

       {/* Fasting Tab */}
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
      {/* Library Tab */}
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

      

     

      {/* Menu Tab */}
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={'menu-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Menu',
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
              iconName={Icons.tabs.settings ? Icons.tabs.settings.name : 'settings-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;