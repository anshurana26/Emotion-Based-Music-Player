import React from "react";
import { Emotion } from "../types";
import { emotionEmojis, getEmotionMessage } from "../utils/emotionUtils";

interface EmotionDisplayProps {
  emotion: Emotion;
  isActive: boolean;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  emotion,
  isActive,
}) => {
  // Always show the current emotion, even when inactive
  return (
    <div className="p-4 bg-gray-900 bg-opacity-60 backdrop-blur-lg rounded-xl animate-fadeIn">
      <div className="flex flex-col items-center">
        <div className="text-5xl mb-2 animate-bounce">
          {emotionEmojis[emotion]}
        </div>
        <h3 className="text-white text-xl font-semibold mb-1">
          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
        </h3>
        <p className="text-gray-300 text-center text-sm">
          {isActive ? getEmotionMessage(emotion) : "Emotion detection paused"}
        </p>
      </div>
    </div>
  );
};

export default EmotionDisplay;
