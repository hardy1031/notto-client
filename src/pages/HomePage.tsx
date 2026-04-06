import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => navigate('/quiz')}>Quiz</button>
      <button onClick={() => navigate('/quiz-list')}>Quiz List</button>
      <button>Generate</button>
    </div>
  )
}
