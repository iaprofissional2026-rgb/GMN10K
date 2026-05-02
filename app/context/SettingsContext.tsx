'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  generalApiKey: string;
  setGeneralApiKey: (key: string) => void;
  apiTokensUsed: number;
  addTokensUsed: (tokens: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState('');
  const [generalApiKey, setGeneralApiKey] = useState('');
  const [apiTokensUsed, setApiTokensUsed] = useState(0);

  const addTokensUsed = (tokens: number) => {
    setApiTokensUsed(prev => prev + tokens);
  };

  return (
    <SettingsContext.Provider value={{ 
      apiKey, setApiKey, 
      generalApiKey, setGeneralApiKey, 
      apiTokensUsed, addTokensUsed 
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
