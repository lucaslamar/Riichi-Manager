/*
 * Service worker do Mojoca: guarda os arquivos do build para o app abrir offline.
 * O plugin em vite.config.ts troca os marcadores e grava o resultado em dist/sw.js.
 * Só funciona no build: `npm run build` e `npm run preview -- --host`.
 */
const CACHE = 'mojoca-6dc057ce5e55'
const ARQUIVOS = ["./.nojekyll","./assets/fa-brands-400-Ch568Ea9.woff2","./assets/fa-brands-400-DHHcbFjz.ttf","./assets/fa-regular-400-9VThgXHM.woff2","./assets/fa-regular-400-C54-fRIQ.ttf","./assets/fa-solid-900-Cm9M9sZB.ttf","./assets/fa-solid-900-QWY35r5r.woff2","./assets/fa-v4compatibility-BRdYr4HJ.woff2","./assets/fa-v4compatibility-DLBX5pNp.ttf","./assets/index-DwFAjrJr.css","./assets/index-_uHilVOP.js","./assets/PaginaCenterpiece-BjsqRF2f.css","./assets/PaginaCenterpiece-BVMywg_5.js","./icones/apple-touch-icon.png","./icones/icone-192.png","./icones/icone-512.png","./icones/icone-maskable-512.png","./index.html","./locales/en.json","./locales/es.json","./locales/ja.json","./locales/ko.json","./locales/lt.json","./locales/pt-BR.json","./locales/zh-Hans.json","./manifest.webmanifest","./tiles/regular/Back.svg","./tiles/regular/Blank.svg","./tiles/regular/Chun.svg","./tiles/regular/Front.svg","./tiles/regular/Haku.svg","./tiles/regular/Hatsu.svg","./tiles/regular/Man1.svg","./tiles/regular/Man2.svg","./tiles/regular/Man3.svg","./tiles/regular/Man4.svg","./tiles/regular/Man5-Dora.svg","./tiles/regular/Man5.svg","./tiles/regular/Man6.svg","./tiles/regular/Man7.svg","./tiles/regular/Man8.svg","./tiles/regular/Man9.svg","./tiles/regular/Nan.svg","./tiles/regular/Pei.svg","./tiles/regular/Pin1.svg","./tiles/regular/Pin2.svg","./tiles/regular/Pin3.svg","./tiles/regular/Pin4.svg","./tiles/regular/Pin5-Dora.svg","./tiles/regular/Pin5.svg","./tiles/regular/Pin6.svg","./tiles/regular/Pin7.svg","./tiles/regular/Pin8.svg","./tiles/regular/Pin9.svg","./tiles/regular/Shaa.svg","./tiles/regular/Sou1.svg","./tiles/regular/Sou2.svg","./tiles/regular/Sou3.svg","./tiles/regular/Sou4.svg","./tiles/regular/Sou5-Dora.svg","./tiles/regular/Sou5.svg","./tiles/regular/Sou6.svg","./tiles/regular/Sou7.svg","./tiles/regular/Sou8.svg","./tiles/regular/Sou9.svg","./tiles/regular/Ton-Vermelho.svg","./tiles/regular/Ton.svg","./tiles/regular-png/Back.png","./tiles/regular-png/Blank.png","./tiles/regular-png/Chun.png","./tiles/regular-png/Front.png","./tiles/regular-png/Haku.png","./tiles/regular-png/Hatsu.png","./tiles/regular-png/Man1.png","./tiles/regular-png/Man2.png","./tiles/regular-png/Man3.png","./tiles/regular-png/Man4.png","./tiles/regular-png/Man5-Dora.png","./tiles/regular-png/Man5.png","./tiles/regular-png/Man6.png","./tiles/regular-png/Man7.png","./tiles/regular-png/Man8.png","./tiles/regular-png/Man9.png","./tiles/regular-png/Nan.png","./tiles/regular-png/Pei.png","./tiles/regular-png/Pin1.png","./tiles/regular-png/Pin2.png","./tiles/regular-png/Pin3.png","./tiles/regular-png/Pin4.png","./tiles/regular-png/Pin5-Dora.png","./tiles/regular-png/Pin5.png","./tiles/regular-png/Pin6.png","./tiles/regular-png/Pin7.png","./tiles/regular-png/Pin8.png","./tiles/regular-png/Pin9.png","./tiles/regular-png/Shaa.png","./tiles/regular-png/Sou1.png","./tiles/regular-png/Sou2.png","./tiles/regular-png/Sou3.png","./tiles/regular-png/Sou4.png","./tiles/regular-png/Sou5-Dora.png","./tiles/regular-png/Sou5.png","./tiles/regular-png/Sou6.png","./tiles/regular-png/Sou7.png","./tiles/regular-png/Sou8.png","./tiles/regular-png/Sou9.png","./tiles/regular-png/Ton-Vermelho.png","./tiles/regular-png/Ton.png","./tiles/regular-png-240/Back.png","./tiles/regular-png-240/Blank.png","./tiles/regular-png-240/Chun.png","./tiles/regular-png-240/Front.png","./tiles/regular-png-240/Haku.png","./tiles/regular-png-240/Hatsu.png","./tiles/regular-png-240/Man1.png","./tiles/regular-png-240/Man2.png","./tiles/regular-png-240/Man3.png","./tiles/regular-png-240/Man4.png","./tiles/regular-png-240/Man5-Dora.png","./tiles/regular-png-240/Man5.png","./tiles/regular-png-240/Man6.png","./tiles/regular-png-240/Man7.png","./tiles/regular-png-240/Man8.png","./tiles/regular-png-240/Man9.png","./tiles/regular-png-240/Nan.png","./tiles/regular-png-240/Pei.png","./tiles/regular-png-240/Pin1.png","./tiles/regular-png-240/Pin2.png","./tiles/regular-png-240/Pin3.png","./tiles/regular-png-240/Pin4.png","./tiles/regular-png-240/Pin5-Dora.png","./tiles/regular-png-240/Pin5.png","./tiles/regular-png-240/Pin6.png","./tiles/regular-png-240/Pin7.png","./tiles/regular-png-240/Pin8.png","./tiles/regular-png-240/Pin9.png","./tiles/regular-png-240/Shaa.png","./tiles/regular-png-240/Sou1.png","./tiles/regular-png-240/Sou2.png","./tiles/regular-png-240/Sou3.png","./tiles/regular-png-240/Sou4.png","./tiles/regular-png-240/Sou5-Dora.png","./tiles/regular-png-240/Sou5.png","./tiles/regular-png-240/Sou6.png","./tiles/regular-png-240/Sou7.png","./tiles/regular-png-240/Sou8.png","./tiles/regular-png-240/Sou9.png","./tiles/regular-png-240/Ton-Vermelho.png","./tiles/regular-png-240/Ton.png"]

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
