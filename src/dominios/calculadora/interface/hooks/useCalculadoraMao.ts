import { useEffect, useMemo, useState } from 'react'
import { useImmer } from 'use-immer'
import {
  aplicarHonba,
  calcularMao,
  calcularHanFu,
  calcularPatamarHanFu,
  montarPontosRapidos,
  fuValidos,
  ordenarPedras,
  ordenarMelds,
  criarAcao,
  contarPedrasTotais,
  contarSlotsLogicos,
  configuracaoPadrao,
  calcularEsperasPossiveis,
  type Mao,
  type CodigoPedra,
  type Acao,
  type ConfiguracaoCalculo,
  type EsperaPossivel,
} from '../../logica/mao'
import { MAO_VAZIA, codigoBase, expandirGrupoMesmoValor, podeAdicionarAoChii } from '../constantes'

/**
 * Concentra o estado e as ações da página da calculadora de mão.
 *
 * A intenção é manter o JSX da página limpo: componentes cuidam da interface,
 * este hook cuida de como a mão muda quando o usuário clica.
 */
export function useCalculadoraMao() {
  const [mao, atualizarMao] = useImmer<Mao>(MAO_VAZIA)
  const [acaoPendente, setAcaoPendente] = useState<Acao | null>(null)
  const [modo, setModo] = useState<'completo' | 'rapido'>('completo')
  const [configuracao, setConfiguracao] = useState<ConfiguracaoCalculo>(configuracaoPadrao)
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false)
  const [esperasPossiveis, setEsperasPossiveis] = useState<EsperaPossivel[]>([])
  const [calculandoEsperas, setCalculandoEsperas] = useState(false)

  // Estado para a calculadora rápida
  const [han, setHan] = useState(1)
  const [fu, setFu] = useState(30)

  const totalPedras = contarPedrasTotais(mao)
  // Slots lógicos: kans contam como 3 (não 4). Meta = 14 para mão completa.
  const slotsUsados = contarSlotsLogicos(mao)
  const maoCompleta = slotsUsados >= 14

  // Todas as pedras visíveis (para limitar a 4 por código)
  // Inclui dora e uradora pois também consomem cópias do baralho
  const todasPedras = [
    ...mao.pedras,
    ...mao.melds.flatMap((meld) => meld.pedras),
    ...mao.descartes,
    ...(mao.doraManual === 0 ? mao.dora : []),
    ...(mao.doraManual === 0 ? mao.uradora : []),
    ...(acaoPendente?.tipo === 'chii' ? acaoPendente.pedras : []),
  ]
  const contarCodigo = (codigo: CodigoPedra) =>
    todasPedras.filter((pedraVisivel) => codigoBase(pedraVisivel) === codigoBase(codigo)).length
  const contarAka = (codigo: CodigoPedra) =>
    todasPedras.filter((pedraVisivel) => pedraVisivel === codigo).length
  const indicesPedrasNaMaoPara = (pedras: CodigoPedra[]) => {
    const indicesUsados = new Set<number>()
    for (const pedra of pedras) {
      let indice = mao.pedras.findIndex(
        (pedraMao, i) => !indicesUsados.has(i) && pedraMao === pedra,
      )
      if (indice < 0) {
        indice = mao.pedras.findIndex(
          (pedraMao, i) => !indicesUsados.has(i) && codigoBase(pedraMao) === codigoBase(pedra),
        )
      }
      if (indice >= 0) indicesUsados.add(indice)
    }
    return [...indicesUsados]
  }
  const podeFormarMeldComMao = (pedras: CodigoPedra[], slotsMeld = 3) => {
    const indicesRemovidos = indicesPedrasNaMaoPara(pedras)
    const slotsLiquidos = slotsMeld - indicesRemovidos.length
    if (slotsUsados + slotsLiquidos > 14) return false

    const pedrasRestantes = mao.pedras.filter((_pedra, i) => !indicesRemovidos.includes(i))
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
  }
  const podeAdicionarPedras = (pedras: CodigoPedra[]) =>
    pedras.every(
      (pedra) =>
        contarCodigo(pedra) +
          pedras.filter((pedraDoGrupo) => codigoBase(pedraDoGrupo) === codigoBase(pedra)).length <=
          4 &&
        (pedra[0] !== '0' ||
          contarAka(pedra) + pedras.filter((pedraDoGrupo) => pedraDoGrupo === pedra).length <= 1),
    )
  const podeSelecionarPedra = (pedra: CodigoPedra): boolean => {
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
  }

  // Calculadora rápida
  const sequenciasChiiPossiveis = (pedras: CodigoPedra[]): CodigoPedra[][] => {
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
      .filter((sequencia) => podeFormarMeldComMao(sequencia))
  }
  const escolherSequenciaChii = (
    pedrasSelecionadas: CodigoPedra[],
    sequencias: CodigoPedra[][],
  ) => {
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
  }

  const tabelaRapida = calcularHanFu(han, fu, configuracao)
  const resultadoRapido = aplicarHonba(
    montarPontosRapidos(mao.ventoRodada === '1', mao.agari, tabelaRapida),
    mao.honba,
  )
  const patamarRapido = calcularPatamarHanFu(han, fu, configuracao)
  const fuDisponiveis = fuValidos(mao.agari)

  // Resultado completo (calculado ao vivo quando a mão está completa)
  const resultado = maoCompleta
    ? (() => {
        try {
          return calcularMao(mao, configuracao)
        } catch {
          return null
        }
      })()
    : null
  const furitenRonCompleto = useMemo(() => {
    if (!maoCompleta || mao.agari !== 'ron' || mao.descartes.length === 0) return null
    if (mao.indiceAgari < 0 || mao.indiceAgari >= mao.pedras.length) return null

    const maoBase: Mao = {
      ...mao,
      pedras: mao.pedras.filter((_pedra, indice) => indice !== mao.indiceAgari),
      indiceAgari: -1,
    }
    const esperas = calcularEsperasPossiveis(maoBase, configuracao, 13)
    const esperasFuriten = esperas.filter((espera) => !espera.semYaku && espera.furiten)

    return esperasFuriten.length > 0 ? esperasFuriten : null
  }, [mao, maoCompleta, configuracao])

  useEffect(() => {
    setEsperasPossiveis([])
    setCalculandoEsperas(false)
    if (slotsUsados !== 13) return

    setCalculandoEsperas(true)
    const id = window.setTimeout(() => {
      setEsperasPossiveis(calcularEsperasPossiveis(mao, configuracao, slotsUsados))
      setCalculandoEsperas(false)
    }, 0)

    return () => window.clearTimeout(id)
  }, [mao, configuracao, slotsUsados])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const adicionarPedra = (pedra: CodigoPedra) => {
    const manterAcaoMeld = () =>
      setAcaoPendente(slotsUsados <= 11 ? criarAcao(acaoPendente!.tipo) : null)
    const aplicarMeld = (
      tipo: 'chii' | 'pon' | 'kanAberto' | 'kanFechado',
      pedras: CodigoPedra[],
      abrirMao: boolean,
    ) => {
      if (!podeFormarMeldComMao(pedras)) return false
      const indicesRemovidos = indicesPedrasNaMaoPara(pedras)
      atualizarMao((rascunho) => {
        for (const indice of [...indicesRemovidos].sort((a, b) => b - a)) {
          rascunho.pedras.splice(indice, 1)
          if (rascunho.indiceAgari >= indice) rascunho.indiceAgari--
        }
        if (rascunho.indiceAgari >= rascunho.pedras.length) {
          rascunho.indiceAgari = rascunho.pedras.length - 1
        }
        rascunho.melds.push({ tipo, pedras })
        ordenarMelds(rascunho.melds)
        if (abrirMao) rascunho.riichi = null
      })
      return true
    }

    if (!acaoPendente) {
      // Bloqueia se a mão já está completa (14 slots)
      if (maoCompleta) return
      if (!podeAdicionarPedras([pedra])) return
      const esperaClicada =
        slotsUsados === 13
          ? esperasPossiveis.find((espera) => codigoBase(espera.pedra) === codigoBase(pedra))
          : null
      atualizarMao((rascunho) => {
        rascunho.pedras.push(pedra)
        ordenarPedras(rascunho.pedras)
        rascunho.indiceAgari = rascunho.pedras.lastIndexOf(pedra)
        if (esperaClicada?.furiten) rascunho.agari = 'ron'
      })
      return
    }

    switch (acaoPendente.tipo) {
      case 'dora':
        if (mao.doraManual > 0) return
        if (mao.dora.length >= 5) return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.dora.push(pedra)
        })
        if (mao.dora.length + 1 >= 5) setAcaoPendente(null)
        return
      case 'uradora':
        if (mao.doraManual > 0) return
        if (mao.uradora.length >= 5) return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.uradora.push(pedra)
        })
        if (mao.uradora.length + 1 >= 5) setAcaoPendente(null)
        return
      case 'descarte':
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.descartes.push(pedra)
          ordenarPedras(rascunho.descartes)
        })
        return
      case 'pon': {
        const pedras = expandirGrupoMesmoValor(pedra, 3)
        if (!aplicarMeld('pon', pedras, true)) return
        manterAcaoMeld()
        return
      }
      case 'kanAberto': {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!aplicarMeld('kanAberto', pedras, true)) return
        manterAcaoMeld()
        return
      }
      case 'kanFechado': {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!aplicarMeld('kanFechado', pedras, false)) return
        manterAcaoMeld()
        return
      }
      case 'chii': {
        if (!podeAdicionarAoChii(acaoPendente.pedras, pedra)) return
        const novasPedras = [...acaoPendente.pedras, pedra]
        const sequenciasPossiveis = sequenciasChiiPossiveis(novasPedras)
        const sequenciaEscolhida = escolherSequenciaChii(novasPedras, sequenciasPossiveis)
        if (sequenciaEscolhida) {
          if (!aplicarMeld('chii', [...sequenciaEscolhida], true)) return
          setAcaoPendente(slotsUsados <= 11 ? criarAcao('chii') : null)
        } else if (novasPedras.length < 3) {
          setAcaoPendente({ tipo: 'chii', pedras: novasPedras })
        } else {
          const pedrasChii = ordenarPedras([...novasPedras])
          if (!aplicarMeld('chii', [...pedrasChii], true)) return
          setAcaoPendente(slotsUsados <= 11 ? criarAcao('chii') : null)
        }
        return
      }
    }
  }

  const removerPedra = (indicePedra: number) => {
    atualizarMao((rascunho) => {
      rascunho.pedras.splice(indicePedra, 1)
      if (rascunho.indiceAgari >= indicePedra) rascunho.indiceAgari--
    })
    setAcaoPendente(null)
  }

  const removerMeld = (indiceMeld: number) => {
    atualizarMao((rascunho) => {
      rascunho.melds.splice(indiceMeld, 1)
    })
    setAcaoPendente(null)
  }

  const removerDescarte = (indiceDescarte: number) => {
    atualizarMao((rascunho) => {
      rascunho.descartes.splice(indiceDescarte, 1)
    })
    setAcaoPendente(null)
  }

  const limpar = () => {
    atualizarMao(MAO_VAZIA)
    setAcaoPendente(null)
  }

  const alternarAcao = (tipo: Acao['tipo']) =>
    setAcaoPendente(acaoPendente?.tipo === tipo ? null : criarAcao(tipo))

  const podeMeld = mao.riichi === null && !mao.bencao && slotsUsados < 14
  const podeKanFechado = !mao.bencao
  const maoAberta = mao.melds.some((meld) => meld.tipo !== 'kanFechado')

  return {
    mao,
    atualizarMao,
    acaoPendente,
    modo,
    setModo,
    configuracao,
    setConfiguracao,
    modalRegrasAberto,
    setModalRegrasAberto,
    han,
    setHan,
    fu,
    setFu,
    totalPedras,
    slotsUsados,
    maoCompleta,
    contarCodigo,
    contarAka,
    podeSelecionarPedra,
    resultadoRapido,
    patamarRapido,
    fuDisponiveis,
    resultado,
    furitenRonCompleto,
    esperasPossiveis,
    calculandoEsperas,
    adicionarPedra,
    removerPedra,
    removerMeld,
    removerDescarte,
    limpar,
    alternarAcao,
    podeMeld,
    podeKanFechado,
    maoAberta,
  }
}

export type EstadoCalculadoraMao = ReturnType<typeof useCalculadoraMao>
