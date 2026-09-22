import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DEMO_SCORES } from '../context/AppContext.jsx'
import { getScoreColor, getFillClass } from '../services/scoringEngine.js'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function Progress() {
  const { scores, isDemo, assessmentHistory, completedModules, practiceScores } = useApp()
  const navigate = useNavigate()
  const s = scores || (isDemo ? DEMO_SCORES : null)

  if (!s) {
    return (
      <div className="page-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
        <h2>No progress data yet</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>Complete an assessment to start tracking your progress.</p>
        <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Start Assessment</button>
      </div>
    )
  }

  // Chart data
  const topicChartData = Object.entries(s.topics).map(([name, score], i) => ({
    name, score, color: COLORS[i % COLORS.length]
  }))

  const historyChartData = assessmentHistory.map((h, i) => ({
    name: h.date || `Session ${i + 1}`,
    overall: h.overall,
    ...h.topics
  }))

  // Topic improvement comparison (if 2+ assessments)
  const hasHistory = assessmentHistory.length >= 2
  const firstAssessment = assessmentHistory[0]
  const latestAssessment = assessmentHistory[assessmentHistory.length - 1]

  const improvementData = hasHistory
    ? Object.entries(s.topics).map(([topic]) => ({
        topic,
        before: firstAssessment.topics?.[topic] || 0,
        after: latestAssessment.topics?.[topic] || s.topics[topic]
      }))
    : []

  const avgPractice = practiceScores.length
    ? Math.round(practiceScores.reduce((a, b) => a + b.score, 0) / practiceScores.length)
    : null

  return (
    <div className="page-content fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">📈 Progress Dashboard</h1>
        <p className="section-sub">Track your learning improvement over time</p>
      </div>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          {
            icon: '🎯', label: 'Current Competency', value: `${s.overall}%`,
            sub: s.level, color: getScoreColor(s.overall)
          },
          {
            icon: '📋', label: 'Assessments Taken', value: assessmentHistory.length,
            sub: 'total sessions', color: 'var(--blue)'
          },
          {
            icon: '✅', label: 'Modules Completed', value: completedModules.length,
            sub: 'learning modules', color: 'var(--green)'
          },
          {
            icon: '✏️', label: 'Practice Sessions', value: practiceScores.length,
            sub: avgPractice ? `avg ${avgPractice}%` : 'none yet', color: 'var(--purple)'
          },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: card.color, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{card.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Topic progress chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Current Topic Scores</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Latest assessment results</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip
                formatter={v => [`${v}%`, 'Score']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
              />
              <Bar dataKey="score" radius={[4,4,0,0]}>
                {topicChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 70 ? '#10b981' : entry.score >= 40 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {historyChartData.length >= 2 ? (
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Overall Progress Over Time</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Assessment history</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={historyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip
                  formatter={v => [`${v}%`]}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} name="Overall" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40 }}>📊</div>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Progress Chart</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
              Complete more assessments to see your improvement trend over time.
            </p>
            <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => navigate('/reassessment')}>
              Take Re-assessment
            </button>
          </div>
        )}
      </div>

      {/* Improvement comparison */}
      {improvementData.length > 0 && (
        <div className="card" style={{ marginBottom: 28, padding: '24px 28px' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>📊 Improvement Comparison</h3>
          {improvementData.map(({ topic, before, after }) => {
            const diff = after - before
            return (
              <div key={topic} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{topic}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{before}%</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: getScoreColor(after) }}>{after}%</span>
                    {diff !== 0 && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                        background: diff > 0 ? 'var(--green-glow)' : 'var(--red-glow)',
                        color: diff > 0 ? 'var(--green)' : 'var(--red)',
                        border: `1px solid ${diff > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                      }}>
                        {diff > 0 ? '+' : ''}{diff}%
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${before}%`, background: 'var(--border)', borderRadius: 4 }} />
                  </div>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div className={`progress-bar-fill ${getFillClass(after)}`} style={{ height: '100%', width: `${after}%` }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>First Assessment</span>
                  <span>Latest</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Assessment history */}
      {assessmentHistory.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>📋 Assessment History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Overall</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Level</th>
                  {Object.keys(s.topics).map(t => (
                    <th key={t} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assessmentHistory.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{h.date}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getScoreColor(h.overall) }}>{h.overall}%</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={h.level === 'Advanced' ? 'badge badge-green' : h.level === 'Intermediate' ? 'badge badge-orange' : 'badge badge-red'}>{h.level}</span>
                    </td>
                    {Object.keys(s.topics).map(t => (
                      <td key={t} style={{ padding: '10px 12px', color: getScoreColor(h.topics?.[t] || 0), fontWeight: 600 }}>{h.topics?.[t] || '–'}%</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/reassessment')}>🔄 Re-assessment</button>
        <button className="btn btn-secondary" onClick={() => navigate('/learning-path')}>🗺️ Learning Path</button>
        <button className="btn btn-secondary" onClick={() => navigate('/practice')}>✏️ Practice</button>
      </div>
    </div>
  )
}
