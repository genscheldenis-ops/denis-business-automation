# Consent Mode v2 – Aktualisierung vom 04.11.2026

Diese Version basiert auf `DG_Website_Pastell_v8_SEO_genschel-automation_2026-11-04(1).zip`.

## Geänderte Dateien

- `assets/privacy.js`: Consent-Auswahl v6 mit Statistik, Marketing und optional personalisierter Werbung, widerrufbar. Google Tag Manager wird nur für zugestimmte Zwecke geladen. Das vorhandene Formspree-Erfolgsereignis und die GA4-Integration bleiben bestehen.
- `assets/style.css`: Darstellung der getrennten Einwilligungsoptionen für Desktop und Mobilgeräte.
- `datenschutz.html`: Beschreibung der neuen Zwecke, Wahlmöglichkeiten und Grenzen der derzeitigen Google-Ads-Einrichtung.
- Alle acht HTML-Seiten: Versionsparameter für die aktualisierten JS-/CSS-Dateien geändert, damit Browser nicht alte Cookie-Banner aus dem Cache anzeigen.

Robots, Sitemap, Canonical-URLs, strukturierte Daten, Formspree-ID, GTM-/GA4-IDs und Cloudflare-Routing sind unverändert.

## Veröffentlichung über GitHub

1. ZIP entpacken.
2. Die **Dateien und Ordner aus der ZIP direkt** in das Wurzelverzeichnis des bestehenden GitHub-Repositories `genscheldenis-ops/denis-business-automation` hochladen. Die Ordnerstruktur (`assets/`) beibehalten; bestehende gleichnamige Dateien **ersetzen**. Keine zweite verschachtelte Website-Unterstruktur anlegen.
3. Commit durchführen und in Cloudflare Workers & Pages überprüfen, ob die neue Produktionsbereitstellung erfolgreich ist. Die Website wurde durch dieses ZIP **nicht automatisch veröffentlicht**.
4. Nach dem Upload `https://genschel-automation.de/` öffnen. Da sich die Einwilligungszwecke geändert haben, wird vorheriger Consent v5 nicht übernommen; der Banner muss bei alten Besuchern einmal neu erscheinen.

## Live-Tests (mit Tag Assistant / GTM-Vorschau)

1. Neue Browsersitzung / neue Einwilligung: Vor Auswahl kein GTM-Aufruf; alle vier Consent-Werte sind sinngemäß abgelehnt.
2. **Alle ablehnen**: kein GTM-Aufruf und keine Google-Messcookies; auf Unterseiten bleibt die Ablehnung gespeichert.
3. **Nur Statistik**: `analytics_storage = granted`; `ad_storage`, `ad_user_data`, `ad_personalization = denied`.
4. **Nur Marketing**: `analytics_storage = denied`; `ad_storage` und `ad_user_data = granted`; `ad_personalization = denied`. Da derzeit keine direkte Ads-ID bzw. kein Label hinterlegt ist, wird damit **kein eigenständiger Google-Ads-Tag** aktiviert.
5. **Marketing + personalisierte Werbung**: Die drei `ad_*`-Werte sind `granted`, Analytics bleibt ohne Statistik-Auswahl `denied`.
6. **Alle akzeptieren**: Alle vier Werte sind `granted`.
7. **Widerruf** über „Tracking-Einstellungen“: alle Werte wieder `denied`; laufende GTM-Einbindung endet nach Reload, zugängliche Google-Messcookies werden entfernt.
8. **Formular-Test** mit Statistik-Einwilligung: Nur nach erfolgreicher Formspree-Antwort `dg_formspree_success` -> GA4 `generate_lead` auf der Danke-Seite; kein Doppelereignis beim Neuladen.
9. **Formular-Test** ohne Statistik/Marketing: Formular bleibt nutzbar, es wird kein Lead-Tracking ausgelöst.

## Wichtige Grenze

Die automatisierten Tests haben den von der bestehenden GTM-Consent-Vorlage erwarteten Callback `DGConsentSubscribe` **simuliert**. Die echte GTM-Containerkonfiguration kann nur im Tag Assistant geprüft werden. Zusätzlich müssen GA4-/Google-Ads-Tags die passenden zusätzlichen Consent-Prüfungen besitzen; das Veröffentlichen dieser Dateien allein ändert keine Einstellungen im GTM-Konto. Die GA4-Conversion ist bereits über Google Ads importiert; ein separates direktes Ads-Conversion-Tag mit AW-ID/Label ist in `assets/config.js` **nicht hinterlegt** und wird bewusst nicht erfunden. Google Ads kann Conversions nur korrekt verwenden, soweit Tracking, Kontoverknüpfung und Einwilligungen das zulassen.

Die Datenschutzerklärung ist ein technischer Entwurf anhand der verfügbaren Website-Konfiguration und ersetzt keine rechtliche Prüfung.
