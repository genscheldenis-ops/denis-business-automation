(() => {
  'use strict';
  const cfg = window.BUSINESS_AUTOMATION_CONFIG || {};
  const menu = document.getElementById('menuBtn');
  const nav = document.getElementById('navLinks');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); }));
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());


  // Scroll-tied desktop-to-automation visual, no outside libraries or tracking.
  const story = document.querySelector('.scroll-story');
  if (story) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const navEl = document.querySelector('.nav-wrap');
    let tick = 0;
    function renderStory() {
      tick = 0;
      if (mq.matches) { story.style.setProperty('--story-progress', '1'); return; }
      const navHeight = navEl ? Math.round(navEl.getBoundingClientRect().height) : 78;
      story.style.setProperty('--story-nav-height', navHeight + 'px');
      const bounds = story.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - (window.innerHeight - navHeight));
      const progress = Math.max(0, Math.min(1, -bounds.top / travel));
      story.style.setProperty('--story-progress', progress.toFixed(4));
    }
    function queueStory() { if (!tick) tick = requestAnimationFrame(renderStory); }
    window.addEventListener('scroll', queueStory, {passive:true});
    window.addEventListener('resize', queueStory, {passive:true});
    mq.addEventListener?.('change', queueStory);
    queueStory();
  }

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

  // Privacy-first Basic Consent Mode v2: no Google scripts or network requests before opt-in.
  // Actual Ads/GA4 account identifiers are supplied separately in assets/config.js.
  const adsConfigured = /^AW-\d{7,}$/.test(cfg.googleAdsId || '');
  const conversionReady = adsConfigured && /^[A-Za-z0-9_-]{5,}$/.test(cfg.googleAdsConversionLabel || '');
  const analyticsConfigured = /^G-[A-Z0-9]{6,}$/.test(cfg.ga4MeasurementId || '');
  const privacyServicesConfigured = adsConfigured || analyticsConfigured;
  const consentKey = 'dg_business_privacy_v3';
  let preferences = null;
  try {
    const saved = JSON.parse(localStorage.getItem(consentKey) || 'null');
    if (saved && typeof saved.measurement === 'boolean' && typeof saved.remarketing === 'boolean' && typeof saved.analytics === 'boolean') {
      preferences = saved;
    }
  } catch (_e) { /* storage blocked */ }

  let tagLoaded = false;
  let adsTagged = false;
  let gaTagged = false;
  let consentBanner = null;
  const settingsButtons = document.querySelectorAll('[data-privacy-settings]');
  const anyConsent = () => !!(preferences && (
    (adsConfigured && (preferences.measurement || preferences.remarketing)) ||
    (analyticsConfigured && preferences.analytics)
  ));
  const consentPayload = () => ({
    ad_storage: adsConfigured && (preferences?.measurement || preferences?.remarketing) ? 'granted':'denied',
    ad_user_data: adsConfigured && (preferences?.measurement || preferences?.remarketing) ? 'granted':'denied',
    ad_personalization: adsConfigured && preferences?.remarketing ? 'granted':'denied',
    analytics_storage: analyticsConfigured && preferences?.analytics ? 'granted':'denied'
  });
  function ensureGtag() {
    if (!privacyServicesConfigured || !anyConsent()) return;
    if (!tagLoaded) {
      tagLoaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {
        ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied'
      });
      window.gtag('consent', 'update', consentPayload());
      window.gtag('js', new Date());
      const tag = document.createElement('script');
      tag.async = true; tag.dataset.dgGoogleTag = 'true';
      tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(adsConfigured ? cfg.googleAdsId : cfg.ga4MeasurementId);
      document.head.appendChild(tag);
    } else {
      window.gtag?.('consent', 'update', consentPayload());
    }
    if (adsConfigured && (preferences?.measurement || preferences?.remarketing) && !adsTagged) {
      adsTagged = true;
      window.gtag?.('config', cfg.googleAdsId, { allow_ad_personalization_signals:!!preferences.remarketing });
    }
    if (analyticsConfigured && preferences?.analytics && !gaTagged) {
      gaTagged = true;
      window.gtag?.('config', cfg.ga4MeasurementId, {send_page_view:true});
    }
  }

  // Only actual, provider-confirmed lead submissions create a pending conversion marker.
  // The marker is consumed at most once on danke.html, never on a button click or direct visit.
  const isThankYou = /(?:^|\/)danke\.html$/.test(location.pathname);
  const pendingKey = 'dg_verified_lead_v3';
  function readPendingLead() {
    try {
      const raw = sessionStorage.getItem(pendingKey);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved.id === 'string' && typeof saved.time === 'number'
          && Date.now() - saved.time < 180000 && saved.time <= Date.now()) return saved;
      sessionStorage.removeItem(pendingKey);
    } catch (_e) { /* storage blocked */ }
    return null;
  }
  function finishPendingLead() {
    if (!isThankYou || !preferences) return;
    const pending = readPendingLead();
    if (!pending) return;
    if (conversionReady && preferences.measurement) {
      ensureGtag();
      window.gtag?.('event', 'conversion', {
        send_to: cfg.googleAdsId + '/' + cfg.googleAdsConversionLabel,
        transaction_id:pending.id
      });
    }
    if (analyticsConfigured && preferences.analytics) {
      ensureGtag();
      window.gtag?.('event', 'generate_lead', { currency:'EUR' });
    }
    try {sessionStorage.removeItem(pendingKey);} catch (_e) { /* storage blocked */ }
  }

  function storeConsent(measurement, remarketing, analytics) {
    const hadTag = tagLoaded;
    preferences = {
      measurement:!!measurement && adsConfigured,
      remarketing:!!remarketing && adsConfigured,
      analytics:!!analytics && analyticsConfigured,
      savedAt:Date.now()
    };
    try {localStorage.setItem(consentKey, JSON.stringify(preferences));} catch (_e) {}
    consentBanner?.remove(); consentBanner = null;
    if (!anyConsent() && hadTag) {
      window.gtag?.('consent','update',consentPayload());
      // Stop previously loaded tags as well as possible on withdrawal. Google/third-party
      // cookie deletion still requires a separate legal/technical audit.
      location.reload();
      return;
    }
    if (anyConsent()) ensureGtag();
    finishPendingLead();
  }
  function showConsent() {
    if (!privacyServicesConfigured) {
      window.alert('Es sind noch keine Google-Tracking-Kennungen hinterlegt. Aktuell werden keine Google-Tags geladen.');
      return;
    }
    consentBanner?.remove();
    consentBanner = document.createElement('div');
    consentBanner.className = 'consent-banner';
    consentBanner.setAttribute('role','region');
    consentBanner.setAttribute('aria-label','Datenschutzeinstellungen');
    const markup = [];
    if (conversionReady) markup.push('<label><input type="checkbox" data-consent-measurement> Google Ads: bestätigte Projektanfragen messen</label>');
    if (adsConfigured) markup.push('<label><input type="checkbox" data-consent-remarketing> Google Ads: Remarketing und personalisierte Werbung</label>');
    if (analyticsConfigured) markup.push('<label><input type="checkbox" data-consent-analytics> Google Analytics: anonyme bzw. pseudonyme Nutzungsstatistiken</label>');
    consentBanner.innerHTML = `<div><div class="consent-heading">Datenschutzeinstellungen</div><p>Optionale Google-Dienste werden erst nach Ihrer Auswahl geladen. Das Kontaktformular funktioniert auch ohne Zustimmung. Jede Nutzung ist getrennt wählbar und später widerrufbar. <a href="datenschutz.html">Datenschutzerklärung</a></p><div class="consent-options">${markup.join('')}</div></div><div class="consent-actions"><button type="button" class="btn" data-consent-no>Alle ablehnen</button><button type="button" class="btn" data-consent-all>Alle akzeptieren</button><button type="button" class="btn" data-consent-save>Auswahl speichern</button></div>`;
    document.body.appendChild(consentBanner);
    const m=consentBanner.querySelector('[data-consent-measurement]');
    const r=consentBanner.querySelector('[data-consent-remarketing]');
    const a=consentBanner.querySelector('[data-consent-analytics]');
    if (m) m.checked=!!preferences?.measurement;
    if (r) r.checked=!!preferences?.remarketing;
    if (a) a.checked=!!preferences?.analytics;
    consentBanner.querySelector('[data-consent-no]').addEventListener('click',()=>storeConsent(false,false,false));
    consentBanner.querySelector('[data-consent-all]').addEventListener('click',()=>storeConsent(!!m,!!r,!!a));
    consentBanner.querySelector('[data-consent-save]').addEventListener('click',()=>storeConsent(m?.checked,r?.checked,a?.checked));
  }
  settingsButtons.forEach(button=>button.addEventListener('click',showConsent));
  if (privacyServicesConfigured) {
    if (preferences===null) showConsent();
    else if (anyConsent()) ensureGtag();
  }
  finishPendingLead();

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
    let formStarted = false;
    form.addEventListener('focusin', () => {
      if (!formStarted && analyticsConfigured && preferences?.analytics) {
        formStarted = true;
        ensureGtag();
        window.gtag?.('event','form_start',{form_id:'projektanfrage'});
      }
    });
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
        // Unique non-personal token for a provider-confirmed successful submission.
        const receipt = { id: (window.crypto?.randomUUID?.() || 'dg-'+Date.now()+'-'+Math.random().toString(36).slice(2)),time:Date.now() };
        try {sessionStorage.setItem(pendingKey,JSON.stringify(receipt));} catch (_e) {}
        location.assign('danke.html');
      } catch (err) {
        message.textContent = 'Die Anfrage konnte nicht bestätigt werden: ' + (err?.message || 'Verbindungsfehler') + ' Alternativ erreichen Sie mich unter genschel.denis@gmail.com.';
        message.className = 'form-message error';
        sending = false; submit.disabled = false; submit.textContent = 'Kostenlose Einschätzung anfordern →';
      }
    });
  }

})();
