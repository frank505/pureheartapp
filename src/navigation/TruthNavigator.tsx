import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TruthScreen from '../screens/TruthScreen';
import TruthDetailScreen from '../screens/TruthDetailScreen';
import AddTruthScreen from '../screens/AddTruthScreen';

export type TruthStackParamList = {
  TruthList: undefined;
  TruthDetail: {
    lie: string;
    truth?: string;
    explanation?: string;
  };
  AddTruth: {
    lie?: string;
    truth?: string;
    explanation?: string;
    isEditing?: boolean;
    id?: number;
  };
};

const Stack = createStackNavigator<TruthStackParamList>();

const TruthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TruthList" component={TruthScreen} />
      <Stack.Screen name="TruthDetail" component={TruthDetailScreen} />
      <Stack.Screen name="AddTruth" component={AddTruthScreen} />
    </Stack.Navigator>
  );
};

export default TruthNavigator;
