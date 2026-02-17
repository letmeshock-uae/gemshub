import { NextResponse } from "next/server"
import * as store from "@/lib/gems-store"

export const dynamic = "force-dynamic"

export async function GET() {
  const json = store.toJson()
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=gems.json",
    },
  })
}
