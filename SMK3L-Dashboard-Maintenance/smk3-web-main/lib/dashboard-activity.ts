import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromToken, SESSION_COOKIE } from './auth';
const statuses = ['upcoming', 'completed', 'missed', 'rescheduled'];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
export const activityIdValid = (value: unknown): value is string => typeof value === 'string' && /^[\w-]{1,80}$/.test(value);
export const activityVersionValid = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) > 0 && (value as number) < 2147483647;
function date(value: unknown) {
    if (typeof value !== 'string' || !datePattern.test(value) || value < '2026-01-01')
        return null;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? parsed : null;
}
function text(value: unknown, min: number, max: number) {
    return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max ? value.trim() : null;
}
export function parseDashboardActivity(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    const item = value as Record<string, unknown>;
    const name = text(item.name, 3, 140), owner = text(item.owner, 3, 80), reference = text(item.reference, 0, 140);
    const category = item.category === undefined ? '' : text(item.category, 0, 80);
    const description = text(item.description === undefined ? item.category : item.description, 3, 600);
    const reason = item.reason === undefined ? '' : text(item.reason, 0, 2000);
    const plannedDate = date(item.plannedDate), plannedEndDate = date(item.plannedEndDate ?? item.plannedDate);
    if (!activityIdValid(item.id) || !name || !owner || reference === null ||
        category === null || !description || reason === null ||
        !statuses.includes(item.status as string) || !plannedDate ||
        !plannedEndDate || plannedEndDate < plannedDate)
        return null;
    let rescheduledDate: Date | null = null, rescheduledEndDate: Date | null = null;
    if (item.rescheduledDate !== undefined && item.rescheduledDate !== null && item.rescheduledDate !== '') {
        rescheduledDate = date(item.rescheduledDate);
        if (!rescheduledDate || rescheduledDate <= plannedDate)
            return null;
        rescheduledEndDate = item.rescheduledEndDate === undefined || item.rescheduledEndDate === null || item.rescheduledEndDate === ''
            ? new Date(rescheduledDate.getTime() + plannedEndDate.getTime() - plannedDate.getTime())
            : date(item.rescheduledEndDate);
        if (!rescheduledEndDate || rescheduledEndDate < rescheduledDate || rescheduledEndDate.getUTCFullYear() > 9999)
            return null;
    }
    else if (item.rescheduledEndDate !== undefined && item.rescheduledEndDate !== null && item.rescheduledEndDate !== '')
        return null;
    if (item.status === 'rescheduled' && (!rescheduledDate || reason.length < 8))
        return null;
    return { id: item.id, name, owner, reference, category, description, reason, status: item.status as string, plannedDate, plannedEndDate, rescheduledDate, rescheduledEndDate };
}
export function serializeDashboardActivity(item: NonNullable<ReturnType<typeof parseDashboardActivity>> & {
    version: number;
}) {
    return {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        owner: item.owner,
        reference: item.reference,
        reason: item.reason,
        status: item.status,
        plannedDate: item.plannedDate.toISOString().slice(0, 10),
        plannedEndDate: item.plannedEndDate.toISOString().slice(0, 10),
        rescheduledDate: item.rescheduledDate?.toISOString().slice(0, 10) || '',
        rescheduledEndDate: item.rescheduledEndDate?.toISOString().slice(0, 10) || '',
        version: item.version,
    };
}
export function activityResponse(body: unknown, status = 200) {
    return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function activityAccess(request: NextRequest, mutation = false) {
    const user = await getAuthenticatedUserFromToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!user)
        return activityResponse({ error: 'Silakan login untuk mengakses agenda bersama.' }, 401);
    if (mutation) {
        const origin = request.headers.get('origin');
        let invalidOrigin = request.headers.get('sec-fetch-site') === 'cross-site';
        if (origin) {
            try {
                invalidOrigin ||= new URL(origin).origin !== request.nextUrl.origin;
            }
            catch {
                invalidOrigin = true;
            }
        }
        if (invalidOrigin)
            return activityResponse({ error: 'Asal permintaan tidak diizinkan.' }, 403);
        if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json')
            return activityResponse({ error: 'Kirim data agenda dalam format JSON.' }, 400);
    }
    return user;
}
export async function readActivityBody(request: NextRequest) {
    try {
        return await request.json();
    }
    catch {
        return null;
    }
}
