// Type definitions for the Warenwirtschaft system

export interface Article {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

export interface Customer {
  id: string;
  company: string;
  contact: string;
  street: string;
  city: string;
  phone: string;
  email: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  templateType: 'invoice' | 'quote' | 'reminder';
  description?: string;
  templateContent: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoicePosition {
  id: string;
  invoiceId: string;
  articleId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string;
  articleName?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  templateId?: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  paymentTerms: string;
  positions?: InvoicePosition[];
  customer?: Customer;
  template?: InvoiceTemplate;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  articleId: string;
  articleName: string;
  type: 'in' | 'out';
  quantity: number;
  note: string;
  date: string;
  newStock: number;
}

export type Screen = 'main' | 'artikel' | 'kunden' | 'rechnungen' | 'lager' | 'berichte';