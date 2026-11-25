/**
 * Câmera para fotografar a mesa (getUserMedia) e fotos da galeria. A foto fica
 * só na memória do aparelho. No React Native, trocar por react-native-vision-camera.
 */
export type LadoCamera = 'environment' | 'user'

export function temCamera(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}

export function abrirCameraFoto(lado: LadoCamera): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: lado }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: false,
  })
}

/** Desliga a câmera (a luz apaga na hora). */
export function pararCamera(fluxo: MediaStream | null) {
  fluxo?.getTracks().forEach((faixa) => faixa.stop())
}

export async function quantasCameras(): Promise<number> {
  try {
    const dispositivos = await navigator.mediaDevices.enumerateDevices()
    return dispositivos.filter((item) => item.kind === 'videoinput').length
  } catch {
    return 1
  }
}

/** O quadro atual do vídeo, no tamanho real da câmera. */
export function capturarQuadro(video: HTMLVideoElement): Promise<ImageBitmap> {
  const tela = document.createElement('canvas')
  tela.width = video.videoWidth
  tela.height = video.videoHeight
  tela.getContext('2d')?.drawImage(video, 0, 0)
  return createImageBitmap(tela)
}

/** Foto da galeria, de pé conforme o EXIF. */
export function fotoDoArquivo(arquivo: File): Promise<ImageBitmap> {
  return createImageBitmap(arquivo, { imageOrientation: 'from-image' })
}
