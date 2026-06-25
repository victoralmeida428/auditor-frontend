<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEscopoStore } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'
import NormaSuggestionList from '@/components/norma/NormaSuggestionList.vue'

const router = useRouter()
const route = useRoute()
const store = useEscopoStore()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const escopoId = computed(() => Number(route.params.id))

const step = ref(0)
const loading = ref(false)
const savingNormas = ref(false)
const error = ref('')

const form = ref({
  nome: '',
  descricao: '',
  areas_atuacao: [] as string[],
  situacao_acreditacao: 'nao_acreditado',
  numero_acreditacao: '',
})

const principiosAnaliticos = ref<any[]>([])

onMounted(async () => {
  try {
    principiosAnaliticos.value = await store.listPrincipiosAnaliticos()
    if (isEditing.value) {
      const escopo = await store.getEscopo(escopoId.value)
      form.value.nome = escopo.nome
      form.value.descricao = escopo.descricao || ''
      form.value.areas_atuacao = escopo.areas_atuacao || []
      form.value.situacao_acreditacao = escopo.situacao_acreditacao
      form.value.numero_acreditacao = escopo.numero_acreditacao || ''
      await loadEnsaios()
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar dados', life: 3000 })
  }
})

const pendingEnsaios = ref<any[]>([])
const novoEnsaio = ref({
  nome: '',
  matriz: '',
  metodo_id: null as number | null,
  tipo_metodo: '',
  principio_analitico_id: null as number | null,
  acreditado: false,
  categoria_ensaio_id: null as number | null,
})

async function loadEnsaios() {
  if (escopoId.value) {
    pendingEnsaios.value = await store.listEnsaios(escopoId.value)
  }
}

function addEnsaio() {
  if (!novoEnsaio.value.nome) return
  pendingEnsaios.value.push({ ...novoEnsaio.value })
  novoEnsaio.value = { nome: '', matriz: '', metodo_id: null, tipo_metodo: '', principio_analitico_id: null, acreditado: false, categoria_ensaio_id: null }
}

function removeEnsaio(index: number) {
  pendingEnsaios.value.splice(index, 1)
}

// Sugestão de normas
const normasSugeridas = ref<any[]>([])
const selectedNormaIds = ref<number[]>([])
const loadingSugestao = ref(false)

async function loadSugestoes() {
  loadingSugestao.value = true
  try {
    const inlineData = {
      escopo: {
        nome: form.value.nome,
        descricao: form.value.descricao,
        areas_atuacao: form.value.areas_atuacao,
      },
      ensaios: pendingEnsaios.value.map((e: any) => ({
        nome: e.nome,
        matriz: e.matriz,
        tipo_metodo: e.tipo_metodo,
        principio: '',
        acreditado: e.acreditado,
      })),
    }
    const result = await store.sugerirNormas(escopoId.value || 0, inlineData)
    normasSugeridas.value = result.sugeridas
    selectedNormaIds.value = result.vinculadas || []

    if (result.vinculadas.length === 0 && result.sugeridas.length > 0) {
      selectedNormaIds.value = result.sugeridas.map((n: any) => n.id)
    }
  } catch (e: any) {
    toast.add({ severity: 'warn', summary: 'Não foi possível obter sugestões', detail: 'Você pode vincular normas manualmente depois.', life: 4000 })
  } finally {
    loadingSugestao.value = false
  }
}

function onStepChange(newStep: number) {
  step.value = newStep
  if (newStep === 2 && normasSugeridas.value.length === 0) {
    loadSugestoes()
  }
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const payload: any = { nome: form.value.nome }
    if (form.value.descricao) payload.descricao = form.value.descricao
    if (form.value.areas_atuacao.length) payload.areas_atuacao = form.value.areas_atuacao
    payload.situacao_acreditacao = form.value.situacao_acreditacao
    if (form.value.numero_acreditacao) payload.numero_acreditacao = form.value.numero_acreditacao

    if (isEditing.value) {
      await store.updateEscopo(escopoId.value, payload)
      if (selectedNormaIds.value.length > 0) {
        await store.saveNormasSelecionadas(escopoId.value, selectedNormaIds.value)
      }
      toast.add({ severity: 'success', summary: 'Escopo atualizado', life: 2000 })
      router.push(`/escopo/${escopoId.value}`)
    } else {
      const created = await store.createEscopo(payload)
      for (const e of pendingEnsaios.value) {
        await store.createEnsaio(created.id, e)
      }
      if (selectedNormaIds.value.length > 0) {
        await store.saveNormasSelecionadas(created.id, selectedNormaIds.value)
      }
      toast.add({ severity: 'success', summary: 'Escopo criado com sucesso', life: 2000 })
      router.push(`/escopo/${created.id}`)
    }
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Erro ao salvar escopo'
  } finally {
    loading.value = false
  }
}

const steps = ['Dados Básicos', 'Ensaios', 'Sugestão de Normas', 'Revisão']
</script>

<template>
  <div class="flex flex-column gap-6" style="max-width: 50rem">
    <h1 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Editar Escopo' : 'Novo Escopo' }}</h1>

    <Steps :model="steps.map(s => ({ label: s }))" :active-step="step" class="mb-2" @update:active-step="onStepChange" />

    <!-- Step 0: Dados Básicos -->
    <div v-if="step === 0" class="flex flex-column gap-3">
      <div>
        <label for="nome" class="block mb-1 text-sm font-medium">Nome *</label>
        <InputText id="nome" v-model="form.nome" class="w-full" required />
      </div>
      <div>
        <label for="descricao" class="block mb-1 text-sm font-medium">Descrição</label>
        <Textarea id="descricao" v-model="form.descricao" class="w-full" rows="3" />
      </div>
      <div>
        <label for="acreditacao" class="block mb-1 text-sm font-medium">Situação de Acreditação</label>
        <Select
          id="acreditacao"
          v-model="form.situacao_acreditacao"
          :options="[
            { label: 'Não Acreditado', value: 'nao_acreditado' },
            { label: 'Acreditado', value: 'acreditado' },
          ]"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
      <div v-if="form.situacao_acreditacao === 'acreditado'">
        <label for="num_acreditacao" class="block mb-1 text-sm font-medium">Nº Acreditação</label>
        <InputText id="num_acreditacao" v-model="form.numero_acreditacao" class="w-full" />
      </div>
    </div>

    <!-- Step 1: Ensaios -->
    <div v-if="step === 1">
      <div class="flex flex-column gap-3">
        <h2 class="text-base font-semibold m-0">Ensaios</h2>

        <div class="grid formgrid">
          <div class="col-6">
            <label class="block mb-1 text-sm font-medium">Nome do Ensaio</label>
            <InputText v-model="novoEnsaio.nome" class="w-full" placeholder="Ex: pH em Água" />
          </div>
          <div class="col-6">
            <label class="block mb-1 text-sm font-medium">Matriz</label>
            <InputText v-model="novoEnsaio.matriz" class="w-full" placeholder="Ex: Água" />
          </div>
          <div class="col-6">
            <label class="block mb-1 text-sm font-medium">Princípio Analítico</label>
            <Select
              v-model="novoEnsaio.principio_analitico_id"
              :options="principiosAnaliticos"
              option-label="nome"
              option-value="id"
              class="w-full"
              show-clear
            />
          </div>
          <div class="col-6">
            <label class="block mb-1 text-sm font-medium">Tipo de Método</label>
            <Select
              v-model="novoEnsaio.tipo_metodo"
              :options="[
                { label: 'Normalizado', value: 'normalizado' },
                { label: 'Não Normalizado', value: 'nao_normalizado' },
              ]"
              option-label="label"
              option-value="value"
              class="w-full"
              show-clear
            />
          </div>
          <div class="col-12">
            <label class="flex align-items-center gap-2">
              <Checkbox v-model="novoEnsaio.acreditado" :binary="true" />
              <span class="text-sm">Acreditado</span>
            </label>
          </div>
          <div class="col-12">
            <Button label="Adicionar Ensaio" icon="pi pi-plus" @click="addEnsaio" :disabled="!novoEnsaio.nome" />
          </div>
        </div>

        <DataTable :value="pendingEnsaios" striped-rows>
          <Column field="nome" header="Nome" />
          <Column field="matriz" header="Matriz" />
          <Column header="Princípio">
            <template #body="{ data }">
              {{ principiosAnaliticos.find(p => p.id === data.principio_analitico_id)?.nome || '-' }}
            </template>
          </Column>
          <Column header="Acreditado">
            <template #body="{ data }">
              <Tag :value="data.acreditado ? 'Sim' : 'Não'" :severity="data.acreditado ? 'success' : 'secondary'" />
            </template>
          </Column>
          <Column header="" style="width: 4rem">
            <template #body="{ index }">
              <Button icon="pi pi-trash" text rounded severity="danger" @click="removeEnsaio(index)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Step 2: Sugestão de Normas -->
    <div v-if="step === 2">
      <div class="flex flex-column gap-3">
        <h2 class="text-base font-semibold m-0">Sugestão de Itens da Norma</h2>
        <p class="text-sm text-gray-500 mt-1">
          Com base nos dados do escopo e ensaios, a IA sugere os itens mais relevantes da ISO 17025.
          Selecione os que deseja vincular.
        </p>

        <NormaSuggestionList
          :normas="normasSugeridas"
          :selected-ids="selectedNormaIds"
          :loading="loadingSugestao"
          @update:selected-ids="selectedNormaIds = $event"
        />

        <div v-if="!loadingSugestao && normasSugeridas.length > 0" class="text-sm text-gray-500">
          {{ selectedNormaIds.length }} de {{ normasSugeridas.length }} selecionados
        </div>
      </div>
    </div>

    <!-- Step 3: Revisão -->
    <div v-if="step === 3" class="flex flex-column gap-3">
      <h2 class="text-base font-semibold m-0">Revisão</h2>
      <div class="card bg-white rounded-xl border border-gray-100 shadow-sm p-3 border-round">
        <div class="grid">
          <div class="col-6"><strong>Nome:</strong> {{ form.nome }}</div>
          <div class="col-6"><strong>Descrição:</strong> {{ form.descricao || '-' }}</div>
          <div class="col-6"><strong>Acreditação:</strong> {{ form.situacao_acreditacao === 'acreditado' ? 'Sim' : 'Não' }}</div>
          <div class="col-6" v-if="form.numero_acreditacao"><strong>Nº Acreditação:</strong> {{ form.numero_acreditacao }}</div>
        </div>
      </div>
      <h3 class="text-md font-medium m-0">Ensaios ({{ pendingEnsaios.length }})</h3>
      <DataTable :value="pendingEnsaios" striped-rows>
        <Column field="nome" header="Nome" />
        <Column field="matriz" header="Matriz" />
      </DataTable>
      <h3 class="text-md font-medium m-0">Itens da Norma ({{ selectedNormaIds.length }})</h3>
      <div class="flex flex-wrap gap-2">
        <Tag
          v-for="n in normasSugeridas.filter(n => selectedNormaIds.includes(n.id))"
          :key="n.id"
          :value="`${n.requisito_codigo} ${n.item_requisito || ''}`"
          severity="info"
        />
      </div>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div class="flex gap-2 justify-content-between">
      <div>
        <Button v-if="step > 0" type="button" label="Anterior" icon="pi pi-chevron-left" severity="secondary" @click="step--" />
      </div>
      <div class="flex gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="router.push('/escopo')" />
        <Button v-if="step < steps.length - 1" label="Próximo" icon="pi pi-chevron-right" icon-pos="right" @click="onStepChange(step + 1)" />
        <Button v-else :loading="loading" label="Salvar" icon="pi pi-check" @click="handleSubmit" />
      </div>
    </div>
  </div>
</template>
