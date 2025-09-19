import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceTemplate, Customer, Article } from '../types';
import { InvoiceService } from '../services/InvoiceService';
import { ApiDataService } from '../services/ApiDataService';

const invoiceService = new InvoiceService();
const apiService = new ApiDataService();

export const InvoiceManager: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'templates'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesData, templatesData, customersData, articlesData] = await Promise.all([
        invoiceService.getInvoices(),
        invoiceService.getTemplates(),
        apiService.getCustomers(),
        apiService.getArticles()
      ]);

      setInvoices(invoicesData);
      setTemplates(templatesData);
      setCustomers(customersData);
      setArticles(articlesData);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Daten: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setCurrentView('create');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCurrentView('edit');
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Rechnung wirklich löschen?')) return;

    try {
      await invoiceService.deleteInvoice(id);
      await loadData();
    } catch (err) {
      setError('Fehler beim Löschen: ' + (err as Error).message);
    }
  };

  const handleExportPDF = async (invoice: Invoice) => {
    try {
      const filename = `Rechnung-${invoice.invoiceNumber}.pdf`;
      await invoiceService.downloadInvoicePDF(invoice.id, filename);
    } catch (err) {
      setError('Fehler beim PDF-Export: ' + (err as Error).message);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getStatusColor = (status: Invoice['status']): string => {
    switch (status) {
      case 'draft': return '#666';
      case 'sent': return '#0066cc';
      case 'paid': return '#00aa00';
      case 'overdue': return '#cc0000';
      case 'cancelled': return '#999';
      default: return '#666';
    }
  };

  const getStatusText = (status: Invoice['status']): string => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'sent': return 'Versendet';
      case 'paid': return 'Bezahlt';
      case 'overdue': return 'Überfällig';
      case 'cancelled': return 'Storniert';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="invoice-manager">
        <div className="loading">
          <div className="loading-text">Lade Rechnungen...</div>
        </div>
      </div>
    );
  }

  if (currentView === 'create' || currentView === 'edit') {
    return (
      <InvoiceForm
        invoice={selectedInvoice}
        customers={customers}
        articles={articles}
        templates={templates}
        onSave={async () => {
          await loadData();
          setCurrentView('list');
        }}
        onCancel={() => setCurrentView('list')}
      />
    );
  }

  if (currentView === 'templates') {
    return (
      <TemplateManager
        templates={templates}
        onBack={() => setCurrentView('list')}
        onTemplatesChange={loadData}
      />
    );
  }

  return (
    <div className="invoice-manager">
      {/* Header */}
      <div className="screen-header">
        <h1>Rechnungen</h1>
        <div className="header-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleCreateInvoice}
            disabled={customers.length === 0}
            title={customers.length === 0 ? "Keine Kunden vorhanden" : "Neue Rechnung erstellen"}
          >
            F2 - Neue Rechnung
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentView('templates')}
          >
            F3 - Vorlagen
          </button>
          <button 
            className="btn btn-secondary"
            onClick={loadData}
          >
            F5 - Aktualisieren
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Invoice List */}
      <div className="invoice-list">
        {invoices.length === 0 ? (
          <div className="empty-state">
            <h3>Keine Rechnungen vorhanden</h3>
            <p>Erstellen Sie eine neue Rechnung mit F2</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rechnungsnr.</th>
                <th>Kunde</th>
                <th>Datum</th>
                <th>Fällig</th>
                <th>Betrag</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-number">{invoice.invoiceNumber}</td>
                  <td>{invoice.customer?.company || 'Unbekannt'}</td>
                  <td>{formatDate(invoice.date)}</td>
                  <td>{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</td>
                  <td className="amount">{formatCurrency(invoice.totalAmount)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(invoice.status) }}
                    >
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-small"
                      onClick={() => handleEditInvoice(invoice)}
                      title="Bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-small"
                      onClick={() => handleExportPDF(invoice)}
                      title="PDF exportieren"
                    >
                      📄
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="invoice-stats">
        <div className="stat">
          <span className="stat-label">Gesamt:</span>
          <span className="stat-value">{invoices.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Offen:</span>
          <span className="stat-value">
            {invoices.filter(i => i.status === 'sent').length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Bezahlt:</span>
          <span className="stat-value">
            {invoices.filter(i => i.status === 'paid').length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Überfällig:</span>
          <span className="stat-value">
            {invoices.filter(i => i.status === 'overdue').length}
          </span>
        </div>
      </div>
    </div>
  );
};

// Placeholder components - these would be implemented separately
const InvoiceForm: React.FC<{
  invoice: Invoice | null;
  customers: Customer[];
  articles: Article[];
  templates: InvoiceTemplate[];
  onSave: () => Promise<void>;
  onCancel: () => void;
}> = ({ onCancel }) => {
  return (
    <div className="invoice-form">
      <h2>Rechnung bearbeiten</h2>
      <p>Formular wird implementiert...</p>
      <button className="btn btn-secondary" onClick={onCancel}>
        Zurück
      </button>
    </div>
  );
};

const TemplateManager: React.FC<{
  templates: InvoiceTemplate[];
  onBack: () => void;
  onTemplatesChange: () => Promise<void>;
}> = ({ templates, onBack }) => {
  return (
    <div className="template-manager">
      <h2>Rechnungsvorlagen</h2>
      <div className="template-list">
        {templates.map(template => (
          <div key={template.id} className="template-item">
            <h4>{template.name}</h4>
            <p>{template.description}</p>
            <span className="template-type">{template.templateType}</span>
            {template.isDefault && <span className="default-badge">Standard</span>}
          </div>
        ))}
      </div>
      <button className="btn btn-secondary" onClick={onBack}>
        Zurück
      </button>
    </div>
  );
};