/**
 * AdminPanel.jsx — Knowledge base management, analytics, system config.
 * Protected by admin token (ADMIN_TOKEN env var, default: skillpath-admin-2024).
 */

import React, { useState, useEffect } from 'react'

const ADMIN_TOKEN = 'skillpath-admin-2024' // Change this via ADMIN_TOKEN env var
const BASE = '/api'

async function adminFetch(path, options = {}) {
  try {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      ...options,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Admin API error:', err)
    return null
  }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'var(--blue)', icon }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: `rgba(${color === 'var(--blue)' ? '59,130,246' : color === 'var(--green)' ? '16,185,129' : color === 'var(--orange)' ? '245,158,11' : '139,92,246'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color }}>{value}</p>
        </div>
      </div>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
    </div>
  )
}

// ─── Bar Chart (pure CSS) ─────────────────────────────────────────────────────

function BarChart({ data, title }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.count || d.value || 0))
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.slice(0, 8).map((item, i) => {
          const val = item.count || item.value || 0
          const pct = max > 0 ? (val / max) * 100 : 0
          const name = item.name || item.error || item.key || `Item ${i+1}`
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</span>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--blue), var(--purple))', borderRadius: 4, transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Document Form ────────────────────────────────────────────────────────────

function DocumentForm({ doc, onSave, onCancel }) {
  const [form, setForm] = useState(doc || {
    title: '', category: 'Language Fundamentals', language: 'Python',
    difficulty: 'Beginner', tags: '', summary: '', content: '', code_example: '',
    practice_question: ''
  })

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = () => {
    if (!form.title || !form.content) { alert('Title and content are required.'); return }
    const payload = {
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
    }
    onSave(payload)
  }

  const inputStyle = { width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 }
  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
      <label style={labelStyle}>Title *</label>
      <input style={inputStyle} value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Python List Comprehensions" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={form.category} onChange={e => handleChange('category', e.target.value)}>
            {['Language Fundamentals','OOP','Data Structures & Algorithms','Web Development','Mobile Development','Backend','Databases','AI & Machine Learning','DevOps & Cloud','Computer Science Subjects','Errors','System Design','Security'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Language</label>
          <input style={{ ...inputStyle, marginBottom: 0 }} value={form.language} onChange={e => handleChange('language', e.target.value)} placeholder="Python" />
        </div>
        <div>
          <label style={labelStyle}>Difficulty</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={form.difficulty} onChange={e => handleChange('difficulty', e.target.value)}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </div>
      </div>

      <label style={labelStyle}>Tags (comma-separated)</label>
      <input style={inputStyle} value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => handleChange('tags', e.target.value)} placeholder="python, loops, syntax" />

      <label style={labelStyle}>Summary (1-2 sentences)</label>
      <input style={inputStyle} value={form.summary} onChange={e => handleChange('summary', e.target.value)} placeholder="Brief description of this topic" />

      <label style={labelStyle}>Content * (Markdown)</label>
      <textarea style={{ ...inputStyle, height: 180, resize: 'vertical' }} value={form.content} onChange={e => handleChange('content', e.target.value)} placeholder="Full explanation in Markdown format..." />

      <label style={labelStyle}>Code Example</label>
      <textarea style={{ ...inputStyle, height: 120, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} value={form.code_example} onChange={e => handleChange('code_example', e.target.value)} placeholder="# Python code example..." />

      <label style={labelStyle}>Practice Question</label>
      <input style={inputStyle} value={form.practice_question} onChange={e => handleChange('practice_question', e.target.value)} placeholder="A challenge for the student..." />

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}>
          {doc ? '💾 Update Document' : '+ Add Document'}
        </button>
        <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
      </div>
    </div>
  )
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [tab, setTab] = useState('analytics')
  const [analytics, setAnalytics] = useState(null)
  const [config, setConfig] = useState(null)
  const [docs, setDocs] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDocForm, setShowDocForm] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [searchDoc, setSearchDoc] = useState('')
  const [msg, setMsg] = useState(null)

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3000)
  }

  useEffect(() => {
    loadTab(tab)
  }, [tab])

  const loadTab = async (t) => {
    setLoading(true)
    if (t === 'analytics') {
      const [a, c] = await Promise.all([
        adminFetch('/admin/analytics'),
        adminFetch('/admin/system/config'),
      ])
      setAnalytics(a)
      setConfig(c)
    } else if (t === 'knowledge') {
      const res = await adminFetch('/admin/knowledge-base')
      setDocs(res?.documents || [])
    } else if (t === 'sessions') {
      const res = await adminFetch('/admin/conversations')
      setSessions(res?.sessions || [])
    }
    setLoading(false)
  }

  const handleAddDoc = async (payload) => {
    const res = await adminFetch('/admin/knowledge-base', {
      method: 'POST', body: JSON.stringify(payload)
    })
    if (res?.success) {
      showMsg('Document added successfully!')
      setShowDocForm(false)
      loadTab('knowledge')
    } else {
      showMsg('Failed to add document.', 'error')
    }
  }

  const handleUpdateDoc = async (payload) => {
    const res = await adminFetch(`/admin/knowledge-base/${editDoc.id}`, {
      method: 'PUT', body: JSON.stringify(payload)
    })
    if (res?.success) {
      showMsg('Document updated!')
      setEditDoc(null)
      loadTab('knowledge')
    } else {
      showMsg('Failed to update.', 'error')
    }
  }

  const handleDeleteDoc = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    const res = await adminFetch(`/admin/knowledge-base/${id}`, { method: 'DELETE' })
    if (res?.success) {
      showMsg('Document deleted.')
      setDocs(prev => prev.filter(d => d.id !== id))
    } else {
      showMsg('Failed to delete.', 'error')
    }
  }

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this conversation?')) return
    const res = await adminFetch(`/admin/conversations/${id}`, { method: 'DELETE' })
    if (res?.success) {
      showMsg('Session deleted.')
      setSessions(prev => prev.filter(s => s.id !== id))
    }
  }

  const filteredDocs = docs.filter(d =>
    d.title?.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.language?.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.category?.toLowerCase().includes(searchDoc.toLowerCase())
  )

  const tabs = [
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'knowledge', label: '📚 Knowledge Base' },
    { id: 'sessions',  label: '💬 Conversations' },
    { id: 'config',    label: '⚙️ System Config' },
  ]

  return (
    <div className="page-content fade-in" style={{ maxWidth: 1200 }}>
      {/* Toast */}
      {msg && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 9999, background: msg.type === 'error' ? 'var(--red)' : 'var(--green)', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease' }}>
          {msg.type === 'error' ? '❌ ' : '✅ '}{msg.text}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">🔧 Admin Panel</h1>
        <p className="section-sub">Manage the AI Educational Assistant — knowledge base, analytics, configuration</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${tab === t.id ? 'var(--blue)' : 'var(--border)'}`, background: tab === t.id ? 'rgba(59,130,246,0.12)' : 'transparent', color: tab === t.id ? 'var(--blue)' : 'var(--text-secondary)', fontWeight: tab === t.id ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {!loading && tab === 'analytics' && analytics && (
        <div>
          {/* Stats grid */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <StatCard label="Total Queries" value={analytics.total_queries} icon="💬" color="var(--blue)" sub={`${analytics.success_rate}% success rate`} />
            <StatCard label="Avg Response" value={`${analytics.average_response_ms}ms`} icon="⚡" color="var(--green)" sub="Average AI latency" />
            <StatCard label="Failed" value={analytics.failed_queries} icon="❌" color="var(--red)" sub={`${analytics.total_queries - analytics.failed_queries} successful`} />
            <StatCard label="Knowledge Docs" value={config?.knowledge_base_size || 0} icon="📚" color="var(--purple)" sub="RAG documents indexed" />
          </div>

          {/* Charts */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <BarChart data={analytics.top_languages?.map(l => ({ name: l.name, count: l.count }))} title="Top Languages" />
            </div>
            <div className="card">
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Mode Distribution</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(analytics.mode_distribution || {}).map(([mode, count]) => {
                  const total = Object.values(analytics.mode_distribution).reduce((a, b) => a + b, 0)
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  const modeLabels = { tutor: '📘 Tutor', debugger: '🐛 Debugger', 'project-architect': '🏗️ Project', converter: '🔄 Converter', practice: '🎯 Practice', interview: '💼 Interview', roadmap: '🗺️ Roadmap' }
                  return (
                    <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 110, flexShrink: 0 }}>{modeLabels[mode] || mode}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--purple), var(--blue))', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 44, textAlign: 'right' }}>{count} ({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Common errors */}
          <div className="card" style={{ marginBottom: 24 }}>
            <BarChart data={analytics.common_errors?.map(e => ({ name: e.error, count: e.count }))} title="Most Common Errors Asked About" />
          </div>

          {/* Recent activity */}
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Recent Activity</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Time', 'Language', 'Mode', 'Latency', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(analytics.recent_activity || []).map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
                      <td style={{ padding: '7px 12px', color: 'var(--text-muted)', fontSize: 12 }}>{new Date(a.timestamp * 1000).toLocaleTimeString()}</td>
                      <td style={{ padding: '7px 12px', color: 'var(--text-secondary)' }}>{a.language}</td>
                      <td style={{ padding: '7px 12px', color: 'var(--text-secondary)' }}>{a.mode}</td>
                      <td style={{ padding: '7px 12px', color: 'var(--text-secondary)' }}>{a.latency_ms}ms</td>
                      <td style={{ padding: '7px 12px' }}>
                        <span className={`badge ${a.success ? 'badge-green' : 'badge-red'}`}>{a.success ? '✓ OK' : '✗ Fail'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Knowledge Base Tab ── */}
      {!loading && tab === 'knowledge' && (
        <div>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input value={searchDoc} onChange={e => setSearchDoc(e.target.value)} placeholder="Search documents..."
                className="input-field" style={{ width: 280, padding: '9px 14px', fontSize: 13 }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filteredDocs.length} documents</span>
            </div>
            <button onClick={() => setShowDocForm(true)} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
              + Add Document
            </button>
          </div>

          {/* Add form modal */}
          {showDocForm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>+ Add Knowledge Base Document</h2>
                <DocumentForm onSave={handleAddDoc} onCancel={() => setShowDocForm(false)} />
              </div>
            </div>
          )}

          {/* Edit form modal */}
          {editDoc && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>✏️ Edit Document</h2>
                <DocumentForm doc={{ ...editDoc, tags: editDoc.tags?.join(', ') }} onSave={handleUpdateDoc} onCancel={() => setEditDoc(null)} />
              </div>
            </div>
          )}

          {/* Documents table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  {['Title', 'Category', 'Language', 'Difficulty', 'Tags', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: 220 }}>
                      <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.summary}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{doc.category}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge badge-blue" style={{ fontSize: 11 }}>{doc.language}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${doc.difficulty === 'Beginner' ? 'badge-green' : doc.difficulty === 'Advanced' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 11 }}>
                        {doc.difficulty}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                      {doc.tags?.slice(0, 3).join(', ')}{doc.tags?.length > 3 ? '...' : ''}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setEditDoc(doc)}
                          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 10px', color: 'var(--red)', cursor: 'pointer', fontSize: 12 }}>
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocs.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                {searchDoc ? `No documents matching "${searchDoc}"` : 'No documents in knowledge base yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Conversations Tab ── */}
      {!loading && tab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              {sessions.length} active conversation sessions (private content hidden)
            </p>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  {['Session', 'Language', 'Mode', 'Messages', 'Last Active', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(sess => (
                  <tr key={sess.id} style={{ borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{sess.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{sess.id}</p>
                    </td>
                    <td style={{ padding: '12px 16px' }}><span className="badge badge-blue" style={{ fontSize: 11 }}>{sess.language}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{sess.mode}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{sess.message_count}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                      {sess.updated_at ? new Date(sess.updated_at * 1000).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleDeleteSession(sess.id)}
                        style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 10px', color: 'var(--red)', cursor: 'pointer', fontSize: 12 }}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sessions.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No active sessions.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Config Tab ── */}
      {!loading && tab === 'config' && config && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* System status */}
          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16 }}>System Status</p>
            <div className="grid-2">
              {[
                { label: 'AI Provider', value: config.ai_provider, ok: config.ai_available },
                { label: 'AI Available', value: config.ai_available ? '✅ Connected' : '⚠️ Fallback Mode', ok: config.ai_available },
                { label: 'RAG Enabled', value: config.rag_enabled ? '✅ Active' : '❌ Disabled', ok: config.rag_enabled },
                { label: 'Knowledge Docs', value: config.knowledge_base_size, ok: config.knowledge_base_size > 0 },
                { label: 'Conversation Memory', value: config.conversation_memory ? '✅ On' : '❌ Off', ok: config.conversation_memory },
                { label: 'Analytics', value: config.analytics_enabled ? '✅ On' : '❌ Off', ok: config.analytics_enabled },
                { label: 'Max Upload', value: `${config.max_upload_mb} MB`, ok: true },
                { label: 'Allowed Origins', value: config.allowed_origins, ok: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: item.ok ? 'var(--text-primary)' : 'var(--orange)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported languages */}
          <div className="card">
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16 }}>Supported Languages ({config.supported_languages?.length})</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {config.supported_languages?.map(lang => (
                <span key={lang} className="badge badge-blue" style={{ fontSize: 12 }}>{lang}</span>
              ))}
            </div>
          </div>

          {/* Env instructions */}
          {!config.ai_available && (
            <div className="card" style={{ border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.05)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange)', marginBottom: 12 }}>⚠️ AI Not Connected — Action Required</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                The AI is running in fallback mode. To connect Gemini AI, add your API key to the backend:
              </p>
              <pre style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, fontSize: 12, fontFamily: 'monospace', color: '#93c5fd' }}>
{`# skillpath-ai/backend/.env
GEMINI_API_KEY=your_actual_api_key_here
SECRET_KEY=your_secret_key_here
ALLOWED_ORIGINS=http://localhost:5173
ADMIN_TOKEN=skillpath-admin-2024`}
              </pre>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Get your free API key at: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>https://makersuite.google.com/app/apikey</a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
