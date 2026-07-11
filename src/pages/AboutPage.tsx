import { Link } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { assetPath } from '../lib/assets'

export function AboutPage() {
  return (
    <div className="light-page">
      <SiteHeader compact />
      <main className="about-page">
        <section className="coach-hero">
          <div className="coach-hero-copy">
            <p className="section-tag">Meet the trainer</p>
            <h1>Courtney<br /><span>Marshall.</span></h1>
            <p>Basketball development coach, mentor, and the person behind CRM2 Skillz &amp; Drillz.</p>
            <Link className="button button--dark" to="/signup">Train with Courtney <span>→</span></Link>
          </div>
          <div className="coach-portrait-wrap">
            <img src={assetPath('assets/courtney-marshall.jpg')} alt="Coach Courtney Marshall holding a basketball inside the gym" />
          </div>
        </section>

        <section className="coach-story">
          <div className="coach-story-heading">
            <p className="section-tag section-tag--light">Ground-up development</p>
            <h2>Coaching that keeps showing up in games.</h2>
          </div>
          <div className="coach-story-copy">
            <p>Courtney Marshall trains athletes to understand the game, sharpen their fundamentals, and compete with confidence. His work has helped several young players earn Division I opportunities, and professional athletes continue training with him to stay ready and improve their craft.</p>
            <p>Every athlete is coached where they are. The work changes by age, position, experience, and goals, but the standard stays the same: focused repetitions, honest feedback, and consistent effort.</p>
          </div>
          <div className="coach-proof">
            <div><strong>D1</strong><span>Athletes earning opportunities</span></div>
            <div><strong>PRO</strong><span>Players refining their craft</span></div>
            <div><strong>501</strong><span>Built in Little Rock</span></div>
          </div>
        </section>

        <section className="coach-method">
          <div>
            <p className="section-tag">The coaching standard</p>
            <h2>Details first. Confidence follows.</h2>
          </div>
          <ol>
            <li><span>01</span><div><h3>See the whole athlete</h3><p>Training starts with how a player moves, thinks, competes, and responds to coaching.</p></div></li>
            <li><span>02</span><div><h3>Build repeatable skills</h3><p>Footwork, handle, shooting mechanics, reads, and conditioning are taught for game speed.</p></div></li>
            <li><span>03</span><div><h3>Raise the standard</h3><p>Progress is earned through accountable work and the habits athletes carry beyond one session.</p></div></li>
          </ol>
        </section>

        <section className="coach-reel">
          <div className="coach-reel-copy">
            <p className="section-tag section-tag--light">Watch the work</p>
            <h2>Inside a CRM2 session.</h2>
            <p>See Courtney coaching athletes through live repetitions, corrections, and game-speed development.</p>
            <a className="text-link text-link--light" href="https://www.instagram.com/reel/DNox5f0t5vN/" target="_blank" rel="noreferrer">Watch on Instagram <span>↗</span></a>
          </div>
          <div className="instagram-frame">
            <iframe
              src="https://www.instagram.com/reel/DNox5f0t5vN/embed/"
              title="CRM2 Skillz and Drillz training reel on Instagram"
              allow="encrypted-media; picture-in-picture; web-share"
              loading="lazy"
            />
          </div>
        </section>

        <section className="about-cta">
          <div><h2>Ready to be coached?</h2><p>Tell us about your athlete and choose an open training time.</p></div>
          <Link className="button button--dark" to="/signup">Book first training</Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
