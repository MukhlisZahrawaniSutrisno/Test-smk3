"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";

export async function saveSurat(data: Record<string, string>) {
    try {
        await requireRole([Role.ADMIN])
        const { nomor, perihal, type } = data;

        // Validasi basic
        if (typeof nomor !== "string" || !nomor || typeof perihal !== "string" || !perihal) {
            return { success: false, error: "Nomor dan Perihal wajib diisi" };
        }

        const newSurat = await prisma.arsipSurat.create({
            data: {
                nomor,
                perihal,
                type: typeof type === "string" && type ? type : "UNDANGAN",
                data: data, // Simpan semua raw data JSON juga untuk kemudahan
            },
        });

        revalidatePath("/admin/arsip");
        return { success: true, data: newSurat };
    } catch (error) {
        console.error("Error saving surat:", error);
        return { success: false, error: error instanceof Error ? error.message : "Gagal menyimpan surat" };
    }
}

export async function getSuratList() {
    try {
        await requireRole([Role.ADMIN])
        const list = await prisma.arsipSurat.findMany({
            orderBy: { createdAt: "desc" },
        });

        // Format tanggal untuk frontend jika perlu, atau kirim raw
        return { success: true, data: list };
    } catch (error) {
        console.error("Error fetching surat:", error);
        return { success: false, data: [] };
    }
}

export async function deleteSurat(id: string) {
    try {
        await requireRole([Role.ADMIN])
        await prisma.arsipSurat.delete({
            where: { id },
        });
        revalidatePath("/admin/arsip");
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus surat" };
    }
}

export async function getSuratById(id: string) {
    try {
        await requireRole([Role.ADMIN])
        const surat = await prisma.arsipSurat.findUnique({
            where: { id },
        });
        if (!surat) return { success: false, error: "Surat tidak ditemukan" };
        return { success: true, data: surat };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Gagal mengambil surat" };
    }
}
