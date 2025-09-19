# Factor Warenwirtschaftssystem - Multi-Client Deployment Guide

## Current Architecture: Client-Server with Shared Database
The application now uses a Node.js backend with SQLite database for true multi-client support. All clients share the same data in real-time.

## Deployment Options

### 1. Complete Multi-Client Setup (Recommended)

**Prerequisites:**
- Node.js 16+ installed on server
- Network access between server and clients
- Modern browsers on client machines

**Server Setup:**
```bash
# 1. Copy the project to your server
git clone <your-repo> /path/to/factor
cd /path/to/factor

# 2. Install dependencies for both frontend and backend
npm install
cd server
npm install
cd ..

# 3. Build the frontend
npm run build

# 4. Start the backend server (production)
cd server
npm run build
npm start

# Or for development with auto-restart
npm run dev
```

**Client Access:** 
- All clients open `http://your-server-ip:3001/` in their browser
- Data is shared in real-time between all clients
- Perfect for multiple users working on the same inventory

### 2. Network File Sharing (Limited Synchronization)

Since IndexedDB is browser-local, true data sharing requires a server component. However, you can implement data export/import:

**Add to BrowserDataService.ts:**
```typescript
// Export all data to JSON
async exportData(): Promise<string> {
  const articles = await this.getArticles();
  const customers = await this.getCustomers();
  
  return JSON.stringify({
    articles,
    customers,
    exportDate: new Date().toISOString()
  }, null, 2);
}

// Import data from JSON
async importData(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  
  // Clear existing data
  // Import new data
  for (const article of data.articles || []) {
    await this.saveArticle(article);
  }
  for (const customer of data.customers || []) {
    await this.saveCustomer(customer);
  }
}
```

### 3. Full Multi-Client Solution (Requires Backend)

For true multi-client with shared data, you would need:

**Backend API Server:**
- Node.js + Express + SQLite/PostgreSQL
- REST API endpoints for CRUD operations
- Real-time updates with WebSockets

**Modified Frontend:**
- Replace IndexedDB calls with HTTP API calls
- Add user authentication
- Handle offline scenarios

## Quick Multi-Client Setup (Current Version)

### Option A: One-Click Startup (Windows)
```batch
# Run the startup script
start-production.bat
```

### Option B: One-Click Startup (Linux/Mac)
```bash
# Make script executable
chmod +x start-production.sh

# Run the startup script
./start-production.sh
```

### Option C: Manual Setup

**Step 1: Install Dependencies**
```bash
cd d:\devel\factor
npm install
cd server
npm install
cd ..
```

**Step 2: Build Applications**
```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build
cd ..
```

**Step 3: Start Services**
```bash
# Terminal 1: Start backend server
cd server
npm start

# Terminal 2: Start frontend server
npm run preview
```

**Step 4: Client Access**
- Open `http://localhost:3001` in any browser
- Multiple users can access simultaneously
- All changes are shared in real-time
- Data persists in SQLite database on server

## Network Requirements

- **Bandwidth:** Minimal (static files only)
- **Ports:** HTTP (80) or HTTPS (443)
- **Browser:** Modern browser with IndexedDB support
- **Internet:** Not required after initial load (works offline)

## Data Management Strategies

### Independent Operation
- Each client maintains separate data
- Good for: Branch offices, departments, testing

### Periodic Synchronization
- Implement export/import functionality
- Manual data synchronization via file sharing
- Good for: Small teams, occasional sync needs

### Real-Time Synchronization
- Requires backend server development
- Automatic data sync across all clients
- Good for: Large teams, real-time collaboration

## Security Considerations

- **HTTPS:** Use HTTPS for production deployments
- **Authentication:** Current version has no authentication
- **Data Protection:** IndexedDB data stays in browser storage
- **Backup:** Implement regular data export for backups

## Scaling Recommendations

**Small Team (2-5 users):** Current setup with periodic data export/import
**Medium Team (5-20 users):** Add backend API for shared database
**Large Team (20+ users):** Full server solution with authentication and real-time sync

## Example Production Deployment

```bash
# On your web server
mkdir /var/www/html/factor
cd /path/to/your/factor/project
npm run build
cp -r dist/* /var/www/html/factor/

# Configure Apache virtual host
<VirtualHost *:80>
    ServerName factor.yourcompany.com
    DocumentRoot /var/www/html/factor
    
    <Directory /var/www/html/factor>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Then clients access via `http://factor.yourcompany.com`