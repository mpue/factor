import { Invoice, Customer, Article, InvoiceTemplate } from '../types'

export const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    company: 'Test AG',
    contact: 'Max Mustermann',
    street: 'Teststraße 123',
    city: '12345 Teststadt',
    phone: '+49 123 456789',
    email: 'test@test-ag.de'
  },
  {
    id: 'customer-2',
    company: 'Demo GmbH',
    contact: 'Anna Schmidt',
    street: 'Demoweg 456',
    city: '67890 Demostadt',
    phone: '+49 987 654321',
    email: 'info@demo-gmbh.de'
  }
]

export const mockArticles: Article[] = [
  {
    id: 'article-1',
    name: 'Laptop Dell XPS 13',
    price: 1299.99,
    cost: 899.99,
    stock: 15,
    minStock: 5
  },
  {
    id: 'article-2',
    name: 'Monitor 27" 4K',
    price: 449.99,
    cost: 299.99,
    stock: 8,
    minStock: 3
  },
  {
    id: 'article-3',
    name: 'Tastatur mechanisch',
    price: 129.99,
    cost: 79.99,
    stock: 25,
    minStock: 10
  }
]

export const mockTemplates: InvoiceTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard Rechnung',
    templateType: 'invoice',
    description: 'Standard-Vorlage für Rechnungen',
    templateContent: '# Rechnung {{invoice.invoiceNumber}}',
    isDefault: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'template-2',
    name: 'Premium Rechnung',
    templateType: 'invoice',
    description: 'Premium-Vorlage mit Logo',
    templateContent: '# Premium Rechnung {{invoice.invoiceNumber}}',
    isDefault: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
]

export const mockInvoice: Invoice = {
  id: 'invoice-1',
  customerId: 'customer-1',
  templateId: 'template-1',
  invoiceNumber: 'INV-2025-001',
  date: '2025-09-20',
  dueDate: '2025-10-04',
  totalAmount: 1549.98,
  taxAmount: 247.45,
  discountAmount: 0,
  netAmount: 1302.53,
  status: 'draft',
  notes: 'Test-Rechnung für Unit Tests',
  paymentTerms: 'Zahlbar innerhalb 14 Tagen',
  positions: [
    {
      id: 'pos-1',
      invoiceId: 'invoice-1',
      articleId: 'article-1',
      quantity: 1,
      unitPrice: 1299.99,
      totalPrice: 1299.99,
      articleName: 'Laptop Dell XPS 13'
    },
    {
      id: 'pos-2',
      invoiceId: 'invoice-1',
      articleId: 'article-2',
      quantity: 1,
      unitPrice: 249.99,
      totalPrice: 249.99,
      articleName: 'Monitor 27" 4K'
    }
  ],
  customer: mockCustomers[0],
  template: mockTemplates[0],
  createdAt: '2025-09-20T10:00:00Z',
  updatedAt: '2025-09-20T10:00:00Z'
}

export const mockInvoices: Invoice[] = [
  mockInvoice,
  {
    ...mockInvoice,
    id: 'invoice-2',
    invoiceNumber: 'INV-2025-002',
    status: 'sent',
    customerId: 'customer-2',
    customer: mockCustomers[1],
    totalAmount: 579.98,
    taxAmount: 92.44,
    netAmount: 487.54,
    positions: [
      {
        id: 'pos-3',
        invoiceId: 'invoice-2',
        articleId: 'article-2',
        quantity: 1,
        unitPrice: 449.99,
        totalPrice: 449.99,
        articleName: 'Monitor 27" 4K'
      },
      {
        id: 'pos-4',
        invoiceId: 'invoice-2',
        articleId: 'article-3',
        quantity: 1,
        unitPrice: 129.99,
        totalPrice: 129.99,
        articleName: 'Tastatur mechanisch'
      }
    ]
  }
]