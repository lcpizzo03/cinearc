import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";
import RuoloForm from "./ruoloform";

export default async function AdminUtentePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/admin/utenti/${idStr}`);
  if (session.user.ruolo !== "admin") redirect("/archivio");

  const id = Number(idStr);
  if (!Number.isInteger(id) || id < 1) notFound();

  const utente = await prismaDB.utenti.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      nome_completo: true,
      ruolo: true,
    },
  });
  if (!utente) notFound();

  const èSeStesso = String(utente.id) === String(session.user.id);
  const modificabile = utente.ruolo !== "admin" && !èSeStesso;

  const dati = [
    { etichetta: "Nome completo", valore: utente.nome_completo?.trim() || "Non indicato" },
    { etichetta: "Username", valore: utente.username },
    { etichetta: "Email", valore: utente.email },
    { etichetta: "Matricola", valore: `#${utente.id}` },
  ];

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px]">
      <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
        <header className="border-b border-paper/30 pb-8">
          <Link
            href="/admin/utenti"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
          >
            ← Utenti
          </Link>
          <h1 className="mt-6 font-display text-4xl leading-tight text-paper md:text-5xl">
            {utente.nome_completo?.trim() || utente.username}
          </h1>
          <p className="mt-2 font-mono text-xs text-paper/60">@{utente.username}</p>
        </header>

        <section className="mt-10 border border-paper/25 bg-forest-700">
          <div className="border-b border-paper/20 px-6 py-5 md:px-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              / Dati
            </span>
            <h2 className="mt-2 font-display text-xl text-paper/90">Account</h2>
          </div>
          <dl className="divide-y divide-paper/15">
            {dati.map((r) => (
              <div
                key={r.etichetta}
                className="grid gap-1 px-6 py-5 sm:grid-cols-[180px_1fr] sm:items-baseline sm:gap-6 md:px-8"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
                  {r.etichetta}
                </dt>
                <dd className="break-all font-display text-lg text-paper/90">
                  {r.valore}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 border border-paper/25 bg-forest-700">
          <div className="border-b border-paper/20 px-6 py-5 md:px-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              / Ruolo
            </span>
            <h2 className="mt-2 font-display text-xl text-paper/90">Permessi</h2>
          </div>

          {modificabile ? (
            <RuoloForm
              idUtente={utente.id}
              ruoloIniziale={utente.ruolo === "gestore" ? "gestore" : "utente"}
            />
          ) : (
            <div className="px-6 py-7 md:px-8">
              <p className="font-mono text-sm uppercase tracking-[0.15em] text-ochre-400">
                {utente.ruolo}
              </p>
              <p className="mt-3 text-sm leading-6 text-paper/65">
                {èSeStesso
                  ? "Non puoi modificare il tuo stesso ruolo."
                  : "Il ruolo di un amministratore non si modifica da qui."}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}