<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEscopoStore, type Escopo, type Ensaio } from '@/stores/escopoStore'

const route = useRoute()
const router = useRouter()
const store = useEscopoStore()

const escopo = ref<Escopo | null>(null)
const ensaios = ref<Ensaio[]>([])
const loading = ref(true)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    escopo.value = await store.getEscopo(id)
    ensaios.value = await store.listEnsaios(id)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <i class="pi pi-spin pi-spinner text-3xl" />
  </div>

  <div v-else-if="escopo" class="flex flex-column gap-4">
    <div class="flex align-items-center justify-content-between">
      <div>
        <h1 class="text-xl font-bold m-0">{{ escopo.nome }}</h1>
        <p class="text-color-secondary m-0 mt-1">{{ escopo.descricao || 'Sem descrição' }}</p>
      </div>
      <Button label="Editar" icon="pi pi-pencil" severity="warn" @click="router.push(`/escopo/${escopo.id}/editar`)" />
    </div>

    <div class="grid">
      <div class="col-12 md:col-6">
        <div class="card p-3 surface-ground border-round">
          <h3 class="text-sm font-medium text-color-secondary mb-2 uppercase">Situação</h3>
          <Tag
            :value="escopo.situacao_acreditacao === 'acreditado' ? 'Acreditado' : 'Não Acreditado'"
            :severity="escopo.situacao_acreditacao === 'acreditado' ? 'success' : 'info'"
          />
        </div>
      </div>
      <div class="col-12 md:col-6" v-if="escopo.numero_acreditacao">
        <div class="card p-3 surface-ground border-round">
          <h3 class="text-sm font-medium text-color-secondary mb-2 uppercase">Nº Acreditação</h3>
          <span class="text-lg font-bold">{{ escopo.numero_acreditacao }}</span>
        </div>
      </div>
    </div>

    <div>
      <h2 class="text-lg font-medium m-0 mb-2">Ensaios ({{ ensaios.length }})</h2>
      <DataTable :value="ensaios" striped-rows paginator :rows="10">
        <Column field="nome" header="Nome" sortable />
        <Column field="matriz" header="Matriz" sortable />
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

  <div v-else class="flex flex-column align-items-center gap-2">
    <i class="pi pi-exclamation-circle text-3xl text-color-secondary" />
    <p class="text-color-secondary">Escopo não encontrado</p>
    <Button label="Voltar" @click="router.push('/escopo')" />
  </div>
</template>
