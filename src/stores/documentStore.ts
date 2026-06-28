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
  let eventSource: EventSource | null = null

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
    documentos.value = documentos.value.filter(d => d.id !== id)
  }

  async function reprocessarDocumento(id: number) {
    await api.post(`/documentos/${id}/reprocessar`)
  }

  function getToken(): string | null {
    return localStorage.getItem('access_token')
  }

  function connectSSE() {
    if (eventSource) return
    const token = getToken()
    if (!token) return

    const baseURL = import.meta.env.VITE_API_URL || '/api'
    eventSource = new EventSource(`${baseURL}/sse/documentos?token=${token}`)

    eventSource.addEventListener('document.updated', (event) => {
      try {
        const data = JSON.parse(event.data)
        const idx = documentos.value.findIndex((d) => d.id === data.document_id)
        if (idx !== -1) {
          documentos.value[idx] = {
            ...documentos.value[idx],
            status: data.status,
            updated_at: data.updated_at,
          }
          documentos.value = [...documentos.value]
        }
      } catch {
        // ignore parse errors
      }
    })
  }

  function disconnectSSE() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }

  return {
    documentos, loading,
    listDocumentos, uploadDocumento, getDownloadUrl,
    deleteDocumento, reprocessarDocumento,
    connectSSE, disconnectSSE,
  }
})
