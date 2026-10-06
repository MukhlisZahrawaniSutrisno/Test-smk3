import nodemailer from 'nodemailer'
import { connect, type Socket } from 'node:net'

export async function sendAparEmail(message: { to: string; subject: string; text: string }): Promise<void> {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASSWORD
  const from = process.env.SMTP_FROM?.trim()
  const port = Number(process.env.SMTP_PORT || '587')
  if (!host || !user || !pass || !from || !message.to.trim() || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Konfigurasi SMTP atau penerima email APAR belum lengkap')
  }
  let socket: Socket | undefined
  const transport = nodemailer.createTransport({
    host, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user, pass }, connectionTimeout: 10_000,
    greetingTimeout: 10_000, socketTimeout: 15_000, dnsTimeout: 10_000,
    getSocket(_options, callback) {
      socket = connect({ host, port })
      const fail = (error: Error) => callback(error, {})
      socket.once('error', fail)
      socket.once('connect', () => {
        socket!.removeListener('error', fail)
        // Nodemailer applies TLS/STARTTLS over this socket; keep certificate validation enabled.
        callback(null, { connection: socket })
      })
    },
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const result = await Promise.race([
      transport.sendMail({ from, ...message }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          socket?.destroy()
          reject(new Error('Pengiriman email APAR timeout'))
        }, 20_000)
      }),
    ])
    if (!result.accepted.length || result.rejected.length) {
      throw new Error('Penerima email APAR ditolak oleh SMTP')
    }
  } finally {
    clearTimeout(timer)
    socket?.destroy()
    transport.close()
  }
}
