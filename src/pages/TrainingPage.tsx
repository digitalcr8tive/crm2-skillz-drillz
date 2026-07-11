import { Link } from 'react-router-dom'
import { PolicyNotice } from '../components/PolicyNotice'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { assetPath } from '../lib/assets'

const focusAreas = [
  ['Ball control', 'Change of pace, weak-hand confidence, pressure handling, and moves that create space.'],
  ['Scoring', 'Shooting mechanics, footwork, finishing angles, and decisions at the rim.'],
  ['Movement', 'Acceleration, balance, lateral speed, conditioning, and court-ready movement.'],
  ['Game reads', 'Spacing, timing, defensive recognition, and making the next play quickly.'],
]

export function TrainingPage() {
  return (
    <div className="light-page">
      <SiteHeader compact />
      <main className="program-page">
        <section className="program-hero">
          <div className="program-hero-copy">
            <p className="section-tag section-tag--light">The training program</p>
            <h1>Work built for <span>game speed.</span></h1>
            <p>Focused basketball development for grade-school players, college athletes, and pros in Little Rock.</p>
            <Link className="button button--orange" to="/signup">Choose a training time <span>→</span></Link>
          </div>
          <img src={assetPath('assets/training-drills.png')} alt="Athletes working through ball-handling repetitions during CRM2 training" />
        </section>

        <section className="program-formats">
          <article><h2>One-on-one</h2><p>Individual coaching shaped around the athlete's position, movement, strengths, and next goal.</p></article>
          <article><h2>Small group</h2><p>Competitive repetitions, live reads, and accountability with players at a useful pace and level.</p></article>
          <article><h2>Drop-in</h2><p>A focused $50 workout with a $25 deposit required to reserve the selected training date.</p></article>
        </section>

        <section className="program-focus">
          <div className="program-focus-heading"><p className="section-tag">What gets trained</p><h2>Skills that transfer.</h2><p>Every workout is adjusted for age, position, and experience.</p></div>
          <div className="program-focus-list">
            {focusAreas.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
          </div>
        </section>

        <section className="program-expect">
          <img src={assetPath('assets/team-photo.png')} alt="CRM2 athletes and coaches gathered after a group training session" />
          <div><p className="section-tag section-tag--light">What to expect</p><h2>Come ready to work.</h2><ul><li>Age and position-specific instruction</li><li>High-quality, game-speed repetitions</li><li>Direct corrections and clear next steps</li><li>A standard that grows with the athlete</li></ul></div>
        </section>

        <PolicyNotice />
        <section className="about-cta"><div><h2>Choose your first session.</h2><p>Open dates and times are available in the booking flow.</p></div><Link className="button button--dark" to="/signup">View open training times</Link></section>
      </main>
      <SiteFooter />
    </div>
  )
}
