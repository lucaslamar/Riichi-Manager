/**
 * Carimbo hanko das mãos grandes (Mangan para cima): os níveis, o desenho de
 * cada um e a fonte dos kanji. Usado pela tela (`HanCarimbo`, em SVG) e pela
 * imagem exportada (canvas), para os dois saírem iguais.
 */

export type NivelCarimbo = 'mangan' | 'haneman' | 'baiman' | 'sanbaiman' | 'yakuman' | 'kazoe'

export interface DesenhoCarimbo {
  /** Uma linha por item. */
  kanji: string[]
  romaji: string
  /** Nome do nível para leitor de tela. */
  rotulo: string
  /** Cor da tinta; `null` usa o roxo do app. */
  tinta: string | null
  /** Espessura do anel de fora, nas medidas de um selo de 100. */
  anel: number
  anelDuplo: boolean
  preenchido: boolean
  pesoKanji: 700 | 900
}

const VERMELHAO = '#D9433B'
export const DOURADO = '#E0B341'
/** Kanji e anéis sobre o dourado. */
export const TINTA_ESCURA = '#2a1d05'

export const DESENHOS: Record<NivelCarimbo, DesenhoCarimbo> = {
  mangan: base(['満貫'], 'Mangan', null, 3, false),
  haneman: base(['跳満'], 'Haneman', null, 5, false),
  baiman: base(['倍満'], 'Baiman', VERMELHAO, 3, true),
  sanbaiman: { ...base(['三倍満'], 'Sanbaiman', VERMELHAO, 3, true), pesoKanji: 900 },
  yakuman: { ...base(['役満'], 'Yakuman', DOURADO, 3, true), preenchido: true },
  kazoe: { ...base(['数え', '役満'], 'Kazoe Yakuman', DOURADO, 3, true), preenchido: true },
}

function base(
  kanji: string[],
  rotulo: string,
  tinta: string | null,
  anel: number,
  anelDuplo: boolean,
): DesenhoCarimbo {
  return {
    kanji,
    romaji: rotulo.toUpperCase(),
    rotulo,
    tinta,
    anel,
    anelDuplo,
    preenchido: false,
    pesoKanji: 700,
  }
}

/** Tamanho do kanji (num selo de 100) para caber no círculo. */
export function tamanhoKanji(desenho: DesenhoCarimbo): number {
  if (desenho.kanji.length > 1) return 19
  return desenho.kanji[0].length > 2 ? 23 : 31
}

/**
 * Nível do carimbo pelo nome do patamar que o cálculo devolve. Abaixo de
 * Mangan (ou sem patamar), não há carimbo.
 */
export function nivelDoCarimbo(nome: string | undefined): NivelCarimbo | undefined {
  if (!nome) return undefined
  if (/^\d+\s*[x×]\s*Yakuman$/.test(nome) || nome === 'Yakuman') return 'yakuman'
  if (nome === 'Kazoe Yakuman' || nome === 'Yakuman Contado') return 'kazoe'
  const nivel = nome.toLowerCase()
  return nivel === 'mangan' || nivel === 'haneman' || nivel === 'baiman' || nivel === 'sanbaiman'
    ? nivel
    : undefined
}

export const FONTE_KANJI = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif'
const CARACTERES = '満貫跳倍三役数え'

let carregando: Promise<void> | null = null

/**
 * Carrega a Noto Serif JP (700 e 900) só com os kanji do carimbo, pelo `text=`
 * do Google Fonts. Sem rede, fica a serif do sistema.
 */
export function carregarFonteCarimbo(): Promise<void> {
  if (carregando) return carregando
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700;900&text=${encodeURIComponent(CARACTERES)}&display=swap`
  document.head.appendChild(link)
  carregando = new Promise<void>((resolver) => {
    link.onload = () => resolver()
    link.onerror = () => resolver()
  }).then(() =>
    Promise.all([
      document.fonts.load(`700 40px "Noto Serif JP"`, CARACTERES),
      document.fonts.load(`900 40px "Noto Serif JP"`, CARACTERES),
    ]).then(
      () => undefined,
      () => undefined,
    ),
  )
  return carregando
}
