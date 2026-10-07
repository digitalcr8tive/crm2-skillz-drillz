import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { emailConfig, sendBookingEmails } from '../_shared/booking-emails.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) throw new Error('Please log in again.')
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await admin.auth.getUser(token)
    if (!user) throw new Error('Please log in again.')
    const payload = await request.json()

    if (payload.action === 'cancel') {
      const { data: existing } = await admin.from('bookings').select('slot_id').eq('id', payload.bookingId).eq('user_id', user.id).single()
      if (!existing) throw new Error('Booking not found.')
      const { error } = await admin.from('bookings').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', payload.bookingId).eq('user_id', user.id)
      if (error) throw error
      await admin.rpc('release_slot', { target_slot: existing.slot_id })
      return Response.json({ ok: true }, { headers: cors })
    }

    if (payload.action === 'book') {
      const config = emailConfig((name) => Deno.env.get(name))
      const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
      if (!profile) throw new Error('Your member profile needs to be completed by CRM2.')
      const { data: slot, error: slotError } = await admin.from('training_slots').select('starts_at').eq('id', payload.slotId).eq('is_open', true).gt('starts_at', new Date().toISOString()).single()
      if (slotError || !slot) throw new Error('This training time is no longer available.')
      const { error: reserveError } = await admin.rpc('reserve_slot', { target_slot: payload.slotId })
      if (reserveError) throw new Error('This training time is no longer available.')
      const { data, error } = await admin.from('bookings').insert({
        slot_id: payload.slotId,
        user_id: user.id,
        parent_name: profile.parent_name,
        phone: profile.phone,
        email: user.email,
        athlete_age: profile.athlete_age,
      }).select('id,status,balance_due,parent_name,phone,email,athlete_age,athlete_count,notes').single()
      if (error) {
        await admin.rpc('release_slot', { target_slot: payload.slotId })
        throw error
      }
      const notifications = await sendBookingEmails({ ...data, starts_at: slot.starts_at }, config)
      const { error: logError } = await admin.from('bookings').update({ email_notifications: notifications }).eq('id', data.id)
      if (logError) console.error('Email status could not be saved', { bookingId: data.id })
      return Response.json({ notifications, id: data.id, startsAt: slot.starts_at, status: data.status, balanceDue: data.balance_due, paymentDueDate: slot.starts_at }, { headers: cors })
    }
    throw new Error('Unknown booking action.')
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Request failed' }, { status: 400, headers: cors })
  }
})
