/**
 * Referência de yakus (baseada na folha EMA RCR 2016) mostrada na modal de
 * Yakus. Só leitura: o cálculo de verdade continua na biblioteca `riichi`.
 *
 * Aqui fica o que não muda com o idioma (han, kanji, exemplo); nome,
 * descrição e dica de cada idioma vêm de `conteudo/guia-bolso`.
 */
import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { idiomaGlobal } from '@/compartilhado/i18n/tradutorGlobal'
import { conteudoGuiaBolso, type IdYaku, type YakuCategory } from '../conteudo/guia-bolso'
import type { CodigoPedra } from './tipos'

export type { YakuCategory } from '../conteudo/guia-bolso'

interface YakuBase {
  id: IdYaku
  romaji: string
  kanji: string
  hanClosed: number | null // null = n/a
  hanOpen: number | null // null = closed only
  yakuman?: boolean
  bonus?: boolean // shows "+1"
  category: YakuCategory
  /** Outras grafias em romaji que viram link para o cartão (além do romaji). */
  apelidos?: string[]
  example?: string // mpsz; z: 1=E 2=S 3=W 4=N 5=Branco 6=Verde 7=Vermelho
}

/** Yaku já com os textos de um idioma. */
export interface Yaku extends YakuBase {
  /** Nome no título do cartão: romaji, ou o nome em ja/zh-Hans/ko. */
  titulo: string
  /** Linha embaixo do título (ex.: "Tudo simples"). */
  nome?: string
  descricao: string
  /** Dica em bloco destacado, entre a descrição e o exemplo. */
  dica?: string
  /** Todas as formas que viram link para o cartão: romaji, apelidos e as do idioma. */
  apelidos: string[]
}

const YAKU_BASE: YakuBase[] = [
  // ── Sequências
  {
    id: 'iipeikou',
    romaji: 'Iipeikou',
    kanji: '一盃口',
    hanClosed: 1,
    hanOpen: null,
    category: 'sequencias',
    example: '223344m567p789s55p',
  },
  {
    id: 'ryanpeikou',
    romaji: 'Ryanpeikou',
    kanji: '二盃口',
    hanClosed: 3,
    hanOpen: null,
    category: 'sequencias',
    example: '223344m667788p55s',
  },
  {
    id: 'pinfu',
    romaji: 'Pinfu',
    kanji: '平和',
    hanClosed: 1,
    hanOpen: null,
    category: 'sequencias',
    example: '123m456p789s234s55p',
  },
  {
    id: 'sanshoku-doujun',
    romaji: 'Sanshoku doujun',
    kanji: '三色同順',
    hanClosed: 2,
    hanOpen: 1,
    category: 'sequencias',
    example: '234m234p234s678s99p',
  },
  {
    id: 'ittsuu',
    romaji: 'Ittsuu',
    kanji: '一気通貫',
    hanClosed: 2,
    hanOpen: 1,
    category: 'sequencias',
    apelidos: ['ittsu'],
    example: '123456789m456p77s',
  },

  // ── Terminais / Honras
  {
    id: 'tanyao',
    romaji: "Tan'yao",
    kanji: '断么九',
    hanClosed: 1,
    hanOpen: 1,
    category: 'terminais-honras',
    apelidos: ['tanyao'],
    example: '234m567p345s678s22p',
  },
  {
    id: 'yakuhai',
    romaji: 'Yakuhai',
    kanji: '役牌',
    hanClosed: 1,
    hanOpen: 1,
    category: 'terminais-honras',
    example: '555z123m456p789s11p',
  },
  {
    id: 'shousangen',
    romaji: 'Shousangen',
    kanji: '小三元',
    hanClosed: 2,
    hanOpen: 2,
    category: 'terminais-honras',
    example: '555z666z77z123m456p',
  },
  {
    id: 'daisangen',
    romaji: 'Daisangen',
    kanji: '大三元',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    example: '555z666z777z123m11p',
  },
  {
    id: 'shousuushii',
    romaji: 'Shousuushii',
    kanji: '小四喜',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    example: '111z222z333z44z123m',
  },
  {
    id: 'daisuushii',
    romaji: 'Daisuushii',
    kanji: '大四喜',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    example: '111z222z333z444z11m',
  },
  {
    id: 'chanta',
    romaji: 'Chanta',
    kanji: '全帯',
    hanClosed: 2,
    hanOpen: 1,
    category: 'terminais-honras',
    example: '123m789p111z789s99m',
  },
  {
    id: 'junchan',
    romaji: 'Junchan',
    kanji: '純全帯么',
    hanClosed: 3,
    hanOpen: 2,
    category: 'terminais-honras',
    example: '123m789p111s789s99m',
  },
  {
    id: 'honroutou',
    romaji: 'Honroutou',
    kanji: '混老頭',
    hanClosed: 2,
    hanOpen: 2,
    category: 'terminais-honras',
    example: '111m999p111z999s55z',
  },
  {
    id: 'chinroutou',
    romaji: 'Chinroutou',
    kanji: '清老頭',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    example: '111m999m111p999s11s',
  },
  {
    id: 'tsuuiisou',
    romaji: 'Tsuuiisou',
    kanji: '字一色',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    example: '111z222z555z666z77z',
  },
  {
    id: 'kokushi',
    romaji: 'Kokushi musou',
    kanji: '国士無双',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    apelidos: ['kokushi'],
    example: '119m19p19s1234567z',
  },

  // ── Pares / Trincas / Quads
  {
    id: 'chiitoitsu',
    romaji: 'Chiitoitsu',
    kanji: '七対子',
    hanClosed: 2,
    hanOpen: null,
    category: 'trincas-pares',
    apelidos: ['chiitoi'],
    example: '11m33m55p77p22s66s11z',
  },
  {
    id: 'toitoi',
    romaji: 'Toitoi',
    kanji: '対々',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    example: '222m555p888s111z99m',
  },
  {
    id: 'sanankou',
    romaji: "San'ankou",
    kanji: '三暗刻',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    apelidos: ['sanankou', 'san ankou'],
    example: '222m555p888s345s99m',
  },
  {
    id: 'suuankou',
    romaji: 'Suuankou',
    kanji: '四暗刻',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'trincas-pares',
    example: '222m444m777p333s55z',
  },
  {
    id: 'sanshoku-doukou',
    romaji: 'Sanshoku doukou',
    kanji: '三色同刻',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    example: '333m333p333s678s55p',
  },
  {
    id: 'sankantsu',
    romaji: 'Sankantsu',
    kanji: '三槓子',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    example: '2222m5555p7777s123m99s',
  },
  {
    id: 'suukantsu',
    romaji: 'Suukantsu',
    kanji: '四槓子',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'trincas-pares',
    example: '2222m5555p7777s1111z99s',
  },

  // ── Naipes
  {
    id: 'honitsu',
    romaji: "Hon'itsu",
    kanji: '混一色',
    hanClosed: 3,
    hanOpen: 2,
    category: 'naipes',
    apelidos: ['honitsu'],
    example: '123p456p789p111z55z',
  },
  {
    id: 'chinitsu',
    romaji: "Chin'itsu",
    kanji: '清一色',
    hanClosed: 6,
    hanOpen: 5,
    category: 'naipes',
    apelidos: ['chinitsu'],
    example: '123m345m567m789m22m',
  },
  {
    id: 'ryuuiisou',
    romaji: 'Ryuuiisou',
    kanji: '緑一色',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'naipes',
    example: '234s666s888s666z22s',
  },
  {
    id: 'chuuren',
    romaji: 'Chuuren poutou',
    kanji: '九連宝燈',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'naipes',
    apelidos: ['chuuren'],
    example: '11123455678999m',
  },

  // ── Outros
  {
    id: 'riichi',
    romaji: 'Riichi',
    kanji: '立直',
    hanClosed: 1,
    hanOpen: null,
    category: 'outros',
  },
  {
    id: 'double-riichi',
    romaji: 'Daburu Riichi',
    kanji: 'ダブル立直',
    hanClosed: 1,
    hanOpen: null,
    bonus: true,
    category: 'outros',
    apelidos: ['double riichi'],
  },
  {
    id: 'ippatsu',
    romaji: 'Ippatsu',
    kanji: '一発',
    hanClosed: 1,
    hanOpen: null,
    bonus: true,
    category: 'outros',
  },
  {
    id: 'menzen-tsumo',
    romaji: 'Menzen tsumo',
    kanji: '門前ツモ',
    hanClosed: 1,
    hanOpen: null,
    category: 'outros',
  },
  {
    id: 'haitei',
    romaji: 'Haitei raoyue',
    kanji: '海底撈月',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
    apelidos: ['haitei'],
  },
  {
    id: 'houtei',
    romaji: 'Houtei raoyui',
    kanji: '河底撈魚',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
    apelidos: ['houtei'],
  },
  {
    id: 'rinshan',
    romaji: 'Rinshan kaihou',
    kanji: '嶺上開花',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
    apelidos: ['rinshan'],
  },
  {
    id: 'chankan',
    romaji: 'Chankan',
    kanji: '搶槓',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
  },
  {
    id: 'tenhou',
    romaji: 'Tenhou',
    kanji: '天和',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'outros',
  },
  {
    id: 'chiihou',
    romaji: 'Chiihou',
    kanji: '地和',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'outros',
  },
  {
    id: 'renhou',
    romaji: 'Renhou',
    kanji: '人和',
    hanClosed: 5,
    hanOpen: null,
    category: 'outros',
  },
]

const yakusPorIdioma = new Map<IdiomaSuportado, Yaku[]>()

/** Yakus com os textos do idioma (o ativo, se nenhum for dado). */
export function yakusDoIdioma(idioma: IdiomaSuportado = idiomaGlobal()): Yaku[] {
  let yakus = yakusPorIdioma.get(idioma)
  if (!yakus) {
    const textos = conteudoGuiaBolso(idioma).yakus
    yakus = YAKU_BASE.map((base) => {
      const { titulo, apelidos = [], ...resto } = textos[base.id]
      return {
        ...base,
        ...resto,
        titulo: titulo ?? base.romaji,
        apelidos: [base.romaji, ...(base.apelidos ?? []), ...(titulo ? [titulo] : []), ...apelidos],
      }
    })
    yakusPorIdioma.set(idioma, yakus)
  }
  return yakus
}

/** Yakus em pt-BR, para os textos fixos em português (ex.: guia Aprender a jogar). */
export const YAKU = yakusDoIdioma('pt-BR')

export const DORA_NOTE = conteudoGuiaBolso('pt-BR').notaDora

/** Nota da aba Yakuman: o kazoe não é um yaku, é a soma que chega lá. */
export const KAZOE_NOTE = conteudoGuiaBolso('pt-BR').notaKazoe

/** Aba Yaku para iniciantes: os yakus de cada grupo (títulos no conteúdo do idioma). */
export const GRUPOS_INICIANTE: IdYaku[][] = [
  ['riichi', 'tanyao', 'yakuhai', 'pinfu', 'menzen-tsumo'],
  ['chiitoitsu', 'toitoi', 'sanshoku-doujun', 'ittsuu', 'honitsu', 'chinitsu'],
]

/** Ordem das abas de categoria (yakumans ficam numa aba própria). */
export const ORDEM_CATEGORIAS: YakuCategory[] = [
  'sequencias',
  'terminais-honras',
  'trincas-pares',
  'naipes',
  'outros',
]

/**
 * Converte notação mpsz ("123m55z") em grupos de pedras do app ("1m", "2m"...),
 * um grupo por bloco de dígitos + naipe, para o exemplo separar os conjuntos.
 */
export function parseMpszGrupos(mpsz: string): CodigoPedra[][] {
  const grupos: CodigoPedra[][] = []
  for (const [, digitos, naipe] of mpsz.matchAll(/(\d+)([mpsz])/g)) {
    grupos.push([...digitos].map((digito) => `${digito}${naipe}`))
  }
  return grupos
}

export function parseMpsz(mpsz: string): CodigoPedra[] {
  return parseMpszGrupos(mpsz).flat()
}
