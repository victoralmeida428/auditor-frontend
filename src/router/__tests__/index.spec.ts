import { describe, it, expect } from 'vitest'
import router from '@/router'

describe('router configuration', () => {
  it('has correct number of routes', () => {
    expect(router.hasRoute('login')).toBe(true)
    expect(router.hasRoute('register')).toBe(true)
    expect(router.hasRoute('dashboard')).toBe(true)
    expect(router.hasRoute('escopo')).toBe(true)
    expect(router.hasRoute('planos-auditoria')).toBe(true)
    expect(router.hasRoute('admin-normas')).toBe(true)
  })

  it('login and register routes are public', () => {
    const loginRoute = router.resolve('/login')
    expect(loginRoute.meta?.public).toBe(true)

    const registerRoute = router.resolve('/register')
    expect(registerRoute.meta?.public).toBe(true)
  })

  it('dashboard route requires auth', () => {
    const route = router.resolve('/')
    expect(route.meta?.requiresAuth).toBe(true)
  })

  it('admin routes require auth and admin', () => {
    const route = router.resolve('/admin/normas')
    expect(route.meta?.requiresAuth).toBe(true)
    expect(route.meta?.requiresAdmin).toBe(true)
  })
})
