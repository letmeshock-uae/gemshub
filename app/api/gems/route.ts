import { NextResponse } from "next/server"
import * as store from "@/lib/gems-store"

export const dynamic = "force-dynamic"

// GET /api/gems — returns all gems
export async function GET() {
  return NextResponse.json(store.getAll())
}

// POST /api/gems — create a new gem
export async function POST(req: Request) {
  const body = await req.json()
  const gem = store.create(body)
  return NextResponse.json(gem, { status: 201 })
}
