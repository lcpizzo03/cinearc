import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prismaDB } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credenziali",
      credentials: {
        identifier: { label: "Username o Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const identifier = credentials.identifier.trim().toLowerCase();
        const isEmail = identifier.includes("@");

        const utente = await prismaDB.utenti.findFirst({
          where: isEmail ? { email: identifier } : { username: identifier },
        });

       const hashdiConfronto =
      utente?.password ?? "$2a$10$CwTycUXWue0Thq9StjUM0uJ8Y8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8";

      const passwordValida = await bcrypt.compare(
      credentials.password as string,
      hashdiConfronto
);

if (!utente || !passwordValida) return null;

        return {
          id: String(utente.id),
          name: utente.nome_completo,
          email: utente.email,
          ruolo: utente.ruolo,
        };
      },
    }),
  ],
callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.ruolo = user.ruolo; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;    
        session.user.ruolo = token.ruolo; 
      }
      return session;
    },
  },
};