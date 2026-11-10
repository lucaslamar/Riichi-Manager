/**
 * De onde a partida veio: torneio, encontro do clube ou partida avulsa (Nova
 * partida ou Registrar partida finalizada). Usado nos filtros do Em andamento e
 * do Histórico.
 */
import { normalizarTexto } from '@/dominios/jogadores/logica/jogadores'
import { CADEIRAS, type Partida } from './partida'

export type TipoMesa = 'avulsa' | 'clube' | 'torneio'
export type FiltroTipoMesa = 'todas' | TipoMesa

export function tipoDaMesa(partida: Pick<Partida, 'vinculoTorneio' | 'encontro'>): TipoMesa {
  if (partida.vinculoTorneio) return 'torneio'
  if (partida.encontro) return 'clube'
  return 'avulsa'
}

/**
 * Histórico filtrado pelo tipo e por uma busca no nome dos jogadores (ou do
 * torneio). `nomeDe` dá o nome de quem está em cada assento.
 */
export function filtrarHistorico(
  partidas: readonly Partida[],
  filtro: { tipo: FiltroTipoMesa; busca: string },
  nomes: (partida: Partida) => string[],
): Partida[] {
  const busca = normalizarTexto(filtro.busca)
  return partidas.filter(
    (partida) =>
      (filtro.tipo === 'todas' || tipoDaMesa(partida) === filtro.tipo) &&
      (!busca || nomes(partida).some((nome) => normalizarTexto(nome).includes(busca))),
  )
}

/** Ids dos jogadores da partida, na ordem das cadeiras. */
export function jogadoresDaPartida(partida: Pick<Partida, 'assentos'>) {
  return CADEIRAS.map((cadeira) => partida.assentos[cadeira].jogadorId)
}
