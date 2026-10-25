/**
 * Referência de yakus (baseada na folha EMA RCR 2016) mostrada na modal de
 * Yakus. Só leitura: o cálculo de verdade continua na biblioteca `riichi`.
 */
import type { CodigoPedra } from './tipos'

export type YakuCategory = 'sequencias' | 'terminais-honras' | 'trincas-pares' | 'naipes' | 'outros'

export interface Yaku {
  id: string
  romaji: string
  kanji: string
  namePt: string
  hanClosed: number | null // null = n/a
  hanOpen: number | null // null = closed only
  yakuman?: boolean
  bonus?: boolean // shows "+1"
  category: YakuCategory
  description: string // PT-BR
  /** Dica em bloco destacado, entre a descrição e o exemplo. */
  dica?: string
  /** Outras grafias que viram link para o cartão (além do romaji). */
  apelidos?: string[]
  example?: string // mpsz; z: 1=E 2=S 3=W 4=N 5=Branco 6=Verde 7=Vermelho
}

export const CATEGORY_LABELS: Record<YakuCategory, string> = {
  sequencias: 'Baseados em sequências',
  'terminais-honras': 'Baseados em terminais / honras',
  'trincas-pares': 'Baseados em pares / trincas / quads',
  naipes: 'Baseados em naipes',
  outros: 'Outros yakus',
}

export const YAKU: Yaku[] = [
  // ── Sequências
  {
    id: 'iipeikou',
    romaji: 'Iipeikou',
    kanji: '一盃口',
    namePt: 'Sequência dupla pura',
    hanClosed: 1,
    hanOpen: null,
    category: 'sequencias',
    description: 'Duas sequências idênticas no mesmo naipe. Só mão fechada.',
    example: '223344m567p789s55p',
  },
  {
    id: 'ryanpeikou',
    romaji: 'Ryanpeikou',
    kanji: '二盃口',
    namePt: 'Duas sequências duplas puras',
    hanClosed: 3,
    hanOpen: null,
    category: 'sequencias',
    description: 'Dois Iipeikou na mesma mão. Só mão fechada. Não acumula com Chiitoitsu.',
    example: '223344m667788p55s',
  },
  {
    id: 'pinfu',
    romaji: 'Pinfu',
    kanji: '平和',
    namePt: 'Mão sem fu',
    hanClosed: 1,
    hanOpen: null,
    category: 'sequencias',
    description:
      '4 sequências + par que não seja de dragão, do vento da rodada nem do vento do seu assento, vencendo com espera ryanmen. Par dos outros ventos pode. Só mão fechada.',
    example: '123m456p789s234s55p',
  },
  {
    id: 'sanshoku-doujun',
    romaji: 'Sanshoku doujun',
    kanji: '三色同順',
    namePt: 'Três sequências coloridas',
    hanClosed: 2,
    hanOpen: 1,
    category: 'sequencias',
    description: 'A mesma sequência nos três naipes (ex.: 234 de Man, Pin e Sou).',
    example: '234m234p234s678s99p',
  },
  {
    id: 'ittsuu',
    romaji: 'Ittsuu',
    kanji: '一気通貫',
    namePt: 'Reta pura',
    hanClosed: 2,
    hanOpen: 1,
    category: 'sequencias',
    apelidos: ['ittsu'],
    description: '123, 456 e 789 do mesmo naipe.',
    example: '123456789m456p77s',
  },

  // ── Terminais / Honras
  {
    id: 'tanyao',
    romaji: "Tan'yao",
    kanji: '断么九',
    namePt: 'Tudo simples',
    hanClosed: 1,
    hanOpen: 1,
    category: 'terminais-honras',
    apelidos: ['tanyao'],
    description:
      'Apenas pedras de 2 a 8. Sem terminais e sem honras. Vale aberta pela EMA (kuitan).',
    example: '234m567p345s678s22p',
  },
  {
    id: 'yakuhai',
    romaji: 'Yakuhai',
    kanji: '役牌',
    namePt: 'Trinca de valor',
    hanClosed: 1,
    hanOpen: 1,
    category: 'terminais-honras',
    description:
      'Trinca ou quad de dragão, do vento da rodada (bakaze) ou do vento do seu assento (jikaze). 1 han por trinca. Vento duplo vale 2.',
    example: '555z123m456p789s11p',
  },
  {
    id: 'shousangen',
    romaji: 'Shousangen',
    kanji: '小三元',
    namePt: 'Três dragões pequenos',
    hanClosed: 2,
    hanOpen: 2,
    category: 'terminais-honras',
    description: 'Duas trincas de dragão + par do terceiro dragão (soma também os Yakuhai).',
    example: '555z666z77z123m456p',
  },
  {
    id: 'daisangen',
    romaji: 'Daisangen',
    kanji: '大三元',
    namePt: 'Três dragões grandes',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    description: 'Trincas dos três dragões.',
    example: '555z666z777z123m11p',
  },
  {
    id: 'shousuushii',
    romaji: 'Shousuushii',
    kanji: '小四喜',
    namePt: 'Quatro ventos pequenos',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    description: 'Três trincas de vento + par do quarto vento.',
    example: '111z222z333z44z123m',
  },
  {
    id: 'daisuushii',
    romaji: 'Daisuushii',
    kanji: '大四喜',
    namePt: 'Quatro ventos grandes',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    description: 'Trincas dos quatro ventos.',
    example: '111z222z333z444z11m',
  },
  {
    id: 'chanta',
    romaji: 'Chanta',
    kanji: '全帯',
    namePt: 'Terminais e honras em tudo',
    hanClosed: 2,
    hanOpen: 1,
    category: 'terminais-honras',
    description:
      'Todo grupo e o par contêm um terminal ou uma honra. Precisa ter pelo menos uma sequência.',
    example: '123m789p111z789s99m',
  },
  {
    id: 'junchan',
    romaji: 'Junchan',
    kanji: '純全帯么',
    namePt: 'Terminais em tudo',
    hanClosed: 3,
    hanOpen: 2,
    category: 'terminais-honras',
    description: 'Todo grupo e o par contêm um terminal. Sem honras.',
    example: '123m789p111s789s99m',
  },
  {
    id: 'honroutou',
    romaji: 'Honroutou',
    kanji: '混老頭',
    namePt: 'Terminais e honras',
    hanClosed: 2,
    hanOpen: 2,
    category: 'terminais-honras',
    description: 'Só terminais e honras (sempre combina com Toitoi ou Chiitoitsu).',
    example: '111m999p111z999s55z',
  },
  {
    id: 'chinroutou',
    romaji: 'Chinroutou',
    kanji: '清老頭',
    namePt: 'Só terminais',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    description: 'Mão formada apenas por 1s e 9s.',
    example: '111m999m111p999s11s',
  },
  {
    id: 'tsuuiisou',
    romaji: 'Tsuuiisou',
    kanji: '字一色',
    namePt: 'Só honras',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    description: 'Mão formada apenas por ventos e dragões.',
    example: '111z222z555z666z77z',
  },
  {
    id: 'kokushi',
    romaji: 'Kokushi musou',
    kanji: '国士無双',
    namePt: 'Treze órfãos',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'terminais-honras',
    apelidos: ['kokushi'],
    description: 'Um de cada terminal e honra (13 pedras) + uma repetida. Só fechada.',
    example: '119m19p19s1234567z',
  },

  // ── Pares / Trincas / Quads
  {
    id: 'chiitoitsu',
    romaji: 'Chiitoitsu',
    kanji: '七対子',
    namePt: 'Sete pares',
    hanClosed: 2,
    hanOpen: null,
    category: 'trincas-pares',
    apelidos: ['chiitoi'],
    description:
      'Exatamente 7 pares, só vale se a mão estiver fechada. Vale lembrar que dois pares iguais não contam.',
    dica: 'Vale tentar quando a mão inicial já tem 4 pares. O ideal é começar com 5. Dependendo da mão, pode ser melhor ir para Toitoi.',
    example: '11m33m55p77p22s66s11z',
  },
  {
    id: 'toitoi',
    romaji: 'Toitoi',
    kanji: '対々',
    namePt: 'Todas trincas',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    description: '4 trincas (ou quads) + 1 par.',
    example: '222m555p888s111z99m',
  },
  {
    id: 'sanankou',
    romaji: "San'ankou",
    kanji: '三暗刻',
    namePt: 'Três trincas ocultas',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    apelidos: ['sanankou', 'san ankou'],
    description: 'Três trincas formadas sem chamar pedras (o resto da mão pode ser aberto).',
    example: '222m555p888s345s99m',
  },
  {
    id: 'suuankou',
    romaji: 'Suuankou',
    kanji: '四暗刻',
    namePt: 'Quatro trincas ocultas',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'trincas-pares',
    description: 'Quatro trincas formadas sem chamar pedras. Só fechada.',
    example: '222m444m777p333s55z',
  },
  {
    id: 'sanshoku-doukou',
    romaji: 'Sanshoku doukou',
    kanji: '三色同刻',
    namePt: 'Três trincas coloridas',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    description: 'A mesma trinca numérica nos três naipes.',
    example: '333m333p333s678s55p',
  },
  {
    id: 'sankantsu',
    romaji: 'Sankantsu',
    kanji: '三槓子',
    namePt: 'Três quads',
    hanClosed: 2,
    hanOpen: 2,
    category: 'trincas-pares',
    description: 'Três quads, abertos ou fechados.',
    example: '2222m5555p7777s123m99s',
  },
  {
    id: 'suukantsu',
    romaji: 'Suukantsu',
    kanji: '四槓子',
    namePt: 'Quatro quads',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'trincas-pares',
    description: 'Quatro quads.',
    example: '2222m5555p7777s1111z99s',
  },

  // ── Naipes
  {
    id: 'honitsu',
    romaji: "Hon'itsu",
    kanji: '混一色',
    namePt: 'Meio flush',
    hanClosed: 3,
    hanOpen: 2,
    category: 'naipes',
    apelidos: ['honitsu'],
    description: 'Um único naipe misturado com honras.',
    example: '123p456p789p111z55z',
  },
  {
    id: 'chinitsu',
    romaji: "Chin'itsu",
    kanji: '清一色',
    namePt: 'Flush completo',
    hanClosed: 6,
    hanOpen: 5,
    category: 'naipes',
    apelidos: ['chinitsu'],
    description: 'Um único naipe, sem honras.',
    example: '123m345m567m789m22m',
  },
  {
    id: 'ryuuiisou',
    romaji: 'Ryuuiisou',
    kanji: '緑一色',
    namePt: 'Tudo verde',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'naipes',
    description: 'Apenas 2, 3, 4, 6, 8 de Sou e Dragão Verde.',
    example: '234s666s888s666z22s',
  },
  {
    id: 'chuuren',
    romaji: 'Chuuren poutou',
    kanji: '九連宝燈',
    namePt: 'Nove portões',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'naipes',
    apelidos: ['chuuren'],
    description: '1112345678999 de um naipe + qualquer pedra do mesmo naipe. Só fechada.',
    example: '11123455678999m',
  },

  // ── Outros
  {
    id: 'riichi',
    romaji: 'Riichi',
    kanji: '立直',
    namePt: 'Declarar pronto',
    hanClosed: 1,
    hanOpen: null,
    category: 'outros',
    description:
      'Declare em tenpai com a mão fechada, apostando 1.000 pontos. Habilita Ippatsu e Ura-dora.',
  },
  {
    id: 'double-riichi',
    romaji: 'Daburu Riichi',
    kanji: 'ダブル立直',
    namePt: 'Riichi duplo',
    hanClosed: 1,
    hanOpen: null,
    bonus: true,
    category: 'outros',
    apelidos: ['double riichi', 'riichi duplo'],
    description: 'Riichi declarado no primeiro descarte, sem chamadas antes.',
  },
  {
    id: 'ippatsu',
    romaji: 'Ippatsu',
    kanji: '一発',
    namePt: 'Ippatsu',
    hanClosed: 1,
    hanOpen: null,
    bonus: true,
    category: 'outros',
    description: 'Vencer dentro da primeira volta após o Riichi, sem chamadas no meio.',
  },
  {
    id: 'menzen-tsumo',
    romaji: 'Menzen tsumo',
    kanji: '門前ツモ',
    namePt: 'Tsumo fechado',
    hanClosed: 1,
    hanOpen: null,
    category: 'outros',
    description: 'Vencer por compra própria (tsumo) com a mão totalmente fechada.',
  },
  {
    id: 'haitei',
    romaji: 'Haitei raoyue',
    kanji: '海底撈月',
    namePt: 'Debaixo do mar',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
    apelidos: ['haitei'],
    description: 'Vencer por tsumo com a última pedra do muro.',
  },
  {
    id: 'houtei',
    romaji: 'Houtei raoyui',
    kanji: '河底撈魚',
    namePt: 'Debaixo do rio',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
    apelidos: ['houtei'],
    description: 'Vencer com o último descarte da mão.',
  },
  {
    id: 'rinshan',
    romaji: 'Rinshan kaihou',
    kanji: '嶺上開花',
    namePt: 'Flor no topo da montanha',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
    apelidos: ['rinshan'],
    description: 'Vencer com a pedra de reposição após declarar um kan.',
  },
  {
    id: 'chankan',
    romaji: 'Chankan',
    kanji: '搶槓',
    namePt: 'Roubando o kan',
    hanClosed: 1,
    hanOpen: 1,
    category: 'outros',
    description:
      'Vencer com a pedra que outro jogador adiciona a um pon para formar kan. Kan fechado só pode ser roubado para Kokushi.',
  },
  {
    id: 'tenhou',
    romaji: 'Tenhou',
    kanji: '天和',
    namePt: 'Mão celestial',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'outros',
    description: 'O dealer vence com a mão inicial.',
  },
  {
    id: 'chiihou',
    romaji: 'Chiihou',
    kanji: '地和',
    namePt: 'Mão terrestre',
    hanClosed: null,
    hanOpen: null,
    yakuman: true,
    category: 'outros',
    description: 'Não-dealer vence por tsumo na primeira compra, sem chamadas antes.',
  },
  {
    id: 'renhou',
    romaji: 'Renhou',
    kanji: '人和',
    namePt: 'Mão humana',
    hanClosed: 5,
    hanOpen: null,
    category: 'outros',
    description:
      'Vencer por ron antes da sua primeira compra, sem chamadas antes. Não soma outros yakus nem dora (EMA).',
  },
]

export const DORA_NOTE =
  'Dora não é yaku: só soma han se a mão já tiver pelo menos um yaku. O indicador aponta a próxima pedra (9→1, N→E, Vermelho→Branco).'

/** Nota da aba Yakuman: o kazoe não é um yaku, é a soma que chega lá. */
export const KAZOE_NOTE =
  '**Kazoe yakuman** não é um yaku: é a mão que soma 13 han ou mais (yakus e doras) e passa a valer um Yakuman. Nem toda mesa usa: sem ele, a mão para em Sanbaiman.'

// ── Aba Yaku para iniciantes
export interface BeginnerGroup {
  title: string
  subtitle: string
  ids: string[]
}

export const BEGINNER_GROUPS: BeginnerGroup[] = [
  {
    title: 'Yakus essenciais de 1 han',
    subtitle: 'Comece por estes',
    ids: ['riichi', 'tanyao', 'yakuhai', 'pinfu', 'menzen-tsumo'],
  },
  {
    title: 'Yakus fáceis de 2+ han',
    subtitle: 'Para o próximo passo',
    ids: ['chiitoitsu', 'toitoi', 'sanshoku-doujun', 'ittsuu', 'honitsu', 'chinitsu'],
  },
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
