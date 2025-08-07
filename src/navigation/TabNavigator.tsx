import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import our screen components
import HomeScreen from '../screens/HomeScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import AccountabilityScreen from '../screens/AccountabilityScreen';
import TruthScreen from '../screens/TruthScreen';
import ProgressScreen from '../screens/ProgressScreen';

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
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: ComponentColors.tabBar.activeTint,
        tabBarInactiveTintColor: ComponentColors.tabBar.inactiveTint,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false, // Custom header in HomeScreen
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

      {/* Emergency Tab */}
      <Tab.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={({ route }) => ({
          headerShown: false, // Custom header in EmergencyScreen
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={Icons.tabs.emergency.name} 
              focused={focused} 
              color={focused ? Colors.white : color} 
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 12,
              fontWeight: focused ? '700' : '600',
              marginTop: 4,
              color: focused ? Colors.white : ComponentColors.tabBar.inactiveTint,
            }}>
              Emergency
            </Text>
          ),
          tabBarItemStyle: ({ focused }: { focused: boolean }) => ({
            backgroundColor: focused ? `${Colors.error.main}33` : 'transparent', // 20% opacity red background
            borderRadius: 8,
            marginHorizontal: 4,
            marginVertical: 4,
          }),
        })}
      />

      {/* Accountability Tab */}
      <Tab.Screen
        name="Accountability"
        component={AccountabilityScreen}
        options={{
          headerShown: false, // Custom header in AccountabilityScreen
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={Icons.tabs.accountability.name} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Accountability',
        }}
      />

      {/* Truth Tab */}
      <Tab.Screen
        name="Truth"
        component={TruthScreen}
        options={{
          headerShown: false, // Custom header in TruthScreen
          tabBarIcon: ({ focused, color }) => (
            <CustomTabIcon 
              iconName={Icons.tabs.truth.name} 
              focused={focused} 
              color={color} 
            />
          ),
          tabBarLabel: 'Truth',
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
    </Tab.Navigator>
  );
};

export default TabNavigator;