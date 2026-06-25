<script setup lang="ts">
import type { AvaliacaoCriterio } from '@/stores/auditoriaStore'

defineProps<{
  criterio: AvaliacaoCriterio
  readonly?: boolean
}>()

const emit = defineEmits<{
  toggle: [criterio: AvaliacaoCriterio]
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
    <div class="flex align-items-start gap-3">
      <Button
        v-if="!readonly"
        :label="criterio.atendido ? 'Sim' : 'Não'"
        :severity="criterio.atendido ? 'success' : 'danger'"
        :icon="criterio.atendido ? 'pi pi-check' : 'pi pi-times'"
        @click="$emit('toggle', criterio)"
        class="p-button-sm"
      />
      <Tag v-else :value="criterio.atendido ? 'Sim' : 'Não'" :severity="criterio.atendido ? 'success' : 'danger'" />
      <div class="flex-1 flex flex-column gap-2">
        <span class="font-medium">{{ criterio.criterio_numero }}. {{ criterio.criterio_descricao }}</span>
        <div v-if="criterio.atendido !== null && !readonly">
          <label class="block mb-1 text-sm font-medium">Evidência</label>
          <Textarea
            :model-value="criterio.evidencia_apontada"
            class="w-full"
            rows="2"
            placeholder="Descreva a evidência que comprova o atendimento..."
            @input="criterio.evidencia_apontada = ($event.target as HTMLTextAreaElement).value"
          />
        </div>
        <div v-else-if="criterio.evidencia_apontada" class="text-sm text-gray-500">
          <strong>Evidência:</strong> {{ criterio.evidencia_apontada }}
        </div>
      </div>
    </div>
  </div>
</template>
