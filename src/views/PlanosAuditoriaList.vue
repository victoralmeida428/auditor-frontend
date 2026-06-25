<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuditoriaStore, type PlanoAuditoria } from '@/stores/auditoriaStore'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const store = useAuditoriaStore()
const toast = useToast()

const planos = ref<PlanoAuditoria[]>([])
const loading = ref(false)

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
  <div class="flex flex-column gap-6">
    <div class="flex align-items-center justify-content-between">
      <h1 class="text-xl font-bold text-gray-900">Planos de Auditoria</h1>
      <Button label="Novo Plano" icon="pi pi-plus" size="small" @click="router.push('/planos-auditoria/novo')" />
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <DataTable :value="planos" :loading="loading" striped-rows paginator :rows="10" sort-field="created_at" :sort-order="-1">
        <Column field="id" header="ID" sortable style="width: 5rem" />
        <Column field="titulo" header="Título" sortable>
          <template #body="{ data }">
            <a class="cursor-pointer font-medium" @click="router.push(`/planos-auditoria/${data.id}`)">{{ data.titulo }}</a>
          </template>
        </Column>
        <Column header="Tipo Auditoria" style="width: 12rem">
          <template #body="{ data }">
            {{ tipoAuditoriaLabel(data.tipo_auditoria) }}
          </template>
        </Column>
        <Column header="Montagem" style="width: 8rem">
          <template #body="{ data }">
            <Tag :value="data.tipo_montagem === 'auto' ? 'Automática' : 'Manual'" :severity="data.tipo_montagem === 'auto' ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column field="status" header="Status" style="width: 8rem" sortable>
          <template #body="{ data }">
            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
          </template>
        </Column>
        <Column field="created_at" header="Criado em" sortable style="width: 10rem">
          <template #body="{ data }">
            {{ new Date(data.created_at).toLocaleDateString('pt-BR') }}
          </template>
        </Column>
        <Column header="Ações" style="width: 8rem">
          <template #body="{ data }">
            <Button icon="pi pi-eye" text rounded severity="info" v-tooltip.top="'Detalhe'" @click="router.push(`/planos-auditoria/${data.id}`)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="!loading && planos.length === 0" class="text-center p-4 text-gray-500">
      Nenhum plano de auditoria encontrado. Crie um novo plano para começar.
    </div>
  </div>
</template>
