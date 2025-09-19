import { DatabaseService } from '../database/DatabaseService';
import { Article, ArticleRow } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ArticleRepository {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  private mapRowToArticle(row: ArticleRow): Article {
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      cost: row.cost,
      stock: row.stock,
      minStock: row.min_stock,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async findAll(): Promise<Article[]> {
    const rows = await this.db.query<ArticleRow>('SELECT * FROM articles ORDER BY name');
    return rows.map(this.mapRowToArticle);
  }

  async findById(id: string): Promise<Article | null> {
    const row = await this.db.get<ArticleRow>('SELECT * FROM articles WHERE id = ?', [id]);
    return row ? this.mapRowToArticle(row) : null;
  }

  async create(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    const id = uuidv4();
    const sql = `
      INSERT INTO articles (id, name, price, cost, stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.run(sql, [
      id,
      articleData.name,
      articleData.price,
      articleData.cost,
      articleData.stock,
      articleData.minStock
    ]);

    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create article');
    }
    
    return created;
  }

  async update(id: string, articleData: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Article | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const sql = `
      UPDATE articles 
      SET name = ?, price = ?, cost = ?, stock = ?, min_stock = ?
      WHERE id = ?
    `;

    await this.db.run(sql, [
      articleData.name ?? existing.name,
      articleData.price ?? existing.price,
      articleData.cost ?? existing.cost,
      articleData.stock ?? existing.stock,
      articleData.minStock ?? existing.minStock,
      id
    ]);

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM articles WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  async adjustStock(id: string, quantity: number, movementType: 'in' | 'out' | 'adjustment'): Promise<Article | null> {
    const article = await this.findById(id);
    if (!article) {
      return null;
    }

    let newStock: number;
    switch (movementType) {
      case 'in':
        newStock = article.stock + quantity;
        break;
      case 'out':
        newStock = article.stock - quantity;
        break;
      case 'adjustment':
        newStock = quantity;
        break;
    }

    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }

    await this.db.run('UPDATE articles SET stock = ? WHERE id = ?', [newStock, id]);
    
    // Record stock movement (would typically be in a separate table)
    // This is a simplified version - in practice you'd have a StockMovementRepository
    
    return await this.findById(id);
  }

  async findLowStock(): Promise<Article[]> {
    const sql = 'SELECT * FROM articles WHERE stock <= min_stock ORDER BY name';
    const rows = await this.db.query<ArticleRow>(sql);
    return rows.map(this.mapRowToArticle);
  }
}