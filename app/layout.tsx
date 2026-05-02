import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FileProvider } from "./context/FileContext";
import { SettingsProvider } from "./context/SettingsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GMN PRO Assistant",
  description: "Estrategista Chefe de SEO Local e GMN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <SettingsProvider>
          <FileProvider>
            {children}
          </FileProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
