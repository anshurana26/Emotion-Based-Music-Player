import { ListeningHistoryEntry, UserPreferences, EmotionStats } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const userService = {
  // Feedback
  async submitFeedback(trackId: string, action: "like" | "dislike") {
    return request<{ likedTracks: string[]; dislikedTracks: string[] }>(
      "/api/user/feedback",
      {
        method: "POST",
        body: JSON.stringify({ trackId, action }),
      }
    );
  },

  async getFeedback() {
    return request<{ likedTracks: string[]; dislikedTracks: string[] }>(
      "/api/user/feedback"
    );
  },

  // Listening History
  async getHistory(limit = 50, offset = 0, emotion?: string) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (emotion) {
      params.append("emotion", emotion);
    }
    return request<{
      history: ListeningHistoryEntry[];
      total: number;
    }>(`/api/user/history?${params.toString()}`);
  },

  async addHistoryEntry(
    trackId: string,
    title: string,
    artist: string,
    emotion: string,
    duration = 0,
    completed = false
  ) {
    return request<{ message: string }>("/api/user/history", {
      method: "POST",
      body: JSON.stringify({
        trackId,
        title,
        artist,
        emotion,
        duration,
        completed,
      }),
    });
  },

  // Emotions
  async logEmotion(emotion: string, confidence?: number, trackId?: string) {
    return request<{ message: string }>("/api/user/emotion", {
      method: "POST",
      body: JSON.stringify({ emotion, confidence, trackId }),
    });
  },

  async getEmotions(period: "7d" | "30d" | "all" = "7d") {
    return request<EmotionStats>(`/api/user/emotions?period=${period}`);
  },

  // Preferences
  async getPreferences() {
    return request<{ preferences: UserPreferences }>("/api/user/preferences");
  },

  async updatePreferences(preferences: Partial<UserPreferences>) {
    return request<{ preferences: UserPreferences }>("/api/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  },
};

