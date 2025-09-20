# Test-Dokumentation für Rechnungsansicht

## Übersicht
Diese Dokumentation beschreibt umfassende Tests für die Rechnungsansicht des Factor Warenwirtschaftssystems.

## Test-Setup

### Abhängigkeiten
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### Konfiguration
- `vite.config.ts`: Vitest-Konfiguration mit jsdom environment
- `src/test/setup.ts`: Test-Setup mit Mocks für fetch, URL, window.open
- `src/test/mockData.ts`: Mock-Daten für Kunden, Artikel, Templates und Rechnungen
- `src/test/mocks.ts`: Service-Mocks für InvoiceService und ApiDataService

## Test-Kategorien

### 1. InvoiceForm Tests (`InvoiceForm.test.tsx`)

#### Create Mode Tests
- ✅ Formular mit Erstellungs-Titel anzeigen
- ✅ Automatische Rechnungsnummer-Generierung
- ✅ Standard-Template laden
- ✅ Erstellen-Button anzeigen (kein PDF-Export)
- ✅ Kunden-Dropdown befüllen
- ✅ Template-Dropdown befüllen
- ✅ Neue Position hinzufügen
- ✅ Summen korrekt berechnen
- ✅ Pflichtfelder validieren
- ✅ Rechnung erstellen bei gültigen Daten

#### Edit Mode Tests
- ✅ Formular mit Bearbeitungs-Titel anzeigen
- ✅ Vollständige Rechnungsdaten laden
- ✅ Formular mit bestehenden Daten befüllen
- ✅ Bestehende Positionen anzeigen
- ✅ PDF-Export-Buttons anzeigen
- ✅ Aktualisieren-Button anzeigen
- ✅ PDF exportieren
- ✅ PDF-Vorschau anzeigen
- ✅ Rechnung aktualisieren
- ✅ Rechnungsnummer als readonly behandeln

#### Position Management Tests
- ✅ Position entfernen
- ✅ Auto-Berechnung bei Artikelauswahl
- ✅ Neuberechnung bei Mengenänderung

#### Error Handling Tests
- ✅ Fehler bei API-Aufruf anzeigen
- ✅ Fehler schließen
- ✅ Loading-States anzeigen
- ✅ Abbrechen-Funktionalität

### 2. InvoiceManager Tests (`InvoiceManager.test.tsx`)

#### List View Tests  
- ✅ Rechnungslisten-Titel anzeigen
- ✅ Rechnungen laden und anzeigen
- ✅ Beträge korrekt formatieren
- ✅ Status-Badges anzeigen
- ✅ Neue Rechnung-Button anzeigen
- ✅ Vorlagen-Button anzeigen
- ✅ Aktions-Buttons für jede Rechnung

#### Navigation Tests
- ✅ Zur Erstellungsansicht wechseln
- ✅ Zur Bearbeitungsansicht wechseln
- ✅ Zur Listenansicht zurückkehren
- ✅ Zur Vorlagenansicht wechseln

#### Invoice Actions Tests
- ✅ PDF-Export aufrufen
- ✅ Lösch-Bestätigungsdialog anzeigen
- ✅ Löschen abbrechen

#### Loading & Error States
- ✅ Loading-Spinner anzeigen
- ✅ Loading-Spinner ausblenden nach Laden
- ✅ Fehlermeldungen bei Ladefehler
- ✅ Fehlermeldungen bei PDF-Export-Fehler
- ✅ Fehlermeldungen bei Lösch-Fehler

#### Data Integration
- ✅ Alle Daten beim Mount laden  
- ✅ Daten nach erfolgreichem Speichern neu laden
- ✅ Leeren Zustand anzeigen
- ✅ Datum und Währung korrekt formatieren

### 3. Integration Tests (`InvoiceForm.integration.test.tsx`)

#### Complex Workflows
- ✅ Vollständiger Rechnungs-Erstellungsworkflow
- ✅ Positionsänderungen korrekt verarbeiten
- ✅ Mehrere Positionen mit verschiedenen Artikeln

#### Edge Cases
- ✅ Null-Menge graceful behandeln
- ✅ Negative Preise graceful behandeln
- ✅ Dezimal-Mengen verarbeiten
- ✅ Fehlende Templates graceful behandeln
- ✅ Fehlende Kunden graceful behandeln
- ✅ Fehlende Artikel graceful behandeln

#### Performance & Memory
- ✅ Keine Memory Leaks bei Positionsänderungen
- ✅ Schnelle Benutzereingaben graceful behandeln

#### Accessibility
- ✅ Korrekte ARIA-Labels
- ✅ Button-Titel für Screen Reader
- ✅ Tastaturnavigation unterstützen

## Manuelle Test-Szenarien

### Szenario 1: Neue Rechnung erstellen
1. Rechnungsmodul öffnen
2. "Neue Rechnung" klicken
3. Kunde auswählen
4. Position hinzufügen und Artikel wählen
5. Menge und Preis überprüfen
6. Zahlungsbedingungen eingeben
7. Rechnung erstellen
8. **Erwartung**: Rechnung wird erfolgreich erstellt und zur Liste zurückgekehrt

### Szenario 2: Bestehende Rechnung bearbeiten
1. Rechnung aus Liste auswählen
2. "Bearbeiten" klicken
3. Bestehende Daten sind vorausgefüllt
4. Position hinzufügen oder ändern
5. Aktualisieren klicken
6. **Erwartung**: Änderungen werden gespeichert

### Szenario 3: PDF-Export
1. Rechnung aus Liste auswählen
2. "PDF Export" klicken
3. **Erwartung**: PDF wird heruntergeladen
4. Alternativ: "PDF Vorschau" für Anzeige im Browser

### Szenario 4: Komplexe Berechnung
1. Neue Rechnung erstellen
2. Mehrere Positionen mit verschiedenen Artikeln hinzufügen
3. Mengen ändern
4. Preise manuell anpassen
5. **Erwartung**: Netto-, Steuer- und Gesamtbeträge korrekt berechnet

### Szenario 5: Validierung
1. Neue Rechnung ohne Pflichtfelder versuchen zu erstellen
2. **Erwartung**: Validierungsfehler werden angezeigt
3. Position ohne Artikel hinzufügen
4. **Erwartung**: Entsprechender Validierungsfehler

### Szenario 6: Error Handling
1. Backend-Server stoppen
2. Rechnung erstellen versuchen
3. **Erwartung**: Fehlermeldung wird angezeigt
4. PDF-Export ohne Server versuchen
5. **Erwartung**: PDF-Fehler wird angezeigt

## Testdaten

### Mock-Kunden
- Test AG (Max Mustermann)
- Demo GmbH (Anna Schmidt)

### Mock-Artikel
- Laptop Dell XPS 13 (1.299,99 €)
- Monitor 27" 4K (449,99 €)
- Tastatur mechanisch (129,99 €)

### Mock-Templates
- Standard Rechnung (Default)
- Premium Rechnung

### Mock-Rechnungen
- INV-2025-001 (Test AG, 1.549,98 €, Entwurf)
- INV-2025-002 (Demo GmbH, 579,98 €, Versendet)

## Coverage-Ziele

- **Komponenten**: 100% der React-Komponenten getestet
- **User Flows**: Alle kritischen Benutzer-Workflows abgedeckt
- **Edge Cases**: Grenzfälle und Fehlerzustände getestet
- **Integration**: Service-Integration und API-Aufrufe gemockt
- **Accessibility**: Grundlegende A11y-Features getestet

## Ausführung

```bash
# Alle Tests ausführen
npm test

# Tests mit Coverage
npm run test:coverage

# Tests mit UI
npm run test:ui

# Einzelne Test-Datei
npx vitest run src/components/InvoiceForm.test.tsx
```

## Bekannte Einschränkungen

1. PDF-Generierung wird gemockt (echte PDF-Tests benötigen spezielle Tools)
2. File-Downloads werden simuliert
3. Keine End-to-End-Tests mit echtem Backend
4. Browser-spezifische Features sind nicht vollständig testbar

## Nächste Schritte

1. Backend-API Tests hinzufügen
2. E2E-Tests mit Playwright/Cypress
3. Performance-Tests für große Datenmengen
4. Accessibility-Tests mit axe-core
5. Visual Regression Tests