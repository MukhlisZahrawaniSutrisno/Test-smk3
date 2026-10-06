import assert from 'node:assert/strict'
import { test } from 'node:test'
import nodemailer from 'nodemailer'
import net from 'node:net'
import { EventEmitter } from 'node:events'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import { sendAparEmail } from '../lib/services/email.service'

test('email requires SMTP configuration and records only SMTP acceptance', async (t) => {
  const config = { SMTP_HOST: 'smtp.example.test', SMTP_PORT: '587', SMTP_USER: 'k3@example.test', SMTP_PASSWORD: 'test-only', SMTP_FROM: 'k3@example.test' }
  for (const [key, value] of Object.entries(config)) {
    const previous = process.env[key]
    process.env[key] = value
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous })
  }
  const sent: unknown[] = []
  const create = t.mock.method(nodemailer, 'createTransport', (options: unknown) => {
    sent.push(options)
    return { sendMail: async (message: unknown) => { sent.push(message); return { accepted: ['safety@example.test'], rejected: [] } }, close() {} }
  })
  await sendAparEmail({ to: 'safety@example.test', subject: 'APAR expired', text: 'Replace it' })
  assert.equal(create.mock.callCount(), 1)
  assert.equal((sent[0] as { requireTLS: boolean }).requireTLS, true)
  assert.deepEqual(sent[1], { from: 'k3@example.test', to: 'safety@example.test', subject: 'APAR expired', text: 'Replace it' })
  create.mock.restore()
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async () => ({ accepted: [], rejected: ['safety@example.test'] }), close() {} }))
  await assert.rejects(sendAparEmail({ to: 'safety@example.test', subject: 'APAR expired', text: 'Replace it' }), /ditolak/)
  process.env.SMTP_HOST = ''
  await assert.rejects(sendAparEmail({ to: 'safety@example.test', subject: 'APAR expired', text: 'Replace it' }), /SMTP/)
})

test('SMTP deadline destroys the connection so retries cannot overlap a hanging send', async (t) => {
  const config = { SMTP_HOST: 'smtp.example.test', SMTP_PORT: '587', SMTP_USER: 'k3@example.test', SMTP_PASSWORD: 'test-only', SMTP_FROM: 'k3@example.test' }
  for (const [key, value] of Object.entries(config)) {
    const previous = process.env[key]
    process.env[key] = value
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous })
  }
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let destroyed = false
  const socket = Object.assign(new EventEmitter(), { destroy() { destroyed = true } })
  t.mock.method(net, 'connect', () => socket)
  t.mock.method(nodemailer, 'createTransport', (options: SMTPTransport.Options) => ({
    sendMail() {
      options.getSocket!(options, () => {})
      socket.emit('connect')
      return new Promise(() => {})
    },
    close() {},
  }))
  const pending = sendAparEmail({ to: 'safety@example.test', subject: 'APAR expired', text: 'Replace it' })
  const rejected = assert.rejects(pending, /timeout/)
  t.mock.timers.tick(20_000)
  await rejected
  assert.equal(destroyed, true)
})
