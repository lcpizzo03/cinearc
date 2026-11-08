import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const ruolo = req.nextauth.token?.ruolo as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && ruolo !== "admin") {
      return NextResponse.redirect(new URL("/archivio", req.url));
    }

    const soloGestori =
      path === "/archivio/nuovo" ||
      /^\/documenti\/[^/]+\/modifica$/.test(path);

    if (soloGestori && ruolo !== "gestore" && ruolo !== "admin") {
      return NextResponse.redirect(new URL("/archivio", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/archivio/:path*", "/documenti/:path*", "/admin/:path*"],
};