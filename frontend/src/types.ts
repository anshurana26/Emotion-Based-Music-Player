export type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';

export interface Track {
  id: string;
  title: string;
  artist: string;
  emotion: Emotion;
  path: string;
  cover: string;
  language?: string; // Language code: "en", "hi", "pa", etc.
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

export interface ListeningHistoryEntry {
  trackId: string;
  title: string;
  artist: string;
  emotion: Emotion;
  playedAt: string;
  duration: number;
  completed: boolean;
}

export interface UserPreferences {
  genres: string[];
  volume: number;
  autoPlay: boolean;
  language: string;
  autoVolume?: boolean;
}

export interface EmotionStats {
  emotionCounts: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
  };
  timelineData: Array<{
    date: string;
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
  }>;
  total: number;
}