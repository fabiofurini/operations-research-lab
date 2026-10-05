// Cloudflare Web Analytics
(() => {
  if (document.querySelector('script[data-cf-beacon]')) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', '{"token":"bdafa565420e4746930191ee997beeca"}');
  document.body.appendChild(script);
})();
