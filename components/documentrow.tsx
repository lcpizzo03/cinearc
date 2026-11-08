import Link from "next/link";
import type { documenti } from "@prisma/client";

export type DocumentRowData = Pick<
  documenti,
  "id" | "titolo" | "autore" | "destinatario" | "gg" | "mm" | "aa" | "online"
> & {
  tipologie_documento: { nome: string };
  archivio: { arc: string };
  testata: { nome: string } | null;
};

function getTitle(d: DocumentRowData) {
  const titolo = d.titolo?.trim();
  if (!titolo || titolo.toLowerCase() === "undefined") {
    return "Documento senza titolo";
  }
  return titolo;
}

function getDate(d: DocumentRowData) {
  const values = [d.gg, d.mm, d.aa].filter(
    (v): v is number => v !== null && v !== undefined
  );
  return values.length > 0 ? values.join("/") : "Data non indicata";
}

export default function DocumentRow({
  documento,
  href,
}: {
  documento: DocumentRowData;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block px-4 py-6 transition hover:bg-forest-700"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-display text-lg leading-snug text-paper transition group-hover:text-ochre-400">
            {getTitle(documento)}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-paper/60">
            {documento.autore && (
              <span>
                <span className="text-paper/40">Autore:</span> {documento.autore}
              </span>
            )}
            {documento.destinatario && (
              <span>
                <span className="text-paper/40">Destinatario:</span>{" "}
                {documento.destinatario}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-paper/45">
            {documento.online !== 1 && (
              <span className="text-bordeaux-400">Nascosto</span>
            )}
            <span>{documento.tipologie_documento.nome}</span>
            <span>{documento.archivio.arc}</span>
            {documento.testata && <span>{documento.testata.nome}</span>}
          </div>
        </div>

        <div className="flex flex-row items-start justify-between gap-6 md:flex-col md:items-end">
          <span className="font-mono text-[10px] text-paper/60">
            {getDate(documento)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ochre-400/80">
            Ref #{documento.id}
          </span>
        </div>
      </div>
    </Link>
  );
}