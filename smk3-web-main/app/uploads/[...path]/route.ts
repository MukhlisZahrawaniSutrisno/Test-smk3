import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { relative, resolve, sep } from "path";
import { getAuthenticatedUser } from "@/lib/auth";
// import { lookup } from "mime-types";

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        if (!await getAuthenticatedUser()) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const resolvedParams = await params;

        // 1. Ambil path dari URL (misal: /uploads/foto.jpg -> ['foto.jpg'])
        const filePathArray = resolvedParams.path || [];
        const fileName = filePathArray.join("/");

        if (!fileName) {
            return new NextResponse("File not found", { status: 404 });
        }

        // 2. Tentukan lokasi asli file di server
        const uploadsRoot = resolve(process.cwd(), "public", "uploads");
        const fullPath = resolve(uploadsRoot, ...filePathArray);
        const relativePath = relative(uploadsRoot, fullPath);
        if (!relativePath || relativePath.startsWith(`..${sep}`) || relativePath === ".." || resolve(uploadsRoot, relativePath) !== fullPath) {
            return new NextResponse("Invalid file path", { status: 400 });
        }

        // 3. Cek apakah file ada
        try {
            await stat(fullPath);
        } catch {
            return new NextResponse("File not found on server", { status: 404 });
        }

        // 4. Baca file
        const fileBuffer = await readFile(fullPath);

        // 5. Tentukan Content-Type
        const ext = fileName.split('.').pop()?.toLowerCase();

        let contentType = 'application/octet-stream';
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'webp') contentType = 'image/webp';
        else if (ext === 'pdf') contentType = 'application/pdf';

        // 6. Return response dengan header yang benar
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, no-store"
            }
        });

    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
