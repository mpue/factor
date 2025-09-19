import { Screen } from '../types/index.js';

export class UIService {
  private currentScreen: Screen = 'main';
  private selectedRow: HTMLTableRowElement | null = null;

  updateTime(): void {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
      timeElement.textContent = now.toLocaleString('de-DE');
    }
  }

  updateStatus(message: string): void {
    const statusElement = document.getElementById('status-text');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }

  showScreen(screenName: Screen): void {
    const screens: Screen[] = ['main', 'artikel', 'kunden', 'rechnungen', 'lager', 'berichte'];
    
    // Hide all screens
    screens.forEach(screen => {
      const element = document.getElementById(screen + '-screen');
      if (element) {
        element.classList.add('hidden');
      }
    });

    // Show active screen
    const activeScreen = document.getElementById(screenName + '-screen');
    if (activeScreen) {
      activeScreen.classList.remove('hidden');
    }
    
    this.currentScreen = screenName;

    // Update menu highlighting
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });

    // Update status
    this.updateStatus(`${screenName.charAt(0).toUpperCase() + screenName.slice(1)}-Bereich aktiv`);
  }

  getCurrentScreen(): Screen {
    return this.currentScreen;
  }

  selectRow(row: HTMLTableRowElement): void {
    if (this.selectedRow) {
      this.selectedRow.classList.remove('highlight');
    }
    this.selectedRow = row;
    row.classList.add('highlight');
  }

  getSelectedRow(): HTMLTableRowElement | null {
    return this.selectedRow;
  }

  clearSelection(): void {
    if (this.selectedRow) {
      this.selectedRow.classList.remove('highlight');
      this.selectedRow = null;
    }
  }

  showForm(formId: string): void {
    const form = document.getElementById(formId);
    if (form) {
      form.classList.remove('hidden');
    }
  }

  hideForm(formId: string): void {
    const form = document.getElementById(formId);
    if (form) {
      form.classList.add('hidden');
    }
  }

  clearFormInputs(inputIds: string[]): void {
    inputIds.forEach(id => {
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    });
  }

  getInputValue(id: string): string {
    const input = document.getElementById(id) as HTMLInputElement;
    return input ? input.value : '';
  }

  setInputValue(id: string, value: string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.value = value;
    }
  }

  focusElement(id: string): void {
    const element = document.getElementById(id) as HTMLElement;
    if (element) {
      element.focus();
    }
  }
}