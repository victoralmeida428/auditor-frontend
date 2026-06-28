import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResponsiveTable from '@/components/common/ResponsiveTable.vue'

describe('ResponsiveTable', () => {
  const columns = [
    { field: 'id', header: 'ID' },
    { field: 'nome', header: 'Nome' },
  ]
  const data = [
    { id: 1, nome: 'Item A' },
    { id: 2, nome: 'Item B' },
  ]

  it('renders DataTable on desktop', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
    const wrapper = mount(ResponsiveTable, {
      props: { columns, value: data },
    })
    expect(wrapper.findComponent({ name: 'DataTable' }).exists()).toBe(true)
  })

  it('renders mobile empty message when no data', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
    const wrapper = mount(ResponsiveTable, {
      props: { columns, value: [], emptyMessage: 'Nada aqui' },
    })
    expect(wrapper.text()).toContain('Nada aqui')
  })

  it('renders mobile default empty message', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
    const wrapper = mount(ResponsiveTable, {
      props: { columns, value: [] },
    })
    expect(wrapper.text()).toContain('Nenhum registro encontrado.')
  })
})
