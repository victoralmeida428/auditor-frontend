import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export interface Documento {
  id: number
  empresa_id: number
  escopo_id: number | null
  nome_original: string
  tipo_arquivo: string
  tamanho_bytes: number
  s3_path: string
  status: string
  metadados: any
  created_at: string
  updated_at: string
}

export const useDocumentStore = defineStore('documento', () => {
  const documentos = ref<Documento[]>([])
  const loading = ref(false)
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  async function listDocumentos() {
    const res = await api.get('/documentos')
    documentos.value = res.data
    return res.data
  }

  async function uploadDocumento(file: File, escopoId?: number) {
    const formData = new FormData()
    formData.append('file', file)
    if (escopoId) {
      formData.append('escopo_id', String(escopoId))
    }
    const res = await api.post('/documentos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data as Documento
  }

  async function getDownloadUrl(id: number) {
    const res = await api.get(`/documentos/${id}/download`)
    return res.data.url as string
  }

  async function deleteDocumento(id: number) {
    await api.delete(`/documentos/${id}`)
  }

  async function reprocessarDocumento(id: number) {
    await api.post(`/documentos/${id}/reprocessar`)
  }

  function startPolling() {
    if (pollingInterval) return
    pollingInterval = setInterval(async () => {
      const hasProcessing = documentos.value.some(
        (d) => d.status === 'pending' || d.status === 'processing',
      )
      if (!hasProcessing) return
      await listDocumentos()
    }, 5000)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  return {
    documentos, loading,
    listDocumentos, uploadDocumento, getDownloadUrl,
    deleteDocumento, reprocessarDocumento,
    startPolling, stopPolling,
  }
})
