import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SyncProvider } from './hooks/useSyncContext'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { PracticePage } from './pages/PracticePage'
import { QuizHistoryPage } from './pages/QuizHistoryPage'
import { QuizReviewPage } from './pages/QuizReviewPage'
import { MyNotesPage } from './pages/MyNotesPage'

function App() {
  return (
    <BrowserRouter>
      <SyncProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/quiz-history" element={<QuizHistoryPage />} />
          <Route path="/quiz-review/:runId" element={<QuizReviewPage />} />
          <Route path="/my-notes" element={<MyNotesPage />} />
        </Routes>
      </SyncProvider>
    </BrowserRouter>
  )
}

export default App
