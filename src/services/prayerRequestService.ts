import api from './api';

export interface PrayerRequest {
  id: number;
  userId: number;
  title: string;
  body: string;
  visibility: 'private' | 'partner' | 'group' | 'public';
  partnerIds?: number[];
  groupIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPrayerRequests {
  items: PrayerRequest[];
  page: number;
  totalPages: number;
}

export interface CreatePrayerRequestPayload {
  title: string;
  body: string;
  visibility: 'private' | 'partner' | 'group' | 'public';
  partnerIds?: number[];
  groupIds?: number[];
}

export interface UpdatePrayerRequestPayload {
  title?: string;
  body?: string;
  visibility?: 'private' | 'partner' | 'group' | 'public';
  partnerIds?: number[];
  groupIds?: number[];
}

const createPrayerRequest = async (payload: CreatePrayerRequestPayload): Promise<PrayerRequest> => {
  const { data } = await api.post('/accountability/prayer-requests', payload);
  return data.data;
};

const getPrayerRequests = async (page = 1, limit = 10, search?: string): Promise<PaginatedPrayerRequests> => {
  const params: any = { page, limit };
  if (search) {
    params.search = search;
  }
  const { data } = await api.get('/accountability/prayer-requests', { params });
  return data.data;
};

const getPublicPrayerRequests = async (page = 1, limit = 10, search?: string): Promise<PaginatedPrayerRequests> => {
  const params: any = { page, limit };
  if (search) {
    params.search = search;
  }
  const { data } = await api.get('/accountability/prayer-requests/public', { params });
  return data.data;
};

const getSharedPrayerRequests = async (page = 1, limit = 10, search?: string): Promise<PaginatedPrayerRequests> => {
  const params: any = { page, limit };
  if (search) {
    params.search = search;
  }
  const { data } = await api.get('/accountability/prayer-requests/shared', { params });
  return data.data;
};

const getPrayerRequestsByUserId = async (userId: number, page = 1, limit = 10): Promise<PaginatedPrayerRequests> => {
  const { data } = await api.get(`/accountability/prayer-requests/user/${userId}`, { params: { page, limit } });
  return data.data;
};

const getPrayerRequestById = async (id: number): Promise<PrayerRequest> => {
  const { data } = await api.get(`/accountability/prayer-requests/single/${id}`);
  return data.data;
};

const updatePrayerRequest = async (id: number, payload: UpdatePrayerRequestPayload): Promise<PrayerRequest> => {
  const { data } = await api.patch(`/accountability/prayer-requests/${id}`, payload);
  return data.data;
};

const deletePrayerRequest = async (id: number): Promise<void> => {
  await api.delete(`/accountability/prayer-requests/${id}`);
};

const addCommentToPrayerRequest = async (
  id: number,
  comment: { body: string; mentions?: number[]; attachments?: any[] }
): Promise<any> => {
  const { data } = await api.post(`/accountability/prayer-requests/${id}/comments`, comment);
  return data.data;
};

const getPrayerRequestComments = async (
  id: number,
  page = 1,
  limit = 10
): Promise<any> => {
  const { data } = await api.get(`/accountability/prayer-requests/${id}/comments`, { params: { page, limit } });
  return data.data;
};

const deletePrayerRequestComment = async (
  id: number,
  commentId: number
): Promise<void> => {
  await api.delete(`/accountability/prayer-requests/${id}/comments/${commentId}`);
};

export const prayerRequestService = {
  createPrayerRequest,
  getPrayerRequests,
  getPublicPrayerRequests,
  getSharedPrayerRequests,
  getPrayerRequestsByUserId,
  getPrayerRequestById,
  updatePrayerRequest,
  deletePrayerRequest,
  addCommentToPrayerRequest,
  getPrayerRequestComments,
  deletePrayerRequestComment,
};

