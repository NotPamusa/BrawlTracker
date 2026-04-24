"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSettings } from "@/utils/calculator";
import { DEFAULT_SETTINGS } from "@/utils/constants";

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: UserSettings) => void;
  isApplying: boolean;
  applyTuning: (tempSettings: UserSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isApplying, setIsApplying] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("calculator_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem("calculator_settings", JSON.stringify(newSettings));
  };

  const applyTuning = (tempSettings: UserSettings) => {
    setIsApplying(true);
    updateSettings(tempSettings);
    // Simulate a brief "calculating" state if desired, or just trigger re-render
    setTimeout(() => setIsApplying(false), 500);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isApplying, applyTuning }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
