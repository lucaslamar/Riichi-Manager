/**
 * QR: desenhar (qrcode) e ler pela câmera (BarcodeDetector, com jsQR quando o
 * navegador não tem). As bibliotecas só carregam quando a tela precisa delas.
 * No React Native, trocar por react-native-qrcode-svg e expo-camera.
 */

/** Imagem do QR como data URL. */
export async function gerarQr(texto: string): Promise<string> {
  const { toDataURL } = await import('qrcode')
  return toDataURL(texto, { errorCorrectionLevel: 'L', margin: 2, width: 320 })
}

export interface LeitorQr {
  parar: () => void
}

type DetectorNativo = { detect: (fonte: CanvasImageSource) => Promise<{ rawValue: string }[]> }

/**
 * Liga a câmera traseira no `video` e chama `aoLer` a cada QR lido.
 * Rejeita se não houver câmera ou permissão.
 */
export async function lerQrDaCamera(
  video: HTMLVideoElement,
  aoLer: (texto: string) => void,
): Promise<LeitorQr> {
  const fluxo = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: false,
  })
  video.srcObject = fluxo
  video.setAttribute('playsinline', 'true')
  await video.play()

  const Nativo = (
    globalThis as { BarcodeDetector?: new (opcoes: { formats: string[] }) => DetectorNativo }
  ).BarcodeDetector
  let detector: DetectorNativo | null = null
  if (Nativo) {
    try {
      detector = new Nativo({ formats: ['qr_code'] })
    } catch {
      detector = null
    }
  }
  const jsQR = detector ? null : (await import('jsqr')).default
  const tela = document.createElement('canvas')
  const contexto = tela.getContext('2d', { willReadFrequently: true })

  let ativo = true
  const quadro = async () => {
    if (!ativo) return
    try {
      if (video.readyState >= 2) {
        if (detector) {
          for (const codigo of await detector.detect(video)) aoLer(codigo.rawValue)
        } else if (jsQR && contexto) {
          tela.width = video.videoWidth
          tela.height = video.videoHeight
          contexto.drawImage(video, 0, 0)
          const imagem = contexto.getImageData(0, 0, tela.width, tela.height)
          const codigo = jsQR(imagem.data, imagem.width, imagem.height, {
            inversionAttempts: 'dontInvert',
          })
          if (codigo) aoLer(codigo.data)
        }
      }
    } catch {
      // Quadro ruim: tenta no próximo.
    }
    if (ativo) window.setTimeout(quadro, 150)
  }
  void quadro()

  return {
    parar: () => {
      ativo = false
      fluxo.getTracks().forEach((faixa) => faixa.stop())
      video.srcObject = null
    },
  }
}
