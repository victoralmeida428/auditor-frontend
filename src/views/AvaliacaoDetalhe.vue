<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuditoriaStore, type AvaliacaoRequisito, type AvaliacaoCriterio } from '@/stores/auditoriaStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useToast } from 'primevue/usetoast'
import CriterioCard from '@/components/auditoria/CriterioCard.vue'
import VincularDocumentoDialog from '@/components/documento/VincularDocumentoDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useAuditoriaStore()
const documentStore = useDocumentStore()
const toast = useToast()

const planoId = computed(() => Number(route.params.planoId))
const avaliacaoId = computed(() => Number(route.params.avaliacaoId))
const avaliacao = ref<AvaliacaoRequisito | null>(null)
const criterios = ref<AvaliacaoCriterio[]>([])
const loading = ref(true)
const saving = ref(false)
const finalizando = ref(false)
const analisandoIA = ref(false)
const resultadoNC = ref<string | null>(null)

const showDocumentoDialog = ref(false)
const documentosDisponiveis = ref<{ id: number; nome_original: string }[]>([])
const documentoSelecionado = ref<number | null>(null)
const tipoDocumento = ref<'obrigatorio' | 'complementar'>('complementar')

onMounted(async () => {
  try {
    const data = await store.getAvaliacao(avaliacaoId.value)
    avaliacao.value = data.avaliacao
    criterios.value = data.criterios
    if (data.avaliacao.resultado) {
      resultadoNC.value = data.avaliacao.descricao_nc
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar avaliação', life: 3000 })
  } finally {
    loading.value = false
  }
})

async function toggleCriterio(criterio: AvaliacaoCriterio) {
  criterio.atendido = !criterio.atendido
}

function statusSeverity(status: string) {
  const map: Record<string, 'info' | 'success' | 'danger'> = {
    conforme: 'success',
    nao_conforme: 'danger',
  }
  return map[status] || 'info'
}

async function handleSalvar() {
  saving.value = true
  try {
    const payload = criterios.value.map(c => ({
      id: c.id,
      atendido: c.atendido ?? false,
      evidencia: c.evidencia_apontada ?? '',
    }))
    await store.updateCriterios(avaliacaoId.value, payload)
    toast.add({ severity: 'success', summary: 'Critérios salvos', life: 2000 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao salvar', life: 5000 })
  } finally {
    saving.value = false
  }
}

async function handleAvaliarIA() {
  analisandoIA.value = true
  try {
    const result = await store.avaliarComLLM(avaliacaoId.value)
    const data = await store.getAvaliacao(avaliacaoId.value)
    avaliacao.value = data.avaliacao
    criterios.value = data.criterios
    toast.add({ severity: 'success', summary: 'Análise concluída', detail: 'Revise os critérios preenchidos pela IA antes de finalizar', life: 4000 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao analisar com IA', life: 5000 })
  } finally {
    analisandoIA.value = false
  }
}

async function handleFinalizar() {
  finalizando.value = true
  try {
    const payload = criterios.value.map(c => ({
      id: c.id,
      atendido: c.atendido ?? false,
      evidencia: c.evidencia_apontada ?? '',
    }))
    await store.updateCriterios(avaliacaoId.value, payload)
    const result = await store.finalizarAvaliacao(avaliacaoId.value)
    avaliacao.value = result
    resultadoNC.value = result.descricao_nc
    toast.add({
      severity: result.resultado === 'conforme' ? 'success' : 'warn',
      summary: result.resultado === 'conforme' ? 'Requisito Conforme' : 'Não Conformidade Gerada',
      life: 3000,
    })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao finalizar', life: 5000 })
  } finally {
    finalizando.value = false
  }
}

async function abrirVincularDocumento() {
  try {
    const docs = await documentStore.listDocumentos()
    documentosDisponiveis.value = docs.map((d: any) => ({ id: d.id, nome_original: d.nome_original }))
    showDocumentoDialog.value = true
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar documentos', life: 3000 })
  }
}

async function handleVinculoConfirm(documentoId: number, tipo: string) {
  try {
    await store.vincularDocumento(avaliacaoId.value, documentoId, tipo)
    toast.add({ severity: 'success', summary: 'Documento vinculado como evidência', life: 2000 })
    showDocumentoDialog.value = false
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao vincular', life: 5000 })
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <i class="pi pi-spin pi-spinner text-3xl" />
  </div>

  <div v-else-if="avaliacao" class="flex flex-column gap-4 md:gap-6 w-full max-w-2xl mx-auto px-0 md:px-4">
    <div class="flex align-items-center justify-content-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ avaliacao.requisito_codigo }} — {{ avaliacao.requisito_nome }}</h1>
        <p class="text-gray-500 mt-1">Plano #{{ planoId }}</p>
      </div>
      <div class="flex gap-2">
        <Button label="Voltar" icon="pi pi-arrow-left" severity="secondary" @click="router.push(`/planos-auditoria/${planoId}/avaliacoes`)" />
        <Button v-if="avaliacao.resultado" label="Novo" icon="pi pi-plus" size="small" @click="router.push(`/planos-auditoria/${planoId}/avaliacoes`)" />
      </div>
    </div>

    <div v-if="avaliacao.resultado" class="card p-3 border-round" :class="avaliacao.resultado === 'conforme' ? 'bg-white rounded-xl border border-gray-100 shadow-sm' : 'bg-white rounded-xl border border-gray-100 shadow-sm'">
      <div class="flex align-items-center gap-2">
        <Tag :value="avaliacao.resultado === 'conforme' ? 'Conforme' : 'Não Conforme'" :severity="statusSeverity(avaliacao.resultado)" />
        <span class="text-sm text-gray-500">Avaliação finalizada</span>
      </div>
      <Message v-if="resultadoNC" severity="warn" :closable="false" class="mt-2">
        {{ resultadoNC }}
      </Message>
    </div>

    <div class="flex flex-column gap-3">
      <h2 class="text-base font-semibold m-0">Critérios</h2>
      <div v-for="c in criterios" :key="c.id">
        <CriterioCard :criterio="c" :readonly="!!avaliacao.resultado" @toggle="toggleCriterio" />
      </div>
    </div>

    <div v-if="!avaliacao.resultado" class="flex gap-2 justify-content-end flex-wrap">
      <Button label="Vincular Documento" icon="pi pi-file" severity="secondary" @click="abrirVincularDocumento" />
      <Button label="Avaliar com IA" :loading="analisandoIA" icon="pi pi-cog" severity="info" @click="handleAvaliarIA" />
      <Button label="Salvar Rascunho" :loading="saving" icon="pi pi-save" severity="secondary" @click="handleSalvar" />
      <Button label="Finalizar Avaliação" :loading="finalizando" icon="pi pi-check" @click="handleFinalizar" />
    </div>

    <VincularDocumentoDialog
      v-if="showDocumentoDialog"
      :documentos-disponiveis="documentosDisponiveis"
      @confirm="handleVinculoConfirm"
      @cancel="showDocumentoDialog = false"
    />
  </div>
</template>
