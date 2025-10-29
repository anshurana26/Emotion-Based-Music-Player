import React from 'react';
import { Emotion, Track } from '../types';
import { emotionEmojis } from '../utils/emotionUtils';

interface TrackInfoProps {
  track: Track;
  currentEmotion: Emotion;
}

const TrackInfo: React.FC<TrackInfoProps> = ({ track, currentEmotion }) => {
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
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black text-xl flex items-center justify-center shadow-lg">
          {emotionEmojis[currentEmotion]}
        </div>
      </div>
      
      {/* Track info */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-white text-lg font-bold truncate">{track.title}</h3>
        <p className="text-gray-300 text-sm truncate">{track.artist}</p>
        <div className="flex items-center mt-1">
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-white bg-opacity-20 text-white">
            {track.emotion.charAt(0).toUpperCase() + track.emotion.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrackInfo;