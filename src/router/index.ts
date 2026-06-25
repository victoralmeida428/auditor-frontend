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
      path: '/planos-auditoria/novo',
      name: 'plano-novo',
      component: () => import('@/views/MontagemPlano.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/planos-auditoria/:id',
      name: 'plano-detalhe',
      component: () => import('@/views/PlanoDetalhe.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/planos-auditoria/:id/avaliacoes',
      name: 'avaliacoes',
      component: () => import('@/views/AvaliacaoRequisitos.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/planos-auditoria/:planoId/avaliacoes/:avaliacaoId',
      name: 'avaliacao-detalhe',
      component: () => import('@/views/AvaliacaoDetalhe.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/planos-auditoria/:id/relatorio-avaliacao',
      name: 'relatorio-avaliacao',
      component: () => import('@/views/RelatorioAvaliacao.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/nao-conformidades',
      name: 'nao-conformidades',
      component: () => import('@/views/NaoConformidadesList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/normas',
      name: 'admin-normas',
      component: () => import('@/views/admin/NormasList.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/normas/novo',
      name: 'admin-normas-novo',
      component: () => import('@/views/admin/NormasForm.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/normas/:id/editar',
      name: 'admin-normas-editar',
      component: () => import('@/views/admin/NormasForm.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }
  if (to.meta.public && authStore.isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    return '/'
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/'
  }
})

export default router
