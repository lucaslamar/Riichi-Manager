/**
 * Relatório para mandar no grupo: o mesmo conteúdo vira texto do WhatsApp ou
 * imagem (imagemDoRelatorio). No texto, *negrito*, _itálico_ e as tabelas em
 * bloco ``` (monoespaçado), que o WhatsApp mostra com as colunas alinhadas. Sem tela.
 */

export type TomLinha = 'positivo' | 'negativo'

export interface LinhaRelatorio {
  /** Texto à esquerda (ex.: "東 Leste: Adrian" ou "1º Joao vitor"). */
  esquerda: string
  /** Valor à direita, ou uma coluna por valor numa tabela (ex.: ["+38,0", "1,00", "1"]). */
  direita?: string | readonly string[]
  /** Cor do valor na imagem. */
  tom?: TomLinha
  /** Em negrito (ex.: o pódio). */
  destaque?: boolean
}

export interface BlocoRelatorio {
  titulo?: string
  /** Ao lado do título (ex.: "✅ Finalizada"). */
  detalhe?: string
  linhas: LinhaRelatorio[]
  /** No texto, as linhas viram uma tabela em bloco monoespaçado. */
  tabela?: boolean
  /** Cabeçalho da tabela no texto: a coluna da esquerda e as da direita. */
  colunas?: readonly string[]
  /** Só no texto ou só na imagem (ex.: o pódio do texto, que a imagem já destaca). */
  so?: 'texto' | 'imagem'
}

export interface Relatorio {
  titulo: string
  subtitulo?: string
  blocos: BlocoRelatorio[]
}

/** Nomes longos cortados na tabela: no celular, o bloco monoespaçado tem pouca largura. */
const LARGURA_ESQUERDA = 16

/** Tamanho em caracteres que aparecem (acentos contam um só). */
function largura(texto: string): number {
  return [...texto.normalize('NFC')].length
}

function cortar(texto: string, maximo: number): string {
  const letras = [...texto.normalize('NFC')]
  return letras.length <= maximo ? texto : `${letras.slice(0, maximo - 1).join('')}…`
}

function preencher(texto: string, total: number, aDireita: boolean): string {
  const espaco = ' '.repeat(Math.max(0, total - largura(texto)))
  return aDireita ? espaco + texto : texto + espaco
}

export function colunasDaDireita(linha: LinhaRelatorio): readonly string[] {
  if (linha.direita === undefined) return []
  return typeof linha.direita === 'string' ? [linha.direita] : linha.direita
}

/** Tabela alinhada: a primeira coluna à esquerda e as outras à direita, dentro de ```. */
function tabelaEmTexto(bloco: BlocoRelatorio): string {
  const linhas = [
    ...(bloco.colunas ? [bloco.colunas] : []),
    ...bloco.linhas.map((linha) => [cortar(linha.esquerda, LARGURA_ESQUERDA), ...colunasDaDireita(linha)]),
  ]
  const totalColunas = Math.max(...linhas.map((linha) => linha.length))
  const larguras = Array.from({ length: totalColunas }, (_, coluna) =>
    Math.max(0, ...linhas.map((linha) => largura(linha[coluna] ?? ''))),
  )
  const texto = linhas.map((linha) =>
    larguras
      .map((total, coluna) => preencher(linha[coluna] ?? '', total, coluna > 0))
      .join('  ')
      .trimEnd(),
  )
  return ['```', ...texto, '```'].join('\n')
}

/**
 * Texto do WhatsApp: título em negrito e subtítulo em itálico, um bloco por
 * parágrafo, tabelas alinhadas em monoespaçado e "—" antes do valor nas listas.
 */
export function textoDoRelatorio(relatorio: Relatorio): string {
  const topo = [`*${relatorio.titulo}*`, ...(relatorio.subtitulo ? [`_${relatorio.subtitulo}_`] : [])].join('\n')
  const blocos = relatorio.blocos
    .filter((bloco) => bloco.so !== 'imagem')
    .map((bloco) => {
      const titulo = bloco.titulo ? [`*${bloco.titulo}*${bloco.detalhe ? ` · ${bloco.detalhe}` : ''}`] : []
      if (bloco.tabela) return [...titulo, tabelaEmTexto(bloco)].join('\n')
      const linhas = bloco.linhas.map((linha) => {
        const esquerda = linha.destaque ? `*${linha.esquerda}*` : linha.esquerda
        const direita = colunasDaDireita(linha).join(' · ')
        return direita ? `${esquerda} — ${direita}` : esquerda
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
