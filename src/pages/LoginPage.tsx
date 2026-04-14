import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    navigate('/home')
  }

  return (
    <div className="login-page">
      {/* Decorative circles */}
      <div className="login-circle-bl" />
      <div className="login-circle-tr" />
      <div className="login-circle-lm" />

      <div className="login-card">
        <div className="login-avatar" />
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <button type="submit" className="login-btn">
            Log in
          </button>
        </form>
      </div>
    </div>
  )
}
