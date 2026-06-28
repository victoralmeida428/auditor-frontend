<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuditoriaStore, type AvaliacaoRequisito } from '@/stores/auditoriaStore'
import { useNormaStore, type Norma } from '@/stores/normaStore'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const store = useAuditoriaStore()
const normaStore = useNormaStore()
const toast = useToast()

const planoId = computed(() => Number(route.params.id))
const avaliacoes = ref<AvaliacaoRequisito[]>([])
const requisitos = ref<Norma[]>([])
const loading = ref(false)

const categorias = computed(() => {
  const cats = [...new Set(requisitos.value.map(r => r.categoria).filter(Boolean))] as string[]
  return cats
})

const requisitosPorCategoria = computed(() => {
  const map: Record<string, Norma[]> = {}
  for (const r of requisitos.value) {
    const cat = r.categoria || 'Outros'
    if (!map[cat]) map[cat] = []
    map[cat].push(r)
  }
  return map
})

onMounted(async () => {
  loading.value = true
  try {
    const [avs, reqs] = await Promise.all([
      store.listAvaliacoes(planoId.value),
      normaStore.listAtivos(),
    ])
    avaliacoes.value = avs
    requisitos.value = reqs
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar dados', life: 3000 })
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

    <div v-else-if="requisitos.length === 0" class="text-center text-gray-500 py-6">
      Nenhum requisito disponível para avaliação. O administrador precisa importar as normas primeiro.
    </div>

    <div v-else class="flex flex-column gap-4">
      <Accordion :multiple="true">
        <AccordionTab v-for="(reqs, cat) in requisitosPorCategoria" :key="cat" :header="cat">
          <div class="grid">
            <div v-for="req in reqs" :key="req.id" class="col-12 md:col-4">
              <div class="card p-4 bg-white rounded-xl border border-gray-100 shadow-sm border-round flex flex-column gap-3">
                <div class="flex align-items-center justify-content-between">
                  <h3 class="text-base font-semibold m-0">{{ req.requisito_codigo }}</h3>
                  <Tag :value="getStatus(req.requisito_codigo)" :severity="statusSeverity(getStatus(req.requisito_codigo))" />
                </div>
                <p class="text-gray-500 m-0 text-sm">{{ req.texto_exigencia.length > 80 ? req.texto_exigencia.slice(0, 80) + '...' : req.texto_exigencia }}</p>
                <div class="mt-auto">
                  <Button
                    v-if="getStatus(req.requisito_codigo) === 'pendente'"
                    label="Avaliar"
                    icon="pi pi-pencil"
                    class="w-full"
                    @click="criarEAbrir(req.requisito_codigo)"
                  />
                  <Button
                    v-else
                    label="Ver Avaliação"
                    icon="pi pi-eye"
                    class="w-full"
                    severity="secondary"
                    @click="abrirAvaliacao(getAvaliacaoId(req.requisito_codigo)!)"
                  />
                </div>
              </div>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
</template>
