import { prismaDB } from "@/lib/prisma";

export async function registraConsultazione(utenteId: number, documentoId: number) {
  await prismaDB.consultazioni.upsert({
    where: {
      utente_id_documento_id: { utente_id: utenteId, documento_id: documentoId },
    },
    update: { consultato_il: new Date() },
    create: { utente_id: utenteId, documento_id: documentoId },
  });
}