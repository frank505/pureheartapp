import api from './api';

export type Feeling =
  | 'anxious'
  | 'stressed'
  | 'sad'
  | 'lonely'
  | 'ashamed'
  | 'angry'
  | 'tempted'
  | 'grateful'
  | 'hopeful'
  | 'tired'
  | 'overwhelmed'
  | 'fearful'
  | 'grieving'
  | 'joyful'
  | 'numb'
  | 'discouraged';

export interface BreathingPattern {
  inhale: number; // seconds
  hold: number; // seconds
  exhale: number; // seconds
  rest?: number; // seconds
}

export interface OverlayStep {
  phase: 'inhale' | 'hold' | 'exhale' | 'rest';
  seconds: number;
  text: string;
}

export interface BreatheAnalysisResult {
  feeling: Feeling;
  sentiment: 'negative' | 'neutral' | 'positive';
  confidence: number; // 0..1
  summary: string;
  keywords: string[];
  affirmations: string[];
  breathing: BreathingPattern;
  overlays: OverlayStep[]; // for the requested number of cycles
  textAndScriptures: string[]; // ordered list of short supportive lines and scripture lines
  asmrTips: string[]; // optional client hints
  asmrAudioUrl?: string | undefined; // selected 1-min audio clip URL
  asmrAudioName?: string | undefined; // filename or friendly title
}

export interface AnalyzeBreathePayload {
  text: string;
  cycles?: number;
  bibleVersion?: string;
}

export async function analyzeBreathe(payload: AnalyzeBreathePayload): Promise<BreatheAnalysisResult> {
  const { data } = await api.post('/breathe/analyze', payload);
  // Endpoint wraps result as { success, message, statusCode, data }
  return (data?.data ?? data) as BreatheAnalysisResult;
}

export default { analyzeBreathe };
