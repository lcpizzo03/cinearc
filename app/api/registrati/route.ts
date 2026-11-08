import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prismaDB } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "").trim().toLowerCase();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const nomeCompleto = String(body?.nome_completo ?? "").trim();

  if (!/^[a-z0-9_.-]{3,30}$/.test(username))
    return NextResponse.json({ errore: "Username non valido (3–30 caratteri: lettere, numeri, . _ -)." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ errore: "Email non valida." }, { status: 400 });
  if (password.length < 8)
    return NextResponse.json({ errore: "La password deve avere almeno 8 caratteri." }, { status: 400 });

  const esistente = await prismaDB.utenti.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { id: true },
  });
  if (esistente)
    return NextResponse.json({ errore: "Username o email già in uso." }, { status: 409 });

  const hash = await bcrypt.hash(password, 12);

  await prismaDB.utenti.create({
    data: {
      username,
      email,
      password: hash,
      nome_completo: nomeCompleto,
      ruolo: "utente", 
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}