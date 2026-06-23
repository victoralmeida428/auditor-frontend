import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escopo',
      name: 'escopo',
      component: () => import('@/views/EscopoList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escopo/novo',
      name: 'escopo-novo',
      component: () => import('@/views/EscopoForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escopo/:id',
      name: 'escopo-detalhe',
      component: () => import('@/views/EscopoDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/escopo/:id/editar',
      name: 'escopo-editar',
      component: () => import('@/views/EscopoForm.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/equipamentos',
      name: 'equipamentos',
      component: () => import('@/views/EquipamentosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/signatarios',
      name: 'signatarios',
      component: () => import('@/views/SignatariosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/documentos',
      name: 'documentos',
      component: () => import('@/views/DocumentosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/planos-auditoria',
      name: 'planos-auditoria',
      component: () => import('@/views/PlanosAuditoriaList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/nao-conformidades',
      name: 'nao-conformidades',
      component: () => import('@/views/NaoConformidadesList.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.public && authStore.isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    next('/')
  } else {
    next()
  }
})

export default router
