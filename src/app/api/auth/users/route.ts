import { NextResponse } from "next/server";
import { ensureDefaultAdminUser, listUsers } from "@/lib/firebase-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDefaultAdminUser();
    return NextResponse.json(await listUsers());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "อ่านข้อมูลผู้ใช้ไม่สำเร็จ" }, { status: 500 });
  }
}
