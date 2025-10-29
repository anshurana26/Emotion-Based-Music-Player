import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle
} from 'lucide-react';
import { PlaybackState } from '../types';

interface ControlsProps {
  playbackState: PlaybackState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  playbackState,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleLoop,
  onToggleShuffle
}) => {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    volume, 
    isMuted,
    isLooping,
    isShuffle
  } = playbackState;

  // Format time for display
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full px-4 py-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-300">{formatTime(currentTime)}</span>
        <div className="flex-grow relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-white bg-opacity-80 transition-all duration-100 ease-in-out"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-xs text-gray-300">{formatTime(duration)}</span>
      </div>

      {/* Main controls */}
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={onToggleShuffle}
          className={`p-2 rounded-full ${isShuffle ? 'text-white bg-white bg-opacity-20' : 'text-gray-400 hover:text-white'} transition`}
        >
          <Shuffle size={18} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            className="p-2 text-white rounded-full hover:bg-white hover:bg-opacity-10 transition"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={onPlayPause}
            className="p-3 bg-white rounded-full text-black hover:bg-gray-200 transition transform hover:scale-105"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} fill="black" />}
          </button>

          <button
            onClick={onNext}
            className="p-2 text-white rounded-full hover:bg-white hover:bg-opacity-10 transition"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <button 
          onClick={onToggleLoop}
          className={`p-2 rounded-full ${isLooping ? 'text-white bg-white bg-opacity-20' : 'text-gray-400 hover:text-white'} transition`}
        >
          <Repeat size={18} />
        </button>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="p-1 text-white rounded-full hover:bg-white hover:bg-opacity-10 transition"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="w-full max-w-[100px] h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white bg-opacity-80"
            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="absolute w-[100px] h-5 opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Controls;