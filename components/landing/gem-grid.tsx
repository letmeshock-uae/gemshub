"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import type { Gem } from "@/lib/gems-store"
import { GemCard } from "@/components/landing/gem-card"
import { SearchBar } from "@/components/landing/search-bar"
import { MagnifyingGlass } from "@phosphor-icons/react"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GemGrid() {
  const { data: allGems, isLoading } = useSWR<Gem[]>("/api/gems", fetcher, {
    refreshInterval: 5000,
  })
  const [query, setQuery] = useState("")

  const gems = useMemo(() => {
    if (!allGems) return []
    return allGems.filter((g) => g.published)
  }, [allGems])

  const filtered = useMemo(() => {
    if (!query.trim()) return gems
    const lower = query.toLowerCase()
    return gems.filter(
      (g) =>
        g.title.toLowerCase().includes(lower) ||
        g.description.toLowerCase().includes(lower)
    )
  }, [gems, query])

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10">
        <Skeleton className="mb-8 h-11 w-full rounded-md" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <SearchBar value={query} onChange={setQuery} />

      {gems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MagnifyingGlass className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">
            No gems published yet.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back later for new additions.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MagnifyingGlass className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">
            No matches found.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {"Try adjusting your search terms."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((gem) => (
            <GemCard key={gem.id} gem={gem} />
          ))}
        </div>
      )}
    </section>
  )
}
