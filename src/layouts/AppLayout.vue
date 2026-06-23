<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const sidebarVisible = ref(true)

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/', command: () => router.push('/') },
  { label: 'Escopo', icon: 'pi pi-pencil', path: '/escopo', command: () => router.push('/escopo') },
  { label: 'Documentos', icon: 'pi pi-file', path: '/documentos', command: () => router.push('/documentos') },
  { label: 'Planos de Auditoria', icon: 'pi pi-list-check', path: '/planos-auditoria', command: () => router.push('/planos-auditoria') },
  { label: 'Não Conformidades', icon: 'pi pi-exclamation-triangle', path: '/nao-conformidades', command: () => router.push('/nao-conformidades') },
]

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen">
    <aside
      class="bg-surface-800 text-white flex flex-column surface-ground"
      :class="sidebarVisible ? 'w-16rem' : 'w-3rem'"
      style="transition: width 0.2s"
    >
      <div class="flex align-items-center justify-content-between p-3 border-bottom-1 border-surface-600">
        <span v-if="sidebarVisible" class="font-bold text-xl">Audit</span>
        <Button
          :icon="sidebarVisible ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'"
          @click="sidebarVisible = !sidebarVisible"
          text
          severity="secondary"
          rounded
        />
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <div
          v-for="item in menuItems"
          :key="item.label"
          class="p-2 cursor-pointer border-round hover:bg-surface-700 flex align-items-center gap-2 mb-1"
          :class="{ 'bg-surface-700': $route.path === item.path && sidebarVisible }"
          @click="item.command"
        >
          <i :class="item.icon" />
          <span v-if="sidebarVisible">{{ item.label }}</span>
        </div>
      </div>
    </aside>
    <div class="flex-1 flex flex-column">
      <header class="flex align-items-center justify-content-end px-4 py-2 border-bottom-1 surface-border">
        <div class="flex align-items-center gap-2">
          <span class="text-sm">{{ authStore.userNome }}</span>
          <Button icon="pi pi-sign-out" @click="logout" text rounded severity="secondary" v-tooltip.left="'Sair'" />
        </div>
      </header>
      <main class="flex-1 overflow-y-auto p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>
