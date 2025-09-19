import { Article } from '../types/index.js';
import { DataService } from '../services/DataService.js';
import { UIService } from '../services/UIService.js';

export class ArticleManager {
  private dataService: DataService;
  private uiService: UIService;
  private currentEditingId: string | null = null;

  constructor(dataService: DataService, uiService: UIService) {
    this.dataService = dataService;
    this.uiService = uiService;
  }

  showForm(): void {
    this.uiService.showForm('article-form');
    this.currentEditingId = null;
    this.clearForm();
    this.uiService.focusElement('article-id');
  }

  clearForm(): void {
    const inputIds = ['article-id', 'article-name', 'article-price', 'article-cost', 'article-stock', 'article-min-stock'];
    this.uiService.clearFormInputs(inputIds);
  }

  cancelForm(): void {
    this.uiService.hideForm('article-form');
    this.currentEditingId = null;
  }

  save(): void {
    const id = this.uiService.getInputValue('article-id');
    const name = this.uiService.getInputValue('article-name');
    const price = parseFloat(this.uiService.getInputValue('article-price'));
    const cost = parseFloat(this.uiService.getInputValue('article-cost'));
    const stock = parseInt(this.uiService.getInputValue('article-stock'));
    const minStock = parseInt(this.uiService.getInputValue('article-min-stock'));

    if (!id || !name || isNaN(price)) {
      alert('Bitte füllen Sie alle Pflichtfelder aus!');
      return;
    }

    const article: Article = { id, name, price, cost, stock, minStock };
    const articles = this.dataService.getArticles();

    if (this.currentEditingId) {
      const index = articles.findIndex(a => a.id === this.currentEditingId);
      if (index !== -1) {
        articles[index] = article;
      }
    } else {
      if (articles.find(a => a.id === id)) {
        alert('Artikel-Nr. bereits vorhanden!');
        return;
      }
      articles.push(article);
    }

    this.dataService.saveArticles(articles);
    this.refreshTable();
    this.cancelForm();
    this.uiService.updateStatus('Artikel gespeichert');
  }

  editSelected(): void {
    const selectedRow = this.uiService.getSelectedRow();
    if (!selectedRow) {
      alert('Bitte wählen Sie einen Artikel aus!');
      return;
    }

    const id = selectedRow.cells[0].textContent;
    if (!id) return;

    const articles = this.dataService.getArticles();
    const article = articles.find(a => a.id === id);

    if (article) {
      this.currentEditingId = id;
      this.uiService.setInputValue('article-id', article.id);
      this.uiService.setInputValue('article-name', article.name);
      this.uiService.setInputValue('article-price', article.price.toString());
      this.uiService.setInputValue('article-cost', article.cost.toString());
      this.uiService.setInputValue('article-stock', article.stock.toString());
      this.uiService.setInputValue('article-min-stock', article.minStock.toString());
      this.uiService.showForm('article-form');
    }
  }

  deleteSelected(): void {
    const selectedRow = this.uiService.getSelectedRow();
    if (!selectedRow) {
      alert('Bitte wählen Sie einen Artikel aus!');
      return;
    }

    if (confirm('Artikel wirklich löschen?')) {
      const id = selectedRow.cells[0].textContent;
      if (id) {
        const articles = this.dataService.getArticles().filter(a => a.id !== id);
        this.dataService.saveArticles(articles);
        this.refreshTable();
        this.uiService.updateStatus('Artikel gelöscht');
      }
    }
  }

  refreshTable(): void {
    const tbody = document.getElementById('articles-tbody') as HTMLTableSectionElement;
    if (!tbody) return;

    tbody.innerHTML = '';
    const articles = this.dataService.getArticles();

    articles.forEach(article => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${article.id}</td>
        <td>${article.name}</td>
        <td>${article.price.toFixed(2)} €</td>
        <td>${article.cost.toFixed(2)} €</td>
        <td>${article.stock}</td>
        <td>${article.minStock}</td>
        <td>${article.stock <= article.minStock ? '<span class="highlight">NIEDRIG</span>' : 'OK'}</td>
      `;

      row.addEventListener('click', () => {
        this.uiService.selectRow(row);
      });
    });
  }

  refreshSelect(): void {
    const selects = [
      document.getElementById('position-article'),
      document.getElementById('stock-article')
    ];

    selects.forEach(select => {
      if (select) {
        select.innerHTML = '<option value="">Artikel auswählen...</option>';
        const articles = this.dataService.getArticles();

        articles.forEach(article => {
          const option = document.createElement('option');
          option.value = article.id;
          option.textContent = `${article.id} - ${article.name}`;
          select.appendChild(option);
        });
      }
    });
  }
}