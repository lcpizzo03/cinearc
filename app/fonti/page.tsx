import Link from "next/link";
import { prismaDB } from "@/lib/prisma";

export const revalidate = 3600;

const SOGLIA_PRINCIPALI = 500;

const NOMI_ARCHIVI: Record<string, string> = {
  ACEC: "Archivio dell'Associazione Cattolica Esercenti Cinema",
  ANT: "Archivio Nazareno Taddei",
  ASILS: "Archivio Storico dell'Istituto Luigi Sturzo",
  ISACEM:
    "Istituto per la storia dell'Azione Cattolica e del Movimento Cattolico in Italia Paolo VI",
  PER: "Periodici e altre pubblicazioni a stampa",

  ACEI: "Archivio della CEI (Conferenza Episcopale Italiana)",
  ACS: "Archivio Centrale dello Stato",
  ADFF: "Archivio Diego Fabbri Forlì",
  ADFR: "Archivio Diego Fabbri Roma (archivio privato della famiglia Fabbri)",
  AFMER:
    "Archivio Storico della Provincia di Cristo Re dei Frati Minori dell'Emilia Romagna",
  AGG: "Archivio Giovannino Guareschi",
  AGOFM: "Archivio Storico Generale dell'Ordine dei Frati Minori",
  AGOP: "Archivio Generale della Curia Generalizia OP",
  ALGC: "Archivio LUISS Guido Carli",
  APCC: "Archivio della Pro Civitate Christiana",
  APSMSM: "Archivio della Provincia Romana di S. Caterina da Siena OP",
  ASAC: "Archivio Storico delle Arti Contemporanee",
  ASDMI: "Archivio Storico Diocesano di Milano",
  AT: "Archivio Turoldo presso l'Abbazia S. Egidio in Fontanella",
  ATS: "Archivio privato di Tomaso Subini",
  CCSF: "Archivio del Centro Culturale San Fedele di Milano",
  DGC: "Archivio della Direzione Generale per il Cinema",
  FIG: "Archivio della Fondazione Istituto Gramsci",
  UCCC: "Archivio dell'Ufficio Cinema della Curia di Como",
};

type RigaArchivio = { arc: string; n: number };

function Riga({ r }: { r: RigaArchivio }) {
  return (
    <li className="flex items-baseline justify-between gap-6 py-3">
      <span className="text-sm text-paper/80">
        <span className="font-mono text-ochre-400">{r.arc}</span>
        {NOMI_ARCHIVI[r.arc] && (
          <span className="ml-3 text-paper/65">{NOMI_ARCHIVI[r.arc]}</span>
        )}
      </span>
      <span className="shrink-0 font-mono text-xs text-paper/70">
        {r.n.toLocaleString("it-IT")}
      </span>
    </li>
  );
}

export default async function FontiPage() {
  const [fonti, gruppi, archivi] = await Promise.all([
    prismaDB.db_sorgenti.findMany({ orderBy: { nome_db_origine: "asc" } }),
    prismaDB.documenti.groupBy({
      by: ["db_sorgente", "archivio_id"],
      where: { online: 1 },
      _count: { _all: true },
    }),
    prismaDB.archivio.findMany(),
  ]);

  const nomeArchivio = new Map(archivi.map((a) => [a.id, a.arc]));

  const dati = fonti
    .map((f) => {
      const righe: RigaArchivio[] = gruppi
        .filter((g) => g.db_sorgente === f.id)
        .map((g) => ({
          arc: nomeArchivio.get(g.archivio_id) ?? "—",
          n: g._count._all,
        }))
        .sort((a, b) => b.n - a.n);

      return {
        ...f,
        principali: righe.filter((r) => r.n >= SOGLIA_PRINCIPALI),
        minori: righe.filter((r) => r.n < SOGLIA_PRINCIPALI),
        totale: righe.reduce((s, r) => s + r.n, 0),
      };
    })
    .sort((a, b) => b.totale - a.totale);

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px] text-paper">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
        <header className="border-b border-paper/30 pb-10 md:pb-12">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              CineArc
            </span>
            <span className="h-px w-8 bg-paper/40" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/70">
              Fonti
            </span>
          </div>

          <h1 className="mt-5 font-display text-6xl leading-[0.9] text-paper md:text-8xl">
            Le fonti.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-paper/75">
            I documenti dell&apos;archivio provengono da banche dati e fondi
            diversi. Qui trovi da quali, e quanti documenti ciascuna ha
            contribuito all&apos;archivio.
          </p>
        </header>

        <ol className="space-y-6 py-10">
          {dati.map((f, i) => (
            <li
              key={f.id}
              className="grid gap-6 border border-paper/25 bg-forest-700 p-6 md:grid-cols-[120px_1fr] md:p-10"
            >
              <div>
                <span className="font-mono text-[9px] tracking-[0.2em] text-paper/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-ochre-400">
                  {f.nome_db_origine}
                </p>
              </div>

              <div>
                <h2 className="font-display text-3xl leading-snug text-paper/90">
                  {f.descrizione || f.nome_db_origine}
                </h2>

                <p className="mt-4 font-mono text-sm text-paper/90">
                  {f.totale.toLocaleString("it-IT")}{" "}
                  <span className="text-paper/60">documenti</span>
                </p>

                {(f.principali.length > 0 || f.minori.length > 0) && (
                  <div className="mt-8">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/55">
                      Archivi di provenienza
                    </span>

                    {f.principali.length > 0 && (
                      <ul className="mt-3 divide-y divide-paper/15 border-y border-paper/15">
                        {f.principali.map((r) => (
                          <Riga key={r.arc} r={r} />
                        ))}
                      </ul>
                    )}

                    {f.minori.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-paper/65 transition-colors hover:text-ochre-400">
                          Altri archivi ({f.minori.length})
                        </summary>
                        <ul className="mt-3 divide-y divide-paper/15 border-y border-paper/15">
                          {f.minori.map((r) => (
                            <Riga key={r.arc} r={r} />
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <footer className="border-t border-paper/25 pt-8">
          <p className="max-w-2xl text-xs leading-6 text-paper/60">
            Le denominazioni degli archivi sono tratte dal sito del progetto{" "}
            <a
              href="https://sites.unimi.it/cattoliciecinema/fonti/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ochre-400 underline-offset-4 transition-colors hover:text-ochre-500 hover:underline"
            >
              I cattolici e il cinema in Italia tra gli anni &apos;40 e gli anni
              &apos;70
            </a>{" "}
            (Università degli Studi di Milano).
          </p>

          <Link
            href="/archivio"
            className="mt-8 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
          >
            Vai all&apos;archivio →
          </Link>
        </footer>
      </div>
    </main>
  );
}