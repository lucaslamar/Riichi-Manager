/**
 * @fileoverview Tipos e lógica de cálculo de pontos de uma mão de mahjong.
 *
 * Este módulo é uma "ponte" para a biblioteca `riichi` (github:1Computer1/riichi),
 * que faz o trabalho pesado de detectar yaku e calcular han/fu.
 *
 * Nosso papel aqui é:
 * 1. Definir tipos legíveis em TypeScript para o estado da mão.
 * 2. Converter o estado do nosso formato para o formato de string da biblioteca.
 * 3. Converter o resultado de volta para um formato útil para os componentes React.
 */

import Riichi from 'riichi'

// ─── Tipos de pedra ───────────────────────────────────────────────────────────

/** Naipe das pedras numéricas. m = manzu, p = pinzu, s = souzu. */
export type Naipe = 'm' | 'p' | 's'

/** Letras de honra. */
export type Honra = 'z'

/**
 * Código de uma pedra.
 * Usamos `string` simples para evitar template literal types problemáticos no Vite.
 * Exemplos válidos: "1m", "5p", "3z", "0m" (akadora).
 */
export type CodigoPedra = string

/** Uma sequência aberta (chii/pon) ou um kan. */
export type Meld =
  | { tipo: 'chiipon'; pedras: CodigoPedra[] }
  | { tipo: 'kan'; fechado: boolean; pedras: CodigoPedra[] }

/** Vento da mão: '1'=Leste, '2'=Sul, '3'=Oeste, '4'=Norte. */
export type VentoMao = '1' | '2' | '3' | '4'

// ─── Estado da mão ────────────────────────────────────────────────────────────

/**
 * Estado completo de uma mão sendo calculada.
 * Gerenciado via `useImmer` no componente PaginaCalculadora.
 */
export interface Mao {
  /** Pedras na mão (incluindo a pedra de agari). */
  pedras: CodigoPedra[]
  /** Sequências abertas ou kans. */
  melds: Meld[]
  /** Índice da pedra de agari dentro de `pedras`. */
  indiceAgari: number
  /** Tipo de ganho: tsumo (auto-draw) ou ron (roubo). */
  agari: 'ron' | 'tsumo'
  /** Indicadores de dora. */
  dora: CodigoPedra[]
  /** Indicadores de uradora (revelados ao fazer riichi). */
  uradora: CodigoPedra[]
  /** Pedras Kita (nukidora, sanma). */
  nukidora: number
  /** Han extras de yaku manuais. */
  hanYakuExtra: number
  /** Han extras de dora manual. */
  hanDoraExtra: number
  /** Yakuman extras. */
  yakumanExtra: number
  /** Estado do riichi: null se não fez. */
  riichi: { duplo: boolean; ippatsu: boolean } | null
  /** Tenhou/Chihou — bênção do céu/terra. */
  bencao: boolean
  /** Haitei/Houtei — última pedra. */
  ultimaPedra: boolean
  /** Rinshan/Chankan — depois de kan. */
  kan: boolean
  /** Vento da rodada atual. */
  ventoRodada: VentoMao
  /** Vento do assento do jogador. */
  ventoAssento: VentoMao
}

// ─── Ação em andamento ────────────────────────────────────────────────────────

/**
 * Ação que aguarda a próxima pedra clicada.
 * Ex.: se `acao = { tipo: 'pon' }`, a próxima pedra clicada forma um pon.
 */
export type Acao =
  | { tipo: 'chii'; pedras: CodigoPedra[] }
  | { tipo: 'pon' }
  | { tipo: 'kan' }
  | { tipo: 'kanFechado' }
  | { tipo: 'dora' }
  | { tipo: 'uradora' }

/**
 * Cria a ação padrão para um tipo.
 *
 * @param tipo - Tipo da ação.
 * @returns Objeto Acao pronto.
 */
export function criarAcao(tipo: Acao['tipo']): Acao {
  if (tipo === 'chii') return { tipo, pedras: [] }
  return { tipo } as Acao
}

// ─── Resultado de cálculo ─────────────────────────────────────────────────────

/** Pontos calculados para tsumo. */
type PontosTsumo = {
  agari: 'tsumo'
  pontos: { total: number; oya: { ko: number }; ko: { oya: number; ko: number } }
}

/** Pontos calculados para ron. */
type PontosRon = {
  agari: 'ron'
  pontos: { total: number; oya: { ron: number }; ko: { ron: number } }
}

/** Mão inválida ou sem yaku. */
type SemAgari = { agari: null }

/** União dos três casos possíveis de resultado. */
export type PontosCalculados = PontosTsumo | PontosRon | SemAgari

/** Resultado completo com yaku, han, fu e pontos. */
export type ResultadoMao = PontosCalculados & {
  isOya: boolean
  yakuman: number
  yaku: [string, number, boolean][]
  semYaku: boolean
  han: number
  fu: number
  nome: string | null
}

// ─── Configurações da calculadora ─────────────────────────────────────────────

/** Configurações de regras que afetam o cálculo. */
export interface ConfiguracaoCalculo {
  semYakuFu: boolean
  semYakuDora: boolean
  tanyaoAberto: boolean
  ryuuiisouHatsu: boolean
  multiYakuman: boolean
  yakumanDuplo: boolean
  kiriageMangan: boolean
  kazoeYakuman: boolean
  fuVentosDuplo: boolean
  fuRinshan: boolean
  sanma: 'perda' | 'divisao' | null
  yakuhaiNorte: boolean
  akadora: boolean
  yakuDesativados: string[]
  yakuLocaisAtivos: string[]
}

/** Configuração padrão para o jogo normal (EMA/JMA). */
export const configuracaoPadrao: ConfiguracaoCalculo = {
  semYakuFu: false,
  semYakuDora: false,
  tanyaoAberto: true,
  ryuuiisouHatsu: false,
  multiYakuman: true,
  yakumanDuplo: true,
  kiriageMangan: false,
  kazoeYakuman: true,
  fuVentosDuplo: true,
  fuRinshan: true,
  sanma: null,
  yakuhaiNorte: false,
  akadora: true,
  yakuDesativados: [],
  yakuLocaisAtivos: [],
}

// ─── Nomes de yaku em português ───────────────────────────────────────────────

/** Mapa de nome interno (biblioteca) → nome em português. */
const NOMES_YAKU: Record<string, string> = {
  riichi: 'Riichi',
  ippatsu: 'Ippatsu',
  tanyao: 'Tanyao',
  pinfu: 'Pinfu',
  iipeiko: 'Iipeiko',
  haitei: 'Haitei',
  houtei: 'Houtei',
  rinshan: 'Rinshan Kaihou',
  chankan: 'Chankan',
  menzen_tsumo: 'Menzen Tsumo',
  yakuhai: 'Yakuhai',
  chiitoi: 'Chiitoitsu',
  sanshoku: 'Sanshoku Doukou',
  ittsu: 'Ittsu',
  chanta: 'Chanta',
  sanshoku_doujun: 'Sanshoku Doujun',
  toitoi: 'Toitoihou',
  sananko: 'San Ankou',
  honroutou: 'Honroutou',
  shousangen: 'Shousangen',
  double_riichi: 'Double Riichi',
  honitsu: 'Honitsu',
  junchan: 'Junchan',
  ryanpeiko: 'Ryanpeiko',
  chinitsu: 'Chinitsu',
  tsuiso: 'Tsuuiisou',
  chinroto: 'Chinroutou',
  ryuuiisou: 'Ryuuiisou',
  daisangen: 'Daisangen',
  tenhou: 'Tenhou',
  chiihou: 'Chiihou',
  suuankou: 'Suuankou',
  suukantsu: 'Suukantsu',
  kokushi: 'Kokushi Musou',
  shosuushi: 'Shousuushii',
  daisuushi: 'Daisuushii',
}

/** Ordem de exibição dos yaku. */
const ORDEM_YAKU: Record<string, number> = Object.fromEntries(
  Object.keys(NOMES_YAKU).map((k, i) => [k, i]),
)

/**
 * Traduz o nome interno de um yaku para português.
 *
 * @param nomeInterno - Nome retornado pela biblioteca.
 * @returns Nome em português.
 */
export function traduzirYaku(nomeInterno: string): string {
  return NOMES_YAKU[nomeInterno] ?? nomeInterno
}

// ─── Conversão de mão para string ─────────────────────────────────────────────

/** Agrupa pedras por naipe para montar a string da biblioteca. */
function agruparPorNaipe(pedras: CodigoPedra[]): [string, string][] {
  const grupos: Record<string, string[]> = { m: [], p: [], s: [], z: [] }
  for (const pedra of pedras) {
    const naipe = pedra[1]
    if (naipe && grupos[naipe]) grupos[naipe].push(pedra[0])
  }
  return Object.entries(grupos)
    .filter(([, nums]) => nums.length > 0)
    .map(([naipe, nums]) => [naipe, nums.join('')])
}

/** Calcula a próxima dora a partir do indicador. */
function proximaDora(pedra: CodigoPedra, sanma: boolean): CodigoPedra {
  const num = Number(pedra[0]) || 5
  const naipe = pedra[1]
  if (naipe === 'z') {
    if (num <= 4) return `${(num % 4) + 1}z`
    return `${((num - 5) % 3) + 5}z`
  }
  if (sanma && naipe === 'm') return num === 1 ? '9m' : '1m'
  return `${(num % 9) + 1}${naipe}`
}

/**
 * Converte o estado de uma mão para a string de entrada da biblioteca `riichi`.
 *
 * @param mao - Estado completo da mão.
 * @returns String no formato da biblioteca.
 */
function converterMaoParaString(mao: Mao): string {
  let s = ''
  const sanma = mao.ventoRodada !== '4'

  // Pedras em mão (exceto agari)
  const pedrasSemAgari = mao.pedras.filter((_, i) => i !== mao.indiceAgari)
  for (const [naipe, nums] of agruparPorNaipe(pedrasSemAgari)) {
    s += nums + naipe
  }

  // Pedra de agari
  if (mao.agari === 'ron') s += '+'
  if (mao.indiceAgari >= 0 && mao.pedras[mao.indiceAgari]) {
    s += mao.pedras[mao.indiceAgari]
  }

  // Melds abertos
  for (const meld of mao.melds) {
    s += '+'
    if (meld.tipo === 'chiipon' || (meld.tipo === 'kan' && !meld.fechado)) {
      for (const pedra of meld.pedras) s += pedra[0]
      s += meld.pedras[0][1]
    } else {
      // Kan fechado: biblioteca usa apenas duas pedras
      s += meld.pedras[0][0] + meld.pedras[1][0] + meld.pedras[0][1]
    }
  }

  // Dora
  if (mao.dora.length) {
    s += '+d'
    for (const [naipe, nums] of agruparPorNaipe(mao.dora.map((d) => proximaDora(d, sanma)))) {
      s += nums + naipe
    }
  }

  // Uradora
  if (mao.uradora.length) {
    s += '+u'
    for (const [naipe, nums] of agruparPorNaipe(mao.uradora.map((d) => proximaDora(d, sanma)))) {
      s += nums + naipe
    }
  }

  // Modificadores
  s += '+'
  if (mao.riichi) s += mao.riichi.duplo ? 'w' : 'r'
  if (mao.riichi?.ippatsu) s += 'i'
  if (mao.bencao) s += 't'
  if (mao.ultimaPedra) s += 'h'
  if (mao.kan) s += 'k'
  s += mao.ventoRodada + mao.ventoAssento

  return s
}

// ─── Cálculo principal ────────────────────────────────────────────────────────

/**
 * Calcula os pontos de uma mão completa usando a biblioteca `riichi`.
 *
 * @param mao - Estado completo da mão (deve ter exatamente 14 pedras).
 * @param config - Configurações de regras.
 * @returns ResultadoMao com yaku, han, fu e pontos.
 */
export function calcularMao(mao: Mao, config: ConfiguracaoCalculo): ResultadoMao {
  const stringMao = converterMaoParaString(mao)

  const riichi = new Riichi(stringMao, {
    multiYakuman: config.multiYakuman,
    wyakuman: config.yakumanDuplo,
    kuitan: config.tanyaoAberto,
    ryuuiisouHatsu: config.ryuuiisouHatsu,
    noYakuFu: config.semYakuFu,
    noYakuDora: config.semYakuDora,
    kiriageMangan: config.kiriageMangan,
    kazoeYakuman: config.kazoeYakuman,
    doubleWindFu: config.fuVentosDuplo,
    rinshanFu: config.fuRinshan,
    sanma: config.sanma !== null,
    sanmaBisection: config.sanma === 'divisao',
    otakazePei: config.yakuhaiNorte,
    aka: config.akadora,
    disabledYaku: config.yakuDesativados,
    localYaku: config.yakuLocaisAtivos,
  })

  const resultado = riichi.calc()

  const isOya = mao.ventoAssento === '1'
  const yakuman = resultado.yakuman ?? 0

  const pontos: PontosCalculados = !resultado.isAgari
    ? { agari: null }
    : mao.agari === 'ron'
    ? {
        agari: 'ron',
        pontos: {
          total: resultado.ten,
          oya: { ron: resultado.oya[0] },
          ko: { ron: resultado.ko[0] },
        },
      }
    : {
        agari: 'tsumo',
        pontos: {
          total: resultado.ten,
          oya: { ko: resultado.oya[0] },
          ko: { oya: resultado.ko[0], ko: resultado.ko[1] },
        },
      }

  return {
    ...pontos,
    isOya,
    yakuman,
    yaku: Object.entries(resultado.yaku ?? {})
      .sort((a, b) => (ORDEM_YAKU[a[0]] ?? 99) - (ORDEM_YAKU[b[0]] ?? 99))
      .map(([nome, valor]) => {
        const traduzido = traduzirYaku(nome)
        const ehYakuman = String(valor).endsWith('役満')
        const han = ehYakuman
          ? parseInt(String(valor), 10) || 1
          : Number(/\d+/.exec(String(valor))?.[0]) || 0
        return [traduzido, han, ehYakuman] as [string, number, boolean]
      }),
    semYaku: resultado.noYaku ?? false,
    han: resultado.han ?? 0,
    fu: resultado.fu ?? 0,
    nome: resultado.name ? traduzirNomeMao(resultado.name) : null,
  }
}

/** Traduz nomes especiais de mãos para português. */
function traduzirNomeMao(nome: string): string {
  const mapa: Record<string, string> = {
    '満貫': 'Mangan',
    '跳満': 'Haneman',
    '倍満': 'Baiman',
    '三倍満': 'Sanbaiman',
    '数え役満': 'Yakuman Contado',
    '役満': 'Yakuman',
  }
  return mapa[nome] ?? nome
}

// ─── Calculadora rápida (Han/Fu manual) ──────────────────────────────────────

/**
 * Arredonda para cima na centena mais próxima.
 *
 * @param n - Número a arredondar.
 * @returns Número arredondado para cima na centena.
 */
export function arredondar100(n: number): number {
  return Math.ceil(n / 100) * 100
}

/**
 * Calcula pontos manualmente a partir de han e fu, sem montar uma mão completa.
 *
 * @param han - Número de han.
 * @param fu - Número de fu.
 * @param config - Configurações de regras.
 * @returns Tabela com os quatro valores base (tsumo oya/ko, ron oya/ko).
 */
export function calcularHanFu(
  han: number,
  fu: number,
  config: ConfiguracaoCalculo,
): { tsumoOya: number; tsumoKo: number; ronOya: number; ronKo: number } {
  let base = fu * Math.pow(2, han + 2)

  // Limites especiais
  if (config.kiriageMangan ? base >= 1920 : base > 2000) {
    if (config.kazoeYakuman && han >= 13) base = 8000
    else if (han >= 11) base = 6000
    else if (han >= 8) base = 4000
    else if (han >= 6) base = 3000
    else base = 2000
  }

  return {
    tsumoOya: arredondar100(base * 2),
    tsumoKo: arredondar100(base),
    ronOya: arredondar100(base * 6),
    ronKo: arredondar100(base * 4),
  }
}

/**
 * Mapa de han → fu válidos para cada tipo de agari.
 * Usado para popular os seletores da calculadora rápida.
 *
 * @param agari - Tipo de ganho.
 * @returns Map de han → lista de fu válidos.
 */
export function fuValidos(agari: 'tsumo' | 'ron'): Map<number, number[]> {
  const quando = (cond: boolean, val: number) => (cond ? [val] : [])
  return new Map<number, number[]>([
    [1, [30, 40, 50, 60, 70, 80, 90, 100, 110]],
    [2, [...quando(agari === 'tsumo', 20), ...quando(agari === 'ron', 25), 30, 40, 50, 60, 70, 80, 90, 100, 110]],
    [3, [...quando(agari === 'tsumo', 20), 25, 30, 40, 50, 60]],
    [4, [...quando(agari === 'tsumo', 20), 25, 30]],
  ])
}

/**
 * Monta o resultado de pontos para exibição na calculadora rápida.
 *
 * @param isOya - True se o jogador é o Leste (dealer).
 * @param agari - Tipo de ganho.
 * @param tabela - Resultado de `calcularHanFu`.
 * @returns PontosCalculados prontos para exibição.
 */
export function montarPontosRapidos(
  isOya: boolean,
  agari: 'tsumo' | 'ron',
  tabela: ReturnType<typeof calcularHanFu>,
): Exclude<PontosCalculados, { agari: null }> {
  const { tsumoOya, tsumoKo, ronOya, ronKo } = tabela
  return agari === 'ron'
    ? {
        agari: 'ron',
        pontos: {
          total: isOya ? ronOya : ronKo,
          oya: { ron: ronOya },
          ko: { ron: ronKo },
        },
      }
    : {
        agari: 'tsumo',
        pontos: {
          total: isOya ? tsumoOya * 3 : tsumoOya + tsumoKo * 2,
          oya: { ko: tsumoOya },
          ko: { oya: tsumoOya, ko: tsumoKo },
        },
      }
}

// ─── Ordenação de pedras ──────────────────────────────────────────────────────

const ORDEM_NAIPE: Record<string, number> = { m: 0, p: 1, s: 2, z: 3 }

/**
 * Ordena pedras por naipe e número (mutável — altera o array original).
 *
 * @param pedras - Array de pedras a ordenar.
 * @returns O mesmo array, ordenado.
 */
export function ordenarPedras(pedras: CodigoPedra[]): CodigoPedra[] {
  return pedras.sort((a, b) => {
    const na = a[1] ?? '', nb = b[1] ?? ''
    return (ORDEM_NAIPE[na] ?? 9) - (ORDEM_NAIPE[nb] ?? 9)
      || (Number(a[0]) || 4.9) - (Number(b[0]) || 4.9)
  })
}

/**
 * Ordena melds por naipe da primeira pedra (mutável).
 *
 * @param melds - Array de melds a ordenar.
 * @returns O mesmo array, ordenado.
 */
export function ordenarMelds(melds: Meld[]): Meld[] {
  return melds.sort((a, b) => {
    const na = a.pedras[0]?.[1] ?? '', nb = b.pedras[0]?.[1] ?? ''
    return (ORDEM_NAIPE[na] ?? 9) - (ORDEM_NAIPE[nb] ?? 9)
  })
}
