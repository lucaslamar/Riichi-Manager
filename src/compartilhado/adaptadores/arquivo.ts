/**
 * Arquivos: enviar pela folha do sistema (quando aceita arquivos) ou baixar, e
 * ler o arquivo escolhido. No React Native, trocar por expo-sharing e
 * expo-document-picker.
 */
export type ResultadoArquivo = 'compartilhado' | 'baixado' | 'cancelado' | 'falhou'

export async function salvarArquivo(
  nome: string,
  conteudo: string,
  tipo = 'application/json',
): Promise<ResultadoArquivo> {
  const arquivo = new File([conteudo], nome, { type: tipo })
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [arquivo] })
  ) {
    try {
      await navigator.share({ files: [arquivo], title: nome })
      return 'compartilhado'
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado'
    }
  }
  try {
    const url = URL.createObjectURL(arquivo)
    const link = document.createElement('a')
    link.href = url
    link.download = nome
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    return 'baixado'
  } catch {
    return 'falhou'
  }
}

export function lerArquivoTexto(arquivo: File): Promise<string> {
  return arquivo.text()
}

export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    return false
  }
}
