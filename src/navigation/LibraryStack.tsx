import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LibraryScreen from '../screens/LibraryScreen';
import BreatheScreen from '../screens/BreatheScreen';
import WorshipScreen from '../screens/WorshipScreen';
import AISessionsScreen from '../screens/AISessionsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

export type LibraryStackParamList = {
  LibraryMain: undefined;
  BreatheScreen: { initialText?: string } | undefined;
  WorshipScreen: undefined;
  AISessions: undefined;
  AIChat: { sessionId?: number; title?: string } | undefined;
  Articles: undefined;
  ArticleDetail: { slug: string };
  Learn: undefined;
  Podcast: undefined;
  Leaderboard: undefined;
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

  {/* Library feature placeholders */}
      <Stack.Screen 
        name="Articles" 
        component={require('../screens/ArticlesScreen').default}
      />
      <Stack.Screen 
        name="ArticleDetail" 
        component={require('../screens/ArticleDetailScreen').default}
      />
      <Stack.Screen 
        name="Learn" 
        component={require('../screens/LearnScreen').default}
      />
      <Stack.Screen 
        name="Podcast" 
        component={require('../screens/PodcastScreen').default}
      />
      <Stack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
      />
     
    </Stack.Navigator>
  );
};

export default LibraryStack;
