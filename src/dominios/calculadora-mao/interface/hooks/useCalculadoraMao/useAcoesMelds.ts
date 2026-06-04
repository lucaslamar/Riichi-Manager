import { useCallback, useMemo } from 'react'
import {
  ordenarPedras,
  type Acao,
  type CodigoPedra,
  type Mao,
} from '../../../logica/mao'
import { codigoBase, ehPedraNumerada, expandirGrupoMesmoValor, valorPedra } from '../../constantes'
import type { AcoesMeldsCalculadora } from './tipos'

interface ParametrosAcoesMelds {
  mao: Mao
  acaoPendente: Acao | null
  slotsUsados: number
}

const CODIGOS_BASE_MELD: CodigoPedra[] = [
  ...['m', 'p', 's'].flatMap((naipe) =>
    [1, 2, 3, 4, 5, 6, 7, 8, 9].map((numero) => `${numero}${naipe}`),
  ),
  ...[1, 2, 3, 4, 5, 6, 7].map((numero) => `${numero}z`),
]

const criarSequenciaChii = (inicio: number, naipe: string): CodigoPedra[] =>
  [inicio, inicio + 1, inicio + 2].map((numero) => `${numero}${naipe}` as CodigoPedra)

/**
 * Centraliza as regras de selecao visual e formacao de melds.
 * O contrato principal e proteger o limite fisico de quatro copias por pedra.
 */
export function useAcoesMelds({
  mao,
  acaoPendente,
  slotsUsados,
}: ParametrosAcoesMelds): AcoesMeldsCalculadora {
  const todasPedras = useMemo(
    () => [
      ...mao.pedras,
      ...mao.melds.flatMap((meld) => meld.pedras),
      ...mao.descartes,
      ...mao.dora,
      ...mao.uradora,
      ...(acaoPendente?.tipo === 'chii' ? acaoPendente.pedras : []),
    ],
    [acaoPendente, mao],
  )

  const contarCodigo = useCallback(
    (codigo: CodigoPedra) =>
      todasPedras.filter((pedraVisivel) => codigoBase(pedraVisivel) === codigoBase(codigo))
        .length,
    [todasPedras],
  )

  const contarAka = useCallback(
    (codigo: CodigoPedra) => todasPedras.filter((pedraVisivel) => pedraVisivel === codigo).length,
    [todasPedras],
  )

  const contarCodigoNaMao = useCallback(
    (codigo: CodigoPedra) =>
      mao.pedras.filter((pedraMao) => codigoBase(pedraMao) === codigoBase(codigo)).length,
    [mao.pedras],
  )

  const indicesPedrasNaMaoPara = useCallback(
    (pedras: CodigoPedra[]) => {
      const indicesUsados = new Set<number>()
      for (const pedra of pedras) {
        let indice = mao.pedras.findIndex(
          (pedraMao, indicePedra) => !indicesUsados.has(indicePedra) && pedraMao === pedra,
        )
        if (indice < 0) {
          indice = mao.pedras.findIndex(
            (pedraMao, indicePedra) =>
              !indicesUsados.has(indicePedra) && codigoBase(pedraMao) === codigoBase(pedra),
          )
        }
        if (indice >= 0) indicesUsados.add(indice)
      }
      return [...indicesUsados]
    },
    [mao.pedras],
  )

  const podeCriarMeld = useCallback(
    (pedrasMeld: CodigoPedra[], pedrasConsumir: CodigoPedra[] = [], slotsLogicosMeld = 3) => {
      const indicesRemovidos = indicesPedrasNaMaoPara(pedrasConsumir)
      if (indicesRemovidos.length !== pedrasConsumir.length) return false

      const slotsLiquidos = slotsLogicosMeld - indicesRemovidos.length
      if (slotsUsados + slotsLiquidos > 14) return false

      const pedrasRestantes = mao.pedras.filter(
        (_pedra, indice) => !indicesRemovidos.includes(indice),
      )
      const visiveisAposMeld = [
        ...pedrasRestantes,
        ...mao.melds.flatMap((meld) => meld.pedras),
        ...mao.descartes,
        ...mao.dora,
        ...mao.uradora,
      ]

      return pedrasMeld.every((pedra) => {
        const totalBase =
          visiveisAposMeld.filter(
            (pedraVisivel) => codigoBase(pedraVisivel) === codigoBase(pedra),
          ).length +
          pedrasMeld.filter(
            (pedraVisivel) => codigoBase(pedraVisivel) === codigoBase(pedra),
          ).length
        const totalAka =
          pedra[0] === '0'
            ? visiveisAposMeld.filter((visivel) => visivel === pedra).length +
              pedrasMeld.filter((visivel) => visivel === pedra).length
            : 0
        return totalBase <= 4 && totalAka <= 1
      })
    },
    [indicesPedrasNaMaoPara, mao, slotsUsados],
  )

  const podeCriarKanFechadoDireto = useCallback(
    (codigo: CodigoPedra) => podeCriarMeld(expandirGrupoMesmoValor(codigo, 4), [], 3),
    [podeCriarMeld],
  )

  const podeCriarKanFechadoDaMao = useCallback(
    (codigo: CodigoPedra) => {
      const quantidade = Math.min(contarCodigoNaMao(codigo), 4)
      if (quantidade < 3) return false
      return podeCriarMeld(
        expandirGrupoMesmoValor(codigo, 4),
        expandirGrupoMesmoValor(codigo, quantidade),
        3,
      )
    },
    [contarCodigoNaMao, podeCriarMeld],
  )

  const podeFormarMeldComMao = useCallback(
    (pedras: CodigoPedra[], slotsMeld = 3) => podeCriarMeld(pedras, pedras, slotsMeld),
    [podeCriarMeld],
  )

  const podeAdicionarPedras = useCallback(
    (pedras: CodigoPedra[]) =>
      pedras.every(
        (pedra) =>
          contarCodigo(pedra) +
            pedras.filter((pedraDoGrupo) => codigoBase(pedraDoGrupo) === codigoBase(pedra))
              .length <=
            4 &&
          (pedra[0] !== '0' ||
            contarAka(pedra) +
              pedras.filter((pedraDoGrupo) => pedraDoGrupo === pedra).length <=
              1),
      ),
    [contarAka, contarCodigo],
  )

  const sequenciasChiiPossiveis = useCallback(
    (pedras: CodigoPedra[]): CodigoPedra[][] => {
      const chamada = pedras[pedras.length - 1]
      if (!chamada || !ehPedraNumerada(chamada)) return []

      const naipe = codigoBase(chamada)[1]
      const numeroChamada = valorPedra(chamada)

      return [numeroChamada - 2, numeroChamada - 1, numeroChamada]
        .filter((inicio) => inicio >= 1 && inicio <= 7)
        .map((inicio) => criarSequenciaChii(inicio, naipe))
        .filter((sequencia) => {
          const pedrasDaMao = sequencia.filter(
            (pedraSequencia) => codigoBase(pedraSequencia) !== codigoBase(chamada),
          )
          const consumo = ordenarPedras(pedrasDaMao)
          return (
            podeCriarMeld(sequencia, sequencia, 3) ||
            (consumo.length === 2 && podeCriarMeld(sequencia, consumo, 3)) ||
            podeCriarMeld(sequencia, [], 3)
          )
        })
    },
    [podeCriarMeld],
  )

  const sequenciasChiiDaMaoPossiveis = useCallback(
    (pedras: CodigoPedra[]): CodigoPedra[][] => {
      const chamada = pedras[pedras.length - 1]
      if (!chamada || !ehPedraNumerada(chamada)) return []

      const naipe = codigoBase(chamada)[1]
      const numeroChamada = valorPedra(chamada)

      return [numeroChamada - 2, numeroChamada - 1, numeroChamada]
        .filter((inicio) => inicio >= 1 && inicio <= 7)
        .map((inicio) => criarSequenciaChii(inicio, naipe))
        .filter((sequencia) => {
          const pedrasDaMao = sequencia.filter(
            (pedraSequencia) => codigoBase(pedraSequencia) !== codigoBase(chamada),
          )
          const consumo = ordenarPedras(pedrasDaMao)
          // Requer que as pedras companheiras existam na mão; não aceita chi direto sem tiles da mão.
          return (
            podeCriarMeld(sequencia, sequencia, 3) ||
            (consumo.length === 2 && podeCriarMeld(sequencia, consumo, 3))
          )
        })
    },
    [podeCriarMeld],
  )

  const sequenciasChiiDisponiveis = useMemo(() => {
    for (const codigo of CODIGOS_BASE_MELD) {
      if (sequenciasChiiPossiveis([codigo]).length > 0) return true
    }
    return false
  }, [sequenciasChiiPossiveis])

  const podeChii = sequenciasChiiDisponiveis
  const podePon = useMemo(
    () =>
      CODIGOS_BASE_MELD.some((codigo) => {
        const pedrasMeld = expandirGrupoMesmoValor(codigo, 3)
        const pedrasMao = expandirGrupoMesmoValor(codigo, 2)
        return (
          podeCriarMeld(pedrasMeld, pedrasMeld, 3) ||
          podeCriarMeld(pedrasMeld, pedrasMao, 3) ||
          podeCriarMeld(pedrasMeld, [], 3)
        )
      }),
    [podeCriarMeld],
  )
  const podeKanAberto = useMemo(
    () =>
      CODIGOS_BASE_MELD.some((codigo) => {
        const pedrasMeld = expandirGrupoMesmoValor(codigo, 4)
        const pedrasMao = expandirGrupoMesmoValor(codigo, 3)
        return (
          podeCriarMeld(pedrasMeld, pedrasMeld, 3) ||
          podeCriarMeld(pedrasMeld, pedrasMao, 3) ||
          podeCriarMeld(pedrasMeld, [], 3)
        )
      }),
    [podeCriarMeld],
  )
  const podeKanFechado = useMemo(
    () =>
      CODIGOS_BASE_MELD.some(
        (codigo) => podeCriarKanFechadoDaMao(codigo) || podeCriarKanFechadoDireto(codigo),
      ),
    [podeCriarKanFechadoDaMao, podeCriarKanFechadoDireto],
  )

  const podeSelecionarPedra = useCallback(
    (pedra: CodigoPedra): boolean => {
      if (!acaoPendente) return podeAdicionarPedras([pedra])
      switch (acaoPendente.tipo) {
        case 'dora':
          return mao.dora.length < 10 && podeAdicionarPedras([pedra])
        case 'uradora':
          return !!mao.riichi && mao.uradora.length < 5 && podeAdicionarPedras([pedra])
        case 'descarte':
          return podeAdicionarPedras([pedra])
        case 'pon':
          return (
            podeCriarMeld(expandirGrupoMesmoValor(pedra, 3), expandirGrupoMesmoValor(pedra, 3), 3) ||
            podeCriarMeld(expandirGrupoMesmoValor(pedra, 3), expandirGrupoMesmoValor(pedra, 2), 3) ||
            podeCriarMeld(expandirGrupoMesmoValor(pedra, 3), [], 3)
          )
        case 'kanAberto':
          return (
            podeCriarMeld(expandirGrupoMesmoValor(pedra, 4), expandirGrupoMesmoValor(pedra, 4), 3) ||
            podeCriarMeld(expandirGrupoMesmoValor(pedra, 4), expandirGrupoMesmoValor(pedra, 3), 3) ||
            podeCriarMeld(expandirGrupoMesmoValor(pedra, 4), [], 3)
          )
        case 'kanFechado':
          return podeCriarKanFechadoDaMao(pedra) || podeCriarKanFechadoDireto(pedra)
        case 'chii':
          return sequenciasChiiPossiveis([pedra]).length > 0
      }
    },
    [
      acaoPendente,
      mao.dora.length,
      mao.riichi,
      mao.uradora.length,
      podeCriarKanFechadoDaMao,
      podeCriarKanFechadoDireto,
      podeAdicionarPedras,
      podeCriarMeld,
      sequenciasChiiPossiveis,
    ],
  )

  return {
    contarCodigo,
    contarAka,
    indicesPedrasNaMaoPara,
    podeCriarMeld,
    podeFormarMeldComMao,
    podeAdicionarPedras,
    podeSelecionarPedra,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    sequenciasChiiPossiveis,
    sequenciasChiiDaMaoPossiveis,
  }
}
