import { getProcesso } from "@/lib/db";
import { buildEsajUrl } from "@/lib/esaj-url";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Users, File } from "lucide-react";

const R2_BASE = "https://pub-ab6b3c8d346b45e5bd8c07a045a67614.r2.dev";

export default async function ProcessoPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const numeroDecoded = decodeURIComponent(numero);
  const processo = getProcesso(numeroDecoded);

  if (!processo) notFound();

  const partes = processo.partes_json ? JSON.parse(processo.partes_json) : [];
  const pdfs: { key: string; name: string }[] = processo.pdfs_json
    ? JSON.parse(processo.pdfs_json)
    : [];

  const infoItems = [
    { label: "Classe", value: processo.classe_nome },
    { label: "Assunto", value: processo.assunto_nome },
    { label: "Juiz", value: processo.juiz, link: processo.juiz ? `/juiz/${encodeURIComponent(processo.juiz)}` : undefined },
    { label: "Valor da Acao", value: processo.valor_acao || "-" },
    { label: "Foro", value: processo.foro || processo.orgao_julgador },
    { label: "Vara", value: processo.vara || "-" },
    { label: "Data Ajuizamento", value: processo.data_ajuizamento },
    { label: "Grau", value: processo.grau },
    { label: "Situacao", value: processo.situacao || "-" },
    { label: "Movimentacoes", value: String(processo.num_movimentacoes) },
  ];

  return (
    <div>
      {processo.juiz ? (
        <a href={`/juiz/${encodeURIComponent(processo.juiz)}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para {processo.juiz}
        </a>
      ) : (
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </a>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight sm:text-2xl">{processo.numero}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{processo.classe_nome}</p>
        </div>
        <a
          href={buildEsajUrl(processo.numero)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium no-underline shadow-sm transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Abrir no e-SAJ
        </a>
      </div>

      {/* Grid de informacoes */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {infoItems.map((item) => (
            <div key={item.label} className="border-b border-r border-border/50 px-4 py-3.5">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</div>
              {item.link ? (
                <a href={item.link} className="mt-1 block text-sm font-medium text-primary no-underline hover:underline">
                  {item.value}
                </a>
              ) : (
                <div className="mt-1 text-sm font-medium">{item.value || "-"}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Partes */}
      {partes.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Partes</h2>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="divide-y divide-border/50">
              {partes.map((p: { tipo: string; nome: string; advogados: { nome: string; oab: string }[] }, i: number) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {p.tipo}
                    </span>
                    <span className="text-sm font-medium">{p.nome}</span>
                  </div>
                  {p.advogados?.map((adv, j: number) => (
                    <div key={j} className="mt-1.5 pl-16 text-xs text-muted-foreground">
                      Adv: {adv.nome}
                      {adv.oab && <span className="ml-1 opacity-70">(OAB {adv.oab})</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Documentos */}
      {pdfs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Documentos
              <span className="ml-2 text-sm font-normal text-muted-foreground">{pdfs.length} PDFs</span>
            </h2>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="divide-y divide-border/50">
              {pdfs.map((pdf, i) => (
                <a
                  key={i}
                  href={`${R2_BASE}/${encodeURI(pdf.key)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 text-sm no-underline transition-colors hover:bg-muted/40"
                >
                  <FileText className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="font-medium text-foreground">{pdf.name}</span>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sentenca */}
      {processo.sentenca_texto && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Sentenca
              <span className="ml-2 text-sm font-normal text-muted-foreground">texto extraido</span>
            </h2>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-border shadow-sm">
            <div className="max-h-[600px] overflow-y-auto px-6 py-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{processo.sentenca_texto}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
