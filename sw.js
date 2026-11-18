// Cache all application and inference files for offline operation.
// On first install, internet access and sufficient storage are required.
const VERSION = 'anemia-ai-pwa-v4-medical-disclaimer';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './models/complete_case.onnx', './models/missing_aware.onnx',
  './models/complete_case_config.json', './models/missing_aware_config.json',
  './runtime/ort.min.js',
  './runtime/ort-wasm-simd-threaded.jsep.mjs',
  './runtime/ort-wasm-simd-threaded.jsep.wasm',
  './runtime/ort-wasm-simd-threaded.mjs',
  './runtime/ort-wasm-simd-threaded.wasm'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(FILES);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('anemia-ai-pwa-') && k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      const cache = await caches.open(VERSION);
      await cache.put(event.request, response.clone());
    }
    return response;
  })());
});
