import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";
import { validaDocumento } from "@/lib/documenti-validazione";
import { risolviNuove } from "@/lib/chiavi-nuove"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  const ruolo = session.user.ruolo;
  if (ruolo !== "gestore" && ruolo !== "admin")
    return NextResponse.json({ errore: "Permessi insufficienti." }, { status: 403 });

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id < 1)
    return NextResponse.json({ errore: "Documento non valido." }, { status: 400 });

  const body = await req.json().catch(() => null);
  const v = validaDocumento(body);
  if (!v.ok) return NextResponse.json({ errore: v.errore }, { status: 400 });

  try {
    await prismaDB.$transaction(async (tx) => {
      await tx.documenti.update({ where: { id }, data: v.dati });

      if (v.chiavi !== null) {
        const idNuove = await risolviNuove(tx, v.nuove);
        const tutte = [...new Set([...v.chiavi, ...idNuove])];

        await tx.doc_chiavi.deleteMany({ where: { documento_id: id } });
        if (tutte.length > 0) {
          await tx.doc_chiavi.createMany({
            data: tutte.map((chiave_id) => ({ documento_id: id, chiave_id })),
          });
        }
      }

      if (v.collegati !== null) {
        const altri = v.collegati.filter((c) => c !== id);

        await tx.doc_collegamenti.deleteMany({
          where: {
            OR: [{ documento_id: id }, { documento_collegato_id: id }],
          },
        });
        if (altri.length > 0) {
          await tx.doc_collegamenti.createMany({
            data: altri.map((c) => ({
              documento_id: id,
              documento_collegato_id: c,
            })),
          });
        }
      }
      
    });
    return NextResponse.json({ id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return NextResponse.json({ errore: "Documento non trovato." }, { status: 404 });
      if (e.code === "P2003")
        return NextResponse.json(
          { errore: "Uno dei valori selezionati non esiste più." },
          { status: 400 }
        );
    }
    console.error(e);
    return NextResponse.json({ errore: "Errore del server." }, { status: 500 });
  }
}