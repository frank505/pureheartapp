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
  schedule: FixedSchedule | RecurringSchedule;
  goal?: string;
  smartGoal?: string;
  prayerTimes?: string[]; // HH:mm strings
  verse?: string;
  prayerFocus?: string;
  reminderEnabled?: boolean;
  widgetEnabled?: boolean;
  addAccountabilityPartners?: boolean;
}

export interface FixedSchedule {
  kind: 'fixed';
  startAt: string; // ISO
  endAt: string;   // ISO
  timezone?: string;
}

export interface RecurringSchedule {
  kind: 'recurring';
  frequency: 'daily' | 'weekly';
  daysOfWeek?: number[]; // 0-6, only when frequency=weekly
  window: { start: string; end: string }; // HH:mm each
  timezone: string; // required for recurring
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

// Journals
export interface FastJournalAttachment {
  type: string;
  url: string;
  name?: string;
}

export interface FastJournal {
  id: number;
  fastId: number;
  userId: number;
  title?: string | null;
  body: string;
  attachments?: FastJournalAttachment[] | null;
  visibility: 'private' | 'partner';
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalPayload {
  title?: string | null;
  body: string;
  attachments?: FastJournalAttachment[];
  visibility?: 'private' | 'partner';
}

export interface JournalComment {
  id: number;
  userId: number;
  targetType: 'fast_journal';
  targetId: number; // journalId
  body: string;
  mentions?: number[] | null;
  attachments?: FastJournalAttachment[] | null;
  createdAt: string;
}

export interface CreateCommentPayload {
  body: string;
  mentions?: number[];
  attachments?: FastJournalAttachment[];
}

export interface PartnerActiveFasterItem {
  fastId: number;
  type: FastType;
  startTime: string;
  endTime: string;
  progress: {
    percentage: number;
    hoursCompleted: number;
    totalHours: number;
  };
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
    username?: string;
  };
}
