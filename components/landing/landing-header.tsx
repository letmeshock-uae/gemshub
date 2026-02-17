import { DiamondsFour } from "@phosphor-icons/react/dist/ssr"

export function LandingHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <DiamondsFour className="h-5 w-5 text-primary-foreground" weight="fill" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Datum Gems Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Internal collection of Gemini Gems for the Datum team
          </p>
        </div>
      </div>
    </header>
  )
}
