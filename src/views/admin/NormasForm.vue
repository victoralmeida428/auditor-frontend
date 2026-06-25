<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNormaStore, type Norma } from '@/stores/normaStore'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const route = useRoute()
const store = useNormaStore()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const normaId = computed(() => Number(route.params.id))

const form = ref({
  requisito_codigo: '',
  item_requisito: '',
  texto_exigencia: '',
  categoria: '',
})
const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
  if (isEditing.value) {
    loading.value = true
    try {
      const n = await store.getById(normaId.value)
      form.value = {
        requisito_codigo: n.requisito_codigo,
        item_requisito: n.item_requisito || '',
        texto_exigencia: n.texto_exigencia,
        categoria: n.categoria || '',
      }
    } catch {
      toast.add({ severity: 'error', summary: 'Erro ao carregar norma', life: 3000 })
    } finally {
      loading.value = false
    }
  }
})

async function handleSave() {
  if (!form.value.requisito_codigo || !form.value.texto_exigencia) return
  saving.value = true
  try {
    const payload: any = {
      requisito_codigo: form.value.requisito_codigo,
      texto_exigencia: form.value.texto_exigencia,
    }
    if (form.value.item_requisito) payload.item_requisito = form.value.item_requisito
    if (form.value.categoria) payload.categoria = form.value.categoria

    if (isEditing.value) {
      await store.update(normaId.value, payload)
      toast.add({ severity: 'success', summary: 'Norma atualizada', life: 2000 })
    } else {
      await store.create(payload)
      toast.add({ severity: 'success', summary: 'Norma criada', life: 2000 })
    }
    router.push('/admin/normas')
  } catch (e: any) {
    toast.add({ severity: 'error', summary: e?.response?.data?.error || 'Erro ao salvar', life: 5000 })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-content-center">
    <i class="pi pi-spin pi-spinner text-3xl" />
  </div>

  <div v-else class="flex flex-column gap-6" style="max-width: 40rem">
    <h1 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Editar Norma' : 'Nova Norma' }}</h1>

    <div class="flex flex-column gap-3">
      <div class="grid">
        <div class="col-6">
          <label class="block mb-1 text-sm font-medium">Código do Requisito *</label>
          <InputText v-model="form.requisito_codigo" class="w-full" placeholder="Ex: 4.1, ISO 9001:2015" />
        </div>
        <div class="col-6">
          <label class="block mb-1 text-sm font-medium">Item</label>
          <InputText v-model="form.item_requisito" class="w-full" placeholder="Ex: 4.1.1" />
        </div>
      </div>
      <div>
        <label class="block mb-1 text-sm font-medium">Texto da Exigência *</label>
        <Textarea v-model="form.texto_exigencia" class="w-full" rows="6" placeholder="Texto completo do requisito..." />
      </div>
      <div>
        <label class="block mb-1 text-sm font-medium">Categoria</label>
        <InputText v-model="form.categoria" class="w-full" placeholder="Ex: ISO 17025, DICLA, INMETRO" />
      </div>
    </div>

    <div class="flex gap-2 justify-content-end">
      <Button label="Cancelar" severity="secondary" @click="router.push('/admin/normas')" />
      <Button :loading="saving" label="Salvar" icon="pi pi-check" :disabled="!form.requisito_codigo || !form.texto_exigencia" @click="handleSave" />
    </div>
  </div>
</template>
