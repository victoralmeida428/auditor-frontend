<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const senha = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login({ email: email.value, senha: senha.value })
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground">
    <div class="card p-5 shadow-2 border-round w-full" style="max-width: 28rem">
      <div class="text-center mb-4">
        <h1 class="text-2xl font-bold mb-1">Audit</h1>
        <p class="text-color-secondary m-0">Sistema de Gestão de Auditoria</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="flex flex-column gap-3">
          <div>
            <label for="email" class="block mb-1 text-sm font-medium">Email</label>
            <InputText id="email" v-model="email" type="email" class="w-full" placeholder="seu@email.com" required />
          </div>
          <div>
            <label for="senha" class="block mb-1 text-sm font-medium">Senha</label>
            <Password id="senha" v-model="senha" :feedback="false" class="w-full" input-class="w-full" placeholder="Sua senha" required toggle-mask />
          </div>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Button type="submit" :loading="loading" label="Entrar" icon="pi pi-sign-in" class="w-full" />
        </div>
      </form>
      <div class="text-center mt-3">
        <span class="text-sm text-color-secondary">Não tem conta? </span>
        <router-link to="/register" class="text-sm font-medium">Cadastre-se</router-link>
      </div>
    </div>
  </div>
</template>
