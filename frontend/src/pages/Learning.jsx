import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { LEARNING_CONTENT } from '../data/learningContent.js'
import { getContent } from '../data/allLearningContent.js'

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div style={{ position: 'relative', margin: '16px 0' }}>
      <div style={{
        background: '#0a0f1a', border: '1px solid var(--border)',
        borderRadius: 10, overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid var(--border)', background: '#0d1424' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Python</span>
          <button onClick={copy} style={{
            background: 'none', border: 'none', color: copied ? 'var(--green)' : 'var(--text-muted)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit'
          }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre style={{ padding: '16px', margin: 0, fontSize: 13, lineHeight: 1.8, color: '#e2e8f0', overflowX: 'auto', fontFamily: 'monospace' }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}

function renderContent(text) {
  if (!text) return null
  const parts = text.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
      return <CodeBlock key={i} code={code} />
    }
    // Bold
    const bold = part.split(/(\*\*[^*]+\*\*)/g).map((s, j) => {
      if (s.startsWith('**') && s.endsWith('**')) {
        return <strong key={j} style={{ color: 'var(--text-primary)' }}>{s.slice(2, -2)}</strong>
      }
      return s
    })
    return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{bold}</span>
  })
}

export default function Learning() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const { completeModule, completedModules } = useApp()

  // Map URL param to content — check multi-language store first, fall back to Python store
  const topicMap = {
    'python-basics': 'Python Basics', 'loops': 'Loops', 'functions': 'Functions',
    'oop': 'OOP', 'file-handling': 'File Handling',
    'js-basics': 'JS Basics', 'async-js': 'Async JS', 'functions-scope': 'Functions & Scope',
    'java-basics': 'Java Basics', 'cpp-basics': 'C++ Basics', 'c-basics': 'C Basics',
    'sql-basics': 'SQL Basics', 'html-basics': 'HTML Basics', 'react-basics': 'React Basics',
    'ts-basics': 'TS Basics', 'dart-basics': 'Dart Basics',
    'arrays-strings': 'Arrays & Strings', 'git-basics': 'Git Basics',
  }
  const topicKey = topicMap[topicId] || topicId?.replace(/-/g, ' ') || 'OOP'
  const { currentSubject } = useApp()
  const content = getContent(currentSubject, topicKey) || LEARNING_CONTENT[topicKey]
  const isDone = completedModules.includes(topicId || topicKey)

  if (!content) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--text-secondary)' }}>Content for this topic is not available yet.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/learning-path')}>Back to Path</button>
      </div>
    )
  }

  const handleMarkComplete = () => {
    completeModule(topicId || topicKey)
    setTimeout(() => navigate('/learning-path'), 500)
  }

  return (
    <div className="page-content fade-in" style={{ maxWidth: 840 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <div style={{ fontSize: 40 }}>{content.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-blue">{content.difficulty}</span>
            <span className="badge badge-purple">⏱ {content.duration}</span>
            {isDone && <span className="badge badge-green">✓ Completed</span>}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>{content.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{content.summary}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/learning-path')}>← Back to Path</button>
      </div>

      {/* Explanation */}
      <div className="card" style={{ marginBottom: 20, padding: '24px 28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--blue)' }}>📖 Explanation</h3>
        <div style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text-secondary)' }}>
          {renderContent(content.explanation)}
        </div>
      </div>

      {/* Key points */}
      <div className="card" style={{ marginBottom: 20, padding: '22px 28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--purple)' }}>⭐ Key Points</h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {content.keyPoints.map((p, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'linear-gradient(135deg, var(--blue), var(--purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0, marginTop: 1
              }}>{i + 1}</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Example */}
      <div className="card" style={{ marginBottom: 20, padding: '22px 28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: 'var(--green)' }}>💡 Complete Example</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>A practical example you can run:</p>
        <CodeBlock code={content.example} />
      </div>

      {/* Practice challenge */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1))',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: 14, padding: '22px 28px', marginBottom: 24
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--orange)' }}>🎯 Your Turn — Practice Challenge</h3>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{content.practicePrompt}</p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-large" style={{ flex: 1 }}
          onClick={() => navigate('/practice')}>
          ✏️ Start Practice
        </button>
        <button className="btn btn-large"
          style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))', color: 'white' }}
          onClick={() => navigate('/ai-assistant')}>
          🤖 Ask AI
        </button>
        <button
          className={isDone ? 'btn btn-secondary btn-large' : 'btn btn-green btn-large'}
          onClick={handleMarkComplete}
          disabled={isDone}>
          {isDone ? '✓ Completed' : '✓ Mark Complete'}
        </button>
      </div>
    </div>
  )
}
