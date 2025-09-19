import React, { useState, useEffect } from 'react';
import { Screen } from './types/index';
import { WarenwirtschaftProvider } from './contexts/WarenwirtschaftContext';
import Header from './components/Header';
import MenuBar from './components/MenuBar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusMessage, setStatusMessage] = useState('Bereit - Verwenden Sie die Funktionstasten oder Maus für Navigation');

  useEffect(() => {
    // No initialization needed - API handles data

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Setup keyboard navigation
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'F1':
          event.preventDefault();
          setCurrentScreen('artikel');
          break;
        case 'F2':
          event.preventDefault();
          setCurrentScreen('kunden');
          break;
        case 'F3':
          event.preventDefault();
          setCurrentScreen('rechnungen');
          break;
        case 'F4':
          event.preventDefault();
          setCurrentScreen('lager');
          break;
        case 'F5':
          event.preventDefault();
          setCurrentScreen('berichte');
          break;
        case 'Escape':
          event.preventDefault();
          if (currentScreen !== 'main') {
            setCurrentScreen('main');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(timeInterval);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentScreen]);

  return (
    <WarenwirtschaftProvider>
      <div className="dos-screen">
        <Header />
        <MenuBar 
          currentScreen={currentScreen} 
          onScreenChange={setCurrentScreen} 
        />
        <MainContent 
          currentScreen={currentScreen}
          onStatusChange={setStatusMessage}
        />
        <StatusBar 
          statusMessage={statusMessage}
          currentTime={currentTime}
        />
      </div>
    </WarenwirtschaftProvider>
  );
};

export default App;