import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/index';
import { useWarenwirtschaft } from '../../contexts/WarenwirtschaftContext';

interface CustomerScreenProps {
  onStatusChange: (message: string) => void;
}

const CustomerScreen: React.FC<CustomerScreenProps> = ({ onStatusChange }) => {
  const { state, dispatch, dataService } = useWarenwirtschaft();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    id: '',
    company: '',
    contact: '',
    street: '',
    city: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    onStatusChange('Kunden-Bereich aktiv');
  }, [onStatusChange]);

  const handleShowForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      id: '',
      company: '',
      contact: '',
      street: '',
      city: '',
      phone: '',
      email: '',
    });
  };

  const handleEditSelected = () => {
    if (!state.selectedRow) {
      alert('Bitte wählen Sie einen Kunden aus!');
      return;
    }

    const customer = state.customers.find(c => c.id === state.selectedRow);
    if (customer) {
      setEditingId(customer.id);
      setFormData(customer);
      setShowForm(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (!state.selectedRow) {
      alert('Bitte wählen Sie einen Kunden aus!');
      return;
    }

    if (confirm('Kunde wirklich löschen?')) {
      dispatch({ type: 'DELETE_CUSTOMER', payload: state.selectedRow });
      await dataService.deleteCustomer(state.selectedRow);
      onStatusChange('Kunde gelöscht');
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.company) {
      alert('Bitte füllen Sie alle Pflichtfelder aus!');
      return;
    }

    const customer: Customer = {
      id: formData.id || '',
      company: formData.company || '',
      contact: formData.contact || '',
      street: formData.street || '',
      city: formData.city || '',
      phone: formData.phone || '',
      email: formData.email || '',
    };

    if (editingId) {
      dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
      await dataService.saveCustomer(customer);
    } else {
      if (state.customers.find(c => c.id === customer.id)) {
        alert('Kunden-Nr. bereits vorhanden!');
        return;
      }
      dispatch({ type: 'ADD_CUSTOMER', payload: customer });
      await dataService.saveCustomer(customer);
    }

    setShowForm(false);
    onStatusChange('Kunde gespeichert');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleRowClick = (customerId: string) => {
    dispatch({ type: 'SELECT_ROW', payload: customerId });
  };

  return (
    <div>
      <h2>═══ KUNDENVERWALTUNG ═══</h2>
      <div style={{ margin: '20px 0' }}>
        <button className="button" onClick={handleShowForm}>F6-Neu anlegen</button>
        <button className="button" onClick={handleEditSelected}>F7-Bearbeiten</button>
        <button className="button" onClick={handleDeleteSelected}>F8-Löschen</button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '20px', border: '1px solid #00ff00', padding: '10px' }}>
          <h3>Kunde bearbeiten:</h3>
          <div className="form-row">
            <span className="form-label">Kunden-Nr:</span>
            <input
              type="text"
              className="form-input"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="z.B. K001"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Firmenname:</span>
            <input
              type="text"
              className="form-input"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Firmenname"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Ansprechpartner:</span>
            <input
              type="text"
              className="form-input"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Name des Ansprechpartners"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Straße:</span>
            <input
              type="text"
              className="form-input"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Straße und Hausnummer"
            />
          </div>
          <div className="form-row">
            <span className="form-label">PLZ/Ort:</span>
            <input
              type="text"
              className="form-input"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="PLZ Ort"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Telefon:</span>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Telefonnummer"
            />
          </div>
          <div className="form-row">
            <span className="form-label">E-Mail:</span>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@beispiel.de"
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <button className="button" onClick={handleSave}>F9-Speichern</button>
            <button className="button" onClick={handleCancel}>ESC-Abbrechen</button>
          </div>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Kd.-Nr.</th>
            <th>Firmenname</th>
            <th>Ansprechpartner</th>
            <th>Ort</th>
            <th>Telefon</th>
            <th>E-Mail</th>
          </tr>
        </thead>
        <tbody>
          {state.customers.map((customer) => (
            <tr
              key={customer.id}
              className={state.selectedRow === customer.id ? 'highlight' : ''}
              onClick={() => handleRowClick(customer.id)}
            >
              <td>{customer.id}</td>
              <td>{customer.company}</td>
              <td>{customer.contact}</td>
              <td>{customer.city}</td>
              <td>{customer.phone}</td>
              <td>{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerScreen;