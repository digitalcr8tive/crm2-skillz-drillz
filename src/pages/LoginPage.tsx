import { FormEvent, type CSSProperties, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { assetPath } from '../lib/assets'
import { hasSupabase } from '../lib/supabase'
import { signIn } from '../lib/data'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/portal')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => { setEmail('demo@crm2.com'); setPassword('trainhard') }

  return (
    <div className="auth-page">
      <SiteHeader compact />
      <main className="auth-shell">
        <section className="auth-message" style={{ '--auth-bg': `url(${assetPath('assets/team-photo.png')})` } as CSSProperties}>
          <p className="section-tag section-tag--light">Current members</p>
          <h1>Your next rep starts here.</h1>
          <p>See open times, book or change a session, and check when your next payment is due.</p>
        </section>
        <form className="auth-form" onSubmit={submit}>
          <div><p className="section-tag">Member portal</p><h2>Welcome back.</h2></div>
          <label className="field"><span>Email</span><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="field"><span>Password</span><input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--orange" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log in to portal'}</button>
          {!hasSupabase && <button className="demo-login" type="button" onClick={fillDemo}>Use demo login: demo@crm2.com / trainhard</button>}
          <p>New to CRM2? <Link to="/signup">Book your first training</Link>.</p>
        </form>
      </main>
    </div>
  )
}
