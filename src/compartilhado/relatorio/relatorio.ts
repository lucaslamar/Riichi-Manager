/**
 * Relatório para mandar no grupo: o mesmo conteúdo vira texto do WhatsApp
 * (negrito com *asteriscos*) ou imagem (imagemDoRelatorio). Sem tela.
 */

export type TomLinha = 'positivo' | 'negativo'

export interface LinhaRelatorio {
  /** Texto à esquerda (ex.: "東 Leste: Adrian" ou "1. Joao vitor"). */
  esquerda: string
  /** Valor à direita (ex.: "1º · +38,0"). */
  direita?: string
  /** Cor do valor na imagem. */
  tom?: TomLinha
  /** Em negrito (ex.: o pódio). */
  destaque?: boolean
}

export interface BlocoRelatorio {
  titulo?: string
  /** Ao lado do título, mais apagado (ex.: "Finalizada"). */
  detalhe?: string
  linhas: LinhaRelatorio[]
}

export interface Relatorio {
  titulo: string
  subtitulo?: string
  blocos: BlocoRelatorio[]
}

/** Texto do WhatsApp: título em negrito, um bloco por parágrafo e "—" antes do valor. */
export function textoDoRelatorio(relatorio: Relatorio): string {
  const topo = [`*${relatorio.titulo}*`, ...(relatorio.subtitulo ? [`_${relatorio.subtitulo}_`] : [])].join('\n')
  const blocos = relatorio.blocos.map((bloco) => {
    const titulo = bloco.titulo ? [`*${bloco.titulo}*${bloco.detalhe ? ` · ${bloco.detalhe}` : ''}`] : []
    const linhas = bloco.linhas.map((linha) => {
      const esquerda = linha.destaque ? `*${linha.esquerda}*` : linha.esquerda
      return linha.direita ? `${esquerda} — ${linha.direita}` : esquerda
    })
    return [...titulo, ...linhas].join('\n')
  })
  return [topo, ...blocos].join('\n\n')
}

/** Nome de arquivo a partir de textos ("Torneio 09/11", "Rodada 1" → "torneio-09-11-rodada-1"). */
export function nomeDeArquivo(...partes: string[]): string {
  return partes
    .join(' ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}
