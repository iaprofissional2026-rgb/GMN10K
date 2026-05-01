'use client';

import { useState } from 'react';
import { UploadCloud, FileText, FileSpreadsheet, CheckCircle2, Trash2 } from 'lucide-react';
import { useFiles } from '@/app/context/FileContext';
import { BackButton } from '@/components/BackButton';

export default function KnowledgeBase() {
  const { files, addFiles, removeFile, updateFileStatus } = useFiles();

  const [isDragging, setIsDragging] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processFiles = async (fileList: FileList | File[]) => {
    const newFiles = await Promise.all(
      Array.from(fileList).map(async (f: any, i) => {
        let content = '';
        try {
          if (f.name.match(/\.(txt|csv|md)$/i) || f.type.startsWith('text/')) {
            content = await f.text();
            content = content.trim() ? content.substring(0, 100) + (content.length > 100 ? '...' : '') : '[Arquivo vazio]';
          } else {
            content = `[Conteúdo binário - ${Math.round(f.size / 1024)} KB]`;
          }
        } catch (e) {
          content = '[Erro ao ler arquivo]';
        }
        
        return {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${i}`,
          name: f.name,
          type: f.name.endsWith('.pdf') ? 'pdf' : f.name.match(/\.(xlsx?|csv)$/i) ? 'excel' : 'text',
          status: 'Processando...',
          content,
        };
      })
    );
    
    addFiles(newFiles);
    
    // Simulate processing
    setTimeout(() => {
      newFiles.forEach((f) => {
        updateFileStatus(f.id, 'Processado');
      });
    }, 2000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDrop = async (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.items) {
      // Usar a API de itens para suportar pastas no drop
      const items = Array.from(e.dataTransfer.items).map((item: any) => item.webkitGetAsEntry());
      const allFiles: File[] = [];
      
      const readEntry = async (entry: any) => {
        if (!entry) return;
        if (entry.isFile) {
          return new Promise<void>((resolve) => {
            entry.file((file: File) => {
              allFiles.push(file);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          return new Promise<void>((resolve) => {
            dirReader.readEntries(async (entries: any[]) => {
              for (const childEntry of entries) {
                await readEntry(childEntry);
              }
              resolve();
            });
          });
        }
      };

      for (const entry of items) {
        await readEntry(entry);
      }
      
      if (allFiles.length > 0) {
        processFiles(allFiles);
      }
    } else if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileInput = (e: any) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = null;
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="mt-1">
          <BackButton />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-100">Base de Conhecimento</h1>
          <p className="mt-1 text-sm text-slate-400">
            Faça upload de planilhas, PDFs e textos. O assistente usará esses dados para gerar estratégias.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition backdrop-blur-xl ${
              isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20 bg-white/5 hover:border-indigo-400'
            }`}
          >
            <div className="mb-4 rounded-full bg-indigo-500/20 p-4">
              <UploadCloud className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="mb-1 font-heading text-lg font-semibold text-slate-100">Clique ou arraste arquivos e pastas aqui</h3>
            <p className="text-sm text-slate-400">PDF, Excel, TXT (Max 200 documentos)</p>
            <div className="flex gap-4 mt-6">
              <label className="cursor-pointer rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600">
                Selecionar Arquivos
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv" 
                  onChange={handleFileInput} 
                />
              </label>
              <label className="cursor-pointer rounded-lg bg-teal-500/20 border border-teal-500/30 px-4 py-2 text-sm font-medium text-teal-400 transition hover:bg-teal-500/30">
                Selecionar Pasta
                <input 
                  type="file" 
                  className="hidden" 
                  /* @ts-expect-error webkitdirectory is non-standard but supported by all major browsers */
                  webkitdirectory="" 
                  directory=""
                  multiple 
                  onChange={handleFileInput} 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Existing Files */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-lg font-semibold text-slate-100">Documentos Processados</h2>
          <div className="flex flex-col gap-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-3 transition">
                <div className="flex items-center gap-3">
                  {file.type === 'pdf' ? (
                    <FileText className="h-5 w-5 text-red-400" />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5 text-teal-400" />
                  )}
                  <div>
                    <p className="max-w-[150px] truncate text-sm font-medium text-slate-100" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex flex-col text-xs text-slate-400 mt-0.5">
                      <div className="flex items-center">
                        {file.status === 'Processado' ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3 text-teal-400" /> Processado
                          </>
                        ) : (
                          <span className="text-indigo-400">{file.status}</span>
                        )}
                      </div>
                      {/* @ts-ignore */}
                      {file.content && (
                        /* @ts-ignore */
                        <span className="text-[10px] text-slate-500 max-w-[150px] truncate mt-0.5" title={file.content}>
                          {/* @ts-ignore */}
                          {file.content}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(file.id)}
                  className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
