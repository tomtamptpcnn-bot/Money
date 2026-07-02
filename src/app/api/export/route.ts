import { NextResponse } from "next/server";
import { exportDataBackup } from "@/lib/firebase-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backup = await exportDataBackup();
    return NextResponse.json(backup, {
      headers: {
        "Content-Disposition": "attachment; filename=MoneyTomtam-backup.json"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "สำรองข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
