import { NextResponse } from "next/server";
import { listData } from "@/lib/firebase-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listData());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "อ่านข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
