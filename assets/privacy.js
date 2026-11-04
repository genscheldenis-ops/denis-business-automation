/* Basic Consent Mode v2: GTM loads only after consent to statistics or marketing.
   Analytics, advertising measurement and personalized advertising are distinct purposes.
   The existing GTM consent template MUST call DGConsentSubscribe and use the
   GTM APIs setDefaultConsentState/updateConsentState. GA4 tags MUST require
   analytics_storage additionally; advertising tags must respect ad consent.
   No Google Ads tag/ID is invented or injected by this script. */
(() => {
  'use strict';
  if (window.DGPrivacy) return;
  const cfg = window.BUSINESS_AUTOMATION_CONFIG || {};
  const gtmConfigured = /^GTM-[A-Z0-9]+$/.test(cfg.gtmContainerId || '');
  const adsConfigured = /^AW-\d{7,}$/.test(cfg.googleAdsId || '');
  const conversionReady = adsConfigured && /^[A-Za-z0-9_-]{5,}$/.test(cfg.googleAdsConversionLabel || '');
  const analyticsConfigured = /^G-[A-Z0-9]{6,}$/.test(cfg.ga4MeasurementId || '');
  // New purposes: deliberately do not adopt the former v5 consent silently.
  const consentKey = 'dg_business_privacy_v6';
  const pendingKey = 'dg_verified_lead_v6';
  const ttl = 180 * 24 * 60 * 60 * 1000;
  const denied = Object.freeze({ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied'});
  let loaded = false;
  let consentReady = false;
  let leadConsumed = false;
  let banner = null;
  let preferences = null;
  const listeners = [];
  const buttons = document.querySelectorAll('[data-privacy-settings]');

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(consentKey) || 'null');
      if (saved && saved.version === 6 && saved.container === cfg.gtmContainerId &&
          ['analytics','marketing','personalization'].every(k => typeof saved[k] === 'boolean') &&
          (!saved.personalization || saved.marketing) &&
          Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < ttl) return saved;
      localStorage.removeItem(consentKey);
    } catch (_e) { /* Storage unavailable: no retained consent. */ }
    return null;
  }
  preferences = readConsent();
  try {
    ['dg_business_privacy_v3','dg_business_privacy_v4','dg_business_privacy_v5'].forEach(k => localStorage.removeItem(k));
    ['dg_verified_lead_v3','dg_verified_lead_v4','dg_verified_lead_v5'].forEach(k => sessionStorage.removeItem(k));
  } catch (_e) {}
  const permitsGTM = () => !!(gtmConfigured && (preferences?.analytics || preferences?.marketing));
  const allowsAnalytics = () => !!(permitsGTM() && analyticsConfigured && preferences.analytics);
  const allowsMeasurement = () => !!(permitsGTM() && conversionReady && preferences.marketing);
  const payload = () => ({
    analytics_storage: allowsAnalytics() ? 'granted' : 'denied',
    ad_storage: permitsGTM() && preferences.marketing ? 'granted' : 'denied',
    ad_user_data: permitsGTM() && preferences.marketing ? 'granted' : 'denied',
    ad_personalization: permitsGTM() && preferences.marketing && preferences.personalization ? 'granted' : 'denied'
  });
  function clearPending() { try { sessionStorage.removeItem(pendingKey); } catch (_e) {} }

  function finishLead() {
    if (document.body.dataset.dgPage !== 'danke' || leadConsumed) return;
    let pending = null;
    try { pending = JSON.parse(sessionStorage.getItem(pendingKey) || 'null'); } catch (_e) {}
    if (!pending) return;
    if (JSON.stringify(readConsent()) !== JSON.stringify(preferences)) { clearPending(); return; }
    if (typeof pending.id !== 'string' || !/^[a-zA-Z0-9-]{10,80}$/.test(pending.id) ||
        !Number.isFinite(pending.time) || pending.time > Date.now() || Date.now() - pending.time >= 180000 ||
        !((allowsMeasurement() && pending.measurement === true) || (allowsAnalytics() && pending.analytics === true))) {
      clearPending(); return;
    }
    if (!consentReady) return;
    try {
      sessionStorage.removeItem(pendingKey);
      if (sessionStorage.getItem(pendingKey) !== null) return;
    } catch (_e) { return; }
    leadConsumed = true;
    // Data layer contains neither names nor contact-form content.
    window.dataLayer.push({event:'dg_formspree_success', form_id:'projektanfrage', transaction_id:pending.id,
      dg_ads_measurement: allowsMeasurement() && pending.measurement === true,
      dg_analytics: allowsAnalytics() && pending.analytics === true});
  }

  // Existing GTM Consent Mode v2 template subscribes with callInWindow.
  window.DGConsentSubscribe = function (callback) {
    if (typeof callback !== 'function') return;
    listeners.push(callback);
    callback(payload());
    consentReady = true;
    setTimeout(finishLead, 0);
  };
  function loadGTM() {
    if (!permitsGTM() || loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    // Defensive state: the GTM template is authoritative and uses its consent APIs.
    function queue() { window.dataLayer.push(arguments); }
    queue('consent', 'default', {...denied});
    queue('set', 'ads_data_redaction', true);
    queue('set', 'url_passthrough', false);
    window.dataLayer.push({'gtm.start': Date.now(), event:'gtm.js'});
    const script = document.createElement('script');
    script.async = true;
    script.dataset.dgGtm = 'true';
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(cfg.gtmContainerId);
    document.head.appendChild(script);
  }
  function clearGoogleCookies() {
    const domains = location.hostname.split('.');
    const paths = location.pathname.split('/');
    const cookiePaths = new Set(['/']);
    while (paths.length > 1) { paths.pop(); cookiePaths.add(paths.join('/') || '/'); cookiePaths.add((paths.join('/') || '') + '/'); }
    document.cookie.split(';').forEach(part => {
      const name = part.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_gcl_|_gac_)/.test(name)) return;
      cookiePaths.forEach(path => {
        const expired = name + '=; Max-Age=0; path=' + path + '; SameSite=Lax';
        document.cookie = expired;
        for (let i = 0; i < domains.length - 1; i++) document.cookie = expired + '; domain=' + domains.slice(i).join('.');
      });
    });
  }
  function storeConsent(analytics, marketing, personalization) {
    const previous = payload();
    const wasLoaded = loaded;
    preferences = {version:6, container:cfg.gtmContainerId,
      analytics:!!analytics && analyticsConfigured,
      marketing:!!marketing && gtmConfigured,
      personalization:!!personalization && !!marketing && gtmConfigured,
      savedAt:Date.now()};
    try { localStorage.setItem(consentKey, JSON.stringify(preferences)); } catch (_e) {
      try { localStorage.removeItem(consentKey); } catch (_ignored) {}
    }
    banner?.remove(); banner = null;
    const current = payload();
    const reduced = Object.keys(previous).some(k => previous[k] === 'granted' && current[k] === 'denied');
    listeners.forEach(callback => { try { callback(current); } catch (_e) {} });
    if (reduced) { clearPending(); clearGoogleCookies(); }
    // Reload when a previously running tag changes permission; GTM initialization
    // triggers otherwise won't automatically fire on a newly granted purpose.
    const newlyGranted = Object.keys(previous).some(k => previous[k] === 'denied' && current[k] === 'granted');
    if (wasLoaded && (reduced || newlyGranted || !permitsGTM())) { location.reload(); return; }
    if (!permitsGTM()) clearPending();
    loadGTM(); finishLead();
  }
  function showConsent() {
    if (!gtmConfigured) return;
    banner?.remove();
    banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Datenschutzeinstellungen');
    banner.innerHTML = `<div class="consent-content"><div class="consent-heading">Datenschutzeinstellungen</div>
      <p>Notwendige Funktionen (Seitenaufruf, Sicherheit, Anfrageformular) sind immer aktiv. Statistik und Marketing sind freiwillig und zunächst deaktiviert. Erst nach Ihrer Zustimmung wird Google Tag Manager für die gewählten Zwecke geladen. Dabei können technische Verbindungsdaten an Google übermittelt und in den USA verarbeitet werden. Ihre Auswahl können Sie jederzeit unter „Tracking-Einstellungen“ ändern. <a href="datenschutz.html">Datenschutzerklärung</a></p>
      <div class="consent-options">
        <div class="consent-option consent-required"><strong>Notwendig</strong><small>Website und Kontaktformular – immer aktiv</small></div>
        <label class="consent-option"><input type="checkbox" data-consent-analytics><span><strong>Statistik (Google Analytics 4)</strong><small>Besuche und bestätigte Projektanfragen auswerten</small></span></label>
        <label class="consent-option"><input type="checkbox" data-consent-marketing><span><strong>Marketing (Google Ads)</strong><small>Einwilligung für Werbemessung und Zuordnung von Anzeigenklicks</small></span></label>
        <label class="consent-option"><input type="checkbox" data-consent-personalization><span><strong>Personalisierte Werbung</strong><small>Zusätzliches Einverständnis für Remarketing und personalisierte Anzeigen</small></span></label>
      </div></div><div class="consent-actions"><button type="button" class="btn" data-consent-no>Alle ablehnen</button><button type="button" class="btn" data-consent-all>Alle akzeptieren</button><button type="button" class="btn" data-consent-save>Auswahl speichern</button></div>`;
    document.body.appendChild(banner);
    const a = banner.querySelector('[data-consent-analytics]');
    const m = banner.querySelector('[data-consent-marketing]');
    const p = banner.querySelector('[data-consent-personalization]');
    a.checked = !!preferences?.analytics;
    m.checked = !!preferences?.marketing;
    p.checked = !!preferences?.personalization;
    m.addEventListener('change', () => { if (!m.checked) p.checked = false; });
    p.addEventListener('change', () => { if (p.checked) m.checked = true; });
    banner.querySelector('[data-consent-no]').addEventListener('click', () => storeConsent(false,false,false));
    banner.querySelector('[data-consent-all]').addEventListener('click', () => storeConsent(true,true,true));
    banner.querySelector('[data-consent-save]').addEventListener('click', () => storeConsent(a.checked,m.checked,p.checked));
  }
  window.DGPrivacy = Object.freeze({
    // Called only after an HTTP-successful Formspree POST in app.js.
    recordLead() {
      clearPending();
      if (!allowsMeasurement() && !allowsAnalytics()) return;
      if (JSON.stringify(readConsent()) !== JSON.stringify(preferences)) return;
      const receipt = {id:window.crypto?.randomUUID?.() || 'dg-'+Date.now()+'-'+Math.random().toString(36).slice(2),
        time:Date.now(), measurement:allowsMeasurement(), analytics:allowsAnalytics()};
      try { sessionStorage.setItem(pendingKey,JSON.stringify(receipt)); } catch (_e) {}
    }
  });
  buttons.forEach(button => { button.hidden = !gtmConfigured; button.addEventListener('click', showConsent); });
  window.addEventListener('storage', event => {
    if (event.key === consentKey || event.key === null) location.reload();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && JSON.stringify(readConsent()) !== JSON.stringify(preferences)) location.reload();
  });
  if (gtmConfigured) { if (preferences === null) showConsent(); else loadGTM(); }
  finishLead();
})();
