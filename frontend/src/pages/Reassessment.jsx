import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { REASSESSMENT_QUESTIONS } from '../data/questions.js'
import { scoreQuestion, getScoreColor, getFillClass, identifySkillGaps } from '../services/scoringEngine.js'

export default function Reassessment() {
  const { scores, isDemo, updateScores } = useApp()
  const navigate = useNavigate()
  const s = scores || (isDemo ? DEMO_SCORES : null)

  const [phase, setPhase] = useState('select') // select | assess | result
  const [selectedTopics, setSelectedTopics] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [mcqAnswer, setMcqAnswer] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [newScores, setNewScores] = useState(null)

  // Flatten questions for selected topics
  const questions = selectedTopics.flatMap(t => REASSESSMENT_QUESTIONS[t] || [])
  const q = questions[current]

  if (!s) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
        <h2>No assessment data yet</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Take the diagnostic assessment first.</p>
        <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Start Assessment</button>
      </div>
    )
  }

  const { needsPractice, gaps } = identifySkillGaps(s.topics)
  const availableTopics = [...gaps, ...needsPractice].map(i => i.topic).filter(t => REASSESSMENT_QUESTIONS[t])

  const toggleTopic = (t) => {
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  const handleStartAssess = () => {
    if (!selectedTopics.length) return
    setAnswers({})
    setCurrent(0)
    setMcqAnswer(null)
    setTextAnswer('')
    setPhase('assess')
  }

  const handleNext = () => {
    // Save current answer
    const ans = q.type === 'mcq' ? mcqAnswer : textAnswer
    setAnswers(prev => ({ ...prev, [q.id]: ans }))
    setMcqAnswer(null)
    setTextAnswer('')
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      // Submit — calculate new scores
      const finalAnswers = { ...answers, [q.id]: q.type === 'mcq' ? mcqAnswer : textAnswer }
      const topicResults = {}
      selectedTopics.forEach(topic => {
        const topicQs = REASSESSMENT_QUESTIONS[topic] || []
        const scores = topicQs.map(tq => scoreQuestion(tq, finalAnswers[tq.id]))
        const avg = scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1)
        topicResults[topic] = Math.round(avg)
      })

      // Merge with original, giving some improvement boost
      const merged = { ...s.topics }
      Object.entries(topicResults).forEach(([topic, newScore]) => {
        // Weighted: 40% old + 60% new (rewards improvement)
        const old = s.topics[topic] || 0
        merged[topic] = Math.min(100, Math.round(old * 0.4 + newScore * 0.6))
      })

      const overallVals = Object.values(merged)
      const overall = Math.round(overallVals.reduce((a, b) => a + b, 0) / overallVals.length)
      const level = overall >= 70 ? 'Advanced' : overall >= 40 ? 'Intermediate' : 'Beginner'

      const result = { topics: merged, overall, level }
      setNewScores({ result, topicResults, original: s.topics })
      updateScores(result)
      setPhase('result')
    }
  }

  // ---- SELECT ----
  if (phase === 'select') {
    return (
      <div className="page-content fade-in" style={{ maxWidth: 700 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Ready for Re-assessment?</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            New questions — not the same ones — to measure your improvement.
          </p>
        </div>

        {availableTopics.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--green)', fontSize: 16, fontWeight: 600 }}>
              🎉 No topics need re-assessment — you've mastered everything!
            </p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/progress')}>
              View Progress
            </button>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Select Topics to Re-assess</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {availableTopics.map(t => {
                  const selected = selectedTopics.includes(t)
                  const orig = s.topics[t]
                  return (
                    <div key={t}
                      onClick={() => toggleTopic(t)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 18px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                        background: selected ? 'rgba(59,130,246,0.12)' : 'var(--bg-secondary)',
                        border: `1px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
                      }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 5,
                          background: selected ? 'var(--blue)' : 'transparent',
                          border: `1.5px solid ${selected ? 'var(--blue)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
                        }}>{selected && '✓'}</div>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{t}</span>
                        <span className={orig < 40 ? 'badge badge-red' : 'badge badge-orange'}>
                          Current: {orig}%
                        </span>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {(REASSESSMENT_QUESTIONS[t] || []).length} questions
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <button className="btn btn-primary btn-large w-full"
              onClick={handleStartAssess}
              disabled={selectedTopics.length === 0}
              style={{ opacity: selectedTopics.length === 0 ? 0.5 : 1 }}>
              🔄 Start Re-assessment ({questions.length || '–'} questions)
            </button>
          </>
        )}
      </div>
    )
  }

  // ---- ASSESS ----
  if (phase === 'assess') {
    const progress = ((current + 1) / questions.length) * 100
    return (
      <div className="page-content fade-in" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Re-assessment</h2>
          <span className="badge badge-purple">Question {current + 1} of {questions.length}</span>
        </div>
        <div className="progress-bar-wrap" style={{ marginBottom: 24, height: 6 }}>
          <div className="progress-bar-fill fill-blue" style={{ width: `${progress}%` }} />
        </div>

        <div className="card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span className="badge badge-purple">{q.topic}</span>
            <span className="badge badge-blue">{q.type === 'mcq' ? 'MCQ' : q.type === 'short_answer' ? 'Short Answer' : 'Practical'}</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7, marginBottom: 22 }}>{q.question}</p>

          {q.type === 'mcq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => setMcqAnswer(i)}
                  style={{
                    textAlign: 'left', padding: '12px 16px', borderRadius: 10,
                    background: mcqAnswer === i ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
                    border: `1px solid ${mcqAnswer === i ? 'var(--blue)' : 'var(--border)'}`,
                    color: mcqAnswer === i ? 'var(--blue)' : 'var(--text-primary)',
                    fontSize: 14, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center',
                    fontWeight: mcqAnswer === i ? 600 : 400
                  }}>
                  <span style={{ width: 22, height: 22, borderRadius: 5, background: mcqAnswer === i ? 'var(--blue)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: mcqAnswer === i ? 'white' : 'var(--text-muted)', flexShrink: 0 }}>
                    {['A','B','C','D'][i]}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {(q.type === 'short_answer' || q.type === 'practical') && (
            <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
              placeholder={q.type === 'practical' ? '# Write your Python code here…' : 'Type your answer…'}
              style={{
                width: '100%', minHeight: q.type === 'practical' ? 150 : 100,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 16px', color: 'var(--text-primary)',
                fontFamily: q.type === 'practical' ? 'monospace' : 'inherit',
                fontSize: 13, resize: 'vertical', lineHeight: 1.7
              }} />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn btn-primary btn-large" onClick={handleNext}
              disabled={q.type === 'mcq' ? mcqAnswer === null : textAnswer.trim().length < 3}
              style={{ opacity: (q.type === 'mcq' ? mcqAnswer === null : textAnswer.trim().length < 3) ? 0.5 : 1 }}>
              {current < questions.length - 1 ? 'Next →' : '✓ Submit Re-assessment'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- RESULT ----
  if (phase === 'result' && newScores) {
    return (
      <div className="page-content fade-in" style={{ maxWidth: 700 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Re-assessment Complete!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's how much you've improved</p>
        </div>

        {selectedTopics.map(topic => {
          const before = newScores.original[topic] || 0
          const after = newScores.result.topics[topic] || 0
          const diff = after - before
          return (
            <div key={topic} className="card" style={{ marginBottom: 16, padding: '22px 26px' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{topic}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ textAlign: 'center', background: 'var(--red-glow)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Before</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: getScoreColor(before) }}>{before}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {diff >= 0 ? '+' : ''}{diff}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Change</div>
                </div>
                <div style={{ textAlign: 'center', background: 'var(--green-glow)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>After</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: getScoreColor(after) }}>{after}%</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: diff >= 20 ? 'var(--green)' : diff >= 5 ? 'var(--orange)' : 'var(--text-secondary)' }}>
                {diff >= 20 ? '🚀 Excellent improvement! Your learning path is working.' :
                 diff >= 5 ? '✅ Good progress! Keep practicing to reach Advanced level.' :
                 diff >= 0 ? '📚 Slight improvement. Continue with the learning modules.' :
                 '💪 Keep going — review the learning content and try again.'}
              </p>
            </div>
          )
        })}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <button className="btn btn-primary btn-large" style={{ flex: 1 }} onClick={() => navigate('/progress')}>
            📈 View Full Progress
          </button>
          <button className="btn btn-secondary btn-large" onClick={() => navigate('/learning-path')}>
            🗺️ Continue Learning
          </button>
        </div>
      </div>
    )
  }

  return null
}
