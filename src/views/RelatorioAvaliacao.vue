<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuditoriaStore, type RelatorioAvaliacao as RelatorioAvaliacaoType } from '@/stores/auditoriaStore'
import { useToast } from 'primevue/usetoast'
import MetricCard from '@/components/common/MetricCard.vue'

const route = useRoute()
const router = useRouter()
const store = useAuditoriaStore()
const toast = useToast()

const planoId = computed(() => Number(route.params.id))
const relatorio = ref<RelatorioAvaliacaoType | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    relatorio.value = await store.getRelatorioAvaliacao(planoId.value)
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar relatório', life: 3000 })
  } finally {
    loading.value = false
  }
})

function statusSeverity(status: string) {
  const map: Record<string, 'info' | 'success' | 'danger'> = {
    conforme: 'success',
    nao_conforme: 'danger',
  }
  return map[status] || 'info'
}
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <i class="pi pi-spin pi-spinner text-3xl" />
  </div>

  <div v-else-if="relatorio" class="flex flex-column gap-6" style="max-width: 50rem">
    <div class="flex align-items-center justify-content-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Relatório de Avaliação</h1>
        <p class="text-gray-500 mt-1">Plano #{{ planoId }}</p>
      </div>
      <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="router.push(`/planos-auditoria/${planoId}/avaliacoes`)" />
    </div>

    <div class="grid">
      <div class="col-12 md:col-3">
        <MetricCard label="Requisitos Avaliados" :value="relatorio.total_requisitos" icon="pi pi-check-square" />
      </div>
      <div class="col-12 md:col-3">
        <MetricCard label="Conformes" :value="relatorio.conformes" icon="pi pi-check" color="#e8f5e9" />
      </div>
      <div class="col-12 md:col-3">
        <MetricCard label="Não Conformes" :value="relatorio.nao_conformes" icon="pi pi-exclamation-triangle" color="#ffebee" />
      </div>
      <div class="col-12 md:col-3">
        <MetricCard
          label="Atendimento"
          :value="`${relatorio.percentual_atendimento.toFixed(0)}%`"
          icon="pi pi-chart-bar"
          :color="relatorio.percentual_atendimento >= 66 ? '#e8f5e9' : '#fff3e0'"
        />
      </div>
    </div>

    <h2 class="text-base font-semibold m-0">Requisitos</h2>
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <DataTable :value="relatorio.avaliacoes" striped-rows>
      <Column field="avaliacao.requisito_codigo" header="Código" style="width: 6rem" />
      <Column field="avaliacao.requisito_nome" header="Requisito" />
      <Column header="Resultado" style="width: 10rem">
        <template #body="{ data }">
          <Tag
            :value="data.avaliacao.resultado === 'conforme' ? 'Conforme' : data.avaliacao.resultado === 'nao_conforme' ? 'Não Conforme' : 'Pendente'"
            :severity="statusSeverity(data.avaliacao.resultado)"
          />
        </template>
      </Column>
      <Column header="Critérios" style="width: 8rem">
        <template #body="{ data }">
          <span>{{ data.criterios.filter((c: any) => c.atendido).length }}/{{ data.criterios.length }}</span>
        </template>
      </Column>
      </DataTable>
    </div>

    <div v-if="relatorio.nao_conformidades.length > 0">
      <h2 class="text-base font-semibold m-0">Não Conformidades Geradas</h2>
      <Accordion :multiple="true">
        <AccordionTab v-for="nc in relatorio.nao_conformidades" :key="nc.id" :header="`NC #${nc.id}`">
          <div class="flex flex-column gap-2">
            <div><strong>Descrição:</strong> {{ nc.descricao }}</div>
            <div v-if="nc.criterio_descricao"><strong>Critério não atendido:</strong> {{ nc.criterio_descricao }}</div>
            <div v-if="nc.requisito_codigo"><strong>Requisito:</strong> {{ nc.requisito_codigo }}</div>
            <Tag :value="nc.status" />
          </div>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
</template>
