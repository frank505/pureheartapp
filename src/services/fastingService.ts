import api from './api';
import type {
  CreateFastPayload,
  ListFastsResponse,
  PrayerLogPayload,
  ProgressLogPayload,
  UpdateFastPayload,
  Fast,
  FastJournal,
  CreateJournalPayload,
  JournalComment,
  CreateCommentPayload,
  PartnerActiveFasterItem,
} from '../types/fasting';

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

  // Journals
  async createJournal(fastId: number, payload: CreateJournalPayload): Promise<FastJournal> {
    const { data } = await api.post(`/fasts/${fastId}/journals`, payload);
    return data.data;
  },

  async listJournals(fastId: number): Promise<FastJournal[]> {
    const { data } = await api.get(`/fasts/${fastId}/journals`);
    return data.data?.items ?? data.data ?? data.items ?? data;
  },

  async getJournal(fastId: number, journalId: number): Promise<FastJournal> {
    const { data } = await api.get(`/fasts/${fastId}/journals/${journalId}`);
    return data.data;
  },

  async deleteJournal(fastId: number, journalId: number): Promise<void> {
    await api.delete(`/fasts/${fastId}/journals/${journalId}`);
  },

  // Journal comments
  async addJournalComment(fastId: number, journalId: number, payload: CreateCommentPayload): Promise<JournalComment> {
    const { data } = await api.post(`/fasts/${fastId}/journals/${journalId}/comments`, payload);
    return data.data;
  },

  async listJournalComments(fastId: number, journalId: number): Promise<JournalComment[]> {
    const { data } = await api.get(`/fasts/${fastId}/journals/${journalId}/comments`);
    return data.data?.items ?? data.data ?? data.items ?? data;
  },

  // Partner views
  async listActiveFastersForPartner(params?: { page?: number; limit?: number }): Promise<{ items: PartnerActiveFasterItem[]; total: number; page: number; limit: number }> {
    const { data } = await api.get('/fasts/partners/active', { params });
    return data.data ?? data;
  },

  async listPartnerJournalsForUser(userId: number, params?: { page?: number; limit?: number }): Promise<{ items: FastJournal[]; total: number; page: number; limit: number }> {
    const { data } = await api.get(`/fasts/partners/${userId}/journals`, { params });
    return data.data ?? data;
  },
};

export default fastingService;
