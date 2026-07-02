import { NextRequest, NextResponse } from "next/server";
import { authConfigured, authCookieName, validSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    configured: authConfigured(),
    signedIn: validSession(request.cookies.get(authCookieName)?.value)
  });
}
