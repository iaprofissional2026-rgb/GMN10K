'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface AppFile {
  id: string;
  name: string;
  type: string;
  status: string;
  content?: string;
}

interface FileContextType {
  files: AppFile[];
  setFiles: React.Dispatch<React.SetStateAction<AppFile[]>>;
  addFiles: (files: AppFile[]) => void;
  removeFile: (id: string) => void;
  updateFileStatus: (id: string, status: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<AppFile[]>([]);
  const userEmail = 'souturbo149@gmail.com';

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('user_email', userEmail)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setFiles(data.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            status: item.status,
            content: item.content
          })));
        }
      } catch (err) {
        console.warn('Supabase knowledge_base sync error');
      }
    };
    loadFiles();
  }, [userEmail]);

  const addFiles = async (newFiles: AppFile[]) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .insert(newFiles.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          status: f.status,
          content: f.content,
          user_email: userEmail
        })));
      
      if (!error) {
        setFiles((prev) => [...newFiles, ...prev]);
      } else {
        console.error('Supabase insert error:', error);
      }
    } catch (err) {
      console.error('Error adding files to Supabase:', err);
    }
  };

  const removeFile = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    
    try {
      await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)
        .eq('user_email', userEmail);
    } catch (err) {
      console.error('Error removing file from Supabase:', err);
    }
  };

  const updateFileStatus = async (id: string, status: string) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
    
    try {
      await supabase
        .from('knowledge_base')
        .update({ status })
        .eq('id', id)
        .eq('user_email', userEmail);
    } catch (err) {
      console.error('Error updating file status in Supabase:', err);
    }
  };

  return (
    <FileContext.Provider value={{ files, setFiles, addFiles, removeFile, updateFileStatus }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}
