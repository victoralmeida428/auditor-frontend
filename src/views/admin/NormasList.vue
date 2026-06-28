<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNormaStore, type Norma } from '@/stores/normaStore'
import { useToast } from 'primevue/usetoast'
import api from '@/services/api'
import ResponsiveTable, { type ResponsiveColumn } from '@/components/common/ResponsiveTable.vue'

const router = useRouter()
const store = useNormaStore()
const toast = useToast()

const normas = ref<Norma[]>([])
const categorias = ref<string[]>([])
const filtroCategoria = ref<string | null>(null)
const loading = ref(false)

const importDialogVisible = ref(false)
const importing = ref(false)
const selectedFile = ref<File | null>(null)

const columns: ResponsiveColumn[] = [
  { field: 'requisito_codigo', header: 'Código', style: 'width: 8rem', sortable: true },
  { field: 'item_requisito', header: 'Item', style: 'width: 6rem' },
  { field: 'texto_exigencia', header: 'Exigência' },
  { field: 'categoria', header: 'Categoria', style: 'width: 8rem', sortable: true },
  { header: 'Ativo', style: 'width: 6rem' },
]

onMounted(async () => {
  loading.value = true
  try {
    const [n, c] = await Promise.all([store.list(), store.listCategorias()])
    normas.value = n
    categorias.value = c
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao carregar normas', life: 3000 })
  } finally {
    loading.value = false
  }
})

async function filtrar() {
  loading.value = true
  try {
    normas.value = await store.list(filtroCategoria.value || undefined)
  } finally {
    loading.value = false
  }
}

async function toggleAtivo(norma: Norma) {
  try {
    await store.update(norma.id, { ativo: !norma.ativo })
    norma.ativo = !norma.ativo
    toast.add({ severity: 'success', summary: `Norma ${norma.ativo ? 'ativada' : 'desativada'}`, life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao atualizar', life: 3000 })
  }
}

async function confirmDelete(id: number, codigo: string) {
  try {
    await store.remove(id)
    normas.value = normas.value.filter(n => n.id !== id)
    toast.add({ severity: 'success', summary: `Norma ${codigo} removida`, life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao remover', life: 3000 })
  }
}

function onFileSelect(event: any) {
  selectedFile.value = event.files?.[0] || null
}

async function handleImport() {
  if (!selectedFile.value) return
  importing.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    await api.post('/admin/normas/importar-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    toast.add({ severity: 'success', summary: 'Processamento da norma iniciado', detail: 'O PDF será processado em segundo plano.', life: 5000 })
    importDialogVisible.value = false
    selectedFile.value = null
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'Erro ao importar', detail: e.response?.data?.error || e.message, life: 4000 })
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="flex flex-column gap-4 md:gap-6">
    <div class="flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between gap-2">
      <h1 class="text-lg md:text-xl font-bold text-gray-900">Administração — Normas</h1>
      <div class="flex gap-2 w-full md:w-auto">
        <Button label="Importar PDF" icon="pi pi-upload" size="small" severity="info" @click="importDialogVisible = true" class="flex-1 md:flex-initial" />
        <Button label="Nova Norma" icon="pi pi-plus" size="small" @click="router.push('/admin/normas/novo')" class="flex-1 md:flex-initial" />
      </div>
    </div>

    <Select v-model="filtroCategoria" :options="categorias" placeholder="Todas as categorias" class="w-full md:w-15rem" @change="filtrar" show-clear />

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <ResponsiveTable
        :value="normas"
        :loading="loading"
        :columns="columns"
        paginator
        :rows="15"
        sort-field="requisito_codigo"
        :sort-order="1"
        striped-rows
      >
        <template #body-texto_exigencia="{ data }">
          <span class="text-sm">{{ data.texto_exigencia?.substring(0, 120) }}{{ data.texto_exigencia?.length > 120 ? '...' : '' }}</span>
        </template>
        <template #body-Ativo="{ data }">
          <i :class="data.ativo ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'" style="cursor: pointer" @click="toggleAtivo(data)" />
        </template>
        <template #actions="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" text rounded severity="warn" v-tooltip.top="'Editar'" @click="router.push(`/admin/normas/${data.id}/editar`)" />
            <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip.top="'Excluir'" @click="confirmDelete(data.id, data.requisito_codigo)" />
          </div>
        </template>
      </ResponsiveTable>
    </div>

    <Dialog v-model:visible="importDialogVisible" header="Importar PDF da Norma" :modal="true" :closable="!importing" style="width: 30rem" :breakpoints="{ '640px': '95vw' }">
      <div class="flex flex-column gap-3">
        <p class="text-sm text-color-secondary m-0">
          Envie o PDF da norma ISO 17025. O sistema extrairá automaticamente os itens, gerará embeddings e populá a tabela de normas.
        </p>
        <FileUpload
          mode="basic"
          accept=".pdf"
          :auto="false"
          :choose-label="selectedFile ? selectedFile.name : 'Selecionar PDF'"
          @select="onFileSelect"
        />
        <small class="text-color-secondary">Formatos aceitos: PDF</small>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" :disabled="importing" @click="importDialogVisible = false" />
        <Button label="Importar" :loading="importing" :disabled="!selectedFile" @click="handleImport" />
      </template>
    </Dialog>
  </div>
</template>
