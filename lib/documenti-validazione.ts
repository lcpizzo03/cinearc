class ErroreValidazione extends Error {}

function intOpz(v: unknown, nome: string, min: number, max: number): number | null {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max)
    throw new ErroreValidazione(`${nome} non valido.`);
  return n;
}

function intReq(v: unknown, nome: string): number {
  const n = intOpz(v, nome, 1, 2147483647);
  if (n === null) throw new ErroreValidazione(`${nome} obbligatorio.`);
  return n;
}

function testo(v: unknown, nome: string, max: number): string {
  const s = String(v ?? "").trim();
  if (s.length > max)
    throw new ErroreValidazione(`${nome}: massimo ${max} caratteri.`);
  return s;
}

export type DatiDocumento = {
  archivio_id: number;
  collocamento_id: number;
  testata_id: number | null;
  tipologia_id: number;
  numero: number | null;
  gg: number | null;
  mm: number | null;
  aa: number | null;
  annata: string | null;
  pagina: number | null;
  titolo: string | null;
  autore: string;
  destinatario: string;
  online: number;
  ocs: string | null;
};

export function validaDocumento(
  body: Record<string, unknown> | null
):
  | { ok: true; dati: DatiDocumento; chiavi: number[] | null; nuove: { nome: string; categoria: "primaria" | "secondaria" }[];collegati: number[] | null; }
  | { ok: false; errore: string } {
  try {
    if (!body) throw new ErroreValidazione("Richiesta non valida.");

    const gg = intOpz(body.gg, "Giorno", 0, 31);
    const mm = intOpz(body.mm, "Mese", 0, 12);
    const aa = intOpz(body.aa, "Anno", 0, 2100);


    const online = Number(body.online);
    if (online !== 0 && online !== 1)
      throw new ErroreValidazione("Valore di pubblicazione non valido.");

    let chiavi: number[] | null = null;
    if (body.chiavi_ids !== undefined) {
      if (!Array.isArray(body.chiavi_ids) || body.chiavi_ids.length > 200)
        throw new ErroreValidazione("Parole chiave non valide.");
    const ids = body.chiavi_ids.map(Number);
      if (ids.some((n) => !Number.isInteger(n) || n < 1))
        throw new ErroreValidazione("Parole chiave non valide.");
      chiavi = [...new Set(ids)];
      }

      const nuove: { nome: string; categoria: "primaria" | "secondaria" }[] = [];
        if (body.chiavi_nuove !== undefined) {
          if (!Array.isArray(body.chiavi_nuove) || body.chiavi_nuove.length > 50)
            throw new ErroreValidazione("Nuove parole chiave non valide.");
          for (const n of body.chiavi_nuove as Record<string, unknown>[]) {
            const nome = String(n?.nome ?? "").trim().replace(/\s+/g, " ");
            const categoria = String(n?.categoria ?? "");
            if (nome.length < 2 || nome.length > 200)
              throw new ErroreValidazione("Nome parola chiave non valido.");
            if (categoria !== "primaria" && categoria !== "secondaria")
              throw new ErroreValidazione("Categoria parola chiave non valida.");
            nuove.push({ nome, categoria });
          }
        }

      let collegati: number[] | null = null;
       if (body.collegati_ids !== undefined) {
        if (!Array.isArray(body.collegati_ids) || body.collegati_ids.length > 200)
           throw new ErroreValidazione("Documenti collegati non validi.");
         const ids = body.collegati_ids.map(Number);
         if (ids.some((n) => !Number.isInteger(n) || n < 1))
           throw new ErroreValidazione("Documenti collegati non validi.");
         collegati = [...new Set(ids)];
        }

    return {
      ok: true,
      chiavi,
      nuove,
      collegati,
      dati: {
        archivio_id: intReq(body.archivio_id, "Archivio"),
        collocamento_id: intReq(body.collocamento_id, "Collocamento"),
        testata_id: intOpz(body.testata_id, "Testata", 1, 2147483647),
        tipologia_id: intReq(body.tipologia_id, "Tipologia"),
        numero: intOpz(body.numero, "Numero", 0, 2147483647),
        gg,
        mm,
        aa,
        annata: testo(body.annata, "Annata", 50) || null,
        pagina: intOpz(body.pagina, "Pagina", 0, 2147483647),
        titolo: testo(body.titolo, "Titolo", 255) || null,
        autore: testo(body.autore, "Autore", 255),
        destinatario: testo(body.destinatario, "Destinatario", 255),
        online,
        ocs: String(body.ocs ?? "").trim() || null,
      },
    };
  } catch (e) {
    if (e instanceof ErroreValidazione) return { ok: false, errore: e.message };
    throw e;
  }
}

export function idFonte(v: unknown): number {
  return intReq(v, "Fonte");
}