import React from 'react';
import { Screen } from '../types/index';
import MainScreen from './screens/MainScreen';
import ArticleScreen from './screens/ArticleScreen';
import CustomerScreen from './screens/CustomerScreen';
import InvoiceScreen from './screens/InvoiceScreen';
import StockScreen from './screens/StockScreen';
import ReportsScreen from './screens/ReportsScreen';

interface MainContentProps {
  currentScreen: Screen;
  onStatusChange: (message: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ currentScreen, onStatusChange }) => {
  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainScreen />;
      case 'artikel':
        return <ArticleScreen onStatusChange={onStatusChange} />;
      case 'kunden':
        return <CustomerScreen onStatusChange={onStatusChange} />;
      case 'rechnungen':
        return <InvoiceScreen onStatusChange={onStatusChange} />;
      case 'lager':
        return <StockScreen onStatusChange={onStatusChange} />;
      case 'berichte':
        return <ReportsScreen onStatusChange={onStatusChange} />;
      default:
        return <MainScreen />;
    }
  };

  return (
    <div className="main-content">
      {renderScreen()}
    </div>
  );
};

export default MainContent;