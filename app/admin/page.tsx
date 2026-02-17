import { redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/auth"
import { AdminHeader } from "@/components/admin/admin-header"
import { GemTable } from "@/components/admin/gem-table"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const authed = await isAuthenticated()
  if (!authed) redirect("/admin/login")

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <GemTable />
      </main>
    </div>
  )
}
