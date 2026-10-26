'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { Role } from "@prisma/client"
import { requireRole } from "@/lib/auth"

export async function createLaporanKecelakaan(formData: FormData) {
  try {
    const currentUser = await requireRole([Role.PEGAWAI, Role.ADMIN, Role.AUDITOR])
    const judul = formData.get('judul') as string
    const lokasi = formData.get('lokasi') as string
    const kronologi = formData.get('kronologi') as string
    const korban = formData.get('korban') as string
    const waktuString = formData.get('waktuKejadian') as string
    const foto = formData.get('foto') as File | null
    const fotoOriginal = formData.get('fotoOriginal') as File | null

    if (!judul || !waktuString) {
      return { success: false, message: "Data wajib diisi!" }
    }

    const uploadDir = join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    let stampedUrl: string | null = null
    if (foto && foto.size > 0) {
      const bytes = await foto.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `KECELAKAAN_STAMPED_${Date.now()}_${foto.name.replace(/\s/g, '_')}`
      await writeFile(join(uploadDir, fileName), buffer)
      stampedUrl = `/uploads/${fileName}`
    }

    let originalUrl: string | null = null
    if (fotoOriginal && fotoOriginal.size > 0) {
      const bytes = await fotoOriginal.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `KECELAKAAN_ORIGINAL_${Date.now()}_${fotoOriginal.name.replace(/\s/g, '_')}`
      await writeFile(join(uploadDir, fileName), buffer)
      originalUrl = `/uploads/${fileName}`
    }

    let fotoUrl: string | null = null
    if (stampedUrl && originalUrl) {
      fotoUrl = JSON.stringify({ stamped: stampedUrl, original: originalUrl })
    } else {
      fotoUrl = stampedUrl || originalUrl || null
    }

    await prisma.laporanKecelakaan.create({
      data: {
        judul,
        lokasi,
        kronologi,
        korban,
        fotoBukti: fotoUrl,
        waktuKejadian: new Date(waktuString),
        pelaporId: currentUser.id,
      }
    })

    revalidatePath('/pegawai/kecelakaan')
    return { success: true, message: "Laporan insiden berhasil dikirim" }

  } catch (error) {
    console.error("Gagal lapor insiden:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal di server"
    }
  }
}

export async function deleteLaporanKecelakaan(id: string) {
  try {
    await requireRole([Role.ADMIN])
    await prisma.laporanKecelakaan.delete({
      where: { id }
    })
    revalidatePath('/admin/kecelakaan')
    return { success: true, message: "Laporan berhasil dihapus" }
  } catch (error) {
    console.error("Gagal hapus insiden:", error)
    return { success: false, message: "Gagal menghapus laporan" }
  }
}

export async function markIncidentAsDone(id: string) {
  try {
    await requireRole([Role.ADMIN])
    await prisma.laporanKecelakaan.update({
      where: { id },
      data: { status: "CLOSED" }
    })
    revalidatePath('/admin/kecelakaan')
    return { success: true, message: "Insiden telah ditandai selesai" }
  } catch (error) {
    console.error("Gagal update status insiden:", error)
    return { success: false, message: "Gagal menandai insiden" }
  }
}
