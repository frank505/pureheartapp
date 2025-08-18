import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import PrayerRequestsScreen from '../screens/PrayerRequestsScreen';
import VictoriesScreen from '../screens/VictoriesScreen';
import CreatePrayerRequestScreen from '../screens/CreatePrayerRequestScreen';
import PrayerRequestDetailScreen from '../screens/PrayerRequestDetailScreen';
import CreateVictoryScreen from '../screens/CreateVictoryScreen';
import VictoryDetailScreen from '../screens/VictoryDetailScreen';
import EditVictoryScreen from '../screens/EditVictoryScreen';
import PublicVictoriesScreen from '../screens/PublicVictoriesScreen';
import CheckInHistoryScreen from '../screens/CheckInHistoryScreen';
import CheckInDetailScreen from '../screens/CheckInDetailScreen';
import InvitePartnerScreen from '../screens/InvitePartnerScreen';
import MyVictoriesScreen from '../screens/MyVictoriesScreen';
import EditPrayerRequestScreen from '../screens/EditPrayerRequestScreen';
import DailyDoseScreen from '../screens/DailyDoseScreen';
import AllGroupsScreen from '../screens/AllGroupsScreen';


const Stack = createNativeStackNavigator();

const AccountabilityNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountabilityHome" component={HomeScreen} />
      <Stack.Screen name="PrayerRequests" component={PrayerRequestsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreatePrayerRequest" component={CreatePrayerRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrayerRequestDetail" component={PrayerRequestDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditPrayerRequest" component={EditPrayerRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Victories" component={VictoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PublicVictories" component={PublicVictoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateVictory" component={CreateVictoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VictoryDetail" component={VictoryDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditVictory" component={EditVictoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyVictories" component={MyVictoriesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CheckInHistory" component={CheckInHistoryScreen} />
      <Stack.Screen name="CheckInDetail" component={CheckInDetailScreen} />
      <Stack.Screen name="InvitePartner" component={InvitePartnerScreen} options={{ headerShown: false }} />
       
      <Stack.Screen name="DailyDose" component={DailyDoseScreen} />
      <Stack.Screen name="AllGroups" component={AllGroupsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AccountabilityNavigator;

