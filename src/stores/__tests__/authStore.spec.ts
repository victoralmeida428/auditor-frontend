import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

const mockApi = vi.hoisted(() => ({
  post: vi.fn(),
}))
vi.mock('@/services/api', () => ({ default: mockApi }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('login stores tokens and user data', async () => {
    const authData = {
      access_token: 'access123',
      refresh_token: 'refresh123',
      user_id: 1,
      empresa_id: 2,
      nome: 'João',
      email: 'joao@test.com',
      is_admin: false,
      roles: ['user'],
    }
    mockApi.post.mockResolvedValue({ data: authData })

    const store = useAuthStore()
    await store.login({ email: 'joao@test.com', senha: '123' })

    expect(store.accessToken).toBe('access123')
    expect(store.refreshToken).toBe('refresh123')
    expect(store.userId).toBe(1)
    expect(store.empresaId).toBe(2)
    expect(store.userNome).toBe('João')
    expect(store.userEmail).toBe('joao@test.com')
    expect(store.isAuthenticated).toBe(true)
  })

  it('login error propagates', async () => {
    mockApi.post.mockRejectedValue(new Error('Login failed'))
    const store = useAuthStore()
    await expect(store.login({ email: '', senha: '' })).rejects.toThrow()
  })

  it('register stores auth data', async () => {
    const authData = {
      access_token: 't', refresh_token: 'r', user_id: 1, empresa_id: 1,
      nome: 'A', email: 'a@b.com', is_admin: false, roles: [],
    }
    mockApi.post.mockResolvedValue({ data: authData })
    const store = useAuthStore()
    await store.register({
      empresa_razao_social: 'X', empresa_nome_fantasia: 'Y', empresa_cnpj: '00',
      nome: 'A', email: 'a@b.com', senha: 'p',
    })
    expect(store.accessToken).toBe('t')
  })

  it('refreshAccessToken updates tokens', async () => {
    const store = useAuthStore()
    store.refreshToken = 'old_refresh'
    const authData = {
      access_token: 'new_access', refresh_token: 'new_refresh', user_id: 1, empresa_id: 1,
      nome: 'A', email: 'a@b.com', is_admin: false, roles: [],
    }
    mockApi.post.mockResolvedValue({ data: authData })
    await store.refreshAccessToken()
    expect(store.accessToken).toBe('new_access')
    expect(store.refreshToken).toBe('new_refresh')
  })

  it('logout clears everything', () => {
    localStorage.setItem('access_token', 'x')
    localStorage.setItem('refresh_token', 'x')
    localStorage.setItem('user_id', '1')
    localStorage.setItem('empresa_id', '2')
    localStorage.setItem('user_nome', 'X')
    localStorage.setItem('user_email', 'x@x.com')
    localStorage.setItem('user_roles', '["admin"]')
    localStorage.setItem('is_admin', 'true')

    const store = useAuthStore()
    store.logout()

    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
    expect(store.userId).toBe(0)
    expect(store.empresaId).toBe(0)
    expect(store.userNome).toBe('')
    expect(store.userEmail).toBe('')
    expect(store.userRoles).toEqual([])
    expect(store.isAdmin).toBe(false)
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user_id')).toBeNull()
  })

  it('isAdmin is true when user has admin flag', async () => {
    const authData = {
      access_token: 'a', refresh_token: 'b', user_id: 1, empresa_id: 1,
      nome: 'A', email: 'a@b.com', is_admin: true, roles: ['admin'],
    }
    mockApi.post.mockResolvedValue({ data: authData })
    const store = useAuthStore()
    await store.login({ email: 'a@b.com', senha: 'p' })
    expect(store.isAdmin).toBe(true)
  })

  it('isAdmin is false for non-admin users', async () => {
    const authData = {
      access_token: 'a', refresh_token: 'b', user_id: 1, empresa_id: 1,
      nome: 'A', email: 'a@b.com', is_admin: false, roles: ['user'],
    }
    mockApi.post.mockResolvedValue({ data: authData })
    const store = useAuthStore()
    await store.login({ email: 'a@b.com', senha: 'p' })
    expect(store.isAdmin).toBe(false)
  })
})
