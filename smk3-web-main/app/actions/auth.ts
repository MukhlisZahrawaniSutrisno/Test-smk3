'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim()
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi!" }
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.password !== password) {
      return { success: false, message: "Email atau password salah!" }
    }

    const cookieStore = await cookies()
    cookieStore.set("user_role", user.role)
    cookieStore.set("user_id", user.id.toString())
    cookieStore.set("user_name", user.name || "User")

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
  c.delete("user_role")
  c.delete("user_id")
  c.delete("user_name")
  redirect("/login")
}