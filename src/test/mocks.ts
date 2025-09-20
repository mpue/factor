import { vi } from 'vitest'
import { mockInvoices, mockTemplates } from './mockData'

export const mockInvoiceService = {
  getInvoices: vi.fn().mockResolvedValue(mockInvoices),
  getInvoice: vi.fn().mockImplementation((id: string) => {
    const invoice = mockInvoices.find(inv => inv.id === id)
    return Promise.resolve(invoice || null)
  }),
  getTemplates: vi.fn().mockResolvedValue(mockTemplates),
  getDefaultTemplate: vi.fn().mockResolvedValue(mockTemplates[0]),
  generateInvoiceNumber: vi.fn().mockResolvedValue('INV-2025-003'),
  createInvoice: vi.fn().mockImplementation((data) => {
    const newInvoice = {
      id: 'new-invoice-id',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return Promise.resolve(newInvoice)
  }),
  updateInvoice: vi.fn().mockImplementation((id, data) => {
    const existingInvoice = mockInvoices.find(inv => inv.id === id)
    if (existingInvoice) {
      const updatedInvoice = {
        ...existingInvoice,
        ...data,
        updatedAt: new Date().toISOString()
      }
      return Promise.resolve(updatedInvoice)
    }
    return Promise.resolve(null)
  }),
  deleteInvoice: vi.fn().mockResolvedValue(true),
  exportInvoicePDF: vi.fn().mockResolvedValue(new Blob(['mock pdf content'], { type: 'application/pdf' })),
  downloadInvoicePDF: vi.fn().mockResolvedValue(undefined)
}

export const mockApiDataService = {
  getCustomers: vi.fn().mockResolvedValue([]),
  getArticles: vi.fn().mockResolvedValue([])
}