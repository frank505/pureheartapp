import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  TabNavigator: undefined;
  GroupChat: { groupId: string; groupName?: string };
  [key: string]: any;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}


