import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prismaDB } from "@/lib/prisma";
import DocumentRow from "@/components/documentrow";

export default async function ArchivioPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { user } = session;
  const isAdmin = user.ruolo === "admin";
  const isGestore = user.ruolo === "gestore";
  

const utenteId = Number(user.id);

const [recenti, numeroConsultati] = await Promise.all([
  prismaDB.consultazioni.findMany({
    where: { utente_id: utenteId, documenti: { online: 1 } },
    orderBy: { consultato_il: "desc" },
    take: 5,
    include: {
      documenti: {
        include: { tipologie_documento: true, archivio: true, testata: true },
      },
    },
  }),
  prismaDB.consultazioni.count({
    where: { utente_id: utenteId, documenti: { online: 1 } },
  }),
]);
  

  const numeroDocumenti = await prismaDB.documenti.count({
    where: {
      online: 1,
    },
  });

  const numeroFonti = await prismaDB.db_sorgenti.count();

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px]">
      <div className="mx-auto max-w-[1600px] px-6 py-14 md:px-10 md:py-20">

    <header className="border-b border-paper/30 pb-10 md:pb-12 text-center flex flex-col items-center">
          <div className="flex flex-col items-center gap-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
                  CineArc
                </span>
                <span className="h-px w-8 bg-paper/40" />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/70">
                  Area privata
                </span>
              </div>

              <h1 className="mt-5 font-display text-6xl leading-[0.9] text-paper md:text-8xl">
                Archivio.
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-paper/75">
                Consultazione dei materiali documentari conservati
                nell&apos;archivio CineArc.
              </p>
            </div>


          </div>
        </header>

        <section className="border-b border-paper/25 py-8">
          <div className={`grid gap-px bg-paper/15 ${
          isGestore ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
>
            <Link
              href="/archivio/esplora"
              className="group bg-forest-700 px-6 py-7 transition-colors hover:bg-forest-600 md:px-8"
            >

              <h2 className="mt-3 font-display text-2xl text-paper transition-colors group-hover:text-ochre-400">
                Documenti
              </h2>
              <p className="mt-2 max-w-xs text-xs leading-6 text-paper/70">
                Consulta il patrimonio documentario dell&apos;archivio.
              </p>
            </Link>


            <Link
              href="/archivio/profilo"
              className="group bg-forest-700 px-6 py-7 transition-colors hover:bg-forest-600 md:px-8 block"
            >
              
              <div className="mt-3 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                <div>
                  <h2 className="font-display text-2xl text-paper transition-colors group-hover:text-ochre-400">
                    Profilo
                  </h2>
                  <p className="mt-2 max-w-[200px] text-xs leading-6 text-paper/70">
                    Il tuo profilo ed il tuo ruolo.
                  </p>
                </div>
                
                <div className="border-l border-paper/10 pl-4 font-mono text-xs tracking-wide text-paper/60 shrink-0">
                  <span className="mb-2 block text-[9px] uppercase tracking-widest text-bordeaux-500">
                    Identificazione utente
                  </span>
                  <div className="space-y-1">
                    <div>NOME: <span className="text-paper">{user.name || user.email}</span></div>
                    <div>RUOLO: <span className="text-ochre-400">{user.ruolo}</span></div>
                    <div>MATR: <span className="text-paper">#{user.id?.slice(0, 8).toUpperCase() ?? "ND"}</span></div>
                  </div>
                </div>
              </div>
            </Link>
            
            {(isGestore || isAdmin) && (
            <Link
              href="/archivio/nuovo"
              className="group bg-forest-700 px-6 py-7 transition-colors hover:bg-forest-600 md:px-8"
            >
              <h2 className="mt-3 font-display text-2xl text-paper transition-colors group-hover:text-ochre-400">
                Nuovo documento
              </h2>
              <p className="mt-2 max-w-xs text-xs leading-6 text-paper/70">
                Inserisci un nuovo documento nell&apos;archivio.
              </p>
            </Link>
            )}

          
            {isAdmin && (
            <Link
              href="./admin/utenti"
              className="group bg-forest-700 px-6 py-7 transition-colors hover:bg-forest-600 md:px-8"
            >
              <h2 className="mt-3 font-display text-2xl text-paper transition-colors group-hover:text-ochre-400">
                Gestione utenti
              </h2>
              <p className="mt-2 max-w-xs text-xs leading-6 text-paper/70">
                Gestisci gli utenti dell&apos;archivio.
              </p>
            </Link>
          )}

          </div>
        </section>

        <section className="py-14 md:py-18">
          <div className="flex items-end justify-between border-b border-paper/25 pb-5">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
                01 / Panoramica
              </span>
              <h2 className="mt-3 font-display text-3xl text-paper md:text-4xl">
                Stato dell&apos;archivio
              </h2>
            </div>

            <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-paper/55 md:block">
              Dati dal database
            </span>
          </div>

          <div className="grid gap-px bg-paper/15 md:grid-cols-3">
            <div className="bg-forest-700 px-6 py-8 md:px-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper/65">
                Documenti
              </span>

              <div className="mt-4 font-mono text-4xl text-ochre-400">
                {numeroDocumenti}
              </div>

              <p className="mt-3 text-xs leading-6 text-paper/65">
                Materiali presenti nell&apos;archivio
              </p>
            </div>

            <div className="bg-forest-700 px-6 py-8 md:px-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper/65">
                Consultazione
              </span>

              <div className="mt-4 font-mono text-4xl text-ochre-400">
                {numeroConsultati}
              </div>

              <p className="mt-3 text-xs leading-6 text-paper/65">
                Documenti recenti visualizzati
              </p>
            </div>

            <div className="bg-forest-700 px-6 py-8 md:px-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper/65">
                Fonti collegate
              </span>

              <div className="mt-4 font-mono text-4xl text-ochre-400">
                {numeroFonti}
              </div>

              <p className="mt-3 text-xs leading-6 text-paper/65">
                Archivi e database di provenienza
              </p>
            </div>
          </div>
        </section>

        <section className="pb-14 md:pb-20">
          <div className="border-t border-paper/30 pt-6">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              02 / Consultati di recente
            </span>
          </div>

          {recenti.length === 0 ? (
            <div className="mt-6 border border-paper/20 bg-forest-700 px-6 py-10 text-center">
              <p className="text-sm text-paper/65">
                Non hai ancora consultato documenti.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-paper/15 border border-paper/20 bg-forest-700">
              {recenti.map((c) => (
                <DocumentRow
                  key={c.documento_id}
                  documento={c.documenti}
                  href={`/documenti/${c.documento_id}`}
                />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/archivio/esplora"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
            >
              Visualizza intero registro ↓
            </Link>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-paper/25 pt-5 md:flex-row">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/50">
            CineArc · Archivio digitale
          </span>

          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/50">
            1900 — 2000
          </span>
        </footer>

      </div>
    </main>
  );
}