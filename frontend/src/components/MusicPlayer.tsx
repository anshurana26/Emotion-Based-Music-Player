import React, { useState, useRef, useEffect } from "react";
import {
  Track,
  PlaybackState,
  Emotion,
  EmotionDetectionResult,
} from "../types";
import Controls from "./Controls";
import TrackInfo from "./TrackInfo";
import EmotionDetector from "./EmotionDetector";
import EmotionDisplay from "./EmotionDisplay";
import {
  getRandomTrackForEmotion,
  getPreviousTrack,
  getNextTrack,
} from "../utils/audioUtils";
import { emotionColors } from "../utils/emotionUtils";
import { Scan } from "lucide-react";
import { userService } from "../services/userService";
import GestureControls from "./GestureControls";

const MusicPlayer: React.FC = () => {
  // State for current track and emotion
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [isDetecting, setIsDetecting] = useState(false);
  
  // User feedback state
  const [likedTracks, setLikedTracks] = useState<string[]>([]);
  const [dislikedTracks, setDislikedTracks] = useState<string[]>([]);
  
  // Auto volume state
  const [autoVolumeEnabled, setAutoVolumeEnabled] = useState(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [languagePreference, setLanguagePreference] = useState<string | undefined>(undefined);
  
  // Sleep mode state
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [sleepModeTimer, setSleepModeTimer] = useState<number | null>(null);
  const sleepModeDuration = 20 * 60 * 1000; // 20 minutes in milliseconds
  
  // Gesture controls state
  const [gestureControlsEnabled, setGestureControlsEnabled] = useState(false);

  // Audio playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isLooping: false,
    isShuffle: false,
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackStartTimeRef = useRef<number>(0);

  // Load user feedback and preferences
  useEffect(() => {
    userService
      .getFeedback()
      .then(({ likedTracks: liked, dislikedTracks: disliked }) => {
        setLikedTracks(liked);
        setDislikedTracks(disliked);
      })
      .catch(() => {
        // User not logged in or error - silently fail
      });
    
    userService
      .getPreferences()
      .then(({ preferences }) => {
        setUserPreferences(preferences);
        setAutoVolumeEnabled(preferences.autoVolume !== false);
        // Treat "en" as "all" for backward compatibility
        const lang = preferences.language === "en" ? "all" : preferences.language;
        setLanguagePreference(lang);
        // Set initial volume from preferences
        if (preferences.volume !== undefined && audioRef.current) {
          audioRef.current.volume = preferences.volume;
          setPlaybackState((prev) => ({ ...prev, volume: preferences.volume }));
        }
      })
      .catch(() => {});
  }, []);

  // Set initial track without auto-playing
  useEffect(() => {
    const initialTrack = getRandomTrackForEmotion("neutral", dislikedTracks, likedTracks, languagePreference);
    setCurrentTrack(initialTrack);
    // Ensure audio is paused initially
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [languagePreference]);

  // Handle emotion detection results
  const handleEmotionDetected = (result: EmotionDetectionResult) => {
    // Process emotion detection (from camera or manual selection)
    // Note: isDetecting check removed to allow manual emotion selection

    // Track skip if current track was playing
    if (currentTrack && trackStartTimeRef.current > 0) {
      const duration = audioRef.current ? Math.floor(audioRef.current.currentTime) : 0;
      userService
        .addHistoryEntry(
          currentTrack.id,
          currentTrack.title,
          currentTrack.artist,
          currentTrack.emotion,
          duration,
          false
        )
        .catch(() => {});
      trackStartTimeRef.current = 0;
    }

    // Update emotion and track
    setCurrentEmotion(result.emotion);
    const newTrack = getRandomTrackForEmotion(result.emotion, dislikedTracks, likedTracks, languagePreference);
    setCurrentTrack(newTrack);

    // Auto-adjust volume based on emotion
    if (autoVolumeEnabled && audioRef.current) {
      let targetVolume = 0.7; // default
      switch (result.emotion) {
        case "sad":
          targetVolume = 0.4; // Lower volume for sad
          break;
        case "surprised":
        case "happy":
          targetVolume = 0.85; // Higher volume for excitement
          break;
        case "angry":
          targetVolume = 0.75;
          break;
        case "neutral":
        default:
          targetVolume = 0.7;
          break;
      }
      audioRef.current.volume = targetVolume;
      setPlaybackState((prev) => ({ ...prev, volume: targetVolume }));
    }

    // Don't auto-play, just update the track
    setPlaybackState((prev) => ({ ...prev, isPlaying: false }));

    // Stop detection after processing only if it was active detection
    if (isDetecting) {
      setIsDetecting(false);
    }
    
    // Log emotion to backend
    userService.logEmotion(result.emotion, result.confidence, newTrack.id).catch(() => {});
  };
  
  // Handle feedback change - reload feedback and update track if needed
  const handleFeedbackChange = () => {
    userService
      .getFeedback()
      .then(({ likedTracks: liked, dislikedTracks: disliked }) => {
        setLikedTracks(liked);
        setDislikedTracks(disliked);
        // If current track is now disliked, skip to next
        if (currentTrack && disliked.includes(currentTrack.id)) {
          handleNext();
        }
      })
      .catch(() => {});
  };

  // Toggle emotion detection
  const toggleEmotionDetection = () => {
    // Only allow starting detection if not already detecting
    if (!isDetecting) {
      setIsDetecting(true);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleDurationChange = () => {
      setPlaybackState((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    const handleEnded = () => {
      // Track completion
      if (currentTrack && trackStartTimeRef.current > 0) {
        const duration = Math.floor(audio.currentTime);
        userService
          .addHistoryEntry(
            currentTrack.id,
            currentTrack.title,
            currentTrack.artist,
            currentTrack.emotion,
            duration,
            true
          )
          .catch(() => {});
        trackStartTimeRef.current = 0;
      }
      
      if (playbackState.isLooping) {
        audio.play();
      } else if (playbackState.isShuffle) {
        const newTrack = getRandomTrackForEmotion(currentEmotion, dislikedTracks, likedTracks, languagePreference);
        setCurrentTrack(newTrack);
        setTimeout(() => {
          audio.play();
        }, 100);
      } else {
        handleNext();
      }
    };

    // Add event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    // Cleanup
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentEmotion, playbackState.isLooping, playbackState.isShuffle, dislikedTracks, likedTracks, languagePreference]);

  // Playback control handlers
  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackState.isPlaying) {
      audio.pause();
    } else {
      // Track when playback starts
      if (currentTrack && trackStartTimeRef.current === 0) {
        trackStartTimeRef.current = Date.now();
        userService
          .addHistoryEntry(
            currentTrack.id,
            currentTrack.title,
            currentTrack.artist,
            currentTrack.emotion,
            0,
            false
          )
          .catch(() => {});
      }
      audio.play().catch((error) => {
        console.error("Playback error:", error);
      });
    }

    setPlaybackState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const handlePrevious = () => {
    if (!currentTrack) return;

    // Track skip if track was playing
    if (trackStartTimeRef.current > 0) {
      const duration = audioRef.current ? Math.floor(audioRef.current.currentTime) : 0;
      userService
        .addHistoryEntry(
          currentTrack.id,
          currentTrack.title,
          currentTrack.artist,
          currentTrack.emotion,
          duration,
          false
        )
        .catch(() => {});
      trackStartTimeRef.current = 0;
    }

    const prevTrack = getPreviousTrack(currentTrack, dislikedTracks, languagePreference);
    setCurrentTrack(prevTrack);

    // Maintain current playback state
    if (playbackState.isPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }, 100);
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;

    // Track skip if track was playing
    if (trackStartTimeRef.current > 0) {
      const duration = audioRef.current ? Math.floor(audioRef.current.currentTime) : 0;
      userService
        .addHistoryEntry(
          currentTrack.id,
          currentTrack.title,
          currentTrack.artist,
          currentTrack.emotion,
          duration,
          false
        )
        .catch(() => {});
      trackStartTimeRef.current = 0;
    }

    // In sleep mode, only allow soft emotions
    let nextEmotion = currentEmotion;
    if (isSleepMode && !["sad", "neutral"].includes(currentEmotion)) {
      nextEmotion = Math.random() < 0.5 ? "sad" : "neutral";
    }

    const nextTrack = playbackState.isShuffle
      ? getRandomTrackForEmotion(
          isSleepMode ? (nextEmotion as Emotion) : currentEmotion,
          dislikedTracks,
          likedTracks,
          languagePreference
        )
      : getNextTrack(currentTrack, dislikedTracks, languagePreference);

    // Ensure next track is soft in sleep mode
    if (isSleepMode && !["sad", "neutral"].includes(nextTrack.emotion)) {
      const softEmotions: Emotion[] = ["sad", "neutral"];
      const randomSoftEmotion = softEmotions[Math.floor(Math.random() * softEmotions.length)];
      const softTrack = getRandomTrackForEmotion(randomSoftEmotion, dislikedTracks, likedTracks, languagePreference);
      setCurrentTrack(softTrack);
      setCurrentEmotion(randomSoftEmotion);
    } else {
      setCurrentTrack(nextTrack);
      if (!isSleepMode) {
        setCurrentEmotion(nextTrack.emotion);
      }
    }

    // Maintain current playback state
    if (playbackState.isPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }, 100);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlaybackState((prev) => ({
        ...prev,
        currentTime: time,
      }));
    }
  };

  const handleVolumeChange = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = false;
      setPlaybackState((prev) => ({
        ...prev,
        volume,
        isMuted: false,
      }));
      // Update preferences if logged in
      if (userPreferences) {
        userService.updatePreferences({ volume }).catch(() => {});
      }
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !playbackState.isMuted;
      audioRef.current.muted = newMutedState;
      setPlaybackState((prev) => ({
        ...prev,
        isMuted: newMutedState,
      }));
    }
  };

  const handleToggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !playbackState.isLooping;
      setPlaybackState((prev) => ({
        ...prev,
        isLooping: !prev.isLooping,
      }));
    }
  };

  const handleToggleShuffle = () => {
    setPlaybackState((prev) => ({
      ...prev,
      isShuffle: !prev.isShuffle,
    }));
  };
  
  // Sleep mode handlers
  const handleToggleSleepMode = () => {
    const newSleepMode = !isSleepMode;
    setIsSleepMode(newSleepMode);
    
    if (newSleepMode) {
      // Start sleep mode: filter to soft music, lower volume
      if (audioRef.current) {
        audioRef.current.volume = 0.35;
        setPlaybackState((prev) => ({ ...prev, volume: 0.35 }));
      }
      
      // Filter to soft emotions (sad, neutral) - only if not already in soft emotion
      if (currentTrack && !["sad", "neutral"].includes(currentTrack.emotion)) {
        const softEmotions: Emotion[] = ["sad", "neutral"];
        const randomSoftEmotion = softEmotions[Math.floor(Math.random() * softEmotions.length)];
        const softTrack = getRandomTrackForEmotion(randomSoftEmotion, dislikedTracks, likedTracks, languagePreference);
        setCurrentTrack(softTrack);
        setCurrentEmotion(randomSoftEmotion);
      }
      
      // Ensure we stay in soft emotions during sleep mode
      // This will be enforced in shuffle/next handlers
      
      // Set timer for auto-stop (20 minutes)
      const timer = window.setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
        setIsSleepMode(false);
        setSleepModeTimer(null);
      }, sleepModeDuration);
      
      setSleepModeTimer(timer);
    } else {
      // Cancel sleep mode
      if (sleepModeTimer) {
        clearTimeout(sleepModeTimer);
        setSleepModeTimer(null);
      }
      // Restore volume if auto-volume is enabled
      if (autoVolumeEnabled && audioRef.current) {
        const targetVolume = userPreferences?.volume || 0.7;
        audioRef.current.volume = targetVolume;
        setPlaybackState((prev) => ({ ...prev, volume: targetVolume }));
      }
    }
  };
  
  // Cleanup sleep mode timer on unmount
  useEffect(() => {
    return () => {
      if (sleepModeTimer) {
        clearTimeout(sleepModeTimer);
      }
    };
  }, [sleepModeTimer]);

  // Get gradient background based on current emotion
  const emotionBackground = currentTrack
    ? emotionColors[currentTrack.emotion].background
    : "from-gray-800 to-gray-900";

  return (
    <div
      className={`w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br ${emotionBackground} transition-all duration-700`}
    >
      {/* Audio element */}
      <audio ref={audioRef} src={currentTrack?.path} preload="auto" />

      {/* Webcam and emotion detection */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white text-xl font-bold">Emotion Music Player</h2>
          <button
            onClick={toggleEmotionDetection}
            className="p-2 bg-white bg-opacity-10 rounded-full text-white hover:bg-opacity-20 transition"
          >
            <Scan size={18} />
          </button>
        </div>

        <EmotionDetector
          onEmotionDetected={handleEmotionDetected}
          isActive={isDetecting}
          lastEmotion={currentEmotion}
        />
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white bg-opacity-10"></div>

      {/* Emotion display */}
      <div className="p-4">
        <EmotionDisplay emotion={currentEmotion} isActive={isDetecting} />
      </div>

      {/* Track info */}
      {currentTrack && (
        <>
          <div className="w-full h-px bg-white bg-opacity-10"></div>
          <TrackInfo 
            track={currentTrack} 
            currentEmotion={currentEmotion} 
            onFeedbackChange={handleFeedbackChange}
          />
        </>
      )}

      {/* Playback controls */}
      <div className="w-full h-px bg-white bg-opacity-10"></div>
      <Controls
        playbackState={playbackState}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleLoop={handleToggleLoop}
        onToggleShuffle={handleToggleShuffle}
      />
      {/* Sleep mode toggle */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          onClick={handleToggleSleepMode}
          className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isSleepMode
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          <span>{isSleepMode ? "💤" : "🌙"}</span>
          <span className="font-medium">
            {isSleepMode ? "Sleep Mode Active (Auto-stop in 20 min)" : "Enable Sleep Mode"}
          </span>
        </button>
      </div>
      
      {/* Gesture Controls */}
      <div className="p-4 border-t border-white/10">
        <GestureControls
          onPlay={() => {
            if (!playbackState.isPlaying) {
              handlePlayPause();
            }
          }}
          onPause={() => {
            if (playbackState.isPlaying) {
              handlePlayPause();
            }
          }}
          onNext={handleNext}
          isEnabled={gestureControlsEnabled}
          onToggle={setGestureControlsEnabled}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
