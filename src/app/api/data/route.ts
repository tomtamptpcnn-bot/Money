import { NextRequest, NextResponse } from "next/server";
import { buildSummaryFromData, listData } from "@/lib/firebase-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const data = await listData();
    if (request.nextUrl.searchParams.get("summary") === "1") {
      return NextResponse.json({ data, summary: buildSummaryFromData(data) });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "อ่านข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
