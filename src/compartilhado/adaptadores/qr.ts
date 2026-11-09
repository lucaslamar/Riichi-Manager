/**
 * QR: desenhar (qrcode) e ler pela câmera (BarcodeDetector, com jsQR quando o
 * navegador não tem). As bibliotecas só carregam quando a tela precisa delas.
 * No React Native, trocar por react-native-qrcode-svg e expo-camera.
 */

/** Imagem do QR como data URL. */
export async function gerarQr(texto: string): Promise<string> {
  const { toDataURL } = await import('qrcode')
  // Margem de 4 módulos (a "zona quieta" do padrão) e imagem grande: a tela
  // reduz sem borrar, e a câmera acha as bordas do QR mais fácil.
  return toDataURL(texto, { errorCorrectionLevel: 'L', margin: 4, width: 720 })
}

export interface LeitorQr {
  parar: () => void
}

/** Câmera sem permissão: a tela mostra o aviso com "Tentar de novo". */
export class PermissaoCameraNegada extends Error {}

type DetectorNativo = { detect: (fonte: CanvasImageSource) => Promise<{ rawValue: string }[]> }

/** 10 quadros por segundo. */
const INTERVALO_MS = 100
/** Recorte quadrado no meio da imagem, com 70% do menor lado. */
const PROPORCAO_RECORTE = 0.7
const CHAVE_CAMERA = 'riichi-manager-camera-qr'
/** Lentes que não servem para ler QR de perto (sem foco ou com zoom). */
const LENTE_SECUNDARIA = /wide|ultra|tele|macro|depth|0[.,]5/i

function lerCameraSalva(): string | null {
  try {
    return localStorage.getItem(CHAVE_CAMERA)
  } catch {
    return null
  }
}

function salvarCamera(deviceId: string) {
  try {
    localStorage.setItem(CHAVE_CAMERA, deviceId)
  } catch {
    // Sem armazenamento: escolhe de novo na próxima vez.
  }
}

/**
 * Câmera traseira principal entre as já listadas (os nomes só aparecem depois da
 * permissão): traseira, sem ser grande-angular, tele, macro ou profundidade, e de
 * preferência a de índice "0". Não percorre nada: só escolhe uma.
 */
export function cameraPrincipal(cameras: readonly { deviceId: string; label: string }[]): string | null {
  const traseiras = cameras.filter((camera) => /back|rear|traseira|environment/i.test(camera.label))
  const boas = traseiras.filter((camera) => !LENTE_SECUNDARIA.test(camera.label))
  const escolhida = boas.find((camera) => /\b0\b/.test(camera.label)) ?? boas[0]
  return escolhida?.deviceId ?? null
}

async function abrirCamera(): Promise<MediaStream> {
  const pedir = (video: MediaTrackConstraints) => navigator.mediaDevices.getUserMedia({ video, audio: false })
  const salva = lerCameraSalva()
  if (salva) {
    try {
      return await pedir({ deviceId: { exact: salva } })
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'NotAllowedError') throw erro
      // Câmera salva sumiu: volta para a traseira padrão.
    }
  }
  const fluxo = await pedir({ facingMode: 'environment' })
  // Primeira vez: a traseira que o sistema deu fica. Só se ela for uma lente
  // secundária (grande-angular, tele, macro...) olha a lista e troca uma vez só.
  try {
    const faixa = fluxo.getVideoTracks()[0]
    const atual = faixa?.getSettings().deviceId
    if (!LENTE_SECUNDARIA.test(faixa?.label ?? '')) {
      if (atual) salvarCamera(atual)
      return fluxo
    }
    const dispositivos = await navigator.mediaDevices.enumerateDevices()
    const principal = cameraPrincipal(dispositivos.filter((item) => item.kind === 'videoinput'))
    if (principal && principal !== atual) {
      fluxo.getTracks().forEach((faixa) => faixa.stop())
      const trocado = await pedir({ deviceId: { exact: principal } })
      salvarCamera(principal)
      return trocado
    }
    if (atual) salvarCamera(atual)
  } catch {
    // Sem lista de câmeras: segue com a que o sistema deu.
  }
  return fluxo
}

/**
 * Liga a câmera traseira principal no `video` e chama `aoLer` a cada QR lido.
 * Rejeita com `PermissaoCameraNegada` sem permissão, e com o erro original se
 * não houver câmera.
 */
export async function lerQrDaCamera(video: HTMLVideoElement, aoLer: (texto: string) => void): Promise<LeitorQr> {
  let fluxo: MediaStream
  try {
    fluxo = await abrirCamera()
  } catch (erro) {
    if (erro instanceof DOMException && (erro.name === 'NotAllowedError' || erro.name === 'SecurityError')) {
      throw new PermissaoCameraNegada(erro.message)
    }
    throw erro
  }
  // Foco contínuo, quando a câmera aceita.
  const faixa = fluxo.getVideoTracks()[0]
  faixa
    ?.applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] })
    .catch(() => undefined)

  video.srcObject = fluxo
  video.setAttribute('playsinline', 'true')
  await video.play()

  const Nativo = (globalThis as { BarcodeDetector?: new (opcoes: { formats: string[] }) => DetectorNativo })
    .BarcodeDetector
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
      if (video.readyState >= 2 && video.videoWidth > 0) {
        // Só o quadrado do meio: menos pixels, leitura mais rápida e sem QR vizinho.
        const lado = Math.round(Math.min(video.videoWidth, video.videoHeight) * PROPORCAO_RECORTE)
        const x = Math.round((video.videoWidth - lado) / 2)
        const y = Math.round((video.videoHeight - lado) / 2)
        tela.width = lado
        tela.height = lado
        contexto?.drawImage(video, x, y, lado, lado, 0, 0, lado, lado)
        if (detector) {
          for (const codigo of await detector.detect(tela)) aoLer(codigo.rawValue)
        } else if (jsQR && contexto) {
          const imagem = contexto.getImageData(0, 0, lado, lado)
          const codigo = jsQR(imagem.data, lado, lado, { inversionAttempts: 'dontInvert' })
          if (codigo) aoLer(codigo.data)
        }
      }
    } catch {
      // Quadro ruim: tenta no próximo.
    }
    if (ativo) window.setTimeout(quadro, INTERVALO_MS)
  }
  void quadro()

  return {
    parar: () => {
      ativo = false
      fluxo.getTracks().forEach((item) => item.stop())
      video.srcObject = null
    },
  }
}
