export type DevicePlatform = 'ios' | 'android';

export interface IDeviceToken {
  id: number;
  platform: DevicePlatform;
  token: string;
  isActive: boolean;
  lastActiveAt: Date | null;
  updatedAt: Date;
}
