# Factor Warenwirtschaftssystem

This is a DOS-style inventory management system built with TypeScript and modern web technologies.

## Project Structure

- `main.ts` - Entry point that initializes the application
- `src/app.ts` - Main application class that coordinates all modules
- `src/types/` - TypeScript type definitions
- `src/services/` - Service classes (DataService, UIService)
- `src/managers/` - Business logic managers (ArticleManager, CustomerManager, etc.)
- `index.html` - Clean HTML structure without embedded JavaScript
- `styles.css` - DOS-style CSS extracted from the original file

## Architecture

The application follows a modular architecture:

- **DataService**: Handles localStorage operations and sample data initialization
- **UIService**: Manages UI interactions, screen switching, and form operations
- **Managers**: Handle business logic for different modules (Articles, Customers, Invoices, Stock, Reports)
- **Types**: Provides TypeScript interfaces for type safety

## Current Status

✅ **Completed Modules:**
- Article Management (CRUD operations)
- Customer Management (CRUD operations)
- Basic UI framework and navigation

🚧 **In Progress:**
- Invoice Management
- Stock/Inventory Management
- Reporting System

## Development Guidelines

- Use TypeScript for all new code
- Follow the established service/manager pattern
- Keep HTML clean and free of inline JavaScript
- Use CSS classes for styling instead of inline styles
- Maintain DOS-style visual theme
- Ensure keyboard navigation (F1-F12 keys) works properly

## Building and Running

1. Install dependencies: `npm install`
2. Build TypeScript: `npm run build`
3. Serve locally: `npm start`
4. For development: `npm run dev` (watch mode)

## Key Features

- DOS-style interface with authentic retro styling
- Full keyboard navigation (F1-F12 function keys)
- LocalStorage persistence
- Modular TypeScript architecture
- Responsive design
- Print-friendly invoice previews