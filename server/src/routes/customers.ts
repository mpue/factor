import { Router, Request, Response } from 'express';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { ApiResponse, Customer } from '../types';

export const customerRoutes = Router();
const customerRepo = new CustomerRepository();

// GET /api/customers - Get all customers
customerRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const customers = await customerRepo.findAll();
    const response: ApiResponse<Customer[]> = {
      success: true,
      data: customers
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});

// GET /api/customers/:id - Get customer by ID
customerRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await customerRepo.findById(req.params.id);
    if (!customer) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Customer not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<Customer> = {
      success: true,
      data: customer
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});

// POST /api/customers - Create new customer
customerRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    
    // Basic validation
    if (!customerData.company) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required field: company'
      };
      return res.status(400).json(response);
    }

    const customer = await customerRepo.create({
      company: customerData.company,
      contact: customerData.contact || '',
      street: customerData.street || '',
      city: customerData.city || '',
      phone: customerData.phone || '',
      email: customerData.email || ''
    });

    const response: ApiResponse<Customer> = {
      success: true,
      data: customer,
      message: 'Customer created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});

// PUT /api/customers/:id - Update customer
customerRoutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    const customer = await customerRepo.update(req.params.id, customerData);
    
    if (!customer) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Customer not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Customer> = {
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});

// DELETE /api/customers/:id - Delete customer
customerRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await customerRepo.delete(req.params.id);
    
    if (!deleted) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Customer not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<never> = {
      success: true,
      message: 'Customer deleted successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});

// GET /api/customers/search/:company - Search customers by company name
customerRoutes.get('/search/:company', async (req: Request, res: Response) => {
  try {
    const customers = await customerRepo.findByCompany(req.params.company);
    const response: ApiResponse<Customer[]> = {
      success: true,
      data: customers
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
});