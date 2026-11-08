import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

const INTRO_CINEARC =
  "CineArc riunisce in un unico archivio digitale i documenti raccolti da due progetti di ricerca dell'Università degli Studi di Milano, che hanno indagato il rapporto tra il cinema italiano, la Chiesa cattolica e la questione sessuale nel secondo dopoguerra.";

const PROGETTI = [
  {
    sigla: "cattolicesimo",
    titolo: "I cattolici e il cinema in Italia tra gli anni '40 e gli anni '70",
    meta: "Bando PRIN 2012",
    url: "https://sites.unimi.it/cattoliciecinema/home/",
    testo: [
      "La ricerca studia il ruolo del cinema nella negoziazione dei conflitti socio-religiosi in un periodo di profonde trasformazioni della società italiana. L'obiettivo è ricostruire i profili delle istituzioni e delle persone coinvolte e tracciare un primo quadro dei rapporti tra Chiesa cattolica e cinema.",
      "Un'attenzione particolare va ai due estremi del campo: le immagini considerate sacre e quelle ritenute oscene. I documenti sono stati cercati in due direzioni, negli archivi e nello spoglio di quotidiani e riviste, e raccolti in una banca dati pensata per far dialogare chi li raccoglie e chi li interpreta.",
    ],
  },
  {
    sigla: "comizi",
    titolo: "Comizi d'amore. Il cinema e la questione sessuale in Italia (1948-1978)",
    meta: "Bando PRIN 2015 · responsabile scientifico Tomaso Subini",
    url: "https://sites.unimi.it/comizidamore/il-progetto/",
    testo: [
      "Il progetto ha un duplice scopo: studiare come la sessualità sia stata rappresentata dal cinema italiano tra il 1948 e il 1978, e ricostruire i discorsi che in Italia si sono prodotti sul rapporto tra cinema e sessualità.",
      "Il metodo unisce l'analisi di film, materiali promozionali e riviste specializzate con lo scavo d'archivio e lo spoglio della stampa generalista. L'interesse principale è per la natura conflittuale del dibattito su una questione che tocca da vicino l'identità delle persone e dei gruppi.",
    ],
  },
];

export default async function IlProgettoPage() {
  const session = await getServerSession(authOptions);

  const [totale, numeroFonti, numeroArchivi] = await Promise.all([
    prismaDB.documenti.count({ where: { online: 1 } }),
    prismaDB.db_sorgenti.count(),
    prismaDB.archivio.count(),
  ]);

  const hrefArchivio = session ? "/archivio" : "/login?callbackUrl=%2Farchivio";

  const struttura = [
    ["Fonte", "la banca dati di provenienza del documento"],
    ["Archivio", "il fondo o l'istituzione che conserva l'originale"],
    ["Collocamento", "dove il documento è collocato"],
    ["Tipologia", "il tipo di materiale (lettera, articolo, ritaglio...)"],
    ["Parole chiave", "primarie e secondarie, per ricerche mirate"],
    ["Collegamenti", "i rapporti tra documenti dello stesso insieme"],
  ];

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
              Il progetto
            </span>
          </div>

          <h1 className="mt-5 font-display text-6xl leading-[0.9] text-paper md:text-8xl">
            Il progetto.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-paper/75">
            {INTRO_CINEARC}
          </p>
        </header>

        <section className="py-12">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
            01 / Le origini
          </span>
          <h2 className="mt-3 font-display text-3xl text-paper md:text-4xl">
            Due ricerche, due database
          </h2>

          <div className="mt-8 space-y-6">
            {PROGETTI.map((p) => (
              <article
                key={p.sigla}
                className="border border-paper/25 bg-forest-700 p-6 md:p-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ochre-400">
                  {p.sigla}
                </p>
                <h3 className="mt-3 font-display text-2xl leading-snug text-paper/90 md:text-3xl">
                  {p.titolo}
                </h3>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-paper/60">
                  {p.meta}
                </p>

                <div className="mt-6 space-y-4">
                  {p.testo.map((t) => (
                    <p key={t.slice(0, 24)} className="max-w-3xl text-sm leading-7 text-paper/75">
                      {t}
                    </p>
                  ))}
                </div>

                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-400 transition-colors hover:text-ochre-500"
                >
                  Sito del progetto ↗
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-paper/25 py-12">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
            02 / Integrazione
          </span>
          <h2 className="mt-3 font-display text-3xl text-paper md:text-4xl">
            Un unico archivio
          </h2>

          <p className="mt-6 max-w-3xl text-sm leading-7 text-paper/75">
            Ciascun progetto aveva la propria banca dati, consultabile sul
            proprio sito. CineArc le riunisce in una sola, così che i documenti
            dei due insiemi si possano cercare insieme e confrontare. Ogni
            documento conserva l&apos;indicazione della banca dati di origine e
            un numero progressivo all&apos;interno di essa, quindi resta sempre
            riconducibile alla fonte da cui proviene.
          </p>

          <div className="mt-8 grid gap-px bg-paper/15 md:grid-cols-3">
            {[
              [totale.toLocaleString("it-IT"), "documenti consultabili"],
              [String(numeroFonti), "database integrati"],
              [numeroArchivi.toLocaleString("it-IT"), "archivi di provenienza"],
            ].map(([n, label]) => (
              <div key={label} className="bg-forest-700 px-6 py-8 md:px-8">
                <div className="font-mono text-4xl text-ochre-400">{n}</div>
                <p className="mt-3 text-xs leading-6 text-paper/65">{label}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-12 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65">
            Come è organizzato ogni documento
          </h3>
          <dl className="mt-4 divide-y divide-paper/15 border-y border-paper/25">
            {struttura.map(([k, v]) => (
              <div
                key={k}
                className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-6"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-400">
                  {k}
                </dt>
                <dd className="text-sm text-paper/75">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="border-t border-paper/25 pt-8">
          <p className="max-w-2xl text-xs leading-6 text-paper/60">
            Le descrizioni dei due progetti sono tratte dai rispettivi siti,
            realizzati dall&apos;Università degli Studi di Milano:{" "}
            <a
              href="https://sites.unimi.it/cattoliciecinema/home/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ochre-400 underline-offset-4 hover:underline"
            >
              I cattolici e il cinema
            </a>{" "}
            e{" "}
            <a
              href="https://sites.unimi.it/comizidamore/il-progetto/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ochre-400 underline-offset-4 hover:underline"
            >
              Comizi d&apos;amore
            </a>
            .
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/fonti"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
            >
              Le fonti →
            </Link>
            <Link
              href={hrefArchivio}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
            >
              Vai all&apos;archivio →
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}