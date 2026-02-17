import { getAll } from "@/lib/gems-store"
import { InfiniteCarousel } from "@/components/landing/infinite-carousel"

/* 
 * ----------------------------------------------------------------------------
 *  LANDING PAGE (Dynamic)
 *  - Fetches gems from the persistent store (JSON)
 *  - Renders the Infinite 3D Carousel
 * ----------------------------------------------------------------------------
 */
export const dynamic = "force-dynamic"

export default function Home() {
  const gems = getAll()

  // Filter gems that are published
  const publishedGems = gems.filter((gem) => gem.published)

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#101619]">
      {/* 
         The carousel handles the entire viewport 
         and provides drag interactions
      */}
      <InfiniteCarousel gems={publishedGems} />
    </main>
  )
}
