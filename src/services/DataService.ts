import { Article, Customer, Invoice, StockMovement } from '../types/index.js';

export class DataService {
  private static readonly STORAGE_KEYS = {
    ARTICLES: 'articles',
    CUSTOMERS: 'customers',
    INVOICES: 'invoices',
    STOCK_MOVEMENTS: 'stockMovements'
  };

  // Articles
  getArticles(): Article[] {
    return JSON.parse(localStorage.getItem(DataService.STORAGE_KEYS.ARTICLES) || '[]');
  }

  saveArticles(articles: Article[]): void {
    localStorage.setItem(DataService.STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  }

  // Customers
  getCustomers(): Customer[] {
    return JSON.parse(localStorage.getItem(DataService.STORAGE_KEYS.CUSTOMERS) || '[]');
  }

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(DataService.STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  // Invoices
  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(DataService.STORAGE_KEYS.INVOICES) || '[]');
  }

  saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(DataService.STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }

  // Stock Movements
  getStockMovements(): StockMovement[] {
    return JSON.parse(localStorage.getItem(DataService.STORAGE_KEYS.STOCK_MOVEMENTS) || '[]');
  }

  saveStockMovements(movements: StockMovement[]): void {
    localStorage.setItem(DataService.STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(movements));
  }

  // Initialize sample data
  initializeSampleData(): void {
    if (this.getArticles().length === 0) {
      const articles: Article[] = [
        { id: 'ART001', name: 'Bürostuhl Standard', price: 89.99, cost: 45.00, stock: 15, minStock: 5 },
        { id: 'ART002', name: 'Schreibtisch 120x80', price: 199.99, cost: 120.00, stock: 8, minStock: 2 },
        { id: 'ART003', name: 'Monitor 24 Zoll', price: 249.99, cost: 180.00, stock: 12, minStock: 3 }
      ];
      this.saveArticles(articles);
    }

    if (this.getCustomers().length === 0) {
      const customers: Customer[] = [
        { id: 'K001', company: 'Musterfirma GmbH', contact: 'Max Mustermann', street: 'Musterstraße 1', city: '12345 Musterstadt', phone: '0123-456789', email: 'max@musterfirma.de' },
        { id: 'K002', company: 'Beispiel AG', contact: 'Erika Beispiel', street: 'Beispielweg 15', city: '54321 Beispielstadt', phone: '0987-654321', email: 'erika@beispiel.ag' }
      ];
      this.saveCustomers(customers);
    }
  }
}