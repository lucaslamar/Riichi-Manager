/**
 * Compartilha um texto pela folha do sistema (Web Share API) e, sem ela, copia
 * para a área de transferência. No React Native, trocar por `Share.share`.
 */
export type ResultadoCompartilhar = 'compartilhado' | 'copiado' | 'cancelado' | 'falhou'

export async function compartilharTexto(texto: string, titulo?: string): Promise<ResultadoCompartilhar> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ text: texto, ...(titulo ? { title: titulo } : {}) })
      return 'compartilhado'
    } catch (erro) {
      // Fechar a folha sem escolher nada não é erro e não deve copiar por baixo.
      if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado'
    }
  }
  try {
    await navigator.clipboard.writeText(texto)
    return 'copiado'
  } catch {
    return 'falhou'
  }
}
