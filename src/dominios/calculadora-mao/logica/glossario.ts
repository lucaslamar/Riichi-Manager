/**
 * Glossário do Guia de bolso: fonte única da aba Glossário e da tela de termo
 * (aberta ao tocar num termo destacado nas descrições).
 *
 * Os termos ficam agrupados por assunto. Cada seção é um bloco com título e
 * itens (subtítulos); a tela de termo mostra o bloco do assunto inteiro com o
 * item tocado destacado. Cada item tem os aliases que o ligam aos textos;
 * alguns aliases apontam para a seção inteira (ex.: "naipe", "honras").
 *
 * Os yakus da referência também viram link (pelo romaji e pelos `apelidos`)
 * e abrem o cartão do yaku. Se um nome existe nos dois, vale o do glossário.
 *
 * Negrito nos textos: `**assim**`.
 */
import { BASE_PATAMAR } from '@/compartilhado/mahjong/pontuacao'
import { DORA_NOTE, YAKU, type Yaku } from './yakus'

export type PedrasGlossario =
  | {
      tipo: 'mpsz'
      mpsz: string
      /** Mostra em cima de cada pedra o número (naipes) ou o nome japonês (honras). */
      numerar?: boolean
    }
  /** As três sequências do indicador de dora, com setas. */
  | { tipo: 'ciclosDora' }

export interface ItemGlossario {
  /** Id do termo (usado nos links e no destaque). */
  id: string
  nome: string
  kanji?: string
  /** Leitura do kanji, entre parênteses depois dele (ex.: 鳴き (naki)). */
  leitura?: string
  /** Apelido ao lado do nome (ex.: Man • Caracteres). */
  apelido?: string
  /** Sub-verbete do item anterior: vem recuado, como continuação dele. */
  sub?: boolean
  texto?: string
  topicos?: string[]
  pedras?: PedrasGlossario
  /** Nota no fim do item, depois das pedras (ex.: "Dora não é yaku"). */
  nota?: string
  /** Formas que viram link nas descrições (sem diferenciar maiúsculas). */
  aliases: string[]
  /** Termos que não viram link nos textos deste item (ex.: Riichi como nome do jogo). */
  semLink?: string[]
}

/** Mão de exemplo com um rótulo (link para o verbete) embaixo de cada grupo. */
export interface MaoExemploGlossario {
  mpsz: string
  rotulos: string[]
}

export interface SecaoGlossario {
  id: string
  titulo: string
  kanji?: string
  /** Linha de abertura do bloco. */
  intro?: string
  /** Exemplo visual logo depois da abertura, antes dos itens. */
  exemplo?: MaoExemploGlossario
  itens: ItemGlossario[]
  /** Aliases que abrem a seção sem destacar nenhum item. */
  aliases?: string[]
}

const IPPATSU = YAKU.find((yaku) => yaku.id === 'ippatsu')

const numeradas = (mpsz: string): PedrasGlossario => ({ tipo: 'mpsz', mpsz, numerar: true })
const exemplo = (mpsz: string): PedrasGlossario => ({ tipo: 'mpsz', mpsz })

/** Valor do patamar no ron, das mesmas bases da calculadora: ko 4×, oya 6×. */
const valePatamar = (base: number) =>
  `Vale ${(base * 4).toLocaleString('pt-BR')} (${(base * 6).toLocaleString('pt-BR')} sendo oya).`

/** Assuntos, na ordem em que costumam aparecer numa partida. */
export const SECOES_GLOSSARIO: SecaoGlossario[] = [
  {
    id: 'naipes',
    titulo: 'Naipes',
    kanji: '数牌',
    intro: 'Pedras numeradas de 1 a 9, em três naipes.',
    aliases: ['naipe', 'naipes'],
    itens: [
      {
        id: 'man',
        nome: 'Man',
        kanji: '萬',
        apelido: 'Caracteres',
        pedras: numeradas('123456789m'),
        aliases: ['man', 'manzu'],
      },
      {
        id: 'pin',
        nome: 'Pin',
        kanji: '筒',
        apelido: 'Círculos',
        pedras: numeradas('123456789p'),
        aliases: ['pin', 'pinzu'],
      },
      {
        id: 'sou',
        nome: 'Sou',
        kanji: '索',
        apelido: 'Bambus',
        pedras: numeradas('123456789s'),
        aliases: ['sou', 'souzu'],
      },
      {
        id: 'terminais',
        nome: 'Terminais e simples',
        topicos: ['1 e 9 são **terminais**.', '2 a 8 são **simples**.'],
        aliases: ['terminal', 'terminais', 'routouhai', 'simples', 'chunchanpai'],
      },
    ],
  },
  {
    id: 'honras',
    titulo: 'Honras',
    kanji: '字牌',
    intro: 'Pedras sem número: ventos e dragões.',
    aliases: ['honra', 'honras', 'jihai'],
    itens: [
      {
        id: 'ventos',
        nome: 'Ventos',
        kanji: '風牌',
        texto: 'Ton (Leste), Nan (Sul), Shaa (Oeste), Pei (Norte)',
        pedras: numeradas('1234z'),
        aliases: ['vento', 'ventos', 'kazehai', 'leste', 'sul', 'oeste', 'norte'],
      },
      {
        id: 'dragoes',
        nome: 'Dragões',
        kanji: '三元牌',
        texto: 'Haku (Branco), Hatsu (Verde), Chun (Vermelho)',
        pedras: numeradas('567z'),
        aliases: ['dragão', 'dragões', 'dragao', 'dragoes', 'sangenpai'],
      },
    ],
  },
  {
    id: 'mao',
    titulo: 'Formação da mão',
    intro: 'A mão comum tem 4 grupos (sequências ou trincas) + 1 par.',
    exemplo: {
      mpsz: '234m345p777s111z77z',
      rotulos: ['Sequência', 'Sequência', 'Trinca', 'Trinca', 'Par'],
    },
    itens: [
      {
        id: 'sequencia',
        nome: 'Sequência',
        kanji: '順子',
        texto: 'Três números seguidos do mesmo naipe (ex.: 3-4-5 de Pin). Pode vir de um chi.',
        pedras: exemplo('345p'),
        aliases: ['sequência', 'sequências', 'sequencia', 'sequencias', 'shuntsu'],
      },
      {
        id: 'trinca',
        nome: 'Trinca',
        kanji: '刻子',
        texto: 'Três pedras iguais. Pode vir de um pon.',
        pedras: exemplo('555s'),
        aliases: ['trinca', 'trincas', 'trio', 'trios', 'koutsu'],
      },
      {
        id: 'par',
        nome: 'Par',
        kanji: '雀頭',
        texto: 'Duas pedras iguais.',
        pedras: exemplo('77z'),
        aliases: ['par', 'pares', 'jantou'],
      },
    ],
  },
  {
    id: 'chamadas',
    titulo: 'Chamadas',
    itens: [
      {
        id: 'chamada',
        nome: 'Chamada',
        kanji: '鳴き',
        leitura: 'naki',
        texto:
          'Pegar o descarte de outro jogador para formar uma combinação com chi, pon ou kan. Toda chamada abre a mão, exceto o kan fechado.',
        aliases: [
          'chamada',
          'chamadas',
          'chamar',
          'chamou',
          'chamando',
          'chamado',
          'chamados',
          'naki',
        ],
      },
      {
        id: 'chi',
        nome: 'Chi',
        kanji: 'チー',
        texto: 'Pegar o descarte do jogador à sua esquerda para formar uma sequência.',
        aliases: ['chi', 'chii'],
      },
      {
        id: 'pon',
        nome: 'Pon',
        kanji: 'ポン',
        texto: 'Pegar o descarte de qualquer jogador para formar uma trinca.',
        aliases: ['pon'],
      },
      {
        id: 'kan',
        nome: 'Kan',
        kanji: 'カン',
        texto:
          'Quatro pedras iguais. Você compra uma pedra de reposição e revela mais um indicador de dora. O kan fechado (as quatro são suas) não abre a mão.',
        aliases: ['kan', 'kans', 'kantsu', 'quad', 'quads'],
      },
      {
        id: 'kuitan',
        nome: 'Kuitan',
        kanji: '喰いタン',
        texto:
          "Tan'yao com a mão aberta. Permitido pelas regras da EMA, mas algumas mesas jogam sem ele (kuitan nashi).",
        aliases: ['kuitan'],
      },
    ],
  },
  {
    id: 'vitoria',
    titulo: 'Espera e vitória',
    itens: [
      {
        id: 'tenpai',
        nome: 'Tenpai',
        kanji: '聴牌',
        texto: 'Falta só uma pedra para completar a mão.',
        aliases: ['tenpai', 'tempai'],
      },
      {
        id: 'ryanmen',
        nome: 'Ryanmen',
        kanji: '両面',
        texto:
          'Espera de duas pontas: dois números seguidos que completam com a pedra de qualquer lado (3-4 espera 2 ou 5).',
        pedras: exemplo('34m'),
        aliases: ['ryanmen'],
      },
      {
        id: 'riichi',
        nome: 'Riichi',
        kanji: '立直',
        texto: 'Declarar tenpai com a mão fechada, apostando 1.000 pontos. Vale 1 han.',
        aliases: ['riichi'],
      },
      {
        id: 'ippatsu',
        nome: 'Ippatsu',
        kanji: '一発',
        texto: IPPATSU?.description ?? '',
        aliases: ['ippatsu', 'ipatsu'],
      },
      {
        id: 'tsumo',
        nome: 'Tsumo',
        kanji: 'ツモ',
        texto: 'Vencer com uma pedra comprada por você.',
        aliases: ['tsumo'],
      },
      {
        id: 'ron',
        nome: 'Ron',
        kanji: 'ロン',
        texto: 'Vencer com o descarte de outro jogador.',
        aliases: ['ron'],
      },
      {
        id: 'ron-duplo',
        nome: 'Ron duplo',
        kanji: 'ダブロン',
        leitura: 'daburon',
        sub: true,
        texto:
          'Dois jogadores dão ron no mesmo descarte e os dois vencem. Quem descartou paga cada um deles.',
        topicos: [
          '**Atamahane**: algumas mesas não aceitam ron duplo e só um vence. Ganha quem joga primeiro depois de quem descartou.',
          'Com três ron no mesmo descarte, muitas mesas anulam a rodada (sanchahou).',
        ],
        aliases: ['ron duplo', 'double ron', 'daburon', 'atamahane'],
      },
      {
        id: 'furiten',
        nome: 'Furiten',
        kanji: '振聴',
        texto: 'Se você já descartou uma das suas esperas, não pode vencer por ron, só por tsumo.',
        aliases: ['furiten'],
      },
    ],
  },
  {
    id: 'dora',
    titulo: 'Dora',
    kanji: 'ドラ',
    itens: [
      {
        id: 'dora',
        nome: 'Dora',
        kanji: 'ドラ',
        texto: 'Pedra bônus apontada pelo indicador. Cada uma vale 1 han, mas não é yaku.',
        topicos: [
          'O **indicador** é a pedra virada no muro morto.',
          'A dora é a pedra seguinte na ordem abaixo (indicador 7 de Pin → dora 8 de Pin).',
        ],
        pedras: { tipo: 'ciclosDora' },
        nota: DORA_NOTE,
        aliases: ['dora', 'doras', 'indicador', 'indicadores', 'indicador de dora'],
      },
      {
        id: 'kan-dora',
        nome: 'Kan-dora',
        texto: 'Cada kan revela mais um indicador.',
        aliases: ['kan-dora', 'kandora', 'kan dora'],
      },
      {
        id: 'ura-dora',
        nome: 'Ura-dora',
        kanji: '裏ドラ',
        texto:
          'Pedra embaixo de cada indicador. Só é revelada para quem vence depois de declarar Riichi.',
        aliases: ['ura-dora', 'uradora', 'ura dora'],
      },
      {
        id: 'aka-dora',
        nome: 'Aka dora',
        kanji: '赤ドラ',
        apelido: '5 vermelho',
        texto: 'Cada 5 vermelho vale 1 dora. Só conta com a regra Aka dora ligada.',
        pedras: exemplo('0m0p0s'),
        aliases: [
          'aka dora',
          'aka-dora',
          'akadora',
          '5 vermelho',
          '5 vermelhos',
          'cinco vermelho',
          'cincos vermelhos',
        ],
      },
    ],
  },
  {
    id: 'pontuacao',
    titulo: 'Pontuação',
    itens: [
      {
        id: 'yaku',
        nome: 'Yaku',
        kanji: '役',
        texto: 'Condição de pontuação. Toda mão precisa de pelo menos um yaku para vencer.',
        aliases: ['yaku', 'yakus'],
      },
      {
        id: 'han',
        nome: 'Han',
        kanji: '翻',
        texto: 'Valor de cada yaku e dora. Quanto mais han, mais pontos.',
        aliases: ['han'],
      },
      {
        id: 'fu',
        nome: 'Fu',
        kanji: '符',
        texto:
          'Pontos pela forma da mão (trincas, espera, jeito de vencer). Ajustam o valor até 4 han.',
        aliases: ['fu'],
      },
    ],
  },
  {
    id: 'patamares',
    titulo: 'Patamares de pontuação',
    aliases: ['patamar', 'patamares'],
    itens: [
      {
        id: 'mangan',
        nome: 'Mangan',
        kanji: '満貫',
        texto: `5 han, ou 4 han com 40 fu ou mais, ou 3 han com 70 fu ou mais. ${valePatamar(BASE_PATAMAR.mangan)}`,
        aliases: ['mangan', 'mangans'],
      },
      {
        id: 'haneman',
        nome: 'Haneman',
        kanji: '跳満',
        texto: `6 ou 7 han. ${valePatamar(BASE_PATAMAR.haneman)}`,
        aliases: ['haneman', 'hanemans'],
      },
      {
        id: 'baiman',
        nome: 'Baiman',
        kanji: '倍満',
        texto: `8 a 10 han. ${valePatamar(BASE_PATAMAR.baiman)}`,
        aliases: ['baiman', 'baimans'],
      },
      {
        id: 'sanbaiman',
        nome: 'Sanbaiman',
        kanji: '三倍満',
        texto: `11 ou 12 han. ${valePatamar(BASE_PATAMAR.sanbaiman)}`,
        aliases: ['sanbaiman', 'sanbaimans'],
      },
      {
        id: 'yakuman',
        nome: 'Yakuman',
        kanji: '役満',
        texto: `Mão máxima. ${valePatamar(BASE_PATAMAR.yakuman)}`,
        aliases: ['yakuman', 'yakumans', 'kazoe yakuman'],
      },
    ],
  },
  {
    id: 'mesa',
    titulo: 'Mesa',
    itens: [
      {
        id: 'oya',
        nome: 'Oya',
        kanji: '親',
        texto:
          'O dealer, sempre o Leste. Ganha 1,5× ao vencer. Se vencer ou ficar em tenpai no empate, faz renchan.',
        aliases: ['oya', 'dealer', 'dealers'],
      },
      {
        id: 'renchan',
        nome: 'Renchan',
        kanji: '連荘',
        sub: true,
        texto:
          'Quando o oya continua como dealer na mão seguinte. Acontece se ele vencer ou se ficar em tenpai num empate. O vento dos jogadores não gira e o contador de honba sobe.',
        aliases: ['renchan'],
      },
      {
        id: 'ko',
        nome: 'Ko',
        kanji: '子',
        texto: 'Os outros três jogadores, que não são o dealer.',
        aliases: ['ko'],
      },
      {
        id: 'honba',
        nome: 'Honba',
        kanji: '本場',
        texto:
          'Contador de mãos extras. Sobe a cada renchan ou empate e zera quando um ko vence. Cada honba soma 300 pontos ao próximo vencedor (no tsumo, 100 de cada jogador).',
        aliases: ['honba', 'honbas'],
      },
      {
        id: 'empate',
        nome: 'Empate / Ryuukyoku',
        kanji: '流局',
        texto: 'Rodada termina sem vencedor quando o muro acaba.',
        aliases: ['empate', 'empates', 'empatada', 'empatado', 'ryuukyoku'],
      },
      {
        id: 'empate-abortivo',
        nome: 'Empate abortivo',
        kanji: '途中流局',
        leitura: 'tochuu ryuukyoku',
        sub: true,
        texto:
          'A rodada é anulada antes de o muro acabar. O oya continua e o honba sobe. As regras da EMA não usam empate abortivo, mas muitas mesas usam. Os casos comuns:',
        topicos: [
          '**Kyuushu kyuuhai**: 9 terminais ou honras diferentes na mão inicial. O jogador pode anular a rodada.',
          '**Suufon renda**: os quatro jogadores descartam o mesmo vento na primeira volta.',
          '**Suucha riichi**: os quatro jogadores declaram Riichi.',
          '**Suukaikan**: quatro kans de jogadores diferentes.',
          '**Sanchahou**: três jogadores dão ron no mesmo descarte.',
        ],
        aliases: [
          'empate abortivo',
          'empates abortivos',
          'tochuu ryuukyoku',
          'kyuushu kyuuhai',
          'suufon renda',
          'suucha riichi',
          'suukaikan',
          'sanchahou',
        ],
      },
      {
        id: 'chombo',
        nome: 'Chombo',
        kanji: '錯和',
        texto: 'Penalidade por erro grave, como vencer sem yaku ou dar ron em furiten.',
        aliases: ['chombo'],
      },
    ],
  },
  {
    id: 'regras',
    titulo: 'Regras e entidades',
    itens: [
      {
        id: 'ema',
        nome: 'EMA',
        texto:
          'European Mahjong Association, entidade que organiza o mahjong competitivo na Europa. Publica o RCR (Riichi Competition Rules), regulamento de Riichi usado como referência por muitos clubes fora do Japão.',
        aliases: ['ema', 'rcr'],
        // Aqui Riichi é o nome do jogo, não a declaração.
        semLink: ['riichi'],
      },
    ],
  },
]

// ── Busca dos termos nos textos

/** Prefixo dos ids de termo que apontam para um yaku da referência. */
const PREFIXO_YAKU = 'yaku:'

/** Termo = um item, ou a seção inteira (id da seção) para os aliases dela. */
interface TermoEncontrado {
  secao: SecaoGlossario
  item?: ItemGlossario
}

const TERMOS = new Map<string, TermoEncontrado>()
const ALIASES: [string, string][] = []
for (const secao of SECOES_GLOSSARIO) {
  if (secao.aliases) {
    TERMOS.set(secao.id, { secao })
    for (const alias of secao.aliases) ALIASES.push([alias, secao.id])
  }
  for (const item of secao.itens) {
    TERMOS.set(item.id, { secao, item })
    for (const alias of item.aliases) ALIASES.push([alias, item.id])
  }
}

const normalizar = (texto: string) => texto.toLocaleLowerCase('pt-BR').replace(/[\s-]+/g, ' ')

const TERMO_POR_ALIAS = new Map(ALIASES.map(([alias, termo]) => [normalizar(alias), termo]))

// Yakus depois do glossário: um nome que já é verbete (Riichi, Ippatsu) fica com ele.
const YAKU_POR_TERMO = new Map<string, Yaku>()
for (const yaku of YAKU) {
  const termo = `${PREFIXO_YAKU}${yaku.id}`
  YAKU_POR_TERMO.set(termo, yaku)
  for (const alias of [yaku.romaji, ...(yaku.apelidos ?? [])]) {
    const chave = normalizar(alias)
    if (!TERMO_POR_ALIAS.has(chave)) TERMO_POR_ALIAS.set(chave, termo)
  }
}

const escapar = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Todos os aliases numa expressão só, do mais longo para o mais curto (assim
 * "Ura-dora" ganha de "dora"). Limite de palavra com letras acentuadas: o
 * caractere antes é capturado (lookbehind quebraria iPhones antigos).
 */
const EXPRESSAO_TERMOS = new RegExp(
  `(^|[^\\p{L}\\p{N}])(${[...TERMO_POR_ALIAS.keys()]
    .sort((a, b) => b.length - a.length)
    .map((alias) => escapar(alias).replace(/ /g, '[\\s-]+'))
    .join('|')})(?=[^\\p{L}\\p{N}]|$)`,
  'giu',
)

export function buscarTermoGlossario(id: string): TermoEncontrado | null {
  return TERMOS.get(id) ?? null
}

/** Yaku da referência ligado ao termo (links de yaku), ou null para verbetes. */
export function buscarYakuDoTermo(id: string): Yaku | null {
  return YAKU_POR_TERMO.get(id) ?? null
}

/** Termo do glossário (ou yaku) com exatamente esse nome (ex.: o yaku "Riichi"). */
export function termoGlossarioDoNome(nome: string): string | undefined {
  return TERMO_POR_ALIAS.get(normalizar(nome))
}

/** Termos que não viram link nos textos de um item: ele mesmo, a seção e os `semLink`. */
export function termosDoItem(secao: SecaoGlossario, item?: ItemGlossario): string[] {
  return [secao.id, ...(item ? [item.id, ...(item.semLink ?? [])] : [])]
}

export interface TrechoGlossario {
  texto: string
  negrito: boolean
  /** Presente quando o trecho é um termo a virar link. */
  termo?: string
}

/**
 * Divide um texto em trechos (negrito `**…**` e termos do glossário). Só a
 * primeira ocorrência de cada termo vira link. `ignorar` = termos que não
 * viram link (ex.: o próprio verbete, o yaku do cartão, os assuntos de uma
 * ajuda "?").
 */
export function dividirTextoGlossario(
  texto: string,
  ignorar: (string | undefined)[] = [],
): TrechoGlossario[] {
  const ignorados = new Set(ignorar)

  const trechos: TrechoGlossario[] = []
  texto.split('**').forEach((parte, indice) => {
    const negrito = indice % 2 === 1
    let inicio = 0
    for (const encontro of parte.matchAll(EXPRESSAO_TERMOS)) {
      const [, antes, palavra] = encontro
      const achado = TERMO_POR_ALIAS.get(normalizar(palavra))
      if (!achado || ignorados.has(achado)) continue
      ignorados.add(achado)
      const posicao = (encontro.index ?? 0) + antes.length
      if (posicao > inicio) trechos.push({ texto: parte.slice(inicio, posicao), negrito })
      trechos.push({ texto: palavra, negrito, termo: achado })
      inicio = posicao + palavra.length
    }
    if (inicio < parte.length) trechos.push({ texto: parte.slice(inicio), negrito })
  })
  return trechos
}
