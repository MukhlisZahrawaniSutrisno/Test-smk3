'use server'

import { prisma } from '@/lib/prisma'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import { requireRole } from '@/lib/auth'

// 1. Ambil data evidence terunggah berdasarkan Area & Periode
export async function getEvidenceRecords(area: string, periode: number) {
  try {
    await requireRole([Role.ADMIN, Role.AUDITOR, Role.PEGAWAI])
    const records = await prisma.evidenceSmk3.findMany({
      where: {
        area: area,
        periode: periode,
      },
    })
    return { success: true, data: records }
  } catch (error) {
    console.error('Error getEvidenceRecords:', error)
    return { success: false, data: [] }
  }
}

// 2. Upload berkas evidence TTD
export async function uploadEvidence(formData: FormData) {
  try {
    const currentUser = await requireRole([Role.ADMIN])
    const file = formData.get('file') as File | null
    const itemCode = formData.get('itemCode') as string
    const area = formData.get('area') as string
    const periode = Number(formData.get('periode'))
    const keterangan = (formData.get('keterangan') as string) || ''

    if (!file || !itemCode || !area || !periode) {
      return { success: false, message: 'Data formulir tidak lengkap' }
    }

    // Ambil nama user pengunggah dari cookie
    const userName = currentUser.name || currentUser.email

    // Pastikan folder uploads/evidence ada
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'evidence')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Buat nama file unik: EVIDENCE-TAHUN-AREA-CODE-ORIGINAL
    const cleanItemCode = itemCode.replace(/[^a-zA-Z0-9.-]/g, '_')
    const cleanArea = area.replace(/[^a-zA-Z0-9.-]/g, '_')
    const timestamp = Date.now()
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const savedFileName = `EVIDENCE_${periode}_${cleanArea}_${cleanItemCode}_${timestamp}_${cleanFileName}`
    const filePath = join(uploadDir, savedFileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/evidence/${savedFileName}`

    // Upsert ke database EvidenceSmk3
    const record = await prisma.evidenceSmk3.upsert({
      where: {
        itemCode_area_periode: {
          itemCode,
          area,
          periode,
        },
      },
      update: {
        fileName: file.name,
        filePath: fileUrl,
        keterangan: keterangan,
        uploadedBy: userName,
        updatedAt: new Date(),
      },
      create: {
        itemCode,
        area,
        periode,
        fileName: file.name,
        filePath: fileUrl,
        keterangan: keterangan,
        uploadedBy: userName,
      },
    })

    revalidatePath('/admin/evidence')
    revalidatePath('/pegawai/evidence')

    return { success: true, message: 'Evidence berhasil diunggah', data: record }
  } catch (error) {
    console.error('Error uploadEvidence:', error)
    return { success: false, message: (error instanceof Error ? error.message : 'Gagal mengunggah berkas') }
  }
}

// 3. Hapus berkas evidence
export async function deleteEvidence(itemCode: string, area: string, periode: number) {
  try {
    await requireRole([Role.ADMIN])
    const existing = await prisma.evidenceSmk3.findUnique({
      where: {
        itemCode_area_periode: {
          itemCode,
          area,
          periode,
        },
      },
    })

    if (existing) {
      if (existing.filePath) {
        const fullPath = join(process.cwd(), 'public', existing.filePath)
        if (existsSync(fullPath)) {
          await unlink(fullPath).catch(() => {})
        }
      }

      await prisma.evidenceSmk3.delete({
        where: { id: existing.id },
      })
    }

    revalidatePath('/admin/evidence')
    revalidatePath('/pegawai/evidence')

    return { success: true, message: 'Evidence berhasil dihapus' }
  } catch (error) {
    console.error('Error deleteEvidence:', error)
    return { success: false, message: (error instanceof Error ? error.message : 'Gagal menghapus berkas') }
  }
}
