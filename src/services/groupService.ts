import api from './api';

export type GroupPrivacy = 'public' | 'private';

export interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  privacy: GroupPrivacy;
  iconUrl?: string;
  ownerId: number;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  totalPages: number;
}

export interface MessageAttachmentDTO {
  id: string;
  type: string;
  url: string;
  name?: string;
}

export interface MessageDTO {
  id: string;
  groupId: string;
  author: { 
    id: string | number; 
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
    currentStreak?: number;
    mostRecentBadge?: Badge | null;
  };
  text?: string;
  attachments: MessageAttachmentDTO[];
  parentId?: string;
  threadCount?: number;
  pinned: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MessagesResponse {
  items: MessageDTO[];
  nextCursor?: string;
}

export interface CommentDTO {
  id: string;
  messageId: string;
  author: { 
    id: string | number; 
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string;
    currentStreak?: number;
    mostRecentBadge?: Badge | null;
  };
  body: string;
  mentions?: number[];
  attachments?: Array<{ type: string; url: string; name?: string }>;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CommentsResponse {
  items: CommentDTO[];
  page: number;
  totalPages: number;
}

export interface Badge {
  id: number;
  code: string;
  title: string;
  icon: string;
  tier: string;
  unlockedAt: string;
}

export interface GroupMemberDTO {
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    currentStreak?: number;
    mostRecentBadge?: Badge | null;
  };
  role: 'owner' | 'moderator' | 'member';
  mutedUntil: string | null;
  banned: boolean;
  joinedAt: string;
}

export interface GroupMembersResponse extends PaginatedResponse<GroupMemberDTO> {}

const groupService = {
  // Groups
  async createGroup(input: { name: string; description?: string; privacy: GroupPrivacy }): Promise<GroupSummary> {
    const { data } = await api.post<GroupSummary>('/groups', input);
    return data;
  },

  async listPublicGroups(params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<GroupSummary>> {
    const { page = 1, pageSize = 20 } = params || {};
    const { data } = await api.get<PaginatedResponse<GroupSummary>>('/groups', { params: { page, pageSize } });
    return data;
  },

  async listMyGroups(params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<GroupSummary>> {
    const { page = 1, pageSize = 20 } = params || {};
    const { data } = await api.get<PaginatedResponse<GroupSummary>>('/groups/mine', { params: { page, pageSize } });
    return data;
  },

  async searchPublicGroups(q: string, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<GroupSummary>> {
    const { page = 1, pageSize = 20 } = params || {};
    const { data } = await api.get<PaginatedResponse<GroupSummary>>('/groups/search', { params: { q, page, pageSize } });
    return data;
  },

  async getGroup(id: string): Promise<GroupSummary> {
    const { data } = await api.get<GroupSummary>(`/groups/${id}`);
    return data;
  },

  async updateGroup(id: string, input: { name?: string; description?: string; privacy?: GroupPrivacy }): Promise<GroupSummary> {
    const { data } = await api.patch<GroupSummary>(`/groups/${id}`, input);
    return data;
  },

  async deleteGroup(id: string): Promise<void> {
    await api.delete(`/groups/${id}`);
  },

  async uploadGroupIcon(id: string, iconUrl?: string): Promise<{ id: string; iconUrl?: string }> {
    const { data } = await api.post<{ id: string; iconUrl?: string }>(`/groups/${id}/icon`, { iconUrl });
    return data;
  },

  async joinGroup(id: string): Promise<void> {
    await api.post(`/groups/${id}/join`);
  },

  async leaveGroup(id: string): Promise<void> {
    await api.delete(`/groups/${id}/leave`);
  },

  async joinByCode(code: string): Promise<void> {
    await api.post('/groups/join-by-code', { code });
  },

  async inviteMembers(id: string, emails: string[]): Promise<{ invited: string[]; invalid: string[] }> {
    const { data } = await api.post<{ invited: string[]; invalid: string[] }>(`/groups/${id}/invite`, { emails });
    return data;
  },

  async unreadCounts(): Promise<{ items: Array<{ groupId: string; unread: number }> }> {
    const { data } = await api.get('/groups/unread-counts');
    return data as any;
  },

  async listMembers(
    groupId: string,
    params?: { page?: number; pageSize?: number; query?: string }
  ): Promise<GroupMembersResponse> {
    const { page = 1, pageSize = 20, query } = params || {};
    const { data } = await api.get<GroupMembersResponse>(`/groups/${groupId}/members`, {
      params: { page, limit: pageSize, query },
    });
    return data;
  },

  async kickMember(groupId: string, userId: number): Promise<void> {
    await api.delete(`/groups/${groupId}/members/${userId}`);
  },

  async changeMemberRole(
    groupId: string,
    userId: number,
    role: 'owner' | 'moderator' | 'member'
  ): Promise<{ role: 'owner' | 'moderator' | 'member' }> {
    const { data } = await api.post<{ role: 'owner' | 'moderator' | 'member' }>(
      `/groups/${groupId}/members/${userId}/role`,
      { role }
    );
    return data;
  },

  async rotateInviteCode(groupId: string): Promise<{ code: string }> {
    const { data } = await api.post<{ code: string }>(`/groups/${groupId}/invite-code/rotate`, {});
    return data;
  },

  // Messages
  async listMessages(
    groupId: string,
    params?: { cursor?: string; before?: string; after?: string; parentId?: string; limit?: number }
  ): Promise<MessagesResponse> {
    const { data } = await api.get<MessagesResponse>(`/groups/${groupId}/messages`, { params });
    return data;
  },

  async sendMessage(
    groupId: string,
    input: { text?: string; attachments?: Array<{ type: string; url: string; name?: string }>; parentId?: string }
  ): Promise<MessageDTO> {
    const { data } = await api.post<MessageDTO>(`/groups/${groupId}/messages`, input);
    return data;
  },

  async editMessage(
    groupId: string,
    messageId: string,
    input: { text?: string; attachments?: Array<{ type: string; url: string; name?: string }> }
  ): Promise<MessageDTO> {
    const { data } = await api.patch<MessageDTO>(`/groups/${groupId}/messages/${messageId}`, input);
    return data;
  },

  async deleteMessage(groupId: string, messageId: string): Promise<void> {
    await api.delete(`/groups/${groupId}/messages/${messageId}`);
  },

  // Comments
  async listComments(
    groupId: string,
    messageId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<CommentsResponse> {
    const { page = 1, pageSize = 20 } = params || {};
    const { data } = await api.get<CommentsResponse>(`/groups/${groupId}/messages/${messageId}/comments`, { params: { page, limit: pageSize } });
    return data;
  },

  async createComment(
    groupId: string,
    messageId: string,
    input: { body: string; mentions?: number[]; attachments?: Array<{ type: string; url: string; name?: string }> }
  ): Promise<CommentDTO> {
    const { data } = await api.post<CommentDTO>(`/groups/${groupId}/messages/${messageId}/comments`, input);
    return data;
  },

  // Likes
  async likeMessage(groupId: string, messageId: string): Promise<void> {
    await api.post(`/groups/${groupId}/messages/${messageId}/like`);
  },

  async unlikeMessage(groupId: string, messageId: string): Promise<void> {
    await api.delete(`/groups/${groupId}/messages/${messageId}/like`);
  },

  async likeComment(groupId: string, messageId: string, commentId: string): Promise<void> {
    await api.post(`/groups/${groupId}/messages/${messageId}/comments/${commentId}/like`);
  },

  async unlikeComment(groupId: string, messageId: string, commentId: string): Promise<void> {
    await api.delete(`/groups/${groupId}/messages/${messageId}/comments/${commentId}/like`);
  },
};

export default groupService;


