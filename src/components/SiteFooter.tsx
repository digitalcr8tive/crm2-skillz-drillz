import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div>
        <p className="footer-brand">CRM2 Skillz &amp; Drillz</p>
        <p>Built from the ground up in Little Rock, Arkansas.</p>
      </div>
      <div className="footer-links">
        <a href="tel:9802087327">980-208-7327</a>
        <a href="mailto:crm2skillzanddrillz@gmail.com">crm2skillzanddrillz@gmail.com</a>
        <a href="https://instagram.com/skillz_and_drillz" target="_blank" rel="noreferrer">@skillz_and_drillz</a>
      </div>
      <div className="footer-links">
        <Link to="/about">Meet Coach Courtney</Link>
        <Link to="/training">Explore training</Link>
        <Link to="/signup">Book your first training</Link>
        <Link to="/login">Member login</Link>
        <Link to="/merch">Shop shirts</Link>
      </div>
      <p className="footer-legal">CRM2 GROUND UP LLC</p>
    </footer>
  )
}
