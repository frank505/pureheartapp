import api from './api';
import type { DevicePlatform } from '../types/device';

interface DeviceTokenResponse {
  id: number;
  platform: DevicePlatform;
  token: string;
  isActive: boolean;
  lastActiveAt: string | null;
  updatedAt: string;
}

const deviceTokenService = {
  async list(): Promise<DeviceTokenResponse[]> {
    const { data } = await api.get('/devices');
    return data.data;
  },

  async register(token: string, platform: DevicePlatform): Promise<void> {
    await api.post('/devices/register', { token, platform });
  },

  async deactivate(token: string): Promise<void> {
    await api.post('/devices/deactivate', { token });
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/devices/${id}`);
  },

  async cleanupInactive(olderThanDays?: number): Promise<{ deleted: number }> {
    const { data } = await api.delete('/devices/inactive', {
      params: { olderThanDays },
    });
    return data.data;
  },
};

export default deviceTokenService;
