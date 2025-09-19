# Rechnung Nr. {{invoice.invoiceNumber}}

**{{company.name}}**  
{{company.street}}  
{{company.city}}  
Telefon: {{company.phone}}  
E-Mail: {{company.email}}  
Steuernummer: {{company.taxNumber}}

---

**Rechnungsadresse:**  
{{customer.company}}  
{{customer.contact}}  
{{customer.street}}  
{{customer.city}}

---

**Rechnungsdatum:** {{invoice.dateFormatted}}  
**Fälligkeitsdatum:** {{invoice.dueDateFormatted}}  
**Zahlungsbedingungen:** {{invoice.paymentTerms}}

---

## Rechnungsposition

| Artikel | Menge | Einzelpreis | Gesamtpreis |
|---------|-------|-------------|-------------|
{{#positions}}
| {{articleName}} | {{quantity}} | {{unitPriceFormatted}} | {{totalPriceFormatted}} |
{{/positions}}

---

## Rechnungssumme

**Zwischensumme:** {{invoice.netAmountFormatted}}  
{{#invoice.discountAmount}}
**Rabatt:** -{{invoice.discountAmountFormatted}}  
{{/invoice.discountAmount}}
**Steuern:** {{invoice.taxAmountFormatted}}  
**Gesamtbetrag:** {{invoice.totalAmountFormatted}}

---

{{#invoice.notes}}
**Anmerkungen:**  
{{invoice.notes}}
{{/invoice.notes}}

**Bankverbindung:**  
{{company.bankAccount}}

Vielen Dank für Ihr Vertrauen!

---

*Diese Rechnung wurde automatisch erstellt am {{currentDate}}*