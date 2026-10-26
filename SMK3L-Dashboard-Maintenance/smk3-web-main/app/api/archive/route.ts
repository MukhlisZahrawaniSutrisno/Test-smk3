import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir, unlink, stat } from "fs/promises"
import { join } from "path"
import type { Prisma } from "@prisma/client"
import { Role } from "@prisma/client"
import { getAuthenticatedUser } from "@/lib/auth"

async function isStoredArchiveFile(filePath: string) {
  if (!/^\/uploads\/archive\/[A-Za-z0-9._-]+$/.test(filePath)) return false
  try {
    return (await stat(join(process.cwd(), "public", filePath.slice(1)))).isFile()
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ success: false, message: "Silakan login" }, { status: 401 })
    if (user.role !== Role.ADMIN) return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 })
    const formData = await req.formData()
    const documentNumber = (formData.get('documentNumber') as string) || null
    const title = formData.get('title') as string
    const documentType = formData.get('documentType') as string
    const documentDateStr = formData.get('documentDate') as string
    const division = (formData.get('division') as string) || "General Support"
    const digitalStatus = (formData.get('digitalStatus') as string) || "Sudah Digital"
    const file = formData.get('file') as File | null
    const manualFilePath = (formData.get('manualFilePath') as string) || null

    if (!title || !documentType || !documentDateStr) {
      return NextResponse.json(
        { success: false, message: "Judul, jenis dokumen, dan tanggal wajib diisi!" },
        { status: 400 }
      )
    }

    if (manualFilePath && !await isStoredArchiveFile(manualFilePath)) {
      return NextResponse.json({ success: false, message: "Lokasi file arsip tidak valid" }, { status: 400 })
    }

    let filePath: string | null = manualFilePath

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileName = `DOC_${Date.now()}_${cleanOriginalName}`
      const uploadDir = join(process.cwd(), 'public/uploads/archive')

      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, fileName), buffer)
      filePath = `/uploads/archive/${fileName}`
    }

    const newDoc = await prisma.documentArchive.create({
      data: {
        documentNumber,
        title,
        documentType,
        documentDate: new Date(documentDateStr),
        division,
        digitalStatus: filePath ? "Sudah Digital" : digitalStatus,
        filePath,
      }
    })

    return NextResponse.json({
      success: true,
      message: "Dokumen arsip berhasil disimpan!",
      data: newDoc,
    })
  } catch (error) {
    console.error("API Archive Error:", error)
    return NextResponse.json(
      { success: false, message: (error instanceof Error ? error.message : "Terjadi kesalahan di server") },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ success: false, message: "Silakan login" }, { status: 401 })
    if (user.role !== Role.ADMIN) return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 })
    const formData = await req.formData()
    const id = formData.get('id') as string
    const documentNumber = (formData.get('documentNumber') as string) || null
    const title = formData.get('title') as string
    const documentType = formData.get('documentType') as string
    const documentDateStr = formData.get('documentDate') as string
    const division = (formData.get('division') as string) || "General Support"
    const digitalStatus = (formData.get('digitalStatus') as string) || "Sudah Digital"
    const file = formData.get('file') as File | null
    const manualFilePath = (formData.get('manualFilePath') as string) || null

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID dokumen tidak ditemukan!" },
        { status: 400 }
      )
    }

    if (!title || !documentType || !documentDateStr) {
      return NextResponse.json(
        { success: false, message: "Judul, jenis dokumen, dan tanggal wajib diisi!" },
        { status: 400 }
      )
    }

    const existingDoc = await prisma.documentArchive.findUnique({
      where: { id }
    })

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, message: "Dokumen tidak ditemukan di database!" },
        { status: 404 }
      )
    }

    if (manualFilePath && !await isStoredArchiveFile(manualFilePath)) {
      return NextResponse.json({ success: false, message: "Lokasi file arsip tidak valid" }, { status: 400 })
    }

    const updateData: Prisma.DocumentArchiveUpdateInput = {
      documentNumber,
      title,
      documentType,
      documentDate: new Date(documentDateStr),
      division,
      digitalStatus,
    }

    if (manualFilePath && manualFilePath !== existingDoc.filePath) {
      updateData.filePath = manualFilePath
      updateData.digitalStatus = "Sudah Digital"
    }

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const fileName = `DOC_${Date.now()}_${cleanOriginalName}`
      const uploadDir = join(process.cwd(), 'public/uploads/archive')

      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, fileName), buffer)
      updateData.filePath = `/uploads/archive/${fileName}`
      updateData.digitalStatus = "Sudah Digital"

      // Hapus file fisik lama jika ada
      if (existingDoc.filePath && existingDoc.filePath !== manualFilePath) {
        try {
          const oldFilePath = join(process.cwd(), 'public', existingDoc.filePath)
          await unlink(oldFilePath)
        } catch (e) {
          console.log("File lama sudah tidak ada:", e)
        }
      }
    }

    const updatedDoc = await prisma.documentArchive.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: "Dokumen arsip berhasil diperbarui!",
      data: updatedDoc,
    })
  } catch (error) {
    console.error("API Archive Update Error:", error)
    return NextResponse.json(
      { success: false, message: (error instanceof Error ? error.message : "Terjadi kesalahan saat update dokumen") },
      { status: 500 }
    )
  }
}
