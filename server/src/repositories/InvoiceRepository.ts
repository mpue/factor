import { DatabaseService } from '../database/DatabaseService';
import { Invoice, InvoiceRow, InvoicePosition, Customer, InvoiceTemplate } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  private mapRowToInvoice(row: InvoiceRow): Invoice {
    return {
      id: row.id,
      customerId: row.customer_id,
      templateId: row.template_id || undefined,
      invoiceNumber: row.invoice_number,
      date: row.date,
      dueDate: row.due_date || undefined,
      totalAmount: row.total_amount,
      taxAmount: row.tax_amount,
      discountAmount: row.discount_amount,
      netAmount: row.net_amount,
      status: row.status as Invoice['status'],
      notes: row.notes,
      paymentTerms: row.payment_terms,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async findAll(): Promise<Invoice[]> {
    const sql = `
      SELECT i.*, c.company as customer_company, c.contact as customer_contact,
             t.name as template_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN invoice_templates t ON i.template_id = t.id
      ORDER BY i.invoice_number DESC
    `;
    
    const rows = await this.db.query<InvoiceRow & { customer_company: string; customer_contact: string; template_name: string }>(sql);
    
    return rows.map(row => {
      const invoice = this.mapRowToInvoice(row);
      if (row.customer_company) {
        invoice.customer = {
          id: invoice.customerId,
          company: row.customer_company,
          contact: row.customer_contact,
          street: '', city: '', phone: '', email: ''
        } as Customer;
      }
      if (row.template_name) {
        invoice.template = { name: row.template_name } as InvoiceTemplate;
      }
      return invoice;
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    const sql = `
      SELECT i.*, c.company, c.contact, c.street, c.city, c.phone, c.email,
             t.name as template_name, t.template_content
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN invoice_templates t ON i.template_id = t.id
      WHERE i.id = ?
    `;
    
    const row = await this.db.get<InvoiceRow & Customer & { template_name: string; template_content: string }>(sql, [id]);
    if (!row) return null;

    const invoice = this.mapRowToInvoice(row);
    
    // Add customer data
    invoice.customer = {
      id: invoice.customerId,
      company: row.company,
      contact: row.contact,
      street: row.street,
      city: row.city,
      phone: row.phone,
      email: row.email
    };

    // Add template data
    if (row.template_name) {
      invoice.template = {
        id: invoice.templateId!,
        name: row.template_name,
        templateContent: row.template_content
      } as InvoiceTemplate;
    }

    // Load positions
    invoice.positions = await this.findPositions(id);

    return invoice;
  }

  async findPositions(invoiceId: string): Promise<InvoicePosition[]> {
    const sql = `
      SELECT ip.*, a.name as article_name
      FROM invoice_positions ip
      LEFT JOIN articles a ON ip.article_id = a.id
      WHERE ip.invoice_id = ?
      ORDER BY ip.created_at
    `;
    
    const rows = await this.db.query<any>(sql, [invoiceId]);
    return rows.map((row: any) => ({
      id: row.id,
      invoiceId: row.invoice_id,
      articleId: row.article_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalPrice: row.total_price,
      createdAt: row.created_at,
      articleName: row.article_name
    }));
  }

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const yearStr = year.toString();
    
    // Find highest invoice number for current year
    const sql = `
      SELECT invoice_number FROM invoices 
      WHERE invoice_number LIKE ?
      ORDER BY invoice_number DESC 
      LIMIT 1
    `;
    
    const result = await this.db.get<{ invoice_number: string }>(sql, [`${yearStr}%`]);
    
    if (result) {
      const lastNumber = parseInt(result.invoice_number.substring(4)) || 0;
      return `${yearStr}${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      return `${yearStr}0001`;
    }
  }

  async create(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> & { positions?: Omit<InvoicePosition, 'id' | 'invoiceId' | 'createdAt'>[] }): Promise<Invoice> {
    const id = uuidv4();
    
    // Generate invoice number if not provided
    const invoiceNumber = invoiceData.invoiceNumber || await this.generateInvoiceNumber();
    
    const sql = `
      INSERT INTO invoices (
        id, customer_id, template_id, invoice_number, date, due_date,
        total_amount, tax_amount, discount_amount, net_amount,
        status, notes, payment_terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.run(sql, [
      id,
      invoiceData.customerId,
      invoiceData.templateId || null,
      invoiceNumber,
      invoiceData.date,
      invoiceData.dueDate || null,
      invoiceData.totalAmount,
      invoiceData.taxAmount,
      invoiceData.discountAmount,
      invoiceData.netAmount,
      invoiceData.status,
      invoiceData.notes || '',
      invoiceData.paymentTerms
    ]);

    // Add positions if provided
    if (invoiceData.positions && invoiceData.positions.length > 0) {
      await this.addPositions(id, invoiceData.positions);
    }

    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create invoice');
    }
    
    return created;
  }

  async addPositions(invoiceId: string, positions: Omit<InvoicePosition, 'id' | 'invoiceId' | 'createdAt'>[]): Promise<void> {
    const sql = `
      INSERT INTO invoice_positions (id, invoice_id, article_id, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (const position of positions) {
      const positionId = uuidv4();
      await this.db.run(sql, [
        positionId,
        invoiceId,
        position.articleId,
        position.quantity,
        position.unitPrice,
        position.totalPrice
      ]);
    }
  }

  async update(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Invoice | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const sql = `
      UPDATE invoices 
      SET customer_id = ?, template_id = ?, invoice_number = ?, date = ?, due_date = ?,
          total_amount = ?, tax_amount = ?, discount_amount = ?, net_amount = ?,
          status = ?, notes = ?, payment_terms = ?
      WHERE id = ?
    `;

    await this.db.run(sql, [
      invoiceData.customerId ?? existing.customerId,
      invoiceData.templateId ?? existing.templateId,
      invoiceData.invoiceNumber ?? existing.invoiceNumber,
      invoiceData.date ?? existing.date,
      invoiceData.dueDate ?? existing.dueDate,
      invoiceData.totalAmount ?? existing.totalAmount,
      invoiceData.taxAmount ?? existing.taxAmount,
      invoiceData.discountAmount ?? existing.discountAmount,
      invoiceData.netAmount ?? existing.netAmount,
      invoiceData.status ?? existing.status,
      invoiceData.notes ?? existing.notes,
      invoiceData.paymentTerms ?? existing.paymentTerms,
      id
    ]);

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    // Delete positions first (CASCADE should handle this, but let's be explicit)
    await this.db.run('DELETE FROM invoice_positions WHERE invoice_id = ?', [id]);
    
    const result = await this.db.run('DELETE FROM invoices WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  async findByStatus(status: Invoice['status']): Promise<Invoice[]> {
    const sql = `
      SELECT i.*, c.company as customer_company, c.contact as customer_contact
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.status = ?
      ORDER BY i.date DESC
    `;
    
    const rows = await this.db.query<InvoiceRow & { customer_company: string; customer_contact: string }>(sql, [status]);
    
    return rows.map(row => {
      const invoice = this.mapRowToInvoice(row);
      if (row.customer_company) {
        invoice.customer = {
          id: invoice.customerId,
          company: row.customer_company,
          contact: row.customer_contact
        } as Customer;
      }
      return invoice;
    });
  }

  async findByCustomer(customerId: string): Promise<Invoice[]> {
    const sql = `
      SELECT i.*, c.company as customer_company, c.contact as customer_contact
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.customer_id = ?
      ORDER BY i.date DESC
    `;
    
    const rows = await this.db.query<InvoiceRow & { customer_company: string; customer_contact: string }>(sql, [customerId]);
    
    return rows.map(row => {
      const invoice = this.mapRowToInvoice(row);
      if (row.customer_company) {
        invoice.customer = {
          id: invoice.customerId,
          company: row.customer_company,
          contact: row.customer_contact
        } as Customer;
      }
      return invoice;
    });
  }
}