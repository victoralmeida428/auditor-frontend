import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export interface Norma {
  id: number
  requisito_codigo: string
  item_requisito: string | null
  texto_exigencia: string
  categoria: string | null
  ativo: boolean
  created_at: string
}

export interface NormaCriterio {
  id: number
  norma_id: number
  criterio_numero: number
  criterio_descricao: string
  tipo_documento: string
  created_at: string
}

export interface NormaComCriterios {
  id: number
  requisito_codigo: string
  item_requisito: string | null
  texto_exigencia: string
  categoria: string | null
  ativo: boolean
  created_at: string
  criterios: NormaCriterio[]
}

export const useNormaStore = defineStore('norma', () => {
  const normas = ref<Norma[]>([])
  const categorias = ref<string[]>([])

  async function list(categoria?: string) {
    const params = categoria ? { categoria } : {}
    const res = await api.get('/admin/normas', { params })
    normas.value = res.data
    return res.data as Norma[]
  }

  async function listAtivos(categoria?: string) {
    const params = categoria ? { categoria } : {}
    const res = await api.get('/normas', { params })
    return res.data as Norma[]
  }

  async function getById(id: number) {
    const res = await api.get(`/admin/normas/${id}`)
    return res.data as Norma
  }

  async function getCriterios(normaId: number) {
    const res = await api.get(`/normas/${normaId}/criterios`)
    return res.data as NormaComCriterios
  }

  async function create(data: Partial<Norma>) {
    const res = await api.post('/admin/normas', data)
    return res.data as Norma
  }

  async function update(id: number, data: Partial<Norma>) {
    const res = await api.put(`/admin/normas/${id}`, data)
    return res.data as Norma
  }

  async function remove(id: number) {
    await api.delete(`/admin/normas/${id}`)
  }

  async function listCategorias() {
    const res = await api.get('/admin/normas/categorias')
    categorias.value = res.data
    return res.data as string[]
  }

  return {
    normas, categorias,
    list, listAtivos, getById, getCriterios, create, update, remove, listCategorias,
  }
})
