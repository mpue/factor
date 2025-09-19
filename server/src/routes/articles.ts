import { Router, Request, Response } from 'express';
import { ArticleRepository } from '../repositories/ArticleRepository';
import { ApiResponse, Article } from '../types';

export const articleRoutes = Router();
const articleRepo = new ArticleRepository();

// GET /api/articles - Get all articles
articleRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const articles = await articleRepo.findAll();
    const response: ApiResponse<Article[]> = {
      success: true,
      data: articles
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

// GET /api/articles/:id - Get article by ID
articleRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const article = await articleRepo.findById(req.params.id);
    if (!article) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Article not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<Article> = {
      success: true,
      data: article
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

// POST /api/articles - Create new article
articleRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const articleData = req.body;
    
    // Basic validation
    if (!articleData.name || typeof articleData.price !== 'number') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields: name and price'
      };
      return res.status(400).json(response);
    }

    const article = await articleRepo.create({
      name: articleData.name,
      price: articleData.price || 0,
      cost: articleData.cost || 0,
      stock: articleData.stock || 0,
      minStock: articleData.minStock || 0
    });

    const response: ApiResponse<Article> = {
      success: true,
      data: article,
      message: 'Article created successfully'
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

// PUT /api/articles/:id - Update article
articleRoutes.put('/:id', async (req: Request, res: Response) => {
  try {
    const articleData = req.body;
    const article = await articleRepo.update(req.params.id, articleData);
    
    if (!article) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Article not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Article> = {
      success: true,
      data: article,
      message: 'Article updated successfully'
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

// DELETE /api/articles/:id - Delete article
articleRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await articleRepo.delete(req.params.id);
    
    if (!deleted) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Article not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<never> = {
      success: true,
      message: 'Article deleted successfully'
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

// POST /api/articles/:id/stock - Adjust stock
articleRoutes.post('/:id/stock', async (req: Request, res: Response) => {
  try {
    const { quantity, movementType } = req.body;
    
    if (typeof quantity !== 'number' || !['in', 'out', 'adjustment'].includes(movementType)) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid quantity or movement type'
      };
      return res.status(400).json(response);
    }

    const article = await articleRepo.adjustStock(req.params.id, quantity, movementType);
    
    if (!article) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Article not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Article> = {
      success: true,
      data: article,
      message: 'Stock adjusted successfully'
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

// GET /api/articles/reports/low-stock - Get articles with low stock
articleRoutes.get('/reports/low-stock', async (req: Request, res: Response) => {
  try {
    const articles = await articleRepo.findLowStock();
    const response: ApiResponse<Article[]> = {
      success: true,
      data: articles
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