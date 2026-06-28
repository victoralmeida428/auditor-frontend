import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

interface LoginRequest {
  email: string
  senha: string
}

interface RegisterRequest {
  empresa_razao_social: string
  empresa_nome_fantasia: string
  empresa_cnpj: string
  nome: string
  email: string
  senha: string
}

interface AuthResponse {
  access_token: string
  refresh_token: string
  user_id: number
  empresa_id: number
  nome: string
  email: string
  is_admin: boolean
  roles: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const userId = ref(Number(localStorage.getItem('user_id') || 0))
  const empresaId = ref(Number(localStorage.getItem('empresa_id') || 0))
  const userNome = ref(localStorage.getItem('user_nome') || '')
  const userEmail = ref(localStorage.getItem('user_email') || '')
  const userRoles = ref<string[]>(JSON.parse(localStorage.getItem('user_roles') || '[]'))
  const isAdminFlag = ref(localStorage.getItem('is_admin') === 'true')

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => isAdminFlag.value)

  function setTokens(data: AuthResponse) {
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
  }

  function persistAuth(data: AuthResponse) {
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    userId.value = data.user_id
    empresaId.value = data.empresa_id
    userNome.value = data.nome
    userEmail.value = data.email
    userRoles.value = data.roles || []
    isAdminFlag.value = data.is_admin

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user_id', String(data.user_id))
    localStorage.setItem('empresa_id', String(data.empresa_id))
    localStorage.setItem('user_nome', data.nome)
    localStorage.setItem('user_email', data.email)
    localStorage.setItem('user_roles', JSON.stringify(data.roles || []))
    localStorage.setItem('is_admin', String(data.is_admin))
  }

  async function login(credentials: LoginRequest) {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    persistAuth(response.data)
    return response.data
  }

  async function register(data: RegisterRequest) {
    const response = await api.post<AuthResponse>('/auth/register', data)
    persistAuth(response.data)
    return response.data
  }

  async function refreshAccessToken() {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken.value,
    })
    setTokens(response.data)
    return response.data
  }

  function logout() {
    accessToken.value = ''
    refreshToken.value = ''
    userId.value = 0
    empresaId.value = 0
    userNome.value = ''
    userEmail.value = ''
    userRoles.value = []
    isAdminFlag.value = false

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('empresa_id')
    localStorage.removeItem('user_nome')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_roles')
    localStorage.removeItem('is_admin')
  }

  return {
    accessToken, refreshToken, userId, empresaId,
    userNome, userEmail, userRoles,
    isAuthenticated, isAdmin,
    login, register, refreshAccessToken,
    setTokens, logout,
  }
})
