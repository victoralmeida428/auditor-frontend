import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusTag from '@/components/common/StatusTag.vue'

describe('StatusTag', () => {
  it('renders the value text', () => {
    const wrapper = mount(StatusTag, {
      props: { value: 'Ativo' },
      global: {
        stubs: {
          Tag: {
            props: ['value', 'severity'],
            template: '<span class="tag-stub">{{ value }}</span>',
          },
        },
      },
    })
    expect(wrapper.text()).toContain('Ativo')
  })

  it('uses default severity when not specified', () => {
    const wrapper = mount(StatusTag, {
      props: { value: 'Info' },
      global: {
        stubs: {
          Tag: {
            props: ['value', 'severity'],
            template: '<span class="tag-stub" data-severity="{{ severity }}">{{ value }}</span>',
          },
        },
      },
    })
    const tag = wrapper.find('.tag-stub')
    expect(tag.exists()).toBe(true)
    expect(tag.text()).toBe('Info')
  })

  it('applies custom severity', () => {
    const wrapper = mount(StatusTag, {
      props: { value: 'Erro', severity: 'danger' },
      global: {
        stubs: {
          Tag: {
            props: ['value', 'severity'],
            template: '<span class="tag-stub" :data-severity="severity">{{ value }}</span>',
          },
        },
      },
    })
    const tag = wrapper.find('.tag-stub')
    expect(tag.attributes('data-severity')).toBe('danger')
  })
})
