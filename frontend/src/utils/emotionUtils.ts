import { Emotion, EmotionDetectionResult } from '../types';

// Color schemes for different emotions
export const emotionColors: Record<Emotion, { primary: string, secondary: string, background: string }> = {
  happy: {
    primary: '#FFD700', // Gold
    secondary: '#FFA500', // Orange
    background: 'from-yellow-400 to-orange-500'
  },
  sad: {
    primary: '#1E90FF', // Dodger Blue
    secondary: '#4682B4', // Steel Blue
    background: 'from-blue-500 to-indigo-700'
  },
  angry: {
    primary: '#FF4500', // Red Orange
    secondary: '#B22222', // Fire Brick
    background: 'from-red-600 to-red-800'
  },
  surprised: {
    primary: '#DA70D6', // Orchid
    secondary: '#9370DB', // Medium Purple
    background: 'from-purple-500 to-pink-500'
  },
  neutral: {
    primary: '#3CB371', // Medium Sea Green
    secondary: '#2E8B57', // Sea Green
    background: 'from-green-500 to-teal-600'
  }
};

// Emotion emojis
export const emotionEmojis: Record<Emotion, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  neutral: '😐'
};

// Smooth emotion transitions to prevent rapid switching
let lastEmotionTimestamp = 0;
let lastDetectedEmotion: Emotion = 'neutral';
const EMOTION_CHANGE_THRESHOLD_MS = 3000; // 3 seconds

export const smoothEmotionTransition = (detectionResult: EmotionDetectionResult): Emotion => {
  const currentTime = Date.now();
  
  // If enough time has passed since the last emotion change, update the emotion
  if (currentTime - lastEmotionTimestamp > EMOTION_CHANGE_THRESHOLD_MS) {
    if (detectionResult.emotion !== lastDetectedEmotion) {
      lastEmotionTimestamp = currentTime;
      lastDetectedEmotion = detectionResult.emotion;
    }
  }
  
  return lastDetectedEmotion;
};

// Get a friendly message based on the emotion
export const getEmotionMessage = (emotion: Emotion): string => {
  switch (emotion) {
    case 'happy':
      return 'You seem happy! Enjoy these uplifting tracks.';
    case 'sad':
      return 'Feeling blue? These songs might resonate with you.';
    case 'angry':
      return 'Channeling that energy with some powerful music.';
    case 'surprised':
      return 'Surprised? Here\'s something unexpected!';
    case 'neutral':
      return 'Balanced and calm. Enjoy these relaxing tunes.';
    default:
      return 'Selecting music based on your mood...';
  }
};