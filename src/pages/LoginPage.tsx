import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Notto</h1>
      <button onClick={() => navigate('/home')}>Login</button>
    </div>
  )
}
