import { ICONE_INDICADOR_DORA } from '../../constantes'

/**
 * Conteúdo dos botões "?" das seções da finalização. Aqui ficam só as chaves
 * i18n; os textos vivem em `public/locales` (bloco `sectionHelp`).
 */
export type TopicoAjuda =
  | 'furiten'
  | 'vitoria'
  | 'honbaDoras'
  | 'ventos'
  | 'riichi'
  | 'condicoesEspeciais'

export interface ItemListaAjuda {
  /** Chave do termo em destaque (de preferência o rótulo do botão da seção). */
  termo: string
  texto: string
}

/** Um trecho da explicação; com `subtitulo` quando a seção agrupa assuntos. */
export interface BlocoAjuda {
  subtitulo?: string
  /** Subtítulo de um item dentro do assunto anterior (um nível abaixo). */
  item?: boolean
  /** Ícone Font Awesome ao lado do subtítulo, o mesmo do controle na tela. */
  icone?: string
  paragrafos?: string[]
  lista?: ItemListaAjuda[]
}

export interface ConteudoAjuda {
  titulo: string
  blocos: BlocoAjuda[]
  /** Cor de destaque da modal (bordas, título e subtítulos). */
  tema?: 'doras'
}

const URA_DORA: ItemListaAjuda = {
  termo: 'sectionHelp.uraDora.term',
  texto: 'sectionHelp.uraDora.text',
}

export const TOPICOS_AJUDA: Record<TopicoAjuda, ConteudoAjuda> = {
  furiten: {
    titulo: 'calculator.furiten',
    blocos: [
      {
        paragrafos: ['sectionHelp.furiten.rule'],
        lista: [
          { termo: 'sectionHelp.furiten.discardsTerm', texto: 'sectionHelp.furiten.discards' },
          { termo: 'sectionHelp.furiten.temporaryTerm', texto: 'sectionHelp.furiten.temporary' },
          { termo: 'sectionHelp.furiten.riichiTerm', texto: 'sectionHelp.furiten.riichi' },
        ],
      },
      { paragrafos: ['sectionHelp.furiten.register'] },
    ],
  },
  vitoria: {
    titulo: 'calculator.victory',
    blocos: [
      {
        subtitulo: 'calculator.tsumo',
        paragrafos: ['sectionHelp.victory.tsumo', 'sectionHelp.victory.menzen'],
      },
      { subtitulo: 'calculator.ron', paragrafos: ['sectionHelp.victory.ron'] },
      { subtitulo: 'sectionHelp.victory.yakuTitle', paragrafos: ['sectionHelp.victory.yaku'] },
    ],
  },
  honbaDoras: {
    titulo: 'calculator.honbaAndDora',
    tema: 'doras',
    blocos: [
      {
        subtitulo: 'calculator.honba',
        paragrafos: ['sectionHelp.honba.counter', 'sectionHelp.honba.points'],
      },
      // "Qual é o Dora?": piada do clube. Os textos de Doras na mão e de
      // Indicadores são os revisados do antigo botão "i" de Doras.
      { subtitulo: 'sectionHelp.dora.title' },
      {
        subtitulo: 'sectionHelp.dora.curiosityTitle',
        item: true,
        paragrafos: ['sectionHelp.dora.curiosity', 'sectionHelp.dora.dragonPrince'],
      },
      { subtitulo: 'calculator.manualDora', item: true, paragrafos: ['sectionHelp.dora.inHand'] },
      {
        subtitulo: 'sectionHelp.dora.indicatorsTitle',
        item: true,
        icone: ICONE_INDICADOR_DORA,
        paragrafos: ['sectionHelp.dora.indicators'],
      },
      { subtitulo: 'sectionHelp.uraDora.term', item: true, paragrafos: ['sectionHelp.dora.uraDora'] },
    ],
  },
  ventos: {
    titulo: 'calculator.winds',
    blocos: [
      {
        subtitulo: 'calculator.seatWind',
        paragrafos: ['sectionHelp.seatWind.seat', 'sectionHelp.seatWind.dealer'],
      },
      {
        subtitulo: 'calculator.roundWind',
        paragrafos: ['sectionHelp.roundWind.round', 'sectionHelp.roundWind.double'],
      },
    ],
  },
  riichi: {
    titulo: 'calculator.riichi',
    blocos: [
      {
        paragrafos: ['sectionHelp.riichi.declaration', 'sectionHelp.riichi.value'],
        lista: [
          { termo: 'calculator.doubleRiichi', texto: 'sectionHelp.riichi.doubleRiichi' },
          { termo: 'calculator.ippatsu', texto: 'sectionHelp.riichi.ippatsu' },
          URA_DORA,
        ],
      },
    ],
  },
  condicoesEspeciais: {
    titulo: 'calculator.specialConditions',
    blocos: [
      {
        paragrafos: ['sectionHelp.specialConditions.allYaku'],
        lista: [
          { termo: 'calculator.tenhouChiihou', texto: 'sectionHelp.specialConditions.tenhouChiihou' },
          { termo: 'calculator.rinshan', texto: 'sectionHelp.specialConditions.rinshan' },
          { termo: 'calculator.chankan', texto: 'sectionHelp.specialConditions.chankan' },
          { termo: 'calculator.haitei', texto: 'sectionHelp.specialConditions.haitei' },
          { termo: 'calculator.houtei', texto: 'sectionHelp.specialConditions.houtei' },
        ],
      },
    ],
  },
}
