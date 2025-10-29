export type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';

export interface Track {
  id: string;
  title: string;
  artist: string;
  emotion: Emotion;
  path: string;
  cover: string;
}

export interface EmotionDetectionResult {
  emotion: Emotion;
  confidence: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffle: boolean;
}