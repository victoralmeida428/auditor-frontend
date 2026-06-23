<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useDocumentStore, type Documento } from '@/stores/documentStore'

const store = useDocumentStore()
const toast = useToast()

const documentos = ref<Documento[]>([])
const loading = ref(false)
const uploading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    documentos.value = await store.listDocumentos()
  } finally {
    loading.value = false
  }
  store.startPolling()
})

onUnmounted(() => {
  store.stopPolling()
})

async function onUpload(event: any) {
  uploading.value = true
  try {
    const files = event.files as File[]
    for (const file of files) {
      await store.uploadDocumento(file)
    }
    documentos.value = await store.listDocumentos()
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
    const url = await store.getDownloadUrl(doc.id)
    window.open(url, '_blank')
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao gerar link de download', life: 3000 })
  }
}

const statusSeverity: Record<string, 'info' | 'warn' | 'success' | 'danger'> = {
  pending: 'info',
  processing: 'warn',
  completed: 'success',
  failed: 'danger',
}
</script>

<template>
  <div class="flex flex-column gap-3">
    <h1 class="text-xl font-bold m-0">Documentos</h1>

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
        <p class="text-color-secondary">Arraste arquivos ou clique para selecionar.</p>
      </template>
    </FileUpload>

    <DataTable :value="documentos" :loading="loading" striped-rows paginator :rows="10" sort-field="created_at" :sort-order="-1">
      <Column field="nome_original" header="Nome" sortable />
      <Column field="tipo_arquivo" header="Tipo" style="width: 6rem" />
      <Column field="tamanho_bytes" header="Tamanho" style="width: 8rem" sortable>
        <template #body="{ data }">
          {{ formatBytes(data.tamanho_bytes) }}
        </template>
      </Column>
      <Column field="status" header="Status" style="width: 8rem" sortable>
        <template #body="{ data }">
          <Tag :value="data.status" :severity="statusSeverity[data.status] || 'info'" />
        </template>
      </Column>
      <Column field="created_at" header="Enviado em" style="width: 10rem" sortable>
        <template #body="{ data }">
          {{ new Date(data.created_at).toLocaleString('pt-BR') }}
        </template>
      </Column>
      <Column header="" style="width: 4rem">
        <template #body="{ data }">
          <Button
            icon="pi pi-download"
            text
            rounded
            severity="info"
            v-tooltip.top="'Download'"
            @click="download(data)"
            :disabled="data.status !== 'completed'"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
