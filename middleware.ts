import { NextRequest, NextResponse } from "next/server";
import { authConfigured, authCookieName, validSession } from "@/lib/auth";

const publicPaths = new Set(["/login", "/api/auth/login", "/api/auth/logout", "/api/auth/session"]);

function isPublicAsset(pathname: string) {
  return pathname.startsWith("/_next/") || pathname === "/favicon.ico";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicAsset(pathname) || publicPaths.has(pathname)) return NextResponse.next();

  const isApi = pathname.startsWith("/api/");
  if (!authConfigured()) {
    if (isApi) return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า APP_SESSION_SECRET" }, { status: 500 });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const signedIn = validSession(request.cookies.get(authCookieName)?.value);
  if (signedIn) return NextResponse.next();

  if (isApi) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" }, { status: 401 });
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*"]
};
