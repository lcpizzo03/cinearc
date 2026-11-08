import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prismaDB } from "@/lib/prisma";
import { validaDocumento, idFonte } from "@/lib/documenti-validazione";
import { risolviNuove } from "@/lib/chiavi-nuove";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ errore: "Non autorizzato." }, { status: 401 });
  const ruolo = session.user.ruolo;
  if (ruolo !== "gestore" && ruolo !== "admin")
    return NextResponse.json({ errore: "Permessi insufficienti." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const v = validaDocumento(body);
  if (!v.ok) return NextResponse.json({ errore: v.errore }, { status: 400 });

  let db_sorgente: number;
  try {
    db_sorgente = idFonte(body?.db_sorgente);
  } catch {
    return NextResponse.json({ errore: "Fonte non valida." }, { status: 400 });
  }

  try {
    const doc = await prismaDB.$transaction(async (tx) => {
      const max = await tx.documenti.aggregate({
        where: { db_sorgente },
        _max: { progressivo: true },
      });

      const idNuove = await risolviNuove(tx, v.nuove);
      const tutte = [...new Set([...(v.chiavi ?? []), ...idNuove])];

      const creato = await tx.documenti.create({
          data: {
            ...v.dati,
            db_sorgente,
            progressivo: (max._max.progressivo ?? 0) + 1,
            ...(tutte.length > 0
              ? { doc_chiavi: { create: tutte.map((chiave_id) => ({ chiave_id })) } }
              : {}),
          },
          select: { id: true },
        });

        if (v.collegati && v.collegati.length > 0) {
          await tx.doc_collegamenti.createMany({
            data: v.collegati.map((c) => ({
              documento_id: creato.id,
              documento_collegato_id: c,
            })),
          });
        }

        return creato;
      });
    return NextResponse.json({ id: doc.id }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003")
      return NextResponse.json(
        { errore: "Uno dei valori selezionati non esiste più." },
        { status: 400 }
      );
    console.error(e);
    return NextResponse.json({ errore: "Errore del server." }, { status: 500 });
  }
}