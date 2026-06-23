<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/layouts/AppLayout.vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const authStore = useAuthStore()
</script>

<template>
  <Toast />
  <ConfirmDialog />
  <AppLayout v-if="authStore.isAuthenticated" />
  <router-view v-else />
</template>
