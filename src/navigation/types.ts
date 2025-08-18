import { NavigatorScreenParams } from '@react-navigation/native';
import { TruthStackParamList } from './TruthNavigator';

export type RootStackParamList = {
  Home: undefined;
  Emergency: undefined;
  Accountability: undefined;
  Truth: NavigatorScreenParams<TruthStackParamList>;
  Progress: undefined;
  ScriptureBrowser: undefined;
  AICompanion: undefined;
  GroupChat: undefined;
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
};
