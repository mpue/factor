import fs from 'fs/promises';
import path from 'path';
import { DatabaseService } from '../database/DatabaseService';
import { InvoiceTemplateRepository } from '../repositories/InvoiceTemplateRepository';

export class DatabaseSeeder {
  private db: DatabaseService;
  private templateRepository: InvoiceTemplateRepository;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.templateRepository = new InvoiceTemplateRepository();
  }

  async seedDefaultTemplates(): Promise<void> {
    console.log('🌱 Seeding default invoice templates...');

    try {
      // Check if default invoice template already exists
      const existing = await this.templateRepository.findDefaultByType('invoice');
      if (existing) {
        console.log('   ✅ Default invoice template already exists');
        return;
      }

      // Read default template file
      const templatePath = path.join(__dirname, '../../templates/default-invoice.md');
      let templateContent: string;

      try {
        templateContent = await fs.readFile(templatePath, 'utf-8');
      } catch (error) {
        console.warn('   ⚠️  Default template file not found, using basic template');
        templateContent = this.getBasicInvoiceTemplate();
      }

      // Create default template
      await this.templateRepository.create({
        name: 'Standard Rechnungsvorlage',
        templateType: 'invoice',
        description: 'Standard-Vorlage für Rechnungen mit allen wichtigen Feldern',
        templateContent,
        isDefault: true
      });

      console.log('   ✅ Default invoice template created');
    } catch (error) {
      console.error('   ❌ Error seeding templates:', error);
    }
  }

  async seedSampleData(): Promise<void> {
    console.log('🌱 Seeding sample data...');

    try {
      // Check if sample data already exists
      const existingArticles = await this.db.query<{ count: number }>('SELECT COUNT(*) as count FROM articles');
      if (existingArticles[0]?.count > 0) {
        console.log('   ✅ Sample data already exists');
        return;
      }

      // Add sample articles
      const sampleArticles = [
        { id: 'article-1', name: 'Laptop Dell XPS 13', price: 1299.99, cost: 899.99, stock: 15, min_stock: 5 },
        { id: 'article-2', name: 'Monitor 27" 4K', price: 449.99, cost: 299.99, stock: 8, min_stock: 3 },
        { id: 'article-3', name: 'Tastatur mechanisch', price: 129.99, cost: 79.99, stock: 25, min_stock: 10 },
        { id: 'article-4', name: 'Maus Logitech MX Master', price: 89.99, cost: 59.99, stock: 20, min_stock: 8 }
      ];

      for (const article of sampleArticles) {
        await this.db.run(
          'INSERT INTO articles (id, name, price, cost, stock, min_stock) VALUES (?, ?, ?, ?, ?, ?)',
          [article.id, article.name, article.price, article.cost, article.stock, article.min_stock]
        );
      }

      // Add sample customers
      const sampleCustomers = [
        {
          id: 'customer-1',
          company: 'Tech Solutions GmbH',
          contact: 'Max Mustermann',
          street: 'Hauptstraße 123',
          city: '10115 Berlin',
          phone: '+49 30 12345678',
          email: 'max@techsolutions.de'
        },
        {
          id: 'customer-2',
          company: 'Digital Services AG',
          contact: 'Anna Schmidt',
          street: 'Königsallee 45',
          city: '40212 Düsseldorf',
          phone: '+49 211 87654321',
          email: 'anna@digitalservices.de'
        }
      ];

      for (const customer of sampleCustomers) {
        await this.db.run(
          'INSERT INTO customers (id, company, contact, street, city, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [customer.id, customer.company, customer.contact, customer.street, customer.city, customer.phone, customer.email]
        );
      }

      console.log('   ✅ Sample data created');
    } catch (error) {
      console.error('   ❌ Error seeding sample data:', error);
    }
  }

  async run(): Promise<void> {
    console.log('🚀 Running database seeder...');
    await this.seedDefaultTemplates();
    await this.seedSampleData();
    console.log('✅ Database seeding completed');
  }

  private getBasicInvoiceTemplate(): string {
    return `# Rechnung Nr. {{invoice.invoiceNumber}}

**{{company.name}}**  
{{company.street}}  
{{company.city}}  
Telefon: {{company.phone}}  
E-Mail: {{company.email}}

---

**Kunde:**  
{{customer.company}}  
{{customer.contact}}  
{{customer.street}}  
{{customer.city}}

---

**Rechnungsdatum:** {{invoice.dateFormatted}}  
**Fälligkeitsdatum:** {{invoice.dueDateFormatted}}

---

## Positionen

| Artikel | Menge | Einzelpreis | Gesamtpreis |
|---------|-------|-------------|-------------|
{{#positions}}
| {{articleName}} | {{quantity}} | {{unitPriceFormatted}} | {{totalPriceFormatted}} |
{{/positions}}

---

**Gesamtbetrag:** {{invoice.totalAmountFormatted}}

Vielen Dank für Ihren Auftrag!`;
  }
}