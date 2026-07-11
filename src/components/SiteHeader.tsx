import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { assetPath } from '../lib/assets'

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <header className={`site-header ${compact ? 'site-header--compact' : ''}`}>
      <Link className="brand" to="/" aria-label="CRM2 Skillz and Drillz home">
        <img className="brand-logo" src={assetPath('assets/business-logo.jpeg')} alt="" aria-hidden="true" />
        <span>CRM2 Skillz &amp; Drillz</span>
      </Link>
      <button className="menu-button" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="sr-only">Toggle navigation</span>
        <span /><span /><span />
      </button>
      <nav className={open ? 'nav-open' : ''} aria-label="Main navigation">
        <NavLink to="/about">About</NavLink>
        <NavLink to="/training">Training</NavLink>
        <NavLink to="/merch">Merch</NavLink>
        <NavLink className="nav-login" to="/login">Member Login</NavLink>
        <NavLink className="nav-book" to="/signup">Book Training</NavLink>
      </nav>
    </header>
  )
}
