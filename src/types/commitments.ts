/**
 * Commitment Types and Interfaces
 * 
 * Type definitions for the Action Commitments System.
 * Supports Financial, Action, and Hybrid commitment types.
 */

/**
 * Commitment Types
 */
export type CommitmentType = 'FINANCIAL' | 'ACTION' | 'HYBRID';

/**
 * Commitment Status
 */
export type CommitmentStatus = 
  | 'ACTIVE'                    // Commitment is active, user hasn't relapsed
  | 'ACTION_PENDING'            // User reported relapse, needs to complete action
  | 'ACTION_PROOF_SUBMITTED'    // User submitted proof, awaiting verification
  | 'ACTION_COMPLETED'          // Action verified and completed
  | 'ACTION_OVERDUE'            // Action deadline passed without submission
  | 'COMPLETED'                 // Target date reached successfully
  | 'FAILED';                   // Commitment failed (deadline missed, etc.)

/**
 * Action Categories
 */
export type ActionCategory = 
  | 'COMMUNITY_SERVICE'
  | 'CHURCH_SERVICE'
  | 'CHARITY_DONATION'
  | 'HELPING_INDIVIDUALS'
  | 'ENVIRONMENTAL'
  | 'EDUCATIONAL'
  | 'CUSTOM';

/**
 * Action Difficulty Levels
 */
export type ActionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

/**
 * Rejection Reasons
 */
export type RejectionReason = 
  | 'face_not_visible'
  | 'wrong_location'
  | 'not_showing_action'
  | 'suspicious'
  | 'other';

/**
 * Available Action Interface
 */
export interface AvailableAction {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  estimatedHours: number;
  difficulty: ActionDifficulty;
  impactScore: number;
  proofRequirements?: string[];
  requiresLocation?: boolean;
  proofInstructions?: string;
}

/**
 * Commitment Interface
 */
export interface Commitment {
  id: string;
  userId: string;
  type: CommitmentType;
  status: CommitmentStatus;
  goal: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  action?: AvailableAction;
  partnerId?: string;
  requirePartnerVerification?: boolean;
  financialAmount?: number;
  lastRelapse?: {
    timestamp: string;
    actionRequired: boolean;
  };
}

/**
 * Action Proof Interface
 */
export interface ActionProof {
  id: string;
  commitmentId: string;
  userId: string;
  mediaUrl: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Service Statistics Interface
 */
export interface UserServiceStats {
  userId: string | number;
  totalServiceHours: number;
  totalMoneyDonated: number; // in cents
  totalActionsCompleted: number;
  cleanStreak: number;
  redemptionStreak: number;
  longestCleanStreak: number;
  totalRelapses: number;
  completionRate: number; // 0-100
  breakdown: {
    byCategory: Array<{
      category: ActionCategory;
      hours: number;
      count: number;
    }>;
    byMonth: Array<{
      month: string; // YYYY-MM format
      hours: number;
      count: number;
    }>;
  };
  recentActions: Array<{
    actionId: string;
    title: string;
    completedAt: string;
    hours: number;
    proofThumbnail?: string;
    verifiedBy?: string;
    userNotes?: string;
  }>;
  badges: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: string;
    icon?: string;
  }>;
}

/**
 * Redemption Wall Item (Public Feed)
 */
export interface RedemptionStory {
  id: string;
  commitmentId: string;
  user: {
    displayName: string;
    isAnonymous: boolean;
    avatar?: string;
  };
  action: {
    title: string;
    category: ActionCategory;
    hours: number;
  };
  proofMedia?: {
    thumbnailUrl: string;
    type: 'photo' | 'video';
  };
  reflection?: string;
  completedAt: string;
  stats: {
    encouragements: number;
    comments: number;
  };
}

/**
 * Nearby Location for Actions
 */
export interface NearbyLocation {
  name: string;
  address: string;
  distance: string; // e.g., "2.3 miles"
  phone?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
}

/**
 * Create Commitment Payload
 */
export interface CreateCommitmentPayload {
  commitmentType: CommitmentType;
  actionId?: string;
  customActionDescription?: string;
  financialAmount?: number;
  targetDate: string;
  partnerId?: string | number | null;
  requirePartnerVerification: boolean;
  allowPublicShare: boolean;
}

/**
 * Report Relapse Payload
 */
export interface ReportRelapsePayload {
  relapseDate: string;
  notes?: string;
}

/**
 * Submit Proof Payload
 */
export interface SubmitProofPayload {
  mediaType: 'photo' | 'video';
  userNotes?: string;
  latitude?: number;
  longitude?: number;
  capturedAt: string;
}

/**
 * Verify Proof Payload
 */
export interface VerifyProofPayload {
  proofId: string;
  approved: boolean;
  rejectionReason?: RejectionReason;
  rejectionNotes?: string;
  encouragementMessage?: string;
}

/**
 * Commitment Filter Options
 */
export interface CommitmentFilters {
  status?: CommitmentStatus[];
  type?: CommitmentType[];
  partnerId?: string | number;
}

/**
 * Action Filter Options
 */
export interface ActionFilters {
  category?: ActionCategory[];
  difficulty?: ActionDifficulty[];
  maxHours?: number;
  requiresLocation?: boolean;
}

/**
 * Pagination Options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'most_encouraged' | 'most_impactful';
}

/**
 * API Response Wrappers
 */
export interface CommitmentResponse {
  success: boolean;
  message?: string;
  data: Commitment;
}

export interface ActionProofResponse {
  success: boolean;
  message?: string;
  data: ActionProof;
}

export interface ServiceStatsResponse {
  success: boolean;
  data: UserServiceStats;
}

export interface RedemptionWallResponse {
  success: boolean;
  data: {
    redemptions: RedemptionStory[];
    pagination: {
      total: number;
      hasMore: boolean;
      nextOffset: number;
    };
  };
}

export interface DeadlineCheckResponse {
  success: boolean;
  deadlinePassed: boolean;
  data?: {
    commitmentId: string;
    status: CommitmentStatus;
    actionDeadline: string;
    now: string;
    hoursOverdue: number;
    options: Array<{
      type: 'late_completion' | 'pay_alternative' | 'accept_failure';
      title: string;
      description: string;
      amount?: number;
      available: boolean;
      impactOnStreak?: boolean;
    }>;
  };
}

/**
 * Badge Types
 */
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon?: string;
  requirement: number;
  category: 'service' | 'streak' | 'completion' | 'impact';
}
