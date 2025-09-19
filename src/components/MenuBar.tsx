import React from 'react';
import { Screen } from '../types/index';

interface MenuBarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ currentScreen, onScreenChange }) => {
  const menuItems = [
    { key: 'F1', screen: 'artikel' as Screen, label: 'F1-Artikel' },
    { key: 'F2', screen: 'kunden' as Screen, label: 'F2-Kunden' },
    { key: 'F3', screen: 'rechnungen' as Screen, label: 'F3-Rechnungen' },
    { key: 'F4', screen: 'lager' as Screen, label: 'F4-Lager' },
    { key: 'F5', screen: 'berichte' as Screen, label: 'F5-Berichte' },
    { key: 'ESC', screen: 'main' as Screen, label: 'ESC-Hauptmenü' },
  ];

  return (
    <div className="menu-bar">
      {menuItems.map((item) => (
        <span
          key={item.key}
          className={`menu-item ${currentScreen === item.screen ? 'active' : ''}`}
          data-key={item.key}
          onClick={() => onScreenChange(item.screen)}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
};

export default MenuBar;