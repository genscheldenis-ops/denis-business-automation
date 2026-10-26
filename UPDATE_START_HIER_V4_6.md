# Version 4.6 – scrollgesteuerter Startbereich

Die Website basiert auf Version 4.5. Die bestehende Petrol-Gelb-Farbwelt, Leistungen, Preise, Projektvideos, Rechner, Kontaktformular, Impressum und Datenschutz bleiben erhalten.

## Neue Startseiten-Sequenz

1. **Beim Öffnen:** Ein bildschirmfüllender, unordentlicher Büroarbeitsplatz mit Rechnungen, Papier und E-Mails.
2. **Beim Scrollen:** Die reale Büroszene blendet in einen illustrierten KI-Automatisierungsworkflow über. Nachrichten und Dokumente laufen durch die Verarbeitung zu CRM-Updates und erledigten Aufgaben. Kleine Papier-Elemente bewegen sich während des Übergangs.
3. **Danach:** Sehr große, seitenbreite Überschrift „Weniger Büroarbeit. Mehr Zeit. Weniger Kosten.“
4. **Darunter:** Originaltext über Rechnungen, Kundenanfragen und Dateneingaben, beide CTA-Buttons, alle drei Kundenvorteile, Piloteinstieg und Kostentransparenz.
5. **Anschließend:** Das vorhandene Vorher-Nachher-Bild groß und seitenbreit. Auf Smartphones werden seine beiden Hälften groß untereinander dargestellt.
6. **Danach:** Bisheriger Einsparungsrechner und alle restlichen Abschnitte unverändert.

## GitHub / Cloudflare aktualisieren

Die ZIP-Datei enthält die **vollständige Website**. Auf dem bestehenden Repository `denis-business-automation` (Branch `main`) müssen gegenüber V4.5 nur folgende Dateien hinzugefügt bzw. ersetzt werden:

- `index.html` – ändern
- `assets/style.css` – ändern
- `assets/app.js` – ändern
- `assets/story-desk.webp` – neu
- `assets/desk-before.webp` – neu
- `assets/desk-after.webp` – neu

Danach `Commit changes` auf `main`; wenn das Repository mit Cloudflare Workers verbunden ist, unter Cloudflare das Deployment kontrollieren. Wenn die Website veraltete Inhalte zeigt: auf dem Mac `Cmd + Shift + R`.

Die Animation funktioniert mit CSS/JavaScript und benötigt keine kostenpflichtige Animationsplattform. Sie wird beim Scrollen abgespielt (nicht als endlos laufendes Video). Für Menschen mit reduzierten Animationseinstellungen erscheint sofort die ruhige Endszene.

**Offen aus früheren Versionen:** Formspree-Formular-ID und Google-Ads-Kennungen sowie abschließende Datenschutz- und Funktionstests vor Werbestart.
