(function (root) {
  'use strict';

  function jakartaDate(now) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Jakarta',
    }).formatToParts(now);
    return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
  }

  function getReminders(activities, now = new Date()) {
    const today = Date.parse(`${jakartaDate(now)}T00:00:00Z`);
    return activities.flatMap(activity => {
      if (!['upcoming', 'rescheduled'].includes(activity.status)) return [];
      const eventDate = activity.status === 'rescheduled' && activity.rescheduledDate
        ? activity.rescheduledDate : activity.plannedDate;
      if (typeof eventDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return [];
      const time = Date.parse(`${eventDate}T00:00:00Z`);
      if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== eventDate) return [];
      const daysBefore = Math.round((time - today) / 86400000);
      if (daysBefore < 0 || daysBefore > 7) return [];
      const stage = daysBefore <= 1 ? 1 : daysBefore <= 3 ? 3 : daysBefore <= 5 ? 5 : 7;
      return [{ activity, eventDate, daysBefore, stage }];
    }).sort((a, b) => a.daysBefore - b.daysBefore || a.activity.name.localeCompare(b.activity.name, 'id-ID'));
  }

  function mount({ getActivities, onOpen }) {
    const region = document.getElementById('activityReminders');
    const list = document.getElementById('reminderList');
    const summary = document.getElementById('reminderSummary');
    const bell = document.getElementById('reminderBell');
    const count = document.getElementById('reminderCount');
    const panel = document.getElementById('reminderPanel');
    let signature = '';

    function setOpen(open, restoreFocus = false) {
      if (open) render();
      panel.hidden = !open;
      bell.setAttribute('aria-expanded', String(open));
      if (restoreFocus) bell.focus();
    }

    function render() {
      const reminders = getReminders(getActivities());
      region.dataset.urgent = String(reminders.some(item => item.daysBefore <= 1));
      count.textContent = reminders.length > 99 ? '99+' : String(reminders.length);
      count.hidden = reminders.length === 0;
      bell.setAttribute('aria-label', reminders.length ? `Notifikasi kegiatan, ${reminders.length} pengingat` : 'Notifikasi kegiatan, tidak ada pengingat');
      const text = reminders.length
        ? `${reminders.length} kegiatan perlu disiapkan dalam 7 hari ke depan, termasuk hari ini.`
        : 'Tidak ada kegiatan yang perlu diingatkan dalam 7 hari ke depan.';
      if (summary.textContent !== text) summary.textContent = text;
      const nextSignature = JSON.stringify(reminders.map(item => [
        item.activity.id, item.activity.name, item.activity.owner, item.eventDate, item.daysBefore, item.stage,
      ]));
      if (nextSignature !== signature) {
        signature = nextSignature;
        list.replaceChildren(...reminders.map(item => {
          const row = document.createElement('li');
          row.dataset.stage = String(item.stage);
          const badge = document.createElement('span');
          badge.className = 'reminder-countdown';
          badge.textContent = item.daysBefore === 0 ? 'Hari ini' : `H-${item.daysBefore}`;
          const details = document.createElement('div');
          details.className = 'reminder-details';
          const title = document.createElement('strong');
          title.textContent = item.activity.name;
          const description = document.createElement('span');
          const date = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
          }).format(new Date(`${item.eventDate}T00:00:00Z`));
          description.textContent = `${date} · ${item.activity.owner}`;
          details.append(title, description);
          const open = document.createElement('button');
          open.type = 'button';
          open.className = 'button small';
          open.textContent = 'Lihat kegiatan';
          open.setAttribute('aria-label', `Lihat kegiatan ${item.activity.name}`);
          open.onclick = () => { setOpen(false); onOpen(item.activity.id); };
          row.append(badge, details, open);
          return row;
        }));
      }
    }

    bell.onclick = () => setOpen(panel.hidden);
    document.getElementById('closeReminders').onclick = () => setOpen(false, true);
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !region.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    document.addEventListener('focusin', event => {
      if (!panel.hidden && !region.contains(event.target)) setOpen(false);
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    window.setInterval(render, 60000);
    return { render };
  }

  const api = { getReminders, mount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Smk3lReminders = api;
})(typeof window === 'undefined' ? globalThis : window);
