"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full border-b border-paper/20 bg-transparent px-0 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper/20 focus:border-ochre-400 disabled:cursor-not-allowed disabled:opacity-40";

const labelClass =
  "mb-3 block font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50";

export default function RegistratiPage() {
  const router = useRouter();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/registrati", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_completo: nomeCompleto,
          username,
          email,
          password,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.errore ?? "Registrazione non riuscita.");
        setIsLoading(false);
        return;
      }

      router.push("/login?registrato=1");
    } catch {
      setError("Errore di connessione. Riprova.");
      setIsLoading(false);
    }
  };

  return (
    <main className="cinearc-noise relative min-h-screen overflow-hidden bg-forest-950 text-paper">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-ochre-400/20" />
        <div className="absolute left-[8%] top-[18%] h-[55%] w-px bg-paper/[0.06]" />
        <div className="absolute right-[8%] top-[18%] h-[55%] w-px bg-paper/[0.06]" />
        <div className="absolute bottom-[12%] left-1/2 h-px w-[84%] -translate-x-1/2 bg-paper/[0.06]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] items-center px-6 py-28 md:px-10">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_480px] lg:gap-24">
          <section className="hidden lg:block">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ochre-400">
                CineArc
              </span>
              <span className="h-px w-16 bg-ochre-400/40" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/35">
                Registrazione
              </span>
            </div>

            <h1 className="max-w-3xl font-display text-6xl leading-[0.94] text-paper xl:text-8xl">
              Chiedi
              <br />
              l'accesso
            </h1>

            <p className="mt-10 max-w-xl text-sm leading-7 text-paper/55">
              Crea un account per consultare l'archivio digitale di CineArc:
              documenti, fonti e testimonianze sui film vietati o tagliati
              per motivi religiosi e morali nell'Italia del Novecento.
            </p>

            <div className="mt-14 flex items-center gap-5">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/30">
                Archivio digitale
              </span>
              <span className="h-px w-20 bg-paper/10" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper/30">
                Consultazione
              </span>
            </div>
          </section>

          <section className="w-full">
            <div className="border border-paper/10 bg-forest-800/70">
              <div className="border-b border-paper/10 px-7 py-6 md:px-9">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-ochre-400">
                      Registrazione
                    </span>
                    <h2 className="mt-3 font-display text-3xl text-paper md:text-4xl">
                      Nuovo account
                    </h2>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-paper/25">
                    CA / 02
                  </span>
                </div>
              </div>

              <div className="px-7 py-8 md:px-9 md:py-10">
                {error && (
                  <div
                    role="alert"
                    className="mb-7 border border-red-900/50 bg-red-950/20 px-4 py-3"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">
                  <div>
                    <label htmlFor="nome_completo" className={labelClass}>
                      Nome completo
                
                    </label>
                    <input
                      id="nome_completo"
                      type="text"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      disabled={isLoading}
                      autoComplete="name"
                      className={inputClass}
                      placeholder="Nome e cognome"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className={labelClass}>
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="username"
                      className={inputClass}
                      placeholder="Scegli uno username"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      className={inputClass}
                      placeholder="nome@esempio.it"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClass}>
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading}
                      autoComplete="new-password"
                      className={inputClass}
                      placeholder="Almeno 8 caratteri"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group flex w-full items-center justify-between border border-ochre-400/50 px-5 py-4 text-paper transition-all hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                        {isLoading ? "Registrazione in corso..." : "Crea account"}
                      </span>
                      <span className="text-lg transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-paper/10 px-7 py-5 md:px-9">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href="/login"
                    className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/40 transition-colors hover:text-ochre-400"
                  >
                    Hai già un account? Accedi
                  </Link>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper/25">
                    CineArc
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}