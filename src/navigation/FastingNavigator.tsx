import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FastingScreen from '../screens/FastingScreen';
import PastFastsScreen from '../screens/PastFastsScreen';
import FastDetailScreen from '../screens/FastDetailScreen';
import ActivelyFastingScreen from '../screens/ActivelyFastingScreen';
import FastJournalsListScreen from '../screens/FastJournalsListScreen';
import FastJournalDetailScreen from '../screens/FastJournalDetailScreen';
import CreateJournalScreen from '../screens/CreateJournalScreen';
import PartnerFastingHubScreen from '../screens/PartnerFastingHubScreen';
import PartnerUserJournalsScreen from '../screens/PartnerUserJournalsScreen';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants';
import fastingService from '../services/fastingService';
import StartFastScreen from '../screens/StartFastScreen';
import NewFastScreen from '../screens/NewFastScreen';
import FastMonitorScreen from '../screens/FastMonitorScreen';
import {Alert} from 'react-native';
import ConfigureFastScreen from '../screens/ConfigureFastScreen';

export type FastingStackParamList = {
  FastingEntry: undefined;
  FastingList: undefined;
  PastFasts: undefined;
  ActivelyFasting: undefined;
  FastJournalsList: { fastId: number };
  FastJournalDetail: { fastId: number; journalId: number };
  CreateJournal: { fastId: number };
  PartnerFastingHub: undefined;
  PartnerJournalsForUser: { userId: number };
  StartFast: undefined;
  ConfigureFast: {
    fastType: 'daily' | 'nightly' | 'weekly' | 'custom' | 'breakthrough';
  };
  NewFast: {
    fastType: 'daily' | 'nightly' | 'weekly' | 'custom' | 'breakthrough';
    duration?: number;
    startTime?: string;
    endTime?: string;
    selectedDays?: string[];
  frequency?: 'daily' | 'weekly';
  };
  FastMonitor: {
    startDate: Date;
    endDate: Date;
    fastType: string;
    purpose?: string;
  };
  FastDetail: { fastId: number };
};

const Stack = createNativeStackNavigator<FastingStackParamList>();

const FastingEntryScreen = () => {
  const [decided, setDecided] = useState(false);
  const [hasAnyFast, setHasAnyFast] = useState(false);
  const [hasActiveFast, setHasActiveFast] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<FastingStackParamList>>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [res, active] = await Promise.all([
          fastingService.list({ page: 1, limit: 1 }),
          fastingService.list({ page: 1, limit: 1, status: 'active' }),
        ]);
         
        if (!mounted) return;
        setHasAnyFast((res?.items?.length ?? 0) > 0);
        setHasActiveFast((active?.items?.length ?? 0) > 0);
      } catch {
        if (!mounted) return;
        setHasAnyFast(false);
      } finally {
        if (mounted) setDecided(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Refresh on focus so that after creating a fast the routing updates immediately
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const [res, active] = await Promise.all([
            fastingService.list({ page: 1, limit: 1 }),
            fastingService.list({ page: 1, limit: 1, status: 'active' }),
          ]);
          if (cancelled) return;
          setHasAnyFast((res?.items?.length ?? 0) > 0);
          setHasActiveFast((active?.items?.length ?? 0) > 0);
        } catch {
          if (cancelled) return;
          setHasAnyFast(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  useEffect(() => {
    if (!decided) return;
    // Navigate to the appropriate screen once a decision is made
    if (hasActiveFast) {
      navigation.replace('ActivelyFasting');
    } else if (hasAnyFast) {
      navigation.replace('PastFasts');
    } else {
      navigation.replace('FastingList');
    }
  }, [decided, hasActiveFast, hasAnyFast, navigation]);

  // Show a tiny loader while we decide/navigate
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.primary }}>
      <ActivityIndicator color={Colors.primary.main} />
    </View>
  );
};

const FastingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="FastingEntry" component={FastingEntryScreen} />
      <Stack.Screen name="FastingList" component={FastingScreen} />
  <Stack.Screen name="PastFasts" component={PastFastsScreen} />
  <Stack.Screen name="ActivelyFasting" component={ActivelyFastingScreen} />
  <Stack.Screen name="FastJournalsList" component={FastJournalsListScreen} />
  <Stack.Screen name="FastJournalDetail" component={FastJournalDetailScreen} />
  <Stack.Screen name="CreateJournal" component={CreateJournalScreen} />
  <Stack.Screen name="PartnerFastingHub" component={PartnerFastingHubScreen} />
  <Stack.Screen name="PartnerJournalsForUser" component={PartnerUserJournalsScreen} />
      <Stack.Screen name="StartFast" component={StartFastScreen} />
      <Stack.Screen name="ConfigureFast" component={ConfigureFastScreen} />
      <Stack.Screen name="NewFast" component={NewFastScreen} />
      <Stack.Screen name="FastMonitor" component={FastMonitorScreen} />
  <Stack.Screen name="FastDetail" component={FastDetailScreen} />
    </Stack.Navigator>
  );
};

export default FastingNavigator;
