"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "admin_session"
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

export async function login(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const password = formData.get("password") as string

  if (!password) {
    return { error: "Password is required." }
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "q9KKmsg8!"

  if (password !== adminPassword) {
    return { error: "Invalid password." }
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "valid", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
    path: "/",
  })
  redirect("/")
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  return session?.value === "valid"
}
