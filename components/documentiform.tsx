"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChiaviSelector, { type Chiave } from "@/components/selectorchiavi";
import CollegatiSelector, { type Collegato } from "@/components/selectorcollegamenti";

type Opzione = { id: number; nome: string };

export type ValoriDocumento = {
  db_sorgente: string;
  tipologia_id: string;
  archivio_id: string;
  collocamento_id: string;
  testata_id: string;
  titolo: string;
  autore: string;
  destinatario: string;
  gg: string;
  mm: string;
  aa: string;
  annata: string;
  numero: string;
  pagina: string;
  online: string;
  ocs: string;
};

export const VALORI_VUOTI: ValoriDocumento = {
  db_sorgente: "",
  tipologia_id: "",
  archivio_id: "",
  collocamento_id: "",
  testata_id: "",
  titolo: "",
  autore: "",
  destinatario: "",
  gg: "",
  mm: "",
  aa: "",
  annata: "",
  numero: "",
  pagina: "",
  online: "1",
  ocs: "",
};

type Props = {
  opzioni: {
    fonti: Opzione[];
    tipologie: Opzione[];
    archivi: Opzione[];
    collocamenti: Opzione[];
    testate: Opzione[];
  };
  valoriIniziali?: ValoriDocumento;
  idDocumento?: number; 
  chiaviIniziali?: Chiave[];
  collegatiIniziali?: Collegato[];
};

const campo =
  "w-full border border-paper/25 bg-forest-800 px-3 py-2.5 text-sm text-paper/90 outline-none transition-colors placeholder:text-paper/30 focus:border-ochre-400 disabled:cursor-not-allowed disabled:opacity-50";
const etichetta =
  "mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60";

function Sezione({
  numero,
  titolo,
  children,
}: {
  numero: string;
  titolo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-paper/25 bg-forest-700">
      <div className="border-b border-paper/20 px-6 py-5 md:px-8">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
          {numero}
        </span>
        <h2 className="mt-2 font-display text-xl text-paper/90">{titolo}</h2>
      </div>
      <div className="grid gap-6 px-6 py-7 md:grid-cols-2 md:px-8">{children}</div>
    </section>
  );
}

function Campo({
  id,
  label,
  className = "",
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={etichetta}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function DocumentoForm({
  opzioni,
  valoriIniziali = VALORI_VUOTI,
  idDocumento,
  chiaviIniziali = [],
  collegatiIniziali = [],
}: Props) {
  const router = useRouter();
  const modifica = idDocumento !== undefined;
  const [v, setV] = useState<ValoriDocumento>(valoriIniziali);
  const [chiavi, setChiavi] = useState<Chiave[]>(chiaviIniziali);
  const [collegati, setCollegati] = useState<Collegato[]>(collegatiIniziali);
  const [errore, setErrore] = useState("");
  const [invio, setInvio] = useState(false);

  const set =
    (k: keyof ValoriDocumento) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setV((p) => ({ ...p, [k]: e.target.value }));

  const select = (
    k: keyof ValoriDocumento,
    lista: Opzione[],
    opts: { required?: boolean; disabled?: boolean; vuoto?: string } = {}
  ) => (
    <select
      id={k}
      value={v[k]}
      onChange={set(k)}
      required={opts.required}
      disabled={opts.disabled || invio}
      className={campo}
    >
      <option value="">{opts.vuoto ?? "— Seleziona —"}</option>
      {lista.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nome}
        </option>
      ))}
    </select>
  );

  const input = (
    k: keyof ValoriDocumento,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <input
      id={k}
      value={v[k]}
      onChange={set(k)}
      disabled={invio}
      className={campo}
      {...props}
    />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrore("");
    setInvio(true);

    try {
      const res = await fetch(
        modifica ? `/api/documenti/${idDocumento}` : "/api/documenti",
        {
          method: modifica ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...v,
            chiavi_ids: chiavi.filter((c) => c.id > 0).map((c) => c.id),
            chiavi_nuove: chiavi
              .filter((c) => c.id < 0)
              .map((c) => ({ nome: c.nome, categoria: c.categoria })),collegati_ids: collegati.map((c) => c.id),}),
        }
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrore(json.errore ?? "Salvataggio non riuscito.");
        setInvio(false);
        return;
      }
      router.push(`/documenti/${json.id}`);
      router.refresh();
    } catch {
      setErrore("Errore di connessione. Riprova.");
      setInvio(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Sezione numero="01 / Classificazione" titolo="Collocazione del documento">
        <Campo id="db_sorgente" label="Fonte">
          {select("db_sorgente", opzioni.fonti, { required: true, disabled: modifica })}
        </Campo>
        <Campo id="tipologia_id" label="Tipologia">
          {select("tipologia_id", opzioni.tipologie, { required: true })}
        </Campo>
        <Campo id="archivio_id" label="Archivio">
          {select("archivio_id", opzioni.archivi, { required: true })}
        </Campo>
        <Campo id="collocamento_id" label="Collocamento">
          {select("collocamento_id", opzioni.collocamenti, { required: true })}
        </Campo>
        <Campo id="testata_id" label="Testata">
          {select("testata_id", opzioni.testate, { vuoto: "— Nessuna —" })}
        </Campo>
      </Sezione>

      <Sezione numero="02 / Descrizione" titolo="Titolo e persone">
        <Campo id="titolo" label="Titolo" className="md:col-span-2">
          {input("titolo", { type: "text", maxLength: 255 })}
        </Campo>
        <Campo id="autore" label="Autore">
          {input("autore", { type: "text", maxLength: 255 })}
        </Campo>
        <Campo id="destinatario" label="Destinatario">
          {input("destinatario", { type: "text", maxLength: 255 })}
        </Campo>
      </Sezione>

      <Sezione numero="03 / Data e riferimenti" titolo="Data, numero, pagina">
        <div className="grid grid-cols-3 gap-4 md:col-span-2">
          <Campo id="gg" label="Giorno">
            {input("gg", { type: "number", min: 0, max: 31 })}
          </Campo>
          <Campo id="mm" label="Mese">
            {input("mm", { type: "number", min: 0, max: 12 })}
          </Campo>
          <Campo id="aa" label="Anno">
            {input("aa", { type: "number", min: 0, max: 2100 })}
          </Campo>
        </div>
        <Campo id="annata" label="Annata">
          {input("annata", { type: "text", maxLength: 50 })}
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo id="numero" label="Numero">
            {input("numero", { type: "number", min: 0 })}
          </Campo>
          <Campo id="pagina" label="Pagina">
            {input("pagina", { type: "number", min: 0 })}
          </Campo>
        </div>
      </Sezione>

      <section className="border border-paper/25 bg-forest-700">
        <div className="border-b border-paper/20 px-6 py-5 md:px-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
            04 / Testo
          </span>
          <h2 className="mt-2 font-display text-xl text-paper/90">
            Testo integrale
          </h2>
        </div>
        <div className="px-6 py-7 md:px-8">
          <textarea
            id="ocs"
            value={v.ocs}
            onChange={set("ocs")}
            disabled={invio}
            rows={16}
            className={`${campo} font-mono text-xs leading-6`}
          />
        </div>
      </section>

      <section className="border border-paper/25 bg-forest-700">
        <div className="border-b border-paper/20 px-6 py-5 md:px-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
            05 / Parole chiave
          </span>
          <h2 className="mt-2 font-display text-xl text-paper/90">
            Parole chiave
          </h2>
        </div>
        <div className="px-6 py-7 md:px-8">
          <ChiaviSelector
            selezionate={chiavi}
            onChange={setChiavi}
            disabled={invio}
          />
        </div>
      </section>

      <section className="border border-paper/25 bg-forest-700">
        <div className="border-b border-paper/20 px-6 py-5 md:px-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ochre-400">
            06 / Collegamenti
          </span>
          <h2 className="mt-2 font-display text-xl text-paper/90">
            Documenti collegati
          </h2>
        </div>
        <div className="px-6 py-7 md:px-8">
          <CollegatiSelector
            selezionati={collegati}
            onChange={setCollegati}
            escludiId={idDocumento}
            disabled={invio}
          />
        </div>
      </section>

      <Sezione numero="07 / Pubblicazione" titolo="Visibilità">
        <Campo id="online" label="Stato">
          <select
            id="online"
            value={v.online}
            onChange={set("online")}
            disabled={invio}
            className={campo}
          >
            <option value="1">Visibile</option>
            <option value="0">Nascosto</option>
          </select>
        </Campo>
      </Sezione>

      {errore && (
        <div role="alert" className="border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-300">
            {errore}
          </p>
        </div>
      )}

      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={invio}
          className="group flex items-center gap-4 border border-ochre-400/50 px-6 py-3.5 text-paper transition-all hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
            {invio ? "Salvataggio..." : modifica ? "Salva modifiche" : "Crea documento"}
          </span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>

        <Link
          href={modifica ? `/documenti/${idDocumento}` : "/archivio"}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-paper"
        >
          Annulla
        </Link>
      </div>
    </form>
  );
}