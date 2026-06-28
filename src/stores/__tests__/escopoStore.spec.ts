import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEscopoStore } from '@/stores/escopoStore'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
}))
vi.mock('@/services/api', () => ({ default: mockApi }))

describe('escopoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('listEscopos fetches and stores escopos', async () => {
    const data = [{ id: 1, nome: 'Escopo A' }]
    mockApi.get.mockResolvedValue({ data })
    const store = useEscopoStore()
    const result = await store.listEscopos()
    expect(result).toEqual(data)
    expect(store.escopos).toEqual(data)
  })

  it('getEscopo returns escopo by id', async () => {
    const data = { id: 1, nome: 'Escopo A' }
    mockApi.get.mockResolvedValue({ data })
    const store = useEscopoStore()
    const result = await store.getEscopo(1)
    expect(result).toEqual(data)
  })

  it('createEscopo posts and returns new escopo', async () => {
    const data = { id: 2, nome: 'Novo' }
    mockApi.post.mockResolvedValue({ data })
    const store = useEscopoStore()
    const result = await store.createEscopo({ nome: 'Novo' })
    expect(result).toEqual(data)
  })

  it('updateEscopo puts and returns updated', async () => {
    const data = { id: 1, nome: 'Updated' }
    mockApi.put.mockResolvedValue({ data })
    const store = useEscopoStore()
    const result = await store.updateEscopo(1, { nome: 'Updated' })
    expect(result).toEqual(data)
  })

  it('deleteEscopo calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.deleteEscopo(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/escopo/1')
  })

  it('listEnsaios fetches and stores', async () => {
    const data = [{ id: 1, nome: 'Ensaio X' }]
    mockApi.get.mockResolvedValue({ data })
    const store = useEscopoStore()
    const result = await store.listEnsaios(1)
    expect(result).toEqual(data)
    expect(store.ensaios).toEqual(data)
  })

  it('createEnsaio posts and returns', async () => {
    const data = { id: 1, nome: 'Ensaio' }
    mockApi.post.mockResolvedValue({ data })
    const store = useEscopoStore()
    const r = await store.createEnsaio(1, { nome: 'Ensaio' })
    expect(r).toEqual(data)
  })

  it('listAmostras fetches and stores', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Amostra X' }] })
    const store = useEscopoStore()
    const r = await store.listAmostras()
    expect(r).toHaveLength(1)
    expect(store.amostras).toEqual(r)
  })

  it('createAmostra posts and returns', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1, nome: 'Nova' } })
    const store = useEscopoStore()
    const r = await store.createAmostra('Nova', 'desc')
    expect(r.nome).toBe('Nova')
  })

  it('deleteAmostra calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.deleteAmostra(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/amostras/1')
  })

  it('listGrandezas fetches and stores', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Massa' }] })
    const store = useEscopoStore()
    const r = await store.listGrandezas()
    expect(r).toHaveLength(1)
    expect(store.grandezas).toEqual(r)
  })

  it('createGrandeza posts and returns', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1, nome: 'Massa', unidade: 'kg' } })
    const store = useEscopoStore()
    const r = await store.createGrandeza('Massa', 'kg')
    expect(r.unidade).toBe('kg')
  })

  it('deleteGrandeza calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.deleteGrandeza(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/grandezas/1')
  })

  it('listMetodos fetches and stores', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Método A', tipo: 'interno' }] })
    const store = useEscopoStore()
    const r = await store.listMetodos()
    expect(r).toHaveLength(1)
    expect(store.metodos).toEqual(r)
  })

  it('createMetodo posts and returns', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1, nome: 'Método', tipo: 'interno' } })
    const store = useEscopoStore()
    const r = await store.createMetodo('Método', 'interno')
    expect(r.tipo).toBe('interno')
  })

  it('deleteMetodo calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.deleteMetodo(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/metodos/1')
  })

  it('listCategoriasEnsaio fetches and stores', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Físico-Químico' }] })
    const store = useEscopoStore()
    const r = await store.listCategoriasEnsaio()
    expect(r).toHaveLength(1)
    expect(store.categoriasEnsaio).toEqual(r)
  })

  it('listEquipamentos fetches and stores', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Espectrofotômetro' }] })
    const store = useEscopoStore()
    await store.listEquipamentos()
    expect(store.equipamentos).toHaveLength(1)
  })

  it('createEquipamento posts and returns', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1, nome: 'Balança' } })
    const store = useEscopoStore()
    const r = await store.createEquipamento({ nome: 'Balança' })
    expect(r.nome).toBe('Balança')
  })

  it('deleteEquipamento calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.deleteEquipamento(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/equipamentos/1')
  })

  it('listEquipamentosByEscopo fetches', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Eq' }] })
    const store = useEscopoStore()
    const r = await store.listEquipamentosByEscopo(1)
    expect(r).toHaveLength(1)
  })

  it('linkEquipamentoToEscopo posts link', async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useEscopoStore()
    await store.linkEquipamentoToEscopo(1, 2)
    expect(mockApi.post).toHaveBeenCalledWith('/escopo/1/equipamentos', { equipamento_id: 2 })
  })

  it('unlinkEquipamentoFromEscopo deletes link', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.unlinkEquipamentoFromEscopo(1, 2)
    expect(mockApi.delete).toHaveBeenCalledWith('/escopo/1/equipamentos/2')
  })

  it('listSignatarios fetches and stores', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Signatário A' }] })
    const store = useEscopoStore()
    const r = await store.listSignatarios()
    expect(r).toHaveLength(1)
    expect(store.signatarios).toEqual(r)
  })

  it('createSignatario posts and returns', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1, nome: 'Auditor' } })
    const store = useEscopoStore()
    const r = await store.createSignatario({ nome: 'Auditor' })
    expect(r.nome).toBe('Auditor')
  })

  it('deleteSignatario calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.deleteSignatario(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/signatarios/1')
  })

  it('listSignatariosByEscopo fetches', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Sig' }] })
    const store = useEscopoStore()
    const r = await store.listSignatariosByEscopo(1)
    expect(r).toHaveLength(1)
  })

  it('linkSignatarioToEscopo posts link', async () => {
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useEscopoStore()
    await store.linkSignatarioToEscopo(1, 2)
    expect(mockApi.post).toHaveBeenCalledWith('/escopo/1/signatarios', { signatario_id: 2 })
  })

  it('unlinkSignatarioFromEscopo deletes link', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useEscopoStore()
    await store.unlinkSignatarioFromEscopo(1, 2)
    expect(mockApi.delete).toHaveBeenCalledWith('/escopo/1/signatarios/2')
  })

  it('listPrincipiosAnaliticos fetches', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, nome: 'Potenciometria' }] })
    const store = useEscopoStore()
    const r = await store.listPrincipiosAnaliticos()
    expect(r).toHaveLength(1)
  })

  it('sugerirNormas posts and returns suggestion', async () => {
    const data = { sugeridas: [{ id: 1, requisito_codigo: '4.1' }], vinculadas: [] }
    mockApi.post.mockResolvedValue({ data })
    const store = useEscopoStore()
    const r = await store.sugerirNormas(1, { escopo: {}, ensaios: [] })
    expect(r.sugeridas).toHaveLength(1)
  })

  it('listNormasByEscopo fetches normas', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, requisito_codigo: '4.1' }] })
    const store = useEscopoStore()
    const r = await store.listNormasByEscopo(1)
    expect(r).toHaveLength(1)
  })

  it('saveNormasSelecionadas posts norma ids', async () => {
    mockApi.post.mockResolvedValue({})
    const store = useEscopoStore()
    await store.saveNormasSelecionadas(1, [1, 2, 3])
    expect(mockApi.post).toHaveBeenCalledWith('/escopo/1/normas', { norma_ids: [1, 2, 3] })
  })
})
