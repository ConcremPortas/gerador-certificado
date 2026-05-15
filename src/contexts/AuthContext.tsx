import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { hashPassword } from '../lib/hashPassword'
import type { AuthContextType, User } from '../types/auth'

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'concrem_cert_session'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) setUser(JSON.parse(saved) as User)
    } catch {
      localStorage.removeItem(SESSION_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    if (!email.toLowerCase().endsWith('@concrem.com.br')) {
      throw new Error('Acesso permitido apenas para contas @concrem.com.br')
    }

    const { data, error } = await supabase
      .from('concrem_cert_usuarios')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('active', true)
      .limit(1)
      .maybeSingle()

    console.log('[login] data:', data, '| error:', error)

    if (error) throw new Error(`Supabase error: ${error.message} (${error.code})`)
    if (!data) throw new Error('Usuário não encontrado ou inativo')

    const hash = await hashPassword(password)
    if (data.password_hash !== hash) {
      throw new Error('E-mail ou senha incorretos')
    }

    const userData: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
      created_at: data.created_at,
      created_by: data.created_by,
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'administrador',
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
