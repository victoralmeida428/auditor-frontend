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
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground">
    <div class="card p-5 shadow-2 border-round w-full" style="max-width: 32rem">
      <div class="text-center mb-4">
        <h1 class="text-2xl font-bold mb-1">Cadastro</h1>
        <p class="text-color-secondary m-0">Crie sua empresa e conta de administrador</p>
      </div>
      <form @submit.prevent="handleRegister">
        <div class="flex flex-column gap-3">
          <div>
            <label for="razao_social" class="block mb-1 text-sm font-medium">Razão Social</label>
            <InputText id="razao_social" v-model="form.empresa_razao_social" class="w-full" required />
          </div>
          <div>
            <label for="nome_fantasia" class="block mb-1 text-sm font-medium">Nome Fantasia</label>
            <InputText id="nome_fantasia" v-model="form.empresa_nome_fantasia" class="w-full" required />
          </div>
          <div>
            <label for="cnpj" class="block mb-1 text-sm font-medium">CNPJ</label>
            <InputText id="cnpj" v-model="form.empresa_cnpj" class="w-full" placeholder="00.000.000/0000-00" required />
          </div>
          <div class="border-top-1 surface-border pt-3">
            <label for="nome" class="block mb-1 text-sm font-medium">Seu Nome</label>
            <InputText id="nome" v-model="form.nome" class="w-full" required />
          </div>
          <div>
            <label for="email" class="block mb-1 text-sm font-medium">Email</label>
            <InputText id="email" v-model="form.email" type="email" class="w-full" required />
          </div>
          <div>
            <label for="senha" class="block mb-1 text-sm font-medium">Senha</label>
            <Password id="senha" v-model="form.senha" class="w-full" input-class="w-full" required toggle-mask />
          </div>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Button type="submit" :loading="loading" label="Cadastrar" icon="pi pi-user-plus" class="w-full" />
        </div>
      </form>
      <div class="text-center mt-3">
        <span class="text-sm text-color-secondary">Já tem conta? </span>
        <router-link to="/login" class="text-sm font-medium">Fazer login</router-link>
      </div>
    </div>
  </div>
</template>
