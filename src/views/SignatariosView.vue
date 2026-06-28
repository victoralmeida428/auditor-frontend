<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEscopoStore, type Signatario } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'
import ResponsiveTable, { type ResponsiveColumn } from '@/components/common/ResponsiveTable.vue'

const store = useEscopoStore()
const toast = useToast()

const signatarios = ref<Signatario[]>([])
const loading = ref(true)

const showDialog = ref(false)
const form = ref({ nome: '', cargo: '' })
const saving = ref(false)

const columns: ResponsiveColumn[] = [
  { field: 'nome', header: 'Nome', sortable: true },
  { field: 'cargo', header: 'Cargo' },
]

onMounted(async () => {
  try {
    signatarios.value = await store.listSignatarios()
  } finally {
    loading.value = false
  }
})

async function handleCreate() {
  if (!form.value.nome) return
  saving.value = true
  try {
    const created = await store.createSignatario({
      nome: form.value.nome,
      cargo: form.value.cargo || null,
    })
    signatarios.value.push(created)
    form.value = { nome: '', cargo: '' }
    showDialog.value = false
    toast.add({ severity: 'success', summary: 'Signatário cadastrado', life: 2000 })
  } catch (e: any) {
    const msg = e?.response?.data?.error || e?.message || 'Erro ao cadastrar signatário'
    toast.add({ severity: 'error', summary: msg, life: 5000 })
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await store.deleteSignatario(id)
    signatarios.value = signatarios.value.filter(s => s.id !== id)
    toast.add({ severity: 'success', summary: 'Signatário removido', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao remover signatário', life: 3000 })
  }
}
</script>

<template>
  <div class="flex flex-column gap-4 md:gap-6">
    <div class="flex align-items-center justify-content-between">
      <h1 class="text-lg md:text-xl font-bold text-gray-900">Equipe Técnica</h1>
      <Button label="Novo Signatário" icon="pi pi-plus" size="small" @click="showDialog = true" />
    </div>

    <div v-if="loading" class="flex justify-content-center">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <ResponsiveTable :value="signatarios" :columns="columns" paginator :rows="15" striped-rows>
        <template #body-cargo="{ data }">{{ data.cargo || '-' }}</template>
        <template #actions="{ data }">
          <Button icon="pi pi-trash" text rounded severity="danger" @click="handleDelete(data.id)" />
        </template>
      </ResponsiveTable>
    </div>

    <Dialog v-model:visible="showDialog" header="Novo Signatário" :modal="true" :closable="true" style="width: 30rem" :breakpoints="{ '640px': '95vw' }">
      <div class="flex flex-column gap-3">
        <div>
          <label class="block mb-1 text-sm font-medium">Nome *</label>
          <InputText v-model="form.nome" class="w-full" autofocus />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Cargo</label>
          <InputText v-model="form.cargo" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="showDialog = false" />
        <Button label="Salvar" :loading="saving" @click="handleCreate" />
      </template>
    </Dialog>
  </div>
</template>
