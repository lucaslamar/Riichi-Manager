/**
 * Textos do Guia de bolso num idioma. A parte que não muda com o idioma (ids,
 * kanji, han, exemplos de pedras) fica em `logica/yakus.ts` e
 * `logica/glossario.ts`; aqui ficam só os textos e as formas que viram link.
 *
 * Negrito nos textos: `**assim**`. Nos patamares, `{{ko}}` e `{{oya}}` viram o
 * valor no ron, já formatado no idioma.
 */

export type IdYaku =
  | 'iipeikou'
  | 'ryanpeikou'
  | 'pinfu'
  | 'sanshoku-doujun'
  | 'ittsuu'
  | 'tanyao'
  | 'yakuhai'
  | 'shousangen'
  | 'daisangen'
  | 'shousuushii'
  | 'daisuushii'
  | 'chanta'
  | 'junchan'
  | 'honroutou'
  | 'chinroutou'
  | 'tsuuiisou'
  | 'kokushi'
  | 'chiitoitsu'
  | 'toitoi'
  | 'sanankou'
  | 'suuankou'
  | 'sanshoku-doukou'
  | 'sankantsu'
  | 'suukantsu'
  | 'honitsu'
  | 'chinitsu'
  | 'ryuuiisou'
  | 'chuuren'
  | 'riichi'
  | 'double-riichi'
  | 'ippatsu'
  | 'menzen-tsumo'
  | 'haitei'
  | 'houtei'
  | 'rinshan'
  | 'chankan'
  | 'tenhou'
  | 'chiihou'
  | 'renhou'

export type YakuCategory = 'sequencias' | 'terminais-honras' | 'trincas-pares' | 'naipes' | 'outros'

export type IdSecaoGlossario =
  | 'naipes'
  | 'honras'
  | 'mao'
  | 'chamadas'
  | 'vitoria'
  | 'dora'
  | 'pontuacao'
  | 'patamares'
  | 'mesa'
  | 'regras'

export interface TextosYaku {
  /** Nome no título do cartão; sem ele, o romaji (pt-BR, en, lt). */
  titulo?: string
  /** Linha embaixo do título (ex.: "Tudo simples"). */
  nome?: string
  descricao: string
  /** Dica em bloco destacado, entre a descrição e o exemplo. */
  dica?: string
  /** Formas do idioma que viram link para o cartão (o romaji já vira). */
  apelidos?: string[]
}

export interface TextosItemGlossario {
  nome: string
  /** Leitura do kanji, entre parênteses depois dele (ex.: 鳴き (naki)). */
  leitura?: string
  /** Apelido ao lado do nome (ex.: Man • Caracteres). */
  apelido?: string
  /** Sem texto próprio, o Ippatsu usa a descrição do yaku. */
  texto?: string
  topicos?: string[]
  /** Formas que viram link nas descrições (sem diferenciar maiúsculas). */
  aliases: string[]
}

export interface TextosSecaoGlossario {
  titulo: string
  intro?: string
  /** Rótulo embaixo de cada grupo do exemplo da seção. */
  rotulosExemplo?: string[]
  /** Aliases que abrem a seção sem destacar nenhum item. */
  aliases?: string[]
  itens: Record<string, TextosItemGlossario>
}

export interface CicloDora {
  titulo: string
  detalhe: string
}

export interface ConteudoGuiaBolso {
  categorias: Record<YakuCategory, string>
  yakus: Record<IdYaku, TextosYaku>
  /** "Dora não é yaku…", na aba de iniciantes, no verbete Dora e no Resultado. */
  notaDora: string
  /** Nota da aba Yakuman: o kazoe não é um yaku, é a soma que chega lá. */
  notaKazoe: string
  iniciante: { titulo: string; subtitulo: string }[]
  ciclosDora: { numeros: CicloDora; ventos: CicloDora; dragoes: CicloDora }
  /** Nome falado das honras (1z…7z), em cima das pedras numeradas. */
  nomesHonras: Record<string, string>
  /** Explicação de cada yakuhai no Resultado; `{{vento}}` e `{{dragao}}` vêm daqui. */
  yakuhai: {
    ventos: Record<'Ton' | 'Nan' | 'Sha' | 'Pei', string>
    dragoes: Record<'Haku' | 'Hatsu' | 'Chun', string>
    tituloRodada: string
    tituloAssento: string
    textoDragao: string
    textoVentoRodada: string
    textoVentoAssento: string
    dicaVentoDuploRodada: string
    dicaVentoDuploAssento: string
  }
  secoes: Record<IdSecaoGlossario, TextosSecaoGlossario>
}
