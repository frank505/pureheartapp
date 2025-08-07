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
    invitationType: 'accountability_partner' | 'trusted_contact' | 'prayer_partner';
    message?: string; // Optional custom message from inviter
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
  sentInvitations: Invitation[];
  
  // Invitations received by current user
  receivedInvitations: Invitation[];
  
  // Currently processing invitation (from deep link)
  processingInvitation: Invitation | null;
  
  // Connected partners from accepted invitations
  connectedPartners: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    connectionType: 'accountability_partner' | 'trusted_contact' | 'prayer_partner';
    connectedAt: string;
    isActive: boolean;
  }[];
  
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
    invitationData: {
      inviterName: string;
      inviterEmail: string;
      inviterUserId: string;
      invitationType: 'accountability_partner' | 'trusted_contact' | 'prayer_partner';
      customMessage?: string;
      inviteeEmail?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate unique hash for this invitation
      const hash = generateInvitationHash();
      
      // Create deep link URL (replace with your actual app scheme)
      const deepLinkUrl = `pureheart://invite/${hash}`;
      
      // Create invitation object
      const invitation: Invitation = {
        id: `inv_${Date.now()}`,
        hash,
        inviterUserId: invitationData.inviterUserId,
        inviterName: invitationData.inviterName,
        inviterEmail: invitationData.inviterEmail,
        inviteeEmail: invitationData.inviteeEmail,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending',
        deepLinkUrl,
        metadata: {
          invitationType: invitationData.invitationType,
          message: invitationData.customMessage,
        },
      };
      
      // Store invitation locally (in real app, send to backend)
      const storedInvitations = await AsyncStorage.getItem('sent_invitations');
      const currentInvitations = storedInvitations ? JSON.parse(storedInvitations) : [];
      currentInvitations.push(invitation);
      await AsyncStorage.setItem('sent_invitations', JSON.stringify(currentInvitations));
      
      return invitation;
    } catch (error) {
      return rejectWithValue('Failed to create invitation. Please try again.');
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
  async (
    { invitationId, userInfo }: { 
      invitationId: string; 
      userInfo: { id: string; name: string; email: string; avatar?: string } 
    },
    { getState, rejectWithValue }
  ) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, make API call to accept invitation and create partnership
      
      // Get the invitation to determine connection type
      const state = getState() as any;
      const invitation = state.invitation.processingInvitation;
      
      // Map invitation type to connection type
      let connectionType: 'accountability_partner' | 'trusted_contact' | 'prayer_partner' = 'accountability_partner';
      if (invitation?.metadata?.invitationType) {
        connectionType = invitation.metadata.invitationType;
      }
      
      return {
        invitationId,
        partner: {
          id: 'partner123',
          name: invitation?.inviterName || 'John Doe',
          email: invitation?.inviterEmail || 'john@example.com',
          avatar: undefined,
          connectionType,
          connectedAt: new Date().toISOString(),
          isActive: true,
        },
      };
    } catch (error) {
      return rejectWithValue('Failed to accept invitation. Please try again.');
    }
  }
);

/**
 * Load User Invitations Thunk
 * 
 * Loads both sent and received invitations for the current user.
 */
export const loadUserInvitations = createAsyncThunk(
  'invitation/loadUserInvitations',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Load sent invitations from local storage
      const storedSentInvitations = await AsyncStorage.getItem('sent_invitations');
      const sentInvitations = storedSentInvitations ? JSON.parse(storedSentInvitations) : [];
      
      // In real app, also fetch received invitations from API
      const receivedInvitations: Invitation[] = [];
      
      // Load connected partners from local storage
      const storedPartners = await AsyncStorage.getItem('connected_partners');
      const connectedPartners = storedPartners ? JSON.parse(storedPartners) : [];
      
      return {
        sentInvitations,
        receivedInvitations,
        connectedPartners,
      };
    } catch (error) {
      return rejectWithValue('Failed to load invitations.');
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
     * Revoke Invitation
     * 
     * Marks an invitation as revoked (cancels it).
     */
    revokeInvitation: (state, action: PayloadAction<string>) => {
      const invitationId = action.payload;
      const invitation = state.sentInvitations.find(inv => inv.id === invitationId);
      if (invitation) {
        invitation.status = 'revoked';
      }
    },

    /**
     * Remove Partner
     * 
     * Removes a connected partner.
     */
    removePartner: (state, action: PayloadAction<string>) => {
      const partnerId = action.payload;
      state.connectedPartners = state.connectedPartners.filter(
        partner => partner.id !== partnerId
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
      .addCase(createInvitation.fulfilled, (state, action) => {
        state.loading = false;
        state.sentInvitations.push(action.payload);
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
        
        // Add new partner to connected partners
        state.connectedPartners.push(action.payload.partner);
        
        // Mark invitation as accepted if it's in processing
        if (state.processingInvitation?.id === action.payload.invitationId) {
          state.processingInvitation.status = 'accepted';
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

    // Load User Invitations Cases
    builder
      .addCase(loadUserInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.sentInvitations = action.payload.sentInvitations;
        state.receivedInvitations = action.payload.receivedInvitations;
        state.connectedPartners = action.payload.connectedPartners;
        state.error = null;
      })
      .addCase(loadUserInvitations.rejected, (state, action) => {
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
  revokeInvitation,
  removePartner,
} = invitationSlice.actions;

// Export reducer for store configuration
export default invitationSlice.reducer;
