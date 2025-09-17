import api from './api';

interface IAPIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  statusCode: number;
}

export async function createPanic(message?: string | null): Promise<void> {
  const res = await api.post<IAPIResponse>('/panic', { message: message ?? null });
  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Failed to create panic');
  }
}

export interface PanicUser {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string | null;
}

export interface PanicFeedItem {
  id: number;
  userId: number;
  message?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: PanicUser;
  repliesCount?: number;
  // present only for notifications list
  notifiedAt?: string;
}

export interface PanicDetail extends PanicFeedItem {
  replies?: Array<{
    id: number;
    message: string;
    createdAt: string;
    replier?: PanicUser;
    userId?: number;
  }>;
}

export async function getPanicFeed(): Promise<PanicFeedItem[]> {
  try {
  // Fallback combined feed not supported by API; try my panics first
  const mine = await getMyPanics().catch(() => ({ items: [] as PanicFeedItem[], page: 1, totalPages: 1 }));
  const notified = await getPanicsForMe().catch(() => ({ items: [] as PanicFeedItem[], page: 1, totalPages: 1 }));
  const combined = [...mine.items, ...notified.items];
  combined.sort((a, b) => new Date((b.notifiedAt || b.createdAt)).getTime() - new Date((a.notifiedAt || a.createdAt)).getTime());
  return combined;
  } catch (e: any) {
    // 404 -> no feed available yet
    if (e?.response?.status === 404) return [];
    throw e;
  }
}

export async function getPanicDetail(panicId: number): Promise<PanicDetail> {
  const res = await api.get<IAPIResponse<PanicDetail>>(`/panic/${panicId}`);
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch panic');
  return res.data.data as PanicDetail;
}

export async function replyToPanic(panicId: number, message: string): Promise<void> {
  const res = await api.post<IAPIResponse>(`/panic/${panicId}/replies`, { message });
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to post reply');
}

export interface Paginated<T> { items: T[]; page: number; totalPages: number }

export async function getMyPanics(page: number = 1, limit: number = 20): Promise<Paginated<PanicFeedItem>> {
  const res = await api.get<IAPIResponse<{ items: PanicFeedItem[]; page: number; totalPages: number }>>('/panics/mine', { params: { page, limit } });
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch panics');
  const d = res.data.data || { items: [], page: 1, totalPages: 1 };
  return { items: Array.isArray(d.items) ? d.items : [], page: Number(d.page) || 1, totalPages: Number(d.totalPages) || 1 };
}

export async function getPanicsForMe(page: number = 1, limit: number = 20): Promise<Paginated<PanicFeedItem>> {
  const res = await api.get<IAPIResponse<{ items: (PanicFeedItem & { notifiedAt?: string })[]; page: number; totalPages: number }>>('/panics/for-me', { params: { page, limit } });
  if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch notifications');
  const d = res.data.data || { items: [], page: 1, totalPages: 1 };
  return { items: Array.isArray(d.items) ? d.items : [], page: Number(d.page) || 1, totalPages: Number(d.totalPages) || 1 };
}

export default { createPanic, getPanicFeed, getPanicDetail, replyToPanic, getMyPanics, getPanicsForMe };
