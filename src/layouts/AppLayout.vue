<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const sidebarVisible = ref(true)
const mobileSidebarVisible = ref(false)
const isMobile = useMediaQuery('(max-width: 767px)')

watch(() => route.path, () => {
  mobileSidebarVisible.value = false
  document.body.classList.remove('sidebar-open')
})

watch(mobileSidebarVisible, (v) => {
  document.body.classList.toggle('sidebar-open', v)
})

watch(isMobile, (mobile) => {
  if (!mobile) mobileSidebarVisible.value = false
})

const menuGroups = [
  {
    label: 'Geral',
    items: [
      { label: 'Dashboard', icon: 'pi pi-home', path: '/' },
    ],
  },
  {
    label: 'Cadastro',
    items: [
      { label: 'Escopo', icon: 'pi pi-pencil', path: '/escopo' },
      { label: 'Equipamentos', icon: 'pi pi-wrench', path: '/equipamentos' },
      { label: 'Equipe Técnica', icon: 'pi pi-users', path: '/signatarios' },
    ],
  },
  {
    label: 'Documentos',
    items: [
      { label: 'Documentos', icon: 'pi pi-file', path: '/documentos' },
    ],
  },
  {
    label: 'Auditoria',
    items: [
      { label: 'Planos de Auditoria', icon: 'pi pi-list-check', path: '/planos-auditoria' },
      { label: 'Não Conformidades', icon: 'pi pi-exclamation-triangle', path: '/nao-conformidades' },
    ],
  },
  {
    label: 'Administração',
    adminOnly: true,
    items: [
      { label: 'Normas', icon: 'pi pi-book', path: '/admin/normas' },
    ],
  },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function navigate(path: string) {
  router.push(path)
  mobileSidebarVisible.value = false
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen">
    <!-- Overlay (mobile only) -->
    <Transition name="sidebar-overlay">
      <div
        v-if="mobileSidebarVisible"
        class="block md:hidden fixed inset-0 bg-black/50 z-999"
        @click="mobileSidebarVisible = false"
      />
    </Transition>

    <!-- Sidebar Desktop -->
    <aside
      v-if="!isMobile"
      class="bg-norma-900 text-white flex flex-column"
      :class="sidebarVisible ? 'w-16rem' : 'w-3rem'"
      style="transition: width 0.2s"
    >
      <div class="flex align-items-center justify-content-between p-3 border-bottom-1" style="border-color: rgba(255,255,255,0.1)">
        <div v-if="sidebarVisible" class="flex align-items-center gap-2">
          <span class="flex h-8 w-8 px-2 items-center justify-center rounded-lg bg-norma-600 text-sm font-bold text-white">N</span>
          <span class="text-xl font-bold">iNorma</span>
        </div>
        <Button
          :icon="sidebarVisible ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'"
          @click="sidebarVisible = !sidebarVisible"
          text
          rounded
          class="text-white hover:bg-white/10"
        />
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <template v-for="group in menuGroups" :key="group.label">
          <template v-if="!group.adminOnly || authStore.isAdmin">
            <div
              v-if="sidebarVisible"
              class="text-xs font-medium uppercase px-2 py-2 mt-2"
              style="color: rgba(255,255,255,0.5)"
            >
              {{ group.label }}
            </div>
            <div
              v-for="item in group.items"
              :key="item.label"
              class="p-2 cursor-pointer border-round flex align-items-center gap-2 mb-1 transition-all"
              :class="{
                'bg-norma-800 text-white': isActive(item.path) && sidebarVisible,
                'hover:bg-white/10': !isActive(item.path) && sidebarVisible,
                'justify-content-center': !sidebarVisible,
              }"
              @click="navigate(item.path)"
            >
              <i :class="[item.icon, isActive(item.path) ? 'text-white' : 'text-white/70']" />
              <span v-if="sidebarVisible">{{ item.label }}</span>
            </div>
          </template>
        </template>
      </div>
    </aside>

    <!-- Sidebar Mobile (off-canvas) -->
    <aside
      v-if="isMobile && mobileSidebarVisible"
      class="bg-norma-900 text-white flex flex-column fixed inset-y-0 left-0 z-1000 w-64 shadow-2xl"
    >
      <div class="flex align-items-center justify-content-between p-3 border-bottom-1" style="border-color: rgba(255,255,255,0.1)">
        <div class="flex align-items-center gap-2">
          <span class="flex h-8 w-8 px-2 items-center justify-center rounded-lg bg-norma-600 text-sm font-bold text-white">N</span>
          <span class="text-xl font-bold">iNorma</span>
        </div>
        <Button
          icon="pi pi-times"
          @click="mobileSidebarVisible = false"
          text
          rounded
          class="text-white hover:bg-white/10"
        />
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <template v-for="group in menuGroups" :key="group.label">
          <template v-if="!group.adminOnly || authStore.isAdmin">
            <div class="text-xs font-medium uppercase px-2 py-2 mt-2" style="color: rgba(255,255,255,0.5)">
              {{ group.label }}
            </div>
            <div
              v-for="item in group.items"
              :key="item.label"
              class="p-2 cursor-pointer border-round flex align-items-center gap-2 mb-1 transition-all hover:bg-white/10"
              :class="{ 'bg-norma-800 text-white': isActive(item.path) }"
              @click="navigate(item.path)"
            >
              <i :class="[item.icon, isActive(item.path) ? 'text-white' : 'text-white/70']" />
              <span>{{ item.label }}</span>
            </div>
          </template>
        </template>
      </div>
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-column min-w-0">
      <header class="flex align-items-center px-3 md:px-4 py-2 border-bottom-1 bg-white/80 backdrop-blur-md" style="border-color: #e5e7eb">
        <!-- Hamburger (mobile) -->
        <Button
          class="md:hidden mr-2"
          icon="pi pi-bars"
          @click="mobileSidebarVisible = true"
          text
          rounded
          severity="secondary"
        />

        <!-- Spacer -->
        <div class="flex-1" />

        <div class="flex align-items-center gap-2">
          <Button
            v-if="authStore.isAdmin"
            label="Admin"
            icon="pi pi-shield"
            size="small"
            severity="info"
            text
            rounded
            @click="router.push('/admin/normas')"
            v-tooltip.bottom="'Painel Administrativo'"
          />
          <span class="text-sm text-gray-600 hidden sm:inline">{{ authStore.userNome }}</span>
          <Button icon="pi pi-sign-out" @click="logout" text rounded severity="secondary" v-tooltip.left="'Sair'" />
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        <router-view />
      </main>
    </div>
  </div>
</template>
