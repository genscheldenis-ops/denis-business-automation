# Denis Genschel – Business Automation | Website V3 (Gelb-Weiß)

## Aktualisierungen
- Vollständig neue Farbwelt: weiß, off-white, Buttergelb, goldgelber Verlauf; auch Hero, Call-to-Action und Innen-Seiten.
- Echtes Impressum mit vollständiger Geschäftsanschrift, Telefonnummer, E-Mail und Unternehmerbezeichnung.
- Datenschutzerklärung inhaltlich erweitert auf Cloudflare Workers, Formspree, externe Videos, Google Ads Conversion-Messung, separates Remarketing, Widerruf und Betroffenenrechte.
- Tracking-Kontrollen: gleichwertige Schaltflächen „Alle ablehnen“ und „Alle akzeptieren“ plus separate Checkboxen und „Auswahl speichern“. Das Google-Tag wird **erst nach entsprechender Zustimmung** geladen; ein eingerichtetes Google-Konto ist erforderlich.
- Preisgestaltung wie vereinbart: kostenloses Erstgespräch, Pilot 390–790 €, Implementierung 900–3.500 €, optionale Betreuung 99–390 €/Monat; Preise sind Orientierung, kein verbindliches Angebot.

## In GitHub aktualisieren
1. Den Inhalt dieser ZIP entpacken. Der Inhalt des Ordners `Denis_Genschel_Business_Automation_V3` enthält `index.html` und den Ordner `assets`.
2. In GitHub Repository `denis-business-automation` auf `main` wechseln.
3. Alle `.html`-Dateien im Repo-Hauptverzeichnis ersetzen; in `assets` die Dateien `style.css` und `app.js` ersetzen. Bilder dort nicht löschen.
4. Commit durchführen. Beim passenden GitHub-Deployment zeigt Cloudflare das aktualisierte Design. Prüfe in Cloudflare unter Workers & Pages → dein Worker → Deployments, ob der Commit publiziert ist. **Der ZIP-Download alleine aktualisiert die Live-Seite nicht.**

## Formspree einschalten
In `assets/config.js` die Formular-ID von Formspree eintragen (nicht die Konto-ID, nicht einen geheimen Schlüssel), bei Formspree die Benachrichtigungsadresse verifizieren. Eine Testanfrage absenden und prüfen, ob der Eintrag im Formspree-Dashboard und die E-Mail ankommt. Das Formular funktioniert erst nach der Eingabe der echten Form-ID.

## Google Ads aktivieren
In `assets/config.js` die öffentliche Google-Ads-ID `AW-...` und das Conversion-Label eintragen. Anschließend im Browser alle drei Consent-Optionen getrennt testen. Google Ads Conversion-Aktion anlegen und nur nach erfolgreichem Formularversand prüfen. Remarketing im Ads-Konto gesondert aktivieren/konfigurieren. Das eingebaute Interface ersetzt nicht die Prüfung der rechtlichen CMP-Anforderungen bzw. eventueller Google-Zertifizierungspflichten. Kein Tracking ohne Zustimmung. Bei Ablehnung wird kein Google-Tag geladen. Vorherige Cookie-Löschung bei einem späteren Widerruf muss abhängig von der finalen Google-Tag-Konfiguration überprüft werden.

## Rechtliches vor dem Ads-Start prüfen
- Die vom Nutzer als USt-IdNr. angegebene 11-stellige Nummer wurde aus Datenschutzgründen **nicht** veröffentlicht. Deutsche USt-IdNr. hat `DE` + 9 Ziffern. Steuer-ID und Steuernummer nicht einfach ins Impressum stellen. Wenn eine gültige USt-IdNr. oder Wirtschafts-Identifikationsnummer existiert, prüfen, ob und wie sie nach §5 DDG anzugeben ist.
- Die Adresse ist öffentlich im Impressum (beabsichtigt). Prüfe, ob es sich um die echte ladungsfähige Geschäftsanschrift handelt.
- Unternehmensstatus (Einzelunternehmen, ggf. Gewerbeanmeldung/Handelsregister) prüfen.
- Im Cloudflare- und Formspree-Konto AV-Verträge, Datenregion, Log-/Datenaufbewahrung sowie internationale Transfers prüfen; Datenschutzerklärung an echte Einstellungen anpassen.
- Google Ads: konkreter Tag, Zwecke, Cookies, Consent Mode v2 und erforderliche CMP-/Google-Policy-Compliance prüfen. Ein Datenschutzexperte sollte die fertige Erklärung abnehmen.
- Falls Newsletter, Calendly, Google Fonts, Analytics oder andere Dienste später hinzugefügt werden, die Datenschutzerklärung ergänzen.

## Wichtiger Hinweis
Die URL `https://denis-business-automation.genschel-denis.workers.dev` zeigt auf Cloudflare **Workers** (nicht Pages). Die Website-Bereitstellung lässt sich nur dann durch GitHub-Dateiänderungen aktualisieren, wenn dein Worker korrekt an das GitHub-Repository und dessen Build-/Deploy-Prozess gebunden ist. Sonst ist erneutes Deployment in Cloudflare erforderlich.
