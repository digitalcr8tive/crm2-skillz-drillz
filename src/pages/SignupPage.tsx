import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PolicyNotice } from '../components/PolicyNotice'
import { SiteHeader } from '../components/SiteHeader'
import { CalendarPicker } from '../components/CalendarPicker'
import { createSignup, formatDate, formatTime, getAvailableSlots, venmoUrl, type Slot } from '../lib/data'

type FormState = {
  parentName: string
  phone: string
  email: string
  athleteAge: string
  athleteCount: number
  notes: string
}

const initialForm: FormState = { parentName: '', phone: '', email: '', athleteAge: '', athleteCount: 1, notes: '' }

export function SignupPage() {
  const [form, setForm] = useState(initialForm)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slot, setSlot] = useState<Slot | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    getAvailableSlots().then(setSlots).catch(() => setError('Training times could not be loaded. Please call 980-208-7327.')).finally(() => setLoading(false))
  }, [])

  const update = (key: keyof FormState, value: string | number) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!slot) return setError('Choose an available training date and time.')
    if (!accepted) return setError('Please agree to the deposit policy before continuing.')
    setSubmitting(true)
    try {
      await createSignup({ ...form, slotId: slot.id, slotStartsAt: slot.startsAt })
      setConfirmed(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'We could not save the booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed && slot) {
    return (
      <div className="light-page">
        <SiteHeader compact />
        <main className="confirmation-wrap">
          <section className="confirmation-card">
            <span className="confirmation-mark" aria-hidden="true">✓</span>
            <p className="section-tag">Request received</p>
            <h1>Your training time is waiting.</h1>
            <p className="confirmation-lead">We sent the request details to <strong>{form.email}</strong>. Pay the $25 deposit to reserve the spot.</p>
            <dl className="booking-summary">
              <div><dt>Athlete</dt><dd>{form.parentName}</dd></div>
              <div><dt>Date</dt><dd>{formatDate(slot.startsAt)}</dd></div>
              <div><dt>Time</dt><dd>{formatTime(slot.startsAt)}</dd></div>
              <div><dt>Deposit due</dt><dd>$25.00</dd></div>
            </dl>
            <a className="button button--venmo" href={venmoUrl(25, `CRM2 training deposit - ${form.parentName} - ${formatDate(slot.startsAt)}`)} target="_blank" rel="noreferrer">Pay $25 deposit with Venmo</a>
            <p className="confirmation-note">Your reservation is confirmed after CRM2 receives the deposit. The remaining $25 is due on the day of training.</p>
            <Link className="text-link" to="/">Return home</Link>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="light-page">
      <SiteHeader compact />
      <main className="signup-shell">
        <section className="signup-intro">
          <p className="section-tag">New players</p>
          <h1>Let's get you <span>in the gym.</span></h1>
          <p>Tell us about your athlete, choose a time, and pay the $25 deposit to hold the spot.</p>
          <ul className="mini-benefits"><li>About two minutes</li><li>Open times shown live</li><li>Confirmation by email</li></ul>
        </section>

        <form className="signup-form" onSubmit={submit}>
          <div className="form-section">
            <p className="form-step">1 <span>Player details</span></p>
            <div className="field-grid">
              <label className="field"><span>Parent or guardian name</span><input required autoComplete="name" value={form.parentName} onChange={(e) => update('parentName', e.target.value)} /></label>
              <label className="field"><span>Phone</span><input required type="tel" autoComplete="tel" placeholder="501-555-0123" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
              <label className="field field--wide"><span>Email</span><input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
              <label className="field"><span>Child's age or grade</span><input required placeholder="Example: age 12, 7th grade" value={form.athleteAge} onChange={(e) => update('athleteAge', e.target.value)} /></label>
              <label className="field"><span>Number training</span><input required type="number" min="1" max="12" value={form.athleteCount} onChange={(e) => update('athleteCount', Number(e.target.value))} /></label>
              <label className="field field--wide"><span>Anything else we should know? <em>Optional</em></span><textarea rows={4} placeholder="Skill level, position, goals, or schedule notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} /></label>
            </div>
          </div>

          <div className="form-section">
            <p className="form-step">2 <span>Choose a training time</span></p>
            {loading ? <p>Loading open times...</p> : <CalendarPicker slots={slots} selectedId={slot?.id ?? ''} onSelect={setSlot} />}
          </div>

          <PolicyNotice checkbox accepted={accepted} onChange={setAccepted} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--orange submit-button" type="submit" disabled={submitting}>{submitting ? 'Saving your request…' : 'Submit and continue to deposit'}</button>
          <p className="form-login">Already training with us? <Link to="/login">Log in to your portal</Link>.</p>
        </form>
      </main>
    </div>
  )
}
