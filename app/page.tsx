import { LandingHeader } from "@/components/landing/landing-header"
import { GemGrid } from "@/components/landing/gem-grid"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <GemGrid />
      </main>
      <LandingFooter />
    </div>
  )
}
