import { vi } from 'vitest'
import { config } from '@vue/test-utils'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

config.global.stubs = {
  Button: true,
  InputText: true,
  Textarea: true,
  Password: true,
  Message: true,
  DataTable: true,
  Column: true,
  Tag: true,
  Toast: true,
  ConfirmDialog: true,
  Steps: true,
  Select: true,
  Checkbox: true,
  FileUpload: true,
  Badge: true,
  Dialog: true,
  MultiSelect: true,
  Accordion: true,
  AccordionTab: true,
  Calendar: true,
  InputNumber: true,
  Transition: true,
  'router-link': true,
  'router-view': true,
}
