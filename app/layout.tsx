import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { FloatingMedia } from '@/components/FloatingMedia';
import { FileProvider } from '@/app/context/FileContext';
import { SettingsProvider } from '@/app/context/SettingsContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Assistente GMN',
  description: 'Prospecção e Gestão Local',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${space.variable}`}>
      <body className="flex h-screen bg-slate-950 font-sans text-slate-100 antialiased relative overflow-hidden" suppressHydrationWarning>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] md:w-[40%] bg-indigo-600/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[40%] md:w-[40%] bg-teal-600/30 rounded-full blur-[120px]"></div>
        </div>
        <SettingsProvider>
          <FileProvider>
            <div className="relative z-10 flex h-full w-full flex-col md:flex-row">
              <Sidebar />
              <main className="relative flex-1 overflow-y-auto pb-16 md:pb-0">
                {children}
              </main>
              <FloatingMedia />
              <MobileNav />
            </div>
          </FileProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
