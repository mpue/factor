import express from 'express';
import cors from 'cors';
import { articleRoutes } from './routes/articles';
import { customerRoutes } from './routes/customers';
import { DatabaseService } from './database/DatabaseService';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow frontend origins
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/customers', customerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Factor Warenwirtschaftssystem API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Factor Warenwirtschaftssystem API server running on port ${PORT}`);
  console.log(`📊 Database: SQLite`);
  console.log(`🌐 CORS enabled for: http://localhost:3000, http://localhost:5173`);
  
  // Initialize database
  DatabaseService.getInstance();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  DatabaseService.getInstance().close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  DatabaseService.getInstance().close();
  process.exit(0);
});