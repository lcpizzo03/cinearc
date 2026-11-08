"use client";

import { useEffect, useRef, useState } from "react";

export type Chiave = { id: number; nome: string; categoria: string };

export default function ChiaviSelector({
  selezionate,
  onChange,
  disabled,
}: {
  selezionate: Chiave[];
  onChange: (c: Chiave[]) => void;
  disabled?: boolean;
}) {
  const [testo, setTesto] = useState("");
  const [risultati, setRisultati] = useState<Chiave[]>([]);
  const [aperto, setAperto] = useState(false);
  const [attivo, setAttivo] = useState(0);
  const [erroreCrea, setErroreCrea] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const idSelezionati = new Set(selezionate.map((c) => c.id));
  const visibili = risultati.filter((r) => !idSelezionati.has(r.id));

  useEffect(() => {
    const q = testo.trim();
    if (q.length < 2) {
      setRisultati([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/parole-chiave?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        setRisultati(await res.json());
        setAttivo(0);
        setAperto(true);
      } catch {
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [testo]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setAperto(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const aggiungi = (c: Chiave) => {
    onChange([...selezionate, c]);
    setTesto("");
    setRisultati([]);
    setAperto(false);
    setErroreCrea("");
    inputRef.current?.focus();
  };

  const rimuovi = (id: number) =>
    onChange(selezionate.filter((c) => c.id !== id));

  const crea = (categoria: "primaria" | "secondaria") => {
    const nome = testo.trim().replace(/\s+/g, " ");
    if (nome.length < 2 || nome.length > 200) {
      setErroreCrea("Il nome deve avere da 2 a 200 caratteri.");
      return;
    }
    const gia = selezionate.find(
      (c) => c.nome.toLowerCase() === nome.toLowerCase()
    );
    if (gia) {
      setErroreCrea("Questa parola chiave è già nell'elenco.");
      return;
    }
    const minId = Math.min(0, ...selezionate.map((c) => c.id));
    aggiungi({ id: minId - 1, nome, categoria });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      if (aperto && visibili[attivo]) aggiungi(visibili[attivo]);
    } else if (e.key === "ArrowDown" && visibili.length > 0) {
      e.preventDefault();
      setAttivo((i) => (i + 1) % visibili.length);
    } else if (e.key === "ArrowUp" && visibili.length > 0) {
      e.preventDefault();
      setAttivo((i) => (i <= 0 ? visibili.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setAperto(false);
    }
  };

  return (
    <div>
      {selezionate.length > 0 ? (
        <div className="mb-5 space-y-4">
          {(["primaria", "secondaria"] as const).map((cat) => {
            const gruppo = selezionate.filter((c) =>
              cat === "primaria"
                ? c.categoria === "primaria"
                : c.categoria !== "primaria"
            );
            if (gruppo.length === 0) return null;
            return (
              <div key={cat}>
                <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-paper/55">
                  {cat === "primaria" ? "Primarie" : "Secondarie"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {gruppo.map((c) => (
                    <span
                      key={c.id}
                      className={`flex items-center gap-2 border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                        cat === "primaria"
                          ? "border-bordeaux-500/60 text-bordeaux-400"
                          : "border-ochre-400/50 text-ochre-400"
                      }`}
                    >
                      {c.nome}
                      <button
                        type="button"
                        onClick={() => rimuovi(c.id)}
                        disabled={disabled}
                        aria-label={`Rimuovi ${c.nome}`}
                        className="text-paper/60 transition-colors hover:text-paper disabled:opacity-40"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mb-5 text-sm text-paper/55">
          Nessuna parola chiave associata.
        </p>
      )}

      <div ref={boxRef} className="relative max-w-md">
        <input
          ref={inputRef}
          type="text"
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => visibili.length > 0 && setAperto(true)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Cerca una parola chiave da aggiungere..."
          className="w-full border border-paper/25 bg-forest-800 px-3 py-2.5 text-sm text-paper/90 outline-none transition-colors placeholder:text-paper/30 focus:border-ochre-400 disabled:opacity-50"
        />

        {aperto && visibili.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto border border-paper/25 bg-forest-800 shadow-lg">
            {visibili.map((r, i) => (
              <li
                key={r.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  aggiungi(r);
                }}
                onMouseEnter={() => setAttivo(i)}
                className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5 text-sm ${
                  i === attivo ? "bg-forest-600 text-ochre-400" : "text-paper/80"
                }`}
              >
                <span className="truncate">{r.nome}</span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-paper/60">
                  {r.categoria}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {testo.trim().length >= 2 &&
        !risultati.some(
          (r) => r.nome.toLowerCase() === testo.trim().toLowerCase()
        ) && (
          <div className="mt-3 max-w-md border border-paper/20 bg-forest-800/60 px-4 py-3">
            <p className="text-xs text-paper/65">
              Non trovi «{testo.trim()}»? Crea una nuova parola chiave:
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => crea("primaria")}
                disabled={disabled}
                className="border border-bordeaux-500/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-bordeaux-400 transition-colors hover:bg-bordeaux-500/10 disabled:opacity-40"
              >
                + Primaria
              </button>
              <button
                type="button"
                onClick={() => crea("secondaria")}
                disabled={disabled}
                className="border border-ochre-400/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ochre-400 transition-colors hover:bg-ochre-400/10 disabled:opacity-40"
              >
                + Secondaria
              </button>
            </div>
            {erroreCrea && (
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-red-300">
                {erroreCrea}
              </p>
            )}
          </div>
        )}
    </div>
  );
}