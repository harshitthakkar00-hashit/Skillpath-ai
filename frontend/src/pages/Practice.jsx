import React, { useState } from 'react'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { PRACTICE_QUESTIONS } from '../data/learningContent.js'
import { scoreQuestion } from '../services/scoringEngine.js'

function ResultBadge({ score }) {
  if (score >= 80) return <span className="badge badge-green" style={{ fontSize: 14, padding: '6px 14px' }}>✅ Correct — Well done!</span>
  if (score >= 50) return <span className="badge badge-orange" style={{ fontSize: 14, padding: '6px 14px' }}>⚡ Partially Correct</span>
  return <span className="badge badge-red" style={{ fontSize: 14, padding: '6px 14px' }}>❌ Needs Improvement</span>
}

export default function Practice() {
  const { scores, isDemo, addPracticeScore } = useApp()
  const s = scores || (isDemo ? DEMO_SCORES : null)

  const [selectedTopic, setSelectedTopic] = useState('OOP')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [sessionScores, setSessionScores] = useState([])

  const questions = PRACTICE_QUESTIONS[selectedTopic] || []
  const q = questions[currentIdx]

  const handleSubmit = () => {
    if (!q) return
    const ans = q.type === 'mcq' ? answer : textAnswer
    const s = scoreQuestion(q, ans)
    setScore(s)
    setSubmitted(true)
    setSessionScores(prev => [...prev, { topic: selectedTopic, q: q.id, score: s }])
    addPracticeScore({ topic: selectedTopic, score: s, questionId: q.id })
  }

  const handleNext = () => {
    setCurrentIdx(i => (i + 1) % questions.length)
    setAnswer(null)
    setTextAnswer('')
    setSubmitted(false)
    setScore(0)
    setShowHint(false)
  }

  const handleTopicChange = (t) => {
    setSelectedTopic(t)
    setCurrentIdx(0)
    setAnswer(null)
    setTextAnswer('')
    setSubmitted(false)
    setShowHint(false)
  }

  const avgScore = sessionScores.length
    ? Math.round(sessionScores.reduce((a, b) => a + b.score, 0) / sessionScores.length)
    : null

  return (
    <div className="page-content fade-in" style={{ maxWidth: 820 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">✏️ Practice</h1>
        <p className="section-sub">Strengthen your skills with targeted practice questions</p>
      </div>

      {/* Topic tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.keys(PRACTICE_QUESTIONS).map(t => (
          <button key={t} onClick={() => handleTopicChange(t)}
            className={selectedTopic === t ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: 13 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Session stats */}
      {sessionScores.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 20px',
          marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap'
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Session: <strong style={{ color: 'var(--text-primary)' }}>{sessionScores.length} answered</strong>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Avg Score: <strong style={{ color: avgScore >= 70 ? 'var(--green)' : avgScore >= 50 ? 'var(--orange)' : 'var(--red)' }}>{avgScore}%</strong>
          </div>
        </div>
      )}

      {!q ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-secondary)' }}>No practice questions for this topic yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '28px 32px' }}>
          {/* Q header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-purple">{selectedTopic}</span>
              <span className="badge badge-blue">{q.type === 'mcq' ? 'MCQ' : q.type === 'scenario' ? 'Scenario' : 'Practical'}</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {currentIdx + 1} / {questions.length}
            </span>
          </div>

          <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7, marginBottom: 22 }}>{q.question}</p>

          {/* Hint */}
          {showHint && !submitted && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--orange)' }}>💡 Hint: {q.hint}</span>
            </div>
          )}

          {/* MCQ */}
          {q.type === 'mcq' && !submitted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => setAnswer(i)}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: 10,
                    background: answer === i ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${answer === i ? 'var(--blue)' : 'var(--border)'}`,
                    color: answer === i ? 'var(--blue)' : 'var(--text-primary)',
                    fontSize: 14, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center',
                    fontWeight: answer === i ? 600 : 400
                  }}>
                  <span style={{ width: 22, height: 22, borderRadius: 5, background: answer === i ? 'var(--blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: answer === i ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>
                    {['A','B','C','D'][i]}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Result MCQ */}
          {q.type === 'mcq' && submitted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correct
                const isSelected = i === answer
                return (
                  <div key={i} style={{
                    padding: '12px 16px', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center',
                    background: isCorrect ? 'var(--green-glow)' : isSelected && !isCorrect ? 'var(--red-glow)' : 'var(--bg-secondary)',
                    border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.4)' : isSelected ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                    fontSize: 14
                  }}>
                    <span>{isCorrect ? '✅' : isSelected ? '❌' : '○'}</span> {opt}
                  </div>
                )
              })}
            </div>
          )}

          {/* Text answer */}
          {(q.type === 'scenario' || q.type === 'practical') && !submitted && (
            <div style={{ marginBottom: 20 }}>
              <textarea
                value={textAnswer}
                onChange={e => setTextAnswer(e.target.value)}
                placeholder={q.type === 'practical' ? '# Write your Python code here…' : 'Describe your approach and reasoning…'}
                style={{
                  width: '100%', minHeight: q.type === 'practical' ? 160 : 120,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '14px 16px', color: 'var(--text-primary)',
                  fontFamily: q.type === 'practical' ? 'monospace' : 'inherit',
                  fontSize: 13, resize: 'vertical', lineHeight: 1.7
                }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}

          {/* Submitted result */}
          {submitted && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <ResultBadge score={score} />
                <span style={{ fontSize: 18, fontWeight: 800, color: score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--orange)' : 'var(--red)' }}>{score}%</span>
              </div>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)', marginBottom: 6 }}>📚 Explanation:</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {typeof q.explanation === 'string' ? q.explanation.replace(/\\n/g, '\n') : q.explanation}
                </p>
              </div>

              {score < 80 && (
                <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ fontSize: 12, color: 'var(--purple)' }}>
                    💡 Recommendation: Review the {selectedTopic} learning module and try this type of question again.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!submitted ? (
              <>
                {!showHint && (
                  <button className="btn btn-secondary" onClick={() => setShowHint(true)}>
                    💡 Hint
                  </button>
                )}
                <button className="btn btn-primary" style={{ flex: 1 }}
                  onClick={handleSubmit}
                  disabled={q.type === 'mcq' ? answer === null : textAnswer.trim().length < 5}>
                  Submit Answer
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={handleNext}>
                  {currentIdx < questions.length - 1 ? 'Next Question →' : 'Restart →'}
                </button>
                <button className="btn btn-primary" onClick={() => { setSubmitted(false); setAnswer(null); setTextAnswer('') }}>
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
