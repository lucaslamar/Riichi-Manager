/*
 * Service worker do Mojoca: guarda os arquivos do build para o app abrir offline.
 * O plugin em vite.config.ts troca os marcadores e grava o resultado em dist/sw.js.
 * Só funciona no build: `npm run build` e `npm run preview -- --host`.
 */
const CACHE = 'mojoca-__VERSAO__'
const ARQUIVOS = __ARQUIVOS__

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((nome) => nome !== CACHE).map((nome) => caches.delete(nome))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const { request } = evento
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  // A página vem da rede para pegar versão nova; sem rede, a guardada.
  if (request.mode === 'navigate') {
    evento.respondWith(fetch(request).catch(() => caches.match('./index.html')))
    return
  }
  // Os textos pedem ?v=versão; cada versão do app tem o próprio cache, então vale ignorar.
  evento.respondWith(
    caches.match(request, { ignoreSearch: true }).then((guardada) => guardada ?? fetch(request)),
  )
})
