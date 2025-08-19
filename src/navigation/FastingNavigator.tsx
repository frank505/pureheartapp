import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FastingScreen from '../screens/FastingScreen';
import StartFastScreen from '../screens/StartFastScreen';
import NewFastScreen from '../screens/NewFastScreen';
import FastMonitorScreen from '../screens/FastMonitorScreen';

export type FastingStackParamList = {
  FastingList: undefined;
  StartFast: undefined;
  NewFast: {
    fastType: string;
    duration?: number;
  };
  FastMonitor: {
    startDate: Date;
    endDate: Date;
    fastType: string;
    purpose?: string;
  };
};

const Stack = createNativeStackNavigator<FastingStackParamList>();

const FastingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FastingList" component={FastingScreen} />
      <Stack.Screen name="StartFast" component={StartFastScreen} />
      <Stack.Screen name="NewFast" component={NewFastScreen} />
      <Stack.Screen name="FastMonitor" component={FastMonitorScreen} />
    </Stack.Navigator>
  );
};

export default FastingNavigator;
