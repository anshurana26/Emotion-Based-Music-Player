import React from "react";
import { Emotion } from "../types";
import { emotionEmojis, emotionColors } from "../utils/emotionUtils";

interface ManualEmotionSelectorProps {
  onEmotionSelect: (emotion: Emotion) => void;
  currentEmotion: Emotion;
}

const ManualEmotionSelector: React.FC<ManualEmotionSelectorProps> = ({
  onEmotionSelect,
  currentEmotion,
}) => {
  const emotions: Emotion[] = ["happy", "sad", "angry", "surprised", "neutral"];

  return (
    <div className="p-4 bg-gray-800 rounded-xl">
      <h3 className="text-lg font-semibold mb-3 text-center">Manual Emotion Selection</h3>
      <p className="text-sm text-gray-400 text-center mb-4">
        Camera unavailable? Select your mood manually
      </p>
      <div className="grid grid-cols-5 gap-2">
        {emotions.map((emotion) => {
          const isSelected = currentEmotion === emotion;
          const color = emotionColors[emotion];

          return (
            <button
              key={emotion}
              onClick={() => onEmotionSelect(emotion)}
              className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
                isSelected
                  ? `bg-gradient-to-br ${color.background} shadow-lg scale-105`
                  : "bg-white/5 hover:bg-white/10"
              }`}
              title={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            >
              <div className="text-3xl mb-1">{emotionEmojis[emotion]}</div>
              <div
                className={`text-xs font-medium ${
                  isSelected ? "text-white" : "text-gray-400"
                }`}
              >
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ManualEmotionSelector;
