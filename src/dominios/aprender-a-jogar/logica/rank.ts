import type { TutorialPart } from '../conteudo/tipos'

/**
 * Rank do guia, no estilo dos jogos online de mahjong: cada parte do livro é
 * um rank (Novato, Adepto, Veterano, Especialista, 1º dan) e cada módulo
 * concluído dentro dela vale uma estrela. Completar uma parte sobe de rank; o
 * 1º dan chega com a Parte 5 (Estratégia) e continua com tudo concluído.
 */
export interface RankGuia {
  /**
   * 0 = Novato (Parte 1), 1 = Adepto (Parte 2), 2 = Veterano (Parte 3),
   * 3 = Especialista (Parte 4), 4 = 1º dan (Parte 5); 5 = livro concluído.
   */
  nivel: number
  /** Módulos concluídos na parte do rank atual. */
  estrelas: number
  /** Módulos da parte do rank atual (0 no 1º dan, que não tem estrelas). */
  totalEstrelas: number
  /** Módulos concluídos no livro todo: sobe a cada módulo novo. */
  degrau: number
}

/** Nível do último rank (1º dan), o da Parte 5 em diante. */
const NIVEL_DAN = 4

export function rankPorConcluidos(concluidos: string[], partes: TutorialPart[]): RankGuia {
  const feitos = (parte: TutorialPart) =>
    parte.modules.filter((modulo) => concluidos.includes(modulo.id)).length
  const degrau = partes.reduce((soma, parte) => soma + feitos(parte), 0)
  // O rank é o da primeira parte ainda não completa.
  const nivel = partes.findIndex((parte) => feitos(parte) < parte.modules.length)
  if (nivel < 0) return { nivel: partes.length, estrelas: 0, totalEstrelas: 0, degrau }
  return {
    nivel,
    estrelas: feitos(partes[nivel]),
    totalEstrelas: partes[nivel].modules.length,
    degrau,
  }
}

/** Nome do rank com as estrelas da parte (ex.: "Adepto ★★☆"). */
export function nomeRank(rank: RankGuia, nomes: string[]): string {
  const nome = nomes[Math.min(rank.nivel, NIVEL_DAN)]
  if (!rank.totalEstrelas) return nome
  return `${nome} ${'★'.repeat(rank.estrelas)}${'☆'.repeat(rank.totalEstrelas - rank.estrelas)}`
}

/** Rank de quem acabou de chegar à parte `indice` (o título da capa dela). */
export const rankDaParte = (indice: number, nomes: string[]) => nomes[Math.min(indice, NIVEL_DAN)]

/** O último rank, de quem concluiu o livro todo. */
export const ehDan = (rank: RankGuia) => rank.nivel >= NIVEL_DAN
