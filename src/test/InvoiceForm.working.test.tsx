import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { mockCustomers, mockArticles, mockTemplates } from './mockData'

// Mock InvoiceService before importing the component
vi.mock('../services/InvoiceService', () => ({
  InvoiceService: vi.fn().mockImplementation(() => ({
    generateInvoiceNumber: vi.fn().mockResolvedValue('INV-2025-003'),
    getDefaultTemplate: vi.fn().mockResolvedValue(mockTemplates[0]),
    saveInvoice: vi.fn().mockResolvedValue({ success: true }),
    exportInvoicePDF: vi.fn().mockResolvedValue(new Blob(['fake pdf'], { type: 'application/pdf' })),
    downloadInvoicePDF: vi.fn().mockResolvedValue(undefined)
  }))
}))

describe('InvoiceForm - Simple Tests', () => {
  let InvoiceForm: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('../components/InvoiceForm')
    InvoiceForm = module.InvoiceForm
  })

  const defaultProps = {
    invoice: null,
    customers: mockCustomers,
    articles: mockArticles,
    templates: mockTemplates,
    onSave: vi.fn(),
    onCancel: vi.fn()
  }

  it('should render create form title', () => {
    render(<InvoiceForm {...defaultProps} />)
    expect(screen.getByText('➕ Neue Rechnung erstellen')).toBeInTheDocument()
  })

  it('should render form sections', () => {
    render(<InvoiceForm {...defaultProps} />)
    expect(screen.getByText('Rechnungsinformationen')).toBeInTheDocument()
    expect(screen.getByText('Rechnungspositionen')).toBeInTheDocument()
    expect(screen.getByText('Rechnungssumme')).toBeInTheDocument()
  })

  it('should render form fields', () => {
    render(<InvoiceForm {...defaultProps} />)
    expect(screen.getByText('Kunde *')).toBeInTheDocument()
    expect(screen.getByText('Vorlage')).toBeInTheDocument()
    expect(screen.getByText('Rechnungsdatum *')).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    render(<InvoiceForm {...defaultProps} />)
    expect(screen.getByText('Abbrechen')).toBeInTheDocument()
    expect(screen.getByText('💾 Erstellen')).toBeInTheDocument()
  })
})