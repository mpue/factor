import { Article, Customer } from '../types/index';

// API Response types (duplicated for frontend, could be shared)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiDataService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3003/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Article methods
  async getArticles(): Promise<Article[]> {
    return this.request<Article[]>('/articles');
  }

  async getArticle(id: string): Promise<Article> {
    return this.request<Article>(`/articles/${id}`);
  }

  async saveArticle(article: Article): Promise<Article> {
    if (article.id && await this.articleExists(article.id)) {
      // Update existing article
      return this.request<Article>(`/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify(article),
      });
    } else {
      // Create new article
      return this.request<Article>('/articles', {
        method: 'POST',
        body: JSON.stringify(article),
      });
    }
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      await this.request<never>(`/articles/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete article:', error);
      return false;
    }
  }

  async adjustStock(id: string, quantity: number, movementType: 'in' | 'out' | 'adjustment'): Promise<Article> {
    return this.request<Article>(`/articles/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, movementType }),
    });
  }

  async getLowStockArticles(): Promise<Article[]> {
    return this.request<Article[]>('/articles/reports/low-stock');
  }

  private async articleExists(id: string): Promise<boolean> {
    try {
      await this.getArticle(id);
      return true;
    } catch {
      return false;
    }
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers');
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async saveCustomer(customer: Customer): Promise<Customer> {
    if (customer.id && await this.customerExists(customer.id)) {
      // Update existing customer
      return this.request<Customer>(`/customers/${customer.id}`, {
        method: 'PUT',
        body: JSON.stringify(customer),
      });
    } else {
      // Create new customer
      return this.request<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify(customer),
      });
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      await this.request<never>(`/customers/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete customer:', error);
      return false;
    }
  }

  async searchCustomers(company: string): Promise<Customer[]> {
    return this.request<Customer[]>(`/customers/search/${encodeURIComponent(company)}`);
  }

  private async customerExists(id: string): Promise<boolean> {
    try {
      await this.getCustomer(id);
      return true;
    } catch {
      return false;
    }
  }

  // Legacy compatibility methods for easier migration
  async saveArticles(articles: Article[]): Promise<void> {
    for (const article of articles) {
      await this.saveArticle(article);
    }
  }

  async saveCustomers(customers: Customer[]): Promise<void> {
    for (const customer of customers) {
      await this.saveCustomer(customer);
    }
  }

  // Placeholder methods for other entities
  getInvoices(): any[] {
    console.warn('Invoice API not yet implemented');
    return [];
  }

  saveInvoices(_invoices: any[]): void {
    console.warn('Invoice API not yet implemented');
  }

  getStockMovements(): any[] {
    console.warn('Stock movement API not yet implemented');
    return [];
  }

  saveStockMovements(_movements: any[]): void {
    console.warn('Stock movement API not yet implemented');
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      await this.request<any>('/health');
      return true;
    } catch {
      return false;
    }
  }
}