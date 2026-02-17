"use client"

import { useEffect, useRef, useState } from "react"
import { type Gem } from "@/lib/gems-store"
import { GemCard } from "@/components/landing/gem-card"
import gsap from "gsap"
import "./infinite-carousel.css"

/* 
 * ----------------------------------------------------------------------------
 *  INFINITE GRADIENT CAROUSEL (React Adaption)
 *  Based on Clement Grellier (clementgrellier/gradientslider)
 *  https://github.com/clementgrellier/gradientslider
 *  
 *  - Infinite WebGL-canvas gradient background
 *  - 3D perspective transforms for cards
 *  - Momentum/drag physics handling
 *  - Color extraction from card images
 * ----------------------------------------------------------------------------
 */

// --- Configuration ---
const FRICTION = 0.96 // Smooth decay
const WHEEL_SENS = 0.2
const DRAG_SENS = 0.8
const MAX_ROTATION = 32 // Tilt
const MAX_DEPTH = 180 // Deep perspective
const MIN_SCALE = 0.86 // How small unselected cards get
const SCALE_RANGE = 0.14 // Scale diff
const CARD_W = 360
const GAP = 120 // Increased spacing for more air
const STEP = CARD_W + GAP

interface InfiniteCarouselProps {
    gems: Gem[]
}

// --- Utils ---
function mod(n: number, m: number) {
    return ((n % m) + m) % m
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0; const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }
    return [h * 360, s, l]
}

function hslToRgb(h: number, s: number, l: number) {
    h = ((h % 360) + 360) % 360; h /= 360
    if (s === 0) return [l * 255, l * 255, l * 255]
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1; if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }
    return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255]
}

export function InfiniteCarousel({ gems }: InfiniteCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cardsRef = useRef<(HTMLDivElement | null)[]>([])

    const [loading, setLoading] = useState(true)

    // -- Physics State (Mutable Refs) --
    const state = useRef({
        gems: gems,
        track: gems.length * STEP,
        scrollX: 0,
        vX: 0,
        drag: { active: false, x: 0, time: 0, delta: 0, hasMoved: false },
        activeIndex: -1,
        rafId: 0,
        bgRafId: 0,
        lastTime: 0,
        lastBgDraw: 0,
        bgFastUntil: 0,
        palette: [] as { c1: number[], c2: number[] }[],
        gradCurrent: { r1: 16, g1: 22, b1: 25, r2: 16, g2: 22, b2: 25 }, // Start dark (#101619)
        vwHalf: 0,
        isEntering: true,
    })

    // Recalc track whenever gems length changes
    useEffect(() => {
        state.current.gems = gems
        state.current.track = Math.max(window.innerWidth * 1.5, gems.length * STEP)
    }, [gems])


    // -- Color Extraction Logic --
    useEffect(() => {
        async function analyzeColors() {
            // Create hidden images to analyze
            const palette = await Promise.all(gems.map(async (gem, idx) => {
                try {
                    // Check if image is valid URL
                    if (!gem.previewImageUrl) throw new Error("No URL")

                    const img = new Image()
                    img.crossOrigin = "Anonymous"
                    img.src = gem.previewImageUrl

                    await new Promise((resolve, reject) => {
                        img.onload = resolve
                        img.onerror = reject
                    })

                    // Draw small to canvas
                    const cvs = document.createElement("canvas")
                    const ctx = cvs.getContext("2d")
                    if (!ctx) throw new Error("No context")

                    cvs.width = 40; cvs.height = 40
                    ctx.drawImage(img, 0, 0, 40, 40)
                    const data = ctx.getImageData(0, 0, 40, 40).data

                    // Simple average color (Dominant)
                    let r = 0, g = 0, b = 0, count = 0
                    for (let i = 0; i < data.length; i += 4) {
                        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
                    }
                    r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count)

                    // Secondary color: Invert or shift hue?
                    // Let's use HSL shift for nice gradient
                    const [h, s, l] = rgbToHsl(r, g, b)
                    const c1 = [r, g, b]

                    // Generate complimentary/analogous color
                    const c2 = hslToRgb((h + 40) % 360, s, Math.max(0.1, l - 0.2)) // Darker shift

                    return { c1, c2 }

                } catch (e) {
                    // Fallback based on ID hash or random
                    const h = (idx * 37) % 360
                    const c1 = hslToRgb(h, 0.6, 0.4)
                    const c2 = hslToRgb(h, 0.6, 0.2)
                    return { c1, c2 }
                }
            }))

            state.current.palette = palette
            setLoading(false)
            // Trigger entry animation
            setTimeout(() => { state.current.isEntering = false }, 1000)
        }

        if (gems.length > 0) analyzeColors()
    }, [gems])


    // -- Helper Functions --
    const computeTransform = (relX: number) => {
        // relX is distance from center. Normalise by Half Screen?
        // Original script divides by VW_HALF.
        const vwHalf = state.current.vwHalf || window.innerWidth / 2
        const norm = Math.max(-1, Math.min(1, relX / vwHalf)) // -1 to 1
        const absNorm = Math.abs(norm)

        const ry = -norm * MAX_ROTATION
        const tz = (1 - absNorm) * MAX_DEPTH - 100 // Pull active card forward, push others back
        const scale = MIN_SCALE + (1 - absNorm) * SCALE_RANGE

        // Blur
        const blur = absNorm * 4 // 0 at center, 4px at edges

        return {
            transform: `translate3d(${relX}px, -50%, ${tz}px) rotateY(${ry}deg) scale(${scale})`,
            zIndex: 100 + Math.round((1 - absNorm) * 100),
            filter: `blur(${blur}px) brightness(${0.8 + (1 - absNorm) * 0.4})` // Dim edges
        }
    }

    // -- Main Loop --
    useEffect(() => {
        if (loading) return

        const s = state.current
        const container = containerRef.current
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d", { alpha: false })

        if (!container || !canvas || !ctx) return

        // Init Logic
        const onResize = () => {
            s.vwHalf = window.innerWidth / 2
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            // Recalc track
            s.track = Math.max(window.innerWidth * 1.5, gems.length * STEP)
        }
        window.addEventListener("resize", onResize)
        onResize()

        // Animation Loop
        const loop = (t: number) => {
            const dt = s.lastTime ? (t - s.lastTime) / 1000 : 0
            s.lastTime = t

            // Physics: Scroll + Velocity
            s.scrollX = mod(s.scrollX + s.vX * dt * 60, s.track) // Scale velocity for consistent feel

            // Friction
            if (!s.drag.active) {
                s.vX *= Math.pow(FRICTION, dt * 60)
                if (Math.abs(s.vX) < 0.01) s.vX = 0
            }

            // Calculate Positions & Update DOM
            const halfTrack = s.track / 2
            let closestDist = Infinity
            let closestIdx = -1

            cardsRef.current.forEach((el, i) => {
                if (!el) return

                let cardX = i * STEP
                let relX = cardX - s.scrollX

                // Wrapping Logic: If far left, move to far right
                if (relX < -halfTrack) relX += s.track
                if (relX > halfTrack) relX -= s.track

                const { transform, zIndex, filter } = computeTransform(relX)

                // Direct DOM manipulation for perf
                el.style.transform = transform
                el.style.zIndex = zIndex.toString()
                el.style.filter = filter

                // Track closest
                const dist = Math.abs(relX)
                if (dist < closestDist) {
                    closestDist = dist
                    closestIdx = i
                }
            })

            // Transition Gradient
            if (closestIdx !== -1 && closestIdx !== s.activeIndex && s.palette[closestIdx]) {
                s.activeIndex = closestIdx
                const p = s.palette[closestIdx]

                // Use GSAP to animate state.gradCurrent
                gsap.to(s.gradCurrent, {
                    r1: p.c1[0], g1: p.c1[1], b1: p.c1[2],
                    r2: p.c2[0], g2: p.c2[1], b2: p.c2[2],
                    duration: 0.8,
                    ease: "power2.out"
                })
            }

            // Draw Background
            drawBg(t)

            s.rafId = requestAnimationFrame(loop)
        }

        const drawBg = (t: number) => {
            // Simple oscillating gradient
            const w = canvas.width
            const h = canvas.height

            // Base dark
            ctx.fillStyle = "#101619"
            ctx.fillRect(0, 0, w, h)

            const time = t * 0.0005

            // Center blobs
            const cx = w / 2
            const cy = h / 2
            const rx = w * 0.6
            const ry = h * 0.6

            // Blob 1
            const g1 = ctx.createRadialGradient(
                cx + Math.cos(time) * 100, cy + Math.sin(time * 0.8) * 50, 0,
                cx, cy, rx
            )
            const c1 = s.gradCurrent
            g1.addColorStop(0, `rgba(${c1.r1}, ${c1.g1}, ${c1.b1}, 0.6)`)
            g1.addColorStop(1, "rgba(16, 22, 25, 0)")

            ctx.fillStyle = g1
            ctx.fillRect(0, 0, w, h)

            // Blob 2
            const g2 = ctx.createRadialGradient(
                cx + Math.cos(-time * 1.2) * 150, cy + Math.sin(-time) * 80, 0,
                cx, cy, ry * 0.8
            )
            const c2 = s.gradCurrent
            // Use active secondary color or compliment
            g2.addColorStop(0, `rgba(${c2.r2}, ${c2.g2}, ${c2.b2}, 0.4)`)
            g2.addColorStop(1, "rgba(16, 22, 25, 0)")

            ctx.fillStyle = g2
            ctx.fillRect(0, 0, w, h)
        }

        // Start
        s.rafId = requestAnimationFrame(loop)

        return () => {
            window.removeEventListener("resize", onResize)
            cancelAnimationFrame(s.rafId)
        }
    }, [loading, gems]) // Re-init if gems change (should handle updates gracefully)


    // -- Interaction Handlers --
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const s = state.current

        const onWheel = (e: WheelEvent) => {
            e.preventDefault()
            const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            s.vX += d * WHEEL_SENS
        }

        // Drag Logic (Window Listeners to avoid capturing click)
        let startX = 0
        let lastDragTime = 0

        const onWindowMove = (e: PointerEvent) => {
            if (!s.drag.active) return

            const now = performance.now()
            const dx = e.clientX - s.drag.x

            s.drag.delta += Math.abs(dx)
            if (s.drag.delta > 5) {
                s.drag.hasMoved = true
                e.preventDefault() // Prevent selection
            }

            s.scrollX -= dx * DRAG_SENS

            const dt = now - lastDragTime
            if (dt > 0) {
                s.vX = -(dx / dt) * 15
            }

            s.drag.x = e.clientX
            lastDragTime = now
        }

        const onWindowUp = (e: PointerEvent) => {
            s.drag.active = false
            window.removeEventListener("pointermove", onWindowMove)
            window.removeEventListener("pointerup", onWindowUp)
            container.classList.remove("dragging")
        }

        const onDown = (e: PointerEvent) => {
            const target = e.target as HTMLElement

            // Ignore interactions on Admin Link (or any link outside cards)
            // This allows the Admin Link to be clicked properly.
            if (target.closest("a") && !target.closest(".carousel-card-wrapper")) {
                return
            }

            s.drag.active = true
            s.drag.x = e.clientX
            startX = e.clientX
            lastDragTime = performance.now()
            s.vX = 0
            s.drag.delta = 0
            s.drag.hasMoved = false

            container.classList.add("dragging")

            window.addEventListener("pointermove", onWindowMove)
            window.addEventListener("pointerup", onWindowUp)
        }

        container.addEventListener("wheel", onWheel, { passive: false })
        container.addEventListener("pointerdown", onDown)

        return () => {
            container.removeEventListener("wheel", onWheel)
            container.removeEventListener("pointerdown", onDown)
            window.removeEventListener("pointermove", onWindowMove)
            window.removeEventListener("pointerup", onWindowUp)
        }

    }, []) // Bind once

    // Wrapper Click Handler
    const handleWrapperClick = (e: React.MouseEvent) => {
        // If we dragged significantly, prevent the click
        if (state.current.drag.hasMoved) {
            e.preventDefault()
            e.stopPropagation()
        }
    }

    return (
        <div className="infinite-carousel-container" ref={containerRef}>
            {loading && (
                <div className="carousel-loader">
                    <div className="carousel-spinner" />
                </div>
            )}

            <canvas id="carousel-bg" ref={canvasRef} />

            <div className="carousel-cards">
                {gems.map((gem, i) => (
                    <div
                        className="carousel-card-wrapper"
                        key={gem.id}
                        ref={el => { cardsRef.current[i] = el }}
                        onClickCapture={handleWrapperClick}
                    >
                        {/* 
                GemCard handles its own layout. 
                Carousel wrapper provides 3D transform context.
              */}
                        <GemCard gem={gem} />
                    </div>
                ))}
            </div>

            {/* Overlay Header if user wants 'Title only' */}
            <div className="absolute top-8 left-0 w-full flex justify-center pointer-events-none z-50">
                <img
                    src="/logo.svg"
                    alt="Datum Gems Hub Logo"
                    width={259}
                    height={53}
                    className="h-[53px] w-auto opacity-90"
                />
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-16 left-0 w-full text-center pointer-events-none z-50 px-4">
                <p className="text-[10px] leading-[12px] text-white/60 font-sans max-w-[300px] mx-auto">
                    A shared library of Gemini Gems that help<br />
                    colleagues solve everyday work tasks quickly and consistently
                </p>
            </div>

            {/* Admin Link (Bottom Right) */}
            <div className="absolute bottom-8 right-8 z-50 pointer-events-auto">
                <a href="/admin" className="text-xs text-gray-500 hover:text-white transition-colors">
                    ADMIN PANEL
                </a>
            </div>
        </div>
    )
}
