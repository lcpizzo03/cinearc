import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";
import DocumentoForm, { type ValoriDocumento } from "@/components/documentiform";

export default async function ModificaDocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id < 1) notFound();

  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/documenti/${id}/modifica`);
  if (session.user.ruolo !== "gestore" && session.user.ruolo !== "admin")
    redirect("/archivio");

  const [doc, fonti, tipologie, archivi, collocamenti, testate] =
    await Promise.all([
      prismaDB.documenti.findUnique({where: { id },include: { doc_chiavi: { include: { parole_chiave: true } } },}),
      prismaDB.db_sorgenti.findMany({ orderBy: { nome_db_origine: "asc" } }),
      prismaDB.tipologie_documento.findMany({ orderBy: { nome: "asc" } }),
      prismaDB.archivio.findMany({ orderBy: { arc: "asc" } }),
      prismaDB.collocamento.findMany({ orderBy: { nome: "asc" } }),
      prismaDB.testata.findMany({ orderBy: { nome: "asc" } }),
    ]);
  if (!doc) notFound();

  const chiaviIniziali = doc.doc_chiavi
    .map((dc) => ({
      id: dc.parole_chiave.id,
      nome: dc.parole_chiave.nome,
      categoria: dc.parole_chiave.categoria,
     }))
     .sort((a, b) => Number(b.categoria === "primaria") - Number(a.categoria === "primaria") || a.nome.localeCompare(b.nome, "it")
    );

    const collegamenti = await prismaDB.doc_collegamenti.findMany({
      where: { OR: [{ documento_id: id }, { documento_collegato_id: id }] },
      include: {
        documenti_doc_collegamenti_documento_idTodocumenti: {
          select: { id: true, titolo: true, online: true },
        },
        documenti_doc_collegamenti_documento_collegato_idTodocumenti: {
          select: { id: true, titolo: true, online: true },
        },
      },
    });

    const perId = new Map<number, { id: number; titolo: string | null; online: number }>();
    for (const c of collegamenti) {
      const altro =
        c.documento_id === id
          ? c.documenti_doc_collegamenti_documento_collegato_idTodocumenti
          : c.documenti_doc_collegamenti_documento_idTodocumenti;
      perId.set(altro.id, altro); 
    }
    const collegatiIniziali = [...perId.values()].sort((a, b) => a.id - b.id);

  const valori: ValoriDocumento = {
    db_sorgente: String(doc.db_sorgente),
    tipologia_id: String(doc.tipologia_id),
    archivio_id: String(doc.archivio_id),
    collocamento_id: String(doc.collocamento_id),
    testata_id: doc.testata_id ? String(doc.testata_id) : "",
    titolo: doc.titolo ?? "",
    autore: doc.autore,
    destinatario: doc.destinatario,
    gg: doc.gg?.toString() ?? "",
    mm: doc.mm?.toString() ?? "",
    aa: doc.aa?.toString() ?? "",
    annata: doc.annata ?? "",
    numero: doc.numero?.toString() ?? "",
    pagina: doc.pagina?.toString() ?? "",
    online: String(doc.online),
    ocs: doc.ocs ?? "",
  };

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px]">
      <div className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-20">
        <header className="mb-10 border-b border-paper/30 pb-8">
          <Link
            href={`/documenti/${id}`}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65 transition-colors hover:text-ochre-400"
          >
            ← Scheda documento
          </Link>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] text-paper">
            Modifica.
          </h1>
          <p className="mt-3 font-mono text-xs text-paper/60">Ref #{id}</p>
        </header>

        <DocumentoForm
          idDocumento={id}
          valoriIniziali={valori}
          chiaviIniziali={chiaviIniziali}
          collegatiIniziali={collegatiIniziali}
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