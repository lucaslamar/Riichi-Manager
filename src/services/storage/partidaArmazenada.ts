/**
 * Cada partida é guardada em duas partes:
 *
 * - Resumo (para sempre): id, datas, regras (duração, uma, oka), assentos com
 *   vento inicial, status, resultado (pontos finais, colocação, pontuação
 *   ajustada; tobi = pontos abaixo de zero) e os vínculos de torneio e clube.
 *   Ranking, filtros, rivais e gráficos só precisam disto.
 * - Detalhes (mão a mão): placar, eventos, vez e registro de descartes. As
 *   partidas finalizadas mais antigas perdem só esta parte.
 *
 * Puro, sem banco: o mesmo código serve para o Dexie e para o SQLite.
 */
import { criarPartida, type Partida } from '@/dominios/centerpiece/logica/partida'

export type ResumoPartida = Omit<Partida, 'placar' | 'eventos' | 'vez' | 'registro'>
export type DetalhesPartida = Pick<Partida, 'id' | 'placar' | 'eventos' | 'vez' | 'registro'>

export const LIMITE_DETALHES_PADRAO = 100

export function dividirPartida(partida: Partida): { resumo: ResumoPartida; detalhes: DetalhesPartida } {
  const { placar, eventos, vez, registro, ...resumo } = partida
  return { resumo, detalhes: { id: partida.id, placar, eventos, vez, ...(registro ? { registro } : {}) } }
}

/**
 * Junta as partes de volta. Sem detalhes (já podados), monta um placar com os
 * pontos finais do resultado e sem mãos: o histórico mostra o resultado e o
 * ranking não perde nada.
 */
export function montarPartida(resumo: ResumoPartida, detalhes?: DetalhesPartida): Partida {
  if (detalhes) {
    const { placar, eventos, vez, registro } = detalhes
    return { ...resumo, placar, eventos, vez, ...(registro ? { registro } : {}) }
  }
  const ids = [0, 1, 2, 3].map((cadeira) => resumo.assentos[cadeira as 0 | 1 | 2 | 3].jogadorId) as [
    string,
    string,
    string,
    string,
  ]
  const base = criarPartida(resumo.id, resumo.config, ids, resumo.criadaEm)
  const pontos = { ...base.placar.pontos }
  for (const linha of resumo.resultado ?? []) pontos[linha.cadeira] = linha.pontosBrutos
  return { ...resumo, placar: { ...base.placar, pontos }, eventos: [], vez: base.vez }
}

/**
 * Quem perde os detalhes: as finalizadas além das `limite` mais recentes. Mesas
 * em andamento sempre ficam inteiras.
 */
export function idsParaPodar(partidas: readonly Pick<Partida, 'id' | 'status' | 'finalizadaEm'>[], limite: number) {
  return partidas
    .filter((partida) => partida.status === 'finalizada')
    .sort((uma, outra) => (outra.finalizadaEm ?? '').localeCompare(uma.finalizadaEm ?? ''))
    .slice(Math.max(0, limite))
    .map((partida) => partida.id)
}

/** Lê o limite salvo; inválido ou ausente volta ao padrão. */
export function lerLimiteDetalhes(texto: string | null): number {
  const numero = Number(texto)
  return texto !== null && Number.isInteger(numero) && numero >= 0 ? numero : LIMITE_DETALHES_PADRAO
}
