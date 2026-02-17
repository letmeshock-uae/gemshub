import Link from "next/link"
import { GearSix } from "@phosphor-icons/react/dist/ssr"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Datum Gems Hub
        </p>
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <GearSix className="h-3.5 w-3.5" />
          Admin
        </Link>
      </div>
    </footer>
  )
}
