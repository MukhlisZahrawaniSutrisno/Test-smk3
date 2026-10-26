import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activityAccess, activityIdValid, activityResponse, activityVersionValid, parseDashboardActivity, readActivityBody, serializeDashboardActivity } from '@/lib/dashboard-activity';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Context = {
    params: Promise<{
        id: string;
    }>;
};
const conflict = () => activityResponse({ error: 'Kegiatan telah diubah atau dihapus pengguna lain. Muat ulang agenda.' }, 409);
export async function PATCH(request: NextRequest, context: Context) {
    try {
        const access = await activityAccess(request, true);
        if (access instanceof NextResponse)
            return access;
        const { id } = await context.params, body = await readActivityBody(request);
        const activity = parseDashboardActivity(body);
        if (!activityIdValid(id) || !activity || activity.id !== id || !activityVersionValid(body?.version))
            return activityResponse({ error: 'Data, versi, atau rentang tanggal kegiatan tidak valid.' }, 400);
        const row = await prisma.$transaction(async (tx) => {
            const result = await tx.dashboardActivity.updateMany({ where: { id, version: body.version, deletedAt: null }, data: { ...activity, version: { increment: 1 } } });
            return result.count ? tx.dashboardActivity.findUnique({ where: { id } }) : null;
        });
        return row ? activityResponse(serializeDashboardActivity(row)) : conflict();
    }
    catch {
        return activityResponse({ error: 'Perubahan kegiatan belum dapat disimpan ke database.' }, 503);
    }
}
export async function DELETE(request: NextRequest, context: Context) {
    try {
        const access = await activityAccess(request, true);
        if (access instanceof NextResponse)
            return access;
        const { id } = await context.params, body = await readActivityBody(request);
        if (!activityIdValid(id) || !activityVersionValid(body?.version))
            return activityResponse({ error: 'ID atau versi kegiatan tidak valid.' }, 400);
        const result = await prisma.dashboardActivity.updateMany({ where: { id, version: body.version, deletedAt: null }, data: { deletedAt: new Date(), version: { increment: 1 } } });
        return result.count ? activityResponse({ deleted: true }) : conflict();
    }
    catch {
        return activityResponse({ error: 'Kegiatan belum dapat dihapus dari database.' }, 503);
    }
}
