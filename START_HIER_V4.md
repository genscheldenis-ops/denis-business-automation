# Denis Genschel – Business Automation · V4 (verkaufsoptimiert)

Die Dateien enthalten die komplette Website für Cloudflare Workers mit GitHub-Deployment. Die bisherigen Seiten, der Gelb-Weiß-Look, Impressum, Datenschutzhinweise, Anfrageformular und die vorbereitet einwilligungsbasierte Google-Ads-Messung bleiben erhalten.

## Was in V4 geändert wurde

- Neue, problemorientierte Startseitenüberschrift („Schluss mit zeitraubender Routinearbeit.“) und sofort sichtbare Kundenargumente
- Früh sichtbarer Einstiegspreis: Pilotprojekt ab **ca. 390 €**, unverbindliche Preisspanne **390–790 €**; größere Umsetzung **ca. 900–3.500 €**; Betreuung **optional ca. 99–390 € monatlich**
- Klarer Haupt-CTA „Kostenlose Prozesseinschätzung anfragen“ auf allen wichtigen Seiten und nach zentralen Abschnitten
- Echte Rechnungs-Demo weit nach oben gezogen; weitere Rechnungs- und CRM-Videos in den Praxisbeispielen
- Einfache und nachvollziehbare **modellhafte Zeiteinsparungsrechnung** mit editierbaren Stunden, Automatisierungsanteil und Personalkosten; läuft vollständig im Browser, sendet keine Berechnungsdaten an Dritte
- Praktisches Erfahrungsbeispiel (80–120 Belege/Monat; eigenständig geschätzte 5–7 Stunden Entlastung/Woche; nicht unabhängig geprüft)
- Über-mich-Text mit mehr Persönlichkeit, nachvollziehbarer Vorgehensweise und persönlicher Zusammenarbeit
- Separat auf Suchabsicht optimierte Seiten für Rechnungsverarbeitung, HubSpot-CRM und n8n/Make-Workflows
- Ausführliche FAQ, transparenter Preisaufbau, keine verpflichtenden Abos
- Bereits zuvor überarbeitetes Business-Porträt im Büro eingebunden

**Bewusst unverändert:** Rechts in der Startseiten-Hero befindet sich weiterhin die bisherige schematische Workflow-Grafik. Du wolltest das endgültige neue Hauptbild erst im nächsten Schritt generieren. Beim Austausch sollte das Bild keine eingebetteten langen Texte haben.

## Installation / Aktualisierung über GitHub

1. ZIP entpacken.
2. GitHub öffnen → Repository **denis-business-automation** → Branch **main**.
3. Dateien im Repository durch gleichnamige Dateien aus dem ZIP ersetzen; insbesondere `index.html`, die drei Leistungsseiten und `assets/style.css`, `assets/app.js` sowie `assets/denis-portrait.webp`.
4. Achte darauf, dass die Dateien direkt im Repository liegen und `assets` der Unterordner ist (also `index.html`, nicht `ordner/index.html`).
5. Änderungen mit **Commit changes** speichern. Bei einer GitHub-Cloudflare-Verbindung beginnt die Veröffentlichung über das verbundene Projekt automatisch; dort Deployments prüfen.
6. Website mit erzwungenem Neuladen öffnen (Mac: `Cmd + Shift + R`), damit neues CSS erscheint.
7. In der fertigen Seite den **Einsparungsrechner**, alle Buttons, die Projektvideos und die Darstellung am Smartphone prüfen.

Deine bekannte Cloudflare-URL: https://denis-business-automation.genschel-denis.workers.dev

## Wichtig vor einer Google-Ads-Kampagne

In `assets/config.js` sind `formspreeId`, `googleAdsId` und `googleAdsConversionLabel` weiterhin nicht konfiguriert. Dadurch wird das Formular **noch keine Anfragen versenden** und Google Ads **noch keine Conversions messen**. Bitte erst nach korrekter Verbindung den kompletten Versand und die Danke-Seite testen.

- Impressum / Datenschutzhinweise vor dem Werbestart rechtlich prüfen. Umsatzsteuer-ID ist noch nicht ergänzt.
- Einwilligungs-/Tracking-Implementierung im Hinblick auf tatsächliche Google-Ads-Konfiguration, Consent Mode, erforderliche CMP und Widerruf prüfen, bevor Tags aktiviert werden.
- Alle Preisangaben sind Orientierungswerte, keine verbindlichen Paketpreise. Drittanbietergebühren und Umsatzsteuer werden im konkreten Angebot erläutert.
- Es sind keine Kundenstimmen oder Erfolgsversprechen erfunden. Der Einsparungsrechner stellt eine Beispielrechnung, keine Prognose dar.

## Nächster Design-Schritt: Hauptbild

Die bisherige rechte Workflow-Illustration austauschen gegen ein visuelles Vorher–Nachher-Bild: links manuelle Verwaltungsarbeit und viele lose Vorgänge, rechts übersichtliches Büro mit geregelten digitalen Aufgaben. Warmes Weiß/Buttergelb beibehalten, **kaum oder keinen Text im Bild**. Überschrift und Call-to-Action weiterhin als echtes HTML daneben anzeigen.
