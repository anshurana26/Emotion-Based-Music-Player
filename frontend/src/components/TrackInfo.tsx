import React, { useState, useEffect } from "react";
import { Emotion, Track } from "../types";
import { emotionEmojis } from "../utils/emotionUtils";
import { userService } from "../services/userService";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface TrackInfoProps {
  track: Track;
  currentEmotion: Emotion;
  onFeedbackChange?: () => void;
}

const TrackInfo: React.FC<TrackInfoProps> = ({ track, currentEmotion, onFeedbackChange }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load current feedback status
    userService
      .getFeedback()
      .then(({ likedTracks, dislikedTracks }) => {
        setIsLiked(likedTracks.includes(track.id));
        setIsDisliked(dislikedTracks.includes(track.id));
      })
      .catch(() => {
        // User not logged in or error - silently fail
      });
  }, [track.id]);

  const handleFeedback = async (action: "like" | "dislike") => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await userService.submitFeedback(track.id, action);
      if (action === "like") {
        setIsLiked(true);
        setIsDisliked(false);
      } else {
        setIsLiked(false);
        setIsDisliked(true);
      }
      onFeedbackChange?.();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center p-4">
      {/* Album cover */}
      <div className="relative mr-4">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shadow-lg">
          <img
            src={track.cover}
            alt={`${track.title} cover`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Emotion indicator */}
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black/70 text-xl flex items-center justify-center shadow-lg">
          {emotionEmojis[currentEmotion]}
        </div>
      </div>

      {/* Track info */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-lg font-bold truncate">{track.title}</h3>
        <p className="text-gray-300 text-sm truncate">{track.artist}</p>
        <div className="flex items-center mt-1 gap-2">
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-brand-500/20 text-brand-200">
            {track.emotion.charAt(0).toUpperCase() + track.emotion.slice(1)}
          </span>
          {/* Like/Dislike buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleFeedback("like")}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all transform hover:scale-110 shadow-lg border-2 ${
                isLiked
                  ? "bg-green-600 text-white border-green-400 shadow-green-500/50"
                  : "bg-white/90 text-gray-700 border-white/50 hover:bg-white hover:border-green-400 shadow-black/30"
              }`}
              title="Like this song"
            >
              <ThumbsUp size={18} className={isLiked ? "text-white" : "text-gray-700"} />
            </button>
            <button
              onClick={() => handleFeedback("dislike")}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all transform hover:scale-110 shadow-lg border-2 ${
                isDisliked
                  ? "bg-red-600 text-white border-red-400 shadow-red-500/50"
                  : "bg-white/90 text-gray-700 border-white/50 hover:bg-white hover:border-red-400 shadow-black/30"
              }`}
              title="Dislike this song"
            >
              <ThumbsDown size={18} className={isDisliked ? "text-white" : "text-gray-700"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackInfo;
