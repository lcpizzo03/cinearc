"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type Suggestion = { label: string; type: "chiave" | "titolo" | "autore" };

const TYPE_LABEL = {
  chiave: "Parola chiave",
  titolo: "Titolo",
  autore: "Autore",
} as const;

export default function RicercaArchivio({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const skipNextFetch = useRef(false);

  const showList = open && value.trim().length >= 2 && suggestions.length > 0;

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const q = value.trim();
    if (q.length < 2) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/archivio/suggerimenti?q=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;

        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setActive(-1);
        setOpen(data.length > 0 && document.activeElement === inputRef.current);
      } catch {
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const choose = (s: Suggestion) => {
    if (s.label !== value) skipNextFetch.current = true;

    flushSync(() => {
      setValue(s.label);
      setOpen(false);
      setActive(-1);
    });

    inputRef.current?.form?.requestSubmit();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="border border-paper/25 bg-forest-700 p-5">
      <label
        htmlFor="archive-search"
        className="mb-3 block font-mono text-[10px] uppercase tracking-[0.2em] text-paper/65"
      >
        Ricerca libera
      </label>

      <div className="flex flex-col gap-3 md:flex-row">
        <div ref={boxRef} className="relative flex-1">
          <input
            ref={inputRef}
            id="archive-search"
            name="q"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            autoComplete="off"
            role="combobox"
            aria-expanded={showList}
            aria-autocomplete="list"
            aria-controls="archive-suggestions"
            placeholder="Titolo, autore, destinatario o parola chiave..."
            className="min-h-12 w-full border border-paper/20 bg-forest-800 px-4 text-sm text-paper outline-none transition placeholder:text-paper/35 focus:border-ochre-400/60"
          />

          {showList && (
            <ul
              id="archive-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto border border-paper/25 bg-forest-800 shadow-lg"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.type}-${s.label}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(s);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5 text-sm ${
                    i === active ? "bg-forest-600 text-ochre-400" : "text-paper/80"
                  }`}
                >
                  <span className="truncate">{s.label}</span>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.15em] text-paper/40">
                    {TYPE_LABEL[s.type]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="min-h-12 border border-ochre-400/50 px-7 font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-400 transition hover:bg-ochre-400 hover:text-forest-950"
        >
          Cerca
        </button>
      </div>
    </div>
  );
}