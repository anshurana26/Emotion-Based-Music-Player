import { Emotion, Track } from '../types';
import musicData from '../data/musicData';

// Keep track of played tracks to avoid repetition
const playedTracks: Record<Emotion, Set<string>> = {
  happy: new Set(),
  sad: new Set(),
  angry: new Set(),
  surprised: new Set(),
  neutral: new Set()
};

/**
 * Get a random track for the given emotion that hasn't been played yet
 * If all tracks have been played, reset the played tracks for that emotion
 */
export const getRandomTrackForEmotion = (emotion: Emotion): Track => {
  const tracksForEmotion = musicData[emotion];
  
  // Check if all tracks have been played
  if (playedTracks[emotion].size >= tracksForEmotion.length) {
    playedTracks[emotion].clear(); // Reset played tracks for this emotion
  }
  
  // Filter out tracks that have already been played
  const availableTracks = tracksForEmotion.filter(
    track => !playedTracks[emotion].has(track.id)
  );
  
  // Get a random track from available tracks
  const randomIndex = Math.floor(Math.random() * availableTracks.length);
  const selectedTrack = availableTracks[randomIndex];
  
  // Mark the track as played
  playedTracks[emotion].add(selectedTrack.id);
  
  return selectedTrack;
};

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get previous track in the emotion category
 */
export const getPreviousTrack = (currentTrack: Track): Track => {
  const tracksInCategory = musicData[currentTrack.emotion];
  const currentIndex = tracksInCategory.findIndex(track => track.id === currentTrack.id);
  const previousIndex = (currentIndex - 1 + tracksInCategory.length) % tracksInCategory.length;
  return tracksInCategory[previousIndex];
};

/**
 * Get next track in the emotion category
 */
export const getNextTrack = (currentTrack: Track): Track => {
  const tracksInCategory = musicData[currentTrack.emotion];
  const currentIndex = tracksInCategory.findIndex(track => track.id === currentTrack.id);
  const nextIndex = (currentIndex + 1) % tracksInCategory.length;
  return tracksInCategory[nextIndex];
};