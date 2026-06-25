<script setup lang="ts">
defineProps<{
  title: string
  items: string[]
  emptyText?: string
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
    <span class="text-sm text-gray-500">{{ title }}</span>
    <div class="flex gap-1 mt-1">
      <Tag v-for="item in items" :key="item" :value="item" severity="info" />
      <span v-if="items.length === 0" class="text-sm">{{ emptyText || '-' }}</span>
    </div>
  </div>
</template>
