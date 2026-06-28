<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useDocumentStore, type Documento } from '@/stores/documentStore'
import { storeToRefs } from 'pinia'
import api from '@/services/api'
import ResponsiveTable, { type ResponsiveColumn } from '@/components/common/ResponsiveTable.vue'

const store = useDocumentStore()
const toast = useToast()
const confirm = useConfirm()

const { documentos, loading } = storeToRefs(store)
const uploading = ref(false)

const columns: ResponsiveColumn[] = [
  { field: 'nome_original', header: 'Nome' },
  { field: 'tipo_arquivo', header: 'Tipo' },
  { field: 'tamanho_bytes', header: 'Tamanho' },
  { field: 'status', header: 'Status' },
  { field: 'created_at', header: 'Enviado em' },
]

onMounted(async () => {
  loading.value = true
  try {
    await store.listDocumentos()
  } finally {
    loading.value = false
  }
  store.connectSSE()
})

onUnmounted(() => {
  store.disconnectSSE()
})

async function onUpload(event: any) {
  uploading.value = true
  try {
    const files = event.files as File[]
    for (const file of files) {
      await store.uploadDocumento(file)
    }
    await store.listDocumentos()
    toast.add({ severity: 'success', summary: `${files.length} arquivo(s) enviado(s)`, life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro no upload', life: 3000 })
  } finally {
    uploading.value = false
  }
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function download(doc: Documento) {
  try {
    const response = await api.get(`/documentos/${doc.id}/download`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.nome_original
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao baixar arquivo', life: 3000 })
  }
}

async function reprocessar(doc: Documento) {
  try {
    await store.reprocessarDocumento(doc.id)
    doc.status = 'pending'
    toast.add({ severity: 'success', summary: 'Reprocessamento solicitado', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao solicitar reprocessamento', life: 3000 })
  }
}

function confirmDelete(doc: Documento) {
  confirm.require({
    message: `Excluir "${doc.nome_original}"? O arquivo e os chunks serão removidos permanentemente.`,
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteDocumento(doc.id)
        toast.add({ severity: 'success', summary: 'Documento removido', life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: 'Erro ao excluir documento', life: 3000 })
      }
    },
  })
}

const statusSeverity: Record<string, 'info' | 'warn' | 'success' | 'danger'> = {
  pending: 'info',
  processing: 'warn',
  completed: 'success',
  processed: 'success',
  failed: 'danger',
}
</script>

<template>
  <div class="flex flex-column gap-4 md:gap-6">
    <h1 class="text-lg md:text-xl font-bold text-gray-900">Documentos</h1>

    <FileUpload
      name="file"
      :multiple="true"
      accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
      :max-file-size="50 * 1024 * 1024"
      :disabled="uploading"
      @select="onUpload"
      :auto="true"
      choose-label="Selecionar Arquivos"
      upload-label="Enviar"
      cancel-label="Cancelar"
    >
      <template #empty>
        <p class="text-gray-500 mt-1">Arraste arquivos ou clique para selecionar.</p>
      </template>
    </FileUpload>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <ResponsiveTable
        :value="documentos"
        :loading="loading"
        :columns="columns"
        paginator
        :rows="10"
        sort-field="created_at"
        :sort-order="-1"
        striped-rows
      >
        <template #body-tamanho_bytes="{ data }">
          {{ formatBytes(data.tamanho_bytes) }}
        </template>
        <template #body-status="{ data }">
          <Tag :value="data.status" :severity="statusSeverity[data.status] || 'info'" />
        </template>
        <template #body-created_at="{ data }">
          {{ new Date(data.created_at).toLocaleString('pt-BR') }}
        </template>
        <template #actions="{ data }">
          <div class="flex gap-1">
            <Button
              icon="pi pi-download"
              text rounded severity="info"
              v-tooltip.top="'Download'"
              @click="download(data)"
              :disabled="data.status !== 'processed'"
            />
            <Button
              icon="pi pi-refresh"
              text rounded severity="warn"
              v-tooltip.top="'Reprocessar'"
              @click="reprocessar(data)"
              :disabled="data.status === 'pending' || data.status === 'processing'"
            />
            <Button
              icon="pi pi-trash"
              text rounded severity="danger"
              v-tooltip.top="'Excluir'"
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </ResponsiveTable>
    </div>
  </div>
</template>
