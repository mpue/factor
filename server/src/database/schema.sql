-- Create tables for Factor Warenwirtschaftssystem
-- SQLite schema with proper normalization and constraints

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    contact TEXT NOT NULL DEFAULT '',
    street TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- Invoice positions/line items
CREATE TABLE IF NOT EXISTS invoice_positions (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INTEGER NOT NULL,
    reference_type TEXT, -- 'invoice', 'adjustment', 'initial'
    reference_id TEXT,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_name ON articles(name);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoice_positions_invoice ON invoice_positions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_positions_article ON invoice_positions(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_article ON stock_movements(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);

-- Triggers to update updated_at timestamps
CREATE TRIGGER IF NOT EXISTS articles_updated_at 
    AFTER UPDATE ON articles
BEGIN
    UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS customers_updated_at 
    AFTER UPDATE ON customers
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS invoices_updated_at 
    AFTER UPDATE ON invoices
BEGIN
    UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Insert sample data
INSERT OR IGNORE INTO articles (id, name, price, cost, stock, min_stock) VALUES
('ART001', 'Bürostuhl Standard', 89.99, 45.00, 15, 5),
('ART002', 'Schreibtisch 120x80', 199.99, 120.00, 8, 2),
('ART003', 'Monitor 24 Zoll', 249.99, 180.00, 12, 3),
('ART004', 'Tastatur mechanisch', 79.99, 35.00, 25, 10),
('ART005', 'Maus optisch', 29.99, 12.00, 30, 15);

INSERT OR IGNORE INTO customers (id, company, contact, street, city, phone, email) VALUES
('K001', 'Musterfirma GmbH', 'Max Mustermann', 'Musterstraße 1', '12345 Musterstadt', '0123-456789', 'max@musterfirma.de'),
('K002', 'Beispiel AG', 'Erika Beispiel', 'Beispielweg 15', '54321 Beispielstadt', '0987-654321', 'erika@beispiel.ag'),
('K003', 'Demo Handels GmbH', 'Peter Demo', 'Demostraße 42', '99999 Demostadt', '0555-123456', 'peter@demo-handel.de');