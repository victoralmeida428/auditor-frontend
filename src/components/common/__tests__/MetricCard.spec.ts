import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricCard from '@/components/common/MetricCard.vue'

describe('MetricCard', () => {
  it('renders label and value', () => {
    const wrapper = mount(MetricCard, {
      props: { label: 'Escopos', value: '5', icon: 'pi pi-pencil' },
    })
    expect(wrapper.text()).toContain('Escopos')
    expect(wrapper.text()).toContain('5')
  })

  it('renders the icon', () => {
    const wrapper = mount(MetricCard, {
      props: { label: 'Docs', value: '10', icon: 'pi pi-file' },
    })
    const icon = wrapper.find('i')
    expect(icon.classes()).toContain('pi-file')
  })

  it('applies custom color', () => {
    const wrapper = mount(MetricCard, {
      props: { label: 'X', value: '1', icon: 'pi pi-check', color: '#ff0000' },
    })
    const icon = wrapper.find('i')
    expect(icon.attributes('style')).toContain('color: rgb(255, 0, 0)')
  })

  it('uses default color when not provided', () => {
    const wrapper = mount(MetricCard, {
      props: { label: 'X', value: '1', icon: 'pi pi-check' },
    })
    const icon = wrapper.find('i')
    expect(icon.attributes('style')).toContain('color: rgb(37, 99, 235)')
  })
})
