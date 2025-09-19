import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

export class DatabaseService {
  private db: sqlite3.Database;
  private static instance: DatabaseService;

  private constructor() {
    const dbPath = join(__dirname, '../../data/warenwirtschaft.db');
    this.db = new sqlite3.Database(dbPath, (err: Error | null) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeDatabase();
      }
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initializeDatabase(): void {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    this.db.exec(schema, (err: Error | null) => {
      if (err) {
        console.error('Error initializing database schema:', err);
      } else {
        console.log('Database schema initialized successfully');
      }
    });
  }

  public getDatabase(): sqlite3.Database {
    return this.db;
  }

  public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  public async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(this: sqlite3.RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  public close(): void {
    this.db.close((err: Error | null) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}