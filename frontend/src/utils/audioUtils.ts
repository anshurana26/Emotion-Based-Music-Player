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
 * Optionally filters out disliked tracks and prioritizes liked tracks
 * Optionally filters by language preference
 */
export const getRandomTrackForEmotion = (
  emotion: Emotion,
  dislikedTracks: string[] = [],
  likedTracks: string[] = [],
  languagePreference?: string
): Track => {
  let tracksForEmotion = musicData[emotion];
  
  // Filter by language preference if specified (excluding English and "all")
  if (languagePreference && languagePreference !== "all" && languagePreference !== "en") {
    tracksForEmotion = tracksForEmotion.filter(
      track => !track.language || track.language === languagePreference
    );
    // If no tracks match language, use all tracks
    if (tracksForEmotion.length === 0) {
      tracksForEmotion = musicData[emotion];
    }
  }
  
  // Filter out disliked tracks
  const tracksWithoutDisliked = tracksForEmotion.filter(
    track => !dislikedTracks.includes(track.id)
  );

  // If no tracks available after filtering, use all tracks (better than nothing)
  const baseTracks = tracksWithoutDisliked.length > 0 ? tracksWithoutDisliked : tracksForEmotion;
  
  // Separate liked and non-liked tracks
  const likedTracksInCategory = baseTracks.filter(track => likedTracks.includes(track.id));
  const otherTracks = baseTracks.filter(track => !likedTracks.includes(track.id));
  
  // Check if all tracks have been played
  if (playedTracks[emotion].size >= baseTracks.length) {
    playedTracks[emotion].clear(); // Reset played tracks for this emotion
  }
  
  // Filter out tracks that have already been played
  const availableLiked = likedTracksInCategory.filter(
    track => !playedTracks[emotion].has(track.id)
  );
  const availableOther = otherTracks.filter(
    track => !playedTracks[emotion].has(track.id)
  );
  
  // Prioritize liked tracks: 70% chance to pick from liked, 30% from others
  const shouldPreferLiked = availableLiked.length > 0 && Math.random() < 0.7;
  const availableTracks = shouldPreferLiked ? availableLiked : availableOther;
  
  // Fallback to the other set if current set is empty
  const finalAvailableTracks = availableTracks.length > 0 
    ? availableTracks 
    : (shouldPreferLiked ? availableOther : availableLiked);
  
  // Get a random track from available tracks
  const randomIndex = Math.floor(Math.random() * finalAvailableTracks.length);
  const selectedTrack = finalAvailableTracks[randomIndex];
  
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
export const getPreviousTrack = (
  currentTrack: Track,
  dislikedTracks: string[] = []
): Track => {
  let tracksInCategory = musicData[currentTrack.emotion];
  
  // Filter out disliked tracks if any
  if (dislikedTracks.length > 0) {
    tracksInCategory = tracksInCategory.filter(
      track => !dislikedTracks.includes(track.id)
    );
    // If all tracks are disliked, use all tracks as fallback
    if (tracksInCategory.length === 0) {
      tracksInCategory = musicData[currentTrack.emotion];
    }
  }
  
  const currentIndex = tracksInCategory.findIndex(track => track.id === currentTrack.id);
  const adjustedIndex = currentIndex >= 0 ? currentIndex : 0;
  const previousIndex = (adjustedIndex - 1 + tracksInCategory.length) % tracksInCategory.length;
  return tracksInCategory[previousIndex];
};

/**
 * Get next track in the emotion category
 */
export const getNextTrack = (
  currentTrack: Track,
  dislikedTracks: string[] = []
): Track => {
  let tracksInCategory = musicData[currentTrack.emotion];
  
  // Filter out disliked tracks if any
  if (dislikedTracks.length > 0) {
    tracksInCategory = tracksInCategory.filter(
      track => !dislikedTracks.includes(track.id)
    );
    // If all tracks are disliked, use all tracks as fallback
    if (tracksInCategory.length === 0) {
      tracksInCategory = musicData[currentTrack.emotion];
    }
  }
  
  const currentIndex = tracksInCategory.findIndex(track => track.id === currentTrack.id);
  const adjustedIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (adjustedIndex + 1) % tracksInCategory.length;
  return tracksInCategory[nextIndex];
};