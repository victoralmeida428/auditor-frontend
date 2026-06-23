<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEscopoStore, type Escopo } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const router = useRouter()
const store = useEscopoStore()
const toast = useToast()
const confirm = useConfirm()

const escopos = ref<Escopo[]>([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    escopos.value = await store.listEscopos()
  } finally {
    loading.value = false
  }
})

function confirmDelete(escopo: Escopo) {
  confirm.require({
    message: `Excluir o escopo "${escopo.nome}"?`,
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteEscopo(escopo.id)
        escopos.value = escopos.value.filter((e) => e.id !== escopo.id)
        toast.add({ severity: 'success', summary: 'Excluído', life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: 'Erro ao excluir', life: 3000 })
      }
    },
  })
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="flex flex-column gap-3">
    <div class="flex align-items-center justify-content-between">
      <h1 class="text-xl font-bold m-0">Escopos</h1>
      <Button label="Novo Escopo" icon="pi pi-plus" @click="router.push('/escopo/novo')" />
    </div>

    <DataTable :value="escopos" :loading="loading" striped-rows paginator :rows="10" sort-field="created_at" :sort-order="-1">
      <Column field="id" header="ID" sortable style="width: 5rem" />
      <Column field="nome" header="Nome" sortable>
        <template #body="{ data }">
          <a class="cursor-pointer font-medium" @click="router.push(`/escopo/${data.id}`)">{{ data.nome }}</a>
        </template>
      </Column>
      <Column field="situacao_acreditacao" header="Acreditação" sortable style="width: 10rem">
        <template #body="{ data }">
          <Tag
            :value="data.situacao_acreditacao === 'acreditado' ? 'Acreditado' : 'Não Acreditado'"
            :severity="data.situacao_acreditacao === 'acreditado' ? 'success' : 'info'"
          />
        </template>
      </Column>
      <Column field="created_at" header="Criado em" sortable style="width: 10rem">
        <template #body="{ data }">
          {{ new Date(data.created_at).toLocaleDateString('pt-BR') }}
        </template>
      </Column>
      <Column header="Ações" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-eye" text rounded severity="info" v-tooltip.top="'Detalhe'" @click="router.push(`/escopo/${data.id}`)" />
            <Button icon="pi pi-pencil" text rounded severity="warn" v-tooltip.top="'Editar'" @click="router.push(`/escopo/${data.id}/editar`)" />
            <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip.top="'Excluir'" @click="confirmDelete(data)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
