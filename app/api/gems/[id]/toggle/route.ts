import { NextResponse } from "next/server"
import * as store from "@/lib/gems-store"

export const dynamic = "force-dynamic"

// PATCH /api/gems/:id/toggle — toggle published
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gem = store.togglePublished(id)
  if (!gem) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(gem)
}
