import type { Prisma } from "@prisma/client";

export async function risolviNuove(
  tx: Prisma.TransactionClient,
  nuove: { nome: string; categoria: "primaria" | "secondaria" }[]
): Promise<number[]> {
  const ids: number[] = [];
  for (const n of nuove) {
    const esistente = await tx.parole_chiave.findFirst({
      where: { nome: { equals: n.nome, mode: "insensitive" } },
      select: { id: true },
    });
    if (esistente) {
      ids.push(esistente.id);
    } else {
      const creata = await tx.parole_chiave.create({
        data: { nome: n.nome, categoria: n.categoria },
        select: { id: true },
      });
      ids.push(creata.id);
    }
  }
  return ids;
}