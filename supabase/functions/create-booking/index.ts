import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const payload = await request.json()
    const required = ['parentName', 'phone', 'email', 'athleteAge', 'slotId']
    if (required.some((key) => !payload[key])) throw new Error('Please complete every required field.')

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    await admin.rpc('reserve_slot', { target_slot: payload.slotId })
    const { data: booking, error } = await admin.from('bookings').insert({
      slot_id: payload.slotId,
      parent_name: payload.parentName,
      phone: payload.phone,
      email: payload.email,
      athlete_age: payload.athleteAge,
      athlete_count: payload.athleteCount,
      notes: payload.notes,
    }).select('id').single()
    if (error) {
      await admin.rpc('release_slot', { target_slot: payload.slotId })
      throw error
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      const date = new Date(payload.slotStartsAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Chicago' })
      const html = `<h1>New CRM2 training request</h1><p><strong>${payload.parentName}</strong> requested ${date}.</p><p>Phone: ${payload.phone}<br>Email: ${payload.email}<br>Age/grade: ${payload.athleteAge}<br>Athletes: ${payload.athleteCount}</p><p>The $25 deposit is pending.</p>`
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM_EMAIL') ?? 'CRM2 Skillz & Drillz <bookings@yourdomain.com>',
          to: ['crm2skillzanddrillz@gmail.com'],
          subject: `New training request from ${payload.parentName}`,
          html,
        }),
      })
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM_EMAIL') ?? 'CRM2 Skillz & Drillz <bookings@yourdomain.com>',
          to: [payload.email],
          subject: 'CRM2 training request received',
          html: `<h1>Your training request is in.</h1><p>You selected ${date}. Pay the $25 non-refundable deposit through Venmo to reserve the spot. The remaining $25 is due on training day.</p>`,
        }),
      })
    }
    return Response.json({ id: booking.id }, { headers: cors })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Booking failed' }, { status: 400, headers: cors })
  }
})
