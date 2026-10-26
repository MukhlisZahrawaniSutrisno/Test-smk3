import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activityAccess, activityResponse, parseDashboardActivity, readActivityBody, serializeDashboardActivity } from '@/lib/dashboard-activity';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
    try {
        const access = await activityAccess(request);
        if (access instanceof NextResponse)
            return access;
        const [rows, count] = await Promise.all([
            prisma.dashboardActivity.findMany({ where: { deletedAt: null }, orderBy: [{ plannedDate: 'asc' }, { id: 'asc' }] }),
            prisma.dashboardActivity.count(),
        ]);
        return activityResponse({ activities: rows.map(serializeDashboardActivity), initialized: count > 0 });
    }
    catch {
        return activityResponse({ error: 'Agenda bersama belum dapat dimuat.' }, 503);
    }
}
export async function POST(request: NextRequest) {
    try {
        const access = await activityAccess(request, true);
        if (access instanceof NextResponse)
            return access;
        const activity = parseDashboardActivity(await readActivityBody(request));
        if (!activity)
            return activityResponse({ error: 'Data atau rentang tanggal kegiatan tidak valid.' }, 400);
        // The same lock as initialization prevents a normal create racing the first import.
        const row = await prisma.$transaction(async (tx) => {
            await tx.$executeRaw `SELECT pg_advisory_xact_lock(7363, 2026)`;
            return tx.dashboardActivity.create({ data: { ...activity, createdById: access.id } });
        });
        return activityResponse(serializeDashboardActivity(row), 201);
    }
    catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002')
            return activityResponse({ error: 'ID kegiatan sudah digunakan. Muat ulang agenda.' }, 409);
        return activityResponse({ error: 'Kegiatan belum dapat disimpan ke database.' }, 503);
    }
}
