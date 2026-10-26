(function (root) {
  'use strict';

  function createStore({ fetch: request = root.fetch.bind(root), onStatus = () => {}, validate = () => true } = {}) {
    let mode = 'loading';

    async function api(path = '', method = 'GET', data) {
      const response = await request('/api/dashboard/activities' + path, {
        method, cache: 'no-store', credentials: 'same-origin',
        headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: data === undefined ? undefined : JSON.stringify(data),
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(body.error || (response.status === 409 ? 'Agenda telah berubah. Muat ulang sebelum menyimpan kembali.' : 'Agenda belum dapat disimpan ke database. Coba kembali.'));
        error.status = response.status;
        throw error;
      }
      return body;
    }

    function checkList(body) {
      if (!Array.isArray(body.activities) || !body.activities.every(validate)) throw new Error('Data agenda dari server tidak valid.');
      return body.activities;
    }

    async function load(localActivities) {
      try {
        const body = await api();
        const activities = checkList(body);
        mode = body.initialized ? 'server' : 'empty';
        onStatus(mode === 'server' ? 'Agenda tersimpan di database bersama.' : 'Agenda lokal akan disimpan ke database saat penyimpanan pertama.');
        return mode === 'server' ? activities : localActivities;
      } catch (error) {
        mode = 'local';
        onStatus(error.status === 401 ? 'Agenda tersimpan di browser ini. Masuk untuk menyimpan ke database.' : 'Database agenda belum terhubung. Perubahan tersimpan di browser ini.');
        return localActivities;
      }
    }

    async function initialize(activities) {
      if (mode !== 'empty') return;
      const body = await api('/initialize', 'POST', { activities });
      const canonical = checkList(body);
      for (const item of activities) {
        const saved = canonical.find(row => row.id === item.id);
        if (saved) Object.assign(item, saved);
      }
      mode = 'server';
      onStatus('Agenda tersimpan di database bersama.');
    }

    async function save(activity, activities) {
      if (mode === 'loading') throw new Error('Agenda masih dimuat. Tunggu sebentar.');
      if (mode === 'local') return activity;
      await initialize(activities);
      const existing = activities.find(item => item.id === activity.id);
      const version = existing?.version;
      const saved = await api(version ? '/' + encodeURIComponent(activity.id) : '', version ? 'PATCH' : 'POST', { ...activity, ...(version ? { version } : {}) });
      if (!validate(saved) || !Number.isInteger(saved.version)) throw new Error('Konfirmasi penyimpanan dari server tidak valid. Muat ulang untuk memeriksa agenda.');
      onStatus('Agenda tersimpan di database bersama.');
      return saved;
    }

    async function remove(activity, activities) {
      if (mode === 'loading') throw new Error('Agenda masih dimuat. Tunggu sebentar.');
      if (mode === 'local') return;
      await initialize(activities);
      await api('/' + encodeURIComponent(activity.id), 'DELETE', { version: activity.version });
    }

    return { load, save, remove, get mode() { return mode; } };
  }

  const api = { createStore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Smk3lActivityStore = api;
})(typeof window === 'undefined' ? globalThis : window);
