/**
 * Onboarding Redux Slice
 * 
 * This slice manages onboarding data collection and persistence.
 * It saves user onboarding progress to AsyncStorage so data isn't lost
 * if the user exits the onboarding flow before completion.
 * 
 * Features:
 * - Personal information storage
 * - Assessment data storage  
 * - Faith background data storage
 * - Accountability preferences storage
 * - Progress tracking
 * - Data persistence via Redux Persist
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Personal Information Interface
 * 
 * Data collected in Onboarding4Screen
 */
export interface PersonalInfo {
  firstName: string;
  email: string;
  gender: string;
  ageRange: string;
  lifeSeason: string;
}

/**
 * Assessment Question Interface
 * 
 * Individual assessment question data structure
 */
export interface AssessmentQuestion {
  id: string;
  question: string;
  currentAnswer: string;
  icon: string;
  type: 'text' | 'options';
  options?: { label: string; value: string }[];
}

/**
 * Assessment Data Interface
 * 
 * Data collected in Onboarding5Screen
 */
export interface AssessmentData {
  questions: AssessmentQuestion[];
  completedAt?: string;
}

/**
 * Faith Data Interface
 * 
 * Data collected in Onboarding6Screen
 */
export interface FaithData {
  relationshipWithJesus: string;
  churchInvolvement: string;
  prayerFrequency: string;
  christianInfluences: string;
  bibleTranslation: string;
  spiritualStruggle: string;
  completedAt?: string;
}

/**
 * How They Heard About Us Interface
 * 
 * Data collected in Onboarding9Screen
 */
export interface HowTheyHeard {
  source: string;
  completedAt?: string;
}

/**
 * Additional Assessment Data Interface
 * 
 * Data for additional sensitive questions
 */
export interface AdditionalAssessmentData {
  ageFirstEncounteredPornography?: string;
  maritalStatus?: string;
  arousalDifficulty?: string; // for married users only
  hasSpentMoneyOnExplicitContent?: string;
  completedAt?: string;
}

/**
 * Accountability Preferences Interface
 * 
 * Data collected in Onboarding7Screen
 */
export interface AccountabilityPreferences {
  preferredType: 'partner' | 'group' | 'trusted-person' | 'solo' | 'ai-accountability' | null;
  hasSelectedOption: boolean;
  // When inviting a trusted partner during onboarding, we generate a unique URL hash
  // for the invitation link. Persist it here so it can be sent to the backend
  // alongside other onboarding data during social login (Google/Apple).
  invitationHash?: string;
  completedAt?: string;
}

/**
 * Recovery Journey Data Interface
 * 
 * Data collected in Onboarding8Screen
 */
export interface RecoveryJourneyData {
  recoveryGoal: string;
  recoveryMotivation: string;
  hasSoughtHelpBefore: string;
  previousHelpDescription: string;
  completedAt?: string;
}

/**
 * Onboarding Progress Interface
 * 
 * Tracks which screens have been completed
 */
export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  lastUpdated: string;
}

/**
 * Complete Onboarding State Interface
 * 
 * Defines the complete state shape for onboarding data.
 */
export interface OnboardingState {
  personalInfo: Partial<PersonalInfo>;
  assessmentData: Partial<AssessmentData>;
  additionalAssessmentData: Partial<AdditionalAssessmentData>;
  faithData: Partial<FaithData>;
  howTheyHeard: Partial<HowTheyHeard>;
  accountabilityPreferences: Partial<AccountabilityPreferences>;
  recoveryJourneyData: Partial<RecoveryJourneyData>; // Add this line
  progress: OnboardingProgress;
  isDataSaved: boolean;
  lastSaveTime: string | null;
}

/**
 * Initial State
 * 
 * Default state values when the app starts or onboarding is reset.
 */
const initialState: OnboardingState = {
  personalInfo: {},
  assessmentData: {},
  additionalAssessmentData: {},
  faithData: {},
  howTheyHeard: {},
  accountabilityPreferences: {},
  recoveryJourneyData: {},
  progress: {
    currentStep: 1,
    completedSteps: [],
    lastUpdated: '',
  },
  isDataSaved: false,
  lastSaveTime: null,
};

/**
 * Onboarding Slice
 * 
 * Creates the Redux slice for onboarding data management.
 */
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    /**
     * Save Personal Info
     * 
     * Saves personal information collected in Onboarding4Screen.
     * This includes name, email, age range, life season, and password.
     */
    savePersonalInfo: (state, action: PayloadAction<Partial<PersonalInfo>>) => {
      state.personalInfo = {
        ...state.personalInfo,
        ...action.payload,
      };
      
      // Update progress tracking
      if (!state.progress.completedSteps.includes(4)) {
        state.progress.completedSteps.push(4);
      }
      state.progress.currentStep = Math.max(state.progress.currentStep, 5);
      state.progress.lastUpdated = new Date().toISOString();
      
      // Mark data as saved
      state.isDataSaved = true;
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Save Assessment Data
     * 
     * Saves assessment responses collected in Onboarding5Screen.
     * This includes all the assessment questions and their answers.
     */
    saveAssessmentData: (state, action: PayloadAction<Partial<AssessmentData>>) => {
      state.assessmentData = {
        ...state.assessmentData,
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
      
      // Update progress tracking
      if (!state.progress.completedSteps.includes(5)) {
        state.progress.completedSteps.push(5);
      }
      state.progress.currentStep = Math.max(state.progress.currentStep, 6);
      state.progress.lastUpdated = new Date().toISOString();
      
      // Mark data as saved
      state.isDataSaved = true;
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Save Faith Data
     * 
     * Saves faith background information collected in Onboarding6Screen.
     * This includes relationship with Jesus, church involvement, etc.
     */
    saveFaithData: (state, action: PayloadAction<Partial<FaithData>>) => {
      state.faithData = {
        ...state.faithData,
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
      
      // Update progress tracking
      if (!state.progress.completedSteps.includes(6)) {
        state.progress.completedSteps.push(6);
      }
      state.progress.currentStep = Math.max(state.progress.currentStep, 9);
      state.progress.lastUpdated = new Date().toISOString();
      
      // Mark data as saved
      state.isDataSaved = true;
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Save Accountability Preferences
     * 
     * Saves accountability setup preferences from Onboarding7Screen.
     * This includes preferred accountability type and selection status.
     */
    saveAccountabilityPreferences: (state, action: PayloadAction<Partial<AccountabilityPreferences>>) => {
      state.accountabilityPreferences = {
        ...state.accountabilityPreferences,
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
      
      // Update progress tracking
      if (!state.progress.completedSteps.includes(9)) {
        state.progress.completedSteps.push(9);
      }
      state.progress.currentStep = Math.max(state.progress.currentStep, 10);
      state.progress.lastUpdated = new Date().toISOString();
      
      // Mark data as saved
      state.isDataSaved = true;
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Save How They Heard Data
     * 
     * Saves information about how the user discovered the app.
     * This is used for marketing analytics and outreach.
     */
    saveHowTheyHeardData: (state, action: PayloadAction<Partial<HowTheyHeard>>) => {
      state.howTheyHeard = {
        ...state.howTheyHeard,
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
      
      // Mark data as saved
      state.isDataSaved = true;
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Save Additional Assessment Data
     * 
     * Saves additional sensitive assessment questions.
     * This includes age-related questions and marital status data.
     */
    saveAdditionalAssessmentData: (state, action: PayloadAction<Partial<AdditionalAssessmentData>>) => {
      state.additionalAssessmentData = {
        ...state.additionalAssessmentData,
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
      
      // Mark data as saved
      state.isDataSaved = true;
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Save Recovery Journey Data
     * 
     * Saves recovery journey information collected in Onboarding8Screen.
     */
    saveRecoveryJourneyData: (state, action: PayloadAction<Partial<RecoveryJourneyData>>) => {
      state.recoveryJourneyData = {
        ...state.recoveryJourneyData,
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
      
      // Update progress tracking
      if (!state.progress.completedSteps.includes(8)) {
        state.progress.completedSteps.push(8);
      }
      state.progress.currentStep = Math.max(state.progress.currentStep, 9);
      state.progress.lastUpdated = new Date().toISOString();
      
      // Mark data as saved
      state.isDataSaved = true;
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Update Progress
     * 
     * Updates the onboarding progress tracking.
     * Useful for tracking which screen the user is currently on.
     */
    updateProgress: (state, action: PayloadAction<Partial<OnboardingProgress>>) => {
      state.progress = {
        ...state.progress,
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
    },

    /**
     * Clear Onboarding Data
     * 
     * Resets all onboarding data to initial state.
     * Useful when user wants to start onboarding fresh or after completion.
     */
    clearOnboardingData: (state) => {
      return initialState;
    },

    /**
     * Reset Progress
     * 
     * Resets only progress tracking while keeping saved data.
     * Useful if user wants to review/edit their onboarding responses.
     */
    resetProgress: (state) => {
      state.progress = {
        currentStep: 1,
        completedSteps: [],
        lastUpdated: new Date().toISOString(),
      };
    },

    /**
     * Mark Data as Transferred
     * 
     * Called when onboarding data has been successfully transferred
     * to the main user profile after authentication.
     */
    markDataAsTransferred: (state) => {
      state.isDataSaved = false;
      // Keep the data but mark it as transferred
      // Data will be cleared after successful account creation
    },

    /**
     * Save Partial Personal Info
     * 
     * Allows saving partial personal info for incremental updates.
     * Useful for auto-saving as user types.
     */
    savePartialPersonalInfo: (state, action: PayloadAction<Partial<PersonalInfo>>) => {
      state.personalInfo = {
        ...state.personalInfo,
        ...action.payload,
      };
      
      // Update last save time but don't mark as completed step
      state.lastSaveTime = new Date().toISOString();
    },

    /**
     * Set Current Step
     * 
     * Sets the current onboarding step.
     * Useful for navigation and progress tracking.
     */
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.progress.currentStep = action.payload;
      state.progress.lastUpdated = new Date().toISOString();
    },
  },
});

// Export actions for use in components
export const {
  savePersonalInfo,
  saveAssessmentData,
  saveFaithData,
  saveAccountabilityPreferences,
  saveHowTheyHeardData,
  saveAdditionalAssessmentData,
  saveRecoveryJourneyData,
  updateProgress,
  clearOnboardingData,
  resetProgress,
  markDataAsTransferred,
  savePartialPersonalInfo,
  setCurrentStep,
} = onboardingSlice.actions;

// Export reducer for store configuration
export default onboardingSlice.reducer;

/**
 * Selector Functions
 * 
 * Helper functions to easily access specific parts of onboarding state.
 * These can be used with useSelector hook in components.
 */

// Get all onboarding data in a format ready for API submission
export const getCompleteOnboardingData = (state: { onboarding: OnboardingState }) => ({
  personalInfo: state.onboarding.personalInfo,
  assessmentData: state.onboarding.assessmentData,
  faithData: state.onboarding.faithData,
  accountabilityPreferences: state.onboarding.accountabilityPreferences,
  progress: state.onboarding.progress,
});

// Check if specific onboarding step is completed
export const isStepCompleted = (stepNumber: number) => (state: { onboarding: OnboardingState }) => {
  return state.onboarding.progress.completedSteps.includes(stepNumber);
};

// Check if onboarding data exists (for restoration)
export const hasOnboardingData = (state: { onboarding: OnboardingState }) => {
  return state.onboarding.isDataSaved || 
         Object.keys(state.onboarding.personalInfo).length > 0 ||
         Object.keys(state.onboarding.assessmentData).length > 0 ||
         Object.keys(state.onboarding.faithData).length > 0 ||
         Object.keys(state.onboarding.accountabilityPreferences).length > 0;
};

// Get onboarding completion percentage
export const getOnboardingCompletionPercentage = (state: { onboarding: OnboardingState }) => {
  const totalSteps = 9; // Onboarding steps 1-9
  const completedSteps = state.onboarding.progress.completedSteps.length;
  return Math.round((completedSteps / totalSteps) * 100);
};
