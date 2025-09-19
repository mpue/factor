import React from 'react';

const MainScreen: React.FC = () => {
  return (
    <div id="main-screen">
      <pre>
{`╔══════════════════════════════════════════════════════════════════════════════╗
║                          HAUPTMENÜ - WARENWIRTSCHAFT                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  F1 - Artikelverwaltung     │  F5 - Berichte und Auswertungen                ║
║       • Artikel anlegen     │       • Umsatzberichte                         ║
║       • Artikel bearbeiten  │       • Lagerberichte                          ║
║       • Preise verwalten    │       • Kundenlisten                           ║
║                             │                                                ║
║  F2 - Kundenverwaltung      │  F6 - Systemeinstellungen                      ║
║       • Kunden anlegen      │       • Firmeneinstellungen                    ║
║       • Kunden bearbeiten   │       • Druckereinstellungen                   ║
║       • Kundenliste         │       • Backup/Restore                         ║
║                             │                                                ║
║  F3 - Rechnungswesen        │  F7 - Hilfe und Info                           ║
║       • Rechnung erstellen  │       • Bedienungsanleitung                    ║
║       • Rechnungen verwalten│       • Über das System                        ║
║       • Zahlungen buchen    │       • Tastaturkürzel                         ║
║                             │                                                ║
║  F4 - Lagerverwaltung       │  ESC - Programm beenden                        ║
║       • Wareneingang        │                                                ║
║       • Warenausgang        │                                                ║
║       • Inventur            │                                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

                    Wählen Sie eine Option mit den Funktionstasten
                    oder nutzen Sie die Maus für die Navigation`}
      </pre>
    </div>
  );
};

export default MainScreen;