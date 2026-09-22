import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import AIRobotGreeting from './AIRobotGreeting.jsx'

const navItems = [
  { label: 'Dashboard',    path: '/dashboard',    icon: '⊞' },
  { label: 'Assessment',   path: '/subjects',     icon: '📋' },
  { label: 'Skill Profile',path: '/skill-profile',icon: '🎯' },
  { label: 'Learning Path',path: '/learning-path',icon: '🗺️' },
  { label: 'Practice',     path: '/practice',     icon: '✏️' },
  { label: 'Progress',     path: '/progress',     icon: '📈' },
  { label: 'AI Tutor',     path: '/ai-tutor',     icon: '🤖' },
  { label: 'Materials',    path: '/materials',    icon: '📄' },
  { label: 'Admin',        path: '/admin',        icon: '🔧' },
]

export default function Layout() {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="page-wrap">
      <nav className="navbar">
        <span className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          SkillPath AI
        </span>

        {/* Hamburger for mobile */}
        <button
          onClick={() => setMenuOpen(p => !p)}
          style={{ display: 'none', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 22, cursor: 'pointer' }}
          className="nav-hamburger"
          aria-label="Toggle navigation">
          ☰
        </button>

        <ul className={`nav-links${menuOpen ? ' mobile-open' : ''}`}>
          {navItems.map(item => (
            <li key={item.path}
              className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setMenuOpen(false) }}
              title={item.label}
            >
              <span style={{ marginRight: 4 }}>{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0,
          }} title={user?.name}>
            {user?.avatar || user?.name?.[0] || '?'}
          </div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 13, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 8, whiteSpace: 'nowrap' }}
            onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <main>
        <AIRobotGreeting />
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 900px) {
          .nav-hamburger { display: block !important; }
          .nav-links { display: none !important; flex-direction: column; position: absolute; top: 64px; left: 0; right: 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border); padding: 12px 16px; z-index: 99; gap: 4px; }
          .nav-links.mobile-open { display: flex !important; }
          .nav-link { padding: 10px 14px !important; border-radius: 8px; }
        }
      `}</style>
    </div>
  )
}
