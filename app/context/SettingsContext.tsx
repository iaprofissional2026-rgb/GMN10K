'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SettingsContextType {
  apiKey: string;
  generalApiKey: string;
  setApiKey: (key: string) => void;
  setGeneralApiKey: (key: string) => void;
  apiTokensUsed: number;
  addTokensUsed: (tokens: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState('');
  const [generalApiKey, setGeneralApiKeyState] = useState('');
  const [apiTokensUsed, setApiTokensUsedState] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      // Local fallbacks
      const savedKey = localStorage.getItem('gmn_api_key');
      const savedGeneralKey = localStorage.getItem('gmn_general_api_key');
      const savedTokens = localStorage.getItem('gmn_api_tokens');
      
      if (savedKey) setApiKeyState(savedKey);
      if (savedGeneralKey) setGeneralApiKeyState(savedGeneralKey);
      if (savedTokens) setApiTokensUsedState(parseInt(savedTokens) || 0);

      // Supabase sync (filtered by user email)
      try {
        const userEmail = 'souturbo149@gmail.com'; // Injected from environment/meta
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_email', userEmail);
        
        if (!error && data) {
          const keySetting = data.find(s => s.key === 'gmn_api_key');
          const generalKeySetting = data.find(s => s.key === 'gmn_general_api_key');
          const tokensSetting = data.find(s => s.key === 'gmn_api_tokens');
          
          if (keySetting) setApiKeyState(keySetting.value);
          if (generalKeySetting) setGeneralApiKeyState(generalKeySetting.value);
          if (tokensSetting) setApiTokensUsedState(parseInt(tokensSetting.value) || 0);
        }
      } catch (err) {
        console.warn('Supabase sync warning');
      }
    };

    loadSettings();
  }, []);

  const setApiKey = async (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('gmn_api_key', key);
    
    try {
      await supabase
        .from('settings')
        .upsert({ 
          key: 'gmn_api_key', 
          value: key, 
          user_email: 'souturbo149@gmail.com' 
        }, { onConflict: 'key,user_email' });
    } catch (err) {
      console.error('Error saving to Supabase:', err);
    }
  };

  const setGeneralApiKey = async (key: string) => {
    setGeneralApiKeyState(key);
    localStorage.setItem('gmn_general_api_key', key);
    
    try {
      await supabase
        .from('settings')
        .upsert({ 
          key: 'gmn_general_api_key', 
          value: key, 
          user_email: 'souturbo149@gmail.com' 
        }, { onConflict: 'key,user_email' });
    } catch (err) {
      console.error('Error saving to Supabase:', err);
    }
  };

  const addTokensUsed = async (tokens: number) => {
    setApiTokensUsedState((prev) => {
      const updated = prev + tokens;
      localStorage.setItem('gmn_api_tokens', updated.toString());
      
      // Update Supabase in background
      supabase
        .from('settings')
        .upsert({ key: 'gmn_api_tokens', value: updated.toString() }, { onConflict: 'key' })
        .then(({ error }) => {
          if (error) console.error('Error updating tokens in Supabase:', error);
        });

      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ apiKey, generalApiKey, setApiKey, setGeneralApiKey, apiTokensUsed, addTokensUsed }}>
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
