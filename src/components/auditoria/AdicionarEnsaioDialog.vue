<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  planoId: number
  grupoId: number
  ensaiosDisponiveis: { id: number; nome: string }[]
}>()

const emit = defineEmits<{
  confirm: [ensaioId: number]
  cancel: []
}>()

const visible = ref(true)
const selectedEnsaioId = ref<number | null>(null)

function handleConfirm() {
  if (selectedEnsaioId.value) {
    emit('confirm', selectedEnsaioId.value)
    visible.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" header="Adicionar Ensaio ao Grupo" :modal="true" style="width: 30rem" :breakpoints="{ '640px': '95vw' }" @update:visible="visible ? $emit('cancel') : ''">
    <div class="flex flex-column gap-3">
      <label class="block mb-1 text-sm font-medium">Selecione o Ensaio</label>
      <Select v-model="selectedEnsaioId" :options="ensaiosDisponiveis" option-label="nome" option-value="id" class="w-full" />
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" @click="visible = false; $emit('cancel')" />
      <Button label="Adicionar" :disabled="!selectedEnsaioId" @click="handleConfirm" />
    </template>
  </Dialog>
</template>
