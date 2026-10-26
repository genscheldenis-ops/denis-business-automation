(() => {
  'use strict';
  const cfg = window.BUSINESS_AUTOMATION_CONFIG || {};
  const menu = document.getElementById('menuBtn');
  const nav = document.getElementById('navLinks');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); }));
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Video only starts on a user's click; the image previews are local.
  const dlg = document.getElementById('videoDialog');
  const mount = document.getElementById('videoMount');
  document.querySelectorAll('[data-video]').forEach(el => el.addEventListener('click', () => {
    const src = el.dataset.video;
    if (!src || !/^https:\/\//.test(src)) return;
    const title = document.getElementById('videoTitle');
    if (title) title.textContent = el.dataset.title || 'Projekt-Demo';
    if (!mount) return;
    mount.replaceChildren();
    const video = document.createElement('video');
    video.controls = true; video.playsInline = true; video.preload = 'metadata';
    video.src = src; video.setAttribute('aria-label', el.dataset.title || 'Projektvideo');
    mount.append(video);
    if (typeof dlg?.showModal === 'function') { dlg.showModal(); video.play().catch(() => {}); }
    else window.open(src, '_blank', 'noopener');
  }));
  const close = () => { const video = mount?.querySelector('video'); if (video) { video.pause(); video.removeAttribute('src'); video.load(); } mount?.replaceChildren(); if (dlg?.open) dlg.close(); };
  dlg?.querySelector('.closeVideo')?.addEventListener('click', close);
  dlg?.addEventListener('click', e => { if (e.target === dlg) close(); });
  dlg?.addEventListener('close', () => mount?.replaceChildren());
  dlg?.addEventListener('cancel', () => { mount?.querySelector('video')?.pause(); });

  // Google Ads – advanced opt-in: two separate purposes, no tag/script before consent.
  // This is a lightweight custom consent interface, not a certified CMP.
  // It must be verified against the actual Google Ads account and applicable policies.
  const adsReady = /^AW-\d+$/.test(cfg.googleAdsId || '') && !!(cfg.googleAdsConversionLabel || '').trim();
  const consentKey = 'dg_business_privacy_v2';
  let preferences = null;
  try {
    const saved = JSON.parse(localStorage.getItem(consentKey) || 'null');
    if (saved && typeof saved.measurement === 'boolean' && typeof saved.remarketing === 'boolean') preferences = saved;
  } catch (_e) { /* local storage may be unavailable */ }
  let tagLoaded = false;
  let banner;
  const settingsButtons = document.querySelectorAll('[data-privacy-settings]');
  const hasTagConsent = () => !!(preferences?.measurement || preferences?.remarketing);
  function loadGoogleTag() {
    if (!adsReady || !hasTagConsent() || tagLoaded) return;
    tagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied'
    });
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: preferences.remarketing ? 'granted' : 'denied',
      analytics_storage: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', cfg.googleAdsId, { allow_ad_personalization_signals: !!preferences.remarketing });
    const script = document.createElement('script'); script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.googleAdsId);
    document.head.appendChild(script);
  }
  function storeConsent(measurement, remarketing) {
    preferences = { measurement: !!measurement, remarketing: !!remarketing, savedAt: Date.now() };
    try { localStorage.setItem(consentKey, JSON.stringify(preferences)); } catch (_e) {}
    banner?.remove(); banner = null;
    if (tagLoaded) {
      // Reinitialise for changed purposes. Previously set third-party cookies require
      // separate verification and deletion procedures for full withdrawal handling.
      location.reload();
    } else if (hasTagConsent()) loadGoogleTag();
  }
  function showConsent() {
    if (!adsReady) {
      // Ads tag is not configured; no optional cookies from this site are active.
      window.alert('Google-Ads-Tracking ist aktuell noch nicht verbunden. Es werden keine Google-Ads-Tags geladen.');
      return;
    }
    banner?.remove();
    banner = document.createElement('div'); banner.className = 'consent-banner';
    banner.setAttribute('role', 'region'); banner.setAttribute('aria-label', 'Datenschutzeinstellungen');
    banner.innerHTML = `<div><div class="consent-heading">Datenschutzeinstellungen</div><p>Wir nutzen Google Ads nur mit Ihrer freiwilligen Einwilligung. Die beiden Zwecke sind getrennt wählbar. Ohne Einwilligung funktionieren Website und Anfrageformular uneingeschränkt. <a href="datenschutz.html">Datenschutzerklärung</a></p><div class="consent-options"><label><input type="checkbox" data-consent-measurement> Google Ads: erfolgreiche Anfragen messen</label><label><input type="checkbox" data-consent-remarketing> Google Ads: Remarketing und personalisierte Werbung</label></div></div><div class="consent-actions"><button type="button" class="btn" data-consent-no>Alle ablehnen</button><button type="button" class="btn" data-consent-all>Alle akzeptieren</button><button type="button" class="btn" data-consent-save>Auswahl speichern</button></div>`;
    document.body.appendChild(banner);
    const m = banner.querySelector('[data-consent-measurement]');
    const r = banner.querySelector('[data-consent-remarketing]');
    m.checked = !!preferences?.measurement; r.checked = !!preferences?.remarketing;
    banner.querySelector('[data-consent-no]').addEventListener('click', () => storeConsent(false,false));
    banner.querySelector('[data-consent-all]').addEventListener('click', () => storeConsent(true,true));
    banner.querySelector('[data-consent-save]').addEventListener('click', () => storeConsent(m.checked,r.checked));
  }
  settingsButtons.forEach(btn => btn.addEventListener('click', showConsent));
  if (adsReady) {
    if (preferences === null) showConsent();
    else if (hasTagConsent()) loadGoogleTag();
  }


  // Client-side savings model only. No external calls and no guarantees.
  const calculator = document.getElementById('savingsCalculator');
  if (calculator) {
    const hours = calculator.querySelector('#hoursWeek');
    const rate = calculator.querySelector('#hourlyCost');
    const portion = calculator.querySelector('#shareAutomatable');
    const shareLabel = calculator.querySelector('#shareValue');
    const hoursOutput = calculator.querySelector('#savedHours');
    const monthOutput = calculator.querySelector('#savedMonth');
    const yearOutput = calculator.querySelector('#savedYear');
    const formatEuro = n => new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);
    const formatHours = n => new Intl.NumberFormat('de-DE', {maximumFractionDigits:1, minimumFractionDigits:1}).format(n);
    function updateSavings() {
      const h = Math.min(168,Math.max(0, Number(hours.value) || 0));
      const r = Math.min(500,Math.max(0, Number(rate.value) || 0));
      const share = Math.min(100,Math.max(0,Number(portion.value) || 0));
      const monthlyHours = h * share / 100 * (52 / 12);
      shareLabel.textContent = share + ' %';
      hoursOutput.textContent = formatHours(monthlyHours) + ' Std.';
      monthOutput.textContent = formatEuro(monthlyHours * r);
      yearOutput.textContent = formatEuro(h * share / 100 * 52 * r);
    }
    [hours,rate,portion].forEach(input => input.addEventListener('input', updateSavings));
    updateSavings();
  }

  // Contact form submits by HTTPS to Formspree; a server-accepted response is required.
  const form = document.getElementById('leadForm');
  if (form) {
    const chosen = new URLSearchParams(location.search).get('leistung');
    if (chosen) { const select = form.elements.namedItem('leistung'); if (select && [...select.options].some(o => o.value === chosen)) select.value = chosen; }
    const submit = document.getElementById('leadSubmit');
    const message = document.getElementById('formMessage');
    let sending = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;
      const id = (cfg.formspreeId || '').trim();
      if (!/^[a-zA-Z0-9]{5,30}$/.test(id) || id === 'FORM_ID_EINTRAGEN') {
        message.textContent = 'Das Formular ist noch nicht mit dem Versanddienst verbunden. Bitte schreiben Sie direkt an genschel.denis@gmail.com.';
        message.className = 'form-message error'; return;
      }
      if (form.elements.namedItem('_gotcha')?.value) return;
      sending = true; submit.disabled = true; submit.textContent = 'Anfrage wird gesendet …';
      message.textContent = 'Bitte einen Moment – Ihre Anfrage wird sicher übermittelt.'; message.className = 'form-message';
      try {
        const res = await fetch('https://formspree.io/f/' + id, {
          method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' }
        });
        let json = {};
        try { json = await res.json(); } catch (_e) { /* formspree response may be empty */ }
        if (!res.ok) {
          const detail = Array.isArray(json.errors) ? json.errors.map(x => x.message).filter(Boolean).join(' ') : '';
          throw new Error(detail || 'Übermittlung nicht möglich. Bitte prüfen Sie Ihre Angaben oder versuchen Sie es später erneut.');
        }
        // A temporary same-tab marker prevents direct visits to danke.html being counted as leads.
        try { sessionStorage.setItem('dg_form_sent_once', String(Date.now())); } catch (_e) { /* browser storage disabled */ }
        location.assign('danke.html');
      } catch (err) {
        message.textContent = 'Die Anfrage konnte nicht bestätigt werden: ' + (err?.message || 'Verbindungsfehler') + ' Alternativ erreichen Sie mich unter genschel.denis@gmail.com.';
        message.className = 'form-message error';
        sending = false; submit.disabled = false; submit.textContent = 'Kostenlose Einschätzung anfordern →';
      }
    });
  }

  // One conversion per valid success redirect (and only with advertising opt-in).
  if (location.pathname.endsWith('/danke.html') || location.pathname.endsWith('danke.html')) {
    let sentAt = 0;
    try { sentAt = Number(sessionStorage.getItem('dg_form_sent_once') || 0); sessionStorage.removeItem('dg_form_sent_once'); } catch (_e) { /* storage disabled */ }
    if (sentAt && (Date.now() - sentAt < 120000) && adsReady && !!preferences?.measurement) {
      loadGoogleTag();
      window.gtag?.('event', 'conversion', { send_to: cfg.googleAdsId + '/' + cfg.googleAdsConversionLabel });
    }
  }
})();
