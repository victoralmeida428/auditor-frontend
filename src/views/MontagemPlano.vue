<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuditoriaStore, type GrupoMontagemResult, type MontagemResult } from '@/stores/auditoriaStore'
import { useEscopoStore } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'
import RiskWarningModal from '@/components/auditoria/RiskWarningModal.vue'
import CoberturaCard from '@/components/common/CoberturaCard.vue'

const router = useRouter()
const store = useAuditoriaStore()
const escopoStore = useEscopoStore()
const toast = useToast()

const step = ref(0)
const loading = ref(false)

const escopos = ref<{ id: number; nome: string }[]>([])
const gruposDoEscopo = ref<{ id: number; identificador: string; nome: string; quantidade_ensaios: number }[]>([])

const form = ref({
  escopo_id: null as number | null,
  titulo: '',
  tipo_montagem: 'auto' as string,
  tipo_auditoria: 'primeira' as string,
  data_inicio: null as Date | null,
  data_fim: null as Date | null,
})

const historicoInputs = ref<{ grupo_escopo_id: number; identificador: string; nome: string; qtd_ensaios: number; qtd_ncs: number }[]>([])

const montagemResult = ref<MontagemResult | null>(null)
const resultLoaded = ref(false)

const riskWarningAccepted = ref(false)
const showRiskWarning = ref(false)

const gruposCarregados = ref(false)
const agrupando = ref(false)

onMounted(async () => {
  try {
    const list = await escopoStore.listEscopos()
    escopos.value = list.map((e: any) => ({ id: e.id, nome: e.nome }))
  } catch {}
})

async function loadGrupos() {
  if (!form.value.escopo_id) return
  gruposCarregados.value = false
  try {
    const res = await escopoStore.listPrincipiosAnaliticos()
    gruposDoEscopo.value = []
  } catch {}
  try {
    const { default: api } = await import('@/services/api')
    const res = await api.get(`/escopo/${form.value.escopo_id}/grupos`)
    gruposDoEscopo.value = res.data.map((g: any) => ({
      id: g.grupo?.id ?? g.id,
      identificador: g.grupo?.identificador ?? g.identificador ?? '-',
      nome: g.grupo?.nome ?? g.nome ?? '-',
      quantidade_ensaios: g.grupo?.quantidade_ensaios ?? g.quantidade_ensaios ?? (g.ensaio_ids?.length ?? 0),
    }))
    historicoInputs.value = gruposDoEscopo.value.map(g => ({
      grupo_escopo_id: g.id,
      identificador: g.identificador,
      nome: g.nome,
      qtd_ensaios: g.quantidade_ensaios,
      qtd_ncs: 0,
    }))
    gruposCarregados.value = gruposDoEscopo.value.length > 0
  } catch {
    gruposCarregados.value = false
  }
}

function onEscopoChange() {
  gruposCarregados.value = false
  loadGrupos()
}

async function handleAgrupar() {
  if (!form.value.escopo_id) return
  agrupando.value = true
  try {
    const { default: api } = await import('@/services/api')
    await api.post(`/escopo/${form.value.escopo_id}/agrupar`)
    loadGrupos()
    toast.add({ severity: 'success', summary: 'Ensaios agrupados com sucesso', life: 2000 })
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao agrupar ensaios', life: 5000 })
  } finally {
    agrupando.value = false
  }
}

async function handleMontar() {
  if (!form.value.escopo_id || !form.value.titulo) return

  if (form.value.tipo_auditoria === 'sem_historico_nc' && !riskWarningAccepted.value) {
    showRiskWarning.value = true
    return
  }

  loading.value = true
  try {
    const created = await store.createPlano({
      escopo_id: form.value.escopo_id,
      titulo: form.value.titulo,
      tipo_montagem: form.value.tipo_montagem,
      tipo_auditoria: form.value.tipo_auditoria,
      data_inicio: form.value.data_inicio?.toISOString().split('T')[0],
      data_fim: form.value.data_fim?.toISOString().split('T')[0],
    })

    if (form.value.tipo_montagem === 'auto') {
      const historico = form.value.tipo_auditoria === 'com_historico_nc'
        ? historicoInputs.value.map(h => ({
            grupo_escopo_id: h.grupo_escopo_id,
            qtd_ensaios: h.qtd_ensaios,
            qtd_ncs: h.qtd_ncs,
          }))
        : undefined

      const result = await store.montarAutomatico(created.id, historico)
      montagemResult.value = result
      resultLoaded.value = true
      step.value = 2
      toast.add({ severity: 'success', summary: 'Plano criado e montado automaticamente', life: 3000 })
    } else {
      toast.add({ severity: 'success', summary: 'Plano criado em rascunho. Configure manualmente os grupos.', life: 3000 })
      router.push(`/planos-auditoria/${created.id}`)
    }
  } catch (e: any) {
    const msg = e?.response?.data?.error || e?.message || 'Erro ao criar plano'
    toast.add({ severity: 'error', summary: msg, life: 5000 })
  } finally {
    loading.value = false
  }
}

function acceptRisk() {
  riskWarningAccepted.value = true
  showRiskWarning.value = false
  handleMontar()
}

function goToPlano() {
  if (montagemResult.value) {
    router.push(`/planos-auditoria/${montagemResult.value.plano_id}`)
  }
}
</script>

<template>
  <div class="flex flex-column gap-4 md:gap-6 w-full max-w-2xl mx-auto px-0 md:px-4">
    <h1 class="text-lg md:text-xl font-bold text-gray-900">Novo Plano de Auditoria</h1>

    <Steps :model="['Dados do Plano', 'Montagem', 'Resultado'].map(s => ({ label: s }))" :active-step="step" class="mb-2 overflow-x-auto" />

    <div v-if="step === 0" class="flex flex-column gap-3">
      <div>
        <label class="block mb-1 text-sm font-medium">Escopo *</label>
        <Select v-model="form.escopo_id" :options="escopos" option-label="nome" option-value="id" class="w-full" @change="onEscopoChange" />
      </div>
      <div v-if="form.escopo_id && !gruposCarregados" class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
        <div class="flex align-items-center gap-3">
          <i class="pi pi-exclamation-triangle text-orange-500 text-xl" />
          <div class="flex-1">
            <strong>Grupos não encontrados</strong>
            <p class="text-sm text-gray-500 m-0">
              Este escopo possui ensaios mas eles ainda não foram agrupados por princípio analítico.
              Execute o agrupamento antes de montar o plano.
            </p>
          </div>
          <Button label="Agrupar Ensaios" icon="pi pi-sitemap" :loading="agrupando" @click="handleAgrupar" />
        </div>
      </div>
      <div>
        <label class="block mb-1 text-sm font-medium">Título *</label>
        <InputText v-model="form.titulo" class="w-full" placeholder="Ex: Auditoria Anual 2026" />
      </div>
      <div class="grid">
        <div class="col-12 md:col-6">
          <label class="block mb-1 text-sm font-medium">Tipo de Montagem</label>
          <Select v-model="form.tipo_montagem" :options="[
            { label: 'Automática', value: 'auto' },
            { label: 'Manual', value: 'manual' },
          ]" option-label="label" option-value="value" class="w-full" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-1 text-sm font-medium">Tipo de Auditoria</label>
          <Select v-model="form.tipo_auditoria" :options="[
            { label: 'Primeira Auditoria', value: 'primeira' },
            { label: 'Sem Histórico de NC', value: 'sem_historico_nc' },
            { label: 'Com Histórico de NC', value: 'com_historico_nc' },
          ]" option-label="label" option-value="value" class="w-full" />
        </div>
      </div>
      <div class="grid">
        <div class="col-12 md:col-6">
          <label class="block mb-1 text-sm font-medium">Data de Início</label>
          <Calendar v-model="form.data_inicio" date-format="dd/mm/yy" class="w-full" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-1 text-sm font-medium">Data de Fim</label>
          <Calendar v-model="form.data_fim" date-format="dd/mm/yy" class="w-full" />
        </div>
      </div>
    </div>

    <div v-if="step === 1 && form.tipo_auditoria === 'com_historico_nc'" class="flex flex-column gap-3">
      <h2 class="text-base font-semibold m-0">Dados de Histórico de NC por Grupo</h2>
      <p class="text-gray-500 text-sm m-0">Informe a quantidade de ensaios realizados e NCs registradas para cada grupo.</p>
      <DataTable :value="historicoInputs">
        <Column field="identificador" header="Grupo" style="width: 6rem" />
        <Column field="nome" header="Nome" />
        <Column header="Ensaios Realizados" style="width: 10rem">
          <template #body="{ data }">
            <InputNumber v-model="data.qtd_ensaios" :min="0" class="w-full" />
          </template>
        </Column>
        <Column header="NCs Registradas" style="width: 10rem">
          <template #body="{ data }">
            <InputNumber v-model="data.qtd_ncs" :min="0" class="w-full" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="step === 1 && form.tipo_auditoria !== 'com_historico_nc'" class="flex flex-column gap-3">
      <Message v-if="form.tipo_auditoria === 'sem_historico_nc'" severity="warn" :closable="false">
        A utilização de dados de NC na definição da amostragem está alinhada à análise de risco da ISO/IEC 17025.
        Confirme que deseja prosseguir sem utilizar histórico.
      </Message>
    </div>

    <div v-if="step === 2 && montagemResult" class="flex flex-column gap-3">
      <Message v-if="montagemResult.risk_warning" severity="warn" :closable="false">
        {{ montagemResult.risk_warning }}
      </Message>
      <h2 class="text-base font-semibold m-0">Resultado da Montagem</h2>
      <div class="flex gap-3 flex-wrap">
        <CoberturaCard title="Cobertura Métodos" :items="montagemResult.cobertura_metodos" />
        <CoberturaCard title="Cobertura Acreditação" :items="montagemResult.cobertura_acreditacao" />
      </div>
      <Accordion :multiple="true">
        <AccordionTab v-for="g in montagemResult.grupos" :key="g.grupo_escopo_id" :header="`${g.identificador} - ${g.nome}`">
          <div class="flex flex-column gap-2">
            <div v-if="g.percentual_nc !== null" class="text-sm">
              <strong>% NC:</strong> {{ g.percentual_nc?.toFixed(2) }}%
              <Tag v-if="g.ajuste_amostragem" :value="`Ajuste: ${g.ajuste_amostragem}x`" severity="warn" class="ml-2" />
            </div>
            <DataTable :value="g.ensaios_selecionados">
              <Column field="nome" header="Ensaio" />
              <Column header="Tipo Método" style="width: 8rem">
                <template #body="{ data }">
                  <Tag :value="data.tipo_metodo || '-'" :severity="data.tipo_metodo === 'normalizado' ? 'success' : 'info'" />
                </template>
              </Column>
              <Column header="Acreditado" style="width: 8rem">
                <template #body="{ data }">
                  <Tag :value="data.acreditado ? 'Sim' : 'Não'" :severity="data.acreditado ? 'success' : 'secondary'" />
                </template>
              </Column>
              <Column header="Seleção" style="width: 8rem">
                <template #body>
                  <Tag value="Sistema" severity="info" />
                </template>
              </Column>
            </DataTable>
          </div>
        </AccordionTab>
      </Accordion>
    </div>

    <RiskWarningModal v-if="showRiskWarning" @confirm="acceptRisk" @cancel="showRiskWarning = false" />

    <div class="flex gap-2 justify-content-between flex-wrap">
      <div>
        <Button v-if="step > 0" type="button" label="Anterior" icon="pi pi-chevron-left" severity="secondary" @click="step--" />
      </div>
      <div class="flex gap-2 flex-wrap">
        <Button type="button" label="Cancelar" severity="secondary" @click="router.push('/planos-auditoria')" />
        <Button v-if="step === 0" label="Próximo" icon="pi pi-chevron-right" icon-pos="right" @click="step++" :disabled="!form.escopo_id || !form.titulo || (form.tipo_montagem === 'auto' && !gruposCarregados)" />
        <Button v-if="step === 1" :loading="loading" label="Gerar Plano" icon="pi pi-cog" @click="handleMontar" />
        <Button v-if="step === 2" label="Ver Plano" icon="pi pi-eye" @click="goToPlano" />
      </div>
    </div>
  </div>
</template>
