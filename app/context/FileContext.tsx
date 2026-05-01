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

const DEFAULT_FILES: AppFile[] = [
  { id: '1', name: 'Guia_SEO_Local_2026.pdf', type: 'pdf', status: 'Processado', content: 'Guia de SEO Local 2026: Para restaurantes, foque em ter fotos atualizadas dos pratos toda semana e responda as avaliações no mesmo dia com palavras-chave como "almoço", "jantar", "delicioso". Para clínicas, o segredo é ter um FAQ robusto na ficha sobre agendamentos e convênios, além de postar fotos do antes/depois (se permitido pelo conselho) ou da estrutura/equipe.' },
  { id: '2', name: 'Templates_Mensagens_WhatsApp.xlsx', type: 'excel', status: 'Processado', content: 'Templates Comerciais:\n1. Olá! Vi sua empresa no Google mas faltam informações cruciais que estão fazendo você perder clientes para o concorrente da rua de baixo. Posso mostrar o que é?\n2. [FOLLOW UP] Sabia que fichas atualizadas recebem 70% mais ligações e visitas de rota? Vamos arrumar a sua hoje e recuperar esse tráfego.' },
  { id: '3', name: 'Boas_Praticas_Restaurantes.txt', type: 'text', status: 'Processado', content: 'Boas práticas para restaurantes:\n- Adicionar pratos populares no menu do Google Maps.\n- Usar o Google Posts para anunciar ofertas de happy hour.\n- Incentivar os clientes a mencionarem pratos específicos nas avaliações.' },
];

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<AppFile[]>(DEFAULT_FILES);
  const userEmail = 'souturbo149@gmail.com';

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .eq('user_email', userEmail)
          .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
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
    setFiles((prev) => [...newFiles, ...prev]);
    
    try {
      await supabase
        .from('knowledge_base')
        .insert(newFiles.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type,
          status: f.status,
          content: f.content,
          user_email: userEmail
        })));
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
