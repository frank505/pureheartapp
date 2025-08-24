interface IAPIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  statusCode: number;
}

import api from './api';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  image: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AnalyticsSummary {
  currentStreak: number;
  longestStreak: number;
  nextMilestone: number;
  weeklyProgress: {
    labels: string[];
    data: number[];
  };
  weeklyChange: {
    value: number;
    label: string;
  };
}

export interface CalendarData {
  [date: string]: {
    marked: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
  };
}

export interface Feature {
  key: string;
  thresholdDays: number;
  unlocked: boolean;
  currentCheckInStreak: number;
  longestCheckInStreak: number;
  remainingDays: number;
}

export interface Badge {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  tier: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface FeaturesAndBadgesData {
  features: Feature[];
  badges: Badge[];
}

const getAchievements = async (): Promise<Achievement[]> => {
  const response = await api.get<IAPIResponse<{ items: Achievement[] }>>('/progress/achievements');
  if (response.data.success) {
    return response.data.data.items;
  }
  throw new Error(response.data.message);
};

const getAnalytics = async (period: 'last_4_weeks' | 'all_time' = 'last_4_weeks'): Promise<AnalyticsSummary> => {
  const response = await api.get<IAPIResponse<AnalyticsSummary>>(`/progress/analytics?period=${period}`);
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message);
};

const getCalendar = async (month: string): Promise<CalendarData> => {
  const response = await api.get<IAPIResponse<CalendarData>>(`/progress/calendar?month=${month}`);
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message);
};

const getFeaturesAndBadges = async (): Promise<FeaturesAndBadgesData> => {
  const response = await api.get<IAPIResponse<FeaturesAndBadgesData>>('/progress/features-and-badges');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message);
};

export const progressService = {
  getAchievements,
  getAnalytics,
  getCalendar,
  getFeaturesAndBadges,
};
