import api from './api';

export interface BackendNotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, any>;
  readAt?: string;
  createdAt: string;
}

export interface ListNotificationsResponse {
  items: BackendNotificationItem[];
  page: number;
  totalPages: number;
}

const notificationsService = {
  async list(params?: { page?: number; limit?: number }): Promise<ListNotificationsResponse> {
    const { page = 1, limit = 20 } = params || {};
    const { data } = await api.get<ListNotificationsResponse>('/notifications', { params: { page, limit } });
    return data;
  },

  async markRead(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },
};

export default notificationsService;


