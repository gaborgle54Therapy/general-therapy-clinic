import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const rol = req.cookies.get("rol")?.value;
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/usuarios") && rol !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/usuarios/:path*",
  ],
};