/* Service worker dedicato alle vere Web Push di MANOVELLA.
   Ha uno scope separato da quello generato da Flutter, così non altera cache,
   offline o aggiornamenti della PWA. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) {}
  const title = payload.title || '🔧 MANOVELLA';
  const options = {
    body: payload.body || 'Hai ricevuto un nuovo messaggio.',
    icon: '../icons/Icon-192.png',
    badge: '../icons/Icon-192.png',
    tag: 'manovella-league-message',
    renotify: true,
    data: { url: payload.url || '../' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '../', self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(new URL('../', self.registration.scope).href) && 'focus' in client) {
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
