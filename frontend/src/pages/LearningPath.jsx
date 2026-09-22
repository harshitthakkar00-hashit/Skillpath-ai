import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { generatePersonalizedPath, identifySkillGaps } from '../services/scoringEngine.js'
import { LEARNING_PATH_TEMPLATES } from '../data/learningContent.js'

const typeIcons = { theory: '📖', practice: '✏️', reassessment: '🔄' }
const typeColors = { theory: 'var(--blue)', practice: 'var(--orange)', reassessment: 'var(--purple)' }

export default function LearningPath() {
  const { scores, isDemo, completedModules, completeModule } = useApp()
  const navigate = useNavigate()
  const s = scores || (isDemo ? DEMO_SCORES : null)

  if (!s) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
        <h2>No learning path yet</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Complete an assessment to generate your personalized learning path.</p>
        <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Start Assessment</button>
      </div>
    )
  }

  const path = generatePersonalizedPath(s.topics, LEARNING_PATH_TEMPLATES)
  const { strong } = identifySkillGaps(s.topics)

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">🗺️ Your Personalized Learning Path</h1>
        <p className="section-sub">AI-generated path based on your competency gaps — skip what you already know</p>
      </div>

      {/* Skipped strong topics */}
      {strong.length > 0 && (
        <div style={{
          background: 'var(--green-glow)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14 }}>Skipped (Already Strong): </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {strong.map(({ topic }) => topic).join(', ')} — SkillPath AI detected you already have strong knowledge here.
            </span>
          </div>
        </div>
      )}

      {path.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>Excellent! No major gaps found!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You've mastered all topics. Try a more advanced subject or attempt re-assessment.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/reassessment')}>
            🔄 Take Re-assessment
          </button>
        </div>
      )}

      {path.map((section, si) => (
        <div key={section.topic} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              padding: '6px 14px', borderRadius: 8,
              background: section.priority === 'high' ? 'var(--red-glow)' : 'var(--orange-glow)',
              border: `1px solid ${section.priority === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
              color: section.priority === 'high' ? 'var(--red)' : 'var(--orange)',
              fontWeight: 700, fontSize: 12
            }}>
              {section.priority === 'high' ? '🚨 High Priority' : '⚡ Needs Work'}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{section.topic}</h2>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Current: {s.topics[section.topic]}%
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', left: 20, top: 32, bottom: 32,
              width: 2, background: 'linear-gradient(180deg, var(--blue), var(--purple))',
              borderRadius: 1, zIndex: 0
            }} />

            {section.steps.map((step, idx) => {
              const done = completedModules.includes(step.id)
              return (
                <div key={step.id} style={{
                  display: 'flex', gap: 20, marginBottom: 12,
                  position: 'relative', zIndex: 1
                }}>
                  {/* Step number */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: done
                      ? 'var(--green)'
                      : 'linear-gradient(135deg, var(--blue), var(--purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, color: 'white',
                    boxShadow: done ? '0 0 12px var(--green-glow)' : '0 0 12px var(--blue-glow)'
                  }}>
                    {done ? '✓' : idx + 1}
                  </div>

                  {/* Step card */}
                  <div style={{
                    flex: 1, background: 'var(--bg-card)', border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                    borderRadius: 12, padding: '14px 18px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>{typeIcons[step.type]}</span>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{step.title}</span>
                        {done && <span className="badge badge-green">Completed</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 12, color: typeColors[step.type], fontWeight: 600 }}>
                          {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {step.duration}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {done ? (
                        <button className="btn btn-secondary" style={{ fontSize: 12 }}
                          onClick={() => navigate(`/learning/${section.topic.toLowerCase().replace(/\s+/g, '-')}`)}>
                          Review
                        </button>
                      ) : (
                        <>
                          {step.type === 'theory' && (
                            <button className="btn btn-primary" style={{ fontSize: 12 }}
                              onClick={() => navigate(`/learning/${section.topic.toLowerCase().replace(/\s+/g, '-')}`)}>
                              📖 Start Learning
                            </button>
                          )}
                          {step.type === 'practice' && (
                            <button className="btn btn-orange" style={{ fontSize: 12 }}
                              onClick={() => navigate('/practice')}>
                              ✏️ Practice
                            </button>
                          )}
                          {step.type === 'reassessment' && (
                            <button className="btn" style={{ fontSize: 12, background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))', color: 'white' }}
                              onClick={() => navigate('/reassessment')}>
                              🔄 Re-assess
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
