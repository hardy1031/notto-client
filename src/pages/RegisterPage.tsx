import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './login.css'

const LANGUAGES = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
  { value: 'ko', label: '한국어' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstLanguage, setFirstLanguage] = useState('ja')
  const [targetLanguage, setTargetLanguage] = useState('ko')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (firstLanguage === targetLanguage) {
      setError('First language and target language must be different.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await register({ user_name: userName, email, password, first_language: firstLanguage, target_language: targetLanguage })
      navigate('/home')
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
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
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoComplete="username"
            required
            minLength={1}
            maxLength={50}
          />
          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <select
            className="login-select"
            value={firstLanguage}
            onChange={(e) => setFirstLanguage(e.target.value)}
            aria-label="First language"
          >
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>{label} — My language</option>
            ))}
          </select>
          <select
            className="login-select"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            aria-label="Target language"
          >
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>{label} — Learning</option>
            ))}
          </select>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Register'}
          </button>
          <p className="login-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
