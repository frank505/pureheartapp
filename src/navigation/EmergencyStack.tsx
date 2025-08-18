import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EmergencyScreen from '../screens/EmergencyScreen';
import BreatheScreen from '../screens/BreatheScreen';
import WorshipScreen from '../screens/WorshipScreen';
import AISessionsScreen from '../screens/AISessionsScreen';
import AIChatScreen from '../screens/AIChatScreen';

export type EmergencyStackParamList = {
  EmergencyMain: undefined;
  BreatheScreen: undefined;
  WorshipScreen: undefined;
  AISessions: undefined;
  AIChat: { sessionId?: number; title?: string } | undefined;
};

const Stack = createStackNavigator<EmergencyStackParamList>();
 
const EmergencyStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="EmergencyMain" 
        component={EmergencyScreen}
      />
      <Stack.Screen 
        name="BreatheScreen" 
        component={BreatheScreen}
      /> 
      <Stack.Screen 
        name="WorshipScreen" 
        component={WorshipScreen}
      />
      <Stack.Screen 
        name="AISessions" 
        component={AISessionsScreen}
      />
      
      <Stack.Screen 
        name="AIChat" 
        component={AIChatScreen}
      />
     
    </Stack.Navigator>
  );
};

export default EmergencyStack;
