import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import { getAuthenticatedUser } from '@/lib/auth'

async function ensureTableExists() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "KriteriaReferenceDoc" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "kriteriaNo" TEXT NOT NULL UNIQUE,
        "docNumber" TEXT NOT NULL,
        "docTitle" TEXT,
        "filePath" TEXT,
        "fileName" TEXT,
        "keterangan" TEXT,
        "updatedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "KriteriaReferenceDoc_kriteriaNo_key" ON "KriteriaReferenceDoc"("kriteriaNo");
    `)
  } catch (err) {
    console.warn('ensureTableExists check:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ success: false, error: 'Silakan login' }, { status: 401 })
    if (user.role !== Role.ADMIN) return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    await ensureTableExists()

    const formData = await req.formData()
    const kriteriaNo = formData.get('kriteriaNo') as string
    const docNumber = formData.get('docNumber') as string
    const docTitle = (formData.get('docTitle') as string) || null
    const keterangan = (formData.get('keterangan') as string) || null
    const updatedBy = user.name || user.email
    const file = formData.get('file') as File | null

    if (!kriteriaNo || !docNumber) {
      return NextResponse.json(
        { success: false, error: 'Nomor kriteria dan nomor dokumen wajib diisi.' },
        { status: 400 }
      )
    }

    let filePath: string | null = null
    let fileName: string | null = null

    if (file && file.size > 0 && typeof file.name === 'string') {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kriteria-docs')
      await mkdir(uploadDir, { recursive: true })

      const safeName = `${kriteriaNo.replace(/\./g, '_')}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const fullPath = path.join(uploadDir, safeName)

      await writeFile(fullPath, buffer)
      filePath = `/uploads/kriteria-docs/${safeName}`
      fileName = file.name
    }

    const existing = await prisma.kriteriaReferenceDoc.findUnique({
      where: { kriteriaNo },
    })

    let savedRecord
    if (existing) {
      savedRecord = await prisma.kriteriaReferenceDoc.update({
        where: { kriteriaNo },
        data: {
          docNumber,
          docTitle: docTitle ?? existing.docTitle,
          filePath: filePath ?? existing.filePath,
          fileName: fileName ?? existing.fileName,
          keterangan,
          updatedBy,
        },
      })
    } else {
      savedRecord = await prisma.kriteriaReferenceDoc.create({
        data: {
          kriteriaNo,
          docNumber,
          docTitle,
          filePath,
          fileName,
          keterangan,
          updatedBy,
        },
      })
    }

    revalidatePath('/admin/kriteria-referensi')
    revalidatePath('/pegawai/kriteria-referensi')

    return NextResponse.json({
      success: true,
      data: savedRecord,
      filePath: savedRecord.filePath,
      fileName: savedRecord.fileName,
    })
  } catch (error) {
    console.error('Error in /api/kriteria-referensi POST:', error)
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Gagal menyimpan dokumen referensi') },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ success: false, error: 'Silakan login' }, { status: 401 })
    if (user.role !== Role.ADMIN) return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    await ensureTableExists()

    const { kriteriaNo } = await req.json()
    if (!kriteriaNo) {
      return NextResponse.json(
        { success: false, error: 'kriteriaNo wajib diisi' },
        { status: 400 }
      )
    }

    const record = await prisma.kriteriaReferenceDoc.findUnique({
      where: { kriteriaNo },
    })

    if (record?.filePath) {
      try {
        const fullPath = path.join(process.cwd(), 'public', record.filePath.replace(/^\//, ''))
        await unlink(fullPath)
      } catch (e) {
        console.warn('File might already be deleted on disk:', e)
      }

      await prisma.kriteriaReferenceDoc.update({
        where: { kriteriaNo },
        data: {
          filePath: null,
          fileName: null,
        },
      })
    }

    revalidatePath('/admin/kriteria-referensi')
    revalidatePath('/pegawai/kriteria-referensi')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in /api/kriteria-referensi DELETE:', error)
    return NextResponse.json(
      { success: false, error: (error instanceof Error ? error.message : 'Gagal menghapus file referensi') },
      { status: 500 }
    )
  }
}
