'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) {
        router.push('/dashboard')
      } else {
        alert(error.message)
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      })
      if (!error) {
        alert('Compte créé ! Vérifiez vos emails pour confirmer votre inscription.')
        setIsLogin(true)
      } else {
        alert(error.message)
      }
    }
  }

  return (
    <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'center', minHeight: '100vh', alignItems: 'center' }}>
      <div className="auth-screen">
        <div className="auth-left">
          <div className="auth-brand">Talent<span>-DZ</span></div>
          <div className="auth-headline">Find your next opportunity in Algeria</div>
          <p className="auth-desc">Connect with top employers, apply in seconds, and track every step of your journey.</p>
          <div className="feat-list">
            <div className="feat-row">
              <div className="feat-icon">
                <svg viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="10" rx="1.5"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1"/></svg>
              </div>
              <div className="feat-text"><strong>Hundreds of verified offers</strong>Browse full-time, remote & hybrid roles across Algeria</div>
            </div>
            <div className="feat-row">
              <div className="feat-icon">
                <svg viewBox="0 0 16 16"><path d="M2 13l4-4 3 3 5-6"/></svg>
              </div>
              <div className="feat-text"><strong>One-click applications</strong>Upload your CV once and apply to any job instantly</div>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-box">
            <div className="auth-tab-row">
              <div className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Sign in</div>
              <div className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Create account</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="auth-form-title">{isLogin ? 'Welcome back' : 'Create your account'}</div>
              
              {!isLogin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label">First name</label>
                    <input required className="form-input" placeholder="Amine" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Last name</label>
                    <input required className="form-input" placeholder="Meziani" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>
              )}
              
              <div className="input-group">
                <label className="form-label">Email</label>
                <input required className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              
              <div className="input-group">
                <label className="form-label">Password</label>
                <input required className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              <button type="submit" className="btn-full btn-red" style={{ marginTop: '12px' }}>
                {isLogin ? 'Sign in' : 'Create free account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
