/**
 * Rodízio: a grade inteira sai no início pelo algoritmo do Torneio antigo
 * (sorteio.ts e qualidade.ts, sem mudar o cálculo). Aqui só se converte a grade
 * para as rodadas do torneio, com os assentos na ordem 東 南 西 北.
 */
import type { AssentosMesa, RodadaTorneio } from '../../tipos'
import { VENTOS } from './constantes'
import { avaliarGrade } from './qualidade'
import { gerarGrade } from './sorteio'
import type { RelatorioQualidade, Rodada } from './tipos'

export function rodadasDaGrade(grade: readonly Rodada[], agora: string, fase?: number): RodadaTorneio[] {
  return grade.map((rodada, indice) => ({
    numero: indice + 1,
    geradaEm: agora,
    ...(fase === undefined ? {} : { fase }),
    mesas: rodada.mesas.map((mesa, indiceMesa) => ({
      numero: indiceMesa + 1,
      assentos: VENTOS.map(
        (vento) => mesa.assentos.find((assento) => assento.vento === vento)?.jogador ?? '',
      ) as AssentosMesa,
    })),
  }))
}

export function gradeDasRodadas(rodadas: readonly RodadaTorneio[]): Rodada[] {
  return rodadas.map((rodada) => ({
    id: rodada.numero,
    mesas: rodada.mesas.map((mesa) => ({
      id: mesa.numero,
      assentos: mesa.assentos.map((jogador, indice) => ({ vento: VENTOS[indice], jogador })),
    })),
  }))
}

export function gerarRodizio(
  jogadorIds: readonly string[],
  totalRodadas: number,
  agora: string,
): { rodadas: RodadaTorneio[]; qualidade: RelatorioQualidade } {
  const candidato = gerarGrade([...jogadorIds], totalRodadas)
  return { rodadas: rodadasDaGrade(candidato.rodadas, agora), qualidade: candidato.qualidade }
}

/** Diagnóstico da grade de qualquer conjunto de rodadas. */
export function qualidadeDasRodadas(rodadas: readonly RodadaTorneio[], totalJogadores: number) {
  return avaliarGrade(gradeDasRodadas(rodadas), totalJogadores)
}
