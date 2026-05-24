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

/**
 * Centraliza as regras de seleção visual e formação de melds.
 * O contrato principal é proteger o limite de quatro cópias por pedra e o limite lógico de 14 slots.
 *
 * Como ler este arquivo:
 * - primeiro são montadas as pedras visíveis na tela;
 * - depois vêm contadores por código/base e por aka dora;
 * - em seguida, as funções públicas respondem se a ação atual aceita uma pedra.
 *
 * Este hook não altera estado. Ele só responde perguntas para manter o fluxo de clique previsível.
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
      ...(mao.doraManual === 0 ? mao.dora : []),
      ...(mao.doraManual === 0 ? mao.uradora : []),
      ...(acaoPendente?.tipo === 'chii' ? acaoPendente.pedras : []),
    ],
    [acaoPendente, mao],
  )

  /** Conta uma pedra por valor base; 0m e 5m competem pelo mesmo limite físico de quatro cópias. */
  const contarCodigo = useCallback(
    (codigo: CodigoPedra) =>
      todasPedras.filter((pedraVisivel) => codigoBase(pedraVisivel) === codigoBase(codigo))
        .length,
    [todasPedras],
  )

  /** Conta a cópia vermelha exata, que tem limite próprio de uma por naipe. */
  const contarAka = useCallback(
    (codigo: CodigoPedra) => todasPedras.filter((pedraVisivel) => pedraVisivel === codigo).length,
    [todasPedras],
  )

  /**
   * Localiza quais pedras da mão fechada serão consumidas por um meld.
   * Tenta primeiro a pedra exata e depois a base, permitindo usar 5 normal no lugar de aka.
   */
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

  /**
   * Simula a mão depois do meld para validar slots e cópias visíveis.
   * Não modifica a mão real; a mutação acontece só em `useAcoesPedras`.
   */
  const podeFormarMeldComMao = useCallback(
    (pedras: CodigoPedra[], slotsMeld = 3) => {
      const indicesRemovidos = indicesPedrasNaMaoPara(pedras)
      const slotsLiquidos = slotsMeld - indicesRemovidos.length
      if (slotsUsados + slotsLiquidos > 14) return false

      const pedrasRestantes = mao.pedras.filter((_pedra, indice) => !indicesRemovidos.includes(indice))
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
    [indicesPedrasNaMaoPara, mao, slotsUsados],
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

  /**
   * Responde se uma pedra deve estar habilitada no teclado para a ação atual.
   * Essa função alimenta diretamente o estado `disabled` dos botões de pedra.
   */
  const podeSelecionarPedra = useCallback(
    (pedra: CodigoPedra): boolean => {
      if (!acaoPendente) return podeAdicionarPedras([pedra])
      switch (acaoPendente.tipo) {
        case 'dora':
        case 'uradora':
        case 'descarte':
          return podeAdicionarPedras([pedra])
        case 'pon':
          return podeFormarMeldComMao(expandirGrupoMesmoValor(pedra, 3))
        case 'kanAberto':
        case 'kanFechado':
          return podeFormarMeldComMao(expandirGrupoMesmoValor(pedra, 4))
        case 'chii': {
          const pedrasChii = [...acaoPendente.pedras, pedra]
          return (
            podeAdicionarAoChii(acaoPendente.pedras, pedra) &&
            (pedrasChii.length < 3 || podeFormarMeldComMao(pedrasChii))
          )
        }
      }
    },
    [acaoPendente, podeAdicionarPedras, podeFormarMeldComMao],
  )

  /**
   * Lista sequências de chii compatíveis com as pedras já clicadas.
   * Só considera naipes numerados; honras nunca entram em chii.
   */
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
        .filter((sequencia) => podeFormarMeldComMao(ordenarPedras([...sequencia])))
    },
    [podeFormarMeldComMao],
  )

  /**
   * Escolhe automaticamente a sequência natural quando o clique não é ambíguo.
   * Retorna `null` para manter a ação pendente e pedir mais um clique.
   */
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
    sequenciasChiiPossiveis,
    escolherSequenciaChii,
  }
}
