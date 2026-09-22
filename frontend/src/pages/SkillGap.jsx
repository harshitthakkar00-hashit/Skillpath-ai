import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { identifySkillGaps, getScoreColor, getFillClass, getGapExplanation } from '../services/scoringEngine.js'

function GapCard({ topic, score, category }) {
  const navigate = useNavigate()
  const colorMap = { strong: 'var(--green)', practice: 'var(--orange)', gap: 'var(--red)' }
  const bgMap = { strong: 'var(--green-glow)', practice: 'var(--orange-glow)', gap: 'var(--red-glow)' }
  const borderMap = { strong: 'rgba(16,185,129,0.3)', practice: 'rgba(245,158,11,0.3)', gap: 'rgba(239,68,68,0.3)' }

  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${borderMap[category]}`,
      borderRadius: 14, padding: '20px 22px', transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700 }}>{topic}</h4>
        <span style={{
          fontSize: 20, fontWeight: 800, color: colorMap[category]
        }}>{score}%</span>
      </div>

      <div className="progress-bar-wrap" style={{ marginBottom: 12 }}>
        <div className={`progress-bar-fill ${getFillClass(score)}`} style={{ width: `${score}%` }} />
      </div>

      {category !== 'strong' && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
            {getGapExplanation(topic, score)}
          </p>
          <div style={{
            background: bgMap[category], border: `1px solid ${borderMap[category]}`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 14
          }}>
            <p style={{ fontSize: 12, color: colorMap[category], fontWeight: 600, marginBottom: 4 }}>
              {category === 'gap' ? '⚠️ Why this is a major gap' : '💡 Why this needs practice'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Current score ({score}%) is {category === 'gap' ? 'below 40% — classified as a skill gap' : 'between 40–69% — needs more practice to reach Advanced level'}.
            </p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>📚 Recommended Learning Steps:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {topic === 'OOP' && ['OOP Basics', 'Classes & Objects', 'Inheritance', 'Polymorphism', 'Practice'].map(s => (
                <span key={s} className="badge badge-blue">{s}</span>
              ))}
              {topic === 'File Handling' && ['File Modes', 'Read/Write', 'Context Manager', 'JSON', 'Practice'].map(s => (
                <span key={s} className="badge badge-blue">{s}</span>
              ))}
              {topic === 'Functions' && ['Function Basics', 'Parameters', 'Return Values', 'Lambda', 'Practice'].map(s => (
                <span key={s} className="badge badge-blue">{s}</span>
              ))}
              {!['OOP', 'File Handling', 'Functions'].includes(topic) && ['Review Basics', 'Practice', 'Assessment'].map(s => (
                <span key={s} className="badge badge-blue">{s}</span>
              ))}
            </div>
          </div>
          <button className="btn btn-primary w-full" style={{ fontSize: 13, padding: '10px' }}
            onClick={() => navigate('/learning-path')}>
            ⚡ Start Learning {topic} →
          </button>
        </>
      )}

      {category === 'strong' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <span className="badge badge-green">✓ Mastered</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Keep it up!</span>
        </div>
      )}
    </div>
  )
}

export default function SkillGap() {
  const { scores, isDemo } = useApp()
  const navigate = useNavigate()
  const s = scores || (isDemo ? DEMO_SCORES : null)

  if (!s) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
        <h2>No data yet</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Take an assessment first.</p>
        <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Start Assessment</button>
      </div>
    )
  }

  const { strong, needsPractice, gaps } = identifySkillGaps(s.topics)

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🎯 Skill Gap Analysis</h1>
        <p className="section-sub">Detailed breakdown of your strengths, areas to practice, and major knowledge gaps</p>
      </div>

      {/* Summary stats */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {[
          { icon: '💚', label: 'Strong Areas', count: strong.length, color: 'var(--green)', bg: 'var(--green-glow)', border: 'rgba(16,185,129,0.3)' },
          { icon: '🟡', label: 'Needs Practice', count: needsPractice.length, color: 'var(--orange)', bg: 'var(--orange-glow)', border: 'rgba(245,158,11,0.3)' },
          { icon: '🔴', label: 'Major Skill Gaps', count: gaps.length, color: 'var(--red)', bg: 'var(--red-glow)', border: 'rgba(239,68,68,0.3)' },
        ].map(i => (
          <div key={i.label} style={{
            background: i.bg, border: `1px solid ${i.border}`, borderRadius: 14, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{ fontSize: 32 }}>{i.icon}</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: i.color }}>{i.count}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{i.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Strong */}
      {strong.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            ✅ Strong Areas
          </h2>
          <div className="grid-2">
            {strong.map(({ topic, score }) => <GapCard key={topic} topic={topic} score={score} category="strong" />)}
          </div>
        </div>
      )}

      {/* Needs practice */}
      {needsPractice.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚡ Needs Practice
          </h2>
          <div className="grid-2">
            {needsPractice.map(({ topic, score }) => <GapCard key={topic} topic={topic} score={score} category="practice" />)}
          </div>
        </div>
      )}

      {/* Major gaps */}
      {gaps.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🚨 Major Skill Gaps — Priority Learning Required
          </h2>
          <div className="grid-2">
            {gaps.map(({ topic, score }) => <GapCard key={topic} topic={topic} score={score} category="gap" />)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/learning-path')}>🗺️ Go to My Learning Path</button>
        <button className="btn btn-secondary" onClick={() => navigate('/practice')}>✏️ Start Practicing</button>
      </div>
    </div>
  )
}
