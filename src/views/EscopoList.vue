<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEscopoStore, type Escopo } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import ResponsiveTable, { type ResponsiveColumn } from '@/components/common/ResponsiveTable.vue'

const router = useRouter()
const store = useEscopoStore()
const toast = useToast()
const confirm = useConfirm()

const escopos = ref<Escopo[]>([])
const loading = ref(false)

const columns: ResponsiveColumn[] = [
  { field: 'id', header: 'ID', style: 'width: 5rem', sortable: true },
  { field: 'nome', header: 'Nome', sortable: true },
  { field: 'situacao_acreditacao', header: 'Acreditação', style: 'width: 10rem', sortable: true },
  { field: 'created_at', header: 'Criado em', style: 'width: 10rem', sortable: true },
]

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
</script>

<template>
  <div class="flex flex-column gap-4 md:gap-6">
    <div class="flex align-items-center justify-content-between">
      <h1 class="text-lg md:text-xl font-bold text-gray-900">Escopos</h1>
      <Button label="Novo Escopo" icon="pi pi-plus" size="small" @click="router.push('/escopo/novo')" />
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <ResponsiveTable
        :value="escopos"
        :loading="loading"
        :columns="columns"
        paginator
        :rows="10"
        sort-field="created_at"
        :sort-order="-1"
        striped-rows
      >
        <template #body-nome="{ data }">
          <a class="cursor-pointer font-medium" @click="router.push(`/escopo/${data.id}`)">{{ data.nome }}</a>
        </template>
        <template #body-situacao_acreditacao="{ data }">
          <Tag
            :value="data.situacao_acreditacao === 'acreditado' ? 'Acreditado' : 'Não Acreditado'"
            :severity="data.situacao_acreditacao === 'acreditado' ? 'success' : 'info'"
          />
        </template>
        <template #body-created_at="{ data }">
          {{ new Date(data.created_at).toLocaleDateString('pt-BR') }}
        </template>
        <template #actions="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-eye" text rounded severity="info" v-tooltip.top="'Detalhe'" @click="router.push(`/escopo/${data.id}`)" />
            <Button icon="pi pi-pencil" text rounded severity="warn" v-tooltip.top="'Editar'" @click="router.push(`/escopo/${data.id}/editar`)" />
            <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip.top="'Excluir'" @click="confirmDelete(data)" />
          </div>
        </template>
      </ResponsiveTable>
    </div>
  </div>
</template>
