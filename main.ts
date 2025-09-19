import { WarenwirtschaftApp } from './src/app.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new WarenwirtschaftApp();
  app.init();
});