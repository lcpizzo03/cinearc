import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";
import PasswordForm from "./passwordform";

const RUOLI: Record<string, { nome: string; descrizione: string }> = {
  utente: {
    nome: "Utente",
    descrizione: "Consultazione dei documenti dell'archivio.",
  },
  gestore: {
    nome: "Gestore",
    descrizione: "Consultazione e gestione dei documenti.",
  },
  admin: {
    nome: "Amministratore",
    descrizione: "Gestione dei documenti e degli utenti.",
  },
};

function iniziali(nome: string) {
  const parti = nome.trim().split(/\s+/).filter(Boolean);
  if (parti.length === 0) return "?";
  if (parti.length === 1) return parti[0].slice(0, 2).toUpperCase();
  return (parti[0][0] + parti[parti.length - 1][0]).toUpperCase();
}

export default async function ProfiloPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/archivio/profilo");

  const utente = await prismaDB.utenti.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      id: true,
      username: true,
      email: true,
      nome_completo: true,
      ruolo: true,
    },
  });
  if (!utente) redirect("/login");

  const nome = utente.nome_completo?.trim() || utente.username;
  const ruolo = RUOLI[utente.ruolo] ?? {
    nome: utente.ruolo,
    descrizione: "",
  };

  const dati = [
    { etichetta: "Nome completo", valore: utente.nome_completo?.trim() || "Non indicato" },
    { etichetta: "Username", valore: utente.username },
    { etichetta: "Email", valore: utente.email },
    { etichetta: "Matricola", valore: `#${utente.id}` },
  ];

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px]">
      <div className="mx-auto max-w-[1600px] px-6 py-14 md:px-10 md:py-20">
        <header className="border-b border-paper/30 pb-10">
          <Link
            href="/archivio"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
          >
            ← Archivio
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              CineArc
            </span>
            <span className="h-px w-8 bg-paper/40" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/70">
              Area privata
            </span>
          </div>

          <h1 className="mt-5 font-display text-5xl leading-[0.95] text-paper md:text-7xl">
            Profilo.
          </h1>
        </header>

         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[340px_1fr] lg:gap-10">
          <aside className="border border-paper/25 bg-forest-700 px-6 py-8 md:px-8">
            <div className="flex h-20 w-20 items-center justify-center border border-ochre-400/70 font-display text-3xl text-ochre-400">
              {iniziali(nome)}
            </div>

            <h2 className="mt-6 font-display text-2xl leading-tight text-paper/90">
              {nome}
            </h2>
            <p className="mt-1 font-mono text-xs tracking-wide text-paper/60">
              @{utente.username}
            </p>

            <div className="mt-8 border-t border-paper/15 pt-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/55">
                Ruolo
              </span>
              <p className="mt-2 font-mono text-sm uppercase tracking-[0.15em] text-ochre-400">
                {ruolo.nome}
              </p>
              {ruolo.descrizione && (
                <p className="mt-2 font-display text-sm leading-6 text-paper/70">
                  {ruolo.descrizione}
                </p>
              )}
            </div>
          </aside>

          <div className="space-y-8">
            <section className="border border-paper/25 bg-forest-700">
              <div className="border-b border-paper/20 px-6 py-6 md:px-8">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
                  Dati
                </span>
                <h2 className="mt-3 font-display text-2xl text-paper/90">
                  Dati dell&apos;account
                </h2>
              </div>

              <dl className="divide-y divide-paper/15">
                {dati.map((riga) => (
                  <div
                    key={riga.etichetta}
                    className="grid gap-1 px-6 py-5 sm:grid-cols-[180px_1fr] sm:items-baseline sm:gap-6 md:px-8"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
                      {riga.etichetta}
                    </dt>
                    <dd className="break-all font-display text-lg text-paper/90">
                      {riga.valore}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="border border-paper/25 bg-forest-700">
              <div className="border-b border-paper/20 px-6 py-6 md:px-8">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
                  Sicurezza
                </span>
                <h2 className="mt-3 font-display text-2xl text-paper/90">
                  Accesso
                </h2>
              </div>

              <PasswordForm />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}