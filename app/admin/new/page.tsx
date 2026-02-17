import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/auth"
import { AdminHeader } from "@/components/admin/admin-header"
import { GemForm } from "@/components/admin/gem-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "New Gem - Datum Gems Hub",
}

export default async function AdminNewPage() {
  const authed = await isAuthenticated()
  if (!authed) redirect("/admin/login")
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <GemForm />
      </main>
    </div>
  )
}
