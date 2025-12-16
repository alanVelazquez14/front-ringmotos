import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  const DASHBOARD_URL = "/dashboard";
  const LOGIN_URL = "/login";

  if (!token && pathname !== LOGIN_URL) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  if (token && pathname === LOGIN_URL) {
    return NextResponse.redirect(new URL(DASHBOARD_URL, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/"],
};
