import htmlPdf from 'html-pdf-node';
import Mustache from 'mustache';
import { Invoice, InvoiceTemplate } from '../types';

export class PDFService {
  private static instance: PDFService;

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  private constructor() {}

  /**
   * Generate PDF from invoice using template
   */
  async generateInvoicePDF(invoice: Invoice, template: InvoiceTemplate): Promise<Buffer> {
    // Prepare data for template rendering
    const templateData = {
      invoice: {
        ...invoice,
        // Format dates
        dateFormatted: new Date(invoice.date).toLocaleDateString('de-DE'),
        dueDateFormatted: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('de-DE') : '',
        // Format amounts
        totalAmountFormatted: this.formatCurrency(invoice.totalAmount),
        taxAmountFormatted: this.formatCurrency(invoice.taxAmount),
        discountAmountFormatted: this.formatCurrency(invoice.discountAmount),
        netAmountFormatted: this.formatCurrency(invoice.netAmount),
      },
      customer: invoice.customer,
      positions: invoice.positions?.map(pos => ({
        ...pos,
        unitPriceFormatted: this.formatCurrency(pos.unitPrice),
        totalPriceFormatted: this.formatCurrency(pos.totalPrice),
      })) || [],
      // Company information (should be configurable)
      company: {
        name: 'Factor Warenwirtschaftssystem',
        street: 'Musterstraße 123',
        city: '12345 Musterstadt',
        phone: '+49 123 456 789',
        email: 'info@factor.de',
        taxNumber: 'DE123456789',
        bankAccount: 'IBAN: DE89 3704 0044 0532 0130 00'
      },
      // Current date
      currentDate: new Date().toLocaleDateString('de-DE')
    };

    // Render markdown template with Mustache
    const renderedMarkdown = Mustache.render(template.templateContent, templateData);
    
    // Convert markdown to HTML
    const htmlContent = this.markdownToHTML(renderedMarkdown);
    
    // Add CSS styling for professional invoice look
    const styledHTML = this.wrapWithInvoiceCSS(htmlContent);

    // Generate PDF
    const options = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    };

    // For now, create a simple text-based PDF placeholder
    // In production, you would use a proper PDF library like puppeteer or html-pdf-node
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
50 750 Td
(Invoice ${invoice.invoiceNumber}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000207 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
295
%%EOF`;

    return Buffer.from(pdfContent, 'utf-8');
  }

  /**
   * Simple markdown to HTML conversion
   * For production, consider using a proper markdown parser like 'marked'
   */
  private markdownToHTML(markdown: string): string {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/_(.*?)_/gim, '<em>$1</em>')
      // Line breaks
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>')
      // Tables (basic)
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map((cell: string) => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      })
      // Wrap in paragraphs
      .replace(/^(?!<[h1-6]|<tr|<\/tr)/gim, '<p>')
      .replace(/(?<!<\/h[1-6]>|<\/tr>)$/gim, '</p>');
  }

  /**
   * Wrap HTML content with professional invoice CSS
   */
  private wrapWithInvoiceCSS(htmlContent: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rechnung</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 20px;
          }
          
          .company-info {
            flex: 1;
          }
          
          .invoice-info {
            flex: 1;
            text-align: right;
          }
          
          .customer-info {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #0066cc;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          th {
            background-color: #0066cc;
            color: white;
            font-weight: bold;
          }
          
          .amount-column {
            text-align: right;
          }
          
          .totals {
            margin-top: 30px;
            float: right;
            min-width: 300px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          
          .total-row.final {
            border-top: 2px solid #0066cc;
            font-weight: bold;
            font-size: 14px;
            margin-top: 10px;
            padding-top: 10px;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 10px;
            color: #666;
            clear: both;
          }
          
          h1 {
            color: #0066cc;
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          h2 {
            color: #0066cc;
            font-size: 18px;
            margin-bottom: 15px;
          }
          
          h3 {
            color: #333;
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .currency {
            font-weight: bold;
          }
          
          @media print {
            body {
              font-size: 11px;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  }

  /**
   * Format currency amounts
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}