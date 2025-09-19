import React, { useEffect } from 'react';

interface ReportsScreenProps {
  onStatusChange: (message: string) => void;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ onStatusChange }) => {
  useEffect(() => {
    onStatusChange('Berichte-Bereich aktiv');
  }, [onStatusChange]);

  return (
    <div>
      <h2>═══ BERICHTE UND AUSWERTUNGEN ═══</h2>
      <p>Berichtsmodul wird in separaten React-Komponenten implementiert...</p>
    </div>
  );
};

export default ReportsScreen;