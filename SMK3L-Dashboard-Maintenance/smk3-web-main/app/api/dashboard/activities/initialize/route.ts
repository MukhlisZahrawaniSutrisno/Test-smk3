import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activityAccess, activityResponse, parseDashboardActivity, readActivityBody, serializeDashboardActivity } from '@/lib/dashboard-activity';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
    try {
        const access = await activityAccess(request, true);
        if (access instanceof NextResponse)
            return access;
        const body = await readActivityBody(request);
        if (!Array.isArray(body?.activities) || body.activities.length > 500)
            return activityResponse({ error: 'Daftar agenda tidak valid atau melebihi 500 kegiatan.' }, 400);
        const activities = body.activities.map(parseDashboardActivity);
        if (activities.some((item: ReturnType<typeof parseDashboardActivity>) => !item) || new Set(activities.map((item: ReturnType<typeof parseDashboardActivity>) => item?.id)).size !== activities.length)
            return activityResponse({ error: 'Data agenda tidak valid atau ID kegiatan duplikat.' }, 400);
        const rows = await prisma.$transaction(async (tx) => {
            // Transaction-scoped lock serializes first imports, including simultaneous users.
            await tx.$executeRaw `SELECT pg_advisory_xact_lock(7363, 2026)`;
            if (await tx.dashboardActivity.count() > 0)
                return null;
            if (activities.length)
                await tx.dashboardActivity.createMany({ data: activities.map((item: NonNullable<ReturnType<typeof parseDashboardActivity>>) => ({ ...item, createdById: access.id })) });
            return tx.dashboardActivity.findMany({ where: { deletedAt: null }, orderBy: [{ plannedDate: 'asc' }, { id: 'asc' }] });
        });
        return rows ? activityResponse({ activities: rows.map(serializeDashboardActivity), initialized: rows.length > 0 }) : activityResponse({ error: 'Agenda bersama sudah diinisialisasi. Muat ulang sebelum menyimpan.' }, 409);
    }
    catch {
        return activityResponse({ error: 'Agenda awal belum dapat disimpan ke database.' }, 503);
    }
}
