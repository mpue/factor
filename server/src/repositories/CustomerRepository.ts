import { DatabaseService } from '../database/DatabaseService';
import { Customer, CustomerRow } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CustomerRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  private mapRowToCustomer(row: CustomerRow): Customer {
    return {
      id: row.id,
      company: row.company,
      contact: row.contact,
      street: row.street,
      city: row.city,
      phone: row.phone,
      email: row.email,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async findAll(): Promise<Customer[]> {
    const rows = await this.db.query<CustomerRow>('SELECT * FROM customers ORDER BY company');
    return rows.map(this.mapRowToCustomer);
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.db.get<CustomerRow>('SELECT * FROM customers WHERE id = ?', [id]);
    return row ? this.mapRowToCustomer(row) : null;
  }

  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const id = uuidv4();
    const sql = `
      INSERT INTO customers (id, company, contact, street, city, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.run(sql, [
      id,
      customerData.company,
      customerData.contact,
      customerData.street,
      customerData.city,
      customerData.phone,
      customerData.email
    ]);

    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create customer');
    }
    
    return created;
  }

  async update(id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Customer | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const sql = `
      UPDATE customers 
      SET company = ?, contact = ?, street = ?, city = ?, phone = ?, email = ?
      WHERE id = ?
    `;

    await this.db.run(sql, [
      customerData.company ?? existing.company,
      customerData.contact ?? existing.contact,
      customerData.street ?? existing.street,
      customerData.city ?? existing.city,
      customerData.phone ?? existing.phone,
      customerData.email ?? existing.email,
      id
    ]);

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM customers WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  async findByCompany(company: string): Promise<Customer[]> {
    const sql = 'SELECT * FROM customers WHERE company LIKE ? ORDER BY company';
    const rows = await this.db.query<CustomerRow>(sql, [`%${company}%`]);
    return rows.map(this.mapRowToCustomer);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const row = await this.db.get<CustomerRow>('SELECT * FROM customers WHERE email = ?', [email]);
    return row ? this.mapRowToCustomer(row) : null;
  }
}