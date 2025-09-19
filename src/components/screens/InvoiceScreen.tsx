import React, { useEffect } from 'react';

interface InvoiceScreenProps {
  onStatusChange: (message: string) => void;
}

const InvoiceScreen: React.FC<InvoiceScreenProps> = ({ onStatusChange }) => {
  useEffect(() => {
    onStatusChange('Rechnungs-Bereich aktiv');
  }, [onStatusChange]);

  return (
    <div>
      <h2>═══ RECHNUNGSWESEN ═══</h2>
      <p>Rechnungsmodul wird in separaten React-Komponenten implementiert...</p>
    </div>
  );
};

export default InvoiceScreen;