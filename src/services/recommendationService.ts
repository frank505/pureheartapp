
import api from './api';
import { Recommendation, PaginatedRecommendations } from '../store/slices/recommendationsSlice';

export const getTodaysRecommendation = async (): Promise<Recommendation> => {
  const { data } = await api.get('/recommendations/today');
  return data.data;
};

export const getRecommendationsHistory = async (page: number = 1, limit: number = 20): Promise<PaginatedRecommendations> => {
  const { data } = await api.get('/recommendations/history', {
    params: { page, limit },
  });
  return data;
};

export const generateDailyRecommendation = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await api.post(
      '/recommendations/generate',
      {},
      {
        headers: {
          'x-user-timezone': timezone,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error generating daily recommendation:', error);
    throw error;
  }
};
