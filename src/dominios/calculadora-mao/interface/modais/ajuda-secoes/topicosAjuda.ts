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

/** Um trecho da explicação; com `subtitulo` quando a seção agrupa assuntos. */
export interface BlocoAjuda {
  subtitulo?: string
  /** Subtítulo de um item dentro do assunto anterior (um nível abaixo). */
  item?: boolean
  /** Ícone Font Awesome ao lado do subtítulo, o mesmo do controle na tela. */
  icone?: string
  paragrafos?: string[]
}

export interface ConteudoAjuda {
  titulo: string
  blocos: BlocoAjuda[]
  /** Cor de destaque da modal (bordas, título e subtítulos). */
  tema?: 'doras'
}

export const TOPICOS_AJUDA: Record<TopicoAjuda, ConteudoAjuda> = {
  furiten: {
    titulo: 'calculator.furiten',
    blocos: [
      { paragrafos: ['sectionHelp.furiten.rule'] },
      {
        subtitulo: 'sectionHelp.furiten.discardsTitle',
        item: true,
        paragrafos: ['sectionHelp.furiten.discards'],
      },
      {
        subtitulo: 'sectionHelp.furiten.temporaryTitle',
        item: true,
        paragrafos: ['sectionHelp.furiten.temporary'],
      },
      {
        subtitulo: 'sectionHelp.furiten.riichiTitle',
        item: true,
        paragrafos: ['sectionHelp.furiten.riichi'],
      },
      {
        subtitulo: 'sectionHelp.furiten.registerTitle',
        item: true,
        paragrafos: ['sectionHelp.furiten.register'],
      },
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
    titulo: 'calculator.doraAndHonba',
    tema: 'doras',
    blocos: [
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
      { subtitulo: 'sectionHelp.dora.akaTitle', item: true, paragrafos: ['sectionHelp.dora.aka'] },
      {
        subtitulo: 'sectionHelp.dora.flamingTitle',
        item: true,
        paragrafos: ['sectionHelp.dora.flaming'],
      },
      {
        subtitulo: 'calculator.honba',
        paragrafos: ['sectionHelp.honba.counter', 'sectionHelp.honba.points'],
      },
      {
        subtitulo: 'sectionHelp.honba.basengoTitle',
        item: true,
        paragrafos: ['sectionHelp.honba.basengo'],
      },
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
  // Mesmo padrão de Honba e doras: a modal já mostra o título, então o texto
  // geral vem direto e cada assunto ganha um subtítulo com parágrafo.
  riichi: {
    titulo: 'calculator.riichi',
    blocos: [
      { paragrafos: ['sectionHelp.riichi.declaration', 'sectionHelp.riichi.value'] },
      { subtitulo: 'calculator.doubleRiichi', item: true, paragrafos: ['sectionHelp.riichi.doubleRiichi'] },
      { subtitulo: 'calculator.ippatsu', item: true, paragrafos: ['sectionHelp.riichi.ippatsu'] },
      { subtitulo: 'sectionHelp.uraDora.term', item: true, paragrafos: ['sectionHelp.riichi.uraDora'] },
    ],
  },
  condicoesEspeciais: {
    titulo: 'calculator.specialConditions',
    blocos: [
      { paragrafos: ['sectionHelp.specialConditions.allYaku'] },
      {
        subtitulo: 'sectionHelp.specialConditions.tenhouChiihouTitle',
        item: true,
        paragrafos: ['sectionHelp.specialConditions.tenhouChiihou'],
      },
      { subtitulo: 'calculator.rinshan', item: true, paragrafos: ['sectionHelp.specialConditions.rinshan'] },
      { subtitulo: 'calculator.chankan', item: true, paragrafos: ['sectionHelp.specialConditions.chankan'] },
      { subtitulo: 'calculator.haitei', item: true, paragrafos: ['sectionHelp.specialConditions.haitei'] },
      { subtitulo: 'calculator.houtei', item: true, paragrafos: ['sectionHelp.specialConditions.houtei'] },
    ],
  },
}
