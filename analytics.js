/* Anonymous, first-party portfolio pageviews. No query strings, names, emails or IP addresses are sent. */
(function () {
  'use strict';
  if (window.__eaAnalyticsLoaded) return;
  window.__eaAnalyticsLoaded = true;
  const ENDPOINT = 'https://essam-portfolio-metrics.rubyplume16385.chatgpt.site/track';
  const EXCLUDE = 'ea.analytics.exclude';
  const VISITOR = 'ea.analytics.visitor.v1';
  const REFERRER = 'ea.analytics.source.v1';
  const get = (store, key) => { try { return store.getItem(key); } catch { return null; } };
  const put = (store, key, value) => { try { store.setItem(key, value); } catch {} };
  const params = new URLSearchParams(location.search);
  if (params.get('analytics') === 'off' || params.get('analytics') === 'on') {
    put(localStorage, EXCLUDE, params.get('analytics') === 'off' ? '1' : '0');
    params.delete('analytics');
    try { history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash); } catch {}
  }
  if (get(localStorage, EXCLUDE) === '1' || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  if (location.origin !== 'https://essvm.github.io' || !/^\/PORTFOLIO\/(?:[a-z0-9-]+\.html)?$/.test(location.pathname)) return;
  function visitorId() {
    try {
      const value = JSON.parse(get(localStorage, VISITOR) || 'null');
      if (value && value.expires > Date.now() && /^[a-zA-Z0-9_-]{16,100}$/.test(value.id)) return value.id;
    } catch {}
    let id = get(sessionStorage, VISITOR);
    if (!id) { id = crypto.randomUUID(); put(sessionStorage, VISITOR, id); }
    put(localStorage, VISITOR, JSON.stringify({ id, expires: Date.now() + 90 * 86400000 }));
    return id;
  }
  function source() {
    let value = get(sessionStorage, REFERRER);
    if (value) return value;
    value = 'direct';
    try { const host = new URL(document.referrer).hostname; if (host && host !== location.hostname) value = host; } catch {}
    put(sessionStorage, REFERRER, value);
    return value;
  }
  let sent = false;
  function record() {
    if (sent || document.visibilityState !== 'visible') return;
    sent = true;
    document.removeEventListener('visibilitychange', record);
    try {
      const payload = { event: crypto.randomUUID(), visitor: visitorId(), path: location.pathname, referrer: source(), device: window.innerWidth < 768 ? 'mobile' : 'desktop' };
      fetch(ENDPOINT, { method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload) }).catch(() => {});
    } catch {}
  }
  if (document.visibilityState === 'visible') record();
  else document.addEventListener('visibilitychange', record);
  window.addEventListener('pageshow', event => { if (event.persisted) { sent = false; record(); } });
})();
