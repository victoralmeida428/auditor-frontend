<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEscopoStore, type Escopo, type Ensaio, type EquipamentoCritico, type Signatario } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const store = useEscopoStore()
const toast = useToast()

const escopo = ref<Escopo | null>(null)
const ensaios = ref<Ensaio[]>([])
const equipamentos = ref<EquipamentoCritico[]>([])
const todosEquipamentos = ref<EquipamentoCritico[]>([])
const signatarios = ref<Signatario[]>([])
const todosSignatarios = ref<Signatario[]>([])
const loading = ref(true)

const linkingEquip = ref(false)
const selectedEquipamentos = ref<EquipamentoCritico[]>([])

const linkingSignatario = ref(false)
const selectedSignatarios = ref<Signatario[]>([])
const normasVinculadas = ref<any[]>([])

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    escopo.value = await store.getEscopo(id)
    ensaios.value = await store.listEnsaios(id)
    await Promise.all([loadEquipamentos(), loadSignatarios(), loadNormas()])
  } finally {
    loading.value = false
  }
})

async function loadNormas() {
  try {
    normasVinculadas.value = await store.listNormasByEscopo(Number(route.params.id))
  } catch {
    normasVinculadas.value = []
  }
}

async function loadEquipamentos() {
  const id = Number(route.params.id)
  try {
    const [vinculados, todos] = await Promise.all([
      store.listEquipamentosByEscopo(id),
      store.listEquipamentos(),
    ])
    equipamentos.value = vinculados ?? []
    todosEquipamentos.value = todos ?? []
    selectedEquipamentos.value = [...(vinculados ?? [])]
  } catch (e: any) {
    console.error('loadEquipamentos error:', e)
  }
}

async function handleLinkEquipamentos() {
  if (!escopo.value) return
  linkingEquip.value = true
  try {
    const vinculadosIds = new Set(equipamentos.value.map(e => e.id))
    const selecionadosIds = new Set(selectedEquipamentos.value.map(e => e.id))

    const add = selectedEquipamentos.value.filter(e => !vinculadosIds.has(e.id))
    const remove = equipamentos.value.filter(e => !selecionadosIds.has(e.id))

    await Promise.all([
      ...add.map(e => store.linkEquipamentoToEscopo(escopo.value!.id, e.id)),
      ...remove.map(e => store.unlinkEquipamentoFromEscopo(escopo.value!.id, e.id)),
    ])

    equipamentos.value = [...selectedEquipamentos.value]
    toast.add({ severity: 'success', summary: 'Equipamentos vinculados', life: 2000 })
  } catch (e: any) {
    console.error('handleLinkEquipamentos error:', e)
    toast.add({ severity: 'error', summary: 'Erro ao vincular equipamentos', life: 3000 })
  } finally {
    linkingEquip.value = false
  }
}

async function loadSignatarios() {
  const id = Number(route.params.id)
  try {
    const [vinculados, todos] = await Promise.all([
      store.listSignatariosByEscopo(id),
      store.listSignatarios(),
    ])
    signatarios.value = vinculados ?? []
    todosSignatarios.value = todos ?? []
    selectedSignatarios.value = [...(vinculados ?? [])]
  } catch (e: any) {
    console.error('loadSignatarios error:', e)
  }
}

async function handleLinkSignatarios() {
  if (!escopo.value) return
  linkingSignatario.value = true
  try {
    const vinculadosIds = new Set(signatarios.value.map(s => s.id))
    const selecionadosIds = new Set(selectedSignatarios.value.map(s => s.id))

    const add = selectedSignatarios.value.filter(s => !vinculadosIds.has(s.id))
    const remove = signatarios.value.filter(s => !selecionadosIds.has(s.id))

    await Promise.all([
      ...add.map(s => store.linkSignatarioToEscopo(escopo.value!.id, s.id)),
      ...remove.map(s => store.unlinkSignatarioFromEscopo(escopo.value!.id, s.id)),
    ])

    signatarios.value = [...selectedSignatarios.value]
    toast.add({ severity: 'success', summary: 'Signatários vinculados', life: 2000 })
  } catch (e: any) {
    console.error('handleLinkSignatarios error:', e)
    toast.add({ severity: 'error', summary: 'Erro ao vincular signatários', life: 3000 })
  } finally {
    linkingSignatario.value = false
  }
}

async function handleDeleteSignatario(id: number) {
  try {
    await store.deleteSignatario(id)
    signatarios.value = signatarios.value.filter(s => s.id !== id)
    selectedSignatarios.value = selectedSignatarios.value.filter(s => s.id !== id)
    toast.add({ severity: 'success', summary: 'Signatário removido', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao remover signatário', life: 3000 })
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <i class="pi pi-spin pi-spinner text-3xl" />
  </div>

  <div v-else-if="escopo" class="flex flex-column gap-6">
    <div class="flex align-items-center justify-content-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ escopo.nome }}</h1>
        <p class="text-gray-500 mt-1">{{ escopo.descricao || 'Sem descrição' }}</p>
      </div>
      <Button label="Editar" icon="pi pi-pencil" severity="warn" size="small" @click="router.push(`/escopo/${escopo.id}/editar`)" />
    </div>

    <div class="grid">
      <div class="col-12 md:col-6">
        <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
          <h3 class="text-sm font-medium text-gray-500 mb-2 uppercase">Situação</h3>
          <Tag
            :value="escopo.situacao_acreditacao === 'acreditado' ? 'Acreditado' : 'Não Acreditado'"
            :severity="escopo.situacao_acreditacao === 'acreditado' ? 'success' : 'info'"
          />
        </div>
      </div>
      <div class="col-12 md:col-6" v-if="escopo.numero_acreditacao">
        <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round">
          <h3 class="text-sm font-medium text-gray-500 mb-2 uppercase">Nº Acreditação</h3>
          <span class="text-lg font-bold">{{ escopo.numero_acreditacao }}</span>
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-base font-semibold m-0 mb-2">Ensaios ({{ (ensaios?.length ?? 0) }})</h2>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <DataTable :value="ensaios" striped-rows paginator :rows="10">
          <Column field="nome" header="Nome" sortable />
          <Column header="Matriz" sortable>
            <template #body="{ data }">{{ data.matriz || '-' }}</template>
          </Column>
          <Column field="tipo_metodo" header="Tipo Método">
            <template #body="{ data }">
              <Tag :value="data.tipo_metodo || '-'" :severity="data.tipo_metodo === 'normalizado' ? 'success' : 'warn'" />
            </template>
          </Column>
          <Column header="Acreditado" style="width: 8rem">
            <template #body="{ data }">
              <Tag :value="data.acreditado ? 'Sim' : 'Não'" :severity="data.acreditado ? 'success' : 'secondary'" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <div v-if="normasVinculadas.length > 0">
      <h2 class="text-base font-semibold m-0 mb-2">Itens da Norma Vinculados ({{ normasVinculadas.length }})</h2>
      <div class="flex flex-column gap-2">
        <div
          v-for="n in normasVinculadas"
          :key="n.id"
          class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round"
        >
          <div class="flex align-items-center gap-2 mb-1">
            <Tag :value="n.requisito_codigo" severity="info" />
            <span v-if="n.item_requisito" class="text-sm text-gray-500">{{ n.item_requisito }}</span>
            <Tag v-if="n.categoria" :value="n.categoria" severity="secondary" class="ml-auto" />
          </div>
          <p class="text-sm m-0 text-gray-500 line-height-3">{{ n.texto_exigencia }}</p>
        </div>
      </div>
    </div>

    <div>
      <div class="flex align-items-center justify-content-between mb-2">
        <h2 class="text-base font-semibold m-0">Equipamentos Críticos ({{ equipamentos?.length ?? 0 }})</h2>
        <div class="flex gap-2">
          <Button label="Gerenciar" icon="pi pi-cog" size="small" severity="secondary" @click="router.push('/equipamentos')" />
        </div>
      </div>

      <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round mb-2">
        <label class="block mb-1 text-sm font-medium">Vincular Equipamentos</label>
        <div v-if="todosEquipamentos.length === 0" class="text-gray-500 text-sm mb-2">
          Nenhum equipamento cadastrado.
          <router-link to="/equipamentos">Cadastre equipamentos primeiro</router-link>.
        </div>
        <div v-else class="flex gap-2">
          <MultiSelect
            v-model="selectedEquipamentos"
            :options="todosEquipamentos"
            option-label="nome"
            :maxSelectedLabels="3"
            placeholder="Selecione os equipamentos..."
            class="w-full"
            filter
          />
          <Button label="Salvar" icon="pi pi-check" :loading="linkingEquip" @click="handleLinkEquipamentos" />
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <DataTable :value="equipamentos" striped-rows>
          <Column field="nome" header="Nome" sortable />
          <Column field="modelo" header="Modelo">
            <template #body="{ data }">{{ data.modelo || '-' }}</template>
          </Column>
          <Column field="identificacao_interna" header="Identificação Interna">
            <template #body="{ data }">{{ data.identificacao_interna || '-' }}</template>
          </Column>
        </DataTable>
      </div>
    </div>

    <div>
      <div class="flex align-items-center justify-content-between mb-2">
        <h2 class="text-base font-semibold m-0">Equipe Técnica ({{ (signatarios?.length ?? 0) }})</h2>
        <Button label="Gerenciar" icon="pi pi-cog" size="small" severity="secondary" @click="router.push('/signatarios')" />
      </div>

      <div class="card p-3 bg-white rounded-xl border border-gray-100 shadow-sm border-round mb-2">
        <label class="block mb-1 text-sm font-medium">Vincular Signatários</label>
        <div v-if="todosSignatarios.length === 0" class="text-gray-500 text-sm mb-2">
          Nenhum signatário cadastrado.
          <router-link to="/signatarios">Cadastre a equipe primeiro</router-link>.
        </div>
        <div v-else class="flex gap-2">
          <MultiSelect
            v-model="selectedSignatarios"
            :options="todosSignatarios"
            option-label="nome"
            :maxSelectedLabels="3"
            placeholder="Selecione os signatários..."
            class="w-full"
            filter
          />
          <Button label="Salvar" icon="pi pi-check" :loading="linkingSignatario" @click="handleLinkSignatarios" />
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <DataTable :value="signatarios" striped-rows>
          <Column field="nome" header="Nome" sortable />
          <Column field="cargo" header="Cargo">
            <template #body="{ data }">{{ data.cargo || '-' }}</template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>

  <div v-else class="flex flex-column align-items-center gap-2">
    <i class="pi pi-exclamation-circle text-3xl text-gray-500" />
    <p class="text-gray-500">Escopo não encontrado</p>
    <Button label="Voltar" @click="router.push('/escopo')" />
  </div>
</template>
