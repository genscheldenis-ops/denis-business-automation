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

  // Advertising measurement: basic opt-in mode. No Google request at all before permission.
  const adsReady = /^AW-\d+$/.test(cfg.googleAdsId || '') && !!(cfg.googleAdsConversionLabel || '').trim();
  const consentKey = 'dg_business_ads_permission_v1';
  let consent = null;
  try { consent = localStorage.getItem(consentKey); } catch (_e) { /* storage blocked */ }
  let tagLoaded = false;
  let banner;
  const trackButtons = document.querySelectorAll('[data-privacy-settings]');
  function loadGoogleTag() {
    if (!adsReady || consent !== 'yes' || tagLoaded) return;
    tagLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('set', 'allow_ad_personalization_signals', false);
    window.gtag('config', cfg.googleAdsId);
    const s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.googleAdsId);
    document.head.appendChild(s);
  }
  function storeConsent(value) {
    consent = value;
    try { localStorage.setItem(consentKey, value); } catch (_e) { /* storage disabled */ }
    if (banner) banner.remove();
    if (value === 'yes') loadGoogleTag();
    else if (tagLoaded) location.reload(); // ensures no more Google-tag execution after withdrawal
  }
  function showConsent() {
    if (!adsReady) return;
    banner?.remove();
    banner = document.createElement('div'); banner.className = 'consent-banner';
    banner.setAttribute('role', 'region'); banner.setAttribute('aria-label', 'Optionale Anzeigenmessung');
    banner.innerHTML = '<div><strong>Optionale Anzeigenmessung</strong><p>Mit Ihrer Zustimmung verwenden wir Google Ads zur Messung erfolgreicher Kontaktanfragen. Die Website und das Formular funktionieren auch ohne Zustimmung. <a href="datenschutz.html">Datenschutz</a></p></div><div class="consent-actions"><button type="button" class="btn" data-consent-no>Ablehnen</button><button type="button" class="btn primary" data-consent-yes>Zustimmen</button></div>';
    document.body.appendChild(banner);
    banner.querySelector('[data-consent-no]').addEventListener('click', () => storeConsent('no'));
    banner.querySelector('[data-consent-yes]').addEventListener('click', () => storeConsent('yes'));
  }
  if (adsReady) {
    trackButtons.forEach(btn => { btn.hidden = false; btn.addEventListener('click', showConsent); });
    if (consent === 'yes') loadGoogleTag();
    else if (consent !== 'no') showConsent();
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
        sending = false; submit.disabled = false; submit.textContent = 'Unverbindliche Anfrage absenden ↗';
      }
    });
  }

  // One conversion per valid success redirect (and only with advertising opt-in).
  if (location.pathname.endsWith('/danke.html') || location.pathname.endsWith('danke.html')) {
    let sentAt = 0;
    try { sentAt = Number(sessionStorage.getItem('dg_form_sent_once') || 0); sessionStorage.removeItem('dg_form_sent_once'); } catch (_e) { /* storage disabled */ }
    if (sentAt && (Date.now() - sentAt < 120000) && adsReady && consent === 'yes') {
      loadGoogleTag();
      window.gtag?.('event', 'conversion', { send_to: cfg.googleAdsId + '/' + cfg.googleAdsConversionLabel });
    }
  }
})();
