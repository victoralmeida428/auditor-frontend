<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuditoriaStore, type AvaliacaoRequisito, type RelatorioAvaliacao } from '@/stores/auditoriaStore'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const store = useAuditoriaStore()
const toast = useToast()

const planoId = computed(() => Number(route.params.id))
const avaliacoes = ref<AvaliacaoRequisito[]>([])
const loading = ref(false)

const requisitosPadrao = [
  { codigo: '4.1', nome: 'Imparcialidade' },
  { codigo: '4.2', nome: 'Confidencialidade' },
  { codigo: '5', nome: 'Requisitos Estruturais' },
]

onMounted(async () => {
  loading.value = true
  try {
    avaliacoes.value = await store.listAvaliacoes(planoId.value)
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar avaliações', life: 3000 })
  } finally {
    loading.value = false
  }
})

function getStatus(codigo: string): 'pendente' | 'conforme' | 'nao_conforme' {
  const av = avaliacoes.value.find(a => a.requisito_codigo === codigo)
  if (!av) return 'pendente'
  if (av.resultado === 'conforme') return 'conforme'
  if (av.resultado === 'nao_conforme') return 'nao_conforme'
  return 'pendente'
}

function getAvaliacaoId(codigo: string): number | null {
  const av = avaliacoes.value.find(a => a.requisito_codigo === codigo)
  return av?.id ?? null
}

function statusSeverity(status: string) {
  const map: Record<string, 'info' | 'success' | 'danger' | 'warn'> = {
    pendente: 'info',
    conforme: 'success',
    nao_conforme: 'danger',
  }
  return map[status] || 'info'
}

async function criarEAbrir(codigo: string) {
  try {
    const av = await store.criarAvaliacao(planoId.value, codigo)
    await router.push(`/planos-auditoria/${planoId.value}/avaliacoes/${av.id}`)
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao criar avaliação', life: 5000 })
  }
}

function abrirAvaliacao(avaliacaoId: number) {
  router.push(`/planos-auditoria/${planoId.value}/avaliacoes/${avaliacaoId}`)
}

async function verRelatorio() {
  router.push(`/planos-auditoria/${planoId.value}/relatorio-avaliacao`)
}
</script>

<template>
  <div class="flex flex-column gap-6">
    <div class="flex align-items-center justify-content-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Avaliação de Requisitos ISO 17025</h1>
        <p class="text-gray-500 mt-1">Plano #{{ planoId }}</p>
      </div>
      <div class="flex gap-2">
        <Button label="Voltar ao Plano" icon="pi pi-arrow-left" severity="secondary" @click="router.push(`/planos-auditoria/${planoId}`)" />
        <Button v-if="avaliacoes.length > 0" label="Relatório Consolidado" icon="pi pi-chart-bar" @click="verRelatorio" />
      </div>
    </div>

    <div v-if="loading" class="flex justify-content-center">
      <i class="pi pi-spin pi-spinner text-3xl" />
    </div>

    <div v-else class="grid">
      <div v-for="req in requisitosPadrao" :key="req.codigo" class="col-12 md:col-4">
        <div class="card p-4 bg-white rounded-xl border border-gray-100 shadow-sm border-round flex flex-column gap-3">
          <div class="flex align-items-center justify-content-between">
            <h3 class="text-base font-semibold m-0">{{ req.codigo }}</h3>
            <Tag :value="getStatus(req.codigo)" :severity="statusSeverity(getStatus(req.codigo))" />
          </div>
          <p class="text-gray-500 m-0 text-sm">{{ req.nome }}</p>
          <div class="mt-auto">
            <Button
              v-if="getStatus(req.codigo) === 'pendente'"
              label="Avaliar"
              icon="pi pi-pencil"
              class="w-full"
              @click="criarEAbrir(req.codigo)"
            />
            <Button
              v-else
              label="Ver Avaliação"
              icon="pi pi-eye"
              class="w-full"
              severity="secondary"
              @click="abrirAvaliacao(getAvaliacaoId(req.codigo)!)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
