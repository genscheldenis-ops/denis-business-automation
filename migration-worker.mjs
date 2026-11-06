// Canonical HTML routes for the existing static Cloudflare Worker.
const primaryHost = 'genschel-automation.de';
const oldHost = 'denis-business-automation.genschel-denis.workers.dev';
const verificationPath = '/google85867acecd647a0a.html';
const pages = [
  'rechnungen-automatisieren', 'crm-automatisieren',
  'prozesse-automatisieren', 'n8n-automatisierung', 'ki-automatisierung', 'anfrage', 'impressum', 'datenschutz', 'danke'
];
const aliases = new Map([['/index.html', '/'], ['/index', '/']]);
for (const page of pages) {
  for (const suffix of ['', '/', '.html/', '/index', '/index.html']) {
    aliases.set('/' + page + suffix, '/' + page + '.html');
  }
}

// Preserve the existing _headers policy on Worker-generated responses, too.
function withHeaders(response) {
  const result = new Response(response.body, response);
  result.headers.set('X-Content-Type-Options', 'nosniff');
  result.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  result.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  result.headers.set('X-Frame-Options', 'SAMEORIGIN');
  return result;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Never redirect or rewrite submitted form/API requests.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return withHeaders(await env.ASSETS.fetch(request));
    }
    // Keep the existing Search Console verification file accessible on both hosts.
    if (url.pathname === verificationPath) {
      return withHeaders(await env.ASSETS.fetch(request));
    }
    const path = aliases.get(url.pathname) || url.pathname;
    const legacyHost = url.hostname === oldHost || url.hostname === 'www.' + primaryHost;
    const needsHttps = url.hostname === primaryHost && url.protocol !== 'https:';
    if (legacyHost || needsHttps || path !== url.pathname) {
      if (legacyHost || needsHttps) {
        url.protocol = 'https:';
        url.hostname = primaryHost;
        url.port = '';
      }
      url.pathname = path;
      // URL mutation preserves the original query, including UTM and click IDs.
      return withHeaders(new Response(null, {
        status: 301,
        headers: { Location: url.href, 'Cache-Control': 'public, max-age=300' }
      }));
    }
    // html_handling:none serves exact files; explicitly map the homepage.
    if (url.pathname === '/') {
      url.pathname = '/index.html';
      return withHeaders(await env.ASSETS.fetch(new Request(url, request)));
    }
    return withHeaders(await env.ASSETS.fetch(request));
  }
};
