import Link from "next/link"
import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { DiamondsFour, SignOut, ArrowLeft } from "@phosphor-icons/react/dist/ssr"

export function AdminHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to main page</span>
            </Link>
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <DiamondsFour className="h-4 w-4 text-primary-foreground" weight="fill" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Admin Dashboard
          </span>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            <SignOut className="mr-1.5 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </header>
  )
}
