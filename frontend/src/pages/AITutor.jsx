/**
 * AITutor.jsx — Complete AI Educational Assistant UI
 * Features: markdown rendering, syntax highlighting, file upload,
 * conversation history, suggested prompts, dark/light mode, copy code,
 * regenerate, stop, session management, level/language selectors.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useApp } from '../context/AppContext.jsx'
import {
  apiAIChat, apiUploadFile, apiGetSessions, apiCreateSession,
  apiDeleteSession, apiGetSuggestedPrompts, apiFetchSessionById,
  getFallbackAIResponse
} from '../services/api.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES = [
  { value: 'tutor',     label: '📘 Tutor',      desc: 'Explain concepts' },
  { value: 'debugger',  label: '🐛 Debugger',   desc: 'Fix bugs & errors' },
  { value: 'project',   label: '🏗️ Project',    desc: 'Build projects' },
  { value: 'converter', label: '🔄 Converter',  desc: 'Convert code' },
  { value: 'roadmap',   label: '🗺️ Roadmap',    desc: 'Learning paths' },
  { value: 'practice',  label: '🎯 Practice',   desc: 'Quizzes & MCQs' },
  { value: 'interview', label: '💼 Interview',  desc: 'Interview prep' },
]

const LANGUAGES = [
  'General', 'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C', 'C#',
  'Go', 'Rust', 'Ruby', 'PHP', 'Kotlin', 'Swift', 'Dart / Flutter',
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js',
  'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', '.NET',
  'SQL / MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'TensorFlow', 'PyTorch', 'Scikit-learn',
  'HTML / CSS', 'Bash / Shell', 'PowerShell', 'R', 'Scala', 'Lua',
  'Docker', 'Kubernetes', 'Git / GitHub',
  'Data Structures & Algorithms', 'System Design', 'Computer Networks',
  'Operating Systems', 'Cybersecurity', 'Cloud Computing',
]

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const DEFAULT_PROMPTS = [
  { category: 'Explain', icon: '📘', prompts: ['What is inheritance in Java?', 'Explain recursion with examples', 'What is Big O notation?', 'Explain SQL JOINs', 'What are React hooks?'] },
  { category: 'Debug',   icon: '🐛', prompts: ['Fix NullPointerException in Java', 'Why does Python throw IndexError?', 'My React component is not re-rendering', 'Fix this SQL syntax error'] },
  { category: 'Code',    icon: '💻', prompts: ['Write binary search in Python', 'Create linked list in Java', 'Build a REST API with FastAPI', 'Write a React component with hooks'] },
  { category: 'Project', icon: '🏗️', prompts: ['Create Student Management System with Spring Boot', 'Build full-stack Todo app with React and Node.js', 'Create Chat app with WebSockets'] },
  { category: 'Learn',   icon: '🗺️', prompts: ['Give me Python learning roadmap', 'How to learn full-stack development?', 'What is the roadmap for ML/AI?'] },
  { category: 'Practice',icon: '🎯', prompts: ['Give me 5 Python MCQ questions', 'Ask me Java interview questions', 'Give me DSA coding challenges'] },
]

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}

// ─── Code Block Component ─────────────────────────────────────────────────────

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const language = (className || '').replace('language-', '') || 'code'
  const code = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    copyToClipboard(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const ext = { python: 'py', javascript: 'js', typescript: 'ts', java: 'java',
      cpp: 'cpp', c: 'c', html: 'html', css: 'css', sql: 'sql', bash: 'sh',
      dart: 'dart', kotlin: 'kt', swift: 'swift', go: 'go', rust: 'rs' }
    const fileExt = ext[language] || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `code.${fileExt}`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ position: 'relative', marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e2d42', padding: '7px 14px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>{language}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleDownload} title="Download"
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', padding: '3px 9px', fontSize: 11, cursor: 'pointer' }}>
            ⬇ Download
          </button>
          <button onClick={handleCopy} title="Copy code"
            style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'transparent', border: `1px solid ${copied ? 'var(--green)' : 'var(--border)'}`, borderRadius: 6, color: copied ? 'var(--green)' : 'var(--text-muted)', padding: '3px 9px', fontSize: 11, cursor: 'pointer', transition: 'all 0.2s' }}>
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        </div>
      </div>
      {/* Code */}
      <pre style={{ margin: 0, overflowX: 'auto', background: '#0d1b2e', padding: '16px 18px' }}>
        <code style={{ fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: 13, lineHeight: 1.7, color: '#e2e8f0', display: 'block' }}>
          {code}
        </code>
      </pre>
    </div>
  )
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function MarkdownContent({ content }) {
  return (
    <div className="md-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            if (inline) {
              return (
                <code style={{ background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '1px 6px', borderRadius: 4, fontFamily: "'Fira Code', monospace", fontSize: '0.9em' }} {...props}>
                  {children}
                </code>
              )
            }
            return <CodeBlock className={className}>{children}</CodeBlock>
          },
          table({ children }) {
            return (
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead style={{ background: 'rgba(59,130,246,0.1)' }}>{children}</thead>
          },
          th({ children }) {
            return <th style={{ padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-primary)' }}>{children}</th>
          },
          td({ children }) {
            return <td style={{ padding: '7px 14px', borderBottom: '1px solid rgba(30,58,95,0.5)', color: 'var(--text-secondary)' }}>{children}</td>
          },
          h1({ children }) { return <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 8, marginBottom: 12, color: 'var(--text-primary)' }}>{children}</h1> },
          h2({ children }) { return <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 16, marginBottom: 10, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>{children}</h2> },
          h3({ children }) { return <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 14, marginBottom: 8, color: '#93c5fd' }}>{children}</h3> },
          p({ children }) { return <p style={{ marginBottom: 10, lineHeight: 1.75, color: 'var(--text-secondary)' }}>{children}</p> },
          ul({ children }) { return <ul style={{ marginBottom: 12, paddingLeft: 22, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{children}</ul> },
          ol({ children }) { return <ol style={{ marginBottom: 12, paddingLeft: 22, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{children}</ol> },
          li({ children }) { return <li style={{ marginBottom: 4, lineHeight: 1.7 }}>{children}</li> },
          strong({ children }) { return <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{children}</strong> },
          blockquote({ children }) {
            return (
              <blockquote style={{ borderLeft: '3px solid var(--blue)', paddingLeft: 14, marginLeft: 0, marginBottom: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {children}
              </blockquote>
            )
          },
          hr() { return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} /> },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>{children}</a>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, onRegenerate }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopyMsg = () => {
    copyToClipboard(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: isUser ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.25s ease' }}>
      {!isUser && (
        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, alignSelf: 'flex-start', marginTop: 2 }}>
          🤖
        </div>
      )}
      <div style={{ maxWidth: isUser ? '72%' : '86%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ padding: isUser ? '12px 16px' : '14px 18px', borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: isUser ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'var(--bg-card)', border: isUser ? 'none' : '1px solid var(--border)', color: isUser ? 'white' : 'var(--text-primary)', fontSize: 14, lineHeight: 1.7, wordBreak: 'break-word' }}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          ) : (
            <MarkdownContent content={msg.content} />
          )}
          {/* Attachment tag */}
          {msg.file && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.1)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--blue)' }}>
              📎 {msg.file}
            </div>
          )}
        </div>
        {/* Action bar below AI message */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(msg.ts)}</span>
          {!isUser && (
            <>
              <button onClick={handleCopyMsg} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: copied ? 'var(--green)' : 'var(--text-muted)', padding: '2px 6px', borderRadius: 4 }}>
                {copied ? '✓' : '⎘'} Copy
              </button>
              {onRegenerate && (
                <button onClick={() => onRegenerate(msg.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', padding: '2px 6px', borderRadius: 4 }}>
                  ↺ Regenerate
                </button>
              )}
            </>
          )}
        </div>
        {/* RAG sources */}
        {msg.sources && msg.sources.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span>📚 Sources:</span>
            {msg.sources.map(s => (
              <span key={s.id} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 4, padding: '1px 6px', color: 'var(--blue)' }}>
                {s.title}
              </span>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, alignSelf: 'flex-start', marginTop: 2 }}>
          👤
        </div>
      )}
    </div>
  )
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', animation: `bounce 0.8s ${i * 0.15}s ease infinite` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Session List Item ────────────────────────────────────────────────────────

function SessionItem({ session, active, onSelect, onDelete }) {
  const [hovering, setHovering] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => onSelect(session.id)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: active ? 'rgba(59,130,246,0.12)' : hovering ? 'rgba(255,255,255,0.03)' : 'transparent', border: `1px solid ${active ? 'var(--blue)' : 'transparent'}`, marginBottom: 4, transition: 'all 0.15s' }}>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <p style={{ fontSize: 13, color: active ? 'var(--blue)' : 'var(--text-primary)', fontWeight: active ? 600 : 400, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session.title || 'New Chat'}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
          {session.language} · {session.message_count || 0} msgs
        </p>
      </div>
      {hovering && (
        <button onClick={e => { e.stopPropagation(); onDelete(session.id) }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '2px 5px', borderRadius: 4, flexShrink: 0 }}
          title="Delete session">✕</button>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AITutor() {
  const { scores, user, isDemo } = useApp()

  // Chat state
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [lastUserMsg, setLastUserMsg] = useState(null)

  // Sidebar state
  const [sessions, setSessions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('history') // 'history' | 'prompts'
  const [searchQuery, setSearchQuery] = useState('')

  // Config state
  const [mode, setMode] = useState('tutor')
  const [language, setLanguage] = useState('Python')
  const [level, setLevel] = useState('Intermediate')

  // File upload
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileQuestion, setFileQuestion] = useState('')
  const [showFilePanel, setShowFilePanel] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Refs
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const abortRef = useRef(null)

  // Auto-detect level from scores
  useEffect(() => {
    const s = scores
    if (s?.level) setLevel(s.level)
  }, [scores])

  // Load session history from backend on mount
  useEffect(() => {
    loadSessions()
    startNewChat()
  }, [])

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadSessions = async () => {
    const res = await apiGetSessions()
    if (res?.sessions) setSessions(res.sessions)
  }

  const startNewChat = () => {
    const greeting = `## 👋 Welcome to AI CS Tutor!

I'm your expert Computer Science & Programming tutor. I can help with **50+ languages, frameworks, databases, AI/ML, and CS subjects**.

### What would you like to do?
- 📘 **Learn** a concept with examples and practice
- 🐛 **Debug** your code or error messages
- 💻 **Generate** complete code examples or projects  
- 🗺️ **Get a roadmap** for learning a new technology
- 🎯 **Practice** with MCQs, coding challenges, or interview questions

**Try asking:**
- *"What is inheritance in Java?"*
- *"Build a REST API with FastAPI"*
- *"Fix my Python IndexError"*
- *"Give me a React learning roadmap"*

Select a **mode**, **language**, and **level** from the sidebar, then start chatting! 🚀`

    setMessages([{ id: 'welcome', role: 'assistant', content: greeting, ts: Date.now() }])
    setSessionId(null)
    setInput('')
    setUploadedFile(null)
  }

  const loadSession = async (sid) => {
    setSessionId(sid)
    const data = await apiFetchSessionById(sid)
    if (data?.messages) {
      setMessages(data.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        ts: m.ts,
        sources: m.metadata?.rag_sources,
      })))
    }
    await loadSessions()
  }

  const deleteSession = async (sid) => {
    await apiDeleteSession(sid)
    if (sessionId === sid) startNewChat()
    setSessions(prev => prev.filter(s => s.id !== sid))
  }

  const sendMessage = useCallback(async (text, regenerating = false) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    setInput('')
    setLastUserMsg(msg)

    // Add user message once
    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: msg, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const context = {
      mode, language, level,
      competency: level,
      topic: language,
      subject: language,
      scores: scores?.topics,
    }

    // Build history from current messages (exclude welcome)
    const historyMsgs = messages
      .filter(m => m.id !== 'welcome')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await apiAIChat(msg, context, sessionId, historyMsgs)

      // If backend returned null (network/proxy error), use client fallback
      if (!res) {
        const fallback = getFallbackAIResponse(msg, context)
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`, role: 'assistant', content: fallback, ts: Date.now(), sources: []
        }])
        return
      }

      const aiContent = res.response || '⚠️ Empty response from AI. Please try again.'
      const newSid = res.session_id || sessionId
      if (newSid && newSid !== sessionId) {
        setSessionId(newSid)
        loadSessions()
      }

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: aiContent,
        ts: Date.now(),
        sources: res.rag_sources || [],
      }])
    } catch (err) {
      console.error('sendMessage error:', err)
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: 'assistant',
        content: '⚠️ **Could not reach the AI backend.** Make sure the backend server is running on port 8000.\n\nRun this in a terminal:\n```bash\ncd skillpath-ai/backend\nuvicorn app.main:app --reload --port 8000\n```',
        ts: Date.now()
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, mode, language, level, sessionId, messages, scores])

  const handleFileUpload = async () => {
    if (!uploadedFile) return
    setUploading(true)
    const q = fileQuestion || `Please analyze this file: ${uploadedFile.name}`

    // Add user message showing file upload
    const userMsg = {
      id: `u-${Date.now()}`, role: 'user',
      content: `📎 **File: ${uploadedFile.name}**\n\n${q}`,
      ts: Date.now(), file: uploadedFile.name
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await apiUploadFile(uploadedFile, q, sessionId)
      const aiContent = res?.response || '⚠️ Could not analyze the file.'
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`, role: 'assistant', content: aiContent, ts: Date.now()
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: 'assistant',
        content: '⚠️ File upload failed. Please try again.',
        ts: Date.now()
      }])
    } finally {
      setUploading(false)
      setUploadedFile(null)
      setFileQuestion('')
      setShowFilePanel(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredSessions = sessions.filter(s =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.language?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const s = scores

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-content fade-in" style={{ maxWidth: '100%', padding: '0', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>

      {/* ── CSS ── */}
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-6px);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        .md-content { font-size: 14px; }
        .md-content > *:first-child { margin-top: 0 !important; }
        .md-content > *:last-child { margin-bottom: 0 !important; }
        .tutor-sidebar { width: 280px; flex-shrink: 0; border-right: 1px solid var(--border); background: var(--bg-secondary); display: flex; flex-direction: column; height: 100%; overflow: hidden; }
        .tutor-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .config-select { background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-primary); padding: 6px 10px; border-radius: 8px; font-size: 13px; width: 100%; cursor: pointer; }
        .config-select:focus { outline: none; border-color: var(--blue); }
        @media (max-width: 768px) {
          .tutor-sidebar { display: none; }
          .tutor-sidebar.mobile-open { display: flex; position: fixed; left:0; top:64px; bottom:0; z-index:200; width:280px; box-shadow: 4px 0 20px rgba(0,0,0,0.5); }
        }
      `}</style>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left Sidebar ── */}
        <div className={`tutor-sidebar${sidebarOpen ? '' : ' hidden'}`} style={{ width: sidebarOpen ? 280 : 0, transition: 'width 0.2s', overflow: sidebarOpen ? 'auto' : 'hidden' }}>
          {sidebarOpen && (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflow: 'auto' }}>

              {/* New Chat */}
              <button onClick={startNewChat} className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: 13, borderRadius: 10 }}>
                + New Chat
              </button>

              {/* Tab selector */}
              <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: 8, padding: 3 }}>
                {['history', 'prompts'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ flex: 1, padding: '6px 8px', borderRadius: 6, background: activeTab === tab ? 'var(--bg-card)' : 'transparent', border: 'none', color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 12, fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {tab === 'history' ? '🕐 History' : '💡 Prompts'}
                  </button>
                ))}
              </div>

              {/* History tab */}
              {activeTab === 'history' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="input-field" style={{ padding: '8px 12px', fontSize: 12 }}
                  />
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredSessions.length === 0 ? (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No conversations yet</p>
                    ) : (
                      filteredSessions.map(sess => (
                        <SessionItem key={sess.id} session={sess} active={sessionId === sess.id}
                          onSelect={loadSession} onDelete={deleteSession} />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Prompts tab */}
              {activeTab === 'prompts' && (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {DEFAULT_PROMPTS.map(cat => (
                    <div key={cat.category}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{cat.icon} {cat.category}</p>
                      {cat.prompts.map(p => (
                        <button key={p} onClick={() => sendMessage(p)}
                          style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 7, marginBottom: 4, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', lineHeight: 1.4, transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Configuration */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>⚙️ Configuration</p>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>MODE</label>
                  <select value={mode} onChange={e => setMode(e.target.value)} className="config-select">
                    {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>LANGUAGE / TOPIC</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="config-select">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>LEVEL</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="config-select">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Student context card */}
                {s && (
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 10, border: '1px solid var(--border)', fontSize: 12 }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 11 }}>YOUR PROFILE</p>
                    <p style={{ color: 'var(--text-secondary)', margin: '2px 0' }}>Level: <strong style={{ color: 'var(--orange)' }}>{s.level}</strong></p>
                    <p style={{ color: 'var(--text-secondary)', margin: '2px 0' }}>Score: <strong style={{ color: 'var(--blue)' }}>{s.overall}%</strong></p>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 11 }}>AI uses this to personalize answers</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Main Chat Area ── */}
        <div className="tutor-main">

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setSidebarOpen(p => !p)}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}
                title="Toggle sidebar">
                ☰
              </button>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>🤖 AI CS Tutor</h1>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  {MODES.find(m2 => m2.value === mode)?.label} · {language} · {level}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowFilePanel(p => !p)}
                style={{ background: showFilePanel ? 'rgba(59,130,246,0.15)' : 'transparent', border: `1px solid ${showFilePanel ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 8, padding: '6px 12px', color: showFilePanel ? 'var(--blue)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}
                title="Upload file">
                📎 Upload
              </button>
              <button onClick={startNewChat}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
                + New
              </button>
            </div>
          </div>

          {/* File upload panel */}
          {showFilePanel && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => setUploadedFile(e.target.files[0])} accept=".pdf,.py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.cs,.go,.rs,.sql,.html,.css,.txt,.md,.json,.yaml,.yml,.png,.jpg,.jpeg" />
              <button onClick={() => fileInputRef.current.click()}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
                {uploadedFile ? `📄 ${uploadedFile.name}` : '📁 Choose File'}
              </button>
              <input
                value={fileQuestion} onChange={e => setFileQuestion(e.target.value)}
                placeholder="What do you want to know about this file?"
                className="input-field" style={{ flex: 1, padding: '8px 14px', fontSize: 13 }}
              />
              <button onClick={handleFileUpload} disabled={!uploadedFile || uploading} className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: 13, opacity: (!uploadedFile || uploading) ? 0.5 : 1 }}>
                {uploading ? '⏳ Analyzing...' : 'Analyze →'}
              </button>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', width: '100%', margin: 0 }}>
                Supports: PDF, code files (.py, .js, .java, .cpp...), images (screenshots), text files
              </p>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {messages.map(m => (
              <MessageBubble key={m.id} msg={m}
                onRegenerate={lastUserMsg ? () => sendMessage(lastUserMsg, true) : null}
              />
            ))}
            {loading && <TypingIndicator />}
            <div ref={endRef} />
          </div>

          {/* Input area */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px' }}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${language}… (Shift+Enter for new line)`}
                rows={1}
                className="input-field"
                style={{ flex: 1, resize: 'none', minHeight: 46, maxHeight: 160, padding: '12px 16px', fontSize: 14, lineHeight: 1.5, overflowY: 'auto' }}
              />
              {loading ? (
                <button onClick={() => setLoading(false)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--red)', borderRadius: 10, padding: '12px 20px', color: 'var(--red)', cursor: 'pointer', fontWeight: 600, fontSize: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  ⏹ Stop
                </button>
              ) : (
                <button onClick={() => sendMessage()} disabled={!input.trim()}
                  className="btn btn-primary"
                  style={{ padding: '12px 22px', fontSize: 14, flexShrink: 0, opacity: !input.trim() ? 0.5 : 1, cursor: !input.trim() ? 'not-allowed' : 'pointer' }}>
                  Send →
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              AI may make mistakes. Always verify critical code in your development environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
