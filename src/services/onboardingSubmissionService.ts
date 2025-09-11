import api from './api';

export interface OnboardingSubmissionPayload {
  personalInfo: any;
  assessmentData: any;
  additionalAssessmentData: any;
  faithData: any;
  howTheyHeard: any;
  accountabilityPreferences: any;
  recoveryJourneyData: any;
  dependencyAssessment?: any;
  clientMeta: { submittedAt: string; appVersion?: string };
}

export interface OnboardingSubmissionResponse {
  success: boolean;
  userId?: string;
  message?: string;
}

export async function submitOnboarding(payload: OnboardingSubmissionPayload): Promise<OnboardingSubmissionResponse> {
  // Endpoint assumed; adjust to actual backend path if different.
  const { data } = await api.post('/onboarding/complete', payload);
  return data?.data ?? data ?? { success: true };
}

export default { submitOnboarding };
