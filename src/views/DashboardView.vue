<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useEscopoStore } from '@/stores/escopoStore'
import { useDocumentStore } from '@/stores/documentStore'
import api from '@/services/api'

const authStore = useAuthStore()
const escopoStore = useEscopoStore()
const documentStore = useDocumentStore()

const totalEscopos = ref<number | string>('--')
const totalDocumentos = ref<number | string>('--')
const totalPlanos = ref<number | string>('--')
const totalNcs = ref<number | string>('--')

onMounted(async () => {
  try {
    const escopos = await escopoStore.listEscopos()
    totalEscopos.value = escopos.length
  } catch {}
  try {
    const docs = await documentStore.listDocumentos()
    totalDocumentos.value = docs.length
  } catch {}
  try {
    const res = await api.get('/planos-auditoria')
    totalPlanos.value = res.data.length
    let ncCount = 0
    for (const plano of res.data) {
      try {
        const ncRes = await api.get(`/planos-auditoria/${plano.id}/nao-conformidades`)
        ncCount += ncRes.data.length
      } catch {
        // endpoint pode não existir ainda
      }
    }
    totalNcs.value = ncCount
  } catch {
    totalPlanos.value = '--'
  }
})
</script>

<template>
  <div class="flex flex-column gap-4">
    <h1 class="text-xl font-bold m-0">Dashboard</h1>
    <p class="text-color-secondary m-0">Bem-vindo, {{ authStore.userNome }}!</p>
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="card p-3 surface-ground border-round">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-pencil text-blue-500 text-xl" />
            <span class="font-medium">Escopos</span>
          </div>
          <span class="text-2xl font-bold">{{ totalEscopos }}</span>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="card p-3 surface-ground border-round">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-file text-green-500 text-xl" />
            <span class="font-medium">Documentos</span>
          </div>
          <span class="text-2xl font-bold">{{ totalDocumentos }}</span>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="card p-3 surface-ground border-round">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-list-check text-purple-500 text-xl" />
            <span class="font-medium">Planos</span>
          </div>
          <span class="text-2xl font-bold">{{ totalPlanos }}</span>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="card p-3 surface-ground border-round">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-exclamation-triangle text-orange-500 text-xl" />
            <span class="font-medium">Não Conformidades</span>
          </div>
          <span class="text-2xl font-bold">{{ totalNcs }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
