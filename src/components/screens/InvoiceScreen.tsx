import React, { useEffect } from 'react';
import { InvoiceManager } from '../InvoiceManager';

interface InvoiceScreenProps {
  onStatusChange: (message: string) => void;
}

const InvoiceScreen: React.FC<InvoiceScreenProps> = ({ onStatusChange }) => {
  useEffect(() => {
    onStatusChange('Rechnungs-Bereich aktiv - F2: Neue Rechnung, F3: Vorlagen, F5: Aktualisieren');
  }, [onStatusChange]);

  return (
    <div className="screen-container">
      <InvoiceManager />
    </div>
  );
};

export default InvoiceScreen;