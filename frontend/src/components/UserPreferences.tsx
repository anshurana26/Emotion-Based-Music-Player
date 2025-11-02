import React, { useState, useEffect } from "react";
import { UserPreferences as UserPreferencesType } from "../types";
import { userService } from "../services/userService";
import { Settings, Volume2, Globe } from "lucide-react";

const UserPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferencesType>({
    genres: [],
    volume: 0.7,
    autoPlay: false,
    language: "all",
    autoVolume: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { preferences: prefs } = await userService.getPreferences();
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferencesType, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setSaving(true);
    try {
      await userService.updatePreferences({ [key]: value });
    } catch (error) {
      console.error("Failed to update preferences:", error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="panel p-6">
        <div className="text-center py-4 text-gray-400">Loading preferences...</div>
      </div>
    );
  }

  const languages = [
    { code: "hi", name: "Hindi" },
    { code: "pa", name: "Punjabi" },
    { code: "all", name: "All Languages" },
  ];

  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-brand-300" />
        <h2 className="text-xl font-bold">Preferences</h2>
        {saving && (
          <span className="text-xs text-gray-400 ml-2">Saving...</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Language Preference */}
        <div>
          <label className="flex items-center gap-2 mb-2 text-sm font-medium">
            <Globe className="w-4 h-4" />
            Preferred Language
          </label>
          <select
            value={preferences.language || "all"}
            onChange={(e) => {
              updatePreference("language", e.target.value);
              // Reload page to apply language filter immediately
              setTimeout(() => window.location.reload(), 500);
            }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-gray-800">
                {lang.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Filter songs by your preferred language
          </p>
        </div>

        {/* Auto Volume */}
        <div className="flex items-center justify-between">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <Volume2 className="w-4 h-4" />
              Auto Volume Adjustment
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Automatically adjust volume based on detected emotion
            </p>
          </div>
          <button
            onClick={() => updatePreference("autoVolume", !preferences.autoVolume)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              preferences.autoVolume ? "bg-brand-500" : "bg-white/20"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                preferences.autoVolume ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;

