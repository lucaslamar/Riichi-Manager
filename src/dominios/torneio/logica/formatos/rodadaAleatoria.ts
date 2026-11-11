/**
 * Rodada sorteada sem olhar para trás: a primeira do Suíço e de Pontos corridos.
 * Os formatos que precisam de mais (Rodízio, cortes) têm o próprio gerador.
 */
import { embaralhar, inteiroAleatorioSeguro, type InteiroAleatorio } from '@/dominios/centerpiece/logica/sorteioClube'
import type { RodadaTorneio } from '../tipos'
import { assentosDoGrupo, type JogadoresPorMesa } from './comum'

export function rodadaAleatoria(
  jogadorIds: readonly string[],
  numero: number,
  agora: string,
  aleatorio: InteiroAleatorio = inteiroAleatorioSeguro,
  porMesa: JogadoresPorMesa = 4,
): RodadaTorneio {
  const ordem = embaralhar(jogadorIds, aleatorio)
  const mesas = Array.from({ length: Math.floor(ordem.length / porMesa) }, (_, indice) => ({
    numero: indice + 1,
    assentos: assentosDoGrupo(ordem.slice(indice * porMesa, indice * porMesa + porMesa)),
  }))
  return { numero, mesas, geradaEm: agora }
}
