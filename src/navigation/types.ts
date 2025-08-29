import { NavigatorScreenParams } from '@react-navigation/native';
import { TruthStackParamList } from './TruthNavigator';
import { FastingStackParamList } from './FastingNavigator';
import { MessageDTO } from '../services/groupService';

export type RootStackParamList = {
  MainTabs: undefined;
  FastMonitor: {
    startDate: Date;
    endDate: Date;
    fastType: string;
    purpose?: string;
  };
  Home: undefined;
  Emergency: undefined;
  Accountability: undefined;
  Truth: NavigatorScreenParams<TruthStackParamList>;
  Progress: undefined;
  Menu: undefined;
  ProfileSettings: undefined;
  Subscription: undefined;
  DailyDose: undefined;
  GrowthTracker: undefined;
  ScriptureBrowser: undefined;
  AICompanion: undefined;
  GroupChat: { groupId: string; groupName: string; memberCount: number };
  PostDetail: { 
    groupId: string; 
    post: MessageDTO;
    groupName?: string;
  };
  PartnersList: undefined;
  CheckInHistory: undefined;
  PrayerRequests: undefined;
  NotificationsCenter: undefined;
  AIChat: undefined;
  EditPartnerPhone: {
    partner: {
      id: string;
      name: string;
      phoneNumber?: string | null;
      canEdit: boolean;
    };
  };
  InvitePartner: undefined;
  CreatePrayerRequest: undefined;
  CreateVictory: undefined;
  MyVictories: undefined;
  AllGroups: undefined;
  NewGroup: undefined;
  PublicVictories: undefined;
  StartFast: undefined;
  ConfigureFast: { 
    fastType: 'daily' | 'nightly' | 'weekly' | 'custom' | 'breakthrough';
  };
  NewFast: { 
    fastType: 'daily' | 'nightly' | 'weekly' | 'custom' | 'breakthrough';
    startTime?: string;
    endTime?: string;
    selectedDays?: string[];
  frequency?: 'daily' | 'weekly';
  };
  LearnFasting: undefined;
  PrayerRequestDetail: { requestId: string };
  EditPrayerRequest: { requestId: string };
  VictoryDetail: { victoryId: string };
  EditVictory: { victoryId: string };
  CheckInDetail: { checkInId: string };
  AddictionSupport: undefined;
};
