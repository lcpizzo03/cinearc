"use client";

import { useState } from "react";

const inputClass =
  "w-full border-b border-paper/25 bg-transparent px-0 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper/30 focus:border-ochre-400 disabled:cursor-not-allowed disabled:opacity-40";
const labelClass =
  "mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60";

export default function PasswordForm() {
  const [aperto, setAperto] = useState(false);
  const [attuale, setAttuale] = useState("");
  const [nuova, setNuova] = useState("");
  const [conferma, setConferma] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chiudi = () => {
    setAperto(false);
    setAttuale("");
    setNuova("");
    setConferma("");
    setError("");
  };

  const apri = () => {
    setOk(false);
    setAperto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (nuova !== conferma) {
      setError("Le due password nuove non coincidono.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/profilo/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attuale, nuova }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.errore ?? "Cambio password non riuscito.");
      } else {
        chiudi();
        setOk(true);
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
            Password
          </span>
          <span className="font-mono text-sm tracking-widest text-paper">
            ••••••••••
          </span>
        </div>

        {!aperto && (
          <button
            type="button"
            onClick={apri}
            className="self-start border border-ochre-400/50 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ochre-400 transition-colors hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950 sm:self-auto"
          >
            Cambia password
          </button>
        )}
      </div>

      {ok && !aperto && (
        <div
          role="status"
          className="border-t border-paper/15 px-6 py-4 md:px-8"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ochre-400">
            Password aggiornata.
          </p>
        </div>
      )}

      {aperto && (
        <form
          onSubmit={handleSubmit}
          className="space-y-7 border-t border-paper/15 bg-forest-800/50 px-6 py-8 md:px-8"
        >
          {error && (
            <div
              role="alert"
              className="border border-red-900/50 bg-red-950/20 px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-300">
                {error}
              </p>
            </div>
          )}

          <div className="grid gap-7 md:grid-cols-3 md:gap-8">
            <div>
              <label htmlFor="attuale" className={labelClass}>
                Password attuale
              </label>
              <input
                id="attuale"
                type="password"
                value={attuale}
                onChange={(e) => setAttuale(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                autoFocus
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="nuova" className={labelClass}>
                Nuova password
              </label>
              <input
                id="nuova"
                type="password"
                value={nuova}
                onChange={(e) => setNuova(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
                placeholder="Almeno 8 caratteri"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="conferma" className={labelClass}>
                Conferma
              </label>
              <input
                id="conferma"
                type="password"
                value={conferma}
                onChange={(e) => setConferma(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="submit"
              disabled={isLoading}
              className="group flex items-center gap-4 border border-ochre-400/50 px-5 py-3 text-paper transition-all hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                {isLoading ? "Salvataggio..." : "Salva"}
              </span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={chiudi}
              disabled={isLoading}
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 transition-colors hover:text-paper disabled:opacity-40"
            >
              Annulla
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
