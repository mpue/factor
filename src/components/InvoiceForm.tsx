import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceTemplate, Customer, Article } from '../types';
import { InvoiceService } from '../services/InvoiceService';

interface InvoiceFormProps {
  invoice: Invoice | null;
  customers: Customer[];
  articles: Article[];
  templates: InvoiceTemplate[];
  onSave: () => Promise<void>;
  onCancel: () => void;
}

interface InvoiceFormData {
  customerId: string;
  templateId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: Invoice['status'];
  notes: string;
  paymentTerms: string;
  positions: InvoicePositionFormData[];
}

interface InvoicePositionFormData {
  articleId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  articleName?: string;
}

const invoiceService = new InvoiceService();

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  customers,
  articles,
  templates,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: '',
    templateId: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    notes: '',
    paymentTerms: 'Zahlbar innerhalb 14 Tagen',
    positions: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
    discountAmount: 0
  });

  const TAX_RATE = 0.19; // 19% MwSt

  useEffect(() => {
    initializeForm();
  }, [invoice]);

  useEffect(() => {
    calculateTotals();
  }, [formData.positions]);

  const initializeForm = async () => {
    if (invoice) {
      // Edit mode - load complete invoice data with positions from server
      try {
        const fullInvoice = await invoiceService.getInvoice(invoice.id);
        if (fullInvoice) {
          setFormData({
            customerId: fullInvoice.customerId,
            templateId: fullInvoice.templateId || '',
            invoiceNumber: fullInvoice.invoiceNumber,
            date: fullInvoice.date,
            dueDate: fullInvoice.dueDate || '',
            status: fullInvoice.status,
            notes: fullInvoice.notes || '',
            paymentTerms: fullInvoice.paymentTerms,
            positions: fullInvoice.positions?.map(pos => ({
              articleId: pos.articleId,
              quantity: pos.quantity,
              unitPrice: pos.unitPrice,
              totalPrice: pos.totalPrice,
              articleName: pos.articleName
            })) || []
          });
        } else {
          // Fallback to the passed invoice data if server request fails
          setFormData({
            customerId: invoice.customerId,
            templateId: invoice.templateId || '',
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.date,
            dueDate: invoice.dueDate || '',
            status: invoice.status,
            notes: invoice.notes || '',
            paymentTerms: invoice.paymentTerms,
            positions: invoice.positions?.map(pos => ({
              articleId: pos.articleId,
              quantity: pos.quantity,
              unitPrice: pos.unitPrice,
              totalPrice: pos.totalPrice,
              articleName: pos.articleName
            })) || []
          });
        }
      } catch (err) {
        console.error('Error loading complete invoice data:', err);
        // Fallback to the passed invoice data
        setFormData({
          customerId: invoice.customerId,
          templateId: invoice.templateId || '',
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          dueDate: invoice.dueDate || '',
          status: invoice.status,
          notes: invoice.notes || '',
          paymentTerms: invoice.paymentTerms,
          positions: invoice.positions?.map(pos => ({
            articleId: pos.articleId,
            quantity: pos.quantity,
            unitPrice: pos.unitPrice,
            totalPrice: pos.totalPrice,
            articleName: pos.articleName
          })) || []
        });
      }
    } else {
      // Create mode - generate new invoice number and set default template
      try {
        const invoiceNumber = await invoiceService.generateInvoiceNumber();
        const defaultTemplate = await invoiceService.getDefaultTemplate('invoice');
        
        setFormData(prev => ({
          ...prev,
          invoiceNumber,
          templateId: defaultTemplate?.id || ''
        }));
      } catch (err) {
        console.error('Error initializing form:', err);
      }
    }
  };

  const calculateTotals = () => {
    const netAmount = formData.positions.reduce((sum, pos) => sum + pos.totalPrice, 0);
    const discountAmount = 0; // Can be implemented later
    const netAfterDiscount = netAmount - discountAmount;
    const taxAmount = netAfterDiscount * TAX_RATE;
    const totalAmount = netAfterDiscount + taxAmount;

    setTotals({
      netAmount,
      taxAmount,
      totalAmount,
      discountAmount
    });
  };

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPosition = () => {
    const newPosition: InvoicePositionFormData = {
      articleId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };

    setFormData(prev => ({
      ...prev,
      positions: [...prev.positions, newPosition]
    }));
  };

  const removePosition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index)
    }));
  };

  const updatePosition = (index: number, field: keyof InvoicePositionFormData, value: any) => {
    setFormData(prev => {
      const newPositions = [...prev.positions];
      const position = { ...newPositions[index] };
      
      if (field === 'articleId') {
        const article = articles.find(a => a.id === value);
        if (article) {
          position.articleId = value;
          position.articleName = article.name;
          position.unitPrice = article.price;
          position.totalPrice = position.quantity * article.price;
        }
      } else if (field === 'quantity' || field === 'unitPrice') {
        position[field] = value;
        position.totalPrice = position.quantity * position.unitPrice;
      } else {
        (position as any)[field] = value;
      }
      
      newPositions[index] = position;
      
      return {
        ...prev,
        positions: newPositions
      };
    });
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.customerId) errors.push('Kunde muss ausgewählt werden');
    if (!formData.invoiceNumber) errors.push('Rechnungsnummer ist erforderlich');
    if (!formData.date) errors.push('Rechnungsdatum ist erforderlich');
    if (!formData.paymentTerms) errors.push('Zahlungsbedingungen sind erforderlich');
    if (formData.positions.length === 0) errors.push('Mindestens eine Position ist erforderlich');
    
    formData.positions.forEach((pos, index) => {
      if (!pos.articleId) errors.push(`Position ${index + 1}: Artikel muss ausgewählt werden`);
      if (pos.quantity <= 0) errors.push(`Position ${index + 1}: Menge muss größer als 0 sein`);
      if (pos.unitPrice < 0) errors.push(`Position ${index + 1}: Preis darf nicht negativ sein`);
    });

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (invoice) {
        // Update existing invoice
        const updateData = {
          customerId: formData.customerId,
          templateId: formData.templateId,
          date: formData.date,
          dueDate: formData.dueDate || undefined,
          status: formData.status,
          notes: formData.notes,
          paymentTerms: formData.paymentTerms,
          totalAmount: totals.totalAmount,
          taxAmount: totals.taxAmount,
          discountAmount: totals.discountAmount,
          netAmount: totals.netAmount
        };
        await invoiceService.updateInvoice(invoice.id, updateData);
      } else {
        // Create new invoice
        const createData = {
          customerId: formData.customerId,
          templateId: formData.templateId,
          invoiceNumber: formData.invoiceNumber,
          date: formData.date,
          dueDate: formData.dueDate || undefined,
          status: formData.status,
          notes: formData.notes,
          paymentTerms: formData.paymentTerms,
          totalAmount: totals.totalAmount,
          taxAmount: totals.taxAmount,
          discountAmount: totals.discountAmount,
          netAmount: totals.netAmount,
          positions: formData.positions.map(pos => ({
            articleId: pos.articleId,
            quantity: pos.quantity,
            unitPrice: pos.unitPrice,
            totalPrice: pos.totalPrice,
            articleName: pos.articleName
          }))
        };
        await invoiceService.createInvoice(createData as any);
      }

      await onSave();
    } catch (err) {
      setError('Fehler beim Speichern: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!invoice) return;
    
    setLoading(true);
    try {
      const filename = `Rechnung-${invoice.invoiceNumber}.pdf`;
      await invoiceService.downloadInvoicePDF(invoice.id, filename);
    } catch (err) {
      setError('Fehler beim PDF-Export: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!invoice) return;
    
    setLoading(true);
    try {
      const pdfBlob = await invoiceService.exportInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (err) {
      setError('Fehler beim PDF-Vorschau: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="invoice-form">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {invoice ? '✏️ Rechnung bearbeiten' : '➕ Neue Rechnung erstellen'}
          </h2>
          <p className="card-subtitle">
            {invoice ? `Rechnung ${invoice.invoiceNumber}` : 'Erfassen Sie alle Rechnungsdetails'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Basic Invoice Information */}
          <div className="form-section">
            <h3 className="section-title">Rechnungsinformationen</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rechnungsnummer *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  disabled={!!invoice} // Don't allow editing invoice number in edit mode
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as Invoice['status'])}
                >
                  <option value="draft">Entwurf</option>
                  <option value="sent">Versendet</option>
                  <option value="paid">Bezahlt</option>
                  <option value="overdue">Überfällig</option>
                  <option value="cancelled">Storniert</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rechnungsdatum *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fälligkeitsdatum</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kunde *</label>
                <select
                  className="form-select"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                >
                  <option value="">Kunde auswählen...</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company} ({customer.contact})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Vorlage</label>
                <select
                  className="form-select"
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                >
                  <option value="">Keine Vorlage</option>
                  {templates.filter(t => t.templateType === 'invoice').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} {template.isDefault ? '(Standard)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Zahlungsbedingungen *</label>
              <input
                type="text"
                className="form-input"
                value={formData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                placeholder="z.B. Zahlbar innerhalb 14 Tagen"
              />
            </div>
          </div>

          {/* Invoice Positions */}
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Rechnungspositionen</h3>
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={addPosition}
              >
                ➕ Position hinzufügen
              </button>
            </div>

            {formData.positions.length === 0 ? (
              <div className="empty-state">
                <p>Keine Positionen vorhanden. Fügen Sie eine Position hinzu.</p>
              </div>
            ) : (
              <div className="positions-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Artikel</th>
                      <th>Menge</th>
                      <th>Einzelpreis</th>
                      <th>Gesamtpreis</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.positions.map((position, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-select"
                            value={position.articleId}
                            onChange={(e) => updatePosition(index, 'articleId', e.target.value)}
                          >
                            <option value="">Artikel auswählen...</option>
                            {articles.map(article => (
                              <option key={article.id} value={article.id}>
                                {article.name} ({formatCurrency(article.price)})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            min="0.01"
                            step="0.01"
                            value={position.quantity}
                            onChange={(e) => updatePosition(index, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            step="0.01"
                            value={position.unitPrice}
                            onChange={(e) => updatePosition(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="text-right font-bold">
                          {formatCurrency(position.totalPrice)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            onClick={() => removePosition(index)}
                            title="Position entfernen"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="form-section">
            <h3 className="section-title">Rechnungssumme</h3>
            <div className="totals-container">
              <div className="totals-row">
                <span>Nettobetrag:</span>
                <span className="font-bold">{formatCurrency(totals.netAmount)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="totals-row">
                  <span>Rabatt:</span>
                  <span className="font-bold text-warning">-{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="totals-row">
                <span>MwSt. ({(TAX_RATE * 100).toFixed(0)}%):</span>
                <span className="font-bold">{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="totals-row totals-final">
                <span>Gesamtbetrag:</span>
                <span className="font-bold text-primary">{formatCurrency(totals.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Anmerkungen</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Zusätzliche Anmerkungen zur Rechnung..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              name="cancel"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Abbrechen
            </button>
            
            {invoice && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePreviewPDF}
                  disabled={loading}
                >
                  👁️ PDF Vorschau
                </button>
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={handleExportPDF}
                  disabled={loading}
                >
                  📄 PDF Export
                </button>
              </>
            )}
            
            <button
              type="submit"
              className="btn btn-primary"
              name="update"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  {invoice ? 'Aktualisieren...' : 'Erstellen...'}
                </>
              ) : (
                <>
                  {invoice ? '💾 Aktualisieren' : '💾 Erstellen'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};