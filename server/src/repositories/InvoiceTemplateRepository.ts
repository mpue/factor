import { DatabaseService } from '../database/DatabaseService';
import { InvoiceTemplate, InvoiceTemplateRow } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class InvoiceTemplateRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  private mapRowToTemplate(row: InvoiceTemplateRow): InvoiceTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      templateContent: row.template_content,
      templateType: row.template_type as 'invoice' | 'quote' | 'reminder',
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async findAll(): Promise<InvoiceTemplate[]> {
    const rows = await this.db.query<InvoiceTemplateRow>('SELECT * FROM invoice_templates ORDER BY name');
    return rows.map(this.mapRowToTemplate);
  }

  async findByType(type: 'invoice' | 'quote' | 'reminder'): Promise<InvoiceTemplate[]> {
    const rows = await this.db.query<InvoiceTemplateRow>(
      'SELECT * FROM invoice_templates WHERE template_type = ? ORDER BY name',
      [type]
    );
    return rows.map(this.mapRowToTemplate);
  }

  async findById(id: string): Promise<InvoiceTemplate | null> {
    const row = await this.db.get<InvoiceTemplateRow>('SELECT * FROM invoice_templates WHERE id = ?', [id]);
    return row ? this.mapRowToTemplate(row) : null;
  }

  async findDefault(type?: 'invoice' | 'quote' | 'reminder'): Promise<InvoiceTemplate | null> {
    let sql = 'SELECT * FROM invoice_templates WHERE is_default = TRUE';
    const params: any[] = [];
    
    if (type) {
      sql += ' AND template_type = ?';
      params.push(type);
    }
    
    sql += ' LIMIT 1';
    
    const row = await this.db.get<InvoiceTemplateRow>(sql, params);
    return row ? this.mapRowToTemplate(row) : null;
  }

  async findDefaultByType(type: InvoiceTemplate['templateType']): Promise<InvoiceTemplate | null> {
    return this.findDefault(type);
  }

  async create(templateData: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvoiceTemplate> {
    const id = uuidv4();
    
    // If this template should be default, unset other defaults of the same type
    if (templateData.isDefault) {
      await this.db.run(
        'UPDATE invoice_templates SET is_default = FALSE WHERE template_type = ?',
        [templateData.templateType]
      );
    }
    
    const sql = `
      INSERT INTO invoice_templates (id, name, description, template_content, template_type, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.run(sql, [
      id,
      templateData.name,
      templateData.description || '',
      templateData.templateContent,
      templateData.templateType,
      templateData.isDefault ? 1 : 0
    ]);

    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create template');
    }
    
    return created;
  }

  async update(id: string, templateData: Partial<Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InvoiceTemplate | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    // If this template should be default, unset other defaults of the same type
    if (templateData.isDefault) {
      const typeToUpdate = templateData.templateType || existing.templateType;
      await this.db.run(
        'UPDATE invoice_templates SET is_default = FALSE WHERE template_type = ? AND id != ?',
        [typeToUpdate, id]
      );
    }

    const sql = `
      UPDATE invoice_templates 
      SET name = ?, description = ?, template_content = ?, template_type = ?, is_default = ?
      WHERE id = ?
    `;

    await this.db.run(sql, [
      templateData.name ?? existing.name,
      templateData.description ?? existing.description,
      templateData.templateContent ?? existing.templateContent,
      templateData.templateType ?? existing.templateType,
      (templateData.isDefault ?? existing.isDefault) ? 1 : 0,
      id
    ]);

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM invoice_templates WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  async setAsDefault(id: string): Promise<InvoiceTemplate | null> {
    const template = await this.findById(id);
    if (!template) {
      return null;
    }

    // Unset other defaults of the same type
    await this.db.run(
      'UPDATE invoice_templates SET is_default = FALSE WHERE template_type = ?',
      [template.templateType]
    );

    // Set this template as default
    await this.db.run(
      'UPDATE invoice_templates SET is_default = TRUE WHERE id = ?',
      [id]
    );

    return this.findById(id);
  }

  async uploadTemplate(file: { name: string; content: string; type?: 'invoice' | 'quote' | 'reminder' }): Promise<InvoiceTemplate> {
    // Extract name without .md extension
    const templateName = file.name.replace(/\.md$/, '');
    const templateType = file.type || 'invoice';
    
    return this.create({
      name: templateName,
      description: `Uploaded template: ${file.name}`,
      templateContent: file.content,
      templateType,
      isDefault: false
    });
  }
}