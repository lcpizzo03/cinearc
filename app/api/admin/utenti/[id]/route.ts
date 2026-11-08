import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  if (session.user.ruolo !== "admin")
    return NextResponse.json({ errore: "Permessi insufficienti." }, { status: 403 });

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id < 1)
    return NextResponse.json({ errore: "Utente non valido." }, { status: 400 });

  if (String(id) === String(session.user.id))
    return NextResponse.json(
      { errore: "Non puoi modificare il tuo stesso ruolo." },
      { status: 400 }
    );

  const body = await req.json().catch(() => null);
  const ruolo = String(body?.ruolo ?? "");
  if (ruolo !== "utente" && ruolo !== "gestore")
    return NextResponse.json({ errore: "Ruolo non valido." }, { status: 400 });

  const utente = await prismaDB.utenti.findUnique({
    where: { id },
    select: { ruolo: true },
  });
  if (!utente)
    return NextResponse.json({ errore: "Utente non trovato." }, { status: 404 });
  if (utente.ruolo === "admin")
    return NextResponse.json(
      { errore: "Il ruolo di un amministratore non si modifica da qui." },
      { status: 400 }
    );

  await prismaDB.utenti.update({ where: { id }, data: { ruolo } });
  return NextResponse.json({ ok: true });
}