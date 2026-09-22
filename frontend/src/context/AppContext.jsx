import React, { createContext, useContext, useState } from 'react'
import { speakWelcome } from '../services/voiceAssistant.js'

const AppContext = createContext(null)

export const DEMO_USER = {
  id: 'demo-001',
  name: 'Ronak Lakhtariya',
  email: 'demo@skillpath.ai',
  avatar: 'RL',
}

export const DEMO_SCORES = {
  overall: 68,
  level: 'Intermediate',
  topics: {
    'Python Basics': 90,
    'Loops': 82,
    'Functions': 62,
    'OOP': 35,
    'File Handling': 40,
  }
}

export const INITIAL_SCORES = {
  overall: 0,
  level: 'Beginner',
  topics: {
    'Python Basics': 0,
    'Loops': 0,
    'Functions': 0,
    'OOP': 0,
    'File Handling': 0,
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isDemo, setIsDemo] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [scores, setScores] = useState(null)
  const [assessmentHistory, setAssessmentHistory] = useState([])
  const [completedModules, setCompletedModules] = useState([])
  const [currentSubject, setCurrentSubject] = useState('python') // stores subject ID
  const [learningPath, setLearningPath] = useState(null)
  const [practiceScores, setPracticeScores] = useState([])

  const playGreeting = (userName) => {
    setIsSpeaking(true)
    speakWelcome(
      userName,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    )
  }

  const loginDemo = (customName) => {
    const finalName = customName && customName.trim() ? customName.trim() : 'Ronak Lakhtariya'
    const initials = finalName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'RL'
    const demoProfile = { ...DEMO_USER, name: finalName, avatar: initials }
    setUser(demoProfile)
    setIsDemo(true)
    setJustLoggedIn(true)
    setScores(DEMO_SCORES)
    setAssessmentHistory([
      { date: '2026-09-01', overall: 45, level: 'Beginner', topics: { 'Python Basics': 60, 'Loops': 55, 'Functions': 40, 'OOP': 20, 'File Handling': 25 } },
      { date: '2026-09-08', overall: 68, level: 'Intermediate', topics: DEMO_SCORES.topics }
    ])
    playGreeting(finalName)
  }

  const login = (email, password, fullName) => {
    const rawName = fullName && fullName.trim() ? fullName.trim() : email.split('@')[0]
    // Capitalize nicely
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || displayName[0]
    setUser({ id: 'user-001', name: displayName, email, avatar: initials })
    setIsDemo(false)
    setJustLoggedIn(true)
    setScores(null)
    playGreeting(displayName)
  }

  const clearJustLoggedIn = () => setJustLoggedIn(false)

  const logout = () => {
    setUser(null)
    setIsDemo(false)
    setScores(null)
    setAssessmentHistory([])
    setCompletedModules([])
    setLearningPath(null)
  }

  const updateScores = (newScores) => {
    setScores(newScores)
    setAssessmentHistory(prev => [...prev, { date: new Date().toISOString().split('T')[0], ...newScores }])
  }

  const completeModule = (moduleId) => {
    setCompletedModules(prev => prev.includes(moduleId) ? prev : [...prev, moduleId])
  }

  const addPracticeScore = (entry) => {
    setPracticeScores(prev => [...prev, { ...entry, date: new Date().toISOString().split('T')[0] }])
  }

  return (
    <AppContext.Provider value={{
      user, isDemo, scores, assessmentHistory,
      completedModules, currentSubject, learningPath,
      practiceScores,
      justLoggedIn, isSpeaking, playGreeting, clearJustLoggedIn,
      loginDemo, login, logout,
      updateScores, completeModule, setLearningPath,
      setCurrentSubject, addPracticeScore
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
