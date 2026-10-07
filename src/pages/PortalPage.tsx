import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PolicyNotice } from '../components/PolicyNotice'
import { SiteHeader } from '../components/SiteHeader'
import { SlotPicker } from '../components/SlotPicker'
import { bookMemberSlot, cancelMemberBooking, formatDate, formatTime, getAvailableSlots, getMemberDashboard, signOut, venmoUrl, type Booking, type Slot } from '../lib/data'

export function PortalPage() {
  const navigate = useNavigate()
  const [memberName, setMemberName] = useState('Member')
  const [slots, setSlots] = useState<Slot[]>([])
  const [selected, setSelected] = useState<Slot | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [notice, setNotice] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getAvailableSlots(), getMemberDashboard()])
      .then(([openSlots, dashboard]) => { setSlots(openSlots); setMemberName(dashboard.name); setBooking(dashboard.booking) })
      .catch((error) => {
        if (error instanceof Error && error.message.includes('log in')) navigate('/login')
        else setNotice('Your portal could not be loaded. Please call 980-208-7327.')
      })
  }, [navigate])

  const reserve = async () => {
    if (!selected) return setNotice('Choose an open time first.')
    setSaving(true)
    try {
      const result = await bookMemberSlot(selected)
      setBooking(result)
      setShowCalendar(false)
      const emailAccepted = result.notifications?.customer.status === 'accepted' && result.notifications?.owner.status === 'accepted'
      setNotice(emailAccepted ? 'Your new time was submitted, and confirmation emails were submitted to you and CRM2. Pay the $25 deposit to reserve it.' : 'Your request was saved, but email confirmation is unavailable. Please contact crm2skillzanddrillz@gmail.com before paying. Do not submit the request again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Your request could not be saved. Please contact CRM2 before paying.')
    } finally {
      setSaving(false)
    }
  }

  const cancel = async () => {
    if (!booking || !window.confirm('Cancel this training session? The $25 deposit is non-refundable.')) return
    await cancelMemberBooking(booking.id)
    setBooking(null)
    setNotice('Your session was cancelled. You can choose another open time below.')
    setShowCalendar(true)
  }

  const logout = async () => { await signOut(); navigate('/login') }

  return (
    <div className="portal-page">
      <SiteHeader compact />
      <main className="portal-shell">
        <header className="portal-welcome">
          <div><p className="section-tag">Member portal</p><h1>Welcome back, {memberName}.</h1><p>Manage training without another text thread.</p></div>
          <button className="text-button" type="button" onClick={logout}>Log out</button>
        </header>
        {notice && <p className="portal-notice" role="status">{notice}</p>}

        <section className="portal-top-grid">
          <article className="next-session">
            <p className="portal-label">Next training</p>
            {booking ? <>
              <h2>{formatDate(booking.startsAt)}</h2>
              <p className="session-time">{formatTime(booking.startsAt)} · Little Rock, AR</p>
              <span className={`status status--${booking.status}`}>{booking.status === 'pending_deposit' ? 'Deposit pending' : 'Confirmed'}</span>
              <div className="session-actions">
                <button className="button button--outline-dark" type="button" onClick={() => setShowCalendar(true)}>Change date</button>
                <button className="text-button text-button--danger" type="button" onClick={cancel}>Cancel session</button>
              </div>
            </> : <><h2>No session booked</h2><p>Choose an open date below when you are ready.</p><button className="button button--dark" type="button" onClick={() => setShowCalendar(true)}>View open times</button></>}
          </article>

          <article className="payment-panel">
            <p className="portal-label">Payment</p>
            <h2>{booking ? `Next payment due: ${formatDate(booking.paymentDueDate)} — $${booking.balanceDue}` : 'Nothing due'}</h2>
            <p>Pay directly through Venmo. CRM2 will confirm when the payment is received.</p>
            {booking && <a className="button button--venmo" href={venmoUrl(booking.balanceDue, `CRM2 training payment - ${memberName} - ${formatDate(booking.startsAt)}`)} target="_blank" rel="noreferrer">Pay ${booking.balanceDue} with Venmo</a>}
          </article>
        </section>

        <section className={`portal-calendar ${showCalendar ? 'portal-calendar--open' : ''}`}>
          <div className="portal-section-heading"><div><p className="portal-label">Training calendar</p><h2>Choose an open time</h2></div>{!showCalendar && <button className="button button--dark" type="button" onClick={() => setShowCalendar(true)}>View calendar</button>}</div>
          {showCalendar && <><SlotPicker slots={slots} selectedId={selected?.id ?? ''} onSelect={setSelected} /><div className="calendar-actions"><button className="button button--orange" type="button" onClick={reserve} disabled={saving}>{saving ? 'Saving…' : 'Submit selected time'}</button><button className="text-button" type="button" onClick={() => setShowCalendar(false)}>Close calendar</button></div></>}
        </section>

        <PolicyNotice />
        <section className="portal-merch"><div><p className="portal-label">Member gear</p><h2>Ground Up shirts, $30.</h2><p>Black and white, sizes through 2XL.</p></div><Link className="button button--dark" to="/merch">Shop merch</Link></section>
      </main>
    </div>
  )
}
