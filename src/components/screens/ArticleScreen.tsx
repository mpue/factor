import React, { useState, useEffect } from 'react';
import { Article } from '../../types/index';
import { useWarenwirtschaft } from '../../contexts/WarenwirtschaftContext';

interface ArticleScreenProps {
  onStatusChange: (message: string) => void;
}

const ArticleScreen: React.FC<ArticleScreenProps> = ({ onStatusChange }) => {
  const { state, dispatch, dataService } = useWarenwirtschaft();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({
    id: '',
    name: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
  });

  useEffect(() => {
    onStatusChange('Artikel-Bereich aktiv');
  }, [onStatusChange]);

  const handleShowForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      id: '',
      name: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
    });
  };

  const handleEditSelected = () => {
    if (!state.selectedRow) {
      alert('Bitte wählen Sie einen Artikel aus!');
      return;
    }

    const article = state.articles.find(a => a.id === state.selectedRow);
    if (article) {
      setEditingId(article.id);
      setFormData(article);
      setShowForm(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (!state.selectedRow) {
      alert('Bitte wählen Sie einen Artikel aus!');
      return;
    }

    if (confirm('Artikel wirklich löschen?')) {
      dispatch({ type: 'DELETE_ARTICLE', payload: state.selectedRow });
      await dataService.deleteArticle(state.selectedRow);
      onStatusChange('Artikel gelöscht');
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name || !formData.price) {
      alert('Bitte füllen Sie alle Pflichtfelder aus!');
      return;
    }

    const article: Article = {
      id: formData.id,
      name: formData.name,
      price: formData.price || 0,
      cost: formData.cost || 0,
      stock: formData.stock || 0,
      minStock: formData.minStock || 0,
    };

    if (editingId) {
      dispatch({ type: 'UPDATE_ARTICLE', payload: article });
      await dataService.saveArticle(article);
    } else {
      if (state.articles.find(a => a.id === article.id)) {
        alert('Artikel-Nr. bereits vorhanden!');
        return;
      }
      dispatch({ type: 'ADD_ARTICLE', payload: article });
      await dataService.saveArticle(article);
    }

    setShowForm(false);
    onStatusChange('Artikel gespeichert');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleRowClick = (articleId: string) => {
    dispatch({ type: 'SELECT_ROW', payload: articleId });
  };

  return (
    <div>
      <h2>═══ ARTIKELVERWALTUNG ═══</h2>
      <div style={{ margin: '20px 0' }}>
        <button className="button" onClick={handleShowForm}>F6-Neu anlegen</button>
        <button className="button" onClick={handleEditSelected}>F7-Bearbeiten</button>
        <button className="button" onClick={handleDeleteSelected}>F8-Löschen</button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '20px', border: '1px solid #00ff00', padding: '10px' }}>
          <h3>Artikel bearbeiten:</h3>
          <div className="form-row">
            <span className="form-label">Artikel-Nr:</span>
            <input
              type="text"
              className="form-input"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="z.B. ART001"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Bezeichnung:</span>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Artikelbezeichnung"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Verkaufspreis €:</span>
            <input
              type="number"
              className="form-input"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Einkaufspreis €:</span>
            <input
              type="number"
              className="form-input"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Lagerbestand:</span>
            <input
              type="number"
              className="form-input"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="form-row">
            <span className="form-label">Mindestbestand:</span>
            <input
              type="number"
              className="form-input"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              placeholder="0"
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
            <th>Art.-Nr.</th>
            <th>Bezeichnung</th>
            <th>VK-Preis</th>
            <th>EK-Preis</th>
            <th>Bestand</th>
            <th>Min-Best.</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {state.articles.map((article) => (
            <tr
              key={article.id}
              className={state.selectedRow === article.id ? 'highlight' : ''}
              onClick={() => handleRowClick(article.id)}
            >
              <td>{article.id}</td>
              <td>{article.name}</td>
              <td>{article.price.toFixed(2)} €</td>
              <td>{article.cost.toFixed(2)} €</td>
              <td>{article.stock}</td>
              <td>{article.minStock}</td>
              <td>
                {article.stock <= article.minStock ? (
                  <span className="highlight">NIEDRIG</span>
                ) : (
                  'OK'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArticleScreen;