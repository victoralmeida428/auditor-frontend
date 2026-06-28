<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

export interface ResponsiveColumn {
  field?: string
  header: string
  style?: string
  sortable?: boolean
}

const props = defineProps<{
  value: any[]
  loading?: boolean
  columns: ResponsiveColumn[]
  paginator?: boolean
  rows?: number
  sortField?: string
  sortOrder?: number
  stripedRows?: boolean
  emptyMessage?: string
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

const sortedValue = computed(() => {
  if (!props.sortField || !props.value) return props.value || []
  const arr = [...props.value]
  const order = props.sortOrder ?? 1
  arr.sort((a: any, b: any) => {
    const va = a[props.sortField!]
    const vb = b[props.sortField!]
    if (va == null) return 1
    if (vb == null) return -1
    return va < vb ? -order : va > vb ? order : 0
  })
  return arr
})

const currentPage = ref(1)
const perPage = computed(() => props.rows ?? 10)

const paginatedValue = computed(() => {
  if (!props.paginator) return sortedValue.value
  const start = (currentPage.value - 1) * perPage.value
  return sortedValue.value.slice(start, start + perPage.value)
})

const totalPages = computed(() => {
  if (!props.paginator) return 1
  return Math.ceil((sortedValue.value?.length || 0) / perPage.value)
})

function pageChange(page: number) {
  currentPage.value = page
}

function cellValue(item: any, col: ResponsiveColumn): string {
  if (col.field) return item[col.field] ?? '-'
  return '-'
}
</script>

<template>
  <div v-if="!isMobile">
    <DataTable
      :value="value"
      :loading="loading"
      :striped-rows="stripedRows"
      :paginator="paginator"
      :rows="rows"
      :sort-field="sortField"
      :sort-order="sortOrder"
    >
      <Column
        v-for="col in columns"
        :key="col.header"
        :field="col.field"
        :header="col.header"
        :sortable="col.sortable"
        :style="col.style"
      >
        <template #body="{ data }">
          <slot :name="`body-${col.field || col.header}`" :data="data">
            {{ cellValue(data, col) }}
          </slot>
        </template>
      </Column>
      <Column v-if="$slots.actions" header="Ações" :style="{ width: '8rem' }">
        <template #body="{ data }">
          <slot name="actions" :data="data" />
        </template>
      </Column>
    </DataTable>
  </div>

  <div v-else class="flex flex-column gap-3">
    <div v-if="loading" class="flex justify-content-center py-4">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>

    <template v-else>
      <div
        v-for="(item, idx) in paginatedValue"
        :key="item.id ?? item.nome ?? item.titulo ?? idx"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-3"
      >
        <div v-for="col in columns" :key="col.header" class="flex justify-content-between items-center py-1 border-bottom-1" style="border-color: #f9fafb">
          <span class="font-medium text-gray-500 text-xs">{{ col.header }}</span>
          <span class="text-sm text-gray-800 text-right">
            <slot :name="`body-${col.field || col.header}`" :data="item">
              {{ cellValue(item, col) }}
            </slot>
          </span>
        </div>

        <div v-if="$slots.actions" class="flex justify-content-end gap-1 mt-2 pt-2">
          <slot name="actions" :data="item" />
        </div>
      </div>

      <div v-if="paginatedValue.length === 0 && !loading" class="text-center py-4 text-sm text-gray-500">
        {{ emptyMessage || 'Nenhum registro encontrado.' }}
      </div>

      <div v-if="paginator && totalPages > 1" class="flex align-items-center justify-content-center gap-2 py-2">
        <Button icon="pi pi-chevron-left" text rounded size="small" :disabled="currentPage <= 1" @click="pageChange(currentPage - 1)" />
        <span class="text-sm text-gray-600 px-2">{{ currentPage }} / {{ totalPages }}</span>
        <Button icon="pi pi-chevron-right" text rounded size="small" :disabled="currentPage >= totalPages" @click="pageChange(currentPage + 1)" />
      </div>
    </template>
  </div>
</template>
