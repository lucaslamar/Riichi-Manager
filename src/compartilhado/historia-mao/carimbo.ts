/**
 * Carimbo de borracha das mãos grandes (Mangan para cima), como os selos
 * "ORIGINAL": anel duplo, "RIICHI MAHJONG" curvo em cima, o han/fu curvo
 * embaixo, estrelas e a palavra do nível atravessando o meio. O SVG sai em
 * texto (`svgDoCarimbo`) e é o mesmo na prévia e na imagem exportada: com a
 * mesma semente, o desgaste da tinta fica igual nos dois.
 */

export type NivelCarimbo = 'mangan' | 'haneman' | 'baiman' | 'sanbaiman' | 'yakuman' | 'kazoe'

export interface DadosCarimbo {
  nivel: NivelCarimbo
  han: number
  fu: number
  /** Quantos yakuman (1, 2...). Só no nível yakuman. */
  yakuman: number
  /** Fixa por mão: decide o desgaste e a inclinação. */
  semente: number
}

const NIVEIS: Record<NivelCarimbo, { palavra: string; rotulo: string; estrelas: number }> = {
  mangan: { palavra: 'MANGAN', rotulo: 'Mangan', estrelas: 1 },
  haneman: { palavra: 'HANEMAN', rotulo: 'Haneman', estrelas: 2 },
  baiman: { palavra: 'BAIMAN', rotulo: 'Baiman', estrelas: 3 },
  sanbaiman: { palavra: 'SANBAIMAN', rotulo: 'Sanbaiman', estrelas: 4 },
  yakuman: { palavra: 'YAKUMAN', rotulo: 'Yakuman', estrelas: 5 },
  kazoe: { palavra: 'KAZOE', rotulo: 'Kazoe Yakuman', estrelas: 5 },
}

const VERMELHO = '#E5484D'
const DOURADO = '#E0B341'

/** Uma cor sólida por nível, como tinta. Mangan e Haneman no roxo do app. */
export function tintaDoCarimbo(nivel: NivelCarimbo, roxo: string): string {
  if (nivel === 'baiman' || nivel === 'sanbaiman') return VERMELHO
  if (nivel === 'yakuman' || nivel === 'kazoe') return DOURADO
  return roxo
}

/**
 * Nível pelo nome do patamar que o cálculo devolve. Abaixo de Mangan (ou sem
 * patamar), não há carimbo.
 */
export function nivelDoCarimbo(nome: string | undefined | null): NivelCarimbo | undefined {
  if (!nome) return undefined
  if (/^\d+\s*[x×]\s*Yakuman$/.test(nome) || nome === 'Yakuman') return 'yakuman'
  if (nome === 'Kazoe Yakuman' || nome === 'Yakuman Contado') return 'kazoe'
  const nivel = nome.toLowerCase()
  return nivel === 'mangan' || nivel === 'haneman' || nivel === 'baiman' || nivel === 'sanbaiman'
    ? nivel
    : undefined
}

/** Semente fixa a partir de um texto que identifica a mão. */
export function sementeDoTexto(texto: string): number {
  let hash = 2166136261
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % 9973
}

/** Inclinação entre -8° e -14°, sorteada pela semente. */
export function giroDoCarimbo(semente: number): number {
  return -8 - (semente % 7)
}

function textoDeBaixo({ nivel, han, fu, yakuman }: DadosCarimbo): string {
  return nivel === 'yakuman' ? `- ${Math.max(1, yakuman)}× YAKUMAN -` : `- ${han} HAN · ${fu} FU -`
}

/** "Sanbaiman, 11 han 20 fu" ou "Yakuman, 2× yakuman". */
export function rotuloDoCarimbo(dados: DadosCarimbo): string {
  const { rotulo } = NIVEIS[dados.nivel]
  return dados.nivel === 'yakuman'
    ? `${rotulo}, ${Math.max(1, dados.yakuman)}× yakuman`
    : `${rotulo}, ${dados.han} han ${dados.fu} fu`
}

const CARACTERES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-·× '
const FAMILIA = `'Anton Carimbo', Anton, Impact, 'Arial Narrow', sans-serif`

let fonte: Promise<string | null> | null = null

/**
 * A Anton (único peso) do Google Fonts, só com os caracteres do carimbo, em
 * data URL: o SVG vira imagem e imagem não carrega fonte de fora. Sem rede,
 * fica a fonte condensada do sistema.
 */
export function carregarFonteCarimbo(): Promise<string | null> {
  fonte ??= (async () => {
    try {
      const css = await (
        await fetch(
          `https://fonts.googleapis.com/css2?family=Anton&text=${encodeURIComponent(CARACTERES)}`,
        )
      ).text()
      const endereco = css.match(/url\((https:[^)]+)\)/)?.[1]
      if (!endereco) return null
      const bytes = new Uint8Array(await (await fetch(endereco)).arrayBuffer())
      let binario = ''
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      }
      return `data:font/woff2;base64,${btoa(binario)}`
    } catch {
      return null
    }
  })()
  return fonte
}

function estrela(x: number, y: number, raio: number): string {
  const pontos: string[] = []
  for (let i = 0; i < 10; i++) {
    const alcance = i % 2 === 0 ? raio : raio * 0.45
    const angulo = -Math.PI / 2 + (i * Math.PI) / 5
    pontos.push(
      `${(x + alcance * Math.cos(angulo)).toFixed(2)},${(y + alcance * Math.sin(angulo)).toFixed(2)}`,
    )
  }
  return `<polygon points="${pontos.join(' ')}"/>`
}

function linhaDeEstrelas(quantidade: number, y: number): string {
  const passo = 16
  const meio = (quantidade - 1) / 2
  return Array.from({ length: quantidade }, (_, i) =>
    estrela(100 + (i - meio) * passo, y, i === meio ? 8 : 6),
  ).join('')
}

/**
 * O carimbo em SVG (viewBox 200), já inclinado pela semente: a imagem fica
 * reta e não passa da própria caixa. `fundo` é a cor do card, usada na faixa que
 * "corta" o círculo interno atrás da palavra. Sem preenchimento: só tinta.
 */
export function svgDoCarimbo(
  dados: DadosCarimbo,
  {
    tinta,
    fundo,
    fonteDados,
    lado,
  }: { tinta: string; fundo: string; fonteDados: string | null; lado: number },
): string {
  const { palavra, estrelas } = NIVEIS[dados.nivel]
  const fonteFace = fonteDados
    ? `@font-face{font-family:'Anton Carimbo';src:url(${fonteDados}) format('woff2');}`
    : ''
  // Falhas de ~15% da área: o ruído vira alfa com um corte abaixo da média.
  const desgaste = `<filter id="r" x="0" y="0" width="200" height="200" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${dados.semente}"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 9 0 0 0 -2.8"/></filter><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff" filter="url(#r)"/></mask>`
  const texto = `font-family:${FAMILIA};fill:${tinta}`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 200 200"><defs><style>${fonteFace}</style>${desgaste}<path id="cima" d="M 18.4 100 A 81.6 81.6 0 0 1 181.6 100"/><path id="baixo" d="M 9 100 A 91 91 0 0 0 191 100"/></defs><g transform="rotate(${giroDoCarimbo(dados.semente)} 100 100)"><g mask="url(#m)" fill="none" stroke="${tinta}"><circle cx="100" cy="100" r="94" stroke-width="6"/><circle cx="100" cy="100" r="80" stroke-width="2"/><circle cx="100" cy="100" r="62" stroke-width="3"/><g stroke="none" fill="${tinta}">${linhaDeEstrelas(estrelas, 63)}${linhaDeEstrelas(estrelas, 137)}</g><text style="${texto};font-size:11px;letter-spacing:0.15em" stroke="none" text-anchor="middle"><textPath href="#cima" startOffset="50%">- RIICHI MAHJONG -</textPath></text><text style="${texto};font-size:11px;letter-spacing:0.15em" stroke="none" text-anchor="middle"><textPath href="#baixo" startOffset="50%">${textoDeBaixo(dados)}</textPath></text></g><rect x="22" y="79" width="156" height="42" fill="${fundo}"/><g mask="url(#m)"><text x="100" y="101" style="${texto};font-size:38px" text-anchor="middle" dominant-baseline="central" textLength="150" lengthAdjust="spacingAndGlyphs">${palavra}</text></g></g></svg>`
}

export function enderecoDoSvg(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
