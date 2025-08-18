
import api from './api';
import { Recommendation, PaginatedRecommendations } from '../store/slices/recommendationsSlice';

// Map API model (flat YouTube + extra fields) to app Recommendation shape
const mapApiToRecommendation = (item: any): Recommendation => {
  if (!item) return item;
  const youtube = item.youtube || {
    url: item.youtubeUrl || undefined,
    videoId: item.youtubeVideoId || undefined,
    title: item.youtubeTitle || undefined,
    channelId: item.youtubeChannelId || undefined,
    channelTitle: item.youtubeChannelTitle || undefined,
  };

  return {
    id: item.id,
    localDate: item.localDate,
    bibleVersion: item.bibleVersion ?? undefined,
    scriptureReference: item.scriptureReference ?? undefined,
    scriptureText: item.scriptureText ?? undefined,
    prayerFocus: item.prayerFocus ?? undefined,
    scripturesToPrayWith: item.scripturesToPrayWith ?? undefined,
    youtube,
    queryContext: item.queryContext ?? undefined,
  } as Recommendation;
};

export const getTodaysRecommendation = async (): Promise<Recommendation> => {
  const { data } = await api.get('/recommendations/today');
  // Some backends wrap the payload in data.data; support both
  const raw = data?.data ?? data;
  return mapApiToRecommendation(raw);
};

export const getRecommendationsHistory = async (page: number = 1, limit: number = 20): Promise<PaginatedRecommendations> => {
  const { data } = await api.get('/recommendations/history', {
    params: { page, limit },
  });
  const payload = data?.data ?? data;
  const items = (payload.items || payload || []).map((it: any) => mapApiToRecommendation(it));
  return {
    items,
    page: payload.page ?? 1,
    totalPages: payload.totalPages ?? 1,
  } as PaginatedRecommendations;
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
