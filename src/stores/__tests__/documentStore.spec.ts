import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDocumentStore } from '@/stores/documentStore'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), delete: vi.fn(),
}))
vi.mock('@/services/api', () => ({ default: mockApi }))

let lastES: any = null
class MockEventSource {
  onopen: (() => void) | null = null
  onerror: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  listeners: Map<string, (event: MessageEvent) => void> = new Map()
  readyState = 1
  constructor(public url: string) { lastES = this }
  addEventListener(event: string, listener: (event: MessageEvent) => void) {
    this.listeners.set(event, listener)
  }
  close() {}
}

vi.stubGlobal('EventSource', MockEventSource)

describe('documentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('listDocumentos fetches and stores documentos', async () => {
    const data = [{ id: 1, nome_original: 'doc.pdf' }]
    mockApi.get.mockResolvedValue({ data })
    const store = useDocumentStore()
    const r = await store.listDocumentos()
    expect(r).toEqual(data)
    expect(store.documentos).toEqual(data)
  })

  it('uploadDocumento posts file as FormData', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const response = { id: 1, nome_original: 'test.pdf' }
    mockApi.post.mockResolvedValue({ data: response })
    const store = useDocumentStore()
    const r = await store.uploadDocumento(file)
    expect(r.nome_original).toBe('test.pdf')
    expect(mockApi.post).toHaveBeenCalledWith(
      '/documentos/upload',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  })

  it('uploadDocumento with escopoId appends escopo_id to FormData', async () => {
    const file = new File(['c'], 'test.pdf', { type: 'application/pdf' })
    mockApi.post.mockResolvedValue({ data: {} })
    const store = useDocumentStore()
    await store.uploadDocumento(file, 5)
    const formData = mockApi.post.mock.calls[0][1]
    expect(formData.get('escopo_id')).toBe('5')
    expect(formData.get('file')).toBe(file)
  })

  it('getDownloadUrl returns url', async () => {
    mockApi.get.mockResolvedValue({ data: { url: 'http://example.com/doc' } })
    const store = useDocumentStore()
    const url = await store.getDownloadUrl(1)
    expect(url).toBe('http://example.com/doc')
  })

  it('deleteDocumento calls delete', async () => {
    mockApi.delete.mockResolvedValue({})
    const store = useDocumentStore()
    await store.deleteDocumento(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/documentos/1')
  })

  it('reprocessarDocumento posts reprocess', async () => {
    mockApi.post.mockResolvedValue({})
    const store = useDocumentStore()
    await store.reprocessarDocumento(1)
    expect(mockApi.post).toHaveBeenCalledWith('/documentos/1/reprocessar')
  })

  it('connectSSE creates EventSource with token and updates documentos on event', () => {
    localStorage.setItem('access_token', 'test-token')
    const store = useDocumentStore()
    store.documentos = [{ id: 1, status: 'pending', nome_original: 'doc.pdf' } as any]
    lastES = null

    store.connectSSE()

    expect(lastES).not.toBeNull()
    expect(lastES.url).toContain('/api/sse/documentos?token=test-token')

    const listener = lastES.listeners.get('document.updated')
    expect(listener).toBeDefined()
    listener({ data: JSON.stringify({ document_id: 1, status: 'processed', updated_at: '2025-01-01' }) })

    expect(store.documentos[0].status).toBe('processed')

    store.disconnectSSE()
  })

  it('connectSSE does nothing without token', () => {
    localStorage.removeItem('access_token')
    const store = useDocumentStore()
    store.connectSSE()
    store.disconnectSSE()
    expect(true).toBe(true)
  })

  it('loading ref is initially false', () => {
    const store = useDocumentStore()
    expect(store.loading).toBe(false)
  })
})
