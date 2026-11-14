import { ICONE_INDICADOR_DORA } from '../../constantes'
import type { NomeCena } from './cenasAjuda'

/**
 * Conteúdo dos botões "?" das seções da finalização (e do campo de notação da montagem). Aqui ficam só as chaves
 * i18n; os textos vivem em `public/locales` (bloco `sectionHelp`).
 */
export type TopicoAjuda =
  | 'furiten'
  | 'vitoria'
  | 'honbaDoras'
  | 'ventos'
  | 'riichi'
  | 'condicoesEspeciais'
  | 'notacao'
  | 'pecas'

/** Um trecho da explicação; com `subtitulo` quando a seção agrupa assuntos. */
export interface BlocoAjuda {
  subtitulo?: string
  /** Subtítulo de um item dentro do assunto anterior (um nível abaixo). */
  item?: boolean
  /** Ícone Font Awesome ao lado do subtítulo, o mesmo do controle na tela. */
  icone?: string
  paragrafos?: string[]
  /** Bloco de dica em cinza (como o aviso da Dora), com o subtítulo em negrito no começo. */
  dica?: boolean
  /** Pedras de exemplo depois dos parágrafos (sequências do indicador, 5 vermelhos). */
  visual?: 'ciclosDora' | 'akaDora'
  /** Pedras de exemplo em notação (ex.: '123m'), mostradas depois dos parágrafos. */
  exemplo?: string
  /** Cena animada do app (mão + teclado + dedo), no lugar do exemplo parado. */
  cena?: NomeCena
  /** Subtítulo e parágrafos já são o texto (não chaves i18n), como os dos yakus locais. */
  literal?: boolean
  /** Linhas curtas depois dos parágrafos, em letra menor e sem glossário (ex.: valor). Chaves i18n, ou texto com `literal`. */
  apoio?: string[]
  /** Linha separando este bloco do anterior (ex.: a parte dos yakus locais). */
  divisoria?: boolean
}

/** Uma aba da modal, quando o assunto se divide em telas (ex.: Dora | Honba). */
export interface AbaAjuda {
  rotulo: string
  blocos: BlocoAjuda[]
}

export interface ConteudoAjuda {
  titulo: string
  blocos?: BlocoAjuda[]
  /** Em vez de `blocos`: uma tela por assunto, trocadas por abas ou deslize. */
  abas?: AbaAjuda[]
  /** Cor de destaque da modal (bordas, título e subtítulos). */
  tema?: 'doras'
  /**
   * Termos do glossário que esta ajuda já explica: não viram link nos textos
   * dela (os demais termos abrem a definição deslizando de lado).
   */
  termosProprios?: string[]
}

export const TOPICOS_AJUDA: Record<TopicoAjuda, ConteudoAjuda> = {
  furiten: {
    termosProprios: ['furiten'],
    titulo: 'calculator.furiten',
    blocos: [
      { paragrafos: ['sectionHelp.furiten.rule'] },
      { subtitulo: 'sectionHelp.furiten.typesTitle' },
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
        dica: true,
        paragrafos: ['sectionHelp.furiten.register'],
      },
    ],
  },
  vitoria: {
    termosProprios: ['tsumo', 'ron'],
    titulo: 'calculator.victory',
    blocos: [
      {
        subtitulo: 'calculator.tsumo',
        paragrafos: ['sectionHelp.victory.tsumo', 'sectionHelp.victory.menzen'],
      },
      { subtitulo: 'calculator.ron', paragrafos: ['sectionHelp.victory.ron'] },
    ],
  },
  honbaDoras: {
    // "dragão" aqui é a origem da palavra Dora (curiosidade), não a pedra.
    termosProprios: ['dora', 'ura-dora', 'aka-dora', 'honba', 'dragoes'],
    titulo: 'calculator.doraAndHonba',
    tema: 'doras',
    abas: [
      {
        // Literal: o mesmo termo em todos os idiomas.
        rotulo: 'Dora',
        blocos: [
          // "Qual é o Dora?": piada do clube. Os textos de Doras na mão e de
          // Indicadores são os revisados do antigo botão "i" de Doras.
          { subtitulo: 'sectionHelp.dora.title' },
          {
            subtitulo: 'sectionHelp.dora.curiosityTitle',
            item: true,
            paragrafos: ['sectionHelp.dora.curiosity', 'sectionHelp.dora.dragonPrince'],
          },
          {
            subtitulo: 'calculator.manualDora',
            item: true,
            paragrafos: ['sectionHelp.dora.inHand'],
          },
          {
            subtitulo: 'sectionHelp.dora.indicatorsTitle',
            item: true,
            icone: ICONE_INDICADOR_DORA,
            paragrafos: ['sectionHelp.dora.indicators'],
            visual: 'ciclosDora',
          },
          {
            subtitulo: 'sectionHelp.uraDora.term',
            item: true,
            paragrafos: ['sectionHelp.dora.uraDora'],
          },
          {
            subtitulo: 'sectionHelp.dora.akaTitle',
            item: true,
            paragrafos: ['sectionHelp.dora.aka'],
            visual: 'akaDora',
          },
          {
            subtitulo: 'sectionHelp.dora.flamingTitle',
            item: true,
            paragrafos: ['sectionHelp.dora.flaming'],
          },
        ],
      },
      {
        rotulo: 'calculator.honba',
        blocos: [
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
    ],
  },
  ventos: {
    termosProprios: ['ventos'],
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
    termosProprios: ['riichi', 'ippatsu', 'ura-dora'],
    titulo: 'calculator.riichi',
    blocos: [
      { paragrafos: ['sectionHelp.riichi.declaration', 'sectionHelp.riichi.value'] },
      {
        subtitulo: 'calculator.doubleRiichi',
        item: true,
        paragrafos: ['sectionHelp.riichi.doubleRiichi'],
      },
      {
        subtitulo: 'calculator.ippatsu',
        item: true,
        paragrafos: ['sectionHelp.riichi.ippatsu'],
        apoio: ['sectionHelp.value1han'],
      },
      {
        subtitulo: 'sectionHelp.uraDora.term',
        item: true,
        paragrafos: ['sectionHelp.riichi.uraDora'],
      },
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
        apoio: ['sectionHelp.valueYakuman'],
      },
      {
        subtitulo: 'calculator.rinshan',
        item: true,
        paragrafos: ['sectionHelp.specialConditions.rinshan'],
        apoio: ['sectionHelp.value1han'],
      },
      {
        subtitulo: 'calculator.chankan',
        item: true,
        paragrafos: ['sectionHelp.specialConditions.chankan'],
        apoio: ['sectionHelp.value1han'],
      },
      {
        subtitulo: 'calculator.haitei',
        item: true,
        paragrafos: ['sectionHelp.specialConditions.haitei'],
        apoio: ['sectionHelp.value1han'],
      },
      {
        subtitulo: 'calculator.houtei',
        item: true,
        paragrafos: ['sectionHelp.specialConditions.houtei'],
        apoio: ['sectionHelp.value1han'],
      },
    ],
  },
  // Campo de notação da montagem: como escrever a mão, do básico às chamadas.
  // Teclado de pedras da montagem: o que muda em relação a outras calculadoras.
  pecas: {
    termosProprios: ['aka-dora'],
    titulo: 'sectionHelp.tiles.title',
    blocos: [
      { paragrafos: ['sectionHelp.tiles.intro'] },
      {
        subtitulo: 'sectionHelp.tiles.winTitle',
        item: true,
        paragrafos: ['sectionHelp.tiles.win', 'sectionHelp.tiles.waits'],
        cena: 'pecasBatida',
      },
      { subtitulo: 'sectionHelp.notation.callsTitle' },
      {
        subtitulo: 'melds.chii',
        item: true,
        paragrafos: ['sectionHelp.tiles.chi'],
        cena: 'pecasChi',
      },
      {
        subtitulo: 'melds.pon',
        item: true,
        paragrafos: ['sectionHelp.tiles.pon'],
        cena: 'pecasPon',
      },
      {
        subtitulo: 'melds.kanAberto',
        item: true,
        paragrafos: ['sectionHelp.tiles.kan'],
        cena: 'pecasKan',
      },
      {
        subtitulo: 'melds.kanFechado',
        item: true,
        paragrafos: ['sectionHelp.tiles.closedKan'],
        cena: 'pecasKanFechado',
      },
      {
        subtitulo: 'sectionHelp.notation.akaTitle',
        paragrafos: ['sectionHelp.tiles.aka', 'sectionHelp.tiles.akaHan'],
        cena: 'pecasAka',
      },
      {
        subtitulo: 'sectionHelp.tiles.guideTitle',
        icone: 'fa-graduation-cap',
        paragrafos: ['sectionHelp.tiles.guide'],
        cena: 'pecasGuia',
      },
      {
        subtitulo: 'sectionHelp.tiles.finishTitle',
        paragrafos: ['sectionHelp.tiles.finish'],
      },
      {
        subtitulo: 'sectionHelp.notation.tipTitle',
        dica: true,
        paragrafos: ['sectionHelp.tiles.tip'],
      },
    ],
  },
  notacao: {
    termosProprios: ['aka-dora'],
    titulo: 'notation.toggle',
    blocos: [
      { paragrafos: ['sectionHelp.notation.intro'], exemplo: '2388m447p' },
      {
        subtitulo: 'sectionHelp.notation.honorsTitle',
        item: true,
        paragrafos: ['sectionHelp.notation.honors'],
      },
      {
        subtitulo: 'sectionHelp.notation.akaTitle',
        item: true,
        paragrafos: ['sectionHelp.notation.aka'],
        cena: 'mpszAka',
      },
      // Chamadas pelo teclado: o grupo e depois a tecla, com as pedras de exemplo.
      { subtitulo: 'sectionHelp.notation.callsTitle' },
      {
        subtitulo: 'melds.chii',
        item: true,
        paragrafos: ['sectionHelp.notation.chi'],
        cena: 'mpszChi',
      },
      {
        subtitulo: 'melds.pon',
        item: true,
        paragrafos: ['sectionHelp.notation.pon'],
        cena: 'mpszPon',
      },
      {
        subtitulo: 'melds.kanAberto',
        item: true,
        paragrafos: ['sectionHelp.notation.kan'],
        cena: 'mpszKan',
      },
      {
        subtitulo: 'melds.kanFechado',
        item: true,
        paragrafos: ['sectionHelp.notation.closedKan'],
        cena: 'mpszKanFechado',
      },
      {
        subtitulo: 'sectionHelp.notation.displayTitle',
        item: true,
        paragrafos: ['sectionHelp.notation.display'],
      },
      {
        subtitulo: 'sectionHelp.notation.winTitle',
        item: true,
        paragrafos: ['sectionHelp.notation.win'],
      },
      {
        subtitulo: 'sanma.kita',
        item: true,
        paragrafos: ['sanma.notacaoKita'],
      },
      {
        subtitulo: 'sectionHelp.notation.tipTitle',
        dica: true,
        paragrafos: ['sectionHelp.notation.tip'],
      },
    ],
  },
}
