/**
 * @fileoverview Tipos e lógica de cálculo de pontos de uma mão de mahjong.
 *
 * Ponte para a biblioteca `riichi` (github:1Computer1/riichi).
 * Referência do formato de string aceito pela lib:
 *   123m456p789s11z+7z+r12   (pedras + agari + modificadores)
 *   +111m  = pon/chii aberto
 *   +1111m = kan aberto
 *   +11m   = kan FECHADO (só 2 pedras, não 4!)
 */

import Riichi from 'riichi'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CodigoPedra = string  // ex: "1m", "5p", "3z"
export type VentoMao = '1' | '2' | '3' | '4'

export type Meld =
  | { tipo: 'chii';         pedras: CodigoPedra[] }   // sequência
  | { tipo: 'pon';          pedras: CodigoPedra[] }   // trinca aberta
  | { tipo: 'kanAberto';    pedras: CodigoPedra[] }   // kan declarado (aberto)
  | { tipo: 'kanFechado';   pedras: CodigoPedra[] }   // kan concealed (fechado)

export interface Mao {
  pedras: CodigoPedra[]
  melds: Meld[]
  indiceAgari: number
  agari: 'ron' | 'tsumo'
  dora: CodigoPedra[]
  uradora: CodigoPedra[]
  riichi: { duplo: boolean; ippatsu: boolean } | null
  bencao: boolean
  ultimaPedra: boolean
  kan: boolean          // rinshan (tsumo após kan) ou chankan (ron em kan)
  ventoRodada: VentoMao
  ventoAssento: VentoMao
}

export type Acao =
  | { tipo: 'chii';       pedras: CodigoPedra[] }
  | { tipo: 'pon' }
  | { tipo: 'kanAberto' }
  | { tipo: 'kanFechado' }
  | { tipo: 'dora' }
  | { tipo: 'uradora' }

export function criarAcao(tipo: Acao['tipo']): Acao {
  if (tipo === 'chii') return { tipo, pedras: [] }
  return { tipo } as Acao
}

// ─── Configuração ─────────────────────────────────────────────────────────────

export interface ConfiguracaoCalculo {
  tanyaoAberto: boolean
  multiYakuman: boolean
  yakumanDuplo: boolean
  kiriageMangan: boolean
  kazoeYakuman: boolean
  fuVentosDuplo: boolean
  fuRinshan: boolean
  akadora: boolean
}

export const configuracaoPadrao: ConfiguracaoCalculo = {
  tanyaoAberto: true,
  multiYakuman: true,
  yakumanDuplo: true,
  kiriageMangan: false,
  kazoeYakuman: true,
  fuVentosDuplo: false,
  fuRinshan: true,
  akadora: true,
}

// ─── Tradução de yaku ─────────────────────────────────────────────────────────

/**
 * Mapa de nomes da biblioteca (inglês/japonês) → português.
 * A lib retorna as chaves em japonês (ex: "役牌白"), mas o campo `name`
 * que usamos via `yaku` está em inglês.
 */
const TRADUCAO_YAKU: Record<string, string> = {
  // Chaves japonesas retornadas pela biblioteca riichi
  '\u56fd\u58eb\u7121\u53cc\u5341\u4e09\u9762\u5f85\u3061': 'Kokushi Musou 13-men machi',
  '\u56fd\u58eb\u7121\u53cc': 'Kokushi Musou',
  '\u7d14\u6b63\u4e5d\u84ee\u5b9d\u71c8': 'Junsei Chuuren Poutou',
  '\u4e5d\u84ee\u5b9d\u71c8': 'Chuuren Poutou',
  '\u56db\u6697\u523b\u5358\u9a0e\u5f85\u3061': 'Suuankou Tanki',
  '\u56db\u6697\u523b': 'Suuankou',
  '\u5927\u56db\u559c': 'Daisuushii',
  '\u5c0f\u56db\u559c': 'Shousuushii',
  '\u5927\u4e09\u5143': 'Daisangen',
  '\u5b57\u4e00\u8272': 'Tsuuiisou',
  '\u7dd1\u4e00\u8272': 'Ryuuiisou',
  '\u6e05\u8001\u982d': 'Chinroutou',
  '\u56db\u69d3\u5b50': 'Suukantsu',
  '\u5929\u548c': 'Tenhou',
  '\u5730\u548c': 'Chiihou',
  '\u4eba\u548c': 'Renhou',
  '\u6e05\u4e00\u8272': 'Chinitsu',
  '\u6df7\u4e00\u8272': 'Honitsu',
  '\u4e8c\u76c3\u53e3': 'Ryanpeikou',
  '\u7d14\u5168\u5e2f\u4e48\u4e5d': 'Junchan',
  '\u6df7\u5168\u5e2f\u4e48\u4e5d': 'Chanta',
  '\u5bfe\u3005\u548c': 'Toitoi',
  '\u6df7\u8001\u982d': 'Honroutou',
  '\u4e09\u69d3\u5b50': 'Sankantsu',
  '\u5c0f\u4e09\u5143': 'Shousangen',
  '\u4e09\u8272\u540c\u523b': 'Sanshoku Doukou',
  '\u4e09\u6697\u523b': 'San Ankou',
  '\u4e03\u5bfe\u5b50': 'Chiitoitsu',
  '\u30c0\u30d6\u30eb\u7acb\u76f4': 'Double Riichi',
  '\u4e00\u6c17\u901a\u8cab': 'Ittsu',
  '\u4e09\u8272\u540c\u9806': 'Sanshoku Doujun',
  '\u65ad\u4e48\u4e5d': 'Tanyao',
  '\u5e73\u548c': 'Pinfu',
  '\u4e00\u76c3\u53e3': 'Iipeikou',
  '\u9580\u524d\u6e05\u81ea\u6478\u548c': 'Menzen Tsumo',
  '\u7acb\u76f4': 'Riichi',
  '\u4e00\u767a': 'Ippatsu',
  '\u5dba\u4e0a\u958b\u82b1': 'Rinshan Kaihou',
  '\u6436\u69d3': 'Chankan',
  '\u6d77\u5e95\u6478\u6708': 'Haitei Raoyue',
  '\u6cb3\u5e95\u6488\u9b5a': 'Houtei Raoyui',
  '\u5834\u98a8\u6771': 'Bakaze Ton',
  '\u5834\u98a8\u5357': 'Bakaze Nan',
  '\u5834\u98a8\u897f': 'Bakaze Sha',
  '\u5834\u98a8\u5317': 'Bakaze Pei',
  '\u81ea\u98a8\u6771': 'Jikaze Ton',
  '\u81ea\u98a8\u5357': 'Jikaze Nan',
  '\u81ea\u98a8\u897f': 'Jikaze Sha',
  '\u81ea\u98a8\u5317': 'Jikaze Pei',
  '\u5f79\u724c\u767d': 'Yakuhai Haku',
  '\u5f79\u724c\u767a': 'Yakuhai Hatsu',
  '\u5f79\u724c\u4e2d': 'Yakuhai Chun',
  '\u8d64\u30c9\u30e9': 'Akadora',
  '\u30c9\u30e9': 'Dora',
  '\u88cf\u30c9\u30e9': 'Uradora',
  // Yaku normais
  'Riichi':                       'Riichi',
  'Double Riichi':                'Double Riichi',
  'Ippatsu':                      'Ippatsu',
  'Fully Concealed Hand':         'Menzen Tsumo',
  'Pinfu':                        'Pinfu',
  'Pure Double Sequence':         'Iipeiko',
  'All Simples':                  'Tanyao',
  'Mixed Triple Sequence':        'Sanshoku Doujun',
  'Pure Straight':                'Ittsu (Sequência Pura)',
  'Half Outside Hand':            'Chanta',
  'Pure Triple Sequence':         'Sanshoku Doukou',
  'All Triplets':                 'Toitoihou',
  'Three Concealed Triplets':     'San Ankou',
  'Three Quads':                  'Sankantsu',
  'Three Little Dragons':         'Shousangen',
  'All Terminals and Honors':     'Honroutou',
  'Half Flush':                   'Honitsu',
  'Fully Outside Hand':           'Junchan',
  'Twice Pure Double Sequence':   'Ryanpeiko',
  'Full Flush':                   'Chinitsu',
  'After a Kan':                  'Rinshan Kaihou',
  'Robbing a Kan':                'Chankan',
  'Under the Sea':                'Haitei Raoyue',
  'Under the River':              'Houtei Raoyui',
  'Yakuhai (Dragons)':            'Yakuhai (Dragão)',
  'Yakuhai (Winds)':              'Yakuhai (Vento)',
  'White Dragon':                 'Haku',
  'Green Dragon':                 'Hatsu',
  'Red Dragon':                   'Chun',
  'Prevalent Wind (East)':        'Vento da Rodada (Leste)',
  'Prevalent Wind (South)':       'Vento da Rodada (Sul)',
  'Prevalent Wind (West)':        'Vento da Rodada (Oeste)',
  'Prevalent Wind (North)':       'Vento da Rodada (Norte)',
  'Seat Wind (East)':             'Vento do Assento (Leste)',
  'Seat Wind (South)':            'Vento do Assento (Sul)',
  'Seat Wind (West)':             'Vento do Assento (Oeste)',
  'Seat Wind (North)':            'Vento do Assento (Norte)',
  'Seven Pairs':                  'Chiitoitsu',
  'Dora':                         'Dora',
  'Uradora':                      'Uradora',
  'Red Fives':                    'Akadora',
  // Yakuman
  'Thirteen Orphans':             'Kokushi Musou',
  'Thirteen-Wait Thirteen Orphans': 'Kokushi (13 esperas)',
  'Nine Gates':                   'Chuuren Poutou',
  'True Nine Gates':              'Chuuren (9 esperas)',
  'Four Concealed Triplets':      'Suuankou',
  'Single-Wait Four Concealed Triplets': 'Suuankou (espera tanki)',
  'Four Big Winds':               'Daisuushii',
  'Four Little Winds':            'Shousuushii',
  'Three Big Dragons':            'Daisangen',
  'All Honors':                   'Tsuuiisou',
  'All Green':                    'Ryuuiisou',
  'All Terminals':                'Chinroutou',
  'Four Quads':                   'Suukantsu',
  'Blessing of Heaven':           'Tenhou',
  'Blessing of Earth':            'Chiihou',
  'Big Seven Stars':              'Daichiishin',
}

const ORDEM_YAKU: Record<string, number> = Object.fromEntries(
  Object.keys(TRADUCAO_YAKU).map((k, i) => [k, i])
)

/**
 * Traduz o nome de um yaku da biblioteca para português.
 * Se não houver tradução, retorna o nome original.
 */
export function traduzirYaku(nome: string): string {
  return TRADUCAO_YAKU[nome] ?? nome
}

/** Traduz nomes especiais de patamar (満貫, 役満, etc.) para português. */
export function traduzirPatamares(nome: string): string {
  const patamaresRomaji: Record<string, string> = {
    '\u6e80\u8cab': 'Mangan',
    '\u8df3\u6e80': 'Haneman',
    '\u500d\u6e80': 'Baiman',
    '\u4e09\u500d\u6e80': 'Sanbaiman',
    '\u6570\u3048\u5f79\u6e80': 'Kazoe Yakuman',
    '\u5f79\u6e80': 'Yakuman',
  }
  const yakumanMultiplo = nome.match(/^(\d+)\u500d\u5f79\u6e80$/)
  if (yakumanMultiplo) return `${yakumanMultiplo[1]}x Yakuman`
  if (patamaresRomaji[nome]) return patamaresRomaji[nome]

  const mapa: Record<string, string> = {
    '満貫': 'Mangan',
    '跳満': 'Haneman',
    '倍満': 'Baiman',
    '三倍満': 'Sanbaiman',
    '数え役満': 'Yakuman Contado',
    '役満': 'Yakuman',
  }
  // Yakuman múltiplos: "2役満", "3役満" etc.
  const m = nome.match(/^(\d+)役満$/)
  if (m) return `${m[1]}× Yakuman`
  return mapa[nome] ?? nome
}

function rotuloPedraFu(valor: string | string[] | undefined): string {
  const lista = Array.isArray(valor) ? valor : valor ? [valor] : []
  const nomes: Record<string, string> = {
    '1z': 'Leste',
    '2z': 'Sul',
    '3z': 'Oeste',
    '4z': 'Norte',
    '5z': 'Haku',
    '6z': 'Hatsu',
    '7z': 'Chun',
  }
  const naipes: Record<string, string> = { m: 'man', p: 'pin', s: 'sou' }
  return lista
    .map((pedra) => nomes[pedra] ?? `${pedra[0]} ${naipes[pedra[1]] ?? pedra[1] ?? ''}`.trim())
    .join(', ')
}

function traduzirDetalhesFu(padroes: Array<Record<string, any>>): DetalheFu[] {
  return padroes
    .filter((padrao) => Number(padrao.fu) > 0)
    .map((padrao) => {
      const fu = Number(padrao.fu)
      const pedra = rotuloPedraFu(padrao.v)
      switch (padrao.t) {
        case 'base':
          return { tipo: 'Base', descricao: 'Fu base de toda mão vencedora', fu }
        case 'chiitoi':
          return { tipo: 'Chiitoitsu', descricao: 'Sete pares usa valor fixo de 25 fu', fu }
        case 'pinfuTsumo':
          return { tipo: 'Pinfu tsumo', descricao: 'Mão fechada de Pinfu vencida por tsumo', fu }
        case 'closedRon':
          return { tipo: 'Ron fechado', descricao: 'Mão fechada vencida por descarte', fu }
        case 'rinshanTsumo':
          return { tipo: 'Rinshan', descricao: 'Tsumo após kan, conforme a regra selecionada', fu }
        case 'tsumo':
          return { tipo: 'Tsumo', descricao: 'Vitória por compra própria', fu }
        case 'openPinfu':
          return { tipo: 'Mão aberta sem fu', descricao: 'Arredondamento mínimo para mão aberta sem outro fu', fu }
        case 'yakuhaiPair':
          return {
            tipo: 'Par de yakuhai',
            descricao: `${pedra || 'Par de valor'}${padrao.double ? ' como vento da rodada e do assento' : ''}`,
            fu,
          }
        case 'triplet':
          return {
            tipo: padrao.open ? 'Trinca aberta' : 'Trinca fechada',
            descricao: `${pedra || 'Trinca'}${padrao.yaochuu ? ' de terminal/honra' : ' de simples'}`,
            fu,
          }
        case 'quad':
          return {
            tipo: padrao.open ? 'Kan aberto' : 'Kan fechado',
            descricao: `${pedra || 'Kan'}${padrao.yaochuu ? ' de terminal/honra' : ' de simples'}`,
            fu,
          }
        case 'wait': {
          const esperas: Record<string, string> = {
            ryanmen: 'espera aberta dos dois lados',
            shanpon: 'espera em par para formar trinca',
            kanchan: 'espera fechada no meio',
            penchan: 'espera de ponta',
            tanki: 'espera no par',
          }
          return { tipo: 'Espera', descricao: esperas[padrao.w] ?? 'Tipo de espera', fu }
        }
        default:
          return { tipo: String(padrao.t ?? 'Fu'), descricao: 'Detalhe retornado pela biblioteca', fu }
      }
    })
}

// ─── Conversão para string ────────────────────────────────────────────────────

/** Agrupa pedras por naipe: ["1m","3m","2p"] → [["m","13"],["p","2"]] */
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

/** Calcula a pedra dora real a partir do indicador. */
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
 * Converte o estado da mão para a string de entrada da biblioteca `riichi`.
 *
 * Formato: pedras_em_mao + agari + melds + dora + modificadores
 * Exemplo: "123m456p+7p+111m+11z+r12"
 *   - +7p  = agari por ron na pedra 7p
 *   - +111m = pon de 1m
 *   - +11z  = kan fechado de 1z (apenas 2 pedras!)
 *   - +r12  = riichi, vento rodada=1, vento assento=2
 *
 * IMPORTANTE sobre kans:
 *   - Kan aberto  (+1111m): 4 pedras
 *   - Kan fechado (+11m):   apenas 2 pedras! (a lib deduz que é kan pelo contexto)
 */
function converterMaoParaString(mao: Mao): string {
  let s = ''
  const sanma = false // padrão: yonma (4 jogadores)

  // 1. Pedras em mão (exceto a de agari)
  const pedrasSemAgari = mao.pedras.filter((_, i) => i !== mao.indiceAgari)
  for (const [naipe, nums] of agruparPorNaipe(pedrasSemAgari)) {
    s += nums + naipe
  }

  // 2. Pedra de agari (prefixo '+' apenas para ron)
  const pedraAgari = mao.pedras[mao.indiceAgari]
  if (pedraAgari) {
    if (mao.agari === 'ron') s += '+'
    s += pedraAgari
  }

  // 3. Melds
  for (const meld of mao.melds) {
    s += '+'
    if (meld.tipo === 'chii' || meld.tipo === 'pon' || meld.tipo === 'kanAberto') {
      // Chii, pon e kan aberto: todas as pedras
      for (const p of meld.pedras) s += p[0]
      s += meld.pedras[0][1]
    } else {
      // Kan FECHADO: a lib espera apenas 2 pedras (1ª e 2ª)
      // Usar as duas primeiras para não duplicar akadora
      s += meld.pedras[0][0] + meld.pedras[1][0] + meld.pedras[0][1]
    }
  }

  // 4. Dora (indicadores → lib converte para a pedra real internamente)
  if (mao.dora.length) {
    s += '+d'
    for (const [naipe, nums] of agruparPorNaipe(mao.dora.map((d) => proximaDora(d, sanma)))) {
      s += nums + naipe
    }
  }

  // 5. Uradora
  if (mao.uradora.length) {
    s += '+u'
    for (const [naipe, nums] of agruparPorNaipe(mao.uradora.map((d) => proximaDora(d, sanma)))) {
      s += nums + naipe
    }
  }

  // 6. Modificadores
  s += '+'
  if (mao.riichi)          s += mao.riichi.duplo ? 'w' : 'r'
  if (mao.riichi?.ippatsu) s += 'i'
  if (mao.bencao)          s += 't'
  if (mao.ultimaPedra)     s += 'h'
  if (mao.kan)             s += 'k'
  s += mao.ventoRodada + mao.ventoAssento

  return s
}

// ─── Tipos de resultado ───────────────────────────────────────────────────────

type PontosTsumo = {
  agari: 'tsumo'
  pontos: { total: number; oya: { ko: number }; ko: { oya: number; ko: number } }
}
type PontosRon = {
  agari: 'ron'
  pontos: { total: number; oya: { ron: number }; ko: { ron: number } }
}
type SemAgari = { agari: null }
export type PontosCalculados = PontosTsumo | PontosRon | SemAgari

export type ResultadoMao = PontosCalculados & {
  isOya: boolean
  yakuman: number
  /** [nome traduzido, valor han, é yakuman?] */
  yaku: [string, number, boolean][]
  fuDetalhes: DetalheFu[]
  semYaku: boolean
  han: number
  fu: number
  /** Nome do patamar traduzido (Mangan, Haneman, etc.) */
  nome: string | null
}

export type DetalheFu = {
  tipo: string
  descricao: string
  fu: number
}

// ─── Cálculo principal ────────────────────────────────────────────────────────

/**
 * Calcula os pontos de uma mão completa.
 *
 * @param mao - Estado completo da mão (14 pedras contando melds).
 * @param config - Configurações de regras.
 * @returns Resultado com yaku, han, fu e pontos.
 */
export function calcularMao(mao: Mao, config: ConfiguracaoCalculo): ResultadoMao {
  const stringMao = converterMaoParaString(mao)

  const riichi = new Riichi(stringMao, {
    multiYakuman: config.multiYakuman,
    wyakuman: config.yakumanDuplo,
    kuitan: config.tanyaoAberto,
    kiriageMangan: config.kiriageMangan,
    kazoeYakuman: config.kazoeYakuman,
    doubleWindFu: config.fuVentosDuplo,
    rinshanFu: config.fuRinshan,
    aka: config.akadora,
  })

  const res = riichi.calc()
  const isOya = mao.ventoAssento === '1'
  const yakuman = res.yakuman ?? 0

  const pontos: PontosCalculados = !res.isAgari
    ? { agari: null }
    : mao.agari === 'ron'
    ? {
        agari: 'ron',
        pontos: { total: res.ten, oya: { ron: res.oya[0] }, ko: { ron: res.ko[0] } },
      }
    : {
        agari: 'tsumo',
        pontos: {
          total: res.ten,
          oya: { ko: res.oya[0] },
          ko: { oya: res.ko[0], ko: res.ko[1] },
        },
      }

  return {
    ...pontos,
    isOya,
    yakuman,
    yaku: Object.entries(res.yaku ?? {})
      .sort((a, b) => (ORDEM_YAKU[a[0]] ?? 99) - (ORDEM_YAKU[b[0]] ?? 99))
      .map(([nome, valor]) => {
        const traduzido = traduzirYaku(nome)
        const ehYakuman = String(valor).endsWith('役満')
        const han = ehYakuman
          ? parseInt(String(valor), 10) || 1
          : Number(/\d+/.exec(String(valor))?.[0]) || 0
        return [traduzido, han, ehYakuman] as [string, number, boolean]
      }),
    fuDetalhes: traduzirDetalhesFu(res.pattern ?? []),
    semYaku: res.noYaku ?? false,
    han: res.han ?? 0,
    fu: res.fu ?? 0,
    nome: res.name ? traduzirPatamares(res.name) : null,
  }
}

// ─── Calculadora rápida ───────────────────────────────────────────────────────

export function arredondar100(n: number): number {
  return Math.ceil(n / 100) * 100
}

/**
 * Calcula pontos diretamente de han+fu sem precisar montar uma mão.
 */
export function calcularHanFu(
  han: number,
  fu: number,
  config: ConfiguracaoCalculo,
): { tsumoOya: number; tsumoKo: number; ronOya: number; ronKo: number } {
  let base = fu * Math.pow(2, han + 2)
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

export function fuValidos(agari: 'tsumo' | 'ron'): Map<number, number[]> {
  const q = (c: boolean, v: number) => (c ? [v] : [])
  return new Map([
    [1, [30, 40, 50, 60, 70, 80, 90, 100, 110]],
    [2, [...q(agari === 'tsumo', 20), ...q(agari === 'ron', 25), 30, 40, 50, 60, 70, 80, 90, 100, 110]],
    [3, [...q(agari === 'tsumo', 20), 25, 30, 40, 50, 60]],
    [4, [...q(agari === 'tsumo', 20), 25, 30]],
  ])
}

export function montarPontosRapidos(
  isOya: boolean,
  agari: 'tsumo' | 'ron',
  tabela: ReturnType<typeof calcularHanFu>,
): Exclude<PontosCalculados, SemAgari> {
  const { tsumoOya, tsumoKo, ronOya, ronKo } = tabela
  return agari === 'ron'
    ? { agari: 'ron', pontos: { total: isOya ? ronOya : ronKo, oya: { ron: ronOya }, ko: { ron: ronKo } } }
    : { agari: 'tsumo', pontos: { total: isOya ? tsumoOya * 3 : tsumoOya + tsumoKo * 2, oya: { ko: tsumoOya }, ko: { oya: tsumoOya, ko: tsumoKo } } }
}

// ─── Ordenação ────────────────────────────────────────────────────────────────

const ORDEM_NAIPE: Record<string, number> = { m: 0, p: 1, s: 2, z: 3 }

export function ordenarPedras(pedras: CodigoPedra[]): CodigoPedra[] {
  const valorOrdenacao = (pedra: CodigoPedra) => pedra[0] === '0' ? 5 : (Number(pedra[0]) || 4.9)
  return pedras.sort((a, b) =>
    (ORDEM_NAIPE[a[1]] ?? 9) - (ORDEM_NAIPE[b[1]] ?? 9)
    || valorOrdenacao(a) - valorOrdenacao(b)
  )
}

export function ordenarMelds(melds: Meld[]): Meld[] {
  return melds.sort((a, b) =>
    (ORDEM_NAIPE[a.pedras[0]?.[1] ?? ''] ?? 9) - (ORDEM_NAIPE[b.pedras[0]?.[1] ?? ''] ?? 9)
  )
}

/**
 * Conta o total de pedras da mão para fins de exibição.
 * Kans têm 4 pedras físicas mas só ocupam 3 "slots" na estrutura de 14.
 */
export function contarPedrasTotais(mao: Pick<Mao, 'pedras' | 'melds'>): number {
  return mao.pedras.length + mao.melds.reduce((s, m) => s + m.pedras.length, 0)
}

/**
 * Conta os "slots" lógicos ocupados — kans ocupam 3 slots (como trinca),
 * mas têm 4 pedras físicas. Usado para saber se a mão está completa (14 slots).
 *
 * Estrutura de uma mão completa:
 *   - Normal: 4 grupos×3 + 1 par = 14 pedras
 *   - Com 1 kan: 3 grupos×3 + 1 kan×4 + 1 par = 15 pedras físicas, mas 14 slots
 *   - Com 4 kans: 4 kans×4 + 1 par = 18 pedras físicas, mas 14 slots
 *
 * @param mao - Estado da mão.
 * @returns Número de slots lógicos (meta = 14).
 */
export function contarSlotsLogicos(mao: Pick<Mao, 'pedras' | 'melds'>): number {
  const slotsEmMelds = mao.melds.reduce((s, m) => {
    // Kan tem 4 pedras físicas mas ocupa 3 slots (como uma trinca)
    const ehKan = m.tipo === 'kanAberto' || m.tipo === 'kanFechado'
    return s + (ehKan ? 3 : m.pedras.length)
  }, 0)
  return mao.pedras.length + slotsEmMelds
}

/**
 * Conta quantas pedras físicas ainda cabem na mão.
 * Leva em conta que kans adicionam 4 pedras físicas por 3 slots.
 *
 * @param mao - Estado da mão.
 * @returns Número de pedras que ainda podem ser adicionadas à mão.
 */
export function pedrasFisicasRestantes(mao: Pick<Mao, 'pedras' | 'melds'>): number {
  const slotsLivres = 14 - contarSlotsLogicos(mao)
  return slotsLivres  // 1 slot = 1 pedra na mão (melds já foram contados)
}
