import { NextResponse } from "next/server";
import { buildSummary } from "@/lib/firebase-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await buildSummary());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "สร้างสรุปข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
