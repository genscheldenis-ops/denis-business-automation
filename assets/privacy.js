/* Shared consent gate: GTM loads only after opt-in; GA4 requires separate consent.
   Google tags are managed exclusively in GTM, not directly via gtag.js.
   In GTM the GA4 Google tag MUST require analytics_storage as an additional consent. */
(() => {
  'use strict';
  if (window.DGPrivacy) return;
  const cfg = window.BUSINESS_AUTOMATION_CONFIG || {};
  const gtmConfigured = /^GTM-[A-Z0-9]+$/.test(cfg.gtmContainerId || '');
  const adsConfigured = /^AW-\d{7,}$/.test(cfg.googleAdsId || '');
  const conversionReady = adsConfigured && /^[A-Za-z0-9_-]{5,}$/.test(cfg.googleAdsConversionLabel || '');
  const analyticsConfigured = /^G-[A-Z0-9]{6,}$/.test(cfg.ga4MeasurementId || '');
  const consentKey = 'dg_business_privacy_v5';
  const pendingKey = 'dg_verified_lead_v5';
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
      if (saved && saved.version === 5 && saved.container === cfg.gtmContainerId &&
          ['tagManager','measurement','remarketing','analytics'].every(k => typeof saved[k] === 'boolean') &&
          Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < ttl) return saved;
      localStorage.removeItem(consentKey);
    } catch (_e) { /* No storage means no remembered consent. */ }
    return null;
  }
  preferences = readConsent();
  // New analytics purpose requires fresh, explicit selection. No v4 consent is inherited.
  try {
    localStorage.removeItem('dg_business_privacy_v3');
    localStorage.removeItem('dg_business_privacy_v4');
    sessionStorage.removeItem('dg_verified_lead_v3');
    sessionStorage.removeItem('dg_verified_lead_v4');
  } catch (_e) {}
  const allowsMeasurement = () => !!(preferences?.tagManager && conversionReady && preferences.measurement);
  const allowsAnalytics = () => !!(preferences?.tagManager && analyticsConfigured && preferences.analytics);
  const payload = () => ({
    ad_storage: preferences?.tagManager && adsConfigured && (allowsMeasurement() || preferences.remarketing) ? 'granted':'denied',
    ad_user_data: preferences?.tagManager && adsConfigured && (allowsMeasurement() || preferences.remarketing) ? 'granted':'denied',
    ad_personalization: preferences?.tagManager && adsConfigured && preferences.remarketing ? 'granted':'denied',
    analytics_storage: allowsAnalytics() ? 'granted':'denied'
  });
  function clearPending() { try { sessionStorage.removeItem(pendingKey); } catch (_e) {} }

  function finishLead() {
    if (document.body.dataset.dgPage !== 'danke' || leadConsumed) return;
    let pending = null;
    try { pending = JSON.parse(sessionStorage.getItem(pendingKey) || 'null'); } catch (_e) {}
    if (!pending) return;
    // Recheck saved consent before dispatch, including withdrawal in another tab.
    if (JSON.stringify(readConsent()) !== JSON.stringify(preferences)) {
      clearPending(); return;
    }
    if (typeof pending.id !== 'string' || !/^[a-zA-Z0-9-]{10,80}$/.test(pending.id) ||
        !Number.isFinite(pending.time) || pending.time > Date.now() || Date.now() - pending.time >= 180000 ||
        !(allowsMeasurement() && pending.measurement === true || allowsAnalytics() && pending.analytics === true)) {
      clearPending(); return;
    }
    if (!consentReady) return; // Never fire before GTM's consent template has run.
    // Consume before push. If storage cannot be updated, do not risk duplicate events.
    try {
      sessionStorage.removeItem(pendingKey);
      if (sessionStorage.getItem(pendingKey) !== null) return;
    } catch (_e) { return; }
    leadConsumed = true;
    // Only the verified receipt from recordLead can reach this event. No form data.
    window.dataLayer.push({event:'dg_formspree_success', form_id:'projektanfrage', transaction_id:pending.id,
      dg_ads_measurement: allowsMeasurement() && pending.measurement === true,
      dg_analytics: allowsAnalytics() && pending.analytics === true});
  }

  // Called by the sandboxed GTM template using callInWindow. Its callback uses
  // setDefaultConsentState/updateConsentState, not a queued gtag consent update.
  window.DGConsentSubscribe = function (callback) {
    if (typeof callback !== 'function') return;
    listeners.push(callback);
    callback(payload());
    consentReady = true;
    setTimeout(finishLead, 0);
  };
  function loadGTM() {
    if (!gtmConfigured || !preferences?.tagManager || loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    // Defensive default before gtm.start. The supplied GTM template establishes
    // the authoritative state through Google's GTM consent APIs.
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
  function storeConsent(tagManager, measurement, remarketing, analytics) {
    const previous = preferences;
    const before = payload();
    preferences = {version:5, container:cfg.gtmContainerId,
      tagManager:!!tagManager && gtmConfigured,
      measurement:!!tagManager && !!measurement && conversionReady,
      remarketing:!!tagManager && !!remarketing && adsConfigured,
      analytics:!!tagManager && !!analytics && analyticsConfigured, savedAt:Date.now()};
    try { localStorage.setItem(consentKey, JSON.stringify(preferences)); } catch (_e) {
      try { localStorage.removeItem(consentKey); } catch (_ignored) {}
    }
    banner?.remove(); banner = null;
    const current = payload();
    const reduced = previous?.tagManager && !preferences.tagManager || Object.keys(before).some(k => before[k] === 'granted' && current[k] === 'denied');
    listeners.forEach(callback => { try { callback(current); } catch (_e) {} });
    if (reduced) { clearPending(); clearGoogleCookies(); }
    // A Google-Tag with an Initialization trigger will not automatically fire
    // when analytics consent is granted after GTM has already initialized.
    // Reload on newly granted purpose as well as on withdrawal, but only when
    // GTM was actually running; stored preferences are applied on the next load.
    const newlyGranted = Object.keys(before).some(k => before[k] === 'denied' && current[k] === 'granted');
    if (loaded && (reduced || newlyGranted)) { location.reload(); return; }
    if (!preferences.tagManager) clearPending();
    loadGTM(); finishLead();
  }
  function showConsent() {
    if (!gtmConfigured) return;
    banner?.remove();
    banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role','region');
    banner.setAttribute('aria-label','Datenschutzeinstellungen');
    const options = ['<label><input type="checkbox" data-consent-gtm> Google Tag Manager: technische Tag-Verwaltung laden</label>'];
    if (conversionReady) options.push('<label><input type="checkbox" data-consent-measurement> Google Ads: bestätigte Projektanfragen messen</label>');
    if (adsConfigured) options.push('<label><input type="checkbox" data-consent-remarketing> Google Ads: Remarketing und personalisierte Werbung</label>');
    if (analyticsConfigured) options.push('<label><input type="checkbox" data-consent-analytics> Google Analytics 4: Website-Nutzung statistisch auswerten</label>');
    const inactive = !adsConfigured && !analyticsConfigured ? ' Anzeigenmessung, Remarketing und Google Analytics sind derzeit nicht aktiviert.' : '';
    banner.innerHTML = `<div><div class="consent-heading">Datenschutzeinstellungen</div><p>Mit Ihrer Zustimmung wird Google Tag Manager von Google Ireland geladen. Dabei werden Ihre IP-Adresse und technische Verbindungsdaten an Google übermittelt; eine Verarbeitung in den USA ist möglich.${inactive} Google Analytics wird nur nach zusätzlicher Zustimmung aktiviert. Das Kontaktformular funktioniert ohne Zustimmung. Ihre Auswahl ist jederzeit über „Tracking-Einstellungen“ widerrufbar. <a href="datenschutz.html">Datenschutzerklärung</a></p><div class="consent-options">${options.join('')}</div></div><div class="consent-actions"><button type="button" class="btn" data-consent-no>Alle ablehnen</button><button type="button" class="btn" data-consent-all>Alle akzeptieren</button><button type="button" class="btn" data-consent-save>Auswahl speichern</button></div>`;
    document.body.appendChild(banner);
    const t = banner.querySelector('[data-consent-gtm]');
    const m = banner.querySelector('[data-consent-measurement]');
    const r = banner.querySelector('[data-consent-remarketing]');
    const a = banner.querySelector('[data-consent-analytics]');
    t.checked = !!preferences?.tagManager;
    if (m) m.checked = !!preferences?.measurement;
    if (r) r.checked = !!preferences?.remarketing;
    if (a) a.checked = !!preferences?.analytics;
    [m,r,a].filter(Boolean).forEach(input => input.addEventListener('change', () => { if (input.checked) t.checked = true; }));
    t.addEventListener('change', () => { if (!t.checked) [m,r,a].filter(Boolean).forEach(input => { input.checked = false; }); });
    banner.querySelector('[data-consent-no]').addEventListener('click', () => storeConsent(false,false,false,false));
    banner.querySelector('[data-consent-all]').addEventListener('click', () => storeConsent(true,!!m,!!r,!!a));
    banner.querySelector('[data-consent-save]').addEventListener('click', () => storeConsent(t.checked,m?.checked,r?.checked,a?.checked));
  }
  window.DGPrivacy = Object.freeze({
    // A successful Formspree response is the only production caller.
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
  // Synchronize withdrawal in other tabs and restore-from-back-cache navigation.
  window.addEventListener('storage', event => {
    if (event.key === consentKey || event.key === null) location.reload();
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && JSON.stringify(readConsent()) !== JSON.stringify(preferences)) location.reload();
  });
  if (gtmConfigured) { if (preferences === null) showConsent(); else loadGTM(); }
  finishLead();
})();
