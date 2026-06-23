import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export interface Escopo {
  id: number
  empresa_id: number
  nome: string
  descricao: string | null
  areas_atuacao: string[]
  situacao_acreditacao: string
  numero_acreditacao: string | null
  escopo_acreditado_url: string | null
  schema_validation: any
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Ensaio {
  id: number
  empresa_id: number
  escopo_id: number
  nome: string
  matriz: string | null
  metodo_id: number | null
  tipo_metodo: string | null
  principio_analitico_id: number | null
  acreditado: boolean
  categoria_ensaio_id: number | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Amostra {
  id: number
  nome: string
  descricao: string | null
}

export interface Grandeza {
  id: number
  nome: string
  unidade: string | null
}

export interface Metodo {
  id: number
  nome: string
  tipo: string
  referencia: string | null
}

export interface CategoriaEnsaio {
  id: number
  nome: string
  schema_validation: any
}

export interface EquipamentoCritico {
  id: number
  nome: string
  modelo: string | null
  identificacao_interna: string | null
}

export interface Signatario {
  id: number
  nome: string
  cargo: string | null
  ensaios_autorizados: string[]
}

export const useEscopoStore = defineStore('escopo', () => {
  const escopos = ref<Escopo[]>([])
  const ensaios = ref<Ensaio[]>([])
  const amostras = ref<Amostra[]>([])
  const grandezas = ref<Grandeza[]>([])
  const metodos = ref<Metodo[]>([])
  const categoriasEnsaio = ref<CategoriaEnsaio[]>([])
  const equipamentos = ref<EquipamentoCritico[]>([])
  const signatarios = ref<Signatario[]>([])
  const loading = ref(false)

  async function listEscopos() {
    const res = await api.get('/escopo')
    escopos.value = res.data
    return res.data
  }

  async function getEscopo(id: number) {
    const res = await api.get(`/escopo/${id}`)
    return res.data as Escopo
  }

  async function createEscopo(data: Partial<Escopo>) {
    const res = await api.post('/escopo', data)
    return res.data as Escopo
  }

  async function updateEscopo(id: number, data: Partial<Escopo>) {
    const res = await api.put(`/escopo/${id}`, data)
    return res.data as Escopo
  }

  async function deleteEscopo(id: number) {
    await api.delete(`/escopo/${id}`)
  }

  async function listEnsaios(escopoId: number) {
    const res = await api.get(`/escopo/${escopoId}/ensaios`)
    ensaios.value = res.data
    return res.data
  }

  async function createEnsaio(escopoId: number, data: Partial<Ensaio>) {
    const res = await api.post(`/escopo/${escopoId}/ensaios`, data)
    return res.data as Ensaio
  }

  async function listAmostras() {
    const res = await api.get('/amostras')
    amostras.value = res.data
    return res.data
  }

  async function createAmostra(nome: string, descricao?: string) {
    const res = await api.post('/amostras', { nome, descricao })
    return res.data as Amostra
  }

  async function deleteAmostra(id: number) {
    await api.delete(`/amostras/${id}`)
  }

  async function listGrandezas() {
    const res = await api.get('/grandezas')
    grandezas.value = res.data
    return res.data
  }

  async function createGrandeza(nome: string, unidade?: string) {
    const res = await api.post('/grandezas', { nome, unidade })
    return res.data as Grandeza
  }

  async function deleteGrandeza(id: number) {
    await api.delete(`/grandezas/${id}`)
  }

  async function listMetodos() {
    const res = await api.get('/metodos')
    metodos.value = res.data
    return res.data
  }

  async function createMetodo(nome: string, tipo: string, referencia?: string) {
    const res = await api.post('/metodos', { nome, tipo, referencia })
    return res.data as Metodo
  }

  async function deleteMetodo(id: number) {
    await api.delete(`/metodos/${id}`)
  }

  async function listCategoriasEnsaio() {
    const res = await api.get('/categorias-ensaio')
    categoriasEnsaio.value = res.data
    return res.data
  }

  async function listEquipamentos(escopoId: number) {
    const res = await api.get(`/escopo/${escopoId}/equipamentos`)
    equipamentos.value = res.data
    return res.data
  }

  async function createEquipamento(escopoId: number, data: Partial<EquipamentoCritico>) {
    const res = await api.post(`/escopo/${escopoId}/equipamentos`, data)
    return res.data as EquipamentoCritico
  }

  async function deleteEquipamento(id: number) {
    await api.delete(`/equipamentos/${id}`)
  }

  async function listSignatarios(escopoId: number) {
    const res = await api.get(`/escopo/${escopoId}/signatarios`)
    signatarios.value = res.data
    return res.data
  }

  async function createSignatario(escopoId: number, data: Partial<Signatario>) {
    const res = await api.post(`/escopo/${escopoId}/signatarios`, data)
    return res.data as Signatario
  }

  async function deleteSignatario(id: number) {
    await api.delete(`/signatarios/${id}`)
  }

  async function listPrincipiosAnaliticos() {
    const res = await api.get('/principios-analiticos')
    return res.data
  }

  return {
    escopos, ensaios, amostras, grandezas, metodos,
    categoriasEnsaio, equipamentos, signatarios, loading,
    listEscopos, getEscopo, createEscopo, updateEscopo, deleteEscopo,
    listEnsaios, createEnsaio,
    listAmostras, createAmostra, deleteAmostra,
    listGrandezas, createGrandeza, deleteGrandeza,
    listMetodos, createMetodo, deleteMetodo,
    listCategoriasEnsaio,
    listEquipamentos, createEquipamento, deleteEquipamento,
    listSignatarios, createSignatario, deleteSignatario,
    listPrincipiosAnaliticos,
  }
})
