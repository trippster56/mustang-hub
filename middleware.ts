import { NextRequest, NextResponse } from "next/server";

// Cookie-gated access with a branded /login page (no ugly browser Basic Auth popup).
// A correct password sets an httpOnly session cookie whose value === AUTH_SECRET;
// middleware just checks for that cookie. If SITE_PASSWORD/AUTH_SECRET are unset,
// the site stays open (so a misconfigured deploy never locks everyone out).
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};

export function middleware(req: NextRequest) {
  const SECRET = process.env.AUTH_SECRET;
  if (!SECRET || !process.env.SITE_PASSWORD) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname === "/login" || pathname === "/api/login") return NextResponse.next();

  if (req.cookies.get("mh_session")?.value === SECRET) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}
