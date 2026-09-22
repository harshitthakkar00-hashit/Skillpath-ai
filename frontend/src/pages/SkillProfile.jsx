import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { getScoreColor, getFillClass, getTopicBadge, getCompetencyLevel } from '../services/scoringEngine.js'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

export default function SkillProfile() {
  const { scores, isDemo } = useApp()
  const navigate = useNavigate()
  const s = scores || (isDemo ? DEMO_SCORES : null)

  if (!s) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
        <h2>No profile yet</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Complete an assessment to see your skill profile.</p>
        <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Start Assessment</button>
      </div>
    )
  }

  const radarData = Object.entries(s.topics).map(([topic, score]) => ({
    topic: topic.replace(' ', '\n'), score, fullMark: 100
  }))

  const levelColor = s.level === 'Advanced' ? 'var(--green)' : s.level === 'Intermediate' ? 'var(--orange)' : 'var(--red)'

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🎯 Skill Profile</h1>
        <p className="section-sub">Your current competency across all assessed topics</p>
      </div>

      {/* Profile header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div className="card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--blue), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, flexShrink: 0
            }}>
              {s.overall}
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Overall Competency</p>
              <p style={{ fontSize: 36, fontWeight: 900, color: getScoreColor(s.overall) }}>{s.overall}%</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: levelColor }}>{s.level}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· Python Programming</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Strong', count: Object.values(s.topics).filter(v => v >= 70).length, color: 'var(--green)', bg: 'var(--green-glow)' },
              { label: 'Practice', count: Object.values(s.topics).filter(v => v >= 40 && v < 70).length, color: 'var(--orange)', bg: 'var(--orange-glow)' },
              { label: 'Gaps', count: Object.values(s.topics).filter(v => v < 40).length, color: 'var(--red)', bg: 'var(--red-glow)' },
            ].map(i => (
              <div key={i.label} style={{
                textAlign: 'center', padding: '14px 8px', borderRadius: 10,
                background: i.bg, border: `1px solid ${i.color}30`
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: i.color }}>{i.count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{i.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="card" style={{ padding: '20px 16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>Competency Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip
                formatter={(val) => [`${val}%`, 'Competency']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic cards */}
      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Topic Breakdown</h3>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {Object.entries(s.topics).map(([topic, score]) => {
          const badge = getTopicBadge(score)
          return (
            <div key={topic} className="card" style={{
              borderColor: score >= 70 ? 'rgba(16,185,129,0.3)' : score >= 40 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
              padding: '20px 22px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{topic}</span>
                <span className={`badge ${badge.cls}`}>{badge.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: getScoreColor(score), marginBottom: 10 }}>{score}%</div>
              <div className="progress-bar-wrap" style={{ height: 6 }}>
                <div className={`progress-bar-fill ${getFillClass(score)}`} style={{ width: `${score}%` }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-secondary w-full" style={{ fontSize: 12, padding: '8px 0' }}
                  onClick={() => navigate('/learning-path')}>
                  {score >= 70 ? '✓ Mastered' : score >= 40 ? '📚 Continue Learning' : '⚡ Start Learning'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/skill-gaps')}>🎯 View Skill Gaps</button>
        <button className="btn btn-secondary" onClick={() => navigate('/learning-path')}>🗺️ Learning Path</button>
        <button className="btn btn-secondary" onClick={() => navigate('/subjects')}>📋 Retake Assessment</button>
      </div>
    </div>
  )
}
