import { Invoice, InvoiceTemplate, InvoicePosition } from '../types';

const API_BASE_URL = 'http://localhost:3003/api';

export class InvoiceService {
  // === TEMPLATE METHODS ===
  
  async getTemplates(): Promise<InvoiceTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/templates`);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  }

  async getTemplatesByType(type: InvoiceTemplate['templateType']): Promise<InvoiceTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/templates/type/${type}`);
    if (!response.ok) {
      throw new Error('Failed to fetch templates by type');
    }
    return response.json();
  }

  async getDefaultTemplate(type: InvoiceTemplate['templateType']): Promise<InvoiceTemplate | null> {
    const response = await fetch(`${API_BASE_URL}/invoices/templates/default/${type}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch default template');
    }
    return response.json();
  }

  async uploadTemplate(file: File, name: string, type: InvoiceTemplate['templateType'], description?: string, isDefault?: boolean): Promise<InvoiceTemplate> {
    const formData = new FormData();
    formData.append('template', file);
    formData.append('name', name);
    formData.append('type', type);
    if (description) formData.append('description', description);
    if (isDefault !== undefined) formData.append('isDefault', isDefault.toString());

    const response = await fetch(`${API_BASE_URL}/invoices/templates/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload template');
    }

    return response.json();
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/invoices/templates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete template');
    }
  }

  async setTemplateAsDefault(id: string): Promise<InvoiceTemplate> {
    const response = await fetch(`${API_BASE_URL}/invoices/templates/${id}/set-default`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to set template as default');
    }

    return response.json();
  }

  // === INVOICE METHODS ===

  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    return response.json();
  }

  async getInvoicesByStatus(status: Invoice['status']): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/status/${status}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices by status');
    }
    return response.json();
  }

  async getInvoicesByCustomer(customerId: string): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/invoices/customer/${customerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices by customer');
    }
    return response.json();
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    return response.json();
  }

  async generateInvoiceNumber(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/invoices/generate-number`);
    if (!response.ok) {
      throw new Error('Failed to generate invoice number');
    }
    const result = await response.json();
    return result.invoiceNumber;
  }

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> & { 
    positions?: Omit<InvoicePosition, 'id' | 'invoiceId' | 'createdAt'>[] 
  }): Promise<Invoice> {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invoice');
    }

    return response.json();
  }

  async updateInvoice(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Invoice | null> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to update invoice');
    }

    return response.json();
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'DELETE',
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }

    return true;
  }

  async exportInvoicePDF(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/pdf`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to export PDF');
    }

    return response.blob();
  }

  async downloadInvoicePDF(id: string, filename?: string): Promise<void> {
    const pdfBlob = await this.exportInvoicePDF(id);
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `invoice-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}