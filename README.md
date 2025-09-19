# Factor Warenwirtschaftssystem

A DOS-style inventory management system built with React, TypeScript, and IndexedDB for modern browser-based persistence.

## Features

- 📊 **Article Management** - Create, edit, and manage inventory items
- 👥 **Customer Management** - Maintain customer database
- 🧾 **Invoice System** - Generate and manage invoices (in development)
- 📦 **Stock Management** - Track inventory levels and movements (in development)
- 📈 **Reporting** - Generate various business reports (in development)
- ⌨️ **DOS-Style Interface** - Authentic retro feel with keyboard navigation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Modern web browser with IndexedDB support

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Project Structure

```
factor/
├── src/
│   ├── components/      # React components
│   │   └── screens/     # Screen-specific components
│   ├── contexts/        # React Context providers
│   ├── services/        # Data services (IndexedDB, legacy)
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main React application
├── index.html          # HTML entry point
├── styles.css          # DOS-style CSS
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
└── package.json        # Project dependencies
```

## Keyboard Shortcuts

- **F1** - Article Management
- **F2** - Customer Management  
- **F3** - Invoice System
- **F4** - Stock Management
- **F5** - Reports
- **F6** - New record (context-dependent)
- **F7** - Edit selected record
- **F8** - Delete selected record
- **F9** - Save current form
- **ESC** - Return to main menu / Cancel

## Architecture

The application uses a modern React architecture with TypeScript:

- **React Components**: Functional components with hooks for UI logic
- **Context API**: Global state management with useReducer
- **BrowserDataService**: IndexedDB operations for persistent storage
- **TypeScript Types**: Comprehensive interfaces for type safety
- **Vite**: Fast build tool with hot module replacement

## Current Status

✅ **Completed**: 
- React migration with modern component architecture
- Article and Customer management with full CRUD operations
- IndexedDB integration for browser-native persistence
- Automatic migration from localStorage to IndexedDB

🚧 **In Progress**: Invoice, Stock, and Reporting modules

## Contributing

1. Follow the established service/manager pattern
2. Keep HTML free of inline JavaScript
3. Use TypeScript for type safety
4. Maintain the DOS-style visual theme
5. Ensure keyboard navigation compatibility

## License

MIT