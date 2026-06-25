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
  <div class="flex align-items-center justify-content-center min-h-screen" style="background: linear-gradient(to bottom, #ffffff, #f9fafb)">
    <div class="w-full" style="max-width: 28rem">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div class="text-center mb-6">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-norma-600 text-xl font-bold text-white mb-4">iNorma</span>
          <h1 class="text-xl font-bold text-gray-900">Entrar</h1>
          <p class="text-gray-500 mt-1 text-sm">Sistema de Gestão de Auditoria</p>
        </div>
        <form @submit.prevent="handleLogin">
          <div class="flex flex-column gap-4">
            <div>
              <label for="email" class="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <InputText id="email" v-model="email" type="email" class="w-full" placeholder="seu@email.com" required />
            </div>
            <div>
              <label for="senha" class="block mb-1 text-sm font-medium text-gray-700">Senha</label>
              <Password id="senha" v-model="senha" :feedback="false" class="w-full" input-class="w-full" placeholder="Sua senha" required toggle-mask />
            </div>
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <Button type="submit" :loading="loading" label="Entrar" icon="pi pi-sign-in" class="w-full" size="small" />
          </div>
        </form>
        <div class="text-center mt-4">
          <span class="text-sm text-gray-500">Não tem conta? </span>
          <router-link to="/register" class="text-sm font-semibold text-norma-600 hover:text-norma-700">Cadastre-se</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
