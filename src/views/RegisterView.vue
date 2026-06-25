<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  empresa_razao_social: '',
  empresa_nome_fantasia: '',
  empresa_cnpj: '',
  nome: '',
  email: '',
  senha: '',
})
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await authStore.register(form.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Erro ao cadastrar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen" style="background: linear-gradient(to bottom, #ffffff, #f9fafb)">
    <div class="w-full" style="max-width: 32rem">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div class="text-center mb-6">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-norma-600 text-xl font-bold text-white mb-4">iNorma</span>
          <h1 class="text-xl font-bold text-gray-900">Cadastro</h1>
          <p class="text-gray-500 mt-1 text-sm">Crie sua empresa e conta de administrador</p>
        </div>
        <form @submit.prevent="handleRegister">
          <div class="flex flex-column gap-4">
            <div>
              <label for="razao_social" class="block mb-1 text-sm font-medium text-gray-700">Razão Social</label>
              <InputText id="razao_social" v-model="form.empresa_razao_social" class="w-full" required />
            </div>
            <div>
              <label for="nome_fantasia" class="block mb-1 text-sm font-medium text-gray-700">Nome Fantasia</label>
              <InputText id="nome_fantasia" v-model="form.empresa_nome_fantasia" class="w-full" required />
            </div>
            <div>
              <label for="cnpj" class="block mb-1 text-sm font-medium text-gray-700">CNPJ</label>
              <InputText id="cnpj" v-model="form.empresa_cnpj" class="w-full" placeholder="00.000.000/0000-00" required />
            </div>
            <div class="border-top-1 pt-4" style="border-color: #e5e7eb">
              <label for="nome" class="block mb-1 text-sm font-medium text-gray-700">Seu Nome</label>
              <InputText id="nome" v-model="form.nome" class="w-full" required />
            </div>
            <div>
              <label for="email" class="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <InputText id="email" v-model="form.email" type="email" class="w-full" required />
            </div>
            <div>
              <label for="senha" class="block mb-1 text-sm font-medium text-gray-700">Senha</label>
              <Password id="senha" v-model="form.senha" class="w-full" input-class="w-full" required toggle-mask />
            </div>
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <Button type="submit" :loading="loading" label="Cadastrar" icon="pi pi-user-plus" class="w-full" size="small" />
          </div>
        </form>
        <div class="text-center mt-4">
          <span class="text-sm text-gray-500">Já tem conta? </span>
          <router-link to="/login" class="text-sm font-semibold text-norma-600 hover:text-norma-700">Fazer login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
