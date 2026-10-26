(function (root) {
  'use strict';

  const DAY = 86400000;

  function dateTime(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const time = Date.parse(value + 'T00:00:00Z');
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
  }

  function validDate(value) {
    return Number.isFinite(dateTime(value)) && value >= '2026-01-01';
  }

  function addDays(date, days) {
    if (!validDate(date) || !Number.isInteger(days)) return null;
    const time = dateTime(date) + days * DAY;
    if (!Number.isFinite(time) || time < dateTime('2026-01-01') || time > dateTime('9999-12-31')) return null;
    return new Date(time).toISOString().slice(0, 10);
  }

  function inclusiveDays(start, end) {
    return validDate(start) && validDate(end) && end >= start ? (dateTime(end) - dateTime(start)) / DAY + 1 : 0;
  }

  function activityRange(activity) {
    if (!activity) return null;
    const originalStart = activity.plannedDate;
    const originalEnd = activity.plannedEndDate == null || activity.plannedEndDate === '' ? originalStart : activity.plannedEndDate;
    const originalDuration = inclusiveDays(originalStart, originalEnd);
    if (!originalDuration) return null;
    const rescheduled = activity.status === 'rescheduled' && activity.rescheduledDate;
    const start = rescheduled ? activity.rescheduledDate : originalStart;
    const end = rescheduled
      ? activity.rescheduledEndDate == null || activity.rescheduledEndDate === ''
        ? addDays(start, originalDuration - 1) : activity.rescheduledEndDate
      : originalEnd;
    const duration = inclusiveDays(start, end);
    return duration ? { start, end, duration } : null;
  }

  function overlaps(activity, from, to) {
    const range = activityRange(activity);
    return !!range && inclusiveDays(from, to) > 0 && range.start <= to && range.end >= from;
  }

  function layoutWeek(activities, weekStart, maxLanes = 2) {
    const segments = [];
    const overflow = Array(7).fill(0);
    // The first week of January 2026 starts in December 2025.
    const weekTime = dateTime(weekStart);
    if (!Number.isFinite(weekTime)) return { segments, overflow };
    const candidates = activities.map(activity => ({ activity, range: activityRange(activity) }))
      .filter(item => item.range && dateTime(item.range.start) <= weekTime + 6 * DAY && dateTime(item.range.end) >= weekTime)
      .sort((a, b) => a.range.start.localeCompare(b.range.start)
        || b.range.duration - a.range.duration
        || String(a.activity.id || '').localeCompare(String(b.activity.id || ''))
        || String(a.activity.name || '').localeCompare(String(b.activity.name || '')));
    const laneEnds = [];
    for (const { activity, range } of candidates) {
      const first = (dateTime(range.start) - weekTime) / DAY;
      const last = (dateTime(range.end) - weekTime) / DAY;
      const startColumn = Math.max(0, first);
      const endColumn = Math.min(6, last);
      let lane = laneEnds.findIndex(end => end < startColumn);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = endColumn;
      segments.push({ activity, startColumn, endColumn, lane, continuesBefore: first < 0, continuesAfter: last > 6 });
      if (lane >= maxLanes) for (let day = startColumn; day <= endColumn; day++) overflow[day]++;
    }
    return { segments, overflow };
  }

  const api = { validDate, addDays, inclusiveDays, activityRange, overlaps, layoutWeek };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Smk3lCalendarRange = api;
})(typeof window === 'undefined' ? globalThis : window);
