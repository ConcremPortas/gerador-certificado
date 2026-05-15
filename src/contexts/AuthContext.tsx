import React, { createContext, useContext, useState } from 'react'
import { supabase } from '../lib/supabase'
import { hashPassword } from '../lib/hashPassword'
import type { AuthContextType, User } from '../types/auth'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading] = useState(false)

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

    if (error) throw new Error('E-mail ou senha incorretos')
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

    setUser(userData)
  }

  function logout() {
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
