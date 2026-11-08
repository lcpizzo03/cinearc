import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";
import { registraConsultazione } from "@/lib/consultati";

function getTitolo(titolo: string | null) {
  const pulito = titolo?.trim();
  if (!pulito || pulito.toLowerCase() === "undefined") {
    return "Documento senza titolo";
  }
  return pulito;
}

function getData(gg: number | null, mm: number | null, aa: number | null) {
  const values = [gg, mm, aa].filter(
    (v): v is number => v !== null && v !== undefined
  );
  return values.length > 0 ? values.join("/") : "Data non indicata";
}

export default async function DocumentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/documenti/${id}`)}`);
  }

  const documentoId = Number(id);

  if (!Number.isInteger(documentoId)) {
    notFound();
  }



  const documento = await prismaDB.documenti.findUnique({
    where: { id: documentoId },
    include: {
      archivio: true,
      collocamento: true,
      db_sorgenti: true,
      testata: true,
      tipologie_documento: true,
      doc_chiavi: {
        include: { parole_chiave: true },
      },
    },
  });

const puoModificare = session.user.ruolo === "gestore" || session.user.ruolo === "admin";

 if (!documento || (documento.online !== 1 && !puoModificare)) {
  notFound();
  }

  if (documento.online === 1) {
  await registraConsultazione(Number(session.user.id), documento.id);
  }

  const collegamenti = await prismaDB.doc_collegamenti.findMany({
    where: {
      OR: [
        { documento_id: documentoId },
        { documento_collegato_id: documentoId },
      ],
    },
    include: {
      documenti_doc_collegamenti_documento_idTodocumenti: true,
      documenti_doc_collegamenti_documento_collegato_idTodocumenti: true,
    },
  });

  const documentiCollegati = collegamenti.map((c) =>
    c.documento_id === documentoId
      ? c.documenti_doc_collegamenti_documento_collegato_idTodocumenti
      : c.documenti_doc_collegamenti_documento_idTodocumenti
  ).filter((d) => d.online === 1 || puoModificare);

  const chiaviPrimarie = documento.doc_chiavi.filter(
    (dc) => dc.parole_chiave.categoria === "primaria"
  );
  const chiaviSecondarie = documento.doc_chiavi.filter(
    (dc) => dc.parole_chiave.categoria !== "primaria"
  );

  const dataDocumento = getData(documento.gg, documento.mm, documento.aa);
  const backHref = from && from.startsWith("/archivio/esplora") ? from : "/archivio/esplora";

  return (
    <main className="min-h-screen bg-forest-800 pt-[76px] text-paper">
      <div className="mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">

        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href={backHref}
            className="text-xs uppercase tracking-[0.2em] text-paper/60 transition hover:text-ochre-400"
          >
            ← Archivio
          </Link>

          <div className="flex items-center gap-6">
            {puoModificare && (
              <Link
                href={`/documenti/${documento.id}/modifica`}
                className="border border-ochre-400/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ochre-400 transition-colors hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950"
              >
                Modifica
              </Link>
            )}
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
              Scheda documento
            </span>
          </div>
        </div>

        <header className="border-b border-paper/25 pb-10">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ochre-400">
            {documento.tipologie_documento.nome}
          </span>

          <h1 className="mt-4 font-display text-4xl leading-tight text-paper md:text-5xl">
            {getTitolo(documento.titolo)}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-paper/65">
            {documento.autore && (
              <span>
                <span className="text-paper/40">Autore:</span>{" "}
                {documento.autore}
              </span>
            )}
            {documento.destinatario && (
              <span>
                <span className="text-paper/40">Destinatario:</span>{" "}
                {documento.destinatario}
              </span>
            )}
            <span>
              <span className="text-paper/40">Data:</span> {dataDocumento}
            </span>
            {documento.pagina && (
              <span>
                <span className="text-paper/40">Pagina:</span>{" "}
                {documento.pagina}
              </span>
            )}
            {documento.numero && (
              <span>
                <span className="text-paper/40">Numero:</span>{" "}
                {documento.numero}
              </span>
            )}
            {documento.annata && (
              <span>
                <span className="text-paper/40">Annata:</span>{" "}
                {documento.annata}
              </span>
            )}
          </div>
          {documento.online !== 1 && (
            <p className="mt-6 border border-bordeaux-500/60 bg-bordeaux-500/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-bordeaux-400">
              Documento nascosto: non è visibile agli utenti.
            </p>
          )}
        </header>

        <section className="mt-10 grid gap-px border border-paper/20 bg-paper/15 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-forest-700 p-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-paper/50">
              Archivio
            </span>
            <p className="mt-2 font-display text-lg text-paper">
              {documento.archivio.arc}
            </p>
          </div>

          <div className="bg-forest-700 p-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-paper/50">
              Collocamento
            </span>
            <p className="mt-2 font-display text-lg text-paper">
              {documento.collocamento.nome}
            </p>
          </div>

          <div className="bg-forest-700 p-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-paper/50">
              Testata
            </span>
            <p className="mt-2 font-display text-lg text-paper">
              {documento.testata?.nome ?? "—"}
            </p>
          </div>

          <div className="bg-forest-700 p-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-paper/50">
              Fonte / Ref
            </span>
            <p className="mt-2 font-display text-lg text-paper">
              {documento.db_sorgenti.nome_db_origine}
            </p>
            <p className="mt-1 font-mono text-[10px] text-ochre-400/80">
              #{documento.id}
            </p>
          </div>
        </section>

        {(chiaviPrimarie.length > 0 || chiaviSecondarie.length > 0) && (
          <section className="mt-10 border-t border-paper/25 pt-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              Parole chiave
            </span>

            <div className="mt-4 flex flex-wrap gap-2">
              {chiaviPrimarie.map((dc) => (
                <Link
                    key={dc.chiave_id}
                    href={`/archivio/esplora?q=${encodeURIComponent(dc.parole_chiave.nome)}`}
                    className="border border-bordeaux-500/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-bordeaux-400 transition hover:bg-bordeaux-500/10"
                  >
                    {dc.parole_chiave.nome}
                  </Link>
              ))}

              {chiaviSecondarie.map((dc) => (
                <Link
                  key={dc.chiave_id}
                  href={`/archivio/esplora?q=${encodeURIComponent(dc.parole_chiave.nome)}`}
                  className="border border-ochre-400/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ochre-400 transition hover:bg-ochre-400/10"
                >
                  {dc.parole_chiave.nome}
                </Link>
              ))}
            </div>
          </section>
        )}

        {documento.ocs && (
          <section className="mt-10 border-t border-paper/25 pt-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              Testo integrale
            </span>

            <div className="mt-4 max-h-[500px] overflow-y-auto border border-paper/20 bg-forest-900/50 p-6">
              <p className="whitespace-pre-wrap font-mono text-sm leading-7 text-paper/80">
                {documento.ocs}
              </p>
            </div>
          </section>
        )}

        {documentiCollegati.length > 0 && (
          <section className="mt-10 border-t border-paper/25 pt-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
              Documenti collegati
            </span>

            <div className="mt-4 flex flex-col divide-y divide-paper/15 border-y border-paper/20">
              {documentiCollegati.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documenti/${doc.id}`}
                  className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-forest-700"
                >
                  <span className="font-display text-base text-paper transition group-hover:text-ochre-400">
                    {getTitolo(doc.titolo)}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-paper/40 group-hover:text-ochre-400">
                    Ref #{doc.id} →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-14 flex justify-between border-t border-paper/15 pt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-paper/40">
          <span>CineArc · Archivio digitale</span>
          <span>Ref #{documento.id}</span>
        </footer>

      </div>
    </main>
  );
}