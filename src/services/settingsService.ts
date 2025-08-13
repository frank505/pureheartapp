import api from './api';

export interface AppSettings {
  enable_push_notifications: boolean;
  weekly_email_notifications: boolean;
}

export async function fetchSettings(): Promise<AppSettings> {
  const { data } = await api.get<AppSettings>('/settings');
  return data;
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const { data } = await api.patch<AppSettings>('/settings', partial);
  return data;
}


