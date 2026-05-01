'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  apiTokensUsed: number;
  addTokensUsed: (tokens: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState('');
  const [apiTokensUsed, setApiTokensUsedState] = useState(0);

  useEffect(() => {
    const savedKey = localStorage.getItem('gmn_api_key');
    if (savedKey) {
      setApiKeyState(savedKey);
    }
    const savedTokens = localStorage.getItem('gmn_api_tokens');
    if (savedTokens) {
      setApiTokensUsedState(parseInt(savedTokens) || 0);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('gmn_api_key', key);
  };

  const addTokensUsed = (tokens: number) => {
    setApiTokensUsedState((prev) => {
      const updated = prev + tokens;
      localStorage.setItem('gmn_api_tokens', updated.toString());
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey, apiTokensUsed, addTokensUsed }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
