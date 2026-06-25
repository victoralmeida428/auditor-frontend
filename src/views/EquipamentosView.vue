<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEscopoStore, type EquipamentoCritico } from '@/stores/escopoStore'
import { useToast } from 'primevue/usetoast'

const store = useEscopoStore()
const toast = useToast()

const equipamentos = ref<EquipamentoCritico[]>([])
const loading = ref(true)

const showDialog = ref(false)
const form = ref({ nome: '', modelo: '', identificacao_interna: '' })
const saving = ref(false)

onMounted(async () => {
  try {
    equipamentos.value = await store.listEquipamentos()
  } finally {
    loading.value = false
  }
})

async function handleCreate() {
  if (!form.value.nome) return
  saving.value = true
  try {
    const created = await store.createEquipamento({
      nome: form.value.nome,
      modelo: form.value.modelo || null,
      identificacao_interna: form.value.identificacao_interna || null,
    })
    equipamentos.value.push(created)
    form.value = { nome: '', modelo: '', identificacao_interna: '' }
    showDialog.value = false
    toast.add({ severity: 'success', summary: 'Equipamento cadastrado', life: 2000 })
  } catch (e: any) {
    const msg = e?.response?.data?.error || e?.message || 'Erro ao cadastrar equipamento'
    toast.add({ severity: 'error', summary: msg, life: 5000 })
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await store.deleteEquipamento(id)
    equipamentos.value = equipamentos.value.filter(e => e.id !== id)
    toast.add({ severity: 'success', summary: 'Equipamento removido', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao remover equipamento', life: 3000 })
  }
}
</script>

<template>
  <div class="flex flex-column gap-6">
    <div class="flex align-items-center justify-content-between">
      <h1 class="text-xl font-bold text-gray-900">Equipamentos</h1>
      <Button label="Novo Equipamento" icon="pi pi-plus" size="small" @click="showDialog = true" />
    </div>

    <div v-if="loading" class="flex justify-content-center">
      <i class="pi pi-spin pi-spinner text-3xl" />
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <DataTable :value="equipamentos" striped-rows paginator :rows="15">
        <Column field="nome" header="Nome" sortable />
        <Column field="modelo" header="Modelo">
          <template #body="{ data }">{{ data.modelo || '-' }}</template>
        </Column>
        <Column field="identificacao_interna" header="Identificação Interna">
          <template #body="{ data }">{{ data.identificacao_interna || '-' }}</template>
        </Column>
        <Column header="" style="width: 4rem">
          <template #body="{ data }">
            <Button icon="pi pi-trash" text rounded severity="danger" @click="handleDelete(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showDialog" header="Novo Equipamento" :modal="true" :closable="true" style="width: 30rem">
      <div class="flex flex-column gap-3">
        <div>
          <label class="block mb-1 text-sm font-medium">Nome *</label>
          <InputText v-model="form.nome" class="w-full" autofocus />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Modelo</label>
          <InputText v-model="form.modelo" class="w-full" />
        </div>
        <div>
          <label class="block mb-1 text-sm font-medium">Identificação Interna</label>
          <InputText v-model="form.identificacao_interna" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" @click="showDialog = false" />
        <Button label="Salvar" :loading="saving" @click="handleCreate" />
      </template>
    </Dialog>
  </div>
</template>
