import type { Gem } from "@/lib/gems-store"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"

interface GemCardProps {
  gem: Gem
}

export function GemCard({ gem }: GemCardProps) {
  return (
    <a
      href={gem.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={gem.previewImageUrl}
          alt={gem.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-3.5 w-3.5 text-foreground" weight="bold" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug text-foreground text-balance">
          {gem.title}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {gem.description}
        </p>
      </div>
    </a>
  )
}
