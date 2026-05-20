import { useState } from 'react'
import { useImmer } from 'use-immer'
import {
  calcularMao,
  calcularHanFu,
  montarPontosRapidos,
  fuValidos,
  ordenarPedras,
  ordenarMelds,
  criarAcao,
  contarPedrasTotais,
  contarSlotsLogicos,
  configuracaoPadrao,
  type Mao,
  type CodigoPedra,
  type Acao,
  type ConfiguracaoCalculo,
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
    ...mao.dora,
    ...mao.uradora,
    ...(acaoPendente?.tipo === 'chii' ? acaoPendente.pedras : []),
  ]
  const contarCodigo = (codigo: CodigoPedra) =>
    todasPedras.filter((pedraVisivel) => codigoBase(pedraVisivel) === codigoBase(codigo)).length
  const contarAka = (codigo: CodigoPedra) =>
    todasPedras.filter((pedraVisivel) => pedraVisivel === codigo).length
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
        if (pedra[0] === '0') return false
        return podeAdicionarPedras([pedra])
      case 'pon':
        return podeAdicionarPedras(expandirGrupoMesmoValor(pedra, 3))
      case 'kanAberto':
      case 'kanFechado':
        return podeAdicionarPedras(expandirGrupoMesmoValor(pedra, 4))
      case 'chii':
        return podeAdicionarAoChii(acaoPendente.pedras, pedra) && podeAdicionarPedras([pedra])
    }
  }

  // Calculadora rápida
  const tabelaRapida = calcularHanFu(han, fu, configuracao)
  const resultadoRapido = montarPontosRapidos(mao.ventoAssento === '1', mao.agari, tabelaRapida)
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

  // ── Handlers ────────────────────────────────────────────────────────────────

  const adicionarPedra = (pedra: CodigoPedra) => {
    if (!acaoPendente) {
      // Bloqueia se a mão já está completa (14 slots)
      if (maoCompleta) return
      if (!podeAdicionarPedras([pedra])) return
      atualizarMao((rascunho) => {
        rascunho.pedras.push(pedra)
        ordenarPedras(rascunho.pedras)
        rascunho.indiceAgari = rascunho.pedras.lastIndexOf(pedra)
      })
      return
    }

    switch (acaoPendente.tipo) {
      case 'dora':
        if (pedra[0] === '0') return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.dora.push(pedra)
        })
        setAcaoPendente(null)
        return
      case 'uradora':
        if (pedra[0] === '0') return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.uradora.push(pedra)
        })
        setAcaoPendente(null)
        return
      case 'pon': {
        const pedras = expandirGrupoMesmoValor(pedra, 3)
        if (!podeAdicionarPedras(pedras)) return
        atualizarMao((rascunho) => {
          rascunho.melds.push({ tipo: 'pon', pedras })
          ordenarMelds(rascunho.melds)
          rascunho.riichi = null
        })
        setAcaoPendente(null)
        return
      }
      case 'kanAberto': {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!podeAdicionarPedras(pedras)) return
        atualizarMao((rascunho) => {
          rascunho.melds.push({ tipo: 'kanAberto', pedras })
          ordenarMelds(rascunho.melds)
          rascunho.riichi = null
        })
        setAcaoPendente(null)
        return
      }
      case 'kanFechado': {
        const pedras = expandirGrupoMesmoValor(pedra, 4)
        if (!podeAdicionarPedras(pedras)) return
        atualizarMao((rascunho) => {
          rascunho.melds.push({ tipo: 'kanFechado', pedras })
          ordenarMelds(rascunho.melds)
        })
        setAcaoPendente(null)
        return
      }
      case 'chii': {
        if (!podeAdicionarAoChii(acaoPendente.pedras, pedra)) return
        if (!podeAdicionarPedras([pedra])) return
        const novasPedras = [...acaoPendente.pedras, pedra]
        if (novasPedras.length < 3) {
          setAcaoPendente({ tipo: 'chii', pedras: novasPedras })
        } else {
          const pedrasChii = ordenarPedras([...novasPedras])
          atualizarMao((rascunho) => {
            rascunho.melds.push({ tipo: 'chii', pedras: [...pedrasChii] })
            ordenarMelds(rascunho.melds)
            rascunho.riichi = null
          })
          setAcaoPendente(null)
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

  const limpar = () => {
    atualizarMao(MAO_VAZIA)
    setAcaoPendente(null)
  }

  const alternarAcao = (tipo: Acao['tipo']) =>
    setAcaoPendente(acaoPendente?.tipo === tipo ? null : criarAcao(tipo))

  const slotsLivres = 14 - slotsUsados
  // Para adicionar um meld, precisamos de slots suficientes:
  // chii/pon = 3 slots, kan = 3 slots (kans contam como 3 na estrutura lógica)
  const podeMeld = mao.riichi === null && !mao.bencao && slotsLivres >= 3
  const podeKanFechado = mao.riichi === null && !mao.bencao && slotsLivres >= 3
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
    fuDisponiveis,
    resultado,
    adicionarPedra,
    removerPedra,
    removerMeld,
    limpar,
    alternarAcao,
    podeMeld,
    podeKanFechado,
    maoAberta,
  }
}

export type EstadoCalculadoraMao = ReturnType<typeof useCalculadoraMao>
