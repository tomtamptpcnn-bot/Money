import { NextResponse } from "next/server";
import { resetData } from "@/lib/firebase-store";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await resetData();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "รีเซ็ตข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
