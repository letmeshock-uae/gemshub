import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/auth"
import * as store from "@/lib/gems-store"
import { AdminHeader } from "@/components/admin/admin-header"
import { GemForm } from "@/components/admin/gem-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Edit Gem - Datum Gems Hub",
}

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const authed = await isAuthenticated()
  if (!authed) redirect("/admin/login")

  const { id } = await params
  const gem = store.getById(id)

  if (!gem) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <GemForm gem={gem} />
      </main>
    </div>
  )
}
