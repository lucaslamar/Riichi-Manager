import type { DetalheFu } from '@/compartilhado/mahjong/pontuacao'

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
  Riichi: 'Riichi',
  'Double Riichi': 'Double Riichi',
  Ippatsu: 'Ippatsu',
  'Fully Concealed Hand': 'Menzen Tsumo',
  Pinfu: 'Pinfu',
  'Pure Double Sequence': 'Iipeiko',
  'All Simples': 'Tanyao',
  'Mixed Triple Sequence': 'Sanshoku Doujun',
  'Pure Straight': 'Ittsu (Sequência Pura)',
  'Half Outside Hand': 'Chanta',
  'Pure Triple Sequence': 'Sanshoku Doukou',
  'All Triplets': 'Toitoihou',
  'Three Concealed Triplets': 'San Ankou',
  'Three Quads': 'Sankantsu',
  'Three Little Dragons': 'Shousangen',
  'All Terminals and Honors': 'Honroutou',
  'Half Flush': 'Honitsu',
  'Fully Outside Hand': 'Junchan',
  'Twice Pure Double Sequence': 'Ryanpeiko',
  'Full Flush': 'Chinitsu',
  'After a Kan': 'Rinshan Kaihou',
  'Robbing a Kan': 'Chankan',
  'Under the Sea': 'Haitei Raoyue',
  'Under the River': 'Houtei Raoyui',
  'Yakuhai (Dragons)': 'Yakuhai (Dragão)',
  'Yakuhai (Winds)': 'Yakuhai (Vento)',
  'White Dragon': 'Haku',
  'Green Dragon': 'Hatsu',
  'Red Dragon': 'Chun',
  'Prevalent Wind (East)': 'Vento da Rodada (Leste)',
  'Prevalent Wind (South)': 'Vento da Rodada (Sul)',
  'Prevalent Wind (West)': 'Vento da Rodada (Oeste)',
  'Prevalent Wind (North)': 'Vento da Rodada (Norte)',
  'Seat Wind (East)': 'Vento do Assento (Leste)',
  'Seat Wind (South)': 'Vento do Assento (Sul)',
  'Seat Wind (West)': 'Vento do Assento (Oeste)',
  'Seat Wind (North)': 'Vento do Assento (Norte)',
  'Seven Pairs': 'Chiitoitsu',
  Dora: 'Dora',
  Uradora: 'Uradora',
  'Red Fives': 'Akadora',
  // Yakuman
  'Thirteen Orphans': 'Kokushi Musou',
  'Thirteen-Wait Thirteen Orphans': 'Kokushi (13 esperas)',
  'Nine Gates': 'Chuuren Poutou',
  'True Nine Gates': 'Chuuren (9 esperas)',
  'Four Concealed Triplets': 'Suuankou',
  'Single-Wait Four Concealed Triplets': 'Suuankou (espera tanki)',
  'Four Big Winds': 'Daisuushii',
  'Four Little Winds': 'Shousuushii',
  'Three Big Dragons': 'Daisangen',
  'All Honors': 'Tsuuiisou',
  'All Green': 'Ryuuiisou',
  'All Terminals': 'Chinroutou',
  'Four Quads': 'Suukantsu',
  'Blessing of Heaven': 'Tenhou',
  'Blessing of Earth': 'Chiihou',
  'Big Seven Stars': 'Daichiishin',
}

export const ORDEM_YAKU: Record<string, number> = Object.fromEntries(
  Object.keys(TRADUCAO_YAKU).map((chaveYaku, i) => [chaveYaku, i]),
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
    満貫: 'Mangan',
    跳満: 'Haneman',
    倍満: 'Baiman',
    三倍満: 'Sanbaiman',
    数え役満: 'Yakuman Contado',
    役満: 'Yakuman',
  }
  // Yakuman múltiplos: "2役満", "3役満" etc.
  const yakumanJaponesMultiplo = nome.match(/^(\d+)役満$/)
  if (yakumanJaponesMultiplo) return `${yakumanJaponesMultiplo[1]}× Yakuman`
  return mapa[nome] ?? nome
}

/** Nome curto de cada honra nos detalhes de fu. */
const CHAVES_HONRA_FU: Record<string, string> = {
  '1z': 'winds.east',
  '2z': 'winds.south',
  '3z': 'winds.west',
  '4z': 'winds.north',
  '5z': 'fuDetails.haku',
  '6z': 'fuDetails.hatsu',
  '7z': 'fuDetails.chun',
}

const CHAVES_NAIPE_FU: Record<string, string> = {
  m: 'calculator.suitMan',
  p: 'calculator.suitPin',
  s: 'calculator.suitSou',
}

type Traduzir = (chave: string, parametros?: Record<string, string | number>) => string

function nomesPedrasFu(pedras: string[], traduzir: Traduzir): string {
  return pedras
    .map((pedra) => {
      if (CHAVES_HONRA_FU[pedra]) return traduzir(CHAVES_HONRA_FU[pedra])
      const naipe = CHAVES_NAIPE_FU[pedra[1]]
      return naipe
        ? traduzir('fuDetails.numberTile', { number: pedra[0], suit: traduzir(naipe) })
        : pedra
    })
    .join(', ')
}

/** Descrição de um detalhe de fu no idioma ativo (com o nome das pedras). */
export function textoDetalheFu(detalhe: DetalheFu, traduzir: Traduzir): string {
  const pedras = detalhe.pedras?.length ? nomesPedrasFu(detalhe.pedras, traduzir) : ''
  const tiles = pedras || (detalhe.semPedra ? traduzir(detalhe.semPedra) : '')
  return traduzir(detalhe.descricao, { tiles })
}

const ESPERAS_FU = new Set(['ryanmen', 'shanpon', 'kanchan', 'penchan', 'tanki'])

/**
 * Detalhes de fu da biblioteca como chaves i18n (bloco `fuDetails`): a tela
 * traduz com `textoDetalheFu`.
 */
export function traduzirDetalhesFu(padroes: Array<Record<string, any>>): DetalheFu[] {
  return padroes
    .filter((padrao) => Number(padrao.fu) > 0)
    .map((padrao): DetalheFu => {
      const fu = Number(padrao.fu)
      const pedras = Array.isArray(padrao.v) ? padrao.v : padrao.v ? [padrao.v] : []
      const tipoGrupo = padrao.yaochuu ? 'fuDetails.terminalHonorDesc' : 'fuDetails.simpleDesc'
      switch (padrao.t) {
        case 'base':
          return { tipo: 'fuDetails.base', descricao: 'fuDetails.baseDesc', fu }
        case 'chiitoi':
          return { tipo: 'fuDetails.chiitoi', descricao: 'fuDetails.chiitoiDesc', fu }
        case 'pinfuTsumo':
          return { tipo: 'fuDetails.pinfuTsumo', descricao: 'fuDetails.pinfuTsumoDesc', fu }
        case 'closedRon':
          return { tipo: 'fuDetails.closedRon', descricao: 'fuDetails.closedRonDesc', fu }
        case 'rinshanTsumo':
          return { tipo: 'fuDetails.rinshan', descricao: 'fuDetails.rinshanDesc', fu }
        case 'tsumo':
          return { tipo: 'fuDetails.tsumo', descricao: 'fuDetails.tsumoDesc', fu }
        case 'openPinfu':
          return { tipo: 'fuDetails.openPinfu', descricao: 'fuDetails.openPinfuDesc', fu }
        case 'yakuhaiPair':
          return {
            tipo: 'fuDetails.yakuhaiPair',
            descricao: padrao.double
              ? 'fuDetails.yakuhaiPairDoubleDesc'
              : 'fuDetails.yakuhaiPairDesc',
            pedras,
            semPedra: 'fuDetails.valuePair',
            fu,
          }
        case 'triplet':
          return {
            tipo: padrao.open ? 'fuDetails.openTriplet' : 'fuDetails.closedTriplet',
            descricao: tipoGrupo,
            pedras,
            semPedra: 'fuDetails.triplet',
            fu,
          }
        case 'quad':
          return {
            tipo: padrao.open ? 'fuDetails.openKan' : 'fuDetails.closedKan',
            descricao: tipoGrupo,
            pedras,
            semPedra: 'fuDetails.kan',
            fu,
          }
        case 'wait':
          return {
            tipo: 'fuDetails.wait',
            descricao: ESPERAS_FU.has(padrao.w)
              ? `fuDetails.waits.${padrao.w}`
              : 'fuDetails.waitGeneric',
            fu,
          }
        default:
          return { tipo: 'fuDetails.generic', descricao: 'fuDetails.libraryDetail', fu }
      }
    })
}
