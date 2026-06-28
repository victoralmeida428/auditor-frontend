import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuditoriaStore } from '@/stores/auditoriaStore'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
}))
vi.mock('@/services/api', () => ({ default: mockApi }))

describe('auditoriaStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('listPlanos fetches and stores planos', async () => {
    const data = [{ id: 1, titulo: 'Plano A' }]
    mockApi.get.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.listPlanos()
    expect(r).toEqual(data)
    expect(store.planos).toEqual(data)
  })

  it('getPlano returns plano with grupos', async () => {
    const data = { plano: { id: 1 }, grupos: [] }
    mockApi.get.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.getPlano(1)
    expect(r.plano.id).toBe(1)
  })

  it('createPlano posts and returns', async () => {
    const data = { id: 1, titulo: 'Novo' }
    mockApi.post.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.createPlano({
      escopo_id: 1, titulo: 'Novo', tipo_montagem: 'auto', tipo_auditoria: 'primeira',
    })
    expect(r.id).toBe(1)
  })

  it('montarAutomatico posts and returns result', async () => {
    const data = {
      plano_id: 1, grupos: [], cobertura_metodos: [], cobertura_acreditacao: [], risk_warning: '',
    }
    mockApi.post.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.montarAutomatico(1)
    expect(r.plano_id).toBe(1)
  })

  it('montarAutomatico sends historico when provided', async () => {
    const historico = [{ grupo_escopo_id: 1, qtd_ensaios: 5, qtd_ncs: 1 }]
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useAuditoriaStore()
    await store.montarAutomatico(1, historico)
    expect(mockApi.post).toHaveBeenCalledWith(
      '/planos-auditoria/1/montar-auto',
      { historico },
    )
  })

  it('ajusteManual posts adjustment', async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useAuditoriaStore()
    await store.ajusteManual(1, 10, 20)
    expect(mockApi.post).toHaveBeenCalledWith('/planos-auditoria/1/ajustar-manual', {
      plano_grupo_id: 10,
      ensaio_id: 20,
    })
  })

  it('removerEnsaioManual deletes', async () => {
    mockApi.delete.mockResolvedValue({ data: {} })
    const store = useAuditoriaStore()
    await store.removerEnsaioManual(1, 5, 20)
    expect(mockApi.delete).toHaveBeenCalledWith('/planos-auditoria/1/grupos/5/ensaios/20')
  })

  it('iniciar posts to start plan', async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useAuditoriaStore()
    await store.iniciar(1)
    expect(mockApi.post).toHaveBeenCalledWith('/planos-auditoria/1/iniciar')
  })

  it('concluir posts to finish', async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useAuditoriaStore()
    await store.concluir(1)
    expect(mockApi.post).toHaveBeenCalledWith('/planos-auditoria/1/concluir')
  })

  it('criarAvaliacao posts and returns', async () => {
    const data = { id: 1, requisito_codigo: '4.1' }
    mockApi.post.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.criarAvaliacao(1, '4.1')
    expect(r.requisito_codigo).toBe('4.1')
  })

  it('listAvaliacoes fetches', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1 }] })
    const store = useAuditoriaStore()
    const r = await store.listAvaliacoes(1)
    expect(r).toHaveLength(1)
  })

  it('getAvaliacao returns avaliacao with criterios', async () => {
    const data = { avaliacao: { id: 1 }, criterios: [] }
    mockApi.get.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.getAvaliacao(1)
    expect(r.avaliacao.id).toBe(1)
  })

  it('updateCriterios puts criteria', async () => {
    mockApi.put.mockResolvedValue({ data: {} })
    const store = useAuditoriaStore()
    const criterios = [{ id: 1, atendido: true, evidencia: '' }]
    await store.updateCriterios(1, criterios)
    expect(mockApi.put).toHaveBeenCalledWith('/avaliacoes/1/criterios', { criterios })
  })

  it('finalizarAvaliacao posts and returns', async () => {
    const data = { id: 1, resultado: 'conforme' }
    mockApi.post.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.finalizarAvaliacao(1)
    expect(r.resultado).toBe('conforme')
  })

  it('vincularDocumento posts link', async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useAuditoriaStore()
    await store.vincularDocumento(1, 2, 'obrigatorio')
    expect(mockApi.post).toHaveBeenCalledWith('/avaliacoes/1/vincular-documento', {
      documento_id: 2,
      tipo: 'obrigatorio',
    })
  })

  it('getRelatorioAvaliacao fetches report', async () => {
    const data = {
      plano_id: 1, total_requisitos: 3, conformes: 2, nao_conformes: 1,
      percentual_atendimento: 66.67, nao_conformidades: [],
    }
    mockApi.get.mockResolvedValue({ data })
    const store = useAuditoriaStore()
    const r = await store.getRelatorioAvaliacao(1)
    expect(r.total_requisitos).toBe(3)
  })

  it('loading ref is initially false', () => {
    const store = useAuditoriaStore()
    expect(store.loading).toBe(false)
  })
})
