"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Ruolo = "utente" | "gestore";

export default function RuoloForm({
  idUtente,
  ruoloIniziale,
}: {
  idUtente: number;
  ruoloIniziale: Ruolo;
}) {
  const router = useRouter();
  const [ruolo, setRuolo] = useState<Ruolo>(ruoloIniziale);
  const [salvato, setSalvato] = useState<Ruolo>(ruoloIniziale);
  const [errore, setErrore] = useState("");
  const [ok, setOk] = useState(false);
  const [invio, setInvio] = useState(false);

  const salva = async () => {
    setErrore("");
    setOk(false);
    setInvio(true);
    try {
      const res = await fetch(`/api/admin/utenti/${idUtente}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruolo }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrore(json.errore ?? "Salvataggio non riuscito.");
      } else {
        setSalvato(ruolo);
        setOk(true);
        router.refresh();
      }
    } catch {
      setErrore("Errore di connessione. Riprova.");
    } finally {
      setInvio(false);
    }
  };

  return (
    <div className="space-y-6 px-6 py-7 md:px-8">
      {errore && (
        <div role="alert" className="border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-300">
            {errore}
          </p>
        </div>
      )}
      {ok && (
        <div role="status" className="border border-ochre-400/40 bg-ochre-400/10 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-400">
            Ruolo aggiornato. L&apos;utente lo vedrà al prossimo accesso.
          </p>
        </div>
      )}

      <div className="max-w-xs">
        <label
          htmlFor="ruolo"
          className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60"
        >
          Ruolo
        </label>
        <select
          id="ruolo"
          value={ruolo}
          onChange={(e) => setRuolo(e.target.value as Ruolo)}
          disabled={invio}
          className="w-full border border-paper/25 bg-forest-800 px-3 py-2.5 text-sm text-paper/90 outline-none transition-colors focus:border-ochre-400 disabled:opacity-50"
        >
          <option value="utente">Utente</option>
          <option value="gestore">Gestore</option>
        </select>
      </div>

      <button
        type="button"
        onClick={salva}
        disabled={invio || ruolo === salvato}
        className="border border-ochre-400/50 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ochre-400 transition-colors hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {invio ? "Salvataggio..." : "Salva ruolo"}
      </button>
    </div>
  );
}