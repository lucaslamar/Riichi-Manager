/**
 * Conteúdo do tutorial "Como contar Han e Fu", no formato das ajudas "?"
 * (topicosAjuda.ts): aqui ficam só a ordem das páginas e as chaves i18n; os
 * textos vivem em `public/locales` (bloco `hanFuTutorial`).
 *
 * As contas são só texto do tutorial: nada aqui usa a lógica de pontuação.
 */

/**
 * Um trecho de uma página. Textos com `**negrito**` e termos do glossário
 * viram link; fórmulas e contas usam a marcação de `TextoFormula`
 * (`*variável*`, `^{expoente}`) e um TAB entre os lados de cada etapa.
 */
export type BlocoTutorial =
  /** Rótulo de grupo em azul (ex.: "Matemática para idiotas"). */
  | { tipo: 'grupo'; texto: string }
  /** Parágrafo de abertura, em destaque. */
  | { tipo: 'intro'; texto: string }
  /** Subtítulo de item, com divisória em cima. */
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'paragrafo'; texto: string }
  | { tipo: 'topicos'; textos: string[]; numerados?: boolean }
  /** Cada chave é uma linha com as células separadas por `|`; a primeira é o cabeçalho. */
  | { tipo: 'tabela'; linhas: string[] }
  /** Caixa de fórmula (CaixaFormula). */
  | { tipo: 'formula'; texto: string }
  /** Conta passo a passo solta, sem caixa. */
  | { tipo: 'conta'; texto: string; alinhar?: 'conta' | 'equacao' | 'soma' }
  | { tipo: 'dica'; texto: string }
  | { tipo: 'curiosidade'; titulo: string; texto: string }
  /** Ilustração da multiplicação com retas (11 × 64). */
  | { tipo: 'multiplicacaoLinhas' }
  /** Mão de exemplo com as pedras do app (notação mpsz, um grupo por bloco). */
  | { tipo: 'mao'; mpsz: string; rotulos: string[] }
  | { tipo: 'verTabela' }

/** Assunto de uma página de consulta: título no sumário e na página, e o conteúdo. */
export interface SecaoTutorial {
  id: string
  titulo: string
  /** Cada `subtitulo` abre um item que a busca mostra ou esconde inteiro. */
  blocos: BlocoTutorial[]
}

/**
 * Página do tutorial: corrida (`blocos`) ou de consulta (`secoes`), com
 * sumário e busca no topo.
 */
export type PaginaTutorial =
  | { titulo: string; blocos: BlocoTutorial[]; secoes?: undefined }
  | { titulo: string; secoes: SecaoTutorial[]; blocos?: undefined }

const CHAVE = 'hanFuTutorial'

export const PAGINAS_TUTORIAL_HAN_FU: PaginaTutorial[] = [
  {
    titulo: `${CHAVE}.overview.title`,
    blocos: [
      { tipo: 'intro', texto: `${CHAVE}.overview.intro` },
      { tipo: 'subtitulo', texto: `${CHAVE}.overview.orderTitle` },
      {
        tipo: 'topicos',
        numerados: true,
        textos: [
          `${CHAVE}.overview.step1`,
          `${CHAVE}.overview.step2`,
          `${CHAVE}.overview.step3`,
          `${CHAVE}.overview.step4`,
        ],
      },
      // Logo abaixo do passo 4 (consulte a tabela).
      { tipo: 'verTabela' },
    ],
  },
  {
    titulo: `${CHAVE}.han.title`,
    blocos: [
      {
        tipo: 'topicos',
        textos: [
          `${CHAVE}.han.sum`,
          `${CHAVE}.han.dora`,
          `${CHAVE}.han.open`,
          `${CHAVE}.han.reading`,
        ],
      },
    ],
  },
  {
    // Consulta: fu, limites, honba e exemplos numa página só, com sumário e busca.
    titulo: `${CHAVE}.reference.title`,
    secoes: [
      {
        id: 'fu-base',
        titulo: `${CHAVE}.baseFu.title`,
        blocos: [
          { tipo: 'intro', texto: `${CHAVE}.baseFu.futei` },
          {
            tipo: 'topicos',
            textos: [`${CHAVE}.baseFu.ron`, `${CHAVE}.baseFu.tsumo`, `${CHAVE}.baseFu.chiitoitsu`],
          },
        ],
      },
      {
        id: 'combinacoes',
        titulo: `${CHAVE}.sets.title`,
        blocos: [
          { tipo: 'intro', texto: `${CHAVE}.sets.intro` },
          {
            tipo: 'tabela',
            linhas: [
              `${CHAVE}.sets.header`,
              `${CHAVE}.sets.sequence`,
              `${CHAVE}.sets.openTriplet`,
              `${CHAVE}.sets.closedTriplet`,
              `${CHAVE}.sets.openKan`,
              `${CHAVE}.sets.closedKan`,
            ],
          },
          { tipo: 'dica', texto: `${CHAVE}.sets.tip` },
        ],
      },
      {
        id: 'par-espera',
        titulo: `${CHAVE}.pairWait.title`,
        blocos: [
          { tipo: 'subtitulo', texto: `${CHAVE}.pairWait.pairTitle` },
          { tipo: 'paragrafo', texto: `${CHAVE}.pairWait.pair` },
          {
            tipo: 'topicos',
            textos: [
              `${CHAVE}.pairWait.pairDragon`,
              `${CHAVE}.pairWait.pairSeat`,
              `${CHAVE}.pairWait.pairRound`,
              `${CHAVE}.pairWait.pairDouble`,
              `${CHAVE}.pairWait.pairOther`,
            ],
          },
          { tipo: 'subtitulo', texto: `${CHAVE}.pairWait.waitTitle` },
          { tipo: 'paragrafo', texto: `${CHAVE}.pairWait.wait` },
          { tipo: 'subtitulo', texto: `${CHAVE}.pairWait.roundTitle` },
          { tipo: 'topicos', textos: [`${CHAVE}.pairWait.openHand`, `${CHAVE}.pairWait.round`] },
        ],
      },
      {
        id: 'limites',
        titulo: `${CHAVE}.limits.title`,
        blocos: [
          {
            tipo: 'tabela',
            linhas: [
              `${CHAVE}.limits.header`,
              `${CHAVE}.limits.mangan`,
              `${CHAVE}.limits.haneman`,
              `${CHAVE}.limits.baiman`,
              `${CHAVE}.limits.sanbaiman`,
              `${CHAVE}.limits.kazoe`,
              `${CHAVE}.limits.yakuman`,
            ],
          },
          { tipo: 'dica', texto: `${CHAVE}.limits.kiriage` },
        ],
      },
      {
        id: 'honba',
        titulo: `${CHAVE}.honba.title`,
        blocos: [{ tipo: 'paragrafo', texto: `${CHAVE}.honba.text` }],
      },
      {
        id: 'exemplos',
        titulo: `${CHAVE}.examples.title`,
        blocos: [
          { tipo: 'subtitulo', texto: `${CHAVE}.examples.aTitle` },
          { tipo: 'paragrafo', texto: `${CHAVE}.examples.aSituation` },
          {
            tipo: 'mao',
            // Três sequências, trinca fechada de Sul (Nan) e par de Branco (Haku).
            mpsz: '234m567p345s222z55z',
            rotulos: [
              `${CHAVE}.examples.sequence`,
              `${CHAVE}.examples.sequence`,
              `${CHAVE}.examples.sequence`,
              `${CHAVE}.examples.closedTriplet`,
              `${CHAVE}.examples.pair`,
            ],
          },
          { tipo: 'paragrafo', texto: `${CHAVE}.examples.aHan` },
          { tipo: 'conta', texto: `${CHAVE}.examples.aFu`, alinhar: 'soma' },
          { tipo: 'paragrafo', texto: `${CHAVE}.examples.aResult` },
          { tipo: 'subtitulo', texto: `${CHAVE}.examples.bTitle` },
          { tipo: 'paragrafo', texto: `${CHAVE}.examples.bHan` },
          { tipo: 'conta', texto: `${CHAVE}.examples.bFu`, alinhar: 'soma' },
          { tipo: 'paragrafo', texto: `${CHAVE}.examples.bResult` },
        ],
      },
    ],
  },
  {
    titulo: `${CHAVE}.points.title`,
    blocos: [
      // Bloco 1: fórmula pura.
      { tipo: 'intro', texto: `${CHAVE}.points.intro` },
      { tipo: 'formula', texto: `${CHAVE}.points.formula` },
      {
        tipo: 'topicos',
        textos: [
          `${CHAVE}.points.ron`,
          `${CHAVE}.points.tsumo`,
          `${CHAVE}.points.round`,
          `${CHAVE}.points.cap`,
        ],
      },
      // Bloco 2: exemplo do cálculo.
      { tipo: 'subtitulo', texto: `${CHAVE}.points.exampleTitle` },
      { tipo: 'conta', texto: `${CHAVE}.points.exampleSteps`, alinhar: 'equacao' },
      { tipo: 'paragrafo', texto: `${CHAVE}.points.exampleCap` },
      { tipo: 'formula', texto: `${CHAVE}.points.exampleResult` },
      // Bloco 3: atalhos de conta.
      { tipo: 'grupo', texto: `${CHAVE}.points.mathTitle` },
      { tipo: 'intro', texto: `${CHAVE}.points.mathIntro` },
      { tipo: 'subtitulo', texto: `${CHAVE}.points.doubleTitle` },
      { tipo: 'paragrafo', texto: `${CHAVE}.points.double` },
      { tipo: 'conta', texto: `${CHAVE}.points.doubleSteps` },
      { tipo: 'subtitulo', texto: `${CHAVE}.points.splitTitle` },
      { tipo: 'paragrafo', texto: `${CHAVE}.points.split` },
      { tipo: 'conta', texto: `${CHAVE}.points.splitSteps` },
      { tipo: 'subtitulo', texto: `${CHAVE}.points.elevenTitle` },
      { tipo: 'paragrafo', texto: `${CHAVE}.points.eleven` },
      { tipo: 'conta', texto: `${CHAVE}.points.elevenSteps` },
      { tipo: 'subtitulo', texto: `${CHAVE}.points.linesTitle` },
      { tipo: 'paragrafo', texto: `${CHAVE}.points.lines` },
      { tipo: 'multiplicacaoLinhas' },
      { tipo: 'conta', texto: `${CHAVE}.points.linesSteps` },
      { tipo: 'subtitulo', texto: `${CHAVE}.points.paymentTitle` },
      { tipo: 'paragrafo', texto: `${CHAVE}.points.payment` },
      { tipo: 'conta', texto: `${CHAVE}.points.paymentSteps`, alinhar: 'equacao' },
      { tipo: 'formula', texto: `${CHAVE}.points.finalTip` },
      {
        tipo: 'curiosidade',
        titulo: `${CHAVE}.points.curiosityTitle`,
        texto: `${CHAVE}.points.curiosity`,
      },
      { tipo: 'verTabela' },
    ],
  },
]

/**
 * Termos que não viram link para o glossário: os que o próprio tutorial
 * explica e "chamada", que na Curiosidade é o verbo (canção chamada kuku).
 */
export const TERMOS_PROPRIOS_TUTORIAL = ['han', 'fu', 'chamada']
