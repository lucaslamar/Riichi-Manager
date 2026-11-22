/**
 * O livro do modo Chinês (MCR), no formato do Aprender a jogar: ensina do zero,
 * como se fosse o único mahjong. Só a Parte 6, opcional, compara com o Riichi.
 *
 * Fonte: Guia do Mahjong Chinês (MCR) do Cerrado Mahjong Club. O que não está
 * nele está listado em `.ai/REFERENCIAS-MCR.md`, para confirmação.
 */
import { conteudoPtBR } from '../pt-BR'
import type { ConteudoTutorial } from '../tipos'
import type { Traduzir } from './auxiliares'
import { parteConhecendo, partePreparando } from './conhecendo'
import { parteDosFan } from './fans'
import { GLOSSARIO_MCR } from './glossario'
import { parteJogando, partePontuacao } from './jogando'
import { parteParaQuemVemDoRiichi } from './paraQuemVemDoRiichi'

export function criarConteudoMcr(t: Traduzir): ConteudoTutorial {
  return {
    // Um por parte obrigatória e, com as cinco completas, o último.
    ranks: [
      t('tutorial.mcr.ranks.r1'),
      t('tutorial.mcr.ranks.r2'),
      t('tutorial.mcr.ranks.r3'),
      t('tutorial.mcr.ranks.r4'),
      t('tutorial.mcr.ranks.r5'),
      t('tutorial.mcr.ranks.r6'),
    ],
    ilustracoes: conteudoPtBR.ilustracoes,
    dicaRank: t('tutorial.mcr.dicaRank'),
    textoConclusao: t('tutorial.mcr.conclusao'),
    glossary: GLOSSARIO_MCR,
    tutorialParts: [
      parteConhecendo(t),
      partePreparando(t),
      parteJogando(t),
      partePontuacao(t),
      parteDosFan(t),
      parteParaQuemVemDoRiichi(t),
    ],
  }
}
