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
      } catch {}
    }
    totalNcs.value = ncCount
  } catch {
    totalPlanos.value = '--'
  }
})
</script>

<template>
  <div class="flex flex-column gap-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 mt-1">Bem-vindo, {{ authStore.userNome }}!</p>
    </div>
    <div class="grid">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-pencil text-norma-600 text-xl" />
            <span class="font-semibold text-gray-900">Escopos</span>
          </div>
          <span class="text-2xl font-bold text-gray-900">{{ totalEscopos }}</span>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-file text-green-500 text-xl" />
            <span class="font-semibold text-gray-900">Documentos</span>
          </div>
          <span class="text-2xl font-bold text-gray-900">{{ totalDocumentos }}</span>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-list-check text-purple-500 text-xl" />
            <span class="font-semibold text-gray-900">Planos</span>
          </div>
          <span class="text-2xl font-bold text-gray-900">{{ totalPlanos }}</span>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-exclamation-triangle text-orange-500 text-xl" />
            <span class="font-semibold text-gray-900">Não Conformidades</span>
          </div>
          <span class="text-2xl font-bold text-gray-900">{{ totalNcs }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
