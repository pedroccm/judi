import type { Metadata } from "next";
import { Scale } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "JuDi - Perfil de Juizes Tributarios TJSP",
  description: "Base de dados de processos tributarios e perfil de juizes do TJSP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
            <a href="/" className="flex items-center gap-2 font-semibold text-foreground no-underline">
              <Scale className="h-5 w-5" />
              <span className="text-lg tracking-tight">JuDi</span>
            </a>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              Juizes Tributarios &middot; TJSP
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
