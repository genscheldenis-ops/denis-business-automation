# Denis Genschel – Business Automation | Website-Paket

## Ziel
Eigenständige verkaufsorientierte Website für kleine und mittelständische Unternehmen in Deutschland. Separat vom technischen GitHub-Portfolio. Helles Creme-/Salbei-/Grün-Design, kein Dunkelblau/Violett.

## Inhalt
- `index.html`: Startseite mit Leistungen, Projektdemos, transparentem Preisaufbau, Ablauf, Pilot, Über mich, FAQ.
- `rechnungen-automatisieren.html`: Google-Ads-Landingpage für Rechnungsverarbeitung.
- `crm-automatisieren.html`: Google-Ads-Landingpage für CRM und Leads.
- `prozesse-automatisieren.html`: Google-Ads-Landingpage für individuelle Automatisierung.
- `anfrage.html`: Anfrageformular auf Mailto-Basis – keine serverseitige Speicherung oder automatische Zustellung.
- `impressum.html`, `datenschutz.html`: **rechtliche Entwürfe, vor Veröffentlichung zwingend zu ergänzen**.
- `assets/`: CSS, JS, Porträt und echte Projekt-Thumbnails.

## Preisstrategie (Entwurf – vor Veröffentlichung bestätigen)
- Pilot ca. **390–790 € einmalig**, klar definierter Teilprozess und Test.
- Entwicklung ca. **900–3.500 € einmalig** für einfachere/mittlere Workflows.
- Betreuung **optional ca. 99–390 €/Monat**, konkrete Leistungen/Stunden/Reaktionszeiten vertraglich festlegen.
- SaaS-/API-/Hosting-Gebühren sind zusätzlich und vorher transparent anzugeben.
**Diese Spannen sind frei gewählte, unverbindliche Vorschläge für deine eigene Preispositionierung und keine belegten Marktpreise.** Prüfe, ob Aufwand und Risiko zu diesen Zahlen passen, bevor du veröffentlichst.

## Deployment mit Cloudflare Pages
1. Neues GitHub-Repository erstellen, z.B. `denis-business-automation` (NICHT das Portfolio-Repository überschreiben).
2. Alle Website-Dateien einschließlich des Ordners `assets` ins Root des neuen Repositories hochladen.
3. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → Repo wählen. Bei reinem HTML/CSS/JS kein Build-Framework nötig, Ausgabeordner `/` bzw. Repository-Root; Cloudflare-Doku im Zweifelsfall beachten.
4. Die Website erhält eine `*.pages.dev`-Adresse. Eigene Domain lässt sich später verknüpfen.
5. Vor öffentlicher Werbung: Impressum und Datenschutz **rechtlich vervollständigen**, Preise abstimmen, alle Buttons und Formular auf realem Gerät testen, Videolinks und Mobile-Layout prüfen.
6. Für echtes Google-Ads-Conversion-Tracking muss ein passendes Consent-Management und Conversion-Event ergänzt werden. Die aktuelle Vorlage setzt absichtlich keine Tracking-Cookies.

## WICHTIG zum Anfrageformular
Es öffnet lediglich eine vorbereitete E-Mail im E-Mail-Programm des Besuchers. **Ohne lokal eingerichtetes E-Mail-Programm kann dieser Schritt scheitern**. Die Seite bietet deshalb E-Mail-Adresse und Telefonnummer als funktionierende Alternative.
Für Google-Ads-Kampagnen mit messbaren Leads empfiehlt sich später ein DSGVO-geprüftes Formular-Backend mit Empfangsbestätigung, Spam-Schutz und korrekten Conversion-Events. Das benötigt einen passenden Dienst bzw. eigene Backend-Integration.

## Eingebundene Videos
- Rechnung: `https://genscheldenis-ops.github.io/assets/invoice-demo.mp4`
- CRM: `https://pub-75876f06dc7c417a906c024fb928b8fb.r2.dev/crm-demo.mp4`
Videos werden erst nach Klick geladen. Kein YouTube, keine neuen Video-Uploads notwendig. Die externe Erreichbarkeit und Mediencodecs sollten getestet werden.

## Weitere Schritte
- Kostenfreies Erstgespräch nur anbieten, wenn du es tatsächlich leisten möchtest.
- Für wiederkehrende Betreuung Leistungen, Reaktionszeiten, monatliche Inklusivstunden, Vertragslaufzeit, Kündigung und Drittanbieter-Gebühren sauber regeln.
- Privacy / Impressum prüfen; auf den Seiten sind notwendige Angaben absichtlich als offene Felder gekennzeichnet.
- Anfragen auf alle drei Ads-Landingpages ausrichten und die Ergebnisse messen, bevor du das Budget steigerst.
