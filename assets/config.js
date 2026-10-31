/* EINMALIG KONFIGURIEREN – siehe DOKUMENTATION/01_UPLOAD_UND_FREISCHALTUNG.md im ZIP
   Diese Kennungen sind oeffentliche Website-Konfiguration, keine geheimen API-Schluessel.
   Formspree: Konto erstellen, E-Mail-Empfang verifizieren und Formular-ID kopieren.
   Google Ads: Konto-ID (AW-...) und Conversion-Label (nur aus Google Ads) eintragen.
   Optional GA4: Measurement-ID (G-...) nach Einrichtung der Property.
   Kein Google Tag laedt ohne aktive Einwilligung.
*/
window.BUSINESS_AUTOMATION_CONFIG = Object.freeze({
  formspreeId: "mzeeeeag",
  googleAdsId: "",                   // z.B. "AW-123456789", erst nach Consent geladen
  googleAdsConversionLabel: "",      // aus der Google Ads Conversion-Aktion
  ga4MeasurementId: ""                 // optional G-XXXXXXXXXX, aus Google Analytics 4
});
