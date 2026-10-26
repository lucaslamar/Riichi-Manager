/**
 * Formato do conteúdo do guia Aprender a jogar. Só dados, sem JSX: o mesmo
 * conteúdo serve à versão web e a uma futura versão nativa. Um arquivo por
 * idioma (pt-BR.ts, en-US.ts…), com os mesmos ids.
 *
 * Nos textos (`md`): `**negrito**`, `==palavra-chave==` (em vermelho, para o
 * que não pode passar batido), `[texto](url)` e uma linha começando com
 * "- " vira item de lista. Os termos do glossário viram link sozinhos.
 */

/** Ferramenta do app que o guia abre (Sorteador e Han e Fu por cima do guia). */
export type FerramentaGuia = 'sorteador' | 'calculadora' | 'hanFu'

/** Ilustrações em preto e branco do guia (desenhadas no app, sem imagens de fora). */
export type IlustracaoGuia =
  | 'mesaVentos'
  | 'muroFileira'
  | 'muroQuadrado'
  | 'mesaDados'
  | 'mesaAbertura'
  | 'muroMorto'
  | 'muroMortoKan'
  | 'muroMortoCurto'
  | 'mesaCompra'
  | 'mesaDescartes'

/** Cartão que abre ao tocar (ex.: um yaku para iniciantes). */
export interface CartaoGuia {
  id: string
  title: string
  /** Selo ao lado do título (ex.: "1 han · fechada"). */
  badge?: string
  blocks: TutorialBlock[]
}

/** Um passo numerado; com `image`, a ilustração vem logo abaixo do texto. */
export type PassoGuia = string | { md: string; image?: IlustracaoGuia; alt?: string }

/**
 * Uma chamada aberta na mesa (pon, chi, kan), com a pedra pegada de lado na
 * posição de quem descartou: 0 = da esquerda, 1 = da frente, última = da direita.
 */
export interface ChamadaGuia {
  mpsz: string
  /** Índice da pedra de lado (a que veio do descarte). */
  deLado?: number
  /** Índices das pedras viradas para baixo (kan fechado). */
  viradas?: number[]
  /** Kan adicionado: a 4ª pedra fica deitada em cima da pedra de lado. */
  empilhada?: boolean
  caption: string
}

/** Opção de resposta do quiz: texto, pedras ou os dois. */
export interface OpcaoQuiz {
  label?: string
  mpsz?: string
  correct?: boolean
}

export type TutorialBlock =
  | { type: 'text'; md: string }
  /** Subtítulo dentro da página (um subtópico). */
  | { type: 'heading'; text: string }
  /** Cartões que abrem ao tocar, um embaixo do outro. */
  | { type: 'cards'; items: CartaoGuia[] }
  /**
   * Pedras em mpsz (ex.: '123m 456p 789s 555z 22s'). `after` mostra, depois
   * de uma seta com `afterLabel`, outras pedras (as esperas, a dora…).
   */
  | {
      type: 'hand'
      mpsz: string
      caption?: string
      after?: string
      afterLabel?: string
      /** Número (naipes) ou nome japonês (honras) em cima de cada pedra, como no Guia de bolso. */
      numbered?: boolean
      /** Rótulo embaixo de cada grupo (Sequência, Trinca, Par, Espera…), como na Formação da mão do Guia de bolso. */
      labels?: string[]
    }
  /** Chamadas abertas lado a lado, cada uma com a sua legenda. */
  | { type: 'melds'; items: ChamadaGuia[] }
  | { type: 'image'; image: IlustracaoGuia; alt: string; caption?: string }
  /** As sequências do indicador de dora (números, ventos e dragões), com setas. */
  | { type: 'doraCycles' }
  /** Passos numerados grandes (montagem da mesa). */
  | { type: 'steps'; items: PassoGuia[] }
  /**
   * `compact`: as duas primeiras colunas viram uma (nome em cima, frase
   * embaixo) e as de número ficam estreitas, para caber em 360px. `links`:
   * termo do glossário de cada linha (ex.: 'yaku:pinfu'); tocar na linha abre
   * o cartão dele, com o exemplo.
   */
  | {
      type: 'table'
      headers: string[]
      rows: string[][]
      compact?: boolean
      links?: string[]
    }
  /** Com `options`, a pessoa escolhe antes de ver a resposta. */
  | { type: 'quiz'; question: string; answer: string; hand?: string; options?: OpcaoQuiz[] }
  | { type: 'appLink'; tool: FerramentaGuia; label: string }
  /** Abre o tutorial "Como contar Han e Fu" por cima do guia. */
  | { type: 'hanFuTutorial' }
  /** Os palitos de pontos desenhados, com o valor e quantos cada jogador recebe. */
  | { type: 'sticks' }
  /** Dica em cinza, como as das ajudas "?" (ex.: onde achar o assunto no app). */
  | { type: 'tip'; md: string }

export interface TutorialPage {
  id: string
  /** Número da página no livro (ex.: '2.3'). */
  number: string
  title: string
  blocks: TutorialBlock[]
  /** Termos do glossário que a página explica: não viram link nela. */
  termos?: string[]
}

export interface TutorialModule {
  id: string
  number: number
  title: string
  /** Frase da capa do módulo. */
  cover: string
  pages: TutorialPage[]
  /** Perguntas do quiz do módulo, uma embaixo da outra. */
  quiz?: Extract<TutorialBlock, { type: 'quiz' }>[]
}

/**
 * Uma parte do livro (ex.: Primeiras partidas, Para ir além), com a sua capa
 * antes do primeiro módulo. `milestone` é um marco do que a pessoa já
 * consegue fazer (ex.: "Você já pode jogar!"), numa tela só dele antes da capa.
 */
export interface TutorialPart {
  id: string
  number: number
  title: string
  /** Frase da capa da parte. */
  cover: string
  milestone?: { title: string; md: string }
  modules: TutorialModule[]
}

export interface TermoGlossarioGuia {
  term: string
  definition: string
}

export interface ConteudoTutorial {
  /** O livro, em partes; cada parte com os seus módulos, numerados em sequência. */
  tutorialParts: TutorialPart[]
  glossary: TermoGlossarioGuia[]
}
