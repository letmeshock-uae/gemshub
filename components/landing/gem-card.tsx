"use client"

import Link from "next/link"
import { type Gem } from "@/lib/gems-store"
import { getIconComponent } from "@/lib/icons"

interface GemCardProps {
  gem: Gem
}

export function GemCard({ gem }: GemCardProps) {
  const Icon = getIconComponent(gem.icon || "star")

  return (
    <Link
      href={gem.url}
      target="_blank"
      className="group relative block h-[640px] w-[480px] overflow-hidden rounded-[16px] border border-white/20 bg-muted transition-transform hover:-translate-y-1"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={gem.previewImageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101619] via-[#101619]/40 to-transparent opacity-90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        {/* Top Left Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#EAFF01] text-[#101619] shadow-sm">
          <Icon weight="bold" className="h-4 w-4" />
        </div>

        {/* Bottom Text */}
        <div className="flex flex-col gap-2">
          <h3 className="font-sans text-[16px] font-bold leading-[20px] text-white">
            {gem.title}
          </h3>
          <p className="font-sans text-[14px] leading-[18px] text-[#8080A0] line-clamp-3">
            {gem.description}
          </p>
        </div>
      </div>
    </Link>
  )
}
