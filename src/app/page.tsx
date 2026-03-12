import { getDbStats, getTopJuizes } from "@/lib/db";
import { SearchBox } from "./search-box";
import { Database, Users, FileText, Scale } from "lucide-react";

export default function Home() {
  const stats = getDbStats();
  const topJuizes = getTopJuizes(30);

  const statCards = [
    { label: "Total de Processos", value: stats.total.toLocaleString("pt-BR"), icon: Database },
    { label: "Enriquecidos ESAJ", value: stats.extraidos.toLocaleString("pt-BR"), icon: Scale },
    { label: "Juiz Identificado", value: stats.com_juiz.toLocaleString("pt-BR"), icon: Users },
    { label: "Com Sentenca", value: stats.com_sentenca.toLocaleString("pt-BR"), icon: FileText },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="pb-8 pt-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Buscar Juiz</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Base de processos tributarios &mdash; TJSP 2025
        </p>
        <div className="mt-8">
          <SearchBox />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{s.label}</span>
            </div>
            <div className="mt-2 text-2xl font-bold tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Top Juizes */}
      {topJuizes.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold">
            Top Juizes
            <span className="ml-2 text-sm font-normal text-muted-foreground">por volume</span>
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Juiz</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Processos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Com Sentenca</th>
                </tr>
              </thead>
              <tbody>
                {topJuizes.map((j, i) => (
                  <tr key={j.juiz} className="border-b border-border/50 transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      <a href={`/juiz/${encodeURIComponent(j.juiz)}`} className="text-foreground no-underline hover:underline">
                        {j.juiz}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{j.total.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{j.com_sentenca.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
