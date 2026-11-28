const V = 'wared-v41', FILES = ['assets/yk-logo.svg', './', 'index.html', 'style.css', 'app.js', 'parser.js', 'logo.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return; e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request))); });
