// WorkBridge Service Worker — Push Notifications
const CACHE = 'workbridge-v1'

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/', '/dashboard', '/manifest.json'])
    )
  )
})

self.addEventListener('push', e => {
  const data = e.data?.json() || {}
  const title = data.title || 'WorkBridge'
  const options = {
    body: data.body || 'You have a new message',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dashboard' },
    actions: [
      { action: 'view', title: '📬 View Reply' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  if (e.action === 'view' || !e.action) {
    e.waitUntil(
      clients.openWindow(e.notification.data?.url || '/dashboard')
    )
  }
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
