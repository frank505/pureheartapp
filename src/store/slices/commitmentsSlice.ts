/**
 * Commitments Redux Slice
 * 
 * Manages state for the Action Commitments System.
 * Handles commitments, actions, proofs, and service statistics.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import commitmentService from '../../services/commitmentService';
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
} from '../../types/commitments';

/**
 * State Interface
 */
interface CommitmentsState {
  // Commitments
  commitments: Commitment[];
  activeCommitment: Commitment | null;
  selectedCommitment: Commitment | null;
  
  // Actions
  availableActions: AvailableAction[];
  selectedAction: AvailableAction | null;
  
  // Proofs
  currentProof: ActionProof | null;
  proofHistory: ActionProof[];
  
  // Service Stats
  serviceStats: UserServiceStats | null;
  
  // Redemption Wall
  redemptionStories: RedemptionStory[];
  redemptionPagination: {
    total: number;
    hasMore: boolean;
    currentPage: number;
  };
  
  // UI State
  loading: {
    commitments: boolean;
    actions: boolean;
    proof: boolean;
    stats: boolean;
    redemption: boolean;
  };
  error: string | null;
  
  // Filters
  filters: {
    commitments: CommitmentFilters | null;
    actions: ActionFilters | null;
  };
}

/**
 * Initial State
 */
const initialState: CommitmentsState = {
  commitments: [],
  activeCommitment: null,
  selectedCommitment: null,
  availableActions: [],
  selectedAction: null,
  currentProof: null,
  proofHistory: [],
  serviceStats: null,
  redemptionStories: [],
  redemptionPagination: {
    total: 0,
    hasMore: false,
    currentPage: 1,
  },
  loading: {
    commitments: false,
    actions: false,
    proof: false,
    stats: false,
    redemption: false,
  },
  error: null,
  filters: {
    commitments: null,
    actions: null,
  },
};

// ============ ASYNC THUNKS ============

/**
 * Create a new commitment
 */
export const createCommitment = createAsyncThunk(
  'commitments/create',
  async (payload: CreateCommitmentPayload, { rejectWithValue }) => {
    try {
      const response = await commitmentService.createCommitment(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create commitment');
    }
  }
);

/**
 * Fetch user commitments
 */
export const fetchUserCommitments = createAsyncThunk(
  'commitments/fetchAll',
  async (
    { userId, filters }: { userId: string | number; filters?: CommitmentFilters },
    { rejectWithValue }
  ) => {
    try {
      return await commitmentService.getUserCommitments(userId, filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch commitments');
    }
  }
);

/**
 * Fetch active commitment
 */
export const fetchActiveCommitment = createAsyncThunk(
  'commitments/fetchActive',
  async (userId: string | number, { rejectWithValue }) => {
    try {
      return await commitmentService.getActiveCommitment(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active commitment');
    }
  }
);

/**
 * Report a relapse
 */
export const reportRelapse = createAsyncThunk(
  'commitments/reportRelapse',
  async (
    { commitmentId, payload }: { commitmentId: string; payload: ReportRelapsePayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await commitmentService.reportRelapse(commitmentId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to report relapse');
    }
  }
);

/**
 * Check deadline status
 */
export const checkDeadline = createAsyncThunk(
  'commitments/checkDeadline',
  async (commitmentId: string, { rejectWithValue }) => {
    try {
      return await commitmentService.checkDeadline(commitmentId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check deadline');
    }
  }
);

/**
 * Submit proof of action completion
 */
export const submitProof = createAsyncThunk(
  'commitments/submitProof',
  async (
    {
      commitmentId,
      mediaFile,
      payload,
    }: { commitmentId: string; mediaFile: File | Blob; payload: SubmitProofPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await commitmentService.submitProof(commitmentId, mediaFile, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit proof');
    }
  }
);

/**
 * Verify proof (partner action)
 */
export const verifyProof = createAsyncThunk(
  'commitments/verifyProof',
  async (
    { commitmentId, payload }: { commitmentId: string; payload: VerifyProofPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await commitmentService.verifyProof(commitmentId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify proof');
    }
  }
);

/**
 * Fetch available actions
 */
export const fetchAvailableActions = createAsyncThunk(
  'commitments/fetchActions',
  async (filters: ActionFilters | undefined, { rejectWithValue }) => {
    try {
      return await commitmentService.getAvailableActions(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch actions');
    }
  }
);

/**
 * Fetch user service statistics
 */
export const fetchServiceStats = createAsyncThunk(
  'commitments/fetchStats',
  async (
    {
      userId,
      timeframe = 'all',
      includeHistory = true,
    }: {
      userId: string | number;
      timeframe?: 'all' | 'year' | 'month' | 'week';
      includeHistory?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      return await commitmentService.getUserServiceStats(userId, timeframe, includeHistory);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service stats');
    }
  }
);

/**
 * Fetch redemption wall
 */
export const fetchRedemptionWall = createAsyncThunk(
  'commitments/fetchRedemption',
  async (options: PaginationOptions | undefined, { rejectWithValue }) => {
    try {
      return await commitmentService.getRedemptionWall(options);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch redemption wall');
    }
  }
);

/**
 * Encourage a redemption story
 */
export const encourageRedemption = createAsyncThunk(
  'commitments/encourage',
  async (redemptionId: string, { rejectWithValue }) => {
    try {
      await commitmentService.encourageRedemption(redemptionId);
      return redemptionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to encourage');
    }
  }
);

/**
 * Pay to skip action
 */
export const payToSkip = createAsyncThunk(
  'commitments/payToSkip',
  async (
    { commitmentId, amount }: { commitmentId: string; amount: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await commitmentService.payToSkip(commitmentId, amount);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment');
    }
  }
);

/**
 * Accept failure
 */
export const acceptFailure = createAsyncThunk(
  'commitments/acceptFailure',
  async (commitmentId: string, { rejectWithValue }) => {
    try {
      const response = await commitmentService.acceptFailure(commitmentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept failure');
    }
  }
);

// ============ SLICE ============

const commitmentsSlice = createSlice({
  name: 'commitments',
  initialState,
  reducers: {
    /**
     * Select a commitment
     */
    selectCommitment: (state, action: PayloadAction<Commitment | null>) => {
      state.selectedCommitment = action.payload;
    },

    /**
     * Select an action
     */
    selectAction: (state, action: PayloadAction<AvailableAction | null>) => {
      state.selectedAction = action.payload;
    },

    /**
     * Set selected action (alias for selectAction)
     */
    setSelectedAction: (state, action: PayloadAction<AvailableAction | null>) => {
      state.selectedAction = action.payload;
    },

    /**
     * Set commitment filters
     */
    setCommitmentFilters: (state, action: PayloadAction<CommitmentFilters | null>) => {
      state.filters.commitments = action.payload;
    },

    /**
     * Set action filters
     */
    setActionFilters: (state, action: PayloadAction<ActionFilters | null>) => {
      state.filters.actions = action.payload;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Reset commitments state
     */
    resetCommitments: (state) => {
      state.commitments = [];
      state.activeCommitment = null;
      state.selectedCommitment = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Commitment
    builder
      .addCase(createCommitment.pending, (state) => {
        state.loading.commitments = true;
        state.error = null;
      })
      .addCase(createCommitment.fulfilled, (state, action) => {
        state.loading.commitments = false;
        state.commitments.unshift(action.payload);
        state.activeCommitment = action.payload;
      })
      .addCase(createCommitment.rejected, (state, action) => {
        state.loading.commitments = false;
        state.error = action.payload as string;
      });

    // Fetch User Commitments
    builder
      .addCase(fetchUserCommitments.pending, (state) => {
        state.loading.commitments = true;
        state.error = null;
      })
      .addCase(fetchUserCommitments.fulfilled, (state, action) => {
        state.loading.commitments = false;
        state.commitments = action.payload;
      })
      .addCase(fetchUserCommitments.rejected, (state, action) => {
        state.loading.commitments = false;
        state.error = action.payload as string;
      });

    // Fetch Active Commitment
    builder
      .addCase(fetchActiveCommitment.pending, (state) => {
        state.loading.commitments = true;
        state.error = null;
      })
      .addCase(fetchActiveCommitment.fulfilled, (state, action) => {
        state.loading.commitments = false;
        state.activeCommitment = action.payload;
      })
      .addCase(fetchActiveCommitment.rejected, (state, action) => {
        state.loading.commitments = false;
        state.error = action.payload as string;
      });

    // Report Relapse
    builder
      .addCase(reportRelapse.pending, (state) => {
        state.loading.commitments = true;
        state.error = null;
      })
      .addCase(reportRelapse.fulfilled, (state, action) => {
        state.loading.commitments = false;
        const index = state.commitments.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.commitments[index] = action.payload;
        }
        if (state.activeCommitment?.id === action.payload.id) {
          state.activeCommitment = action.payload;
        }
      })
      .addCase(reportRelapse.rejected, (state, action) => {
        state.loading.commitments = false;
        state.error = action.payload as string;
      });

    // Submit Proof
    builder
      .addCase(submitProof.pending, (state) => {
        state.loading.proof = true;
        state.error = null;
      })
      .addCase(submitProof.fulfilled, (state, action) => {
        state.loading.proof = false;
        state.currentProof = action.payload;
        state.proofHistory.unshift(action.payload);
      })
      .addCase(submitProof.rejected, (state, action) => {
        state.loading.proof = false;
        state.error = action.payload as string;
      });

    // Verify Proof
    builder
      .addCase(verifyProof.pending, (state) => {
        state.loading.proof = true;
        state.error = null;
      })
      .addCase(verifyProof.fulfilled, (state, action) => {
        state.loading.proof = false;
        if (state.currentProof?.id === action.payload.id) {
          state.currentProof = action.payload;
        }
      })
      .addCase(verifyProof.rejected, (state, action) => {
        state.loading.proof = false;
        state.error = action.payload as string;
      });

    // Fetch Available Actions
    builder
      .addCase(fetchAvailableActions.pending, (state) => {
        state.loading.actions = true;
        state.error = null;
      })
      .addCase(fetchAvailableActions.fulfilled, (state, action) => {
        state.loading.actions = false;
        state.availableActions = action.payload;
      })
      .addCase(fetchAvailableActions.rejected, (state, action) => {
        state.loading.actions = false;
        state.error = action.payload as string;
      });

    // Fetch Service Stats
    builder
      .addCase(fetchServiceStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchServiceStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.serviceStats = action.payload;
      })
      .addCase(fetchServiceStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload as string;
      });

    // Fetch Redemption Wall
    builder
      .addCase(fetchRedemptionWall.pending, (state) => {
        state.loading.redemption = true;
        state.error = null;
      })
      .addCase(fetchRedemptionWall.fulfilled, (state, action) => {
        state.loading.redemption = false;
        const { redemptions, pagination } = action.payload.data;
        
        if (pagination.nextOffset === 0 || pagination.nextOffset === 20) {
          // First page
          state.redemptionStories = redemptions;
        } else {
          // Append for pagination
          state.redemptionStories = [...state.redemptionStories, ...redemptions];
        }
        
        state.redemptionPagination = {
          total: pagination.total,
          hasMore: pagination.hasMore,
          currentPage: Math.floor(pagination.nextOffset / 20) || 1,
        };
      })
      .addCase(fetchRedemptionWall.rejected, (state, action) => {
        state.loading.redemption = false;
        state.error = action.payload as string;
      });

    // Encourage Redemption
    builder.addCase(encourageRedemption.fulfilled, (state, action) => {
      const story = state.redemptionStories.find((s) => s.id === action.payload);
      if (story) {
        story.stats.encouragements += 1;
      }
    });

    // Pay to Skip
    builder
      .addCase(payToSkip.pending, (state) => {
        state.loading.commitments = true;
        state.error = null;
      })
      .addCase(payToSkip.fulfilled, (state, action) => {
        state.loading.commitments = false;
        const index = state.commitments.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.commitments[index] = action.payload;
        }
        if (state.activeCommitment?.id === action.payload.id) {
          state.activeCommitment = action.payload;
        }
      })
      .addCase(payToSkip.rejected, (state, action) => {
        state.loading.commitments = false;
        state.error = action.payload as string;
      });

    // Accept Failure
    builder
      .addCase(acceptFailure.pending, (state) => {
        state.loading.commitments = true;
        state.error = null;
      })
      .addCase(acceptFailure.fulfilled, (state, action) => {
        state.loading.commitments = false;
        const index = state.commitments.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.commitments[index] = action.payload;
        }
        if (state.activeCommitment?.id === action.payload.id) {
          state.activeCommitment = null; // Clear active commitment
        }
      })
      .addCase(acceptFailure.rejected, (state, action) => {
        state.loading.commitments = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  selectCommitment,
  selectAction,
  setSelectedAction,
  setCommitmentFilters,
  setActionFilters,
  clearError,
  resetCommitments,
} = commitmentsSlice.actions;

// Export reducer
export default commitmentsSlice.reducer;
