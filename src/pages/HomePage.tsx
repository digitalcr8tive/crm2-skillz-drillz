import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PolicyNotice } from '../components/PolicyNotice'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { assetPath } from '../lib/assets'

const pillars = [
  ['handling', 'Ball Handling', 'Tight handle, both hands. Build the foundation every move comes from.'],
  ['shooting', 'Shooting & Finishing', 'Form work, footwork, off-the-dribble shooting, and finishes at the rim.'],
  ['speed', 'Speed & Agility', 'Court-specific conditioning so they are the freshest player out there.'],
  ['iq', 'Game IQ', 'Reads, decision-making, and confidence that separate skilled hoopers.'],
]

const upcomingClinic = {
  title: '2026 Thanksgiving Break Basketball Clinic',
  registrationUrl: 'https://www.eventbrite.com/e/copy-of-2026-thanksgiving-break-basketball-clinic-tickets-2002809568333?aff=oddtdtcreator',
  // Retire the promotion after the final clinic day in Little Rock (Central time).
  endsAt: '2026-11-14T00:00:00-06:00',
}

function PillarIcon({ type }: { type: string }) {
  if (type === 'handling') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3M2 12h4M3 17h3" /><circle cx="15" cy="12" r="6" /><path d="M15 6v12M9 12h12M11 7.5c2 1.5 3 3 3 4.5s-1 3-3 4.5M19 7.5c-2 1.5-3 3-3 4.5s1 3 3 4.5" /></svg>
  }
  if (type === 'shooting') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><path d="m15.5 8.5 4-4m0 0v3m0-3h-3" /></svg>
  }
  if (type === 'speed') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 6 13h6l-1.5 9L19 10h-6l.5-8Z" /><path d="M2 7h4M1 11h4M2 15h3" /></svg>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="3.5" width="15" height="17.5" rx="1.5" /><path d="M9 3.5V2h6v1.5M8 8.5l2.5 2.5m0-2.5L8 11M14.5 8.5h2.5M13 16c1.3-2.2 3-3.2 5-3.2M16.4 11.5l1.8 1.3-1.4 1.8" /><circle cx="9" cy="16.5" r="1.4" /></svg>
}

export function HomePage() {
  return (
    <div>
      <SiteHeader />
      <main>
        <section className="hero" style={{ '--hero-photo': `url(${assetPath('assets/business-logo.jpeg')})` } as CSSProperties}>
          <div className="hero-photo" aria-hidden="true" />
          <div className="hero-shade" />
          <div className="hero-content">
            <h1>Built <span>from the</span><br />ground up.</h1>
            <p>Basketball skills development for the next generation of Little Rock hoopers. Real reps. Real coaching. Real results.</p>
            <div className="hero-actions">
              <Link className="button button--orange" to="/signup">Book your first training <span>→</span></Link>
              <Link className="button button--outline-light" to="/login">Member login</Link>
            </div>
            <div className="hero-stats">
              <div><strong>K–PROS</strong><span>All levels</span></div>
              <div><strong>1-ON-1</strong><span>&amp; small group</span></div>
              <div><strong>501</strong><span>Little Rock, AR</span></div>
            </div>
          </div>
        </section>

        {Date.now() < Date.parse(upcomingClinic.endsAt) && (
          <section className="upcoming-event" aria-labelledby="upcoming-event-title">
            <div className="upcoming-event-date" aria-label="November 11 through 13, 2026">
              <span>November 2026</span>
              <strong>11–13</strong>
              <span>10 AM–12 PM · Central</span>
            </div>
            <div className="upcoming-event-copy">
              <p className="upcoming-event-label">Upcoming clinic</p>
              <h2 id="upcoming-event-title">{upcomingClinic.title}</h2>
              <p>New to the court or back for more? Join Skillz &amp; Drillz for a basketball clinic in Little Rock.</p>
              <p className="upcoming-event-location">Calvary Baptist Church · 5700 Cantrell Rd</p>
            </div>
            <div className="upcoming-event-action">
              <a className="button button--dark" href={upcomingClinic.registrationUrl} target="_blank" rel="noopener noreferrer">
                Register on Eventbrite <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <p>Event details &amp; tickets on Eventbrite</p>
            </div>
          </section>
        )}

        <section className="about-section" id="about">
          <div className="about-photo-wrap">
            <img src={assetPath('assets/training-drills.png')} alt="Young athletes practicing ball-handling drills in a Little Rock gym" />
            <span className="effort-stamp"><strong>100%</strong> effort required</span>
          </div>
          <div className="about-copy">
            <p className="section-tag">About the program</p>
            <h2>Skills, drills &amp; discipline.</h2>
            <p>We coach athletes from kids to pros across Little Rock with a curriculum built on fundamentals: handle, shot, footwork, and game IQ. Every session is shaped around age, position, and goals.</p>
            <ul className="check-list">
              <li>Position-specific drills, not generic workouts</li>
              <li>Small-group and one-on-one sessions</li>
              <li>Progress tracked between sessions</li>
              <li>Coaching that demands focus and effort</li>
            </ul>
            <Link className="text-link" to="/about">Meet Coach Courtney <span>→</span></Link>
          </div>
        </section>

        <section className="training-section" id="training">
          <div className="training-heading">
            <p className="section-tag section-tag--light">What we work on</p>
            <h2>The foundation. The polish.<br /><span>The edge.</span></h2>
            <p>Every session pulls from these four pillars, built around age, position, and goals.</p>
          </div>
          <div className="pillar-list">
            {pillars.map(([icon, title, copy]) => (
              <article key={title}>
                <span className="pillar-icon"><PillarIcon type={icon} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <Link className="button button--training-link" to="/training">Explore the training program <span>→</span></Link>
        </section>

        <section className="steps-section">
          <div className="steps-content">
            <p className="section-tag">How it works</p>
            <h2>Simple. Three steps.</h2>
            <ol>
              <li><span>01</span><div><h3>Sign up</h3><p>Tell us a little about your athlete. It takes about 60 seconds.</p></div></li>
              <li><span>02</span><div><h3>Get scheduled</h3><p>Choose an open training time and review the deposit policy.</p></div></li>
              <li><span>03</span><div><h3>Lock in sessions</h3><p>Pay the deposit, then use your portal to manage dates and payment due dates.</p></div></li>
            </ol>
          </div>
          <div className="steps-photo-wrap">
            <img src={assetPath('assets/team-photo.png')} alt="CRM2 Skillz and Drillz athletes and coaches gathered after training" />
          </div>
        </section>

        <PolicyNotice />

        <section className="merch-teaser">
          <div className="merch-teaser-photo">
            <img src={assetPath('assets/merch-white.png')} alt="White CRM2 Skillz and Drillz shirts with the basketball logo" />
          </div>
          <div>
            <p className="section-tag">Ground Up gear</p>
            <h2>Rep the work.</h2>
            <p>Official CRM2 shirts in black or white, available through 2XL. $30 each, paid through Venmo.</p>
            <Link className="button button--dark" to="/merch">Shop shirts <span>→</span></Link>
          </div>
        </section>

        <section className="final-cta">
          <div><h2>Ready to put in the work?</h2><p>Book a first session or head to your member portal.</p></div>
          <div><Link className="button button--light" to="/signup">Book training</Link><Link className="button button--outline-light" to="/login">Log in</Link></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
