import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getQuestions } from '../data/allQuestions.js'
import { calculateAssessmentScores } from '../services/scoringEngine.js'
import { getSubjectById } from '../data/subjects.js'

const TOTAL_SECONDS = 180 // 3 minutes

function Timer({ seconds, total }) {
  const pct = (seconds / total) * 100
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isLow = seconds <= 30
  const isMedium = seconds <= 60

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: isLow ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
      border: `1px solid ${isLow ? 'var(--red)' : 'var(--border)'}`,
      borderRadius: 12, padding: '10px 18px',
      transition: 'all 0.3s'
    }}>
      <div style={{ fontSize: 22, animation: isLow ? 'spin 1s linear infinite' : 'none' }}>⏱️</div>
      <div>
        <div style={{
          fontSize: 26, fontWeight: 800, fontFamily: 'monospace',
          color: isLow ? 'var(--red)' : isMedium ? 'var(--orange)' : 'var(--green)',
          letterSpacing: 2
        }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>remaining</div>
      </div>
      <div style={{ width: 60 }}>
        <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, transition: 'width 1s linear',
            width: `${pct}%`,
            background: isLow ? 'var(--red)' : isMedium ? 'var(--orange)' : 'var(--green)'
          }} />
        </div>
      </div>
    </div>
  )
}

function QuestionTypeBadge({ type }) {
  const map = {
    mcq: { label: 'MCQ', cls: 'badge-blue', icon: '🔘' },
    short_answer: { label: 'Short Answer', cls: 'badge-purple', icon: '✍️' },
    scenario: { label: 'Scenario', cls: 'badge-orange', icon: '🎭' },
    practical: { label: 'Practical Task', cls: 'badge-green', icon: '💻' },
  }
  const m = map[type] || { label: type, cls: 'badge-blue', icon: '❓' }
  return <span className={`badge ${m.cls}`}>{m.icon} {m.label}</span>
}

export default function Assessment() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [submitted, setSubmitted] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const navigate = useNavigate()
  const { updateScores, currentSubject } = useApp()
  const timerRef = useRef(null)

  const questions = getQuestions(currentSubject)

  const submitAssessment = useCallback(() => {
    if (submitted) return
    setSubmitted(true)
    clearInterval(timerRef.current)
    setIsAnalyzing(true)

    setTimeout(() => {
      const result = calculateAssessmentScores(questions, answers)
      updateScores(result)
      setIsAnalyzing(false)
      navigate('/assessment/result')
    }, 2800)
  }, [submitted, questions, answers, updateScores, navigate])

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          submitAssessment()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [submitAssessment])

  if (isAnalyzing) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24
      }}>
        <div style={{ fontSize: 64, animation: 'spin 2s linear infinite' }}>🧠</div>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Analyzing Your Competency…</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          AI is evaluating your responses and identifying skill gaps
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Scoring responses', 'Topic analysis', 'Gap detection', 'Path generation'].map((s, i) => (
            <span key={s} className="badge badge-blue" style={{ animationDelay: `${i * 0.5}s`, opacity: 0.8 }}>{s}</span>
          ))}
        </div>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    )
  }

  const q = questions[current]
  const answered = answers[q.id]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="page-content fade-in" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Diagnostic Assessment</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{currentSubject}</p>
        </div>
        <Timer seconds={timeLeft} total={TOTAL_SECONDS} />
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>Question {current + 1} of {questions.length}</span>
          <span>{Object.keys(answers).length} answered</span>
        </div>
        <div className="progress-bar-wrap" style={{ height: 6 }}>
          <div className="progress-bar-fill fill-blue" style={{ width: `${progress}%` }} />
        </div>
        {/* Question dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {questions.map((_, i) => (
            <div key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === current
                  ? 'linear-gradient(135deg, var(--blue), var(--purple))'
                  : answers[questions[i].id] !== undefined
                    ? 'var(--green-glow)'
                    : 'var(--bg-secondary)',
                border: i === current ? 'none' : answers[questions[i].id] !== undefined ? '1px solid var(--green)' : '1px solid var(--border)',
                color: i === current ? 'white' : answers[questions[i].id] !== undefined ? 'var(--green)' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="card" key={q.id} style={{ marginBottom: 20, padding: '28px 32px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <QuestionTypeBadge type={q.type} />
          <span className="badge badge-purple">{q.topic}</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{q.points} pts</span>
        </div>

        <p style={{ fontSize: 16, lineHeight: 1.7, fontWeight: 500, marginBottom: 24 }}>{q.question}</p>

        {/* MCQ options */}
        {q.type === 'mcq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, idx) => {
              const selected = answered === idx
              return (
                <button key={idx}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: idx }))}
                  style={{
                    textAlign: 'left', padding: '14px 18px', borderRadius: 10,
                    background: selected ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
                    color: selected ? 'var(--blue)' : 'var(--text-primary)',
                    fontSize: 14, fontWeight: selected ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 12
                  }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6, border: `1px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                    background: selected ? 'var(--blue)' : 'transparent',
                    color: selected ? 'white' : 'var(--text-muted)'
                  }}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Text / scenario / practical */}
        {(q.type === 'short_answer' || q.type === 'scenario' || q.type === 'practical') && (
          <div>
            {q.type === 'practical' && (
              <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 14px', marginBottom: 12,
                fontSize: 12, color: 'var(--text-muted)'
              }}>
                💡 Write your Python code in the area below. Focus on correctness and clarity.
              </div>
            )}
            <textarea
              value={answers[q.id] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder={
                q.type === 'short_answer' ? 'Type your explanation here (2–5 sentences)…' :
                q.type === 'scenario' ? 'Describe your approach and reasoning…' :
                '# Write your Python code here\ndef solution():\n    pass'
              }
              style={{
                width: '100%', minHeight: q.type === 'practical' ? 180 : 120,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 16px', color: 'var(--text-primary)',
                fontSize: q.type === 'practical' ? 13 : 14,
                fontFamily: q.type === 'practical' ? 'monospace' : 'inherit',
                resize: 'vertical', lineHeight: 1.6,
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {answers[q.id] ? `${(answers[q.id] || '').trim().split(/\s+/).filter(Boolean).length} words` : 'Start typing to answer…'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary"
          disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}
          style={{ opacity: current === 0 ? 0.4 : 1 }}>
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          {current < questions.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn btn-green btn-large"
              onClick={submitAssessment}
              style={{ minWidth: 160 }}>
              ✓ Submit Assessment
            </button>
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        Assessment auto-submits when the timer reaches 00:00 · Unanswered questions score 0
      </p>
    </div>
  )
}
