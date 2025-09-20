import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock window.open
global.window.open = vi.fn()

// Mock console methods to reduce noise in tests
console.error = vi.fn()
console.warn = vi.fn()