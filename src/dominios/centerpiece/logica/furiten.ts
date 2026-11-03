/**
 * Os 3 tipos de furiten, calculados da linha do tempo da mão e das esperas (que
 * vêm prontas de `calculadora-mao/logica/esperas.ts`).
 */
import type { CodigoPedra } from '@/dominios/calculadora-mao/logica/tipos'
import { descartesDe, pedraBase, type Lance } from './descartes'
import type { Cadeira } from './partida'

export type TipoFuriten = 'riichi' | 'descartes' | 'temporario'

/** Do mais forte para o mais fraco: é o que o aviso mostra primeiro. */
const PRIORIDADE: readonly TipoFuriten[] = ['riichi', 'descartes', 'temporario']

export interface CausaFuriten {
  tipo: TipoFuriten
  pedra: CodigoPedra
  ordem: number
  cadeira: Cadeira
}

export interface EstadoFuriten {
  tipos: TipoFuriten[]
  /** O tipo que dura mais. */
  principal: TipoFuriten | null
  causas: CausaFuriten[]
}

export function calcularFuriten(
  lances: readonly Lance[],
  cadeira: Cadeira,
  esperas: readonly CodigoPedra[],
): EstadoFuriten {
  const espera = new Set(esperas.map(pedraBase))
  const causas: CausaFuriten[] = []
  const causar = (tipo: TipoFuriten, lance: Lance) =>
    causas.push({ tipo, pedra: lance.pedra, ordem: lance.ordem, cadeira: lance.cadeira })

  const proprios = descartesDe(lances, cadeira)
  for (const descarte of proprios) {
    if (espera.has(pedraBase(descarte.pedra))) causar('descartes', descarte)
  }

  const ordemRiichi = proprios.find((descarte) => descarte.riichi)?.ordem
  const ordemUltimo = proprios[proprios.length - 1]?.ordem ?? 0
  // Vale também a pedra chamada por outro e a de kakan: nenhuma virou ron.
  for (const lance of lances) {
    if (lance.cadeira === cadeira || !espera.has(pedraBase(lance.pedra))) continue
    // Em kan fechado não há ron, então passar por ele não é furiten.
    if (lance.tipo === 'kakan' && lance.fechado) continue
    if (ordemRiichi !== undefined && lance.ordem > ordemRiichi) causar('riichi', lance)
    else if (lance.ordem > ordemUltimo) causar('temporario', lance)
  }

  const tipos = PRIORIDADE.filter((tipo) => causas.some((causa) => causa.tipo === tipo))
  return { tipos, principal: tipos[0] ?? null, causas }
}
