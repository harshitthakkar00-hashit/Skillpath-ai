// Deterministic scoring engine — no AI dependency

const WEIGHTS = {
  mcq: 1.0,
  short_answer: 1.0,
  scenario: 1.0,
  practical: 1.0,
}

const THRESHOLDS = {
  advanced: 70,
  intermediate: 40,
  beginner: 0,
}

export function getCompetencyLevel(score) {
  if (score >= THRESHOLDS.advanced) return 'Advanced'
  if (score >= THRESHOLDS.intermediate) return 'Intermediate'
  return 'Beginner'
}

export function getLevelColor(level) {
  switch (level) {
    case 'Advanced': return 'var(--green)'
    case 'Intermediate': return 'var(--orange)'
    default: return 'var(--red)'
  }
}

export function getScoreColor(score) {
  if (score >= 70) return 'var(--green)'
  if (score >= 40) return 'var(--orange)'
  return 'var(--red)'
}

export function getScoreClass(score) {
  if (score >= 70) return 'score-strong'
  if (score >= 40) return 'score-medium'
  return 'score-weak'
}

export function getFillClass(score) {
  if (score >= 70) return 'fill-green'
  if (score >= 40) return 'fill-orange'
  return 'fill-red'
}

export function getTopicBadge(score) {
  if (score >= 70) return { label: 'Strong', cls: 'badge-green' }
  if (score >= 40) return { label: 'Needs Practice', cls: 'badge-orange' }
  return { label: 'Skill Gap', cls: 'badge-red' }
}

// Score a single MCQ answer
function scoreMCQ(question, answer) {
  if (answer === null || answer === undefined) return 0
  return answer === question.correct ? 100 : 0
}

// Score text answers by keyword matching
function scoreTextAnswer(question, answer) {
  if (!answer || answer.trim().length < 5) return 0

  const text = answer.toLowerCase()
  const keywords = question.keywords || []

  if (keywords.length === 0) {
    // Length-based scoring for no-keyword questions
    const words = answer.trim().split(/\s+/).length
    if (words >= 30) return 80
    if (words >= 15) return 60
    if (words >= 8) return 40
    return 20
  }

  const matched = keywords.filter(kw => text.includes(kw.toLowerCase()))
  const ratio = matched.length / keywords.length

  if (ratio >= 0.8) return 90
  if (ratio >= 0.6) return 75
  if (ratio >= 0.4) return 55
  if (ratio >= 0.2) return 35
  if (matched.length >= 1) return 20
  return 10
}

// Score a practical task
function scorePractical(question, answer) {
  if (!answer || answer.trim().length < 10) return 0

  const text = answer.toLowerCase()
  const keywords = question.keywords || []

  // Check for code indicators
  const hasCode = text.includes('def ') || text.includes('class ') || text.includes('return ')
  const matched = keywords.filter(kw => text.includes(kw.toLowerCase()))
  const ratio = matched.length / Math.max(keywords.length, 1)

  let score = 0
  if (hasCode) score += 20
  score += ratio * 80

  return Math.min(Math.round(score), 100)
}

export function scoreQuestion(question, answer) {
  switch (question.type) {
    case 'mcq': return scoreMCQ(question, answer)
    case 'short_answer': return scoreTextAnswer(question, answer)
    case 'scenario': return scoreTextAnswer(question, answer)
    case 'practical': return scorePractical(question, answer)
    default: return 0
  }
}

export function calculateAssessmentScores(questions, answers) {
  const topicScores = {}
  const topicCounts = {}

  questions.forEach(q => {
    const ans = answers[q.id]
    const score = scoreQuestion(q, ans)

    if (!topicScores[q.topic]) {
      topicScores[q.topic] = 0
      topicCounts[q.topic] = 0
    }
    topicScores[q.topic] += score
    topicCounts[q.topic] += 1
  })

  // Average per topic
  const finalTopicScores = {}
  Object.keys(topicScores).forEach(topic => {
    finalTopicScores[topic] = Math.round(topicScores[topic] / topicCounts[topic])
  })

  // Overall average
  const values = Object.values(finalTopicScores)
  const overall = Math.round(values.reduce((a, b) => a + b, 0) / values.length)

  return {
    topics: finalTopicScores,
    overall,
    level: getCompetencyLevel(overall)
  }
}

export function identifySkillGaps(topicScores) {
  const strong = []
  const needsPractice = []
  const gaps = []

  Object.entries(topicScores).forEach(([topic, score]) => {
    if (score >= 70) strong.push({ topic, score })
    else if (score >= 40) needsPractice.push({ topic, score })
    else gaps.push({ topic, score })
  })

  return { strong, needsPractice, gaps }
}

export function generatePersonalizedPath(topicScores, templates) {
  const { strong, needsPractice, gaps } = identifySkillGaps(topicScores)

  // Priority: gaps first, then needs practice, skip strong topics
  const priority = [...gaps, ...needsPractice]

  const path = []
  priority.forEach(({ topic }) => {
    const steps = templates[topic] || []
    path.push({ topic, steps, priority: gaps.find(g => g.topic === topic) ? 'high' : 'medium' })
  })

  return path
}

export function getGapExplanation(topic, score) {
  const explanations = {
    'OOP': 'Object-Oriented Programming is fundamental for structuring large Python projects. Understanding classes, inheritance, and polymorphism will significantly expand your coding capabilities.',
    'File Handling': 'File I/O is essential for real-world applications — from saving user data to processing logs. Mastering this will make your programs interact with the outside world.',
    'Functions': 'Functions are the building blocks of clean, reusable code. Strong function skills reduce code duplication and make debugging far easier.',
    'Loops': 'Loops are used in virtually every program. Mastering for/while loops and control flow will dramatically increase what you can build.',
    'Python Basics': 'A strong foundation in Python basics ensures every advanced concept builds on solid ground.',
  }
  return explanations[topic] || `Improving ${topic} will strengthen your overall Python proficiency.`
}
