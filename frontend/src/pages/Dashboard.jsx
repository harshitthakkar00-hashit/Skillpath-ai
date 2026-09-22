import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { getScoreColor, getFillClass, getTopicBadge, getCompetencyLevel } from '../services/scoringEngine.js'

function CircleProgress({ value, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const color = value >= 70 ? 'var(--green)' : value >= 40 ? 'var(--orange)' : 'var(--red)'

  return (
    <div className="circle-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--bg-secondary)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="label">
        <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}%</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, scores, isDemo, isSpeaking, playGreeting } = useApp()
  const navigate = useNavigate()
  const s = scores || (isDemo ? DEMO_SCORES : null)

  const topics = s ? Object.entries(s.topics) : []
  const strong = topics.filter(([, v]) => v >= 70)
  const gaps = topics.filter(([, v]) => v < 40)
  const medium = topics.filter(([, v]) => v >= 40 && v < 70)

  return (
    <div className="page-content fade-in">
      {/* Audio Voice Welcome Banner */}
      {user && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.16), rgba(139, 92, 246, 0.2))',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 16,
          padding: '16px 22px',
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: '0 8px 30px rgba(56, 189, 248, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)',
              border: '1.5px solid rgba(56, 189, 248, 0.6)'
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Welcome, {user.name}!
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ color: '#38bdf8' }}>{isSpeaking ? '⚡' : '🔊'}</span>
                <span>{isSpeaking ? 'AI Robot is speaking greeting...' : `AI Voice: "Welcome to SkillPath AI, ${user.name}!"`}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => playGreeting(user.name)}
            className="btn btn-ghost"
            style={{
              background: isSpeaking ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              color: '#38bdf8',
              padding: '9px 18px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: isSpeaking ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <span>{isSpeaking ? '🤖 Robot Speaking...' : '🤖 Replay Robot Voice'}</span>
          </button>
        </div>
      )}

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
        border: '1px solid var(--border)',
        borderRadius: 20, padding: '28px 32px',
        marginBottom: 28, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20
      }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Welcome back, {user?.name} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {s ? `You're at ${s.level} level · Keep improving!` : 'Take your first assessment to get started.'}
          </p>
          {isDemo && (
            <span className="badge badge-blue" style={{ marginTop: 8 }}>Demo Mode</span>
          )}
        </div>
        <button className="btn btn-primary btn-large pulse-glow"
          onClick={() => navigate('/subjects')}
          style={{ minWidth: 220, fontSize: 16 }}>
          📋 Start 3-Minute Assessment
        </button>
      </div>

      {s ? (
        <>
          {/* Stats row */}
          <div className="grid-4" style={{ marginBottom: 28 }}>
            <div className="card text-center" style={{ padding: '28px 16px' }}>
              <CircleProgress value={s.overall} size={100} stroke={8} />
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>Overall Competency</p>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Current Level</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.level === 'Advanced' ? 'var(--green)' : s.level === 'Intermediate' ? 'var(--orange)' : 'var(--red)' }}>{s.level}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Python Programming</p>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Strong Topics</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{strong.length}</p>
              {strong.slice(0, 2).map(([t]) => (
                <span key={t} className="badge badge-green" style={{ width: 'fit-content' }}>{t}</span>
              ))}
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Skill Gaps</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--red)' }}>{gaps.length}</p>
              {gaps.slice(0, 2).map(([t]) => (
                <span key={t} className="badge badge-red" style={{ width: 'fit-content' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Topic scores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Topic Competency</h3>
              {Object.entries(s.topics).map(([topic, score]) => {
                const badge = getTopicBadge(score)
                return (
                  <div key={topic} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{topic}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: getScoreColor(score) }}>{score}%</span>
                      </div>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className={`progress-bar-fill ${getFillClass(score)}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Recommended */}
              <div className="card" style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🎯 Recommended Next</h3>
                {gaps.length > 0 ? (
                  <>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      Focus on your skill gaps to improve overall competency:
                    </p>
                    {gaps.map(([topic, score]) => (
                      <div key={topic} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', background: 'var(--bg-secondary)',
                        borderRadius: 10, marginBottom: 8, border: '1px solid var(--border)'
                      }}>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{topic}</span>
                          <span style={{ fontSize: 12, color: 'var(--red)', marginLeft: 8 }}>{score}%</span>
                        </div>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}
                          onClick={() => navigate('/learning-path')}>
                          Learn →
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <p style={{ color: 'var(--green)', fontSize: 14 }}>🎉 No major gaps detected! Consider advancing to a harder subject.</p>
                )}
              </div>

              {/* Quick actions */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: '🗺️', label: 'View Learning Path', path: '/learning-path' },
                    { icon: '🎯', label: 'View Skill Profile', path: '/skill-profile' },
                    { icon: '✏️', label: 'Practice Now', path: '/practice' },
                    { icon: '📈', label: 'View Progress', path: '/progress' },
                  ].map(a => (
                    <button key={a.path} onClick={() => navigate(a.path)}
                      className="btn btn-secondary"
                      style={{ justifyContent: 'flex-start', fontSize: 13, padding: '10px 14px' }}>
                      <span>{a.icon}</span> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* No scores yet */
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🚀</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Ready to Discover Your Competency Level?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px' }}>
            SkillPath AI will assess what you know, identify gaps, and create a personalized learning path — all in just 3 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-large pulse-glow" onClick={() => navigate('/subjects')}>
              📋 Start 3-Minute Assessment
            </button>
            <button className="btn btn-secondary btn-large" onClick={() => navigate('/ai-assistant')}>
              🤖 Ask AI Assistant
            </button>
          </div>
          <div className="grid-3" style={{ marginTop: 48, gap: 16 }}>
            {[
              { icon: '🎯', title: 'Smart Assessment', desc: '10 questions · 3 minutes · Mixed formats' },
              { icon: '🗺️', title: 'Personalized Path', desc: 'Learning path based on your specific gaps' },
              { icon: '📈', title: 'Track Progress', desc: 'See measurable improvement over time' },
            ].map(f => (
              <div key={f.title} className="card text-center" style={{ padding: '24px 16px' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
