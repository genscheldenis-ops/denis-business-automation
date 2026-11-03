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
  if (form && form.dataset.dgSubmitBound !== 'true') {
    // Bind once even if this script is accidentally included twice.
    form.dataset.dgSubmitBound = 'true';
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
        const errors = Array.isArray(json?.errors) ? json.errors : [];
        if (!res.ok || res.redirected || json?.ok === false || json?.success === false || errors.length || json?.error) {
          const detail = errors.map(x => x?.message).filter(Boolean).join(' ');
          throw new Error(detail || 'Übermittlung nicht möglich. Bitte prüfen Sie Ihre Angaben oder versuchen Sie es später erneut.');
        }
        // Tracking must never turn an accepted inquiry into a form error/retry.
        try { window.DGPrivacy?.recordLead(); } catch (_e) { /* Keep the successful redirect. */ }
        location.assign('danke.html');
      } catch (err) {
        message.textContent = 'Die Anfrage konnte nicht bestätigt werden: ' + (err?.message || 'Verbindungsfehler') + ' Alternativ erreichen Sie mich unter genschel.denis@gmail.com.';
        message.className = 'form-message error';
        sending = false; submit.disabled = false; submit.textContent = 'Kostenlose Einschätzung anfordern →';
      }
    });
  }

})();
