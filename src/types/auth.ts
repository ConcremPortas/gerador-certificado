export type UserRole = 'administrador' | 'padrao'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  created_at: string
  created_by: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
}
