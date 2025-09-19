// Shared types between frontend and backend
export interface Article {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  company: string;
  contact: string;
  street: string;
  city: string;
  phone: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  positions?: InvoicePosition[];
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
}

export interface StockMovement {
  id: string;
  articleId: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceType?: 'invoice' | 'adjustment' | 'initial';
  referenceId?: string;
  notes?: string;
  createdAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Database row types (with snake_case)
export interface ArticleRow {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  company: string;
  contact: string;
  street: string;
  city: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}