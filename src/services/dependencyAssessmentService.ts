import api from './api';

export interface DependencyAssessAnswer {
  id: string; // question id
  answer: string; // normalized answer value
}

export interface DependencyAssessPayload {
  narrative?: string; // optional free text narrative if collected later
  answers?: DependencyAssessAnswer[]; // structured answers
}

export interface DependencyAssessResponse {
  score: number; // 0-100
  reasoning?: string;
}

export async function assessDependency(payload: DependencyAssessPayload): Promise<DependencyAssessResponse> {
  const { data } = await api.post('/dependency/assess', payload);
  // backend shape: { success, message, statusCode, data: { score, reasoning } }
  return data?.data ?? { score: 0 };
}

export default { assessDependency };
