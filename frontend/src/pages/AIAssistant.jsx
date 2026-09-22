import React, { useState, useRef, useEffect } from 'react'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { apiAIChat, getFallbackAIResponse } from '../services/api.js'

const QUICK_QUESTIONS = [
  'What is inheritance in Python?',
  'Explain polymorphism with an example',
  'How do I read a file in Python?',
  'What is the difference between a list and a tuple?',
  'Explain OOP encapsulation',
  'How do lambda functions work?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 12, marginBottom: 20,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      animation: 'fadeIn 0.3s ease'
    }}>
      {!isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--blue), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
        }}>🤖</div>
      )}
      <div style={{
        maxWidth: '78%', padding: '14px 18px', borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
        background: isUser
          ? 'linear-gradient(135deg, var(--blue), var(--purple))'
          : 'var(--bg-card)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.7
      }}>
        {msg.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <div key={i} style={{ fontWeight: 700, color: isUser ? 'white' : 'var(--text-primary)', marginTop: i > 0 ? 8 : 0 }}>{line.slice(2, -2)}</div>
          }
          if (line.startsWith('```') || line.endsWith('```')) return null
          if (line.startsWith('#')) {
            const text = line.replace(/^#+\s*/, '')
            return <div key={i} style={{ fontWeight: 700, fontSize: 15, marginTop: 8, marginBottom: 4 }}>{text}</div>
          }
          return <div key={i} style={{ marginTop: i > 0 && line === '' ? 8 : 0 }}>{line}</div>
        })}
        <div style={{ fontSize: 11, color: isUser ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginTop: 8 }}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
        }}>👤</div>
      )}
    </div>
  )
}

export default function AIAssistant() {
  const { scores, isDemo } = useApp()
  const s = scores || (isDemo ? DEMO_SCORES : null)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your SkillPath AI Learning Assistant.\n\nI know your current subject is **Python Programming** and I can see your skill profile. I'm here to help you understand concepts, answer questions, and guide your learning.\n\nWhat would you like to learn about today?`,
      ts: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentTopic, setCurrentTopic] = useState('OOP')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const context = {
        topic: currentTopic,
        subject: 'Python Programming',
        competency: s?.level || 'Intermediate',
        scores: s?.topics
      }

      const resp = await apiAIChat(msg, context)
      const reply = resp?.response || getFallbackAIResponse(msg, context)

      setMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }])
    } catch {
      const fallback = getFallbackAIResponse(msg, { topic: currentTopic })
      setMessages(prev => [...prev, { role: 'assistant', content: fallback, ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content fade-in" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">🤖 AI Learning Assistant</h1>
        <p className="section-sub">Focused on your current topic — ask anything about Python Programming</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>
        {/* Chat area */}
        <div>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, height: 500, overflowY: 'auto',
            padding: '20px 20px 12px', marginBottom: 12
          }}>
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            {loading && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)',
                        animation: `bounce 0.8s ${i * 0.15}s ease infinite`
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input-field"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about any Python concept…"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ padding: '12px 20px', opacity: (!input.trim() || loading) ? 0.5 : 1 }}>
              Send →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Topic selector */}
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Current Topic</p>
            {['OOP', 'File Handling', 'Functions', 'Loops', 'Python Basics'].map(t => (
              <button key={t} onClick={() => setCurrentTopic(t)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                  background: currentTopic === t ? 'rgba(59,130,246,0.15)' : 'transparent',
                  border: `1px solid ${currentTopic === t ? 'var(--blue)' : 'transparent'}`,
                  color: currentTopic === t ? 'var(--blue)' : 'var(--text-secondary)',
                  fontWeight: currentTopic === t ? 600 : 400, fontSize: 13, cursor: 'pointer'
                }}>
                {currentTopic === t ? '● ' : '○ '}{t}
              </button>
            ))}
          </div>

          {/* Quick questions */}
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Questions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{
                    textAlign: 'left', padding: '8px 10px', borderRadius: 8, fontSize: 12,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
                    lineHeight: 1.4
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.color = 'var(--blue)' }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Context pill */}
          {s && (
            <div className="card" style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Your Context</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Level: <strong style={{ color: 'var(--orange)' }}>{s.level}</strong></p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Score: <strong style={{ color: 'var(--blue)' }}>{s.overall}%</strong></p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>AI uses this to personalize answers</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
