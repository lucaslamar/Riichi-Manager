/**
 * Rodada sorteada sem olhar para trás: a primeira do Suíço e de Pontos corridos.
 * Os formatos que precisam de mais (Rodízio, cortes) têm o próprio gerador.
 */
import { embaralhar, inteiroAleatorioSeguro, type InteiroAleatorio } from '@/dominios/centerpiece/logica/sorteioClube'
import type { AssentosMesa, RodadaTorneio } from '../tipos'

export function rodadaAleatoria(
  jogadorIds: readonly string[],
  numero: number,
  agora: string,
  aleatorio: InteiroAleatorio = inteiroAleatorioSeguro,
): RodadaTorneio {
  const ordem = embaralhar(jogadorIds, aleatorio)
  const mesas = Array.from({ length: Math.floor(ordem.length / 4) }, (_, indice) => ({
    numero: indice + 1,
    assentos: ordem.slice(indice * 4, indice * 4 + 4) as AssentosMesa,
  }))
  return { numero, mesas, geradaEm: agora }
}
