import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const [chiavi, titoli, autori] = await Promise.all([
    prismaDB.parole_chiave.findMany({
      where: { nome: { contains: q, mode: "insensitive" } },
      orderBy: { nome: "asc" },
      take: 5,
      select: { nome: true },
    }),
    prismaDB.documenti.findMany({
      where: { online: 1, titolo: { contains: q, mode: "insensitive" } },
      distinct: ["titolo"],
      take: 5,
      select: { titolo: true },
    }),
    prismaDB.documenti.findMany({
      where: { online: 1, autore: { contains: q, mode: "insensitive" } },
      distinct: ["autore"],
      take: 4,
      select: { autore: true },
    }),
  ]);

  const suggestions = [
    ...chiavi.map((c) => ({ label: c.nome, type: "chiave" as const })),
    ...titoli
      .filter((t) => t.titolo && t.titolo.trim().toLowerCase() !== "undefined")
      .map((t) => ({ label: t.titolo!.trim(), type: "titolo" as const })),
    ...autori.map((a) => ({ label: a.autore, type: "autore" as const })),
  ];

  return NextResponse.json(suggestions);
}