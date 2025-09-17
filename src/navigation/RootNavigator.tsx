import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import InvitePartnerScreen from '../screens/InvitePartnerScreen';
import PartnersListScreen from '../screens/PartnersListScreen';
import PrayerRequestsScreen from '../screens/PrayerRequestsScreen';
import CreatePrayerRequestScreen from '../screens/CreatePrayerRequestScreen';
import CreateVictoryScreen from '../screens/CreateVictoryScreen';
import MyVictoriesScreen from '../screens/MyVictoriesScreen';
import AllGroupsScreen from '../screens/AllGroupsScreen';
import NewGroupScreen from '../screens/NewGroupScreen';
import PartnerFastingHubScreen from '../screens/PartnerFastingHubScreen';
import TruthNavigator from './TruthNavigator';

import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import AndroidContentFilterScreen from '../screens/AndroidContentFilterScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import DailyDoseScreen from '../screens/DailyDoseScreen';
import GrowthTrackerScreen from '../screens/GrowthTrackerScreen';
import ProgressScreen from '../screens/ProgressScreen';
import NotificationsCenterScreen from '../screens/NotificationsCenterScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import PostDetailScreen from '../screens/PostDetailScreen';

import PrayerRequestDetailScreen from '../screens/PrayerRequestDetailScreen';

import VictoryDetailScreen from '../screens/VictoryDetailScreen';
import EditVictoryScreen from '../screens/EditVictoryScreen';
import PublicVictoriesScreen from '../screens/PublicVictoriesScreen';
import CheckInHistoryScreen from '../screens/CheckInHistoryScreen';
import CheckInDetailScreen from '../screens/CheckInDetailScreen';

import EditPrayerRequestScreen from '../screens/EditPrayerRequestScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AISessionsScreen from '../screens/AISessionsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import AICompanionScreen from '../screens/AICompanionScreen';
import BreatheScreen from '../screens/BreatheScreen';
import WorshipScreen from '../screens/WorshipScreen';
import PanicHistoryScreen from '../screens/PanicHistoryScreen';
import PanicDetailScreen from '../screens/PanicDetailScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right' 
      }}
    >
      {/* Main Tab Navigator */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Menu Screens */}
      <Stack.Screen name="InvitePartner" component={InvitePartnerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PartnersList" component={PartnersListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreatePrayerRequest" component={CreatePrayerRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateVictory" component={CreateVictoryScreen} options={{ headerShown: false }} />
   

      <Stack.Screen name="AllGroups" component={AllGroupsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NewGroup" component={NewGroupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PartnerFastingHub" component={PartnerFastingHubScreen} options={{ headerShown: false }} />

      {/* Profile Dropdown Screens */}
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AndroidContentFilter" component={AndroidContentFilterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true }} />
      <Stack.Screen name="DailyDose" component={DailyDoseScreen} options={{ headerShown: true }} />
      <Stack.Screen name="GrowthTracker" component={GrowthTrackerScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ headerShown: false }} />
  <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ headerShown: false }} />

  {/* AI Sessions (global) */}
  <Stack.Screen name="AISessions" component={AISessionsScreen} options={{ headerShown: false }} />
  <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: false }} />
  <Stack.Screen name="AICompanion" component={AICompanionScreen} options={{ headerShown: false }} />

  {/* Emergency tools (global for cross-tab routing) */}
  <Stack.Screen name="BreatheScreen" component={BreatheScreen as unknown as React.ComponentType<any>} options={{ headerShown: false }} />
  <Stack.Screen name="WorshipScreen" component={WorshipScreen as unknown as React.ComponentType<any>} options={{ headerShown: false }} />
  <Stack.Screen name="PanicHistory" component={PanicHistoryScreen as unknown as React.ComponentType<any>} options={{ headerShown: false }} />
  <Stack.Screen name="PanicDetail" component={PanicDetailScreen as unknown as React.ComponentType<any>} options={{ headerShown: false }} />

      {/* Prayer and Victory Screens */}
      <Stack.Screen name="PrayerRequests" component={PrayerRequestsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrayerRequestDetail" component={PrayerRequestDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditPrayerRequest" component={EditPrayerRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyVictories" component={MyVictoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PublicVictories" component={PublicVictoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VictoryDetail" component={VictoryDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditVictory" component={EditVictoryScreen} options={{ headerShown: false }} />

      {/* Check-in Screens */}
      <Stack.Screen name="CheckInHistory" component={CheckInHistoryScreen} options={{ headerShown: true }} />
      <Stack.Screen name="CheckInDetail" component={CheckInDetailScreen} options={{ headerShown: true }} />
 

    
      <Stack.Screen 
        name="GroupChat" 
        component={GroupChatScreen} 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }} 
      />

      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen} 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }} 
      />

      {/* Truth Navigator */}
      <Stack.Screen 
        name="Truth" 
        component={TruthNavigator} 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }} 
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
