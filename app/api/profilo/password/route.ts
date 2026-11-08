import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const attuale = String(body?.attuale ?? "");
  const nuova = String(body?.nuova ?? "");

  if (nuova.length < 8)
    return NextResponse.json(
      { errore: "La nuova password deve avere almeno 8 caratteri." },
      { status: 400 }
    );
  if (nuova === attuale)
    return NextResponse.json(
      { errore: "La nuova password deve essere diversa da quella attuale." },
      { status: 400 }
    );

  const id = Number(session.user.id);
  const utente = await prismaDB.utenti.findUnique({
    where: { id },
    select: { password: true },
  });
  if (!utente)
    return NextResponse.json({ errore: "Utente non trovato." }, { status: 404 });

  const corretta = await bcrypt.compare(attuale, utente.password);
  if (!corretta)
    return NextResponse.json(
      { errore: "La password attuale non è corretta." },
      { status: 400 }
    );

  const hash = await bcrypt.hash(nuova, 12);
  await prismaDB.utenti.update({ where: { id }, data: { password: hash } });

  return NextResponse.json({ ok: true });
}