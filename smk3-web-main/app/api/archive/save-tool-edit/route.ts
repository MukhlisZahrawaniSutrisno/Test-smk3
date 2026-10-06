import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const archiveId = formData.get('archiveId') as string | null
    const existingFilePath = formData.get('filePath') as string | null
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, message: "File PDF hasil editan tidak ditemukan!" },
        { status: 400 }
      )
    }

    const uploadDir = join(process.cwd(), 'public/uploads/archive')
    await mkdir(uploadDir, { recursive: true })

    // Cari dokumen yang ada di database jika archiveId atau existingFilePath diberikan
    let existingDoc = null
    if (archiveId) {
      existingDoc = await prisma.documentArchive.findUnique({
        where: { id: archiveId }
      })
    } else if (existingFilePath) {
      existingDoc = await prisma.documentArchive.findFirst({
        where: { filePath: existingFilePath }
      })
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    // Buat nama file baru dengan timestamp agar tidak terpengaruh cache browser
    const newFileName = `DOC_${Date.now()}_${cleanName}`
    const fullPhysicalPath = join(uploadDir, newFileName)
    
    const bytes = await file.arrayBuffer()
    await writeFile(fullPhysicalPath, Buffer.from(bytes))
    const newFilePath = `/uploads/archive/${newFileName}`

    // Hapus file lama jika ada dan berbeda dari file baru
    if (existingDoc?.filePath) {
      try {
        const oldPhysicalPath = join(process.cwd(), 'public', existingDoc.filePath)
        if (oldPhysicalPath !== fullPhysicalPath) {
          await unlink(oldPhysicalPath)
        }
      } catch (err) {
        console.log("File lama sudah tidak ada atau terhapus:", err)
      }
    }

    // Perbarui data di database
    let updatedDoc = null
    if (existingDoc) {
      updatedDoc = await prisma.documentArchive.update({
        where: { id: existingDoc.id },
        data: {
          filePath: newFilePath,
          digitalStatus: "Sudah Digital",
          updatedAt: new Date(),
        }
      })
    } else if (archiveId) {
      updatedDoc = await prisma.documentArchive.update({
        where: { id: archiveId },
        data: {
          filePath: newFilePath,
          digitalStatus: "Sudah Digital",
          updatedAt: new Date(),
        }
      })
    }

    // Revalidasi cache halaman arsip dan dashboard
    revalidatePath('/admin/archive')
    revalidatePath('/pegawai/archive')
    revalidatePath('/admin/dashboard')

    return NextResponse.json({
      success: true,
      message: "Perubahan berhasil disimpan langsung ke Dokumen Arsip!",
      filePath: newFilePath,
      data: updatedDoc,
    })
  } catch (error: any) {
    console.error("Save Tool Edit Error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menyimpan perubahan ke dokumen arsip" },
      { status: 500 }
    )
  }
}
