<script setup lang="ts">
defineProps<{
  value: string
  severity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
}>()
</script>

<template>
  <Tag :value="value" :severity="severity || 'info'" />
</template>
