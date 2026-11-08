import type { Metadata } from "next";
import "./globals.css";

import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "CineArc — Archivio del cinema",
  description:
    "Archivio digitale dedicato al cinema, alla censura e alla documentazione storica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}