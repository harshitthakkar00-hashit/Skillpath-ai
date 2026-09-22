import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SubjectSelection from './pages/SubjectSelection.jsx'
import Assessment from './pages/Assessment.jsx'
import AssessmentResult from './pages/AssessmentResult.jsx'
import SkillProfile from './pages/SkillProfile.jsx'
import SkillGap from './pages/SkillGap.jsx'
import LearningPath from './pages/LearningPath.jsx'
import Learning from './pages/Learning.jsx'
import AIAssistant from './pages/AIAssistant.jsx'
import AITutor from './pages/AITutor.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import Practice from './pages/Practice.jsx'
import Reassessment from './pages/Reassessment.jsx'
import Progress from './pages/Progress.jsx'
import Materials from './pages/Materials.jsx'
import SplashScreen from './pages/SplashScreen.jsx'
import Layout from './components/Layout.jsx'

function ProtectedRoute({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useApp()
  return (
    <Routes>
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/splash'} replace />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<SubjectSelection />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/assessment/result" element={<AssessmentResult />} />
        <Route path="/skill-profile" element={<SkillProfile />} />
        <Route path="/skill-gaps" element={<SkillGap />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/learning/:topicId" element={<Learning />} />
        {/* Original simple AI assistant (kept) */}
        <Route path="/ai-assistant" element={<AIAssistant />} />
        {/* New full-featured AI Tutor */}
        <Route path="/ai-tutor" element={<AITutor />} />
        {/* Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/reassessment" element={<Reassessment />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/materials" element={<Materials />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
