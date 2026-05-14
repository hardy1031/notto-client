import { createContext, useContext, useState, type ReactNode } from 'react'
import { api } from '../api'
import type { User } from '../types'

const TOKEN_KEY = 'notto_token'
const USER_KEY = 'notto_user'

interface AuthState {
  user: User | null
  token: string | null
}

export interface RegisterParams {
  user_name: string
  email: string
  password: string
  first_language: string
  target_language: string
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (params: RegisterParams) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredAuth(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY)
  const userStr = localStorage.getItem(USER_KEY)
  const user = userStr ? (JSON.parse(userStr) as User) : null
  return { token, user }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadStoredAuth)

  const storeAuth = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setAuth({ token, user })
  }

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setAuth({ token: null, user: null })
  }

  const login = async (email: string, password: string) => {
    const result = await api.login({ email, password })
    storeAuth(result.token, result.user)
  }

  const register = async (params: RegisterParams) => {
    const result = await api.register(params)
    storeAuth(result.token, result.user)
  }

  const logout = async () => {
    await api.logout().catch(() => {})
    clearAuth()
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
