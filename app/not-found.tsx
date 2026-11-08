import Link from "next/link";

export default function NotFound() {
  return (
    <main className="cinearc-noise relative flex min-h-screen items-center overflow-hidden bg-forest-950 text-paper">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-ochre-400/20" />
        <div className="absolute left-[8%] top-[18%] h-[55%] w-px bg-paper/[0.06]" />
        <div className="absolute right-[8%] top-[18%] h-[55%] w-px bg-paper/[0.06]" />
        <div className="absolute bottom-[12%] left-1/2 h-px w-[84%] -translate-x-1/2 bg-paper/[0.06]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-28 md:px-10">
        <div className="mb-8 flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ochre-400">
            CineArc
          </span>
          <span className="h-px w-16 bg-ochre-400/40" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/35">
            Errore 404
          </span>
        </div>

        <h1 className="font-display text-7xl leading-[0.94] text-paper md:text-9xl">
          Pagina
          <br />
          non trovata.
        </h1>

        <p className="mt-10 max-w-xl text-sm leading-7 text-paper/55">
          La pagina che cerchi non esiste, è stata spostata oppure non è
          disponibile con il tuo livello di accesso. Come in ogni archivio, a
          volte una segnatura non porta da nessuna parte.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Link
            href="/archivio"
            className="group flex items-center gap-4 border border-ochre-400/50 px-6 py-4 text-paper transition-all hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Vai all&apos;archivio
            </span>
            <span className="text-lg transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-ochre-400"
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </main>
  );
}