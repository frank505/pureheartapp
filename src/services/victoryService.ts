import api from './api';

export interface Victory {
  id: number;
  userId: number;
  title: string;
  body?: string;
  visibility: 'private' | 'partner' | 'group' | 'public';
  partnerIds?: number[];
  groupIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVictories {
  items: Victory[];
  page: number;
  totalPages: number;
}

export interface CreateVictoryPayload {
  title: string;
  body?: string;
  visibility: 'private' | 'partner' | 'group' | 'public';
  partnerIds?: number[];
  groupIds?: number[];
}

export interface UpdateVictoryPayload {
  title?: string;
  body?: string;
  visibility?: 'private' | 'partner' | 'group' | 'public';
}

const createVictory = async (payload: CreateVictoryPayload): Promise<Victory> => {
  const { data } = await api.post('/accountability/victories', payload);
  return data.data;
};

const getVictories = async (page = 1, limit = 10): Promise<PaginatedVictories> => {
  const dataGet = await api.get('/accountability/victories', { params: { page, limit } });
  return dataGet.data;
};

const getPublicVictories = async (page = 1, limit = 10): Promise<PaginatedVictories> => {
  const { data } = await api.get('/accountability/victories/public', { params: { page, limit } });
  return data.data;
};

const getVictoriesByUserId = async (userId: number, page = 1, limit = 10): Promise<PaginatedVictories> => {
  const { data } = await api.get(`/accountability/victories/user/${userId}`, { params: { page, limit } });
  return data.data;
};

const getSharedVictories = async (page = 1, limit = 10): Promise<PaginatedVictories> => {
  const { data } = await api.get('/accountability/victories/shared', { params: { page, limit } });
  return data.data;
};

const getVictoryById = async (id: number): Promise<Victory> => {
  const { data } = await api.get(`/accountability/victories/single/${id}`);
  return data.data;
};

const updateVictory = async (id: number, payload: UpdateVictoryPayload): Promise<Victory> => {
  const { data } = await api.patch(`/accountability/victories/${id}`, payload);
  return data.data;
};

const deleteVictory = async (id: number): Promise<void> => {
  await api.delete(`/accountability/victories/${id}`);
};

const addCommentToVictory = async (
  id: number,
  comment: { body: string; mentions?: number[]; attachments?: any[] }
): Promise<any> => {
  const { data } = await api.post(`/accountability/victories/${id}/comments`, comment);
  return data.data;
};

const getVictoryComments = async (
  id: number,
  page = 1,
  limit = 10
): Promise<any> => {
  const { data } = await api.get(`/accountability/victories/${id}/comments`, { params: { page, limit } });
  return data.data;
};

const deleteVictoryComment = async (
  id: number,
  commentId: number
): Promise<void> => {
  await api.delete(`/accountability/victories/${id}/comments/${commentId}`);
};

export const victoryService = {
  createVictory,
  getVictories,
  getPublicVictories,
  getVictoriesByUserId,
  getSharedVictories,
  getVictoryById,
  updateVictory,
  deleteVictory,
  addCommentToVictory,
  getVictoryComments,
  deleteVictoryComment,
};

