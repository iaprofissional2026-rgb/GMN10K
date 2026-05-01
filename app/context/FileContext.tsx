'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  const [files, setFiles] = useState<AppFile[]>([
    { id: '1', name: 'Guia_SEO_Local_2026.pdf', type: 'pdf', status: 'Processado', content: 'Guia de SEO Local 2026: Para restaurantes, foque em ter fotos atualizadas dos pratos toda semana e responda as avaliações no mesmo dia com palavras-chave como "almoço", "jantar", "delicioso". Para clínicas, o segredo é ter um FAQ robusto na ficha sobre agendamentos e convênios, além de postar fotos do antes/depois (se permitido pelo conselho) ou da estrutura/equipe.' },
    { id: '2', name: 'Templates_Mensagens_WhatsApp.xlsx', type: 'excel', status: 'Processado', content: 'Templates Comerciais:\n1. Olá! Vi sua empresa no Google mas faltam informações cruciais que estão fazendo você perder clientes para o concorrente da rua de baixo. Posso mostrar o que é?\n2. [FOLLOW UP] Sabia que fichas atualizadas recebem 70% mais ligações e visitas de rota? Vamos arrumar a sua hoje e recuperar esse tráfego.' },
    { id: '3', name: 'Boas_Praticas_Restaurantes.txt', type: 'text', status: 'Processado', content: 'Boas práticas para restaurantes:\n- Adicionar pratos populares no menu do Google Maps.\n- Usar o Google Posts para anunciar ofertas de happy hour.\n- Incentivar os clientes a mencionarem pratos específicos nas avaliações.' },
  ]);

  const addFiles = (newFiles: AppFile[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileStatus = (id: string, status: string) => {
    setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
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
