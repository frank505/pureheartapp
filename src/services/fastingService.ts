import api from './api';
import type { CreateFastPayload, ListFastsResponse, PrayerLogPayload, ProgressLogPayload, UpdateFastPayload, Fast } from '../types/fasting';

const fastingService = {
  async create(payload: CreateFastPayload): Promise<Fast> {
    const { data } = await api.post('/fasts', payload);
    return data.data;
  },

  async list(params?: { page?: number; limit?: number; status?: string; type?: string; startDate?: string; endDate?: string }): Promise<ListFastsResponse> {
    const { data } = await api.get('/fasts', { params });
    return data.data;
  },

  async get(fastId: number): Promise<Fast> {
    const { data } = await api.get(`/fasts/${fastId}`);
    return data.data;
  },

  async update(fastId: number, payload: UpdateFastPayload): Promise<Fast> {
    const { data } = await api.put(`/fasts/${fastId}`, payload);
    return data.data;
  },

  async complete(fastId: number): Promise<Fast> {
    const { data } = await api.post(`/fasts/${fastId}/complete`);
    return data.data;
  },

  async endEarly(fastId: number): Promise<Fast> {
    const { data } = await api.post(`/fasts/${fastId}/break`);
    return data.data;
  },

  async addPrayerLog(fastId: number, payload: PrayerLogPayload) {
    const { data } = await api.post(`/fasts/${fastId}/prayers`, payload);
    return data.data;
  },

  async listPrayers(fastId: number) {
    const { data } = await api.get(`/fasts/${fastId}/prayers`);
    return data.data as Array<{
      id: number;
      prayerTime: string | null;
      loggedAt: string;
      duration: string | null;
      type: string | null;
      notes: string | null;
      verseUsed: string | null;
    }>;
  },

  async addProgress(fastId: number, payload: ProgressLogPayload) {
    const { data } = await api.post(`/fasts/${fastId}/progress`, payload);
    return data.data;
  },
};

export default fastingService;
