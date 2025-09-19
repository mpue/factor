import { Screen } from './types/index.js';
import { DataService } from './services/DataService.js';
import { UIService } from './services/UIService.js';
import { ArticleManager } from './managers/ArticleManager.js';
import { CustomerManager } from './managers/CustomerManager.js';

export class WarenwirtschaftApp {
  private dataService: DataService;
  private uiService: UIService;
  private articleManager: ArticleManager;
  private customerManager: CustomerManager;

  constructor() {
    this.dataService = new DataService();
    this.uiService = new UIService();
    this.articleManager = new ArticleManager(this.dataService, this.uiService);
    this.customerManager = new CustomerManager(this.dataService, this.uiService);
  }

  init(): void {
    this.dataService.initializeSampleData();
    this.uiService.showScreen('main');
    this.uiService.updateTime();
    setInterval(() => this.uiService.updateTime(), 1000);

    this.setupEventListeners();
    this.refreshAllTables();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    this.setupGlobalFunctions();
  }

  private setupGlobalFunctions(): void {
    // Make functions globally available for onclick handlers
    (window as any).showScreen = (screenName: Screen) => this.uiService.showScreen(screenName);
    
    // Article functions
    (window as any).showArticleForm = () => this.articleManager.showForm();
    (window as any).editSelectedArticle = () => this.articleManager.editSelected();
    (window as any).deleteSelectedArticle = () => this.articleManager.deleteSelected();
    (window as any).saveArticle = () => this.articleManager.save();
    (window as any).cancelArticleForm = () => this.articleManager.cancelForm();
    
    // Customer functions
    (window as any).showCustomerForm = () => this.customerManager.showForm();
    (window as any).editSelectedCustomer = () => this.customerManager.editSelected();
    (window as any).deleteSelectedCustomer = () => this.customerManager.deleteSelected();
    (window as any).saveCustomer = () => this.customerManager.save();
    (window as any).cancelCustomerForm = () => this.customerManager.cancelForm();

    // Placeholder functions for other modules
    (window as any).showInvoiceForm = () => alert('Rechnungsmodul wird implementiert...');
    (window as any).printSelectedInvoice = () => alert('Druckfunktion wird implementiert...');
    (window as any).deleteSelectedInvoice = () => alert('Löschfunktion wird implementiert...');
    (window as any).showStockForm = (mode: string) => alert(`Lagermodul (${mode}) wird implementiert...`);
    (window as any).showInventory = () => alert('Inventur wird implementiert...');
    (window as any).generateSalesReport = () => alert('Umsatzbericht wird implementiert...');
    (window as any).generateStockReport = () => alert('Lagerbericht wird implementiert...');
    (window as any).generateCustomerReport = () => alert('Kundenbericht wird implementiert...');
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const key = event.code;

    switch (key) {
      case 'F1':
        event.preventDefault();
        this.uiService.showScreen('artikel');
        break;
      case 'F2':
        event.preventDefault();
        this.uiService.showScreen('kunden');
        break;
      case 'F3':
        event.preventDefault();
        this.uiService.showScreen('rechnungen');
        break;
      case 'F4':
        event.preventDefault();
        this.uiService.showScreen('lager');
        break;
      case 'F5':
        event.preventDefault();
        this.uiService.showScreen('berichte');
        break;
      case 'Escape':
        event.preventDefault();
        if (this.uiService.getCurrentScreen() !== 'main') {
          this.uiService.showScreen('main');
        }
        break;
      case 'F6':
        event.preventDefault();
        this.handleF6();
        break;
      case 'F7':
        event.preventDefault();
        this.handleF7();
        break;
      case 'F8':
        event.preventDefault();
        this.handleF8();
        break;
      case 'F9':
        event.preventDefault();
        this.handleF9();
        break;
    }
  }

  private handleF6(): void {
    const currentScreen = this.uiService.getCurrentScreen();
    switch (currentScreen) {
      case 'artikel':
        this.articleManager.showForm();
        break;
      case 'kunden':
        this.customerManager.showForm();
        break;
      default:
        alert(`F6-Funktion für ${currentScreen} wird implementiert...`);
    }
  }

  private handleF7(): void {
    const currentScreen = this.uiService.getCurrentScreen();
    switch (currentScreen) {
      case 'artikel':
        this.articleManager.editSelected();
        break;
      case 'kunden':
        this.customerManager.editSelected();
        break;
      default:
        alert(`F7-Funktion für ${currentScreen} wird implementiert...`);
    }
  }

  private handleF8(): void {
    const currentScreen = this.uiService.getCurrentScreen();
    switch (currentScreen) {
      case 'artikel':
        this.articleManager.deleteSelected();
        break;
      case 'kunden':
        this.customerManager.deleteSelected();
        break;
      default:
        alert(`F8-Funktion für ${currentScreen} wird implementiert...`);
    }
  }

  private handleF9(): void {
    // Handle save operations based on visible forms
    const articleForm = document.getElementById('article-form');
    const customerForm = document.getElementById('customer-form');

    if (articleForm && !articleForm.classList.contains('hidden')) {
      this.articleManager.save();
    } else if (customerForm && !customerForm.classList.contains('hidden')) {
      this.customerManager.save();
    }
  }

  private refreshAllTables(): void {
    this.articleManager.refreshTable();
    this.articleManager.refreshSelect();
    this.customerManager.refreshTable();
    this.customerManager.refreshSelect();
  }
}