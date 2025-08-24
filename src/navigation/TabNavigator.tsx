import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import our screen components
import EmergencyStack from './EmergencyStack';
import AccountabilityNavigator from './AccountabilityNavigator';
import FastingNavigator from './FastingNavigator';
import ProgressScreen from '../screens/ProgressScreen';
import MenuScreen from '../screens/MenuScreen';

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
 * - Emergency: Emergency contacts and SOS functionality
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
          paddingVertical: 6,
          height: 56,
        },
        tabBarActiveTintColor: Colors.primary.main,
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
      {/* Emergency Tab */}
      <Tab.Screen
        name="Emergency"
        component={EmergencyStack}
        options={{ 
          headerShown: false, // Custom header in EmergencyScreen
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={Icons.tabs.emergency.name} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Emergency',
        }}
      />

      

     

      {/* Progress Tab */}
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          headerShown: false, // Custom header in ProgressScreen
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={Icons.tabs.progress.name} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Progress',
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
    </Tab.Navigator>
  );
};

export default TabNavigator;