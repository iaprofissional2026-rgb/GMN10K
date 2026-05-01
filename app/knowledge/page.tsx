'use client';

import { useState } from 'react';
import { UploadCloud, FileText, FileSpreadsheet, CheckCircle2, Trash2, Archive } from 'lucide-react';
import { useFiles } from '@/app/context/FileContext';
import JSZip from 'jszip';

export default function KnowledgeBase() {
  const { files, addFiles, removeFile, updateFileStatus } = useFiles();

  const [isDragging, setIsDragging] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    const processedFiles: any[] = [];

    for (const f of filesArray) {
      if (f.name.endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(f);
          
          const zipProcessed: any[] = [];
          
          for (const [filename, fileData] of Object.entries(zipContent.files)) {
            if (fileData.dir) continue;
            
            // Only process text-like files inside zip for now
            if (filename.match(/\.(txt|csv|md|json|html)$/i)) {
              let textContent = await fileData.async('string');
              zipProcessed.push({
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                name: `${f.name} > ${filename}`,
                type: 'text',
                status: 'Processado',
                content: textContent.trim() ? textContent.substring(0, 50000) : '[Arquivo vazio]'
              });
            }
          }
          
          if (zipProcessed.length > 0) {
            addFiles(zipProcessed);
          }
        } catch (err) {
          console.error("Erro ao ler ZIP:", err);
        }
        continue;
      }
 
      let content = '';
      try {
        if (f.name.match(/\.(txt|csv|md)$/i) || f.type.startsWith('text/')) {
          content = await f.text();
          content = content.trim() ? content.substring(0, 50000) : '[Arquivo vazio]';
        } else {
          content = `[Conteúdo binário - ${Math.round(f.size / 1024)} KB]`;
        }
      } catch (e) {
        content = '[Erro ao ler arquivo]';
      }
      
      const newFile = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        name: f.name,
        type: f.name.endsWith('.pdf') ? 'pdf' : f.name.match(/\.(xlsx?|csv)$/i) ? 'excel' : 'text',
        status: 'Processando...',
        content,
      };
      
      addFiles([newFile]);
      
      // Simulate processing completion
      setTimeout(() => {
        updateFileStatus(newFile.id, 'Processado');
      }, 1500);
    }
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
    <div className="p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Base de Conhecimento</h1>
        <p className="text-xs md:text-sm text-slate-400">
          Upload de arquivos (PDF, CSV, TXT, ZIP) para treinar seu assistente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 md:p-16 transition-all duration-300 backdrop-blur-xl group relative overflow-hidden ${
              isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-slate-900/40 hover:border-emerald-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div className={`mb-6 rounded-full p-6 transition-all duration-300 ${isDragging ? 'bg-emerald-500/20 text-emerald-400 scale-110' : 'bg-white/5 text-slate-400 group-hover:text-emerald-400'}`}>
              <UploadCloud className="h-10 w-10 md:h-12 md:w-12" />
            </div>
            <h3 className="mb-2 font-heading text-lg md:text-xl font-bold text-white text-center">Arraste arquivos ou pastas aqui</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-8 text-center uppercase tracking-widest font-bold">PDF, Excel, TXT, ZIP</p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <label className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                Arquivos
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.zip" 
                  onChange={handleFileInput} 
                />
              </label>
              <label className="cursor-pointer rounded-xl bg-slate-800 border border-white/10 px-6 py-3 text-sm font-bold text-slate-200 transition-all hover:bg-slate-700 active:scale-95 flex items-center justify-center gap-2">
                Pasta
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

          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-6 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-50 mb-1">Processamento Inteligente</h4>
              <p className="text-xs text-emerald-100/70 leading-relaxed">
                Arquivos ZIP são descompactados automaticamente. O conteúdo é processado para auxiliar o Assistente em prospecções e fechamentos.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Files */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col h-fit lg:max-h-[600px]">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
            <h2 className="font-heading text-base font-bold text-white uppercase tracking-wider">Base de Dados</h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              {files.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {files.length > 0 ? (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 p-3.5 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg bg-white/5 group-hover:scale-105 transition-transform`}>
                      {file.type === 'pdf' ? (
                        <FileText className="h-5 w-5 text-red-400" />
                      ) : file.name.includes(' > ') || file.name.endsWith('.zip') ? (
                        <Archive className="h-5 w-5 text-amber-400" />
                      ) : (
                        <FileSpreadsheet className="h-5 w-5 text-teal-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-100 pr-2" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {file.status === 'Processado' ? (
                          <span className="text-teal-400 flex items-center">
                            <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> OK
                          </span>
                        ) : (
                          <span className="text-indigo-400">{file.status}</span>
                        )}
                        <span>&middot;</span>
                        <span className="truncate max-w-[100px]">
                          {/* @ts-ignore */}
                          {file.content ? 'COM CONTEÚDO' : 'VAZIO'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <FileText className="mb-4 h-12 w-12 text-slate-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Documentos aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
