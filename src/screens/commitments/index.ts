/**
 * Commitments Screens Index
 * 
 * Central export file for all commitment-related screens.
 * Makes it easier to import screens in navigation.
 */

// Core Flow Screens (Phases 1-3)
export { default as ChooseCommitmentTypeScreen } from './ChooseCommitmentTypeScreen';
export { default as BrowseActionsScreen } from './BrowseActionsScreen';
export { default as ActionDetailsScreen } from './ActionDetailsScreen';
export { default as SetTargetDateScreen } from './SetTargetDateScreen';
export { default as ReviewCommitmentScreen } from './ReviewCommitmentScreen';
export { default as CommitmentSuccessScreen } from './CommitmentSuccessScreen';
export { default as ActiveCommitmentDashboardScreen } from './ActiveCommitmentDashboardScreen';

// Relapse & Proof Screens (Phase 4)
export { default as ActionPendingScreen } from './ActionPendingScreen';
export { default as UploadProofScreen } from './UploadProofScreen';
export { default as ProofSubmittedScreen } from './ProofSubmittedScreen';
export { default as PartnerVerificationScreen } from './PartnerVerificationScreen';

// Alternative Paths
export { default as DeadlineMissedScreen } from './DeadlineMissedScreen';
export { default as CreateCustomActionScreen } from './CreateCustomActionScreen';
export { default as SetFinancialAmountScreen } from './SetFinancialAmountScreen';

export { default as SetHybridCommitmentScreen } from './SetHybridCommitmentScreen';

// TODO: Create these remaining screens
// export { default as ServiceStatsScreen } from './ServiceStatsScreen';
// export { default as RedemptionWallScreen } from './RedemptionWallScreen';
