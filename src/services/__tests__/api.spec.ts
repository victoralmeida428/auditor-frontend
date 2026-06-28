import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn().mockReturnThis(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}))

const mockAuthStore = vi.hoisted(() => ({
  accessToken: 'test_token',
  refreshToken: 'refresh_token',
  setTokens: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

const mockPush = vi.hoisted(() => vi.fn())

vi.mock('@/router', () => ({ default: { push: mockPush } }))

import axios from 'axios'
import api from '@/services/api'

const requestInterceptor = axios.interceptors.request.use.mock.calls[0][0] as
  (config: any) => any
const responseSuccessInterceptor = axios.interceptors.response.use.mock.calls[0][0] as
  (response: any) => any
const responseErrorInterceptor = axios.interceptors.response.use.mock.calls[0][1] as
  (error: any) => Promise<any>

describe('api interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.accessToken = 'test_token'
    mockAuthStore.refreshToken = 'refresh_token'
  })

  it('request interceptor adds Bearer token', () => {
    const config = { headers: {} }
    const result = requestInterceptor(config)
    expect(result.headers.Authorization).toBe('Bearer test_token')
  })

  it('request interceptor skips token when not present', () => {
    mockAuthStore.accessToken = ''
    const config = { headers: {} }
    const result = requestInterceptor(config)
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('response interceptor passes through success', () => {
    const response = { data: 'ok' }
    expect(responseSuccessInterceptor(response)).toBe(response)
  })

  it('response interceptor rejects login errors directly', async () => {
    const error = {
      config: { url: '/api/auth/login' },
      response: { status: 401 },
    }
    await expect(responseErrorInterceptor(error)).rejects.toBe(error)
  })

  it('response interceptor logs out when no refresh token', async () => {
    mockAuthStore.refreshToken = ''
    const error = {
      config: { url: '/api/escopo', _retry: false },
      response: { status: 401 },
    }
    await expect(responseErrorInterceptor(error)).rejects.toBe(error)
    expect(mockAuthStore.logout).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
