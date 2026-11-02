/**
 * Instalar como app (PWA). No Android o navegador oferece o evento
 * `beforeinstallprompt`; no iPhone só existe o caminho manual pelo Compartilhar.
 * No React Native este arquivo some.
 */
interface EventoInstalacao extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let eventoGuardado: EventoInstalacao | null = null
const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach((ouvinte) => ouvinte())

/** Chamado uma vez ao abrir o app: o evento pode vir antes de qualquer tela montar. */
export function iniciarInstalacao(urlServiceWorker: string): void {
  window.addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault()
    eventoGuardado = evento as EventoInstalacao
    avisar()
  })
  window.addEventListener('appinstalled', () => {
    eventoGuardado = null
    avisar()
  })
  if (urlServiceWorker && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register(urlServiceWorker).catch(() => {})
    })
  }
}

export function aoMudarInstalacao(aoMudar: () => void): () => void {
  ouvintes.add(aoMudar)
  return () => ouvintes.delete(aoMudar)
}

/** iPhone e iPad; o iPad novo se apresenta como Mac, mas tem toque. */
export function ehIos(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function estaInstalado(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches
}

export function podeInstalar(): boolean {
  return eventoGuardado !== null
}

export async function pedirInstalacao(): Promise<void> {
  if (!eventoGuardado) return
  const evento = eventoGuardado
  eventoGuardado = null
  await evento.prompt()
  avisar()
}
