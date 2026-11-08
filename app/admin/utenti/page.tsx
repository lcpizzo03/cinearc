import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

const ETICHETTE: Record<string, string> = {
  utente: "Utente",
  gestore: "Gestore",
  admin: "Amministratore",
};

export default async function AdminUtentiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/admin/utenti");
  if (session.user.ruolo !== "admin") redirect("/archivio");

  const { q } = await searchParams;
  const termine = q?.trim() ?? "";

  const where: Prisma.utentiWhereInput = termine
    ? {
        OR: [
          { username: { contains: termine, mode: "insensitive" } },
          { email: { contains: termine, mode: "insensitive" } },
          { nome_completo: { contains: termine, mode: "insensitive" } },
        ],
      }
    : {};

  const [utenti, totale] = await Promise.all([
    prismaDB.utenti.findMany({
      where,
      orderBy: { username: "asc" },
      take: 50,
      select: {
        id: true,
        username: true,
        email: true,
        nome_completo: true,
        ruolo: true,
      },
    }),
    prismaDB.utenti.count({ where }),
  ]);

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px]">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
        <header className="border-b border-paper/30 pb-8">
          <Link
            href="/archivio"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
          >
            ← Archivio
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              CineArc
            </span>
            <span className="h-px w-8 bg-paper/40" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-paper/70">
              Amministrazione
            </span>
          </div>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] text-paper">
            Utenti.
          </h1>
        </header>

        <form method="GET" className="mt-10 flex gap-3">
          <input
            name="q"
            key={termine}
            defaultValue={termine}
            placeholder="Cerca per nome, username o email"
            className="w-full border border-paper/25 bg-forest-700 px-4 py-3 text-sm text-paper/90 outline-none transition-colors placeholder:text-paper/35 focus:border-ochre-400"
          />
          <button
            type="submit"
            className="border border-ochre-400/50 px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ochre-400 transition-colors hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950"
          >
            Cerca
          </button>
          {termine && (
            <Link
              href="/admin/utenti"
              className="flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-paper"
            >
              Azzera
            </Link>
          )}
        </form>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
          {totale.toLocaleString("it-IT")} utenti
          {totale > utenti.length && ` · primi ${utenti.length}`}
        </p>

        <div className="mt-4 divide-y divide-paper/15 border border-paper/25 bg-forest-700">
          {utenti.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-paper/60">
              Nessun utente trovato.
            </p>
          ) : (
            utenti.map((u) => (
              <Link
                key={u.id}
                href={`/admin/utenti/${u.id}`}
                className="group grid gap-2 px-6 py-5 transition-colors hover:bg-forest-600 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-display text-lg text-paper/90 transition-colors group-hover:text-ochre-400">
                    {u.nome_completo?.trim() || u.username}
                  </p>
                  <p className="mt-1 font-mono text-xs text-paper/55">
                    @{u.username} · {u.email}
                  </p>
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                    u.ruolo === "admin"
                      ? "text-bordeaux-400"
                      : u.ruolo === "gestore"
                      ? "text-ochre-400"
                      : "text-paper/60"
                  }`}
                >
                  {ETICHETTE[u.ruolo] ?? u.ruolo}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}