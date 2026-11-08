import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import HeroCanvas from "@/components/HomeCanvas";

function StampMark() {
  return (
    <div
      className="stamp-mark absolute -right-6 top-10 hidden rotate-[-11deg] select-none lg:block"
      aria-hidden="true"
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-bordeaux-500/70 text-center">
        <span className="font-mono text-[8px] uppercase leading-tight tracking-[0.15em] text-bordeaux-400/90">
          Vietato
          <br />
          alla
          <br />
          visione
        </span>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="cinearc-noise min-h-screen overflow-hidden bg-forest-950">

      <section className="relative flex min-h-screen items-center">

        <HeroCanvas />

  
        <div className="absolute inset-0 bg-forest-950/45" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(198,169,103,0.10),transparent_32%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pb-20 pt-32 md:px-10 lg:pb-28">

          <div className="grid min-h-[70vh] items-center lg:grid-cols-[1.15fr_0.85fr]">

    
            <div className="relative">

              <div className="mb-8 flex items-center gap-4">
                <span className="h-px w-12 bg-ochre-400" />

                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ochre-400">
                  Archivio digitale
                </span>
              </div>

              <h1 className="max-w-4xl font-display text-[clamp(4rem,9vw,9rem)] font-normal leading-[0.82] tracking-[-0.045em] text-paper">
                Cinema
                <br />
                <span className="text-paper/80">
                  oltre
                </span>
                <br />
                <span className="text-bordeaux-400">
                  la censura.
                </span>
              </h1>

              <p className="mt-10 max-w-lg text-base leading-7 text-paper/60 md:text-lg">
                Un archivio digitale di documenti storici
                sulla censura cinematografica: le pellicole
                fermate, tagliate o vietate per motivi
                religiosi e morali nel corso del Novecento.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">

                <Link
                  href="/il-progetto"
                  className="group inline-flex items-center gap-4 border border-paper/20 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-paper transition-all hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950"
                >
                  Scopri il progetto

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href={session ? "/archivio" : "/login?callbackUrl=%2Farchivio"}
                  className="group inline-flex items-center gap-3 px-3 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-ochre-400"
                >
                  Accedi all'archivio

                  <span className="transition-transform group-hover:translate-x-1">
                    ↗
                  </span>
                </Link>

              </div>
            </div>

            <div className="relative hidden h-[520px] lg:block">

              <StampMark />

              <div className="absolute right-0 top-1/2 h-[420px] w-[270px] -translate-y-1/2 rotate-[6deg] border border-paper/10 bg-forest-900/40 backdrop-blur-sm">

                <div className="absolute inset-4 border border-ochre-400/20" />

                <div className="absolute left-8 top-8 font-mono text-[9px] uppercase tracking-[0.2em] text-paper/40">
                  CINEARC
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="mb-3 h-px bg-bordeaux-500/50" />

                  <p className="font-display text-3xl leading-none text-paper/80">
                    Film.
                    <br />
                    Memoria.
                    <br />
                    Archivio.
                  </p>
                </div>

                <div className="absolute -left-2 top-6 flex h-[calc(100%-48px)] flex-col justify-between">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-4 w-2 rounded-[1px] bg-paper/10"
                    />
                  ))}
                </div>

                <div className="absolute -right-2 top-6 flex h-[calc(100%-48px)] flex-col justify-between">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-4 w-2 rounded-[1px] bg-paper/10"
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-8 left-10 font-mono text-[9px] uppercase tracking-[0.22em] text-paper/30">
                Digital archive / 20th century cinema
              </div>

            </div>

          </div>

          <div className="absolute bottom-8 left-6 flex items-center gap-4 md:left-10">
            <span className="h-10 w-px bg-paper/20" />

            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/30">
              Scroll to explore
            </span>
          </div>

        </div>
      </section>

      <section className="relative border-t border-paper/10 bg-forest-950">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40">

          <div className="grid gap-16 md:grid-cols-[0.8fr_1.2fr] md:gap-24">

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ochre-400">
                01 / Il progetto
              </span>
            </div>

            <div>
              <h2 className="max-w-4xl font-display text-4xl leading-tight text-paper md:text-6xl">
                Un archivio per leggere
                <span className="text-paper/40">
                  {" "}le tracce lasciate dalla censura.
                </span>
              </h2>

              <p className="mt-8 max-w-2xl text-base leading-8 text-paper/50">
                CineArc raccoglie e organizza documenti
                storici sulla censura cinematografica italiana:
                recensioni, verbali, carte d'archivio che
                raccontano perché un film veniva fermato,
                tagliato o vietato.
              </p>

              <Link
                href="/il-progetto"
                className="mt-10 inline-flex border-b border-ochre-400/50 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ochre-400 transition-colors hover:border-ochre-400 hover:text-paper"
              >
                Approfondisci →
              </Link>
            </div>

          </div>
        </div>
      </section>

      <section className="relative border-t border-paper/10 bg-forest-800">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-36">

          <div className="grid items-end gap-12 md:grid-cols-[1fr_auto]">

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ochre-400">
                02 / Archivio
              </span>

              <h2 className="mt-6 max-w-3xl font-display text-5xl leading-[0.95] text-paper md:text-7xl">
                Entra nell'
                <br />
                Archivio.
              </h2>
            </div>

            <Link
              href={session ? "/archivio" : "/login?callbackUrl=%2Farchivio"}
              className="group flex h-20 w-20 shrink-0 items-center justify-center border border-ochre-500/40 text-paper transition-all hover:border-ochre-400 hover:bg-ochre-500 hover:text-paper md:h-28 md:w-28"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.15em]">
                Accedi
                <br />
                →
              </span>
            </Link>

          </div>

        </div>
      </section>

      <footer className="border-t border-paper/10 bg-forest-950">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">

          <span className="font-mono text-[10px] tracking-[0.2em] text-paper/40">
            CINEARC
          </span>

          <div className="flex flex-wrap gap-6 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/30">
            <Link href="/il-progetto" className="hover:text-paper">
              Il progetto
            </Link>

            <Link href="/timeline" className="hover:text-paper">
              Timeline
            </Link>

            <Link href="/fonti" className="hover:text-paper">
              Fonti
            </Link>
          </div>

        </div>
      </footer>

    </main>
  );
}