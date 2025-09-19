import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { InvoiceTemplateRepository } from '../repositories/InvoiceTemplateRepository';
import { InvoiceRepository } from '../repositories/InvoiceRepository';
import { PDFService } from '../services/PDFService';
import { InvoiceTemplate, Invoice, InvoicePosition } from '../types';

// Extend Request interface for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = Router();
const invoiceTemplateRepository = new InvoiceTemplateRepository();
const invoiceRepository = new InvoiceRepository();
const pdfService = PDFService.getInstance();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'templates');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req: any, file: any, cb: any) => {
    // Only allow markdown files
    if (file.mimetype === 'text/markdown' || 
        file.originalname.toLowerCase().endsWith('.md') ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only Markdown files (.md) are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// === INVOICE TEMPLATE ROUTES ===

// Get all templates
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await invoiceTemplateRepository.findAll();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get templates by type
router.get('/templates/type/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const templates = await invoiceTemplateRepository.findByType(type as InvoiceTemplate['templateType']);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates by type:', error);
    res.status(500).json({ error: 'Failed to fetch templates by type' });
  }
});

// Get default template for type
router.get('/templates/default/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const template = await invoiceTemplateRepository.findDefaultByType(type as InvoiceTemplate['templateType']);
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ error: 'No default template found for this type' });
    }
  } catch (error) {
    console.error('Error fetching default template:', error);
    res.status(500).json({ error: 'Failed to fetch default template' });
  }
});

// Upload new template
router.post('/templates/upload', upload.single('template'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No template file uploaded' });
    }

    const { name, type, description, isDefault } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Template name and type are required' });
    }

    // Read the uploaded file content
    const templateContent = await fs.readFile(req.file.path, 'utf-8');

    // Create template record
    const templateData: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      templateType: type as InvoiceTemplate['templateType'],
      description: description || '',
      templateContent,
      isDefault: isDefault === 'true' || isDefault === true
    };

    const template = await invoiceTemplateRepository.create(templateData);

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.status(201).json(template);
  } catch (error) {
    console.error('Error uploading template:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload template' });
  }
});

// Get template by ID
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await invoiceTemplateRepository.findById(id);
    
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Update template
router.put('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const template = await invoiceTemplateRepository.update(id, updateData);
    
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Set template as default
router.patch('/templates/:id/set-default', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await invoiceTemplateRepository.setAsDefault(id);
    
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error setting template as default:', error);
    res.status(500).json({ error: 'Failed to set template as default' });
  }
});

// Delete template
router.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await invoiceTemplateRepository.delete(id);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// === INVOICE ROUTES ===

// Get all invoices
router.get('/', async (req: Request, res: Response) => {
  try {
    const invoices = await invoiceRepository.findAll();
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoices by status
router.get('/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const invoices = await invoiceRepository.findByStatus(status as Invoice['status']);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices by status:', error);
    res.status(500).json({ error: 'Failed to fetch invoices by status' });
  }
});

// Get invoices by customer
router.get('/customer/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const invoices = await invoiceRepository.findByCustomer(customerId);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices by customer:', error);
    res.status(500).json({ error: 'Failed to fetch invoices by customer' });
  }
});

// Generate new invoice number
router.get('/generate-number', async (req: Request, res: Response) => {
  try {
    const invoiceNumber = await invoiceRepository.generateInvoiceNumber();
    res.json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    res.status(500).json({ error: 'Failed to generate invoice number' });
  }
});

// Create new invoice
router.post('/', async (req: Request, res: Response) => {
  try {
    const invoiceData = req.body;
    
    // Validate required fields
    if (!invoiceData.customerId || !invoiceData.date) {
      return res.status(400).json({ error: 'Customer ID and date are required' });
    }

    const invoice = await invoiceRepository.create(invoiceData);
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Get invoice by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceRepository.findById(id);
    
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Update invoice
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const invoice = await invoiceRepository.update(id, updateData);
    
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await invoiceRepository.delete(id);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Export invoice as PDF
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceRepository.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get template (use provided template or default)
    let template: InvoiceTemplate | null = invoice.template || null;
    if (!template && invoice.templateId) {
      template = await invoiceTemplateRepository.findById(invoice.templateId);
    }
    
    // If still no template, use default invoice template
    if (!template) {
      template = await invoiceTemplateRepository.findDefaultByType('invoice');
    }

    if (!template) {
      return res.status(400).json({ error: 'No template available for PDF generation' });
    }

    // Generate PDF
    const pdfBuffer = await pdfService.generateInvoicePDF(invoice, template);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;