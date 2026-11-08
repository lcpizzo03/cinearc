import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

export default async function TimelinePage() {
  const session = await getServerSession(authOptions);

  const href = (destinazione: string) =>
    session
      ? destinazione
      : `/login?callbackUrl=${encodeURIComponent(destinazione)}`;

  const [perAnno, senzaData] = await Promise.all([
    prismaDB.documenti.groupBy({
      by: ["aa"],
      where: { online: 1, aa: { gte: 1800, lte: 2100 } },
      _count: { _all: true },
      orderBy: { aa: "asc" },
    }),
    prismaDB.documenti.count({
      where: {
        online: 1,
        OR: [{ aa: null }, { aa: { lt: 1800 } }, { aa: { gt: 2100 } }],
      },
    }),
  ]);

  const anni = perAnno
    .filter((r): r is typeof r & { aa: number } => r.aa !== null)
    .map((r) => ({ anno: r.aa, n: r._count._all }));

  const decenni = new Map<number, { anno: number; n: number }[]>();
  for (const a of anni) {
    const d = Math.floor(a.anno / 10) * 10;
    decenni.set(d, [...(decenni.get(d) ?? []), a]);
  }
  const elenco = [...decenni.entries()].sort((a, b) => a[0] - b[0]);
  const maxAnno = Math.max(1, ...anni.map((a) => a.n));

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
              Timeline
            </span>
          </div>

          <h1 className="mt-5 font-display text-6xl leading-[0.9] text-paper md:text-8xl">
            Timeline.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-paper/75">
            I documenti dell&apos;archivio distribuiti nel tempo. Ogni anno
            rimanda ai documenti di quell&apos;anno.
          </p>
        </header>

        <ol className="space-y-6 py-10">
          {elenco.map(([decennio, righe]) => {
            const totale = righe.reduce((s, r) => s + r.n, 0);

            return (
              <li
                key={decennio}
                className="grid gap-6 border border-paper/25 bg-forest-700 p-6 md:grid-cols-[140px_1fr] md:p-10"
              >
                <div>
                  <p className="font-display text-4xl text-ochre-400">
                    {decennio}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
                    {totale.toLocaleString("it-IT")} documenti
                  </p>
                </div>

                <ul className="divide-y divide-paper/15 border-y border-paper/15">
                  {righe.map((r) => (
                    <li key={r.anno}>
                      <Link
                        href={href(`/archivio/esplora?anno=${r.anno}`)}
                        className="group grid grid-cols-[50px_1fr_60px] items-center gap-4 py-2.5"
                      >
                        <span className="font-mono text-xs text-paper/75 transition-colors group-hover:text-ochre-400">
                          {r.anno}
                        </span>
                        <div className="h-1.5 bg-paper/15">
                          <div
                            className="h-1.5 bg-ochre-400/70 transition-colors group-hover:bg-ochre-400"
                            style={{ width: `${(r.n / maxAnno) * 100}%` }}
                          />
                        </div>
                        <span className="text-right font-mono text-xs text-paper/70">
                          {r.n.toLocaleString("it-IT")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>

        {senzaData > 0 && (
          <p className="pb-10 text-xs text-paper/60">
            Altri {senzaData.toLocaleString("it-IT")} documenti non hanno una
            data indicata e non compaiono nella timeline.
          </p>
        )}

        <footer className="border-t border-paper/25 pt-8">
          <Link
            href={href("/archivio/esplora")}
            className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
          >
            Esplora i documenti →
          </Link>
        </footer>
      </div>
    </main>
  );
}