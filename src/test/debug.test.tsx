import { describe, it, expect, vi } from 'vitest'

describe('Debug Import Test', () => {
  it('should import mockData', async () => {
    try {
      const mockData = await import('./mockData')
      expect(mockData.mockCustomers).toBeDefined()
      console.log('mockData imported successfully')
    } catch (error) {
      console.error('Failed to import mockData:', error)
      throw error
    }
  })

  it('should import InvoiceForm', async () => {
    try {
      const module = await import('../components/InvoiceForm')
      expect(module.InvoiceForm).toBeDefined()
      console.log('InvoiceForm imported successfully')
    } catch (error) {
      console.error('Failed to import InvoiceForm:', error)
      throw error
    }
  })
})