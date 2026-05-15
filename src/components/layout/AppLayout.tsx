import { useEffect, useRef, useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

// ── Icons ─────────────────────────────────────────────────────────────────

function CertificateIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
}

function UserCircleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AppLayout() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a2a0f' }}>
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 rounded-[7px] font-semibold transition-all duration-150 ${
      isActive ? 'border' : 'hover:text-white/70'
    }`

  const navLinkStyle = (isActive: boolean): React.CSSProperties =>
    isActive
      ? {
          background: 'rgba(184,150,12,0.15)',
          color: '#D4AF37',
          border: '0.5px solid rgba(184,150,12,0.25)',
          padding: '8px 18px',
          fontSize: 13,
        }
      : { color: 'rgba(255,255,255,0.45)', border: 'none', padding: '8px 18px', fontSize: 13 }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ── Fixed Header ── */}
      <header
        className="fixed top-0 inset-x-0 z-40 flex items-center px-5"
        style={{
          height: 64,
          background: '#0a2a0f',
          borderBottom: '2px solid #B8960C',
        }}
      >
        {/* Left: logo + nav */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <img
            src="/concrem-logo.png"
            alt="Concrem"
            style={{ height: 38, filter: 'brightness(0) invert(1)', flexShrink: 0 }}
          />

          <div
            className="shrink-0"
            style={{
              width: 0.5,
              height: 28,
              background: 'rgba(255,255,255,0.15)',
              margin: '0 16px',
            }}
          />

          <nav className="flex items-center gap-1">
            <NavLink
              to="/certificados"
              className={navLinkClass}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <CertificateIcon />
              Início
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/usuarios"
                className={navLinkClass}
                style={({ isActive }) => navLinkStyle(isActive)}
              >
                <UsersIcon />
                Usuários
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right: user info + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-lg transition-colors hover:bg-white/5"
          >
            <div
              className="flex items-center justify-center rounded-full text-xs font-black shrink-0"
              style={{ width: 32, height: 32, background: '#B8960C', color: '#0a2a0f' }}
            >
              {getInitials(user?.name ?? '')}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-white text-xs font-semibold leading-tight">{user?.name}</p>
              <span
                className="inline-block px-1.5 py-px rounded-sm text-[10px] font-semibold mt-0.5"
                style={
                  isAdmin
                    ? { background: 'rgba(184,150,12,0.15)', color: '#D4AF37', border: '0.5px solid rgba(184,150,12,0.3)' }
                    : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }
                }
              >
                {isAdmin ? 'Administrador' : 'Padrão'}
              </span>
            </div>

            <span className="text-white/40">
              <ChevronDownIcon />
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
                style={{ color: '#374151' }}
              >
                <UserCircleIcon />
                Meu perfil
              </button>
              <div style={{ height: 1, background: '#f3f4f6' }} />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-red-50"
                style={{ color: '#ef4444' }}
              >
                <LogoutIcon />
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Content area ── */}
      <main
        style={{
          marginTop: 64,
          minHeight: 'calc(100vh - 64px)',
          background: '#f0f2f0',
        }}
      >
        <Outlet />
      </main>
    </>
  )
}
