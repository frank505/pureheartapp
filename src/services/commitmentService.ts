/**
 * Commitment Service
 * 
 * Handles all API calls related to the Action Commitments System.
 * Provides methods for creating, managing, and verifying commitments.
 */

import api from './api';
import {
  Commitment,
  AvailableAction,
  ActionProof,
  UserServiceStats,
  RedemptionStory,
  CreateCommitmentPayload,
  ReportRelapsePayload,
  SubmitProofPayload,
  VerifyProofPayload,
  CommitmentFilters,
  ActionFilters,
  PaginationOptions,
  CommitmentResponse,
  ActionProofResponse,
  ServiceStatsResponse,
  RedemptionWallResponse,
  DeadlineCheckResponse,
  NearbyLocation,
} from '../types/commitments';

/**
 * Commitment Service Class
 */
class CommitmentService {
  /**
   * Create a new commitment
   */
  async createCommitment(payload: CreateCommitmentPayload): Promise<CommitmentResponse> {
    const response = await api.post<CommitmentResponse>('/api/commitments', payload);
    return response.data;
  }

  /**
   * Get commitment by ID
   */
  async getCommitment(commitmentId: string): Promise<Commitment> {
    const response = await api.get<{ data: Commitment }>(`/api/commitments/${commitmentId}`);
    return response.data.data;
  }

  /**
   * Get all commitments for a user
   */
  async getUserCommitments(
    userId: string | number,
    filters?: CommitmentFilters
  ): Promise<Commitment[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) {
      filters.status.forEach(s => params.append('status', s));
    }
    if (filters?.type) {
      filters.type.forEach(t => params.append('type', t));
    }
    if (filters?.partnerId) {
      params.append('partnerId', String(filters.partnerId));
    }

    const response = await api.get<{ data: Commitment[] }>(
      `/api/users/${userId}/commitments?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Get active commitment (if any)
   */
  async getActiveCommitment(userId: string | number): Promise<Commitment | null> {
    const commitments = await this.getUserCommitments(userId, {
      status: ['ACTIVE', 'ACTION_PENDING', 'ACTION_PROOF_SUBMITTED', 'ACTION_OVERDUE']
    });
    return commitments.length > 0 ? commitments[0] : null;
  }

  /**
   * Report a relapse
   */
  async reportRelapse(
    commitmentId: string,
    payload: ReportRelapsePayload
  ): Promise<CommitmentResponse> {
    const response = await api.post<CommitmentResponse>(
      `/api/commitments/${commitmentId}/report-relapse`,
      payload
    );
    return response.data;
  }

  /**
   * Check if deadline has passed
   */
  async checkDeadline(commitmentId: string): Promise<DeadlineCheckResponse> {
    const response = await api.get<DeadlineCheckResponse>(
      `/api/commitments/${commitmentId}/check-deadline`
    );
    return response.data;
  }

  /**
   * Submit proof of action completion
   */
  async submitProof(
    commitmentId: string,
    mediaFile: File | Blob,
    payload: SubmitProofPayload
  ): Promise<ActionProofResponse> {
    const formData = new FormData();
    formData.append('mediaFile', mediaFile);
    formData.append('mediaType', payload.mediaType);
    formData.append('capturedAt', payload.capturedAt);
    
    if (payload.userNotes) {
      formData.append('userNotes', payload.userNotes);
    }
    if (payload.latitude !== undefined) {
      formData.append('latitude', String(payload.latitude));
    }
    if (payload.longitude !== undefined) {
      formData.append('longitude', String(payload.longitude));
    }

    const response = await api.post<ActionProofResponse>(
      `/api/commitments/${commitmentId}/submit-proof`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Get proof details
   */
  async getProof(proofId: string): Promise<ActionProof> {
    const response = await api.get<{ data: ActionProof }>(`/api/proofs/${proofId}`);
    return response.data.data;
  }

  /**
   * Verify proof (partner action)
   */
  async verifyProof(
    commitmentId: string,
    payload: VerifyProofPayload
  ): Promise<ActionProofResponse> {
    const response = await api.post<ActionProofResponse>(
      `/api/commitments/${commitmentId}/verify-proof`,
      payload
    );
    return response.data;
  }

  /**
   * Resubmit proof after rejection
   */
  async resubmitProof(
    proofId: string,
    mediaFile: File | Blob,
    payload: SubmitProofPayload
  ): Promise<ActionProofResponse> {
    const formData = new FormData();
    formData.append('mediaFile', mediaFile);
    formData.append('mediaType', payload.mediaType);
    formData.append('capturedAt', payload.capturedAt);
    
    if (payload.userNotes) {
      formData.append('userNotes', payload.userNotes);
    }
    if (payload.latitude !== undefined) {
      formData.append('latitude', String(payload.latitude));
    }
    if (payload.longitude !== undefined) {
      formData.append('longitude', String(payload.longitude));
    }

    const response = await api.post<ActionProofResponse>(
      `/api/proofs/${proofId}/resubmit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // ============ ACTIONS ============

  /**
   * Get all available actions
   */
  async getAvailableActions(filters?: ActionFilters): Promise<AvailableAction[]> {
    const params = new URLSearchParams();
    
    if (filters?.category) {
      filters.category.forEach(c => params.append('category', c));
    }
    if (filters?.difficulty) {
      filters.difficulty.forEach(d => params.append('difficulty', d));
    }
    if (filters?.maxHours !== undefined) {
      params.append('maxHours', String(filters.maxHours));
    }
    if (filters?.requiresLocation !== undefined) {
      params.append('requiresLocation', String(filters.requiresLocation));
    }

    const response = await api.get<{ data: AvailableAction[] }>(
      `/api/actions?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Get action by ID
   */
  async getAction(actionId: string): Promise<AvailableAction> {
    const response = await api.get<{ data: AvailableAction }>(`/api/actions/${actionId}`);
    return response.data.data;
  }

  /**
   * Find nearby locations for an action
   */
  async getNearbyLocations(
    actionId: string,
    latitude: number,
    longitude: number,
    radius: number = 25
  ): Promise<NearbyLocation[]> {
    const response = await api.get<{ data: NearbyLocation[] }>(
      `/api/actions/nearby?actionId=${actionId}&lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
    return response.data.data;
  }

  // ============ STATS & COMMUNITY ============

  /**
   * Get user service statistics
   */
  async getUserServiceStats(
    userId: string | number,
    timeframe: 'all' | 'year' | 'month' | 'week' = 'all',
    includeHistory: boolean = true
  ): Promise<UserServiceStats> {
    const response = await api.get<ServiceStatsResponse>(
      `/api/users/${userId}/service-stats?timeframe=${timeframe}&includeHistory=${includeHistory}`
    );
    return response.data.data;
  }

  /**
   * Get redemption wall (public feed)
   */
  async getRedemptionWall(options?: PaginationOptions): Promise<RedemptionWallResponse> {
    const params = new URLSearchParams();
    
    if (options?.page) {
      params.append('page', String(options.page));
    }
    if (options?.limit) {
      params.append('limit', String(options.limit));
    }
    if (options?.sortBy) {
      params.append('sortBy', options.sortBy);
    }

    const response = await api.get<RedemptionWallResponse>(
      `/api/redemption-wall?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Encourage a redemption story
   */
  async encourageRedemption(redemptionId: string): Promise<void> {
    await api.post(`/api/redemption-wall/${redemptionId}/encourage`);
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    category: 'service_hours' | 'actions_completed' | 'streak' = 'service_hours',
    limit: number = 20
  ): Promise<Array<{
    userId: string | number;
    username: string;
    avatar?: string;
    value: number;
    rank: number;
  }>> {
    const response = await api.get(
      `/api/leaderboards?category=${category}&limit=${limit}`
    );
    return response.data.data;
  }

  // ============ ALTERNATIVE OPTIONS ============

  /**
   * Pay to skip action (alternative to completion)
   */
  async payToSkip(commitmentId: string, amount: number): Promise<CommitmentResponse> {
    const response = await api.post<CommitmentResponse>(
      `/api/commitments/${commitmentId}/pay-to-skip`,
      { amount }
    );
    return response.data;
  }

  /**
   * Accept failure (mark commitment as failed)
   */
  async acceptFailure(commitmentId: string): Promise<CommitmentResponse> {
    const response = await api.post<CommitmentResponse>(
      `/api/commitments/${commitmentId}/accept-failure`
    );
    return response.data;
  }

  /**
   * Late completion (upload proof after deadline)
   */
  async lateCompletion(
    commitmentId: string,
    mediaFile: File | Blob,
    payload: SubmitProofPayload
  ): Promise<ActionProofResponse> {
    // Same as submitProof but will be marked as late
    return this.submitProof(commitmentId, mediaFile, payload);
  }
}

// Export singleton instance
export const commitmentService = new CommitmentService();
export default commitmentService;
