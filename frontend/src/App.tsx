import React, { useState } from "react";
import MusicPlayer from "./components/MusicPlayer";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

function App() {
  const { user, isLoading, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Emotion-Based Music Player
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Let your emotions guide your music experience. We'll detect how
            you're feeling and play the perfect track.
          </p>
        </header>

        {isLoading ? (
          <div className="text-gray-300 text-center">Loading...</div>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-md">
              <div className="text-gray-200 text-sm">
                Signed in as{" "}
                <span className="font-medium">{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
            <MusicPlayer />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 bg-gray-800 p-1 rounded">
              <button
                onClick={() => setMode("login")}
                className={`px-4 py-2 rounded ${
                  mode === "login" ? "bg-blue-600 text-white" : "text-gray-300"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`px-4 py-2 rounded ${
                  mode === "signup" ? "bg-blue-600 text-white" : "text-gray-300"
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
        )}

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Note: This app requires camera access for emotion detection.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
