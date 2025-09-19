import { Customer } from '../types/index.js';
import { DataService } from '../services/DataService.js';
import { UIService } from '../services/UIService.js';

export class CustomerManager {
  private dataService: DataService;
  private uiService: UIService;
  private currentEditingId: string | null = null;

  constructor(dataService: DataService, uiService: UIService) {
    this.dataService = dataService;
    this.uiService = uiService;
  }

  showForm(): void {
    this.uiService.showForm('customer-form');
    this.currentEditingId = null;
    this.clearForm();
    this.uiService.focusElement('customer-id');
  }

  clearForm(): void {
    const inputIds = ['customer-id', 'customer-company', 'customer-contact', 'customer-street', 'customer-city', 'customer-phone', 'customer-email'];
    this.uiService.clearFormInputs(inputIds);
  }

  cancelForm(): void {
    this.uiService.hideForm('customer-form');
    this.currentEditingId = null;
  }

  save(): void {
    const id = this.uiService.getInputValue('customer-id');
    const company = this.uiService.getInputValue('customer-company');
    const contact = this.uiService.getInputValue('customer-contact');
    const street = this.uiService.getInputValue('customer-street');
    const city = this.uiService.getInputValue('customer-city');
    const phone = this.uiService.getInputValue('customer-phone');
    const email = this.uiService.getInputValue('customer-email');

    if (!id || !company) {
      alert('Bitte füllen Sie alle Pflichtfelder aus!');
      return;
    }

    const customer: Customer = { id, company, contact, street, city, phone, email };
    const customers = this.dataService.getCustomers();

    if (this.currentEditingId) {
      const index = customers.findIndex(c => c.id === this.currentEditingId);
      if (index !== -1) {
        customers[index] = customer;
      }
    } else {
      if (customers.find(c => c.id === id)) {
        alert('Kunden-Nr. bereits vorhanden!');
        return;
      }
      customers.push(customer);
    }

    this.dataService.saveCustomers(customers);
    this.refreshTable();
    this.refreshSelect();
    this.cancelForm();
    this.uiService.updateStatus('Kunde gespeichert');
  }

  editSelected(): void {
    const selectedRow = this.uiService.getSelectedRow();
    if (!selectedRow) {
      alert('Bitte wählen Sie einen Kunden aus!');
      return;
    }

    const id = selectedRow.cells[0].textContent;
    if (!id) return;

    const customers = this.dataService.getCustomers();
    const customer = customers.find(c => c.id === id);

    if (customer) {
      this.currentEditingId = id;
      this.uiService.setInputValue('customer-id', customer.id);
      this.uiService.setInputValue('customer-company', customer.company);
      this.uiService.setInputValue('customer-contact', customer.contact);
      this.uiService.setInputValue('customer-street', customer.street);
      this.uiService.setInputValue('customer-city', customer.city);
      this.uiService.setInputValue('customer-phone', customer.phone);
      this.uiService.setInputValue('customer-email', customer.email);
      this.uiService.showForm('customer-form');
    }
  }

  deleteSelected(): void {
    const selectedRow = this.uiService.getSelectedRow();
    if (!selectedRow) {
      alert('Bitte wählen Sie einen Kunden aus!');
      return;
    }

    if (confirm('Kunde wirklich löschen?')) {
      const id = selectedRow.cells[0].textContent;
      if (id) {
        const customers = this.dataService.getCustomers().filter(c => c.id !== id);
        this.dataService.saveCustomers(customers);
        this.refreshTable();
        this.refreshSelect();
        this.uiService.updateStatus('Kunde gelöscht');
      }
    }
  }

  refreshTable(): void {
    const tbody = document.getElementById('customers-tbody') as HTMLTableSectionElement;
    if (!tbody) return;

    tbody.innerHTML = '';
    const customers = this.dataService.getCustomers();

    customers.forEach(customer => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${customer.id}</td>
        <td>${customer.company}</td>
        <td>${customer.contact}</td>
        <td>${customer.city}</td>
        <td>${customer.phone}</td>
        <td>${customer.email}</td>
      `;

      row.addEventListener('click', () => {
        this.uiService.selectRow(row);
      });
    });
  }

  refreshSelect(): void {
    const select = document.getElementById('invoice-customer') as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = '<option value="">Kunde auswählen...</option>';
    const customers = this.dataService.getCustomers();

    customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = `${customer.id} - ${customer.company}`;
      select.appendChild(option);
    });
  }
}