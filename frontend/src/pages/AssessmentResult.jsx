import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getScoreColor, getFillClass, getTopicBadge, getCompetencyLevel, identifySkillGaps } from '../services/scoringEngine.js'

export default function AssessmentResult() {
  const { scores } = useApp()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 400)
    return () => clearTimeout(t)
  }, [])

  if (!scores) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--text-secondary)' }}>No assessment results found.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/subjects')}>
          Take Assessment
        </button>
      </div>
    )
  }

  const { overall, level, topics } = scores
  const { strong, needsPractice, gaps } = identifySkillGaps(topics)

  const levelColor = level === 'Advanced' ? 'var(--green)' : level === 'Intermediate' ? 'var(--orange)' : 'var(--red)'

  return (
    <div className="page-content fade-in" style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Assessment Complete!</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's your personalized competency analysis</p>
      </div>

      {/* Score hero */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
        border: '1px solid var(--border-light)', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', padding: '32px 36px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: getScoreColor(overall), lineHeight: 1 }}>
            {show ? overall : 0}%
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Overall Competency</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Competency Level</span>
            <div style={{ fontSize: 28, fontWeight: 800, color: levelColor }}>{level}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--green-glow)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{strong.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Strong</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--orange-glow)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)' }}>{needsPractice.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Needs Practice</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--red-glow)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)' }}>{gaps.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Skill Gaps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>📚 Topic-wise Scores</h3>
        {Object.entries(topics).map(([topic, score]) => {
          const badge = getTopicBadge(score)
          return (
            <div key={topic} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{topic}</span>
                  <span className={`badge ${badge.cls}`}>{badge.label}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: getScoreColor(score) }}>{score}%</span>
              </div>
              <div className="progress-bar-wrap" style={{ height: 10 }}>
                <div className={`progress-bar-fill ${getFillClass(score)}`}
                  style={{ width: show ? `${score}%` : '0%', transition: 'width 1s ease' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { color: 'var(--green)', label: '70–100% · Strong' },
          { color: 'var(--orange)', label: '40–69% · Needs Practice' },
          { color: 'var(--red)', label: '0–39% · Skill Gap' },
        ].map(i => (
          <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: i.color }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{i.label}</span>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-large" style={{ flex: 1 }}
          onClick={() => navigate('/learning-path')}>
          🗺️ View My Personalized Learning Path
        </button>
        <button className="btn btn-secondary btn-large"
          onClick={() => navigate('/skill-gaps')}>
          🎯 Skill Gap Analysis
        </button>
        <button className="btn btn-secondary"
          onClick={() => navigate('/skill-profile')}>
          📊 Full Profile
        </button>
      </div>
    </div>
  )
}
