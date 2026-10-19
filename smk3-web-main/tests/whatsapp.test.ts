import assert from 'node:assert/strict'
import { test } from 'node:test'
import { whatsappService } from '../lib/services/whatsapp.service'

test('WhatsApp logs success only when the selected gateway acknowledges the message', async (t) => {
  for (const [key, value] of Object.entries({ WA_API_TOKEN: 'test-only', WA_PROVIDER: 'FONNTE', WA_GATEWAY_URL: 'https://gateway.example.test/send', WA_META_PHONE_NUMBER_ID: 'test-phone' })) {
    const previous = process.env[key]
    process.env[key] = value
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous })
  }
  let response = new Response('<html>Upstream login page</html>', { status: 200 })
  t.mock.method(globalThis, 'fetch', async () => response)
  const send = () => whatsappService.sendMessage({ recipientPhone: '081234567890', message: 'APAR expired' }, 1)
  assert.equal((await send()).success, false, 'HTML 200 is not a successful WhatsApp send')
  response = Response.json(null)
  assert.equal((await send()).success, false, 'null JSON must not create a success log')
  response = Response.json({ status: false, reason: 'Device disconnected' })
  assert.equal((await send()).success, false)
  response = Response.json({ status: true, id: 'message-1' })
  assert.equal((await send()).success, true)
  process.env.WA_PROVIDER = 'WABLAS'
  response = Response.json({ status: true, data: { messages: [{ id: 'message-2' }] } })
  assert.equal((await send()).success, true)
  process.env.WA_PROVIDER = 'META'
  response = Response.json({ messages: [{ id: 'wamid.test' }] })
  assert.equal((await send()).messageId, 'wamid.test')
  response = Response.json({ error: { message: 'No permission' } })
  assert.equal((await send()).success, false)
})
