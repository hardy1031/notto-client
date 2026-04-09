import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => navigate('/practice')}>Practice</button>
      <button onClick={() => navigate('/quiz-history')}>Quiz History</button>
      <button onClick={() => navigate('/my-notes')}>My Notes</button>
    </div>
  )
}
