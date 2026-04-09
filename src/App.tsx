import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { PracticePage } from './pages/PracticePage'
import { QuizHistoryPage } from './pages/QuizHistoryPage'
import { MyNotesPage } from './pages/MyNotesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/quiz-history" element={<QuizHistoryPage />} />
        <Route path="/my-notes" element={<MyNotesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
