'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Bell } from 'lucide-react'

interface AparNotifications {
  count: number
  notifications: Array<{
    id: string
    pesan: string
    apar: { kodeApar: string; lokasi: string; tanggalExpired: string }
  }>
}

export default function AparNotificationBadge() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<AparNotifications | null>(null)
  const [failed, setFailed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null

    async function refresh() {
      if (controller) return
      controller = new AbortController()
      try {
        const response = await fetch('/api/apar/notifications', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Notifikasi APAR tidak tersedia')
        const result: AparNotifications = await response.json()
        if (!Number.isInteger(result.count) || result.count < 0 || !Array.isArray(result.notifications)
          || result.notifications.some(item => !item || typeof item.id !== 'string'
            || typeof item.pesan !== 'string' || !item.apar
            || typeof item.apar.kodeApar !== 'string' || typeof item.apar.lokasi !== 'string'
            || typeof item.apar.tanggalExpired !== 'string')) {
          throw new Error('Data notifikasi APAR tidak valid')
        }
        if (active) {
          setData(result)
          setFailed(false)
        }
      } catch {
        if (active) setFailed(true)
      } finally {
        controller = null
      }
    }

    void refresh()
    const interval = window.setInterval(() => void refresh(), 60_000)
    return () => {
      active = false
      window.clearInterval(interval)
      controller?.abort()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    function closeOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const label = failed ? 'Notifikasi APAR, gagal diperbarui'
    : data ? `Notifikasi APAR, ${data.count} peringatan` : 'Notifikasi APAR, sedang memuat'

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        title="Notifikasi APAR"
        className="relative flex flex-col items-center rounded-lg px-2 py-1 text-red-100 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <Bell size={20} aria-hidden="true" />
        <span className="mt-0.5 text-[9px] font-bold leading-none">APAR</span>
        {failed ? (
          <span aria-hidden="true" className="absolute -right-1 -top-1 rounded-full border border-white bg-red-600 px-1.5 text-[10px] font-bold text-white">!</span>
        ) : data && data.count > 0 ? (
          <span aria-hidden="true" className="absolute -right-1 -top-1 min-w-4 rounded-full border border-white bg-red-600 px-1 text-center text-[10px] font-bold text-white">{data.count}</span>
        ) : null}
      </button>

      {open && (
        <div id={panelId} role="region" aria-label="Peringatan APAR" className="fixed left-4 right-4 top-[4.5rem] z-50 overflow-hidden rounded-xl border border-slate-100 bg-white text-sm text-slate-800 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-xs font-bold">Notifikasi APAR</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Peringatan masa berlaku APAR</p>
          </div>
          <div className="max-h-[min(24rem,60vh)] overflow-y-auto" aria-live="polite">
            {failed && (
              <p role="alert" className="bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                Gagal memuat notifikasi APAR. Akan dicoba kembali secara otomatis.
                {data && ' Data di bawah berasal dari pembaruan sebelumnya.'}
              </p>
            )}
            {!data && !failed && <p className="px-4 py-5 text-xs text-slate-500 dark:text-slate-400">Memuat notifikasi APAR...</p>}
            {data && data.notifications.length > 0 && (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.notifications.map(notification => {
                  const expiry = new Date(notification.apar.tanggalExpired)
                  const expiryLabel = Number.isNaN(expiry.getTime()) ? notification.apar.tanggalExpired
                    : expiry.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
                  return (
                    <li key={notification.id} className="space-y-1 break-words px-4 py-3">
                      <p className="text-xs font-bold">{notification.apar.kodeApar}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Lokasi: {notification.apar.lokasi}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal kedaluwarsa: {expiryLabel}</p>
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">{notification.pesan}</p>
                    </li>
                  )
                })}
              </ul>
            )}
            {data && !failed && data.notifications.length === 0 && (
              <p className="px-4 py-5 text-xs text-slate-500 dark:text-slate-400">
                {data.count === 0 ? 'Tidak ada peringatan APAR.' : 'Detail peringatan APAR belum tersedia.'}
              </p>
            )}
          </div>
          {data && data.count > data.notifications.length && (
            <p className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Menampilkan {data.notifications.length} dari {data.count} peringatan.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
