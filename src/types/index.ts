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

export interface InvoicePosition {
  pos: number;
  articleId: string;
  articleName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  number: string;
  customerId: string;
  customerName: string;
  date: string;
  positions: InvoicePosition[];
  total: number;
  status: string;
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