import { NextRequest, NextResponse } from "next/server";
import { addResource, readResource } from "@/lib/firebase-store";
import { validateResource } from "@/lib/schemas";
import type { Resource } from "@/lib/types";

const resources = new Set(["transactions", "wallets", "categories", "assets", "debts", "goals"]);

function parseResource(resource: string): Resource {
  if (!resources.has(resource)) throw new Error("ไม่รู้จักประเภทข้อมูลนี้");
  return resource as Resource;
}

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await context.params;
    return NextResponse.json(await readResource(parseResource(resource)));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "อ่านข้อมูลไม่สำเร็จ" }, { status: 400 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await context.params;
    const parsed = parseResource(resource);
    const payload = validateResource(parsed, await request.json());
    return NextResponse.json(await addResource(parsed, payload), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ" }, { status: 400 });
  }
}
