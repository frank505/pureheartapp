import api from './api';

export interface ReflectionDTO {
  id: string;
  displayDate: string; // yyyy-MM-dd
  order: number;
  title?: string;
  body: string;
  scriptureReference?: string;
  scriptureText?: string;
}

export interface TodayReflectionsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: ReflectionDTO[];
}

export async function getTodayReflections(timezone?: string): Promise<ReflectionDTO[]> {
  const headers: Record<string, string> = {};
  if (timezone) headers['x-user-timezone'] = timezone;
  const { data } = await api.get<TodayReflectionsResponse>('/reflections/today', { headers });
  return data?.data ?? [];
}

export default { getTodayReflections };
