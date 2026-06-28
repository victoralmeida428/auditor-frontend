import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNormaStore } from '@/stores/normaStore'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
}))
vi.mock('@/services/api', () => ({ default: mockApi }))

describe('normaStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('list fetches without categoria', async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1, requisito_codigo: '4.1' }] })
    const store = useNormaStore()
    const r = await store.list()
    expect(r).toHaveLength(1)
    expect(mockApi.get).toHaveBeenCalledWith('/admin/normas', { params: {} })
  })

  it('list fetches with categoria', async () => {
    mockApi.get.mockResolvedValue({ data: [] })
    const store = useNormaStore()
    await store.list('ISO 17025')
    expect(mockApi.get).toHaveBeenCalledWith('/admin/normas', { params: { categoria: 'ISO 17025' } })
  })

  it('list stores normas in state', async () => {
    const data = [{ id: 1, requisito_codigo: '4.1' }]
    mockApi.get.mockResolvedValue({ data })
    const store = useNormaStore()
    await store.list()
    expect(store.normas).toEqual(data)
  })

  it('getById fetches one', async () => {
    mockApi.get.mockResolvedValue({ data: { id: 1, requisito_codigo: '4.1' } })
    const store = useNormaStore()
    const r = await store.getById(1)
    expect(r.requisito_codigo).toBe('4.1')
  })

  it('create posts and returns', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1, requisito_codigo: '5' } })
    const store = useNormaStore()
    const r = await store.create({ requisito_codigo: '5' })
    expect(r.id).toBe(1)
  })

  it('update puts and returns', async () => {
    mockApi.put.mockResolvedValue({ data: { id: 1, requisito_codigo: '5.1' } })
    const store = useNormaStore()
    const r = await store.update(1, { requisito_codigo: '5.1' })
    expect(r.requisito_codigo).toBe('5.1')
  })

  it('remove calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useNormaStore()
    await store.remove(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/admin/normas/1')
  })

  it('listCategorias fetches and stores', async () => {
    mockApi.get.mockResolvedValue({ data: ['ISO 17025', 'DICLA'] })
    const store = useNormaStore()
    const r = await store.listCategorias()
    expect(r).toEqual(['ISO 17025', 'DICLA'])
    expect(store.categorias).toEqual(['ISO 17025', 'DICLA'])
  })
})
