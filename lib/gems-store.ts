import fs from "fs"
import path from "path"
import { syncToGithub } from "./github-sync"

export interface Gem {
  id: string
  title: string
  description: string
  url: string
  previewImageUrl: string
  published: boolean
  createdAt: string
  updatedAt: string
}

const DATA_FILE = path.join(process.cwd(), "data", "gems.json")

function load(): Gem[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return []
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8")
    return JSON.parse(raw) as Gem[]
  } catch (error) {
    console.error("Failed to load gems:", error)
    return []
  }
}



function save(gems: Gem[]): void {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(gems, null, 2), "utf-8")

    // Fire-and-forget sync to GitHub
    // We don't await this because 'save' is synchronous and we don't want to block the UI
    syncToGithub(gems).catch(err => console.error("Background sync failed:", err))

  } catch (error) {
    console.error("Failed to write gems data:", error)
    throw error
  }
}

export function getAll(): Gem[] {
  return load()
}

export function getPublished(): Gem[] {
  return load().filter((g) => g.published)
}

export function getById(id: string): Gem | undefined {
  return load().find((g) => g.id === id)
}

export function create(data: Omit<Gem, "id" | "createdAt" | "updatedAt">): Gem {
  const gems = load()
  const now = new Date().toISOString()
  const newGem: Gem = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  gems.push(newGem)
  save(gems)
  return newGem
}

export function update(id: string, data: Partial<Omit<Gem, "id" | "createdAt" | "updatedAt">>): Gem | null {
  const gems = load()
  const index = gems.findIndex((g) => g.id === id)
  if (index === -1) return null
  gems[index] = {
    ...gems[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  save(gems)
  return gems[index]
}

export function remove(id: string): boolean {
  const gems = load()
  const filtered = gems.filter((g) => g.id !== id)
  if (filtered.length === gems.length) return false
  save(filtered)
  return true
}

export function togglePublished(id: string): Gem | null {
  const gems = load()
  const index = gems.findIndex((g) => g.id === id)
  if (index === -1) return null
  gems[index].published = !gems[index].published
  gems[index].updatedAt = new Date().toISOString()
  save(gems)
  return gems[index]
}

export function toJson(): string {
  return JSON.stringify(load(), null, 2)
}
