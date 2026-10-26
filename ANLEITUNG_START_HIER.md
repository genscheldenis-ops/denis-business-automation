# Denis Genschel – Business Automation · Website V2

Die Webseite ist für Cloudflare Pages + GitHub vorbereitet. **Sie ist noch nicht live und das Formular kann erst nach Eintragen Ihrer persönlichen Formspree-ID zustellen.** Google-Ads-Messung wird erst nach Eintragen von Conversion-ID/Label UND Einwilligung geladen.

## A. Vor dem Upload: Dateien
- Dieses ZIP entpacken.
- **Nur den Inhalt** des Ordners `Denis_Genschel_Business_Automation_V2` in das neue GitHub-Repository hochladen: `index.html`, `anfrage.html`, `danke.html`, Dienstleistungsseiten, Rechtstexte, `assets/` mit `config.js`, `app.js`, `style.css`, Bildern.
- **Nicht** die gesamte ZIP-Datei oder einen weiteren Oberordner ins Repository legen.
- Altes Portfolio unter genscheldenis-ops.github.io **nicht** überschreiben.

## B. Anfrageformular aktivieren – notwendig
1. Eröffnen Sie ein Konto auf https://formspree.io/ .
2. Neue Form erstellen, z.B. `Business Automation – Anfragen`.
3. Die Ziel-E-Mail `genschel.denis@gmail.com` hinterlegen und die vom Anbieter geforderte Bestätigung abschließen.
4. Im Formspree-Dashboard die **Form ID** kopieren (Beispiel: `abcd1234`, **kein geheimer API-Schlüssel**).
5. In `assets/config.js` NUR `FORM_ID_EINTRAGEN` durch Ihre tatsächliche Form-ID ersetzen.
6. Hochladen/Commit ausführen. Anschließend eine echte Testanfrage absenden, die E-Mail-Zustellung und den Eintrag im Formspree-Dashboard kontrollieren. Die `danke.html` darf **nur nach erfolgreicher HTTP-Rückmeldung** erscheinen.
7. In Formspree Spamfilter/Domain-Limit bei Bedarf aktivieren, Benachrichtigungen prüfen, monatliches Formular-Limit beobachten. Der Gratis-Tarif ist derzeit für Tests/Entwicklung (50 Einsendungen/Monat) ausgewiesen, für ein produktives Geschäft ggf. kostenpflichtigen Plan einplanen.
8. Ein Testformular nie mit realen Kundendaten befüllen.

**Wichtig**: Ohne Formspree-Konto und Ihre Form-ID kann kein Entwickler die Zustellung in Ihrem Namen aktivieren. Die Website zeigt dann eine Fehlermeldung samt E-Mail-Alternative, statt eine Zustellung vorzutäuschen.

## C. Google Ads: Conversion-Tracking (erst später, Kontodaten erforderlich)
1. In Google Ads unter Ziele/Conversions eine Website-Conversion **„Anfrage erfolgreich gesendet“** einrichten. Nicht den Klick auf den Anfrage-Button zählen.
2. In der Tag-Einrichtung `AW-...` und das **Conversion-Label** ablesen.
3. In `assets/config.js` `googleAdsId` und `googleAdsConversionLabel` ausfüllen.
4. Auf der Website wird dann automatisch ein Auswahlfeld für optionale Anzeigenmessung sichtbar. Das Google-Tag wird **erst nach ausdrücklicher Einwilligung** geladen. Der Besucher kann die Einstellung über `Tracking-Einstellungen` im Footer ändern.
5. Der Tracking-Event erfolgt auf `danke.html` **nur einmal nach einer zuvor erfolgreichen Formspree-Übermittlung**, und nur bei erteilter Einwilligung. Direkte Besuche von danke.html zählen nicht.
6. Mit Google Tag Assistant und einem realen Formular-Test (ohne sensible Daten) den Event prüfen; Spam-/Testkonversionen bei der Kampagnenauswertung berücksichtigen.
7. **Achtung:** Bei Ablehnung der Anzeigenmessung kann der Werbeklick technisch nicht als Conversion zugeordnet werden. Es ist keine vollständige Messung aller Website-Anfragen. Google Ads/Consent Mode v2, Ads-Cookies und Datenschutzhinweise müssen vor Kampagnenstart rechtlich und technisch kontrolliert werden; für umfassende Consent-Mode-Setups ist ggf. eine CMP sinnvoll.

## D. Neues GitHub-Repository erstellen
1. https://github.com/new öffnen, als Nutzer `genscheldenis-ops`.
2. Repository-Name z.B. `denis-business-automation` wählen. Es ist **ein eigenständiges zweites Repository** neben `genscheldenis-ops.github.io`.
3. Public auswählen, `Create repository`.
4. `Add file` → `Upload files`. **Inhalt** der hier bereitgestellten Website hochladen; Ordner `assets` muss seine Dateien enthalten. Bei Browser-Upload bei Bedarf Ordner per Drag&Drop hineinziehen, oder alle Dateien aus einem lokalen Git-Client pushen.
5. Commit changes.

## E. Cloudflare Pages mit GitHub verbinden
1. https://dash.cloudflare.com/ öffnen → `Workers & Pages` → `Create application` → `Pages` → `Import an existing Git repository`/`Connect to Git` (Menübezeichnung kann variieren).
2. GitHub-Verbindung autorisieren und **nur** das neue Repository `denis-business-automation` wählen.
3. Production branch: `main`.
4. Framework preset: `None` oder `No framework`.
5. Build command: `exit 0` (oder leer, falls UI es zulässt), Build output directory: `.` (Root des Repositorys).
6. `Save and Deploy` / `Deploy` auswählen.
7. Cloudflare gibt Ihnen eine öffentliche Adresse wie `https://denis-business-automation.pages.dev` (Name ist nur beispielhaft; tatsächlichen Link ablesen). Sie benötigen noch keine eigene Domain.
8. Jeder neue Commit auf `main` startet eine neue Bereitstellung.

## F. Vor dem Werbestart zwingend prüfen
- `impressum.html` enthält noch `[VOLLSTÄNDIGE LADUNGSFÄHIGE ANSCHRIFT ERGÄNZEN]` sowie weitere mögliche Pflichtangaben. Ausfüllen und rechtlich prüfen.
- `datenschutz.html` ist weiterhin ein **rechtlicher Entwurf**: Datenempfänger, Formspree-Auftragsverarbeitung, Hosting, ggf. Drittlandverarbeitung, Tracking und Löschfristen konkretisieren. Vor Veröffentlichung finalisieren.
- Preise wurden gemäß Ihrer Entscheidung **Variante A** beibehalten: Pilot 390–790 € einmalig, Umsetzung 900–3.500 € einmalig, Betreuung 99–390 €/Monat **optional**, jeweils individuelle Angebote, Softwarekosten separat.
- Testen: Formular (auch Fehlerfall), mobile Navigation, HTTPS, Videos, Mail- und Telefonlinks, Datenschutz-/Impressumslinks, Google-Ads-Conversion erst nach Zustimmung.
- Eine eigene Domain ist für den technischen Start **nicht zwingend**, für Anzeigen und eine professionelle Außenwirkung aber mittelfristig empfehlenswert.

## Hilfreiche Anbieteranleitungen
- Cloudflare Pages: https://developers.cloudflare.com/pages/get-started/git-integration/
- Formspree AJAX: https://help.formspree.io/de/articles/building-your-form/submit-forms-with-javascript-ajax
- Google Ads Conversion: https://developers.google.com/tag-platform/devguides/conversions?hl=de
