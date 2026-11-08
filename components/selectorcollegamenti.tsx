"use client";

import { useEffect, useRef, useState } from "react";

export type Collegato = { id: number; titolo: string | null; online: number };

function etichetta(d: Collegato) {
  const t = d.titolo?.trim();
  return t && t.toLowerCase() !== "undefined" ? t : "Documento senza titolo";
}

export default function CollegatiSelector({
  selezionati,
  onChange,
  escludiId,
  disabled,
}: {
  selezionati: Collegato[];
  onChange: (c: Collegato[]) => void;
  escludiId?: number;
  disabled?: boolean;
}) {
  const [testo, setTesto] = useState("");
  const [risultati, setRisultati] = useState<Collegato[]>([]);
  const [aperto, setAperto] = useState(false);
  const [attivo, setAttivo] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const idSel = new Set(selezionati.map((c) => c.id));
  const visibili = risultati.filter((r) => !idSel.has(r.id));

  useEffect(() => {
    const q = testo.trim();
    if (q.length < 2) {
      setRisultati([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const url =
          `/api/collegamenti/ricerca?q=${encodeURIComponent(q)}` +
          (escludiId ? `&escludi=${escludiId}` : "");
        const res = await fetch(url, { signal: controller.signal });
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
  }, [testo, escludiId]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setAperto(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const aggiungi = (d: Collegato) => {
    onChange([...selezionati, d]);
    setTesto("");
    setRisultati([]);
    setAperto(false);
    inputRef.current?.focus();
  };

  const rimuovi = (id: number) =>
    onChange(selezionati.filter((c) => c.id !== id));

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
      {selezionati.length > 0 ? (
        <ul className="mb-5 divide-y divide-paper/15 border border-paper/20">
          {selezionati.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-base text-paper/90">
                  {etichetta(c)}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-paper/55">
                  Ref #{c.id}
                  {c.online !== 1 && (
                    <span className="ml-3 text-bordeaux-400">Nascosto</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => rimuovi(c.id)}
                disabled={disabled}
                aria-label={`Rimuovi collegamento a ${c.id}`}
                className="shrink-0 text-paper/60 transition-colors hover:text-paper disabled:opacity-40"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-5 text-sm text-paper/55">Nessun documento collegato.</p>
      )}

      <div ref={boxRef} className="relative max-w-xl">
        <input
          ref={inputRef}
          type="text"
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => visibili.length > 0 && setAperto(true)}
          disabled={disabled}
          autoComplete="off"
          placeholder="Cerca per titolo, autore o numero Ref..."
          className="w-full border border-paper/25 bg-forest-800 px-3 py-2.5 text-sm text-paper/90 outline-none transition-colors placeholder:text-paper/30 focus:border-ochre-400 disabled:opacity-50"
        />

        {aperto && visibili.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-auto border border-paper/25 bg-forest-800 shadow-lg">
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
                <span className="truncate">{etichetta(r)}</span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-paper/60">
                  #{r.id}
                  {r.online !== 1 && " · nascosto"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}