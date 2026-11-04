# SEO- und Domainmigration · genschel-automation.de

Stand: 4. November 2026. Ausgangspunkt: `DG_Website_Pastell_v8.zip`.

Die aktualisierte Website ist fertig und lokal mit Cloudflares Laufzeit geprüft. GitHub, Cloudflare und die Google-Konten wurden nicht verändert. Die neuen Weiterleitungen werden mit dem unten beschriebenen Deployment aktiv.

## Kurzes Änderungsprotokoll

- In allen acht Website-Seiten insgesamt **121 alte Domain-Verweise** ersetzt: individuelle Canonicals, Open Graph, Twitter-Bilder sowie JSON-LD-URLs, Bilder, Unternehmens-/Website-IDs, Services und Breadcrumbs.
- `robots.txt` und `sitemap.xml` aus den tatsächlich abgerufenen, bereits manuell korrigierten Live-Dateien übernommen. Die Sitemap enthält exakt die fünf gewünschten URLs mit `.html` bei den Unterseiten.
- Interne Startseitenlinks von `index.html` auf `/` vereinheitlicht; Sprungmarken erhalten. Relative Bild-, CSS- und JS-Pfade bleiben intakt.
- Titel und Beschreibungen aller acht Seiten geprüft: individuell, zum Inhalt passend und mit den Social-/JSON-LD-Angaben konsistent. Deshalb inhaltlich unverändert.
- Doppelte Robots-Angabe auf `danke.html` entfernt; ein eindeutiger Eintrag `noindex, nofollow, noarchive` bleibt. Die Seite steht nicht in der Sitemap. Impressum und Datenschutz behalten ihre eigenen Canonicals und den bisherigen Indexierungsstatus, stehen aber nicht in der auf fünf Seiten begrenzten Sitemap.
- In der Datenschutzerklärung ausschließlich die sachliche Hosting-Domain aktualisiert. Keine rechtlichen Inhalte umgeschrieben.
- Cloudflare-Auslieferung ergänzt: `.html` direkt, alte Pfade ohne Endung per 301 auf die jeweilige `.html`-Seite, `index.html` auf `/`, alte Workers-Domain auf die neue Hauptdomain. Suchparameter wie `leistung`, UTM und `gclid` bleiben erhalten.
- Bestehende öffentliche Google-Bestätigungsdatei aus dem überprüften Repository ergänzt. Sie bleibt auch auf der alten Domain erreichbar.

**Erhalten:** Alle 47 Dateien der Ausgangs-ZIP sind enthalten. 37 davon sind bytegleich, darunter sämtliche Bilder, CSS, JavaScript und `_headers`. Formspree-ID, Formularfelder, GTM/GA4-IDs, Consent Mode v2, Cookie-Banner und Conversion-Logik wurden nicht verändert. Ergänzt wurden die Bestätigungsdatei, drei Cloudflare-Dateien und diese Anleitung.

## Warum die Cloudflare-Ergänzung erforderlich ist

Die Live-Prüfung ergab vor der Bearbeitung:

| Aufruf | Live-Verhalten am 04.11.2026 | Ziel nach Deployment |
| --- | --- | --- |
| `/` auf neuer Domain | 200 | 200 |
| Vier gewünschte `.html`-Unterseiten | 307 auf Pfad ohne `.html`, dann 200 | Direkt 200 auf `.html` |
| `index.html` | 307 auf `/` | 301 auf `/` |
| Alte Workers-Startseite | 200 ohne Domainweiterleitung | 301 auf neue Startseite |
| `www.genschel-automation.de/` | 301 auf Hauptdomain | Bestehende Weiterleitung beibehalten |
| Social-Bild und Logo | 200 | Unverändert |

Auf ausdrücklichen Nutzerwunsch bleibt `.html` die endgültige URL-Form. Cloudflares automatische HTML-Behandlung wurde dafür im Paket auf `none` gesetzt. Der Worker ordnet `/` der Datei `index.html` zu und führt die benötigten Weiterleitungen vor der Asset-Auslieferung aus. `run_worker_first: true` ist dafür erforderlich, damit auch bestehende Dateien auf dem alten Host umgeleitet werden. [Cloudflare: HTML-Behandlung](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [Worker vor Assets ausführen](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/).

Die alte Domain erscheint im ausgelieferten Website-HTML nicht mehr. Im neuen `migration-worker.mjs` steht sie einmal absichtlich als Quelle der Weiterleitung. Externe Formspree-, Google-, GitHub-Portfolio- und Video-Adressen wurden nicht als vermeintliche Domainaltlasten ersetzt. Beide Video-URLs lieferten bei der öffentlichen HEAD-Prüfung 200.

## In GitHub/Cloudflare übernehmen

1. ZIP entpacken. **Den Inhalt des Ordners `DG_Website_Pastell_v8`** in das Hauptverzeichnis des bestehenden Repositorys [genscheldenis-ops/denis-business-automation](https://github.com/genscheldenis-ops/denis-business-automation) übernehmen. Nicht die ZIP als einzelne Datei und nicht den äußeren Ordner als zusätzliche Unterebene hochladen. Vorhandene gleichnamige Dateien ersetzen; andere vorhandene Repository-Dateien nicht pauschal löschen.
2. Auch `migration-worker.mjs`, `wrangler.jsonc`, **`.assetsignore`** und `google85867acecd647a0a.html` übernehmen. `.assetsignore` ist unter macOS möglicherweise unsichtbar; mit ⌘⇧. anzeigen oder in GitHub ausdrücklich anlegen. Die Datei hält Konfiguration, Projektunterlagen und Arbeitsdateien aus den öffentlichen Assets heraus. [Cloudflare: Assets ausschließen](https://developers.cloudflare.com/workers/static-assets/binding/#ignoring-assets).
3. Im bestehenden Cloudflare-Worker **`denis-business-automation`** die Git-Anbindung an genau dieses Repository und Branch `main` kontrollieren. Projekt-/Arbeitsverzeichnis ist das Repository-Hauptverzeichnis. Kein Framework-Build erforderlich. Als Deployment-Befehl verwenden: `npx wrangler@4.157.0 deploy`. Diese Wrangler-Version wurde für die lokalen Prüfungen verwendet.
4. Die bestehende Custom Domain `genschel-automation.de`, die bestehende www-Weiterleitung und vorhandene Kontoeinstellungen beibehalten. In der neuen Datei sind absichtlich keine Konto-ID, Zugangsdaten oder DNS-Routen eingetragen. Die genaue bisherige Dashboard-Konfiguration war nicht einsehbar. Falls dort bisher zusätzlicher eigener Worker-Code, Bindings oder andere Deployment-Konfigurationen existieren, müssen sie vor dem Deployment mit der neuen Konfiguration zusammengeführt werden; in ZIP und öffentlichem Repository gab es solchen Code nicht.
5. Gesamte Änderung zusammen veröffentlichen: **nur HTML-Dateien hochzuladen reicht hier nicht**, weil das bisherige Routing die `.html`-URLs weiterhin weglenken würde. In Cloudflare den erfolgreichen Deployment-Status und den zugehörigen Git-Commit prüfen. Ein reiner statischer Datei-Upload ohne den Worker und seine Konfiguration setzt diese Routingänderung nicht um.
6. `workers.dev` aktiv lassen, damit der mitgelieferte Worker dort die 301-Weiterleitungen ausliefern kann. Die geprüfte www-Weiterleitung muss nicht neu angelegt werden.

Vor Veröffentlichung im Cloudflare-Dashboard die aktuelle Deployment-Version für einen möglichen Rollback notieren. Die Original-ZIP sichert die gelieferten Website-Dateien, enthält aber keine historischen Cloudflare-Kontoeinstellungen. Bei Problemen die vorherige Cloudflare-Version zurückrollen und anschließend die Ursache prüfen; eine reine Wiederherstellung der HTML-Dateien würde das Routing nicht zurücksetzen.

## Abgearbeitete Testliste

| Prüfung | Ergebnis |
| --- | --- |
| Ausgangs-ZIP gesichert und Dateibestand verglichen | Bestanden; keine Originaldatei fehlt |
| Alle acht Seiten: genau ein Self-Canonical, ein Head-Title, eine Description und eine H1 | Bestanden |
| Canonical, `og:url`, Social-Bilder und JSON-LD konsistent auf neuer Domain | Bestanden |
| Domainaltlasten in HTML, JS, CSS, XML und TXT | Keine; bewusste Ausnahme nur die Redirect-Quelle im Worker |
| Sitemap/XML, exakt fünf vorhandene indexierbare Zielseiten | Bestanden; identisch zur korrigierten Live-Sitemap, lokal nach neuer Routingregel jeweils direkt 200 |
| Robots-Direktiven und Danke-Seite mit `noindex` | Bestanden |
| JSON-LD in acht Seiten syntaktisch parsebar; Typen, IDs, Beziehungen und interne URL-/Bildziele geprüft | Bestanden |
| Interne Links und Anker, einschließlich lokaler Assets | 261 Verweise geprüft; keine fehlenden Ziele |
| Social-Vorschaubild | Vorhanden; tatsächliche Größe 1200 × 630 passt zu Metadaten |
| Sämtliche vorhandenen JS-/CSS-/Bilddateien, Formularfelder und eingebundene Skripte unverändert | Bestanden |
| Weiterleitungslogik, Pfade, Suchparameter, HEAD und unveränderte POST-Weitergabe | 72 automatisierte Fälle bestanden; Asset-Bindung dabei simuliert |
| Cloudflare lokal: direkte `.html`-Auslieferung, 301, echte 404, TXT/XML-Typen, Sicherheitsheader, Schutz der Konfigurationsdateien | Bestanden in Wrangler 4.157.0; 13 zusätzliche HTTP-Fälle |
| Alle acht Seiten im Browser | 200 auf vorgesehenem Pfad; keine erfassten JavaScript-Fehler oder defekten geladenen Bilder |
| Desktop 1440 × 1000 und Mobil 390 × 844 | Sichtprüfung bestanden; Vergleichsbilder der Startansicht pixelgleich zur Ausgangsversion; kein horizontaler Überlauf; Menü funktioniert |
| Ablehnung, GTM separat, Analytics separat, Widerruf | Bestanden mit simuliertem GTM-Consent-Callback; anfänglich kein GTM-Abruf, Ads-Signale bleiben denied |
| Formularfehler, erneuter Versuch und Erfolg | Bestanden mit simulierten Formspree-Antworten; Danke-Weiterleitung und genau ein lokales Erfolgsereignis; keine Wiederholung beim Neuladen |
| Formular ohne Tracking-Einwilligung, auch mobil | Bestanden; kein Lead-Tracking |
| Cloudflare-Deployment-Prüfung `deploy --dry-run` | Bestanden; keine Veröffentlichung vorgenommen |

**Prüfgrenzen:** Es wurde keine echte Formularnachricht versendet. Reale Zustellung, der veröffentlichte GTM-Container, GA4-/Ads-Eingänge und die Live-Auslieferung nach dem Upload bleiben zu prüfen. Die JSON-LD-Prüfung war lokal; kein Rich-Results-Ergebnis oder Google-Indexierungsstatus wird damit behauptet. Die bestehenden `ProfessionalService`, `WebSite`, `WebPage`, `Service` und `BreadcrumbList`-Daten wurden erhalten; es wurden keine Bewertungen oder sonstigen unbelegten Angaben hinzugefügt.

## Nach dem Deployment manuell abarbeiten

- [ ] **HTTP/SEO:** Alle fünf Sitemap-URLs direkt mit 200 erreichbar, ohne `.html`-Weiterleitung; Seitenquelltext zeigt jeweils genau die passende Canonical-URL. `/anfrage?leistung=crm&utm_source=test` führt mit 301 auf `/anfrage.html` und erhält beide Parameter. Alte Workers-Domain führt auf die passende neue Seite, nicht pauschal auf die Startseite. `/index.html` führt auf `/`. www und HTTPS prüfen. Eine unbekannte URL liefert 404. Kein unerwarteter `X-Robots-Tag: noindex` auf den fünf Zielseiten.
- [ ] **GSC:** Richtige Domain-Property auswählen. Bestehende Sitemap `https://genschel-automation.de/sitemap.xml` behalten und nach dem Deployment erneut abrufen/einreichen; keine zweite abweichende Sitemap erzeugen. Für die fünf Seiten URL-Prüfung/Live-Test verwenden und später die von Google gewählte Canonical kontrollieren. Nach Bedarf Indexierung anfragen und Indexierungsberichte beobachten. [Google: Website-Migration](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=de).
- [ ] **GSC-Adressänderung:** Wenn die alte Workers-Property existiert bzw. bestätigt werden kann, nach funktionierenden 301-Weiterleitungen die Adressänderung von der alten Domain zur neuen ausführen. Dafür müssen beide Properties demselben bestätigten Inhaber zugänglich sein. Für die reine www-Variante ist das Tool nicht vorgesehen. Die Google-Bestätigungsdatei erhalten. [Google: Tool zur Adressänderung](https://support.google.com/webmasters/answer/9370220?hl=de).
- [ ] **Strukturierte Daten:** Die veröffentlichten Seiten im [Schema Markup Validator](https://validator.schema.org/) und die relevanten Seiten im [Google Rich Results Test](https://search.google.com/test/rich-results) prüfen. Warnungen zu optionalen Feldern nicht durch erfundene Unternehmensdaten beseitigen.
- [ ] **GA4:** In der bestehenden Property unter Verwaltung → Datenstreams → Webstream → Streamdetails die Website-URL auf `https://genschel-automation.de/` aktualisieren. Mess-ID **`G-YE0DGMLGCS`** und die bisherige Property bleiben bestehen. Ereignisregeln, Hostname-/URL-Filter und ggf. Domainkonfigurationen auf die alte Domain prüfen. Nach Einwilligung in DebugView/Echtzeit die neue `page_location` und die erwarteten Ereignisse kontrollieren. [Google: Datenstream bearbeiten](https://support.google.com/analytics/answer/9304776?hl=de).
- [ ] **GTM/Consent:** Container **`GTM-WNJK44KV`** mit Tag Assistant auf der neuen Domain prüfen. Hostname-Trigger/Allowlisten anpassen, falls sie die alte Domain enthalten. Den vorhandenen Consent-Callback `DGConsentSubscribe`, Consent-Initialisierung sowie die zusätzliche Analytics-Einwilligungsprüfung kontrollieren. „Ablehnen“, nur GTM, Analytics, Widerruf und erneuter Seitenaufruf im echten Container durchspielen. Gespeicherte Einwilligungen werden nicht von der alten Domain übertragen.
- [ ] **Conversions:** Eine eigene gekennzeichnete Testanfrage nach dem Deployment absenden und Formspree-Eingang plus Benachrichtigung prüfen. Das bestehende Website-Ereignis heißt `dg_formspree_success`; dessen GTM-Zuordnung zum gewünschten GA4-Schlüsselereignis und ggf. Ads-Tag kontrollieren. Direktaufruf/Neuladen der Danke-Seite und fehlgeschlagene Anfragen dürfen keine zusätzliche Conversion auslösen. Den erfolgreichen Eingang nicht zugleich mehrfach als primäres Ziel zählen.
- [ ] **Google Ads:** Anzeigen-, Sitelink- und ggf. Keyword-Ziel-URLs auf die neuen direkten `.html`-Adressen umstellen. Trackingvorlagen, mobile URLs, URL-basierte Conversion-Regeln und ggf. Seitenfeeds/URL-Ausschlüsse prüfen. In der gelieferten Konfiguration sind Ads-ID und Conversion-Label leer; sie wurden bewusst nicht erfunden oder aktiviert. Vorhandene Ads-Einstellungen außerhalb der ZIP sind nicht eingesehen worden. [Google: URL-Änderungen](https://support.google.com/google-ads/editor/answer/47656?hl=en), [URL-basierte Conversions](https://support.google.com/google-ads/answer/12676738?hl=en).
- [ ] **Formspree und weitere Profile:** Falls im Formspree-Konto erlaubte Domains/Weiterleitungsziele gepflegt sind, die neue Domain eintragen. Form-ID **`mzeeeeag`** erhalten. Website-Links in Profilen, Verzeichnissen, E-Mail-Signatur und ggf. HubSpot-Einstellungen aktualisieren, soweit sie noch auf die alte Website verweisen. Funktionsfähige externe Portfolio- und Videoquellen bleiben bestehen.

Die Migration beseitigt technische Widersprüche. Indexierung, Rankings und Conversion-Zuwächse sind damit nicht garantiert.

## Geprüfte Seitentitel und Beschreibungen

Die folgenden Werte bleiben unverändert. Alle Seiten erhalten ihre eigene Canonical-URL unter `https://genschel-automation.de/`.

| Seite | Titel | Beschreibung |
| --- | --- | --- |
| `index.html` | Büroarbeit automatisieren \| Zeit sparen – Denis Genschel | Rechnungen, Kundenanfragen und wiederkehrende Büroarbeit automatisieren. Individuelle Lösungen für KMU, Praxisvideos und kostenloses Erstgespräch. |
| `anfrage.html` | Automatisierung unverbindlich anfragen \| Denis Genschel | Beschreiben Sie Ihren wiederkehrenden Geschäftsprozess. Kostenlose persönliche Ersteinschätzung zu Automatisierung, Aufwand und Umsetzung. |
| `crm-automatisieren.html` | CRM-Automatisierung & Kundenanfragen \| HubSpot, n8n | Kundenanfragen automatisch im CRM erfassen, Kontakte abgleichen und Folgeaufgaben vorbereiten. Individuelle CRM-Workflows für kleine und mittlere Unternehmen. |
| `danke.html` | Projektanfrage eingegangen \| Denis Genschel Business Automation | Ihre Projektanfrage wurde erfolgreich übermittelt. Vielen Dank für Ihr Interesse an einer individuellen Automatisierung. |
| `datenschutz.html` | Datenschutz \| Denis Genschel – Business Automation | Datenschutzhinweise zu Hosting, Kontaktformular, Projektvideos und dem einwilligungsabhängigen Google Tag Manager. |
| `impressum.html` | Impressum \| Denis Genschel – Business Automation | Anbieterkennzeichnung, Kontaktdaten und rechtliche Informationen von Denis Genschel – Business Automation. |
| `prozesse-automatisieren.html` | Geschäftsprozesse automatisieren lassen \| Make & n8n | Programme verbinden, Daten übertragen und Routineaufgaben automatisieren. Individuelle Make- und n8n-Workflows für Unternehmen inklusive Pilotprojekt. |
| `rechnungen-automatisieren.html` | Rechnungen automatisieren lassen \| KI & Make für KMU | Eingangsrechnungen erfassen, Daten prüfen und Belege automatisch ablegen. Individuelle Rechnungsautomatisierung mit Beispieldemo und unverbindlichem Pilot. |

## Sicherung und Herkunft

- Originaldatei: `DG_Website_Pastell_v8_ORIGINAL_Backup.zip`, bytegleich zum Anhang aus dem referenzierten Chat.
- SHA-256 Original: `79a411de84da8999dd5fd429496e47aed9f95c3fb87bd0870dc2acdd30c9a421`.
- Öffentliches Repository schreibgeschützt überprüft: `genscheldenis-ops/denis-business-automation`, Standardbranch `main`; kein Commit oder Push ausgeführt.
- `robots.txt` und `sitemap.xml` am 04.11.2026 live per HTTPS gelesen und bytegleich übernommen.
- Google-Bestätigungsdatei aus dem genannten Repository übernommen; in der gelieferten ZIP fehlte sie.
- API-, Konto- und Cloudflare-Dashboard-Einstellungen sind nicht Bestandteil der Ausgangs-ZIP. Das Paket enthält keine Zugangsdaten.
