import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { SyncProvider } from './hooks/useSyncContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { PracticePage } from './pages/PracticePage'
import { QuizHistoryPage } from './pages/QuizHistoryPage'
import { QuizReviewPage } from './pages/QuizReviewPage'
import { MyNotesPage } from './pages/MyNotesPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <SyncProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/practice" element={<RequireAuth><PracticePage /></RequireAuth>} />
        <Route path="/quiz-history" element={<RequireAuth><QuizHistoryPage /></RequireAuth>} />
        <Route path="/quiz-review/:runId" element={<RequireAuth><QuizReviewPage /></RequireAuth>} />
        <Route path="/my-notes" element={<RequireAuth><MyNotesPage /></RequireAuth>} />
      </Routes>
    </SyncProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
