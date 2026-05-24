import { useCallback, useMemo } from 'react'
import {
  ordenarPedras,
  type Acao,
  type CodigoPedra,
  type Mao,
} from '../../../logica/mao'
import { codigoBase, expandirGrupoMesmoValor, podeAdicionarAoChii } from '../../constantes'
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

/**
 * Centraliza as regras de selecao visual e formacao de melds.
 * O contrato principal e proteger o limite fisico de quatro copias por pedra.
 */
export function useAcoesMelds({
  mao,
  acaoPendente,
  slotsUsados,
}: ParametrosAcoesMelds): AcoesMeldsCalculadora {
  const montagemDiretaDeMeld = mao.pedras.length === 0
  const todasPedras = useMemo(
    () => [
      ...mao.pedras,
      ...mao.melds.flatMap((meld) => meld.pedras),
      ...mao.descartes,
      ...(mao.doraManual === 0 ? mao.dora : []),
      ...(mao.doraManual === 0 ? mao.uradora : []),
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

  const contarNaMaoPorBase = useCallback(
    (codigo: CodigoPedra) =>
      mao.pedras.filter((pedraMao) => codigoBase(pedraMao) === codigoBase(codigo)).length,
    [mao.pedras],
  )

  const maoTemGrupo = useCallback(
    (pedras: CodigoPedra[]) => {
      const indicesUsados = new Set<number>()

      return pedras.every((pedra) => {
        const indice = mao.pedras.findIndex(
          (pedraMao, indicePedra) =>
            !indicesUsados.has(indicePedra) && codigoBase(pedraMao) === codigoBase(pedra),
        )
        if (indice < 0) return false
        indicesUsados.add(indice)
        return true
      })
    },
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

  const podeFormarMeldComMao = useCallback(
    (pedras: CodigoPedra[], slotsMeld = 3) => {
      const indicesRemovidos = indicesPedrasNaMaoPara(pedras)
      if (!montagemDiretaDeMeld && indicesRemovidos.length !== pedras.length) return false

      const slotsLiquidos = slotsMeld - indicesRemovidos.length
      if (slotsUsados + slotsLiquidos > 14) return false

      const pedrasRestantes = mao.pedras.filter(
        (_pedra, indice) => !indicesRemovidos.includes(indice),
      )
      const visiveisAposMeld = [
        ...pedrasRestantes,
        ...mao.melds.flatMap((meld) => meld.pedras),
        ...mao.descartes,
        ...(mao.doraManual === 0 ? mao.dora : []),
        ...(mao.doraManual === 0 ? mao.uradora : []),
        ...pedras,
      ]

      return pedras.every((pedra) => {
        const totalBase = visiveisAposMeld.filter(
          (pedraVisivel) => codigoBase(pedraVisivel) === codigoBase(pedra),
        ).length
        const totalAka =
          pedra[0] === '0' ? visiveisAposMeld.filter((visivel) => visivel === pedra).length : 0
        return totalBase <= 4 && totalAka <= 1
      })
    },
    [indicesPedrasNaMaoPara, mao, montagemDiretaDeMeld, slotsUsados],
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
      if (pedras.length === 0 || pedras.length > 3) return []

      const bases = pedras.map(codigoBase)
      const naipe = bases[0][1]
      if (!['m', 'p', 's'].includes(naipe) || bases.some((pedraBase) => pedraBase[1] !== naipe)) {
        return []
      }

      const numeros = bases.map((pedraBase) => Number(pedraBase[0]))
      if (new Set(numeros).size !== numeros.length) return []

      return [1, 2, 3, 4, 5, 6, 7]
        .filter((inicio) => numeros.every((numero) => numero >= inicio && numero <= inicio + 2))
        .map((inicio) => [inicio, inicio + 1, inicio + 2].map((numero) => `${numero}${naipe}`))
        .filter(
          (sequencia) =>
            (montagemDiretaDeMeld || maoTemGrupo(sequencia)) &&
            podeFormarMeldComMao(ordenarPedras([...sequencia])),
        )
    },
    [maoTemGrupo, montagemDiretaDeMeld, podeFormarMeldComMao],
  )

  const sequenciasChiiDisponiveis = useMemo(() => {
    const sequencias: CodigoPedra[][] = []

    for (const naipe of ['m', 'p', 's']) {
      for (let inicio = 1; inicio <= 7; inicio++) {
        const sequencia = [inicio, inicio + 1, inicio + 2].map(
          (numero) => `${numero}${naipe}`,
        )
        if (
          (montagemDiretaDeMeld || maoTemGrupo(sequencia)) &&
          podeFormarMeldComMao(ordenarPedras([...sequencia]))
        ) {
          sequencias.push(sequencia)
        }
      }
    }

    return sequencias
  }, [maoTemGrupo, montagemDiretaDeMeld, podeFormarMeldComMao])

  const podeChii = sequenciasChiiDisponiveis.length > 0
  const podePon = useMemo(
    () =>
      CODIGOS_BASE_MELD.some((codigo) => {
        const pedras = expandirGrupoMesmoValor(codigo, 3)
        return (montagemDiretaDeMeld || maoTemGrupo(pedras)) && podeFormarMeldComMao(pedras)
      }),
    [maoTemGrupo, montagemDiretaDeMeld, podeFormarMeldComMao],
  )
  const podeKanAberto = useMemo(
    () =>
      CODIGOS_BASE_MELD.some((codigo) => {
        const pedras = expandirGrupoMesmoValor(codigo, 4)
        return (montagemDiretaDeMeld || maoTemGrupo(pedras)) && podeFormarMeldComMao(pedras)
      }),
    [maoTemGrupo, montagemDiretaDeMeld, podeFormarMeldComMao],
  )
  const podeKanFechado = useMemo(
    () =>
      montagemDiretaDeMeld ||
      mao.pedras.some(
        (pedra) =>
          contarNaMaoPorBase(pedra) >= 4 &&
          podeFormarMeldComMao(expandirGrupoMesmoValor(pedra, 4)),
      ),
    [contarNaMaoPorBase, mao.pedras, montagemDiretaDeMeld, podeFormarMeldComMao],
  )

  const podeSelecionarPedra = useCallback(
    (pedra: CodigoPedra): boolean => {
      if (!acaoPendente) return podeAdicionarPedras([pedra])
      switch (acaoPendente.tipo) {
        case 'dora':
        case 'uradora':
        case 'descarte':
          return podeAdicionarPedras([pedra])
        case 'pon':
          return (
            (montagemDiretaDeMeld || maoTemGrupo(expandirGrupoMesmoValor(pedra, 3))) &&
            podeFormarMeldComMao(expandirGrupoMesmoValor(pedra, 3))
          )
        case 'kanAberto':
          return (
            (montagemDiretaDeMeld || maoTemGrupo(expandirGrupoMesmoValor(pedra, 4))) &&
            podeFormarMeldComMao(expandirGrupoMesmoValor(pedra, 4))
          )
        case 'kanFechado':
          return (
            (montagemDiretaDeMeld || contarNaMaoPorBase(pedra) >= 4) &&
            podeFormarMeldComMao(expandirGrupoMesmoValor(pedra, 4))
          )
        case 'chii': {
          const pedrasChii = [...acaoPendente.pedras, pedra]
          return (
            podeAdicionarAoChii(acaoPendente.pedras, pedra) &&
            sequenciasChiiPossiveis(pedrasChii).length > 0
          )
        }
      }
    },
    [
      acaoPendente,
      contarNaMaoPorBase,
      maoTemGrupo,
      montagemDiretaDeMeld,
      podeAdicionarPedras,
      podeFormarMeldComMao,
      sequenciasChiiPossiveis,
    ],
  )

  const escolherSequenciaChii = useCallback(
    (pedrasSelecionadas: CodigoPedra[], sequencias: CodigoPedra[][]) => {
      if (sequencias.length === 1) return sequencias[0]
      if (pedrasSelecionadas.length < 2) return null

      const primeira = Number(codigoBase(pedrasSelecionadas[0])[0])
      const ultima = Number(codigoBase(pedrasSelecionadas[pedrasSelecionadas.length - 1])[0])
      const naipe = codigoBase(pedrasSelecionadas[0])[1]
      const inicioNatural = ultima > primeira ? primeira : ultima - 2
      const sequenciaNatural = [inicioNatural, inicioNatural + 1, inicioNatural + 2].map(
        (numero) => `${numero}${naipe}`,
      )

      return (
        sequencias.find((sequencia) =>
          sequencia.every((pedraSequencia, indice) => pedraSequencia === sequenciaNatural[indice]),
        ) ?? null
      )
    },
    [],
  )

  return {
    contarCodigo,
    contarAka,
    indicesPedrasNaMaoPara,
    podeFormarMeldComMao,
    podeAdicionarPedras,
    podeSelecionarPedra,
    podeChii,
    podePon,
    podeKanAberto,
    podeKanFechado,
    sequenciasChiiPossiveis,
    escolherSequenciaChii,
  }
}
