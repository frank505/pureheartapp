import api from './api';

export interface TruthEntry {
  id: number;
  lie: string;
  biblicalTruth: string;
  explanation: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface CreateTruthEntryPayload {
  lie: string;
  biblicalTruth: string;
  explanation: string;
}

export interface UpdateTruthEntryPayload {
  lie?: string;
  biblicalTruth?: string;
  explanation?: string;
}

const getCommonLies = async (): Promise<ApiResponse<TruthEntry[]>> => {
  const response = await api.get('/truth/lies/common');
  return response.data;
};

const saveTruthEntry = async (payload: CreateTruthEntryPayload): Promise<ApiResponse<TruthEntry>> => {
  const response = await api.post('/truth/entries', payload);
  return response.data;
};

const getUserTruthEntries = async (
  params: {
    isDefault?: boolean;
    search?: string;
  } = {}
): Promise<ApiResponse<TruthEntry[]>> => {
  const response = await api.get('/truth/entries', { params });
  return response.data;
};

const updateTruthEntry = async (id: number, payload: UpdateTruthEntryPayload): Promise<ApiResponse<TruthEntry>> => {
  const response = await api.patch(`/truth/entries/${id}`, payload);
  return response.data;
};

const deleteTruthEntry = async (id: number): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/truth/entries/${id}`);
  return response.data;
};

const generateResponseToLie = async (lie: string): Promise<ApiResponse<{ biblicalTruth: string; explanation: string }>> => {
  const response = await api.post('/truth/generate-response-to-lie', { lie });
  return response.data;
};

const getTruthEntryById = async (id: number): Promise<ApiResponse<TruthEntry>> => {
  const response = await api.get(`/truth/entries/${id}`);
  return response.data;
};

export const truthService = {
  getCommonLies,
  saveTruthEntry,
  getUserTruthEntries,
  updateTruthEntry,
  deleteTruthEntry,
  generateResponseToLie,
  getTruthEntryById,
};
