// Detecta swipe horizontal no mobile e abre/fecha o drawer via clique no burger.
// O drawer é gerenciado pelo React (renderização condicional), então não manipulamos
// o DOM do drawer diretamente — usamos o botão burger como proxy para o estado React.
interface SwipeBurgerOptions {
  burgerSelector?: string
  swipeThreshold?: number
  edgeZone?: number
}

export function initSwipeBurger(options: SwipeBurgerOptions = {}) {
  const {
    burgerSelector = '.botao-menu-global',
    swipeThreshold = 50,
    edgeZone = 30,
  } = options

  let touchStartX = 0
  let touchStartY = 0
  let tracking = false
  let trackingMode: 'open' | 'close' | null = null

  function isOpen() {
    return document.querySelector(burgerSelector)?.getAttribute('aria-expanded') === 'true'
  }

  function openDrawer() {
    if (!isOpen()) (document.querySelector(burgerSelector) as HTMLElement | null)?.click()
  }

  function closeDrawer() {
    if (isOpen()) (document.querySelector(burgerSelector) as HTMLElement | null)?.click()
  }

  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    tracking = false
    trackingMode = null

    if (!isOpen() && touchStartX <= edgeZone) {
      tracking = true
      trackingMode = 'open'
    } else if (isOpen()) {
      tracking = true
      trackingMode = 'close'
    }
  }, { passive: true })

  document.addEventListener('touchend', (e) => {
    if (!tracking) return
    tracking = false

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY

    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    if (trackingMode === 'open' && deltaX > swipeThreshold) {
      openDrawer()
    } else if (trackingMode === 'close' && deltaX < -swipeThreshold) {
      closeDrawer()
    }
  }, { passive: true })
}
