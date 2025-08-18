/**
 * AI Chat Service (client)
 *
 * Thin wrappers around backend endpoints:
 * - GET   /ai/sessions
 * - GET   /ai/sessions/:id/messages
 * - POST  /ai/message
 */
import api from './api';

export type Role = 'user' | 'assistant' | 'system';

export interface AiSession {
  id: number;
  title: string | null;
  archived: boolean;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: number;
  role: Role;
  content: string;
  safetyFlag?: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
}

export async function listSessions(params: { page?: number; limit?: number } = {}): Promise<Paginated<AiSession>> {
  const { page = 1, limit = 50 } = params;
  const { data } = await api.get('/ai/sessions', { params: { page, limit } });
  return data as Paginated<AiSession>;
}

export async function getSessionMessages(
  sessionId: number,
  params: { page?: number; limit?: number } = {}
): Promise<Paginated<AiMessage>> {
  const { page = 1, limit = 100 } = params;
  const { data } = await api.get(`/ai/sessions/${sessionId}/messages`, { params: { page, limit } });
  return data as Paginated<AiMessage>;
}

export async function sendAiMessage(payload: { sessionId?: number; message: string }): Promise<{
  session: { id: number; title: string | null; lastActivityAt: string };
  message: { id: number; role: 'assistant' | 'user'; content: string; createdAt: string };
}> {
  const { data } = await api.post('/ai/message', payload);
  return data;
}

export async function deleteSession(id: number): Promise<void> {
  await api.delete(`/ai/sessions/${id}`);
}
