import { NextResponse } from "next/server"
import * as store from "@/lib/gems-store"

export const dynamic = "force-dynamic"

// GET /api/gems/:id
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gem = store.getById(id)
  if (!gem) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(gem)
}

// PUT /api/gems/:id — update gem
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const gem = await store.update(id, body)
  if (!gem) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(gem)
}

// DELETE /api/gems/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await store.remove(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
