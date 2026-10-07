import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../supabase/functions/_shared/booking-emails.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
const email = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const booking = {
  id: 'test-booking', parent_name: '<script>Test</script>', phone: '555-0100',
  email: 'customer@example.com', athlete_age: 'Grade 7', athlete_count: 2,
  notes: 'Goals: <b>passing</b>', starts_at: '2026-10-12T22:00:00Z',
}
const config = { apiKey: 'test-only', from: 'CRM2 <bookings@example.com>' }
assert.throws(() => email.emailConfig(() => undefined), /temporarily unavailable/)
assert.throws(() => email.emailConfig((key) => key === 'RESEND_API_KEY' ? 'test-only' : 'bookings@yourdomain.com'), /temporarily unavailable/)
assert.deepEqual(email.emailConfig((key) => key === 'RESEND_API_KEY' ? config.apiKey : config.from), config)

const requests = []
const result = await email.sendBookingEmails(booking, config, async (url, init) => {
  requests.push({ url, ...init, body: JSON.parse(init.body) })
  return Response.json({ id: `email-${requests.length}` })
})
assert.equal(result.owner.status, 'accepted')
assert.equal(result.customer.status, 'accepted')
assert.equal(requests.length, 2)
const owner = requests.find((request) => request.body.to[0] === email.ownerEmail)
const customer = requests.find((request) => request.body.to[0] === booking.email)
assert.equal(owner.body.reply_to, booking.email)
assert.equal(customer.body.reply_to, email.ownerEmail)
assert.match(owner.body.html, /Goals: &lt;b&gt;passing&lt;\/b&gt;/)
assert.doesNotMatch(owner.body.html, /<script>/)
assert.match(customer.body.html, /5:00 PM/)
assert.match(customer.body.html, /test-booking/)
assert.match(customer.body.html, /deposit is pending/)
assert.equal(customer.headers['Idempotency-Key'], 'booking-test-booking-customer')
assert.equal(owner.headers['Idempotency-Key'], 'booking-test-booking-owner')

const partial = await email.sendBookingEmails(booking, config, async (_url, init) =>
  JSON.parse(init.body).to[0] === email.ownerEmail
    ? Response.json({ message: 'domain not verified' }, { status: 403 })
    : Response.json({ id: 'customer-accepted' }))
assert.equal(partial.owner.status, 'failed')
assert.equal(partial.customer.status, 'accepted')
const unavailable = await email.sendBookingEmails(booking, config, async () => { throw new Error('timeout') })
assert.equal(unavailable.owner.status, 'failed')
assert.equal(unavailable.customer.status, 'failed')
const invalid = await email.sendBookingEmails(booking, config, async () => Response.json({}))
assert.equal(invalid.owner.status, 'failed')
assert.equal(invalid.customer.status, 'failed')

// Execute the real Edge Function against a mock database/provider. No real emails or bookings.
const createSource = await readFile(new URL('../supabase/functions/create-booking/index.ts', import.meta.url), 'utf8')
const createCompiled = ts.transpileModule(createSource.replace(/^import .*\n/gm, ''), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
const payload = { parentName: 'Test Parent', phone: '555-0100', email: booking.email, athleteAge: 'Grade 7', athleteCount: 2, notes: '', slotId: 'slot-test', slotStartsAt: '2030-01-01T00:00:00Z' }
async function runHandler({ configured = true, reserveError = null, mailStatus = 'accepted' } = {}) {
  let handler
  const calls = []
  const admin = {
    rpc: async (name, args) => { if (name === 'reserve_slot') assert.deepEqual(args, { target_slot: payload.slotId, athletes: payload.athleteCount }); calls.push(name); return { error: reserveError } },
    from(table) {
      const query = {
        select() { return query }, eq() { return query }, gt() { return query },
        insert(row) { calls.push({ insert: row }); return query },
        update(row) { calls.push({ update: row }); return query },
        single: async () => table === 'training_slots'
          ? { data: { starts_at: booking.starts_at }, error: null }
          : { data: booking, error: null },
        then(resolve) { resolve({ error: null }) },
      }
      return query
    },
  }
  const Deno = { serve: (fn) => { handler = fn }, env: { get: (name) => configured ? (name === 'RESEND_FROM_EMAIL' ? config.from : 'test-only') : undefined } }
  new Function('Deno', 'createClient', 'emailConfig', 'sendBookingEmails', createCompiled)(Deno, () => admin, email.emailConfig, async (saved) => {
    assert.equal(saved.starts_at, booking.starts_at, 'Email dates must come from database, not customer payload')
    return { owner: { status: mailStatus }, customer: { status: mailStatus } }
  })
  const response = await handler(new Request('https://example.com', { method: 'POST', body: JSON.stringify(payload) }))
  return { response, body: await response.json(), calls }
}
const missing = await runHandler({ configured: false })
assert.equal(missing.response.status, 400)
assert.equal(missing.calls.length, 0, 'Missing email configuration must never reserve a slot')
const full = await runHandler({ reserveError: { message: 'full' } })
assert.equal(full.response.status, 400)
assert.deepEqual(full.calls, ['reserve_slot'])
const saved = await runHandler({ mailStatus: 'failed' })
assert.equal(saved.response.status, 200, 'Failed email must not turn a saved booking into a retryable form failure')
assert.equal(saved.body.id, booking.id)
assert.equal(saved.body.notifications.owner.status, 'failed')
assert.ok(saved.calls.some((call) => call.update?.email_notifications))
console.log('Booking email and handler tests passed: recipients, escaping, Central time, provider errors, reservation failure, missing setup, and saved-booking status.')
