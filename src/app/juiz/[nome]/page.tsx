import { getJuizStats, getProcessosByJuiz } from "@/lib/db";
import { buildEsajUrl } from "@/lib/esaj-url";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale, FileText, BookOpen, ChevronLeft, ChevronRight, ExternalLink, Paperclip } from "lucide-react";

export default async function JuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ nome: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { nome } = await params;
  const { page: pageStr } = await searchParams;
  const nomeDecoded = decodeURIComponent(nome);
  const page = parseInt(pageStr || "1");

  const stats = getJuizStats(nomeDecoded);
  if (!stats) notFound();

  const { processos, total } = getProcessosByJuiz(nomeDecoded, page, 50);
  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para busca
      </a>

      <div className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{stats.juiz}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Juiz(a) Tributario(a) &mdash; TJSP</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Scale className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Processos</span>
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{stats.total_processos.toLocaleString("pt-BR")}</div>
        </div>
        <div className="rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Com Sentenca</span>
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{stats.com_sentenca.toLocaleString("pt-BR")}</div>
        </div>
        <div className="rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Texto Completo</span>
          </div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{stats.com_texto_sentenca.toLocaleString("pt-BR")}</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Por Classe</h3>
          </div>
          <div className="divide-y divide-border/50">
            {stats.classes.map((c) => (
              <div key={c.classe} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span>{c.classe}</span>
                <span className="tabular-nums text-muted-foreground">{c.qtd.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-semibold">Por Assunto</h3>
          </div>
          <div className="divide-y divide-border/50">
            {stats.assuntos.map((a) => (
              <div key={a.assunto} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span>{a.assunto}</span>
                <span className="tabular-nums text-muted-foreground">{a.qtd.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de processos */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold">
          Processos
          <span className="ml-2 text-sm font-normal text-muted-foreground">{total.toLocaleString("pt-BR")} no total</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Processo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Classe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Assunto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Sentenca</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">PDFs</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">e-SAJ</th>
                </tr>
              </thead>
              <tbody>
                {processos.map((p) => (
                  <tr key={p.numero} className="border-b border-border/50 transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <a href={`/processo/${encodeURIComponent(p.numero)}`} className="font-mono text-xs font-medium no-underline hover:underline">
                        {p.numero}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.classe_nome}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{p.assunto_nome}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{p.valor_acao?.trim() || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">{p.data_ajuizamento}</td>
                    <td className="px-4 py-3 text-center">
                      {p.tem_sentenca ? (
                        p.sentenca_texto ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Completa</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Sim</span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.pdfs_json && p.pdfs_json !== "[]" && p.pdfs_json !== "" ? (
                        <a href={`/processo/${encodeURIComponent(p.numero)}`} className="inline-flex items-center gap-1 no-underline" title="Ver PDFs">
                          <Paperclip className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs tabular-nums text-blue-500">
                            {JSON.parse(p.pdfs_json).length}
                          </span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a href={buildEsajUrl(p.numero)} target="_blank" rel="noopener noreferrer" className="inline-flex text-muted-foreground transition-colors hover:text-foreground" title="Abrir no e-SAJ">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {page > 1 ? (
              <a href={`/juiz/${encodeURIComponent(nomeDecoded)}?page=${page - 1}`} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium no-underline transition-colors hover:bg-muted">
                <ChevronLeft className="h-4 w-4" /> Anterior
              </a>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-border/50 px-3 text-sm text-muted-foreground">
                <ChevronLeft className="h-4 w-4" /> Anterior
              </span>
            )}
            <span className="px-3 text-sm tabular-nums text-muted-foreground">{page} / {totalPages}</span>
            {page < totalPages ? (
              <a href={`/juiz/${encodeURIComponent(nomeDecoded)}?page=${page + 1}`} className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium no-underline transition-colors hover:bg-muted">
                Proxima <ChevronRight className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex h-9 items-center gap-1 rounded-lg border border-border/50 px-3 text-sm text-muted-foreground">
                Proxima <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
