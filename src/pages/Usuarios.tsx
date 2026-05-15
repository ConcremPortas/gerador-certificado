import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { hashPassword } from '../lib/hashPassword'
import type { User, UserRole } from '../types/auth'

// ── Icons ─────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
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

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Types ─────────────────────────────────────────────────────────────────

interface UserRow extends User {
  password_hash?: string
}

interface FormState {
  name: string
  email: string
  role: UserRole
  active: boolean
  password: string
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  role: 'padrao',
  active: true,
  password: '',
}

// ── Modal ─────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: '#0a2a0f', borderBottom: '2px solid #B8960C' }}
        >
          <h2 className="text-sm font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <XIcon />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Usuarios() {
  const { user: currentUser, isAdmin } = useAuth()

  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<UserRow | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const firstInputRef = useRef<HTMLInputElement>(null)

  if (!isAdmin) return <Navigate to="/certificados" replace />

  // ── Data ──────────────────────────────────────────────────────────────

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const { data, error: err } = await supabase
        .from('concrem_cert_usuarios')
        .select('id, name, email, role, active, created_at, created_by')
        .order('created_at', { ascending: true })

      if (err) throw err
      setUsers((data as UserRow[]) ?? [])
    } catch {
      setError('Não foi possível carregar os usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // ── Stats ─────────────────────────────────────────────────────────────

  const totalActive = users.filter((u) => u.active).length
  const totalAdmins = users.filter((u) => u.active && u.role === 'administrador').length
  const totalPadrao = users.filter((u) => u.active && u.role === 'padrao').length

  // ── Modal helpers ─────────────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError('')
    setShowPassword(false)
    setModalMode('create')
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }

  function openEdit(u: UserRow) {
    setForm({ name: u.name, email: u.email, role: u.role, active: u.active, password: '' })
    setFormError('')
    setShowPassword(false)
    setEditTarget(u)
    setModalMode('edit')
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }

  function closeModal() {
    setModalMode(null)
    setEditTarget(null)
    setFormError('')
  }

  // ── Save ──────────────────────────────────────────────────────────────

  async function handleSave() {
    setFormError('')

    // Validate
    if (!form.name.trim()) return setFormError('Nome obrigatório.')
    if (form.name.trim().length < 3) return setFormError('Nome muito curto (mínimo 3 caracteres).')
    if (!form.email.trim()) return setFormError('E-mail obrigatório.')
    if (!form.email.toLowerCase().endsWith('@concrem.com.br'))
      return setFormError('Apenas e-mails @concrem.com.br são permitidos.')
    if (modalMode === 'create' && !form.password)
      return setFormError('Senha obrigatória para novo usuário.')
    if (form.password && form.password.length < 6)
      return setFormError('Senha deve ter pelo menos 6 caracteres.')

    // Email uniqueness
    const emailLower = form.email.toLowerCase().trim()
    const duplicate = users.find(
      (u) => u.email === emailLower && (modalMode === 'create' || u.id !== editTarget?.id),
    )
    if (duplicate) return setFormError('Este e-mail já está cadastrado.')

    setSaving(true)
    try {
      if (modalMode === 'create') {
        const hash = await hashPassword(form.password)
        const { error: err } = await supabase.from('concrem_cert_usuarios').insert({
          name: form.name.trim(),
          email: emailLower,
          role: form.role,
          active: form.active,
          password_hash: hash,
          created_by: currentUser!.id,
        })
        if (err) throw err
      } else {
        const updates: Record<string, unknown> = {
          name: form.name.trim(),
          email: emailLower,
          role: form.role,
          active: form.active,
        }
        if (form.password) {
          updates.password_hash = await hashPassword(form.password)
        }
        const { error: err } = await supabase
          .from('concrem_cert_usuarios')
          .update(updates)
          .eq('id', editTarget!.id)
        if (err) throw err
      }
      await fetchUsers()
      closeModal()
    } catch {
      setFormError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return

    const activeAdmins = users.filter((u) => u.active && u.role === 'administrador')
    if (
      deleteTarget.role === 'administrador' &&
      activeAdmins.length <= 1
    ) {
      setDeleteTarget(null)
      return
    }

    setDeleting(true)
    try {
      const { error: err } = await supabase
        .from('concrem_cert_usuarios')
        .update({ active: false })
        .eq('id', deleteTarget.id)
      if (err) throw err
      await fetchUsers()
    } catch {
      // silently ignore
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const activeAdmins = users.filter((u) => u.active && u.role === 'administrador')
  const isLastAdmin = (u: UserRow) =>
    u.role === 'administrador' && u.active && activeAdmins.length <= 1

  // ── Render ────────────────────────────────────────────────────────────

  const INPUT =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/10 transition-all'

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">

      {/* ── Page title ── */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#0a2a0f' }}>
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie os usuários com acesso ao sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:brightness-110"
          style={{ background: '#0a2a0f', color: '#6ee7b7' }}
        >
          <PlusIcon />
          Novo usuário
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Usuários ativos', value: totalActive },
          { label: 'Administradores', value: totalAdmins },
          { label: 'Usuários padrão', value: totalPadrao },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl px-4 py-3"
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <p className="text-2xl font-black" style={{ color: '#0a2a0f' }}>
              {value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-green-200 border-t-green-800 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-sm text-red-500">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">Nenhum usuário cadastrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Criado em
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderTop: i === 0 ? undefined : '1px solid #f3f4f6',
                    background: u.id === currentUser?.id ? 'rgba(10,42,15,0.02)' : undefined,
                  }}
                >
                  {/* Avatar + name + email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-full text-xs font-black shrink-0"
                        style={{
                          width: 34,
                          height: 34,
                          background: '#B8960C',
                          color: '#0a2a0f',
                        }}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 leading-tight flex items-center gap-1.5">
                          {u.name}
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] font-medium text-gray-400">(você)</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      style={
                        u.role === 'administrador'
                          ? {
                              background: 'rgba(184,150,12,0.12)',
                              color: '#8a6800',
                              border: '0.5px solid rgba(184,150,12,0.3)',
                            }
                          : {
                              background: '#f3f4f6',
                              color: '#6b7280',
                            }
                      }
                    >
                      {u.role === 'administrador' ? 'Administrador' : 'Padrão'}
                    </span>
                  </td>

                  {/* Created at */}
                  <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                    {formatDate(u.created_at)}
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      style={
                        u.active
                          ? { background: '#dcfce7', color: '#15803d' }
                          : { background: '#fee2e2', color: '#dc2626' }
                      }
                    >
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => !isLastAdmin(u) && setDeleteTarget(u)}
                        disabled={isLastAdmin(u)}
                        className={[
                          'p-1.5 rounded-lg transition-colors',
                          isLastAdmin(u)
                            ? 'text-gray-200 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50',
                        ].join(' ')}
                        title={isLastAdmin(u) ? 'Último administrador — não pode ser removido' : 'Desativar'}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create / Edit modal ── */}
      {modalMode && (
        <Modal
          title={modalMode === 'create' ? 'Novo usuário' : 'Editar usuário'}
          onClose={closeModal}
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nome</label>
              <input
                ref={firstInputRef}
                className={INPUT}
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
              <input
                type="email"
                className={INPUT}
                placeholder="usuario@concrem.com.br"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Perfil</label>
              <select
                className={INPUT}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              >
                <option value="padrao">Padrão</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {modalMode === 'edit' ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={INPUT + ' pr-10'}
                  placeholder={modalMode === 'edit' ? '••••••' : 'Mínimo 6 caracteres'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-gray-600">Usuário ativo</span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
                style={{ background: form.active ? '#0a2a0f' : '#d1d5db' }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
                  style={{ transform: form.active ? 'translateX(18px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            {/* Error */}
            {formError && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-bold rounded-lg transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: '#0a2a0f', color: '#6ee7b7' }}
              >
                {saving ? 'Salvando…' : modalMode === 'create' ? 'Criar usuário' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <Modal title="Desativar usuário" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-gray-600 mb-1">
            Deseja desativar o usuário{' '}
            <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
          </p>
          <p className="text-xs text-gray-400 mb-5">
            O usuário perderá acesso ao sistema, mas seus dados serão preservados.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2 text-sm font-bold rounded-lg transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              {deleting ? 'Desativando…' : 'Desativar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
