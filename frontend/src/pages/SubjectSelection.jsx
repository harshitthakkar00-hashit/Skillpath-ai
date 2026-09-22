import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { ALL_SUBJECTS } from '../data/subjects.js'

const CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Programming', value: 'prog' },
  { label: 'Web', value: 'web' },
  { label: 'Database', value: 'db' },
  { label: 'Tools', value: 'tools' },
]

const CATEGORY_MAP = {
  python: 'prog', javascript: 'web', java: 'prog', cpp: 'prog', c: 'prog',
  sql: 'db', html_css: 'web', react: 'web', dsa: 'prog',
  git: 'tools', typescript: 'web', dart: 'web',
}

export default function SubjectSelection() {
  const { setCurrentSubject } = useApp()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ALL_SUBJECTS.filter(s => {
    const matchCat = activeCategory === 'all' || CATEGORY_MAP[s.id] === activeCategory
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.fullName.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSelect = (subject) => {
    setCurrentSubject(subject.id)
    navigate('/assessment')
  }

  return (
    <div className="page-content fade-in">
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Select a Language / Subject</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Choose any language — SkillPath AI will assess your level and build a personalized learning path
        </p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 440, margin: '0 auto 24px' }}>
        <input className="input-field"
          placeholder="🔍  Search languages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 15 }}
        />
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
        {CATEGORIES.map(c => (
          <button key={c.value}
            onClick={() => setActiveCategory(c.value)}
            className={activeCategory === c.value ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: 13 }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Subject grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {filtered.map(subj => (
          <div key={subj.id}
            onClick={() => handleSelect(subj)}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${subj.color}30`,
              borderRadius: 16, padding: '22px 20px', cursor: 'pointer',
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 8px 30px ${subj.color}25`
              e.currentTarget.style.borderColor = subj.color + '80'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = subj.color + '30'
            }}>
            {/* Glow bg */}
            <div style={{
              position: 'absolute', top: -20, right: -20, width: 80, height: 80,
              background: `radial-gradient(circle, ${subj.color}20, transparent 70%)`,
              borderRadius: '50%', pointerEvents: 'none'
            }} />

            <div style={{ fontSize: 36, marginBottom: 10 }}>{subj.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{subj.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{subj.description}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: subj.color, fontWeight: 600 }}>
                {subj.topics.length} topics
              </span>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: subj.color + '20', color: subj.color, fontWeight: 600 }}>
                {subj.level.split(' ')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom info bar */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '⏱️', label: '3 minutes', sub: 'timed assessment' },
            { icon: '❓', label: '10 questions', sub: 'MCQ + Practical + Scenario' },
            { icon: '🧠', label: 'AI Analysis', sub: 'competency profile' },
            { icon: '🗺️', label: 'Custom Path', sub: 'based on your gaps' },
          ].map(i => (
            <div key={i.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 3 }}>{i.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{i.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{i.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
