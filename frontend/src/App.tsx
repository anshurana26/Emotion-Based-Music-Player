import React, { useState } from "react";
import MusicPlayer from "./components/MusicPlayer";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ListeningHistory from "./components/ListeningHistory";
import UserPreferences from "./components/UserPreferences";
import EmotionCharts from "./components/EmotionCharts";
import GestureControls from "./components/GestureControls";

function App() {
  const { user, isLoading, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-[var(--bg)]/60 border-b border-white/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <span className="text-brand-300 font-bold">EM</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">Emotion Music</h1>
              <p className="text-xs text-gray-400 -mt-0.5">Feel it. Play it.</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-300">{user.username}</div>
              <button
                onClick={logout}
                className="text-sm px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          {isLoading ? (
            <div className="panel p-6 text-gray-300 text-center">Loading...</div>
          ) : user ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Intro / Auth panel */}
              <section className="lg:col-span-5 space-y-4">
                <div className="panel p-6 theme-transition">
                  <h2 className="text-2xl font-bold mb-2">Emotion-Based Music Player</h2>
                  <p className="text-gray-400">
                    Let your emotions guide your music experience. We detect how
                    you're feeling and suggest the perfect track.
                  </p>
                </div>
                <UserPreferences />
                <ListeningHistory />
                <EmotionCharts />
              </section>

              {/* Player area */}
              <section className="lg:col-span-7">
                <div className="panel p-0">
                  <MusicPlayer />
                </div>
              </section>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
              <div className="w-full max-w-md space-y-6">
                <div className="panel p-6 text-center">
                  <h2 className="text-3xl font-bold mb-2">Emotion-Based Music Player</h2>
                  <p className="text-gray-400">
                    Let your emotions guide your music experience. We detect how
                    you're feeling and suggest the perfect track.
                  </p>
                </div>
                <div className="panel p-6">
                  <div className="mb-4 bg-white/5 p-1 rounded-lg inline-flex w-full justify-center">
                    <button
                      onClick={() => setMode("login")}
                      className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                        mode === "login" ? "bg-brand-500 text-white" : "text-gray-300 hover:text-white"
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setMode("signup")}
                      className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                        mode === "signup" ? "bg-brand-500 text-white" : "text-gray-300 hover:text-white"
                      }`}
                    >
                      Signup
                    </button>
                  </div>
                  {mode === "login" ? (
                    <Login onSuccess={() => setMode("login")} />
                  ) : (
                    <Signup onSuccess={() => setMode("login")} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-gray-500 text-sm">
          Note: This app requires camera access for emotion detection.
        </div>
      </footer>
    </div>
  );
}

export default App;
