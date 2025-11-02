import React, { useState, useEffect } from "react";
import { ListeningHistoryEntry, Emotion } from "../types";
import { userService } from "../services/userService";
import { History, Clock, Music } from "lucide-react";
import { emotionEmojis } from "../utils/emotionUtils";

const ListeningHistory: React.FC = () => {
  const [history, setHistory] = useState<ListeningHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Emotion | "all">("all");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await userService.getHistory(50, 0, filter !== "all" ? filter : undefined);
      setHistory(result.history || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const emotions: (Emotion | "all")[] = ["all", "happy", "sad", "angry", "surprised", "neutral"];

  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-brand-300" />
        <h2 className="text-xl font-bold">Listening History</h2>
        {total > 0 && (
          <span className="text-sm text-gray-400">({total} tracks)</span>
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {emotions.map((emotion) => (
          <button
            key={emotion}
            onClick={() => setFilter(emotion)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === emotion
                ? "bg-brand-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            {emotion === "all" ? "All" : emotionEmojis[emotion]} {emotion === "all" ? "" : emotion.charAt(0).toUpperCase() + emotion.slice(1)}
          </button>
        ))}
      </div>

      {/* History list */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No listening history yet</p>
          <p className="text-sm mt-1">Start playing music to see your history here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((entry, index) => (
            <div
              key={`${entry.trackId}-${entry.playedAt}-${index}`}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {/* Emotion emoji */}
              <div className="text-2xl">{emotionEmojis[entry.emotion]}</div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{entry.title}</div>
                <div className="text-sm text-gray-400 truncate">{entry.artist}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(entry.playedAt)}
                  </span>
                  {entry.duration > 0 && (
                    <span>Listened: {formatDuration(entry.duration)}</span>
                  )}
                  {entry.completed && (
                    <span className="text-green-400">✓ Completed</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListeningHistory;
