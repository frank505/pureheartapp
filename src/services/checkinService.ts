import api from './api';

export type CheckInVisibility = 'private' | 'partner' | 'group';

export interface CheckInDTO {
  id: string;
  userId: string | number;
  mood: number; // 0.0 - 1.0
  note?: string | null;
  visibility: CheckInVisibility;
  partnerId?: number | null;
  groupId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  targetType: 'checkin' | 'prayer_request' | 'victory';
  targetId: number;
  body: string;
  mentions?: number[];
  attachments?: any[];
  createdAt: string;
  updatedAt: string;
  user?: { id: number; username: string };
}

export interface PaginatedComments {
  items: Comment[];
  page: number;
  totalPages: number;
}

export interface CreateCommentPayload {
  body: string;
  mentions?: number[];
  attachments?: any[];
}

export interface CheckInStreak {
  currentStreak: number;
  longestStreak: number;
  streakDates: Date[];
}

export interface PaginatedCheckIns {
  items: CheckInDTO[];
  page: number;
  totalPages: number;
}

const checkinService = {
  async create(input: {
    mood: number;
    note?: string;
    visibility?: CheckInVisibility;
    partnerIds?: Array<number | string>;
    groupIds?: string[];
  }): Promise<CheckInDTO> {
    const payload: any = {
      mood: input.mood,
      note: input.note,
      visibility: input.visibility,
    };
    if (input.partnerIds && input.partnerIds.length > 0) {
      payload.partnerId = input.partnerIds; // backend accepts array under partnerId
    }
    if (input.groupIds && input.groupIds.length > 0) {
      payload.groupId = input.groupIds; // backend accepts array under groupId
    }
    const { data } = await api.post<CheckInDTO>('/accountability/checkins', payload);
    return (data as any).data ?? data; // support wrapped or plain
  },

  async list(params?: { from?: string; to?: string; page?: number; limit?: number }): Promise<PaginatedCheckIns> {
    const { data } = await api.get<PaginatedCheckIns>('/accountability/checkins', { params });
    const payload = (data as any).data ?? data;
    // normalize field names if backend returns different keys
    return {
      items: payload.items ?? payload.rows ?? [],
      page: payload.page ?? 1,
      totalPages: payload.totalPages ?? Math.max(1, Math.ceil((payload.count ?? 0) / (params?.limit ?? 10))),
    };
  },

  async getById(id: string): Promise<CheckInDTO> {
    const { data } = await api.get<CheckInDTO>(`/accountability/checkins/${id}`);
    return (data as any).data ?? data;
  },

  async update(id: string, input: { mood?: number; note?: string; visibility?: CheckInVisibility }): Promise<CheckInDTO> {
    const { data } = await api.patch<CheckInDTO>(`/accountability/checkins/${id}`, input);
    return (data as any).data ?? data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/accountability/checkins/${id}`);
  },

  async addComment(checkInId: string, payload: CreateCommentPayload): Promise<Comment> {
    const { data } = await api.post(`/accountability/checkins/${checkInId}/comments`, payload);
    return (data as any).data ?? data;
  },

  async getComments(checkInId: string, params?: { page?: number; limit?: number }): Promise<PaginatedComments> {
    const { data } = await api.get(`/accountability/checkins/${checkInId}/comments`, { params });
    return (data as any).data ?? data;
  },

  async deleteComment(checkInId: string, commentId: string): Promise<void> {
    await api.delete(`/accountability/checkins/${checkInId}/comments/${commentId}`);
  },

  async getStreaks(): Promise<CheckInStreak> {
    const { data } = await api.get('/accountability/checkins/streaks');
    return (data as any).data ?? data;
  },
};

export default checkinService;


