'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AppFile {
  id: string;
  name: string;
  type: string;
  status: string;
  content: string;
}

interface FileContextType {
  files: AppFile[];
  addFiles: (newFiles: AppFile[]) => Promise<void>;
  removeFile: (id: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<AppFile[]>([]);
  const userEmail = 'souturbo149@gmail.com';

  const addFiles = async (newFiles: AppFile[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter(f => f.id !== id));
  };

  return (
    <FileContext.Provider value={{ files, addFiles, removeFile }}>
      {children}
    </FileContext.Provider>
  );
}

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used within FileProvider');
  return context;
};
