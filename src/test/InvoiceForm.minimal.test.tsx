import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { mockCustomers, mockArticles, mockTemplates } from './mockData'

// Simple mock for InvoiceService
vi.mock('../services/InvoiceService', () => ({
  InvoiceService: vi.fn().mockImplementation(() => ({
    generateInvoiceNumber: vi.fn().mockResolvedValue('INV-2025-003'),
    getDefaultTemplate: vi.fn().mockResolvedValue(mockTemplates[0]),
    saveInvoice: vi.fn().mockResolvedValue({ success: true }),
    exportInvoicePDF: vi.fn().mockResolvedValue('fake-blob'),
    downloadInvoicePDF: vi.fn().mockResolvedValue(undefined)
  }))
}))

describe('InvoiceForm Minimal Test', () => {
  it('should import without errors', async () => {
    // First test: can we import the component?
    const { InvoiceForm } = await import('../components/InvoiceForm')
    expect(InvoiceForm).toBeDefined()
  })

  it('should render basic props', async () => {
    const { InvoiceForm } = await import('../components/InvoiceForm')
    
    const props = {
      invoice: null,
      customers: mockCustomers,
      articles: mockArticles,
      templates: mockTemplates,
      onSave: vi.fn(),
      onCancel: vi.fn()
    }

    const { container } = render(<InvoiceForm {...props} />)
    expect(container).toBeInTheDocument()
  })
})