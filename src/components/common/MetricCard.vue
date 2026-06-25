<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  color?: string
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center hover:shadow-md transition-all">
    <i :class="[icon, 'text-2xl mb-2 block']" :style="color ? `color: ${color}` : 'color: #2563eb'" />
    <span class="text-2xl font-bold text-gray-900">{{ value }}</span>
    <div class="text-sm text-gray-500">{{ label }}</div>
  </div>
</template>
