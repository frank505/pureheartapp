export type FastType = 'daily' | 'nightly' | 'weekly' | 'custom' | 'breakthrough';
export type FastStatus = 'upcoming' | 'active' | 'completed' | 'failed';

export interface Fast {
  id: number;
  userId: number;
  type: FastType;
  goal: string | null;
  smartGoal: string | null;
  prayerTimes: string[];
  verse: string | null;
  prayerFocus: string | null;
  startTime: string; // ISO
  endTime: string; // ISO
  status: FastStatus;
  reminderEnabled: boolean;
  widgetEnabled: boolean;
  completedAt?: string | null;
  brokenAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListFastsResponse {
  items: Fast[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateFastPayload {
  type: FastType;
  goal?: string;
  smartGoal?: string;
  prayerTimes?: string[];
  verse?: string;
  prayerFocus?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  reminderEnabled?: boolean;
  widgetEnabled?: boolean;
  addAccountabilityPartners?: boolean;
}

export interface UpdateFastPayload {
  goal?: string;
  prayerTimes?: string[];
}

export interface PrayerLogPayload {
  prayerTime?: string; // HH:MM
  loggedAt?: string; // ISO
  duration?: string; // ISO8601 e.g., PT10M
  type?: string;
  notes?: string;
  verseUsed?: string;
}

export interface ProgressLogPayload {
  hungerLevel?: number; // 0-5
  spiritualClarity?: number; // 0-5
  temptationStrength?: number; // 0-5
  notes?: string;
  breakthrough?: boolean;
}
