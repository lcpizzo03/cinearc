import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  if (session.user.ruolo !== "gestore" && session.user.ruolo !== "admin")
    return NextResponse.json({ errore: "Permessi insufficienti." }, { status: 403 });

  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const escludi = Number(sp.get("escludi"));
  if (q.length < 2) return NextResponse.json([]);

  const numero = /^\d+$/.test(q) && q.length <= 9 ? Number(q) : null;

  const docs = await prismaDB.documenti.findMany({
    where: {
      ...(Number.isInteger(escludi) && escludi > 0 ? { id: { not: escludi } } : {}),
      OR: [
        { titolo: { contains: q, mode: "insensitive" } },
        { autore: { contains: q, mode: "insensitive" } },
        ...(numero !== null ? [{ id: numero }] : []),
      ],
    },
    orderBy: { id: "desc" },
    take: 10,
    select: { id: true, titolo: true, online: true },
  });

  return NextResponse.json(docs);
}