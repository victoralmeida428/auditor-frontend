<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuditoriaStore, type PlanoAuditoria, type GrupoComEnsaios } from '@/stores/auditoriaStore'
import { useEscopoStore } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'
import AdicionarEnsaioDialog from '@/components/auditoria/AdicionarEnsaioDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useAuditoriaStore()
const escopoStore = useEscopoStore()
const toast = useToast()

const planoId = computed(() => Number(route.params.id))
const plano = ref<PlanoAuditoria | null>(null)
const grupos = ref<GrupoComEnsaios[]>([])
const loading = ref(true)
const showAjusteDialog = ref(false)
const ajusteGrupoId = ref<number | null>(null)
const ensaiosDisponiveis = ref<{ id: number; nome: string }[]>([])
const selectedEnsaioId = ref<number | null>(null)
const ajusteLoading = ref(false)

onMounted(async () => {
  try {
    const data = await store.getPlano(planoId.value)
    plano.value = data.plano
    grupos.value = data.grupos
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar plano', life: 3000 })
  } finally {
    loading.value = false
  }
})

function statusSeverity(status: string) {
  const map: Record<string, 'info' | 'warn' | 'success' | 'danger'> = {
    rascunho: 'info',
    em_andamento: 'warn',
    concluido: 'success',
  }
  return map[status] || 'info'
}

async function openAjuste(grupo: GrupoComEnsaios) {
  ajusteGrupoId.value = grupo.id
  try {
    if (plano.value) {
      const { default: api } = await import('@/services/api')
      const res = await api.get(`/escopo/${plano.value.escopo_id}/ensaios`)
      ensaiosDisponiveis.value = res.data.map((e: any) => ({ id: e.id, nome: e.nome }))
    }
  } catch {}
  showAjusteDialog.value = true
}

async function handleAjusteConfirm(ensaioId: number) {
  if (!ajusteGrupoId.value || !plano.value) return
  ajusteLoading.value = true
  try {
    await store.ajusteManual(plano.value.id, ajusteGrupoId.value, ensaioId)
    const data = await store.getPlano(plano.value.id)
    grupos.value = data.grupos
    showAjusteDialog.value = false
    toast.add({ severity: 'success', summary: 'Ensaio adicionado ao plano', life: 2000 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao ajustar', life: 3000 })
  } finally {
    ajusteLoading.value = false
  }
}

async function confirmRemoverEnsaio(grupoId: number, ensaioId: number) {
  if (!plano.value) return
  try {
    await store.removerEnsaioManual(plano.value.id, grupoId, ensaioId)
    const data = await store.getPlano(plano.value.id)
    grupos.value = data.grupos
    toast.add({ severity: 'success', summary: 'Ensaio removido do plano', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao remover ensaio', life: 3000 })
  }
}

async function handleIniciar() {
  if (!plano.value) return
  try {
    await store.iniciar(plano.value.id)
    plano.value.status = 'em_andamento'
    toast.add({ severity: 'success', summary: 'Auditoria iniciada', life: 2000 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao iniciar', life: 3000 })
  }
}

async function handleConcluir() {
  if (!plano.value) return
  try {
    await store.concluir(plano.value.id)
    plano.value.status = 'concluido'
    toast.add({ severity: 'success', summary: 'Auditoria concluída', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao concluir', life: 3000 })
  }
}

const montando = ref(false)

async function handleMontarAuto() {
  if (!plano.value) return
  montando.value = true
  try {
    await store.montarAutomatico(plano.value.id)
    const data = await store.getPlano(plano.value.id)
    plano.value = data.plano
    grupos.value = data.grupos
    toast.add({ severity: 'success', summary: 'Montagem automática concluída', life: 2000 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro na montagem', life: 5000 })
  } finally {
    montando.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <i class="pi pi-spin pi-spinner text-3xl" />
  </div>

  <div v-else-if="plano" class="flex flex-column gap-6">
    <div class="flex align-items-center justify-content-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ plano.titulo }}</h1>
        <p class="text-gray-500 mt-1">Plano #{{ plano.id }}</p>
      </div>
      <div class="flex gap-2">
        <Button
          v-if="plano.status === 'rascunho'"
          label="Iniciar Auditoria"
          icon="pi pi-play"
          @click="handleIniciar"
        />
        <Button
          v-if="plano.status === 'em_andamento'"
          label="Concluir"
          icon="pi pi-check"
          severity="success"
          @click="handleConcluir"
        />
      </div>
    </div>

    <div class="grid">
      <div class="col-12 md:col-3">
        <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
          <span class="text-sm text-gray-500">Status</span>
          <div class="mt-1"><Tag :value="plano.status" :severity="statusSeverity(plano.status)" /></div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
          <span class="text-sm text-gray-500">Tipo Montagem</span>
          <div class="mt-1"><Tag :value="plano.tipo_montagem === 'auto' ? 'Automática' : 'Manual'" :severity="plano.tipo_montagem === 'auto' ? 'success' : 'warn'" /></div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
          <span class="text-sm text-gray-500">Tipo Auditoria</span>
          <div class="mt-1 font-medium">{{ plano.tipo_auditoria }}</div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
          <span class="text-sm text-gray-500">Grupos</span>
          <div class="mt-1 font-medium">{{ grupos.length }}</div>
        </div>
      </div>
    </div>

    <Accordion :multiple="true" :active-index="grupos.map((_, i) => i)">
      <AccordionTab v-for="g in grupos" :key="g.id" :header="`${g.identificador || ('Grupo #' + g.id)} — ${g.nome || ''}`">
        <div class="flex flex-column gap-2">
          <div v-if="g.percentual_nc !== null" class="text-sm">
            <strong>% NC:</strong> {{ g.percentual_nc?.toFixed(2) }}%
            <Tag v-if="g.ajuste_amostragem" :value="`Ajuste: ${g.ajuste_amostragem}x`" severity="warn" class="ml-2" />
          </div>
          <DataTable :value="g.ensaios">
            <Column field="ensaio_id" header="ID" style="width: 4rem" />
            <Column header="Selecionado Por" style="width: 10rem">
              <template #body="{ data }">
                <Tag :value="data.selecionado_por" :severity="data.selecionado_por === 'sistema' ? 'info' : 'warn'" />
              </template>
            </Column>
            <Column header="" style="width: 4rem">
              <template #body="{ data }">
                <Button
                  v-if="plano.status === 'rascunho'"
                  icon="pi pi-trash"
                  text rounded severity="danger"
                  v-tooltip.top="'Remover'"
                  @click="confirmRemoverEnsaio(g.id, data.ensaio_id)"
                />
              </template>
            </Column>
          </DataTable>
          <div v-if="plano.status === 'rascunho'" class="flex justify-content-end">
            <Button label="Adicionar Ensaio" icon="pi pi-plus" size="small" @click="openAjuste(g)" />
          </div>
        </div>
      </AccordionTab>
    </Accordion>

    <div v-if="grupos.length === 0" class="text-center p-4 text-gray-500">
      Nenhum grupo cadastrado neste plano.
      <div v-if="plano.status === 'rascunho'" class="mt-2">
        <Button label="Montar Automaticamente" icon="pi pi-cog" :loading="montando" @click="handleMontarAuto" />
      </div>
    </div>

    <div v-if="plano.status === 'em_andamento' || plano.status === 'concluido'" class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-check-square text-blue-500 text-xl" />
        <div class="flex-1">
          <strong class="block">Avaliação de Requisitos ISO 17025</strong>
          <span class="text-sm text-gray-500">Avaliar requisitos 4.1 (Imparcialidade), 4.2 (Confidencialidade) e 5 (Requisitos Estruturais)</span>
        </div>
        <Button label="Avaliar Requisitos" icon="pi pi-pencil" @click="router.push(`/planos-auditoria/${plano.id}/avaliacoes`)" />
      </div>
    </div>

    <AdicionarEnsaioDialog
      v-if="showAjusteDialog"
      :plano-id="plano.id"
      :grupo-id="ajusteGrupoId!"
      :ensaios-disponiveis="ensaiosDisponiveis"
      @confirm="handleAjusteConfirm"
      @cancel="showAjusteDialog = false"
    />
  </div>

  <div v-else class="text-center p-4 text-gray-500">
    Plano não encontrado.
  </div>
</template>
