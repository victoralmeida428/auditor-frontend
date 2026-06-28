<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuditoriaStore, type PlanoAuditoria } from '@/stores/auditoriaStore'
import { useToast } from 'primevue/usetoast'
import ResponsiveTable, { type ResponsiveColumn } from '@/components/common/ResponsiveTable.vue'

const router = useRouter()
const store = useAuditoriaStore()
const toast = useToast()

const planos = ref<PlanoAuditoria[]>([])
const loading = ref(false)

const columns: ResponsiveColumn[] = [
  { field: 'id', header: 'ID', style: 'width: 5rem', sortable: true },
  { field: 'titulo', header: 'Título', sortable: true },
  { field: 'tipo_auditoria', header: 'Tipo Auditoria', style: 'width: 12rem' },
  { header: 'Montagem', style: 'width: 8rem' },
  { field: 'status', header: 'Status', style: 'width: 8rem', sortable: true },
  { field: 'created_at', header: 'Criado em', style: 'width: 10rem', sortable: true },
]

onMounted(async () => {
  loading.value = true
  try {
    planos.value = await store.listPlanos() ?? []
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Erro ao carregar planos', life: 3000 })
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

function tipoAuditoriaLabel(tipo: string) {
  const map: Record<string, string> = {
    primeira: 'Primeira Auditoria',
    sem_historico_nc: 'Sem Histórico de NC',
    com_historico_nc: 'Com Histórico de NC',
  }
  return map[tipo] || tipo
}
</script>

<template>
  <div class="flex flex-column gap-4 md:gap-6">
    <div class="flex align-items-center justify-content-between">
      <h1 class="text-lg md:text-xl font-bold text-gray-900">Planos de Auditoria</h1>
      <Button label="Novo Plano" icon="pi pi-plus" size="small" @click="router.push('/planos-auditoria/novo')" />
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <ResponsiveTable
        :value="planos"
        :loading="loading"
        :columns="columns"
        paginator
        :rows="10"
        sort-field="created_at"
        :sort-order="-1"
        striped-rows
      >
        <template #body-titulo="{ data }">
          <a class="cursor-pointer font-medium" @click="router.push(`/planos-auditoria/${data.id}`)">{{ data.titulo }}</a>
        </template>
        <template #body-tipo_auditoria="{ data }">
          {{ tipoAuditoriaLabel(data.tipo_auditoria) }}
        </template>
        <template #body-Montagem="{ data }">
          <Tag :value="data.tipo_montagem === 'auto' ? 'Automática' : 'Manual'" :severity="data.tipo_montagem === 'auto' ? 'success' : 'warn'" />
        </template>
        <template #body-status="{ data }">
          <Tag :value="data.status" :severity="statusSeverity(data.status)" />
        </template>
        <template #body-created_at="{ data }">
          {{ new Date(data.created_at).toLocaleDateString('pt-BR') }}
        </template>
        <template #actions="{ data }">
          <Button icon="pi pi-eye" text rounded severity="info" v-tooltip.top="'Detalhe'" @click="router.push(`/planos-auditoria/${data.id}`)" />
        </template>
      </ResponsiveTable>
    </div>

    <div v-if="!loading && planos.length === 0" class="text-center p-4 text-gray-500">
      Nenhum plano de auditoria encontrado. Crie um novo plano para começar.
    </div>
  </div>
</template>
