import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

import RicercaArchivio from "./components/RicercaArchivio";
import FiltriArchivio from "./components/FiltriArchivio";
import ResultArchive from "./components/ResultArchive";

const PAGE_SIZE = 25;

type SearchParams = {
  q?: string;
  tipologia?: string;
  archivio?: string;
  fonte?: string;
  testata?: string;
  anno?: string;
  page?: string;
};

export default async function EsploraArchivio({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=%2Farchivio%2Fesplora");
  }

  const params = await searchParams;

  const vedeNascosti = session.user.ruolo === "gestore" || session.user.ruolo === "admin";
  const filtroOnline: Prisma.documentiWhereInput = vedeNascosti ? {} : { online: 1 };
  const q = params.q?.trim() || "";
  const tipologia = params.tipologia || "";
  const archivio = params.archivio || "";
  const fonte = params.fonte || "";
  const testata = params.testata || "";
  const anno = params.anno || "";

  const requestedPage = Number(params.page || "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const hasFilters =
    Boolean(q) ||
    Boolean(tipologia) ||
    Boolean(archivio) ||
    Boolean(fonte) ||
    Boolean(testata) ||
    Boolean(anno);

const where: Prisma.documentiWhereInput = {
  ...filtroOnline,
  ...(q
    ? {
        OR: [
          {titolo: {contains: q, mode: "insensitive",},},
          {autore: {contains: q, mode: "insensitive",},},
          {destinatario: {contains: q, mode: "insensitive",},},
          {doc_chiavi: {some: {parole_chiave: {nome: {contains: q,mode: "insensitive",},}, },},},
        ],
      }
    : {}),
  ...(tipologia ? { tipologia_id: Number(tipologia) } : {}),
  ...(archivio ? { archivio_id: Number(archivio) } : {}),
  ...(fonte ? { db_sorgente: Number(fonte) } : {}),
  ...(testata ? { testata_id: Number(testata) } : {}),
  ...(anno ? { aa: Number(anno) } : {}),
};

  const [tipologie, archivi, fonti, testate, anni] = await Promise.all([
    prismaDB.tipologie_documento.findMany({ orderBy: { nome: "asc" } }),
    prismaDB.archivio.findMany({ orderBy: { arc: "asc" } }),
    prismaDB.db_sorgenti.findMany({ orderBy: { nome_db_origine: "asc" } }),
    prismaDB.testata.findMany({ orderBy: { nome: "asc" } }),
    prismaDB.documenti.findMany({
      where: { ...filtroOnline, aa: { not: null } },
      select: { aa: true },
      distinct: ["aa"],
      orderBy: { aa: "desc" },
    }),
  ]);

  let documenti;
  let total;

  if (!hasFilters) {
    const totalDocuments = await prismaDB.documenti.count({
      where: filtroOnline ,
    });

    const maxOffset = Math.max(totalDocuments - PAGE_SIZE, 0);
    const randomOffset =
      maxOffset > 0 ? Math.floor(Math.random() * maxOffset) : 0;

    documenti = await prismaDB.documenti.findMany({
      where: filtroOnline,
      skip: randomOffset,
      take: PAGE_SIZE,
      include: {
        archivio: true,
        collocamento: true,
        db_sorgenti: true,
        testata: true,
        tipologie_documento: true,
      },
    });

    total = totalDocuments;
  } else {
    total = await prismaDB.documenti.count({ where });

    documenti = await prismaDB.documenti.findMany({
      where,
      orderBy: [
        { aa: "desc" },
        { mm: "desc" },
        { gg: "desc" },
        { id: "desc" },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        archivio: true,
        collocamento: true,
        db_sorgenti: true,
        testata: true,
        tipologie_documento: true,
      },
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <main className="min-h-screen bg-forest-800 text-paper">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <header className="mb-10 border-b border-paper/25 pb-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              href="/archivio"
              className="text-xs uppercase tracking-[0.2em] text-paper/60 transition hover:text-ochre-400"
            >
              ← Archivio
            </Link>

            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/50">
              Area riservata
            </span>
          </div>

          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ochre-400">
            Consultazione
          </p>

          <h1 className="font-display text-4xl tracking-tight md:text-5xl">
            Esplora archivio.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-paper/70">
            Cerca e consulta i documenti dell&apos;archivio attraverso
            testo e criteri di classificazione.
          </p>
        </header>

        <form method="GET" className="space-y-5">
          <RicercaArchivio initialValue={q} />

          <FiltriArchivio
            tipologie={tipologie}
            archivi={archivi}
            fonti={fonti}
            testate={testate}
            anni={anni
              .map((item) => item.aa)
              .filter((value): value is number => value !== null)}
            values={{ tipologia, archivio, fonte, testata, anno }}
          />
        </form>

        <ResultArchive
          documenti={documenti}
          total={total}
          page={hasFilters ? safePage : 1}
          totalPages={hasFilters ? totalPages : 1}
          searchParams={params}
          random={!hasFilters}
        />
      </div>
    </main>
  );
}