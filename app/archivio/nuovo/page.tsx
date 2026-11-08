import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";
import DocumentoForm from "@/components/documentiform";

export default async function NuovoDocumentoPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/archivio/nuovo");
  if (session.user.ruolo !== "gestore" && session.user.ruolo !== "admin")
    redirect("/archivio");

  const [fonti, tipologie, archivi, collocamenti, testate] = await Promise.all([
    prismaDB.db_sorgenti.findMany({ orderBy: { nome_db_origine: "asc" } }),
    prismaDB.tipologie_documento.findMany({ orderBy: { nome: "asc" } }),
    prismaDB.archivio.findMany({ orderBy: { arc: "asc" } }),
    prismaDB.collocamento.findMany({ orderBy: { nome: "asc" } }),
    prismaDB.testata.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px]">
      <div className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-20">
        <header className="mb-10 border-b border-paper/30 pb-8">
          <Link
            href="/archivio"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
          >
            ← Archivio
          </Link>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] text-paper">
            Nuovo documento.
          </h1>
        </header>

        <DocumentoForm
          opzioni={{
            fonti: fonti.map((f) => ({ id: f.id, nome: f.nome_db_origine })),
            tipologie,
            archivi: archivi.map((a) => ({ id: a.id, nome: a.arc })),
            collocamenti,
            testate,
          }}
        />
      </div>
    </main>
  );
}