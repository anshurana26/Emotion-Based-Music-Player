import React, { useState, useEffect } from "react";
import { EmotionStats, Emotion } from "../types";
import { userService } from "../services/userService";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { emotionColors } from "../utils/emotionUtils";

const EmotionCharts: React.FC = () => {
  const [stats, setStats] = useState<EmotionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("7d");

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await userService.getEmotions(period);
      setStats(data);
    } catch (error) {
      console.error("Failed to load emotion stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="text-center py-8 text-gray-400">Loading charts...</div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="panel p-6">
        <div className="text-center py-8 text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No emotion data yet</p>
          <p className="text-sm mt-1">Start detecting emotions to see your mood charts</p>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = Object.entries(stats.emotionCounts)
    .filter(([_, count]) => count > 0)
    .map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: count,
      emotion: emotion as Emotion,
    }));

  // Prepare line chart data
  const lineData = stats.timelineData.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Happy: entry.happy,
    Sad: entry.sad,
    Angry: entry.angry,
    Surprised: entry.surprised,
    Neutral: entry.neutral,
  }));

  const colors = {
    happy: "#FFD700",
    sad: "#1E90FF",
    angry: "#FF4500",
    surprised: "#DA70D6",
    neutral: "#3CB371",
  };

  return (
    <div className="panel p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-300" />
          <h2 className="text-xl font-bold">Emotion Analytics</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === "7d"
                ? "bg-brand-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === "30d"
                ? "bg-brand-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === "all"
                ? "bg-brand-500 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        Total detections: <span className="font-semibold text-white">{stats.total}</span>
      </div>

      {/* Pie Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Emotion Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.emotion]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart */}
      {lineData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Emotion Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Happy"
                stroke={colors.happy}
                strokeWidth={2}
                dot={{ fill: colors.happy }}
              />
              <Line
                type="monotone"
                dataKey="Sad"
                stroke={colors.sad}
                strokeWidth={2}
                dot={{ fill: colors.sad }}
              />
              <Line
                type="monotone"
                dataKey="Angry"
                stroke={colors.angry}
                strokeWidth={2}
                dot={{ fill: colors.angry }}
              />
              <Line
                type="monotone"
                dataKey="Surprised"
                stroke={colors.surprised}
                strokeWidth={2}
                dot={{ fill: colors.surprised }}
              />
              <Line
                type="monotone"
                dataKey="Neutral"
                stroke={colors.neutral}
                strokeWidth={2}
                dot={{ fill: colors.neutral }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EmotionCharts;

