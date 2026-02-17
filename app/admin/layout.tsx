import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { isAuthenticated } from "@/app/actions/auth"

export const metadata: Metadata = {
  title: "Admin - Datum Gems Hub",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authed = await isAuthenticated()

  // If not authenticated and not on the login page, redirect to login
  // We check children to avoid infinite redirect on /admin/login
  // Instead, we'll handle this per-page
  return <>{children}</>
}
