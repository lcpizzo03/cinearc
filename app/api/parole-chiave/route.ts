import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

async function controllaPermessi() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  if (session.user.ruolo !== "gestore" && session.user.ruolo !== "admin")
    return NextResponse.json({ errore: "Permessi insufficienti." }, { status: 403 });
  return null;
}

export async function GET(req: Request) {
  const negato = await controllaPermessi();
  if (negato) return negato;

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const risultati = await prismaDB.parole_chiave.findMany({
    where: { nome: { contains: q, mode: "insensitive" } },
    orderBy: { nome: "asc" },
    take: 10,
    select: { id: true, nome: true, categoria: true },
  });

  return NextResponse.json(risultati);
}

export async function POST(req: Request) {
  const negato = await controllaPermessi();
  if (negato) return negato;

  const body = await req.json().catch(() => null);
  const nome = String(body?.nome ?? "").trim().replace(/\s+/g, " ");
  const categoria = String(body?.categoria ?? "");

  if (nome.length < 2 || nome.length > 200)
    return NextResponse.json(
      { errore: "Il nome deve avere da 2 a 200 caratteri." },
      { status: 400 }
    );
  if (categoria !== "primaria" && categoria !== "secondaria")
    return NextResponse.json({ errore: "Categoria non valida." }, { status: 400 });

  const cerca = () =>
    prismaDB.parole_chiave.findFirst({
      where: { nome: { equals: nome, mode: "insensitive" } },
      select: { id: true, nome: true, categoria: true },
    });

  const esistente = await cerca();
  if (esistente) return NextResponse.json(esistente);

  try {
    const creata = await prismaDB.parole_chiave.create({
      data: { nome, categoria },
      select: { id: true, nome: true, categoria: true },
    });
    return NextResponse.json(creata, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const gia = await cerca();
      if (gia) return NextResponse.json(gia);
    }
    console.error(e);
    return NextResponse.json({ errore: "Errore del server." }, { status: 500 });
  }
}