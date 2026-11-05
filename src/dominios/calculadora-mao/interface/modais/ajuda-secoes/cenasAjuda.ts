import type { CodigoPedra } from '../../../logica/mao'
import { parseMpsz } from '../../../logica/yakus'

/**
 * Cenas animadas das ajudas da montagem: a mão e um pedaço do teclado, com o
 * dedo tocando onde o jogador tocaria. Cada quadro é um passo. Uma cena pode
 * ter casos (ex.: pedra nova ou com as da mão), tocados um depois do outro.
 * Feitas com as pedras do app (não são GIFs), então seguem o tema e o idioma.
 */
export type NomeCena =
  | 'pecasBatida'
  | 'pecasChi'
  | 'pecasPon'
  | 'pecasKan'
  | 'pecasKanFechado'
  | 'pecasAka'
  | 'pecasGuia'
  | 'mpszChi'
  | 'mpszPon'
  | 'mpszKan'
  | 'mpszKanFechado'
  | 'mpszAka'

export type ChamadaCena = 'chii' | 'pon' | 'kanAberto' | 'kanFechado'

/** Pedra da mão, ou número digitado no MPSZ ainda sem naipe ('#1'). */
export type ItemMaoCena = CodigoPedra

/** O que a legenda nomeia: uma pedra, um rótulo do app (chave i18n) ou um texto fixo. */
export type NomeLegenda = { pedra: CodigoPedra } | { chave: string } | { texto: string }

export type ChaveLegenda =
  | 'tap'
  | 'tapHand'
  | 'hold'
  | 'winLast'
  | 'pickWin'
  | 'choose'
  | 'fourthAka'
  | 'tapCap'
  | 'pickTab'
  | 'guideCard'
  | 'done'

export interface QuadroCena {
  mao?: ItemMaoCena[]
  /** Índice da pedra com o selo de batida. */
  batida?: number
  /** Pedras da mão que estão indo para a chamada (destacadas antes de sumir). */
  saindo?: number[]
  meld?: { tipo: ChamadaCena; pedras: CodigoPedra[] }
  /** Chamada marcada, esperando a pedra. */
  ativa?: ChamadaCena
  /** Sequências do "Escolha o Chi". */
  opcoes?: CodigoPedra[][]
  /** Mudar batida ligado: as pedras da mão viram opções. */
  escolhendoBatida?: boolean
  /** Pontinho vermelho no 5 do teclado: o vermelho ainda está livre. */
  pontoAka?: boolean
  /** O 5 do teclado já mostra o vermelho (os três comuns estão na mão). */
  cincoVermelho?: boolean
  /** O dedo segura em vez de tocar. */
  segurando?: boolean
  /** Guia de bolso aberto, na aba indicada. */
  guia?: { aba: 'beginner' | 'yakuman' }
  /**
   * Onde o dedo toca neste quadro: 'chamada:chii', 'pedra:4p', 'tecla:1',
   * 'opcao:1', 'mao:4', 'mudarBatida', 'chapeu' ou 'aba:yakuman'.
   */
  toque?: string
  legenda: { chave: ChaveLegenda; nome?: NomeLegenda }
}

export interface CasoCena {
  /** Nome do caso no seletor (chave i18n); sem ele, a cena tem um caso só. */
  rotulo?: string
  /** O pedaço do teclado que aparece embaixo da mão. */
  painel: 'pedras' | 'numeros' | 'batida' | 'guia'
  /** Fileira de pedras do teclado (painel 'pedras'). */
  pedrasTeclado?: CodigoPedra[]
  quadros: QuadroCena[]
}

export interface Cena {
  casos: CasoCena[]
}

const ROTULO_CHAMADA: Record<ChamadaCena, string> = {
  chii: 'melds.chii',
  pon: 'melds.pon',
  kanAberto: 'melds.kanCompact',
  kanFechado: 'melds.kanClosedCompact',
}

export const rotuloChamadaCena = (chamada: ChamadaCena) => ROTULO_CHAMADA[chamada]

const CASO_NOVA = 'sectionHelp.demo.caseNew'
const CASO_MAO = 'sectionHelp.demo.caseHand'

const p = parseMpsz

const tocarChamada = (chamada: ChamadaCena, mao: ItemMaoCena[]): QuadroCena => ({
  mao,
  ativa: chamada,
  toque: `chamada:${chamada}`,
  legenda: { chave: 'tap', nome: { chave: ROTULO_CHAMADA[chamada] } },
})

/**
 * Teclado de pedras, Pon e Kans. Pedra nova: a chamada e a pedra, e o grupo
 * nasce inteiro. Com as da mão: as iguais que já estavam na mão vão para o grupo.
 */
function cenaGrupoPecas(chamada: Exclude<ChamadaCena, 'chii'>, pedra: CodigoPedra, linha: string): Cena {
  const tamanho = chamada === 'pon' ? 3 : 4
  const grupo = Array(tamanho).fill(pedra) as CodigoPedra[]
  // Kan fechado com as da mão: as quatro já estão nela. Pon e Kan aberto: falta uma.
  const naMao = chamada === 'kanFechado' ? tamanho : tamanho - 1
  const resto = p('789m')
  const maoCheia = [...Array(naMao).fill(pedra), ...resto] as CodigoPedra[]
  const indicesNaMao = Array.from({ length: naMao }, (_, indice) => indice)
  const pedrasTeclado = p(linha)
  return {
    casos: [
      {
        rotulo: CASO_NOVA,
        painel: 'pedras',
        pedrasTeclado,
        quadros: [
          tocarChamada(chamada, resto),
          { mao: resto, ativa: chamada, toque: `pedra:${pedra}`, legenda: { chave: 'tap', nome: { pedra } } },
          { mao: resto, meld: { tipo: chamada, pedras: grupo }, legenda: { chave: 'done' } },
        ],
      },
      {
        rotulo: CASO_MAO,
        painel: 'pedras',
        pedrasTeclado,
        quadros: [
          tocarChamada(chamada, maoCheia),
          {
            mao: maoCheia,
            ativa: chamada,
            saindo: indicesNaMao,
            toque: `pedra:${pedra}`,
            legenda: { chave: 'tap', nome: { pedra } },
          },
          { mao: resto, meld: { tipo: chamada, pedras: grupo }, legenda: { chave: 'done' } },
        ],
      },
    ],
  }
}

/** MPSZ: os números, o naipe e a chamada depois do grupo. */
function quadrosDigitarGrupo(grupo: string, antes: ItemMaoCena[] = []): QuadroCena[] {
  const [, digitos, naipe] = grupo.match(/(\d+)([mpsz])/) ?? []
  const quadros: QuadroCena[] = [...digitos].map((digito, indice) => ({
    mao: [...antes, ...[...digitos.slice(0, indice + 1)].map((d) => `#${d}`)],
    toque: `tecla:${digito}`,
    legenda: { chave: 'tap', nome: { texto: digito } },
  }))
  quadros.push({
    mao: [...antes, ...p(grupo)],
    toque: `tecla:${naipe}`,
    // A tecla mostra a letra maiúscula (M, P, S, Z).
    legenda: { chave: 'tap', nome: { texto: naipe.toUpperCase() } },
  })
  return quadros
}

/**
 * MPSZ. Pedra nova: digita o grupo e toca na chamada. Com as da mão: marca a
 * chamada e toca numa pedra da mão, e as iguais (ou a sequência) vão para o grupo.
 */
function cenaGrupoMpsz(chamada: ChamadaCena, grupo: string, maoAntes: string, tocarNaMao: number): Cena {
  const pedras = p(grupo)
  const mao = p(maoAntes)
  // Pon e Kan aberto pegam uma pedra de fora; Chi (tocado na mão) e Kan fechado usam só as da mão.
  const daMao = chamada === 'pon' || chamada === 'kanAberto' ? pedras.length - 1 : pedras.length
  const resto = mao.slice(daMao)
  const saindo = Array.from({ length: daMao }, (_, indice) => indice)
  return {
    casos: [
      {
        rotulo: CASO_NOVA,
        painel: 'numeros',
        quadros: [
          ...quadrosDigitarGrupo(grupo),
          {
            meld: { tipo: chamada, pedras },
            toque: `chamada:${chamada}`,
            legenda: { chave: 'tap', nome: { chave: ROTULO_CHAMADA[chamada] } },
          },
          { meld: { tipo: chamada, pedras }, legenda: { chave: 'done' } },
        ],
      },
      {
        rotulo: CASO_MAO,
        painel: 'numeros',
        quadros: [
          tocarChamada(chamada, mao),
          {
            mao,
            ativa: chamada,
            saindo,
            toque: `mao:${tocarNaMao}`,
            legenda: { chave: 'tapHand', nome: { pedra: mao[tocarNaMao] } },
          },
          { mao: resto, meld: { tipo: chamada, pedras }, legenda: { chave: 'done' } },
        ],
      },
    ],
  }
}

const MAO_BATIDA = p('123m456p789s11122z')

export const CENAS_AJUDA: Record<NomeCena, Cena> = {
  pecasBatida: {
    casos: [
      {
        painel: 'batida',
        quadros: [
          { mao: MAO_BATIDA, batida: 13, legenda: { chave: 'winLast' } },
          {
            mao: MAO_BATIDA,
            batida: 13,
            toque: 'mudarBatida',
            legenda: { chave: 'tap', nome: { chave: 'calculator.changeWinningTileShort' } },
          },
          {
            mao: MAO_BATIDA,
            batida: 13,
            escolhendoBatida: true,
            toque: 'mao:4',
            legenda: { chave: 'pickWin' },
          },
          { mao: MAO_BATIDA, batida: 4, legenda: { chave: 'done' } },
        ],
      },
    ],
  },

  pecasChi: {
    casos: [
      {
        rotulo: CASO_NOVA,
        painel: 'pedras',
        pedrasTeclado: p('123456789p'),
        quadros: [
          tocarChamada('chii', p('789m')),
          {
            mao: p('789m'),
            ativa: 'chii',
            toque: 'pedra:4p',
            legenda: { chave: 'tap', nome: { pedra: '4p' } },
          },
          {
            mao: p('789m'),
            ativa: 'chii',
            opcoes: [p('234p'), p('345p'), p('456p')],
            toque: 'opcao:1',
            legenda: { chave: 'choose' },
          },
          { mao: p('789m'), meld: { tipo: 'chii', pedras: p('345p') }, legenda: { chave: 'done' } },
        ],
      },
      {
        // Chi marcado e toque numa pedra da mão: a sequência sai da própria mão.
        rotulo: CASO_MAO,
        painel: 'pedras',
        pedrasTeclado: p('123456789p'),
        quadros: [
          tocarChamada('chii', p('234p789m')),
          {
            mao: p('234p789m'),
            ativa: 'chii',
            saindo: [0, 1, 2],
            toque: 'mao:1',
            legenda: { chave: 'tapHand', nome: { pedra: '3p' } },
          },
          { mao: p('789m'), meld: { tipo: 'chii', pedras: p('234p') }, legenda: { chave: 'done' } },
        ],
      },
    ],
  },

  pecasPon: cenaGrupoPecas('pon', '1p', '123456789p'),
  pecasKan: cenaGrupoPecas('kanAberto', '1s', '123456789s'),
  pecasKanFechado: cenaGrupoPecas('kanFechado', '7z', '1234567z'),

  pecasAka: {
    casos: [
      {
        rotulo: 'sectionHelp.demo.caseHold',
        painel: 'pedras',
        pedrasTeclado: p('123456789m'),
        quadros: [
          { mao: [], pontoAka: true, toque: 'pedra:5m', legenda: { chave: 'tap', nome: { pedra: '5m' } } },
          { mao: p('5m'), pontoAka: true, toque: 'pedra:5m', segurando: true, legenda: { chave: 'hold', nome: { pedra: '5m' } } },
          { mao: p('50m'), legenda: { chave: 'done' } },
        ],
      },
      {
        rotulo: 'sectionHelp.demo.caseFourth',
        painel: 'pedras',
        pedrasTeclado: p('123456789m'),
        quadros: [
          { mao: p('555m'), cincoVermelho: true, legenda: { chave: 'fourthAka' } },
          { mao: p('555m'), cincoVermelho: true, toque: 'pedra:5m', legenda: { chave: 'tap', nome: { pedra: '0m' } } },
          { mao: p('5550m'), legenda: { chave: 'done' } },
        ],
      },
    ],
  },

  pecasGuia: {
    casos: [
      {
        painel: 'guia',
        quadros: [
          { toque: 'chapeu', legenda: { chave: 'tapCap' } },
          { guia: { aba: 'beginner' }, toque: 'aba:yakuman', legenda: { chave: 'pickTab', nome: { chave: 'pocketGuide.tabs.yakuman' } } },
          { guia: { aba: 'yakuman' }, legenda: { chave: 'guideCard' } },
        ],
      },
    ],
  },

  mpszChi: cenaGrupoMpsz('chii', '234p', '234p789m', 1),
  mpszPon: cenaGrupoMpsz('pon', '111p', '11p789m', 0),
  mpszKan: cenaGrupoMpsz('kanAberto', '1111s', '111s789m', 0),
  mpszKanFechado: cenaGrupoMpsz('kanFechado', '7777z', '7777z789m', 0),

  mpszAka: {
    casos: [
      {
        painel: 'numeros',
        quadros: [...quadrosDigitarGrupo('0m'), { mao: p('0m'), legenda: { chave: 'done' } }],
      },
    ],
  },
}
