import React from 'react';
import { Screen } from '../types/index';

interface MenuBarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ currentScreen, onScreenChange }) => {
  const menuItems = [
    { key: 'F1', screen: 'artikel' as Screen, label: 'Artikel', icon: '📦' },
    { key: 'F2', screen: 'kunden' as Screen, label: 'Kunden', icon: '👥' },
    { key: 'F3', screen: 'rechnungen' as Screen, label: 'Rechnungen', icon: '🧾' },
    { key: 'F4', screen: 'lager' as Screen, label: 'Lager', icon: '📋' },
    { key: 'F5', screen: 'berichte' as Screen, label: 'Berichte', icon: '📊' },
    { key: 'ESC', screen: 'main' as Screen, label: 'Dashboard', icon: '🏠' },
  ];

  return (
    <div className="menu-bar">
      {menuItems.map((item) => (
        <span
          key={item.key}
          className={`menu-item ${currentScreen === item.screen ? 'active' : ''}`}
          data-key={item.key}
          onClick={() => onScreenChange(item.screen)}
          title={`${item.key} - ${item.label}`}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-label">{item.label}</span>
          <span className="menu-key">{item.key}</span>
        </span>
      ))}
    </div>
  );
};

export default MenuBar;