/**
 * Invitation Redux Slice
 * 
 * This slice manages all invitation-related state in the application.
 * It handles invitation creation, sharing, processing, and hash management
 * for trusted partner connections.
 * 
 * Features:
 * - Invitation hash generation and management
 * - Deep link URL creation and processing
 * - Invitation sharing via social media
 * - Partner connection management
 * - Invitation status tracking
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import api from '../../services/api';

/**
 * User Type
 *
 * Represents a user involved in an invitation (sender, receiver, or partner).
 */
export interface PartnerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Sent Invite Type
 *
 * Represents an invitation sent by the authenticated user.
 */
export interface SentInvite {
  id: string;
  hash: string;
  receiver: PartnerUser | null;
  usedAt: string | null;
  createdAt: string;
}

/**
 * Received Invite Type
 *
 * Represents an invitation received by the authenticated user.
 */
export interface ReceivedInvite {
  id: string;
  hash: string;
  sender: PartnerUser | null;
  usedAt: string | null;
  createdAt: string;
}

/**
 * Partner Type
 *
 * Represents an established partnership.
 */
export interface Partner {
  id: string; // Invitation ID
  since: string;
  partner: PartnerUser | null;
}

/**
 * Invitation Interface
 * 
 * Defines the shape of an invitation object.
 * Contains all data needed to process and track invitations.
 */
export interface Invitation {
  id: string;
  hash: string; // Unique hash for the invitation link
  inviterUserId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail?: string; // Optional - set when invitation is sent to specific email
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  deepLinkUrl: string; // Full URL with hash that opens the app
  metadata?: {
    invitationType: 'accountability_partner';
    message?: string; // Optional custom message from inviter - REMOVED FOR NOW
  };
}

/**
 * Invitation State Interface
 * 
 * Defines the complete state shape for the invitation slice.
 * Includes invitation data, loading states, and error handling.
 */
interface InvitationState {
  // Current user's sent invitations
  sentInvitations: SentInvite[];
  
  // Invitations received by current user
  receivedInvitations: ReceivedInvite[];
  
  // Currently processing invitation (from deep link)
  processingInvitation: Invitation | null;
  
  // Connected partners from accepted invitations
  connectedPartners: Partner[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Deep link processing state
  isProcessingDeepLink: boolean;
  
  // Share modal state
  shareModalVisible: boolean;
  invitationToShare: Invitation | null;
}

/**
 * Initial State
 * 
 * Default state values when the app starts.
 * Most arrays are empty until invitations are loaded.
 */
const initialState: InvitationState = {
  sentInvitations: [],
  receivedInvitations: [],
  processingInvitation: null,
  connectedPartners: [],
  loading: false,
  error: null,
  isProcessingDeepLink: false,
  shareModalVisible: false,
  invitationToShare: null,
};

/**
 * Async Thunks
 * 
 * These handle asynchronous operations like API calls and hash generation.
 * They automatically dispatch pending/fulfilled/rejected actions.
 */

/**
 * Fetch Sent Invites Thunk
 *
 * Fetches all invitations sent by the authenticated user.
 */
export const fetchSentInvites = createAsyncThunk(
  'invitation/fetchSentInvites',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/invites/sent');
      return data.items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sent invites.');
    }
  }
);

/**
 * Fetch Received Invites Thunk
 *
 * Fetches all invitations received by the authenticated user.
 */
export const fetchReceivedInvites = createAsyncThunk(
  'invitation/fetchReceivedInvites',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/invites/received');
      return data.items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch received invites.');
    }
  }
);

/**
 * Fetch Partners Thunk
 *
 * Fetches all established partners for the authenticated user.
 */
export const fetchPartners = createAsyncThunk(
  'invitation/fetchPartners',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/partners');
      return data.items;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch partners.');
    }
  }
);

/**
 * Revoke Invitation Thunk
 *
 * Revokes an invitation by its ID.
 */
export const revokeInvite = createAsyncThunk(
  'invitation/revokeInvite',
  async (invitationId: string, { rejectWithValue }) => {
    try {
      await api.post(`/invites/invitations/${invitationId}/revoke`);
      return invitationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to revoke invitation.');
    }
  }
);

/**
 * Create Invitation After Authentication
 *
 * Saves the generated invitation hash to the backend.
 */
export const createInviteAfterAuth = createAsyncThunk(
  'invitation/createAfterAuth',
  async (hash: string, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post('/invites/invitations', { hash });
      // Refresh invitation data after successfully creating an invite
      dispatch(loadInvitationData());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save invitation hash.');
    }
  }
);

/**
 * Generate Invitation Hash
 * 
 * Creates a secure hash for invitation links.
 * Uses timestamp and random values for uniqueness.
 */
const generateInvitationHash = (): string => {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 15);
  const userHash = Math.random().toString(36).substring(2, 10);
  
  // Combine timestamp, random string, and user hash for uniqueness
  const combinedString = `${timestamp}-${randomString}-${userHash}`;
  
  // Simple hash function (in production, use crypto library)
  let hash = 0;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string and add prefix
  return `ph_${Math.abs(hash).toString(16)}${randomString}`;
};

/**
 * Create Invitation Thunk
 * 
 * Creates a new invitation with hash and deep link URL.
 * This is called when user wants to invite someone.
 */
export const createInvitation = createAsyncThunk(
  'invitation/create',
  async (
    invitationData: { inviterName: string; inviterEmail: string; inviterUserId: string; customHash?: string },
    { rejectWithValue }
  ) => {
    try {
      // Generate or use provided custom hash
      const custom = invitationData.customHash?.trim();
      const isValidCustom = !!custom && /^ph_[a-z0-9]+$/i.test(custom) && custom.length >= 10;
      const hash = isValidCustom ? (custom as string) : generateInvitationHash();
      const invitation: Invitation = {
        id: `inv_${Date.now()}`,
        hash,
        inviterUserId: invitationData.inviterUserId,
        inviterName: invitationData.inviterName,
        inviterEmail: invitationData.inviterEmail,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending',
        deepLinkUrl: `pureheart://invite/${hash}`,
        metadata: {
          invitationType: 'accountability_partner',
        },
      };
      await AsyncStorage.setItem('init_sent_accountability_id', hash);
      return invitation;
    } catch (error) {
      return rejectWithValue('Failed to create invitation. Please try again.');
    }
  }
);

export const matchInstall = createAsyncThunk(
  'invitation/matchInstall',
  async (deviceInfo: { os: string; osVersion: string; deviceModel: string }, { rejectWithValue }) => {
    try {
      // Create a more comprehensive device fingerprint
      const userAgent = `${deviceInfo.deviceModel}; ${deviceInfo.os} ${deviceInfo.osVersion}`;
      
      // Get additional device info for better matching
      const screenDimensions = {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        scale: Dimensions.get('window').scale,
      };
      
      const { data } = await api.post('/invites/invitations/match-install', {
        deviceFingerprint: {
          userAgent: userAgent,
          os: deviceInfo.os,
          osVersion: deviceInfo.osVersion,
          deviceModel: deviceInfo.deviceModel,
          screenDimensions: screenDimensions,
          timezone: new Date().getTimezoneOffset(),
          locale: 'en-US', // You can use DeviceInfo.getDeviceLocale() if available in your version
          // Add app install time if available
          firstInstallTime: await DeviceInfo.getFirstInstallTime(),
        },
      });
      
      return data; // Expected: { inviteId: string | null, matchConfidence: number }
    } catch (error: any) {
      console.error('Error matching install:', error);
      return rejectWithValue('Failed to match installation.');
    }
  }
);

/**
 * Process Deep Link Invitation Thunk
 * 
 * Processes an invitation when app is opened via deep link.
 * Extracts hash from URL and finds matching invitation.
 */
export const processDeepLinkInvitation = createAsyncThunk(
  'invitation/processDeepLink',
  async (hash: string, { rejectWithValue }) => {
    try {
      // Simulate API call to fetch invitation by hash
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, make API call to backend to fetch invitation
      // For now, we'll simulate finding the invitation
      
      // Mock invitation data (in real app, this comes from API)
      const mockInvitation: Invitation = {
        id: `inv_${Date.now()}`,
        hash,
        inviterUserId: 'user123',
        inviterName: 'John Doe',
        inviterEmail: 'john@example.com',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        status: 'pending',
        deepLinkUrl: `pureheart://invite/${hash}`,
        metadata: {
          invitationType: 'accountability_partner',
          message: 'Would love to have you as my accountability partner!',
        },
      };
      
      // Check if invitation is valid and not expired
      const now = new Date();
      const expiresAt = new Date(mockInvitation.expiresAt);
      
      if (now > expiresAt) {
        return rejectWithValue('This invitation has expired.');
      }
      
      if (mockInvitation.status !== 'pending') {
        return rejectWithValue('This invitation is no longer valid.');
      }
      
      return mockInvitation;
    } catch (error) {
      return rejectWithValue('Failed to process invitation. Please check the link and try again.');
    }
  }
);

/**
 * Accept Invitation Thunk
 * 
 * Accepts an invitation and creates a partner connection.
 */
export const acceptInvitation = createAsyncThunk(
  'invitation/accept',
  async (hash: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/invites/invitations/${hash}/accept`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation.');
    }
  }
);

/**
 * Accept Invitation By Code Thunk
 *
 * Uses the new endpoint to accept a partner invitation by code.
 */
export const acceptByCode = createAsyncThunk(
  'invitation/acceptByCode',
  async (code: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/invites/accept-by-code`, { code });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation.');
    }
  }
);

/**
 * Send Invites By Email Thunk
 *
 * Sends invitation emails for one or more addresses with an optional custom code.
 */
export const sendInvitesByEmail = createAsyncThunk(
  'invitation/sendByEmail',
  async (
    payload: { emails: string[]; hash?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(`/invites/send-by-email`, payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invitations.');
    }
  }
);

/**
 * Load All Invitation Data
 *
 * Loads all invitation-related data for the current user from the API.
 */
export const loadInvitationData = createAsyncThunk(
  'invitation/loadInvitationData',
  async (_, { rejectWithValue }) => {
    try {
      const [sent, received, partners] = await Promise.all([
        api.get('/invites/sent'),
        api.get('/invites/received'),
        api.get('/partners'),
      ]);
      return {
        sentInvites: sent.data.items,
        receivedInvites: received.data.items,
        partners: partners.data.items,
      };
    } catch (error: any) {
      return rejectWithValue('Failed to load invitation data.');
    }
  }
);


/**
 * Invitation Slice
 * 
 * Creates the Redux slice with reducers and actions.
 * Handles both synchronous and asynchronous state updates.
 */
const invitationSlice = createSlice({
  name: 'invitation',
  initialState,
  reducers: {
    /**
     * Clear Error
     * 
     * Clears any error messages from the invitation state.
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Show Share Modal
     * 
     * Shows the share modal for a specific invitation.
     */
    showShareModal: (state, action: PayloadAction<Invitation>) => {
      state.shareModalVisible = true;
      state.invitationToShare = action.payload;
    },

    /**
     * Hide Share Modal
     * 
     * Hides the share modal and clears the invitation to share.
     */
    hideShareModal: (state) => {
      state.shareModalVisible = false;
      state.invitationToShare = null;
    },

    /**
     * Clear Processing Invitation
     * 
     * Clears the currently processing invitation (from deep link).
     */
    clearProcessingInvitation: (state) => {
      state.processingInvitation = null;
      state.isProcessingDeepLink = false;
    },

    /**
     * Remove Partner
     * 
     * Removes a connected partner.
     */
    removePartner: (state, action: PayloadAction<string>) => {
      const partnerId = action.payload;
      state.connectedPartners = state.connectedPartners.filter(
        (p) => p.partner?.id !== partnerId
      );
    },
  },
  extraReducers: (builder) => {
    // Create Invitation Cases
    builder
      .addCase(createInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Process Deep Link Invitation Cases
    builder
      .addCase(processDeepLinkInvitation.pending, (state) => {
        state.isProcessingDeepLink = true;
        state.error = null;
      })
      .addCase(processDeepLinkInvitation.fulfilled, (state, action) => {
        state.isProcessingDeepLink = false;
        state.processingInvitation = action.payload;
        state.error = null;
      })
      .addCase(processDeepLinkInvitation.rejected, (state, action) => {
        state.isProcessingDeepLink = false;
        state.error = action.payload as string;
      });

    // Accept Invitation Cases
    builder
      .addCase(acceptInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.loading = false;
        const acceptedInvite = action.payload;

        // Add new partner to connected partners
        if (acceptedInvite && acceptedInvite.sender) {
          const newPartner: Partner = {
            id: acceptedInvite.id,
            since: acceptedInvite.usedAt,
            partner: acceptedInvite.sender,
          };
          state.connectedPartners.push(newPartner);
        }

        // Remove from received invitations
        if (acceptedInvite) {
          state.receivedInvitations = state.receivedInvitations.filter(
            (inv) => inv.hash !== acceptedInvite.hash
          );
        }

        // Clear processing invitation
        state.processingInvitation = null;
        state.isProcessingDeepLink = false;
        state.error = null;
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Accept By Code Cases
    builder
      .addCase(acceptByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptByCode.fulfilled, (state, action) => {
        state.loading = false;
        const acceptedInvite = action.payload;

        if (acceptedInvite && acceptedInvite.sender) {
          const newPartner: Partner = {
            id: acceptedInvite.id,
            since: acceptedInvite.usedAt,
            partner: acceptedInvite.sender,
          };
          state.connectedPartners.push(newPartner);
        }
        state.error = null;
      })
      .addCase(acceptByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Send Invites By Email Cases
    builder
      .addCase(sendInvitesByEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInvitesByEmail.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(sendInvitesByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Match Install Cases
    builder
      .addCase(matchInstall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(matchInstall.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Match install check completed.', action.payload);
      })
      .addCase(matchInstall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Match install failed:', action.payload);
      });

    // Load Invitation Data Cases
    builder
      .addCase(loadInvitationData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInvitationData.fulfilled, (state, action) => {
        state.loading = false;
        state.sentInvitations = action.payload.sentInvites;
        state.receivedInvitations = action.payload.receivedInvites;
        state.connectedPartners = action.payload.partners;
        state.error = null;
      })
      .addCase(loadInvitationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Revoke Invitation Cases
    builder
      .addCase(revokeInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(revokeInvite.fulfilled, (state, action) => {
        state.loading = false;
        state.sentInvitations = state.sentInvitations.filter(
          (inv) => inv.id !== action.payload
        );
        state.error = null;
      })
      .addCase(revokeInvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      
    // Create Invitation After Auth Cases
    builder
      .addCase(createInviteAfterAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInviteAfterAuth.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally, you can add the newly saved invitation to the state
        // For now, we'll rely on the next fetch to get the updated list
      })
      .addCase(createInviteAfterAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Partners Cases
    builder
      .addCase(fetchPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action: PayloadAction<Partner[]>) => {
        state.loading = false;
        state.connectedPartners = action.payload;
        state.error = null;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions for use in components
export const {
  clearError,
  showShareModal,
  hideShareModal,
  clearProcessingInvitation,
  removePartner,
} = invitationSlice.actions;

// Export reducer for store configuration
export default invitationSlice.reducer;
