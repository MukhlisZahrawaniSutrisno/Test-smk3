'use server'

import { prisma } from '@/lib/prisma'
import { KRITERIA_SMK3_DATA, KriteriaItem } from '@/app/utils/kriteriaReferenceData'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

export interface KriteriaWithDoc extends KriteriaItem {
  dbId?: string
  docNumber: string
  docTitle?: string | null
  filePath?: string | null
  fileName?: string | null
  keterangan?: string | null
  updatedBy?: string | null
  updatedAt?: Date | null
}

export async function getKriteriaWithDocuments(): Promise<KriteriaWithDoc[]> {
  try {
    let dbDocs: any[] = []
    try {
      dbDocs = await (prisma as any).kriteriaReferenceDoc.findMany()
    } catch (e) {
      try {
        await (prisma as any).$executeRawUnsafe(`
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
        dbDocs = await (prisma as any).kriteriaReferenceDoc.findMany()
      } catch (err2) {
        console.warn('kriteriaReferenceDoc table create/read warning:', err2)
      }
    }

    const docMap = new Map<string, any>()
    dbDocs.forEach((doc) => {
      docMap.set(doc.kriteriaNo, doc)
    })

    const result: KriteriaWithDoc[] = KRITERIA_SMK3_DATA.map((item) => {
      const dbDoc = docMap.get(item.nomor)
      const docNum = (dbDoc?.docNumber && dbDoc.docNumber !== '-') ? dbDoc.docNumber : (item.defaultDocRef || '')
      return {
        ...item,
        dbId: dbDoc?.id,
        docNumber: docNum,
        docTitle: dbDoc?.docTitle || null,
        filePath: dbDoc?.filePath || null,
        fileName: dbDoc?.fileName || null,
        keterangan: dbDoc?.keterangan || null,
        updatedBy: dbDoc?.updatedBy || null,
        updatedAt: dbDoc?.updatedAt || null,
      }
    })

    return result
  } catch (error) {
    console.error('Error fetching kriteria documents:', error)
    return KRITERIA_SMK3_DATA.map((item) => ({
      ...item,
      docNumber: item.defaultDocRef || '',
    }))
  }
}

export async function saveKriteriaDocument(formData: FormData) {
  try {
    const kriteriaNo = formData.get('kriteriaNo') as string
    const docNumber = formData.get('docNumber') as string
    const docTitle = (formData.get('docTitle') as string) || null
    const keterangan = (formData.get('keterangan') as string) || null
    const updatedBy = (formData.get('updatedBy') as string) || 'Admin'
    const file = formData.get('file') as File | null

    if (!kriteriaNo || !docNumber) {
      return { success: false, error: 'Nomor kriteria dan nomor dokumen wajib diisi.' }
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

    const existing = await (prisma as any).kriteriaReferenceDoc.findUnique({
      where: { kriteriaNo },
    })

    if (existing) {
      await (prisma as any).kriteriaReferenceDoc.update({
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
      await (prisma as any).kriteriaReferenceDoc.create({
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
    return { success: true }
  } catch (error: any) {
    console.error('Error saving kriteria doc:', error)
    return { success: false, error: error.message || 'Gagal menyimpan dokumen referensi' }
  }
}

export async function deleteKriteriaDocFile(kriteriaNo: string) {
  try {
    const record = await (prisma as any).kriteriaReferenceDoc.findUnique({
      where: { kriteriaNo },
    })

    if (record?.filePath) {
      try {
        const fullPath = path.join(process.cwd(), 'public', record.filePath.replace(/^\//, ''))
        await unlink(fullPath)
      } catch (e) {
        console.warn('File might already be deleted on disk:', e)
      }

      await (prisma as any).kriteriaReferenceDoc.update({
        where: { kriteriaNo },
        data: {
          filePath: null,
          fileName: null,
        },
      })
    }

    revalidatePath('/admin/kriteria-referensi')
    revalidatePath('/pegawai/kriteria-referensi')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting kriteria doc file:', error)
    return { success: false, error: error.message }
  }
}
