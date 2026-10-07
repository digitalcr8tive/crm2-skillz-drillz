export const ownerEmail = 'crm2skillzanddrillz@gmail.com'

export type EmailConfig = { apiKey: string; from: string }
export type EmailResult = { status: 'accepted' | 'failed'; providerId?: string; error?: string }
export type EmailNotifications = { customer: EmailResult; owner: EmailResult }
export type BookingEmail = {
  id: string
  parent_name: string
  phone: string
  email: string
  athlete_age: string | null
  athlete_count: number
  notes: string | null
  starts_at: string
}

export function emailConfig(get: (name: string) => string | undefined): EmailConfig {
  const apiKey = get('RESEND_API_KEY')?.trim()
  const from = get('RESEND_FROM_EMAIL')?.trim()
  if (!apiKey || !from || from.includes('yourdomain.com')) {
    throw new Error(`Online booking is temporarily unavailable. Please contact ${ownerEmail} before paying a deposit.`)
  }
  return { apiKey, from }
}

export const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]!)

export async function sendBookingEmails(
  booking: BookingEmail,
  config: EmailConfig,
  send: typeof fetch = fetch,
): Promise<EmailNotifications> {
  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Chicago',
  }).format(new Date(booking.starts_at))
  const details = `<p>Parent/guardian: ${escapeHtml(booking.parent_name)}<br>Session: ${escapeHtml(date)} (Little Rock time)<br>Age/grade: ${escapeHtml(booking.athlete_age)}<br>Number training: ${booking.athlete_count}<br>Booking reference: ${escapeHtml(booking.id)}</p>`
  const paymentNote = `CRM2 training deposit - ${booking.parent_name} - ${date} - ${booking.id}`
  const paymentUrl = `https://venmo.com/u/Courtney-Marshall-53?txn=pay&amount=25&note=${encodeURIComponent(paymentNote)}`
  const policy = '<p>The $25 non-refundable deposit is pending. Your spot is reserved after CRM2 verifies receipt of the deposit. The remaining $25 is due on training day.</p>'
  const messages = {
    owner: {
      to: [ownerEmail], reply_to: booking.email,
      subject: `New training request from ${booking.parent_name.replace(/[\r\n]/g, ' ')}`,
      html: `<h1>New CRM2 training request</h1>${details}<p>Phone: ${escapeHtml(booking.phone)}<br>Email: ${escapeHtml(booking.email)}</p><p>Notes: ${escapeHtml(booking.notes)}</p>${policy}`,
    },
    customer: {
      to: [booking.email], reply_to: ownerEmail,
      subject: 'CRM2 training request received',
      html: `<h1>Your training request is in.</h1>${details}${policy}<p><a href="${escapeHtml(paymentUrl)}">Pay the $25 deposit with Venmo</a></p><p>Questions? Reply to this email or contact ${ownerEmail}.</p>`,
    },
  }

  const sendOne = async (recipient: keyof typeof messages): Promise<EmailResult> => {
    try {
      const response = await send('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `booking-${booking.id}-${recipient}`,
        },
        body: JSON.stringify({ from: config.from, ...messages[recipient] }),
        signal: AbortSignal.timeout(10000),
      })
      const data = await response.json()
      if (!response.ok || !data?.id) {
        // Keep provider failures observable without logging form data or credentials.
        const error = `Email provider rejected the ${recipient} notification (HTTP ${response.status}).`
        console.error(error, { bookingId: booking.id })
        return { status: 'failed', error }
      }
      return { status: 'accepted', providerId: data.id }
    } catch {
      const error = `Email provider could not be reached for the ${recipient} notification.`
      console.error(error, { bookingId: booking.id })
      return { status: 'failed', error }
    }
  }
  // Separate requests keep contact details private and let either recipient succeed independently.
  const [owner, customer] = await Promise.all([sendOne('owner'), sendOne('customer')])
  return { owner, customer }
}
