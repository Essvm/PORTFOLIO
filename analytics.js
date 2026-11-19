/* Anonymous portfolio views and short-lived, visible-tab presence. No names, arbitrary query strings or IP addresses. Project IDs identify new project pages. */
(function () {
  'use strict';
  if (window.__eaAnalyticsLoaded) return;
  window.__eaAnalyticsLoaded = true;
  const COLLECTOR = 'https://essam-portfolio-metrics.rubyplume16385.chatgpt.site';
  const EXCLUDE = 'ea.analytics.exclude';
  const VISITOR = 'ea.analytics.visitor.v1';
  const REFERRER = 'ea.analytics.source.v1';
  let local, session;
  try { local = localStorage; } catch {}
  try { session = sessionStorage; } catch {}
  const get = (store, key) => { try { return store.getItem(key); } catch { return null; } };
  const put = (store, key, value) => { try { store.setItem(key, value); } catch {} };
  const params = new URLSearchParams(location.search);
  if (params.get('analytics') === 'off' || params.get('analytics') === 'on') {
    put(local, EXCLUDE, params.get('analytics') === 'off' ? '1' : '0');
    params.delete('analytics');
    try { history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash); } catch {}
  }
  const excluded = () => get(local, EXCLUDE) === '1' || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  if (excluded()) return;
  if (location.origin !== 'https://essvm.github.io' || !/^\/PORTFOLIO\/(?:[a-z0-9-]+\.html)?$/.test(location.pathname)) return;
  const projectId = params.get('id');
  const trackingPath = location.pathname === '/PORTFOLIO/project.html' && /^[a-z0-9][a-z0-9-]{1,79}$/.test(projectId || '') ? location.pathname + '?id=' + projectId : location.pathname;
  let tab;
  try { tab = crypto.randomUUID(); } catch { return; }
  let visitor;
  function visitorId() {
    if (visitor) return visitor;
    try {
      const value = JSON.parse(get(local, VISITOR) || 'null');
      if (value && value.expires > Date.now() && /^[a-zA-Z0-9_-]{16,100}$/.test(value.id)) return visitor = value.id;
    } catch {}
    let id = get(session, VISITOR);
    if (!id) { id = crypto.randomUUID(); put(session, VISITOR, id); }
    put(local, VISITOR, JSON.stringify({ id, expires: Date.now() + 90 * 86400000 }));
    return visitor = id;
  }
  function source() {
    let value = get(session, REFERRER);
    if (value) return value;
    value = 'direct';
    try { const host = new URL(document.referrer).hostname; if (host && host !== location.hostname) value = host; } catch {}
    put(session, REFERRER, value);
    return value;
  }
  function send(route, payload) {
    try { fetch(COLLECTOR + route, { method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload) }).catch(() => {}); } catch {}
  }
  let sent = false, timer = null, sequence = 0, presenceActive = false;
  function record() {
    if (sent || document.visibilityState !== 'visible' || excluded()) return;
    sent = true;
    try { send('/track', { event: crypto.randomUUID(), visitor: visitorId(), path: trackingPath, referrer: source(), device: window.innerWidth < 768 ? 'mobile' : 'desktop' }); } catch {}
  }
  function presence(state) {
    try { send('/presence', { visitor: visitorId(), tab, path: trackingPath, state, sequence: sequence++ }); } catch {}
  }
  function pause() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    if (presenceActive) { presenceActive = false; presence('inactive'); }
  }
  function syncVisibility() {
    if (document.visibilityState !== 'visible' || excluded()) { pause(); return; }
    record();
    if (presenceActive) return;
    presenceActive = true;
    presence('active');
    timer = setInterval(() => {
      if (document.visibilityState !== 'visible' || excluded()) { pause(); return; }
      presence('active');
    }, 20000);
  }
  document.addEventListener('visibilitychange', syncVisibility);
  window.addEventListener('pagehide', pause);
  window.addEventListener('pageshow', event => { if (event.persisted) sent = false; syncVisibility(); });
  window.addEventListener('storage', event => { if (event.key === EXCLUDE) syncVisibility(); });
  const projectFromPage = () => {
    const id = new URLSearchParams(location.search).get('id');
    if (location.pathname === '/PORTFOLIO/project.html' && /^[a-z0-9][a-z0-9-]{1,79}$/.test(id || '')) return id;
    const file = location.pathname.split('/').pop();
    return file && file !== 'index.html' && file !== 'project.html' ? file.replace('.html', '') : '';
  };
  const currentProject = projectFromPage();
  if (currentProject) put(session, 'ea.analytics.lastProject', currentProject);
  const recentActions = new Map();
  document.addEventListener('click', event => {
    if (excluded() || document.visibilityState !== 'visible') return;
    const target = event.target.closest ? event.target : event.target.parentElement;
    if (!target) return;
    const gallery = target.closest('.gallery-image-link');
    const link = target.closest('a');
    let kind = gallery ? 'gallery_open' : '', channel = '';
    if (!kind && link && (link.closest('#contact') || link.dataset.contactChannel)) {
      const href = link.getAttribute('href') || '';
      if (/^mailto:/i.test(href)) channel = 'email';
      else if (/^tel:/i.test(href)) channel = 'phone';
      else { try { const host = new URL(href).hostname.replace(/^www\./, ''); channel = host === 'instagram.com' ? 'instagram' : host === 'behance.net' ? 'behance' : ['wa.me','api.whatsapp.com','whatsapp.com'].includes(host) ? 'whatsapp' : 'other'; } catch {} }
      if (channel) kind = 'contact_click';
    }
    if (!kind) return;
    const projectId = currentProject || get(session, 'ea.analytics.lastProject') || '';
    const key = kind + ':' + channel + ':' + projectId, now = Date.now();
    if (now - (recentActions.get(key) || 0) < 1500) return;
    recentActions.set(key, now);
    try { send('/events', { event: crypto.randomUUID(), visitor: visitorId(), kind, channel, projectId, path: trackingPath }); } catch {}
  }, true);
  syncVisibility();
})();
