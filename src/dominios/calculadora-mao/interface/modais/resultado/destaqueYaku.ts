import type { CodigoPedra, Mao } from '../../../logica/mao'
import { DORA_NOTE, YAKU, type Yaku } from '../../../logica/yakus'
import { codigoBase, proximaDoraIndicada } from '../../constantes'

/**
 * Liga cada yaku do Resultado (nomes de `traducoes.ts`) à explicação da
 * referência de yakus e às pedras da mão que formam esse yaku.
 *
 * A biblioteca `riichi` não devolve como dividiu a mão em grupos, então as
 * pedras são achadas por contagem: boa o bastante para mostrar "de onde veio"
 * cada yaku, não uma decomposição oficial.
 */

const ID_POR_NOME: Record<string, string> = {
  'Kokushi Musou 13-men machi': 'kokushi',
  'Kokushi Musou': 'kokushi',
  'Junsei Chuuren Poutou': 'chuuren',
  'Chuuren Poutou': 'chuuren',
  'Suuankou Tanki': 'suuankou',
  Suuankou: 'suuankou',
  Daisuushii: 'daisuushii',
  Shousuushii: 'shousuushii',
  Daisangen: 'daisangen',
  Tsuuiisou: 'tsuuiisou',
  Ryuuiisou: 'ryuuiisou',
  Chinroutou: 'chinroutou',
  Suukantsu: 'suukantsu',
  Tenhou: 'tenhou',
  Chiihou: 'chiihou',
  Renhou: 'renhou',
  Chinitsu: 'chinitsu',
  Honitsu: 'honitsu',
  Ryanpeikou: 'ryanpeikou',
  Junchan: 'junchan',
  Chanta: 'chanta',
  Toitoi: 'toitoi',
  Honroutou: 'honroutou',
  Sankantsu: 'sankantsu',
  Shousangen: 'shousangen',
  'Sanshoku Doukou': 'sanshoku-doukou',
  'San Ankou': 'sanankou',
  Chiitoitsu: 'chiitoitsu',
  'Double Riichi': 'double-riichi',
  Ittsu: 'ittsuu',
  'Sanshoku Doujun': 'sanshoku-doujun',
  Tanyao: 'tanyao',
  Pinfu: 'pinfu',
  Iipeikou: 'iipeikou',
  'Menzen Tsumo': 'menzen-tsumo',
  Riichi: 'riichi',
  Ippatsu: 'ippatsu',
  'Rinshan Kaihou': 'rinshan',
  Chankan: 'chankan',
  'Haitei Raoyue': 'haitei',
  'Houtei Raoyui': 'houtei',
}

/** Honra de cada yakuhai pelo fim do nome ("Yakuhai Haku", "Bakaze Ton"...). */
const HONRA_YAKUHAI: Record<string, CodigoPedra> = {
  Ton: '1z',
  Nan: '2z',
  Sha: '3z',
  Pei: '4z',
  Haku: '5z',
  Hatsu: '6z',
  Chun: '7z',
}

const MAO_INTEIRA = new Set([
  'tanyao',
  'pinfu',
  'chinitsu',
  'honitsu',
  'toitoi',
  'chiitoitsu',
  'honroutou',
  'chanta',
  'junchan',
  'kokushi',
  'tsuuiisou',
  'chinroutou',
  'ryuuiisou',
  'chuuren',
  'suuankou',
  'ryanpeikou',
  'tenhou',
  'chiihou',
  'renhou',
])

/** Yakus da forma de vencer: o que conta é a pedra da batida. */
const SO_BATIDA = new Set(['menzen-tsumo', 'haitei', 'houtei', 'rinshan', 'chankan', 'ippatsu'])

const YAKU_POR_ID = new Map(YAKU.map((yaku) => [yaku.id, yaku]))

export interface ExplicacaoYaku {
  /** Cartão da referência de yakus; ausente para dora (que não é yaku). */
  yaku?: Yaku
  texto: string
}

export function explicacaoDoYaku(nome: string): ExplicacaoYaku | null {
  if (/dora/i.test(nome)) return { texto: DORA_NOTE }
  const id = idDoYaku(nome)
  const yaku = id ? YAKU_POR_ID.get(id) : undefined
  return yaku ? { yaku, texto: yaku.description } : null
}

function idDoYaku(nome: string): string | null {
  if (/^(Yakuhai|Bakaze|Jikaze)\b/.test(nome)) return 'yakuhai'
  return ID_POR_NOME[nome] ?? null
}

/**
 * Pedras a destacar: `todas`, só a `batida`, ou uma cota por pedra (chave =
 * código base, ou o código exato para 5 vermelho) consumida na ordem em que
 * as pedras aparecem na tela.
 */
export interface DestaqueYaku {
  todas: boolean
  batida: boolean
  cotas: Map<CodigoPedra, number>
}

const NAIPES_NUMERICOS = ['m', 'p', 's'] as const

function contar(pedras: CodigoPedra[]) {
  const contagem = new Map<CodigoPedra, number>()
  for (const pedra of pedras) {
    const base = codigoBase(pedra)
    contagem.set(base, (contagem.get(base) ?? 0) + 1)
  }
  return (pedra: CodigoPedra) => contagem.get(pedra) ?? 0
}

export function destaqueDoYaku(nome: string, mao: Mao): DestaqueYaku {
  const destaque: DestaqueYaku = { todas: false, batida: false, cotas: new Map() }
  const cota = (pedra: CodigoPedra, quantidade: number) => destaque.cotas.set(pedra, quantidade)
  const todasPedras = [...mao.pedras, ...mao.melds.flatMap((meld) => meld.pedras)]
  const total = contar(todasPedras)
  const fechadas = contar([
    ...mao.pedras,
    ...mao.melds.filter((meld) => meld.tipo === 'kanFechado').flatMap((meld) => meld.pedras),
  ])

  if (/dora/i.test(nome)) {
    const aka = /aka|manual/i.test(nome)
    const indicadores = /ura/i.test(nome)
      ? mao.uradora
      : /manual/i.test(nome) || /^dora$/i.test(nome)
        ? mao.dora
        : []
    if (aka) for (const pedra of todasPedras) if (pedra[0] === '0') cota(pedra, 4)
    for (const indicador of indicadores) cota(proximaDoraIndicada(indicador), 4)
    return destaque
  }

  const id = idDoYaku(nome)
  if (!id) return destaque
  if (MAO_INTEIRA.has(id)) return { ...destaque, todas: true }
  if (SO_BATIDA.has(id)) return { ...destaque, batida: true }

  switch (id) {
    case 'yakuhai': {
      const honra = HONRA_YAKUHAI[nome.split(' ').pop() ?? '']
      if (honra) cota(honra, 4)
      break
    }
    case 'shousangen':
    case 'daisangen':
      for (const honra of ['5z', '6z', '7z']) cota(honra, 4)
      break
    case 'shousuushii':
    case 'daisuushii':
      for (const honra of ['1z', '2z', '3z', '4z']) cota(honra, 4)
      break
    case 'sankantsu':
    case 'suukantsu':
      for (const meld of mao.melds) {
        if (meld.tipo === 'kanAberto' || meld.tipo === 'kanFechado')
          cota(codigoBase(meld.pedras[0]), 4)
      }
      break
    case 'sanankou':
      for (const pedra of new Set(todasPedras.map(codigoBase))) {
        if (fechadas(pedra) >= 3) cota(pedra, fechadas(pedra))
      }
      break
    case 'sanshoku-doukou':
      for (let numero = 1; numero <= 9; numero++) {
        if (NAIPES_NUMERICOS.every((naipe) => total(`${numero}${naipe}`) >= 3)) {
          for (const naipe of NAIPES_NUMERICOS) cota(`${numero}${naipe}`, 3)
        }
      }
      break
    case 'sanshoku-doujun':
      for (let numero = 1; numero <= 7; numero++) {
        const temSequencia = NAIPES_NUMERICOS.every((naipe) =>
          [0, 1, 2].every((passo) => total(`${numero + passo}${naipe}`) >= 1),
        )
        if (temSequencia) {
          for (const naipe of NAIPES_NUMERICOS)
            for (const passo of [0, 1, 2]) cota(`${numero + passo}${naipe}`, 1)
          break
        }
      }
      break
    case 'ittsuu':
      for (const naipe of NAIPES_NUMERICOS) {
        if ([1, 2, 3, 4, 5, 6, 7, 8, 9].every((numero) => total(`${numero}${naipe}`) >= 1)) {
          for (let numero = 1; numero <= 9; numero++) cota(`${numero}${naipe}`, 1)
          break
        }
      }
      break
    case 'iipeikou':
      procura: for (const naipe of NAIPES_NUMERICOS) {
        for (let numero = 1; numero <= 7; numero++) {
          if ([0, 1, 2].every((passo) => fechadas(`${numero + passo}${naipe}`) >= 2)) {
            for (const passo of [0, 1, 2]) cota(`${numero + passo}${naipe}`, 2)
            break procura
          }
        }
      }
      break
    // riichi / double-riichi: declaração, não vem de pedras.
  }
  return destaque
}

/**
 * Consome a cota para uma pedra na ordem de exibição. Devolve se ela fica
 * destacada.
 */
export function consumirDestaque(destaque: DestaqueYaku, pedra: CodigoPedra): boolean {
  if (destaque.todas) return true
  for (const chave of [pedra, codigoBase(pedra)]) {
    const restante = destaque.cotas.get(chave) ?? 0
    if (restante > 0) {
      destaque.cotas.set(chave, restante - 1)
      return true
    }
  }
  return false
}
