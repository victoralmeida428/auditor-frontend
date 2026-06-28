import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CoberturaCard from '@/components/common/CoberturaCard.vue'

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(CoberturaCard, {
    props,
    global: {
      stubs: {
        Tag: {
          props: ['value', 'severity'],
          template: '<span class="tag-stub">{{ value }}</span>',
        },
      },
    },
  })
}

describe('CoberturaCard', () => {
  it('renders title', () => {
    const wrapper = createWrapper({ title: 'Cobertura', items: ['A', 'B'] })
    expect(wrapper.text()).toContain('Cobertura')
  })

  it('renders items as tags', () => {
    const wrapper = createWrapper({ title: 'Cobertura', items: ['Método A', 'Método B'] })
    expect(wrapper.text()).toContain('Método A')
    expect(wrapper.text()).toContain('Método B')
  })

  it('shows empty text when items is empty', () => {
    const wrapper = createWrapper({ title: 'Cobertura', items: [], emptyText: 'Nenhum' })
    expect(wrapper.text()).toContain('Nenhum')
  })

  it('shows dash when items empty and no emptyText', () => {
    const wrapper = createWrapper({ title: 'Cobertura', items: [] })
    expect(wrapper.text()).toContain('-')
  })
})
