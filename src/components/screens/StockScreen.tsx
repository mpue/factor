import React, { useEffect } from 'react';

interface StockScreenProps {
  onStatusChange: (message: string) => void;
}

const StockScreen: React.FC<StockScreenProps> = ({ onStatusChange }) => {
  useEffect(() => {
    onStatusChange('Lager-Bereich aktiv');
  }, [onStatusChange]);

  return (
    <div>
      <h2>═══ LAGERVERWALTUNG ═══</h2>
      <p>Lagermodul wird in separaten React-Komponenten implementiert...</p>
    </div>
  );
};

export default StockScreen;