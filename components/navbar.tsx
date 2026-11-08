"use client"; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/il-progetto", label: "Il progetto" },
  { href: "/timeline", label: "Timeline" },
  { href: "/fonti", label: "Fonti" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-paper/10 bg-forest-950/95 backdrop-blur-md">
      <div className="mx-auto h-[76px] px-6 md:px-10">
        <nav className="flex h-full items-center justify-between">

          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="CineArc - Home"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-ochre-400/70 text-[11px] font-medium tracking-tight text-ochre-400 transition-colors group-hover:bg-ochre-400 group-hover:text-forest-950">
              CA
            </span>

            <span className="font-mono text-sm font-medium tracking-[0.22em] text-paper">
              CINEARC
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    active
                      ? "text-ochre-400"
                      : "text-paper/60 hover:text-paper"
                  }`}
                >
                  {link.label}

                  {active && (
                    <span className="absolute inset-x-0 -bottom-0.5 h-px bg-ochre-400" />
                  )}
                </Link>
              );
            })}
          </div>


          {status === "loading" ? (
            <div className="h-8 w-8 border border-paper/10" />
            ) : session ? (
              <div className="flex items-center gap-5">
                <Link
                  href="/archivio"
                  className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60 transition-colors hover:text-ochre-400 sm:block"
                >
                  Archivio
                </Link>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="group flex items-center gap-3"
                >
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60 transition-colors group-hover:text-paper sm:block">
                    Esci
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center border border-paper/20 text-paper/70 transition-all group-hover:border-ochre-400 group-hover:text-ochre-400">
                    <span className="text-xs">↗</span>
                  </span>
                </button>
              </div>
) : (
    <div className="flex items-center gap-5">
        <Link
          href="/login"
          className="group flex items-center gap-3"
        >
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60 transition-colors group-hover:text-paper sm:block">
            Accedi
          </span>

          <span className="flex h-8 w-8 items-center justify-center border border-paper/20 text-paper/70 transition-all group-hover:border-ochre-400 group-hover:text-ochre-400 sm:hidden">
            <span className="text-xs">↗</span>
          </span>
        </Link>

        <Link
          href="/registrati"
          className="hidden border border-ochre-400/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-400 transition-colors hover:border-ochre-400 hover:bg-ochre-400 hover:text-forest-950 sm:block"
        >
          Registrati
        </Link>
      </div>
)}
        </nav>
      </div>
    </header>
  );
}