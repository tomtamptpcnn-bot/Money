import { NextRequest, NextResponse } from "next/server";
import { deleteResource, updateResource } from "@/lib/firebase-store";
import { validateResource } from "@/lib/schemas";
import type { Resource } from "@/lib/types";

const resources = new Set(["transactions", "wallets", "categories", "assets", "debts", "goals"]);

function parseResource(resource: string): Resource {
  if (!resources.has(resource)) throw new Error("ไม่รู้จักประเภทข้อมูลนี้");
  return resource as Resource;
}

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const { resource, id } = await context.params;
    const parsed = parseResource(resource);
    const payload = validateResource(parsed, await request.json());
    return NextResponse.json(await updateResource(parsed, id, payload));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "อัปเดตข้อมูลไม่สำเร็จ" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const { resource, id } = await context.params;
    return NextResponse.json(await deleteResource(parseResource(resource), id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ลบข้อมูลไม่สำเร็จ" }, { status: 400 });
  }
}
