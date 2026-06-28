import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export interface PlanoAuditoria {
  id: number
  empresa_id: number
  escopo_id: number
  titulo: string
  tipo_montagem: 'auto' | 'manual'
  tipo_auditoria: 'primeira' | 'sem_historico_nc' | 'com_historico_nc'
  usa_historico_nc: boolean
  data_inicio: string | null
  data_fim: string | null
  status: 'rascunho' | 'em_andamento' | 'concluido'
  created_at: string
  updated_at: string
}

export interface PlanoAuditoriaGrupo {
  id: number
  plano_id: number
  grupo_escopo_id: number
  percentual_nc: number | null
  ajuste_amostragem: number | null
  created_at: string
}

export interface PlanoAuditoriaEnsaio {
  id: number
  plano_grupo_id: number
  ensaio_id: number
  selecionado_por: 'sistema' | 'ajuste_manual_auditor'
  created_at: string
}

export interface GrupoComEnsaios {
  id: number
  plano_id: number
  grupo_escopo_id: number
  percentual_nc: number | null
  ajuste_amostragem: number | null
  identificador: string
  nome: string
  created_at: string
  ensaios: PlanoAuditoriaEnsaio[]
}

export interface EnsaioSelecionado {
  ensaio_id: number
  nome: string
  tipo_metodo: string
  acreditado: boolean
}

export interface GrupoMontagemResult {
  grupo_escopo_id: number
  identificador: string
  nome: string
  percentual_nc: number | null
  ajuste_amostragem: number | null
  ensaios_selecionados: EnsaioSelecionado[]
}

export interface MontagemResult {
  plano_id: number
  grupos: GrupoMontagemResult[]
  cobertura_metodos: string[]
  cobertura_acreditacao: string[]
  risk_warning: string
}

export interface AvaliacaoRequisito {
  id: number
  plano_auditoria_id: number
  requisito_codigo: string
  requisito_nome: string
  resultado: string | null
  descricao_nc: string | null
  created_at: string
  updated_at: string
}

export interface AvaliacaoCriterio {
  id: number
  avaliacao_id: number
  criterio_numero: number
  criterio_descricao: string
  atendido: boolean | null
  evidencia_apontada: string | null
  created_at: string
}

export interface RelatorioAvaliacao {
  plano_id: number
  avaliacoes: { avaliacao: AvaliacaoRequisito; criterios: AvaliacaoCriterio[] }[]
  total_requisitos: number
  conformes: number
  nao_conformes: number
  percentual_atendimento: number
  nao_conformidades: NaoConformidade[]
}

export interface NaoConformidade {
  id: number
  plano_auditoria_id: number
  requisito_codigo: string | null
  descricao: string
  criterio_descricao: string | null
  evidencia_ausente: string | null
  status: string
  created_at: string
  updated_at: string
}

export const useAuditoriaStore = defineStore('auditoria', () => {
  const planos = ref<PlanoAuditoria[]>([])
  const loading = ref(false)

  async function listPlanos() {
    const res = await api.get('/planos-auditoria')
    planos.value = res.data
    return res.data as PlanoAuditoria[]
  }

  async function getPlano(id: number) {
    const res = await api.get(`/planos-auditoria/${id}`)
    return res.data as { plano: PlanoAuditoria; grupos: GrupoComEnsaios[] }
  }

  async function createPlano(data: {
    escopo_id: number
    titulo: string
    tipo_montagem: string
    tipo_auditoria: string
    data_inicio?: string
    data_fim?: string
  }) {
    const res = await api.post('/planos-auditoria', data)
    return res.data as PlanoAuditoria
  }

  async function montarAutomatico(planoId: number, historico?: { grupo_escopo_id: number; qtd_ensaios: number; qtd_ncs: number }[]) {
    const body = historico ? { historico } : {}
    const res = await api.post(`/planos-auditoria/${planoId}/montar-auto`, body)
    return res.data as MontagemResult
  }

  async function ajusteManual(planoId: number, planoGrupoId: number, ensaioId: number) {
    const res = await api.post(`/planos-auditoria/${planoId}/ajustar-manual`, {
      plano_grupo_id: planoGrupoId,
      ensaio_id: ensaioId,
    })
    return res.data
  }

  async function removerEnsaioManual(planoId: number, grupoId: number, ensaioId: number) {
    const res = await api.delete(`/planos-auditoria/${planoId}/grupos/${grupoId}/ensaios/${ensaioId}`)
    return res.data
  }

  async function iniciar(planoId: number) {
    const res = await api.post(`/planos-auditoria/${planoId}/iniciar`)
    return res.data
  }

  async function concluir(planoId: number) {
    const res = await api.post(`/planos-auditoria/${planoId}/concluir`)
    return res.data
  }

  async function criarAvaliacao(planoId: number, requisitoCodigo: string) {
    const res = await api.post(`/planos-auditoria/${planoId}/avaliacoes`, {
      requisito_codigo: requisitoCodigo,
    })
    return res.data as AvaliacaoRequisito
  }

  async function listAvaliacoes(planoId: number) {
    const res = await api.get(`/planos-auditoria/${planoId}/avaliacoes`)
    return res.data as AvaliacaoRequisito[]
  }

  async function getAvaliacao(avaliacaoId: number) {
    const res = await api.get(`/avaliacoes/${avaliacaoId}`)
    return res.data as { avaliacao: AvaliacaoRequisito; criterios: AvaliacaoCriterio[] }
  }

  async function updateCriterios(avaliacaoId: number, criterios: { id: number; atendido: boolean; evidencia: string }[]) {
    const res = await api.put(`/avaliacoes/${avaliacaoId}/criterios`, { criterios })
    return res.data
  }

  async function finalizarAvaliacao(avaliacaoId: number) {
    const res = await api.post(`/avaliacoes/${avaliacaoId}/finalizar`)
    return res.data as AvaliacaoRequisito
  }

  async function avaliarComLLM(avaliacaoId: number) {
    const res = await api.post(`/avaliacoes/${avaliacaoId}/avaliar-com-llm`)
    return res.data as AvaliacaoRequisito
  }

  async function vincularDocumento(avaliacaoId: number, documentoId: number, tipo: string) {
    const res = await api.post(`/avaliacoes/${avaliacaoId}/vincular-documento`, {
      documento_id: documentoId,
      tipo,
    })
    return res.data
  }

  async function getRelatorioAvaliacao(planoId: number) {
    const res = await api.get(`/planos-auditoria/${planoId}/relatorio-avaliacao`)
    return res.data as RelatorioAvaliacao
  }

  return {
    planos, loading,
    listPlanos, getPlano, createPlano,
    montarAutomatico, ajusteManual, removerEnsaioManual,
    iniciar, concluir,
    criarAvaliacao, listAvaliacoes, getAvaliacao,
    updateCriterios, finalizarAvaliacao,
    avaliarComLLM,
    vincularDocumento, getRelatorioAvaliacao,
  }
})
