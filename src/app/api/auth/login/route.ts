import { NextRequest, NextResponse } from "next/server";
import { authConfigured, authCookieName } from "@/lib/auth";
import { recordUserLogin, validateUserCredentials } from "@/lib/firebase-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!authConfigured()) throw new Error("ยังไม่ได้ตั้งค่า APP_SESSION_SECRET ใน .env.local");
    const body = await request.json();
    const username = String(body.username ?? "");
    const password = String(body.password ?? "");
    const validUser = await validateUserCredentials(username, password);
    if (!validUser) {
      return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const user = await recordUserLogin(username);
    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(authCookieName, process.env.APP_SESSION_SECRET ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ" }, { status: 500 });
  }
}
