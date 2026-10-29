import {
  criarAcao,
  ordenarMelds,
  ordenarPedras,
  type Acao,
  type CodigoPedra,
  type EsperaPossivel,
  type Mao,
} from '../../../logica/mao'
import { MAO_VAZIA, codigoBase, expandirGrupoMesmoValor } from '../../constantes'
import type { EscolhaChiiPendente, EstadoMaoCalculadora, TipoMeldCalculadora } from './tipos'

const MAXIMO_DESCARTES = 18

interface ParametrosAcoesPedras {
  estado: Pick<
    EstadoMaoCalculadora,
    'mao' | 'atualizarMao' | 'acaoPendente' | 'setAcaoPendente' | 'slotsUsados' | 'maoCompleta'
  >
  esperasPossiveis: EsperaPossivel[]
  podeAdicionarPedras: (pedras: CodigoPedra[]) => boolean
  podeCriarMeld: (
    pedrasMeld: CodigoPedra[],
    pedrasConsumir?: CodigoPedra[],
    slotsLogicosMeld?: number,
  ) => boolean
  indicesPedrasNaMaoPara: (pedras: CodigoPedra[]) => number[]
  sequenciasChiiPossiveis: (pedras: CodigoPedra[]) => CodigoPedra[][]
  sequenciasChiiDaMaoPossiveis: (pedras: CodigoPedra[]) => CodigoPedra[][]
  setEscolhaChiiPendente: (escolha: EscolhaChiiPendente | null) => void
}

/**
 * Centraliza as ações de edição da mão fechada, indicadores, descartes e melds.
 * Mantém a regra de limite de pedras e limpa estados derivados quando a mão muda.
 *
 * Como ler este arquivo:
 * - `adicionarPedra` é a porta de entrada de quase todo clique no teclado.
 * - `adicionarPedraDaMao` é usada quando o clique vem da área da mão em modo Chi.
 * - quando não há `acaoPendente`, o clique adiciona uma pedra à mão fechada.
 * - quando há `acaoPendente`, o mesmo clique passa a significar dora, descarte ou meld.
 * - funções de remoção sempre cancelam a ação pendente para evitar estados ambíguos.
 */
export function useAcoesPedras({
  estado,
  esperasPossiveis,
  podeAdicionarPedras,
  podeCriarMeld,
  indicesPedrasNaMaoPara,
  sequenciasChiiPossiveis,
  sequenciasChiiDaMaoPossiveis,
  setEscolhaChiiPendente,
}: ParametrosAcoesPedras) {
  const { mao, atualizarMao, acaoPendente, setAcaoPendente, slotsUsados, maoCompleta } = estado

  const invalidarBatida = (rascunho: Mao) => {
    rascunho.indiceAgari = -1
    rascunho.agariMeld = null
  }

  const voltarBatidaParaMontagem = (rascunho: Mao) => {
    if (rascunho.agariMeld) {
      const agariMeld = rascunho.agariMeld
      rascunho.melds.splice(agariMeld.indiceMeld, 1)
      rascunho.pedras.push(...agariMeld.pedrasConsumidasMao)
      ordenarPedras(rascunho.pedras)
    } else if (rascunho.indiceAgari >= 0) {
      rascunho.pedras.splice(rascunho.indiceAgari, 1)
    }
    invalidarBatida(rascunho)
  }

  const atualizarAcaoAposMeld = (tipo: TipoMeldCalculadora, slotsAposMeld: number) =>
    setAcaoPendente(slotsAposMeld < 14 ? criarAcao(tipo) : null)

  /**
   * Move da mão fechada as pedras que já estavam disponíveis e registra o meld final.
   * Para meld aberto, remove riichi porque a mão deixou de ser fechada.
   */
  const aplicarMeld = (
    tipo: TipoMeldCalculadora,
    pedrasMeldBase: CodigoPedra[],
    pedrasConsumir: CodigoPedra[],
    abrirMao: boolean,
  ) => {
    const slotsMeld = 3
    if (!podeCriarMeld(pedrasMeldBase, pedrasConsumir, slotsMeld)) return null
    const indicesRemovidos = indicesPedrasNaMaoPara(pedrasConsumir)
    if (indicesRemovidos.length !== pedrasConsumir.length) return null
    const slotsAposMeld = slotsUsados + slotsMeld - indicesRemovidos.length
    const pedrasMeld = [...pedrasMeldBase]
    const posicoesAtualizadas = new Set<number>()

    for (const indiceRemovido of indicesRemovidos) {
      const pedraReal = mao.pedras[indiceRemovido]
      const posicao = pedrasMeld.findIndex(
        (pedraMeld, indicePedraMeld) =>
          !posicoesAtualizadas.has(indicePedraMeld) &&
          codigoBase(pedraMeld) === codigoBase(pedraReal),
      )
      if (posicao >= 0) {
        pedrasMeld[posicao] = pedraReal
        posicoesAtualizadas.add(posicao)
      }
    }

    atualizarMao((rascunho: Mao) => {
      for (const indice of [...indicesRemovidos].sort((a, b) => b - a)) {
        rascunho.pedras.splice(indice, 1)
        if (rascunho.indiceAgari >= indice) rascunho.indiceAgari--
      }
      if (rascunho.indiceAgari >= rascunho.pedras.length) {
        rascunho.indiceAgari = rascunho.pedras.length - 1
      }
      const meldCriado = { tipo, pedras: pedrasMeld }
      rascunho.melds.push(meldCriado)
      ordenarMelds(rascunho.melds)
      invalidarBatida(rascunho)
      if (abrirMao) rascunho.riichi = null
    })
    return slotsAposMeld
  }

  const aplicarChii = (chamada: CodigoPedra, sequencia: CodigoPedra[]) => {
    const sequenciaComChamadaReal = sequencia.map((pedraSequencia) =>
      codigoBase(pedraSequencia) === codigoBase(chamada) ? chamada : pedraSequencia,
    )
    const pedrasConsumir = sequenciaComChamadaReal.filter(
      (pedraSequencia) => codigoBase(pedraSequencia) !== codigoBase(chamada),
    )
    const consumoChii = podeCriarMeld(sequenciaComChamadaReal, sequenciaComChamadaReal, 3)
      ? sequenciaComChamadaReal
      : podeCriarMeld(sequenciaComChamadaReal, pedrasConsumir, 3)
        ? pedrasConsumir
        : []
    const slotsAposMeld = aplicarMeld('chii', sequenciaComChamadaReal, consumoChii, true)
    if (slotsAposMeld === null) return
    atualizarAcaoAposMeld('chii', slotsAposMeld)
    setEscolhaChiiPendente(null)
  }

  /**
   * Recebe uma pedra clicada no teclado e interpreta o clique conforme a ação ativa.
   * O contrato é nunca ultrapassar limite físico de pedras nem completar além de 14 slots.
   */
  const adicionarPedra = (pedra: CodigoPedra) => {
    if (!acaoPendente) {
      /*
       * Caso base: clique normal no teclado.
       * Se a mão estava em tenpai e a espera clicada é furiten, já marcamos Ron para exibir chombo.
       */
      if (maoCompleta) return
      if (!podeAdicionarPedras([pedra])) return
      const esperaClicada =
        slotsUsados === 13
          ? esperasPossiveis.find((espera) => codigoBase(espera.pedra) === codigoBase(pedra))
          : null
      atualizarMao((rascunho) => {
        rascunho.pedras.push(pedra)
        ordenarPedras(rascunho.pedras)
        rascunho.indiceAgari = slotsUsados === 13 ? rascunho.pedras.lastIndexOf(pedra) : -1
        rascunho.agariMeld = null
        if (esperaClicada?.furiten) rascunho.agari = 'ron'
      })
      return
    }

    switch (acaoPendente.tipo) {
      case 'dora':
        if (mao.dora.length >= 10) return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.dora.push(pedra)
        })
        if (mao.dora.length + 1 >= 10) setAcaoPendente(null)
        return
      case 'uradora':
        if (!mao.riichi) return
        if (mao.uradora.length >= 5) return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          rascunho.uradora.push(pedra)
        })
        if (mao.uradora.length + 1 >= 5) setAcaoPendente(null)
        return
      case 'descarte':
        if (mao.descartes.length >= MAXIMO_DESCARTES) return
        if (!podeAdicionarPedras([pedra])) return
        atualizarMao((rascunho) => {
          if (rascunho.descartes.length >= MAXIMO_DESCARTES) return
          rascunho.descartes.push(pedra)
          ordenarPedras(rascunho.descartes)
        })
        return
      case 'pon': {
        const pedrasMeld = expandirGrupoMesmoValor(pedra, 3)
        const consumoTrinca = expandirGrupoMesmoValor(pedra, 3)
        const consumoPar = expandirGrupoMesmoValor(pedra, 2)
        const pedrasConsumir = podeCriarMeld(pedrasMeld, consumoTrinca, 3)
          ? consumoTrinca
          : podeCriarMeld(pedrasMeld, consumoPar, 3)
            ? consumoPar
            : []
        const slotsAposMeld = aplicarMeld('pon', pedrasMeld, pedrasConsumir, true)
        if (slotsAposMeld === null) return
        atualizarAcaoAposMeld('pon', slotsAposMeld)
        return
      }
      case 'kanAberto': {
        const pedrasMeld = expandirGrupoMesmoValor(pedra, 4)
        const consumoQuadra = expandirGrupoMesmoValor(pedra, 4)
        const consumoTrinca = expandirGrupoMesmoValor(pedra, 3)
        const pedrasConsumir = podeCriarMeld(pedrasMeld, consumoQuadra, 3)
          ? consumoQuadra
          : podeCriarMeld(pedrasMeld, consumoTrinca, 3)
            ? consumoTrinca
            : []
        const slotsAposMeld = aplicarMeld('kanAberto', pedrasMeld, pedrasConsumir, true)
        if (slotsAposMeld === null) return
        atualizarAcaoAposMeld('kanAberto', slotsAposMeld)
        return
      }
      case 'kanFechado': {
        const pedrasConsumir = mao.pedras
          .filter((pedraMao) => codigoBase(pedraMao) === codigoBase(pedra))
          .slice(0, 4)
        if (pedrasConsumir.length > 0 && pedrasConsumir.length < 3) {
          return
        }
        if (pedrasConsumir.some((pedraMao) => codigoBase(pedraMao) !== codigoBase(pedra))) return
        const pedrasMeld =
          pedrasConsumir.length >= 3
            ? ([
                ...pedrasConsumir,
                ...Array(4 - pedrasConsumir.length).fill(codigoBase(pedra)),
              ] as CodigoPedra[])
            : expandirGrupoMesmoValor(pedra, 4)
        if (pedrasMeld.length !== 4) return
        if (!podeCriarMeld(pedrasMeld, pedrasConsumir, 3)) return
        const slotsAposMeld = aplicarMeld('kanFechado', pedrasMeld, pedrasConsumir, false)
        if (slotsAposMeld === null) return
        atualizarAcaoAposMeld('kanFechado', slotsAposMeld)
        return
      }
      case 'chii': {
        /*
         * Em Chii pelo teclado, mostra todas as sequências possíveis incluindo chi direto.
         */
        if (!podeAdicionarPedras([pedra])) return
        const sequenciasPossiveis = sequenciasChiiPossiveis([pedra])
        if (sequenciasPossiveis.length === 1) {
          aplicarChii(pedra, sequenciasPossiveis[0])
          return
        }
        if (sequenciasPossiveis.length > 1) {
          setEscolhaChiiPendente({ chamada: pedra, opcoes: sequenciasPossiveis })
        }
        return
      }
    }
  }

  /**
   * Variante de adicionarPedra para cliques na área da mão em modo Chi.
   * Usa apenas sequências possíveis com as pedras reais existentes na mão,
   * sem aceitar chi direto genérico.
   */
  const adicionarPedraDaMao = (pedra: CodigoPedra) => {
    if (acaoPendente?.tipo !== 'chii') {
      adicionarPedra(pedra)
      return
    }
    const sequenciasPossiveis = sequenciasChiiDaMaoPossiveis([pedra])
    if (sequenciasPossiveis.length === 0) return
    if (sequenciasPossiveis.length === 1) {
      aplicarChii(pedra, sequenciasPossiveis[0])
      return
    }
    setEscolhaChiiPendente({ chamada: pedra, opcoes: sequenciasPossiveis })
  }

  const escolherChiiPendente = (chamada: CodigoPedra, sequencia: CodigoPedra[]) => {
    if (acaoPendente?.tipo !== 'chii') return
    const sequenciaComChamadaReal = sequencia.map((pedraSequencia) =>
      codigoBase(pedraSequencia) === codigoBase(chamada) ? chamada : pedraSequencia,
    )
    const pedrasConsumir = sequenciaComChamadaReal.filter(
      (pedraSequencia) => codigoBase(pedraSequencia) !== codigoBase(chamada),
    )
    const consumoChii = podeCriarMeld(sequenciaComChamadaReal, sequenciaComChamadaReal, 3)
      ? sequenciaComChamadaReal
      : podeCriarMeld(sequenciaComChamadaReal, pedrasConsumir, 3)
        ? pedrasConsumir
        : []

    const slotsMeld = 3
    if (!podeCriarMeld(sequenciaComChamadaReal, consumoChii, slotsMeld)) return
    const indicesRemovidos = indicesPedrasNaMaoPara(consumoChii)
    if (indicesRemovidos.length !== consumoChii.length) return
    const slotsAposMeld = slotsUsados + slotsMeld - indicesRemovidos.length
    const pedrasMeld = [...sequenciaComChamadaReal]
    const posicoesAtualizadas = new Set<number>()

    for (const indiceRemovido of indicesRemovidos) {
      const pedraReal = mao.pedras[indiceRemovido]
      const posicao = pedrasMeld.findIndex(
        (pedraMeld, indicePedraMeld) =>
          !posicoesAtualizadas.has(indicePedraMeld) &&
          codigoBase(pedraMeld) === codigoBase(pedraReal),
      )
      if (posicao >= 0) {
        pedrasMeld[posicao] = pedraReal
        posicoesAtualizadas.add(posicao)
      }
    }

    atualizarMao((rascunho: Mao) => {
      for (const indice of [...indicesRemovidos].sort((a, b) => b - a)) {
        rascunho.pedras.splice(indice, 1)
        if (rascunho.indiceAgari >= indice) rascunho.indiceAgari--
      }
      if (rascunho.indiceAgari >= rascunho.pedras.length) {
        rascunho.indiceAgari = rascunho.pedras.length - 1
      }
      rascunho.melds.push({ tipo: 'chii', pedras: pedrasMeld })
      ordenarMelds(rascunho.melds)
      invalidarBatida(rascunho)
      rascunho.riichi = null
    })
    setAcaoPendente(slotsAposMeld < 14 ? criarAcao('chii') : null)
    setEscolhaChiiPendente(null)
  }

  /** Remove uma pedra da mão fechada e ajusta o índice da pedra de agari quando necessário. */
  const removerPedra = (indicePedra: number) => {
    atualizarMao((rascunho) => {
      rascunho.pedras.splice(indicePedra, 1)
      rascunho.indiceAgari = -1
      rascunho.agariMeld = null
    })
    setEscolhaChiiPendente(null)
    setAcaoPendente(null)
  }

  /** Remove um meld pronto sem devolver pedras para a mão fechada. */
  const removerMeld = (indiceMeld: number) => {
    atualizarMao((rascunho) => {
      rascunho.melds.splice(indiceMeld, 1)
      rascunho.indiceAgari = -1
      rascunho.agariMeld = null
    })
    setEscolhaChiiPendente(null)
    setAcaoPendente(null)
  }

  /** Remove um descarte próprio usado apenas para análise de furiten. */
  const removerDescarte = (indiceDescarte: number) => {
    atualizarMao((rascunho) => {
      rascunho.descartes.splice(indiceDescarte, 1)
    })
    setEscolhaChiiPendente(null)
    setAcaoPendente(null)
  }

  /** Restaura a mão vazia padrão e cancela qualquer modo de clique em andamento. */
  const limpar = () => {
    atualizarMao(MAO_VAZIA)
    setEscolhaChiiPendente(null)
    setAcaoPendente(null)
  }

  /** Liga/desliga o significado especial do próximo clique no teclado. */
  const alternarAcao = (tipo: Acao['tipo']) => {
    const desligandoAcaoAtual = acaoPendente?.tipo === tipo
    const acaoEstrutural =
      tipo === 'chii' || tipo === 'pon' || tipo === 'kanAberto' || tipo === 'kanFechado'

    if (!desligandoAcaoAtual && acaoEstrutural && (mao.indiceAgari >= 0 || mao.agariMeld)) {
      atualizarMao((rascunho) => {
        voltarBatidaParaMontagem(rascunho)
      })
    }

    setEscolhaChiiPendente(null)
    setAcaoPendente(desligandoAcaoAtual ? null : criarAcao(tipo))
  }

  return {
    adicionarPedra,
    adicionarPedraDaMao,
    escolherChiiPendente,
    removerPedra,
    removerMeld,
    removerDescarte,
    limpar,
    alternarAcao,
  }
}
