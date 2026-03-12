import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "tributario_tjsp.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
    _db.pragma("journal_mode = WAL");
  }
  return _db;
}

export interface Processo {
  numero: string;
  classe_codigo: number;
  classe_nome: string;
  assunto_codigo: number;
  assunto_nome: string;
  orgao_julgador: string;
  municipio_ibge: string;
  data_ajuizamento: string;
  grau: string;
  num_movimentacoes: number;
  tem_sentenca: number;
  juiz: string;
  valor_acao: string;
  foro: string;
  vara: string;
  situacao: string;
  partes_json: string;
  sentenca_texto: string;
  esaj_extraido: number;
}

export interface JuizStats {
  juiz: string;
  total_processos: number;
  com_sentenca: number;
  com_texto_sentenca: number;
  classes: { classe: string; qtd: number }[];
  assuntos: { assunto: string; qtd: number }[];
}

export function searchJuizes(query: string, limit = 20): { juiz: string; total: number }[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT juiz, COUNT(*) as total
       FROM processos
       WHERE juiz LIKE ? AND juiz != ''
       GROUP BY juiz
       ORDER BY total DESC
       LIMIT ?`
    )
    .all(`%${query}%`, limit) as { juiz: string; total: number }[];
}

export function getJuizStats(nome: string): JuizStats | null {
  const db = getDb();

  const total = db
    .prepare("SELECT COUNT(*) as c FROM processos WHERE juiz = ?")
    .get(nome) as { c: number } | undefined;

  if (!total || total.c === 0) return null;

  const comSentenca = db
    .prepare("SELECT COUNT(*) as c FROM processos WHERE juiz = ? AND tem_sentenca = 1")
    .get(nome) as { c: number };

  const comTexto = db
    .prepare(
      "SELECT COUNT(*) as c FROM processos WHERE juiz = ? AND sentenca_texto != '' AND sentenca_texto IS NOT NULL"
    )
    .get(nome) as { c: number };

  const classes = db
    .prepare(
      `SELECT classe_nome as classe, COUNT(*) as qtd
       FROM processos WHERE juiz = ?
       GROUP BY classe_nome ORDER BY qtd DESC`
    )
    .all(nome) as { classe: string; qtd: number }[];

  const assuntos = db
    .prepare(
      `SELECT assunto_nome as assunto, COUNT(*) as qtd
       FROM processos WHERE juiz = ?
       GROUP BY assunto_nome ORDER BY qtd DESC LIMIT 15`
    )
    .all(nome) as { assunto: string; qtd: number }[];

  return {
    juiz: nome,
    total_processos: total.c,
    com_sentenca: comSentenca.c,
    com_texto_sentenca: comTexto.c,
    classes,
    assuntos,
  };
}

export function getProcessosByJuiz(
  nome: string,
  page = 1,
  perPage = 50
): { processos: Processo[]; total: number } {
  const db = getDb();

  const total = db
    .prepare("SELECT COUNT(*) as c FROM processos WHERE juiz = ?")
    .get(nome) as { c: number };

  const offset = (page - 1) * perPage;
  const processos = db
    .prepare(
      `SELECT * FROM processos
       WHERE juiz = ?
       ORDER BY data_ajuizamento DESC
       LIMIT ? OFFSET ?`
    )
    .all(nome, perPage, offset) as Processo[];

  return { processos, total: total.c };
}

export function getProcesso(numero: string): Processo | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM processos WHERE numero = ?")
    .get(numero) as Processo | undefined;
  return row ?? null;
}

export function getTopJuizes(limit = 50): { juiz: string; total: number; com_sentenca: number }[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT juiz, COUNT(*) as total,
              SUM(CASE WHEN tem_sentenca = 1 THEN 1 ELSE 0 END) as com_sentenca
       FROM processos
       WHERE juiz != '' AND juiz IS NOT NULL
       GROUP BY juiz
       ORDER BY total DESC
       LIMIT ?`
    )
    .all(limit) as { juiz: string; total: number; com_sentenca: number }[];
}

export function getDbStats(): {
  total: number;
  extraidos: number;
  com_juiz: number;
  com_sentenca: number;
} {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) as c FROM processos").get() as { c: number }).c;
  const extraidos = (
    db.prepare("SELECT COUNT(*) as c FROM processos WHERE esaj_extraido = 1").get() as { c: number }
  ).c;
  const com_juiz = (
    db
      .prepare("SELECT COUNT(*) as c FROM processos WHERE juiz != '' AND juiz IS NOT NULL")
      .get() as { c: number }
  ).c;
  const com_sentenca = (
    db.prepare("SELECT COUNT(*) as c FROM processos WHERE tem_sentenca = 1").get() as { c: number }
  ).c;
  return { total, extraidos, com_juiz, com_sentenca };
}
