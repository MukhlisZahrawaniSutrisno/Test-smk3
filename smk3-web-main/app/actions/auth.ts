'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { hashPassword, verifyPassword } from "@/lib/password"
import { createSessionToken } from "@/lib/session-token"
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth"

export async function loginAction(formData: FormData) {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase()
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi!" }
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return { success: false, message: "Email atau password salah!" }
    }

    const secret = process.env.AUTH_SECRET
    if (!secret) throw new Error("AUTH_SECRET wajib diisi")
    const passwordCheck = await verifyPassword(password, user.password)
    if (!passwordCheck.valid) return { success: false, message: "Email atau password salah!" }
    if (passwordCheck.needsUpgrade) {
      await prisma.user.update({ where: { id: user.id }, data: { password: await hashPassword(password) } })
    }

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, createSessionToken(user.id, secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    })
    cookieStore.delete("user_role")
    cookieStore.delete("user_id")
    cookieStore.delete("user_name")

    let redirectPath = "/admin/dashboard"
    if (user.role === "PEGAWAI") redirectPath = "/pegawai/dashboard"
    else if (user.role === "AUDITOR") redirectPath = "/admin/dashboard"

    return { success: true, redirectPath }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Terjadi kesalahan di server saat login" }
  }
}

export async function logout() {
  const c = await cookies()
  c.delete(SESSION_COOKIE)
  c.delete("user_role")
  c.delete("user_id")
  c.delete("user_name")
  redirect("/login")
}
