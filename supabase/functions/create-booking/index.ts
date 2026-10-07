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
    const payload = await request.json()
    const required = ['parentName', 'phone', 'email', 'athleteAge', 'slotId']
    if (required.some((key) => typeof payload[key] !== 'string' || !payload[key].trim())) {
      throw new Error('Please complete every required field.')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim()) || /[\r\n]/.test(payload.email)) {
      throw new Error('Please enter a valid email address.')
    }
    if (!Number.isInteger(payload.athleteCount) || payload.athleteCount < 1 || payload.athleteCount > 12) {
      throw new Error('Choose between 1 and 12 athletes.')
    }
    if (required.some((key) => payload[key].length > 300) || (payload.notes && (typeof payload.notes !== 'string' || payload.notes.length > 5000))) {
      throw new Error('Please shorten the form details and try again.')
    }
    // Fail before taking a reservation if the email service was never configured.
    const config = emailConfig((name) => Deno.env.get(name))
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: slot, error: slotError } = await admin.from('training_slots')
      .select('starts_at').eq('id', payload.slotId).eq('is_open', true)
      .gt('starts_at', new Date().toISOString()).single()
    if (slotError || !slot) throw new Error('This training time is no longer available.')
    const { error: reserveError } = await admin.rpc('reserve_slot', { target_slot: payload.slotId, athletes: payload.athleteCount })
    if (reserveError) throw new Error('This training time is no longer available.')
    const { data: booking, error } = await admin.from('bookings').insert({
      slot_id: payload.slotId,
      parent_name: payload.parentName.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      athlete_age: payload.athleteAge.trim(),
      athlete_count: payload.athleteCount,
      notes: payload.notes || null,
    }).select('id,parent_name,phone,email,athlete_age,athlete_count,notes').single()
    if (error) {
      const { error: releaseError } = await admin.rpc('release_slot', { target_slot: payload.slotId, athletes: payload.athleteCount })
      if (releaseError) console.error('Reservation release failed', { slotId: payload.slotId })
      throw new Error('Your request could not be saved. Please contact CRM2 before paying a deposit.')
    }

    const notifications = await sendBookingEmails({ ...booking, starts_at: slot.starts_at }, config)
    const { error: logError } = await admin.from('bookings').update({ email_notifications: notifications }).eq('id', booking.id)
    if (logError) console.error('Email status could not be saved', { bookingId: booking.id })
    // Never fail a saved booking just because email failed: prevent duplicate reservations.
    return Response.json({ id: booking.id, notifications }, { headers: cors })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Booking failed' }, { status: 400, headers: cors })
  }
})
