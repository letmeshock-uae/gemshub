import fs from "fs"
import path from "path"
import { syncToGithub } from "./github-sync"

export interface Gem {
  id: string
  title: string
  description: string
  url: string
  previewImageUrl: string
  icon?: string
  published: boolean
  createdAt: string
  updatedAt: string
}

const DATA_FILE = path.join(process.cwd(), "data", "gems.json")
const CACHE_FILE = "/tmp/gems.json"

function load(): Gem[] {
  // 1. Try Cache (most recent on this lambda)
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
    }
  } catch { }

  // 2. Try Build-time File
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
    }
  } catch { }

  return []
}

async function save(gems: Gem[]): Promise<void> {
  // 1. Try Persistence (Local) - Ignore failure on Vercel
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(gems, null, 2), "utf-8")
  } catch { }

  // 2. Write to Cache (Vercel)
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(gems, null, 2), "utf-8")
  } catch (e) {
    console.error("Cache write failed", e)
  }

  // 3. Sync to GitHub (Await for safety)
  try {
    await syncToGithub(gems)
  } catch (e) {
    console.error("GitHub Sync failed", e)
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

export async function create(data: Omit<Gem, "id" | "createdAt" | "updatedAt">): Promise<Gem> {
  const gems = load()
  const now = new Date().toISOString()
  const newGem: Gem = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  gems.push(newGem)
  await save(gems)
  return newGem
}

export async function update(id: string, data: Partial<Omit<Gem, "id" | "createdAt" | "updatedAt">>): Promise<Gem | null> {
  const gems = load()
  const index = gems.findIndex((g) => g.id === id)
  if (index === -1) return null
  gems[index] = {
    ...gems[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  await save(gems)
  return gems[index]
}

export async function remove(id: string): Promise<boolean> {
  const gems = load()
  const filtered = gems.filter((g) => g.id !== id)
  if (filtered.length === gems.length) return false
  await save(filtered)
  return true
}

export async function togglePublished(id: string): Promise<Gem | null> {
  const gems = load()
  const index = gems.findIndex((g) => g.id === id)
  if (index === -1) return null
  gems[index].published = !gems[index].published
  gems[index].updatedAt = new Date().toISOString()
  await save(gems)
  return gems[index]
}

export function toJson(): string {
  return JSON.stringify(load(), null, 2)
}
