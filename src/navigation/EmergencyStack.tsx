import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LibraryScreen from '../screens/LibraryScreen';
import BreatheScreen from '../screens/BreatheScreen';
import WorshipScreen from '../screens/WorshipScreen';
import AISessionsScreen from '../screens/AISessionsScreen';
import AIChatScreen from '../screens/AIChatScreen';

export type LibraryStackParamList = {
  LibraryMain: undefined;
  BreatheScreen: { initialText?: string } | undefined;
  WorshipScreen: undefined;
  AISessions: undefined;
  AIChat: { sessionId?: number; title?: string } | undefined;
};

const Stack = createStackNavigator<LibraryStackParamList>();
 
const LibraryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="LibraryMain" 
        component={LibraryScreen}
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

export default LibraryStack;
