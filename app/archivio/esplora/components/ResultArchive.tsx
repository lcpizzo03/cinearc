import Link from "next/link";
import DocumentRow, { type DocumentRowData } from "@/components/documentrow";

type Props = {
  documenti: DocumentRowData[];
  total: number;
  page: number;
  totalPages: number;
  searchParams: {
    q?: string;
    tipologia?: string;
    archivio?: string;
    fonte?: string;
    testata?: string;
    anno?: string;
  };
  random: boolean;
};

function buildPageUrl(page: number, searchParams: Props["searchParams"]) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  params.set("page", String(page));

  return `/archivio/esplora?${params.toString()}`;
}

export default function ArchiveResults({
  documenti,
  total,
  page,
  totalPages,
  searchParams,
  random,
}: Props) {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between border-b border-paper/25 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ochre-400">
            {random ? "Selezione dall'archivio" : "Risultati della ricerca"}
          </p>

          <p className="mt-2 text-sm text-paper/65">
            {total.toLocaleString("it-IT")} documenti
          </p>
        </div>

        {!random && totalPages > 1 && (
          <span className="font-mono text-[10px] text-paper/50">
            Pagina {page} / {totalPages}
          </span>
        )}
      </div>

      {documenti.length === 0 ? (
        <div className="border border-paper/25 bg-forest-700 px-6 py-14 text-center">
          <p className="font-display text-xl text-paper/85">
            Nessun documento trovato.
          </p>
          <p className="mt-2 text-sm text-paper/55">
            Prova a modificare i criteri di ricerca.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-paper/15 border-y border-paper/25 bg-forest-700/40">
          {documenti.map((documento) => (
            <DocumentRow
              key={documento.id}
              documento={documento}
              href={`/documenti/${documento.id}?from=${encodeURIComponent(
                buildPageUrl(page, searchParams)
              )}`}
            />
          ))}
        </div>
      )}

      {!random && totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1, searchParams)}
              className="border border-paper/25 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-paper/65 transition hover:border-ochre-400/50 hover:text-ochre-400"
            >
              ← Precedente
            </Link>
          )}

          <span className="px-4 font-mono text-[10px] text-paper/50">
            {page} / {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1, searchParams)}
              className="border border-paper/25 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-paper/65 transition hover:border-ochre-400/50 hover:text-ochre-400"
            >
              Successiva →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}