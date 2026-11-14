/**
 * Encontro do clube: cada sorteio vira um encontro com data e hora, e as mesas que
 * saem dele ficam agrupadas em "Em andamento", como um torneio rápido de uma rodada.
 */
import type { EntradaLista } from './listaClube'
import type { Partida } from './partida'
import type { MesaSorteada } from './sorteioClube'

export interface EncontroClube {
  id: string
  criadoEm: string
  /** A lista usada no sorteio: "Novo sorteio" repete com ela. */
  jogadores: EntradaLista[]
}

export interface MesaDoSorteio extends MesaSorteada<EntradaLista> {
  /** Partida registrada a partir desta mesa. */
  partidaId?: string
  /** A mesa foi abortada: não terá resultado e não conta como pendente. */
  abortada?: boolean
}

/** Último sorteio, guardado até ser refeito ou a lista ser limpa. */
export interface SorteioClube {
  encontro: EncontroClube
  mesas: MesaDoSorteio[]
}

export type GrupoAbertas =
  | { tipo: 'encontro'; encontroId: string; partidas: Partida[] }
  | { tipo: 'avulsa'; partida: Partida }

/**
 * Mesas abertas na ordem em que foram criadas, com as de um mesmo encontro juntas
 * (na posição da primeira) e ordenadas pelo número da mesa no sorteio.
 */
export function agruparAbertas(abertas: readonly Partida[]): GrupoAbertas[] {
  const grupos: GrupoAbertas[] = []
  const porEncontro = new Map<string, Partida[]>()
  for (const partida of abertas) {
    const encontroId = partida.encontro?.id
    if (!encontroId) {
      grupos.push({ tipo: 'avulsa', partida })
      continue
    }
    const lista = porEncontro.get(encontroId)
    if (lista) {
      lista.push(partida)
      continue
    }
    const nova = [partida]
    porEncontro.set(encontroId, nova)
    grupos.push({ tipo: 'encontro', encontroId, partidas: nova })
  }
  for (const lista of porEncontro.values()) {
    lista.sort((uma, outra) => (uma.encontro?.mesa ?? 0) - (outra.encontro?.mesa ?? 0))
  }
  return grupos
}

/** Marca a mesa do sorteio como registrada, sem perder as outras. */
export function marcarMesaRegistrada(
  sorteio: SorteioClube,
  numero: number,
  partidaId: string,
): SorteioClube {
  return {
    ...sorteio,
    mesas: sorteio.mesas.map((mesa) => (mesa.numero === numero ? { ...mesa, partidaId } : mesa)),
  }
}

/** Quantas mesas do sorteio já têm resultado (a partida existe no histórico). */
export function mesasRegistradas(
  sorteio: SorteioClube,
  partidas: readonly Pick<Partida, 'id'>[],
): number {
  const ids = new Set(partidas.map((partida) => partida.id))
  return sorteio.mesas.filter((mesa) => !mesa.abortada && mesa.partidaId && ids.has(mesa.partidaId))
    .length
}

/** Aborta a mesa do sorteio: ela sai das pendentes e não registra resultado. */
export function abortarMesa(sorteio: SorteioClube, numero: number): SorteioClube {
  return {
    ...sorteio,
    mesas: sorteio.mesas.map((mesa) =>
      mesa.numero === numero ? { ...mesa, abortada: true } : mesa,
    ),
  }
}

/** Mesas que valem no encontro (as abortadas ficam de fora). */
export function mesasValidas(sorteio: SorteioClube): number {
  return sorteio.mesas.filter((mesa) => !mesa.abortada).length
}

/** Ainda há mesa sem resultado e não abortada? */
export function temMesaPendente(
  sorteio: SorteioClube,
  partidas: readonly Pick<Partida, 'id'>[],
): boolean {
  return mesasRegistradas(sorteio, partidas) < mesasValidas(sorteio)
}
