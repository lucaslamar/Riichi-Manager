/**
 * Mascote com a placa do QR, na assinatura da imagem da mão. Trocar a arte é
 * trocar só este arquivo: a nova precisa ter a mesma prancheta (800×1000, fundo
 * transparente) e a área do QR no mesmo lugar. O código não depende do desenho,
 * só destas medidas.
 */
export const MASCOTE_QR_SRC = `${import.meta.env.BASE_URL}mascote/mascote-qr-placeholder.svg`

/** Prancheta da arte: 800×1000, proporção 4:5. */
export const MASCOTE_PROPORCAO = 800 / 1000

/** Área do QR na placa (x 240, y 560, 320×320), em fração da prancheta. */
export const MASCOTE_AREA_QR = {
  esquerda: 240 / 800,
  topo: 560 / 1000,
  largura: 320 / 800,
  altura: 320 / 1000,
}
