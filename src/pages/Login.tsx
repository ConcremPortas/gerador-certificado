import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ── Icons ─────────────────────────────────────────────────────────────────

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

function ShieldCheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function LoginIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showForgotMsg, setShowForgotMsg] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/certificados', { replace: true })
  }, [isAuthenticated, loading, navigate])

  function validateEmail(value: string) {
    if (value && !value.toLowerCase().endsWith('@concrem.com.br')) {
      setEmailError('Apenas e-mails @concrem.com.br são permitidos')
    } else {
      setEmailError('')
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!email || !password || isLoading) return

    setError('')
    setIsLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/certificados', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a2a0f' }}>
        <SpinnerIcon />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* ── Left column — 60% — wallpaper ── */}
      <div
        className="hidden lg:flex lg:w-[60%] relative flex-col justify-between p-10"
        style={{
          backgroundImage: 'url(/Wallpaper-Concrem-Op4v2.jpg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(10,42,15,0.55)' }}
        />

        {/* Logo — top */}
        <div className="relative z-10">
          <img
            src="/concrem-logo.png"
            alt="Concrem"
            style={{ height: 36, filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Marketing text — bottom */}
        <div className="relative z-10 space-y-4">
          <span
            className="block font-bold tracking-[3px] uppercase"
            style={{ color: '#6ee7b7', fontSize: 10 }}
          >
            Sistema Interno
          </span>

          <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
            Gerador de{' '}
            <span style={{ color: '#D4AF37' }}>Certificados</span>
          </h1>

          <p className="max-w-sm" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            Plataforma exclusiva para geração de certificados em lote. Acesso restrito a colaboradores Concrem.
          </p>

        </div>
      </div>

      {/* ── Right column — 40% — form ── */}
      <div
        className="w-full lg:w-[40%] flex flex-col justify-between"
        style={{ background: '#ffffff', padding: 48 }}
      >
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {/* Heading */}
          <div className="mb-8">
            <p
              className="font-bold uppercase tracking-[2px] mb-2"
              style={{ color: '#B8960C', fontSize: 10 }}
            >
              Bem-vindo de volta
            </p>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0a2a0f', lineHeight: 1.2 }}>
              Acesse sua conta
            </h2>
            <p className="mt-1" style={{ color: '#888', fontSize: 12 }}>
              Use seu e-mail corporativo Concrem
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block font-semibold mb-1.5"
                style={{ fontSize: 13, color: '#0a2a0f' }}
              >
                E-mail corporativo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="seu.nome@concrem.com.br"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all"
                  style={{
                    borderColor: emailError ? '#f87171' : '#e2e8e2',
                    fontSize: 13,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#1a5c2a')}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-red-500" style={{ fontSize: 11 }}>{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold" style={{ fontSize: 13, color: '#0a2a0f' }}>
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotMsg((v) => !v)}
                  className="text-xs hover:underline"
                  style={{ color: '#B8960C' }}
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm outline-none transition-all"
                  style={{ borderColor: '#e2e8e2', fontSize: 13 }}
                  onFocus={(e) => (e.target.style.borderColor = '#1a5c2a')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8e2')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Forgot password message */}
            {showForgotMsg && (
              <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: '#fffbf0',
                  border: '1px solid #f0e0a0',
                  color: '#7a5c00',
                  fontSize: 13,
                }}
              >
                <span style={{ marginTop: 1 }}>🔑</span>
                <span>
                  Entre em contato com o administrador do sistema para redefinir sua senha.
                </span>
              </div>
            )}

            {/* General error */}
            {error && (
              <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: 13,
                }}
              >
                <span className="mt-0.5">⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 font-bold rounded-[9px] transition-all"
              style={{
                background: isLoading || !email || !password ? '#5a7a5a' : '#0a2a0f',
                color: '#fff',
                height: 44,
                fontSize: 14,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading || !email || !password ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  Entrando...
                </>
              ) : (
                <>
                  <LoginIcon />
                  Entrar no sistema
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: '#e8ede8' }} />
            <span style={{ color: '#bbb', fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>
              ACESSO RESTRITO
            </span>
            <div className="flex-1 h-px" style={{ background: '#e8ede8' }} />
          </div>

          {/* Domain badge */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
            style={{ background: '#f0faf4', border: '1px solid #c6e8d1' }}
          >
            <ShieldCheckIcon className="w-4 h-4 shrink-0" />
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1a5c2a' }}>Domínio verificado</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8" style={{ color: '#ccc', fontSize: 10 }}>
          Concrem Portas Premium · Sistema Interno
        </p>
      </div>
    </div>
  )
}
