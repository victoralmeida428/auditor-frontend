<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  documentosDisponiveis: { id: number; nome_original: string }[]
}>()

const emit = defineEmits<{
  confirm: [documentoId: number, tipo: string]
  cancel: []
}>()

const visible = ref(true)
const documentoSelecionado = ref<number | null>(null)
const tipoDocumento = ref<'obrigatorio' | 'complementar'>('complementar')

function handleConfirm() {
  if (documentoSelecionado.value) {
    emit('confirm', documentoSelecionado.value, tipoDocumento.value)
    visible.value = false
  }
}
</script>

<template>
  <Dialog v-model:visible="visible" header="Vincular Documento como Evidência" :modal="true" style="width: 30rem" :breakpoints="{ '640px': '95vw' }" @update:visible="!visible ? $emit('cancel') : ''">
    <div class="flex flex-column gap-3">
      <div>
        <label class="block mb-1 text-sm font-medium">Documento</label>
        <Select v-model="documentoSelecionado" :options="documentosDisponiveis" option-label="nome_original" option-value="id" class="w-full" />
      </div>
      <div>
        <label class="block mb-1 text-sm font-medium">Tipo</label>
        <Select v-model="tipoDocumento" :options="[
          { label: 'Obrigatório', value: 'obrigatorio' },
          { label: 'Complementar', value: 'complementar' },
        ]" option-label="label" option-value="value" class="w-full" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" @click="visible = false; $emit('cancel')" />
      <Button label="Vincular" :disabled="!documentoSelecionado" @click="handleConfirm" />
    </template>
  </Dialog>
</template>
