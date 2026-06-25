<script setup lang="ts">
import type { NormaSugerida } from '@/stores/escopoStore'

const props = defineProps<{
  normas: NormaSugerida[]
  selectedIds: number[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: number[]]
}>()

function toggleNorma(normaId: number) {
  const set = new Set(props.selectedIds)
  if (set.has(normaId)) {
    set.delete(normaId)
  } else {
    set.add(normaId)
  }
  emit('update:selectedIds', Array.from(set))
}
</script>

<template>
  <div class="flex flex-column gap-3">
    <div v-if="loading" class="flex flex-column gap-2">
      <div
        v-for="i in 3"
        :key="i"
        class="p-3 border-round surface-ground"
        style="height: 5rem"
      >
        <Skeleton width="60%" height="1rem" class="mb-2" />
        <Skeleton width="100%" height="0.75rem" class="mb-1" />
        <Skeleton width="80%" height="0.75rem" />
      </div>
    </div>

    <div v-else-if="normas.length === 0" class="text-center p-4 text-color-secondary">
      <i class="pi pi-info-circle text-2xl mb-2" style="display: block" />
      <span>Nenhuma sugestão disponível. Verifique se há normas cadastradas.</span>
    </div>

    <div
      v-for="norma in normas"
      :key="norma.id"
      class="card p-3 border-round surface-card border-1"
      :class="{ 'border-primary': selectedIds.includes(norma.id) }"
      :style="{ cursor: 'pointer' }"
      @click="toggleNorma(norma.id)"
    >
      <div class="flex align-items-center gap-2">
        <Checkbox
          :binary="true"
          :model-value="selectedIds.includes(norma.id)"
          @click.stop="toggleNorma(norma.id)"
        />
        <div class="flex-1">
          <div class="flex align-items-center gap-2 mb-1">
            <Tag :value="norma.requisito_codigo" severity="info" />
            <span v-if="norma.item_requisito" class="text-sm text-color-secondary">
              {{ norma.item_requisito }}
            </span>
            <Tag
              v-if="norma.categoria"
              :value="norma.categoria"
              severity="secondary"
              class="ml-auto"
            />
          </div>
          <p class="text-sm m-0 text-color-secondary line-height-3">
            {{ norma.texto_exigencia }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
