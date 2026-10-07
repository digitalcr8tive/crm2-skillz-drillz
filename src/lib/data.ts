import { isTrainingDay } from './trainingSchedule'
export { isTrainingDay } from './trainingSchedule'

import { isDemo, supabase, bookingUnavailableMessage } from './supabase'

export type EmailNotifications = {
  customer: { status: 'accepted' | 'failed'; providerId?: string }
  owner: { status: 'accepted' | 'failed'; providerId?: string }
}

export type SignupResult = { id: string; notifications?: EmailNotifications; demo?: boolean }

export type Slot = {
  id: string
  startsAt: string
  durationMinutes: number
  spotsLeft: number
}

export type SignupPayload = {
  parentName: string
  phone: string
  email: string
  athleteAge: string
  athleteCount: number
  notes: string
  slotId: string
  slotStartsAt: string
}

export type Booking = {
  id: string
  startsAt: string
  status: 'pending_deposit' | 'confirmed' | 'cancelled'
  balanceDue: number
  paymentDueDate: string
  notifications?: EmailNotifications
}

const buildDemoSlots = (): Slot[] => {
  const slots: Slot[] = []
  const hours = [17, 10, 18, 16, 11, 18, 15, 17]
  const spots = [3, 2, 4, 1, 3, 2, 4, 2]
  let addDays = 1

  while (slots.length < hours.length) {
    const date = new Date()
    date.setDate(date.getDate() + addDays)
    date.setHours(hours[slots.length], 0, 0, 0)
    if (isTrainingDay(date)) {
      slots.push({ id: `demo-${slots.length + 1}`, startsAt: date.toISOString(), durationMinutes: 60, spotsLeft: spots[slots.length] })
    }
    addDays += 1
  }
  return slots
}

export const demoSlots = buildDemoSlots()

export async function getAvailableSlots(): Promise<Slot[]> {
  if (isDemo) return demoSlots
  if (!supabase) throw new Error(bookingUnavailableMessage)
  const { data, error } = await supabase
    .from('training_slots')
    .select('id,starts_at,duration_minutes,capacity,booked_count')
    .eq('is_open', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
  if (error) throw error
  return (data ?? []).map((slot) => ({
    id: slot.id,
    startsAt: slot.starts_at,
    durationMinutes: slot.duration_minutes,
    spotsLeft: Math.max(slot.capacity - slot.booked_count, 0),
  })).filter((slot) => isTrainingDay(slot.startsAt) && slot.spotsLeft > 0)
}

export async function createSignup(payload: SignupPayload): Promise<SignupResult> {
  if (isDemo) {
    localStorage.setItem('crm2-last-signup', JSON.stringify(payload))
    return { id: `demo-${Date.now()}`, demo: true }
  }
  if (!supabase) throw new Error(bookingUnavailableMessage)
  const { data, error } = await supabase.functions.invoke('create-booking', { body: payload })
  if (error) throw error
  if (!data?.id) throw new Error(data?.error || 'We could not save your request. Please contact CRM2 before paying a deposit.')
  return data
}

export async function signIn(email: string, password: string) {
  if (isDemo) {
    if (email.toLowerCase() !== 'demo@crm2.com' || password !== 'trainhard') {
      throw new Error('Use the demo login shown below, or connect Supabase for live member accounts.')
    }
    localStorage.setItem('crm2-demo-auth', 'true')
    return
  }
  if (!supabase) throw new Error(bookingUnavailableMessage)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut() {
  localStorage.removeItem('crm2-demo-auth')
  if (supabase) await supabase.auth.signOut()
}

export function demoBooking(): Booking | null {
  if (localStorage.getItem('crm2-demo-cancelled') === 'true') return null
  const saved = localStorage.getItem('crm2-demo-booking')
  if (saved) return JSON.parse(saved) as Booking
  const startsAt = demoSlots[1].startsAt
  return {
    id: 'member-demo-booking',
    startsAt,
    status: 'pending_deposit',
    balanceDue: 25,
    paymentDueDate: startsAt,
  }
}

export async function bookMemberSlot(slot: Slot): Promise<Booking> {
  if (isDemo) {
    const booking: Booking = {
      id: `demo-${Date.now()}`,
      startsAt: slot.startsAt,
      status: 'pending_deposit',
      balanceDue: 25,
      paymentDueDate: slot.startsAt,
    }
    localStorage.setItem('crm2-demo-booking', JSON.stringify(booking))
    localStorage.removeItem('crm2-demo-cancelled')
    return booking
  }
  if (!supabase) throw new Error(bookingUnavailableMessage)
  const { data, error } = await supabase.functions.invoke('member-booking', {
    body: { action: 'book', slotId: slot.id },
  })
  if (error) throw error
  return data as Booking
}

export async function cancelMemberBooking(bookingId: string) {
  if (isDemo) {
    localStorage.removeItem('crm2-demo-booking')
    localStorage.setItem('crm2-demo-cancelled', 'true')
    return
  }
  if (!supabase) throw new Error(bookingUnavailableMessage)
  const { error } = await supabase.functions.invoke('member-booking', {
    body: { action: 'cancel', bookingId },
  })
  if (error) throw error
}

export async function getMemberDashboard(): Promise<{ name: string; booking: Booking | null }> {
  if (isDemo) return { name: 'Jordan', booking: demoBooking() }
  if (!supabase) throw new Error(bookingUnavailableMessage)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Please log in to view your member portal.')
  const [{ data: profile }, { data: rawBooking, error }] = await Promise.all([
    supabase.from('profiles').select('parent_name').eq('id', session.user.id).single(),
    supabase
      .from('bookings')
      .select('id,status,balance_due,training_slots(starts_at)')
      .eq('user_id', session.user.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  if (error) throw error
  const row = rawBooking as unknown as { id: string; status: Booking['status']; balance_due: number; training_slots: { starts_at: string } | null } | null
  return {
    name: profile?.parent_name ?? session.user.email?.split('@')[0] ?? 'Member',
    booking: row?.training_slots ? {
      id: row.id,
      startsAt: row.training_slots.starts_at,
      status: row.status,
      balanceDue: row.balance_due,
      paymentDueDate: row.training_slots.starts_at,
    } : null,
  }
}

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  }).format(new Date(value))

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/Chicago',
  }).format(new Date(value))

export const venmoUrl = (amount: number, note: string) =>
  `https://venmo.com/u/Courtney-Marshall-53?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`
