import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function Login() {
  const [mode, setMode] = useState('login') // login | register
  const [name, setName] = useState('Ronak Lakhtariya')
  const [email, setEmail] = useState('demo@skillpath.ai')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')
  const { login, loginDemo } = useApp()
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (!email.includes('@')) { setError('Enter a valid email address.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    login(email, password, name)
    navigate('/dashboard')
  }

  const handleRegister = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your full name.'); return }
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    login(email, password, name)
    navigate('/dashboard')
  }

  const handleDemo = () => {
    loginDemo(name || 'Ronak Lakhtariya')
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: 380, height: 380,
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15), transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 440, height: 440,
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.14), transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Back to Splash screen preview link */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            onClick={() => navigate('/splash')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            📱 View Mobile Splash Screen (9:16)
          </button>
        </div>

        {/* Logo */}
        <div className="text-center" style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 68, height: 68, borderRadius: 20,
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
            marginBottom: 16, fontSize: 32,
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)'
          }}>🚀</div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            SkillPath AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 6, letterSpacing: 0.5 }}>
            Build Skills. Shape Your Future.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 22,
          padding: '32px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          {/* Audio feature banner */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 12.5,
            color: '#38bdf8'
          }}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <span>
              <strong>AI Robot Voice Greeting:</strong> On login, an animated AI Robot character will appear and speak your name aloud!
            </span>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-secondary)',
            borderRadius: 10, padding: 4, marginBottom: 24
          }}>
            {['login', 'register'].map(m => (
              <button key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, fontWeight: 600, fontSize: 14,
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.2s',
                  border: mode === m ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer'
                }}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {/* Full Name field */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Your Full Name</span>
                <span style={{ fontSize: 11, color: 'var(--blue)' }}>*Spoken in audio</span>
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Enter your name (e.g. Ronak Lakhtariya)"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-glow)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: 'var(--red)'
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" style={{ marginBottom: 14, padding: '12px 0', fontSize: 15 }}>
              {mode === 'login' ? `Sign In as ${name || 'User'} →` : 'Create Account & Play Audio →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="btn w-full pulse-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.18))',
              border: '1px solid var(--blue)',
              color: 'var(--blue)',
              fontWeight: 700,
              fontSize: 14.5,
              padding: '13px 0',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span>⚡ Demo Login as</span>
            <span style={{ textDecoration: 'underline' }}>{name || 'Ronak Lakhtariya'}</span>
            <span>🔊</span>
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
            Instant demo with pre-loaded CS competencies & audio welcome
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          SkillPath AI · Smart India Hackathon 2026
        </p>
      </div>
    </div>
  )
}
