/**
 * Glossário do Guia de bolso: fonte única da aba Glossário e da tela de termo
 * (aberta ao tocar num termo destacado nas descrições).
 *
 * Os termos ficam agrupados por assunto. Cada seção é um bloco com título e
 * itens (subtítulos); a tela de termo mostra o bloco do assunto inteiro com o
 * item tocado destacado. Cada item tem os aliases que o ligam aos textos;
 * alguns aliases apontam para a seção inteira (ex.: "naipe", "honras").
 *
 * Os yakus da referência também viram link (pelo romaji, pelos `apelidos` e
 * pelo nome no idioma) e abrem o cartão do yaku. Se um nome existe nos dois,
 * vale o do glossário.
 *
 * Aqui fica a estrutura (ids, kanji, pedras); os textos e aliases de cada
 * idioma vêm de `conteudo/guia-bolso`. Cada idioma tem o próprio índice de
 * links e de busca, montado na primeira vez que é pedido.
 *
 * Negrito nos textos: `**assim**`.
 */
import type { IdiomaSuportado } from '@/compartilhado/i18n/idiomas'
import { idiomaGlobal } from '@/compartilhado/i18n/tradutorGlobal'
import { interpolar } from '@/compartilhado/i18n/traduzir'
import { BASE_PATAMAR } from '@/compartilhado/mahjong/pontuacao'
import { conteudoGuiaBolso, type IdSecaoGlossario } from '../conteudo/guia-bolso'
import { yakusDoIdioma, type Yaku } from './yakus'

export type PedrasGlossario =
  | {
      tipo: 'mpsz'
      mpsz: string
      /** Mostra em cima de cada pedra o número (naipes) ou o nome da honra. */
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
  /** Caixa cinza no fim do item que abre o tutorial "Como contar Han e Fu". */
  tutorialHanFu?: boolean
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

/** Parte de um item que não muda com o idioma. */
type ItemBase = Pick<
  ItemGlossario,
  'id' | 'kanji' | 'sub' | 'pedras' | 'tutorialHanFu' | 'semLink'
> & {
  /** Nota de dora no fim do item. */
  notaDora?: boolean
  /** Base do patamar: o texto ganha {{ko}} e {{oya}} com o valor no ron. */
  patamar?: keyof typeof BASE_PATAMAR
}

interface SecaoBase {
  id: IdSecaoGlossario
  kanji?: string
  exemplo?: string
  itens: ItemBase[]
}

const numeradas = (mpsz: string): PedrasGlossario => ({ tipo: 'mpsz', mpsz, numerar: true })
const exemplo = (mpsz: string): PedrasGlossario => ({ tipo: 'mpsz', mpsz })

/** Assuntos, na ordem em que costumam aparecer numa partida. */
const SECOES_BASE: SecaoBase[] = [
  {
    id: 'naipes',
    kanji: '数牌',
    itens: [
      { id: 'man', kanji: '萬', pedras: numeradas('123456789m') },
      { id: 'pin', kanji: '筒', pedras: numeradas('123456789p') },
      { id: 'sou', kanji: '索', pedras: numeradas('123456789s') },
      { id: 'terminais' },
    ],
  },
  {
    id: 'honras',
    kanji: '字牌',
    itens: [
      { id: 'ventos', kanji: '風牌', pedras: numeradas('1234z') },
      { id: 'dragoes', kanji: '三元牌', pedras: numeradas('567z') },
    ],
  },
  {
    id: 'mao',
    exemplo: '234m345p777s111z77z',
    itens: [
      { id: 'sequencia', kanji: '順子', pedras: exemplo('345p') },
      { id: 'trinca', kanji: '刻子', pedras: exemplo('555s') },
      { id: 'par', kanji: '雀頭', pedras: exemplo('77z') },
    ],
  },
  {
    id: 'chamadas',
    itens: [
      { id: 'chamada', kanji: '鳴き' },
      { id: 'chi', kanji: 'チー' },
      { id: 'pon', kanji: 'ポン' },
      { id: 'kan', kanji: 'カン' },
      { id: 'kuitan', kanji: '喰いタン' },
    ],
  },
  {
    id: 'vitoria',
    itens: [
      { id: 'tenpai', kanji: '聴牌' },
      { id: 'ryanmen', kanji: '両面', pedras: exemplo('34m') },
      { id: 'riichi', kanji: '立直' },
      { id: 'ippatsu', kanji: '一発' },
      { id: 'tsumo', kanji: 'ツモ' },
      { id: 'ron', kanji: 'ロン' },
      { id: 'ron-duplo', kanji: 'ダブロン', sub: true },
      { id: 'furiten', kanji: '振聴' },
    ],
  },
  {
    id: 'dora',
    kanji: 'ドラ',
    itens: [
      { id: 'dora', kanji: 'ドラ', pedras: { tipo: 'ciclosDora' }, notaDora: true },
      { id: 'kan-dora' },
      { id: 'ura-dora', kanji: '裏ドラ' },
      { id: 'aka-dora', kanji: '赤ドラ', pedras: exemplo('0m0p0s') },
    ],
  },
  {
    id: 'pontuacao',
    itens: [
      { id: 'yaku', kanji: '役' },
      { id: 'han', kanji: '翻' },
      { id: 'fu', kanji: '符', tutorialHanFu: true },
    ],
  },
  {
    id: 'patamares',
    itens: [
      { id: 'mangan', kanji: '満貫', patamar: 'mangan' },
      { id: 'haneman', kanji: '跳満', patamar: 'haneman' },
      { id: 'baiman', kanji: '倍満', patamar: 'baiman' },
      { id: 'sanbaiman', kanji: '三倍満', patamar: 'sanbaiman' },
      { id: 'yakuman', kanji: '役満', patamar: 'yakuman' },
    ],
  },
  {
    id: 'mesa',
    itens: [
      { id: 'oya', kanji: '親' },
      { id: 'renchan', kanji: '連荘', sub: true },
      { id: 'ko', kanji: '子' },
      { id: 'honba', kanji: '本場' },
      { id: 'empate', kanji: '流局' },
      { id: 'empate-abortivo', kanji: '途中流局', sub: true },
      { id: 'chombo', kanji: '錯和' },
    ],
  },
  {
    id: 'regras',
    itens: [
      // Aqui Riichi é o nome do jogo, não a declaração (nem o yaku).
      { id: 'ema', semLink: ['riichi', 'yaku:riichi'] },
      { id: 'm-league', semLink: ['riichi', 'yaku:riichi'] },
    ],
  },
]

/** Assuntos com os textos do idioma. */
function montarSecoes(idioma: IdiomaSuportado): SecaoGlossario[] {
  const conteudo = conteudoGuiaBolso(idioma)
  const ippatsu = conteudo.yakus.ippatsu.descricao
  return SECOES_BASE.map(({ id, kanji, exemplo: mpsz, itens }) => {
    const textos = conteudo.secoes[id]
    return {
      id,
      kanji,
      titulo: textos.titulo,
      intro: textos.intro,
      aliases: textos.aliases,
      exemplo: mpsz ? { mpsz, rotulos: textos.rotulosExemplo ?? [] } : undefined,
      itens: itens.map(({ notaDora, patamar, ...base }) => {
        const item = textos.itens[base.id]
        const texto = item.texto ?? (base.id === 'ippatsu' ? ippatsu : undefined)
        return {
          ...base,
          ...item,
          // Valor do patamar no ron, das mesmas bases da calculadora: ko 4×, oya 6×.
          texto:
            texto && patamar
              ? interpolar(texto, idioma, {
                  ko: BASE_PATAMAR[patamar] * 4,
                  oya: BASE_PATAMAR[patamar] * 6,
                })
              : texto,
          nota: notaDora ? conteudo.notaDora : undefined,
        }
      }),
    }
  })
}

// ── Busca dos termos nos textos

/** Prefixo dos ids de termo que apontam para um yaku da referência. */
const PREFIXO_YAKU = 'yaku:'

/** Termo = um item, ou a seção inteira (id da seção) para os aliases dela. */
interface TermoEncontrado {
  secao: SecaoGlossario
  item?: ItemGlossario
}

/**
 * Como achar um termo no meio do texto. Em pt-BR, en e lt o termo é palavra
 * inteira. Japonês e chinês não separam palavras com espaço: o termo vale em
 * qualquer ponto. Coreano separa, mas cola a partícula no fim ("리치를"): o termo
 * precisa começar uma palavra, mas pode terminar no meio dela.
 */
type Escrita = 'palavras' | 'coreano' | 'sem-espacos'

const ESCRITA: Record<IdiomaSuportado, Escrita> = {
  'pt-BR': 'palavras',
  en: 'palavras',
  lt: 'palavras',
  ko: 'coreano',
  ja: 'sem-espacos',
  'zh-Hans': 'sem-espacos',
}

const normalizar = (texto: string) => texto.toLocaleLowerCase('pt-BR').replace(/[\s-]+/g, ' ')

const escapar = (texto: string) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

interface IndiceGlossario {
  secoes: SecaoGlossario[]
  yakus: Yaku[]
  termos: Map<string, TermoEncontrado>
  termoPorAlias: Map<string, string>
  yakuPorTermo: Map<string, Yaku>
  expressao: RegExp
  escrita: Escrita
}

function montarIndice(idioma: IdiomaSuportado): IndiceGlossario {
  const secoes = montarSecoes(idioma)
  const yakus = yakusDoIdioma(idioma)
  const escrita = ESCRITA[idioma]

  const termos = new Map<string, TermoEncontrado>()
  const aliases: [string, string][] = []
  for (const secao of secoes) {
    if (secao.aliases) {
      termos.set(secao.id, { secao })
      for (const alias of secao.aliases) aliases.push([alias, secao.id])
    }
    for (const item of secao.itens) {
      termos.set(item.id, { secao, item })
      for (const alias of item.aliases) aliases.push([alias, item.id])
    }
  }
  const termoPorAlias = new Map(aliases.map(([alias, termo]) => [normalizar(alias), termo]))

  // Yakus depois do glossário: um nome que já é verbete (Riichi, Ippatsu) fica com ele.
  const yakuPorTermo = new Map<string, Yaku>()
  for (const yaku of yakus) {
    const termo = `${PREFIXO_YAKU}${yaku.id}`
    yakuPorTermo.set(termo, yaku)
    for (const alias of yaku.apelidos) {
      const chave = normalizar(alias)
      if (!termoPorAlias.has(chave)) termoPorAlias.set(chave, termo)
    }
  }

  /*
   * Todos os aliases numa expressão só, do mais longo para o mais curto (assim
   * "Ura-dora" ganha de "dora"). Limite de palavra com letras acentuadas: o
   * caractere antes é capturado (lookbehind quebraria iPhones antigos).
   */
  const antes = escrita === 'sem-espacos' ? '()' : '(^|[^\\p{L}\\p{N}])'
  const depois = escrita === 'palavras' ? '(?=[^\\p{L}\\p{N}]|$)' : ''
  const expressao = new RegExp(
    `${antes}(${[...termoPorAlias.keys()]
      .sort((a, b) => b.length - a.length)
      .map((alias) => escapar(alias).replace(/ /g, '[\\s-]+'))
      .join('|')})${depois}`,
    'giu',
  )

  return { secoes, yakus, termos, termoPorAlias, yakuPorTermo, expressao, escrita }
}

const indices = new Map<IdiomaSuportado, IndiceGlossario>()

function indice(idioma: IdiomaSuportado = idiomaGlobal()): IndiceGlossario {
  let atual = indices.get(idioma)
  if (!atual) {
    atual = montarIndice(idioma)
    indices.set(idioma, atual)
  }
  return atual
}

/** Assuntos do glossário no idioma (o ativo, se nenhum for dado). */
export function secoesGlossario(idioma?: IdiomaSuportado): SecaoGlossario[] {
  return indice(idioma).secoes
}

/** Assuntos em pt-BR, para os textos fixos em português (ex.: guia Aprender a jogar). */
export const SECOES_GLOSSARIO = secoesGlossario('pt-BR')

export function buscarTermoGlossario(id: string, idioma?: IdiomaSuportado): TermoEncontrado | null {
  return indice(idioma).termos.get(id) ?? null
}

/** Yaku da referência ligado ao termo (links de yaku), ou null para verbetes. */
export function buscarYakuDoTermo(id: string, idioma?: IdiomaSuportado): Yaku | null {
  return indice(idioma).yakuPorTermo.get(id) ?? null
}

/** Termo do glossário (ou yaku) com exatamente esse nome (ex.: o yaku "Riichi"). */
export function termoGlossarioDoNome(nome: string, idioma?: IdiomaSuportado): string | undefined {
  return indice(idioma).termoPorAlias.get(normalizar(nome))
}

/** Termos que não viram link nos textos de um item: ele mesmo, a seção e os `semLink`. */
export function termosDoItem(secao: SecaoGlossario, item?: ItemGlossario): string[] {
  return [secao.id, ...(item ? [item.id, ...(item.semLink ?? [])] : [])]
}

// ── Pesquisa do Guia de bolso

/** Minúsculas e sem acento, para "dragao" achar "dragão". */
const paraBusca = (texto: string) =>
  normalizar(texto).normalize('NFD').replace(/\p{M}/gu, '').replace(/[’']/g, '')

/**
 * Formas da busca: como foi digitada e sem o "s" do plural (assim "yakus"
 * acha Yaku e "pares" acha Par).
 */
const formasDaBusca = (texto: string) => {
  const busca = paraBusca(texto.trim())
  return [...new Set([busca, busca.replace(/(\p{L}{3,})s(?= |$)/gu, '$1')])]
}

/**
 * Bate no começo de alguma palavra: "atama" acha Atamahane, não "Patamares".
 * Em japonês, chinês e coreano vale qualquer trecho ("暗刻" acha 三暗刻).
 */
const bate = (buscas: string[], textos: (string | undefined)[], escrita: Escrita) =>
  textos.some((texto) => {
    if (!texto) return false
    const alvo = ` ${paraBusca(texto)}`
    return buscas.some((busca) =>
      escrita === 'palavras' ? alvo.includes(` ${busca}`) : alvo.includes(busca),
    )
  })

/** Se a busca bate em algum dos textos (ex.: o nome das abas do Guia de bolso). */
export function correspondeBusca(texto: string, textos: string[], idioma?: IdiomaSuportado) {
  return bate(formasDaBusca(texto), textos, indice(idioma).escrita)
}

export interface ResultadoBuscaGlossario {
  /** Seções com só os itens que batem (todos, se o título da seção bateu). */
  secoes: SecaoGlossario[]
  yakus: Yaku[]
}

/**
 * Pesquisa pelo nome, kanji, apelido e aliases de cada termo (assim "dealer"
 * acha Oya), e pelo romaji, apelidos e nome no idioma dos yakus. Não busca
 * dentro das explicações, para não listar meio glossário a cada letra.
 */
export function buscarNoGlossario(
  texto: string,
  idioma?: IdiomaSuportado,
): ResultadoBuscaGlossario {
  const { secoes: todas, yakus: todosYakus, escrita } = indice(idioma)
  const busca = formasDaBusca(texto)
  const secoes: SecaoGlossario[] = []
  for (const secao of todas) {
    if (bate(busca, [secao.titulo, ...(secao.aliases ?? [])], escrita)) {
      secoes.push(secao)
      continue
    }
    const itens: ItemGlossario[] = []
    secao.itens.forEach((item, indiceItem) => {
      // O id entra para o romaji achar o verbete em qualquer idioma ("dora" acha ドラ).
      const textos = [item.id, item.nome, item.kanji, item.leitura, item.apelido, ...item.aliases]
      if (!bate(busca, textos, escrita)) return
      // Sub-verbete sem o item de cima na lista: vem como item comum.
      const paiNaLista = itens[itens.length - 1] === secao.itens[indiceItem - 1]
      itens.push(item.sub && !paiNaLista ? { ...item, sub: false } : item)
    })
    if (itens.length > 0) secoes.push({ ...secao, intro: undefined, exemplo: undefined, itens })
  }
  const yakus = todosYakus.filter((yaku) =>
    bate(busca, [yaku.kanji, yaku.nome, ...yaku.apelidos], escrita),
  )
  return { secoes, yakus }
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
 * ajuda "?"). Os termos são os do idioma: um texto em português num idioma
 * sem esses aliases só perde os links.
 */
export function dividirTextoGlossario(
  texto: string,
  ignorar: (string | undefined)[] = [],
  idioma?: IdiomaSuportado,
): TrechoGlossario[] {
  const { expressao, termoPorAlias } = indice(idioma)
  const ignorados = new Set(ignorar)

  const trechos: TrechoGlossario[] = []
  texto.split('**').forEach((parte, indiceParte) => {
    const negrito = indiceParte % 2 === 1
    let inicio = 0
    for (const encontro of parte.matchAll(expressao)) {
      const [, antes, palavra] = encontro
      const achado = termoPorAlias.get(normalizar(palavra))
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
